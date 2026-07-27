// Racing Car 3D —— 入口：載模型、砌世界、跑主迴圈、駁 HUD。

import * as THREE from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { DRACOLoader } from '../vendor/DRACOLoader.js';
import { Track } from './track.js';
import { TRACKS, trackById } from './tracks.js';
import { Car } from './car.js';
import { Race, fmtTime } from './race.js';
import { Input, GYRO_KEY } from './input.js';
import { Minimap } from './minimap.js';
import {
    COLOURS, TIMES, QUALITY_MODES,
    loadColour, saveColour, loadTod, saveTod, loadQuality, saveQuality, qualityDpr,
    paintCar, applyTime,
} from './settings.js';

const $ = (id) => document.getElementById(id);
const holder = $('canvas-holder');

// ---------- 渲染器 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
const coarsePointer = matchMedia('(pointer: coarse)').matches;
let qualityMode = loadQuality();
const qualityState = {
    mode: qualityMode,
    dpr: qualityDpr(qualityMode, devicePixelRatio || 1, coarsePointer),
    fps: null,
    changes: 0,
};
renderer.setPixelRatio(qualityState.dpr);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
holder.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fc7ef);
// 空氣透視收走地形平面邊界，同時令遠景有真正深度。
scene.fog = new THREE.Fog(0x8fc7ef, 150, 390);

const camera = new THREE.PerspectiveCamera(62, 1, 0.5, 600);

const sun = new THREE.DirectionalLight(0xfff2d8, 2.1);
sun.position.set(60, 120, 40);
scene.add(sun);
const hemi = new THREE.HemisphereLight(0xbfe3ff, 0x4a6a3a, 1.0);
scene.add(hemi);

let tod = loadTod();
applyTime(tod, { scene, renderer, sun, hemi });

function resize() {
    const w = holder.clientWidth || innerWidth;
    const h = holder.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 120));

// ---------- 手機畫質 ----------
// Auto 只調 pixel ratio，唔會喺比賽中拆 mesh／改 physics。低幀率連續一個
// 3.5 秒窗口就降 0.25×；穩定高幀率三個窗口先升返，避免來回跳畫質。
let qualityWindowStart = 0, qualityFrames = 0, qualityHighWindows = 0;
function updateQualityNote() {
    const el = $('quality-note');
    if (!el) return;
    const mode = QUALITY_MODES[qualityMode]?.name ?? QUALITY_MODES.auto.name;
    const fps = qualityState.fps == null ? '' : ` · ${Math.round(qualityState.fps)} fps`;
    el.textContent = `${mode} · ${qualityState.dpr.toFixed(2)}×${fps}`;
}
function applyRenderDpr(dpr) {
    const next = Math.max(1, Math.min(2, Math.round(dpr * 4) / 4));
    if (Math.abs(next - qualityState.dpr) < 0.01) return false;
    qualityState.dpr = next;
    qualityState.changes += 1;
    renderer.setPixelRatio(next);
    resize();
    updateQualityNote();
    return true;
}
function setQuality(id, persist = true) {
    qualityMode = QUALITY_MODES[id] ? id : 'auto';
    qualityState.mode = qualityMode;
    qualityState.fps = null;
    qualityHighWindows = 0;
    qualityWindowStart = 0;
    qualityFrames = 0;
    if (persist) saveQuality(qualityMode);
    applyRenderDpr(qualityDpr(qualityMode, devicePixelRatio || 1, coarsePointer));
    document.querySelectorAll('#quality-seg button').forEach(b =>
        b.classList.toggle('on', b.dataset.quality === qualityMode));
    updateQualityNote();
    return qualityState.dpr;
}
function tuneAutoQuality(fps) {
    qualityState.fps = fps;
    if (qualityMode !== 'auto') { updateQualityNote(); return qualityState.dpr; }
    const ceiling = qualityDpr('auto', devicePixelRatio || 1, coarsePointer);
    if (fps < 43 && qualityState.dpr > 1) {
        qualityHighWindows = 0;
        applyRenderDpr(qualityState.dpr - 0.25);
    } else if (fps > 57 && qualityState.dpr < ceiling) {
        qualityHighWindows += 1;
        if (qualityHighWindows >= 3) {
            applyRenderDpr(Math.min(ceiling, qualityState.dpr + 0.25));
            qualityHighWindows = 0;
        }
    } else {
        qualityHighWindows = 0;
    }
    updateQualityNote();
    return qualityState.dpr;
}
function sampleAutoQuality(now) {
    if (!running || qualityMode !== 'auto' || document.hidden) {
        qualityWindowStart = 0; qualityFrames = 0;
        return;
    }
    if (!qualityWindowStart) qualityWindowStart = now;
    qualityFrames += 1;
    const elapsed = now - qualityWindowStart;
    if (elapsed < 3500) return;
    tuneAutoQuality(qualityFrames * 1000 / elapsed);
    qualityWindowStart = now;
    qualityFrames = 0;
}

