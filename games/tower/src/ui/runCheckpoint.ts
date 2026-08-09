import { MAP, TOWERS, WAVES } from '../core/config';
import { createInitialState, rebuildOccupied } from '../core/gameState';
import { LAYOUT } from '../core/mapLayout';
import { cellToWorld } from '../core/path';
import type { Difficulty, GameState, GameStats, TargetingMode, Tower, TowerType } from '../core/types';

export const RUN_CHECKPOINT_KEY = 'tower-defense-run-v1';
const CHECKPOINT_VERSION = 1;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const TARGETING_MODES = new Set<TargetingMode>(['first', 'last', 'strongest', 'weakest']);
const DIFFICULTIES = new Set<Difficulty>(['easy', 'normal', 'hard']);

interface StoredTower {
    id: number;
    type: TowerType;
    level: number;
    col: number;
    row: number;
    totalInvested: number;
    targetingMode: TargetingMode;
    kills: number;
}

export interface RunCheckpoint {
    version: 1;
    savedAt: number;
    difficulty: Difficulty;
    currentWave: number;
    gold: number;
    lives: number;
    maxLives: number;
    score: number;
    perfectWaves: number;
    totalKills: number;
    endlessMode: boolean;
    waveModifier: string | null;
    nextId: number;
    towers: StoredTower[];
    skillRemaining: number[];
    buffGoldMult: number;
    buffDamageMult: number;
    buffRangeMult: number;
    stats: GameStats;
}

