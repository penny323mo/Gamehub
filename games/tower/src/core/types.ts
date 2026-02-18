// ─── Core Types (no THREE imports) ───

export type TowerType = 'arrow' | 'cannon' | 'ice';
export type EnemyType = 'grunt' | 'tank' | 'runner';

export interface Vec2 { x: number; z: number; }

export interface SlowConfig {
    pct: number;
    durationSec: number;
}

export interface TowerLevelConfig {
    buildCost: number;
    upgradeCost: number;
    damage: number;
    cooldownSec: number;
    range: number;
    slow: SlowConfig | null;
    aoeRadius: number;
}

export interface TowerConfig {
    name: string;
    levels: TowerLevelConfig[];
}

export interface EnemyConfig {
    name: string;
    hp: number;
    speed: number;
    bounty: number;
}

export interface SpawnGroup {
    type: EnemyType;
    count: number;
    intervalSec: number;
}

export interface WaveConfig {
    groups: SpawnGroup[];
}

export interface WavesConfig {
    prepSec: number;
    waves: WaveConfig[];
}

export interface MapConfig {
    cols: number;
    rows: number;
    cellSize: number;
    origin: { x: number; z: number };
    path: number[][];
    spawnCell: number[];
    goalCell: number[];
}

export interface ScoringConfig {
    waveScore: number;
    lifeBonus: number;
    perfectWaveBonus: number;
    ranks: { name: string; min: number }[];
}

// ─── Runtime entities ───

export interface Tower {
    id: number;
    type: TowerType;
    level: number; // 0-based
    col: number;
    row: number;
    worldX: number;
    worldZ: number;
    cooldownRemaining: number;
    totalInvested: number;
}

export interface SlowEffect {
    pct: number;
    remaining: number;
}

export interface Enemy {
    id: number;
    type: EnemyType;
    hp: number;
    maxHp: number;
    speed: number;
    bounty: number;
    pathIndex: number;     // current segment index
    pathProgress: number;  // 0-1 within segment
    worldX: number;
    worldZ: number;
    prevWorldX: number;
    prevWorldZ: number;
    alive: boolean;
    reached: boolean;
    slow: SlowEffect | null;
}

export interface Projectile {
    id: number;
    fromTowerId: number;
    targetEnemyId: number;
    towerType: TowerType;
    damage: number;
    aoeRadius: number;
    slow: SlowConfig | null;
    x: number;
    z: number;
    targetX: number;
    targetZ: number;
    speed: number;
    alive: boolean;
}

export type GamePhase = 'idle' | 'prep' | 'wave' | 'won' | 'lost';

export interface GameState {
    phase: GamePhase;
    gold: number;
    lives: number;
    maxLives: number;
    currentWave: number; // 0-based
    score: number;
    perfectWaves: number;
    speedMultiplier: number;

    towers: Tower[];
    enemies: Enemy[];
    projectiles: Projectile[];

    // Wave state
    prepTimer: number;
    spawnTimers: number[];
    spawnCounts: number[];
    waveEnemiesSpawned: number;
    waveEnemiesTotal: number;
    waveLivesLostThisWave: number;

    nextId: number;

    // Derived (rebuilt each tick)
    pathWorld: Vec2[];
    occupiedCells: Set<string>;
    pathCells: Set<string>;
}

export function cellKey(col: number, row: number): string {
    return `${col},${row}`;
}
