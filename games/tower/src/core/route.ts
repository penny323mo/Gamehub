import type { Vec2 } from './types';

export interface SmoothRouteOptions {
    /** Distance trimmed from each side of a right-angle corner. */
    cornerRadius: number;
    /** Approximate distance between returned route samples. */
    sampleSpacing: number;
    /** Extra visible approach before the first configured path cell. */
    entryExtension: number;
    /** Optional visible departure after the last configured path cell. */
    exitExtension: number;
    /** Detail used while constructing each quadratic corner. */
    cornerSteps?: number;
}

export const DEFAULT_ROUTE_OPTIONS: SmoothRouteOptions = {
    cornerRadius: 0.34,
    sampleSpacing: 0.12,
    entryExtension: 0.42,
    exitExtension: 0,
    cornerSteps: 8,
};

/**
 * Remove intermediate points from straight runs while preserving every turn.
 * Gameplay map cells remain authoritative; this is only the continuous travel
 * spine used by enemies and projectile tracking.
 */
export function simplifyRoute(points: readonly Vec2[]): Vec2[] {
    if (points.length <= 2) return points.map(copy);
    const result: Vec2[] = [copy(points[0])];
    for (let i = 1; i < points.length - 1; i += 1) {
        const a = points[i - 1];
        const b = points[i];
        const c = points[i + 1];
        const abx = b.x - a.x;
        const abz = b.z - a.z;
        const bcx = c.x - b.x;
        const bcz = c.z - b.z;
        const cross = abx * bcz - abz * bcx;
        const dot = abx * bcx + abz * bcz;
        if (Math.abs(cross) > 1e-7 || dot <= 0) result.push(copy(b));
    }
    result.push(copy(points[points.length - 1]));
    return result;
}

/**
 * Build a deterministic, evenly sampled route with rounded bends. The route
 * remains on the existing road tiles, but units turn progressively instead of
 * snapping through eight hard 90-degree corners.
 */
export function buildSmoothRoute(
    cellCentres: readonly Vec2[],
    options: Partial<SmoothRouteOptions> = {},
): Vec2[] {
    if (cellCentres.length < 2) return cellCentres.map(copy);
    const opts = { ...DEFAULT_ROUTE_OPTIONS, ...options };
    const controls = simplifyRoute(cellCentres);
    const shaped: Vec2[] = [];

    const firstDirection = unit(controls[0], controls[1]);
    pushUnique(shaped, {
        x: controls[0].x - firstDirection.x * opts.entryExtension,
        z: controls[0].z - firstDirection.z * opts.entryExtension,
    });
    pushUnique(shaped, controls[0]);

    const cornerSteps = Math.max(2, Math.floor(opts.cornerSteps ?? 8));
    for (let i = 1; i < controls.length - 1; i += 1) {
        const previous = controls[i - 1];
        const corner = controls[i];
        const next = controls[i + 1];
        const incoming = unit(previous, corner);
        const outgoing = unit(corner, next);
        const radius = Math.min(
            Math.max(0, opts.cornerRadius),
            distance(previous, corner) * 0.45,
            distance(corner, next) * 0.45,
        );
        const entry = {
            x: corner.x - incoming.x * radius,
            z: corner.z - incoming.z * radius,
        };
        const exit = {
            x: corner.x + outgoing.x * radius,
            z: corner.z + outgoing.z * radius,
        };
        pushUnique(shaped, entry);
        for (let step = 1; step <= cornerSteps; step += 1) {
            const t = step / cornerSteps;
            const inv = 1 - t;
            pushUnique(shaped, {
                x: inv * inv * entry.x + 2 * inv * t * corner.x + t * t * exit.x,
                z: inv * inv * entry.z + 2 * inv * t * corner.z + t * t * exit.z,
            });
        }
    }

    const last = controls[controls.length - 1];
    pushUnique(shaped, last);
    if (opts.exitExtension > 0) {
        const direction = unit(controls[controls.length - 2], last);
        pushUnique(shaped, {
            x: last.x + direction.x * opts.exitExtension,
            z: last.z + direction.z * opts.exitExtension,
        });
    }

    return resampleRoute(shaped, Math.max(0.04, opts.sampleSpacing));
}

/** Even arc-length sampling keeps targeting progress meaningful across bends. */
export function resampleRoute(points: readonly Vec2[], spacing: number): Vec2[] {
    if (points.length < 2) return points.map(copy);
    const cumulative = [0];
    for (let i = 1; i < points.length; i += 1) {
        cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
    }
    const total = cumulative[cumulative.length - 1];
    if (total <= 1e-8) return [copy(points[0])];

    const result: Vec2[] = [];
    let segment = 1;
    for (let d = 0; d < total; d += spacing) {
        while (segment < cumulative.length - 1 && cumulative[segment] < d) segment += 1;
        const startDistance = cumulative[segment - 1];
        const segmentLength = cumulative[segment] - startDistance;
        const t = segmentLength <= 1e-8 ? 0 : (d - startDistance) / segmentLength;
        const a = points[segment - 1];
        const b = points[segment];
        result.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
    pushUnique(result, points[points.length - 1]);
    return result;
}

function unit(a: Vec2, b: Vec2): Vec2 {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const length = Math.hypot(dx, dz) || 1;
    return { x: dx / length, z: dz / length };
}

function distance(a: Vec2, b: Vec2): number {
    return Math.hypot(b.x - a.x, b.z - a.z);
}

function copy(point: Vec2): Vec2 {
    return { x: point.x, z: point.z };
}

function pushUnique(points: Vec2[], point: Vec2): void {
    const previous = points[points.length - 1];
    if (!previous || distance(previous, point) > 1e-8) points.push(copy(point));
}
