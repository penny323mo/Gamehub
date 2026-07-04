// 低 poly 帝國時代風格 3D 模型 — 全部用基本幾何體砌
import * as THREE from 'three';
import { TEAM_COLORS } from './constants.js';

const matCache = new Map();
export function mat(color) {
    if (!matCache.has(color)) {
        matCache.set(color, new THREE.MeshLambertMaterial({ color }));
    }
    return matCache.get(color);
}

function box(w, h, d, color) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    m.castShadow = true;
    return m;
}
function cyl(rt, rb, h, color, seg = 8) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color));
    m.castShadow = true;
    return m;
}
function sphere(r, color, seg = 8) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, 6), mat(color));
    m.castShadow = true;
    return m;
}
function cone(r, h, color, seg = 8) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(color));
    m.castShadow = true;
    return m;
}

const SKIN = 0xd9a679;
const WOOD = 0x7a5230;
const WOOD_DARK = 0x5a3a20;
const STEEL = 0xb9c2c9;
const STONE = 0x9a958c;
const STONE_DARK = 0x767168;

// ---------- 人形基礎 ----------
// 高約 0.9，返回 { group, parts } 供動畫使用
function humanBase(team, tunicColor) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();

    const legL = box(0.09, 0.3, 0.11, 0x4a3a2a);
    legL.geometry.translate(0, -0.15, 0);
    legL.position.set(-0.07, 0.3, 0);
    const legR = legL.clone();
    legR.position.x = 0.07;
    g.add(legL, legR);

    const torso = box(0.26, 0.3, 0.16, tunicColor ?? c.main);
    torso.position.y = 0.45;
    g.add(torso);

    const belt = box(0.27, 0.05, 0.17, 0x3a2a1a);
    belt.position.y = 0.32;
    g.add(belt);

    const armL = box(0.07, 0.26, 0.09, tunicColor ?? c.main);
    armL.geometry.translate(0, -0.11, 0);
    armL.position.set(-0.17, 0.56, 0);
    const armR = armL.clone();
    armR.position.x = 0.17;
    g.add(armL, armR);

    const head = box(0.14, 0.14, 0.13, SKIN);
    head.position.y = 0.68;
    g.add(head);

    return { group: g, parts: { legL, legR, armL, armR, head, torso } };
}

function standardWalkAttack(parts, opts = {}) {
    const swing = opts.swing ?? 1.0;
    return (t, state) => {
        const { legL, legR, armL, armR } = parts;
        if (state.moving) {
            const s = Math.sin(t * 9) * 0.55;
            legL.rotation.x = s;
            legR.rotation.x = -s;
            armL.rotation.x = -s * 0.6;
            if (state.attackT < 0) armR.rotation.x = s * 0.6;
        } else {
            legL.rotation.x *= 0.8;
            legR.rotation.x *= 0.8;
            armL.rotation.x *= 0.8;
            if (state.attackT < 0) armR.rotation.x *= 0.8;
        }
        if (state.attackT >= 0) {
            // 攻擊揮動：0..1，先舉起後劈落
            const p = state.attackT;
            const a = p < 0.4 ? -(p / 0.4) * 1.6 : -1.6 + ((p - 0.4) / 0.6) * 2.2;
            armR.rotation.x = -a * swing;
        }
    };
}

// ---------- 各兵種 ----------
function makeMilitia(team) {
    const { group, parts } = humanBase(team, 0x8a7a4a);
    const cap = box(0.15, 0.05, 0.14, 0x6a5a3a);
    cap.position.y = 0.77;
    group.add(cap);
    const sword = box(0.03, 0.3, 0.05, STEEL);
    sword.geometry.translate(0, -0.18, 0);
    sword.position.set(0, -0.2, -0.03);
    parts.armR.add(sword);
    group.userData.animate = standardWalkAttack(parts);
    return group;
}

