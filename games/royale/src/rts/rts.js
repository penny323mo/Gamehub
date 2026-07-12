// LV2 世紀帝國式即時戰略模式 —— 獨立於 Clash 式 Game 嘅玩法核心。
// 重用共用嘅 3D 場景／模型／血條／dispose，但玩法完全唔同：
//   主動採集資源（食物🍖＋黃金🪙）→ 建築生產部隊 → 全 RTS 操控（框選、移動、攻擊、採集、建造）。
// 座標系同 Clash 一致：玩家喺 z>0（下方），敵方 z<0（上方）。
import * as THREE from 'three';
import { TEAM } from '../constants.js';
import { makeUnitModel, makeKingTower, makeWatchtower } from '../models.js';
import { makeHpBar, disposeDeep } from '../game.js';

let rtsId = 1;

// RTS 自己持有、之後會 disposeDeep 嘅 mesh 一律用獨立材質——
// 唔可以用 models.js 個 mat() 共享快取，因為 disposeDeep 會無條件 dispose 材質，
// 會連累其他仲喺度用緊同一 cached 材質嘅物件。
const lmat = (color) => new THREE.MeshLambertMaterial({ color });

// ---------- 資料表 ----------
// 全 11 個原兵種都用返：民兵→村民，其餘 10 個做戰鬥兵，分三代（age）解鎖。
// age = 需要城鎮中心升到第幾代先出得。pop = 佔幾多人口。vsBuilding = 對建築傷害倍率。
export const RTS_UNITS = {
    villager: {
        name: '村民', icon: '👷', model: 'militia', age: 1,
        hp: 45, dmg: 4, hitSpeed: 1.2, range: 0.9, sight: 4.5, speed: 3.0, radius: 0.32,
        cost: { food: 50 }, trainTime: 4, trainAt: 'towncenter',
        gatherRate: 11, carryCap: 16, // 每秒採 11、袋滿 16 就返中心卸貨（大地圖行遠啲，袋大啲少啲來回）
    },
    // ── 第一代（開局即有）──
    soldier: {
        name: '士兵', icon: '⚔️', model: 'swordsman', age: 1,
        hp: 130, dmg: 16, hitSpeed: 1.0, range: 1.0, sight: 6.5, speed: 2.7, radius: 0.4,
        cost: { food: 60, gold: 20 }, trainTime: 6, trainAt: 'barracks',
    },
    archer: {
        name: '弓兵', icon: '🏹', model: 'archers', age: 1,
        hp: 70, dmg: 12, hitSpeed: 1.1, range: 5.5, sight: 7.0, speed: 2.5, radius: 0.34,
        projectile: true, cost: { food: 40, gold: 30 }, trainTime: 5, trainAt: 'barracks',
    },
    pikeman: {
        name: '長槍兵', icon: '🔱', model: 'pikemen', age: 1,
        hp: 175, dmg: 13, hitSpeed: 1.1, range: 1.3, sight: 6.0, speed: 2.5, radius: 0.4,
        cost: { food: 55, gold: 10 }, trainTime: 6, trainAt: 'barracks', // 平、肉厚，做前排
    },
    // ── 第二代（升級主城一次）──
    scout: {
        name: '斥候輕騎', icon: '🐴', model: 'scout', age: 2,
        hp: 100, dmg: 15, hitSpeed: 0.9, range: 1.0, sight: 7.5, speed: 4.3, radius: 0.36,
        cost: { food: 50, gold: 25 }, trainTime: 5, trainAt: 'barracks', // 極快，騷擾採集
    },
    handcannon: {
        name: '火槍兵', icon: '💥', model: 'handcannon', age: 2,
        hp: 85, dmg: 27, hitSpeed: 1.5, range: 6.2, sight: 7.5, speed: 2.2, radius: 0.34,
        projectile: true, cost: { food: 45, gold: 55 }, trainTime: 7, trainAt: 'barracks',
    },
    berserker: {
        name: '狂戰士', icon: '🪓', model: 'berserker', age: 2,
        hp: 170, dmg: 23, hitSpeed: 0.85, range: 1.0, sight: 6.5, speed: 3.0, radius: 0.4,
        cost: { food: 70, gold: 35 }, trainTime: 7, trainAt: 'barracks',
    },
    // ── 第三代（升級主城兩次）──
    knight: {
        name: '騎士', icon: '🐎', model: 'knight', age: 3, pop: 2,
        hp: 290, dmg: 31, hitSpeed: 1.0, range: 1.1, sight: 7.0, speed: 3.6, radius: 0.46,
        cost: { food: 90, gold: 70 }, trainTime: 9, trainAt: 'barracks', // 重騎兵
    },
    ram: {
        name: '攻城槌', icon: '🪵', model: 'ram', age: 3, pop: 2, vsBuilding: 9,
        hp: 340, dmg: 12, hitSpeed: 1.5, range: 1.4, sight: 6.0, speed: 1.9, radius: 0.5,
        cost: { food: 40, gold: 60 }, trainTime: 9, trainAt: 'barracks', // 專拆建築
    },
    catapult: {
        name: '投石車', icon: '🪨', model: 'catapult', age: 3, pop: 2, vsBuilding: 2, splash: 2.2,
        hp: 120, dmg: 42, hitSpeed: 2.4, range: 7.2, sight: 8.0, speed: 1.7, radius: 0.5,
        projectile: true, cost: { food: 50, gold: 90 }, trainTime: 11, trainAt: 'barracks', // 範圍攻城
    },
    elephant: {
        name: '戰象', icon: '🐘', model: 'elephant', age: 3, pop: 3,
        hp: 520, dmg: 36, hitSpeed: 1.3, range: 1.3, sight: 6.5, speed: 2.2, radius: 0.6,
        cost: { food: 120, gold: 80 }, trainTime: 13, trainAt: 'barracks', // 超級肉盾
    },
};

