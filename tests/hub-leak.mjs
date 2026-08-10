// Hub-wide「玩落去唔會愈嚟愈重」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-leak.mjs
//
// ADR-227 喺 Royale 度捉到：由選單反覆入局，`<head>` 一局積一個攞唔到嘅
// supabase `<script>`——`loadSdk()` 攞唔到會重設個 promise 畀下次再試，
// **但上一次嗰個 element 冇拆走**。GPU 三個數完全平，淨係 DOM 一局爬一個。
//
// 同一個 loader（`shared/js/online_utils.js` 嘅 `loadSupabaseSdk()`）**另外五隻
// 遊戲都用緊**，而嗰把尺淨係 Royale 有。呢度就係補返嗰五隻。
//
// 循環揀「入線上大廳 → 返選單」，唔係求其揀一個掣：
//   1. 佢**真係行過**個 SDK loader（線上大廳先會叫連線層），
//   2. 佢係玩家真係會做嘅嘢（睇下有冇人喺度，冇就返去打人機），
//   3. 佢平又快——唔使打完一場波先量到嘢。
//
// 兩件事要守住，缺一不可：
//   * **DOM 唔准一圈一圈咁爬**（第一圈唔計——第一次入去會起大廳嗰堆嘢）。
//   * **要證明個循環真係行過**。一個入唔到大廳嘅 driver 會報「DOM 完全平」,
//     而嗰個綠係假嘅——**量咗零樣嘢得出嚟嘅綠**，呢個 session 已經撞過三次。
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
  '.json':'application/json', '.glb':'model/gltf-binary', '.png':'image/png', '.jpg':'image/jpeg',
  '.svg':'image/svg+xml', '.webp':'image/webp', '.wasm':'application/wasm', '.woff2':'font/woff2',
  '.m4a':'audio/mp4', '.mp3':'audio/mpeg', '.wav':'audio/wav', '.hdr':'image/vnd.radiance' };
const 可壓 = new Set(['.js', '.mjs', '.css', '.html', '.json', '.svg']);
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  const ext = path.extname(f); let body = fs.readFileSync(f);
  const h = { 'content-type': MIME[ext] ?? 'application/octet-stream' };
  if (可壓.has(ext) && (req.headers['accept-encoding'] ?? '').includes('gzip')) {
    body = zlib.gzipSync(body); h['content-encoding'] = 'gzip';
  }
  h['content-length'] = body.length; res.writeHead(200, h); res.end(body);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const 圈數 = 5;
// `入`／`出` 直接叫遊戲自己嘅全域函數，唔靠撳掣：呢度要嘅唔係「模擬一隻手指」
// （嗰樣 `hub-touch` 守緊），係「行完呢條狀態轉換」。用撳嘅話，一個純粹嘅
// 動畫或者遮罩就會令條 gate 喺同洩漏無關嘅位逾時（ADR-227 撞過）。
const 遊戲 = [
  { 名: 'Gomoku',     url: '/games/gomoku/index.html',
    入: () => window.selectMode('online'), 出: () => window.backToLanding(),
    大廳: '#online-lobby', 選單: '#landing-page' },
  // Snooker 個大廳係 `#snooker-online-lobby`，唔係 `#online-lobby`
  // ——第一版寫錯咗，於是「入到 0/5」但 DOM 完全平：**一個假綠**。
  { 名: 'Snooker',    url: '/games/snooker/index.html',
    入: () => window.selectMode('online'), 出: () => window.backToLanding(),
    大廳: '#snooker-online-lobby', 選單: '#landing-page' },
  { 名: 'Xiangqi AI', url: '/games/xiangqi-ai/dist/index.html',
    入: () => window.selectMode('online'), 出: () => window.backToLanding(),
    大廳: '#online-lobby', 選單: '#landing-page' },
  // Big Two 個全域叫 `setMode`（Dou Dizhu 先係 `setGameMode`）——同一個 repo
  // 入面兩隻幾乎一樣嘅牌類遊戲，全域名唔同。抄嗰隻嘅名落呢隻度就會靜靜雞
  // 乜都唔做，然後報綠。
  { 名: 'Big Two',    url: '/games/big2/index.html',
    入: () => window.setMode('online-lobby'), 出: () => window.setMode('landing'),
    大廳: '#online-lobby', 選單: '#landing-page' },
  { 名: 'Dou Dizhu',  url: '/games/doudizhu/index.html',
    入: () => window.setGameMode('online-lobby'), 出: () => window.setGameMode('landing'),
    大廳: '#online-lobby', 選單: '#landing-page' },
];

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const 見得到 = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return false;
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
  return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
};

