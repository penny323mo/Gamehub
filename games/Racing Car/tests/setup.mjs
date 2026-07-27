// 起跑線位置、順滑 3D renderer、設定（車色／日夜／轉向／陀螺儀）、賽道縮圖。
//
// 呢個檔案守住嘅係「Penny 一眼睇到」嗰批嘢：起跑線唔可以落喺彎中、
// 賽道唔可以退化成格仔地板、揀完設定要真係生效兼記得住。

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;

// Loading 遮罩要等第一個完整 WebGL frame；minimap/HUD 亦要喺玩家起跑前預熱。
const startupWarm = await page.evaluate(() => {
    const cv = document.getElementById('minimap');
    const data = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let ink = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 8) ink++;
    return {
        ready: window.__racer.ready,
        loadingHidden: document.getElementById('loading').classList.contains('hidden'),
        menuVisible: !document.getElementById('screen-start').classList.contains('hidden'),
        ink,
        speed: document.getElementById('speed-num').textContent,
        lap: document.getElementById('lap-num').textContent,
    };
});
console.log('  ', JSON.stringify(startupWarm));
check('第一個完整 3D frame 後先揭選單，並已預熱 HUD／minimap', startupWarm.ready
    && startupWarm.loadingHidden && startupWarm.menuVisible && startupWarm.ink > 1000
    && startupWarm.speed === '0' && startupWarm.lap === '1/3', startupWarm);

const TRACK_IDS = await page.evaluate(() => window.__racer.TRACKS.map(t => t.id));

// T1：起跑線喺直路上面，而且打橫過晒條路
for (const id of TRACK_IDS) {
    const info = await page.evaluate((id) => {
        window.__racer.buildTrack(id);
        const { track } = window.__racer;
        // 起跑線格：由中線向兩邊掃，數吓黑白格鋪到幾闊
        const dir = track.startDir, p = track.startPos;
        const sx = -dir.z, sz = dir.x;                 // 打橫方向
        let halfSpan = 0;
        for (let w = 0; w < 20; w += 0.5) {
            const c = track.codeAtWorld(p.x + sx * w, p.z + sz * w);
            const c2 = track.codeAtWorld(p.x - sx * w, p.z - sz * w);
            // 9 / 10 = start / startB
            if ((c === 9 || c === 10) && (c2 === 9 || c2 === 10)) halfSpan = w;
        }
        return {
            id, startT: +track.startT.toFixed(3),
            straightR: track.startStraightR,
            halfSpan,
            onRoad: track.isDrivable(p.x, p.z),
        };
    }, id);
    console.log('  ', JSON.stringify(info));
    // 半徑 180 米以上，喺 60 米嘅起步區內偏離中線唔夠 2.5 米，肉眼就係直路
    check(`${id}：起跑線喺直路（半徑 >180）`, info.straightR > 180, info.straightR);
    check(`${id}：起跑線鋪滿擴闊後行車面`, info.halfSpan >= 13.5, info.halfSpan);
}

// T2：畫面係連續 ribbon，而物理格網只留喺幕後做判定。
const geo = await page.evaluate(async () => {
    const { BLOCK } = await import('./src/track.js');
    const { track, renderer } = window.__racer;
    return {
        gridCell: BLOCK, cells: track.cellCount,
        style: track.visualStyle, segments: track.visualSegments,
        posts: track.wallCount, trees: track.treeCount,
        calls: renderer.info.render.calls,
        tris: renderer.info.render.triangles,
    };
});
console.log('  ', JSON.stringify(geo));
check('視覺層係連續曲線 ribbon', geo.style === 'smooth-ribbon', geo.style);
check('彎位取樣夠密（>=320 段）', geo.segments >= 320, geo.segments);
check('有連續護欄支柱同賽道樹木', geo.posts > 200 && geo.trees >= 100, geo);
check('完整 3D 世界 draw calls 維持手機預算（<18）', geo.calls < 18, geo.calls);
check('三角形數量喺手機預算（<120k）', geo.tris < 120000, geo.tris);

// 車身由過大嘅 10.35 縮細三分之一返去 6.9；物理參數唔跟住改。
const carScale = await page.evaluate(async () => {
    const THREE = await import('three');
    const { car, visualLength } = window.__racer;
    const pos = car.root.position.clone(), rot = car.root.rotation.clone();
    car.root.position.set(0, 0, 0);
    car.root.rotation.set(0, 0, 0);
    car.root.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(car.root).getSize(new THREE.Vector3());
    car.root.position.copy(pos);
    car.root.rotation.copy(rot);
    car.root.updateMatrixWorld(true);
    return { target: visualLength, measured: +Math.max(size.x, size.z).toFixed(2) };
});
console.log('  ', JSON.stringify(carScale));
check('玩家車身由 10.35 縮細三分之一至 6.9', carScale.target === 6.9
    && carScale.measured >= 6.85 && carScale.measured <= 6.95, carScale);

