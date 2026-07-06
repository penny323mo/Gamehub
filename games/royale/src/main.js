// 入口 — Three.js 場景、鏡頭、資產載入、遊戲循環、拖放落卡
import * as THREE from 'three';
import { ARENA, TEAM } from './constants.js';
import { CARDS, randomDeck } from './cards.js';
import { loadAssets } from './assets.js';
import { buildArena } from './arena.js';
import { Game } from './game.js';
import { AIController } from './ai.js';
import { UI } from './ui.js';
import { sfx } from './sfx.js';
import { generateCardThumbs } from './thumbs.js';

// ---------- Renderer / Scene ----------
const holder = document.getElementById('canvas-holder');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
holder.appendChild(renderer.domElement);

const scene = new THREE.Scene();
// 漸變天空
{
    const c = document.createElement('canvas');
    c.width = 16; c.height = 512;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#5f9fd8');
    grad.addColorStop(0.55, '#a8cce8');
    grad.addColorStop(1, '#dcecd2');
    g.fillStyle = grad;
    g.fillRect(0, 0, 16, 512);
    const sky = new THREE.CanvasTexture(c);
    sky.colorSpace = THREE.SRGBColorSpace;
    scene.background = sky;
}
scene.fog = new THREE.Fog(0xc2dcda, 62, 120);

const camera = new THREE.PerspectiveCamera(52, 1, 0.5, 200);
let arena = { zones: null, update: () => {} }; // loadAssets 之後先起

// ---------- 鏡頭自動適配 + 縮放/旋轉 ----------
const fitPoints = [
    new THREE.Vector3(-ARENA.halfW - 0.8, 0, ARENA.halfL + 0.8),
    new THREE.Vector3(ARENA.halfW + 0.8, 0, ARENA.halfL + 0.8),
    new THREE.Vector3(-ARENA.halfW - 0.8, 0, -ARENA.halfL - 0.8),
    new THREE.Vector3(ARENA.halfW + 0.8, 0, -ARENA.halfL - 0.8),
    new THREE.Vector3(0, 5, -ARENA.halfL),
    new THREE.Vector3(0, 4, ARENA.halfL),
];
const tmpV = new THREE.Vector3();

let fitD = 40;       // 自動適配搵到嘅基準距離
let fitTargetZ = -1.2; // 自動適配嘅 lookAt 基準點
let zoom = 1;        // >1 = 拉近，<1 = 拉遠
let orbit = 0;        // 鏡頭繞 lookAt 點嘅水平旋轉角（radian）
const ZOOM_MIN = 0.55, ZOOM_MAX = 2.3;

const camTarget = new THREE.Vector3();
const camOffset = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function applyCameraView() {
    const d = fitD / zoom;
    camTarget.set(0, 0, fitTargetZ);
    camOffset.set(0, d * 0.76, d * 0.66 + 5).sub(camTarget);
    camOffset.applyAxisAngle(Y_AXIS, orbit);
    camera.position.copy(camTarget).add(camOffset);
    camera.lookAt(camTarget);
    camera.updateProjectionMatrix();
}

function fitCamera() {
    const w = holder.clientWidth, h = holder.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;

    // 可用範圍：底部留返位畀手牌 UI（用未旋轉/未縮放嘅基準鏡頭搜尋）
    const X_MAX = 0.96, Y_MAX = 0.94, Y_MIN = -0.62;
    const Y_MID = (Y_MAX + Y_MIN) / 2;
    let targetZ = -1.2;
    let foundD = 40;
    outer:
    for (let d = 24; d < 90; d += 1.0) {
        for (let iter = 0; iter < 10; iter++) {
            camera.position.set(0, d * 0.76, d * 0.66 + 5);
            camera.lookAt(0, 0, targetZ);
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld();
            let minY = Infinity, maxY = -Infinity, maxX = 0;
            for (const p of fitPoints) {
                tmpV.copy(p).project(camera);
                minY = Math.min(minY, tmpV.y);
                maxY = Math.max(maxY, tmpV.y);
                maxX = Math.max(maxX, Math.abs(tmpV.x));
            }
            const mid = (minY + maxY) / 2;
            if (Math.abs(mid - Y_MID) > 0.02) {
                targetZ += (Y_MID - mid) * 6;
                continue;
            }
            foundD = d;
            if (maxX <= X_MAX && maxY <= Y_MAX && minY >= Y_MIN) break outer;
            break;
        }
    }
    fitD = foundD;
    fitTargetZ = targetZ;
    applyCameraView();
}
window.addEventListener('resize', fitCamera);
fitCamera();

