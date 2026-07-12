// LV2 RTS 敵方電腦：一個簡單但完整嘅 RTS 經濟＋軍事循環。
//   1. 開局派村民去採資源（食物同黃金各半）
//   2. 持續訓練村民擴充經濟，直到夠人手
//   3. 資源夠就喺兵營出兵（士兵為主、溝啲弓兵）
//   4. 儲夠一隊就 attack-move 攻向玩家城鎮中心
//   5. 基地受襲就召返部隊回防
import { TEAM } from '../constants.js';
import { RTS_UNITS, RTS_BUILDINGS } from './rts.js';

export class RtsAI {
    constructor(game, difficulty = 'normal') {
        this.game = game;
        this.team = TEAM.ENEMY;
        this.enemyTeam = TEAM.PLAYER;
        // 難度：思考間隔、目標村民數、出擊部隊門檻
        const D = {
            easy: { tick: 1.6, workers: 6, army: 8, econFocus: 0.7 },
            normal: { tick: 1.0, workers: 8, army: 6, econFocus: 0.6 },
            hard: { tick: 0.7, workers: 10, army: 5, econFocus: 0.55 },
        };
        this.cfg = D[difficulty] ?? D.normal;
        this.acc = 0;
        this.assignAcc = 0;
        this.attacking = false;
    }

    update(dt) {
        const g = this.game;
        if (g.phase === 'ended') return;
        this.acc += dt; this.assignAcc += dt;

        // 每 0.6s 派閒置村民去採資源（就近、平衡兩種資源）
        if (this.assignAcc >= 0.6) {
            this.assignAcc = 0;
            this.#assignIdleVillagers();
        }

        if (this.acc < this.cfg.tick) return;
        this.acc = 0;

        const tc = g.towncenter[this.team];
        if (!tc || tc.dead) return;
        const barracks = g.entities.filter(e => e.kind === 'building' && e.team === this.team
            && e.buildingType === 'barracks' && e.complete && !e.dead);

        const villagers = g.entities.filter(e => e.unitType === 'villager' && e.team === this.team && !e.dead);
        const army = g.entities.filter(e => e.kind === 'unit' && e.unitType !== 'villager' && e.team === this.team && !e.dead);
        const res = g.res[this.team];
        const pop = g.population(this.team);
        const cap = g.popCap[this.team];

        // 人口快滿 → 起房屋（用有黃金先）
        if (pop >= cap - 2 && cap < 60 && res.gold >= RTS_BUILDINGS.house.cost.gold + 20) {
            const idle = villagers.find(v => v.command.type === 'idle' || v.command.type === 'gather');
            if (idle) {
                const sz = -1; // 敵方 z<0
                const hx = (Math.random() - 0.5) * 8;
                const hz = -6 - Math.random() * 5;
                g.startBuild([idle], 'house', hx, hz, this.team);
            }
        }

        // 訓練村民擴充經濟
        if (villagers.length + this.#queued(tc) < this.cfg.workers && tc.trainQueue.length < 2) {
            g.queueTrain(tc, 'villager');
        }

        // 出兵：兵營夠資源就排（士兵為主，約 1/3 弓兵）
        for (const b of barracks) {
            if (b.trainQueue.length >= 2) continue;
            const wantArcher = army.filter(a => a.unitType === 'archer').length < army.length * 0.35;
            const type = wantArcher ? 'archer' : 'soldier';
            if (g.canAfford(this.team, RTS_UNITS[type].cost)) g.queueTrain(b, type);
            else if (g.canAfford(this.team, RTS_UNITS.soldier.cost)) g.queueTrain(b, 'soldier');
        }

        // 回防：城鎮中心血少過 80% 或者附近有敵人 → 全軍回防
        const underThreat = tc.hp < tc.maxHp * 0.8 || this.#enemyNear(tc, 10);
        if (underThreat && army.length) {
            const threat = this.#nearestEnemyTo(tc);
            if (threat) g.commandAttack(army, threat);
            this.attacking = false;
            return;
        }

        // 出擊：湊夠一隊就攻向玩家中心
        if (army.length >= this.cfg.army) {
            const idleArmy = army.filter(a => a.command.type === 'idle');
            if (!this.attacking || idleArmy.length >= 3) {
                const target = this.#pickAttackTarget();
                if (target) { g.commandAttack(army, target); this.attacking = true; }
            }
        }
    }

    #queued(tc) { return tc.trainQueue.filter(t => t === 'villager').length; }

    #assignIdleVillagers() {
        const g = this.game;
        const idle = g.entities.filter(e => e.unitType === 'villager' && e.team === this.team && !e.dead && e.command.type === 'idle');
        if (!idle.length) return;
        // 睇邊種資源少啲就補嗰種
        const res = g.res[this.team];
        for (const v of idle) {
            const want = res.food <= res.gold ? 'food' : 'gold';
            const node = this.#nearestResourceTo(v, want) ?? this.#nearestResourceTo(v, null);
            if (node) g.commandGather([v], node);
        }
    }

    #nearestResourceTo(e, resType) {
        let best = null, bestD = Infinity;
        for (const o of this.game.entities) {
            if (o.dead || o.kind !== 'resource') continue;
            if (resType && o.resType !== resType) continue;
            const d = Math.hypot(o.x - e.x, o.z - e.z);
            if (d < bestD) { best = o; bestD = d; }
        }
        return best;
    }

    #enemyNear(e, range) {
        return this.game.entities.some(o => !o.dead && o.team === this.enemyTeam && o.kind !== 'resource'
            && Math.hypot(o.x - e.x, o.z - e.z) < range);
    }
    #nearestEnemyTo(e) {
        let best = null, bestD = Infinity;
        for (const o of this.game.entities) {
            if (o.dead || o.team !== this.enemyTeam || o.kind === 'resource') continue;
            const d = Math.hypot(o.x - e.x, o.z - e.z);
            if (d < bestD) { best = o; bestD = d; }
        }
        return best;
    }
    // 優先攻擊玩家城鎮中心；如果玩家部隊擋路就先清
    #pickAttackTarget() {
        const g = this.game;
        const ptc = g.towncenter[this.enemyTeam];
        return (ptc && !ptc.dead) ? ptc : this.#nearestEnemyTo(g.towncenter[this.team]);
    }
}