// T3：設定真係改到嘢，兼且記得住
const set = await page.evaluate(() => {
    const { setColour, setTod, car } = window.__racer;
    const read = () => {
        let painted = null;
        car.root.traverse((o) => {
            if (painted || !o.isMesh || !o.material?.__paintable) return;
            painted = o.material.color.getHex();
        });
        return painted;
    };
    setColour('red');
    const red = read();
    setColour('blue');
    const blue = read();
    document.querySelector('#tod-seg [data-tod="day"]').click();
    const dayEnvironment = window.__racer.environment.snapshot();
    document.querySelector('#tod-seg [data-tod="dusk"]').click();
    const duskSky = window.__racer.scene.background.getHex();
    const duskEnvironment = window.__racer.environment.snapshot();
    document.querySelector('#tod-seg [data-tod="night"]').click();
    const nightEnvironment = window.__racer.environment.snapshot();
    return {
        red, blue, changed: red !== blue,
        tod: window.__racer.tod,
        duskSky,
        dayEnvironment, duskEnvironment, nightEnvironment,
        nightRoadGlow: window.__racer.track.road.material.emissiveIntensity,
        nightRailGlow: window.__racer.track.walls.children[0].material.emissiveIntensity,
        savedColour: localStorage.getItem('racer-colour'),
        savedTod: localStorage.getItem('racer-tod'),
        selectedTod: document.querySelector('#tod-seg button.on')?.dataset.tod,
    };
});
console.log('  ', JSON.stringify(set));
check('揀顏色會噴到車身', set.changed, set);
check('顏色會存返落 localStorage', set.savedColour === 'blue', set.savedColour);
check('日／黃昏／夜按鈕可操作，揀夜晚會生效兼存返', set.duskSky === 0xf0a06a
    && set.tod === 'night' && set.savedTod === 'night' && set.selectedTod === 'night', set);
check('三個時段有獨立天空／星光／車頭燈狀態',
    !set.dayEnvironment.starsVisible && set.dayEnvironment.headlightIntensity === 0
    && set.duskEnvironment.starsVisible && set.duskEnvironment.starOpacity > 0
    && set.duskEnvironment.headlightIntensity > 0
    && set.nightEnvironment.starOpacity > set.duskEnvironment.starOpacity
    && set.nightEnvironment.headlightIntensity > set.duskEnvironment.headlightIntensity
    && set.nightEnvironment.headlightAttached
    && set.dayEnvironment.skyZenith !== set.nightEnvironment.skyZenith,
    { day: set.dayEnvironment, dusk: set.duskEnvironment, night: set.nightEnvironment });
check('夜晚路面同護欄會發出低成本反光提示', set.nightRoadGlow >= 0.4
    && set.nightRailGlow >= 0.9, { road: set.nightRoadGlow, rail: set.nightRailGlow });

// 夜晚同日頭嘅場景設定要真係唔同（唔淨係換個名）
const light = await page.evaluate(() => {
    const grab = () => {
        const { renderer } = window.__racer;
        return { exposure: +renderer.toneMappingExposure.toFixed(2) };
    };
    window.__racer.setTod('day');
    const day = grab();
    window.__racer.setTod('night');
    const night = grab();
    window.__racer.setTod('day');
    return { day, night };
});
console.log('  ', JSON.stringify(light));
check('日／夜曝光唔同', light.day.exposure !== light.night.exposure, light);

const nightBudget = await page.evaluate(async () => {
    const root = window.__racer;
    root.setTod('night');
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const night = {
        calls: root.renderer.info.render.calls,
        triangles: root.renderer.info.render.triangles,
    };
    root.setTod('day');
    await new Promise(resolve => requestAnimationFrame(resolve));
    return night;
});
console.log('  ', JSON.stringify(nightBudget));
check('完整夜景仍守住手機 draw-call／三角形預算', nightBudget.calls < 18
    && nightBudget.triangles < 120000, nightBudget);

const drivingFx = await page.evaluate(() => {
    const root = window.__racer;
    const { car, drivingEffects: fx } = root;
    fx.reset();
    root.setTod('night');
    car.reset(root.track.startPos, root.track.startDir);
    car.vel.set(Math.sin(car.yaw) * 24, 0, Math.cos(car.yaw) * 24);
    car.drifting = true;
    car.offroad = false;
    for (let i = 0; i < 42; i++) {
        car.pos.addScaledVector(car.vel, 1 / 60);
        fx.update(1 / 60, car);
    }
    const drift = fx.snapshot();
    root.renderer.render(root.scene, root.camera);
    const activeBudget = {
        calls: root.renderer.info.render.calls,
        triangles: root.renderer.info.render.triangles,
    };

    car.drifting = false;
    car.wallImpact = 18;
    fx.update(1 / 60, car);
    const impact = fx.snapshot();
    car.wallImpact = 0;
    for (let i = 0; i < 150; i++) fx.update(1 / 60, car);
    const settled = fx.snapshot();
    fx.reset();
    const reset = fx.snapshot();
    car.reset(root.track.startPos, root.track.startDir);
    root.setTod('day');
    return { drift, impact, settled, reset, activeBudget };
});
console.log('  ', JSON.stringify(drivingFx));
check('漂移會留下雙輪胎痕同有上限輪胎煙', drivingFx.drift.marks >= 20
    && drivingFx.drift.particles > 0 && drivingFx.drift.visible
    && drivingFx.drift.maxInstances === 176
    && drivingFx.drift.markCapacity === 128 && drivingFx.drift.particleCapacity === 48,
    drivingFx.drift);
