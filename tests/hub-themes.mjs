// Game Hub theme contract.
//
// Runs with the same Playwright installation as the existing Hub gates:
//   PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-themes.mjs
//
// This is deliberately a browser contract rather than a screenshot comparison.
// Theme identity is read from the public data attributes; responsive intent is
// measured from semantic card geometry and computed layout values.

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
if (!PW) {
    console.error('搵唔到 playwright：喺 games/tower 行一次 npm install 先');
    process.exit(2);
}
const { chromium } = await import(pathToFileURL(PW).href);

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
    '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
    '.bin': 'application/octet-stream', '.wasm': 'application/wasm',
    '.hdr': 'image/vnd.radiance', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg', '.wav': 'audio/wav',
};

const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const file = path.join(ROOT, requestPath === '/' ? 'index.html' : requestPath);
    const inside = file === ROOT || file.startsWith(`${ROOT}${path.sep}`);
    if (!inside || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('404');
        return;
    }
    const body = fs.readFileSync(file);
    res.writeHead(200, {
        'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
        'content-length': body.length,
    });
    if (req.method === 'HEAD') res.end();
    else res.end(body);
});
const port = await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
});
const INDEX = `http://127.0.0.1:${port}/index.html`;
const ORIGIN = `http://127.0.0.1:${port}`;

const THEMES = ['neon-grid', 'editorial-arcade', 'command-deck'];
const THEME_STORAGE = 'gamehub-theme-v1';
const EXPECTED_IDS = catalogTargetEntries().map(({ id }) => id);
const VIEWPORTS = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 667, height: 375 },
    { width: 844, height: 390 },
    { width: 1280, height: 800 },
];

let pass = 0;
let fail = 0;
const failed = [];
function check(name, ok, detail) {
    if (ok) {
        pass += 1;
        console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail));
    } else {
        fail += 1;
        failed.push(name);
        console.log(`FAIL  ${name}`, detail === undefined ? '' : JSON.stringify(detail));
    }
}

