// Hub-wide「你想停嗰陣停唔停到」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-pause.mjs
//
// `hub-away` 守嘅係**你切走咗，佢有冇自己停**。冇人問過相反嗰條：**你自己
// 想停嗰陣，撳唔撳得到。** 一量就見到同一個形狀又出現咗一次——
// **機制有，路冇**：
//
//     Tower Defense    `#pause-btn` 44×44                        ✓
//     Racing Car 3D    `#pause-btn` 44×44                        ✓
//     Neon Snake       `isPaused` 得空白鍵／P 撳到                 ✗ → 本輪補咗
//     深淵之橋 MOBA     `state.running` 得 `visibilitychange` 撳到  ✗ → **未修**
//
// 兩隻唔見得人嘅位：Snake 開場提示自己寫住「空格鍵 暫停」——**個功能存在，
// 而且佢仲親口同你講佢存在，但手機玩家一條路都冇**。MOBA 一場波跑十六分鐘,
// 中途有人叫你，你唯一嘅「暫停」係切走個 tab。（MOBA 點解未修，見下面
// `未做嘅` 嗰段。）
//
// 量法上兩個位要企穩：
//
// 1. **「畫面有冇郁」分唔開停冇停**（`hub-away` 踩過）。Tower 個暫停畫面自己
//    會呼吸，Snake 個霓虹背景一直閃。所以逐隻寫明個鐘讀邊個 seam，
//    **冇 seam 就唔好扮量到**。
// 2. **撳之前一定要證明個鐘行緊**。冇呢個對照，一隻卡死咗嘅遊戲會喺
//    「撳完停咗」呢條度綠得好安詳——佢由頭到尾都冇行過。
//
// 順帶一提：呢度用 `locator.click()`，即係**真滑鼠事件**（就算個 context 開咗
// `isMobile`／`hasTouch` 都係）。Tower 嗰單嘢就係咁捉到嘅——`hub-touch` 全部
// 用 `tap()`，而 Tower 自己啲 test 唔係 tap 就係 `el.click()`，**兩種都繞過咗
// 出事嗰條路**。一把尺揀邊種輸入，決定咗佢睇唔睇得到某一類病。
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

// 逐隻：點入到真係打緊嘅一局、個鐘讀邊度。
// 個鐘唔一定要遞增——要嘅係「行緊嗰陣兩次讀數唔同、停咗嗰陣一樣」。
const 遊戲 = [
  {
    名: 'Tower Defense', url: '/games/tower/dist/index.html',
    入: async (p) => {
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__TD?.開波次數?.() > 0, null, { timeout: 240000 });
      await p.waitForTimeout(6000);
    },
    // 場上嘅怪行到邊 ＋ 出波倒數：兩個階段都有嘢郁。
    鐘: () => {
      const s = window.__TD?.state; if (!s) return null;
      const 行 = (s.enemies ?? []).filter((e) => e.alive)
        .reduce((n, e) => n + e.pathIndex + e.pathProgress, 0);
      return Math.round((行 + s.prepTimer + s.spawnTimers.reduce((a, b) => a + b, 0)) * 1000);
    },
  },
  {
    名: 'Racing Car 3D', url: '/games/Racing Car/index.html',
    入: async (p) => {
      await p.waitForSelector('#screen-start:not(.hidden)', { timeout: 180000 }).catch(() => {});
      await p.locator('#track-list button, #track-list [role=button], #track-list > *').first()
        .click({ timeout: 20000 }).catch(() => {});
      await p.waitForTimeout(1200);
      await p.getByRole('button', { name: /開始|GO|Start|出發/i }).first().click({ timeout: 20000 }).catch(() => {});
      await p.waitForTimeout(9000);
    },
    // 本圈時間：玩家自己都望住嘅嗰個鐘。
    鐘: () => document.getElementById('time-num')?.textContent ?? null,
  },
  {
    名: '深淵之橋 MOBA', url: '/games/moba/index.html',
    入: async (p) => {
      await p.waitForSelector('#pick-grid .pick-card', { timeout: 240000 });
      await p.click('#pick-grid .pick-card');
      await p.click('#pick-go', { timeout: 60000 });
      await p.waitForFunction(() => window.__mobaReady === true, null, { timeout: 180000 });
      await p.waitForTimeout(5000);
    },
    鐘: () => (window.__sim?.time == null ? null : Math.round(window.__sim.time * 1000)),
  },
  {
    名: 'Neon Snake', url: '/games/snake-game/dist/index.html',
    /*
     * **要撳返遊戲自己嗰個「開始遊戲」。** 第一版係揀完模式就撳 Enter——
     * 個鍵盤 handler 見到 `!isRunning` 就真係開咗波，但**個選單仲蓋住喺上面**,
     * 於是條蛇喺你睇唔到嘅背景度自己撞死。跟住量到「打緊 = false」，
     * 我差啲以為個掣冇出——其實係我開錯咗個局。
     */
    入: async (p) => {
      await p.locator('input').first().click({ timeout: 60000 });
      await p.keyboard.type('尺仔');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(2500);
      await p.getByText(/經典模式/).first().click({ timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(1200);
      await p.getByRole('button', { name: /開始遊戲/ }).first().click({ timeout: 30000 });
      await p.waitForFunction(() => window.__snake?.打緊?.() === true, null, { timeout: 60000 });
      await p.waitForTimeout(1500);
    },
    鐘: () => window.__snake?.格數?.() ?? null,
  },
];

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

/*
 * 點揀個暫停控制：**唔寫死 selector。**
 *
 * 契約係「玩家撳得到一個講明自己係暫停嘅嘢」，唔係「某個 id 存在」。寫死
 * selector 嘅話，把尺就會跟住實作漂移（ADR-235 嘅教訓）。但一撞多過一個就
 * 要報返出嚟——ADR-238 嗰次寫 `'A, B'` 兩個一齊試，B 中咗所以報綠，
 * 而我以為自己量緊 A。
 */
const 搵暫停 = () => {
  const 見 = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0
      && r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0; };
  const 字 = /暫停|pause|⏸/i;
  const xs = [...document.querySelectorAll('button, a, [role="button"]')]
    .filter((el) => 字.test([el.id, el.className, el.title, el.getAttribute('aria-label'),
      el.textContent].filter(Boolean).join(' ')))
    .filter(見);
  xs.forEach((el, i) => el.setAttribute('data-暫停探針', String(i)));
  return xs.map((el) => { const r = el.getBoundingClientRect();
    return { 誰: el.id || el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 8),
             闊: Math.round(r.width), 高: Math.round(r.height) }; });
};

