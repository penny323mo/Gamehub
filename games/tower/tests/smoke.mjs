// 塔防嘅第一把尺。
//
// 呢隻遊戲七千行 TypeScript、零測試（原本得一個三行嘅 `test3.js` 印 three.js
// 嘅屬性）。同 ER2 一樣：冇尺就冇嘢講得準——所以第一條問題唔係「靚唔靚」，
// 係**佢載得入、跑得郁、冇 error**。
//
// 跑法：node games/tower/tests/smoke.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
if (!fs.existsSync(path.join(HERE, '..', 'dist', 'index.html'))) {
    console.log('搵唔到 dist：喺 games/tower 行 npm ci && npm run build 先'); process.exit(1);
}
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp',
  '.svg':'image/svg+xml', '.glb':'model/gltf-binary', '.woff2':'font/woff2', '.m4a':'audio/mp4', '.mp3':'audio/mpeg' };
let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : detail); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise(r => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message.split('\n')[0].slice(0, 140)));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 140)); });
const 壞資源 = [];
// 跨域請求：一隻靜態 Pages 遊戲唔應該喺 render 途中飛去第三方攞嘢。
const 跨域 = new Set();
page.on('request', r => { try { const h = new URL(r.url()).host;
  if (h && h !== `localhost:${port}` && !r.url().startsWith('data:')) 跨域.add(h); } catch {} });
page.on('requestfailed', r => 壞資源.push(`${r.failure()?.errorText ?? '?'} ${r.url().slice(-90)}`));
page.on('response', r => { if (r.status() >= 400) 壞資源.push(`${r.status()} ${r.url().slice(-90)}`); });
await page.goto(`http://localhost:${port}/games/tower/dist/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(6000);

check('載得入，零 browser error', errors.length === 0, errors.slice(0, 3));
// 一個 404 就係一個出街之後真係揾唔到嘅檔。要知係邊個。
check('冇一個資源載唔到（404／連線斷）', 壞資源.length === 0, 壞資源.slice(0, 6));
// 本來 stylesheet 第一行係 `@import url('https://fonts.googleapis.com/...')`
// ——CSS `@import` 要等呢張 stylesheet parse 完先發現，然後**串行**再去第三方
// 攞一次，而且**擋住 render**。個 host 封咗就成版等（實測 CONNECTION_RESET）。
check('唔會喺 render 途中飛去第三方攞嘢（自己一個檔行得晒）',
  跨域.size === 0, [...跨域]);
const 畫布 = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { w: Math.round(r.width), h: Math.round(r.height), backing: [c.width, c.height] };
});
check('有畫布，而且鋪得滿個視窗', 畫布 != null && 畫布.w > 900 && 畫布.h > 500, 畫布);

// 唔係一浸平色——同 ER2 嗰條一樣：鏡頭插咗入嘢／燈掛咗，出嚟就係一幅純色。
const 相 = await page.screenshot();
const 統計 = await page.evaluate(async (b64) => {
  const img = new Image();
  await new Promise((res) => { img.onload = res; img.src = 'data:image/png;base64,' + b64; });
  const cv = document.createElement('canvas'); cv.width = 160; cv.height = 100;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0, 160, 100);
  const d = g.getImageData(0, 0, 160, 100).data;
  const 色 = new Set(); let s = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) {
    const v = (d[i] + d[i+1] + d[i+2]) / 3; s += v; n++;
    色.add(`${d[i]>>4},${d[i+1]>>4},${d[i+2]>>4}`);
  }
  const 平均 = s / n; let sq = 0;
  for (let i = 0; i < d.length; i += 4) { const v = (d[i]+d[i+1]+d[i+2])/3; sq += (v-平均)**2; }
  return { 亮度: +平均.toFixed(1), 標準差: +Math.sqrt(sq/n).toFixed(2), 色數: 色.size };
}, 相.toString('base64'));
check('開波第一幅畫唔係一浸平色（燈掛咗／鏡頭插咗入嘢就係咁）',
  統計.標準差 > 6 && 統計.色數 > 12, 統計);

console.log(`\ntower 冒煙: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗:', failed.join('、'));
await browser.close();
await new Promise(r => server.close(r));
if (fail) process.exit(1);
