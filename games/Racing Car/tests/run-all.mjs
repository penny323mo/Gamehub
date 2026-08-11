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
const SETTLE_MS = Math.max(0, Number(process.env.RACER_TEST_SETTLE_MS) || 500);

const settle = () => new Promise(resolve => setTimeout(resolve, SETTLE_MS));

const run = (file) => new Promise(resolve => {
    console.log(`\n===== ${file} =====`);
    const child = spawn(process.execPath, [path.join(HERE, file)], {
        stdio: 'inherit',
        env: process.env,
        // Playwright may leave a Chromium descendant alive if the suite is
        // terminated during launch. Give this test its own POSIX process
        // group so timeout cleanup cannot leak that browser into the next suite.
        detached: process.platform !== 'win32',
    });
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
        resolve({ file, code: 1, timedOut: false });
    });
    child.on('close', code => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve({ file, code: timedOut ? 124 : code, timedOut });
    });
});

const results = [];
for (const file of TESTS) {
    results.push(await run(file));
    await settle();
}

console.log('\n===== 總結 =====');
for (const r of results) console.log(`${r.code === 0 ? 'PASS' : r.timedOut ? 'TIMEOUT' : 'FAIL'}  ${r.file}`);
process.exit(results.some(r => r.code !== 0) ? 1 : 0);
