// Hub-wide「WebGL context 掉咗」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-context.mjs
//
// 手機上面切走去覆個 message、或者記憶體緊張，瀏覽器會**收返個 GL context**。
// 呢個唔係罕見情況，係 3D 網頁遊戲喺手機上面嘅日常。冇處理嘅話個畫面就
// 永遠黑喺度，而玩家連「要重新整理」都唔知。
//
// Tower 老早有呢條 gate（`tower/tests/flow.mjs`）。其餘五隻 3D 遊戲冇人量過。
//
// 一條問題：**掉咗之後，唔可以又冇畫面又冇交代。**
//
// 兩條出路都收貨，因為兩條都係啱嘅設計：
//   (甲) 個畫面自己返到嚟——`webglcontextrestored` 之後再畫得返。
//   (乙) 畫面返唔到，但有嘢話你知（暫停／降畫質／叫你重新整理）。
//
// 實測（390×844，入咗局之後掉 context，量個 canvas 自己嘅截圖）：
//
//     Tower Defense   畫返 ✓（本來就有 gate）
//     深淵之橋 MOBA     畫返 ✓
//     Xiangqi AI      畫返 ✓（JPEG 8,212 → 空白 1,612 → 還原 8,322）
//     Empire Royale   繼續畫 ＋「已自動調低畫質保持流暢（顯示記憶體不足）」
//     Racing Car 3D   特登暫停 ＋「⏸ 已暫停」「手機暫停咗 3D 畫面，正在恢復…」
//     Snooker 3D      「3D 畫面失去連線，請重新整理頁面」
//
// **六隻全部本來就啱**，一行遊戲碼都冇改。呢一輪嘅交付品係把尺，同埋四個
// 「把尺講緊自己」嘅記錄——每一個都會令我去「修」一樣冇壞嘅嘢：
//
//   1. **「畫緊」對按需渲染嘅遊戲冇意義。** Snooker 3D 同 Xiangqi 唔郁就唔重畫,
//      所以佢哋喺**出事之前**已經量到「冇畫緊」。一把喺故障之前已經讀到
//      「壞」嘅尺，證明唔到故障之後有嘢壞。要改成**叫佢重畫**（搖一搖視窗）
//      再睇。
//   2. **全頁文字比對捉唔到「有冇交代」。** 個遊戲鐘一路行，文字本來就會變
//      ——量到嘅係「隻遊戲仲行緊」，唔係「有嘢同你講」。要比**新出現咗
//      邊幾句**，唔係比成段字。
//   3. **Racing Car 掉咗之後唔再畫，係佢特登暫停。** 一條會將深思熟慮嘅決定
//      叫做 bug 嘅 gate 係壞 gate（同 ADR-206 嘅 carousel 圓點一樣）。
//   4. **「同之前唔同」唔等於「畫返咗」。** 空白同畫好都係「唔同」。要用
//      **量級**——空白嘅 canvas JPEG 得 1.6K，畫好嘅 8.2K，差五倍。
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

// 「畫返咗」嘅門檻：還原之後個 canvas 截圖至少要返到出事前嘅幾多成。
// 實測 Xiangqi：好 8,212 → 空白 1,612（0.20 倍）→ 還原 8,322（1.01 倍）。
// 0.5 喺兩堆中間，離兩邊都遠。
const 畫返門檻 = 0.5;

