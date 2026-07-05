// 模型工廠 — 主力用 Quaternius CC0 GLB（rigged 角色 + 建築），
// 攻城器械（攻城槌/投石車/戰象/火槍兵）用程序化幾何體砌
import * as THREE from 'three';
import { TEAM_COLORS } from './constants.js';
import { instantiate, normalizeHeight, scaleToHeight, scaleToFit, findBone, getClip, ASSETS } from './assets.js';

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

// Meshy 素模冇 material，整個 Lambert 上色
export function meshyTint(obj, color) {
    obj.traverse((o) => {
        if (o.isMesh) {
            o.material = new THREE.MeshLambertMaterial({ color });
            o.castShadow = true;
        }
    });
    return obj;
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

// ---------- 攻城槌（Meshy AI 模型）----------
function makeRam(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const ram = meshyTint(instantiate('meshyRam'), 0x8a6238);
    scaleToFit('meshyRam', ram, 1.5);
    ram.rotation.y = -Math.PI / 2; // 模型圓木沿 x 軸，轉去沿 z（攻擊方向）
    g.add(ram);
    const banner = makeFlag(0.3, 0.18, c.flag);
    banner.position.set(0, 1.25, 0.2);
    g.add(banner);

    g.userData.animate = (t, state) => {
        banner.rotation.y = Math.sin(t * 2.6) * 0.35;
        if (state.moving) {
            g.position.y = Math.abs(Math.sin(t * 7)) * 0.03;
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
            // 成架車向前撞
            ram.position.z = p < 0.4 ? (p / 0.4) * 0.22 : 0.22 - ((p - 0.4) / 0.6) * 0.22;
        } else {
            ram.position.z *= 0.8;
        }
    };
    return g;
}

// ---------- 投石車（Meshy AI 模型；投石由引擎 projectile 負責）----------
function makeCatapult(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const cat = meshyTint(instantiate('meshyCatapult'), 0x8a6238);
    scaleToFit('meshyCatapult', cat, 1.5);
    cat.rotation.y = -Math.PI / 2; // 同攻城槌一樣沿 x 軸砌
    g.add(cat);
    const banner = makeFlag(0.25, 0.16, c.flag);
    banner.position.set(0.35, 1.1, 0.3);
    g.add(banner);

    g.userData.animate = (t, state) => {
        banner.rotation.y = Math.sin(t * 2.6) * 0.35;
        if (state.moving) {
            g.position.y = Math.abs(Math.sin(t * 6)) * 0.025;
        }
        if (state.attackT >= 0) {
            // fake 後座力：向後一縮再回彈
            const p = state.attackT;
            cat.position.z = p < 0.3 ? -(p / 0.3) * 0.12 : -0.12 + ((p - 0.3) / 0.7) * 0.12;
        } else {
            cat.position.z *= 0.8;
        }
    };
    return g;
}

// ---------- 戰象（Meshy AI 模型 + 程序化戰塔）----------
function makeElephant(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const ele = meshyTint(instantiate('meshyElephant'), 0x968f88);
    scaleToHeight('meshyElephant', ele, 1.9);
    g.add(ele);

    // 隊色披布 + 戰塔 + 旗
    const drape = box(0.8, 0.32, 1.05, c.main);
    drape.position.y = 1.05;
    g.add(drape);
    const trim = box(0.82, 0.07, 1.07, GOLD);
    trim.position.y = 0.92;
    g.add(trim);
    const howdah = box(0.52, 0.28, 0.52, WOOD);
    howdah.position.y = 1.32;
    g.add(howdah);
    const flagPole = cyl(0.02, 0.02, 0.5, WOOD_DARK, 6);
    flagPole.position.set(0, 1.65, 0.15);
    g.add(flagPole);
    const flag = makeFlag(0.3, 0.16, c.flag);
    flag.position.set(0, 1.82, 0.15);
    g.add(flag);

    // 動畫：得一條 walk clip，行嗰陣先播
    const mixer = new THREE.AnimationMixer(ele);
    const clip = ASSETS.meshyElephant.animations[0];
    const walkA = clip ? mixer.clipAction(clip) : null;
    if (walkA) {
        walkA.play();
        mixer.update(Math.random());
    }
    let lastT = null;
    g.userData.animate = (t, state) => {
        flag.rotation.y = Math.sin(t * 2.4) * 0.35;
        if (lastT === null) lastT = t;
        let dt = t - lastT;
        lastT = t;
        if (dt < 0 || dt > 0.2) dt = 1 / 60;
        if (walkA) {
            // 靜止時放慢到停
            const target = state.moving ? 1 : 0;
            walkA.timeScale += (target - walkA.timeScale) * Math.min(1, dt * 8);
            mixer.update(dt);
        }
        if (state.attackT >= 0) {
            const p = state.attackT;
            const a = p < 0.4 ? (p / 0.4) : 1 - (p - 0.4) / 0.6;
            g.rotation.x = a * 0.1; // 向前撞
        } else {
            g.rotation.x *= 0.8;
        }
    };
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
    const t = meshyTint(instantiate('meshyTower'), 0xa8a196);
    const sc = scaleToFit('meshyTower', t, 1.4, { byFootprint: true });
    g.add(t);
    const flag = addTowerFlag(g, team, ASSETS.meshyTower.rawSize.y * sc, 0.8);
    g.userData.animate = (t2) => {
        flag.rotation.y = Math.sin(t2 * 2.2) * 0.35;
    };
    return g;
}

export function makePrincessTower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const t = meshyTint(instantiate('meshySideTower'), mixColor(0xaaa294, c.main, 0.14));
    const sc = scaleToFit('meshySideTower', t, 2.7, { byFootprint: true });
    g.add(t);
    const topY = ASSETS.meshySideTower.rawSize.y * sc;
    const flag = addTowerFlag(g, team, topY, 1);
    g.userData.animate = (t2) => {
        flag.rotation.y = Math.sin(t2 * 2) * 0.4;
    };
    return g;
}

export function makeKingTower(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const t = meshyTint(instantiate('meshyMainBase'), mixColor(0xaaa294, c.main, 0.14));
    const sc = scaleToFit('meshyMainBase', t, 3.8, { byFootprint: true });
    g.add(t);
    const topY = ASSETS.meshyMainBase.rawSize.y * sc;
    const flag = addTowerFlag(g, team, topY, 1.3);
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
        // Meshy 箭：normalize 做 0.55 長、轉去指向 +z
        const g = new THREE.Group();
        const a = meshyTint(instantiate('meshyArrow'), 0x9a7a4a);
        const s = ASSETS.meshyArrow.rawSize;
        const longest = Math.max(s.x, s.y, s.z);
        a.scale.setScalar(0.55 / longest);
        if (longest === s.x) a.rotation.y = Math.PI / 2;
        else if (longest === s.y) a.rotation.x = Math.PI / 2;
        g.add(a);
        return g;
    }
    if (kind === 'stone') {
        const st = meshyTint(instantiate('meshyStone'), 0x8f8a80);
        const s = ASSETS.meshyStone.rawSize;
        st.scale.setScalar(0.34 / Math.max(s.x, s.y, s.z));
        return st;
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
