// 錦標賽：派分公道、跨場累積、續得返、跑完會封冠軍。

import { openRacer, check, checkNoErrors, finish } from './lib/harness.mjs';

const r = await openRacer();
const { page } = r;

// T1：分數表——名次每高一位多兩分，人數少咗自動縮
const pts = await page.evaluate(async () => {
    const { pointsFor } = await import('./src/season.js');
    return {
        five: [1, 2, 3, 4, 5].map(p => pointsFor(p, 5)),
        three: [1, 2, 3].map(p => pointsFor(p, 3)),
        bad: [pointsFor(0, 5), pointsFor(6, 5), pointsFor(NaN, 5)],
    };
});
console.log('  ', JSON.stringify(pts));
check('五架車派 10/8/6/4/2', pts.five.join() === '10,8,6,4,2', pts.five);
check('三架車自動縮成 6/4/2', pts.three.join() === '6,4,2', pts.three);
check('名次無效唔會派分', pts.bad.every(v => v === 0), pts.bad);

// T2：跨場累積 + 同分睇最佳名次 + 存得返
const run = await page.evaluate(async () => {
    const { Season } = await import('./src/season.js');
    localStorage.removeItem('racer-season-v1');
    localStorage.removeItem('racer-season-records-v1');
    const s = new Season(['a', 'b', 'c']).start();
    const race = (order) => s.record(order.map((label, i) => ({
        label, colour: 0, player: label === '你', place: i + 1,
    })));

    const out = { first: s.currentTrack, round0: s.round };
    race(['阿烈', '你', '阿藍']);          // 你 4 分
    out.afterOne = { ...s.points };
    out.round1 = s.round;
    out.track1 = s.currentTrack;
    race(['你', '阿藍', '阿烈']);          // 你 +6 = 10；阿烈 6+2 = 8；阿藍 2+4 = 6
    out.afterTwo = s.standings();
    race(['你', '阿藍', '阿烈']);          // 你 +6 = 16；阿藍 +4 = 10；阿烈 +2 = 10
    out.final = s.standings();
    out.career = JSON.parse(JSON.stringify(s.career));
    out.turbo = s.trackRecord('a');
    out.finished = s.finished;
    out.roundEnd = s.round;
    // 跑完之後再收成績唔應該再加分
    out.extra = s.record([{ label: '你', colour: 0, player: true, place: 1 }]);
    out.pointsAfterExtra = s.points['你'];

    // 續得返：另開一個 Season 由 localStorage 讀
    const again = new Season(['a', 'b', 'c']);
    const loaded = again.load();
    out.resume = { loaded, round: again.round, mine: again.points['你'], career: again.career };
    again.clear();
    out.afterClear = new Season(['a', 'b', 'c']).load();
    out.careerAfterClear = new Season(['a', 'b', 'c']).career;
    again.clearRecords();
    return out;
});
console.log('  ', JSON.stringify(run));
check('開波由第一場開始', run.first === 'a' && run.round0 === 0, run);
check('跑完一場入下一場', run.round1 === 1 && run.track1 === 'b', run);
check('分數逐場累積', run.afterOne['你'] === 4, run.afterOne);
check('第二場之後你排第一', run.afterTwo[0].label === '你' && run.afterTwo[0].points === 10, run.afterTwo);
check('贏兩場嘅排第一', run.final[0].label === '你' && run.final[0].wins === 2, run.final);
// 阿烈同阿藍都係 10 分：阿烈攞過一次第一，阿藍冇——countback 要分得開
check('同分要靠 countback 分高下',
    run.final[1].points === run.final[2].points
    && run.final[1].label === '阿烈' && run.final[1].wins === 1
    && run.final[2].label === '阿藍' && run.final[2].wins === 0, run.final);
check('三場跑完就完結', run.finished === true && run.roundEnd === 3, run);
check('完成一屆會留下冠軍同最佳總排名', run.career.seasons === 1
    && run.career.titles === 1 && run.career.bestPlace === 1, run.career);
check('每條分站各自記出賽、勝場同最佳名次', run.turbo.races === 1
    && run.turbo.wins === 0 && run.turbo.bestPlace === 2, run.turbo);
check('完咗再收成績唔會再加分',
    run.extra === null && run.pointsAfterExtra === 16, run);
check('中途離開續得返', run.resume.loaded === true && run.resume.round === 3
    && run.resume.mine === 16 && run.resume.career.titles === 1, run.resume);
check('清除之後唔會再續', run.afterClear === false, run.afterClear);
check('完結今屆唔會清走生涯紀錄', run.careerAfterClear.seasons === 1
    && run.careerAfterClear.titles === 1, run.careerAfterClear);

