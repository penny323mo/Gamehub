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

// ---------- 支尺自己：一個轉咗角度嘅盒 ----------
//
// 呢五行本來喺呢個檔入面抄咗五次，而**五次都寫錯咗同一個符號**。繞 Y 軸轉
// θ 嘅時候，世界 → 本地係 `lx = dx·cosθ − dz·sinθ`，但五個地方全部寫成
// `cos(−ry)`，即係將個盒鏡像咗。
//
// 點解一直冇人響：圓場環牆鏡像返轉頭**仲係一個環**，所以「行唔行得到庭院」
// 照樣答啱。實測攞圓場環牆掃一圈——正確約定得**兩個空隙**（西門 2.86–3.42、
// 北門 4.43–4.99），錯嗰個報**二十個**。條 flood fill gate 一寫出嚟就即刻
// 由嗰啲假空隙鑽咗出圓場、繞過霧門入到 boss 場。
//
// 所以裝喺 page 上面，得一份。抄第二次就係第二個答案。
const 裝尺 = (pg) => pg.evaluate(() => {
    const 本地 = (dx, dz, ry) => {
        const c = Math.cos(ry), s = Math.sin(ry);
        return [dx * c - dz * s, dx * s + dz * c];
    };
    const 世界 = (lx, lz, ry) => {
        const c = Math.cos(ry), s = Math.sin(ry);
        return [lx * c + lz * s, -lx * s + lz * c];
    };
    window.__尺 = {
        本地, 世界,
        入面: (px, pz, b, padX, padZ = padX) => {
            const [lx, lz] = 本地(px - b.x, pz - b.z, b.ry);
            return Math.abs(lx) <= b.hx + padX && Math.abs(lz) <= b.hz + padZ;
        },
        點: (b, lx, lz) => {
            const [dx, dz] = 世界(lx, lz, b.ry);
            return [b.x + dx, b.z + dz];
        },
    };
});
await 裝尺(page);

