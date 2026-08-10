// 極簡 WebAudio 音效合成器（唔載外部音檔，全部即時合成）
let ctx = null;
/*
 * 靜音要記得住。
 *
 * 之前呢度係 `let muted = false`，一個字都冇存——即係你每次入嚟都要重新撳
 * 一次靜音掣。實測：撳咗 🔇，reload 返嚟又係 🔊。（同一個 repo 入面 Racing
 * Car 嘅音效開關係記得住嘅，即係呢個唔係大家嘅共識，係漏咗一個。）
 *
 * 用 `localStorage` 直接存：呢個係一個純 UI 偏好，唔屬於 `storage.js` 嗰個
 * 存檔（獎盃／卡牌／連勝），同 `main.js` 度 `GFX_KEY` 一樣自己一個 key。
 * ADR-215 之後 `safe-storage.js` 已經包住咗 storage，封咗 cookie 都唔會掟錯,
 * 但呢度照樣 try／catch——一個記唔記得住嘅偏好，唔值得整冧隻遊戲。
 */
const MUTE_KEY = 'royale-muted-v1';
let muted = (() => {
    try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
})();
let master = null;

function ac() {
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.9;
        master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

// Autoplay policy：AudioContext 一定要喺用戶手勢入面 resume 先出到聲。
// 如果第一下聲效嚟自 setTimeout／AI 動作（唔算手勢），context 會困死喺
// suspended，成場遊戲靜晒——所以喺第一次任何 pointerdown 就預先開好佢。
window.addEventListener('pointerdown', () => { try { ac(); } catch { /* 冇 WebAudio 都照玩 */ } }, { once: true });

// ---------- 限流 ----------
// 大混戰可以有幾十隻兵喺同一秒開打，唔限流啲打擊聲會疊成一嚿噪音。
// 每種聲有最短間隔，另外設全局同時發聲上限。
const lastAt = new Map();
let liveVoices = 0;
const MAX_VOICES = 14;

function gate(name, minGap) {
    if (muted) return false;
    const now = performance.now();
    const prev = lastAt.get(name) ?? -1e9;
    if (now - prev < minGap) return false;
    if (liveVoices >= MAX_VOICES) return false;
    lastAt.set(name, now);
    return true;
}

function voice(dur) {
    liveVoices++;
    setTimeout(() => { liveVoices = Math.max(0, liveVoices - 1); }, dur * 1000);
}

const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- 基本音源 ----------
function tone(freq, dur, type = 'square', vol = 0.15, slide = 0, when = 0) {
    if (muted) return;
    try {
        const a = ac();
        const t0 = a.currentTime + when;
        const o = a.createOscillator();
        const g = a.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t0);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        o.connect(g).connect(master);
        o.start(t0);
        o.stop(t0 + dur);
    } catch { /* 無聲都照玩 */ }
}

// 帶濾波嘅噪音——金屬碰撞／爆炸／破風都靠佢塑形
function noise(dur, vol = 0.2, { filter = null, freq = 1000, q = 1, sweep = 0, when = 0 } = {}) {
    if (muted) return;
    try {
        const a = ac();
        const t0 = a.currentTime + when;
        const len = Math.max(1, Math.floor(a.sampleRate * dur));
        const buf = a.createBuffer(1, len, a.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = a.createBufferSource();
        src.buffer = buf;
        const g = a.createGain();
        g.gain.value = vol;
        let node = src;
        if (filter) {
            const f = a.createBiquadFilter();
            f.type = filter;
            f.frequency.setValueAtTime(freq, t0);
            f.Q.value = q;
            if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(60, freq + sweep), t0 + dur);
            node = node.connect(f);
        }
        node.connect(g).connect(master);
        src.start(t0);
    } catch { /* 無聲都照玩 */ }
}

