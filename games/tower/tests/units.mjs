// 塔同敵人：**真模型定係程序幾何**，同埋佢哋分唔分得開。
//
// `towerRenderer.ts` 本來 942 行、`enemyRenderer.ts` 629 行，全部係手寫幾何：
// 圓柱做塔身、圓球做頭、圓錐做角。而家兩邊都用 Kenney 嘅 CC0 模型。呢把尺
// 問四句量得到嘅嘢：
//
//   1. **七種塔都起得成。** `取同步` 未預載會掟 error，所以「起得成」本身
//      就係一條真斷言（起塔係 bus event 一到就要即刻有嘢畫，冇得 await）。
//   2. **升一級真係疊多一節。** 一節 0.5 高——高度同件數都要跟住升。
//   3. **七種塔分得開。** 唔用像素量：塔喺畫面上得幾十 px，剪個框出嚟九成係
//      草同陰影（試過兩版都係讀返草色——嗰個係支尺嘅證據，唔係遊戲嘅證據）。
//      真正要問嘅係 `染色()` 有冇落到色，而嗰個喺場景圖度讀得到。
//   4. **敵人係模型唔係方塊，而且照舊 instanced。** 一波最多 455 隻，
//      每隻一個 Object3D 就係幾千個 draw call——所以要守住佢哋仲係 InstancedMesh。
//
// 跑法：node games/tower/tests/units.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const STATIC_ROOT = process.env.TOWER_STATIC_ROOT ? path.resolve(process.env.TOWER_STATIC_ROOT) : ROOT;
const MAPCFG = JSON.parse(fs.readFileSync(path.join(HERE, '../configs/map.json'), 'utf8'));
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.glb':'model/gltf-binary', '.png':'image/png', '.svg':'image/svg+xml', '.m4a':'audio/mp4' };

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
page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 160)));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
await page.click('#start-btn');
await page.waitForTimeout(9000);

const 塔種 = ['arrow', 'cannon', 'ice', 'fire', 'lightning', 'poison', 'sniper'];
const 敵種 = ['grunt', 'tank', 'runner', 'swarm', 'shield', 'healer', 'boss'];

// ── 塔：逐級量 ──
const 塔 = await page.evaluate(async ({ 塔種, 路 }) => {
  const T = window.__TD, S = () => T.state;
  T.路 = 路;
  const 出 = {}; const 掛咗 = [];
  for (let i = 0; i < 塔種.length; i += 1) {
    S().gold = 999999;
    let tw = null;
    for (let pi = 3 + i * 3; pi < T.路.length - 2 && !tw; pi += 1) {
      const [pc, pr] = T.路[pi];
      for (const [dc, dr] of [[0, -1], [0, 1], [1, 0], [-1, 0], [1, 1], [-1, -1]]) {
        try { tw = T.build(塔種[i], pc + dc, pr + dr); } catch (e) { 掛咗.push(`${塔種[i]}: ${e}`); }
        if (tw) break;
      }
    }
    if (!tw) { 出[塔種[i]] = { 起唔到: true }; continue; }
    const 級 = [];
    for (let lv = 0; lv < 3; lv += 1) {
      T.塔同步();
      級.push(T.塔尺(tw.id));
      if (lv < 2) T.upgrade(tw.id);
    }
    出[塔種[i]] = { id: tw.id, 級 };
  }
  // Evolution resets logical level to 0. Measure the same max-level Arrow before
  // and after evolving to make sure its building does not visually collapse.
  const arrow = S().towers.find((t) => t.id === 出.arrow?.id);
  const 進化 = { ok: false, before: 出.arrow?.級?.[2] ?? null, after: null, logicalLevel: null, type: null };
  if (arrow) {
    進化.ok = T.進化(arrow.id, 'arrow_rapid');
    T.塔同步();
    const evolved = S().towers.find((t) => t.id === arrow.id);
    進化.after = T.塔尺(arrow.id);
    進化.logicalLevel = evolved?.level ?? null;
    進化.type = evolved?.type ?? null;
  }
  return { 出, 掛咗, 進化 };
}, { 塔種, 路: MAPCFG.path });

check('七種塔都起得成，而且冇一件模型係未預載就攞（會掟 error）',
  塔.掛咗.length === 0 && 塔種.every((t) => 塔.出[t] && !塔.出[t].起唔到),
  { 掛咗: 塔.掛咗.slice(0, 3), 起唔到: 塔種.filter((t) => 塔.出[t]?.起唔到) });

const 唔高 = [];
for (const t of 塔種) {
  const 級 = 塔.出[t]?.級;
  if (!級 || 級.some((x) => !x)) { 唔高.push({ 塔: t, 量唔到: true }); continue; }
  for (let i = 1; i < 級.length; i += 1) {
    if (級[i].高 <= 級[i - 1].高 + 0.05) 唔高.push({ 塔: t, 級: i, 高: 級.map((x) => x.高) });
  }
}
check('每升一級都真係高咗（疊多一節）', 唔高.length === 0, 唔高.slice(0, 4));

const 升幅 = 塔種.map((t) => {
  const 級 = 塔.出[t]?.級;
  return { 塔: t, 升: 級?.[0] && 級?.[2] ? +(級[2].高 - 級[0].高).toFixed(2) : null };
});
check('由一級升到三級總共高咗接近兩節（2 × 0.5）',
  升幅.every((x) => x.升 !== null && x.升 >= 0.8 && x.升 <= 1.25), 升幅);

const 件數 = 塔種.map((t) => ({ 塔: t, 件: 塔.出[t]?.級?.map((x) => x?.件) }));
check('升級係加多一件模型，唔係將原本嗰件拉長',
  件數.every((x) => x.件 && x.件[2] > x.件[0]), 件數);

