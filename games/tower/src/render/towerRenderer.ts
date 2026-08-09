import * as THREE from 'three';
import type { GameState, Tower } from '../core/types';
import { GRAPHICS, SURFACE_Y, towerVisualLevel } from '../core/config';
import { cellToWorld } from '../core/path';
import { 取同步 } from './assets';

// Colour palettes per tower type
const TOWER_COLORS: Record<string, number> = {
    arrow: 0x8b6914,
    arrow_rapid: 0xa88532,
    arrow_pierce: 0x6e520f,
    cannon: 0x555555,
    ice: 0x66ccff,
    fire: 0xff5500,
    lightning: 0xffee00,
    poison: 0x66ff33,
    sniper: 0x333399,
    // 六個進化型：幾何跟返基礎型（同 arrow_rapid／arrow_pierce 一樣），色深一級。
    cannon_siege: 0x3d3d44,
    ice_glacier: 0x2f9fd8,
    fire_inferno: 0xd32f00,
    lightning_storm: 0xd8c400,
    poison_plague: 0x2fbf1f,
    sniper_railgun: 0x1f1f6e,
};

const ACCENT_COLORS: Record<string, number> = {
    arrow: 0xddaa33,
    arrow_rapid: 0xffcc55,
    arrow_pierce: 0xbb8822,
    cannon: 0x888888,
    ice: 0xaaeeff,
    fire: 0xff8844,
    lightning: 0xffffaa,
    poison: 0xaaff77,
    sniper: 0x6666cc,
    cannon_siege: 0xbbbbc4,
    ice_glacier: 0xddf6ff,
    fire_inferno: 0xffbb66,
    lightning_storm: 0xffffdd,
    poison_plague: 0xccffaa,
    sniper_railgun: 0x9999ee,
};

// Segment counts scale down on mobile
const SEG_HI = GRAPHICS.isMobile ? 8 : 16;
const SEG_MID = GRAPHICS.isMobile ? 6 : 12;
const SEG_LO = GRAPHICS.isMobile ? 5 : 8;

// 邏輯座標仍然係格中心；淨係收窄模型 footprint。Kenney 塔底原本啱啱 1×1，
// 放入 1×1 格就四邊貼死，冰／毒屋頂更去到 1.41 格，視覺上似起咗落條路。
const TOWER_VISUAL_SCALE_XZ = 0.85;

interface MatOpts {
    color: number;
    roughness?: number;
    metalness?: number;
    emissive?: number;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    flatShading?: boolean;
    side?: THREE.Side;
}

/** Standard material on desktop, cheaper Lambert on mobile. */
function mat(opts: MatOpts): THREE.Material {
    if (GRAPHICS.isMobile) {
        return new THREE.MeshLambertMaterial({
            color: opts.color,
            emissive: opts.emissive ?? 0x000000,
            emissiveIntensity: opts.emissiveIntensity ?? 1,
            transparent: opts.transparent,
            opacity: opts.opacity,
            side: opts.side,
        });
    }
    return new THREE.MeshStandardMaterial(opts as THREE.MeshStandardMaterialParameters);
}

/** Glass-like material — physical transmission on desktop, translucent Lambert on mobile. */
function glassMat(color: number): THREE.Material {
    if (GRAPHICS.isMobile) {
        return new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.55 });
    }
    return new THREE.MeshPhysicalMaterial({
        color,
        transmission: 0.88,
        roughness: 0.08,
        metalness: 0,
        ior: 1.45,
        thickness: 0.4,
    });
}

// ─── Generic animation channel types (populated per tower, driven in animate) ───
interface SpinChannel { node: THREE.Object3D; speed: number; axis: 'x' | 'y' | 'z' }
interface BobChannel { node: THREE.Object3D; baseY: number; amp: number; speed: number; phase: number }
interface PulseScaleChannel { node: THREE.Object3D; base: number; amp: number; speed: number; phase: number; yOnly?: boolean }
interface PulseEmissiveChannel { mat: THREE.MeshStandardMaterial | THREE.MeshLambertMaterial; base: number; amp: number; speed: number; phase: number }
interface OrbitChannel { pivot: THREE.Object3D; speed: number }
interface RiseChannel { node: THREE.Object3D; baseY: number; height: number; speed: number; phase: number }

