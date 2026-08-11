// Neon Snake real-browser player flow.
// 跑法：PW_CHROMIUM=/path/to/chromium node tests/snake-flow.mjs
//
// 名稱輸入框自己處理 Enter；事件唔可以冒泡到遊戲 keydown handler，令登入
// 同一刻偷偷開局。之後再守住手機開始、暫停／繼續同返回 Hub。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = await import('playwright').catch(async () => {
  const HERE = path.dirname(fileURLToPath(import.meta.url));
  return import(pathToFileURL(path.resolve(HERE, '../games/tower/node_modules/playwright/index.mjs')).href);
});

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('404');
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
const port = await new Promise((resolve) => server.listen(0, () => resolve(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error' && !/ERR_CONNECTION_FAILED|Failed to load resource/.test(msg.text())) {
    errors.push(msg.text());
  }
});
await page.route((url) => !['localhost', '127.0.0.1'].includes(url.hostname),
  (route) => route.abort('connectionfailed').catch(() => {}));

let pass = 0;
let fail = 0;
const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const apiState = () => page.evaluate(() => ({
  running: window.__snake?.打緊?.() ?? null,
  paused: window.__snake?.停咗?.() ?? null,
  ticks: window.__snake?.格數?.() ?? null,
  boosting: window.__snake?.加速中?.() ?? null,
}));

const base = `http://localhost:${port}`;
await page.goto(`${base}/games/snake-game/dist/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.locator('input[placeholder="你的名稱"]').fill('Codex');
await page.locator('input[placeholder="你的名稱"]').press('Enter');
await page.waitForTimeout(150);
const afterLogin = await apiState();
check('名稱輸入按 Enter 唔會繞過開始畫面', afterLogin.running === false, afterLogin);
check('Snake 登入頁手機版無 overflow',
  await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })));

await page.getByRole('button', { name: /開始遊戲/ }).last().click();
// 開始掣本身會等 100ms 先開局，而第一關 tick 係 250ms 一格；
// 留足一格以上先驗證唔係只改咗 running flag。
await page.waitForTimeout(500);
const started = await apiState();
check('Snake 新局正常開始並行格', started.running === true && started.ticks > 0, started);
check('Snake 遊戲中手機版仍無 overflow',
  await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })));

// Shift 係一個「按住」輸入；切走視窗時瀏覽器未必會送 keyup，失焦必須清除手動加速。
await page.keyboard.down('Shift');
await page.waitForTimeout(80);
const heldBoost = await apiState();
check('Shift 按住會開啟加速', heldBoost.boosting === true, heldBoost);
await page.evaluate(() => window.dispatchEvent(new Event('blur')));
await page.waitForTimeout(80);
const blurClearedBoost = await apiState();
check('視窗失焦會清除手動加速', blurClearedBoost.boosting === false, blurClearedBoost);
await page.keyboard.up('Shift');

const tickBeforePause = started.ticks;
await page.locator('button[aria-label="暫停"]').click();
await page.waitForTimeout(120);
const paused = await apiState();
await page.waitForTimeout(450);
const pausedLater = await apiState();
check('手機暫停會停住模擬', paused.paused === true && paused.running === false && pausedLater.ticks === tickBeforePause,
  { paused, pausedLater, tickBeforePause });

await page.locator('button[aria-label="繼續"]').click();
await page.waitForTimeout(350);
const resumed = await apiState();
check('手機繼續會恢復模擬', resumed.paused === false && resumed.running === true && resumed.ticks > tickBeforePause,
  resumed);

await page.locator('button[aria-label="暫停"]').click();
await page.waitForTimeout(80);
await page.getByRole('button', { name: /返回 Game Hub/i }).click();
await page.waitForLoadState('domcontentloaded');
check('Snake 暫停畫面可以返回 Hub', page.url().endsWith('/index.html') && (await page.title()) === 'Game Hub', page.url());
check('Snake flow 冇非預期 browser error', errors.length === 0, errors);

console.log(`\nsnake flow: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
