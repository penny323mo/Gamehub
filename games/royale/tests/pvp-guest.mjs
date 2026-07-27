// PvP guest 邏輯（ADR-011）：唔連真網絡，直接餵假快照入 GuestGame。
// 重點係「主機視角 → 本機視角」嘅對調：guest 喺 host 眼中係 ENEMY，
// 但佢自己畫面永遠係下半場藍色。呢個對調錯咗，PvP 會全盤顛倒。

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRoyale({ viewport: { width: 600, height: 600 } });

const out = await r.page.evaluate(async () => {
    const THREE = await import('three');
    const { GuestGame } = await import('./src/pvp.js');
    const { TEAM } = await import('./src/constants.js');
    const g = new GuestGame(new THREE.Scene());
    const res = {};

    const snap1 = {
        time: 175, phase: 'regulation', mult: 1,
        crowns: { 0: 0, 1: 0 }, playedCards: { 0: ['knight'], 1: ['archers'] },
        players: {
            0: { elixir: 7, hand: ['militia', 'swordsman', 'fireball', 'arrows'], next: 'knight' },
            1: { elixir: 4, hand: ['pikemen', 'ram', 'catapult', 'freeze'], next: 'archers' },
        },
        entities: [
            { id: 1, team: 0, cardId: null, isTower: true, towerKind: 'left_princess', x: -4.5, z: 10.5, hp: 1500, maxHp: 1500, dead: false, facing: 0, moving: false, attackT: -1 },
            { id: 2, team: 1, cardId: null, isTower: true, towerKind: 'left_princess', x: -4.5, z: -10.5, hp: 1500, maxHp: 1500, dead: false, facing: 0, moving: false, attackT: -1 },
            { id: 10, team: 0, cardId: 'knight', isTower: false, x: 0, z: 3, hp: 780, maxHp: 780, dead: false, facing: Math.PI, moving: true, attackT: -1 },
            { id: 11, team: 1, cardId: 'archers', isTower: false, x: 0, z: -3, hp: 140, maxHp: 140, dead: false, facing: 0, moving: true, attackT: -1 },
        ],
    };
    g.applySnapshot(snap1);
    res.myHand = g.players[TEAM.PLAYER].hand;          // 應該係 host 眼中 ENEMY 嗰副
    res.myElixir = g.players[TEAM.PLAYER].elixir;
    res.entityCount = g.entities.length;
    res.myUnits = g.aliveUnits(TEAM.PLAYER).map(e => e.cardId);
    res.oppUnits = g.aliveUnits(TEAM.ENEMY).map(e => e.cardId);

    // 自己塔冧（host 世界入面係 team 1）
    const snap2 = JSON.parse(JSON.stringify(snap1));
    snap2.entities.find(e => e.id === 2).dead = true;
    g.applySnapshot(snap2);
    res.myLeftTowerDead = g.towers[TEAM.PLAYER].left?.dead;
    res.oppLeftTowerAlive = g.towers[TEAM.ENEMY].left?.dead === false;

    // 落點：座標係 host 世界系，自己半場 z<0；敵塔未冧唔開袋位
    res.ownSide = !!g.validPlacement(TEAM.PLAYER, 'militia', 3, -8);
    res.enemySideBlocked = g.validPlacement(TEAM.PLAYER, 'militia', 3, 8) === null;

    // 死兵移除
    const snap3 = JSON.parse(JSON.stringify(snap2));
    snap3.entities = snap3.entities.filter(e => e.id !== 11);
    g.applySnapshot(snap3);
    res.archersRemoved = !g.entities.some(e => e.cardId === 'archers');

    // 結算對調：host 話 team 1 贏 → guest 自己贏
    const snap4 = JSON.parse(JSON.stringify(snap3));
    snap4.phase = 'ended'; snap4.winner = 1;
    g.applySnapshot(snap4);
    res.winnerIsMe = g.result?.winner === TEAM.PLAYER;

    // pendingHand：出咗牌未見快照反映就要鎖住格仔，避免同一格重覆出
    const mk = hand => ({
        time: 170, phase: 'regulation', mult: 1, crowns: { 0: 0, 1: 0 },
        players: {
            0: { elixir: 5, hand: ['militia', 'archers', 'knight', 'ram'], next: 'fireball' },
            1: { elixir: 8, hand, next: 'arrows' },
        },
        playedCards: { 0: [], 1: [] }, entities: [],
    });
    const g2 = new GuestGame(new THREE.Scene());
    g2.applySnapshot(mk(['militia', 'archers', 'knight', 'ram']));
    g2.pendingHand.set(0, { cardId: 'militia', t: g2._clock });
    g2.applySnapshot(mk(['militia', 'archers', 'knight', 'ram']));
    res.stillLocked = g2.pendingHand.has(0);
    g2.applySnapshot(mk(['fireball', 'archers', 'knight', 'ram']));
    res.unlockedByChange = !g2.pendingHand.has(0);
    g2.pendingHand.set(1, { cardId: 'archers', t: g2._clock });
    for (let i = 0; i < 3.2 * 60; i++) g2.tick(1 / 60);
    res.unlockedByTimeout = !g2.pendingHand.has(1);

    g.dispose(); g2.dispose();
    return res;
});

