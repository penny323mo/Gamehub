// 戰場場景 — 質感草地、兵線路徑、木柵欄、山丘樹林、動態水面（AoE 風格）
import * as THREE from 'three';
import { ARENA } from './constants.js';
import { mat } from './models.js';
import { instantiate, normalizeHeight, scaleToFit, ASSETS } from './assets.js';
import { meshyTint } from './models.js';
import { TEAM_COLORS, TEAM } from './constants.js';

function rng(seed) {
    let s = seed;
    return () => {
        s = (s * 16807 + 12345) % 2147483647;
        return (s & 0xffff) / 0xffff;
    };
}

// ---------- 草地質感（連兵線路徑、塔底磨損）----------
function makeArenaTexture() {
    const W = 1024, H = 1820; // 18 x 32 比例
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const px = (x) => ((x + ARENA.halfW) / (ARENA.halfW * 2)) * W;
    const pz = (z) => ((z + ARENA.halfL) / (ARENA.halfL * 2)) * H;

    // 底色
    g.fillStyle = '#71a350';
    g.fillRect(0, 0, W, H);

    const random = rng(9241);
    // 大片深淺草斑
    for (let i = 0; i < 260; i++) {
        const r = 25 + random() * 85;
        g.fillStyle = random() < 0.5
            ? `rgba(88,140,60,${0.05 + random() * 0.09})`
            : `rgba(140,180,95,${0.04 + random() * 0.08})`;
        g.beginPath();
        g.arc(random() * W, random() * H, r, 0, Math.PI * 2);
        g.fill();
    }
    // 割草紋（橫向淡條）
    for (let y = 0; y < H; y += 114) {
        g.fillStyle = 'rgba(255,255,255,0.035)';
        g.fillRect(0, y, W, 57);
    }

    // 兵線路徑（兩條直路，由橋去到王塔前）
    function path(points, width) {
        for (let i = 0; i < points.length - 1; i++) {
            const [x0, z0] = points[i], [x1, z1] = points[i + 1];
            const steps = Math.ceil(Math.hypot(px(x1) - px(x0), pz(z1) - pz(z0)) / 9);
            for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                const x = px(x0 + (x1 - x0) * t) + (random() - 0.5) * 14;
                const y = pz(z0 + (z1 - z0) * t) + (random() - 0.5) * 14;
                const r = width * (0.82 + random() * 0.36);
                g.fillStyle = `rgba(190,160,110,${0.16 + random() * 0.1})`;
                g.beginPath();
                g.arc(x, y, r, 0, Math.PI * 2);
                g.fill();
            }
        }
    }
    for (const s of [-1, 1]) {
        path([[s * ARENA.bridgeX, -14.2], [s * ARENA.bridgeX, 14.2]], 34);
        // 兩邊連去王塔
        path([[s * ARENA.bridgeX, 12.2], [s * 0.9, 13.6]], 26);
        path([[s * ARENA.bridgeX, -12.2], [s * 0.9, -13.6]], 26);
    }
    // 塔底磨損圈
    for (const [tx, tz, r] of [
        [-4.5, 10.5, 66], [4.5, 10.5, 66], [0, 13.5, 92],
        [-4.5, -10.5, 66], [4.5, -10.5, 66], [0, -13.5, 92],
    ]) {
        for (let i = 0; i < 22; i++) {
            g.fillStyle = `rgba(175,150,105,${0.05 + random() * 0.06})`;
            g.beginPath();
            g.arc(px(tx) + (random() - 0.5) * r, pz(tz) + (random() - 0.5) * r, 14 + random() * 22, 0, Math.PI * 2);
            g.fill();
        }
    }
    // 微粒草點
    for (let i = 0; i < 5200; i++) {
        g.fillStyle = random() < 0.5
            ? `rgba(60,105,40,${0.1 + random() * 0.14})`
            : `rgba(165,200,110,${0.08 + random() * 0.12})`;
        const s = 1 + random() * 2.4;
        g.fillRect(random() * W, random() * H, s, s);
    }
    // 邊緣輕微暗角
    const vg = g.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.62);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(30,50,20,0.16)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

