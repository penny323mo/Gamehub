// 模型工廠 — 主力用 Quaternius CC0 GLB（rigged 角色 + 建築），
// 攻城器械（攻城槌/投石車/戰象/火槍兵）用程序化幾何體砌
import * as THREE from 'three';
import { TEAM_COLORS } from './constants.js';
import { instantiate, normalizeHeight, scaleToHeight, findBone, getClip, ASSETS } from './assets.js';

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

const WOOD = 0x8a5f36;
const WOOD_DARK = 0x64432a;
const STEEL = 0xc4ccd4;
const STONE = 0xaaa294;
const GOLD = 0xe8c050;

// 飄動旗幟：origin 喺旗桿邊
function makeFlag(w, h, color) {
    const geo = new THREE.BoxGeometry(0.025, h, w);
    geo.translate(0, 0, w / 2);
    return new THREE.Mesh(geo, mat(color));
}

function mixColor(a, b, t) {
    return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
}

// ---------- Mixer 動畫控制 ----------
// 將 AnimationMixer 包裝成 game.js 嘅 animate(t, state) 介面
function makeMixerAnimator(root, key, { idle = 'Idle', walk = 'Walking', attack = null, walkSpeed = 1 }) {
    const mixer = new THREE.AnimationMixer(root);
    const idleA = mixer.clipAction(getClip(key, idle));
    const walkClip = getClip(key, walk);
    const walkA = mixer.clipAction(walkClip);
    walkA.timeScale = walkSpeed;
    idleA.play();
    walkA.play();
    walkA.setEffectiveWeight(0);
    let attackA = null;
    if (attack) {
        const clip = getClip(key, attack);
        if (clip) {
            attackA = mixer.clipAction(clip);
            attackA.setLoop(THREE.LoopOnce);
            attackA.timeScale = clip.duration / 0.5; // 攻擊窗口 ~0.5 秒
        }
    }
    // 隨機起始相位，唔好成隊齊步
    mixer.update(Math.random() * 2);

    let lastT = null;
    let prevAtk = -1;
    return (t, state) => {
        if (lastT === null) lastT = t;
        let dt = t - lastT;
        lastT = t;
        if (dt < 0 || dt > 0.2) dt = 1 / 60;
        const target = state.moving ? 1 : 0;
        const w = walkA.getEffectiveWeight();
        walkA.setEffectiveWeight(w + (target - w) * Math.min(1, dt * 10));
        idleA.setEffectiveWeight(1 - walkA.getEffectiveWeight());
        if (attackA && state.attackT >= 0 && prevAtk < 0) {
            attackA.reset();
            attackA.setEffectiveWeight(1);
            attackA.play();
        }
        prevAtk = state.attackT;
        mixer.update(dt);
    };
}

// ---------- 步兵（Quaternius 騎士 + 武器）----------
// 武器掛喺右手骨，盾掛左前臂
function attachToBone(body, bonePattern, item, { pos = [0, 0, 0], rot = [0, 0, 0] } = {}) {
    const bone = findBone(body, bonePattern);
    if (!bone) return null;
    item.position.set(...pos);
    item.rotation.set(...rot);
    bone.add(item);
    return { bone, item };
}

// pose 完之後按骨骼實際 world scale 校準武器大細同偏移
const _ws = new THREE.Vector3();
function calibrateAttachments(root, attachments) {
    root.updateMatrixWorld(true);
    for (const { att, rawLen, targetLen, pos } of attachments) {
        if (!att) continue;
        att.bone.getWorldScale(_ws);
        const boneScale = _ws.x || 1;
        att.item.scale.setScalar(targetLen / (rawLen * boneScale));
        if (pos) att.item.position.set(pos[0] / boneScale, pos[1] / boneScale, pos[2] / boneScale);
    }
}

// 程序化頭盔 — 掛喺 Head 骨，raw 尺寸 ~1，由 calibrateAttachments 校準
function makeHeadgear(kind, c) {
    const g = new THREE.Group();
    if (kind === 'cap') {
        const capTop = cyl(0.48, 0.54, 0.26, 0x6a5334, 8);
        capTop.position.y = 0.1;
        g.add(capTop);
    } else if (kind === 'helm') {
        const dome = cyl(0.5, 0.56, 0.4, STEEL, 8);
        dome.position.y = 0.12;
        g.add(dome);
        const plume = cone(0.16, 0.5, c.accent, 6);
        plume.position.y = 0.55;
        g.add(plume);
    } else if (kind === 'hood') {
        const hood = cone(0.58, 0.62, 0x3d5c2e, 7);
        hood.position.y = 0.2;
        g.add(hood);
    } else if (kind === 'spike') {
        const band = cyl(0.5, 0.56, 0.22, STEEL, 8);
        band.position.y = 0.05;
        g.add(band);
        const spike = cone(0.42, 0.62, STEEL, 8);
        spike.position.y = 0.44;
        g.add(spike);
    } else if (kind === 'hat') {
        const brim = cyl(0.78, 0.78, 0.08, 0x33302c, 10);
        brim.position.y = 0.02;
        g.add(brim);
        const top = cyl(0.4, 0.46, 0.42, 0x3d3a35, 8);
        top.position.y = 0.26;
        g.add(top);
    }
    return g;
}

