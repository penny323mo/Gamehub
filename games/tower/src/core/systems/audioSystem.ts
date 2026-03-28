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
}

export const audioSystem = new AudioSystem();
