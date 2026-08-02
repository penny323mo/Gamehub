
const games = [
    {
        id: 'gomoku',
        title: '五子棋',
        subtitle: '經典策略棋！AI 對戰 & 線上 PvP',
        icon: '⚫⚪',
        link: 'games/gomoku/index.html',
        playable: true
    },
    {
        id: 'pennycrush',
        title: '消消樂',
        subtitle: '三消糖果！8x8、10x10、12x12 模式',
        icon: '🍬',
        link: 'games/penny_crush/index.html',
        playable: true
    },
    {
        id: 'big2',
        title: '鋤大D',
        subtitle: '鋤大D！對戰 3 個 AI 對手',
        icon: '🃏',
        link: 'games/big2/index.html',
        playable: true
    },
    {
        id: 'doudizhu',
        title: '鬥地主',
        subtitle: '鬥地主！對戰 2 個 AI',
        icon: 'assets/doudizhu_logo.png',
        isImage: true,
        link: 'games/doudizhu/index.html',
        playable: true
    },
    {
        id: 'snooker',
        title: '桌球',
        subtitle: '桌球！2D 經典版 / 3D 立體版',
        icon: '🎱',
        link: 'games/snooker/index.html',
        playable: true
    },
    {
        id: 'tower',
        title: '塔防大戰',
        subtitle: '⚔️ 塔防！7 種塔 × 7 種敵人，20 波挑戰',
        icon: '🏰',
        link: 'games/tower/dist/index.html',
        playable: true
    },
    {
        id: 'snake',
        title: '霓虹貪食蛇',
        subtitle: '🐍 經典街機，霓虹光效',
        icon: '🐍',
        link: 'games/snake-game/dist/index.html',
        playable: true
    },
    {
        id: 'royale',
        title: '帝國皇家戰',
        subtitle: '⚔️ 即時對戰 3D 塔防！出兵過河攻陷敵方城堡',
        icon: '🏯',
        link: 'games/royale/index.html',
        playable: true
    },
    {
        id: 'moba',
        title: '深淵之橋',
        subtitle: '🗡️ 三對三 MOBA！補刀出裝、越塔強殺、推爆水晶',
        icon: '🗡️',
        link: 'games/moba/index.html',
        playable: true
    },
    {
        id: 'racer',
        title: 'Racing Car 3D',
        subtitle: '🏁 順滑 3D 賽道！三圈競速兼漂移挑戰',
        icon: '🏎️',
        link: 'games/Racing%20Car/index.html',
        playable: true
    },
    {
        id: 'ashenrail',
        title: '灰燼列車',
        subtitle: '🚂 3D 列車槍戰！守住能源核心殺退無人機',
        icon: '🚂',
        link: 'games/ashen-rail/dist/index.html',
        playable: true
    },
    {
        id: 'elden-ring-ii',
        title: 'Elden Ring II',
        subtitle: '⚔️ 黑暗奇幻 3D 動作 RPG！三職業迎戰空冠之王',
        icon: '👑',
        link: 'games/elden-ring-ii/dist/index.html',
        playable: true
    },
    {
        id: 'xiangqi',
        title: '中國象棋',
        subtitle: '中國象棋！挑戰進階 AI',
        icon: 'assets/xiangqi_logo.png',
        isImage: true,
        link: 'games/xiangqi-ai/dist/index.html',
        playable: true
    }
];

let currentIndex = 0;

function renderCarousel() {
    const track = document.getElementById('game-carousel');
    if (!track) return;

    track.innerHTML = '';

    games.forEach((game, index) => {
        const li = document.createElement('li');
        li.className = `game-hub-card ${game.playable ? '' : 'disabled'}`;
        li.dataset.index = index;

        li.onclick = function () {
            if (game.playable) {
                window.location.href = game.link;
            }
        };

        const iconHtml = game.isImage
            ? `<img src="${game.icon}" alt="${game.title}" class="card-icon-img" onerror="this.style.display='none';this.parentElement.innerHTML='🀄';">`
            : game.icon;

        li.innerHTML = `
            <div class="card-icon">${iconHtml}</div>
            <h2>${game.title}</h2>
            <p>${game.subtitle}</p>
            <button class="pill-btn ${game.playable ? 'primary' : 'disabled'}" ${game.playable ? '' : 'disabled'}>
                ${game.playable ? 'Play' : 'Locked'}
            </button>
        `;
        track.appendChild(li);
    });

    updateCarousel();
}

function updateCarousel() {
    const cards = document.querySelectorAll('.game-hub-card');
    if (cards.length === 0) return;

    // Get actual width from the first card (they should be identical)
    const cardWidth = cards[0].offsetWidth;
    const gap = 30; // Gap between cards

    // 隔籬張卡唔可以「露半條邊」：要就見到成張，要就完全唔見。
    // 闊螢幕擺得落三張，就照 cardWidth + gap 排（正常 carousel 樣）；
    // 手機得一張卡嘅位，就將隔籬張推到完全出界，得中間嗰張。
    // 非活躍卡縮咗 SIDE_SCALE，所以計「見唔見到」要用縮完之後嘅半闊。
    const SIDE_SCALE = 0.9;
    const viewHalf = (document.querySelector('.carousel-track-container')?.clientWidth
        || cardWidth) / 2;
    const sideHalf = cardWidth * SIDE_SCALE / 2;
    const tightStep = cardWidth + gap;
    const cardStep = tightStep + sideHalf <= viewHalf
        ? tightStep
        : viewHalf + sideHalf + gap;

    // Update card positions using transform
    cards.forEach((card, i) => {
        const offset = (i - currentIndex) * cardStep;
        // Cards are positioned at left: 50%, so we need translateX(-50%) to center
        // Then add the offset to move them left/right
        card.style.transform = `translateX(calc(-50% + ${offset}px)) scale(${i === currentIndex ? 1.02 : SIDE_SCALE})`;

        // Update active state
        if (i === currentIndex) {
            card.classList.add('active-card');
        } else {
            card.classList.remove('active-card');
        }
    });

    updateArrowVisibility();
}

function updateArrowVisibility() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    // Circular mode: always show both arrows
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';
}

function nextGame() {
    currentIndex = (currentIndex + 1) % games.length;
    updateCarousel();
}

function prevGame() {
    currentIndex = (currentIndex - 1 + games.length) % games.length;
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

window.addEventListener('load', () => {
    renderCarousel();

    // Add touch event listeners for swipe support
    const container = document.querySelector('.carousel-track-container');
    if (container) {
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    // Card width is min(280px, 85vw): on very narrow screens it changes with the
    // viewport, so recompute pixel offsets on resize/rotate or cards misalign
    window.addEventListener('resize', updateCarousel);
});
