// Hub-wide「玩完之後，你嘅成果有冇留低」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-progress.mjs
//
// 上一次用 generic 掃法（開場撳幾下再睇 `localStorage`）掃到九隻「玩完一個字
// 都冇寫低」，差啲當咗係九個病。查落 Neon Snake 其實有成套 profile／高分系統,
// 淨係喺 game over 先寫——**掃唔夠，唔係佢冇記**。
//
// 所以呢把尺逐隻寫 driver，而且每隻都要**先證明去到「有嘢值得記」嗰一刻**
// （開咗波／死咗／入咗場），先至去睇有冇留低。冇呢個對照，一隻根本未開始
// 玩嘅遊戲會扮到「冇嘢好記」，而條 check 會綠得好安詳。
//
// ── 五隻都喺度，但每隻「值得記」嗰一刻都唔同 ─────────────────
// 開咗波（Tower）／死咗（Snake）／入咗場（MOBA）／一場波打完（Royale）／
// 跑完一圈（Racing Car）。**冇一條通用路徑**，所以 driver 同憑據都逐隻寫。
//
// 兩隻要「造」返嗰一刻，但兩隻都係**推遊戲自己條路**，唔係喺測試度抄一次：
//   · Royale：塞張火球 ＋ 敵方王塔剩一滴血 ＋ `playCard`（`match.mjs` 老早有）;
//   · Racing Car：推一個圈速入 `race.lapTimes`，跟住 `updateGhost()` 自己會
//     `commit` → `saveGhost`。直接喺測試度叫 `commit()` 就變成自己驗自己。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { 遊戲 } = await import('./lib/drivers.mjs');
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

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

// driver 抽咗去 `tests/lib/drivers.mjs`，因為 `hub-tabs.mjs` 要行同一條路。

const 量 = {};
for (const g of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(3000);
    await g.玩(page);
    const 到咗 = await page.evaluate(g.到咗).catch(() => false);
    const 玩完 = await page.evaluate(g.憑據).catch(() => null);
    /*
     * **一個冇人知嘅 Continue，同冇 Continue 分別唔大。**
     *
     * 打到一半撳「返回選單」——嗰一刻就係遊戲同你講「你嗰局仲喺度」嘅唯一
     * 機會。個掣要即刻出返，唔可以等你下次開頁先發現。
     *
     * （實測捉到：Big Two 本來冇接呢條線——撳完「退出對局」個掣唔出，
     *   玩家會以為局冇咗。其餘三隻同款遊戲都有，得佢一隻漏咗。）
     *
     * Tower **特登唔掃**：佢個 Home 掣係直接離開個頁去 hub，冇「返自己選單」
     * 呢條路；佢返嚟嗰陣個 `#continue-run` 由 `tower/tests/flow.mjs` 守住。
     */
    let 走完見到掣 = null;
    if (g.離 && g.繼續掣) {
      try {
        await page.click(g.離, { timeout: 20000 });
        await page.waitForTimeout(1200);
        走完見到掣 = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return { 冇個掣: true };
          const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
          return { 見得到: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 };
        }, g.繼續掣);
      } catch (e) { 走完見到掣 = { 撳唔到: String(e).split('\n')[0].slice(0, 70) }; }
    }

    // reload：真係留低咗，唔係得個記憶體副本
    await page.reload({ waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(3500);
    const 返嚟 = await page.evaluate(g.憑據).catch(() => null);
    /*
     * **「留得住」唔等於「返得到」。** 一個續唔返嘅存檔，對玩家嚟講同冇存
     * 冇分別——佢見到嘅係「我上一局去咗邊」。所以有 Continue 嗰啲遊戲要
     * 再行多一步：真係撳落去，再問局有冇開返。
     */
    let 續到 = null;
    if (g.續) {
      try {
        await g.續(page);
        續到 = await page.evaluate(g.續驗).catch(() => null);
      } catch (e) { 續到 = { 撳唔到: String(e).split('\n')[0].slice(0, 70) }; }
    }
    量[g.名] = { 到咗, 玩完: 玩完 ?? '（冇）', 返嚟: 返嚟 ?? '（冇）',
      ...(g.離 ? { 走完見到掣 } : {}), ...(g.續 ? { 續到 } : {}) };
  } catch (e) {
    量[g.名] = { 掛咗: String(e).split('\n')[0].slice(0, 110) };
  }
  await ctx.close();
}

// **「真係去到有嘢值得記嗰一刻」係一個對照。** 冇佢嘅話，一隻根本未開始玩嘅
// 遊戲會扮到「冇嘢好記」，而下面條 check 會綠得好安詳。
const 未到 = Object.entries(量).filter(([, v]) => v.掛咗 || v.到咗 !== true);
check('每隻都真係玩到「有嘢值得記」嗰一刻（開咗波／死咗／入咗場）',
  未到.length === 0, 未到.length ? Object.fromEntries(未到) : { 驗過: Object.keys(量) });

const 冇留低 = Object.entries(量).filter(([, v]) => v.掛咗 || v.返嚟 === '（冇）');
check('玩完之後成果要留得住（reload 返嚟仲喺度）', 冇留低.length === 0,
  冇留低.length ? Object.fromEntries(冇留低) : Object.fromEntries(
    Object.entries(量).map(([k, v]) => [k, v.返嚟])));

// 有 Continue 嘅遊戲：撳落去要真係開返局（狀態同畫面都要）
/*
 * 四樣一齊問，四樣都要真：畫面切到局中、**遊戲自己嘅狀態等於存檔**（唔係
 * 「存檔仲喺度」）、局面真係有嘢、而且**畫得出嚟**。
 *
 * 欄名逐隻遊戲統一（`畫面/對得上/量/畫面證據`）——第一版逐隻用自己嘅名
 * （`盤上幾多隻`／`手牌張數`…），加到第三隻就撞線：Big Two 冇 `盤上幾多隻`,
 * `undefined > 0` 係 false，明明啱嘅都報紅。**一條要跟住遊戲改名嘅 check,
 * 每加一隻遊戲就要改一次，遲早有一次改漏。**
 */
const 續唔返 = Object.entries(量).filter(([, v]) => '續到' in v
  && !(v.續到 && v.續到.畫面 === true && v.續到.對得上 === true
       && v.續到.量 > 0 && v.續到.畫面證據 > 0));
check('有 Continue 嘅，撳落去要真係開返上一局（唔係得個存檔）', 續唔返.length === 0,
  續唔返.length ? Object.fromEntries(續唔返) : Object.fromEntries(
    Object.entries(量).filter(([, v]) => '續到' in v).map(([k, v]) => [k, v.續到])));

const 走咗唔見掣 = Object.entries(量).filter(([, v]) => '走完見到掣' in v
  && !(v.走完見到掣 && v.走完見到掣.見得到 === true));
check('打到一半返選單，「繼續上一局」要即刻見到（唔使等下次開頁）',
  走咗唔見掣.length === 0, 走咗唔見掣.length ? Object.fromEntries(走咗唔見掣)
    : Object.fromEntries(Object.entries(量).filter(([, v]) => '走完見到掣' in v)
        .map(([k]) => [k, '見到'])));

console.log('\n各遊戲：');
for (const [名, v] of Object.entries(量)) {
  console.log(`  ${名.padEnd(16)} ${v.掛咗 ?? `到咗 ${v.到咗}　玩完 ${JSON.stringify(v.玩完)}　reload 後 ${JSON.stringify(v.返嚟)}`}`);
}
console.log(`\nhub 進度記憶: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
