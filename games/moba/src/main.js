// 主程式：載入 → 選英雄 → 開場 → 收場。
//
// 固定步長跑模擬（TICK = 1/30），畫面就照 requestAnimationFrame 有幾快畫幾快。
// 兩樣分開嘅原因同 sim.js 唔 import three.js 一樣：規則要可重現，
// 畫面要跟硬件。一個 120Hz 螢幕唔應該令小兵行快一倍。

import { Assets } from './assets.js?v=assets-30';
import { armTap } from './tap.js?v=assets-30';
import { Sim } from './sim.js?v=assets-30';
import { createBot, updateBots } from './ai.js?v=assets-30';
import { View } from './view.js?v=assets-30';
import { Hud } from './hud.js?v=assets-30';
import { createInput } from './input.js?v=assets-30';
import { CHAMPIONS, CHAMPION_IDS } from './champions.js?v=assets-30';
import { TEAM, TICK, teamName } from './constants.js?v=assets-30';
import { CHAMPION_LOOK } from './looks.js?v=assets-30';
import { Sfx } from './sfx.js?v=assets-30';
import { planFrame } from './pace.js?v=assets-30';
import { settings } from './settings.js?v=assets-30';
import { renderPortraits } from './portraits.js?v=assets-30';

const $ = (sel) => document.querySelector(sel);

const state = {
    assets: null, sim: null, view: null, hud: null, input: null, bots: [], sfx: null,
    acc: 0, last: 0, running: false, raf: 0, 戰場好: null,
    tickCount: 0,        // updateBots 用嚟逐格對調決策次序
};

// 暫停唔可以再靠一個 boolean：設定面板、切走頁面、WebGL context 可能同時
// 發生。用 reason set，解除其中一個唔會意外將另一個一齊續返。
const pauseReasons = new Set();
const resetFrameClock = () => {
    state.last = performance.now();
    state.acc = 0;
};
function pauseFor(reason, message) {
    const newlyPaused = pauseReasons.size === 0;
    pauseReasons.add(reason);
    state.running = false;
    if (message && newlyPaused) state.hud?.flash(message);
}
function resumeFor(reason, message) {
    if (!pauseReasons.delete(reason) || pauseReasons.size) return false;
    if (state.sim?.over) return false;
    resetFrameClock();
    state.running = true;
    if (message) state.hud?.flash(message);
    return true;
}

// ---------- 載入 ----------
async function boot() {
    const bar = $('#load-bar');
    const label = $('#load-label');
    state.assets = new Assets();
    try {
        await state.assets.load((分, { 落咗, 完咗, 件數 }) => {
            const MB = 落咗 ? `${(落咗 / 1048576).toFixed(1)} MB` : '';
            if (分 === null) {
                // 伺服器冇畀 Content-Length，總數真係唔知。唔好報一個假百分比
                // ——出一條唔知幾耐嘅 bar，靠「落咗幾多 MB」交代。
                bar.classList.add('unknown');
                label.textContent = `載入資產…　${MB}`;
            } else {
                bar.classList.remove('unknown');
                bar.style.width = `${Math.round(分 * 100)}%`;
                label.textContent = `載入資產 ${Math.round(分 * 100)}%　${MB}　${完咗}/${件數}`;
            }
        });
    } catch (err) {
        // 重試都仲係唔得先至到呢度。唔可以就咁死喺度——畀返一條路玩家自己
        // 行，好過要佢自己諗到「重新整理」。
        label.textContent = `載入失敗：${err.message}`;
        const again = document.createElement('button');
        again.id = 'load-retry';
        again.textContent = '再試一次';
        again.addEventListener('click', () => location.reload());
        label.after(again);
        throw err;
    }
    label.textContent = '整緊英雄頭像…';
    try {
        state.portraits = await renderPortraits(state.assets, CHAMPION_IDS);
    } catch (err) {
        state.portraits = {};          // 冇頭像唔應該開唔到遊戲
        console.warn('頭像 render 失敗', err);
    }
    state.sfx = new Sfx();
    state.sfx.setEnabled(settings.get('sfx'));
    state.sfx.setMusic(settings.get('music'));
    $('#loading').classList.add('hidden');
    showSelect();

    /*
     * 戰場嗰批（arena／weapons／小兵，共 576 KB）喺揀人版一眼都見唔到,
     * 所以擺到揀人版出咗之後先落。
     *
     * 擺喺 `renderPortraits` 之前定之後，實測係**一樣**（13.0 vs 13.1 秒,
     * 兩次都係揀人版嗰陣落咗 1,946 KB）——因為 render 六個頭像嗰段係 CPU
     * 密集、網絡係閒住嘅，第二批喺嗰段時間度落，本來就搶唔到頻寬。
     * 擺喺呢度純粹係次序上清楚啲：「揀人版出咗」先至係一個真正嘅分界。
     */
    const 戰場 = state.assets.載戰場();
    // 冇人 await 佢就會變成 unhandled rejection（喺瀏覽器度即係一個 error）。
    // 呢句唔係吞咗個錯——`state.戰場好` 仲係 rejected，撳「開打」嗰陣照樣接到。
    戰場.catch((err) => console.warn('[MOBA] 戰場資產載入失敗', err));
    state.戰場好 = 戰場;
}

