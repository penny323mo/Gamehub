// Browser contract for the long-run lifecycle: keyboard isolation, pause/recovery,
// clean restart, preferences and safe wave-boundary resume.
// Run: node games/tower/tests/flow.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOWER_ROOT = path.resolve(HERE, '..');
const MAP_CONFIG = JSON.parse(fs.readFileSync(path.join(TOWER_ROOT, 'configs/map.json'), 'utf8'));
const vite = await createServer({
  root: TOWER_ROOT,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 },
});
await vite.listen();
const address = vite.httpServer?.address();
if (!address || typeof address === 'string') throw new Error('Vite test server did not bind a TCP port');
const url = process.env.TOWER_URL ?? `http://127.0.0.1:${address.port}/`;

let pass = 0;
let fail = 0;
const failed = [];
function check(name, ok, detail) {
  if (ok) {
    pass++;
    console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail));
  } else {
    fail++;
    failed.push(name);
    console.log(`FAIL  ${name}`, JSON.stringify(detail));
  }
}

const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
try {
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message.split('\n')[0].slice(0, 180)}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text().slice(0, 180)}`);
});

async function loadGame(target = page) {
  await target.goto(url, { waitUntil: 'load' });
  await target.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
}

async function setVisibility(hidden) {
  await page.evaluate((nextHidden) => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: nextHidden });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: nextHidden ? 'hidden' : 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

await loadGame();
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });

// The start screen is visually modal. Keyboard users must not land on the HUD
// or build controls behind it.
await page.keyboard.press('Tab');
const startFocus = await page.evaluate(() => ({
  id: document.activeElement?.id,
  inside: !!document.querySelector('#start-screen')?.contains(document.activeElement),
}));
check('start screen isolates keyboard focus from gameplay controls', startFocus.inside, startFocus);

await page.evaluate(() => localStorage.setItem('tower-defense-run-v1', JSON.stringify({
  version: 1,
  savedAt: 1,
  difficulty: 'hard',
  currentWave: 98,
})));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
const rejectedCheckpoint = await page.evaluate(() => ({
  continueHidden: document.querySelector('#continue-run').classList.contains('hidden'),
  removed: localStorage.getItem('tower-defense-run-v1') === null,
}));
check('invalid or stale checkpoints are rejected and removed safely',
  rejectedCheckpoint.continueHidden && rejectedCheckpoint.removed, rejectedCheckpoint);

// Exercise real preference controls, then verify their UI survives reload.
await page.locator('.diff-btn[data-diff="hard"]').click();
await page.locator('.endless-toggle').click();
await page.locator('#start-btn').focus();
await page.keyboard.press('Enter');
await page.waitForFunction(() => window.__TD.state.phase === 'prep', null, { timeout: 60000 });
const chapterHud = await page.evaluate(() => ({
  act: document.querySelector('#chapter-act')?.textContent?.trim(),
  name: document.querySelector('#chapter-name')?.textContent?.trim(),
  opening: document.querySelector('#wave-banner')?.classList.contains('chapter-opening'),
  banner: document.querySelector('#wave-banner-text')?.textContent?.trim(),
}));
check('五章戰役由 ACT I / Verdant Border 開場，HUD 同 chapter banner 同源',
  chapterHud.act === 'ACT I' && chapterHud.name === 'Verdant Border'
    && chapterHud.opening && /Verdant Border/.test(chapterHud.banner ?? ''), chapterHud);
await page.locator('#speed-btn').focus();
await page.keyboard.press('Enter');
await page.keyboard.press('Enter');
await page.locator('#sound-btn').focus();
await page.keyboard.press('Enter');
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
const restoredPrefs = await page.evaluate(() => ({
  difficulty: document.querySelector('.diff-btn.active')?.getAttribute('data-diff'),
  endless: document.querySelector('#endless-toggle')?.checked,
  speed: document.querySelector('#speed-btn')?.textContent,
  sound: document.querySelector('#sound-btn')?.textContent,
}));
check('difficulty/speed/sound/endless preferences restore after reload',
  restoredPrefs.difficulty === 'hard' && restoredPrefs.endless === true
    && restoredPrefs.speed === '4×' && restoredPrefs.sound === '🔇', restoredPrefs);

// A wave-boundary checkpoint should offer Continue after reload. The test puts
// the real state at a clean prep boundary; active enemies/projectiles are never
// part of the checkpoint contract.
await page.locator('#start-btn').focus();
await page.keyboard.press('Enter');
await page.waitForFunction(() => window.__TD.state.phase === 'prep', null, { timeout: 60000 });
const checkpointExpected = await page.evaluate(() => {
  const T = window.__TD;
  T.擂台(4321);
  T.build('arrow', 9, 4);
  T.state.currentWave = 7;
  T.state.phase = 'prep';
  T.state.lives = 7;
  T.state.maxLives = 15;
  T.state.score = 987;
  T.state.buffDamageMult = 1.25;
  T.state.skills[0].remaining = 23;
  T.state.enemies = [];
  T.state.projectiles = [];
  return {
    gold: T.state.gold,
    skill: T.state.skills[0].remaining,
  };
});
await setVisibility(true);
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });
const continueCard = await page.evaluate(() => ({
  visible: !document.querySelector('#continue-run')?.classList.contains('hidden'),
  summary: document.querySelector('#continue-summary')?.textContent?.trim() ?? '',
}));
check('valid prep-boundary checkpoint offers a visible Continue action',
  continueCard.visible && /Wave 8/.test(continueCard.summary), continueCard);
if (continueCard.visible) {
  await page.locator('#continue-btn').click();
  await page.waitForFunction(() => window.__TD.state.phase === 'prep', null, { timeout: 60000 });
} else {
  await page.locator('#start-btn').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__TD.state.phase === 'prep', null, { timeout: 60000 });
}
const continued = await page.evaluate(() => ({
  wave: window.__TD.state.currentWave,
  gold: window.__TD.state.gold,
  lives: window.__TD.state.lives,
  maxLives: window.__TD.state.maxLives,
  score: window.__TD.state.score,
  towers: window.__TD.state.towers.map((tower) => [tower.type, tower.col, tower.row]),
  damageBuff: window.__TD.state.buffDamageMult,
  skill: window.__TD.state.skills[0].remaining,
  enemies: window.__TD.state.enemies.length,
  projectiles: window.__TD.state.projectiles.length,
}));
check('Continue restores wave/tower/economy/skills/buffs without mid-wave entities',
  continued.wave === 7 && continued.gold === checkpointExpected.gold && continued.lives === 7
    && continued.maxLives === 15 && continued.score === 987
    && continued.towers.some(([type, col, row]) => type === 'arrow' && col === 9 && row === 4)
    && continued.damageBuff === 1.25
    && continued.skill <= checkpointExpected.skill && continued.skill > checkpointExpected.skill - 1
    && continued.enemies === 0 && continued.projectiles === 0, continued);

// Help is a modal during an active run: it pauses, owns focus, closes with
// Escape, restores focus, and cannot be bypassed with P.
await page.locator('#help-btn').focus();
await page.keyboard.press('Enter');
const helpOpen = await page.evaluate(() => ({
  visible: !document.querySelector('#help-overlay').classList.contains('hidden'),
  paused: window.__TD.state.paused,
  focusInside: document.querySelector('#help-overlay').contains(document.activeElement),
}));
check('help opens as a focus-owning pause modal',
  helpOpen.visible && helpOpen.paused && helpOpen.focusInside, helpOpen);
await page.keyboard.press('p');
check('P cannot resume gameplay through an open modal',
  await page.evaluate(() => window.__TD.state.paused),
  await page.evaluate(() => ({ paused: window.__TD.state.paused })));
await page.keyboard.press('Escape');
const helpClosed = await page.evaluate(() => ({
  hidden: document.querySelector('#help-overlay').classList.contains('hidden'),
  paused: window.__TD.state.paused,
  focus: document.activeElement?.id,
}));
check('Escape closes help, restores prior pause state and opener focus',
  helpClosed.hidden && !helpClosed.paused && helpClosed.focus === 'help-btn', helpClosed);

// Backgrounding must stop a long-running defense and never auto-resume when the
// tab returns. The player gets an explicit resume route and reason.
await setVisibility(true);
const backgroundPause = await page.evaluate(() => ({
  paused: window.__TD.state.paused,
  visible: !document.querySelector('#pause-overlay')?.classList.contains('hidden'),
  reason: document.querySelector('#pause-reason')?.textContent?.trim() ?? '',
}));
check('backgrounding auto-pauses with a visible reason',
  backgroundPause.paused && backgroundPause.visible && /background|tab/i.test(backgroundPause.reason), backgroundPause);
await setVisibility(false);
check('foregrounding does not silently resume the defense',
  await page.evaluate(() => window.__TD.state.paused),
  await page.evaluate(() => ({ paused: window.__TD.state.paused })));
if (await page.locator('#resume-btn').count()) await page.locator('#resume-btn').click();
else await page.evaluate(() => { window.__TD.state.paused = false; });

// WebGL context loss needs a user-visible fallback and explicit reload route.
const contextLoss = await page.evaluate(() => {
  const event = new Event('webglcontextlost', { cancelable: true });
  document.querySelector('#game-canvas').dispatchEvent(event);
  return {
    prevented: event.defaultPrevented,
    paused: window.__TD.state.paused,
    visible: !document.querySelector('#graphics-recovery')?.classList.contains('hidden'),
    reload: !!document.querySelector('#graphics-reload-btn'),
  };
});
check('WebGL context loss pauses and presents a reload recovery route',
  contextLoss.prevented && contextLoss.paused && contextLoss.visible && contextLoss.reload, contextLoss);
await page.evaluate(() => document.querySelector('#game-canvas').dispatchEvent(new Event('webglcontextrestored')));
await page.waitForTimeout(50);
check('context restoration clears the blocking fallback but stays paused',
  await page.evaluate(() => !!document.querySelector('#graphics-recovery')?.classList.contains('hidden') && window.__TD.state.paused),
  await page.evaluate(() => ({
    recoveryHidden: document.querySelector('#graphics-recovery')?.classList.contains('hidden'),
    paused: window.__TD.state.paused,
  })));
if (await page.locator('#resume-btn').count()) await page.locator('#resume-btn').click();
else await page.evaluate(() => { window.__TD.state.paused = false; });

// End → Restart must clear all module-level and DOM residue, not only replace
// GameState. Force the end only after creating state through real game controls.
await page.locator('.build-btn[data-tower="arrow"]').focus();
await page.keyboard.press('Enter');
await page.evaluate(() => {
  window.__TD.state.floatingTexts.push({
    id: window.__TD.state.nextId++, worldX: 0, worldZ: 0,
    value: 'STALE RUN', color: '#fff', life: 100, maxLife: 100,
  });
});
await page.waitForTimeout(100);
await page.evaluate(() => { window.__TD.state.phase = 'lost'; });
await page.waitForFunction(() => !document.querySelector('#end-screen').classList.contains('hidden'));
const endFocus = await page.evaluate(() => ({
  focus: document.activeElement?.id,
  inside: document.querySelector('#end-screen').contains(document.activeElement),
}));
check('end screen owns keyboard focus', endFocus.inside, endFocus);
await page.locator('#restart-btn').click();
await page.waitForFunction(() => window.__TD.state.phase === 'prep', null, { timeout: 60000 });
const restarted = await page.evaluate(() => ({
  selected: document.querySelector('.build-btn.selected')?.getAttribute('data-tower') ?? null,
  cancelVisible: getComputedStyle(document.querySelector('#cancel-build-btn')).display !== 'none',
  domFloats: document.querySelectorAll('#floating-text-layer .floating-text').length,
  stateFloats: window.__TD.state.floatingTexts.length,
  paused: window.__TD.state.paused,
}));
check('Restart clears build selection, floating DOM and pause residue',
  restarted.selected === null && !restarted.cancelVisible && restarted.domFloats === 0
    && restarted.stateFloats === 0 && !restarted.paused, restarted);

await page.evaluate(() => { window.__TD.state.phase = 'lost'; });
await page.waitForFunction(() => !document.querySelector('#end-screen').classList.contains('hidden'));
await Promise.all([
  page.waitForURL((target) => target.pathname === '/index.html'),
  page.locator('#home-btn').click(),
]);
check('end-screen Home exits through the repository hub route',
  new URL(page.url()).pathname === '/index.html', { url: page.url() });

// Mobile: a two-finger gesture must not build, while a later pure tap (without
// mousemove/touchmove) still resolves its own cell.
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await loadGame(mobile);
await mobile.locator('#start-btn').focus();
await mobile.keyboard.press('Enter');
await mobile.waitForFunction(() => window.__TD.state.phase === 'prep', null, { timeout: 60000 });
const mobileTap = await mobile.evaluate(async ({ origin, cellSize }) => {
  const T = window.__TD;
  T.state.gold = 9999;
  document.querySelector('.build-btn[data-tower="arrow"]').click();
  const V = T.camera.position.constructor;
  const p = new V(origin.x + 9.5 * cellSize, 0.2, origin.z + 4.5 * cellSize).project(T.camera);
  const canvas = document.querySelector('#game-canvas');
  const rect = canvas.getBoundingClientRect();
  const x = rect.left + (p.x * 0.5 + 0.5) * rect.width;
  const y = rect.top + (-p.y * 0.5 + 0.5) * rect.height;
  const touch = (id, dx) => new Touch({ identifier: id, target: canvas, clientX: x + dx, clientY: y });
  canvas.dispatchEvent(new TouchEvent('touchstart', {
    bubbles: true, touches: [touch(1, -18), touch(2, 18)], targetTouches: [touch(1, -18), touch(2, 18)],
  }));
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
  const afterGesture = T.state.towers.length;
  canvas.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], targetTouches: [] }));
  await new Promise((resolve) => setTimeout(resolve, 130));
  canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
  return { afterGesture, afterPureTap: T.state.towers.length, cell: T.state.towers[0] && [T.state.towers[0].col, T.state.towers[0].row] };
}, { origin: MAP_CONFIG.origin, cellSize: MAP_CONFIG.cellSize });
check('mobile multi-touch is build-safe and a later pure tap still places exactly once',
  mobileTap.afterGesture === 0 && mobileTap.afterPureTap === 1
    && mobileTap.cell?.[0] === 9 && mobileTap.cell?.[1] === 4, mobileTap);

check('flow audit produced no browser errors', errors.length === 0, errors.slice(0, 5));
console.log(`\ntower flow browser: ${pass}/${pass + fail} passed`);
if (failed.length) console.log(`Failed: ${failed.join(', ')}`);

await mobile.close();
} finally {
await browser.close();
await vite.close();
}
process.exitCode = fail ? 1 : 0;
