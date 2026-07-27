// 電腦對手：排得正、跑得完、唔會疊埋、唔會爆手機預算。
//
// 對手同玩家共用 car.js 物理同 driver.js 控制器，所以呢個檔案其實同時
// 守住咗「賽道有冇位跑得完」——一有賽道改壞，對手會第一個卡死。

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;
const TRACK_IDS = await page.evaluate(() => window.__racer.TRACKS.map(t => t.id));

// T1：起跑格——排喺起跑線後面、留喺路面、唔會疊住
const grid = await page.evaluate(() => {
    const { rivals, track, car } = window.__racer;
    rivals.spawn(track, 4, 3);
    const tan = track.curve.getTangentAt(track.startT);
    const rows = rivals.rivals.map(rv => {
        const dx = rv.car.pos.x - track.startPos.x, dz = rv.car.pos.z - track.startPos.z;
        return {
            along: +(dx * tan.x + dz * tan.z).toFixed(1),        // 正數 = 喺起跑線前面
            onRoad: track.isDrivable(rv.car.pos.x, rv.car.pos.z),
        };
    });
    let minGap = Infinity;
    const all = rivals.rivals.map(rv => rv.car).concat([car]);
    for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
            minGap = Math.min(minGap, Math.hypot(all[i].pos.x - all[j].pos.x, all[i].pos.z - all[j].pos.z));
        }
    }
    return { rows, minGap: +minGap.toFixed(2), count: rivals.count };
});
console.log('  ', JSON.stringify(grid));
check('spawn 出到指定數目', grid.count === 4, grid.count);
// 對手排喺玩家前面，鏡頭喺車後先見到佢哋，亦即刻有嘢追
check('全部排喺起跑線前面', grid.rows.every(r => r.along > 4), grid.rows.map(r => r.along));
check('全部企喺路面', grid.rows.every(r => r.onRoad), grid.rows);
check('起跑冇車疊住車（>3 米）', grid.minGap > 3, grid.minGap);

// T2：三條賽道都跑得完三圈，而且唔會長期卡喺草地
for (const id of TRACK_IDS) {
    const out = await page.evaluate(async (id) => {
        const { buildTrack } = window.__racer;
        buildTrack(id);
        const { rivals, track, car } = window.__racer;
        car.reset(track.startPos, track.startDir);
        rivals.spawn(track, 4, 3);
        let offroadFrames = 0, samples = 0;
        const total = 60 * 260;
        for (let i = 0; i < total; i++) {
            rivals.update(1 / 60, track, null);
            if (i % 30 === 0) {
                for (const rv of rivals.rivals) { samples++; if (rv.car.offroad) offroadFrames++; }
            }
            if (rivals.finishOrder.length === rivals.count) break;
        }
        return {
            id,
            finished: rivals.finishOrder.length,
            count: rivals.count,
            times: rivals.finishOrder.map(rv => +rv.time.toFixed(1)),
            laps: rivals.rivals.map(rv => rv.lap),
            offroadPct: +(offroadFrames / Math.max(1, samples) * 100).toFixed(1),
        };
    }, id);
    console.log('  ', JSON.stringify(out));
    check(`${id}：四架對手全部跑完三圈`, out.finished === out.count, out);
    check(`${id}：完賽時間合理（60–200 秒）`,
        out.times.every(t => t > 60 && t < 200), out.times);
    check(`${id}：對手唔會長期喺草地（<25%）`, out.offroadPct < 25, out.offroadPct);
    // 難度唔同，時間應該有分別——全部一樣就代表 SKILLS 冇生效
    check(`${id}：唔同難度跑出唔同時間`,
        new Set(out.times.map(t => Math.round(t))).size > 1, out.times);
}

// T3：手機預算——四架對手加埋只可以多一個 draw call
const budget = await page.evaluate(async () => {
    const { rivals, track, renderer, car, startRace } = window.__racer;
    const measure = async (n) => {
        rivals.spawn(track, n, 3);
        for (let i = 0; i < 120; i++) rivals.update(1 / 60, track, car);
        renderer.render(window.__racer.scene, window.__racer.camera);
        return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
    };
    const none = await measure(0);
    const four = await measure(4);
    return {
        none, four,
        extraCalls: four.calls - none.calls,
        extraTris: four.tris - none.tris,
        instanced: rivals.mesh.isInstancedMesh === true,
    };
});
console.log('  ', JSON.stringify(budget));
check('四架對手全部塞入一個 InstancedMesh', budget.instanced);
check('四架對手只多一個 draw call', budget.extraCalls <= 1, budget.extraCalls);
check('draw call 守返 Codex 嗰個 <18 預算', budget.four.calls < 18, budget.four.calls);
check('三角形守返 <120k 預算', budget.four.tris < 120000, budget.four.tris);

