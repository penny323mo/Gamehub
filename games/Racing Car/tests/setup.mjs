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
        favicon: document.querySelector('link[rel="icon"]')?.href ?? '',
    };
});
console.log('  ', JSON.stringify(startupWarm));
check('第一個完整 3D frame 後先揭選單，並已預熱 HUD／minimap', startupWarm.ready
    && startupWarm.loadingHidden && startupWarm.menuVisible && startupWarm.ink > 1000
    && startupWarm.speed === '0' && startupWarm.lap === '1/3', startupWarm);
check('遊戲自帶 favicon，production 唔會再請求網站根目錄 404',
    startupWarm.favicon.startsWith('data:image/svg+xml,'), startupWarm.favicon);

const speedLayer = await page.evaluate(() => {
    const el = document.getElementById('speed-lines');
    const css = el ? getComputedStyle(el) : null;
    return {
        exists: !!el,
        ariaHidden: el?.getAttribute('aria-hidden') === 'true',
        pointerEvents: css?.pointerEvents,
        position: css?.position,
    };
});
console.log('  ', JSON.stringify(speedLayer));
check('高速速度層存在但唔會攔截 HUD／觸控', speedLayer.exists
    && speedLayer.ariaHidden && speedLayer.pointerEvents === 'none'
    && speedLayer.position === 'absolute', speedLayer);

const speedFeedback = await page.evaluate(() => {
    const { car, updateHudForTest } = window.__racer;
    const before = car.vel.clone();
    car.vel.set(0, 0, 24); // 約 86 km/h：唔應該等到極速先有速度感
    updateHudForTest();
    const el = document.getElementById('speed-lines');
    const out = {
        speed: car.kmh,
        active: el?.classList.contains('active'),
        opacity: Number.parseFloat(getComputedStyle(el).opacity),
    };
    car.vel.copy(before);
    updateHudForTest();
    return out;
});
console.log('  ', JSON.stringify(speedFeedback));
check('約 86 km/h 已有漸進速度回饋', speedFeedback.speed >= 80
    && speedFeedback.active && speedFeedback.opacity > 0.2, speedFeedback);

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
            landmarks: track.landmarkCount,
        };
    }, id);
    console.log('  ', JSON.stringify(info));
    // 半徑 180 米以上，喺 60 米嘅起步區內偏離中線唔夠 2.5 米，肉眼就係直路
    check(`${id}：起跑線喺直路（半徑 >180）`, info.straightR > 180, info.straightR);
    check(`${id}：起跑線鋪滿擴闊後行車面`, info.halfSpan >= 13.5, info.halfSpan);
    check(`${id}：有足夠彎位導向地標`, info.landmarks >= 6 && info.landmarks <= 14, info.landmarks);
}

// T2：畫面係連續 ribbon，而物理格網只留喺幕後做判定。
const geo = await page.evaluate(async () => {
    const { BLOCK } = await import('./src/track.js');
    const { car, track, renderer } = window.__racer;
    const image = track.road.material.map?.image;
    const N = image?.width ?? 0, data = image?.data ?? [];
    let centreBright = 0, edgeBright = 0;
    for (let x = 0; x < N; x++) {
        centreBright = Math.max(centreBright, data[((N >> 1) * N + x) * 4] ?? 0);
        edgeBright = Math.max(edgeBright, data[(8 * N + x) * 4] ?? 0);
    }
    return {
        gridCell: BLOCK, cells: track.cellCount,
        style: track.visualStyle, segments: track.visualSegments,
        querySamples: track.querySamples instanceof Float32Array
            ? track.querySamples.length / 2 : 0,
        querySampleCount: track.querySampleCount,
        nextPositionScratch: car._nextPos?.isVector3 === true,
        centreBright, edgeBright,
        posts: track.wallCount, trees: track.treeCount,
        landmarks: {
            count: track.landmarkCount,
            meshCount: track.landmarks?.count ?? 0,
            name: track.landmarks?.name ?? '',
            instanced: track.landmarks?.isInstancedMesh === true,
            material: track.landmarks?.material?.type ?? '',
            placement: (() => {
                const mesh = track.landmarks;
                const values = mesh?.instanceMatrix?.array ?? [];
                let minLateral = Infinity, maxLateral = -Infinity, minHeight = Infinity;
                for (let i = 0; i < (mesh?.count ?? 0); i++) {
                    const o = i * 16, x = values[o + 12], z = values[o + 14], y = values[o + 13];
                    const t = track.nearestT(x, z), p = track.curve.getPointAt(t);
                    const tangent = track.curve.getTangentAt(t);
                    const signedLateral = (x - p.x) * -tangent.z + (z - p.z) * tangent.x;
                    const lateral = Math.hypot(x - p.x, z - p.z);
                    minLateral = Math.min(minLateral, lateral);
                    maxLateral = Math.max(maxLateral, lateral);
                    minHeight = Math.min(minHeight,
                        y - (track.surfaceYAtT(t) + signedLateral * Math.sin(track.surfaceBankAtT(t))));
                }
                return {
                    minLateral: +minLateral.toFixed(2),
                    maxLateral: +maxLateral.toFixed(2),
                    minHeight: +minHeight.toFixed(2),
                };
            })(),
        },
        calls: renderer.info.render.calls,
        tris: renderer.info.render.triangles,
        surfaceY: [track.surfaceMinY, track.surfaceMaxY],
        elevation: track.elevation,
        surfaceBank: Math.max(...Array.from({ length: 32 }, (_, i) =>
            Math.abs(track.surfaceBankAtT(i / 32)))),
        surfacePitch: Math.max(...Array.from({ length: 240 }, (_, i) =>
            Math.abs(track.surfacePitchAtT(i / 240)))),
        profileSeam: {
            height: Math.abs(track.surfaceYAtT(0) - track.surfaceYAtT(1)),
            pitch: Math.abs(track.surfacePitchAtT(0) - track.surfacePitchAtT(1)),
        },
        startSurfaceY: track.surfaceYAtT(track.startT),
        startSurfacePitch: track.surfacePitchAtT(track.startT),
        carRenderY: car.renderY,
        carTrackPitch: car.trackPitch,
        wheels: car.wheels.snapshot(),
        roadY: (() => {
            const ys = [];
            for (let i = 1; i < track.road.geometry.attributes.position.array.length; i += 3) {
                ys.push(track.road.geometry.attributes.position.array[i]);
            }
            return [Math.min(...ys), Math.max(...ys)];
        })(),
        terrainVertices: track.ground.geometry.attributes.position.count,
    };
});
console.log('  ', JSON.stringify(geo));
check('視覺層係連續曲線 ribbon', geo.style === 'smooth-ribbon', geo.style);
check('彎位取樣夠密（>=320 段）', geo.segments >= 320, geo.segments);
check('nearestT 會用預取 query samples（唔喺每幀重建曲線點）',
    geo.querySamples === 240 && geo.querySampleCount === 240, geo);
