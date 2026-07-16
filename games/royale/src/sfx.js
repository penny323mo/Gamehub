// 極簡 WebAudio 音效合成器
let ctx = null;
let muted = false;

function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

// Autoplay policy：AudioContext 一定要喺用戶手勢入面 resume 先出到聲。
// 如果第一下聲效嚟自 setTimeout／AI 動作（唔算手勢），context 會困死喺
// suspended，成場遊戲靜晒——所以喺第一次任何 pointerdown 就預先開好佢。
window.addEventListener('pointerdown', () => { try { ac(); } catch { /* 冇 WebAudio 都照玩 */ } }, { once: true });

function tone(freq, dur, type = 'square', vol = 0.15, slide = 0) {
    if (muted) return;
    try {
        const a = ac();
        const o = a.createOscillator();
        const g = a.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, a.currentTime);
        if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), a.currentTime + dur);
        g.gain.setValueAtTime(vol, a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
        o.connect(g).connect(a.destination);
        o.start();
        o.stop(a.currentTime + dur);
    } catch (e) { /* 無聲都照玩 */ }
}

function noise(dur, vol = 0.2) {
    if (muted) return;
    try {
        const a = ac();
        const len = a.sampleRate * dur;
        const buf = a.createBuffer(1, len, a.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = a.createBufferSource();
        src.buffer = buf;
        const g = a.createGain();
        g.gain.value = vol;
        src.connect(g).connect(a.destination);
        src.start();
    } catch (e) { /* 無聲都照玩 */ }
}

export const sfx = {
    setMuted(m) { muted = m; },
    isMuted() { return muted; },
    deploy() { tone(220, 0.12, 'triangle', 0.2, -80); noise(0.08, 0.08); },
    spell() { tone(440, 0.3, 'sawtooth', 0.12, 220); },
    explosion() { noise(0.35, 0.3); tone(90, 0.3, 'sine', 0.25, -50); },
    arrow() { tone(900, 0.06, 'square', 0.05, -300); },
    hit() { tone(150, 0.06, 'square', 0.08, -40); },
    towerDown() { noise(0.6, 0.35); tone(70, 0.6, 'sine', 0.3, -30); },
    kingWake() { tone(330, 0.15, 'square', 0.15); setTimeout(() => tone(440, 0.2, 'square', 0.15), 140); },
    overtime() { tone(523, 0.15, 'square', 0.15); setTimeout(() => tone(659, 0.25, 'square', 0.15), 160); },
    win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'triangle', 0.2), i * 150)); },
    lose() { [392, 330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.18), i * 180)); },
    error() { tone(160, 0.15, 'square', 0.12, -40); },
};