interface TowerParts {
    buildProgress: number;
    lastCooldown: number;
    attackTimer: number;
    turretGroup?: THREE.Group;
    recoilNode?: THREE.Object3D;
    recoilAmount?: number;
    energyRingMaterial?: THREE.MeshStandardMaterial | THREE.MeshLambertMaterial;
    spin?: SpinChannel[];
    bob?: BobChannel[];
    pulseScale?: PulseScaleChannel[];
    pulseEmissive?: PulseEmissiveChannel[];
    orbit?: OrbitChannel[];
    rise?: RiseChannel[];
    arcs?: THREE.Line[];
    arcTimer?: number;
    arcOrigin?: THREE.Vector3;
}

/** Helper: create a mesh, position it, optionally cast shadow, add to parent. */
function addMesh(
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    material: THREE.Material,
    x = 0, y = 0, z = 0,
    noShadow = false
): THREE.Mesh {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    if (GRAPHICS.enableShadows && !noShadow) m.castShadow = true;
    parent.add(m);
    return m;
}

export class TowerRenderer {
    private scene: THREE.Scene;
    private meshes = new Map<number, THREE.Group>();
    private sellingTowers = new Set<{ group: THREE.Group, timer: number, maxTimer: number }>();
    private rangeRing: THREE.Group | null = null;
    private time = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    sync(state: GameState): void {
        // Drop meshes for towers no longer in state (restart / external removal).
        // Sold/upgraded towers go through removeTower() first and animate out instead.
        const activeTowerIds = new Set(state.towers.map(t => t.id));
        for (const [id, group] of this.meshes) {
            if (!activeTowerIds.has(id)) {
                this.scene.remove(group);
                this.meshes.delete(id);
            }
        }

        for (const tower of state.towers) {
            if (!this.meshes.has(tower.id)) {
                const group = this.createTowerMesh(tower);
                group.scale.set(0, 0, 0);
                group.userData.buildProgress = 0;
                this.scene.add(group);
                this.meshes.set(tower.id, group);
            }
        }
    }

    removeTower(id: number): void {
        const group = this.meshes.get(id);
        if (group) {
            this.sellingTowers.add({ group, timer: 0.25, maxTimer: 0.25 });
            this.meshes.delete(id);
        }
    }