check('車輛碰撞試探會重用 scratch position', geo.nextPositionScratch === true, geo);
check('柏油有低對比中線／車轍參照而唔新增 draw call',
    geo.centreBright >= geo.edgeBright + 45, geo);
check('有連續護欄支柱同賽道樹木', geo.posts > 200 && geo.trees >= 100, geo);
check('彎位有低成本外側 chevron 地標，唔再只靠重複樹木讀路',
    geo.landmarks.count >= 6 && geo.landmarks.count <= 14
    && geo.landmarks.meshCount === geo.landmarks.count
    && geo.landmarks.instanced && geo.landmarks.material === 'MeshBasicMaterial'
    && geo.landmarks.placement.minLateral > 15.5
    && geo.landmarks.placement.maxLateral < 20.5
    && geo.landmarks.placement.minHeight > 0.3
    && geo.landmarks.name === 'corner-chevron-landmarks', geo.landmarks);
check('賽道 render surface 有可讀坡度同 banking，唔再係近乎平路',
    geo.elevation >= 0.95 && geo.surfaceY[1] - geo.surfaceY[0] > 2.4
    && geo.roadY[1] - geo.roadY[0] > 3.2 && geo.surfacePitch > 0.014
    && geo.surfaceBank > 0.01, geo);
check('閉環起伏喺起點無縫接返，車身會跟縱向坡度俯仰',
    geo.profileSeam.height < 0.0001 && geo.profileSeam.pitch < 0.0001
    && geo.surfacePitch > 0.008 && Math.abs(geo.carTrackPitch - geo.startSurfacePitch) < 0.01, geo);
check('玩家車身起步 render pose 同路面高度對齊',
    Math.abs(geo.carRenderY - geo.startSurfaceY) < 0.01, geo);
check('rigid GLB 仍有四個輪胎 cluster 做 render-only 動畫',
    geo.wheels.enabled && geo.wheels.wheels === 4 && geo.wheels.vertices > 5000
    && geo.wheels.radius > 0.4, geo.wheels);
const wheelMotion = await page.evaluate(() => {
    const { car } = window.__racer;
    const mesh = car.root.getObjectByProperty('isMesh', true);
    const before = mesh.geometry.attributes.position.array.slice();
    car.wheels.update(1 / 30, 25, 0.42);
    const after = mesh.geometry.attributes.position.array;
    let changed = 0;
    for (let i = 0; i < after.length; i++) if (Math.abs(after[i] - before[i]) > 1e-6) changed++;
    const state = car.wheels.snapshot();
    car.wheels.reset();
    return { changed, state };
});
console.log('  ', JSON.stringify(wheelMotion));
check('車輪會按車速滾動同按前輪軚角轉向',
    wheelMotion.changed > 5000 && Math.abs(wheelMotion.state.angle) > 0.5
    && Math.abs(wheelMotion.state.steering) > 0.05, wheelMotion);