check('撞擊強度會觸發碎光同短促鏡頭震動，之後自行衰減',
    drivingFx.impact.particles >= drivingFx.drift.particles
    && drivingFx.impact.shake > 0.3 && drivingFx.settled.shake < 0.002,
    { impact: drivingFx.impact, settled: drivingFx.settled });
check('最繁忙夜景駕駛效果仍只加一個 draw call', drivingFx.activeBudget.calls < 18
    && drivingFx.activeBudget.triangles < 120000, drivingFx.activeBudget);
check('新一場／換賽道可完整清空效果池', drivingFx.reset.marks === 0
    && drivingFx.reset.particles === 0 && !drivingFx.reset.visible, drivingFx.reset);

// T3b：手機畫質模式要有硬上限兼持久化；3× DPR 手機都唔可以四倍燒 GPU。
const quality = await page.evaluate(async () => {
    const { qualityDpr } = await import('./src/settings.js');
    const root = window.__racer;
    root.setQuality('battery');
    const battery = root.quality;
    root.setQuality('sharp');
    const sharp = root.quality;
    root.setQuality('auto');
    const auto = root.quality;
    return {
        battery, sharp, auto,
        caps: {
            autoPhone: qualityDpr('auto', 3, true),
            sharpPhone: qualityDpr('sharp', 3, true),
            batteryPhone: qualityDpr('battery', 3, true),
        },
        saved: localStorage.getItem('racer-quality'),
        selected: document.querySelectorAll('#quality-seg button.on').length,
        note: document.getElementById('quality-note').textContent,
    };
});
console.log('  ', JSON.stringify(quality));
check('Auto 手機 DPR 封頂 1.5×', quality.caps.autoPhone === 1.5, quality.caps);
check('清晰／省電 DPR 上限分別係 1.75×／1×',
    quality.caps.sharpPhone === 1.75 && quality.caps.batteryPhone === 1, quality.caps);
check('畫質模式會持久化兼 UI 只有一項 selected',
    quality.saved === 'auto' && quality.selected === 1 && quality.note.includes('自動'), quality);

// 真機報告要將「順唔順」變成可複製數字；所有畫質模式都要繼續取樣。
const perfReport = await page.evaluate(async () => {
    const root = window.__racer;
    root.startRace();
    await new Promise(r => setTimeout(r, 220));
    root.tuneAutoQuality(58);
    root.tuneAutoQuality(42);
    root.pauseRace('報告測試');
    root.toMenu();
    const data = root.performanceReport();
    const text = root.performanceReportText();
    const copiedText = await root.copyPerformanceReport();
    return {
        data, text, copiedText,
        note: document.getElementById('device-report').textContent,
        feedback: document.getElementById('copy-report-btn').textContent,
        copyHeight: document.getElementById('copy-report-btn').getBoundingClientRect().height,
    };
});
console.log('  ', JSON.stringify(perfReport));
check('手機實測報告包含 FPS、DPR、viewport、賽道同長幀', perfReport.data.minFps === 42
    && perfReport.data.frames > 0 && perfReport.text.includes('DPR')
    && perfReport.text.includes('長幀') && perfReport.text.includes(perfReport.data.viewport)
    && perfReport.text.includes(perfReport.data.track) && perfReport.note === perfReport.text, perfReport);
check('複製實測報告有真實結果提示兼守住 44px', perfReport.copiedText === perfReport.text
    && ['已複製', '請長按上面報告'].includes(perfReport.feedback)
    && perfReport.copyHeight >= 44, perfReport);

// T4：轉向反轉係逃生門——反轉之後同一個輸入要行相反方向
const inv = await page.evaluate(async () => {
    const THREE = await import('three');
    const { car, track, input } = window.__racer;
    const PLANE = { isDrivable: () => true, isWall: () => false };
    const run = () => {
        car.reset(track.startPos, track.startDir);
        const start = car.pos.clone();
        for (let i = 0; i < 90; i++) {
            // 直接行 input.read 出嚟嘅指令，先至覆蓋到 invert 呢一層
            input.steerSmooth = 1;
            car.update(1 / 60, { ...input.read(1 / 60), throttle: 0.9 }, PLANE);
        }
        return car.pos.clone().sub(start);
    };
    const fwd = new THREE.Vector3(track.startDir.x, 0, track.startDir.z).normalize();
    const camRight = new THREE.Vector3(-fwd.z, 0, fwd.x);
    input.setInvert(false);
    const normal = run().normalize().dot(camRight);
    input.setInvert(true);
    const flipped = run().normalize().dot(camRight);
    input.setInvert(false);
    return { normal: +normal.toFixed(3), flipped: +flipped.toFixed(3), saved: localStorage.getItem('racer-invert-steer') };
});
console.log('  ', JSON.stringify(inv));
check('預設：撳右向畫面右', inv.normal > 0.1, inv);
check('反轉之後：撳右向畫面左', inv.flipped < -0.1, inv);
check('反轉設定會存返', inv.saved === '0', inv.saved);