// ---------- 選英雄 ----------
function showSelect() {
    const grid = $('#pick-grid');
    grid.innerHTML = '';
    // 記住上次揀邊個：一個每次都要由頭揀過嘅選人畫面好煩
    let chosen = CHAMPION_IDS.includes(settings.get('champion'))
        ? settings.get('champion') : CHAMPION_IDS[0];
    const cards = new Map();
    for (const id of CHAMPION_IDS) {
        const c = CHAMPIONS[id];
        const card = document.createElement('button');
        card.className = 'pick-card';
        const art = state.portraits?.[id];
        card.innerHTML = (art ? `<img class="face" src="${art}" alt="">` : '')
            + `<b>${c.name}</b><span class="title">${c.title}</span>`
            + `<span class="role">${c.role}</span>`
            + `<span class="passive">${c.passive.name}：${c.passive.text}</span>`
            + `<span class="kit">${c.abilities.map(a => `<i>${a.key}</i> ${a.name}`).join('　')}</span>`;
        card.style.setProperty('--tint', `#${CHAMPION_LOOK[id].ringColour.toString(16).padStart(6, '0')}`);
        // 選人格網係 overflow-y: auto，同商店一樣——手指喺度飄一飄，
        // iOS 就唔會合成 click，隻英雄揀唔到。呢個係成隻遊戲第一個互動。
        armTap(card, () => {
            chosen = id;
            for (const [, k] of cards) k.classList.remove('on');
            card.classList.add('on');
        });
        grid.append(card);
        cards.set(id, card);
    }
    cards.get(chosen).classList.add('on');
    $('#select').classList.remove('hidden');

    /*
     * 戰場資產可能仲落緊。撳「開打」而場都未起好係唔得嘅，但**「撳咗冇反應」
     * 比「等耐咗」更難頂**（ADR-209 同一句）——所以個掣照撳得，撳完就交代
     * 緊「仲差幾多」，落完自己入場。
     */
    const go = $('#pick-go');
    const 原文 = go.textContent;
    let 撳咗 = false;
    const 入場 = () => {
        settings.set('champion', chosen);
        $('#select').classList.add('hidden');
        go.textContent = 原文;
        go.disabled = false;
        startMatch(chosen);
    };
    armTap(go, () => {
        if (撳咗) return;              // 撳兩下唔可以開兩場
        撳咗 = true;
        if (!state.戰場好) return 入場();
        go.disabled = true;
        go.textContent = '準備戰場…';
        state.戰場好.then(入場, (err) => {
            撳咗 = false;
            go.disabled = false;
            go.textContent = 原文;
            const p = $('#select .hint');
            if (p) p.textContent = `戰場資產載入失敗（${err?.message ?? '網絡問題'}），請重新整理再試。`;
        });
    });
}

