// 條路兩頭：入口一對門會開、出口一座城堡帶血量條。
//
// 換咗真磚之後條路兩頭係就咁斷咗——怪由一格空地行出嚟，行到另一格空地就消失。
// 而家兩頭都有嘢，但「有嘢」唔等於「郁得啱」。呢把尺問四句量得到嘅：
//
//   1. **出咗怪，道門真係揈開。** 開門唔係計時器夾出嚟，係 `enemySpawned`
//      事件推——所以呢條 gate 一齊守住個事件有冇發出。
//   2. **開完會自己閂返。** 唔閂返就係一道永遠打開嘅門，同冇門一樣。
//   3. **出怪嗰下畫面真係光咗。** 「閃光」係睇得到嘅嘢，所以量像素，
//      唔係量個變數——量變數只證明個變數郁咗。
//   4. **條血量條跟住命數。** 佢唔係 HUD 嗰個數嘅副本，係擺喺你要守嗰個位上面。
//
// 跑法：node games/tower/tests/gateway.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) { console.log('搵唔到 playwright'); process.exit(1); }
const { chromium } = await import(pathToFileURL(PW).href);
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.glb':'model/gltf-binary', '.png':'image/png', '.svg':'image/svg+xml', '.m4a':'audio/mp4' };

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 150)));
await page.goto(`http://localhost:${port}/games/tower/dist/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
await page.click('#start-btn');
await page.waitForTimeout(9000);
await page.evaluate(() => {
  for (const el of document.querySelectorAll('body > *:not(#game-canvas)')) el.style.display = 'none';
});
await page.waitForTimeout(400);

// ── 1. 出怪 → 道門開 ──
// 唔直接叫 `開門()`：要行返真路徑（`spawnEnemy` → `enemySpawned` 事件 → 開門），
// 咁樣呢條 gate 先至同時守住個事件有冇發出。
const 閂 = await page.evaluate(() => window.__TD.門狀態());
await page.evaluate(() => { window.__TD.spawn('grunt'); });
await page.waitForTimeout(70);
const 開 = await page.evaluate(() => window.__TD.門狀態());
check('出一隻怪，道門就揈開（行返 enemySpawned 事件嗰條路）',
  閂.開度 < 0.05 && 開.開度 > 0.5 && Math.abs(開.門角[0]) > 0.6 && Math.abs(開.門角[1]) > 0.6,
  { 閂, 開 });
check('兩塊門板向相反方向揈（唔係兩塊一齊向同一邊）',
  開.門角[0] * 開.門角[1] < 0, { 門角: 開.門角 });

// ── 3. 閃光要真係喺畫面上見到 ──
// 量門口嗰笪像素：閃緊 vs 閃完。量個變數只證明個變數郁咗。
const 框 = await page.evaluate(() => {
  const T = window.__TD;
  const c = T.camera;
  const V = Object.getPrototypeOf(c.position).constructor;
  const m = T.地圖;
  const p = new V(m.spawn.x, 0.7, m.spawn.z);
  p.project(c);
  return {
    x: Math.round((p.x * 0.5 + 0.5) * window.innerWidth),
    y: Math.round((-p.y * 0.5 + 0.5) * window.innerHeight),
  };
});
const clip = { x: Math.max(0, 框.x - 60), y: Math.max(0, 框.y - 60), width: 120, height: 120 };
const 亮 = async () => {
  const 相 = await page.screenshot({ clip });
  return page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((r) => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let s = 0, n = 0, 青 = 0;
    for (let i = 0; i < d.length; i += 4) {
      s += (d[i] + d[i + 1] + d[i + 2]) / 3; n += 1;
      if (d[i + 2] > 110 && d[i + 2] > d[i] + 22) 青 += 1;   // 偏青藍＝閃光
    }
    return { 亮: +(s / n).toFixed(1), 青: +(100 * 青 / n).toFixed(2) };
  }, 相.toString('base64'));
};
// 先等閃完，攞底色
await page.waitForTimeout(1400);
const 平時 = await 亮();
await page.evaluate(() => { window.__TD.spawn('grunt'); });
await page.waitForTimeout(50);
const 閃住 = await 亮();
// 條線係**由兩個狀態嘅實測數定嘅**，唔係拍腦袋：
//   道門轉錯咗 90°（光幕埋咗入牆）嗰陣：青 0.63% → 0.85%（1.35×），亮度 53.3 → 48.5（**跌** 4.8，
//     因為門揈開之後露出後面暗位，反而暗咗）；
//   轉啱＋加大效果之後：青 0.65% → 2.92%（**4.5×**），亮度 48.7 → 51.5（升 2.8）。
// 所以「青色像素至少翻倍」同「亮度唔可以跌」兩條夾埋，就分得清有冇閃。
// 我最初寫「亮度要 +4」——嗰個係未有任何數之前拍出嚟嘅，而個 crop 大部分係草同石，
// 平均亮度本來就郁得慢；真正嘅判別訊號係嗰笪青色。
const 青倍 = 閃住.青 / Math.max(0.01, 平時.青);
check('出怪嗰下門口真係光咗（量像素，唔係量個變數）',
  青倍 >= 2 && 閃住.亮 > 平時.亮 + 1, { 平時, 閃住, 青倍: +青倍.toFixed(2) });

// ── 2. 開完會閂返 ──
await page.waitForTimeout(1600);
const 閂返 = await page.evaluate(() => window.__TD.門狀態());
check('開完會自己閂返（唔係一道永遠打開嘅門）',
  閂返.開度 < 0.05 && Math.abs(閂返.門角[0]) < 0.06, 閂返);

// ── 4. 血量條跟住命數 ──
const 量條 = async (lives) => {
  await page.evaluate((l) => { window.__TD.state.lives = l; }, lives);
  await page.waitForTimeout(120);
  return page.evaluate(() => window.__TD.門狀態().血條闊);
};
const 滿 = await 量條(20);
const 半 = await 量條(10);
const 得三 = await 量條(3);
check('血量條跟住剩返幾多條命縮（唔係擺喺度唔郁）',
  Math.abs(滿 - 1) < 0.02 && Math.abs(半 - 0.5) < 0.03 && Math.abs(得三 - 0.15) < 0.03,
  { 滿, 半, 得三 });
await page.evaluate(() => { window.__TD.state.lives = 20; });

check('量度期間零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 門同城堡: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
