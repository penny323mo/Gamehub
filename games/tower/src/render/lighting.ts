import * as THREE from 'three';
import { MAP } from '../core/config';

export function setupLighting(scene: THREE.Scene): void {
    const cx = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
    const cz = MAP.origin.z + MAP.rows * MAP.cellSize / 2;

    // Hemisphere light for ambient fill
    const hemi = new THREE.HemisphereLight(0xffeedd, 0x334422, 0.6);
    scene.add(hemi);

    // Directional light with shadows
    const dir = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dir.position.set(cx + 8, 15, cz - 5);
    dir.target.position.set(cx, 0, cz);
    dir.castShadow = true;

    // Shadow settings
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 50;
    dir.shadow.camera.left = -15;
    dir.shadow.camera.right = 15;
    dir.shadow.camera.top = 15;
    dir.shadow.camera.bottom = -15;
    dir.shadow.bias = -0.001;

    scene.add(dir);
    scene.add(dir.target);
}
