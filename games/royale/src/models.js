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

// 人形素模冇材質分區，用世界高度（＋有限制嘅離軸半徑）近似分區上色。
// 每個兵種可以自訂 accent（獨有飾帶色）同 armor（肩甲有冇），等六隻兵
// 就算全部素模冇材質，睇落都有唔同嘅盔甲/軍服細節，唔止得隊色一嚿。
function paintSoldier(obj, tunicColor, {
    armor = true, accent = null, accentBand = [0.56, 0.64], propColor = 0x5a3d20,
} = {}) {
    const cSkin = new THREE.Color(0xd9a679);
    const cArmor = new THREE.Color(0x8a929c);
    const cBoot = new THREE.Color(0x201810);
    const cTunic = new THREE.Color(tunicColor);
    const cBelt = new THREE.Color(0x3a2c1c);
    const cLegs = cTunic.clone().multiplyScalar(0.68);
    const cAccent = accent != null ? new THREE.Color(accent) : null;
    const cProp = new THREE.Color(propColor);
    const tmp = new THREE.Color();
    const v = new THREE.Vector3();

    obj.updateMatrixWorld(true);
    const wbox = new THREE.Box3().setFromObject(obj);
    const minY = wbox.min.y, spanY = (wbox.max.y - wbox.min.y) || 1;
    const cx = (wbox.min.x + wbox.max.x) / 2;
    const cz = (wbox.min.z + wbox.max.z) / 2;

    // 淨用嚟揾「伸出去好遠」嘅武器桿/弓臂 —— 只喺中上身高度範圍先檢查
    // 半徑，避免下身闊身斗篷／長袍（半徑一樣大但高度低好多）被誤判
    let maxRad = 0.001;
    obj.traverse((o) => {
        if (!o.isMesh) return;
        const pos = o.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            const h = (v.y - minY) / spanY;
            if (h < 0.3 || h > 0.9) continue; // 淨計中上身，唔理褲腳/斗篷下擺
            maxRad = Math.max(maxRad, Math.hypot(v.x - cx, v.z - cz));
        }
    });

    obj.traverse((o) => {
        if (!o.isMesh) return;
        o.geometry = o.geometry.clone();
        const geo = o.geometry;
        const pos = geo.attributes.position;
        const colors = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
            const h = (v.y - minY) / spanY;
            const rad = (h >= 0.3 && h <= 0.9) ? Math.hypot(v.x - cx, v.z - cz) / maxRad : 0;
            if (h > 0.86) {
                tmp.copy(cSkin); // 頭
            } else if (rad > 0.72) {
                tmp.copy(cProp); // 中上身範圍內、伸出好遠 = 武器桿/弓臂
            } else if (armor && h > 0.72) {
                tmp.copy(cArmor); // 肩／領口金屬
            } else if (cAccent && h > accentBand[0] && h <= accentBand[1]) {
                tmp.copy(cAccent); // 每兵種獨有飾帶
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
// 移動時輕微浮動、攻擊時前撲＋揮動、受傷時閃白
function makeFakeAnimator(model, { bobAmount = 0.045, bobSpeed = 8, lungeAmount = 0.5, forwardSign = 1 } = {}) {
    const baseY = model.position.y;
    const baseScale = model.scale.x;
    const flash = makeHitFlash(model);
    model.userData.onHit = flash.onHit;
    return (t, state) => {
        if (state.attackT >= 0) {
            // 攻擊：前撲（實質位移，方向由 group facing 決定）＋側揮＋命中膨脹
            const p = state.attackT;
            const lunge = p < 0.3 ? (p / 0.3) : Math.max(0, 1 - (p - 0.3) / 0.55);
            model.position.z = forwardSign * lunge * lungeAmount;
            const punch = p < 0.32 ? (p / 0.32) : Math.max(0, 1 - (p - 0.32) / 0.5);
            model.scale.setScalar(baseScale * (1 + punch * 0.28));
            model.rotation.z = Math.sin(p * Math.PI) * 0.32;
            model.position.y = baseY;
            model.rotation.x *= 0.6;
        } else if (state.moving) {
            // 行走：上下踏步
            model.position.y = baseY + Math.abs(Math.sin(t * bobSpeed)) * bobAmount;
            model.position.z *= 0.7;
            model.scale.setScalar(model.scale.x + (baseScale - model.scale.x) * 0.3);
            model.rotation.z *= 0.6;
            model.rotation.x *= 0.6;
        } else {
            // 企定：呼吸起伏＋慢搖重心＋輕微前後晃，唔好似木頭人綁死咗（t 已含每兵相位偏移，唔會同步）
            model.position.y = baseY + (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.028;
            model.rotation.z = Math.sin(t * 1.3) * 0.06;
            model.rotation.x = Math.sin(t * 0.9) * 0.03;
            model.position.z *= 0.7;
            model.scale.setScalar(model.scale.x + (baseScale - model.scale.x) * 0.3);
        }
        flash.update(t);
    };
}

// Meshy 人形素模：貼地、染色、掛 fake 動畫（模型原生已面向 +z，唔使額外轉向）
function makeMeshyUnit(key, team, {
    height, tint, armor: armorOpt = true, accent = null, accentBand, propColor, ...animOpts
} = {}) {
    const c = TEAM_COLORS[team];
    const paintOpts = { armor: armorOpt, accent };
    if (accentBand) paintOpts.accentBand = accentBand;
    if (propColor != null) paintOpts.propColor = propColor;
    const model = paintSoldier(instantiate(key), tint ?? c.main, paintOpts);
    scaleToHeightGrounded(key, model, height);
    const g = new THREE.Group();
    g.add(model);
    g.userData.animate = makeFakeAnimator(model, animOpts);
    // makeFakeAnimator 將 onHit 掛咗喺內層 model 度，但 game.js 攞返出面個 group 嚟叫 —— 轉駁一下
    g.userData.onHit = (t) => model.userData.onHit?.(t);
    return g;
}

function makeMilitia(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyMilitia', team, {
        height: 1.56, tint: mixColor(c.main, 0x9a8560, 0.45), armor: false,
        accent: 0xc9a227, accentBand: [0.55, 0.6], propColor: 0x6b4a28, // 芥黃色布條腰帶
    });
}

function makeSwordsman(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshySwordsman', team, {
        height: 1.74, tint: mixColor(c.main, 0xb8b0a0, 0.15),
        accent: 0xe8dcc0, accentBand: [0.58, 0.63], propColor: 0xb9c2c9, // 米白色綬帶＋銀刃
    });
}

