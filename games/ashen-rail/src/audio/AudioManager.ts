export interface AudioSettings { master: number; music: number; sfx: number; muted: boolean; }

export class AudioManager {
  private context?: AudioContext;
  settings: AudioSettings;
  private railTimer?: number;

  constructor() {
    try { this.settings = { master: 0.8, music: 0.35, sfx: 0.75, muted: false, ...JSON.parse(localStorage.getItem("ashenRail.audio") ?? "{}") }; }
    catch { this.settings = { master: 0.8, music: 0.35, sfx: 0.75, muted: false }; }
  }

  async unlock(): Promise<void> {
    this.context ??= new AudioContext(); await this.context.resume();
    if (!this.railTimer) this.railTimer = window.setInterval(() => this.tone(54, 0.13, "sawtooth", 0.035 * this.settings.music), 420);
  }

  fire(): void { this.noiseBurst(0.08, 0.23); this.tone(90, 0.1, "square", 0.13); }
  hit(): void { this.tone(680, 0.045, "triangle", 0.1); }
  explosion(): void { this.noiseBurst(0.24, 0.2); this.tone(46, 0.28, "sawtooth", 0.12); }
  alert(): void { this.tone(230, 0.15, "square", 0.07); window.setTimeout(() => this.tone(180, 0.18, "square", 0.07), 170); }
  click(): void { this.tone(420, 0.035, "sine", 0.05); }
  victory(): void { [392, 523, 659].forEach((frequency, index) => window.setTimeout(() => this.tone(frequency, 0.25, "triangle", 0.08), index * 150)); }
  defeat(): void { [220, 174, 130].forEach((frequency, index) => window.setTimeout(() => this.tone(frequency, 0.28, "sawtooth", 0.07), index * 180)); }

  private tone(frequency: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.context || this.settings.muted) return;
    const oscillator = this.context.createOscillator(); const gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(volume * this.settings.master * this.settings.sfx, this.context.currentTime); gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination); oscillator.start(); oscillator.stop(this.context.currentTime + duration);
  }

  private noiseBurst(duration: number, volume: number): void {
    if (!this.context || this.settings.muted) return;
    const length = Math.floor(this.context.sampleRate * duration); const buffer = this.context.createBuffer(1, length, this.context.sampleRate); const data = buffer.getChannelData(0);
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length);
    const source = this.context.createBufferSource(); const gain = this.context.createGain(); source.buffer = buffer; gain.gain.value = volume * this.settings.master * this.settings.sfx; source.connect(gain).connect(this.context.destination); source.start();
  }
}
