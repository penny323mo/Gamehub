// 順序跑晒所有 Royale 回歸測試，任何一個失敗都會令 exit code 非零。
// 一個一個跑（唔並行）：每個測試都會開一版 Chromium + swiftshader，
// 並行只會互相搶 CPU，令模擬步進慢到 timeout。

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TESTS = ['leak.mjs', 'gauntlet.mjs', 'combat.mjs', 'pvp-guest.mjs', 'match.mjs'];

const run = (file) => new Promise(resolve => {
    console.log(`\n===== ${file} =====`);
    const child = spawn(process.execPath, [path.join(HERE, file)], { stdio: 'inherit' });
    child.on('close', code => resolve({ file, code }));
});

const results = [];
for (const file of TESTS) results.push(await run(file));

console.log('\n===== 總結 =====');
for (const r of results) console.log(`${r.code === 0 ? 'PASS' : 'FAIL'}  ${r.file}`);
const failed = results.filter(r => r.code !== 0);
process.exit(failed.length ? 1 : 0);
