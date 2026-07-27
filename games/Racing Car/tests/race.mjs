// 漂移賽車核心：三條賽道砌得成兼跑得完、單軌物理行為正確、漂移計分公道。
//
// 最重要嗰兩項：
//   1. 三條賽道嘅自動駕駛都要跑得完三圈——賽道有斷口／彎太急／欄杆太貼就即刻紅
//   2. 手煞真係整到甩尾、反打真係救到車——漂移遊戲冇咗呢兩樣就唔成立

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;

const TRACK_IDS = await page.evaluate(() => window.__racer.TRACKS.map(t => t.id));
check('有三條賽道', TRACK_IDS.length === 3, TRACK_IDS);

// T1：每條賽道都砌得成，起點喺路面，而且賽道唔會自己貼自己
for (const id of TRACK_IDS) {
    const info = await page.evaluate((id) => {
        window.__racer.buildTrack(id);
        const { track, car } = window.__racer;
        return {
            id, cells: track.cells.size, checkpoints: track.checkpoints.length,
            length: Math.round(track.length),
            onRoad: track.isDrivable(car.pos.x, car.pos.z),
            clearance: +track.minSelfClearance().toFixed(1),
        };
    }, id);
    console.log('  ', JSON.stringify(info));
    check(`${id}：賽道砌得成`, info.cells > 5000 && info.checkpoints === 12, info.cells);
    check(`${id}：起點喺路面`, info.onRoad);
    // 檢查點半徑 18，所以唔同段落至少要離開兩倍先唔會誤判
    check(`${id}：唔同段落夠疏（>36）`, info.clearance > 36, info.clearance);
}

