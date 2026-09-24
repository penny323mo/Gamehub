// Olden Ring (千燈古塔) real-browser flow gate.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/olden-ring-flow.mjs
//
// 守嘅係「一局由頭行到尾」：選單 → 登塔 → 第一層 → 過層 → 揀祝福 → 第二層 → 倒下 → 結算 → 最佳紀錄
// → 再登塔；加埋 storage 封死、手機觸控掣、零外網請求、零 console／page error。
//
// SwiftShader 下 WebGL 每秒得一兩格，打 45 個擊破要好耐，所以用 `?test` 嘅 `__olden` seam 直接
// 撥樓層計數同過場計時——量嘅係「規則同介面接得啱唔啱」，唔係手感（手感要真機睇）。
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const PW = [
  path.join(ROOT, 'games', 'tower', 'node_modules', 'playwright', 'index.mjs'),
  path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs'),
].find(fs.existsSync);
if (!PW) { console.error('搵唔到 playwright：喺 games/tower 行一次 npm ci 先'); process.exit(2); }
const { chromium } = await import(pathToFileURL(PW).href);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port)));
const BASE = `http://127.0.0.1:${port}`;
const URL_TEST = `${BASE}/games/olden-ring/index.html?test&enemies=60`;

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const executablePath = [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium'].find((p) => p && fs.existsSync(p));
const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });

