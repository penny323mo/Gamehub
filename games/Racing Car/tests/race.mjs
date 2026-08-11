// 漂移賽車核心：三條賽道砌得成兼跑得完、單軌物理行為正確、漂移計分公道。
//
// 最重要嗰兩項：
//   1. 三條賽道嘅自動駕駛都要跑得完三圈——賽道有斷口／彎太急／欄杆太貼就即刻紅
//   2. 手煞真係整到甩尾、反打真係救到車——漂移遊戲冇咗呢兩樣就唔成立

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;

const TRACK_IDS = await page.evaluate(() => window.__racer.TRACKS.map(t => t.id));
check('有六條賽道（三正向＋三逆向）', TRACK_IDS.length === 6, TRACK_IDS);

// T0：逆向賽道真係倒轉行——同一段路上嘅行車方向要相反
const rev = await page.evaluate(async () => {
    const THREE = await import('three');
    const { buildTrack } = window.__racer;
    const dirAt = (id, x, z) => {
        buildTrack(id);
        const { track } = window.__racer;
        const t = track.nearestT(x, z);
        const d = track.curve.getTangentAt(t);
        return { x: d.x, z: d.z, start: [track.startPos.x, track.startPos.z], len: track.length };
    };
    const out = {};
    for (const base of ['turbo', 'coast', 'touge']) {
        // 用正向賽道嘅起點做取樣點，兩邊喺同一段路上比較
        buildTrack(base);
        const p = window.__racer.track.startPos;
        const f = dirAt(base, p.x, p.z);
        const b = dirAt(`${base}-rev`, p.x, p.z);
        out[base] = {
            dot: +(f.x * b.x + f.z * b.z).toFixed(3),
            lenDiff: +Math.abs(f.len - b.len).toFixed(1),
        };
    }
    return out;
});
console.log('  ', JSON.stringify(rev));
for (const base of ['turbo', 'coast', 'touge']) {
    check(`${base}-rev：同一段路方向相反`, rev[base].dot < -0.9, rev[base]);
    // 同一串中線倒轉排，長度應該一樣（曲線張力一樣，收尾接返同一個環）
    check(`${base}-rev：賽道長度同正向一致`, rev[base].lenDiff < 2, rev[base]);
}

