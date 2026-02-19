import * as THREE from 'three';
import { MAP } from '../core/config';

export function setupLighting(scene: THREE.Scene): void {
    const cx = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
    const cz = MAP.origin.z + MAP.rows * MAP.cellSize / 2;

    // ── Fog ── exponential fog for atmosphere
    scene.fog = new THREE.FogExp2(0x1a2a1a, 0.022);

    // ── Hemisphere light ── warm sky / cool ground
    const hemi = new THREE.HemisphereLight(0xffeedd, 0x223311, 0.7);
    scene.add(hemi);

    // ── Main directional light with shadows ──
    const dir = new THREE.DirectionalLight(0xfff5e6, 1.2);
    dir.position.set(cx + 8, 15, cz - 5);
    dir.target.position.set(cx, 0, cz);
    dir.castShadow = true;
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

    // ── Fill light ── cool blue from opposite side
    const fill = new THREE.DirectionalLight(0x8899cc, 0.3);
    fill.position.set(cx - 10, 8, cz + 8);
    fill.target.position.set(cx, 0, cz);
    scene.add(fill);
    scene.add(fill.target);

    // ── Spawn point light ── pulsing blue
    const spawnLight = new THREE.PointLight(0x5599ff, 2, 8, 1.5);
    const spawnPos = MAP.spawnCell;
    spawnLight.position.set(
        MAP.origin.x + spawnPos[0] * MAP.cellSize + MAP.cellSize / 2,
        1.5,
        MAP.origin.z + spawnPos[1] * MAP.cellSize + MAP.cellSize / 2
    );
    scene.add(spawnLight);

    // ── Goal point light ── pulsing red
    const goalLight = new THREE.PointLight(0xff5555, 2, 8, 1.5);
    const goalPos = MAP.goalCell;
    goalLight.position.set(
        MAP.origin.x + goalPos[0] * MAP.cellSize + MAP.cellSize / 2,
        1.5,
        MAP.origin.z + goalPos[1] * MAP.cellSize + MAP.cellSize / 2
    );
    scene.add(goalLight);

    // ── Ambient rim ── subtle low ambient for shadow areas
    const ambient = new THREE.AmbientLight(0x334455, 0.15);
    scene.add(ambient);
}
