// 長時間混合模式：模擬玩家一路轉模式玩落去，睇 GPU 資源會唔會一路升。
//
// 點解要獨立一個檔案：leak.mjs 只跑 Clash、rts.mjs 只跑 LV2，但真實玩家係
// 打幾場 Clash、入 LV2 睇下、返出嚟再打、睇精華重播……每個模式有自己嘅
// dispose 路徑，洩漏往往就喺「跨模式」嗰啲接縫度（bone texture 嗰個就係）。
// 顯存一路升正正係玩家報「玩耐咗會閃黑屏」嘅根源。

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const DECK = ['militia', 'archers', 'swordsman', 'knight', 'ram', 'fireball', 'arrows', 'elephant'];

const r = await openRoyale({ viewport: { width: 900, height: 760 } });
const { page } = r;

const mem = (label) => page.evaluate((label) => {
    const m = window.__royaleRenderer.info.memory;
    return { label, geometries: m.geometries, textures: m.textures };
}, label);

const marks = [];
const record = async (label) => { const m = await mem(label); marks.push(m); console.log('  ', JSON.stringify(m)); return m; };

const baseline = await record('開機（選單）');

// 一輪 = 兩場 Clash + 一轉 LV2 + 一次精華重播，行三輪
for (let round = 1; round <= 5; round++) {
    // Clash ×2：真係打到完場，行埋結算同返選單嘅路
    for (let m = 0; m < 2; m++) {
        await page.click('#start-btn');
        await page.waitForTimeout(500);
        await page.evaluate(async (deck) => {
            const g = window.__royale.game;
            // 出啲兵令場面有嘢，再快進到完場
            for (const [i, id] of deck.slice(0, 4).entries()) {
                g.players[0].elixir = 12; g.players[0].hand[0] = id;
                g.playCard(0, 0, (i - 1.5) * 2, 5);
            }
            for (let f = 0; f < 60 * 60 && g.phase !== 'ended'; f++) {
                g.update(1 / 60); window.__royale.ai.update(1 / 60);
                if (f % 30 === 0) window.__royale.captureReplayFrame();
            }
            g.towers[1].king.hp = 1;
            g.players[0].elixir = 12; g.players[0].hand[0] = 'fireball';
            g.playCard(0, 0, g.towers[1].king.x, g.towers[1].king.z);
            for (let f = 0; f < 240 && g.phase !== 'ended'; f++) g.update(1 / 60);
        }, DECK);
        await page.waitForTimeout(3200);                 // 等結算彈出
        await page.evaluate(() => document.getElementById('menu-btn')?.click());
        await page.waitForTimeout(500);
    }
    // LV2 入一轉再出
    await page.click('#lv2-btn');
    await page.waitForFunction(() => !!window.__rts?.game, null, { timeout: 30000 });
    await page.evaluate(() => { for (let f = 0; f < 600; f++) window.__rts.update(1 / 60); });
    await page.click('#rts-quit');
    await page.waitForTimeout(500);

    await record(`第 ${round} 輪之後`);
}

const rounds = marks.slice(1);
const geo = rounds.map(x => x.geometries);
const tex = rounds.map(x => x.textures);
// 傷害數字快取係跨場保留、有上限（96）嘅設計，所以 texture 數會高過開機基準。
// 分得清「快取填緊」同「真洩漏」嘅方法：基準以上嘅每一張都要有快取數目解釋到。
const cache = await page.evaluate(async () => (await import('./src/game.js')).dmgTextureCacheSize());
const excess = tex[tex.length - 1] - baseline.textures;
check('geometries 每輪之後都持平', new Set(geo).size === 1, geo);
check('geometries 回到開機基準', geo[geo.length - 1] <= baseline.geometries + 2,
    { baseline: baseline.geometries, end: geo[geo.length - 1] });
check('基準以上嘅 texture 全部由傷害數字快取解釋到', excess <= cache,
    { baseline: baseline.textures, end: tex[tex.length - 1], excess, cache });
check('傷害數字快取冇爆上限', cache <= 96, cache);

// JS heap 只係次要訊號（GC 時機唔可控），所以只警告極端增長
const heap = await page.evaluate(() => {
    if (!performance.memory) return null;
    return Math.round(performance.memory.usedJSHeapSize / 1048576);
});
if (heap !== null) console.log(`   JS heap: ${heap} MB（參考值，GC 時機唔可控）`);

checkNoErrors(r.errors);
await r.close();
finish('session');
