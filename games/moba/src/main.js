// 主程式：載入 → 選英雄 → 開場 → 收場。
//
// 固定步長跑模擬（TICK = 1/30），畫面就照 requestAnimationFrame 有幾快畫幾快。
// 兩樣分開嘅原因同 sim.js 唔 import three.js 一樣：規則要可重現，
// 畫面要跟硬件。一個 120Hz 螢幕唔應該令小兵行快一倍。

import { Assets } from './assets.js';
import { Sim } from './sim.js';
import { createBot } from './ai.js';
import { View } from './view.js';
import { Hud } from './hud.js';
import { createInput } from './input.js';
import { CHAMPIONS, CHAMPION_IDS } from './champions.js';
import { TEAM, TICK, teamName } from './constants.js';
import { CHAMPION_LOOK } from './looks.js';
import { Sfx } from './sfx.js';

const $ = (sel) => document.querySelector(sel);

const state = {
    assets: null, sim: null, view: null, hud: null, input: null, bots: [], sfx: null,
    acc: 0, last: 0, running: false, raf: 0,
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
        label.textContent = `載入失敗：${err.message}`;
        throw err;
    }
    state.sfx = new Sfx();
    $('#loading').classList.add('hidden');
    showSelect();
}

// ---------- 選英雄 ----------
function showSelect() {
    const grid = $('#pick-grid');
    grid.innerHTML = '';
    let chosen = CHAMPION_IDS[0];
    const cards = new Map();
    for (const id of CHAMPION_IDS) {
        const c = CHAMPIONS[id];
        const card = document.createElement('button');
        card.className = 'pick-card';
        card.innerHTML = `<b>${c.name}</b><span class="title">${c.title}</span>`
            + `<span class="role">${c.role}</span>`
            + `<span class="passive">${c.passive.name}：${c.passive.text}</span>`
            + `<span class="kit">${c.abilities.map(a => `<i>${a.key}</i> ${a.name}`).join('　')}</span>`;
        card.style.setProperty('--tint', `#${CHAMPION_LOOK[id].ringColour.toString(16).padStart(6, '0')}`);
        card.addEventListener('click', () => {
            chosen = id;
            for (const [, k] of cards) k.classList.remove('on');
            card.classList.add('on');
        });
        grid.append(card);
        cards.set(id, card);
    }
    cards.get(chosen).classList.add('on');
    $('#select').classList.remove('hidden');
    $('#pick-go').onclick = () => {
        $('#select').classList.add('hidden');
        startMatch(chosen);
    };
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

    const canvas = $('#gl');
    state.hud = new Hud($('#hud'), sim);
    state.view = new View(canvas, state.assets, sim, {
        quality: pickQuality(),
        onCast: (ab) => state.hud.showCast(ab),
    });
    state.input = createInput(canvas, state.view, sim, state.hud);
    $('#hud').classList.remove('hidden');

    window.addEventListener('resize', onResize);
    onResize();
    state.last = performance.now();
    state.acc = 0;
    state.running = true;
    state.raf = requestAnimationFrame(frame);
    window.__mobaReady = true;
    window.__sim = sim;      // 畀瀏覽器測試查狀態
}

function pickQuality() {
    const mem = navigator.deviceMemory ?? 4;
    const coarse = matchMedia('(pointer: coarse)').matches;
    if (mem <= 3 || (coarse && mem <= 4)) return 'low';
    return coarse ? 'medium' : 'high';
}

function onResize() { state.view?.resize(); }

// ---------- 主迴圈 ----------
function frame(now) {
    state.raf = requestAnimationFrame(frame);
    if (!state.running) return;
    const dt = Math.min(0.25, (now - state.last) / 1000);
    state.last = now;

    state.acc += dt;
    let steps = 0;
    // sim.events 每一步開頭就清空，而一幀可能行幾步。所以要喺步與步之間
    // 收埋一齊再交畀畫面層——之前畫面層一幀先讀一次，等於掉咗除咗最後一步
    // 以外嘅所有事件，施法、打擊、傷害數字全部隨機唔見咗。
    const events = [];
    while (state.acc >= TICK && steps < 6) {
        state.input.update();
        for (const b of state.bots) b.update(TICK);
        state.sim.step(TICK);
        const stepEvents = state.sim.drain();
        events.push(...stepEvents);
        state.hud.consume(stepEvents);
        state.sfx.consume(stepEvents, state.sim);
        state.acc -= TICK;
        steps++;
        if (state.sim.over) break;
    }
    state.view.update(dt, events);
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
        `${teamName(state.sim.over.winner ?? TEAM.BLUE)}${state.sim.over.byTime ? '（時限判定：剩餘建築較多）' : '推爆水晶'}<br>`
        + `你：${p.def.name}　${p.kills}/${p.deaths}/${p.assists}　補刀 ${p.cs}　${p.level} 級`;
    box.classList.remove('hidden');
    state.sfx.stinger(won);
    box.querySelector('button').onclick = () => location.reload();
}

boot();
