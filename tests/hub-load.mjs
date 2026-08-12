// Hub-wide load weight.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-load.mjs
//
// ADR-203 喺 Tower 度量過：要落 1,860 KB 先至打得，Slow 3G 撳完 START 等 23.7 秒。
// 嗰把尺同樣淨係量咗一隻遊戲。呢度掃成個 hub。
//
// **量嘅係瀏覽器實際落咗幾多，唔係磁碟上面有幾大。** 磁碟上面 Snooker 有 27 MB，
// 但入面可能大部分係冇 reference 到嘅資產、或者 vendored 源碼——
// 落唔落到玩家部電話度，係兩件事。
import http from 'node:http';
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { catalogTargets } from './lib/catalog-targets.mjs';

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
  '.m4a':'audio/mp4', '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wav':'audio/wav', '.woff2':'font/woff2' };

const 遊戲 = catalogTargets({ includeHub: true });

// 實測十二個介面之後定嘅兩條線（唔係拍腦袋——第一版我寫 5 MB，
// 一個都捉唔到，即係嗰條線根本分唔開任何嘢）：
//
//   • **開場畫面 4 MB**：實測最重係 MOBA 3.4 MB，其餘全部 1.9 MB 以下。
//     4 MB 高過現況一截，但唔會再容得落多一個 MOBA 級數嘅新增。
//   • **圖唔可以大過佢最大顯示尺寸嘅 3 倍**（已計 DPR 2，即係實質 1.5 倍頭位）。
//     呢條先係真正捉到嘢嗰條：hub 兩個 logo 大咗 12 倍同 20 倍，
//     每個玩家一入嚟就要落 847K 去畫兩個 52×52 嘅 icon。
//     **量「重量」捉唔到佢，因為 904 KB 本身唔算誇張；量「倍數」先捉到。**
const 上限KB = 4 * 1024;
const 圖倍上限 = 3;

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
// GitHub Pages 會 gzip 文字資產（.js/.css/.html/.json/.svg），唔會 gzip
// .glb／.wasm／圖。呢個 server 唔照做嘅話，量到嘅 .js 大細係假嘅——
// Tower 個 bundle 實際落 202 KB，唔 gzip 就報 823 KB，差成四倍。
// **一把量唔到真實情況嘅尺，講嘅係佢自己。**
// 順帶要送 `content-length`：`writeHead` 之後 Node 會轉 chunked，
// 而瀏覽器嘅載入進度（`e.total`）就會變 0。
const 可壓 = new Set(['.js', '.mjs', '.css', '.html', '.json', '.svg']);
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