// T1：每條賽道都砌得成，起點喺路面，而且賽道唔會自己貼自己
for (const id of TRACK_IDS) {
    const info = await page.evaluate((id) => {
        window.__racer.buildTrack(id);
        const { track, car } = window.__racer;
        return {
            id, cells: track.cellCount, checkpoints: track.checkpoints.length,
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

    // 低速扭力提升只應改善起步；量 0–80，之後高速段仍由原本輸出控制。
    car.reset(track.startPos, track.startDir);
    let launchFrames = 0;
    while (car.kmh < 80 && launchFrames < 600) {
        car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, PLANE);
        launchFrames++;
    }
    out.zeroTo80 = +(launchFrames / 60).toFixed(2);

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
    const settle = (steer, throttle = 0.55, assist = false, frames = 150) => {
        const yaw0 = car.yaw;
        for (let i = 0; i < frames; i++) {
            car.update(1 / 60, { throttle, steer, handbrake: false, assist }, PLANE);
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
    restore(mid);
    const assistedRun = settle(0, 0.55, true, 60);         // 玩家唔識反打，由爽快輔助救車
    restore(mid);
    const unassistedRun = settle(0, 0.55, false, 60);
    out.slipAfterCounterDeg = counterRun.end;
    out.counterSpinDeg = counterRun.spin;
    out.inwardSpinDeg = inwardRun.spin;
    out.slipAfterLiftDeg = liftRun.end;
    out.assistedNeutralSlipDeg = assistedRun.end;
    out.assistedNeutralSpinDeg = assistedRun.spin;
    out.unassistedNeutralSlipDeg = unassistedRun.end;
    out.unassistedNeutralSpinDeg = unassistedRun.spin;

    // (d) 同樣速度、同樣打軚，但唔用手煞：後輪抓得住，角度要明顯細啲
    car.reset(track.startPos, track.startDir);
    straightCruise(300);
    out.gripSlipDeg = +(hardTurn(78, false) * 180 / Math.PI).toFixed(1);

    // (e) 落草極速
    car.reset(track.startPos, track.startDir);
    const grass = track.findCell('grass');
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
check('低速加速更爽快（0–80 km/h 介乎 2.3–2.85 秒）',
    phys.zeroTo80 > 2.3 && phys.zeroTo80 < 2.85, phys.zeroTo80);
check('手煞打軚會甩尾（>20°）', phys.handbrakeSlipDeg > 20, phys.handbrakeSlipDeg);
check('甩尾期間仲有速度', phys.speedWhileDrift > 25, phys.speedWhileDrift);
check('甩尾期間有 drifting 旗標', phys.driftFlag === true);
check('反打救得返（角度跌落 20° 以下）',
    phys.slipAfterCounterDeg < 20, phys);
check('反打好過繼續扭入彎（至少少轉 20° 就穩返）',
    phys.counterSpinDeg <= phys.inwardSpinDeg - 20, phys);
check('爽快輔助可代玩家穩住車尾（首秒中性軚少轉至少 2°）',
    phys.assistedNeutralSpinDeg <= phys.unassistedNeutralSpinDeg - 2, phys);
check('爽快輔助首秒滑移角細過無輔助',
    phys.assistedNeutralSlipDeg < phys.unassistedNeutralSlipDeg, phys);
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

    // 撞欄報銷：先加返速（結算段收咗油，車已經好慢，慢過 7 m/s 就唔算甩尾），
    // 再甩一段，然後人手觸發 wallHit
    drive(150, { throttle: 1, steer: 0, handbrake: false });
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

        // 用返出街嗰個車手（src/driver.js），唔好喺測試度養第二份。
        // 之前呢度有一份一模一樣嘅 copy：改咗 driver.js 嘅曲率取樣窗口之後
        // 個 gate 完全冇反應，因為佢量緊嘅係一個已經冇人用嘅控制器。
        const { createDriver, SKILLS } = await import('./src/driver.js');
        const driver = createDriver(track, SKILLS.quick);
        const drive = () => driver.read(car, track.nearestT(car.pos.x, car.pos.z));

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
    // 拖車 = 完全揸失手。之前容許過兩次，其實係遮住咗車手自己嘅 bug
    // （落草之後收油收到爬唔返出嚟）。改好之後三條賽道都係零，所以收返緊。
    check(`${id}：唔使拖車`, lap.rescues === 0, lap.rescues);
}

// T3a：制動物理。Penny 實機報告「直線冇轉向都會打橫」——根源係制動力
// 全部記帳落後軸嘅摩擦圓，而前軸嘅側向抓地一分錢都冇扣，加上載荷轉移
// 誇張到後軸負荷跌到 476 N（等於後輪離地）。呢度守住修好之後嘅因果。
const braking = await page.evaluate(async () => {
    const THREE = await import('three');
    window.__racer.buildTrack('coast');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const cruise = (abs) => {
        car.reset(track.startPos, track.startDir);
        car.abs = abs; car.arcadeAssist = true;
        for (let i = 0; i < 300; i++) car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, PLANE);
    };
    const out = {};

    // 直線煞停：減速度要似真車（唔可以係 1.8 g 咁誇張），車頭唔可以自己轉
    cruise(true);
    const v0 = car.speed, yaw0 = car.yaw;
    let n = 0, peak = 0;
    while (car.speed > 3 && n < 900) {
        car.update(1 / 60, { throttle: -1, steer: 0, handbrake: false }, PLANE);
        peak = Math.max(peak, Math.abs(car.slipAngle)); n++;
    }
    out.straight = {
        decelG: +((v0 - car.speed) / (n / 60) / 9.81).toFixed(2),
        yaw: +((car.yaw - yaw0) * 57.3).toFixed(1), slip: +(peak * 57.3).toFixed(1),
    };

    // 直線煞車 + 側向擾動（好似輾過一個坑）：ABS 開唔可以打橫，關就會
    for (const abs of [true, false]) {
        cruise(abs);
        const f = { x: Math.sin(car.yaw), z: Math.cos(car.yaw) };
        const l = { x: Math.cos(car.yaw), z: -Math.sin(car.yaw) };
        const v = car.speed;
        car.vel.set(f.x * v + l.x * 1.2, 0, f.z * v + l.z * 1.2);
        const y0 = car.yaw;
        let m = 0, pk = 0;
        while (car.speed > 4 && m < 900) {
            car.update(1 / 60, { throttle: -1, steer: 0, handbrake: false }, PLANE);
            pk = Math.max(pk, Math.abs(car.slipAngle)); m++;
        }
        out[abs ? 'bumpAbs' : 'bumpNoAbs'] = {
            slip: +(pk * 57.3).toFixed(1), yaw: +((car.yaw - y0) * 57.3).toFixed(1),
        };
    }

    // 減速入彎：軚愈大，車身角度愈大，但唔可以直接打圈
    out.trail = {};
    for (const st of [0.2, 0.45, 0.8]) {
        cruise(true);
        let k = 0, pk = 0;
        while (car.speed > 8 && k < 900) {
            car.update(1 / 60, { throttle: -1, steer: st, handbrake: false }, PLANE);
            pk = Math.max(pk, Math.abs(car.slipAngle)); k++;
        }
        out.trail[st] = +(pk * 57.3).toFixed(1);
    }
    return out;
});
console.log('  ', JSON.stringify(braking));
check('直線煞停減速度似真車（0.9–1.4 g）',
    braking.straight.decelG > 0.9 && braking.straight.decelG < 1.4, braking.straight.decelG);
check('直線煞車唔會自己轉', Math.abs(braking.straight.yaw) < 1
    && braking.straight.slip < 1, braking.straight);
check('ABS 開：輾過坑再煞車都唔會打橫',
    braking.bumpAbs.slip < 6 && Math.abs(braking.bumpAbs.yaw) < 10, braking.bumpAbs);
check('ABS 關：踩死會鎖死打滑（真實行為，亦係 ABS 嘅價值）',
    braking.bumpNoAbs.slip > 40, braking.bumpNoAbs);
check('減速入彎：輕軚要企得穩', braking.trail[0.2] < 12, braking.trail);
check('減速入彎：軚愈大車身角度愈大（可控漂移）',
    braking.trail[0.45] > braking.trail[0.2] && braking.trail[0.8] > braking.trail[0.45]
    && braking.trail[0.8] < 60, braking.trail);

// T3c：漂移要揸得住。兩件事一齊守：
//   1. 輔助要識讓路——玩家反打緊即係特登甩尾，機器唔應該再搶軚
//   2. 甩尾唔可以係雙穩態——一衝就 78° 再一下彈返 0 嘅話，中間冇平衡點，
//      點揸都維持唔到（輪胎峰值太早就會咁，見 CFG.tyreB 註解）
const driftFeel = await page.evaluate(async () => {
    window.__racer.buildTrack('coast');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const cruise = (assist) => {
        car.reset(track.startPos, track.startDir);
        car.abs = true; car.arcadeAssist = assist;
        for (let i = 0; i < 600 && car.kmh < 120; i++) {
            car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, PLANE);
        }
        for (let i = 0; i < 40; i++) car.update(1 / 60, { throttle: 0.7, steer: 0.8, handbrake: true }, PLANE);
    };
    // 想維持 35° 嘅揸法（瞄準角度，唔係瞄準 0）
    const target = (assist) => {
        cruise(assist);
        let peak = 0, held = 0;
        for (let i = 0; i < 420; i++) {
            const sl = car.slipAngle, err = Math.abs(sl) - 35 / 57.3;
            const counter = Math.max(-1, Math.min(1, -Math.sign(sl) * err * 3.2));
            car.update(1 / 60, { throttle: 0.85, steer: counter, handbrake: false }, PLANE);
            const deg = Math.abs(car.slipAngle) * 57.3;
            peak = Math.max(peak, deg);
            if (deg > 15) held++;
        }
        return { peak: Math.round(peak), heldSec: +(held / 60).toFixed(1), endKmh: Math.round(car.kmh) };
    };
    const withAssist = target(true);
    const raw = target(false);

    // 唔反打（死扭入彎）就一定要救得返
    cruise(true);
    let rescued = -1;
    for (let i = 0; i < 300; i++) {
        car.update(1 / 60, { throttle: 0.5, steer: 0.8, handbrake: false }, PLANE);
        if (rescued < 0 && Math.abs(car.slipAngle) * 57.3 < 12) rescued = i;
    }
    return { withAssist, raw, rescuedSec: rescued < 0 ? null : +(rescued / 60).toFixed(1) };
});
console.log('  ', JSON.stringify(driftFeel));
check('反打緊嘅時候輔助讓路（同純物理差唔多）',
    Math.abs(driftFeel.withAssist.heldSec - driftFeel.raw.heldSec) < 0.6, driftFeel);
check('甩尾唔會失控過衝（35° 起手唔可以衝到 70° 以上）',
    driftFeel.withAssist.peak < 70, driftFeel.withAssist);
check('漂移唔會慢到唔想用（收返速度）',
    driftFeel.withAssist.endKmh > 100, driftFeel.withAssist);
check('唔反打就仍然救得返',
    driftFeel.rescuedSec !== null && driftFeel.rescuedSec < 3, driftFeel);

// T3e：手機上「快撳一下手煞」要真係入到漂移。手煞喺物理上係鎖死後軸
// （縱向食晒摩擦圓、側向近乎冇），唔係淨係將後輪抓地打個折。
const tapDrift = await page.evaluate(async () => {
    window.__racer.buildTrack('coast');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    // 用返簡易模式嘅真實指令流（油門自動、手煞期間 0.72）
    const cmd = (steer, drift) => ({ throttle: drift ? 0.72 : 1, steer, handbrake: drift });
    const tap = (frames) => {
        car.reset(track.startPos, track.startDir);
        car.abs = true; car.arcadeAssist = true;
        for (let i = 0; i < 600 && car.kmh < 115; i++) car.update(1 / 60, cmd(0, false), PLANE);
        for (let i = 0; i < frames; i++) car.update(1 / 60, cmd(0.85, true), PLANE);
        const entry = Math.abs(car.slipAngle) * 57.3;
        let peak = entry, lockedRear = car.lockRear;
        for (let i = 0; i < 240; i++) {
            const sl = car.slipAngle, err = Math.abs(sl) - 35 / 57.3;
            const counter = Math.max(-1, Math.min(1, -Math.sign(sl) * err * 3.2));
            car.update(1 / 60, cmd(counter, false), PLANE);
            peak = Math.max(peak, Math.abs(car.slipAngle) * 57.3);
        }
        return { entry: Math.round(entry), peak: Math.round(peak), lockedRear };
    };
    return { half: tap(30), long: tap(40) };
});
console.log('  ', JSON.stringify(tapDrift));
check('手煞真係鎖死後軸', tapDrift.half.lockedRear === true, tapDrift.half);
check('半秒手煞入到漂移（>18°）', tapDrift.half.entry > 18, tapDrift.half);
check('但唔會一撳就打圈', tapDrift.half.peak < 60 && tapDrift.long.peak < 80, tapDrift);

// T3b1：打完圈要救得返。AI 有救車狀態機（ADR-065），玩家一直冇——實測車頭
// 指錯 150° 又差不多停定，一個簡易模式玩家（自動油門、只識打軚）25 秒都
// 扭唔返，最後倒住沿賽道行，落草 641 幀。即係一次失誤就一場完。
const unspin = await page.evaluate(async () => {
    const { CFG } = await import('./src/car.js');
    const { car, track } = window.__racer;
    const D = 57.2958;
    const t = track.startT;
    const p = track.curve.getPointAt(t);
    const tan = track.curve.getTangentAt(t);
    const errNow = () => {
        const fx = Math.sin(car.yaw), fz = Math.cos(car.yaw);
        return Math.abs(Math.atan2(fx * tan.z - fz * tan.x, fx * tan.x + fz * tan.z)) * D;
    };
    // 打橫 150°、差不多停定，冇任何輸入：睇吓幾時扭返 25° 以內
    const spun = (deg) => {
        car.reset(p, tan);
        car.arcadeAssist = true;
        car.yaw = Math.atan2(tan.x, tan.z) + deg / D;
        car.vel.set(0, 0, 0);
        for (let i = 1; i <= 60 * 6; i++) {
            car.unspin(tan.x, tan.z, 1 / 60);
            if (errNow() <= 25) return +(i / 60).toFixed(2);
        }
        return null;
    };
    // 正常揸車唔可以踩中：夠快就唔幫
    car.reset(p, tan);
    car.arcadeAssist = true;
    car.yaw = Math.atan2(tan.x, tan.z) + 150 / D;
    car.vel.set(Math.sin(car.yaw) * 20, 0, Math.cos(car.yaw) * 20);
    const fastNoHelp = car.unspin(tan.x, tan.z, 1 / 60);
    // 慢速但只係細角度（例如泊車調位）都唔應該幫
    car.reset(p, tan);
    car.yaw = Math.atan2(tan.x, tan.z) + 40 / D;
    car.vel.set(0, 0, 0);
    const smallNoHelp = car.unspin(tan.x, tan.z, 1 / 60);
    return { s150: spun(150), s90: spun(90), fastNoHelp, smallNoHelp, exit: CFG.unspinExit * D };
});
console.log('  ', JSON.stringify(unspin));
check('打橫 150° 兩秒內扭返啱方向', unspin.s150 !== null && unspin.s150 <= 2, unspin);
check('打橫 90° 一秒半內扭返', unspin.s90 !== null && unspin.s90 <= 1.5, unspin);
check('夠快就唔幫（正常揸車踩唔中）', unspin.fastNoHelp === false, unspin);
check('細角度都唔幫（泊車調位唔會被搶軚）', unspin.smallNoHelp === false, unspin);

// T3b2：擦一下欄唔可以等於報廢。舊寫法（成個速度每幀 ×0.86、固定反彈、
// 唔矯正車頭）：10° 淺角度擦牆由 108 km/h 跌到 0，三秒後仲係 1 km/h，
// 反而 25° 撞埋去仲剩 42 km/h——即係輕輕掂一下比撞真啲慘。玩家冇 AI
// 嗰個救車狀態機，所以呢個係「一掂欄就冇得玩」。
const wallGraze = await page.evaluate(async () => {
    const { CFG } = await import('./src/car.js');
    const { car, track } = window.__racer;
    const D = 57.2958;
    const scrape = (deg) => {
        car.reset(track.startPos, track.startDir);
        car.arcadeAssist = true;
        // 牆嘅位置要喺跑之前定死，唔可以跟住 car.pos 走（否則永遠掂唔到）
        const wallX = car.pos.x + 8;
        const wall = { isDrivable: () => true, isWall: (x) => x >= wallX };
        const d = track.startDir;
        car.yaw = Math.atan2(d.x, d.z) - deg / D;
        car.vel.x = Math.sin(car.yaw) * 30;
        car.vel.z = Math.cos(car.yaw) * 30;
        let minKmh = 999, hits = 0;
        for (let i = 0; i < 180; i++) {
            car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, wall);
            if (car.wallHit) hits++;
            minKmh = Math.min(minKmh, car.kmh);
        }
        return { minKmh, hits, after: car.kmh };
    };
    const shallow = scrape(10);
    const mid = scrape(25);
    const align = CFG.wallAlign, scr = CFG.wallScrape;
    CFG.wallAlign = 0; CFG.wallScrape = 0.86;
    const oldWay = scrape(10);
    CFG.wallAlign = align; CFG.wallScrape = scr;
    return { shallow, mid, oldWay };
});
console.log('  ', JSON.stringify(wallGraze));
check('淺角度擦欄唔會停死（最低 >20 km/h）', wallGraze.shallow.minKmh > 20, wallGraze.shallow);
check('擦完三秒內追返（>50 km/h）', wallGraze.shallow.after > 50, wallGraze.shallow);
check('中角度撞欄要罰得多過擦欄，但都追得返',
    wallGraze.mid.minKmh > wallGraze.shallow.minKmh
    && wallGraze.mid.after > 60, wallGraze.mid);
check('貼牆矯正真係有出力（熄咗就會停死）',
    wallGraze.oldWay.minKmh < wallGraze.shallow.minKmh * 0.5, wallGraze);

// T3b3：角度條要對住架車真正嘅可控範圍。舊寫法係 0–60° 對應 0–100%，但
// 60° 已經係打緊圈：一個維持得住嘅 31° 漂移只讀到 52%，而「hot」（42°）
// 喺動力過彎收晒（46°）之後基本上摸唔到。條 bar 係玩家對呢個機制唯一嘅
// 視覺回饋，讀錯範圍就等於教錯人。
const driftBar = await page.evaluate(async () => {
    const { CFG } = await import('./src/car.js');
    const root = window.__racer;
    root.startRace();
    const read = (deg) => {
        root.car.slipAngle = deg / 57.2958;
        root.car.drifting = true;
        root.updateHudForTest();
        const w = document.getElementById('drift-angle-fill').style.width;
        return { pct: Math.round(parseFloat(w)), hot: document.getElementById('drift-angle-fill').classList.contains('hot') };
    };
    const out = {
        入門: read(CFG.driftPowerLo * 57.2958),
        維持: read(31),
        臨界: read(CFG.driftPowerOut * 57.2958),
        超出: read(70),
    };
    // 物理一改，條 bar 要跟住改（唔可以抄死個數）
    const keep = CFG.driftPowerOut;
    CFG.driftPowerOut = keep * 0.6;
    out.收窄後維持 = read(31);
    CFG.driftPowerOut = keep;
    root.pauseRace(); root.toMenu();
    return out;
});
console.log('  ', JSON.stringify(driftBar));
check('角度條由計分門檻開始（0%）', driftBar.入門.pct <= 2, driftBar);
check('動力過彎收晒嗰點就係滿格', driftBar.臨界.pct >= 98 && driftBar.超出.pct === 100, driftBar);
check('維持得住嗰個角度讀到一半以上', driftBar.維持.pct >= 45, driftBar);
check('滿格先算 hot（唔會成場都著）', driftBar.臨界.hot && !driftBar.維持.hot, driftBar);
check('物理一改條 bar 跟住改（唔係抄死個數）',
    driftBar.收窄後維持.pct > driftBar.維持.pct, driftBar);

// T3c0：倍率階梯要摸得到。ADR-078 之後一個做得好嘅單彎漂移實測維持 1.56 秒，
// 而舊嘅倍率步長係 1.6 秒——即係差 0.04 秒都升唔到 2×，成條去到 5× 嘅階梯
// 除咗串連續彎之外係摸唔到嘅。呢個 gate 用真實維持時間去檢查第一級攞得到。
const combo = await page.evaluate(async () => {
    const { Race } = await import('./src/race.js');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const D = 57.2958;
    // 同 T3c2 一樣嘅手機式起手，但今次記低倍率
    car.reset(track.startPos, track.startDir);
    car.arcadeAssist = true;
    const d = track.startDir;
    car.vel.x = d.x * 30; car.vel.z = d.z * 30;
    const race = new Race(track, { laps: 3, trackId: track.id, onEvent: () => { } });
    race.state = 'racing';
    let held = 0, best = 1;
    for (let i = 0; i < 900; i++) {
        const t = i / 120;
        let steer = 0, hb = false;
        if (t < 0.6) steer = 0;
        else if (t < 1.05) { steer = 1; hb = true; }
        else {
            const sl = car.slipAngle;
            steer = Math.max(-1, Math.min(1, -Math.sign(sl) * (Math.abs(sl) - 30 / D) * D / 45));
        }
        car.update(1 / 120, { throttle: 0.85, steer, handbrake: hb }, PLANE);
        race.update(1 / 120, car);
        if (car.drifting) held += 1 / 120;
        best = Math.max(best, race.combo);
    }
    // 漂移結束之後 pending 會入袋（清零），所以要睇袋咗嘅加未袋嘅
    return {
        held: +held.toFixed(2), combo: best,
        scored: Math.round(race.driftScore + race.pending),
    };
});
console.log('  ', JSON.stringify(combo));
check('一個做得好嘅漂移升得到 2× 倍率', combo.combo >= 2, combo);
check('而且真係袋到分', combo.scored > 0, combo);

// T3c1：轉向要夠靈。Penny 講咗三次「超難轉向」，量度用 t45——由直路打軚
// 到車頭真係轉咗 45° 要幾多秒。最初：半軚 14/22/30 m/s 係 1.91/2.02/2.17
// 秒，全軚 30 m/s 1.66 秒。逐個 lever 掃過（expo、慣量、軚速、高速收窄、
// 抓地）之後靠兩樣：拆走搖桿曲線 + 入彎輔助（貼住路面嗰陣加前軸抓地）。
const turnIn = await page.evaluate(async () => {
    const { CFG } = await import('./src/car.js');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const D = 57.2958;
    const t45 = (stick, speed) => {
        car.reset(track.startPos, track.startDir);
        car.arcadeAssist = true;
        const d = track.startDir;
        car.vel.x = d.x * speed; car.vel.z = d.z * speed;
        const yaw0 = car.yaw;
        for (let i = 1; i <= 1200; i++) {
            car.update(1 / 120, { throttle: 0.4, steer: stick, handbrake: false }, PLANE);
            let dy = Math.abs(car.yaw - yaw0);
            if (dy > Math.PI) dy = 2 * Math.PI - dy;
            if (dy * D >= 45) return +(i / 120).toFixed(2);
        }
        return null;
    };
    const now = { 半14: t45(0.5, 14), 半22: t45(0.5, 22), 半30: t45(0.5, 30), 全30: t45(1, 30) };
    const boost = CFG.turnInBoost;
    CFG.turnInBoost = 0;
    const off = { 半14: t45(0.5, 14), 半30: t45(0.5, 30) };
    CFG.turnInBoost = boost;
    return { now, off };
});
console.log('  ', JSON.stringify(turnIn));
check('半軚都要轉得入（t45 唔可以超過 1.45／1.55／1.80 秒）',
    turnIn.now['半14'] <= 1.45 && turnIn.now['半22'] <= 1.55
    && turnIn.now['半30'] <= 1.80, turnIn.now);
check('全軚 30 m/s 1.55 秒內轉到 45°', turnIn.now['全30'] <= 1.55, turnIn.now);
check('入彎輔助真係有出力（熄咗會明顯慢）',
    turnIn.off['半14'] > turnIn.now['半14'] * 1.15
    && turnIn.off['半30'] > turnIn.now['半30'] * 1.08, turnIn);

// T3c2：漂移要維持得住，而且要維持得住喺玩家手上。實測未加動力過彎
// 之前：放咗手煞之後 26° 嘅漂移 0.8 秒就自己收返，而且玩家點反打都
// 改變唔到（反打 gain 由 0.4 掃到 2.0，維持時間全部 0.80–0.81 秒）——
// 一隻漂移計分遊戲入面，玩家對漂移長短完全冇話事權。
const driftHold = await page.evaluate(async () => {
    const { CFG } = await import('./src/car.js');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const D = 57.2958;
    // 手機玩家：撳一下手煞打軚起手，之後按滑移角反打，目標 30°
    const run = () => {
        car.reset(track.startPos, track.startDir);
        car.arcadeAssist = true;
        const d = track.startDir;
        car.vel.x = d.x * 30; car.vel.z = d.z * 30;
        let held = 0, peak = 0, settled = 0, n = 0;
        for (let i = 0; i < 900; i++) {
            const t = i / 120;
            let steer = 0, hb = false;
            if (t < 0.6) steer = 0;
            else if (t < 1.05) { steer = 1; hb = true; }
            else {
                const sl = car.slipAngle;
                steer = Math.max(-1, Math.min(1, -Math.sign(sl) * (Math.abs(sl) - 30 / D) * D / 45));
            }
            car.update(1 / 120, { throttle: 0.85, steer, handbrake: hb }, PLANE);
            if (t > 0.6) {
                const a = Math.abs(car.slipAngle) * D;
                peak = Math.max(peak, a);
                if (car.drifting) { held += 1 / 120; settled += a; n++; }
            }
        }
        return { held: +held.toFixed(2), peak: Math.round(peak), avg: n ? Math.round(settled / n) : 0 };
    };
    const now = run();
    const power = CFG.driftPower;
    CFG.driftPower = 0;
    const without = run();
    CFG.driftPower = power;
    return { now, without };
});
console.log('  ', JSON.stringify(driftHold));
check('踩住油可以真係維持到漂移（至少 1.3 秒）',
    driftHold.now.held >= 1.3, driftHold.now);
check('維持到嘅係一個揸得住嘅角度（25–40°），唔係打圈',
    driftHold.now.avg >= 20 && driftHold.now.peak <= 40, driftHold.now);
check('動力過彎就係維持漂移嗰樣嘢（熄咗會短一大截）',
    driftHold.without.held < driftHold.now.held * 0.75, driftHold);

// T3d：漂移退款唔可以變成加速外掛。第一版用固定推力，實測維持 50° 漂移
// 去到 148 km/h，比直路巡航 122 仲快——成隻遊戲反轉。而家退款上限就係
// 今幀實際刮走嘅速度，所以漂移永遠快唔過直路。
const driftSpeed = await page.evaluate(async () => {
    window.__racer.buildTrack('coast');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    car.reset(track.startPos, track.startDir); car.abs = true; car.arcadeAssist = true;
    for (let i = 0; i < 60 * 12; i++) car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, PLANE);
    const straight = car.kmh;

    car.reset(track.startPos, track.startDir);
    for (let i = 0; i < 300 && car.kmh < 110; i++) car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, PLANE);
    for (let i = 0; i < 40; i++) car.update(1 / 60, { throttle: 0.8, steer: 0.8, handbrake: true }, PLANE);
    let drifting = 0;
    for (let i = 0; i < 60 * 12; i++) {
        const sl = car.slipAngle, err = Math.abs(sl) - 40 / 57.3;
        const counter = Math.max(-1, Math.min(1, -Math.sign(sl) * err * 3.2));
        car.update(1 / 60, { throttle: 1, steer: counter, handbrake: false }, PLANE);
        drifting = Math.max(drifting, car.kmh);
    }

    // 原地打圈都唔可以刷速度
    car.reset(track.startPos, track.startDir);
    car.vel.set(Math.sin(car.yaw) * 6, 0, Math.cos(car.yaw) * 6);
    car.yawRate = 2;
    let spin = 0;
    for (let i = 0; i < 60 * 8; i++) {
        car.update(1 / 60, { throttle: 1, steer: 1, handbrake: false }, PLANE);
        spin = Math.max(spin, car.kmh);
    }
    return { straight: Math.round(straight), drifting: Math.round(drifting), spin: Math.round(spin) };
});
console.log('  ', JSON.stringify(driftSpeed));
check('漂移永遠快唔過直路（退款唔可以變外掛）',
    driftSpeed.drifting < driftSpeed.straight, driftSpeed);
