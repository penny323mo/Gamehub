import * as THREE from 'three';
import type { GameState, TowerType, Tower } from '../core/types';
import { TOWERS } from '../core/config';
import { cellToWorld } from '../core/path';

// Colour palettes per tower type
const TOWER_COLORS: Record<TowerType, number> = {
    arrow: 0x8b6914,
    cannon: 0x555555,
    ice: 0x66ccff,
    fire: 0xff5500,
    lightning: 0xffee00,
    poison: 0x66ff33,
    sniper: 0x333399,
};

const ACCENT_COLORS: Record<TowerType, number> = {
    arrow: 0xddaa33,
    cannon: 0x888888,
    ice: 0xaaeeff,
    fire: 0xff8844,
    lightning: 0xffffaa,
    poison: 0xaaff77,
    sniper: 0x6666cc,
};

export class TowerRenderer {
    private scene: THREE.Scene;
    private meshes = new Map<number, THREE.Group>();
    private rangeRing: THREE.Mesh | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    sync(state: GameState): void {
        const activeTowerIds = new Set(state.towers.map(t => t.id));

        // Remove towers no longer present
        for (const [id, group] of this.meshes) {
            if (!activeTowerIds.has(id)) {
                this.scene.remove(group);
                this.meshes.delete(id);
            }
        }

        // Add / update towers
        for (const tower of state.towers) {
            if (!this.meshes.has(tower.id)) {
                const group = this.createTowerMesh(tower);
                this.scene.add(group);
                this.meshes.set(tower.id, group);
            }
        }
    }

    removeTower(id: number): void {
        const group = this.meshes.get(id);
        if (group) {
            this.scene.remove(group);
            this.meshes.delete(id);
        }
    }

    showRange(tower: Tower, range: number): void {
        if (!this.rangeRing) {
            const geo = new THREE.RingGeometry(0.95, 1.0, 48);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
                depthWrite: false,
            });
            this.rangeRing = new THREE.Mesh(geo, mat);
            this.rangeRing.rotation.x = -Math.PI / 2;
            this.scene.add(this.rangeRing);
        }
        this.rangeRing.scale.set(range, range, 1);
        this.rangeRing.position.set(tower.worldX, 0.02, tower.worldZ);
        this.rangeRing.visible = true;
    }

    hideRange(): void {
        if (this.rangeRing) this.rangeRing.visible = false;
    }

    private createTowerMesh(tower: Tower): THREE.Group {
        const group = new THREE.Group();
        const pos = cellToWorld(tower.col, tower.row);
        group.position.set(pos.x, 0, pos.z);

        const baseColor = TOWER_COLORS[tower.type];
        const accentColor = ACCENT_COLORS[tower.type];
        const scale = 1 + tower.level * 0.15;

        // Base cylinder
        const baseGeo = new THREE.CylinderGeometry(0.3 * scale, 0.38 * scale, 0.3, 8);
        const baseMat = new THREE.MeshStandardMaterial({ color: baseColor });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.15;
        baseMesh.castShadow = true;
        group.add(baseMesh);

        // Type-specific top
        switch (tower.type) {
            case 'arrow': {
                const body = new THREE.CylinderGeometry(0.12 * scale, 0.2 * scale, 0.6, 6);
                const m = new THREE.Mesh(body, new THREE.MeshStandardMaterial({ color: accentColor }));
                m.position.y = 0.6;
                m.castShadow = true;
                group.add(m);
                break;
            }
            case 'cannon': {
                const barrel = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.5, 8);
                const m = new THREE.Mesh(barrel, new THREE.MeshStandardMaterial({ color: accentColor }));
                m.position.set(0, 0.5, 0.2);
                m.rotation.x = Math.PI / 4;
                m.castShadow = true;
                group.add(m);
                break;
            }
            case 'ice': {
                const crystal = new THREE.OctahedronGeometry(0.22 * scale);
                const m = new THREE.Mesh(crystal, new THREE.MeshStandardMaterial({
                    color: accentColor, transparent: true, opacity: 0.8
                }));
                m.position.y = 0.65;
                m.castShadow = true;
                group.add(m);
                break;
            }
            case 'fire': {
                const cone = new THREE.ConeGeometry(0.18 * scale, 0.5, 6);
                const m = new THREE.Mesh(cone, new THREE.MeshStandardMaterial({
                    color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 0.3
                }));
                m.position.y = 0.6;
                m.castShadow = true;
                group.add(m);
                // Inner flame
                const inner = new THREE.ConeGeometry(0.1 * scale, 0.35, 6);
                const m2 = new THREE.Mesh(inner, new THREE.MeshStandardMaterial({
                    color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.5
                }));
                m2.position.y = 0.55;
                group.add(m2);
                break;
            }
            case 'lightning': {
                const top = new THREE.TetrahedronGeometry(0.22 * scale);
                const m = new THREE.Mesh(top, new THREE.MeshStandardMaterial({
                    color: accentColor, emissive: 0xffee00, emissiveIntensity: 0.4
                }));
                m.position.y = 0.65;
                m.castShadow = true;
                group.add(m);
                break;
            }
            case 'poison': {
                const sphere = new THREE.SphereGeometry(0.2 * scale, 8, 8);
                const m = new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({
                    color: 0x44cc22, transparent: true, opacity: 0.75,
                    emissive: 0x33aa00, emissiveIntensity: 0.2
                }));
                m.position.y = 0.6;
                m.castShadow = true;
                group.add(m);
                break;
            }
            case 'sniper': {
                const body = new THREE.CylinderGeometry(0.06 * scale, 0.12 * scale, 0.8, 4);
                const m = new THREE.Mesh(body, new THREE.MeshStandardMaterial({ color: accentColor }));
                m.position.y = 0.7;
                m.castShadow = true;
                group.add(m);
                // Scope
                const scope = new THREE.SphereGeometry(0.08 * scale, 6, 6);
                const m2 = new THREE.Mesh(scope, new THREE.MeshStandardMaterial({ color: 0xaa0000 }));
                m2.position.y = 1.0;
                group.add(m2);
                break;
            }
        }

        // Level indicator pips on base
        for (let i = 0; i <= tower.level; i++) {
            const pip = new THREE.SphereGeometry(0.04, 4, 4);
            const pm = new THREE.Mesh(pip, new THREE.MeshBasicMaterial({ color: 0xffffff }));
            pm.position.set(-0.15 + i * 0.15, 0.32, 0.35);
            group.add(pm);
        }

        return group;
    }
}
