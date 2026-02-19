import type { GameState, Projectile } from '../types';
import { TOWERS, PROJECTILE_SPEED } from '../config';

/** Tower targeting and firing */
export function tickTowers(state: GameState, dt: number): void {
    for (const tower of state.towers) {
        tower.cooldownRemaining -= dt;
        if (tower.cooldownRemaining > 0) continue;

        const towerCfg = TOWERS[tower.type];
        const cfg = towerCfg.levels[tower.level];
        const range = cfg.range;

        // Find best enemy in range based on targetingMode
        let bestEnemy = null;
        let bestScore = tower.targetingMode === 'last' ? Infinity : -Infinity;

        for (const enemy of state.enemies) {
            if (!enemy.alive || enemy.reached) continue;
            const dx = enemy.worldX - tower.worldX;
            const dz = enemy.worldZ - tower.worldZ;
            const d = Math.sqrt(dx * dx + dz * dz);

            if (d <= range) {
                const progress = enemy.pathIndex + enemy.pathProgress;
                let score: number;

                switch (tower.targetingMode) {
                    case 'first':
                        // Highest progress (furthest along path) → pick maximum
                        score = progress;
                        if (score > bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                    case 'last':
                        // Lowest progress → pick minimum
                        score = progress;
                        if (score < bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                    case 'strongest':
                        // Highest HP
                        score = enemy.hp + enemy.shield;
                        if (score > bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                    case 'weakest':
                        // Lowest HP
                        score = -(enemy.hp + enemy.shield);
                        if (score > bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                }
            }
        }

        if (bestEnemy) {
            const proj: Projectile = {
                id: state.nextId++,
                fromTowerId: tower.id,
                targetEnemyId: bestEnemy.id,
                towerType: tower.type,
                damageType: towerCfg.damageType,
                damage: cfg.damage,
                aoeRadius: cfg.aoeRadius,
                slow: cfg.slow,
                dot: cfg.dot,
                chain: cfg.chain,
                x: tower.worldX,
                z: tower.worldZ,
                targetX: bestEnemy.worldX,
                targetZ: bestEnemy.worldZ,
                speed: PROJECTILE_SPEED,
                alive: true,
            };
            state.projectiles.push(proj);
            tower.cooldownRemaining = cfg.cooldownSec;
        }
    }
}
