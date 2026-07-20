// 入口 — Three.js 場景、鏡頭、資產載入、遊戲循環、拖放落卡
import * as THREE from 'three';
import { ARENA, TEAM } from './constants.js';
import { CARDS, CARD_POOL } from './cards.js';
import { loadAssets } from './assets.js';
import { buildArena } from './arena.js';
import { Game, disposeDeep } from './game.js';
import { AIController, PERSONALITIES, randomPersonality } from './ai.js';
import { UI } from './ui.js';
import { sfx } from './sfx.js';
import { generateCardThumbs } from './thumbs.js';
import { playerLevels, avgDeckLevel, recordMatch } from './storage.js';
import { submitScore } from './leaderboard.js';
import { GuestGame, attachHostRelay, sendGuestPlay } from './pvp.js';
import * as Net from './net.js';
import { createRtsMode } from './rts/rts-mode.js';
import { RTS_MAP } from './rts/rts.js';

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
// 鏡頭要 fit 嘅範圍：Clash 用 ARENA，RTS 大地圖用 RTS_MAP（startRts 時切換）
let camHalfW = ARENA.halfW, camHalfL = ARENA.halfL;
function buildFitPoints() {
    return [
        new THREE.Vector3(-camHalfW - 0.8, 0, camHalfL + 0.8),
        new THREE.Vector3(camHalfW + 0.8, 0, camHalfL + 0.8),
        new THREE.Vector3(-camHalfW - 0.8, 0, -camHalfL - 0.8),
        new THREE.Vector3(camHalfW + 0.8, 0, -camHalfL - 0.8),
        new THREE.Vector3(0, 5, -camHalfL),
        new THREE.Vector3(0, 4, camHalfL),
    ];
}
const tmpV = new THREE.Vector3();

let fitD = 40;       // 自動適配搵到嘅基準距離
let fitTargetZ = -1.2; // 自動適配嘅 lookAt 基準點
let zoom = 1;        // >1 = 拉近，<1 = 拉遠
let orbitBase = 0;    // 鏡頭基準朝向（PvP guest 要企喺對面望返嚟，基準轉 180°）
let orbit = 0;        // 鏡頭繞 lookAt 點嘅水平旋轉角（radian，喺 orbitBase 上面疊加）
let panX = 0, panZ = 0; // RTS 大地圖鏡頭平移（雙指拖動；Clash 永遠 0）
const ZOOM_MIN = 0.55, ZOOM_MAX = 2.3;

const camTarget = new THREE.Vector3();
const camOffset = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function applyCameraView() {
    const d = fitD / zoom;
    camTarget.set(panX, 0, fitTargetZ + panZ); // panX/panZ 只喺 RTS 大地圖用（睇上/下半場）
    // 鏡頭對 target 嘅固定偏移（高＋後移），orbit 圍住 target 轉；pan 郁 target，鏡頭跟住一齊移
    camOffset.set(0, d * 0.76, d * 0.66 + 5 - fitTargetZ);
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
    const fitPoints = buildFitPoints();
    outer:
    for (let d = 24; d < 180; d += 1.0) {
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
let pinchStartCx = 0, pinchStartCy = 0, panStartX = 0, panStartZ = 0;

function clampZoom(z) {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
}
function clampPan(v, limit) {
    return Math.max(-limit, Math.min(limit, v));
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
        pinchStartCx = (pts[0].x + pts[1].x) / 2; pinchStartCy = (pts[0].y + pts[1].y) / 2;
        panStartX = panX; panStartZ = panZ;
        camDragging = false;
        if (rts && rts.active) { rtsPointerDown = false; rts.cancelGesture(); } // 第二指落 → 取消緊做嘅框選/tap，轉做縮放平移
        return;
    }
    if (rts && rts.active) { rtsPointerDown = true; rts.onPointerDown(ev.clientX, ev.clientY); return; }
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
        // RTS 大地圖：雙指拖動平移鏡頭（睇上/下半場）——揸住地面跟手指郁
        if (rts && rts.active) {
            const cx = (pts[0].x + pts[1].x) / 2, cy = (pts[0].y + pts[1].y) / 2;
            const wpp = (fitD / zoom) * 1.15 / holder.clientHeight; // 每像素對應世界距離（隨縮放變）
            panX = clampPan(panStartX - (cx - pinchStartCx) * wpp, RTS_MAP.halfW);
            panZ = clampPan(panStartZ - (cy - pinchStartCy) * wpp, RTS_MAP.halfL);
        }
        applyCameraView();
        return;
    }
    if (rts && rts.active) { if (rtsPointerDown) rts.onPointerMove(ev.clientX, ev.clientY); return; }
    if (!camDragging) return;
    const dx = ev.clientX - camLastX;
    camLastX = ev.clientX;
    orbit += dx * 0.006;
    applyCameraView();
});
function releasePointer(ev) {
    // 只處理喺 canvas 上面開始嘅手勢——tap HUD 掣（訓練/建造/縮放）唔可以當落地指令，
    // 否則會清走選取、喺 click 之前 removeDOM 令訓練掣按唔到（兵營出唔到兵嘅成因）
    if (rts && rts.active && rtsPointerDown && activePointers.size <= 1) rts.onPointerUp(ev.clientX, ev.clientY);
    rtsPointerDown = false;
    activePointers.delete(ev.pointerId);
    camDragging = false;
}
window.addEventListener('pointerup', releasePointer);
window.addEventListener('pointercancel', releasePointer);

