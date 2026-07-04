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
    overtimeTime: 120,     // 加時 2 分鐘
    elixirMax: 10,
    elixirStart: 5,
    elixirInterval: 2.8,   // 每 2.8 秒回 1 滴
    deployTime: 1.0,       // 部署硬直
    spellTowerFactor: 0.35, // 法術對塔傷害折扣
};

export const TEAM_COLORS = {
    [TEAM.PLAYER]: { main: 0x2b6cb8, accent: 0x8fc1ee, flag: 0x1d4e8f },
    [TEAM.ENEMY]: { main: 0xb83030, accent: 0xeea08f, flag: 0x8f1d1d },
};