// ---------- 世界 ----------
// car／race 要喺 buildTrack 之前宣告：換賽道會順手 reset 佢哋，
// 放喺下面就會撞 TDZ（實測：Cannot access 'car' before initialization）
let car = null;
let race = null;
let camInit = false;      // 鏡頭要唔要即刻歸位（換賽道／重開都會用到）

// 賽道可以換：換嗰陣要 dispose 舊嗰個，唔係每揀一次就漏一份 3D 世界
const minimap = new Minimap($('minimap'));

let trackDef = trackById(localStorage.getItem('racer-track') ?? TRACKS[0].id);
let track = null;
function buildTrack(id) {
    trackDef = trackById(id);
    try { localStorage.setItem('racer-track', trackDef.id); } catch { }
    track?.dispose(scene);
    track = new Track(trackDef.waypoints, trackDef.tension);
    track.build(scene);
    minimap.setTrack(track);
    if (car) car.reset(track.startPos, track.startDir);
    if (race) { race.track = track; race.trackId = trackDef.id; race.reset(); }
    camInit = false;
}
buildTrack(trackDef.id);

// 低成本柔和雲層：一個 instanced mesh，唔再用方塊破壞順滑世界觀。
const clouds = new THREE.Group();
{
    const geo = new THREE.SphereGeometry(1, 10, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.58, depthWrite: false });
    const im = new THREE.InstancedMesh(geo, mat, 42);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    for (let i = 0; i < 42; i++) {
        const a = (i / 42) * Math.PI * 2 + i * 0.73;
        const r = 175 + (i % 7) * 30;
        const p = new THREE.Vector3(Math.cos(a) * r, 68 + (i % 5) * 8, Math.sin(a) * r);
        s.set(8 + (i % 3) * 2.5, 2.3 + (i % 2), 4.5 + (i % 4));
        m.compose(p, q, s);
        im.setMatrixAt(i, m);
    }
    im.instanceMatrix.needsUpdate = true;
    clouds.add(im);
    scene.add(clouds);
}

// ---------- 載車 ----------
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('./vendor/draco/');
loader.setDRACOLoader(draco);

// 模型可能係任何朝向／尺寸：量度包圍盒，轉到「車頭向 +z」再縮到指定長度。
// 呢個模型（Tripo 生成）車頭係向 -z，所以對齊完之後仲要再轉 180°；
// 唔轉嘅話成架車倒後行，玩家仲會覺得左右轉向係反嘅——其實物理啱晒，
// 淨係模型朝向錯。
function normalizeCar(obj, targetLength = 4.6) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    // 水平最長嗰軸當車身長度方向
    obj.rotation.y = (size.x > size.z ? Math.PI / 2 : 0) + Math.PI;
    const box2 = new THREE.Box3().setFromObject(obj);
    const size2 = box2.getSize(new THREE.Vector3());
    const s = targetLength / Math.max(0.001, size2.z);
    obj.scale.setScalar(s);
    const box3 = new THREE.Box3().setFromObject(obj);
    const c = box3.getCenter(new THREE.Vector3());
    obj.position.x -= c.x;
    obj.position.z -= c.z;
    obj.position.y -= box3.min.y;          // 貼地
    return obj;
}

const input = new Input(document);