// 改轉向唔可以順手再綁一次對手／幽靈 listener；舊版每撳一次「正常／反轉」
// 就多一個 handler，之後一次對手 click 會重複寫設定。
const listenerGate = await page.evaluate(() => {
    const proto = Object.getPrototypeOf(localStorage);
    const original = proto.setItem;
    let rivalWrites = 0;
    proto.setItem = function (key, value) {
        if (key === 'racer-rivals') rivalWrites += 1;
        return original.call(this, key, value);
    };
    try {
        document.querySelector('#steer-seg button[data-invert="1"]').click();
        document.querySelector('#rival-seg button[data-rivals="2"]').click();
    } finally {
        proto.setItem = original;
        window.__racer.input.setInvert(false);
        window.__racer.setRivals(0);
    }
    return { rivalWrites };
});
console.log('  ', JSON.stringify(listenerGate));
check('改轉向之後對手設定仍只觸發一次', listenerGate.rivalWrites === 1, listenerGate);

// T5：陀螺儀——傾側會變成軚，手指有輸入時以手指優先
const gyro = await page.evaluate(() => {
    const { input } = window.__racer;
    input.gyro.on = true; input.gyro.zero = 0;
    const at = (tilt, touchLeft = false) => {
        input.gyro.tilt = tilt;
        input.touch.left = touchLeft;
        input.steerSmooth = touchLeft ? -1 : 0;
        const s = input.read(1 / 60).steer;
        input.touch.left = false;
        return +s.toFixed(3);
    };
    const out = {
        flat: at(0), right: at(22), left: at(-22),
        small: at(1), touchWins: at(22, true),
    };
    input.gyro.on = false; input.gyro.tilt = 0;
    return out;
});
console.log('  ', JSON.stringify(gyro));
check('打平唔會自己轉', gyro.flat === 0, gyro.flat);
check('向右傾 = 向右轉', gyro.right > 0.9, gyro.right);
check('向左傾 = 向左轉', gyro.left < -0.9, gyro.left);
check('細微晃動有死區', gyro.small === 0, gyro.small);
check('撳住掣嘅時候以手指為準', gyro.touchWins < 0, gyro.touchWins);

// T5b：真 DOM pointer 路徑要收到類比搖桿 + 油門兩隻手指；blur 後全部回中。
const touch = await page.evaluate(() => {
    const root = window.__racer;
    const { input } = root;
    root.startRace();
    input.setInvert(false);
    const fire = (id, type, pointerId, coords = {}) => document.getElementById(id).dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerType: 'touch', pointerId, ...coords,
    }));
    const stick = document.getElementById('steer-stick');
    const zone = document.getElementById('steer-zone');
    const z = zone.getBoundingClientRect();
    fire('pad-gas', 'pointerdown', 11);
    // 喺原本圓盤之外起手，再拖出整個左手區；只要未放手就要持續右軚。
    fire('steer-zone', 'pointerdown', 12, {
        clientX: z.left + z.width * 0.78,
        clientY: z.top + z.height * 0.5,
    });
    fire('steer-zone', 'pointermove', 12, {
        clientX: z.right + 120,
        clientY: z.top + z.height * 0.5,
    });
    const held = input.read(1);
    const atDrag = {
        aria: stick.getAttribute('aria-valuenow'),
        knob: document.getElementById('steer-knob').style.transform,
        baseLeft: stick.getBoundingClientRect().left - z.left,
    };
    dispatchEvent(new Event('blur'));
    const released = input.read(1);
    const result = {
        held, atDrag, released,
        heldControls: document.querySelectorAll('.pad-btn.held, .steer-stick.held').length,
        ariaAfter: stick.getAttribute('aria-valuenow'),
        knobAfter: document.getElementById('steer-knob').style.transform,
    };
    root.pauseRace('搖桿測試完成');
    root.toMenu();
    return result;
});
console.log('  ', JSON.stringify(touch));
check('圓盤外起手／拖出感應區仍可兩指油門 + 持續右軚', touch.held.throttle === 1
    && touch.held.steer > 0.9 && Number(touch.atDrag.aria) > 90
    && touch.atDrag.baseLeft > 20 && touch.atDrag.knob.includes('translate'), touch);
check('離開頁面會清走油門兼令搖桿回中', touch.released.throttle === 0
    && touch.released.steer === 0 && touch.heldControls === 0
    && touch.ariaAfter === '0' && touch.knobAfter === '', touch);

