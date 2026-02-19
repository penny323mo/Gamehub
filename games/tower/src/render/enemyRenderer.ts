import * as THREE from 'three';
import type { GameState, EnemyType, Enemy } from '../core/types';

// Shapes and colors per enemy type
const ENEMY_CONFIG: Record<EnemyType, { color: number; shape: 'sphere' | 'box' | 'cone' | 'diamond' | 'torus' | 'capsule' | 'dodeca'; scale: number }> = {
    grunt: { color: 0xee8833, shape: 'sphere', scale: 0.25 },
    tank: { color: 0x9944cc, shape: 'box', scale: 0.35 },
    runner: { color: 0x33cc55, shape: 'cone', scale: 0.22 },
    swarm: { color: 0x996633, shape: 'diamond', scale: 0.15 },
    shield: { color: 0x3388ff, shape: 'dodeca', scale: 0.28 },
    healer: { color: 0xff77aa, shape: 'torus', scale: 0.25 },
    boss: { color: 0xcc1111, shape: 'capsule', scale: 0.45 },
};

const geos: Record<string, THREE.BufferGeometry> = {};
function getGeo(shape: string, scale: number): THREE.BufferGeometry {
    const key = `${shape}_${scale}`;
    if (!geos[key]) {
        switch (shape) {
            case 'sphere': geos[key] = new THREE.SphereGeometry(scale, 8, 8); break;
            case 'box': geos[key] = new THREE.BoxGeometry(scale * 1.4, scale * 1.2, scale * 1.4); break;
            case 'cone': geos[key] = new THREE.ConeGeometry(scale, scale * 2, 6); break;
            case 'diamond': geos[key] = new THREE.OctahedronGeometry(scale); break;
            case 'dodeca': geos[key] = new THREE.DodecahedronGeometry(scale); break;
            case 'torus': geos[key] = new THREE.TorusGeometry(scale * 0.6, scale * 0.3, 6, 8); break;
            case 'capsule': geos[key] = new THREE.CapsuleGeometry(scale * 0.5, scale * 0.8, 4, 8); break;
            default: geos[key] = new THREE.SphereGeometry(scale, 8, 8); break;
        }
    }
    return geos[key];
}

const MAX_PER_TYPE = 100;
const HP_BAR_WIDTH = 0.5;

export class EnemyRenderer {
    private scene: THREE.Scene;
    private instancedMeshes = new Map<EnemyType, THREE.InstancedMesh>();
    private hpBars: THREE.Mesh[] = [];
    private shieldBars: THREE.Mesh[] = [];
    private hpBarBg: THREE.Mesh[] = [];
    private dummy = new THREE.Object3D();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    private getOrCreate(type: EnemyType): THREE.InstancedMesh {
        let mesh = this.instancedMeshes.get(type);
        if (!mesh) {
            const cfg = ENEMY_CONFIG[type];
            const geo = getGeo(cfg.shape, cfg.scale);
            const mat = new THREE.MeshStandardMaterial({ color: cfg.color });
            mesh = new THREE.InstancedMesh(geo, mat, MAX_PER_TYPE);
            mesh.count = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.instancedMeshes.set(type, mesh);
        }
        return mesh;
    }

    // C — Accept camera for billboard lookAt
    sync(state: GameState, _interpolation: number, camera?: THREE.Camera): void {
        // Group living enemies by type
        const byType = new Map<EnemyType, Enemy[]>();
        for (const e of state.enemies) {
            if (!e.alive || e.reached) continue;
            let arr = byType.get(e.type);
            if (!arr) { arr = []; byType.set(e.type, arr); }
            arr.push(e);
        }

        // Clean old HP bars
        for (const bar of this.hpBars) this.scene.remove(bar);
        for (const bar of this.shieldBars) this.scene.remove(bar);
        for (const bar of this.hpBarBg) this.scene.remove(bar);
        this.hpBars = [];
        this.shieldBars = [];
        this.hpBarBg = [];

        // Update each type's instanced mesh
        const allTypes: EnemyType[] = ['grunt', 'tank', 'runner', 'swarm', 'shield', 'healer', 'boss'];
        for (const type of allTypes) {
            const mesh = this.getOrCreate(type);
            const enemies = byType.get(type) || [];
            mesh.count = enemies.length;

            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const yOff = ENEMY_CONFIG[type].shape === 'torus' ? 0.5 : 0.4;
                this.dummy.position.set(e.worldX, yOff, e.worldZ);
                this.dummy.scale.set(1, 1, 1);
                this.dummy.rotation.set(0, 0, 0);

                if ((type as string) === 'torus') {
                    this.dummy.rotation.x = Math.PI / 2;
                }

                this.dummy.updateMatrix();
                mesh.setMatrixAt(i, this.dummy.matrix);

                // C — Billboard bars: face camera if available
                const buildBar = (y: number, width: number, color: number, height: number): THREE.Mesh => {
                    const geo = new THREE.PlaneGeometry(width, height);
                    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthWrite: false });
                    const bar = new THREE.Mesh(geo, mat);
                    bar.position.set(e.worldX - (HP_BAR_WIDTH - width) / 2, y, e.worldZ);
                    if (camera) {
                        bar.lookAt(camera.position);
                    } else {
                        bar.rotation.x = -Math.PI / 4;
                    }
                    return bar;
                };

                // HP bar background
                const bg = buildBar(0.9, HP_BAR_WIDTH, 0x333333, 0.06);
                bg.position.set(e.worldX, 0.9, e.worldZ);  // centre align bg
                if (camera) bg.lookAt(camera.position); else bg.rotation.x = -Math.PI / 4;
                this.scene.add(bg);
                this.hpBarBg.push(bg);

                // HP bar fill
                const hpRatio = Math.max(0, e.hp / e.maxHp);
                const hpW = HP_BAR_WIDTH * hpRatio;
                const hpColor = hpRatio > 0.5 ? 0x44ff44 : hpRatio > 0.25 ? 0xffaa00 : 0xff3333;
                const hpBar = buildBar(0.9, hpW, hpColor, 0.06);
                this.scene.add(hpBar);
                this.hpBars.push(hpBar);

                // Shield bar (if any)
                if (e.maxShield > 0 && e.shield > 0) {
                    const shieldRatio = e.shield / e.maxShield;
                    const sW = HP_BAR_WIDTH * shieldRatio;
                    const sBar = buildBar(0.97, sW, 0x4488ff, 0.04);
                    this.scene.add(sBar);
                    this.shieldBars.push(sBar);
                }
            }
            mesh.instanceMatrix.needsUpdate = true;
        }
    }
}
