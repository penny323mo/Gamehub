import * as THREE from 'three';
import { createInitialState } from './core/gameState';
import { LOGIC_DT, MAP, TOWERS, SCORING, WAVES, GRAPHICS, ENEMIES, 設HP曲率 } from './core/config';
import { tickWave, startNextWave, MODIFIERS, templateIndex, spawnEnemy } from './core/systems/waveSystem';
import { buildPathWorld, cellToWorld } from './core/path';
import { CAMPAIGN_CHAPTERS, chapterForWave, chapterProgress, isChapterOpening } from './core/chapters';
import { milestoneOffer, milestonePlan } from './core/gameplayRandom';
import { tickEnemies } from './core/systems/enemySystem';
import { tickTowers } from './core/systems/towerSystem';
import { applyHit, tickCombat } from './core/systems/combatSystem';
import { buildTower, canBuild, upgradeTower, sellTower, getSellValue, canUpgrade, evolveTower } from './core/systems/economySystem';
import type { GameState, TowerType, Tower, TargetingMode, Difficulty, Enemy, Projectile } from './core/types';
import { bus } from './core/systems/eventBus';
import { SceneManager } from './render/sceneManager';
import { CameraController } from './render/camera';
import { setupLighting } from './render/lighting';
import { TowerRenderer } from './render/towerRenderer';
import { EnemyRenderer, 裝敵模型 } from './render/enemyRenderer';
import { FxRenderer } from './render/fx';
import { ProjectileRenderer } from './render/projectileRenderer';
import { Picking } from './render/picking';
import { PostProcessor } from './render/postProcessing';
import { audioSystem } from './core/systems/audioSystem';
import {
    loadPersisted,
    savePersisted,
    recordHighScore,
    unlockAchievement,
    recordRunComplete,
    resetProgress,
    type PersistedData,
} from './core/storage';
import { ACHIEVEMENTS, type Achievement } from './core/achievements';
import { makeDraggable, resetUiLayout } from './ui/draggable';
import {
    clearRunCheckpoint,
    loadRunCheckpoint,
    restoreRunCheckpoint,
    saveRunCheckpoint,
    type RunCheckpoint,
} from './ui/runCheckpoint';
import { 量模型, 預載, 塔件清單, 敵件清單 } from './render/assets';
import { Gateway } from './render/gateway';

// ─── State ───
const persisted: PersistedData = loadPersisted();
let state: GameState;
let selectedTowerType: TowerType | null = null;
let inspectedTower: Tower | null = null;
let currentDifficulty: Difficulty = persisted.prefs.difficulty;
let availableCheckpoint: RunCheckpoint | null = loadRunCheckpoint();