function finite(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number {
    return finite(value, min, max) && Number.isInteger(value);
}

function validStats(value: unknown): value is GameStats {
    if (!value || typeof value !== 'object') return false;
    const stats = value as Partial<GameStats>;
    return finite(stats.totalDamageDealt)
        && !!stats.damageByType && typeof stats.damageByType === 'object'
        && Object.values(stats.damageByType).every((amount) => finite(amount))
        && !!stats.killsByTower && typeof stats.killsByTower === 'object'
        && Object.values(stats.killsByTower).every((amount) => integer(amount))
        && integer(stats.longestStreak)
        && integer(stats.towersBuilt)
        && integer(stats.towersSold)
        && finite(stats.goldEarned)
        && finite(stats.goldSpent);
}

function validTower(value: unknown): value is StoredTower {
    if (!value || typeof value !== 'object') return false;
    const tower = value as Partial<StoredTower>;
    const config = typeof tower.type === 'string' ? TOWERS[tower.type] : undefined;
    return integer(tower.id, 1)
        && !!config
        && integer(tower.level, 0, config.levels.length - 1)
        && integer(tower.col, 0, MAP.cols - 1)
        && integer(tower.row, 0, MAP.rows - 1)
        && LAYOUT.cellAt(tower.col as number, tower.row as number).buildable
        && finite(tower.totalInvested)
        && typeof tower.targetingMode === 'string'
        && TARGETING_MODES.has(tower.targetingMode as TargetingMode)
        && integer(tower.kills);
}

function isCheckpoint(value: unknown): value is RunCheckpoint {
    if (!value || typeof value !== 'object') return false;
    const checkpoint = value as Partial<RunCheckpoint>;
    const maxWave = checkpoint.endlessMode ? 100_000 : WAVES.waves.length - 1;
    if (checkpoint.version !== CHECKPOINT_VERSION
        || !finite(checkpoint.savedAt, 1)
        || Date.now() - checkpoint.savedAt > MAX_AGE_MS
        || checkpoint.savedAt > Date.now() + 60_000
        || typeof checkpoint.difficulty !== 'string'
        || !DIFFICULTIES.has(checkpoint.difficulty as Difficulty)
        || !integer(checkpoint.currentWave, 0, maxWave)
        || !finite(checkpoint.gold)
        || !integer(checkpoint.lives)
        || !integer(checkpoint.maxLives, 1)
        || (checkpoint.lives as number) > (checkpoint.maxLives as number)
        || !finite(checkpoint.score)
        || !integer(checkpoint.perfectWaves)
        || !integer(checkpoint.totalKills)
        || typeof checkpoint.endlessMode !== 'boolean'
        || !(checkpoint.waveModifier === null
            || checkpoint.waveModifier === 'BLITZ'
            || checkpoint.waveModifier === 'ARMORED'
            || checkpoint.waveModifier === 'FRENZY')
        || !integer(checkpoint.nextId, 1)
        || !Array.isArray(checkpoint.towers)
        || checkpoint.towers.length > MAP.cols * MAP.rows
        || !checkpoint.towers.every(validTower)
        || !Array.isArray(checkpoint.skillRemaining)
        || !checkpoint.skillRemaining.every((remaining) => finite(remaining, 0, 24 * 60 * 60))
        || !finite(checkpoint.buffGoldMult, 0.1, 100)
        || !finite(checkpoint.buffDamageMult, 0.1, 100)
        || !finite(checkpoint.buffRangeMult, 0.1, 100)
        || !validStats(checkpoint.stats)) return false;

    const ids = new Set<number>();
    const cells = new Set<string>();
    for (const tower of checkpoint.towers) {
        const cell = `${tower.col},${tower.row}`;
        if (ids.has(tower.id) || cells.has(cell)) return false;
        ids.add(tower.id);
        cells.add(cell);
    }
    return true;
}

export function saveRunCheckpoint(state: GameState): boolean {
    if (state.phase !== 'prep' || state.buffChoicePending
        || state.enemies.some((enemy) => enemy.alive && !enemy.reached)
        || state.projectiles.some((projectile) => projectile.alive)) return false;

    const checkpoint: RunCheckpoint = {
        version: CHECKPOINT_VERSION,
        savedAt: Date.now(),
        difficulty: state.difficulty,
        currentWave: state.currentWave,
        gold: state.gold,
        lives: state.lives,
        maxLives: state.maxLives,
        score: state.score,
        perfectWaves: state.perfectWaves,
        totalKills: state.totalKills,
        endlessMode: state.endlessMode,
        waveModifier: state.waveModifier,
        nextId: state.nextId,
        towers: state.towers.map((tower) => ({
            id: tower.id,
            type: tower.type,
            level: tower.level,
            col: tower.col,
            row: tower.row,
            totalInvested: tower.totalInvested,
            targetingMode: tower.targetingMode,
            kills: tower.kills,
        })),
        skillRemaining: state.skills.map((skill) => skill.remaining),
        buffGoldMult: state.buffGoldMult,
        buffDamageMult: state.buffDamageMult,
        buffRangeMult: state.buffRangeMult,
        stats: structuredClone(state.stats),
    };

    try {
        localStorage.setItem(RUN_CHECKPOINT_KEY, JSON.stringify(checkpoint));
        return true;
    } catch {
        return false;
    }
}

export function loadRunCheckpoint(): RunCheckpoint | null {
    try {
        const raw = localStorage.getItem(RUN_CHECKPOINT_KEY);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        if (isCheckpoint(parsed)) return parsed;
        localStorage.removeItem(RUN_CHECKPOINT_KEY);
    } catch {
        try { localStorage.removeItem(RUN_CHECKPOINT_KEY); } catch { /* unavailable storage */ }
    }
    return null;
}

export function clearRunCheckpoint(): void {
    try { localStorage.removeItem(RUN_CHECKPOINT_KEY); } catch { /* unavailable storage */ }
}

export function restoreRunCheckpoint(checkpoint: RunCheckpoint, speedMultiplier: number): GameState {
    const restored = createInitialState(checkpoint.difficulty);
    restored.currentWave = checkpoint.currentWave;
    restored.gold = checkpoint.gold;
    restored.lives = checkpoint.lives;
    restored.maxLives = checkpoint.maxLives;
    restored.score = checkpoint.score;
    restored.perfectWaves = checkpoint.perfectWaves;
    restored.totalKills = checkpoint.totalKills;
    restored.endlessMode = checkpoint.endlessMode;
    restored.waveModifier = checkpoint.waveModifier;
    restored.nextId = checkpoint.nextId;
    restored.speedMultiplier = speedMultiplier;
    restored.buffGoldMult = checkpoint.buffGoldMult;
    restored.buffDamageMult = checkpoint.buffDamageMult;
    restored.buffRangeMult = checkpoint.buffRangeMult;
    restored.stats = structuredClone(checkpoint.stats);
    restored.skills = restored.skills.map((skill, index) => ({
        ...skill,
        remaining: checkpoint.skillRemaining[index] ?? 0,
    }));
    restored.towers = checkpoint.towers.map((saved): Tower => {
        const world = cellToWorld(saved.col, saved.row);
        return {
            ...saved,
            worldX: world.x,
            worldZ: world.z,
            cooldownRemaining: 0,
            aimAngle: 0,
            targetId: null,
        };
    });
    const maxTowerId = restored.towers.reduce((max, tower) => Math.max(max, tower.id), 0);
    restored.nextId = Math.max(restored.nextId, maxTowerId + 1);
    rebuildOccupied(restored);
    return restored;
}
