// 純模擬測試：唔開瀏覽器，node 直接跑。
//
// 呢個係整隻遊戲最重要嘅一份測試。MOBA 嘅規則（補刀、越塔、經驗共享、
// 只可以由外向內拆塔、賞金）全部係「睇個數就知啱唔啱」，喺瀏覽器度用肉眼
// 睇一場波去驗證係查唔到嘅。
//
// 跑法：node games/moba/tests/sim.mjs

import { Sim } from '../src/sim.js';
import { createBot, updateBots } from '../src/ai.js';
import { CHAMPIONS, CHAMPION_IDS, abilityRank } from '../src/champions.js';
import { TEAM, MAP, TICK, XP_TO_LEVEL, MAX_LEVEL, GAME_MAX, TOWER, MINION, structureArmour } from '../src/constants.js';
import { ITEMS, BUILDS, MAX_ITEMS, itemBonus, nextPurchase } from '../src/items.js';
import { planFrame, MAX_STEPS, MAX_FRAME } from '../src/pace.js';

let pass = 0, fail = 0;
const failed = [];
function check(name, ok, detail) {
    if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : detail); }
    else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
}
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ---------- T1：英雄數據表本身要合理 ----------
for (const id of CHAMPION_IDS) {
    const c = CHAMPIONS[id];
    const keys = c.abilities.map(a => a.key).join('');
    check(`${id}：四個技能係 QWER`, keys === 'QWER', keys);
    check(`${id}：每個技能都有文字說明`, c.abilities.every(a => a.text && a.text.length > 6));
    check(`${id}：大招冷卻長過細技能`,
        c.abilities[3].cd > Math.max(...c.abilities.slice(0, 3).map(a => a.cd)),
        { r: c.abilities[3].cd, small: c.abilities.slice(0, 3).map(a => a.cd) });
    check(`${id}：有被動同角色定位`, !!c.passive?.name && !!c.role);
    // 唔可以四個技能都係同一種形態，否則玩落一式一樣
    const forms = new Set(c.abilities.map(a => a.form));
    check(`${id}：技能形態唔可以得一種`, forms.size >= 2, [...forms]);
}

// 技能等級曲線：1 級有 Q，6 級同 11 級升大招，Q/W/E 最多 4 級
check('1 級：得一個技能學到', [0, 1, 2].filter(i => abilityRank(1, i) > 0).length === 1,
    [0, 1, 2].map(i => abilityRank(1, i)));
check('大招 1 至 4 級冇（要等，先至係一個時刻）',
    [1, 2, 3, 4].every(l => abilityRank(l, 3) === 0), [1, 2, 3, 4].map(l => abilityRank(l, 3)));
check('大招 5/9/12 級升',
    abilityRank(5, 3) === 1 && abilityRank(9, 3) === 2 && abilityRank(12, 3) === 3,
    [abilityRank(5, 3), abilityRank(9, 3), abilityRank(12, 3)]);
check('12 級：Q/W/E 都滿級', [0, 1, 2].every(i => abilityRank(12, i) === 4),
    [0, 1, 2].map(i => abilityRank(12, i)));

// ---------- T2：開局狀態 ----------
{
    const sim = new Sim({ seed: 7 });
    const towers = sim.entities.filter(e => e.kind === 'tower');
    const nexus = sim.entities.filter(e => e.kind === 'nexus');
    check('每邊兩座塔一座水晶', towers.length === 4 && nexus.length === 2,
        { towers: towers.length, nexus: nexus.length });
    check('六個英雄，三對三', sim.champions.length === 6
        && sim.champions.filter(c => c.team === TEAM.BLUE).length === 3);
    check('有一個玩家英雄', sim.champions.filter(c => c.isPlayer).length === 1);
    check('大家都由 1 級、滿血滿藍開始',
        sim.champions.every(c => c.level === 1 && c.hp === c.maxHp && c.mp === c.maxMp));
    // 地圖對稱：藍紅兩邊嘅建築位置要鏡像
    const bx = towers.filter(t => t.team === TEAM.BLUE).map(t => t.x).sort((a, b) => a - b);
    const rx = towers.filter(t => t.team === TEAM.RED).map(t => t.x).sort((a, b) => b - a);
    check('地圖左右對稱', bx.every((v, i) => Math.abs(v + rx[i]) < 1e-6), { bx, rx });
}

// ---------- T3：兵線 ----------
{
    const sim = new Sim({ seed: 7 });
    let firstWaveAt = null;
    let perTeam = null;
    for (let t = 0; t < 60 / TICK; t++) {
        sim.step();
        if (firstWaveAt === null && sim.entities.some(e => e.kind === 'minion')) {
            firstWaveAt = sim.time;
            // 要喺第一波啱啱出嗰刻數。等到一分鐘先數係度緊「邊隊打贏咗」，
            // 唔係度緊「兩邊出兵一唔一樣」——地圖縮短之後兩邊早就開打。
            perTeam = [TEAM.BLUE, TEAM.RED].map(tm =>
                sim.entities.filter(e => e.alive && e.kind === 'minion' && e.team === tm).length);
        }
    }
    check('十五秒內出第一波兵', firstWaveAt !== null && firstWaveAt < 15, firstWaveAt);
    check('兩邊兵數一樣', perTeam && perTeam[0] === perTeam[1] && perTeam[0] > 0, perTeam);
    check('小兵會向前推（唔會呆喺出生點）',
        sim.entities.some(e => e.kind === 'minion' && Math.abs(e.x) < MAP.nexusX - 12));
}

// ---------- T4：補刀規則 ----------
{
    const sim = new Sim({ seed: 3 });
    const hero = sim.champions[0];
    const foe = { kind: 'minion', team: 1, def: { gold: 21, xp: 60 }, x: hero.x + 2, z: hero.z, r: 0.6, alive: true, hp: 5, maxHp: 400, armour: 0 };
    sim.entities.push(foe); foe.id = 9999;
    const goldBefore = hero.gold, csBefore = hero.cs;
    sim.damage(foe, 999, hero, { physical: true });
    check('最後一下先有金幣（補刀）', hero.gold - goldBefore >= 21 && hero.cs === csBefore + 1,
        { gained: hero.gold - goldBefore, cs: hero.cs });

    // 由塔殺死嘅小兵，英雄唔應該攞到補刀金幣
    const sim2 = new Sim({ seed: 3 });
    const h2 = sim2.champions[0];
    const tower = sim2.entities.find(e => e.kind === 'tower' && e.team === h2.team);
    const m2 = { kind: 'minion', team: 1, def: { gold: 21, xp: 60 }, x: h2.x, z: h2.z, r: 0.6, alive: true, hp: 5, maxHp: 400, armour: 0, id: 9998 };
    sim2.entities.push(m2);
    const g2 = h2.gold;
    sim2.damage(m2, 999, tower, {});
    check('畀塔殺死就冇補刀金幣', h2.gold - g2 < 1, h2.gold - g2);
}

