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
await page.locator('#aimBtn').click();
const cancelledInput = await page.evaluate(() => {
  const canvas = document.getElementById('table');
  const rect = canvas.getBoundingClientRect();
  const emit = (type, pointerId) => canvas.dispatchEvent(new PointerEvent(type, {
    bubbles: true, cancelable: true, pointerId, pointerType: 'touch', isPrimary: true,
    button: 0, buttons: type === 'pointerup' ? 0 : 1,
    clientX: rect.left + rect.width * 0.2 - (type === 'pointermove' ? 70 : 0),
    clientY: rect.top + rect.height * 0.5,
  }));
  emit('pointerdown', 71);
  emit('pointermove', 71);
  const powering = window.__snooker2dDebug.state();
  emit('pointercancel', 71);
  const afterCancel = window.__snooker2dDebug.state();
  emit('pointerdown', 72);
  emit('pointermove', 72);
  const beforeBlur = window.__snooker2dDebug.state();
  window.dispatchEvent(new Event('blur'));
  const afterBlur = window.__snooker2dDebug.state();
  return { powering, afterCancel, beforeBlur, afterBlur };
});
check('2D pointercancel 會取消儲力而唔會卡住瞄準',
  cancelledInput.powering?.inputState === 'powering' && cancelledInput.powering.pullPower > 2 &&
    cancelledInput.afterCancel?.inputState === 'aiming' && cancelledInput.afterCancel.aiming === true &&
    cancelledInput.afterCancel.dragging === false && cancelledInput.afterCancel.pullPower === 0,
  cancelledInput);
check('2D blur 中斷亦會清走儲力狀態',
  cancelledInput.beforeBlur?.inputState === 'powering' && cancelledInput.afterBlur?.inputState === 'aiming' &&
    cancelledInput.afterBlur.aiming === true && cancelledInput.afterBlur.dragging === false &&
    cancelledInput.afterBlur.pullPower === 0,
  cancelledInput);

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

// Mobile 3D must use the actual touch pointer path, not only the debug API.
// A mouse pointer is intentionally not used here: OrbitControls owns desktop
// mouse gestures, while the game reserves one-finger touch for aiming.
await page.locator('#confirm-cue-btn').click();
await page.waitForTimeout(100);
const controlLayout = await page.evaluate(() => {
  const box = (id) => {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    return rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null;
  };
  const spin = box('spin-control');
  const charge = box('mobile-charge-btn');
  const centerX = spin ? spin.left + spin.width / 2 : -1;
  const centerY = spin ? spin.top + spin.height / 2 : -1;
  const hit = centerX >= 0 ? document.elementFromPoint(centerX, centerY)?.closest('#spin-control')?.id : null;
  const overlap = spin && charge
    ? spin.left < charge.right && spin.right > charge.left && spin.top < charge.bottom && spin.bottom > charge.top
    : true;
  return { spin, charge, overlap, hit };
});
check('3D 手機 spin 控件同儲力掣分開，點擊命中 spin 而唔會誤儲力',
  controlLayout.overlap === false && controlLayout.hit === 'spin-control',
  controlLayout);
const spinBox = await page.locator('#spin-control').boundingBox();
if (!spinBox) throw new Error('Snooker 3D spin control is not visible');
await page.mouse.move(spinBox.x + spinBox.width / 2, spinBox.y + spinBox.height / 2);
await page.mouse.down();
const spinHeld = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
await page.evaluate(() => window.dispatchEvent(new Event('blur')));
const spinCancelled = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
await page.mouse.up();
check('3D 手機 spin gesture 失焦會清走而唔會開啟儲力',
  spinHeld?.input?.spinDragging === true && spinHeld?.input?.mobileChargeActive === false &&
    spinCancelled?.input?.spinDragging === false && spinCancelled?.input?.mobileChargeActive === false,
  { held: spinHeld?.input, cancelled: spinCancelled?.input });
