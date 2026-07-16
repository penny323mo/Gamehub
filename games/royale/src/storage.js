// 進度存檔 — localStorage：獎盃/段位、卡牌等級碎片、每日挑戰、生涯統計、卡組、連勝挑戰
import { CARD_POOL, DEFAULT_DECK } from './cards.js';

const KEY = 'royale-save-v1';

// ---------- 段位 ----------
export const RANKS = [
    { name: '木盾見習', icon: '🪵', min: 0 },
    { name: '銅劍士', icon: '🗡️', min: 100 },
    { name: '銀騎士', icon: '🛡️', min: 260 },
    { name: '金冠將軍', icon: '👑', min: 480 },
    { name: '帝國皇者', icon: '🏆', min: 780 },
];

export function rankOf(trophies) {
    let r = RANKS[0];
    for (const rank of RANKS) if (trophies >= rank.min) r = rank;
    return r;
}

export function nextRank(trophies) {
    for (const rank of RANKS) if (trophies < rank.min) return rank;
    return null;
}

// ---------- 卡牌升級所需碎片（升到下一級）----------
export const SHARDS_PER_LEVEL = [0, 10, 20, 35, 55]; // index = 現時等級
export const MAX_LEVEL = 5;
export const LEVEL_BONUS = 0.08; // 每級 +8% HP/傷害

export function levelMultiplier(level) {
    return 1 + LEVEL_BONUS * ((level ?? 1) - 1);
}

// ---------- 每日挑戰池 ----------
// check(stats) 喺場終結算時用 matchStats 判斷有冇達成
const CHALLENGE_POOL = [
    { id: 'win1', desc: '贏一場對戰', check: s => s.win },
    { id: 'winHard', desc: '喺困難難度贏一場', check: s => s.win && s.difficulty === 'hard' },
    { id: 'threeCrown', desc: '攞一次 3 皇冠完勝', check: s => s.win && s.crowns >= 3 },
    { id: 'towers2', desc: '單場拆走 2 座或以上城塔', check: s => s.towersDestroyed >= 2 },
    { id: 'spellHit4', desc: '一發法術命中 4 個以上敵兵', check: s => s.bestSpellHit >= 4 },
    { id: 'cards14', desc: '一場內出 14 張或以上卡', check: s => s.cardsPlayed >= 14 },
    { id: 'winElephant', desc: '卡組帶住戰象贏一場', check: s => s.win && s.deck.includes('elephant') },
    { id: 'winCheap', desc: '用平均費用 ≤3.5 嘅卡組贏一場', check: s => s.win && s.avgCost <= 3.5 },
    { id: 'gauntlet2', desc: '連勝挑戰闖到第 2 關或以上', check: s => s.gauntletStage >= 2 },
];

const CHALLENGE_REWARD = 8; // 完成一個挑戰送幾多碎片

// 用日期做 seed，全 client 決定當日三個挑戰
function dailyChallengeIds(dateStr) {
    let h = 0;
    for (const ch of dateStr) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const ids = [];
    const pool = [...CHALLENGE_POOL];
    for (let i = 0; i < 3 && pool.length; i++) {
        h = (h * 1103515245 + 12345) >>> 0;
        ids.push(pool.splice(h % pool.length, 1)[0].id);
    }
    return ids;
}

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ---------- 存檔本體 ----------
function defaultSave() {
    return {
        trophies: 0,
        wins: 0, losses: 0, draws: 0,
        streak: 0, bestStreak: 0,
        fastestThreeCrown: null, // 秒
        cardLevels: {},          // id -> { level, shards }
        decks: [
            { name: '卡組 1', cards: [...DEFAULT_DECK] },
            { name: '卡組 2', cards: [] },
            { name: '卡組 3', cards: [] },
        ],
        activeDeck: 0,
        daily: { date: '', done: {} }, // done: challengeId -> true
        gauntletBest: 0,
    };
}

let save = null;

export function loadSave() {
    if (!save) {
        try {
            const raw = localStorage.getItem(KEY);
            save = raw ? { ...defaultSave(), ...JSON.parse(raw) } : defaultSave();
        } catch {
            save = defaultSave();
        }
        // 淨係 JSON.parse 唔會爆唔代表結構啱：舊版本／畀人改過嘅存檔可能
        // daily=null、decks 唔夠 3 個、cardLevels 唔係 object……逐個 key 驗返，
        // 壞邊瓣補邊瓣（唔好成份存檔重置，保得幾多保幾多）
        const def = defaultSave();
        if (!save.daily || typeof save.daily !== 'object') save.daily = def.daily;
        if (typeof save.daily.done !== 'object' || save.daily.done === null) save.daily.done = {};
        if (!Array.isArray(save.decks) || save.decks.length < def.decks.length) save.decks = def.decks;
        for (let i = 0; i < save.decks.length; i++) {
            if (!save.decks[i] || !Array.isArray(save.decks[i].cards)) save.decks[i] = def.decks[i] ?? { name: `卡組 ${i + 1}`, cards: [] };
        }
        if (typeof save.activeDeck !== 'number' || save.activeDeck < 0 || save.activeDeck >= save.decks.length) save.activeDeck = 0;
        if (!save.cardLevels || typeof save.cardLevels !== 'object') save.cardLevels = def.cardLevels;
    }
    // 每日挑戰過咗夜就重置——放喺 cache 命中之後都要檢查，
    // 唔係個 tab 開過夜就會一直計落尋日嗰批挑戰度
    const today = todayStr();
    if (save.daily.date !== today) {
        save.daily = { date: today, done: {} };
        persist();
    }
    return save;
}