// ---------- 開場 ----------
function startMatch(playerChamp) {
    const others = CHAMPION_IDS.filter(id => id !== playerChamp);
    const shuffled = others.slice().sort(() => Math.random() - 0.5);
    const lineups = {
        [TEAM.BLUE]: [playerChamp, shuffled[0], shuffled[1]],
        [TEAM.RED]: [shuffled[2], shuffled[3], shuffled[4]],
    };
    const sim = new Sim({ seed: (Math.random() * 1e9) | 0, lineups, playerIndex: 0 });
    state.sim = sim;
    pauseReasons.clear();
    // 玩家嗰個唔開 bot：唔可以有一個隱形嘅第二隻手幫你揸
    state.bots = sim.champions.filter(c => !c.isPlayer).map(c => createBot(sim, c));
    state.tickCount = 0;

    const canvas = $('#gl');
    state.hud = new Hud($('#hud'), sim);
    state.view = new View(canvas, state.assets, sim, {
        quality: pickQuality(),
        onCast: (ab) => state.hud.showCast(ab),
        onQuality: (q) => state.hud.markQuality(q),
        // 掉 context 唔係死症，係一段暫停。之前呢度叫玩家重新開一局，
        // 但個 context 大多數情況下幾百毫秒之後就返嚟——即係一場打到一半
        // 嘅波，因為鎖咗一下屏就白白報銷。
        onContextLost: () => {
            pauseFor('context', '顯示裝置重置緊，等一等…');
        },
        onContextRestored: () => {
            // 只有 context 呢個 reason 完成先會續；玩家開住設定／切走緊時
            // 仍然保持停頓。resetFrameClock 亦避免第一格追返停咗嘅時間。
            resumeFor('context', '返嚟喇，繼續');
        },
    });
    state.hud.onSetting = (key, value) => {
        if (key === 'sfx') state.sfx.setEnabled(value);
        else if (key === 'music') state.sfx.setMusic(value);
        else if (key === 'quality') state.view.setQuality(value);
    };
    state.hud.onPause = (paused) => {
        if (paused) pauseFor('manual', '已暫停');
        else resumeFor('manual', '繼續');
    };
    state.hud.markQuality(state.view.quality);
    state.hud.setPortrait(state.portraits?.[playerChamp]);
    state.input = createInput(canvas, state.view, sim, state.hud);
    $('#hud').classList.remove('hidden');

    watchViewport();
    看住切走();
    onResize();
    resetFrameClock();
    state.running = true;
    state.raf = requestAnimationFrame(frame);
    window.__mobaReady = true;
    window.__sim = sim;      // 畀瀏覽器測試查狀態
    window.__view = state.view;
    window.__hud = state.hud;
}

function pickQuality() {
    const saved = settings.get('quality');
    if (['low', 'medium', 'high'].includes(saved)) return saved;
    const mem = navigator.deviceMemory ?? 4;
    const coarse = matchMedia('(pointer: coarse)').matches;
    if (mem <= 3) return 'low';
    return coarse ? 'medium' : 'high';
}

// iOS 喺轉向嗰刻報返嘅尺寸係舊嘅，所以唔可以「收到一次訊號就量一次」。
// 呢個 repo 喺賽車嗰邊已經踩過同一個坑（ADR-075）：每個訊號都重新量，
// 再加 ResizeObserver 兜底。
function onResize() {
    state.view?.resize();
    for (const d of [60, 220, 500]) setTimeout(() => state.view?.resize(), d);
}

/*
 * 切走咗就停低。
 *
 * 實測：override `document.hidden` 再派 `visibilitychange`（同 Tower
 * `tests/flow.mjs` 一樣嘅量法），隱藏六秒之後 `__sim.time` 由 2.8 行到 9.8
 * ——**你切去另一個 tab，場波照打**。一場波跑十六分鐘，你去覆個訊息返嚟
 * 就發現自己啱啱送咗一血。
 *
 * Tower（ADR-190 嗰批）老早就定咗做法：停低、講明點解、而且**返嚟唔會偷偷
 * 續**。呢度跟同一套。冇偷偷續係因為你返嚟嗰一刻手指仲未擺返個位——一返嚟
 * 就即刻恢復，等於幫你按咗「繼續」但你未準備好。
 *
 * `last` 要重設，唔係嘅話第一格個 dt 會係「停咗幾耐」，即刻追一大步。
 * （呢個坑喺上面 `onContextRestored` 已經踩過一次，同一個處理。）
 */
function 看住切走() {
    const 繼續 = () => {
        resumeFor('visibility', '繼續');
    };
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (state.sim?.over) return;
            // 即使玩家本身開住設定，都要記住「切走」呢個 reason，否則返嚟
            // 關設定會錯誤地續波。
            pauseFor('visibility');
        } else if (pauseReasons.has('visibility')) {
            state.hud?.flash('你切走咗，已經幫你暫停 — 撳一下繼續');
        }
    });
    // 返嚟之後撳／掂／禁任何一下先至真係續。
    for (const ev of ['pointerdown', 'keydown', 'touchstart']) {
        window.addEventListener(ev, 繼續, { passive: true });
    }
}

