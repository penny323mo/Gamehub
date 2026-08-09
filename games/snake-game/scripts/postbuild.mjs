// Rewrites the Vite-emitted module script tag into a plain deferred script so
// dist/index.html works under file:// and GitHub Pages without ES-module CORS
// issues, and strips the now-unnecessary crossorigin attributes.
// Idempotent: safe to run multiple times. Fails loudly if the tag can't be found.
//
// **要指名道姓搵 `type="module"` 嗰個 tag，唔可以攞「第一個 script」。**
// 本來呢度寫住 `.replace(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*><\/script>/, …)`
// ——即係「第一個有 src 嘅 script」。加咗 `safe-storage.js` 落 <head> 之後，
// 「第一個」就變咗佢：真正嗰個 module tag 冇轉過，而下面條 assert 竟然照過
// （因為佢淨係問「有冇一個 defer script」，而我啱啱整咗一個出嚟）。
// 一條問「有冇」而唔問「係咪嗰個」嘅守衛，喺呢種時候會幫倒忙。
import fs from 'node:fs';

const path = 'dist/index.html';
let html = fs.readFileSync(path, 'utf8');

const 模組 = /<script\b(?=[^>]*\btype="module")[^>]*\bsrc="([^"]+\.js)"[^>]*><\/script>/;
if (模組.test(html)) {
    html = html.replace(模組, '<script defer src="$1"></script>');
} else if (!/<script defer src="\.\/assets\/[^"]+\.js">/.test(html)) {
    throw new Error('postbuild: 搵唔到 <script type="module" src="./assets/…js"> — build 輸出變咗？');
}

// 源 index 喺 games/snake-game/，但 build 出嚟嗰版深一層（dist/）。
// 共用層嘅 script 要跟住上移一層，dev 同 dist 兩邊先至都指得中。
// 呢度用一條通用規則，唔逐個檔名寫死——xiangqi 嗰邊本來寫死一個名，
// 加第二個共用檔嗰陣就靜靜雞 404，而 dev 度係好嘅所以自己部機試唔到。
html = html.replace(/src="\.\.\/shared\/js\//g, 'src="../../shared/js/');

html = html.replace(/ crossorigin(="[^"]*")?/g, '');

if (!/<script defer src="\.\/assets\/[^"]+\.js">/.test(html)) {
    throw new Error('postbuild: dist/index.html 冇 <script defer src="./assets/…js"> — build 輸出變咗？');
}
if (/<script[^>]*src="\.\.\/shared\/js\//.test(html)) {
    throw new Error('postbuild: 仲有共用層 script 冇上移一層，dist 度會 404');
}

fs.writeFileSync(path, html);
console.log('postbuild: script tag rewritten OK');
