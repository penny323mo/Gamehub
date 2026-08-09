// 條路鋪得接唔接得上。
//
// 呢把尺守兩件事，而第一件先至係重點：
//
// 1. **`tileset.ts` 嗰張開口表，同啲 .glb 入面真係嘅嘢對得上。** 張表講「呢塊
//    磚喺 −Z 同 +Z 有路口」，而張表係人寫嘅。人寫嘅嘢會同模型脫節——尤其係
//    第日換一套磚。所以呢度**由 GLB 重新量一次**：路面材質係 `dirtDark`，
//    邊個邊有 dirtDark 掂到 ±0.5，嗰邊就係開口。兩邊唔同就紅。
//    （同一件事寫兩次就有兩個答案——除非其中一份係由真嘢量返出嚟。）
// 2. **成條路每一格都接得上隔籬格。** 一格嘅 +X 開口，隔籬格必須有 −X 開口。
//    接唔上就係畫面上一條斷開嘅路。
//
// 跑法：node games/tower/tests/tiles.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TILES = path.join(HERE, '..', 'public', 'models', 'tiles');
const MAPCFG = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'configs', 'map.json'), 'utf8'));

// tileset.ts 係 TypeScript，Node 直接 import 唔到——用 esbuild（本來就係
// devDependency）即場轉一次，唔好喺測試度抄多份。
const OUT = path.join(HERE, '..', 'node_modules', '.cache', 'tileset.mjs');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
execFileSync(path.join(HERE, '..', 'node_modules', '.bin', 'esbuild'), [
    path.join(HERE, '..', 'src', 'render', 'tileset.ts'),
    '--format=esm', '--platform=neutral', `--outfile=${OUT}`,
]);
const { TILE_OPENINGS, pathTiles, DIR_STEP } = await import(pathToFileURL(OUT).href);

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
    if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
    else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

// ── 由 GLB 量返每塊磚嘅開口 ──
const 量開口 = (file) => {
    // Normal road tiles mark their surface as dirtDark. The river bridge is a
    // wooden deck, so its real traversal edges must be measured from wood.
    const ROAD = new Set(path.basename(file) === 'tile_riverBridge.glb' ? ['wood'] : ['dirtDark']);
    const d = fs.readFileSync(file);
    const jl = d.readUInt32LE(12);
    const j = JSON.parse(d.subarray(20, 20 + jl).toString('utf8'));
    const bin = d.subarray(20 + jl + 8);
    const acc = (i) => {
        const a = j.accessors[i], bv = j.bufferViews[a.bufferView];
        const off = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
        const n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
        const read = { 5121: [1, 'readUInt8'], 5123: [2, 'readUInt16LE'], 5125: [4, 'readUInt32LE'], 5126: [4, 'readFloatLE'] }[a.componentType];
        const out = [];
        for (let k = 0; k < a.count; k += 1) {
            const v = [];
            for (let c = 0; c < n; c += 1) v.push(bin[read[1]](off + (k * n + c) * read[0]));
            out.push(n === 1 ? v[0] : v);
        }
        return out;
    };
    const pts = [];
    for (const m of j.meshes) {
        for (const pr of m.primitives) {
            if (!ROAD.has(j.materials[pr.material]?.name)) continue;
            const pos = acc(pr.attributes.POSITION), idx = acc(pr.indices);
            for (const i of new Set(idx)) pts.push(pos[i]);
        }
    }
    // 0 = −Z, 1 = −X, 2 = +Z, 3 = +X
    const 邊 = [[2, -0.5], [0, -0.5], [2, 0.5], [0, 0.5]];
    const out = [];
    for (let d2 = 0; d2 < 4; d2 += 1) {
        const [ax, val] = 邊[d2];
        const oa = ax === 2 ? 0 : 2;
        const sel = pts.filter((q) => Math.abs(q[ax] - val) < 1e-3).map((q) => q[oa]);
        if (sel.length >= 2 && Math.max(...sel) - Math.min(...sel) > 0.15) out.push(d2);
    }
    return out;
};