const executablePath = [
    process.env.PW_CHROMIUM,
    '/opt/pw-browsers/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((candidate) => candidate && fs.existsSync(candidate));

const clusterCount = (values, tolerance = 8) => {
    const sorted = [...values].sort((a, b) => a - b);
    const groups = [];
    for (const value of sorted) {
        const last = groups.at(-1);
        if (!last || value - last.at(-1) > tolerance) groups.push([value]);
        else last.push(value);
    }
    return groups.length;
};

const snapshot = (page) => page.evaluate(() => {
    const visible = (el) => {
        if (!el) return false;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden'
            && Number(cs.opacity) !== 0 && r.width > 0 && r.height > 0;
    };
    const rect = (el) => {
        const r = el.getBoundingClientRect();
        return {
            left: r.left, right: r.right, top: r.top, bottom: r.bottom,
            width: r.width, height: r.height,
            cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2,
            area: r.width * r.height,
        };
    };
    const pages = [...document.querySelectorAll('.game-page')];
    const active = document.querySelector('.game-page.active-page');
    const activeCards = active ? [...active.querySelectorAll('[data-game-id]')] : [];
    const allCards = [...document.querySelectorAll('[data-game-id]')];
    const track = document.querySelector('.carousel-track');
    const trackContainer = document.querySelector('.carousel-track-container');
    const pageRect = active ? rect(active) : null;
    const containerRect = trackContainer ? rect(trackContainer) : null;
    const cardRects = activeCards.map(rect);
    const commandChromeOverlap = activeCards.flatMap((card) => {
        const category = card.querySelector('.card-category');
        const launch = card.querySelector('.pill-btn');
        if (!category || !launch || !visible(category) || !visible(launch)) return [];
        const a = rect(category);
        const b = rect(launch);
        return a.left < b.right - 1 && b.left < a.right - 1
            && a.top < b.bottom - 1 && b.top < a.bottom - 1
            ? [card.dataset.gameId] : [];
    });
    const overlaps = [];
    for (let i = 0; i < cardRects.length; i += 1) {
        for (let j = i + 1; j < cardRects.length; j += 1) {
            const a = cardRects[i];
            const b = cardRects[j];
            if (a.left < b.right - 1 && b.left < a.right - 1
                && a.top < b.bottom - 1 && b.top < a.bottom - 1) {
                overlaps.push(`${activeCards[i].dataset.gameId}/${activeCards[j].dataset.gameId}`);
            }
        }
    }
    const inside = (r, box) => !!box && r.left >= box.left - 1 && r.right <= box.right + 1
        && r.top >= box.top - 1 && r.bottom <= box.bottom + 1;
    const controls = [...document.querySelectorAll('[data-theme-value]')].filter(visible);
    const nav = [...document.querySelectorAll('.nav-btn')].filter(visible);
    const dots = [...document.querySelectorAll('.carousel-dot')].filter(visible);
    const themeButtons = controls.map((el) => ({
        value: el.getAttribute('data-theme-value'), tag: el.tagName,
        type: el.getAttribute('type'), tabIndex: el.tabIndex, ...rect(el),
    }));
    const themeValues = [...document.querySelectorAll('[data-theme-value]')]
        .map((el) => el.getAttribute('data-theme-value'));
    const pressed = [...document.querySelectorAll('[data-theme-value][aria-pressed="true"]')]
        .map((el) => el.getAttribute('data-theme-value'));
    const attrs = [document.documentElement, document.body, document.querySelector('#app-hub')]
        .map((el) => el?.getAttribute('data-hub-theme') ?? null);
    const pageStyle = active ? getComputedStyle(active) : null;

    /*
     * 媒介簽名：**唔讀 class、唔讀 data 屬性**，淨係問「呢個入口入面有冇一件
     * 圖像嘢，佢個框係咩比例」。Command Deck 特登一件都冇——嗰個係 §5.5
     * 容許嘅 no-thumbnail proof，所以 0 係一個有效答案，唔係搵唔到。
     */
    const mediaOf = (card) => {
        const art = card.querySelector('img, picture, .art-glyph, .art-stones');
        if (!art) return null;
        // 圖像本身可能好細，要量嘅係佢個容器（螢幕窗／封面）。
        let box = art;
        while (box.parentElement && box.parentElement !== card
            && box.getBoundingClientRect().width < card.getBoundingClientRect().width * 0.5) {
            box = box.parentElement;
        }
        const r = box.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height),
            ratio: r.height > 0 ? Number((r.width / r.height).toFixed(2)) : 0 };
    };
    const media = activeCards.map(mediaOf);
    const union = (list) => {
        if (!list.length) return null;
        const left = Math.min(...list.map((r) => r.left));
        const top = Math.min(...list.map((r) => r.top));
        const right = Math.max(...list.map((r) => r.right));
        const bottom = Math.max(...list.map((r) => r.bottom));
        return { left, top, right, bottom, width: right - left, height: bottom - top,
            cx: (left + right) / 2, cy: (top + bottom) / 2 };
    };
    const shell = document.querySelector('#app-hub > *');
    const shellKids = shell ? [...shell.children].map((kid) => rect(kid)) : [];
    // 殼係「左右分欄」定「上下疊」：睇第一層仔有冇兩個喺同一水平帶但唔同欄。
    const sideBySide = shellKids.some((a, i) => shellKids.some((b, j) => j > i
        && a.top < b.bottom - 8 && b.top < a.bottom - 8
        && (a.right <= b.left + 2 || b.right <= a.left + 2)));

    return {
        media,
        mediaCount: media.filter(Boolean).length,
        selectorBox: union(controls.map(rect)),
        navDockBox: union(nav.map(rect)),
        shellSideBySide: sideBySide,
        shellKidCount: shellKids.length,
        themeValues, pressed, attrs,
        currentPage: Number(track?.dataset.currentPage ?? NaN),
        pageCount: pages.length,
        pageSizes: pages.map((p) => p.querySelectorAll('[data-game-id]').length),
        cardCount: allCards.length,
        ids: allCards.map((card) => card.dataset.gameId),
        hrefs: allCards.map((card) => card.getAttribute('href')),
        activeIds: activeCards.map((card) => card.dataset.gameId),
        activeCount: activeCards.length,
        cardRects, pageRect, containerRect,
        insideContainer: cardRects.every((r) => inside(r, containerRect)),
        insideViewport: cardRects.every((r) => r.left >= -1 && r.right <= innerWidth + 1
            && r.top >= -1 && r.bottom <= innerHeight + 1),
        overlaps,
        docWidth: Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth ?? 0),
        docHeight: Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight ?? 0),
        innerWidth, innerHeight,
        themeButtons, navButtons: nav.map(rect), dots: dots.map(rect),
        pageDisplay: pageStyle?.display ?? null,
        pageGridColumns: pageStyle?.gridTemplateColumns ?? null,
        pageFlexDirection: pageStyle?.flexDirection ?? null,
        cardDisplay: activeCards.map((card) => getComputedStyle(card).display),
        featureRoles: activeCards.map((card) => card.getAttribute('data-theme-role')),
        commandChromeOverlap,
        activeDotCount: document.querySelectorAll('.carousel-dot.active').length,
    };
});

