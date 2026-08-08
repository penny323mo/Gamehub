import * as THREE from 'three';
import type { GameState, EnemyType, Enemy } from '../core/types';
import { GRAPHICS } from '../core/config';
import { 取同步 } from './assets';

/**
 * Per-part animation output — offsets are applied on top of the part's static
 * offset/rotation, `s` is a uniform scale multiplier.
 */
interface AnimResult {
    ox: number; oy: number; oz: number;
    rx: number; ry: number; rz: number;
    s: number;
}

type AnimFn = (out: AnimResult, time: number, phase: number) => void;

interface EnemyPartDef {
    geo: THREE.BufferGeometry;
    mat: THREE.Material;
    offset: THREE.Vector3;
    rotation?: THREE.Euler;
    scale?: THREE.Vector3;
    /** Decorative part — skipped on mobile to save draw calls. */
    desktopOnly?: boolean;
    anim?: AnimFn;
}

// ─── Reusable anim helpers ───────────────────────────────────────────────────
const walkBob = (amp: number, speed = 10): AnimFn => (out, t, ph) => {
    out.oy += Math.abs(Math.sin(t * speed + ph)) * amp;
};
const hover = (amp: number, speed: number): AnimFn => (out, t, ph) => {
    out.oy += Math.sin(t * speed + ph) * amp;
};
/** Limb swing around its pivot (rotation.x), forward/back relative to facing. */
const swing = (speed: number, amp: number, offset = 0, bobAmp = 0, bobSpeed = 10): AnimFn => (out, t, ph) => {
    out.rx += Math.sin(t * speed + ph + offset) * amp;
    if (bobAmp > 0) out.oy += Math.abs(Math.sin(t * bobSpeed + ph)) * bobAmp;
};

/**
 * Capsule limb whose pivot sits at the top (hip/shoulder joint) so a
 * rotation.x swing reads as a walking limb, not a spinning stick.
 */
function limbGeo(r: number, len: number): THREE.BufferGeometry {
    const g = new THREE.CapsuleGeometry(r, len, 3, 6);
    g.translate(0, -len / 2, 0);
    return g;
}

/** Per-type display metadata: HP-bar height & ground shadow size. */
export const ENEMY_META: Record<EnemyType, { barY: number; shadowScale: number }> = {
    grunt:  { barY: 0.95, shadowScale: 1.0 },
    tank:   { barY: 1.05, shadowScale: 1.55 },
    runner: { barY: 0.9,  shadowScale: 0.95 },
    swarm:  { barY: 0.72, shadowScale: 0.65 },
    shield: { barY: 1.1,  shadowScale: 1.1 },
    healer: { barY: 1.15, shadowScale: 1.0 },
    boss:   { barY: 2.1,  shadowScale: 1.95 },
};

// ─── 敵人用真模型，唔再砌幾何 ────────────────────────────────────────────
//
// 本來呢度三百幾行，一種敵人一隻手寫嘅建構函數：圓球做頭、圓柱做腳、圓錐做角。
// 而家換咗 Kenney Graveyard Kit 嘅五隻 CC0 生物（skeleton／zombie／ghost／
// vampire／digger，全部 CC0、自足 GLB、288–1875 頂點）。
//
// **但唔可以就咁一隻怪 clone 一份 Object3D。** 一波最多 455 隻（`balance.mjs`
// 守住呢個上限），每隻五件就係兩千幾個 draw call。所以照舊用 InstancedMesh：
// 由 GLB 抽返每個 sub-mesh 嘅 geometry 同 material，砌成同原本一模一樣嘅
// `EnemyPartDef` 清單——上面成套 instancing、動畫、血條機制一行都唔使改。
//
// 五隻模型對七種敵人：`swarm` 同 `shield` 冇自己嘅模型，用大細同色分
// （swarm 係細版 skeleton、shield 係藍版 zombie）。呢個係 kit 得五隻嘅代價，
// 記喺度，第日搵到啱嘅 CC0 角色包就換。
const 敵模型: Record<EnemyType, { 檔: string; 縮: number; 色?: number; 抬: number }> = {
    grunt:  { 檔: 'skeleton', 縮: 0.60, 抬: 0.39 },
    tank:   { 檔: 'digger',   縮: 0.52, 抬: 0.39 },
    runner: { 檔: 'ghost',    縮: 0.46, 抬: 1.43 },
    swarm:  { 檔: 'skeleton', 縮: 0.38, 色: 0x9fd8a0, 抬: 0.39 },
    shield: { 檔: 'zombie',   縮: 0.58, 色: 0x7fc6e8, 抬: 0.39 },
    healer: { 檔: 'vampire',  縮: 0.55, 色: 0xf0a8d0, 抬: 0.48 },
    boss:   { 檔: 'vampire',  縮: 1.15, 色: 0xff9a4d, 抬: 0.48 },
};