// 接地陰影：一塊帶徑向漸變嘅平面貼喺車底。
// 冇佢嘅話架車望落好似浮起（Penny 一眼就睇到）——真陰影貼圖喺手機太貴，
// 而賽車其實得一個投影體，一塊圖就夠。
function contactShadow() {
    const N = 128;
    const cv = document.createElement('canvas');
    cv.width = cv.height = N;
    const g = cv.getContext('2d');
    const grad = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
    grad.addColorStop(0, 'rgba(0,0,0,0.55)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0.28)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, N, N);
    const tex = new THREE.CanvasTexture(cv);
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.4, 7.2),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.03;              // 貼住路面，唔好 z-fight
    mesh.renderOrder = 1;
    // 用 Group 包住再掛喺場景（唔係掛喺車底）：掛喺車嗰陣連車身側傾都會跟住
    // 一齊擘，陰影一邊會離地——影就係要貼實地面先騙到眼。
    const g2 = new THREE.Group();
    g2.add(mesh);
    return g2;
}

let carModel = null;
let shadow = null;
let colour = loadColour();

loader.load('./assets/car.glb', (gltf) => {
    const model = normalizeCar(gltf.scene);
    model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    carModel = model;
    paintCar(model, colour.hex);
    const wrap = new THREE.Group();
    wrap.add(model);
    car = new Car(wrap);
    scene.add(car.root);
    shadow = contactShadow();
    scene.add(shadow);
    car.reset(track.startPos, track.startDir);
    race = new Race(track, { laps: 3, trackId: trackDef.id, onEvent: handleRaceEvent });
    $('loading').classList.add('hidden');
    $('screen-start').classList.remove('hidden');
    buildTrackButtons();
    buildSettings();
    // 畀自動化測試用；track 用 getter，換賽道之後攞到嘅係新嗰個
    window.__racer = {
        car, race, renderer, camera, restart, startRace, buildTrack, TRACKS, input, minimap,
        setColour, setTod, setQuality, tuneAutoQuality, pauseRace, resumeRace, toMenu,
        coarsePointer,
        get track() { return track; },
        get trackDef() { return trackDef; },
        get tod() { return tod; },
        get colour() { return colour; },
        get quality() { return { ...qualityState }; },
        get running() { return running; },
        get paused() { return paused; },
        get wakeLockActive() { return !!wakeLock; },
    };
}, undefined, (err) => {
    $('loading').innerHTML = `<div class="loading-box"><div class="loading-label">⚠️ 載入失敗</div></div>`;
    console.error(err);
});

// ---------- 鏡頭：跟車 ----------
const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
const chaseDir = new THREE.Vector3(0, 0, 1);
function updateCamera(dt) {
    const heading = new THREE.Vector3(Math.sin(car.yaw), 0, Math.cos(car.yaw));
    // 鏡頭唔可以淨係跟車頭：甩到八十幾度嗰陣車係打橫飛，跟車頭嘅話架車
    // 會直接飛出畫面（實測 45 幀手煞之後成架車跌咗落畫面底邊）。
    // 甩得愈勁就愈跟「行進方向」，咁架車就會打橫留喺畫面中間——
    // 亦即係漂移遊戲嗰種標準機位。
    const travel = car.speed > 3
        ? new THREE.Vector3(car.vel.x, 0, car.vel.z).normalize()
        : heading;
    const blend = Math.min(1, Math.abs(car.slipAngle) / 0.9) * 0.8;
    const want3 = heading.clone().lerp(travel, blend).normalize();
    chaseDir.lerp(want3, Math.min(1, dt * 5)).normalize();
    const fwd = chaseDir;
    const speedT = Math.min(1, car.speed / 60);
    const wideMobile = camera.aspect > 1.45;
    // 鏡頭要高同望遠：低機位睇落好有速度感，但玩家見唔到下一個彎就變咗盲揸。
    // 實測 5.4 高度嗰陣天空霸咗三分二畫面，路面得底下嗰條。
    // 橫向手機嘅垂直像素得直向一半；沿用同一距離會令車細到難以讀取姿態，
    // 所以寬畫面用更近、更低嘅 chase framing，但仍保留 16m 前望。
    const dist = (13 + speedT * 4) * (wideMobile ? 0.72 : 1);
    const want = car.pos.clone().addScaledVector(fwd, -dist);
    want.y = (9.0 + speedT * 1.8) * (wideMobile ? 0.74 : 1);
    const lookAt = car.pos.clone().addScaledVector(fwd, wideMobile ? 16 : 22).setY(0.6);
    if (!camInit) { camPos.copy(want); camLook.copy(lookAt); camInit = true; }
    // 追car 用指數平滑。唔可以再喺漂移時特登放鬆——方向本身已經跟住
    // 行進方向擺，位置再拖就會framing唔到架車。
    const lag = 6.5;
    camPos.lerp(want, Math.min(1, dt * lag));
    camLook.lerp(lookAt, Math.min(1, dt * 8));
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    // 速度愈快視角愈闊，速度感靠呢個
    const fov = (wideMobile ? 58 : 62) + speedT * (wideMobile ? 9 : 12);
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
}

