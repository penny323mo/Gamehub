// 遊戲核心模擬 — 單位、戰鬥、塔、聖水、計時、勝負
import * as THREE from 'three';
import { ARENA, TEAM, TOWERS, GAME_RULES, teamDir } from './constants.js';
import { CARDS } from './cards.js';
import { makeUnitModel, makePrincessTower, makeKingTower, makeProjectile, mat } from './models.js';

let nextId = 1;

function dist(a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
}

// ---------- 血條 ----------
function makeHpBar(width, team) {
    const g = new THREE.Group();
    const bg = new THREE.Mesh(
        new THREE.PlaneGeometry(width, 0.12),
        new THREE.MeshBasicMaterial({ color: 0x222222, depthTest: false, transparent: true, opacity: 0.85 })
    );
    const fg = new THREE.Mesh(
        new THREE.PlaneGeometry(width, 0.09),
        new THREE.MeshBasicMaterial({
            color: team === TEAM.PLAYER ? 0x3ba2ff : 0xff5544,
            depthTest: false,
        })
    );
    fg.position.z = 0.001;
    bg.renderOrder = 20;
    fg.renderOrder = 21;
    g.add(bg, fg);
    g.userData.setRatio = (r) => {
        fg.scale.x = Math.max(r, 0.001);
        fg.position.x = -width * (1 - fg.scale.x) / 2;
    };
    return g;
}

// ---------- 實體 ----------
class Entity {
    constructor({ team, cardId, x, z, isTower = false, towerKind = null }) {
        this.id = nextId++;
        this.team = team;
        this.cardId = cardId;
        this.isTower = isTower;
        this.towerKind = towerKind;
        this.x = x;
        this.z = z;
        this.dead = false;
        this.target = null;
        this.retargetT = 0;
        this.attackCd = 0;
        this.attackAnimT = -1;
        this.deployT = 0;
        this.facing = teamDir(team) > 0 ? 0 : Math.PI;

        if (isTower) {
            const spec = TOWERS[towerKind];
            this.maxHp = spec.hp;
            this.hp = spec.hp;
            this.dmg = spec.dmg;
            this.hitSpeed = spec.hitSpeed;
            this.range = spec.range;
            this.sight = spec.range;
            this.speed = 0;
            this.radius = towerKind === 'king' ? 1.5 : 1.0;
            this.isBuilding = true;
            this.projectile = 'arrow';
            this.active = towerKind !== 'king'; // 王塔初始唔還手
        } else {
            const c = CARDS[cardId];
            this.card = c;
            this.maxHp = c.hp;
            this.hp = c.hp;
            this.dmg = c.dmg;
            this.hitSpeed = c.hitSpeed;
            this.range = c.range;
            this.sight = c.sight ?? c.range + 1;
            this.speed = c.speed ?? 0;
            this.radius = c.radius;
            this.isBuilding = c.kind === 'building';
            this.projectile = c.projectile ?? null;
            this.splash = c.splash ?? 0;
            this.targetsBuildingsOnly = !!c.targetsBuildingsOnly;
            this.lifetime = c.lifetime ?? Infinity;
            this.active = true;
            this.deployT = GAME_RULES.deployTime;
        }
    }
}

// ---------- 玩家狀態（卡組循環 + 聖水）----------
class PlayerState {
    constructor(deck) {
        this.deck = [...deck];
        // 洗牌
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        this.queue = [...this.deck];
        this.hand = this.queue.splice(0, 4);
        this.elixir = GAME_RULES.elixirStart;
        this.elixirT = 0;
    }
    get next() { return this.queue[0]; }
    playFromHand(idx) {
        const id = this.hand[idx];
        this.hand[idx] = this.queue.shift();
        this.queue.push(id);
        return id;
    }
}

// ---------- 主遊戲 ----------
export class Game {
    constructor(scene, playerDeck, enemyDeck, hooks = {}) {
        this.scene = scene;
        this.hooks = hooks; // { onTowerDestroyed, onGameOver, onKingActivated, onSpawn, onSpell }
        this.entities = [];
        this.projectiles = [];
        this.effects = [];
        this.hpBars = [];
        this.players = {
            [TEAM.PLAYER]: new PlayerState(playerDeck),
            [TEAM.ENEMY]: new PlayerState(enemyDeck),
        };
        this.crowns = { [TEAM.PLAYER]: 0, [TEAM.ENEMY]: 0 };
        this.time = GAME_RULES.matchTime;
        this.phase = 'regulation'; // regulation | overtime | ended
        this.result = null;
        this.simTime = 0;

        this.towers = { [TEAM.PLAYER]: {}, [TEAM.ENEMY]: {} };
        this.#spawnTowers();
    }

