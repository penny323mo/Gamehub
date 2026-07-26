// Codex 落嘅八個功能（ADR-014 到 ADR-021）。呢度只測「壞咗肉眼睇唔出」嘅不變式：
// 剝資料剝得乾唔乾淨、規則路徑係咪真係得一條、特效收唔收得返、code 有冇明文存。
// 純視覺（環幾靚、字幾大）唔喺呢度測，嗰啲要真機睇。

import { openRoyale, check, checkNoErrors, finish } from './lib/harness.mjs';

const DECK = ['militia', 'archers', 'swordsman', 'knight', 'ram', 'fireball', 'arrows', 'elephant'];

const r = await openRoyale();
const { page } = r;

// ADR-014 教學：新玩家先至彈，打過機嘅唔好再阻住佢。
// storage.js 有 module-level cache，所以改完存檔一定要 reload 先算數——
// 直接寫 localStorage 再問 shouldShowTutorial() 會拎到 reload 前嘅答案。
const seedSave = async (patch) => {
    await page.evaluate((p) => {
        const key = Object.keys(localStorage).find(k => k.includes('royale-save'));
        const raw = JSON.parse(localStorage.getItem(key));
        localStorage.setItem(key, JSON.stringify({ ...raw, ...p }));
    }, patch);
    await page.reload();
    await page.waitForSelector('#loading', { state: 'detached', timeout: 90000 });
    return page.evaluate(async () => (await import('./src/storage.js')).shouldShowTutorial());
};

const veteran = await page.evaluate(async () => (await import('./src/storage.js')).shouldShowTutorial());
const fresh = await seedSave({ tutorialSeen: false, wins: 0, losses: 0, draws: 0 });
const played = await seedSave({ tutorialSeen: false, wins: 3 });
const afterMark = await page.evaluate(async () => {
    const s = await import('./src/storage.js');
    s.markTutorialSeen();
    return s.shouldShowTutorial();
});
check('睇過教學就唔再彈', veteran === false);
check('全新存檔會彈教學', fresh === true);
check('有戰績嘅存檔唔會突然彈教學', played === false);
check('markTutorialSeen 之後永久收起', afterMark === false);

// ADR-015 玩家檔案：code 只可以存 salted hash，唔可以有明文
const profiles = await page.evaluate(async () => {
    const p = await import('./src/profiles.js');
    const CODE = 'hunter2secret';
    await p.createProfile('測試員', CODE.slice(0, 8));
    const dir = localStorage.getItem('royale-profiles-v1') ?? '';
    const entry = JSON.parse(dir)[0] ?? {};
    let wrongCodeRejected = false;
    try { await p.loginProfile('測試員', 'zzzzzzzz'); } catch { wrongCodeRejected = true; }
    const ok = await p.loginProfile('測試員', CODE.slice(0, 8));
    let shortRejected = false;
    try { await p.createProfile('短碼', '1'); } catch { shortRejected = true; }
    return {
        plaintextInStorage: dir.includes(CODE.slice(0, 8)),
        hasSalt: typeof entry.salt === 'string' && entry.salt.length >= 16,
        hashLooksSha256: /^[0-9a-f]{64}$/.test(entry.codeHash ?? ''),
        wrongCodeRejected, loggedIn: !!ok,
        scopedKey: p.getProfileSaveKey('royale-save-v1'),
        shortRejected,
    };
});
check('code 唔會明文存喺 localStorage', profiles.plaintextInStorage === false);
check('每個玩家有獨立 salt', profiles.hasSalt);
check('code 存成 SHA-256 hash', profiles.hashLooksSha256);
check('錯 code 登入唔到', profiles.wrongCodeRejected);
check('啱 code 登入到', profiles.loggedIn);
check('太短嘅 code 會俾拒絕', profiles.shortRejected);
check('存檔 key 跟住玩家分開', profiles.scopedKey !== 'royale-save-v1', profiles.scopedKey);

await r.enterMenuMatch();

// ADR-019 落點：預覽同真出牌行同一條規則路徑，原因碼要喺白名單內
const placement = await page.evaluate(async (deck) => {
    const { Game } = await import('./src/game.js');
    const THREE = await import('three');
    const g = new Game(new THREE.Scene(), deck, deck, {}, {});
    const probes = [
        ['militia', 3, 8], ['militia', 3, -8], ['watchtower', 3, -8],
        ['watchtower', 3, 8], ['fireball', 3, -8], ['militia', 999, 999],
    ];
    const rows = probes.map(([id, x, z]) => {
        const info = g.placementInfo(0, id, x, z);
        const legacy = g.validPlacement(0, id, x, z);
        const same = (info.pos === null) === (legacy === null)
            && (info.pos === null || (info.pos.x === legacy.x && info.pos.z === legacy.z));
        return { id, x, z, reason: info.reason, ok: !!info.pos, same };
    });
    const clamped = g.placementInfo(0, 'militia', 999, 999).pos;
    g.dispose?.();
    return { rows, clamped };
}, DECK);
for (const row of placement.rows) console.log('  ', JSON.stringify(row));
const REASONS = [null, 'invalid-card', 'blocked-building', 'building-own-side', 'locked-pocket', 'own-side'];
check('placementInfo 同 validPlacement 完全一致', placement.rows.every(x => x.same));
check('原因碼全部喺白名單內', placement.rows.every(x => REASONS.includes(x.reason)),
    placement.rows.map(x => x.reason));
