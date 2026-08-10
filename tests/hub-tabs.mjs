// Hub-wide「同一部機開兩個 tab」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-tabs.mjs
//
// 人真係會咁做：一個 tab 開住等緊朋友入房，另一個 tab 自己打住單機。
// 而 `localStorage` 係**成個 origin 共用**嘅——兩個 tab 唔係兩部機。
//
// 上一輪粗掃過十二個介面（同時開兩版、各撳開場掣）：零 error、身分冇撞
// （大部分身分擺喺 `sessionStorage`，本來就逐 tab 獨立）。**但嗰個結果唔算數**
// ——嗰把尺量緊「未有進度可以撞」嗰一刻。冇進度就冇嘢好撞，綠得好安詳。
//
// 真正嘅形狀係 last-write-wins：好多遊戲**開場讀一次成份存檔入記憶體，收場
// 寫返成份出去**。兩個 tab 都喺開場讀過，之後各自寫返自己嗰份——後寫嗰個
// 就食咗前一個嘅成果。呢個係預設行為，要特登避先避得到。
//
// ── 邊啲遊戲要守，邊啲唔使 ─────────────────────────────────
// 只有**累積型**嘅存檔先有呢個病：
//   · Neon Snake `gamesPlayed`／`scores[]`——打多一局就要多一局；
//   · Empire Royale `trophies`——贏多一場就要多啲獎盃。
// 其餘三隻係**特登** last-write-wins，唔應該當佢係病：
//   · Tower 嘅 run checkpoint（同一個玩家同一部機，後面嗰個就係最新進度）;
//   · MOBA 嘅 `champion` 設定（記住你上次揀邊個，本來就係「最後一次」）;
//   · Racing Car 嘅幽靈（存最快嗰個，唔係存全部）。
// **一條會將特登嘅設計叫做 bug 嘅 gate 係壞 gate**，所以呢啲例外連理由一齊
// 寫喺呢度，唔係靜靜雞唔掃。
//
// driver 用返 `tests/lib/drivers.mjs`（同 `hub-progress.mjs` 共用同一份）
// ——抄多一份就會有兩份各自漂移嘅真相。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { 遊戲: 全部 } = await import('./lib/drivers.mjs');
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
  res.writeHead(200, h);
  res.end(body);
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

const 累積型 = 全部.filter((g) => typeof g.累積 === 'function');
const 量 = {};

for (const g of 累積型) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const 錯 = [];
  try {
    const 開 = async () => {
      const p = await ctx.newPage();
      p.on('pageerror', (e) => 錯.push(e.message.split('\n')[0].slice(0, 90)));
      await p.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 180000 });
      await p.waitForTimeout(3000);
      return p;
    };
    // **兩個 tab 要喺 A 打完之前就一齊開住。** B 遲啲先開嘅話，佢會讀到 A
    // 寫低咗嘅嘢，個 race 就唔存在——即係量緊一個唔會發生嘅情況。
    const A = await 開();
    const B = await 開();
    const 起點 = await A.evaluate(g.累積).catch(() => 0);

    await g.玩(A);
    const A到 = await A.evaluate(g.到咗).catch(() => false);
    const A完 = await A.evaluate(g.累積).catch(() => 0);

    await g.玩(B);
    const B到 = await B.evaluate(g.到咗).catch(() => false);

    // 新開一個 tab 讀——量嘅係**真係留低咗嘅嘢**，唔係邊個 tab 記憶體入面嗰份
    const C = await 開();
    const 最後 = await C.evaluate(g.累積).catch(() => 0);

    量[g.名] = {
      到咗: A到 && B到,
      起點, A打完: A完, 兩個tab打完: 最後,
      應該至少: 起點 + 2 * Math.max(1, A完 - 起點),
      叫: g.累積叫 ?? '累積',
      錯: 錯.length,
    };
  } catch (e) {
    量[g.名] = { 掛咗: String(e).split('\n')[0].slice(0, 110), 錯: 錯.length };
  }
  await ctx.close();
}

// **對照要先過。** 兩個 tab 都真係打完一局，先至問「有冇少咗一局」——
// 冇呢個對照，一隻根本打唔完嘅遊戲會扮到「冇嘢好撞」。
const 未到 = Object.entries(量).filter(([, v]) => v.掛咗 || v.到咗 !== true);
check('兩個 tab 都真係各打完一局（對照）', 未到.length === 0,
  未到.length ? Object.fromEntries(未到) : { 驗過: Object.keys(量) });

// A 打完一局，個數要行過——唔係嘅話下面條 check 除數為零，量緊空氣。
const 冇動 = Object.entries(量).filter(([, v]) => v.掛咗 || !(v.A打完 > v.起點));
check('第一個 tab 打完，個累積數要真係行過（對照）', 冇動.length === 0,
  冇動.length ? Object.fromEntries(冇動) : Object.fromEntries(
    Object.entries(量).map(([k, v]) => [k, `${v.叫} ${v.起點} → ${v.A打完}`])));

// 正題：兩個 tab 各打一局，唔可以少咗一局。
// 門檻唔係我揀個數——係「A 一局行咗幾多，兩局就至少要行到咁多嘅兩倍」。
const 少咗 = Object.entries(量).filter(([, v]) =>
  v.掛咗 || !(v.A打完 > v.起點) || v.兩個tab打完 < v.應該至少);
check('兩個 tab 各打一局，累積型記錄唔可以少咗一局（last-write-wins）',
  少咗.length === 0, 少咗.length ? Object.fromEntries(少咗) : Object.fromEntries(
    Object.entries(量).map(([k, v]) => [k, `${v.叫} ${v.起點} → ${v.A打完} → ${v.兩個tab打完}`])));

const 有錯 = Object.entries(量).filter(([, v]) => (v.錯 ?? 0) > 0);
check('兩個 tab 開住嗰陣零 browser error', 有錯.length === 0,
  有錯.length ? Object.fromEntries(有錯) : { 驗過: Object.keys(量) });

console.log('\n各遊戲：');
for (const [名, v] of Object.entries(量)) {
  console.log(`  ${名.padEnd(16)} ${v.掛咗 ?? `${v.叫}：起 ${v.起點}　A 打完 ${v.A打完}　兩個 tab 打完 ${v.兩個tab打完}（至少要 ${v.應該至少}）`}`);
}
console.log('\n特登唔掃（last-write-wins 係設計，唔係病）：');
for (const g of 全部.filter((x) => typeof x.累積 !== 'function')) console.log(`  ${g.名}`);
console.log(`\nhub 兩個 tab: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
