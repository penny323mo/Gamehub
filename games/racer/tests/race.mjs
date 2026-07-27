// 賽車核心：賽道砌得成、車揸得郁、三圈計得啱、GPU 資源唔漏。
//
// 最重要嗰項係「自動駕駛跑得完三圈」——賽道有斷口、彎太急、欄杆太貼，
// 呢個測試都會即刻紅。改賽道形狀之後一定要重跑。

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;

// T1：世界砌得成，車企喺起跑線上面
const world = await page.evaluate(() => {
    const { track, car } = window.__racer;
    return {
        cells: track.cells.size,
        checkpoints: track.checkpoints.length,
        onRoad: track.isDrivable(car.pos.x, car.pos.z),
        startOnStartLine: track.cellAtWorld(car.pos.x, car.pos.z),
        curveLength: Math.round(track.length),
    };
});
console.log('  ', JSON.stringify(world));
check('賽道有砌到方塊', world.cells > 2000, world.cells);
check('有 12 個檢查點', world.checkpoints === 12, world.checkpoints);
check('開波位置喺路面上', world.onRoad, world.startOnStartLine);
check('賽道長度合理（500-1500）', world.curveLength > 500 && world.curveLength < 1500, world.curveLength);

// T2：物理——踩油會加速，落草會慢，撞欄唔會穿過去
const phys = await page.evaluate(async () => {
    const { car, track } = window.__racer;
    car.reset(track.startPos, track.startDir);
    for (let i = 0; i < 90; i++) car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, track);
    const afterGas = car.kmh;
    for (let i = 0; i < 90; i++) car.update(1 / 60, { throttle: -1, steer: 0, handbrake: false }, track);
    const afterBrake = car.kmh;

    // 落草：極速應該低過路面
    car.reset(track.startPos, track.startDir);
    const offroadSpot = (() => {
        for (const [k, kind] of track.cells) if (kind === 'grass') return k.split(',').map(Number);
        return null;
    })();
    car.pos.set(offroadSpot[0] * 2, 0, offroadSpot[1] * 2);
    for (let i = 0; i < 60 * 6; i++) car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, track);
    const grassTop = car.kmh;
    const wasOffroad = car.offroad;
    return { afterGas, afterBrake, grassTop, wasOffroad };
});
console.log('  ', JSON.stringify(phys));
check('踩油會加速', phys.afterGas > 60, phys.afterGas);
check('煞車會慢返', phys.afterBrake < phys.afterGas, phys);
check('落草會被拖慢', phys.grassTop < phys.afterGas * 0.7, phys);

// T3：自動駕駛跑得完三圈——賽道通唔通嘅真閘
const lap = await page.evaluate(async () => {
    const THREE = await import('three');
    const { car, track, race } = window.__racer;
    car.reset(track.startPos, track.startDir);
    race.reset();
    race.state = 'racing';
    let offroadFrames = 0, wallFrames = 0, maxKmh = 0;
    const total = 60 * 200;
    for (let i = 0; i < total && race.state === 'racing'; i++) {
        // 望前少少，轉向對準；夾角大就收油——最原始嘅賽車線
        const t = track.nearestT(car.pos.x, car.pos.z);
        const ahead = track.curve.getPointAt((t + 0.012) % 1);
        const to = new THREE.Vector3(ahead.x - car.pos.x, 0, ahead.z - car.pos.z).normalize();
        const fwd = new THREE.Vector3(Math.sin(car.heading), 0, Math.cos(car.heading));
        const cross = fwd.x * to.z - fwd.z * to.x;
        const dot = fwd.dot(to);
        car.update(1 / 60, {
            throttle: dot > 0.94 ? 1 : (dot > 0.8 ? 0.55 : -0.2),
            steer: Math.max(-1, Math.min(1, -cross * 2.5)),
            handbrake: false,
        }, track);
        race.update(1 / 60, car);
        if (car.offroad) offroadFrames++;
        if (track.isWall(car.pos.x, car.pos.z)) wallFrames++;
        maxKmh = Math.max(maxKmh, car.kmh);
    }
    return {
        laps: race.lap, state: race.state, lapTimes: race.lapTimes.map(t => +t.toFixed(1)),
        offroadPct: +(offroadFrames / total * 100).toFixed(1), wallFrames, maxKmh,
    };
});
console.log('  ', JSON.stringify(lap));
check('自動駕駛完成三圈', lap.state === 'finished' && lap.laps === 3, lap.laps);
check('每圈都有計時', lap.lapTimes.length === 3, lap.lapTimes);
check('全程唔會卡入欄杆', lap.wallFrames === 0, lap.wallFrames);
check('大部分時間喺路面（落草 <15%）', lap.offroadPct < 15, lap.offroadPct);

// T4：三圈就係三圈——開波唔可以偷咗一圈（曾經有呢個 bug）
const laps = await page.evaluate(async () => {
    const { Race } = await import('./src/race.js');
    const { track } = window.__racer;
    const race = new Race(track, { laps: 3 });
    return { startLap: race.lap, startNextCp: race.nextCp, total: race.totalLaps };
});
check('開波係第 0 圈、下一個檢查點係 1', laps.startLap === 0 && laps.startNextCp === 1, laps);

// T5：重開一場唔會漏 GPU 資源
const leak = [];
for (let i = 1; i <= 3; i++) {
    // 直接叫 startRace()，唔撳 DOM 掣：跑完一場之後結算畫面會蓋住開始掣，
    // 撳掣版本會 timeout（試過），而且我哋要測嘅係資源，唔係按鈕
    await page.evaluate(() => window.__racer.startRace());
    await page.evaluate(() => {
        const { car, track, race } = window.__racer;
        race.state = 'racing';
        for (let f = 0; f < 60 * 20; f++) {
            car.update(1 / 60, { throttle: 1, steer: Math.sin(f / 90) * 0.6, handbrake: false }, track);
            race.update(1 / 60, car);
        }
    });
    await page.evaluate(() => window.__racer.restart());
    await page.waitForTimeout(200);
    leak.push(await page.evaluate((round) => {
        const m = window.__racer.renderer.info.memory;
        return { round, geometries: m.geometries, textures: m.textures };
    }, i));
}
for (const row of leak) console.log('  ', JSON.stringify(row));
check('重開三次 geometries 持平', new Set(leak.map(x => x.geometries)).size === 1, leak.map(x => x.geometries));
check('重開三次 textures 持平', new Set(leak.map(x => x.textures)).size === 1, leak.map(x => x.textures));

checkNoErrors(r.errors);
await r.close();
finish('race');
