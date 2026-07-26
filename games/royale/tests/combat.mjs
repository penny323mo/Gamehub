// 傷害漏斗（Game#damage）：相剋、護甲、攻城加成、死亡爆炸、治療。
// 呢啲全部行同一條 #damage 路徑，所以一齊測——任何一項失準通常代表漏斗被繞過。

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const DECK = ['pikemen', 'archers', 'militia', 'ram', 'arrows', 'fireball', 'swordsman', 'knight'];

const r = await openRoyale();
await r.enterMenuMatch();

// T1：長槍剋大型（bonusVs.heavy = 2）
const t1 = await r.page.evaluate(async (deck) => {
    const { Game } = await import('./src/game.js');
    const THREE = await import('three');
    const run = (foeCard) => {
        const g = new Game(new THREE.Scene(), deck, deck, {}, {});
        const p = g.players[0]; p.elixir = 12; p.hand[0] = 'pikemen'; g.playCard(0, 0, 0, 4);
        const q = g.players[1]; q.elixir = 12; q.hand[0] = foeCard; g.playCard(1, 0, 0, -4);
        for (let i = 0; i < 20; i++) g.update(1 / 60);
        const foe = g.entities.find(e => e.cardId === foeCard && e.team === 1 && !e.dead);
        const pikes = g.entities.filter(e => e.cardId === 'pikemen' && e.team === 0 && !e.dead);
        if (!foe || !pikes.length) return null;
        foe.maxHp = 99999; foe.hp = 99999;
        for (let i = 0; i < 8 * 60; i++) {
            pikes.forEach((pk, j) => { pk.x = foe.x + (j - 1) * 0.5; pk.z = foe.z + 0.9; });
            g.update(1 / 60);
        }
        const dealt = Math.round(99999 - foe.hp);
        g.dispose?.();
        return dealt;
    };
    const vsHeavy = run('knight');
    const vsNormal = run('swordsman');
    return { vsHeavy, vsNormal, ratio: +(vsHeavy / Math.max(1, vsNormal)).toFixed(2) };
}, DECK);
check('長槍對大型傷害約 ×2', t1.ratio >= 1.8 && t1.ratio <= 2.6, t1);

// T2：投石車對建築 ×1.6（卡面寫幾多就係幾多）
const t2 = await r.page.evaluate(async () => {
    const { Game } = await import('./src/game.js');
    const { CARDS } = await import('./src/cards.js');
    const THREE = await import('three');
    const deck = ['catapult', 'archers', 'militia', 'ram', 'arrows', 'fireball', 'swordsman', 'knight'];
    const run = (bonus) => {
        const g = new Game(new THREE.Scene(), deck, deck, {}, {});
        const keep = CARDS.catapult.bonusVs;
        if (!bonus) CARDS.catapult.bonusVs = undefined;
        const p = g.players[0]; p.elixir = 12; p.hand[0] = 'catapult';
        g.playCard(0, 0, 0, 4);
        const cat = g.entities.find(e => e.cardId === 'catapult' && e.team === 0);
        const tower = g.towers[1].left;
        let secs = 0;
        for (let i = 0; i < 180 * 60 && !tower.dead; i++) {
            // 釘死喺 8.0 距離：大過塔射程 7.5、細過投石車 8.5，所以只有佢打得到。
            // 血都要補返——唔補嘅話佢會行入塔射程被打死，量度唔到拆塔時間。
            cat.x = tower.x; cat.z = tower.z + 8.0; cat.hp = cat.maxHp;
            g.update(1 / 60); secs += 1 / 60;
        }
        CARDS.catapult.bonusVs = keep;
        const out = { secs: +secs.toFixed(1), dead: tower.dead };
        g.dispose?.();
        return out;
    };
    const withBonus = run(true);
    const without = run(false);
    return {
        withBonus, without, desc: CARDS.catapult.desc, bonus: CARDS.catapult.bonusVs,
        speedup: +(without.secs / Math.max(0.1, withBonus.secs)).toFixed(2),
    };
});
check('投石車攻城加成係 1.6', t2.bonus?.building === 1.6, t2.bonus);
check('拆塔快咗約 1.6 倍', t2.speedup >= 1.45 && t2.speedup <= 1.75, t2);
check('卡面文字同數據一致', t2.desc.includes('1.6'), t2.desc);

// T3：護甲、死亡爆炸、治療
const t3 = await r.page.evaluate(async () => {
    const { Game } = await import('./src/game.js');
    const { CARDS } = await import('./src/cards.js');
    const THREE = await import('three');
    const deck = ['cleric', 'grenadier', 'ironclad', 'archers', 'militia', 'arrows', 'fireball', 'knight'];
    const g = new Game(new THREE.Scene(), deck, deck, {}, {});

    // 護甲：重甲衛食一下箭雨，實際傷害要打咗 35% 折扣
    const p = g.players[0]; p.elixir = 12; p.hand[0] = 'ironclad'; g.playCard(0, 0, -2, 5);
    for (let i = 0; i < 70; i++) g.update(1 / 60);
    const clad = g.entities.find(e => e.cardId === 'ironclad' && !e.dead);
    const hpBefore = clad.hp;
    const q = g.players[1]; q.elixir = 12; q.hand[0] = 'arrows'; g.playCard(1, 0, clad.x, clad.z);
    for (let i = 0; i < 60; i++) g.update(1 / 60);
    const taken = hpBefore - clad.hp;
    const expected = CARDS.arrows.dmg * (1 - CARDS.ironclad.armor);
    const out = {
        armor: CARDS.ironclad.armor, taken: Math.round(taken), expected: Math.round(expected),
        healAmount: CARDS.cleric.heal?.amount, clericDmg: CARDS.cleric.dmg,
        bomb: CARDS.grenadier.deathBomb?.dmg,
    };
    g.dispose?.();
    return out;
});
check('重甲衛減 35% 傷害', Math.abs(t3.taken - t3.expected) <= 2, t3);
check('醫者係純輔助（攻擊力 0、有治療）', t3.clericDmg === 0 && t3.healAmount > 0, t3);
check('擲彈兵有死亡爆炸', t3.bomb > 0, t3.bomb);

checkNoErrors(r.errors);
await r.close();
finish('combat');
