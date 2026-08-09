import type { GameState, Tower, TowerType } from '../types';
import { cellKey } from '../types';
import { TOWERS, SELL_REFUND_PCT } from '../config';
import { cellToWorld } from '../path';
import { MAP } from '../config';
import { rebuildOccupied } from '../gameState';
import { bus } from './eventBus';

/**
 * 起唔起得塔。
 *
 * 本來嘅規則係「唔係路、又未有塔」——於是張 20×12 地圖有 **62 個貼路位**，
 * 而實測膝點係 **20 座會死、30 座無敵**。即係「擺喺邊」由頭到尾都唔係一個
 * 決定：你淨係要一路撳起塔就贏。而「呢舊錢擺喺邊」正正係塔防嘅核心決定。
 *
 * 而家改成**明確平台**（`map.json` 嘅 `buildCells`，由
 * `scripts/gen-build-pads.mjs` 生成，`tests/balance.mjs` 由嗰度 import 條規則守）。
 * 冇 `buildCells` 嘅地圖照舊行返舊規則，唔會靜靜哋變成一格都起唔到。
 */
const 平台 = new Set((MAP.buildCells ?? []).map(([c, r]) => cellKey(c, r)));

export function canBuild(state: GameState, col: number, row: number): boolean {
    if (col < 0 || col >= MAP.cols || row < 0 || row >= MAP.rows) return false;
    const key = cellKey(col, row);
    if (state.pathCells.has(key)) return false;
    if (state.occupiedCells.has(key)) return false;
    if (平台.size > 0 && !平台.has(key)) return false;
    return true;
}

/** 呢一格係咪建築平台（renderer 用嚟畫個台出嚟）。 */
export function isBuildPad(col: number, row: number): boolean {
    return 平台.size === 0 || 平台.has(cellKey(col, row));
}

/** Build a tower */
export function buildTower(state: GameState, type: TowerType, col: number, row: number): Tower | null {
    const cfg = TOWERS[type].levels[0];
    if (state.gold < cfg.buildCost) return null;
    if (!canBuild(state, col, row)) return null;

    const pos = cellToWorld(col, row);
    const tower: Tower = {
        id: state.nextId++,
        type,
        level: 0,
        col,
        row,
        worldX: pos.x,
        worldZ: pos.z,
        cooldownRemaining: 0,
        totalInvested: cfg.buildCost,
        targetingMode: 'first',
        kills: 0,
    };

    state.gold -= cfg.buildCost;
    state.stats.towersBuilt++;
    state.stats.goldSpent += cfg.buildCost;
    state.towers.push(tower);
    rebuildOccupied(state);
    
    bus.emit({
        type: 'towerBuilt',
        towerId: tower.id,
        towerType: tower.type,
        col: tower.col,
        row: tower.row
    });
    
    return tower;
}

/** Upgrade a tower (returns true if successful) */
export function upgradeTower(state: GameState, towerId: number): boolean {
    const tower = state.towers.find(t => t.id === towerId);
    if (!tower) return false;

    const levels = TOWERS[tower.type].levels;
    if (tower.level >= levels.length - 1) return false;

    const nextLevel = levels[tower.level + 1];
    if (state.gold < nextLevel.upgradeCost) return false;

    state.gold -= nextLevel.upgradeCost;
    state.stats.goldSpent += nextLevel.upgradeCost;
    tower.totalInvested += nextLevel.upgradeCost;
    tower.level++;
    
    bus.emit({
        type: 'towerUpgraded',
        towerId: tower.id,
        newLevel: tower.level
    });
    
    return true;
}

/** Sell a tower (returns refund amount) */
export function sellTower(state: GameState, towerId: number): number {
    const idx = state.towers.findIndex(t => t.id === towerId);
    if (idx === -1) return 0;

    const tower = state.towers[idx];
    const refund = Math.floor(tower.totalInvested * SELL_REFUND_PCT);
    state.gold += refund;
    state.stats.towersSold++;
    state.towers.splice(idx, 1);
    rebuildOccupied(state);
    
    bus.emit({
        type: 'towerSold',
        towerId: tower.id,
        refund: refund,
        worldX: tower.worldX,
        worldZ: tower.worldZ
    });
    
    return refund;
}

/** Get sell value for a tower */
export function getSellValue(tower: Tower): number {
    return Math.floor(tower.totalInvested * SELL_REFUND_PCT);
}

/** Check if tower can be upgraded */
export function canUpgrade(state: GameState, tower: Tower): boolean {
    const levels = TOWERS[tower.type].levels;
    if (tower.level >= levels.length - 1) return false;
    return state.gold >= levels[tower.level + 1].upgradeCost;
}

/** Evolve a max-level tower to a new type */
export function evolveTower(state: GameState, towerId: number, targetType: string): boolean {
    const tower = state.towers.find(t => t.id === towerId);
    if (!tower) return false;

    const towerCfg = TOWERS[tower.type];
    if (!towerCfg.evolutions) return false;
    
    const evo = towerCfg.evolutions.find((e: any) => e.type === targetType);
    if (!evo) return false;
    
    if (state.gold < evo.cost) return false;
    
    state.gold -= evo.cost;
    state.stats.goldSpent += evo.cost;
    tower.totalInvested += evo.cost;
    tower.type = targetType as TowerType;
    tower.level = 0; // The new evolved tower type starts at level 0
    
    bus.emit({
        type: 'towerUpgraded',
        towerId: tower.id,
        newLevel: 0
    });
    
    return true;
}
