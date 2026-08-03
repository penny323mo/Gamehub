
const games = [
    {
        id: 'gomoku',
        title: '五子棋',
        subtitle: '經典策略棋！AI 對戰 & 線上 PvP',
        icon: '⚫⚪',
        category: '棋類',
        link: 'games/gomoku/index.html',
        playable: true
    },
    {
        id: 'xiangqi',
        title: '中國象棋',
        subtitle: '中國象棋！挑戰進階 AI',
        icon: 'assets/xiangqi_logo.png',
        isImage: true,
        category: '棋類',
        link: 'games/xiangqi-ai/dist/index.html',
        playable: true
    },
    {
        id: 'big2',
        title: '鋤大D',
        subtitle: '鋤大D！對戰 3 個 AI 對手',
        icon: '🃏',
        category: '卡牌',
        link: 'games/big2/index.html',
        playable: true
    },
    {
        id: 'doudizhu',
        title: '鬥地主',
        subtitle: '鬥地主！對戰 2 個 AI',
        icon: 'assets/doudizhu_logo.png',
        isImage: true,
        category: '卡牌',
        link: 'games/doudizhu/index.html',
        playable: true
    },
    {
        id: 'pennycrush',
        title: '消消樂',
        subtitle: '三消糖果！8x8、10x10、12x12 模式',
        icon: '🍬',
        category: '益智',
        link: 'games/penny_crush/index.html',
        playable: true
    },
    {
        id: 'snooker',
        title: '桌球',
        subtitle: '桌球！2D 經典版 / 3D 立體版',
        icon: '🎱',
        category: '運動',
        link: 'games/snooker/index.html',
        playable: true
    },
    {
        id: 'tower',
        title: '塔防大戰',
        subtitle: '⚔️ 塔防！7 種塔 × 7 種敵人，20 波挑戰',
        icon: '🏰',
        category: '策略',
        link: 'games/tower/dist/index.html',
        playable: true
    },
    {
        id: 'snake',
        title: '霓虹貪食蛇',
        subtitle: '🐍 經典街機，霓虹光效',
        icon: '🐍',
        category: '街機',
        link: 'games/snake-game/dist/index.html',
        playable: true
    },
    {
        id: 'royale',
        title: '帝國皇家戰',
        subtitle: '⚔️ 即時對戰 3D 塔防！出兵過河攻陷敵方城堡',
        icon: '🏯',
        category: '即時戰略',
        link: 'games/royale/index.html',
        playable: true
    },
    {
        id: 'moba',
        title: '深淵之橋',
        subtitle: '🗡️ 三對三 MOBA！補刀出裝、越塔強殺、推爆水晶',
        icon: '🗡️',
        category: 'MOBA',
        link: 'games/moba/index.html?v=tap-audit-3',
        playable: true
    },
    {
        id: 'racer',
        title: 'Racing Car 3D',
        subtitle: '🏁 順滑 3D 賽道！三圈競速兼漂移挑戰',
        icon: '🏎️',
        category: '競速',
        link: 'games/Racing%20Car/index.html',
        playable: true
    },
    {
        id: 'ashenrail',
        title: '灰燼列車',
        subtitle: '🚂 3D 列車槍戰！守住能源核心殺退無人機',
        icon: '🚂',
        category: '動作射擊',
        link: 'games/ashen-rail/dist/index.html',
        playable: true
    },
    {
        id: 'elden-ring-ii',
        title: 'Elden Ring II',
        subtitle: '⚔️ 黑暗奇幻 3D 動作 RPG！三職業迎戰空冠之王',
        icon: '👑',
        category: '動作 RPG',
        link: 'games/elden-ring-ii/dist/index.html',
        playable: true
    }
];

const PAGE_SIZE = 4;
let currentPage = 0;

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
            const iconHtml = game.id === 'gomoku'
                ? '<span class="gomoku-stones"><i class="gomoku-stone black"></i><i class="gomoku-stone white"></i></span>'
                : game.isImage
                    ? `<img src="${game.icon}" alt="" class="card-icon-img" onerror="this.style.display='none';this.parentElement.textContent='🀄';">`
                    : game.icon;
            return `
                <a class="game-hub-card ${game.playable ? '' : 'disabled'}"
                   data-game-id="${game.id}" href="${game.playable ? game.link : '#'}"
                   ${game.playable ? '' : 'aria-disabled="true" tabindex="-1"'}>
                    <span class="card-category">${game.category}</span>
                    <span class="card-icon" aria-hidden="true">${iconHtml}</span>
                    <span class="card-copy">
                        <strong>${game.title}</strong>
                        <span class="card-description">${game.subtitle}</span>
                    </span>
                    <span class="pill-btn ${game.playable ? 'primary' : 'disabled'}">
                        ${game.playable ? 'Play' : 'Locked'}
                    </span>
                </a>`;
        }).join('');
        track.appendChild(li);
    });

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

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
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
    renderCarousel();

    // Add touch event listeners for swipe support
    const container = document.querySelector('.carousel-track-container');
    if (container) {
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });
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