// 量矩形。跳過有仔嘅容器（只計最入面嗰層，否則父子必然「重疊」），
// 亦跳過鋪滿成個畫面嘅背景（畫布、暗角、雜訊）——佢哋本來就喺所有嘢下面。
const 量重疊 = () => page.evaluate(() => {
    const vis = [];
    // 有 modal 開住嘅時候，只量 modal 入面嘅嘢。一個蓋幅本來就係要遮住後面
    // 嗰版——量埋後面就會報「credits 標題 × 選角畫面嘅字」，而嗰個唔係缺陷，
    // 係蓋幅嘅定義。（呢個係我支尺第三次報假陽性。）
    const modal = document.querySelector('.credits-card');
    const 範圍 = modal ? modal.querySelectorAll('*') : document.querySelectorAll('body *');
    範圍.forEach((el) => {
        // 純裝飾嘅嘢唔算：`.sigil` 個徽記係 `<div aria-hidden><i/><b/><em/></div>`，
        // 三塊絕對定位嘅形狀**特登**疊喺一齊砌個圖案。標題畫面一量就報咗
        // 幾十對，全部係佢哋——同暗角、雜訊一樣，係背景唔係內容。
        if (el.closest('[aria-hidden="true"]')) return;
        if (el.children.length && el.tagName !== 'BUTTON') return;
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        if (r.width < 3 || r.height < 3) return;
        if (st.visibility === 'hidden' || st.display === 'none' || Number(st.opacity) < 0.05) return;
        if (r.width * r.height > innerWidth * innerHeight * 0.8) return;
        vis.push({
            el,
            t: (el.innerText || el.className || el.tagName).trim().slice(0, 26).replace(/\s+/g, ' '),
            x: r.x, y: r.y, w: r.width, h: r.height,
        });
    });
    const out = [];
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
        const a = vis[i], b = vis[j];
        // 一個元素包住另一個唔算重疊——父永遠罩住個仔。BUTTON 唔喺「有仔就
        // 跳過」嗰條規則入面（掣係要量嘅撳擊區），所以 `<button><kbd>R</kbd>
        // …</button>` 就會父仔對撞。呢個係我支尺報過嘅假陽性，唔係遊戲問題。
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
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
// ---------- 標題／選角畫面 ----------
//
// 五個尺寸嘅重疊檢查本來全部喺入咗遊戲之後先做，即係**每個玩家見到嘅第一
// 幅嘢由頭到尾冇量過版位**——同死亡蓋幅嗰單（ADR-160）一模一樣嘅缺口，
// 只不過呢一幅更加緊要：撳唔到「入場」就連遊戲都入唔到。
{
    const 量掣 = () => page.evaluate(() => {
        const out = [];
        for (const t of ['OATHBOUND', 'ASTROLOGER', 'WAYFARER', 'ENTER THE VEIL']) {
            const el = [...document.querySelectorAll('button')]
                .find((b) => (b.innerText || '').includes(t));
            if (!el) { out.push({ t, 冇: true }); continue; }
            const r = el.getBoundingClientRect();
            const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            out.push({ t, w: Math.round(r.width), h: Math.round(r.height),
                撳得中: !!hit && (el === hit || el.contains(hit)) });
        }
        return out;
    });
    const 標題重疊 = [];
    for (const [w, h, 名] of 尺寸) {
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(600);
        const r = await 量重疊();
        if (r.重疊.length) 標題重疊.push(`${名}: ${r.重疊.join('／')}`);
    }
    check('標題／選角畫面五個尺寸都冇 HUD 重疊', 標題重疊.length === 0, 標題重疊);

    // 三個職業掣同入場掣都要撳得到，而且**逐個尺寸都要量**——一個掣喺桌面
    // 夠大唔代表喺手機夠大，而呢啲掣係「入唔入到遊戲」嘅唯一途徑。
    // 44px 唔係我發明嘅數，係呢個專案自己喺 Hub 度用開嗰條（ADR-133）。
    const 太細 = [];
    for (const [w, h, 名] of 尺寸) {
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(400);
        const b = await 量掣();
        for (const x of b) {
            if (x.冇 || x.w < 44 || x.h < 44 || !x.撳得中) 太細.push(`${名}: ${JSON.stringify(x)}`);
        }
    }
    check('三個職業掣同入場掣，五個尺寸都夠 44px 而且中心點撳得中自己',
        太細.length === 0, 太細.slice(0, 6));
}

// ---------- Credits 蓋幅同兩粒工具掣 ----------
//
// 標題畫面右上角嗰兩粒（♪ 靜音、© credits）同 credits 蓋幅本身，一樣係唔
// 使打機就去到嘅畫面，一樣由頭到尾冇量過。© 蓋幅仲要係授權聲明——一個
// fan-made 專案入面，佢係唯一一個講清楚啲資產邊度嚟嘅地方。
{
    const 蓋幅重疊 = [], 掣太細 = [];
    for (const [w, h, 名] of 尺寸) {
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(400);
        const 工具 = await page.evaluate(() => [...document.querySelectorAll('.utility-controls button')]
            .map((el) => {
                const r = el.getBoundingClientRect();
                const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
                return { t: (el.innerText || '').trim(), w: Math.round(r.width), h: Math.round(r.height),
                    撳得中: !!hit && (el === hit || el.contains(hit)) };
            }));
        for (const b of 工具) if (b.w < 44 || b.h < 44 || !b.撳得中) 掣太細.push(`${名}: ${JSON.stringify(b)}`);
        // 打開 credits，量完再閂返
        const 開 = await page.evaluate(() => {
            const el = [...document.querySelectorAll('.utility-controls button')]
                .find((b) => (b.innerText || '').includes('©'));
            if (!el) return false;
            el.click();
            return true;
        });
        if (!開) { 蓋幅重疊.push(`${名}: 揾唔到 © 掣`); continue; }
        await page.waitForTimeout(400);
        const r = await 量重疊();
        if (r.重疊.length) 蓋幅重疊.push(`${名}: ${r.重疊.slice(0, 3).join('／')}`);
        await page.keyboard.press('Escape');
        await page.evaluate(() => {
            const x = [...document.querySelectorAll('button')].find((b) => b.className.includes('credits-close'));
            if (x) x.click();
        });
        await page.waitForTimeout(300);
    }
    check('♪ 同 © 兩粒工具掣，五個尺寸都夠 44px 而且撳得中自己',
        掣太細.length === 0, 掣太細.slice(0, 6));
    check('Credits 蓋幅打開之後，五個尺寸都冇重疊', 蓋幅重疊.length === 0, 蓋幅重疊.slice(0, 5));
}

await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForTimeout(400);
await page.getByText('OATHBOUND', { exact: false }).first().click();
await page.getByText('ENTER THE VEIL').first().click();
await page.waitForTimeout(4000);

check('入到遊戲，HUD 出到職業同目標', /OATHBOUND/.test(await page.evaluate(() => document.body.innerText)));

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
        // 霧門唔算：佢係打完三關會拆走嘅暫時牆。
        const 永久 = walls.filter((b) => b.tag !== 'fog-gate');
        const 撞 = (px, pz, list = 永久) => list.some((b) => window.__尺.入面(px, pz, b, 半徑));
        // 第一版係沿住中線逐點問「呢一點有冇嘢」。嗰個答嘅係**中線通唔通**，
        // 唔係**行唔行得到**——一嚿擺喺走廊正中嘅碎石會令佢紅，但條走廊闊
        // 十一米，行側少少就過到。反方向亦一樣衰：中線清但兩邊封死佢照樣綠。
        // 而家真係行一次：0.5 米一格 flood fill，由出生點開始漫。
        const n = api.map().north;
        const 漫 = (list) => {
            const 格 = 0.5, x0 = -84, x1 = 28, z0 = -74, z1 = 28;
            const W = Math.round((x1 - x0) / 格), H = Math.round((z1 - z0) / 格);
            const 過 = new Uint8Array(W * H);
            const 通 = (i, j) => !撞(x0 + i * 格, z0 + j * 格, list);
            const 起i = Math.round((0 - x0) / 格), 起j = Math.round((17 - z0) / 格);
            if (!通(起i, 起j)) return null;             // 出生點都卡住就冇得講
            const 堆 = [起i * H + 起j];
            過[起i * H + 起j] = 1;
            while (堆.length) {
                const k = 堆.pop(), i = Math.floor(k / H), j = k % H;
                for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const a = i + di, b = j + dj;
                    if (a < 0 || b < 0 || a >= W || b >= H || 過[a * H + b]) continue;
                    if (!通(a, b)) continue;
                    過[a * H + b] = 1;
                    堆.push(a * H + b);
                }
            }
            return (x, z) => !!過[Math.round((x - x0) / 格) * H + Math.round((z - z0) / 格)];
        };
        const 去到 = 漫(永久);
        const 連霧門 = 漫(walls);
        return {
            牆數: walls.length, 橋: bridge, 庭院: court,
            出生點卡住: 去到 === null,
            到庭院: 去到 ? 去到(court.cx, court.cz) : false,
            到聖所: 去到 ? 去到(0, n.cz) : false,
            霧門攔到: 連霧門 ? !連霧門(0, n.cz) : false,
            霧門唔阻西路: 連霧門 ? 連霧門(court.cx, court.cz) : false,
        };
    });
    check('由出生點真係行得到西面庭院（0.5 米格 flood fill，唔係淨睇中線）',
        !r.冇接口 && !r.出生點卡住 && r.到庭院 === true,
        { 牆數: r.牆數, 出生點卡住: r.出生點卡住, 到庭院: r.到庭院 });
    check('清晒三關之後，由出生點行得到北面聖所',
        !r.冇接口 && r.到聖所 === true, { 到聖所: r.到聖所 });
    // 另一半：霧門未拆之前**一定要攔得住**，但唔可以順手封死西路。
    // 一條淨係守「通」嘅 gate，改到成個地圖穿晒都仲係綠。
    check('霧門未拆之前攔得住聖所，但攔唔到西面庭院',
        !r.冇接口 && r.霧門攔到 === true && r.霧門唔阻西路 === true,
        { 霧門攔到: r.霧門攔到, 霧門唔阻西路: r.霧門唔阻西路 });
}

