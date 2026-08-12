// Hub-wide 第三方依賴契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-cdn.mjs
//
// 呢把尺量嘅唔係「網速」，係「**唔關你事嘅嘢慢咗，會唔會累到你**」。
//
// 起因：一輪「玩落去有冇嘢爆」嘅探路，見到六隻遊戲都喺 HTML 度寫住
//
//     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//
// 冇 defer 冇 async——即係**塞住 parser**。實測（第三方 origin 吊 8 秒）：
//
//     Gomoku / Big Two / Dou Dizhu / Snooker  DCL 0.04–0.11s → 8.03s
//     Xiangqi AI                              DCL 0.49s      → 8.38s
//     Empire Royale（本來就 lazy）              0.42s → 0.37s
//     Tower（冇第三方，對照）                     0.31s → 0.26s
//
// 吊幾多秒就遲幾多秒，一比一。而個 SDK 淨係「真人對戰」用得着——單機／人機
// 玩家一世唔會用到佢，但一樣要等。而且 FCP 照樣 0.08 秒，即係**畫面畫咗一半
// 就唔郁**，睇落好似 ready 咗但撳乜都冇反應。
//
// 三條問題：
//   1. 第三方吊住，唔可以拖慢隻遊戲自己嘅碼開波（量 DOMContentLoaded 之差）。
//   2. SDK 到得返嘅話，真嘅線上入口要掛返上去（唔可以為咗快而整爛連線）。
//   3. SDK 未到嗰陣撳落去要有交代（唔可以靜靜雞乜都唔做）。
//
// 第 3 條唔係新病：以前 SDK 攞唔到嗰陣，`joinFixedRoom` 見到冇 client 就
// 靜靜雞 return。以前撞唔到係因為成版嘢都未郁，玩家根本撳唔到。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { catalogTargetEntries } from './lib/catalog-targets.mjs';
const { chromium } = await import('playwright').catch(async () => {
  const HERE0 = path.dirname(fileURLToPath(import.meta.url));
  const 後備 = pathToFileURL(path.resolve(HERE0, '../games/tower/node_modules/playwright/index.mjs')).href;
  return import(後備).catch(() => {
    console.error('搵唔到 playwright。喺 games/tower 度行一次 `npm ci` 就有：');
    console.error('  (cd games/tower && npm ci)');
    process.exit(2);
  });
});

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json', '.bin':'application/octet-stream',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp',
  '.hdr':'image/vnd.radiance', '.m4a':'audio/mp4', '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wav':'audio/wav',
  '.woff2':'font/woff2' };

// 吊幾耐。真實世界比呢個仲衰（DNS 黑洞可以吊到 30 秒），8 秒已經夠分得出。
const 吊秒 = 8;
// DCL 之差嘅上限。實測噪音喺 ±0.11 秒以內（同一份碼跑兩次），而個病係
// +7.86 至 +7.99 秒。1 秒喺兩者中間，兩邊都離得好遠——唔會因為機慢咗少少
// 就無啦啦報紅，亦都唔會漏咗一個「吊幾耐就遲幾耐」嘅病。
const DCL_上限 = 1.0;

const catalog = new Map(catalogTargetEntries().map((entry) => [entry.id, entry]));
const 目標 = (id) => {
  const entry = catalog.get(id);
  if (!entry) throw new Error(`Missing catalog target: ${id}`);
  return entry;
};

// `踢` = 開頁之後點樣令佢真係去掂連線層。null 即係開頁自己會做。
// Big Two／Dou Dizhu／Snooker 係玩家揀咗線上模式先叫 init，開場畫面唔會掂連線層
// ——喺呢度就係一個 `踢`，唔係一個病（呢個分別第一次跑嘅時候報咗紅，
// 而報紅嘅係把尺唔係隻遊戲）。
const 遊戲 = [
  { ...目標('gomoku'),
    入口: ['joinFixedRoom', 'exitFixedRoom', 'toggleReady'], 踢: null },
  { ...目標('big2'),
    入口: ['joinFixedRoom', 'exitFixedRoom', 'toggleReady'],
    踢: () => window.initOnlineMode?.() },
  { ...目標('doudizhu'),
    入口: ['joinFixedRoom', 'exitFixedRoom', 'toggleReady'],
    踢: () => window.initOnlineMode?.() },
  { ...目標('snooker'),
    入口: ['snookerJoinRoom', 'snookerExitRoom', 'snookerToggleReady'],
    踢: () => window.initSnookerOnline?.({ gameMode: '2d' }) },
  { ...目標('xiangqi'),
    入口: ['joinFixedRoom', 'exitFixedRoom', 'toggleReady'], 踢: null },
  { ...目標('royale'), 入口: null, 踢: null },
  { ...目標('tower'), 名: 'Tower（對照）', 入口: null, 踢: null },
];