console.log('  ', JSON.stringify(out));
check('手牌對調到本機視角', out.myHand?.[0] === 'pikemen', out.myHand);
check('自己單位／對手單位分得清', out.myUnits.join() === 'archers' && out.oppUnits.join() === 'knight', out);
check('自己塔冧、對手塔仲喺度', out.myLeftTowerDead === true && out.oppLeftTowerAlive, out);
check('自己半場落到兵、敵方半場落唔到', out.ownSide && out.enemySideBlocked, out);
check('快照冇咗嘅單位會移除', out.archersRemoved);
check('勝負對調正確', out.winnerIsMe);
check('pendingHand 鎖住未確認嘅格', out.stillLocked);
check('手牌換咗就解鎖', out.unlockedByChange);
check('超時亦會解鎖', out.unlockedByTimeout);

// T2：guest 渲染路徑嘅洩漏閘。guest 有自己一套 dispose（entities/hpBars/fxRings），
// 同 Clash 嗰邊唔同條路，而且 host 廣播落嚟嘅一次性特效（法術預警／爆炸／治療）
// 全部係 guest 自己建嘅 mesh——最容易漏就係呢啲。
const cycles = [];
for (let round = 1; round <= 4; round++) {
    const m = await r.page.evaluate(async (round) => {
        const THREE = await import('three');
        const { GuestGame } = await import('./src/pvp.js');
        const g = new GuestGame(window.__royaleScene ?? new THREE.Scene());
        const snap = (fx) => ({
            time: 170, phase: 'regulation', mult: 1, crowns: { 0: 0, 1: 0 },
            players: {
                0: { elixir: 6, hand: ['militia', 'archers', 'knight', 'ram'], next: 'fireball' },
                1: { elixir: 6, hand: ['pikemen', 'ram', 'catapult', 'freeze'], next: 'arrows' },
            },
            playedCards: { 0: [], 1: [] },
            entities: [
                { id: 1, team: 0, cardId: 'knight', isTower: false, x: 0, z: 3, hp: 780, maxHp: 780, dead: false, facing: 0, moving: true, attackT: -1 },
                { id: 2, team: 1, cardId: 'archers', isTower: false, x: 1, z: -3, hp: 140, maxHp: 140, dead: false, facing: 0, moving: true, attackT: -1 },
                { id: 3, team: 0, cardId: null, isTower: true, towerKind: 'left_princess', x: -4.5, z: 10.5, hp: 1500, maxHp: 1500, dead: false, facing: 0, moving: false, attackT: -1 },
            ],
            fx,
        });
        // 一次性特效全部走一次：法術預警、爆炸、治療脈衝、王塔甦醒
        g.applySnapshot(snap([
            { k: 'spell', x: 0, z: -6, r: 1.9, d: 0.6, team: 0, id: 'fireball' },
            { x: 2, z: 1, r: 2, color: 0xff7a3c },
            { x: -2, z: 2, r: 1.4, color: 0x6ad07a },
        ]));
        for (let f = 0; f < 90; f++) g.tick(1 / 60);
        g.applySnapshot(snap([{ k: 'spell', x: 3, z: 4, r: 3, d: 0.5, team: 1, id: 'arrows' }]));
        for (let f = 0; f < 90; f++) g.tick(1 / 60);
        g.dispose();
        await new Promise(res => setTimeout(res, 60));
        const info = window.__royaleRenderer.info.memory;
        return { round, geometries: info.geometries, textures: info.textures };
    }, round);
    console.log('  ', JSON.stringify(m));
    cycles.push(m);
}
// 第一轉會建立共用資源，由第二轉起要完全持平
const gGeo = cycles.slice(1).map(x => x.geometries);
const gTex = cycles.slice(1).map(x => x.textures);
check('guest 建／棄四轉 geometries 持平', new Set(gGeo).size === 1, cycles.map(x => x.geometries));
check('guest 建／棄四轉 textures 持平', new Set(gTex).size === 1, cycles.map(x => x.textures));

checkNoErrors(r.errors);
await r.close();
finish('pvp-guest');