function makeSwordsman(team) {
    const c = TEAM_COLORS[team];
    const { group, parts } = humanBase(team);
    const helm = cyl(0.09, 0.1, 0.1, STEEL, 8);
    helm.position.y = 0.78;
    group.add(helm);
    const plume = box(0.03, 0.08, 0.1, c.accent);
    plume.position.y = 0.86;
    group.add(plume);
    const sword = box(0.04, 0.38, 0.06, STEEL);
    sword.geometry.translate(0, -0.22, 0);
    sword.position.set(0, -0.2, -0.03);
    parts.armR.add(sword);
    const shield = box(0.05, 0.28, 0.2, WOOD);
    shield.position.set(-0.06, -0.15, 0);
    parts.armL.add(shield);
    const emblem = box(0.02, 0.14, 0.1, c.accent);
    emblem.position.set(-0.03, 0, 0);
    shield.add(emblem);
    group.userData.animate = standardWalkAttack(parts);
    return group;
}

function makeArcher(team) {
    const c = TEAM_COLORS[team];
    const { group, parts } = humanBase(team, 0x4a6a3a);
    const hood = cone(0.1, 0.14, 0x3a5a2a, 6);
    hood.position.y = 0.79;
    group.add(hood);
    const bow = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.02, 6, 10, Math.PI),
        mat(WOOD_DARK)
    );
    bow.rotation.z = Math.PI / 2;
    bow.position.set(0, -0.2, -0.05);
    parts.armR.add(bow);
    const quiver = cyl(0.05, 0.05, 0.22, WOOD, 6);
    quiver.position.set(0.1, 0.5, 0.12);
    quiver.rotation.x = 0.3;
    group.add(quiver);
    const sash = box(0.28, 0.06, 0.18, c.main);
    sash.position.y = 0.5;
    group.add(sash);
    group.userData.animate = standardWalkAttack(parts, { swing: 0.7 });
    return group;
}

function makePikeman(team) {
    const c = TEAM_COLORS[team];
    const { group, parts } = humanBase(team);
    const helm = cone(0.1, 0.12, STEEL, 8);
    helm.position.y = 0.8;
    group.add(helm);
    const pike = cyl(0.02, 0.02, 0.9, WOOD, 6);
    pike.geometry.translate(0, -0.3, 0);
    pike.rotation.x = Math.PI / 2.4;
    pike.position.set(0, -0.15, -0.1);
    const tip = cone(0.04, 0.12, STEEL, 6);
    tip.position.y = -0.8;
    tip.rotation.x = Math.PI;
    pike.add(tip);
    parts.armR.add(pike);
    group.userData.animate = standardWalkAttack(parts, { swing: 0.5 });
    return group;
}