// ---------- 賽道選擇 ----------
function buildTrackButtons() {
    const box = $('track-list');
    if (!box) return;
    box.innerHTML = '';
    for (const t of TRACKS) {
        const btn = document.createElement('button');
        btn.className = 'track-btn' + (t.id === trackDef.id ? ' selected' : '');
        btn.dataset.id = t.id;
        btn.innerHTML = `<span class="track-icon">${t.icon}</span>
            <span class="track-copy"><b>${t.name}</b><small>${t.desc}</small></span>`;
        btn.addEventListener('click', () => {
            buildTrack(t.id);
            [...box.children].forEach(c => c.classList.toggle('selected', c.dataset.id === t.id));
            refreshBest();
        });
        box.appendChild(btn);
    }
    refreshBest();
}

// ---------- 設定 ----------
function setColour(id) {
    colour = COLOURS.find(c => c.id === id) ?? COLOURS[0];
    saveColour(colour.id);
    if (carModel) paintCar(carModel, colour.hex);
    document.querySelectorAll('#colour-list button').forEach(b =>
        b.classList.toggle('on', b.dataset.id === colour.id));
}
function setTod(id) {
    tod = TIMES[id] ? id : 'day';
    saveTod(tod);
    applyTime(tod, { scene, renderer, sun, hemi });
    document.querySelectorAll('#tod-seg button').forEach(b =>
        b.classList.toggle('on', b.dataset.tod === tod));
}
function markSeg(sel, attr, value) {
    document.querySelectorAll(`${sel} button`).forEach(b =>
        b.classList.toggle('on', b.dataset[attr] === String(value)));
}

function buildSettings() {
    const list = $('colour-list');
    list.innerHTML = '';
    for (const c of COLOURS) {
        const b = document.createElement('button');
        b.className = 'swatch';
        b.dataset.id = c.id;
        b.title = c.name;
        b.style.background = `#${c.hex.toString(16).padStart(6, '0')}`;
        b.addEventListener('click', () => setColour(c.id));
        list.appendChild(b);
    }
    setColour(colour.id);
    setTod(tod);

    for (const b of document.querySelectorAll('#quality-seg button')) {
        b.addEventListener('click', () => setQuality(b.dataset.quality));
    }
    setQuality(qualityMode, false);

    for (const b of document.querySelectorAll('#steer-seg button')) {
        b.addEventListener('click', () => {
            input.setInvert(b.dataset.invert === '1');
            markSeg('#steer-seg', 'invert', input.invert ? 1 : 0);
        });
    }
    markSeg('#steer-seg', 'invert', input.invert ? 1 : 0);

    const note = $('gyro-note');
    for (const b of document.querySelectorAll('#gyro-seg button')) {
        b.addEventListener('click', async () => {
            if (b.dataset.gyro === '0') {
                input.disableGyro();
                markSeg('#gyro-seg', 'gyro', 0);
                note.classList.add('hidden');
                return;
            }
            // iOS 一定要喺真 user gesture 入面問，所以只可以喺 click 度做
            const ok = await input.enableGyro();
            markSeg('#gyro-seg', 'gyro', ok ? 1 : 0);
            note.classList.remove('hidden');
            note.textContent = ok
                ? '揸車嗰陣扭手機轉向。開波果陣手機咩姿勢就當「軚盤打直」，撳「校正」可以重設。'
                : '呢部機／呢個瀏覽器唔畀用陀螺儀（iPhone 要喺 Safari 而且係 https）。';
        });
    }
    markSeg('#gyro-seg', 'gyro', 0);
    // 上次揀咗開嘅話都要玩家再撳一次——權限唔可以自動攞
    if (localStorage.getItem(GYRO_KEY) === '1') {
        note.classList.remove('hidden');
        note.textContent = '上次你開咗陀螺儀。iOS 要每次入嚟撳一次「開」先攞得到權限。';
    }

    const sens = $('gyro-sens');
    sens.value = String(input.gyroSens);
    sens.addEventListener('input', () => input.setGyroSens(Number(sens.value)));
}

