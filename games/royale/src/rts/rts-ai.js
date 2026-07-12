// LV2 RTS 敵方電腦：一個簡單但完整嘅 RTS 經濟＋軍事循環。
//   1. 開局派村民去採資源（食物同黃金各半）
//   2. 持續訓練村民擴充經濟，直到夠人手
//   3. 資源夠就喺兵營出兵（士兵為主、溝啲弓兵）
//   4. 儲夠一隊就 attack-move 攻向玩家城鎮中心
//   5. 基地受襲就召返部隊回防
import { TEAM } from '../constants.js';
import { RTS_UNITS, RTS_BUILDINGS, TC_UPGRADE, RTS_MAX_AGE } from './rts.js';

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

        // 每 0.6s 管理村民採集：派閒置＋平衡食物/黃金比例（唔會全部黐死一種資源）
        if (this.assignAcc >= 0.6) {
            this.assignAcc = 0;
            this.#manageVillagers();
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
        if (pop >= cap - 3 && cap < 66 && res.gold >= RTS_BUILDINGS.house.cost.gold + 20) {
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

        // 升級主城：夠人手就儲資源升代。儲緊嗰陣暫停出兵（保留最低防守）
        let saving = false;
        if (!tc.upgrading && tc.age < RTS_MAX_AGE && villagers.length >= this.cfg.workers - 3) {
            const up = TC_UPGRADE[tc.age + 1];
            if (res.food >= up.cost.food && res.gold >= up.cost.gold) g.queueUpgrade(tc);
            else saving = true; // 未夠 → 儲住，唔好嘥晒喺出兵
        }

        // 出兵：跟時代揀最強嘅可出兵種。儲緊升級就淨係維持最低防守
        const age = g.teamAge(this.team);
        const minDefense = 4;
        for (const b of barracks) {
            if (b.trainQueue.length >= 2) continue;
            if (saving && army.length >= minDefense) continue;
            const type = this.#pickUnit(age, army);
            if (type && g.canAfford(this.team, RTS_UNITS[type].cost)) g.queueTrain(b, type);
            else if (!saving && g.canAfford(this.team, RTS_UNITS.soldier.cost)) g.queueTrain(b, 'soldier');
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

    // 按時代揀出兵：溝配前排肉盾／遠程／攻城，時代越高用越強嘅兵
    #pickUnit(age, army) {
        const pool = Object.keys(RTS_UNITS).filter(k => k !== 'villager' && (RTS_UNITS[k].age ?? 1) <= age);
        const has = (t) => army.filter(a => a.unitType === t).length;
        const ranged = army.filter(a => RTS_UNITS[a.unitType]?.projectile).length;
        // 遠程比例唔夠三成 → 補遠程（時代內最強）
        if (ranged < army.length * 0.3) {
            if (age >= 3 && Math.random() < 0.3 && this.#afford('catapult')) return 'catapult';
            if (age >= 2 && this.#afford('handcannon')) return 'handcannon';
            if (this.#afford('archer')) return 'archer';
        }
        // 攻城：第三代溝少少攻城槌拆基地
        if (age >= 3 && has('ram') < 2 && this.#afford('ram') && Math.random() < 0.25) return 'ram';
        // 主力肉／近戰：時代內最強
        const meleePriority = ['elephant', 'knight', 'berserker', 'scout', 'pikeman', 'soldier']
            .filter(t => (RTS_UNITS[t].age ?? 1) <= age);
        for (const t of meleePriority) if (this.#afford(t)) return t;
        return pool.find(t => this.#afford(t)) ?? null;
    }
    #afford(type) { return this.game.canAfford(this.team, RTS_UNITS[type].cost); }

    // 採集分配：每個村民有一個穩定嘅職責（採食物定黃金，約 55/45），
    // 只係派閒置村民、絕不 mid-trip 亂調（避免村民喺兩種資源之間來回行、永遠卸唔到貨）。
    // 只有當某種資源嚴重短缺先溫和咁調一個村民過去。
    #manageVillagers() {
        const g = this.game;
        const vills = g.entities.filter(e => e.unitType === 'villager' && e.team === this.team && !e.dead);
        if (!vills.length) return;
        // 派職責（55% 食物）——一次過定死，之後唔亂改
        let foodDuty = vills.filter(v => v._duty === 'food').length;
        for (const v of vills) {
            if (v._duty) continue;
            const wantFood = foodDuty < Math.round(vills.length * 0.55);
            v._duty = wantFood ? 'food' : 'gold';
            if (wantFood) foodDuty++;
        }
        // 溫和修正：某資源嚴重短缺就調一個對面職責嘅村民過去（每 tick 最多一個）
        const res = g.res[this.team];
        if (res.food < 120 && foodDuty < vills.length - 1) { const v = vills.find(x => x._duty === 'gold'); if (v) v._duty = 'food'; }
        else if (res.gold < 90 && foodDuty > 1) { const v = vills.find(x => x._duty === 'food'); if (v) v._duty = 'gold'; }
        // 任何唔係採集/建造中嘅村民（閒置、卡喺 rally move）都派去做嘢——
        // 唔可以畀佢哋卡喺集結點永遠唔採資源（之前經濟停滯嘅主因）
        for (const v of vills) {
            const c = v.command.type;
            if (c === 'gather' || c === '_return' || c === 'build') continue;
            const n = this.#nearestResourceTo(v, v._duty) ?? this.#nearestResourceTo(v, null);
            if (n) g.commandGather([v], n);
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
