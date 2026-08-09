// Touch contract on the smallest phones this game will actually see.
// Run: node games/tower/tests/touch.mjs
//
// 呢把尺問三句，頭兩句係喺**最細嗰部真手機**（iPhone SE 375×667）度問：
//
//   1. **每個掂得到嘅控制都至少 44×44。** Apple HIG 要 44pt、Material 要 48dp。
//      實測捉到六個：pause 37×37、help 39×36、speed/sound/hub 46–47×36、
//      skip 81×36——全部係 `#hud>button` 冇寫 min-height，高度跟字大細行。
//      最細嗰個 pause 正正係你喺壓力下最想撳嗰個。
//   2. **七座塔全部都撳得到。** 七個掣要 386px 而個格得 341px，所以要打橫捲。
//      捲**係**得嘅（兩頭都去到），但捲軸收埋咗、最右嗰個貼邊切斷，睇落似係
//      最後一個——所以再加一條：**兩邊要有漸隱**，做「呢邊仲有嘢」嘅提示。
//
// 我第一版讀錯咗：我量咗外層 `#build-menu` 嘅 `overflow-x`（visible），
// 就話「捲唔到、買唔到狙擊塔」。捲係喺入面嘅 `.build-grid`。**量錯對象嘅結論，
// 同量到嘅結論一樣有說服力，所以要驗到底：真係捲一次，睇邊個掣入到畫面。**
//
//   3. **備戰橫額唔可以遮住 gold／lives／wave。** 呢條同上面兩條唔同：
//      橫額係 `pointer-events: none`，所有 hit-test 都過，掂得到嘅嘢一個都冇少——
//      壞嘅係**睇唔到**。原本 CSS 寫死 `top: 88px`，即係假設 HUD 74px 高；
//      實測 HUD 有四個高度（桌面 56、SE 橫 110、SE/12 直 164），88 只喺一種啱。
//      先量幾何相交（73%／82%／75%，SE 橫更加係 90%／100%／100%），
//      再用 pixel diff 驗返「幾何疊到 ≠ 真係遮到」：收起橫額前後，
//      三塊 crop 變咗 40–57% pixel，而同一場景嘅雜訊底只有 5–16%。
//      **凡係量 pixel 都要有對照組**——3D 場景一直喺度郁，HUD 又有 backdrop-filter，
//      唔量雜訊底就會將場景嘅動靜當咗係橫額。桌面 gold 就係咁：訊號 16.5 vs 雜訊 18.7，
//      即係**冇**遮到，同幾何嗰邊講嘅 0% 對得上。兩把尺互相驗證先信。
//      所以呢條淨係量幾何相交（快、穩定），但佢係由 pixel diff 認證過先寫落嚟嘅。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.glb':'model/gltf-binary', '.png':'image/png', '.svg':'image/svg+xml', '.m4a':'audio/mp4' };