// ─── Renderer setup ───
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !GRAPHICS.isMobile, powerPreference: 'high-performance' });
renderer.setPixelRatio(GRAPHICS.pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

if (GRAPHICS.enableShadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
}

renderer.toneMapping = GRAPHICS.isMobile ? THREE.LinearToneMapping : THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = GRAPHICS.isMobile ? 1.0 : 1.28;

const sm = new SceneManager();
const camCtrl = new CameraController();
const camera = camCtrl.cam;
const lightingRig = setupLighting(sm.scene);
// 鋪地要等模型載完，而 dist 出 IIFE（為咗 file:// 行得，見 vite.config），
// 冇頂層 await。所以呢度攞住個 promise，撳 START 之前 await 佢——開場前一定鋪好，
// 而載模型嗰段時間本來就係玩家喺開始畫面度嘅時間。
// 出生門同終點城堡都要模型，所以同鋪地一齊喺開場前預載好
// （`取同步` 未預載會大聲掛，唔會靜靜哋少咗道門）。
const gateway = new Gateway(sm.scene);
const spawnWorld = buildPathWorld()[0];
const goalWorld = cellToWorld(MAP.goalCell[0], MAP.goalCell[1]);
const 地面好 = Promise.all([
    sm.buildGround(),
    預載([...Gateway.清單(), ...塔件清單(), ...敵件清單()]),
]).then(() => { gateway.build(); 裝敵模型(); });

const towerRenderer = new TowerRenderer(sm.scene);
const enemyRenderer = new EnemyRenderer(sm.scene);
const fxRenderer = new FxRenderer(sm.scene);
const projectileRenderer = new ProjectileRenderer(sm.scene);
const picking = new Picking(sm.scene);

let postProcessor: PostProcessor | null = null;
if (GRAPHICS.enablePostProcessing) {
    postProcessor = new PostProcessor(renderer, sm.scene, camera);
}

// ─── Campaign atmosphere — the same five chapters drive HUD and world tint ───
let lastAtmosphereWave = -1;
const fogColorTmp = new THREE.Color();
function applyAtmosphere(wave: number): void {
    if (wave === lastAtmosphereWave) return;
    lastAtmosphereWave = wave;

    const w = Math.max(1, wave + 1); // 0-based → 1-based
    const lo = chapterForWave(w);
    const chapterIndex = CAMPAIGN_CHAPTERS.findIndex((chapter) => chapter.id === lo.id);
    const hi = CAMPAIGN_CHAPTERS[Math.min(chapterIndex + 1, CAMPAIGN_CHAPTERS.length - 1)];
    // Spend the latter half of an act travelling towards the next palette. The
    // next chapter therefore arrives without an abrupt day/night colour snap.
    const progress = chapterProgress(w);
    const k = THREE.MathUtils.smoothstep(progress, 0.45, 1);
    const r = lo.tint[0] + (hi.tint[0] - lo.tint[0]) * k;
    const g = lo.tint[1] + (hi.tint[1] - lo.tint[1]) * k;
    const b = lo.tint[2] + (hi.tint[2] - lo.tint[2]) * k;
    if (postProcessor) postProcessor.setTint(r, g, b);

    const loC = new THREE.Color(lo.fog);
    const hiC = new THREE.Color(hi.fog);
    fogColorTmp.copy(loC).lerp(hiC, k);
    if (sm.scene.fog && 'color' in sm.scene.fog) {
        (sm.scene.fog as THREE.FogExp2).color.copy(fogColorTmp);
    }
}

state = createInitialState(currentDifficulty);
state.speedMultiplier = persisted.prefs.speedMultiplier;

function captureSafeCheckpoint(): void {
    if (!saveRunCheckpoint(state)) return;
    availableCheckpoint = loadRunCheckpoint();
}

// ─── EventBus Listeners ───
bus.on('streakBonus', e => showStreakBanner(e.streak));
bus.on('milestone', e => {
    showMilestoneBanner(e.wave);
    // C10 — open buff choice modal at every 25-wave milestone (skip the 99 finale)
    if (e.wave !== 99 && e.wave > 0 && e.wave % 25 === 0) {
        openBuffModal(e.wave);
    }
});
bus.on('towerBuilt', e => {
    const pos = cellToWorld(e.col, e.row);
    fxRenderer.addBuildEffect(pos.x, pos.z);

    towerRenderer.sync(state);
    updateHUD();
    captureSafeCheckpoint();
});
bus.on('towerUpgraded', e => {
    towerRenderer.removeTower(e.towerId);
    towerRenderer.sync(state);
    updateHUD();
    if (inspectedTower && inspectedTower.id === e.towerId) {
        showTowerPanel(inspectedTower);
    }
    captureSafeCheckpoint();
});
bus.on('towerSold', e => {
    fxRenderer.addSellEffect(e.worldX, e.worldZ);

    state.floatingTexts.push({
        id: state.nextId++,
        worldX: e.worldX,
        worldZ: e.worldZ,
        value: `+${e.refund}g`,
        color: '#ffd700',
        life: 1.5,
        maxLife: 1.5,
    });
    towerRenderer.removeTower(e.towerId);
    towerRenderer.sync(state);
    updateHUD();
    if (inspectedTower && inspectedTower.id === e.towerId) {
        hideTowerPanel();
    }
    captureSafeCheckpoint();
});
bus.on('waveCleared', () => {
    // waveCleared is emitted immediately before the system advances into the
    // next prep phase. Wait for that clean boundary; never persist enemies or
    // projectiles midway through a path segment.
    queueMicrotask(captureSafeCheckpoint);
});
bus.on('enemyKilled', e => {
    const killedEnemy = state.enemies.find(enemy => enemy.id === e.enemyId);
    const deathColor = killedEnemy?.type === 'boss'
        ? 0xff9a4d
        : killedEnemy?.type === 'shield'
            ? 0x6cd3ff
            : killedEnemy?.type === 'healer'
                ? 0xff9bd0
                : 0xff8f59;
    fxRenderer.addDeathEffect(e.worldX, e.worldZ, deathColor);
    if (killedEnemy?.type === 'boss') camCtrl.shake(0.55);
});
bus.on('milestone', () => camCtrl.shake(0.35));
bus.on('streakBonus', ev => { if (ev.streak >= 10) camCtrl.shake(0.25); });

bus.on('towerFired', e => {
    fxRenderer.addMuzzleFlash(e.worldX, e.worldZ, e.towerType);
});
bus.on('aoeImpact', e => {
    fxRenderer.addImpactFlash(e.worldX, e.worldZ, e.radius, e.towerType);
});
// 每出一隻怪，道門就揈開一次兼閃一下——時機由事件推，唔係計時器夾。
bus.on('enemySpawned', () => {
    gateway.開門();
    fxRenderer.addBuildEffect(spawnWorld.x, spawnWorld.z);
});
bus.on('bossSpawned', () => {
    camCtrl.shake(0.6);
    showBossCinematic();
    audioSystem.playBossRoar();
});
bus.on('enemyReachedGoal', () => {
    camCtrl.shake(0.32);
    fxRenderer.addDeathEffect(goalWorld.x, goalWorld.z, 0xff5c4a);
    updateHUD();
});
bus.on('streakBonus', ev => {
    if (ev.streak >= 10) audioSystem.playMegaStingerHit();
    else audioSystem.playStreakStinger();
});
bus.on('gameOver', ev => {
    if (ev.won) audioSystem.playVictory();
    else audioSystem.playDefeat();
});

const goldEl = document.getElementById('gold-val')!;
const livesEl = document.getElementById('lives-val')!;
const waveEl = document.getElementById('wave-val')!;
const killsEl = document.getElementById('kills-val')!;
const hudWaveEl = document.getElementById('hud-wave')!;
const chapterActEl = document.getElementById('chapter-act')!;
const chapterNameEl = document.getElementById('chapter-name')!;
const waveRemainEl = document.getElementById('wave-remain')!;
const waveProgressFillEl = document.getElementById('wave-progress-fill') as HTMLDivElement;
const skipPrepBtn = document.getElementById('skip-prep-btn') as HTMLButtonElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const speedBtn = document.getElementById('speed-btn') as HTMLButtonElement;
const soundBtn = document.getElementById('sound-btn') as HTMLButtonElement;

// Enemy Panel UI
const enemyPanelUi = document.getElementById('enemy-panel')!;
const enemyNameUi = document.getElementById('enemy-name')!;
const enemyHpUi = document.getElementById('enemy-hp')!;
const enemySpdUi = document.getElementById('enemy-spd')!;
const enemyArmorUi = document.getElementById('enemy-armor')!;
const waveBanner = document.getElementById('wave-banner')!;
const waveBannerText = document.getElementById('wave-banner-text')!;

/*
 * 橫額擺喺 HUD 下面——「下面」係量返嚟嘅，唔係寫死嘅。
 *
 * 原本 CSS 寫 `top: 88px`，即係假設 HUD 永遠 74px 高。實測 HUD 高度係四個數：
 * 桌面 1280 闊 56px、iPhone SE 橫 110px、SE/12 直 164px（`flex-wrap` 摺行），
 * 而且 Skip 掣一出現又會再摺多一行。88 呢個數只喺其中一種情況啱。
 * 後果唔係「有少少疊」：pixel diff 量到收起橫額之後 gold/lives/wave 嗰三塊
 * 分別變咗 40–57% 嘅 pixel（同一場景嘅雜訊底只有 5–16%），即係備戰嗰九秒
 * ——你正正喺度揀緊買咩塔——你係睇唔到自己有幾多金。
 *
 * HUD 仲要係拖得郁嘅（makeDraggable），所以個錨唔可以淨係跟大細，要跟位置。
 * 呢度每次擺橫額出嚟都量一次 HUD 嘅實際 bottom，備戰嗰陣逐格量，
 * 拖完、摺完、轉屏都自動啱。
 */
const hudEl = document.getElementById('hud')!;
function 錨定橫額(): void {
    document.documentElement.style.setProperty('--hud-bottom', `${Math.round(hudEl.getBoundingClientRect().bottom)}px`);
}
const milestoneBanner = document.getElementById('milestone-banner')!;
const milestoneBannerText = document.getElementById('milestone-banner-text')!;
const bossCinematic = document.getElementById('boss-cinematic')!;
const nextWavePreview = document.getElementById('next-wave-preview')!;
const previewIconsEl = document.getElementById('preview-icons')!;
let lastPreviewWave = -2;

const waveModifierEl = document.getElementById('wave-modifier')!;
const modEmojiEl = document.getElementById('mod-emoji')!;
const modLabelEl = document.getElementById('mod-label')!;
const modDescEl = document.getElementById('mod-desc')!;
let lastModifierShown: string | null = '__init__';
function updateModifierBadge(): void {
    const key = state.waveModifier;
    if (key === lastModifierShown) return;
    lastModifierShown = key;
    if (!key || !MODIFIERS[key]) {
        waveModifierEl.classList.add('hidden');
        return;
    }
    const m = MODIFIERS[key];
    modEmojiEl.textContent = m.emoji;
    modLabelEl.textContent = m.label;
    modDescEl.textContent = m.desc;
    waveModifierEl.classList.remove('hidden');
    // Force animation restart
    waveModifierEl.style.animation = 'none';
    void waveModifierEl.offsetWidth;
    waveModifierEl.style.animation = '';
}

function updateNextWavePreview(): void {
    if (state.phase !== 'prep') {
        nextWavePreview.classList.add('hidden');
        lastPreviewWave = -2;
        return;
    }
    // During prep, the "upcoming" wave is state.currentWave (0-based) — that's the one being prepped
    const upcoming = WAVES.waves[state.currentWave];
    if (!upcoming) {
        nextWavePreview.classList.add('hidden');
        return;
    }
    if (lastPreviewWave === state.currentWave) return;
    lastPreviewWave = state.currentWave;

    // Aggregate groups by enemy type
    const counts: Record<string, number> = {};
    for (const g of upcoming.groups) {
        counts[g.type] = (counts[g.type] || 0) + g.count;
    }
    const chips = Object.entries(counts).map(([type, n]) => {
        const ico = ENEMY_EMOJI[type] || '❓';
        return `<span class="preview-chip"><span class="ico">${ico}</span><span class="cnt">×${n}</span></span>`;
    }).join('');
    previewIconsEl.innerHTML = chips;
    nextWavePreview.classList.remove('hidden');
}

bus.on('towerBuilt', () => audioSystem.playBuild());
bus.on('towerSold', () => audioSystem.playSell());
bus.on('enemyKilled', () => audioSystem.playHit());
const floatingTextLayer = document.getElementById('floating-text-layer')!;
const helpBtn = document.getElementById('help-btn')!;
const helpOverlay = document.getElementById('help-overlay')!;
const helpCloseBtn = document.getElementById('help-close-btn')!;
const startScreen = document.getElementById('start-screen')!;
const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
const endScreen = document.getElementById('end-screen')!;
const restartBtn = document.getElementById('restart-btn') as HTMLButtonElement;
const endTitle = document.getElementById('end-title')!;
const endScore = document.getElementById('end-score')!;
const endRank = document.getElementById('end-rank')!;
const towerPanel = document.getElementById('tower-panel')!;
const cancelBuildBtn = document.getElementById('cancel-build-btn')!;
const buildBtns = document.querySelectorAll('.build-btn[data-tower]');
const streakBanner = document.getElementById('streak-banner')!;
const pauseOverlay = document.getElementById('pause-overlay')!;
const pauseReasonEl = document.getElementById('pause-reason')!;
const resumeBtn = document.getElementById('resume-btn') as HTMLButtonElement;
const graphicsRecovery = document.getElementById('graphics-recovery')!;
const graphicsReloadBtn = document.getElementById('graphics-reload-btn') as HTMLButtonElement;
const graphicsHomeBtn = document.getElementById('graphics-home-btn') as HTMLButtonElement;
const continueRunEl = document.getElementById('continue-run')!;
const continueSummaryEl = document.getElementById('continue-summary')!;
const continueBtn = document.getElementById('continue-btn') as HTMLButtonElement;

const MODAL_IDS = [
    'graphics-recovery',
    'buff-modal',
    'achievements-modal',
    'help-overlay',
    'pause-overlay',
    'end-screen',
    'start-screen',
];
const modalOpeners = new Map<HTMLElement, HTMLElement | null>();

function visibleModal(): HTMLElement | null {
    for (const id of MODAL_IDS) {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains('hidden')) return modal;
    }
    return null;
}