const waitForTheme = async (page, theme) => {
    await page.waitForFunction((value) => {
        const controls = [...document.querySelectorAll('[data-theme-value]')];
        const active = controls.filter((el) => el.getAttribute('aria-pressed') === 'true');
        const roots = [document.documentElement, document.body, document.querySelector('#app-hub')];
        return controls.length === 3
            && controls.some((el) => el.getAttribute('data-theme-value') === value)
            && active.length === 1 && active[0].getAttribute('data-theme-value') === value
            && roots.every((el) => el?.getAttribute('data-hub-theme') === value);
    }, theme, { timeout: 15000 });
};

const selectTheme = async (page, theme) => {
    await page.locator(`[data-theme-value="${theme}"]`).click({ timeout: 10000 });
    await waitForTheme(page, theme);
    // Let the theme transition finish before measuring geometry.
    await page.waitForTimeout(460);
};

const dispatchSwipe = (page, delta) => page.evaluate((dx) => {
    const target = document.querySelector('.carousel-track-container');
    if (!target) throw new Error('missing carousel track container');
    const touch = (x) => new Touch({
        identifier: 1, target, screenX: x, clientX: x,
        screenY: 300, clientY: 300,
    });
    const start = touch(260);
    target.dispatchEvent(new TouchEvent('touchstart', {
        bubbles: true, changedTouches: [start], touches: [start], targetTouches: [start],
    }));
    const end = touch(260 + dx);
    target.dispatchEvent(new TouchEvent('touchend', {
        bubbles: true, changedTouches: [end], touches: [], targetTouches: [],
    }));
}, delta);

