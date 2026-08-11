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
// `ER2_TIME=1` 會喺每條 gate 前面印「由上一條到而家用咗幾秒」。套件跑到半個
// 鐘之後，「邊條慢」呢個問題冇一把尺答得到——所以擺一把喺度。
// 量郁動時間嗰啲 gate 用嘅視窗。
//
// 佢哋一條都唔關解析度事——量嘅係郁動秒同計數器（速度、側滑、碎屑、boss
// 出手、重開到邊關）。而喺軟件光柵化之下解析度**就係**幀率：實測同一部機，
// 640×380 得 **1.7 fps**、420×250 **3.2**、320×190 **4.2**。而 `delta` 封喺
// 0.05，所以郁動時間跟住幀率走——細視窗即係同一段真實時間入面遊戲行多 2.5
// 倍。套件本來跑成半個鐘，慢到手機嗰節等入場掣等到 60 秒 timeout 掛咗。
//
// 版位／鏡頭／觸控嗰啲 gate 照用真尺寸，佢哋量緊嘅就係尺寸本身。
const 快版 = { width: 320, height: 190 };
const 計時 = process.env.ER2_TIME === '1';
let 上次 = Date.now(), 用時 = [];
function check(name, ok, detail) {
    const 秒 = (Date.now() - 上次) / 1000;
    上次 = Date.now();
    if (計時) 用時.push([+秒.toFixed(1), name]);
    const 前 = 計時 ? `[${秒.toFixed(1)}s] ` : '';
    if (ok) { pass++; console.log(`${前}PASS  ${name}`, detail === undefined ? '' : detail); }
    else { fail++; failed.push(name); console.log(`${前}FAIL  ${name}`, JSON.stringify(detail)); }
}

// 入場：撳職業掣，等入場掣 enable 咗，撳入場，等場景載好。
//
// **唔用 Playwright 嘅 `click()`。** 呢個檔嘅手機版塊一早記低咗原因：撳完之後
// Playwright 會一直等一個 scheduled navigation，等到 30 秒 timeout。頁數一多
// （而家一套跑落嚟開到第八版）就開始中招。同一段嘢本來喺六個地方各抄一份，
// 六份一齊中——所以而家得一份。
async function 入場(頁, 職業 = 'OATHBOUND', 等 = 4500) {
    const 撳 = (文) => 頁.evaluate((t) => {
        const b = [...document.querySelectorAll('button')].find((el) => (el.innerText || '').includes(t));
        if (b) b.click();
    }, 文);
    await 撳(職業);
    await 頁.waitForSelector('.enter-button:not([disabled])', { timeout: 60000 });
    await 撳('ENTER THE VEIL');
    await 頁.waitForTimeout(等);
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
await 入場(page, 'OATHBOUND', 4000);

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
    // 走廊裝飾牆嘅內面，要就係你停低嗰個面。實測（未修之前）**二十八幅全部
    // 喺 collider 面入面 1.36 米**——你望住幅牆行埋去，會喺牆入面成米幾先停。
    // 同 ADR-165 一樣嘅成因：模型擺喺手寫嘅 `z = ±5.8`，collider 由
    // `BRIDGE.halfWidth = 5.6` 生出。而家兩樣由同一組數出，條 gate 夾實佢哋。
    const f = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api) return null;
        const T = api.map().wallT;
        const 鋪咗 = api.scenery().filter((s) => s.run);
        const 錯 = 鋪咗.map((s) => {
            const 半 = s.run.面軸 === 'x' ? s.hx : s.hz;
            const 內面 = (s.run.面軸 === 'x' ? s.x : s.z) + s.run.內 * 半;
            const 應該 = s.run.面 + s.run.內 * T;
            return { s, 差: +((內面 - 應該) * s.run.內).toFixed(2) };
        // 符號：`內` 指住行人嗰邊，所以「伸咗入行人區」係**正數**。第一版寫
        // 咗 `< -0.05`，突變（擺返舊嗰個 ±5.8）之下照綠——一條分唔清方向嘅
        // gate 同冇 gate 一樣。
        }).filter((r) => r.差 > 0.05)
            .map((r) => `${r.s.url} (${r.s.x.toFixed(1)}, ${r.s.z.toFixed(1)}) 入咗 ${r.差}m`);
        return { 鋪咗: 鋪咗.length, 錯 };
    });
    check('走廊裝飾牆嘅內面就係你停低嗰個面（唔會企到入牆裡面）',
        f != null && f.鋪咗 > 0 && f.錯.length === 0,
        f && { 鋪咗幾多塊: f.鋪咗, 伸入行人區: f.錯.slice(0, 6) });

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

// ---------- 隔住條柱打唔打得中 ----------
//
// 搵攻擊目標本來淨係計距離同橫向偏移，**冇任何視線檢查**——即係場入面啲柱、
// 石、牆喺戰鬥入面完全唔存在：你射得穿佢，佢都打得穿你。而呢啲掩護本身就係
// ADR-165 之後先變返實心嘅（之前連行都行得過）。
//
// 條 gate 攞遊戲自己啲障礙做樣本：兩邊各企兩米，中間夾住一件嘢，視線一定要
// 斷；同一對點但擺喺空地，視線一定要通。兩個方向都守，先分得開「守到嘢」同
// 「乜都話擋住」。
{
    const los = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api || !api.視線) return null;
        const 障礙 = api.walls().filter((b) => b.tag === 'prop');
        const 斷唔到 = [], 通唔到 = [];
        for (const b of 障礙) {
            const d = Math.max(b.hx, b.hz) + 2;
            for (const [ux, uz] of [[1, 0], [0, 1], [0.707, 0.707]]) {
                const a = [b.x - ux * d, b.z - uz * d], c = [b.x + ux * d, b.z + uz * d];
                if (api.視線(a, c)) 斷唔到.push(`(${b.x.toFixed(1)},${b.z.toFixed(1)}) 軸 ${ux},${uz}`);
            }
        }
        // 對照：空地上面同樣長度嘅線段要通。冇呢一半，一個「乜都話擋住」嘅
        // 實作都會綠。
        for (const [a, c] of [[[0, 17], [0, 10]], [[-60, 0], [-60, 6]], [[0, -48], [6, -48]]]) {
            if (!api.視線(a, c)) 通唔到.push(`${a} → ${c}`);
        }
        return { 障礙: 障礙.length, 斷唔到, 通唔到 };
    });
    check('隔住一件障礙物，視線一定斷（唔會隔住條柱打得中）',
        los != null && los.障礙 > 10 && los.斷唔到.length === 0,
        los && { 障礙數: los.障礙, 斷唔到: los.斷唔到.slice(0, 5) });
    check('空地上面視線通（把尺唔係乜都話擋住）',
        los != null && los.通唔到.length === 0, los && { 通唔到: los.通唔到 });
}

// ---------- 鏡頭同搖桿（Penny 落手玩之後報嘅三樣） ----------
//
// 一、**一入去視覺咁近**：出生點寫死 `z = 17`，離南面環牆得 5.35 米，而鏡頭
//     要企喺玩家後面 8.3 米 + 牆 0.42 + 遮擋 pad 1.35 = 10.07 米。結果一開波
//     鏡頭就撞牆，跌到遮擋邏輯嘅 2.4 米下限——**實測四個尺寸 2.73–2.84 米，
//     設計距離嘅三分一**。而家出生點由 `ARENA_RADIUS − CAMERA_CLEARANCE` 度
//     出，唔再手寫。
// 二、**冇 zoom**：深淵之橋有 `view.zoomBy`（0.7–1.7，滾輪 + 雙指），ER2 冇。
// 三、**控桿太左**：釘死喺左下角，打橫嗰陣中心喺畫面 8.3%／10.5% 位置。而家
//     照深淵之橋做浮動——你撳邊度就喺邊度出。
{
    for (const [w, h, 名] of 尺寸) {
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(900);
        const r = await page.evaluate(() => {
            const el = document.querySelector('[data-camera-position]');
            const [cx, cz] = el.dataset.cameraPosition.split(',').map(Number);
            const [px, pz] = el.dataset.playerPosition.split(',').map(Number);
            return { 距離: +Math.hypot(cx - px, cz - pz).toFixed(2), pz };
        });
        // 條線唔係我揀嘅數，係遊戲自己個 `CAMERA_BACK`：入場第一眼唔可以連
        // 設計距離嘅七成都冇。
        check(`${名} ${w}×${h}：入場第一眼鏡頭唔會撞埋牆`,
            r.距離 >= 8.3 * 0.7, { 鏡頭距離: r.距離, 出生點z: r.pz });
    }
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(600);

    const z = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api || !api.zoomBy) return null;
        const 起 = api.zoom();
        const 拉遠 = api.zoomBy(1.09 ** 12);      // 撳到頂
        const 拉近 = api.zoomBy((1 / 1.09) ** 30); // 撳到底
        return { 起, 拉遠, 拉近 };
    });
    check('有得縮放，而且夾住上下限（同深淵之橋一樣 0.7–1.7）',
        z != null && z.起 === 1 && z.拉遠 === 1.7 && z.拉近 === 0.7, z);

}