export const sfx = {
    setMuted(m) {
        muted = !!m;
        try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* 記唔住就算，唔好掟 */ }
    },
    isMuted() { return muted; },

    // ---------- 出兵／落卡 ----------
    deploy() { if (!gate('deploy', 40)) return; voice(0.2); tone(220, 0.12, 'triangle', 0.2, -80); noise(0.08, 0.08); },
    spell() { if (!gate('spell', 60)) return; voice(0.35); tone(440, 0.3, 'sawtooth', 0.12, 220); },
    spellWarning() {
        if (!gate('spell-warning', 120)) return;
        voice(0.38);
        tone(620, 0.17, 'square', 0.09, -180);
        tone(420, 0.2, 'triangle', 0.08, -90, 0.15);
    },

    // ---------- 戰鬥 ----------
    // 金屬互斬：窄帶噪音（鏗）＋低頻撞擊（實感），每下微調音高唔會覺得複製黏貼
    melee() {
        if (!gate('melee', 55)) return;
        voice(0.2);
        noise(0.09, 0.16, { filter: 'bandpass', freq: rnd(1900, 3200), q: 6, sweep: -900 });
        tone(rnd(120, 170), 0.07, 'square', 0.07, -50);
    },
    // 鈍擊（棍／攻城槌撞門）：低沉冇金屬味
    thud() {
        if (!gate('thud', 70)) return;
        voice(0.2);
        noise(0.1, 0.14, { filter: 'lowpass', freq: rnd(280, 420), q: 1 });
        tone(rnd(70, 95), 0.12, 'sine', 0.16, -25);
    },
    // 放箭：破風「咻」
    arrow() {
        if (!gate('arrow', 45)) return;
        voice(0.14);
        noise(0.12, 0.09, { filter: 'highpass', freq: 1400, q: 1, sweep: 2600 });
    },
    // 火槍／砲：爆響＋低頻
    gunshot() {
        if (!gate('gunshot', 70)) return;
        voice(0.3);
        noise(0.16, 0.26, { filter: 'lowpass', freq: 2400, sweep: -1800 });
        tone(rnd(85, 110), 0.18, 'sine', 0.2, -40);
    },
    // 投石／重型投射物出膛
    launch() {
        if (!gate('launch', 90)) return;
        voice(0.25);
        noise(0.14, 0.12, { filter: 'bandpass', freq: 500, q: 2, sweep: 400 });
        tone(140, 0.15, 'triangle', 0.1, 90);
    },
    // 單位陣亡
    death() {
        if (!gate('death', 80)) return;
        voice(0.3);
        tone(rnd(200, 260), 0.22, 'triangle', 0.1, -120);
        noise(0.14, 0.08, { filter: 'lowpass', freq: 700 });
    },
    // 治療脈衝
    heal() {
        if (!gate('heal', 120)) return;
        voice(0.3);
        tone(660, 0.16, 'sine', 0.1, 240);
        tone(990, 0.2, 'sine', 0.06, 180, 0.06);
    },

    explosion() { if (!gate('explosion', 60)) return; voice(0.4); noise(0.35, 0.3, { filter: 'lowpass', freq: 1800, sweep: -1400 }); tone(90, 0.3, 'sine', 0.25, -50); },
    hit() { this.melee(); }, // 舊名保留

    // ---------- 賽事節點 ----------
    towerDown() { voice(0.7); noise(0.6, 0.35, { filter: 'lowpass', freq: 900, sweep: -600 }); tone(70, 0.6, 'sine', 0.3, -30); },
    kingWake() { voice(0.4); tone(330, 0.15, 'square', 0.15); tone(440, 0.2, 'square', 0.15, 0, 0.14); },
    overtime() { voice(0.45); tone(523, 0.15, 'square', 0.15); tone(659, 0.25, 'square', 0.15, 0, 0.16); },
    win() { voice(1.2); [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, 'triangle', 0.2, 0, i * 0.15)); },
    lose() { voice(1.4); [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.18, 0, i * 0.18)); },
    error() { if (!gate('error', 200)) return; voice(0.2); tone(160, 0.15, 'square', 0.12, -40); },

    // ---------- LV2 世紀帝國模式 ----------
    gather() { if (!gate('gather', 260)) return; voice(0.15); noise(0.07, 0.06, { filter: 'bandpass', freq: rnd(700, 1100), q: 3 }); },
    build() { if (!gate('build', 200)) return; voice(0.2); noise(0.09, 0.11, { filter: 'bandpass', freq: rnd(400, 700), q: 2 }); tone(rnd(150, 200), 0.09, 'square', 0.07, -60); },
    complete() { voice(0.45); tone(523, 0.14, 'triangle', 0.14); tone(784, 0.22, 'triangle', 0.13, 0, 0.13); },
    ageUp() { voice(1.0); [392, 523, 659, 880].forEach((f, i) => tone(f, 0.28, 'triangle', 0.17, 0, i * 0.16)); },
    research() { voice(0.5); tone(440, 0.16, 'sine', 0.13, 120); tone(660, 0.24, 'sine', 0.12, 160, 0.15); },
    train() { if (!gate('train', 150)) return; voice(0.25); tone(300, 0.12, 'triangle', 0.11, 120); },
};
