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

// 戰鬥特效語言。動畫話畀人知「角色郁咗」，呢組資料就要話畀人知「邊個出咗
// 邊招」。之前 24 招技按 form 共用幾個圈，顏色有分別但剪影一樣；遠鏡頭下
// 玩家只見到一堆圓。每個 style 都係穩定識別碼，family/幾何參數先控制畫法。
// 呢度只放 renderer data，規則同數值仍然留喺 champions.js / sim.js。
export const CHAMPION_FX = {
    ironward: {
        basic: { style: 'ironward-guard-cut', family: 'guard', colour: 0x72b5ff,
            accent: 0xd8ecff, sides: 6, rays: 3, weight: 1.05 },
        abilities: [
            { style: 'ironward-seismic', family: 'shockwave', colour: 0x72b5ff,
                accent: 0xd8ecff, sides: 12, rings: 3, rays: 8, impact: 1.25 },
            { style: 'ironward-bulwark', family: 'shield', colour: 0x8ac4ff,
                accent: 0xf1f8ff, sides: 6, rings: 2, rays: 0, dome: true },
            { style: 'ironward-charge', family: 'charge', colour: 0x5c9cff,
                accent: 0xcbe2ff, sides: 4, rings: 1, rays: 4, trailWidth: 2.1 },
            { style: 'ironward-fortress', family: 'fortress', colour: 0x4f82d8,
                accent: 0xe8f2ff, sides: 6, rings: 3, rays: 6, dome: true, pillar: true },
        ],
    },
    longshot: {
        basic: { style: 'longshot-precision-bolt', family: 'arrow', colour: 0x72e49d,
            accent: 0xe0ffe9, sides: 4, rays: 2, projectile: 'arrow' },
        abilities: [
            { style: 'longshot-piercing-arrow', family: 'pierce', colour: 0x55dc8b,
                accent: 0xe5ffed, sides: 4, rings: 1, rays: 2, projectile: 'arrow-heavy' },
            { style: 'longshot-windstep', family: 'speed', colour: 0x7de6ae,
                accent: 0xeafff2, sides: 3, rings: 2, rays: 3, trailWidth: 1.2 },
            { style: 'longshot-thorn-trap', family: 'trap', colour: 0x58be75,
                accent: 0xcaffd4, sides: 8, rings: 2, rays: 8, spikes: true },
            { style: 'longshot-killing-arrow', family: 'railshot', colour: 0xb6ff7a,
                accent: 0xffffff, sides: 4, rings: 2, rays: 4, projectile: 'arrow-ultimate', pillar: true },
        ],
    },
    emberwake: {
        basic: { style: 'emberwake-cinder-shot', family: 'fire', colour: 0xff784a,
            accent: 0xffd08a, sides: 10, rays: 5, projectile: 'ember' },
        abilities: [
            { style: 'emberwake-spark', family: 'spark', colour: 0xff7040,
                accent: 0xffe0a0, sides: 10, rings: 1, rays: 6, projectile: 'ember-fast' },
            { style: 'emberwake-flame-field', family: 'flame', colour: 0xff5b32,
                accent: 0xffbd62, sides: 14, rings: 2, rays: 7, flames: true },
            { style: 'emberwake-backflash', family: 'backstep', colour: 0xff8a5c,
                accent: 0x47233b, sides: 5, rings: 2, rays: 5, trailWidth: 2.5 },
            { style: 'emberwake-skyfire', family: 'meteor', colour: 0xff472d,
                accent: 0xffe08a, sides: 16, rings: 3, rays: 12, pillar: true, flames: true, impact: 1.45 },
        ],
    },
    duskblade: {
        basic: { style: 'duskblade-twin-cut', family: 'twin', colour: 0xb782ff,
            accent: 0xf0ddff, sides: 5, rays: 4, blades: 2, weight: 0.78 },
        abilities: [
            { style: 'duskblade-shadow-rush', family: 'shadowdash', colour: 0x8d5ad8,
                accent: 0x24153f, sides: 5, rings: 2, rays: 5, trailWidth: 2.8, twin: true },
            { style: 'duskblade-blade-dance', family: 'bladedance', colour: 0xc28aff,
                accent: 0xf7eaff, sides: 5, rings: 3, rays: 10, cross: true },
            { style: 'duskblade-throat-cut', family: 'crosscut', colour: 0xd15cff,
                accent: 0xffd8ff, sides: 4, rings: 1, rays: 4, cross: true },
            { style: 'duskblade-execute', family: 'execute', colour: 0x7b2bd1,
                accent: 0xff4f92, sides: 3, rings: 3, rays: 6, cross: true, collapse: true, impact: 1.35 },
        ],
    },
    dawnkeeper: {
        basic: { style: 'dawnkeeper-radiant-bolt', family: 'holy', colour: 0xffdf70,
            accent: 0xffffff, sides: 8, rays: 6, projectile: 'holy' },
        abilities: [
            { style: 'dawnkeeper-sacred-lance', family: 'holybeam', colour: 0xffe070,
                accent: 0xffffff, sides: 8, rings: 2, rays: 8, projectile: 'holy-lance', pillar: true },
            { style: 'dawnkeeper-sanctuary', family: 'ward', colour: 0xffeea0,
                accent: 0xdffff0, sides: 8, rings: 3, rays: 4, dome: true },
            { style: 'dawnkeeper-sunburst', family: 'sunburst', colour: 0xffd84f,
                accent: 0xffffff, sides: 16, rings: 2, rays: 16, impact: 1.2 },
            { style: 'dawnkeeper-new-dawn', family: 'dawn', colour: 0xffef9a,
                accent: 0xa7ffd1, sides: 12, rings: 4, rays: 12, pillar: true, dome: true },
        ],
    },
    ironhulk: {
        basic: { style: 'ironhulk-heavy-cleave', family: 'axe', colour: 0xffa052,
            accent: 0xffe0ae, sides: 3, rays: 5, weight: 1.42 },
        abilities: [
            { style: 'ironhulk-sunder', family: 'cleave', colour: 0xff9b48,
                accent: 0xffe0a3, sides: 3, rings: 1, rays: 7, cross: true, impact: 1.3 },
            { style: 'ironhulk-warcry', family: 'warcry', colour: 0xe07a3c,
                accent: 0xffd48f, sides: 9, rings: 4, rays: 9, dome: true },
            { style: 'ironhulk-leap-smash', family: 'leap', colour: 0xf28b3f,
                accent: 0x5a271b, sides: 7, rings: 3, rays: 7, spikes: true, trailWidth: 2.4, impact: 1.4 },
            { style: 'ironhulk-blood-rage', family: 'bloodrage', colour: 0xe33932,
                accent: 0xffa04f, sides: 7, rings: 3, rays: 14, flames: true, collapse: true },
        ],
    },
};

export function championFx(championId, abilityIndex = null) {
    const look = CHAMPION_FX[championId];
    if (!look) return null;
    return abilityIndex == null ? look.basic : look.abilities[abilityIndex] ?? null;
}

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
    towerBase: 'building_tower_base',
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