// ---------- 撞得到嘅嘢，望唔望得見 ----------
//
// 連通性個 gate 答「行唔行得過」，但佢完全答唔到「行唔過嗰度望落係咪一堵
// 牆」。實測（未修之前）：93 個 collider、612.2 米，其中 **187.6 米（30.6%）
// 一米半內冇任何睇得見嘅嘢**，20 個 collider 成條長度都係隱形。
//
// 成因係「牆喺邊」寫咗兩次——collider 由 BRIDGE／HALL／LINK 嗰幾個數生出嚟，
// 而畫面嗰啲 `wall.glb` 係另一張手寫座標表。模型闊 3.97 米、間距 7 米，即係
// 每兩幅之間三米望落空但照撞；而三個圓場嘅環牆（85 個 collider）根本冇對應
// 網格。所以條 gate 唔守「有冇擺夠模型」，守嘅係**每一米撞得到嘅牆都望得見**。
{
    // 場景係 async 載嘅，要等佢唔再加先量。
    let 上次 = -1;
    for (let i = 0; i < 30; i++) {
        const n = await page.evaluate(() => (window.__ER2 ? window.__ER2.scenery().length : -1));
        if (n > 0 && n === 上次) break;
        上次 = n;
        await page.waitForTimeout(500);
    }
    const r = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api) return null;
        // 霧門唔算：佢自己有一塊發住光嘅網格，而且係暫時嘅。
        const walls = api.walls().filter((b) => b.tag !== 'fog-gate');
        const 實牆 = api.wallMesh();
        const 景 = api.scenery().filter((s) => s.top > 1.0);
        const 入面 = (px, pz, b, pad) => window.__尺.入面(px, pz, b, pad);
        // 「望得見」＝ 呢個位有一格真牆網格，或者一米半內有一件過米高嘅景。
        const 見到 = (px, pz) =>
            實牆.some((b) => 入面(px, pz, b, 0.05)) ||
            景.some((s) => Math.abs(px - s.x) <= s.hx + 1.5 && Math.abs(pz - s.z) <= s.hz + 1.5);
        let 總長 = 0, 隱形長 = 0;
        const 隱形 = [];
        for (const b of walls) {
            const 長半 = Math.max(b.hx, b.hz), 沿x = b.hx >= b.hz;
            const n = Math.max(2, Math.ceil((長半 * 2) / 0.5));
            let miss = 0;
            for (let i = 0; i <= n; i++) {
                const t = -長半 + (2 * 長半 * i) / n;
                const [px, pz] = window.__尺.點(b, 沿x ? t : 0, 沿x ? 0 : t);
                if (!見到(px, pz)) miss++;
            }
            總長 += 長半 * 2;
            隱形長 += (長半 * 2 * miss) / (n + 1);
            if (miss) 隱形.push(`(${b.x.toFixed(1)}, ${b.z.toFixed(1)}) ${miss}/${n + 1}`);
        }
        // 反方向：畫咗一格牆但嗰度冇 collider，就係一堵望到但穿得過嘅牆。
        // 亦都捉到「喺畫牆之後先加多個 collider」——嗰個 collider 唔會有網格。
        const 有標記 = api.walls().filter((b) => b.tag === 'wall');
        const 對唔上 = 有標記.filter((b) => !實牆.some((m) =>
            Math.abs(m.x - b.x) < 0.01 && Math.abs(m.z - b.z) < 0.01 &&
            Math.abs(m.hx - b.hx) < 0.01 && Math.abs(m.hz - b.hz) < 0.01)).length;
        return {
            牆數: walls.length, 景數: 景.length, 網格數: 實牆.length, 標記數: 有標記.length,
            總長: +總長.toFixed(1), 隱形長: +隱形長.toFixed(1),
            比例: +(隱形長 / 總長 * 100).toFixed(1), 隱形: 隱形.slice(0, 8), 對唔上,
        };
    });
    check('每一米撞得到嘅牆都望得見（唔會有隱形牆）',
        r != null && r.隱形長 === 0,
        r && { 總長: r.總長, 隱形長: r.隱形長, 比例: `${r.比例}%`, 位: r.隱形 });
    check('畫出嚟嘅牆同 collider 一格對一格（冇畫多、冇漏畫）',
        r != null && r.網格數 === r.標記數 && r.網格數 > 0 && r.對唔上 === 0,
        r && { 網格數: r.網格數, 標記數: r.標記數, 對唔上: r.對唔上 });

    // 反方向：望得見但穿得過。實測（未修之前）**同一個模型喺一個場實心，
    // 喺另一個場穿得過**——圓場入面兩條 `pillar_decorated` 有 collider，庭院
    // 同聖所嗰六條一模一樣嘅冇；`tree-large` 三棵入面圓場嗰兩棵實心、庭院嗰
    // 棵穿得過；`rocks-large` 四嚿入面三嚿實心。成因同上一條一樣：障礙物嘅
    // collider 係第二張手寫表（`addStaticBox([-14, 1.5, 12], …)` 十行），同
    // 擺模型嗰行完全分開。而家 collider 由模型自己 2 米以下嗰截幾何度出嚟。
    //
    // 貼住牆嗰啲鑲邊裝飾唔算——佢哋後面本來就係環牆。守嘅係**企喺空地中間、
    // 貼地、過米高嗰啲**：呢啲嘢望落係障礙，就唔應該行得過。
    const p = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api) return null;
        const m = api.map();
        const walls = api.walls();
        const 牆 = walls.filter((b) => b.tag === 'wall');
        const 可達 = (x, z) =>
            Math.hypot(x, z) < m.arenaR ||
            Math.hypot(x - m.court.cx, z - m.court.cz) < m.court.r ||
            Math.hypot(x, z - m.north.cz) < m.north.r ||
            (x >= m.bridge.x0 && x <= m.bridge.x1 && Math.abs(z) < m.bridge.halfWidth) ||
            (z >= m.hall.z0 && z <= m.hall.z1 && Math.abs(x) < m.hall.halfWidth) ||
            (Math.abs(x - m.link.x) < m.link.halfWidth && z <= m.court.cz - m.court.r && z >= m.link.z) ||
            (Math.abs(z - m.link.z) < m.link.halfWidth && x >= m.link.x && x <= -m.north.r);
        const 疊 = (s, b, pad) => window.__尺.入面(s.x, s.z, b, s.hx + pad, s.hz + pad);
        // 企喺分界線上面嘅係建築唔係障礙：`gate.glb` 就係圓場西門嗰個拱門，
        // 佢企喺 r = arenaR 上面，而環牆喺嗰度**特登冇**——所以「附近有冇牆
        // collider」認唔出佢。一個拱門本身就係一個窿，用一個盒描述唔到；
        // 逼佢實心即係封死道門。分界線兩米之內嘅一律唔計。
        const 喺分界 = (x, z) =>
            Math.abs(Math.hypot(x, z) - m.arenaR) < 2 ||
            Math.abs(Math.hypot(x - m.court.cx, z - m.court.cz) - m.court.r) < 2 ||
            Math.abs(Math.hypot(x, z - m.north.cz) - m.north.r) < 2 ||
            (x >= m.bridge.x0 - 2 && x <= m.bridge.x1 + 2 &&
                Math.abs(Math.abs(z) - m.bridge.halfWidth) < 2) ||
            (z >= m.hall.z0 - 2 && z <= m.hall.z1 + 2 &&
                Math.abs(Math.abs(x) - m.hall.halfWidth) < 2);
        const 候選 = api.scenery().filter((s) =>
            s.bottom < 0.5 && s.top - s.bottom > 1 && 可達(s.x, s.z) &&
            !喺分界(s.x, s.z) && !牆.some((b) => 疊(s, b, 1.5)));
        const 穿得過 = 候選
            .filter((s) => !walls.some((b) => 疊(s, b, 0)))
            .map((s) => `${s.url} (${s.x.toFixed(1)}, ${s.z.toFixed(1)})`);
        return { 候選: 候選.length, 穿得過 };
    });
    check('企喺空地中間、望落係障礙嘅嘢，一件都唔行得過',
        p != null && p.候選 > 0 && p.穿得過.length === 0,
        p && { 量咗幾件: p.候選, 穿得過: p.穿得過.slice(0, 8) });
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
        const 撞 = (px, pz) => walls.some((b) => window.__尺.入面(px, pz, b, 半徑));
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