// 右拇指唔使放手重撳：由油門向左／左上滑，應即時切換煞車／飄移。
const actionSlide = await page.evaluate(() => {
    const root = window.__racer;
    const { input } = root;
    root.startRace();
    const gas = document.getElementById('pad-gas');
    const r = gas.getBoundingClientRect();
    const fire = (type, x, y) => gas.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerType: 'touch', pointerId: 21,
        clientX: x, clientY: y,
    }));
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    fire('pointerdown', cx, cy);
    const gasHeld = input.read(1 / 60);
    fire('pointermove', cx - r.width * 0.75, cy);
    const brakeHeld = input.read(1 / 60);
    fire('pointermove', cx - r.width * 0.75, cy - r.height * 0.75);
    const driftHeld = input.read(1 / 60);
    const driftLit = document.getElementById('pad-drift').classList.contains('held');
    fire('pointermove', cx, cy);
    const gasAgain = input.read(1 / 60);
    fire('pointerup', cx, cy);
    const released = input.read(1 / 60);
    root.pauseRace('滑動 action 測試完成');
    root.toMenu();
    return { gasHeld, brakeHeld, driftHeld, driftLit, gasAgain, released };
});
console.log('  ', JSON.stringify(actionSlide));
check('按住油門滑向煞車／飄移可連續切換並滑返油門',
    actionSlide.gasHeld.throttle === 1
    && actionSlide.brakeHeld.throttle === -1
    && actionSlide.driftHeld.throttle === 0 && actionSlide.driftHeld.handbrake
    && actionSlide.driftLit && actionSlide.gasAgain.throttle === 1
    && actionSlide.released.throttle === 0 && !actionSlide.released.handbrake,
    actionSlide);

// Mobile Safari／Android 系統 gesture 可以直接收走 pointer capture；唔一定先送 pointerup。
const captureLoss = await page.evaluate(() => {
    const root = window.__racer;
    const { input } = root;
    root.startRace();
    const fire = (id, type, pointerId, coords = {}) => document.getElementById(id).dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerType: 'touch', pointerId, ...coords,
    }));
    const stick = document.getElementById('steer-stick');
    const r = stick.getBoundingClientRect();
    fire('pad-gas', 'pointerdown', 31);
    fire('steer-zone', 'pointerdown', 32, { clientX: r.right, clientY: r.top + r.height / 2 });
    fire('steer-zone', 'pointermove', 32, { clientX: r.right + r.width, clientY: r.top + r.height / 2 });
    input.read(1);
    const before = { gas: input.touch.gas, steer: input.touch.steer, pointers: input.touchPointers.size };
    fire('pad-gas', 'lostpointercapture', 31);
    fire('steer-zone', 'lostpointercapture', 32);
    const afterRead = input.read(1);
    const after = {
        gas: input.touch.gas, steer: input.touch.steer, pointers: input.touchPointers.size,
        held: document.querySelectorAll('.pad-btn.held, .steer-stick.held').length,
        aria: stick.getAttribute('aria-valuenow'),
        knob: document.getElementById('steer-knob').style.transform,
    };
    root.pauseRace('capture-loss 測試完成');
    root.toMenu();
    return { before, afterRead, after };
});
console.log('  ', JSON.stringify(captureLoss));
check('pointer capture 被系統收走會即刻放油兼回中', captureLoss.before.gas
    && captureLoss.before.steer > 0.9 && captureLoss.before.pointers === 2
    && captureLoss.afterRead.throttle === 0 && captureLoss.afterRead.steer === 0
    && !captureLoss.after.gas && captureLoss.after.steer === 0 && captureLoss.after.pointers === 0
    && captureLoss.after.held === 0 && captureLoss.after.aria === '0' && captureLoss.after.knob === '', captureLoss);

// T5c：暫停要凍結 running、清 input、顯示 overlay；恢復同返 menu 都要完整。
const lifecycle = await page.evaluate(async () => {
    const root = window.__racer;
    const ownWake = Object.getOwnPropertyDescriptor(navigator, 'wakeLock');
    let releases = 0;
    Object.defineProperty(navigator, 'wakeLock', {
        configurable: true,
        value: {
            request: async () => ({
                addEventListener() {},
                async release() { releases += 1; },
            }),
        },
    });
    root.startRace();
    root.input.touch.gas = true;
    root.input.steerSmooth = 1;
    const didPause = root.pauseRace('自動化暫停測試');
    const atPause = {
        running: root.running, paused: root.paused,
        gas: root.input.touch.gas, steer: root.input.steerSmooth,
        shown: !document.getElementById('screen-pause').classList.contains('hidden'),
        reason: document.getElementById('pause-reason').textContent,
    };
    const didResume = root.resumeRace();
    await new Promise(r => setTimeout(r, 80));
    const atResume = {
        running: root.running, paused: root.paused,
        hidden: document.getElementById('screen-pause').classList.contains('hidden'),
        wakeActive: root.wakeLockActive,
    };
    root.pauseRace();
    await new Promise(r => setTimeout(r, 30));
    const wakeAfterPause = root.wakeLockActive;
    root.toMenu();
    const atMenu = {
        running: root.running, paused: root.paused,
        menu: !document.getElementById('screen-start').classList.contains('hidden'),
        hud: document.getElementById('hud').classList.contains('hidden'),
    };
    if (ownWake) Object.defineProperty(navigator, 'wakeLock', ownWake);
    else delete navigator.wakeLock;
    return { didPause, didResume, atPause, atResume, wakeAfterPause, releases, atMenu };
});
console.log('  ', JSON.stringify(lifecycle));
check('暫停會凍結比賽、清 input、顯示原因', lifecycle.didPause
    && !lifecycle.atPause.running && lifecycle.atPause.paused
    && !lifecycle.atPause.gas && lifecycle.atPause.steer === 0
    && lifecycle.atPause.shown && lifecycle.atPause.reason.includes('自動化'), lifecycle);
