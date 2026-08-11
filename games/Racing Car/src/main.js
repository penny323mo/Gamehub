// Racing Car 3D —— 入口：載模型、砌世界、跑主迴圈、駁 HUD。

import * as THREE from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { DRACOLoader } from '../vendor/DRACOLoader.js';
import { Track } from './track.js';
import { TRACKS, DEFAULT_SEASON, trackById } from './tracks.js';
import { Car, CFG as CAR_CFG } from './car.js';
import { Race, fmtTime } from './race.js';
import { Input, GYRO_KEY } from './input.js';
import { Minimap } from './minimap.js';
import { createEnvironment } from './environment.js';
import { createDrivingEffects } from './driving-effects.js';
import { RivalField, trackDelta, signedFrac } from './rivals.js';
import { GhostRecorder, GhostPlayer, clearGhost } from './ghost.js';
import { Season, loadHistory, clearHistory } from './season.js';
import { createRacerAudio } from './audio.js';
import {
    COLOURS, TIMES, QUALITY_MODES,
    loadColour, saveColour, loadTod, saveTod, loadQuality, saveQuality, qualityDpr,
    loadRivals, saveRivals, loadGhostOn, saveGhostOn, loadSeasonList, saveSeasonList,
    loadAbs, saveAbs, loadOrient, saveOrient,
    paintCar, applyTime,
} from './settings.js';

const $ = (id) => document.getElementById(id);
const holder = $('canvas-holder');
const root = $('game-root');

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
const performanceState = {
    startedAt: 0,
    elapsedMs: 0,
    frames: 0,
    windows: 0,
    minWindowFps: null,
    longFrames: 0,
    maxFrameMs: 0,
};
renderer.setPixelRatio(qualityState.dpr);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
holder.appendChild(renderer.domElement);

// 比賽先需要連續重畫。Menu／暫停／完成畫面都係靜態，停低 rAF + WebGL
// 先至真係畀手機 GPU 休息；設定或 resize 只補畫一幀。
let frameHandle = 0;
let renderDirty = true;
let renderCount = 0;
let carReadyRendered = false;
let revealMenuAfterRender = false;
function ensureFrame() {
    if (!frameHandle) frameHandle = requestAnimationFrame(frame);
}
function requestRender() {
    renderDirty = true;
    ensureFrame();
}

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

const environment = createEnvironment(scene);
const drivingEffects = createDrivingEffects(scene);
let tod = loadTod();
applyTime(tod, { scene, renderer, sun, hemi, environment });

function resize() {
    const w = holder.clientWidth || innerWidth;
    const h = holder.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestRender();
}
// ---------- 畫面方向：得玩家自己揀（ADR-074）----------
// 兩個選擇，冇第三個「自動」：
//   打直 = 畫面跟部機，一個 transform 都冇；
//   打橫 = 畫面永遠打橫，部機報打直嗰陣就將 #game-root 轉 90° 去填滿。
// 遊戲永遠唔會自己改方向——會唔會轉，只係睇個設定同部機而家嘅形狀。
// 之前試過「一律強制打橫」（ADR-073）同「打直就暫停」（ADR-072），
// 兩樣 Penny 用落都唔啱：由頭到尾佢想要嘅係自己揀。
//
// iOS 嗰邊唔可以「量一次就當數」。轉方向嘅時候 Safari 會連續報幾次尺寸，
// 中間嗰啲仲係舊值（甚至係轉到一半嘅過渡值），而 orientationchange 通常
// 喺 viewport 真正變之前就到。舊寫法喺事件嗰刻量一次就落 class，量錯咗
// 就一直錯落去——Penny 見到嘅「轉方向就亂曬」。而家三重保險：
//   1. 每次事件都「重新判斷」，唔淨係補 resize；
//   2. orientationchange 之後連續補判幾次，等 Safari 自己安定落嚟；
//   3. 個框嘅闊高留返畀 CSS（dvw／dvh）同 ResizeObserver，唔靠 JS 度尺——
//      就算所有事件都遲到，畫面都唔會停留喺舊尺寸。
function viewportSize() {
    // visualViewport 喺 iOS 轉緊方向嗰陣比 innerWidth／innerHeight 準。
    const vv = window.visualViewport;
    return {
        w: Math.round(vv?.width || innerWidth),
        h: Math.round(vv?.height || innerHeight),
    };
}
const isPortrait = () => { const v = viewportSize(); return v.h > v.w; };
let orientMode = loadOrient();

function applyOrientation() {
    const { w, h } = viewportSize();
    // 打橫模式先要轉，而且淨係喺部機真係打直嗰陣先轉。
    const rot = orientMode === 'landscape' && h > w;
    root.classList.toggle('rot90', rot);
    input?.setRotated(rot);
    resize();
    return rot;
}

// 轉方向之後連續補判幾次：唔係為咗郁畫面，係為咗接住 Safari 最尾嗰個尺寸。
function settleOrientation() {
    for (const delay of [0, 80, 200, 450, 800]) setTimeout(applyOrientation, delay);
}

function setOrient(mode) {
    orientMode = mode === 'landscape' ? 'landscape' : 'portrait';
    saveOrient(orientMode);
    markSeg('#orient-seg', 'orient', orientMode);
    applyOrientation();
    return orientMode;
}

// 真正鎖得到方向嘅平台（Android Chrome 全螢幕）就鎖，慳返玩家自己扭；
// iOS Safari 唔支援，咁就靠上面自己轉。鎖唔到唔算錯，所以靜靜哋吞咗。
function tryLockLandscape() {
    if (orientMode !== 'landscape') return;
    try { screen.orientation?.lock?.('landscape')?.catch?.(() => { }); } catch { }
}

