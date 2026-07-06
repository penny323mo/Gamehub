// 模型工廠 — 主力用 Quaternius CC0 GLB（rigged 角色 + 建築），
// 攻城器械（攻城槌/投石車/戰象/火槍兵）用程序化幾何體砌
import * as THREE from 'three';
import { TEAM_COLORS } from './constants.js';
import { instantiate, normalizeHeight, scaleToHeight, scaleToHeightGrounded, scaleToFit, ASSETS } from './assets.js';

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

// 城堡素模按幾何上色：底座深石、牆身淺石、屋頂斜面/塔尖髹隊色
// （Meshy 模型節點有旋轉，要用 world space 高度／法線取樣）
function paintCastle(obj, teamColor) {
    const cStoneLight = new THREE.Color(0xb5aea1);
    const cStoneDark = new THREE.Color(0x7e776b);
    const cTeam = new THREE.Color(teamColor);
    const tmp = new THREE.Color();
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();
    const nm = new THREE.Matrix3();

    obj.updateMatrixWorld(true);
    const wbox = new THREE.Box3().setFromObject(obj);
    const minY = wbox.min.y, span = (wbox.max.y - wbox.min.y) || 1;

    obj.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry = o.geometry.clone(); // 每座塔獨立染色
        const geo = o.geometry;
        const pos = geo.attributes.position;
        const nor = geo.attributes.normal;
        nm.getNormalMatrix(o.matrixWorld);
        const colors = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            const h = (v.y - minY) / span;
            let ny = 0;
            if (nor) {
                n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
                ny = n.y;
            }
            if (h < 0.08) {
                tmp.copy(cStoneDark); // 底座
            } else if (h > 0.88) {
                tmp.copy(cTeam).lerp(cStoneLight, 0.12); // 塔尖
            } else {
                let roofiness = 0;
                if (h > 0.5 && ny > 0.35 && ny < 0.92) {
                    roofiness = Math.min(1, (h - 0.5) / 0.12);
                }
                tmp.copy(cStoneLight).lerp(cTeam, roofiness * 0.92);
            }
            tmp.multiplyScalar(0.9 + h * 0.16);
            colors[i * 3] = tmp.r;
            colors[i * 3 + 1] = tmp.g;
            colors[i * 3 + 2] = tmp.b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        o.material = new THREE.MeshLambertMaterial({ vertexColors: true });
        o.castShadow = true;
    });
    return obj;
}

// 人形素模冇材質分區，用世界高度／離中軸距離近似分區上色
// （頭=膚色、腳=靴色、伸出去嘅武器/配件=皮革木色、身軀=隊色）
function paintSoldier(obj, tunicColor, { armor = true } = {}) {
    // 純高度分區（唔用半徑，避免斗篷/長袍被誤判），但加多層令唔再係
    // 一嚿平塗色：頭=膚色、肩甲=金屬灰（可關）、身軀=隊色、
    // 腰帶=深隊色、褲/腿=深隊色、靴=近黑色。
    const cSkin = new THREE.Color(0xd9a679);
    const cArmor = new THREE.Color(0x8a929c);
    const cBoot = new THREE.Color(0x201810);
    const cTunic = new THREE.Color(tunicColor);
    const cBelt = new THREE.Color(0x3a2c1c);
    const cLegs = cTunic.clone().multiplyScalar(0.68);
    const tmp = new THREE.Color();
    const v = new THREE.Vector3();

    obj.updateMatrixWorld(true);
    const wbox = new THREE.Box3().setFromObject(obj);
    const minY = wbox.min.y, spanY = (wbox.max.y - wbox.min.y) || 1;

    obj.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry = o.geometry.clone();
        const geo = o.geometry;
        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            const h = (v.y - minY) / spanY;
            if (h > 0.86) {
                tmp.copy(cSkin); // 頭
            } else if (armor && h > 0.72) {
                tmp.copy(cArmor); // 肩／領口金屬
            } else if (h > 0.46) {
                tmp.copy(cTunic); // 上身 = 隊色
            } else if (h > 0.36) {
                tmp.copy(cBelt); // 腰帶
            } else if (h > 0.12) {
                tmp.copy(cLegs); // 褲／腿：深啲嘅隊色
            } else {
                tmp.copy(cBoot); // 靴
            }
            colors[i * 3] = tmp.r;
            colors[i * 3 + 1] = tmp.g;
            colors[i * 3 + 2] = tmp.b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        o.material = new THREE.MeshLambertMaterial({ vertexColors: true });
        o.castShadow = true;
    });
    return obj;
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

