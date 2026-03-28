import type { GameState, Enemy } from '../types';
import { bus } from './eventBus';

/**
 * Shared kill logic — called by both combatSystem and enemySystem (DOT kills).
 * Handles: bounty, kill count, streak, floating texts, and event emission.
 */
export function killEnemy(state: GameState, enemy: Enemy): void {
    enemy.hp = 0;
    enemy.alive = false;
    state.gold += enemy.bounty;
    state.totalKills++;

    // Kill Streak
    state.killStreak++;
    state.killStreakTimer = 3.0;

    // Streak milestone bonus at multiples of 10
    if (state.killStreak % 10 === 0) {
        const bonus = 50;
        state.gold += bonus;
        state.floatingTexts.push({
            id: state.nextId++,
            worldX: enemy.worldX,
            worldZ: enemy.worldZ,
            value: `⚡ x${state.killStreak} COMBO! +${bonus}g`,
            color: '#ffee00',
            life: 2.0,
            maxLife: 2.0,
        });
        bus.emit({ type: 'streakBonus', streak: state.killStreak, gold: bonus });
    }

    // Bounty floating text
    state.floatingTexts.push({
        id: state.nextId++,
        worldX: enemy.worldX,
        worldZ: enemy.worldZ,
        value: `+${enemy.bounty}g`,
        color: '#ffd700',
        life: 1.2,
        maxLife: 1.2,
    });

    // Emit event for UI / stats
    bus.emit({
        type: 'enemyKilled',
        enemyId: enemy.id,
        worldX: enemy.worldX,
        worldZ: enemy.worldZ,
        bounty: enemy.bounty,
        killStreak: state.killStreak,
    });
}