// ---------- 敵人隔住掩護打唔打得中 ----------
//
// ADR-172 加咗視線落**玩家**嗰邊，但敵人出手嗰兩個判定冇跟。實測：射程之內、
// 視線斷咗嘅位置，**雜兵 85/85、boss 一階 128/128、二階 196/196 全部照打得
// 中**——即係嗰一輪令掩護變成「淨係幫到敵人」，比兩邊一齊錯仲差。
//
// 條 gate 問嘅係遊戲自己嗰條 `canLand`，射程亦都由遊戲出，唔喺測試度寫死。
{
    const h = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api || !api.出手) return null;
        const 射 = api.射程();
        const 障礙 = api.walls().filter((b) => b.tag === 'prop' || b.tag === 'wall');
        const 打得穿 = [], 打唔到 = [];
        let 共 = 0;
        for (const [名, r] of Object.entries(射)) {
            for (const b of 障礙) {
                for (const [ux, uz] of [[1, 0], [0, 1], [0.707, 0.707]]) {
                    const d = Math.abs(ux) * b.hx + Math.abs(uz) * b.hz + 0.45;
                    if (d * 2 >= r) continue;              // 隔住呢件嘢已經超出射程
                    共 += 1;
                    const p = [b.x - ux * d, b.z - uz * d], q = [b.x + ux * d, b.z + uz * d];
                    if (api.出手(p, q, r)) 打得穿.push(`${名} ${b.tag} (${b.x.toFixed(1)},${b.z.toFixed(1)})`);
                }
            }
            // 對照：同樣距離但空地，一定要打得中。冇呢一半，一個「乜都打唔中」
            // 嘅實作都會綠。
            for (const [p, q] of [[[0, 17], [0, 17 - r * 0.8]], [[0, -48], [r * 0.8, -48]]]) {
                if (!api.出手(p, q, r)) 打唔到.push(`${名} ${p} → ${q}`);
            }
        }
        return { 共, 打得穿, 打唔到 };
    });
    check('敵人隔住掩護打唔中（射程之內但視線斷咗）',
        h != null && h.共 > 100 && h.打得穿.length === 0,
        h && { 量咗幾多個位: h.共, 打得穿: h.打得穿.slice(0, 5) });
    check('空地上面同樣距離打得中（把尺唔係乜都話打唔到）',
        h != null && h.打唔到.length === 0, h && { 打唔到: h.打唔到 });
}

// ---------- 恩典點企唔企得到 ----------
//
// 恩典點係呢隻遊戲唯一嘅回血同 checkpoint。實測兩個**都喺 collider 入面**：
// (9, 15) 嗰個一直被一個手寫盒封住（ADR-165 仲要喺嗰個位補咗嚿石落去，變成
// 一嚿石壓住個 checkpoint），而 (-52.5, -6.5) 嗰個係今個 session 令庭院啲柱
// 變實心之後先封死嘅。一個企唔到人嘅 checkpoint 唔會報錯，佢淨係唔存在。
//
// 呢個係 ADR-165 嗰一個改動嘅**第三個後果**（前兩個：18 個雜兵追唔到嘅位、
// boss 場四分一安全區）。畀啲裝飾加 collider 呢句話，比佢聽落改得多好多。
{
    const g = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api || !api.graces) return null;
        const walls = api.walls();
        const 壞 = api.graces()
            .filter((p) => walls.some((b) => window.__尺.入面(p.x, p.z, b, 0.42)))
            .map((p) => `(${p.x.toFixed(1)}, ${p.z.toFixed(1)})`);
        return { 共: api.graces().length, 壞 };
    });
    check('每個恩典點都企得到人（冇嘢壓住個 checkpoint）',
        g != null && g.共 >= 2 && g.壞.length === 0,
        g && { 共: g.共, 企唔到嘅: g.壞 });
}

// ---------- 雜兵追唔追得到你 ----------
//
// 清晒一波先開到下一關。即係話「有一個玩家企得到嘅位置係雜兵永遠到唔到嘅」
// 唔止係「打得輕鬆啲」——係成局卡死。
//
// 呢條之前答唔到：唯一嘅方法係喺瀏覽器度企定等佢行過嚟，而軟件光柵化一秒
// 三幀、角色一秒行半米，量到嘅係機械人蠢定係地圖爛（ADR-157）。而家用
// `__ER2.追擊試()`：同一批 collider、同一條 `chase.ts` 規則、固定 1/60 步長，
// 唔畫任何嘢——233 次追擊四秒跑完，同幀率完全無關。
//
// 實測（加迴避之前）：**233 個位入面 18 個到唔到**，全部停喺今個 session 先
// 啱啱變實心嗰啲嘢前面——圓場兩條柱 (±11.2, -11.6)、投石車 (13, 8)、庭院嗰
// 嚿石 (-68, -8)。即係 ADR-165 嗰個修正**順手整咗個卡死出嚟**。
{
    const r = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api || !api.追擊試) return null;
        const m = api.map();
        const 區 = [
            { wave: 0, cx: 0, cz: 0, r: m.arenaR },
            { wave: 1, cx: 0, cz: 0, r: m.arenaR },
            { wave: 2, cx: m.court.cx, cz: m.court.cz, r: m.court.r },
        ];
        const walls = api.walls();
        const 企得 = (x, z) => !walls.some((b) => window.__尺.入面(x, z, b, 0.5));
        const 壞 = [];
        let 試 = 0, 最耐 = 0;
        for (const g of 區) {
            const 位 = [];
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) for (const f of [0.35, 0.7, 0.92]) {
                const x = g.cx + Math.cos(a) * g.r * f, z = g.cz + Math.sin(a) * g.r * f;
                if (企得(x, z)) 位.push([+x.toFixed(1), +z.toFixed(1)]);
            }
            for (const s of api.spawns().filter((x) => x.wave === g.wave)) for (const p of 位) {
                試 += 1;
                const out = api.追擊試([s.x, s.z], p, 24);
                最耐 = Math.max(最耐, out.用咗);
                if (!out.到) 壞.push(`wave${s.wave} (${s.x},${s.z}) → (${p[0]},${p[1]}) 最近 ${out.最近} 停喺 ${out.尾}`);
            }
        }
        return { 試, 壞, 最耐: +最耐.toFixed(1) };
    });
    check('每一個玩家企得到嘅位，雜兵都追得到（唔會卡死喺障礙物前面）',
        r != null && r.試 > 200 && r.壞.length === 0,
        r && { 試咗幾多次: r.試, 到唔到嘅: r.壞.length, 最耐幾秒: r.最耐, 例: r.壞.slice(0, 5) });

    // Boss 一樣。佢卡住唔會令成局玩唔落去（boss 唔使清先過關），但聖所最大
    // 嗰個特徵就係嗰四條柱，而實測**41 個位入面 10 個** boss 到唔到——佢企死
    // 喺 x = ±4.3，即係柱嘅內側。即係話成個 boss 場有四分一係安全區。
    const bb = await page.evaluate(() => {
        const api = window.__ER2;
        if (!api || !api.追擊試) return null;
        const m = api.map();
        const walls = api.walls();
        const 企得 = (x, z) => !walls.some((b) => window.__尺.入面(x, z, b, 1.0));
        const 位 = [];
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) for (const f of [0.3, 0.55, 0.8, 0.93]) {
            const x = Math.cos(a) * m.north.r * f, z = m.north.cz + Math.sin(a) * m.north.r * f;
            if (企得(x, z)) 位.push([+x.toFixed(1), +z.toFixed(1)]);
        }
        const 壞 = [];
        let 最耐 = 0;
        for (const p of 位) {
            const out = api.追擊試([0, m.north.cz], p, 24, 'boss');
            最耐 = Math.max(最耐, out.用咗);
            if (!out.到) 壞.push(`(${p[0]},${p[1]}) 最近 ${out.最近} 停喺 ${out.尾}`);
        }
        return { 試: 位.length, 壞, 最耐: +最耐.toFixed(1) };
    });
    check('boss 場入面每一個企得到嘅位，boss 都追得到（冇安全區）',
        bb != null && bb.試 > 30 && bb.壞.length === 0,
        bb && { 試咗幾多次: bb.試, 到唔到嘅: bb.壞.length, 最耐幾秒: bb.最耐, 例: bb.壞.slice(0, 5) });
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
        const 窗 = api.leapRange();
        const 窗中 = (窗.min + 窗.max) / 2;
        const 掃 = (phase, dist) => {
            const out = new Set();
            for (let i = 0; i < 40; i++) out.add(api.bossMove(phase, dist, i / 40));
            return [...out].sort();
        };
        const 撲率 = (phase, dist) => {
            let n = 0;
            for (let i = 0; i < 40; i++) if (api.bossMove(phase, dist, i / 40) === 'leap') n++;
            return n;
        };
        return {
            R, 窗,
            // 「遠」要喺**窗口正中**攞，唔係由下限加個數出嚟。加咗上限之後
            // 舊嗰個 `R + 8`（14.5 米）跌咗出窗口外面，三條 gate 一齊變紅——
            // 支尺自己砌條規則嘅輸入，就會跟唔上條規則。
            一階遠: 掃(1, 窗中), 一階近: 掃(1, 2),
            二階遠: 掃(2, 窗中), 二階近: 掃(2, R - 1),
            太遠: 掃(2, 窗.max + 5),
            一階撲幾多: 撲率(1, 窗中), 二階撲幾多: 撲率(2, 窗中),
        };
    });
    // 本來寫「第一階段永遠淨係用拳」。實測**boss 換第二階段嗰刻同玩家嘅距離
    // 係 6.0 米**，已經細過撲擊嘅 6.5——即係「第二階段先有嘅招」永遠等唔到
    // 自己嘅距離。一個埋身手段淨係喺已經埋咗身之後先開放，等於冇。兩個階段
    // 而家都撲得，而條 gate 問返真正嗰個分別：**第二階段撲得密好多**。
    check('兩個階段都撲得，但第二階段撲得密好多',
        r != null && r.一階撲幾多 > 0 && r.二階撲幾多 > r.一階撲幾多 * 1.5,
        r && { 一階: `${r.一階撲幾多}/40`, 二階: `${r.二階撲幾多}/40` });
    check('第二階段企喺窗口入面會撲，兩招都出得到',
        r != null && r.二階遠.length === 2,
        r && { 二階遠: r.二階遠, 窗口: r.窗 });
    // 撲擊嘅飛行段係 `位移 ÷ 剩返嘅前搖`——冇上限就會由六十米外用癲速撲埋嚟。
    check('太遠就唔撲（撲擊有上限，唔係由場邊飛過嚟）',
        r != null && r.太遠.join() === 'punch',
        r && { 太遠: r.太遠, 窗口: r.窗 });
    check('第二階段埋身唔會撲（撲擊係用嚟埋位嘅，唔係貼身用）',
        r != null && r.二階近.join() === 'punch',
        r && { 二階近: r.二階近 });

    // 撲擊嘅預警圈畫喺**落點**，傷害亦都由落點度起——所以撲向一個隔住柱嘅
    // 目標，就係將個圈畫喺玩家過唔到嘅地方，而隻怪卡喺柱前面。實測第二階段
    // 嘅撲擊組合入面 **32.8% 中間有嘢擋住**（走廊牆修好之前係 56.6%）。
    const 睇 = await page.evaluate(() => {
        const api = window.__ER2;
        const 窗 = api.leapRange();
        const 窗中 = (窗.min + 窗.max) / 2;
        const 掃 = (見到) => {
            const out = new Set();
            for (let i = 0; i < 40; i++) out.add(api.bossMove(2, 窗中, i / 40, 見到));
            return [...out].sort().join();
        };
        return { 見到: 掃(true), 見唔到: 掃(false) };
    });
    check('見唔到落點就唔撲（見到嘅時候照撲）',
        睇 != null && 睇.見唔到 === 'punch' && 睇.見到 === 'leap,punch', 睇);
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

