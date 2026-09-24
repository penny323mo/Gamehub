// Olden Ring — 千燈古塔: the run structure on top of voxel-musou's arena fight.
//
//   Floor N  : break the floor's quota of Hollow soldiers. Every 5th floor is a crown floor: 空冠王 (the fourth
//              officer) returns with swollen HP and must fall.
//   Clear    : the legion stops coming, lanterns flare, then the sim holds while the player takes one of three boons.
//   Ascend   : the field is cleared and restocked; enemies hit harder, stand longer and strike more often.
//   Fall     : the hero can die now (hero.js, game.mortal). The run ends on a results card with a local best.
//
// Sim-side bookkeeping only reads/writes plain numbers on `game`; the DOM overlays are owned here. Storage is
// optional: blocked localStorage just means no best record.
import { on, emit } from '../core/events.js';
import { CROWD } from '../crowd/crowd.js';
import { rng } from '../core/rng.js';

const BASE = { dmg: CROWD.dmg, officerDmg: CROWD.officerDmg, hp: CROWD.hp, captainHp: CROWD.captainHp, officerHp: CROWD.officerHp,
  maxStrikers: CROWD.maxStrikers, strikeGap: CROWD.strikeGap.map((g) => g.slice()) };
const BEST_KEY = 'olden-ring-best-v1';
const CROWN_EVERY = 5;
const NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const floorName = (n) => (n <= 10 ? NUM[n] : n < 20 ? '十' + NUM[n - 10] : NUM[(n / 10) | 0] + '十' + (n % 10 ? NUM[n % 10] : ''));

export const BOONS = [
  { id: 'edge', zh: '燼刃', en: 'Ember Edge', desc: '傷害 +20%', apply: (g) => { g.mods.dmg *= 1.2; } },
  { id: 'ward', zh: '古環庇護', en: 'Ring Ward', desc: '生命上限 +25%，並完全回復', apply: (g) => { g.hero.hpMax = Math.round(g.hero.hpMax * 1.25); g.hero.hp = g.hero.hpMax; } },
  { id: 'drink', zh: '噬魂', en: 'Soul Drink', desc: '每擊破一敵回復 3 生命', apply: (g) => { g.mods.lifesteal += 3; } },
  { id: 'breath', zh: '龍息', en: 'Dragon Breath', desc: '燼龍量表累積 +40%', apply: (g) => { g.mods.musouGain *= 1.4; } },
  { id: 'mend', zh: '燈火回春', en: 'Lantern Mend', desc: '每秒回復 2 生命', apply: (g) => { g.mods.regen += 2; } },
  { id: 'bones', zh: '鐵骨', en: 'Iron Bones', desc: '所受傷害 −20%', apply: (g) => { g.mods.taken *= 0.8; } },
  { id: 'lamps', zh: '三燈', en: 'Three Lamps', desc: '每登一層，燼龍量表全滿', apply: (g) => { g.mods.fullGauge = true; } },
];

function readBest() {
  try { return JSON.parse(globalThis.localStorage?.getItem(BEST_KEY) || 'null'); } catch { return null; }
}
function writeBest(v) {
  try { globalThis.localStorage?.setItem(BEST_KEY, JSON.stringify(v)); } catch { /* no storage: no best */ }
}