function refreshBest() {
    if (!race) return;
    const saved = race.loadBest();
    $('menu-best').textContent = saved.bestLap == null ? '未有紀錄' : fmtTime(saved.bestLap);
    $('menu-score').textContent = saved.bestScore ? saved.bestScore.toLocaleString() : '0';
}

// ---------- HUD ----------
function handleRaceEvent(kind, data) {
    if (kind === 'count') banner(String(data), 900);
    else if (kind === 'go') banner('GO!', 900);
    else if (kind === 'lap') banner(`第 ${data} 圈`, 1100);
    else if (kind === 'record') banner('⚡ 最快圈！', 1300);
    else if (kind === 'driftBank') {
        if (data.gained >= 300) banner(`💨 +${data.gained}（${data.combo}×）`, 900);
    }
    else if (kind === 'driftLost') banner('💥 撞欄，漂移分報銷', 1000);
    else if (kind === 'rescue') banner('🚧 拖返賽道', 1200);
    else if (kind === 'finish') showFinish(data);
}

let bannerTimer = null;
function banner(text, dur) {
    const el = $('banner');
    el.textContent = text;
    el.classList.remove('hidden');
    el.classList.remove('pop');
    void el.offsetWidth;                 // 重新觸發動畫
    el.classList.add('pop');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => el.classList.add('hidden'), dur);
}

function showFinish({ total, laps, best, drift, bestDrift, bestScore }) {
    running = false;
    paused = false;
    input.reset();
    releaseWakeLock();
    $('screen-pause').classList.add('hidden');
    $('finish-total').textContent = fmtTime(total);
    $('finish-best').textContent = fmtTime(best);
    $('finish-drift').textContent = drift.toLocaleString();
    $('finish-bestdrift').textContent = bestDrift.toLocaleString();
    $('finish-record').textContent = bestScore.toLocaleString();
    const list = $('finish-laps');
    list.innerHTML = '';
    laps.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'lap-row' + (t === Math.min(...laps) ? ' fastest' : '');
        row.innerHTML = `<span>第 ${i + 1} 圈</span><b>${fmtTime(t)}</b>`;
        list.appendChild(row);
    });
    $('screen-finish').classList.remove('hidden');
}

let hudCache = {};
function updateHud() {
    // 漂移面板：甩緊尾先亮，唔好成場都霸住畫面
    const active = car.drifting || race.pending > 0;
    if (active !== hudCache.driftOn) {
        $('drift-box').classList.toggle('hidden', !active);
        hudCache.driftOn = active;
    }
    if (active) {
        const pending = Math.round(race.pending);
        if (pending !== hudCache.pending) { $('drift-pending').textContent = pending; hudCache.pending = pending; }
        const combo = `${race.combo}×`;
        if (combo !== hudCache.combo) { $('drift-combo').textContent = combo; hudCache.combo = combo; }
        // 角度條：0–60° 對應 0–100%
        const pct = Math.min(100, Math.abs(car.slipAngle) / 1.05 * 100);
        $('drift-angle-fill').style.width = `${pct}%`;
        $('drift-angle-fill').classList.toggle('hot', pct > 70);
    }
    const score = race.driftScore;
    if (score !== hudCache.score) { $('score-num').textContent = score.toLocaleString(); hudCache.score = score; }

    const kmh = car.kmh;
    if (kmh !== hudCache.kmh) { $('speed-num').textContent = kmh; hudCache.kmh = kmh; }
    const lapLabel = `${Math.min(race.lap + 1, race.totalLaps)}/${race.totalLaps}`;
    if (lapLabel !== hudCache.lap) { $('lap-num').textContent = lapLabel; hudCache.lap = lapLabel; }
    const t = fmtTime(race.lapTime);
    if (t !== hudCache.time) { $('time-num').textContent = t; hudCache.time = t; }
    const b = fmtTime(race.best);
    if (b !== hudCache.best) { $('best-num').textContent = b; hudCache.best = b; }
    if (race.wrongWay !== hudCache.wrong) {
        $('wrong-way').classList.toggle('hidden', !race.wrongWay);
        hudCache.wrong = race.wrongWay;
    }
}

