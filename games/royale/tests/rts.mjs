// LV2 世紀帝國式 RTS。重點守三樣嘢：
// 1. 雙方起跑線一樣（同 Clash 一樣，AI 唔准有資源或情報優勢，見 ADR-007 精神）
// 2. 科技／年代／人口／花費呢啲閘真係閘得住
// 3. 相剋倍率同 Clash 對得上，而且進出 RTS 唔會漏 GPU 資源

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRoyale({ viewport: { width: 1000, height: 760 } });
const { page } = r;

// T1：開局對稱——資源、人口上限、科技等級、建築配置
const start = await page.evaluate(async () => {
    const { RtsGame, RTS_TECH, RTS_MAX_AGE } = await import('./src/rts/rts.js');
    const THREE = await import('three');
    const g = new RtsGame(new THREE.Scene(), {});
    const side = t => ({
        res: { ...g.res[t] }, popCap: g.popCap[t], tech: { ...g.tech[t] },
        age: g.teamAge(t),
        buildings: g.entities.filter(e => e.kind === 'building' && e.team === t)
            .map(e => e.buildingType).sort().join(','),
        units: g.entities.filter(e => e.kind === 'unit' && e.team === t)
            .map(e => e.type).sort().join(','),
    });
    const out = { player: side(0), enemy: side(1), maxAge: RTS_MAX_AGE, atkPerLevel: RTS_TECH.attack.perLevel };
    g.dispose();
    return out;
});
console.log('   player:', JSON.stringify(start.player));
console.log('   enemy: ', JSON.stringify(start.enemy));
check('雙方開局資源一樣', JSON.stringify(start.player.res) === JSON.stringify(start.enemy.res), start.player.res);
check('雙方人口上限一樣', start.player.popCap === start.enemy.popCap);
check('雙方科技由零開始', start.player.tech.attack === 0 && start.enemy.tech.attack === 0
    && start.player.tech.armor === 0 && start.enemy.tech.armor === 0);
check('雙方開局建築一樣', start.player.buildings === start.enemy.buildings, start.player.buildings);
check('雙方開局單位一樣', start.player.units === start.enemy.units, start.player.units);
check('雙方由第一代開始', start.player.age === 1 && start.enemy.age === 1);

// T2：科技閘——年代唔夠、錢唔夠、滿級都唔畀研究
const tech = await page.evaluate(async () => {
    const { RtsGame, RTS_TECH } = await import('./src/rts/rts.js');
    const THREE = await import('three');
    const g = new RtsGame(new THREE.Scene(), {});
    const smith = { team: 0, kind: 'building', buildingType: 'blacksmith', complete: true, dead: false, researching: null };
    const lvl2 = RTS_TECH.attack.levels[1];
    const out = {};
    // 第 2 級要第 2 代：而家第 1 代，就算錢夠都唔應該批
    g.res[0].food = 9999; g.res[0].gold = 9999;
    g.tech[0].attack = 1;
    out.ageBlocked = g.queueResearch(smith, 'attack') === false && (lvl2.age ?? 1) === 2;
    // 錢唔夠都唔批
    g.tech[0].attack = 0;
    g.res[0].food = 1; g.res[0].gold = 1;
    out.costBlocked = g.queueResearch(smith, 'attack') === false;
    // 錢夠、年代夠就批，並且會扣錢
    g.res[0].food = 9999; g.res[0].gold = 9999;
    const before = { ...g.res[0] };
    out.queued = g.queueResearch(smith, 'attack') === true;
    out.charged = g.res[0].food < before.food && g.res[0].gold < before.gold;
    // 滿級之後冇下一級
    g.tech[0].attack = RTS_TECH.attack.max;
    out.maxedOut = g.nextTech(0, 'attack') === null;
    // 非鐵匠鋪唔可以研究
    const house = { team: 0, kind: 'building', buildingType: 'house', complete: true, dead: false, researching: null };
    g.tech[0].attack = 0;
    out.wrongBuilding = g.queueResearch(house, 'attack') === false;
    // 未起好嘅建築唔可以研究
    const wip = { ...smith, complete: false };
    out.incompleteBlocked = g.queueResearch(wip, 'attack') === false;
    g.dispose();
    return out;
});
check('年代唔夠研究唔到', tech.ageBlocked);
check('資源唔夠研究唔到', tech.costBlocked);
check('條件齊就開得到研究', tech.queued);
check('開研究會即時扣資源', tech.charged);
check('滿級之後冇下一級', tech.maxedOut);
check('只有鐵匠鋪可以研究', tech.wrongBuilding);
check('未起好嘅建築唔可以研究', tech.incompleteBlocked);

// T3：科技倍率只加落單位，唔加落建築（建築唔應該食兵器鍛造）
const mult = await page.evaluate(async () => {
    const { RtsGame, RTS_TECH } = await import('./src/rts/rts.js');
    const THREE = await import('three');
    const g = new RtsGame(new THREE.Scene(), {});
    const base = { atk: g.techAtkMult(0), def: g.techDefMult(0) };
    g.tech[0] = { attack: 3, armor: 3 };
    const full = { atk: g.techAtkMult(0), def: g.techDefMult(0) };
    const expectAtk = 1 + 3 * RTS_TECH.attack.perLevel;
    const expectDef = 1 - 3 * RTS_TECH.armor.perLevel;
    const enemyUntouched = g.techAtkMult(1) === 1 && g.techDefMult(1) === 1;
    g.dispose();
    return { base, full, expectAtk, expectDef, enemyUntouched };
});
check('未研究時倍率係 1', mult.base.atk === 1 && mult.base.def === 1);
check('攻擊科技滿級 ×1.36', Math.abs(mult.full.atk - mult.expectAtk) < 1e-9, mult.full.atk);
check('護甲科技滿級減 27% 傷害', Math.abs(mult.full.def - mult.expectDef) < 1e-9, mult.full.def);
check('一隊嘅科技唔會漏去另一隊', mult.enemyUntouched);