export function createTower(game, { maxEnemies, root }) {
  const t = {
    floor: 1, floorKOs: 0, quota: 0, phase: 'title', holdT: 0, crownDown: false, totalKOs: 0, maxChain: 0, frames: 0,
    boons: [], hold: false,
  };
  game.mods = { dmg: 1, taken: 1, musouGain: 1, lifesteal: 0, regen: 0, fullGauge: false };
  game.mortal = true;
  game.tower = t;

  // ---- DOM: floor tracker, boon picker, results card
  root.insertAdjacentHTML('beforeend', `
    <div id="tw-floor" hidden><i class="tw-seal">層</i><b></b><span></span><div class="tw-bar"><i></i></div></div>
    <div id="tw-boon" hidden><h2></h2><p class="tw-sub">揀一道祝福，再登一層 · Choose a blessing</p><div class="tw-cards"></div></div>
    <div id="tw-result" hidden><h2>燼火熄滅</h2><p class="tw-en">THE EMBER FADES</p><dl></dl><p class="tw-best"></p>
      <div class="tw-act"><button id="tw-again" type="button">再登古塔<small>ASCEND AGAIN</small></button>
      <a id="tw-hub" href="../../index.html">返回 Game Hub</a></div></div>`);
  const $ = (id) => root.querySelector(id);
  const elFloor = $('#tw-floor'), elBoon = $('#tw-boon'), elRes = $('#tw-result');

  const crownFloor = () => t.floor % CROWN_EVERY === 0;
  const crownIdx = () => game.crowd.N - 1;             // the fourth officer slot = 空冠王 (hud.js OFFICERS[3])

  function scale() {
    const k = t.floor - 1;
    CROWD.dmg = Math.round(BASE.dmg * (1 + 0.12 * k));
    CROWD.officerDmg = Math.round(BASE.officerDmg * (1 + 0.12 * k));
    CROWD.hp = Math.round(BASE.hp * (1 + 0.1 * k));
    CROWD.captainHp = Math.round(BASE.captainHp * (1 + 0.1 * k));
    CROWD.officerHp = Math.round(BASE.officerHp * (1 + 0.15 * k));
    CROWD.maxStrikers = Math.min(4, BASE.maxStrikers + Math.floor(k / 3));
    CROWD.strikeGap = BASE.strikeGap.map(([a, b]) => [Math.max(18, Math.round(a * (1 - 0.06 * k))), Math.max(36, Math.round(b * (1 - 0.06 * k)))]);
    t.quota = crownFloor() ? 40 + 10 * k : 45 + 20 * k;
  }

  function spawnFloor() {
    const c = game.crowd, h = game.hero;
    c.reset(); game.combat.reset(); game.musou.reset();
    Object.assign(h, { x: 0, z: 0, vx: 0, vz: 0, y: 0, vy: 0, state: 'idle', stateT: 0, move: null, combo: 0, iframes: 90 });
    if (game.mods.fullGauge) h.musou = h.musouMax;
    c.spawnArmy(Math.min(maxEnemies, c.grunts, 110 + 30 * t.floor));
    if (crownFloor()) {                                // the crown walks in with the first block, swollen
      const i = crownIdx();
      c.hp[i] = c.hpMax[i] = CROWD.officerHp * 4;
    }
    t.floorKOs = 0; t.crownDown = false;
    emit('tower:banner', crownFloor()
      ? { html: `第${floorName(t.floor)}層 · <em>空冠王</em> 降臨`, en: `Floor ${t.floor} — the Hollow Crown descends`, dur: 200 }
      : { html: `千燈古塔 · 第<em>${floorName(t.floor)}</em>層`, en: `The Thousand-Lantern Spire — floor ${t.floor}`, dur: 170 });
  }

  function startRun() {
    Object.assign(game.mods, { dmg: 1, taken: 1, musouGain: 1, lifesteal: 0, regen: 0, fullGauge: false });
    game.hero.hpMax = 400; game.hero.hp = 400; game.hero.dead = false; game.hero.kos = 0; game.hero.musou = 0;
    Object.assign(t, { floor: 1, totalKOs: 0, maxChain: 0, frames: 0, boons: [], phase: 'fight', hold: false });
    scale(); spawnFloor(); render();
    elFloor.hidden = false; elRes.hidden = true; elBoon.hidden = true;
  }

  function offerBoons() {
    t.phase = 'boon'; t.hold = true;
    const pool = BOONS.filter((b) => !(b.id === 'lamps' && game.mods.fullGauge));
    const pick = [];
    while (pick.length < 3 && pool.length) pick.push(pool.splice(rng.int(0, pool.length - 1), 1)[0]);
    elBoon.querySelector('h2').textContent = `第${floorName(t.floor)}層 已破`;
    const cards = elBoon.querySelector('.tw-cards');
    cards.textContent = '';
    pick.forEach((b, k) => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'tw-card'; btn.dataset.boon = b.id;
      btn.innerHTML = `<kbd>${k + 1}</kbd><b>${b.zh}</b><small>${b.en}</small><span>${b.desc}</span>`;
      btn.addEventListener('click', () => choose(b));
      cards.append(btn);
    });
    elBoon.hidden = false;
    cards.querySelector('button')?.focus();
  }

  function choose(b) {
    if (t.phase !== 'boon') return;
    b.apply(game); t.boons.push(b.id);
    game.hero.hp = Math.min(game.hero.hpMax, game.hero.hp + game.hero.hpMax * 0.3);   // the climb itself restores
    elBoon.hidden = true;
    t.floor++; scale(); spawnFloor();
    t.phase = 'fight'; t.hold = false; render();
    emit('tower:say', { zh: `${b.zh}——燼火更盛。`, en: `${b.en}. The ember burns brighter.` });
  }

  function finish() {
    t.phase = 'dead'; t.hold = true;
    const cleared = t.floor - 1, secs = Math.round(t.frames / 60);
    const run = { floor: t.floor, cleared, kos: t.totalKOs, chain: t.maxChain, secs, at: Date.now() };
    const best = readBest();
    const better = !best || run.cleared > best.cleared || (run.cleared === best.cleared && run.kos > best.kos);
    if (better) writeBest(run);
    const mm = `${(secs / 60) | 0}:${String(secs % 60).padStart(2, '0')}`;
    elRes.querySelector('dl').innerHTML =
      `<dt>登至</dt><dd>第${floorName(t.floor)}層</dd><dt>擊破</dt><dd>${run.kos}</dd><dt>最高連擊</dt><dd>${run.chain}</dd><dt>時間</dt><dd>${mm}</dd>`;
    const b = better ? run : best;
    elRes.querySelector('.tw-best').textContent = better
      ? '★ 新紀錄 · NEW BEST'
      : `最佳：第${floorName(b.floor)}層 · 擊破 ${b.kos}`;
    elFloor.hidden = true; elRes.hidden = false;
    root.querySelector('#tw-again').focus();
  }

  root.querySelector('#tw-again').addEventListener('click', () => { startRun(); emit('tower:restart', {}); });
  addEventListener('keydown', (e) => {
    if (t.phase === 'boon' && /^Digit[123]$/.test(e.code)) {
      const btn = elBoon.querySelectorAll('.tw-card')[Number(e.code.slice(5)) - 1];
      btn?.click();
    }
  });

  on('ko', (e) => {
    if (t.phase !== 'fight') return;
    t.floorKOs++; t.totalKOs++;
    if (e.officer && e.i === crownIdx() && crownFloor()) {
      t.crownDown = true;
      emit('tower:banner', { html: '<em>空冠王</em> 墜落！', en: 'The Hollow Crown has fallen!', dur: 170 });
    }
  });
  on('hero:dead', () => { if (t.phase === 'fight') { t.phase = 'falling'; t.holdT = 0; emit('tower:banner', { html: '燼火 <em>熄滅</em>', en: 'The ember fades…', dur: 120 }); } });

  function render() {
    const need = crownFloor() ? `擊破 ${Math.min(t.floorKOs, t.quota)}/${t.quota} · 空冠王 ${t.crownDown ? '✓' : '✗'}` : `擊破 ${Math.min(t.floorKOs, t.quota)} / ${t.quota}`;
    elFloor.querySelector('b').textContent = `第${floorName(t.floor)}層`;
    elFloor.querySelector('span').textContent = need;
    const p = Math.min(1, t.floorKOs / t.quota) * (crownFloor() && !t.crownDown ? 0.9 : 1);
    elFloor.querySelector('.tw-bar i').style.transform = `scaleX(${p})`;
  }

  t.step = () => {
    const h = game.hero;
    if (t.phase === 'fight') {
      t.frames++;
      if (game.mods.regen && h.hp > 0) h.hp = Math.min(h.hpMax, h.hp + game.mods.regen / 60);
      t.maxChain = Math.max(t.maxChain, h.combo);
      if (t.floorKOs >= t.quota && (!crownFloor() || t.crownDown)) {
        t.phase = 'clear'; t.holdT = 0; game.crowd.wavesOn = false;
        emit('tower:banner', { html: `第${floorName(t.floor)}層 <em>已破</em>`, en: `Floor ${t.floor} cleared`, dur: 110 });
        emit('tower:clear', { floor: t.floor });
      }
      if ((game.frame & 7) === 0) render();
    } else if (t.phase === 'clear') {
      if (++t.holdT > 100) offerBoons();
    } else if (t.phase === 'falling') {
      if (++t.holdT > 90) finish();
    }
  };

  t.start = startRun;
  t.bestText = () => { const b = readBest(); return b ? `最佳紀錄：第${floorName(b.floor)}層 · 擊破 ${b.kos}` : ''; };
  return t;
}
