// 主程式：載入 → 選英雄 → 開場 → 收場。
//
// 固定步長跑模擬（TICK = 1/30），畫面就照 requestAnimationFrame 有幾快畫幾快。
// 兩樣分開嘅原因同 sim.js 唔 import three.js 一樣：規則要可重現，
// 畫面要跟硬件。一個 120Hz 螢幕唔應該令小兵行快一倍。

import { Assets } from './assets.js?v=interp-19';
import { armTap } from './tap.js?v=interp-19';
import { Sim } from './sim.js?v=interp-19';
import { createBot, updateBots } from './ai.js?v=interp-19';
import { View } from './view.js?v=interp-19';
import { Hud } from './hud.js?v=interp-19';
import { createInput } from './input.js?v=interp-19';
import { CHAMPIONS, CHAMPION_IDS } from './champions.js?v=interp-19';
import { TEAM, TICK, teamName } from './constants.js?v=interp-19';
import { CHAMPION_LOOK } from './looks.js?v=interp-19';
import { Sfx } from './sfx.js?v=interp-19';
import { planFrame } from './pace.js?v=interp-19';
import { settings } from './settings.js?v=interp-19';
import { renderPortraits } from './portraits.js?v=interp-19';

const $ = (sel) => document.querySelector(sel);

const state = {
    assets: null, sim: null, view: null, hud: null, input: null, bots: [], sfx: null,
    acc: 0, last: 0, running: false, raf: 0,
    tickCount: 0,        // updateBots 用嚟逐格對調決策次序
};

// ---------- 載入 ----------
async function boot() {
    const bar = $('#load-bar');
    const label = $('#load-label');
    state.assets = new Assets();
    try {
        await state.assets.load((done, total) => {
            bar.style.width = `${(done / total) * 100}%`;
            label.textContent = `載入資產 ${done}/${total}`;
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
    armTap($('#pick-go'), () => {
        settings.set('champion', chosen);
        $('#select').classList.add('hidden');
        startMatch(chosen);
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
            state.running = false;
            state.hud.flash('顯示裝置重置緊，等一等…');
        },
        onContextRestored: () => {
            // last 要重設，否則第一格嘅 dt 係「停咗幾耐」，會即刻追一大步。
            state.last = performance.now();
            state.acc = 0;
            state.running = true;
            state.hud.flash('返嚟喇，繼續');
        },
    });
    state.hud.onSetting = (key, value) => {
        if (key === 'sfx') state.sfx.setEnabled(value);
        else if (key === 'music') state.sfx.setMusic(value);
        else if (key === 'quality') state.view.setQuality(value);
    };
    state.hud.markQuality(state.view.quality);
    state.hud.setPortrait(state.portraits?.[playerChamp]);
    state.input = createInput(canvas, state.view, sim, state.hud);
    $('#hud').classList.remove('hidden');

    watchViewport();
    onResize();
    state.last = performance.now();
    state.acc = 0;
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
