export class GameSessionModel {
  enemies = new Set<string>();
  state = "READY";
  reset(): void { this.enemies.clear(); this.state = "READY"; }
}
