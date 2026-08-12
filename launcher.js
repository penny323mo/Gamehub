
if (!globalThis.GameCatalog) {
    throw new Error('GameCatalog 未載入；請先執行 node scripts/build-game-catalog.mjs');
}

/*
 * Hub launcher：一份資料，三套介面語言。
 *
 * 上一版係「一個萬能 `.game-hub-card`，再靠 `data-theme-role` 換 class」。
 * ADR-312 判咗嗰個唔算 theme——三套嘢由頭到尾用同一個 header、同一個縮圖
 * 處理、同一個圓角卡輪廓，換嘅只係顏色同排列。
 *
 * 而家嘅分工係：
 *
 *   共用（ADR-312 明文可以共用）：`games/manifest.json` 出嚟嘅 catalog、
 *   game href、theme 存檔、分頁語意（4/4/4/1、prev/next/dot、鍵盤、swipe）、
 *   focus／touch 可存取性、error budget。
 *
 *   唔共用：app shell、masthead、theme selector 擺喺邊、pagination 嘅形態同
 *   位置、縮圖／媒介嘅比例同角色、game item 嘅 DOM archetype 同資訊層級。
 *
 * 所以下面每套 theme 有自己嘅 `shell()`（砌成個殼）同 `item()`（砌一個入口）,
 * 兩者都唔會 fallback 去一個共用 card。把尺要查嘅穩定契約只有三樣：
 * 最外層 launch anchor、`data-game-id`、同埋 href。
 */

const catalog = globalThis.GameCatalog;
const games = catalog.launcherEntries();
// `list()` 有 capabilities／runtime／persistence，Command Deck 靠佢畫 schematic
// 同狀態 glyph——嗰套 theme 特登冇傳統縮圖（§5.5 容許嘅 no-thumbnail proof）。
const byId = new Map(catalog.list().map((game) => [game.id, game]));

const PAGE_SIZE = 4;
const THEME_STORAGE_KEY = 'gamehub-theme-v1';
const THEMES = Object.freeze(['neon-grid', 'editorial-arcade', 'command-deck']);
const THEME_LABEL = Object.freeze({
    'neon-grid': 'Neon',
    'editorial-arcade': 'Editorial',
    'command-deck': 'Command',
});
const THEME_ARIA = Object.freeze({
    'neon-grid': 'Use Neon Grid theme',
    'editorial-arcade': 'Use Editorial Arcade theme',
    'command-deck': 'Use Command Deck theme',
});

let currentPage = 0;
let currentTheme = 'neon-grid';

// ---------- 小工具 ----------

const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
};

const pagesOfGames = () => {
    const pages = [];
    for (let i = 0; i < games.length; i += PAGE_SIZE) pages.push(games.slice(i, i + PAGE_SIZE));
    return pages;
};

// 一個封咗 localStorage 嘅 getter 同封咗 setItem 一樣常見（無痕／企業 policy）。
// theme 揀選由頭到尾都係加分項：兩邊都唔可以令 catalog render 唔到。
function withStorage(operation) {
    try {
        return operation(globalThis.localStorage);
    } catch {
        return undefined;
    }
}

const readStoredTheme = () => {
    const stored = withStorage((storage) => storage?.getItem(THEME_STORAGE_KEY));
    return THEMES.includes(stored) ? stored : 'neon-grid';
};

const persistTheme = (theme) => withStorage((storage) => storage?.setItem(THEME_STORAGE_KEY, theme));

/**
 * 圖像：兩個卡片 logo 原本係 640×640（498K）同 1024×1024（349K），縮到 160×160
 * 之後 WebP 得 10K。用 `<picture>` 保住原圖，唔會 fallback 去一個唔啱嘅 emoji;
 * 真係載入失敗先至換字。（呢段係 ADR-206 嘅結論，三套 theme 都要用返。）
 */