addEventListener('resize', applyOrientation);
// orientationchange 淨係用嚟重新計版面，唔會暫停亦唔會改設定
addEventListener('orientationchange', settleOrientation);
visualViewport?.addEventListener('resize', applyOrientation);
// 最後一道保險：唔理邊個事件有冇到、幾時到，個框一變就即刻重新 setSize。
// （只做 resize，唔重新判斷方向，所以唔會同上面互相觸發。）
try { new ResizeObserver(() => resize()).observe(holder); } catch { }

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
function resetPerformance() {
    performanceState.startedAt = performance.now();
    performanceState.elapsedMs = 0;
    performanceState.frames = 0;
    performanceState.windows = 0;
    performanceState.minWindowFps = null;
    performanceState.longFrames = 0;
    performanceState.maxFrameMs = 0;
    updatePerformanceNote();
}
function recordPerformanceFrame(ms) {
    if (!Number.isFinite(ms) || ms <= 0 || ms > 1000) return;
    performanceState.elapsedMs += ms;
    performanceState.frames += 1;
    performanceState.maxFrameMs = Math.max(performanceState.maxFrameMs, ms);
    if (ms > 34) performanceState.longFrames += 1;
}
function recordPerformanceWindow(fps) {
    if (!Number.isFinite(fps) || fps <= 0) return;
    performanceState.windows += 1;
    performanceState.minWindowFps = performanceState.minWindowFps == null
        ? fps : Math.min(performanceState.minWindowFps, fps);
}
function performanceReport() {
    const avgFps = performanceState.elapsedMs > 0
        ? performanceState.frames * 1000 / performanceState.elapsedMs : null;
    const audioState = audio.snapshot();
    const orientation = screen.orientation;
    return {
        seconds: performanceState.elapsedMs / 1000,
        frames: performanceState.frames,
        avgFps,
        recentFps: qualityState.fps,
        minFps: performanceState.minWindowFps,
        longFrames: performanceState.longFrames,
        maxFrameMs: performanceState.maxFrameMs,
        dpr: qualityState.dpr,
        quality: qualityMode,
        viewport: `${innerWidth}x${innerHeight}`,
        track: trackDef?.id ?? 'unknown',
        controlMode: input.controlMode,
        steerInverted: input.invert,
        gyroSupported: input.gyro.supported,
        gyroEnabled: input.gyro.on,
        gyroInverted: input.gyroInvert,
        gyroSensitivity: input.gyroSens,
        orientation: orientation?.type ?? 'unknown',
        orientationAngle: orientation?.angle ?? window.orientation ?? 0,
        abs: absOn,
        audioEnabled: audioState.enabled,
        audioReady: audioState.ready,
        audioBroken: audioState.broken,
    };
}
function performanceReportText() {
    const p = performanceReport();
    const n = v => v == null ? '--' : Math.round(v);
    const mode = QUALITY_MODES[p.quality]?.name ?? p.quality;
    const controls = p.controlMode === 'simple' ? '簡易' : '標準';
    const steer = p.steerInverted ? '反轉' : '正常';
    const gyro = !p.gyroSupported ? '不支援' : p.gyroEnabled ? '開' : '關';
    const gyroDirection = p.gyroInverted ? '預設' : '反轉';
    const audioLabel = !p.audioEnabled ? '關' : p.audioBroken ? '故障' : '開';
    return `Racing Car 3D 手機報告｜${p.seconds.toFixed(1)}s｜${p.viewport}`
        + `｜${mode} DPR ${p.dpr.toFixed(2)}｜平均 ${n(p.avgFps)} fps`
        + `｜最低 ${n(p.minFps)} fps｜長幀 ${p.longFrames}`
        + `｜最慢 ${n(p.maxFrameMs)} ms｜賽道 ${p.track}`
        + `｜操控 ${controls}/${steer}/ABS ${p.abs ? '開' : '關'}`
        + `｜陀螺 ${gyro}/${gyroDirection}/靈敏 ${p.gyroSensitivity.toFixed(1)}`
        + `｜方向 ${p.orientation}@${p.orientationAngle}°`
        + `｜音效 ${audioLabel}${p.audioEnabled && p.audioReady ? '/已啟動' : ''}`;
}
function updatePerformanceNote() {
    const el = $('device-report');
    if (!el) return;
    if (!performanceState.frames && !performanceState.windows) {
        el.textContent = '跑一段路再返回選單，就會有實機 FPS 報告。';
        return;
    }
    el.textContent = performanceReportText();
}
async function copyPerformanceReport() {
    const text = performanceReportText();
    let copied = false;
    try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.writeText(text);
        copied = true;
    } catch {
        const box = document.createElement('textarea');
        box.value = text;
        box.style.position = 'fixed'; box.style.opacity = '0';
        document.body.appendChild(box); box.select();
        try { copied = document.execCommand('copy'); } finally { box.remove(); }
    }
    const btn = $('copy-report-btn');
    btn.textContent = copied ? '已複製' : '請長按上面報告';
    setTimeout(() => { btn.textContent = '複製報告'; }, 1200);
    return text;
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
    recordPerformanceWindow(fps);
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
    if (!running || document.hidden) {
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
const renderSurfacePose = { y: 0, bank: 0, pitch: 0 };
let camInit = false;      // 鏡頭要唔要即刻歸位（換賽道／重開都會用到）
let cameraThrust = 0;
let cameraPulse = 0;

// 賽道可以換：換嗰陣要 dispose 舊嗰個，唔係每揀一次就漏一份 3D 世界
const minimap = new Minimap($('minimap'));
const rivals = new RivalField(scene);
let rivalCount = loadRivals();

// 幽靈姿勢嘅相容介面；真正畫面併入 rivals 同一個 instanced draw（ADR-054）。
let ghostOn = loadGhostOn();
let absOn = loadAbs();
const ghostRecorder = new GhostRecorder();
const ghostPlayer = new GhostPlayer();
const ghostMesh = new THREE.Object3D();
ghostMesh.visible = false;
let ghostLapBest = null, lastLapCount = 0, lapProgressBase = 0;

// 錦標賽：自選賽程連跑。載返上次未跑完嗰個，唔使由頭嚟過。
const TRACK_POOL = TRACKS.map(t => t.id);
const season = new Season(TRACK_POOL);
let seasonList = loadSeasonList(TRACK_POOL, DEFAULT_SEASON);
season.load();

let trackDef = trackById(localStorage.getItem('racer-track') ?? TRACKS[0].id);
let track = null;
function syncCarRenderSurface() {
    if (!car || !track?.renderPoseAt) return;
    track.renderPoseAt(car.pos.x, car.pos.z, renderSurfacePose);
    car.setRenderSurface(renderSurfacePose.y, renderSurfacePose.bank, renderSurfacePose.pitch);
}
function buildTrack(id) {
    trackDef = trackById(id);
    try { localStorage.setItem('racer-track', trackDef.id); } catch { }
    track?.dispose(scene);
    track = new Track(trackDef.waypoints, trackDef.tension, trackDef.id);
    track.build(scene);
    track.setTimeOfDay(tod);
    drivingEffects.reset();
    rivals.clear();
    minimap.setTrack(track);
    if (car) { car.reset(track.startPos, track.startDir); syncCarRenderSurface(); }
    if (race) { race.track = track; race.trackId = trackDef.id; race.reset(); }
    camInit = false;
    cameraThrust = 0; cameraPulse = 0;
    requestRender();
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

function applyCloudTime(id) {
    const material = clouds.children[0]?.material;
    if (!material) return;
    // 夜晚 0.2 opacity 嘅雲幾乎睇唔到，但仍食一個 draw。保留星空／月光／
    // 車頭燈，夜雲就停畫，留返預算畀對手、幽靈同駕駛效果一齊出現。
    clouds.visible = id !== 'night';
    material.color.setHex(id === 'night' ? 0x7384a8 : id === 'dusk' ? 0xffc3a2 : 0xffffff);
    material.opacity = id === 'night' ? 0.2 : id === 'dusk' ? 0.42 : 0.58;
}
applyCloudTime(tod);

// ---------- 載車 ----------
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('./vendor/draco/');
const CAR_VISUAL_LENGTH = 6.9; // 10.35 縮細三分之一；物理碰撞維持不變
const CAR_VISUAL_SCALE = CAR_VISUAL_LENGTH / 4.6;
loader.setDRACOLoader(draco);

// 模型可能係任何朝向／尺寸：量度包圍盒，轉到「車頭向 +z」再縮到指定長度。
// 呢個模型（Tripo 生成）車頭係向 -z，所以對齊完之後仲要再轉 180°；
// 唔轉嘅話成架車倒後行，玩家仲會覺得左右轉向係反嘅——其實物理啱晒，
// 淨係模型朝向錯。
function normalizeCar(obj, targetLength = CAR_VISUAL_LENGTH) {
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

// 音效：即時合成，唔載音檔。第一下觸碰就 unlock，唔係嘅話 iOS 會靜曬。
const audio = createRacerAudio();
addEventListener('pointerdown', () => audio.unlock(), { once: true });
addEventListener('keydown', () => audio.unlock(), { once: true });

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
        new THREE.PlaneGeometry(5.4 * CAR_VISUAL_SCALE, 7.2 * CAR_VISUAL_SCALE),
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
    car.abs = absOn;
    scene.add(car.root);
    environment.attachCar(car.root);
    environment.apply(TIMES[tod], tod);
    shadow = contactShadow();
    scene.add(shadow);
    car.reset(track.startPos, track.startDir);
    race = new Race(track, { laps: 3, trackId: trackDef.id, onEvent: handleRaceEvent });
    buildTrackButtons();
    buildSettings();
    buildSeasonPicker();
    applyOrientation();          // 照玩家揀咗嘅方向擺好版面
    // 第一次 active frame 先畫 minimap／填 HUD 會喺手機產生明顯長幀。
    // 趁 loading 遮罩仲喺度先預熱 Canvas2D 同文字 layout；WebGL 第一幀
    // render 完先揭開選單，玩家唔會撳 Start 撞正 shader compile。
    hudCache = {};
    updateHud();
    minimap.draw(car);
    revealMenuAfterRender = true;
    // 畀自動化測試用；track 用 getter，換賽道之後攞到嘅係新嗰個
    window.__racer = {
        car, race, renderer, scene, camera, environment, drivingEffects, rivals,
        restart, startRace, buildTrack, TRACKS, input, minimap, setRivals,
        get rivalCount() { return rivalCount; },
        setColour, setTod, setQuality, setGhost, setAbs, get abs() { return absOn; }, season, startSeason, renderSeasonPanel, ghostRecorder, ghostPlayer, ghostMesh,
        setSeasonList, seasonHistory: loadHistory, clearSeasonHistory: clearHistory, audio,
        updateSeasonMenu,
        get seasonList() { return [...seasonList]; },
        // 測試要喺唔行 rAF 嘅情況下推進幽靈邏輯
        updateGhostForTest: (dt) => { advancePlayerProgress(); updateGhost(dt); },
        playerProgressForTest: playerProgress,
        get ghostOn() { return ghostOn; },
        get ghostDelta() { return ghostDelta; }, tuneAutoQuality, pauseRace, resumeRace, toMenu,
        performanceReport, performanceReportText, copyPerformanceReport,
        coarsePointer, applyOrientation, setOrient,
        // 條漂移角度條讀得啱唔啱，要驗就要叫得郁 HUD
        updateHudForTest: () => { hudCache = {}; updateHud(); },
        get orient() { return orientMode; },
        get rotated() { return root.classList.contains('rot90'); },
        get portrait() { return isPortrait(); },
        get track() { return track; },
        get trackDef() { return trackDef; },
        get tod() { return tod; },
        get colour() { return colour; },
        get quality() { return { ...qualityState }; },
        get running() { return running; },
        get paused() { return paused; },
        get wakeLockActive() { return !!wakeLock; },
        get contextLost() { return contextLost; },
        get ready() { return carReadyRendered; },
        get renderCount() { return renderCount; },
        get performance() { return { ...performanceState }; },
        visualLength: CAR_VISUAL_LENGTH,
    };
    requestRender();
}, undefined, (err) => {
    $('loading').innerHTML = `<div class="loading-box"><div class="loading-label">⚠️ 載入失敗</div></div>`;
    console.error(err);
});

// ---------- 鏡頭：跟車 ----------
const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
const chaseDir = new THREE.Vector3(0, 0, 1);
// updateCamera() 係每幀 hot path；重用呢幾個 scratch vectors，避免只係
// 做鏡頭 feedback 就不停分配短命 Vector3，尤其手機 swiftshader／低記憶體
// 裝置會將呢啲 allocation 變成可見長幀。
const camHeading = new THREE.Vector3();
const camTravel = new THREE.Vector3();
const camWantDir = new THREE.Vector3();
const camWant = new THREE.Vector3();
const camLookAt = new THREE.Vector3();
const raceTangent = new THREE.Vector3();
function updateCamera(dt) {
    const heading = camHeading.set(Math.sin(car.yaw), 0, Math.cos(car.yaw));
    // 鏡頭唔可以淨係跟車頭：甩到八十幾度嗰陣車係打橫飛，跟車頭嘅話架車
    // 會直接飛出畫面（實測 45 幀手煞之後成架車跌咗落畫面底邊）。
    // 甩得愈勁就愈跟「行進方向」，咁架車就會打橫留喺畫面中間——
    // 亦即係漂移遊戲嗰種標準機位。
    const travel = car.speed > 3
        ? camTravel.set(car.vel.x, 0, car.vel.z).normalize()
        : camTravel.copy(heading);
    const blend = Math.min(1, Math.abs(car.slipAngle) / 0.9) * 0.8;
    const want3 = camWantDir.copy(heading).lerp(travel, blend).normalize();
    chaseDir.lerp(want3, Math.min(1, dt * 5)).normalize();
    const fwd = chaseDir;
    const speedT = Math.min(1, car.speed / 60);
    const wideMobile = camera.aspect > 1.45;
    // 追車機位再落低、收近少少：車身姿態同路肩速度先讀得出，唔會只見到
    // 一大片天空。寬手機仍保留前望距離，避免低頭睇車而睇唔到下一個彎。
    // 機位再收近少少，車身先會成為主角；原本寬屏 8.5m 後車距令架車得
    // 一個細模型咁大，路面比例反而搶晒畫面。保留高速拉遠，唔會遮住下一個彎。
    const dist = (10.8 + speedT * 3.0) * (wideMobile ? 0.68 : 0.88);
    const want = camWant.copy(car.pos).addScaledVector(fwd, -dist);
    want.y = car.renderY + (6.7 + speedT * 1.4) * (wideMobile ? 0.72 : 0.94);
    // 加油／煞車嘅瞬間，鏡頭有一個極細嘅反向載荷位移；唔改物理，只畀
    // 玩家讀到「推背／點頭」，而且有平滑上限，唔會變成震鏡頭。
    const thrustTarget = THREE.MathUtils.clamp(car.longAccel / 14, -1, 1);
    cameraThrust += (thrustTarget - cameraThrust) * Math.min(1, dt * 11);
    cameraPulse += (Math.min(1, car.speed / 48) - cameraPulse) * Math.min(1, dt * 5);
    want.addScaledVector(fwd, -cameraThrust * 0.24);
    want.y += Math.sin(performance.now() * 0.012) * cameraPulse * 0.018;
    const lookAt = camLookAt.copy(car.pos).addScaledVector(fwd, wideMobile ? 15 : 21)
        .setY(car.renderY + 0.55);
    if (!camInit) { camPos.copy(want); camLook.copy(lookAt); camInit = true; }
    // 追car 用指數平滑。唔可以再喺漂移時特登放鬆——方向本身已經跟住
    // 行進方向擺，位置再拖就會framing唔到架車。
    const lag = 6.5;
    camPos.lerp(want, Math.min(1, dt * lag));
    camLook.lerp(lookAt, Math.min(1, dt * 8));
    camera.position.copy(camPos).add(drivingEffects.cameraOffset());
    camera.lookAt(camLook);
    // 速度愈快視角愈闊，速度感靠呢個
    const fov = (wideMobile ? 61 : 64) + speedT * (wideMobile ? 13 : 14);
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
    // 只跟偏航速度做極細嘅 horizon roll；唔用車身 roll，避免漂移時鏡頭反而
    // 跟住車身傾到似飛機。幅度 < 1.5°，用嚟讀出速度同重量感。
    camera.rotation.z += THREE.MathUtils.clamp(-car.yawRate * 0.018 - camera.rotation.z, -0.026, 0.026);
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
    requestRender();
}
function setAbs(on) {
    absOn = !!on;
    saveAbs(absOn);
    if (car) car.abs = absOn;
    markSeg('#abs-seg', 'abs', absOn ? 1 : 0);
    return absOn;
}
function setGhost(on) {
    ghostOn = !!on;
    saveGhostOn(ghostOn);
    if (!ghostOn) {
        ghostMesh.visible = false;
        rivals.clearGhost();
    }
    document.querySelectorAll('#ghost-seg button').forEach(b =>
        b.classList.toggle('on', (b.dataset.ghost === '1') === ghostOn));
    return ghostOn;
}
function setRivals(n) {
    rivalCount = Math.max(0, Math.min(4, n | 0));
    saveRivals(rivalCount);
    document.querySelectorAll('#rival-seg button').forEach(b =>
        b.classList.toggle('on', Number(b.dataset.rivals) === rivalCount));
    return rivalCount;
}
function setTod(id) {
    tod = TIMES[id] ? id : 'day';
    saveTod(tod);
    applyTime(tod, { scene, renderer, sun, hemi, environment });
    applyCloudTime(tod);
    track?.setTimeOfDay(tod);
    document.querySelectorAll('#tod-seg button').forEach(b =>
        b.classList.toggle('on', b.dataset.tod === tod));
    requestRender();
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

    for (const b of document.querySelectorAll('#audio-seg button')) {
        b.addEventListener('click', () => {
            audio.setEnabled(b.dataset.audio === '1');
            // 一定要喺呢下 click 入面 unlock：iOS 淨係認真手勢
            if (audio.enabled) audio.unlock();
            markSeg('#audio-seg', 'audio', audio.enabled ? 1 : 0);
        });
    }
    markSeg('#audio-seg', 'audio', audio.enabled ? 1 : 0);

    for (const b of document.querySelectorAll('#tod-seg button')) {
        b.addEventListener('click', () => setTod(b.dataset.tod));
    }

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

    const showControlMode = () => {
        markSeg('#control-mode-seg', 'controls', input.controlMode);
        document.body.classList.toggle('simple-controls', input.controlMode === 'simple');
        const gas = $('pad-gas');
        gas.setAttribute('aria-label', input.controlMode === 'simple' ? '自動加速中' : '油門');
        gas.querySelector('.action-icon').textContent = input.controlMode === 'simple' ? 'AUTO' : '»';
        gas.querySelector('.action-label').textContent = input.controlMode === 'simple' ? '自動' : '油門';
    };
    for (const b of document.querySelectorAll('#control-mode-seg button')) {
        b.addEventListener('click', () => {
            input.setControlMode(b.dataset.controls);
            showControlMode();
        });
    }
    showControlMode();

    for (const b of document.querySelectorAll('#rival-seg button')) {
        b.addEventListener('click', () => setRivals(Number(b.dataset.rivals)));
    }
    setRivals(rivalCount);

    for (const b of document.querySelectorAll('#abs-seg button')) {
        b.addEventListener('click', () => setAbs(b.dataset.abs === '1'));
    }
    setAbs(absOn);

    for (const b of document.querySelectorAll('#orient-seg button')) {
        b.addEventListener('click', () => setOrient(b.dataset.orient));
    }
    setOrient(orientMode);

    for (const b of document.querySelectorAll('#ghost-seg button')) {
        b.addEventListener('click', () => setGhost(b.dataset.ghost === '1'));
    }
    setGhost(ghostOn);
    $('ghost-clear-btn').addEventListener('click', () => {
        clearGhost(trackDef.id);
        ghostPlayer.load(trackDef.id);
        ghostMesh.visible = false;
        rivals.clearGhost();
        const btn = $('ghost-clear-btn');
        btn.textContent = '已清除';
        setTimeout(() => { btn.textContent = '清除幽靈'; }, 1200);
    });

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
                ? '揸車嗰陣扭手機轉向。開嗰刻手機咩姿勢就當「軚盤打直」，'
                + '坐姿變咗就撳「校正」重設。扭到約 ' + Math.round(30 / input.gyroSens)
                + '° 就係全軚，中間位特登做得幼細。'
                : '呢部機／呢個瀏覽器唔畀用陀螺儀（iPhone 要喺 Safari 而且係 https）。';
        });
    }
    markSeg('#gyro-seg', 'gyro', 0);
    // 上次揀咗開嘅話都要玩家再撳一次——權限唔可以自動攞
    if (localStorage.getItem(GYRO_KEY) === '1') {
        note.classList.remove('hidden');
        note.textContent = '上次你開咗陀螺儀。iOS 要每次入嚟撳一次「開」先攞得到權限。';
    }

    for (const b of document.querySelectorAll('#gyro-dir-seg button')) {
        b.addEventListener('click', () => {
            input.setGyroInvert(b.dataset.gyroinv === '1');
            markSeg('#gyro-dir-seg', 'gyroinv', input.gyroInvert ? 1 : 0);
        });
    }
    markSeg('#gyro-dir-seg', 'gyroinv', input.gyroInvert ? 1 : 0);

    $('gyro-cal-btn').addEventListener('click', () => {
        input.calibrateGyro();
        const btn = $('gyro-cal-btn');
        btn.textContent = '已校正';
        setTimeout(() => { btn.textContent = '校正'; }, 1200);
    });

    const sens = $('gyro-sens');
    sens.value = String(input.gyroSens);
    sens.addEventListener('input', () => input.setGyroSens(Number(sens.value)));
}