check('草地 mesh 會喺賽道附近銜接高度（仍然單一 terrain mesh）',
    geo.terrainVertices >= 32 * 32, geo.terrainVertices);
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

const exhaustFx = await page.evaluate(() => {
    const { car, drivingEffects: fx, track } = window.__racer;
    fx.reset();
    car.reset(track.startPos, track.startDir);
    car.vel.set(Math.sin(car.yaw) * 24, 0, Math.cos(car.yaw) * 24);
    for (let i = 0; i < 36; i++) fx.update(1 / 60, car, { throttle: 1, handbrake: false });
    const throttle = fx.snapshot();
    fx.reset();
    for (let i = 0; i < 36; i++) fx.update(1 / 60, car, { throttle: 0, handbrake: false });
    const coast = fx.snapshot();
    fx.reset();
    return { throttle, coast };
});
console.log('  ', JSON.stringify(exhaustFx));
check('直路全油有低成本尾氣脈衝，收油後唔留殘影',
    exhaustFx.throttle.particles > 0 && exhaustFx.coast.particles === 0,
    exhaustFx);

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
    root.input.setControlMode('simple');
    root.input.setInvert(false);
    root.input.setGyroSens(1.4);
    root.input.setGyroInvert(true);
    root.audio.setEnabled(true);
    root.startRace();
    // 等到真係取到樣先好報告。之前寫死等 220ms：機器一忙（run-all 連續開
    // 幾個瀏覽器）rAF 可以一幀都未行，於是 frames=0，個 gate 就無辜紅一次。
    // 呢個 flake 一直被當成「已知問題」，其實係測試等錯嘢。
    const deadline = Date.now() + 5000;
    while (root.performanceReport().frames < 3 && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 40));
    }
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
check('手機實測報告記低操控、陀螺儀方向／靈敏度、螢幕方向同音效狀態',
    perfReport.data.controlMode === 'simple' && perfReport.data.steerInverted === false
    && typeof perfReport.data.gyroSupported === 'boolean' && perfReport.data.gyroEnabled === false
    && perfReport.data.gyroInverted === true && perfReport.data.gyroSensitivity === 1.4
    && typeof perfReport.data.orientation === 'string'
    && Number.isFinite(perfReport.data.orientationAngle)
    && perfReport.data.audioEnabled === true && perfReport.data.audioBroken === false
    && perfReport.text.includes('操控 簡易/正常')
    && perfReport.text.includes('陀螺') && perfReport.text.includes('預設/靈敏 1.4')
    && perfReport.text.includes('方向 ') && perfReport.text.includes('音效 開'), perfReport);
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

// T5：簡易模式會自動加速，但煞車／漂移仍然即時接管，並記住玩家選擇。
const simpleMode = await page.evaluate(() => {
    const { input } = window.__racer;
    input.reset(document);
    const initialMode = input.controlMode;
    document.querySelector('#control-mode-seg [data-controls="simple"]').click();
    const cruise = input.read(1 / 60);
    input.touch.brake = true;
    const braking = input.read(1 / 60);
    input.touch.brake = false;
    input.touch.drift = true;
    const drifting = input.read(1 / 60);
    input.touch.drift = false;
    document.querySelector('#control-mode-seg [data-controls="standard"]').click();
    const standardIdle = input.read(1 / 60);
    document.querySelector('#control-mode-seg [data-controls="simple"]').click();
    return {
        initialMode, cruise, braking, drifting, standardIdle,
        saved: localStorage.getItem('racer-control-mode'),
        selected: document.querySelector('#control-mode-seg button.on')?.dataset.controls,
        bodyClass: document.body.classList.contains('simple-controls'),
        gasLabel: document.getElementById('pad-gas').getAttribute('aria-label'),
    };
});
console.log('  ', JSON.stringify(simpleMode));
check('新玩家預設用簡易模式', simpleMode.initialMode === 'simple', simpleMode.initialMode);
check('簡易模式放手都會自動加速，煞車就即時反轉', simpleMode.cruise.throttle === 1
    && simpleMode.braking.throttle === -1, simpleMode);
check('簡易模式拉手煞保留少量動力，仍可爽快漂移',
    simpleMode.drifting.handbrake && simpleMode.drifting.throttle > 0.6
    && simpleMode.drifting.throttle < 0.8, simpleMode.drifting);
check('切返標準模式放手唔會加速', simpleMode.standardIdle.throttle === 0, simpleMode.standardIdle);
check('簡易模式會保存並清楚標示自動加速', simpleMode.saved === 'simple'
    && simpleMode.selected === 'simple' && simpleMode.bodyClass
    && simpleMode.gasLabel.includes('自動'), simpleMode);