function artNode(game, className) {
    if (game.id === 'gomoku') {
        const wrap = el('span', `${className} art-stones`);
        wrap.append(el('i', 'stone black'), el('i', 'stone white'));
        return wrap;
    }
    if (!game.isImage) return el('span', `${className} art-glyph`, game.icon);
    const picture = document.createElement('picture');
    picture.className = `${className} art-photo`;
    if (game.iconWebp) {
        const source = document.createElement('source');
        source.srcset = game.iconWebp;
        source.type = 'image/webp';
        picture.append(source);
    }
    const img = document.createElement('img');
    img.src = game.icon;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.addEventListener('error', () => {
        img.remove();
        picture.textContent = '🀄';
    }, { once: true });
    picture.append(img);
    return picture;
}

/** 三套 theme 共用嘅唯一 anchor 契約：`data-game-id` ＋ 真 href ＋ 鎖唔玩得嘅。 */
function launchAnchor(game, className) {
    const a = el('a', className);
    a.dataset.gameId = game.id;
    a.href = game.playable ? game.link : '#';
    if (!game.playable) {
        a.classList.add('is-locked');
        a.setAttribute('aria-disabled', 'true');
        a.tabIndex = -1;
    }
    return a;
}

/** theme 掣本體共用，但**擺喺邊、砌成點**由每套 shell 自己決定。 */
function themeButton(theme, extraClass) {
    const button = el('button', extraClass, THEME_LABEL[theme]);
    button.type = 'button';
    button.dataset.themeValue = theme;
    button.setAttribute('aria-label', THEME_ARIA[theme]);
    button.setAttribute('aria-pressed', String(theme === currentTheme));
    return button;
}

/*
 * Theme 揀選係一個**偏好設定**，唔係內容。
 *
 * 第一版三粒掣直接攤喺頭版，佔咗一大截同十三隻遊戲爭注意力——一個你一世
 * 可能只撳一次嘅嘢，唔應該同主角平起平坐。所以收埋做一粒細掣，撳先展開。
 *
 * 收埋唔等於收起：三粒 `[data-theme-value]` 一直喺 DOM 度，展開之後仍然係
 * 44px 嘅 native button、仍然 Tab 到、Space 撳得郁。**「見唔到」同「用唔到」
 * 係兩件事**——呢度只係將佢由「一直見到」改成「撳一下就見到」。
 *
 * 每套 theme 自己決定粒掣同塊面板長成點、擺喺邊（`容器類`／`掣類`／`板類`）。
 */
function themeMenu({ 容器類, 掣類, 板類, 掣文 }) {
    const wrap = el('div', 容器類);
    wrap.dataset.themeMenu = '';

    const toggle = el('button', 掣類, 掣文(THEME_LABEL[currentTheme]));
    toggle.type = 'button';
    toggle.dataset.themeMenuToggle = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', `外觀：${THEME_LABEL[currentTheme]}（撳一下換）`);

    const panel = el('div', `${板類} is-collapsed`);
    panel.dataset.themeMenuPanel = '';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'Hub theme');
    THEMES.forEach((theme) => panel.append(themeButton(theme, `theme-option ${板類}-item`)));

    const 開關 = (開) => {
        panel.classList.toggle('is-collapsed', !開);
        toggle.setAttribute('aria-expanded', String(開));
    };
    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        開關(panel.classList.contains('is-collapsed'));
    });
    // 撳出面／禁 Esc 都要收返。一塊收唔返嘅面板同一直攤開冇分別。
    document.addEventListener('click', (event) => {
        if (!wrap.contains(event.target)) 開關(false);
    });
    wrap.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { 開關(false); toggle.focus(); }
    });

    wrap.append(toggle, panel);
    return wrap;
}

/** 分頁機制共用（prev/next/dot 嘅語意），外觀同位置由 shell 決定。 */
function navButton(direction, className, glyph, label) {
    const button = el('button', `nav-btn ${direction}-btn ${className}`, glyph);
    button.type = 'button';
    button.dataset.hubNav = direction;
    button.setAttribute('aria-label', label);
    return button;
}