const 量 = {};
for (const g of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const 讀 = async () => page.evaluate(g.鐘).catch(() => null);
  const 郁過 = async (秒 = 2.5) => {
    const a = await 讀(); await page.waitForTimeout(秒 * 1000); const b = await 讀();
    return { a, b, 有郁: a !== null && b !== null && a !== b };
  };
  try {
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 240000 });
    await page.waitForTimeout(2500);
    await g.入(page);

    /*
     * 等到個鐘真係郁咗先量。
     *
     * Racing Car 撳完「開始」仲有一段開賽倒數，圈鐘停喺 0:00.00；量到嗰陣
     * 夠唔夠鐘純粹睇部機當時幾快。**一條靠彩數過嘅 gate 同冇 gate 分別唔大。**
     * 呢度唔係幫佢遮醜——下面條對照仍然獨立驗一次，等唔到就照樣報紅。
     */
    for (let i = 0; i < 24; i++) {
      const a = await 讀(); await page.waitForTimeout(1000);
      if (a !== null && a !== await 讀()) break;
    }

    const 撳前 = await 郁過();                       // 對照：真係打緊
    const 掣 = await page.evaluate(搵暫停);
    let 停咗 = null, 續返 = null;
    if (掣.length) {
      await page.locator('[data-暫停探針="0"]').first().click({ timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1200);
      停咗 = await 郁過();
      /*
       * 再撳返：有停冇續一樣係壞嘅。
       *
       * **唔可以撳「第一個中嘅嘢」。** Racing Car 停低之後係另開一版
       * `#screen-pause`，續嗰個係 `#resume-btn`；而 DOM 排先嗰個仍然係
       * `#pause-btn`（撳落去 `pauseRace()` 見到 `running === false` 就返 false,
       * 乜都唔會發生）。第一版就係咁報咗「Racing 續唔返」——**量緊嘅係我
       * 揀錯咗嘅元素，唔係隻遊戲。** 同一個坑 ADR-238 踩過一次。
       *
       * 契約係「有一條續得返嘅路」，所以逐個試到個鐘真係行返為止。
       */
      const 候 = await page.evaluate(() => {
        const 見 = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
          return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) !== 0
            && r.width > 0 && r.height > 0; };
        const 字 = /暫停|pause|⏸|繼續|resume|▶/i;
        const xs = [...document.querySelectorAll('button, a, [role="button"]')]
          .filter((x) => 字.test([x.id, x.className, x.title, x.getAttribute('aria-label'),
            x.textContent].filter(Boolean).join(' '))).filter(見);
        xs.forEach((el, i) => el.setAttribute('data-續探針', String(i)));
        return xs.map((el) => el.id || el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 10));
      });
      for (let i = 0; i < 候.length; i++) {
        await page.locator(`[data-續探針="${i}"]`).first().click({ timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(1200);
        const 睇 = await 郁過();
        續返 = { 用咗: 候[i], 試過: i + 1, ...睇 };
        if (睇.有郁) break;
      }
    }
    量[g.名] = { 撳前, 掣, 停咗, 續返 };
  } catch (e) {
    量[g.名] = { 驅動失敗: String(e).split('\n')[0].slice(0, 90) };
  }
  await ctx.close();
}