function focusableWithin(modal: HTMLElement): HTMLElement[] {
    return Array.from(modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    )).filter((element) => !element.closest('.hidden') && getComputedStyle(element).display !== 'none');
}

function syncModalIsolation(focusTarget?: HTMLElement | null): void {
    const modal = visibleModal();
    for (const child of Array.from(document.body.children)) {
        if (!(child instanceof HTMLElement) || child.tagName === 'SCRIPT') continue;
        child.inert = !!modal && child !== modal;
    }
    for (const id of MODAL_IDS) {
        const element = document.getElementById(id);
        if (element) element.setAttribute('aria-hidden', String(element !== modal));
    }
    if (!modal) return;
    const target = focusTarget && modal.contains(focusTarget)
        ? focusTarget
        : focusableWithin(modal)[0];
    target?.focus({ preventScroll: true });
}

function openModal(modal: HTMLElement, opener: HTMLElement | null, focusTarget?: HTMLElement | null): void {
    modalOpeners.set(modal, opener);
    modal.classList.remove('hidden');
    syncModalIsolation(focusTarget);
}

function closeModal(modal: HTMLElement, restoreFocus = true): void {
    const opener = modalOpeners.get(modal) ?? null;
    modalOpeners.delete(modal);
    modal.classList.add('hidden');
    syncModalIsolation();
    if (restoreFocus && opener && !opener.inert && opener.offsetParent !== null) {
        opener.focus({ preventScroll: true });
    }
}

type PauseReason = 'manual' | 'background' | 'help' | 'buff' | 'graphics';
const pauseReasons = new Set<PauseReason>();

function syncPauseUi(focusResume = false): void {
    const active = state.phase === 'prep' || state.phase === 'wave';
    state.paused = active && pauseReasons.size > 0;
    pauseBtn.textContent = state.paused ? '▶' : '⏸';
    pauseBtn.classList.toggle('active', state.paused);
    pauseBtn.setAttribute('aria-label', state.paused ? 'Resume defense' : 'Pause defense');
    pauseBtn.title = state.paused ? 'Resume defense' : 'Pause defense';

    const showPauseOverlay = state.paused
        && (pauseReasons.has('manual') || pauseReasons.has('background'))
        && !pauseReasons.has('help')
        && !pauseReasons.has('buff')
        && !pauseReasons.has('graphics');
    pauseReasonEl.textContent = pauseReasons.has('background')
        ? 'Defense paused because this tab moved to the background. Resume when you are ready.'
        : 'Defense paused. Your current wave is safe.';
    pauseOverlay.classList.toggle('hidden', !showPauseOverlay);
    syncModalIsolation(showPauseOverlay && focusResume ? resumeBtn : undefined);
}

function pauseFor(reason: PauseReason, focusResume = false): void {
    pauseReasons.add(reason);
    syncPauseUi(focusResume);
}

function resumeDefense(): void {
    pauseReasons.delete('manual');
    pauseReasons.delete('background');
    syncPauseUi();
    if (!visibleModal()) pauseBtn.focus({ preventScroll: true });
}

function handleModalKeydown(event: KeyboardEvent): boolean {
    const modal = visibleModal();
    if (!modal) return false;

    if (event.key === 'Tab') {
        const focusable = focusableWithin(modal);
        if (!focusable.length) {
            event.preventDefault();
            return true;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!modal.contains(document.activeElement)) {
            event.preventDefault();
            first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
        return true;
    }

    if (event.key === 'Escape') {
        if (modal === helpOverlay) closeHelp();
        else if (modal.id === 'achievements-modal') closeAchievements();
        else if (modal === pauseOverlay) resumeDefense();
        event.preventDefault();
        return true;
    }

    if (modal === pauseOverlay && event.key.toLowerCase() === 'p') {
        resumeDefense();
        event.preventDefault();
        return true;
    }

    // Keep gameplay hotkeys (especially P/Q/W/E/1-7) behind every modal.
    return true;
}

const tooltip = document.getElementById('tower-tooltip')!;
const tooltipName = tooltip.querySelector('.tooltip-name')!;
const tooltipType = tooltip.querySelector('.tooltip-type')!;
const tooltipStats = tooltip.querySelector('.tooltip-stats')!;
const tooltipSpecial = tooltip.querySelector('.tooltip-special')!;

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
    if (state.endlessMode && state.currentWave >= TOTAL_WAVES) {
        waveEl.textContent = `${state.currentWave + 1} ♾`;
    } else {
        waveEl.textContent = `${Math.min(state.currentWave + 1, TOTAL_WAVES)}/${TOTAL_WAVES}`;
    }
    killsEl.textContent = String(state.totalKills);
    const displayWave = Math.max(1, state.currentWave + 1);
    const chapter = chapterForWave(displayWave);
    const chapterIndex = CAMPAIGN_CHAPTERS.findIndex((candidate) => candidate.id === chapter.id);
    chapterActEl.textContent = `ACT ${['I', 'II', 'III', 'IV', 'V'][chapterIndex] ?? chapterIndex + 1}`;
    chapterNameEl.textContent = chapter.title;
    hudWaveEl.style.setProperty('--chapter-accent', `#${chapter.accent.toString(16).padStart(6, '0')}`);
    hudWaveEl.title = `${chapter.subtitle} — ${chapter.tacticalFocus}`;

    // Wave progress bar
    const aliveInWave = state.enemies.filter(e => e.alive).length;
    const total = state.waveEnemiesTotal || 0;
    if (state.phase === 'prep') {
        hudWaveEl.classList.add('prep');
        const prepMax = WAVES.prepSec || 8;
        const prepPct = Math.max(0, Math.min(1, 1 - state.prepTimer / prepMax));
        waveRemainEl.textContent = `⏳ ${Math.max(0, Math.ceil(state.prepTimer))}s`;
        waveProgressFillEl.style.width = `${Math.round(prepPct * 100)}%`;
    } else if (state.phase === 'wave' && total > 0) {
        hudWaveEl.classList.remove('prep');
        const killedInWave = Math.max(0, state.waveEnemiesSpawned - aliveInWave);
        const pct = Math.max(0, Math.min(1, killedInWave / total));
        waveRemainEl.textContent = `${aliveInWave} / ${total}`;
        waveProgressFillEl.style.width = `${Math.round(pct * 100)}%`;
    } else {
        hudWaveEl.classList.remove('prep');
        waveRemainEl.textContent = '—';
        waveProgressFillEl.style.width = '0%';
    }

    // Skip prep button visibility
    skipPrepBtn.classList.toggle('hidden', state.phase !== 'prep');

    // Next wave preview (prep only)
    updateNextWavePreview();

    // Wave modifier badge
    updateModifierBadge();

    // Update build button affordance
    buildBtns.forEach(btn => {
        const type = btn.getAttribute('data-tower') as TowerType;
        const cost = TOWERS[type].levels[0].buildCost;
        const canAfford = state.gold >= cost;
        btn.classList.toggle('disabled', !canAfford);
    });

    // Enemy Hover Logic
    let closestEnemy: Enemy | null = null;
    if (picking.hoveredCol >= 0 && state.phase === 'wave') {
        const hoverWorld = cellToWorld(picking.hoveredCol, picking.hoveredRow);
        let minDistSq = 1.0;
        for (const e of state.enemies) {
            if (!e.alive) continue;
            const dx = e.worldX - hoverWorld.x;
            const dz = e.worldZ - hoverWorld.z;
            const dSq = dx * dx + dz * dz;
            if (dSq < minDistSq) {
                minDistSq = dSq;
                closestEnemy = e;
            }
        }
    }

    if (closestEnemy) {
        const cfg = ENEMIES[closestEnemy.type];
        enemyNameUi.textContent = cfg.name;
        enemyHpUi.textContent = `${Math.ceil(closestEnemy.hp)}/${cfg.hp}`;
        enemySpdUi.textContent = cfg.speed.toFixed(1);
        enemyArmorUi.textContent = String(cfg.armor);
        enemyPanelUi.classList.remove('hidden');
    } else {
        enemyPanelUi.classList.add('hidden');
    }
}