// 錦標賽面板：完賽畫面顯示總積分，同埋「下一場」定「睇總成績」。
// seasonCounted 記住啱啱嗰場有冇計入賽程——重跑同一條賽道係練習，唔計。
let seasonCounted = true;
function renderSeasonPanel() {
    const box = $('season-box');
    const nextBtn = $('next-race-btn');
    if (!season.active) {
        box.classList.add('hidden');
        nextBtn.classList.add('hidden');
        return;
    }
    box.classList.remove('hidden');
    const done = season.finished;
    $('season-title').textContent = done
        ? '🏆 錦標賽總成績'
        : `錦標賽 · 已跑 ${season.round} / ${season.totalRounds} 場`;
    const list = $('season-rows');
    list.innerHTML = '';
    for (const row of season.standings()) {
        const el = document.createElement('div');
        el.className = 'stand-row' + (row.label === '你' ? ' me' : '');
        el.innerHTML = `<span class="stand-place">${row.place}</span>`
            + `<span class="stand-name">${row.label}</span>`
            + `<b class="stand-time">${row.points} 分</b>`;
        list.appendChild(el);
    }
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = done ? '完結錦標賽' : `下一場：${trackById(season.currentTrack).name}`;
    const record = $('season-record-note');
    if (done) {
        const c = season.career;
        const latest = season.lastCompletion;
        record.textContent = `${latest?.champion ? '🏆 今屆冠軍 · ' : ''}`
            + `生涯 ${c.seasons} 屆 · ${c.titles} 冠 · 最佳第 ${c.bestPlace ?? '--'}`;
        record.classList.toggle('record-hot', !!latest?.newBest);
    } else {
        // 唔計入賽程嗰陣一定要講明，否則個表照住升，玩家以為跑咗一場
        record.textContent = seasonCounted
            ? `分站紀錄已保存 · 尚餘 ${season.totalRounds - season.round} 場`
            : `練習賽 · 唔計入錦標賽 · 下一場：${trackById(season.currentTrack).name}`;
        record.classList.remove('record-hot');
    }
}

