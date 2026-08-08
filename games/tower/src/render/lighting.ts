import * as THREE from 'three';
import { MAP, GRAPHICS } from '../core/config';

export interface LightingRig {
    update(elapsedSec: number): void;
}

// 燈嘅強度係**量出嚟**嘅，唔係揀個靚數。
//
// 本來成塊地係 emissive 嘅程序方塊，自己會發光，所以幾暗嘅燈都睇得見。
// 換咗 Kenney 嘅純 albedo 模型之後，全部光都要靠呢度畀。**但要講清楚**：
// 換完之後成幅畫平均亮度得 3.8/255 嗰次，成因唔喺呢度，係啲 GLB 寫住
// `metalness = 1`（見 `assets.ts` 嘅 `修材質`）。加大三倍燈只係去到 14.9。
// 呢度啲數係修好材質之後先至量返出嚟嘅，`tests/look.mjs` 守住個結果。
export function setupLighting(scene: THREE.Scene): LightingRig {
    const cx = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
    const cz = MAP.origin.z + MAP.rows * MAP.cellSize / 2;

    scene.fog = new THREE.FogExp2(GRAPHICS.atmosphere.fogColor, GRAPHICS.atmosphere.fogDensity);

    const hemi = new THREE.HemisphereLight(0xe8fbe0, 0x2b4433, 1.35);
    scene.add(hemi);

    const ambient = new THREE.AmbientLight(0x3d6650, 0.42);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xfff4d6, 2.0);
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

    const fill = new THREE.DirectionalLight(0xa8d4e6, 0.65);
    fill.position.set(cx - 13, 10, cz + 9);
    fill.target.position.set(cx, 0, cz);
    scene.add(fill);
    scene.add(fill.target);

    const rim = new THREE.DirectionalLight(0xb6f7da, 0.40);
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

            dir.intensity = 1.95 + Math.sin(elapsedSec * 0.35) * 0.08;
            fill.intensity = 0.62 + Math.sin(elapsedSec * 0.27 + 1.5) * 0.04;
            rim.intensity = 0.38 + Math.sin(elapsedSec * 0.41 + 0.3) * 0.03;
        },
    };
}