    animate(dt: number, state: GameState): void {
        this.time += dt;
        const time = this.time;

        // Selling shrink-spin
        for (const sell of this.sellingTowers) {
            sell.timer -= dt;
            if (sell.timer <= 0) {
                this.scene.remove(sell.group);
                this.sellingTowers.delete(sell);
            } else {
                const t = sell.timer / sell.maxTimer;
                const ease = t * t * t;
                sell.group.scale.set(ease, ease, ease);
                sell.group.rotation.y += dt * 10;
            }
        }

        for (const tower of state.towers) {
            const group = this.meshes.get(tower.id);
            if (!group) continue;
            const parts = group.userData as TowerParts;

            // Build pop-in (elastic)
            if (parts.buildProgress < 1.0) {
                parts.buildProgress = Math.min(1.0, parts.buildProgress + dt * 3.0);
                const t = parts.buildProgress;
                const c4 = (2 * Math.PI) / 3;
                const bs = t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
                group.scale.set(bs, bs, bs);
            }

            // Detect attack (cooldown reset)
            if (tower.cooldownRemaining > parts.lastCooldown) {
                parts.attackTimer = 0.15;
            }
            parts.lastCooldown = tower.cooldownRemaining;

            // Attack bump + recoil
            if (parts.buildProgress >= 1.0) {
                if (parts.attackTimer > 0) {
                    parts.attackTimer -= dt;
                    const t = Math.max(0, parts.attackTimer / 0.15); // 1→0
                    const bump = 1.0 + t * 0.12;
                    if (parts.turretGroup) {
                        parts.turretGroup.scale.set(bump, bump, bump);
                    } else {
                        group.scale.set(bump, bump, bump);
                    }
                    if (parts.recoilNode) {
                        parts.recoilNode.position.z = -(parts.recoilAmount ?? 0.08) * t;
                    }
                    if (parts.energyRingMaterial) {
                        parts.energyRingMaterial.emissiveIntensity = 0.3 + t * 0.75;
                    }
                } else {
                    if (parts.turretGroup) parts.turretGroup.scale.set(1, 1, 1);
                    if (parts.recoilNode) parts.recoilNode.position.z = 0;
                    group.scale.set(1, 1, 1);
                    if (parts.energyRingMaterial) {
                        parts.energyRingMaterial.emissiveIntensity = 0.22 + Math.sin(time * 2.5) * 0.08;
                    }
                }
            }

            // Turret aiming
            let targetAngle: number | null = null;
            if (tower.targetId !== null && tower.targetId !== undefined) {
                const target = state.enemies.find(e => e.id === tower.targetId);
                if (target) {
                    const dx = target.worldX - tower.worldX;
                    const dz = target.worldZ - tower.worldZ;
                    if (dx !== 0 || dz !== 0) targetAngle = Math.atan2(dx, dz);
                }
            }
            if (targetAngle === null && tower.aimAngle !== undefined) {
                targetAngle = tower.aimAngle;
            }
            if (targetAngle !== null && parts.turretGroup) {
                let diff = targetAngle - parts.turretGroup.rotation.y;
                diff = Math.atan2(Math.sin(diff), Math.cos(diff));
                parts.turretGroup.rotation.y += diff * 10 * dt;
            }

            // ─── Generic idle animation channels ───
            if (parts.spin) {
                for (const s of parts.spin) s.node.rotation[s.axis] += dt * s.speed;
            }
            if (parts.bob) {
                for (const b of parts.bob) {
                    b.node.position.y = b.baseY + Math.sin(time * b.speed + b.phase) * b.amp;
                }
            }
            if (parts.pulseScale) {
                for (const p of parts.pulseScale) {
                    const s = p.base + Math.sin(time * p.speed + p.phase) * p.amp;
                    if (p.yOnly) p.node.scale.y = s;
                    else p.node.scale.set(s, s, s);
                }
            }
            if (parts.pulseEmissive) {
                for (const p of parts.pulseEmissive) {
                    p.mat.emissiveIntensity = p.base + Math.sin(time * p.speed + p.phase) * p.amp;
                }
            }
            if (parts.orbit) {
                for (const o of parts.orbit) o.pivot.rotation.y += dt * o.speed;
            }
            if (parts.rise) {
                for (const r of parts.rise) {
                    const cycle = (time * r.speed + r.phase) % 1;
                    r.node.position.y = r.baseY + cycle * r.height;
                    const fade = 1 - cycle;
                    r.node.scale.setScalar(0.4 + fade * 0.6);
                }
            }
            // Plasma arcs (lightning) — re-jitter a few times per second
            if (parts.arcs && parts.arcOrigin) {
                parts.arcTimer = (parts.arcTimer ?? 0) - dt;
                if (parts.arcTimer <= 0) {
                    parts.arcTimer = 0.06;
                    for (const arc of parts.arcs) {
                        const posAttr = (arc.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
                        const o = parts.arcOrigin;
                        const theta = Math.random() * Math.PI * 2;
                        const reach = 0.22 + Math.random() * 0.16;
                        const ex = o.x + Math.cos(theta) * reach;
                        const ey = o.y - 0.1 - Math.random() * 0.25;
                        const ez = o.z + Math.sin(theta) * reach;
                        const n = posAttr.count;
                        for (let i = 0; i < n; i++) {
                            const f = i / (n - 1);
                            const jx = (Math.random() - 0.5) * 0.08 * (i > 0 && i < n - 1 ? 1 : 0);
                            const jy = (Math.random() - 0.5) * 0.08 * (i > 0 && i < n - 1 ? 1 : 0);
                            posAttr.setXYZ(
                                i,
                                o.x + (ex - o.x) * f + jx,
                                o.y + (ey - o.y) * f + jy,
                                o.z + (ez - o.z) * f + jx
                            );
                        }
                        posAttr.needsUpdate = true;
                        arc.visible = Math.random() > 0.25;
                    }
                }
            }
        }
    }

    showRange(tower: Tower, range: number): void {
        if (!this.rangeRing) {
            this.rangeRing = new THREE.Group();

            const outer = new THREE.Mesh(
                new THREE.RingGeometry(0.92, 1.0, 64),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.16,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                })
            );
            outer.rotation.x = -Math.PI / 2;

            const inner = new THREE.Mesh(
                new THREE.RingGeometry(0.6, 0.66, 64),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.08,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                })
            );
            inner.rotation.x = -Math.PI / 2;

            const pulse = new THREE.Mesh(
                new THREE.CircleGeometry(0.98, 48),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.04,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                })
            );
            pulse.rotation.x = -Math.PI / 2;
            pulse.position.y = -0.002;
            this.rangeRing.add(outer, inner, pulse);
            this.rangeRing.userData = { outer, inner, pulse };
            this.scene.add(this.rangeRing);
        }

        const rangeColor = ACCENT_COLORS[tower.type] ?? 0xffffff;
        const userData = this.rangeRing.userData as {
            outer: THREE.Mesh;
            inner: THREE.Mesh;
            pulse: THREE.Mesh;
        };
        (userData.outer.material as THREE.MeshBasicMaterial).color.setHex(rangeColor);
        (userData.inner.material as THREE.MeshBasicMaterial).color.setHex(rangeColor);
        (userData.pulse.material as THREE.MeshBasicMaterial).color.setHex(rangeColor);

        const pulseScale = 1 + Math.sin(this.time * 3.2) * 0.06;
        userData.pulse.scale.setScalar(pulseScale);
        userData.pulse.position.y = 0.002;
        this.rangeRing.scale.set(range, range, 1);
        this.rangeRing.position.set(tower.worldX, SURFACE_Y + 0.003, tower.worldZ);
        this.rangeRing.visible = true;
    }

    hideRange(): void {
        if (this.rangeRing) this.rangeRing.visible = false;
    }

    /**
     * 量度用：一座塔喺場上實際幾高、有幾多件、身上用咗邊幾隻識別色。
     *
     * 「升一級疊多一節」係一句視覺承諾，而佢量得到。至於「七種塔分得開」，
     * 用像素去量係量錯嘢——塔喺畫面上得幾十 px，剪個框出嚟九成係草同陰影
     * （試過兩版都係讀返草色）。真正要問嘅係 `染色()` 有冇落到色，
     * 而嗰個喺場景圖度讀得到，唔受燈同背景影響。
     */
    measure(id: number): { 高: number; 底: number; 頂: number; 佔格: [number, number]; 件: number; 色: string[]; 轉塔: boolean } | null {
        const g = this.meshes.get(id);
        if (!g) return null;
        const box = new THREE.Box3().setFromObject(g);
        let 件 = 0;
        const 色 = new Set<string>();
        g.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            件 += 1;
            for (const mm of (Array.isArray(m.material) ? m.material : [m.material])) {
                const mat = mm as THREE.MeshStandardMaterial;
                if (mat?.color && 主色名.has(mat.name)) 色.add('#' + mat.color.getHexString());
            }
        });
        return {
            高: +(box.max.y - box.min.y).toFixed(3),
            底: +box.min.y.toFixed(3),
            頂: +box.max.y.toFixed(3),
            佔格: [+(box.max.x - box.min.x).toFixed(3), +(box.max.z - box.min.z).toFixed(3)],
            件,
            色: [...色].sort(),
            轉塔: !!(g.userData as TowerParts).turretGroup,
        };
    }

    // ─── 起塔：疊件，唔再砌幾何 ────────────────────────────────────────────
    //
    // 呢度本來係五百幾行程序幾何——圓柱、圓錐、十二面體，一種塔一隻手寫嘅
    // 建構函數。而家用返 Kenney 嗰套模組化塔件：`base → bottom → middle →
    // top`，每節啱啱好 0.5 高（量過，`tests/assets.mjs` 守住），所以**升一級
    // 就係疊多一節**——同遊戲本身嘅三級制係同一個結構，唔使另外編一套視覺規則。
    //
    // 七種塔對四個武器頭：分唔開嗰幾種靠**塔身形狀**（圓／方）、**頂蓋款式**
    // （A/B/C）同**顏色**分。顏色沿用本來每種塔嗰兩隻色，所以 HUD、子彈、特效
    // 同塔身仍然係同一套色。

    private createTowerMesh(tower: Tower): THREE.Group {
        const group = new THREE.Group();
        const pos = cellToWorld(tower.col, tower.row);
        group.position.set(pos.x, SURFACE_Y, pos.z);
        group.name = `tower:${tower.id}:${tower.type}`;

        // group 留返 1:1 畀 build pop／攻擊 bump；模型自己收窄 XZ。咁動畫唔會
        // 每幀覆蓋個比例，而且射程、瞄準同邏輯 world position 完全唔變。
        const visual = new THREE.Group();
        visual.name = 'tower-visual';
        visual.scale.set(TOWER_VISUAL_SCALE_XZ, 1, TOWER_VISUAL_SCALE_XZ);
        group.add(visual);

        const parts = group.userData as TowerParts;
        parts.buildProgress = 0;
        parts.lastCooldown = 0;
        parts.attackTimer = 0;

        const 型 = TOWER_LOOK[tower.type] ?? TOWER_LOOK.arrow;
        const 主 = new THREE.Color(TOWER_COLORS[tower.type] ?? TOWER_COLORS.arrow);
        const 亮 = new THREE.Color(ACCENT_COLORS[tower.type] ?? ACCENT_COLORS.arrow);

        // 底座永遠有；跟住每一級疊多一節。進化型 gameplay level 會重置為 0，
        // 但建築唔應該突然由三層塌返一層，所以視覺保留完整三級塔身。
        const 節 = ['bottom', 'middle', 'top'] as const;
        const 疊 = ['towers/towerRound_base.glb'];
        for (let i = 0; i <= towerVisualLevel(tower.type, tower.level); i += 1) {
            疊.push(`towers/${型.家}_${節[i]}${型.款}.glb`);
        }

        let y = 0;
        for (const rel of 疊) {
            const piece = 取同步(rel);
            // Some modular floors have an off-centre authored pivot. Normalise each
            // floor before stacking or the whole tower leans into the next cell.
            中心XZ(piece);
            piece.position.y = y;
            染色(piece, 主, 亮);
            visual.add(piece);
            y += rel.includes('_base') ? 0.21 : 0.5;
        }

        // 頂上嘅嘢會轉去瞄準，所以要自己一個 group（animate() 靠呢個）。
        const turret = new THREE.Group();
        turret.position.y = y;
        visual.add(turret);

        if (型.武器) {
            turret.name = 'aiming-turret';
            parts.turretGroup = turret;
            // **有武器嘅塔唔戴屋頂。** 呢啲屋頂高 0.93–1.18（量過），而武器得
            // 0.19–0.63 高——擺埋一齊武器就成件埋咗入屋頂入面，睇唔到佢瞄邊度。
            // 塔頂本來就係開嘅雉堞，武器企喺上面先至係 kit 原本嘅用法。
            const w = 取同步(`towers/weapon_${型.武器}.glb`);
            w.name = 'weapon-model';
            w.scale.setScalar(型.武器大細 ?? 1);
            // Kenney weapons point along local -Z, while our aiming maths defines +Z
            // as forward. Rotate the asset once so the muzzle and recoil face correctly.
            w.rotation.y = Math.PI;
            染色(w, 亮, 主);
            const recoil = new THREE.Group();   // 後座力推嘅係武器，唔係成座塔
            recoil.add(w);
            turret.add(recoil);
            parts.recoilNode = recoil;
            parts.recoilAmount = 0.09;
        } else {
            turret.name = 'fixed-crown';
            // 冰同毒冇合適嘅武器頭（kit 得四個），改用屋頂＋水晶——順便令佢哋
            // 個剪影同其餘五種一眼分得開。
            const roof = 取同步(`towers/${型.家}_roof${型.款}.glb`);
            // Footprint was only oversized because the whole square roof used to aim
            // and turn 45 degrees. Keep XZ natural, only shorten its excessive height.
            roof.scale.set(1, 0.58, 1);
            中心XZ(roof);
            染色(roof, 主, 亮);
            turret.add(roof);

            // 水晶要企喺屋頂頂——高度由 bounding box 量，唔好逐個型號寫死。
            const 頂高 = new THREE.Box3().setFromObject(roof).max.y;
            const c = 取同步('towers/towerRound_crystals.glb');
            c.position.y = 頂高 + 0.06;
            c.scale.setScalar(0.35);
            中心XZ(c);
            染色(c, 亮, 亮);
            turret.add(c);
            parts.spin = [{ node: c, axis: 'y', speed: 0.7 }];
        }

        return group;
    }
}

