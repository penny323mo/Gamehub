// 玩家設定：車身顏色、時間（日／黃昏／夜）、手機畫質。
// 全部存 localStorage，落次入返嚟照舊。

import * as THREE from 'three';

export const COLOURS = [
    { id: 'white', name: '珍珠白', hex: 0xe9edf2 },
    { id: 'red', name: '賽車紅', hex: 0xd12f2f },
    { id: 'blue', name: '電光藍', hex: 0x2f6ed1 },
    { id: 'yellow', name: '芥末黃', hex: 0xe3b21f },
    { id: 'green', name: '薄荷綠', hex: 0x2fb37a },
    { id: 'black', name: '曜石黑', hex: 0x24262b },
    { id: 'pink', name: '桃粉', hex: 0xe07ab0 },
    { id: 'orange', name: '熔岩橙', hex: 0xe86a1f },
];

// 每個時段一套「天空 + 霧 + 太陽 + 環境光」。夜晚唔可以淨係熄燈——
// 夜間賽道冇光就變一嚿黑，睇唔到路。所以夜晚保住一定嘅環境光，
// 靠冷色調同暗天空嚟做氣氛。
export const TIMES = {
    day: {
        name: '日頭', sky: 0x8fc7ef, fog: [120, 320],
        sun: { color: 0xfff2d8, intensity: 2.1, pos: [60, 120, 40] },
        hemi: { sky: 0xbfe3ff, ground: 0x4a6a3a, intensity: 1.0 },
        exposure: 1.05,
        environment: {
            horizon: 0xcceaff, zenith: 0x4d9ee3, glowColor: 0xffe2a8, glowStrength: 0.48,
            celestialColor: 0xfff0bd, celestialOpacity: 0.96, celestialSize: 34,
            starOpacity: 0, headlight: 0, headlightColor: 0xfff1cf,
        },
    },
    dusk: {
        name: '黃昏', sky: 0xf0a06a, fog: [100, 280],
        sun: { color: 0xffb066, intensity: 1.7, pos: [-90, 34, 30] },
        hemi: { sky: 0xffc9a0, ground: 0x4a3a2a, intensity: 0.85 },
        exposure: 1.0,
        environment: {
            horizon: 0xffb16f, zenith: 0x5b6fae, glowColor: 0xffc06b, glowStrength: 0.72,
            celestialColor: 0xffd08a, celestialOpacity: 0.98, celestialSize: 38,
            starOpacity: 0.12, headlight: 95, headlightColor: 0xffdcb0,
        },
    },
    night: {
        name: '夜晚', sky: 0x141c30, fog: [70, 220],
        // 夜晚唔可以真係熄燈：環境光太低連路邊都睇唔到。
        // 實測 0.7 環境光路面近乎全黑，加到 1.5 先夠睇路兼保住夜晚氣氛。
        sun: { color: 0x9fb6ff, intensity: 1.15, pos: [40, 90, -60] },
        hemi: { sky: 0x5a76b8, ground: 0x1d2c3c, intensity: 1.5 },
        exposure: 1.35,
        environment: {
            horizon: 0x263657, zenith: 0x050916, glowColor: 0x8aa5e8, glowStrength: 0.2,
            celestialColor: 0xdce8ff, celestialOpacity: 0.9, celestialSize: 25,
            starOpacity: 0.94, headlight: 450, headlightColor: 0xe8f2ff,
        },
    },
};

export const QUALITY_MODES = {
    auto: { name: '自動' },
    sharp: { name: '清晰' },
    battery: { name: '省電' },
};

const KEY_RIVALS = 'racer-rivals';
const KEY_COLOUR = 'racer-colour';
const KEY_TOD = 'racer-tod';
const KEY_QUALITY = 'racer-quality';

export function loadColour() {
    const id = localStorage.getItem(KEY_COLOUR);
    return COLOURS.find(c => c.id === id) ?? COLOURS[0];
}
export function saveColour(id) { try { localStorage.setItem(KEY_COLOUR, id); } catch { } }
export function loadTod() {
    const id = localStorage.getItem(KEY_TOD);
    return TIMES[id] ? id : 'day';
}
export function saveTod(id) { try { localStorage.setItem(KEY_TOD, id); } catch { } }

// 對手數目。預設 2：夠有追逐感，又唔會塞爆條路
export function loadRivals() {
    const n = Number(localStorage.getItem(KEY_RIVALS));
    return Number.isFinite(n) && n >= 0 && n <= 4 ? n : 2;
}
export function saveRivals(n) { try { localStorage.setItem(KEY_RIVALS, String(n)); } catch { } }