function makeGLBHuman(team, {
    armor = null, height = 1.35, weapon = null, weaponLen = 0.95, weaponRot = [0, 0, 0],
    shield = false, headgear = null, attack = 'Run_swordAttack', walkSpeed = 1.4,
}) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const body = instantiate('knight', {
        tint: { Armor: armor ?? c.main },
        cloneMaterials: true,
    });
    scaleToHeight('knight', body, height);
    g.add(body);

    const attachments = [];
    if (weapon) {
        const w = instantiate(weapon, { cloneMaterials: false });
        const att = attachToBone(body, /MiddleHandR/i, w, { rot: weaponRot });
        attachments.push({ att, rawLen: ASSETS[weapon].rawLen, targetLen: weaponLen });
    }
    if (shield) {
        const s = instantiate('shield');
        const att = attachToBone(body, /LowerArmL/i, s, { rot: [0, Math.PI / 2, 0] });
        attachments.push({ att, rawLen: ASSETS.shield.rawLen, targetLen: 0.6, pos: [0, 0.12, 0.06] });
    }
    if (headgear) {
        const h = makeHeadgear(headgear, c);
        const att = attachToBone(body, /^Head$/, h, {});
        attachments.push({ att, rawLen: 1.1, targetLen: 0.46, pos: [0, 0.16, 0] });
    }
    const animate = makeMixerAnimator(body, 'knight', { attack, walkSpeed });
    // 行一格 pose 然後校準武器
    animate(0.01, { moving: false, attackT: -1 });
    animate(0.05, { moving: false, attackT: -1 });
    calibrateAttachments(g, attachments);
    g.userData.animate = animate;
    return g;
}

function makeMilitia(team) {
    const c = TEAM_COLORS[team];
    return makeGLBHuman(team, {
        armor: mixColor(c.main, 0x9a8560, 0.55),
        height: 1.28,
        weapon: 'axe', weaponLen: 0.75,
        headgear: 'cap',
    });
}

function makeSwordsman(team) {
    return makeGLBHuman(team, {
        height: 1.4,
        weapon: 'sword', weaponLen: 0.95,
        shield: true, headgear: 'helm',
    });
}

function makeArcher(team) {
    const c = TEAM_COLORS[team];
    return makeGLBHuman(team, {
        armor: mixColor(c.main, 0x4a7a3a, 0.35),
        height: 1.32,
        weapon: 'bow', weaponLen: 1.05, weaponRot: [Math.PI / 2, 0, 0],
        headgear: 'hood',
    });
}

function makePikeman(team) {
    const c = TEAM_COLORS[team];
    return makeGLBHuman(team, {
        armor: mixColor(c.main, 0x6a7078, 0.25),
        height: 1.34,
        weapon: 'spear', weaponLen: 1.5,
        headgear: 'spike',
    });
}

function makeHandCannoneer(team) {
    const c = TEAM_COLORS[team];
    const g = makeGLBHuman(team, {
        armor: mixColor(c.main, 0x50555c, 0.45),
        height: 1.36,
        headgear: 'hat',
    });
    // 自製火槍掛手（起 1 單位長，再校準）
    const gun = new THREE.Group();
    const barrel = cyl(0.06, 0.08, 0.75, 0x2a2a2a, 8);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = 0.28;
    gun.add(barrel);
    const stockM = box(0.09, 0.12, 0.35, WOOD_DARK);
    stockM.position.z = -0.15;
    gun.add(stockM);
    const body = g.children[0];
    const att = attachToBone(body, /MiddleHandR/i, gun, { rot: [0, 0, 0] });
    g.userData.animate(0.11, { moving: false, attackT: -1 });
    calibrateAttachments(g, [{ att, rawLen: 1.05, targetLen: 0.9 }]);
    return g;
}

