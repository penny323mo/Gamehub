
if (!globalThis.GameCatalog) {
    throw new Error('GameCatalog 未載入；請先執行 node scripts/build-game-catalog.mjs');
}

// `games/manifest.json` is the only game-roster authority.  The generated
// browser adapter keeps this launcher synchronous, static-host friendly, and
// free of a second fetch/error state.
const games = globalThis.GameCatalog.launcherEntries();

const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const PAGE_SIZE = 4;
const THEME_STORAGE_KEY = 'gamehub-theme-v1';
const THEMES = Object.freeze(['neon-grid', 'editorial-arcade', 'command-deck']);
let currentPage = 0;
let currentTheme = 'neon-grid';

// A blocked localStorage getter is as common as a blocked setItem in private
// browsing. Keep the theme picker an enhancement: neither operation may stop
// the catalog from rendering or the carousel from receiving input.
function withStorage(operation) {
    try {
        return operation(globalThis.localStorage);
    } catch (error) {
        return undefined;
    }
}

function readStoredTheme() {
    const stored = withStorage((storage) => storage?.getItem(THEME_STORAGE_KEY));
    return THEMES.includes(stored) ? stored : 'neon-grid';
}

function persistTheme(theme) {
    withStorage((storage) => {
        storage?.setItem(THEME_STORAGE_KEY, theme);
    });
}

function themeRole(theme, index) {
    if (theme === 'editorial-arcade') return index === 0 ? 'feature' : 'rail';
    if (theme === 'command-deck') return 'command';
    return 'grid';
}

function updateThemeLayout() {
    document.querySelectorAll('.game-page').forEach((page) => {
        page.dataset.themeLayout = currentTheme === 'editorial-arcade'
            ? 'editorial-feature-rail'
            : currentTheme === 'command-deck'
                ? 'command-queue'
                : 'neon-grid';
        page.classList.toggle('theme-editorial-page', currentTheme === 'editorial-arcade');
        page.classList.toggle('theme-command-page', currentTheme === 'command-deck');

        page.querySelectorAll('.game-hub-card').forEach((card, index) => {
            const role = themeRole(currentTheme, index);
            card.dataset.themeRole = role;
            card.classList.toggle('theme-feature', role === 'feature');
            card.classList.toggle('theme-rail', role === 'rail');
            card.classList.toggle('theme-command-row', role === 'command');
        });
    });
}

function applyTheme(theme, { persist = true } = {}) {
    currentTheme = THEMES.includes(theme) ? theme : 'neon-grid';
    const targets = [document.documentElement, document.body, document.getElementById('app-hub')]
        .filter(Boolean);
    targets.forEach((target) => {
        // Keep both names for CSS and integrations: data-hub-theme is the
        // explicit contract, while data-theme is convenient for generic UI
        // tooling and harmless on the existing hub root.
        target.dataset.hubTheme = currentTheme;
        target.dataset.theme = currentTheme;
    });
    document.querySelectorAll('.theme-option').forEach((button) => {
        const active = button.dataset.themeValue === currentTheme;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('active', active);
    });
    updateThemeLayout();
    if (persist) persistTheme(currentTheme);
}

function initThemeControls() {
    applyTheme(readStoredTheme(), { persist: false });
    document.querySelectorAll('.theme-option').forEach((button) => {
        button.addEventListener('click', () => applyTheme(button.dataset.themeValue));
    });
}

function pagesOfGames() {
    const pages = [];
    for (let i = 0; i < games.length; i += PAGE_SIZE) pages.push(games.slice(i, i + PAGE_SIZE));
    return pages;
}

