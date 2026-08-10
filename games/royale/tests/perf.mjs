// Draw-call 預算閘。
//
// 呢個 repo 入面 Tower（`performance.mjs`：空場 budget 450、真峰值 1100）同
// MOBA（`browser.mjs`：一場波尖峰 < 600）一路都有 draw-call 預算，**Royale 一條
// 都冇**——而佢係三隻 3D 遊戲入面最重嗰隻：同一個軟件光柵器之下，中位幀時間
// 533ms，Tower 100ms、MOBA 233ms。一隻冇預算嘅遊戲，加幾件嘢落場景冇人會攔佢。
//
// 實測（`__royaleDrawn()`，教學遮罩略過之後量 45 秒）：
//
//     手機 844×390   calls 中位 509　p95 519　尖峰 532（嗰刻場上 9 個單位、867K 三角）
//     桌面 1280×800  calls 中位 517　p95 525　尖峰 526（7 個單位、773K 三角）
//
// 即係嗰五百個 call 幾乎全部係**戰場本身**，唔係單位。所以呢條 gate 守嘅係
// 「靜態戰場唔好再重」——同 Tower 嗰條「空場 draw calls 受控」一模一樣嘅形狀。
//
// ── 點解要有個下限 ──────────────────────────────────────────────
// 因為呢個數**曾經係假嘅**。three.js 每次 `render()` 開頭 `info.reset()`，而
// Royale 用緊 EffectComposer——最後一個 pass 係一塊全屏 quad，所以 render 完
// 之後讀 `info.render.calls` 讀到嘅係 **1**（嗰塊 quad），唔係成個場景。
// 由外面隔住 `requestAnimationFrame` 讀更加冇準（讀到 reset 咗但未 render 嗰刻）。
// 修法係 `renderScene()` 入面熄咗 `autoReset`、自己一幀 reset 一次、render 完
// 即刻記低（`__royaleDrawn`）。
//
// **一個讀到 1 嘅 gate 會永遠報綠。** 所以下限同上限一齊守。
import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

// 上限：實測尖峰 532（兩個 viewport 都喺 526–532），650 大約 1.22 倍。
// 揀 650 唔係「順手取個靚數」：戰場係靜態嘅，多一兩件裝飾唔會過線，
// 但**掉咗批次**（例如一堆共用 geometry 變成逐件畫）就一定過。
const CALL_上限 = 650;
// 下限：一個真 3D 戰場冇可能得幾十個 call。50 係用嚟捉「個數係假嘅」，
// 唔係用嚟捉「太少」——實測係 500 上下，離 50 好遠。
const CALL_下限 = 50;

const r = await openRoyale({ viewport: { width: 844, height: 390 } });
await r.enterMenuMatch();
// `openRoyale` 已經 `markTutorialSeen()`，所以正常唔會有遮罩；萬一有就撳走佢
// ——教學開住嗰陣模擬係特登凍結嘅，量到嘅唔係打緊嗰陣嘅場面。
// 短 timeout：呢句係保險，唔應該喺正常路徑度等三十秒。
await r.page.click('#tutorial-skip', { timeout: 1500 }).catch(() => {});
await r.page.waitForTimeout(2500);

const 量 = await r.page.evaluate(async () => {
    const 樣 = [];
    for (let i = 0; i < 30; i++) {
        const d = window.__royaleDrawn?.();
        const g = window.__royale?.game;
        if (d) 樣.push({ c: d.calls, t: d.triangles, e: (g?.entities ?? []).filter((x) => !x.dead).length });
        await new Promise((res) => setTimeout(res, 200));
    }
    if (!樣.length) return { 冇讀到: true };
    const cs = 樣.map((x) => x.c).sort((a, b) => a - b);
    const 尖 = 樣.reduce((m, x) => (x.c > m.c ? x : m), 樣[0]);
    return {
        樣數: 樣.length,
        中位: cs[Math.floor(cs.length / 2)],
        尖峰: cs[cs.length - 1],
        尖峰時單位: 尖.e,
        尖峰三角: 尖.t,
    };
});

console.log('  ', JSON.stringify(量));

check('讀得到 draw call，而且個數唔係假嘅（EffectComposer 之下讀錯位會係 1）',
    !量.冇讀到 && 量.中位 >= CALL_下限, { ...量, 下限: CALL_下限 });
check(`一場波入面 draw call 尖峰守得住預算（≤ ${CALL_上限}）`,
    !量.冇讀到 && 量.尖峰 <= CALL_上限, { ...量, 上限: CALL_上限 });
checkNoErrors(r.errors);
await r.close();
finish('royale draw-call 預算');