check('原地打圈都刷唔到速度', driftSpeed.spin < driftSpeed.straight, driftSpeed);
// 舊版比較嘅係「直路開足 12 秒嘅極速」，但冇人會用極速過彎——用嗰個做
// 分母，等於要求漂移做一件物理上唔可能嘅事。改成同「一樣行車半徑、用抓地
// 過彎」比（ADR-085）：呢個先係玩家真正嘅選擇——同一個彎，抓住入定甩住入。
const driftLine = await page.evaluate(async () => {
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const D = 57.2958;
    car.reset(track.startPos, track.startDir);
    car.arcadeAssist = true;
    const d = track.startDir;
    car.vel.x = d.x * 30; car.vel.z = d.z * 30;
    let n = 0, sumV = 0, sumR = 0, held = 0;
    for (let i = 0; i < 1800; i++) {
        const t = i / 120;
        let steer = 0, hb = false;
        if (t < 0.6) steer = 0;
        else if (t < 1.05) { steer = 1; hb = true; }
        else {
            const sl = car.slipAngle;
            steer = Math.max(-1, Math.min(1, -Math.sign(sl) * (Math.abs(sl) - 35 / D) * D / 45));
        }
        car.update(1 / 120, { throttle: 0.9, steer, handbrake: hb }, PLANE);
        if (t > 1.2 && car.drifting) {
            held += 1 / 120;
            const v = Math.hypot(car.vel.x, car.vel.z), w = Math.abs(car.yawRate);
            if (w > 0.02) { sumV += v; sumR += v / w; n++; }
        }
    }
    if (!n) return { held: 0 };
    const v = sumV / n, R = sumR / n;
    // 同一半徑、用抓地過彎攞得到嘅速度（實測橫向極限 12.3 m/s²）
    const gripV = Math.sqrt(12.3 * R);
    return {
        held: +held.toFixed(1), radius: Math.round(R),
        kmh: Math.round(v * 3.6), gripKmh: Math.round(gripV * 3.6),
        keep: +(v / gripV).toFixed(2),
    };
});
console.log('  ', JSON.stringify(driftLine));
check('漂移過彎唔會蝕速度（同半徑抓地嘅八成以上）', driftLine.keep >= 0.8, driftLine);
check('而且真係一條窄線（半徑 <90 米）', driftLine.radius < 90, driftLine);
check('維持得夠耐先叫得做過彎線（>5 秒）', driftLine.held > 5, driftLine);

