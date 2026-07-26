// 連勝挑戰：關卡變化（戰場條件 + 對手輪替）
//
// 設計原則（見 ADR-007）：每個條件都對雙方對稱生效，AI 唔會因為關卡高而拿到
// 資源或情報優勢。高關卡嘅難度只靠 AIController 嘅戰術銳化。
//
// 注意：條件唔可以覆寫 elixirMax —— HUD 嘅聖水格數喺開場時由常數建立一次，
// 改上限會令格數同實際水量對唔上。

import { PERSONALITIES } from './ai.js';

export const GAUNTLET_CONDITIONS = [
    // 第 1 關永遠係標準規則：新玩家要先摸熟基本盤，唔好一開場就變則
    null,
    {
        id: 'rush', icon: '⏱️', name: '速攻戰',
        desc: '正賽只有 2 分鐘，一開場就要搶塔',
        rules: { matchTime: 120, doubleElixirAt: 60 },
    },
    {
        id: 'flood', icon: '💧', name: '聖水泛濫',
        desc: '雙方聖水回速快 60%，大牌任出',
        rules: { elixirInterval: 1.75 },
    },
    {
        id: 'fortify', icon: '🧱', name: '堅城',
        desc: '雙方城塔血量 ×1.3，要靠兵線硬撼',
        towerHpMult: 1.3,
    },
    {
        id: 'spring', icon: '⛲', name: '聖水泉常開',
        desc: '河心聖水泉開場即通，佔中就有水',
        fountainFromStart: true,
    },
    {
        id: 'duel', icon: '⚔️', name: '開局決鬥',
        desc: '雙方開場 10 滴聖水，即刻開打',
        rules: { elixirStart: 10 },
    },
];

// stage 由 1 開始；0 或負數（即非連勝模式）冇條件
export function stageCondition(stage) {
    if (!stage || stage < 1) return null;
    return GAUNTLET_CONDITIONS[(stage - 1) % GAUNTLET_CONDITIONS.length] ?? null;
}

// 條件轉成 Game 嘅 opts 片段（冇條件就係空物件，行返預設規則）
export function conditionOpts(cond) {
    if (!cond) return {};
    const o = {};
    if (cond.rules) o.rules = cond.rules;
    if (cond.towerHpMult) o.towerHpMult = cond.towerHpMult;
    if (cond.fountainFromStart) o.fountainFromStart = true;
    return o;
}

// 對手輪替：連勝模式唔隨機抽個性，按關卡順序輪。條件週期 6、個性 5 個，
// 兩者錯開，所以要玩 30 關先會撞到完全一樣嘅組合；而每一關都可以預先準備。
export function stagePersonality(stage) {
    const keys = Object.keys(PERSONALITIES);
    return keys[((stage - 1) % keys.length + keys.length) % keys.length];
}
