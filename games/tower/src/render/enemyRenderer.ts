import * as THREE from 'three';
import type { GameState, EnemyType, Enemy } from '../core/types';
import { GRAPHICS } from '../core/config';

interface EnemyPartDef {
    geo: THREE.BufferGeometry;
    mat: THREE.Material;
    offset: THREE.Vector3;
    rotation?: THREE.Euler;
    scale?: THREE.Vector3;
}

function buildEnemyConfigs(): Record<EnemyType, EnemyPartDef[]> {
    const configs: Record<EnemyType, EnemyPartDef[]> = {} as any;

    // Helpers to swap materials on mobile
    const MaterialClass = GRAPHICS.isMobile ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial;

    // Grunt: 身體（capsule）+ 頭（sphere）
    const gruntBody = new THREE.CapsuleGeometry(0.12, 0.2, 4, 8);
    const gruntHead = new THREE.SphereGeometry(0.14, 8, 8);
    const gruntMat = new MaterialClass({ color: 0xee8833, ...(GRAPHICS.isMobile ? {} : { roughness: 0.8 }) });
    const gruntHeadMat = new MaterialClass({ color: 0xffaa55, ...(GRAPHICS.isMobile ? {} : { roughness: 0.6 }) });
    configs.grunt = [
        { geo: gruntBody, mat: gruntMat, offset: new THREE.Vector3(0, 0.2, 0) },
        { geo: gruntHead, mat: gruntHeadMat, offset: new THREE.Vector3(0, 0.45, 0.05) }
    ];

    // Tank: 龜殼（半球扁平）+ 腳 + 頭
    const tankShell = new THREE.SphereGeometry(0.3, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const tankMat = new MaterialClass({ color: 0x9944cc, ...(GRAPHICS.isMobile ? {} : { roughness: 0.9, metalness: 0.2 }) });
    const tankHeadMat = new MaterialClass({ color: 0x7722aa });
    const tankHead = new THREE.SphereGeometry(0.15, 8, 8);
    configs.tank = [
        { geo: tankShell, mat: tankMat, offset: new THREE.Vector3(0, 0.2, 0), scale: new THREE.Vector3(1, 0.6, 1.2) },
        { geo: tankHead, mat: tankHeadMat, offset: new THREE.Vector3(0, 0.2, 0.35) }
    ];

    // Runner: 流線形身體 (Cone)
    const runnerBody = new THREE.ConeGeometry(0.15, 0.4, 6);
    const runnerMat = new MaterialClass({ color: 0x33cc55, ...(GRAPHICS.isMobile ? {} : { roughness: 0.5 }) });
    configs.runner = [
        { geo: runnerBody, mat: runnerMat, offset: new THREE.Vector3(0, 0.2, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) }
    ];

    // Swarm: 小蟲形：翅膀（plane）+ 身體（小 capsule）
    const swarmBody = new THREE.CapsuleGeometry(0.06, 0.15, 4, 6);
    const swarmWing = new THREE.PlaneGeometry(0.3, 0.15);
    const swarmMat = new MaterialClass({ color: 0x996633 });
    const wingMat = new MaterialClass({ color: 0xdddddd, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
    configs.swarm = [
        { geo: swarmBody, mat: swarmMat, offset: new THREE.Vector3(0, 0.3, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) },
        { geo: swarmWing, mat: wingMat, offset: new THREE.Vector3(0, 0.35, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) }
    ];

    // Shield: 核心球 + 外層半透明能量盾 ring
    const shieldCore = new THREE.DodecahedronGeometry(0.15);
    const shieldRing = new THREE.TorusGeometry(0.25, 0.05, 6, 12);
    const shieldCoreMat = new MaterialClass({ color: 0x1155cc });
    const shieldRingMat = new MaterialClass({ color: 0x3388ff, transparent: true, opacity: 0.7, emissive: 0x114488 });
    configs.shield = [
        { geo: shieldCore, mat: shieldCoreMat, offset: new THREE.Vector3(0, 0.3, 0) },
        { geo: shieldRing, mat: shieldRingMat, offset: new THREE.Vector3(0, 0.3, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) }
    ];

    // Healer: 十字形 + 光環
    const healerV = new THREE.BoxGeometry(0.1, 0.3, 0.1);
    const healerH = new THREE.BoxGeometry(0.3, 0.1, 0.1);
    const healerRing = new THREE.TorusGeometry(0.2, 0.03, 6, 12);
    const healerMat = new MaterialClass({ color: 0xff77aa });
    const healerRingMat = new MaterialClass({ color: 0xffffee, emissive: 0xffaaaa });
    configs.healer = [
        { geo: healerV, mat: healerMat, offset: new THREE.Vector3(0, 0.3, 0) },
        { geo: healerH, mat: healerMat, offset: new THREE.Vector3(0, 0.3, 0) },
        { geo: healerRing, mat: healerRingMat, offset: new THREE.Vector3(0, 0.5, 0), rotation: new THREE.Euler(Math.PI / 2, 0, 0) }
    ];

    // Boss: 巨大複合體：帶角頭盔 + 厚甲 + 發光眼
    const bossBody = new THREE.CapsuleGeometry(0.3, 0.5, 6, 12);
    const bossMat = new MaterialClass({ color: 0xaa1111, ...(GRAPHICS.isMobile ? {} : { metalness: 0.5, roughness: 0.6 }) });
    const bossEye = new THREE.BoxGeometry(0.3, 0.08, 0.1);
    const bossEyeMat = new MaterialClass({ color: 0x222222, emissive: 0xffaa00, ...(GRAPHICS.isMobile ? {} : { emissiveIntensity: 1 }) });
    const bossHorn = new THREE.ConeGeometry(0.08, 0.3, 4);
    const bossHornMat = new MaterialClass({ color: 0xeeeeee });
    configs.boss = [
        { geo: bossBody, mat: bossMat, offset: new THREE.Vector3(0, 0.5, 0) },
        { geo: bossEye, mat: bossEyeMat, offset: new THREE.Vector3(0, 0.65, 0.3) },
        { geo: bossHorn, mat: bossHornMat, offset: new THREE.Vector3(0.15, 0.85, 0.15), rotation: new THREE.Euler(Math.PI / 4, 0, -Math.PI / 6) },
        { geo: bossHorn, mat: bossHornMat, offset: new THREE.Vector3(-0.15, 0.85, 0.15), rotation: new THREE.Euler(Math.PI / 4, 0, Math.PI / 6) },
    ];

    return configs;
}

const ENEMY_PARTS = buildEnemyConfigs();

const MAX_PER_TYPE = 100;
const HP_BAR_WIDTH = 0.5;

export class EnemyRenderer {
    private scene: THREE.Scene;
    private instancedMeshGroups = new Map<EnemyType, THREE.InstancedMesh[]>();
    private hpBars: THREE.Mesh[] = [];
    private shieldBars: THREE.Mesh[] = [];
    private hpBarBg: THREE.Mesh[] = [];
    private dummy = new THREE.Object3D();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
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

                for (let p = 0; p < parts.length; p++) {
                    const part = parts[p];
                    this.dummy.position.set(e.worldX, 0, e.worldZ);
                    this.dummy.position.add(part.offset);

                    this.dummy.rotation.set(0, moveRot, 0); // Face movement direction
                    if (part.rotation) {
                        this.dummy.rotation.x += part.rotation.x;
                        this.dummy.rotation.y += part.rotation.y;
                        this.dummy.rotation.z += part.rotation.z;
                    }
                    if (type === 'swarm' && p === 1) { // wing part
                        const time = performance.now() * 0.001;
                        this.dummy.rotation.z += Math.sin(time * 30 + e.id) * 0.5;
                    }
                    if (part.scale) {
                        this.dummy.scale.copy(part.scale);
                    } else {
                        this.dummy.scale.set(1, 1, 1);
                    }

                    this.dummy.updateMatrix();
                    meshes[p].setMatrixAt(i, this.dummy.matrix);
                }

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
            for (const mesh of meshes) {
                mesh.instanceMatrix.needsUpdate = true;
            }
        }
    }
}
