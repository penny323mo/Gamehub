// 戰場座標系統：x 橫向 [-9, 9]，z 縱向 [-16, 16]
// 玩家喺 z > 0（下方），敵方喺 z < 0（上方）。玩家單位向 -z 推進。

export const ARENA = {
    halfW: 9,          // 半闊
    halfL: 16,         // 半長
    riverHalf: 1.4,    // 河流半闊（z 方向）
    bridgeX: 4.5,      // 橋中心 x（左右各一）
    bridgeHalfW: 1.3,  // 橋半闊（x 方向）
};

export const TEAM = { PLAYER: 0, ENEMY: 1 };

// 單位前進方向（z 軸）
export function teamDir(team) {
    return team === TEAM.PLAYER ? -1 : 1;
}

export const TOWERS = {
    princess: { hp: 1500, dmg: 55, hitSpeed: 0.8, range: 7.5, x: 4.5, z: 10.5 },
    king: { hp: 2600, dmg: 90, hitSpeed: 1.0, range: 7.0, z: 13.5 },
};

export const GAME_RULES = {
    matchTime: 180,        // 正賽 3 分鐘
    doubleElixirAt: 60,    // 剩 60 秒開始雙倍聖水
    overtimeTime: 120,     // 第一節加時 2 分鐘
    overtimeExtension: 60, // 加時完仲打和 → 再延長 1 分鐘（sudden death 唔會即刻靠塔血比大細完場）
    maxOvertimeExtensions: 2, // 最多延長兩次，之後先靠塔血百分比分勝負，確保賽事一定完結
    overtimeElixirMult: 3, // 加時聖水回復倍率（3 倍，比雙倍聖水仲快）
    elixirMax: 12,         // 略為提高上限，畀玩家儲多幾滴打連招組合
    elixirStart: 5,
    elixirInterval: 2.8,   // 每 2.8 秒回 1 滴
    deployTime: 1.0,       // 部署硬直
    spellTowerFactor: 0.35, // 法術對塔傷害折扣
    climaxWindow: 10,      // 加時最後幾秒開始傷害加成，谷落決勝
    climaxDmgMult: 1.25,
};

export const TEAM_COLORS = {
    [TEAM.PLAYER]: { main: 0x2e6fc4, accent: 0x9cc8ff, flag: 0x1d4e9f },
    [TEAM.ENEMY]: { main: 0xc43a2e, accent: 0xffb09c, flag: 0x9f1d1d },
};
