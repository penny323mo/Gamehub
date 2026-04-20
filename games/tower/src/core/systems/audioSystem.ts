export class AudioSystem {
    private ctx: AudioContext | null = null;
    private enabled = true;

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
}

export const audioSystem = new AudioSystem();
