import type { GameState } from '../types';
import { dist } from '../path';

/** Move enemies along the path */
export function tickEnemies(state: GameState, dt: number): void {
    const path = state.pathWorld;
    if (path.length < 2) return;

    for (const enemy of state.enemies) {
        if (!enemy.alive || enemy.reached) continue;

        // Save previous position for render interpolation
        enemy.prevWorldX = enemy.worldX;
        enemy.prevWorldZ = enemy.worldZ;

        // Apply slow
        let speed = enemy.speed;
        if (enemy.slow) {
            speed *= (1 - enemy.slow.pct);
            enemy.slow.remaining -= dt;
            if (enemy.slow.remaining <= 0) {
                enemy.slow = null;
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
            // Reached the goal
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
