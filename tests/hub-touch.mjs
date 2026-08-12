// Hub-wide phone contract.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-touch.mjs
//
// Tower 嗰輪（ADR-202）喺 iPhone SE 375×667 度量到六個掂唔到嘅掣——
// pause 掣淨係 37×37，而佢正正係你喺壓力下最想撳嗰個。嗰把尺淨係量咗一隻遊戲。
// 呢個 hub 有十三隻，其餘十二隻從來冇人用同一把尺量過。
//
// 三條問題，全部係「唔關遊戲玩法事、但玩唔玩得落去」嘅嘢：
//
//   1. **掂得到嘅控制至少 44×44**（Apple HIG 44pt／Material 48dp）。
//   2. **唔可以打橫爆版**：`scrollWidth > innerWidth` 即係要左右拉先睇到晒，
//      喺一隻遊戲度即係有嘢永遠喺畫面外。
//   3. **一開場零 browser error**。
//
// 呢把尺**淨係量開場畫面**——唔會撳 START、唔會入局。咁樣量到嘅嘢少啲，
// 但每隻遊戲都用完全一樣嘅方法量，跨遊戲比較先有意思。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
// Playwright 淨係裝喺 `games/tower/node_modules`（成個 repo 得嗰度有 package.json）。
// 呢個 test 係跨遊戲嘅，唔應該搬入 tower 度住，所以喺度做一次 fallback：
// 先試普通 resolve，唔得就直接指去 tower 嗰份。兩條路都唔通先至掟錯，
// 順便講返點裝——**一句「Cannot find package」對下一個人冇任何用**。
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

const MIN_TAP = 44;
// **打機多數係打橫攞電話。** 直屏係啱嘅起點（最窄），但橫屏先係大多數人
// 真正打嗰個姿勢，而且佢係另一個方向緊：高度得 375，任何靠垂直排嘅版面
// 都喺呢度先至爆。同一把尺、兩個姿勢。
const 機群 = [
  ['直 375×667', { width: 375, height: 667 }],
  ['橫 667×375', { width: 667, height: 375 }],
];
const 遊戲 = [
  ['Hub launcher', '/index.html'],
  ['Gomoku', '/games/gomoku/index.html'],
  ['Penny Crush', '/games/penny_crush/index.html'],
  ['Big Two', '/games/big2/index.html'],
  ['Dou Dizhu', '/games/doudizhu/index.html'],
  ['Snooker', '/games/snooker/index.html'],
  ['Tower Defense', '/games/tower/dist/index.html'],
  ['Neon Snake', '/games/snake-game/dist/index.html'],
  ['Empire Royale', '/games/royale/index.html'],
  ['深淵之橋 MOBA', '/games/moba/index.html'],
  ['Racing Car 3D', '/games/Racing Car/index.html'],
  ['Xiangqi AI', '/games/xiangqi-ai/dist/index.html'],
  ['Ashen Rail', '/games/ashen-rail/dist/index.html'],
  ['Elden Ring II', '/games/elden-ring-ii/dist/index.html'],
];

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  // Chrome 151 no longer accepts the legacy `--use-gl=swiftshader` path on
  // macOS; it can start a browser process but fail every first WebGL page.
  // Use the same ANGLE SwiftShader backend as the game-scoped harnesses so a
  // cross-game touch result is about the page, not allocator startup.
  args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'],
});