// ---------- 以下兩節本來喺主 page 泊低之前跑 ----------
//
// 主 page 係一個仲喺度行緊嘅 WebGL loop，軟件光柵化之下佢食晒 CPU。呢兩節
// 各自開自己嘅版，即係同主 page 爭——實測手機嗰節等入場掣等到 **60 秒
// timeout，成個套件掛咗**。佢哋兩個都係自足嘅（自己開 context／page、自己
// 入場、自己 close），所以搬落嚟泊咗主 page 之後跑，一行都唔使改。
{
    // 搖桿要喺一個真係「摸得到」嘅 page 度量：手機 CSS 收喺
    // `@media (max-width: 760px), (pointer: coarse)` 入面，而套件本身嗰個
    // page 冇 touch，所以 `.touch-stick` 連 `position: fixed` 都冇——第一版
    // 就係咁報「搖桿出咗喺 (0, 0)」，而個缺陷喺我支尺度唔喺遊戲度。
    const 手機 = await browser.newContext({
        viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true,
    });
    const p3 = await 手機.newPage();
    await p3.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await p3.waitForTimeout(1200);
    // 呢個 mobile context 入面唔用 Playwright 嘅 `click()`：`getByText` 會撳中
    // 標題嗰個 `<span>Oathbound.</span>`，而 `locator('button')` 撳完之後
    // Playwright 會一直「等 scheduled navigation」等到 timeout。直接叫 DOM
    // 嘅 `click()`——呢度要測嘅係入到遊戲之後嘅搖桿，唔係點樣撳粒掣。
    const 撳 = (t) => p3.evaluate((text) => {
        const b = [...document.querySelectorAll('button')].find((el) => (el.innerText || '').includes(text));
        if (b) b.click();
    }, t);
    await 撳('OATHBOUND');
    // 入場掣載緊嘢嗰陣係 `disabled`，DOM 嘅 `.click()` 唔會有反應（Playwright
    // 嘅 `click()` 會等，所以第一版睇唔出）。等佢 enable 咗先撳。
    await p3.waitForSelector('.enter-button:not([disabled])', { timeout: 60000 });
    await 撳('ENTER THE VEIL');
    await p3.waitForTimeout(4000);
    const 掣位 = await p3.evaluate(() => {
        const zone = document.querySelector('.touch-zone');
        if (!zone) return null;
        const z = zone.getBoundingClientRect();
        return [...document.querySelectorAll('.touch-actions button')].map((b) => {
            const r = b.getBoundingClientRect();
            return { 掣: b.innerText.trim().slice(0, 6),
                喺搖桿區入面: r.left < z.right && r.right > z.left && r.top < z.bottom && r.bottom > z.top };
        });
    });
    check('動作掣唔可以跌入搖桿區（撳攻擊唔應該開咗搖桿）',
        掣位 != null && 掣位.length === 4 && 掣位.every((b) => !b.喺搖桿區入面), 掣位);
    // 手機本來得 ◎／DODGE／⚔ **三粒**——即係連互動掣都冇，賜福同藥瓶兩樣都用
    // 唔到。而家有第四粒（同鍵盤 E 一樣：企喺賜福就休息，唔喺就飲藥）。
    check('手機有得飲藥／喺賜福休息（本來連互動掣都冇）',
        掣位 != null && 掣位.some((b) => b.掣.includes('⚱')), 掣位);
    const st = await p3.evaluate(async () => {
        const out = [];
        for (const [x, y] of [[101, 293], [253, 234], [380, 332]]) {
            const zone = document.querySelector('.touch-zone');
            if (!zone) return { 冇區: true };
            zone.dispatchEvent(new PointerEvent('pointerdown',
                { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, bubbles: true }));
            await new Promise((r) => setTimeout(r, 90));
            const el = document.querySelector('.touch-stick');
            const b = el ? el.getBoundingClientRect() : null;
            out.push(b ? { 撳: [x, y], 差: [Math.round(b.left + b.width / 2 - x), Math.round(b.top + b.height / 2 - y)] } : { 撳: [x, y], 冇出: true });
            zone.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', bubbles: true }));
            await new Promise((r) => setTimeout(r, 60));
        }
        const 收返 = !document.querySelector('.touch-stick');
        return { out, 收返 };
    });
    check('搖桿撳邊出邊（唔再釘死喺左下角），放手收返',
        st != null && !st.冇區 && st.收返 &&
        st.out.every((o) => !o.冇出 && Math.abs(o.差[0]) <= 2 && Math.abs(o.差[1]) <= 2),
        st);

    // 支「模擬」搖桿其實係數位嘅。
    //
    // `updateStick` 好好地算咗個幅度出嚟，跟住 `movement.normalize()` 即刻將
    // 佢掉咗——**輕輕推同推到底一樣快**，成隻遊戲冇「慢行」呢件事。而且衝刺
    // 淨係綁 `ShiftLeft`：三粒觸控掣係 ◎／DODGE／⚔，即係**成個 1.55 倍嘅移動
    // 機制，手機玩家一世都用唔到**。加多粒掣會逼爆 HUD（ADR-175 為咗掣位打
    // 過一場），所以用主機遊戲嗰個做法：推到個環度就係跑。
    // 兩個速度樣本係兩個獨立問題，唔應該共用一個已經行遠咗嘅戰鬥局面。
    // 之前第一個半推樣本會將玩家帶到雜兵旁邊；第二個全推樣本等足 11 秒時，
    // 玩家有機會已經死咗，遊戲按設計收起 `.touch-zone`，但測試仍直接搵佢
    // dispatch `pointerup`，於是由測試自身拋出 null error。每次重新入場既保留
    // 真實控制流程，又令兩個樣本互不污染；放手時則用 optional chaining，因為
    // 長按期間自然死亡係合法產品狀態，唔應該變成測試 harness crash。
    const 推 = async (px, 秒) => {
        await p3.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
        await p3.waitForTimeout(1200);
        await 入場(p3);
        await p3.waitForSelector('.touch-zone', { timeout: 10000 });
        await p3.evaluate(() => window.__ER2.重置動作量度());
        await p3.evaluate((d) => {
            const z = document.querySelector('.touch-zone');
            if (!z) throw new Error('手機速度量度開始前搵唔到搖桿區');
            z.dispatchEvent(new PointerEvent('pointerdown',
                { pointerId: 9, pointerType: 'touch', clientX: 400, clientY: 250, bubbles: true }));
            z.dispatchEvent(new PointerEvent('pointermove',
                { pointerId: 9, pointerType: 'touch', clientX: 400, clientY: 250 - d, bubbles: true }));
        }, px);
        await p3.waitForTimeout(秒);
        const r = await p3.evaluate(() => window.__ER2.動作());
        const 收場 = await p3.evaluate(() => {
            const status = document.querySelector('[data-game-status]')?.dataset.gameStatus ?? null;
            const z = document.querySelector('.touch-zone');
            z?.dispatchEvent(new PointerEvent('pointerup',
                { pointerId: 9, pointerType: 'touch', bubbles: true }));
            return { status, 有搖桿: Boolean(z) };
        });
        await p3.waitForTimeout(2500);
        return { ...r, 測試收場狀態: 收場.status, 測試收場有搖桿: 收場.有搖桿 };
    };
    // 搖桿半徑 52px：26 ＝ 啱啱好半推，62 ＝ 推穿個環。
    const 半 = await 推(26, 11000);
    const 盡 = await 推(62, 11000);
    // 條規則講「推幾多就行幾快」，即係半推**預測**係設計速嘅一半。呢度對嘅係
    // 個預測值，唔係一條我自己揀出嚟嘅門檻——條規則爛咗個數就係 4.4（全速）
    // 或者 0，兩邊都離預測值好遠。
    check('搖桿推幾多就行幾快（唔係撳親就全速）',
        半 != null && 盡 != null && Math.abs(半.最高速 - 半.設計速 * 0.5) <= 0.35,
        { 半推: 半 && 半.最高速, 預測: 盡 && +(盡.設計速 * 0.5).toFixed(2),
          推到底: 盡 && 盡.最高速, 設計速: 盡 && 盡.設計速,
          半推收場: 半 && 半.測試收場狀態, 全推收場: 盡 && 盡.測試收場狀態 });

    // 呢條**唔使揀門檻**：行路嗰條路嘅速度目標係 `設計速 × 推度`，而 `推度`
    // 上限係 1——即係行路**數學上唔可能**行得快過 4.4。任何高過 4.4 嘅數，
    // 本身就證明咗衝刺入咗。（第一版寫 `> 設計速 × 1.05`，實測 4.8 對 4.62
    // ——一條貼住噪音嘅線，而佢守嗰件事其實係非黑即白。）
    // 條件淨係得速度一項。第一版仲要求動畫係 `Run*`——而動畫係**抽樣嗰刻嘅
    // 瞬時狀態**：實測有一次讀到 `RecieveHit`（啱好中招），速度 6.82 好地地
    // 但條 gate 紅咗。速度本身已經係證明（行路數學上唔可能過 4.4），加個動畫
    // 條款冇證多啲嘢，淨係加咗個會飄嘅狀態。
    check('手機都衝刺到（搖桿推到個環度就係跑）',
        盡 != null && 盡.最高速 > 盡.設計速 + 0.05,
        { 推到底: 盡 && 盡.最高速, 行路唔可能過: 盡 && 盡.設計速, 動畫: 盡 && 盡.動畫 });
    await 手機.close();
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
    // **開自己一版。** 本來喺共用嗰版度做，而前面啲檢查已經捱咗一輪打——
    // 玩家喺個 32 秒窗口中間死咗，雜兵凍結喺 "attack"，`minionAttacks` 唔再
    // 加。收場讀到 `狀態: "dead"`、間隔零個，即係**支尺量緊一具屍體**。
    const p6 = await browser.newPage({ viewport: 快版 });
    await p6.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await p6.waitForTimeout(1500);
    await 入場(p6);
    // 完全唔郁。雜兵會自己行埋嚟（實測 1.3 郁動秒之內兩隻都埋到身出到手），
    // 所以「行過去逼佢哋開打」反而係製造距離。
    const a = await p6.evaluate(() => window.__ER2.clock());
    // 企定捱打會死，一死就再冇出手可以量。所以窗口一開始就量，而且**發現死咗
    // 就即刻停**——唔好等夠 32 秒先發現量咗一段冇嘢發生嘅時間。
    // 一隻雜兵要出兩次手先度得到一個「間隔」，而呢個環境一秒三幀——固定等
    // 32 秒有時得 2.6 郁動秒，樣本零個。所以**等到有嘢量為止**，而唔係等一
    // 個固定時間；玩家一死就即刻停（死咗之後再冇出手，等落去只係浪費時間）。
    let 收場狀態 = null, b = a;
    for (let i = 0; i < 30; i += 1) {
        await p6.waitForTimeout(2000);
        收場狀態 = await p6.evaluate(() => ({
            狀態: document.querySelector('[data-game-status]')?.dataset.gameStatus,
            剩: document.querySelector('[data-enemies-remaining]')?.dataset.enemiesRemaining,
        }));
        b = await p6.evaluate(() => window.__ER2.clock());
        if (收場狀態.狀態 !== 'playing') break;
        if (b.間隔.length - a.間隔.length >= 2) break;
    }
    await p6.close();
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
    // 要求兩個間隔會飄：同一份程式碼有時攞到 4 個、有時 1 個（雜兵要企啱位
    // 先出手，而佢哋而家仲要轉身）。一個間隔已經分得開——1.75 對住「時鐘改
    // 返做真實時間」嗰個 0.25，差七倍。
    check('雜兵兩下出手之間，至少隔住遊戲自己寫嗰個 1.4 郁動秒',
        間隔.length >= 1 && 動 > 2 && 最短 >= 1.4,
        { 動: +動.toFixed(1), 出手: b.attacks - a.attacks, 量到幾多個間隔: 間隔.length,
          最短: 最短 === null ? null : +最短.toFixed(2),
          全部: 間隔.map((g) => +g.toFixed(2)).slice(0, 8),
          真實秒: +(b.real - a.real).toFixed(1), 收場: 收場狀態 });
}


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
        const p2 = await browser.newPage({ viewport: 快版 });
        await p2.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
        await p2.waitForTimeout(1500);
        await 入場(p2);
        const 血 = () => p2.evaluate(() => {
            const w = document.querySelector('.bar.health i');
            return w ? parseFloat(w.style.width) : null;
        });
        const 鐘 = () => p2.evaluate(() => window.__ER2.clock().motion);
        const h0 = await 血(), m0 = await 鐘();
        // 唔好用「幾時死」做指標：45 次窗口之下兩邊都啱啱好掉 40%（整條比較企
        // 晒喺分母度），拉長到 90 次之後兩邊都死，而「死得幾快」跑兩次讀到
        // 2.00× 同 1.74×——**條 2× 門檻直接落喺噪音入面**。
        //
        // 改為**固定郁動時間**窗口，兩邊都行夠 7 秒（或者死咗為止）先比傷害。
        // 分母一樣，剩返嘅差別就淨係「食咗幾多」。
        for (let i = 0; i < 120; i++) {
            if (碌) await p2.keyboard.press('Space');
            await p2.waitForTimeout(500);
            const st = await p2.evaluate(() => ({
                s: document.querySelector('[data-game-status]').dataset.gameStatus,
                m: window.__ER2.clock().motion,
            }));
            if (st.s !== 'playing' || st.m - m0 >= 7) break;
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

// ---------- 隻角色郁得似唔似有重量 ----------
//
// 「機械人」量得到：**一幀之內轉幾多度、一幀之內加幾多速**。實測未修之前，
// 玩家最快轉向 **62.6 弧度／秒（每秒 3587 度）**、行走最快加速 **250 米／秒²
// （約 25 g）**——推前推後之間零過渡，轉身同起步都係一 tick 完成。
//
// 條線唔係我拍腦袋揀嘅：佢就係 `motion.ts` 自己嗰兩個上限。擊退同閃避唔計
// ——嗰啲係衝量，本來就應該瞬間。
//
// **開自己一版**：呢條要揸住個角色行十幾秒，喺共用嗰版度做就會令玩家喺後面
// 嗰啲檢查開始之前已經死咗——第一版就係咁，跟住條出手節奏 gate 量到 0 下出手
// （而唔係「雜兵唔識打」）。一條 gate 唔應該整污糟後面嗰啲。
{
    const p4 = await browser.newPage({ viewport: 快版 });
    await p4.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await p4.waitForTimeout(1500);
    await 入場(p4);
    await p4.evaluate(() => window.__ER2.重置動作量度());
    // 先量四刀再跑。**條斜坡而家係真嘅**（0.55 秒到全速），而呢個環境
    // 一秒三幀——1.3 秒嘅撳掣得四幀，根本未加速完，最高速讀到 4.3 對 4.4 就
    // 紅。條 gate 唔係量錯咗嘢，係**冇畀夠時間畀佢要量嗰件事發生**。
    // 向北係 34 米空地（出生點 z 12.3，霧門喺 −21.75）。
    // 呢段腳本本來係喺 **1.7 fps** 嗰陣度身訂造嘅（6 秒直路先夠時間加速完）。
    // ADR-186 之後同一版跑 **4.2 fps**，即係同一段真實秒數入面遊戲行多 2.5 倍
    // ——玩家捱多咗 2.5 倍打，跑到最後一段先撳攻擊嗰陣已經死咗，`踏前實速`
    // 讀到 0。**腳本嘅單位係真實秒，佢驅動嘅嘢行郁動時間**，改咗比例就要跟。
    // 出手放喺前面係刻意嘅：跑步測試需要幾秒，軟件光柵化下雜兵會喺後段
    // 合圍；如果先跑後斬，測試量到嘅係一具屍體，`踏前實速` 會假性變成 0。
    for (let i = 0; i < 4; i += 1) { await p4.keyboard.press('KeyJ'); await p4.waitForTimeout(700); }
    await p4.keyboard.down('KeyW'); await p4.waitForTimeout(2600); await p4.keyboard.up('KeyW');
    await p4.waitForTimeout(400);
    for (let i = 0; i < 2; i += 1) {
        await p4.keyboard.down('KeyW'); await p4.waitForTimeout(600);
        await p4.keyboard.up('KeyW'); await p4.keyboard.down('KeyS'); await p4.waitForTimeout(600);
        await p4.keyboard.up('KeyS'); await p4.waitForTimeout(300);
        await p4.keyboard.down('KeyA'); await p4.waitForTimeout(420); await p4.keyboard.up('KeyA');
        await p4.waitForTimeout(280);
    }
    const m = await p4.evaluate(() => window.__ER2.動作());
    const 上限 = await p4.evaluate(() => window.__ER2.郁動上限());
    const 敵 = await p4.evaluate(() => window.__ER2.敵動作());
    await p4.close();
    check('轉身唔可以一 tick 完成（有角速度上限）',
        m != null && m.最快轉向 > 0 && m.最快轉向 <= 上限.轉向 * 1.05,
        { 量到: m.最快轉向, 上限: 上限.轉向, 度每秒: Math.round(m.最快轉向 * 180 / Math.PI) });
    // 量到嘅係 |Δv|，即係起步同煞停兩樣都會計入去，所以條線係兩個上限入面
    // 大嗰個（煞停特登快過起步，否則放手之後會溜冰）。第一版淨係對住起步嗰
    // 個，一放手就報 95 對 70——**支尺分唔開自己要守嗰兩件事**。
    const 上限兩者 = Math.max(上限.加速, 上限.減速);
    check('起步同煞停都唔可以一 tick 完成（有加減速上限）',
        m != null && m.最快加速 > 0 && m.最快加速 <= 上限兩者 * 1.05,
        { 量到: m.最快加速, 起步上限: 上限.加速, 煞停上限: 上限.減速 });

    // **六十二條 gate 冇一條量過最高速度。** ADR-176 加咗加速斜坡之後，我讀
    // 「而家幾快」係由 body 讀返嚟嘅——而每一幀開頭都有 `velocity.x = 0`，
    // 所以條斜坡每幀由零重新開始，玩家實測**平均 0.09 米／秒**（設計 12.5），
    // 而所有 gate 照樣全綠：佢哋量嘅係**變化率**，冇一條量過**個值**。
    check('玩家去得返自己職業卡寫嗰個速度（唔係淨係加速度啱）',
        m != null && m.最高速 >= m.設計速 * 0.98,
        { 最高速: m.最高速, 設計速: m.設計速 });

    // 身體行緊嘅方向，要就係個模型面住嘅方向。
    //
    // 未修之前，位移用「想去嗰個方向」而朝向係另一條有上限嘅線——兩條線分
    // 開，身體就滑向一個佢完全冇面住嘅方向。實測**玩家側滑 2.0 弧度（115
    // 度）**：撳 A 個人面住北、身體向西全速平移，而跑步動畫照樣向前踩。雜兵
    // 係 0.43 弧度。而家兩邊都行 `gaitStep`：先轉身，再沿住面向行。
    check('身體行嘅方向就係個模型面嘅方向（唔會側住身平移）',
        m != null && m.側滑 <= 0.02 && 敵 != null && 敵.最快側滑 <= 0.02,
        { 玩家側滑: m.側滑, 雜兵側滑: 敵 && 敵.最快側滑 });

    // 「條斜坡用唔用到時間」呢條問題**唔喺呢度守**。試過寫喺度：把 ACCEL
    // 揼返做 70（原本個爛值）之後，瀏覽器度量到 0.3 秒對 0.5 秒——條線又要
    // 揀喺噪音中間。原因係喺真遊戲入面「起步」同「轉身」分唔開（入彎要收
    // 力），兩件事撈埋一齊量。`motion.test.mjs` 嗰條純函數 test 問同一件事
    // 但冇呢個混淆：同一個突變，佢讀到 **0.067 秒**，紅得斬釘截鐵。
    //
    // 而 `郁動上限` 呢條 gate 亦都答唔到「個常數本身合唔合理」——佢同遊戲
    // 自己個常數比，改咗常數兩邊一齊郁。人形尺度嗰條線寫喺 Node 嗰邊。

    // 一刀落去要有踏前。實測未加之前，**企定同跑住出手位移都係 0.00 米**：
    // 把刀好似個轉盤咁掃過，隻腳釘死喺地下。距離要由招式決定，唔係由你出手
    // 嗰刻啱好跑緊幾快決定，所以兩種情況嘅位移應該差唔多。
    check('出手有踏前，而且踏前距離由招式決定（唔係由你當時幾快決定）',
        m != null && m.踏前實速 > 0 && Math.abs(m.踏前實速 - 上限.踏前) < 0.1,
        { 踏前實速: m.踏前實速, 招式踏前速: 上限.踏前 });
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
        const p2 = await browser.newPage({ viewport: 快版 });
        const e2 = [];
        p2.on('pageerror', (e) => e2.push(e.message.split('\n')[0].slice(0, 90)));
        p2.on('console', (m) => { if (m.type() === 'error') e2.push('console: ' + m.text().slice(0, 90)); });
        await p2.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
        await p2.waitForTimeout(1500);
        await 入場(p2, 職);
        const sw = await p2.evaluate(() => window.__ER2 && window.__ER2.swing());
        const 前 = await p2.evaluate(() =>
            +document.querySelector('[data-enemies-remaining]').dataset.enemiesRemaining);
        await p2.evaluate(() => window.__ER2.重置動作量度());
        // 目標要真係郁，先可以分辨「箭追住活目標」同「箭射向出手嗰刻嘅
        // 靜態座標」。一路橫移一路射係正常玩家操作，亦比企定等敵人埋身穩定：
        // 目標會持續追擊，飛行窗口內一定有可量嘅位移；傷害 gate 仍然照守。
        await p2.keyboard.down('KeyD');
        for (let i = 0; i < 26; i++) { await p2.keyboard.press('KeyF'); await p2.waitForTimeout(700); }
        await p2.keyboard.up('KeyD');
        const 後 = await p2.evaluate(() => ({
            關: document.querySelector('[data-encounter]').dataset.encounter,
            狀態: document.querySelector('[data-game-status]').dataset.gameStatus,
            剩: +document.querySelector('[data-enemies-remaining]').dataset.enemiesRemaining,
        }));
        const 瞄 = await p2.evaluate(() => window.__ER2.瞄準());
        check(`${職}：載得入、零 error`, e2.length === 0, e2.slice(0, 2));
        check(`${職}：弧線幾何跟返自己嗰個射程（唔係抄近戰嗰個）`,
            sw != null && sw.判.射程 === 射程 && sw.畫.半徑 > 射程 * 0.6 && sw.畫.半徑 <= 射程,
            sw && { 判射程: sw.判.射程, 畫半徑: +sw.畫.半徑.toFixed(2) });
        // 「推得郁」本來寫住 `關 !== 'wave-1' || 狀態 !== 'playing'`——而**打死
        // 咗**同**畀人打死**兩樣都令狀態唔再係 'playing'。即係企喺度企到死，
        // 呢條 gate 一樣綠。
        //
        // 改成「敵人數少咗」之後仲有第二個問題：**條線細過佢要守嗰件事**。
        // 呢個環境一秒三幀，26 下撳掣得四下真係到落點，四下 × 約 17 點傷害
        // ＝ 68，而兩隻雜兵共 70 血——同一份程式碼跑兩次，一次 1 一次 2。
        // 所以主問題改成量**打出咗幾多傷害**（連續量、冇門檻夾喺噪音入面），
        // 敵人數同關卡照留做次要訊號。
        check(`${職}：打得中嘢（真係有傷害入到帳）`,
            後.狀態 !== 'defeat' && 瞄 != null && 瞄.打出傷害 >= 45,
            { 打出傷害: 瞄 && 瞄.打出傷害, 落點: 瞄 && 瞄.落點, 開場敵人: 前, 之後: 後 });

        // 支箭停喺邊，就要係目標喺邊。實測舊寫法：出手嗰刻抄低一個定點，而
        // 目標喺 0.43 秒飛行時間入面行得郁——**支箭插咗喺離佢 1.8 米嘅空地
        // 上面，佢照樣扣血**。`箭落差` 量嘅係目標飛行期間行咗幾遠（同修法
        // 無關，永遠 > 0），`箭到位` 量嘅係畫出嚟嗰支箭最後同佢差幾多。
        check(`${職}：支箭停喺目標度，唔係停喺佢頭先企嗰度`,
            瞄 != null && 瞄.箭到位.length >= 3 &&
            Math.max(...瞄.箭落差) >= 0.5 &&
            瞄.箭到位.every((d) => d <= 0.2),
            瞄 && { 箭落差: 瞄.箭落差, 箭到位: 瞄.箭到位 });
        await p2.close();
    }
}

