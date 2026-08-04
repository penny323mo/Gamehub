// 商店層曾經修好但實機仍載入舊 hud.js/style.css，結果繼續見到細粒 × 同
// 泉水限定規則。呢個 fast gate 鎖住部署入口：改動過嘅 UI／規則資源必須共用
// 同一個非空版本 token，否則 GitHub Pages / Safari 可以沿用舊 asset cache。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(ROOT, '../..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const main = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8');
const launcher = fs.readFileSync(path.join(REPO_ROOT, 'launcher.js'), 'utf8');
const hub = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');

const capture = (source, pattern) => source.match(pattern)?.[1] ?? null;
const versions = {
    style: capture(html, /style\.css\?v=([a-z0-9-]+)/i),
    main: capture(html, /src\/main\.js\?v=([a-z0-9-]+)/i),
    hud: capture(main, /\.\/hud\.js\?v=([a-z0-9-]+)/i),
    sim: capture(main, /\.\/sim\.js\?v=([a-z0-9-]+)/i),
    hubEntry: capture(hub, /launcher\.js\?v=([a-z0-9-]+)/i),
    // Hub 嘅樣式表之前完全冇標記，所以純 CSS 改動係傳唔到去返轉頭嘅訪客
    hubStyle: capture(hub, /style\.css\?v=([a-z0-9-]+)/i),
    mobaLink: capture(launcher, /games\/moba\/index\.html\?v=([a-z0-9-]+)/i),
};

const unique = new Set(Object.values(versions));
let bad = Object.values(versions).some(value => !value) || unique.size !== 1;
if (bad) {
    console.error('FAIL  MOBA 部署入口缺少一致 cache-bust token', versions);
} else {
    console.log('PASS  MOBA 部署入口共用 cache-bust token', versions);
}

// 入口有 token 唔代表安全。瀏覽器係逐條 URL 去快取嘅，所以 main.js 換咗版本
// 之後，佢 import 落去嗰啲冇 query 嘅模組仍然可以用返舊嘅——實測 ADR-108
// 改咗 champions.js 同 constants.js 嘅平衡數值，但兩個都唔喺任何 token 之下，
// 即係有機會出現「新 sim.js 配舊 constants.js」呢種混血版本。
//
// 所以規則係全圖：src 入面每一個本地模組 import 都要帶住同一個 token。
// 少咗一個係載入舊碼，唔同又會令同一個模組載兩次（兩份 module 狀態）。
const token = versions.main;
const srcDir = path.join(ROOT, 'src');
const offenders = [];
for (const name of fs.readdirSync(srcDir)) {
    if (!name.endsWith('.js')) continue;
    const text = fs.readFileSync(path.join(srcDir, name), 'utf8');
    for (const m of text.matchAll(/from\s+'(\.\/[A-Za-z0-9_-]+\.js)(\?v=([a-z0-9-]+))?'/g)) {
        if (m[3] !== token) offenders.push(`${name}: ${m[1]}${m[2] ?? ''}`);
    }
}
if (offenders.length) {
    bad = true;
    console.error(`FAIL  src 入面有 ${offenders.length} 個本地 import 冇帶住 ${token}`, offenders.slice(0, 8));
} else {
    console.log(`PASS  src 每一個本地 import 都帶住 ${token}`);
}

if (bad) process.exitCode = 1;
