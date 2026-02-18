import type { Vec2 } from './types';
import { MAP } from './config';

/** Convert grid cell [col, row] to world position (center of cell) */
export function cellToWorld(col: number, row: number): Vec2 {
    return {
        x: MAP.origin.x + (col + 0.5) * MAP.cellSize,
        z: MAP.origin.z + (row + 0.5) * MAP.cellSize,
    };
}

/** Convert world position to grid cell */
export function worldToCell(wx: number, wz: number): { col: number; row: number } {
    const col = Math.floor((wx - MAP.origin.x) / MAP.cellSize);
    const row = Math.floor((wz - MAP.origin.z) / MAP.cellSize);
    return { col, row };
}

/** Build world-space path from map config */
export function buildPathWorld(): Vec2[] {
    return MAP.path.map(([c, r]) => cellToWorld(c, r));
}

/** Distance between two world points (2D XZ plane) */
export function dist(a: Vec2, b: Vec2): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
}

/** Interpolate between two points */
export function lerp2(a: Vec2, b: Vec2, t: number): Vec2 {
    return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
    };
}