function startSeason() {
    season.start(seasonList);
    buildTrack(season.currentTrack);
    if (rivalCount < 2) setRivals(2);
    updateSeasonMenu();
    startRace();
}

// 賽程自選：邊幾條賽道、乜嘢次序，全部由玩家話事。跑緊嗰屆用返開波
// 嗰刻鎖低嘅賽程（存喺 Season 度），改設定唔會偷換到跑緊嗰張表。
function setSeasonList(ids) {
    const cleaned = [];
    for (const id of Array.isArray(ids) ? ids : []) {
        if (TRACK_POOL.includes(id) && !cleaned.includes(id)) cleaned.push(id);
    }
    // 揀到一條都唔剩會開出一個「零場」錦標賽，所以最少留返一條
    seasonList = cleaned.length ? cleaned : [DEFAULT_SEASON[0]];
    saveSeasonList(seasonList);
    document.querySelectorAll('#season-track-seg button').forEach(b =>
        b.classList.toggle('on', seasonList.includes(b.dataset.track)));
    updateSeasonMenu();
    return seasonList;
}

function buildSeasonPicker() {
    const seg = $('season-track-seg');
    if (!seg) return;
    seg.innerHTML = '';
    for (const t of TRACKS) {
        const b = document.createElement('button');
        b.dataset.track = t.id;
        b.textContent = t.name;
        b.addEventListener('click', () => {
            const next = seasonList.includes(t.id)
                ? seasonList.filter(id => id !== t.id)
                : [...TRACK_POOL].filter(id => id === t.id || seasonList.includes(id));
            setSeasonList(next);
        });
        seg.appendChild(b);
    }
    setSeasonList(seasonList);
}

