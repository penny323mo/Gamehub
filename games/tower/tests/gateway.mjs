// 條路兩頭：入口一對門會開、出口一座城堡帶血量條。
//
// 換咗真磚之後條路兩頭係就咁斷咗——怪由一格空地行出嚟，行到另一格空地就消失。
// 而家兩頭都有嘢，但「有嘢」唔等於「郁得啱」。呢把尺問四句量得到嘅：
//
//   1. **出咗怪，道門真係揈開。** 開門唔係計時器夾出嚟，係 `enemySpawned`
//      事件推——所以呢條 gate 一齊守住個事件有冇發出。
//   2. **開完會自己閂返。** 唔閂返就係一道永遠打開嘅門，同冇門一樣。
//   3. **出怪嗰下畫面真係光咗。** 「閃光」係睇得到嘅嘢，所以量像素，
//      唔係量個變數——量變數只證明個變數郁咗。
//      （呢條量法喺 2026-08-09 大修過：舊版根本冇影到閃光，一路靠彩數過。
//        原因同新量法寫喺下面第 3 節嗰段長注解。）
//   4. **條血量條跟住命數。** 佢唔係 HUD 嗰個數嘅副本，係擺喺你要守嗰個位上面。
//
// 跑法：node games/tower/tests/gateway.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const STATIC_ROOT = process.env.TOWER_STATIC_ROOT ? path.resolve(process.env.TOWER_STATIC_ROOT) : ROOT;
const MAPCFG = JSON.parse(fs.readFileSync(path.join(HERE, '../configs/map.json'), 'utf8'));
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.glb':'model/gltf-binary', '.png':'image/png', '.svg':'image/svg+xml', '.m4a':'audio/mp4' };

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
let server = null;
let url = process.env.TOWER_URL;
if (!url) server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(STATIC_ROOT, u);
  if (!f.startsWith(STATIC_ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
if (server) {
  const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
  url = process.env.TOWER_STATIC_ROOT
    ? `http://127.0.0.1:${port}/index.html`
    : `http://127.0.0.1:${port}/games/tower/dist/index.html`;
}
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 150)));
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
await page.click('#start-btn');
await page.waitForTimeout(9000);
await page.evaluate(() => {
  for (const el of document.querySelectorAll('body > *:not(#game-canvas)')) el.style.display = 'none';
});
await page.waitForTimeout(400);

// ── 1. 出怪 → 道門開 ──
// 唔直接叫 `開門()`：要行返真路徑（`spawnEnemy` → `enemySpawned` 事件 → 開門），
// 咁樣呢條 gate 先至同時守住個事件有冇發出。
const 閂 = await page.evaluate(() => window.__TD.門狀態());
await page.evaluate(() => { window.__TD.spawn('grunt'); });
await page.waitForTimeout(70);
const 開 = await page.evaluate(() => window.__TD.門狀態());
check('出一隻怪，道門就揈開（行返 enemySpawned 事件嗰條路）',
  閂.開度 < 0.05 && 開.開度 > 0.5 && Math.abs(開.門角[0]) > 0.6 && Math.abs(開.門角[1]) > 0.6,
  { 閂, 開 });
check('兩塊門板向相反方向揈（唔係兩塊一齊向同一邊）',
  開.門角[0] * 開.門角[1] < 0, { 門角: 開.門角 });

// 門柱同門樞要喺路嘅左右（local Z），而兩邊建築主體要向場外移。
// 這些定位斷言比 screenshot 更穩定，並直接阻止「沿路前後排」再回歸。
const 地圖 = MAPCFG;
const world = ([c, r]) => [地圖.origin.x + c * 地圖.cellSize + 地圖.cellSize / 2,
  地圖.origin.z + r * 地圖.cellSize + 地圖.cellSize / 2];
const spawn = world(地圖.spawnCell), spawnNext = world(地圖.path[1]);
const goal = world(地圖.goalCell), goalPrev = world(地圖.path[地圖.path.length - 2]);
const outsideDot = (anchor, endpoint, neighbour) =>
  (anchor[0] - endpoint[0]) * (endpoint[0] - neighbour[0])
  + (anchor[1] - endpoint[1]) * (endpoint[1] - neighbour[1]);
