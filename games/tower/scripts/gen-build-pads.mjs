// 建築平台：**邊幾格起得塔，係設計出嚟嘅，唔係「唔係路就得」**。
//
// 點解要有呢個 script：原本 `canBuild()` 嘅規則係「唔係路、又未有塔」，於是
// 張 20×12 嘅地圖有 **62 個貼路位**。而實測（`tests/playthrough.mjs`）嘅膝點
// 好窄——**20 座塔第 41 波會死，30 座塔打到 46 波一條命都唔跌**。即係話：
// 位置由頭到尾都唔係一個決定，你淨係要一路撳起塔就贏。
//
// 一隻塔防嘅核心決定係「呢舊錢，擺喺邊」。冇稀缺就冇決定。所以改成明確平台，
// 數量落喺膝點下面少少，而且**沿住條路攤開**——唔可以全部擠喺出生點嗰頭，
// 否則又變返「頭段火力網」。
//
// 條規則喺呢度，而 `tests/balance.mjs` **由呢度 import** 去守——修同守用同一條。
//
// 跑法：node games/tower/scripts/gen-build-pads.mjs [--write]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MAP_PATH = path.join(HERE, '..', 'configs', 'map.json');

/** 目標平台數。20 座會死、30 座無敵，所以擺喺下半段：緊，但唔係冇得贏。 */
export const PAD_TARGET = 22;
/** 沿路攤開嘅最細間距（用路嘅索引距離計）。 */
export const PAD_SPACING = 1;

const key = (c, r) => `${c},${r}`;

/**
 * 由條路推出平台位置。
 *
 * 每隔 `步` 個路格擺一個平台，左右輪流——輪流係為咗令敵人兩邊都食到火力，
 * 而唔係一邊行過去。攞唔到嗰邊就試另一邊，兩邊都唔得就跳去下一格。
 */
export function buildPads(map, target = PAD_TARGET) {
    const 路 = map.path.map(([c, r]) => [c, r]);
    const 路格 = new Set(路.map(([c, r]) => key(c, r)));
    const 出 = [];
    const 用咗 = new Set();

    const 內 = (c, r) => c >= 0 && c < map.cols && r >= 0 && r < map.rows;
    const 得唔得 = (c, r) => 內(c, r) && !路格.has(key(c, r)) && !用咗.has(key(c, r));

    // 頭尾兩格係出生門同城堡，唔擺平台喺隔籬（唔想一開場就守死出生點）。
    const 由 = 2, 到 = 路.length - 3;
    // **平均攤開**，唔係固定步長：固定步長會由頭行到夠數就停，結果最後三分一
    // 條路一個平台都冇（第一版就係咁，只攤到路索引 2–23 / 30）。
    const 位 = [];
    for (let k = 0; k < target; k += 1) {
        位.push(由 + Math.round((k * (到 - 由)) / Math.max(1, target - 1)));
    }

    let 邊 = 0;
    for (const i of 位) {
        if (出.length >= target) break;
        const [c, r] = 路[i];
        const 前 = 路[Math.max(0, i - 1)];
        const 後 = 路[Math.min(路.length - 1, i + 1)];
        // 條路喺呢格嘅走向，法線就係左右兩邊
        const dx = 後[0] - 前[0], dz = 後[1] - 前[1];
        const 法 = Math.abs(dx) >= Math.abs(dz) ? [0, 1] : [1, 0];
        const 兩邊 = [
            [c + 法[0], r + 法[1]],
            [c - 法[0], r - 法[1]],
        ];
        const 順 = 邊 % 2 === 0 ? 兩邊 : [兩邊[1], 兩邊[0]];
        for (const [pc, pr] of 順) {
            if (得唔得(pc, pr)) { 出.push([pc, pr]); 用咗.add(key(pc, pr)); 邊 += 1; break; }
        }
    }

    // 行完一轉都未夠數就再掃一次，今次兩邊都攞。
    for (let i = 由; i <= 到 && 出.length < target; i += 1) {
        const [c, r] = 路[i];
        for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            if (出.length >= target) break;
            const pc = c + dc, pr = r + dr;
            if (得唔得(pc, pr)) { 出.push([pc, pr]); 用咗.add(key(pc, pr)); }
        }
    }
    return 出;
}

/** 每個平台**最近嘅路格索引**——用嚟檢查啲平台有冇攤開。 */
export function padSpread(map, pads) {
    return pads.map(([pc, pr]) => {
        let best = 0, bd = Infinity;
        map.path.forEach(([c, r], i) => {
            const d = Math.abs(c - pc) + Math.abs(r - pr);
            if (d < bd) { bd = d; best = i; }
        });
        return best;
    }).sort((a, b) => a - b);
}

if (process.argv[1] && process.argv[1].endsWith('gen-build-pads.mjs')) {
    const map = JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    const pads = buildPads(map);
    const 攤 = padSpread(map, pads);
    console.log(`平台 ${pads.length} 個（目標 ${PAD_TARGET}），沿路索引 ${攤[0]}–${攤[攤.length - 1]}`);

    const 路格 = new Set(map.path.map(([c, r]) => key(c, r)));
    const 平台格 = new Set(pads.map(([c, r]) => key(c, r)));
    for (let r = 0; r < map.rows; r += 1) {
        let line = '';
        for (let c = 0; c < map.cols; c += 1) {
            line += 路格.has(key(c, r)) ? '#' : 平台格.has(key(c, r)) ? 'B' : '.';
        }
        console.log('  ' + line);
    }

    if (process.argv.includes('--write')) {
        map.buildCells = pads;
        fs.writeFileSync(MAP_PATH, JSON.stringify(map, null, 4) + '\n');
        console.log('寫咗入 configs/map.json');
    } else {
        console.log('（要寫入就加 --write）');
    }
}