check('恢復會重新 running 並收起 overlay', lifecycle.didResume
    && lifecycle.atResume.running && !lifecycle.atResume.paused && lifecycle.atResume.hidden, lifecycle);
check('Wake Lock 會比賽時保持亮屏、暫停／過期 request 會釋放',
    lifecycle.atResume.wakeActive && !lifecycle.wakeAfterPause && lifecycle.releases === 2, lifecycle);
check('暫停後返回選單會清乾淨 lifecycle', !lifecycle.atMenu.running
    && !lifecycle.atMenu.paused && lifecycle.atMenu.menu && lifecycle.atMenu.hud, lifecycle);

// T5d：真 WebGL context loss 要凍結比賽；GPU 回復後畀玩家明確繼續。
const gpuRecovery = await page.evaluate(async () => {
    const root = window.__racer;
    const ext = root.renderer.getContext().getExtension('WEBGL_lose_context');
    if (!ext) return { supported: false };
    root.startRace();
    root.input.touch.gas = true;
    root.input.steerSmooth = 1;
    ext.loseContext();
    await new Promise(r => setTimeout(r, 180));
    const atLoss = {
        lost: root.contextLost, running: root.running, paused: root.paused,
        gas: root.input.touch.gas, steer: root.input.steerSmooth,
        overlay: !document.getElementById('screen-pause').classList.contains('hidden'),
        disabled: document.getElementById('resume-btn').disabled,
        menuDisabled: document.getElementById('pause-menu-btn').disabled,
        reload: !document.getElementById('reload-btn').classList.contains('hidden'),
        reason: document.getElementById('pause-reason').textContent,
    };
    const beforeRestore = root.renderCount;
    ext.restoreContext();
    const limit = performance.now() + 3000;
    while (root.contextLost && performance.now() < limit) await new Promise(r => setTimeout(r, 40));
    if (!root.contextLost) await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const atRestore = {
        lost: root.contextLost,
        disabled: document.getElementById('resume-btn').disabled,
        menuDisabled: document.getElementById('pause-menu-btn').disabled,
        reload: !document.getElementById('reload-btn').classList.contains('hidden'),
        reason: document.getElementById('pause-reason').textContent,
        frames: root.renderCount - beforeRestore,
        calls: root.renderer.info.render.calls,
        tris: root.renderer.info.render.triangles,
    };
    const resumed = root.resumeRace();
    root.pauseRace();
    root.toMenu();
    return { supported: true, atLoss, atRestore, resumed };
});
console.log('  ', JSON.stringify(gpuRecovery));
check('WebGL context loss 會凍結物理、清 input、顯示 reload fallback', gpuRecovery.supported
    && gpuRecovery.atLoss.lost && !gpuRecovery.atLoss.running && gpuRecovery.atLoss.paused
    && !gpuRecovery.atLoss.gas && gpuRecovery.atLoss.steer === 0 && gpuRecovery.atLoss.overlay
    && gpuRecovery.atLoss.disabled && gpuRecovery.atLoss.menuDisabled && gpuRecovery.atLoss.reload
    && gpuRecovery.atLoss.reason.includes('3D'), gpuRecovery);
check('WebGL context restored 後只容許玩家明確繼續', !gpuRecovery.atRestore?.lost
    && !gpuRecovery.atRestore?.disabled && !gpuRecovery.atRestore?.menuDisabled
    && !gpuRecovery.atRestore?.reload
    && gpuRecovery.atRestore?.reason.includes('已恢復') && gpuRecovery.atRestore?.frames >= 1
    && gpuRecovery.atRestore?.calls > 0 && gpuRecovery.atRestore?.tris > 0
    && gpuRecovery.resumed, gpuRecovery);

// T5e：旋轉手機會搬走操控掣，先清 input 暫停，唔可以黐住油門繼續衝。
const rotatePause = await page.evaluate(async () => {
    const root = window.__racer;
    root.startRace();
    root.input.touch.gas = true;
    root.input.steerSmooth = -1;
    dispatchEvent(new Event('orientationchange'));
    await new Promise(r => setTimeout(r, 180));
    const out = {
        running: root.running, paused: root.paused,
        gas: root.input.touch.gas, steer: root.input.steerSmooth,
        reason: document.getElementById('pause-reason').textContent,
    };
    root.toMenu();
    return out;
});
console.log('  ', JSON.stringify(rotatePause));
check('旋轉手機會安全暫停兼清走黐住嘅操控', !rotatePause.running && rotatePause.paused
    && !rotatePause.gas && rotatePause.steer === 0 && rotatePause.reason.includes('方向'), rotatePause);