/** 每種敵人身體點郁——模型本身係靜態，所以郁嘅係成個身，唔係逐條腳。 */
const 敵動作: Record<EnemyType, AnimFn> = {
    grunt:  walkBob(0.055, 9),
    tank:   walkBob(0.035, 5.5),
    runner: hover(0.08, 3.2),
    swarm:  walkBob(0.07, 13),
    shield: walkBob(0.04, 7),
    healer: hover(0.05, 2.4),
    boss:   walkBob(0.06, 4),
};

const ENEMY_PARTS: Record<EnemyType, EnemyPartDef[]> = {
    grunt: [], tank: [], runner: [], swarm: [], shield: [], healer: [], boss: [],
};

/**
 * 開場前叫一次：由已經預載嘅 GLB 抽返 geometry／material，砌成 parts 清單。
 *
 * 每個 sub-mesh 喺模型入面自己嘅位置／轉向／縮放要**焗返入 geometry 度**
 * （`applyMatrix4`），唔係逐幀喺 instance matrix 度再乘一次——一個 sub-mesh
 * 嘅本地變換係固定嘅，焗一次就夠。
 */
export function 裝敵模型(): void {
    for (const type of Object.keys(敵模型) as EnemyType[]) {
        const cfg = 敵模型[type];
        const root = 取同步(`enemies/${cfg.檔}.glb`);
        root.updateMatrixWorld(true);
        const parts: EnemyPartDef[] = [];
        root.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            const geo = m.geometry.clone();
            geo.applyMatrix4(m.matrixWorld);          // 焗返 sub-mesh 自己嗰個變換
            geo.scale(cfg.縮, cfg.縮, cfg.縮);
            geo.translate(0, cfg.抬 * cfg.縮, 0);      // 模型原點喺身體中間，抬返上地面
            for (const mm of (Array.isArray(m.material) ? m.material : [m.material])) {
                const mat = (mm as THREE.MeshStandardMaterial).clone();
                if (cfg.色) mat.color.lerp(new THREE.Color(cfg.色), 0.55);
                parts.push({ geo, mat, offset: new THREE.Vector3(0, 0, 0), anim: 敵動作[type] });
                break;                                  // 一個 sub-mesh 一份材質就夠
            }
        });
        ENEMY_PARTS[type] = parts;
    }
}


const MAX_PER_TYPE = 100;
const HP_BAR_WIDTH = 0.5;
const POOL_SIZE = 100;

// Shared unit-scale geometries — use mesh.scale.x to resize width
const GEO_BAR    = new THREE.PlaneGeometry(1, 0.06);
const GEO_SHIELD = new THREE.PlaneGeometry(1, 0.04);
const GEO_SHADOW = new THREE.CircleGeometry(0.26, 12);
const GEO_HALO   = new THREE.RingGeometry(0.18, 0.24, 12);

export class EnemyRenderer {
    private scene: THREE.Scene;
    private instancedMeshGroups = new Map<EnemyType, THREE.InstancedMesh[]>();
    private dummy = new THREE.Object3D();
    private animOut: AnimResult = { ox: 0, oy: 0, oz: 0, rx: 0, ry: 0, rz: 0, s: 1 };

