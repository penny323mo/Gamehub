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
