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
// 320×190：軟件光柵化之下解析度就係幀率，而幀率就係遊戲時間（ADR-186 實測
// 640×380 得 1.7 fps、320×190 4.2）。呢個 bot 一條嘢都唔關解析度事。
const page = await browser.newPage({ viewport: { width: 320, height: 190 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message.split('\n')[0]));

await page.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.getByText('OATHBOUND', { exact: false }).first().click();
await page.getByText('ENTER THE VEIL').first().click();
await page.waitForTimeout(4000);

const 讀 = () => page.evaluate(() => window.__ER2.局面());

// 一個「識玩」嘅 bot。
//
// 上一版由頭到尾冇碌過，所以佢死喺第二波乜都證明唔到——量到嘅係 bot 蠢，唔係
// 遊戲難。而「隻遊戲通唔通到關」係產品級嘅第一條問題，冇一個識玩嘅 bot 就答
// 唔到。呢個政策簡單到一個新手都做得到：
//   1. 有嘢**就快落到你身上**（雜兵出緊手、boss 前搖）→ 碌走。
//   2. 入到射程 → 斬。
//   3. 血少過三成 → 行去賜福回氣（`__ER2.graces()`）。
//   4. 其餘時間 → 行埋去。
// 佢冇任何真人冇嘅資訊：以上每一樣都喺畫面上面睇得到。
const 射程 = 4.2, BOSS射程 = 3.6;
const t0 = Date.now();
const 秒 = () => ((Date.now() - t0) / 1000).toFixed(0);
let 上關 = -1;
const 賜福 = await page.evaluate(() => window.__ER2.graces());

const 行 = async (dx, dz, ms, 衝 = false) => {
    const keys = [];
    if (dx < -0.6) keys.push('KeyA'); else if (dx > 0.6) keys.push('KeyD');
    if (dz < -0.6) keys.push('KeyW'); else if (dz > 0.6) keys.push('KeyS');
    if (!keys.length) { await page.waitForTimeout(ms); return; }
    if (衝) keys.push('ShiftLeft');
    for (const k of keys) await page.keyboard.down(k);
    await page.waitForTimeout(ms);
    for (const k of keys) await page.keyboard.up(k);
};

for (let i = 0; i < STEPS; i++) {
    const s = await 讀();
    if (s.關 !== 上關) {
        上關 = s.關;
        console.log(`[${秒()}s] ${s.關 === 3 ? 'boss' : `wave-${s.關 + 1}`}　血 ${s.血}　`
            + `位 ${s.我[0].toFixed(1)},${s.我[1].toFixed(1)}`);
    }
    if (s.狀態 !== 'playing') { console.log(`[${秒()}s] 結果 = ${s.狀態}`); break; }

    const 目標 = s.boss ?? s.兵.map((m) => ({ ...m, 血: null }))
        .sort((a, b) => Math.hypot(a.x - s.我[0], a.z - s.我[1])
                      - Math.hypot(b.x - s.我[0], b.z - s.我[1]))[0];
    if (!目標) { await page.waitForTimeout(400); continue; }
    const d = Math.hypot(目標.x - s.我[0], 目標.z - s.我[1]);

    // 1. 有嘢就快落到身上——碌走。
    const 威脅 = (s.boss && s.boss.快出手 && d < 7)
        || s.兵.some((m) => m.快出手 && Math.hypot(m.x - s.我[0], m.z - s.我[1]) < 3);
    if (威脅 && s.體 > 20) {
        await 行(s.我[0] - 目標.x, s.我[1] - 目標.z, 120);
        await page.keyboard.press('Space');
        await page.waitForTimeout(320);
        continue;
    }
    // 2a. 受咗傷就飲藥——但飲嘅時候定身，所以要**先有安全距離**。冇距離就
    // 衝出去造一個出嚟（衝刺 6.82 對雜兵 3.6–4.4）。
    if (s.血 < 55 && s.藥 > 0) {
        const 最近 = Math.min(...[...s.兵, ...(s.boss ? [s.boss] : [])]
            .map((m) => Math.hypot(m.x - s.我[0], m.z - s.我[1])), 999);
        if (最近 > 7) {
            await page.keyboard.press('KeyE');
            await page.waitForTimeout(700);
            continue;
        }
        if (s.體 > 25) {
            const cx = (s.boss ? s.boss.x : s.兵.reduce((a, m) => a + m.x, 0) / (s.兵.length || 1));
            const cz = (s.boss ? s.boss.z : s.兵.reduce((a, m) => a + m.z, 0) / (s.兵.length || 1));
            await 行(s.我[0] - cx, s.我[1] - cz, 1200, true);
            continue;
        }
    }
    // 2b. **唔好企喺三個人中間。** 玩家衝刺 6.82 米／秒、雜兵 3.6–4.4，所以
    // 拉扯係遊戲自己提供嘅工具。兩隻以上埋咗身就衝走，散開咗先逐隻打。
    const 埋身 = s.兵.filter((m) => Math.hypot(m.x - s.我[0], m.z - s.我[1]) < 3.6).length;
    if (!s.boss && 埋身 >= 2 && s.體 > 25) {
        const cx = s.兵.reduce((a, m) => a + m.x, 0) / s.兵.length;
        const cz = s.兵.reduce((a, m) => a + m.z, 0) / s.兵.length;
        await 行(s.我[0] - cx, s.我[1] - cz, 1100, true);
        continue;
    }
    // 3. 血少就去賜福（打緊 boss 就唔走，個場入面冇）。
    if (s.血 < 30 && !s.boss && 賜福.length) {
        const g = 賜福.slice().sort((a, b) => Math.hypot(a.x - s.我[0], a.z - s.我[1])
                                            - Math.hypot(b.x - s.我[0], b.z - s.我[1]))[0];
        const gd = Math.hypot(g.x - s.我[0], g.z - s.我[1]);
        if (gd > 2.6) { await 行(g.x - s.我[0], g.z - s.我[1], 900); continue; }
        await page.keyboard.press('KeyE');
        await page.waitForTimeout(400);
        continue;
    }
    // 2. 入到射程就斬。
    if (d <= (s.boss ? BOSS射程 : 射程)) {
        await page.keyboard.press('KeyF');
        await page.waitForTimeout(420);
        continue;
    }
    // 4. 行埋去。
    await 行(目標.x - s.我[0], 目標.z - s.我[1], 900);
}

console.log('最後：', JSON.stringify(await 讀()).slice(0, 260));
console.log('錯誤：', errors.length ? errors.slice(0, 3) : '冇');
await browser.close();
await new Promise(r => server.close(r));