// ---------- 畫面切換 ----------
let running = false;
let paused = false;
let wakeLock = null;
let wakeLockRequest = 0;
let last = performance.now();

async function requestWakeLock() {
    if (!running || document.hidden || !navigator.wakeLock?.request || wakeLock) return false;
    const requestId = ++wakeLockRequest;
    try {
        const lock = await navigator.wakeLock.request('screen');
        // request 係 async：等緊系統回覆期間玩家可能已經暫停／切 App。
        // generation 仲要一致：舊 request 唔可以喺「暫停再恢復」之後冒認新場次。
        if (requestId !== wakeLockRequest || !running || document.hidden) {
            try { await lock.release(); } catch { }
            return false;
        }
        wakeLock = lock;
        lock.addEventListener?.('release', () => { if (wakeLock === lock) wakeLock = null; });
        return true;
    } catch { return false; }
}
function releaseWakeLock() {
    wakeLockRequest += 1; // 即使 lock 未 resolve，都即刻令舊 request 過期
    if (!wakeLock) return;
    const held = wakeLock;
    wakeLock = null;
    try { held.release(); } catch { }
}

function startRace() {
    $('screen-start').classList.add('hidden');
    $('screen-finish').classList.add('hidden');
    $('screen-pause').classList.add('hidden');
    $('hud').classList.remove('hidden');
    input.reset();
    car.reset(track.startPos, track.startDir);
    camInit = false;
    race.reset();
    hudCache = {};
    paused = false;
    running = true;
    last = performance.now();
    if (qualityMode === 'auto') setQuality('auto', false); // 每場由裝置安全上限重新量
    requestWakeLock();
}
function restart() { startRace(); }
function pauseRace(reason = '比賽進度已保留') {
    if (!running) return false;
    running = false;
    paused = true;
    input.reset();
    releaseWakeLock();
    $('pause-reason').textContent = reason;
    $('screen-pause').classList.remove('hidden');
    return true;
}
function resumeRace() {
    if (!paused || race?.state === 'finished') return false;
    paused = false;
    running = true;
    last = performance.now();
    $('screen-pause').classList.add('hidden');
    requestWakeLock();
    return true;
}
function toMenu() {
    running = false;
    paused = false;
    input.reset();
    releaseWakeLock();
    refreshBest();
    $('screen-finish').classList.add('hidden');
    $('screen-pause').classList.add('hidden');
    $('hud').classList.add('hidden');
    $('screen-start').classList.remove('hidden');
}

$('start-btn').addEventListener('click', startRace);
$('again-btn').addEventListener('click', restart);
$('menu-btn').addEventListener('click', toMenu);
$('pause-btn').addEventListener('click', () => pauseRace());
$('resume-btn').addEventListener('click', resumeRace);
$('pause-menu-btn').addEventListener('click', toMenu);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseRace('你離開咗遊戲，進度已安全暫停');
});

// ---------- 主迴圈 ----------
function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);   // 夾住 dt：切 tab 返嚟唔好一下衝出賽道
    last = now;
    if (car) {
        if (running) {
            const cmd = race.state === 'racing' ? input.read(dt) : { throttle: 0, steer: 0, handbrake: false };
            car.update(dt, cmd, track);
            race.update(dt, car);
            updateHud();
            minimap.draw(car);
        }
        if (shadow) {
            shadow.position.set(car.pos.x, 0, car.pos.z);
            shadow.rotation.y = car.yaw;
        }
        updateCamera(dt);
    }
    renderer.render(scene, camera);
    sampleAutoQuality(now);
}
resize();
requestAnimationFrame(frame);
