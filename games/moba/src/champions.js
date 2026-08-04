// 六個原創英雄。唔用任何現有遊戲嘅角色名或者技能，呢度全部係自己嘅設計。
//
// 設計原則：
//   1. 每個英雄要有一個「一句講得完」嘅身份，玩家一睇就知點揸；
//   2. 四個技能唔可以四個都係「掟嘢出去打人」——要有位移、控制、保命、爆發；
//   3. 每個技能都要有一個「打中／打唔中」嘅判定，唔可以全部自動命中；
//   4. 大招（R）要係一個時刻，唔係一個大啲嘅 Q。
//
// 技能形態（sim.js 負責執行）：
//   skillshot  — 直線飛行，打中第一個敵人（或者 pierce 全部）
//   target     — 鎖定單體，要喺射程之內
//   dash       — 向指定方向衝，可帶傷害
//   aoe        — 喺指定位置炸開
//   self       — 加喺自己身上
//   summon     — 放置一件會持續作用嘅嘢

export const CHAMPIONS = {
    // ---- 近戰坦克：靠衝入去開場，越打得耐越硬 ----
    ironward: {
        id: 'ironward', name: '鐵衛', title: '不退之盾', model: 'swordsman',
        role: '坦克', colour: 0x5b8dd6, difficulty: 1,
        hp: 640, hpPerLvl: 105, hpRegen: 8, hpRegenPerLvl: 0.8,
        mp: 280, mpPerLvl: 40, mpRegen: 7, mpRegenPerLvl: 0.6,
        damage: 62, dmgPerLvl: 4.2, armour: 34, armourPerLvl: 4.0,
        attackSpeed: 0.952, attackSpeedPerLvl: 0.018, range: 2.2, speed: 7.1,
        passive: {
            name: '愈戰愈厚',
            text: '每受到一次英雄傷害，護甲 +3（最多疊 8 層，離開戰鬥 6 秒清空）。',
        },
        abilities: [
            {
                key: 'Q', name: '撼地一擊', form: 'aoe', cost: 45, cd: 7, range: 5.5,
                radius: 3.4, damage: [70, 110, 150, 190], apRatio: 0, adRatio: 0.6,
                slow: 0.35, slowTime: 1.5,
                text: '喺附近砸地，造成傷害並減速 35%（1.5 秒）。',
            },
            {
                key: 'W', name: '鐵壁', form: 'self', cost: 50, cd: 14, duration: 3,
                shield: [90, 140, 190, 240], shieldRatio: 0.12,
                text: '獲得護盾（隨最大生命增加），持續 3 秒。',
            },
            {
                key: 'E', name: '衝鋒', form: 'dash', cost: 55, cd: 12, range: 9,
                damage: [60, 95, 130, 165], adRatio: 0.5, stun: 0.9,
                text: '向前衝，撞到第一個敵人造成傷害並暈眩 0.9 秒。',
            },
            {
                key: 'R', name: '不退', form: 'self', cost: 100, cd: 90, duration: 5,
                damage: [0, 0, 0], armourBonus: [40, 70, 100], taunt: 1.2, radius: 6,
                text: '五秒內大幅提升護甲，並嘲諷周圍敵人 1.2 秒。',
            },
        ],
    },

    // ---- 遠程射手：站得穩就贏，但好脆 ----
    longshot: {
        id: 'longshot', name: '長弓', title: '一箭定生死', model: 'archer',
        role: '射手', colour: 0x63c98a, difficulty: 2,
        hp: 445, hpPerLvl: 72, hpRegen: 5, hpRegenPerLvl: 0.5,
        mp: 300, mpPerLvl: 42, mpRegen: 8, mpRegenPerLvl: 0.7,
        damage: 60, dmgPerLvl: 4.4, armour: 19, armourPerLvl: 2.8,
        attackSpeed: 1.008, attackSpeedPerLvl: 0.024, range: 9.6, speed: 6.4,
        projectile: 'arrow',
        passive: {
            name: '瞄準',
            text: '站定唔郁 1.5 秒之後，下一下普攻多 35% 傷害。',
        },
        abilities: [
            {
                key: 'Q', name: '穿甲箭', form: 'skillshot', cost: 40, cd: 6, range: 16,
                speed: 34, width: 1.1, pierce: true,
                damage: [70, 105, 140, 175], adRatio: 0.8,
                text: '射出一支貫穿嘅箭，打中路上所有敵人。',
            },
            {
                key: 'W', name: '疾走', form: 'self', cost: 35, cd: 13, duration: 2.5,
                speedBonus: [0.25, 0.32, 0.39, 0.46],
                text: '兩秒半內大幅加速，用嚟拉開距離或者追擊。',
            },
            {
                key: 'E', name: '荊棘陷阱', form: 'summon', cost: 50, cd: 16, range: 10,
                radius: 2.6, duration: 20, armTime: 1,
                damage: [60, 90, 120, 150], apRatio: 0, adRatio: 0.4, root: 1.4,
                text: '放一個陷阱，敵人踩中會被定身 1.4 秒並受傷。',
            },
            {
                key: 'R', name: '致命一箭', form: 'skillshot', cost: 100, cd: 75, range: 60,
                speed: 60, width: 1.4, pierce: false, global: true,
                damage: [220, 340, 460], adRatio: 1.4, executeUnder: 0.18,
                text: '射出一支超遠距離嘅箭；目標生命低於 18% 時直接處決。',
            },
        ],
    },

    // ---- 法師：靠技能連招，打中就好痛 ----
    emberwake: {
        id: 'emberwake', name: '燼燃', title: '焚盡千軍', model: 'musketeer',
        role: '法師', colour: 0xe0743a, difficulty: 3,
        hp: 460, hpPerLvl: 74, hpRegen: 5, hpRegenPerLvl: 0.5,
        mp: 420, mpPerLvl: 58, mpRegen: 10, mpRegenPerLvl: 0.9,
        damage: 54, dmgPerLvl: 3.2, armour: 19, armourPerLvl: 2.8,
        attackSpeed: 0.882, attackSpeedPerLvl: 0.016, range: 9.5, speed: 6.3,
        ap: 0, apPerLvl: 14,
        projectile: 'ember',
        passive: {
            name: '餘燼',
            text: '技能命中會留低灼燒，2 秒內造成額外 25% 技能傷害。',
        },
        abilities: [
            {
                key: 'Q', name: '火花', form: 'skillshot', cost: 45, cd: 5, range: 13,
                speed: 26, width: 1.2, pierce: false,
                damage: [70, 105, 140, 175], apRatio: 0.7,
                text: '射出一團火花，打中第一個敵人。',
            },
            {
                key: 'W', name: '烈焰地帶', form: 'aoe', cost: 60, cd: 11, range: 11,
                radius: 3.8, duration: 3, tick: 0.5,
                damage: [22, 34, 46, 58], apRatio: 0.16,
                text: '喺地上燒起一片火，三秒內持續傷害範圍內敵人。',
            },
            {
                key: 'E', name: '閃退', form: 'dash', cost: 50, cd: 15, range: 7,
                damage: [0, 0, 0, 0], backwards: true,
                text: '向後閃一段距離，用嚟躲技能或者拉開身位。',
            },
            {
                key: 'R', name: '天火', form: 'aoe', cost: 110, cd: 80, range: 18,
                radius: 5.5, delay: 0.9,
                damage: [280, 420, 560], apRatio: 1.1,
                text: '喺指定位置召落天火，零點九秒後爆發大範圍傷害。',
            },
        ],
    },

    // ---- 刺客：靠位移切後排 ----
    duskblade: {
        id: 'duskblade', name: '暮刃', title: '一瞬即至', model: 'pikeman',
        role: '刺客', colour: 0x9a6fd4, difficulty: 3,
        hp: 565, hpPerLvl: 94, hpRegen: 7, hpRegenPerLvl: 0.7,
        mp: 300, mpPerLvl: 40, mpRegen: 8, mpRegenPerLvl: 0.7,
        damage: 70, dmgPerLvl: 5.0, armour: 28, armourPerLvl: 3.8,
        attackSpeed: 0.98, attackSpeedPerLvl: 0.026, range: 2.4, speed: 7.4,
        passive: {
            name: '背刺',
            text: '由目標背後攻擊，多 30% 傷害。',
        },
        abilities: [
            {
                // 刺客唯一嘅機動性放喺八秒冷卻上面，即係佢入到去就出唔返嚟。
                // 實測對基準英雄得 13% 勝率，全場最低——而佢技能總傷害係全場
                // 最高（1087）。唔係打唔痛，係打完返唔到頭。五秒可以係「入去
                // 再出返嚟」，八秒只可以係「入去」。
                key: 'Q', name: '影襲', form: 'dash', cost: 40, cd: 5, range: 8.5,
                damage: [80, 125, 170, 215], adRatio: 0.7,
                text: '向前突進並斬擊沿途第一個敵人。',
            },
            {
                key: 'W', name: '刃舞', form: 'self', cost: 45, cd: 12, duration: 4,
                attackSpeedBonus: [0.35, 0.5, 0.65, 0.8],
                text: '四秒內大幅提升攻擊速度。',
            },
            {
                key: 'E', name: '割喉', form: 'target', cost: 55, cd: 10, range: 3.2,
                damage: [90, 135, 180, 225], adRatio: 0.8, slow: 0.4, slowTime: 1.2,
                text: '對單一目標造成傷害並減速。',
            },
            {
                key: 'R', name: '處決', form: 'target', cost: 100, cd: 70, range: 5,
                damage: [200, 320, 440], adRatio: 1.2, missingHpRatio: 0.5,
                text: '對目標造成傷害，目標生命愈少傷害愈高。',
            },
        ],
    },

    // ---- 輔助：唔靠自己輸出，靠隊友活得耐 ----
    dawnkeeper: {
        id: 'dawnkeeper', name: '曦守', title: '不滅之光', model: 'militia',
        role: '輔助', colour: 0xe8cf6a, difficulty: 2,
        hp: 585, hpPerLvl: 96, hpRegen: 8, hpRegenPerLvl: 0.8,
        mp: 380, mpPerLvl: 52, mpRegen: 10, mpRegenPerLvl: 0.9,
        damage: 58, dmgPerLvl: 3.8, armour: 22, armourPerLvl: 3.1,
        attackSpeed: 0.952, attackSpeedPerLvl: 0.022, range: 8.5, speed: 6.6,
        ap: 0, apPerLvl: 10,
        projectile: 'ember',
        passive: {
            name: '守望',
            text: '附近隊友受到致命傷害時，會先消耗你 8% 最大法力擋一次（30 秒一次）。',
        },
        abilities: [
            {
                // 射程 12 比全場任何人嘅攻擊射程都遠（最遠嘅長弓都只係 9.6），
                // 而佢同時係傷害同治療，七秒一次。即係曦守可以企喺所有人夠唔到
                // 嘅位，一粒掣做兩件事——實測對基準勝率 75%，全場最高。
                // 收返去同第二遠嗰個技能睇齊：仲係全隊嘅消耗手段，但要企埋去先。
                key: 'Q', name: '聖光', form: 'skillshot', cost: 45, cd: 7, range: 9.5,
                speed: 24, width: 1.3, pierce: true,
                damage: [65, 100, 135, 170], apRatio: 0.55, healAlly: [40, 65, 90, 115],
                text: '射出一道光，傷害敵人並治療沿途隊友。',
            },
            {
                key: 'W', name: '庇護', form: 'target', cost: 55, cd: 12, range: 9, allyTarget: true,
                shield: [80, 125, 170, 215], shieldRatio: 0.1, duration: 3,
                text: '為隊友（或自己）套上護盾。',
            },
            {
                key: 'E', name: '曙光衝擊', form: 'aoe', cost: 60, cd: 13, range: 8,
                radius: 3.2, damage: [70, 105, 140, 175], apRatio: 0.5, knockback: 3.5,
                text: '爆發一圈光，造成傷害並將敵人擊退。',
            },
            {
                key: 'R', name: '黎明', form: 'self', cost: 100, cd: 85, radius: 11, duration: 4,
                healPerSec: [55, 85, 115], apRatio: 0.25,
                text: '四秒內持續治療範圍內所有隊友。',
            },
        ],
    },

    // ---- 狂戰士：血愈少打得愈快，同坦克相反——佢用命去換輸出 ----
    ironhulk: {
        id: 'ironhulk', name: '裂斧', title: '一斧開山', model: 'barbarian',
        role: '戰士', colour: 0xc4763f, difficulty: 2,
        hp: 610, hpPerLvl: 100, hpRegen: 8, hpRegenPerLvl: 0.8,
        mp: 260, mpPerLvl: 36, mpRegen: 7, mpRegenPerLvl: 0.6,
        damage: 70, dmgPerLvl: 5.2, armour: 31, armourPerLvl: 3.9,
        attackSpeed: 0.98, attackSpeedPerLvl: 0.024, range: 2.6, speed: 7.1,
        passive: {
            name: '狂性',
            text: '生命低於 40% 時，攻擊速度 +30%——愈殘愈快。',
        },
        abilities: [
            {
                key: 'Q', name: '劈斬', form: 'target', cost: 40, cd: 6, range: 3,
                damage: [80, 120, 160, 200], adRatio: 0.7, knockback: 2.5,
                text: '一斧劈落去，造成傷害並將對手震開。',
            },
            {
                key: 'W', name: '戰吼', form: 'self', cost: 50, cd: 15, duration: 3.5,
                shield: [100, 155, 210, 265], shieldRatio: 0.1,
                text: '大吼一聲逼出護盾，持續三秒半。',
            },
            {
                key: 'E', name: '躍斬', form: 'dash', cost: 60, cd: 14, range: 8,
                damage: [70, 110, 150, 190], adRatio: 0.5, radius: 3, slow: 0.3, slowTime: 1.2,
                text: '躍到指定位置，落地一斧造成範圍傷害同減速。',
            },
            {
                key: 'R', name: '血怒', form: 'self', cost: 100, cd: 80, duration: 6,
                damageBonus: [0.25, 0.4, 0.55], hpBonus: [180, 300, 420],
                text: '六秒內血湧上頭，大幅提升傷害同最大生命。',
            },
        ],
    },
};