function makeKnight(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    // 馬
    const bodyM = box(0.3, 0.3, 0.75, 0x6a4a2a);
    bodyM.position.y = 0.5;
    g.add(bodyM);
    const neck = box(0.16, 0.3, 0.18, 0x6a4a2a);
    neck.position.set(0, 0.72, -0.35);
    neck.rotation.x = 0.4;
    g.add(neck);
    const headM = box(0.13, 0.14, 0.3, 0x5a3a1a);
    headM.position.set(0, 0.86, -0.5);
    g.add(headM);
    const caparison = box(0.34, 0.16, 0.7, c.main);
    caparison.position.y = 0.42;
    g.add(caparison);
    const legs = [];
    for (const [x, z] of [[-0.11, -0.28], [0.11, -0.28], [-0.11, 0.28], [0.11, 0.28]]) {
        const leg = box(0.08, 0.36, 0.08, 0x5a3a1a);
        leg.geometry.translate(0, -0.18, 0);
        leg.position.set(x, 0.38, z);
        g.add(leg);
        legs.push(leg);
    }
    const tail = box(0.06, 0.3, 0.06, 0x4a2a10);
    tail.position.set(0, 0.55, 0.4);
    tail.rotation.x = -0.5;
    g.add(tail);
    // 騎手
    const rider = new THREE.Group();
    rider.position.set(0, 0.66, 0.05);
    const torso = box(0.22, 0.28, 0.15, STEEL);
    torso.position.y = 0.14;
    rider.add(torso);
    const head = box(0.13, 0.13, 0.12, SKIN);
    head.position.y = 0.36;
    rider.add(head);
    const helm = cyl(0.085, 0.09, 0.09, STEEL, 8);
    helm.position.y = 0.45;
    rider.add(helm);
    const plume = cone(0.04, 0.14, c.accent, 6);
    plume.position.y = 0.54;
    rider.add(plume);
    const armR = box(0.06, 0.24, 0.08, STEEL);
    armR.geometry.translate(0, -0.1, 0);
    armR.position.set(0.15, 0.24, 0);
    rider.add(armR);
    const lance = cyl(0.025, 0.025, 0.8, WOOD, 6);
    lance.geometry.translate(0, -0.25, 0);
    lance.rotation.x = Math.PI / 2.2;
    lance.position.y = -0.15;
    const lTip = cone(0.05, 0.14, STEEL, 6);
    lTip.position.y = -0.72;
    lTip.rotation.x = Math.PI;
    lance.add(lTip);
    armR.add(lance);
    g.add(rider);

    g.userData.animate = (t, state) => {
        if (state.moving) {
            const s = Math.sin(t * 11);
            legs[0].rotation.x = s * 0.7;
            legs[1].rotation.x = -s * 0.7;
            legs[2].rotation.x = -s * 0.7;
            legs[3].rotation.x = s * 0.7;
            g.position.y = Math.abs(Math.sin(t * 11)) * 0.05;
        } else {
            for (const l of legs) l.rotation.x *= 0.8;
            g.position.y *= 0.8;
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
            armR.rotation.x = p < 0.4 ? (p / 0.4) * 0.9 : 0.9 - ((p - 0.4) / 0.6) * 0.9;
        } else {
            armR.rotation.x *= 0.8;
        }
    };
    return g;
}

function makeRam(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    // 木架
    const roof = box(0.55, 0.08, 1.1, WOOD);
    roof.position.y = 0.72;
    roof.rotation.z = 0;
    g.add(roof);
    const roofTop = box(0.4, 0.08, 1.1, WOOD_DARK);
    roofTop.position.y = 0.8;
    g.add(roofTop);
    for (const [x, z] of [[-0.24, -0.45], [0.24, -0.45], [-0.24, 0.45], [0.24, 0.45]]) {
        const post = box(0.07, 0.7, 0.07, WOOD_DARK);
        post.position.set(x, 0.38, z);
        g.add(post);
    }
    // 主槌（吊住嗰條大木）
    const ram = cyl(0.11, 0.11, 1.2, 0x8a6238, 8);
    ram.rotation.x = Math.PI / 2;
    ram.position.y = 0.45;
    const ramHead = cyl(0.13, 0.11, 0.15, STEEL, 8);
    ramHead.position.y = -0.65;
    ram.add(ramHead);
    g.add(ram);
    // 輪
    const wheels = [];
    for (const [x, z] of [[-0.3, -0.4], [0.3, -0.4], [-0.3, 0.4], [0.3, 0.4]]) {
        const wheel = cyl(0.16, 0.16, 0.07, WOOD_DARK, 10);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.16, z);
        g.add(wheel);
        wheels.push(wheel);
    }
    const banner = box(0.02, 0.2, 0.3, c.main);
    banner.position.set(0, 0.95, 0.3);
    g.add(banner);

    g.userData.animate = (t, state) => {
        if (state.moving) {
            for (const w of wheels) w.rotation.x = t * 6;
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
            // 主槌向前撞
            ram.position.z = p < 0.4 ? (p / 0.4) * 0.25 : 0.25 - ((p - 0.4) / 0.6) * 0.25;
            ram.position.z = -ram.position.z;
        } else {
            ram.position.z *= 0.8;
        }
    };
    return g;
}

