export type MusicPhase = 'prep' | 'wave' | 'off';

export class AudioSystem {
    private ctx: AudioContext | null = null;
    private enabled = true;

    // D13 — persistent background music nodes
    private musicStarted = false;
    private musicMaster: GainNode | null = null;
    private prepGain: GainNode | null = null;
    private waveGain: GainNode | null = null;
    private musicPhase: MusicPhase = 'off';
    private waveBeatTimer: number | null = null;

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.musicMaster && this.ctx) {
            this.musicMaster.gain.linearRampToValueAtTime(
                this.enabled ? 1 : 0,
                this.ctx.currentTime + 0.2
            );
        }
        return this.enabled;
    }

    private playTone(freq: number, type: OscillatorType, duration: number, vol: number) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playShoot() {
        this.playTone(400, 'square', 0.1, 0.05);
    }

    playHit() {
        this.playTone(150, 'sawtooth', 0.15, 0.05);
    }

    playBuild() {
        this.playTone(600, 'sine', 0.2, 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.2, 0.1), 100);
    }

    playSell() {
        this.playTone(500, 'triangle', 0.2, 0.1);
        setTimeout(() => this.playTone(300, 'triangle', 0.3, 0.1), 100);
    }
    
    playError() {
        this.playTone(100, 'sawtooth', 0.2, 0.1);
    }

    /** Ascending arpeggio for kill streak milestones. */
    playStreakStinger() {
        if (!this.enabled || !this.ctx) return;
        const notes = [523, 659, 784, 988]; // C5 E5 G5 B5
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.18, 0.06), i * 60);
        });
    }

    /** Mega-streak hit (≥10): bigger fanfare. */
    playMegaStingerHit() {
        if (!this.enabled || !this.ctx) return;
        const notes = [392, 523, 659, 784, 1047]; // G4 C5 E5 G5 C6
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.22, 0.07), i * 70);
        });
    }

    /** Low rumbling roar on boss spawn. */
    playBossRoar() {
        if (!this.enabled || !this.ctx) return;
        const ctx = this.ctx;
        const t0 = ctx.currentTime;

        // Low sweep
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, t0);
        osc.frequency.exponentialRampToValueAtTime(28, t0 + 0.9);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, t0);
        g.gain.exponentialRampToValueAtTime(0.01, t0 + 1.0);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t0); osc.stop(t0 + 1.05);

        // Noise burst layer
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        const noise = ctx.createBufferSource(); noise.buffer = buf;
        const nG = ctx.createGain(); nG.gain.setValueAtTime(0.08, t0);
        nG.gain.exponentialRampToValueAtTime(0.01, t0 + 0.8);
        const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 400;
        noise.connect(nf); nf.connect(nG); nG.connect(ctx.destination);
        noise.start(t0); noise.stop(t0 + 0.8);
    }

    /** Ascending major chord for victory. */
    playVictory() {
        if (!this.enabled || !this.ctx) return;
        const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.35, 0.08), i * 110);
        });
    }

    /** Descending minor drop for defeat. */
    playDefeat() {
        if (!this.enabled || !this.ctx) return;
        const notes = [523, 466, 392, 311]; // C5 Bb4 G4 Eb4
        notes.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.4, 0.08), i * 150);
        });
    }

    /** D13 — Start adaptive ambient music (idempotent). */
    startMusic() {
        if (this.musicStarted || !this.ctx) return;
        this.musicStarted = true;
        const ctx = this.ctx;

        const master = ctx.createGain();
        master.gain.value = this.enabled ? 1 : 0;
        master.connect(ctx.destination);
        this.musicMaster = master;

        // Shared drone — slow detuned pair on A1/E2 through lowpass
        const drone = ctx.createGain();
        drone.gain.value = 0.035;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 420;
        lp.Q.value = 0.4;
        drone.connect(lp);
        lp.connect(master);
        for (const f of [55, 82]) {
            const o = ctx.createOscillator();
            o.type = 'sine';
            o.frequency.value = f;
            // slow detune for movement
            const lfo = ctx.createOscillator();
            lfo.frequency.value = 0.07;
            const lfoG = ctx.createGain();
            lfoG.gain.value = 2.5;
            lfo.connect(lfoG);
            lfoG.connect(o.frequency);
            o.connect(drone);
            o.start();
            lfo.start();
        }

        // Prep layer: slow triangle pad, fades in during prep
        const prepGain = ctx.createGain();
        prepGain.gain.value = 0;
        prepGain.connect(master);
        this.prepGain = prepGain;
        for (const f of [220, 329.63, 440]) { // A3 E4 A4
            const o = ctx.createOscillator();
            o.type = 'triangle';
            o.frequency.value = f;
            const g = ctx.createGain();
            g.gain.value = 0.02;
            o.connect(g);
            g.connect(prepGain);
            o.start();
        }

        // Wave layer: higher detuned saw through bandpass, fades in during wave
        const waveGain = ctx.createGain();
        waveGain.gain.value = 0;
        waveGain.connect(master);
        this.waveGain = waveGain;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 600;
        bp.Q.value = 1.4;
        bp.connect(waveGain);
        for (const f of [110, 164.81, 220]) { // A2 E3 A3
            const o = ctx.createOscillator();
            o.type = 'sawtooth';
            o.frequency.value = f;
            const g = ctx.createGain();
            g.gain.value = 0.018;
            o.connect(g);
            g.connect(bp);
            o.start();
        }
    }

    /** D13 — Crossfade into target phase. */
    setMusicPhase(phase: MusicPhase) {
        if (!this.ctx) return;
        if (!this.musicStarted) this.startMusic();
        if (this.musicPhase === phase) return;
        this.musicPhase = phase;
        const now = this.ctx.currentTime;
        const fade = 1.4;

        const prepTarget = phase === 'prep' ? 0.7 : 0;
        const waveTarget = phase === 'wave' ? 0.85 : 0;
        if (this.prepGain) {
            this.prepGain.gain.cancelScheduledValues(now);
            this.prepGain.gain.setValueAtTime(this.prepGain.gain.value, now);
            this.prepGain.gain.linearRampToValueAtTime(prepTarget, now + fade);
        }
        if (this.waveGain) {
            this.waveGain.gain.cancelScheduledValues(now);
            this.waveGain.gain.setValueAtTime(this.waveGain.gain.value, now);
            this.waveGain.gain.linearRampToValueAtTime(waveTarget, now + fade);
        }

        // Percussive pulses during wave phase only
        if (this.waveBeatTimer !== null) {
            clearInterval(this.waveBeatTimer);
            this.waveBeatTimer = null;
        }
        if (phase === 'wave') {
            this.waveBeatTimer = window.setInterval(() => {
                if (!this.enabled || !this.ctx || this.musicPhase !== 'wave') return;
                const c = this.ctx;
                const t0 = c.currentTime;
                const o = c.createOscillator();
                o.type = 'sine';
                o.frequency.setValueAtTime(90, t0);
                o.frequency.exponentialRampToValueAtTime(40, t0 + 0.18);
                const g = c.createGain();
                g.gain.setValueAtTime(0.08, t0);
                g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
                o.connect(g);
                if (this.musicMaster) g.connect(this.musicMaster);
                o.start(t0);
                o.stop(t0 + 0.22);
            }, 620);
        }
    }
}

export const audioSystem = new AudioSystem();