// T2：物理行為——手煞會甩尾、反打會救返、落草會慢
//
// (b)(c)(d) 用一塊「無限大柏油地」（PLANE）嚟量，唔用真賽道。原因：打死軚
// 一秒幾就一定會離開 24 米闊嘅路面，之後量到嘅係落草／撞欄嘅懲罰，唔係輪胎
// 模型。手煞同唔用手煞兩組跌出路面嘅時機仲要唔同，比較根本唔公平——第一版
// 就係咁量到「唔用手煞反而甩得大啲」。賽道本身嘅影響由 (a)(e) 同 T4 覆蓋。
const phys = await page.evaluate(async () => {
    const THREE = await import('three');
    window.__racer.buildTrack('coast');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const out = {};

    // 沿住賽道嘅自動轉向：同 T4 嗰個一樣
    const followSteer = () => {
        const t = track.nearestT(car.pos.x, car.pos.z);
        const ahead = track.curve.getPointAt((t + 0.014) % 1);
        const to = new THREE.Vector3(ahead.x - car.pos.x, 0, ahead.z - car.pos.z).normalize();
        const fwd = new THREE.Vector3(Math.sin(car.yaw), 0, Math.cos(car.yaw));
        return Math.max(-1, Math.min(1, (fwd.x * to.z - fwd.z * to.x) * 3));
    };
    // 喺平地上面直線加速到巡航速度（steer 0 ＝ 完全冇滑移角，起點乾淨）
    const straightCruise = (frames, throttle = 1) => {
        for (let i = 0; i < frames; i++) {
            car.update(1 / 60, { throttle, steer: 0, handbrake: false }, PLANE);
        }
    };
    // 打死軚一段時間，回傳期間最大滑移角
    const hardTurn = (frames, handbrake) => {
        let peak = 0;
        for (let i = 0; i < frames; i++) {
            car.update(1 / 60, { throttle: 0.8, steer: 0.85, handbrake }, PLANE);
            peak = Math.max(peak, Math.abs(car.slipAngle));
        }
        return peak;
    };

    // (a) 沿賽道全油門八秒嘅最高速
    car.reset(track.startPos, track.startDir);
    let top = 0;
    for (let i = 0; i < 60 * 8; i++) {
        car.update(1 / 60, { throttle: 1, steer: followSteer(), handbrake: false }, track);
        top = Math.max(top, car.kmh);
    }
    out.topKmh = top;

    // (b) 巡航之後手煞 + 打軚 1.3 秒 → 應該甩到尾
    car.reset(track.startPos, track.startDir);
    straightCruise(300);
    out.cruiseKmh = car.kmh;
    out.handbrakeSlipDeg = +(hardTurn(78, true) * 180 / Math.PI).toFixed(1);
    out.driftFlag = car.drifting;
    out.speedWhileDrift = car.kmh;

    // (c) 反打救車。
    // 唔可以淨係睇「反打完角度有冇跌」——甩到一半嗰陣車身仲有偏航動量，
    // 點打都會再擺多一陣，於是一個啱嘅物理模型都會考肥佬。要問嘅係因果：
    // 由同一個甩尾狀態出發，反打 vs 唔打，邊個收得返？所以呢度影低車嘅
    // 狀態，兩邊各行一次再比較。
    const snap = () => ({
        pos: car.pos.clone(), vel: car.vel.clone(),
        yaw: car.yaw, yawRate: car.yawRate, steer: car.steer,
    });
    const restore = (s) => {
        car.pos.copy(s.pos); car.vel.copy(s.vel);
        car.yaw = s.yaw; car.yawRate = s.yawRate; car.steer = s.steer;
    };
    // 甩到啱啱過 22° 就影相：再遲啲（例如死拉手煞 1 秒）偏航動量已經大到
    // 點打都會盪到 90°，測唔到軚嘅作用——現實入面都係「早收早著」。
    car.reset(track.startPos, track.startDir);
    straightCruise(300);
    while (Math.abs(car.slipAngle) < 0.38) {
        car.update(1 / 60, { throttle: 0.8, steer: 0.85, handbrake: true }, PLANE);
    }
    const mid = snap();
    const slipBefore = Math.abs(car.slipAngle);
    const counter = -Math.sign(car.slipAngle);
    // 兩邊都用同一個油門，淨係軚唔同——咁先係「反打有冇用」嘅乾淨對照。
    // （順帶一提：實測收晒油反而救唔返，車繼續轉——即係真車嗰種 lift-off
    //  oversteer。呢個係啱嘅行為，所以救車測試一定要維持住油門。）
    // 除咗滑移角，仲要量「車身總共轉咗幾多度」。淨係睇滑移角會誤導：
    // 繼續向彎內扭都會令滑移角變細——因為車頭追上咗行進方向，但代價係成架車
    // 轉多咗大半個圈（即係打緊圈）。反打嘅價值喺於「唔使轉咁多就穩返」。
    const settle = (steer, throttle = 0.55) => {
        const yaw0 = car.yaw;
        for (let i = 0; i < 150; i++) {
            car.update(1 / 60, { throttle, steer, handbrake: false }, PLANE);
        }
        return {
            spin: Math.round(Math.abs(car.yaw - yaw0) * 180 / Math.PI),
            end: +(Math.abs(car.slipAngle) * 180 / Math.PI).toFixed(1),
        };
    };
    out.slipBeforeDeg = +(slipBefore * 180 / Math.PI).toFixed(1);
    const counterRun = settle(counter);
    restore(mid);
    const inwardRun = settle(-counter * 0.85);             // 繼續向彎內扭：應該轉多好多
    restore(mid);
    const liftRun = settle(counter, 0);                    // 反打但收晒油（記錄用）
    out.slipAfterCounterDeg = counterRun.end;
    out.counterSpinDeg = counterRun.spin;
    out.inwardSpinDeg = inwardRun.spin;
    out.slipAfterLiftDeg = liftRun.end;

    // (d) 同樣速度、同樣打軚，但唔用手煞：後輪抓得住，角度要明顯細啲
    car.reset(track.startPos, track.startDir);
    straightCruise(300);
    out.gripSlipDeg = +(hardTurn(78, false) * 180 / Math.PI).toFixed(1);

    // (e) 落草極速
    car.reset(track.startPos, track.startDir);
    const grass = (() => { for (const [k, v] of track.cells) if (v === 'grass') return k.split(',').map(Number); })();
    car.pos.set(grass[0], 0, grass[1]);
    let grassTop = 0;
    for (let i = 0; i < 60 * 5; i++) {
        car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, track);
        if (car.offroad) grassTop = Math.max(grassTop, car.kmh);
    }
    out.grassKmh = grassTop;
    return out;
});
console.log('  ', JSON.stringify(phys));
check('沿賽道加到高速（>120 km/h）', phys.topKmh > 120, phys.topKmh);
check('手煞打軚會甩尾（>20°）', phys.handbrakeSlipDeg > 20, phys.handbrakeSlipDeg);
check('甩尾期間仲有速度', phys.speedWhileDrift > 25, phys.speedWhileDrift);
check('甩尾期間有 drifting 旗標', phys.driftFlag === true);
check('反打救得返（角度跌落 20° 以下）',
    phys.slipAfterCounterDeg < 20, phys);