const 量到 = {};
for (const f of fs.readdirSync(TILES).filter((x) => x.endsWith('.glb'))) {
    量到[f.replace('.glb', '')] = 量開口(path.join(TILES, f));
}
const 表 = Object.keys(TILE_OPENINGS);
const 對唔上 = 表.filter((k) => 量到[k] === undefined
    || JSON.stringify([...TILE_OPENINGS[k]].sort()) !== JSON.stringify(量到[k]));
check(`開口表同 .glb 量到嘅一樣（表入面 ${表.length} 塊）`, 對唔上.length === 0,
    對唔上.map((k) => ({ 磚: k, 表: TILE_OPENINGS[k], 量到: 量到[k] })));
// 表冇寫但其實有路口嘅磚 → 白白嘥咗一塊可以用嘅磚
const 漏咗 = Object.entries(量到).filter(([k, v]) => v.length > 0 && !(k in TILE_OPENINGS));
check('冇一塊有路口嘅磚係表度漏咗', 漏咗.length === 0, 漏咗.slice(0, 6));

// ── 成條路接唔接得上 ──
const 鋪 = pathTiles(MAPCFG.path, MAPCFG.pathTileOverrides ?? []);
check(`每一格路都揀到磚（共 ${MAPCFG.path.length} 格）`,
    鋪.length === MAPCFG.path.length && 鋪.every((t) => t.model !== 'tile'),
    鋪.filter((t) => t.model === 'tile').slice(0, 5));

const 轉 = (dirs, k) => dirs.map((d) => (d + k) % 4).sort();
const 實開口 = new Map(鋪.map((t) => [`${t.col},${t.row}`, 轉(量到[t.model] ?? [], t.rotK)]));
const 斷開 = [];
for (let i = 0; i < MAPCFG.path.length; i += 1) {
    const [c, r] = MAPCFG.path[i];
    const mine = 實開口.get(`${c},${r}`);
    for (const j2 of [i - 1, i + 1]) {
        if (j2 < 0 || j2 >= MAPCFG.path.length) continue;
        const [nc, nr] = MAPCFG.path[j2];
        const d = DIR_STEP.findIndex(([dc, dr]) => dc === nc - c && dr === nr - r);
        if (d < 0) { 斷開.push({ 格: [c, r], 因: '鄰居唔係四鄰' }); continue; }
        if (!mine.includes(d)) { 斷開.push({ 格: [c, r], 磚: 鋪[i].model, 缺: d }); continue; }
        const 對面 = 實開口.get(`${nc},${nr}`);
        if (!對面.includes((d + 2) % 4)) 斷開.push({ 格: [nc, nr], 磚: 鋪[j2].model, 對唔上: (d + 2) % 4 });
    }
}
check('成條路每格都同前後接得上（唔會有斷口）', 斷開.length === 0, 斷開.slice(0, 6));

// 頭尾要用返頭尾磚——唔係就會見到條路無端端喺半空斷咗
check('起點用出生磚、終點用終點磚',
    鋪[0].model === 'tile_endSpawn' && 鋪[鋪.length - 1].model === 'tile_end',
    { 起點: 鋪[0].model, 終點: 鋪[鋪.length - 1].model });

// 彎位要真係用彎磚——全部直路就即係轉向嗰陣條路會穿出格外
const 彎 = 鋪.filter((t) => t.model === 'tile_cornerRound').length;
const 直 = 鋪.filter((t) => t.model === 'tile_straight').length;
check('彎位用彎磚、直位用直磚（兩種都有出現）', 彎 >= 3 && 直 >= 3, { 彎, 直, 總: 鋪.length });
check('中央河道用真橋接住道路，唔係一塊普通路磚扮跨河',
    鋪.filter((t) => t.model === 'tile_riverBridge').length === 1,
    鋪.filter((t) => t.model === 'tile_riverBridge'));

console.log(`\ntower 路磚: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
process.exit(fail ? 1 : 0);
