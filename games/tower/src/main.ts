import * as THREE from 'three';
import { createInitialState } from './core/gameState';
import { LOGIC_DT, TOWERS, SCORING, WAVES } from './core/config';
import { tickWave, startNextWave } from './core/systems/waveSystem';
import { tickEnemies } from './core/systems/enemySystem';
import { tickTowers } from './core/systems/towerSystem';
import { tickCombat } from './core/systems/combatSystem';
import { buildTower, canBuild, upgradeTower, sellTower, getSellValue, canUpgrade } from './core/systems/economySystem';
import type { GameState, TowerType, Tower } from './core/types';

import { SceneManager } from './render/sceneManager';
import { createCamera, handleResize } from './render/camera';
import { setupLighting } from './render/lighting';
import { TowerRenderer } from './render/towerRenderer';
import { EnemyRenderer } from './render/enemyRenderer';
import { FxRenderer } from './render/fx';
import { Picking } from './render/picking';

// ─── State ───
let state: GameState;
let selectedTowerType: TowerType | null = null;
let inspectedTower: Tower | null = null;

// ─── Renderer setup ───
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const sm = new SceneManager();
const camera = createCamera();
setupLighting(sm.scene);
sm.buildGround();

const towerRenderer = new TowerRenderer(sm.scene);
const enemyRenderer = new EnemyRenderer(sm.scene);
const fxRenderer = new FxRenderer(sm.scene);
const picking = new Picking(sm.scene);

state = createInitialState();

// ─── DOM refs ───
const goldEl = document.getElementById('gold-val')!;
const livesEl = document.getElementById('lives-val')!;
const waveEl = document.getElementById('wave-val')!;
const speedBtn = document.getElementById('speed-btn')!;
const waveBanner = document.getElementById('wave-banner')!;
const waveBannerText = document.getElementById('wave-banner-text')!;
const startScreen = document.getElementById('start-screen')!;
const endScreen = document.getElementById('end-screen')!;
const endTitle = document.getElementById('end-title')!;
const endScore = document.getElementById('end-score')!;
const endRank = document.getElementById('end-rank')!;
const towerPanel = document.getElementById('tower-panel')!;
const cancelBuildBtn = document.getElementById('cancel-build-btn')!;
const buildBtns = document.querySelectorAll('.build-btn[data-tower]');

const TOTAL_WAVES = WAVES.waves.length;

// ─── HUD update ───
function updateHUD(): void {
    goldEl.textContent = String(state.gold);
    livesEl.textContent = String(state.lives);
    waveEl.textContent = `${Math.min(state.currentWave + 1, TOTAL_WAVES)}/${TOTAL_WAVES}`;

    // Update build button affordance
    buildBtns.forEach(btn => {
        const type = btn.getAttribute('data-tower') as TowerType;
        const cost = TOWERS[type].levels[0].buildCost;
        const canAfford = state.gold >= cost;
        btn.classList.toggle('disabled', !canAfford);
    });
}

// ─── Wave Banner ───
let bannerTimeout: number | null = null;
function showWaveBanner(text: string): void {
    waveBannerText.textContent = text;
    waveBanner.classList.remove('hidden');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = window.setTimeout(() => {
        waveBanner.classList.add('hidden');
    }, 2000);
}