// ---------- T5：經驗共享 ----------
{
    const sim = new Sim({ seed: 5 });
    const near = sim.champions.filter(c => c.team === TEAM.BLUE);
    const victim = { kind: 'minion', team: TEAM.RED, def: { gold: 10, xp: 100 }, x: near[0].x, z: near[0].z, r: 0.6, alive: true, hp: 1, maxHp: 1, armour: 0, id: 9997 };
    sim.entities.push(victim);
    // 兩個藍方英雄企埋一齊，第三個行遠咗
    near[1].x = near[0].x; near[1].z = near[0].z + 1;
    near[2].x = near[0].x + 60;
    const before = near.map(c => c.xp);
    sim.damage(victim, 99, near[0], {});
    const gained = near.map((c, i) => c.xp - before[i]);
    check('喺附近嘅隊友分到經驗', gained[0] > 0 && gained[1] > 0, gained);
    check('行遠咗就分唔到', gained[2] === 0, gained);
    check('兩個人分唔會少過一個人嘅一半', gained[1] > gained[0] * 0.4, gained);
}

// ---------- T6：只可以由外向內拆塔，水晶最後 ----------
{
    const sim = new Sim({ seed: 11 });
    const redTowers = sim.entities.filter(e => e.kind === 'tower' && e.team === TEAM.RED)
        .sort((a, b) => a.x - b.x);
    const redNexus = sim.entities.find(e => e.kind === 'nexus' && e.team === TEAM.RED);
    const scout = { kind: 'minion', team: TEAM.BLUE, def: MINIONDEF(), x: redNexus.x - 6, z: 0, r: 0.6, alive: true, hp: 100, maxHp: 100, armour: 0, id: 9996 };
    sim.entities.push(scout);
    const t1 = sim.entities.filter(e => e.alive && e.kind === 'tower' && e.team === TEAM.RED).length;
    // 內塔仲喺度，所以呢個小兵唔應該將水晶當目標
    const target = sim.structureTargetFor(scout);
    check('外塔未拆就唔會打內塔／水晶',
        target && target.kind === 'tower' && target.tier === 0, describe(target));
    // 拆走外塔之後，內塔先變成目標
    // redTowers 按 x 排序，紅方喺 +x，所以 [0] 先係外塔（tier 0、近中線）
    redTowers[0].alive = false;
    const target2 = sim.structureTargetFor(scout);
    check('外塔拆咗先輪到內塔', target2 && target2.kind === 'tower' && target2.tier === 1, describe(target2));
    for (const t of redTowers) t.alive = false;
    const target3 = sim.structureTargetFor(scout);
    check('兩座塔冇晒先可以打水晶', target3 && target3.kind === 'nexus', describe(target3));
    function describe(t) { return t ? { kind: t.kind, tier: t.tier } : null; }
}

function MINIONDEF() {
    return { key: 'melee', gold: 21, xp: 60, structureBonus: 0 };
}
// 用 sim 內部同一條規則（透過打一次目標選擇）——避免測試自己抄一份規則
function pickTargetFor(sim, minion) {
    const saved = sim.entities.filter(e => e.kind === 'minion' && e !== minion && e.team === minion.team);
    for (const m of saved) m.alive = false;
    sim.entities.filter(e => e.kind === 'champ').forEach(c => { c.alive = false; });
    minion.cd = 0;
    sim.step(TICK);
    sim.entities.filter(e => e.kind === 'champ').forEach(c => { c.alive = true; });
    return sim.entities.find(e => e.id === minion.target);
}

// ---------- T7：越塔會食塔 ----------
{
    const sim = new Sim({ seed: 13 });
    const attacker = sim.champions.find(c => c.team === TEAM.BLUE);
    const victim = sim.champions.find(c => c.team === TEAM.RED);
    const redTower = sim.entities.filter(e => e.kind === 'tower' && e.team === TEAM.RED)
        .sort((a, b) => a.x - b.x)[0];
    attacker.x = redTower.x - 2; attacker.z = 0;
    victim.x = redTower.x - 3; victim.z = 0;
    // 塔本來應該打小兵／冇嘢打
    sim.damage(victim, 10, attacker, { physical: true });
    check('喺塔下打英雄會惹到塔',
        attacker.towerAggroUntil > sim.time && attacker.towerAggroFrom === TEAM.RED,
        { until: attacker.towerAggroUntil, from: attacker.towerAggroFrom });
    sim.step(TICK);
    check('塔即刻轉去打嗰個越塔嘅人', redTower.target === attacker.id,
        { target: redTower.target, attacker: attacker.id });
}

// ---------- T8：技能真係打得中人，而且會扣藍同入 CD ----------
{
    for (const id of CHAMPION_IDS) {
        const sim = new Sim({ seed: 21, lineups: { [TEAM.BLUE]: [id, 'ironward', 'longshot'], [TEAM.RED]: ['duskblade', 'emberwake', 'ironhulk'] } });
        const hero = sim.champions[0];
        hero.level = 12; sim.giveXp(hero, 0);
        const foe = sim.champions.find(c => c.team === TEAM.RED);
        hero.x = 0; hero.z = 0;
        foe.x = 2.2; foe.z = 0;
        let anyDamage = false;
        for (let i = 0; i < 4; i++) {
            const ab = hero.def.abilities[i];
            hero.mp = hero.maxMp;
            hero.abilityCd[i] = 0;
            const hpBefore = foe.hp;
            const mpBefore = hero.mp;
            const ok = sim.cast(hero, i, { x: foe.x, z: foe.z, targetId: foe.id });
            check(`${id} ${ab.key}：施放成功`, ok === true, { id, key: ab.key });
            check(`${id} ${ab.key}：扣咗藍`, hero.mp <= mpBefore - ab.cost + 0.001, { mp: hero.mp, cost: ab.cost });
            check(`${id} ${ab.key}：入咗 CD`, hero.abilityCd[i] > 0, hero.abilityCd[i]);
            // 畀啲時間畀彈道／延遲爆發
            for (let t = 0; t < 2.5 / TICK; t++) sim.step();
            if (foe.hp < hpBefore) anyDamage = true;
            foe.hp = sim.stats(foe).maxHp;
            foe.alive = true;
            foe.x = hero.x + 2.2; foe.z = hero.z;
        }
        check(`${id}：至少一個技能真係打得傷人`, anyDamage, id);
    }
}

// ---------- T9：護甲公式 ----------
{
    const sim = new Sim({ seed: 2 });
    const target = sim.champions.find(c => c.team === TEAM.RED);
    target.def = { ...target.def };
    const raw = 100;
    target.armour = 0; target.hp = 10000; target.shield = 0;
    const d0 = sim.damage(target, raw, null, {});
    target.armour = 100; target.hp = 10000;
    const d100 = sim.damage(target, raw, null, {});
    check('0 護甲食全額傷害', Math.abs(d0 - raw) < 0.01, d0);
    check('100 護甲減一半', Math.abs(d100 - raw / 2) < 0.01, d100);
    target.armour = 1000; target.hp = 10000;
    const dHuge = sim.damage(target, raw, null, {});
    check('堆到爆護甲都唔會免疫', dHuge > 0, dHuge);
}