function updateSeasonMenu() {
    const note = $('season-note');
    if (!note) return;
    const names = seasonList.map(id => trackById(id).name).join(' → ');
    const btn = $('season-btn');
    if (btn) btn.textContent = `🏆 錦標賽（${seasonList.length} 場）`;
    if (!season.active) {
        note.textContent = `連跑 ${names}，逐場儲積分。`;
    } else if (season.finished) {
        const champ = season.standings()[0];
        note.textContent = `上次錦標賽已完成，冠軍：${champ?.label ?? '--'}。再撳就用新賽程重新開始。`;
    } else {
        note.textContent = `跑緊第 ${season.round + 1} / ${season.totalRounds} 場 · `
            + `${trackById(season.currentTrack).name}`;
        if (season.trackIds.join() !== seasonList.join()) {
            note.textContent += '（改咗賽程？下屆先生效）';
        }
    }
    renderSeasonHistory();
    renderSeasonRecords();
}

// 歷屆榜：淨係報冠軍同你自己排第幾。錦標賽一 clear 就冇晒紀錄嘅話，
// 連「上次係邊個贏」都答唔到，跨屆根本冇任何延續感。
function renderSeasonHistory() {
    const box = $('season-history');
    if (!box) return;
    const hist = loadHistory();
    if (!hist.length) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    box.classList.remove('hidden');
    box.innerHTML = '<div class="section-label">歷屆錦標賽</div>';
    for (const h of hist) {
        const el = document.createElement('div');
        el.className = 'stand-row' + (h.playerPlace === 1 ? ' me' : '');
        const mine = h.playerPlace ? `你第 ${h.playerPlace}` : '未參賽';
        el.innerHTML = `<span class="stand-name">🏆 ${h.champion ?? '--'}</span>`
            + `<span class="hist-sub">${h.rounds} 場 · ${mine}</span>`
            + `<b class="stand-time">${h.championPoints} 分</b>`;
        box.appendChild(el);
    }
    const clear = document.createElement('button');
    clear.className = 'report-btn';
    clear.id = 'season-hist-clear';
    clear.textContent = '清除歷屆紀錄';
    clear.addEventListener('click', () => { clearHistory(); renderSeasonHistory(); });
    box.appendChild(clear);
}

