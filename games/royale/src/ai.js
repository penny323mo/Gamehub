// AI 對手 — 防守反應 + 進攻推線 + 法術運用 + 三種打法個性
import { TEAM, ARENA, GAME_RULES } from './constants.js';
import { CARDS } from './cards.js';

const DIFFICULTY = {
    easy: { interval: 1.6, skipChance: 0.3, attackElixir: 9, defendChance: 0.6, spellIQ: 0.4 },
    normal: { interval: 0.8, skipChance: 0.1, attackElixir: 8, defendChance: 0.9, spellIQ: 0.75 },
    hard: { interval: 0.45, skipChance: 0.0, attackElixir: 7, defendChance: 1.0, spellIQ: 1.0 },
};

// 打法個性：卡組 + 對難度參數嘅偏移
export const PERSONALITIES = {
    aggro: {
        name: '狂攻型', icon: '🔥',
        deck: ['scout', 'militia', 'knight', 'berserker', 'ram', 'powderkeg', 'arrows', 'elephant'],
        attackElixirDelta: -2, defendMult: 0.6, intervalMult: 1.0,
    },
    control: {
        name: '防反型', icon: '🛡️',
        deck: ['archers', 'pikemen', 'handcannon', 'ballista', 'mill', 'freeze', 'fireball', 'elephant'],
        attackElixirDelta: +1, defendMult: 1.15, intervalMult: 1.0,
    },
    cycle: {
        name: '快循環型', icon: '♻️',
        deck: ['militia', 'scout', 'archers', 'pikemen', 'powderkeg', 'swordsman', 'arrows', 'ram'],
        attackElixirDelta: -1, defendMult: 1.0, intervalMult: 0.8,
    },
};

export function randomPersonality() {
    const keys = Object.keys(PERSONALITIES);
    return keys[Math.floor(Math.random() * keys.length)];
}

export class AIController {
    constructor(game, difficulty = 'normal', personality = null, stage = 0) {
        this.game = game;
        const base = DIFFICULTY[difficulty] ?? DIFFICULTY.normal;
        const p = PERSONALITIES[personality] ?? null;
        this.personality = personality;
        this.cfg = p ? {
            ...base,
            interval: base.interval * p.intervalMult,
            attackElixir: Math.max(5, base.attackElixir + p.attackElixirDelta),
            defendChance: Math.min(1, base.defendChance * p.defendMult),
        } : base;
        // 連勝關卡：難度升級行「戰術銳化」呢條路（諗嘢快啲、時機捉得準啲），
        // 唔靠經濟作弊——第 3 關開始漸進，第 8 關去到滿格
        this.sharp = Math.min(1, Math.max(0, (stage - 2) / 6));
        this.cfg = { ...this.cfg, interval: this.cfg.interval * (1 - 0.3 * this.sharp) };
        this.timer = 2.0; // 開波唞一唞
        this.spellCd = 0;
        this.recentPlays = []; // 最近成功出過嘅卡 id（防止同一張卡連環抌）
        // 聖水數牌：同真人一樣「靠睇」估對手水量——由開局 5 滴計起，
        // 見到佢出卡就扣返，回復用大家都知嘅官方倍率推算。絕唔偷睇真值。
        this.oppElixir = GAME_RULES.elixirStart;
        this.oppSeen = 0; // 已入賬嘅 playedCards index
    }