// ---------- 唔鎖定嗰陣，出手會唔會轉入去 ----------
//
// 出手轉向本來寫住 `if (locked && …)`。而 `locked` 開波係 true，所以上面每
// 一條 gate 都行喺鎖定狀態——**條件入面嗰個 `locked` 從來冇被試過係 false**。
// 我第一版把尺就係咁：喺鎖定嘅頁度量朝向，剷走個 `locked &&` 個數一模一樣，
// 綠得毫無意義。
//
// 撳 Q 解鎖之後量到嘅先係真嘢：**落點嗰刻，朝向同目標仲差 0.43／0.39／0.17／
// 0.46 弧度（最多 26 度）**，同出手嗰刻嘅偏差一個字都冇變——即係成個前搖
// 完全冇轉過身，側住身射箭。鎖定應該係改「你仲有幾多修正空間」，唔係改
// 「你使唔使望住你打緊嗰個」。
{
    const p5 = await browser.newPage({ viewport: 快版 });
    await p5.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await p5.waitForTimeout(1500);
    await 入場(p5, 'WAYFARER');
    await p5.keyboard.press('KeyQ');          // 解鎖
    await p5.waitForTimeout(600);
    const 鎖 = await p5.evaluate(() => document.querySelector('[data-target-locked]')?.dataset.targetLocked);
    await p5.evaluate(() => window.__ER2.重置動作量度());
    // 量轉向唔需要玩家移位；如果企定期間自然死亡，就用畫面上嘅 R 重開，
    // 累積夠三個落點再判斷。咁樣唔會將「走遠咗令目標喺身後」誤報成鎖定
    // 轉向失效，亦唔會因為一局死亡令樣本數跌到一個。
    for (let i = 0; i < 16; i++) {
        if (await p5.evaluate(() => document.querySelector('[data-game-status]')?.dataset.gameStatus !== 'playing')) {
            await p5.keyboard.press('KeyR');
            await p5.waitForTimeout(2500);
        }
        await p5.keyboard.press('KeyF');
        await p5.waitForTimeout(700);
    }
    const 解 = await p5.evaluate(() => window.__ER2.瞄準());
    check('解咗鎖之後，把尺真係量緊未鎖定嘅狀態', 鎖 === 'false', { targetLocked: 鎖 });
    check('冇鎖定都會轉入去出手（唔會側住身射箭）',
        鎖 === 'false' && 解 != null && 解.落點偏差.length >= 3 &&
        Math.max(...解.偏差) >= 0.15 &&
        解.落點偏差.every((d) => d <= 0.12),
        解 && { 出手偏差: 解.偏差, 落點偏差: 解.落點偏差 });
    await p5.close();
}