const 量 = {};
for (const [名, url] of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  let bytes = 0; const 類 = {}; const 請求 = new Map(); const glb = new Map();
  cdp.on('Network.requestWillBeSent', (e) => 請求.set(e.requestId, e.request.url));
  cdp.on('Network.loadingFinished', (e) => {
    bytes += e.encodedDataLength;
    const u2 = 請求.get(e.requestId) ?? '';
    let ext = '(其他)';
    try { ext = path.extname(new URL(u2).pathname) || '(html)'; } catch { /* data: URI 等 */ }
    類[ext] = (類[ext] ?? 0) + e.encodedDataLength;
    if (ext === '.glb' || ext === '.gltf') glb.set(u2, e.encodedDataLength);
  });
  const t0 = Date.now();
  await page.goto(`http://localhost:${port}${encodeURI(url)}`, { waitUntil: 'load', timeout: 120000 });
  // 靜下來為止：連續 1.5 秒冇新嘢落到，就當開場畫面落齊。
  let 上次 = -1;
  for (let i = 0; i < 40 && 上次 !== bytes; i += 1) { 上次 = bytes; await page.waitForTimeout(1500); }
  /*
   * **倍數要對住「佢最大會顯示到幾大」嚟計，唔係對住其中一個 viewport。**
   *
   * 一張圖同時服務手機同桌面，就一定要夠大先夠桌面用。我第一版淨係喺
   * 390×844 度量，160×160 嘅 icon 喺手機顯示 52 就讀到 3.1 倍報紅——
   * 但同一張圖喺桌面顯示 72，DPR 2 之下要 144，160 係啱嘅。
   * 對住最細嗰個 viewport 計倍數，等於叫人服務唔到大螢幕。
   * 所以兩個 viewport 都量，每張圖取**最大**顯示尺寸。
   */
  const 量圖 = () => page.evaluate(() => [...document.querySelectorAll('img')].map((im) => {
    const r = im.getBoundingClientRect();
    return { src: (im.currentSrc || im.src).split('/').pop().split('?')[0],
      原寬: im.naturalWidth, 原: `${im.naturalWidth}×${im.naturalHeight}`, 顯寬: Math.round(r.width) };
  }));
  const 手機圖 = await 量圖();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(400);
  const 桌面圖 = await 量圖();
  const 最大 = new Map();
  for (const g of [...手機圖, ...桌面圖]) {
    const 舊 = 最大.get(g.src);
    if (!舊 || g.顯寬 > 舊.顯寬) 最大.set(g.src, g);
  }
  const 過大圖 = [...最大.values()]
    .filter((g) => g.顯寬 > 0 && g.原寬 / g.顯寬 > 圖倍上限)
    .map((g) => ({ src: g.src, 原: g.原, 最大顯示: g.顯寬, 倍: +(g.原寬 / g.顯寬).toFixed(1) }));
  /*
   * 幾何壓縮：**同一個 repo 入面已經有嘅做法，唔應該有一隻遊戲冇跟。**
   *
   * MOBA 同 Empire Royale 一路都用緊 Draco（KHR_draco_mesh_compression）,
   * 但 Tower 嗰 78 個 GLB 從來冇壓過——開場 1,087 KB 淨係模型。壓完
   * 1,183 → 379 KB，成隻遊戲 1,291 → 754 KB。
   *
   * 呢度唔靠 grep build script（build script 改咗名就守唔到），而係
   * **睇真正派出去嗰個檔嘅 glTF header 有冇聲明壓縮擴充**。
   */
  const 未壓 = [];
  let glb總 = 0;
  for (const [u2, n] of glb) {
    glb總 += n;
    try {
      const f2 = path.join(ROOT, decodeURIComponent(new URL(u2).pathname).split('?')[0]);
      if (!fs.existsSync(f2)) continue;
      const buf = fs.readFileSync(f2);
      // GLB：12 byte header，跟住第一個 chunk 就係 JSON
      const jsonLen = buf.readUInt32LE(12);
      const meta = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
      const 用咗 = [...(meta.extensionsUsed ?? []), ...(meta.extensionsRequired ?? [])];
      const 壓過 = 用咗.some((x) => x === 'KHR_draco_mesh_compression' || x === 'EXT_meshopt_compression');
      // 純動畫檔冇 mesh，壓縮擴充對佢冇意義——唔可以當佢係漏網。
      const 有幾何 = (meta.meshes ?? []).length > 0;
      if (有幾何 && !壓過) 未壓.push({ 檔: u2.split('/').pop().split('?')[0], KB: Math.round(n / 1024) });
    } catch { /* 讀唔到就唔當佢係證據 */ }
  }
  量[名] = {
    KB: Math.round(bytes / 1024),
    glbKB: Math.round(glb總 / 1024),
    未壓,
    過大圖,
    秒: +((Date.now() - t0) / 1000).toFixed(1),
    大頭: Object.entries(類).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([k, v]) => `${k} ${Math.round(v / 1024)}K`),
  };
  await ctx.close();
}

const 超重 = Object.entries(量).filter(([, v]) => v.KB > 上限KB);
check(`冇一個開場畫面要落多過 ${上限KB / 1024} MB`, 超重.length === 0,
  Object.fromEntries(超重.map(([k, v]) => [k, { MB: +(v.KB / 1024).toFixed(1), 大頭: v.大頭 }])));

// 幾百 KB 以下嘅模型，加個 decoder 落去隨時仲蝕本（Draco decoder 自己
// 246 KB）。所以呢條線淨係守「模型多到值得壓」嗰啲。實測：Tower 未壓
// 之前 1,087 KB、MOBA 1,997 KB、Royale 1,343 KB，而 Racing Car 216 KB
// ——300 KB 喺兩堆之間，離兩邊都遠。
const GLB壓縮線KB = 300;
const 冇壓 = Object.entries(量)
  .filter(([, v]) => v.glbKB > GLB壓縮線KB && (v.未壓 ?? []).length > 0);
check(`GLB 落多過 ${GLB壓縮線KB} KB 嘅遊戲，啲有幾何嘅模型要壓過（Draco／meshopt）`,
  冇壓.length === 0,
  冇壓.length
    ? Object.fromEntries(冇壓.map(([k, v]) => [k, { glbKB: v.glbKB, 未壓個數: v.未壓.length, 頭三個: v.未壓.slice(0, 3) }]))
    : Object.fromEntries(Object.entries(量).filter(([, v]) => v.glbKB > GLB壓縮線KB).map(([k, v]) => [k, `${v.glbKB} KB 全部壓過`])));

const 有大圖 = Object.entries(量).filter(([, v]) => (v.過大圖 ?? []).length > 0);
check(`冇一張圖大過佢**最大**顯示尺寸嘅 ${圖倍上限} 倍（DPR 2 已經計咗喺入面）`,
  有大圖.length === 0,
  Object.fromEntries(有大圖.map(([k, v]) => [k, v.過大圖])));

console.log('\n各遊戲開場畫面實際落嘅嘢（由重到輕）：');
for (const [k, v] of Object.entries(量).sort((a, b) => b[1].KB - a[1].KB)) {
  console.log(`  ${k.padEnd(16)} ${String(v.KB).padStart(6)} KB  ${String(v.秒).padStart(5)}s  ${v.大頭.join('  ')}`);
}
console.log(`\nhub 載入重量: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