const mobileAim = await page.evaluate(() => {
  const canvas = document.getElementById('game');
  const rect = canvas.getBoundingClientRect();
  const emit = (type, x, y, buttons) => canvas.dispatchEvent(new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: 41,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    buttons,
    clientX: x,
    clientY: y,
  }));
  const x = rect.left + rect.width * 0.5;
  const startY = rect.top + rect.height * 0.71; // table-side, above the control dock
  const aimY = rect.top + rect.height * 0.59;
  emit('pointerdown', x, startY, 1);
  const dragging = JSON.parse(window.render_game_to_text());
  emit('pointermove', x, aimY, 1);
  const aimed = JSON.parse(window.render_game_to_text());
  emit('pointerup', x, aimY, 0);
  return { dragging, aimed };
});
check('3D 手機一指觸控會進入瞄準拖動狀態',
  mobileAim.dragging?.turnState === 'AIMING_DRAG' && mobileAim.dragging?.actionRequired === 'CAN_SHOOT' &&
    mobileAim.aimed?.turnState === 'AIMING_DRAG',
  mobileAim);

// A camera/aim pointer can be interrupted before pointerup when the player
// switches app or the browser backgrounds the tab. The next table gesture must
// still receive its own pointerup instead of inheriting the stale camera flag.
const canvasInterruption = await page.evaluate(() => {
  const canvas = document.getElementById('game');
  const rect = canvas.getBoundingClientRect();
  const emit = (type, x, y, pointerId, buttons) => canvas.dispatchEvent(new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    buttons,
    clientX: x,
    clientY: y,
  }));
  const tableX = rect.left + rect.width * 0.5;
  const tableY = rect.top + rect.height * 0.59;

  emit('pointerdown', rect.left + 5, rect.top + 5, 51, 1);
  const blurHeld = JSON.parse(window.render_game_to_text());
  window.dispatchEvent(new Event('blur'));
  const blurCancelled = JSON.parse(window.render_game_to_text());
  emit('pointerdown', tableX, tableY, 52, 1);
  const blurNextDown = JSON.parse(window.render_game_to_text());
  emit('pointerup', tableX, tableY, 52, 0);
  const blurNextUp = JSON.parse(window.render_game_to_text());

  emit('pointerdown', rect.left + 5, rect.top + 5, 53, 1);
  const hiddenHeld = JSON.parse(window.render_game_to_text());
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new Event('visibilitychange'));
  delete document.hidden;
  const hiddenCancelled = JSON.parse(window.render_game_to_text());
  emit('pointerdown', tableX, tableY, 54, 1);
  const hiddenNextDown = JSON.parse(window.render_game_to_text());
  emit('pointerup', tableX, tableY, 54, 0);
  const hiddenNextUp = JSON.parse(window.render_game_to_text());
  return {
    blurHeld: { turnState: blurHeld.turnState, input: blurHeld.input },
    blurCancelled: { turnState: blurCancelled.turnState, input: blurCancelled.input },
    blurNextDown: { turnState: blurNextDown.turnState, input: blurNextDown.input },
    blurNextUp: { turnState: blurNextUp.turnState, input: blurNextUp.input },
    hiddenHeld: { turnState: hiddenHeld.turnState, input: hiddenHeld.input },
    hiddenCancelled: { turnState: hiddenCancelled.turnState, input: hiddenCancelled.input },
    hiddenNextDown: { turnState: hiddenNextDown.turnState, input: hiddenNextDown.input },
    hiddenNextUp: { turnState: hiddenNextUp.turnState, input: hiddenNextUp.input },
  };
});
check('3D 枱外鏡頭 blur 會清走舊 pointer，下一次瞄準可正常收尾',
  canvasInterruption.blurHeld?.input?.isRotatingCamera === true &&
    canvasInterruption.blurCancelled?.input?.isRotatingCamera === false &&
    canvasInterruption.blurCancelled?.input?.activePointerId === null &&
    canvasInterruption.blurNextDown?.turnState === 'AIMING_DRAG' &&
    canvasInterruption.blurNextUp?.turnState === 'AIMING' &&
    canvasInterruption.blurNextUp?.input?.activePointerId === null,
  canvasInterruption);
check('3D 枱外鏡頭 hidden page 亦會清走舊 pointer，唔會吞下一次 pointerup',
  canvasInterruption.hiddenHeld?.input?.isRotatingCamera === true &&
    canvasInterruption.hiddenCancelled?.input?.isRotatingCamera === false &&
    canvasInterruption.hiddenCancelled?.input?.activePointerId === null &&
    canvasInterruption.hiddenNextDown?.turnState === 'AIMING_DRAG' &&
    canvasInterruption.hiddenNextUp?.turnState === 'AIMING' &&
    canvasInterruption.hiddenNextUp?.input?.activePointerId === null,
  canvasInterruption);

