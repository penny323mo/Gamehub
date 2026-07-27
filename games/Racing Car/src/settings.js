// 玩家設定：車身顏色、時間（日／黃昏／夜）。
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
// 方塊世界冇光就變一嚿黑，睇唔到路。所以夜晚保住一定嘅環境光，
// 靠冷色調同暗天空嚟做氣氛。
export const TIMES = {
    day: {
        name: '日頭', sky: 0x8fc7ef, fog: [120, 320],
        sun: { color: 0xfff2d8, intensity: 2.1, pos: [60, 120, 40] },
        hemi: { sky: 0xbfe3ff, ground: 0x4a6a3a, intensity: 1.0 },
        exposure: 1.05,
    },
    dusk: {
        name: '黃昏', sky: 0xf0a06a, fog: [100, 280],
        sun: { color: 0xffb066, intensity: 1.7, pos: [-90, 34, 30] },
        hemi: { sky: 0xffc9a0, ground: 0x4a3a2a, intensity: 0.85 },
        exposure: 1.0,
    },
    night: {
        name: '夜晚', sky: 0x141c30, fog: [70, 220],
        // 夜晚唔可以真係熄燈：方塊世界冇光就變一嚿黑，連路邊都睇唔到。
        // 實測 0.7 環境光路面近乎全黑，加到 1.5 先夠睇路兼保住夜晚氣氛。
        sun: { color: 0x9fb6ff, intensity: 1.15, pos: [40, 90, -60] },
        hemi: { sky: 0x5a76b8, ground: 0x1d2c3c, intensity: 1.5 },
        exposure: 1.35,
    },
};

const KEY_COLOUR = 'racer-colour';
const KEY_TOD = 'racer-tod';

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

export function applyTime(id, { scene, renderer, sun, hemi }) {
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
    return t;
}
