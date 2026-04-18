import * as THREE from 'three';
import { MAP, GRAPHICS } from '../core/config';

export interface LightingRig {
    update(elapsedSec: number): void;
}

export function setupLighting(scene: THREE.Scene): LightingRig {
    const cx = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
    const cz = MAP.origin.z + MAP.rows * MAP.cellSize / 2;

    scene.fog = new THREE.FogExp2(GRAPHICS.atmosphere.fogColor, GRAPHICS.atmosphere.fogDensity);

    const hemi = new THREE.HemisphereLight(0xd7f0c1, 0x06150d, 0.8);
    scene.add(hemi);

    const ambient = new THREE.AmbientLight(0x173327, 0.24);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xfff1cc, 1.5);
    dir.position.set(cx + 10, 16, cz - 7);
    dir.target.position.set(cx, 0, cz);
    dir.castShadow = GRAPHICS.enableShadows;
    dir.shadow.mapSize.width = 2048;
    dir.shadow.mapSize.height = 2048;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 52;
    dir.shadow.camera.left = -18;
    dir.shadow.camera.right = 18;
    dir.shadow.camera.top = 16;
    dir.shadow.camera.bottom = -16;
    dir.shadow.bias = -0.0007;
    dir.shadow.normalBias = 0.02;
    dir.shadow.radius = 4;
    scene.add(dir);
    scene.add(dir.target);

    const fill = new THREE.DirectionalLight(0x7aa7b6, 0.45);
    fill.position.set(cx - 13, 10, cz + 9);
    fill.target.position.set(cx, 0, cz);
    scene.add(fill);
    scene.add(fill.target);

    const rim = new THREE.DirectionalLight(0x8be2c6, 0.3);
    rim.position.set(cx, 6, cz + 18);
    rim.target.position.set(cx, 0.4, cz);
    scene.add(rim);
    scene.add(rim.target);

    const spawnPos = MAP.spawnCell;
    const spawnLight = new THREE.PointLight(0x68d5ff, 2.4, 9, 1.6);
    spawnLight.position.set(
        MAP.origin.x + spawnPos[0] * MAP.cellSize + MAP.cellSize / 2,
        1.6,
        MAP.origin.z + spawnPos[1] * MAP.cellSize + MAP.cellSize / 2
    );
    scene.add(spawnLight);

    const goalPos = MAP.goalCell;
    const goalLight = new THREE.PointLight(0xff7f5c, 2.1, 9, 1.7);
    goalLight.position.set(
        MAP.origin.x + goalPos[0] * MAP.cellSize + MAP.cellSize / 2,
        1.6,
        MAP.origin.z + goalPos[1] * MAP.cellSize + MAP.cellSize / 2
    );
    scene.add(goalLight);

    return {
        update(elapsedSec: number): void {
            const spawnPulse = 1.9 + Math.sin(elapsedSec * GRAPHICS.atmosphere.spawnPulseSpeed) * 0.55;
            const goalPulse = 1.7 + Math.sin(elapsedSec * GRAPHICS.atmosphere.goalPulseSpeed + 1.2) * 0.45;
            spawnLight.intensity = spawnPulse;
            goalLight.intensity = goalPulse;

            spawnLight.position.y = 1.55 + Math.sin(elapsedSec * 1.7) * 0.08;
            goalLight.position.y = 1.55 + Math.sin(elapsedSec * 1.35 + 0.8) * 0.08;

            dir.intensity = 1.42 + Math.sin(elapsedSec * 0.35) * 0.05;
            fill.intensity = 0.43 + Math.sin(elapsedSec * 0.27 + 1.5) * 0.03;
            rim.intensity = 0.28 + Math.sin(elapsedSec * 0.41 + 0.3) * 0.02;
        },
    };
}
