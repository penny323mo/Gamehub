// Browser contract for the irregular map and tap-without-move placement.
// Run: node games/tower/tests/map-browser.mjs [screenshot.png]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const MAPCFG = JSON.parse(fs.readFileSync(path.join(HERE, '../configs/map.json'), 'utf8'));
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
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 160)));
await page.goto(`http://localhost:${port}/games/tower/dist/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
await page.click('#start-btn');
await page.waitForTimeout(9000);

const scene = await page.evaluate(() => {
  const T = window.__TD; const grounds = [];
  T.scene.traverse((o) => { if (o.name?.startsWith('ground:')) grounds.push(o.name); });
  return {
    grounds: grounds.length,
    hasVoidCorner: grounds.some((n) => n.startsWith('ground:0,0:')),
    river: grounds.filter((n) => n.includes('tile_riverStraight')).length,
    bridge: grounds.filter((n) => n.includes('tile_riverBridge')).length,
    foundation: T.scene.getObjectByName('island-soil')?.count ?? -1,
  };
});
check('browser 真係只畫 148 格不規則陸地，唔係底下仲藏住 240 格矩形',
  scene.grounds === 148 && scene.foundation === 148 && !scene.hasVoidCorner, scene);
check('河道同橋有實際 render 出嚟', scene.river === 4 && scene.bridge === 1, scene);

/*
 * ── 個世界要去到鏡頭望得到嗰度為止 ──
 *
 * Penny 講「個地圖唔夠廣闊」。量落去，唔係地細，係**個世界喺你最想望遠嗰陣斷咗**：
 * 佈景本來去到 X ±19、Z ±15 就冇，而鏡頭 zoom 得出到默認嘅 2.2 倍。
 * 一 zoom 到盡，望到嘅係由 19 到 33 一條十四單位闊、乜都冇嘅光板地帶，
 * 再遠處得返 18 枝孤零零嘅圓錐。
 *
 * 所以呢條唔量「有幾多樹」——量嘅係**最遠嗰件擺設有冇超出鏡頭望到嘅範圍**。
 * 呢個數先係同「廣闊」直接對應嗰個，而且將來有人收窄佈景範圍、
 * 或者放寬 zoom 上限，兩邊任何一邊郁都會報紅。
 *
 * 量 instance 一定要拆 `instanceMatrix`：InstancedMesh 自己個 `position`
 * 永遠喺原點，攞佢嚟量會量到成個世界縮埋喺 (0,0)——我第一版就係咁量錯咗。
 */
const 廣 = await page.evaluate(() => {
  const T = window.__TD;
  const c = T.camera;
  let 佈景最遠 = 0, 山最遠 = 0, 佈景數 = 0, 山數 = 0;
  T.scene.traverse((o) => {
    if (!o.isInstancedMesh) return;
    const 係佈景 = o.name?.startsWith('scenery-batch');
    const 係山 = o.name === 'distant-ridges';
    if (!係佈景 && !係山) return;
    const m = o.instanceMatrix.array;
    for (let i = 0; i < o.count; i += 1) {
      const d = Math.hypot(m[i * 16 + 12], m[i * 16 + 14]);
      if (係佈景) { 佈景最遠 = Math.max(佈景最遠, d); 佈景數 += 1; }
      else { 山最遠 = Math.max(山最遠, d); 山數 += 1; }
    }
  });
  // zoom 到盡，睇吓鏡頭覆蓋到幾遠（正交 frustum 半對角）
  const 原 = { l: c.left, r: c.right, t: c.top, b: c.bottom };
  for (let i = 0; i < 400; i += 1) T.camera.userData;      // no-op，保持同步
  return { 佈景最遠: +佈景最遠.toFixed(1), 山最遠: +山最遠.toFixed(1), 佈景數, 山數, 原 };
});
// 鏡頭 zoom 到盡（MAX_FRUSTUM = 22）嗰陣，垂直半高 22、水平半闊 22×aspect。
// 望到最遠嘅角落大約係呢個半對角，再加返鏡頭離目標嘅斜距。
const 望到 = await page.evaluate(() => {
  const el = document.getElementById('game-canvas');
  el.dispatchEvent(new WheelEvent('wheel', { deltaY: 4000, bubbles: true }));
  return new Promise((r) => setTimeout(() => {
    const c = window.__TD.camera;
    r(Math.hypot((c.right - c.left) / 2, (c.top - c.bottom) / 2));
  }, 300));
});
// 只守**伸得夠遠**，唔守件數。
// 我第一版加咗 `佈景數 > 2000`，喺呢個 390×844 嘅 viewport 度即刻報紅——
// 手機本來就特登擺少啲（930 件），2000 係我照桌面嗰個 3,775 度出嚟嘅數。
// 而且件數根本唔係要守嘅嘢：有人調密度就會無辜報紅，但個世界一樣咁闊。
// 件數照樣印出嚟做參考，唔入判斷。
check('鏡頭 zoom 到盡都仲有世界睇——佈景同遠山都超出視野範圍',
  廣.佈景最遠 >= 望到 && 廣.山最遠 >= 望到,
  { ...廣, 鏡頭望到: +望到.toFixed(1) });

const world = ([c, r]) => ({
  x: MAPCFG.origin.x + (c + 0.5) * MAPCFG.cellSize,
  z: MAPCFG.origin.z + (r + 0.5) * MAPCFG.cellSize,
});
const pureTap = async (cell) => page.evaluate(({ x, z }) => {
  const T = window.__TD;
  const V = T.camera.position.constructor;
  const p = new V(x, 0.2, z).project(T.camera);
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();
  const clientX = rect.left + (p.x * 0.5 + 0.5) * rect.width;
  const clientY = rect.top + (-p.y * 0.5 + 0.5) * rect.height;
  canvas.dispatchEvent(new MouseEvent('click', { clientX, clientY, bubbles: true }));
  return { clientX: +clientX.toFixed(1), clientY: +clientY.toFixed(1) };
}, world(cell));

await page.evaluate(() => {
  window.__TD.state.gold = 9999;
  document.querySelector('.build-btn[data-tower="arrow"]').click();
});
const validPoint = await pureTap([11, 5]);
await page.waitForTimeout(120);
const afterValid = await page.evaluate(() => window.__TD.state.towers.map((t) => [t.col, t.row]));
check('手機純 tap（冇 touchmove/mousemove）會即時計落點並起喺正確格',
  afterValid.some(([c, r]) => c === 11 && r === 5), { point: validPoint, towers: afterValid });

const beforeBlocked = afterValid.length;
const riverPoint = await pureTap([10, 3]);
const voidPoint = await pureTap([5, 1]);
await page.waitForTimeout(120);
const afterBlocked = await page.evaluate(() => window.__TD.state.towers.map((t) => [t.col, t.row]));
check('河道同 void 格就算直接 dispatch tap 都起唔到塔',
  afterBlocked.length === beforeBlocked, { riverPoint, voidPoint, towers: afterBlocked });

await page.evaluate(() => {
  document.getElementById('cancel-build-btn').click();
  document.getElementById('tower-tooltip').classList.add('hidden');
  window.__TD.state.paused = true;
  window.__TD.state.enemies = [];
});
await page.mouse.move(1, 1);
await page.waitForTimeout(1200);
if (process.argv[2]) await page.screenshot({ path: process.argv[2] });
await page.setViewportSize({ width: 844, height: 390 });
await page.waitForTimeout(250);
const endpoints = await page.evaluate(({ spawn, goal, origin, cellSize }) => {
  const T = window.__TD, V = T.camera.position.constructor;
  const project = ([c, r]) => {
    const p = new V(origin.x + (c + 0.5) * cellSize, 0.2, origin.z + (r + 0.5) * cellSize).project(T.camera);
    return { x: (p.x * 0.5 + 0.5) * innerWidth, y: (-p.y * 0.5 + 0.5) * innerHeight };
  };
  return { spawn: project(spawn), goal: project(goal), w: innerWidth, h: innerHeight };
}, { spawn: MAPCFG.spawnCell, goal: MAPCFG.goalCell, origin: MAPCFG.origin, cellSize: MAPCFG.cellSize });
check('手機橫向預設鏡頭同時睇到入口同出口',
  [endpoints.spawn, endpoints.goal].every((p) => p.x >= 0 && p.x <= endpoints.w && p.y >= 0 && p.y <= endpoints.h),
  endpoints);
const landscapeDock = await page.locator('#build-menu').evaluate((el) => {
  const r = el.getBoundingClientRect();
  return { left: +r.left.toFixed(1), right: +r.right.toFixed(1), top: +r.top.toFixed(1), height: +r.height.toFixed(1) };
});
check('手機橫屏建塔欄保持矮身，唔再遮住半幅地圖',
  landscapeDock.height <= 72 && landscapeDock.top >= 310 && landscapeDock.left >= 220,
  landscapeDock);
if (process.argv[2]) {
  const landscape = process.argv[2].replace(/\.png$/i, '-landscape.png');
  await page.screenshot({ path: landscape });
}
check('量度期間零 browser error', errors.length === 0, errors.slice(0, 3));
console.log(`\ntower 地圖 browser: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close(); server.close(); process.exit(fail ? 1 : 0);
