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
    private time = 0;

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

    animate(dt: number, state: GameState): void {
        this.time += dt;
        for (const tower of state.towers) {
            const group = this.meshes.get(tower.id);
            if (!group) continue;

            const parts = group.userData;

            // Detect attack for scale bump
            if (tower.cooldownRemaining > parts.lastCooldown) {
                // Cooldown reset usually means it fired
                parts.attackTimer = 0.15;
            }
            parts.lastCooldown = tower.cooldownRemaining;

            // Attack bump animation
            if (parts.attackTimer > 0) {
                parts.attackTimer -= dt;
                const t = Math.max(0, parts.attackTimer / 0.15); // 1 to 0
                const bump = 1.0 + t * 0.15; // 1.15 max
                group.scale.set(bump, bump, bump);
            } else {
                group.scale.set(1, 1, 1);
            }

            // Idle animations based on type
            switch (tower.type) {
                case 'ice':
                    if (parts.crystal) parts.crystal.rotation.y += dt * 0.8;
                    break;
                case 'lightning':
                    if (parts.top) {
                        parts.top.rotation.y += dt * 2.0;
                        parts.top.position.y = 0.65 + Math.sin(this.time * 5) * 0.05;
                    }
                    break;
                case 'fire':
                    if (parts.cone1 && parts.cone2) {
                        parts.cone1.rotation.y += dt * 1.5;
                        parts.cone2.rotation.y -= dt * 2.0;
                        const pulse = 1.0 + Math.sin(this.time * 8) * 0.05;
                        parts.cone1.scale.set(pulse, 1, pulse);
                    }
                    break;
                case 'poison':
                    if (parts.sphere) {
                        const pulse = 1.0 + Math.sin(this.time * 3) * 0.1;
                        parts.sphere.scale.set(pulse, pulse, pulse);
                    }
                    break;
                case 'sniper':
                    if (parts.scope) {
                        parts.scope.position.y = 1.0 + Math.sin(this.time * 2) * 0.02;
                    }
                    break;
            }
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

        // Base definition
        const baseGroup = new THREE.Group();
        const baseGeo = new THREE.CylinderGeometry(0.3 * scale, 0.38 * scale, 0.2, 8);
        const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.7 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.1;
        baseMesh.castShadow = true;
        baseGroup.add(baseMesh);

        const rimGeo = new THREE.CylinderGeometry(0.32 * scale, 0.32 * scale, 0.05, 8);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9, metalness: 0.5 });
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        rimMesh.position.y = 0.225;
        rimMesh.castShadow = true;
        baseGroup.add(rimMesh);

        group.add(baseGroup);

        // Type-specific top
        switch (tower.type) {
            case 'arrow': {
                const body = new THREE.CylinderGeometry(0.12 * scale, 0.2 * scale, 0.5, 6);
                const m = new THREE.Mesh(body, new THREE.MeshStandardMaterial({ color: accentColor }));
                m.position.y = 0.5;
                m.castShadow = true;
                group.add(m);

                // Crossbow arms
                const armGeo = new THREE.BoxGeometry(0.6 * scale, 0.04 * scale, 0.08 * scale);
                const arms = new THREE.Mesh(armGeo, new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
                arms.position.y = 0.75;
                arms.position.z = 0.1;
                arms.castShadow = true;
                group.add(arms);

                // Arrow
                const arrGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 4);
                const arrGeoHead = new THREE.ConeGeometry(0.04, 0.1, 4);
                const arrMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });

                const arrowPole = new THREE.Mesh(arrGeo, arrMat);
                arrowPole.rotation.x = Math.PI / 2;
                arrowPole.position.set(0, 0.8, 0);

                const arrowHead = new THREE.Mesh(arrGeoHead, arrMat);
                arrowHead.rotation.x = Math.PI / 2;
                arrowHead.position.set(0, 0.8, 0.25);

                group.add(arrowPole);
                group.add(arrowHead);
                break;
            }
            case 'cannon': {
                const turretGeo = new THREE.SphereGeometry(0.25 * scale, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
                const turret = new THREE.Mesh(turretGeo, new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.6, roughness: 0.4 }));
                turret.position.y = 0.25;
                turret.castShadow = true;
                group.add(turret);

                // Barrel
                const barrelGeo = new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 0.6 * scale, 8);
                const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 }));
                barrel.position.set(0, 0.45, 0.25);
                barrel.rotation.x = Math.PI / 4;
                barrel.castShadow = true;
                group.add(barrel);

                // Muzzle ring
                const ringGeo = new THREE.TorusGeometry(0.1 * scale, 0.03 * scale, 6, 12);
                const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 }));
                ring.position.set(0, 0.65, 0.45);
                ring.rotation.x = Math.PI / 4;
                group.add(ring);
                break;
            }
            case 'ice': {
                const crystalMat = new THREE.MeshPhysicalMaterial({
                    color: accentColor,
                    transmission: 0.9,
                    opacity: 1,
                    metalness: 0,
                    roughness: 0.1,
                    ior: 1.5,
                    thickness: 0.5,
                });
                const crystal = new THREE.OctahedronGeometry(0.25 * scale);
                const m = new THREE.Mesh(crystal, crystalMat);
                m.position.y = 0.7;
                m.castShadow = true;

                const innerCrystal = new THREE.OctahedronGeometry(0.12 * scale);
                const mInner = new THREE.Mesh(innerCrystal, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x88ccff }));
                m.add(mInner);

                group.add(m);
                group.userData.crystal = m;
                break;
            }
            case 'fire': {
                const bowlPts = [];
                for (let i = 0; i < 5; i++) {
                    bowlPts.push(new THREE.Vector2(0.25 * scale + Math.sin(i * 0.5) * 0.05, i * 0.1));
                }
                const bowlGeo = new THREE.LatheGeometry(bowlPts, 8);
                const bowl = new THREE.Mesh(bowlGeo, new THREE.MeshStandardMaterial({ color: 0x331100, roughness: 0.9 }));
                bowl.position.y = 0.25;
                bowl.castShadow = true;
                group.add(bowl);

                const cone = new THREE.ConeGeometry(0.2 * scale, 0.6, 6);
                const m = new THREE.Mesh(cone, new THREE.MeshStandardMaterial({
                    color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 0.5, transparent: true, opacity: 0.9
                }));
                m.position.y = 0.65;
                m.castShadow = true;
                group.add(m);

                // Inner flame
                const inner = new THREE.ConeGeometry(0.1 * scale, 0.4, 6);
                const m2 = new THREE.Mesh(inner, new THREE.MeshStandardMaterial({
                    color: 0xffaa00, emissive: 0xffdd00, emissiveIntensity: 0.8
                }));
                m2.position.y = 0.6;
                group.add(m2);
                group.userData.cone1 = m;
                group.userData.cone2 = m2;
                break;
            }
            case 'lightning': {
                // Coil body
                const coilGeo = new THREE.CylinderGeometry(0.08 * scale, 0.15 * scale, 0.5 * scale, 8);
                const coil = new THREE.Mesh(coilGeo, new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.8 }));
                coil.position.y = 0.5;
                group.add(coil);

                // Rings
                for (let r = 0; r < 3; r++) {
                    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15 * scale, 0.02 * scale, 4, 12), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9 }));
                    ring.position.y = 0.4 + r * 0.15;
                    ring.rotation.x = Math.PI / 2;
                    group.add(ring);
                }

                const top = new THREE.IcosahedronGeometry(0.2 * scale);
                const m = new THREE.Mesh(top, new THREE.MeshStandardMaterial({
                    color: accentColor, emissive: 0xffee00, emissiveIntensity: 0.6, wireframe: true
                }));
                m.position.y = 0.85;
                group.add(m);

                const innerTop = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 * scale), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1 }));
                m.add(innerTop);

                group.userData.top = m;
                break;
            }
            case 'poison': {
                const flaskPts = [
                    new THREE.Vector2(0.15 * scale, 0),
                    new THREE.Vector2(0.25 * scale, 0.2 * scale),
                    new THREE.Vector2(0.25 * scale, 0.4 * scale),
                    new THREE.Vector2(0.1 * scale, 0.6 * scale),
                    new THREE.Vector2(0.1 * scale, 0.8 * scale),
                    new THREE.Vector2(0.15 * scale, 0.85 * scale)
                ];
                const flaskGeo = new THREE.LatheGeometry(flaskPts, 12);
                const flaskMat = new THREE.MeshPhysicalMaterial({
                    color: 0xffffff, transmission: 0.8, opacity: 1, roughness: 0.1, ior: 1.5, side: THREE.DoubleSide
                });
                const flask = new THREE.Mesh(flaskGeo, flaskMat);
                flask.position.y = 0.25;
                group.add(flask);

                // Liquid inside
                const liquidGeo = new THREE.CylinderGeometry(0.2 * scale, 0.22 * scale, 0.4 * scale, 12);
                const m = new THREE.Mesh(liquidGeo, new THREE.MeshStandardMaterial({
                    color: 0x33cc11, transparent: true, opacity: 0.85, emissive: 0x22aa00, emissiveIntensity: 0.3
                }));
                m.position.y = 0.45;
                group.add(m);
                group.userData.sphere = m; // keep name 'sphere' so animation works
                break;
            }
            case 'sniper': {
                const legsGroup = new THREE.Group();
                for (let i = 0; i < 3; i++) {
                    const legGeo = new THREE.CylinderGeometry(0.02 * scale, 0.02 * scale, 0.6 * scale, 4);
                    const leg = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0x555555 }));
                    leg.position.set(Math.cos(i * Math.PI * 2 / 3) * 0.15, 0.3, Math.sin(i * Math.PI * 2 / 3) * 0.15);
                    leg.rotation.x = -Math.sin(i * Math.PI * 2 / 3) * 0.3;
                    leg.rotation.z = Math.cos(i * Math.PI * 2 / 3) * 0.3;
                    legsGroup.add(leg);
                }
                legsGroup.position.y = 0.25;
                group.add(legsGroup);

                const body = new THREE.BoxGeometry(0.1 * scale, 0.15 * scale, 0.4 * scale);
                const m = new THREE.Mesh(body, new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.7 }));
                m.position.set(0, 0.7, 0);
                group.add(m);

                // Barrel
                const barrelGeo = new THREE.CylinderGeometry(0.03 * scale, 0.04 * scale, 0.8 * scale, 6);
                const barrel = new THREE.Mesh(barrelGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
                barrel.rotation.x = Math.PI / 2;
                barrel.position.set(0, 0.7, 0.4);
                group.add(barrel);

                // Scope
                const scopeGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.3 * scale, 8);
                const scope = new THREE.Mesh(scopeGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
                scope.rotation.x = Math.PI / 2;
                scope.position.set(0.08 * scale, 0.8, 0.1);
                group.add(scope);

                group.userData.scope = scope;
                break;
            }
        }

        group.userData.lastCooldown = tower.cooldownRemaining;
        group.userData.attackTimer = 0;

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
