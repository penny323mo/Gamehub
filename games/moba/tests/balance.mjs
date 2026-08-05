// 英雄平衡量度。**唔屬於快速套件**：跑一次大約兩分鐘，因為要打幾十場完整
// 對局，而勝率呢樣嘢冇捷徑——睇數值表估唔到，一定要打。
//
// 跑法：node games/moba/tests/balance.mjs [每個英雄幾多場]
//
// 方法：兩邊都係 [X, longshot, ironhulk]，只換第一個，基準係 ironward。
//
// **陷阱（親身踩過）**：基準同兩個陪跑係把尺本身。改佢哋三個任何一個嘅數值，
// 就等於一邊量一邊改把尺，前後兩次嘅數字就唔可以直接比。實測：畀鐵魁（陪跑）
// 加護甲之後，差幅由 34 點跳到 66 點，而變化最大嘅係完全冇改過嘅曦守
// （63% → 83%）——因為成個對局變成近戰密集，治療就值錢咗。
// 每次量度入面嘅「差幅」本身仍然有效（六個都對住同一個背景），但要比較兩次
// 量度，就要確保 ironward／longshot／ironhulk 三個數值冇動過。
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
    let w = 0, l = 0, d = 0, 分鐘 = 0, 死 = 0;
    for (let seed = 1; seed <= SEEDS; seed++) {
        const 揸藍 = seed % 2 === 1;
        const A = [c, ...陪跑], B = [基準, ...陪跑];
        const sim = new Sim({ seed, lineups: 揸藍
            ? { [TEAM.BLUE]: A, [TEAM.RED]: B } : { [TEAM.BLUE]: B, [TEAM.RED]: A } });
        const bots = sim.champions.map(x => createBot(sim, x));
        const 我 = sim.champions.find(x => x.champId === c && x.team === (揸藍 ? TEAM.BLUE : TEAM.RED));
        let t = 0;
        while (!sim.over && sim.time < GAME_MAX) { updateBots(bots, TICK, t); sim.step(TICK); t++; }
        分鐘 += sim.time / 60;
        死 += 我.deaths;
        const win = sim.over?.winner, 我隊 = 揸藍 ? TEAM.BLUE : TEAM.RED;
        if (win == null) d++; else if (win === 我隊) w++; else l++;
    }
    結果.push({ 英雄: c, 勝: w, 負: l, 和: d, 勝率: Math.round(w / SEEDS * 100),
        平均分鐘: +(分鐘 / SEEDS).toFixed(1), 每分鐘死: +(死 / 分鐘).toFixed(2) });
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
// 兩條檢查都要行完先退出。原本勝率條線一肥就即刻 process.exit(1)，
// 而死亡頻率條線寫喺後面——即係一個同時整爛兩樣嘅改動，只會報第一樣，
// 而第二樣睇落好似冇事。一條會遮住另一條嘅 gate，等於少咗一條。
// （實測撞到：`hpPct < 0.32` 唔退嗰個突變，勝率報 duskblade 8% 就收工，
//   而佢嘅死亡頻率 1.26 一樣過咗界，只係永遠冇機會講。）
const 肥 = [];
if (過火.length) 肥.push('超出 20–85% 嘅：' + 過火.map(r => `${r.英雄} ${r.勝率}%`).join('、'));
else console.log('六個英雄都喺 20–85% 之內');

// 死亡頻率：玩家真正感受到嘅「幾密㩒乜都冇反應」。sim.mjs T40 守單次鎖幾耐
// 同一局幾長，但守唔到呢個——三局分唔清 0.87 同 0.90，而真變化係 0.79 對
// 1.04（ADR-141）。要 24 局先分得清，所以擺喺呢度。
//
// 呢個數同勝率係兩件事：一個英雄可以贏得夠，但成局都喺度死同行路。實測
// 重生時間減短完全冇改善總冇得玩時間（150 對 151 秒），因為死一次短咗
// 三成半，一局就死多三成——個掣係呢度，唔係計時器。
const 密 = 結果.map(r => r.每分鐘死);
console.log(`每分鐘死：${Math.min(...密).toFixed(2)} – ${Math.max(...密).toFixed(2)}`);
const 太密 = 結果.filter(r => r.每分鐘死 > 1.05);
if (太密.length) 肥.push('死得太密（一分鐘過 1.05 次）：' + 太密.map(r => `${r.英雄} ${r.每分鐘死}`).join('、'));

if (肥.length) { for (const m of 肥) console.log(m); process.exit(1); }
