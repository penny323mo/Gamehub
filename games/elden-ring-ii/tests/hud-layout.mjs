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

// ---------- 出生點唔可以喺牆入面 ----------
//
// 一隻喺石頭入面出世嘅雜兵唔會報錯，佢只會永遠卡喺嗰度，而玩家要企喺
// 空地度等一個永遠唔會嚟嘅敵人——之後成場波都推唔落去，因為要清晒先開
// 到下一關。加新一波（西面庭院嗰三隻）嘅時候，呢個係最容易靜靜哋整爛
// 嘅嘢，所以逐個出生點對住真正建咗出嚟嘅靜態障礙查一次。
{
    const r = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api) return null;
        const walls = api.walls();
        const spawns = api.spawns();
        const 半徑 = 0.4 + 0.34;                  // 雜兵膠囊
        const 撞 = (px, pz) => walls.some((b) => {
            const dx = px - b.x, dz = pz - b.z;
            const c = Math.cos(-b.ry), sn = Math.sin(-b.ry);
            const lx = dx * c - dz * sn, lz = dx * sn + dz * c;
            return Math.abs(lx) <= b.hx + 半徑 && Math.abs(lz) <= b.hz + 半徑;
        });
        return {
            共: spawns.length,
            每波: [0, 1, 2].map((w) => spawns.filter((s) => s.wave === w).length),
            卡住: spawns.filter((s) => 撞(s.x, s.z)).map((s) => `wave${s.wave} (${s.x}, ${s.z})`),
        };
    });
    check('三波雜兵都有人，冇一波係空嘅', r != null && r.每波.every((n) => n > 0), r && r.每波);
    check('每個雜兵出生點都唔會卡喺牆或者石入面',
        r != null && r.卡住.length === 0, r && { 共: r.共, 卡住: r.卡住 });
}

// ---------- Boss 第二階段要係新嘢，唔淨係快咗 ----------
//
// 本來 boss 由頭到尾得一招 Punch，而「第二階段」只係同一招換組數（前搖
// 0.72 → 0.52、傷害 25 → 34）。玩家打法完全唔使變，企遠啲一樣安全。
// 而家第二階段開撲擊：鎖死落點、飛過去、預警圈畫喺**落點**唔係畫喺 boss
// 身上——即係要讀嘅嘢唔同咗，唔係同一件事快咗。
//
// 揀招係一個純函數，所以呢條唔使打贏兩波雜兵先驗到。要求測試打到 boss
// 先量到 boss，就等於呢條 gate 永遠唔會有人跑。
{
    const r = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api) return null;
        const R = api.leapMinRange();
        const 掃 = (phase, dist) => {
            const out = new Set();
            for (let i = 0; i < 40; i++) out.add(api.bossMove(phase, dist, i / 40));
            return [...out].sort();
        };
        return {
            R,
            一階遠: 掃(1, R + 8), 一階近: 掃(1, 2),
            二階遠: 掃(2, R + 8), 二階近: 掃(2, R - 1),
        };
    });
    check('第一階段永遠淨係用拳（唔理遠近）',
        r != null && r.一階遠.join() === 'punch' && r.一階近.join() === 'punch',
        r && { 遠: r.一階遠, 近: r.一階近 });
    check('第二階段企遠會撲，兩招都出得到',
        r != null && r.二階遠.length === 2,
        r && { 二階遠: r.二階遠, 起跳距離: r.R });
    check('第二階段埋身唔會撲（撲擊係用嚟埋位嘅，唔係貼身用）',
        r != null && r.二階近.join() === 'punch',
        r && { 二階近: r.二階近 });
}

// ---------- 揮擊弧線唔可以講大話 ----------
//
// 弧線本來畫成一個半徑 1.1–2.0 米、跨 243° 嘅圓環，而真正嘅判定係向前
// 4.4 米、側向 ±1.32 米（±17°）嘅膠囊。射程少報一倍幾（你打得到弧線從來
// 冇掃過嘅嘢），覆蓋角度多報十四倍（睇落掃成個身位，實際係向前㧬一下）。
//
// 條線唔係抄返個公式（嗰種只係將實作再寫一次），係講立場：**畫面唔可以
// 應承多過規則做得到嘅，亦唔可以收埋規則真係做到嘅**。
{
    const r = await page.evaluate(() => window.__ER2 && window.__ER2.swing());
    const 錐角 = r && 2 * Math.atan2(r.判.側向, r.判.射程);
    check('弧線唔會應承打得到射程以外',
        r != null && r.畫.半徑 <= r.判.射程,
        r && { 畫半徑: +r.畫.半徑.toFixed(2), 判射程: r.判.射程 });
    check('弧線唔會收埋一半以上嘅真實射程',
        r != null && r.畫.半徑 >= r.判.射程 * 0.6,
        r && { 畫半徑: +r.畫.半徑.toFixed(2), 至少要: +(r.判.射程 * 0.6).toFixed(2) });
    check('弧線唔會應承打得中兩邊（角度唔可以闊過真實錐角兩成）',
        r != null && r.畫.角度 <= 錐角 * 1.2,
        r && { 畫角度: +(r.畫.角度 * 180 / Math.PI).toFixed(0) + '°',
               真錐角: +(錐角 * 180 / Math.PI).toFixed(0) + '°' });
}

// ---------- 成隻遊戲得一把鐘 ----------
//
// 本來 `now` 係 `performance.now()`（真實時間），而郁動／物理／動畫用夾住
// 0.05 秒嘅 `delta`。兩把鐘一齊行，幀率一跌，角色行慢咗，但雜兵出手間隔、
// boss 預警圈、閃避無敵幀全部照住真實時間走——**部機愈跟唔上，隻遊戲對玩家
// 愈唔公平**，而且靜靜哋發生。
//
// 條線唔係同另一次量度比（兩次都可以一齊錯），係同遊戲自己個常數比：
// 雜兵出手間隔寫住 1.4 秒，即係每秒最多 0.71 下。修之前實測每「郁動秒」
// 出手 2.33 下（CPU 節流 6× 之下 2.90）——即係遊戲自己講嘅節奏嘅三到四倍。
// 修完 0.62–0.67，同個常數對得返上。
{
    await page.setViewportSize({ width: 640, height: 380 });
    await page.waitForTimeout(500);
    await page.keyboard.down('KeyW');           // 行埋去逼雜兵開打
    const a = await page.evaluate(() => window.__ER2.clock());
    await page.waitForTimeout(22000);
    const b = await page.evaluate(() => window.__ER2.clock());
    await page.keyboard.up('KeyW');
    const 動 = b.motion - a.motion;
    const 率 = (b.attacks - a.attacks) / Math.max(0.01, 動);
    check('雜兵出手節奏跟返遊戲自己個常數（1.4 秒一下，即係唔多過 0.9/秒）',
        動 > 1.5 && 率 <= 0.9,
        { 郁動秒: +動.toFixed(1), 出手: b.attacks - a.attacks, 每秒: +率.toFixed(2),
          真實秒: +(b.real - a.real).toFixed(1) });
}

check('由頭到尾零 browser error', errors.length === 0, errors.slice(0, 3));

await browser.close();
await new Promise(r => server.close(r));
console.log(`\nelden-ring-ii 版位: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