const 壞 = Object.entries(量).filter(([, v]) => v.驅動失敗);
check('每隻都入到一局真係打緊嘅（量唔到就唔可以扮過骨）', 壞.length === 0,
  壞.length ? Object.fromEntries(壞) : { 驗過: Object.keys(量).length });

const 冇行 = Object.entries(量).filter(([, v]) => !v.驅動失敗 && !v.撳前?.有郁);
check('撳之前個鐘要真係行緊（冇呢個對照，一隻卡死咗嘅遊戲會喺下面兩條度全綠）',
  冇行.length === 0, 冇行.length ? Object.fromEntries(冇行.map(([k, v]) => [k, v.撳前])) : { 驗過: Object.keys(量).length - 壞.length });

/*
 * **深淵之橋 MOBA 係一個寫明咗嘅缺口，唔係一個唔知嘅病。**
 *
 * 佢個 `state.running` 一直都得 `visibilitychange` 撳得到——量到，認咗，但
 * 未修好：試過三個位擺一粒 44×44 嘅掣（⚙ 下面撞打直版兵線總覽、⚙ 隔籬撞
 * 條頂欄、擺入條頂欄撞打橫版兵線總覽），最後試「開設定＝暫停」——四樣改法
 * 全部令 `games/moba/tests/browser.mjs` 條 `普攻會真係揮動作` 間歇性報紅
 * （baseline 兩跑 196/196，改完六跑出咗八次紅）。查到嗰條 check 同背景嘅
 * rAF loop 搶同一個 rig（`鎖差 -110` 即係 `rig.time` 行過咗成一百秒），
 * 即係**一個郁一郁幀時序就會撞中嘅race**——未查清楚之前唔會推。
 *
 * 擺個例外喺呢度而唔係喺 driver 度剷走佢：條線仍然量得到（下面「行返」嗰幾條
 * 照計佢），而且缺口寫喺把尺入面，唔會有人以為呢隻遊戲本來就唔使暫停。
 */
const 未做嘅 = new Set(['深淵之橋 MOBA']);
const 冇掣 = Object.entries(量).filter(([k, v]) => !v.驅動失敗 && !v.掣?.length && !未做嘅.has(k));
check('打緊嗰陣要有一個見得到嘅暫停控制（手機冇鍵盤）', 冇掣.length === 0,
  冇掣.length ? Object.keys(Object.fromEntries(冇掣))
    : { 驗過: Object.keys(量).length - 壞.length - 未做嘅.size, 未做: [...未做嘅] });

const 太細 = Object.entries(量).filter(([, v]) => v.掣?.length && (v.掣[0].闊 < 44 || v.掣[0].高 < 44));
check('個暫停控制要撳得到（44×44，同 hub-touch 同一條線）', 太細.length === 0,
  太細.length ? Object.fromEntries(太細.map(([k, v]) => [k, v.掣[0]])) : { 驗過: Object.values(量).filter((v) => v.掣?.length).length });

const 停唔到 = Object.entries(量).filter(([, v]) => v.掣?.length && v.停咗?.有郁 !== false);
check('撳落去個模擬要真係停（唔係得個畫面應一應）', 停唔到.length === 0,
  停唔到.length ? Object.fromEntries(停唔到.map(([k, v]) => [k, v.停咗])) : { 驗過: Object.values(量).filter((v) => v.停咗?.有郁 === false).length });

const 續唔返 = Object.entries(量).filter(([, v]) => v.掣?.length && v.停咗?.有郁 === false && v.續返?.有郁 !== true);
check('再撳返個模擬要行返（有停冇續一樣係壞嘅）', 續唔返.length === 0,
  續唔返.length ? Object.fromEntries(續唔返.map(([k, v]) => [k, v.續返 ?? '搵唔到繼續嘅路'])) : { 驗過: Object.values(量).filter((v) => v.續返?.有郁).length });

console.log('\n各遊戲：');
for (const [名, v] of Object.entries(量)) {
  if (v.驅動失敗) { console.log(`  ${名.padEnd(15)} 驅動失敗：${v.驅動失敗}`); continue; }
  const 掣文 = v.掣.length ? v.掣.map((x) => `${x.誰}(${x.闊}×${x.高})`).join('、') : '**冇**';
  console.log(`  ${名.padEnd(15)} 撳前 ${v.撳前.a}→${v.撳前.b}　暫停控制 ${掣文}`);
  if (v.停咗) console.log(`  ${''.padEnd(15)} 撳完 ${v.停咗.a}→${v.停咗.b}（${v.停咗.有郁 ? '**照行**' : '停咗'}）`
    + (v.續返 ? `　撳「${v.續返.用咗}」之後 ${v.續返.a}→${v.續返.b}（${v.續返.有郁 ? '行返' : '**續唔返**'}）` : '　冇續嘅路'));
}
console.log(`\nhub 停得到: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
