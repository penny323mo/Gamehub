import * as THREE from 'three';
import { createInitialState } from './core/gameState';
import { LOGIC_DT, TOWERS, SCORING, WAVES, GRAPHICS } from './core/config';
import { tickWave, startNextWave } from './core/systems/waveSystem';
import { tickEnemies } from './core/systems/enemySystem';
import { tickTowers } from './core/systems/towerSystem';
import { tickCombat } from './core/systems/combatSystem';
import { buildTower, canBuild, upgradeTower, sellTower, getSellValue, canUpgrade } from './core/systems/economySystem';
import type { GameState, TowerType, Tower, TargetingMode } from './core/types';

import { SceneManager } from './render/sceneManager';
import { CameraController } from './render/camera';
import { setupLighting } from './render/lighting';
import { TowerRenderer } from './render/towerRenderer';
import { EnemyRenderer } from './render/enemyRenderer';
import { FxRenderer } from './render/fx';
import { ProjectileRenderer } from './render/projectileRenderer';
import { Picking } from './render/picking';
import { PostProcessor } from './render/postProcessing';

// ─── State ───
let state: GameState;
let selectedTowerType: TowerType | null = null;
let inspectedTower: Tower | null = null;

// ─── Renderer setup ───
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(GRAPHICS.pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

if (GRAPHICS.enableShadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
}

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const sm = new SceneManager();
const camCtrl = new CameraController();
const camera = camCtrl.cam;
setupLighting(sm.scene);
sm.buildGround();

const towerRenderer = new TowerRenderer(sm.scene);
const enemyRenderer = new EnemyRenderer(sm.scene);
const fxRenderer = new FxRenderer(sm.scene);
const projectileRenderer = new ProjectileRenderer(sm.scene);
const picking = new Picking(sm.scene);

let postProcessor: PostProcessor | null = null;
if (GRAPHICS.enablePostProcessing) {
    postProcessor = new PostProcessor(renderer, sm.scene, camera);
}

state = createInitialState();

// ─── DOM refs ───
const goldEl = document.getElementById('gold-val')!;
const livesEl = document.getElementById('lives-val')!;
const waveEl = document.getElementById('wave-val')!;
const killsEl = document.getElementById('kills-val')!;
const speedBtn = document.getElementById('speed-btn')!;
const pauseBtn = document.getElementById('pause-btn')!;
const skipPrepBtn = document.getElementById('skip-prep-btn')! as HTMLButtonElement;
const waveBanner = document.getElementById('wave-banner')!;
const waveBannerText = document.getElementById('wave-banner-text')!;
const milestoneBanner = document.getElementById('milestone-banner')!;
const milestoneBannerText = document.getElementById('milestone-banner-text')!;
const floatingTextLayer = document.getElementById('floating-text-layer')!;
const helpBtn = document.getElementById('help-btn')!;
const helpOverlay = document.getElementById('help-overlay')!;
const helpCloseBtn = document.getElementById('help-close-btn')!;
const startScreen = document.getElementById('start-screen')!;
const endScreen = document.getElementById('end-screen')!;
const endTitle = document.getElementById('end-title')!;
const endScore = document.getElementById('end-score')!;
const endRank = document.getElementById('end-rank')!;
const towerPanel = document.getElementById('tower-panel')!;
const cancelBuildBtn = document.getElementById('cancel-build-btn')!;
const buildBtns = document.querySelectorAll('.build-btn[data-tower]');
const streakBanner = document.getElementById('streak-banner')!;

const TOTAL_WAVES = WAVES.waves.length;

// Enemy type → display emoji
const ENEMY_EMOJI: Record<string, string> = {
    grunt: '🧟', tank: '🐢', runner: '💨', swarm: '🐝',
    shield: '🛡', healer: '💚', boss: '💀',
};

// ─── HUD update ───
function updateHUD(): void {
    goldEl.textContent = String(state.gold);
    livesEl.textContent = String(state.lives);
    waveEl.textContent = `${Math.min(state.currentWave + 1, TOTAL_WAVES)}/${TOTAL_WAVES}`;
    killsEl.textContent = String(state.totalKills);

    // Skip prep button visibility
    skipPrepBtn.classList.toggle('hidden', state.phase !== 'prep');

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

// ─── Streak Banner ───
let streakBannerTimeout: number | null = null;
function showStreakBanner(streak: number): void {
    const isMega = streak >= 10;
    streakBanner.textContent = isMega
        ? `⚡ x${streak} MEGA COMBO!`
        : `🔥 x${streak} Kill Streak!`;
    streakBanner.className = isMega ? 'streak-mega' : 'streak-normal';
    streakBanner.classList.remove('hidden');
    if (streakBannerTimeout) clearTimeout(streakBannerTimeout);
    streakBannerTimeout = window.setTimeout(() => {
        streakBanner.classList.add('hidden');
    }, 1800);
}

// ─── Milestone Banner ───
let milestoneTimeout: number | null = null;
function showMilestoneBanner(waveNum: number): void {
    milestoneBannerText.textContent = `🏆 Milestone Wave ${waveNum}! +500g!`;
    milestoneBanner.classList.remove('hidden');
    // Force animation restart
    milestoneBannerText.style.animation = 'none';
    void milestoneBannerText.offsetWidth;
    milestoneBannerText.style.animation = '';
    if (milestoneTimeout) clearTimeout(milestoneTimeout);
    milestoneTimeout = window.setTimeout(() => {
        milestoneBanner.classList.add('hidden');
    }, 3500);
}

// ─── Floating Texts (K) ───
// project world coords to screen pixel coords
function worldToScreen(wx: number, wz: number): { x: number; y: number } {
    const v = new THREE.Vector3(wx, 0.6, wz);
    v.project(camera);
    return {
        x: (v.x * 0.5 + 0.5) * window.innerWidth,
        y: (-v.y * 0.5 + 0.5) * window.innerHeight,
    };
}

const activeFloatEls = new Map<number, HTMLDivElement>();

function syncFloatingTexts(rawDt: number): void {
    // Update life and position of each
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.life -= rawDt;
        if (ft.life <= 0) {
            const el = activeFloatEls.get(ft.id);
            if (el) { floatingTextLayer.removeChild(el); activeFloatEls.delete(ft.id); }
            state.floatingTexts.splice(i, 1);
            continue;
        }
        // Create div on first tick
        if (!activeFloatEls.has(ft.id)) {
            const div = document.createElement('div');
            div.className = 'floating-text';
            div.textContent = ft.value;
            div.style.color = ft.color;
            div.style.animationDuration = `${ft.maxLife}s`;
            floatingTextLayer.appendChild(div);
            activeFloatEls.set(ft.id, div);
        }
        // Update position
        const el = activeFloatEls.get(ft.id)!;
        const sc = worldToScreen(ft.worldX, ft.worldZ);
        el.style.left = `${sc.x}px`;
        el.style.top = `${sc.y}px`;
    }
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

    // Targeting mode buttons
    document.querySelectorAll('.target-btn').forEach(btn => {
        const mode = btn.getAttribute('data-mode') as TargetingMode;
        btn.classList.toggle('active', tower.targetingMode === mode);
        (btn as HTMLButtonElement).onclick = () => {
            tower.targetingMode = mode;
            document.querySelectorAll('.target-btn').forEach(b =>
                b.classList.toggle('active', b.getAttribute('data-mode') === mode)
            );
        };
    });

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

// Speed toggle — cycle 1× / 2× / 3×
speedBtn.addEventListener('click', () => {
    if (state.speedMultiplier === 1) {
        state.speedMultiplier = 2;
    } else if (state.speedMultiplier === 2) {
        state.speedMultiplier = 3;
    } else {
        state.speedMultiplier = 1;
    }
    speedBtn.textContent = `${state.speedMultiplier}×`;
    speedBtn.classList.toggle('active', state.speedMultiplier > 1);
});

// Pause toggle
pauseBtn.addEventListener('click', togglePause);

function togglePause(): void {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? '▶' : '⏸';
    pauseBtn.classList.toggle('active', state.paused);
}

// P key to pause
window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        if (state.phase === 'wave' || state.phase === 'prep') togglePause();
    }
});

