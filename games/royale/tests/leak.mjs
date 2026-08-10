// GPU 資源洩漏閘（ADR-008）：連續開場／收場，geometries 同 textures 唔准淨增長。
// 數字本身唔重要，「平」先重要——加新持久 mesh 會令基準升，但六個回合之間
// 必須完全一致。基準改變請喺 handoff 講明點解。
//
// **加咗 DOM（ADR-227）。** 呢把尺一直只守 GPU，而實測捉到嘅洩漏喺 DOM：
// 由主選單連開四局，`<head>` 度積咗三個攞唔到嘅 supabase `<script>`
// ——GPU 三個數完全平，DOM 一局爬一個。`loadSdk()` 攞唔到會重設個 promise
// 畀下次再試，但**上一次嗰個 element 冇拆走**。網絡差＝重試多＝爬得快。
// 一把只守一種資源嘅洩漏閘，會漏走另一種資源嘅洩漏。

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const BASELINE_GEOMETRIES = 116; // ADR-020 嘅 InstancedMesh 團隊標記層令基準由 115 升到 116
const BASELINE_TEXTURES = 20;
const CYCLES = 6;

const r = await openRoyale({ viewport: { width: 900, height: 700 } });
await r.enterMenuMatch();

const rows = await r.page.evaluate(async (cycles) => {
    const deck = ['knight', 'archers', 'fireball', 'arrows', 'militia', 'swordsman', 'catapult', 'ram'];
    const out = [];
    for (let m = 0; m < cycles; m++) {
        const g = window.__royale.game;
        for (let i = 0; i < 25 * 60; i++) g.update(1 / 60); // 快進 25 秒模擬
        window.__royale.cleanupMatch();
        const info = window.__royaleRenderer.info.memory;
        out.push({ cycle: m + 1, geometries: info.geometries, textures: info.textures,
                   dom: document.getElementsByTagName('*').length });
        window.__royale.startMatch(deck, 'normal', 'gauntlet', m + 2);
        await new Promise(res => setTimeout(res, 120));
    }
    return out;
}, CYCLES);

for (const row of rows) console.log('  ', JSON.stringify(row));

const geo = rows.map(x => x.geometries);
const tex = rows.map(x => x.textures);
check('geometries 六個回合持平', new Set(geo).size === 1, geo);
check('textures 六個回合持平', new Set(tex).size === 1, tex);
check(`geometries 等於基準 ${BASELINE_GEOMETRIES}`, geo[0] === BASELINE_GEOMETRIES, geo[0]);
check(`textures 等於基準 ${BASELINE_TEXTURES}`, tex[0] === BASELINE_TEXTURES, tex[0]);
// DOM 唔設基準（HUD 會跟版面改），**淨係守「平」**——同上面兩條一樣嘅道理。
const dom = rows.map(x => x.dom);
check('DOM 節點數六個回合持平（場內快進）', new Set(dom).size === 1, dom);

/*
 * 再行一次，但今次**行返玩家條路**：由選單撳「開戰」入局、退返出嚟、再入。
 *
 * 上面個 loop 喺 `page.evaluate` 入面直接叫 `startMatch`，唔會經過選單，
 * 所以連線層（`loadSdk`）根本冇行過——條 DOM check 擺喺嗰度**睇唔到佢應該
 * 捉嗰樣嘢**：拆走修正之後突變測試照樣報綠。真正嘅洩漏喺選單→入局嗰條路。
 * **一條唔行玩家條路嘅 gate，守唔到玩家撞到嘅嘢。**
 */
// 開一個乾淨嘅實例嚟行：上面個 loop 收咗尾停喺局中，`#start-btn` 見唔到,
// 喺同一版度續住撳只會撞到「element is not visible」——嗰個係狀態問題,
// 唔係洩漏。分開兩個實例，兩件事各自量得清楚。
const r2 = await openRoyale({ viewport: { width: 900, height: 700 } });
const 選單記 = [];
for (let i = 0; i < 4; i++) {
    await r2.enterMenuMatch();
    await r2.page.waitForTimeout(900);
    選單記.push(await r2.page.evaluate(() => document.getElementsByTagName('*').length));
    // 撳 🏳️ 投降離開返選單。**一定要真係返到選單**：入咗局之後
    // `#start-btn` 個祖先會加 `.hidden`，唔返選單就撳唔到下一次
    // ——嗰個係狀態問題，唔係洩漏，但佢會扮成一個 timeout 令你以為 gate 壞咗。
    // 用**原生 DOM click**，唔用 Playwright 個 `page.click`。
    // Playwright 會等「見得到、撳得郁、企定」——投降流程中途嗰幾個掣唔一定
    // 過到嗰關，於是條 gate 會喺一個同洩漏完全無關嘅位逾時。呢度要嘅唔係
    // 「模擬一個真手指」，係「行完呢條狀態轉換」。
    await r2.page.evaluate(() => {
        document.querySelector('#quit-btn')?.click();
        document.querySelector('#menu-btn')?.click();
    });
    await r2.page.waitForTimeout(800);
}
await r2.close();
// 第一局會起 HUD，所以由第二局起計。
const 選單平 = 選單記.slice(1);
check('DOM 節點數唔會一局一局咁爬（由選單入局，第 2 局起）',
    new Set(選單平).size === 1, 選單記);
checkNoErrors(r.errors);

await r.close();
finish('leak');