// ---------- 分區補光行遠咗要熄 ----------
//
// PointLight 設咗 `distance` 之後超過嗰個距離貢獻係零，但 three.js 照樣
// 將佢放入 shader 嘅燈迴圈——即係每一個著色片元都照計。地圖由一個場變三
// 個場之後，庭院同聖所嗰兩盞喺圓場度畫面上完全睇唔到但每幀照畀錢（實測
// 熄咗兩盞 2.0 → 2.3 fps）。
//
// 條線唔係一個新門檻，係燈自己個 `distance`：**離得遠過自己射程嘅燈唔可
// 以著住**。咁樣就唔會有兩個數各寫各嘅。
{
    const fills = await page.evaluate(() => window.__ER2.fills());
    const 錯 = fills.filter((f) => f.亮 && f.離玩家 > f.射程 + 6);
    check('開波企喺圓場，射程以外嘅分區補光全部熄咗',
        fills.length > 0 && 錯.length === 0, fills);
}

// ---------- 目標喺畫面外嘅時候要指得返出嚟 ----------
//
// 第三關喺西面庭院，離出生點六十米。目標面板寫住「Take the westgate
// courtyard」，但一句字唔等於一個方向——夜晚、冇小地圖、二百米闊嘅場。
// 呢個缺口係擴地圖自己整出嚟嘅（ADR-148/149），所以一齊修：目標離玩家
// 超過 25 米就亮一支光柱喺目標度。
//
// 兩個方向都要守。淨係守「遠嘅時候有」，一支永遠著住嘅光柱一樣過關，
// 而嗰個係更加差嘅遊戲——你打緊埋身，一支柱插喺敵人身上阻住晒。
{
    const r = await page.evaluate(() => {
        const el = document.querySelector('[data-player-position]');
        const w = window.__ER2.waypoint();
        const [px, pz] = el.dataset.playerPosition.split(',').map(Number);
        const 兵 = (el.dataset.minionPositions || '').split('|').filter(Boolean)
            .map((s) => s.split(',').map(Number));
        const 距 = 兵.length
            ? Math.hypot(px - 兵.reduce((a, m) => a + m[0], 0) / 兵.length,
                         pz - 兵.reduce((a, m) => a + m[1], 0) / 兵.length)
            : null;
        return { ...w, 距: 距 };
    });
    check('第一波喺眼前嘅時候唔會亮光柱（近距離插支柱落去只會阻住）',
        r.距 != null && r.距 <= r.門檻 && r.亮 === false,
        { 目標距離: r.距 == null ? null : +r.距.toFixed(1), 門檻: r.門檻, 亮: r.亮 });

    // 「遠嘅時候會亮」呢個方向要打到第三關先見到，所以問個規則本身。
    const rule = await page.evaluate(() => {
        const api = window.__ER2;
        const R = api.waypoint().門檻;
        return {
            遠: api.waypointRule(R + 30, true),
            近: api.waypointRule(R - 5, true),
            啱好: api.waypointRule(R, true),
            冇目標: api.waypointRule(null, true),
            死咗: api.waypointRule(R + 30, false),
        };
    });
    check('目標遠過門檻就亮，近過就唔亮，冇目標同死咗都唔亮',
        rule.遠 === true && rule.近 === false && rule.啱好 === false
        && rule.冇目標 === false && rule.死咗 === false, rule);
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
    await page.waitForTimeout(32000);
    const b = await page.evaluate(() => window.__ER2.clock());
    await page.keyboard.up('KeyW');
    const 動 = b.motion - a.motion;
    // 唔再用「窗口入面數下數 ÷ 郁動秒」。實測嗰個率一下出手值 0.26/秒，而門檻
    // 0.9 啱好夾喺 3 下（0.81）同 4 下（1.04）中間——同一份程式碼跑兩次，一次
    // 綠一次紅，差別淨係一下出手。**一條分辨率細過自己要守嗰個效果嘅 gate，
    // 綠嘅時候咩都證明唔到。** 拉長窗口亦都唔得：玩家企喺度俾三隻雜兵打，
    // 捱唔到九十秒。
    //
    // 而家量每隻雜兵兩下出手之間隔咗幾多**郁動秒**。遊戲自己寫住
    // `nextAttack = now + 1.4 + rand`，所以只要 `now` 係郁動鐘，每個間隔都
    // 一定 ≥ 1.4；`now` 一改返做真實時間（ADR-150 嗰個缺陷），間隔換算成郁動
    // 秒就會跌到 0.25 左右。兩者差六倍，一個間隔已經分得開。
    const 間隔 = b.間隔.slice(a.間隔.length);
    const 最短 = 間隔.length ? Math.min(...間隔) : null;
    check('雜兵兩下出手之間，至少隔住遊戲自己寫嗰個 1.4 郁動秒',
        間隔.length >= 2 && 最短 >= 1.4,
        { 動: +動.toFixed(1), 量到幾多個間隔: 間隔.length,
          最短: 最短 === null ? null : +最短.toFixed(2),
          全部: 間隔.map((g) => +g.toFixed(2)).slice(0, 8),
          真實秒: +(b.real - a.real).toFixed(1) });
}

