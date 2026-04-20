import type { Difficulty } from './types';

const STORAGE_KEY = 'tower-defense-v1';

export interface HighScoreRecord {
    score: number;
    wave: number;
    rank: string;
    date: number;
}

export interface LifetimeStats {
    runs: number;
    victories: number;
    totalKills: number;
    totalWavesCleared: number;
    totalTowersBuilt: number;
    highestWaveReached: number;
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
    lifetime: LifetimeStats;
}

const DEFAULT_LIFETIME: LifetimeStats = {
    runs: 0,
    victories: 0,
    totalKills: 0,
    totalWavesCleared: 0,
    totalTowersBuilt: 0,
    highestWaveReached: 0,
};

const DEFAULTS: PersistedData = {
    prefs: {
        difficulty: 'normal',
        soundEnabled: true,
        speedMultiplier: 1,
        endlessMode: false,
    },
    highScores: {},
    achievements: [],
    lifetime: { ...DEFAULT_LIFETIME },
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
            lifetime: { ...DEFAULT_LIFETIME, ...(parsed.lifetime ?? {}) },
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

export function recordRunComplete(
    data: PersistedData,
    won: boolean,
    kills: number,
    wavesCleared: number,
    towersBuilt: number,
    highestWave: number,
): void {
    data.lifetime.runs += 1;
    if (won) data.lifetime.victories += 1;
    data.lifetime.totalKills += kills;
    data.lifetime.totalWavesCleared += wavesCleared;
    data.lifetime.totalTowersBuilt += towersBuilt;
    if (highestWave > data.lifetime.highestWaveReached) {
        data.lifetime.highestWaveReached = highestWave;
    }
    savePersisted(data);
}

export function resetProgress(data: PersistedData): void {
    data.highScores = {};
    data.achievements = [];
    data.lifetime = { ...DEFAULT_LIFETIME };
    savePersisted(data);
}
