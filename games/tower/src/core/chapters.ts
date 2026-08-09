export interface CampaignChapter {
    id: 'verdant-border' | 'sunken-gorge' | 'crystal-hollow' | 'ember-ridge' | 'last-bastion';
    title: string;
    subtitle: string;
    startWave: number;
    endWave: number;
    accent: number;
    fog: number;
    tint: [number, number, number];
    tacticalFocus: string;
}

/**
 * The 99-wave run is one journey through five readable acts. Chapter data is
 * shared by HUD, atmosphere and wave composition; it must not be rewritten as
 * unrelated wave-number conditionals in each consumer.
 */
export const CAMPAIGN_CHAPTERS: readonly CampaignChapter[] = [
    {
        id: 'verdant-border',
        title: 'Verdant Border',
        subtitle: 'Hold the forest gate',
        startWave: 1,
        endWave: 20,
        accent: 0x7ee787,
        fog: 0x173f2b,
        tint: [1.00, 1.03, 0.98],
        tacticalFocus: 'Learn lanes, range and focused fire',
    },
    {
        id: 'sunken-gorge',
        title: 'Sunken Gorge',
        subtitle: 'Control both bridgeheads',
        startWave: 21,
        endWave: 40,
        accent: 0x66d9ff,
        fog: 0x143a42,
        tint: [0.92, 1.02, 1.08],
        tacticalFocus: 'Break shields and cover the river crossing',
    },
    {
        id: 'crystal-hollow',
        title: 'Crystal Hollow',
        subtitle: 'Counter the awakened host',
        startWave: 41,
        endWave: 60,
        accent: 0xc69cff,
        fog: 0x2e2448,
        tint: [1.04, 0.94, 1.10],
        tacticalFocus: 'Mix damage types against specialised formations',
    },
    {
        id: 'ember-ridge',
        title: 'Ember Ridge',
        subtitle: 'Survive the collapsing front',
        startWave: 61,
        endWave: 80,
        accent: 0xff9c5a,
        fog: 0x4a241d,
        tint: [1.10, 0.94, 0.86],
        tacticalFocus: 'Answer dense assaults without abandoning the rear line',
    },
    {
        id: 'last-bastion',
        title: 'Last Bastion',
        subtitle: 'Defend the citadel',
        startWave: 81,
        endWave: 99,
        accent: 0xffd86b,
        fog: 0x241c2f,
        tint: [1.04, 0.98, 1.04],
        tacticalFocus: 'Refine the complete defence and defeat the final siege',
    },
];

/** One-based wave lookup. Endless waves remain in the final battlefield act. */
export function chapterForWave(wave: number): CampaignChapter {
    const safeWave = Math.max(1, Math.floor(Number.isFinite(wave) ? wave : 1));
    return CAMPAIGN_CHAPTERS.find((chapter) => safeWave <= chapter.endWave)
        ?? CAMPAIGN_CHAPTERS[CAMPAIGN_CHAPTERS.length - 1];
}

export function chapterProgress(wave: number): number {
    const chapter = chapterForWave(wave);
    const span = chapter.endWave - chapter.startWave + 1;
    return Math.max(0, Math.min(1, (wave - chapter.startWave + 1) / span));
}

export function isChapterOpening(wave: number): boolean {
    return chapterForWave(wave).startWave === wave;
}
