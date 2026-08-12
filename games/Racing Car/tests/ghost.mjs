// 幽靈車：錄得低、只留最快、重播對得準、差距報得啱、關咗就唔畫。

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;

// T1：錄影——每 0.1 秒一格，只保留夠快嗰圈
const rec = await page.evaluate(async () => {
    const { GhostRecorder, loadGhost, clearGhost } = await import('./src/ghost.js');
    const { car, track } = window.__racer;
    clearGhost('unit-test');
    const g = new GhostRecorder();
    car.reset(track.startPos, track.startDir);
    const run = (frames, prog0) => {
        for (let i = 0; i < frames; i++) {
            car.pos.x += 0.5;
            g.sample(1 / 60, car, prog0 + i / frames * 0.9);
        }
    };
    run(600, 0);                                  // 10 秒
    const sampled = g.samples.length / 4;
    const first = g.commit('unit-test', 42.0, null);        // 冇舊紀錄 ⇒ 一定存
    const savedFirst = loadGhost('unit-test');

    run(600, 0);
    const slower = g.commit('unit-test', 55.0, 42.0);       // 慢過舊嘅 ⇒ 唔好覆蓋
    const afterSlow = loadGhost('unit-test');

    run(600, 0);
    const faster = g.commit('unit-test', 38.5, 42.0);       // 快過 ⇒ 覆蓋
    const afterFast = loadGhost('unit-test');

    clearGhost('unit-test');
    return {
        sampled, first, slower, faster,
        savedTime: savedFirst?.t, afterSlowTime: afterSlow?.t, afterFastTime: afterFast?.t,
        clearedAfter: loadGhost('unit-test'),
        emptyCommit: new GhostRecorder().commit('unit-test', 10, null),
    };
});
console.log('  ', JSON.stringify(rec));
check('10 秒錄到約 100 格', rec.sampled >= 98 && rec.sampled <= 101, rec.sampled);
check('第一圈一定會存', rec.first === true && rec.savedTime === 42, rec);
check('慢過紀錄唔會覆蓋', rec.slower === false && rec.afterSlowTime === 42, rec);
check('快過紀錄會覆蓋', rec.faster === true && rec.afterFastTime === 38.5, rec);
check('清除之後真係冇咗', rec.clearedAfter === null);
check('冇料到唔會存空幽靈', rec.emptyCommit === false);

// T2：重播——插值準、角度行最短路、超出範圍夾住
const play = await page.evaluate(async () => {
    const { GhostPlayer, saveGhost, clearGhost, shortestAngle } = await import('./src/ghost.js');
    // 一條直線：每 0.1 秒行 1 米，yaw 由 3.0 過 -3.0（即係應該行 +0.28 而唔係 -6）
    const s = [];
    for (let i = 0; i < 20; i++) s.push(i, 0, i < 10 ? 3.0 : -3.0, i / 19);
    saveGhost('unit-play', 1.9, s);
    const p = new GhostPlayer();
    const loaded = p.load('unit-play');
    const out = {
        loaded, count: p.count,
        mid: p.at(0.55),                       // 第 5.5 格 ⇒ x 應該係 5.5
        beforeStart: p.at(-5),
        afterEnd: p.at(999),
        wrapDeg: +(shortestAngle(3.0, -3.0) * 180 / Math.PI).toFixed(1),
        atHalf: p.timeAtProgress(0.5),
        atZero: p.timeAtProgress(0),
        beyond: p.timeAtProgress(5),
    };
    clearGhost('unit-play');
    const empty = new GhostPlayer();
    out.emptyLoad = empty.load('unit-play');
    out.emptyAt = empty.at(1);
    return out;
});
console.log('  ', JSON.stringify(play));
check('載入到幽靈', play.loaded === true && play.count === 20, play);
check('中間插值啱', Math.abs(play.mid.x - 5.5) < 0.01, play.mid);
check('開頭之前夾返第一格', Math.abs(play.beforeStart.x - 0) < 0.01, play.beforeStart);
check('尾之後夾返最後一格', Math.abs(play.afterEnd.x - 19) < 0.01, play.afterEnd);
check('角度行最短路（唔會反轉一圈）', Math.abs(play.wrapDeg - 16.2) < 1, play.wrapDeg);
check('同一位置嘅時間查得返', play.atHalf > 0.8 && play.atHalf < 1.1, play.atHalf);
check('起點時間係 0', play.atZero === 0, play.atZero);
check('超出幽靈範圍回傳 null', play.beyond === null, play.beyond);
check('冇幽靈嗰陣唔會爆', play.emptyLoad === false && play.emptyAt === null, play);

