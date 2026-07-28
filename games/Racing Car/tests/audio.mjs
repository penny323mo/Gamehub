// 音效：映射合理、唔跑就收聲、關咗就一個節點都唔建、冇 WebAudio 都唔會爆。
//
// 呢度唔會「聽」把聲，而係量度合成器嘅實際參數同節點狀態——把聲啱唔啱聽
// 要 Penny 用耳仔判斷，但「跑車冇聲」「返咗選單仲響」「關咗仍然出聲」
// 「iOS 靜曬」呢幾樣係量度得到嘅。

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;

// T1：純映射——引擎跟速度同油門走、輪胎要夠角度先響、風噪要夠快先出
const maps = await page.evaluate(async () => {
    const { engineTone, skidGain, windGain } = await import('./src/audio.js');
    const at = (s, t) => engineTone(s, t);
    return {
        idle: at(0, 0),
        slow: at(8, 1),
        mid: at(18, 1),
        gearDrop: [at(20.5, 1).freq, at(21.5, 1).freq],   // 換波要跌返落去
        gears: [at(5, 1).gear, at(30, 1).gear, at(200, 1).gear],
        throttleUp: [at(18, 0).gain, at(18, 1).gain],
        cutoff: [at(18, 0).cutoff, at(18, 1).cutoff],
        skidStill: skidGain(0.6, 2),
        skidStraight: skidGain(0.02, 30),
        skidDrift: skidGain(0.5, 30),
        skidHand: skidGain(0.02, 30, false, true),
        skidGrass: [skidGain(0.5, 30, false), skidGain(0.5, 30, true)],
        wind: [windGain(0), windGain(8), windGain(40), windGain(999)],
    };
});
console.log('  ', JSON.stringify(maps));
check('停定都仲有怠速聲', maps.idle.gain > 0 && maps.idle.freq > 40, maps.idle);
check('愈快音高愈高', maps.slow.freq < maps.mid.freq, maps);
check('換波音高會跌返落去', maps.gearDrop[1] < maps.gearDrop[0], maps.gearDrop);
check('波段隨速度上升兼有上限',
    maps.gears[0] === 0 && maps.gears[1] === 1 && maps.gears[2] === 4, maps.gears);
check('踩油聲會大啲、亦開得亮啲',
    maps.throttleUp[1] > maps.throttleUp[0] && maps.cutoff[1] > maps.cutoff[0], maps);
check('慢車扭軚唔會有甩尾聲', maps.skidStill === 0, maps.skidStill);
check('直路唔會響輪胎', maps.skidStraight === 0, maps.skidStraight);
check('真係甩尾先響', maps.skidDrift > 0.3, maps.skidDrift);
check('拉手煞即刻有胎聲', maps.skidHand > 0, maps.skidHand);
check('落草地胎聲會悶啲', maps.skidGrass[1] < maps.skidGrass[0], maps.skidGrass);
check('風噪跟速度上升兼夾住上限',
    maps.wind[0] === 0 && maps.wind[1] === 0 && maps.wind[2] > 0.4
    && maps.wind[3] <= 0.75, maps.wind);

// T2：關咗音效就連 AudioContext 都唔應該建（慳電兼唔會偷偷出聲）
const off = await page.evaluate(async () => {
    const { createRacerAudio } = await import('./src/audio.js');
    let made = 0;
    const a = createRacerAudio({ contextFactory: () => { made++; return new AudioContext(); }, enabled: false });
    a.startRace();
    a.update(1 / 60, { speed: 30, slipAngle: 0.4, offroad: false, wallHit: false }, { throttle: 1 });
    a.event('go');
    const quiet = { made, snap: a.snapshot() };
    // 開返就要即刻建得成兼響得到
    a.setEnabled(true);
    a.startRace();
    a.update(1 / 60, { speed: 30, slipAngle: 0.4, offroad: false, wallHit: false }, { throttle: 1 });
    const loud = { made, snap: a.snapshot(), saved: localStorage.getItem('racer-audio') };
    a.setEnabled(false);
    const savedOff = localStorage.getItem('racer-audio');
    a.setEnabled(true);
    return { quiet, loud, savedOff };
});
console.log('  ', JSON.stringify(off));
check('關咗音效唔會建 AudioContext', off.quiet.made === 0 && off.quiet.snap.ready === false, off.quiet);
check('關咗唔會有任何音量', off.quiet.snap.engine === 0 && off.quiet.snap.blips === 0, off.quiet.snap);
check('開返就建得成', off.loud.made === 1 && off.loud.snap.ready === true, off.loud);
check('開返就有引擎同胎聲',
    off.loud.snap.engine > 0 && off.loud.snap.skid > 0 && off.loud.snap.freq > 0, off.loud.snap);
check('音效開關存得返', off.loud.saved === '1' && off.savedOff === '0', off);

