import * as THREE from 'three';
import type { GameState, TowerType } from '../core/types';

const PROJ_COLORS: Record<TowerType, number> = {
    arrow: 0xffdd44,
    cannon: 0xff6633,
    ice: 0x88ddff,
};

export class FxRenderer {
    private scene: THREE.Scene;
    private projMeshes: THREE.Mesh[] = [];
    private explosions: { mesh: THREE.Mesh; life: number }[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    sync(state: GameState, dt: number): void {
        // Remove old projectile meshes
        for (const m of this.projMeshes) {
            this.scene.remove(m);
        }
        this.projMeshes.length = 0;

        // Draw projectiles
        for (const proj of state.projectiles) {
            if (!proj.alive) continue;

            const geo = new THREE.SphereGeometry(0.06, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: PROJ_COLORS[proj.towerType],
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(proj.x, 0.5, proj.z);
            this.scene.add(mesh);
            this.projMeshes.push(mesh);
        }

        // Animate explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const e = this.explosions[i];
            e.life -= dt;
            if (e.life <= 0) {
                this.scene.remove(e.mesh);
                this.explosions.splice(i, 1);
            } else {
                const scale = 1 + (1 - e.life / 0.4) * 2;
                e.mesh.scale.set(scale, scale, scale);
                const mat = e.mesh.material as THREE.MeshBasicMaterial;
                mat.opacity = e.life / 0.4;
            }
        }
    }

    addExplosion(x: number, z: number, type: TowerType): void {
        const geo = new THREE.RingGeometry(0.1, 0.3, 16);
        const mat = new THREE.MeshBasicMaterial({
            color: PROJ_COLORS[type],
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.1, z);
        this.scene.add(mesh);
        this.explosions.push({ mesh, life: 0.4 });
    }
}