// T4b：畫面方向係一個手動設定，遊戲永遠唔會自己轉（ADR-074）。
// 兩次實機回饋堆埋一齊：先係打橫玩緊、用緊陀螺儀扭手機就彈「手機方向已
// 改變，進度已安全暫停」（ADR-072 攞走咗個暫停），跟住連一律強制打橫都
// 唔啱（ADR-073）。而家得兩個選擇，玩家揀邊個遊戲就做邊個。
const orient = await page.evaluate(() => {
    const { startRace, race } = window.__racer;
    startRace();
    race.countdown = 0; race.state = 'racing';
    dispatchEvent(new Event('orientationchange'));
    return {
        running: window.__racer.running, paused: window.__racer.paused,
        rotated: window.__racer.rotated,
    };
});
console.log('  ', JSON.stringify(orient));
check('扭手機唔會彈暫停',
    orient.running === true && orient.paused === false, orient);

// 預設「打直」：部機打直就跟住打直，唔可以偷偷轉 90°
await page.setViewportSize({ width: 420, height: 900 });
await page.waitForTimeout(260);
const readFrame = () => page.evaluate(() => {
    const el = document.getElementById('game-root');
    const box = el.getBoundingClientRect();
    const canvas = document.querySelector('#canvas-holder canvas');
    return {
        orient: window.__racer.orient,
        rotated: window.__racer.rotated,
        paused: window.__racer.paused,
        running: window.__racer.running,
        devicePortrait: window.__racer.portrait,
        // 轉咗 90° 之後，元素喺螢幕上嘅 AABB 係窄長嘅，但佢自己嘅版面
        // （offsetWidth/Height）先係遊戲座標
        gameW: el.offsetWidth,
        gameH: el.offsetHeight,
        screenBox: { w: Math.round(box.width), h: Math.round(box.height) },
        canvasAspect: canvas ? +(canvas.clientWidth / canvas.clientHeight).toFixed(2) : null,
        inputRotated: window.__racer.input.rotated,
        // canvas 一定要填滿個框：對唔上就係 Penny 講嘅「轉方向亂曬顯示」
        canvasFits: !!canvas && Math.abs(canvas.clientWidth - el.offsetWidth) <= 1
            && Math.abs(canvas.clientHeight - el.offsetHeight) <= 1,
        // 個框亦要等於 viewport（轉咗就係對調）
        frameFitsViewport: window.__racer.rotated
            ? Math.abs(el.offsetWidth - innerHeight) <= 1 && Math.abs(el.offsetHeight - innerWidth) <= 1
            : Math.abs(el.offsetWidth - innerWidth) <= 1 && Math.abs(el.offsetHeight - innerHeight) <= 1,
    };
});

const upright = await readFrame();
console.log('  ', JSON.stringify(upright));
check('預設係「打直」', upright.orient === 'portrait', upright.orient);
check('打直模式下部機打直，畫面唔會自己轉',
    upright.devicePortrait === true && upright.rotated === false
    && upright.gameH > upright.gameW, upright);
check('打直唔會暫停比賽',
    upright.paused === false && upright.running === true, upright);
check('打直模式下畫布跟住部機（直度）', upright.canvasAspect < 1, upright.canvasAspect);
check('打直模式下 input 唔會當自己轉咗', upright.inputRotated === false, upright);
check('打直模式下 canvas 填滿個框、個框等於 viewport',
    upright.canvasFits && upright.frameFitsViewport, upright);

// 手動撳「打橫」：同一部打直嘅機，畫面即刻變橫
await page.evaluate(() => document.querySelector('#orient-seg button[data-orient="landscape"]').click());
await page.waitForTimeout(260);
const portrait = await readFrame();
console.log('  ', JSON.stringify(portrait));
check('撳「打橫」之後遊戲版面變橫',
    portrait.orient === 'landscape' && portrait.rotated === true
    && portrait.gameW > portrait.gameH, portrait);
check('打橫模式下畫布係橫嘅（鏡頭比例啱）', portrait.canvasAspect > 1, portrait.canvasAspect);
check('打橫模式下 input 知道自己轉咗', portrait.inputRotated === true, portrait);
check('轉方向唔會暫停比賽',
    portrait.paused === false && portrait.running === true, portrait);
check('打橫模式下 canvas 填滿個框、個框等於對調咗嘅 viewport',
    portrait.canvasFits && portrait.frameFitsViewport, portrait);
const savedOrient = await page.evaluate(() => localStorage.getItem('racer-orient'));
check('畫面方向會記得住', savedOrient === 'landscape', savedOrient);

// iOS 會喺 viewport 真正變之前就派 orientationchange，嗰刻量到嘅仲係舊尺寸。
// 呢度就係咁樣整：暫時餵一個「打橫」嘅假尺寸，派一次 orientationchange，
// 睇住佢判錯，然後收返個假值——之後一個事件都唔派，靠補判自己追返。
const stale = await page.evaluate(async () => {
    const el = document.getElementById('game-root');
    const real = window.visualViewport;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    Object.defineProperty(window, 'visualViewport', {
        configurable: true, get: () => ({ width: 844, height: 390 }),
    });
    dispatchEvent(new Event('orientationchange'));
    await sleep(120);
    const afterStale = el.classList.contains('rot90');
    Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => real });
    await sleep(1000);
    return { afterStale, recovered: el.classList.contains('rot90'), rotated: window.__racer.rotated };
});
console.log('  ', JSON.stringify(stale));
check('量到舊尺寸判錯咗，之後唔使再派事件都會自己追返啱',
    stale.afterStale === false && stale.recovered === true && stale.rotated === true, stale);

