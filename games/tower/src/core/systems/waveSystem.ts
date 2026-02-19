import type { GameState, Enemy, EnemyType, DamageType } from '../types';
import { WAVES, ENEMIES } from '../config';
import { cellToWorld } from '../path';
import { MAP } from '../config';

/** Start the next wave (enters prep phase) */
export function startNextWave(state: GameState): void {
    if (state.currentWave >= WAVES.waves.length) return;
    state.phase = 'prep';
    state.prepTimer = WAVES.prepSec;
    state.waveLivesLostThisWave = 0;

    const wave = WAVES.waves[state.currentWave];
    state.spawnTimers = wave.groups.map(() => 0);
    state.spawnCounts = wave.groups.map(() => 0);
    state.waveEnemiesSpawned = 0;
    state.waveEnemiesTotal = wave.groups.reduce((s, g) => s + g.count, 0);
}

/** Tick the wave system */
export function tickWave(state: GameState, dt: number): void {
    if (state.phase === 'prep') {
        state.prepTimer -= dt;
        if (state.prepTimer <= 0) {
            state.phase = 'wave';
        }
        return;
    }

    if (state.phase !== 'wave') return;

    const wave = WAVES.waves[state.currentWave];
    if (!wave) return;

    // Spawn enemies
    for (let g = 0; g < wave.groups.length; g++) {
        const group = wave.groups[g];
        if (state.spawnCounts[g] >= group.count) continue;

        state.spawnTimers[g] -= dt;
        if (state.spawnTimers[g] <= 0) {
            spawnEnemy(state, group.type);
            state.spawnCounts[g]++;
            state.waveEnemiesSpawned++;
            state.spawnTimers[g] = group.intervalSec;
        }
    }

    // Check wave complete
    const allSpawned = state.waveEnemiesSpawned >= state.waveEnemiesTotal;
    const allDead = state.enemies.every(e => !e.alive || e.reached);

    if (allSpawned && allDead) {
        // Score this wave
        state.score += state.currentWave < WAVES.waves.length ? 100 : 0;
        if (state.waveLivesLostThisWave === 0) {
            state.score += 150; // perfectWaveBonus
            state.perfectWaves++;
        }

        // M — Wave Clear Gold Bonus (scales with wave number)
        const wave = state.currentWave + 1; // human-readable wave number just completed
        let waveGoldBonus = 100;
        if (wave > 60) waveGoldBonus = 250;
        else if (wave > 30) waveGoldBonus = 200;
        else if (wave > 10) waveGoldBonus = 150;
        state.gold += waveGoldBonus;
        state.lastWaveClearGold = waveGoldBonus;

        // O — Milestone Wave bonus at Wave 25 / 50 / 75 / 99
        const MILESTONES = [25, 50, 75, 99];
        if (MILESTONES.includes(wave)) {
            state.gold += 500;
            state.milestoneReached = wave;
        } else {
            state.milestoneReached = 0;
        }

        state.currentWave++;
        // Clean up dead enemies
        state.enemies = state.enemies.filter(e => e.alive && !e.reached);
        state.projectiles = state.projectiles.filter(p => p.alive);

        if (state.currentWave >= WAVES.waves.length) {
            state.score += state.lives * 25; // lifeBonus
            state.phase = 'won';
        } else {
            startNextWave(state);
        }
    }
}

function spawnEnemy(state: GameState, type: EnemyType): void {
    const cfg = ENEMIES[type];
    const spawn = cellToWorld(MAP.path[0][0], MAP.path[0][1]);

    // Difficulty scaling: Linear 4% per wave + 1
    // Wave 0: 1x
    // Wave 50: 3x
    // Wave 99: 5x
    const difficultyMultiplier = 1 + (state.currentWave * 0.04);

    const enemy: Enemy = {
        id: state.nextId++,
        type,
        hp: Math.ceil(cfg.hp * difficultyMultiplier),
        maxHp: Math.ceil(cfg.hp * difficultyMultiplier),
        speed: cfg.speed,
        bounty: Math.ceil(cfg.bounty * Math.pow(difficultyMultiplier, 0.5)),
        pathIndex: 0,
        pathProgress: 0,
        worldX: spawn.x,
        worldZ: spawn.z,
        prevWorldX: spawn.x,
        prevWorldZ: spawn.z,
        alive: true,
        reached: false,
        slow: null,
        dots: [],
        shield: cfg.shield ? Math.ceil(cfg.shield * difficultyMultiplier) : 0,
        maxShield: cfg.shield ? Math.ceil(cfg.shield * difficultyMultiplier) : 0,
        armor: cfg.armor ?? 0,
        special: cfg.special ?? 'none',
        healCooldown: 0,
    };

    state.enemies.push(enemy);
}