check('反打好過繼續扭入彎（唔使轉咁多就穩返）',
    phys.counterSpinDeg < phys.inwardSpinDeg - 20, phys);
check('唔用手煞明顯冇咁大角度', phys.gripSlipDeg < phys.handbrakeSlipDeg * 0.75,
    { grip: phys.gripSlipDeg, handbrake: phys.handbrakeSlipDeg });
check('落草極速明顯低過路面', phys.grassKmh < phys.topKmh * 0.6, phys.grassKmh);

// T2b：轉向方向同畫面一致——撳右轉就要向畫面右邊走。
// 呢個 bug 出現過兩次（一次係車模掉轉、一次係物理側向軸符號），
// 兩次都係玩家先發現。用鏡頭嘅右向量做基準，冇得靠感覺拗。
const steerDir = await page.evaluate(async () => {
    const THREE = await import('three');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const run = (steer) => {
        car.reset(track.startPos, track.startDir);
        const start = car.pos.clone();
        for (let i = 0; i < 90; i++) car.update(1 / 60, { throttle: 0.9, steer, handbrake: false }, PLANE);
        return car.pos.clone().sub(start);
    };
    // 「畫面右」＝ 鏡頭嘅 +x 軸。唔可以直接讀場景嗰個 camera：佢喺邊完全睇
    // 主迴圈上一幀跟到邊，測試度度都唔同。改為照 main.js updateCamera 嘅規則
    // （車後 dist 遠、望車頭前面）擺一部臨時鏡頭，再交畀 three.js 嘅 lookAt
    // 算基底——符號由 three.js 定，唔係我哋自己推。
    const fwd = new THREE.Vector3(track.startDir.x, 0, track.startDir.z).normalize();
    const probe = new THREE.PerspectiveCamera(62, 1, 0.5, 600);
    probe.position.copy(track.startPos).addScaledVector(fwd, -13).setY(9);
    probe.lookAt(track.startPos.clone().addScaledVector(fwd, 22).setY(0.6));
    probe.updateMatrixWorld();
    const camRight = new THREE.Vector3().setFromMatrixColumn(probe.matrixWorld, 0).setY(0).normalize();
    const right = run(1), left = run(-1);
    return {
        rightDot: +right.clone().normalize().dot(camRight).toFixed(3),
        leftDot: +left.clone().normalize().dot(camRight).toFixed(3),
    };
});
console.log('  ', JSON.stringify(steerDir));
check('撳右轉會向畫面右邊走', steerDir.rightDot > 0.1, steerDir);
check('撳左轉會向畫面左邊走', steerDir.leftDot < -0.1, steerDir);