// ---------- T10：死亡、重生、賞金 ----------
{
    const sim = new Sim({ seed: 17 });
    const killer = sim.champions.find(c => c.team === TEAM.BLUE);
    const victim = sim.champions.find(c => c.team === TEAM.RED);
    victim.x = killer.x + 1; victim.z = killer.z;
    const goldBefore = killer.gold;
    sim.damage(victim, 99999, killer, { trueDamage: true });
    check('死亡會計 K/D', killer.kills === 1 && victim.deaths === 1);
    check('殺人有金幣', killer.gold - goldBefore >= 300, killer.gold - goldBefore);
    check('有重生時間', victim.respawnAt > sim.time, victim.respawnAt - sim.time);
    check('未夠鐘唔會復活', !victim.alive);
    while (sim.time < victim.respawnAt + 0.1) sim.step();
    check('夠鐘就喺泉水復活', victim.alive && Math.abs(Math.abs(victim.x) - MAP.fountainX) < 0.5,
        { alive: victim.alive, x: victim.x });
    check('復活係滿血', Math.abs(victim.hp - sim.stats(victim).maxHp) < 1);
}

// ---------- T11：連殺賞金（唔會一面倒滾雪球）----------
{
    const sim = new Sim({ seed: 19 });
    const fed = sim.champions.find(c => c.team === TEAM.BLUE);
    const foe = sim.champions.find(c => c.team === TEAM.RED);
    // 曦守被動會擋低隊友一次致命傷害；想量賞金就要令佢救唔到（距離拉開）
    for (const c of sim.champions) if (c.def.id === 'dawnkeeper') c.z = 999;
    fed.streak = 5;
    foe.x = fed.x + 1;
    const before = foe.gold;
    sim.damage(fed, 99999, foe, { trueDamage: true });
    check('殺賞金頭會攞多啲錢', foe.gold - before > 300, foe.gold - before);
    check('賞金頭死咗就清連殺', fed.streak === 0);
}

// ---------- T12：一整場真實比賽（六個 bot 對打）----------
{
    const sim = new Sim({ seed: 99 });
    const bots = sim.champions.map(c => createBot(sim, c, { aggression: 0.5 + (c.id % 3) * 0.15 }));
    let guard = 0;
    const maxTicks = (GAME_MAX + 5) / TICK;
    while (!sim.over && guard++ < maxTicks) {
        updateBots(bots, TICK, guard);
        sim.step();
    }
    const mins = (sim.time / 60).toFixed(1);
    check('一場波跑得完（有人贏）', !!sim.over && sim.over.winner !== null, { over: sim.over, mins });
    check('比賽長度合理（3 分鐘到時限）', sim.time > 180 && sim.time <= GAME_MAX + TICK * 2, mins);
    const totalKills = sim.champions.reduce((a, c) => a + c.kills, 0);
    check('過程中有人頭（唔係淨係推塔）', totalKills >= 3, totalKills);
    const maxLevel = Math.max(...sim.champions.map(c => c.level));
    check('有人升到級（經驗系統有行）', maxLevel >= 5, sim.champions.map(c => c.level));
    const totalCs = sim.champions.reduce((a, c) => a + c.cs, 0);
    check('有人補到刀', totalCs >= 20, totalCs);
    const towersDown = 4 - sim.entities.filter(e => e.alive && e.kind === 'tower').length;
    check('有塔被拆', towersDown >= 1, towersDown);
    check('冇單位甩出橋外',
        sim.entities.every(e => Math.abs(e.z) <= MAP.halfWidth + 3.5), 'ok');
    check('冇 NaN', sim.champions.every(c => Number.isFinite(c.x) && Number.isFinite(c.hp)));
}

// ---------- T13：兩邊都贏得到（唔會有一邊必勝）----------
{
    const wins = { [TEAM.BLUE]: 0, [TEAM.RED]: 0 };
    let noResult = 0, byNexus = 0;
    const mirror = ['ironward', 'longshot', 'emberwake'];
    for (const seed of [1, 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]) {
        const sim = new Sim({ seed, lineups: { [TEAM.BLUE]: mirror, [TEAM.RED]: mirror } });
        const bots = sim.champions.map(c => createBot(sim, c));
        let guard = 0;
        while (!sim.over && guard++ < (GAME_MAX + 5) / TICK) {
            updateBots(bots, TICK, guard);
            sim.step();
        }
        if (sim.over?.winner != null) wins[sim.over.winner] += 1; else noResult++;
        if (sim.over && !sim.over.byTime) byNexus++;
    }
    check('鏡像陣容十二場兩邊都有贏過（邊路冇必勝）',
        wins[TEAM.BLUE] > 0 && wins[TEAM.RED] > 0, wins);
    check('每一場都分到勝負（冇無結果嘅比賽）', noResult === 0, { noResult, wins });
    // 推爆水晶要係主流收場方式。單一場嘅斷言會飄，所以度嘅係整體比例。
    // 加咗返程之後實測十二場：十場推爆水晶、兩場打到時限（之前係 7/5——
    // 商店返唔到去用，等於經濟冇出口）。門檻放喺 8/12，係「量到幾多就
    // 寫幾多，再留返少少浮動位」，唔係揀個好睇數字再倒返去調參。
    check('推爆水晶係主流收場方式（時限只係例外）',
        byNexus >= 8, { byNexus, byTime: 12 - byNexus });
}

// ---------- T14：泉水回血、大後期水晶自流血 ----------
{
    const sim = new Sim({ seed: 23 });
    const c = sim.champions[0];
    c.hp = 50;
    c.x = -MAP.fountainX; c.z = 0;
    for (let i = 0; i < 2 / TICK; i++) sim.step();
    check('喺泉水會快速回血', c.hp > 150, c.hp);
}


// ---------- T15：裝備 ----------
// 裝備係「贏團戰 → 有錢 → 打得快 → 推得郁」呢條因果鏈嘅中間一格。
// 冇咗佢，實測英雄由 1 級到 12 級殺一隻兵永遠都係七下，兵線永遠斷唔到。
{
    const sim = new Sim({ seed: 31 });
    const c = sim.champions[0];
    const base = sim.stats(c);

    c.gold = 10000;
    c.x = 0;                       // 唔喺泉水
    check('唔喺泉水都買得到', sim.buy(c, 'longsword') === true);
    check('買嘢會扣錢', c.gold === 10000 - ITEMS.longsword.cost, c.gold);
    c.x = -MAP.fountainX;
    check('喺泉水一樣買得到', sim.buy(c, 'dagger') === true);
    check('裝備真係加到攻擊力',
        Math.abs(sim.stats(c).damage - base.damage - ITEMS.longsword.ad) < 1e-6,
        { before: base.damage, after: sim.stats(c).damage });

    const hpBefore = c.hp;
    sim.buy(c, 'rubystone');
    check('買血裝即刻補返新增嗰截（唔會反而變殘）',
        Math.abs(c.hp - hpBefore - ITEMS.rubystone.hp) < 1e-6, { hpBefore, now: c.hp });
    check('血裝加最大生命',
        Math.abs(sim.stats(c).maxHp - base.maxHp - ITEMS.rubystone.hp) < 1e-6);

    while (c.items.length < MAX_ITEMS) sim.buy(c, 'dagger');
    check('格數有上限', sim.buy(c, 'dagger') === false && c.items.length === MAX_ITEMS, c.items.length);

    const goldBefore = c.gold;
    sim.sell(c, 0);
    check('賣得走，退七成', c.gold > goldBefore && c.items.length === MAX_ITEMS - 1);

    // 加總規則：乘數類相加，唔相乘
    const b = itemBonus(['dagger', 'dagger']);
    check('同款乘數相加唔相乘', Math.abs(b.attackSpeed - ITEMS.dagger.attackSpeed * 2) < 1e-9, b.attackSpeed);

    // 每個英雄都要有出裝表，而且表入面每件嘢都要真係存在
    let buildOk = true;
    for (const id of CHAMPION_IDS) {
        const build = BUILDS[id];
        if (!build || build.length < MAX_ITEMS) { buildOk = false; break; }
        if (!build.every(x => ITEMS[x])) { buildOk = false; break; }
    }
    check('六個英雄都有一張填滿六格、而且件件存在嘅出裝表', buildOk);

    // 唔夠錢就等大件，唔會退而求其次買細件
    check('唔夠錢就唔買（儲錢買大件）', nextPurchase('ironward', [], 100) === null);
    check('夠錢就買出裝表第一件',
        nextPurchase('ironward', [], 9999) === BUILDS.ironward[0], nextPurchase('ironward', [], 9999));
}

