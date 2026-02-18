import * as THREE from 'three';
import type { GameState, EnemyType } from '../core/types';

const ENEMY_COLORS: Record<EnemyType, number> = {
    grunt: 0xee6644,
    tank: 0x7744aa,
    runner: 0x44cc66,
};

const ENEMY_SCALE: Record<EnemyType, number> = {
    grunt: 0.22,
    tank: 0.35,
    runner: 0.18,
};

export class EnemyRenderer {
    private instancedMeshes = new Map<EnemyType, THREE.InstancedMesh>();
    private hpBars: THREE.Group;
    private scene: THREE.Scene;
    private dummy = new THREE.Object3D();
    private maxInstances = 100;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.hpBars = new THREE.Group();
        scene.add(this.hpBars);
        this.initMeshes();
    }

    private initMeshes(): void {
        const types: EnemyType[] = ['grunt', 'tank', 'runner'];
        for (const type of types) {
            const size = ENEMY_SCALE[type];
            let geo: THREE.BufferGeometry;

            if (type === 'tank') {
                geo = new THREE.BoxGeometry(size * 2, size * 1.5, size * 2);
            } else if (type === 'runner') {
                geo = new THREE.ConeGeometry(size, size * 2, 6);
            } else {
                geo = new THREE.SphereGeometry(size, 8, 6);
            }

            const mat = new THREE.MeshStandardMaterial({
                color: ENEMY_COLORS[type],
                roughness: 0.6,
                metalness: 0.2,
            });

            const im = new THREE.InstancedMesh(geo, mat, this.maxInstances);
            im.count = 0;
            im.castShadow = true;
            im.receiveShadow = false;
            im.frustumCulled = false;
            this.scene.add(im);
            this.instancedMeshes.set(type, im);
        }
    }

    sync(state: GameState, _alpha: number): void {
        // Group enemies by type
        const byType = new Map<EnemyType, { x: number; z: number; hp: number; maxHp: number }[]>();

        for (const enemy of state.enemies) {
            if (!enemy.alive) continue;
            if (!byType.has(enemy.type)) byType.set(enemy.type, []);
            byType.get(enemy.type)!.push({
                x: enemy.worldX,
                z: enemy.worldZ,
                hp: enemy.hp,
                maxHp: enemy.maxHp,
            });
        }

        // Update instanced meshes
        for (const [type, im] of this.instancedMeshes) {
            const enemies = byType.get(type) || [];
            im.count = enemies.length;

            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                const scale = ENEMY_SCALE[type];
                this.dummy.position.set(e.x, scale + 0.1, e.z);
                this.dummy.scale.set(1, 1, 1);
                this.dummy.updateMatrix();
                im.setMatrixAt(i, this.dummy.matrix);
            }

            if (enemies.length > 0) {
                im.instanceMatrix.needsUpdate = true;
            }
        }

        // Update HP bars
        this.updateHpBars(state);
    }

    private updateHpBars(state: GameState): void {
        // Remove old HP bars
        while (this.hpBars.children.length > 0) {
            const child = this.hpBars.children[0];
            this.hpBars.remove(child);
        }

        for (const enemy of state.enemies) {
            if (!enemy.alive || enemy.hp >= enemy.maxHp) continue;

            const pct = enemy.hp / enemy.maxHp;
            const barWidth = 0.5;

            // Background
            const bgGeo = new THREE.PlaneGeometry(barWidth, 0.06);
            const bgMat = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide });
            const bg = new THREE.Mesh(bgGeo, bgMat);

            // Fill
            const fillGeo = new THREE.PlaneGeometry(barWidth * pct, 0.06);
            const fillColor = pct > 0.5 ? 0x44cc44 : pct > 0.25 ? 0xddcc22 : 0xcc2222;
            const fillMat = new THREE.MeshBasicMaterial({ color: fillColor, side: THREE.DoubleSide });
            const fill = new THREE.Mesh(fillGeo, fillMat);
            fill.position.x = -(barWidth * (1 - pct)) / 2;

            const group = new THREE.Group();
            group.add(bg);
            group.add(fill);
            group.position.set(enemy.worldX, 0.8, enemy.worldZ);
            group.rotation.x = -Math.PI / 4;
            this.hpBars.add(group);
        }
    }

    dispose(): void {
        for (const im of this.instancedMeshes.values()) {
            im.geometry.dispose();
            (im.material as THREE.Material).dispose();
            this.scene.remove(im);
        }
    }
}
