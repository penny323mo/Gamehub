import type { GameState, Enemy, DamageType } from '../types';
import { ENEMIES } from '../config';
import { dist } from '../path';

// Shield enemy type — regen after no-damage delay
const SHIELD_REGEN_DELAY = 4.0;   // seconds of no damage before regen starts
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
            const dotDmg = dot.dps * dt;
            applyRawDamage(state, enemy, dotDmg, dot.damageType);
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

        // Shield Regen — only for shield-type enemies
        if (enemy.maxShield > 0 && enemy.shield < enemy.maxShield) {
            // Track last-hit using shieldRegenTimer (stored in healCooldown for shield enemies)
            // We use a separate field; if enemy has no specialty, we use dots check
            // Simple approach: check if shieldRegenDelay elapsed (tracked implicitly)
            // Use enemy.healCooldown as shield regen timer for shield-type enemies
            if (enemy.special === 'none' && enemy.dots.length === 0) {
                // Only regen when not taking damage (no active DOTs)
                enemy.healCooldown -= dt;
                if (enemy.healCooldown <= 0) {
                    enemy.shield = Math.min(enemy.maxShield, enemy.shield + SHIELD_REGEN_RATE * dt);
                    // don't reset timer; continuously regen once started
                } else {
                    // waiting for regen delay
                }
            } else {
                // Reset regen timer on taking dot damage
                enemy.healCooldown = SHIELD_REGEN_DELAY;
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

/** Apply raw damage considering armor and damage type weakness/resistance */
function applyRawDamage(state: GameState, enemy: Enemy, baseDmg: number, damageType: DamageType): void {
    const cfg = ENEMIES[enemy.type];
    let dmg = baseDmg;

    // Counter multipliers
    if (cfg.weakness?.includes(damageType)) dmg *= 1.5;
    if (cfg.resistance?.includes(damageType)) dmg *= 0.5;

    // Armor reduces damage (flat)
    dmg = Math.max(1, dmg - enemy.armor);

    // Reset shield regen timer on damage
    if (enemy.maxShield > 0 && enemy.special === 'none') {
        enemy.healCooldown = SHIELD_REGEN_DELAY;
    }

    // DOT damage float (green, only show if >= 2 to avoid spam)
    if (dmg >= 2) {
        state.floatingTexts.push({
            id: state.nextId++,
            worldX: enemy.worldX,
            worldZ: enemy.worldZ,
            value: `-${Math.round(dmg)}`,
            color: '#66ee44',
            life: 0.8,
            maxLife: 0.8,
        });
    }

    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
        enemy.hp = 0;
        enemy.alive = false;
        state.gold += enemy.bounty;
        state.totalKills++;
        state.floatingTexts.push({
            id: state.nextId++,
            worldX: enemy.worldX,
            worldZ: enemy.worldZ,
            value: `+${enemy.bounty}g`,
            color: '#ffd700',
            life: 1.2,
            maxLife: 1.2,
        });
    }
}