// ---------- 打擊碎屑 ----------
//
// 三樣量到嘅嘢，全部都係「呢個特效根本唔知自己代表緊乜」：
//
// 1. 全場得**一組** `THREE.Points`。0.55 秒未散完又有第二下打擊，頭嗰蓬就成
//    蓬瞬移去新位置——實測真打鬥入面 **七次有兩次（29%）**被搶。
// 2. 噴濺同打擊方向完全冇關係：兩條水平軸等向亂數，平均橫向 0.09–0.58（噪音
//    水平），而垂直係 `rand × 4.2`——**永遠 ≥ 0**，42 粒有 39–42 粒向上。
//    即係無論邊個方向斬落去，出嚟都係同一個噴泉。
// 3. 碎屑重力寫住 5，唔係 9.81——半空慢動作。
{
    const p7 = await browser.newPage({ viewport: 快版 });
    await p7.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await p7.waitForTimeout(1500);
    await 入場(p7);
    // 先等出生／開門嗰啲無方向特效散走；之後只收集每一下 KeyJ 之後新出嗰蓬。
    // 唔可以將聖所回血、敵人出生嗰啲刻意無方向嘅碎屑混入「背住打擊方向噴」
    // 呢條 gate，否則測試量緊嘅就唔係同一類特效。
    await p7.waitForTimeout(1200);
    const 樣本 = [];
    for (let i = 0; i < 16; i += 1) {
        const 之前 = await p7.evaluate(() => window.__ER2.打擊().次數);
        await p7.keyboard.press('KeyJ');
        let f = null;
        for (let k = 0; k < 8; k += 1) {
            await p7.waitForTimeout(220);
            f = await p7.evaluate(() => window.__ER2.打擊());
            if (f.次數 > 之前) break;
        }
        if (f && f.次數 > 之前 && f.命 > 0.2) 樣本.push(f);
    }
    const fx = await p7.evaluate(() => window.__ER2.打擊());
    // 重力：兩次抽樣之間 vy 跌咗幾多 ÷ 郁動秒。量嘅係**積分本身**，唔係讀個
    // 常數返嚟同自己比。
    let 重力 = null;
    for (let i = 0; i < 16 && 重力 === null; i += 1) {
        // 死咗就冇碎屑可以量（ADR-186 加速咗之後，同一段腳本玩家捱多咗打）。
        if (await p7.evaluate(() => document.querySelector('[data-game-status]').dataset.gameStatus !== 'playing')) {
            await p7.keyboard.press('KeyR');
            await p7.waitForTimeout(2500);
        }
        // **等到真係有碎屑先量。** 呢度本來撳完 KeyJ 就固定等 250 毫秒——但落點
        // 喺 0.27 **郁動**秒之後，即係一秒四幀之下大約 1.1 真實秒，兩次抽樣都
        // 落喺落點之前，所以永遠讀到 `null`。同一個窿今個 session 已經撞到第
        // 三次：**用真實毫秒去等一件行郁動時間嘅事**。
        await p7.keyboard.press('KeyJ');
        let a1 = null;
        for (let k = 0; k < 12; k += 1) {
            await p7.waitForTimeout(220);
            a1 = await p7.evaluate(() => ({ t: window.__ER2.clock().motion, f: window.__ER2.打擊() }));
            if (a1.f.命 > 0.3) break;
        }
        if (!a1 || a1.f.命 <= 0.3) continue;
        await p7.waitForTimeout(300);
        const a2 = await p7.evaluate(() => ({ t: window.__ER2.clock().motion, f: window.__ER2.打擊() }));
        // `打擊()` 會揀池入面命最長嗰蓬；如果兩次抽樣之間另一一下打擊
        // 換咗命最長嗰蓬，直接用兩蓬嘅 vy 相減會量到隨機初速度，而唔係重力。
        // 次數相同先代表仍然係同一蓬碎屑。
        if (a2.f.次數 === a1.f.次數 && a2.f.命 > 0 && a2.f.命 < a1.f.命 && a2.t > a1.t) {
            重力 = (a1.f.粒[0].vy - a2.f.粒[0].vy) / (a2.t - a1.t);
        }
    }
    await p7.close();

    check('打擊碎屑唔會畀下一下打擊搶走（一個池，唔係一個）',
        fx != null && fx.次數 >= 4 && fx.被搶 === 0 && fx.池 >= 3,
        fx && { 出過幾多蓬: fx.次數, 被搶: fx.被搶, 池: fx.池 });

    // 「集中度」＝ 42 粒嘅平均速度向量嘅水平長度 ÷ 平均速率。等向亂數會近零，
    // 一個真濺射錐會近一。實測未修 0.09–0.58 ÷ 速率 ≈ 0.05–0.15，修完 0.83–0.91。
    const 集中 = 樣本.map((f) => {
        const mx = f.粒.reduce((s, q) => s + q.vx, 0) / f.粒.length;
        const mz = f.粒.reduce((s, q) => s + q.vz, 0) / f.粒.length;
        const 平均速率 = f.粒.reduce((s, q) => s + Math.hypot(q.vx, q.vy, q.vz), 0) / f.粒.length;
        return 平均速率 > 0 ? +(Math.hypot(mx, mz) / 平均速率).toFixed(2) : 0;
    });
    check('碎屑背住打嚟嗰個方向噴，唔係四面八方嘅噴泉',
        集中.length >= 3 && 集中.every((c) => c >= 0.45),
        { 集中度: 集中.slice(0, 6) });

    check('碎屑跌落嚟嘅係真重力（唔係半速慢動作）',
        重力 !== null && 重力 > 9.0 && 重力 < 10.6,
        { 量到: 重力 === null ? null : +重力.toFixed(2), 真值: 9.81 });
}