// 假 SDK：夠用嚟行完 createClient 就得。呢度唔係試 Supabase，係試
// 「SDK 一到，真嘅入口有冇掛返上去」。
const 假SDK = `
(function () {
  function f() { return q; }
  function a() { return Promise.resolve({ data: null, error: null }); }
  var q = { select: f, eq: f, order: f, limit: f, in: f, update: f, insert: f,
            upsert: f, delete: f, single: a, maybeSingle: a };
  var ch = { on: function () { return ch; }, subscribe: function () { return ch; },
             unsubscribe: a, send: a, track: a };
  window.supabase = { createClient: function () {
    return { from: f, channel: function () { return ch; }, removeChannel: a,
             rpc: f, auth: { getSession: a } };
  } };
  window.__FAKE_SDK__ = true;
}());
`;

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
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const 本地 = (u) => ['localhost', '127.0.0.1'].includes(u.hostname);
const 開 = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  return [ctx, await ctx.newPage()];
};

// ── 1. 第三方吊住，會唔會拖慢隻遊戲自己開波 ────────────────────────────
const 量DCL = async (url, 吊) => {
  const [ctx, page] = await 開();
  await page.route((u) => !本地(u), async (route) => {
    if (吊) await new Promise((r) => setTimeout(r, 吊秒 * 1000));
    await route.abort('connectionfailed').catch(() => {});
  });
  let dcl = null;
  try {
    await page.goto(`http://localhost:${port}${encodeURI(url)}`, { waitUntil: 'load', timeout: 90000 });
    dcl = await page.evaluate(() =>
      +(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd / 1000).toFixed(2));
  } catch { dcl = 999; }
  await ctx.close();
  return dcl;
};
const 差表 = {};
for (const g of 遊戲) {
  const 快 = await 量DCL(g.url, false);
  const 慢 = await 量DCL(g.url, true);
  差表[g.名] = { 即刻失敗: 快, [`吊${吊秒}s`]: 慢, 差: +(慢 - 快).toFixed(2) };
}
const 超標 = Object.entries(差表).filter(([, v]) => v.差 > DCL_上限);
check(`第三方吊 ${吊秒} 秒，唔可以拖慢隻遊戲自己開波（DCL 之差 ≤ ${DCL_上限}s）`,
  超標.length === 0, 超標.length ? Object.fromEntries(超標) : { 上限: DCL_上限 });

// ── 2. SDK 到得返，真嘅線上入口要掛返上去 ─────────────────────────────
const 掛唔返 = {};
for (const g of 遊戲.filter((x) => x.入口)) {
  const [ctx, page] = await 開();
  await page.route((u) => u.hostname.includes('jsdelivr'),
    (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: 假SDK }));
  await page.route((u) => !本地(u) && !u.hostname.includes('jsdelivr'),
    (r) => r.abort('connectionfailed').catch(() => {}));
  await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (g.踢) { await page.waitForTimeout(400); await page.evaluate(g.踢).catch(() => {}); }
  const ok = await page.waitForFunction(
    // 唔可以淨係問 `typeof === 'function'`——個佔位自己都係 function，
    // 掛唔返真嘢都會扮過骨。所以要問埋「仲係唔係佔位」。
    (ns) => window.__FAKE_SDK__ && ns.every((n) => typeof window[n] === 'function' && !window[n].__holdingForSdk),
    g.入口, { timeout: 20000 }).then(() => true).catch(() => false);
  if (!ok) {
    掛唔返[g.名] = await page.evaluate((ns) => ({
      SDK: !!window.__FAKE_SDK__,
      入口: Object.fromEntries(ns.map((n) => [n, window[n]?.__holdingForSdk ? '仲係佔位' : typeof window[n]])),
    }), g.入口);
  }
  await ctx.close();
}
check('SDK 到得返嘅話，真嘅線上入口要掛返上去', Object.keys(掛唔返).length === 0,
  Object.keys(掛唔返).length ? 掛唔返 : { 驗過: 遊戲.filter((x) => x.入口).map((x) => x.名) });