// 轉咗之後觸控仍然要準：撳「油門」要收到油門，搖桿向遊戲右邊要出正數
const rotatedTouch = await page.evaluate(() => {
    const { input } = window.__racer;
    input.setControlMode('standard');
    input.setInvert(false);
    input.reset();
    const fire = (id, type, pointerId, coords = {}) => document.getElementById(id)
        .dispatchEvent(new PointerEvent(type, {
            bubbles: true, cancelable: true, pointerType: 'touch', pointerId, ...coords,
        }));
    fire('pad-gas', 'pointerdown', 11);
    const gasOn = input.read(1).throttle;
    fire('pad-gas', 'pointerup', 11);

    // 搖桿：遊戲座標「向右」＝ 螢幕座標「向下」（成個遊戲順時針轉咗 90°）
    const z = document.getElementById('steer-zone').getBoundingClientRect();
    const cx = z.left + z.width / 2, cy = z.top + z.height / 2;
    fire('steer-zone', 'pointerdown', 12, { clientX: cx, clientY: cy });
    fire('steer-zone', 'pointermove', 12, { clientX: cx, clientY: cy + 90 });
    let right = 0;
    for (let i = 0; i < 40; i++) right = input.read(1).steer;
    fire('steer-zone', 'pointermove', 12, { clientX: cx, clientY: cy - 90 });
    let left = 0;
    for (let i = 0; i < 40; i++) left = input.read(1).steer;
    dispatchEvent(new Event('blur'));
    input.reset();
    return { gasOn, right: +right.toFixed(2), left: +left.toFixed(2) };
});
console.log('  ', JSON.stringify(rotatedTouch));
check('轉咗之後油門掣仍然撳得到', rotatedTouch.gasOn > 0, rotatedTouch);
check('轉咗之後搖桿左右仍然啱（一正一負）',
    rotatedTouch.right > 0.3 && rotatedTouch.left < -0.3, rotatedTouch);

// 撳返「打直」要即刻收返個 90°，而且搖桿要換返正常軸
await page.evaluate(() => document.querySelector('#orient-seg button[data-orient="portrait"]').click());
await page.waitForTimeout(260);
const back = await readFrame();
const backTouch = await page.evaluate(() => {
    const { input } = window.__racer;
    input.reset();
    const fire = (type, pointerId, coords) => document.getElementById('steer-zone')
        .dispatchEvent(new PointerEvent(type, {
            bubbles: true, cancelable: true, pointerType: 'touch', pointerId, ...coords,
        }));
    const z = document.getElementById('steer-zone').getBoundingClientRect();
    const cx = z.left + z.width / 2, cy = z.top + z.height / 2;
    fire('pointerdown', 13, { clientX: cx, clientY: cy });
    fire('pointermove', 13, { clientX: cx + 90, clientY: cy });
    let right = 0;
    for (let i = 0; i < 40; i++) right = input.read(1).steer;
    dispatchEvent(new Event('blur'));
    input.reset();
    return +right.toFixed(2);
});
console.log('  ', JSON.stringify({ back, backTouch }));
check('撳返「打直」即刻收返個 90°',
    back.orient === 'portrait' && back.rotated === false
    && back.gameH > back.gameW && back.inputRotated === false, back);
check('收返之後 canvas 同個框仍然對得住', back.canvasFits && back.frameFitsViewport, back);

// iOS 轉方向嗰陣，resize／orientationchange 報嘅尺寸可以係舊值，落錯咗
// class 就一直錯落去（Penny：「轉方向仍然會亂曬顯示」）。所以個框一變就
// 一定要重新 setSize，唔可以靠事件——呢度直接改個框、一個事件都唔派。
const observed = await page.evaluate(async () => {
    const el = document.getElementById('game-root');
    el.style.width = '500px';
    el.style.height = '300px';
    await new Promise(r => setTimeout(r, 300));
    const canvas = document.querySelector('#canvas-holder canvas');
    const out = {
        canvas: [canvas.clientWidth, canvas.clientHeight],
        frame: [el.offsetWidth, el.offsetHeight],
        drawing: [window.__racer.renderer.domElement.width, window.__racer.renderer.domElement.height],
    };
    el.style.width = '';
    el.style.height = '';
    window.__racer.applyOrientation();
    return out;
});
console.log('  ', JSON.stringify(observed));
check('冇派任何事件，個框一變 canvas 都要跟住變（ResizeObserver 兜底）',
    Math.abs(observed.canvas[0] - observed.frame[0]) <= 1
    && Math.abs(observed.canvas[1] - observed.frame[1]) <= 1, observed);