// ---------- T16：吸血 ----------
{
    const sim = new Sim({ seed: 33 });
    const c = sim.champions[0];
    const foe = sim.champions.find(x => x.team !== c.team);
    c.x = -MAP.fountainX; c.gold = 9999;
    sim.buy(c, 'lifeblade');
    c.hp = sim.stats(c).maxHp * 0.5;
    const before = c.hp;
    sim.damage(foe, 200, c, { physical: true });
    check('吸血會回血', c.hp > before, { before, after: c.hp });
    const gained = c.hp - before;
    check('回血量同吸血率對得上',
        Math.abs(gained - 200 * armourMulOf(sim, foe) * ITEMS.lifeblade.lifesteal) < 1e-6, gained);

    // 持續區域唔應該回血，否則放個火圈落一堆兵就滿血
    c.hp = sim.stats(c).maxHp * 0.5;
    const before2 = c.hp;
    sim.damage(foe, 100, c, { physical: false, noLifesteal: true });
    check('區域傷害唔會觸發吸血', Math.abs(c.hp - before2) < 1e-6);
}
function armourMulOf(sim, e) { return 100 / (100 + sim.stats(e).armour); }

// ---------- T17：曦守被動「守望」----------
// 呢個被動之前淨係有卡面文字冇實作，六個英雄入面唯獨佢打少一件嘢，
// 實測勝率跌到 20%；補返之後升返 50%。所以要有測試釘住佢。
{
    const sim = new Sim({ seed: 37, lineups: {
        [TEAM.BLUE]: ['dawnkeeper', 'ironward', 'longshot'],
        [TEAM.RED]: ['duskblade', 'emberwake', 'ironhulk'],
    } });
    const keeper = sim.champ('dawnkeeper');
    const mate = sim.champ('ironward');
    const foe = sim.champ('duskblade');
    mate.x = keeper.x; mate.z = keeper.z + 1;
    const mpBefore = keeper.mp;

    sim.damage(mate, 99999, foe, { trueDamage: true });
    check('守望：隊友唔會死', mate.alive, { hp: mate.hp });
    check('守望：留返一線生機（唔係滿血）',
        mate.hp > 0 && mate.hp < sim.stats(mate).maxHp * 0.2, mate.hp);
    check('守望：燒咗曦守嘅法力', keeper.mp < mpBefore, { mpBefore, now: keeper.mp });

    // 三十秒 CD 之內唔會再擋
    mate.hp = sim.stats(mate).maxHp;
    sim.damage(mate, 99999, foe, { trueDamage: true });
    check('守望：CD 未好就擋唔到第二次', !mate.alive);

    // 救隊友唔救自己
    const sim2 = new Sim({ seed: 38, lineups: {
        [TEAM.BLUE]: ['dawnkeeper', 'ironward', 'longshot'],
        [TEAM.RED]: ['duskblade', 'emberwake', 'ironhulk'],
    } });
    const k2 = sim2.champ('dawnkeeper');
    sim2.damage(k2, 99999, sim2.champ('duskblade'), { trueDamage: true });
    check('守望：救唔到自己', !k2.alive);
}

// ---------- T18：時限判定同建築護甲衰減 ----------
{
    check('建築護甲喺衰減開始之前唔會郁',
        structureArmour(TOWER.armour, 0) === TOWER.armour);
    check('建築護甲後期會歸零',
        structureArmour(TOWER.armour, GAME_MAX) === 0, structureArmour(TOWER.armour, GAME_MAX));
    check('建築護甲係單調遞減',
        structureArmour(TOWER.armour, 60 * 15) < TOWER.armour
        && structureArmour(TOWER.armour, 60 * 15) > 0);

    // 時限一到就要即刻分勝負，唔可以拖成一場冇結果嘅比賽
    const sim = new Sim({ seed: 41 });
    sim.time = GAME_MAX - TICK;
    sim.entities.find(e => e.kind === 'nexus' && e.team === TEAM.RED).hp = 10;
    sim.step();
    check('時限一到就完場', !!sim.over && sim.over.byTime === true, sim.over);
    check('時限判勝負：建築血量多嗰隊贏', sim.over.winner === TEAM.BLUE, sim.over);
}

// ---------- T19：事件流唔可以喺冇人讀過之前消失 ----------
// 舊版喺 step() 開頭做 events.length = 0。但玩家施法同 bot 施法都係喺
// step() 之前發生嘅，所以每一個 cast 事件都喺未有人讀過就被抹走——
// 結果就係技能永遠冇動作、冇特效、冇播報。呢條測試釘死個生命週期。
{
    const sim = new Sim({ seed: 51 });
    const p = sim.player;
    p.level = 6;
    p.mp = p.maxMp;

    const cast = sim.cast(p, 0, { x: p.x + 5, z: p.z });
    check('技能施放成功（前置條件）', cast === true);
    sim.step();                       // 施法之後行一步，事件仍然要喺度
    const evs = sim.drain();
    check('施法事件捱得過之後嘅 step',
        evs.some(e => e.type === 'cast' && e.id === p.id), evs.map(e => e.type));
    check('drain 之後就係空', sim.drain().length === 0);

    // bot 嘅施法喺 bot.update() 度發生，即係都喺 step() 之前
    const sim2 = new Sim({ seed: 53 });
    const bots = sim2.champions.map(c => createBot(sim2, c));
    let sawCast = false;
    for (let t = 0; t < 60 * 4 / TICK && !sawCast; t++) {
        updateBots(bots, TICK, t);
        sim2.step();
        if (sim2.drain().some(e => e.type === 'cast')) sawCast = true;
    }
    check('bot 嘅施法事件都收得到', sawCast);

    // 冇人 drain 都唔可以無限漲大（測試會連續 step 幾萬次）
    const sim3 = new Sim({ seed: 57 });
    const bots3 = sim3.champions.map(c => createBot(sim3, c));
    for (let t = 0; t < 60 * 3 / TICK; t++) {
        updateBots(bots3, TICK, t);
        sim3.step();
    }
    check('冇人 drain 嘅時候事件有上限', sim3.events.length <= 512, sim3.events.length);
}

