// Game Hub 主頁契約（ADR-314）：頂欄 → 精選 hero → 篩選 ＋ 一頁見晒 13 隻嘅 grid。
//
// 守嘅係行為同幾何，唔係 class 名：13 個 `a[data-game-id]`（manifest 次序、
// 每隻一次、真 href）、hero 係另一個 `data-hero-game-id` anchor、篩選掣
// `[data-filter]`、「上次玩過」storage 壞咗照 render。
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
    '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
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


const ORDER = catalogTargetEntries().map(({ id }) => id);
const GROUP_SIZES = { all: 13, board: 4, casual: 3, strategy: 3, action: 3 };

const read = page => page.evaluate(() => {
    const cards = [...document.querySelectorAll('a[data-game-id]')];
    const visible = cards.filter(card => card.getClientRects().length > 0);
    const rects = visible.map(card => {
        const r = card.getBoundingClientRect();
        return { id: card.dataset.gameId, left: r.left, right: r.right, top: r.top + scrollY,
            bottom: r.bottom + scrollY, width: r.width, height: r.height };
    });
    const overlaps = [];
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (a.left < b.right - 1 && b.left < a.right - 1
            && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps.push(`${a.id}/${b.id}`);
    }
    const firstRowTop = rects.length ? Math.min(...rects.map(r => r.top)) : 0;
    const hero = document.querySelector('a[data-hero-game-id]');
    const heroRect = hero?.getBoundingClientRect();
    return {
        ids: cards.map(card => card.dataset.gameId),
        visibleIds: visible.map(card => card.dataset.gameId),
        hrefsValid: cards.every(card => card.getAttribute('href')?.startsWith('games/')),
        overlaps,
        columns: rects.filter(r => Math.abs(r.top - firstRowTop) < 2).length,
        insideX: rects.every(r => r.left >= -1 && r.right <= innerWidth + 1),
        // 封面係真實遊玩截圖：每張卡一張指住 assets/hub/covers 嘅圖，唔係 emoji fallback。
        coverOk: visible.every(card => {
            const img = card.querySelector('.card-art img');
            return img && /assets\/hub\/covers\/[\w-]+\.webp/.test(img.getAttribute('src'));
        }),
        // 封面係遊玩中段截圖，本身冇標題；遊戲名一定要疊喺封面上，而且讀屏讀得到。
        titleOnCover: visible.every(card => {
            const title = card.querySelector('.card-title');
            const cover = card.querySelector('.card-art');
            if (!title || !cover || title.closest('[aria-hidden="true"]')) return false;
            const t = title.getBoundingClientRect(), c = cover.getBoundingClientRect();
            return t.left >= c.left && t.right <= c.right && t.top >= c.top && t.bottom <= c.bottom
                && card.textContent.includes(title.textContent) && title.textContent.trim().length > 0;
        }),
        heroCover: (() => {
            const img = hero?.querySelector('.hero-art img');
            return img ? { src: img.getAttribute('src'), loaded: img.complete && img.naturalWidth > 0 } : null;
        })(),
        hero: hero ? {
            id: hero.dataset.heroGameId,
            href: hero.getAttribute('href'),
            eyebrow: hero.querySelector('.hero-eyebrow')?.textContent ?? '',
            height: heroRect.height,
            bottom: heroRect.bottom + scrollY,
        } : null,
        heroInGrid: hero ? hero.hasAttribute('data-game-id') : null,
        docWidth: document.documentElement.scrollWidth,
        innerWidth,
        innerHeight,
        pressed: [...document.querySelectorAll('[data-filter][aria-pressed="true"]')].map(b => b.dataset.filter),
        status: document.getElementById('library-status')?.textContent ?? '',
    };
});

