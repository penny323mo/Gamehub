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
    out.finished = s.finished;
    out.roundEnd = s.round;
    // 跑完之後再收成績唔應該再加分
    out.extra = s.record([{ label: '你', colour: 0, player: true, place: 1 }]);
    out.pointsAfterExtra = s.points['你'];

    // 續得返：另開一個 Season 由 localStorage 讀
    const again = new Season(['a', 'b', 'c']);
    const loaded = again.load();
    out.resume = { loaded, round: again.round, mine: again.points['你'] };
    again.clear();
    out.afterClear = new Season(['a', 'b', 'c']).load();
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
check('完咗再收成績唔會再加分',
    run.extra === null && run.pointsAfterExtra === 16, run);
check('中途離開續得返', run.resume.loaded === true && run.resume.round === 3
    && run.resume.mine === 16, run.resume);
check('清除之後唔會再續', run.afterClear === false, run.afterClear);

// T3：入返遊戲——撳錦標賽會鎖住當場賽道、迫夠對手、完賽會派分
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
    out.round = season.round;
    season.clear();
    return out;
});
console.log('  ', JSON.stringify(live));
check('撳錦標賽會開場', live.active === true, live);
check('鎖住當場指定賽道', live.lockedTrack === true, live);
check('獨自計時會被迫升到最少兩架對手', live.forcedRivals >= 2, live.forcedRivals);
check('由第一條賽道開始', live.firstTrack === 'turbo', live.firstTrack);
check('完賽畫面出到積分榜', live.panelVisible === true && live.rowCount >= 3, live);
check('「下一場」寫住下一條賽道', /下一場/.test(live.nextLabel), live.nextLabel);

checkNoErrors(r.errors);
await r.close();
finish('season');