// 城鎮中心升級：升到第 N 代嘅消耗同時間
export const TC_UPGRADE = {
    2: { cost: { food: 400, gold: 220 }, time: 28 },
    3: { cost: { food: 750, gold: 450 }, time: 42 },
};
export const RTS_MAX_AGE = 3;

export const RTS_BUILDINGS = {
    towncenter: {
        name: '城鎮中心', icon: '🏯', hp: 1800, radius: 2.4, dropOff: true,
        trains: ['villager'], model: 'king',
    },
    barracks: {
        name: '兵營', icon: '🏰', hp: 800, radius: 1.6,
        trains: ['soldier', 'archer', 'pikeman', 'scout', 'handcannon', 'berserker', 'knight', 'ram', 'catapult', 'elephant'],
        model: 'watchtower', cost: { gold: 120 }, buildTime: 14,
    },
    house: {
        name: '房屋', icon: '🏠', hp: 500, radius: 1.2,
        trains: [], model: 'watchtower', pop: 8,
        cost: { gold: 40 }, buildTime: 8,
    },
};

const START = { food: 260, gold: 160 };
const BASE_POP_CAP = 18;   // 起始人口上限（起房屋加）
const HARD_POP_CAP = 70;

// RTS 專屬大地圖（比 Clash 戰場大約 2.5 倍，有空間發展經濟同排兵）
export const RTS_MAP = { halfW: 22, halfL: 34 };

// 大地圖草地質感（tile 重複，唔會因為放大而糊）
function makeRtsGrassTexture() {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    g.fillStyle = '#6fa04d'; g.fillRect(0, 0, S, S);
    let seed = 4242; const rnd = () => { seed = (seed * 16807 + 12345) % 2147483647; return (seed & 0xffff) / 0xffff; };
    for (let i = 0; i < 70; i++) {
        g.fillStyle = rnd() < 0.5 ? `rgba(80,130,54,${0.06 + rnd() * 0.1})` : `rgba(130,170,90,${0.05 + rnd() * 0.09})`;
        g.beginPath(); g.arc(rnd() * S, rnd() * S, 14 + rnd() * 46, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 1600; i++) {
        g.fillStyle = rnd() < 0.5 ? `rgba(55,95,38,${0.1 + rnd() * 0.14})` : `rgba(170,205,115,${0.08 + rnd() * 0.12})`;
        const s = 1 + rnd() * 2.2; g.fillRect(rnd() * S, rnd() * S, s, s);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

function makeTree() {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.1, 6), lmat(0x6e4a2a));
    trunk.position.y = 0.55;
    const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.2, 7), lmat(0x3f7a38));
    foliage.position.y = 2.0;
    g.add(trunk, foliage);
    return g;
}
function makeRock() {
    const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 0.4, 0), lmat(0x8b8680));
    r.position.y = 0.3; r.rotation.set(Math.random(), Math.random(), Math.random());
    return r;
}

// ---------- 資源節點模型 ----------
function makeGoldMine() {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) {
        const s = 0.4 + Math.random() * 0.35;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), lmat(i % 2 ? 0xe8c14a : 0xd0a83a));
        const a = (i / 5) * Math.PI * 2;
        rock.position.set(Math.cos(a) * 0.6, s * 0.5, Math.sin(a) * 0.6);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        g.add(rock);
    }
    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), lmat(0x8a7030));
    core.position.y = 0.4;
    g.add(core);
    return g;
}

function makeFoodBush() {
    const g = new THREE.Group();
    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 0), lmat(0x4f8f42));
    bush.position.y = 0.6; bush.scale.y = 0.8;
    g.add(bush);
    for (let i = 0; i < 7; i++) {
        const berry = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), lmat(0xd0403a));
        const a = Math.random() * Math.PI * 2, r = 0.4 + Math.random() * 0.3;
        berry.position.set(Math.cos(a) * r, 0.5 + Math.random() * 0.5, Math.sin(a) * r);
        g.add(berry);
    }
    return g;
}

// ---------- 實體 ----------
class RtsEntity {
    constructor(kind, team, x, z, def) {
        this.rtsId = rtsId++;
        this.kind = kind;          // 'unit' | 'building' | 'resource'
        this.team = team;          // resource 用 -1
        this.x = x; this.z = z;
        this.facing = team === TEAM.PLAYER ? 0 : Math.PI;
        this.dead = false;
        this.def = def;
        this.maxHp = def?.hp ?? 1;
        this.hp = this.maxHp;
        this.attackCd = 0;
        this.command = { type: 'idle' };
        this.target = null;
    }
}