// Skip Prep
skipPrepBtn.addEventListener('click', () => {
    if (state.phase !== 'prep') return;
    // Give Gold bonus for skipping prep
    state.gold += 50;
    state.prepTimer = 0;
    skipPrepBtn.classList.add('hidden');
    updateHUD();
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
    const sellVal = getSellValue(inspectedTower);
    towerRenderer.removeTower(inspectedTower.id);
    sellTower(state, inspectedTower.id);
    // N — show sell gold float
    state.floatingTexts.push({
        id: state.nextId++,
        worldX: inspectedTower.worldX,
        worldZ: inspectedTower.worldZ,
        value: `+${sellVal}g`,
        color: '#ffd700',
        life: 1.5,
        maxLife: 1.5,
    });
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

// Help overlay
helpBtn.addEventListener('click', () => {
    helpOverlay.classList.remove('hidden');
});
helpCloseBtn.addEventListener('click', () => {
    helpOverlay.classList.add('hidden');
});
helpOverlay.addEventListener('click', (e) => {
    if (e.target === helpOverlay) helpOverlay.classList.add('hidden');
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

// Canvas click (place tower or inspect) — guard against two-finger gestures
canvas.addEventListener('click', () => {
    if (camCtrl.twoFingerActive) return;
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
    // Only update placement preview during single-finger touch
    if (e.touches.length === 1 && !camCtrl.twoFingerActive) {
        picking.updateMouse(e, camera);
        updateGhost();
    }
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

// ─── Camera Controls ───
// Scroll wheel zoom
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camCtrl.zoom(e.deltaY);
}, { passive: false });

// Touch pinch-zoom & rotation
canvas.addEventListener('touchstart', camCtrl.onTouchStart, { passive: true });
canvas.addEventListener('touchmove', camCtrl.onTouchMove, { passive: false });
canvas.addEventListener('touchend', camCtrl.onTouchEnd, { passive: true });

// Resize
window.addEventListener('resize', () => {
    camCtrl.resize(renderer);
    if (postProcessor) {
        postProcessor.resize(window.innerWidth, window.innerHeight);
    }
});

// ─── Game Loop ───
let lastTime = 0;
let accumulator = 0;
let lastWave = -1;

let prevProjectileIds = new Set<number>();

function renderScene() {
    if (postProcessor) {
        postProcessor.render();
    } else {
        renderer.render(sm.scene, camera);
    }
}

function gameLoop(time: number): void {
    requestAnimationFrame(gameLoop);

    const rawDt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    if (state.phase === 'idle') {
        renderScene();
        return;
    }

    if (state.phase === 'won' || state.phase === 'lost') {
        if (endScreen.classList.contains('hidden')) {
            showEndScreen();
        }
        renderScene();
        return;
    }

    // Pause gate
    if (state.paused) {
        renderScene();
        return;
    }

    const dt = rawDt * state.speedMultiplier;
    accumulator += dt;
    // Cap accumulator to prevent spiral-of-death on lag spikes
    const MAX_STEPS = 5;
    if (accumulator > LOGIC_DT * MAX_STEPS) accumulator = LOGIC_DT * MAX_STEPS;

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
        const nextWaveIdx = Math.min(state.currentWave + 1, TOTAL_WAVES - 1);
        const waveGroup = WAVES.waves[nextWaveIdx];
        const totalEnemies = waveGroup?.groups?.reduce((s: number, g: { count: number }) => s + g.count, 0) ?? '?';
        // E — Enemy type emoji preview
        const enemyPreview = waveGroup?.groups?.map((g: { type: string; count: number }) =>
            `${ENEMY_EMOJI[g.type] ?? '?'}×${g.count}`
        ).join(' ') ?? '';
        waveBannerText.textContent = `Wave ${nextWaveIdx + 1} — ${totalEnemies} enemies | ${enemyPreview} | Next in ${secs}s`;
        waveBanner.classList.remove('hidden');
    }

    // Render sync
    towerRenderer.animate(rawDt, state);
    towerRenderer.sync(state);
    enemyRenderer.sync(state, 0, camera);  // C — pass camera for billboard bars
    fxRenderer.sync(state, dt);
    projectileRenderer.sync(state, dt);
    syncFloatingTexts(rawDt);

    // O — Milestone banner
    if (state.milestoneReached > 0) {
        showMilestoneBanner(state.milestoneReached);
        state.milestoneReached = 0;
    }

    // B — Streak banner (trigger on multiples of 5 when streak >= 5)
    if (state.killStreak >= 5 && state.killStreak % 5 === 0 && state.killStreakTimer > 2.9) {
        showStreakBanner(state.killStreak);
    }

    // Update HUD
    updateHUD();

    // Update tower panel if open
    if (inspectedTower) {
        const stillExists = state.towers.find(t => t.id === inspectedTower!.id);
        if (!stillExists) hideTowerPanel();
    }

    renderScene();
}

requestAnimationFrame(gameLoop);
