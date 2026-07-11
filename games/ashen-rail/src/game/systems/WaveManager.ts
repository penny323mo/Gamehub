export type DroneVariant = "standard" | "kamikaze" | "elite";
export interface WaveDefinition { label: string; spawns: DroneVariant[]; }

export const WAVES: readonly WaveDefinition[] = [
  { label: "WAVE 1", spawns: ["standard", "standard", "standard"] },
  { label: "WAVE 2", spawns: ["standard", "kamikaze", "standard", "standard"] },
  { label: "FINAL WAVE", spawns: ["elite", "kamikaze", "elite", "kamikaze"] }
];

export type WaveEvent = { type: "spawn"; variant: DroneVariant } | { type: "intermission"; seconds: number } | { type: "won" };

export class WaveManager {
  waveIndex = -1;
  alive = 0;
  completed = false;
  private queue: DroneVariant[] = [];
  private spawnTimer = 0;
  private intermission = 0;

  reset(): void { this.waveIndex = -1; this.alive = 0; this.completed = false; this.queue = []; this.spawnTimer = 0; this.intermission = 0; }

  start(): void { this.startWave(0); }

  update(delta: number): WaveEvent[] {
    if (this.completed) return [];
    const events: WaveEvent[] = [];
    if (this.intermission > 0) {
      this.intermission = Math.max(0, this.intermission - delta);
      if (this.intermission === 0) this.startWave(this.waveIndex + 1);
      return events;
    }
    this.spawnTimer -= delta;
    if (this.queue.length > 0 && this.spawnTimer <= 0) {
      const variant = this.queue.shift();
      if (variant) events.push({ type: "spawn", variant });
      this.spawnTimer = 1.15;
    }
    return events;
  }

  confirmSpawn(variant: DroneVariant, success: boolean): void {
    if (success) this.alive += 1;
    else { this.queue.unshift(variant); this.spawnTimer = 0.45; }
  }

  enemyDefeated(): WaveEvent[] {
    this.alive = Math.max(0, this.alive - 1);
    if (this.alive > 0 || this.queue.length > 0 || this.completed) return [];
    if (this.waveIndex >= WAVES.length - 1) { this.completed = true; return [{ type: "won" }]; }
    this.intermission = 5;
    return [{ type: "intermission", seconds: 5 }];
  }

  get currentLabel(): string { return this.waveIndex >= 0 ? (WAVES[this.waveIndex]?.label ?? "") : "教學"; }
  get remaining(): number { return this.alive + this.queue.length; }
  get isIntermission(): boolean { return this.intermission > 0; }
  get intermissionRemaining(): number { return this.intermission; }

  private startWave(index: number): void {
    const wave = WAVES[index];
    if (!wave) { this.completed = true; return; }
    this.waveIndex = index;
    this.queue = [...wave.spawns];
    this.spawnTimer = 0.15;
  }
}
