// Xiangqi real-browser player flow.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/xiangqi-flow.mjs
//
// Engine selftests 唔會捉到 UI state 同 resumable storage 脫節。呢把尺用真
// mobile pointer tap 落一隻兵，等 AI 回應，再驗悔棋同 refresh/Continue：
// 悔咗嘅局面必須同 localStorage 一致，唔可以復活玩家啱啱撤回嘅一步。
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
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.hdr': 'image/vnd.radiance', '.json': 'application/json', '.woff2': 'font/woff2',
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
  // Offline mode deliberately aborts the optional Supabase request.
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

await page.goto(`http://localhost:${port}/games/xiangqi-ai/dist/index.html`, {
  waitUntil: 'domcontentloaded', timeout: 60000,
});
await page.waitForSelector('#landing-page:not(.hidden)');
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#landing-page:not(.hidden)');
await page.locator('#xiangqi-ai-btn').click();
await page.waitForSelector('#game-container:not(.hidden)');
await page.waitForTimeout(650);

const targetPoint = async (boardIndex) => page.evaluate((wanted) => {
  const rect = document.querySelector('#board').getBoundingClientRect();
  for (let y = Math.ceil(rect.top); y <= rect.bottom; y += 2) {
    for (let x = Math.ceil(rect.left); x <= rect.right; x += 2) {
      if (window.Render.hitTest(x, y) === wanted) return { x, y };
    }
  }
  return null;
}, boardIndex);
const waitForTargetPoint = async (boardIndex, timeout = 5000) => {
  const deadline = Date.now() + timeout;
  do {
    const point = await targetPoint(boardIndex);
    if (point) return point;
    await page.waitForTimeout(50);
  } while (Date.now() < deadline);
  throw new Error(`棋盤已顯示但 ${timeout}ms 內仍未可命中棋格 ${boardIndex}`);
};
const tapCell = async (boardIndex) => {
  const point = await waitForTargetPoint(boardIndex);
  await page.touchscreen.tap(point.x, point.y);
  await page.waitForTimeout(350);
};

const before = await page.evaluate(() => ({
  turn: window.__xiangqiRun.現輪到(),
  pawnFrom: window.__xiangqiRun.現盤()[54],
  pawnTo: window.__xiangqiRun.現盤()[45],
}));
await tapCell(54); // red pawn (6,0)
await tapCell(45); // legal forward move to (5,0)
await page.waitForFunction(() => window.__xiangqiRun?.現盤?.()[54] === 0, null, { timeout: 5000 });
await page.waitForFunction(() => window.__xiangqiRun?.現輪到?.() === 1, null, { timeout: 30000 });
await page.waitForTimeout(250);

const afterAI = await page.evaluate(() => ({
  turn: window.__xiangqiRun.現輪到(),
  pawnFrom: window.__xiangqiRun.現盤()[54],
  pawnTo: window.__xiangqiRun.現盤()[45],
  undoDisabled: document.querySelector('#btn-undo').disabled,
  moves: document.querySelector('#movelog').childElementCount,
  saved: JSON.parse(localStorage.getItem('xiangqi_ai_run_v1') || 'null'),
}));
check('真實 tap 落子後 AI 回應，悔棋可用',
  before.turn === 1 && before.pawnFrom === 17 && before.pawnTo === 0 &&
  afterAI.turn === 1 && afterAI.pawnFrom === 0 && afterAI.pawnTo === 17 &&
  afterAI.undoDisabled === false && afterAI.moves === 2,
  { before, afterAI: { ...afterAI, saved: !!afterAI.saved } });

await page.locator('#btn-undo').click();
await page.waitForFunction(() => window.__xiangqiRun?.現盤?.()[54] === 17);
await page.waitForTimeout(200);
const afterUndo = await page.evaluate(() => ({
  pawnFrom: window.__xiangqiRun.現盤()[54],
  pawnTo: window.__xiangqiRun.現盤()[45],
  undoDisabled: document.querySelector('#btn-undo').disabled,
  moves: document.querySelector('#movelog').childElementCount,
  saved: localStorage.getItem('xiangqi_ai_run_v1'),
}));
check('悔棋後畫面同存檔同步，唔會留低撤回局面',
  afterUndo.pawnFrom === 17 && afterUndo.pawnTo === 0 && afterUndo.undoDisabled === true &&
  afterUndo.moves === 0 && afterUndo.saved === null, afterUndo);

await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#landing-page:not(.hidden)');
await page.waitForTimeout(450);
const afterReload = await page.evaluate(() => ({
  continueHidden: document.querySelector('#xiangqi-continue-btn').classList.contains('hidden'),
  save: localStorage.getItem('xiangqi_ai_run_v1'),
}));
check('refresh 後唔會顯示已悔清嘅 Continue', afterReload.continueHidden && afterReload.save === null, afterReload);

// Run the interruption gate after the normal flow so a deliberately cancelled
// pointer cannot contaminate the following tap sequence in this test page.
await page.locator('#xiangqi-ai-btn').click();
await page.waitForSelector('#game-container:not(.hidden)');
const interruptedTouchPoint = await waitForTargetPoint(54);
await page.mouse.move(interruptedTouchPoint.x, interruptedTouchPoint.y);
await page.mouse.down();
const interruptedTouch = await page.evaluate((point) => {
  const canvas = document.querySelector('#board');
  const before = window.__xiangqiRun.現盤().slice();
  canvas.dispatchEvent(new PointerEvent('pointercancel', {
    bubbles: true,
    cancelable: true,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true,
    clientX: point.x,
    clientY: point.y,
  }));
  // A late up/click must remain inert after cancellation.
  canvas.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: point.x,
    clientY: point.y,
  }));
  return {
    state: window.__xiangqiInput.state(),
    before,
    after: window.__xiangqiRun.現盤().slice(),
  };
}, interruptedTouchPoint);
await page.mouse.up();
check('中斷 touch 會清走 Xiangqi pointer 狀態，遲到事件唔會落子',
  interruptedTouch.state.down === false &&
    interruptedTouch.state.pointerId === null &&
    interruptedTouch.state.drag === false &&
    interruptedTouch.state.tap === false &&
    JSON.stringify(interruptedTouch.before) === JSON.stringify(interruptedTouch.after),
  interruptedTouch);
check('單機流程冇非預期 browser error', errors.length === 0, errors);

console.log(`\nxiangqi flow: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
