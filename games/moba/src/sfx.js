// 音效同音樂：全部喺瀏覽器度即場合成，冇用任何外來錄音。
//
// 咁做唔淨係為咗避開版權——一個 MOBA 一秒可以有十幾下打擊聲，用取樣嘅話
// 唔係要幾百 KB 就係要成日撞聲。合成出嚟嘅每一下都可以按傷害、按距離、
// 按隨機音高微調，同一個「劍擊」聽落去唔會兩下一模一樣。
//
// 音樂係一段自己編嘅循環：i–VI–III–VII 嘅小調行進，低音、和弦墊、
// 琶音、同一套鼓。每四小節重新排一次琶音，所以聽落唔會即刻覺得係 loop。

const NOTE = (semitonesFromA4) => 440 * Math.pow(2, semitonesFromA4 / 12);

export class Sfx {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.musicOn = true;
        this.lastPlay = new Map();     // 同一種聲音唔好一幀入面響十次
        this.musicTimer = 0;
        this.bar = 0;
        this.nextBarAt = 0;
        // 瀏覽器要用戶手勢先開得到聲
        const unlock = () => { this.#ensure(); window.removeEventListener('pointerdown', unlock); };
        window.addEventListener('pointerdown', unlock);
        window.addEventListener('keydown', unlock, { once: true });
    }

