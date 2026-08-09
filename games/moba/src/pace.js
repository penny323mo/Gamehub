// 一幀應該行幾多格 sim，同埋畫面應該畫喺兩格之間邊個位置。
//
// 點解要獨立成一個檔：呢條規則有三個消費者，而三個都會出錯得好靜。
//   一、sim 行幾多格 —— 上限太鬆會喺卡機之後爆一串快進，太緊會永遠追唔返；
//   二、剩低幾多時間留喺 acc —— 呢個係一個只會被扣、唔會被夾嘅池，
//       正正係 ADR-117 講嗰種「冇人講明邊個負責清」嘅數；
//   三、畫面用邊個 alpha 內插 —— 冇呢個數，喺 120 Hz 螢幕上面畫面
//       一秒只會郁三十次（實測四幀之中得一幀有郁，每次跳 0.217 米）。
// 三樣都由 main.js 嘅 frame() 順手做嘅時候，冇一樣寫得低、冇一樣驗得到。
// 而家一個純函數答晒，headless 就試得。
//
// 內插係「畫返上一格同今格之間」，唔係向前推算。代價係畫面永遠遲一格
// （33 毫秒），換返嚟嘅係任何幀率之下都順。向前推算冇呢個延遲，但估錯
// 方向嗰陣會拉扯——一隻啱啱轉向嘅角色會彈一彈，而 MOBA 成日轉向。

import { TICK } from './constants.js?v=assets-29';

// 一幀最多追幾多格。六格 = 0.2 秒遊戲時間；再多，卡機之後嗰串快進就會
// 長到肉眼見到成場飛咗過去。
export const MAX_STEPS = 6;

// 一幀最多當幾多秒。切後台返嚟嗰一幀，raw dt 可以係三十秒；冇呢個夾就會
// 想追三十秒，而追唔到——所以直接當佢係一次卡頓，唔補鑊。
//
// 呢個數係由 MAX_STEPS 推出嚟，唔可以獨立寫。原本兩個數各寫各嘅：dt 夾
// 0.25 秒，但六格只食得 0.2 秒——即係最卡嗰啲幀，每一幀都靜靜雞欠低 0.05
// 秒，而個 dt 夾嘅原意本來就係「呢啲時間唔補」。同一條政策嘅兩半各自講一
// 套，而冇一半知道另一半存在。
export const MAX_FRAME = MAX_STEPS * TICK;

/**
 * @param {number} acc  上一幀剩低嘅時間
 * @param {number} dt   今幀嘅真實秒數（未夾）
 * @returns {{steps:number, acc:number, alpha:number, dropped:number}}
 *   steps  今幀要行幾多格 sim
 *   acc    行完之後剩低幾多（一定喺 [0, TICK)）
 *   alpha  畫面內插系數，0 = 畫上一格，1 = 畫今格
 *   dropped 因為撞上限而丟低咗幾多秒遊戲時間
 */
export function planFrame(acc, dt) {
    const clamped = Math.min(MAX_FRAME, Math.max(0, dt));
    let left = acc + clamped;
    let steps = 0;
    while (left >= TICK && steps < MAX_STEPS) { left -= TICK; steps++; }
    // 撞上限之後，剩低嘅唔可以留喺池入面。留住嘅話，機一順返，之後每一幀
    // 都會繼續行足六格去還債——即係卡完之後全場快進，而債幾時還完取決於
    // 卡咗幾耐。呢個池只有喺呢度先有人夾得住佢。
    // dropped 要包埋 MAX_FRAME 夾走嗰截。淨係報第二截嘅話，切後台三十秒
    // 會報「一秒都冇丟低」——一個只講自己嗰半嘅數，比冇呢個數更加誤導。
    let dropped = Math.max(0, dt) - clamped;
    if (left >= TICK) { dropped += left - (TICK - 1e-9); left = TICK - 1e-9; }
    return { steps, acc: left, alpha: left / TICK, dropped };
}
