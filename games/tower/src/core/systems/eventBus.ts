// ─── Event Bus — decouples game logic from UI ───

export type GameEvent =
    | { type: 'enemyKilled'; enemyId: number; worldX: number; worldZ: number; bounty: number; killStreak: number }
    | { type: 'towerBuilt'; towerId: number; towerType: string; col: number; row: number }
    | { type: 'towerSold'; towerId: number; refund: number; worldX: number; worldZ: number }
    | { type: 'towerUpgraded'; towerId: number; newLevel: number }
    | { type: 'towerFired'; towerId: number; towerType: string; worldX: number; worldZ: number; aimAngle: number }
    | { type: 'aoeImpact'; worldX: number; worldZ: number; radius: number; towerType: string }
    | { type: 'bossSpawned'; enemyId: number; worldX: number; worldZ: number }
    | { type: 'waveStarted'; wave: number }
    | { type: 'waveCleared'; wave: number; goldBonus: number; perfect: boolean }
    | { type: 'milestone'; wave: number }
    | { type: 'gameOver'; won: boolean; score: number }
    | { type: 'streakBonus'; streak: number; gold: number }
    | { type: 'skillUsed'; skill: string }
    | { type: 'enemyReachedGoal'; enemyId: number; livesRemaining: number };

type Listener<T extends GameEvent['type']> = (event: Extract<GameEvent, { type: T }>) => void;

class EventBus {
    private listeners = new Map<string, Function[]>();

    on<T extends GameEvent['type']>(type: T, listener: Listener<T>): void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type)!.push(listener);
    }

    off<T extends GameEvent['type']>(type: T, listener: Listener<T>): void {
        const arr = this.listeners.get(type);
        if (!arr) return;
        const idx = arr.indexOf(listener);
        if (idx >= 0) arr.splice(idx, 1);
    }

    emit(event: GameEvent): void {
        const arr = this.listeners.get(event.type);
        if (!arr) return;
        for (const fn of arr) {
            fn(event);
        }
    }

    clear(): void {
        this.listeners.clear();
    }
}

export const bus = new EventBus();
