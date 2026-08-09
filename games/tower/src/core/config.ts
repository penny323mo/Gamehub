import type {
    MapConfig, TowerConfig, TowerType, EnemyConfig, EnemyType,
    WavesConfig, ScoringConfig
} from './types';

import mapData from '../../configs/map.json';
import towersData from '../../configs/towers.json';
import enemiesData from '../../configs/enemies.json';
import wavesData from '../../configs/waves.json';
import scoringData from '../../configs/scoring.json';

export const MAP: MapConfig = mapData as MapConfig;

export const TOWERS: Record<TowerType, TowerConfig> = towersData as Record<TowerType, TowerConfig>;

export const ENEMIES: Record<EnemyType, EnemyConfig> = enemiesData as Record<EnemyType, EnemyConfig>;

export const WAVES: WavesConfig = wavesData as WavesConfig;

export const SCORING: ScoringConfig = scoringData as ScoringConfig;

export const LOGIC_HZ = 20;
export const LOGIC_DT = 1 / LOGIC_HZ; // 50ms
export const SELL_REFUND_PCT = 0.70;
export const PROJECTILE_SPEED = 12; // world units / sec
// Kenney tile model is 0.2 units high and its base sits at world Y=0.
// Anything that stands on the board must use this top surface, not the tile base.
export const SURFACE_Y = 0.2;

/** Evolved towers reset their gameplay level, but visually keep a complete 3-storey body. */
export const towerVisualLevel = (type: string, level: number): number =>
    type.includes('_') ? 2 : Math.max(0, Math.min(level, 2));

export const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const devicePixelRatio = (): number => typeof window === 'undefined' ? 1 : window.devicePixelRatio;

/**
 * 敵人血量曲線嘅二次項（見 `waveSystem.spawnEnemy`）。
 * 呢個數係對住 `tests/playthrough.mjs` 掃出嚟嘅，唔係揀個靚數——
 * 量度期間可以喺 `window.__TD.設曲率()` 度改，唔使 rebuild。
 */
export let HP_LINEAR = 0.04;
export let HP_CURVE = 0.0016;
export const HP_CURVE_CAP = 45;
export const BOUNTY_LINEAR = 0.04;
export const 設HP曲率 = (線性: number, 二次: number): void => { HP_LINEAR = 線性; HP_CURVE = 二次; };

/**
 * 血量同賞金一定要係兩條獨立曲線。
 *
 * HP_CURVE 係用嚟填中段難度真空；如果賞金跟住同一條二次曲線升，
 * 加血嘅同時會補貼玩家更快起塔，平衡實驗就同時郁咗兩個槓桿。
 */
export const enemyHpScale = (wave: number): number => {
    const w = Math.max(0, wave);
    const capped = Math.min(w, HP_CURVE_CAP);
    return 1 + w * HP_LINEAR + HP_CURVE * capped * capped;
};

/** 保留原本賞金節奏；賞金唔會因 HP 二次曲線而暗中增加。 */
export const enemyBountyScale = (wave: number): number => 1 + Math.max(0, wave) * BOUNTY_LINEAR;

export const GRAPHICS = {
    isMobile: isMobile(),
    maxParticles: isMobile() ? 200 : 800,
    enablePostProcessing: !isMobile(),
    enableShadows: !isMobile(),
    pixelRatio: isMobile() ? 1 : Math.min(devicePixelRatio(), 2),
    terrain: {
        // Rotated orthographic views expose the plane corners; keep enough terrain
        // beyond the irregular island that the sky never cuts black wedges into view.
        underlayPadding: isMobile() ? 20 : 28,
        underlaySegments: isMobile() ? 36 : 72,
    },
    atmosphere: {
        fogColor: 0x102417,
        fogDensity: isMobile() ? 0.011 : 0.014,
        spawnPulseSpeed: 2.4,
        goalPulseSpeed: 1.7,
        bloomStrength: isMobile() ? 0.38 : 0.62,
        bloomRadius: isMobile() ? 0.28 : 0.45,
        bloomThreshold: isMobile() ? 0.9 : 0.82,
        vignetteStrength: isMobile() ? 0.1 : 0.16,
        grainAmount: isMobile() ? 0 : 0.018,
    },
};