// T5f：非比賽畫面唔可以繼續 60 fps 燒 GPU；設定改動就只補畫一幀。
const idleRender = await page.evaluate(async () => {
    const root = window.__racer;
    root.toMenu();
    await new Promise(r => setTimeout(r, 250));
    const menuStart = root.renderCount;
    await new Promise(r => setTimeout(r, 500));
    const menuEnd = root.renderCount;
    root.setTod(root.tod === 'day' ? 'night' : 'day');
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const afterSetting = root.renderCount;
    await new Promise(r => setTimeout(r, 500));
    const settled = root.renderCount;
    root.setTod('day');
    return {
        idleFrames: menuEnd - menuStart,
        settingFrames: afterSetting - menuEnd,
        settledFrames: settled - afterSetting,
    };
});
console.log('  ', JSON.stringify(idleRender));
check('Menu／暫停唔會持續重畫 3D 世界', idleRender.idleFrames === 0, idleRender);
check('改設定只會按需補畫，之後再休眠', idleRender.settingFrames >= 1
    && idleRender.settingFrames <= 2 && idleRender.settledFrames === 0, idleRender);

// T5g：最窄常見手機都要完整見到搖桿同三粒 action 掣，暫停掣唔撞 HUD。
await page.setViewportSize({ width: 320, height: 568 });
const narrow = await page.evaluate(() => {
    const root = window.__racer;
    root.startRace();
    const rect = el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const buttons = [...document.querySelectorAll('.pad-btn')].map(el => ({
        id: el.id, ...rect(el), radius: getComputedStyle(el).borderRadius,
    }));
    const stickEl = document.getElementById('steer-stick');
    const knobEl = document.getElementById('steer-knob');
    const stick = { id: stickEl.id, ...rect(stickEl), radius: getComputedStyle(stickEl).borderRadius };
    const knob = { id: knobEl.id, ...rect(knobEl), radius: getComputedStyle(knobEl).borderRadius };
    const pause = rect(document.getElementById('pause-btn'));
    const firstStat = rect(document.querySelector('#hud-top .stat'));
    const overlap = Math.max(0, Math.min(pause.right, firstStat.right) - Math.max(pause.left, firstStat.left))
        * Math.max(0, Math.min(pause.bottom, firstStat.bottom) - Math.max(pause.top, firstStat.top));
    root.pauseRace();
    root.toMenu();
    return { viewport: [innerWidth, innerHeight], buttons, stick, knob, pause, firstStat, overlap };
});
console.log('  ', JSON.stringify(narrow));
const narrowControls = [...narrow.buttons, narrow.stick];
check('320px 直向搖桿同三粒 action 完整留喺 viewport', narrowControls.every(b =>
    b.left >= 0 && b.right <= narrow.viewport[0] && b.top >= 0 && b.bottom <= narrow.viewport[1]), narrow);
check('窄屏 action 守住 44px、放大搖桿至少 116px，而且暫停掣唔撞 HUD', narrow.buttons.every(b =>
    b.width >= 44 && b.height >= 44) && narrow.stick.width >= 116
    && narrow.pause.width >= 44 && narrow.overlap === 0, narrow);
check('搖桿、圓芯同三粒 action 全部係正圓形', [...narrow.buttons, narrow.stick, narrow.knob].every(b =>
    b.width === b.height && b.radius === '50%'), narrow);
const gasButton = narrow.buttons.find(b => b.id === 'pad-gas');
const brakeButton = narrow.buttons.find(b => b.id === 'pad-brake');
const driftButton = narrow.buttons.find(b => b.id === 'pad-drift');
check('右手控制係主油門 + 煞車／飄移弧形層級', gasButton.width > brakeButton.width
    && gasButton.width > driftButton.width && brakeButton.left < gasButton.left
    && driftButton.top < brakeButton.top, narrow.buttons);

// iPhone 橫屏瀏海可以喺任何一邊；兩邊 inset 必須獨立生效。
await page.setViewportSize({ width: 844, height: 390 });
const safeArea = await page.evaluate(() => {
    document.documentElement.style.setProperty('--safe-left', '34px');
    document.documentElement.style.setProperty('--safe-right', '52px');
    document.documentElement.style.setProperty('--safe-bottom', '21px');
    const root = window.__racer;
    root.startRace();
    const rect = id => document.getElementById(id).getBoundingClientRect().toJSON();
    const out = {
        viewport: [innerWidth, innerHeight],
        viewportMeta: document.querySelector('meta[name="viewport"]').content,
        stick: rect('steer-stick'), gas: rect('pad-gas'),
    };
    root.pauseRace('safe-area 測試完成');
    root.toMenu();
    document.documentElement.style.removeProperty('--safe-left');
    document.documentElement.style.removeProperty('--safe-right');
    document.documentElement.style.removeProperty('--safe-bottom');
    return out;
});
console.log('  ', JSON.stringify(safeArea));
check('左右不對稱瀏海 safe-area 各自保護搖桿同油門', safeArea.viewportMeta.includes('viewport-fit=cover')
    && safeArea.stick.left >= 34 && safeArea.viewport[0] - safeArea.gas.right >= 52
    && safeArea.viewport[1] - safeArea.stick.bottom >= 21 && safeArea.stick.width >= 152
    && safeArea.viewport[1] - safeArea.gas.bottom >= 21, safeArea);
