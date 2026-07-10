export class PausableClock {
  elapsed = 0;
  paused = false;
  update(delta: number): void { if (!this.paused) this.elapsed += Math.max(0, delta); }
  reset(): void { this.elapsed = 0; this.paused = false; }
}