// T3：漂移計分——甩尾先有分、撞欄會報銷、倍率跟連續時間升
// 同 T2 一樣揸喺平地上面：計分規則唔關賽道形狀事，但如果車撞到欄，
// pending 就會被「撞欄報銷」規則清走，之後量到嘅數字全部係假嘅。
const score = await page.evaluate(async () => {
    const { Race } = await import('./src/race.js');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const race = new Race(track, { laps: 3, trackId: 'test-scoring' });
    race.state = 'racing';
    const out = {};

    const drive = (frames, input) => {
        for (let i = 0; i < frames; i++) {
            car.update(1 / 60, input, PLANE);
            race.update(1 / 60, car);
        }
    };

    // 直線全油門（零滑移角）：唔應該有分
    car.reset(track.startPos, track.startDir);
    drive(180, { throttle: 1, steer: 0, handbrake: false });
    out.straightScore = race.driftScore + Math.round(race.pending);

    // 甩尾：應該累積 pending。要甩夠 1.6 秒先升一級倍率，所以行 150 幀（2.5 秒）
    drive(150, { throttle: 0.8, steer: 0.8, handbrake: true });
    out.pendingWhileDrifting = Math.round(race.pending);
    out.comboWhileDrifting = race.combo;
    out.driftTime = +race.driftTime.toFixed(2);
    // 放軚擺返正，等過咗 0.55 秒結算寬限
    drive(150, { throttle: 0.2, steer: 0, handbrake: false });
    out.slipAfterSettleDeg = +(Math.abs(car.slipAngle) * 180 / Math.PI).toFixed(1);
    out.bankedScore = race.driftScore;
    out.pendingAfterBank = Math.round(race.pending);
    out.comboAfterBank = race.combo;

    // 撞欄報銷：再甩一段，然後人手觸發 wallHit
    drive(90, { throttle: 0.8, steer: 0.8, handbrake: true });
    const pendingBeforeCrash = Math.round(race.pending);
    car.wallHit = true;
    race.update(1 / 60, car);
    out.pendingBeforeCrash = pendingBeforeCrash;
    out.pendingAfterCrash = Math.round(race.pending);
    out.scoreKeptAfterCrash = race.driftScore;
    return out;
});
console.log('  ', JSON.stringify(score));
check('直線行唔會有漂移分', score.straightScore === 0, score.straightScore);
check('甩尾期間累積緊分', score.pendingWhileDrifting > 0, score.pendingWhileDrifting);
check('連續甩尾會升倍率', score.comboWhileDrifting > 1, score.comboWhileDrifting);
check('甩完會入袋', score.bankedScore > 0 && score.pendingAfterBank === 0, score);
check('入袋後倍率重設', score.comboAfterBank === 1);
check('撞欄報銷未入袋嗰筆', score.pendingBeforeCrash > 0 && score.pendingAfterCrash === 0, score);
check('已入袋嘅分唔會被撞走', score.scoreKeptAfterCrash === score.bankedScore, score);

// T4：三條賽道都要跑得完三圈（自動駕駛）
//
// 個測試車手係 pure-pursuit（望前追線）＋ 曲率限速：睇住前面 90 米嘅彎位半徑
// 計出而家最多行幾快，再連埋煞車距離收油。舊嗰個「夾角大就收油、cross×3 打軚」
// 太粗糙——物理改到有真滑移角之後，佢會喺彎中扭死方向盤扭到打圈，量到嘅係
// 佢自己揸得差，唔係賽道或者物理有問題。
for (const id of TRACK_IDS) {
    const lap = await page.evaluate(async (id) => {
        const THREE = await import('three');
        window.__racer.buildTrack(id);
        const { car, track, race } = window.__racer;

        const P = new THREE.Vector3(), Q = new THREE.Vector3(), R = new THREE.Vector3();
        // 三點定圓：估中線喺 t 附近嘅曲率半徑
        const radiusAt = (t) => {
            P.copy(track.curve.getPointAt((t + 1 - 0.012) % 1));
            Q.copy(track.curve.getPointAt(t % 1));
            R.copy(track.curve.getPointAt((t + 0.012) % 1));
            const a = P.distanceTo(Q), b = Q.distanceTo(R), c = P.distanceTo(R);
            const area = Math.abs((Q.x - P.x) * (R.z - P.z) - (R.x - P.x) * (Q.z - P.z)) / 2;
            return area < 1e-4 ? 1e4 : (a * b * c) / (4 * area);
        };
        const drive = () => {
            const t = track.nearestT(car.pos.x, car.pos.z);
            const speed = car.speed;
            const aim = track.curve.getPointAt((t + (8 + speed * 0.55) / track.length) % 1);
            const to = new THREE.Vector3(aim.x - car.pos.x, 0, aim.z - car.pos.z).normalize();
            const fwd = new THREE.Vector3(Math.sin(car.yaw), 0, Math.cos(car.yaw));
            let vMax = 70;
            for (let d = 0; d <= 90; d += 6) {
                const vc = Math.sqrt(6.2 * radiusAt((t + d / track.length) % 1));   // 肯食 0.63g
                vMax = Math.min(vMax, Math.sqrt(vc * vc + 2 * 9 * d));              // 加返煞車距離
            }
            const angErr = Math.atan2(fwd.x * to.z - fwd.z * to.x, fwd.dot(to));
            return {
                throttle: Math.max(-1, Math.min(1, (vMax - speed) * 0.35)),
                // 追線之餘要反打：甩緊尾就唔可以再死扭軚，否則一定打圈
                steer: Math.max(-1, Math.min(1, angErr * 1.7 - car.slipAngle * 0.9)),
                handbrake: false,
            };
        };

        car.reset(track.startPos, track.startDir);
        race.reset(); race.state = 'racing';
        let offroad = 0, wall = 0, rescues = 0;
        const onEvent = race.onEvent;
        race.onEvent = (kind, data) => { if (kind === 'rescue') rescues++; onEvent?.(kind, data); };
        const total = 60 * 240;
        for (let i = 0; i < total && race.state === 'racing'; i++) {
            car.update(1 / 60, drive(), track);
            race.update(1 / 60, car);
            if (car.offroad) offroad++;
            if (car.wallHit) wall++;
        }
        race.onEvent = onEvent;
        return {
            id, laps: race.lap, state: race.state,
            lapTimes: race.lapTimes.map(t => +t.toFixed(1)),
            offroadPct: +(offroad / total * 100).toFixed(1), wallHits: wall, rescues,
            drift: race.driftScore,
        };
    }, id);
    console.log('  ', JSON.stringify(lap));
    check(`${id}：自動駕駛完成三圈`, lap.state === 'finished' && lap.laps === 3, lap);
    check(`${id}：主要留喺路面（<20%）`, lap.offroadPct < 20, lap.offroadPct);
    check(`${id}：唔會長期撞欄`, lap.wallHits < 120, lap.wallHits);
    check(`${id}：唔使拖車`, lap.rescues === 0, lap.rescues);
}