// ─── Wave Banner ───
let bannerTimeout: number | null = null;
function chapterOpeningLabel(wave: number): { text: string; accent: string } | null {
    if (!isChapterOpening(wave)) return null;
    const chapter = chapterForWave(wave);
    const chapterIndex = CAMPAIGN_CHAPTERS.findIndex((candidate) => candidate.id === chapter.id);
    return {
        text: `ACT ${['I', 'II', 'III', 'IV', 'V'][chapterIndex] ?? chapterIndex + 1} · ${chapter.title}\n${chapter.subtitle}`,
        accent: `#${chapter.accent.toString(16).padStart(6, '0')}`,
    };
}

function showWaveBanner(text: string): void {
    const wave = Math.max(1, state.currentWave + 1);
    const opening = chapterOpeningLabel(wave);
    waveBanner.classList.toggle('chapter-opening', !!opening);
    if (opening) waveBanner.style.setProperty('--chapter-accent', opening.accent);
    waveBannerText.textContent = opening?.text ?? text;
    錨定橫額();
    waveBanner.classList.remove('hidden');
    // Force animation restart on re-show
    waveBannerText.style.animation = 'none';
    void waveBannerText.offsetWidth;
    waveBannerText.style.animation = '';
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

// ─── Boss Cinematic ───
let bossCinematicTimeout: number | null = null;
function showBossCinematic(): void {
    if (bossCinematicTimeout) clearTimeout(bossCinematicTimeout);
    bossCinematic.classList.remove('hidden');
    // Force animation restart
    bossCinematic.style.animation = 'none';
    void bossCinematic.offsetWidth;
    bossCinematic.style.animation = '';
    bossCinematicTimeout = window.setTimeout(() => {
        bossCinematic.classList.add('hidden');
        bossCinematicTimeout = null;
    }, 2400);
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

// ─── E17: Achievement Toasts ───
const achToastsEl = document.getElementById('achievement-toasts')!;
function spawnAchievementToast(a: Achievement): void {
    const el = document.createElement('div');
    el.className = 'ach-toast';
    el.innerHTML =
        `<div class="ach-emoji">${a.emoji}</div>` +
        `<div class="ach-body">` +
        `<div class="ach-kicker">Achievement Unlocked</div>` +
        `<div class="ach-name">${a.name}</div>` +
        `<div class="ach-desc">${a.desc}</div>` +
        `</div>`;
    achToastsEl.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 4400);
}

function checkAchievements(event: string, payload: Record<string, unknown>): void {
    const ctx = { event, payload };
    for (const a of ACHIEVEMENTS) {
        if (persisted.achievements.includes(a.id)) continue;
        try {
            if (a.check(state, ctx)) {
                if (unlockAchievement(persisted, a.id)) {
                    spawnAchievementToast(a);
                }
            }
        } catch {
            // defensive — skip bad check
        }
    }
}

bus.on('enemyKilled', e => checkAchievements('enemyKilled', { enemyId: e.enemyId, bounty: e.bounty }));
bus.on('streakBonus', e => checkAchievements('streakBonus', { streak: e.streak }));
bus.on('waveCleared', e => checkAchievements('waveCleared', { wave: e.wave, perfect: e.perfect }));
bus.on('milestone', e => checkAchievements('milestone', { wave: e.wave }));
bus.on('gameOver', e => checkAchievements('gameOver', { won: e.won, score: e.score }));

// ─── E16: High Score display on start screen ───
const hsScoreEl = document.getElementById('hs-score')!;
const hsSubEl = document.getElementById('hs-sub')!;
function refreshHighScoreDisplay(): void {
    const rec = persisted.highScores[currentDifficulty];
    if (rec) {
        hsScoreEl.textContent = String(rec.score);
        hsSubEl.textContent = `Wave ${rec.wave} · ${rec.rank} · ${currentDifficulty}`;
    } else {
        hsScoreEl.textContent = '—';
        hsSubEl.textContent = `No record on ${currentDifficulty}`;
    }
    refreshLifetimeDisplay();
}

const ltRunsEl = document.getElementById('lt-runs')!;
const ltKillsEl = document.getElementById('lt-kills')!;
const ltBestWaveEl = document.getElementById('lt-best-wave')!;
function refreshLifetimeDisplay(): void {
    ltRunsEl.textContent = String(persisted.lifetime.runs);
    ltKillsEl.textContent = String(persisted.lifetime.totalKills);
    ltBestWaveEl.textContent = String(persisted.lifetime.highestWaveReached);
}

// ─── C10: Milestone Buff Choice Modal ───
interface BuffCard {
    id: string;
    emoji: string;
    name: string;
    desc: string;
    apply: () => void;
}
const BUFF_POOL: BuffCard[] = [
    {
        id: 'damage',
        emoji: '🗡',
        name: 'Overcharge',
        desc: '+20% tower damage (stacks)',
        apply: () => { state.buffDamageMult *= 1.20; },
    },
    {
        id: 'range',
        emoji: '🎯',
        name: 'Long Sight',
        desc: '+15% tower range (stacks)',
        apply: () => { state.buffRangeMult *= 1.15; },
    },
    {
        id: 'gold',
        emoji: '💰',
        name: 'Gold Rush',
        desc: '+25% gold from kills (stacks)',
        apply: () => { state.buffGoldMult *= 1.25; },
    },
    {
        id: 'fortify',
        emoji: '❤',
        name: 'Fortify',
        desc: '+5 lives and +5 max lives',
        apply: () => {
            state.maxLives += 5;
            state.lives = Math.min(state.maxLives, state.lives + 5);
        },
    },
    {
        id: 'bounty',
        emoji: '🏦',
        name: 'War Chest',
        desc: 'Instant +300 gold',
        apply: () => {
            state.gold += 300;
            state.stats.goldEarned += 300;
        },
    },
];
const buffModal = document.getElementById('buff-modal')!;
const buffCardsEl = document.getElementById('buff-cards')!;
const buffWaveEl = document.getElementById('buff-wave')!;

function pickThreeBuffs(wave: number): BuffCard[] {
    // Milestone choices are gameplay state. A camera shake or particle emitted
    // on a slower phone must never change which three cards the player sees.
    // Assault milestones offer damage/range; the mid-campaign recovery stop
    // offers range/fortify. A third economy/survival card rotates each time.
    const plan = milestonePlan(wave);
    const core = plan.coreIds.map((id) => BUFF_POOL.find((card) => card.id === id)!).filter(Boolean);
    const wildcards = plan.wildcardIds.map((id) => BUFF_POOL.find((card) => card.id === id)!).filter(Boolean);
    return milestoneOffer(core, wildcards, wave);
}

function openBuffModal(wave: number): void {
    if (state.buffChoicePending) return;
    state.buffChoicePending = true;
    pauseFor('buff');
    buffWaveEl.textContent = String(wave);

    const cards = pickThreeBuffs(wave);
    buffCardsEl.innerHTML = '';
    for (const c of cards) {
        const el = document.createElement('button');
        el.className = 'buff-card';
        el.innerHTML =
            `<span class="card-emoji">${c.emoji}</span>` +
            `<span class="card-name">${c.name}</span>` +
            `<span class="card-desc">${c.desc}</span>`;
        el.addEventListener('click', () => {
            c.apply();
            state.floatingTexts.push({
                id: state.nextId++,
                worldX: 0,
                worldZ: 0,
                value: `${c.emoji} ${c.name}`,
                color: '#ffd486',
                life: 2.5,
                maxLife: 2.5,
            });
            closeBuffModal();
        });
        buffCardsEl.appendChild(el);
    }
    openModal(buffModal, null, buffCardsEl.querySelector<HTMLElement>('button'));
}

function closeBuffModal(): void {
    closeModal(buffModal, false);
    state.buffChoicePending = false;
    pauseReasons.delete('buff');
    syncPauseUi();
    saveRunCheckpoint(state);
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
    specials.push(`🗡 ${tower.kills}`);
    specialEl.textContent = specials.join(' | ');

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
    const evolveContainer = document.getElementById('evolve-container')!;
    const sellBtn = document.getElementById('sell-btn')!;
    const levels = towerCfg.levels;

    // Reset evolution UI
    evolveContainer.classList.add('hidden');
    evolveContainer.innerHTML = '';
    upgradeBtn.style.display = 'block';

    if (tower.level >= levels.length - 1) {
        if (towerCfg.evolutions && towerCfg.evolutions.length > 0) {
            upgradeBtn.style.display = 'none';
            evolveContainer.classList.remove('hidden');
            
            for (const evo of towerCfg.evolutions) {
                const btn = document.createElement('button');
                btn.className = 'action-btn evolve';
                btn.innerHTML = `⭐ ${evo.name} (<span class="evolve-cost">${evo.cost}</span>g)<div style="font-size: 0.8em; margin-top: 2px;">${evo.desc}</div>`;
                btn.disabled = state.gold < evo.cost;
                btn.onclick = () => {
                    if (inspectedTower) evolveTower(state, inspectedTower.id, evo.type);
                };
                evolveContainer.appendChild(btn);
            }
        } else {
            upgradeBtn.disabled = true;
            upgradeBtn.textContent = '⬆ MAX';
        }
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
const endBestBadge = document.getElementById('end-best-badge')!;
function showEndScreen(): void {
    const won = state.phase === 'won';
    clearRunCheckpoint();
    availableCheckpoint = null;
    refreshContinueCard();
    pauseReasons.clear();
    syncPauseUi();
    endTitle.textContent = won ? '🎉 Victory!' : '💀 Defeat';
    endTitle.style.color = won ? '#ffd700' : '#ff5555';
    endScore.textContent = `Score: ${state.score}`;

    let rank = 'C';
    for (const r of SCORING.ranks) {
        if (state.score >= r.min) { rank = r.name; break; }
    }
    endRank.textContent = rank;
    endRank.className = `rank rank-${rank}`;

    // E16 — record high score + show NEW BEST badge if beaten
    const wavesReached = state.endlessMode
        ? state.currentWave + 1
        : Math.min(state.currentWave + 1, WAVES.waves.length);
    const isNewBest = recordHighScore(
        persisted,
        state.difficulty,
        state.score,
        wavesReached,
        rank,
    );
    endBestBadge.classList.toggle('hidden', !isNewBest);

    // Lifetime stats
    recordRunComplete(
        persisted,
        won,
        state.totalKills,
        state.currentWave,            // 0-based currentWave == waves fully cleared
        state.stats.towersBuilt,
        wavesReached,
    );
    refreshHighScoreDisplay();

    // Populate stats
    document.getElementById('stat-kills')!.textContent = state.totalKills.toString();
    document.getElementById('stat-streak')!.textContent = state.stats.longestStreak.toString();
    document.getElementById('stat-perfect')!.textContent = state.perfectWaves.toString();
    document.getElementById('stat-built')!.textContent = state.stats.towersBuilt.toString();
    document.getElementById('stat-gold')!.textContent = state.stats.goldEarned.toString();
    document.getElementById('stat-dmg')!.textContent = Math.round(state.stats.totalDamageDealt).toString();

    openModal(endScreen, null, restartBtn);
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

    btn.addEventListener('mouseenter', () => {
        const type = btn.getAttribute('data-tower') as TowerType;
        if (!type || !TOWERS[type]) return;
        
        const towerCfg = TOWERS[type];
        const lvlCfg = towerCfg.levels[0];
        
        tooltipName.textContent = towerCfg.name + ' Tower';
        tooltipType.textContent = 'Type: ' + towerCfg.damageType;
        
        tooltipStats.innerHTML = `
            <div><span>Damage:</span> <span>${lvlCfg.damage}</span></div>
            <div><span>Speed:</span> <span>${lvlCfg.cooldownSec}s</span></div>
            <div><span>Range:</span> <span>${lvlCfg.range}</span></div>
            <div><span>DPS:</span> <span>${(lvlCfg.damage / lvlCfg.cooldownSec).toFixed(1)}</span></div>
        `;
        
        let special = '';
        if (lvlCfg.slow) special = `Slows by ${Math.round(lvlCfg.slow.pct * 100)}% for ${lvlCfg.slow.durationSec}s`;
        else if (lvlCfg.dot) special = `DOT: ${lvlCfg.dot.dps} dmg/s (${lvlCfg.dot.durationSec}s)`;
        else if (lvlCfg.chain) special = `Chains to ${lvlCfg.chain.targets} targets`;
        else if (lvlCfg.aoeRadius > 0) special = `AOE Radius: ${lvlCfg.aoeRadius}`;
        
        tooltipSpecial.textContent = special;
        
        // Position tooltip above the button
        const rect = btn.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translate(-50%, calc(-100% - 10px))';
        tooltip.style.top = `${rect.top}px`;
        tooltip.classList.remove('hidden');
    });

    btn.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
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
    state.speedMultiplier = state.speedMultiplier === 1 ? 2 : state.speedMultiplier === 2 ? 4 : 1;
    speedBtn.textContent = state.speedMultiplier + '×';
    persisted.prefs.speedMultiplier = state.speedMultiplier;
    savePersisted(persisted);
});

soundBtn.addEventListener('click', () => {
    audioSystem.init();
    const isEnabled = audioSystem.toggle();
    soundBtn.textContent = isEnabled ? '🔊' : '🔇';
    soundBtn.style.opacity = isEnabled ? '1' : '0.5';
    persisted.prefs.soundEnabled = isEnabled;
    savePersisted(persisted);
});

// Pause toggle
pauseBtn.addEventListener('click', togglePause);

function togglePause(): void {
    if (state.phase !== 'wave' && state.phase !== 'prep') return;
    if (pauseReasons.has('manual') || pauseReasons.has('background')) {
        resumeDefense();
    } else {
        pauseFor('manual', true);
    }
}

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    if (handleModalKeydown(e)) return;

    // Ignore if game is inactive
    if (state.phase === 'idle' || state.phase === 'won' || state.phase === 'lost') return;

    const key = e.key.toLowerCase();

    // P - Pause
    if (key === 'p') {
        if (state.phase === 'wave' || state.phase === 'prep') togglePause();
        return;
    }
    
    // 1-7: Fast select tower to build
    if (key >= '1' && key <= '7') {
        const idx = Number(key) - 1;
        if (idx >= 0 && idx < buildBtns.length) {
            (buildBtns[idx] as HTMLButtonElement).click();
        }
    }

    // U: Upgrade inspected tower
    if (key === 'u' && inspectedTower) {
        document.getElementById('upgrade-btn')!.click();
    }

    // S: Sell inspected tower
    if (key === 's' && inspectedTower) {
        document.getElementById('sell-btn')!.click();
    }

    // M - Keys Q W E for skills
    if (key === 'q') useSkill(0);
    if (key === 'w') useSkill(1);
    if (key === 'e') useSkill(2);

    // Escape: Cancel build or close panel
    if (e.key === 'Escape') {
        if (selectedTowerType) {
            cancelBuildBtn.click();
        } else if (inspectedTower) {
            document.getElementById('panel-close-btn')!.click();
        }
    }
});