check('出怪門同城堡主體喺路線端點外側，唔再壓住首尾路格',
  outsideDot(開.入口位, spawn, spawnNext) > 0.25 && outsideDot(開.城堡位, goal, goalPrev) > 0.25,
  { spawn, 入口: 開.入口位, goal, 城堡: 開.城堡位 });
const routeStart = await page.evaluate(() => {
  const p = window.__TD.state.pathWorld[0]; return [p.x, p.z];
});
check('出怪門 anchor 同敵人 smooth route 第一點完全一致，唔會各自抄 entry offset',
  Math.hypot(開.入口位[0] - routeStart[0], 開.入口位[1] - routeStart[1]) <= 0.015,
  { 入口: 開.入口位, routeStart });
check('兩個門樞係橫向左右分開，唔係順住條路前後重疊',
  開.門樞位.length === 2 && 開.門樞位.every((p) => Math.abs(p[0]) < 0.01)
    && 開.門樞位[0][1] * 開.門樞位[1][1] < 0,
  { 門樞位: 開.門樞位 });
check('城堡血條真係高過屋頂，唔再穿過建築',
  開.血條Y >= 開.城堡頂 + 0.18, { 城堡頂: 開.城堡頂, 血條Y: 開.血條Y });

// ── 3. 閃光要真係喺畫面上見到 ──
// 量門口嗰笪像素：閃緊 vs 閃完。量個變數只證明個變數郁咗。
const 框 = await page.evaluate(() => {
  const T = window.__TD;
  const c = T.camera;
  const V = Object.getPrototypeOf(c.position).constructor;
  const m = T.門狀態();
  const p = new V(m.入口位[0], 0.9, m.入口位[1]);
  p.project(c);
  return {
    x: Math.round((p.x * 0.5 + 0.5) * window.innerWidth),
    y: Math.round((-p.y * 0.5 + 0.5) * window.innerHeight),
  };
});
// 個框要**大到蓋住成個擴散光環**（擴到約 3.6 個世界單位）。
// 用細框嘅話量到嘅主要係門口嗰浸常駐光幕——而嗰浸嘢自己會擺動，
// 擺幅同閃光增量同一個量級，仲會畀揈開嘅門遮住：**信號同雜訊係同一嚿嘢**。
// 光環就唔同，佢淨係喺閃嗰陣存在。
const clip = {
  x: Math.max(0, 框.x - 130), y: Math.max(0, 框.y - 110),
  width: 260, height: 220,
};
const 亮 = async () => {
  const 相 = await page.screenshot({ clip });
  return page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise((r) => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let s = 0, n = 0, 青 = 0, 爆白 = 0;
    for (let i = 0; i < d.length; i += 4) {
      s += (d[i] + d[i + 1] + d[i + 2]) / 3; n += 1;
      if (d[i + 2] > 110 && d[i + 2] > d[i] + 22) 青 += 1;   // 偏青藍＝閃光
      if (d[i] > 242 && d[i + 1] > 242 && d[i + 2] > 242) 爆白 += 1;
    }
    return { 亮: +(s / n).toFixed(1), 青: +(100 * 青 / n).toFixed(2), 爆白: +(100 * 爆白 / n).toFixed(2) };
  }, 相.toString('base64'));
};
// **先停低遊戲自己出怪。** 唔停嘅話個「平時」基準會隨機撞正真嘅出怪閃光
// ——實測基準嘅青色佔比由 0.58% 跳到 1.54%，於是青倍讀到 1.43 而報紅。
// 嗰個唔係遊戲有問題，係我冇控制個實驗。
//
// 第一次我試過清 `spawnCounts` 嚟停佢，結果**更差**：咁樣即刻當個波清完，
// 下一個波跟住開始出怪。要停就要真係 pause，出怪全部由測試手動推。
await page.evaluate(() => {
  window.__TD.state.paused = true;      // 門嘅動畫喺 pause 分支一樣行
  window.__TD.state.enemies = [];
});
await page.waitForTimeout(1200);