function dotsNode(className, dotClass, labelOf) {
    const wrap = el('div', className);
    wrap.setAttribute('aria-label', '遊戲分頁');
    pagesOfGames().forEach((_, index) => {
        const dot = el('button', `carousel-dot ${dotClass}`, labelOf ? labelOf(index) : '');
        dot.type = 'button';
        dot.dataset.page = String(index);
        dot.setAttribute('aria-label', `前往第 ${index + 1} 組遊戲`);
        wrap.append(dot);
    });
    return wrap;
}

/**
 * 一條頁軌 = 四版，每版四個（最後一版一個）。
 *
 * 呢個係**機制**唔係外觀：三套 theme 都用同一條軌去做「一次見一版」，但每套
 * 自己決定條軌擺喺個殼邊個位、四周有咩、同埋一版入面點排。
 */
function trackNode(theme, renderItem) {
    const container = el('div', 'carousel-track-container');
    container.setAttribute('aria-live', 'polite');
    const track = el('ul', 'carousel-track');
    track.id = 'game-carousel';
    pagesOfGames().forEach((pageGames, pageIndex) => {
        const page = el('li', `game-page page-${theme}`);
        page.dataset.page = String(pageIndex);
        page.dataset.count = String(pageGames.length);
        page.setAttribute('aria-label', `第 ${pageIndex + 1} 組遊戲`);
        pageGames.forEach((game, indexOnPage) => {
            page.append(renderItem(game, indexOnPage, pageIndex));
        });
        track.append(page);
    });
    container.append(track);
    return container;
}

// ---------- Theme 1：Neon Grid —— 街機牆 ----------
//
// 形態：一幅機台牆。招牌（marquee）喺最頂發光，theme 掣做三個投幣掣擺喺招牌
// 右邊，底部一條機台控制條放箭咀同分頁燈。
//
// Item archetype：**街機櫃**——上面一條招牌寫遊戲名，中間一個 4:3 CRT 螢幕窗
// 放主視覺（有掃描線），下面一塊機身寫類型同「PRESS START」。冇 Play 藥丸,
// 成個機台就係入口。冇副標題：一幅機台牆係用嚟掃視嘅，唔係用嚟讀嘅。

function neonItem(game) {
    const a = launchAnchor(game, 'ng-cab');
    const marquee = el('span', 'ng-cab-marquee');
    marquee.append(el('strong', 'ng-cab-title', game.title));
    const screen = el('span', 'ng-cab-screen');
    screen.setAttribute('aria-hidden', 'true');
    screen.append(artNode(game, 'ng-cab-art'), el('span', 'ng-cab-scan'));
    const bezel = el('span', 'ng-cab-bezel');
    bezel.append(
        el('span', 'ng-cab-genre', game.category),
        el('span', 'ng-cab-start', game.playable ? 'PRESS START' : 'OUT OF ORDER'),
    );
    a.append(marquee, screen, bezel);
    return a;
}

function neonShell() {
    const root = el('div', 'ng-wall');
    const marquee = el('header', 'ng-marquee');
    const sign = el('div', 'ng-sign');
    sign.append(el('span', 'ng-sign-text', 'GAME HUB'), el('span', 'ng-sign-bulbs'));
    // 機舖：一粒投幣掣，撳落去先彈出三個選擇。
    marquee.append(sign, themeMenu({
        容器類: 'ng-coinslot', 掣類: 'ng-coin-toggle', 板類: 'ng-coinpanel',
        掣文: (名) => `⊙ ${名}`,
    }));

    const floor = el('div', 'ng-floor');
    floor.append(trackNode('neon-grid', neonItem));

    const rail = el('div', 'ng-rail');
    rail.append(
        navButton('prev', 'ng-stick', '◀', '上一組遊戲'),
        dotsNode('carousel-dots ng-lights', 'ng-light'),
        el('span', 'carousel-status ng-credits'),
        navButton('next', 'ng-stick', '▶', '下一組遊戲'),
    );

    root.append(marquee, floor, rail);
    return root;
}

