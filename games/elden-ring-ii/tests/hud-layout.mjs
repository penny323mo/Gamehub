// Elden Ring II 嘅畫面版位測試：唔開發伺服器，直接用 dist 派靜態檔，
// 用真瀏覽器行入遊戲，然後量每一個 HUD 元素嘅矩形。
//
// 跑法：node games/elden-ring-ii/tests/hud-layout.mjs
//
// 點解要量矩形而唔係肉眼睇：呢隻遊戲嘅 HUD 有兩套斷點——`.game-topbar`
// 跟闊度（`font-size: clamp(20px, 2vw, 30px)`，即係高度會隨闊度變），而
// `.player-hud` 用寫死嘅 `top`（桌面 91px、窄機 63px、矮機 45px）。兩套
// 斷點喺某啲尺寸夾唔埋，而嗰啲尺寸唔會喺 1280×800 出現。實測 844×390
// （iPhone 14 打橫，一個真機真方向）「VEIL OF THE HOLLOW CROWN」壓住咗
// 職業徽章同職業名。呢種嘢淨係喺你啱啱好開嗰個窗度先睇得到。
//
// 門檻用 1px，唔用 6px。第一版寫 6px，結果**照肥咗一條真重疊**
// （OATHBOUND 疊 5px）——一條睇唔到自己要守嗰件事嘅線。

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const GAME = path.resolve(HERE, '..');
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) {
    console.log('搵唔到 playwright：喺 games/Racing Car/tests 行一次 npm install 先');
    process.exit(1);
}
if (!fs.existsSync(path.join(GAME, 'dist', 'index.html'))) {
    console.log('搵唔到 dist：喺 games/elden-ring-ii 行 npm ci && npm run build 先');
    process.exit(1);
}
const { chromium } = await import(pathToFileURL(PW).href);

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
    '.svg': 'image/svg+xml', '.css': 'text/css', '.woff2': 'font/woff2', '.m4a': 'audio/mp4',
    '.mp3': 'audio/mpeg', '.ktx2': 'image/ktx2', '.txt': 'text/plain', '.ico': 'image/x-icon',
};

let pass = 0, fail = 0;
const failed = [];
function check(name, ok, detail) {
    if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : detail); }
    else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
}

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

// 軟件光柵化：呢度冇 GPU。畫面內容照樣正確，只係慢——而我哋量嘅係版位，
// 唔係幀率，所以慢唔影響答案。
const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', e => errors.push(`pageerror: ${e.message.split('\n')[0]}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 120)}`); });

await page.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.getByText('OATHBOUND', { exact: false }).first().click();
await page.getByText('ENTER THE VEIL').first().click();
await page.waitForTimeout(4000);

check('入到遊戲，HUD 出到職業同目標', /OATHBOUND/.test(await page.evaluate(() => document.body.innerText)));

// 量矩形。跳過有仔嘅容器（只計最入面嗰層，否則父子必然「重疊」），
// 亦跳過鋪滿成個畫面嘅背景（畫布、暗角、雜訊）——佢哋本來就喺所有嘢下面。
const 量重疊 = () => page.evaluate(() => {
    const vis = [];
    document.querySelectorAll('body *').forEach((el) => {
        if (el.children.length && el.tagName !== 'BUTTON') return;
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        if (r.width < 3 || r.height < 3) return;
        if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) < 0.05) return;
        if (r.width * r.height > innerWidth * innerHeight * 0.8) return;
        vis.push({
            t: (el.innerText || el.className || el.tagName).trim().slice(0, 26).replace(/\s+/g, ' '),
            x: r.x, y: r.y, w: r.width, h: r.height,
        });
    });
    const out = [];
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
        const a = vis[i], b = vis[j];
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
        if (ox > 1 && oy > 1) out.push(`${a.t} × ${b.t} (${Math.round(ox)}×${Math.round(oy)})`);
    }
    return { 可見: vis.length, 重疊: out };
});

