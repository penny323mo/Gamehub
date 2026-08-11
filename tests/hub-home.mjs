// Hub-wide「返得返去」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-home.mjs
//
// `tests/hub.mjs` 守住 launcher **入去**嗰十三條路（每個入口都指住一個存在嘅檔）。
// 冇人守過**出返嚟**嗰條。一隻入到去出唔返嘅遊戲係一個陷阱——喺手機加咗上
// 主畫面之後，連瀏覽器嘅返回掣都未必見得到。
//
// 兩條問題：
//   1. 每個介面都要有一條見得到嘅返 hub 路。
//   2. 撳落去要真係去到 hub（唔可以係一條死鏈）。
//
// 實測：**十一個介面本來就有，得深淵之橋 MOBA 一條都冇**——成個 `games/moba/`
// 入面 `index.html` 三個字一次都冇出現過。已經喺揀英雄版同收場版各加一條。
//
// 兩個「把尺講緊自己」嘅記錄：
//
//   1. **淨係掃屬性掃唔到。** Gomoku 同 Xiangqi 個掣寫 `onclick="goToLauncher()"`,
//      文字先係「返回遊戲大廳」。第一版淨係掃 href／onclick／id／class，
//      於是報咗五隻「冇路返」——四隻係掃唔到，得一隻係真。
//   2. **Neon Snake 唔係冇，係我影錯咗時機。** 佢個返回掣喺入名嗰版之後,
//      開頁 3.5 秒仲未行到。所以呢把尺要**逐隻遊戲寫明幾時去搵**
//      （同 `hub-cdn.mjs` 嘅 `踢` 一樣），唔可以一個 timeout 掃到尾。
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