// ---------- Theme 2：Editorial Arcade —— 雜誌 ----------
//
// 形態：雜誌報頭（issue line、serif 字標、strapline），theme 掣做報頭下面嘅
// 「版面」目錄，頁腳係 folio（"continued on p.N"）。
//
// **一套 theme 兩種 item archetype**：頭條係封面圖＋kicker／headline／standfirst
// ＋一行 read-on；其餘三個係**冇縮圖**嘅編號索引行，靠橫線分隔、右邊一個頁碼。
// 呢個對比本身就係嗰套視覺語言——唔係將同一張卡縮細。

function editorialLead(game, indexOnPage, pageIndex) {
    const a = launchAnchor(game, 'ed-lead');
    const cover = el('figure', 'ed-cover');
    cover.setAttribute('aria-hidden', 'true');
    cover.append(artNode(game, 'ed-cover-art'));
    const body = el('span', 'ed-lead-body');
    body.append(
        el('span', 'ed-kicker', game.category),
        el('span', 'ed-headline', game.title),
        el('span', 'ed-standfirst', game.subtitle),
        el('span', 'ed-readon', game.playable ? 'Read the feature →' : 'Not in this issue'),
    );
    a.append(cover, body);
    a.dataset.folio = String(pageIndex * PAGE_SIZE + indexOnPage + 1).padStart(2, '0');
    return a;
}

function editorialEntry(game, indexOnPage, pageIndex) {
    const a = launchAnchor(game, 'ed-entry');
    const number = String(pageIndex * PAGE_SIZE + indexOnPage + 1).padStart(2, '0');
    const body = el('span', 'ed-entry-body');
    body.append(
        el('span', 'ed-entry-kicker', game.category),
        el('span', 'ed-entry-title', game.title),
        el('span', 'ed-entry-note', game.subtitle),
    );
    a.append(el('span', 'ed-entry-no', number), body, el('span', 'ed-entry-folio', `p.${number}`));
    return a;
}

function editorialShell() {
    const root = el('article', 'ed-issue');
    const masthead = el('header', 'ed-masthead');
    masthead.append(
        el('p', 'ed-issueline', 'ISSUE 13 · THE ARCADE ANNUAL'),
        el('h1', 'ed-wordmark', 'Game Hub'),
        el('p', 'ed-strap', 'vibe coding by penny323'),
    );
    // 雜誌：報頭角落一行細字「Edition ▾」，同 issue line 同一個層級。
    masthead.append(themeMenu({
        容器類: 'ed-sections', 掣類: 'ed-edition', 板類: 'ed-editions',
        掣文: (名) => `${名} edition ▾`,
    }));

    const spread = el('div', 'ed-spread');
    spread.append(trackNode('editorial-arcade', (game, indexOnPage, pageIndex) => (
        indexOnPage === 0
            ? editorialLead(game, indexOnPage, pageIndex)
            : editorialEntry(game, indexOnPage, pageIndex)
    )));

    const folio = el('footer', 'ed-folio');
    folio.append(
        navButton('prev', 'ed-turn', '‹ Previous spread', '上一組遊戲'),
        dotsNode('carousel-dots ed-pagenos', 'ed-pageno', (index) => String(index + 1)),
        el('span', 'carousel-status ed-folio-count'),
        navButton('next', 'ed-turn', 'Next spread ›', '下一組遊戲'),
    );

    root.append(masthead, spread, folio);
    return root;
}

// ---------- Theme 3：Command Deck —— 調度台 ----------
//
// 形態：左邊一條直立 system rail（識別碼、theme 掣做 console 鍵、上下頁掣），
// 右邊上面一條 status bar，中間 dispatch workspace，底部一行 sector 指示燈。
//
// Item archetype：**dispatch row**，而且**完全冇縮圖**——呢個係 §5.5 容許嘅
// 「明確 no-thumbnail proof」。視覺資訊由 capabilities 直接畫成一條 schematic
// 條形圖同狀態 glyph：一部調度台唔會擺遊戲封面，佢擺嘅係讀數。

