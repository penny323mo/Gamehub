// Gomoku real-browser player flow.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/gomoku-flow.mjs
//
// 單機 AI 係用延遲 timer 落白子。呢把尺專門驗導航／開新局之後，舊 timer
// 唔可以污染新盤；同時保留一條正常 AI 回應，避免「修好取消」變成 AI 唔行。
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
  '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
};
const gomokuHTML = fs.readFileSync(path.join(ROOT, 'games/gomoku/index.html'), 'utf8');
const localScriptTokens = [...gomokuHTML.matchAll(/<script src="js\/[^"?]+\.js\?v=([^"]+)"/g)].map((m) => m[1]);

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
  // Offline mode deliberately aborts optional online probes.
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

const url = `http://localhost:${port}/games/gomoku/index.html`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#landing-page:not(.hidden)');
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#landing-page:not(.hidden)');

check('Gomoku local scripts share one cache token',
  localScriptTokens.length === 6 && new Set(localScriptTokens).size === 1,
  localScriptTokens);

const tapCenter = async () => {
  const rect = await page.locator('#gomoku-board').boundingBox();
  if (!rect) throw new Error('Gomoku board canvas is not visible');
  await page.mouse.click(rect.x + rect.width * 0.5, rect.y + rect.height * 0.5);
};
const touchCenter = async () => {
  const rect = await page.locator('#gomoku-board').boundingBox();
  if (!rect) throw new Error('Gomoku board canvas is not visible');
  await page.touchscreen.tap(rect.x + rect.width * 0.5, rect.y + rect.height * 0.5);
};
const state = () => page.evaluate(() => ({
  cells: window.__gomoku.board.flat().filter(Boolean).length,
  black: window.__gomoku.board.flat().filter((cell) => cell === 'black').length,
  white: window.__gomoku.board.flat().filter((cell) => cell === 'white').length,
  currentPlayer: window.__gomoku.currentPlayer,
  gameOver: window.__gomoku.gameOver,
}));

await page.locator('#gomoku-ai-btn').click();
await page.waitForSelector('#game-board-area:not(.hidden)');
const boardBox = await page.locator('#gomoku-board').boundingBox();
if (!boardBox) throw new Error('Gomoku board canvas is not visible for touch cancellation gate');
const interruptedTouch = await page.evaluate(({ x, y }) => {
  const canvas = document.querySelector('#gomoku-board');
  const touch = new Touch({ identifier: 91, target: canvas, clientX: x, clientY: y, screenX: x, screenY: y });
  canvas.dispatchEvent(new TouchEvent('touchstart', {
    bubbles: true, cancelable: true, changedTouches: [touch], touches: [touch], targetTouches: [touch],
  }));
  canvas.dispatchEvent(new TouchEvent('touchcancel', {
    bubbles: true, cancelable: true, changedTouches: [touch], touches: [], targetTouches: [],
  }));
  return window.__gomoku.board.flat().filter(Boolean).length;
}, { x: boardBox.x + boardBox.width * 0.5, y: boardBox.y + boardBox.height * 0.5 });
check('Gomoku touchcancel 唔會誤落棋', interruptedTouch === 0, interruptedTouch);

const draggedTouch = await page.evaluate(({ x, y }) => {
  const canvas = document.querySelector('#gomoku-board');
  const point = (clientX, clientY) => new Touch({ identifier: 92, target: canvas, clientX, clientY, screenX: clientX, screenY: clientY });
  const start = point(x, y);
  canvas.dispatchEvent(new TouchEvent('touchstart', {
    bubbles: true, cancelable: true, changedTouches: [start], touches: [start], targetTouches: [start],
  }));
  const moved = point(x + 36, y + 2);
  canvas.dispatchEvent(new TouchEvent('touchmove', {
    bubbles: true, cancelable: true, changedTouches: [moved], touches: [moved], targetTouches: [moved],
  }));
  canvas.dispatchEvent(new TouchEvent('touchend', {
    bubbles: true, cancelable: true, changedTouches: [moved], touches: [], targetTouches: [],
  }));
  return window.__gomoku.board.flat().filter(Boolean).length;
}, { x: boardBox.x + boardBox.width * 0.5, y: boardBox.y + boardBox.height * 0.5 });
check('Gomoku 移動手指後放手唔會誤落棋', draggedTouch === 0, draggedTouch);

const backgroundedTouch = await page.evaluate(({ x, y }) => {
  const canvas = document.querySelector('#gomoku-board');
  const touch = new Touch({ identifier: 93, target: canvas, clientX: x, clientY: y, screenX: x, screenY: y });
  canvas.dispatchEvent(new TouchEvent('touchstart', {
    bubbles: true, cancelable: true, changedTouches: [touch], touches: [touch], targetTouches: [touch],
  }));
  window.dispatchEvent(new Event('blur'));
  canvas.dispatchEvent(new TouchEvent('touchend', {
    bubbles: true, cancelable: true, changedTouches: [touch], touches: [], targetTouches: [],
  }));
  return window.__gomoku.board.flat().filter(Boolean).length;
}, { x: boardBox.x + boardBox.width * 0.5, y: boardBox.y + boardBox.height * 0.5 });
check('Gomoku blur 後遲到 touchend 唔會誤落棋', backgroundedTouch === 0, backgroundedTouch);

const pointerCancelledTouch = await page.evaluate(({ x, y }) => {
  const canvas = document.querySelector('#gomoku-board');
  const touch = new Touch({ identifier: 94, target: canvas, clientX: x, clientY: y, screenX: x, screenY: y });
  canvas.dispatchEvent(new TouchEvent('touchstart', {
    bubbles: true, cancelable: true, changedTouches: [touch], touches: [touch], targetTouches: [touch],
  }));
  canvas.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 94, pointerType: 'touch' }));
  canvas.dispatchEvent(new TouchEvent('touchend', {
    bubbles: true, cancelable: true, changedTouches: [touch], touches: [], targetTouches: [],
  }));
  return window.__gomoku.board.flat().filter(Boolean).length;
}, { x: boardBox.x + boardBox.width * 0.5, y: boardBox.y + boardBox.height * 0.5 });
check('Gomoku pointercancel 後遲到 touchend 唔會誤落棋', pointerCancelledTouch === 0, pointerCancelledTouch);

await touchCenter();
await page.waitForFunction(() => window.__gomoku?.currentPlayer === 'white');
const afterHuman = await state();
check('人手落黑子後輪到 AI',
  afterHuman.cells === 1 && afterHuman.black === 1 && afterHuman.white === 0 && afterHuman.currentPlayer === 'white',
  afterHuman);

// Leave immediately, then start a fresh AI game before the old 500 ms turn fires.
await page.locator('#ai-controls button').click();
await page.waitForSelector('#landing-page:not(.hidden)');
await page.locator('#gomoku-ai-btn').click();
await page.waitForSelector('#game-board-area:not(.hidden)');
await page.waitForTimeout(750);
const afterRestart = await state();
check('離開再開新局後舊 AI timer 不會落錯棋',
  afterRestart.cells === 0 && afterRestart.black === 0 && afterRestart.white === 0 && afterRestart.currentPlayer === 'black',
  afterRestart);

await tapCenter();
await page.waitForFunction(() => window.__gomoku?.board?.flat?.().filter(Boolean).length === 2, null, { timeout: 5000 });
const afterAI = await state();
check('新局正常等到 AI 落白子',
  afterAI.cells === 2 && afterAI.black === 1 && afterAI.white === 1 && afterAI.currentPlayer === 'black',
  afterAI);
check('Gomoku flow 冇非預期 browser error', errors.length === 0, errors);

console.log(`\ngomoku flow: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