function renderSeasonRecords() {
    const c = season.career;
    $('season-career').textContent = c.seasons
        ? `${c.seasons} 屆 · ${c.titles} 冠 · 最佳第 ${c.bestPlace}`
        : '未完成過';
    const tr = season.trackRecord(trackDef.id);
    $('season-track-label').textContent = `${trackDef.name}分站`;
    $('season-track-career').textContent = tr.races
        ? `${tr.races} 戰 · ${tr.wins} 勝 · 最佳第 ${tr.bestPlace}`
        : '未出賽';
}

function refreshBest() {
    if (!race) return;
    const saved = race.loadBest();
    $('menu-best').textContent = saved.bestLap == null ? '未有紀錄' : fmtTime(saved.bestLap);
    $('menu-score').textContent = saved.bestScore ? saved.bestScore.toLocaleString() : '0';
    renderSeasonRecords();
}

// ---------- HUD ----------
function handleRaceEvent(kind, data) {
    audio.event(kind, data);
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
    audio.stopRace();
    updatePerformanceNote();
    $('screen-pause').classList.add('hidden');
    $('finish-total').textContent = fmtTime(total);
    $('finish-best').textContent = fmtTime(best);
    $('finish-drift').textContent = drift.toLocaleString();
    $('finish-bestdrift').textContent = bestDrift.toLocaleString();
    $('finish-record').textContent = bestScore.toLocaleString();
    const placeRow = $('finish-place-row');
    const board = $('finish-standings');
    if (rivals.count) {
        placeRow.classList.remove('hidden');
        board.classList.remove('hidden');
        // 上面嗰行同下面個表一定要用同一套排法。之前上面用「沿線進度」、
        // 下面用「完賽時間」——跑完嘅對手進度會凍結喺 3.0 附近，同玩家爭
        // 浮點數，於是出現「第 1 / 5」但個表寫你第 4 咁樣自打嘴巴。
        const rows = rivals.results(total, playerProgress());
        const mine = rows.find(row => row.player);
        seasonCounted = season.record(rows, trackDef.id) !== null;
        $('finish-place').textContent = `第 ${mine.place} / ${rows.length}`;
        board.innerHTML = '';
        for (const row of rows) {
            const el = document.createElement('div');
            el.className = 'stand-row' + (row.player ? ' me' : '');
            const swatch = `#${row.colour.toString(16).padStart(6, '0')}`;
            // 未跑完嘅唔報時間——報咗就等於作大一個佢未跑到嘅數字
            const right = row.finished
                ? (row.gap == null ? fmtTime(row.time) : `+${row.gap.toFixed(2)}`)
                : '未完成';
            el.innerHTML = `<span class="stand-place">${row.place}</span>`
                + `<i class="stand-dot" style="background:${swatch}"></i>`
                + `<span class="stand-name">${row.label}</span>`
                + `<b class="stand-time">${right}</b>`;
            board.appendChild(el);
        }
    } else {
        placeRow.classList.add('hidden');
        board.classList.add('hidden');
    }
    const list = $('finish-laps');
    list.innerHTML = '';
    laps.forEach((t, i) => {
        const row = document.createElement('div');
        row.className = 'lap-row' + (t === Math.min(...laps) ? ' fastest' : '');
        row.innerHTML = `<span>第 ${i + 1} 圈</span><b>${fmtTime(t)}</b>`;
        list.appendChild(row);
    });
    renderSeasonPanel();
    $('screen-finish').classList.remove('hidden');
}