const CAP_BARS = [
    ['online', '連線'],
    ['continue', '續局'],
    ['audio', '音效'],
    ['profile', '檔案'],
    ['touch', '觸控'],
    ['keyboard', '鍵盤'],
];

function commandRow(game, indexOnPage, pageIndex) {
    const a = launchAnchor(game, 'cd-row');
    const record = byId.get(game.id);
    const caps = record?.capabilities ?? {};
    const serial = String(pageIndex * PAGE_SIZE + indexOnPage + 1).padStart(2, '0');

    a.append(el('span', 'cd-desig', `UNIT-${serial}`));

    // Schematic：六條讀數，開嘅高、閂嘅矮。冇圖片、冇 emoji——純粹係狀態。
    const schematic = el('span', 'cd-schem');
    schematic.setAttribute('aria-hidden', 'true');
    CAP_BARS.forEach(([key]) => {
        const bar = el('i', caps[key] ? 'on' : 'off');
        bar.style.setProperty('--h', caps[key] ? '1' : '0.28');
        schematic.append(bar);
    });
    a.append(schematic);

    const id = el('span', 'cd-id');
    id.append(el('b', 'cd-callsign', game.title), el('span', 'cd-brief', game.subtitle));
    a.append(id);

    const flags = el('span', 'cd-flags');
    const on = CAP_BARS.filter(([key]) => caps[key]).map(([, label]) => label);
    flags.textContent = on.length ? on.join(' · ') : '基本模組';
    a.append(flags, el('span', 'cd-sector', game.category));
    a.append(el('span', 'cd-dispatch', game.playable ? 'DISPATCH ▸' : 'LOCKED'));
    return a;
}

function commandShell() {
    const root = el('div', 'cd-console');

    const rail = el('aside', 'cd-rail');
    rail.append(el('span', 'cd-sigil', 'GH'));
    // 調度台：rail 上面一粒模式鍵，彈出三個模式。
    rail.append(themeMenu({
        容器類: 'cd-keys', 掣類: 'cd-modekey', 板類: 'cd-modes',
        掣文: () => 'MODE',
    }));
    const railNav = el('div', 'cd-railnav');
    railNav.append(
        navButton('prev', 'cd-step', '▲', '上一組遊戲'),
        navButton('next', 'cd-step', '▼', '下一組遊戲'),
    );
    rail.append(railNav);

    const main = el('div', 'cd-main');
    const status = el('div', 'cd-statusbar');
    const online = catalog.list().filter((game) => game.capabilities?.online).length;
    const resumable = catalog.list().filter((game) => game.capabilities?.continue).length;
    status.append(
        el('span', 'cd-stat', `UNITS ${games.length}`),
        el('span', 'cd-stat', `NET ${online}`),
        el('span', 'cd-stat', `RESUME ${resumable}`),
        el('span', 'carousel-status cd-sectorno'),
    );
    const workspace = el('div', 'cd-workspace');
    workspace.append(trackNode('command-deck', commandRow));
    const ticker = el('div', 'cd-ticker');
    ticker.append(dotsNode('carousel-dots cd-lamps', 'cd-lamp'));
    main.append(status, workspace, ticker);

    root.append(rail, main);
    return root;
}

const SHELLS = Object.freeze({
    'neon-grid': neonShell,
    'editorial-arcade': editorialShell,
    'command-deck': commandShell,
});

// ---------- 共用行為 ----------

function wireShell() {
    document.querySelectorAll('[data-theme-value]').forEach((button) => {
        button.addEventListener('click', () => applyTheme(button.dataset.themeValue, { 從掣度撳: true }));
    });
    document.querySelectorAll('[data-hub-nav]').forEach((button) => {
        button.addEventListener('click', () => {
            currentPage += button.dataset.hubNav === 'next' ? 1 : -1;
            updateCarousel();
        });
    });
    document.querySelectorAll('.carousel-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
            currentPage = Number(dot.dataset.page);
            updateCarousel();
        });
    });
    const container = document.querySelector('.carousel-track-container');
    if (container) {
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });
        container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    }
}