function resetCameraView() {
    zoom = 1;
    orbit = orbitBase;
    panX = 0; panZ = 0;
    applyCameraView();
}

// PvP guest 專用：鏡頭基準轉 180°，令佢企喺自己嗰陣（實質係 TEAM.ENEMY）背後望返去，
// 唔使郁半分戰場座標／隊伍資料，淨係換個睇法
function setViewFlip(flipped) {
    orbitBase = flipped ? Math.PI : 0;
    orbit = orbitBase;
    zoom = 1; // 開新場/清場都由標準縮放開始，唔好繼承上一場 pinch 完嘅狀態
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
let rts = null; // LV2 世紀帝國式 RTS 控制器（init 後先建立）
let rtsPointerDown = false; // RTS 手勢係咪喺 canvas 上面開始（隔走 HUD 掣嘅 pointer 事件）
let guestFinish = null; // PvP guest 嘅收場函數（beginAsGuest 設定；投降時都要行到入賬）

// ---------- PvP 狀態 ----------
let netRole = null; // null | 'host' | 'guest'
let hostRelay = null;
let matchmakingActive = false;

function showZones(show) {
    if (!game || !arena.zones) return;
    // 區域網格係固定世界座標（own=z>0、pocket=z<0，即 host 視角）；guest 半場反轉，
    // 要將 z 鏡射先至照喺「自己嗰邊」／「敵方袋位」嘅正確位置
    for (const zone of Object.values(arena.zones)) {
        if (zone.userData.baseZ === undefined) zone.userData.baseZ = zone.position.z;
        zone.position.z = netRole === 'guest' ? -zone.userData.baseZ : zone.userData.baseZ;
    }
    arena.zones.own.visible = show;
    arena.zones.pocketL.visible = show && !!game.towers[TEAM.ENEMY].left?.dead;
    arena.zones.pocketR.visible = show && !!game.towers[TEAM.ENEMY].right?.dead;
}

const uiCallbacks = {
    onStart(deck, difficulty, mode = 'single') {
        if (mode === 'pvp') { startQuickMatch(deck); return; }
        if (mode === 'lv2') { startRts(); return; }
        startMatch(deck, difficulty, mode, 1);
    },
    onJoinRoom(deck, code) {
        startJoinRoom(deck, code);
    },
    onCancelMatching() {
        cancelMatchmaking();
    },
    onAgain() {
        if (matchMode === 'pvp') { cleanupMatch(); ui.showStart(); return; } // PvP 唔支援即刻再嚟一局，返選單再配對
        startMatch(ui.deck, ui.difficulty, matchMode, matchMode === 'gauntlet' ? 1 : gauntletStage);
    },
    onNextStage() {
        startMatch(ui.deck, ui.difficulty, 'gauntlet', gauntletStage + 1);
    },
    onQuit() {
        // 投降照計一場敗仗入賬（勝負/連勝/獎盃）——唔可以白 quit 嚟保成績。
        // ui.showStart() 會清走 showEnd 排定嘅結算畫面 timer，所以唔會彈結算。
        if (game && game.phase !== 'ended') {
            if (netRole) Net.leaveAsLoser();
            if (netRole === 'guest') {
                game.phase = 'ended';
                game.result = { winner: TEAM.ENEMY, crowns: { ...game.crowns } };
                guestFinish?.();
            } else {
                game.crowns[TEAM.ENEMY] = Math.max(game.crowns[TEAM.ENEMY], netRole ? 1 : 3);
                game.phase = 'ended';
                game.result = { winner: TEAM.ENEMY, crowns: { ...game.crowns } };
                game.hooks.onGameOver?.(game.result);
            }
        }
        cleanupMatch();
        ui.showStart();
    },
    onBackToMenu() {
        // 完場「返回選單」：一定要清埋成個 match（entities/hpBars/effects 全部拆走 dispose），
        // 唔係嘅話舊場嘅嘢會留喺 scene 度繼續 render，下一場仲會兩場嘢疊埋
        cleanupMatch();
        ui.showStart();
    },
    onToggleMute() {
        sfx.setMuted(!sfx.isMuted());
        return sfx.isMuted();
    },
    onDragMove(handIdx, cx, cy) {
        cardBusy = true;
        if (!game || game.phase === 'ended') {
            // 拖到一半完場：唔好留低 ghost 圈同部署區 overlay 喺場度
            ghost.visible = false;
            showZones(false);
            return;
        }
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
        if (!card) return;
        if (netRole === 'guest') {
            // Guest 冇話事權：只係送叫牌指令畀 host，用本機 validPlacement 做樂觀預判
            const pos = game.validPlacement(TEAM.PLAYER, cardId, p.x, p.z);
            const canAfford = game.players[TEAM.PLAYER].elixir >= card.cost;
            if (pos && canAfford && !game.pendingHand.has(handIdx)) {
                // 記低送出嗰陣格內嘅卡：見到快照呢格換咗卡（host 食咗指令）先解鎖
                game.pendingHand.set(handIdx, { cardId, t: game._clock });
                sendGuestPlay(handIdx, pos.x, pos.z);
                card.kind === 'spell' ? sfx.spell() : sfx.deploy();
            } else {
                sfx.error();
            }
            return;
        }
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
    stopMatchmaking();
    arena.setMood?.(0); // 新一場由日光開始
    guestFinish = null;
    if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; } // 離場就唔好留低判負倒數
    if (netRole) {
        Net.teardown();
        netRole = null;
    }
    if (hostRelay) { hostRelay.stop(); hostRelay = null; }
    setViewFlip(false);
    if (game instanceof GuestGame) {
        game.dispose();
        game = null;
        ai = null;
        running = false;
        return;
    }
    if (!game) return;
    for (const e of game.entities) {
        scene.remove(e.model);
        scene.remove(e.hpBar);
        disposeDeep(e.model);
        disposeDeep(e.hpBar);
        if (e.slowRing) { scene.remove(e.slowRing); disposeDeep(e.slowRing); }
    }
    for (const pr of game.projectiles) { scene.remove(pr.model); disposeDeep(pr.model); }
    for (const ef of game.effects) if (ef.mesh) { scene.remove(ef.mesh); disposeDeep(ef.mesh); }
    const toRemove = [];
    scene.traverse((o) => {
        if (o.userData?.isRubble) toRemove.push(o);
    });
    for (const o of toRemove) { scene.remove(o); disposeDeep(o); }
    game = null;
    ai = null;
    running = false;
}

// ---------- PvP 配對流程 ----------
function stopMatchmaking() {
    matchmakingActive = false;
    if (matchPollT) { clearInterval(matchPollT); matchPollT = null; }
}
let matchPollT = null;
let pvpDeck = null;

async function startQuickMatch(deck) {
    if (matchmakingActive) return;
    cleanupMatch(); // 上一場（例如撳完「返回選單」嗰場）嘅嘢要清晒先開始配對
    matchmakingActive = true;
    pvpDeck = deck;
    ui.showMatching('搜尋緊對手…');
    try {
        const room = await Net.quickMatch(deck);
        if (!matchmakingActive) { Net.cancelWaiting(); return; } // 等緊入房嗰陣㩒咗取消：唔好留低幽靈房
        await afterJoinedRoom(room);
    } catch (err) {
        if (!matchmakingActive) return;
        ui.setMatchingStatus('配對失敗：' + (err?.message ?? err));
    }
}

async function startJoinRoom(deck, code) {
    if (matchmakingActive) return;
    cleanupMatch(); // 同 startQuickMatch 一樣，清走上一場殘留
    matchmakingActive = true;
    pvpDeck = deck;
    ui.showMatching('加入緊房間…');
    try {
        const room = await Net.joinRoomByCode(code, deck);
        if (!matchmakingActive) { Net.cancelWaiting(); return; } // 等緊入房嗰陣㩒咗取消：撤銷個 claim
        await afterJoinedRoom(room);
    } catch (err) {
        if (!matchmakingActive) return;
        ui.setMatchingStatus('加入失敗：' + (err?.message ?? err));
    }
}

function cancelMatchmaking() {
    if (!matchmakingActive) return;
    Net.cancelWaiting();
    stopMatchmaking();
    ui.hideMatching();
    ui.showStart();
}

async function afterJoinedRoom(room) {
    if (!matchmakingActive) return;
    if (room.guest_id && room.host_id) {
        if (Net.NetState.role === 'host') beginAsHost(room.host_deck ?? pvpDeck, room.guest_deck);
        else beginAsGuest();
        return;
    }
    // 淨係得自己一個，做咗 host，等緊人（房號畀朋友輸入加入；同時亦會俾人隨機配對搵到）
    ui.setMatchingStatus('等待對手加入…');
    ui.showRoomCode(room.room_code);
    Net.on('roomUpdate', (updated) => {
        if (matchmakingActive && updated.guest_id && updated.host_id) {
            beginAsHost(updated.host_deck ?? pvpDeck, updated.guest_deck);
        }
    });
    matchPollT = setInterval(async () => {
        if (!matchmakingActive) return;
        const r = await Net.pollRoom();
        if (!matchmakingActive) return; // 等緊個 await 嗰陣可能已經由 roomUpdate 那邊開咗波
        if (r && r.guest_id && r.host_id) beginAsHost(r.host_deck ?? pvpDeck, r.guest_deck);
    }, 2500);
}

let matchMode = 'single';
let gauntletStage = 1;
let matchStats = null;

// 連勝挑戰難度階梯
function gauntletDifficulty(stage) {
    return stage <= 1 ? 'easy' : stage === 2 ? 'normal' : 'hard';
}

function startMatch(deck, difficulty, mode = 'single', stage = 1) {
    cleanupMatch();
    matchMode = mode;
    gauntletStage = stage;
    const actualDiff = mode === 'gauntlet' ? gauntletDifficulty(stage) : difficulty;

    // AI 個性＋預組卡組
    const pid = randomPersonality();
    const personality = PERSONALITIES[pid];

    // 卡牌等級：玩家用自己存檔；AI 全卡組跟玩家平均等級走，保持公平
    const enemyLv = Math.round(avgDeckLevel(deck));
    const enemyLevels = {};
    for (const id of CARD_POOL) enemyLevels[id] = enemyLv;

    matchStats = {
        difficulty: actualDiff,
        deck: [...deck],
        avgCost: deck.reduce((s, id) => s + CARDS[id].cost, 0) / deck.length,
        towersDestroyed: 0,
        bestSpellHit: 0,
        cardsPlayed: 0,
        gauntletStage: mode === 'gauntlet' ? stage : 0,
    };

    game = new Game(scene, deck, personality.deck, {
        onTowerDestroyed(t) {
            sfx.towerDown();
            if (t.team === TEAM.ENEMY) matchStats.towersDestroyed += 1;
            ui.banner(t.team === TEAM.PLAYER ? '💥 你嘅城塔冧咗！' : '🎉 攻陷敵方城塔！');
        },
        onKingActivated(team) {
            sfx.kingWake();
            if (team === TEAM.ENEMY) ui.banner('👑 敵方王塔參戰！', 1400);
        },
        onOvertime() {
            sfx.overtime();
            ui.banner('⚡ 加時！河心聖水泉開通', 2200);
        },
        onOvertimeExtend(n) {
            sfx.overtime();
            ui.banner(`⚡ 加時再嚟！第 ${n} 節突然死亡`, 2200);
        },
        onClimax() {
            sfx.kingWake();
            ui.banner('🔥 決勝一刻！傷害提升', 1800);
        },
        onSpellHit(team, cardId, count) {
            if (team === TEAM.PLAYER) {
                matchStats.bestSpellHit = Math.max(matchStats.bestSpellHit, count);
            }
        },
        onCardPlayed(team, cardId) {
            if (team === TEAM.PLAYER) matchStats.cardsPlayed += 1;
        },
        onGameOver(result) {
            if (result.winner === TEAM.PLAYER) sfx.win();
            else if (result.winner === TEAM.ENEMY) sfx.lose();
            // 結算：入存檔（獎盃/碎片/挑戰），再交畀結算畫面
            matchStats.win = result.winner === TEAM.PLAYER;
            matchStats.draw = result.winner === null || result.winner === undefined;
            matchStats.crowns = result.crowns[TEAM.PLAYER];
            matchStats.matchSeconds = game.simTime;
            const rewards = recordMatch(matchStats);
            submitScore(); // 上報排行榜（fire-and-forget，離線唔阻結算）
            ui.showEnd(result, {
                rewards,
                damage: game.damageByCard[TEAM.PLAYER],
                mode: matchMode,
                stage: gauntletStage,
            });
        },
        onImpact() { sfx.explosion(); },
        onSpawn() {},
    }, {
        levels: { [TEAM.PLAYER]: playerLevels(), [TEAM.ENEMY]: enemyLevels },
        // 連勝挑戰第 4 關起，AI 聖水回復有加成
        enemyElixirRate: mode === 'gauntlet' ? 1 + Math.max(0, stage - 3) * 0.15 : 1,
    });
    ai = new AIController(game, actualDiff, pid);
    window.__royale = { game, ai, renderer, startMatch, cleanupMatch }; // 畀自動化測試用
    ui.bindGame(game);
    ui.showGame();
    arena.setMood?.(0);
    const stageTag = mode === 'gauntlet' ? `第 ${stage} 關 · ` : '';
    ui.banner(`⚔️ ${stageTag}對手：${personality.icon} ${personality.name}`, 1600);
    running = true;
}

// ---------- LV2 世紀帝國式 RTS：開波 ----------
function startRts() {
    cleanupMatch();            // 清走任何 Clash 遊戲狀態
    matchMode = 'lv2';
    // 切去 RTS 大地圖：收起 Clash 戰場、關霧（大地圖遠端會俾霧食咗）、鏡頭 fit 大範圍
    if (arena.root) arena.root.visible = false;
    clashFog = scene.fog; scene.fog = null;
    camHalfW = RTS_MAP.halfW; camHalfL = RTS_MAP.halfL;
    fitCamera();
    resetCameraView();
    document.getElementById('screen-start')?.classList.add('hidden');
    document.getElementById('hud')?.classList.add('hidden');
    running = false;           // Clash 主迴圈唔郁，RTS 自己 update
    rts.start('hard');
}
let clashFog = null;

// ---------- PvP 斷線寬限期（host/guest 共用）----------
// presence leave → 起 30 秒倒數；期內 presence join 返嚟就取消；
// 房 status 轉 finished（對方正式投降/離開）就唔等，即刻按房記錄完場。
const DISCONNECT_GRACE_MS = 30000;
let graceTimer = null;

function armDisconnectGrace({ onWalkover, stillPlaying }) {
    const cancelGrace = () => {
        if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
    };
    Net.on('opponentLeft', () => {
        if (!stillPlaying() || graceTimer) return;
        ui.banner('⚠️ 對手斷線，等佢重連（30 秒）…', 3600);
        graceTimer = setTimeout(() => {
            graceTimer = null;
            if (stillPlaying()) onWalkover();
        }, DISCONNECT_GRACE_MS);
    });
    Net.on('opponentJoined', () => {
        if (!graceTimer) return;
        cancelGrace();
        if (stillPlaying()) ui.banner('🔗 對手重連返嚟，繼續！', 2000);
    });
    // 對方正式投降（leaveAsLoser 寫咗 finished + winner）→ 唔使白等 30 秒
    Net.on('roomUpdate', (room) => {
        if (room?.status === 'finished' && stillPlaying()) {
            cancelGrace();
            onWalkover();
        }
    });
}

// ---------- PvP 斷線重連：開始畫面檢查 + 恢復流程 ----------
async function checkReconnect() {
    if (!sessionStorage.getItem('royale_active_room')) return;
    const found = await Net.findMyActiveRoom();
    if (!found) return;
    ui.showReconnectBar(async () => {
        ui.hideReconnectBar();
        try {
            await resumeMatch(found.room, found.role);
        } catch (err) {
            ui.banner('重連失敗：' + (err?.message ?? err), 2600);
            cleanupMatch();
            ui.showStart();
        }
    });
}

async function resumeMatch(room, role) {
    cleanupMatch();
    await Net.rejoinRoom(room, role);
    if (role === 'host') {
        beginAsHost(room.host_deck ?? ui.deck, room.guest_deck);
        // beginAsHost 起咗一場全新 Game——即刻用持久化快照恢復返戰況
        game.restoreFromSnapshot(room.last_snapshot);
    } else {
        beginAsGuest();
        game.applySnapshot(room.last_snapshot); // 未等到下一個廣播都即刻見返場波
    }
    ui.banner('🔗 重連成功，繼續作戰！', 2200);
}

// ---------- PvP：Host 開波（跑晒真正 Game 模擬，冇 AI，由遠端玩家輸入代替）----------
function beginAsHost(hostDeck, guestDeck) {
    if (netRole) return; // 防止 poll 同 roomUpdate 兩條路一齊撞入嚟開兩次波
    stopMatchmaking();
    ui.hideMatching();
    netRole = 'host';
    matchMode = 'pvp';
    gauntletStage = 0;
    setViewFlip(false);

    matchStats = {
        difficulty: 'pvp', deck: [...hostDeck],
        avgCost: hostDeck.reduce((s, id) => s + CARDS[id].cost, 0) / hostDeck.length,
        towersDestroyed: 0, bestSpellHit: 0, cardsPlayed: 0, gauntletStage: 0,
    };
    // 對手（guest）嘅表現都要跟埋，場終先廣播返畀佢，唔係佢啲每日挑戰永遠計唔到
    const enemyStats = { towersDestroyed: 0, bestSpellHit: 0, cardsPlayed: 0 };

    game = new Game(scene, hostDeck, guestDeck, {
        onTowerDestroyed(t) {
            sfx.towerDown();
            if (t.team === TEAM.ENEMY) matchStats.towersDestroyed += 1;
            else enemyStats.towersDestroyed += 1;
            ui.banner(t.team === TEAM.PLAYER ? '💥 你嘅城塔冧咗！' : '🎉 攻陷敵方城塔！');
        },
        onKingActivated(team) {
            sfx.kingWake();
            if (team === TEAM.ENEMY) ui.banner('👑 對手王塔參戰！', 1400);
        },
        onOvertime() { sfx.overtime(); ui.banner('⚡ 加時！河心聖水泉開通', 2200); },
        onOvertimeExtend(n) { sfx.overtime(); ui.banner(`⚡ 加時再嚟！第 ${n} 節突然死亡`, 2200); },
        onClimax() { sfx.kingWake(); ui.banner('🔥 決勝一刻！傷害提升', 1800); },
        onSpellHit(team, cardId, count) {
            if (team === TEAM.PLAYER) matchStats.bestSpellHit = Math.max(matchStats.bestSpellHit, count);
            else enemyStats.bestSpellHit = Math.max(enemyStats.bestSpellHit, count);
        },
        onCardPlayed(team) {
            if (team === TEAM.PLAYER) matchStats.cardsPlayed += 1;
            else enemyStats.cardsPlayed += 1;
        },
        onGameOver(result) {
            if (result.winner === TEAM.PLAYER) sfx.win();
            else if (result.winner === TEAM.ENEMY) sfx.lose();
            matchStats.win = result.winner === TEAM.PLAYER;
            matchStats.draw = result.winner == null;
            matchStats.crowns = result.crowns[TEAM.PLAYER];
            matchStats.matchSeconds = game.simTime;
            const rewards = recordMatch(matchStats);
            submitScore();
            Net.reportResult(result.winner === TEAM.PLAYER ? 'host' : result.winner === TEAM.ENEMY ? 'guest' : 'draw', 'crowns');
            Net.sendMatchStats(enemyStats);
            ui.showEnd(result, { rewards, damage: game.damageByCard[TEAM.PLAYER], mode: 'pvp', stage: 0 });
        },
        onImpact() { sfx.explosion(); },
        onSpawn() {},
    }, {
        levels: { [TEAM.PLAYER]: playerLevels(), [TEAM.ENEMY]: playerLevels() },
    });
    hostRelay = attachHostRelay(game);
    // 斷線 ≠ 即刻判負：畀 30 秒寬限期等對手重連（refresh／訊號斷一斷好常見）。
    // 對手「正式投降」（房 status 轉 finished）就唔使等，即刻完場。
    armDisconnectGrace({
        onWalkover: () => {
            if (game && game.phase !== 'ended') {
                game.crowns[TEAM.ENEMY] = 0; game.crowns[TEAM.PLAYER] = Math.max(game.crowns[TEAM.PLAYER], 1);
                game.phase = 'ended';
                game.result = { winner: TEAM.PLAYER, crowns: { ...game.crowns } };
                game.hooks.onGameOver?.(game.result);
            }
        },
        stillPlaying: () => game && game.phase !== 'ended' && netRole === 'host',
    });
    Net.markPlaying();
    window.__royale = { game };
    ui.bindGame(game);
    ui.showGame();
    ui.banner('⚔️ 對手已連線，開波！', 1400);
    running = true;
}

// ---------- PvP：Guest 開波（唔跑本機模擬，淨係接收 host 廣播嘅快照嚟渲染）----------
function beginAsGuest() {
    if (netRole) return; // 防止 poll 同 roomUpdate 兩條路一齊撞入嚟開兩次波
    stopMatchmaking();
    ui.hideMatching();
    netRole = 'guest';
    matchMode = 'pvp';
    gauntletStage = 0;
    setViewFlip(true);

    const g = new GuestGame(scene);
    let recorded = false;
    let myStats = { towersDestroyed: 0, bestSpellHit: 0, cardsPlayed: 0 };
    Net.on('matchStats', (stats) => { myStats = stats; });
    const finishGuestMatch = () => {
        if (recorded || !g.result) return;
        recorded = true;
        if (g.result.winner === TEAM.PLAYER) sfx.win();
        else if (g.result.winner === TEAM.ENEMY) sfx.lose();
        const rewards = recordMatch({
            difficulty: 'pvp', deck: [...pvpDeck], win: g.result.winner === TEAM.PLAYER,
            draw: g.result.winner == null, crowns: g.result.crowns[TEAM.PLAYER],
            towersDestroyed: myStats.towersDestroyed, bestSpellHit: myStats.bestSpellHit,
            cardsPlayed: myStats.cardsPlayed, gauntletStage: 0,
            matchSeconds: g._clock, avgCost: pvpDeck.reduce((s, id) => s + CARDS[id].cost, 0) / pvpDeck.length,
        });
        submitScore();
        ui.showEnd({ winner: g.result.winner, crowns: g.result.crowns }, { rewards, damage: {}, mode: 'pvp', stage: 0 });
    };
    guestFinish = finishGuestMatch; // 投降（onQuit）都要行到入賬
    Net.on('state', (snap) => {
        g.applySnapshot(snap);
        if (g.phase === 'ended') finishGuestMatch();
    });
    // 斷線 ≠ 即刻判負：30 秒寬限期等 host 重連（順帶取代咗以前 1.2 秒
    // 「等最終快照」嘅 race 緩衝——寬限期內快照到咗就直接正常完場）
    armDisconnectGrace({
        onWalkover: () => {
            if (recorded) return;
            if (g.phase !== 'ended') {
                g.phase = 'ended';
                g.result = { winner: TEAM.PLAYER, crowns: { ...g.crowns } };
            }
            // 房結果都要寫低（host 唔喺度冇人寫）——唔係間房會一直 playing，
            // host 遲下重連仲會入返嚟一間其實已完場嘅鬼房
            Net.reportResult('guest', 'opponent_left');
            finishGuestMatch();
        },
        stillPlaying: () => netRole === 'guest' && !recorded,
    });
    game = g;
    window.__royale = { game };
    ui.bindGame(game);
    ui.showGame();
    ui.banner('⚔️ 對手已連線，開波！你操控嘅係企喺對面嗰隊', 2200);
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

    if (rts && rts.active) {
        rts.update(dt);
        // Clash 戰場喺 RTS 期間收起咗，唔使 arena.update（RTS 大地圖係靜態）
        renderer.render(scene, camera);
        return;
    }

    if (running && game) {
        if (netRole === 'guest') {
            // Guest 唔跑本機模擬，淨係推動渲染用嘅本地時鐘（bob/攻擊動畫）
            game.tick(dt);
        } else {
            acc += dt;
            while (acc >= STEP) {
                game.update(STEP);
                ai?.update(STEP);
                hostRelay?.tick(STEP);
                acc -= STEP;
            }
        }
        game.updateHpBarOrientation(camera.quaternion);
        ui.update();
        // 入咗加時就轉黃昏光（guest 嘅 phase 由快照嚟，一樣會觸發）；完場維持黃昏直到 cleanup
        if (game.phase === 'overtime') arena.setMood?.(1);
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
    rts = createRtsMode({
        scene, camera, renderer, screenToWorld,
        zoomBy: (f) => { zoom = clampZoom(zoom * f); applyCameraView(); },
        onExit: () => {
            // 由 RTS 返 Clash：還原戰場、霧、鏡頭 fit 範圍
            if (arena.root) arena.root.visible = true;
            if (clashFog) scene.fog = clashFog;
            camHalfW = ARENA.halfW; camHalfL = ARENA.halfL;
            fitCamera();
            arena.setMood?.(0); resetCameraView(); ui.showStart();
        },
    });
    window.__rts = rts; // 畀自動化測試用
    window.__royaleRenderer = renderer; // 畀滲漏測試量度 GPU 資源
    window.__royaleCamera = camera; // 畀鏡頭平移測試用
    ui.showStart();
    checkReconnect(); // 上一場 PvP 打到一半 refresh 咗？有得救就彈「重連」bar
    document.getElementById('loading')?.remove();
    requestAnimationFrame(loop);
}
init();