const dispatchCancelledSwipe = (page) => page.evaluate(() => {
    const target = document.querySelector('.carousel-track-container');
    const touch = (identifier, x) => new Touch({
        identifier, target, screenX: x, clientX: x,
        screenY: 300, clientY: 300,
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
    return Number(document.querySelector('.carousel-track')?.dataset.currentPage ?? NaN);
});

const blockedStorage = `
(() => {
    const denied = () => {
        const error = new Error('The operation is insecure.');
        error.name = 'SecurityError';
        throw error;
    };
    const storage = {
        getItem: denied, setItem: denied, removeItem: denied,
        clear: denied, key: denied, get length() { return denied(); },
    };
    try { Object.defineProperty(window, 'localStorage', { configurable: true, get: () => storage }); } catch {}
    try { Object.defineProperty(window, 'sessionStorage', { configurable: true, get: () => storage }); } catch {}
})();
`;

const checkThemeState = (label, state, theme) => {
    check(`${label}：theme values 只有三個且 active aria-pressed 唯一`,
        state.themeValues.length === 3
        && [...new Set(state.themeValues)].sort().join(',') === THEMES.slice().sort().join(',')
        && state.pressed.length === 1 && state.pressed[0] === theme,
        { values: state.themeValues, pressed: state.pressed });
    check(`${label}：html/body/#app-hub 同步 data-hub-theme`,
        state.attrs.length === 3 && state.attrs.every((value) => value === theme), state.attrs);
    check(`${label}：主題掣係 native button 且 44px 可擊中`,
        state.themeButtons.length === 3
        && state.themeButtons.every((button) => button.tag === 'BUTTON'
            && button.type === 'button' && button.tabIndex >= 0
            && button.width >= 44 && button.height >= 44), state.themeButtons);
    check(`${label}：左右箭咀至少 44px`,
        state.navButtons.length === 2
        && state.navButtons.every((button) => button.width >= 44 && button.height >= 44),
    state.navButtons);
    check(`${label}：分頁 dot 保持現有 24px 例外`,
        state.dots.length === state.pageCount
        && state.dots.every((dot) => dot.width >= 24 && dot.height >= 24), state.dots);
    check(`${label}：active 四格入 viewport、互不重疊、零 horizontal overflow`,
        state.activeCount === 4 && state.insideContainer && state.insideViewport
        && state.overlaps.length === 0 && state.docWidth <= state.innerWidth + 1,
    { active: state.activeIds, insideContainer: state.insideContainer,
        insideViewport: state.insideViewport, overlaps: state.overlaps,
        docWidth: state.docWidth, innerWidth: state.innerWidth });
};

const checkRoster = (label, state) => {
    const ids = state.ids;
    check(`${label}：13 unique links 同 manifest order`,
        state.cardCount === 13 && new Set(ids).size === 13
        && ids.join(',') === EXPECTED_IDS.join(',')
        && state.hrefs.length === 13
        && state.hrefs.every((href) => typeof href === 'string' && href.startsWith('games/')),
    { count: state.cardCount, unique: new Set(ids).size, ids, hrefs: state.hrefs });
    check(`${label}：page sizes 係 4/4/4/1`,
        state.pageCount === 4 && state.pageSizes.join(',') === '4,4,4,1', state.pageSizes);
    check(`${label}：active 四格完整入 viewport、互不重疊、零 horizontal overflow`,
        state.activeCount === 4 && state.insideContainer && state.insideViewport
        && state.overlaps.length === 0 && state.docWidth <= state.innerWidth + 1,
    { active: state.activeIds, insideContainer: state.insideContainer,
        insideViewport: state.insideViewport, overlaps: state.overlaps,
        docWidth: state.docWidth, innerWidth: state.innerWidth });
};

/*
 * 逐套 theme 嘅**形狀簽名**，同埋三套之間要真係唔同。
 *
 * ADR-312 之後，「theme」唔可以再用「同一張卡換 class」交貨，所以呢度唔再
 * 逐套寫死「四欄／一大三細／四行」嗰種寫法——嗰種寫法只係將實作抄多次入
 * 把尺，實作點改，把尺就跟住改，永遠證明唔到「三套真係唔同」。
 *
 * 而家做兩層：
 *   一、每套自己要企得穩（入口喺畫面內、唔重疊、尾頁擺得正）；
 *   二、三套之間**至少要喺四個維度上唔同**——item 形狀、媒介處理、
 *      導航 dock 擺位、theme selector 擺位。呢四樣全部由幾何量返嚟，
 *      唔會因為換色而變。
 */

/** 一版嘅 item 形狀分類：純幾何，唔睇 class。 */
const itemShape = (state) => {
    const rects = state.cardRects;
    if (rects.length !== 4) return 'n/a';
    const areas = rects.map((r) => r.area);
    const 最大 = Math.max(...areas);
    const 最細 = Math.min(...areas);
    const 闊 = rects.map((r) => r.width);
    const 通欄 = Math.min(...闊) >= (state.pageRect?.width ?? 0) * 0.9;
    if (最大 / Math.max(1, 最細) >= 1.5) return 'lead-and-index';   // 一大三細
    if (通欄) return 'full-width-rows';                              // 四條打通嘅行
    return 'uniform-tiles';                                          // 四格大細一樣嘅 tile
};

/** 媒介處理：每版有幾多個入口帶住圖像，同埋嗰個框嘅比例。 */
const mediaShape = (state) => {
    if (state.mediaCount === 0) return 'none';
    const ratios = state.media.filter(Boolean).map((m) => m.ratio);
    const 平 = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    return `${state.mediaCount}@${平 < 1.15 ? 'square-ish' : 平 < 1.55 ? 'landscape-4-3' : 'wide'}`;
};

/** 一個 box 喺畫面邊個區：把尺淨係關心「三套擺唔擺喺同一個位」。 */
const zoneOf = (box, state) => {
    if (!box) return 'none';
    const x = box.cx / state.innerWidth;
    const y = box.cy / state.innerHeight;
    const 橫 = x < 0.34 ? 'left' : x > 0.66 ? 'right' : 'centre';
    const 直 = y < 0.34 ? 'top' : y > 0.66 ? 'bottom' : 'middle';
    return `${直}-${橫}`;
};

const signatureOf = (state) => ({
    item: itemShape(state),
    media: mediaShape(state),
    nav: zoneOf(state.navDockBox, state),
    selector: zoneOf(state.selectorBox, state),
    shell: state.shellSideBySide ? 'rail-split' : 'stacked',
});

const checkShape = (label, state, theme) => {
    const sig = signatureOf(state);
    // 每套自己要企得穩：四個入口喺畫面入面、互不重疊、冇橫向捲。
    check(`${label}：四個入口完整入 viewport、互不重疊、零 horizontal overflow`,
        state.activeCount === 4 && state.insideViewport && state.overlaps.length === 0
        && state.docWidth <= state.innerWidth + 1,
    { sig, insideViewport: state.insideViewport, overlaps: state.overlaps,
        docWidth: state.docWidth, innerWidth: state.innerWidth });
    return sig;
};

/**
 * 尾頁：淨低一個入口，唔可以貼住角落企。
 *
 * 舊版仲寫住「唔可以高過個頁框 98%」同 command 專屬嘅 `height <= 160`
 * ——嗰兩條係度緊當時嗰張卡。一版雜誌淨低一篇，佢**應該**攤大成版；
 * 真正要守嘅係「擺得正、唔會爆出 viewport、唔會細到搵唔到」。
 */
const checkTail = (label, state) => {
    const card = state.cardRects[0];
    const page = state.pageRect;
    const centred = !!card && !!page
        && Math.abs(card.cx - page.cx) <= 6 && Math.abs(card.cy - page.cy) <= 6;
    const sane = !!card && !!page && card.width >= 80 && card.height >= 80
        && card.width <= page.width + 1 && card.height <= page.height + 1
        && card.left >= -1 && card.right <= state.innerWidth + 1
        && card.top >= -1 && card.bottom <= state.innerHeight + 1;
    check(`${label}：尾頁單卡喺自己頁框度雙軸置中、冇爆出畫面`,
        state.activeCount === 1 && centred && sane, { card, page, centred, sane });
};

/** 三套之間嘅分別：四個維度入面至少要有三個唔同，而且冇兩套完全一樣。 */
const checkDistinct = (label, sigs) => {
    const keys = ['item', 'media', 'nav', 'selector'];
    const 全同 = keys.filter((k) => new Set(THEMES.map((t) => sigs[t][k])).size === 1);
    const 撞晒 = [];
    for (let i = 0; i < THEMES.length; i++) {
        for (let j = i + 1; j < THEMES.length; j++) {
            const a = sigs[THEMES[i]], b = sigs[THEMES[j]];
            if (keys.every((k) => a[k] === b[k])) 撞晒.push(`${THEMES[i]}=${THEMES[j]}`);
        }
    }
    check(`${label}：三套 theme 嘅 item／媒介／導航／selector 唔可以四樣都一樣`,
        撞晒.length === 0, { 撞晒, sigs });
    check(`${label}：四個維度入面至少三個真係分到三套（唔可以淨係換色）`,
        全同.length <= 1, { 全部一樣嘅維度: 全同, sigs });
    check(`${label}：三套嘅 item archetype 各自唔同`,
        new Set(THEMES.map((t) => sigs[t].item)).size === 3,
        Object.fromEntries(THEMES.map((t) => [t, sigs[t].item])));
    check(`${label}：三套嘅媒介處理各自唔同（包括「完全冇縮圖」呢個答案）`,
        new Set(THEMES.map((t) => sigs[t].media)).size === 3,
        Object.fromEntries(THEMES.map((t) => [t, sigs[t].media])));
};



const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'],
});

