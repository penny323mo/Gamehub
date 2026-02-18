import * as THREE from 'three';
import type { GameState, Tower, TowerType } from '../core/types';

// ─── Tower Colors ───
const TOWER_COLORS: Record<TowerType, number[]> = {
    arrow: [0x8B7355, 0x6B5340, 0x4B3320],
    cannon: [0x555577, 0x444466, 0x333355],
    ice: [0x88bbdd, 0x66aacc, 0x4499bb],
};

const TOWER_TOP_COLORS: Record<TowerType, number> = {
    arrow: 0xcc8844,
    cannon: 0x222244,
    ice: 0xaaddff,
};

export class TowerRenderer {
    private meshes = new Map<number, THREE.Group>();
    private scene: THREE.Scene;
    private rangeRing: THREE.Mesh | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    sync(state: GameState): void {
        const livingIds = new Set(state.towers.map(t => t.id));

        // Remove deleted towers
        for (const [id, group] of this.meshes) {
            if (!livingIds.has(id)) {
                this.scene.remove(group);
                this.meshes.delete(id);
            }
        }

        // Add or update towers
        for (const tower of state.towers) {
            let group = this.meshes.get(tower.id);
            if (!group) {
                group = this.createTowerMesh(tower);
                this.scene.add(group);
                this.meshes.set(tower.id, group);
            }
            // Update for level changes
            group.userData.level = tower.level;
        }
    }

    showRange(tower: Tower, range: number): void {
        this.hideRange();
        const geo = new THREE.RingGeometry(range - 0.05, range, 48);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
        });
        this.rangeRing = new THREE.Mesh(geo, mat);
        this.rangeRing.rotation.x = -Math.PI / 2;
        this.rangeRing.position.set(tower.worldX, 0.02, tower.worldZ);
        this.scene.add(this.rangeRing);
    }

    hideRange(): void {
        if (this.rangeRing) {
            this.scene.remove(this.rangeRing);
            this.rangeRing = null;
        }
    }

    private createTowerMesh(tower: Tower): THREE.Group {
        const group = new THREE.Group();
        const colors = TOWER_COLORS[tower.type];
        const level = tower.level;

        // Base
        const baseH = 0.4 + level * 0.15;
        const baseGeo = new THREE.CylinderGeometry(0.32, 0.38, baseH, 8);
        const baseMat = new THREE.MeshStandardMaterial({
            color: colors[level] || colors[0],
            roughness: 0.7,
            metalness: 0.2,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = baseH / 2;
        base.castShadow = true;
        group.add(base);

        // Top part
        const topH = 0.25;
        const topGeo = new THREE.CylinderGeometry(0.2, 0.32, topH, 8);
        const topMat = new THREE.MeshStandardMaterial({
            color: TOWER_TOP_COLORS[tower.type],
            roughness: 0.5,
            metalness: 0.3,
        });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = baseH + topH / 2;
        top.castShadow = true;
        group.add(top);

        // Type-specific decoration
        if (tower.type === 'arrow') {
            // Pointy top
            const spireGeo = new THREE.ConeGeometry(0.1, 0.3, 6);
            const spireMat = new THREE.MeshStandardMaterial({ color: 0xddaa55 });
            const spire = new THREE.Mesh(spireGeo, spireMat);
            spire.position.y = baseH + topH + 0.15;
            spire.castShadow = true;
            group.add(spire);
        } else if (tower.type === 'cannon') {
            // Barrel
            const barrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
            const barrelMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.6 });
            const barrel = new THREE.Mesh(barrelGeo, barrelMat);
            barrel.rotation.z = Math.PI / 2;
            barrel.position.set(0.25, baseH + topH * 0.5, 0);
            barrel.castShadow = true;
            group.add(barrel);
        } else if (tower.type === 'ice') {
            // Crystal on top
            const crystalGeo = new THREE.OctahedronGeometry(0.15, 0);
            const crystalMat = new THREE.MeshStandardMaterial({
                color: 0xaaeeff,
                transparent: true,
                opacity: 0.8,
                metalness: 0.4,
                roughness: 0.1,
            });
            const crystal = new THREE.Mesh(crystalGeo, crystalMat);
            crystal.position.y = baseH + topH + 0.15;
            crystal.castShadow = true;
            group.add(crystal);
        }

        group.position.set(tower.worldX, 0, tower.worldZ);
        return group;
    }

    removeTower(id: number): void {
        const group = this.meshes.get(id);
        if (group) {
            this.scene.remove(group);
            this.meshes.delete(id);
        }
    }
}