// 總結一定要留喺檔案最尾。之前佢排喺 T15 之前，即係後面三十幾條斷言
// 跑咗但冇入數——失敗都唔會令個測試唔過，等於冇 gate 過。

// ---------- T20：返程 ----------
// 由中線行返泉水單程約九秒。冇返程，商店就係一個「唔值得用」嘅系統，
// 而裝備係成個經濟嘅唯一出口——所以返程唔係方便，係令商店成立嘅前提。
{
    const sim = new Sim({ seed: 61 });
    const p = sim.player;
    p.x = 0; p.z = 0;

    check('喺屋企唔使返程', (() => {
        const c = sim.champions[1];
        c.x = -MAP.fountainX;
        return sim.startRecall(c) === false;
    })());

    check('外面開得到返程', sim.startRecall(p) === true);
    check('讀秒中會有進度', (() => { for (let i = 0; i < 30; i++) sim.step(); return sim.recallProgress(p) > 0.1; })());

    // 讀秒期間唔可以郁
    const xBefore = p.x;
    for (let i = 0; i < 30; i++) sim.step();
    check('讀秒期間企定唔郁', Math.abs(p.x - xBefore) < 0.01, { xBefore, now: p.x });

    check('讀完會返到泉水', (() => {
        for (let i = 0; i < 30 * 6; i++) sim.step();
        return Math.abs(p.x - (-MAP.fountainX)) < 0.01 && sim.recallProgress(p) === 0;
    })(), p.x);

    // 食到傷害會斷
    const sim2 = new Sim({ seed: 62 });
    const a = sim2.player;
    a.x = 0; a.z = 0;
    sim2.startRecall(a);
    for (let i = 0; i < 30; i++) sim2.step();
    sim2.damage(a, 20, sim2.champions.find(c => c.team !== a.team), { physical: true });
    check('食到傷害會斷返程', sim2.recallProgress(a) === 0);

    // 落指令都會斷
    const sim3 = new Sim({ seed: 63 });
    const b = sim3.player;
    b.x = 0; b.z = 0;
    sim3.startRecall(b);
    sim3.orderMove(b, 5, 0);
    check('落移動指令會斷返程', sim3.recallProgress(b) === 0);

    const sim4 = new Sim({ seed: 64 });
    const c4 = sim4.player;
    c4.x = 0; c4.z = 0; c4.level = 6; c4.mp = c4.maxMp;
    sim4.startRecall(c4);
    sim4.cast(c4, 0, { x: 5, z: 0 });
    check('施法會斷返程', sim4.recallProgress(c4) === 0);
}

// ---------- T21：閃技能 ----------
// 閃避唔係「見到彈道就郁」，係「計得掂先郁」。埋到身先側身需要嘅橫向速度
// 會超過角色跑得幾快，嗰陣郁只會兩頭唔到岸——行咗兩步，一樣食足。
// 所以呢兩條驗嘅係個判斷本身：夠時間要閃得出彈道之外，唔夠時間要企定。
function dodgeCase(px, speed) {
    const sim = new Sim({ seed: 71 });
    const c = sim.champions.find(x => x.team === TEAM.RED);
    c.x = 0; c.z = 0;
    // 淨低佢一個喺場中間，等閃避以外嘅指令唔會夾埋一齊影響個結果
    for (const o of sim.champions) if (o !== c) { o.x = 200; o.z = 0; }
    const bot = createBot(sim, c);
    sim.projectiles.push({
        kind: 'bolt', skill: true, team: TEAM.BLUE, sourceId: -1,
        x: px, z: 0, vx: 1, vz: 0, speed, width: 1.2, pierce: false,
        left: 40, hits: new Set(), onHit() {}, onAlly: null,
    });
    bot.update(TICK);
    return { c, sim };
}
{
    // 二十米外、每秒十二米：一點六秒到，行得切
    const far = dodgeCase(-20, 12);
    check('閃技能：夠時間就側身避開', Math.abs(far.c.orderZ) > 1.2 + far.c.r,
        { orderZ: far.c.orderZ, need: 1.2 + far.c.r });
    check('閃技能：向側面行，唔係向前後行', Math.abs(far.c.orderX) < 1e-9, far.c.orderX);
    check('閃技能：唔會閃出橋外', Math.abs(far.c.orderZ) <= MAP.halfWidth, far.c.orderZ);

    // 三米外、每秒二十米：零點一五秒到，點行都閃唔切
    const near = dodgeCase(-3, 20);
    check('閃技能：閃唔切就唔好亂郁', Math.abs(near.c.orderZ ?? 0) < 0.01,
        { orderZ: near.c.orderZ });
}

// ---------- T22：衝刺唔可以令角色永久卡死 ----------
// 燼燃嘅「閃退」係向後衝。貼實橋邊向外閃，落點就喺橋外——之前落點冇夾返
// 入橋面，#tickDash 每格夾住個位置但目標永遠去唔到，remain 減唔落，
// c.dash 永遠唔會清；而 #tickChamp 第一句就係 if (c.dash) return，
// 由嗰刻起個角色完全唔郁得、唔打得。Penny 見到嘅「卡死喺嗰邊」就係呢個。
{
    const mirror = ['emberwake', 'ironward', 'longshot'];
    const sim = new Sim({ seed: 81, lineups: { [TEAM.BLUE]: mirror, [TEAM.RED]: mirror } });
    const c = sim.champions.find(x => x.team === TEAM.BLUE && x.champId === 'emberwake');
    const idx = c.def.abilities.findIndex(a => a.form === 'dash');
    c.level = 12; c.mp = c.maxMp;
    // 唔好貼死條邊：留三米，等衝刺真係要行一段先撞到邊界，
    // 咁先測到「行行下畀夾住」嗰條路徑，唔係一格就完。
    c.x = 0; c.z = MAP.halfWidth - 3;
    const z0Dash = c.z;
    check('前置：搵到一個向後嘅位移技', idx >= 0 && c.def.abilities[idx].backwards === true);
    check('閃退：施放成功', sim.cast(c, idx, { x: 0, z: -10 }) === true);   // 向 -z 瞄 = 向 +z 衝出橋

    let ticks = 0;
    while (c.dash && ticks++ < 30 * 5) sim.step();
    check('衝刺一定會完（唔會永久卡住角色）', c.dash == null, { ticks });
    check('衝刺真係行過（唔係一格就當完）', c.z - z0Dash > 1, { z0: z0Dash, now: c.z });
    check('衝刺完仍然喺橋面上', Math.abs(c.z) <= MAP.halfWidth, c.z);

    const z0 = c.z, x0 = c.x;
    sim.orderMove(c, 0, 0);
    for (let i = 0; i < 30; i++) sim.step();
    check('衝刺之後行返得', Math.hypot(c.x - x0, c.z - z0) > 0.5, { z0, now: c.z });
}

