// Hub-wide「等緊嗰陣有冇交代」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-wait.mjs
//
// ADR-203 幫 Tower 講過呢句：撳完之後畫面一個 pixel 都冇變，玩家分唔清
// 「載緊」同「死咗」。嗰把尺淨係量咗一隻遊戲。
//
// 呢度用同一個問題量其餘幾隻重型 3D 遊戲。實測（Fast 3G，390×844）：
//
//     Tower（ADR-203 修過）    載入畫面期間最長靜默  0.0s
//     深淵之橋 MOBA                                23.6s
//     Empire Royale                              14.4s
//
// 兩隻都**有字**——「載入資產…」同「載入模型中…」——但個字十幾廿秒都唔郁。
// 有字唔等於有交代。
//
// 根因唔係冇寫進度，係**進度嘅單位揀錯咗**：兩邊都係 `Promise.all` 平行落
// 十幾個 GLB，而進度用「幾多件落完 / 總共幾多件」計。平行落嘅時候頻寬分薄,
// 冇一件會早早完成，所以個數由 0 一路企到最後先跳去 100。改成量位元組
// （`games/shared/js/byte-progress.mjs`）就逐格郁。
//
// 一條問題：**載入畫面出緊嗰陣，畫面唔可以靜過 N 秒。**
// 靜默只喺「你仲等緊」嗰段先算數——個選單出咗、撳得到之後，畫面靜係啱嘅。
// 呢個界第一次寫嘅時候漏咗，量到 MOBA「靜默 75 秒」，其實佢喺揀英雄畫面
// 度等緊你。**一條分唔開「卡住」同「等你」嘅 gate 係壞 gate。**
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
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
  '.hdr':'image/vnd.radiance', '.wasm':'application/wasm', '.m4a':'audio/mp4', '.mp3':'audio/mpeg',
  '.ogg':'audio/ogg', '.wav':'audio/wav', '.woff2':'font/woff2' };
const 可壓 = new Set(['.js', '.mjs', '.css', '.html', '.json', '.svg']);

// **一定要送 Content-Length。** GitHub Pages 送，而個進度條要靠佢先計到
// 百分比。第一版呢個 server 用 `writeHead` 冇送——Node 就轉咗 chunked，
// `e.total` 變 0，個百分比卡死喺 0%，我差啲以為係產品有病。
// 一把量唔到真實情況嘅尺，講嘅係佢自己。
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  const ext = path.extname(f);
  let body = fs.readFileSync(f);
  const h = { 'content-type': MIME[ext] ?? 'application/octet-stream' };
  if (可壓.has(ext) && (req.headers['accept-encoding'] ?? '').includes('gzip')) {
    body = zlib.gzipSync(body);
    h['content-encoding'] = 'gzip';
  }
  h['content-length'] = body.length;
  res.writeHead(200, h);
  res.end(body);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

// Chrome DevTools 嘅 Fast 3G。揀佢唔係因為 3G 常見，而係因為佢慢到足夠
// 令「等緊」變成一段睇得見嘅時間——量細嘅嘢要放大先量到（同 ADR-203 一樣）。
const 網 = { offline: false, latency: 300, downloadThroughput: 1.6e6 / 8, uploadThroughput: 4e5 / 8 };
const 取樣 = 700;      // ms，一張 JPEG 影完再影嘅節奏
const 睇上限 = 90000;  // ms

// 靜默上限。實測：修好之後 Tower 0.0s、MOBA 0.7s、Royale 0.7s——即係
// 一個取樣間隔以內，等於「每一格都有嘢郁」。未修之前係 23.6s 同 14.4s。
// 3 秒喺兩者中間離得好遠：唔會因為一兩格影相慢咗就報紅，亦都唔會漏咗
// 一個「成十幾秒乜都唔郁」嘅病。
const 靜默上限 = 3.0;

const catalog = new Map(catalogTargetEntries().map((entry) => [entry.id, entry]));
const 目標 = (id) => {
  const entry = catalog.get(id);
  if (!entry) throw new Error(`Missing catalog target: ${id}`);
  return entry;
};

const 遊戲 = [
  { ...目標('tower'), 名: 'Tower Defense（ADR-203 對照）',
    等緊: () => { const b = document.getElementById('start-btn'); return !!b && b.disabled; } },
  { ...目標('moba'),
    等緊: () => { const l = document.getElementById('loading'); return !!l && !l.classList.contains('hidden'); } },
  { ...目標('royale'),
    等緊: () => { const l = document.getElementById('loading'); return !!l && !l.classList.contains('hidden'); } },
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
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', 網);
  let 位元 = 0;
  cdp.on('Network.loadingFinished', (e) => { 位元 += e.encodedDataLength; });
  const t0 = Date.now();
  await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'commit', timeout: 120000 });

  const 幀 = [];
  let 等到幾時 = null;
  while (Date.now() - t0 < 睇上限) {
    const 仲等緊 = await page.evaluate(g.等緊).catch(() => false);
    const buf = await page.screenshot({ type: 'jpeg', quality: 40 }).catch(() => null);
    if (!buf) break;
    幀.push([Date.now() - t0, buf, 仲等緊]);
    if (!仲等緊 && 幀.length > 2) { 等到幾時 = Date.now() - t0; break; }
    await new Promise((r) => setTimeout(r, 取樣));
  }

  // 逐幀比。JPEG 長度唔同就一定有郁；長度一樣就抽樣逐 byte 對。
  let 最長 = 0, 起 = null, 段 = null;
  for (let i = 1; i < 幀.length; i++) {
    if (!幀[i][2]) break;                 // 唔再等緊：之後嘅靜默唔算數
    const a = 幀[i - 1][1], b = 幀[i][1];
    let 差 = Math.abs(a.length - b.length);
    if (差 === 0) { const n = Math.min(a.length, b.length); for (let k = 0; k < n; k += 97) if (a[k] !== b[k]) 差++; }
    const t = 幀[i][0];
    if (差 === 0) { if (起 === null) 起 = 幀[i - 1][0]; }
    else if (起 !== null) { if (t - 起 > 最長) { 最長 = t - 起; 段 = [起, t]; } 起 = null; }
  }
  if (起 !== null && 幀.length) {
    const t = 幀[幀.length - 1][0];
    if (t - 起 > 最長) { 最長 = t - 起; 段 = [起, t]; }
  }
  量[g.名] = {
    落: `${Math.round(位元 / 1024)} KB`,
    等咗: 等到幾時 === null ? '>90s' : `${(等到幾時 / 1000).toFixed(1)}s`,
    最長靜默: +(最長 / 1000).toFixed(1),
    段: 段 ? `${(段[0] / 1000).toFixed(1)}→${(段[1] / 1000).toFixed(1)}s` : '',
    幀: 幀.length,
  };
  await ctx.close();
}

const 超標 = Object.entries(量).filter(([, v]) => v.最長靜默 > 靜默上限);
check(`載入畫面出緊嗰陣，畫面唔可以靜過 ${靜默上限} 秒（Fast 3G）`,
  超標.length === 0, 超標.length ? Object.fromEntries(超標) : { 上限: 靜默上限 });

console.log('\n各遊戲：');
for (const [名, v] of Object.entries(量)) {
  console.log(`  ${名.padEnd(26)} 落 ${String(v.落).padStart(8)}　等咗 ${String(v.等咗).padStart(6)}　`
    + `最長靜默 ${String(v.最長靜默).padStart(5)}s ${v.段}`);
}
console.log(`\nhub 等緊交代: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
