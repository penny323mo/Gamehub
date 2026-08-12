// Hub-wide「儲存唔到都要玩得到」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-storage.mjs
//
// 三種真實情況會令 `localStorage` 唔用得：
//   - Safari 無痕：`getItem` 用得，但 `setItem` 掟 QuotaExceededError；
//   - 封咗 cookie／第三方 storage：連 `window.localStorage` 呢個 getter 都掟
//     SecurityError，即係「摸都摸唔到」；
//   - 儲存空間滿：`setItem` 掟 QuotaExceededError。
//
// 呢個 repo 有三十幾處 `setItem`，散落六個唔同 codebase，而**冇一個介面驗過
// 呢件事**。第一次量（把兩個 storage 都換成會掟嘢嘅版本）：
//
//     Racing Car 3D   見得到嘅控制 51 → 0     ← 完全開唔到
//     Neon Snake                    1 → 0     ← 完全開唔到
//     Gomoku／Snooker／Empire Royale／Xiangqi AI   仲開得，但各掟一個錯
//     其餘六個                                      冇事
//
// 即係 Safari 無痕、封咗 cookie、或者空間滿嘅玩家，有兩隻遊戲係**開都開唔到**。
//
// 修法唔係逐個 `setItem` 包 try（三十幾個位，下次加新碼又漏），而係喺任何
// 遊戲碼之前擺一個 `games/shared/js/safe-storage.js`：摸得到又寫得到就乜都
// 唔郁，摸唔到或者寫唔到就換個記憶體版落去（讀嗰邊 read-through，無痕模式下
// 舊存檔仲讀得返）。**要改嘅係枱面，唔係每一次落枱。**
//
// 兩條問題：
//   1. storage 封住之後，見得到嘅控制唔可以少過正常嗰陣。
//   2. storage 封住之後，唔可以多咗 browser error。
//
// 兩條都同「正常嗰陣」比，唔用寫死嘅數——一隻遊戲改咗版面，呢把尺唔應該
// 因為咁而報紅。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
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

// 連 getter 都換走——比「淨係 setItem 掟嘢」更狠，亦都更貼近「封咗 cookie」
// 嗰種真實情況。守得住呢個，就一定守得住無痕模式嗰種。
const 封存 = `
(function () {
  const err = () => { const e = new Error('The operation is insecure.'); e.name = 'SecurityError'; throw e; };
  const 假 = { getItem: err, setItem: err, removeItem: err, clear: err, key: err, get length() { return err(); } };
  try { Object.defineProperty(window, 'localStorage', { get: () => 假, configurable: true }); } catch (e) {}
  try { Object.defineProperty(window, 'sessionStorage', { get: () => 假, configurable: true }); } catch (e) {}
}());
`;

const 遊戲 = catalogTargets({ includeHub: true });

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const 跑 = async (url, 封) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  if (封) await page.addInitScript(封存);
  const err = [];
  page.on('pageerror', (e) => err.push(`${e.name ?? ''}: ${e.message}`.split('\n')[0].slice(0, 90)));
  // 「Failed to load resource」係網絡層嘅嘢，同 storage 冇關——呢度唔數佢,
  // 否則一個 favicon 404 就會令兩邊個數唔同。
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) err.push('console: ' + m.text().slice(0, 90));
  });
  let 控制 = 0;
  try {
    await page.goto(`http://localhost:${port}${encodeURI(url)}`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(6000);
    控制 = await page.evaluate(() => [...document.querySelectorAll('button, [role="button"], a[href]')]
      .filter((el) => {
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        return r.width > 8 && r.height > 8 && cs.display !== 'none' && cs.visibility !== 'hidden';
      }).length);
  } catch (e) { err.push('掛咗: ' + String(e).split('\n')[0].slice(0, 70)); }
  await ctx.close();
  return { 控制, err: [...new Set(err)] };
};

const 量 = {};
for (const [名, url] of 遊戲) {
  const 正常 = await 跑(url, false);
  const 封住 = await 跑(url, true);
  量[名] = {
    正常控制: 正常.控制, 封存控制: 封住.控制,
    正常錯: 正常.err.length, 封存錯: 封住.err.length,
    新錯: 封住.err.filter((e) => !正常.err.includes(e)).slice(0, 3),
  };
}

const 冇咗控制 = Object.entries(量).filter(([, v]) => v.封存控制 < v.正常控制);
check('storage 封住之後，見得到嘅控制唔可以少過正常嗰陣', 冇咗控制.length === 0,
  冇咗控制.length
    ? Object.fromEntries(冇咗控制.map(([k, v]) => [k, `${v.正常控制} → ${v.封存控制}`]))
    : { 驗過: 遊戲.length });

const 多咗錯 = Object.entries(量).filter(([, v]) => v.封存錯 > v.正常錯);
check('storage 封住之後，唔可以多咗 browser error', 多咗錯.length === 0,
  多咗錯.length
    ? Object.fromEntries(多咗錯.map(([k, v]) => [k, v.新錯]))
    : { 驗過: 遊戲.length });

console.log('\n各遊戲（正常 → 封存）：');
for (const [名, v] of Object.entries(量)) {
  console.log(`  ${名.padEnd(15)} 控制 ${String(v.正常控制).padStart(3)} → ${String(v.封存控制).padStart(3)}　`
    + `error ${v.正常錯} → ${v.封存錯}`);
}
console.log(`\nhub 儲存韌性: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
