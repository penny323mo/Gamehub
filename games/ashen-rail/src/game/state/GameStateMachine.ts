export type GameState = "BOOT" | "LOADING" | "READY" | "TUTORIAL" | "PLAYING" | "PAUSED" | "WON" | "LOST" | "ERROR";

const ALLOWED: Record<GameState, ReadonlySet<GameState>> = {
  BOOT: new Set(["LOADING", "ERROR"]),
  LOADING: new Set(["READY", "ERROR"]),
  READY: new Set(["TUTORIAL", "LOADING", "ERROR"]),
  TUTORIAL: new Set(["PLAYING", "PAUSED", "LOST", "ERROR"]),
  PLAYING: new Set(["PAUSED", "WON", "LOST", "ERROR"]),
  PAUSED: new Set(["TUTORIAL", "PLAYING", "READY", "ERROR"]),
  WON: new Set(["READY", "TUTORIAL"]),
  LOST: new Set(["READY", "TUTORIAL"]),
  ERROR: new Set(["LOADING", "READY"])
};

export class GameStateMachine {
  private current: GameState = "BOOT";
  private previousPlayable: GameState = "PLAYING";
  private readonly listeners = new Set<(state: GameState, previous: GameState) => void>();

  get state(): GameState { return this.current; }
  get resumeState(): GameState { return this.previousPlayable; }
  canTransition(next: GameState): boolean { return ALLOWED[this.current].has(next); }

  transition(next: GameState): void {
    if (!this.canTransition(next)) throw new Error(`Invalid game-state transition: ${this.current} -> ${next}`);
    const previous = this.current;
    if ((previous === "TUTORIAL" || previous === "PLAYING") && next === "PAUSED") this.previousPlayable = previous;
    this.current = next;
    for (const listener of this.listeners) listener(next, previous);
  }

  onChange(listener: (state: GameState, previous: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