function makeHandCannoneer(team) {
    const c = TEAM_COLORS[team];
    const { group, parts } = humanBase(team, 0x555a60);
    const hat = cyl(0.11, 0.11, 0.04, 0x3a3a3a, 8);
    hat.position.y = 0.77;
    group.add(hat);
    const hatTop = cyl(0.07, 0.07, 0.08, 0x3a3a3a, 8);
    hatTop.position.y = 0.82;
    group.add(hatTop);
    const gun = cyl(0.035, 0.045, 0.55, 0x2a2a2a, 8);
    gun.rotation.x = Math.PI / 2;
    gun.position.set(0.08, 0.55, -0.25);
    group.add(gun);
    const sash = box(0.28, 0.06, 0.18, c.main);
    sash.position.y = 0.38;
    group.add(sash);
    group.userData.animate = (t, state) => {
        standardWalkAttack(parts, { swing: 0.3 })(t, state);
        if (state.attackT >= 0 && state.attackT < 0.2) {
            gun.position.z = -0.2; // 後座力
        } else {
            gun.position.z += (-0.25 - gun.position.z) * 0.3;
        }
    };
    return group;
}

function makeCatapult(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const base = box(0.7, 0.14, 1.0, WOOD);
    base.position.y = 0.22;
    g.add(base);
    const wheels = [];
    for (const [x, z] of [[-0.38, -0.35], [0.38, -0.35], [-0.38, 0.35], [0.38, 0.35]]) {
        const wheel = cyl(0.17, 0.17, 0.08, WOOD_DARK, 10);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.17, z);
        g.add(wheel);
        wheels.push(wheel);
    }
    // 支架
    const frameL = box(0.06, 0.5, 0.06, WOOD_DARK);
    frameL.position.set(-0.2, 0.5, 0.1);
    frameL.rotation.x = 0.35;
    const frameR = frameL.clone();
    frameR.position.x = 0.2;
    g.add(frameL, frameR);
    // 投擲臂
    const arm = box(0.08, 0.08, 1.1, WOOD);
    arm.geometry.translate(0, 0, -0.4);
    arm.position.set(0, 0.55, 0.25);
    arm.rotation.x = -0.9;
    const bucket = cyl(0.12, 0.09, 0.1, WOOD_DARK, 8);
    bucket.position.set(0, 0.05, -0.85);
    arm.add(bucket);
    const rock = sphere(0.08, STONE);
    rock.position.y = 0.07;
    bucket.add(rock);
    g.add(arm);
    const banner = box(0.02, 0.25, 0.18, c.main);
    banner.position.set(0.3, 0.75, 0.4);
    g.add(banner);

    g.userData.animate = (t, state) => {
        if (state.moving) {
            for (const w of wheels) w.rotation.x = t * 4;
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
            // 臂由後拉到猛咁彈出
            arm.rotation.x = p < 0.25 ? -0.9 - (p / 0.25) * 0.3 : -1.2 + ((p - 0.25) / 0.3) * 1.5;
            if (arm.rotation.x > 0.3) arm.rotation.x = 0.3;
            rock.visible = p < 0.5;
        } else {
            arm.rotation.x += (-0.9 - arm.rotation.x) * 0.15;
            rock.visible = true;
        }
    };
    return g;
}