function makeArcher(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyArcher', team, {
        height: 1.62, tint: mixColor(c.main, 0x4a7a3a, 0.3), armor: false,
        accent: 0x6b4423, accentBand: [0.5, 0.56], propColor: 0x7a5230, // 皮革箭袋帶＋木弓
    });
}

function makePikeman(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyPikeman', team, {
        height: 1.68, tint: mixColor(c.main, 0x6a7078, 0.2), lungeAmount: 0.32,
        accent: 0x2f4a35, accentBand: [0.58, 0.63], propColor: 0x5a3d20, // 墨綠色軍帶＋木桿
    });
}

function makeHandCannoneer(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyMusketeer', team, {
        height: 1.68, tint: mixColor(c.main, 0x50555c, 0.35), armor: false,
        accent: 0xded6c0, accentBand: [0.52, 0.6], propColor: 0x3a3a3a, // 米白色子彈袋帶＋鐵槍管
    });
}

function makeKnight(team) {
    const c = TEAM_COLORS[team];
    return makeMeshyUnit('meshyCavalry', team, {
        height: 2.22, tint: mixColor(c.main, 0x8a7050, 0.35),
        bobAmount: 0.07, bobSpeed: 6, lungeAmount: 0.35,
        accent: 0xd4af37, accentBand: [0.42, 0.48], propColor: 0x5a3d20, // 金色馬鞍飾邊
    });
}

function makeScout(team) {
    const c = TEAM_COLORS[team];
    // 輕騎：騎兵模型縮細、淺皮革色調，銀灰飾帶
    return makeMeshyUnit('meshyCavalry', team, {
        height: 1.92, tint: mixColor(c.main, 0xc2a878, 0.45),
        bobAmount: 0.09, bobSpeed: 9, lungeAmount: 0.4,
        accent: 0xc9ced4, accentBand: [0.44, 0.5], propColor: 0x7a5230,
    });
}

function makeBerserker(team) {
    const c = TEAM_COLORS[team];
    // 狂戰士：劍士模型染血紅戰甲、深紅飾帶
    return makeMeshyUnit('meshySwordsman', team, {
        height: 1.78, tint: mixColor(c.main, 0x8a2418, 0.5),
        lungeAmount: 0.55, accent: 0x5c0f0f, accentBand: [0.56, 0.62], propColor: 0x4a4a50,
    });
}

