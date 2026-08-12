// Game Hub 主頁：每組四隻遊戲，桌面 4 欄、手機 2×2，左右掃一次換一組。
//
// 跑法：node tests/hub.mjs
// Playwright 沿用 game package 嘅安裝，避免根目錄多開一個 npm project。

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { catalogTargetEntries } from './lib/catalog-targets.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const PW = [
    path.join(ROOT, 'games', 'tower', 'node_modules', 'playwright', 'index.mjs'),
    path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs'),
].find(fs.existsSync);
if (!fs.existsSync(PW)) {
    console.log('搵唔到 playwright：喺 games/tower 行一次 npm install 先');
    process.exit(1);
}
const { chromium } = await import(pathToFileURL(PW).href);

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, requestPath === '/' ? 'index.html' : requestPath);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('404'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res);
});
const port = await new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
const INDEX = `http://127.0.0.1:${port}/index.html`;

let pass = 0, fail = 0;
const failed = [];
function check(name, ok, detail) {
    if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : detail); }
    else { fail++; failed.push(name); console.log(`FAIL  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
}

const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const linuxChrome = '/opt/pw-browsers/chromium';
const executablePath = [process.env.PW_CHROMIUM, linuxChrome, macChrome].find(p => p && fs.existsSync(p));
const browser = await chromium.launch({ executablePath });

const swipe = (page, dx) => page.evaluate((delta) => {
    const target = document.querySelector('.carousel-track-container');
    const touch = (x) => new Touch({
        identifier: 1, target, screenX: x, clientX: x, screenY: 300, clientY: 300,
    });
    const start = touch(260);
    target.dispatchEvent(new TouchEvent('touchstart', {
        bubbles: true, changedTouches: [start], touches: [start], targetTouches: [start],
    }));
    const end = touch(260 + delta);
    target.dispatchEvent(new TouchEvent('touchend', {
        bubbles: true, changedTouches: [end], touches: [], targetTouches: [],
    }));
}, dx);

const read = page => page.evaluate(() => {
    const track = document.querySelector('.carousel-track');
    const pages = [...document.querySelectorAll('.game-page')];
    const active = document.querySelector('.game-page.active-page');
    const cards = [...document.querySelectorAll('.game-hub-card')];
    const activeCards = [...active.querySelectorAll('.game-hub-card')];
    const view = document.querySelector('.carousel-track-container').getBoundingClientRect();
    const pageRect = active.getBoundingClientRect();
    const hubRect = document.querySelector('#app-hub').getBoundingClientRect();
    const footer = document.querySelector('.carousel-footer');
    const footerRect = footer.getBoundingClientRect();
    const rects = activeCards.map(card => {
        const r = card.getBoundingClientRect();
        return { id: card.dataset.gameId, left: r.left, right: r.right, top: r.top,
            bottom: r.bottom, width: r.width, height: r.height };
    });
    const overlaps = [];
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (a.left < b.right - 1 && b.left < a.right - 1
            && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${a.id}/${b.id}`);
    }
    const roundedUnique = values => [...new Set(values.map(v => Math.round(v / 4) * 4))].length;
    const navOverlap = [...document.querySelectorAll('.nav-btn')].some(btn => {
        const b = btn.getBoundingClientRect();
        return rects.some(r => b.left < r.right && r.left < b.right && b.top < r.bottom && r.top < b.bottom);
    });
    const stones = [...document.querySelectorAll('[data-game-id="gomoku"] .gomoku-stone')]
        .map(stone => stone.getBoundingClientRect());
    return {
        currentPage: Number(track.dataset.currentPage),
        pageCount: pages.length,
        pageSizes: pages.map(p => p.querySelectorAll('.game-hub-card').length),
        cardCount: cards.length,
        uniqueGames: new Set(cards.map(c => c.dataset.gameId)).size,
        allIds: cards.map(c => c.dataset.gameId),
        activeIds: activeCards.map(c => c.dataset.gameId),
        activeCount: activeCards.length,
        columns: roundedUnique(rects.map(r => (r.left + r.right) / 2)),
        rows: roundedUnique(rects.map(r => (r.top + r.bottom) / 2)),
        inside: rects.every(r => r.left >= view.left - 1 && r.right <= view.right + 1
            && r.top >= view.top - 1 && r.bottom <= view.bottom + 1),
        overlaps,
        navOverlap,
        docWidth: document.documentElement.scrollWidth,
        docHeight: document.documentElement.scrollHeight,
        innerWidth,
        innerHeight,
        dots: document.querySelectorAll('.carousel-dot').length,
        activeDots: document.querySelectorAll('.carousel-dot.active').length,
        status: document.querySelector('#carousel-status').textContent,
        hiddenLinksTabbable: pages.filter(p => p !== active)
            .some(p => [...p.querySelectorAll('a')].some(a => a.tabIndex >= 0)),
        hrefsValid: cards.every(c => c.tagName === 'A' && c.getAttribute('href')?.startsWith('games/')),
        gomokuStones: stones.length === 2 ? {
            equal: Math.abs(stones[0].width - stones[1].width) < 0.1
                && Math.abs(stones[0].height - stones[1].height) < 0.1,
            gap: stones[1].left - stones[0].right,
        } : null,
        cardSize: rects[0] ? { width: rects[0].width, height: rects[0].height } : null,
        activeCardCentreOffset: rects[0] ? {
            x: (rects[0].left + rects[0].right - pageRect.left - pageRect.right) / 2,
            y: (rects[0].top + rects[0].bottom - pageRect.top - pageRect.bottom) / 2,
        } : null,
        hubCentreRatio: (hubRect.top + hubRect.bottom) / 2 / innerHeight,
        footerDock: {
            containsBothArrows: [...document.querySelectorAll('.nav-btn')]
                .every(button => button.parentElement === footer),
            width: footerRect.width,
            maxAllowed: innerWidth * 0.78,
        },
    };
});