    // Shared materials (created once, reused every frame)
    private readonly mHpBg      = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHpGreen   = new THREE.MeshBasicMaterial({ color: 0x44ff44, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHpYellow  = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHpRed     = new THREE.MeshBasicMaterial({ color: 0xff3333, side: THREE.DoubleSide, depthWrite: false });
    private readonly mShield    = new THREE.MeshBasicMaterial({ color: 0x4488ff, side: THREE.DoubleSide, depthWrite: false });
    private readonly mShadow    = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloBoss  = new THREE.MeshBasicMaterial({ color: 0xff9e57, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloShield = new THREE.MeshBasicMaterial({ color: 0x6ccfff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloSlow  = new THREE.MeshBasicMaterial({ color: 0x8de8ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
    private readonly mHaloDot   = new THREE.MeshBasicMaterial({ color: 0x74ff6a, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });

    // Scene-persistent pooled meshes — never added/removed, just shown/hidden
    private readonly poolHpBg   : THREE.Mesh[] = [];
    private readonly poolHpFill : THREE.Mesh[] = [];
    private readonly poolShield : THREE.Mesh[] = [];
    private readonly poolShadow : THREE.Mesh[] = [];   // desktop only
    private readonly poolHalo   : THREE.Mesh[] = [];   // desktop only

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        // Yaw-first rotation order so facing (Y) composes with limb pitch (X)
        // and static part tilts in the enemy's own frame — with the default
        // XYZ order, any part with an X rotation stopped following the path.
        this.dummy.rotation.order = 'YXZ';
        this.initPool();
    }

    private initPool(): void {
        const add = (geo: THREE.BufferGeometry, mat: THREE.Material, order: number): THREE.Mesh => {
            const m = new THREE.Mesh(geo, mat);
            m.visible = false;
            m.renderOrder = order;
            this.scene.add(m);
            return m;
        };
        for (let i = 0; i < POOL_SIZE; i++) {
            this.poolHpBg.push(add(GEO_BAR, this.mHpBg, 1));
            this.poolHpFill.push(add(GEO_BAR, this.mHpGreen, 2));
            this.poolShield.push(add(GEO_SHIELD, this.mShield, 2));
            if (!GRAPHICS.isMobile) {
                this.poolShadow.push(add(GEO_SHADOW, this.mShadow, 0));
                this.poolHalo.push(add(GEO_HALO, this.mHaloDot, 0));
            }
        }
    }

    private getOrCreate(type: EnemyType): THREE.InstancedMesh[] {
        let meshes = this.instancedMeshGroups.get(type);
        if (!meshes) {
            meshes = [];
            const parts = ENEMY_PARTS[type];
            for (const part of parts) {
                const mesh = new THREE.InstancedMesh(part.geo, part.mat, MAX_PER_TYPE);
                mesh.count = 0;
                if (GRAPHICS.enableShadows) {
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                }
                this.scene.add(mesh);
                meshes.push(mesh);
            }
            this.instancedMeshGroups.set(type, meshes);
        }
        return meshes;
    }

    sync(state: GameState, _interpolation: number, camera?: THREE.Camera): void {
        // Group living enemies by type and build ordered list for pool slots
        const byType = new Map<EnemyType, Enemy[]>();
        const living: Enemy[] = [];
        for (const e of state.enemies) {
            if (!e.alive || e.reached) continue;
            let arr = byType.get(e.type);
            if (!arr) { arr = []; byType.set(e.type, arr); }
            arr.push(e);
            living.push(e);
        }

        const time = performance.now() * 0.001;
        const out = this.animOut;

        // Update instanced meshes (enemy bodies)
        const allTypes: EnemyType[] = ['grunt', 'tank', 'runner', 'swarm', 'shield', 'healer', 'boss'];
        for (const type of allTypes) {
            const meshes = this.getOrCreate(type);
            const enemies = byType.get(type) || [];
            for (const mesh of meshes) {
                mesh.count = enemies.length;
            }
            const parts = ENEMY_PARTS[type];
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const dx = e.worldX - e.prevWorldX;
                const dz = e.worldZ - e.prevWorldZ;
                let moveRot = 0;
                if (Math.abs(dx) > 0.001 || Math.abs(dz) > 0.001) {
                    moveRot = Math.atan2(dx, dz);
                    (e as any).displayRot = moveRot;
                } else if ((e as any).displayRot !== undefined) {
                    moveRot = (e as any).displayRot;
                }
                const phase = e.id * 0.7;
                for (let p = 0; p < parts.length; p++) {
                    const part = parts[p];

                    out.ox = 0; out.oy = 0; out.oz = 0;
                    out.rx = 0; out.ry = 0; out.rz = 0;
                    out.s = 1;
                    if (part.anim) part.anim(out, time, phase);

                    this.dummy.position.set(e.worldX + out.ox, out.oy, e.worldZ + out.oz);
                    this.dummy.position.add(part.offset);
                    this.dummy.rotation.set(out.rx, moveRot + out.ry, out.rz);
                    if (part.rotation) {
                        this.dummy.rotation.x += part.rotation.x;
                        this.dummy.rotation.y += part.rotation.y;
                        this.dummy.rotation.z += part.rotation.z;
                    }
                    if (part.scale) {
                        this.dummy.scale.copy(part.scale).multiplyScalar(out.s);
                    } else {
                        this.dummy.scale.set(out.s, out.s, out.s);
                    }
                    this.dummy.updateMatrix();
                    meshes[p].setMatrixAt(i, this.dummy.matrix);
                }
            }
            for (const mesh of meshes) {
                mesh.instanceMatrix.needsUpdate = true;
            }
        }

        // ─── Pool-based HP bars (no per-frame allocation) ─────────────────────
        const n = Math.min(living.length, POOL_SIZE);

        for (let i = 0; i < n; i++) {
            const e = living[i];
            const isBoss = e.type === 'boss';
            const barY = ENEMY_META[e.type].barY;

            const hpRatio = Math.max(0, e.hp / e.maxHp);
            const hpW = HP_BAR_WIDTH * hpRatio;

            // Background bar — full width, centred on enemy
            const bg = this.poolHpBg[i];
            bg.scale.set(HP_BAR_WIDTH, 1, 1);
            bg.position.set(e.worldX, barY, e.worldZ);
            bg.visible = true;
            if (camera) bg.lookAt(camera.position); else bg.rotation.x = -Math.PI / 4;

            // Fill bar — left-aligned, scales with HP ratio
            const fill = this.poolHpFill[i];
            if (hpW > 0.001) {
                (fill as THREE.Mesh).material = hpRatio > 0.5 ? this.mHpGreen
                    : hpRatio > 0.25 ? this.mHpYellow : this.mHpRed;
                fill.scale.set(hpW, 1, 1);
                fill.position.set(e.worldX - (HP_BAR_WIDTH - hpW) / 2, barY, e.worldZ);
                fill.visible = true;
                if (camera) fill.lookAt(camera.position); else fill.rotation.x = -Math.PI / 4;
            } else {
                fill.visible = false;
            }

            // Shield bar
            const shield = this.poolShield[i];
            if (e.maxShield > 0 && e.shield > 0) {
                const sRatio = e.shield / e.maxShield;
                const sW = HP_BAR_WIDTH * sRatio;
                shield.scale.set(sW, 1, 1);
                shield.position.set(e.worldX - (HP_BAR_WIDTH - sW) / 2, barY + 0.07, e.worldZ);
                shield.visible = true;
                if (camera) shield.lookAt(camera.position); else shield.rotation.x = -Math.PI / 4;
            } else {
                shield.visible = false;
            }

            // Contact shadow + status halo — desktop only (skip on mobile to save draw calls)
            if (!GRAPHICS.isMobile && i < this.poolShadow.length) {
                const shadow = this.poolShadow[i];
                shadow.scale.setScalar(ENEMY_META[e.type].shadowScale);
                shadow.position.set(e.worldX, 0.01, e.worldZ);
                shadow.visible = true;

                const halo = this.poolHalo[i];
                const hasStatus = e.slow || e.dots.length > 0 || e.shield > 0 || isBoss;
                if (hasStatus) {
                    (halo as THREE.Mesh).material = isBoss ? this.mHaloBoss
                        : e.shield > 0 ? this.mHaloShield
                        : e.slow ? this.mHaloSlow
                        : this.mHaloDot;
                    halo.position.set(e.worldX, 0.045, e.worldZ);
                    halo.visible = true;
                } else {
                    halo.visible = false;
                }
            }
        }

        // Hide unused pool slots
        for (let i = n; i < POOL_SIZE; i++) {
            this.poolHpBg[i].visible = false;
            this.poolHpFill[i].visible = false;
            this.poolShield[i].visible = false;
            if (!GRAPHICS.isMobile && i < this.poolShadow.length) {
                this.poolShadow[i].visible = false;
                this.poolHalo[i].visible = false;
            }
        }
    }
}