// ---------- 死完再玩，唔可以多咗一道睇唔見嘅牆 ----------
//
// 霧門個 collider 本來喺兩個地方各寫一次：開場一次，`restart()` 一次。
// ADR-154 將霧門由 `z = -9`／半闊 4 搬去通道口（-21.75／半闊 5.6）嗰陣，
// 只改到開場嗰個。即係**死一次撳 R 之後，圓場正中就多咗一道睇唔見嘅牆**，
// 闊度仲要同畫出嚟嗰道唔夾。
//
// 呢條要真係死一次先驗到，所以真係企定畀雜兵打死，再撳 R。
{
    await page.setViewportSize({ width: 640, height: 380 });
    await page.waitForTimeout(400);
    // 量成套靜態幾何，唔淨係量標住 fog-gate 嗰啲。第一版只數標住嘅，而個
    // bug 建出嚟嗰道流浪牆**係冇 tag 嘅**——條 gate 望唔到佢，突變照樣綠。
    // 真正嘅不變量係：重開唔可以改變成個場嘅靜態幾何。
    const 幾何 = () => page.evaluate(() => window.__ER2.walls()
        .map((b) => `${b.x.toFixed(2)},${b.z.toFixed(2)},${b.hx},${b.hz},${b.tag ?? ''}`)
        .sort().join('|'));
    // 霧門有兩道（北面通道口 + 聖所西口）。地圖砌成環之後，淨係守北面
    // 嗰道等於乜都冇守——西面兜個圈就直接入到 boss 場。
    const 門 = () => page.evaluate(() => window.__ER2.walls()
        .filter((b) => b.tag === 'fog-gate')
        .map((b) => `${b.x.toFixed(2)},${b.z.toFixed(2)},${b.hx},${b.hz},${b.ry.toFixed(3)}`)
        .sort());
    const 開場 = await 門();
    const 開場幾何 = await 幾何();
    // 企定唔郁，等雜兵打死玩家
    let 死咗 = false;
    for (let i = 0; i < 90 && !死咗; i++) {
        await page.waitForTimeout(1000);
        死咗 = await page.evaluate(() =>
            document.querySelector('[data-game-status]').dataset.gameStatus === 'dead');
    }
    check('企定唔郁會畀雜兵打死（呢條係下面嗰條嘅前提）', 死咗);
    if (死咗) {
        // 「YOU DIED」呢個蓋幅由頭到尾冇喺任何尺寸度量過版位——上面五個尺寸
        // 嘅重疊檢查全部喺第一關嗰陣做，而嗰陣佢仲未出現。玩家一定會見到
        // 呢一幅（而且係喺最唔想睇到亂版嘅時候）。
        const 死時重疊 = [];
        for (const [w, h, 名] of 尺寸) {
            await page.setViewportSize({ width: w, height: h });
            await page.waitForTimeout(500);
            const r = await 量重疊();
            if (r.重疊.length) 死時重疊.push(`${名}: ${r.重疊.join('／')}`);
        }
        check('「YOU DIED」蓋幅出咗嚟之後，五個尺寸都冇 HUD 重疊',
            死時重疊.length === 0, 死時重疊);
        await page.setViewportSize({ width: 640, height: 380 });
        await page.waitForTimeout(400);

        await page.keyboard.press('KeyR');
        await page.waitForTimeout(1500);
        const 重開 = await 門();
        const 重開幾何 = await 幾何();
        check('重開之後兩道霧門一道唔多一道唔少，位置尺寸角度同開場一樣',
            重開.length === 2 && 開場.length === 2 && 重開.join('|') === 開場.join('|'),
            { 開場, 重開 });
        check('重開唔可以改變成個場嘅靜態幾何（包括冇 tag 嘅流浪牆）',
            重開幾何 === 開場幾何,
            { 開場塊數: 開場幾何.split('|').length, 重開塊數: 重開幾何.split('|').length,
              多咗: 重開幾何.split('|').filter((x) => !開場幾何.includes(x)).slice(0, 4) });
    }
}

