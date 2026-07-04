// UI — 手牌、聖水、計時、畫面切換、拖放操作（滑鼠 + 觸控）
import { CARDS, CARD_POOL, DEFAULT_DECK } from './cards.js';
import { TEAM } from './constants.js';

function cardInnerHtml(card) {
    return `<div class="cost">${card.cost}</div>
        <div class="icon">${card.icon}</div>
        <div class="name">${card.name}</div>`;
}

export class UI {
    constructor(callbacks) {
        this.cb = callbacks; // { onStart, onDrop(idx,x,y), onDragMove(idx,x,y), onDragEnd, onQuit, onAgain }
        this.$ = (id) => document.getElementById(id);
        this.game = null;
        this.lastHandKey = '';
        this.dragIdx = -1;
        this.selectedIdx = -1;
        this.difficulty = 'normal';
        this.deck = [...DEFAULT_DECK];
        this.bannerTimer = null;

        this.#buildDeckGrid();
        this.#bindStartScreen();
        this.#bindHand();
        this.#buildElixirTicks();
    }

    // ---------- 開始畫面 ----------
    #buildDeckGrid() {
        const grid = this.$('deck-grid');
        grid.innerHTML = '';
        for (const id of CARD_POOL) {
            const c = CARDS[id];
            const el = document.createElement('div');
            el.className = 'deck-card' + (this.deck.includes(id) ? ' picked' : '');
            el.dataset.id = id;
            el.innerHTML = `<div class="cost">${c.cost}</div>
                <div class="icon">${c.icon}</div>
                <div class="name">${c.name}</div>
                <div class="desc">${c.desc}</div>`;
            el.addEventListener('click', () => {
                if (this.deck.includes(id)) {
                    this.deck = this.deck.filter(d => d !== id);
                    el.classList.remove('picked');
                } else if (this.deck.length < 8) {
                    this.deck.push(id);
                    el.classList.add('picked');
                }
                this.#updateDeckCount();
            });
            grid.appendChild(el);
        }
        this.#updateDeckCount();
    }

    #updateDeckCount() {
        const n = this.deck.length;
        const el = this.$('deck-count');
        el.textContent = `${n}/8`;
        el.classList.toggle('bad', n !== 8);
        this.$('start-btn').disabled = n !== 8;
    }

    #bindStartScreen() {
        for (const btn of document.querySelectorAll('.diff-btn')) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.difficulty = btn.dataset.diff;
            });
        }
        this.$('start-btn').addEventListener('click', () => {
            this.cb.onStart(this.deck, this.difficulty);
        });
        this.$('again-btn').addEventListener('click', () => this.cb.onAgain());
        this.$('menu-btn').addEventListener('click', () => this.showStart());
        this.$('quit-btn').addEventListener('click', () => this.cb.onQuit());
        this.$('mute-btn').addEventListener('click', () => {
            const m = this.cb.onToggleMute();
            this.$('mute-btn').textContent = m ? '🔇' : '🔊';
        });
    }

    showStart() {
        this.$('screen-start').classList.remove('hidden');
        this.$('screen-end').classList.add('hidden');
        this.$('hud').classList.add('hidden');
    }

    showGame() {
        this.$('screen-start').classList.add('hidden');
        this.$('screen-end').classList.add('hidden');
        this.$('hud').classList.remove('hidden');
        this.lastHandKey = '';
    }

    showEnd(result) {
        const win = result.winner === TEAM.PLAYER;
        const draw = result.winner === null || result.winner === undefined;
        this.$('end-title').textContent = draw ? '🤝 和局' : win ? '🏆 勝利！' : '💀 戰敗…';
        this.$('end-crowns').innerHTML =
            `你 👑 × ${result.crowns[TEAM.PLAYER]}<br>敵方 👑 × ${result.crowns[TEAM.ENEMY]}`;
        setTimeout(() => {
            this.$('screen-end').classList.remove('hidden');
        }, 1400);
    }

    banner(text, dur = 1800) {
        const b = this.$('banner');
        b.textContent = text;
        b.classList.remove('hidden');
        clearTimeout(this.bannerTimer);
        this.bannerTimer = setTimeout(() => b.classList.add('hidden'), dur);
    }

    // ---------- 手牌 ----------
    #bindHand() {
        const cardsEl = this.$('cards');
        cardsEl.addEventListener('pointerdown', (ev) => {
            const cardEl = ev.target.closest('.card');
            if (!cardEl || cardEl.classList.contains('unaffordable')) return;
            const idx = Number(cardEl.dataset.idx);
            this.dragIdx = idx;
            this.dragMoved = false;
            this.dragStart = { x: ev.clientX, y: ev.clientY };
            ev.preventDefault();
        });
        window.addEventListener('pointermove', (ev) => {
            if (this.dragIdx < 0) return;
            const dx = ev.clientX - this.dragStart.x, dy = ev.clientY - this.dragStart.y;
            if (Math.abs(dx) + Math.abs(dy) > 12) this.dragMoved = true;
            if (this.dragMoved) this.cb.onDragMove(this.dragIdx, ev.clientX, ev.clientY);
        });
        window.addEventListener('pointerup', (ev) => {
            if (this.dragIdx < 0) return;
            const idx = this.dragIdx;
            this.dragIdx = -1;
            if (this.dragMoved) {
                this.cb.onDrop(idx, ev.clientX, ev.clientY);
                this.selectedIdx = -1;
            } else {
                // 點一下 = 揀住呢張，再點戰場落卡
                this.selectedIdx = this.selectedIdx === idx ? -1 : idx;
                this.#refreshSelection();
            }
            this.cb.onDragEnd();
        });
        // 揀咗卡之後點/拖戰場都可以落
        const holder = this.$('canvas-holder');
        holder.addEventListener('pointerdown', (ev) => {
            if (this.selectedIdx >= 0) {
                this.canvasPlacing = true;
                this.cb.onDragMove(this.selectedIdx, ev.clientX, ev.clientY);
            }
        });
        holder.addEventListener('pointermove', (ev) => {
            if (this.selectedIdx >= 0 && this.canvasPlacing) {
                this.cb.onDragMove(this.selectedIdx, ev.clientX, ev.clientY);
            }
        });
        holder.addEventListener('pointerup', (ev) => {
            if (this.selectedIdx >= 0 && this.canvasPlacing) {
                this.cb.onDrop(this.selectedIdx, ev.clientX, ev.clientY);
                this.selectedIdx = -1;
                this.canvasPlacing = false;
                this.cb.onDragEnd();
                this.#refreshSelection();
            }
        });
    }

    #refreshSelection() {
        document.querySelectorAll('#cards .card').forEach((el) => {
            el.classList.toggle('selected', Number(el.dataset.idx) === this.selectedIdx);
        });
    }

    #buildElixirTicks() {
        const ticks = this.$('elixir-ticks');
        for (let i = 0; i < 10; i++) ticks.appendChild(document.createElement('span'));
    }

    bindGame(game) {
        this.game = game;
        this.selectedIdx = -1;
        this.dragIdx = -1;
    }

    // 每幀更新 HUD
    update() {
        const g = this.game;
        if (!g) return;
        const p = g.players[TEAM.PLAYER];

        // 手牌（有變先重繪）
        const key = p.hand.join(',') + '|' + p.next;
        if (key !== this.lastHandKey) {
            this.lastHandKey = key;
            const cardsEl = this.$('cards');
            cardsEl.innerHTML = '';
            p.hand.forEach((id, i) => {
                const el = document.createElement('div');
                el.className = 'card';
                el.dataset.idx = i;
                el.innerHTML = cardInnerHtml(CARDS[id]);
                cardsEl.appendChild(el);
            });
            const next = this.$('next-card');
            next.innerHTML = cardInnerHtml(CARDS[p.next]);
            this.#refreshSelection();
        }

        // 買唔買得起
        document.querySelectorAll('#cards .card').forEach((el, i) => {
            const c = CARDS[p.hand[i]];
            el.classList.toggle('unaffordable', !c || p.elixir < c.cost);
        });

        // 聖水
        this.$('elixir-num').textContent = Math.floor(p.elixir);
        const fill = this.$('elixir-fill');
        fill.style.width = `${(p.elixir / 10) * 100}%`;
        fill.classList.toggle('boost', g.elixirMultiplier() > 1);

        // 時間 / 皇冠
        const t = Math.max(0, Math.ceil(g.time));
        const timerEl = this.$('timer');
        timerEl.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
        timerEl.classList.toggle('urgent', g.phase === 'overtime' || t <= 30);
        this.$('phase-label').textContent =
            g.phase === 'overtime' ? '⚡ 加時 突然死亡'
            : g.elixirMultiplier() > 1 ? '💧 雙倍聖水' : '';
        this.$('crowns-player').textContent = g.crowns[TEAM.PLAYER];
        this.$('crowns-enemy').textContent = g.crowns[TEAM.ENEMY];
    }
}