check('打直模式下搖桿向螢幕右邊＝右軚', backTouch > 0.3, backTouch);

await page.setViewportSize({ width: 900, height: 760 });
await page.waitForTimeout(420);
await page.evaluate(() => window.__racer.toMenu());

// T4c：ABS 設定要真係接落物理，兼且記得住
const abs = await page.evaluate(() => {
    const { setAbs, car } = window.__racer;
    const btn = (v) => document.querySelector(`#abs-seg button[data-abs="${v}"]`);
    setAbs(true);
    const on = { car: car.abs, saved: localStorage.getItem('racer-abs'), lit: btn('1').classList.contains('on') };
    btn('0').click();
    const off = { car: car.abs, saved: localStorage.getItem('racer-abs'), lit: btn('0').classList.contains('on') };
    btn('1').click();
    const back = { car: car.abs, saved: localStorage.getItem('racer-abs') };
    return { on, off, back, report: window.__racer.performanceReportText() };
});
console.log('  ', JSON.stringify(abs));
check('ABS 設定會接落架車', abs.on.car === true && abs.off.car === false && abs.back.car === true, abs);
check('ABS 設定存得返兼著正粒掣',
    abs.on.saved === '1' && abs.off.saved === '0' && abs.back.saved === '1'
    && abs.on.lit && abs.off.lit, abs);
check('手機報告寫住 ABS 狀態', /ABS 開/.test(abs.report), abs.report);

// T5：陀螺儀轉向曲線。實機報告「轉向比例奇怪」＝ 11° 就打到盡、直線、
// 冇平滑，手腕郁少少就由零彈到全軚。呢度驗返條新曲線嘅性質。
const curve = await page.evaluate(async () => {
    const { gyroSteer } = await import('./src/input.js');
    const at = (d, s = 1) => +gyroSteer(d, s).toFixed(3);
    return {
        centre: [at(0), at(1), at(2)],
        小: at(6), 中: at(16), 大: at(30), 爆: at(90),
        左右對稱: [at(12), at(-12)],
        // 中間位要幼細：一半行程唔可以已經半軚
        半程: at(16),
        靈敏預設: at(5, 1),
        // 靈敏度：高＝細啲角度就打到盡
        靈敏: [at(15, 0.6), at(15, 1), at(15, 2)],
        單調: [at(4), at(8), at(12), at(16), at(20), at(24), at(28)],
        亂數據: [at(NaN), at(undefined)],
        亂靈敏度: at(5, NaN),
    };
});
console.log('  ', JSON.stringify(curve));
check('死區用「度」計，手拎唔穩唔會自己轉', curve.centre.every(v => v === 0), curve.centre);
check('要扭到 30° 先有全軚（唔再係 11°）', curve.大 === 1 && curve.中 < 1, curve);
check('超出行程夾住 1', curve.爆 === 1, curve.爆);
check('中間位幼細：一半行程只係約兩成軚', curve.半程 < 0.3 && curve.半程 > 0.15, curve.半程);
check('左右對稱', curve.左右對稱[0] === -curve.左右對稱[1], curve.左右對稱);
check('全程單調遞增', curve.單調.every((v, i, a) => i === 0 || v > a[i - 1]), curve.單調);
check('靈敏度愈高，同一角度愈大軚',
    curve.靈敏[0] < curve.靈敏[1] && curve.靈敏[1] < curve.靈敏[2], curve.靈敏);
check('亂數據唔會出 NaN', curve.亂數據.every(v => v === 0)
    && curve.亂靈敏度 === curve.靈敏預設, curve);