// ── 3. SDK 未到嗰陣撳落去要有交代 ────────────────────────────────────
const 冇交代 = {};
for (const g of 遊戲.filter((x) => x.入口)) {
  const [ctx, page] = await 開();
  await page.route((u) => !本地(u), async (route) => {
    await new Promise((r) => setTimeout(r, 25000));
    await route.abort('connectionfailed').catch(() => {});
  });
  await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (g.踢) await page.waitForTimeout(400);
  if (g.踢) await page.evaluate(g.踢).catch(() => {});
  await page.waitForTimeout(600);
  // **唔可以 return 個 promise**：`page.evaluate` 會等埋佢 resolve，而佔位
  // 正正係吊住等 SDK 嗰個——咁就變成量緊自己個 test 幾時逾時。
  await page.evaluate((n) => { if (typeof window[n] === 'function') window[n]('ROOM01'); }, g.入口[0]);
  // **要即刻有反應，唔係遲早有反應。** 第一次寫嘅時候呢度畀咗 8 秒，
  // 結果突變測試（拆走佔位嘅 toast）照樣報綠——因為 `loadSupabaseSdk` 自己
  // 8 秒逾時嗰陣會嗌一句「載入失敗」，啱啱好喺個窗口入面頂咗上嚟。
  // 一條分唔開「撳完即刻有交代」同「等足八秒先有交代」嘅 gate 係壞 gate。
  const 交代 = await page.waitForFunction(() => {
    const t = document.querySelector('#gh-toast-container .gh-toast');
    return t ? { v: t.textContent } : null;
  }, undefined, { timeout: 1500 }).then((h) => h.jsonValue()).catch(() => null);
  if (!交代) 冇交代[g.名] = '撳咗第一個線上入口，1.5 秒內畫面乜反應都冇';
  await ctx.close();
}
check('SDK 未到嗰陣撳線上入口，1.5 秒內要有交代（唔可以靜靜雞乜都唔做）',
  Object.keys(冇交代).length === 0, Object.keys(冇交代).length ? 冇交代 : { 驗過: 遊戲.filter((x) => x.入口).length });

// Xiangqi 嘅環境光係可選嘅視覺增益，唔應該令 GitHub Pages／離線入口多一條
// Poly Haven runtime 依賴。Vite ?url import 必須同時落入 tracked dist，否則
// source 看似自包含、實際部署仍然會漏檔。
const xiangqiRender = fs.readFileSync(path.join(ROOT, 'games/xiangqi-ai/js/render.js'), 'utf8');
const xiangqiDistAssets = path.join(ROOT, 'games/xiangqi-ai/dist/assets');
const xiangqiHdrs = fs.readdirSync(xiangqiDistAssets).filter((name) => name.endsWith('.hdr'));
const xiangqiBundle = fs.readdirSync(xiangqiDistAssets)
  .filter((name) => /^index-[^/]+\.js$/.test(name))
  .map((name) => fs.readFileSync(path.join(xiangqiDistAssets, name), 'utf8'))
  .find((text) => text.includes('studio_small_09_1k-')) ?? '';
check('Xiangqi 環境光自包含（唔依賴 Poly Haven runtime）',
  xiangqiHdrs.length === 1 &&
  xiangqiRender.includes('studio_small_09_1k.hdr?url') &&
  !xiangqiRender.includes('dl.polyhaven.org') &&
  xiangqiBundle.length > 0,
  { hdr: xiangqiHdrs, external: xiangqiRender.includes('dl.polyhaven.org'), bundle: xiangqiBundle.length > 0 });

console.log('\n各遊戲 DCL（秒）：');
for (const [名, v] of Object.entries(差表)) {
  console.log(`  ${名.padEnd(16)} 即刻失敗 ${String(v.即刻失敗).padStart(6)}　吊${吊秒}s ${String(v[`吊${吊秒}s`]).padStart(6)}　差 ${String(v.差).padStart(6)}`);
}
console.log(`\nhub 第三方依賴: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