// ---------- 攻城槌（Meshy AI 模型）----------
function makeRam(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const ram = meshyTint(instantiate('meshyRam'), 0x8a6238);
    scaleToFit('meshyRam', ram, 1.8);
    ram.rotation.y = -Math.PI / 2; // 模型圓木沿 x 軸，轉去沿 z（攻擊方向）
    g.add(ram);
    const banner = makeFlag(0.3, 0.18, c.flag);
    banner.position.set(0, 1.25, 0.2);
    g.add(banner);
    const flash = makeHitFlash(ram);
    g.userData.onHit = flash.onHit;

    g.userData.animate = (t, state) => {
        banner.rotation.y = Math.sin(t * 2.6) * 0.35;
        g.position.y = state.moving ? Math.abs(Math.sin(t * 7)) * 0.03 : Math.sin(t * 1.6) * 0.01;
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
    scaleToFit('meshyCatapult', cat, 1.8);
    cat.rotation.y = -Math.PI / 2; // 同攻城槌一樣沿 x 軸砌
    g.add(cat);
    const banner = makeFlag(0.25, 0.16, c.flag);
    banner.position.set(0.35, 1.1, 0.3);
    g.add(banner);
    const flash = makeHitFlash(cat);
    g.userData.onHit = flash.onHit;

    g.userData.animate = (t, state) => {
        banner.rotation.y = Math.sin(t * 2.6) * 0.35;
        g.position.y = state.moving ? Math.abs(Math.sin(t * 6)) * 0.025 : Math.sin(t * 1.5) * 0.008;
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
    scaleToHeight('meshyElephant', ele, 2.28);
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
        // 企定時輕微呼吸起伏，唔好僵住
        g.position.y = state.moving ? 0 : Math.sin(t * 1.4) * 0.022;
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

// ---------- 巨弩塔：哨塔基座 + 程序化弩臂 ----------
export function makeBallista(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const t = meshyTint(instantiate('meshyTower'), 0x8a7a62);
    const sc = scaleToFit('meshyTower', t, 1.5, { byFootprint: true });
    g.add(t);
    const topY = ASSETS.meshyTower.rawSize.y * sc;
    // 弩臂：橫弓 + 中軸箭槽
    const bow = box(1.5, 0.09, 0.12, WOOD_DARK);
    bow.position.set(0, topY + 0.12, 0.15);
    g.add(bow);
    const rail = box(0.1, 0.08, 1.0, WOOD);
    rail.position.set(0, topY + 0.1, -0.1);
    g.add(rail);
    const bolt = cyl(0.03, 0.03, 0.7, STEEL, 6);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0, topY + 0.18, -0.05);
    g.add(bolt);
    const flag = addTowerFlag(g, team, topY + 0.1, 0.7);
    const flash = makeHitFlash(t);
    g.userData.onHit = flash.onHit;
    g.userData.animate = (t2, state) => {
        flag.rotation.y = Math.sin(t2 * 2.2) * 0.35;
        if (state?.attackT >= 0) {
            // 上弦後座
            const p = state.attackT;
            bolt.position.z = p < 0.2 ? -0.05 - (p / 0.2) * 0.3 : -0.35 + ((p - 0.2) / 0.8) * 0.3;
        }
        flash.update(t2);
    };
    return g;
}

// ---------- 聖水磨坊：程序化風車，扇葉轉動 ----------
export function makeMill(team) {
    const c = TEAM_COLORS[team];
    const g = new THREE.Group();
    const base = cyl(0.55, 0.7, 1.3, STONE, 10);
    base.position.y = 0.65;
    g.add(base);
    const roof = cone(0.62, 0.55, c.main, 10);
    roof.position.y = 1.55;
    g.add(roof);
    // 聖水桶
    const vat = cyl(0.28, 0.32, 0.4, 0x7a3fa8, 8);
    vat.position.set(0.55, 0.2, 0.35);
    g.add(vat);
    const juice = cyl(0.22, 0.22, 0.06, 0xd06aff, 8);
    juice.position.set(0.55, 0.42, 0.35);
    g.add(juice);
    // 扇葉軸心
    const hub = new THREE.Group();
    hub.position.set(0, 1.35, 0.62);
    for (let i = 0; i < 4; i++) {
        const blade = box(0.16, 0.85, 0.03, 0xd8cdb8);
        blade.position.y = 0.5;
        const arm = new THREE.Group();
        arm.rotation.z = (i * Math.PI) / 2;
        arm.add(blade);
        hub.add(arm);
    }
    g.add(hub);
    // 磨坊部件用緊 mat() 共享快取材質——hit-flash 會直接改 emissive，
    // 唔 clone 嘅話一座磨坊中彈，所有共用嗰啲材質嘅嘢（另一座磨坊、
    // 戰象披布等）會一齊閃白，仲會互相熄咗人哋嘅 flash
    g.traverse((o) => { if (o.isMesh) o.material = o.material.clone(); });
    const flash = makeHitFlash(g);
    g.userData.onHit = flash.onHit;
    g.userData.animate = (t2) => {
        hub.rotation.z = t2 * 1.4;
        flash.update(t2);
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
    scout: makeScout,
    berserker: makeBerserker,
    ballista: makeBallista,
    mill: makeMill,
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
    if (kind === 'bolt') {
        // 巨弩粗箭：重用 Meshy 箭，加大加深色
        const g = new THREE.Group();
        const a = meshyTint(instantiate('meshyArrow'), 0x5a4a34);
        const s = ASSETS.meshyArrow.rawSize;
        const longest = Math.max(s.x, s.y, s.z);
        a.scale.setScalar(0.85 / longest);
        if (longest === s.x) a.rotation.y = Math.PI / 2;
        else if (longest === s.y) a.rotation.x = Math.PI / 2;
        g.add(a);
        return g;
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
