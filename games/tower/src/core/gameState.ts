import type { GameState, Difficulty, Skill, GameStats } from './types';
import { cellKey, DIFFICULTIES } from './types';
import { MAP } from './config';
import { buildPathWorld } from './path';

function createSkills(): Skill[] {
    return [
        { name: 'Airstrike', emoji: '✈️', cooldown: 60, remaining: 0, description: 'All enemies take 200 AOE damage' },
        { name: 'Freeze', emoji: '🧊', cooldown: 45, remaining: 0, description: 'Freeze all enemies for 5s' },
        { name: 'Repair', emoji: '💖', cooldown: 90, remaining: 0, description: 'Restore 5 lives' },
    ];
}

function createStats(): GameStats {
    return {
        totalDamageDealt: 0,
        damageByType: {},
        killsByTower: {},
        longestStreak: 0,
        towersBuilt: 0,
        towersSold: 0,
        goldEarned: 0,
        goldSpent: 0,
    };
}

export function createInitialState(difficulty: Difficulty = 'normal'): GameState {
    const pathWorld = buildPathWorld();
    const pathCells = new Set<string>();
    for (const [c, r] of MAP.path) {
        pathCells.add(cellKey(c, r));
    }

    const cfg = DIFFICULTIES[difficulty];

    return {
        phase: 'idle',
        gold: cfg.startGold,
        lives: cfg.startLives,
        maxLives: cfg.startLives,
        currentWave: 0,
        score: 0,
        perfectWaves: 0,
        speedMultiplier: 1,
        paused: false,
        totalKills: 0,
        difficulty,

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

        skills: createSkills(),
        stats: createStats(),

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