// 錦標賽賽程：存低嘅 id 一定要對返而家真係存在嗰批。冇有效存檔就用
// caller 畀嘅預設（正向三條）——一個零場嘅錦標賽開波即完，仲衰過重設。
const KEY_SEASON_LIST = 'racer-season-list';
export function loadSeasonList(pool, fallback = null) {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY_SEASON_LIST)); } catch { }
    const out = [];
    for (const id of Array.isArray(raw) ? raw : []) {
        if (pool.includes(id) && !out.includes(id)) out.push(id);
    }
    if (out.length) return out;
    const def = (fallback ?? pool).filter(id => pool.includes(id));
    return def.length ? def : [...pool];
}
export function saveSeasonList(ids) {
    try { localStorage.setItem(KEY_SEASON_LIST, JSON.stringify(ids)); } catch { }
}

// ABS 預設開。關咗就係真實嘅無 ABS 行為：踩死煞車會鎖死，前輪鎖推頭、
// 後輪鎖甩尾（實測直線煞車一有擾動就轉 128°）。
export function loadAbs() { return localStorage.getItem('racer-abs') !== '0'; }
export function saveAbs(on) {
    try { localStorage.setItem('racer-abs', on ? '1' : '0'); } catch { }
}

// 幽靈車預設開：獨自計時模式冇咗佢就完全冇參照物
export function loadGhostOn() { return localStorage.getItem('racer-ghost-on') !== '0'; }
export function saveGhostOn(on) {
    try { localStorage.setItem('racer-ghost-on', on ? '1' : '0'); } catch { }
}
export function loadQuality() {
    const id = localStorage.getItem(KEY_QUALITY);
    return QUALITY_MODES[id] ? id : 'auto';
}
export function saveQuality(id) { try { localStorage.setItem(KEY_QUALITY, id); } catch { } }

// 純函數，測試可以用虛擬 3× DPR 驗證手機上限，唔需要真係開高解像 canvas。
export function qualityDpr(id, deviceDpr = 1, coarse = false) {
    const dpr = Math.max(1, Number(deviceDpr) || 1);
    if (id === 'battery') return 1;
    if (id === 'sharp') return Math.min(dpr, coarse ? 1.75 : 2);
    return Math.min(dpr, coarse ? 1.5 : 2);
}

// 車身上色：只噴「原本已經接近白／灰」嗰啲面，唔郁玻璃、輪胎、格柵。
// 個模型嘅材質係共用嘅，所以要 clone 一份先改，否則揀色會污染其他 mesh。
export function paintCar(model, hex) {
    const target = new THREE.Color(hex);
    model.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m, i) => {
            if (!m.__origColor) {
                m.__origColor = m.color ? m.color.clone() : new THREE.Color(0xffffff);
                m.__paintable = isBodywork(m);
            }
            if (!m.__paintable) return;
            if (!m.__cloned) {
                const c = m.clone();
                c.__origColor = m.__origColor; c.__paintable = true; c.__cloned = true;
                if (Array.isArray(o.material)) o.material[i] = c; else o.material = c;
                m = c;
            }
            // 保留原本嘅明暗（陰影、髒污），淨係換色相
            const lum = (m.__origColor.r + m.__origColor.g + m.__origColor.b) / 3;
            m.color.copy(target).multiplyScalar(0.55 + lum * 0.75);
        });
    });
}

// 車殼判斷：夠光又夠中性色（唔係玻璃／黑膠／紅色尾燈）
function isBodywork(m) {
    if (!m.color) return false;
    const { r, g, b } = m.color;
    const lum = (r + g + b) / 3;
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (m.transparent && m.opacity < 0.9) return false;
    return lum > 0.45 && spread < 0.16;
}

export function applyTime(id, { scene, renderer, sun, hemi, environment }) {
    const t = TIMES[id] ?? TIMES.day;
    scene.background = new THREE.Color(t.sky);
    scene.fog.color.setHex(t.sky);
    scene.fog.near = t.fog[0];
    scene.fog.far = t.fog[1];
    sun.color.setHex(t.sun.color);
    sun.intensity = t.sun.intensity;
    sun.position.set(...t.sun.pos);
    hemi.color.setHex(t.hemi.sky);
    hemi.groundColor.setHex(t.hemi.ground);
    hemi.intensity = t.hemi.intensity;
    renderer.toneMappingExposure = t.exposure;
    environment?.apply(t, id);
    return t;
}
