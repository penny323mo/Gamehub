import type { GameState } from './types';
import { cellKey } from './types';
import { MAP } from './config';
import { buildPathWorld } from './path';

export function createInitialState(): GameState {
    const pathWorld = buildPathWorld();
    const pathCells = new Set<string>();
    for (const [c, r] of MAP.path) {
        pathCells.add(cellKey(c, r));
    }

    return {
        phase: 'idle',
        gold: 400,
        lives: 20,
        maxLives: 20,
        currentWave: 0,
        score: 0,
        perfectWaves: 0,
        speedMultiplier: 1,
        paused: false,
        totalKills: 0,

        towers: [],
        enemies: [],
        projectiles: [],

        prepTimer: 0,
        spawnTimers: [],
        spawnCounts: [],
        waveEnemiesSpawned: 0,
        waveEnemiesTotal: 0,
        waveLivesLostThisWave: 0,
        lastWaveClearGold: 0,
        milestoneReached: 0,

        nextId: 1,

        killStreak: 0,
        killStreakTimer: 0,

        floatingTexts: [],

        pathWorld,
        occupiedCells: new Set<string>(),
        pathCells,
    };
}

export function rebuildOccupied(state: GameState): void {
    state.occupiedCells.clear();
    for (const t of state.towers) {
        state.occupiedCells.add(cellKey(t.col, t.row));
    }
}