async function open(ctxOpts, url = URL_TEST, init) {
  const ctx = await browser.newContext(ctxOpts);
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const errors = [], external = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 160)}`); });
  page.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  page.on('response', (r) => { if (r.url().startsWith(BASE) && r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!globalThis.__olden || document.getElementById('menu'), null, { timeout: 60000 });
  return { ctx, page, errors, external };
}
const until = (page, fn, ms = 90000) => page.waitForFunction(fn, null, { timeout: ms, polling: 200 }).then(() => true, () => false);

// ---------- 1. 桌面：成個循環 ----------
{
  const { ctx, page, errors, external } = await open({ viewport: { width: 640, height: 360 } });
  const menu = await page.evaluate(() => ({
    visible: !document.getElementById('menu').hidden,
    title: document.title,
    hub: document.getElementById('hub')?.getAttribute('href'),
    go: document.getElementById('go')?.textContent.trim(),
  }));
  check('選單一開就見到，有「登塔」同返 Hub 路', menu.visible && /登塔/.test(menu.go) && menu.hub === '../../index.html', menu);
  check('頁面標題係 Olden Ring', /Olden Ring/.test(menu.title), menu.title);

  await page.click('#go');
  const started = await until(page, () => __olden.tower.phase === 'fight' && !document.getElementById('tw-floor').hidden);
  const s0 = await page.evaluate(() => ({ floor: __olden.tower.floor, quota: __olden.tower.quota, text: document.querySelector('#tw-floor').innerText.replace(/\s+/g, ' '), mortal: __olden.game.mortal }));
  check('登塔之後喺第一層，有擊破目標同樓層條', started && s0.floor === 1 && s0.quota > 0 && /第一層/.test(s0.text), s0);

  // 過層 → 祝福
  await page.evaluate(() => { __olden.tower.floorKOs = __olden.tower.quota; });
  const cleared = await until(page, () => __olden.tower.phase === 'clear');
  await page.evaluate(() => { __olden.tower.holdT = 1e6; });
  const offered = await until(page, () => __olden.tower.phase === 'boon' && document.querySelectorAll('#tw-boon .tw-card').length === 3);
  const cards = await page.evaluate(() => [...document.querySelectorAll('#tw-boon .tw-card')].map((b) => {
    const r = b.getBoundingClientRect(); return { id: b.dataset.boon, w: Math.round(r.width), h: Math.round(r.height) }; }));
  check('夠數就過層，然後出三張唔同嘅祝福卡', cleared && offered && new Set(cards.map((c) => c.id)).size === 3, cards);
  check('祝福卡夠大撳（≥ 44px）', cards.every((c) => c.w >= 44 && c.h >= 44), cards);
  const held = await page.evaluate(() => { const f = __olden.game.frame; return new Promise((r) => setTimeout(() => r(__olden.game.frame === f && __olden.tower.hold), 1200)); });
  check('揀祝福期間世界停住（sim frame 唔郁）', held);

  // 鍵盤揀第一張
  const firstBoon = cards[0].id;
  await page.keyboard.press('Digit1');
  const up = await until(page, () => __olden.tower.phase === 'fight' && __olden.tower.floor === 2);
  const s1 = await page.evaluate(() => ({ floor: __olden.tower.floor, boons: __olden.tower.boons, kos: __olden.tower.floorKOs, text: document.querySelector('#tw-floor').innerText.replace(/\s+/g, ' ') }));
  check('揀完祝福上第二層，計數歸零，祝福記低', up && s1.boons[0] === firstBoon && s1.kos === 0 && /第二層/.test(s1.text), s1);

  // 倒下 → 結算
  await page.evaluate(() => { const h = __olden.game.hero; h.iframes = 0; h.state = 'idle'; h.move = null; h.hurt(1e9, h.x + 1, h.z, true); });
  const falling = await until(page, () => __olden.tower.phase === 'falling');
  await page.evaluate(() => { __olden.tower.holdT = 1e6; });
  const dead = await until(page, () => __olden.tower.phase === 'dead' && !document.getElementById('tw-result').hidden);
  const res = await page.evaluate(() => ({ text: document.getElementById('tw-result').innerText.replace(/\s+/g, ' '),
    best: JSON.parse(localStorage.getItem('olden-ring-best-v1') || 'null'), hub: document.getElementById('tw-hub').getAttribute('href') }));
  check('主角會倒下（唔再係 1 HP 不死），出結算', falling && dead && /第二層/.test(res.text), res.text);
  check('結算寫低本機最佳紀錄，有返 Hub 路', res.best && res.best.floor === 2 && res.hub === '../../index.html', res.best);

  await page.click('#tw-again');
  const again = await until(page, () => __olden.tower.phase === 'fight' && __olden.tower.floor === 1 && __olden.game.hero.hp === __olden.game.hero.hpMax);
  check('「再登古塔」由第一層滿血重新開始', again);

  check('桌面唔顯示觸控掣', await page.evaluate(() => document.getElementById('touch').hidden));
  check('零外網請求', external.length === 0, external.slice(0, 3));
  check('零 console／page／HTTP error', errors.length === 0, errors.slice(0, 5));
  await ctx.close();
}

// ---------- 2. 手機橫屏：觸控掣 ----------
{
  const { ctx, page, errors } = await open({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const menuTouch = await page.evaluate(() => ({ guide: getComputedStyle(document.querySelector('#menu .touch-guide')).display, padHidden: getComputedStyle(document.getElementById('touch')).display }));
  check('手機選單顯示觸控說明，選單打開時觸控掣收埋', menuTouch.guide !== 'none' && menuTouch.padHidden === 'none', menuTouch);
  await page.tap('#go');
  await until(page, () => __olden.tower.phase === 'fight');
  const pad = await page.evaluate(() => [...document.querySelectorAll('#touch .t-btn')].map((b) => {
    const r = b.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { act: b.dataset.act, w: Math.round(r.width), h: Math.round(r.height), inside: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, hit: hit === b || b.contains(hit) };
  }));
  check('五粒觸控掣齊（攻蓄閃躍龍）', pad.map((p) => p.act).sort().join(',') === 'attack,charge,dodge,jump,musou', pad);
  check('觸控掣 ≥ 44px、喺畫面入面、中心撳得中自己', pad.every((p) => p.w >= 44 && p.h >= 44 && p.inside && p.hit), pad);
  // 撳「攻」→ sim 收到攻擊
  const attacked = await page.evaluate(async () => {
    const b = document.querySelector('#touch .tb-atk'); const r = b.getBoundingClientRect();
    const ev = (type) => b.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: r.left + 5, clientY: r.top + 5 }));
    ev('pointerdown');
    const t0 = performance.now();
    while (performance.now() - t0 < 15000) { if (__olden.game.hero.move) break; await new Promise((r2) => setTimeout(r2, 100)); }
    ev('pointerup');
    return __olden.game.hero.move;
  });
  check('撳「攻」掣主角真係出招', !!attacked, attacked);
  // Penny 真機：第一層清咗之後祝福卡撳極都冇反應——觸控層疊咗喺卡上面；卡亦擠出畫面左邊。
  await page.evaluate(() => { __olden.tower.floorKOs = __olden.tower.quota; });
  await until(page, () => __olden.tower.phase === 'clear');
  await page.evaluate(() => { __olden.tower.holdT = 1e6; });
  await until(page, () => __olden.tower.phase === 'boon');
  const cardsM = await page.evaluate(() => [...document.querySelectorAll('#tw-boon .tw-card')].map((b) => {
    const r = b.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { l: Math.round(r.left), r: Math.round(r.right), hit: hit === b || b.contains(hit) }; }));
  check('手機祝福卡全部喺畫面入面、中心撳得中（冇畀觸控層遮住）', cardsM.length === 3 && cardsM.every((c) => c.l >= 0 && c.r <= 844 && c.hit), cardsM);
  await page.tap('#tw-boon .tw-card:nth-child(2)');
  check('手機撳祝福卡真係上到第二層', await until(page, () => __olden.tower.phase === 'fight' && __olden.tower.floor === 2, 60000));
  check('手機唔會一撳攻擊就衝刺飛走（touchMode 冇 dash）', await page.evaluate(() => __olden.game.touchMode === true));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  check('手機冇打橫爆版', overflow);
  check('手機零 console／page／HTTP error', errors.length === 0, errors.slice(0, 5));
  await ctx.close();
}

// ---------- 3. storage 封死 ----------
{
  const blocked = () => {
    const err = () => { throw new DOMException('blocked', 'SecurityError'); };
    Object.defineProperty(window, 'localStorage', { get: err, configurable: true });
  };
  const { ctx, page, errors } = await open({ viewport: { width: 640, height: 360 } }, URL_TEST, blocked);
  await page.click('#go');
  const ok = await until(page, () => __olden.tower.phase === 'fight');
  await page.evaluate(() => { const h = __olden.game.hero; h.iframes = 0; h.state = 'idle'; h.move = null; h.hurt(1e9, h.x + 1, h.z, true); });
  await until(page, () => __olden.tower.phase === 'falling');
  await page.evaluate(() => { __olden.tower.holdT = 1e6; });
  const dead = await until(page, () => __olden.tower.phase === 'dead');
  check('localStorage 封死照玩得、照出結算，零 error', ok && dead && errors.length === 0, errors.slice(0, 3));
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\nolden-ring flow: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