/*
 * ── 呢條 gate 之前一路喺度靠彩數過。實測擺出嚟 ──
 *
 * 舊寫法：`spawn('grunt')` 之後連影四張相攞青色最大值，同一張「平時」相比。
 * 兩個假設都錯：
 *
 *   1. **影一張相要成秒。** swiftshader 之下 `page.screenshot` ＋ 解碼一個
 *      回合約 1 秒，所以嗰四張相係喺出怪後第 1、2、3、4 秒影。
 *      而 `閃` 嘅衰減係 `dt / 0.55`——**0.55 秒**。四張相冇一張影到閃光。
 *   2. **「平時」個底本身喺度呼吸。** 門口嗰浸常駐光幕係
 *      `opacity = 0.07 + 閃*0.26 + sin(time*2.6)*0.015`，週期 2.42 秒。
 *      實測同一個 run 入面連續五格底色：青 2.54 → 3.64 → 0.90 → 4.08 → 1.88。
 *      **淨係個底自己就掃過 0.9–4.1pp**，而所謂「閃光峰值」讀到 4.4——
 *      即係個訊號完全跌喺個底自己嘅擺幅入面。
 *
 * 兩樣加埋：舊 gate 比較嘅係「正弦波某一格」對「同一條正弦波另一格」，
 * 門有冇閃根本影響唔到個結果。三跑兩過一敗，敗嗰次同過嗰次都唔關遊戲事。
 * **一條測唔到自己要測嗰樣嘢嘅 gate，比冇 gate 更差——佢教你當紅色係雜訊。**
 *
 * 改法兩邊對稱：
 *   • 底色：跨足一個完整光幕週期連影六張，攞**最大值**做底。
 *     咁個底就係「光幕呼吸到最光嗰一刻」，唔再係碰彩抽中邊一格。
 *   • 閃光：用一個收得返嘅 timer 每 16ms 撳住 `開門()`，令 `閃` 喺影相期間
 *     停喺 1 附近，真係影到閃住嗰一刻。仲要另開一條 check 驗
 *     `閃前 < 0.02 && 閃中 > 0.5 && 收咗 < 0.02`——
 *     **奏唔到嘅樂器係關於樂器嘅證據，唔係關於首歌。**
 */
const 掃 = async (n, 間隔) => {
  let 最 = { 亮: 0, 青: 0, 爆白: 0 };
  for (let i = 0; i < n; i += 1) {
    const 一格 = await 亮();
    if (一格.青 > 最.青) 最 = 一格;
    if (間隔) await page.waitForTimeout(間隔);
  }
  return 最;
};
const 平時 = await 掃(6, 120);
const 閃前 = await page.evaluate(() => window.__TD.門狀態().閃);

// **要撳住個 timer，唔可以影相前撳一次就算。** 試過「每張相之前叫一次 `開門()`」
// ——量到 青增 −0.24，即係完全冇影到閃光。因為影一張相成秒，`開門()` 同真正
// 影到嗰格中間隔咗成條 0.55 秒衰減曲線，影到嗰陣 `閃` 已經歸零。
// 撳住就冇呢個問題，但個 handle 要放喺 `window` 上面清得返：收唔到就會留低
// 一道永遠開住嘅門，跟住落嚟「開完會自己閂返」嗰條會報紅。所以下面收咗之後
// **驗返佢真係收咗**，唔係靠信。
//
// **而且呢一段一秒都唔可以用 `waitForTimeout` 等。** swiftshader 之下一格畫面
// 可以行成半秒，而 `rawDt` 封頂喺 0.1 秒——即係**遊戲鐘行得比真實鐘慢幾倍**。
// 我用真秒數等過：等 1200ms 之後 `閃` 應該歸零，實測仲有 0.455；
// 等 150ms 之後 `閃` 應該係 1，實測係 0。**用真秒數等一件行緊遊戲鐘嘅事，
// 等到嘅係彩數。** 所以下面全部改成等狀態本身。
await page.evaluate(() => { window.__pinFlash = setInterval(() => window.__TD.開門(), 16); });
await page.waitForFunction(() => window.__TD.門狀態().閃 > 0.5, null, { timeout: 15000 });
const 閃中 = await page.evaluate(() => window.__TD.門狀態().閃);
const 閃住 = await 掃(3, 0);
await page.evaluate(() => { clearInterval(window.__pinFlash); window.__pinFlash = null; });
// 包一層 `{v}`：直接 return 個數嘅話，`閃 === 0` 係 falsy，waitForFunction 會當
// 條件未成立咁一路等落去——**條件啱到極致嗰一刻，正正就係佢睇漏嗰一刻。**
const 收咗 = await page.waitForFunction(() => {
  const f = window.__TD.門狀態().閃;
  return f < 0.02 ? { v: f } : null;
}, null, { timeout: 20000 }).then((h) => h.jsonValue()).then((o) => o.v).catch(() => -1);