// ---------- T23：去橋外嘅移動指令唔會令角色一直撼住條邊 ----------
// 實體夾到 ±(halfWidth − r)，但落指令嗰邊夾嘅係 ±halfWidth。差咗個半徑，
// #moveToward 就永遠唔會「到達」，orderX 清唔到，角色一路撼住條邊行。
{
    const sim = new Sim({ seed: 83 });
    const c = sim.player;
    c.x = 0; c.z = 0;
    sim.orderMove(c, 0, MAP.halfWidth + 5);
    let ticks = 0;
    while (c.orderX != null && ticks++ < 30 * 8) sim.step();
    check('去橋外嘅移動指令會結束', c.orderX === null, { ticks, z: c.z });
    check('停喺橋面之內', Math.abs(c.z) <= MAP.halfWidth, c.z);
    check('真係行咗過去（唔係即刻放棄）', c.z > MAP.halfWidth - c.r - 0.3, c.z);
}

// ---------- T24：停低要真係回復 idle ----------
// moving 係逐 tick 嘅輸出；如果上一格行過之後一直黐住 true，view 就算見到
// order 已經清空，仍然會不停播 run clip，造成原地踏步。
{
    const sim = new Sim({ seed: 89 });
    const c = sim.player;
    c.x = 0; c.z = 0;
    sim.orderMove(c, 4, 0);
    sim.step();
    check('有實際位移嗰格會標記 moving', c.moving === true, c.moving);
    sim.orderStop(c);
    sim.step();
    check('停止命令後下一格會回復 idle', c.moving === false, c.moving);
}

// ---------- T25：一級普攻嘅節奏 ----------
// Penny 報過「普攻嘅 CD 係咪太長」。量咗先知唔係感覺問題：舊數值一級出手
// 隔 1.34–1.55 秒，而且要六至七下先劈得冧一隻近戰兵，即係開場每隻兵要企喺
// 度撳足八到十一秒。一波六隻兵就係成分鐘，而嗰陣正正係玩家第一印象。
//
// 呢度釘住嘅係設計意圖，唔係今日嗰組數：一隻手機 MOBA 嘅普攻要大約一秒
// 一下，而開場劈冧一隻近戰兵唔應該講緊十秒。上限行八秒係因為法師（燼燃）
// 設計上就係最低攻擊力嗰個，佢清兵靠 W 唔靠普攻；用佢做天花板即係話
// 「連最唔擅長普攻嗰個都唔會等到十秒」。門檻留咗浮動位，微調數值唔會無故
// 拉爆佢，但如果有人再推返去 1.5 秒／12 秒就一定會響。
{
    let slowest = 0, longest = 0, slowId = null, longId = null;
    for (const id of CHAMPION_IDS) {
        const sim = new Sim({ seed: 21, lineups: { [TEAM.BLUE]: [id, 'ironward', 'longshot'], [TEAM.RED]: ['duskblade', 'emberwake', 'ironhulk'] } });
        const hero = sim.champions[0];
        const st = sim.stats(hero);
        const gap = 1 / st.attackSpeed;
        // 開場嗰刻嘅近戰兵：hpPerMin 由零分鐘計起，所以就係 base hp。
        const ttk = Math.ceil(MINION.melee.hp / st.damage) * gap;
        if (gap > slowest) { slowest = gap; slowId = id; }
        if (ttk > longest) { longest = ttk; longId = id; }
    }
    check('一級普攻至少一秒一下（最慢嗰個都唔過 1.15 秒）',
        slowest <= 1.15, { 最慢: slowId, 出手間隔: +slowest.toFixed(2) });
    check('開場劈冧一隻近戰兵唔使夠八秒',
        longest <= 8, { 最耐: longId, 秒: +longest.toFixed(1) });
}

// ---------- T26：一場波抽嘅第一個亂數要真係亂數 ----------
// 舊版將 seed 直接當 xorshift32 嘅初始狀態。細整數 seed 未擴散開，實測
// seed 101–124 第一個輸出嘅平均係 0.007——即係第一個消費者（第一個 bot
// 嘅反應時間）每一場都攞到同一個極端值，而順序 seed 仲會令幾場之間互相
// 關聯，跑多幾場都拉唔勻。實測影響到勝率：鏡像陣容藍方由 24/72 升到 33/72。
//
// 呢個 gate 唔係去度「今日條序列係咩」，而係度「頭幾個數同後面嘅一樣咁散」。
{
    const first = [], fifth = [];
    for (let seed = 1; seed <= 200; seed++) {
        const r = new Sim({ seed }).rng;
        first.push(r());
        for (let i = 0; i < 3; i++) r();
        fifth.push(r());
    }
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const above = (a) => a.filter(v => v > 0.5).length / a.length;
    check('第一個亂數嘅平均落喺 0.5 附近（舊版係 0.007）',
        Math.abs(mean(first) - 0.5) < 0.06, { 平均: +mean(first).toFixed(3) });
    check('第一個亂數唔會成堆黐埋一邊',
        above(first) > 0.35 && above(first) < 0.65, { 大過一半嘅比例: +above(first).toFixed(2) });
    check('頭嗰個同第五個一樣咁散（頭嗰個冇特別）',
        Math.abs(mean(first) - mean(fifth)) < 0.08,
        { 第一: +mean(first).toFixed(3), 第五: +mean(fifth).toFixed(3) });
    // 修正唔可以整爛可重現性：同一個 seed 一定要跑到同一場波。
    const a = new Sim({ seed: 4242 }).rng, b = new Sim({ seed: 4242 }).rng;
    const seq = (r) => Array.from({ length: 5 }, () => r());
    check('同一個 seed 抽到同一串數', JSON.stringify(seq(a)) === JSON.stringify(seq(b)));
}

// ---------- T27：bot 決策次序唔可以偏袒任何一邊 ----------
// bot 落單即刻改到 sim 狀態，所以排後面嗰個讀到嘅世界比排前面嗰個新。實測
// 鏡像陣容 72 場：藍方先諗，藍方贏 33；紅方先諗，藍方贏 48；逐格對調就
// 35（期望值 36）。同一份碼、同一組 seed，分別淨係邊個排前面。
//
// 呢度度嘅係機制本身——勝率要跑七十幾場先睇得出，唔適合做 fast gate。
{
    const order = [];
    const fake = ['a', 'b', 'c', 'd'].map(name => ({ update: () => order.push(name) }));
    updateBots(fake, TICK, 0);
    const even = order.join('');
    order.length = 0;
    updateBots(fake, TICK, 1);
    const odd = order.join('');
    check('雙數格順住行、單數格倒轉行', even === 'abcd' && odd === 'dcba', { even, odd });
    check('每一格入面每個 bot 都啱啱好行一次',
        even.length === 4 && new Set(even).size === 4 && new Set(odd).size === 4, { even, odd });
    // 兩格加埋，每個位置做「第一個」嘅次數兩邊一樣——偏差係準確抵銷，
    // 唔係靠統計上拉勻。
    check('連續兩格之後，頭位同尾位各自輪過一次',
        even[0] === odd[odd.length - 1] && even[even.length - 1] === odd[0], { even, odd });
}