function renderCarousel() {
    const track = document.getElementById('game-carousel');
    if (!track) return;

    track.innerHTML = '';

    const pages = pagesOfGames();
    pages.forEach((pageGames, pageIndex) => {
        const li = document.createElement('li');
        li.className = 'game-page';
        li.dataset.page = pageIndex;
        li.dataset.count = pageGames.length;
        li.setAttribute('aria-label', `第 ${pageIndex + 1} 組遊戲`);
        li.innerHTML = pageGames.map((game) => {
            const safe = Object.fromEntries(['id', 'title', 'subtitle', 'icon', 'iconWebp', 'category', 'link']
                .map((key) => [key, escapeHtml(game[key] ?? '')]));
            const iconHtml = game.id === 'gomoku'
                ? '<span class="gomoku-stones"><i class="gomoku-stone black"></i><i class="gomoku-stone white"></i></span>'
                : game.isImage
                    /*
                     * 兩個卡片 logo 本來係 640×640（498K）同 1024×1024（349K），
                     * 但喺手機度只顯示 52×52——即係大咗 12 倍同 20 倍，
                     * 而**每個玩家一入 hub 就要落嗮呢 847K 去畫兩個 icon**。
                     * 縮到 160×160（桌面最大 72 × DPR 2 = 144，留少少頭位）之後
                     * WebP 得 10K、PNG 76K。用 <picture>：撐 WebP 就落 10K，
                     * 唔撐就落返 PNG——保住原本個 logo，唔會 fallback 去一個
                     * 唔啱嘅 emoji。
                     */
                    ? `<picture><source srcset="${safe.iconWebp}" type="image/webp"><img src="${safe.icon}" alt="" class="card-icon-img"></picture>`
                    : safe.icon;
            return `
                <a class="game-hub-card ${game.playable ? '' : 'disabled'}"
                   data-game-id="${safe.id}" href="${game.playable ? safe.link : '#'}"
                   ${game.playable ? '' : 'aria-disabled="true" tabindex="-1"'}>
                    <span class="card-category">${safe.category}</span>
                    <span class="card-icon" aria-hidden="true">${iconHtml}</span>
                    <span class="card-copy">
                        <strong>${safe.title}</strong>
                        <span class="card-description">${safe.subtitle}</span>
                    </span>
                    <span class="pill-btn ${game.playable ? 'primary' : 'disabled'}">
                        ${game.playable ? 'Play' : 'Locked'}
                    </span>
                </a>`;
        }).join('');
        li.querySelectorAll('.card-icon-img').forEach((image) => {
            image.addEventListener('error', () => {
                image.style.display = 'none';
                image.parentElement.textContent = '🀄';
            }, { once: true });
        });
        track.appendChild(li);
    });

    updateThemeLayout();

    const dots = document.getElementById('carousel-dots');
    if (dots) {
        dots.innerHTML = pages.map((_, index) =>
            `<button type="button" class="carousel-dot" data-page="${index}"
                aria-label="前往第 ${index + 1} 組遊戲"></button>`).join('');
        dots.querySelectorAll('.carousel-dot').forEach((dot) => {
            dot.addEventListener('click', () => {
                currentPage = Number(dot.dataset.page);
                updateCarousel();
            });
        });
    }

    updateCarousel();
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
        page.querySelectorAll('a').forEach(link => { link.tabIndex = active ? 0 : -1; });
    });

    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        const active = index === currentPage;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
    const status = document.getElementById('carousel-status');
    if (status) status.textContent = `${currentPage + 1} / ${pages.length}`;
}

function nextGame() {
    currentPage += 1;
    updateCarousel();
}

function prevGame() {
    currentPage -= 1;
    updateCarousel();
}

// Touch swipe support
let touchStartX = 0;
let touchEndX = 0;
let swipeTouchId = null;

function resetSwipe() {
    touchStartX = 0;
    touchEndX = 0;
    swipeTouchId = null;
}

function handleTouchStart(e) {
    // 只追蹤一隻手指。第二隻手指／系統手勢唔應該接管第一隻手指嘅
    // carousel 起點，否則 pinch 或 WebView gesture 之後會誤跳頁。
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
        if (diff > 0) {
            // Swipe left - go to next
            nextGame();
        } else {
            // Swipe right - go to previous
            prevGame();
        }
    }
}

function initHub() {
    initThemeControls();
    renderCarousel();

    // Add touch event listeners for swipe support
    const container = document.querySelector('.carousel-track-container');
    if (container) {
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });
        container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    }

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