    #ensure() {
        if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) { this.enabled = false; return null; }
        this.ctx = new AC();

        this.master = this.ctx.createGain();
        this.master.gain.value = 0.7;
        this.master.connect(this.ctx.destination);

        // 一個好平嘅殘響：用雜訊做脈衝響應，唔使外部檔案
        this.verb = this.ctx.createConvolver();
        this.verb.buffer = this.#impulse(1.6, 2.4);
        const verbGain = this.ctx.createGain();
        verbGain.gain.value = 0.28;
        this.verb.connect(verbGain).connect(this.master);
        this.verbIn = this.verb;

        this.sfxBus = this.ctx.createGain();
        this.sfxBus.gain.value = 0.85;
        this.sfxBus.connect(this.master);
        this.sfxBus.connect(this.verbIn);

        this.musicBus = this.ctx.createGain();
        this.musicBus.gain.value = 0.34;
        this.musicBus.connect(this.master);
        this.musicBus.connect(this.verbIn);

        this.noiseBuf = this.#noise(1.0);
        this.nextBarAt = this.ctx.currentTime + 0.15;
        return this.ctx;
    }

    #noise(seconds) {
        const n = Math.floor(this.ctx.sampleRate * seconds);
        const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
        return buf;
    }

    #impulse(seconds, decay) {
        const n = Math.floor(this.ctx.sampleRate * seconds);
        const buf = this.ctx.createBuffer(2, n, this.ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < n; i++) {
                d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
            }
        }
        return buf;
    }

    // ---------- 基本積木 ----------
    #env(node, t, { a = 0.005, d = 0.12, s = 0, r = 0.08, peak = 1, sustain = 0 }) {
        const g = node.gain;
        g.cancelScheduledValues(t);
        g.setValueAtTime(0.0001, t);
        g.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + a);
        g.exponentialRampToValueAtTime(Math.max(0.0001, sustain || peak * 0.25), t + a + d);
        if (s > 0) g.setValueAtTime(Math.max(0.0001, sustain || peak * 0.25), t + a + d + s);
        g.exponentialRampToValueAtTime(0.0001, t + a + d + s + r);
        return t + a + d + s + r;
    }

    #tone(bus, t, freq, opts = {}) {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        osc.type = opts.type ?? 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(opts.slideTo, t + (opts.slideTime ?? 0.12));
        if (opts.detune) osc.detune.setValueAtTime(opts.detune, t);
        const g = ctx.createGain();
        let node = osc;
        if (opts.filter) {
            const f = ctx.createBiquadFilter();
            f.type = opts.filter;
            f.frequency.setValueAtTime(opts.cutoff ?? 1200, t);
            if (opts.cutoffTo) f.frequency.exponentialRampToValueAtTime(opts.cutoffTo, t + (opts.slideTime ?? 0.2));
            f.Q.value = opts.q ?? 1;
            node.connect(f); node = f;
        }
        node.connect(g).connect(bus);
        const end = this.#env(g, t, opts);
        osc.start(t);
        osc.stop(end + 0.05);
        return end;
    }

    #hit(bus, t, opts = {}) {
        const ctx = this.ctx;
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        src.playbackRate.value = opts.rate ?? 1;
        const f = ctx.createBiquadFilter();
        f.type = opts.filter ?? 'bandpass';
        f.frequency.setValueAtTime(opts.cutoff ?? 1800, t);
        if (opts.cutoffTo) f.frequency.exponentialRampToValueAtTime(opts.cutoffTo, t + (opts.d ?? 0.12));
        f.Q.value = opts.q ?? 1.4;
        const g = ctx.createGain();
        src.connect(f).connect(g).connect(bus);
        const end = this.#env(g, t, opts);
        src.start(t);
        src.stop(end + 0.05);
        return end;
    }

    // 同一種聲音喺極短時間內唔好疊太多次，否則一團兵開打就變白噪音
    #gate(key, minGap = 0.045) {
        const now = this.ctx.currentTime;
        const last = this.lastPlay.get(key) ?? -9;
        if (now - last < minGap) return false;
        this.lastPlay.set(key, now);
        return true;
    }

    // ---------- 各種聲 ----------
    play(name, opts = {}) {
        if (!this.enabled) return;
        const ctx = this.#ensure();
        if (!ctx) return;
        const t = ctx.currentTime + 0.001;
        const bus = this.sfxBus;
        const vol = opts.volume ?? 1;
        const jitter = 1 + (Math.random() - 0.5) * 0.14;

        switch (name) {
            case 'swing':      // 近戰劈中
                if (!this.#gate('swing')) return;
                this.#hit(bus, t, { rate: 1.6 * jitter, cutoff: 2600, cutoffTo: 700, a: 0.002, d: 0.09, r: 0.05, peak: 0.5 * vol, q: 0.8 });
                this.#tone(bus, t, 150 * jitter, { type: 'square', slideTo: 70, slideTime: 0.08, a: 0.002, d: 0.07, r: 0.04, peak: 0.22 * vol, filter: 'lowpass', cutoff: 900 });
                break;
            case 'arrow':      // 射箭
                if (!this.#gate('arrow')) return;
                this.#hit(bus, t, { rate: 2.2 * jitter, filter: 'highpass', cutoff: 2200, a: 0.002, d: 0.06, r: 0.04, peak: 0.3 * vol });
                break;
            case 'cast':       // 施法
                this.#tone(bus, t, 320 * jitter, { type: 'sawtooth', slideTo: 880, slideTime: 0.18, a: 0.01, d: 0.16, r: 0.12, peak: 0.3 * vol, filter: 'bandpass', cutoff: 700, cutoffTo: 2600, q: 3 });
                break;
            case 'boom':       // 範圍爆炸
                this.#hit(bus, t, { rate: 0.55, filter: 'lowpass', cutoff: 1400, cutoffTo: 180, a: 0.004, d: 0.34, r: 0.3, peak: 0.75 * vol });
                this.#tone(bus, t, 90, { type: 'sine', slideTo: 42, slideTime: 0.3, a: 0.004, d: 0.3, r: 0.2, peak: 0.5 * vol });
                break;
            case 'heal':
                this.#tone(bus, t, NOTE(4), { type: 'sine', a: 0.02, d: 0.2, r: 0.25, peak: 0.22 * vol });
                this.#tone(bus, t + 0.06, NOTE(11), { type: 'sine', a: 0.02, d: 0.22, r: 0.3, peak: 0.18 * vol });
                break;
            case 'shield':
                this.#tone(bus, t, NOTE(-5), { type: 'triangle', slideTo: NOTE(2), slideTime: 0.16, a: 0.01, d: 0.18, r: 0.2, peak: 0.26 * vol });
                break;
            case 'levelup':
                [0, 4, 7, 12].forEach((s, i) =>
                    this.#tone(bus, t + i * 0.07, NOTE(s + 7), { type: 'triangle', a: 0.01, d: 0.12, r: 0.22, peak: 0.28 }));
                break;
            case 'kill':
                this.#tone(bus, t, NOTE(-12), { type: 'sawtooth', slideTo: NOTE(-24), slideTime: 0.3, a: 0.005, d: 0.28, r: 0.25, peak: 0.4, filter: 'lowpass', cutoff: 1600, cutoffTo: 400 });
                this.#hit(bus, t, { rate: 0.7, filter: 'lowpass', cutoff: 900, a: 0.003, d: 0.25, r: 0.2, peak: 0.4 });
                break;
            case 'death':
                this.#tone(bus, t, 220, { type: 'sawtooth', slideTo: 80, slideTime: 0.5, a: 0.01, d: 0.4, r: 0.3, peak: 0.3, filter: 'lowpass', cutoff: 1200, cutoffTo: 260 });
                break;
            case 'tower':      // 塔冧
                this.#hit(bus, t, { rate: 0.35, filter: 'lowpass', cutoff: 900, cutoffTo: 120, a: 0.01, d: 0.9, r: 0.7, peak: 0.9 });
                this.#tone(bus, t, 62, { type: 'sine', slideTo: 30, slideTime: 0.9, a: 0.01, d: 0.8, r: 0.5, peak: 0.6 });
                for (let i = 0; i < 6; i++) {
                    this.#hit(bus, t + 0.08 + i * 0.09 + Math.random() * 0.05,
                        { rate: 1.1 + Math.random(), filter: 'bandpass', cutoff: 700 + Math.random() * 900, a: 0.003, d: 0.09, r: 0.07, peak: 0.3 });
                }
                break;
            case 'buy':
                this.#tone(bus, t, NOTE(7), { type: 'square', a: 0.005, d: 0.07, r: 0.08, peak: 0.16 });
                this.#tone(bus, t + 0.07, NOTE(14), { type: 'square', a: 0.005, d: 0.08, r: 0.12, peak: 0.14 });
                break;
            case 'warden':
                this.#tone(bus, t, NOTE(9), { type: 'sine', a: 0.005, d: 0.1, r: 0.4, peak: 0.34 });
                this.#tone(bus, t, NOTE(16), { type: 'sine', a: 0.005, d: 0.12, r: 0.45, peak: 0.24 });
                break;
            default: break;
        }
    }

    stinger(won) {
        const ctx = this.#ensure();
        if (!ctx) return;
        this.musicOn = false;
        const t = ctx.currentTime + 0.05;
        const seq = won ? [0, 4, 7, 12, 16] : [0, -3, -7, -12];
        seq.forEach((s, i) => {
            this.#tone(this.master, t + i * 0.16, NOTE(s), { type: 'triangle', a: 0.01, d: 0.2, s: 0.1, r: 0.5, peak: 0.3 });
            this.#tone(this.master, t + i * 0.16, NOTE(s + 7), { type: 'sine', a: 0.01, d: 0.22, s: 0.1, r: 0.6, peak: 0.18 });
        });
    }

    // ---------- 音樂 ----------
    // i – VI – III – VII（A 小調：Am – F – C – G）。每小節排一次，
    // 排喺 currentTime 之前少少，所以就算主迴圈卡一格都唔會斷拍。
    #scheduleBar() {
        const ctx = this.ctx;
        const t0 = this.nextBarAt;
        const bpm = 96, beat = 60 / bpm, barLen = beat * 4;
        const prog = [
            { root: -12, chord: [0, 3, 7] },     // Am
            { root: -16, chord: [0, 4, 7] },     // F
            { root: -21, chord: [0, 4, 7] },     // C
            { root: -14, chord: [0, 4, 7] },     // G
        ];
        const p = prog[this.bar % prog.length];
        const bus = this.musicBus;

        // 低音：每拍一下
        for (let b = 0; b < 4; b++) {
            const t = t0 + b * beat;
            const f = NOTE(p.root - 12 + (b === 2 ? 7 : 0));
            this.#tone(bus, t, f, { type: 'triangle', a: 0.01, d: 0.18, r: 0.16, peak: 0.5, filter: 'lowpass', cutoff: 420 });
        }
        // 和弦墊：整小節鋪住
        for (const s of p.chord) {
            this.#tone(bus, t0, NOTE(p.root + s), {
                type: 'sawtooth', a: 0.35, d: 0.3, s: barLen * 0.4, r: 0.7, peak: 0.13,
                filter: 'lowpass', cutoff: 700, q: 0.7,
            });
        }
        // 琶音：每四小節換一次型，所以循環唔會太明顯
        const shape = [[0, 3, 7, 12, 7, 3], [0, 7, 12, 7, 3, 7], [12, 7, 3, 0, 3, 7]][Math.floor(this.bar / 4) % 3];
        for (let i = 0; i < 8; i++) {
            const t = t0 + i * (beat / 2);
            const s = p.chord[0] + shape[i % shape.length];
            this.#tone(bus, t, NOTE(p.root + 12 + s), {
                type: 'triangle', a: 0.005, d: 0.1, r: 0.14, peak: 0.09,
                filter: 'bandpass', cutoff: 1800, q: 1.6,
            });
        }
        // 鼓：大鼓喺 1、3 拍，小鼓喺 2、4，hi-hat 每半拍
        for (const b of [0, 2]) {
            this.#tone(bus, t0 + b * beat, 110, { type: 'sine', slideTo: 44, slideTime: 0.1, a: 0.002, d: 0.14, r: 0.06, peak: 0.55 });
        }
        for (const b of [1, 3]) {
            this.#hit(bus, t0 + b * beat, { rate: 1.1, filter: 'bandpass', cutoff: 1900, q: 0.9, a: 0.002, d: 0.11, r: 0.07, peak: 0.22 });
        }
        for (let i = 0; i < 8; i++) {
            this.#hit(bus, t0 + i * (beat / 2), { rate: 2.6, filter: 'highpass', cutoff: 7000, a: 0.001, d: 0.03, r: 0.02, peak: i % 2 ? 0.05 : 0.09 });
        }

        this.bar++;
        this.nextBarAt = t0 + barLen;
    }

    // 由主迴圈每幀叫一次：排住未來一小節，唔靠 setInterval（背景 tab 會唔準）
    tick() {
        if (!this.musicOn || !this.ctx) return;
        let guard = 0;
        while (this.nextBarAt < this.ctx.currentTime + 0.6 && guard++ < 4) this.#scheduleBar();
    }

    setMusic(on) {
        this.musicOn = on;
        if (this.musicBus) this.musicBus.gain.value = on ? 0.34 : 0;
        if (on && this.ctx) this.nextBarAt = Math.max(this.nextBarAt, this.ctx.currentTime + 0.1);
    }
    setEnabled(on) {
        this.enabled = on;
        if (this.master) this.master.gain.value = on ? 0.7 : 0;
    }

    // 由 sim 嘅事件流出聲：邊個事件響邊個聲淨係寫喺呢度一處
    consume(events, sim) {
        if (!this.enabled) return;
        this.tick();
        if (!this.ctx) return;
        const me = sim.player;
        const near = (id) => {
            const e = sim.entities.find(x => x.id === id);
            if (!e) return 0;
            const d = Math.hypot(e.x - me.x, e.z - me.z);
            return Math.max(0, 1 - d / 45);
        };
        for (const ev of events) {
            switch (ev.type) {
                case 'attack': {
                    const a = sim.entities.find(x => x.id === ev.id);
                    if (!a) break;
                    const v = near(ev.id);
                    if (v < 0.12) break;
                    // 唔好自己估有冇嘢飛：sim 喺個事件度講咗（ADR-144）。
                    this.play(ev.projectile ? 'arrow' : 'swing', { volume: v });
                    break;
                }
                case 'cast': this.play('cast', { volume: near(ev.id) }); break;
                case 'boom': this.play('boom', { volume: 0.9 }); break;
                case 'heal': this.play('heal', { volume: near(ev.target) * 0.7 }); break;
                case 'levelup': if (ev.id === me.id) this.play('levelup'); break;
                case 'buy': if (ev.id === me.id) this.play('buy'); break;
                case 'warden': this.play('warden'); break;
                case 'cs': if (ev.id === me.id) this.play('buy', { volume: 0.5 }); break;
                case 'recallDone': if (ev.id === me.id) this.play('heal'); break;
                case 'tower': this.play('tower'); break;
                case 'death': {
                    const v = sim.champions.find(c => c.id === ev.id);
                    if (v) this.play(v.isPlayer ? 'death' : 'kill');
                    break;
                }
                default: break;
            }
        }
    }
}