const MIN_TAP = 44;                       // Apple HIG minimum, in CSS px
// 掂=true 嘅先用觸控規則量；桌面嗰行淨係入橫額嗰條——因為橫額嗰個 bug
// 喺桌面一樣中（hud-wave 42% 俾遮住），只守手機會漏返轉頭。
const 機 = [
  ['iPhone SE 直', 375, 667, true],
  ['細 Android 直', 360, 640, true],
  ['iPhone 12 直', 390, 844, true],
  ['iPhone SE 橫', 667, 375, true],
  ['桌面 1280', 1280, 800, false],
];

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]); const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const errors = [];
const 量 = {};
for (const [名, w, h, 掂] of 機) {
  const page = await browser.newPage({
    viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: 掂, hasTouch: 掂,
  });
  page.on('pageerror', (e) => errors.push(`${名}: ${e.message.split('\n')[0].slice(0, 120)}`));
  await page.goto(`http://localhost:${port}/games/tower/dist/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
  await page.click('#start-btn');

  // 橫額最肥嗰一刻係開場——「ACT I · Verdant Border / Hold the forest gate / Wave 1 …」
  // 三行，SE 橫度足足 177px 高。等到第 8 秒章節開場已經散咗，得返一行 28px：
  // 嗰陣量到嘅「冇疊」係量咗最易過嗰一格。所以要喺三行嗰一刻量。
  //
  // 呢度**等條件，唔等秒數**：我第一版寫死等 4 秒，四部手機啱晒，桌面 1280
  // 就量到「橫額冇出過」——deviceScaleFactor 2 之下 swiftshader 要畫 2560×1600，
  // 載入慢咗，第 4 秒根本仲未行到嗰一格。真實秒數等緊畫面上嘅事，永遠會咁。
  const t0 = Date.now();
  await page.waitForFunction(() => {
    const b = document.getElementById('wave-banner');
    return !b.classList.contains('hidden')
      && document.getElementById('wave-banner-text').textContent.split('\n').length >= 3;
  }, null, { timeout: 30000 });
  await page.waitForTimeout(700);          // bannerPulse 由 scale(0.5) 彈起，等佢定咗先量足尺
  const 橫額量 = await page.evaluate(() => {
    const 見得到 = (el) => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0
        && el.getBoundingClientRect().width > 0;
    };
    // 備戰橫額 vs 三個讀數。橫額冇出到嚟就係量唔到，唔可以當「冇遮到」——
    // 一把奏唔到嘅樂器係關於樂器嘅證據，唔係關於首歌。
    const banner = document.getElementById('wave-banner');
    const btr = document.getElementById('wave-banner-text').getBoundingClientRect();
    const 橫額出咗 = !banner.classList.contains('hidden') && btr.width > 0 && btr.height > 0;
    const 遮住 = [];
    for (const id of ['hud-gold', 'hud-lives', 'hud-wave']) {
      const el = document.getElementById(id);
      if (!el || !見得到(el)) continue;
      const r = el.getBoundingClientRect();
      const ow = Math.max(0, Math.min(r.right, btr.right) - Math.max(r.left, btr.left));
      const oh = Math.max(0, Math.min(r.bottom, btr.bottom) - Math.max(r.top, btr.top));
      const pct = Math.round(100 * ow * oh / (r.width * r.height));
      if (pct > 0) 遮住.push({ id, 蓋咗: `${pct}%` });
    }
    return { 橫額出咗, 遮住, 橫額高: Math.round(btr.height), 行: document.getElementById('wave-banner-text').textContent.split('\n').length };
  });
  await page.waitForTimeout(Math.max(500, 8000 - (Date.now() - t0)));

  量[名] = await page.evaluate(({ w, MIN_TAP }) => {
    const 見得到 = (el) => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0
        && el.getBoundingClientRect().width > 0;
    };
    const 控制 = [...document.querySelectorAll('button, [role="button"]')].filter(見得到);
    const 細 = 控制
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.id || el.className.toString().split(' ')[0] || el.textContent.trim().slice(0, 10),
          w: Math.round(r.width), h: Math.round(r.height) };
      })
      .filter((x) => x.w < MIN_TAP || x.h < MIN_TAP);

    // 塔掣：捲一次去到盡，再捲返轉頭，每個都要試過入到畫面。
    const grid = document.querySelector('.build-grid');
    const 塔掣 = [...document.querySelectorAll('#build-menu .build-btn')];
    const 名 = (el) => el.textContent.trim().replace(/\s+/g, ' ').slice(0, 16);
    const 入到畫面 = new Set();
    const 掃 = () => {
      for (const el of 塔掣) {
        const r = el.getBoundingClientRect();
        if (r.left >= -1 && r.right <= w + 1) 入到畫面.add(名(el));
      }
    };
    const 舊 = grid ? grid.scrollLeft : 0;
    掃();
    if (grid) { grid.scrollLeft = grid.scrollWidth; 掃(); grid.scrollLeft = 0; 掃(); grid.scrollLeft = 舊; }
    const 摸唔到 = 塔掣.map(名).filter((n) => !入到畫面.has(n));

    const gs = grid ? getComputedStyle(grid) : null;
    const 有漸隱 = !!gs && /linear-gradient/.test(`${gs.maskImage} ${gs.webkitMaskImage}`);
    const 要捲 = !!grid && grid.scrollWidth - grid.clientWidth > 2;

    return {
      控制數: 控制.length, 細,
      塔掣數: 塔掣.length, 摸唔到, 要捲, 有漸隱,
      捲: grid ? { scrollWidth: grid.scrollWidth, clientWidth: grid.clientWidth } : null,
    };
  }, { w, MIN_TAP });
  Object.assign(量[名], 橫額量, { 掂 });
  await page.close();
}

const 手機 = Object.entries(量).filter(([, v]) => v.掂);

const 有細掣 = 手機.filter(([, v]) => v.細.length > 0);
check(`每個掂得到嘅控制都至少 ${MIN_TAP}×${MIN_TAP}（四個手機尺寸）`,
  有細掣.length === 0,
  Object.fromEntries(有細掣.map(([k, v]) => [k, v.細])));

const 摸唔到 = 手機.filter(([, v]) => v.摸唔到.length > 0);
check('七座塔喺每個尺寸都撳得到（捲得到就算數）',
  摸唔到.length === 0 && 手機.every(([, v]) => v.塔掣數 >= 7),
  Object.fromEntries(手機.map(([k, v]) => [k, { 掣: v.塔掣數, 摸唔到: v.摸唔到 }])));

// 要捲嘅時候先至要提示；唔使捲嗰啲尺寸唔強求。
const 要捲但冇提示 = 手機.filter(([, v]) => v.要捲 && !v.有漸隱);
check('要打橫捲嗰陣，兩邊有漸隱提示（唔係靜靜哋切斷）',
  要捲但冇提示.length === 0,
  Object.fromEntries(手機.map(([k, v]) => [k, { 要捲: v.要捲, 有漸隱: v.有漸隱, ...v.捲 }])));

// 先驗把尺奏得到：五個尺寸嘅橫額都要真係喺畫面度，而且要係三行章節開場嗰個
// 最肥版本——唔係得個空殼令下面一條白過。
const 冇橫額 = Object.entries(量).filter(([, v]) => !v.橫額出咗 || v.行 < 3);
check('備戰橫額喺五個尺寸都出咗最肥嗰個三行版本（把尺奏得到先算數）',
  冇橫額.length === 0,
  Object.fromEntries(Object.entries(量).map(([k, v]) => [k, { 出咗: v.橫額出咗, 行: v.行, 高: v.橫額高 }])));

const 遮到 = Object.entries(量).filter(([, v]) => v.遮住.length > 0);
check('備戰橫額一個 pixel 都唔壓到 gold／lives／wave（五個尺寸）',
  遮到.length === 0,
  Object.fromEntries(遮到.map(([k, v]) => [k, v.遮住])));

check('五個尺寸入面零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 觸控: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
