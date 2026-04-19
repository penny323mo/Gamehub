import * as THREE from 'three';
import { createInitialState } from './core/gameState';
import { LOGIC_DT, MAP, TOWERS, SCORING, WAVES, GRAPHICS, ENEMIES } from './core/config';
import { tickWave, startNextWave } from './core/systems/waveSystem';
import { cellToWorld } from './core/path';
import { tickEnemies } from './core/systems/enemySystem';
import { tickTowers } from './core/systems/towerSystem';
import { tickCombat } from './core/systems/combatSystem';
import { buildTower, canBuild, upgradeTower, sellTower, getSellValue, canUpgrade, evolveTower } from './core/systems/economySystem';
import type { GameState, TowerType, Tower, TargetingMode, Difficulty, Enemy, Projectile } from './core/types';
import { killEnemy } from './core/systems/killSystem';
import { bus } from './core/systems/eventBus';
import { SceneManager } from './render/sceneManager';
import { CameraController } from './render/camera';
import { setupLighting } from './render/lighting';
import { TowerRenderer } from './render/towerRenderer';
import { EnemyRenderer } from './render/enemyRenderer';
import { FxRenderer } from './render/fx';
import { ProjectileRenderer } from './render/projectileRenderer';
import { Picking } from './render/picking';
import { PostProcessor } from './render/postProcessing';
import { audioSystem } from './core/systems/audioSystem';

// ─── State ───
let state: GameState;
let selectedTowerType: TowerType | null = null;
let inspectedTower: Tower | null = null;
let currentDifficulty: Difficulty = 'normal';

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
renderer.toneMappingExposure = 1.28;

const sm = new SceneManager();
const camCtrl = new CameraController();
const camera = camCtrl.cam;
const lightingRig = setupLighting(sm.scene);
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

state = createInitialState(currentDifficulty);

// ─── EventBus Listeners ───
bus.on('streakBonus', e => showStreakBanner(e.streak));
bus.on('milestone', e => showMilestoneBanner(e.wave));
bus.on('towerBuilt', e => {
    const pos = cellToWorld(e.col, e.row);
    fxRenderer.addBuildEffect(pos.x, pos.z);

    towerRenderer.sync(state);
    updateHUD();
});
bus.on('towerUpgraded', e => {
    towerRenderer.removeTower(e.towerId);
    towerRenderer.sync(state);
    updateHUD();
    if (inspectedTower && inspectedTower.id === e.towerId) {
        showTowerPanel(inspectedTower);
    }
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

const goldEl = document.getElementById('gold-val')!;
const livesEl = document.getElementById('lives-val')!;
const waveEl = document.getElementById('wave-val')!;
const killsEl = document.getElementById('kills-val')!;
const hudWaveEl = document.getElementById('hud-wave')!;
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
const milestoneBanner = document.getElementById('milestone-banner')!;
const milestoneBannerText = document.getElementById('milestone-banner-text')!;

bus.on('towerBuilt', () => audioSystem.playBuild());
bus.on('towerSold', () => audioSystem.playSell());
bus.on('enemyKilled', () => audioSystem.playHit());
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
    waveEl.textContent = `${Math.min(state.currentWave + 1, TOTAL_WAVES)}/${TOTAL_WAVES}`;
    killsEl.textContent = String(state.totalKills);

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

    // Populate stats
    document.getElementById('stat-kills')!.textContent = state.totalKills.toString();
    document.getElementById('stat-streak')!.textContent = state.stats.longestStreak.toString();
    document.getElementById('stat-perfect')!.textContent = state.perfectWaves.toString();
    document.getElementById('stat-built')!.textContent = state.stats.towersBuilt.toString();
    document.getElementById('stat-gold')!.textContent = state.stats.goldEarned.toString();
    document.getElementById('stat-dmg')!.textContent = Math.round(state.stats.totalDamageDealt).toString();

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
});

soundBtn.addEventListener('click', () => {
    audioSystem.init();
    const isEnabled = audioSystem.toggle();
    soundBtn.textContent = isEnabled ? '🔊' : '🔇';
    soundBtn.style.opacity = isEnabled ? '1' : '0.5';
});

// Pause toggle
pauseBtn.addEventListener('click', togglePause);

function togglePause(): void {
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? '▶' : '⏸';
    pauseBtn.classList.toggle('active', state.paused);
}

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    // Ignore if game is inactive
    if (state.phase === 'idle' || state.phase === 'won' || state.phase === 'lost') return;

    const key = e.key.toLowerCase();

    // P - Pause
    if (key === 'p') {
        if (state.phase === 'wave' || state.phase === 'prep') togglePause();
        return;
    }
    
    // Ignore input if in help overlay
    if (!helpOverlay.classList.contains('hidden')) return;

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

    if (idx === 0) {
        // Airstrike
        for (const enemy of state.enemies) {
            if (enemy.alive) {
                enemy.hp -= 200;
                if (enemy.hp <= 0) {
                    killEnemy(state, enemy);
                } else {
                    state.floatingTexts.push({ id: state.nextId++, worldX: enemy.worldX, worldZ: enemy.worldZ, value: '-200', color: '#ff4444', life: 1, maxLife: 1 });
                }
            }
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

// Start button
document.getElementById('start-btn')!.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    startNextWave(state);
    showWaveBanner(`Wave 1`);
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
        
        // Re-init state to apply gold/lives BEFORE starting
        state = createInitialState(currentDifficulty);
        updateHUD();
    });
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
    state = createInitialState(currentDifficulty);
    towerRenderer.sync(state);
    updateHUD();
    updateSkillsHUD();
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
        buildTower(state, selectedTowerType, col, row);
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
        renderScene();
        return;
    }

    if (state.phase === 'won' || state.phase === 'lost') {
        if (endScreen.classList.contains('hidden')) {
            showEndScreen();
        }
        lightingRig.update(elapsedSec);
        renderScene();
        return;
    }

    // Pause gate
    if (state.paused) {
        lightingRig.update(elapsedSec);
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
    if (state.phase === 'wave' || state.phase === 'prep') {
        for (const skill of state.skills) {
            if (skill.remaining > 0) {
                skill.remaining = Math.max(0, skill.remaining - dt);
            }
        }
        updateSkillsHUD();
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
    for (const [projectileId, snapshot] of projectileSnapshot.entries()) {
        if (!state.projectiles.find(projectile => projectile.id === projectileId)) {
            fxRenderer.addExplosion(snapshot.targetX, snapshot.targetZ, snapshot.towerType);
        }
    }
    towerRenderer.animate(rawDt, state);
    enemyRenderer.sync(state, 0, camera);  // C — pass camera for billboard bars
    fxRenderer.sync(state, dt);
    projectileRenderer.sync(state, dt);
    syncFloatingTexts(rawDt);
    lightingRig.update(elapsedSec);
    camCtrl.tickShake(rawDt);

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