// 入局要逐隻寫明，唔可以用 regex 撞——ADR-210 就係喺呢個位量錯咗兩次
// （MOBA 個掣寫「開打」；Racing Car 個 `#start-btn` 喺 `top: 1851`，要捲）。
const 遊戲 = [
  { 名: 'Tower Defense', url: '/games/tower/dist/index.html',
    入局: async (p) => { await p.click('#start-btn'); await p.waitForFunction(() => window.__TD?.開波次數?.() > 0, null, { timeout: 120000 }); } },
  { 名: '深淵之橋 MOBA', url: '/games/moba/index.html',
    入局: async (p) => { await p.waitForSelector('#pick-go', { state: 'visible', timeout: 120000 }); await p.click('#pick-go'); await p.waitForFunction(() => window.__mobaReady === true, null, { timeout: 120000 }); } },
  // Royale 個 `#loading` 係**移走**唔係加 class（`royale/tests/lib/harness.mjs` 等 detached）。
  { 名: 'Empire Royale', url: '/games/royale/index.html',
    入局: async (p) => { await p.waitForSelector('#loading', { state: 'detached', timeout: 120000 }); await p.click('#start-btn'); await p.waitForTimeout(4000); await p.click('#tutorial-skip', { timeout: 1500 }).catch(() => {}); await p.waitForTimeout(2000); } },
  { 名: 'Racing Car 3D', url: '/games/Racing Car/index.html',
    入局: async (p) => { await p.locator('#start-btn').scrollIntoViewIfNeeded(); await p.click('#start-btn'); await p.waitForTimeout(6000); } },
  { 名: 'Snooker 3D', url: '/games/snooker/3d/index.html', 入局: async (p) => { await p.waitForTimeout(6000); } },
  { 名: 'Xiangqi AI', url: '/games/xiangqi-ai/dist/index.html',
    入局: async (p) => { await p.getByText(/單機/).first().click().catch(() => {}); await p.waitForTimeout(5000); } },
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
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.split('\n')[0].slice(0, 90)));
  try {
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 120000 });
    await g.入局(page);
    await page.waitForTimeout(1500);

    const cv = page.locator('canvas').first();
    const 影 = () => cv.screenshot({ type: 'jpeg', quality: 40 }).catch(() => null);
    // 按需渲染嘅遊戲唔郁就唔重畫，所以要**叫佢重畫**先量得到「畫唔畫得返」。
    // 搖一搖視窗係最通用嗰下——冇一隻 3D 遊戲會唔聽 resize。
    const 叫佢重畫 = async () => {
      await page.setViewportSize({ width: 400, height: 844 });
      await page.waitForTimeout(1200);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.waitForTimeout(1200);
    };
    // 讀**自己嗰啲文字節點**，唔可以淨係讀「冇子元素」嘅葉。
    // 第一版寫咗 `e.children.length === 0`，於是 Snooker 嗰句
    // 「3D 畫面失去連線，請重新整理頁面」一直捉唔到——因為佢入面有個 <span>。
    // 條 gate 於是話 Snooker「冇交代」，而佢明明有。
    const 文字集 = () => page.evaluate(() => {
      const 見 = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0
          && r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; };
      return [...document.querySelectorAll('body *')].filter(見).map((e) =>
        [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => (n.textContent ?? '').trim()).join(' ').trim()
      ).filter(Boolean);
    });

    await 叫佢重畫();
    const 好嗰陣 = (await 影())?.length ?? 0;

    /*
     * **先量噪音底，再信任信號**（同 ADR-202 嗰條閃光 gate 一樣嘅做法）。
     *
     * 第一版直接比「掉之後嘅文字集」同「掉之前嘅文字集」，於是捉到
     * `0:15`、`0:03.70`、`▶` ——全部係遊戲鐘同 HUD，唔係訊息。條 gate 報綠,
     * 但理由係錯嘅。
     *
     * 所以出事之前先影兩次文字集：**兩次之間自己會變嗰啲，就係會跳嘅嘢**,
     * 之後一律唔當佢係「同你講嘢」。
     */
    const 前字A = await 文字集();
    await page.waitForTimeout(1200);
    const 前字B = await 文字集();
    const 穩定 = new Set(前字A.filter((t) => 前字B.includes(t)));
    const 會跳 = new Set([...前字A, ...前字B].filter((t) => !穩定.has(t)));

    /*
     * **唔可以幫佢還原。**
     *
     * 第一版喺掉完之後自己叫 `ext.restoreContext()`。突變測試（將 Tower 成個
     * `webglcontextlost` handler 拆走）照樣報綠——因為係我把尺幫佢還原咗。
     *
     * 但規格入面，個 context 會唔會還原，正正取決於隻遊戲有冇喺
     * `webglcontextlost` 度叫 `preventDefault()`。冇叫嘅話瀏覽器就唔會還原,
     * 個畫面永遠黑。我自己叫 `restoreContext()` 即係**幫佢做咗佢本來要做
     * 嗰件事**——一條冇咗要守嗰樣嘢都會報綠嘅 gate，守緊嘅係空氣。
     *
     * 所以呢度淨係掉，然後：①記低隻遊戲有冇 `preventDefault()`（我個 listener
     * 最後加，所以行喺佢後面，讀得到 `defaultPrevented`）；②等佢自己返嚟。
     */
    const 掉 = await page.evaluate(() => {
      for (const c of document.querySelectorAll('canvas')) {
        const gl = c.getContext('webgl2') || c.getContext('webgl');
        if (!gl) continue;
        const ext = gl.getExtension('WEBGL_lose_context');
        if (!ext) return '冇 WEBGL_lose_context';
        window.__攔咗 = null;
        window.__返咗 = false;
        c.addEventListener('webglcontextlost', (e) => { window.__攔咗 = e.defaultPrevented; });
        c.addEventListener('webglcontextrestored', () => { window.__返咗 = true; });
        ext.loseContext();
        return 'ok';
      }
      return '搵唔到 WebGL canvas';
    });
    if (掉 !== 'ok') { 量[g.名] = { 掉唔到: 掉 }; await ctx.close(); continue; }
    await page.waitForTimeout(2500);
    const 掉咗 = (await 影())?.length ?? 0;
    // **交代要喺呢一刻讀**，唔可以等搖完視窗先讀：搖視窗會令個 renderer
    // 重新 init，順手抹走咗個訊息。第一版讀遲咗，於是 Snooker 明明有講
    // 「3D 畫面失去連線，請重新整理頁面」，條 gate 都話佢冇。
    const 掉咗嗰陣文字 = await 文字集();

    // 唔叫 restoreContext()。等佢自己返（真手機就係咁）。
    await page.waitForTimeout(3000);
    await 叫佢重畫();
    const 還原 = (await 影())?.length ?? 0;
    const 攔咗 = await page.evaluate(() => window.__攔咗);
    const 返咗 = await page.evaluate(() => window.__返咗);
    const 新文字 = 掉咗嗰陣文字.filter((t) => !穩定.has(t) && !會跳.has(t)
      // 純數字／時間／分數呢類嘢就算噪音底冇捉到，都唔算「同你講嘢」
      && !/^[\d\s:.,\/%×+-]+$/.test(t) && t.replace(/\s+/g, '').length >= 4);

    const 畫返 = 好嗰陣 > 0 && 還原 / 好嗰陣 >= 畫返門檻;
    量[g.名] = {
      好嗰陣, 掉咗, 還原, 攔咗, 返咗,
      比: 好嗰陣 ? +(還原 / 好嗰陣).toFixed(2) : 0,
      畫返,
      有交代: 新文字.length > 0,
      交代: 新文字.slice(0, 2).map((t) => t.slice(0, 40)),
      會跳咗幾多句: 會跳.size,
      error: errs.length,
      錯: errs.slice(0, 2),
    };
  } catch (e) {
    量[g.名] = { 驅動失敗: String(e).split('\n')[0].slice(0, 90) };
  }
  await ctx.close();
}

