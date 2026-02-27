import type { GameState, Projectile } from '../types';
import { TOWERS, PROJECTILE_SPEED } from '../config';

/** Tower targeting and firing */
export function tickTowers(state: GameState, dt: number): void {
    for (const tower of state.towers) {
        tower.cooldownRemaining -= dt;

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
                        score = progress;
                        if (score > bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                    case 'last':
                        score = progress;
                        if (score < bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                    case 'strongest':
                        score = enemy.hp + enemy.shield;
                        if (score > bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                    case 'weakest':
                        score = -(enemy.hp + enemy.shield);
                        if (score > bestScore) { bestScore = score; bestEnemy = enemy; }
                        break;
                }
            }
        }

        tower.targetId = bestEnemy ? bestEnemy.id : null;

        if (tower.cooldownRemaining > 0) continue;

        if (bestEnemy) {
            let arcHeight = 0;
            let speed = PROJECTILE_SPEED;
            if (tower.type === 'cannon' || tower.type === 'poison') {
                arcHeight = 1.5;
                speed = PROJECTILE_SPEED * 0.8;
            } else if (tower.type === 'lightning') {
                speed = PROJECTILE_SPEED * 8.0; // almost instant
            } else if (tower.type === 'sniper') {
                speed = PROJECTILE_SPEED * 4.0;
            } else if (tower.type === 'fire') {
                speed = PROJECTILE_SPEED * 0.6;
            }

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
                y: 0.8,
                z: tower.worldZ,
                startX: tower.worldX,
                startY: 0.8,
                startZ: tower.worldZ,
                targetX: bestEnemy.worldX,
                targetY: 0.3,
                targetZ: bestEnemy.worldZ,
                speed,
                progress: 0,
                arcHeight: arcHeight,
                alive: true,
            };
            state.projectiles.push(proj);
            tower.cooldownRemaining = cfg.cooldownSec;
            tower.aimAngle = Math.atan2(bestEnemy.worldX - tower.worldX, bestEnemy.worldZ - tower.worldZ);
        }
    }
}