await page.locator('#mobile-charge-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(180);
const mobileCharge = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
await page.evaluate(() => {
  document.getElementById('mobile-charge-btn')?.dispatchEvent(new PointerEvent('pointercancel', {
    bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true,
  }));
});
await page.waitForTimeout(80);
const cancelledCharge = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
check('3D 手機 pointercancel 會取消儲力而唔會誤出桿',
  mobileCharge?.aiming === true && mobileCharge?.power > 0 &&
    cancelledCharge?.aiming === false && cancelledCharge?.power === 0 &&
    cancelledCharge?.shotSerial === 0 && cancelledCharge?.turnState === 'AIMING',
  { held: mobileCharge, cancelled: cancelledCharge });

await page.locator('#mobile-charge-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(180);
const blurCharge = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
await page.evaluate(() => window.dispatchEvent(new Event('blur')));
await page.waitForTimeout(80);
const blurCancelled = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
check('3D 手機 blur 會清走儲力狀態',
  blurCharge?.aiming === true && blurCharge?.power > 0 &&
    blurCancelled?.aiming === false && blurCancelled?.power === 0 &&
    blurCancelled?.shotSerial === 0 && blurCancelled?.turnState === 'AIMING',
  { held: blurCharge, cancelled: blurCancelled });

await page.locator('#mobile-charge-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(180);
const hiddenCharge = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
await page.evaluate(() => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: true });
  document.dispatchEvent(new Event('visibilitychange'));
  delete document.hidden;
});
await page.waitForTimeout(80);
const hiddenCancelled = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
check('3D 手機 hidden page 會清走儲力狀態',
  hiddenCharge?.aiming === true && hiddenCharge?.power > 0 &&
    hiddenCancelled?.aiming === false && hiddenCancelled?.power === 0 &&
    hiddenCancelled?.shotSerial === 0 && hiddenCancelled?.turnState === 'AIMING',
  { held: hiddenCharge, cancelled: hiddenCancelled });

// Cancellation must not poison the next normal charge-and-shoot interaction.
await page.locator('#mobile-charge-btn').dispatchEvent('pointerdown');
await page.waitForTimeout(180);
const mobileChargeAfterCancel = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
await page.locator('#mobile-charge-btn').dispatchEvent('pointerup');
await page.waitForTimeout(100);
const mobileShot = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
const mobileCueTravel = mobileChargeAfterCancel?.cue && mobileShot?.cue
  ? Math.hypot(
    mobileShot.cue.x - mobileChargeAfterCancel.cue.x,
    mobileShot.cue.z - mobileChargeAfterCancel.cue.z,
  )
  : 0;
check('3D 手機儲力掣會累積力度並實際出桿',
  mobileChargeAfterCancel?.aiming === true && mobileChargeAfterCancel?.power > 0 &&
    mobileShot?.shotSerial === mobileChargeAfterCancel.shotSerial + 1 &&
    (mobileShot?.shotOrigin === 'offline' || mobileShot?.lastCompletedShotOrigin === 'offline') &&
    mobileCueTravel > 0.005,
  { charge: mobileChargeAfterCancel, shot: mobileShot, cueTravel: mobileCueTravel });
await page.locator('#back-btn').click();
await page.waitForLoadState('domcontentloaded');
check('3D 返回掣回到 Snooker root',
  page.url().endsWith('/games/snooker/index.html') && await page.locator('#landing-page').isVisible(),
  page.url());

// P1-vs-AI must complete the whole handoff after a deterministic opening foul:
// the AI beneficiary resolves the decision, places its cue, takes a shot, and
// returns control to P1. This catches a silent AI queue/placement stall that a
// console-error-only smoke would miss.
await page.goto(`${base}/games/snooker/3d/index.html`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(500);
const aiHandoff = await page.evaluate(() => {
  const D = window.__snookerDebug;
  D.setAiEnabled(true);
  D.reset();
  D.placeCueInD(0, -1.1);
  D.confirmCuePlacement();
  D.shoot(0, 1, 0.65); // brown first: deterministic opening foul
  return D.runUntilSettled(20);
});
check('P1 犯規後 AI 會完成一桿並交回玩家',
  !aiHandoff.foulDecisionPending && aiHandoff.player === 1 &&
    aiHandoff.shotSerial >= 2 && aiHandoff.scores[1] >= 4 &&
    aiHandoff.turnState === 'AIMING' && aiHandoff.actionRequired === 'CAN_SHOOT' &&
    aiHandoff.aiQueued === false,
  aiHandoff);

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
