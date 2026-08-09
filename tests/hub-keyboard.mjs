// Hub-wide keyboard contract.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-keyboard.mjs
//
// 而家三把尺（hub-touch、hub-load、Tower 自己嗰套）全部係量「用手指掂」。
// 但唔係人人用手指：用鍵盤嘅人、用開關掃描器嘅人、部電話插住實體鍵盤嘅人，
// 佢哋淨係得 Tab 同 Enter。呢把尺問兩句：
//
//   1. **每個掂得到嘅控制，Tab 都去到。** 一個撳得到但 Tab 去唔到嘅掣，
//      對用鍵盤嘅人嚟講同唔存在一樣。
//   2. **focus 去到嗰陣睇得到。** 睇唔到 focus 喺邊，等於蒙住眼禁 Tab。
//      量法係對比同一個元素 focus 前後嘅 outline／box-shadow／border——
//      **唔係去 grep `:focus-visible` 有冇寫**，寫咗但被覆蓋一樣係睇唔到。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
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
  '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp',
  '.m4a':'audio/mp4', '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wav':'audio/wav', '.woff2':'font/woff2' };

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
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

const 量 = {};
for (const [名, url] of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0].slice(0, 90)));
  await page.goto(`http://localhost:${port}${encodeURI(url)}`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForTimeout(2500);

  // 先數清楚而家有幾多個「見得到嘅控制」，同埋畀每個一個穩定嘅記號。
  const 目標 = await page.evaluate(() => {
    const 見得到 = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
    };
    const 認 = (el) => el.id || (el.className && String(el.className).split(' ')[0])
      || (el.textContent || '').trim().slice(0, 12) || el.tagName.toLowerCase();
    /*
     * **「見得到」唔等於「應該 Tab 得到」。**
     *
     * Tower 開場畫面係一個 modal，佢將 modal 以外嘅嘢全部設成 `inert`——
     * 你未開波之前係唔應該 Tab 到 pause 掣嘅。我第一版數埋嗰啲，
     * 就報咗「21 個控制得 6 個 Tab 到」，其實嗰 15 個係**特登**唔畀掂。
     *
     * 所以唔好逐個機制去認（inert／aria-hidden／disabled／tabindex=-1…），
     * 直接問一條唔關機制事嘅問題：**佢究竟收唔收得到 focus？**
     * 收得到就一定要 Tab 去到；收唔到就係特登擋住，唔關 Tab 事。
     */
    const list = [...document.querySelectorAll('button, [role="button"], a[href], input, select, [tabindex]')]
      .filter(見得到)
      .filter((el) => {
        if (el.disabled || el.getAttribute('tabindex') === '-1') return false;
        const 原 = document.activeElement;
        el.focus({ preventScroll: true });
        const 收到 = document.activeElement === el;
        if (原 instanceof HTMLElement) 原.focus({ preventScroll: true }); else el.blur();
        return 收到;
      });
    list.forEach((el, i) => { el.dataset.kbMark = String(i); });
    return list.map((el, i) => ({ i, id: 認(el) }));
  });

  /*
   * 禁 Tab 要行足**成個圈再多少少**。
   *
   * 我第一版嘅預算係 `我數到嘅控制數 + 6`——**數錯咗個基數**。
   * 「我認為見得到嘅控制」同「成頁真係有幾多嘢 focus 得到」係兩個數：
   * Racing Car 我數到 18 個，但實際 Tab 得到嘅遠遠唔止（六個賽道掣、
   * 八個顏色格、一堆開關…），禁足 26 下都仲未繞返轉頭。
   * 於是報「hub-btn 掃唔到」——其實係**掃唔夠**，唔係掃唔到。
   * 兩件事喺報告度長得一模一樣，所以預算要對住成頁嘅可 focus 總數計。
   */
  const 可focus總數 = await page.evaluate(() =>
    document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]').length);
  await page.evaluate(() => document.body.focus());
  const 掃到 = new Set();
  const 驗過 = new Set();
  const 冇提示 = [];
  for (let i = 0; i < 可focus總數 * 2 + 10; i += 1) {
    await page.keyboard.press('Tab');
    /*
     * **要等 transition 行完先讀。**
     *
     * `.nav-btn` 寫住 `transition: background 0.2s`，而 `:focus-visible`
     * 改嘅正正就係 background。我第一版禁完 Tab 即刻讀 computed style，
     * 讀到嘅係**動畫第 0 格**——即係仲係未 focus 嗰個色；跟住 blur 再讀，
     * 又係差唔多嘅色。兩邊一樣，於是報「focus 冇提示」。
     * 個提示係有嘅，係我讀得太早。**同閃光 gate 一模一樣嘅錯：
     * 喺一個過渡緊嘅嘢上面攞 t=0 嗰一格。**
     */
    // 等 transition 好貴（每禁一下 Tab 要等兩次）。同一個 id 驗一次就夠——
    // 十二隻遊戲跑足全套本來要成八分鐘，淨係驗未見過嘅就快返幾倍。
    const 快睇 = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return { mark: el.dataset ? el.dataset.kbMark : undefined,
        id: el.id || String(el.className || '').split(' ')[0] || el.tagName.toLowerCase() };
    });
    if (!快睇) continue;
    if (快睇.mark !== undefined) 掃到.add(Number(快睇.mark));
    if (驗過.has(快睇.id)) continue;
    驗過.add(快睇.id);
    const 等 = () => page.waitForTimeout(260);
    await 等();
    const 現 = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return { mark: el.dataset ? el.dataset.kbMark : undefined,
        id: el.id || String(el.className || '').split(' ')[0] || el.tagName.toLowerCase(),
        樣: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.boxShadow} ${cs.borderColor} ${cs.backgroundColor}` };
    });
    if (!現) continue;
    await page.evaluate(() => { window.__kbEl = document.activeElement; document.activeElement.blur(); });
    await 等();
    const r = await page.evaluate(({ 樣 }) => {
      const el = window.__kbEl;
      const cs = getComputedStyle(el);
      const 冇focus = `${cs.outlineStyle} ${cs.outlineWidth} ${cs.boxShadow} ${cs.borderColor} ${cs.backgroundColor}`;
      el.focus();
      return { 睇得到: 樣 !== 冇focus, 冇focus: 冇focus.slice(0, 60) };
    }, { 樣: 現.樣 });
    Object.assign(r, 現);
    if (!r.睇得到 && !冇提示.some((x) => x.id === r.id)) 冇提示.push({ id: r.id, focus: r.樣.slice(0, 44), 冇: r.冇focus.slice(0, 44) });
  }
  量[名] = {
    控制數: 目標.length,
    可focus總數,
    Tab到: 掃到.size,
    去唔到: 目標.filter((t) => !掃到.has(t.i)).map((t) => t.id).slice(0, 6),
    冇focus提示: 冇提示.slice(0, 6),
    errors: errors.slice(0, 2),
  };
  await ctx.close();
}

const 去唔到 = Object.entries(量).filter(([, v]) => v.去唔到.length > 0);
check('每個見得到嘅控制，Tab 都去得到', 去唔到.length === 0,
  Object.fromEntries(去唔到.map(([k, v]) => [k, { 控制: v.控制數, 去唔到: v.去唔到 }])));

const 冇提示 = Object.entries(量).filter(([, v]) => v.冇focus提示.length > 0);
check('focus 去到邊，個人睇得到（唔係靠 grep `:focus-visible` 有冇寫）',
  冇提示.length === 0,
  Object.fromEntries(冇提示.map(([k, v]) => [k, v.冇focus提示])));

check('禁 Tab 期間零 browser error',
  Object.values(量).every((v) => v.errors.length === 0),
  Object.fromEntries(Object.entries(量).filter(([, v]) => v.errors.length).map(([k, v]) => [k, v.errors])));

console.log('\n各遊戲一覽：');
for (const [k, v] of Object.entries(量)) {
  console.log(`  ${k.padEnd(16)} 控制 ${String(v.控制數).padStart(3)}　Tab到 ${String(v.Tab到).padStart(3)}　冇focus提示 ${v.冇focus提示.length}`);
}
console.log(`\nhub 鍵盤: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