export const CHAMPION_IDS = Object.keys(CHAMPIONS);

// 技能等級。大招喺 5／9／12 級升，Q/W/E 由 1 級開始每級加一點，
// 順住 Q→W→E 輪住加，最多 4 級。所以 1 級得 Q、2 級 Q+W、3 級 Q+W+E。
//
// 大招唔可以 1 級就有。呢個檔開頭寫住「大招要係一個時刻，唔係一個大啲嘅 Q」，
// 而舊代碼 level >= 1 就畀 1 級大招——同自己嘅註解直頭相反，亦都令成場波
// 冇咗「等大招」呢個節奏。（舊測試抄咗代碼嘅行為當規格，所以一直冇捉到。）
export function abilityRank(level, index) {
    if (index === 3) return level >= 12 ? 3 : level >= 9 ? 2 : level >= 5 ? 1 : 0;
    // 第 1 級畀 1 點，之後每級再畀 1 點；大招唔食呢啲點數（佢跟等級直接升）
    const points = Math.max(0, level);
    const base = Math.floor(points / 3);
    const extra = points % 3;
    return Math.min(4, base + (index < extra ? 1 : 0));
}

// 取技能喺某等級嘅數值。abilities 入面啲數組係 per-rank。
export function scaled(value, rank) {
    if (!Array.isArray(value)) return value ?? 0;
    return value[Math.max(0, Math.min(value.length - 1, rank - 1))] ?? 0;
}
