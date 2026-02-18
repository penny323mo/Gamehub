import type { GameState } from '../types';

/** Move projectiles and resolve hits */
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
        const dz = proj.targetZ - proj.z;
        const d = Math.sqrt(dx * dx + dz * dz);
        const step = proj.speed * dt;

        if (d <= step || d < 0.1) {
            // Hit!
            proj.alive = false;

            if (proj.aoeRadius > 0) {
                // AOE damage
                for (const enemy of state.enemies) {
                    if (!enemy.alive || enemy.reached) continue;
                    const ex = enemy.worldX - proj.targetX;
                    const ez = enemy.worldZ - proj.targetZ;
                    const ed = Math.sqrt(ex * ex + ez * ez);
                    if (ed <= proj.aoeRadius) {
                        applyDamage(state, enemy, proj.damage);
                        if (proj.slow) {
                            enemy.slow = { pct: proj.slow.pct, remaining: proj.slow.durationSec };
                        }
                    }
                }
            } else {
                // Single target
                if (target && target.alive && !target.reached) {
                    applyDamage(state, target, proj.damage);
                    if (proj.slow) {
                        target.slow = { pct: proj.slow.pct, remaining: proj.slow.durationSec };
                    }
                }
            }
        } else {
            proj.x += (dx / d) * step;
            proj.z += (dz / d) * step;
        }
    }

    // Clean up dead projectiles
    state.projectiles = state.projectiles.filter(p => p.alive);
}

function applyDamage(state: GameState, enemy: { id: number; hp: number; alive: boolean; bounty: number }, damage: number): void {
    enemy.hp -= damage;
    if (enemy.hp <= 0) {
        enemy.hp = 0;
        enemy.alive = false;
        state.gold += enemy.bounty;
    }
}