// T3：唔跑比賽就唔可以出聲；暫停要真係 suspend
const life = await page.evaluate(async () => {
    const { createRacerAudio } = await import('./src/audio.js');
    const a = createRacerAudio({ enabled: true });
    const car = { speed: 30, slipAngle: 0.4, offroad: false, wallHit: false };
    // 未 startRace：update 應該完全唔郁
    a.update(1 / 60, car, { throttle: 1 });
    const before = a.snapshot();
    a.startRace();
    for (let i = 0; i < 5; i++) a.update(1 / 60, car, { throttle: 1 });
    const during = a.snapshot();
    a.stopRace();
    const after = a.snapshot();
    await new Promise(res => setTimeout(res, 350));
    const suspended = a.snapshot();
    a.startRace();
    a.resume();
    await new Promise(res => setTimeout(res, 120));   // resume() 係 async
    const back = a.snapshot();

    // 完賽收聲係排喺 220ms 之後嘅。玩家即刻撳「再跑一次」嘅話，
    // 嗰個遲到嘅 suspend 唔可以熄咗新一場——舊寫法會靜曬成場。
    a.stopRace();
    a.startRace();
    for (let i = 0; i < 5; i++) a.update(1 / 60, car, { throttle: 1 });
    await new Promise(res => setTimeout(res, 400));
    const quickRestart = a.snapshot();
    a.stopRace();
    return { before, during, after, suspended, back, quickRestart };
});
console.log('  ', JSON.stringify(life));
check('未開波唔會出聲', life.before.engine === 0 && life.before.ready === false, life.before);
check('比賽中有引擎聲', life.during.engine > 0 && life.during.nodeGain >= 0, life.during);
check('返選單即刻收聲', life.after.engine === 0 && life.after.racing === false, life.after);
check('收咗聲之後真係 suspend 個 context', life.suspended.state === 'suspended', life.suspended);
check('再開波 resume 得返', life.back.state === 'running', life.back);
check('完賽即刻再開波唔會被遲到嘅 suspend 熄咗',
    life.quickRestart.state === 'running' && life.quickRestart.engine > 0, life.quickRestart);

// T4：撞欄同比賽事件真係會發聲；未知事件唔會扮發聲
const evts = await page.evaluate(async () => {
    const { createRacerAudio } = await import('./src/audio.js');
    const a = createRacerAudio({ enabled: true });
    a.startRace();
    const base = a.snapshot().blips;
    for (const k of ['count', 'go', 'lap', 'record', 'driftBank', 'driftLost', 'rescue', 'finish']) a.event(k);
    const afterEvents = a.snapshot().blips;
    const unknown = a.event('乜東東');
    // 撞欄：車自己帶住力度，update 入面就應該撞出一聲
    a.update(1 / 60, { speed: 20, slipAngle: 0, offroad: false, wallHit: true, wallImpact: 9 }, { throttle: 1 });
    const afterCrash = a.snapshot().blips;
    a.stopRace();
    return { base, afterEvents, unknown, afterCrash };
});
console.log('  ', JSON.stringify(evts));
check('八個比賽事件都出到聲', evts.afterEvents - evts.base >= 8, evts);
check('唔識嘅事件唔會扮發聲', evts.unknown === false, evts.unknown);
check('撞欄會有撞擊聲', evts.afterCrash > evts.afterEvents, evts);

// T5：冇 WebAudio（或者建唔到）都唔可以拖冧成個遊戲
const broken = await page.evaluate(async () => {
    const { createRacerAudio } = await import('./src/audio.js');
    const dead = createRacerAudio({ contextFactory: () => { throw new Error('no audio device'); }, enabled: true });
    dead.startRace();
    dead.update(1 / 60, { speed: 30, slipAngle: 0.4, offroad: false, wallHit: true, wallImpact: 5 }, { throttle: 1 });
    dead.event('go');
    dead.stopRace();
    const nul = createRacerAudio({ contextFactory: () => null, enabled: true });
    nul.startRace();
    nul.update(1 / 60, { speed: 10, slipAngle: 0, offroad: false, wallHit: false }, {});
    return { dead: dead.snapshot(), nul: nul.snapshot() };
});
console.log('  ', JSON.stringify(broken));
check('建唔到 AudioContext 都唔會爆', broken.dead.broken === true && broken.dead.blips === 0, broken.dead);
check('回傳 null 都唔會爆', broken.nul.broken === true && broken.nul.ready === false, broken.nul);

// T6：入返遊戲——開波有聲、返選單收聲、設定掣改得到
const live = await page.evaluate(async () => {
    const { audio, startRace, race, car, track, toMenu } = window.__racer;
    audio.setEnabled(true);
    startRace();
    race.countdown = 0; race.state = 'racing';
    car.reset(track.startPos, track.startDir);
    car.vel.set(Math.sin(car.yaw) * 30, 0, Math.cos(car.yaw) * 30);
    for (let i = 0; i < 8; i++) {
        car.update(1 / 60, { throttle: 1, steer: 0, handbrake: false }, track);
        audio.update(1 / 60, car, { throttle: 1, steer: 0, handbrake: false });
    }
    const racing = audio.snapshot();
    toMenu();
    const menu = audio.snapshot();
    // 設定掣：撳「關」要即刻靜，掣要著返啱嗰粒
    const btn = (v) => document.querySelector(`#audio-seg button[data-audio="${v}"]`);
    btn('0').click();
    const offSnap = { snap: audio.snapshot(), on: btn('0').classList.contains('on') };
    btn('1').click();
    const onSnap = { enabled: audio.enabled, on: btn('1').classList.contains('on') };
    return { racing, menu, offSnap, onSnap };
});
console.log('  ', JSON.stringify(live));
check('真係開波之後聽到引擎', live.racing.engine > 0 && live.racing.freq > 60, live.racing);
check('返選單引擎即刻停', live.menu.engine === 0 && live.menu.racing === false, live.menu);
check('撳「關」即刻靜曬兼著正粒掣',
    live.offSnap.snap.enabled === false && live.offSnap.on === true, live.offSnap);
check('撳返「開」開得返', live.onSnap.enabled === true && live.onSnap.on === true, live.onSnap);

checkNoErrors(r.errors);
await r.close();
finish('audio');
