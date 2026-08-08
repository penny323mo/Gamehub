// 資產嘅一把尺：**佢哋真係載得入，而且尺寸對得住張地圖**。
//
// 呢隻遊戲本來零資產、成個場程序生成。而家換咗 Kenney 嘅 CC0 kit，資產就變咗
// 遊戲嘅一部分，而資產壞法同 code 壞法唔同：檔喺 repo 度、build 綠、跑起身
// 先至靜靜哋少咗一嚿嘢。所以呢度問三樣**用真嘅 GLTFLoader** 答：
//
//   1. 清單入面每個檔都喺度，而且係真 GLB（唔係 GitHub 嘅 404 HTML）
//   2. 每個都 parse 得入 three.js，有 mesh、有 material
//   3. 路磚**啱啱好一單位**——`map.json` 嘅 cellSize 係 1，成張地圖嘅擺位
//      係建基於呢個數。差少少就成張地圖有隙或者疊。
//
// 跑法：node games/tower/tests/assets.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const ASSETS = path.join(HERE, '..', 'public', 'models');
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) { console.log('搵唔到 playwright'); process.exit(1); }
const { chromium } = await import(pathToFileURL(PW).href);
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.glb':'model/gltf-binary', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.m4a':'audio/mp4' };

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

// ── 1. 檔案層：真 GLB，唔係 404 HTML ──
const 全部 = [];
for (const grp of ['towers', 'tiles', 'enemies', 'scenery']) {
  const d = path.join(ASSETS, grp);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.glb'))) 全部.push(`${grp}/${f}`);
}
const 唔似GLB = 全部.filter((rel) => {
  const b = fs.readFileSync(path.join(ASSETS, rel));
  return b.length < 20 || b.subarray(0, 4).toString('latin1') !== 'glTF';
});
check(`清單入面每個檔都係真 GLB（共 ${全部.length} 個）`, 全部.length >= 60 && 唔似GLB.length === 0,
  { 檔數: 全部.length, 唔似GLB });
// 牌照唔可以淨係喺 commit message 度——CC0 都要留返原文喺 repo。
const 牌照 = fs.existsSync(path.join(ASSETS, 'licenses'))
  ? fs.readdirSync(path.join(ASSETS, 'licenses')) : [];
check('每個資產來源都有牌照原文留喺 repo', 牌照.length >= 2 && 牌照.every((f) => {
  const t = fs.readFileSync(path.join(ASSETS, 'licenses', f), 'utf8');
  return /creative ?commons/i.test(t) && /CC0|publicdomain/i.test(t);
}), { 牌照 });

// ── 2 + 3. 真 GLTFLoader ──
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
const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 140)));
await page.goto(`http://localhost:${port}/games/tower/dist/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });

// 用**遊戲自己嗰個 loader**（`src/render/assets.ts`）量，唔係喺測試度另開一個。
// 另開一個就係量緊一件遊戲唔會行嘅嘢——量到嘅嘢就同隻遊戲冇關。
const 量 = await page.evaluate(async ({ 清單 }) => {
  const 出 = {};
  for (const rel of 清單) 出[rel] = await window.__TD.量模型(rel);
  return 出;
}, { 清單: 全部 });

const 掛咗 = Object.entries(量).filter(([, v]) => v.掛咗);
check('每個 GLB 都 parse 得入 three.js', 掛咗.length === 0, 掛咗.slice(0, 5));
const 空嘅 = Object.entries(量).filter(([, v]) => !v.掛咗 && (v.mesh === 0 || v.mat === 0 || v.tri === 0));
check('冇一個載出嚟係空殼（有 mesh、有 material、有三角形）', 空嘅.length === 0,
  空嘅.slice(0, 5).map(([k, v]) => [k, v]));

// 路磚一單位——map.json 話 cellSize 1，成張地圖擺位靠呢個數。
const cellSize = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'configs', 'map.json'), 'utf8')).cellSize;
const 磚 = Object.entries(量).filter(([k, v]) => k.startsWith('tiles/') && !v.掛咗);
const 唔啱格 = 磚.filter(([, v]) => Math.abs(v.尺[0] - cellSize) > 0.02 || Math.abs(v.尺[2] - cellSize) > 0.02);
check(`路磚啱啱好一格闊（map.json cellSize = ${cellSize}）`, 磚.length >= 15 && 唔啱格.length === 0,
  { 磚數: 磚.length, 唔啱格: 唔啱格.slice(0, 5).map(([k, v]) => [k, v.尺]) });

// 塔件要疊得起：每節高度一致，唔係就會有隙。
const 節 = Object.entries(量).filter(([k]) => /towers\/tower(Round|Square)_(bottom|middle|top)/.test(k));
const 高 = 節.map(([, v]) => v.尺[1]);
check('塔嘅每一節高度一致（唔係就疊起身有隙）',
  節.length >= 15 && Math.max(...高) - Math.min(...高) < 0.02, { 節數: 節.length, 高: [...new Set(高)] });

// 一個場最多幾百件嘢，逐件三角形數要細——呢個 gate 係擋將來換大模型。
const 最多三角 = Math.max(...Object.values(量).filter((v) => !v.掛咗).map((v) => v.tri));
check('冇一件資產超過 3000 個三角形（低模先鋪得滿成張地圖）', 最多三角 <= 3000,
  { 最多三角, 邊個: Object.entries(量).find(([, v]) => v.tri === 最多三角)?.[0] });

check('量度期間零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 資產: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
