// 引擎、輪胎、風聲、撞擊——全部即時合成，一個音檔都唔載。
//
// 點解唔用錄音：賽車嘅引擎聲一定要跟住車速連續變。用 loop 音檔就要靠改
// playbackRate 拉音高，拉得多就會有金屬味同爆音；而且幾百 KB 音檔喺手機
// 數據上係實質成本。合成器得幾 KB 碼，音高、濾波、音量全部逐幀跟得實。
//
// 效能寫法：長駐節點只建一次，逐幀淨係改參數（setTargetAtTime）。如果每幀
// new OscillatorNode，手機好快會因為 GC 出現卡格——聽覺升級唔可以倒蝕手感。
//
// 唔跑比賽就完全收聲兼 suspend context：選單、暫停、切 App 嗰陣唔應該仲有
// 一條振盪器喺度食電。

export const AUDIO_KEY = 'racer-audio';

export function loadAudioOn() { return localStorage.getItem(AUDIO_KEY) !== '0'; }
export function saveAudioOn(on) {
    try { localStorage.setItem(AUDIO_KEY, on ? '1' : '0'); } catch { }
}

// ---------- 純映射：抽出嚟先測得到單調性同上下限 ----------

const GEAR_SPAN = 21;      // 每格波覆蓋幾多 m/s
const GEARS = 5;

// Physics can briefly contain NaN/Infinity while a context is restoring or a
// collision is being resolved. AudioParam rejects those values synchronously;
// treat them as the quiet/idle fallback instead of letting one bad frame break
// the render loop.
const finiteOr = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

// 引擎：轉數喺一格波入面由低爬到高，換波跌返落去——冇呢個鋸齒，
// 加速就變成一條無聊嘅上升線，聽唔出「有波段」。
export function engineTone(speed, throttle) {
    const s = Math.max(0, finiteOr(speed));
    const gear = Math.min(GEARS - 1, Math.floor(s / GEAR_SPAN));
    const within = Math.min(1, (s - gear * GEAR_SPAN) / GEAR_SPAN);
    const rpm = 0.25 + within * 0.75;
    const th = Math.max(0, Math.min(1, finiteOr(throttle)));
    return {
        gear, rpm,
        freq: 54 + rpm * 92 + gear * 4,
        // 收油唔可以靜曬：真車收油仲有引擎制動聲，全靜會似死火
        gain: 0.05 + th * 0.07 + rpm * 0.025,
        cutoff: 420 + th * 1500 + rpm * 900,
    };
}

// 輪胎：約 8° 滑移角開始響，慢車唔響（泊車扭軚唔應該有甩尾聲），
// 出咗草地就悶啲。
export function skidGain(slipAngle, speed, offroad = false, handbrake = false) {
    const v = Math.max(0, finiteOr(speed));
    if (v < 6) return 0;
    const slip = Math.abs(finiteOr(slipAngle));
    const base = Math.max(0, slip - 0.14) * 2.2 + (handbrake ? 0.25 : 0);
    const fade = Math.min(1, (v - 6) / 10);
    return Math.min(1, base * fade) * (offroad ? 0.5 : 1);
}

// 風噪：高速先聽到，用嚟做速度感嘅底層
export function windGain(speed) {
    return Math.min(0.75, Math.max(0, finiteOr(speed) - 8) / 52);
}

export function createDefaultContext() {
    const C = window.AudioContext || window.webkitAudioContext;
    return C ? new C() : null;
}