try {
    for (const viewport of VIEWPORTS) {
        const phone = viewport.width < 760;
        const label = `${viewport.width}×${viewport.height}`;
        const context = await browser.newContext({
            viewport, deviceScaleFactor: 1, isMobile: phone, hasTouch: true,
        });
        const page = await context.newPage();
        const errors = [];
        const external = [];
        const httpErrors = [];
        page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(`console: ${message.text()}`);
        });
        page.on('request', (request) => {
            const url = request.url();
            if (!url.startsWith(ORIGIN) && !url.startsWith('data:') && !url.startsWith('blob:')) {
                external.push(url);
            }
        });
        page.on('response', (response) => {
            if (response.url().startsWith(ORIGIN) && response.status() >= 400) {
                httpErrors.push(`${response.status()} ${response.url()}`);
            }
        });

        let loaded = false;
        try {
            await page.goto(INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await waitForTheme(page, 'neon-grid');
            await page.waitForTimeout(300);
            loaded = true;
        } catch (error) {
            check(`${label}：Hub theme UI boot`, false, String(error).split('\n')[0]);
        }
        if (loaded) {
            await selectTheme(page, 'neon-grid');
            let state = await snapshot(page);
            checkRoster(`${label} / neon-grid`, state);
            checkThemeState(`${label} / neon-grid`, state, 'neon-grid');
            const sigs = {};
            sigs['neon-grid'] = checkShape(`${label} / neon-grid`, state, 'neon-grid');
            check(`${label} / neon-grid：theme storage key 正確`,
                await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE) === 'neon-grid',
            await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE));

            for (const theme of THEMES.slice(1)) {
                await selectTheme(page, theme);
                state = await snapshot(page);
                checkThemeState(`${label} / ${theme}`, state, theme);
                sigs[theme] = checkShape(`${label} / ${theme}`, state, theme);
                check(`${label} / ${theme}：theme storage key 正確`,
                    await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE) === theme,
                await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE));
            }

            checkDistinct(label, sigs);

            // Changing theme must not silently reset the carousel page or links.
            await page.locator('.carousel-dot[data-page="0"]').click();
            await page.waitForTimeout(450);
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(450);
            const beforeSwitch = await snapshot(page);
            for (const theme of THEMES) {
                await selectTheme(page, theme);
                const afterSwitch = await snapshot(page);
                check(`${label} / ${theme}：換 theme 唔改 current page/link`,
                    afterSwitch.currentPage === beforeSwitch.currentPage
                    && afterSwitch.activeIds.join(',') === beforeSwitch.activeIds.join(',')
                    && afterSwitch.hrefs.join('|') === beforeSwitch.hrefs.join('|'),
                { before: { page: beforeSwitch.currentPage, ids: beforeSwitch.activeIds },
                    after: { page: afterSwitch.currentPage, ids: afterSwitch.activeIds } });
            }

            // The final page is a real single-card page, not a duplicated fourth card.
            await page.locator('.carousel-dot[data-page="3"]').click();
            await page.waitForTimeout(450);
            for (const theme of THEMES) {
                await selectTheme(page, theme);
                checkTail(`${label} / ${theme}`, await snapshot(page));
            }

            // Native keyboard focus and ArrowRight behaviour.
            const focus = await page.evaluate(() => [...document.querySelectorAll('[data-theme-value]')]
                .map((button) => {
                    button.focus();
                    return {
                        value: button.getAttribute('data-theme-value'),
                        tag: button.tagName,
                        focused: document.activeElement === button,
                        tabIndex: button.tabIndex,
                    };
                }));
            check(`${label}：keyboard 可以 focus 三個 native theme buttons`,
                focus.length === 3 && focus.every((item) => item.tag === 'BUTTON'
                    && item.focused && item.tabIndex >= 0), focus);
            await page.locator('[data-theme-value="editorial-arcade"]').focus();
            await page.keyboard.press('Space');
            await waitForTheme(page, 'editorial-arcade');
            check(`${label}：keyboard Space 可以切換 theme button`,
                (await snapshot(page)).pressed.join(',') === 'editorial-arcade');
            await page.locator('.carousel-dot[data-page="0"]').click();
            await page.waitForTimeout(450);
            await page.keyboard.press('ArrowRight');
            await page.waitForTimeout(450);
            const keyboardPage = await snapshot(page);
            check(`${label}：ArrowRight 仍然換到下一頁`, keyboardPage.currentPage === 1, keyboardPage);

            if (phone) {
                await page.locator('.carousel-dot[data-page="0"]').click();
                await page.waitForTimeout(450);
                await dispatchSwipe(page, -190);
                await page.waitForTimeout(450);
                const swiped = await snapshot(page);
                check(`${label}：swipe 左仍然換頁`, swiped.currentPage === 1, swiped);
                const cancelled = await dispatchCancelledSwipe(page);
                check(`${label}：touchcancel 後遲到 touchend 唔會誤換頁`, cancelled === 1, cancelled);
            }

            // Reload must retain the selected theme, while carousel state may reset.
            await selectTheme(page, 'command-deck');
            await page.reload({ waitUntil: 'domcontentloaded' });
            await waitForTheme(page, 'command-deck');
            const reloaded = await snapshot(page);
            check(`${label}：reload persistence 保留 command-deck`,
                reloaded.attrs.every((value) => value === 'command-deck')
                && reloaded.pressed.length === 1 && reloaded.pressed[0] === 'command-deck'
                && await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE) === 'command-deck',
            { attrs: reloaded.attrs, pressed: reloaded.pressed,
                storage: await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE) });
        }
        check(`${label}：zero console/page errors、local HTTP errors、external requests`,
            errors.length === 0 && httpErrors.length === 0 && external.length === 0,
        { errors: errors.slice(0, 4), httpErrors: httpErrors.slice(0, 4), external: external.slice(0, 4) });
        await context.close();
    }

    // A blocked-storage context must still boot and allow theme switching. It need
    // not persist; this only proves storage failure is not a render dependency.
    const blockedContext = await browser.newContext({
        viewport: { width: 375, height: 667 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    });
    await blockedContext.addInitScript({ content: blockedStorage });
    const blockedPage = await blockedContext.newPage();
    const blockedErrors = [];
    const blockedExternal = [];
    blockedPage.on('pageerror', (error) => blockedErrors.push(`pageerror: ${error.message}`));
    blockedPage.on('console', (message) => {
        if (message.type() === 'error') blockedErrors.push(`console: ${message.text()}`);
    });
    blockedPage.on('request', (request) => {
        const url = request.url();
        if (!url.startsWith(ORIGIN) && !url.startsWith('data:') && !url.startsWith('blob:')) {
            blockedExternal.push(url);
        }
    });
    try {
        await blockedPage.goto(INDEX, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitForTheme(blockedPage, 'neon-grid');
        for (const theme of THEMES) {
            await selectTheme(blockedPage, theme);
            const state = await snapshot(blockedPage);
            check(`blocked localStorage / ${theme}：UI boot 及切 theme 無 error`,
                state.pressed.length === 1 && state.pressed[0] === theme
                && state.attrs.every((value) => value === theme),
            { attrs: state.attrs, pressed: state.pressed });
        }
    } catch (error) {
        check('blocked localStorage：UI boot 及切 theme 無 error', false,
            String(error).split('\n')[0]);
    }
    check('blocked localStorage：zero console/page errors、external requests',
        blockedErrors.length === 0 && blockedExternal.length === 0,
    { errors: blockedErrors.slice(0, 4), external: blockedExternal.slice(0, 4) });
    await blockedContext.close();
} finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
}

console.log(`\nHub themes: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log(`FAILURES: ${failed.join('; ')}`);
process.exit(fail === 0 ? 0 : 1);
