import * as THREE from 'three';
import { MAP } from '../core/config';
import { cellToWorld } from '../core/path';

// ─── Colors ───
const COLOR_BUILDABLE = 0x4a7c59;
const COLOR_PATH = 0xc9a96e;
const COLOR_GRID_LINE = 0x3a6a49;
const COLOR_SPAWN = 0x5599ff;
const COLOR_GOAL = 0xff5555;

export class SceneManager {
    scene: THREE.Scene;
    groundMeshes: THREE.Mesh[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a2a1a);
    }

    buildGround(): void {
        const { cols, rows, cellSize, origin } = MAP;
        const pathCells = new Set<string>();
        for (const [c, r] of MAP.path) {
            pathCells.add(`${c},${r}`);
        }

        const spawnKey = `${MAP.spawnCell[0]},${MAP.spawnCell[1]}`;
        const goalKey = `${MAP.goalCell[0]},${MAP.goalCell[1]}`;

        const geo = new THREE.BoxGeometry(cellSize * 0.96, 0.15, cellSize * 0.96);

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const key = `${c},${r}`;
                let color = COLOR_BUILDABLE;

                if (key === spawnKey) color = COLOR_SPAWN;
                else if (key === goalKey) color = COLOR_GOAL;
                else if (pathCells.has(key)) color = COLOR_PATH;

                const mat = new THREE.MeshStandardMaterial({
                    color,
                    roughness: 0.8,
                    metalness: 0.1,
                });

                const mesh = new THREE.Mesh(geo, mat);
                const pos = cellToWorld(c, r);
                mesh.position.set(pos.x, -0.075, pos.z);
                mesh.receiveShadow = true;
                mesh.userData = { col: c, row: r, type: 'ground' };
                this.scene.add(mesh);
                this.groundMeshes.push(mesh);
            }
        }

        // Grid base plane (slightly below tiles for gap effect)
        const baseGeo = new THREE.PlaneGeometry(cols * cellSize + 1, rows * cellSize + 1);
        const baseMat = new THREE.MeshStandardMaterial({
            color: COLOR_GRID_LINE,
            roughness: 0.9,
            metalness: 0,
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.rotation.x = -Math.PI / 2;
        base.position.set(
            origin.x + cols * cellSize / 2,
            -0.2,
            origin.z + rows * cellSize / 2
        );
        base.receiveShadow = true;
        this.scene.add(base);
    }
}