// ─── Skills ───
const skillBtns = document.querySelectorAll('.skill-btn');
skillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-skill') || '0', 10);
        useSkill(idx);
    });
});

function useSkill(idx: number) {
    if (state.phase !== 'wave' && state.phase !== 'prep') return;
    const skill = state.skills[idx];
    if (!skill || skill.remaining > 0) return;
    const hasLiveTarget = state.enemies.some((enemy) => enemy.alive && !enemy.reached);
    if ((idx === 0 || idx === 1) && !hasLiveTarget) return;
    if (idx === 2 && state.lives >= state.maxLives) return;

    if (idx === 0) {
        // Airstrike
        for (const enemy of state.enemies) {
            if (enemy.alive && !enemy.reached) applyHit(state, enemy, 200, 'ability');
        }
    } else if (idx === 1) {
        // Freeze
        for (const enemy of state.enemies) {
            if (enemy.alive) {
                enemy.slow = { pct: 1.0, remaining: 5.0 };
            }
        }
    } else if (idx === 2) {
        // Repair
        state.lives = Math.min(state.maxLives, state.lives + 5);
        updateHUD();
    }

    skill.remaining = skill.cooldown;
    bus.emit({ type: 'skillUsed', skill: skill.name });
    updateSkillsHUD();
}

function updateSkillsHUD() {
    skillBtns.forEach(btn => {
        const idx = parseInt(btn.getAttribute('data-skill') || '0', 10);
        const skill = state.skills[idx];
        const cdSpan = btn.querySelector('.skill-cd') as HTMLElement;
        if (skill && skill.remaining > 0) {
            btn.classList.add('on-cooldown');
            cdSpan.classList.remove('hidden');
            cdSpan.textContent = Math.ceil(skill.remaining) + 's';
        } else {
            btn.classList.remove('on-cooldown');
            cdSpan.classList.add('hidden');
        }
    });
}