// ---------- 主遊戲 ----------
export class RtsGame {
    constructor(scene, hooks = {}) {
        this.scene = scene;
        this.hooks = hooks; // { onEnd, onResources, onEvent }
        this.entities = [];
        this.projectiles = [];
        this.effects = [];
        this.hpBars = [];
        this.res = {
            [TEAM.PLAYER]: { ...START },
            [TEAM.ENEMY]: { ...START },
        };
        this.popCap = { [TEAM.PLAYER]: BASE_POP_CAP, [TEAM.ENEMY]: BASE_POP_CAP };
        this.phase = 'playing'; // playing | ended
        this.result = null;
        this.time = 0;
        this.env = [];       // 地圖環境 mesh（草地/邊界/裝飾），dispose 時清走
        this.envTex = null;  // 草地貼圖，要手動 dispose
        this.#buildEnvironment();
        this.#buildWorld();
    }

    // ---------- 大地圖環境 ----------
    #buildEnvironment() {
        const W = RTS_MAP.halfW, L = RTS_MAP.halfL;
        // 主草地（tile 貼圖）
        this.envTex = makeRtsGrassTexture();
        this.envTex.repeat.set((W * 2 + 6) / 6, (L * 2 + 6) / 6);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(W * 2 + 6, L * 2 + 6), new THREE.MeshLambertMaterial({ map: this.envTex }));
        ground.rotation.x = -Math.PI / 2; ground.position.y = 0; ground.receiveShadow = true;
        this.scene.add(ground); this.env.push(ground);
        // 外圍更闊嘅淺色地台，避免見到地圖邊
        const outer = new THREE.Mesh(new THREE.PlaneGeometry(W * 2 + 80, L * 2 + 80), lmat(0x5a8642));
        outer.rotation.x = -Math.PI / 2; outer.position.y = -0.1;
        this.scene.add(outer); this.env.push(outer);
        // 四邊矮木牆做地圖邊界
        const wallMat = lmat(0x7a5f3a);
        const walls = [
            [0, L, W * 2 + 2, 0.5], [0, -L, W * 2 + 2, 0.5],
            [-W, 0, 0.5, L * 2 + 2], [W, 0, 0.5, L * 2 + 2],
        ];
        for (const [x, z, w, d] of walls) {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 1.0, d), wallMat);
            wall.position.set(x, 0.5, z); wall.castShadow = true;
            this.scene.add(wall); this.env.push(wall);
        }
        // 邊緣散落樹木＋石頭（唔阻擋戰場中央）
        let seed = 909; const rnd = () => { seed = (seed * 16807 + 12345) % 2147483647; return (seed & 0xffff) / 0xffff; };
        for (let i = 0; i < 26; i++) {
            const edgeX = rnd() < 0.5;
            const x = edgeX ? (rnd() < 0.5 ? -1 : 1) * (W - 1 - rnd() * 3) : (rnd() * 2 - 1) * (W - 2);
            const z = edgeX ? (rnd() * 2 - 1) * (L - 2) : (rnd() < 0.5 ? -1 : 1) * (L - 1 - rnd() * 3);
            const d = rnd() < 0.7 ? makeTree() : makeRock();
            d.position.set(x, 0, z); d.scale.setScalar(0.8 + rnd() * 0.6);
            this.scene.add(d); this.env.push(d);
        }
    }

    // ---------- 世界初始化 ----------
    #buildWorld() {
        const L = RTS_MAP.halfL;
        // 雙方城鎮中心（後方角落），起始兵營同 4 個村民
        for (const team of [TEAM.PLAYER, TEAM.ENEMY]) {
            const sz = team === TEAM.PLAYER ? 1 : -1;
            const tc = this.#spawnBuilding('towncenter', team, 0, sz * (L - 5), true);
            this.towncenter = this.towncenter || {};
            this.towncenter[team] = tc;
            this.#spawnBuilding('barracks', team, sz * -6, sz * (L - 8.5), true);
            for (let i = 0; i < 5; i++) {
                this.#spawnUnit('villager', team, (i - 2) * 1.6, sz * (L - 10));
            }
        }
        // 資源節點：分散喺大地圖（本方基地附近＋側翼＋中場爭奪）
        const nodes = [];
        for (const sz of [1, -1]) {
            nodes.push(['gold', -8, sz * (L - 3)], ['gold', 8, sz * (L - 3)]);   // 基地後方黃金
            nodes.push(['food', -4, sz * (L - 10)], ['food', 4, sz * (L - 10)]); // 基地前方食物
            nodes.push(['gold', -15, sz * 12], ['gold', 15, sz * 12]);           // 側翼黃金
            nodes.push(['food', 0, sz * 15]);                                     // 中前場食物
        }
        // 中央爭奪點
        nodes.push(['gold', -17, 0], ['gold', 17, 0], ['gold', 0, 0], ['food', -7, 0], ['food', 7, 0]);
        for (const [res, x, z] of nodes) this.#spawnResource(res, x, z);
    }

    #spawnResource(resType, x, z) {
        const e = new RtsEntity('resource', -1, x, z, null);
        e.resType = resType;
        e.amount = resType === 'gold' ? 2200 : 1600;
        e.model = resType === 'gold' ? makeGoldMine() : makeFoodBush();
        e.model.position.set(x, 0, z);
        e.radius = 1.0;
        this.scene.add(e.model);
        this.entities.push(e);
        return e;
    }

    #spawnBuilding(type, team, x, z, complete = false) {
        const def = RTS_BUILDINGS[type];
        const e = new RtsEntity('building', team, x, z, def);
        e.buildingType = type;
        e.radius = def.radius;
        e.trainQueue = [];
        e.trainT = 0;
        e.rally = null;
        if (type === 'towncenter') { e.age = 1; e.upgrading = null; } // 城鎮中心持有該隊伍嘅時代
        e.complete = complete;
        e.buildProgress = complete ? 1 : 0;
        if (!complete) { e.hp = Math.max(1, Math.round(def.hp * 0.05)); }
        e.model = def.model === 'king' ? makeKingTower(team) : makeWatchtower(team);
        if (type === 'barracks') e.model.scale.setScalar(1.15);
        if (type === 'house') { e.model.scale.setScalar(0.7); }
        e.model.position.set(x, 0, z);
        e.model.rotation.y = e.facing;
        if (!complete) e.model.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.5; } });
        this.#attachBars(e, def.model === 'king' ? 5.4 : 3.4);
        if (complete && def.pop) this.popCap[team] = Math.min(HARD_POP_CAP, this.popCap[team] + def.pop);
        this.entities.push(e);
        return e;
    }

    #spawnUnit(type, team, x, z) {
        const def = RTS_UNITS[type];
        const e = new RtsEntity('unit', team, x, z, def);
        e.unitType = type;
        e.speed = def.speed; e.radius = def.radius;
        e.dmg = def.dmg; e.range = def.range; e.hitSpeed = def.hitSpeed; e.sight = def.sight;
        e.projectile = !!def.projectile;
        if (type === 'villager') { e.carry = 0; e.carryType = null; e.gatherT = 0; }
        e.model = makeUnitModel(def.model, team);
        e.model.position.set(x, 0, z);
        e.model.rotation.y = e.facing;
        this.#attachBars(e, 2.0);
        this.entities.push(e);
        this.hooks.onResources?.();
        return e;
    }

    #attachBars(e, h) {
        this.scene.add(e.model);
        const barW = e.kind === 'building' ? 2.2 : 0.9;
        e.hpBar = makeHpBar(barW, e.team === -1 ? TEAM.PLAYER : e.team);
        e.hpBar.position.set(e.x, h, e.z);
        e.hpBar.userData.h = h;
        e.hpBar.userData.setRatio(1);
        e.hpBar.visible = e.kind === 'building';
        this.scene.add(e.hpBar);
        this.hpBars.push(e.hpBar);
    }

    // ---------- 查詢 ----------
    get playerUnits() { return this.entities.filter(e => e.kind === 'unit' && e.team === TEAM.PLAYER && !e.dead); }
    // 人口用兵種嘅 pop 權重計（騎士/攻城 2、戰象 3），排緊隊嘅都要計入去
    population(team) {
        let pop = 0;
        for (const e of this.entities) {
            if (e.dead) continue;
            if (e.kind === 'unit' && e.team === team) pop += e.def.pop ?? 1;
            else if (e.kind === 'building' && e.team === team) for (const t of e.trainQueue) pop += RTS_UNITS[t].pop ?? 1;
        }
        return pop;
    }
    teamAge(team) { const tc = this.towncenter?.[team]; return tc && !tc.dead ? tc.age : 1; }

    entityAt(x, z, teamFilter = null) {
        let best = null, bestD = Infinity;
        for (const e of this.entities) {
            if (e.dead) continue;
            if (teamFilter !== null && e.team !== teamFilter) continue;
            const r = (e.radius ?? 0.5) + 0.6;
            const d = Math.hypot(e.x - x, e.z - z);
            if (d <= r && d < bestD) { best = e; bestD = d; }
        }
        return best;
    }

    unitsInBox(x1, z1, x2, z2, team) {
        const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
        const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);
        return this.entities.filter(e => e.kind === 'unit' && e.team === team && !e.dead
            && e.x >= minX && e.x <= maxX && e.z >= minZ && e.z <= maxZ);
    }

    canAfford(team, cost) {
        if (!cost) return true;
        return (cost.food ?? 0) <= this.res[team].food && (cost.gold ?? 0) <= this.res[team].gold;
    }
    #pay(team, cost) {
        if (!cost) return;
        this.res[team].food -= cost.food ?? 0;
        this.res[team].gold -= cost.gold ?? 0;
        this.hooks.onResources?.();
    }
    #refund(team, cost) {
        if (!cost) return;
        this.res[team].food += cost.food ?? 0;
        this.res[team].gold += cost.gold ?? 0;
        this.hooks.onResources?.();
    }

    // ---------- 指令 ----------
    commandMove(units, x, z) {
        const spread = this.#formation(units, x, z);
        units.forEach((u, i) => {
            if (u.dead || u.kind !== 'unit') return;
            u.command = { type: 'move', tx: spread[i].x, tz: spread[i].z };
            u.target = null;
        });
    }
    commandAttack(units, targetEntity) {
        for (const u of units) {
            if (u.dead || u.kind !== 'unit') continue;
            u.command = { type: 'attack', target: targetEntity };
            u.target = targetEntity;
        }
    }
    commandGather(units, node) {
        for (const u of units) {
            if (u.dead || u.unitType !== 'villager') continue;
            u.command = { type: 'gather', node };
        }
    }
    // 智能右鍵：按目標類型自動判斷指令
    commandSmart(units, worldX, worldZ, team) {
        const enemy = this.entityAt(worldX, worldZ);
        if (enemy && enemy.kind === 'resource') {
            const vills = units.filter(u => u.unitType === 'villager');
            const others = units.filter(u => u.unitType !== 'villager');
            if (vills.length) this.commandGather(vills, enemy);
            if (others.length) this.commandMove(others, worldX, worldZ);
            return vills.length ? 'gather' : 'move';
        }
        if (enemy && enemy.team !== team && enemy.team !== -1) {
            this.commandAttack(units, enemy);
            return 'attack';
        }
        this.commandMove(units, worldX, worldZ);
        return 'move';
    }

    #formation(units, x, z) {
        const n = units.length;
        if (n <= 1) return [{ x, z }];
        const cols = Math.ceil(Math.sqrt(n));
        const gap = 1.1;
        const out = [];
        for (let i = 0; i < n; i++) {
            const r = Math.floor(i / cols), c = i % cols;
            out.push({ x: x + (c - (cols - 1) / 2) * gap, z: z + (r - (cols - 1) / 2) * gap });
        }
        return out;
    }

    // 訓練：加入建築隊列（即刻扣資源，取消先退返）
    queueTrain(building, unitType) {
        if (building.dead || !building.complete) return false;
        const def = RTS_UNITS[unitType];
        if (!def || !RTS_BUILDINGS[building.buildingType].trains.includes(unitType)) return false;
        if ((def.age ?? 1) > this.teamAge(building.team)) {
            this.hooks.onEvent?.(`${def.name}需要升級主城到第 ${def.age} 代`, building.team); return false;
        }
        if (this.population(building.team) >= this.popCap[building.team]) {
            this.hooks.onEvent?.('人口已滿，起房屋擴充', building.team); return false;
        }
        if (!this.canAfford(building.team, def.cost)) {
            this.hooks.onEvent?.('資源不足', building.team); return false;
        }
        this.#pay(building.team, def.cost);
        building.trainQueue.push(unitType);
        return true;
    }

    // 城鎮中心升級：消耗資源＋時間，升到下一代解鎖高級兵
    queueUpgrade(tc) {
        if (!tc || tc.dead || tc.buildingType !== 'towncenter' || !tc.complete) return false;
        if (tc.upgrading || tc.age >= RTS_MAX_AGE) return false;
        const up = TC_UPGRADE[tc.age + 1];
        if (!this.canAfford(tc.team, up.cost)) { this.hooks.onEvent?.('資源不足，升級唔到', tc.team); return false; }
        this.#pay(tc.team, up.cost);
        tc.upgrading = { timer: up.time, total: up.time, toAge: tc.age + 1 };
        this.hooks.onEvent?.(`城鎮中心升級緊到第 ${tc.age + 1} 代…`, tc.team);
        return true;
    }

    // 建造：搵一個村民去起（即刻扣資源）
    startBuild(villagers, buildingType, x, z, team) {
        const def = RTS_BUILDINGS[buildingType];
        if (!def || !def.cost) return false;
        if (!this.canAfford(team, def.cost)) { this.hooks.onEvent?.('資源不足', team); return false; }
        // 唔可以起得太貼其他嘢
        for (const e of this.entities) {
            if (e.dead || e.kind === 'unit') continue;
            if (Math.hypot(e.x - x, e.z - z) < (e.radius ?? 1) + def.radius + 0.3) {
                this.hooks.onEvent?.('呢度起唔到', team); return false;
            }
        }
        this.#pay(team, def.cost);
        const site = this.#spawnBuilding(buildingType, team, x, z, false);
        const builders = villagers.filter(v => v.unitType === 'villager' && !v.dead).slice(0, 3);
        for (const v of builders) v.command = { type: 'build', target: site };
        return true;
    }

    // ---------- 主循環 ----------
    update(dt) {
        if (this.phase === 'ended') { this.#updateEffects(dt); return; }
        this.time += dt;
        for (const e of this.entities) {
            if (e.dead) continue;
            if (e.kind === 'building') this.#updateBuilding(e, dt);
            else if (e.kind === 'unit') this.#updateUnit(e, dt);
        }
        this.#updateProjectiles(dt);
        this.#updateEffects(dt);
        this.#sweepDead();
        this.#checkWin();
    }

    #updateBuilding(b, dt) {
        // 建造中：靠 builder 推進（喺 unit update 度加 buildProgress），呢度淨係更新外觀
        if (!b.complete) {
            b.model.traverse(o => { if (o.isMesh && o.material.transparent) o.material.opacity = 0.5 + b.buildProgress * 0.5; });
            b.hp = Math.max(1, Math.round(b.def.hp * (0.05 + 0.95 * b.buildProgress)));
            b.hpBar.userData.setRatio(b.hp / b.maxHp);
            if (b.buildProgress >= 1) {
                b.complete = true;
                b.model.traverse(o => { if (o.isMesh) { o.material.opacity = 1; o.material.transparent = false; } });
                b.hp = b.maxHp;
                if (b.def.pop) this.popCap[b.team] = Math.min(HARD_POP_CAP, this.popCap[b.team] + b.def.pop);
                this.hooks.onEvent?.(`${b.def.icon} ${b.def.name}建成`, b.team);
                this.hooks.onResources?.();
            }
            return;
        }
        // 城鎮中心升級進度
        if (b.upgrading) {
            b.upgrading.timer -= dt;
            if (b.upgrading.timer <= 0) {
                b.age = b.upgrading.toAge;
                b.upgrading = null;
                b.maxHp += 300; b.hp += 300; b.hpBar.userData.setRatio(b.hp / b.maxHp);
                this.popCap[b.team] = Math.min(HARD_POP_CAP, this.popCap[b.team] + 4);
                this.hooks.onEvent?.(`🏯 城鎮中心升到第 ${b.age} 代！解鎖新兵種`, b.team);
                this.hooks.onResources?.();
            }
        }
        // 生產隊列
        if (b.trainQueue.length) {
            b.trainT += dt;
            const type = b.trainQueue[0];
            const need = RTS_UNITS[type].trainTime;
            if (b.trainT >= need) {
                b.trainT = 0;
                b.trainQueue.shift();
                const sz = b.team === TEAM.PLAYER ? 1 : -1;
                const spawn = this.#spawnUnit(type, b.team, b.x + (Math.random() - 0.5) * 1.2, b.z + sz * (b.radius + 1.0));
                const rally = b.rally ?? { x: b.x, z: b.z + sz * (b.radius + 2.5) };
                spawn.command = { type: 'move', tx: rally.x, tz: rally.z };
                this.hooks.onResources?.();
            }
        }
    }

    #updateUnit(e, dt) {
        e.attackCd = Math.max(0, e.attackCd - dt);
        const cmd = e.command;

        // 村民採集 / 建造 FSM
        if (e.unitType === 'villager' && (cmd.type === 'gather' || cmd.type === 'build' || cmd.type === '_return')) {
            this.#updateVillager(e, dt);
            return;
        }

        // 攻擊指令：追住目標打
        if (cmd.type === 'attack') {
            const t = cmd.target;
            if (!t || t.dead) { e.command = { type: 'idle' }; return; }
            this.#chaseAndAttack(e, t, dt);
            return;
        }

        // 移動指令：去到目標點附近就 idle（門檻放寬啲，多個單位迫埋一齊都唔會卡死喺 move）
        if (cmd.type === 'move') {
            const d = Math.hypot(cmd.tx - e.x, cmd.tz - e.z);
            if (d < 0.7) { e.command = { type: 'idle' }; }
            else { this.#moveToward(e, cmd.tx, cmd.tz, dt); this.#animate(e, true); return; }
        }

        // idle / 到步：戰鬥單位自動接敵（村民唔會）
        if (e.unitType !== 'villager') {
            const foe = this.#nearestEnemy(e, e.sight);
            if (foe) { this.#chaseAndAttack(e, foe, dt); return; }
        } else {
            // idle 村民自衛
            const foe = this.#nearestEnemy(e, 2.5);
            if (foe) { this.#chaseAndAttack(e, foe, dt); return; }
        }
        this.#animate(e, false);
    }

    #updateVillager(e, dt) {
        const cmd = e.command;
        // 建造
        if (cmd.type === 'build') {
            const site = cmd.target;
            if (!site || site.dead || site.complete) { e.command = { type: 'idle' }; return; }
            const d = Math.hypot(site.x - e.x, site.z - e.z);
            if (d > site.radius + 0.9) { this.#moveToward(e, site.x, site.z, dt); this.#animate(e, true); return; }
            site.buildProgress = Math.min(1, site.buildProgress + dt / (site.def.buildTime * 0.5)); // 多幾個村民就快
            this.#faceTo(e, site.x, site.z); this.#animate(e, true);
            return;
        }
        // 採集：去節點 → 採滿 → 返最近中心卸貨 → 返節點
        if (cmd.type === 'gather') {
            const node = cmd.node;
            if (!node || node.dead) { e.command = { type: 'idle' }; return; }
            if (e.carry >= e.def.carryCap) { e.command = { type: '_return', node }; return; }
            const d = Math.hypot(node.x - e.x, node.z - e.z);
            if (d > node.radius + 0.8) { this.#moveToward(e, node.x, node.z, dt); this.#animate(e, true); return; }
            // 採
            e.carryType = node.resType;
            const take = Math.min(e.def.gatherRate * dt, e.def.carryCap - e.carry, node.amount);
            e.carry += take; node.amount -= take;
            this.#faceTo(e, node.x, node.z); this.#animate(e, true);
            if (node.amount <= 0) { node.dead = true; this.hooks.onEvent?.('資源採光', e.team); }
            return;
        }
        // 返中心卸貨
        if (cmd.type === '_return') {
            const tc = this.#nearestDropoff(e);
            if (!tc) { e.command = { type: 'idle' }; return; }
            const d = Math.hypot(tc.x - e.x, tc.z - e.z);
            if (d > tc.radius + 0.9) { this.#moveToward(e, tc.x, tc.z, dt); this.#animate(e, true); return; }
            this.res[e.team][e.carryType] += Math.round(e.carry);
            e.carry = 0;
            this.hooks.onResources?.();
            // 返去繼續採原本個節點（採光就搵最近同類）
            let node = cmd.node;
            if (!node || node.dead) node = this.#nearestResource(e, e.carryType);
            e.command = node ? { type: 'gather', node } : { type: 'idle' };
            return;
        }
    }

    #chaseAndAttack(e, t, dt) {
        const d = Math.hypot(t.x - e.x, t.z - e.z);
        const reach = e.range + (t.radius ?? 0.4) + e.radius;
        if (d > reach) { this.#moveToward(e, t.x, t.z, dt); this.#animate(e, true); return; }
        this.#faceTo(e, t.x, t.z);
        this.#animate(e, false, true);
        if (e.attackCd <= 0) {
            e.attackCd = e.hitSpeed;
            if (e.projectile) this.#spawnProjectile(e, t);
            else this.#hit(e, t);
        }
    }

    // 埋身/命中傷害：攻城單位對建築有加成
    #hit(attacker, target) {
        let dmg = attacker.dmg;
        if (target.kind === 'building' && attacker.def?.vsBuilding) dmg *= attacker.def.vsBuilding;
        this.#damage(target, dmg, attacker);
    }

    #moveToward(e, tx, tz, dt) {
        const dx = tx - e.x, dz = tz - e.z;
        const d = Math.hypot(dx, dz) || 1;
        const step = Math.min(d, e.speed * dt);
        let nx = e.x + (dx / d) * step;
        let nz = e.z + (dz / d) * step;
        // 輕微避免重疊（同隊近距離互推）
        let px = 0, pz = 0;
        for (const o of this.entities) {
            if (o === e || o.dead || o.kind !== 'unit' || o.team !== e.team) continue;
            const od = Math.hypot(o.x - nx, o.z - nz);
            const min = e.radius + o.radius;
            if (od < min && od > 0.001) { px += (nx - o.x) / od * (min - od) * 0.5; pz += (nz - o.z) / od * (min - od) * 0.5; }
        }
        nx += px; nz += pz;
        e.x = Math.max(-RTS_MAP.halfW + 0.6, Math.min(RTS_MAP.halfW - 0.6, nx));
        e.z = Math.max(-RTS_MAP.halfL + 0.6, Math.min(RTS_MAP.halfL - 0.6, nz));
        this.#faceTo(e, tx, tz);
        e.model.position.set(e.x, 0, e.z);
        e.hpBar.position.set(e.x, e.hpBar.userData.h, e.z);
    }

    #faceTo(e, tx, tz) {
        const a = Math.atan2(tx - e.x, tz - e.z);
        e.facing = a; e.model.rotation.y = a;
    }

    #animate(e, moving, attacking = false) {
        // 先擺位再叫動畫——動畫會郁 group.position.y（戰象/攻城槌）或內層 model，
        // 如果擺位喺動畫之後就會蓋走個 y 起伏（企定/行走都唔郁），所以次序要調返
        e.model.position.set(e.x, 0, e.z);
        e.hpBar.position.set(e.x, e.hpBar.userData.h, e.z);
        const t = this.time + e.rtsId * 0.6;
        if (e.model.userData.animate) e.model.userData.animate(t, { moving, attackT: attacking ? 0.3 : -1 });
    }

    #nearestEnemy(e, range) {
        let best = null, bestD = range;
        for (const o of this.entities) {
            if (o.dead || o.team === e.team || o.team === -1) continue;
            if (o.kind === 'resource') continue;
            const d = Math.hypot(o.x - e.x, o.z - e.z);
            if (d < bestD) { best = o; bestD = d; }
        }
        return best;
    }
    #nearestDropoff(e) {
        let best = null, bestD = Infinity;
        for (const o of this.entities) {
            if (o.dead || o.team !== e.team || o.kind !== 'building' || !o.complete) continue;
            if (!RTS_BUILDINGS[o.buildingType].dropOff) continue;
            const d = Math.hypot(o.x - e.x, o.z - e.z);
            if (d < bestD) { best = o; bestD = d; }
        }
        return best;
    }
    #nearestResource(e, resType) {
        let best = null, bestD = Infinity;
        for (const o of this.entities) {
            if (o.dead || o.kind !== 'resource') continue;
            if (resType && o.resType !== resType) continue;
            const d = Math.hypot(o.x - e.x, o.z - e.z);
            if (d < bestD) { best = o; bestD = d; }
        }
        return best;
    }

    #spawnProjectile(e, t) {
        const splash = e.def?.splash ?? 0;
        const big = splash > 0;                       // 投石車：大石＋範圍
        const geo = new THREE.SphereGeometry(big ? 0.22 : 0.08, 6, 5);
        const m = new THREE.Mesh(geo, lmat(big ? 0x8f8a80 : 0xffe08a));
        m.position.set(e.x, 1.2, e.z);
        this.scene.add(m);
        this.projectiles.push({ model: m, x: e.x, y: 1.2, z: e.z, target: t, dmg: e.dmg, src: e, splash, speed: big ? 9 : 14 });
    }

    #updateProjectiles(dt) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            if (!p.target || p.target.dead) { this.scene.remove(p.model); disposeDeep(p.model); this.projectiles.splice(i, 1); continue; }
            const dx = p.target.x - p.x, dz = p.target.z - p.z, dy = 1.0 - p.y;
            const d = Math.hypot(dx, dz, dy) || 1;
            const step = p.speed * dt;
            if (step >= d) {
                this.#projectileHit(p);
                this.scene.remove(p.model); disposeDeep(p.model); this.projectiles.splice(i, 1);
            } else {
                p.x += dx / d * step; p.y += dy / d * step; p.z += dz / d * step;
                p.model.position.set(p.x, p.y, p.z);
            }
        }
    }

    #projectileHit(p) {
        const applyBonus = (target, dmg) => (target.kind === 'building' && p.src.def?.vsBuilding) ? dmg * p.src.def.vsBuilding : dmg;
        if (p.splash > 0) {
            // 範圍傷害：命中點附近所有敵人（含建築）
            const cx = p.target.x, cz = p.target.z;
            this.#explosion(cx, cz, p.splash);
            for (const o of this.entities) {
                if (o.dead || o.team === p.src.team || o.team === -1 || o.kind === 'resource') continue;
                if (Math.hypot(o.x - cx, o.z - cz) <= p.splash + (o.radius ?? 0.4)) this.#damage(o, applyBonus(o, p.dmg), p.src);
            }
        } else {
            this.#damage(p.target, applyBonus(p.target, p.dmg), p.src);
        }
    }

    #explosion(x, z, r) {
        for (let i = 0; i < 8; i++) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), lmat(0xbdb08c));
            m.position.set(x, 0.5, z);
            const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * r;
            this.scene.add(m);
            this.effects.push({ t: 0, dur: 0.6, m, vx: Math.cos(a) * sp, vy: 1.5 + Math.random() * 2, vz: Math.sin(a) * sp });
        }
    }

    #damage(t, dmg, src) {
        if (t.dead) return;
        t.hp -= dmg;
        if (t.hpBar) { t.hpBar.userData.setRatio(Math.max(0.001, t.hp / t.maxHp)); t.hpBar.visible = true; }
        if (t.hp <= 0) {
            t.dead = true;
            this.#deathEffect(t);
            if (t.kind === 'building') this.hooks.onEvent?.(`${t.def.icon} ${t.def.name}被摧毀`, t.team);
        }
    }

    #deathEffect(t) {
        // 小爆散
        const n = t.kind === 'building' ? 10 : 5;
        for (let i = 0; i < n; i++) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), lmat(t.kind === 'building' ? 0x9a8f7a : 0xcf5a4a));
            m.position.set(t.x, 0.6, t.z);
            const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 2.5;
            this.scene.add(m);
            this.effects.push({ t: 0, dur: 0.7, m, vx: Math.cos(a) * sp, vy: 2 + Math.random() * 2, vz: Math.sin(a) * sp });
        }
    }

    #updateEffects(dt) {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const ef = this.effects[i];
            ef.t += dt;
            ef.vy -= 9 * dt;
            ef.m.position.x += ef.vx * dt;
            ef.m.position.y = Math.max(0.05, ef.m.position.y + ef.vy * dt);
            ef.m.position.z += ef.vz * dt;
            if (ef.t >= ef.dur) { this.scene.remove(ef.m); disposeDeep(ef.m); this.effects.splice(i, 1); }
        }
    }

    #sweepDead() {
        const dead = this.entities.filter(e => e.dead && e._removed !== true);
        if (!dead.length) return;
        for (const e of dead) {
            e._removed = true;
            this.scene.remove(e.model); disposeDeep(e.model);
            if (e.hpBar) { this.scene.remove(e.hpBar); disposeDeep(e.hpBar); }
        }
        this.entities = this.entities.filter(e => !e.dead);
        this.hpBars = this.hpBars.filter(b => b.parent);
        this.hooks.onResources?.();
    }

    updateHpBarOrientation(q) { for (const b of this.hpBars) b.quaternion.copy(q); }

    #checkWin() {
        const pTc = this.towncenter[TEAM.PLAYER];
        const eTc = this.towncenter[TEAM.ENEMY];
        const pDead = pTc.dead;
        const eDead = eTc.dead;
        if (pDead || eDead) {
            this.phase = 'ended';
            const winner = eDead && !pDead ? TEAM.PLAYER : pDead && !eDead ? TEAM.ENEMY : null;
            this.result = { winner };
            this.hooks.onEnd?.(this.result);
        }
    }

    dispose() {
        for (const e of this.entities) { this.scene.remove(e.model); disposeDeep(e.model); if (e.hpBar) { this.scene.remove(e.hpBar); disposeDeep(e.hpBar); } }
        for (const p of this.projectiles) { this.scene.remove(p.model); disposeDeep(p.model); }
        for (const ef of this.effects) { this.scene.remove(ef.m); disposeDeep(ef.m); }
        for (const m of this.env) { this.scene.remove(m); disposeDeep(m); }
        this.envTex?.dispose(); // disposeDeep 唔會 dispose 貼圖，手動清
        this.entities = []; this.projectiles = []; this.effects = []; this.hpBars = []; this.env = [];
    }
}
