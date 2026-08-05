// 用一個會打會行嘅 bot 真係玩落去，睇隻遊戲推唔推得郁。
//
// 跑法：node games/elden-ring-ii/tests/playthrough.mjs [幾多步]
//
// **唔屬於快速套件**，而且**唔會因為 bot 死咗就當肥咗**。
//
// 兩個理由：
//   一、呢度冇 GPU。軟件光柵化得三幀，而 `delta` 夾住 0.05 秒（ADR-150），
//       即係遊戲時間得真實時間嘅一成七左右。行一步真係要等。
//   二、一個 bot 死咗，唔證明隻遊戲通唔到。實測：淨係識埋身斬嘅 bot 廿八
//       秒清到第一波（兩隻），跟住喺第二波（三隻）死。人識走位識碌，bot
//       唔識。**呢個數係一條難度嘅參考線，唔係一條合格線。**
//
// 所以佢印數，唔判斷。要判斷「通唔通得到」，要人落手玩。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const STEPS = Number(process.argv[2] ?? 900);
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) {
    console.log('搵唔到 playwright：喺 games/Racing Car/tests 行一次 npm install 先');
    process.exit(1);
}
const { chromium } = await import(pathToFileURL(PW).href);

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.woff2': 'font/woff2',
    '.m4a': 'audio/mp4', '.ico': 'image/x-icon', '.txt': 'text/plain', '.svg': 'image/svg+xml',
};
const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = path.join(ROOT, u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); return res.end('404');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
});
const port = await new Promise(r => server.listen(0, () => r(server.address().port)));

const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 560, height: 340 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message.split('\n')[0]));

await page.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.getByText('OATHBOUND', { exact: false }).first().click();
await page.getByText('ENTER THE VEIL').first().click();
await page.waitForTimeout(4000);

const 讀 = () => page.evaluate(() => {
    const el = document.querySelector('[data-encounter]');
    const 兵 = (el.dataset.minionPositions || '').split('|').filter(Boolean)
        .map(s => s.split(',').map(Number));
    const [px, pz] = el.dataset.playerPosition.split(',').map(Number);
    return { 關: el.dataset.encounter, 剩: +el.dataset.enemiesRemaining,
        狀態: el.dataset.gameStatus, px, pz, 兵 };
});

// 近戰射程 4.4 米：入到射程就斬。第一版寫住喺 2.6 米碌開，即係一去到打得
// 到嘅距離就碌走——八十九秒一隻都殺唔到。量到嘅係 bot 蠢，唔關遊戲事。
const 射程 = 4.2;
const t0 = Date.now();
let 上關 = '';
for (let i = 0; i < STEPS; i++) {
    const s = await 讀();
    if (s.關 !== 上關) {
        上關 = s.關;
        console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] ${s.關}　剩 ${s.剩}　`
            + `位 ${s.px.toFixed(1)},${s.pz.toFixed(1)}`);
    }
    if (s.狀態 !== 'playing') {
        console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s] 結果 = ${s.狀態}`);
        break;
    }
    const 近 = s.兵.map(m => Math.hypot(m[0] - s.px, m[1] - s.pz)).sort((a, b) => a - b)[0] ?? 999;
    if (近 <= 射程) {
        await page.keyboard.press('KeyF');
        await page.waitForTimeout(500);
        continue;
    }
    if (!s.兵.length) { await page.waitForTimeout(500); continue; }
    const 心 = s.兵.reduce((a, m) => [a[0] + m[0] / s.兵.length, a[1] + m[1] / s.兵.length], [0, 0]);
    const dx = 心[0] - s.px, dz = 心[1] - s.pz, keys = [];
    if (dx < -0.8) keys.push('KeyA'); else if (dx > 0.8) keys.push('KeyD');
    if (dz < -0.8) keys.push('KeyW'); else if (dz > 0.8) keys.push('KeyS');
    for (const k of keys) await page.keyboard.down(k);
    await page.waitForTimeout(1400);
    for (const k of keys) await page.keyboard.up(k);
}

console.log('最後：', JSON.stringify(await 讀()).slice(0, 200));
console.log('錯誤：', errors.length ? errors.slice(0, 3) : '冇');
await browser.close();
await new Promise(r => server.close(r));
