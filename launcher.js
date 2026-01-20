
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
        id: 'coming1',
        title: 'Coming Soon',
        subtitle: 'Under development',
        icon: '🔒',
        link: '#',
        playable: false
    }
];

let currentSlide = 0;

function renderCarousel() {
    const track = document.getElementById('game-carousel');
    if (!track) return;

    track.innerHTML = '';

    games.forEach((game) => {
        const li = document.createElement('li');
        li.className = `game-hub-card ${game.playable ? '' : 'disabled'}`;

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
    if (cards[currentSlide]) {
        cards[currentSlide].scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
        });
    }
    updateButtonStates();
    highlightCard(currentSlide);
}

function highlightCard(index) {
    const cards = document.querySelectorAll('.game-hub-card');
    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('active-card');
        } else {
            card.classList.remove('active-card');
        }
    });
}

function updateButtonStates() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const maxSlide = games.length - 1;

    if (prevBtn) {
        prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';
    }

    if (nextBtn) {
        const atEnd = currentSlide >= maxSlide;
        nextBtn.style.opacity = atEnd ? '0.3' : '1';
        nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
    }
}

function nextGame() {
    if (currentSlide < games.length - 1) {
        currentSlide++;
        updateCarousel();
    }
}

function prevGame() {
    if (currentSlide > 0) {
        currentSlide--;
        updateCarousel();
    }
}

function updateActiveStateOnScroll() {
    const container = document.querySelector('.carousel-track-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const cards = document.querySelectorAll('.game-hub-card');

    let closestIndex = -1;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const dist = Math.abs(containerCenter - cardCenter);

        if (dist < minDistance) {
            minDistance = dist;
            closestIndex = index;
        }
    });

    if (closestIndex >= 0 && minDistance < 150) {
        if (closestIndex !== currentSlide) {
            currentSlide = closestIndex;
            updateButtonStates();
        }
        highlightCard(closestIndex);
    }
}

window.addEventListener('load', () => {
    renderCarousel();
    const container = document.querySelector('.carousel-track-container');
    if (container) {
        let scrollTimeout;
        container.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveStateOnScroll, 50);
        }, { passive: true });
    }
    setTimeout(updateActiveStateOnScroll, 100);
});
