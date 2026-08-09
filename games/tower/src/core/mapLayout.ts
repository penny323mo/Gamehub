import { MAP } from './config';
import type { MapRegionConfig } from './types';

export interface TerrainTile {
    cell: readonly number[];
    model: string;
    rotK?: number;
    buildable?: boolean;
}

export interface LayoutCell {
    col: number;
    row: number;
    exists: boolean;
    buildable: boolean;
    pathIndex: number;
    distanceFromPath: number;
    terrain: TerrainTile | null;
    region: MapRegionConfig | null;
}

const key = (col: number, row: number): string => `${col},${row}`;
const pathIndexByCell = new Map(MAP.path.map((cell, i) => [key(cell[0], cell[1]), i]));
const explicitTerrain = new Map(
    (MAP.terrainTiles ?? []).map((tile) => [key(tile.cell[0], tile.cell[1]), tile] as const),
);
const shellModels = ['tile_hill', 'tile_tree', 'tile_treeDouble', 'tile_rock', 'tile_crystal'] as const;

const distanceFromPath = (col: number, row: number): number => {
    let best = Infinity;
    for (const [pc, pr] of MAP.path) best = Math.min(best, Math.max(Math.abs(col - pc), Math.abs(row - pr)));
    return best;
};

const generatedShell = (col: number, row: number): TerrainTile => {
    // Stable integer hash: the same map always gets the same ridge silhouette.
    const n = Math.abs(Math.imul(col + 37, 73856093) ^ Math.imul(row + 61, 19349663));
    return {
        cell: [col, row],
        model: shellModels[n % shellModels.length],
        rotK: (n >>> 5) % 4,
        buildable: false,
    };
};

export function cellAt(col: number, row: number): LayoutCell {
    const insideGrid = col >= 0 && col < MAP.cols && row >= 0 && row < MAP.rows;
    const distance = insideGrid ? distanceFromPath(col, row) : Infinity;
    const span = MAP.playableRows?.[row];
    const inSpan = !span || (col >= span[0] && col <= span[1]);
    const exists = insideGrid && inSpan && distance <= (MAP.landRadius ?? Infinity);
    const pathIndex = pathIndexByCell.get(key(col, row)) ?? -1;
    const explicit = explicitTerrain.get(key(col, row)) ?? null;
    const onShell = exists && pathIndex < 0 && distance === (MAP.landRadius ?? Infinity);
    const terrain = explicit ?? (onShell ? generatedShell(col, row) : null);
    const buildable = exists
        && pathIndex < 0
        && distance <= (MAP.buildRadius ?? Infinity)
        && terrain?.buildable !== false;
    const region = exists
        ? MAP.regions?.find(({ colRange }) => col >= colRange[0] && col <= colRange[1]) ?? null
        : null;
    return { col, row, exists, buildable, pathIndex, distanceFromPath: distance, terrain, region };
}

const cells: LayoutCell[] = [];
for (let row = 0; row < MAP.rows; row += 1) {
    for (let col = 0; col < MAP.cols; col += 1) {
        const cell = cellAt(col, row);
        if (cell.exists) cells.push(cell);
    }
}

export const LAYOUT = {
    cells,
    path: MAP.path,
    regions: MAP.regions ?? [],
    bounds: {
        minCol: Math.min(...cells.map((c) => c.col)),
        maxCol: Math.max(...cells.map((c) => c.col)),
        minRow: Math.min(...cells.map((c) => c.row)),
        maxRow: Math.max(...cells.map((c) => c.row)),
    },
    cellAt,
};