function watchViewport() {
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    new ResizeObserver(() => state.view?.resize()).observe($('#stage'));
}

// ---------- 主迴圈 ----------
function frame(now) {
    state.raf = requestAnimationFrame(frame);
    if (!state.running) return;
    const dt = (now - state.last) / 1000;
    state.last = now;

    // 行幾多格、剩幾多、畫面內插用邊個 alpha，全部由 pace.js 一次答晒。
    // 之前呢三樣係喺呢度順手做嘅：dt 夾 0.25 但六格只食 0.2，兩個上限各自
    // 講一套；而 alpha 根本冇人計，所以 120 Hz 螢幕上面畫面一秒只郁三十次。
    const plan = planFrame(state.acc, dt);
    state.acc = plan.acc;
    // sim.events 每一步開頭就清空，而一幀可能行幾步。所以要喺步與步之間
    // 收埋一齊再交畀畫面層——之前畫面層一幀先讀一次，等於掉咗除咗最後一步
    // 以外嘅所有事件，施法、打擊、傷害數字全部隨機唔見咗。
    const events = [];
    for (let i = 0; i < plan.steps; i++) {
        state.input.update();
        updateBots(state.bots, TICK, state.tickCount++);
        state.view.beforeStep();
        state.sim.step(TICK);
        const stepEvents = state.sim.drain();
        events.push(...stepEvents);
        state.hud.consume(stepEvents);
        state.sfx.consume(stepEvents, state.sim);
        if (state.sim.over) break;
    }
    state.view.update(dt, events, plan.alpha);
    state.hud.update();
    if (state.sim.over) finish();
}

function finish() {
    pauseReasons.clear();
    state.running = false;
    const won = state.sim.over.winner === state.sim.player.team;
    const box = $('#result');
    const p = state.sim.player;
    box.querySelector('h2').textContent = state.sim.over.winner == null ? '打和'
        : won ? '勝利' : '落敗';
    box.querySelector('h2').className = won ? 'win' : 'lose';
    box.querySelector('.detail').innerHTML =
        `${teamName(state.sim.over.winner ?? TEAM.BLUE)}`
        + `${state.sim.over.byTime ? '（時限判定：剩餘建築較多）' : '推爆水晶'}`
        + `　${Math.floor(state.sim.time / 60)} 分 ${String(Math.floor(state.sim.time % 60)).padStart(2, '0')} 秒`;
    box.querySelector('.sheet').innerHTML = scoreSheet();
    box.classList.remove('hidden');
    state.sfx.stinger(won);
    state.input?.destroy();
    box.querySelector('button').onclick = () => location.reload();
}

// 戰後計分板：兩隊六個人齊晒。玩完一場淨係得一句「你 3/1/4」，
// 睇唔出隊友做過咩、對面邊個食糊，成場波嘅記憶就冇咗。
function scoreSheet() {
    const sim = state.sim;
    const rows = (team) => sim.champions.filter(c => c.team === team).map((c) => {
        const art = state.portraits?.[c.champId];
        const items = c.items.length ? `${c.items.length} 件` : '－';
        return `<div class="srow${c.isPlayer ? ' me' : ''}">`
            + (art ? `<img src="${art}" alt="">` : '<i class="noface"></i>')
            + `<span class="n">${c.def.name}</span>`
            + `<span class="l">${c.level} 級</span>`
            + `<span class="k">${c.kills}/${c.deaths}/${c.assists}</span>`
            + `<span class="c">補刀 ${c.cs}</span>`
            + `<span class="i">${items}</span></div>`;
    }).join('');
    const head = (team, label) =>
        `<div class="steam ${team === TEAM.BLUE ? 'blue' : 'red'}">${label}`
        + `<span>${sim.champions.filter(c => c.team === team).reduce((a, c) => a + c.kills, 0)} 人頭</span></div>`;
    return head(TEAM.BLUE, '藍方') + rows(TEAM.BLUE) + head(TEAM.RED, '紅方') + rows(TEAM.RED);
}

boot();