/** 每種塔用邊個塔身、邊個款、邊個武器頭。 */
const TOWER_LOOK: Record<string, { 家: 'towerRound' | 'towerSquare'; 款: 'A' | 'B' | 'C'; 武器?: string; 武器大細?: number }> = {
    arrow:           { 家: 'towerRound',  款: 'A', 武器: 'ballista' },
    arrow_rapid:     { 家: 'towerRound',  款: 'B', 武器: 'ballista', 武器大細: 0.85 },
    arrow_pierce:    { 家: 'towerRound',  款: 'C', 武器: 'ballista', 武器大細: 1.15 },
    cannon:          { 家: 'towerSquare', 款: 'A', 武器: 'cannon' },
    cannon_siege:    { 家: 'towerSquare', 款: 'C', 武器: 'cannon', 武器大細: 1.2 },
    ice:             { 家: 'towerRound',  款: 'B' },
    ice_glacier:     { 家: 'towerRound',  款: 'C' },
    fire:            { 家: 'towerSquare', 款: 'B', 武器: 'catapult' },
    fire_inferno:    { 家: 'towerSquare', 款: 'C', 武器: 'catapult', 武器大細: 1.15 },
    lightning:       { 家: 'towerRound',  款: 'C', 武器: 'blaster' },
    lightning_storm: { 家: 'towerRound',  款: 'A', 武器: 'blaster', 武器大細: 1.15 },
    poison:          { 家: 'towerSquare', 款: 'B' },
    poison_plague:   { 家: 'towerSquare', 款: 'A' },
    sniper:          { 家: 'towerSquare', 款: 'C', 武器: 'blaster', 武器大細: 1.3 },
    sniper_railgun:  { 家: 'towerSquare', 款: 'B', 武器: 'blaster', 武器大細: 1.45 },
};

