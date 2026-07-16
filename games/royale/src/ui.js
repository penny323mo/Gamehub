// UI — 手牌、聖水、計時、畫面切換、拖放操作（滑鼠 + 觸控）、進度/卡組/挑戰/結算
import { CARDS, CARD_POOL } from './cards.js';
import { TEAM, GAME_RULES } from './constants.js';
import {
    getStats, getDailyChallenges, getDecks, setDeck, getActiveDeck, setActiveDeck,
    cardLevel, cardShards, SHARDS_PER_LEVEL, MAX_LEVEL,
} from './storage.js';

export class UI {
    constructor(callbacks, thumbs = {}) {
        this.thumbs = thumbs;
        this.cardInnerHtml = (card) => {
            const art = this.thumbs[card.id]
                ? `<img class="art" src="${this.thumbs[card.id]}" draggable="false" alt="">`
                : `<div class="icon">${card.icon}</div>`;
            const lv = cardLevel(card.id);
            const lvHtml = lv > 1 ? `<div class="lv-badge">Lv${lv}</div>` : '';
            return `<div class="cost">${card.cost}</div>${lvHtml}${art}<div class="name">${card.name}</div>`;
        };
        this.cb = callbacks; // { onStart, onDrop, onDragMove, onDragEnd, onQuit, onAgain, onNextStage }
        this.$ = (id) => document.getElementById(id);
        this.game = null;
        this.lastHandKey = '';
        this.lastPlayedKey = '';
        this.dragIdx = -1;
        this.selectedIdx = -1;
        this.difficulty = 'normal';
        this.mode = 'single'; // single | gauntlet
        this.deckSlot = getActiveDeck();
        this.deck = [...getDecks()[this.deckSlot].cards];
        this.bannerTimer = null;

        this.#buildDeckGrid();
        this.#bindStartScreen();
        this.#bindHand();
        this.#buildElixirTicks();
        this.refreshProfile();
    }

    // ---------- 開始畫面：段位/統計/每日挑戰 ----------
    refreshProfile() {
        const s = getStats();
        this.$('rank-icon').textContent = s.rank.icon;
        this.$('rank-name').textContent = s.rank.name;
        this.$('rank-trophies').textContent = s.next
            ? `🏆 ${s.trophies}（${s.next.min - s.trophies} 到 ${s.next.name}）`
            : `🏆 ${s.trophies}`;
        const fast = s.fastestThreeCrown != null ? `｜最快三冠 ${s.fastestThreeCrown}s` : '';
        this.$('profile-stats').innerHTML =
            `勝 ${s.wins}｜負 ${s.losses}｜和 ${s.draws}<br>連勝 ${s.streak}（最高 ${s.bestStreak}）${fast}`;
        this.$('gauntlet-best').textContent = s.gauntletBest > 0 ? `最佳 ${s.gauntletBest} 關` : '';

        const daily = this.$('daily-list');
        daily.innerHTML = '';
        for (const c of getDailyChallenges()) {
            const el = document.createElement('div');
            el.className = 'daily-item' + (c.done ? ' done' : '');
            el.innerHTML = `<span class="tick">${c.done ? '✅' : '⬜'}</span><span>${c.desc}</span>`;
            daily.appendChild(el);
        }
        this.#refreshDeckLevels();
    }