// ─── Tower Panel ───
function showTowerPanel(tower: Tower): void {
    inspectedTower = tower;
    const towerCfg = TOWERS[tower.type];
    const cfg = towerCfg.levels[tower.level];

    document.getElementById('panel-tower-name')!.textContent = towerCfg.name;
    document.getElementById('panel-tower-level')!.textContent = `Lv.${tower.level + 1}`;
    document.getElementById('panel-dmg')!.textContent = String(cfg.damage);
    document.getElementById('panel-spd')!.textContent = `${cfg.cooldownSec}s`;
    document.getElementById('panel-rng')!.textContent = String(cfg.range);

    const specialEl = document.getElementById('panel-special')!;
    const specials: string[] = [];
    if (cfg.aoeRadius > 0) specials.push(`AOE ${cfg.aoeRadius}`);
    if (cfg.slow) specials.push(`Slow ${Math.round(cfg.slow.pct * 100)}%`);
    if (cfg.dot) specials.push(`DOT ${cfg.dot.dps}/s ${cfg.dot.durationSec}s`);
    if (cfg.chain) specials.push(`Chain ×${cfg.chain.targets}`);
    specialEl.textContent = specials.length > 0 ? specials.join(' | ') : '—';

    const upgradeBtn = document.getElementById('upgrade-btn')! as HTMLButtonElement;
    const sellBtn = document.getElementById('sell-btn')!;
    const levels = towerCfg.levels;

    if (tower.level >= levels.length - 1) {
        upgradeBtn.disabled = true;
        upgradeBtn.textContent = '⬆ MAX';
    } else {
        const cost = levels[tower.level + 1].upgradeCost;
        upgradeBtn.disabled = !canUpgrade(state, tower);
        upgradeBtn.innerHTML = `⬆ Upgrade (<span id="upgrade-cost">${cost}</span>g)`;
    }

    document.getElementById('sell-value')!.textContent = String(getSellValue(tower));
    sellBtn.innerHTML = `💰 Sell (<span id="sell-value">${getSellValue(tower)}</span>g)`;

    towerPanel.classList.remove('hidden');
    towerRenderer.showRange(tower, cfg.range);
}

function hideTowerPanel(): void {
    inspectedTower = null;
    towerPanel.classList.add('hidden');
    towerRenderer.hideRange();
}

// ─── End Screen ───
function showEndScreen(): void {
    const won = state.phase === 'won';
    endTitle.textContent = won ? '🎉 Victory!' : '💀 Defeat';
    endTitle.style.color = won ? '#ffd700' : '#ff5555';
    endScore.textContent = `Score: ${state.score}`;

    let rank = 'C';
    for (const r of SCORING.ranks) {
        if (state.score >= r.min) { rank = r.name; break; }
    }
    endRank.textContent = rank;
    endRank.className = `rank rank-${rank}`;
    endScreen.classList.remove('hidden');
}

// ─── Event Handlers ───

// Build menu click
buildBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-tower') as TowerType;
        if (state.gold < TOWERS[type].levels[0].buildCost) return;

        if (selectedTowerType === type) {
            selectedTowerType = null;
            btn.classList.remove('selected');
            cancelBuildBtn.style.display = 'none';
            picking.hideGhost();
        } else {
            buildBtns.forEach(b => b.classList.remove('selected'));
            selectedTowerType = type;
            btn.classList.add('selected');
            cancelBuildBtn.style.display = '';
            hideTowerPanel();
        }
    });
});

// Cancel build
cancelBuildBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedTowerType = null;
    buildBtns.forEach(b => b.classList.remove('selected'));
    cancelBuildBtn.style.display = 'none';
    picking.hideGhost();
});

// Speed toggle
speedBtn.addEventListener('click', () => {
    state.speedMultiplier = state.speedMultiplier === 1 ? 2 : 1;
    speedBtn.textContent = `${state.speedMultiplier}×`;
    speedBtn.classList.toggle('active', state.speedMultiplier === 2);
});

// Tower panel buttons
document.getElementById('upgrade-btn')!.addEventListener('click', () => {
    if (!inspectedTower) return;
    if (upgradeTower(state, inspectedTower.id)) {
        towerRenderer.removeTower(inspectedTower.id);
        towerRenderer.sync(state);
        showTowerPanel(inspectedTower);
        updateHUD();
    }
});

document.getElementById('sell-btn')!.addEventListener('click', () => {
    if (!inspectedTower) return;
    towerRenderer.removeTower(inspectedTower.id);
    sellTower(state, inspectedTower.id);
    hideTowerPanel();
    towerRenderer.sync(state);
    updateHUD();
});

document.getElementById('panel-close-btn')!.addEventListener('click', () => {
    hideTowerPanel();
});

// Start button
document.getElementById('start-btn')!.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    startNextWave(state);
    showWaveBanner(`Wave 1`);
});