// 幽靈車：錄住今圈、同時重播最快嗰圈。兩件事都用「呢一圈行咗幾多」做基準，
// 唔用時間——今圈慢咗嘅話，逐幀對時會令幽靈車出現喺完全唔相干嘅位置。
let ghostDelta = null;
function updateGhost(dt) {
    const lapProgress = playerProgress() - lapProgressBase;
    if (race.state === 'racing') ghostRecorder.sample(dt, car, lapProgress);

    // 一圈完咗：夠快就取代舊嘅幽靈
    if (race.lapTimes.length !== lastLapCount) {
        lastLapCount = race.lapTimes.length;
        const lapTime = race.lapTimes[lastLapCount - 1];
        if (ghostRecorder.commit(trackDef.id, lapTime, ghostLapBest)) ghostPlayer.load(trackDef.id);
        ghostLapBest = race.best;
        lapProgressBase = playerProgressValue;
    }

    if (!ghostOn || !ghostPlayer.available || race.state !== 'racing') {
        ghostMesh.visible = false;
        rivals.clearGhost();
        ghostDelta = null;
        return;
    }
    const p = ghostPlayer.at(race.lapTime);
    if (!p) { ghostMesh.visible = false; rivals.clearGhost(); return; }
    ghostMesh.position.set(p.x, 0, p.z);
    ghostMesh.rotation.y = p.yaw;
    ghostMesh.visible = true;
    rivals.setGhost(ghostMesh.position, ghostMesh.rotation.y);
    const at = ghostPlayer.timeAtProgress(lapProgress);
    ghostDelta = at == null ? null : race.lapTime - at;
}

// 玩家進度用同對手一模一樣嘅累積計法，名次先至比得埋一齊
let playerT = 0, playerProgressValue = 0;
function resetPlayerProgress() {
    playerT = track.nearestT(car.pos.x, car.pos.z);
    playerProgressValue = signedFrac(playerT, track.startT);
}
// 每幀行一次，喺物理更新之後。之前呢個推進係擺喺 playerProgress() 入面，
// 由 updateHud() 順手帶起——即係話「玩家跑到邊」呢個狀態，靠住 HUD 有冇
// 畫過先會前進。幽靈車同名次兩樣都食呢個值，唔可以係 HUD 嘅副作用。
function advancePlayerProgress() {
    const t = track.nearestT(car.pos.x, car.pos.z);
    playerProgressValue += trackDelta(t, playerT);
    playerT = t;
    return playerProgressValue;
}
function playerProgress() { return playerProgressValue; }

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
        // 角度條要對住架車真正嘅可控範圍，唔可以自己揀個靚數。
        // 舊寫法係 0–60° 對應 0–100%，但 60° 已經係打緊圈：一個維持得住嘅
        // 31° 漂移得 52%，而「hot」（42°）喺動力過彎收晒（46°）之後基本上
        // 摸唔到。而家直接由物理常數推：計分門檻（15°）＝ 0%，動力過彎收晒
        // 嗰點（46°）＝ 100%，即係條 bar 讀嘅係「離失控幾遠」。
        // 用 CFG 而唔係抄個數，係為咗物理一改條 bar 就跟住改。
        const lo = CAR_CFG.driftPowerLo, hi = CAR_CFG.driftPowerOut;
        const pct = Math.max(0, Math.min(100, (Math.abs(car.slipAngle) - lo) / (hi - lo) * 100));
        $('drift-angle-fill').style.width = `${pct}%`;
        $('drift-angle-fill').classList.toggle('hot', pct > 85);
    }
    const score = race.driftScore;
    if (score !== hudCache.score) { $('score-num').textContent = score.toLocaleString(); hudCache.score = score; }

    const kmh = car.kmh;
    if (kmh !== hudCache.kmh) { $('speed-num').textContent = kmh; hudCache.kmh = kmh; }
    // 速度層唔等到極速先出：寬屏手機路面比例闊，約 80 km/h 已經需要
    // 一點周邊流動感；仍然由低透明度漸進，唔遮 HUD／唔改物理。
    const speedIntensity = THREE.MathUtils.clamp((car.speed - 16) / 30, 0, 1);
    const speedLines = $('speed-lines');
    if (speedLines) {
        speedLines.style.setProperty('--speed-intensity', String(speedIntensity));
        speedLines.classList.toggle('active', speedIntensity > 0.02);
        speedLines.classList.toggle('drifting', car.drifting);
    }
    // 名次：對手同玩家一齊按進度排。冇對手就唔顯示，唔好霸位。
    const place = rivals.count ? rivals.playerPlace(playerProgress()) : 0;
    if (place !== hudCache.place) {
        const box = $('place-box');
        box.classList.toggle('hidden', !place);
        if (place) box.innerHTML = `<b>${place}</b><span>/${rivals.count + 1}</span>`;
        hudCache.place = place;
    }
    // 同自己最快圈嘅差距：快咗綠色、慢咗紅色
    const gap = ghostDelta == null ? '' : `${ghostDelta >= 0 ? '+' : '−'}${Math.abs(ghostDelta).toFixed(2)}`;
    if (gap !== hudCache.gap) {
        const box = $('gap-box');
        box.classList.toggle('hidden', !gap);
        box.textContent = gap;
        box.classList.toggle('ahead', ghostDelta != null && ghostDelta < 0);
        hudCache.gap = gap;
    }
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
let contextLost = false;
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
    if (contextLost) return false;
    // 錦標賽逐場指定賽道；對手最少兩架，唔係嘅話積分表得你一個名
    if (season.active && !season.finished) {
        if (trackDef.id !== season.currentTrack) buildTrack(season.currentTrack);
        if (rivalCount < 2) setRivals(2);
    }
    $('screen-start').classList.add('hidden');
    $('screen-finish').classList.add('hidden');
    $('screen-pause').classList.add('hidden');
    $('hud').classList.remove('hidden');
    input.reset();
    car.reset(track.startPos, track.startDir);
    syncCarRenderSurface();
    drivingEffects.reset();
    rivals.spawn(track, rivalCount, race.totalLaps);
    resetPlayerProgress();
    ghostRecorder.reset();
    ghostPlayer.load(trackDef.id);
    ghostLapBest = race.loadBest().bestLap;
    lastLapCount = 0;
    lapProgressBase = 0;
    ghostMesh.visible = false;
    camInit = false;
    cameraThrust = 0; cameraPulse = 0;
    race.reset();
    hudCache = {};
    resetPerformance();
    paused = false;
    running = true;
    last = performance.now();
    if (qualityMode === 'auto') setQuality('auto', false); // 每場由裝置安全上限重新量
    requestWakeLock();
    tryLockLandscape();
    audio.startRace();
    ensureFrame();
    return true;
}
function restart() { startRace(); }
function pauseRace(reason = '比賽進度已保留') {
    if (!running) return false;
    running = false;
    paused = true;
    input.reset();
    releaseWakeLock();
    audio.suspend();
    updatePerformanceNote();
    $('pause-reason').textContent = reason;
    $('screen-pause').classList.remove('hidden');
    return true;
}
function resumeRace() {
    if (contextLost || !paused || race?.state === 'finished') return false;
    paused = false;
    running = true;
    last = performance.now();
    $('screen-pause').classList.add('hidden');
    requestWakeLock();
    audio.resume();
    ensureFrame();
    return true;
}
function toMenu() {
    running = false;
    paused = false;
    input.reset();
    releaseWakeLock();
    audio.stopRace();
    updatePerformanceNote();
    refreshBest();
    $('screen-finish').classList.add('hidden');
    $('screen-pause').classList.add('hidden');
    $('hud').classList.add('hidden');
    $('screen-start').classList.remove('hidden');
}

