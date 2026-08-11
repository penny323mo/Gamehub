// 順序跑晒 Racing Car 3D 嘅回歸測試；任何一個失敗都會令 exit code 非零。
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TESTS = ['race.mjs', 'setup.mjs', 'rivals.mjs', 'ghost.mjs', 'season.mjs', 'audio.mjs'];
// 每個 suite 自己有 Playwright ready timeout，但如果 browser launch 本身卡住，
// 舊 runner 會永遠等住 child，CI 只剩一個冇訊息嘅 hang。外層再加一個
// 明確上限，並保留環境變數畀慢機／真機 runner 調高。
const TEST_TIMEOUT_MS = Math.max(30_000, Number(process.env.RACER_TEST_TIMEOUT_MS) || 120_000);
// Race suite 會長時間佔住 SwiftShader；留足 teardown window 先開下一個
// Chromium，否則單獨跑 setup 會綠、aggregate 卻可能喺 ready gate timeout。
// 慢機仍可用 RACER_TEST_SETTLE_MS 明確覆蓋。
const SETTLE_MS = Math.max(0, Number(process.env.RACER_TEST_SETTLE_MS) || 5000);

const settle = () => new Promise(resolve => setTimeout(resolve, SETTLE_MS));

const run = (file) => new Promise(resolve => {
    console.log(`\n===== ${file} =====`);
    const child = spawn(process.execPath, [path.join(HERE, file)], {
        // Keep forwarding the child output live, but retain enough stderr/stdout
        // to distinguish a Chromium readiness timeout from a real assertion fail.
        stdio: ['inherit', 'pipe', 'pipe'],
        env: process.env,
        // Playwright may leave a Chromium descendant alive if the suite is
        // terminated during launch. Give this test its own POSIX process
        // group so timeout cleanup cannot leak that browser into the next suite.
        detached: process.platform !== 'win32',
    });
    let output = '';
    const forward = chunk => {
        const text = chunk.toString();
        output += text;
        process.stdout.write(text);
    };
    child.stdout?.on('data', forward);
    child.stderr?.on('data', forward);
    let timedOut = false;
    let settled = false;
    const killTree = signal => {
        if (child.exitCode != null) return;
        if (process.platform !== 'win32') {
            try { process.kill(-child.pid, signal); } catch { /* child already exited */ }
        }
        try { child.kill(signal); } catch { /* child already exited */ }
    };
    const timer = setTimeout(() => {
        timedOut = true;
        console.error(`\nTIMEOUT  ${file}（${TEST_TIMEOUT_MS}ms；可用 RACER_TEST_TIMEOUT_MS 調整）`);
        killTree('SIGTERM');
        // Chrome 子程序未必會隨 Node 即時收走；只對呢個 test child 做窄範圍
        // force kill，唔會碰到使用者本身嘅 browser。
        setTimeout(() => killTree('SIGKILL'), 5000).unref();
    }, TEST_TIMEOUT_MS);
    child.on('error', (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        console.error(`\nERROR  ${file}: ${error.message}`);
        resolve({ file, code: 1, timedOut: false, readinessTimeout: /page\.waitForFunction: Timeout \d+ms exceeded/.test(output) });
    });
    child.on('close', code => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({
            file,
            code: timedOut ? 124 : code,
            timedOut,
            readinessTimeout: /page\.waitForFunction: Timeout \d+ms exceeded/.test(output),
        });
    });
});

const results = [];
for (const file of TESTS) {
    let result = await run(file);
    if (result.readinessTimeout && !result.timedOut) {
        // A SwiftShader allocator can miss the first ready event even after the
        // previous child exited. Retry only this known startup failure; assertion
        // failures stay hard failures and are never silently retried.
        console.warn(`\nRETRY  ${file}（Chromium readiness timeout；只重試啟動 gate）`);
        await settle();
        result = await run(file);
        result.retried = true;
    }
    results.push(result);
    await settle();
}

console.log('\n===== 總結 =====');
for (const r of results) {
    const status = r.code === 0 ? 'PASS' : r.timedOut ? 'TIMEOUT' : 'FAIL';
    console.log(`${status}  ${r.file}${r.retried ? ' (readiness retry)' : ''}`);
}
process.exit(results.some(r => r.code !== 0) ? 1 : 0);
