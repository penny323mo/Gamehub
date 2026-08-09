// 條路點鋪：**由條路自己嘅形狀推出每格用邊塊磚、轉幾多度**。
//
// 純函數，冇 three.js、冇 DOM——所以 Node 度嘅尺（`tests/tiles.mjs`）可以直接
// import 佢，唔使開瀏覽器。呢個模組唔畫嘢，佢只係答一條問題：
// 「第 i 格路，鄰居喺邊，應該擺邊塊磚、朝邊邊？」
//
// ── 方向約定 ──
// 格 (col,row) → 世界 (x,z)：x 跟 col 升，z 跟 row 升（見 `core/path.ts`）。
// 所以 row−1 係 **−Z**、col−1 係 **−X**。四個方向索引：
//   0 = −Z（row−1）、1 = −X（col−1）、2 = +Z（row+1）、3 = +X（col+1）
// three.js 繞 Y 轉 θ 會將 (x,z) 變成 (x cosθ + z sinθ, −x sinθ + z cosθ)：
//   θ=0 → −Z 留喺 −Z；θ=π/2 → −Z 去到 −X；θ=π → +Z；θ=3π/2 → +X。
// 即係**轉 k×90° 等於方向索引加 k**。成個模組就係靠呢一句。
//
// ── 開口表 ──
// 呢張表**唔係抄 Kenney 個文件，係由 GLB 量返出嚟**：路面材質叫 `dirtDark`，
// 邊塊磚邊個邊有 dirtDark 掂到 ±0.5 邊界，嗰邊就係開口。`tests/tiles.mjs`
// 每次都會由啲 .glb 重新量一次再同呢張表對——換咗模型而表冇改，就會紅。

/** 0 = −Z, 1 = −X, 2 = +Z, 3 = +X */
export type Dir = 0 | 1 | 2 | 3;

export const DIR_STEP: readonly [number, number][] = [
    [0, -1], // −Z
    [-1, 0], // −X
    [0, 1],  // +Z
    [1, 0],  // +X
];

/** 由 (col,row) 差值攞方向；唔係四鄰就 null。 */
export function dirOf(from: readonly number[], to: readonly number[]): Dir | null {
    const dc = to[0] - from[0], dr = to[1] - from[1];
    for (let d = 0; d < 4; d += 1) {
        if (DIR_STEP[d][0] === dc && DIR_STEP[d][1] === dr) return d as Dir;
    }
    return null;
}

/** 每塊磚未轉之前，路面掂到邊幾邊（量返出嚟嘅，見上面）。 */
export const TILE_OPENINGS: Readonly<Record<string, readonly Dir[]>> = {
    tile: [],
    tile_dirt: [],
    tile_straight: [0, 2],
    tile_cornerRound: [0, 1],
    tile_cornerSquare: [0, 1],
    tile_end: [0],
    tile_endRound: [0],
    tile_spawn: [0, 2],
    tile_endSpawn: [0],
    tile_crossing: [0, 1, 2, 3],
    tile_split: [0, 1, 3],
    // Bridge deck runs along local X; the river itself runs along local Z.
    tile_riverBridge: [1, 3],
};

const rot = (dirs: readonly Dir[], k: number): Dir[] =>
    dirs.map((d) => ((d + k) % 4) as Dir).sort();

const same = (a: readonly Dir[], b: readonly Dir[]): boolean =>
    a.length === b.length && a.every((v, i) => v === b[i]);

export type TilePick = { model: string; rotK: number; rotationY: number };
export type PathTileOverride = { cell: readonly number[]; model: string; rotK: number };

/**
 * 想要邊幾個開口，就搵一塊轉得到嘅磚。
 * `prefer` 排先——起點要 `tile_endSpawn`，終點要 `tile_end`，中間先至用直路同彎路。
 */
export function pickTile(want: readonly Dir[], prefer: readonly string[]): TilePick | null {
    const target = [...want].sort();
    const 候選 = [...prefer, ...Object.keys(TILE_OPENINGS)];
    for (const model of 候選) {
        const base = TILE_OPENINGS[model];
        if (!base) continue;
        for (let k = 0; k < 4; k += 1) {
            if (same(rot(base, k), target)) {
                return { model, rotK: k, rotationY: (k * Math.PI) / 2 };
            }
        }
    }
    return null;
}

/**
 * 成條路鋪一次。
 *
 * 每格要嘅開口＝佢通向前後鄰居嗰兩邊。頭尾各得一個鄰居，所以係單開口——
 * 呢個就係 `tile_endSpawn`（出生）同 `tile_end`（終點）擺得啱嘅原因，
 * 而唔係硬塞一塊直路落去然後靠一堆特效遮住。
 */
export function pathTiles(
    path: readonly (readonly number[])[],
    overrides: readonly PathTileOverride[] = [],
): (TilePick & { col: number; row: number })[] {
    const 出: (TilePick & { col: number; row: number })[] = [];
    const overrideByCell = new Map(overrides.map((o) => [`${o.cell[0]},${o.cell[1]}`, o]));
    for (let i = 0; i < path.length; i += 1) {
        const want: Dir[] = [];
        if (i > 0) { const d = dirOf(path[i], path[i - 1]); if (d !== null) want.push(d); }
        if (i < path.length - 1) { const d = dirOf(path[i], path[i + 1]); if (d !== null) want.push(d); }
        const prefer = i === 0
            ? ['tile_endSpawn']
            : i === path.length - 1
                ? ['tile_end']
                : ['tile_straight', 'tile_cornerRound'];
        const override = overrideByCell.get(`${path[i][0]},${path[i][1]}`);
        const pick = override
            ? { model: override.model, rotK: override.rotK, rotationY: (override.rotK * Math.PI) / 2 }
            : pickTile(want, prefer);
        出.push({ ...(pick ?? { model: 'tile', rotK: 0, rotationY: 0 }), col: path[i][0], row: path[i][1] });
    }
    return 出;
}