// ---------- 騎士（真馬 + 騎手）----------
function makeKnight(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const horse = instantiate('horse', { cloneMaterials: true });
    scaleToHeight('horse', horse, 1.75);
    g.add(horse);
    // 馬鞍布
    const caparison = box(0.42, 0.3, 0.85, c.main);
    caparison.position.set(0, 0.8, 0.12);
    caparison.castShadow = true;
    g.add(caparison);
    // 騎手
    const rider = instantiate('knight', { tint: { Armor: c.main }, cloneMaterials: true });
    scaleToHeight('knight', rider, 1.05);
    rider.position.set(0, 0.95, 0.15);
    g.add(rider);
    const spear = instantiate('spear');
    const spearAtt = attachToBone(rider, /MiddleHandR/i, spear, {
        rot: [Math.PI / 2 + 0.45, 0, 0],
    });
    const riderHelm = makeHeadgear('helm', c);
    const helmAtt = attachToBone(rider, /^Head$/, riderHelm, {});

    const horseAnim = makeMixerAnimator(horse, 'horse', {
        idle: 'Idle', walk: 'Gallop', attack: 'Attack_Headbutt', walkSpeed: 1.1,
    });
    const riderMixer = new THREE.AnimationMixer(rider);
    const riderIdle = riderMixer.clipAction(getClip('knight', 'Idle_swordRight') ?? getClip('knight', 'Idle'));
    riderIdle.play();
    riderMixer.update(Math.random() * 2);
    calibrateAttachments(g, [
        { att: spearAtt, rawLen: ASSETS.spear.rawLen, targetLen: 1.05, pos: [0, 0, 0.06] },
        { att: helmAtt, rawLen: 1.1, targetLen: 0.42, pos: [0, 0.14, 0] },
    ]);
    let lastT = null;
    g.userData.animate = (t, state) => {
        horseAnim(t, state);
        if (lastT === null) lastT = t;
        let dt = t - lastT;
        lastT = t;
        if (dt < 0 || dt > 0.2) dt = 1 / 60;
        riderMixer.update(dt * 0.5);
    };
    return g;
}

// ---------- 攻城槌（程序化）----------
function makeRam(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const roof = box(0.55, 0.08, 1.1, WOOD);
    roof.position.y = 0.72;
    g.add(roof);
    const roofTop = box(0.4, 0.08, 1.1, WOOD_DARK);
    roofTop.position.y = 0.8;
    g.add(roofTop);
    for (const [x, z] of [[-0.24, -0.45], [0.24, -0.45], [-0.24, 0.45], [0.24, 0.45]]) {
        const post = box(0.07, 0.7, 0.07, WOOD_DARK);
        post.position.set(x, 0.38, z);
        g.add(post);
    }
    const ram = cyl(0.11, 0.11, 1.2, 0x8a6238, 8);
    ram.rotation.x = Math.PI / 2;
    ram.position.y = 0.45;
    const ramHead = cyl(0.13, 0.11, 0.15, STEEL, 8);
    ramHead.position.y = -0.65;
    ram.add(ramHead);
    g.add(ram);
    const wheels = [];
    for (const [x, z] of [[-0.3, -0.4], [0.3, -0.4], [-0.3, 0.4], [0.3, 0.4]]) {
        const wheel = cyl(0.16, 0.16, 0.07, WOOD_DARK, 10);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.16, z);
        g.add(wheel);
        wheels.push(wheel);
    }
    const banner = makeFlag(0.3, 0.18, c.flag);
    banner.position.set(0, 0.95, 0.3);
    banner.rotation.y = Math.PI / 2;
    g.add(banner);

    g.userData.animate = (t, state) => {
        if (state.moving) {
            for (const w of wheels) w.rotation.x = t * 6;
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
            ram.position.z = -(p < 0.4 ? (p / 0.4) * 0.25 : 0.25 - ((p - 0.4) / 0.6) * 0.25);
        } else {
            ram.position.z *= 0.8;
        }
    };
    // 模型砌嗰陣槌頭朝 -z，包一層轉返向 +z
    const ramFlip = new THREE.Group();
    ramFlip.rotation.y = Math.PI;
    while (g.children.length) ramFlip.add(g.children[0]);
    g.add(ramFlip);
    return g;
}