// ---------- 外圍草坪質感 ----------
function makeMeadowTexture() {
    const S = 512;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    g.fillStyle = '#5c8a43';
    g.fillRect(0, 0, S, S);
    const random = rng(5511);
    for (let i = 0; i < 90; i++) {
        g.fillStyle = random() < 0.5
            ? `rgba(70,115,48,${0.06 + random() * 0.1})`
            : `rgba(115,155,80,${0.05 + random() * 0.09})`;
        g.beginPath();
        g.arc(random() * S, random() * S, 18 + random() * 55, 0, Math.PI * 2);
        g.fill();
    }
    for (let i = 0; i < 1400; i++) {
        g.fillStyle = `rgba(50,85,35,${0.08 + random() * 0.12})`;
        const s = 1 + random() * 2;
        g.fillRect(random() * S, random() * S, s, s);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 5);
    return tex;
}

// ---------- 水面泡沫質感 ----------
function makeFoamTexture() {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = S; c.height = S;
    const g = c.getContext('2d');
    g.clearRect(0, 0, S, S);
    const random = rng(7777);
    for (let i = 0; i < 46; i++) {
        g.strokeStyle = `rgba(255,255,255,${0.25 + random() * 0.3})`;
        g.lineWidth = 1.5 + random() * 2;
        g.beginPath();
        const y = random() * S;
        const x = random() * S;
        const len = 20 + random() * 55;
        g.moveTo(x, y);
        g.bezierCurveTo(x + len * 0.3, y - 4, x + len * 0.7, y + 4, x + len, y);
        g.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 1);
    return tex;
}

