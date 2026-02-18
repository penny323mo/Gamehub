import * as THREE from 'three';
import { MAP } from '../core/config';
import { cellToWorld } from '../core/path';
import type { TowerType } from '../core/types';

const GHOST_COLORS: Record<string, number> = {
    valid: 0x44ff44,
    invalid: 0xff4444,
};

export class Picking {
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    private ghostMesh: THREE.Mesh | null = null;
    private rangeRing: THREE.Mesh | null = null;
    private scene: THREE.Scene;

    hoveredCol = -1;
    hoveredRow = -1;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    updateMouse(event: MouseEvent | TouchEvent, camera: THREE.Camera): void {
        let clientX: number, clientY: number;

        if ('touches' in event) {
            if (event.touches.length === 0) return;
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.groundPlane, intersection);

        if (intersection) {
            const col = Math.floor((intersection.x - MAP.origin.x) / MAP.cellSize);
            const row = Math.floor((intersection.z - MAP.origin.z) / MAP.cellSize);

            if (col >= 0 && col < MAP.cols && row >= 0 && row < MAP.rows) {
                this.hoveredCol = col;
                this.hoveredRow = row;
            } else {
                this.hoveredCol = -1;
                this.hoveredRow = -1;
            }
        }
    }

    showGhost(col: number, row: number, valid: boolean, _towerType: TowerType, range?: number): void {
        if (!this.ghostMesh) {
            const geo = new THREE.CylinderGeometry(0.35, 0.4, 0.5, 8);
            const mat = new THREE.MeshBasicMaterial({
                transparent: true,
                opacity: 0.4,
                depthWrite: false,
            });
            this.ghostMesh = new THREE.Mesh(geo, mat);
            this.scene.add(this.ghostMesh);
        }

        const pos = cellToWorld(col, row);
        this.ghostMesh.position.set(pos.x, 0.25, pos.z);
        this.ghostMesh.visible = true;
        (this.ghostMesh.material as THREE.MeshBasicMaterial).color.setHex(
            valid ? GHOST_COLORS.valid : GHOST_COLORS.invalid
        );

        // Range ring preview
        if (range && range > 0) {
            if (!this.rangeRing) {
                const ringGeo = new THREE.RingGeometry(0.95, 1.0, 48);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0x44ff88,
                    transparent: true,
                    opacity: 0.2,
                    side: THREE.DoubleSide,
                    depthWrite: false,
                });
                this.rangeRing = new THREE.Mesh(ringGeo, ringMat);
                this.rangeRing.rotation.x = -Math.PI / 2;
                this.scene.add(this.rangeRing);
            }
            this.rangeRing.scale.set(range, range, 1);
            this.rangeRing.position.set(pos.x, 0.02, pos.z);
            this.rangeRing.visible = true;
            (this.rangeRing.material as THREE.MeshBasicMaterial).color.setHex(
                valid ? 0x44ff88 : 0xff6644
            );
        } else {
            if (this.rangeRing) this.rangeRing.visible = false;
        }
    }

    hideGhost(): void {
        if (this.ghostMesh) {
            this.ghostMesh.visible = false;
        }
        if (this.rangeRing) {
            this.rangeRing.visible = false;
        }
    }
}