// ---------- 死一次唔應該將成條路清零 ----------
//
// 實測未修之前：清咗第一波、死喺第二波、撳 R——**返返去 wave-1**。你已經行
// 完嗰段要由頭再行過，而個場入面明明有 checkpoint（賜福）。Soulslike 嘅慣例
// 係「敵人重置、世界進度唔重置」。
//
// 用 `__ER2.推關()` 推去指定嗰關：佢**唔重寫任何嘢**，叫嘅就係遊戲自己嗰兩個
// 轉換函數（`activateWave` / `unlockBossEncounter`），同 `zoomBy` 一樣。冇佢
// 就到唔到 boss 場——清三波雜兵喺一秒三幀嘅環境要幾分鐘，而「死喺 boss 手上
// 再重開」正正就係一條從來冇測試行過嘅路。
for (const [名, 推幾次, 想要] of [['第二波', 1, 1], ['boss 場', 3, 3]]) {
    const p8 = await browser.newPage({ viewport: 快版 });
    await p8.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await p8.waitForTimeout(1500);
    await 入場(p8);
    for (let i = 0; i < 推幾次; i += 1) {
        await p8.evaluate(() => window.__ER2.推關());
        await p8.waitForTimeout(700);
    }
    const 死前 = await p8.evaluate(() => window.__ER2.關());
    // 行埋去先。
    //
    // 本來淨係企喺出生點等死——而**當時真兇係八隻雜兵**：`推關()` 冇清佢哋，
    // 所以呢條 gate 一直靠一堆唔應該存在嘅雜兵打死玩家先綠。`推關()` 修好之
    // 後，boss 場淨返 boss 一隻，而佢喺六十米外，行過嚟就用十幾郁動秒——條
    // gate 即刻 timeout。行埋去就唔使等佢行過嚟。
    if (想要 === 3) {
        // 淨係 boss 場先需要行埋去：boss 喺六十米外，等佢行過嚟要十幾郁動秒。
        // 第二波嗰啲雜兵就喺隔籬，行反而係製造距離。
        await p8.keyboard.down('KeyW');
        await p8.waitForTimeout(20000);
        await p8.keyboard.up('KeyW');
    }
    let 死咗 = false;
    for (let i = 0; i < 60 && !死咗; i += 1) {
        await p8.waitForTimeout(1500);
        死咗 = await p8.evaluate(() =>
            document.querySelector('[data-game-status]').dataset.gameStatus !== 'playing');
    }
    await p8.keyboard.press('KeyR');
    await p8.waitForTimeout(3000);
    const 重開 = await p8.evaluate(() => window.__ER2.關());
    const 狀態 = await p8.evaluate(() => ({
        關: document.querySelector('[data-encounter]').dataset.encounter,
        狀態: document.querySelector('[data-game-status]').dataset.gameStatus,
    }));
    await p8.close();

    check(`死喺${名}，重開返嗰一關（唔係由第一波再嚟）`,
        死咗 && 重開.關 === 想要 && 狀態.狀態 === 'playing',
        { 死前: 死前.關, 死到: 死咗, 重開: 重開.關, 想要, 狀態 });

    // 霧門畫出嚟同攔唔攔要一致。修呢一輪嗰陣我自己整過呢個缺陷出嚟：重開set
    // 返 `gateFade = 1`，而下一幀嘅淡出段會將 `visible` 覆蓋返 true——即係喺
    // boss 場中間憑空淡出一道**望得見但行得穿**嘅牆。
    check(`死喺${名}重開之後，霧門「畫幾多道」同「攔幾多道」對得上`,
        重開.霧門 === 重開.霧門畫,
        { collider: 重開.霧門, 畫: 重開.霧門畫, boss開咗: 重開.boss開咗 });
}