// T5a：真 deviceorientation event 會經校正基準變成左右軚；
// 手指有輸入時仍然以手指優先。
const gyro = await page.evaluate(async () => {
    const { input } = window.__racer;
    const hadCtor = 'DeviceOrientationEvent' in window;
    const originalCtor = window.DeviceOrientationEvent;
    const oldSens = input.gyroSens;
    class MockOrientationEvent extends Event {
        constructor(type, init = {}) {
            super(type);
            this.beta = init.beta ?? 0;
            this.gamma = init.gamma ?? 0;
        }
    }
    window.DeviceOrientationEvent = MockOrientationEvent;
    input.gyro.supported = true;
    input.setGyroSens(1);
    const enabled = await input.enableGyro();
    dispatchEvent(new MockOrientationEvent('deviceorientation', { beta: 0, gamma: 10 }));
    const calibrated = input.read(1 / 60).steer;
    // 平滑要行夠幾幀先到位（之前冇平滑，一幀就跳到盡）
    dispatchEvent(new MockOrientationEvent('deviceorientation', { beta: 0, gamma: 60 }));
    const firstFrame = input.read(1 / 60).steer;
    for (let i = 0; i < 60; i++) input.read(1 / 60);
    const eventRight = input.read(1 / 60).steer;
    dispatchEvent(new MockOrientationEvent('deviceorientation', { beta: 0, gamma: -40 }));
    for (let i = 0; i < 60; i++) input.read(1 / 60);
    const eventLeft = input.read(1 / 60).steer;

    // 方向掣：同觸控轉向分開兩件事（Penny 實機：觸控啱、陀螺儀相反）
    input.gyro.zero = 0;
    input.gyro.tilt = 22;
    const settle = () => { let s = 0; for (let i = 0; i < 60; i++) s = input.read(1 / 60).steer; return +s.toFixed(3); };
    const invDefault = { on: input.gyroInvert, steer: settle() };
    input.setGyroInvert(false);
    const invOff = { saved: localStorage.getItem('racer-gyro-invert'), steer: settle() };
    input.setGyroInvert(true);
    const invBack = { saved: localStorage.getItem('racer-gyro-invert'), steer: settle() };
    // 陀螺儀方向掣唔可以掂到觸控轉向
    input.gyro.on = false;
    input.touch.left = true; input.steerSmooth = -1;
    const touchUnaffected = +input.read(1 / 60).steer.toFixed(3);
    input.touch.left = false; input.steerSmooth = 0; input.gyro.on = true;

    const at = (tilt, touchLeft = false) => {
        input.gyro.tilt = tilt;
        input.touch.left = touchLeft;
        input.steerSmooth = touchLeft ? -1 : 0;
        let s = 0;
        for (let i = 0; i < 60; i++) s = input.read(1 / 60).steer;   // 等平滑到位
        input.touch.left = false;
        return +s.toFixed(3);
    };
    const out = {
        flat: at(0), right: at(22), left: at(-22),
        small: at(0.7), touchWins: at(22, true),
        enabled, calibrated: +calibrated.toFixed(3),
        eventRight: +eventRight.toFixed(3), eventLeft: +eventLeft.toFixed(3),
        invDefault, invOff, invBack, touchUnaffected, firstFrame: +firstFrame.toFixed(3),
    };
    input.disableGyro();
    input.setGyroSens(oldSens);
    if (hadCtor) window.DeviceOrientationEvent = originalCtor;
    else delete window.DeviceOrientationEvent;
    return out;
});
console.log('  ', JSON.stringify(gyro));
check('真陀螺儀事件首個姿勢會校正做中間', gyro.enabled && gyro.calibrated === 0, gyro);
// 預設係「反轉」——Penny 實機報告扭嘅方向同轉向相反。呢度守住嘅係
// 「兩邊各自輸出相反嘅軚」加「預設跟返實機嗰個方向」。
check('真陀螺儀事件兩邊各自輸出相反嘅軚',
    gyro.eventRight < -0.9 && gyro.eventLeft > 0.9, gyro);
check('唔會一幀就彈到盡（有平滑）',
    Math.abs(gyro.firstFrame) < 0.4, gyro.firstFrame);
check('打平唔會自己轉', gyro.flat === 0, gyro.flat);
check('兩邊傾側各自輸出大小一樣、方向相反嘅軚',
    gyro.right < -0.3 && gyro.right === -gyro.left, gyro);
check('陀螺儀方向預設係反轉（實機證據）',
    gyro.invDefault.on === true && gyro.invDefault.steer < 0, gyro.invDefault);
check('撳「反轉」會真係掉轉兼存得返',
    gyro.invOff.steer === -gyro.invDefault.steer && gyro.invOff.saved === '0'
    && gyro.invBack.steer === gyro.invDefault.steer && gyro.invBack.saved === '1', gyro);
check('陀螺儀方向掣唔會掂到觸控轉向', gyro.touchUnaffected < 0, gyro.touchUnaffected);
check('細微晃動有死區', gyro.small === 0, gyro.small);
check('撳住掣嘅時候以手指為準', gyro.touchWins < 0, gyro.touchWins);

// T5a1：簡易模式打軚要自動鬆油。舊版係「永遠踩到底」，而摩擦圓決定咗
// 後軸縱向用得多，側向就剩得少：全油側向只剩約五成一，鬆到六成油就有
// 八成五。實測同一條 90° 彎（28 m/s 全軚）：全油要行 107 米先轉得完，
// 自動鬆油 72 米——喺一條 15 米闊嘅路上面，呢個就係撞唔撞欄嘅分別。
const autoLift = await page.evaluate(async () => {
    const { AUTO_LIFT } = await import('./src/input.js');
    const { input } = window.__racer;
    input.setControlMode('simple');
    input.reset();
    const read = (steer) => { input.touch.steer = steer; let out = null; for (let i = 0; i < 200; i++) out = input.read(1 / 60); return out; };
    const straight = read(0).throttle;
    const half = read(0.5).throttle;
    const full = read(1).throttle;
    input.touch.steer = 0; input.touch.brake = true;
    let braking = null; for (let i = 0; i < 60; i++) braking = input.read(1 / 60);
    input.touch.brake = false;
    input.reset();
    // 標準模式唔應該有自動油門
    input.setControlMode('standard');
    input.touch.steer = 1;
    let std = null; for (let i = 0; i < 200; i++) std = input.read(1 / 60);
    input.reset();
    input.setControlMode('simple');
    return {
        lift: AUTO_LIFT,
        straight: +straight.toFixed(2), half: +half.toFixed(2), full: +full.toFixed(2),
        braking: braking.throttle, standardNoAuto: std.throttle,
    };
});
console.log('  ', JSON.stringify(autoLift));
check('簡易模式直路仍然全油', autoLift.straight === 1, autoLift);
check('打軚就按比例鬆油', autoLift.half > autoLift.full && autoLift.half < 1, autoLift);
check('打盡都仲有六成油（動力過彎照用得）',
    autoLift.full >= 0.55 && autoLift.full <= 0.65, autoLift);