    #spawnTowers() {
        for (const team of [TEAM.PLAYER, TEAM.ENEMY]) {
            const sz = teamDir(team) > 0 ? -1 : 1; // 玩家塔喺 z>0
            for (const side of [-1, 1]) {
                const t = new Entity({
                    team, isTower: true, towerKind: 'princess',
                    x: side * TOWERS.princess.x, z: sz * TOWERS.princess.z,
                });
                t.model = makePrincessTower(team);
                this.#addEntity(t, 4.2);
                this.towers[team][side === -1 ? 'left' : 'right'] = t;
            }
            const k = new Entity({
                team, isTower: true, towerKind: 'king',
                x: 0, z: sz * TOWERS.king.z,
            });
            k.model = makeKingTower(team);
            this.#addEntity(k, 5.2);
            this.towers[team].king = k;
        }
    }

    #addEntity(e, hpBarHeight = null) {
        e.model.position.set(e.x, 0, e.z);
        e.model.rotation.y = e.facing;
        this.scene.add(e.model);
        const barW = e.isTower ? 1.8 : Math.max(0.7, e.radius * 1.8);
        e.hpBar = makeHpBar(barW, e.team);
        e.hpBar.position.set(e.x, (hpBarHeight ?? this.#modelHeight(e)) , e.z);
        e.hpBar.userData.h = hpBarHeight ?? this.#modelHeight(e);
        e.hpBar.userData.setRatio(1);
        e.hpBar.visible = e.isTower ? true : false;
        this.scene.add(e.hpBar);
        this.hpBars.push(e.hpBar);
        this.entities.push(e);
    }

    #modelHeight(e) {
        if (e.isTower) return e.towerKind === 'king' ? 5.2 : 4.2;
        if (e.cardId === 'elephant') return 2.4;
        if (e.cardId === 'watchtower') return 3.0;
        if (e.cardId === 'knight') return 2.1;
        if (e.cardId === 'catapult' || e.cardId === 'ram') return 1.5;
        return 1.7;
    }

    // ---------- 部署驗證 ----------
    // 回傳 null = 無效；否則 {x, z}
    validPlacement(team, cardId, x, z) {
        const card = CARDS[cardId];
        const hw = ARENA.halfW - 0.4, hl = ARENA.halfL - 0.5;
        x = Math.max(-hw, Math.min(hw, x));
        z = Math.max(-hl, Math.min(hl, z));
        if (card.kind === 'spell') return { x, z };

        const dir = teamDir(team); // 玩家 -1（向上攻），自己半場 z>0
        const ownSide = (zz) => (team === TEAM.PLAYER ? zz : -zz);
        const zSide = ownSide(z);

        if (zSide >= ARENA.riverHalf + 0.25) return { x, z }; // 自己半場
        if (card.kind === 'building') return null; // 建築只可以喺自己半場

        // 口袋區：對面公主塔冧咗先可以擺嗰半邊
        if (zSide <= -(ARENA.riverHalf + 0.25) && zSide >= -9.5) {
            const enemy = team === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER;
            const towerSide = x < 0 ? 'left' : 'right';
            if (this.towers[enemy][towerSide].dead) return { x, z };
        }
        return null;
    }

    // ---------- 出卡 ----------
    playCard(team, handIdx, x, z) {
        if (this.phase === 'ended') return false;
        const p = this.players[team];
        const cardId = p.hand[handIdx];
        if (!cardId) return false;
        const card = CARDS[cardId];
        if (p.elixir < card.cost) return false;
        const pos = this.validPlacement(team, cardId, x, z);
        if (!pos) return false;

        p.elixir -= card.cost;
        p.playFromHand(handIdx);

        if (card.kind === 'spell') {
            this.#castSpell(team, card, pos.x, pos.z);
        } else {
            this.#spawnUnits(team, cardId, pos.x, pos.z);
        }
        this.hooks.onCardPlayed?.(team, cardId, pos);
        return true;
    }

    #spawnUnits(team, cardId, x, z) {
        const card = CARDS[cardId];
        const n = card.count ?? 1;
        const offsets = n === 1 ? [[0, 0]]
            : n === 2 ? [[-0.45, 0], [0.45, 0]]
            : [[0, -0.45], [-0.45, 0.35], [0.45, 0.35]];
        for (let i = 0; i < n; i++) {
            const e = new Entity({
                team, cardId,
                x: x + offsets[i][0], z: z + offsets[i][1],
            });
            e.model = makeUnitModel(cardId, team);
            this.#addEntity(e);
            this.#spawnRing(e.x, e.z, Math.max(0.5, e.radius * 1.4), team);
        }
        this.hooks.onSpawn?.(team, cardId, x, z);
    }

    #castSpell(team, card, x, z) {
        this.hooks.onSpell?.(team, card.id, x, z);
        // 目標指示圈
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(card.splash - 0.1, card.splash, 32),
            new THREE.MeshBasicMaterial({ color: 0xffaa22, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.06, z);
        this.scene.add(ring);
        this.effects.push({
            t: 0, dur: card.castDelay + 0.4, mesh: ring,
            update: () => {},
        });

        if (card.id === 'fireball') {
            // 由自己王塔飛出嚟
            const king = this.towers[team].king;
            const m = makeProjectile('fireball');
            m.position.set(king.x, 4.5, king.z);
            this.scene.add(m);
            const start = { x: king.x, y: 4.5, z: king.z };
            this.effects.push({
                t: 0, dur: card.castDelay, mesh: m,
                update: (ef) => {
                    const p = ef.t / ef.dur;
                    m.position.x = start.x + (x - start.x) * p;
                    m.position.z = start.z + (z - start.z) * p;
                    m.position.y = start.y + (0.3 - start.y) * p + Math.sin(p * Math.PI) * 4;
                    m.rotation.x += 0.2;
                },
                onEnd: () => this.#spellImpact(team, card, x, z),
            });
        } else {
            // 箭雨：天上落箭
            for (let i = 0; i < 10; i++) {
                const a = makeProjectile('arrow');
                const ang = Math.random() * Math.PI * 2;
                const r = Math.random() * card.splash * 0.9;
                const tx = x + Math.cos(ang) * r, tz = z + Math.sin(ang) * r;
                a.position.set(tx, 7 + Math.random() * 2, tz);
                a.rotation.x = Math.PI / 2;
                this.scene.add(a);
                const delay = Math.random() * 0.25;
                this.effects.push({
                    t: -delay, dur: card.castDelay - delay, mesh: a,
                    update: (ef) => {
                        if (ef.t < 0) return;
                        const p = Math.min(1, ef.t / ef.dur);
                        a.position.y = (7 + 2) * (1 - p);
                    },
                });
            }
            // 傷害計時器
            this.effects.push({
                t: 0, dur: card.castDelay, mesh: null,
                update: () => {},
                onEnd: () => this.#spellImpact(team, card, x, z),
            });
        }
    }

    #spellImpact(team, card, x, z) {
        this.#explosion(x, z, card.splash, card.id === 'fireball' ? 0xff6a1a : 0xddcc66);
        for (const e of this.entities) {
            if (e.dead || e.team === team) continue;
            if (dist(e, { x, z }) <= card.splash + e.radius) {
                const dmg = e.isTower ? card.dmg * GAME_RULES.spellTowerFactor : card.dmg;
                this.#damage(e, dmg);
            }
        }
        this.hooks.onImpact?.(card.id, x, z);
    }

    // ---------- 特效 ----------
    #spawnRing(x, z, r, team) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(r * 0.7, r, 24),
            new THREE.MeshBasicMaterial({
                color: team === TEAM.PLAYER ? 0x4a90d8 : 0xd85a4a,
                transparent: true, opacity: 0.8, side: THREE.DoubleSide,
            })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.05, z);
        this.scene.add(ring);
        this.effects.push({
            t: 0, dur: 0.8, mesh: ring,
            update: (ef) => {
                const p = ef.t / ef.dur;
                ring.scale.setScalar(1 + p * 0.6);
                ring.material.opacity = 0.8 * (1 - p);
            },
        });
    }

    // 粒子飛濺
    #particles(x, z, color, n = 8, power = 3.5, y0 = 0.4) {
        const geo = new THREE.SphereGeometry(0.09, 5, 4);
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
        for (let i = 0; i < n; i++) {
            const p = new THREE.Mesh(geo, material.clone());
            p.position.set(x, y0, z);
            const ang = Math.random() * Math.PI * 2;
            const sp = power * (0.4 + Math.random() * 0.6);
            const vel = {
                x: Math.cos(ang) * sp,
                y: 2.5 + Math.random() * 2.5,
                z: Math.sin(ang) * sp,
            };
            this.scene.add(p);
            this.effects.push({
                t: 0, dur: 0.55 + Math.random() * 0.25, mesh: p,
                update: (ef, dt) => {
                    vel.y -= 14 * dt;
                    p.position.x += vel.x * dt;
                    p.position.y += vel.y * dt;
                    p.position.z += vel.z * dt;
                    if (p.position.y < 0.05) p.position.y = 0.05;
                    p.material.opacity = 1 - ef.t / ef.dur;
                    p.scale.setScalar(1 - ef.t / ef.dur * 0.5);
                },
            });
        }
    }

    #explosion(x, z, r, color) {
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.1, 0.4, 24),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.08, z);
        this.scene.add(ring);
        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(r * 0.5, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.8 })
        );
        flash.position.set(x, 0.4, z);
        this.scene.add(flash);
        this.effects.push({
            t: 0, dur: 0.45, mesh: ring,
            update: (ef) => {
                const p = ef.t / ef.dur;
                ring.scale.setScalar(1 + p * r * 2.2);
                ring.material.opacity = 0.9 * (1 - p);
            },
        });
        this.effects.push({
            t: 0, dur: 0.3, mesh: flash,
            update: (ef) => {
                const p = ef.t / ef.dur;
                flash.scale.setScalar(1 + p);
                flash.material.opacity = 0.8 * (1 - p);
            },
        });
        this.#particles(x, z, color, Math.min(14, 6 + Math.round(r * 3)), 2.5 + r);
    }

    // ---------- 傷害 / 死亡 ----------
    #damage(e, dmg) {
        if (e.dead) return;
        e.hp -= dmg;
        e.hpBar.visible = true;
        e.hpBar.userData.setRatio(Math.max(0, e.hp / e.maxHp));
        // 王塔被打會醒
        if (e.isTower && e.towerKind === 'king' && !e.active) {
            e.active = true;
            this.hooks.onKingActivated?.(e.team);
        }
        if (e.hp <= 0) this.#kill(e);
    }

    #kill(e) {
        e.dead = true;
        e.hpBar.visible = false;
        if (e.isTower) {
            this.#towerFall(e);
        } else {
            // 陣亡動畫：沉落地下 + 塵埃
            this.#particles(e.x, e.z, 0xcfc8b8, 6, 2, 0.3);
            const model = e.model;
            this.effects.push({
                t: 0, dur: 0.7, mesh: null,
                update: (ef) => {
                    const p = ef.t / ef.dur;
                    model.position.y = -p * 1.2;
                    model.rotation.x = p * 0.5;
                },
                onEnd: () => {
                    this.scene.remove(model);
                    this.scene.remove(e.hpBar);
                },
            });
        }
        this.hooks.onDeath?.(e);
    }

    #towerFall(t) {
        // 塔冧：縮落去 + 換做瓦礫
        const model = t.model;
        this.#explosion(t.x, t.z, 2.2, 0xccbbaa);
        this.effects.push({
            t: 0, dur: 0.9, mesh: null,
            update: (ef) => {
                const p = ef.t / ef.dur;
                model.scale.y = 1 - p * 0.85;
                model.rotation.z = (Math.random() - 0.5) * 0.04;
            },
            onEnd: () => {
                this.scene.remove(model);
                this.scene.remove(t.hpBar);
                // 瓦礫堆
                const rubble = new THREE.Group();
                rubble.userData.isRubble = true;
                for (let i = 0; i < 7; i++) {
                    const s = 0.25 + Math.random() * 0.35;
                    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), mat(0x8a857c));
                    rock.position.set(
                        t.x + (Math.random() - 0.5) * 1.6,
                        s * 0.5,
                        t.z + (Math.random() - 0.5) * 1.6
                    );
                    rock.rotation.set(Math.random(), Math.random(), Math.random());
                    rock.castShadow = true;
                    rubble.add(rock);
                }
                this.scene.add(rubble);
            },
        });

        const opponent = t.team === TEAM.PLAYER ? TEAM.ENEMY : TEAM.PLAYER;
        if (t.towerKind === 'king') {
            this.crowns[opponent] = 3;
            this.hooks.onTowerDestroyed?.(t);
            this.#endGame(opponent);
            return;
        }
        this.crowns[opponent] += 1;
        // 公主塔冧 → 王塔醒
        const king = this.towers[t.team].king;
        if (!king.active && !king.dead) {
            king.active = true;
            this.hooks.onKingActivated?.(t.team);
        }
        this.hooks.onTowerDestroyed?.(t);
        // 加時突然死亡
        if (this.phase === 'overtime') this.#endGame(opponent);
    }

    #endGame(winner) {
        if (this.phase === 'ended') return;
        this.phase = 'ended';
        this.result = {
            winner, // TEAM 或 null（和局）
            crowns: { ...this.crowns },
        };
        this.hooks.onGameOver?.(this.result);
    }

    // ---------- 聖水倍率 ----------
    elixirMultiplier() {
        if (this.phase === 'overtime') return 3;
        if (this.time <= GAME_RULES.doubleElixirAt) return 2;
        return 1;
    }

    // ---------- 尋路 ----------
    #moveGoal(e, target) {
        const sameSide = Math.sign(e.z) === Math.sign(target.z) || Math.abs(target.z) < 0.5;
        const inRiverBand = Math.abs(e.z) <= ARENA.riverHalf + 0.5;
        if (sameSide && !inRiverBand) return { x: target.x, z: target.z };

        const bx = e.x < 0 ? -ARENA.bridgeX : ARENA.bridgeX;
        const inCorridor = Math.abs(e.x - bx) <= ARENA.bridgeHalfW - 0.25;
        if (inRiverBand) {
            // 過緊橋：直行到對面
            const exitZ = (sameSide ? Math.sign(target.z) : -Math.sign(e.z)) * (ARENA.riverHalf + 0.9);
            return { x: bx, z: exitZ || -Math.sign(e.z) * (ARENA.riverHalf + 0.9) };
        }
        if (!inCorridor) {
            // 行去橋頭
            return { x: bx, z: Math.sign(e.z) * (ARENA.riverHalf + 0.7) };
        }
        // 喺走廊入面，向橋直行
        return { x: bx, z: -Math.sign(e.z) * (ARENA.riverHalf + 0.9) };
    }

    // ---------- 索敵 ----------
    #findTarget(e) {
        let best = null, bestD = Infinity;
        for (const o of this.entities) {
            if (o.dead || o.team === e.team) continue;
            if (e.targetsBuildingsOnly && !o.isBuilding && !o.isTower) continue;
            const d = dist(e, o) - o.radius;
            if (d <= e.sight && d < bestD) { bestD = d; best = o; }
        }
        if (best) return best;
        // 冇嘢喺視野內 → 行去最近敵方建築
        for (const o of this.entities) {
            if (o.dead || o.team === e.team) continue;
            if (!o.isBuilding && !o.isTower) continue;
            const d = dist(e, o);
            if (d < bestD) { bestD = d; best = o; }
        }
        return best;
    }

    #towerFindTarget(t) {
        let best = null, bestD = Infinity;
        for (const o of this.entities) {
            if (o.dead || o.team === t.team || o.isTower) continue;
            const d = dist(t, o) - o.radius - t.radius;
            if (d <= t.range && d < bestD) { bestD = d; best = o; }
        }
        return best;
    }

    // ---------- 攻擊 ----------
    #attack(e, target) {
        e.attackCd = e.hitSpeed;
        e.attackAnimT = 0;
        if (e.projectile) {
            this.#fireProjectile(e, target);
        } else {
            this.#damage(target, e.dmg);
            if (e.splash) {
                for (const o of this.entities) {
                    if (o.dead || o.team === e.team || o === target) continue;
                    if (dist(o, target) <= e.splash + o.radius) this.#damage(o, e.dmg);
                }
            }
        }
    }

    #fireProjectile(e, target) {
        const kind = e.projectile;
        const model = makeProjectile(kind);
        const y0 = e.isTower ? (e.towerKind === 'king' ? 3.5 : 3.0)
            : e.cardId === 'watchtower' ? 2.0
            : e.cardId === 'catapult' ? 1.0 : 0.8;
        model.position.set(e.x, y0, e.z);
        this.scene.add(model);
        const speed = kind === 'stone' ? 9 : kind === 'bullet' ? 22 : 16;
        this.projectiles.push({
            kind, model, x: e.x, y: y0, z: e.z,
            target, team: e.team, dmg: e.dmg, splash: e.splash ?? 0,
            speed, lob: kind === 'stone',
            travel: 0,
            total: Math.max(0.15, dist(e, target) / speed),
            sx: e.x, sy: y0, sz: e.z,
        });
    }

    #updateProjectiles(dt) {
        for (const p of this.projectiles) {
            if (p.done) continue;
            p.travel += dt;
            const t = p.target;
            const tx = t.dead ? p.lastTx ?? t.x : t.x;
            const tz = t.dead ? p.lastTz ?? t.z : t.z;
            p.lastTx = tx; p.lastTz = tz;
            const ty = 0.5;
            const prog = Math.min(1, p.travel / p.total);
            p.x = p.sx + (tx - p.sx) * prog;
            p.z = p.sz + (tz - p.sz) * prog;
            if (p.lob) {
                p.y = p.sy + (ty - p.sy) * prog + Math.sin(prog * Math.PI) * 3.2;
            } else {
                p.y = p.sy + (ty - p.sy) * prog;
            }
            p.model.position.set(p.x, p.y, p.z);
            // 箭頭朝向
            if (p.kind === 'arrow') {
                p.model.lookAt(tx, ty, tz);
            }
            if (prog >= 1) {
                p.done = true;
                this.scene.remove(p.model);
                if (p.splash) {
                    this.#explosion(p.x, p.z, p.splash, 0xbbaa88);
                    for (const o of this.entities) {
                        if (o.dead || o.team === p.team) continue;
                        if (dist(o, { x: p.x, z: p.z }) <= p.splash + o.radius) {
                            this.#damage(o, p.dmg);
                        }
                    }
                } else if (!t.dead) {
                    this.#damage(t, p.dmg);
                }
            }
        }
        this.projectiles = this.projectiles.filter(p => !p.done);
    }

    // ---------- 主更新 ----------
    update(dt) {
        if (this.phase === 'ended') {
            this.#updateEffects(dt);
            this.#updateProjectiles(dt);
            return;
        }
        this.simTime += dt;

        // 計時
        this.time -= dt;
        if (this.time <= 0) {
            if (this.phase === 'regulation') {
                const pc = this.crowns[TEAM.PLAYER], ec = this.crowns[TEAM.ENEMY];
                if (pc !== ec) {
                    this.#endGame(pc > ec ? TEAM.PLAYER : TEAM.ENEMY);
                    return;
                }
                this.phase = 'overtime';
                this.time = GAME_RULES.overtimeTime;
                this.hooks.onOvertime?.();
            } else {
                // 加時完：比最殘塔
                const lowest = (team) => {
                    let min = Infinity;
                    for (const t of Object.values(this.towers[team])) {
                        if (!t.dead) min = Math.min(min, t.hp / t.maxHp);
                    }
                    return min;
                };
                const lp = lowest(TEAM.PLAYER), le = lowest(TEAM.ENEMY);
                this.#endGame(lp > le ? TEAM.PLAYER : le > lp ? TEAM.ENEMY : null);
                return;
            }
        }

        // 聖水
        const mult = this.elixirMultiplier();
        for (const team of [TEAM.PLAYER, TEAM.ENEMY]) {
            const p = this.players[team];
            p.elixirT += dt * mult;
            while (p.elixirT >= GAME_RULES.elixirInterval) {
                p.elixirT -= GAME_RULES.elixirInterval;
                p.elixir = Math.min(GAME_RULES.elixirMax, p.elixir + 1);
            }
        }

        // 實體更新
        for (const e of this.entities) {
            if (e.dead) continue;

            // 建築壽命
            if (!e.isTower && e.isBuilding) {
                e.lifetime -= dt;
                if (e.lifetime <= 0) { this.#kill(e); continue; }
            }

            if (e.deployT > 0) { e.deployT -= dt; continue; }
            if (e.attackCd > 0) e.attackCd -= dt;
            if (e.attackAnimT >= 0) {
                e.attackAnimT += dt / 0.35;
                if (e.attackAnimT >= 1) e.attackAnimT = -1;
            }

            if (e.isTower) {
                if (!e.active) continue;
                if (!e.target || e.target.dead || dist(e, e.target) - e.target.radius - e.radius > e.range) {
                    e.target = this.#towerFindTarget(e);
                }
                if (e.target && e.attackCd <= 0) this.#attack(e, e.target);
                continue;
            }

            // 索敵
            e.retargetT -= dt;
            if (!e.target || e.target.dead || e.retargetT <= 0) {
                e.target = this.#findTarget(e);
                e.retargetT = 0.4;
            }
            if (!e.target) continue;

            const reach = e.range + e.radius + e.target.radius;
            const d = dist(e, e.target);

            if (d <= reach) {
                // 面向目標攻擊
                e.facing = Math.atan2(e.target.x - e.x, e.target.z - e.z);
                if (e.attackCd <= 0) this.#attack(e, e.target);
            } else if (e.speed > 0) {
                const goal = this.#moveGoal(e, e.target);
                const dx = goal.x - e.x, dz = goal.z - e.z;
                const gd = Math.sqrt(dx * dx + dz * dz) || 1;
                const step = Math.min(e.speed * dt, gd);
                e.x += (dx / gd) * step;
                e.z += (dz / gd) * step;
                e.facing = Math.atan2(dx, dz);
                e.moving = true;
            }
            if (d <= reach) e.moving = false;
        }

        // 同隊單位分隔（避免疊埋一嚿）
        const units = this.entities.filter(e => !e.dead && !e.isTower && !e.isBuilding && e.deployT <= 0);
        for (let i = 0; i < units.length; i++) {
            for (let j = i + 1; j < units.length; j++) {
                const a = units[i], b = units[j];
                const minD = a.radius + b.radius;
                const dx = b.x - a.x, dz = b.z - a.z;
                const d2 = dx * dx + dz * dz;
                if (d2 < minD * minD && d2 > 0.0001) {
                    const d = Math.sqrt(d2);
                    const push = (minD - d) / 2;
                    const nx = dx / d, nz = dz / d;
                    a.x -= nx * push; a.z -= nz * push;
                    b.x += nx * push; b.z += nz * push;
                }
            }
        }

        // 保持喺場內 + 唔好跌落河
        for (const e of units) {
            e.x = Math.max(-ARENA.halfW + 0.3, Math.min(ARENA.halfW - 0.3, e.x));
            e.z = Math.max(-ARENA.halfL + 0.3, Math.min(ARENA.halfL - 0.3, e.z));
            if (Math.abs(e.z) < ARENA.riverHalf) {
                // 河帶內必須喺橋走廊
                const bx = e.x < 0 ? -ARENA.bridgeX : ARENA.bridgeX;
                const maxOff = ARENA.bridgeHalfW - 0.25;
                if (Math.abs(e.x - bx) > maxOff) {
                    e.x = bx + Math.sign(e.x - bx) * maxOff;
                }
            }
        }

        // 同步模型
        for (const e of this.entities) {
            if (e.dead) continue;
            e.model.position.x = e.x;
            e.model.position.z = e.z;
            const targetRot = e.facing;
            let diff = targetRot - e.model.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            e.model.rotation.y += diff * Math.min(1, dt * 10);
            e.model.userData.animate?.(this.simTime + e.id * 0.7, {
                moving: !!e.moving && e.deployT <= 0,
                attackT: e.attackAnimT,
            });
            e.hpBar.position.set(e.x, e.hpBar.userData.h, e.z);
        }

        this.#updateProjectiles(dt);
        this.#updateEffects(dt);
    }

    #updateEffects(dt) {
        for (const ef of this.effects) {
            ef.t += dt;
            ef.update(ef, dt);
            if (ef.t >= ef.dur) {
                ef.done = true;
                if (ef.mesh) this.scene.remove(ef.mesh);
                ef.onEnd?.();
            }
        }
        this.effects = this.effects.filter(ef => !ef.done);
    }

    // 畀 UI / AI 用嘅查詢
    aliveUnits(team) {
        return this.entities.filter(e => !e.dead && e.team === team && !e.isTower);
    }
    updateHpBarOrientation(quaternion) {
        for (const bar of this.hpBars) bar.quaternion.copy(quaternion);
    }
}