for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 440, height: 956 },
    { width: 667, height: 375 },
    { width: 844, height: 390 },
    { width: 1280, height: 800 },
]) {
    const phone = viewport.width <= 760;
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: phone, hasTouch: true });
    const page = await context.newPage();
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
    await page.waitForTimeout(700);

    const label = `${viewport.width}×${viewport.height}`;
    const start = await read(page);
    check(`${label}：13 隻遊戲各出現一次，跟 manifest 次序`,
        start.ids.length === 13 && start.ids.join(',') === ORDER.join(','), start.ids);
    check(`${label}：全部 13 隻一開頁就喺 grid 度（冇分頁收埋）`, start.visibleIds.length === 13, start.visibleIds);
    check(`${label}：每個入口係真 href`, start.hrefsValid);
    check(`${label}：精選 hero 係另一個 anchor，唔計入 13 個`,
        start.hero && start.heroInGrid === false && ORDER.includes(start.hero.id)
            && start.hero.href?.startsWith('games/'), start.hero);
    check(`${label}：hero 唔會食晒成個首屏`,
        start.hero && start.hero.bottom <= viewport.height * (phone && viewport.height > 500 ? 0.75 : 0.95),
        start.hero);
    check(`${label}：卡互不重疊`, start.overlaps.length === 0, start.overlaps);
    check(`${label}：卡全部喺畫面闊度入面`, start.insideX, start);
    check(`${label}：文件唔會闊過畫面`, start.docWidth <= start.innerWidth, start);
    check(`${label}：每張卡都用真實遊玩截圖做封面`, start.coverOk);
    check(`${label}：每張封面上面都疊住遊戲名（讀屏讀得到）`, start.titleOnCover);
    check(`${label}：hero 封面用大圖而且載入咗`,
        start.heroCover?.loaded && /assets\/hub\/hero\//.test(start.heroCover.src), start.heroCover);
    // lazy 嘅卡圖捲到先載；捲一次到底，確認 13 張都真係載到（冇 404／冇 fallback）。
    const covers = await page.evaluate(async () => {
        for (const img of document.querySelectorAll('.card-art img')) {
            img.scrollIntoView({ block: 'center' });
            await img.decode().catch(() => {});
        }
        scrollTo(0, 0);
        return { loaded: [...document.querySelectorAll('.card-art img')].filter(img => img.naturalWidth > 0).length,
            fallback: document.querySelectorAll('.is-fallback').length };
    });
    check(`${label}：13 張封面全部載到`, covers.loaded === 13 && covers.fallback === 0, covers);
    const wantColumns = viewport.width <= 640 && viewport.height > 500 ? 2 : viewport.width >= 1200 ? 4 : null;
    if (wantColumns) {
        check(`${label}：grid 係 ${wantColumns} 欄`, start.columns === wantColumns, start.columns);
    } else {
        check(`${label}：矮橫屏 grid 至少 3 欄`, start.columns >= 3, start.columns);
    }
    check(`${label}：預設篩選係「全部」`,
        start.pressed.join(',') === 'all' && start.status.includes('13'), { pressed: start.pressed, status: start.status });

    // ---- 篩選 ----
    const filterResults = {};
    for (const [group, size] of Object.entries(GROUP_SIZES)) {
        await page.locator(`[data-filter="${group}"]`).click();
        const after = await read(page);
        filterResults[group] = { shown: after.visibleIds.length, pressed: after.pressed.join(','),
            orderKept: after.visibleIds.join(',') === ORDER.filter(id => after.visibleIds.includes(id)).join(','),
            overlaps: after.overlaps.length };
    }
    check(`${label}：每粒篩選掣顯示啱數量、狀態同次序`,
        Object.entries(GROUP_SIZES).every(([group, size]) => filterResults[group].shown === size
            && filterResults[group].pressed === group && filterResults[group].orderKept
            && filterResults[group].overlaps === 0), filterResults);
    await page.locator('[data-filter="all"]').click();

    // ---- 撳得中 ----
    // 44px 係 Apple HIG／Material 嘅線；hub 冇理由例外。每個控制捲入畫面之後,
    // 中心點要真係打得中自己（冇嘢疊住）。
    const taps = await page.evaluate(async () => {
        const vis = (node) => { const cs = getComputedStyle(node); const r = node.getBoundingClientRect();
            return r.width > 1 && r.height > 1 && cs.display !== 'none'
                && cs.visibility !== 'hidden' && cs.pointerEvents !== 'none'; };
        const all = [...document.querySelectorAll('a,button,[role="button"],input,select')].filter(vis);
        const 細 = [], 撳唔中 = [];
        for (const node of all) {
            node.scrollIntoView({ block: 'center' });
            const r = node.getBoundingClientRect();
            if (Math.min(r.width, r.height) < 44) 細.push(`${node.className}: ${Math.round(r.width)}×${Math.round(r.height)}`);
            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            if (!hit || !(hit === node || node.contains(hit))) 撳唔中.push(`${node.className} → ${hit?.className || hit?.tagName || '冇嘢'}`);
        }
        scrollTo(0, 0);
        return { 數: all.length, 細, 撳唔中 };
    });
    check(`${label}：每個撳得嘅嘢至少 44px`, taps.細.length === 0, taps.細);
    check(`${label}：每個撳得嘅嘢中心都真係打得中自己`, taps.撳唔中.length === 0, taps.撳唔中);

    // ---- 鍵盤 ----
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
    const tabbed = [];
    // blur 之後瀏覽器個 Tab 起點可能留喺上一次 focus 嘅位，所以由 hero 出現嗰格起計。
    for (let i = 0; i < 40; i++) {
        await page.keyboard.press('Tab');
        tabbed.push(await page.evaluate(() => {
            const a = document.activeElement;
            return a?.dataset?.gameId ?? (a?.dataset?.heroGameId ? 'hero' : a?.dataset?.filter ? `filter:${a.dataset.filter}` : a?.tagName);
        }));
    }
    const loop = tabbed.slice(tabbed.indexOf('hero'), tabbed.indexOf('hero') + 19);
    check(`${label}：Tab 次序：hero → 5 粒篩選 → 13 隻（manifest 次序）`,
        loop[0] === 'hero' && loop.slice(1, 6).every(id => String(id).startsWith('filter:'))
            && loop.slice(6).join(',') === ORDER.join(','), loop);

    if (viewport.width === 1280) {
        // 字體要真係載到，而且唔准去攞外網。
        const font = await page.evaluate(async () => {
            await document.fonts.ready;
            return document.fonts.check('700 16px Outfit');
        });
        check(`${label}：Outfit 真係載到（唔係跌返做系統字）`, font);

        // ---- 上次玩過 ----
        // 撳一隻遊戲，返嚟首頁時 hero 要變成「繼續玩」嗰隻。
        await page.route('**/games/tower/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' }));
        await page.locator('a[data-game-id="tower"]').click();
        await page.waitForURL(/games\/tower/);
        await page.goto(INDEX, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);
        const back = await read(page);
        check(`${label}：玩過一隻之後，hero 變成「繼續玩」嗰隻`,
            back.hero?.id === 'tower' && back.hero.eyebrow.includes('繼續玩'), back.hero);
    }
    check(`${label}：一個外網請求都冇`, external.length === 0, external.slice(0, 4));
    check(`${label}：零 browser error`, errors.length === 0, errors);
    await context.close();
}

// ---------- storage 封死都照 render ----------
{
    const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
    await context.addInitScript(() => {
        const err = () => { throw new DOMException('blocked', 'SecurityError'); };
        Object.defineProperty(window, 'localStorage', { get: err, configurable: true });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(INDEX, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const state = await read(page);
    await page.route('**/games/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' }));
    await page.locator('a[data-game-id="snake"]').click();
    await page.waitForURL(/games\/snake/);
    check('localStorage 封死：13 張卡＋hero 照出，撳卡照走，零 error',
        state.ids.length === 13 && !!state.hero && errors.length === 0, { ids: state.ids.length, errors });
    await context.close();
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