function makeElephant(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const bodyC = 0x8a8078;
    const body = box(0.8, 0.7, 1.15, bodyC);
    body.position.y = 0.8;
    g.add(body);
    const head = box(0.5, 0.45, 0.4, bodyC);
    head.position.set(0, 0.95, -0.72);
    g.add(head);
    // 象鼻
    const trunk = cyl(0.07, 0.1, 0.55, bodyC, 8);
    trunk.geometry.translate(0, -0.25, 0);
    trunk.position.set(0, 0.85, -0.92);
    trunk.rotation.x = 0.25;
    g.add(trunk);
    // 象牙
    for (const s of [-1, 1]) {
        const tusk = cyl(0.025, 0.045, 0.4, 0xf0ead8, 6);
        tusk.position.set(s * 0.16, 0.72, -0.92);
        tusk.rotation.x = 1.2;
        g.add(tusk);
    }
    // 耳
    for (const s of [-1, 1]) {
        const ear = box(0.06, 0.32, 0.28, 0x7a7068);
        ear.position.set(s * 0.28, 1.05, -0.6);
        g.add(ear);
    }
    const legs = [];
    for (const [x, z] of [[-0.26, -0.4], [0.26, -0.4], [-0.26, 0.4], [0.26, 0.4]]) {
        const leg = cyl(0.13, 0.15, 0.5, 0x7a7068, 8);
        leg.geometry.translate(0, -0.25, 0);
        leg.position.set(x, 0.5, z);
        g.add(leg);
        legs.push(leg);
    }
    // 戰塔
    const howdah = box(0.55, 0.3, 0.55, WOOD);
    howdah.position.y = 1.35;
    g.add(howdah);
    const drape = box(0.85, 0.35, 1.2, c.main);
    drape.position.y = 1.0;
    g.add(drape);
    const flagPole = cyl(0.02, 0.02, 0.5, WOOD_DARK, 6);
    flagPole.position.set(0, 1.7, 0.2);
    g.add(flagPole);
    const flag = box(0.02, 0.14, 0.24, c.flag);
    flag.position.set(0, 1.88, 0.32);
    g.add(flag);

    g.userData.animate = (t, state) => {
        if (state.moving) {
            const s = Math.sin(t * 5);
            legs[0].rotation.x = s * 0.4;
            legs[1].rotation.x = -s * 0.4;
            legs[2].rotation.x = -s * 0.4;
            legs[3].rotation.x = s * 0.4;
            trunk.rotation.x = 0.25 + Math.sin(t * 5) * 0.15;
        } else {
            for (const l of legs) l.rotation.x *= 0.85;
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
            // 用鼻同頭撞
            const a = p < 0.4 ? (p / 0.4) : 1 - (p - 0.4) / 0.6;
            trunk.rotation.x = 0.25 - a * 1.0;
            g.rotation.x = -a * 0.08;
        } else {
            g.rotation.x *= 0.8;
        }
    };
    return g;
}

// ---------- 建築 ----------
function crenellation(radius, y, color, n = 8) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const b = box(0.16, 0.14, 0.1, color);
        b.position.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
        b.rotation.y = -a;
        g.add(b);
    }
    return g;
}

export function makeWatchtower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const base = cyl(0.55, 0.65, 0.5, STONE_DARK, 10);
    base.position.y = 0.25;
    g.add(base);
    const shaft = cyl(0.45, 0.52, 1.1, WOOD, 10);
    shaft.position.y = 1.0;
    g.add(shaft);
    const top = cyl(0.58, 0.5, 0.3, WOOD_DARK, 10);
    top.position.y = 1.7;
    g.add(top);
    g.add(crenellation(0.5, 1.95, WOOD_DARK, 8));
    const archer = box(0.16, 0.24, 0.12, c.main);
    archer.position.y = 2.0;
    g.add(archer);
    const aHead = box(0.1, 0.1, 0.1, SKIN);
    aHead.position.y = 2.18;
    g.add(aHead);
    const flag = box(0.02, 0.12, 0.2, c.flag);
    flag.position.set(0.3, 2.1, 0);
    g.add(flag);
    g.userData.animate = () => {};
    return g;
}

export function makePrincessTower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const base = cyl(1.0, 1.15, 0.6, STONE_DARK, 12);
    base.position.y = 0.3;
    g.add(base);
    const shaft = cyl(0.8, 0.95, 1.8, STONE, 12);
    shaft.position.y = 1.5;
    g.add(shaft);
    // 石磚紋
    for (let i = 0; i < 5; i++) {
        const ring = cyl(0.86 - i * 0.03, 0.88 - i * 0.03, 0.06, STONE_DARK, 12);
        ring.position.y = 0.8 + i * 0.35;
        g.add(ring);
    }
    const top = cyl(1.05, 0.85, 0.35, STONE, 12);
    top.position.y = 2.55;
    g.add(top);
    g.add(crenellation(0.95, 2.85, STONE_DARK, 10));
    const roof = cone(0.75, 0.9, c.main, 8);
    roof.position.y = 3.2;
    g.add(roof);
    const flagPole = cyl(0.02, 0.02, 0.6, WOOD_DARK, 6);
    flagPole.position.y = 3.9;
    g.add(flagPole);
    const flag = box(0.02, 0.18, 0.35, c.flag);
    flag.position.set(0, 4.05, 0.2);
    g.add(flag);
    // 門
    const door = box(0.3, 0.5, 0.1, WOOD_DARK);
    door.position.set(0, 0.55, 1.02);
    g.add(door);
    g.userData.animate = () => {};
    return g;
}

