// 一場完整對局嘅生命週期：打得完、投降入賬、返選單清得乾淨、AI 唔會塞死。

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRoyale({ viewport: { width: 900, height: 700 } });
const { page } = r;

// T1：投降要當輸一場，連勝清零，而且直接返選單（唔彈結算）
await r.enterMenuMatch();
const before = await page.evaluate(() => {
    const k = Object.keys(localStorage).find(x => x.includes('royale-save'));
    return JSON.parse(localStorage.getItem(k) || '{}');
});
await page.evaluate(() => document.getElementById('quit-btn').click());
await page.waitForTimeout(400);
const after = await page.evaluate(() => {
    const k = Object.keys(localStorage).find(x => x.includes('royale-save'));
    return JSON.parse(localStorage.getItem(k) || '{}');
});
const atMenu = await page.evaluate(() => !document.getElementById('screen-start').classList.contains('hidden'));
check('投降計一場敗仗', after.losses === (before.losses ?? 0) + 1, { before: before.losses ?? 0, after: after.losses });
check('投降清零連勝', after.streak === 0, after.streak);
check('投降直接返選單', atMenu);

// T2：打到完場再撳返選單，GPU 資源要收返（唔可以每場淨升）
const baseGeo = await page.evaluate(() => window.__royaleRenderer.info.memory.geometries);
await page.click('#start-btn');
await page.waitForTimeout(600);
await page.evaluate(() => {
    const g = window.__royale.game;
    g.players[0].hand[0] = 'fireball';
    g.players[0].elixir = 12;
    g.towers[1].king.hp = 1;
    g.playCard(0, 0, g.towers[1].king.x, g.towers[1].king.z);
});
await page.waitForFunction(() => window.__royale.game.phase === 'ended', null, { timeout: 15000 });
await page.waitForTimeout(3200);   // 等勝利煙花同結算畫面
await page.evaluate(() => document.getElementById('menu-btn').click());
await page.waitForTimeout(600);
const st = await page.evaluate(() => ({
    geo: window.__royaleRenderer.info.memory.geometries,
    menu: !document.getElementById('screen-start').classList.contains('hidden'),
}));
check('完場返選單清場', st.geo <= baseGeo + 2, { baseGeo, afterGeo: st.geo });
check('完場之後企返喺選單', st.menu);

// T3：AI 唔會困死喺滿水（手上得貴卡都要識斷水位）
const t3 = await page.evaluate(async () => {
    window.__royale.startMatch(
        ['militia', 'swordsman', 'archers', 'pikemen', 'knight', 'ram', 'fireball', 'arrows'],
        'normal', 'single', 1);
    const g = window.__royale.game, ai = window.__royale.ai;
    let stuck = 0;
    for (let i = 0; i < 40 * 60; i++) {
        g.update(1 / 60); ai.update(1 / 60);
        if (g.players[1].elixir >= 11.9) stuck++;
        if (g.phase === 'ended') break;
    }
    return { stuckSeconds: +(stuck / 60).toFixed(1) };
});
check('AI 冇長期滿水唔出牌', t3.stuckSeconds < 5, t3);

// T4：一場完整對局跑得完，一定有結果
const t4 = await page.evaluate(async () => {
    window.__royale.startMatch(
        ['militia', 'archers', 'swordsman', 'knight', 'ram', 'fireball', 'arrows', 'elephant'],
        'hard', 'single', 1);
    const g = window.__royale.game, ai = window.__royale.ai;
    for (let i = 0; i < 600 * 60 && g.phase !== 'ended'; i++) {
        g.update(1 / 60); ai.update(1 / 60);
        if (i % 180 === 0 && g.players[0].elixir >= 6) g.playCard(0, 0, Math.random() * 8 - 4, 5);
    }
    return { phase: g.phase, simSeconds: Math.round(g.simTime), winner: g.result?.winner ?? null };
});
check('對局一定有結果', t4.phase === 'ended', t4);

