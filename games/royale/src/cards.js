// 卡牌數據 — 帝國時代風格中世紀兵種
// kind: 'unit' 出兵 | 'spell' 法術 | 'building' 建築
// speed: 單位/秒；range <= 0.9 視為近戰；hitSpeed: 每次攻擊間隔（秒）

export const CARDS = {
    militia: {
        id: 'militia', kind: 'unit', name: '民兵', icon: '🗡️', cost: 2,
        desc: '3 個平價快腳近戰，圍毆一流',
        count: 3, hp: 100, dmg: 38, hitSpeed: 1.1, range: 0.5,
        speed: 2.6, sight: 5.0, radius: 0.32,
    },
    swordsman: {
        id: 'swordsman', kind: 'unit', name: '長劍士', icon: '⚔️', cost: 3,
        desc: '堅實近戰步兵，攻守兼備',
        count: 1, hp: 720, dmg: 115, hitSpeed: 1.2, range: 0.6,
        speed: 1.7, sight: 5.0, radius: 0.42,
    },
    archers: {
        id: 'archers', kind: 'unit', name: '弓箭手', icon: '🏹', cost: 3,
        desc: '2 個遠程射手，後排輸出',
        count: 2, hp: 140, dmg: 48, hitSpeed: 1.0, range: 5.5,
        speed: 1.7, sight: 6.5, radius: 0.32, projectile: 'arrow',
    },
    pikemen: {
        id: 'pikemen', kind: 'unit', name: '長槍兵', icon: '🔱', cost: 3,
        desc: '3 個長槍兵，剋制大型單位',
        count: 3, hp: 190, dmg: 78, hitSpeed: 1.6, range: 0.9,
        speed: 1.7, sight: 5.0, radius: 0.34,
    },
    knight: {
        id: 'knight', kind: 'unit', name: '騎士', icon: '🐎', cost: 4,
        desc: '重騎兵，快而狠',
        count: 1, hp: 780, dmg: 165, hitSpeed: 1.4, range: 0.7,
        speed: 2.4, sight: 5.5, radius: 0.5,
    },
    ram: {
        id: 'ram', kind: 'unit', name: '攻城槌', icon: '🪵', cost: 4,
        desc: '只攻擊建築，直搗黃龍',
        count: 1, hp: 950, dmg: 230, hitSpeed: 1.7, range: 0.8,
        speed: 2.2, sight: 5.5, radius: 0.55, targetsBuildingsOnly: true,
    },
    handcannon: {
        id: 'handcannon', kind: 'unit', name: '火槍兵', icon: '💥', cost: 5,
        desc: '單發高傷遠程，射程極遠',
        count: 1, hp: 260, dmg: 190, hitSpeed: 1.8, range: 6.5,
        speed: 1.5, sight: 7.5, radius: 0.36, projectile: 'bullet',
    },
    catapult: {
        id: 'catapult', kind: 'unit', name: '投石車', icon: '🪨', cost: 5,
        desc: '超遠程範圍攻擊，攻城利器',
        count: 1, hp: 380, dmg: 140, hitSpeed: 2.6, range: 8.5,
        speed: 1.0, sight: 9.0, radius: 0.6, projectile: 'stone', splash: 1.8,
    },
    elephant: {
        id: 'elephant', kind: 'unit', name: '戰象', icon: '🐘', cost: 7,
        desc: '巨型坦克，血厚力大',
        count: 1, hp: 2700, dmg: 210, hitSpeed: 1.7, range: 0.9,
        speed: 1.2, sight: 5.5, radius: 0.75,
    },
    fireball: {
        id: 'fireball', kind: 'spell', name: '火球', icon: '🔥', cost: 4,
        desc: '中範圍高傷害法術',
        dmg: 360, splash: 1.9, castDelay: 0.6,
    },
    arrows: {
        id: 'arrows', kind: 'spell', name: '箭雨', icon: '🎯', cost: 3,
        desc: '大範圍小傷害，清兵海必備',
        dmg: 135, splash: 3.0, castDelay: 0.5,
    },
    watchtower: {
        id: 'watchtower', kind: 'building', name: '哨塔', icon: '🏰', cost: 4,
        desc: '防禦箭塔，30 秒後倒塌',
        hp: 720, dmg: 62, hitSpeed: 0.9, range: 6.5,
        lifetime: 30, radius: 0.7, projectile: 'arrow',
    },
    scout: {
        id: 'scout', kind: 'unit', name: '斥候輕騎', icon: '🐴', cost: 2,
        desc: '極速單騎，搶時間引火力',
        count: 1, hp: 380, dmg: 72, hitSpeed: 0.9, range: 0.6,
        speed: 3.4, sight: 5.5, radius: 0.42,
    },
    berserker: {
        id: 'berserker', kind: 'unit', name: '狂戰士', icon: '🪓', cost: 4,
        desc: '血愈少斬愈快，高風險高回報',
        count: 1, hp: 640, dmg: 108, hitSpeed: 1.3, range: 0.6,
        speed: 2.0, sight: 5.0, radius: 0.42, berserk: true,
    },
    freeze: {
        id: 'freeze', kind: 'spell', name: '冰凍術', icon: '❄️', cost: 3,
        desc: '範圍冰封 4 秒，大幅減速',
        dmg: 40, splash: 2.3, castDelay: 0.4, slow: { factor: 0.25, dur: 4 },
    },
    powderkeg: {
        id: 'powderkeg', kind: 'spell', name: '炸藥桶', icon: '🧨', cost: 2,
        desc: '細範圍即爆，平價清兵',
        dmg: 210, splash: 1.3, castDelay: 0.45,
    },
    ballista: {
        id: 'ballista', kind: 'building', name: '巨弩塔', icon: '🎯', cost: 5,
        desc: '超遠程單體重擊，35 秒',
        hp: 850, dmg: 215, hitSpeed: 2.0, range: 7.5,
        lifetime: 35, radius: 0.7, projectile: 'bolt',
    },
    mill: {
        id: 'mill', kind: 'building', name: '聖水磨坊', icon: '⚗️', cost: 5,
        desc: '每 5 秒產 1 滴聖水，60 秒（總共回本 +7）',
        hp: 500, dmg: 0, hitSpeed: 999, range: 0,
        lifetime: 60, radius: 0.65, elixirGen: { interval: 5, amount: 1 },
    },
};

export const CARD_POOL = Object.keys(CARDS);

export const DEFAULT_DECK = [
    'militia', 'archers', 'swordsman', 'knight',
    'ram', 'fireball', 'arrows', 'elephant',
];

// 隨機砌一副合理嘅 AI 卡組：至少 1 法術、1 坦克/攻城、1 遠程
export function randomDeck() {
    const spells = ['fireball', 'arrows', 'freeze', 'powderkeg'];
    const heavies = ['elephant', 'ram', 'knight', 'berserker'];
    const ranged = ['archers', 'handcannon', 'catapult'];
    const deck = new Set();
    deck.add(spells[Math.floor(Math.random() * spells.length)]);
    deck.add(heavies[Math.floor(Math.random() * heavies.length)]);
    deck.add(ranged[Math.floor(Math.random() * ranged.length)]);
    const rest = CARD_POOL.filter(id => !deck.has(id));
    while (deck.size < 8) {
        const i = Math.floor(Math.random() * rest.length);
        deck.add(rest.splice(i, 1)[0]);
    }
    return [...deck];
}

export function isMelee(card) {
    return card.range <= 0.9;
}