export function buildArena(scene) {
    const random = rng(20260704);

    // ----- 燈光 -----
    const hemi = new THREE.HemisphereLight(0xcfe4f5, 0x8aa060, 0.85);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffeecf, 1.9);
    sun.position.set(-14, 26, 12);
    // 日照 mood：0=正午 1=黃昏（加時觸發），update() 慢慢過渡
    const moodState = { current: 0, target: 0 };
    const daySun = new THREE.Color(0xffeecf), duskSun = new THREE.Color(0xffab5e);
    const daySky = new THREE.Color(0xcfe4f5), duskSky = new THREE.Color(0xe0b294);
    const dayGnd = new THREE.Color(0x8aa060), duskGnd = new THREE.Color(0x7a5f44);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.camera.far = 70;
    sun.shadow.bias = -0.0004;
    sun.shadow.radius = 4;
    scene.add(sun);

    // ----- 主戰場草地 -----
    const field = new THREE.Mesh(
        new THREE.PlaneGeometry(ARENA.halfW * 2 + 0.6, ARENA.halfL * 2 + 0.6),
        new THREE.MeshLambertMaterial({ map: makeArenaTexture() })
    );
    field.rotation.x = -Math.PI / 2;
    field.position.y = 0;
    field.receiveShadow = true;
    scene.add(field);

    // 戰場微微升起嘅土台邊
    const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(ARENA.halfW * 2 + 1.4, 0.5, ARENA.halfL * 2 + 1.4),
        new THREE.MeshLambertMaterial({ color: 0x8a6f47 })
    );
    plinth.position.y = -0.26;
    scene.add(plinth);

    // ----- 外圍草坪 -----
    const meadow = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 200),
        new THREE.MeshLambertMaterial({ map: makeMeadowTexture() })
    );
    meadow.rotation.x = -Math.PI / 2;
    meadow.position.y = -0.06;
    meadow.receiveShadow = true;
    scene.add(meadow);

    // ----- 木柵欄圍場（AoE palisade）-----
    {
        const posts = [];
        const hw = ARENA.halfW + 0.55, hl = ARENA.halfL + 0.55;
        const step = 0.46;
        for (let x = -hw; x <= hw; x += step) {
            posts.push([x, -hl], [x, hl]);
        }
        for (let z = -hl + step; z <= hl - step; z += step) {
            posts.push([-hw, z], [hw, z]);
        }
        const shaftGeo = new THREE.CylinderGeometry(0.13, 0.16, 1.0, 6);
        const tipGeo = new THREE.ConeGeometry(0.13, 0.3, 6);
        const woodMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const shafts = new THREE.InstancedMesh(shaftGeo, woodMat, posts.length);
        const tips = new THREE.InstancedMesh(tipGeo, woodMat, posts.length);
        shafts.castShadow = true;
        const m = new THREE.Matrix4();
        const col = new THREE.Color();
        posts.forEach(([x, z], i) => {
            const h = 0.9 + random() * 0.25;
            const jx = x + (random() - 0.5) * 0.06;
            const jz = z + (random() - 0.5) * 0.06;
            m.makeScale(1, h, 1);
            m.setPosition(jx, h * 0.5 - 0.05, jz);
            shafts.setMatrixAt(i, m);
            m.makeScale(1, 1, 1);
            m.setPosition(jx, h - 0.05 + 0.15, jz);
            tips.setMatrixAt(i, m);
            col.setHSL(0.075, 0.38, 0.3 + random() * 0.12);
            shafts.setColorAt(i, col);
            tips.setColorAt(i, col);
        });
        scene.add(shafts, tips);
    }

    // ----- 河流 -----
    const riverW = ARENA.halfW * 2 + 1.2;
    const waterDeep = new THREE.Mesh(
        new THREE.BoxGeometry(riverW, 0.34, ARENA.riverHalf * 2),
        new THREE.MeshLambertMaterial({ color: 0x3a76ae })
    );
    waterDeep.position.set(0, -0.14, 0);
    scene.add(waterDeep);
    const waterTop = new THREE.Mesh(
        new THREE.PlaneGeometry(riverW, ARENA.riverHalf * 2 - 0.12),
        new THREE.MeshLambertMaterial({ color: 0x5b9cd0, transparent: true, opacity: 0.85 })
    );
    waterTop.rotation.x = -Math.PI / 2;
    waterTop.position.y = 0.025;
    scene.add(waterTop);
    // 流動泡沫層
    const foamTex = makeFoamTexture();
    const foam = new THREE.Mesh(
        new THREE.PlaneGeometry(riverW, ARENA.riverHalf * 2 - 0.2),
        new THREE.MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.5, depthWrite: false })
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.y = 0.045;
    scene.add(foam);

    // 河岸沙邊
    for (const s of [-1, 1]) {
        const bank = new THREE.Mesh(
            new THREE.PlaneGeometry(riverW, 0.55),
            new THREE.MeshLambertMaterial({ color: 0xc9b184 })
        );
        bank.rotation.x = -Math.PI / 2;
        bank.position.set(0, 0.012, s * (ARENA.riverHalf + 0.18));
        scene.add(bank);
    }
    // 岸邊白泡沫線：一條幼白邊喺水同沙交界，脈動＋輕微拍岸位移，即刻有「水係郁緊」嘅感覺
    const shoreFoams = [];
    for (const s of [-1, 1]) {
        const line = new THREE.Mesh(
            new THREE.PlaneGeometry(riverW - 0.3, 0.14),
            new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.5, depthWrite: false })
        );
        line.rotation.x = -Math.PI / 2;
        line.position.set(0, 0.05, s * (ARENA.riverHalf - 0.1));
        line.renderOrder = 3;
        scene.add(line);
        shoreFoams.push({ mesh: line, side: s, baseZ: s * (ARENA.riverHalf - 0.1) });
    }
    // 水面漂流閃光：幾粒好細嘅白光沿河飄，各自唔同相位
    const sparkles = [];
    for (let i = 0; i < 8; i++) {
        const sp = new THREE.Mesh(
            new THREE.PlaneGeometry(0.34, 0.07),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
        );
        sp.rotation.x = -Math.PI / 2;
        sp.rotation.z = (random() - 0.5) * 0.5;
        sp.position.set((random() - 0.5) * (riverW - 2), 0.055, (random() - 0.5) * (ARENA.riverHalf * 1.5));
        sp.renderOrder = 3;
        scene.add(sp);
        sparkles.push({ mesh: sp, speed: 0.5 + random() * 0.7, phase: random() * Math.PI * 2 });
    }
    // 河岸石
    for (let x = -ARENA.halfW; x <= ARENA.halfW; x += 0.95) {
        if (Math.abs(Math.abs(x) - ARENA.bridgeX) < ARENA.bridgeHalfW + 0.35) continue;
        for (const s of [-1, 1]) {
            const st = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.16 + random() * 0.14, 0),
                mat(random() < 0.5 ? 0x9a948a : 0x878178)
            );
            st.position.set(x + (random() - 0.5) * 0.5, 0.07, s * (ARENA.riverHalf + 0.06 + random() * 0.18));
            st.rotation.set(random() * 2, random() * 2, random() * 2);
            st.castShadow = true;
            scene.add(st);
        }
    }

    // ----- 木橋（拱形少少）-----
    for (const s of [-1, 1]) {
        const bx = s * ARENA.bridgeX;
        const bridge = new THREE.Group();
        const deckLen = ARENA.riverHalf * 2 + 1.1;
        // 拱形橋面：用幾塊板砌
        const planks = 9;
        for (let i = 0; i < planks; i++) {
            const t = i / (planks - 1);
            const z = (t - 0.5) * deckLen;
            const lift = Math.sin(t * Math.PI) * 0.18;
            const plank = new THREE.Mesh(
                new THREE.BoxGeometry(ARENA.bridgeHalfW * 2, 0.09, deckLen / planks + 0.05),
                mat(i % 2 ? 0x9a6b3c : 0x8d6136)
            );
            plank.position.set(0, 0.12 + lift, z);
            plank.rotation.x = -Math.cos(t * Math.PI) * 0.16;
            plank.castShadow = true;
            plank.receiveShadow = true;
            bridge.add(plank);
        }
        // 欄杆
        for (const rs of [-1, 1]) {
            for (const pz of [-deckLen / 2 + 0.15, 0, deckLen / 2 - 0.15]) {
                const lift = Math.sin(((pz / deckLen) + 0.5) * Math.PI) * 0.18;
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.5, 6), mat(0x6a4a28));
                post.position.set(rs * (ARENA.bridgeHalfW - 0.08), 0.3 + lift, pz);
                post.castShadow = true;
                bridge.add(post);
            }
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, deckLen), mat(0x7a5530));
            rail.position.set(rs * (ARENA.bridgeHalfW - 0.08), 0.56, 0);
            bridge.add(rail);
        }
        // 橋墩
        for (const ps of [-1, 1]) {
            const pier = new THREE.Mesh(new THREE.BoxGeometry(ARENA.bridgeHalfW * 2 + 0.3, 0.4, 0.5), mat(0x8d857a));
            pier.position.set(0, 0.02, ps * (ARENA.riverHalf + 0.35));
            bridge.add(pier);
        }
        bridge.position.set(bx, 0, 0);
        scene.add(bridge);
    }

    // ----- 樹（Quaternius 松樹 + 圓樹）-----
    const greens = [0x3f7a30, 0x468538, 0x568f3d, 0x35682a];
    function plantTree(x, z, scale) {
        const key = random() < 0.45 ? 'pine' : (random() < 0.5 ? 'tree1' : 'tree2');
        const tree = instantiate(key);
        normalizeHeight(tree, (1.6 + random() * 1.2) * scale);
        tree.position.set(x, 0, z);
        tree.rotation.y = random() * Math.PI * 2;
        scene.add(tree);
    }
    // 左右樹林
    for (let i = 0; i < 34; i++) {
        const side = random() < 0.5 ? -1 : 1;
        plantTree(
            side * (ARENA.halfW + 1.6 + random() * 5),
            -ARENA.halfL - 3 + random() * (ARENA.halfL * 2 + 6),
            0.9 + random() * 1.1
        );
    }
    // 上下樹林
    for (let i = 0; i < 14; i++) {
        const s = random() < 0.5 ? -1 : 1;
        plantTree(
            -ARENA.halfW - 2 + random() * (ARENA.halfW * 2 + 4),
            s * (ARENA.halfL + 1.8 + random() * 3.5),
            0.9 + random() * 0.9
        );
    }

    // ----- 山丘 + 遠山 -----
    for (const [hx, hz, hr] of [
        [-18, -10, 7], [17, 6, 6], [-16, 12, 5.5], [18, -14, 7.5], [-19, 2, 6],
    ]) {
        const hill = new THREE.Mesh(
            new THREE.SphereGeometry(hr, 10, 7),
            new THREE.MeshLambertMaterial({ color: 0x548040 })
        );
        hill.position.set(hx, -hr * 0.72, hz);
        hill.scale.y = 0.55;
        scene.add(hill);
    }
    for (const [mx, mz, mh] of [
        [-26, -22, 9], [-12, -30, 12], [8, -32, 10], [24, -24, 8], [30, -8, 9], [-30, 6, 8],
    ]) {
        const mtn = instantiate('mountain');
        normalizeHeight(mtn, mh);
        mtn.position.set(mx, -0.4, mz);
        mtn.rotation.y = random() * Math.PI * 2;
        scene.add(mtn);
    }

    // ----- Meshy 場景件（玩家提供）-----
    function placeMeshy(key, color, x, z, size, rotY = 0) {
        const m = meshyTint(instantiate(key), color);
        scaleToFit(key, m, size);
        m.position.x = x;
        m.position.z = z;
        m.rotation.y = rotY;
        scene.add(m);
        return m;
    }
    // 軍旗：兩邊橋頭各插一支（隊色）
    for (const bs of [-1, 1]) {
        const bx = bs * ARENA.bridgeX;
        placeMeshy('meshyBanner', TEAM_COLORS[TEAM.PLAYER].main, bx + 1.9, ARENA.riverHalf + 1.1, 1.6, Math.PI);
        placeMeshy('meshyBanner', TEAM_COLORS[TEAM.ENEMY].main, bx - 1.9, -(ARENA.riverHalf + 1.1), 1.6, 0);
    }
    // 橋頭石：橋兩邊河岸散石
    for (const bs of [-1, 1]) {
        for (const side of [-1, 1]) {
            placeMeshy('meshyBridgeStones', 0x9a948a,
                bs * ARENA.bridgeX + bs * 1.4, side * (ARENA.riverHalf + 0.7), 0.8, random() * Math.PI);
        }
    }
    // 雜物堆：兩邊王塔側
    for (const s of [-1, 1]) {
        placeMeshy('meshyProps', 0x8a6f47, -3.4, s * 13.6, 1.6, random() * Math.PI);
    }
    // 燒焦木材：戰場中路開戰痕跡
    placeMeshy('meshyDebris', 0x4a413a, -1.8, 4.2, 1.1, random() * Math.PI);
    placeMeshy('meshyDebris', 0x4a413a, 2.2, -4.6, 1.1, random() * Math.PI);
    placeMeshy('meshyDebris', 0x453c35, 7.4, 2.6, 0.9, random() * Math.PI);

    // ----- 木箱酒桶（王塔附近軍營味）-----
    for (const s of [-1, 1]) {
        const crate = instantiate('crate');
        normalizeHeight(crate, 0.55);
        crate.position.set(2.6, 0, s * 14.4);
        crate.rotation.y = random();
        scene.add(crate);
        const barrel = instantiate('barrel');
        normalizeHeight(barrel, 0.55);
        barrel.position.set(3.3, 0, s * 13.9);
        scene.add(barrel);
        const crate2 = instantiate('crate');
        normalizeHeight(crate2, 0.42);
        crate2.position.set(-2.8, 0, s * 14.3);
        crate2.rotation.y = random() * 2;
        scene.add(crate2);
    }

    // ----- 灌木 / 花 / 石 點綴（戰場內外）-----
    for (let i = 0; i < 26; i++) {
        const x = (random() - 0.5) * 16.5;
        let z = (random() - 0.5) * 29;
        if (Math.abs(z) < 2.6) continue;
        if (Math.abs(Math.abs(x) - ARENA.bridgeX) < 1.6) continue;
        if (Math.hypot(Math.abs(x) - 4.5, Math.abs(z) - 10.5) < 2.2) continue;
        if (Math.hypot(x, Math.abs(z) - 13.5) < 2.6) continue;
        const kind = random();
        if (kind < 0.4) {
            const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2 + random() * 0.16, 0), mat(greens[Math.floor(random() * greens.length)]));
            bush.position.set(x, 0.14, z);
            bush.castShadow = true;
            scene.add(bush);
        } else if (kind < 0.75) {
            const flower = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 5, 4),
                mat(random() < 0.5 ? 0xe8d84a : 0xe87a6a)
            );
            flower.position.set(x, 0.1, z);
            scene.add(flower);
        } else {
            const rock = instantiate(random() < 0.5 ? 'rock1' : 'rock2');
            normalizeHeight(rock, 0.3 + random() * 0.3);
            rock.position.set(x, 0, z);
            rock.rotation.y = random() * Math.PI * 2;
            scene.add(rock);
        }
    }

    // ----- 部署提示層 -----
    const zoneMat = new THREE.MeshBasicMaterial({
        color: 0x4a90d8, transparent: true, opacity: 0.18, depthWrite: false,
    });
    const zones = {
        own: new THREE.Mesh(new THREE.PlaneGeometry(ARENA.halfW * 2, ARENA.halfL - ARENA.riverHalf), zoneMat),
        pocketL: new THREE.Mesh(new THREE.PlaneGeometry(ARENA.halfW, ARENA.halfL - ARENA.riverHalf - 5.5), zoneMat),
        pocketR: new THREE.Mesh(new THREE.PlaneGeometry(ARENA.halfW, ARENA.halfL - ARENA.riverHalf - 5.5), zoneMat),
    };
    zones.own.rotation.x = -Math.PI / 2;
    zones.own.position.set(0, 0.06, (ARENA.halfL + ARENA.riverHalf) / 2);
    zones.pocketL.rotation.x = -Math.PI / 2;
    zones.pocketL.position.set(-ARENA.halfW / 2, 0.06, -(ARENA.riverHalf + 9) / 2);
    zones.pocketR.rotation.x = -Math.PI / 2;
    zones.pocketR.position.set(ARENA.halfW / 2, 0.06, -(ARENA.riverHalf + 9) / 2);
    for (const z of Object.values(zones)) {
        z.visible = false;
        z.renderOrder = 5;
        scene.add(z);
    }

    // 每幀動畫：水面流動＋岸邊泡沫拍岸＋漂流閃光＋日照過渡
    function update(dt) {
        if (Math.abs(moodState.current - moodState.target) > 0.001) {
            moodState.current += (moodState.target - moodState.current) * Math.min(1, dt * 0.55);
            const m = moodState.current;
            sun.color.lerpColors(daySun, duskSun, m);
            sun.intensity = 1.9 - m * 0.35;
            sun.position.set(-14, 26 - m * 11, 12 - m * 5); // 太陽降低，影拉長
            hemi.color.lerpColors(daySky, duskSky, m);
            hemi.groundColor.lerpColors(dayGnd, duskGnd, m);
            hemi.intensity = 0.85 - m * 0.14;
        }
        foamTex.offset.x -= dt * 0.045;
        const now = performance.now();
        foam.material.opacity = 0.42 + Math.sin(now * 0.0012) * 0.1;
        for (const f of shoreFoams) {
            f.mesh.position.z = f.baseZ - f.side * (Math.sin(now * 0.0016 + f.side) * 0.5 + 0.5) * 0.09;
            f.mesh.material.opacity = 0.3 + (Math.sin(now * 0.0016 + f.side) * 0.5 + 0.5) * 0.32;
        }
        for (const sp of sparkles) {
            sp.mesh.position.x -= dt * sp.speed;
            if (sp.mesh.position.x < -(ARENA.halfW + 0.4)) sp.mesh.position.x = ARENA.halfW + 0.4;
            sp.mesh.material.opacity = Math.max(0, Math.sin(now * 0.003 + sp.phase)) * 0.7;
        }
    }

    return { zones, update, setMood: (m) => { moodState.target = m; } };
}
