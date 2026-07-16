// 3D 卡面 — 開波時離屏影低每張卡嘅模型，做卡牌圖示
import * as THREE from 'three';
import { TEAM } from './constants.js';
import { CARDS } from './cards.js';
import { makeUnitModel, makeProjectile } from './models.js';

export function generateCardThumbs() {
    const SIZE = 220;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(SIZE, SIZE);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xdfeaf5, 0x9a9a80, 1.0));
    const key = new THREE.DirectionalLight(0xfff2d8, 2.2);
    key.position.set(2.5, 3.5, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd8ff, 0.9);
    rim.position.set(-2.5, 2, -2.5);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    const thumbs = {};
    const box = new THREE.Box3();
    const sphere = new THREE.Sphere();
    const viewDir = new THREE.Vector3(0.62, 0.5, 1).normalize();

    function buildSubject(id) {
        const card = CARDS[id];
        if (card.kind === 'spell') {
            if (id === 'fireball') {
                const g = makeProjectile('fireball');
                g.scale.setScalar(1.5);
                return g;
            }
            if (id === 'freeze') {
                // 冰晶：藍白六角錐簇
                const g = new THREE.Group();
                const ice = new THREE.MeshLambertMaterial({ color: 0xbfe8ff, emissive: 0x2a5a80 });
                const spikes = [[0, 0.5, 0, 0.55], [0.28, 0.3, 0.1, 0.35], [-0.25, 0.28, -0.08, 0.3], [0.05, 0.25, -0.28, 0.28]];
                for (const [x, h, z, r] of spikes) {
                    const s = new THREE.Mesh(new THREE.ConeGeometry(r * 0.4, h * 1.6, 6), ice);
                    s.position.set(x, h * 0.7, z);
                    s.rotation.z = x * 0.5;
                    g.add(s);
                }
                return g;
            }
            if (id === 'powderkeg') {
                // 炸藥桶＋引信
                const g = new THREE.Group();
                const barrel = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.32, 0.32, 0.5, 12),
                    new THREE.MeshLambertMaterial({ color: 0x7a4a22 })
                );
                g.add(barrel);
                for (const y of [-0.16, 0.16]) {
                    const hoop = new THREE.Mesh(
                        new THREE.TorusGeometry(0.33, 0.025, 6, 16),
                        new THREE.MeshLambertMaterial({ color: 0x3a3a3a })
                    );
                    hoop.rotation.x = Math.PI / 2;
                    hoop.position.y = y;
                    g.add(hoop);
                }
                const spark = new THREE.Mesh(
                    new THREE.SphereGeometry(0.07, 8, 6),
                    new THREE.MeshBasicMaterial({ color: 0xffcc44 })
                );
                spark.position.set(0.12, 0.38, 0);
                g.add(spark);
                return g;
            }
            // 箭雨：三支箭散開
            const g = new THREE.Group();
            for (let i = -1; i <= 1; i++) {
                const a = makeProjectile('arrow');
                a.scale.setScalar(2.2);
                a.position.set(i * 0.35, i === 0 ? 0.25 : 0, 0);
                a.rotation.set(Math.PI / 2.6, 0, i * 0.28);
                g.add(a);
            }
            return g;
        }
        return makeUnitModel(id, TEAM.PLAYER);
    }

    for (const id of Object.keys(CARDS)) {
        const subject = buildSubject(id);
        // 模型統一面向 +z，鏡頭喺 +z 側；轉 -32° 側少少面向鏡頭
        subject.rotation.y = CARDS[id].kind === 'spell' ? Math.PI * 0.82 : -Math.PI * 0.18;
        // 行兩次令 mixer 有 dt 可以套用 idle pose
        subject.userData.animate?.(0.1, { moving: false, attackT: -1 });
        subject.userData.animate?.(0.65, { moving: false, attackT: -1 });
        scene.add(subject);

        box.setFromObject(subject);
        box.getBoundingSphere(sphere);
        // 距離要夠遠先可以完整擺低個 bounding sphere（半頂角 fov/2），
        // 唔係好似之前咁 sphere 半徑大過個視錐可視範圍，令高瘦/闊嘅模型（例如戰象嘅戰塔／旗）批去畫面外
        const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
        const dist = sphere.radius / Math.sin(halfFov) * 1.14; // 加 14% 邊界緩衝
        camera.position.copy(viewDir).multiplyScalar(dist).add(sphere.center);
        camera.lookAt(sphere.center);

        renderer.render(scene, camera);
        thumbs[id] = renderer.domElement.toDataURL('image/png');
        scene.remove(subject);
        // 注意：唔好喺度 dispose subject——GLB 模型嘅 geometry 同 mat() 快取材質
        // 係同正式戰場上嘅單位「共享」嘅，dispose 咗會令遊戲中重新上傳 GPU 資源。
        // 縮圖模型嘅殘留係一次性、好細，由 GC 處理 JS 部分就夠。
    }

    renderer.dispose();
    renderer.forceContextLoss?.();
    return thumbs;
}
