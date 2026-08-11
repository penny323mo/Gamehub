// Dou Dizhu real-browser player flow.
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/doudizhu-flow.mjs
//
// 叫地主同出牌都係 delayed CPU loops。呢把尺先叫一手、即刻退出，再開新局
// 叫一手，確認舊 generation 冇 callback 可以落入新局；同時驗新 CPU loop
// 仍然會正常推進一個叫牌回合。
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
const doudizhuHTML = fs.readFileSync(path.join(ROOT, 'games/doudizhu/index.html'), 'utf8');
const localScriptTokens = [...doudizhuHTML.matchAll(/<script src="(?:\.\/)?(?:src\/)?[^"?]+\.js\?v=([^"]+)"/g)].map((m) => m[1]);

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

const url = `http://localhost:${port}/games/doudizhu/index.html`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('#landing-page:not(.hidden)');
await page.evaluate(() => {
  const nativeSetTimeout = window.setTimeout.bind(window);
  const probe = { phase: 0, events: [], next() { this.phase += 1; } };
  window.__doudizhuTimerProbe = probe;
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

const current = () => page.evaluate(() => window.__ddzRun.現局());
await page.locator('#btn-local-ai').click();
await page.locator('#startGameBtn').click();
await page.locator('#bidCallBtn').click();
const firstBid = await current();
await page.waitForTimeout(30);
await page.locator('#exitGameBtn').click();
await page.waitForSelector('#landing-page:not(.hidden)');
await page.evaluate(() => window.__doudizhuTimerProbe.next());

await page.locator('#btn-local-ai').click();
await page.locator('#startGameBtn').click();
await page.locator('#bidCallBtn').click();
const freshBid = await current();
await page.waitForTimeout(520);
const afterCpu = await current();
const probe = await page.evaluate(() => window.__doudizhuTimerProbe);
const staleFires = probe.events.filter((e) => e.type === 'fire' && e.scheduled < probe.phase);
const freshFires = probe.events.filter((e) => e.type === 'fire' && e.scheduled === probe.phase);

check('Dou Dizhu local scripts share one cache token',
  localScriptTokens.length === 8 && new Set(localScriptTokens).size === 1,
  localScriptTokens);
check('叫地主退出後唔會喺新局執行舊 CPU timer',
  firstBid.phase === 'bid' && firstBid['輪到'] === 1 && freshBid.phase === 'bid' && freshBid['輪到'] === 1 && staleFires.length === 0,
  { firstBid, freshBid, staleFires, events: probe.events });
check('新局仍會正常推進一個 CPU 叫牌回合',
  freshFires.length === 1 && afterCpu.phase === 'bid' && afterCpu['輪到'] === 2,
  { freshFires, afterCpu });
check('Dou Dizhu flow 冇非預期 browser error', errors.length === 0, errors);

console.log(`\ndoudizhu flow: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