// T5：手機系統手勢可以喺拖牌／落場中途送 pointercancel，而唔一定補 pointerup。
// 如果半截狀態留低，下一個普通 tap 會被當成出牌，甚至令 cardBusy 永遠鎖住鏡頭。
const interruptedInput = await page.evaluate(() => {
    window.__royale.startMatch(
        ['militia', 'archers', 'swordsman', 'knight', 'ram', 'fireball', 'arrows', 'elephant'],
        'normal', 'single', 1);
    const g = window.__royale.game, ui = window.__royale.ui;
    g.players[0].elixir = 12;
    const card = document.querySelector('#cards .card:not(.unaffordable)');
    const cr = card.getBoundingClientRect();
    const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    const event = (type, pointerId, x, y) => new PointerEvent(type, {
        bubbles: true, cancelable: true, pointerType: 'touch', pointerId, clientX: x, clientY: y,
    });
    const before = g.playedCards[0].length;
    card.dispatchEvent(event('pointerdown', 71, cx, cy));
    window.dispatchEvent(event('pointermove', 71, cx, cy + 80));
    window.dispatchEvent(event('pointercancel', 71, cx, cy + 80));
    const afterCancel = { dragIdx: ui.dragIdx, busy: ui.dragMoved, placing: ui.canvasPlacing };
    window.dispatchEvent(event('pointerup', 72, 450, 500));
    const afterLate = { played: g.playedCards[0].length, selected: ui.selectedIdx };

    // 揀卡後喺戰場拖動係另一條 input path；取消後仍可保留揀卡，但唔可以落牌。
    card.dispatchEvent(event('pointerdown', 73, cx, cy));
    window.dispatchEvent(event('pointerup', 73, cx, cy));
    const holder = document.querySelector('#canvas-holder');
    holder.dispatchEvent(event('pointerdown', 74, 450, 500));
    holder.dispatchEvent(event('pointermove', 74, 450, 520));
    window.dispatchEvent(event('pointercancel', 74, 450, 520));
    const placementCancel = { placing: ui.canvasPlacing, selected: ui.selectedIdx };
    holder.dispatchEvent(event('pointerup', 75, 450, 500));
    const placementLate = { played: g.playedCards[0].length, selected: ui.selectedIdx };

    const beforeHidden = g.playedCards[0].length;
    card.dispatchEvent(event('pointerdown', 81, cx, cy));
    window.dispatchEvent(event('pointermove', 81, cx, cy + 80));
    const hiddenDescriptor = Object.getOwnPropertyDescriptor(document, 'hidden');
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
    const hiddenCancel = { dragIdx: ui.dragIdx, moved: ui.dragMoved };
    if (hiddenDescriptor) Object.defineProperty(document, 'hidden', hiddenDescriptor);
    else delete document.hidden;
    window.dispatchEvent(event('pointerup', 82, 450, 500));
    const hiddenLate = { played: g.playedCards[0].length };
    return { before, afterCancel, afterLate, placementCancel, placementLate,
        beforeHidden, hiddenCancel, hiddenLate };
});
check('pointercancel 取消拖牌後唔會喺遲到 pointerup 誤出牌',
    interruptedInput.afterCancel.dragIdx === -1
    && interruptedInput.afterCancel.placing === false
    && interruptedInput.afterLate.played === interruptedInput.before,
    interruptedInput);
check('pointercancel 取消戰場落牌後唔會誤落牌，揀卡狀態仍可用',
    interruptedInput.placementCancel.placing === false
    && interruptedInput.placementCancel.selected >= 0
    && interruptedInput.placementLate.played === interruptedInput.before
    && interruptedInput.placementLate.selected >= 0,
    interruptedInput);
check('visibilitychange(hidden) 都會清走半截拖牌',
    interruptedInput.hiddenCancel.dragIdx === -1
    && interruptedInput.hiddenCancel.moved === false
    && interruptedInput.hiddenLate.played === interruptedInput.beforeHidden,
    interruptedInput);

checkNoErrors(r.errors);
await r.close();
finish('match');
