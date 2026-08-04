// 裝備。
//
// 點解一定要有：實測未有裝備之前，英雄由 1 級打到 12 級，殺一隻小兵永遠都係
// 七下——小兵每分鐘加嘅血啱啱好抵銷咗升級加嘅傷害。兵線因此永遠斷唔到，
// 贏咗團戰都換唔到塔傷害，六個 bot 打足廿五分鐘一座塔都拆唔冧。
//
// 裝備就係「贏 → 有錢 → 打得快 → 推得郁」呢條因果鏈嘅中間嗰一格。冇咗佢，
// 金幣係一個只入唔出嘅數字，個場波冇任何收斂機制。
//
// 數值原則：一件成品大約值 2.5 個等級。三層價錢 ~400 / ~1250 / ~2800，
// 對得返 GOLD_PER_SEC 3.2 加補刀嘅收入曲線：第一件約 3 分鐘、
// 第二件約 9 分鐘、第三件約 16 分鐘。

// 可加嘅屬性：ad 攻擊力｜ap 法強｜hp 生命｜armour 護甲
//             attackSpeed 攻速（乘數）｜speed 移速（乘數）｜lifesteal 吸血
//             hpRegen 每五秒回血
export const ITEMS = {
    // ---- 第一層：出門貨 ----
    longsword: { id: 'longsword', name: '長劍', tier: 1, cost: 400, ad: 18, text: '+18 攻擊力' },
    amplifier: { id: 'amplifier', name: '增幅法杖', tier: 1, cost: 420, ap: 26, text: '+26 法強' },
    chainmail: { id: 'chainmail', name: '鎖子甲', tier: 1, cost: 400, armour: 30, text: '+30 護甲' },
    rubystone: { id: 'rubystone', name: '紅玉石', tier: 1, cost: 400, hp: 190, text: '+190 生命' },
    dagger: { id: 'dagger', name: '短匕', tier: 1, cost: 350, attackSpeed: 0.18, text: '+18% 攻速' },
    sandals: { id: 'sandals', name: '旅人涼鞋', tier: 1, cost: 330, speed: 0.12, text: '+12% 移速' },

    // ---- 第二層：中期成品 ----
    greatsword: {
        id: 'greatsword', name: '巨劍', tier: 2, cost: 1250, ad: 45, attackSpeed: 0.12,
        text: '+45 攻擊力、+12% 攻速',
    },
    grimoire: {
        id: 'grimoire', name: '秘典', tier: 2, cost: 1250, ap: 72, hp: 150,
        text: '+72 法強、+150 生命',
    },
    bulwark: {
        id: 'bulwark', name: '堡壘鎧', tier: 2, cost: 1200, armour: 55, hp: 260,
        text: '+55 護甲、+260 生命',
    },
    titanbelt: {
        id: 'titanbelt', name: '巨人腰帶', tier: 2, cost: 1150, hp: 480, hpRegen: 12,
        text: '+480 生命、+12 回血',
    },
    lifeblade: {
        id: 'lifeblade', name: '吸血刃', tier: 2, cost: 1300, ad: 32, lifesteal: 0.14,
        text: '+32 攻擊力、14% 吸血',
    },
    swiftboots: {
        id: 'swiftboots', name: '疾風靴', tier: 2, cost: 900, speed: 0.22, attackSpeed: 0.10,
        text: '+22% 移速、+10% 攻速',
    },

    // ---- 第三層：大件 ----
    ruinblade: {
        id: 'ruinblade', name: '破軍', tier: 3, cost: 2800, ad: 82, attackSpeed: 0.18, speed: 0.06,
        text: '+82 攻擊力、+18% 攻速、+6% 移速',
    },
    abysscodex: {
        id: 'abysscodex', name: '深淵法典', tier: 3, cost: 2800, ap: 135, hp: 300,
        text: '+135 法強、+300 生命',
    },
    aegis: {
        id: 'aegis', name: '不朽壁壘', tier: 3, cost: 2700, armour: 92, hp: 620, hpRegen: 10,
        text: '+92 護甲、+620 生命、+10 回血',
    },
    bloodfury: {
        id: 'bloodfury', name: '血怒', tier: 3, cost: 2900, ad: 58, hp: 380, lifesteal: 0.20,
        text: '+58 攻擊力、+380 生命、20% 吸血',
    },
};

export const MAX_ITEMS = 6;

// 加總：所有裝備效果喺呢度砌成一個 bonus 物件，sim.stats() 直接攞嚟用。
// 乘數類（攻速／移速／吸血）用相加，唔用相乘——玩家心入面計得掂條數，
// 而且唔會出現堆三件靴變成三倍速呢種爆炸。
export function itemBonus(ids) {
    const b = { ad: 0, ap: 0, hp: 0, armour: 0, attackSpeed: 0, speed: 0, lifesteal: 0, hpRegen: 0 };
    for (const id of ids) {
        const it = ITEMS[id];
        if (!it) continue;
        for (const k of Object.keys(b)) b[k] += it[k] ?? 0;
    }
    return b;
}

// 每個英雄嘅出裝順序。bot 照住買，玩家可以自己揀。
// 順序反映角色定位：坦克先出防具、射手先出攻速、法師先出法強。
export const BUILDS = {
    ironward: ['chainmail', 'bulwark', 'rubystone', 'aegis', 'titanbelt', 'ruinblade'],
    longshot: ['dagger', 'greatsword', 'sandals', 'ruinblade', 'lifeblade', 'bloodfury'],
    emberwake: ['amplifier', 'grimoire', 'sandals', 'abysscodex', 'rubystone', 'grimoire'],
    duskblade: ['longsword', 'lifeblade', 'sandals', 'bloodfury', 'ruinblade', 'greatsword'],
    dawnkeeper: ['rubystone', 'swiftboots', 'grimoire', 'aegis', 'titanbelt', 'abysscodex'],
    ironhulk: ['rubystone', 'titanbelt', 'chainmail', 'bloodfury', 'aegis', 'greatsword'],
};

// bot 買嘢：喺自己出裝表入面，買最前面嗰件而家買得起嘅。
//
// 之前係「望到第一件未有嘅，買唔起就唔買」，理由係「儲錢買大件，好過堆
// 一堆細嘢」。個理由本身啱，但實測落去，儲錢嗰段時間食咗成場波：
// 十二場、每秒抽一次樣，**74.4% 嘅時間**英雄袋住夠錢買嘢（平均 1122 金）
// 而出裝表唔畀佢買任何嘢；全場平均袋住 880 金。即係差唔多三件平貨嘅戰力，
// 四分三時間躺喺銀行。而且一整套裝平均 8502 金，一場波每人只賺到 4191，
// 最叻嗰個 7654——七十二個人次入面冇一個買得起成套，所以「儲落去總會買到」
// 呢個前提由頭到尾唔成立。
//
// 而家買唔起就望下一件，但只喺**自己出裝表入面**望。最終買到嘅係同一套嘢，
// 只係次序讓路畀買得起——唔會變成堆一堆表外嘅雜貨。
export function nextPurchase(champId, owned, gold) {
    const build = BUILDS[champId] ?? BUILDS.ironward;
    if (owned.length >= MAX_ITEMS) return null;
    const counts = new Map();
    for (const id of owned) counts.set(id, (counts.get(id) ?? 0) + 1);
    for (const id of build) {
        const have = counts.get(id) ?? 0;
        const want = build.filter(x => x === id).length;
        if (have >= want) continue;
        if (gold >= ITEMS[id].cost) return id;
    }
    return null;
}
