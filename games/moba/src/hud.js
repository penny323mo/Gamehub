// HUD。全部用 DOM，唔用 canvas 畫字——手機上面 DOM 文字先至清晰，
// 而且 CSS 處理安全區同轉向比自己計座標可靠。

import { abilityRank } from './champions.js';
import { settings } from './settings.js';
import { ITEMS, MAX_ITEMS, nextPurchase } from './items.js';
import { TEAM, teamName, GAME_MAX, MAP } from './constants.js';

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
        // 商店開住時 HUD 會成為真正 modal。撳暗位都可以返回戰場，亦唔會
        // 將同一下觸控漏落 canvas 變成搖桿輸入。
        this.root.addEventListener('pointerup', (ev) => {
            if (this.shopOpen && ev.target === this.root) this.toggleShop(false);
        });
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

        // 兵線總覽。一條線嘅 MOBA 冇小地圖，玩家就完全唔知兵線去到邊、
        // 邊個隊友唔見咗、對面邊個返咗屋企——呢啲全部係決定「而家上唔上」
        // 嘅資訊。條線本身就係地圖，所以一條橫條已經夠。
        this.laneWrap = el('div', 'moba-lane');
        this.laneCanvas = document.createElement('canvas');
        this.laneWrap.append(this.laneCanvas);
        r.append(this.laneWrap);

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

        // 右下：普攻掣 + 四個技能。
        // 每粒掣要寫住個技能名——之前淨係得一個 Q/W/E/R 字母，
        // 玩家撳之前根本唔知會發生咩事，撳完亦都唔知啱唔啱。
        this.skills = el('div', 'moba-skills');
        this.attackBtn = el('button', 'moba-attack');
        this.attackBtn.append(el('span', 'nm', '普攻'), el('span', 'k', '空白鍵'));
        this.skills.append(this.attackBtn);
        this.skillBtns = [];
        const KEYS = ['Q', 'F', 'E', 'R'];
        for (let i = 0; i < 4; i++) {
            const b = el('button', 'moba-skill');
            b.dataset.index = String(i);
            const ab = this.sim.player.def.abilities[i];
            const key = el('span', 'k', KEYS[i]);
            const nm = el('span', 'nm', ab.name);
            const cd = el('span', 'cd');
            const lvl = el('span', 'lv', '');
            b.append(key, nm, cd, lvl);
            this.skills.append(b);
            this.skillBtns.push({ btn: b, cd, lvl, nm });
        }
        r.append(this.skills);

        // 技能說明：撳實／hover 就彈出成句解釋
        this.tip = el('div', 'moba-tip hidden');
        r.append(this.tip);
        this.skillBtns.forEach(({ btn }, i) => {
            const ab = this.sim.player.def.abilities[i];
            const show = () => {
                this.tip.innerHTML = `<b>${ab.name}</b><span>${ab.text}</span>`
                    + `<i>耗藍 ${ab.cost}　冷卻 ${ab.cd} 秒</i>`;
                this.tip.classList.remove('hidden');
            };
            const hide = () => this.tip.classList.add('hidden');
            btn.addEventListener('pointerenter', show);
            btn.addEventListener('pointerleave', hide);
            btn.addEventListener('pointerdown', show);
            btn.addEventListener('pointerup', () => setTimeout(hide, 900));
        });

        // 返程：讀秒條擺喺畫面中下，因為讀秒期間唯一要睇嘅就係「仲有幾耐」
        this.recallBtn = el('button', 'moba-recall', '返程');
        this.recallBtn.addEventListener('click', () => this.onRecall?.());
        r.append(this.recallBtn);
        this.recallBar = el('div', 'moba-recallbar hidden');
        this.recallFill = el('i');
        this.recallBar.append(this.recallFill, el('span', null, '返程中…'));
        r.append(this.recallBar);

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

        // 設定：一個網頁遊戲冇靜音掣係硬傷——人哋隨時喺公司／地鐵開你隻嘢。
        this.gearBtn = el('button', 'moba-gear', '⚙');
        this.gearBtn.setAttribute('aria-label', '設定');
        this.gearBtn.addEventListener('click', () => this.toggleSettings());
        r.append(this.gearBtn);
        this.settings = el('div', 'moba-settings hidden');
        r.append(this.settings);
        this.#buildSettings();

        // 施法橫額：撳完技能報返個名，玩家先學得識自己隻英雄有咩
        this.cast = el('div', 'moba-cast');
        r.append(this.cast);

        // 計分板
        this.board = el('div', 'moba-board');
        r.append(this.board);
    }

    #buildShop() {
        this.shop.innerHTML = '';
        const head = el('div', 'moba-shop-head');
        this.shopState = el('span', 'moba-shop-state', '商店');
        head.append(this.shopState);
        const actions = el('div', 'moba-shop-actions');
        this.shopRecall = el('button', 'moba-shop-recall', '返程購物');
        this.shopRecall.addEventListener('click', () => {
            this.toggleShop(false);
            // 已經讀緊返程就淨係收埋商店；再 toggle 一次反而會取消返程。
            if (this.sim.recallProgress(this.sim.player) <= 0) this.onRecall?.();
        });
        const close = el('button', 'moba-x moba-shop-close', '返回戰場 ×');
        close.setAttribute('aria-label', '關閉商店，返回戰場');
        close.addEventListener('click', () => this.toggleShop(false));
        actions.append(this.shopRecall, close);
        head.append(actions);
        this.shop.append(head);

        this.shopGrid = el('div', 'moba-shop-grid');
        this.shopCards = [];
        for (const it of Object.values(ITEMS)) {
            const card = el('button', 'moba-item');
            card.append(el('b', null, it.name), el('span', 'cost', `${it.cost} 金`), el('span', 'txt', it.text));
            card.addEventListener('click', () => {
                const p = this.sim.player;
                if (this.sim.buy(p, it.id)) this.flash(`已購買 ${it.name}`);
                else this.flash(this.sim.canShop(p) ? '金幣唔夠或者裝備格已滿' : '未到泉水：請先撳「返程購物」');
            });
            this.shopGrid.append(card);
            this.shopCards.push({ card, item: it });
        }
        this.shop.append(this.shopGrid);

        this.bagRow = el('div', 'moba-bag');
        this.shop.append(this.bagRow);
    }

    #buildSettings() {
        const box = this.settings;
        box.innerHTML = '';
        const head = el('div', 'moba-shop-head');
        head.append(el('span', null, '設定'));
        const close = el('button', 'moba-x', '×');
        close.addEventListener('click', () => this.toggleSettings(false));
        head.append(close);
        box.append(head);

        const row = (label, node) => {
            const r = el('div', 'moba-set-row');
            r.append(el('span', null, label), node);
            box.append(r);
            return r;
        };
        const toggle = (key, onChange) => {
            const b = el('button', 'moba-toggle');
            const paint = () => {
                b.textContent = settings.get(key) ? '開' : '關';
                b.classList.toggle('on', !!settings.get(key));
            };
            b.addEventListener('click', () => { settings.set(key, !settings.get(key)); paint(); onChange(settings.get(key)); });
            paint();
            return b;
        };
        row('音效', toggle('sfx', (v) => this.onSetting?.('sfx', v)));
        row('音樂', toggle('music', (v) => this.onSetting?.('music', v)));

        const q = el('div', 'moba-seg');
        for (const [id, label] of [['low', '流暢'], ['medium', '平衡'], ['high', '精緻']]) {
            const b = el('button', null, label);
            b.addEventListener('click', () => {
                settings.set('quality', id);
                this.onSetting?.('quality', id);
                this.markQuality(id);
            });
            b.dataset.q = id;
            q.append(b);
        }
        row('畫質', q);
        this.qualitySeg = q;
        this.markQuality(settings.get('quality'));

        box.append(el('div', 'moba-help',
            '電腦：WASD 走位　空白鍵普攻　Q F E R 技能（撳住睇範圍）\n'
            + '　　　X 返程　B 商店　滾輪縮放\n'
            + '手機：左邊拖動走位　右邊撳普攻　技能掣撳住拖出去瞄準再放手　雙指縮放'));
    }

    markQuality(q) {
        if (!this.qualitySeg) return;
        for (const b of this.qualitySeg.children) b.classList.toggle('on', b.dataset.q === q);
    }

    setPortrait(dataUrl) {
        if (!dataUrl) return;
        this.portrait.style.backgroundImage = `url(${dataUrl})`;
        this.portrait.style.backgroundSize = 'cover';
        this.portrait.style.backgroundPosition = 'center 22%';
    }

    toggleSettings(force) {
        const open = force ?? this.settings.classList.contains('hidden');
        this.settings.classList.toggle('hidden', !open);
        if (open) this.toggleShop(false);
    }

    toggleShop(force) {
        this.shopOpen = force ?? !this.shopOpen;
        this.shop.classList.toggle('hidden', !this.shopOpen);
        this.root.classList.toggle('shop-open', this.shopOpen);
        if (this.shopOpen) this.toggleSettings(false);
    }

    showCast(ab) {
        this.cast.textContent = `${ab.key}　${ab.name}`;
        this.cast.classList.remove('play');
        void this.cast.offsetWidth;          // 迫瀏覽器重播動畫
        this.cast.classList.add('play');
    }

    // 補刀嘅金幣彈一彈：撳中同撳唔中要睇得出分別
    goldPop(gold) {
        const n = el('div', 'moba-goldpop', `+${gold}`);
        this.root.append(n);
        setTimeout(() => n.remove(), 900);
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
            } else if (ev.type === 'cs' && ev.id === this.sim.player.id) {
                // 補刀係呢隻遊戲最核心嘅操作，但之前撳中同撳唔中冇任何分別
                this.goldPop(ev.gold);
            } else if (ev.type === 'recallCancel' && ev.id === this.sim.player.id) {
                if (ev.why === 'damaged') this.flash('食到傷害，返程被打斷');
            }
        }
    }

    // 由 -fountainX 到 +fountainX 壓成一條橫條。畫嘅嘢由少到多：
    // 底線 → 建築 → 兵線重心 → 英雄。愈後畫愈唔會被蓋住。
    #lane() {
        const cv = this.laneCanvas;
        const w = this.laneWrap.clientWidth;
        if (!w) return;
        const h = 26;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
            cv.width = Math.round(w * dpr);
            cv.height = Math.round(h * dpr);
            cv.style.width = `${w}px`;
            cv.style.height = `${h}px`;
        }
        const g = cv.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);

        const pad = 8;
        const span = MAP.fountainX * 2;
        const px = (x) => pad + ((x + MAP.fountainX) / span) * (w - pad * 2);
        const mid = h / 2;

        g.strokeStyle = 'rgba(255,255,255,0.16)';
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(px(-MAP.fountainX), mid); g.lineTo(px(MAP.fountainX), mid); g.stroke();

        const sim = this.sim;
        const colour = (t) => (t === TEAM.BLUE ? '#4ea4ff' : '#ff5a48');

        // 建築：拆咗嘅照畫但變灰，噉先睇得出邊邊已經破咗
        for (const e of sim.entities.concat(this.deadStructures ?? [])) {
            if (e.kind !== 'tower' && e.kind !== 'nexus') continue;
            const x = px(e.x);
            const big = e.kind === 'nexus';
            g.fillStyle = e.alive ? colour(e.team) : 'rgba(255,255,255,0.18)';
            const sz = big ? 5 : 3.4;
            g.fillRect(x - sz / 2, mid - sz, sz, sz * 2);
        }

        // 兵線重心：一隊一條短棒，睇得出兵線推咗去邊
        for (const team of [TEAM.BLUE, TEAM.RED]) {
            const ms = sim.entities.filter(e => e.alive && e.kind === 'minion' && e.team === team);
            if (!ms.length) continue;
            const cx = px(ms.reduce((a, m) => a + m.x, 0) / ms.length);
            g.fillStyle = colour(team);
            g.globalAlpha = 0.45;
            g.fillRect(cx - 1.5, mid - 8, 3, 16);
            g.globalAlpha = 1;
        }

        // 英雄：死咗嘅畫成空心，一眼睇得出而家係幾對幾
        for (const c of sim.champions) {
            const x = px(c.x);
            const y = c.team === TEAM.BLUE ? mid - 8 : mid + 8;
            g.beginPath();
            g.arc(x, y, c.isPlayer ? 5 : 3.6, 0, Math.PI * 2);
            if (!c.alive) {
                g.strokeStyle = colour(c.team);
                g.globalAlpha = 0.45;
                g.lineWidth = 1.5;
                g.stroke();
                g.globalAlpha = 1;
            } else {
                g.fillStyle = c.isPlayer ? '#ffe27a' : colour(c.team);
                g.fill();
                if (c.isPlayer) {
                    g.strokeStyle = '#0b0e17';
                    g.lineWidth = 1.5;
                    g.stroke();
                }
            }
        }
    }

    update() {
        const sim = this.sim, p = sim.player;
        // 拆咗嘅建築會由 entities 消失，但總覽要繼續畫返個灰位
        if (!this.deadStructures) this.deadStructures = [];
        for (const e of sim.entities) {
            if ((e.kind === 'tower' || e.kind === 'nexus') && !e.alive
                && !this.deadStructures.includes(e)) this.deadStructures.push(e);
        }
        this.#lane();
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

        const target = p.orderTarget != null && sim.entities.find(e => e.id === p.orderTarget);
        this.attackBtn.classList.toggle('on', !!(target && target.alive));
        // 普攻間隔成一秒半。冇呢個掃描，玩家撳完乜反應都冇，就會覺得
        // 「個掣壞咗」而唔係「仲要等」——技能掣一直都有讀秒，普攻反而冇。
        const gap = 1 / Math.max(0.2, sim.stats(p).attackSpeed);
        const wait = Math.max(0, Math.min(1, p.cd / gap));
        this.attackBtn.style.setProperty('--cd', wait.toFixed(3));
        this.attackBtn.style.setProperty('--cd-on', wait > 0.02 ? '1' : '0');

        // 返程：喺屋企就冇意思，讀秒中就變成一條進度條
        const prog = sim.recallProgress(p);
        const home = sim.canShop(p);
        this.recallBtn.classList.toggle('hidden', home || !p.alive);
        this.recallBtn.classList.toggle('on', prog > 0);
        this.recallBar.classList.toggle('hidden', prog <= 0);
        if (prog > 0) this.recallFill.style.width = `${prog * 100}%`;

        // 商店：買唔買得起用顏色講，唔使玩家自己計數
        if (this.shopOpen) {
            const canShop = sim.canShop(p);
            this.shopState.textContent = canShop
                ? `商店 · 泉水內 · ${Math.floor(p.gold)} 金`
                : `商店 · 未在泉水 · ${Math.floor(p.gold)} 金`;
            this.shopRecall.classList.toggle('hidden', canShop || !p.alive);
            this.shopRecall.textContent = sim.recallProgress(p) > 0 ? '返程中 · 返回戰場' : '返程購物';
            for (const { card, item } of this.shopCards) {
                card.classList.toggle('afford', canShop && p.gold >= item.cost && p.items.length < MAX_ITEMS);
                card.classList.toggle('away', !canShop);
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
            this.shopBtn.textContent = hint && canShop ? `商店 · 可買 ${ITEMS[hint].name}` : '商店';
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