// ---------- 開波第一幅畫要係一個場景，唔係一浸嘢 ----------
//
// 上面所有版位檢查都係量矩形——矩形完全睇唔到「鏡頭埋咗入牆」呢類缺陷。
// 呢個 session 撞過兩次（走廊、L 形捷徑），兩次都係影相先發現，而每次張
// 牆表都話鏡頭同角色之間乜都冇（碰撞盒 0.42 米薄，而牆嘅網格厚好多）。
//
// 所以直接量像素。取畫面中下方一橫帶（避開 HUD），三個數：平均亮度、亮度
// 標準差、唯一色數。
//
// **拆成兩條，因為一條量度分唔開兩種失效。** 第一版淨係用標準差 ≥ 10，
// 而反方向驗證（月光同半球光全滅）**唔肯響**：亮度由 34.3 跌到 10.3，但標
// 準差反而升到 21.93——一幅接近全黑但有幾點亮嘅畫，變化係大嘅。三個狀態
// 實測：
//   正常出生點      亮度 34.3　標準差 16.6　色數 308
//   鏡頭埋咗入牆    亮度 25.6　標準差  7.2　色數  66
//   全部燈熄晒      亮度 10.3　標準差 21.9　色數 232
// 分得開「一浸平色」嘅係**色數**，分得開「實質全黑」嘅係**亮度**。
//
// **講清楚佢守唔到乜**：呢兩條企喺出生點，而嗰兩次鏡頭插牆都喺走廊先出現
// ——佢哋捉唔到嗰兩單。佢哋守嘅係開波第一幅畫，而其他檢查一律睇唔到像素。
{
    const buf = await page.screenshot();
    const st = await page.evaluate(async (b64) => {
        const img = new Image();
        await new Promise((r) => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        const x0 = Math.round(img.width * 0.15), x1 = Math.round(img.width * 0.85);
        const y0 = Math.round(img.height * 0.45), y1 = Math.round(img.height * 0.95);
        const d = g.getImageData(x0, y0, x1 - x0, y1 - y0).data;
        let n = 0, s = 0, s2 = 0;
        const seen = new Set();
        for (let i = 0; i < d.length; i += 4) {
            const L = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
            n++; s += L; s2 += L * L;
            seen.add(((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3));
        }
        const m = s / n;
        return { 亮度: +m.toFixed(1), 標準差: +Math.sqrt(s2 / n - m * m).toFixed(2), 色數: seen.size };
    }, buf.toString('base64'));
    check('開波第一幅畫唔係一浸平色（鏡頭埋咗入牆就係咁）',
        st.色數 >= 120 && st.標準差 >= 10, st);
    check('開波第一幅畫唔係實質全黑（燈掛咗就係咁）',
        st.亮度 >= 18, st);
}

// 主 page 仲喺度跑一個 WebGL loop，軟件光柵化之下佢會食晒 CPU，令新開嗰版
// 連撳個掣都 timeout。以下嘅檢查全部用自己開嘅版，所以泊咗主 page 先。
await page.goto('about:blank');

// ---------- 碌開要真係少食好多嘢 ----------
//
// 之前二十四條檢查冇一條掂過閃避，而佢係呢類遊戲嘅核心動詞。壞咗唔會報錯，
// 只會變成「點解我碌極都食晒」，而套件照樣全綠。
//
// 守後果，唔守常數：同一段**郁動時間**入面，不停碌收到嘅傷害率要顯著低過
// 企定唔郁。用郁動時間做分母，因為兩次跑嘅真實時間唔一樣（企定嗰次早死）。
//
// **佢守嘅係位移，唔係無敵幀。** 兩個機制拆開量（%HP／郁動秒，企定唔郁係
// 8.89）：
//     　　　　　冇位移　　有位移
//   冇無敵幀　  9.05　　　1.77
//   有無敵幀　  4.67　　　1.78
// 即係無敵幀單獨拎出嚟係有用嘅（9.05 → 4.67，少一半），但**加喺位移上面
// 一蚊都唔值**（1.77 → 1.78）——因為碌一下行 12.4 米/秒 × 0.68 秒 ≈ 8.4 米，
// 而雜兵攻擊距離得 1.82 米，你一早唔喺度，根本輪唔到無敵幀出場。
// 所以剷走無敵幀呢條 gate 唔會響（ADR-159）。
{
    const 試 = async (碌) => {
        const p2 = await browser.newPage({ viewport: { width: 560, height: 340 } });
        await p2.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
        await p2.waitForTimeout(1500);
        await p2.getByText('OATHBOUND', { exact: false }).first().click();
        await p2.getByText('ENTER THE VEIL').first().click();
        await p2.waitForTimeout(4500);
        const 血 = () => p2.evaluate(() => {
            const w = document.querySelector('.bar.health i');
            return w ? parseFloat(w.style.width) : null;
        });
        const 鐘 = () => p2.evaluate(() => window.__ER2.clock().motion);
        const h0 = await 血(), m0 = await 鐘();
        for (let i = 0; i < 45; i++) {
            if (碌) await p2.keyboard.press('Space');
            await p2.waitForTimeout(500);
            const st = await p2.evaluate(() =>
                document.querySelector('[data-game-status]').dataset.gameStatus);
            if (st !== 'playing') break;
        }
        const h1 = await 血(), m1 = await 鐘();
        await p2.close();
        return { 率: (h0 - h1) / Math.max(0.5, m1 - m0), 掉: h0 - h1, 秒: +(m1 - m0).toFixed(1) };
    };
    const 定 = await 試(false);
    const 碌 = await 試(true);
    check('不停碌收到嘅傷害率，要低過企定唔郁嘅一半（守嘅係位移，唔係無敵幀）',
        定.率 > 1 && 碌.率 <= 定.率 * 0.5,
        { 企定: `${定.掉.toFixed(0)}% / ${定.秒}s = ${定.率.toFixed(2)}%每秒`,
          不停碌: `${碌.掉.toFixed(0)}% / ${碌.秒}s = ${碌.率.toFixed(2)}%每秒` });
}

// ---------- 三個職業都要玩得到 ----------
//
// 上面每一條檢查都揀 OATHBOUND。即係三個職業入面兩個由頭到尾冇載入過——
// 佢哋用投射物、用唔同嘅攻擊動畫、射程 16／18 米（近戰係 4.4）。任何一個
// 靜靜哋壞咗，三分一玩家一開波就撞到，而套件會全綠。
//
// 唔重跑成套（三倍時間），只問每個職業最基本嗰幾樣：載得入、冇 error、
// 弧線幾何跟返自己嗰個射程、真係殺得死嘢。
{
    for (const [職, 射程] of [['ASTROLOGER', 16], ['WAYFARER', 18]]) {
        const p2 = await browser.newPage({ viewport: { width: 640, height: 380 } });
        const e2 = [];
        p2.on('pageerror', (e) => e2.push(e.message.split('\n')[0].slice(0, 90)));
        p2.on('console', (m) => { if (m.type() === 'error') e2.push('console: ' + m.text().slice(0, 90)); });
        await p2.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
        await p2.waitForTimeout(1500);
        await p2.getByText(職, { exact: false }).first().click();
        await p2.getByText('ENTER THE VEIL').first().click();
        await p2.waitForTimeout(4500);
        const sw = await p2.evaluate(() => window.__ER2 && window.__ER2.swing());
        const 前 = await p2.evaluate(() =>
            +document.querySelector('[data-enemies-remaining]').dataset.enemiesRemaining);
        for (let i = 0; i < 26; i++) { await p2.keyboard.press('KeyF'); await p2.waitForTimeout(700); }
        const 後 = await p2.evaluate(() => ({
            關: document.querySelector('[data-encounter]').dataset.encounter,
            狀態: document.querySelector('[data-game-status]').dataset.gameStatus,
        }));
        check(`${職}：載得入、零 error`, e2.length === 0, e2.slice(0, 2));
        check(`${職}：弧線幾何跟返自己嗰個射程（唔係抄近戰嗰個）`,
            sw != null && sw.判.射程 === 射程 && sw.畫.半徑 > 射程 * 0.6 && sw.畫.半徑 <= 射程,
            sw && { 判射程: sw.判.射程, 畫半徑: +sw.畫.半徑.toFixed(2) });
        check(`${職}：打得死嘢，推得郁關卡`, 後.關 !== 'wave-1' || 後.狀態 !== 'playing',
            { 開場敵人: 前, 之後: 後 });
        await p2.close();
    }
}

check('由頭到尾零 browser error', errors.length === 0, errors.slice(0, 3));

await browser.close();
await new Promise(r => server.close(r));
console.log(`\nelden-ring-ii 版位: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
