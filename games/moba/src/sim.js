// 純模擬層：唔 import three.js，所以 node 可以直接跑晒成場比賽去驗規則。
//
// 呢個分層唔係潔癖。MOBA 嘅規則（仇恨、補刀、經驗共享、越塔懲罰、賞金）
// 全部係「一睇個數就知啱唔啱」嘅嘢，而視覺層係「一睇就知靚唔靚」嘅嘢；
// 兩樣混埋一齊嘅話，前者就只可以靠肉眼喺瀏覽器度撞彩驗證。

import {
    TEAM, enemyOf, MAP, SPAWN_SPREAD, TICK, WAVE_FIRST, WAVE_PERIOD, SIEGE_EVERY,
    MINION, MINION_STOP_MARGIN, TOWER, NEXUS, MAX_LEVEL, XP_TO_LEVEL, XP_SHARE_RANGE,
    GAME_MAX, KILL_GOLD, ASSIST_GOLD, ASSIST_WINDOW, GOLD_PER_SEC, START_GOLD,
    RESPAWN_BASE, RESPAWN_PER_LEVEL, SHUTDOWN_PER_STREAK, SHUTDOWN_MAX,
    armourMul, structureArmour, TOWER_AGGRO_MEMORY, FOUNTAIN_HEAL_PCT, FOUNTAIN_RADIUS,
    PUSH_STRENGTH, SIEGE_DENSE_AT, SIEGE_EVERY_WAVE_AT, WARDEN, RECALL,
} from './constants.js?v=smooth-12';
import { CHAMPIONS, abilityRank, scaled } from './champions.js?v=smooth-12';
import { ITEMS, MAX_ITEMS, itemBonus } from './items.js?v=smooth-12';