// T4b：車頭頂正欄杆唔可以永遠釘死——踩住油卡夠 3 秒就要拖返賽道。
// 舊嘅撞欄處理係逐條軸 next.x = pos.x，連沿住欄滑行都殺埋，自動駕駛實測
// 撞完之後 v=0 一路到收場；呢項就係守住呢個回歸。
const rescue = await page.evaluate(async () => {
    window.__racer.buildTrack('turbo');
    const { car, track, race } = window.__racer;
    race.reset(); race.state = 'racing';
    let fired = 0;
    const onEvent = race.onEvent;
    race.onEvent = (kind, data) => { if (kind === 'rescue') fired++; onEvent?.(kind, data); };

    // 搵一格欄杆，將車擺喺欄杆隔籬再踩實油頂住佢
    const wallCell = (() => { for (const [k, v] of track.cells) if (v === 'wall') return k.split(',').map(Number); })();
    car.reset(track.startPos, track.startDir);
    car.pos.set(wallCell[0] - 2, 0, wallCell[1]);
    car.yaw = Math.PI / 2;                       // 車頭向 +x，即係頂住欄
    const out = { wallCell };
    for (let i = 0; i < 60 * 6; i++) {
        car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, track);
        race.update(1 / 60, car);
        if (i === 120) out.kmhWhileStuck = car.kmh;
    }
    race.onEvent = onEvent;
    out.rescues = fired;
    out.onRoadAfter = track.isDrivable(car.pos.x, car.pos.z);
    return out;
});
console.log('  ', JSON.stringify(rescue));
check('頂住欄真係郁唔到', rescue.kmhWhileStuck < 12, rescue.kmhWhileStuck);
check('卡死 3 秒會拖返賽道', rescue.rescues >= 1, rescue.rescues);
check('拖完企返喺路面', rescue.onRoadAfter === true);

// T5：換賽道唔會漏 GPU 資源（每換一次都會 dispose 舊方塊世界）
const leak = [];
for (let i = 0; i < 4; i++) {
    const id = TRACK_IDS[i % TRACK_IDS.length];
    await page.evaluate((id) => window.__racer.buildTrack(id), id);
    await page.waitForTimeout(150);
    leak.push(await page.evaluate((round) => {
        const m = window.__racer.renderer.info.memory;
        return { round, geometries: m.geometries, textures: m.textures };
    }, i + 1));
}
for (const row of leak) console.log('  ', JSON.stringify(row));
check('換賽道四次 geometries 持平', new Set(leak.map(x => x.geometries)).size === 1, leak.map(x => x.geometries));
check('換賽道四次 textures 持平', new Set(leak.map(x => x.textures)).size === 1, leak.map(x => x.textures));

checkNoErrors(r.errors);
await r.close();
finish('race');