check('煞車永遠優先', autoLift.braking === -1, autoLift.braking);
check('標準模式冇自動油門', autoLift.standardNoAuto === 0, autoLift);

// T5a2：搖桿要畀到足軚。Penny：「左右好似唔夠幅度，做唔到較大轉向」。
// 兩個原因，兩樣都要守住：
//   1. 舊寫法將 (dx, dy) 一齊夾入個圓，拇指順住手腕弧線拉落斜就連 x 一齊
//      縮細——實測 40° 得 0.77 軚、60° 得 0.50；
//   2. 搖桿本身已經係連續值，仲要再過一層平滑，0.25 秒先到九成。
const reach = await page.evaluate(async () => {
    const { input, startRace, pauseRace, toMenu } = window.__racer;
    startRace();
    input.setControlMode('standard');
    input.setInvert(false);
    const stick = document.getElementById('steer-stick');
    const fire = (type, coords) => document.getElementById('steer-zone')
        .dispatchEvent(new PointerEvent(type, {
            bubbles: true, cancelable: true, pointerType: 'touch', pointerId: 7, ...coords,
        }));
    const byAngle = {};
    for (const deg of [0, 20, 40, 60]) {
        input.reset();
        const r = stick.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        fire('pointerdown', { clientX: cx, clientY: cy });
        const rad = deg * Math.PI / 180;
        fire('pointermove', { clientX: cx + Math.cos(rad) * 120, clientY: cy + Math.sin(rad) * 120 });
        byAngle[deg] = +input.touch.steer.toFixed(2);
        fire('pointerup', { clientX: cx, clientY: cy });
    }
    // 圓芯唔可以跌出個圓（顯示仍然要似搖桿）
    input.reset();
    const r = stick.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    fire('pointerdown', { clientX: cx, clientY: cy });
    fire('pointermove', { clientX: cx + 120, clientY: cy + 120 });
    const m = /translate\(([-\d.]+)px, ?([-\d.]+)px\)/.exec(
        document.getElementById('steer-knob').style.transform) || [];
    const knobDist = m.length ? Math.round(Math.hypot(+m[1], +m[2])) : null;
    const knobMax = Math.round(stick.offsetWidth * 0.34);   // 要喺 HUD 未收埋之前量
    fire('pointerup', { clientX: cx, clientY: cy });

    // 拉到底之後，幾耐先真係出到足軚
    input.reset();
    input.touch.steer = 1;
    const dt = 1 / 60;
    let t90 = null;
    for (let i = 1; i <= 120 && t90 === null; i++) {
        if (input.read(dt).steer >= 0.9) t90 = +(i * dt).toFixed(3);
    }
    input.reset();
    pauseRace('搖桿幅度測試完成');
    toMenu();
    return { byAngle, knobDist, knobMax, t90 };
});
console.log('  ', JSON.stringify(reach));
check('拇指順住弧線拉都出到足軚（唔會畀圓形夾細）',
    [0, 20, 40, 60].every(d => reach.byAngle[d] >= 0.99), reach.byAngle);
check('圓芯仍然留喺圓盤入面', reach.knobDist !== null
    && reach.knobDist <= reach.knobMax + 1, reach);
// 舊版係 0.25 秒到九成、0.48 秒先到底（ADR-076 之前）。
check('拉到底之後 0.12 秒內出到九成軚', reach.t90 !== null && reach.t90 <= 0.12, reach.t90);


// T5b：真 DOM pointer 路徑要收到類比搖桿 + 油門兩隻手指；blur 後全部回中。
const touch = await page.evaluate(() => {
    const root = window.__racer;
    const { input } = root;
    input.setControlMode('standard');
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

// T5e：（舊嗰個「轉方向就暫停」嘅測試已經移除——ADR-072 攞走咗個暫停，
// ADR-074 之後畫面方向係手動設定，全部覆蓋喺 T4b。）

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
// 用 320×568：預設係「打直」（ADR-074），畫面唔會轉，所以螢幕框就係遊戲
// 版面本身，呢個亦係啲窄屏 CSS 規則本身寫嚟對付嘅情況。
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
check('最窄手機（320×568）搖桿同三粒 action 完整留喺 viewport', narrowControls.every(b =>
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
