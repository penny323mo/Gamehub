// Hub-wide 聲音契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-audio.mjs
//
// 兩條問題，兩條都係「玩家真係感受到」嗰種：
//
// 1. **開得到聲。** 瀏覽器嘅 autoplay policy：未有過用戶手勢之前，`AudioContext`
//    一 new 出嚟就係 `suspended`，而且**唔會自己 resume**。遊戲如果喺載入嗰陣
//    就 new 咗個 context，之後淨係 `.play()` 而唔 `.resume()`，就會由頭到尾冇聲
//    ——而且畫面上一個錯都唔會有。**呢條實測全部本來就啱**（五隻有聲嘅遊戲
//    全部係第一下手勢先 new，而且即刻係 `running`），寫落嚟係為咗守住。
//
// 2. **撳咗靜音要記得住。** Empire Royale 個 `muted` 本來係一個 module-level
//    `let muted = false`，一個字都冇存——你每次入嚟都要重新撳一次。同一個 repo
//    入面 Racing Car 記得住，即係呢個唔係大家嘅共識，係漏咗一個。
//
// 唔可以開 `--autoplay-policy=no-user-gesture-required`：咁樣就等於喺一個冇
// autoplay policy 嘅世界度量，而真手機一定有。用預設。
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

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const 新頁 = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  return [ctx, await ctx.newPage()];
};

// ── 1. 開得到聲 ────────────────────────────────────────────────────
// 喺頁面碼行之前包住 AudioContext，記低每一個 new 出嚟嘅 context 同佢嘅狀態。
const 監聽 = `
(() => {
  const 記 = [];
  window.__audioCtxs = 記;
  for (const 名 of ['AudioContext', 'webkitAudioContext']) {
    const 原 = window[名];
    if (!原) continue;
    window[名] = new Proxy(原, { construct(t, a) { const c = new t(...a); 記.push(c); return c; } });
  }
})();
`;
const 有聲遊戲 = [
  ['Tower Defense', '/games/tower/dist/index.html', '#start-btn'],
  ['深淵之橋 MOBA', '/games/moba/index.html', null],
  ['Empire Royale', '/games/royale/index.html', null],
  ['Neon Snake', '/games/snake-game/dist/index.html', null],
  ['Racing Car 3D', '/games/Racing Car/index.html', '#start-btn'],
];
const 聲量 = {};
for (const [名, url, 掣] of 有聲遊戲) {
  const [ctx, page] = await 新頁();
  await page.addInitScript(監聽);
  try {
    await page.goto(`http://localhost:${port}${encodeURI(url)}`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(4000);
    const 讀 = () => (window.__audioCtxs ?? []).map((c) => c.state);
    const 開場 = await page.evaluate(讀);
    if (掣) await page.click(掣, { timeout: 30000 }).catch(() => {});
    else await page.mouse.click(195, 500).catch(() => {});
    await page.waitForTimeout(2500);
    await page.mouse.click(195, 420).catch(() => {});
    await page.keyboard.press('Space').catch(() => {});
    await page.waitForTimeout(2500);
    const 玩咗 = await page.evaluate(讀);
    聲量[名] = { 開場, 玩咗 };
  } catch (e) { 聲量[名] = { 掛咗: String(e).split('\n')[0].slice(0, 100) }; }
  await ctx.close();
}
// 壞法係：手勢之後仲有 context 卡喺 suspended（＝由頭到尾冇聲，而且唔會報錯）。
const 冇聲 = Object.entries(聲量).filter(([, v]) => v.掛咗 || v.玩咗.includes('suspended'));
check('撳咗第一下之後，唔可以仲有 AudioContext 卡喺 suspended（＝由頭到尾冇聲）',
  冇聲.length === 0, 冇聲.length ? Object.fromEntries(冇聲) : 聲量);

// ── 2. 靜音要記得住 ────────────────────────────────────────────────
const 靜音遊戲 = [
  {
    名: 'Empire Royale', url: '/games/royale/index.html', 掣: '#mute-btn',
    // 個靜音掣喺局內 HUD，唔喺開場畫面。第一版就係喺開場畫面撳——撳唔到，
    // 於是「撳完」同「reload 後」兩個讀數一樣，**扮到「記得」**。
    入局: async (p) => {
      await p.getByText(/⚔️ 對戰/).first().click({ timeout: 60000 });
      await p.waitForTimeout(600);
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__royale?.game, null, { timeout: 180000 });
      await p.click('#tutorial-skip', { timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(2000);
    },
    讀: () => (document.getElementById('mute-btn')?.textContent ?? '(冇)').trim(),
  },
  {
    名: 'Racing Car 3D', url: '/games/Racing Car/index.html', 掣: '[data-audio="0"]',
    讀: () => document.querySelector('[data-audio="0"]')?.classList.contains('on') ? '靜音' : '有聲',
  },
];
const 靜音量 = {};
for (const g of 靜音遊戲) {
  const [ctx, page] = await 新頁();
  try {
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(4000);
    if (g.入局) await g.入局(page);
    const 前 = await page.evaluate(g.讀);
    await page.click(g.掣, { timeout: 30000 });
    await page.waitForTimeout(800);
    const 撳完 = await page.evaluate(g.讀);
    await page.reload({ waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(4000);
    if (g.入局) await g.入局(page);
    const 返嚟 = await page.evaluate(g.讀);
    靜音量[g.名] = { 前, 撳完, 返嚟, 真撳到: 前 !== 撳完, 記得: 撳完 === 返嚟 };
  } catch (e) { 靜音量[g.名] = { 掛咗: String(e).split('\n')[0].slice(0, 100) }; }
  await ctx.close();
}
// **「撳咗之後個狀態真係變咗」係一個對照。** 冇佢嘅話，一個撳唔到嘅掣
// 會令「撳完」同「reload 後」讀數一樣，然後扮到「記得」——第一版就係咁。
const 撳唔到 = Object.entries(靜音量).filter(([, v]) => v.掛咗 || v.真撳到 !== true);
check('撳靜音之前先要證明個掣真係撳到（撳唔到嘅掣會扮到「記得」）',
  撳唔到.length === 0, 撳唔到.length ? Object.fromEntries(撳唔到) : 靜音量);

const 唔記得 = Object.entries(靜音量).filter(([, v]) => !v.掛咗 && v.記得 !== true);
check('撳咗靜音，reload 返嚟仲要係靜音', 唔記得.length === 0,
  唔記得.length ? Object.fromEntries(唔記得) : { 驗過: Object.keys(靜音量) });

console.log('\nAudioContext 狀態：');
for (const [名, v] of Object.entries(聲量)) {
  console.log(`  ${名.padEnd(15)} ${v.掛咗 ?? `開場 [${v.開場.join(',') || '—'}]　玩咗 [${v.玩咗.join(',') || '—'}]`}`);
}
console.log('靜音記憶：');
for (const [名, v] of Object.entries(靜音量)) {
  console.log(`  ${名.padEnd(15)} ${v.掛咗 ?? `${v.前} → ${v.撳完} → reload ${v.返嚟}`}`);
}
console.log(`\nhub 聲音: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