// T3b：車身側傾唔可以令架車望落離地。模型係一整件硬嘢（車身連輪胎），
// 側傾角一大，一邊輪胎就會離地、另一邊插落路面——Penny 實機報告
// 「架車好似浮起、轉左轉右好似飛機咁」，量到嗰陣係 9.2° 側傾、
// 最低點插落 -0.27 米。
const roll = await page.evaluate(async () => {
    const THREE = await import('three');
    window.__racer.buildTrack('coast');
    const { car, track } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    car.reset(track.startPos, track.startDir);
    for (let i = 0; i < 240; i++) car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, PLANE);
    const rest = new THREE.Box3().setFromObject(car.root).min.y;
    let peak = 0, pitchPeak = 0, lowest = 0;
    for (let i = 0; i < 240; i++) {
        car.update(1 / 60, { throttle: 0.8, steer: 0.85, handbrake: false }, PLANE);
        peak = Math.max(peak, Math.abs(car.bodyRoll));
        pitchPeak = Math.max(pitchPeak, Math.abs(car.bodyPitch));
        lowest = Math.min(lowest, new THREE.Box3().setFromObject(car.root).min.y);
    }
    // 手煞甩尾嗰陣側傾亦唔可以爆
    let peakDrift = 0;
    for (let i = 0; i < 120; i++) {
        car.update(1 / 60, { throttle: 0.8, steer: 0.85, handbrake: true }, PLANE);
        peakDrift = Math.max(peakDrift, Math.abs(car.bodyRoll));
        pitchPeak = Math.max(pitchPeak, Math.abs(car.bodyPitch));
    }
    return {
        rest: +rest.toFixed(3), peakDeg: +(peak * 57.3).toFixed(1),
        driftDeg: +(peakDrift * 57.3).toFixed(1), pitchDeg: +(pitchPeak * 57.3).toFixed(1),
        lowest: +lowest.toFixed(3),
    };
});
console.log('  ', JSON.stringify(roll));
check('企定嗰陣車底貼實地面', Math.abs(roll.rest) < 0.01, roll.rest);
check('側傾唔超過 3.5°（真車極限約 3°）', roll.peakDeg <= 3.5 && roll.driftDeg <= 3.5, roll);
check('側傾仍然睇得出（唔係死板冇動態）', roll.peakDeg > 1.5, roll.peakDeg);
check('加減速會有受限前後載荷回饋', roll.pitchDeg >= 0.5 && roll.pitchDeg <= 2.2, roll.pitchDeg);
// 模型硬身，3° 側傾喺呢個車寬度下必然有約 9 厘米高低差（一邊插落路面、
// 一邊抬起）。9 厘米對一架 6.9 米長嘅車嚟講肉眼幾乎睇唔到，接地陰影
// 亦唔跟側傾，所以望落仍然貼地。舊嗰個 9.2° 側傾係 27 厘米，就係
// Penny 講嗰種「飛機打側飛」。
check('過彎時車身唔會插落路面超過 10 厘米', roll.lowest > -0.1, roll.lowest);