function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* private mode 都照玩 */ }
}

// ---------- 讀取 helpers ----------
export function cardLevel(id) {
    loadSave();
    return save.cardLevels[id]?.level ?? 1;
}

export function cardShards(id) {
    loadSave();
    return save.cardLevels[id]?.shards ?? 0;
}

export function playerLevels() {
    loadSave();
    const levels = {};
    for (const id of CARD_POOL) levels[id] = cardLevel(id);
    return levels;
}

export function avgDeckLevel(deck) {
    if (!deck.length) return 1;
    return deck.reduce((s, id) => s + cardLevel(id), 0) / deck.length;
}

export function getDailyChallenges() {
    loadSave();
    const ids = dailyChallengeIds(save.daily.date || todayStr());
    return ids.map(id => {
        const c = CHALLENGE_POOL.find(x => x.id === id);
        return { id, desc: c.desc, done: !!save.daily.done[id] };
    });
}

export function getDecks() {
    loadSave();
    return save.decks;
}

export function setDeck(idx, cards) {
    loadSave();
    save.decks[idx].cards = [...cards];
    persist();
}

export function getActiveDeck() {
    loadSave();
    return save.activeDeck;
}

export function setActiveDeck(idx) {
    loadSave();
    save.activeDeck = idx;
    persist();
}

export function getStats() {
    loadSave();
    return {
        trophies: save.trophies,
        rank: rankOf(save.trophies),
        next: nextRank(save.trophies),
        wins: save.wins, losses: save.losses, draws: save.draws,
        streak: save.streak, bestStreak: save.bestStreak,
        fastestThreeCrown: save.fastestThreeCrown,
        gauntletBest: save.gauntletBest,
    };
}

// ---------- 場終結算 ----------
const TROPHY_DELTA = {
    easy: { win: 15, loss: -8, draw: 3 },
    normal: { win: 30, loss: -14, draw: 5 },
    hard: { win: 45, loss: -18, draw: 8 },
    pvp: { win: 40, loss: -20, draw: 8 }, // 打真人贏輸都計多啲，夠刺激
};

function grantShards(id, n) {
    if (!save.cardLevels[id]) save.cardLevels[id] = { level: 1, shards: 0 };
    const cl = save.cardLevels[id];
    if (cl.level >= MAX_LEVEL) return { id, n, leveledUp: false, level: cl.level };
    cl.shards += n;
    let leveledUp = false;
    while (cl.level < MAX_LEVEL && cl.shards >= SHARDS_PER_LEVEL[cl.level]) {
        cl.shards -= SHARDS_PER_LEVEL[cl.level];
        cl.level += 1;
        leveledUp = true;
    }
    return { id, n, leveledUp, level: cl.level };
}

// matchStats: { win, draw, difficulty, crowns, towersDestroyed, bestSpellHit,
//               cardsPlayed, deck, avgCost, matchSeconds, gauntletStage }
export function recordMatch(stats) {
    loadSave();
    const oldRank = rankOf(save.trophies);
    const delta = stats.gauntletStage
        ? (stats.win ? 20 + stats.gauntletStage * 5 : 0) // 連勝挑戰：只加唔減
        : (TROPHY_DELTA[stats.difficulty] ?? TROPHY_DELTA.normal)[stats.win ? 'win' : stats.draw ? 'draw' : 'loss'];
    save.trophies = Math.max(0, save.trophies + delta);
    const newRank = rankOf(save.trophies);

    if (stats.win) {
        save.wins += 1;
        save.streak += 1;
        save.bestStreak = Math.max(save.bestStreak, save.streak);
        if (stats.crowns >= 3 && (save.fastestThreeCrown === null || stats.matchSeconds < save.fastestThreeCrown)) {
            save.fastestThreeCrown = Math.round(stats.matchSeconds);
        }
    } else if (stats.draw) {
        save.draws += 1;
    } else {
        save.losses += 1;
        save.streak = 0;
    }
    if (stats.gauntletStage) {
        save.gauntletBest = Math.max(save.gauntletBest, stats.gauntletStage - (stats.win ? 0 : 1));
    }

    // 碎片：贏 2 張、輸/和 1 張（喺自己卡組入面隨機抽）
    const shardGains = [];
    const nDrops = stats.win ? 2 : 1;
    for (let i = 0; i < nDrops; i++) {
        const id = stats.deck[Math.floor(Math.random() * stats.deck.length)];
        shardGains.push(grantShards(id, 2 + Math.floor(Math.random() * 3))); // 每張 2-4 碎片
    }

    // 每日挑戰
    const challengesDone = [];
    const ids = dailyChallengeIds(save.daily.date);
    for (const id of ids) {
        if (save.daily.done[id]) continue;
        const c = CHALLENGE_POOL.find(x => x.id === id);
        if (c.check(stats)) {
            save.daily.done[id] = true;
            const bonusId = stats.deck[Math.floor(Math.random() * stats.deck.length)];
            const g = grantShards(bonusId, CHALLENGE_REWARD);
            challengesDone.push({ id, desc: c.desc, reward: g });
        }
    }

    persist();
    return {
        trophyDelta: delta,
        trophies: save.trophies,
        rank: newRank,
        rankUp: newRank !== oldRank && save.trophies >= newRank.min && newRank.min > oldRank.min,
        shardGains,
        challengesDone,
        streak: save.streak,
    };
}
