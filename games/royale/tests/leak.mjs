// GPU 資源洩漏閘（ADR-008）：連續開場／收場，geometries 同 textures 唔准淨增長。
// 數字本身唔重要，「平」先重要——加新持久 mesh 會令基準升，但六個回合之間
// 必須完全一致。基準改變請喺 handoff 講明點解。

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
        out.push({ cycle: m + 1, geometries: info.geometries, textures: info.textures });
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
checkNoErrors(r.errors);

await r.close();
finish('leak');