const 量 = {};
for (const [姿勢, 機] of 機群) {
for (const [遊戲名, url] of 遊戲) {
  const 名 = `${遊戲名}｜${姿勢}`;
  const ctx = await browser.newContext({ viewport: 機, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 100)));
  try {
    await page.goto(`http://localhost:${port}${encodeURI(url)}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(2500);        // 畀開場畫面／字體／canvas 定型
    量[名] = await page.evaluate(({ MIN_TAP }) => {
      const 見得到 = (el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        // 畫面外／收埋咗嘅嘢唔算——量嘅係「而家撳得到嗰啲」
        return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
      };
      const 認 = (el) => el.id || (el.className && String(el.className).split(' ')[0])
        || (el.textContent || '').trim().slice(0, 12) || el.tagName.toLowerCase();
      const 控制 = [...document.querySelectorAll('button, [role="button"], a[href], input, select')].filter(見得到);
      // **有理由嘅例外要寫喺尺度，唔係靠改細個標準。**
      // `.carousel-dot` 特登用 WCAG 2.5.8 嘅 24×24 而唔係 44：喺 320px 闊之下
      // 四粒點各佔 44 已經 176，加埋兩個箭咀 88 就塞唔落——條線唔係唔想守，
      // 係幾何上守唔到。佢用間距保證每粒點嘅 24px 方框唔會互搶（見 style.css
      // 嗰段註解同 ADR-107）。一條會將深思熟慮嘅決定叫做 bug 嘅 gate 係壞 gate，
      // 但「例外」要逐個寫明、連理由一齊寫，唔可以靜靜雞放寬。
      const 例外 = [{ 揀: '.carousel-dot', 最細: 24, 因: 'WCAG 2.5.8；320px 度 44×4 塞唔落' }];
      const 下限 = (el) => {
        for (const e of 例外) if (el.matches(e.揀)) return e.最細;
        return MIN_TAP;
      };
      const 細 = 控制.map((el) => {
        const r = el.getBoundingClientRect();
        return { id: 認(el), w: Math.round(r.width), h: Math.round(r.height), 下限: 下限(el) };
      }).filter((x) => x.w < x.下限 || x.h < x.下限);
      return {
        控制數: 控制.length,
        細: 細.slice(0, 8),
        細數: 細.length,
        爆版: Math.round(document.documentElement.scrollWidth) > Math.round(window.innerWidth) + 1,
        闊: { scrollWidth: Math.round(document.documentElement.scrollWidth), innerWidth: window.innerWidth },
        /*
         * 橫屏獨有嘅危險：控制畀擠到畫面下面。
         *
         * **但「喺畫面外」唔等於「掂唔到」**——捲得到就照樣撳得到。
         * ADR-202 就係喺呢個位讀錯過一次：見到 `#build-menu` 嘅 `overflow-x`
         * 係 visible 就話「買唔到狙擊塔」，其實捲喺入面嘅 `.build-grid`。
         * 所以呢度唔靠讀 computed style 去估，**真係捲一次**：
         * 叫 `scrollIntoView`，再睇佢有冇入到畫面。入到＝冇事，
         * 入唔到＝真係永遠撳唔到。
         */
        跌出畫面: (() => {
          const 出界 = 控制.filter((el) => el.getBoundingClientRect().bottom > innerHeight + 1);
          const 壞 = [];
          for (const el of 出界) {
            const 前 = Math.round(el.getBoundingClientRect().bottom);
            el.scrollIntoView({ block: 'nearest' });
            const r = el.getBoundingClientRect();
            if (r.bottom > innerHeight + 1 || r.top < -1) {
              壞.push({ id: 認(el), 捲前底: 前, 捲後底: Math.round(r.bottom), 畫面高: innerHeight });
            }
          }
          window.scrollTo(0, 0);
          return 壞.slice(0, 5);
        })(),
      };
    }, { MIN_TAP });
  } catch (e) {
    量[名] = { 掛咗: e.message.split('\n')[0].slice(0, 90) };
  }
  量[名].errors = errors.slice(0, 2);
  await ctx.close();
}
}

const 載唔到 = Object.entries(量).filter(([, v]) => v.掛咗);
check('十二隻遊戲喺兩個姿勢都載得起', 載唔到.length === 0,
  Object.fromEntries(載唔到.map(([k, v]) => [k, v.掛咗])));

const 有錯 = Object.entries(量).filter(([, v]) => (v.errors ?? []).length > 0);
check('開場零 browser error', 有錯.length === 0,
  Object.fromEntries(有錯.map(([k, v]) => [k, v.errors])));

const 爆版 = Object.entries(量).filter(([, v]) => v.爆版);
check('冇一隻遊戲打橫爆版', 爆版.length === 0,
  Object.fromEntries(爆版.map(([k, v]) => [k, v.闊])));

const 跌出 = Object.entries(量).filter(([, v]) => (v.跌出畫面 ?? []).length > 0);
check('冇控制係捲極都入唔到畫面（橫屏高度得 375，垂直版面喺呢度先爆）',
  跌出.length === 0,
  Object.fromEntries(跌出.map(([k, v]) => [k, v.跌出畫面])));

const 有細掣 = Object.entries(量).filter(([, v]) => (v.細數 ?? 0) > 0);
check(`每隻遊戲嘅控制都至少 ${MIN_TAP}×${MIN_TAP}`, 有細掣.length === 0,
  Object.fromEntries(有細掣.map(([k, v]) => [k, { 細數: v.細數, 例: v.細 }])));

console.log('\n各遊戲一覽：');
for (const [k, v] of Object.entries(量)) {
  console.log(`  ${k.padEnd(26)} 控制 ${String(v.控制數 ?? '-').padStart(3)}　細掣 ${String(v.細數 ?? '-').padStart(3)}　爆版 ${v.爆版 ? 'YES' : 'no'}　error ${(v.errors ?? []).length}`);
}
console.log(`\nhub 手機觸控: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
