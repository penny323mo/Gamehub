// Penny Crush real-browser player flow.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/penny-crush-flow.mjs
//
// 消除、補位同特殊磚係一條 async chain。呢把尺先觸發一個必然消除，再即刻
// Restart；舊 chain 唔可以改新局，但冇被取消嘅新局仍然要正常計分。
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
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mjs': 'text/javascript',
};
const pennyHTML = fs.readFileSync(path.join(ROOT, 'games/penny_crush/index.html'), 'utf8');
const localScriptToken = pennyHTML.match(/penny_crush\.js\?v=([^"']+)/)?.[1] || null;

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

const url = `http://localhost:${port}/games/penny_crush/index.html`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.locator('#pc-menu button').filter({ hasText: '8x8' }).click();
await page.waitForSelector('#pc-game:not(.hidden)');

check('Penny Crush script has a cache-bust token', localScriptToken === 'penny-crush-20260811a', localScriptToken);
check('手機 8x8 棋盤完整顯示',
  await page.locator('#pc-grid .pc-tile').count() === 64,
  await page.locator('#pc-grid .pc-tile').count());

const triggerGuaranteedMatch = () => page.evaluate(() => {
  const grid = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => `pc-char-${((r * 2 + c) % 5) + 1}`));
  // Column 0 is A, A, B, A; swapping rows 2/3 creates a three-in-a-row.
  grid[0][0] = 'pc-char-1';
  grid[1][0] = 'pc-char-1';
  grid[2][0] = 'pc-char-2';
  grid[3][0] = 'pc-char-1';
  window.__pennyCrush.grid = grid;
  window.__pennyCrush.renderGrid();
  window.__pennyCrush.activateForcedSwap();
  window.__pennyCrush.handleInteraction(2, 0);
  window.__pennyCrush.handleInteraction(3, 0);
});

await triggerGuaranteedMatch();
await page.waitForTimeout(40);
await page.locator('#pc-game button').filter({ hasText: 'Restart' }).click();
const freshAfterRestart = await page.evaluate(() => ({
  generation: window.__pennyCrush.generation,
  score: window.__pennyCrush.score,
  processing: window.__pennyCrush.isProcessing,
  grid: window.__pennyCrush.grid.map((row) => row.slice()),
  tileCount: document.querySelectorAll('#pc-grid .pc-tile').length,
}));
await page.waitForTimeout(1200);
const staleAfter = await page.evaluate(() => ({
  score: window.__pennyCrush.score,
  processing: window.__pennyCrush.isProcessing,
  grid: window.__pennyCrush.grid.map((row) => row.slice()),
  tileCount: document.querySelectorAll('#pc-grid .pc-tile').length,
}));
check('Restart 會建立新 generation', freshAfterRestart.generation >= 2, freshAfterRestart);
check('舊消除 chain 唔會污染新局',
  staleAfter.score === 0 && staleAfter.processing === false && staleAfter.tileCount === 64 &&
    JSON.stringify(staleAfter.grid) === JSON.stringify(freshAfterRestart.grid),
  { freshAfterRestart, staleAfter });

await triggerGuaranteedMatch();
await page.waitForFunction(() => window.__pennyCrush.isProcessing === false && window.__pennyCrush.score > 0,
  null, { timeout: 5000 });
const normalAfter = await page.evaluate(() => ({
  score: window.__pennyCrush.score,
  processing: window.__pennyCrush.isProcessing,
  tileCount: document.querySelectorAll('#pc-grid .pc-tile').length,
}));
check('新局仍會正常完成消除並計分', normalAfter.score > 0 && normalAfter.processing === false && normalAfter.tileCount === 64,
  normalAfter);
check('Penny Crush flow 冇非預期 browser error', errors.length === 0, errors);

console.log(`\npenny crush flow: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