// T4：相剋倍率同 Clash 對得上（長槍剋大型、攻城器剋建築）
const counters = await page.evaluate(async () => {
    const { RTS_UNITS } = await import('./src/rts/rts.js');
    const { CARDS } = await import('./src/cards.js');
    return {
        rtsPikeVsHeavy: RTS_UNITS.pikeman.vsHeavy,
        clashPikeVsHeavy: CARDS.pikemen.bonusVs?.heavy,
        heavy: Object.keys(RTS_UNITS).filter(k => RTS_UNITS[k].heavy).sort().join(','),
        ramVsBuilding: RTS_UNITS.ram.vsBuilding,
        catapultVsBuilding: RTS_UNITS.catapult.vsBuilding,
        clashCatapultVsBuilding: CARDS.catapult.bonusVs?.building,
    };
});
check('RTS 長槍剋大型倍率同 Clash 一致', counters.rtsPikeVsHeavy === counters.clashPikeVsHeavy, counters.rtsPikeVsHeavy);
check('RTS 有標住大型單位', counters.heavy.length > 0, counters.heavy);
check('攻城器對建築有加成', counters.ramVsBuilding > 1 && counters.catapultVsBuilding > 1, counters);
// RTS 投石車射程冇 Clash 嗰個「射程大過塔」嘅問題，所以倍率高過 Clash 係故意嘅
check('RTS 投石車攻城倍率高過 Clash（設計如此）',
    counters.catapultVsBuilding > counters.clashCatapultVsBuilding,
    { rts: counters.catapultVsBuilding, clash: counters.clashCatapultVsBuilding });

// T5：人口／花費閘真係閘得住
const gates = await page.evaluate(async () => {
    const { RtsGame, RTS_UNITS } = await import('./src/rts/rts.js');
    const THREE = await import('three');
    const g = new RtsGame(new THREE.Scene(), {});
    const out = {};
    out.canAffordZero = g.canAfford(0, { food: 0, gold: 0 });
    out.cannotAffordHuge = g.canAfford(0, { food: 999999, gold: 0 }) === false;
    // 訓練要收錢：資源唔夠就唔應該排到隊
    const barracks = g.entities.find(e => e.kind === 'building' && e.team === 0 && e.buildingType === 'barracks');
    g.res[0].food = 0; g.res[0].gold = 0;
    out.trainBlockedByCost = g.queueTrain(barracks, 'soldier') === false;
    g.res[0].food = 9999; g.res[0].gold = 9999;
    const before = { ...g.res[0] };
    out.trainQueued = g.queueTrain(barracks, 'soldier') === true;
    out.trainCharged = g.res[0].food < before.food || g.res[0].gold < before.gold;
    // 人口爆咗就唔應該再排
    g.popCap[0] = 0;
    out.trainBlockedByPop = g.queueTrain(barracks, 'soldier') === false;
    g.popCap[0] = 18;
    // 高年代兵一開始出唔到
    out.age3Units = Object.entries(RTS_UNITS).filter(([, d]) => (d.age ?? 1) > 1).map(([k]) => k).sort().join(',');
    out.teamAgeAtStart = g.teamAge(0);
    g.dispose();
    return out;
});
check('canAfford 判斷正確', gates.canAffordZero && gates.cannotAffordHuge);
check('資源唔夠訓練唔到兵', gates.trainBlockedByCost);
check('資源夠就排到隊兼扣錢', gates.trainQueued && gates.trainCharged);
check('人口爆咗訓練唔到兵', gates.trainBlockedByPop);
check('有高年代兵種要等升代', gates.age3Units.length > 0 && gates.teamAgeAtStart === 1, gates.age3Units);

// T6：反覆進出 RTS 唔會漏 GPU 資源（RTS 有自己嘅地圖同貼圖，dispose 路徑同 Clash 唔同）
const leak = [];
for (let round = 1; round <= 4; round++) {
    await page.click('#lv2-btn');                       // 入 LV2 大地圖
    await page.waitForFunction(() => !!window.__rts, null, { timeout: 30000 });
    await page.evaluate(() => { for (let f = 0; f < 300; f++) window.__rts.update(1 / 60); });
    await page.click('#rts-quit');                      // 用返真實退出路徑
    await page.waitForTimeout(400);
    leak.push(await page.evaluate((round) => {
        const info = window.__royaleRenderer.info.memory;
        return { round, geometries: info.geometries, textures: info.textures };
    }, round));
}
for (const row of leak) console.log('  ', JSON.stringify(row));
const geo = leak.map(x => x.geometries);
const tex = leak.map(x => x.textures);
// 第一轉會建立共用資源，所以由第二轉起先算「穩定」
check('RTS 進出四轉 geometries 穩定', new Set(geo.slice(1)).size === 1, geo);
check('RTS 進出四轉 textures 穩定', new Set(tex.slice(1)).size === 1, tex);

checkNoErrors(r.errors);
await r.close();
finish('rts');