// 掛受傷閃白：回傳 { onHit(t), update(t) }，畀無骨架素模嘅 animate 埋齊調用
function makeHitFlash(model) {
    const mats = [];
    model.traverse((o) => { if (o.isMesh) mats.push(o.material); });
    let lastHit = -999;
    let wasFlashing = false;
    return {
        onHit: (t) => { lastHit = t; },
        update: (t) => {
            const flash = Math.max(0, 1 - (t - lastHit) / 0.16);
            if (flash > 0.01) {
                for (const m of mats) m.emissive?.setScalar(flash * 0.85);
                wasFlashing = true;
            } else if (wasFlashing) {
                for (const m of mats) m.emissive?.setScalar(0);
                wasFlashing = false;
            }
        },
    };
}

// ---------- Fake 動畫（畀冇骨架嘅 Meshy 素模用）----------
// 移動時輕微浮動、攻擊時前撲、受傷時閃白
function makeFakeAnimator(model, { bobAmount = 0.045, bobSpeed = 8, lungeAmount = 0.32, forwardSign = 1 } = {}) {
    const baseY = model.position.y;
    const flash = makeHitFlash(model);
    model.userData.onHit = flash.onHit;
    return (t, state) => {
        model.position.y = baseY + (state.moving ? Math.abs(Math.sin(t * bobSpeed)) * bobAmount : 0);
        // 行走時身體輕微前傾，令移動方向一眼睇得出（冇步姿動畫，用傾側代替）
        const walkTilt = state.moving ? 0.12 : 0;
        if (state.attackT >= 0) {
            const p = state.attackT;
            // 前撲＋前傾大幅加大，令攻擊一睇就知
            const lunge = p < 0.3 ? (p / 0.3) : Math.max(0, 1 - (p - 0.3) / 0.55);
            model.position.z = forwardSign * lunge * lungeAmount;
            model.rotation.x = forwardSign * lunge * 0.5;
        } else {
            model.position.z *= 0.7;
            model.rotation.x += (walkTilt - model.rotation.x) * 0.2;
        }
        flash.update(t);
    };
}

// Meshy 人形素模：貼地、染色、包一層轉向（若模型原本面向 -z）、掛 fake 動畫
function makeMeshyUnit(key, team, { height, tint, flip = true, armor: armorOpt = true, ...animOpts } = {}) {
    const c = TEAM_COLORS[team];
    const model = paintSoldier(instantiate(key), tint ?? c.main, { armor: armorOpt });
    scaleToHeightGrounded(key, model, height);
    const g = new THREE.Group();
    g.add(model);
    if (flip) model.rotation.y = Math.PI;
    // 注意：model.position 係喺 g（未旋轉）嘅本地空間度郁，同 model 自身
    // 有冇 flip 過方向無關 —— flip 之後個模型已經統一面向 +z，向前撲永遠都係 +z
    g.userData.animate = makeFakeAnimator(model, animOpts);
    return g;
}

function makeMilitia(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyMilitia', team, { height: 1.3, tint: mixColor(c.main, 0x9a8560, 0.45), armor: false });
}

function makeSwordsman(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshySwordsman', team, { height: 1.45, tint: mixColor(c.main, 0xb8b0a0, 0.15) });
}

function makeArcher(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyArcher', team, { height: 1.35, tint: mixColor(c.main, 0x4a7a3a, 0.3), armor: false });
}

function makePikeman(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyPikeman', team, { height: 1.4, tint: mixColor(c.main, 0x6a7078, 0.2), lungeAmount: 0.2 });
}

function makeHandCannoneer(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyMusketeer', team, { height: 1.4, tint: mixColor(c.main, 0x50555c, 0.35), armor: false });
}

function makeKnight(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyCavalry', team, {
        height: 1.85, tint: mixColor(c.main, 0x8a7050, 0.35),
        bobAmount: 0.07, bobSpeed: 6, lungeAmount: 0.22,
    });
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
    const flash = makeHitFlash(ram);
    g.userData.onHit = flash.onHit;

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
        flash.update(t);
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
    const flash = makeHitFlash(cat);
    g.userData.onHit = flash.onHit;

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
        flash.update(t);
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
    const eleFlash = makeHitFlash(ele);
    g.userData.onHit = eleFlash.onHit;

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
        eleFlash.update(t);
    };
    return g;
}

// ---------- 建築（Quaternius RTS pack）----------
function addTowerFlag(g, team, y0, size = 1) {
    const c = TEAM_COLORS[team];
    const y = y0 - 0.3 * size; // 插入塔頂
    const pole = cyl(0.025 * size, 0.025 * size, 0.9 * size, WOOD_DARK, 6);
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
    const t = paintCastle(instantiate('meshySideTower'), c.main);
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
    const t = paintCastle(instantiate('meshyMainBase'), c.main);
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