export function makeKingTower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    // 方形主堡
    const base = box(2.6, 0.7, 2.6, STONE_DARK);
    base.position.y = 0.35;
    g.add(base);
    const keep = box(2.1, 1.9, 2.1, STONE);
    keep.position.y = 1.65;
    g.add(keep);
    // 磚縫
    for (let i = 0; i < 3; i++) {
        const band = box(2.16, 0.07, 2.16, STONE_DARK);
        band.position.y = 1.1 + i * 0.55;
        g.add(band);
    }
    const top = box(2.5, 0.35, 2.5, STONE);
    top.position.y = 2.8;
    g.add(top);
    // 四角塔樓
    for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) {
        const turret = cyl(0.32, 0.36, 1.0, STONE, 8);
        turret.position.set(x, 3.2, z);
        g.add(turret);
        const tRoof = cone(0.38, 0.5, c.main, 8);
        tRoof.position.set(x, 3.95, z);
        g.add(tRoof);
    }
    // 城齒
    for (let i = -2; i <= 2; i++) {
        for (const s of [-1, 1]) {
            const cr = box(0.28, 0.22, 0.14, STONE_DARK);
            cr.position.set(i * 0.5, 3.05, s * 1.2);
            g.add(cr);
            const cr2 = box(0.14, 0.22, 0.28, STONE_DARK);
            cr2.position.set(s * 1.2, 3.05, i * 0.5);
            g.add(cr2);
        }
    }
    // 中央王旗
    const flagPole = cyl(0.03, 0.03, 1.2, WOOD_DARK, 6);
    flagPole.position.y = 3.6;
    g.add(flagPole);
    const flag = box(0.03, 0.3, 0.6, c.flag);
    flag.position.set(0, 4.0, 0.33);
    g.add(flag);
    // 門
    const doorFrame = box(0.7, 0.9, 0.15, STONE_DARK);
    doorFrame.position.set(0, 0.8, 1.05);
    g.add(doorFrame);
    const door = box(0.5, 0.7, 0.1, WOOD_DARK);
    door.position.set(0, 0.7, 1.1);
    g.add(door);
    g.userData.animate = () => {};
    return g;
}

const UNIT_FACTORIES = {
    militia: makeMilitia,
    swordsman: makeSwordsman,
    archers: makeArcher,
    pikemen: makePikeman,
    knight: makeKnight,
    ram: makeRam,
    handcannon: makeHandCannoneer,
    catapult: makeCatapult,
    elephant: makeElephant,
    watchtower: makeWatchtower,
};

export function makeUnitModel(cardId, team) {
    const factory = UNIT_FACTORIES[cardId];
    const model = factory(team);
    return model;
}

// ---------- 投射物 ----------
export function makeProjectile(kind) {
    if (kind === 'arrow') {
        const g = new THREE.Group();
        const shaft = cyl(0.02, 0.02, 0.4, WOOD, 4);
        shaft.rotation.x = Math.PI / 2;
        g.add(shaft);
        const tip = cone(0.035, 0.09, STEEL, 4);
        tip.rotation.x = -Math.PI / 2;
        tip.position.z = -0.22;
        g.add(tip);
        return g;
    }
    if (kind === 'stone') {
        return sphere(0.16, STONE, 6);
    }
    if (kind === 'bullet') {
        const b = sphere(0.06, 0x333333, 6);
        return b;
    }
    if (kind === 'fireball') {
        const g = new THREE.Group();
        const core = sphere(0.3, 0xff6a1a, 8);
        g.add(core);
        const glow = sphere(0.4, 0xffb03a, 8);
        glow.material = new THREE.MeshBasicMaterial({ color: 0xffb03a, transparent: true, opacity: 0.4 });
        g.add(glow);
        return g;
    }
    return sphere(0.1, 0x222222, 6);
}