// Restart
document.getElementById('restart-btn')!.addEventListener('click', () => {
    endScreen.classList.add('hidden');
    state = createInitialState();
    towerRenderer.sync(state);
    updateHUD();
    hideTowerPanel();
    startNextWave(state);
    showWaveBanner('Wave 1');
});

// Home
document.getElementById('home-btn')!.addEventListener('click', () => {
    window.location.href = '../../../index.html';
});

// Canvas click (place tower or inspect)
canvas.addEventListener('click', () => {
    if (state.phase === 'idle' || state.phase === 'won' || state.phase === 'lost') return;

    const col = picking.hoveredCol;
    const row = picking.hoveredRow;
    if (col < 0 || row < 0) return;

    if (selectedTowerType) {
        const tower = buildTower(state, selectedTowerType, col, row);
        if (tower) {
            towerRenderer.sync(state);
            updateHUD();
        }
    } else {
        const tower = state.towers.find(t => t.col === col && t.row === row);
        if (tower) {
            showTowerPanel(tower);
        } else {
            hideTowerPanel();
        }
    }
});

// Mouse/touch move for placement preview
canvas.addEventListener('mousemove', (e) => {
    picking.updateMouse(e, camera);
    updateGhost();
});

canvas.addEventListener('touchmove', (e) => {
    picking.updateMouse(e, camera);
    updateGhost();
}, { passive: true });

function updateGhost(): void {
    if (!selectedTowerType || picking.hoveredCol < 0) {
        picking.hideGhost();
        return;
    }
    const valid = canBuild(state, picking.hoveredCol, picking.hoveredRow)
        && state.gold >= TOWERS[selectedTowerType].levels[0].buildCost;
    const range = TOWERS[selectedTowerType].levels[0].range;
    picking.showGhost(picking.hoveredCol, picking.hoveredRow, valid, selectedTowerType, range);
}

// Resize
window.addEventListener('resize', () => handleResize(camera, renderer));

// ─── Game Loop ───
let lastTime = 0;
let accumulator = 0;
let lastWave = -1;

let prevProjectileIds = new Set<number>();

function gameLoop(time: number): void {
    requestAnimationFrame(gameLoop);

    const rawDt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    if (state.phase === 'idle') {
        renderer.render(sm.scene, camera);
        return;
    }

    if (state.phase === 'won' || state.phase === 'lost') {
        if (endScreen.classList.contains('hidden')) {
            showEndScreen();
        }
        renderer.render(sm.scene, camera);
        return;
    }

    const dt = rawDt * state.speedMultiplier;
    accumulator += dt;

    // Fixed-step logic
    while (accumulator >= LOGIC_DT) {
        const currentProjIds = new Set(state.projectiles.map(p => p.id));

        tickWave(state, LOGIC_DT);
        tickEnemies(state, LOGIC_DT);
        tickTowers(state, LOGIC_DT);
        tickCombat(state, LOGIC_DT);

        for (const id of prevProjectileIds) {
            if (!state.projectiles.find(p => p.id === id)) {
                // projectile hit — FX handled by fxRenderer
            }
        }
        prevProjectileIds = new Set(state.projectiles.map(p => p.id));

        accumulator -= LOGIC_DT;

        // Check game over conditions
        const phase = state.phase as string;
        if (phase === 'won' || phase === 'lost') {
            showEndScreen();
            break;
        }
    }

    // Wave banner
    if (state.currentWave !== lastWave && state.phase === 'wave') {
        lastWave = state.currentWave;
        showWaveBanner(`Wave ${state.currentWave + 1}`);
    }

    // Prep countdown banner
    if (state.phase === 'prep') {
        const secs = Math.ceil(state.prepTimer);
        waveBannerText.textContent = `Next wave in ${secs}...`;
        waveBanner.classList.remove('hidden');
    }

    // Render sync
    towerRenderer.sync(state);
    enemyRenderer.sync(state, 0);
    fxRenderer.sync(state, rawDt);

    // Update HUD
    updateHUD();

    // Update tower panel if open
    if (inspectedTower) {
        const stillExists = state.towers.find(t => t.id === inspectedTower!.id);
        if (!stillExists) hideTowerPanel();
    }

    renderer.render(sm.scene, camera);
}

requestAnimationFrame(gameLoop);