// T3：入返遊戲——撳錦標賽會鎖住當場賽道、迫夠對手、完賽會派分
await page.setViewportSize({ width: 320, height: 568 });
const live = await page.evaluate(async () => {
    const { season, setRivals, startSeason, buildTrack, TRACKS } = window.__racer;
    season.clear();
    setRivals(0);                                 // 特登揀「獨自計時」
    buildTrack(TRACKS[TRACKS.length - 1].id);     // 特登揀第三條賽道
    startSeason();
    const out = {
        active: season.active,
        lockedTrack: window.__racer.trackDef.id === season.currentTrack,
        forcedRivals: window.__racer.rivalCount,
        firstTrack: season.currentTrack,
    };
    // 派一場成績入去，睇吓面板出唔出到
    const rows = window.__racer.rivals.results(100, 3).map((r, i) => ({ ...r, place: i + 1 }));
    season.record(rows);
    window.__racer.renderSeasonPanel();
    out.panelVisible = !document.getElementById('season-box').classList.contains('hidden');
    out.rowCount = document.getElementById('season-rows').children.length;
    out.nextLabel = document.getElementById('next-race-btn').textContent;
    out.roundRecord = document.getElementById('season-record-note').textContent;
    out.round = season.round;
    // 補埋兩場，驗證總成績同 menu 生涯紀錄真係呈現。
    season.record(rows);
    season.record(rows);
    window.__racer.renderSeasonPanel();
    window.__racer.toMenu();
    out.doneRecord = document.getElementById('season-record-note').textContent;
    out.menuCareer = document.getElementById('season-career').textContent;
    out.trackCareer = document.getElementById('season-track-career').textContent;
    await new Promise(resolve => requestAnimationFrame(resolve));
    const panel = document.querySelector('#screen-start .panel');
    const cards = [...document.querySelectorAll('#season-records > div')].map(el => {
        const b = el.getBoundingClientRect();
        return { left: b.left, right: b.right, width: b.width };
    });
    out.recordCards = { cards, panelWidth: panel.clientWidth, panelScroll: panel.scrollWidth };
    season.clear();
    season.clearRecords();
    return out;
});
console.log('  ', JSON.stringify(live));
check('撳錦標賽會開場', live.active === true, live);
check('鎖住當場指定賽道', live.lockedTrack === true, live);
check('獨自計時會被迫升到最少兩架對手', live.forcedRivals >= 2, live.forcedRivals);
check('由第一條賽道開始', live.firstTrack === 'turbo', live.firstTrack);
check('完賽畫面出到積分榜', live.panelVisible === true && live.rowCount >= 3, live);
check('「下一場」寫住下一條賽道', /下一場/.test(live.nextLabel), live.nextLabel);
check('中途面板講清楚分站已保存', /分站紀錄已保存/.test(live.roundRecord), live.roundRecord);
check('完成三場會顯示生涯屆數同最佳名次', /生涯 1 屆/.test(live.doneRecord)
    && /最佳第/.test(live.doneRecord), live.doneRecord);
check('開始畫面保留錦標賽生涯紀錄', /1 屆/.test(live.menuCareer)
    && /戰/.test(live.trackCareer), live);
check('兩張生涯紀錄卡唔會撐闊開始面板', live.recordCards.cards.length === 2
    && live.recordCards.panelScroll <= live.recordCards.panelWidth + 1
    && live.recordCards.cards.every(card => card.width > 90), live.recordCards);

// T4：自選賽程——揀邊幾條、跑幾多場由玩家話事，而且要續得返
const custom = await page.evaluate(async () => {
    const { Season } = await import('./src/season.js');
    localStorage.removeItem('racer-season-v1');
    localStorage.removeItem('racer-season-hist-v1');
    const pool = ['a', 'b', 'c'];
    const one = new Season(pool).start(['c']);
    const out = { oneRounds: one.totalRounds, oneTrack: one.currentTrack };
    one.record([{ label: '你', colour: 0, player: true, place: 1 }]);
    out.oneFinished = one.finished;

    // 次序跟玩家揀嗰個，重複同唔存在嘅賽道要濾走
    const two = new Season(pool).start(['c', 'a', 'c', 'zz']);
    out.order = [...two.trackIds];
    two.record([{ label: '你', colour: 0, player: true, place: 1 }]);
    out.secondTrack = two.currentTrack;

    // 續得返：賽程要跟存檔，唔可以跌返做「全部賽道」
    const resumed = new Season(pool);
    resumed.load();
    out.resumedIds = [...resumed.trackIds];
    out.resumedTrack = resumed.currentTrack;

    // 賽程空／全部無效 ⇒ 跌返成個池，唔可以開零場
    out.emptyIds = [...new Season(pool).start([]).trackIds];
    out.junkIds = [...new Season(pool).start(['zz', 'yy']).trackIds];
    new Season(pool).clear();
    localStorage.removeItem('racer-season-hist-v1');
    return out;
});
console.log('  ', JSON.stringify(custom));
check('揀一條就得一場', custom.oneRounds === 1 && custom.oneTrack === 'c', custom);
check('一場跑完即完結', custom.oneFinished === true, custom);
check('賽程跟玩家次序兼去重', custom.order.join() === 'c,a', custom.order);
check('第二場行到賽程第二條', custom.secondTrack === 'a', custom.secondTrack);
check('續返嗰屆用返存檔賽程',
    custom.resumedIds.join() === 'c,a' && custom.resumedTrack === 'a', custom);