for (const viewport of [
    { width: 320, height: 568 },
    { width: 440, height: 956 },
    { width: 844, height: 390 },
    { width: 1280, height: 800 },
]) {
    const phone = viewport.width <= 760;
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
    const errors = [];
    // 主頁唔應該向外網攞任何嘢。呢個唔止係速度：喺公司網、飛機上、或者
    // 我哋自己個沙盒入面，一個攞唔到嘅外部資源就係一個靜靜哋壞咗嘅頁面。
    const external = [];
    page.on('request', r => {
        if (!r.url().startsWith(`http://127.0.0.1:${port}`) && !r.url().startsWith('data:')) {
            external.push(r.url());
        }
    });
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
    page.on('response', response => {
        if (response.url().startsWith(`http://127.0.0.1:${port}`) && response.status() >= 400) {
            errors.push(`HTTP ${response.status()} ${response.url()}`);
        }
    });
    await page.goto(INDEX, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(480);

    const label = `${viewport.width}×${viewport.height}`;
    const start = await read(page);
    check(`${label}：13 隻遊戲只出現一次`, start.cardCount === 13 && start.uniqueGames === 13, start);
    check(`${label}：分成四組，前三組每組四隻`,
        start.pageCount === 4 && start.pageSizes.join(',') === '4,4,4,1', start.pageSizes);
    check(`${label}：第一版係五子棋、中國象棋、鋤大D、鬥地主`,
        start.activeIds.join(',') === 'gomoku,xiangqi,big2,doudizhu', start.activeIds);
    check(`${label}：五子棋黑白棋子同尺寸而且有間距`,
        start.gomokuStones?.equal && start.gomokuStones.gap >= 5, start.gomokuStones);
    check(`${label}：當前四格完整留喺 carousel 入面`, start.activeCount === 4 && start.inside, start);
    check(`${label}：四格互不重疊`, start.overlaps.length === 0, start.overlaps);
    check(`${label}：文件唔會闊過畫面`, start.docWidth <= start.innerWidth, start);
    check(`${label}：四格首頁一屏睇得晒`, start.docHeight <= start.innerHeight + 1, start);
    check(`${label}：導覽掣唔會壓住遊戲卡`, start.navOverlap === false, start);
    check(`${label}：分頁點、頁碼同 keyboard focus 狀態正確`,
        start.dots === 4 && start.activeDots === 1 && start.status === '1 / 4'
            && start.hiddenLinksTabbable === false && start.hrefsValid, start);
    check(`${label}：左右箭咀、圓點同頁碼收成同一個控制 dock`,
        start.footerDock.containsBothArrows && start.footerDock.width <= start.footerDock.maxAllowed,
        start.footerDock);
    if (phone) {
        check(`${label}：手機係 2×2 四格`, start.columns === 2 && start.rows === 2,
            { columns: start.columns, rows: start.rows });
        check(`${label}：手機卡片係緊湊 tile，唔係四塊高身表格`,
            start.cardSize.height <= 175, start.cardSize);
        if (viewport.height >= 700) {
            check(`${label}：高身手機 launcher 落喺視覺中段`,
                start.hubCentreRatio >= 0.38 && start.hubCentreRatio <= 0.55,
                start.hubCentreRatio);
        }
    } else {
        check(`${label}：桌面係一排四格`, start.columns === 4 && start.rows === 1,
            { columns: start.columns, rows: start.rows });
    }

    await swipe(page, -190);
    await page.waitForTimeout(430);
    const next = await read(page);
    check(`${label}：向左掃一次會跳下一組四隻`,
        next.currentPage === 1 && next.activeIds[0] === 'pennycrush', next);

    await swipe(page, 190);
    await page.waitForTimeout(430);
    const back = await read(page);
    check(`${label}：反方向掃會返第一組`, back.currentPage === 0, back);

    // iOS／Android 系統手勢可以送 touchcancel，之後先補一個遲到嘅 touchend。
    // cancel 必須清走起點，否則呢個「冇真正完成嘅手勢」會偷跳一頁。
    const cancelled = await page.evaluate(() => {
        const target = document.querySelector('.carousel-track-container');
        const touch = (identifier, x) => new Touch({
            identifier, target, screenX: x, clientX: x, screenY: 300, clientY: 300,
        });
        const active = touch(19, 260);
        target.dispatchEvent(new TouchEvent('touchstart', {
            bubbles: true, changedTouches: [active], touches: [active], targetTouches: [active],
        }));
        target.dispatchEvent(new TouchEvent('touchcancel', {
            bubbles: true, changedTouches: [active], touches: [], targetTouches: [],
        }));
        const late = touch(19, 70);
        target.dispatchEvent(new TouchEvent('touchend', {
            bubbles: true, changedTouches: [late], touches: [], targetTouches: [],
        }));
        return Number(document.querySelector('.carousel-track').dataset.currentPage);
    });
    check(`${label}：touchcancel 後嘅遲到 touchend 唔會誤換頁`, cancelled === 0, cancelled);

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(430);
    const keyboard = await read(page);
    check(`${label}：方向鍵都可以逐組瀏覽`, keyboard.currentPage === 1, keyboard);

    await page.locator('.carousel-dot').nth(3).click();
    await page.waitForTimeout(430);
    const last = await read(page);
    check(`${label}：分頁點可直達最後一組 Elden Ring II`,
        last.currentPage === 3 && last.activeIds.join(',') === 'elden-ring-ii', last);
    check(`${label}：單卡尾頁保持正常 tile 尺寸，水平同垂直置中`,
        last.cardSize.height <= start.cardSize.height * 1.05
            && last.cardSize.width <= start.cardSize.width * 1.1
            && Math.abs(last.activeCardCentreOffset.x) <= 2
            && Math.abs(last.activeCardCentreOffset.y) <= 2,
        { first: start.cardSize, last: last.cardSize, offset: last.activeCardCentreOffset });
    // 字體要真係載到，而且唔准去攞外網。之前呢頁 @import 去 Google Fonts，
    // 開每一頁都要兩個擋住渲染嘅跨網域來回；喺攞唔到外網嘅環境就靜靜哋跌返
    // 做系統字，而「零 browser error」係捉唔到嘅——所以要直接問瀏覽器。
    const font = await page.evaluate(async () => {
        await document.fonts.ready;
        return { 用到: document.fonts.check('700 16px Outfit'),
            面: [...document.fonts].map(f => `${f.family}/${f.status}`) };
    });
    check(`${label}：Outfit 真係載到（唔係跌返做系統字）`, font.用到, font);
    check(`${label}：一個外網請求都冇`, external.length === 0, external.slice(0, 4));
    // 撳得中：MOBA 嗰邊每粒掣都釘住 44px（ADR-107），但 Hub——玩家真正
    // 見到嘅第一塊畫面——一條都冇量過。實測改之前：分頁圓點 **8×8**，
    // 箭咀 34 至 42，四個尺寸全部低過線。
    // 兩條唔同嘅線，各有理由：箭咀係單獨目標又有位，照守 44；四粒圓點喺
    // 320 闊之下每粒 44 就係 176，加埋箭咀塞唔落，所以用 WCAG 2.5.8 嘅
    // 24×24，再加「圓心之間唔可以近過 24」保證兩粒唔會互搶。
    const taps = await page.evaluate(() => {
        const vis = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
            return r.width > 1 && r.height > 1 && cs.display !== 'none'
                && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none'; };
        const all = [...document.querySelectorAll('a,button,[role="button"],input,select')].filter(vis);
        const 細 = [], 撳唔中 = [];
        for (const el of all) {
            const r = el.getBoundingClientRect();
            const dot = el.classList.contains('carousel-dot');
            const 最少 = dot ? 24 : 44;
            const 邊 = Math.min(r.width, r.height);
            if (邊 < 最少) 細.push(`${el.className || el.tagName}: ${Math.round(r.width)}×${Math.round(r.height)}（要 ${最少}）`);
            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            if (!hit || !(hit === el || el.contains(hit) || hit.contains(el))) {
                撳唔中.push(`${el.className || el.tagName} → ${hit?.className || hit?.tagName || '冇嘢'}`);
            }
        }
        const dots = [...document.querySelectorAll('.carousel-dot')].filter(vis)
            .map(el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; })
            .sort((a, b) => a - b);
        const 太逼 = [];
        for (let i = 1; i < dots.length; i++) {
            if (dots[i] - dots[i - 1] < 24) 太逼.push(Math.round(dots[i] - dots[i - 1]));
        }
        return { 數: all.length, 細, 撳唔中, 太逼 };
    });
    check(`${label}：每個撳得嘅嘢都夠大（箭咀 44、圓點 24）`, taps.細.length === 0, taps.細);
    check(`${label}：每個撳得嘅嘢中心都真係打得中自己`, taps.撳唔中.length === 0, taps.撳唔中);
    check(`${label}：圓點圓心之間唔會近過 24px`, taps.太逼.length === 0, taps.太逼);

    check(`${label}：零 browser error`, errors.length === 0, errors);
    await page.close();
}

