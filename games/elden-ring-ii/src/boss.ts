// Boss 出招嘅規則：一條純函數加佢啲常數。
//
// 呢個檔冇 three.js 冇 cannon-es 冇 JSX，所以喺 Node 度直接量得到。抽出嚟嘅
// 原因同 `motion.ts`／`chase.ts` 一樣，但呢次仲加多一個：條規則本身有一個
// **遊戲永遠餵唔到嘅分支**，而住喺 `GameClient.tsx` 入面就淨係得瀏覽器測到。

// Boss 埋到幾近就唔再行、開始出手。
export const BOSS_REACH = 3.15;
export const LEAP_MIN_RANGE = 6.5;
// 撲擊嘅**上限**。冇上限就會由六十米外撲埋嚟——飛行段係
// `位移 ÷ 剩返嘅前搖`，即係距離越遠飛得越癲。0.78 秒飛 11 米大約 14 米／秒，
// 一隻大嘢撲一下嘅速度，而且個預警圈畀足 0.78 秒你行開。
export const LEAP_MAX_RANGE = 11;
// 撲擊本來寫住 `phase === 2 && …`。實測：**boss 換第二階段嗰刻同玩家嘅距離
// 係 6.0 米**，而撲擊要 6.5 米以上——即係佢一入第二階段就已經企咗入嚟，個
// 「第二階段先有嘅招」永遠等唔到自己嘅距離。一個埋身手段淨係喺已經埋咗身
// 之後先開放，等於冇。兩個階段都撲得，但第二階段撲得密好多。
export type BossMove = "punch" | "leap";
// `見到落點` 一日冇，boss 就會撲向一個佢去唔到嘅位——實測第二階段嘅撲擊組合
// 入面 **32.8% 中間有嘢擋住**（未修走廊牆之前係 56.6%）。撲擊嘅預警圈畫喺
// 落點，而傷害亦都由落點度起，所以撲向柱後面唔止撞埋去咁簡單：個圈畫咗喺你
// 過唔到嘅地方，而隻怪就卡喺柱前面。見唔到就打拳。
export const chooseBossMove = (
  phase: 1 | 2,
  distance: number,
  roll: number,
  見到落點 = true,
): BossMove =>
  distance > LEAP_MIN_RANGE && distance <= LEAP_MAX_RANGE
    && roll < (phase === 2 ? 0.55 : 0.3) && 見到落點 ? "leap" : "punch";
