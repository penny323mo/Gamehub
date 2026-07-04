import * as THREE from 'three';
import type { GameState, EnemyType, Enemy } from '../core/types';
import { GRAPHICS } from '../core/config';

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

// Reusable anim helpers
const walkBob = (amp: number, speed = 10): AnimFn => (out, t, ph) => {
    out.oy += Math.abs(Math.sin(t * speed + ph)) * amp;
};
const hover = (amp: number, speed: number): AnimFn => (out, t, ph) => {
    out.oy += Math.sin(t * speed + ph) * amp;
};
const spinY = (speed: number): AnimFn => (out, t) => {
    out.ry += t * speed;
};

function buildEnemyConfigs(): Record<EnemyType, EnemyPartDef[]> {
    const configs: Record<EnemyType, EnemyPartDef[]> = {} as Record<EnemyType, EnemyPartDef[]>;

    const std = (opts: Record<string, unknown>): THREE.Material => {
        if (GRAPHICS.isMobile) {
            const { roughness: _r, metalness: _m, flatShading: _f, ...rest } = opts;
            return new THREE.MeshLambertMaterial(rest as THREE.MeshLambertMaterialParameters);
        }
        return new THREE.MeshStandardMaterial(opts as THREE.MeshStandardMaterialParameters);
    };

    // ─── Grunt: goblin raider — body, head, ears, glowing eyes, swinging arms ───
    {
        const bodyMat = std({ color: 0xee8833, roughness: 0.8 });
        const skinMat = std({ color: 0xffaa55, roughness: 0.6 });
        const eyeMat = std({ color: 0x331100, emissive: 0xffdd33, emissiveIntensity: 0.9 });
        const bodyBob = walkBob(0.035);
        const earGeo = new THREE.ConeGeometry(0.045, 0.14, 4);
        const armGeo = new THREE.CapsuleGeometry(0.035, 0.12, 3, 5);
        configs.grunt = [
            { geo: new THREE.CapsuleGeometry(0.12, 0.2, 4, 8), mat: bodyMat, offset: new THREE.Vector3(0, 0.2, 0), anim: bodyBob },
            { geo: new THREE.SphereGeometry(0.13, 8, 8), mat: skinMat, offset: new THREE.Vector3(0, 0.45, 0.05), anim: bodyBob },
            // Ears — swept back cones
            {
                geo: earGeo, mat: skinMat, offset: new THREE.Vector3(0.11, 0.52, 0.0),
                rotation: new THREE.Euler(0, 0, -1.9), anim: bodyBob, desktopOnly: true,
            },
            {
                geo: earGeo, mat: skinMat, offset: new THREE.Vector3(-0.11, 0.52, 0.0),
                rotation: new THREE.Euler(0, 0, 1.9), anim: bodyBob, desktopOnly: true,
            },
            // Eye band
            { geo: new THREE.BoxGeometry(0.14, 0.035, 0.04), mat: eyeMat, offset: new THREE.Vector3(0, 0.46, 0.16), anim: bodyBob },
            // Swinging arms
            {
                geo: armGeo, mat: bodyMat, offset: new THREE.Vector3(0.15, 0.24, 0), desktopOnly: true,
                anim: (out, t, ph) => { out.rx += Math.sin(t * 10 + ph) * 0.7; },
            },
            {
                geo: armGeo, mat: bodyMat, offset: new THREE.Vector3(-0.15, 0.24, 0), desktopOnly: true,
                anim: (out, t, ph) => { out.rx += Math.sin(t * 10 + ph + Math.PI) * 0.7; },
            },
        ];
    }

    // ─── Tank: armored siege beetle — spiked shell, rim plating, head ───
    {
        const shellMat = std({ color: 0x9944cc, roughness: 0.85, metalness: 0.25, flatShading: true });
        const plateMat = std({ color: 0x5e2a80, roughness: 0.6, metalness: 0.45 });
        const headMat = std({ color: 0x7722aa, roughness: 0.7 });
        const sway: AnimFn = (out, t, ph) => { out.rz += Math.sin(t * 4 + ph) * 0.05; };
        const spikeGeo = new THREE.ConeGeometry(0.05, 0.14, 5);
        configs.tank = [
            {
                geo: new THREE.SphereGeometry(0.3, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
                mat: shellMat, offset: new THREE.Vector3(0, 0.2, 0),
                scale: new THREE.Vector3(1, 0.62, 1.2), anim: sway,
            },
            // Armored rim skirt
            {
                geo: new THREE.TorusGeometry(0.28, 0.045, 6, 14), mat: plateMat,
                offset: new THREE.Vector3(0, 0.16, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                scale: new THREE.Vector3(1, 1.18, 1), anim: sway,
            },
            // Spine spikes
            { geo: spikeGeo, mat: plateMat, offset: new THREE.Vector3(0, 0.42, 0), anim: sway, desktopOnly: true },
            {
                geo: spikeGeo, mat: plateMat, offset: new THREE.Vector3(0, 0.36, -0.18),
                rotation: new THREE.Euler(-0.5, 0, 0), anim: sway, desktopOnly: true,
            },
            {
                geo: spikeGeo, mat: plateMat, offset: new THREE.Vector3(0, 0.36, 0.18),
                rotation: new THREE.Euler(0.5, 0, 0), anim: sway, desktopOnly: true,
            },
            // Head with slight nod
            {
                geo: new THREE.SphereGeometry(0.14, 8, 8), mat: headMat, offset: new THREE.Vector3(0, 0.18, 0.36),
                anim: (out, t, ph) => { out.oy += Math.sin(t * 6 + ph) * 0.015; },
            },
        ];
    }

    // ─── Runner: velociraptor drone — sleek dart with fins and exhaust glow ───
    {
        const bodyMat = std({ color: 0x33cc55, roughness: 0.45, metalness: 0.2 });
        const finMat = std({ color: 0x1e8f38, roughness: 0.5, side: THREE.DoubleSide });
        const glowMat = std({ color: 0xbbffcc, emissive: 0x66ff88, emissiveIntensity: 1.0 });
        const dash: AnimFn = (out, t, ph) => {
            out.oy += Math.abs(Math.sin(t * 14 + ph)) * 0.05;
            out.rx += Math.sin(t * 14 + ph) * 0.06;
        };
        const finGeo = new THREE.PlaneGeometry(0.16, 0.1);
        configs.runner = [
            {
                geo: new THREE.ConeGeometry(0.13, 0.44, 6), mat: bodyMat,
                offset: new THREE.Vector3(0, 0.2, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0), anim: dash,
            },
            // Dorsal tail fin
            {
                geo: new THREE.PlaneGeometry(0.22, 0.14), mat: finMat,
                offset: new THREE.Vector3(0, 0.3, -0.16), rotation: new THREE.Euler(0.35, Math.PI / 2, 0),
                anim: dash, desktopOnly: true,
            },
            // Side fins, swept back
            {
                geo: finGeo, mat: finMat, offset: new THREE.Vector3(0.12, 0.2, -0.08),
                rotation: new THREE.Euler(0, -0.7, -0.5), anim: dash, desktopOnly: true,
            },
            {
                geo: finGeo, mat: finMat, offset: new THREE.Vector3(-0.12, 0.2, -0.08),
                rotation: new THREE.Euler(0, 0.7, 0.5), anim: dash, desktopOnly: true,
            },
            // Exhaust glow at the tail
            {
                geo: new THREE.SphereGeometry(0.05, 6, 6), mat: glowMat, offset: new THREE.Vector3(0, 0.2, -0.22),
                anim: (out, t, ph) => { out.s *= 0.85 + Math.abs(Math.sin(t * 18 + ph)) * 0.45; },
            },
        ];
    }

    // ─── Swarm: hornet — body, two flapping wings, stinger, eyes ───
    {
        const bodyMat = std({ color: 0xa8742f, roughness: 0.6 });
        const stripeMat = std({ color: 0x3a2a10, roughness: 0.7 });
        const wingMat = std({ color: 0xdddddd, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
        const eyeMat = std({ color: 0x220000, emissive: 0xff4444, emissiveIntensity: 0.8 });
        const buzz = hover(0.08, 10);
        const wingGeo = new THREE.PlaneGeometry(0.17, 0.09);
        configs.swarm = [
            {
                geo: new THREE.CapsuleGeometry(0.06, 0.16, 4, 6), mat: bodyMat,
                offset: new THREE.Vector3(0, 0.32, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0), anim: buzz,
            },
            // Abdomen stripe ring
            {
                geo: new THREE.TorusGeometry(0.058, 0.018, 4, 8), mat: stripeMat,
                offset: new THREE.Vector3(0, 0.32, -0.05), anim: buzz, desktopOnly: true,
            },
            // Wings flapping in opposite phase
            {
                geo: wingGeo, mat: wingMat, offset: new THREE.Vector3(0.09, 0.37, 0.02),
                rotation: new THREE.Euler(Math.PI / 2, 0, 0.25),
                anim: (out, t, ph) => { out.oy += Math.sin(t * 10 + ph) * 0.08; out.rz += Math.sin(t * 32 + ph) * 0.6; },
            },
            {
                geo: wingGeo, mat: wingMat, offset: new THREE.Vector3(-0.09, 0.37, 0.02),
                rotation: new THREE.Euler(Math.PI / 2, 0, -0.25),
                anim: (out, t, ph) => { out.oy += Math.sin(t * 10 + ph) * 0.08; out.rz -= Math.sin(t * 32 + ph) * 0.6; },
            },
            // Stinger
            {
                geo: new THREE.ConeGeometry(0.03, 0.1, 5), mat: stripeMat,
                offset: new THREE.Vector3(0, 0.32, -0.14), rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
                anim: buzz, desktopOnly: true,
            },
            // Eyes
            { geo: new THREE.SphereGeometry(0.028, 5, 5), mat: eyeMat, offset: new THREE.Vector3(0.035, 0.34, 0.12), anim: buzz },
            { geo: new THREE.SphereGeometry(0.028, 5, 5), mat: eyeMat, offset: new THREE.Vector3(-0.035, 0.34, 0.12), anim: buzz },
        ];
    }

    // ─── Shield: gyro sentinel — spinning core inside counter-rotating rings ───
    {
        const coreMat = std({ color: 0x1155cc, roughness: 0.35, metalness: 0.5, flatShading: true });
        const glowMat = std({ color: 0x66bbff, emissive: 0x3388ff, emissiveIntensity: 0.9 });
        const ringMat = std({ color: 0x3388ff, transparent: true, opacity: 0.7, emissive: 0x114488 });
        const float = hover(0.03, 3);
        configs.shield = [
            {
                geo: new THREE.DodecahedronGeometry(0.15), mat: coreMat, offset: new THREE.Vector3(0, 0.32, 0),
                anim: (out, t, ph) => { out.ry += t * 1.6; out.oy += Math.sin(t * 3 + ph) * 0.03; },
            },
            // Inner energy core
            {
                geo: new THREE.SphereGeometry(0.07, 8, 8), mat: glowMat, offset: new THREE.Vector3(0, 0.32, 0),
                anim: (out, t, ph) => { out.s *= 0.9 + Math.sin(t * 5 + ph) * 0.15; out.oy += Math.sin(t * 3 + ph) * 0.03; },
            },
            // Horizontal ring
            {
                geo: new THREE.TorusGeometry(0.25, 0.04, 6, 14), mat: ringMat,
                offset: new THREE.Vector3(0, 0.32, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                anim: (out, t, ph) => { out.rz += t * 2.4; out.oy += Math.sin(t * 3 + ph) * 0.03; },
            },
            // Vertical counter-rotating ring
            {
                geo: new THREE.TorusGeometry(0.25, 0.028, 6, 14), mat: ringMat,
                offset: new THREE.Vector3(0, 0.32, 0),
                anim: (out, t, ph) => { out.ry -= t * 3.0; out.oy += Math.sin(t * 3 + ph) * 0.03; },
                desktopOnly: true,
            },
        ];
    }

    // ─── Healer: shrine spirit — robed figure with spinning halo and orbiting orbs ───
    {
        const robeMat = std({ color: 0xff77aa, roughness: 0.7 });
        const skinMat = std({ color: 0xffe3ec, roughness: 0.5 });
        const haloMat = std({ color: 0xfff6d8, emissive: 0xffcc88, emissiveIntensity: 0.9 });
        const orbMat = std({ color: 0xbaffc9, emissive: 0x66ff99, emissiveIntensity: 0.9 });
        const drift = hover(0.035, 4);
        configs.healer = [
            // Robe — tapered cone body
            { geo: new THREE.ConeGeometry(0.17, 0.42, 8), mat: robeMat, offset: new THREE.Vector3(0, 0.24, 0), anim: drift },
            // Head
            { geo: new THREE.SphereGeometry(0.09, 8, 8), mat: skinMat, offset: new THREE.Vector3(0, 0.5, 0), anim: drift },
            // Chest sigil (cross)
            { geo: new THREE.BoxGeometry(0.05, 0.14, 0.03), mat: haloMat, offset: new THREE.Vector3(0, 0.3, 0.12), anim: drift },
            { geo: new THREE.BoxGeometry(0.12, 0.05, 0.03), mat: haloMat, offset: new THREE.Vector3(0, 0.31, 0.12), anim: drift },
            // Spinning halo
            {
                geo: new THREE.TorusGeometry(0.12, 0.02, 5, 12), mat: haloMat,
                offset: new THREE.Vector3(0, 0.66, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                anim: (out, t, ph) => { out.rz += t * 2.2; out.oy += Math.sin(t * 4 + ph) * 0.045; },
            },
            // Orbiting heal orbs
            {
                geo: new THREE.SphereGeometry(0.035, 6, 6), mat: orbMat, offset: new THREE.Vector3(0, 0.36, 0),
                anim: (out, t, ph) => {
                    out.ox += Math.cos(t * 2.6 + ph) * 0.24;
                    out.oz += Math.sin(t * 2.6 + ph) * 0.24;
                    out.oy += Math.sin(t * 5 + ph) * 0.05;
                },
                desktopOnly: true,
            },
            {
                geo: new THREE.SphereGeometry(0.035, 6, 6), mat: orbMat, offset: new THREE.Vector3(0, 0.36, 0),
                anim: (out, t, ph) => {
                    out.ox += Math.cos(t * 2.6 + ph + Math.PI) * 0.24;
                    out.oz += Math.sin(t * 2.6 + ph + Math.PI) * 0.24;
                    out.oy += Math.sin(t * 5 + ph + 1.5) * 0.05;
                },
                desktopOnly: true,
            },
        ];
    }

    // ─── Boss: warlord — horned juggernaut with pauldrons, visor and floating crown ───
    {
        const bodyMat = std({ color: 0xaa1111, metalness: 0.5, roughness: 0.55, flatShading: true });
        const armorMat = std({ color: 0x4a0d0d, metalness: 0.7, roughness: 0.4 });
        const eyeMat = std({ color: 0x220000, emissive: 0xffaa00, emissiveIntensity: 1 });
        const hornMat = std({ color: 0xe8e0d0, roughness: 0.5 });
        const coreMat = std({ color: 0xff5522, emissive: 0xff3300, emissiveIntensity: 0.9 });
        const stomp: AnimFn = (out, t, ph) => {
            out.oy += Math.abs(Math.sin(t * 5 + ph)) * 0.04;
            out.rz += Math.sin(t * 5 + ph) * 0.03;
        };
        configs.boss = [
            { geo: new THREE.CapsuleGeometry(0.3, 0.5, 6, 12), mat: bodyMat, offset: new THREE.Vector3(0, 0.5, 0), anim: stomp },
            // Shoulder pauldrons
            {
                geo: new THREE.SphereGeometry(0.16, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat: armorMat,
                offset: new THREE.Vector3(0.3, 0.72, 0), rotation: new THREE.Euler(0, 0, -0.35), anim: stomp,
            },
            {
                geo: new THREE.SphereGeometry(0.16, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat: armorMat,
                offset: new THREE.Vector3(-0.3, 0.72, 0), rotation: new THREE.Euler(0, 0, 0.35), anim: stomp,
            },
            // Belt plate
            {
                geo: new THREE.TorusGeometry(0.31, 0.045, 6, 12), mat: armorMat,
                offset: new THREE.Vector3(0, 0.42, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                anim: stomp, desktopOnly: true,
            },
            // Glowing eye visor
            { geo: new THREE.BoxGeometry(0.3, 0.07, 0.1), mat: eyeMat, offset: new THREE.Vector3(0, 0.68, 0.3), anim: stomp },
            // Chest core
            {
                geo: new THREE.SphereGeometry(0.08, 8, 8), mat: coreMat, offset: new THREE.Vector3(0, 0.52, 0.3),
                anim: (out, t, ph) => {
                    out.s *= 0.9 + Math.sin(t * 6 + ph) * 0.18;
                    out.oy += Math.abs(Math.sin(t * 5 + ph)) * 0.04;
                },
            },
            // Horns
            {
                geo: new THREE.ConeGeometry(0.08, 0.32, 5), mat: hornMat,
                offset: new THREE.Vector3(0.17, 0.9, 0.12), rotation: new THREE.Euler(Math.PI / 5, 0, -Math.PI / 6), anim: stomp,
            },
            {
                geo: new THREE.ConeGeometry(0.08, 0.32, 5), mat: hornMat,
                offset: new THREE.Vector3(-0.17, 0.9, 0.12), rotation: new THREE.Euler(Math.PI / 5, 0, Math.PI / 6), anim: stomp,
            },
            // Floating crown ring
            {
                geo: new THREE.TorusGeometry(0.17, 0.025, 5, 12), mat: coreMat,
                offset: new THREE.Vector3(0, 1.14, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0),
                anim: (out, t, ph) => { out.rz += t * 1.8; out.oy += Math.sin(t * 2.4 + ph) * 0.05; },
                desktopOnly: true,
            },
        ];
    }

    // Strip desktop-only parts on mobile
    if (GRAPHICS.isMobile) {
        for (const key of Object.keys(configs) as EnemyType[]) {
            configs[key] = configs[key].filter(p => !p.desktopOnly);
        }
    }

    return configs;
}

const ENEMY_PARTS = buildEnemyConfigs();

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
            const barY = isBoss ? 1.2 : 0.9;

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
                shadow.scale.setScalar(isBoss ? 1.62 : 1); // boss shadow ~0.42 vs normal 0.26
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