// ---------- Boss 打唔打得成一場仗 ----------
//
// 第二階段從來冇喺真遊戲入面量過。用 `推關()` 去到 boss 場（佢會用遊戲自己
// 條死亡路徑清晒雜兵，唔會整出一個「boss 開咗但八隻雜兵仲追緊你」嘅唔存在
// 狀態），跟住用射手真打一場。量到兩件事：
//
// 1. **撲擊喺遊戲入面永遠揀唔到。** `chooseBossMove` 要 `distance > 6.5` 先揀
//    撲擊，而個 caller 喺 `else if (bossDistance > BOSS_REACH)` 之後——即係只有
//    距離 ≤ 3.15 先入到去。3.15 < 6.5。個純函數自己有 gate 而且係綠嘅，因為
//    條 gate 直接餵一啲遊戲從來唔會餵嘅距離入去（同 ADR-179 個 `locked` 一樣）。
//    而且**boss 換第二階段嗰刻距離係 6.0 米**，仲細過 6.5——就算通咗個 caller，
//    「第二階段先有嘅招」都等唔到自己嘅距離。
// 2. **每一下命中都取消緊 boss 出緊嗰招。** 實測射手打到 boss 剩 17 血：
//    **出手 1 次、到落點 0 次**——佢由六十米外行過嚟、換咗階段、跌到剩一成幾
//    血，一拳都未打出過。個預警圈變咗裝飾。
{
    const p9 = await browser.newPage({ viewport: 快版 });
    await p9.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await p9.waitForTimeout(1500);
    await 入場(p9, 'WAYFARER');
    for (let i = 0; i < 3; i += 1) {
        await p9.evaluate(() => window.__ER2.推關());
        await p9.waitForTimeout(700);
    }
    let b = null;
    for (let i = 0; i < 110; i += 1) {
        await p9.keyboard.press('KeyF');
        if (i % 3 === 0) await p9.keyboard.press('Space');
        await p9.waitForTimeout(450);
        b = await p9.evaluate(() => window.__ER2.boss());
        const st = await p9.evaluate(() =>
            document.querySelector('[data-game-status]').dataset.gameStatus);
        if (st !== 'playing' || b.hp <= 0) break;
    }
    await p9.close();

    check('Boss 出得到手，而且出咗嘅招唔會畀人打斷（有霸體）',
        b != null && b.出手數 >= 2 && b.落點數 >= b.出手數 - 1,
        b && { 出手數: b.出手數, 落點數: b.落點數, 打中數: b.打中數,
               打出傷害: b.打出傷害, hp: b.hp, 階段: b.階段 });

    check('撲擊喺真遊戲入面出得到（唔係一個永遠揀唔到嘅分支）',
        b != null && b.撲擊數 >= 1,
        b && { 撲擊數: b.撲擊數, 出手數: b.出手數, 階段: b.階段 });

    // `nextAttack = now + 1.55`（第二階段最短嗰個）係一個**數學下限**：下一下
    // 前搖唔可能早過佢。所以呢條唔係我揀出嚟嘅門檻。時鐘一改返做真實時間
    // （ADR-150 嗰個缺陷），換算返郁動秒就會塌落 0.3 左右。
    const 最短 = b && b.間隔.length ? Math.min(...b.間隔) : null;
    check('Boss 兩下出手之間，至少隔住佢自己寫嗰個 1.55 郁動秒',
        最短 !== null && 最短 >= 1.54,
        { 最短, 全部: b && b.間隔.slice(0, 6) });
}

// ---------- 畫面抖動 ----------
//
// Penny 報「畫面一直抖動」。ADR-177 果次我用截圖查，喺一秒三幀嘅環境重現唔
// 到——420 毫秒抽一張相去追一個逐幀嘅現象，注定睇唔到。今次用逐幀嘅尺。
//
// **企定出戰鬥其實係穩定嘅**（鏡頭逐幀郁 0.012 米中位）。而我第一個嚇人嘅
// 數字「`allowed` 一幀跳 8.2 米」係**我支尺自己嘅 bug**：reset 冇清上一幀嘅
// 值，第一幀攞 8.4 同 0 比。兩個真嘢係：
{
    // 1. **renderer 同 composer 用緊兩個唔同嘅像素比**（1.8 對 1.55）。
    //    dpr ≤ 1.55 兩個夾出嚟一樣，所以**喺預設嗰版必然睇唔到**——條 gate
    //    一定要喺 dpr > 1.55 度跑，否則佢會喺缺陷仲喺度嗰陣照樣綠（實測：
    //    dsf 1 讀到 1 對 1，dsf 2 讀到 1.8 對 1.55）。高 dpr 之下成幅畫喺
    //    1.55 度算完再貼落 1.8 嘅畫布，即係**逐幀一次非整數重採樣**，而個鏡頭
    //    永遠跟住玩家郁——邊緣就會逐幀爬。電話同 retina 先中招。
    const 高清 = await browser.newContext({
        viewport: 快版, deviceScaleFactor: 3 });
    const pA = await 高清.newPage();
    await pA.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await pA.waitForTimeout(1500);
    await 入場(pA, 'OATHBOUND', 3500);
    const 比 = await pA.evaluate(() => window.__ER2.像素比());
    await 高清.close();
    check('高 dpr 之下，算圖同出圖用同一個像素比（唔會逐幀重採樣）',
        比 != null && 比.dpr > 1.55 && 比.renderer === 比.composer,
        比);

    // 2. **震動係加落 `camera.position`，而嗰個位置就係 lerp 自己個狀態**——
    //    一下震會寫咗入狀態，之後每幀只散走 lerp 嗰個比例，下一下震又加多
    //    一層。喺一個目標完全唔郁嘅場景度連續震：修之前平滑狀態**永遠收唔
    //    到**（喺 0.03–0.16 米之間遊走），修完收斂到 0.004。打交期間震動一直
    //    喺度出，即係鏡頭有個持續嘅擺動。
    const pB = await browser.newPage({ viewport: 快版 });
    await pB.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await pB.waitForTimeout(1500);
    await 入場(pB);
    // 推去 boss 場：雜兵死晒，而 boss 喺六十米外行緊——呢十幾秒冇人打得到
    // 玩家，即係鏡頭目標唔會郁，量到嘅漂移淨係得震動一個成因。
    for (let i = 0; i < 3; i += 1) {
        await pB.evaluate(() => window.__ER2.推關());
        await pB.waitForTimeout(700);
    }
    await pB.evaluate(() => window.__ER2.量鏡開());
    for (let i = 0; i < 24; i += 1) {
        await pB.evaluate(() => window.__ER2.震一下(0.24));
        await pB.waitForTimeout(500);
    }
    const 鏡 = await pB.evaluate(() => window.__ER2.鏡());
    await pB.close();
    const 目標定住 = 鏡 != null && new Set(鏡.allowed序列).size <= 2;
    // 條不變量係**收唔收斂**，唔係「低過某個數」。
    //
    // 第一版寫「尾段中位 < 0.02」，就係攞住一次量到嘅 0.004 拍個數出嚟——跟住
    // 有一次讀到 0.025，而嗰條尾段係 0.028 → 0.016，**明明就係喺度收斂**。
    // 突變嗰個（震動寫返入狀態）嘅特徵唔係「數值大」，係**永遠唔收**：喺
    // 0.03–0.16 之間遊走，升完又跌。所以問「尾段有冇一路細落去」。
    const 尾 = 鏡 ? 鏡.離目標序列.slice(-6) : [];
    // 「一路細落去」就係收斂，而**收到盡就係零**——第一版寫「尾項要細過首項
    // 嘅 0.75 倍」，跟住讀到尾段 `[0,0,0,0,0,0]`：系統收得太乾淨，條 gate 反而
    // 判紅。所以「已經到零」同「仲喺度細落去」兩樣都算收斂。
    // 突變（震動寫返入狀態）嘅特徵係**上上落落**（0.028 → 0.069 → 0.076 →
    // 0.043），單調嗰一項就已經捉到佢。
    const 收斂 = 尾.length === 6
        && 尾.every((v, i) => i === 0 || v <= 尾[i - 1] + 1e-9)
        && (尾[5] === 0 || 尾[5] <= 尾[0] * 0.75);
    check('震完鏡頭收得返自己個位（震動唔可以寫入平滑狀態）',
        目標定住 && 收斂,
        鏡 && { 尾段: 尾, 收斂, 目標定住, allowed: 鏡.allowed序列.slice(-3) });
}