// T3：入返遊戲——跑一圈會錄低，第二場會見到幽靈車
const live = await page.evaluate(async () => {
    const THREE = await import('three');
    const { clearGhost } = await import('./src/ghost.js');
    const { startRace, race, car, track, trackDef, ghostMesh, ghostPlayer,
        ghostWheelMotion, setRivals, setGhost } = window.__racer;
    clearGhost(trackDef.id);
    setRivals(0);
    setGhost(true);
    localStorage.removeItem(`racer-best-v2:${trackDef.id}`);
    startRace();
    race.countdown = 0; race.state = 'racing';

    const follow = () => {
        const t = track.nearestT(car.pos.x, car.pos.z);
        const a = track.curve.getPointAt((t + 0.02) % 1);
        const to = new THREE.Vector3(a.x - car.pos.x, 0, a.z - car.pos.z).normalize();
        const f = new THREE.Vector3(Math.sin(car.yaw), 0, Math.cos(car.yaw));
        return Math.max(-1, Math.min(1, (f.x * to.z - f.z * to.x) * 2));
    };
    // 用真主迴圈唔得（rAF 太慢），所以行同一段更新序列
    const step = (n) => {
        for (let i = 0; i < n; i++) {
            car.update(1 / 60, { throttle: 1, steer: follow(), handbrake: false }, track);
            race.update(1 / 60, car);
            window.__racer.updateGhostForTest(1 / 60);
        }
    };
    const before = ghostPlayer.available;
    const progress0 = window.__racer.playerProgressForTest();
    // 跑到過咗一圈
    for (let i = 0; i < 60 * 200 && race.lapTimes.length < 1; i++) step(1);
    const recorded = ghostPlayer.available;
    const lap1 = race.lapTimes[0];
    // 第二圈：幽靈車應該出到嚟兼有差距讀數
    step(120);
    const ghostRoot = ghostMesh.getObjectByName('player-ghost-car');
    const playerMesh = car.root.getObjectByProperty('isMesh', true);
    const ghostMeshObject = ghostRoot?.getObjectByProperty('isMesh', true);
    return {
        before, recorded, lap1: lap1 ? +lap1.toFixed(1) : null,
        ghostVisible: ghostMesh.visible,
        ghostModel: ghostMesh.getObjectByName('player-ghost-car')?.name ?? null,
        ghostMeshCount: ghostMesh.getObjectByName('player-ghost-car')
            ?.getObjectsByProperty?.('isMesh', true).length ?? 0,
        ghostTransparent: ghostMesh.getObjectByName('player-ghost-car')
            ?.getObjectsByProperty?.('isMesh', true).every((mesh) => {
                const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                return mats.length > 0 && mats.every((mat) => mat.transparent && mat.opacity < 0.5);
            }) ?? false,
        ghostGeometryIndependent: !!ghostMeshObject?.geometry
            && ghostMeshObject.geometry !== playerMesh?.geometry,
        ghostWheelEnabled: ghostWheelMotion?.enabled === true,
        ghostWheelAngle: ghostWheelMotion?.snapshot?.().angle ?? 0,
        ghostDelta: window.__racer.ghostDelta,
        ghostOnRoad: track.isDrivable(ghostMesh.position.x, ghostMesh.position.z),
        progressMoved: +(window.__racer.playerProgressForTest() - progress0).toFixed(3),
    };
});
console.log('  ', JSON.stringify(live));
check('開波之前冇幽靈', live.before === false);
check('跑完一圈會錄低', live.recorded === true, live);
check('第二圈幽靈車會出現', live.ghostVisible === true, live);
check('幽靈車沿用玩家原車模型', live.ghostModel === 'player-ghost-car' && live.ghostMeshCount > 0, live);
check('幽靈車模型係透明材質', live.ghostTransparent === true, live);
check('幽靈車有自己一份 geometry，輪胎動畫唔會污染玩家車',
    live.ghostGeometryIndependent === true && live.ghostWheelEnabled
    && Math.abs(live.ghostWheelAngle) > 0.01, live);
check('幽靈車企喺賽道上面', live.ghostOnRoad === true, live);
check('有同自己最快圈嘅差距讀數', typeof live.ghostDelta === 'number', live.ghostDelta);
// 進度推進唔可以係 HUD 嘅副作用：一唔畫 HUD 就對唔到時
check('唔畫 HUD 都追蹤到進度', live.progressMoved > 0.02, live.progressMoved);

// T4：關掉幽靈車就唔畫，設定亦都記得住
const off = await page.evaluate(() => {
    const { setGhost, ghostMesh } = window.__racer;
    setGhost(false);
    window.__racer.updateGhostForTest(1 / 60);
    const hidden = !ghostMesh.visible;
    const saved = localStorage.getItem('racer-ghost-on');
    setGhost(true);
    return { hidden, saved, savedBack: localStorage.getItem('racer-ghost-on'), on: window.__racer.ghostOn };
});
console.log('  ', JSON.stringify(off));
check('關咗就唔畫幽靈', off.hidden === true, off);
check('幽靈設定存得返', off.saved === '0' && off.savedBack === '1', off);