// Skip Prep
skipPrepBtn.addEventListener('click', () => {
    if (state.phase !== 'prep') return;
    // Give Gold bonus for skipping prep
    state.gold += 50;
    state.stats.goldEarned += 50;
    state.floatingTexts.push({
        id: state.nextId++,
        worldX: 0,
        worldZ: 0,
        value: '⏩ +50g Skip',
        color: '#aaff55',
        life: 1.6,
        maxLife: 1.6,
    });
    state.prepTimer = 0;
    skipPrepBtn.classList.add('hidden');
    updateHUD();
});

// Tower panel buttons
document.getElementById('upgrade-btn')!.addEventListener('click', () => {
    if (!inspectedTower) return;
    upgradeTower(state, inspectedTower.id);
});

document.getElementById('sell-btn')!.addEventListener('click', () => {
    if (!inspectedTower) return;
    sellTower(state, inspectedTower.id);
});

document.getElementById('panel-close-btn')!.addEventListener('click', () => {
    hideTowerPanel();
});

function refreshContinueCard(): void {
    continueRunEl.classList.toggle('hidden', !availableCheckpoint);
    if (!availableCheckpoint) {
        continueSummaryEl.textContent = '';
        return;
    }
    const difficulty = availableCheckpoint.difficulty[0].toUpperCase()
        + availableCheckpoint.difficulty.slice(1);
    continueSummaryEl.textContent = `Wave ${availableCheckpoint.currentWave + 1} · ${difficulty} · ${availableCheckpoint.gold}g · ${availableCheckpoint.towers.length} towers`;
}

async function enterRun(nextState: GameState, checkpoint: RunCheckpoint | null): Promise<void> {
    await 地面好;
    startScreen.classList.add('hidden');
    state = nextState;
    currentDifficulty = state.difficulty;
    resetRunLocals();
    audioSystem.init();
    audioSystem.startMusic();
    startNextWave(state);
    if (checkpoint) state.waveModifier = checkpoint.waveModifier;
    towerRenderer.sync(state);
    updateHUD();
    updateSkillsHUD();
    saveRunCheckpoint(state);
    availableCheckpoint = loadRunCheckpoint();
    showWaveBanner(`Wave ${state.currentWave + 1}`);
    syncModalIsolation();
}

// Start a new defense, intentionally replacing any older checkpoint.
startBtn.addEventListener('click', async () => {
    clearRunCheckpoint();
    const fresh = createInitialState(currentDifficulty);
    fresh.speedMultiplier = persisted.prefs.speedMultiplier;
    fresh.endlessMode = persisted.prefs.endlessMode;
    await enterRun(fresh, null);
});

continueBtn.addEventListener('click', async () => {
    const checkpoint = availableCheckpoint;
    if (!checkpoint) return;
    const restored = restoreRunCheckpoint(checkpoint, persisted.prefs.speedMultiplier);
    await enterRun(restored, checkpoint);
});

// Difficulty Selector
const diffBtns = document.querySelectorAll('.diff-btn');
const diffDesc = document.getElementById('diff-desc')!;
const diffNames: Record<string, string> = {
    easy: 'Easy difficulty — 600g, 30 lives, 25% weaker enemies',
    normal: 'Standard difficulty — 400g, 20 lives',
    hard: 'Hard difficulty — 250g, 10 lives, 40% tougher enemies & slightly faster'
};

diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.getAttribute('data-diff') as Difficulty;
        diffDesc.textContent = diffNames[currentDifficulty];
        persisted.prefs.difficulty = currentDifficulty;
        savePersisted(persisted);

        // Re-init state to apply gold/lives BEFORE starting
        state = createInitialState(currentDifficulty);
        state.speedMultiplier = persisted.prefs.speedMultiplier;
        updateHUD();
        refreshHighScoreDisplay();
    });
});

// G24 — Endless toggle
const endlessCheckbox = document.getElementById('endless-toggle') as HTMLInputElement;
endlessCheckbox.addEventListener('change', () => {
    persisted.prefs.endlessMode = endlessCheckbox.checked;
    savePersisted(persisted);
});

// F21 — Apply persisted prefs to UI after handlers are wired
(function applyPersistedUI(): void {
    diffBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-diff') === currentDifficulty);
    });
    diffDesc.textContent = diffNames[currentDifficulty];
    speedBtn.textContent = state.speedMultiplier + '×';
    if (!persisted.prefs.soundEnabled) {
        // audioSystem defaults to enabled=true; toggle once off (no AudioContext created yet)
        audioSystem.toggle();
        soundBtn.textContent = '🔇';
        soundBtn.style.opacity = '0.5';
    }
    endlessCheckbox.checked = persisted.prefs.endlessMode;
    refreshHighScoreDisplay();
    refreshContinueCard();
})();

// ─── E17: Achievements Viewer ───
const achModal = document.getElementById('achievements-modal')!;
const achGridEl = document.getElementById('ach-grid')!;
const achCountEl = document.getElementById('ach-count')!;
function renderAchievementGrid(): void {
    achGridEl.innerHTML = '';
    let unlocked = 0;
    for (const a of ACHIEVEMENTS) {
        const isUnlocked = persisted.achievements.includes(a.id);
        if (isUnlocked) unlocked++;
        const row = document.createElement('div');
        row.className = `ach-row ${isUnlocked ? 'unlocked' : 'locked'}`;
        row.innerHTML =
            `<div class="row-emoji">${isUnlocked ? a.emoji : '🔒'}</div>` +
            `<div class="row-body">` +
            `<div class="row-name">${a.name}</div>` +
            `<div class="row-desc">${a.desc}</div>` +
            `</div>`;
        achGridEl.appendChild(row);
    }
    achCountEl.textContent = `${unlocked}/${ACHIEVEMENTS.length}`;
}
document.getElementById('achievements-btn')!.addEventListener('click', () => {
    renderAchievementGrid();
    openModal(achModal, document.getElementById('achievements-btn'), document.getElementById('ach-close-btn'));
});
function closeAchievements(): void {
    closeModal(achModal);
}
document.getElementById('ach-close-btn')!.addEventListener('click', closeAchievements);
achModal.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).classList.contains('ach-backdrop')) {
        closeAchievements();
    }
});

const achResetBtn = document.getElementById('ach-reset-btn')! as HTMLButtonElement;
let resetArmed = false;
let resetArmTimeout: number | null = null;
achResetBtn.addEventListener('click', () => {
    if (!resetArmed) {
        resetArmed = true;
        achResetBtn.classList.add('confirming');
        achResetBtn.textContent = '⚠ Click again to confirm reset';
        if (resetArmTimeout) clearTimeout(resetArmTimeout);
        resetArmTimeout = window.setTimeout(() => {
            resetArmed = false;
            achResetBtn.classList.remove('confirming');
            achResetBtn.textContent = '⟲ Reset Progress';
        }, 4000);
        return;
    }
    resetProgress(persisted);
    resetArmed = false;
    if (resetArmTimeout) { clearTimeout(resetArmTimeout); resetArmTimeout = null; }
    achResetBtn.classList.remove('confirming');
    achResetBtn.textContent = '✓ Reset';
    setTimeout(() => { achResetBtn.textContent = '⟲ Reset Progress'; }, 1400);
    renderAchievementGrid();
    refreshHighScoreDisplay();
});

