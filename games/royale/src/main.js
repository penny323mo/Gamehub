// 入口 — Three.js 場景、鏡頭、遊戲循環、拖放落卡
import * as THREE from 'three';
import { ARENA, TEAM } from './constants.js';
import { CARDS } from './cards.js';
import { buildArena } from './arena.js';
import { Game } from './game.js';
import { AIController } from './ai.js';
import { UI } from './ui.js';
import { sfx } from './sfx.js';
import { randomDeck } from './cards.js';

// ---------- Renderer / Scene ----------
const holder = document.getElementById('canvas-holder');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
holder.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fc4e0);
scene.fog = new THREE.Fog(0x9fc4e0, 60, 110);

const camera = new THREE.PerspectiveCamera(52, 1, 0.5, 200);
const arena = buildArena(scene);

// ---------- 鏡頭自動適配（handset 直向 / 橫向都睇到全場） ----------
const fitPoints = [
    new THREE.Vector3(-ARENA.halfW - 0.8, 0, ARENA.halfL + 0.8),
    new THREE.Vector3(ARENA.halfW + 0.8, 0, ARENA.halfL + 0.8),
    new THREE.Vector3(-ARENA.halfW - 0.8, 0, -ARENA.halfL - 0.8),
    new THREE.Vector3(ARENA.halfW + 0.8, 0, -ARENA.halfL - 0.8),
    new THREE.Vector3(0, 5, -ARENA.halfL),   // 敵方王塔頂
    new THREE.Vector3(0, 4, ARENA.halfL),
];
const tmpV = new THREE.Vector3();

function fitCamera() {
    const w = holder.clientWidth, h = holder.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;

    // 可用範圍：底部留返位畀手牌 UI
    const X_MAX = 0.96, Y_MAX = 0.94, Y_MIN = -0.62;
    const Y_MID = (Y_MAX + Y_MIN) / 2;
    let targetZ = -1.2;
    outer:
    for (let d = 24; d < 90; d += 1.0) {
        for (let iter = 0; iter < 10; iter++) {
            camera.position.set(0, d * 0.82, d * 0.60 + 5);
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
                // 上下唔平均 → 校鏡頭望向邊個 z 位置
                targetZ += (Y_MID - mid) * 6;
                continue;
            }
            if (maxX <= X_MAX && maxY <= Y_MAX && minY >= Y_MIN) break outer;
            break;
        }
    }
}
window.addEventListener('resize', fitCamera);
fitCamera();

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
let running = false;

function showZones(show) {
    if (!game) return;
    arena.zones.own.visible = show;
    arena.zones.pocketL.visible = show && game.towers[TEAM.ENEMY].left.dead;
    arena.zones.pocketR.visible = show && game.towers[TEAM.ENEMY].right.dead;
}

const ui = new UI({
    onStart(deck, difficulty) {
        startMatch(deck, difficulty);
    },
    onAgain() {
        startMatch(ui.deck, ui.difficulty);
    },
    onQuit() {
        if (game && game.phase !== 'ended') {
            // 投降 = 對方三冠
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
        ghost.visible = false;
        showZones(false);
    },
});

function cleanupMatch() {
    if (!game) return;
    // 清走所有戰鬥物件（保留戰場本身）
    for (const e of game.entities) {
        scene.remove(e.model);
        scene.remove(e.hpBar);
    }
    for (const pr of game.projectiles) scene.remove(pr.model);
    for (const ef of game.effects) if (ef.mesh) scene.remove(ef.mesh);
    // 瓦礫係 effect onEnd 加落 scene 嘅獨立物件，用名搵唔到，索性重建個場
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
        onSpawn() { /* 部署音效已喺 onDrop 處理，AI 出兵靜啲 */ },
    });
    ai = new AIController(game, difficulty);
    window.__royale = { game, ai }; // 畀自動化測試用
    ui.bindGame(game);
    ui.showGame();
    ui.banner('⚔️ 開戰！', 1200);
    running = true;
}

// ---------- 主循環（固定時步模擬） ----------
let last = performance.now();
let acc = 0;
const STEP = 1 / 60;

function loop(now) {
    requestAnimationFrame(loop);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25; // switch tab 返嚟唔好爆 step

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
    renderer.render(scene, camera);
}
requestAnimationFrame(loop);

ui.showStart();
