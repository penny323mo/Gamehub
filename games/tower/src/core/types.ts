// ─── Core Types (no THREE imports) ───

export type TowerType = 'arrow' | 'cannon' | 'ice' | 'fire' | 'lightning' | 'poison' | 'sniper' | string;
export type EnemyType = 'grunt' | 'tank' | 'runner' | 'swarm' | 'shield' | 'healer' | 'boss';
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'sniper';
export type TargetingMode = 'first' | 'last' | 'strongest' | 'weakest';
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
    label: string;
    emoji: string;
    startGold: number;
    startLives: number;
    enemyHpMult: number;
    enemySpeedMult: number;
    goldMult: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
    easy: { label: 'Easy', emoji: '🟢', startGold: 600, startLives: 30, enemyHpMult: 0.75, enemySpeedMult: 0.9, goldMult: 1.2 },
    normal: { label: 'Normal', emoji: '🟡', startGold: 400, startLives: 20, enemyHpMult: 1.0, enemySpeedMult: 1.0, goldMult: 1.0 },
    hard: { label: 'Hard', emoji: '🔴', startGold: 250, startLives: 10, enemyHpMult: 1.4, enemySpeedMult: 1.15, goldMult: 0.8 },
};

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

export interface TowerEvolution {
    type: string;
    name: string;
    cost: number;
    desc: string;
}

export interface TowerConfig {
    name: string;
    damageType: DamageType;
    levels: TowerLevelConfig[];
    evolutions?: TowerEvolution[];
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
    aimAngle?: number;
    targetId?: number | null;
    kills: number;
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
    y: number;
    z: number;
    startX: number;
    startY: number;
    startZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    speed: number;
    progress: number;  // 0 to 1
    arcHeight: number; // >0 for parabolic flights
    alive: boolean;
}

export type GamePhase = 'idle' | 'prep' | 'wave' | 'won' | 'lost';

export interface FloatingText {
    id: number;
    worldX: number;
    worldZ: number;
    value: string;     // e.g. "-42" or "+50g"
    color: string;     // CSS color
    life: number;      // seconds remaining (starts at 1.0)
    maxLife: number;
}

export interface Skill {
    name: string;
    emoji: string;
    cooldown: number;     // total cooldown in seconds
    remaining: number;    // seconds until ready (0 = ready)
    description: string;
}

export interface GameStats {
    totalDamageDealt: number;
    damageByType: Record<string, number>;
    killsByTower: Record<string, number>;
    longestStreak: number;
    towersBuilt: number;
    towersSold: number;
    goldEarned: number;
    goldSpent: number;
}

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
    difficulty: Difficulty;

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
    lastWaveClearGold: number;  // M — gold bonus awarded on last wave clear
    milestoneReached: number;   // O — wave number of milestone (0 = none)
    waveModifier: string | null; // e.g. 'BLITZ' | 'ARMORED' | 'FRENZY'

    // C10 — Milestone buff multipliers (apply globally)
    buffGoldMult: number;       // multiplies enemy bounty on kill
    buffDamageMult: number;     // multiplies tower damage on projectile fire
    buffRangeMult: number;      // multiplies tower targeting range
    buffChoicePending: boolean; // true while milestone card modal is open

    // G24 — Endless mode
    endlessMode: boolean;       // if true, never transitions to 'won' phase

    nextId: number;

    // Kill Streak
    killStreak: number;
    killStreakTimer: number;  // counts down from 3s; resets streak on 0

    // Visual effects
    floatingTexts: FloatingText[];

    // Skills
    skills: Skill[];

    // Stats tracking
    stats: GameStats;

    // Derived (rebuilt each tick)
    pathWorld: Vec2[];
    occupiedCells: Set<string>;
    pathCells: Set<string>;
}

export function cellKey(col: number, row: number): string {
    return `${col},${row}`;
}
