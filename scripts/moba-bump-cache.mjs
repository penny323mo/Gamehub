// 換 深淵之橋 嘅 cache-bust token。
//
// 點解要有呢個腳本：token 而家唔止喺六個入口，而係喺 src 入面每一個本地
// module import 度。原因喺 tests/cache-bust.mjs 寫咗——瀏覽器逐條 URL 快取，
// 入口換咗版本唔會令佢 import 落去嗰啲模組跟住更新。三十幾個位手改一定漏，
// 漏一個就係「新碼配舊碼」嘅混血版本，而且喺自己部機永遠試唔到。
//
// 跑法：node scripts/moba-bump-cache.mjs <新 token>
// 之後行 node games/moba/tests/cache-bust.mjs 確認。

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MOBA = path.join(REPO, 'games', 'moba');

const token = process.argv[2];
if (!token || !/^[a-z0-9][a-z0-9-]*$/.test(token)) {
    console.error('用法：node scripts/moba-bump-cache.mjs <新 token>（細楷、數字、連字號）');
    process.exit(1);
}

// 入口：呢四個檔各自用唔同寫法引用資源，所以逐個 pattern 寫清楚，
// 唔用一個「見到 ?v= 就換」嘅大網——嗰種寫法會順手改埋唔關事嘅嘢。
const entries = [
    [path.join(MOBA, 'index.html'), [/(style\.css\?v=)[a-z0-9-]+/g, /(src\/main\.js\?v=)[a-z0-9-]+/g]],
    // Launcher metadata moved to the canonical manifest.  Regenerate the
    // browser artifact after replacing its image/MOBA URLs.
    [path.join(REPO, 'games', 'manifest.json'), [/(_logo\.png\?v=)[a-z0-9-]+/g]],
    [path.join(REPO, 'games', 'manifest.json'), [/(games\/moba\/index\.html\?v=)[a-z0-9-]+/g]],
];

let files = 0, spots = 0;
for (const [file, patterns] of entries) {
    let text = fs.readFileSync(file, 'utf8');
    const before = text;
    for (const re of patterns) text = text.replace(re, (m, head) => { spots++; return head + token; });
    if (text !== before) { fs.writeFileSync(file, text); files++; }
}

// src：每一個同層本地 import
const srcDir = path.join(MOBA, 'src');
for (const name of fs.readdirSync(srcDir)) {
    if (!name.endsWith('.js')) continue;
    const file = path.join(srcDir, name);
    const before = fs.readFileSync(file, 'utf8');
    // 同層 `./x.js` **同埋** 共用層 `../../shared/js/x.mjs`。
    // 後者一開始漏咗：`byte-progress.mjs` 加咗之後 `tests/cache-bust.mjs` 報紅,
    // 當時手動補咗一個 `?v=` 落去就算——**但呢個腳本存在嘅理由就係「三十幾個
    // 位手改一定漏」，手動補一次即係下次一樣會漏。捉到漏網要改嘅係網。**
    const after = before.replace(
        /(from\s+'(?:\.\/|\.\.\/\.\.\/shared\/js\/)[A-Za-z0-9_-]+\.m?js)(\?v=[a-z0-9-]+)?'/g,
        (m, head) => { spots++; return `${head}?v=${token}'`; });
    if (after !== before) { fs.writeFileSync(file, after); files++; }
}

// Keep the checked-in classic-script adapter in exact manifest parity.
const generated = spawnSync(process.execPath, ['scripts/build-game-catalog.mjs'], {
    cwd: REPO,
    stdio: 'inherit',
});
if (generated.status !== 0) {
    console.error('GameCatalog browser artifact 重新生成失敗');
    process.exit(generated.status ?? 1);
}

console.log(`token → ${token}：改咗 ${files} 個檔、${spots} 個位`);
console.log('跟住行：node games/moba/tests/cache-bust.mjs');
