import type { GameState, Enemy, DamageType } from '../types';
import { ENEMIES } from '../config';
import { killEnemy } from './killSystem';
import { bus } from './eventBus';

/** Move projectiles and resolve hits with counter system */
export function tickCombat(state: GameState, dt: number): void {
    for (const proj of state.projectiles) {
        if (!proj.alive) continue;

        // Find the target enemy to track it
        const target = state.enemies.find(e => e.id === proj.targetEnemyId);
        if (target && target.alive && !target.reached) {
            proj.targetX = target.worldX;
            proj.targetZ = target.worldZ;
        }

        // Move towards target
        const dx = proj.targetX - proj.x;
        const dy = proj.targetY - proj.y;
        const dz = proj.targetZ - proj.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const step = proj.speed * dt;

        if (d <= step || d < 0.1) {
            // Hit!
            proj.alive = false;

            if (proj.aoeRadius > 0) {
                bus.emit({
                    type: 'aoeImpact',
                    worldX: proj.targetX,
                    worldZ: proj.targetZ,
                    radius: proj.aoeRadius,
                    towerType: proj.towerType,
                });
                // AOE damage
                for (const enemy of state.enemies) {
                    if (!enemy.alive || enemy.reached) continue;
                    const ex = enemy.worldX - proj.targetX;
                    const ez = enemy.worldZ - proj.targetZ;
                    const ed = Math.sqrt(ex * ex + ez * ez);
                    if (ed <= proj.aoeRadius) {
                        applyHit(state, enemy, proj.damage, proj.damageType, proj.fromTowerId);
                        if (proj.slow) {
                            enemy.slow = { pct: proj.slow.pct, remaining: proj.slow.durationSec };
                        }
                        if (proj.dot) {
                            // Add DOT, stacking with existing
                            enemy.dots.push({
                                dps: proj.dot.dps,
                                remaining: proj.dot.durationSec,
                                damageType: proj.damageType,
                            });
                        }
                    }
                }
            } else if (proj.chain && proj.chain.targets > 0) {
                // Chain lightning — hit primary + jump to nearby
                const hitEnemies: Enemy[] = [];
                if (target && target.alive && !target.reached) {
                    applyHit(state, target, proj.damage, proj.damageType, proj.fromTowerId);
                    hitEnemies.push(target);
                    if (proj.slow) {
                        target.slow = { pct: proj.slow.pct, remaining: proj.slow.durationSec };
                    }
                }

                let lastHit = target;
                for (let i = 0; i < proj.chain.targets && lastHit; i++) {
                    let nearest: Enemy | null = null;
                    let nearestDist = proj.chain.rangeFalloff;

                    for (const enemy of state.enemies) {
                        if (!enemy.alive || enemy.reached) continue;
                        if (hitEnemies.includes(enemy)) continue;
                        const cdx = enemy.worldX - lastHit.worldX;
                        const cdz = enemy.worldZ - lastHit.worldZ;
                        const cd = Math.sqrt(cdx * cdx + cdz * cdz);
                        if (cd < nearestDist) {
                            nearestDist = cd;
                            nearest = enemy;
                        }
                    }

                    if (nearest) {
                        applyHit(state, nearest, proj.damage * 0.7, proj.damageType, proj.fromTowerId); // 70% for chain
                        hitEnemies.push(nearest);
                        lastHit = nearest;
                    } else {
                        break;
                    }
                }
            } else {
                // Single target
                if (target && target.alive && !target.reached) {
                    applyHit(state, target, proj.damage, proj.damageType, proj.fromTowerId);
                    if (proj.slow) {
                        target.slow = { pct: proj.slow.pct, remaining: proj.slow.durationSec };
                    }
                    if (proj.dot) {
                        target.dots.push({
                            dps: proj.dot.dps,
                            remaining: proj.dot.durationSec,
                            damageType: proj.damageType,
                        });
                    }
                }
            }
        } else {
            // Still in flight — advance position toward target
            const inv = 1 / d;
            proj.x += dx * inv * step;
            proj.z += dz * inv * step;

            // Recalculate horizontal progress to apply vertical arcs accurately
            const totalDx = proj.targetX - proj.startX;
            const totalDz = proj.targetZ - proj.startZ;
            const totalDist = Math.max(0.1, Math.sqrt(totalDx * totalDx + totalDz * totalDz));

            const curDx = proj.x - proj.startX;
            const curDz = proj.z - proj.startZ;
            const curDist = Math.sqrt(curDx * curDx + curDz * curDz);

            proj.progress = Math.min(1.0, curDist / totalDist);

            const base_y = proj.startY + (proj.targetY - proj.startY) * proj.progress;
            if (proj.arcHeight > 0) {
                proj.y = base_y + Math.sin(proj.progress * Math.PI) * proj.arcHeight;
            } else {
                proj.y = base_y;
            }
        }
    }

    // Clean up dead projectiles
    state.projectiles = state.projectiles.filter(p => p.alive);
}

/** Apply damage with shield + counter system */
function applyHit(state: GameState, enemy: Enemy, baseDmg: number, damageType: DamageType, killerTowerId?: number): void {
    const cfg = ENEMIES[enemy.type];
    let dmg = baseDmg;

    // Counter multipliers
    if (cfg.weakness?.includes(damageType)) dmg *= 1.5;
    if (cfg.resistance?.includes(damageType)) dmg *= 0.5;

    // Armor
    dmg = Math.max(1, dmg - enemy.armor);

    // Shield absorb first
    if (enemy.shield > 0) {
        if (dmg <= enemy.shield) {
            // Push shield damage float (blue)
            state.floatingTexts.push({
                id: state.nextId++,
                worldX: enemy.worldX,
                worldZ: enemy.worldZ,
                value: `-${Math.round(dmg)}🛡`,
                color: '#88ddff',
                life: 1.0,
                maxLife: 1.0,
            });
            enemy.shield -= dmg;
            return;
        } else {
            const shieldAbsorbed = enemy.shield;
            dmg -= enemy.shield;
            enemy.shield = 0;
            // Show shield break
            state.floatingTexts.push({
                id: state.nextId++,
                worldX: enemy.worldX,
                worldZ: enemy.worldZ,
                value: `-${Math.round(shieldAbsorbed)}🛡`,
                color: '#88ddff',
                life: 1.0,
                maxLife: 1.0,
            });
        }
    }

    // Push HP damage float (red / yellow for crit)
    const isCrit = cfg.weakness?.includes(damageType);
    state.floatingTexts.push({
        id: state.nextId++,
        worldX: enemy.worldX,
        worldZ: enemy.worldZ,
        value: `-${Math.round(dmg)}`,
        color: isCrit ? '#ffdd44' : '#ff6655',
        life: 1.0,
        maxLife: 1.0,
    });

    enemy.hp -= dmg;
    if (enemy.hp <= 0) {
        if (killerTowerId !== undefined) {
            const killerTower = state.towers.find(t => t.id === killerTowerId);
            if (killerTower) killerTower.kills++;
        }
        killEnemy(state, enemy);
    }
}