// ---------- 場內回復 ----------
//
// 算術：出手 17 體力、0.66 秒，而**出手期間唔回氣**（28/秒）——持續節奏大約
// 一下／1.26 秒 ＝ **11.9 dps**；第二波三隻雜兵每隻 13 傷害／約 1.6 秒 ＝
// **24.4 dps**。就算拉開逐隻打，殺一隻要 2.9 秒、捱 23 血：第一波 47 ＋ 第二
// 波 70 ＝ **117 傷害，而你得 100 血**。即係**行唔完頭兩波**，更加見唔到 boss。
// 而個場**冇任何回復手段**：賜福得兩個固定點，打緊交行唔返去（bot 四次全部
// 死喺路上，一次都冇成功返過賜福）。
//
// 賜福已經係篝火，欠嗰半就係藥瓶。呢度守嘅係佢真係做到嗰三件事：回到血、
// 有上限、而且**要畀代價**（飲嘅時候出唔到手）。
{
    const pC = await browser.newPage({ viewport: 快版 });
    await pC.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await pC.waitForTimeout(1500);
    await 入場(pC);
    // 企定捱打到跌穿一半血。
    let 傷 = null;
    for (let i = 0; i < 30 && (傷 === null || 傷.血 > 55); i += 1) {
        await pC.waitForTimeout(1500);
        傷 = await pC.evaluate(() => window.__ER2.局面());
        if (傷.狀態 !== 'playing') break;
    }
    const 飲前 = 傷;
    // 輸入有 0.45 秒緩衝（打緊交撳 E 好可能啱好喺捱打嗰一幀），所以飲落去嘅
    // 時機唔係固定嘅——**等佢真係入咗 `drink` 狀態先量**，唔好等一個死時間。
    await pC.keyboard.press('KeyE');
    let 飲中 = null;
    for (let i = 0; i < 10; i += 1) {
        await pC.waitForTimeout(200);
        飲中 = await pC.evaluate(() => window.__ER2.局面());
        if (飲中.態 === 'drink') break;
    }
    // 飲緊嗰陣撳攻擊——唔應該出到手。
    const 出手前 = await pC.evaluate(() => window.__ER2.瞄準().發招);
    await pC.keyboard.press('KeyF');
    await pC.waitForTimeout(250);
    const 出手後 = await pC.evaluate(() => window.__ER2.瞄準().發招);
    await pC.waitForTimeout(1500);
    // 飲到冇為止。
    for (let i = 0; i < 6; i += 1) { await pC.keyboard.press('KeyE'); await pC.waitForTimeout(1400); }
    const 飲完 = await pC.evaluate(() => window.__ER2.局面());
    await pC.close();

    check('企定捱打真係會跌穿一半血（呢條係下面嗰啲嘅前提）',
        飲前 != null && 飲前.血 <= 55 && 飲前.狀態 === 'playing',
        飲前 && { 血: 飲前.血, 藥: 飲前.藥, 狀態: 飲前.狀態 });
    check('飲藥回到血，而且用咗一支',
        飲前 != null && 飲中 != null && 飲中.血 > 飲前.血 && 飲中.藥 === 飲前.藥 - 1,
        { 飲前: 飲前 && [飲前.血, 飲前.藥], 飲後: 飲中 && [飲中.血, 飲中.藥] });
    // 代價要係真嘅：飲嘅時候定身兼出唔到手。冇呢一下，藥瓶就係「白食」。
    check('飲緊藥出唔到手（呢個定身窗口就係代價）',
        飲中 != null && 飲中.態 === 'drink' && 出手後 === 出手前,
        { 態: 飲中 && 飲中.態, 發招: [出手前, 出手後] });
    check('藥瓶有數量上限（唔係無限回血）',
        飲完 != null && 飲完.藥 === 0,
        飲完 && { 剩低: 飲完.藥, 血: 飲完.血 });
}

// ---------- 行得開先至有得回復 ----------
//
// ADR-187 加咗藥瓶，但**實測 bot 兩局想拉開 21 次、成功 0 次、三支藥一支都飲
// 唔到**——因為舊嘅雜兵速度係 `[3.6, 4.1, 4.4]` 對玩家 4.4：**第三波同你一模
// 一樣快，仲快過 wizard 嘅 4.2**。行路每秒只賺 0.3 米，開 7 米要 23 秒。唯一
// 拉得開嘅係衝刺，而衝刺食 13/秒**兼且封鎖 28/秒回氣**——拉開嘅工具食緊你拉開
// 想回復嗰樣嘢。
//
// 條 gate 問返**遊戲自己兩個數之間嘅關係**，唔係我拍個門檻出嚟：每一波都要慢
// 過玩家行路，快慢差要夠開到一個飲藥窗口。
{
    const pD = await browser.newPage({ viewport: 快版 });
    await pD.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await pD.waitForTimeout(1500);
    await 入場(pD);
    const 速 = await pD.evaluate(() => ({
        雜兵: window.__ER2.敵動作().設計速,
        玩家: window.__ER2.動作().設計速,
    }));
    await pD.close();
    // 三波都要慢過玩家。差幅 ≥ 0.6 米／秒即係開 7 米最多十二秒——慢，但係做得到。
    const 差 = 速 && 速.雜兵.map((v) => +(速.玩家 - v).toFixed(2));
    check('每一波雜兵都慢過玩家行路（唔係就冇「行開啲」呢個動作）',
        速 != null && 差.every((d) => d >= 0.6),
        { 玩家: 速 && 速.玩家, 雜兵: 速 && 速.雜兵, 每秒賺: 差 });
}

// ---------- 貼身打唔打得中 ----------
//
// 逐下斬記錄嘅時候揾到：**4.2 米中、2.4 米中，但 1.6／1.8／1.8 米全部空**——
// 近距離斬空、遠距離先中，反轉咗。成因係前搖嗰 0.27 秒踏前推咗你向前約
// 0.86 米，而隻雜兵同時埋身 0.86 米：**你衝過咗頭，佢跌咗去你身後**，而落點
// 判定要求佢喺你前面。玩家實際輸出跌到 **0.4 dps**（設計 11.9）。踏前而家唔
// 准衝穿接觸面——同一段量度：**打出傷害 30 → 128**。
//
// 呢條 gate 唔靠 bot 打得好唔好：企到貼身、面向佢、斬一刀，要有傷害入帳。
{
    const pE = await browser.newPage({ viewport: 快版 });
    await pE.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await pE.waitForTimeout(1500);
    await 入場(pE);
    // 企定等佢哋埋身（雜兵會自己行埋嚟）。
    let 局 = null;
    for (let i = 0; i < 25; i += 1) {
        await pE.waitForTimeout(1200);
        局 = await pE.evaluate(() => window.__ER2.局面());
        if (局.狀態 !== 'playing') break;
        const d = Math.min(...局.兵.map((m) => Math.hypot(m.x - 局.我[0], m.z - 局.我[1])), 999);
        if (d < 1.9) break;
    }
    const 貼身距 = 局 && 局.兵.length
        ? +Math.min(...局.兵.map((m) => Math.hypot(m.x - 局.我[0], m.z - 局.我[1]))).toFixed(2)
        : null;
    // 斬三刀。中間唔郁——郁咗就唔係「貼身」呢個情況。
    const 前 = (await pE.evaluate(() => window.__ER2.瞄準())).打出傷害;
    for (let i = 0; i < 3; i += 1) { await pE.keyboard.press('KeyF'); await pE.waitForTimeout(900); }
    const 後 = await pE.evaluate(() => window.__ER2.瞄準());
    await pE.close();
    check('貼身斬得中（踏前唔准衝過個目標）',
        貼身距 !== null && 貼身距 < 2.0 && 後.打出傷害 > 前,
        { 貼身距, 傷害: [前, 後.打出傷害], 落點: 後.落點 });
}

// ---------- 個核心循環贏唔贏得到 ----------
//
// 「產品級」最尾嗰條問題唔係「bot 通唔通到關」——嗰個量嘅係 bot。係**企定同
// 佢對砍，你贏定輸**：呢個係隻遊戲最基本嗰個交換，唔靠任何走位技巧。
//
// 修之前贏唔到：出手 17 體力而**成個 0.66 秒動畫都唔回氣**（落點喺 0.27 秒，
// 後面 0.39 秒收招期一樣封鎖），持續輸出得 **11.9 dps**；再加上踏前會**衝過個
// 目標**令貼身斬空（ADR-189），實際輸出跌到 **0.4 dps**。而家回氣只喺前搖
// （你取消唔到嗰段）封鎖。
//
// 條 gate 只按攻擊鍵——唔碌、唔走、唔飲藥。
{
    const pF = await browser.newPage({ viewport: 快版 });
    await pF.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
    await pF.waitForTimeout(1500);
    await 入場(pF);
    const 睇 = () => pF.evaluate(() => ({
        g: window.__ER2.局面(), a: window.__ER2.瞄準(), t: window.__ER2.clock().motion }));
    // 等佢哋自己行埋嚟。
    let s = await 睇();
    for (let i = 0; i < 25 && s.g.狀態 === 'playing'; i += 1) {
        const d = Math.min(...s.g.兵.map((m) => Math.hypot(m.x - s.g.我[0], m.z - s.g.我[1])), 999);
        if (d < 2.5) break;
        await pF.waitForTimeout(1200);
        s = await 睇();
    }
    const 開 = s;
    for (let i = 0; i < 90; i += 1) {
        const c = await 睇();
        if (c.g.狀態 !== 'playing' || c.t - 開.t >= 13) break;
        await pF.keyboard.press('KeyF');
        await pF.waitForTimeout(400);
    }
    const 收 = await 睇();
    await pF.close();
    const 郁 = 收.t - 開.t;
    const 出 = 收.a.打出傷害 - 開.a.打出傷害;
    const 入 = 開.g.血 - 收.g.血;
    // 唔要求收場仲生存：個政策係**淨係撳攻擊**——唔碌、唔走、唔飲藥、清完
    // 第一波照樣企喺第二波三隻中間。連呢個都清得到一波兼且贏個交換，即係加返
    // 走位同三支藥之後，個循環一定贏得到。（實測 100 血用嚟清第一波＋開第二
    // 波，交換率 1.33。）
    check('企定淨係撳攻擊，都清得到一波兼且贏個交換（核心循環要贏得到）',
        郁 >= 8 && 收.g.關 > 開.g.關 && 出 > 入,
        { 郁動秒: +郁.toFixed(1), 打出: 出, 捱: 入, 交換率: +(出 / Math.max(入, 1)).toFixed(2),
          關: [開.g.關, 收.g.關], 血: [開.g.血, 收.g.血], 狀態: 收.g.狀態 });
}

check('由頭到尾零 browser error', errors.length === 0, errors.slice(0, 3));

await browser.close();
await new Promise(r => server.close(r));
if (計時) {
    console.log('\n最貴嗰十條：');
    for (const [秒, 名] of 用時.slice().sort((a, b) => b[0] - a[0]).slice(0, 10)) {
        console.log(`  ${String(秒).padStart(6)}s  ${名}`);
    }
    console.log(`  合共 ${用時.reduce((a, b) => a + b[0], 0).toFixed(0)}s`);
}
console.log(`\nelden-ring-ii 版位: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
