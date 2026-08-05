// 個場嘅形狀，喺 Node 度直接量——唔開瀏覽器。
//
// 之前所有關於地圖嘅問題都要開真瀏覽器先答到，因為個場住喺 React effect
// 入面。而軟件光柵化一秒三幀，角色一秒行半米：量到嘅係「我隻機械人蠢」定
// 係「地圖爛」，分唔開（ADR-157）。`map.ts` 拆咗出嚟之後，同一組數喺呢度
// 一秒之內就砌得返成個碰撞世界。
//
// 呢個檔淨係守形狀（封唔封得住、通唔通、開口喺唔喺應該嗰度）。畫面同物理
// 反應仍然喺 `hud-layout.mjs`。
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMap, ARENA_RADIUS, BOSS_SPAWN_Z, FOG_GATE } from '../src/map.ts';

const 盒 = [];
const M = buildMap((position, halfExtents, rotationY = 0, tag) => {
    盒.push({
        x: position[0], y: position[1], z: position[2],
        hx: halfExtents[0], hy: halfExtents[1], hz: halfExtents[2], rotationY, tag,
    });
});
const 霧門 = [
    { x: FOG_GATE.pos[0], z: FOG_GATE.pos[2], hx: FOG_GATE.half[0], hz: FOG_GATE.half[2], rotationY: 0 },
    { x: -M.NORTH.r + 0.6, z: M.NORTH.cz, hx: FOG_GATE.half[0], hz: FOG_GATE.half[2], rotationY: Math.PI / 2 },
];

// 世界 → 盒本地座標。繞 Y 轉 θ：dx = lx·cosθ + lz·sinθ，所以反轉係下面呢條。
// 呢個約定喺 hud-layout 度寫錯過五次（ADR-165）：鏡像咗嘅環仲係一個環，
// 所以「封唔封得住」照樣答啱，而開口位置就全部搬咗去鏡像嗰邊。
const 入面 = (px, pz, b, pad) => {
    const dx = px - b.x, dz = pz - b.z;
    const c = Math.cos(b.rotationY), s = Math.sin(b.rotationY);
    const lx = dx * c - dz * s, lz = dx * s + dz * c;
    return Math.abs(lx) <= b.hx + pad && Math.abs(lz) <= b.hz + pad;
};
const 半徑 = 0.42;                                  // 玩家膠囊
const 漫 = (list) => {
    // 格網要**罩得住埋啲場外探點**，否則 `到()` 個索引會滑咗去隔籬行，
    // 讀到隔籬格嘅值當咗係「漫到出去」。第一版 x 只去到 +30 而探點喺
    // (0, 60)——條 gate 一寫出嚟就報咗個假嘅「行得出場外」。
    const 格 = 0.5, x0 = -100, z0 = -90, W = 300, H = 290;
    const 撞 = (i, j) => list.some((b) => 入面(x0 + i * 格, z0 + j * 格, b, 半徑));
    const 過 = new Uint8Array(W * H);
    const 起i = Math.round((0 - x0) / 格), 起j = Math.round((17 - z0) / 格);
    if (撞(起i, 起j)) return null;
    const 堆 = [起i * H + 起j];
    過[起i * H + 起j] = 1;
    while (堆.length) {
        const k = 堆.pop(), i = Math.floor(k / H), j = k % H;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const a = i + di, b = j + dj;
            if (a < 0 || b < 0 || a >= W || b >= H || 過[a * H + b] || 撞(a, b)) continue;
            過[a * H + b] = 1;
            堆.push(a * H + b);
        }
    }
    const 到 = (x, z) => {
        const i = Math.round((x - x0) / 格), j = Math.round((z - z0) / 格);
        if (i < 0 || j < 0 || i >= W || j >= H) throw new Error(`探點 (${x}, ${z}) 喺格網外面`);
        return !!過[i * H + j];
    };
    return { 到, 格數: 過.reduce((n, v) => n + v, 0) };
};

test('三個場都行得到，而且行唔出去', () => {
    const r = 漫(盒);
    assert.ok(r, '出生點卡住咗');
    assert.equal(r.到(M.COURT.cx, M.COURT.cz), true, '去唔到西面庭院');
    assert.equal(r.到(0, BOSS_SPAWN_Z), true, '去唔到北面聖所');
    // 地板係一塊無限平面，所以「行得出去」＝ 漫到場外好遠嗰啲格。
    // 三個場加三條走廊嘅面積大約四千平方米，即係一萬六千格上下。
    for (const [x, z] of [[0, 45], [45, 0], [-95, 45], [0, -85], [-95, -85]]) {
        assert.equal(r.到(x, z), false, `漫咗出場外 (${x}, ${z})`);
    }
    assert.ok(r.格數 > 8000 && r.格數 < 22000, `可行格數 ${r.格數} 唔似三個場加三條走廊`);
});

test('霧門未拆之前攔得住聖所，但攔唔到西面庭院', () => {
    const r = 漫([...盒, ...霧門]);
    assert.ok(r);
    assert.equal(r.到(0, BOSS_SPAWN_Z), false, '霧門攔唔到 boss 場（西面兜得過）');
    assert.equal(r.到(M.COURT.cx, M.COURT.cz), true, '霧門順手封死咗西路');
});

test('環牆得應該有嗰幾個開口，冇多冇少', () => {
    // 沿住半徑掃一圈，數空隙。圓場兩個口（西、北），庭院兩個（東、北），
    // 聖所兩個（南、西）。呢條就係鏡像約定捉唔到嗰樣嘢：鏡像返轉頭數目一樣，
    // 但開口會走去對稱嗰邊，所以連角度都要對。
    const 掃 = (cx, cz, r, 應該) => {
        const 空 = [];
        for (let a = 0; a < Math.PI * 2; a += 0.005) {
            const px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r;
            if (!盒.some((b) => 入面(px, pz, b, 0))) 空.push(a);
        }
        const 段 = [];
        for (const a of 空) {
            const last = 段[段.length - 1];
            if (last && a - last[1] < 0.02) last[1] = a; else 段.push([a, a]);
        }
        // 跨過 0 嗰個開口會俾掃描起點斬開兩橛（0.05 同 6.23 其實係同一個
        // 東門）。唔接返埋就會數多一個，而條 gate 一寫出嚟就係咁報。
        if (段.length > 1 && 段[0][0] < 0.02 && 段[段.length - 1][1] > Math.PI * 2 - 0.02) {
            const 尾 = 段.pop();
            段[0] = [尾[0] - Math.PI * 2, 段[0][1]];
        }
        const 中 = 段.map(([s, e]) => ((s + e) / 2 + Math.PI * 2) % (Math.PI * 2)).sort((a, b) => a - b);
        assert.equal(中.length, 應該.length,
            `(${cx}, ${cz}) 半徑 ${r} 有 ${中.length} 個開口，應該 ${應該.length}：${中.map((v) => v.toFixed(2))}`);
        應該.forEach((want, i) => {
            const d = Math.abs(((中[i] - want + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
            assert.ok(d < 0.12, `開口 ${中[i].toFixed(2)} 唔喺 ${want.toFixed(2)}`);
        });
    };
    掃(0, 0, ARENA_RADIUS, [Math.PI, Math.PI * 1.5]);
    掃(M.COURT.cx, M.COURT.cz, M.COURT.r, [0, Math.PI * 1.5]);
    掃(0, M.NORTH.cz, M.NORTH.r, [Math.PI / 2, Math.PI]);
});