// ---------- T28：快彈道唔可以穿過目標 ----------
// 舊寫法：先將彈道推前一格，再用「而家嘅點」同實體量距離。即係每格得一個
// 取樣點，兩點之間嘅嘢完全睇唔到。長弓大招 speed 60，一格 1/30 秒行 2.0 米，
// 而一隻小兵嘅命中半徑係 width 1.4 + r 0.62 = 2.02 米——只差 0.02。
// 所以一隻企喺兩個取樣點中間、又偏離中線少少嘅兵，會畀箭原封不動咁飛過。
// 玩家見到嘅係「我明明射中咗但冇傷害」。
//
// 呢個測試用幾何砌返個死角：目標喺兩個取樣點正中間、側向偏 1.9 米。
// 1.9 < 2.02，所以「掃過嘅範圍」一定包住佢；但佢距離最近嗰個取樣點係
// √(1² + 1.9²) = 2.15 > 2.02，所以逐點量嘅寫法一定漏。
{
    const sim = new Sim({ seed: 71 });
    const shooter = sim.champions[0];
    shooter.x = 0; shooter.z = 0;
    // 用真嘅技能數據，唔喺測試度自己砌一支箭
    const longshot = CHAMPIONS.longshot.abilities.find(a => a.form === 'skillshot' && a.speed >= 60);
    const step = longshot.speed * TICK;
    const reach = longshot.width + 0.62;                 // 小兵 r = 0.62
    const victim = { kind: 'minion', team: 1 - shooter.team, def: { gold: 0, xp: 0 },
        x: step * 1.5, z: reach - 0.12, r: 0.62, alive: true,
        hp: 500, maxHp: 500, armour: 0, id: 8801 };
    sim.entities.push(victim);
    sim.projectiles.push({
        kind: 'ultra', skill: true, team: shooter.team, sourceId: shooter.id,
        x: 0, z: 0, vx: 1, vz: 0, speed: longshot.speed, width: longshot.width,
        pierce: false, left: 40, hits: new Set(),
        onHit: (v) => { v.hp -= 100; }, onAlly: null,
    });
    check('掃過嘅範圍真係包住佢（幾何前提成立）', Math.abs(victim.z) < reach,
        { z: +victim.z.toFixed(2), reach: +reach.toFixed(2) });
    check('佢的確落喺兩個取樣點之間（唔係啱啱好踩中）',
        Math.hypot(step * 0.5, victim.z) > reach,
        { 距最近取樣點: +Math.hypot(step * 0.5, victim.z).toFixed(2), reach: +reach.toFixed(2) });
    for (let i = 0; i < 4; i++) sim.step();
    check('快彈道唔會穿過側邊嘅目標', victim.hp < 500, { hp: victim.hp });
}

// ---------- T29：每一個 skillshot 技能都要打得中 ----------
// T8 已經有「技能真係打得中人」，但佢問嘅係「四個技能之中有冇一個造成傷害」。
// 一個英雄得一個技能有效都照樣過骨——所以全部 skillshot 由頭到尾射唔到人，
// 佢一次都冇響過。呢條改為逐個技能問，而且係問成個類別，唔係問邊個技能。
{
    const dead = [];
    for (const id of CHAMPION_IDS) {
        const def = CHAMPIONS[id];
        def.abilities.forEach((ab, i) => {
            if (ab.form !== 'skillshot') return;
            const sim = new Sim({ seed: 5, lineups: {
                [TEAM.BLUE]: [id, 'ironward', 'emberwake'],
                [TEAM.RED]: ['duskblade', 'emberwake', 'ironhulk'] } });
            const c = sim.champions[0];
            const foe = sim.champions.find(x => x.team !== c.team);
            let guard = 0;
            while (c.level < 12 && guard++ < 500) sim.giveXp(c, 400);
            c.x = 0; c.z = 0; c.mp = c.maxMp; c.abilityCd = [0, 0, 0, 0];
            foe.x = Math.min(8, ab.range - 1); foe.z = 0; foe.hp = foe.maxHp;
            const before = foe.hp;
            sim.cast(c, i, { x: ab.range, z: 0 });
            for (let k = 0; k < 60; k++) sim.step();
            if (foe.hp >= before) dead.push(`${def.name} ${ab.name}`);
        });
    }
    check('每一個 skillshot 都射得中企喺路線上面嘅敵人', dead.length === 0, dead);
}

// ---------- T30：每個技能都要做到自己 data 講嘅嘢 ----------
// 一整個 skillshot 類別死咗都冇任何 gate 響過（ADR-117），因為 T8 問嘅係
// 「四個之中有冇一個得」。呢條反過嚟：由 champions.js 嘅宣告出發，逐個技能
// 逐個效果去對——data 寫住有傷害／治療／護盾／控場／增益／位移，實際就要
// 見到。新技能唔使改呢個測試，佢自動被覆蓋。
{
    const broken = [];
    for (const id of CHAMPION_IDS) {
        const def = CHAMPIONS[id];
        def.abilities.forEach((ab, i) => {
            const sim = new Sim({ seed: 5, lineups: {
                [TEAM.BLUE]: [id, 'ironward', 'dawnkeeper'],
                [TEAM.RED]: ['duskblade', 'emberwake', 'ironhulk'] } });
            const c = sim.champions[0], mate = sim.champions[1];
            const foe = sim.champions.find(x => x.team !== c.team);
            let g = 0;
            while (c.level < 12 && g++ < 500) sim.giveXp(c, 400);
            c.x = 0; c.z = 0; c.mp = c.maxMp; c.abilityCd = [0, 0, 0, 0]; c.hp = c.maxHp * 0.5;
            mate.x = 2; mate.z = 0; mate.hp = mate.maxHp * 0.5;
            // self 靠 radius 判定，唔係 range——擺遠咗就量緊自己擺錯位
            const reach = ab.form === 'self' ? Math.max(1.5, (ab.radius ?? 5) - 1)
                : Math.max(1.5, Math.min(6, (ab.range ?? 6) - 1));
            foe.x = reach; foe.z = 0; foe.hp = foe.maxHp;
            const b = { foeHp: foe.hp, mateHp: mate.hp, selfHp: c.hp,
                shield: Math.max(c.shield, mate.shield), buffs: Object.keys(c.buffs).length,
                stun: foe.stunUntil, root: foe.rootUntil, slow: foe.slowUntil, x: c.x };
            // 幫隊友嘅技能要對住隊友放，唔係對住敵人
            const aim = ab.allyTarget ? { targetId: mate.id }
                : { x: foe.x, z: foe.z, targetId: foe.id };
            sim.cast(c, i, aim);
            let peakShield = b.shield, healed = false;
            for (let k = 0; k < 150; k++) {
                sim.step();
                peakShield = Math.max(peakShield, c.shield, mate.shield);
                // 治療要同自然回血分開
                if (c.hp - b.selfHp > c.hpRegen * 2 + 1) healed = true;
                if (mate.hp - b.mateHp > mate.hpRegen * 2 + 1) healed = true;
            }
            // apRatio 可以係加成治療（例如曦守嘅大招），所以唔可以當佢宣告傷害
            const dmg = Math.max(0, ...(Array.isArray(ab.damage) ? ab.damage : [ab.damage ?? 0]));
            const want = [];
            if (dmg > 0 || ab.missingHpRatio) want.push('傷害');
            if (ab.healAlly || ab.healPerSec) want.push('治療');
            if (ab.shield || ab.shieldRatio) want.push('護盾');
            if (ab.stun) want.push('暈');
            if (ab.root) want.push('定身');
            if (ab.slow) want.push('減速');
            if (ab.armourBonus || ab.damageBonus || ab.attackSpeedBonus || ab.speedBonus) want.push('增益');
            if (ab.form === 'dash') want.push('位移');
            const got = [];
            if (foe.hp < b.foeHp) got.push('傷害');
            if (healed) got.push('治療');
            if (peakShield > b.shield) got.push('護盾');
            if (foe.stunUntil > b.stun) got.push('暈');
            if (foe.rootUntil > b.root) got.push('定身');
            if (foe.slowUntil > b.slow) got.push('減速');
            if (Object.keys(c.buffs).length > b.buffs) got.push('增益');
            if (Math.abs(c.x - b.x) > 1) got.push('位移');
            const missing = want.filter(w => !got.includes(w));
            if (missing.length) broken.push(`${def.name} ${ab.key} ${ab.name} 欠 ${missing.join('/')}`);
        });
    }
    check('每個技能都做到自己 data 宣告嘅效果', broken.length === 0, broken);
}