export function createRacerAudio({
    contextFactory = createDefaultContext,
    enabled = null,
} = {}) {
    let ctx = null, master = null, parts = null;
    let on = enabled == null ? loadAudioOn() : !!enabled;
    let racing = false, broken = false, blips = 0;
    let suspendTimer = 0;
    const live = { freq: 0, engine: 0, skid: 0, wind: 0 };

    function noiseBuffer(a) {
        const buf = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        return buf;
    }

    function build(a) {
        master = a.createGain();
        master.gain.value = 0.9;
        master.connect(a.destination);

        // 引擎：兩把失諧鋸齒（厚度）＋ 一把低八度正弦（重量），
        // 全部行同一個低通，油門開就開亮。
        const lp = a.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 600;
        const gain = a.createGain();
        gain.gain.value = 0;
        lp.connect(gain).connect(master);

        const oscA = a.createOscillator(); oscA.type = 'sawtooth';
        const oscB = a.createOscillator(); oscB.type = 'sawtooth'; oscB.detune.value = 9;
        const sub = a.createOscillator(); sub.type = 'sine';
        const subGain = a.createGain(); subGain.gain.value = 0.6;
        oscA.connect(lp); oscB.connect(lp); sub.connect(subGain).connect(lp);
        for (const o of [oscA, oscB, sub]) { o.frequency.value = 60; o.start(); }

        const buf = noiseBuffer(a);
        const mkNoise = (filterType, freq, q) => {
            const src = a.createBufferSource();
            src.buffer = buf; src.loop = true;
            const f = a.createBiquadFilter();
            f.type = filterType; f.frequency.value = freq;
            if (q != null) f.Q.value = q;
            const g = a.createGain(); g.gain.value = 0;
            src.connect(f).connect(g).connect(master);
            src.start();
            return g;
        };
        parts = {
            lp, gain, oscA, oscB, sub,
            skid: mkNoise('bandpass', 1750, 0.9),
            wind: mkNoise('lowpass', 760),
        };
    }

    function ensure() {
        if (broken || !on) return null;
        if (ctx) return ctx;
        try {
            ctx = contextFactory();
            if (!ctx) { broken = true; return null; }
            build(ctx);
        } catch { broken = true; ctx = null; }
        return ctx;
    }

    // Autoplay policy：iOS／Chrome 要喺真手勢入面 resume，否則成場靜曬。
    function unlock() {
        const a = ensure();
        if (!a) return false;
        if (a.state === 'suspended') a.resume?.();
        return true;
    }

    const ramp = (param, value, tau = 0.05) => {
        const safeValue = finiteOr(value);
        const safeTau = Number.isFinite(tau) && tau > 0 ? tau : 0.05;
        try { param.setTargetAtTime(safeValue, ctx.currentTime, safeTau); }
        catch { try { param.value = safeValue; } catch { /* audio device unavailable */ } }
    };

    function silence(tau = 0.08) {
        if (!parts) return;
        ramp(parts.gain.gain, 0, tau);
        ramp(parts.skid.gain, 0, tau);
        ramp(parts.wind.gain, 0, tau);
        live.engine = live.skid = live.wind = 0;
    }

    // 短促音效：一次一次建節點係啱嘅——一場比賽先幾十次，
    // 而長駐嗰啲反而唔可以每幀建。
    function blip(freq, dur, { type = 'square', vol = 0.16, slide = 0, delay = 0 } = {}) {
        const a = ensure();
        if (!a || !on) return false;
        unlock();
        try {
            const t0 = a.currentTime + delay;
            const o = a.createOscillator();
            const g = a.createGain();
            o.type = type;
            o.frequency.setValueAtTime(freq, t0);
            if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
            g.gain.setValueAtTime(0.0001, t0);
            g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            o.connect(g).connect(master);
            o.start(t0);
            o.stop(t0 + dur + 0.02);
            blips += 1;
            return true;
        } catch { return false; }
    }

    function thud(strength) {
        const a = ensure();
        if (!a || !on) return false;
        try {
            const t0 = a.currentTime;
            const src = a.createBufferSource();
            src.buffer = noiseBuffer(a);
            const f = a.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.setValueAtTime(900, t0);
            f.frequency.exponentialRampToValueAtTime(120, t0 + 0.22);
            const g = a.createGain();
            const impact = Math.max(0, finiteOr(strength));
            const vol = Math.min(0.45, 0.12 + impact * 0.02);
            g.gain.setValueAtTime(vol, t0);
            g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);
            src.connect(f).connect(g).connect(master);
            src.start(t0);
            src.stop(t0 + 0.3);
            blips += 1;
            return true;
        } catch { return false; }
    }

    return {
        get enabled() { return on; },
        get racing() { return racing; },
        unlock,

        setEnabled(next) {
            on = !!next;
            saveAudioOn(on);
            if (!on) { silence(0.03); this.suspend(); }
            else if (racing) this.startRace();
            return on;
        },

        startRace() {
            racing = true;
            // 上一場排低嘅延遲 suspend 一定要取消：完賽收聲排喺 220ms 之後，
            // 玩家撳「再跑一次」快過嗰下嘅話，個 suspend 會遲到，跟住成場
            // 比賽都係靜曬——而且睇落似「音效隨機失靈」，好難查。
            clearTimeout(suspendTimer);
            suspendTimer = 0;
            const a = ensure();
            if (!a) return false;
            unlock();
            return true;
        },

        stopRace() {
            racing = false;
            silence();
            this.suspend(220);
        },

        // 暫停／切 App：唔止收聲，仲要真係停低個 context 慳電
        suspend(after = 0) {
            if (!ctx) return;
            silence(0.03);
            const doIt = () => {
                suspendTimer = 0;
                if (racing) return;                 // 期間已經再開波就唔好熄
                try { if (ctx && ctx.state === 'running') ctx.suspend?.(); } catch { }
            };
            clearTimeout(suspendTimer);
            if (after) suspendTimer = setTimeout(doIt, after); else doIt();
        },

        resume() {
            if (!on || !ctx) return;
            clearTimeout(suspendTimer);
            suspendTimer = 0;
            try { if (ctx.state === 'suspended') ctx.resume?.(); } catch { }
        },

        // 逐幀：只改參數，唔建節點
        update(dt, car, cmd = {}) {
            if (!on || !racing || !car) return;
            const a = ensure();
            if (!a || !parts) return;
            const tone = engineTone(car.speed, cmd.throttle ?? 0);
            const sk = skidGain(car.slipAngle, car.speed, car.offroad, !!cmd.handbrake);
            const wd = windGain(car.speed);
            ramp(parts.oscA.frequency, tone.freq, 0.04);
            ramp(parts.oscB.frequency, tone.freq * 1.005, 0.04);
            ramp(parts.sub.frequency, tone.freq / 2, 0.04);
            ramp(parts.lp.frequency, tone.cutoff, 0.06);
            ramp(parts.gain.gain, tone.gain, 0.05);
            ramp(parts.skid.gain, sk * 0.3, 0.05);
            ramp(parts.wind.gain, wd * 0.16, 0.12);
            live.freq = tone.freq; live.engine = tone.gain; live.skid = sk; live.wind = wd;
            // 撞欄：車自己記住咗力度，唔使另外接線
            if (car.wallHit) thud(car.wallImpact ?? 0);
        },

        // 比賽事件：用返 race.js 嗰套 kind，唔另外發明一套名
        event(kind, data) {
            if (!on) return false;
            switch (kind) {
                case 'count': return blip(520, 0.16, { vol: 0.14 });
                case 'go': return blip(880, 0.34, { vol: 0.2, slide: 180 });
                case 'lap': return blip(660, 0.14, { vol: 0.14 }) && blip(880, 0.16, { vol: 0.14, delay: 0.13 });
                case 'record': return blip(784, 0.13, { type: 'triangle', vol: 0.18 })
                    && blip(1046, 0.2, { type: 'triangle', vol: 0.18, delay: 0.12 });
                case 'driftBank': return blip(1180, 0.09, { type: 'triangle', vol: 0.1 });
                case 'driftLost': return blip(180, 0.28, { type: 'sawtooth', vol: 0.16, slide: -90 });
                case 'rescue': return blip(300, 0.22, { type: 'sine', vol: 0.14, slide: 120 });
                case 'finish':
                    [523, 659, 784, 1046].forEach((f, i) =>
                        blip(f, 0.26, { type: 'triangle', vol: 0.17, delay: i * 0.12 }));
                    return true;
                default: return false;
            }
        },

        // 畀測試睇實際狀態，唔使去聽把聲
        snapshot() {
            return {
                enabled: on, racing, ready: !!ctx, broken, blips,
                state: ctx?.state ?? 'none',
                freq: +live.freq.toFixed(1), engine: +live.engine.toFixed(4),
                skid: +live.skid.toFixed(3), wind: +live.wind.toFixed(3),
                nodeGain: parts ? +parts.gain.gain.value.toFixed(4) : null,
            };
        },
    };
}