await page.setViewportSize({ width: 667, height: 375 });
const shortLandscape = await page.evaluate(() => {
    const root = window.__racer;
    root.startRace();
    const rect = id => {
        const r = document.getElementById(id).getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    };
    const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
        * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const speed = rect('speed-box'), map = rect('minimap'), gas = rect('pad-gas');
    const out = { viewport: [innerWidth, innerHeight], speed, map, gas,
        mapOverlap: overlap(speed, map), gasOverlap: overlap(speed, gas) };
    root.pauseRace();
    root.toMenu();
    return out;
});
console.log('  ', JSON.stringify(shortLandscape));
check('667×375 橫向速度錶唔遮 minimap 或油門', shortLandscape.speed.right > 0
    && shortLandscape.map.right > 0 && shortLandscape.gas.right > 0
    && shortLandscape.mapOverlap === 0 && shortLandscape.gasOverlap === 0, shortLandscape);
await page.setViewportSize({ width: 900, height: 760 });

// T6：賽道縮圖畫得出嘢，而且換賽道會跟住換
const map = await page.evaluate(() => {
    const { minimap, car, buildTrack } = window.__racer;
    const cv = document.getElementById('minimap');
    const ink = () => {
        const g = cv.getContext('2d');
        const d = g.getImageData(0, 0, cv.width, cv.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
        return n;
    };
    buildTrack('turbo');
    minimap.draw(car);
    const a = ink();
    buildTrack('touge');
    minimap.draw(car);
    const b = ink();
    return { turbo: a, touge: b };
});
console.log('  ', JSON.stringify(map));
check('縮圖畫到賽道', map.turbo > 800, map.turbo);
check('換賽道縮圖跟住換', Math.abs(map.turbo - map.touge) > 40, map);

// T7：Penny 實測嗰個次序——撳油門 → 拉上去 → 放手 → 撳煞車 → 換返油門。
// 舊做法三粒掣各自 capture，手指鎖死喺第一粒；而且「滑去其他掣」淨係認
// 向左移動，但三粒掣係打直疊住嘅。呢一組就係守住呢兩件事。
const cluster = await page.evaluate(async () => {
    const { input } = window.__racer;
    // 要量得到掣嘅位置，HUD 一定要顯示緊
    document.getElementById('hud').classList.remove('hidden');
    input.reset(document);
    const at = (id) => {
        const r = document.getElementById(id).getBoundingClientRect();
        return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    };
    const fire = (id, type, pointerId, coords) => document.getElementById(id)
        .dispatchEvent(new PointerEvent(type, {
            bubbles: true, cancelable: true, pointerId, pointerType: 'touch', ...coords,
        }));
    const snap = () => ({ ...input.read(1 / 60) });
    const out = {};

    // 1. 撳油門
    fire('pad-gas', 'pointerdown', 1, at('pad-gas'));
    out.gasDown = snap();
    // 2. 唔放手，拉上去飄移
    fire('pad-gas', 'pointermove', 1, at('pad-drift'));
    out.slidToDrift = snap();
    // 3. 再拉去煞車
    fire('pad-gas', 'pointermove', 1, at('pad-brake'));
    out.slidToBrake = snap();
    // 4. 放手
    fire('pad-gas', 'pointerup', 1, at('pad-brake'));
    out.released = snap();
    // 5. 直接撳煞車
    fire('pad-brake', 'pointerdown', 2, at('pad-brake'));
    out.brakeDown = snap();
    fire('pad-brake', 'pointerup', 2, at('pad-brake'));
    // 6. 換返去油門——舊版就係喺呢一步冇反應
    fire('pad-gas', 'pointerdown', 3, at('pad-gas'));
    out.gasAgain = snap();
    // 7. 兩隻手指：踩住油門再撳手煞（甩尾基本手法）
    fire('pad-drift', 'pointerdown', 4, at('pad-drift'));
    out.bothFingers = snap();
    fire('pad-drift', 'pointerup', 4, at('pad-drift'));
    out.afterDriftUp = snap();
    fire('pad-gas', 'pointerup', 3, at('pad-gas'));
    out.allUp = snap();
    out.leftover = input.touchPointers.size;
    return out;
});
console.log('  ', JSON.stringify(cluster));
check('撳油門 = 加速', cluster.gasDown.throttle === 1, cluster.gasDown);
check('唔放手拉上去飄移會轉做手煞',
    cluster.slidToDrift.handbrake === true && cluster.slidToDrift.throttle === 0, cluster.slidToDrift);
check('再拉去煞車會轉做煞車',
    cluster.slidToBrake.throttle === -1 && cluster.slidToBrake.handbrake === false, cluster.slidToBrake);
check('放手全部清返', cluster.released.throttle === 0 && cluster.released.handbrake === false, cluster.released);
check('直接撳煞車有反應', cluster.brakeDown.throttle === -1, cluster.brakeDown);
check('煞完換返去油門要有反應', cluster.gasAgain.throttle === 1, cluster.gasAgain);
check('踩住油門同時撳手煞（甩尾手法）',
    cluster.bothFingers.throttle === 1 && cluster.bothFingers.handbrake === true, cluster.bothFingers);
check('放開手煞油門照踩住',
    cluster.afterDriftUp.throttle === 1 && cluster.afterDriftUp.handbrake === false, cluster.afterDriftUp);
check('全部放手唔會有殘留',
    cluster.allUp.throttle === 0 && cluster.leftover === 0, cluster);

checkNoErrors(r.errors);
await r.close();
finish('setup');
