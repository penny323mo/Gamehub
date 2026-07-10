// 遊戲核心模擬 — 單位、戰鬥、塔、聖水、計時、勝負
import * as THREE from 'three';
import { ARENA, TEAM, TOWERS, GAME_RULES, teamDir } from './constants.js';
import { CARDS } from './cards.js';
import { makeUnitModel, makePrincessTower, makeKingTower, makeProjectile, mat, meshyTint } from './models.js';
import { instantiate, ASSETS } from './assets.js';

let nextId = 1;

function dist(a, b) {
    const dx = a.x - b.x, dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
}

// ---------- 血條 ----------
// 圓角膠囊邊框（透明中空）貼喺前面，遮走軌道／填充嘅方角，睇落似圓角血條
let _barFrameTex = null;
function barFrameTexture() {
    if (_barFrameTex) return _barFrameTex;
    const W = 256, H = 64;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const rr = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    };
    ctx.clearRect(0, 0, W, H);
    // 外圈：實色膠囊（連陰影）
    ctx.fillStyle = 'rgba(20,14,8,0.95)';
    rr(0, 0, W, H, H / 2);
    ctx.fill();
    // 挖空內圈 → 露出後面嘅軌道/填充
    const pad = 7;
    ctx.globalCompositeOperation = 'destination-out';
    rr(pad, pad, W - pad * 2, H - pad * 2, (H - pad * 2) / 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    // 頂部高光細線，加少少立體感
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    rr(pad + 1, pad + 1, W - pad * 2 - 2, (H - pad * 2) * 0.4, (H - pad * 2) / 2);
    ctx.stroke();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    _barFrameTex = tex;
    return tex;
}

export function makeHpBar(width, team) {
    const height = 0.16;
    const pad = 0.028; // 邊框留位
    const g = new THREE.Group();

    // 三個 mesh 全部要標 transparent:true，先會跌入同一個 render queue，
    // 令 renderOrder（20/21/22）實際生效 — 否則 opaque 嘅 fill 會喺
    // transparent 嘅 track 之前畫，然後即刻俾 track 蓋咗，睇落成塊變晒暗色。
    const track = new THREE.Mesh(
        new THREE.PlaneGeometry(width - pad * 2, height - pad * 2),
        new THREE.MeshBasicMaterial({ color: 0x2a1c14, depthTest: false, depthWrite: false, transparent: true, opacity: 0.92 })
    );
    const fill = new THREE.Mesh(
        new THREE.PlaneGeometry(width - pad * 2, height - pad * 2),
        new THREE.MeshBasicMaterial({
            color: team === TEAM.PLAYER ? 0x3ba2ff : 0xff5544,
            depthTest: false, depthWrite: false, transparent: true,
        })
    );
    const frame = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        new THREE.MeshBasicMaterial({ map: barFrameTexture(), transparent: true, depthTest: false, depthWrite: false })
    );
    fill.position.z = 0.001;
    frame.position.z = 0.002;
    track.renderOrder = 20;
    fill.renderOrder = 21;
    frame.renderOrder = 22;
    g.add(track, fill, frame);

    const fillW = width - pad * 2;
    g.userData.setRatio = (r) => {
        const ratio = Math.max(r, 0.001);
        fill.scale.x = ratio;
        fill.position.x = -fillW * (1 - ratio) / 2;
    };
    return g;
}

// ---------- 實體 ----------
class Entity {
    constructor({ team, cardId, x, z, isTower = false, towerKind = null, levelMult = 1 }) {
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
            this.maxHp = Math.round(c.hp * levelMult);
            this.hp = this.maxHp;
            this.dmg = Math.round(c.dmg * levelMult);
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
        this.slowT = 0;       // 冰凍/減速剩餘秒數
        this.slowFactor = 1;  // 減速時嘅速度倍率
        this.genT = 0;        // 聖水磨坊產水計時
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
    constructor(scene, playerDeck, enemyDeck, hooks = {}, opts = {}) {
        this.scene = scene;
        this.hooks = hooks; // { onTowerDestroyed, onGameOver, onKingActivated, onSpawn, onSpell, onSpellHit }
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
        // 卡牌等級（id -> level 倍率查表由 opts.levels 提供，冇就全部 1）
        this.levels = opts.levels ?? { [TEAM.PLAYER]: {}, [TEAM.ENEMY]: {} };
        this.levelBonus = opts.levelBonus ?? 0.08;
        // 敵方聖水回復倍率（連勝挑戰高關卡用）
        this.enemyElixirRate = opts.enemyElixirRate ?? 1;
        // 傷害統計（結算傷害榜用）＋雙方已出卡記錄
        this.damageByCard = { [TEAM.PLAYER]: {}, [TEAM.ENEMY]: {} };
        this.playedCards = { [TEAM.PLAYER]: [], [TEAM.ENEMY]: [] };
        this.fountainT = 0;
        this.overtimeExtensions = 0;
        this.climaxNotified = false;
        this.fountain = null;

        this.towers = { [TEAM.PLAYER]: {}, [TEAM.ENEMY]: {} };
        this.#spawnTowers();
    }

    #levelMult(team, cardId) {
        const lv = this.levels[team]?.[cardId] ?? 1;
        return 1 + this.levelBonus * (lv - 1);
    }