// T4：分開——對手同玩家、對手同對手都唔可以穿過對方
const sep = await page.evaluate(() => {
    const { rivals, track, car } = window.__racer;
    rivals.spawn(track, 2, 3);
    // 硬塞晒喺同一點，睇吓分得開未
    car.reset(track.startPos, track.startDir);
    for (const rv of rivals.rivals) {
        rv.car.pos.copy(car.pos);
        rv.car.vel.set(0, 0, 0);
    }
    for (let i = 0; i < 60; i++) rivals.update(1 / 60, track, car);
    let minGap = Infinity;
    const all = rivals.rivals.map(rv => rv.car).concat([car]);
    for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
            minGap = Math.min(minGap, Math.hypot(all[i].pos.x - all[j].pos.x, all[i].pos.z - all[j].pos.z));
        }
    }
    return { minGap: +minGap.toFixed(2), playerFinite: Number.isFinite(car.pos.x) };
});
console.log('  ', JSON.stringify(sep));
check('疊晒一齊都會推得開', sep.minGap > 2.2, sep.minGap);
check('推開唔會整爆玩家座標', sep.playerFinite);

// T4b：並排鬥車唔應該被推開——分開用車身框，唔係一個大圓
const sideBySide = await page.evaluate(() => {
    const { rivals, track, car } = window.__racer;
    rivals.spawn(track, 1, 3);
    car.reset(track.startPos, track.startDir);
    const rv = rivals.rivals[0].car;
    const tan = track.curve.getTangentAt(track.startT);
    const sx = -tan.z, sz = tan.x;
    // 擺喺玩家隔籬 2.6 米（兩架車並排合理距離），車頭同向
    rv.reset(car.pos.clone().addScaledVector({ x: sx, y: 0, z: sz }, 2.6), tan);
    rv.vel.set(0, 0, 0);
    const before = Math.hypot(rv.pos.x - car.pos.x, rv.pos.z - car.pos.z);
    for (let i = 0; i < 30; i++) rivals.update(1 / 60, track, car);
    const after = Math.hypot(rv.pos.x - car.pos.x, rv.pos.z - car.pos.z);
    return { before: +before.toFixed(2), after: +after.toFixed(2) };
});
console.log('  ', JSON.stringify(sideBySide));
check('並排 2.6 米唔會被推開', sideBySide.after < sideBySide.before + 0.6, sideBySide);

// T5：名次同設定
const place = await page.evaluate(() => {
    const { rivals, track, setRivals, car } = window.__racer;
    // 企喺 pole 嘅玩家唔可以被報成包尾：對手排喺線前面，取餘數計法會將
    // 佢哋讀成「差少少跑完一圈」。呢項就係守住呢個回歸。
    car.reset(track.startPos, track.startDir);
    rivals.spawn(track, 4, 3);
    const poleFrom = rivals.rivals.map(r => +r.progress.toFixed(3));
    rivals.spawn(track, 2, 3);
    rivals.rivals[0].progress = 1.5;
    rivals.rivals[1].progress = 0.2;
    const out = {
        leading: rivals.playerPlace(2.0),      // 玩家最前
        middle: rivals.playerPlace(1.0),       // 夾喺中間
        last: rivals.playerPlace(0.1),         // 包尾
        rows: rivals.standings(1.0).map(r => r.player),
    };
    out.saved0 = setRivals(0);
    out.savedStore = localStorage.getItem('racer-rivals');
    out.clearedMesh = rivals.mesh.visible;
    out.saved4 = setRivals(4);
    out.poleFrom = poleFrom;
    return out;
});
console.log('  ', JSON.stringify(place));
check('領先 = 第一', place.leading === 1, place.leading);
check('夾中間 = 第二', place.middle === 2, place.middle);
check('包尾 = 第三', place.last === 3, place.last);
check('排名榜有玩家自己一行', place.rows.filter(Boolean).length === 1, place.rows);
check('對手數目設定存得返', place.saved0 === 0 && place.savedStore === '0', place);
// 排喺線前面 ⇒ 進度係細細哋嘅正數，唔係 0.9x
check('起跑格進度唔會誤讀成差少少一圈',
    place.poleFrom.every(p => p > 0 && p < 0.2), place.poleFrom);

// T6：換賽道要清走對手（唔係留低上一條賽道嘅車喺度）
const swap = await page.evaluate(() => {
    const { rivals, track, buildTrack, TRACKS } = window.__racer;
    rivals.spawn(track, 4, 3);
    const before = rivals.count;
    buildTrack(TRACKS[TRACKS.length - 1].id);
    return { before, after: rivals.count, visible: rivals.mesh.visible, meshCount: rivals.mesh.count };
});
console.log('  ', JSON.stringify(swap));
check('換賽道會清走對手', swap.after === 0 && swap.meshCount === 0, swap);
check('冇對手嗰陣唔會畫', swap.visible === false);

checkNoErrors(r.errors);
await r.close();
finish('rivals');