$('start-btn').addEventListener('click', startRace);
$('again-btn').addEventListener('click', restart);
$('next-race-btn').addEventListener('click', () => {
    if (season.finished) { season.clear(); updateSeasonMenu(); toMenu(); return; }
    buildTrack(season.currentTrack);
    startRace();
});
$('season-btn').addEventListener('click', startSeason);
$('menu-btn').addEventListener('click', toMenu);
$('pause-btn').addEventListener('click', () => pauseRace());
$('resume-btn').addEventListener('click', resumeRace);
$('reload-btn').addEventListener('click', () => location.reload());
$('pause-menu-btn').addEventListener('click', toMenu);
$('copy-report-btn').addEventListener('click', copyPerformanceReport);
document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseRace('你離開咗遊戲，進度已安全暫停');
    // 返嚟嗰陣重新判斷一次：喺背景嗰時轉咗方向，iOS 未必補派事件畀我哋。
    else settleOrientation();
});
addEventListener('pagehide', () => pauseRace('遊戲頁面已暫停，進度已保留'));

// 手機瀏覽器喺記憶體壓力／切 App 時可以收走 WebGL context。Three.js 會重建
// GPU 資源，但遊戲亦必須同步凍結物理同 input；否則黑畫面期間架車照樣撞牆。
renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    contextLost = true;
    if (running) pauseRace('手機暫停咗 3D 畫面，正在恢復…');
    else {
        input.reset();
        releaseWakeLock();
        $('pause-reason').textContent = '手機暫停咗 3D 畫面，正在恢復…';
        $('screen-pause').classList.remove('hidden');
    }
    $('resume-btn').disabled = true;
    $('pause-menu-btn').disabled = true;
    $('reload-btn').classList.remove('hidden');
});
renderer.domElement.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    requestRender();
    $('resume-btn').disabled = false;
    $('pause-menu-btn').disabled = false;
    $('reload-btn').classList.add('hidden');
    if (paused) $('pause-reason').textContent = '3D 畫面已恢復，可以繼續比賽';
    else $('screen-pause').classList.add('hidden');
});

// ---------- 主迴圈 ----------
function frame(now) {
    frameHandle = 0;
    // race.update 可能喺呢一幀觸發 finish 並將 running 變 false；記住入幀時
    // 嘅狀態，確保終點嗰一幀仍然畫得出，之後先停 loop。
    const activeFrame = running;
    const rawFrameMs = Math.max(0, now - last);
    const dt = Math.min(0.05, rawFrameMs / 1000);   // 夾住 dt：切 tab 返嚟唔好一下衝出賽道
    last = now;
    if (activeFrame) recordPerformanceFrame(rawFrameMs);
    if (car && (activeFrame || renderDirty)) {
        if (activeFrame) {
            const cmd = race.state === 'racing'
                ? input.read(dt, car.speed)
                : { throttle: 0, steer: 0, handbrake: false };
            car.update(dt, cmd, track);
            // 打完圈救返車：AI 有救車狀態機（ADR-065），玩家一直冇。實測打橫
            // 150° 之後，一個簡易模式玩家淨係識打軚，25 秒都扭唔返，最後倒住
            // 沿賽道行 -20 km/h——即係一次失誤就一場完。條件夠窄（差不多停定
            // 而且指錯 80° 以上），正常揸車同漂移都踩唔中。
            if (race.state === 'racing') {
                const tt = track.nearestT(car.pos.x, car.pos.z);
                const tan = track.curve.getTangentAt(tt, raceTangent);
                car.unspin(tan.x, tan.z, dt);
            }
            audio.update(dt, car, cmd);
            race.update(dt, car);
            // 對手行喺玩家之後：咁樣分開兩架車嗰下推力已經用咗今幀嘅新位置
            advancePlayerProgress();
            rivals.update(dt, track, car);
            updateGhost(dt);
            drivingEffects.update(dt, car, cmd);
            updateHud();
            minimap.draw(car, rivals.rivals);
        }
        if (shadow) {
            shadow.position.set(car.pos.x, car.renderY, car.pos.z);
            shadow.rotation.y = car.yaw;
        }
        updateCamera(dt);
    }
    if (activeFrame || renderDirty) {
        environment.follow(camera);
        renderer.render(scene, camera);
        renderCount += 1;
        if (car && !carReadyRendered) {
            carReadyRendered = true;
            if (revealMenuAfterRender) {
                revealMenuAfterRender = false;
                $('loading').classList.add('hidden');
                $('screen-start').classList.remove('hidden');
            }
        }
        renderDirty = false;
    }
    sampleAutoQuality(now);
    if (running) ensureFrame();
}
resize();
ensureFrame();
