// 視覺設定：邊個英雄用邊個模型、攞咩武器、每個狀態播邊個動畫。
//
// 呢啲嘢刻意唔放入 champions.js。嗰邊係純數據，node 直接 import 得，
// 一放模型名落去就會引到人喺數值檔度寫渲染邏輯。
//
// 武器唔使自己做插槽：KayKit 嘅角色本身已經將所有武器綁咗喺 handslot.l／
// handslot.r 下面，全部同時 visible。所以「揀武器」= 開關指定名嘅節點。

// 全部九個模型共用同一副 41 條骨，所以呢批 clip 名對每個模型都有效。
export const CLIP = {
    idle: 'Idle',
    idleCombat: 'Idle_Combat',
    run: 'Running_A',
    walk: 'Walking_B',
    hit: 'Hit_A',
    death: 'Death_A',
    deathBones: 'Death_C_Skeletons',
    cheer: 'Cheer',
    taunt: 'Taunt',
    spawn: 'Skeletons_Awaken_Floor',
    // 攻擊／技能（按角色揀）
    slash: '1H_Melee_Attack_Slice_Horizontal',
    chop1h: '1H_Melee_Attack_Chop',
    chop2h: '2H_Melee_Attack_Chop',
    spin: '2H_Melee_Attack_Spin',
    shoot: '1H_Ranged_Shoot',
    castShoot: 'Spellcast_Shoot',
    castRaise: 'Spellcast_Raise',
    castSummon: 'Spellcast_Summon',
    block: 'Block',
    throw: 'Throw',
    dodge: 'Dodge_Forward',
    jumpChop: '1H_Melee_Attack_Jump_Chop',
};

// 每個英雄：模型、縮放、攞邊件武器、普攻同四個技能各自播咩。
// abilityClip 嘅四格對住 Q/W/E/R。
export const CHAMPION_LOOK = {
    ironward: {
        model: 'knight', scale: 1.65,
        weapons: ['1H_Sword', 'Round_Shield'],
        attack: CLIP.slash,
        abilityClip: [CLIP.chop1h, CLIP.block, CLIP.dodge, CLIP.taunt],
        ringColour: 0x5b8dd6,
    },
    longshot: {
        model: 'ranger', scale: 1.6,
        weapons: ['2H_Crossbow'],
        attack: CLIP.shoot,
        abilityClip: [CLIP.shoot, CLIP.dodge, CLIP.throw, CLIP.shoot],
        ringColour: 0x63c98a,
    },
    emberwake: {
        model: 'mage', scale: 1.6,
        weapons: ['2H_Staff'],
        attack: CLIP.castShoot,
        abilityClip: [CLIP.castShoot, CLIP.castRaise, CLIP.castSummon, CLIP.castRaise],
        ringColour: 0xe8734a,
    },
    duskblade: {
        model: 'rogue', scale: 1.6,
        weapons: ['Knife', 'Knife_Offhand'],
        attack: CLIP.slash,
        abilityClip: [CLIP.dodge, CLIP.throw, CLIP.chop1h, CLIP.spin],
        ringColour: 0x9a6ad6,
    },
    dawnkeeper: {
        // 骷髏法師：一個唔肯畀光熄咗嘅亡者。亡靈 + 聖光係好經典嘅組合，
        // 而且喺六個英雄入面佢係唯一一個一眼認得出嘅剪影。
        model: 'skeleton_mage', scale: 1.65,
        weapons: [],
        attack: CLIP.castShoot,
        abilityClip: [CLIP.castShoot, CLIP.castRaise, CLIP.castSummon, CLIP.castSummon],
        ringColour: 0xe8cf6a,
    },
    ironhulk: {
        model: 'barbarian', scale: 1.72,
        weapons: ['2H_Axe'],
        attack: CLIP.chop2h,
        abilityClip: [CLIP.chop2h, CLIP.taunt, CLIP.jumpChop, CLIP.spin],
        ringColour: 0xc4763f,
    },
};

export const MINION_LOOK = {
    melee: { model: 'skeleton_minion', scale: 1.25, weapons: ['1H_Sword'], attack: CLIP.slash },
    ranged: { model: 'skeleton_archer', scale: 1.2, weapons: ['2H_Crossbow'], attack: CLIP.shoot },
    siege: { model: 'skeleton_warrior', scale: 1.6, weapons: ['2H_Axe'], attack: CLIP.chop2h },
};

// 場景件：模型名 + 縮放。縮放係由「遊戲入面嘅半徑」除返「模型本身闊度」度出嚟。
// 塔本體闊 0.99 米、遊戲半徑 2.2 米（直徑 4.4），所以要放大約 3.6 倍。
export const ARENA_LOOK = {
    towerByTier: ['building_tower_A', 'building_tower_B'],
    towerScale: [3.0, 2.9],
    nexus: 'building_castle', nexusScale: 3.0,
    barracks: 'building_barracks', barracksScale: 2.2,
    rubble: 'building_destroyed', rubbleScale: 2.8,
    wall: 'wall_straight', wallScale: 2.2,
    // 一塊 hex：橫向（x）對邊闊 2.0，縱向（z）尖對尖 2.31。
    hexAcross: 2.0, hexPoint: 2.31,
    tileGrass: 'hex_grass', tileRoad: 'hex_road_A', tileEdge: 'hex_water',
    scenery: ['mountain_A_grass_trees', 'mountain_B_grass', 'mountain_C_grass_trees',
        'hills_A_trees', 'hills_B', 'trees_A_medium', 'trees_B_small',
        'tree_single_A', 'rock_single_A', 'rock_single_C'],
    clouds: ['cloud_big', 'cloud_small'],
};

export const TEAM_COLOUR = [0x4ea4ff, 0xff5a48];   // 藍、紅
