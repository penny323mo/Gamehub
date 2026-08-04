// 英雄平衡量度。**唔屬於快速套件**：跑一次大約兩分鐘，因為要打幾十場完整
// 對局，而勝率呢樣嘢冇捷徑——睇數值表估唔到，一定要打。
//
// 跑法：node games/moba/tests/balance.mjs [每個英雄幾多場]
//
// 方法：兩邊都係 [X, longshot, ironhulk]，只換第一個，基準係 ironward。
// 一半種子揸藍、一半揸紅，抵消任何殘餘邊路偏差（ADR-113 修咗更新次序，
// 而鏡像陣容四十場實測 22/18、17/23，所以邊路本身係公平嘅）。
//
// 點解要有呢個檔：ADR-130 之前，六個英雄對基準嘅勝率由 17% 到 83%。
// 隨機分隊之下，好多局喺分隊嗰一刻就已經決定咗。快速套件量唔到呢件事——
// T13 只問「兩邊都贏過」，而兩邊都贏過同兩邊有得打係兩回事。
import { Sim } from '../src/sim.js';
import { createBot, updateBots } from '../src/ai.js';
import { TICK, GAME_MAX, TEAM } from '../src/constants.js';
import { CHAMPION_IDS } from '../src/champions.js';

const SEEDS = Number(process.argv[2] ?? 24);
const 基準 = 'ironward';
const 陪跑 = ['longshot', 'ironhulk'];
const t0 = Date.now();
const 結果 = [];
for (const c of CHAMPION_IDS) {
    let w = 0, l = 0, d = 0, 分鐘 = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
        const 揸藍 = seed % 2 === 1;
        const A = [c, ...陪跑], B = [基準, ...陪跑];
        const sim = new Sim({ seed, lineups: 揸藍
            ? { [TEAM.BLUE]: A, [TEAM.RED]: B } : { [TEAM.BLUE]: B, [TEAM.RED]: A } });
        const bots = sim.champions.map(x => createBot(sim, x));
        let t = 0;
        while (!sim.over && sim.time < GAME_MAX) { updateBots(bots, TICK, t); sim.step(TICK); t++; }
        分鐘 += sim.time / 60;
        const win = sim.over?.winner, 我隊 = 揸藍 ? TEAM.BLUE : TEAM.RED;
        if (win == null) d++; else if (win === 我隊) w++; else l++;
    }
    結果.push({ 英雄: c, 勝: w, 負: l, 和: d, 勝率: Math.round(w / SEEDS * 100),
        平均分鐘: +(分鐘 / SEEDS).toFixed(1) });
}
console.table(結果);
const 率 = 結果.map(r => r.勝率);
const 幅 = Math.max(...率) - Math.min(...率);
// 二十四場嘅九成半信賴區間大約 ±17 個百分點，所以呢度分得清 29 同 75，
// 但分唔清 46 同 54。條線劃喺 20/85 就係因為咁——再窄就係喺噪音上面劃線。
const 過火 = 結果.filter(r => r.勝率 < 20 || r.勝率 > 85);
console.log(`\n差幅 ${幅} 個百分點，用咗 ${((Date.now() - t0) / 1000).toFixed(0)} 秒`);
// 樣本唔夠就唔好扮判斷。實測八場嗰陣，連基準英雄自己都由 46% 跳到 63%，
// 而 emberwake 由 38% 跳到 13%——用嗰啲數去改平衡，係喺噪音上面改。
if (SEEDS < 24) {
    console.log(`得 ${SEEDS} 場，樣本太細，唔落判斷（要 24 場或以上）`);
    process.exit(0);
}
if (過火.length) {
    console.log('超出 20–85% 嘅：', 過火.map(r => `${r.英雄} ${r.勝率}%`).join('、'));
    process.exit(1);
}
console.log('六個英雄都喺 20–85% 之內');
