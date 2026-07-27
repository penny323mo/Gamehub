// 起跑線位置、順滑 3D renderer、設定（車色／日夜／轉向／陀螺儀）、賽道縮圖。
//
// 呢個檔案守住嘅係「Penny 一眼睇到」嗰批嘢：起跑線唔可以落喺彎中、
// 賽道唔可以退化成格仔地板、揀完設定要真係生效兼記得住。

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;
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
    check(`${id}：起跑線打橫鋪滿成條路`, info.halfSpan >= 10, info.halfSpan);
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

// Penny 指定車身視覺比例放大 50%：4.6 -> 6.9；物理參數唔跟住改。
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
check('玩家車身視覺長度放大 50% 至 6.9', carScale.target === 6.9
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
    setTod('night');
    return {
        red, blue, changed: red !== blue,
        tod: window.__racer.tod,
        savedColour: localStorage.getItem('racer-colour'),
        savedTod: localStorage.getItem('racer-tod'),
    };
});
console.log('  ', JSON.stringify(set));
check('揀顏色會噴到車身', set.changed, set);
check('顏色會存返落 localStorage', set.savedColour === 'blue', set.savedColour);
check('揀夜晚會生效兼存返', set.tod === 'night' && set.savedTod === 'night', set);

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

// T5b：真 DOM pointer 路徑要同時收到兩隻手指；blur 後唔可以卡住油門。
const touch = await page.evaluate(() => {
    const { input } = window.__racer;
    input.setInvert(false);
    const fire = (id, type, pointerId) => document.getElementById(id).dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerType: 'touch', pointerId,
    }));
    fire('pad-gas', 'pointerdown', 11);
    fire('pad-right', 'pointerdown', 12);
    input.steerSmooth = 1;
    const held = input.read(1 / 60);
    dispatchEvent(new Event('blur'));
    const released = input.read(1 / 60);
    return { held, released, heldButtons: document.querySelectorAll('.pad-btn.held').length };
});
console.log('  ', JSON.stringify(touch));
check('兩指油門 + 右軚可以同時成立', touch.held.throttle === 1 && touch.held.steer > 0.9, touch);
check('離開頁面會清走黐住嘅觸控', touch.released.throttle === 0 && touch.heldButtons === 0, touch);

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

// T5d：非比賽畫面唔可以繼續 60 fps 燒 GPU；設定改動就只補畫一幀。
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

// T5e：最窄常見手機都要完整見到五粒掣，暫停掣唔可以遮住圈數 HUD。
await page.setViewportSize({ width: 320, height: 568 });
const narrow = await page.evaluate(() => {
    const root = window.__racer;
    root.startRace();
    const rect = el => {
        const r = el.getBoundingClientRect();
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    const buttons = [...document.querySelectorAll('.pad-btn')].map(el => ({ id: el.id, ...rect(el) }));
    const pause = rect(document.getElementById('pause-btn'));
    const firstStat = rect(document.querySelector('#hud-top .stat'));
    const overlap = Math.max(0, Math.min(pause.right, firstStat.right) - Math.max(pause.left, firstStat.left))
        * Math.max(0, Math.min(pause.bottom, firstStat.bottom) - Math.max(pause.top, firstStat.top));
    root.pauseRace();
    root.toMenu();
    return { viewport: [innerWidth, innerHeight], buttons, pause, firstStat, overlap };
});
console.log('  ', JSON.stringify(narrow));
check('320px 直向五粒操控掣完整留喺 viewport', narrow.buttons.every(b =>
    b.left >= 0 && b.right <= narrow.viewport[0] && b.top >= 0 && b.bottom <= narrow.viewport[1]), narrow);
check('窄屏觸控掣守住 44px，而且暫停掣唔撞 HUD', narrow.buttons.every(b =>
    b.width >= 44 && b.height >= 44) && narrow.pause.width >= 44 && narrow.overlap === 0, narrow);
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

checkNoErrors(r.errors);
await r.close();
finish('setup');