    // ---------- 卡組編輯 ----------
    #buildDeckGrid() {
        const grid = this.$('deck-grid');
        grid.innerHTML = '';
        for (const id of CARD_POOL) {
            const c = CARDS[id];
            const el = document.createElement('div');
            el.className = 'deck-card' + (this.deck.includes(id) ? ' picked' : '');
            el.dataset.id = id;
            const art = this.thumbs[id]
                ? `<img class="art" src="${this.thumbs[id]}" draggable="false" alt="">`
                : `<div class="icon">${c.icon}</div>`;
            el.innerHTML = `<div class="cost">${c.cost}</div><div class="lv-badge"></div>${art}
                <div class="name">${c.name}</div>
                <div class="desc">${c.desc}</div>
                <div class="shard-bar"><div class="shard-fill"></div></div>`;
            el.addEventListener('click', () => {
                if (this.deck.includes(id)) {
                    this.deck = this.deck.filter(d => d !== id);
                    el.classList.remove('picked');
                } else if (this.deck.length < 8) {
                    this.deck.push(id);
                    el.classList.add('picked');
                }
                setDeck(this.deckSlot, this.deck);
                this.#updateDeckCount();
            });
            grid.appendChild(el);
        }
        this.#refreshDeckLevels();
        this.#updateDeckCount();
    }

    #refreshDeckLevels() {
        document.querySelectorAll('#deck-grid .deck-card').forEach((el) => {
            const id = el.dataset.id;
            const lv = cardLevel(id);
            const badge = el.querySelector('.lv-badge');
            badge.textContent = `Lv${lv}`;
            const fill = el.querySelector('.shard-fill');
            if (lv >= MAX_LEVEL) {
                fill.style.width = '100%';
                badge.textContent = 'MAX';
            } else {
                fill.style.width = `${Math.min(100, (cardShards(id) / SHARDS_PER_LEVEL[lv]) * 100)}%`;
            }
        });
    }

    #switchDeckSlot(slot) {
        this.deckSlot = slot;
        setActiveDeck(slot);
        this.deck = [...getDecks()[slot].cards];
        document.querySelectorAll('.deck-tab').forEach(b =>
            b.classList.toggle('selected', Number(b.dataset.slot) === slot));
        document.querySelectorAll('#deck-grid .deck-card').forEach(el =>
            el.classList.toggle('picked', this.deck.includes(el.dataset.id)));
        this.#updateDeckCount();
    }

    #updateDeckCount() {
        const n = this.deck.length;
        const el = this.$('deck-count');
        el.textContent = `${n}/8`;
        el.classList.toggle('bad', n !== 8);
        this.$('start-btn').disabled = n !== 8;
        // LV2 RTS 唔靠卡組，唔跟住 disable
    }

    #bindStartScreen() {
        for (const btn of document.querySelectorAll('.start-tab')) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.start-tab').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.querySelectorAll('.tab-page').forEach(p =>
                    p.classList.toggle('active', p.dataset.page === btn.dataset.tab));
            });
        }
        for (const btn of document.querySelectorAll('.diff-btn')) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.difficulty = btn.dataset.diff;
            });
        }
        for (const btn of document.querySelectorAll('.mode-btn')) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.mode = btn.dataset.mode;
                // 連勝挑戰難度自動遞增、PvP 冇難度揀，唔使顯示嗰行
                const hideDiff = this.mode === 'gauntlet' || this.mode === 'pvp';
                this.$('difficulty-row').style.display = hideDiff ? 'none' : '';
                this.$('difficulty-label').style.display = hideDiff ? 'none' : '';
                this.$('pvp-panel').classList.toggle('hidden', this.mode !== 'pvp');
                this.$('single-hint').classList.toggle('hidden', this.mode === 'pvp');
                this.$('start-btn').textContent = this.mode === 'pvp' ? '🌐 快速配對' : '開戰！';
            });
        }
        for (const btn of document.querySelectorAll('.deck-tab')) {
            btn.addEventListener('click', () => this.#switchDeckSlot(Number(btn.dataset.slot)));
        }
        this.$('start-btn').addEventListener('click', () => {
            this.cb.onStart(this.deck, this.difficulty, this.mode);
        });
        this.$('lv2-btn').addEventListener('click', () => {
            // LV2 世紀帝國式 RTS 唔用卡組，隨時可以開波
            this.cb.onStart(this.deck, 'hard', 'lv2');
        });
        this.$('pvp-join-btn').addEventListener('click', () => {
            const code = this.$('pvp-code-input').value.trim();
            if (code) this.cb.onJoinRoom(this.deck, code);
        });
        this.$('matching-cancel-btn').addEventListener('click', () => this.cb.onCancelMatching());
        this.$('again-btn').addEventListener('click', () => this.cb.onAgain());
        this.$('next-stage-btn').addEventListener('click', () => this.cb.onNextStage());
        // 「返回選單」要經 main.js 清埋成個 match（scene 物件/網絡），唔係淨係換畫面
        this.$('menu-btn').addEventListener('click', () => this.cb.onBackToMenu());
        this.$('quit-btn').addEventListener('click', () => this.cb.onQuit());
        this.$('mute-btn').addEventListener('click', () => {
            const m = this.cb.onToggleMute();
            this.$('mute-btn').textContent = m ? '🔇' : '🔊';
        });
    }

    // ---------- PvP 配對畫面 ----------
    showMatching(status) {
        this.$('screen-start').classList.add('hidden');
        this.$('screen-matching').classList.remove('hidden');
        this.$('matching-status').textContent = status;
        this.$('matching-code-box').classList.add('hidden');
    }

    setMatchingStatus(status) {
        this.$('matching-status').textContent = status;
    }

    showRoomCode(code) {
        this.$('matching-code-box').classList.remove('hidden');
        this.$('matching-code').textContent = code;
    }

    hideMatching() {
        this.$('screen-matching').classList.add('hidden');
    }

    showStart() {
        this.refreshProfile();
        clearTimeout(this.endRevealTimer); // 撳投降走人嗰陣，唔好畀 1.4s 後嘅結算畫面彈上嚟蓋住選單
        this.$('screen-start').classList.remove('hidden');
        this.$('screen-end').classList.add('hidden');
        this.$('screen-matching').classList.add('hidden');
        this.$('hud').classList.add('hidden');
    }

    showGame() {
        clearTimeout(this.endRevealTimer);
        this.$('screen-start').classList.add('hidden');
        this.$('screen-end').classList.add('hidden');
        this.$('screen-matching').classList.add('hidden');
        this.$('hud').classList.remove('hidden');
        this.lastHandKey = '';
        this.lastPlayedKey = '';
        this.$('enemy-played').innerHTML = '';
        this.$('next-card').innerHTML = ''; // 唔好留低上一場嘅「下一張」卡面（PvP guest 未收快照前會露底）
    }

    // result: game.result；extra: { rewards, damage, mode, stage, stageCleared }
    showEnd(result, extra = {}) {
        const win = result.winner === TEAM.PLAYER;
        const draw = result.winner === null || result.winner === undefined;
        this.$('end-title').textContent = draw ? '🤝 和局' : win ? '🏆 勝利！' : '💀 戰敗…';
        this.$('end-crowns').innerHTML =
            `你 👑 × ${result.crowns[TEAM.PLAYER]}　·　敵方 👑 × ${result.crowns[TEAM.ENEMY]}`;

        // 獎盃變化＋段位
        const r = extra.rewards;
        const trophyEl = this.$('end-trophy');
        if (r) {
            const sign = r.trophyDelta >= 0 ? '+' : '';
            trophyEl.innerHTML = `🏆 ${sign}${r.trophyDelta} → ${r.trophies}` +
                (r.rankUp ? `<span class="rankup">⬆️ 晉升 ${r.rank.icon} ${r.rank.name}！</span>` : '');
        } else {
            trophyEl.innerHTML = '';
        }

        // 連勝挑戰進度
        const gEl = this.$('end-gauntlet');
        const nextBtn = this.$('next-stage-btn');
        if (extra.mode === 'gauntlet') {
            gEl.classList.remove('hidden');
            gEl.textContent = win
                ? `🔥 連勝挑戰：第 ${extra.stage} 關通過！`
                : `🔥 連勝挑戰喺第 ${extra.stage} 關止步`;
            nextBtn.classList.toggle('hidden', !win);
            this.$('again-btn').classList.toggle('hidden', win);
        } else {
            gEl.classList.add('hidden');
            nextBtn.classList.add('hidden');
            this.$('again-btn').classList.remove('hidden');
            this.$('again-btn').textContent = extra.mode === 'pvp' ? '🌐 返回選單再配對' : '再嚟一局';
        }

        // 傷害榜（自己卡組頭 4 名）
        const dmgEl = this.$('end-damage');
        dmgEl.innerHTML = '';
        const rows = Object.entries(extra.damage ?? {})
            .filter(([id]) => CARDS[id])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4);
        const maxD = rows.length ? rows[0][1] : 1;
        for (const [id, d] of rows) {
            const c = CARDS[id];
            const row = document.createElement('div');
            row.className = 'dmg-row';
            row.innerHTML = `<div class="dmg-icon">${c.icon}</div>
                <div class="dmg-track"><div class="dmg-fill" style="width:${Math.round((d / maxD) * 100)}%"></div></div>
                <div class="dmg-num">${Math.round(d)}</div>`;
            dmgEl.appendChild(row);
        }
        if (!rows.length) dmgEl.innerHTML = '<div class="dmg-row" style="justify-content:center">—</div>';

        // 碎片獎勵
        const rw = this.$('end-rewards');
        rw.innerHTML = '';
        for (const g of r?.shardGains ?? []) {
            const c = CARDS[g.id];
            const chip = document.createElement('div');
            chip.className = 'reward-chip' + (g.leveledUp ? ' levelup' : '');
            chip.textContent = g.leveledUp
                ? `${c.icon} ${c.name} 升到 Lv${g.level}！`
                : `${c.icon} ${c.name} +${g.n} 碎片`;
            rw.appendChild(chip);
        }

        // 每日挑戰達成
        const ch = this.$('end-challenges');
        ch.innerHTML = (r?.challengesDone ?? [])
            .map(c => `✅ 每日挑戰完成：${c.desc}（+${c.reward.n ?? 8} 碎片）`)
            .join('<br>');

        clearTimeout(this.endRevealTimer);
        this.endRevealTimer = setTimeout(() => {
            this.$('screen-end').classList.remove('hidden');
        }, win ? 2800 : 1400); // 贏波延遲耐啲先彈結算，畀勝利煙花放晒（5 束 × 0.42s + 0.9s 餘燼）
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
        for (let i = 0; i < GAME_RULES.elixirMax; i++) ticks.appendChild(document.createElement('span'));
    }

    bindGame(game) {
        this.game = game;
        this.selectedIdx = -1;
        this.dragIdx = -1;
        // 重置所有「有變先寫」HUD cache，新一場一定全部重繪一次
        this.lastHandKey = null;
        this.lastPlayedKey = null;
        this._lastPlayedLen = -1;
        this._lastElixirInt = -1;
        this._lastBoost = null;
        this._lastT = -1;
        this._lastPhase = null;
        this._lastCrowns = -1;
        this._cardsDirty = true;
    }

    // 每幀更新 HUD
    update() {
        const g = this.game;
        if (!g) return;
        // 完場即刻甩選卡狀態：唔好等結算畫面彈出前嗰 1.4-2.8 秒
        // 仲揀住卡（highlight 唔走、按 canvas 又轉唔到鏡頭）
        if (g.phase === 'ended' && this.selectedIdx >= 0) {
            this.selectedIdx = -1;
            this.canvasPlacing = false;
            this.#refreshSelection();
        }
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
                el.innerHTML = this.cardInnerHtml(CARDS[id]);
                cardsEl.appendChild(el);
            });
            // p.next 喺 PvP guest 未收到 host 第一個快照之前會係 null，CARDS[null] 揀唔到嘢
            if (CARDS[p.next]) {
                const next = this.$('next-card');
                next.innerHTML = this.cardInnerHtml(CARDS[p.next]);
            }
            this.#refreshSelection();
            this._cardsDirty = true; // 手牌換咗，affordability class 要重新計
        }

        // 對手已出過嘅卡（獨特卡，最多 8 張）。
        // 平價 guard 先行：playedCards 冇加長就唔使砌 Set/array/join（每幀慳返啲 GC）
        const playedLen = g.playedCards[TEAM.ENEMY].length;
        if (playedLen !== this._lastPlayedLen) {
            this._lastPlayedLen = playedLen;
            const played = [...new Set(g.playedCards[TEAM.ENEMY])].slice(0, 8);
            const playedKey = played.join(',');
            if (playedKey !== this.lastPlayedKey) {
                this.lastPlayedKey = playedKey;
                const box = this.$('enemy-played');
                box.innerHTML = '';
                for (const id of played) {
                    const chip = document.createElement('div');
                    chip.className = 'chip';
                    chip.innerHTML = this.thumbs[id]
                        ? `<img src="${this.thumbs[id]}" alt="">`
                        : CARDS[id].icon;
                    box.appendChild(chip);
                }
            }
        }

        // 以下 HUD 值大部分係 1Hz 或更慢先變——全部用「有變先寫 DOM」gate 住，
        // 唔好 60fps 咁狂寫 textContent/classList（cache 埋元素，唔使每幀 getElementById）
        if (!this._hud) {
            this._hud = {
                elixirNum: this.$('elixir-num'), elixirFill: this.$('elixir-fill'),
                timer: this.$('timer'), phase: this.$('phase-label'),
                crownP: this.$('crowns-player'), crownE: this.$('crowns-enemy'),
            };
        }
        const H = this._hud;

        // 買唔買得起：手牌重繪／聖水過整數位先重新計
        const elixirInt = Math.floor(p.elixir);
        if (elixirInt !== this._lastElixirInt || this._cardsDirty) {
            this._cardsDirty = false;
            document.querySelectorAll('#cards .card').forEach((el, i) => {
                const c = CARDS[p.hand[i]];
                el.classList.toggle('unaffordable', !c || p.elixir < c.cost);
            });
        }
        if (elixirInt !== this._lastElixirInt) {
            this._lastElixirInt = elixirInt;
            H.elixirNum.textContent = elixirInt;
        }

        // 聖水條係連續動畫，照每幀寫；boost class 就 gate 住
        H.elixirFill.style.width = `${(p.elixir / GAME_RULES.elixirMax) * 100}%`;
        const boost = g.elixirMultiplier() > 1;
        if (boost !== this._lastBoost) { this._lastBoost = boost; H.elixirFill.classList.toggle('boost', boost); }

        // 時間 / 階段 / 皇冠
        const t = Math.max(0, Math.ceil(g.time));
        if (t !== this._lastT || g.phase !== this._lastPhase) {
            H.timer.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
            H.timer.classList.toggle('urgent', g.phase === 'overtime' || t <= 30);
            const inClimax = g.phase === 'overtime' && g.time <= GAME_RULES.climaxWindow;
            H.phase.textContent = inClimax ? '🔥 決勝一刻 傷害提升'
                : g.phase === 'overtime' ? '⚡ 加時 突然死亡'
                : boost ? '💧 雙倍聖水' : '';
            H.phase.classList.toggle('climax', inClimax);
            this._lastT = t; this._lastPhase = g.phase;
        }
        const crownKey = g.crowns[TEAM.PLAYER] * 10 + g.crowns[TEAM.ENEMY];
        if (crownKey !== this._lastCrowns) {
            this._lastCrowns = crownKey;
            H.crownP.textContent = g.crowns[TEAM.PLAYER];
            H.crownE.textContent = g.crowns[TEAM.ENEMY];
        }
    }
}
