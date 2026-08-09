// Loading contract on mobile data.
// Run: node games/tower/tests/load.mjs
//
// 呢把尺問嘅唔係「載得幾快」——載幾快睇你條線，唔係我改得到。佢問嘅係
// **等緊嗰陣，個畫面有冇同你交代**。
//
// 實測（390×844 手機，`Network.emulateNetworkConditions` 節流）：
//
//   | 網速     | START 出現 | 真係打得 | 撳完等咗 |
//   | 冇限速   | 1.1s      | 4.7s    | 3.5s   |
//   | Fast 3G  | 0.4s      | 11.8s   | 7.1s   |
//   | Slow 3G  | 0.7s      | 40.6s   | 23.7s  |
//
// 個掣喺第 0.4 秒就擺喺你面前，但要到第 11.8 秒先至撳得郁。改之前，
// 撳落去之後**個畫面一個 pixel 都冇變**：仲係寫住「▶ START」、仲係 enabled、
// 仲係 `cursor: pointer`。玩家收到嘅訊息係「撳咗冇反應」，跟住必然會再撳一次
// ——而再撳一次會再行多次 `enterRun`（再開一次波、再開一次音樂、再覆蓋 state）。
//
// 所以呢度守兩樣，兩樣都係「唔關網速事」嘅嘢：
//   1. 撳完之後畫面即刻要變（掣停用 ＋ 進度條出現 ＋ 數字有郁）。
//   2. 撳兩下唔可以開兩次波。
//
// 節流係用 CDP 落，唔係靠 `sleep` 扮慢——**扮慢嘅測試證明唔到真慢嗰陣點**。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.glb':'model/gltf-binary', '.png':'image/png', '.svg':'image/svg+xml', '.m4a':'audio/mp4' };

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]); const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream',
    'content-length': String(fs.statSync(f).size) });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

// Chrome DevTools 嘅 Fast 3G。揀佢唔係因為 3G 常見，而係因為佢慢到
// 足夠令「撳完到打得」嗰段變成一段睇得見嘅時間——量細嘅嘢要放大先量到。
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 140)));
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', {
  offline: false, latency: 300, downloadThroughput: 1.6e6 / 8, uploadThroughput: 4e5 / 8,
});
let bytes = 0;
cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });

await page.goto(`http://localhost:${port}/games/tower/dist/index.html`, { waitUntil: 'commit' });
await page.waitForSelector('#start-btn', { state: 'visible', timeout: 180000 });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 180000 });

const 睇 = () => page.evaluate(() => {
  const b = document.getElementById('start-btn');
  const s = document.getElementById('load-status');
  return {
    掣停用: b.disabled,
    進度見得到: !s.classList.contains('hidden'),
    進度字: document.getElementById('load-text').textContent.trim(),
    闊: document.getElementById('load-fill').style.width,
  };
});

// 要喺資產未落齊嗰陣撳落去，先至量到「等緊」嗰段。落齊咗就冇嘢好量
// ——**量唔到嘅時候要報紅，唔係報綠**。
const 未齊 = await page.evaluate(() => {
  const T = window.__TD; let g = 0;
  T.scene.traverse((o) => { if (o.name?.startsWith('ground:')) g += 1; });
  return g < 100;
});
const 撳前 = await 睇();
await page.click('#start-btn');
await page.waitForTimeout(150);
const 撳後 = await 睇();
// 再撳一次——玩家喺一個等 24 秒嘅畫面度一定會咁做。
await page.click('#start-btn', { force: true }).catch(() => {});
await page.waitForTimeout(400);
const 中途 = await 睇();

await page.waitForFunction(() => {
  const T = window.__TD; if (!T) return false;
  let g = 0; T.scene.traverse((o) => { if (o.name?.startsWith('ground:')) g += 1; });
  return T.state.phase !== 'idle' && g > 100;
}, null, { timeout: 240000 });
const 打得 = await page.evaluate(() => ({
  開波次數: window.__TD.開波次數(),
  波: window.__TD.state.currentWave,
  開場畫面: !document.getElementById('start-screen').classList.contains('hidden'),
}));

check('撳 START 嗰陣資產真係仲未落齊（唔係喺一個載完嘅畫面度做實驗）',
  未齊, { 未齊, KB: Math.round(bytes / 1024) });

check('撳完 START 即刻有交代：個掣停用、進度條出現',
  撳後.掣停用 && 撳後.進度見得到 && !撳前.進度見得到,
  { 撳前, 撳後 });

check('進度條唔係得個殼：有「好幾多／叫過幾多」嘅數',
  /\d+\s*\/\s*\d+/.test(撳後.進度字) || /\d+\s*\/\s*\d+/.test(中途.進度字),
  { 撳後: 撳後.進度字, 中途: 中途.進度字, 闊: 中途.闊 });

// 呢條要驗嘅係「開咗幾多次波」，唔係「而家係第幾波」。
// 我第一版攞 `currentWave` 去驗，拆走防護之後條 gate 一樣綠——因為第二次
// `enterRun` 整個全新 state 出嚟，佢一樣係 wave 0。所以要數次數。
check('等緊嗰陣再撳一次 START，只會開一次波',
  打得.開波次數 === 1 && !打得.開場畫面, 打得);

check('載入期間零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 載入: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