// ─── Draggable floating panels — long-press to pick up, release to place ───
makeDraggable(document.getElementById('hud'), 'hud');
makeDraggable(document.getElementById('skill-bar'), 'skillBar');
makeDraggable(document.getElementById('build-menu'), 'buildMenu');
makeDraggable(document.getElementById('next-wave-preview'), 'nextWavePreview');
makeDraggable(document.getElementById('tower-panel'), 'towerPanel');
makeDraggable(document.getElementById('enemy-panel'), 'enemyPanel');
makeDraggable(document.getElementById('wave-modifier'), 'waveModifier');

document.getElementById('reset-layout-btn')!.addEventListener('click', () => {
    resetUiLayout();
    state.floatingTexts.push({
        id: state.nextId++,
        worldX: 0,
        worldZ: 0,
        value: '🔁 介面位置已重設',
        color: '#9be8ff',
        life: 1.6,
        maxLife: 1.6,
    });
});

// Help overlay
helpBtn.addEventListener('click', () => {
    if (!helpOverlay.classList.contains('hidden')) return;
    openModal(helpOverlay, helpBtn, helpCloseBtn);
    pauseFor('help');
});
function closeHelp(): void {
    const shouldRestoreHelpFocus = !pauseReasons.has('background') && !pauseReasons.has('manual');
    pauseReasons.delete('help');
    closeModal(helpOverlay, shouldRestoreHelpFocus);
    syncPauseUi(pauseReasons.has('background') || pauseReasons.has('manual'));
}
helpCloseBtn.addEventListener('click', closeHelp);
helpOverlay.addEventListener('click', (e) => {
    if (e.target === helpOverlay) closeHelp();
});

// Restart
restartBtn.addEventListener('click', () => {
    closeModal(endScreen, false);
    state = createInitialState(currentDifficulty);
    state.speedMultiplier = persisted.prefs.speedMultiplier;
    state.endlessMode = persisted.prefs.endlessMode;
    resetRunLocals();
    towerRenderer.sync(state);
    updateHUD();
    updateSkillsHUD();
    hideTowerPanel();
    startNextWave(state);
    saveRunCheckpoint(state);
    availableCheckpoint = loadRunCheckpoint();
    showWaveBanner('Wave 1');
    syncModalIsolation();
});

// Home
document.getElementById('home-btn')!.addEventListener('click', () => {
    window.location.href = '../../../index.html';
});

// Canvas click (place tower or inspect) — guard against two-finger gestures.
// A mobile tap does not necessarily emit touchmove, so resolve the tapped cell
// from this click instead of reusing a stale hover from an earlier gesture.
canvas.addEventListener('click', (e) => {
    if (camCtrl.twoFingerActive) return;
    if (state.phase === 'idle' || state.phase === 'won' || state.phase === 'lost') return;

    picking.updateMouse(e, camera);
    const col = picking.hoveredCol;
    const row = picking.hoveredRow;
    if (col < 0 || row < 0) return;

    // An existing tower always wins: build mode stays active after placing one tower
    // (so you can place several in a row), but clicking a tower you already own must
    // still open its panel instead of silently trying to build on top of it.
    const tower = state.towers.find(t => t.col === col && t.row === row);
    if (tower) {
        showTowerPanel(tower);
    } else if (selectedTowerType) {
        buildTower(state, selectedTowerType, col, row);
    } else {
        hideTowerPanel();
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

function pauseForInterruption(): void {
    if (state.phase !== 'prep' && state.phase !== 'wave') return;
    captureSafeCheckpoint();
    pauseFor('background', true);
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseForInterruption();
    // Foregrounding is intentionally not an auto-resume. A long 99-wave run
    // should only move again after the player explicitly confirms readiness.
});
window.addEventListener('blur', pauseForInterruption);

canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    captureSafeCheckpoint();
    pauseFor('graphics');
    openModal(graphicsRecovery, null, graphicsReloadBtn);
});
canvas.addEventListener('webglcontextrestored', () => {
    closeModal(graphicsRecovery, false);
    pauseReasons.delete('graphics');
    pauseReasons.add('manual');
    syncPauseUi(true);
});
graphicsReloadBtn.addEventListener('click', () => window.location.reload());
graphicsHomeBtn.addEventListener('click', () => { window.location.href = '../../../index.html'; });
resumeBtn.addEventListener('click', resumeDefense);

// The visible opening screen is modal from the first keyboard interaction.
syncModalIsolation(startBtn);

// ─── Game Loop ───
let lastTime = 0;
let accumulator = 0;
let lastWave = -1;
let lastMusicPhase: 'prep' | 'wave' | 'off' | null = null;
let hudFrameTick = 0;

/** Reset module-level run state so restart/new-run starts clean. */
function resetRunLocals(): void {
    accumulator = 0;
    lastWave = -1;
    lastAtmosphereWave = -1;
    lastPreviewWave = -2;
    lastModifierShown = '__init__';
    lastMusicPhase = null;
    pauseReasons.clear();
    state.paused = false;
    selectedTowerType = null;
    buildBtns.forEach((button) => button.classList.remove('selected'));
    cancelBuildBtn.style.display = 'none';
    picking.hideGhost();
    hideTowerPanel();
    enemyPanelUi.classList.add('hidden');
    tooltip.classList.add('hidden');
    for (const element of activeFloatEls.values()) element.remove();
    activeFloatEls.clear();
    floatingTextLayer.replaceChildren();
    document.getElementById('achievement-toasts')?.replaceChildren();
    helpOverlay.classList.add('hidden');
    achModal.classList.add('hidden');
    buffModal.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    graphicsRecovery.classList.add('hidden');
    modalOpeners.clear();
    if (bannerTimeout) { clearTimeout(bannerTimeout); bannerTimeout = null; }
    if (streakBannerTimeout) { clearTimeout(streakBannerTimeout); streakBannerTimeout = null; }
    if (milestoneTimeout) { clearTimeout(milestoneTimeout); milestoneTimeout = null; }
    if (bossCinematicTimeout) { clearTimeout(bossCinematicTimeout); bossCinematicTimeout = null; }
    waveBanner.classList.add('hidden');
    streakBanner.classList.add('hidden');
    milestoneBanner.classList.add('hidden');
    bossCinematic.classList.add('hidden');
    syncPauseUi();
}

