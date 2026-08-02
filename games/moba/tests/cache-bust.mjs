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
    mobaLink: capture(launcher, /games\/moba\/index\.html\?v=([a-z0-9-]+)/i),
};

const unique = new Set(Object.values(versions));
if (Object.values(versions).some(value => !value) || unique.size !== 1) {
    console.error('FAIL  MOBA 商店部署資源缺少一致 cache-bust token', versions);
    process.exitCode = 1;
} else {
    console.log('PASS  MOBA 商店部署資源共用 cache-bust token', versions);
}
