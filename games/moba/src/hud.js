// HUD。全部用 DOM，唔用 canvas 畫字——手機上面 DOM 文字先至清晰，
// 而且 CSS 處理安全區同轉向比自己計座標可靠。

import { abilityRank } from './champions.js';
import { ITEMS, MAX_ITEMS, nextPurchase } from './items.js';
import { TEAM, teamName, GAME_MAX } from './constants.js';

const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
};
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export class Hud {
    constructor(root, sim) {
        this.sim = sim;
        this.root = root;
        this.feed = [];
        this.shopOpen = false;
        this.#build();
    }

    #build() {
        const r = this.root;
        r.innerHTML = '';

        // 上方：時間、雙方人頭、拆咗幾多塔
        this.top = el('div', 'moba-top');
        this.scoreBlue = el('span', 'moba-score blue', '0');
        this.timer = el('span', 'moba-timer', '0:00');
        this.scoreRed = el('span', 'moba-score red', '0');
        this.top.append(this.scoreBlue, this.timer, this.scoreRed);
        r.append(this.top);

        // 擊殺播報
        this.feedBox = el('div', 'moba-feed');
        r.append(this.feedBox);

        // 左下：頭像、等級、血魔條、金幣
        this.panel = el('div', 'moba-panel');
        this.portrait = el('div', 'moba-portrait');
        this.levelBadge = el('span', 'moba-level', '1');
        this.portrait.append(this.levelBadge);
        const bars = el('div', 'moba-bars');
        this.hpBar = el('div', 'moba-bar hp');
        this.hpFill = el('i'); this.hpText = el('b');
        this.hpBar.append(this.hpFill, this.hpText);
        this.mpBar = el('div', 'moba-bar mp');
        this.mpFill = el('i'); this.mpText = el('b');
        this.mpBar.append(this.mpFill, this.mpText);
        bars.append(this.hpBar, this.mpBar);
        this.stats = el('div', 'moba-stats');
        this.panel.append(this.portrait, bars, this.stats);
        r.append(this.panel);

        // 右下：四個技能
        this.skills = el('div', 'moba-skills');
        this.skillBtns = [];
        for (let i = 0; i < 4; i++) {
            const b = el('button', 'moba-skill');
            b.dataset.index = String(i);
            const key = el('span', 'k', 'QWER'[i]);
            const cd = el('span', 'cd');
            const lvl = el('span', 'lv', '');
            b.append(key, cd, lvl);
            this.skills.append(b);
            this.skillBtns.push({ btn: b, cd, lvl });
        }
        r.append(this.skills);

        // 商店
        this.shopBtn = el('button', 'moba-shopbtn', '商店');
        this.shopBtn.addEventListener('click', () => this.toggleShop());
        r.append(this.shopBtn);
        this.shop = el('div', 'moba-shop hidden');
        r.append(this.shop);
        this.#buildShop();

        // 死亡遮罩
        this.deadBox = el('div', 'moba-dead hidden');
        r.append(this.deadBox);

        // 計分板
        this.board = el('div', 'moba-board');
        r.append(this.board);
    }

    #buildShop() {
        this.shop.innerHTML = '';
        const head = el('div', 'moba-shop-head');
        head.append(el('span', null, '商店（要返到泉水先買得到）'));
        const close = el('button', 'moba-x', '×');
        close.addEventListener('click', () => this.toggleShop(false));
        head.append(close);
        this.shop.append(head);

        this.shopGrid = el('div', 'moba-shop-grid');
        this.shopCards = [];
        for (const it of Object.values(ITEMS)) {
            const card = el('button', 'moba-item');
            card.append(el('b', null, it.name), el('span', 'cost', `${it.cost} 金`), el('span', 'txt', it.text));
            card.addEventListener('click', () => {
                const p = this.sim.player;
                if (!this.sim.buy(p, it.id)) this.flash(this.sim.canShop(p) ? '金幣唔夠或者格數滿咗' : '要返到泉水先買得到');
            });
            this.shopGrid.append(card);
            this.shopCards.push({ card, item: it });
        }
        this.shop.append(this.shopGrid);

        this.bagRow = el('div', 'moba-bag');
        this.shop.append(this.bagRow);
    }

    toggleShop(force) {
        this.shopOpen = force ?? !this.shopOpen;
        this.shop.classList.toggle('hidden', !this.shopOpen);
    }

    flash(text) {
        const n = el('div', 'moba-flash', text);
        this.root.append(n);
        setTimeout(() => n.remove(), 1600);
    }

    pushFeed(text, cls) {
        this.feed.push({ text, cls, t: performance.now() });
        if (this.feed.length > 5) this.feed.shift();
        this.feedBox.innerHTML = '';
        for (const f of this.feed) this.feedBox.append(el('div', `moba-feed-line ${f.cls ?? ''}`, f.text));
    }

    // 由 sim 嘅事件流砌播報：呢度只讀唔寫，所以播報永遠同實際發生嘅嘢一致
    consume(events) {
        for (const ev of events) {
            if (ev.type === 'death') {
                const victim = this.sim.champions.find(c => c.id === ev.id);
                if (!victim) continue;
                const killer = this.sim.champions.find(c => c.id === ev.killer);
                this.pushFeed(killer ? `${killer.def.name} 擊殺咗 ${victim.def.name}` : `${victim.def.name} 陣亡`,
                    victim.team === TEAM.BLUE ? 'red' : 'blue');
            } else if (ev.type === 'tower') {
                this.pushFeed(`${teamName(ev.team)}第 ${ev.tier + 1} 座塔被拆`, ev.team === TEAM.BLUE ? 'red' : 'blue');
            } else if (ev.type === 'warden') {
                this.pushFeed('守望擋低咗致命一擊', 'gold');
            }
        }
    }

    update() {
        const sim = this.sim, p = sim.player;
        const st = sim.stats(p);

        this.timer.textContent = clock(Math.min(sim.time, GAME_MAX));
        const kills = (t) => sim.champions.filter(c => c.team === t).reduce((a, c) => a + c.kills, 0);
        this.scoreBlue.textContent = String(kills(TEAM.BLUE));
        this.scoreRed.textContent = String(kills(TEAM.RED));

        this.levelBadge.textContent = String(p.level);
        const hpPct = Math.max(0, p.hp) / st.maxHp;
        this.hpFill.style.width = `${hpPct * 100}%`;
        this.hpText.textContent = `${Math.max(0, Math.round(p.hp))} / ${Math.round(st.maxHp)}`;
        const mpPct = p.mp / p.maxMp;
        this.mpFill.style.width = `${mpPct * 100}%`;
        this.mpText.textContent = `${Math.round(p.mp)} / ${Math.round(p.maxMp)}`;
        this.stats.textContent = `${p.kills}/${p.deaths}/${p.assists}　補刀 ${p.cs}　金 ${Math.round(p.gold)}`;

        for (let i = 0; i < 4; i++) {
            const { btn, cd, lvl } = this.skillBtns[i];
            const ab = p.def.abilities[i];
            const rank = abilityRank(p.level, i);
            const remain = p.abilityCd[i];
            btn.classList.toggle('locked', rank <= 0);
            btn.classList.toggle('nomana', p.mp < ab.cost);
            btn.classList.toggle('cooling', remain > 0);
            cd.textContent = remain > 0.05 ? remain.toFixed(remain < 1 ? 1 : 0) : '';
            lvl.textContent = rank > 0 ? String(rank) : '';
            btn.title = `${ab.name}：${ab.text}`;
        }

        // 商店：買唔買得起用顏色講，唔使玩家自己計數
        if (this.shopOpen) {
            const canShop = sim.canShop(p);
            for (const { card, item } of this.shopCards) {
                card.classList.toggle('afford', canShop && p.gold >= item.cost && p.items.length < MAX_ITEMS);
                card.classList.toggle('owned', p.items.includes(item.id));
            }
            this.bagRow.innerHTML = '';
            for (let i = 0; i < MAX_ITEMS; i++) {
                const id = p.items[i];
                const slot = el('button', 'moba-slot' + (id ? ' filled' : ''), id ? ITEMS[id].name : '－');
                if (id) slot.addEventListener('click', () => sim.sell(p, i));
                this.bagRow.append(slot);
            }
            const hint = nextPurchase(p.champId, p.items, p.gold);
            this.shopBtn.textContent = hint ? `商店 · 可買 ${ITEMS[hint].name}` : '商店';
        } else {
            const hint = nextPurchase(p.champId, p.items, p.gold);
            this.shopBtn.textContent = hint ? `商店 ●` : '商店';
            this.shopBtn.classList.toggle('ready', !!hint);
        }

        // 死亡：講返幾時翻生
        const dead = !p.alive;
        this.deadBox.classList.toggle('hidden', !dead);
        if (dead) this.deadBox.textContent = `陣亡 · ${Math.ceil(p.respawnAt - sim.time)} 秒後重生`;

        this.#board();
    }

    #board() {
        const rows = [];
        for (const t of [TEAM.BLUE, TEAM.RED]) {
            for (const c of this.sim.champions.filter(x => x.team === t)) {
                rows.push(`<div class="row ${t === TEAM.BLUE ? 'blue' : 'red'}${c.isPlayer ? ' me' : ''}">`
                    + `<span class="n">${c.def.name}</span>`
                    + `<span class="l">${c.level}</span>`
                    + `<span class="k">${c.kills}/${c.deaths}/${c.assists}</span>`
                    + `<span class="i">${c.items.length}</span></div>`);
            }
        }
        this.board.innerHTML = rows.join('');
    }
}
