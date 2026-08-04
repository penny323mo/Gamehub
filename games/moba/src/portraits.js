// 英雄頭像：載入完之後離屏 render 一次，出六張 PNG data URL。
//
// 點解唔喺選人畫面開一個一路轉緊嘅 3D 預覽：噉樣會同主畫面爭一個 WebGL
// context，而手機上面兩個 context 同時開住係實測會出事嘅。render 一次
// 之後就當圖用，之後零成本，而且同一張圖喺選人卡、HUD 頭像、戰後計分板
// 三個地方都用得著。

import * as THREE from '../vendor/three.module.min.js';
import { CHAMPION_LOOK, TEAM_COLOUR } from './looks.js?v=fixture-24';
import { Rig } from './rig.js?v=fixture-24';

const SIZE = 256;

export async function renderPortraits(assets, ids) {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE; canvas.height = SIZE;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setSize(SIZE, SIZE, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xdce9ff, 0x2a2416, 2.4));
    const key = new THREE.DirectionalLight(0xfff2d8, 2.6);
    key.position.set(2, 4, 5);
    const rim = new THREE.DirectionalLight(0x7fa6ff, 1.6);
    rim.position.set(-4, 2, -3);
    scene.add(key, rim);

    const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
    cam.position.set(0.9, 2.35, 4.4);
    cam.lookAt(0, 1.55, 0);

    const out = {};
    for (const id of ids) {
        const look = CHAMPION_LOOK[id];
        if (!look) continue;
        const obj = assets.unit('champ', look.model);
        obj.scale.setScalar(1.0);
        obj.rotation.y = 0.42;
        scene.add(obj);
        // 擺一個好睇嘅甫士，唔係 T-pose
        const rig = new Rig(obj, assets, look);
        const mixer = rig.mixer;
        const action = mixer.clipAction(assets.clip('Idle_Combat'));
        action.play();
        mixer.update(0.6);
        obj.updateMatrixWorld(true);

        renderer.render(scene, cam);
        out[id] = canvas.toDataURL('image/png');

        scene.remove(obj);
        rig.dispose();
        obj.traverse((o) => {
            if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose?.();
        });
    }
    renderer.dispose();
    // 拆咗個 context，唔好留住同主畫面爭
    renderer.forceContextLoss?.();
    return out;
}

export const teamTint = (team) => `#${TEAM_COLOUR[team].toString(16).padStart(6, '0')}`;
