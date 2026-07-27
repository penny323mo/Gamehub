// 順序跑晒 Racing Car 3D 嘅回歸測試；任何一個失敗都會令 exit code 非零。
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TESTS = ['race.mjs', 'setup.mjs', 'rivals.mjs'];

const run = (file) => new Promise(resolve => {
    console.log(`\n===== ${file} =====`);
    const child = spawn(process.execPath, [path.join(HERE, file)], { stdio: 'inherit' });
    child.on('close', code => resolve({ file, code }));
});

const results = [];
for (const file of TESTS) results.push(await run(file));

console.log('\n===== 總結 =====');
for (const r of results) console.log(`${r.code === 0 ? 'PASS' : 'FAIL'}  ${r.file}`);
process.exit(results.some(r => r.code !== 0) ? 1 : 0);