const 量 = {};
for (const g of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0].slice(0, 90)));
  try {
    // 第三方全部擋走。**呢個唔係為咗方便，係為咗量到真嘢**：SDK 攞唔到先至會
    // 重試，重試先至會積 element。CDN 通嗰陣個 loader 只會行一次，量唔到呢個病。
    await page.route((u) => !['localhost', '127.0.0.1'].includes(u.hostname),
      (r) => r.abort('connectionfailed').catch(() => {}));
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(2500);

    const 記 = []; let 入到 = 0, 出到 = 0, toast最多 = 0;
    for (let i = 0; i < 圈數; i++) {
      await page.evaluate(g.入).catch(() => {});
      await page.waitForTimeout(700);
      if (await page.evaluate(見得到, g.大廳)) 入到 += 1;
      記.push(await page.evaluate(() => {
        /*
         * **剔走 toast 子樹先數。**
         *
         * 第一版直接數全部節點，Gomoku 同 Xiangqi 報「一圈爬一個」——查落去
         * 爬緊嘅係 `.gh-toast`。第三方擋走咗，所以每圈都會彈一句「連線服務
         * 載入失敗」；一句 toast 顯示 3.5 秒，而我一圈得 1.2 秒，於是量到嘅
         * 係「而家有幾多句提示喺畫面上」，唔係「積咗幾多嘢」。
         * **一條會將一句仲喺度顯示緊嘅提示叫做洩漏嘅 gate 係壞 gate。**
         *
         * 但唔可以就咁當佢唔存在——所以下面另外守住「toast 唔准超過上限」。
         */
        const 全 = document.getElementsByTagName('*').length;
        const c = document.getElementById('gh-toast-container');
        const toast = c ? 1 + c.getElementsByTagName('*').length : 0;
        return 全 - toast;
      }));
      await page.evaluate(g.出).catch(() => {});
      await page.waitForTimeout(500);
      if (await page.evaluate(見得到, g.選單)) 出到 += 1;
      toast最多 = Math.max(toast最多, await page.evaluate(() =>
        document.getElementById('gh-toast-container')?.childElementCount ?? 0));
    }
    量[g.名] = { 記, 入到, 出到, 圈數, toast最多, errs: errs.length };
  } catch (e) {
    量[g.名] = { 掛咗: String(e).split('\n')[0].slice(0, 90) };
  }
  await ctx.close();
}

const 掛 = Object.entries(量).filter(([, v]) => v.掛咗);
check('五隻用共用 SDK loader 嘅遊戲都跑得完', 掛.length === 0,
  掛.length ? Object.fromEntries(掛) : { 隻數: Object.keys(量).length });

// **先證明個循環真係行過。** 入唔到大廳嘅話，下面條 DOM check 一定平——
// 而嗰個平係因為乜都冇做過，唔係因為冇洩漏。
const 冇行到 = Object.entries(量).filter(([, v]) => !v.掛咗 && (v.入到 < v.圈數 || v.出到 < v.圈數));
check(`每隻都真係入到大廳又返到選單（${圈數} 圈）`, 冇行到.length === 0,
  冇行到.length ? Object.fromEntries(冇行到.map(([k, v]) => [k, { 入到: v.入到, 出到: v.出到, 圈數: v.圈數 }]))
    : Object.fromEntries(Object.entries(量).map(([k, v]) => [k, `${v.入到}/${v.圈數}`])));

// 第一圈會起大廳嗰堆 DOM，所以由第二圈起計。
const 爬 = Object.entries(量).filter(([, v]) => !v.掛咗 && new Set(v.記.slice(1)).size !== 1);
check('反覆入大廳再返選單，DOM 唔准一圈一圈咁爬（第 2 圈起）', 爬.length === 0,
  爬.length ? Object.fromEntries(爬.map(([k, v]) => [k, v.記])) : { 圈數 });

// `showOnlineToast` 自己有 `MAX_TOASTS = 5` 嘅上限。呢條唔係守「平」，
// 係守「有上限」——上面剔走咗 toast 子樹，剔走咗就要喺呢度補返一條。
const TOAST上限 = 5;
const 爆toast = Object.entries(量).filter(([, v]) => !v.掛咗 && v.toast最多 > TOAST上限);
check(`提示唔准無上限咁堆（≤ ${TOAST上限} 句）`, 爆toast.length === 0,
  爆toast.length ? Object.fromEntries(爆toast.map(([k, v]) => [k, v.toast最多]))
    : Object.fromEntries(Object.entries(量).map(([k, v]) => [k, v.toast最多])));

console.log('\n各遊戲每圈嘅 DOM 節點數（已剔走 toast）：');
for (const [名, v] of Object.entries(量)) {
  if (v.掛咗) { console.log(`  ${名.padEnd(12)} 掛咗 ${v.掛咗}`); continue; }
  console.log(`  ${名.padEnd(12)} ${JSON.stringify(v.記)}　入到 ${v.入到}/${v.圈數}　error ${v.errs}`);
}
console.log(`\nhub 唔會愈玩愈重: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