// ---------- T31：畫面講嘅同規則做嘅唔可以講兩套 ----------
// ADR-125：買唔買得到呢條規則之前寫咗三份——sim.buy 一份、HUD 嘅提示一份、
// 商品卡顏色一份，而三份嘅式都唔同。佢哋一路答案一致，純粹係因為
// canShop() 一直 return !!c。呢條 gate 釘住嗰個契約本身：buyBlocker 話冇
// 阻礙，buy() 就一定要成功；話有阻礙，buy() 就一定要失敗。
{
    const bad = [];
    const ids = Object.keys(ITEMS);
    const states = [
        ['錢多、袋空', (p) => { p.gold = 99999; p.items = []; }],
        ['一蚊都冇', (p) => { p.gold = 0; p.items = []; }],
        ['啱啱夠', (p, it) => { p.items = []; p.gold = it.cost; }],
        ['爭一蚊', (p, it) => { p.items = []; p.gold = it.cost - 1; }],
        ['袋滿', (p) => { p.gold = 99999; p.items = ids.slice(0, MAX_ITEMS); }],
        ['死咗', (p) => { p.gold = 99999; p.items = []; p.alive = false; }],
    ];
    for (const id of ids) {
        for (const [name, setup] of states) {
            const sim = new Sim({ seed: 9 });
            const p = sim.player;
            p.alive = true;
            setup(p, ITEMS[id]);
            const blocked = sim.buyBlocker(p, id);
            const before = p.items.length;
            const ok = sim.buy(p, id);
            if ((blocked === null) !== ok) {
                bad.push(`${ITEMS[id].name}/${name}: blocker=${blocked} 但 buy=${ok}`);
            }
            // 買唔到就一件都唔可以入袋，買得到就一定要入到
            if (!ok && p.items.length !== before) bad.push(`${ITEMS[id].name}/${name}: 買唔到但件嘢入咗袋`);
            if (ok && p.items.length !== before + 1) bad.push(`${ITEMS[id].name}/${name}: 買到但件嘢冇入袋`);
        }
    }
    check('buyBlocker 講冇阻礙，buy 就一定買得到（反之亦然）', bad.length === 0, bad.slice(0, 5));
    // 唔存在嘅裝備要有原因，唔可以靜靜哋失敗
    const sim = new Sim({ seed: 9 });
    check('唔存在嘅裝備會講明原因',
        sim.buyBlocker(sim.player, 'nonesuch') === 'noSuchItem'
            && sim.buy(sim.player, 'nonesuch') === false);
}

// ---------- T32：固定步長嘅步進規則 ----------
//
// 呢條規則以前係喺 main.js frame() 入面順手做嘅，所以一路冇人驗過。
// 三樣要釘死：遊戲時間唔可以慢過真實時間（順機嗰陣）、卡完唔可以爆快進、
// 以及 alpha 一定要係一個合法嘅內插系數，否則畫面會跳出兩格之外。
{
    const runTrace = (frames) => {
        let acc = 0, sim = 0, wall = 0, peak = 0, worstAlpha = -1, badAcc = 0, dropped = 0;
        const steps = [];
        for (const raw of frames) {
            const plan = planFrame(acc, raw);
            acc = plan.acc; sim += plan.steps * TICK; wall += raw; dropped += plan.dropped;
            peak = Math.max(peak, plan.steps);
            if (!(plan.alpha >= 0 && plan.alpha < 1)) worstAlpha = plan.alpha;
            if (!(acc >= 0 && acc < TICK)) badAcc++;
            steps.push(plan.steps);
        }
        return { acc, sim: +sim.toFixed(3), wall: +wall.toFixed(3), peak, worstAlpha, badAcc,
            dropped: +dropped.toFixed(3), steps };
    };
    const f = (n, v) => Array.from({ length: n }, () => v);

    const smooth = runTrace(f(600, 1 / 60));
    check('順暢 60fps：遊戲時間跟得上真實時間',
        Math.abs(smooth.sim - smooth.wall) < TICK && smooth.dropped === 0, smooth);
    check('順暢 60fps：一幀唔會行多過一格', smooth.peak === 1, smooth.peak);

    const high = runTrace(f(1200, 1 / 120));
    check('高刷 120fps：遊戲時間一樣跟得上',
        Math.abs(high.sim - high.wall) < TICK && high.peak === 1, high);

    // 卡三秒之後，最怕嘅唔係丟低時間，而係還債式快進：機一順返就連續幾幀
    // 行足六格，即係五十毫秒之內推進大半秒，成場飛咗過去。
    const hitch = runTrace([...f(60, 1 / 60), ...f(12, 0.25), ...f(180, 1 / 60)]);
    const after = hitch.steps.slice(72);
    check('卡三秒之後唔會爆快進', Math.max(...after) <= 1,
        { 卡完之後最多步數: Math.max(...after), 頭六幀: after.slice(0, 6) });
    check('卡機期間丟低嘅時間有記低', hitch.dropped > 0.5, hitch.dropped);

    // 切後台三十秒：唔可以試圖追返三十秒
    const away = runTrace([...f(60, 1 / 60), 30, ...f(60, 1 / 60)]);
    check('切後台三十秒唔會追返', away.peak <= MAX_STEPS && away.dropped > 29, away);

    // acc 係一個只會被扣嘅池；冇人夾嘅話，卡機之後佢會一路脹落去
    for (const t of [smooth, high, hitch, away]) {
        check('剩低嘅時間永遠夾喺一格之內', t.badAcc === 0, t.badAcc);
        check('alpha 永遠係合法嘅內插系數', t.worstAlpha === -1, t.worstAlpha);
    }
    check('一幀夾嘅秒數同步數上限講同一套', Math.abs(MAX_FRAME - MAX_STEPS * TICK) < 1e-9,
        { MAX_FRAME, 上限對應秒數: MAX_STEPS * TICK });
    // 負數同 NaN 唔可以令個池爆掉
    check('離奇嘅 dt 唔會整爛個池',
        planFrame(0, -5).steps === 0 && planFrame(0, 0).steps === 0
            && planFrame(0, 0).alpha === 0);
}

console.log(`\nmoba sim: ${pass}/${pass + fail} 通過`);
if (fail) { console.log('失敗項目:', failed.join('、')); process.exit(1); }