check('空賽程跌返全部賽道', custom.emptyIds.join() === 'a,b,c', custom.emptyIds);
check('全部無效都跌返全部賽道', custom.junkIds.join() === 'a,b,c', custom.junkIds);

// T5：歷屆紀錄——跑完最後一場即刻封存，唔使等玩家撳「完結」
const hist = await page.evaluate(async () => {
    const { Season, loadHistory, clearHistory } = await import('./src/season.js');
    localStorage.removeItem('racer-season-v1');
    clearHistory();
    const pool = ['a', 'b', 'c'];
    const race = (s, order) => s.record(order.map((label, i) => ({
        label, colour: 0, player: label === '你', place: i + 1,
    })));
    const s = new Season(pool).start(['a', 'b']);
    race(s, ['阿烈', '你', '阿藍']);
    const midway = loadHistory().length;          // 未跑完唔應該封存
    race(s, ['你', '阿藍', '阿烈']);
    const after = loadHistory();
    // 玩家撳「完結錦標賽」會 clear()，紀錄唔可以跟住冇埋
    s.clear();
    const afterClear = loadHistory().length;

    // 再跑幾屆：最新嗰屆排頭，最多留五屆
    for (let i = 0; i < 6; i++) {
        const t = new Season(pool).start(['a']);
        race(t, i % 2 ? ['你', '阿烈'] : ['阿烈', '你']);
        t.clear();
    }
    const many = loadHistory();
    clearHistory();
    return {
        midway, count: after.length, top: after[0], afterClear,
        capped: many.length, newestFirst: many[0].playerPlace,
        cleared: loadHistory().length,
    };
});
console.log('  ', JSON.stringify(hist));
check('未跑完唔會封存', hist.midway === 0, hist.midway);
check('跑完最後一場即刻入歷屆榜', hist.count === 1, hist);
// 你 4 + 6 = 10 分，阿烈 6 + 2 = 8 分 ⇒ 你冠軍
check('封存記低冠軍同你嘅名次',
    hist.top.champion === '你' && hist.top.playerPlace === 1
    && hist.top.rounds === 2 && hist.top.tracks.join() === 'a,b', hist.top);
check('清咗嗰屆，歷屆紀錄仍然在', hist.afterClear === 1, hist.afterClear);
check('最多留五屆', hist.capped === 5, hist.capped);
check('最新嗰屆排最前', hist.newestFirst === 1, hist.newestFirst);
check('清除歷屆紀錄清得走', hist.cleared === 0, hist.cleared);

// T6：入返遊戲——揀賽程嘅掣、掣上面嘅場數、歷屆榜都要真係郁到
const ui = await page.evaluate(async () => {
    const { setSeasonList, season, clearSeasonHistory, TRACKS, updateSeasonMenu } = window.__racer;
    season.clear();
    clearSeasonHistory();
    setSeasonList(TRACKS.map(t => t.id));
    const seg = document.getElementById('season-track-seg');
    const btn = (id) => [...seg.children].find(b => b.dataset.track === id);
    const out = {
        trackCount: TRACKS.length,
        chips: seg.children.length,
        allOn: [...seg.children].every(b => b.classList.contains('on')),
    };

    btn(TRACKS[1].id).click();                       // 撳走其中一條
    out.afterToggle = window.__racer.seasonList.length;
    out.label = document.getElementById('season-btn').textContent;
    out.midOn = btn(TRACKS[1].id).classList.contains('on');

    // 撳走淨低嗰啲，最少要留一條
    for (const t of TRACKS) if (t.id !== TRACKS[1].id) btn(t.id).click();
    out.floor = window.__racer.seasonList.length;

    // 撳返轉頭要跟返賽道原本次序，唔係跟撳嘅次序
    setSeasonList([TRACKS[2].id]);
    btn(TRACKS[0].id).click();
    out.reorder = window.__racer.seasonList.join();

    // 冇存檔嘅話，預設賽程係正向三條，唔係全部六條
    localStorage.removeItem('racer-season-list');
    const { loadSeasonList } = await import('./src/settings.js');
    const { DEFAULT_SEASON } = await import('./src/tracks.js');
    out.defaultList = loadSeasonList(TRACKS.map(t => t.id), DEFAULT_SEASON).join();
    out.reverseIds = TRACKS.filter(t => t.reverse).map(t => t.id).join();

    // 歷屆榜：冇紀錄唔顯示，有紀錄就一屆一行
    const box = document.getElementById('season-history');
    out.emptyHidden = box.classList.contains('hidden');
    localStorage.setItem('racer-season-hist-v1', JSON.stringify([
        { at: Date.now(), tracks: ['turbo'], rounds: 1, champion: '阿烈', championPoints: 10, playerPlace: 2, playerPoints: 8, standings: [] },
    ]));
    updateSeasonMenu();
    out.shown = !box.classList.contains('hidden');
    out.rows = box.querySelectorAll('.stand-row').length;
    out.text = box.textContent;
    document.getElementById('season-hist-clear').click();
    out.afterClearHidden = box.classList.contains('hidden');

    setSeasonList(TRACKS.map(t => t.id));
    return out;
});
console.log('  ', JSON.stringify(ui));
check('每條賽道各有一個掣，預設全開',
    ui.chips === ui.trackCount && ui.trackCount === 6 && ui.allOn === true, ui);
