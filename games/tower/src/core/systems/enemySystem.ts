import type { GameState, Enemy, DamageType } from '../types';
import { ENEMIES } from '../config';
import { dist } from '../path';
import { killEnemy } from './killSystem';
import { bus } from './eventBus';

// 一條 DoT 就算畀甲食晒都仲有咁多每秒（唔係每格）。
export const DOT_MIN_DPS = 1;

// Shield enemy type — regen after no-damage delay
export const SHIELD_REGEN_DELAY = 4.0;   // seconds of no damage before regen starts
const SHIELD_REGEN_RATE = 20;    // hp/sec

// Speed scaling thresholds
const SPEED_BOOST_WAVE_1 = 50;    // Wave 50+: ×1.15
const SPEED_BOOST_WAVE_2 = 80;    // Wave 80+: ×1.30

/** Move enemies along the path, tick DOTs, tick healer ability, tick shield regen */
export function tickEnemies(state: GameState, dt: number): void {
    const path = state.pathWorld;
    if (path.length < 2) return;

    // Derive speed multiplier based on wave
    let waveSpeedMult = 1.0;
    if (state.currentWave >= SPEED_BOOST_WAVE_2) {
        waveSpeedMult = 1.30;
    } else if (state.currentWave >= SPEED_BOOST_WAVE_1) {
        waveSpeedMult = 1.15;
    }

    for (const enemy of state.enemies) {
        if (!enemy.alive || enemy.reached) continue;

        // Save previous position for render interpolation
        enemy.prevWorldX = enemy.worldX;
        enemy.prevWorldZ = enemy.worldZ;

        // Tick DOT effects
        for (let i = enemy.dots.length - 1; i >= 0; i--) {
            const dot = enemy.dots[i];
            applyDotTick(state, enemy, dot.dps, dot.damageType, dt);
            dot.remaining -= dt;
            if (dot.remaining <= 0) {
                enemy.dots.splice(i, 1);
            }
            if (!enemy.alive) break;
        }
        if (!enemy.alive) continue;

        // Apply slow
        let speed = enemy.speed * waveSpeedMult;
        if (enemy.slow) {
            speed *= (1 - enemy.slow.pct);
            enemy.slow.remaining -= dt;
            if (enemy.slow.remaining <= 0) {
                enemy.slow = null;
            }
        }

        // Healer ability — heal nearby enemies
        if (enemy.special === 'heal') {
            const cfg = ENEMIES[enemy.type];
            enemy.healCooldown -= dt;
            if (enemy.healCooldown <= 0) {
                const hRadius = cfg.healRadius ?? 2.5;
                const hAmount = cfg.healAmount ?? 15;
                for (const other of state.enemies) {
                    if (!other.alive || other.reached || other.id === enemy.id) continue;
                    const dx = other.worldX - enemy.worldX;
                    const dz = other.worldZ - enemy.worldZ;
                    const d = Math.sqrt(dx * dx + dz * dz);
                    if (d <= hRadius) {
                        other.hp = Math.min(other.maxHp, other.hp + hAmount);
                    }
                }
                enemy.healCooldown = cfg.healIntervalSec ?? 2.0;
            }
        }

        // Shield Regen — tick down delay then regen; any active DOT pauses it.
        if (enemy.maxShield > 0 && enemy.shield < enemy.maxShield) {
            if (enemy.dots.length > 0) {
                enemy.shieldRegenTimer = SHIELD_REGEN_DELAY;
            } else {
                enemy.shieldRegenTimer -= dt;
                if (enemy.shieldRegenTimer <= 0) {
                    enemy.shield = Math.min(enemy.maxShield, enemy.shield + SHIELD_REGEN_RATE * dt);
                }
            }
        }

        // Move along path
        let remaining = speed * dt;
        while (remaining > 0 && enemy.pathIndex < path.length - 1) {
            const from = path[enemy.pathIndex];
            const to = path[enemy.pathIndex + 1];
            const segLen = dist(from, to);

            if (segLen <= 0) {
                enemy.pathIndex++;
                continue;
            }

            const distInSeg = enemy.pathProgress * segLen;
            const canTravel = remaining;
            const newDist = distInSeg + canTravel;

            if (newDist >= segLen) {
                remaining -= (segLen - distInSeg);
                enemy.pathIndex++;
                enemy.pathProgress = 0;
            } else {
                enemy.pathProgress = newDist / segLen;
                remaining = 0;
            }
        }

        // Update world position
        if (enemy.pathIndex >= path.length - 1) {
            enemy.reached = true;
            enemy.alive = false;
            state.lives--;
            state.waveLivesLostThisWave++;
            bus.emit({ type: 'enemyReachedGoal', enemyId: enemy.id, livesRemaining: Math.max(0, state.lives) });

            if (state.lives <= 0) {
                state.lives = 0;
                state.phase = 'lost';
            }
            const goal = path[path.length - 1];
            enemy.worldX = goal.x;
            enemy.worldZ = goal.z;
        } else {
            const from = path[enemy.pathIndex];
            const to = path[enemy.pathIndex + 1];
            enemy.worldX = from.x + (to.x - from.x) * enemy.pathProgress;
            enemy.worldZ = from.z + (to.z - from.z) * enemy.pathProgress;
        }
    }
}

