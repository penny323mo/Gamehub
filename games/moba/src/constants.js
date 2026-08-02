// 深淵之橋 — 一條橋、三對三嘅 MOBA。
//
// 點解淨係一條線：MOBA 嘅樂趣係補兵、換血、越塔、團戰，唔係睇小地圖。
// 三條線嘅版本要求玩家分心睇兩條唔喺畫面入面嘅線，喺手機上面根本做唔到；
// 一條橋反而每一秒都有嘢打，而補兵／推塔／等大招呢啲核心決策一個都冇少。
//
// 座標系：橋沿住 x 軸，藍方基地喺 -x，紅方喺 +x。z 係橋嘅闊度方向。
// 所有距離用「米」，一個英雄大約 1.2 米闊。

export const TEAM = { BLUE: 0, RED: 1 };
export const teamName = (t) => (t === TEAM.BLUE ? '藍方' : '紅方');
export const enemyOf = (t) => (t === TEAM.BLUE ? TEAM.RED : TEAM.BLUE);

// ---------- 地圖 ----------
export const MAP = {
    // 橋由 -halfLength 去 +halfLength；出面係深淵，行唔到。
    halfLength: 60,
    halfWidth: 8.5,
    // 每邊：外塔、內塔、水晶。基地喺水晶後面。
    //
    // 點解外塔只係離中線 26 米：兩邊嘅兵永遠喺中間相遇，所以「中線到外塔」
    // 呢段距離就係「打贏一波兵之後要行幾遠先傷到塔」。舊版 58 米——實測藍兵
    // 最前線嘅中位數只係 x=11、九成時間去唔到 40，即係話贏咗兵線都變唔到塔嘅
    // 傷害，成場波永遠打唔完。26 米即係大約五秒腳程，塔嘅射程 15.5 米亦都啱啱
    // 好蓋住中線兩邊——你要喺塔火之外換血，呢個就係 ARAM 嘅節奏。
    towerX: [26, 44],        // 距離中線幾遠（由外到內）
    nexusX: 52,
    // 泉水要離水晶夠遠，否則守家嗰個企喺水晶度就有無限回血。
    fountainX: 62,           // 重生點，喺水晶後面
};

// 出生點稍為分開，唔好三個人疊晒喺同一點
export const SPAWN_SPREAD = 2.6;

// ---------- 時間 ----------
export const TICK = 1 / 30;              // 模擬固定步長：測試要可重現
export const WAVE_FIRST = 12;            // 第一波兵幾時出（秒）
export const WAVE_PERIOD = 22;           // 之後每幾多秒一波
export const SIEGE_EVERY = 3;            // 每幾波有攻城車
// 時限。到咗就按「剩餘建築血量」判勝負——唔用「兩邊水晶一齊流血」嗰種
// 收尾，因為嗰樣會造成雙方同時爆水晶嘅平手，而且贏嘅唔一定係打得好嗰隊。
export const GAME_MAX = 60 * 25;

// ---------- 收斂機制 ----------
// 一場對稱嘅 MOBA 唔會自己完場：兩邊兵線喺中間互相抵銷，攻守勢均力敵。
// 實測鏡像陣容十場入面有三場打到 30 分鐘上限。真實 MOBA 靠「後期會失衡」
// 呢件事收尾——兵線愈嚟愈惡、防禦愈嚟愈唔頂得住。呢度兩個掣做同一件事：
//   1. 攻城兵愈出愈密（12 分鐘起兩波一隻，20 分鐘起每波都有）
//   2. 塔嘅護甲由 9 分鐘開始蒸發，18 分鐘歸零
// 兩樣都係時間驅動、對兩邊一視同仁，而且玩家睇得見。
export const SIEGE_DENSE_AT = 60 * 12;   // 之後每兩波一隻攻城兵
export const SIEGE_EVERY_WAVE_AT = 60 * 20;
export const TOWER_DECAY_FROM = 60 * 9;
export const TOWER_DECAY_TO = 60 * 18;

// ---------- 小兵 ----------
//
// hpPerMin 好細，係一個刻意嘅決定。上一版係 22，實測之下英雄由 1 級打到
// 12 級，殺一隻近戰兵永遠都係七下——小兵每分鐘加嘅血啱啱好抵銷咗升級加嘅
// 傷害。一條「清兵速度永遠唔變」嘅曲線即係兵線永遠斷唔到，成場波冇推力。
// 而家配合裝備，清一隻兵由開場約六下跌到後期兩三下，兵線先至會郁。
export const MINION = {
    melee: {
        key: 'melee', model: 'skeleton_minion', count: 3,
        hp: 400, hpPerMin: 9, armour: 0, damage: 13, dmgPerMin: 1.6,
        range: 1.8, attackSpeed: 1.25, speed: 5.2, gold: 21, xp: 60, scale: 0.62,
    },
    ranged: {
        key: 'ranged', model: 'skeleton_archer', count: 2,
        hp: 250, hpPerMin: 6, armour: 0, damage: 21, dmgPerMin: 2.4,
        range: 11, attackSpeed: 1.0, speed: 5.2, gold: 15, xp: 42, scale: 0.58,
        projectile: 'arrow',
    },
    siege: {
        key: 'siege', model: 'skeleton_warrior', count: 1,
        hp: 820, hpPerMin: 26, armour: 6, damage: 46, dmgPerMin: 5, structureBonus: 2.2,
        range: 13, attackSpeed: 0.55, speed: 4.6, gold: 40, xp: 95, scale: 0.85,
        projectile: 'stone',
    },
};