    update(dt) {
        if (this.game.phase === 'ended') return;
        const g = this.game;

        // 聖水數牌（每幀更新，唔受思考間隔限制——真人都係一路睇一路數）
        const played = g.playedCards[TEAM.PLAYER];
        while (this.oppSeen < played.length) {
            const c = CARDS[played[this.oppSeen++]];
            if (c) this.oppElixir = Math.max(0, this.oppElixir - c.cost);
        }
        this.oppElixir = Math.min(GAME_RULES.elixirMax,
            this.oppElixir + (dt * g.elixirMultiplier()) / GAME_RULES.elixirInterval);

        this.timer -= dt;
        this.spellCd -= dt;
        if (this.timer > 0) return;
        this.timer = this.cfg.interval;
        if (Math.random() < this.cfg.skipChance) return;

        const me = g.players[TEAM.ENEMY];

        // 1. 法術：搵玩家單位嘅密集點抌落去
        if (this.spellCd <= 0 && this.trySpell()) {
            this.spellCd = 3;
            return;
        }

        // 2. 防守：有玩家單位入咗我半場
        const threats = g.aliveUnits(TEAM.PLAYER).filter(e => e.z < -ARENA.riverHalf);
        if (threats.length && Math.random() < this.cfg.defendChance) {
            const threatValue = threats.reduce((s, e) => s + (e.card?.cost ?? 2) * (e.hp / e.maxHp), 0);
            if (threatValue >= 2 && this.tryDefend(threats, threatValue)) return;
        }

        // 3. 冇威脅又夠水：落聖水磨坊儲經濟
        if (!threats.length && me.elixir >= 8) {
            const mills = this.affordable(c => c.elixirGen);
            if (mills.length && Math.random() < 0.7) {
                const x = (Math.random() < 0.5 ? -1 : 1) * 2.2;
                if (this.play(mills[0].i, x, -11.5)) return;
            }
        }

        // 4. 進攻時機：靠數牌捉窗口——對手估計冇乜水就提早施壓（懲罰窗口），
        //    對手滿水就穩陣啲儲多滴先郁（免俾佢輕鬆反擊）。IQ 低嘅 AI 唔識咁諗。
        const iq = this.cfg.spellIQ;
        const punish = this.oppElixir <= 3.5 ? -2 * iq : 0;
        const wary = this.oppElixir >= 9.5 ? 1 * iq : 0;
        const threshold = Math.max(4, this.cfg.attackElixir + punish + wary - this.sharp);
        if (me.elixir >= threshold) {
            const attacked = this.tryAttack();
            if (!attacked && me.elixir >= GAME_RULES.elixirMax) this.playAnyCheap();
        }
    }

    // 有得打嘅手牌 index，null = 冇
    affordable(filter = () => true) {
        const me = this.game.players[TEAM.ENEMY];
        const options = [];
        me.hand.forEach((id, i) => {
            const c = CARDS[id];
            if (c && me.elixir >= c.cost && filter(c)) options.push({ i, c });
        });
        return options;
    }

    play(handIdx, x, z) {
        const id = this.game.players[TEAM.ENEMY].hand[handIdx];
        const ok = this.game.playCard(TEAM.ENEMY, handIdx, x, z);
        if (ok) {
            this.recentPlays.push(id);
            if (this.recentPlays.length > 4) this.recentPlays.shift();
        }
        return ok;
    }

    // 最近兩次出過嘅卡，有其他選擇就唔好again——AI 都要似個真人咁換吓招，
    // 唔可以聖水一浸就無限重複同一張王牌（玩家見到會覺得 AI 濫用機制）
    notRecent(options) {
        const recent = this.recentPlays.slice(-2);
        const fresh = options.filter(o => !recent.includes(o.c.id));
        return fresh.length ? fresh : options;
    }

    trySpell() {
        const spells = this.affordable(c => c.kind === 'spell');
        if (!spells.length) return false;
        const playerUnits = this.game.aliveUnits(TEAM.PLAYER)
            .filter(e => e.card && e.card.kind === 'unit');
        for (const { i, c } of spells) {
            // 搵最大價值嘅落點
            let best = null, bestValue = 0;
            for (const center of playerUnits) {
                let value = 0;
                for (const o of playerUnits) {
                    const dx = o.x - center.x, dz = o.z - center.z;
                    if (dx * dx + dz * dz <= c.splash * c.splash) {
                        value += o.card.cost / (o.card.count ?? 1);
                    }
                }
                if (value > bestValue) { bestValue = value; best = center; }
            }
            const threshold = c.cost * (this.cfg.spellIQ >= 1 ? 0.9 : 1.3);
            if (best && bestValue >= threshold && Math.random() < this.cfg.spellIQ) {
                return this.play(i, best.x, best.z);
            }
            // 困難 AI：火球執雞收殘塔
            if (this.cfg.spellIQ >= 1 && c.id === 'fireball') {
                for (const key of ['left', 'right', 'king']) {
                    const t = this.game.towers[TEAM.PLAYER][key];
                    if (!t.dead && t.hp <= c.dmg * 0.35) {
                        return this.play(i, t.x, t.z);
                    }
                }
            }
        }
        return false;
    }