// ---------- 投石車（程序化）----------
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
    const frameL = box(0.06, 0.5, 0.06, WOOD_DARK);
    frameL.position.set(-0.2, 0.5, 0.1);
    frameL.rotation.x = 0.35;
    const frameR = frameL.clone();
    frameR.position.x = 0.2;
    g.add(frameL, frameR);
    const arm = box(0.08, 0.08, 1.1, WOOD);
    arm.geometry = arm.geometry.clone();
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
    const banner = makeFlag(0.25, 0.16, c.flag);
    banner.position.set(0.3, 0.75, 0.4);
    g.add(banner);

    g.userData.animate = (t, state) => {
        if (state.moving) {
            for (const w of wheels) w.rotation.x = t * 4;
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
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

// ---------- 戰象（程序化）----------
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
    const trunk = cyl(0.07, 0.1, 0.55, bodyC, 8);
    trunk.geometry = trunk.geometry.clone();
    trunk.geometry.translate(0, -0.25, 0);
    trunk.position.set(0, 0.85, -0.92);
    trunk.rotation.x = 0.25;
    g.add(trunk);
    for (const s of [-1, 1]) {
        const tusk = cyl(0.025, 0.045, 0.4, 0xf0ead8, 6);
        tusk.position.set(s * 0.16, 0.72, -0.92);
        tusk.rotation.x = 1.2;
        g.add(tusk);
        const ear = box(0.06, 0.32, 0.28, 0x7a7068);
        ear.position.set(s * 0.28, 1.05, -0.6);
        g.add(ear);
    }
    const legs = [];
    for (const [x, z] of [[-0.26, -0.4], [0.26, -0.4], [-0.26, 0.4], [0.26, 0.4]]) {
        const leg = cyl(0.13, 0.15, 0.5, 0x7a7068, 8);
        leg.geometry = leg.geometry.clone();
        leg.geometry.translate(0, -0.25, 0);
        leg.position.set(x, 0.5, z);
        g.add(leg);
        legs.push(leg);
    }
    const howdah = box(0.55, 0.3, 0.55, WOOD);
    howdah.position.y = 1.35;
    g.add(howdah);
    const drape = box(0.85, 0.35, 1.2, c.main);
    drape.position.y = 1.0;
    g.add(drape);
    const trim = box(0.87, 0.08, 1.22, GOLD);
    trim.position.y = 0.86;
    g.add(trim);
    const flagPole = cyl(0.02, 0.02, 0.5, WOOD_DARK, 6);
    flagPole.position.set(0, 1.7, 0.2);
    g.add(flagPole);
    const flag = makeFlag(0.3, 0.16, c.flag);
    flag.position.set(0, 1.88, 0.2);
    g.add(flag);

    g.userData.animate = (t, state) => {
        flag.rotation.y = Math.sin(t * 2.4) * 0.35;
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
            const a = p < 0.4 ? (p / 0.4) : 1 - (p - 0.4) / 0.6;
            trunk.rotation.x = 0.25 - a * 1.0;
            g.rotation.x = a * 0.08;
        } else {
            g.rotation.x *= 0.8;
        }
    };
    // 模型砌嗰陣頭朝 -z，包一層轉返向 +z
    const eleFlip = new THREE.Group();
    eleFlip.rotation.y = Math.PI;
    while (g.children.length) eleFlip.add(g.children[0]);
    g.add(eleFlip);
    return g;
}

// ---------- 建築（Quaternius RTS pack）----------
function addTowerFlag(g, team, y, size = 1) {
    const c = TEAM_COLORS[team];
    const pole = cyl(0.025 * size, 0.025 * size, 0.7 * size, WOOD_DARK, 6);
    pole.position.y = y + 0.3 * size;
    g.add(pole);
    const tip = sphere(0.06 * size, GOLD, 8);
    tip.position.y = y + 0.68 * size;
    g.add(tip);
    const flag = makeFlag(0.45 * size, 0.22 * size, c.flag);
    flag.position.y = y + 0.5 * size;
    g.add(flag);
    return flag;
}

export function makeWatchtower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const t = instantiate('towerSmall', { tint: { Main: c.main }, cloneMaterials: true });
    normalizeHeight(t, 2.6);
    g.add(t);
    const flag = addTowerFlag(g, team, 2.6, 0.8);
    g.userData.animate = (t2) => {
        flag.rotation.y = Math.sin(t2 * 2.2) * 0.35;
    };
    return g;
}

export function makePrincessTower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const t = instantiate('towerBig', { tint: { Main: c.main }, cloneMaterials: true });
    normalizeHeight(t, 3.7);
    g.add(t);
    const flag = addTowerFlag(g, team, 3.7, 1);
    g.userData.animate = (t2) => {
        flag.rotation.y = Math.sin(t2 * 2) * 0.4;
    };
    return g;
}

export function makeKingTower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const t = instantiate('kingCastle', {
        tint: { Main: c.main },
        cloneMaterials: true,
    });
    normalizeHeight(t, 4.4);
    g.add(t);
    const flag = addTowerFlag(g, team, 4.4, 1.3);
    g.userData.animate = (t2) => {
        flag.rotation.y = Math.sin(t2 * 1.8) * 0.45;
    };
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
    return UNIT_FACTORIES[cardId](team);
}

// ---------- 投射物 ----------
export function makeProjectile(kind) {
    if (kind === 'arrow') {
        // Quaternius 箭本身沿 z 軸擺放
        const g = new THREE.Group();
        const a = instantiate('arrow');
        a.scale.setScalar(0.2);
        g.add(a);
        return g;
    }
    if (kind === 'stone') {
        return sphere(0.16, STONE, 6);
    }
    if (kind === 'bullet') {
        return sphere(0.06, 0x333333, 6);
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