check('撳一下就剔走嗰條',
    ui.midOn === false && ui.afterToggle === ui.trackCount - 1, ui);
check('掣面寫住實際場數', new RegExp(`${ui.trackCount - 1} 場`).test(ui.label), ui.label);
check('唔畀剔到一條都唔剩', ui.floor === 1, ui.floor);
check('加返賽道跟賽道次序排', ui.reorder === 'turbo,touge', ui.reorder);
check('預設賽程係正向三條，唔係全部賽道',
    ui.defaultList === 'turbo,coast,touge', ui.defaultList);
check('逆向賽道有自己嘅 id',
    ui.reverseIds === 'turbo-rev,coast-rev,touge-rev', ui.reverseIds);
check('冇歷屆紀錄就唔顯示', ui.emptyHidden === true, ui);
check('有紀錄就出到歷屆榜', ui.shown === true && ui.rows === 1 && /阿烈/.test(ui.text), ui);
check('清除掣清得走歷屆榜', ui.afterClearHidden === true, ui);

// T7：完賽後撳「再跑一次」係練習，唔可以偷走賽程一場
// 舊行為：record() 唔理你實際跑咗邊條，照計落 currentTrack。重跑第一條
// 賽道嘅成績會記落第二條名下，賽程無端少一場，最後一條永遠跑唔到。
const rerun = await page.evaluate(async () => {
    const { season, setSeasonList, startSeason, rivals, TRACKS, buildTrack } = window.__racer;
    season.clear();
    localStorage.removeItem('racer-season-records-v1');
    localStorage.removeItem('racer-season-hist-v1');
    setSeasonList(TRACKS.map(t => t.id));
    startSeason();
    const rows = () => rivals.results(100, 3).map((row, i) => ({ ...row, place: i + 1 }));
    const first = TRACKS[0].id;

    const race1 = season.record(rows(), first);          // 正常跑完第一場
    const afterFirst = { round: season.round, next: season.currentTrack };
    const replay = season.record(rows(), first);         // 「再跑一次」重跑第一條
    const afterReplay = { round: season.round, next: season.currentTrack };
    // 要即刻影低分站紀錄：跑埋下一場之後 coast 就會合法咁出現
    const careerAfterReplay = JSON.parse(localStorage.getItem('racer-season-records-v1'))?.tracks ?? {};
    const race2 = season.record(rows(), season.currentTrack);   // 「下一場」
    const out = {
        counted: race1 !== null, replayCounted: replay !== null, secondCounted: race2 !== null,
        afterFirst, afterReplay, round: season.round,
        tracks: season.results.map(r => r.track),
        careerAfterReplay,
    };
    season.clear();
    localStorage.removeItem('racer-season-records-v1');
    buildTrack(TRACKS[0].id);
    return out;
});
console.log('  ', JSON.stringify(rerun));
check('正常完賽照計', rerun.counted === true && rerun.afterFirst.round === 1, rerun);
check('重跑同一條賽道唔計入賽程',
    rerun.replayCounted === false && rerun.afterReplay.round === 1
    && rerun.afterReplay.next === rerun.afterFirst.next, rerun);
check('練習賽唔會污染分站紀錄',
    rerun.careerAfterReplay[rerun.afterFirst.next] === undefined
    && rerun.careerAfterReplay.turbo.races === 1, rerun.careerAfterReplay);
check('落一場返到正常賽程',
    rerun.secondCounted === true && rerun.round === 2
    && rerun.tracks.join() === 'turbo,coast', rerun);

checkNoErrors(r.errors);
await r.close();
finish('season');
