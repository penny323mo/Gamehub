// 戰場場景 — 草地、河流、木橋、裝飾（AoE 風格）
import * as THREE from 'three';
import { ARENA } from './constants.js';
import { mat } from './models.js';

function rng(seed) {
    let s = seed;
    return () => {
        s = (s * 16807 + 12345) % 2147483647;
        return (s & 0xffff) / 0xffff;
    };
}

export function buildArena(scene) {
    const random = rng(20260704);

    // ----- 燈光 -----
    scene.add(new THREE.AmbientLight(0xbfd4e8, 0.75));
    const sun = new THREE.DirectionalLight(0xfff2d8, 1.25);
    sun.position.set(-12, 24, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // ----- 草地（棋盤格微差色）-----
    const groundGroup = new THREE.Group();
    const tile = 2;
    const g1 = new THREE.MeshLambertMaterial({ color: 0x5d9142 });
    const g2 = new THREE.MeshLambertMaterial({ color: 0x558a3c });
    const tileGeo = new THREE.PlaneGeometry(tile, tile);
    for (let ix = -ARENA.halfW; ix < ARENA.halfW; ix += tile) {
        for (let iz = -ARENA.halfL; iz < ARENA.halfL; iz += tile) {
            const m = new THREE.Mesh(tileGeo, ((ix + iz) / tile) % 2 === 0 ? g1 : g2);
            m.rotation.x = -Math.PI / 2;
            m.position.set(ix + tile / 2, 0, iz + tile / 2);
            m.receiveShadow = true;
            groundGroup.add(m);
        }
    }
    scene.add(groundGroup);

    // 場外泥土邊
    const dirt = new THREE.Mesh(
        new THREE.PlaneGeometry(ARENA.halfW * 2 + 90, ARENA.halfL * 2 + 90),
        new THREE.MeshLambertMaterial({ color: 0x8a7248 })
    );
    dirt.rotation.x = -Math.PI / 2;
    dirt.position.y = -0.05;
    dirt.receiveShadow = true;
    scene.add(dirt);

    // ----- 河流 -----
    const river = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA.halfW * 2 + 2, 0.3, ARENA.riverHalf * 2),
        new THREE.MeshLambertMaterial({ color: 0x3878b8 })
    );
    river.position.set(0, -0.12, 0);
    scene.add(river);
    const riverTop = new THREE.Mesh(
        new THREE.PlaneGeometry(ARENA.halfW * 2 + 2, ARENA.riverHalf * 2),
        new THREE.MeshLambertMaterial({ color: 0x4a8ecc, transparent: true, opacity: 0.9 })
    );
    riverTop.rotation.x = -Math.PI / 2;
    riverTop.position.y = 0.02;
    scene.add(riverTop);
    // 河岸石
    for (let x = -ARENA.halfW; x <= ARENA.halfW; x += 1.1) {
        if (Math.abs(Math.abs(x) - ARENA.bridgeX) < ARENA.bridgeHalfW + 0.3) continue;
        for (const s of [-1, 1]) {
            const st = new THREE.Mesh(
                new THREE.BoxGeometry(0.5 + random() * 0.3, 0.18, 0.35),
                mat(0x8f8a80)
            );
            st.position.set(x + (random() - 0.5) * 0.4, 0.08, s * (ARENA.riverHalf + 0.1));
            st.rotation.y = random();
            st.castShadow = true;
            scene.add(st);
        }
    }

    // ----- 木橋（兩條）-----
    for (const s of [-1, 1]) {
        const bx = s * ARENA.bridgeX;
        const bridge = new THREE.Group();
        const deck = new THREE.Mesh(
            new THREE.BoxGeometry(ARENA.bridgeHalfW * 2, 0.15, ARENA.riverHalf * 2 + 0.9),
            mat(0x9a6b3c)
        );
        deck.position.y = 0.1;
        deck.castShadow = true;
        deck.receiveShadow = true;
        bridge.add(deck);
        // 板紋
        for (let i = -3; i <= 3; i++) {
            const plank = new THREE.Mesh(
                new THREE.BoxGeometry(ARENA.bridgeHalfW * 2 + 0.06, 0.03, 0.12),
                mat(0x7a5230)
            );
            plank.position.set(0, 0.19, i * 0.5);
            bridge.add(plank);
        }
        // 欄杆
        for (const rs of [-1, 1]) {
            const rail = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.08, ARENA.riverHalf * 2 + 0.9),
                mat(0x6a4a28)
            );
            rail.position.set(rs * (ARENA.bridgeHalfW - 0.05), 0.42, 0);
            bridge.add(rail);
            for (const pz of [-1.4, 0, 1.4]) {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.1), mat(0x6a4a28));
                post.position.set(rs * (ARENA.bridgeHalfW - 0.05), 0.25, pz);
                bridge.add(post);
            }
        }
        bridge.position.set(bx, 0, 0);
        scene.add(bridge);
    }

    // ----- 裝飾：樹、石 -----
    function makeTree(x, z, scale) {
        const t = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.5, 6), mat(0x6a4a28));
        trunk.position.y = 0.25;
        trunk.castShadow = true;
        t.add(trunk);
        let y = 0.6;
        for (const r of [0.45, 0.35, 0.24]) {
            const layer = new THREE.Mesh(new THREE.ConeGeometry(r, 0.5, 7), mat(0x3f7a30));
            layer.position.y = y;
            layer.castShadow = true;
            t.add(layer);
            y += 0.32;
        }
        t.scale.setScalar(scale);
        t.position.set(x, 0, z);
        t.rotation.y = random() * Math.PI;
        scene.add(t);
    }
    // 場外圍一圈樹
    for (let i = 0; i < 26; i++) {
        const side = random() < 0.5 ? -1 : 1;
        const x = side * (ARENA.halfW + 0.8 + random() * 3);
        const z = -ARENA.halfL - 2 + random() * (ARENA.halfL * 2 + 4);
        makeTree(x, z, 0.9 + random() * 0.9);
    }
    for (let i = 0; i < 8; i++) {
        const x = -ARENA.halfW + random() * ARENA.halfW * 2;
        const s = random() < 0.5 ? -1 : 1;
        makeTree(x, s * (ARENA.halfL + 1 + random() * 2.5), 0.9 + random() * 0.8);
    }
    // 場內幾舊石
    for (let i = 0; i < 6; i++) {
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.2 + random() * 0.2, 0),
            mat(0x8f8a80)
        );
        const x = (random() - 0.5) * 14;
        let z = (random() - 0.5) * 26;
        if (Math.abs(z) < 2.5) z = z < 0 ? -3 : 3;
        if (Math.abs(Math.abs(x) - ARENA.bridgeX) < 2 && Math.abs(z) < 5) continue;
        rock.position.set(x, 0.1, z);
        rock.castShadow = true;
        scene.add(rock);
    }

    // ----- 部署提示層（隱藏，落卡時先顯示）-----
    const zoneMat = new THREE.MeshBasicMaterial({
        color: 0x4a90d8, transparent: true, opacity: 0.18, depthWrite: false,
    });
    const zones = {
        own: new THREE.Mesh(new THREE.PlaneGeometry(ARENA.halfW * 2, ARENA.halfL - ARENA.riverHalf), zoneMat),
        pocketL: new THREE.Mesh(new THREE.PlaneGeometry(ARENA.halfW, ARENA.halfL - ARENA.riverHalf - 5.5), zoneMat),
        pocketR: new THREE.Mesh(new THREE.PlaneGeometry(ARENA.halfW, ARENA.halfL - ARENA.riverHalf - 5.5), zoneMat),
    };
    zones.own.rotation.x = -Math.PI / 2;
    zones.own.position.set(0, 0.05, (ARENA.halfL + ARENA.riverHalf) / 2);
    zones.pocketL.rotation.x = -Math.PI / 2;
    zones.pocketL.position.set(-ARENA.halfW / 2, 0.05, -(ARENA.riverHalf + 9) / 2);
    zones.pocketR.rotation.x = -Math.PI / 2;
    zones.pocketR.position.set(ARENA.halfW / 2, 0.05, -(ARENA.riverHalf + 9) / 2);
    for (const z of Object.values(zones)) {
        z.visible = false;
        z.renderOrder = 5;
        scene.add(z);
    }

    return { zones };
}
