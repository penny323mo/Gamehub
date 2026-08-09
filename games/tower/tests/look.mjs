// 畫面睇落點——**量幅圖，唔係睇圖**。
//
// 「靚唔靚」爭拗唔出，但「成幅畫係咪一浸黑」、「係咪畀光斑蓋住」、「條路睇唔睇
// 得見」呢啲係量得到嘅。呢把尺入場、開波、收埋 HUD，淨係影 3D 畫面，然後數像素。
//
// 佢捉到過嘅嘢（全部係實數，唔係感覺）：
//   • 塵埃 shader 用透視鏡頭嘅式去計 point size，而個鏡頭係 orthographic
//     ——每粒塵渲染成 50 px 闊嘅白光斑，**白斑佔 1.41%**。
//   • Kenney 啲 GLB 冇寫 `metallicFactor`，glTF 預設係 **1.0**，即係全金屬；
//     全金屬冇 diffuse，冇環境貼圖就係全黑——**平均亮度 3.8 / 255、99.9% 近黑**。
//     （我一度加大三倍燈想補，只去到 14.9：成因唔喺燈度。）
//   • 底板擺得太高浸過咗磚面，成塊地變一浸平色。
//
// 跑法：node games/tower/tests/look.mjs [輸出.png]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const STATIC_ROOT = process.env.TOWER_STATIC_ROOT ? path.resolve(process.env.TOWER_STATIC_ROOT) : ROOT;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.glb':'model/gltf-binary', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.m4a':'audio/mp4' };

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
let server = null;
let url = process.env.TOWER_URL;
if (!url) server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(STATIC_ROOT, u);
  if (!f.startsWith(STATIC_ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
if (server) {
  const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
  url = process.env.TOWER_STATIC_ROOT
    ? `http://127.0.0.1:${port}/index.html`
    : `http://127.0.0.1:${port}/games/tower/dist/index.html`;
}
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 140)));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
await page.click('#start-btn');
// 鋪地係 async，開波之後仲要畫幾幀先影得到。
await page.waitForTimeout(8000);
// Freeze moving/spawn effects so this measures the map palette rather than a
// random frame of the gateway flash.
await page.evaluate(() => { window.__TD.state.paused = true; window.__TD.state.enemies = []; });
await page.waitForTimeout(1500);
// 收埋 HUD：量嘅係 3D 畫面，唔係啲掣同字。
await page.evaluate(() => {
  for (const el of document.querySelectorAll('body > *:not(#game-canvas)')) el.style.display = 'none';
});
await page.waitForTimeout(600);
const 相 = await page.screenshot();
if (process.argv[2]) fs.writeFileSync(process.argv[2], 相);

const 數 = await page.evaluate(async (b64) => {
  const img = new Image();
  await new Promise((r) => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
  const W = 550, H = 350;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  let n = 0, 白 = 0, 黑 = 0, 純黑 = 0, 邊黑 = 0, s = 0, 草 = 0, 路 = 0, 水 = 0;
  const 色 = new Set();
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], gg = d[i + 1], b = d[i + 2];
    const v = (r + gg + b) / 3;
    n += 1; s += v;
    if (v > 190) 白 += 1;
    if (v < 32) 黑 += 1;
    if (r < 5 && gg < 5 && b < 5) {
      純黑 += 1;
      const p = i / 4, x = p % W, y = Math.floor(p / W);
      if (x < W * 0.05 || x > W * 0.95 || y < H * 0.05 || y > H * 0.95) 邊黑 += 1;
    }
    色.add(`${r >> 4},${gg >> 4},${b >> 4}`);
    // 草：綠明顯壓過紅同藍。路：紅同綠都高而藍低（橙泥色）。
    if (gg > 70 && gg > r * 1.35 && gg > b * 1.25) 草 += 1;
    if (r > 110 && gg > 70 && b < gg * 0.75 && r > b * 1.7) 路 += 1;
    if (gg > 105 && b > 105 && gg > r * 1.35 && b > r * 1.35) 水 += 1;
  }
  return {
    平均亮度: +(s / n).toFixed(1),
    白斑: +(100 * 白 / n).toFixed(2),
    近黑: +(100 * 黑 / n).toFixed(1),
    純黑: +(100 * 純黑 / n).toFixed(2),
    邊黑: +(100 * 邊黑 / n).toFixed(2),
    草: +(100 * 草 / n).toFixed(1),
    路: +(100 * 路 / n).toFixed(2),
    水: +(100 * 水 / n).toFixed(2),
    色數: 色.size,
  };
}, 相.toString('base64'));

// 一浸黑就係換完資產最容易中嘅嘢，而佢唔會令任何一條 build gate 紅。
check('成幅畫唔係一浸黑（平均亮度要企得住）', 數.平均亮度 >= 25 && 數.平均亮度 <= 150, 數);
check('近黑像素唔可以過半以上再多（背景可以暗，個場唔可以冇）', 數.近黑 <= 75, { 近黑: 數.近黑 });
// 加法混合嘅粒子一失控就係成塊畫面白斑——修之前係 1.41%。
check('冇畀白光斑蓋住', 數.白斑 <= 0.5, { 白斑: 數.白斑 });
check('遠景山脊唔會由畫面邊緣變成純黑三角形插入嚟', 數.邊黑 <= 0.05,
  { 邊黑: 數.邊黑, 全圖純黑: 數.純黑 });
// 語意check：塊地要見到草，條路要見到泥。資產載唔到嘅話呢兩個數會即刻塌。
check('見到草地（塊板唔係一浸灰）', 數.草 >= 8, { 草: 數.草 });
check('見到條路（路磚真係鋪咗出嚟）', 數.路 >= 0.8, { 路: 數.路 });
check('中央河道真係喺畫面見到', 數.水 >= 0.08, { 水: 數.水 });
check('唔係得幾隻色（燈掛咗／鏡頭插咗入嘢就會係咁）', 數.色數 >= 40, { 色數: 數.色數 });
check('入場到影相之間零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 畫面: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
if (server) server.close();
process.exit(fail ? 1 : 0);
