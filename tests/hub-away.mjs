// Hub-wide「你切走咗，隻遊戲有冇繼續打」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-away.mjs
//
// Tower 老早就守住咗呢條（背景自動暫停、講明點解、而且返嚟唔會偷偷續）。
// 其餘幾隻即時制從來冇人用同一把尺量過。一 grep 就知點解：
// **成個 repo 得 Tower 同 Racing Car 有 `visibilitychange` handler。**
//
// 實測（隱藏六秒）：
//
//     深淵之橋 MOBA    `__sim.time`        2.8 → 11.4   （＋8.6 秒）
//     Empire Royale   `__royale.game.time` 176.5 → 169.0（−7.5 秒，倒數）
//
// 即係你切去覆個訊息，場波照打。MOBA 一場十六分鐘，返嚟就發現送咗一血。
//
// 量法有兩個位要企穩：
//
// 1. **`bringToFront` 喺 headless 之下唔會令個頁隱藏**（第一版量到
//    `document.hidden === false`，即係成個量度冇量過任何嘢）。改用 override
//    `document.hidden`／`visibilityState` 再派 `visibilitychange`——同 Tower
//    自己條 gate（`games/tower/tests/flow.mjs` 嘅 `setVisibility`）一模一樣。
//    而且要試嘅本來就係隻遊戲對呢個事件嘅反應，唔係瀏覽器對背景 tab 嘅節流。
//
// 2. **「隱藏期間畫面有冇郁」分唔開停冇停。** Tower 真係停咗，但佢個暫停畫面
//    自己會呼吸，所以照樣報「有郁」。要量「模擬有冇行」就要一個模擬自己數嘅
//    數——所以逐隻遊戲寫明個鐘讀邊個 seam，冇 seam 就唔好扮量到。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
  '.hdr':'image/vnd.radiance', '.wasm':'application/wasm', '.m4a':'audio/mp4', '.mp3':'audio/mpeg',
  '.ogg':'audio/ogg', '.wav':'audio/wav', '.woff2':'font/woff2' };
const 可壓 = new Set(['.js', '.mjs', '.css', '.html', '.json', '.svg']);
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  const ext = path.extname(f);
  let body = fs.readFileSync(f);
  const h = { 'content-type': MIME[ext] ?? 'application/octet-stream' };
  if (可壓.has(ext) && (req.headers['accept-encoding'] ?? '').includes('gzip')) {
    body = zlib.gzipSync(body); h['content-encoding'] = 'gzip';
  }
  h['content-length'] = body.length;
  res.writeHead(200, h); res.end(body);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const 隱藏秒 = 6;
// 場鐘喺隱藏期間可以行幾多。停咗嘅話係**實實在在嘅 0**（兩次讀同一個數），
// 而未修之前係 8.6 同 7.5 秒。0.5 喺兩者中間，離兩邊都好遠。
const 容許 = 0.5;

const 遊戲 = [
  {
    名: 'Tower Defense（對照）', url: '/games/tower/dist/index.html',
    入局: async (p) => { await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__TD?.開波次數?.() > 0, null, { timeout: 240000 }); },
    // gold＋wave＋場上敵人數：任何一樣行過都代表模擬行緊
    鐘: () => { const s = window.__TD?.state;
      return s ? (s.enemies?.length ?? 0) + (s.wave ?? 0) * 1000 + Math.round(s.gold ?? 0) : null; },
  },
  {
    名: '深淵之橋 MOBA', url: '/games/moba/index.html',
    入局: async (p) => {
      await p.waitForSelector('#pick-grid .pick-card', { timeout: 240000 });
      await p.click('#pick-grid .pick-card');
      await p.click('#pick-go', { timeout: 60000 });
      await p.waitForFunction(() => window.__mobaReady === true, null, { timeout: 180000 });
    },
    鐘: () => window.__sim?.time ?? null,
  },
  {
    名: 'Empire Royale', url: '/games/royale/index.html',
    入局: async (p) => {
      await p.getByText(/⚔️ 對戰/).first().click({ timeout: 60000 });
      await p.waitForTimeout(600);
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__royale?.game, null, { timeout: 180000 });
      // 開場有教學遮罩，而遮罩開住嗰陣模擬係**特登凍結**嘅——唔略過就會量到
      // 「個鐘唔郁」，然後以為隻遊戲已經識停。
      await p.click('#tutorial-skip', { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(4000);
    },
    鐘: () => window.__royale?.game?.time ?? null,
  },
];

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const 量 = {};
for (const g of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(2500);
    await g.入局(page);
    await page.waitForTimeout(2500);

    const 設隱藏 = (h) => page.evaluate((hidden) => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: hidden ? 'hidden' : 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
    }, h);

    await 設隱藏(true);
    const 真隱藏 = await page.evaluate(() => document.hidden);
    // **隱藏之後先讀第一個數。** 讀完再隱藏嘅話，中間影相／evaluate 嗰一兩秒
    // 都會計落個差度，一個真係識停嘅遊戲都會報「行咗 1.7 秒」。
    await page.waitForTimeout(1200);
    const 頭 = await page.evaluate(g.鐘).catch(() => null);
    await page.waitForTimeout(隱藏秒 * 1000);
    const 尾 = await page.evaluate(g.鐘).catch(() => null);
    await 設隱藏(false);
    await page.waitForTimeout(1000);
    const 返嚟 = await page.evaluate(g.鐘).catch(() => null);

    量[g.名] = {
      真隱藏,
      頭, 尾, 返嚟,
      隱藏期間行咗: (頭 === null || 尾 === null) ? null : +Math.abs(尾 - 頭).toFixed(2),
    };
  } catch (e) {
    量[g.名] = { 掛咗: String(e).split('\n')[0].slice(0, 110) };
  }
  await ctx.close();
}

// 讀唔到鐘＝量唔到，而**量唔到要報紅，唔係報綠**。
const 冇量到 = Object.entries(量).filter(([, v]) => v.掛咗 || v.真隱藏 !== true || v.隱藏期間行咗 === null);
check('三個場鐘都讀得到，而且個頁真係隱藏得到', 冇量到.length === 0,
  冇量到.length ? Object.fromEntries(冇量到) : { 驗過: Object.keys(量) });

const 照跑 = Object.entries(量).filter(([, v]) => (v.隱藏期間行咗 ?? 0) > 容許);
check(`切走咗嘅時候，場鐘唔可以行（隱藏 ${隱藏秒} 秒，容許 ${容許}）`,
  照跑.length === 0, 照跑.length ? Object.fromEntries(照跑) : { 容許 });

console.log('\n各遊戲：');
for (const [名, v] of Object.entries(量)) {
  console.log(`  ${名.padEnd(20)} ${v.掛咗 ?? `隱藏中 ${v.頭} → ${v.尾}　行咗 ${v.隱藏期間行咗}　返嚟 ${v.返嚟}`}`);
}
console.log(`\nhub 切走: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