type ProjectileSnapshot = Pick<Projectile, 'id' | 'targetX' | 'targetZ' | 'towerType'>;

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
    const elapsedSec = time * 0.001;

    if (state.phase === 'idle') {
        lightingRig.update(elapsedSec);
    gateway.update(rawDt, state.lives, state.maxLives, camera);
        renderScene();
        return;
    }

    if (state.phase === 'won' || state.phase === 'lost') {
        if (endScreen.classList.contains('hidden')) {
            showEndScreen();
        }
        if (lastMusicPhase !== 'off') {
            audioSystem.setMusicPhase('off');
            lastMusicPhase = 'off';
        }
        lightingRig.update(elapsedSec);
    gateway.update(rawDt, state.lives, state.maxLives, camera);
        renderScene();
        return;
    }

    // Pause gate
    if (state.paused) {
        lightingRig.update(elapsedSec);
    gateway.update(rawDt, state.lives, state.maxLives, camera);
        renderScene();
        return;
    }

    const dt = rawDt * state.speedMultiplier;
    accumulator += dt;
    // Cap accumulator to prevent spiral-of-death on lag spikes
    const MAX_STEPS = 5;
    if (accumulator > LOGIC_DT * MAX_STEPS) accumulator = LOGIC_DT * MAX_STEPS;

    const projectileSnapshot = new Map<number, ProjectileSnapshot>();
    for (const projectile of state.projectiles) {
        projectileSnapshot.set(projectile.id, {
            id: projectile.id,
            targetX: projectile.targetX,
            targetZ: projectile.targetZ,
            towerType: projectile.towerType,
        });
    }

    // Fixed-step logic
    while (accumulator >= LOGIC_DT) {
        tickWave(state, LOGIC_DT);
        tickEnemies(state, LOGIC_DT);
        tickTowers(state, LOGIC_DT);
        tickCombat(state, LOGIC_DT);

        accumulator -= LOGIC_DT;

        // Check game over conditions
        const phase = state.phase as string;
        if (phase === 'won' || phase === 'lost') {
            showEndScreen();
            break;
        }
    }

    // Skill cooldowns tick in real (variable) time — fixed step loop ticks game systems only.
    // Use rawDt, not the speed-scaled dt: 4x game speed must not quarter the cooldowns.
    if (state.phase === 'wave' || state.phase === 'prep') {
        for (const skill of state.skills) {
            if (skill.remaining > 0) {
                skill.remaining = Math.max(0, skill.remaining - rawDt);
            }
        }
        updateSkillsHUD();
    }

    // D13 — Music phase crossfade based on game phase
    if (state.phase === 'prep' && lastMusicPhase !== 'prep') {
        audioSystem.setMusicPhase('prep');
        lastMusicPhase = 'prep';
    } else if (state.phase === 'wave' && lastMusicPhase !== 'wave') {
        audioSystem.setMusicPhase('wave');
        lastMusicPhase = 'wave';
    }

    // Wave banner
    if (state.currentWave !== lastWave && state.phase === 'wave') {
        lastWave = state.currentWave;
        showWaveBanner(`Wave ${state.currentWave + 1}`);
    }

    // Prep countdown banner — the wave being prepped IS state.currentWave
    // (startNextWave sets spawns from templateIndex(state)), not currentWave+1
    if (state.phase === 'prep') {
        const secs = Math.ceil(state.prepTimer);
        const waveGroup = WAVES.waves[templateIndex(state)];
        const totalEnemies = waveGroup?.groups?.reduce((s: number, g: { count: number }) => s + g.count, 0) ?? '?';
        // E — Enemy type emoji preview
        const enemyPreview = waveGroup?.groups?.map((g: { type: string; count: number }) =>
            `${ENEMY_EMOJI[g.type] ?? '?'}×${g.count}`
        ).join(' ') ?? '';
        const waveNumber = state.currentWave + 1;
        const prepText = `Wave ${waveNumber} — ${totalEnemies} enemies | ${enemyPreview} | Next in ${secs}s`;
        const opening = chapterOpeningLabel(waveNumber);
        waveBanner.classList.toggle('chapter-opening', !!opening);
        if (opening) waveBanner.style.setProperty('--chapter-accent', opening.accent);
        waveBannerText.textContent = opening ? `${opening.text}\n${prepText}` : prepText;
        錨定橫額();
        waveBanner.classList.remove('hidden');
    }

    // Render sync
    for (const [projectileId, snapshot] of projectileSnapshot.entries()) {
        if (!state.projectiles.find(projectile => projectile.id === projectileId)) {
            fxRenderer.addExplosion(snapshot.targetX, snapshot.targetZ, snapshot.towerType);
        }
    }
    towerRenderer.animate(rawDt, state);
    enemyRenderer.sync(state, 0, camera);  // C — pass camera for billboard bars
    fxRenderer.setCamera(camera);
    fxRenderer.sync(state, dt);
    projectileRenderer.sync(state, dt);
    syncFloatingTexts(rawDt);
    lightingRig.update(elapsedSec);
    gateway.update(rawDt, state.lives, state.maxLives, camera);
    camCtrl.tickShake(rawDt);
    applyAtmosphere(state.currentWave);

    // Update HUD (throttled on mobile to reduce DOM work)
    if (GRAPHICS.isMobile) {
        if (++hudFrameTick >= 4) { hudFrameTick = 0; updateHUD(); }
    } else {
        updateHUD();
    }

    // Update tower panel if open
    if (inspectedTower) {
        const stillExists = state.towers.find(t => t.id === inspectedTower!.id);
        if (!stillExists) hideTowerPanel();
    }

    renderScene();
}

// ─── 量度用嘅接口 ───
// 唔係遊戲玩法嘅一部分：呢度開一個窗口畀測試用真嘅系統跑真嘅一格邏輯，
// 而唔係喺測試度抄一次公式。抄一次就變成「同一件事寫兩次」——兩邊一齊錯
// 嘅時候把尺會綠。所以呢度淨係轉發 tick* 同 state，冇自己嘅計算。
(window as unknown as Record<string, unknown>).__TD = {
    get state() { return state; },
    LOGIC_DT,
    // 資產嗰把尺量嘅係遊戲自己用嗰個 loader，唔係測試度另開一個——
    // 另開一個就變成量緊一件遊戲唔會行嘅嘢。
    量模型: 量模型,
    門狀態() { return gateway.狀態(); },
    設曲率(a: number, b: number) { 設HP曲率(a, b); },
    塔尺(id: number) { return towerRenderer.measure(id); },
    塔同步() { towerRenderer.sync(state); towerRenderer.animate(0.6, state); },
    地圖: { spawn: cellToWorld(MAP.spawnCell[0], MAP.spawnCell[1]), goal: cellToWorld(MAP.goalCell[0], MAP.goalCell[1]) },
    開門() { gateway.開門(); },
    // 診斷用：呢三個係現成物件嘅引用，唔會令 bundle 大（試過 expose 成個
    // THREE namespace，一下就 707 → 887 kB，嗰個唔可以）。
    scene: sm.scene,
    camera,
    renderer,
    // 行 n 格邏輯。渲染唔關事——量嘅係邏輯。
    // dt 開得出嚟，係因為「一條規則跟唔跟 tick 率」本身就係要量嘅嘢。
    tick(n = 1, dt = LOGIC_DT) {
        for (let i = 0; i < n; i += 1) {
            tickWave(state, dt);
            tickEnemies(state, dt);
            tickTowers(state, dt);
            tickCombat(state, dt);
        }
    },
    // 一個乾淨嘅擂台：清走場上所有嘢，停低出波，錢畀夠。
    擂台(gold = 99999) {
        state.phase = 'wave';
        state.paused = false;
        state.enemies = [];
        state.projectiles = [];
        state.towers = [];
        state.spawnCounts = state.spawnCounts.map(() => 0);
        state.waveEnemiesSpawned = state.waveEnemiesTotal;
        state.gold = gold;
        state.lives = 999;
        return { phase: state.phase, gold: state.gold };
    },
    build(type: TowerType, col: number, row: number) {
        return buildTower(state, type, col, row);
    },
    upgrade(towerId: number) { return upgradeTower(state, towerId); },
    進化(towerId: number, targetType: string) { return evolveTower(state, towerId, targetType); },
    用技能(index: number) {
        const before = state.skills[index]?.remaining ?? -1;
        useSkill(index);
        return { before, remaining: state.skills[index]?.remaining ?? -1 };
    },
    // 出一隻敵人，之後可以擺喺任何一格路上面（唔郁就量得準）。
    spawn(type: string, pathIndex = 0) {
        spawnEnemy(state, type as Parameters<typeof spawnEnemy>[1]);
        const e = state.enemies[state.enemies.length - 1];
        if (pathIndex > 0) {
            const [c, r] = MAP.path[Math.min(pathIndex, MAP.path.length - 1)];
            const w = cellToWorld(c, r);
            let nearestSample = 0;
            let nearestDistance = Number.POSITIVE_INFINITY;
            for (let i = 0; i < state.pathWorld.length; i++) {
                const dx = state.pathWorld[i].x - w.x;
                const dz = state.pathWorld[i].z - w.z;
                const distance = dx * dx + dz * dz;
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestSample = i;
                }
            }
            const sample = state.pathWorld[nearestSample];
            e.pathIndex = nearestSample; e.pathProgress = 0;
            e.worldX = sample.x; e.worldZ = sample.z; e.prevWorldX = sample.x; e.prevWorldZ = sample.z;
        }
        return { id: e.id, hp: e.hp, maxHp: e.maxHp, armor: e.armor, shield: e.shield, x: e.worldX, z: e.worldZ };
    },
    敵(id: number) {
        const e = state.enemies.find(x => x.id === id);
        return e ? { hp: e.hp, alive: e.alive, shield: e.shield, dots: e.dots.length, slow: e.slow } : null;
    },
};

requestAnimationFrame(gameLoop);