// 呢批模型入面實際有嘅材質名（由 .glb 數出嚟）：stone、stoneDark、red、purple、
// wood、crystal。`red`／`purple` 係頂蓋同旗嗰啲——**俯視角度下佢哋先至係最大幅
// 嘅有色面**，所以佢哋食該種塔嘅主色；石身留返石色（成排塔先似同一座城），
// 木同水晶食亮色。
const 主色名 = new Set(['red', 'purple']);
const 亮色名 = new Set(['wood', 'crystal']);

/** Kenney modular pieces do not all share a centred pivot; normalise before stacking. */
function 中心XZ(root: THREE.Object3D): void {
    root.updateWorldMatrix(true, true);
    const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
}

/**
 * 上色。
 *
 * `clone(true)` 預設係**共用 material**——一改就成場所有塔一齊變色，所以改之前
 * 要 clone 一份材質出嚟。代價係幾十份材質，換返成場塔分得清，抵。
 */
function 染色(root: THREE.Object3D, 主: THREE.Color, 副: THREE.Color): void {
    root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const 舊 = Array.isArray(m.material) ? m.material : [m.material];
        const 新 = 舊.map((mm) => {
            const mat = mm as THREE.MeshStandardMaterial;
            const 主之 = 主色名.has(mat.name), 亮之 = 亮色名.has(mat.name);
            if (!主之 && !亮之) return mat;
            const c = mat.clone();
            c.color.copy(主之 ? 主 : 副);
            if (mat.name === 'purple') c.color.multiplyScalar(0.68);   // 深色嗰件留返深
            return c;
        });
        m.material = Array.isArray(m.material) ? 新 : 新[0];
    });
}