const 驅動壞 = Object.entries(量).filter(([, v]) => v.驅動失敗 || v.掉唔到);
// **量唔到嘅時候要報紅，唔係報綠**（同 `tower/tests/load.mjs` 一樣嘅原則）。
check('六隻 3D 遊戲全部入到局、掉得到 context（量唔到就唔可以扮過骨）',
  驅動壞.length === 0, 驅動壞.length ? Object.fromEntries(驅動壞) : { 驗過: Object.keys(量).length });

const 又黑又冇聲 = Object.entries(量)
  .filter(([, v]) => !v.驅動失敗 && !v.掉唔到 && !v.畫返 && !v.有交代);
check('WebGL context 掉咗之後，唔可以又冇畫面又冇交代',
  又黑又冇聲.length === 0,
  又黑又冇聲.length ? Object.fromEntries(又黑又冇聲)
    : Object.fromEntries(Object.entries(量).filter(([, v]) => v.畫返 !== undefined)
      .map(([k, v]) => [k, v.畫返 ? `畫返（${v.比}×）` : `有交代：${v.交代[0] ?? ''}`])));

const 有錯 = Object.entries(量).filter(([, v]) => (v.error ?? 0) > 0);
check('掉 context 同還原期間零 browser error', 有錯.length === 0,
  Object.fromEntries(有錯.map(([k, v]) => [k, v.錯])));

console.log('\n各遊戲（canvas 截圖 byte，空白同畫好差成五倍）：');
for (const [名, v] of Object.entries(量)) {
  if (v.驅動失敗 || v.掉唔到) { console.log(`  ${名.padEnd(15)} ${v.驅動失敗 ?? v.掉唔到}`); continue; }
  console.log(`  ${名.padEnd(15)} 好 ${String(v.好嗰陣).padStart(6)} → 掉咗 ${String(v.掉咗).padStart(6)}`
    + ` → 還原 ${String(v.還原).padStart(6)}（${v.比}×）　攔住 ${v.攔咗}　還原事件 ${v.返咗}`
    + `　${v.有交代 ? '有交代：' + (v.交代[0] ?? '') : '冇新文字'}`);
}
console.log(`\nhub context 掉咗: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
