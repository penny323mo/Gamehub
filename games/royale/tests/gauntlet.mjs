// 連勝挑戰戰場條件（ADR-013）：條件要真係落到 Game，而且對雙方完全對稱。
// 呢個係 ADR-007「AI 唔可以有資源優勢」嘅自動化守門員。

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const DECK = ['militia', 'archers', 'swordsman', 'knight', 'ram', 'fireball', 'arrows', 'elephant'];

const r = await openRoyale();
await r.enterMenuMatch();

// T1：每關條件落到 Game 度
const t1 = await r.page.evaluate(async (deck) => {
    const { Game } = await import('./src/game.js');
    const { stageCondition, conditionOpts } = await import('./src/gauntlet.js');
    const THREE = await import('three');
    const out = [];
    for (let st = 1; st <= 7; st++) {
        const cond = stageCondition(st);
        const g = new Game(new THREE.Scene(), deck, deck, {}, conditionOpts(cond));
        out.push({
            st, cond: cond ? cond.id : 'plain', matchTime: g.time,
            elixirInterval: g.rules.elixirInterval, startElixir: g.players[0].elixir,
            princessHp: g.towers[0].left.maxHp, kingHp: g.towers[0].king.maxHp,
            fountainAlways: g.fountainAlways, elixirMax: g.rules.elixirMax,
        });
        g.dispose?.();
    }
    return out;
}, DECK);
for (const row of t1) console.log('  ', JSON.stringify(row));

const by = id => t1.find(x => x.cond === id);
check('速攻戰正賽 120 秒', by('rush').matchTime === 120, by('rush').matchTime);
check('聖水泛濫回水 1.75 秒', by('flood').elixirInterval === 1.75, by('flood').elixirInterval);
check('堅城塔血 ×1.3', by('fortify').princessHp === 1950 && by('fortify').kingHp === 3380, by('fortify'));
check('聖水泉常開', by('spring').fountainAlways === true);
check('開局決鬥開場 10 水', by('duel').startElixir === 10, by('duel').startElixir);
check('第 1 關同第 7 關都係標準規則', t1[0].cond === 'plain' && t1[6].cond === 'plain');
check('elixirMax 永遠唔被覆寫', t1.every(x => x.elixirMax === 12));

// T2：對稱性——兩隊塔血／開場水／十秒後水量一樣
const t2 = await r.page.evaluate(async (deck) => {
    const { Game } = await import('./src/game.js');
    const { stageCondition, conditionOpts } = await import('./src/gauntlet.js');
    const THREE = await import('three');
    const rows = [];
    for (let st = 1; st <= 6; st++) {
        const g = new Game(new THREE.Scene(), deck, deck, {}, conditionOpts(stageCondition(st)));
        const towers = t => Object.values(g.towers[t]).map(x => x.maxHp).join('/');
        const e0 = g.players[0].elixir, e1 = g.players[1].elixir;
        for (let i = 0; i < 10 * 60; i++) g.update(1 / 60);
        rows.push({
            st, towersEqual: towers(0) === towers(1), startEqual: e0 === e1,
            after10s: [+g.players[0].elixir.toFixed(3), +g.players[1].elixir.toFixed(3)],
            enemyRate: g.enemyElixirRate,
        });
        g.dispose?.();
    }
    return rows;
}, DECK);
for (const row of t2) console.log('  ', JSON.stringify(row));
check('每關兩隊塔血相同', t2.every(x => x.towersEqual));
check('每關開場聖水相同', t2.every(x => x.startEqual));
check('十秒後兩隊聖水相同', t2.every(x => x.after10s[0] === x.after10s[1]), t2.map(x => x.after10s));

// T3：聖水泉常開喺正賽真係派水（對照組唔會）
const t3 = await r.page.evaluate(async (deck) => {
    const { Game } = await import('./src/game.js');
    const { stageCondition, conditionOpts } = await import('./src/gauntlet.js');
    const THREE = await import('three');
    const run = (opts) => {
        const g = new Game(new THREE.Scene(), deck, deck, {}, opts);
        const p = g.players[0];
        p.elixir = 12; p.hand[0] = 'militia'; g.playCard(0, 0, 0, 4);
        for (let i = 0; i < 70; i++) g.update(1 / 60);        // 過部署硬直
        const mine = g.entities.filter(e => e.team === 0 && !e.isTower && !e.dead);
        p.elixir = 0; p.elixirT = 0;
        for (let i = 0; i < 7 * 60; i++) {                    // 兵釘死喺河心 7 秒
            mine.forEach((m, j) => { m.x = (j - 1) * 0.5; m.z = 0; });
            g.update(1 / 60);
        }
        const got = +g.players[0].elixir.toFixed(2);
        g.dispose?.();
        return got;
    };
    return { spring: run(conditionOpts(stageCondition(5))), plain: run({}) };
}, DECK);
check('聖水泉常開多派 2 滴', t3.spring - t3.plain === 2, t3);

// T4：對手輪替固定，玩家可以預先準備
const t4 = await r.page.evaluate(async () => {
    const { stagePersonality, stageCondition, GAUNTLET_CONDITIONS } = await import('./src/gauntlet.js');
    const { PERSONALITIES } = await import('./src/ai.js');
    const a = [], b = [];
    for (let st = 1; st <= 12; st++) { a.push(stagePersonality(st)); b.push(stagePersonality(st)); }
    return {
        deterministic: a.join() === b.join(), allValid: a.every(k => !!PERSONALITIES[k]),
        first12: a.join(','), condCycle: GAUNTLET_CONDITIONS.length,
        nonGauntlet: stageCondition(0) === null,
    };
});
check('同一關永遠同一個對手', t4.deterministic && t4.allValid, t4.first12);
check('非連勝模式冇條件', t4.nonGauntlet);

// T5：HUD 條件章跟住模式走
const t5 = await r.page.evaluate(async (deck) => {
    const chip = document.getElementById('condition-chip');
    window.__royale.startMatch(deck, 'hard', 'gauntlet', 4);
    await new Promise(res => setTimeout(res, 80));
    const g = window.__royale.game;
    const gauntlet = {
        text: chip.textContent, hidden: chip.classList.contains('hidden'),
        mine: g.towers[0].left.maxHp, theirs: g.towers[1].left.maxHp,
    };
    window.__royale.startMatch(deck, 'normal', 'single', 1);
    await new Promise(res => setTimeout(res, 80));
    const single = {
        hidden: chip.classList.contains('hidden'),
        mine: window.__royale.game.towers[0].left.maxHp,
    };
    return { gauntlet, single };
}, DECK);
check('連勝關卡顯示條件章', !t5.gauntlet.hidden && t5.gauntlet.text.includes('堅城'), t5.gauntlet.text);
check('條件對雙方生效', t5.gauntlet.mine === 1950 && t5.gauntlet.theirs === 1950, t5.gauntlet);
check('單場對戰收起條件章兼回復標準塔血', t5.single.hidden && t5.single.mine === 1500, t5.single);

checkNoErrors(r.errors);
await r.close();
finish('gauntlet');