    tryDefend(threats, threatValue = 99) {
        // 揀最入嗰個威脅
        const lead = threats.reduce((a, b) => (a.z < b.z ? a : b));
        const isSwarm = threats.length >= 3;
        const isTank = lead.maxHp >= 700;

        // 揀反制卡：兵海用平價多兵，坦克用長槍／高傷。
        // 防守使費要同威脅價值成比例——唔好用 7 費卡接 3 費小兵（換水就輸咗），
        // 冇平價選擇先至焗住用貴卡
        const budget = threatValue + 2;
        let options = this.affordable(c => c.kind === 'unit' && !c.targetsBuildingsOnly && c.cost <= budget);
        if (!options.length) options = this.affordable(c => c.kind === 'unit' && !c.targetsBuildingsOnly);
        if (!options.length) {
            // 或者擺個防禦建築（磨坊冇攻擊力，唔算）
            const b = this.affordable(c => c.kind === 'building' && c.dmg > 0);
            if (b.length) {
                return this.play(b[0].i, 0, -6);
            }
            return false;
        }
        let pick;
        if (isTank) {
            pick = options.find(o => o.c.id === 'pikemen')
                ?? options.reduce((a, b) => (a.c.dmg * (a.c.count ?? 1) > b.c.dmg * (b.c.count ?? 1) ? a : b));
        } else if (isSwarm) {
            pick = options.find(o => (o.c.count ?? 1) >= 3 || o.c.splash)
                ?? options[0];
        } else {
            pick = options.reduce((a, b) => (a.c.cost < b.c.cost ? a : b));
        }
        // 擺喺威脅同自己塔之間
        const dz = Math.max(-13, lead.z - 2.5);
        const dx = lead.x * 0.75;
        return this.play(pick.i, dx, dz);
    }

    tryAttack() {
        const g = this.game;
        // 揀玩家較殘嗰路
        const pl = g.towers[TEAM.PLAYER].left, pr = g.towers[TEAM.PLAYER].right;
        let laneX = (pl.dead ? -1 : pr.dead ? 1
            : (pl.hp / pl.maxHp <= pr.hp / pr.maxHp ? -1 : 1)) * ARENA.bridgeX;

        // 分路施壓：玩家重兵壓緊一邊而兩座塔都仲健在，就攻另一邊——
        // 迫佢分水兩邊處理，鬥嘅係節奏唔係數值（IQ 低嘅 AI 未學識）
        if (!pl.dead && !pr.dead && Math.random() < this.cfg.spellIQ * (0.5 + 0.4 * this.sharp)) {
            const advancing = g.aliveUnits(TEAM.PLAYER).filter(e => e.z < 2 && e.card?.kind === 'unit');
            const leftCost = advancing.filter(e => e.x < 0).reduce((s, e) => s + (e.card?.cost ?? 2), 0);
            const rightCost = advancing.reduce((s, e) => s + (e.card?.cost ?? 2), 0) - leftCost;
            if (leftCost >= 6 && leftCost > rightCost * 2) laneX = ARENA.bridgeX;       // 佢重左，我攻右
            else if (rightCost >= 6 && rightCost > leftCost * 2) laneX = -ARENA.bridgeX; // 佢重右，我攻左
        }

        // 有坦克先出坦克喺後排；但唔可以疊——場上已經有隻大坦克就轉出支援兵，
        // 揀卡又唔可以永遠「HP 最高」嗰張（以前兩樣夾埋，聖水一充裕就變咗無限戰象）
        const hasBigTank = g.aliveUnits(TEAM.ENEMY).some(e => (e.card?.hp ?? 0) >= 900);
        let tanks = this.affordable(c => c.kind === 'unit' && (c.hp >= 900 || c.targetsBuildingsOnly));
        if (hasBigTank) tanks = tanks.filter(o => o.c.hp < 900); // 剩返攻城槌類短程衝門
        tanks = this.notRecent(tanks);
        if (tanks.length) {
            const pick = tanks[Math.floor(Math.random() * tanks.length)];
            // 攻城槌直接喺橋頭出，大坦克喺後排慢慢行
            const z = pick.c.targetsBuildingsOnly ? -(ARENA.riverHalf + 1.2) : -12;
            return this.play(pick.i, laneX, z);
        }
        // 支援：自己有單位喺前線就補後排
        const myFront = g.aliveUnits(TEAM.ENEMY).filter(e => e.card?.kind === 'unit' && e.z > -8);
        const units = this.notRecent(this.affordable(c => c.kind === 'unit' && !c.targetsBuildingsOnly));
        if (!units.length) return false;
        if (myFront.length) {
            const ranged = units.find(o => o.c.range > 2);
            const pick = ranged ?? units[0];
            return this.play(pick.i, laneX * 0.85, -(ARENA.riverHalf + 2.5));
        }
        const pick = units[Math.floor(Math.random() * units.length)];
        return this.play(pick.i, laneX, -(ARENA.riverHalf + 1.5));
    }

    playAnyCheap() {
        const options = this.notRecent(this.affordable(c => c.kind === 'unit'));
        if (!options.length) return;
        const pick = options.reduce((a, b) => (a.c.cost < b.c.cost ? a : b));
        const laneX = (Math.random() < 0.5 ? -1 : 1) * ARENA.bridgeX;
        this.play(pick.i, laneX, -10);
    }
}
