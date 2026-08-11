// Big Two real-browser player flow.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/big2-flow.mjs
//
// CPU turns use delayed timers. This gate starts a CPU turn, exits immediately,
// starts another CPU turn, and records which generation's timer fires. A stale
// callback must be cancelled; the fresh game must still execute one normal turn.
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
const big2HTML = fs.readFileSync(path.join(ROOT, 'games/big2/index.html'), 'utf8');
const localScriptTokens = [...big2HTML.matchAll(/<script src="(?:js\/)?[^"?]+\.js\?v=([^"]+)"/g)].map((m) => m[1]);

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

const url = `http://localhost:${port}/games/big2/index.html`;
const current = () => page.evaluate(() => window.__big2Run.現局());
let sample = null;

// The starter is random. Retry clean page loads until both the old and fresh
// games begin on a CPU seat; the generation comparison then remains deterministic.
for (let attempt = 1; attempt <= 24 && !sample; attempt++) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#landing-page:not(.hidden)');
  await page.evaluate(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    const probe = { phase: 0, events: [], next() { this.phase += 1; } };
    window.__big2TimerProbe = probe;
    window.setTimeout = (fn, delay, ...args) => {
      const tracked = delay === 450 || delay === 600;
      const scheduled = probe.phase;
      if (tracked) probe.events.push({ type: 'schedule', delay, scheduled });
      return nativeSetTimeout(() => {
        if (tracked) probe.events.push({ type: 'fire', delay, scheduled, phase: probe.phase });
        return fn(...args);
      }, delay);
    };
  });

  await page.locator('#btn-local-ai').click();
  await page.locator('#startGameBtn').click();
  const oldGame = await current();
  if (oldGame['輪到'] === 0) continue;
  await page.waitForTimeout(30);
  await page.locator('#exitGameBtn').click();
  await page.waitForSelector('#landing-page:not(.hidden)');
  await page.evaluate(() => window.__big2TimerProbe.next());

  await page.locator('#btn-local-ai').click();
  await page.locator('#startGameBtn').click();
  const freshGame = await current();
  if (freshGame['輪到'] === 0) continue;
  await page.waitForTimeout(520);
  const after = await current();
  const probe = await page.evaluate(() => window.__big2TimerProbe);
  const staleFires = probe.events.filter((e) => e.type === 'fire' && e.scheduled < probe.phase);
  const freshFires = probe.events.filter((e) => e.type === 'fire' && e.scheduled === probe.phase);
  sample = { attempt, oldGame, freshGame, after, staleFires, freshFires, events: probe.events };
}

check('Big Two local scripts share one cache token',
  localScriptTokens.length === 2 && new Set(localScriptTokens).size === 1,
  localScriptTokens);
check('CPU queue 退出後唔會喺新局執行舊 timer',
  !!sample && sample.staleFires.length === 0,
  sample ? { attempt: sample.attempt, staleFires: sample.staleFires, events: sample.events } : '搵唔到 CPU/CPU starter sample');
check('新局仍會正常執行一個 CPU turn',
  !!sample && sample.freshFires.length === 1 && sample.after['手牌數'].reduce((sum, count) => sum + count, 0) < 52,
  sample ? { freshFires: sample.freshFires, before: sample.freshGame['手牌數'], after: sample.after['手牌數'] } : null);
check('Big Two flow 冇非預期 browser error', errors.length === 0, errors);

console.log(`\nbig2 flow: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
