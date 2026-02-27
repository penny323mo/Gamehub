import * as THREE from 'three';
import type { GameState, TowerType } from '../core/types';

export class ProjectileRenderer {
    private scene: THREE.Scene;
    private projMeshes: Map<number, THREE.Object3D> = new Map();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    sync(state: GameState, dt: number): void {
        const currentIds = new Set<number>();

        for (const proj of state.projectiles) {
            if (!proj.alive) continue;
            currentIds.add(proj.id);

            let mesh = this.projMeshes.get(proj.id);
            if (!mesh) {
                mesh = this.createProjectileMesh(proj.towerType);
                this.scene.add(mesh);
                this.projMeshes.set(proj.id, mesh);
            }

            // Update position
            mesh.position.set(proj.x, proj.y !== undefined ? proj.y : 0.8, proj.z);

            // Update rotation to look along the path of travel
            if (proj.towerType !== 'cannon' && proj.towerType !== 'fire' && proj.towerType !== 'poison') {
                const totalDx = proj.targetX - proj.startX;
                const totalDz = proj.targetZ - proj.startZ;
                const nextP = Math.min(1.0, proj.progress + 0.05); // look slightly ahead

                const nextX = proj.startX + totalDx * nextP;
                const nextZ = proj.startZ + totalDz * nextP;
                const baseNextY = proj.startY + (proj.targetY - proj.startY) * nextP;

                let nextY = baseNextY;
                if (proj.arcHeight > 0) {
                    nextY += Math.sin(nextP * Math.PI) * proj.arcHeight;
                }

                if (nextP > proj.progress) {
                    mesh.lookAt(nextX, nextY, nextZ);
                }
            } else if (proj.towerType === 'poison' || proj.towerType === 'cannon') {
                // For somewhat spherical things or things that twist/tumble (optional rotation effect)
                mesh.rotation.x += dt * 5;
                mesh.rotation.z += dt * 3;
            }
        }

        // Cleanup dead projectiles
        for (const [id, mesh] of this.projMeshes.entries()) {
            if (!currentIds.has(id)) {
                this.scene.remove(mesh);
                this.projMeshes.delete(id);
            }
        }
    }

    private createProjectileMesh(type: TowerType): THREE.Object3D {
        const group = new THREE.Group();

        switch (type) {
            case 'arrow': {
                // Wooden shaft
                const shaftGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
                shaftGeo.rotateX(Math.PI / 2); // default look is along Z-axis (lookAt faces +Z usually, wait no, lookAt faces -Z or +Z? THREE looks along -Z)
                // In ThreeJS, lookAt makes the local +Z face the target.
                // Wait, lookAt actually makes the object face the target with its local -Z axis! "Rotates the object to face a point in world space. This method does not support objects having non-uniformly-scaled parent(s). Please note that the local -Z axis points towards the target."
                // So if it looks along -Z, our arrow should point along -Z.
                shaftGeo.rotateX(Math.PI / 2);

                const shaftMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
                const shaft = new THREE.Mesh(shaftGeo, shaftMat);

                // Metal tip
                const headGeo = new THREE.ConeGeometry(0.06, 0.2, 4);
                headGeo.rotateX(-Math.PI / 2); // point along -Z
                headGeo.translate(0, 0, -0.3); // move to front (-Z)
                const headMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
                const head = new THREE.Mesh(headGeo, headMat);

                // Feathers (fletching)
                const fletchGeo = new THREE.BoxGeometry(0.15, 0.15, 0.1);
                fletchGeo.translate(0, 0, 0.3); // back
                const fletchMat = new THREE.MeshLambertMaterial({ color: 0xdd2222 });
                const fletch = new THREE.Mesh(fletchGeo, fletchMat);

                group.add(shaft, head, fletch);
                break;
            }
            case 'cannon': {
                // Black iron sphere
                const mat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.4 });
                const geo = new THREE.SphereGeometry(0.2, 12, 12);
                const mesh = new THREE.Mesh(geo, mat);
                group.add(mesh);
                break;
            }
            case 'fire': {
                // Core glowing orb (trails will do the rest)
                const mat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
                const geo = new THREE.SphereGeometry(0.15, 8, 8);
                const mesh = new THREE.Mesh(geo, mat);
                group.add(mesh);

                // Outer glow
                const glowMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6 });
                const glowGeo = new THREE.SphereGeometry(0.25, 8, 8);
                const glow = new THREE.Mesh(glowGeo, glowMat);
                group.add(glow);
                break;
            }
            case 'poison': {
                // Bubbling green blob (squashed)
                const mat = new THREE.MeshStandardMaterial({ color: 0x44ff22, roughness: 0.2, transparent: true, opacity: 0.8 });
                const geo = new THREE.SphereGeometry(0.18, 12, 12);
                const mesh = new THREE.Mesh(geo, mat);
                mesh.scale.set(1, 0.7, 1);
                group.add(mesh);
                break;
            }
            case 'ice': {
                // Ice shard
                const mat = new THREE.MeshStandardMaterial({ color: 0xaaddff, roughness: 0.1, transparent: true, opacity: 0.8 });
                const geo = new THREE.ConeGeometry(0.1, 0.6, 6);
                geo.rotateX(-Math.PI / 2); // point along -Z
                const mesh = new THREE.Mesh(geo, mat);
                group.add(mesh);
                break;
            }
            case 'sniper': {
                // High velocity glowing slug
                const mat = new THREE.MeshBasicMaterial({ color: 0x5588ff });
                const geo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6);
                geo.rotateX(Math.PI / 2); // along Z
                const mesh = new THREE.Mesh(geo, mat);
                group.add(mesh);
                break;
            }
            case 'lightning': {
                // Basic white needle
                const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const geo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 4);
                geo.rotateX(Math.PI / 2); // along Z
                const mesh = new THREE.Mesh(geo, mat);
                group.add(mesh);
                break;
            }
        }

        // Small optimization: cast shadows for solid projectiles
        group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (type === 'arrow' || type === 'cannon') {
                    child.castShadow = true;
                }
            }
        });

        return group;
    }
}