const 青增 = 閃住.青 - 平時.青;
const 亮增 = 閃住.亮 - 平時.亮;
check('影相期間道門真係閃緊，量完又收得返（底色嗰陣冇閃）',
  閃前 < 0.02 && 閃中 > 0.5 && 收咗 < 0.02, { 閃前, 閃中, 收咗 });
// 兩條門檻都係由呢個量法度出返嚟，唔係估：
//   底色峰值（六格跨足一個光幕週期）實測 3.9–4.3pp 青；
//   撳住閃光實測 11.2–14.2pp 青、亮度 +9.9 到 +15.9、純白 0.87–1.25%。
// 訊號至少 ~7pp，而光幕自己嘅擺幅係 ~3.2pp。門檻擺 4pp：高過擺幅，
// 又低過訊號一大截。純白上限由實測峰值 1.25% 放寬到 2.5%——
// 佢守嘅係「成大片白到見唔到道門」嗰個舊 bug，唔係守正常峰值。
check('出怪嗰下門口真係光咗（量像素，唔係量個變數）',
  青增 >= 4 && 閃住.爆白 <= 2.5,
  { 平時, 閃住, 青增: +青增.toFixed(2), 亮增: +亮增.toFixed(2) });

// ── 2. 開完會閂返 ──
// 同上：等狀態，唔等秒數。原本寫死 1600ms，喺 swiftshader 拖慢咗嘅遊戲鐘之下
// 只夠 `開度` 由 1 跌到 0.294 就去驗，於是報紅——**紅嘅係把尺，唔係道門。**
// 有 timeout 兜住，門真係唔閂返一樣捉得到，只係唔會再誤報。
const 閂返 = await page.waitForFunction(() => {
  const s = window.__TD.門狀態();
  return s.開度 < 0.05 && Math.abs(s.門角[0]) < 0.06 ? s : null;
}, null, { timeout: 20000 }).then((h) => h.jsonValue()).catch(() => null);
check('開完會自己閂返（唔係一道永遠打開嘅門）', 閂返 !== null,
  閂返 ?? await page.evaluate(() => window.__TD.門狀態()));

// ── 4. 血量條跟住命數 ──
const 量條 = async (lives) => {
  await page.evaluate((l) => { window.__TD.state.lives = l; }, lives);
  await page.waitForTimeout(120);
  return page.evaluate(() => window.__TD.門狀態().血條闊);
};
const 滿 = await 量條(20);
const 半 = await 量條(10);
const 得三 = await 量條(3);
check('血量條跟住剩返幾多條命縮（唔係擺喺度唔郁）',
  Math.abs(滿 - 1) < 0.02 && Math.abs(半 - 0.5) < 0.03 && Math.abs(得三 - 0.15) < 0.03,
  { 滿, 半, 得三 });
await page.evaluate(() => { window.__TD.state.lives = 20; });

check('量度期間零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 門同城堡: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
if (server) server.close();
process.exit(fail ? 1 : 0);
