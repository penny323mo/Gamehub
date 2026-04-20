import type { GameState } from './types';

export interface Achievement {
    id: string;
    name: string;
    desc: string;
    emoji: string;
    /** Returns true if the achievement condition is now met. */
    check: (state: GameState, ctx: AchievementContext) => boolean;
}

export interface AchievementContext {
    event: string;
    payload: Record<string, unknown>;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_blood',
        name: 'First Blood',
        desc: 'Score your very first kill',
        emoji: '🩸',
        check: (s, c) => c.event === 'enemyKilled' && s.totalKills === 1,
    },
    {
        id: 'streak_10',
        name: 'Combo Rookie',
        desc: 'Hit a 10-kill streak',
        emoji: '🔥',
        check: (_s, c) => c.event === 'streakBonus' && (c.payload.streak as number) >= 10,
    },
    {
        id: 'streak_25',
        name: 'Combo Master',
        desc: 'Hit a 25-kill streak',
        emoji: '⚡',
        check: (_s, c) => c.event === 'streakBonus' && (c.payload.streak as number) >= 25,
    },
    {
        id: 'perfect_wave',
        name: 'Untouchable',
        desc: 'Clear a wave without losing any lives',
        emoji: '🛡',
        check: (_s, c) => c.event === 'waveCleared' && c.payload.perfect === true,
    },
    {
        id: 'milestone_25',
        name: 'Holding the Line',
        desc: 'Reach Wave 25',
        emoji: '🏁',
        check: (_s, c) => c.event === 'milestone' && (c.payload.wave as number) >= 25,
    },
    {
        id: 'milestone_50',
        name: 'Frontline Veteran',
        desc: 'Reach Wave 50',
        emoji: '🎖',
        check: (_s, c) => c.event === 'milestone' && (c.payload.wave as number) >= 50,
    },
    {
        id: 'milestone_75',
        name: 'War Commander',
        desc: 'Reach Wave 75',
        emoji: '👑',
        check: (_s, c) => c.event === 'milestone' && (c.payload.wave as number) >= 75,
    },
    {
        id: 'victory',
        name: 'Bastion Triumphant',
        desc: 'Clear all 99 waves',
        emoji: '🏆',
        check: (_s, c) => c.event === 'gameOver' && c.payload.won === true,
    },
    {
        id: 'victory_hard',
        name: 'Iron Legend',
        desc: 'Clear all 99 waves on Hard',
        emoji: '💠',
        check: (s, c) => c.event === 'gameOver' && c.payload.won === true && s.difficulty === 'hard',
    },
    {
        id: 'frugal',
        name: 'Frugal Commander',
        desc: 'Clear Wave 25 with only 3 towers or fewer',
        emoji: '💡',
        check: (s, c) =>
            c.event === 'waveCleared' &&
            (c.payload.wave as number) >= 25 &&
            s.towers.length <= 3,
    },
];
