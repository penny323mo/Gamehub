// 方塊賽車 —— 入口：載模型、砌世界、跑主迴圈、駁 HUD。

import * as THREE from 'three';
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { DRACOLoader } from '../vendor/DRACOLoader.js';
import { Track, BLOCK } from './track.js';
import { Car } from './car.js';
import { Race, fmtTime } from './race.js';
import { Input } from './input.js';

const $ = (id) => document.getElementById(id);
const holder = $('canvas-holder');

// ---------- 渲染器 ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
holder.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fc7ef);
// 霧：方塊世界一望到底會見到格網盡頭，起霧就自然好多
scene.fog = new THREE.Fog(0x8fc7ef, 120, 320);

const camera = new THREE.PerspectiveCamera(62, 1, 0.5, 600);

const sun = new THREE.DirectionalLight(0xfff2d8, 2.1);
sun.position.set(60, 120, 40);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbfe3ff, 0x4a6a3a, 1.0));

function resize() {
    const w = holder.clientWidth || innerWidth;
    const h = holder.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 120));

// ---------- 世界 ----------
const track = new Track();
track.build(scene);

// 幾隻雲：純白方塊，飄喺高空，加返 Minecraft 感覺
const clouds = new THREE.Group();
{
    const geo = new THREE.BoxGeometry(BLOCK * 4, BLOCK * 2, BLOCK * 3);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const im = new THREE.InstancedMesh(geo, mat, 60);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 + i * 0.7;
        const r = 90 + (i % 7) * 26;
        m.makeTranslation(Math.cos(a) * r, 55 + (i % 5) * 7, Math.sin(a) * r);
        im.setMatrixAt(i, m);
    }
    clouds.add(im);
    scene.add(clouds);
}

// ---------- 載車 ----------
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('./vendor/draco/');
loader.setDRACOLoader(draco);

// 模型可能係任何朝向／尺寸：量度包圍盒，轉到「車頭向 +z」再縮到指定長度
function normalizeCar(obj, targetLength = 4.6) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    // 水平最長嗰軸當車身長度方向
    if (size.x > size.z) obj.rotation.y = Math.PI / 2;
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

let car = null;
let race = null;
const input = new Input(document);

loader.load('./assets/car.glb', (gltf) => {
    const model = normalizeCar(gltf.scene);
    model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    const wrap = new THREE.Group();
    wrap.add(model);
    car = new Car(wrap);
    scene.add(car.root);
    car.reset(track.startPos, track.startDir);
    race = new Race(track, { laps: 3, onEvent: handleRaceEvent });
    $('loading').classList.add('hidden');
    $('screen-start').classList.remove('hidden');
    window.__racer = { car, track, race, renderer, restart, startRace }; // 畀自動化測試用
}, undefined, (err) => {
    $('loading').innerHTML = `<div class="loading-box"><div class="loading-label">⚠️ 載入失敗</div></div>`;
    console.error(err);
});

// ---------- 鏡頭：跟車 ----------
const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
let camInit = false;
function updateCamera(dt) {
    const fwd = new THREE.Vector3(Math.sin(car.heading), 0, Math.cos(car.heading));
    const speedT = Math.min(1, Math.abs(car.speed) / 60);
    // 鏡頭要高同望遠：低機位睇落好有速度感，但玩家見唔到下一個彎就變咗盲揸。
    // 實測 5.4 高度嗰陣天空霸咗三分二畫面，路面得底下嗰條。
    const dist = 13 + speedT * 4;
    const want = car.pos.clone().addScaledVector(fwd, -dist);
    want.y = 9.0 + speedT * 1.8;
    const lookAt = car.pos.clone().addScaledVector(fwd, 22).setY(0.6);
    if (!camInit) { camPos.copy(want); camLook.copy(lookAt); camInit = true; }
    // 追car 用指數平滑；漂移時鏡頭跟得鬆啲，睇到車尾甩出去
    const lag = car.drifting ? 3.2 : 6.0;
    camPos.lerp(want, Math.min(1, dt * lag));
    camLook.lerp(lookAt, Math.min(1, dt * 8));
    camera.position.copy(camPos);
    camera.lookAt(camLook);
    // 速度愈快視角愈闊，速度感靠呢個
    const fov = 62 + speedT * 12;
    if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
}

// ---------- HUD ----------
function handleRaceEvent(kind, data) {
    if (kind === 'count') banner(String(data), 900);
    else if (kind === 'go') banner('GO!', 900);
    else if (kind === 'lap') banner(`第 ${data} 圈`, 1100);
    else if (kind === 'record') banner('⚡ 最快圈！', 1300);
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

function showFinish({ total, laps, best }) {
    $('finish-total').textContent = fmtTime(total);
    $('finish-best').textContent = fmtTime(best);
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
function startRace() {
    $('screen-start').classList.add('hidden');
    $('screen-finish').classList.add('hidden');
    $('hud').classList.remove('hidden');
    car.reset(track.startPos, track.startDir);
    camInit = false;
    race.reset();
    hudCache = {};
    running = true;
}
function restart() { startRace(); }
function toMenu() {
    running = false;
    $('screen-finish').classList.add('hidden');
    $('hud').classList.add('hidden');
    $('screen-start').classList.remove('hidden');
}

$('start-btn').addEventListener('click', startRace);
$('again-btn').addEventListener('click', restart);
$('menu-btn').addEventListener('click', toMenu);

// ---------- 主迴圈 ----------
let running = false;
let last = performance.now();
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
        }
        updateCamera(dt);
    }
    renderer.render(scene, camera);
}
resize();
requestAnimationFrame(frame);