// 可重現嘅亂數：測試要跑到同一場比賽。
//
// xorshift32 直接攞一個細整數做初始狀態嘅話，頭幾個輸出仲未擴散開。實測
// seed 101–124，第一個輸出嘅平均係 0.007（唔係 0.5），第二個由 0.21 跳到
// 0.77。即係邊個消費第一個亂數，邊個就每一場都攞到差唔多同一個極端值——
// 而喺呢度第一個消費者係第一個 bot 嘅反應時間。順序 seed（101、102、103…）
// 更加令幾場之間嘅頭幾個數互相關聯，所以連「跑多幾場拉勻」都救唔到。
//
// 所以 seed 要先用一個乘法常數撈勻，再空轉八轉先開始出數。同一個 seed 仍然
// 一定跑到同一場波，只係換咗條序列。
function makeRng(seed) {
    let s = (Math.imul(seed >>> 0 || 1, 0x9e3779b1) ^ 0x85ebca6b) >>> 0 || 1;
    const next = () => {
        s ^= s << 13; s >>>= 0;
        s ^= s >> 17;
        s ^= s << 5; s >>>= 0;
        return s / 4294967296;
    };
    for (let i = 0; i < 8; i++) next();
    return next;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// 隊伍方向：藍方向 +x 打，紅方向 -x 打。
const dirOf = (team) => (team === TEAM.BLUE ? 1 : -1);
const sideSign = (team) => (team === TEAM.BLUE ? -1 : 1);

export class Sim {
    constructor(opts = {}) {
        this.rng = makeRng(opts.seed ?? 12345);
        this.time = 0;
        this.nextId = 1;
        this.entities = [];
        this.projectiles = [];
        this.zones = [];              // 持續區域（火地、陷阱、治療圈）
        this.events = [];             // 畀畫面／音效／播報消費，用 drain() 攞走
        this.over = null;             // { winner }
        this.waveCount = 0;
        this.nextWaveAt = WAVE_FIRST;

        this.#buildStructures();
        this.#spawnChampions(opts.lineups ?? {
            [TEAM.BLUE]: ['ironward', 'longshot', 'dawnkeeper'],
            [TEAM.RED]: ['duskblade', 'emberwake', 'ironhulk'],
        }, opts.playerIndex ?? 0);
    }

    // ---------- 建立 ----------
    #add(e) {
        e.id = this.nextId++;
        e.alive = true;
        this.entities.push(e);
        return e;
    }

    #buildStructures() {
        for (const team of [TEAM.BLUE, TEAM.RED]) {
            const s = sideSign(team);
            MAP.towerX.forEach((x, tier) => {
                const hp = TOWER.hpByTier[tier];
                this.#add({
                    kind: 'tower', team, tier,
                    x: s * x, z: 0, r: 2.2,
                    hp, maxHp: hp, armour: TOWER.armour,
                    range: TOWER.range, attackSpeed: TOWER.attackSpeed, damage: TOWER.damage,
                    cd: 0, target: null, ramp: 0,
                });
            });
            this.#add({
                kind: 'nexus', team,
                x: s * MAP.nexusX, z: 0, r: 3.4,
                hp: NEXUS.hp, maxHp: NEXUS.hp, armour: NEXUS.armour,
                range: NEXUS.range, attackSpeed: NEXUS.attackSpeed, damage: NEXUS.damage,
                cd: 0, target: null, ramp: 0,
            });
        }
    }

    #spawnChampions(lineups, playerIndex) {
        this.champions = [];
        for (const team of [TEAM.BLUE, TEAM.RED]) {
            lineups[team].forEach((id, i) => {
                const def = CHAMPIONS[id];
                const c = this.#add({
                    kind: 'champ', team, def, champId: id,
                    x: sideSign(team) * MAP.fountainX,
                    z: (i - 1) * SPAWN_SPREAD,
                    r: 1.0,
                    level: 1, xp: 0, gold: START_GOLD,
                    kills: 0, deaths: 0, assists: 0, cs: 0, streak: 0,
                    respawnAt: 0, cd: 0, target: null,
                    shield: 0, shieldUntil: 0,
                    stunUntil: 0, rootUntil: 0, slow: 0, slowUntil: 0,
                    buffs: {},                    // name -> { until, ...data }
                    stacks: 0, stackUntil: 0,     // 畀被動用
                    abilityCd: [0, 0, 0, 0],
                    items: [],
                    lastDamagedBy: new Map(),     // id -> time
                    lastMoveAt: 0, standingSince: 0,
                    isPlayer: team === TEAM.BLUE && i === playerIndex,
                    orderX: null, orderZ: null, orderTarget: null,
                    recallUntil: 0,
                });
                this.#applyLevelStats(c, true);
                this.champions.push(c);
            });
        }
        this.player = this.champions.find(c => c.isPlayer) ?? this.champions[0];
    }

    #applyLevelStats(c, full) {
        const d = c.def, l = c.level - 1;
        const before = c.maxHp ?? 0;
        c.maxHp = d.hp + d.hpPerLvl * l;
        c.maxMp = d.mp + d.mpPerLvl * l;
        c.baseDamage = d.damage + d.dmgPerLvl * l;
        c.armour = d.armour + d.armourPerLvl * l;
        c.attackSpeedBase = d.attackSpeed + (d.attackSpeedPerLvl ?? 0) * l;
        c.ap = (d.ap ?? 0) + (d.apPerLvl ?? 0) * l;
        c.hpRegen = d.hpRegen + d.hpRegenPerLvl * l;
        c.mpRegen = d.mpRegen + d.mpRegenPerLvl * l;
        c.range = d.range;
        c.baseSpeed = d.speed;
        if (full) { c.hp = c.maxHp; c.mp = c.maxMp; }
        else if (c.maxHp > before) c.hp += c.maxHp - before;   // 升級補返新增嗰截
    }

    // ---------- 對外查詢 ----------
    get alive() { return this.entities.filter(e => e.alive); }
    enemiesOf(team) { return this.entities.filter(e => e.alive && e.team !== team); }
    alliesOf(team) { return this.entities.filter(e => e.alive && e.team === team); }
    champ(id) { return this.champions.find(c => c.champId === id); }

    // 事件係「呢一格發生咗咩」嘅唯一出口：畫面、音效、播報全部只讀呢條流。
    // 用 drain() 攞走，唔喺 step() 開頭清——因為玩家施法同 bot 施法都係喺
    // step() 之前發生嘅，一喺開頭清就等於未有人讀過就抹走咗。
    // 上限只係一個安全網：測試會連續 step 幾萬次而唔會 drain。
    emit(type, data) {
        this.events.push({ type, ...data });
        if (this.events.length > 512) this.events.splice(0, this.events.length - 512);
    }

    drain() {
        const out = this.events;
        this.events = [];
        return out;
    }

    // 派生數值：buff 全部喺呢度加，唔會寫死落基礎值度（所以 buff 一過就自動消失）
    stats(c) {
        const b = c.buffs;
        const it = itemBonus(c.items);
        let damage = c.baseDamage + it.ad;
        let armour = c.armour + it.armour;
        let speed = c.baseSpeed * (1 + it.speed);
        let attackSpeed = c.attackSpeedBase * (1 + it.attackSpeed);
        let maxHp = c.maxHp + it.hp;
        const ap = c.ap + it.ap;
        const lifesteal = it.lifesteal;
        if (b.rage?.until > this.time) {
            damage *= 1 + b.rage.amount;
            maxHp += b.rage.hp;
        }
        if (b.haste?.until > this.time) speed *= 1 + b.haste.amount;
        if (b.frenzy?.until > this.time) attackSpeed *= 1 + b.frenzy.amount;
        if (b.bulwark?.until > this.time) armour += b.bulwark.amount;
        // 被動
        if (c.def.id === 'ironward' && c.stackUntil > this.time) armour += 3 * c.stacks;
        if (c.def.id === 'ironhulk' && c.hp < maxHp * 0.4) attackSpeed *= 1.3;
        if (c.slowUntil > this.time) speed *= 1 - c.slow;
        return { damage, armour, speed, attackSpeed, maxHp, ap, lifesteal };
    }

    // ---------- 返程 ----------
    // recallUntil 用 0 代表「冇喺度返程」，用時間戳代表「幾時讀完」。
    // 兩件事一定要分得開：一個變數兩用嘅話，「讀完咗」同「未開始」
    // 就變成同一個條件（recallUntil <= time），到時就永遠行唔到傳送嗰步。
    startRecall(c) {
        if (!c.alive || c.recallUntil) return false;
        if (this.atFountain(c)) return false;        // 已經喺屋企就唔使
        c.recallUntil = this.time + RECALL.channel;
        c.orderX = null; c.orderZ = null; c.orderTarget = null;
        this.emit('recallStart', { id: c.id, until: c.recallUntil });
        return true;
    }

    cancelRecall(c, why = 'moved') {
        if (!c.recallUntil) return false;
        c.recallUntil = 0;
        this.emit('recallCancel', { id: c.id, why });
        return true;
    }

    recallProgress(c) {
        if (!c.recallUntil) return 0;
        return Math.min(1, Math.max(0, 1 - (c.recallUntil - this.time) / RECALL.channel));
    }

    #tickRecall(c) {
        if (!c.recallUntil) return false;
        if (!c.alive) { c.recallUntil = 0; return false; }
        // 出手、施法、落移動指令都會斷（呢三樣喺各自嘅入口度處理）
        if (this.time >= c.recallUntil) {
            c.recallUntil = 0;
            c.x = sideSign(c.team) * MAP.fountainX;
            c.z = 0;
            this.emit('recallDone', { id: c.id });
            return false;
        }
        return true;      // 讀秒中：唔郁、唔出手
    }

    // ---------- 泉水／商店 ----------
    atFountain(c) {
        return Math.abs(c.x - sideSign(c.team) * MAP.fountainX) < FOUNTAIN_RADIUS;
    }

    // 爽快模式：商店唔再綁泉水，任何位置都可以買。保留方法係等 HUD、AI
    // 同規則測試共用同一個購買 gate；之後若有暈眩等真正禁買狀態亦有入口。
    canShop(c) {
        return !!c;
    }

    buy(c, itemId) {
        const it = ITEMS[itemId];
        if (!it || !this.canShop(c)) return false;
        if (c.items.length >= MAX_ITEMS || c.gold < it.cost) return false;
        c.gold -= it.cost;
        c.items.push(itemId);
        // 裝備加嘅最大生命要即刻補返落現有血量，唔係買件血裝反而變殘
        if (it.hp) c.hp += it.hp;
        this.emit('buy', { id: c.id, item: itemId });
        return true;
    }

    sell(c, index) {
        const id = c.items[index];
        if (!id) return false;
        const it = ITEMS[id];
        c.items.splice(index, 1);
        c.gold += Math.round(it.cost * 0.7);
        if (it.hp) c.hp = Math.max(1, c.hp - it.hp);
        this.emit('sell', { id: c.id, item: id });
        return true;
    }

    canAct(c) {
        return c.alive && this.time >= c.stunUntil;
    }
    canMove(c) {
        return this.canAct(c) && this.time >= c.rootUntil;
    }

    // ---------- 主迴圈 ----------
    step(dt = TICK) {
        if (this.over) return;
        this.time += dt;

        this.#spawnWaves();
        for (const e of this.entities) {
            if (!e.alive) { this.#tickDead(e, dt); continue; }
            // moving 係「呢一格有冇真位移」，唔係一個會黐住嘅狀態。之前只喺
            // #moveToward 設 true，普通停低冇清返，角色就會原地永久跑步。
            if (e.kind === 'champ' || e.kind === 'minion') e.moving = false;
            if (e.kind === 'champ') this.#tickChampion(e, dt);
            else if (e.kind === 'minion') this.#tickMinion(e, dt);
            else this.#tickStructure(e, dt);
        }
        this.#tickProjectiles(dt);
        this.#tickZones(dt);
        this.#separate(dt);
        this.#timeLimit();
        this.#cleanup();
    }

    #tickDead(e, dt) {
        if (e.kind !== 'champ') return;
        if (this.time >= e.respawnAt) this.#respawn(e);
    }

    #respawn(c) {
        c.alive = true;
        c.hp = c.maxHp; c.mp = c.maxMp;
        c.x = sideSign(c.team) * MAP.fountainX;
        c.z = 0;
        c.shield = 0; c.stunUntil = 0; c.rootUntil = 0; c.slowUntil = 0;
        // buff 唔清嘅話，死之前開嘅加速／狂暴會跟住條屍返嚟
        c.buffs = {};
        c.stacks = 0; c.stackUntil = 0;
        c.tauntUntil = 0; c.towerAggroUntil = 0;
        c.orderX = null; c.orderZ = null; c.orderTarget = null;
        this.emit('respawn', { id: c.id });
    }

    // ---------- 兵線 ----------
    #spawnWaves() {
        if (this.time < this.nextWaveAt) return;
        this.nextWaveAt += WAVE_PERIOD;
        this.waveCount += 1;
        const every = this.time >= SIEGE_EVERY_WAVE_AT ? 1
            : this.time >= SIEGE_DENSE_AT ? 2 : SIEGE_EVERY;
        const siege = this.waveCount % every === 0;
        for (const team of [TEAM.BLUE, TEAM.RED]) {
            const s = sideSign(team);
            // 試過而且否決咗：「對面塔全冧就出超級兵」（即 LoL 兵營被破嗰套）。
            // 聽落好地道，但實測十二場鏡像對局，推爆水晶收場嘅由 10 場跌到 7 場、
            // 中位時長由 20 分鐘升到 22——超級兵推唔穿水晶反而變咗送 130 經驗
            // 60 金幣畀守方，養大咗佢哋守得住。收窄成「自己仲有塔先出」都係
            // 一模一樣嘅結果，即係條件根本唔係關鍵。所以唔要。
            const kinds = [
                ...Array(MINION.melee.count).fill(MINION.melee),
                ...Array(MINION.ranged.count).fill(MINION.ranged),
                ...(siege ? [MINION.siege] : []),
            ];
            kinds.forEach((def, i) => {
                const minutes = this.time / 60;
                this.#add({
                    kind: 'minion', team, def, minionKind: def.key,
                    x: s * (MAP.nexusX - 3) - s * i * 1.4,
                    z: ((i % 3) - 1) * 1.7,
                    r: 0.62,
                    maxHp: def.hp + def.hpPerMin * minutes,
                    hp: def.hp + def.hpPerMin * minutes,
                    damage: def.damage + def.dmgPerMin * minutes,
                    armour: def.armour, range: def.range,
                    attackSpeed: def.attackSpeed, speed: def.speed,
                    cd: 0, target: null,
                    slow: 0, slowUntil: 0, stunUntil: 0, rootUntil: 0,
                });
            });
        }
        this.emit('wave', { n: this.waveCount, siege });
    }

    // ---------- 小兵 ----------
    #tickMinion(m, dt) {
        if (this.time < m.stunUntil) return;
        const foe = this.#pickMinionTarget(m);
        m.target = foe?.id ?? null;
        if (foe && dist(m, foe) <= m.range + foe.r) {
            this.#tryAttack(m, foe, dt);
            return;
        }
        if (this.time < m.rootUntil) return;
        // 冇嘢打就沿住橋推進；有目標但太遠就行埋去
        const goalX = foe ? foe.x : dirOf(m.team) * (MAP.fountainX + 4);
        const goalZ = foe ? foe.z : 0;
        this.#moveToward(m, goalX, goalZ, dt);
    }

    #pickMinionTarget(m) {
        const foes = this.enemiesOf(m.team).filter(e => e.alive);
        let best = null, bestScore = Infinity;
        for (const f of foes) {
            const d = dist(m, f);
            if (d > 18) continue;
            // 優先次序：打緊我嘅英雄 > 小兵 > 英雄 > 建築
            let pri = f.kind === 'minion' ? 0 : f.kind === 'champ' ? 1 : 2;
            const score = pri * 100 + d;
            if (score < bestScore) { bestScore = score; best = f; }
        }
        if (best) return best;
        // 冇人就打前面嘅建築
        return this.#nearestStructure(m);
    }

    // 「呢個單位而家可以打邊座敵方建築」——由外向內、水晶最後。
    // AI 同測試都用呢個入口，所以規則永遠只寫喺一個地方。
    structureTargetFor(e) { return this.#nearestStructure(e); }

    #nearestStructure(e) {
        const foes = this.enemiesOf(e.team).filter(f => f.kind === 'tower' || f.kind === 'nexus');
        let best = null, bd = Infinity;
        for (const f of foes) {
            // 內塔未拆就唔可以打水晶
            if (f.kind === 'nexus' && this.#towersLeft(f.team) > 0) continue;
            if (f.kind === 'tower' && this.#outerTowerAlive(f)) continue;
            const d = dist(e, f);
            if (d < bd) { bd = d; best = f; }
        }
        return best;
    }

    #towersLeft(team) {
        return this.entities.filter(e => e.alive && e.kind === 'tower' && e.team === team).length;
    }
    #outerTowerAlive(tower) {
        // 只可以由外向內拆
        return this.entities.some(e => e.alive && e.kind === 'tower'
            && e.team === tower.team && e.tier < tower.tier);
    }

    // ---------- 建築 ----------
    #tickStructure(t, dt) {
        const target = this.#pickTowerTarget(t);
        t.target = target?.id ?? null;
        if (!target) { t.ramp = 0; return; }
        this.#tryAttack(t, target, dt);
    }

    // 塔嘅仇恨：正常打最近嘅小兵，但一有敵方英雄喺塔範圍內攻擊我方英雄，
    // 塔就即刻轉打嗰個英雄——「越塔」嘅代價就係呢條規則。
    #pickTowerTarget(t) {
        const foes = this.enemiesOf(t.team).filter(e => e.alive && dist(e, t) <= t.range + e.r);
        if (!foes.length) return null;
        const aggro = foes.find(f => f.kind === 'champ'
            && f.towerAggroUntil > this.time && f.towerAggroFrom === t.team);
        if (aggro) return aggro;
        const minions = foes.filter(f => f.kind === 'minion');
        const pool = minions.length ? minions : foes;
        let best = null, bd = Infinity;
        for (const f of pool) { const d = dist(f, t); if (d < bd) { bd = d; best = f; } }
        return best;
    }

    // ---------- 英雄 ----------
    #tickChampion(c, dt) {
        // 回復
        const st = this.stats(c);
        if (c.hp > 0) {
            c.hp = Math.min(st.maxHp, c.hp + (c.hpRegen + itemBonus(c.items).hpRegen) * dt / 5);
            c.mp = Math.min(c.maxMp, c.mp + c.mpRegen * dt / 5);
        }
        // 泉水
        const home = sideSign(c.team) * MAP.fountainX;
        if (Math.abs(c.x - home) < FOUNTAIN_RADIUS) {
            c.hp = Math.min(st.maxHp, c.hp + st.maxHp * FOUNTAIN_HEAL_PCT * dt);
            c.mp = Math.min(c.maxMp, c.mp + c.maxMp * FOUNTAIN_HEAL_PCT * dt);
        }
        c.gold += GOLD_PER_SEC * dt;
        if (c.shieldUntil <= this.time) c.shield = 0;
        if (c.stackUntil <= this.time) c.stacks = 0;
        for (let i = 0; i < 4; i++) c.abilityCd[i] = Math.max(0, c.abilityCd[i] - dt);

        if (!this.canAct(c)) return;
        if (this.#tickRecall(c)) return;      // 返程讀秒：企定唔郁

        // 衝刺進行中
        if (c.dash) { this.#tickDash(c, dt); return; }

        const target = c.orderTarget != null ? this.entities.find(e => e.id === c.orderTarget) : null;
        if (target?.alive && target.team !== c.team) {
            const d = dist(c, target);
            if (d <= c.range + target.r) { this.#tryAttack(c, target, dt); return; }
            if (this.canMove(c)) this.#moveToward(c, target.x, target.z, dt);
            return;
        }
        if (c.orderX != null && this.canMove(c)) {
            const arrived = this.#moveToward(c, c.orderX, c.orderZ, dt);
            if (arrived) { c.orderX = null; c.orderZ = null; }
            return;
        }
        c.standingSince = c.standingSince || this.time;
    }

    #tickDash(c, dt) {
        const d = c.dash;
        const step = d.speed * dt;
        const remain = Math.hypot(d.tx - c.x, d.tz - c.z);
        if (remain <= step || this.time > d.deadline) {
            c.x = d.tx; c.z = d.tz;
            this.#clampToBridge(c);
            this.#endDash(c);
            return;
        }
        c.x += (d.tx - c.x) / remain * step;
        c.z += (d.tz - c.z) / remain * step;
        this.#clampToBridge(c);
        // 撞到人就即刻停（衝鋒類技能）
        if (d.hitOnContact) {
            const foe = this.enemiesOf(c.team).find(e => e.alive
                && (e.kind === 'champ' || e.kind === 'minion') && dist(c, e) <= c.r + e.r + 0.4);
            if (foe) { d.victim = foe; this.#endDash(c); }
        }
    }

    #endDash(c) {
        const d = c.dash;
        c.dash = null;
        if (!d) return;
        if (d.onArrive) d.onArrive(d.victim ?? null);
    }

    // ---------- 移動 ----------
    #moveToward(e, gx, gz, dt) {
        const st = e.kind === 'champ' ? this.stats(e) : { speed: e.speed * (e.slowUntil > this.time ? 1 - e.slow : 1) };
        const dx = gx - e.x, dz = gz - e.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.05) return true;
        const step = Math.min(d, st.speed * dt);
        const fromX = e.x, fromZ = e.z;
        e.x += dx / d * step;
        e.z += dz / d * step;
        this.#clampToBridge(e);
        e.facing = Math.atan2(dx, dz);
        e.moving = true;
        e.standingSince = 0;
        // 完全郁唔到（撞實橋邊、或者畀人群卡住）就當到咗，唔好一直撼落去。
        // 落指令嗰邊每格都會重下，所以放棄一個去唔到嘅目標冇成本。
        if (Math.hypot(e.x - fromX, e.z - fromZ) < step * 0.15) return true;
        return d - step < 0.05;
    }

    #clampToBridge(e) {
        e.x = clamp(e.x, -MAP.fountainX - 4, MAP.fountainX + 4);
        // 橋面之外係深淵；泉水嗰段闊少少畀人企。
        const w = Math.abs(e.x) > MAP.nexusX - 2 ? MAP.halfWidth + 3 : MAP.halfWidth;
        e.z = clamp(e.z, -w + e.r, w - e.r);
    }

    // 軟推開：唔用硬碰撞，因為硬碰撞會令一堆兵卡死喺窄橋度。
    #separate(dt) {
        const movers = this.entities.filter(e => e.alive && (e.kind === 'champ' || e.kind === 'minion'));
        for (let i = 0; i < movers.length; i++) {
            for (let j = i + 1; j < movers.length; j++) {
                const a = movers[i], b = movers[j];
                const dx = b.x - a.x, dz = b.z - a.z;
                const d = Math.hypot(dx, dz);
                const min = a.r + b.r;
                if (d >= min || d < 1e-4) continue;
                const push = (min - d) / min * PUSH_STRENGTH * dt;
                const nx = dx / d, nz = dz / d;
                a.x -= nx * push; a.z -= nz * push;
                b.x += nx * push; b.z += nz * push;
                this.#clampToBridge(a); this.#clampToBridge(b);
            }
        }
    }

    // ---------- 攻擊 ----------
    #tryAttack(a, target, dt) {
        a.moving = false;
        const st = a.kind === 'champ' ? this.stats(a) : null;
        const rate = st ? st.attackSpeed : a.attackSpeed;
        a.cd -= dt;
        a.facing = Math.atan2(target.x - a.x, target.z - a.z);
        if (a.cd > 0) return;
        a.cd = 1 / Math.max(0.05, rate);

        let damage = st ? st.damage : a.damage;
        // 小兵拆建築有加成：一波兵要真係推得郁塔，唔係得個睇字。
        // 實測未加之前，六個 bot 打足 25 分鐘一座塔都拆唔到。
        if (a.kind === 'minion' && (target.kind === 'tower' || target.kind === 'nexus')) {
            damage *= a.def.structureBonus ?? 1.6;
        }
        // 塔嘅遞增傷害
        if (a.kind === 'tower' || a.kind === 'nexus') {
            if (a.lastTarget === target.id) a.ramp = Math.min(TOWER.rampMax, a.ramp + TOWER.rampPerHit);
            else a.ramp = 1;
            a.lastTarget = target.id;
            damage *= a.ramp;
        }
        if (a.kind === 'champ') {
            // 長弓被動：企定咗先射
            if (a.def.id === 'longshot' && a.standingSince && this.time - a.standingSince > 1.5) {
                damage *= 1.25;
                a.standingSince = this.time;
            }
            // 暮刃被動：背刺
            if (a.def.id === 'duskblade' && target.facing != null) {
                const toAtk = Math.atan2(a.x - target.x, a.z - target.z);
                let diff = Math.abs(((toAtk - target.facing + Math.PI) % (Math.PI * 2)) - Math.PI);
                if (diff > Math.PI * 0.6) damage *= 1.3;
            }
        }

        const proj = a.kind === 'champ' ? a.def.projectile : a.def?.projectile;
        if (proj && dist(a, target) > 2.5) {
            this.projectiles.push({
                kind: proj, team: a.team, sourceId: a.id, targetId: target.id,
                x: a.x, z: a.z, speed: 30, damage, physical: true,
            });
            this.emit('shoot', { id: a.id, kind: proj });
        } else {
            this.damage(target, damage, a, { physical: true });
            this.emit('hit', { id: a.id, target: target.id });
        }
        this.emit('attack', { id: a.id, target: target.id });
    }

    // 所有彈道嘅移動同命中都喺呢度。分開兩種：追蹤彈鎖住一個目標，技能彈道
    // 沿住一條直線掃。
    //
    // 之前技能彈道嗰段住喺 #tickZones 入面，而呢度嘅追蹤彈迴圈冇分辨兩者：
    // 佢見到冇 targetId 就當「目標唔喺度」殺咗支彈。技能彈道本身就係冇
    // targetId 嘅，所以每一支喺放出嚟嗰一格就即刻死——即係遊戲入面全部
    // skillshot 技能（穿甲箭、火花、致命一箭…）由頭到尾都係射唔到人嘅，
    // 而 #tickZones 嗰段掃線碼一次都冇行過。兩段碼分住兩個地方，就係
    // 「邊個負責邊樣」講唔清嘅代價。而家兩種都喺同一個函數入面。
    #tickProjectiles(dt) {
        // 追蹤彈
        for (const p of this.projectiles) {
            if (p.skill) continue;
            const t = this.entities.find(e => e.id === p.targetId);
            if (!t || !t.alive) { p.dead = true; continue; }
            const dx = t.x - p.x, dz = t.z - p.z;
            const d = Math.hypot(dx, dz);
            const step = p.speed * dt;
            if (d <= step + t.r) {
                const src = this.entities.find(e => e.id === p.sourceId);
                this.damage(t, p.damage, src, { physical: p.physical });
                this.emit('hit', { id: p.sourceId, target: t.id });
                p.dead = true;
                continue;
            }
            p.x += dx / d * step;
            p.z += dz / d * step;
        }

        // 技能彈道。
        //
        // 一定要量「呢一格掃過嗰段線」，唔可以量「而家停喺邊」。舊寫法係先推
        // 前一格再逐點量距離，即係每格得一個取樣點，兩點之間嘅嘢完全睇唔到。
        // 長弓大招 speed 60，一格行 2.0 米，而一隻小兵嘅命中半徑係
        // width 1.4 + r 0.62 = 2.02 米——只差 0.02。所以一隻企喺兩個取樣點
        // 中間、又偏離中線少少嘅兵，會畀支箭原封不動飛過。玩家見到嘅係
        // 「我明明射中咗但係冇傷害」，而愈快嘅技能愈易中招。
        //
        // 順帶修埋兩樣同一個迴圈入面嘅嘢：
        //   1. 射程用完嗰一格以前係「照行足一格、再宣告死亡、而且唔驗中」，
        //      即係射程邊緣嗰下必定落空，而且彈道實際飛咗過龍。
        //   2. 所以要先夾住今格真正行到幾遠，驗完中先至了結。
        for (const p of this.projectiles) {
            if (!p.skill) continue;
            const step = Math.min(p.speed * dt, p.left);
            const ax = p.x, az = p.z;
            p.x += p.vx * step; p.z += p.vz * step;
            p.left -= step;
            for (const e of this.entities) {
                if (!e.alive || p.hits.has(e.id)) continue;
                if (e.kind !== 'champ' && e.kind !== 'minion') continue;
                // 點到線段嘅最近距離：將實體投影落今格嘅行程，夾喺兩端之內。
                const along = Math.max(0, Math.min(step,
                    (e.x - ax) * p.vx + (e.z - az) * p.vz));
                const cx = ax + p.vx * along, cz = az + p.vz * along;
                if (Math.hypot(e.x - cx, e.z - cz) > p.width + e.r) continue;
                if (e.team === p.team) {
                    if (p.onAlly) { p.onAlly(e); p.hits.add(e.id); }
                    continue;
                }
                p.hits.add(e.id);
                p.onHit(e);
                if (!p.pierce) { p.dead = true; break; }
            }
            // 射程用完先至了結——驗完中，唔會食咗最後嗰下
            if (p.left <= 0) p.dead = true;
        }
        this.projectiles = this.projectiles.filter(p => !p.dead);
    }

    // ---------- 傷害同死亡 ----------
    damage(target, amount, source, opts = {}) {
        if (!target.alive || amount <= 0) return 0;
        const armour = target.kind === 'champ' ? this.stats(target).armour
            : (target.kind === 'tower' || target.kind === 'nexus')
                ? structureArmour(target.armour, this.time)
                : target.armour;
        let dealt = amount * (opts.trueDamage ? 1 : armourMul(armour));

        // 護盾先食
        if (target.kind === 'champ' && target.shield > 0 && target.shieldUntil > this.time) {
            const absorbed = Math.min(target.shield, dealt);
            target.shield -= absorbed;
            dealt -= absorbed;
        }
        target.hp -= dealt;

        if (source && source.kind === 'champ' && target.kind === 'champ') {
            target.lastDamagedBy.set(source.id, this.time);
            // 鐵衛被動：食到英雄傷害就疊護甲
            if (target.def.id === 'ironward') {
                target.stacks = Math.min(8, target.stacks + 1);
                target.stackUntil = this.time + 6;
            }
            // 越塔：喺敵方塔範圍內攻擊敵方英雄，就會食塔
            for (const t of this.entities) {
                if (!t.alive || (t.kind !== 'tower' && t.kind !== 'nexus')) continue;
                if (t.team !== target.team) continue;
                if (dist(source, t) <= t.range + source.r) {
                    source.towerAggroUntil = this.time + TOWER_AGGRO_MEMORY;
                    source.towerAggroFrom = t.team;
                }
            }
        }
        // 吸血：只計普攻同技能命中，唔計持續區域，否則放個火圈落一堆兵就回滿血
        if (source?.kind === 'champ' && source.alive && !opts.noLifesteal) {
            const ls = this.stats(source).lifesteal;
            if (ls > 0 && dealt > 0) this.heal(source, dealt * ls);
        }
        if (RECALL.cancelOnDamage && target.kind === 'champ' && dealt > 0) {
            this.cancelRecall(target, 'damaged');
        }
        this.emit('damage', { target: target.id, amount: dealt, source: source?.id ?? null });
        if (target.hp <= 0 && this.#wardenSave(target)) return dealt;
        if (target.hp <= 0) this.#kill(target, source);
        return dealt;
    }

    // 曦守被動「守望」：附近隊友受到致命傷害時，佢燒法力硬食一次。
    // 只救隊友唔救自己——輔助嘅價值喺於保住人哋，唔係保住自己。
    #wardenSave(target) {
        if (target.kind !== 'champ') return false;
        const saver = this.champions.find(c => c.alive && c !== target && c.team === target.team
            && c.def.id === 'dawnkeeper'
            && this.time >= (c.wardenReadyAt ?? 0)
            && c.mp >= c.maxMp * WARDEN.manaCost
            && dist(c, target) <= WARDEN.range);
        if (!saver) return false;
        saver.mp -= saver.maxMp * WARDEN.manaCost;
        saver.wardenReadyAt = this.time + WARDEN.cd;
        target.hp = this.stats(target).maxHp * WARDEN.leaveHpPct;
        this.emit('warden', { saver: saver.id, target: target.id });
        return true;
    }

    heal(target, amount) {
        if (!target.alive) return 0;
        const max = target.kind === 'champ' ? this.stats(target).maxHp : target.maxHp;
        const before = target.hp;
        target.hp = Math.min(max, target.hp + amount);
        const done = target.hp - before;
        if (done > 0) this.emit('heal', { target: target.id, amount: done });
        return done;
    }

    #kill(victim, killer) {
        victim.alive = false;
        victim.hp = 0;
        this.emit('death', { id: victim.id, kind: victim.kind, killer: killer?.id ?? null });

        if (victim.kind === 'minion') {
            // 補刀：最後一下嗰個英雄先拎全額金幣；其他人只有經驗
            if (killer?.kind === 'champ') {
                killer.gold += victim.def.gold;
                killer.cs += 1;
                this.emit('cs', { id: killer.id, gold: victim.def.gold });
            }
            this.#shareXp(victim, victim.def.xp);
            return;
        }

        if (victim.kind === 'tower') {
            const team = enemyOf(victim.team);
            for (const c of this.champions) {
                if (c.team !== team) continue;
                c.gold += dist(c, victim) < 22 ? TOWER.goldLocal : 0;
            }
            if (killer?.kind === 'champ') killer.gold += TOWER.gold - TOWER.goldLocal;
            this.emit('tower', { team: victim.team, tier: victim.tier });
            return;
        }

        if (victim.kind === 'nexus') {
            this.over = { winner: enemyOf(victim.team), time: this.time };
            this.emit('gameover', { winner: this.over.winner });
            return;
        }

        // 英雄死亡
        victim.deaths += 1;
        victim.buffs = {};
        victim.shield = 0;
        victim.recallUntil = 0;
        victim.orderX = null; victim.orderZ = null; victim.orderTarget = null;
        const bounty = KILL_GOLD + Math.min(SHUTDOWN_MAX, victim.streak * SHUTDOWN_PER_STREAK);
        victim.streak = 0;
        victim.respawnAt = this.time + RESPAWN_BASE + RESPAWN_PER_LEVEL * victim.level;
        if (killer?.kind === 'champ') {
            killer.kills += 1;
            killer.streak += 1;
            killer.gold += bounty;
        } else if (killer) {
            // 畀塔／小兵殺死：金幣分畀附近敵方英雄
            for (const c of this.champions) {
                if (c.team === victim.team || !c.alive) continue;
                if (dist(c, victim) < 18) c.gold += bounty / 2;
            }
        }
        for (const [id, t] of victim.lastDamagedBy) {
            if (this.time - t > ASSIST_WINDOW) continue;
            const helper = this.champions.find(c => c.id === id);
            if (!helper || helper === killer || helper.team === victim.team) continue;
            helper.assists += 1;
            helper.gold += ASSIST_GOLD;
        }
        victim.lastDamagedBy.clear();
        this.#shareXp(victim, 180 + victim.level * 60);
    }

    #shareXp(victim, xp) {
        const takers = this.champions.filter(c => c.alive && c.team !== victim.team
            && dist(c, victim) <= XP_SHARE_RANGE);
        if (!takers.length) return;
        const each = xp / Math.max(1, takers.length) * (takers.length > 1 ? 1.35 : 1);
        for (const c of takers) this.giveXp(c, each);
    }

    giveXp(c, amount) {
        if (c.level >= MAX_LEVEL) return;
        c.xp += amount;
        while (c.level < MAX_LEVEL && c.xp >= XP_TO_LEVEL[c.level]) {
            c.level += 1;
            this.#applyLevelStats(c, false);
            this.emit('levelup', { id: c.id, level: c.level });
        }
    }

    // 時限到就即刻分勝負，唔會拖成一場冇結果嘅比賽。
    // 判法：剩返嘅建築血量多者勝；打和就比人頭；再和先至係真平手。
    #timeLimit() {
        if (this.time < GAME_MAX || this.over) return;
        const score = (team) => this.entities
            .filter(e => e.alive && e.team === team && (e.kind === 'tower' || e.kind === 'nexus'))
            .reduce((a, e) => a + e.hp, 0);
        const blue = score(TEAM.BLUE), red = score(TEAM.RED);
        let winner = null;
        if (blue !== red) winner = blue > red ? TEAM.BLUE : TEAM.RED;
        else {
            const kills = (t) => this.champions.filter(c => c.team === t).reduce((a, c) => a + c.kills, 0);
            const kb = kills(TEAM.BLUE), kr = kills(TEAM.RED);
            if (kb !== kr) winner = kb > kr ? TEAM.BLUE : TEAM.RED;
        }
        this.over = { winner, time: this.time, byTime: true };
        this.emit('gameover', { winner, byTime: true });
    }

    #cleanup() {
        // 死咗嘅小兵／建築唔使再留喺主陣列，但英雄要留（等重生）
        this.entities = this.entities.filter(e => e.alive || e.kind === 'champ');
    }

    // ---------- 指令（玩家同 AI 共用同一個入口）----------
    orderMove(c, x, z) {
        if (!c.alive) return false;
        this.cancelRecall(c, 'moved');
        // 目標一定要係去得到嘅位置。實體會夾到 ±(halfWidth − r)，但落指令嗰邊
        // （input.js、bot）夾嘅係 ±halfWidth——差咗個半徑，角色就永遠「未到」，
        // orderX 清唔到，於是一直撼住條邊行，睇落就係卡死。
        const goal = { x, z, r: c.r };
        this.#clampToBridge(goal);
        c.orderX = goal.x; c.orderZ = goal.z; c.orderTarget = null;
        return true;
    }
    orderAttack(c, targetId) {
        if (!c.alive) return false;
        this.cancelRecall(c, 'attacked');
        c.orderTarget = targetId; c.orderX = null; c.orderZ = null;
        return true;
    }
    orderStop(c) { c.orderX = null; c.orderZ = null; c.orderTarget = null; }

    // ---------- 技能 ----------
    castable(c, index) {
        if (!c.alive || !this.canAct(c)) return false;
        const ab = c.def.abilities[index];
        const rank = abilityRank(c.level, index);
        if (rank <= 0) return false;
        if (c.abilityCd[index] > 0) return false;
        if (c.mp < ab.cost) return false;
        return true;
    }

    // aim: { x, z } 目標點，或者 { targetId }
    cast(c, index, aim = {}) {
        if (!this.castable(c, index)) return false;
        this.cancelRecall(c, 'cast');
        const ab = c.def.abilities[index];
        const rank = abilityRank(c.level, index);
        c.mp -= ab.cost;
        c.abilityCd[index] = ab.cd;
        this.emit('cast', {
            id: c.id, index, key: ab.key, championId: c.def.id,
            x: aim.x, z: aim.z, targetId: aim.targetId,
        });

        const handler = this[`_form_${ab.form}`];
        if (handler) handler.call(this, c, ab, rank, aim);
        return true;
    }

    #abilityDamage(c, ab, rank) {
        const base = scaled(ab.damage, rank);
        const st = this.stats(c);
        return base + (ab.adRatio ?? 0) * st.damage + (ab.apRatio ?? 0) * st.ap;
    }

    #applyOnHit(c, ab, rank, victim) {
        const dmg = this.#abilityDamage(c, ab, rank);
        if (dmg > 0) {
            this.damage(victim, dmg, c, { physical: !ab.apRatio });
            // 燼燃被動：技能命中留低灼燒
            if (c.def.id === 'emberwake') {
                this.zones.push({
                    kind: 'burn', team: c.team, sourceId: c.id, follow: victim.id,
                    until: this.time + 2, tick: 0.5, next: this.time + 0.5,
                    damage: dmg * 0.25 / 4, radius: 0.1,
                });
            }
        }
        if (ab.slow) { victim.slow = ab.slow; victim.slowUntil = this.time + ab.slowTime; }
        if (ab.stun) victim.stunUntil = Math.max(victim.stunUntil, this.time + ab.stun);
        if (ab.root) victim.rootUntil = Math.max(victim.rootUntil, this.time + ab.root);
        if (ab.knockback) {
            const d = Math.hypot(victim.x - c.x, victim.z - c.z) || 1;
            victim.x += (victim.x - c.x) / d * ab.knockback;
            victim.z += (victim.z - c.z) / d * ab.knockback;
            this.#clampToBridge(victim);
        }
        if (ab.executeUnder && victim.kind === 'champ'
            && victim.hp / this.stats(victim).maxHp < ab.executeUnder) {
            this.damage(victim, victim.hp + 1, c, { trueDamage: true });
        }
        if (ab.missingHpRatio && victim.kind === 'champ') {
            const missing = this.stats(victim).maxHp - victim.hp;
            this.damage(victim, missing * ab.missingHpRatio, c, { physical: true });
        }
    }

    #abilityVisual(c, ab) {
        return {
            sourceId: c.id, championId: c.def.id,
            index: c.def.abilities.indexOf(ab), key: ab.key,
        };
    }

    _form_skillshot(c, ab, rank, aim) {
        const dx = (aim.x ?? c.x + 1) - c.x, dz = (aim.z ?? c.z) - c.z;
        const d = Math.hypot(dx, dz) || 1;
        this.projectiles.push({
            kind: ab.key === 'R' ? 'ultra' : (c.def.projectile ?? 'bolt'),
            skill: true, team: c.team, sourceId: c.id,
            x: c.x, z: c.z, vx: dx / d, vz: dz / d,
            speed: ab.speed, width: ab.width, pierce: !!ab.pierce,
            left: ab.range, hits: new Set(),
            abilityIndex: c.def.abilities.indexOf(ab), abilityKey: ab.key, championId: c.def.id,
            onHit: (victim) => {
                this.#applyOnHit(c, ab, rank, victim);
                this.emit('abilityImpact', {
                    ...this.#abilityVisual(c, ab), targetId: victim.id,
                    x: victim.x, z: victim.z, radius: Math.max(1.1, ab.width ?? 1),
                });
            },
            onAlly: ab.healAlly ? (ally) => this.heal(ally, scaled(ab.healAlly, rank)) : null,
        });
    }

    _form_target(c, ab, rank, aim) {
        const t = this.entities.find(e => e.id === aim.targetId);
        if (!t || !t.alive) return;
        if (dist(c, t) > ab.range + t.r + 0.5) return;
        // 目標唔啱陣營就當冇施放過，唔好出視覺
        if (ab.allyTarget ? t.team !== c.team : t.team === c.team) return;
        // 單體技能之前完全冇出過視覺事件：施法者腳下一個細圈，受者嗰邊乜都冇。
        // 隔住八米指一指，對面就跌血——玩家根本唔知發生過咩事。
        this.emit('strike', {
            sourceId: c.id, targetId: t.id, x: t.x, z: t.z,
            ally: !!ab.allyTarget, ...this.#abilityVisual(c, ab),
        });
        if (ab.allyTarget) {
            if (ab.shield) {
                t.shield = Math.max(t.shield, scaled(ab.shield, rank) + (ab.shieldRatio ?? 0) * this.stats(c).maxHp);
                t.shieldUntil = this.time + ab.duration;
            }
            return;
        }
        if (t.team === c.team) return;
        this.#applyOnHit(c, ab, rank, t);
    }

    _form_dash(c, ab, rank, aim) {
        const sign = ab.backwards ? -1 : 1;
        let dx = (aim.x ?? c.x) - c.x, dz = (aim.z ?? c.z) - c.z;
        const d = Math.hypot(dx, dz) || 1;
        dx = dx / d * sign; dz = dz / d * sign;
        // 落點一定要夾返入橋面，而且要夾完先寫入 c.dash。
        // 之前係夾一個臨時物件跟手掉咗，c.dash 收住個橋外座標——#tickDash
        // 每格將位置夾返橋內，但目標永遠去唔到，remain 減唔落，衝刺就
        // 永遠唔會完；而 #tickChamp 第一句就係 if (c.dash) return，
        // 角色由嗰刻起完全凍結。同 dashFrom 一樣：計咗，冇人用。
        const goal = { x: c.x + dx * ab.range, z: c.z + dz * ab.range, r: c.r };
        this.#clampToBridge(goal);
        const tx = goal.x, tz = goal.z;
        c.dash = {
            tx, tz, speed: 26, hitOnContact: (ab.damage && scaled(ab.damage, rank) > 0),
            // 保險絲：任何情況下衝刺都唔可以無限期綁住個角色
            deadline: this.time + ab.range / 26 + 0.5,
            onArrive: (victim) => {
                if (victim) this.#applyOnHit(c, ab, rank, victim);
                if (ab.radius) {
                    for (const e of this.enemiesOf(c.team)) {
                        if (!e.alive || (e.kind !== 'champ' && e.kind !== 'minion')) continue;
                        if (dist(c, e) <= ab.radius + e.r) this.#applyOnHit(c, ab, rank, e);
                    }
                }
                this.emit('abilityImpact', {
                    ...this.#abilityVisual(c, ab), targetId: victim?.id,
                    x: c.x, z: c.z, radius: ab.radius ?? (victim ? 1.8 : 1.2),
                });
            },
        };
    }

    _form_aoe(c, ab, rank, aim) {
        const x = clamp(aim.x ?? c.x, c.x - ab.range, c.x + ab.range);
        const z = clamp(aim.z ?? c.z, c.z - ab.range, c.z + ab.range);
        if (ab.duration) {
            this.zones.push({
                kind: 'field', team: c.team, sourceId: c.id, x, z,
                radius: ab.radius, until: this.time + ab.duration,
                tick: ab.tick ?? 0.5, next: this.time + (ab.tick ?? 0.5),
                damage: this.#abilityDamage(c, ab, rank),
                slow: ab.slow, slowTime: ab.slowTime,
            });
            this.emit('zone', {
                x, z, radius: ab.radius, duration: ab.duration, team: c.team,
                ...this.#abilityVisual(c, ab),
            });
            return;
        }
        const fire = () => {
            for (const e of this.enemiesOf(c.team)) {
                if (!e.alive || (e.kind !== 'champ' && e.kind !== 'minion')) continue;
                if (Math.hypot(e.x - x, e.z - z) <= ab.radius + e.r) this.#applyOnHit(c, ab, rank, e);
            }
            this.emit('boom', { x, z, radius: ab.radius, ...this.#abilityVisual(c, ab) });
        };
        if (ab.delay) {
            this.zones.push({ kind: 'delayed', x, z, radius: ab.radius, at: this.time + ab.delay,
                fire, team: c.team });
            this.emit('telegraph', {
                x, z, radius: ab.radius, delay: ab.delay, ...this.#abilityVisual(c, ab),
            });
        } else fire();
    }

    _form_self(c, ab, rank) {
        if (ab.shield) {
            c.shield = Math.max(c.shield, scaled(ab.shield, rank) + (ab.shieldRatio ?? 0) * this.stats(c).maxHp);
            c.shieldUntil = this.time + ab.duration;
        }
        if (ab.speedBonus) c.buffs.haste = { until: this.time + ab.duration, amount: scaled(ab.speedBonus, rank) };
        if (ab.attackSpeedBonus) c.buffs.frenzy = { until: this.time + ab.duration, amount: scaled(ab.attackSpeedBonus, rank) };
        if (ab.armourBonus) c.buffs.bulwark = { until: this.time + ab.duration, amount: scaled(ab.armourBonus, rank) };
        if (ab.damageBonus) {
            c.buffs.rage = {
                until: this.time + ab.duration,
                amount: scaled(ab.damageBonus, rank),
                hp: scaled(ab.hpBonus, rank),
            };
            c.hp += scaled(ab.hpBonus, rank);
        }
        if (ab.taunt) {
            for (const e of this.enemiesOf(c.team)) {
                if (!e.alive || e.kind !== 'champ') continue;
                if (dist(c, e) <= ab.radius + e.r) {
                    e.orderTarget = c.id; e.orderX = null;
                    e.tauntUntil = this.time + ab.taunt;
                }
            }
        }
        if (ab.healPerSec) {
            this.zones.push({
                kind: 'heal', team: c.team, sourceId: c.id, follow: c.id,
                radius: ab.radius, until: this.time + ab.duration,
                tick: 0.5, next: this.time + 0.5,
                heal: (scaled(ab.healPerSec, rank) + (ab.apRatio ?? 0) * this.stats(c).ap) * 0.5,
            });
        }
    }

    _form_summon(c, ab, rank, aim) {
        const x = clamp(aim.x ?? c.x, c.x - ab.range, c.x + ab.range);
        const z = clamp(aim.z ?? c.z, c.z - ab.range, c.z + ab.range);
        this.zones.push({
            kind: 'trap', team: c.team, sourceId: c.id, x, z,
            radius: ab.radius, until: this.time + ab.duration,
            abilityIndex: c.def.abilities.indexOf(ab), abilityKey: ab.key, championId: c.def.id,
            armedAt: this.time + (ab.armTime ?? 0),
            onTrigger: (victim) => this.#applyOnHit(c, ab, rank, victim),
        });
        this.emit('trap', {
            x, z, radius: ab.radius, duration: ab.duration, team: c.team,
            ...this.#abilityVisual(c, ab),
        });
    }

    #tickZones(dt) {
        for (const z of this.zones) {
            if (z.kind === 'delayed') {
                if (this.time >= z.at) { z.fire(); z.dead = true; }
                continue;
            }
            if (this.time >= z.until) { z.dead = true; continue; }
            if (z.follow != null) {
                const host = this.entities.find(e => e.id === z.follow);
                if (!host || !host.alive) { z.dead = true; continue; }
                z.x = host.x; z.z = host.z;
            }
            if (z.kind === 'trap') {
                if (this.time < z.armedAt) continue;
                const victim = this.enemiesOf(z.team).find(e => e.alive
                    && (e.kind === 'champ' || e.kind === 'minion')
                    && Math.hypot(e.x - z.x, e.z - z.z) <= z.radius);
                if (victim) {
                    z.onTrigger(victim); z.dead = true;
                    this.emit('trapFire', {
                        x: z.x, z: z.z, radius: z.radius, targetId: victim.id,
                        sourceId: z.sourceId, championId: z.championId,
                        index: z.abilityIndex, key: z.abilityKey,
                    });
                }
                continue;
            }
            if (this.time < z.next) continue;
            z.next += z.tick;
            if (z.kind === 'heal') {
                for (const a of this.alliesOf(z.team)) {
                    if (a.kind !== 'champ') continue;
                    if (Math.hypot(a.x - z.x, a.z - z.z) <= z.radius) this.heal(a, z.heal);
                }
                continue;
            }
            const src = this.entities.find(e => e.id === z.sourceId);
            for (const e of this.enemiesOf(z.team)) {
                if (!e.alive || (e.kind !== 'champ' && e.kind !== 'minion')) continue;
                if (Math.hypot(e.x - z.x, e.z - z.z) > z.radius + e.r) continue;
                this.damage(e, z.damage, src, { physical: false, noLifesteal: true });
                if (z.slow) { e.slow = z.slow; e.slowUntil = this.time + z.slowTime; }
            }
        }
        this.zones = this.zones.filter(z => !z.dead);

    }
}