const menu = await page.evaluate(() => {
    const root = window.__racer;
    root.setGhost(true);
    root.ghostMesh.visible = true;
    root.toMenu();
    return { hidden: !root.ghostMesh.visible, menu: !document.getElementById('screen-start').classList.contains('hidden') };
});
console.log('  ', JSON.stringify(menu));
check('返選單會收起透明幽靈，唔會殘留喺背景', menu.hidden && menu.menu, menu);

// T5：幽靈車唔可以影響物理——佢淨係一件擺設
const noPhysics = await page.evaluate(() => {
    const { car, track, ghostMesh } = window.__racer;
    const run = (visible) => {
        car.reset(track.startPos, track.startDir);
        // 新山勢會令鬆油車喺落坡有少量自然滾動；比較「有／冇幽靈」
        // 兩次同一個坡度結果，先可以隔離 ghost 是否偷偷推物理。
        ghostMesh.position.set(car.pos.x, 0, car.pos.z);
        ghostMesh.visible = visible;
        const x0 = car.pos.x, z0 = car.pos.z;
        for (let i = 0; i < 60; i++) car.update(1 / 60, { throttle: 0, steer: 0, handbrake: false }, track);
        return Math.hypot(car.pos.x - x0, car.pos.z - z0);
    };
    const withGhost = run(true), withoutGhost = run(false);
    ghostMesh.visible = false;
    return {
        withGhost: +withGhost.toFixed(3),
        withoutGhost: +withoutGhost.toFixed(3),
        difference: +(withGhost - withoutGhost).toFixed(4),
    };
});
console.log('  ', JSON.stringify(noPhysics));
check('幽靈車唔會推到玩家', Math.abs(noPhysics.difference) < 0.001, noPhysics);

// T6：真正最繁忙組合要一齊量。逐樣量會漏咗 night + rivals + 原車幽靈 +
// driving effects 疊埋；透明 GLB 額外 draw 仍要守住手機預算。
const combinedBudget = await page.evaluate(() => {
    const root = window.__racer;
    root.setTod('night');
    root.rivals.spawn(root.track, 4, 3);
    root.ghostMesh.position.copy(root.car.pos);
    root.ghostMesh.rotation.y = root.car.yaw;
    root.ghostMesh.visible = true;
    root.renderer.render(root.scene, root.camera);
    const beforeFx = {
        calls: root.renderer.info.render.calls,
        triangles: root.renderer.info.render.triangles,
        meshCount: root.rivals.mesh.count,
        ghostModel: root.ghostMesh.getObjectByName('player-ghost-car')?.name ?? null,
        ghostModelVisible: root.ghostMesh.getObjectByName('player-ghost-car')?.visible ?? false,
    };
    root.car.vel.set(Math.sin(root.car.yaw) * 24, 0, Math.cos(root.car.yaw) * 24);
    root.car.drifting = true;
    root.car.offroad = false;
    for (let i = 0; i < 42; i++) {
        root.car.pos.addScaledVector(root.car.vel, 1 / 60);
        root.drivingEffects.update(1 / 60, root.car);
    }
    root.renderer.render(root.scene, root.camera);
    const all = {
        calls: root.renderer.info.render.calls,
        triangles: root.renderer.info.render.triangles,
        fx: root.drivingEffects.snapshot(),
    };
    root.rivals.clear();
    root.drivingEffects.reset();
    root.ghostMesh.visible = false;
    root.setTod('day');
    return { beforeFx, all };
});
console.log('  ', JSON.stringify(combinedBudget));
check('四對手保持一個 instanced draw，幽靈另用玩家原車模', combinedBudget.beforeFx.meshCount === 4
    && combinedBudget.beforeFx.ghostModel === 'player-ghost-car'
    && combinedBudget.beforeFx.ghostModelVisible, combinedBudget.beforeFx);
check('幽靈用獨立原車透明 draw，唔污染對手 instance', combinedBudget.beforeFx.calls <= 20,
    combinedBudget.beforeFx.calls);
check('夜景＋四對手＋原車幽靈＋甩尾效果守住 20 calls 內', combinedBudget.all.calls <= 20
    && combinedBudget.all.fx.particles > 0 && combinedBudget.all.fx.marks > 0, combinedBudget.all);
check('最繁忙組合三角形仍低過 120k', combinedBudget.all.triangles < 120000,
    combinedBudget.all.triangles);

checkNoErrors(r.errors);
await r.close();
finish('ghost');
