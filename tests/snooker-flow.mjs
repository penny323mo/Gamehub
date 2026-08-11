// Snooker real-browser player flow.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/snooker-flow.mjs
//
// Snooker 有 root mode picker、2D canvas 同 3D WebGL 兩條離線入口；呢把尺
// 守住手機版入場、2D 拖桿輸入、3D 開局同返回 Hub，避免其中一版靜默失效。
import crypto from 'node:crypto';
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
const hash = (buffer) => crypto.createHash('sha1').update(buffer).digest('hex');
const base = `http://localhost:${port}`;

await page.goto(`${base}/games/snooker/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.locator('#landing-page button').filter({ hasText: '單人模式' }).click();
check('Snooker root 可以打開單人版本選擇',
  await page.locator('#single-version').isVisible() && await page.locator('#single-version a').count() === 2,
  await page.locator('#single-version a').allTextContents());

await page.locator('a[href="./2d/index.html"]').click();
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(300);
const twoDBox = await page.locator('#table').boundingBox();
check('2D 手機 canvas 入場無水平溢出',
  Boolean(twoDBox) && (await page.evaluate(() => document.documentElement.scrollWidth)) <= 390,
  { box: twoDBox, scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth) });
check('2D 初始狀態同開始掣可用',
  await page.locator('#startBtn').isVisible() && (await page.locator('#status-msg').textContent()).includes('準備開始'),
  (await page.locator('#status-msg').textContent()).trim());

await page.locator('#startBtn').click();
await page.locator('#aimBtn').click();
const beforeShot = hash(await page.locator('#table').screenshot());
const box = await page.locator('#table').boundingBox();
if (!box) throw new Error('Snooker 2D canvas is not visible');
const cue = { x: box.x + box.width * 0.2, y: box.y + box.height * 0.5 };
await page.mouse.move(cue.x, cue.y);
await page.mouse.down();
await page.mouse.move(cue.x - 45, cue.y, { steps: 4 });
await page.mouse.up();
await page.waitForTimeout(100);
const afterShot = hash(await page.locator('#table').screenshot());
check('2D 拖桿輸入會由擺位進入擊球畫面',
  beforeShot !== afterShot && (await page.locator('#status-msg').textContent()).includes('位置已確認'),
  { beforeShot, afterShot, status: (await page.locator('#status-msg').textContent()).trim() });
await page.locator('#restartBtn2').click();
check('2D 重新開始回到新一局擺位',
  (await page.locator('#status-msg').textContent()).includes('準備開始'),
  (await page.locator('#status-msg').textContent()).trim());

await page.goto(`${base}/games/snooker/3d/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(700);
const initial3d = await page.evaluate(() => ({
  canvas: document.getElementById('game')?.getBoundingClientRect().toJSON(),
  text: typeof window.render_game_to_text === 'function' ? JSON.parse(window.render_game_to_text()) : null,
  status: document.getElementById('status')?.textContent || '',
}));
check('3D WebGL 手機入口有 canvas 同可讀狀態',
  initial3d.canvas?.width === 390 && initial3d.canvas?.height === 844 &&
    initial3d.text?.turnState === 'PLACE_CUE' && !initial3d.text?.snookered && initial3d.status.includes('開始遊戲'),
  initial3d);
await page.locator('#start-game-btn').click();
await page.waitForTimeout(120);
const started3d = await page.evaluate(() => ({
  text: typeof window.render_game_to_text === 'function' ? JSON.parse(window.render_game_to_text()) : null,
  status: document.getElementById('status')?.textContent || '',
}));
check('3D 開始遊戲進入擺白球狀態',
  started3d.text?.turnState === 'PLACE_CUE' && !started3d.text?.snookered && started3d.status.includes('drag cue ball'),
  started3d);
await page.locator('#back-btn').click();
await page.waitForLoadState('domcontentloaded');
check('3D 返回掣回到 Snooker root',
  page.url().endsWith('/games/snooker/index.html') && await page.locator('#landing-page').isVisible(),
  page.url());

// Offline P2 is a local two-player match, so a foul decision must remain
// actionable for either seat. This used to deadlock after P1 fouled because
// the UI treated every offline match as P1 vs AI and hid P2's decision panel.
await page.goto(`${base}/games/snooker/3d/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(500);
await page.locator('#player2-mode').selectOption('p2');
await page.locator('#start-game-btn').click();
await page.waitForTimeout(100);
const p2Foul = await page.evaluate(() => {
  const D = window.__snookerDebug;
  D.setAiEnabled(false);
  D.reset();
  D.placeCueInD(0, -1.1);
  D.confirmCuePlacement();
  D.shoot(0, 1, 0.65); // brown first on the break: deterministic foul
  return D.runUntilSettled(12);
});
check('Offline P2 犯規後會顯示可操作決策面板',
  p2Foul.foulDecisionPending && p2Foul.foulDecisionContext?.beneficiary === 1 &&
    await page.locator('#decision-panel').isVisible() &&
    await page.locator('#decision-take').isVisible() &&
    await page.locator('#decision-force').isVisible(),
  { state: p2Foul, panel: (await page.locator('#decision-text').textContent()).trim() });

await page.locator('#decision-take').click();
const p2Take = await page.evaluate(() => window.__snookerDebug.state());
check('Offline P2 可以接手並解除 FOUL_DECISION',
  !p2Take.foulDecisionPending && p2Take.player === 2 &&
    p2Take.turnState === 'PLACE_CUE' && !await page.locator('#decision-panel').isVisible(),
  p2Take);

const p2FoulAgain = await page.evaluate(() => {
  const D = window.__snookerDebug;
  D.reset();
  D.placeCueInD(0, -1.1);
  D.confirmCuePlacement();
  D.shoot(0, 1, 0.65);
  return D.runUntilSettled(12);
});
check('Offline P2 第二次犯規仍可要求犯規方續打',
  p2FoulAgain.foulDecisionPending && await page.locator('#decision-panel').isVisible(),
  p2FoulAgain);
await page.locator('#decision-force').click();
const p2Force = await page.evaluate(() => window.__snookerDebug.state());
check('要求續打後由犯規方繼續並解除決策鎖',
  !p2Force.foulDecisionPending && p2Force.player === 1 &&
    p2Force.turnState === 'PLACE_CUE' && !await page.locator('#decision-panel').isVisible(),
  p2Force);

check('Snooker flow 冇非預期 browser error', errors.length === 0, errors);
console.log(`\nsnooker flow: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