// ---------- 鏡頭互動：滾輪/pinch 縮放、拖曳旋轉、重置 ----------
let cardBusy = false; // 出卡拖放進行緊嘅時候唔好搶咗個拖動去轉鏡頭
let camDragging = false;
let camLastX = 0;
const activePointers = new Map();
let pinchStartDist = 0;
let pinchStartZoom = 1;

function clampZoom(z) {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
}

holder.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    zoom = clampZoom(zoom * (ev.deltaY < 0 ? 1.1 : 0.9));
    applyCameraView();
}, { passive: false });

holder.addEventListener('pointerdown', (ev) => {
    activePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (activePointers.size === 2) {
        const pts = [...activePointers.values()];
        pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        pinchStartZoom = zoom;
        camDragging = false;
        return;
    }
    if (cardBusy || (ui && ui.selectedIdx >= 0)) return;
    camDragging = true;
    camLastX = ev.clientX;
});
window.addEventListener('pointermove', (ev) => {
    if (activePointers.has(ev.pointerId)) {
        activePointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    }
    if (activePointers.size === 2) {
        const pts = [...activePointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        zoom = clampZoom(pinchStartZoom * (dist / pinchStartDist));
        applyCameraView();
        return;
    }
    if (!camDragging) return;
    const dx = ev.clientX - camLastX;
    camLastX = ev.clientX;
    orbit += dx * 0.006;
    applyCameraView();
});
function releasePointer(ev) {
    activePointers.delete(ev.pointerId);
    camDragging = false;
}
window.addEventListener('pointerup', releasePointer);
window.addEventListener('pointercancel', releasePointer);

function resetCameraView() {
    zoom = 1;
    orbit = 0;
    applyCameraView();
}

document.getElementById('cam-zoom-in')?.addEventListener('click', () => {
    zoom = clampZoom(zoom * 1.2);
    applyCameraView();
});
document.getElementById('cam-zoom-out')?.addEventListener('click', () => {
    zoom = clampZoom(zoom / 1.2);
    applyCameraView();
});
document.getElementById('cam-reset')?.addEventListener('click', resetCameraView);

// ---------- 部署 ghost 指示 ----------
const ghost = new THREE.Group();
const ghostRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.75, 32),
    new THREE.MeshBasicMaterial({ color: 0x55ff77, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthTest: false })
);
ghostRing.rotation.x = -Math.PI / 2;
ghostRing.renderOrder = 10;
const ghostSplash = new THREE.Mesh(
    new THREE.CircleGeometry(1, 32),
    new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.22, depthTest: false })
);
ghostSplash.rotation.x = -Math.PI / 2;
ghostSplash.renderOrder = 9;
ghost.add(ghostRing, ghostSplash);
ghost.visible = false;
scene.add(ghost);

const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const ndc = new THREE.Vector2();
const hitPoint = new THREE.Vector3();

function screenToWorld(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
        return { x: hitPoint.x, z: hitPoint.z };
    }
    return null;
}

// ---------- 遊戲狀態 ----------
let game = null;
let ai = null;
let ui = null;
let running = false;

function showZones(show) {
    if (!game || !arena.zones) return;
    arena.zones.own.visible = show;
    arena.zones.pocketL.visible = show && game.towers[TEAM.ENEMY].left.dead;
    arena.zones.pocketR.visible = show && game.towers[TEAM.ENEMY].right.dead;
}

