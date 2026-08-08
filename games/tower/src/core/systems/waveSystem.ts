import type { GameState, Enemy, EnemyType, DamageType } from '../types';
import { DIFFICULTIES } from '../types';
import { WAVES, ENEMIES } from '../config';
import { HP_CURVE, HP_LINEAR, HP_CURVE_CAP } from '../config';
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
export function templateIndex(state: GameState): number {
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
            state.stats.goldEarned += interest;
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
        state.stats.goldEarned += waveGoldBonus;
        state.lastWaveClearGold = waveGoldBonus;

        const perfect = state.waveLivesLostThisWave === 0;
        bus.emit({ type: 'waveCleared', wave, goldBonus: waveGoldBonus, perfect });

        // O — Milestone Wave bonus every 25 waves (25 / 50 / 75 / 99 + endless 100+)
        const isMilestone = wave === 99 || (wave > 0 && wave % 25 === 0);
        if (isMilestone) {
            state.gold += 500;
            state.stats.goldEarned += 500;
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

export function spawnEnemy(state: GameState, type: EnemyType): void {
    const cfg = ENEMIES[type];
    const spawn = cellToWorld(MAP.path[0][0], MAP.path[0][1]);
    const diffCfg = DIFFICULTIES[state.difficulty];

    // 難度曲線：線性 4%／波，**再加一條二次項**。
    //
    // 淨線性嗰陣（`1 + wave*0.04`）實測係：一個「貼路起塔、有錢升級、升唔到再起」
    // 嘅政策打到第 41 波**一條命都冇跌**，每波最深滲透中位數得 0.03——即係怪
    // 喺頭三個 percent 就死晒。唔係佢冇能力殺人（封住 6 座塔第 30 波就死），
    // 係**你嘅防守長得快過佢哋嘅血**：塔第 26 波就起滿成張地圖。
    //
    // 二次項就係追返呢個差距：頭十波幾乎冇分別（wave 10 加 6%），中段開始追上
    // （wave 40 加 61%），後段變成主導（wave 80 加 2.4×）。個常數係**掃出嚟嘅**，
    // 唔係揀個靚數——見 ADR 同 `tests/playthrough.mjs`。
    const w = state.currentWave;
    // 二次項**封頂喺第 45 波**：純二次會令第 99 波去到 32×（連 455 隻敵人，
    // 冇人打得完）；封頂之後第 99 波係 8.2× 對原本 4.96×，即係後段只重咗
    // 六成幾，而第 40 波由 2.6× 升到 5.2×——追返嘅係中段嗰段真空。
    const 封 = Math.min(w, HP_CURVE_CAP);
    const waveScale = 1 + w * HP_LINEAR + HP_CURVE * 封 * 封;
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
        dotFloatTimer: 0,
    };

    state.enemies.push(enemy);

    // 出生門聽住呢個開門＋閃光（見 `render/gateway.ts`）。
    bus.emit({ type: 'enemySpawned', enemyId: enemy.id, enemyType: type, worldX: enemy.worldX, worldZ: enemy.worldZ });

    if (type === 'boss') {
        bus.emit({
            type: 'bossSpawned',
            enemyId: enemy.id,
            worldX: enemy.worldX,
            worldZ: enemy.worldZ,
        });
    }
}