/**
 * 落一條 DoT：**同一種傷害類型唔會疊，係刷新**。
 *
 * 原本兩個落點各自寫一次 `dots.push(...)`（「stacking with existing」），冇上限。
 * 毒 L3 一秒射一次、燒足五秒，即係同一座塔自己就疊到五條，實際每秒係設計嘅
 * **五倍**。而塔嗰版寫住嘅係 `DOT: 18 dmg/s (5s)`——一條，唔係五條。條 UI 就係
 * 設計意圖嘅白紙黑字，疊落去就等於嗰版嘢講大話。
 *
 * 火同毒係兩種類型，仲係可以同時燒——刷新只係同類型之間嘅事。
 */
export function applyDot(enemy: Enemy, dps: number, durationSec: number, damageType: DamageType): void {
    const 同類 = enemy.dots.find(d => d.damageType === damageType);
    if (同類) {
        同類.dps = Math.max(同類.dps, dps);
        同類.remaining = Math.max(同類.remaining, durationSec);
        return;
    }
    enemy.dots.push({ dps, remaining: durationSec, damageType });
}

/**
 * 持續傷害嘅一格：**先減甲，再乘時間**。
 *
 * 原本呢度收嘅係「呢一格打幾多」＝ dps × dt，然後行同單次命中一模一樣嗰句
 * `Math.max(1, dmg - armor)`。「一下最少打一點」係寫畀**一次命中**嘅規則；
 * 擺喺**每格都行一次**嘅連續傷害度，佢就變成「每格最少一點」，即係
 * **每秒最少 1 / LOGIC_DT ＝ 20 點**。實測（tests/combat.mjs 守住）：設計 8 dps
 * 打出 20、設計 10 dps 打出 20；tank 有 8 甲兼弱火，24 dps 打出 20——**「弱火」
 * 令佢食少過一隻冇弱點嘅雜兵**；boss 抗毒兼 12 甲，一樣係 20。甲、抗性、弱點
 * 三樣喺 DoT 上面**全部冇作用**，因為佢哋都畀個地板食晒。
 *
 * 地板搬去 dps 嗰層之後，佢先至係一條同 tick 率無關嘅規則：無論一秒行幾多格，
 * 一條 DoT 至少 DOT_MIN_DPS 每秒，最多就係佢設計嗰個 dps。
 */
function applyDotTick(state: GameState, enemy: Enemy, dps: number, damageType: DamageType, dt: number): void {
    const cfg = ENEMIES[enemy.type];
    let effDps = dps;

    // Counter multipliers
    if (cfg.weakness?.includes(damageType)) effDps *= 1.5;
    if (cfg.resistance?.includes(damageType)) effDps *= 0.5;

    // Armor reduces damage (flat, per second — not per tick)
    effDps = Math.max(DOT_MIN_DPS, effDps - enemy.armor);
    const dmg = effDps * dt;

    // Reset shield regen delay on damage
    if (enemy.maxShield > 0) {
        enemy.shieldRegenTimer = SHIELD_REGEN_DELAY;
    }

    // DOT damage float (green, only show once per second of burn to avoid spam)
    enemy.dotFloatTimer = (enemy.dotFloatTimer ?? 0) - dt;
    if (effDps >= 2 && enemy.dotFloatTimer <= 0) {
        enemy.dotFloatTimer = 1;
        state.floatingTexts.push({
            id: state.nextId++,
            worldX: enemy.worldX,
            worldZ: enemy.worldZ,
            // 一秒印一次，所以印嘅係**一秒**打幾多，唔係一格打幾多（一格得 0.4 點）。
            value: `-${Math.round(effDps)}`,
            color: '#66ee44',
            life: 0.8,
            maxLife: 0.8,
        });
    }

    enemy.hp -= dmg;
    state.stats.totalDamageDealt += dmg;
    // 本來寫死咗 `.poison`：火燒嘅傷害全部記落毒嗰格，收場嗰版統計係錯嘅。
    state.stats.damageByType[damageType] = (state.stats.damageByType[damageType] ?? 0) + dmg;
    if (enemy.hp <= 0) {
        killEnemy(state, enemy);
    }
}