const uiCallbacks = {
    onStart(deck, difficulty) {
        startMatch(deck, difficulty);
    },
    onAgain() {
        startMatch(ui.deck, ui.difficulty);
    },
    onQuit() {
        if (game && game.phase !== 'ended') {
            game.crowns[TEAM.ENEMY] = 3;
            game.phase = 'ended';
        }
        cleanupMatch();
        ui.showStart();
    },
    onToggleMute() {
        sfx.setMuted(!sfx.isMuted());
        return sfx.isMuted();
    },
    onDragMove(handIdx, cx, cy) {
        cardBusy = true;
        if (!game || game.phase === 'ended') return;
        const p = screenToWorld(cx, cy);
        if (!p) { ghost.visible = false; return; }
        const cardId = game.players[TEAM.PLAYER].hand[handIdx];
        const card = CARDS[cardId];
        if (!card) return;
        showZones(card.kind !== 'spell');
        const pos = game.validPlacement(TEAM.PLAYER, cardId, p.x, p.z);
        ghost.visible = true;
        const gx = pos ? pos.x : p.x, gz = pos ? pos.z : p.z;
        ghost.position.set(gx, 0.08, gz);
        const r = card.kind === 'spell' ? card.splash : Math.max(0.5, (card.radius ?? 0.4) * 1.6);
        ghostRing.scale.setScalar(r / 0.65);
        ghostSplash.scale.setScalar(card.kind === 'spell' ? card.splash : 0.001);
        const ok = !!pos && game.players[TEAM.PLAYER].elixir >= card.cost;
        ghostRing.material.color.set(ok ? 0x55ff77 : 0xff5544);
    },
    onDrop(handIdx, cx, cy) {
        cardBusy = false;
        ghost.visible = false;
        showZones(false);
        if (!game || game.phase === 'ended') return;
        const p = screenToWorld(cx, cy);
        if (!p) return;
        const cardId = game.players[TEAM.PLAYER].hand[handIdx];
        const card = CARDS[cardId];
        const ok = game.playCard(TEAM.PLAYER, handIdx, p.x, p.z);
        if (ok) {
            card.kind === 'spell' ? sfx.spell() : sfx.deploy();
        } else {
            sfx.error();
        }
    },
    onDragEnd() {
        cardBusy = false;
        ghost.visible = false;
        showZones(false);
    },
};

function cleanupMatch() {
    if (!game) return;
    for (const e of game.entities) {
        scene.remove(e.model);
        scene.remove(e.hpBar);
    }
    for (const pr of game.projectiles) scene.remove(pr.model);
    for (const ef of game.effects) if (ef.mesh) scene.remove(ef.mesh);
    const toRemove = [];
    scene.traverse((o) => {
        if (o.userData?.isRubble) toRemove.push(o);
    });
    for (const o of toRemove) scene.remove(o);
    game = null;
    ai = null;
    running = false;
}

function startMatch(deck, difficulty) {
    cleanupMatch();
    game = new Game(scene, deck, randomDeck(), {
        onTowerDestroyed(t) {
            sfx.towerDown();
            ui.banner(t.team === TEAM.PLAYER ? '💥 你嘅城塔冧咗！' : '🎉 攻陷敵方城塔！');
        },
        onKingActivated(team) {
            sfx.kingWake();
            if (team === TEAM.ENEMY) ui.banner('👑 敵方王塔參戰！', 1400);
        },
        onOvertime() {
            sfx.overtime();
            ui.banner('⚡ 加時！突然死亡', 2200);
        },
        onGameOver(result) {
            if (result.winner === TEAM.PLAYER) sfx.win();
            else if (result.winner === TEAM.ENEMY) sfx.lose();
            ui.showEnd(result);
        },
        onImpact() { sfx.explosion(); },
        onSpawn() {},
    });
    ai = new AIController(game, difficulty);
    window.__royale = { game, ai }; // 畀自動化測試用
    ui.bindGame(game);
    ui.showGame();
    ui.banner('⚔️ 開戰！', 1200);
    running = true;
}

// ---------- 主循環 ----------
let last = performance.now();
let acc = 0;
const STEP = 1 / 60;

function loop(now) {
    requestAnimationFrame(loop);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25;

    if (running && game) {
        acc += dt;
        while (acc >= STEP) {
            game.update(STEP);
            ai?.update(STEP);
            acc -= STEP;
        }
        game.updateHpBarOrientation(camera.quaternion);
        ui.update();
    }
    arena.update(dt);
    renderer.render(scene, camera);
}

// ---------- 啟動 ----------
async function init() {
    const loadFill = document.getElementById('load-fill');
    try {
        await loadAssets((p) => {
            if (loadFill) loadFill.style.width = `${Math.round(p * 100)}%`;
        });
    } catch (err) {
        const label = document.querySelector('#loading .loading-label');
        if (label) label.textContent = '載入失敗，請重新整理 ⚠️';
        throw err;
    }
    arena = buildArena(scene);
    fitCamera();
    const cardThumbs = generateCardThumbs();
    ui = new UI(uiCallbacks, cardThumbs);
    ui.showStart();
    document.getElementById('loading')?.remove();
    requestAnimationFrame(loop);
}
init();