// 模型要留喺自己嗰格。原件塔底啱啱 1×1，四邊貼死；冰／毒屋頂更加去到
// 1.41×1.41，視覺上跨入隔籬條路。邏輯位置可以係格中心，但 render footprint
// 要留一圈草邊，玩家先一眼睇得出佢起喺邊格。
const 佔格 = 塔種.flatMap((t) => (塔.出[t]?.級 ?? []).map((x, level) => ({
  塔: t, 級: level + 1, 佔格: x?.佔格,
})));
check('每座塔嘅視覺 footprint 留喺自己一格之內（唔踩入隔籬路面）',
  佔格.every((x) => x.佔格 && x.佔格[0] <= 0.92 && x.佔格[1] <= 0.92),
  佔格.filter((x) => !x.佔格 || x.佔格[0] > 0.92 || x.佔格[1] > 0.92));

const 地面 = 塔種.flatMap((t) => (塔.出[t]?.級 ?? []).map((x, level) => ({ 塔: t, 級: level + 1, 底: x?.底 })));
check('每座塔都企喺 0.2 高嘅地磚面，唔再埋入地底',
  地面.every((x) => Math.abs((x.底 ?? -99) - 0.2) <= 0.015),
  地面.filter((x) => Math.abs((x.底 ?? -99) - 0.2) > 0.015));

check('進化後邏輯 level 可以重置，但三層塔身唔會縮返一層',
  塔.進化.ok && 塔.進化.logicalLevel === 0 && 塔.進化.type === 'arrow_rapid'
    && 塔.進化.after?.高 >= 塔.進化.before?.高 - 0.25,
  塔.進化);

check('冰塔同毒塔個屋頂係固定嘅，唔會成座跟目標打轉',
  ['ice', 'poison'].every((t) => (塔.出[t]?.級 ?? []).every((x) => x?.轉塔 === false)),
  Object.fromEntries(['ice', 'poison'].map((t) => [t, 塔.出[t]?.級?.map((x) => x?.轉塔)])));

// 分唔分得開：讀場景圖入面真正落咗嘅識別色
const 色 = Object.fromEntries(塔種.map((t) => [t, 塔.出[t]?.級?.[2]?.色 ?? []]));
check('每種塔身上都真係落咗識別色（唔係一排灰石頭）',
  塔種.every((t) => 色[t].length > 0), 色);
const 撞 = [];
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
for (let i = 0; i < 塔種.length; i += 1) {
  for (let j = i + 1; j < 塔種.length; j += 1) {
    const a = 色[塔種[i]][0], b = 色[塔種[j]][0];
    if (!a || !b) continue;
    const [ar, ag, ab] = hex(a), [br, bg, bb] = hex(b);
    const d = Math.hypot(ar - br, ag - bg, ab - bb);
    if (d < 60) 撞.push({ 甲: 塔種[i], 乙: 塔種[j], 距: Math.round(d), 色: [a, b] });
  }
}
check('冇兩種塔嘅識別色似到分唔開', 撞.length === 0, 撞.slice(0, 4));

// ── 敵人：係模型、仲係 instanced ──
await page.evaluate(({ 敵種 }) => {
  const T = window.__TD;
  for (let i = 0; i < 敵種.length; i += 1) T.spawn(敵種[i], 4 + i * 3);
}, { 敵種 });
// 出咗怪之後要**畀個 render loop 行幾幀**先讀：`sync()` 係喺 rAF 入面設
// `mesh.count` 嘅，同一個 evaluate 入面即刻讀就一定係 0（第一版就係咁，
// 讀到 85 個 InstancedMesh 但全部 count = 0——量緊一個未畫過嘅場景）。
await page.waitForTimeout(700);
const 敵 = await page.evaluate(({ 敵種 }) => {
  const T = window.__TD;
  const 出 = {}; let inst = 0, plain = 0;
  T.scene.traverse((o) => {
    if (o.isInstancedMesh) {
      inst += 1;
      const g = o.geometry;
      const n = g.index ? g.index.count / 3 : g.getAttribute('position').count / 3;
      出[o.uuid] = { 三角: Math.round(n), 數: o.count };
    } else if (o.isMesh && o.geometry?.type && /SphereGeometry|BoxGeometry|ConeGeometry|CylinderGeometry/.test(o.geometry.type)) {
      plain += 1;
    }
  });
  const 用緊 = Object.values(出).filter((v) => v.數 > 0);
  return {
    instanced: inst,
    用緊: 用緊.length,
    最多三角: 用緊.length ? Math.max(...用緊.map((v) => v.三角)) : 0,
    敵數: T.state.enemies.length,
    程序幾何: plain,
  };
}, { 敵種 });

check('七種敵人都出得成', 敵.敵數 >= 7, { 敵數: 敵.敵數 });
// 一波最多 455 隻——冇 instancing 就係幾千個 draw call。
check('敵人仲係用 InstancedMesh 畫（唔係一隻一個 Object3D）',
  敵.instanced >= 7 && 敵.用緊 >= 7, { instanced: 敵.instanced, 用緊: 敵.用緊 });
// 由 GLB 抽返嘅 geometry 唔會係 three.js 嘅基本形狀，而且三角形數會大過一粒方塊。
check('敵人身上係真模型嘅 geometry（唔係圓球圓柱砌）',
  敵.最多三角 >= 60, { 最多三角: 敵.最多三角 });

check('量度期間零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 塔同敵人: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
if (server) server.close();
process.exit(fail ? 1 : 0);
