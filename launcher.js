
const games = [
    {
        id: 'gomoku',
        title: 'Gomoku',
        subtitle: 'Classic strategy game. AI & Online PvP.',
        icon: '⚫⚪',
        link: 'games/gomoku/index.html',
        playable: true
    },
    {
        id: 'pennycrush',
        title: 'Penny Crush',
        subtitle: 'Match 3 candies! 8x8, 10x10 & 12x12 modes.',
        icon: '🍬',
        link: 'games/penny_crush/index.html',
        playable: true
    },
    {
        id: 'big2',
        title: 'Big Two',
        subtitle: '鋤大D! Play against 3 AI opponents.',
        icon: '🃏',
        link: 'games/big2/index.html',
        playable: true
    },
    {
        id: 'doudizhu',
        title: 'Dou Dizhu',
        subtitle: '鬥地主! Fight the Landlord vs 2 AI.',
        icon: '🀄',
        link: 'games/doudizhu/index.html',
        playable: true
    },
    {
        id: 'coming1',
        title: 'Coming Soon',
        subtitle: 'Under development',
        icon: '🔒',
        link: '#',
        playable: false
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

        li.innerHTML = `
            <div class="card-icon">${game.icon}</div>
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
    const cardStep = cardWidth + gap;

    // Update card positions using transform
    cards.forEach((card, i) => {
        const offset = (i - currentIndex) * cardStep;
        // Cards are positioned at left: 50%, so we need translateX(-50%) to center
        // Then add the offset to move them left/right
        card.style.transform = `translateX(calc(-50% + ${offset}px)) scale(${i === currentIndex ? 1.02 : 0.9})`;

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

    if (prevBtn) {
        prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
    }

    if (nextBtn) {
        nextBtn.style.display = currentIndex === games.length - 1 ? 'none' : 'flex';
    }
}

function nextGame() {
    if (currentIndex < games.length - 1) {
        currentIndex++;
        updateCarousel();
    }
}

function prevGame() {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
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
});
