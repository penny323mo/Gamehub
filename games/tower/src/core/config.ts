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

export const isMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

export const GRAPHICS = {
    isMobile: isMobile(),
    maxParticles: isMobile() ? 200 : 800,
    enablePostProcessing: !isMobile(),
    enableShadows: !isMobile(),
    pixelRatio: isMobile() ? 1 : Math.min(window.devicePixelRatio, 2),
};