// T3c：路面姿態變化要有少量懸掛滯後，否則 rigid 車模會似貼紙即時
// 黐住坡度。呢個係 render-only gate：假 track 只改 pitch/bank，物理仍然
// 用同一個 X/Z 平面，確保新回饋唔會偷偷改速度／碰撞。
const suspension = await page.evaluate(() => {
    const { car } = window.__racer;
    let ticks = 0;
    const fakeTrack = {
        isDrivable: () => true,
        isWall: () => false,
        renderPoseAt(_x, _z, out) {
            ticks++;
            const phase = ticks < 12 ? 0 : ticks < 24 ? 0.085 : -0.06;
            out.y = 0; out.terrainY = 0; out.terrainBlend = 1;
            out.pitch = phase; out.bank = phase * 0.65;
            return out;
        },
    };
    car.reset({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    car.setRenderSurface(0, 0, 0);
    let maxPitch = 0, maxRoll = 0, maxHeave = 0, maxRootDelta = 0;
    for (let i = 0; i < 60; i++) {
        car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, fakeTrack);
        maxPitch = Math.max(maxPitch, Math.abs(car.suspensionPitch));
        maxRoll = Math.max(maxRoll, Math.abs(car.suspensionRoll));
        maxHeave = Math.max(maxHeave, Math.abs(car.suspensionHeave));
        maxRootDelta = Math.max(maxRootDelta,
            Math.abs(car.root.rotation.x - (car.bodyPitch + car.trackPitch)),
            Math.abs(car.root.rotation.z - (car.bodyRoll + car.trackBank)));
    }
    return {
        pitchDeg: +(maxPitch * 57.3).toFixed(2),
        rollDeg: +(maxRoll * 57.3).toFixed(2),
        heave: +maxHeave.toFixed(4),
        rootDeltaDeg: +(maxRootDelta * 57.3).toFixed(2),
        speed: +car.speed.toFixed(2),
        physicsY: car.pos.y,
    };
});
console.log('  ', JSON.stringify(suspension));
check('路面突變會有細幅 render-only 懸掛滯後',
    suspension.pitchDeg > 0.2 && suspension.rollDeg > 0.1
    && suspension.pitchDeg <= 1.1 && suspension.rollDeg <= 0.9, suspension);
check('crest／valley 會有短暫垂向懸掛壓縮，但唔會跳飛',
    suspension.heave > 0.015 && suspension.heave <= 0.091, suspension);
check('懸掛回饋唔會改物理高度或速度',
    suspension.physicsY === 0 && suspension.speed > 0, suspension);

// T3e：crest／valley 唔可以只係一張貼圖。坡度仍然係 bounded arcade
// feedback：上坡會有少量負載、落坡會有推進，但唔將 render Y 寫入物理。
const gradeFeel = await page.evaluate(() => {
    const { car } = window.__racer;
    const fakeTrack = (pitch) => ({
        isDrivable: () => true,
        isWall: () => false,
        renderPoseAt(_x, _z, out) {
            out.y = 0; out.terrainY = 0; out.terrainBlend = 1;
            out.pitch = pitch; out.bank = 0;
            return out;
        },
    });
    const run = (pitch) => {
        const track = fakeTrack(pitch);
        car.reset({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        car.setRenderSurface(0, 0, pitch);
        for (let i = 0; i < 240; i++) {
            car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, track);
        }
        return {
            speed: +car.speed.toFixed(3),
            gradeAccel: +car.gradeAccel.toFixed(3),
            physicsY: car.pos.y,
        };
    };
    return { uphill: run(-0.08), flat: run(0), downhill: run(0.08) };
});
console.log('  ', JSON.stringify(gradeFeel));
check('上落坡會改變前後負載，唔再係純平面速度',
    gradeFeel.uphill.speed < gradeFeel.flat.speed - 1
    && gradeFeel.downhill.speed > gradeFeel.flat.speed + 1
    && gradeFeel.uphill.gradeAccel < -0.5
    && gradeFeel.downhill.gradeAccel > 0.5, gradeFeel);
check('坡度回饋仍然唔寫入物理高度',
    gradeFeel.uphill.physicsY === 0
    && gradeFeel.flat.physicsY === 0
    && gradeFeel.downhill.physicsY === 0, gradeFeel);

// T3d：重開／換賽道要清走上一場嘅姿態同瞬態旗標。呢啲值通常會喺下一個
// physics frame 覆寫，但第一個 render／HUD frame 會先讀到；如果玩家喺
// 漂移途中撳「再跑一次」，一開波就側住或者顯示假鎖胎，讀感會似車壞咗。
const resetPose = await page.evaluate(() => {
    const { car, track } = window.__racer;
    car.bodyRoll = 0.05;
    car.bodyPitch = -0.02;
    car.suspensionHeave = 0.06;
    car.unspinning = true;
    car.offroad = true;
    car.lockFront = true;
    car.lockRear = true;
    car.reset(track.startPos, track.startDir);
    return {
        roll: car.bodyRoll, pitch: car.bodyPitch, heave: car.suspensionHeave,
        unspinning: car.unspinning,
        offroad: car.offroad, lockFront: car.lockFront, lockRear: car.lockRear,
        rootY: car.root.position.y,
    };
});
console.log('  ', JSON.stringify(resetPose));
check('重開會清走車身側傾／俯仰同瞬態狀態',
    resetPose.roll === 0 && resetPose.pitch === 0 && !resetPose.unspinning
    && resetPose.heave === 0
    && !resetPose.offroad && !resetPose.lockFront && !resetPose.lockRear
    && Math.abs(resetPose.rootY) < 0.001, resetPose);

// T4a：打圈之後車手要自己救得返（ADR-065）。
// 舊行為：一路 steer 1.0 ＋ throttle 1.0 原地兜圈，兜到三秒拖車為止。
const recover = await page.evaluate(async () => {
    const { createDriver, SKILLS } = await import('./src/driver.js');
    window.__racer.buildTrack('turbo-rev');
    const { car, track, race } = window.__racer;
    const d = createDriver(track, SKILLS.quick);
    race.reset(); race.state = 'racing';
    let rescues = 0;
    const prev = race.onEvent;
    race.onEvent = (k) => { if (k === 'rescue') rescues++; };

    // 人手整一個「打完圈」嘅狀態：企喺賽道上面但車頭指返轉頭、近乎停定
    car.reset(track.startPos, track.startDir);
    car.yaw += Math.PI * 0.85;
    car.vel.set(0, 0, 0);
    const t0 = track.nearestT(car.pos.x, car.pos.z);
    let entered = false, reversedOnce = false, frames = 0, recoveredAt = -1;
    for (let i = 0; i < 60 * 12; i++) {
        const t = track.nearestT(car.pos.x, car.pos.z);
        const cmd = d.read(car, t);
        if (d.recovering) entered = true;
        if (cmd.throttle < 0) reversedOnce = true;
        car.update(1 / 60, cmd, track);
        race.update(1 / 60, car);
        frames++;
        // 救返＝車頭指返賽道方向兼有速度向前行
        const fwd = { x: Math.sin(car.yaw), z: Math.cos(car.yaw) };
        const tan = track.curve.getTangentAt(t);
        if (recoveredAt < 0 && fwd.x * tan.x + fwd.z * tan.z > 0.8 && car.speed > 8) recoveredAt = i;
        if (recoveredAt >= 0 && i > recoveredAt + 60) break;
    }
    race.onEvent = prev;
    return {
        entered, reversedOnce, rescues,
        recoveredSec: recoveredAt < 0 ? null : +(recoveredAt / 60).toFixed(1),
        stillRecovering: d.recovering, frames,
    };
});
console.log('  ', JSON.stringify(recover));
check('打咗圈會入復原狀態', recover.entered === true, recover);
check('復原時會煞停／倒車，唔係一路踩爆油', recover.reversedOnce === true, recover);
check('唔使拖車就自己救得返', recover.rescues === 0 && recover.recoveredSec !== null, recover);
check('六秒之內救返出嚟', recover.recoveredSec !== null && recover.recoveredSec < 6, recover.recoveredSec);
check('救完會退出復原狀態', recover.stillRecovering === false, recover);

// T4b：車頭頂正欄杆唔可以永遠釘死——踩住油卡夠 3 秒就要拖返賽道。
// 舊嘅撞欄處理係逐條軸 next.x = pos.x，連沿住欄滑行都殺埋，自動駕駛實測
// 撞完之後 v=0 一路到收場；呢項就係守住呢個回歸。
const rescue = await page.evaluate(async () => {
    const THREE = await import('three');
    window.__racer.buildTrack('turbo');
    const { car, track, race } = window.__racer;
    race.reset(); race.state = 'racing';
    let fired = 0;
    const onEvent = race.onEvent;
    race.onEvent = (kind, data) => { if (kind === 'rescue') fired++; onEvent?.(kind, data); };

    // 搵一格欄杆，將車擺喺欄杆隔籬再踩實油頂住佢
    const wallCell = track.findCell('wall');
    car.reset(track.startPos, track.startDir);
    const t = 0.31;
    const p = track.curve.getPointAt(t);
    const side = track.curve.getTangentAt(t).cross(new THREE.Vector3(0, 1, 0)).normalize();
    let wallOffset = 16;
    while (wallOffset < 28 && !track.isWall(p.x + side.x * wallOffset, p.z + side.z * wallOffset)) {
        wallOffset += 0.25;
    }
    car.pos.set(p.x + side.x * (wallOffset - 7), 0, p.z + side.z * (wallOffset - 7));
    car.yaw = Math.atan2(side.x, side.z);
    car.vel.set(side.x * 20, 0, side.z * 20);
    let highSpeedImpact = 0;
    for (let i = 0; i < 40; i++) {
        car.update(1 / 60, { throttle: 0, steer: 0, handbrake: false }, track);
        highSpeedImpact = Math.max(highSpeedImpact, car.wallImpact);
    }

    car.reset(track.startPos, track.startDir);
    car.pos.set(wallCell[0] - 2, 0, wallCell[1]);
    car.yaw = Math.PI / 2;                       // 車頭向 +x，即係頂住欄
    const out = { wallCell, wallOffset, highSpeedImpact };
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
check('高速撞欄會輸出實際撞擊速度畀視覺回饋', rescue.highSpeedImpact > 8, rescue.highSpeedImpact);
check('卡死 3 秒會拖返賽道', rescue.rescues >= 1, rescue.rescues);
check('拖完企返喺路面', rescue.onRoadAfter === true);

// T5：換賽道唔會漏 GPU 資源（每換一次都會 dispose 舊 3D 世界）
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