check('落點會夾返入場', Math.abs(placement.clamped.x) <= 9 && Math.abs(placement.clamped.z) <= 16, placement.clamped);

// ADR-021 法術預警：一次施法一個預警、剝走內部時鐘、打完收得返
const spell = await page.evaluate(async (deck) => {
    const { Game } = await import('./src/game.js');
    const THREE = await import('three');
    const scene = new THREE.Scene();
    const g = new Game(scene, deck, deck, {}, {});
    const p = g.players[0];
    p.elixir = 12; p.hand[0] = 'fireball';
    // 只數預警環（makeSpellTelegraph 會掛 setProgress），唔好連粒子特效一齊數
    const telegraphs = () => g.effects.filter(e => e.mesh?.userData?.setProgress).length;
    const before = telegraphs();
    g.playCard(0, 0, 0, -6);
    const fx = g.serialize().fx ?? [];
    const spellFx = fx.filter(e => e.k === 'spell');
    const created = telegraphs() - before;
    for (let i = 0; i < 18; i++) g.update(1 / 60);      // 0.3 秒＝落一半
    const half = (g.serialize().fx ?? []).filter(e => e.k === 'spell').length;
    for (let i = 0; i < 120; i++) g.update(1 / 60);     // 過咗施法延遲 + 淡出
    const after = telegraphs();
    g.dispose?.();
    return {
        created, count: spellFx.length, ev: spellFx[0], half, after,
        hasInternalClock: spellFx[0] && 'at' in spellFx[0],
    };
}, DECK);
check('一次施法只生成一個預警', spell.created === 1 && spell.count === 1, { created: spell.created, count: spell.count });
check('預警事件帶半徑同剩餘時間', spell.ev?.r > 0 && spell.ev?.d > 0, spell.ev);
check('預警事件唔會送內部模擬時鐘出去', spell.hasInternalClock === false, spell.ev);
check('fx 係一次性佇列（讀完就清）', spell.half === 0);
check('施法完之後預警收得返', spell.after === 0, spell.after);

// ADR-016/017 路壓：只准用場上見到嘅單位，時間要用模擬時鐘
const pressure = await page.evaluate(async (deck) => {
    const { Game } = await import('./src/game.js');
    const THREE = await import('three');
    const g = new Game(new THREE.Scene(), deck, deck, {}, {});
    const clock0 = g.pressureClock();
    for (let i = 0; i < 60; i++) g.update(1 / 60);
    const clock1 = g.pressureClock();
    const out = { clock0, clock1, advancedBySim: +(clock1 - clock0).toFixed(2), simTime: +g.simTime.toFixed(2) };
    g.dispose?.();
    return out;
}, DECK);
check('路壓時鐘跟模擬時間', Math.abs(pressure.advancedBySim - 1) < 0.05
    && Math.abs(pressure.clock1 - pressure.simTime) < 0.01, pressure);

// ADR-018 精華重播：只留 12 秒 5Hz，敵方手牌／聖水／下一張要剝走
const replay = await page.evaluate(async (deck) => {
    window.__royale.startMatch(deck, 'normal', 'single', 1);
    const g = window.__royale.game;
    for (let i = 0; i < 40 * 60; i++) {
        g.update(1 / 60);
        if (i % 6 === 0) window.__royale.captureReplayFrame();  // 模擬每幀捕捉時機
    }
    const frames = window.__royale.replayFrames;
    const span = frames[frames.length - 1].at - frames[0].at;
    const enemy = frames.map(f => f.snapshot.players[1]);
    return {
        count: frames.length, span: +span.toFixed(2),
        enemyHandsEmpty: enemy.every(p => Array.isArray(p.hand) && p.hand.length === 0),
        enemyElixirZero: enemy.every(p => p.elixir === 0),
        enemyNextNull: enemy.every(p => p.next === null),
        myHandKept: frames[frames.length - 1].snapshot.players[0].hand.length > 0,
    };
}, DECK);
check('重播只留最近 12 秒左右', replay.span <= 12.5, replay.span);
check('重播剝走敵方手牌', replay.enemyHandsEmpty);
check('重播剝走敵方聖水', replay.enemyElixirZero);
check('重播剝走敵方下一張', replay.enemyNextNull);
check('自己手牌照留（要睇返自己點打）', replay.myHandKept);

// ADR-020 戰鬥辨識度：標記層有上限，唔會隨兵數暴漲
const markers = await page.evaluate(() => {
    const geo = window.__royaleRenderer.info.memory.geometries;
    const g = window.__royale.game;
    const p = g.players[0];
    for (let n = 0; n < 12; n++) {                      // 塞一大堆兵落場
        p.elixir = 12; p.hand[0] = 'militia';
        g.playCard(0, 0, (n % 5) - 2, 5 + (n % 3) * 0.6);
        for (let i = 0; i < 6; i++) g.update(1 / 60);
    }
    for (let i = 0; i < 120; i++) g.update(1 / 60);
    return { geoBefore: geo, geoAfter: window.__royaleRenderer.info.memory.geometries,
        units: g.aliveUnits(0).length + g.aliveUnits(1).length };
});
check('大量單位落場都唔會加 geometry', markers.geoAfter <= markers.geoBefore + 1, markers);

checkNoErrors(r.errors);
await r.close();
finish('features');