function renderHub() {
    const root = document.getElementById('app-hub');
    if (!root) return;
    root.textContent = '';
    root.dataset.hubTheme = currentTheme;
    root.dataset.theme = currentTheme;
    root.append(SHELLS[currentTheme]());
    wireShell();
    updateCarousel();
}

function applyTheme(theme, { persist = true, 從掣度撳 = false } = {}) {
    currentTheme = THEMES.includes(theme) ? theme : 'neon-grid';
    // 兩個名都寫：`data-hub-theme` 係明文契約，`data-theme` 方便一般 UI 工具。
    [document.documentElement, document.body].forEach((target) => {
        target.dataset.hubTheme = currentTheme;
        target.dataset.theme = currentTheme;
    });
    renderHub();
    // 重新砌完個殼，本來嗰粒掣已經唔存在。鍵盤玩家換完 theme 唔應該
    // 畀人掉返去 document 開頭。
    if (從掣度撳) document.querySelector('[data-theme-menu-toggle]')?.focus();
    document.querySelectorAll('[data-theme-value]').forEach((button) => {
        const active = button.dataset.themeValue === currentTheme;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('active', active);
    });
    if (persist) persistTheme(currentTheme);
}

function updateCarousel() {
    const track = document.getElementById('game-carousel');
    const pages = [...document.querySelectorAll('.game-page')];
    if (!track || pages.length === 0) return;

    currentPage = (currentPage + pages.length) % pages.length;
    track.style.transform = `translateX(-${currentPage * 100}%)`;
    track.dataset.currentPage = String(currentPage);

    pages.forEach((page, index) => {
        const active = index === currentPage;
        page.classList.toggle('active-page', active);
        page.setAttribute('aria-hidden', String(!active));
        // 收埋咗嗰版唔可以留喺 tab 次序入面——鍵盤玩家會 tab 入一版睇唔到嘅嘢。
        page.querySelectorAll('a').forEach((link) => {
            link.tabIndex = active && link.getAttribute('aria-disabled') !== 'true' ? 0 : -1;
        });
    });

    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        const active = index === currentPage;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
    document.querySelectorAll('.carousel-status').forEach((status) => {
        status.textContent = `${currentPage + 1} / ${pages.length}`;
    });
}

function nextGame() {
    currentPage += 1;
    updateCarousel();
}

function prevGame() {
    currentPage -= 1;
    updateCarousel();
}

// ---------- 觸控 ----------

let touchStartX = 0;
let touchEndX = 0;
let swipeTouchId = null;

function resetSwipe() {
    touchStartX = 0;
    touchEndX = 0;
    swipeTouchId = null;
}

function handleTouchStart(e) {
    // 只追蹤一隻手指。第二隻手指／系統手勢唔應該接管第一隻手指嘅起點，
    // 否則 pinch 或 WebView gesture 之後會誤跳頁。
    if (swipeTouchId !== null || e.touches?.length > 1) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    swipeTouchId = touch.identifier;
    touchStartX = touch.screenX;
    touchEndX = touchStartX;
}

function handleTouchEnd(e) {
    if (swipeTouchId === null) return;
    const touch = [...e.changedTouches].find(({ identifier }) => identifier === swipeTouchId);
    if (!touch) return;
    touchEndX = touch.screenX;
    handleSwipe();
    resetSwipe();
}

function handleTouchCancel(e) {
    if (swipeTouchId === null) return;
    const cancelled = [...(e.changedTouches ?? [])]
        .some(({ identifier }) => identifier === swipeTouchId);
    if (cancelled) resetSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) nextGame();
        else prevGame();
    }
}

function initHub() {
    applyTheme(readStoredTheme(), { persist: false });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') prevGame();
        if (event.key === 'ArrowRight') nextGame();
    });
}

// 唔等外置字型 load 完先出遊戲卡；慢網絡之下主頁都要即刻可用。
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHub, { once: true });
} else {
    initHub();
}