// 尺寸唔係求其揀嘅：1280×800 係我改嘢嗰陣睇嗰個（永遠係綠嘅），
// 844×390 係 iPhone 14 打橫，667×375 係最細嘅真手機打橫，375×667 打直。
// 中間 900×500 係一個細桌面窗——闊過 760 但矮過 640，正正就係兩套斷點
// 夾唔埋嗰條夾縫。
const 尺寸 = [
    [1280, 800, '桌面'],
    [900, 500, '細桌面窗'],
    [844, 390, 'iPhone 14 橫'],
    [667, 375, 'iPhone SE 橫'],
    [375, 667, 'iPhone SE 直'],
];
for (const [w, h, 名] of 尺寸) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(600);
    const r = await 量重疊();
    check(`${名} ${w}×${h}：HUD 之間冇任何重疊`, r.重疊.length === 0,
        { 可見元素: r.可見, 重疊: r.重疊 });
}

// ---------- 地圖連唔連得通 ----------
//
// 地圖由一個半徑 22.35 嘅圓場，擴成「圓場 + 橋 + 西面庭院」。加咗新地方
// 最容易靜靜哋出事嘅一樣，就係個開口冇開到——牆係由一組數生出嚟嘅，
// 差半格就變成一堵完整嘅牆，而畫面上面完全睇唔出。
//
// 唔用「行過去」嚟驗：呢度冇 GPU，三幀一秒，角色一秒行半米，一撞到雜兵
// 就企喺度。量到嘅會係「我隻機械人蠢」，唔係「地圖通唔通」。所以直接問
// 真正建咗出嚟嘅物理世界：由圓場中心一路到庭院中心，逐點問有冇牆擋住。
{
    await page.setViewportSize({ width: 900, height: 500 });
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api) return { 冇接口: true };
        const walls = api.walls();
        const { court, bridge } = api.map();
        const 半徑 = 0.42;                       // 玩家膠囊半徑
        // 一個點撞唔撞到某個（可以轉咗角度嘅）方盒
        const 撞 = (px, pz) => walls.some((b) => {
            const dx = px - b.x, dz = pz - b.z;
            const c = Math.cos(-b.ry), s = Math.sin(-b.ry);
            const lx = dx * c - dz * s, lz = dx * s + dz * c;
            return Math.abs(lx) <= b.hx + 半徑 && Math.abs(lz) <= b.hz + 半徑;
        });
        const 擋住 = [];
        for (let x = 0; x >= court.cx; x -= 0.25) {
            if (撞(x, 0)) 擋住.push(+x.toFixed(2));
        }
        return { 牆數: walls.length, 擋住, 橋: bridge, 庭院: court };
    });
    check('由圓場中心一路行到西面庭院，中線上冇任何牆擋住',
        !r.冇接口 && r.擋住.length === 0,
        { 牆數: r.牆數, 擋住嘅位: (r.擋住 ?? []).slice(0, 12) });
}

// ---------- 鏡頭唔可以喺牆入面 ----------
//
// 鏡頭本來永遠釘死喺玩家後面 8.3 米，冇問過嗰個位有冇嘢。出生點喺
// z = 17，而場邊半徑 22.35——即係開波第一格，鏡頭已經喺 z = 25.3，
// **喺場外面差唔多三米**。空曠場入面睇唔出，但一開走廊就成幅牆貼面。
{
    await page.setViewportSize({ width: 900, height: 500 });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
        const el = document.querySelector('[data-camera-position]');
        const arenaR = window.__ER2 ? window.__ER2.map().arenaR : null;
        if (!el || arenaR == null) return null;
        const [cx, cz] = el.dataset.cameraPosition.split(',').map(Number);
        const [px, pz] = el.dataset.playerPosition.split(',').map(Number);
        return { cx, cz, px, pz, arenaR, camR: Math.hypot(cx, cz) };
    });
    check('開波第一格，鏡頭已經喺場邊入面（唔會插入牆）',
        r != null && r.camR < r.arenaR,
        r && { 鏡頭距中心: +r.camR.toFixed(2), 場邊: r.arenaR, 玩家: `${r.px},${r.pz}` });
}

check('由頭到尾零 browser error', errors.length === 0, errors.slice(0, 3));

await browser.close();
await new Promise(r => server.close(r));
console.log(`\nelden-ring-ii 版位: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