// ---------- 每個入口都要真係去到一個存在嘅檔 ----------
//
// Hub 一直有量掣夠唔夠大、圓點隔幾遠、輪播排得啱唔啱（ADR-133），但由頭到
// 尾冇量過**最基本嗰件事：撳落去有冇嘢**。實測用瀏覽器逐個入口載入，
// `games/ashen-rail/dist/index.html` 回 **404**——即係已上線嘅網站入面，
// 灰燼鐵道嗰格由第一日起撳落去就係一版白。
//
// 成因喺 `.gitignore`：`games/ashen-rail/dist/` 被排除，而呢個係一個靜態
// GitHub Pages 站，`dist` 本身就係交付物。其他遊戲（snake／tower／xiangqi）
// 嘅 dist 全部有入 git，得佢冇。一個「唔好入 build 產物」嘅通用習慣，用喺
// 一個 build 產物就係網站嘅倉度，就變成「唔好上線」。
//
// 呢條檢查唔開瀏覽器：由 GameCatalog 讀 entry，逐個查檔案在唔在。
// 開瀏覽器嗰個版本會慢十倍，而且答案一樣。
{
    const links = catalogTargetEntries().map(({ entry, launchPath }) => entry ?? launchPath);
    const 死 = [];
    for (const raw of links) {
        const rel = decodeURIComponent(raw.split(/[?#]/)[0]);
        if (/^https?:/i.test(rel)) continue;          // 外部連結唔喺呢度管
        const f = path.join(ROOT, rel);
        if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) 死.push(raw);
    }
    check('launcher 每個入口都指住一個存在嘅檔', 死.length === 0,
        { 一共: links.length, 死鏈: 死 });
}

await browser.close();
await new Promise(resolve => server.close(resolve));
console.log(`\nhub: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
