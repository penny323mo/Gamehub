import type { Difficulty } from './types';

const STORAGE_KEY = 'tower-defense-v1';

export interface HighScoreRecord {
    score: number;
    wave: number;
    rank: string;
    date: number;
}

export interface PersistedData {
    prefs: {
        difficulty: Difficulty;
        soundEnabled: boolean;
        speedMultiplier: number;
        endlessMode: boolean;
    };
    highScores: Partial<Record<Difficulty, HighScoreRecord>>;
    achievements: string[];
}

const DEFAULTS: PersistedData = {
    prefs: {
        difficulty: 'normal',
        soundEnabled: true,
        speedMultiplier: 1,
        endlessMode: false,
    },
    highScores: {},
    achievements: [],
};

export function loadPersisted(): PersistedData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULTS);
        const parsed = JSON.parse(raw) as Partial<PersistedData>;
        return {
            prefs: { ...DEFAULTS.prefs, ...(parsed.prefs ?? {}) },
            highScores: parsed.highScores ?? {},
            achievements: parsed.achievements ?? [],
        };
    } catch {
        return structuredClone(DEFAULTS);
    }
}

export function savePersisted(data: PersistedData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // quota / private-mode — silently ignore
    }
}

/** Returns true if the new score beat the previous record for this difficulty. */
export function recordHighScore(
    data: PersistedData,
    difficulty: Difficulty,
    score: number,
    wave: number,
    rank: string,
): boolean {
    const prev = data.highScores[difficulty];
    if (!prev || score > prev.score) {
        data.highScores[difficulty] = { score, wave, rank, date: Date.now() };
        savePersisted(data);
        return true;
    }
    return false;
}

export function unlockAchievement(data: PersistedData, id: string): boolean {
    if (data.achievements.includes(id)) return false;
    data.achievements.push(id);
    savePersisted(data);
    return true;
}