    #spawnTowers() {
        // 血條擺喺模型實際最高點上少少
        const towerTop = (m) => new THREE.Box3().setFromObject(m).max.y + 0.35;
        for (const team of [TEAM.PLAYER, TEAM.ENEMY]) {
            const sz = teamDir(team) > 0 ? -1 : 1; // 玩家塔喺 z>0
            for (const side of [-1, 1]) {
                const t = new Entity({
                    team, isTower: true, towerKind: 'princess',
                    x: side * TOWERS.princess.x, z: sz * TOWERS.princess.z,
                });
                t.model = makePrincessTower(team);
                this.#addEntity(t, towerTop(t.model));
                this.towers[team][side === -1 ? 'left' : 'right'] = t;
            }
            const k = new Entity({
                team, isTower: true, towerKind: 'king',
                x: 0, z: sz * TOWERS.king.z,
            });
            k.model = makeKingTower(team);
            this.#addEntity(k, towerTop(k.model));
            this.towers[team].king = k;
        }
    }

    #addEntity(e, hpBarHeight = null) {
        e.model.position.set(e.x, 0, e.z);
        e.model.rotation.y = e.facing;
        this.scene.add(e.model);
        const barW = e.isTower ? 2.1 : Math.max(0.85, e.radius * 2.1);
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
        if (e.cardId === 'elephant') return 2.88; // 模型放大 20% 之後嘅實際高度
        if (e.cardId === 'watchtower') return 3.0;
        if (e.cardId === 'ballista') return 3.2;
        if (e.cardId === 'mill') return 2.3;
        if (e.cardId === 'knight') return 2.52;
        if (e.cardId === 'scout') return 2.2;
        if (e.cardId === 'catapult' || e.cardId === 'ram') return 1.8;
        return 2.04;
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
        this.playedCards[team].push(cardId);

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
            : n === 2 ? [[-0.54, 0], [0.54, 0]]
            : [[0, -0.54], [-0.54, 0.42], [0.54, 0.42]];
        for (let i = 0; i < n; i++) {
            const e = new Entity({
                team, cardId,
                x: x + offsets[i][0], z: z + offsets[i][1],
                levelMult: this.#levelMult(team, cardId),
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
        } else if (card.id === 'arrows') {
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
        } else if (card.id === 'freeze') {
            // 冰凍：藍白冰霧收縮
            const mist = new THREE.Mesh(
                new THREE.SphereGeometry(card.splash, 16, 10),
                new THREE.MeshBasicMaterial({ color: 0x9adcff, transparent: true, opacity: 0.25 })
            );
            mist.position.set(x, 0.5, z);
            mist.scale.y = 0.35;
            this.scene.add(mist);
            this.effects.push({
                t: 0, dur: card.castDelay, mesh: mist,
                update: (ef) => {
                    const p = ef.t / ef.dur;
                    mist.material.opacity = 0.25 + p * 0.25;
                    mist.scale.setScalar(1 - p * 0.15);
                    mist.scale.y = 0.35;
                },
                onEnd: () => this.#spellImpact(team, card, x, z),
            });
        } else {
            // 炸藥桶等：由天上跌落
            const keg = new THREE.Group();
            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.28, 0.45, 10),
                new THREE.MeshLambertMaterial({ color: 0x7a4a22 })
            );
            keg.add(barrel);
            keg.position.set(x, 7, z);
            this.scene.add(keg);
            this.effects.push({
                t: 0, dur: card.castDelay, mesh: keg,
                update: (ef) => {
                    const p = Math.min(1, ef.t / ef.dur);
                    keg.position.y = 7 * (1 - p * p);
                    keg.rotation.z = p * 2.5;
                },
                onEnd: () => this.#spellImpact(team, card, x, z),
            });
        }
    }

    #spellImpact(team, card, x, z) {
        const color = card.id === 'fireball' ? 0xff6a1a
            : card.id === 'freeze' ? 0x9adcff
            : card.id === 'powderkeg' ? 0xffaa33 : 0xddcc66;
        this.#explosion(x, z, card.splash, color);
        const mult = this.#levelMult(team, card.id);
        let unitsHit = 0;
        for (const e of this.entities) {
            if (e.dead || e.team === team) continue;
            if (dist(e, { x, z }) <= card.splash + e.radius) {
                const base = card.dmg * mult;
                const dmg = e.isTower ? base * GAME_RULES.spellTowerFactor : base;
                if (!e.isTower) unitsHit += 1;
                this.#damage(e, dmg, { team, cardId: card.id });
                if (card.slow && !e.isTower) {
                    e.slowT = card.slow.dur;
                    e.slowFactor = card.slow.factor;
                    this.#attachSlowRing(e);
                }
            }
        }
        if (unitsHit > 0) this.hooks.onSpellHit?.(team, card.id, unitsHit);
        this.hooks.onImpact?.(card.id, x, z);
    }

    // 減速中嘅單位腳底藍色冰環
    #attachSlowRing(e) {
        if (e.slowRing) return;
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(e.radius * 1.1, e.radius * 1.5, 20),
            new THREE.MeshBasicMaterial({ color: 0x9adcff, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(e.x, 0.06, e.z);
        this.scene.add(ring);
        e.slowRing = ring;
    }

    #detachSlowRing(e) {
        if (!e.slowRing) return;
        this.scene.remove(e.slowRing);
        e.slowRing = null;
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
        // Meshy「出兵點」圓盤，淡出
        const marker = instantiate('meshySpawnMarker');
        const ms = ASSETS.meshySpawnMarker.rawSize;
        const markerMat = new THREE.MeshLambertMaterial({
            color: team === TEAM.PLAYER ? 0x6aa8e8 : 0xe88a7a,
            transparent: true, opacity: 0.9,
        });
        marker.traverse((o) => { if (o.isMesh) o.material = markerMat; });
        const mScale = (r * 2.4) / (Math.max(ms.x, ms.z) || 1);
        marker.scale.set(mScale, mScale * 0.6, mScale);
        marker.position.set(x, 0.02, z);
        this.scene.add(marker);
        this.effects.push({
            t: 0, dur: 1.1, mesh: marker,
            update: (ef) => {
                markerMat.opacity = 0.9 * (1 - ef.t / ef.dur);
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
    #damage(e, dmg, src = null) {
        if (e.dead) return;
        // 完場之後特效/飛行中嘅投射物照播，但唔准再改變戰果——
        // 唔係一個遲到嘅火球可以喺勝利畫面之後先冧塔、改皇冠數
        if (this.phase === 'ended') return;
        if (src && src.cardId) {
            const board = this.damageByCard[src.team];
            board[src.cardId] = (board[src.cardId] ?? 0) + Math.min(Math.max(0, e.hp), dmg);
        }
        e.hp -= dmg;
        e.hpBar.visible = true;
        e.hpBar.userData.setRatio(Math.max(0, e.hp / e.maxHp));
        e.model.userData.onHit?.(this.simTime);
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
        this.#detachSlowRing(e);
        if (e.isTower) {
            this.#towerFall(e);
        } else {
            // 陣亡動畫：沉落地下 + 塵埃。
            // hpBar 已隱形，即刻拆；model 用 effect 嘅 mesh 欄位揸住——
            // 噉樣動畫播完（updateEffects）或者中途退場（cleanupMatch 掃 effects）
            // 都一定會由場景度拆走，唔會因為實體已被清掃而漏低隻屍體
            this.#particles(e.x, e.z, 0xcfc8b8, 6, 2, 0.3);
            this.scene.remove(e.hpBar);
            const model = e.model;
            this.effects.push({
                t: 0, dur: 0.7, mesh: model,
                update: (ef) => {
                    const p = ef.t / ef.dur;
                    model.position.y = -p * 1.2;
                    model.rotation.x = p * 0.5;
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
                // 瓦礫：Meshy「破塔」模型
                const rubble = new THREE.Group();
                rubble.userData.isRubble = true;
                const broken = meshyTint(instantiate('meshyRubble'), 0x8f887c);
                const s = ASSETS.meshyRubble.rawSize;
                const sc = (t.towerKind === 'king' ? 2.6 : 2.0) / (Math.max(s.x, s.z) || 1);
                broken.scale.setScalar(sc);
                broken.position.set(t.x, -ASSETS.meshyRubble.rawMin.y * sc, t.z);
                broken.rotation.y = Math.random() * Math.PI * 2;
                rubble.add(broken);
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

    // ---------- 加時聖水泉（河心紫圈）----------
    #makeFountain() {
        const g = new THREE.Group();
        g.userData.isRubble = true; // 借用 cleanupMatch 嘅 isRubble 清理路徑
        const ring = new THREE.Mesh(
            new THREE.RingGeometry(2.2, 2.6, 40),
            new THREE.MeshBasicMaterial({ color: 0xb04ae0, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.07, 0);
        g.add(ring);
        const drop = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 10, 8),
            new THREE.MeshBasicMaterial({ color: 0xd06aff, transparent: true, opacity: 0.85 })
        );
        drop.position.set(0, 1, 0);
        g.add(drop);
        this.scene.add(g);
        this.fountain = g;
        this.effects.push({
            t: 0, dur: Infinity, mesh: null,
            update: (ef) => {
                drop.position.y = 1 + Math.sin(ef.t * 2.4) * 0.25;
                drop.rotation.y = ef.t * 1.5;
                ring.material.opacity = 0.45 + Math.sin(ef.t * 3) * 0.15;
            },
        });
        this.hooks.onFountain?.();
    }

    // ---------- 聖水倍率 ----------
    elixirMultiplier() {
        if (this.phase === 'overtime') return GAME_RULES.overtimeElixirMult;
        if (this.time <= GAME_RULES.doubleElixirAt) return 2;
        return 1;
    }

    // ---------- 決勝加成：加時最後幾秒雙方攻擊力提升，谷落決勝負 ----------
    #climaxMult() {
        return (this.phase === 'overtime' && this.time <= GAME_RULES.climaxWindow)
            ? GAME_RULES.climaxDmgMult : 1;
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
        // 狂戰士：血愈少出手愈快（最盡快一倍）
        const berserk = e.card?.berserk ? (0.5 + 0.5 * (e.hp / e.maxHp)) : 1;
        e.attackCd = e.hitSpeed * berserk;
        e.attackAnimT = 0;
        const src = { team: e.team, cardId: e.isTower ? 'tower' : e.cardId };
        const dmg = e.dmg * this.#climaxMult();
        if (e.projectile) {
            this.#fireProjectile(e, target, dmg);
        } else {
            this.#damage(target, dmg, src);
            if (e.splash) {
                for (const o of this.entities) {
                    if (o.dead || o.team === e.team || o === target) continue;
                    if (dist(o, target) <= e.splash + o.radius) this.#damage(o, dmg, src);
                }
            }
        }
    }

    #fireProjectile(e, target, dmg = e.dmg) {
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
            target, team: e.team, dmg, splash: e.splash ?? 0,
            srcCardId: e.isTower ? 'tower' : e.cardId,
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
                            this.#damage(o, p.dmg, { team: p.team, cardId: p.srcCardId });
                        }
                    }
                } else if (!t.dead) {
                    this.#damage(t, p.dmg, { team: p.team, cardId: p.srcCardId });
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
                this.overtimeExtensions = 0;
                this.climaxNotified = false;
                this.hooks.onOvertime?.();
            } else {
                const pc = this.crowns[TEAM.PLAYER], ec = this.crowns[TEAM.ENEMY];
                if (pc !== ec) {
                    this.#endGame(pc > ec ? TEAM.PLAYER : TEAM.ENEMY);
                    return;
                }
                // 加時完仲打和：唔好即刻靠塔血比大細完場，再延長一節（有次數上限保證一定完結）
                if (this.overtimeExtensions < GAME_RULES.maxOvertimeExtensions) {
                    this.overtimeExtensions += 1;
                    this.time = GAME_RULES.overtimeExtension;
                    this.climaxNotified = false;
                    this.hooks.onOvertimeExtend?.(this.overtimeExtensions);
                } else {
                    // 比最殘塔分勝負
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
        }

        // 加時決勝一刻：淨係通知一次
        if (this.phase === 'overtime' && !this.climaxNotified && this.time <= GAME_RULES.climaxWindow) {
            this.climaxNotified = true;
            this.hooks.onClimax?.();
        }

        // 聖水
        const mult = this.elixirMultiplier();
        for (const team of [TEAM.PLAYER, TEAM.ENEMY]) {
            const p = this.players[team];
            const rate = team === TEAM.ENEMY ? this.enemyElixirRate : 1;
            p.elixirT += dt * mult * rate;
            while (p.elixirT >= GAME_RULES.elixirInterval) {
                p.elixirT -= GAME_RULES.elixirInterval;
                p.elixir = Math.min(GAME_RULES.elixirMax, p.elixir + 1);
            }
        }

        // 加時聖水泉：河心有自己單位就每 3 秒多 1 滴
        if (this.phase === 'overtime') {
            if (!this.fountain) this.#makeFountain();
            this.fountainT += dt;
            if (this.fountainT >= 3) {
                this.fountainT -= 3;
                for (const team of [TEAM.PLAYER, TEAM.ENEMY]) {
                    const near = this.entities.some(e =>
                        !e.dead && e.team === team && !e.isTower && !e.isBuilding &&
                        e.deployT <= 0 && dist(e, { x: 0, z: 0 }) <= 2.6);
                    if (near) {
                        const p = this.players[team];
                        p.elixir = Math.min(GAME_RULES.elixirMax, p.elixir + 1);
                        this.#particles(0, 0, 0xd06aff, 6, 2, 0.5);
                    }
                }
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

            // 冰凍/減速：移動同攻擊節奏一齊慢
            const slowMult = e.slowT > 0 ? e.slowFactor : 1;
            if (e.slowT > 0) {
                e.slowT -= dt;
                if (e.slowT <= 0) this.#detachSlowRing(e);
            }

            // 聖水磨坊產水
            if (e.card?.elixirGen) {
                e.genT += dt;
                if (e.genT >= e.card.elixirGen.interval) {
                    e.genT -= e.card.elixirGen.interval;
                    const p = this.players[e.team];
                    p.elixir = Math.min(GAME_RULES.elixirMax, p.elixir + e.card.elixirGen.amount);
                    this.#particles(e.x, e.z, 0xd06aff, 5, 1.6, 0.9);
                }
            }

            if (e.attackCd > 0) e.attackCd -= dt * slowMult;
            if (e.attackAnimT >= 0) {
                e.attackAnimT += dt / 0.35;
                if (e.attackAnimT >= 1) e.attackAnimT = -1;
            }

            // 純輔助建築（磨坊）唔使索敵
            if (e.isBuilding && !e.isTower && e.dmg <= 0) continue;

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
                const step = Math.min(e.speed * slowMult * dt, gd);
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
            if (e.slowRing) e.slowRing.position.set(e.x, 0.06, e.z);
        }

        this.#updateProjectiles(dt);
        this.#updateEffects(dt);

        // 清走死咗嘅兵（塔要留低：serialize/袋位邏輯用到）。屍體模型嘅落地動畫
        // 由 effects 入面嘅 closure 自己揸住，唔靠 entities array，可以即刻剔走，
        // 唔係打耐咗全部 targeting/法術/血條 loop 都要行過幾百具屍體
        if (this.entities.some(e => e.dead && !e.isTower)) {
            const removedBars = new Set();
            for (const e of this.entities) {
                if (e.dead && !e.isTower) removedBars.add(e.hpBar);
            }
            this.entities = this.entities.filter(e => !e.dead || e.isTower);
            this.hpBars = this.hpBars.filter(b => !removedBars.has(b));
        }
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

    // ---------- PvP：序列化戰場快照畀 host-relay 廣播（guest 淨係接收呢啲嚟渲染）----------
    serialize() {
        return {
            time: this.time, phase: this.phase, mult: this.elixirMultiplier(),
            winner: this.phase === 'ended' ? (this.result?.winner ?? null) : undefined,
            crowns: { ...this.crowns },
            playedCards: { [TEAM.PLAYER]: this.playedCards[TEAM.PLAYER].slice(-8), [TEAM.ENEMY]: this.playedCards[TEAM.ENEMY].slice(-8) },
            players: {
                [TEAM.PLAYER]: {
                    elixir: this.players[TEAM.PLAYER].elixir,
                    hand: [...this.players[TEAM.PLAYER].hand],
                    next: this.players[TEAM.PLAYER].next,
                },
                [TEAM.ENEMY]: {
                    elixir: this.players[TEAM.ENEMY].elixir,
                    hand: [...this.players[TEAM.ENEMY].hand],
                    next: this.players[TEAM.ENEMY].next,
                },
            },
            // 塔就算冧咗都要留低（用 dead 標記），guest 先知道公主塔倒咗、可以出袋位；
            // 普通兵死咗就冇謂再送，guest 見唔到就自己拆走個 model
            entities: this.entities.filter(e => e.isTower || !e.dead).map(e => ({
                id: e.id, team: e.team, cardId: e.cardId,
                isTower: e.isTower, towerKind: e.towerKind,
                x: +e.x.toFixed(2), z: +e.z.toFixed(2),
                hp: Math.round(e.hp), maxHp: e.maxHp, dead: e.dead,
                facing: +e.model.rotation.y.toFixed(3),
                moving: !!e.moving, attackT: +(e.attackAnimT ?? -1).toFixed(2),
            })),
        };
    }
}
