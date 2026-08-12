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
    const activeCards = active ? [...active.querySelectorAll('.game-hub-card')] : [];
    const allCards = [...document.querySelectorAll('.game-hub-card')];
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
    return {
        themeValues, pressed, attrs,
        currentPage: Number(track?.dataset.currentPage ?? NaN),
        pageCount: pages.length,
        pageSizes: pages.map((p) => p.querySelectorAll('.game-hub-card').length),
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

const checkNeon = (label, state, phone) => {
    const xs = state.cardRects.map((r) => r.cx);
    const ys = state.cardRects.map((r) => r.cy);
    const columns = clusterCount(xs);
    const rows = clusterCount(ys);
    const expected = phone ? { columns: 2, rows: 2 } : { columns: 4, rows: 1 };
    check(`${label}：neon-grid ${phone ? '手機 2×2' : 'desktop 4 columns'}`,
        state.activeCount === 4 && columns === expected.columns && rows === expected.rows,
    { columns, rows, expected });
};

const checkEditorial = (label, state, phone) => {
    const [feature, ...rail] = state.cardRects;
    const railWidths = rail.map((r) => r.width);
    const railHeights = rail.map((r) => r.height);
    const railX = rail.map((r) => r.cx);
    const railY = rail.map((r) => r.cy);
    const near = (values, ratio = 1.35) => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        return min > 0 && max / min <= ratio;
    };
    const increasing = railY.every((value, i) => i === 0 || value > railY[i - 1] + 2);
    const sideRail = !phone && feature && rail[0]
        && feature.right <= Math.min(...rail.map((r) => r.left)) + 3
        && near(railX, 10);
    const stackedRail = phone && feature && rail[0]
        && feature.bottom <= rail[0].top + 3;
    check(`${label}：editorial first feature 面積明顯大過 rail`,
        !!feature && rail.length === 3 && feature.area / Math.max(1, rail[0].area) >= (phone ? 1.2 : 1.6),
    { feature: feature?.area, rail: rail.map((r) => r.area) });
    check(`${label}：editorial 三張 compact rail 尺寸近似且順序向下`,
        rail.length === 3 && near(railWidths) && near(railHeights) && increasing
        && (phone ? stackedRail : sideRail),
    { railWidths, railHeights, railX, railY, phone, sideRail, stackedRail });
};

const checkCommand = (label, state) => {
    const rows = state.cardRects;
    const x = rows.map((r) => r.cx);
    const widths = rows.map((r) => r.width);
    const heights = rows.map((r) => r.height);
    const y = rows.map((r) => r.cy);
    const pageWidth = state.pageRect?.width ?? 0;
    const increasing = y.every((value, i) => i === 0 || value > y[i - 1] + 2);
    const near = (values, ratio) => Math.max(...values) / Math.max(1, Math.min(...values)) <= ratio;
    check(`${label}：command-deck 係四條垂直 row，唔係 grid`,
        rows.length === 4 && state.pageDisplay !== 'grid'
        && increasing && Math.max(...x) - Math.min(...x) <= 6
        && near(widths, 1.2) && near(heights, 1.35)
        && pageWidth > 0 && Math.min(...widths) / pageWidth >= 0.72
        && state.commandChromeOverlap.length === 0,
    { pageDisplay: state.pageDisplay, pageGridColumns: state.pageGridColumns,
        x, y, widths, heights, pageWidth, commandChromeOverlap: state.commandChromeOverlap });
};

const checkTail = (label, state, theme) => {
    const card = state.cardRects[0];
    const page = state.pageRect;
    const centred = !!card && !!page
        && Math.abs(card.cx - page.cx) <= 6 && Math.abs(card.cy - page.cy) <= 6;
    const sane = !!card && !!page && card.width >= 80 && card.height >= 80
        && card.width <= page.width * 0.99 && card.height <= page.height * 0.98
        && (theme !== 'command-deck'
            || (card.height <= 160 && card.width >= page.width * 0.6))
        && card.left >= -1 && card.right <= state.innerWidth + 1;
    check(`${label}：尾頁單卡雙軸自然置中、尺寸合理`,
        state.activeCount === 1 && centred && sane,
    { card, page, centred, sane });
};

const checkLayout = (label, state, theme, phone) => {
    if (theme === 'neon-grid') checkNeon(label, state, phone);
    else if (theme === 'editorial-arcade') checkEditorial(label, state, phone);
    else checkCommand(label, state);
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
            checkLayout(`${label} / neon-grid`, state, 'neon-grid', phone);
            check(`${label} / neon-grid：theme storage key 正確`,
                await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE) === 'neon-grid',
            await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE));

            for (const theme of THEMES.slice(1)) {
                await selectTheme(page, theme);
                state = await snapshot(page);
                checkThemeState(`${label} / ${theme}`, state, theme);
                checkLayout(`${label} / ${theme}`, state, theme, phone);
                check(`${label} / ${theme}：theme storage key 正確`,
                    await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE) === theme,
                await page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE));
            }

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
                checkTail(`${label} / ${theme}`, await snapshot(page), theme);
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
