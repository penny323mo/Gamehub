import * as THREE from 'three';
import type { GameState, Tower } from '../core/types';
import { GRAPHICS } from '../core/config';
import { cellToWorld } from '../core/path';

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
};

// Segment counts scale down on mobile
const SEG_HI = GRAPHICS.isMobile ? 8 : 16;
const SEG_MID = GRAPHICS.isMobile ? 6 : 12;
const SEG_LO = GRAPHICS.isMobile ? 5 : 8;

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
        this.rangeRing.position.set(tower.worldX, 0.03, tower.worldZ);
        this.rangeRing.visible = true;
    }

    hideRange(): void {
        if (this.rangeRing) this.rangeRing.visible = false;
    }

    // ─── Model construction ─────────────────────────────────────────────────

    private createTowerMesh(tower: Tower): THREE.Group {
        const group = new THREE.Group();
        const pos = cellToWorld(tower.col, tower.row);
        group.position.set(pos.x, 0, pos.z);

        const parts = group.userData as TowerParts;
        parts.spin = [];
        parts.bob = [];
        parts.pulseScale = [];
        parts.pulseEmissive = [];
        parts.orbit = [];
        parts.rise = [];

        const baseColor = TOWER_COLORS[tower.type];
        const accentColor = ACCENT_COLORS[tower.type];
        const scale = 1 + tower.level * 0.15;

        // Soft contact shadow
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(0.48 * scale, 24),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
                depthWrite: false,
            })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.008;
        group.add(shadow);

        // Stone plinth base (shared architecture across all towers)
        this.buildStoneBase(group, parts, scale, baseColor, accentColor);

        // Rotating head
        const turret = new THREE.Group();
        turret.position.y = 0;
        group.add(turret);
        parts.turretGroup = turret;

        switch (tower.type) {
            case 'arrow':
            case 'arrow_rapid':
            case 'arrow_pierce':
                this.buildBallista(turret, parts, scale, tower.type, accentColor);
                break;
            case 'cannon':
                this.buildCannon(group, turret, parts, scale, accentColor);
                break;
            case 'ice':
                this.buildIceSpire(group, turret, parts, scale, accentColor);
                break;
            case 'fire':
                this.buildFireBrazier(turret, parts, scale);
                break;
            case 'lightning':
                this.buildTeslaCoil(turret, parts, scale, accentColor);
                break;
            case 'poison':
                this.buildAlchemyStill(turret, parts, scale);
                break;
            case 'sniper':
                this.buildRailgunNest(group, turret, parts, scale, accentColor);
                break;
        }

        parts.lastCooldown = tower.cooldownRemaining;
        parts.attackTimer = 0;
        parts.buildProgress = parts.buildProgress ?? 0;

        // Level gems floating around the front rim of the base
        const gemGeo = new THREE.OctahedronGeometry(0.045);
        for (let i = 0; i <= tower.level; i++) {
            const gem = new THREE.Mesh(gemGeo, mat({
                color: 0xffd76a,
                emissive: 0xcc9a2a,
                emissiveIntensity: 0.8,
                metalness: 0.6,
                roughness: 0.25,
            }));
            const a = (-0.35 + i * 0.35);
            gem.position.set(Math.sin(a) * 0.42 * scale, 0.34, Math.cos(a) * 0.42 * scale);
            group.add(gem);
            parts.spin!.push({ node: gem, speed: 2.2, axis: 'y' });
            parts.bob!.push({ node: gem, baseY: 0.34, amp: 0.025, speed: 3, phase: i * 1.3 });
        }

        return group;
    }

    /** Octagonal stepped stone plinth with corner buttresses + glowing rune ring. */
    private buildStoneBase(group: THREE.Group, parts: TowerParts, scale: number, baseColor: number, accentColor: number): void {
        const stone = mat({ color: 0x6a6f78, roughness: 0.92, metalness: 0.05, flatShading: true });
        const stoneDark = mat({ color: 0x4b5058, roughness: 0.95, metalness: 0.04, flatShading: true });

        // Two stepped octagonal slabs
        addMesh(group, new THREE.CylinderGeometry(0.42 * scale, 0.46 * scale, 0.1, 8), stoneDark, 0, 0.05, 0);
        addMesh(group, new THREE.CylinderGeometry(0.34 * scale, 0.4 * scale, 0.12, 8), stone, 0, 0.16, 0);

        // Corner buttress blocks
        const buttressGeo = new THREE.BoxGeometry(0.1 * scale, 0.18, 0.1 * scale);
        for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + Math.PI / 4;
            const b = addMesh(group, buttressGeo, stoneDark, Math.cos(a) * 0.38 * scale, 0.13, Math.sin(a) * 0.38 * scale);
            b.rotation.y = -a;
        }

        // Tinted collar in the tower's colour
        addMesh(group, new THREE.CylinderGeometry(0.28 * scale, 0.32 * scale, 0.08, 8),
            mat({ color: baseColor, roughness: 0.6, metalness: 0.25 }), 0, 0.26, 0);

        // Glowing rune ring
        const energyRingMaterial = mat({
            color: accentColor,
            emissive: accentColor,
            emissiveIntensity: 0.22,
            transparent: true,
            opacity: 0.92,
            roughness: 0.35,
            metalness: 0.2,
        }) as THREE.MeshStandardMaterial;
        const energyRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.3 * scale, 0.025 * scale, 8, 32),
            energyRingMaterial
        );
        energyRing.rotation.x = Math.PI / 2;
        energyRing.position.y = 0.31;
        group.add(energyRing);
        parts.energyRingMaterial = energyRingMaterial;
    }

    /** Arrow family — timber watchtower with a detailed ballista on top. */
    private buildBallista(turret: THREE.Group, parts: TowerParts, scale: number, type: string, accentColor: number): void {
        const wood = mat({ color: 0x7a5230, roughness: 0.85 });
        const woodDark = mat({ color: 0x54371f, roughness: 0.9 });
        const iron = mat({ color: 0x3c3f45, roughness: 0.4, metalness: 0.75 });

        // Timber mast + cross-braced legs
        addMesh(turret, new THREE.CylinderGeometry(0.09 * scale, 0.13 * scale, 0.42, SEG_LO), wood, 0, 0.5, 0);
        const legGeo = new THREE.BoxGeometry(0.05 * scale, 0.4, 0.05 * scale);
        for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + Math.PI / 4;
            const leg = addMesh(turret, legGeo, woodDark, Math.cos(a) * 0.2 * scale, 0.46, Math.sin(a) * 0.2 * scale);
            leg.rotation.z = Math.cos(a) * 0.28;
            leg.rotation.x = -Math.sin(a) * 0.28;
        }

        // Platform deck + rim
        addMesh(turret, new THREE.CylinderGeometry(0.26 * scale, 0.26 * scale, 0.045, 8), wood, 0, 0.7, 0);
        addMesh(turret, new THREE.TorusGeometry(0.25 * scale, 0.018 * scale, 6, 16),
            woodDark, 0, 0.73, 0).rotation.x = Math.PI / 2;

        // Ballista assembly (recoil node so the whole weapon kicks back)
        const weapon = new THREE.Group();
        weapon.position.y = 0.78;
        turret.add(weapon);
        parts.recoilNode = weapon;
        parts.recoilAmount = 0.07;

        // Stock
        addMesh(weapon, new THREE.BoxGeometry(0.08 * scale, 0.07 * scale, 0.52 * scale), woodDark, 0, 0, -0.02);
        // Yoke plates
        addMesh(weapon, new THREE.BoxGeometry(0.03 * scale, 0.12 * scale, 0.2 * scale), iron, 0.055 * scale, -0.02, -0.1);
        addMesh(weapon, new THREE.BoxGeometry(0.03 * scale, 0.12 * scale, 0.2 * scale), iron, -0.055 * scale, -0.02, -0.1);

        const buildBowPair = (y: number, limbMat: THREE.Material, span: number): void => {
            // Curved limbs — swept-back angled arms with tips
            for (const side of [-1, 1]) {
                const limb = addMesh(weapon, new THREE.BoxGeometry(span * scale, 0.03 * scale, 0.05 * scale), limbMat, side * span * 0.5 * scale, y, 0.12 * scale);
                limb.rotation.y = side * 0.35;
                const tip = addMesh(weapon, new THREE.ConeGeometry(0.02 * scale, 0.08 * scale, 4), iron,
                    side * span * 0.92 * scale, y, 0.12 * scale - Math.abs(side) * span * 0.32 * scale);
                tip.rotation.z = side * Math.PI / 2;
            }
            // String
            const stringMesh = addMesh(weapon, new THREE.CylinderGeometry(0.006, 0.006, span * 1.9 * scale, 3),
                mat({ color: 0xd9cfa8, roughness: 0.6 }), 0, y, 0.12 * scale - span * 0.3 * scale, true);
            stringMesh.rotation.z = Math.PI / 2;
        };

        const limbMat = type === 'arrow_pierce' ? iron : mat({ color: accentColor, roughness: 0.55, metalness: 0.3 });
        buildBowPair(0.02, limbMat, 0.3);
        if (type === 'arrow_rapid') buildBowPair(0.09, limbMat, 0.26);
        if (type === 'arrow_pierce') {
            // Heavy reinforced receiver
            addMesh(weapon, new THREE.BoxGeometry(0.14 * scale, 0.08 * scale, 0.3 * scale), iron, 0, -0.005, -0.08);
        }

        // Loaded bolt
        let boltColor = 0xcccccc;
        if (type === 'arrow_rapid') boltColor = 0xffffff;
        if (type === 'arrow_pierce') boltColor = 0x8888ff;
        const boltMat = mat({ color: boltColor, metalness: 0.5, roughness: 0.4, emissive: boltColor, emissiveIntensity: 0.12 });
        const bolt = addMesh(weapon, new THREE.CylinderGeometry(0.012, 0.012, 0.4 * scale, 4), boltMat, 0, 0.045, 0.06, true);
        bolt.rotation.x = Math.PI / 2;
        const boltHead = addMesh(weapon, new THREE.ConeGeometry(0.035, 0.09, 4), boltMat, 0, 0.045, 0.28 * scale, true);
        boltHead.rotation.x = Math.PI / 2;

        // Quiver with arrows on the deck
        const quiver = new THREE.Group();
        quiver.position.set(0.19 * scale, 0.72, -0.14 * scale);
        quiver.rotation.z = -0.18;
        turret.add(quiver);
        addMesh(quiver, new THREE.CylinderGeometry(0.05 * scale, 0.04 * scale, 0.16, SEG_LO), woodDark, 0, 0.06, 0);
        for (let i = 0; i < 3; i++) {
            const fletch = addMesh(quiver, new THREE.ConeGeometry(0.018, 0.05, 4),
                mat({ color: [0xcc4444, 0x44aa66, 0xd9cfa8][i], roughness: 0.7 }),
                (i - 1) * 0.025, 0.19 + (i % 2) * 0.02, 0, true);
            fletch.rotation.x = Math.PI;
        }
    }

    /** Cannon — riveted armored dome with recoiling barrel + ammo pile. */
    private buildCannon(group: THREE.Group, turret: THREE.Group, parts: TowerParts, scale: number, accentColor: number): void {
        const armor = mat({ color: accentColor, metalness: 0.65, roughness: 0.38 });
        const armorDark = mat({ color: 0x2e3136, metalness: 0.8, roughness: 0.3 });
        const rivetMat = mat({ color: 0x15171a, metalness: 0.9, roughness: 0.35 });

        // Turret ring + dome
        addMesh(turret, new THREE.CylinderGeometry(0.27 * scale, 0.29 * scale, 0.1, SEG_MID), armorDark, 0, 0.36, 0);
        addMesh(turret, new THREE.SphereGeometry(0.26 * scale, SEG_MID, SEG_LO, 0, Math.PI * 2, 0, Math.PI / 2), armor, 0, 0.4, 0);

        // Rivets around the dome skirt
        const rivetGeo = new THREE.SphereGeometry(0.018 * scale, 5, 5);
        for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            addMesh(turret, rivetGeo, rivetMat, Math.cos(a) * 0.25 * scale, 0.42, Math.sin(a) * 0.25 * scale, true);
        }

        // Hatch on top
        addMesh(turret, new THREE.CylinderGeometry(0.07 * scale, 0.08 * scale, 0.04, SEG_LO), armorDark, 0.08 * scale, 0.63, -0.06 * scale);

        // Barrel assembly with recoil
        const barrelGroup = new THREE.Group();
        barrelGroup.position.set(0, 0.5, 0.05);
        barrelGroup.rotation.x = -Math.PI / 12;
        turret.add(barrelGroup);
        parts.recoilNode = barrelGroup;
        parts.recoilAmount = 0.12;

        const barrel = addMesh(barrelGroup, new THREE.CylinderGeometry(0.075 * scale, 0.1 * scale, 0.62 * scale, SEG_MID), armorDark, 0, 0, 0.28 * scale);
        barrel.rotation.x = Math.PI / 2;
        // Muzzle brake
        const brake = addMesh(barrelGroup, new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.1 * scale, SEG_MID), armor, 0, 0, 0.56 * scale);
        brake.rotation.x = Math.PI / 2;
        // Bore (dark inner disc)
        const bore = addMesh(barrelGroup, new THREE.CircleGeometry(0.06 * scale, SEG_LO),
            new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 0, 0.612 * scale, true);
        bore.rotation.y = 0;
        // Recoil pistons under barrel
        for (const side of [-1, 1]) {
            const piston = addMesh(barrelGroup, new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.3 * scale, 6), rivetMat, side * 0.09 * scale, -0.07 * scale, 0.1 * scale, true);
            piston.rotation.x = Math.PI / 2;
        }

        // Cannonball pile on the base (static, outside turret)
        const ballGeo = new THREE.SphereGeometry(0.055 * scale, SEG_LO, SEG_LO);
        const px = -0.3 * scale, pz = 0.26 * scale;
        addMesh(group, ballGeo, armorDark, px, 0.36, pz);
        addMesh(group, ballGeo, armorDark, px + 0.09 * scale, 0.36, pz - 0.03 * scale);
        addMesh(group, ballGeo, armorDark, px + 0.045 * scale, 0.44, pz - 0.015 * scale);
    }

    /** Ice — frost spire: crystal cluster + orbiting shards. */
    private buildIceSpire(group: THREE.Group, turret: THREE.Group, parts: TowerParts, scale: number, accentColor: number): void {
        const crystalMat = glassMat(accentColor);
        const frost = mat({ color: 0xd9f2ff, roughness: 0.4, metalness: 0.05, emissive: 0x5599cc, emissiveIntensity: 0.12 });

        // Frost-covered pedestal
        addMesh(group, new THREE.CylinderGeometry(0.2 * scale, 0.26 * scale, 0.16, 6), frost, 0, 0.38, 0);

        // Main crystal — tall stretched octahedron
        const main = new THREE.Mesh(new THREE.OctahedronGeometry(0.22 * scale), crystalMat);
        main.scale.set(0.8, 1.7, 0.8);
        main.position.y = 0.85;
        if (GRAPHICS.enableShadows) main.castShadow = true;
        turret.add(main);
        parts.spin!.push({ node: main, speed: 0.8, axis: 'y' });

        // Glowing core inside
        const core = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.09 * scale),
            mat({ color: 0xffffff, emissive: 0x88ccff, emissiveIntensity: 1.0 })
        );
        core.scale.set(0.8, 1.7, 0.8);
        main.add(core);
        parts.pulseEmissive!.push({ mat: core.material as THREE.MeshStandardMaterial, base: 0.9, amp: 0.35, speed: 2.2, phase: 0 });

        // Tilted side shards
        const shardGeo = new THREE.OctahedronGeometry(0.09 * scale);
        for (let i = 0; i < 4; i++) {
            const a = (i / 4) * Math.PI * 2 + 0.5;
            const shard = new THREE.Mesh(shardGeo, crystalMat);
            shard.position.set(Math.cos(a) * 0.17 * scale, 0.52, Math.sin(a) * 0.17 * scale);
            shard.scale.set(0.7, 1.5 + (i % 2) * 0.5, 0.7);
            shard.rotation.set(Math.sin(a) * 0.45, a, Math.cos(a) * 0.45);
            if (GRAPHICS.enableShadows) shard.castShadow = true;
            turret.add(shard);
        }

        // Orbiting ice shards
        if (!GRAPHICS.isMobile) {
            const pivot = new THREE.Group();
            pivot.position.y = 0.85;
            turret.add(pivot);
            for (let i = 0; i < 3; i++) {
                const a = (i / 3) * Math.PI * 2;
                const orbiter = new THREE.Mesh(new THREE.OctahedronGeometry(0.045 * scale), crystalMat);
                orbiter.position.set(Math.cos(a) * 0.34 * scale, Math.sin(a * 2) * 0.08, Math.sin(a) * 0.34 * scale);
                pivot.add(orbiter);
            }
            parts.orbit!.push({ pivot, speed: 1.6 });
        }
    }

    /** Fire — obsidian brazier with layered living flame + rising embers. */
    private buildFireBrazier(turret: THREE.Group, parts: TowerParts, scale: number): void {
        const obsidian = mat({ color: 0x1c1416, roughness: 0.35, metalness: 0.25, flatShading: true });
        const lava = mat({ color: 0xff4400, emissive: 0xff3300, emissiveIntensity: 0.85 });

        // Chalice bowl
        const bowlPts: THREE.Vector2[] = [];
        for (let i = 0; i <= 6; i++) {
            const t = i / 6;
            bowlPts.push(new THREE.Vector2((0.1 + Math.pow(t, 1.6) * 0.18) * scale, t * 0.3));
        }
        addMesh(turret, new THREE.LatheGeometry(bowlPts, SEG_LO), obsidian, 0, 0.32, 0);

        // Lava crack ring around the bowl lip
        const lavaRing = addMesh(turret, new THREE.TorusGeometry(0.24 * scale, 0.02 * scale, 6, SEG_MID), lava, 0, 0.6, 0, true);
        lavaRing.rotation.x = Math.PI / 2;
        parts.pulseEmissive!.push({ mat: lavaRing.material as THREE.MeshStandardMaterial, base: 0.85, amp: 0.35, speed: 6, phase: 0 });

        // Charred rim spikes
        const spikeGeo = new THREE.ConeGeometry(0.03 * scale, 0.1 * scale, 4);
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const spike = addMesh(turret, spikeGeo, obsidian, Math.cos(a) * 0.24 * scale, 0.65, Math.sin(a) * 0.24 * scale);
            spike.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35);
        }

        // Layered flame cones
        const flameOuter = new THREE.Mesh(
            new THREE.ConeGeometry(0.18 * scale, 0.55, SEG_LO),
            mat({ color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 })
        );
        flameOuter.position.y = 0.9;
        turret.add(flameOuter);
        const flameMid = new THREE.Mesh(
            new THREE.ConeGeometry(0.11 * scale, 0.42, SEG_LO),
            mat({ color: 0xff8800, emissive: 0xff7700, emissiveIntensity: 0.9, transparent: true, opacity: 0.92 })
        );
        flameMid.position.y = 0.88;
        turret.add(flameMid);
        const flameCore = new THREE.Mesh(
            new THREE.ConeGeometry(0.055 * scale, 0.28, SEG_LO),
            mat({ color: 0xffdd66, emissive: 0xffee88, emissiveIntensity: 1.2 })
        );
        flameCore.position.y = 0.84;
        turret.add(flameCore);

        parts.spin!.push({ node: flameOuter, speed: 1.5, axis: 'y' });
        parts.spin!.push({ node: flameMid, speed: -2.2, axis: 'y' });
        parts.pulseScale!.push({ node: flameOuter, base: 1.0, amp: 0.08, speed: 8, phase: 0 });
        parts.pulseScale!.push({ node: flameMid, base: 1.0, amp: 0.1, speed: 11, phase: 1.4 });
        parts.bob!.push({ node: flameCore, baseY: 0.84, amp: 0.03, speed: 9, phase: 0.6 });

        // Rising embers
        if (!GRAPHICS.isMobile) {
            const emberGeo = new THREE.SphereGeometry(0.02, 5, 5);
            for (let i = 0; i < 4; i++) {
                const ember = new THREE.Mesh(emberGeo, mat({
                    color: 0xffaa33, emissive: 0xff9922, emissiveIntensity: 1.1, transparent: true, opacity: 0.9,
                }));
                const a = (i / 4) * Math.PI * 2;
                ember.position.set(Math.cos(a) * 0.1 * scale, 0.9, Math.sin(a) * 0.1 * scale);
                turret.add(ember);
                parts.rise!.push({ node: ember, baseY: 0.85, height: 0.55, speed: 0.45 + i * 0.08, phase: i * 0.27 });
            }
        }
    }

    /** Lightning — proper tesla coil with winding, insulators and live plasma arcs. */
    private buildTeslaCoil(turret: THREE.Group, parts: TowerParts, scale: number, accentColor: number): void {
        const copper = mat({ color: 0xb0672d, metalness: 0.85, roughness: 0.3 });
        const darkMetal = mat({ color: 0x23252e, metalness: 0.8, roughness: 0.35 });
        const ceramic = mat({ color: 0xd8d4c8, roughness: 0.5 });

        // Insulator stack base
        addMesh(turret, new THREE.CylinderGeometry(0.16 * scale, 0.2 * scale, 0.08, SEG_LO), darkMetal, 0, 0.36, 0);
        for (let i = 0; i < 3; i++) {
            addMesh(turret, new THREE.CylinderGeometry((0.13 - i * 0.015) * scale, (0.14 - i * 0.015) * scale, 0.035, SEG_LO), ceramic, 0, 0.44 + i * 0.05, 0);
        }

        // Coil column with copper winding rings
        addMesh(turret, new THREE.CylinderGeometry(0.07 * scale, 0.1 * scale, 0.42 * scale, SEG_LO), darkMetal, 0, 0.76, 0);
        for (let r = 0; r < 6; r++) {
            const ring = addMesh(turret, new THREE.TorusGeometry((0.085 + (5 - r) * 0.004) * scale, 0.014 * scale, 5, SEG_MID), copper, 0, 0.6 + r * 0.065, 0, true);
            ring.rotation.x = Math.PI / 2;
        }

        // Toroid electrode + emitter sphere
        const toroid = addMesh(turret, new THREE.TorusGeometry(0.13 * scale, 0.045 * scale, 8, SEG_HI),
            mat({ color: 0xcfd6dd, metalness: 0.95, roughness: 0.15 }), 0, 1.02, 0);
        toroid.rotation.x = Math.PI / 2;

        const emitterMat = mat({ color: accentColor, emissive: 0xffee55, emissiveIntensity: 0.9 }) as THREE.MeshStandardMaterial;
        const emitter = addMesh(turret, new THREE.SphereGeometry(0.07 * scale, SEG_MID, SEG_LO), emitterMat, 0, 1.02, 0, true);
        parts.pulseEmissive!.push({ mat: emitterMat, base: 0.9, amp: 0.45, speed: 7, phase: 0 });
        parts.bob!.push({ node: emitter, baseY: 1.02, amp: 0.02, speed: 5, phase: 0 });

        // Wireframe energy cage
        const cage = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.17 * scale),
            new THREE.MeshBasicMaterial({ color: 0xfff9a8, wireframe: true, transparent: true, opacity: 0.5 })
        );
        cage.position.y = 1.02;
        turret.add(cage);
        parts.spin!.push({ node: cage, speed: 2.0, axis: 'y' });

        // Live plasma arcs
        if (!GRAPHICS.isMobile) {
            parts.arcs = [];
            parts.arcOrigin = new THREE.Vector3(0, 1.02, 0);
            const arcMat = new THREE.LineBasicMaterial({ color: 0xccf2ff, transparent: true, opacity: 0.85 });
            for (let i = 0; i < 3; i++) {
                const geo = new THREE.BufferGeometry();
                geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(5 * 3), 3));
                const arc = new THREE.Line(geo, arcMat);
                arc.frustumCulled = false;
                turret.add(arc);
                parts.arcs.push(arc);
            }
        }
    }

    /** Poison — alchemist's still: cauldron, glass retort, copper piping, rising bubbles. */
    private buildAlchemyStill(turret: THREE.Group, parts: TowerParts, scale: number): void {
        const ironPot = mat({ color: 0x2c3130, metalness: 0.55, roughness: 0.5, flatShading: true });
        const copper = mat({ color: 0x9c5a28, metalness: 0.8, roughness: 0.35 });
        const toxinMat = mat({ color: 0x39d411, emissive: 0x2bb400, emissiveIntensity: 0.5, transparent: true, opacity: 0.9 }) as THREE.MeshStandardMaterial;

        // Cauldron
        const potPts: THREE.Vector2[] = [];
        for (let i = 0; i <= 7; i++) {
            const t = i / 7;
            potPts.push(new THREE.Vector2(Math.sin(t * Math.PI * 0.82) * 0.24 * scale + 0.02, t * 0.3));
        }
        addMesh(turret, new THREE.LatheGeometry(potPts, SEG_MID), ironPot, 0, 0.32, 0);
        // Rim
        const rim = addMesh(turret, new THREE.TorusGeometry(0.185 * scale, 0.022 * scale, 6, SEG_MID), ironPot, 0, 0.62, 0);
        rim.rotation.x = Math.PI / 2;
        // Toxic liquid surface
        const liquid = addMesh(turret, new THREE.CylinderGeometry(0.17 * scale, 0.17 * scale, 0.03, SEG_MID), toxinMat, 0, 0.6, 0, true);
        parts.pulseEmissive!.push({ mat: toxinMat, base: 0.5, amp: 0.25, speed: 3, phase: 0 });
        parts.pulseScale!.push({ node: liquid, base: 1.0, amp: 0.03, speed: 3.4, phase: 1 });

        // Glass retort flask above, held by a copper stand
        addMesh(turret, new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, 0.5, 5), copper, 0.16 * scale, 0.62, 0);
        const retort = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, SEG_MID, SEG_MID), glassMat(0xbfffb0));
        retort.position.set(0, 0.95, 0);
        turret.add(retort);
        parts.bob!.push({ node: retort, baseY: 0.95, amp: 0.02, speed: 2.4, phase: 0.4 });
        // Toxin swirling inside the retort
        const swirl = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, SEG_LO, SEG_LO), toxinMat);
        retort.add(swirl);
        parts.pulseScale!.push({ node: swirl, base: 1.0, amp: 0.12, speed: 4, phase: 2 });

        // Copper pipe from retort down to cauldron
        const pipe = addMesh(turret, new THREE.TorusGeometry(0.14 * scale, 0.018 * scale, 5, SEG_MID, Math.PI * 0.9), copper, 0.1 * scale, 0.8, 0);
        pipe.rotation.z = -0.5;

        // Bubbles rising from the cauldron
        const bubbleCount = GRAPHICS.isMobile ? 2 : 4;
        const bubbleGeo = new THREE.SphereGeometry(0.025, 6, 6);
        for (let i = 0; i < bubbleCount; i++) {
            const bubble = new THREE.Mesh(bubbleGeo, toxinMat);
            const a = (i / bubbleCount) * Math.PI * 2;
            bubble.position.set(Math.cos(a) * 0.08 * scale, 0.62, Math.sin(a) * 0.08 * scale);
            turret.add(bubble);
            parts.rise!.push({ node: bubble, baseY: 0.62, height: 0.4, speed: 0.35 + i * 0.09, phase: i * 0.31 });
        }
    }

    /** Sniper — elevated railgun nest with charged rails and glowing optics. */
    private buildRailgunNest(group: THREE.Group, turret: THREE.Group, parts: TowerParts, scale: number, accentColor: number): void {
        const gunmetal = mat({ color: 0x2a2d3a, metalness: 0.8, roughness: 0.3 });
        const alloy = mat({ color: accentColor, metalness: 0.7, roughness: 0.35 });
        const railGlowMat = mat({ color: 0x7f9dff, emissive: 0x5f80ff, emissiveIntensity: 0.7 }) as THREE.MeshStandardMaterial;

        // Tripod legs (static, on the base)
        for (let i = 0; i < 3; i++) {
            const a = i * Math.PI * 2 / 3;
            const leg = addMesh(group, new THREE.CylinderGeometry(0.022 * scale, 0.028 * scale, 0.62 * scale, 5), gunmetal,
                Math.cos(a) * 0.17, 0.58, Math.sin(a) * 0.17);
            leg.rotation.x = -Math.sin(a) * 0.3;
            leg.rotation.z = Math.cos(a) * 0.3;
            // Foot pads
            addMesh(group, new THREE.CylinderGeometry(0.04 * scale, 0.05 * scale, 0.03, 6), gunmetal,
                Math.cos(a) * 0.26, 0.31, Math.sin(a) * 0.26);
        }
        // Gimbal hub
        addMesh(group, new THREE.SphereGeometry(0.09 * scale, SEG_LO, SEG_LO), gunmetal, 0, 0.88, 0);

        // Weapon body on the rotating turret with recoil
        const weapon = new THREE.Group();
        weapon.position.y = 0.9;
        turret.add(weapon);
        parts.recoilNode = weapon;
        parts.recoilAmount = 0.14;

        // Receiver
        addMesh(weapon, new THREE.BoxGeometry(0.12 * scale, 0.14 * scale, 0.34 * scale), alloy, 0, 0.02, -0.05);
        // Stock / counterweight
        addMesh(weapon, new THREE.BoxGeometry(0.09 * scale, 0.1 * scale, 0.14 * scale), gunmetal, 0, 0, -0.28 * scale);

        // Twin rails with glowing accelerator strip between them
        const railGeo = new THREE.BoxGeometry(0.025 * scale, 0.05 * scale, 0.85 * scale);
        addMesh(weapon, railGeo, gunmetal, 0.032 * scale, 0.02, 0.45 * scale);
        addMesh(weapon, railGeo, gunmetal, -0.032 * scale, 0.02, 0.45 * scale);
        addMesh(weapon, new THREE.BoxGeometry(0.02 * scale, 0.02 * scale, 0.8 * scale), railGlowMat, 0, 0.02, 0.44 * scale, true);
        parts.pulseEmissive!.push({ mat: railGlowMat, base: 0.65, amp: 0.35, speed: 4.5, phase: 0 });
        // Muzzle housing
        addMesh(weapon, new THREE.BoxGeometry(0.09 * scale, 0.09 * scale, 0.07 * scale), alloy, 0, 0.02, 0.86 * scale);

        // Scope with glowing lens
        const scope = new THREE.Group();
        scope.position.set(0, 0.13, -0.02);
        weapon.add(scope);
        const scopeBody = addMesh(scope, new THREE.CylinderGeometry(0.035 * scale, 0.035 * scale, 0.24 * scale, SEG_LO), gunmetal, 0, 0, 0);
        scopeBody.rotation.x = Math.PI / 2;
        const lensMat = mat({ color: 0xff4d4d, emissive: 0xff2222, emissiveIntensity: 0.9 }) as THREE.MeshStandardMaterial;
        const lens = addMesh(scope, new THREE.CircleGeometry(0.028 * scale, SEG_LO), lensMat, 0, 0, 0.125 * scale, true);
        lens.rotation.y = 0;
        parts.pulseEmissive!.push({ mat: lensMat, base: 0.8, amp: 0.4, speed: 2.2, phase: 1 });
        parts.bob!.push({ node: scope, baseY: 0.13, amp: 0.008, speed: 2, phase: 0 });

        // Side capacitor cells
        for (const side of [-1, 1]) {
            const cellMat = mat({ color: 0x3648b8, emissive: 0x2233aa, emissiveIntensity: 0.35 }) as THREE.MeshStandardMaterial;
            addMesh(weapon, new THREE.BoxGeometry(0.035 * scale, 0.08 * scale, 0.12 * scale), cellMat, side * 0.085 * scale, 0.01, -0.16 * scale, true);
        }
    }
}