// 小兵行到邊就停低打嘢：佢哋唔會離開橋面，所以只需要一個 x 目標。
export const MINION_STOP_MARGIN = 1.2;

// ---------- 建築 ----------
export const TOWER = {
    // 外塔薄、內塔厚：拆完外塔應該有一段「打得順」嘅時間，而唔係每座都一樣硬。
    // 全部 2400 嗰版實測跑到 28 分鐘先分到勝負，對一條線嘅網頁 MOBA 嚟講太長。
    hpByTier: [1200, 1550],
    armour: 22, damage: 138, range: 15.5, attackSpeed: 0.83,
    gold: 250, goldLocal: 110,          // 拆到嘅人攞多啲，隊友分 goldLocal
    // 連續打同一個目標會愈打愈痛：越塔前要諗清楚。
    rampPerHit: 0.28, rampMax: 1.9,
};
export const NEXUS = {
    // 試過而且否決咗：將水晶改弱（70 傷害、10 射程），諗住「水晶應該係目標
    // 唔係第三座塔」。實測反而衰——推爆水晶收場由 12 場中 7 場跌到 4 場。
    // 水晶嘅火力係守方基地嘅控制範圍，一收窄，守方嘅新兵線就自由咁出得返嚟。
    hp: 2300, armour: 30, damage: 120, range: 14, attackSpeed: 0.7,
};

// ---------- 英雄成長 ----------
export const MAX_LEVEL = 12;
// 升級所需經驗（累積）。第 12 級大約十五分鐘到，同一場 20 分鐘嘅節奏夾。
//
// 試過收緊兩成去補償「大招 5 級先有」，結果更差（推爆水晶 7/12 → 5/12）：
// 升級快係兩邊一齊快，英雄一齊變厚，塔反而更加拆唔郁。唔要。
export const XP_TO_LEVEL = [0, 280, 660, 1140, 1720, 2400, 3180, 4060, 5040, 6120, 7300, 8580];
export const XP_SHARE_RANGE = 16;        // 喺呢個距離之內就有經驗
export const KILL_GOLD = 300;
export const ASSIST_GOLD = 150;
export const ASSIST_WINDOW = 10;         // 幾多秒內有貢獻先算助攻
export const GOLD_PER_SEC = 3.2;         // 每秒自然收入
export const START_GOLD = 500;
export const RESPAWN_BASE = 8;           // 重生時間 = base + level × perLevel
export const RESPAWN_PER_LEVEL = 1.8;

// 連殺／終結連殺：賞金制，領先嗰個會變成賞金頭，唔會一面倒滾雪球
export const SHUTDOWN_PER_STREAK = 60;
export const SHUTDOWN_MAX = 420;

// ---------- 戰鬥數學 ----------
// 護甲用經典遞減公式：100 護甲 = 減一半傷害。堆到幾多都唔會免疫。
export const armourMul = (armour) => 100 / (100 + Math.max(-99, armour));

// 建築護甲隨時間蒸發：呢個就係「後期一定推得郁」嘅保證。
export function structureArmour(base, time) {
    if (time <= TOWER_DECAY_FROM) return base;
    const t = Math.min(1, (time - TOWER_DECAY_FROM) / (TOWER_DECAY_TO - TOWER_DECAY_FROM));
    return base * (1 - t);
}

// 塔下嘅仇恨規則：你打對面英雄，塔就轉打你——呢條規則就係「越塔」嘅代價。
export const TOWER_AGGRO_MEMORY = 3.5;

// 曦守被動「守望」。卡面寫住嘅嘢就要做得到——呢個被動之前淨係有文字冇實作，
// 六個英雄入面唯獨佢打少一件嘢，實測勝率跌到 20%。
export const WARDEN = { range: 11, manaCost: 0.08, cd: 30, leaveHpPct: 0.12 };

// ---------- 泉水 ----------
export const FOUNTAIN_HEAL_PCT = 0.22;   // 每秒回幾多成最大值
export const FOUNTAIN_RADIUS = 6;        // 要細過 fountainX - nexusX - 水晶半徑

// ---------- 撞開 ----------
// 單位唔可以疊埋一齊，否則成團兵睇落好假。用軟推開，唔用硬碰撞。
export const PUSH_STRENGTH = 7.5;
