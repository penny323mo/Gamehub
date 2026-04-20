import type { GameState, Enemy, EnemyType, DamageType } from '../types';
import { DIFFICULTIES } from '../types';
import { WAVES, ENEMIES } from '../config';
import { cellToWorld } from '../path';
import { MAP } from '../config';
import { bus } from './eventBus';

export interface ModifierEffect {
    key: string;
    label: string;
    emoji: string;
    desc: string;
    spdMult: number;
    hpMult: number;
    armorBonus: number;
    bountyMult: number;
}

export const MODIFIERS: Record<string, ModifierEffect> = {
    BLITZ:   { key: 'BLITZ',   label: 'BLITZ',   emoji: '⚡', desc: '+25% SPD, +30% gold',        spdMult: 1.25, hpMult: 1.00, armorBonus: 0, bountyMult: 1.30 },
    ARMORED: { key: 'ARMORED', label: 'ARMORED', emoji: '🛡', desc: '+3 armor, +20% gold',        spdMult: 1.00, hpMult: 1.00, armorBonus: 3, bountyMult: 1.20 },
    FRENZY:  { key: 'FRENZY',  label: 'FRENZY',  emoji: '🔥', desc: '+15% HP, +15% SPD, +25% gold', spdMult: 1.15, hpMult: 1.15, armorBonus: 0, bountyMult: 1.25 },
};

const MODIFIER_KEYS = Object.keys(MODIFIERS);

/** Roll a modifier for the given wave number (1-based). Returns null if no modifier. */
function rollModifier(waveNumber1Based: number): string | null {
    // Every 5 waves, except on milestone waves (25/50/75/99 keep their own flavor)
    if (waveNumber1Based % 5 !== 0) return null;
    if (waveNumber1Based === 25 || waveNumber1Based === 50 || waveNumber1Based === 75 || waveNumber1Based === 99) return null;
    return MODIFIER_KEYS[Math.floor(Math.random() * MODIFIER_KEYS.length)];
}

/** G24 — Map absolute wave index to a template index, wrapping in endless mode. */
function templateIndex(state: GameState): number {
    if (state.currentWave < WAVES.waves.length) return state.currentWave;
    // Endless: loop through back half of the wave list for variety + scale.
    const loopLen = Math.max(1, WAVES.waves.length - 40); // reuse waves 40..98
    return 40 + (state.currentWave - WAVES.waves.length) % loopLen;
}

/** Start the next wave (enters prep phase) */
export function startNextWave(state: GameState): void {
    if (state.currentWave >= WAVES.waves.length && !state.endlessMode) return;
    state.phase = 'prep';
    state.prepTimer = WAVES.prepSec;
    state.waveLivesLostThisWave = 0;

    const wave = WAVES.waves[templateIndex(state)];
    state.spawnTimers = wave.groups.map(() => 0);
    state.spawnCounts = wave.groups.map(() => 0);
    state.waveEnemiesSpawned = 0;
    state.waveEnemiesTotal = wave.groups.reduce((s, g) => s + g.count, 0);

    // Roll wave modifier (1-based wave number)
    state.waveModifier = rollModifier(state.currentWave + 1);
}

/** Tick the wave system */
export function tickWave(state: GameState, dt: number): void {
    if (state.phase === 'prep') {
        state.prepTimer -= dt;
        if (state.prepTimer <= 0) {
            // A — Interest on held gold (1%, min 10g, max 150g)
            const interest = Math.min(150, Math.max(10, Math.floor(state.gold * 0.01)));
            state.gold += interest;
            state.floatingTexts.push({
                id: state.nextId++,
                worldX: 0,
                worldZ: 0,
                value: `+${interest}g 利息`,
                color: '#aaff55',
                life: 2.0,
                maxLife: 2.0,
            });
            state.phase = 'wave';
        }

        // B — Kill Streak timer decay
        if (state.killStreakTimer > 0) {
            state.killStreakTimer -= dt;
            if (state.killStreakTimer <= 0) {
                state.killStreak = 0;
                state.killStreakTimer = 0;
            }
        }
        return;
    }

    if (state.phase !== 'wave') return;

    // B — Kill Streak timer decay (also in wave phase)
    if (state.killStreakTimer > 0) {
        state.killStreakTimer -= dt;
        if (state.killStreakTimer <= 0) {
            state.killStreak = 0;
            state.killStreakTimer = 0;
        }
    }

    const wave = WAVES.waves[templateIndex(state)];
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
        else waveGoldBonus = 120; // 早期波次提升獎金
        state.gold += waveGoldBonus;
        state.lastWaveClearGold = waveGoldBonus;

        const perfect = state.waveLivesLostThisWave === 0;
        bus.emit({ type: 'waveCleared', wave, goldBonus: waveGoldBonus, perfect });

        // O — Milestone Wave bonus every 25 waves (25 / 50 / 75 / 99 + endless 100+)
        const isMilestone = wave === 99 || (wave > 0 && wave % 25 === 0);
        if (isMilestone) {
            state.gold += 500;
            state.milestoneReached = wave;
            bus.emit({ type: 'milestone', wave });
        } else {
            state.milestoneReached = 0;
        }

        state.currentWave++;
        // Clean up dead enemies
        state.enemies = state.enemies.filter(e => e.alive && !e.reached);
        state.projectiles = state.projectiles.filter(p => p.alive);

        if (state.currentWave >= WAVES.waves.length && !state.endlessMode) {
            state.score += state.lives * 25; // lifeBonus
            state.phase = 'won';
            bus.emit({ type: 'gameOver', won: true, score: state.score });
        } else {
            startNextWave(state);
        }
    }
}

function spawnEnemy(state: GameState, type: EnemyType): void {
    const cfg = ENEMIES[type];
    const spawn = cellToWorld(MAP.path[0][0], MAP.path[0][1]);
    const diffCfg = DIFFICULTIES[state.difficulty];

    // Difficulty scaling: Linear 4% per wave + difficulty multiplier
    const waveScale = 1 + (state.currentWave * 0.04);
    const mod = state.waveModifier ? MODIFIERS[state.waveModifier] : null;
    const hpMult = waveScale * diffCfg.enemyHpMult * (mod?.hpMult ?? 1);
    const spdMult = diffCfg.enemySpeedMult * (mod?.spdMult ?? 1);
    const bountyMult = Math.pow(waveScale, 0.5) * diffCfg.goldMult * (mod?.bountyMult ?? 1);
    const armorBonus = mod?.armorBonus ?? 0;

    const enemy: Enemy = {
        id: state.nextId++,
        type,
        hp: Math.ceil(cfg.hp * hpMult),
        maxHp: Math.ceil(cfg.hp * hpMult),
        speed: cfg.speed * spdMult,
        bounty: Math.ceil(cfg.bounty * bountyMult),
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
        shield: cfg.shield ? Math.ceil(cfg.shield * hpMult) : 0,
        maxShield: cfg.shield ? Math.ceil(cfg.shield * hpMult) : 0,
        armor: (cfg.armor ?? 0) + armorBonus,
        special: cfg.special ?? 'none',
        healCooldown: 0,
        shieldRegenTimer: 0,
    };

    state.enemies.push(enemy);

    if (type === 'boss') {
        bus.emit({
            type: 'bossSpawned',
            enemyId: enemy.id,
            worldX: enemy.worldX,
            worldZ: enemy.worldZ,
        });
    }
}
