// ─── Core Types (no THREE imports) ───

export type TowerType = 'arrow' | 'cannon' | 'ice' | 'fire' | 'lightning' | 'poison' | 'sniper';
export type EnemyType = 'grunt' | 'tank' | 'runner' | 'swarm' | 'shield' | 'healer' | 'boss';
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'sniper';
export type TargetingMode = 'first' | 'last' | 'strongest' | 'weakest';

export interface Vec2 { x: number; z: number; }

export interface SlowConfig {
    pct: number;
    durationSec: number;
}

export interface DotConfig {
    dps: number;         // damage per second
    durationSec: number;
}

export interface ChainConfig {
    targets: number;     // how many extra enemies to jump to
    rangeFalloff: number; // range for chain jump
}

export interface TowerLevelConfig {
    buildCost: number;
    upgradeCost: number;
    damage: number;
    cooldownSec: number;
    range: number;
    slow: SlowConfig | null;
    aoeRadius: number;
    dot: DotConfig | null;
    chain: ChainConfig | null;
}

export interface TowerConfig {
    name: string;
    damageType: DamageType;
    levels: TowerLevelConfig[];
}

export interface EnemyConfig {
    name: string;
    hp: number;
    speed: number;
    bounty: number;
    weakness: DamageType[];
    resistance: DamageType[];
    armor: number;        // flat damage reduction
    shield: number;       // absorb shield HP (blocks first N dmg)
    special: string;      // 'none' | 'heal' | 'shield_regen'
    healRadius?: number;
    healAmount?: number;
    healIntervalSec?: number;
    shieldRegenDelay?: number;
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
    targetingMode: TargetingMode;
}

export interface SlowEffect {
    pct: number;
    remaining: number;
}

export interface DotEffect {
    dps: number;
    remaining: number;
    damageType: DamageType;
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
    dots: DotEffect[];
    shield: number;
    maxShield: number;
    armor: number;
    special: string;
    healCooldown: number;
}

export interface Projectile {
    id: number;
    fromTowerId: number;
    targetEnemyId: number;
    towerType: TowerType;
    damageType: DamageType;
    damage: number;
    aoeRadius: number;
    slow: SlowConfig | null;
    dot: DotConfig | null;
    chain: ChainConfig | null;
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
    paused: boolean;
    totalKills: number;

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
