/**
 * Small deterministic sampler for gameplay choices. Rendering and audio may
 * freely consume Math.random without changing a run's wave rules or rewards.
 */
export function deterministicSample<T>(items: readonly T[], count: number, seedInput: number): T[] {
    const pool = [...items];
    const result: T[] = [];
    let seed = (seedInput >>> 0) || 0x6d2b79f5;
    const next = (): number => {
        seed ^= seed << 13;
        seed ^= seed >>> 17;
        seed ^= seed << 5;
        return (seed >>> 0) / 0x100000000;
    };
    while (result.length < Math.max(0, count) && pool.length > 0) {
        result.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
    }
    return result;
}

/** Stable namespace for a one-based campaign wave. */
export function waveSeed(wave: number, salt = 0): number {
    return (Math.imul(Math.max(1, Math.floor(wave)), 0x9e3779b1) ^ 0x85ebca6b ^ salt) >>> 0;
}

/**
 * A long campaign reward should always contain meaningful combat progression,
 * with one changing economy/survival wildcard. This keeps the choice legible
 * without coupling it to particle timing or allowing three dud economy cards.
 */
export function milestoneOffer<T>(core: readonly T[], wildcards: readonly T[], wave: number): T[] {
    const wildcard = deterministicSample(wildcards, 1, waveSeed(wave, 0x57494c44));
    return deterministicSample([...core, ...wildcard], core.length + wildcard.length, waveSeed(wave, 0x4f464652));
}

/** Alternate assault and recovery milestones so the campaign ramps without snowballing. */
export function milestonePlan(wave: number): { coreIds: string[]; wildcardIds: string[] } {
    const milestoneOrdinal = Math.max(1, Math.floor(Math.max(1, wave) / 25));
    return milestoneOrdinal % 2 === 0
        ? { coreIds: ['range', 'fortify'], wildcardIds: ['gold', 'bounty'] }
        : { coreIds: ['damage', 'range'], wildcardIds: ['gold', 'fortify', 'bounty'] };
}