// `行到` = 開頁之後點樣行到「應該見到返 hub 路」嗰一版。null 即係開場就有。
const 遊戲 = [
  { 名: 'Gomoku', url: '/games/gomoku/index.html' },
  { 名: 'Penny Crush', url: '/games/penny_crush/index.html' },
  { 名: 'Big Two', url: '/games/big2/index.html' },
  { 名: 'Dou Dizhu', url: '/games/doudizhu/index.html' },
  { 名: 'Snooker', url: '/games/snooker/index.html' },
  { 名: 'Tower Defense', url: '/games/tower/dist/index.html' },
  // Snake 個返回掣喺入名嗰版之後——**呢個係一步路，唔係一個病**。
  // 要用 `getByRole('button')`：`getByText(/開始遊戲/)` 會撞中個副標題
  // 「輸入你既名稱開始遊戲」，`.first()` 撳咗個 `<p>`，於是成版嘢冇郁過,
  // 而條 gate 就報「Snake 冇路返」——**又一次係揀錯元素，唔係佢冇**。
  { 名: 'Neon Snake', url: '/games/snake-game/dist/index.html',
    行到: async (p) => {
      await p.fill('input', '測試').catch(() => {});
      await p.getByRole('button', { name: /開始遊戲/ }).first().click({ timeout: 6000 }).catch(() => {});
      await p.waitForTimeout(2500);
    } },
  { 名: 'Empire Royale', url: '/games/royale/index.html',
    行到: async (p) => { await p.waitForSelector('#loading', { state: 'detached', timeout: 120000 }); } },
  { 名: '深淵之橋 MOBA', url: '/games/moba/index.html',
    行到: async (p) => { await p.waitForSelector('#pick-go', { state: 'visible', timeout: 120000 }); } },
  { 名: 'Racing Car 3D', url: '/games/Racing Car/index.html' },
  { 名: 'Xiangqi AI', url: '/games/xiangqi-ai/dist/index.html' },
  { 名: 'Ashen Rail', url: '/games/ashen-rail/dist/index.html' },
  { 名: 'Elden Ring II', url: '/games/elden-ring-ii/dist/index.html' },
];

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const 量 = {};
for (const g of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(2500);
    if (g.行到) await g.行到(page);
    await page.waitForTimeout(800);

    // 搵：屬性**同**文字都要睇。淨係睇屬性會漏咗 `onclick="goToLauncher()"` 嗰種。
    const 標記 = () => page.evaluate(() => {
      const 見 = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0
          && r.width > 0 && r.height > 0; };
      const 候 = [...document.querySelectorAll('a[href], button, [role="button"]')].filter((el) => {
        const h = [el.getAttribute('href'), el.getAttribute('onclick'), el.id, el.className,
          el.title, el.getAttribute('aria-label'), el.textContent].filter(Boolean).join(' ');
        return /index\.html|hub|大廳|返回|首頁|launcher|🏠/i.test(h);
      }).filter(見);
      候.forEach((el, i) => el.setAttribute('data-返hub探針', String(i)));
      return 候.map((el) => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 16) || el.id || el.className);
    });
    const 候文 = await 標記();
    if (!候文.length) { 量[g.名] = { 冇路返: true }; await ctx.close(); continue; }

    /*
     * **逐個試，唔係試第一個。**
     *
     * 契約係「有一條行得通嘅路」，唔係「我搵到第一個嗰個得」。Tower 開場有
     * 兩個 🏠：HUD 嗰個 `#hub-btn` 喺開場 modal 後面（撳唔到，而且本來就
     * 唔應該撳到），開場版嗰個「🏠 返回 Game Hub」喺 `top: 926`，要捲先見到。
     * 第一版淨係撳第一個，於是報 Tower「去唔到」——而佢明明去到。
     */
    const 前 = page.url();
    let 去 = 前, 到咗 = false, 用咗 = '';
    for (let i = 0; i < 候文.length; i++) {
      const loc = page.locator(`[data-返hub探針="${i}"]`).first();
      await loc.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
      await loc.click({ timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(2000);
      去 = page.url();
      到咗 = /\/index\.html$/.test(去.split('?')[0]) && !/\/games\//.test(去);
      if (到咗) { 用咗 = 候文[i]; break; }
      if (去 !== 前) {   // 去咗第三度：返返嚟再試下一個
        await page.goto(前, { waitUntil: 'load', timeout: 120000 });
        await page.waitForTimeout(2000);
        if (g.行到) await g.行到(page);
        await page.waitForTimeout(800);
        await 標記();
      }
    }
    量[g.名] = { 文: 用咗 || 候文[0], 個數: 候文.length, 由: 前.replace(`http://localhost:${port}`, ''),
      去: 去.replace(`http://localhost:${port}`, ''), 到咗 };
  } catch (e) {
    量[g.名] = { 驅動失敗: String(e).split('\n')[0].slice(0, 80) };
  }
  await ctx.close();
}

const 壞驅動 = Object.entries(量).filter(([, v]) => v.驅動失敗);
check('每個介面都行得到「應該見到返 hub 路」嗰一版（量唔到就唔可以扮過骨）',
  壞驅動.length === 0, 壞驅動.length ? Object.fromEntries(壞驅動) : { 驗過: Object.keys(量).length });

const 冇路 = Object.entries(量).filter(([, v]) => v.冇路返);
check('每個介面都有一條見得到嘅返 hub 路', 冇路.length === 0,
  冇路.length ? Object.keys(Object.fromEntries(冇路)) : { 驗過: Object.keys(量).length });

const 死鏈 = Object.entries(量).filter(([, v]) => v.到咗 === false);
check('撳落去要真係去到 hub（唔可以係死鏈）', 死鏈.length === 0,
  死鏈.length ? Object.fromEntries(死鏈) : { 驗過: Object.values(量).filter((v) => v.到咗).length });

console.log('\n各介面：');
for (const [名, v] of Object.entries(量)) {
  if (v.驅動失敗) { console.log(`  ${名.padEnd(15)} 驅動失敗：${v.驅動失敗}`); continue; }
  if (v.冇路返) { console.log(`  ${名.padEnd(15)} **一條返 hub 嘅路都冇**`); continue; }
  console.log(`  ${名.padEnd(15)} ${String(v.文).padEnd(16)}（${v.個數} 個）　${v.到咗 ? '去到' : '去唔到'} ${v.去}`);
}
console.log(`\nhub 返得返去: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
