// 電腦英雄。同 Racing Car 嗰個 AI 一樣，走「狀態機 + 明確入場條件」路線，
// 唔用一條大式去夾所有情況——因為「推線」同「逃命」係相反嘅目標，夾埋一齊
// 就永遠會兩邊都做得半桶水。
//
// 公平原則（同 royale 嘅 ADR-007 一致）：bot 用同一套 sim API、同一批數值、
// 同一個施法距離。佢哋唯一嘅「優勢」係唔會手殘，唯一嘅劣勢係決策簡單。

import { TEAM, MAP, enemyOf } from './constants.js';
import { abilityRank } from './champions.js';
import { nextPurchase, ITEMS, BUILDS, MAX_ITEMS } from './items.js';

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const sideSign = (team) => (team === TEAM.BLUE ? -1 : 1);

const STATE = { PUSH: 'push', SIEGE: 'siege', FIGHT: 'fight', RETREAT: 'retreat', BASE: 'base' };

export function createBot(sim, champ, opts = {}) {
    // 個性由 sim 個 seeded rng 抽：同一個種子跑到同一場波（測試要重現），
    // 但唔同種子會有唔同性格嘅對手。冇呢一步，六個種子跑出嚟係六場一模一樣
    // 嘅比賽——實測過，連完場時間都同到一秒不差。
    const aggression = opts.aggression ?? (0.38 + sim.rng() * 0.40);  // 0 = 怕死，1 = 搏命
    const reaction = opts.reaction ?? (0.18 + sim.rng() * 0.22);      // 幾耐諗一次
    let state = STATE.PUSH;
    let think = sim.rng() * reaction;
    let castCd = 0;

    // 邊個位置算「安全」：己方最前面嗰座未拆嘅塔前面少少
    function safeX() {
        const mine = sim.entities.filter(e => e.alive && e.kind === 'tower' && e.team === champ.team);
        if (!mine.length) return sideSign(champ.team) * (MAP.nexusX - 6);
        const front = mine.reduce((a, b) => (Math.abs(a.x) < Math.abs(b.x) ? a : b));
        return front.x + sideSign(champ.team) * 3;
    }

    // 敵方塔嘅威脅範圍：無兵嘅時候唔好行入去
    function underEnemyTower() {
        return sim.entities.some(e => e.alive && (e.kind === 'tower' || e.kind === 'nexus')
            && e.team !== champ.team && dist(champ, e) <= e.range + 2);
    }

    function alliedMinionsNear() {
        return sim.entities.filter(e => e.alive && e.kind === 'minion'
            && e.team === champ.team && dist(champ, e) < 12).length;
    }

    function nearestEnemyChamp() {
        let best = null, bd = Infinity;
        for (const e of sim.champions) {
            if (!e.alive || e.team === champ.team) continue;
            const d = dist(champ, e);
            if (d < bd) { bd = d; best = e; }
        }
        return { foe: best, d: bd };
    }

    // 補刀：只喺小兵血量低過一下普攻先出手，唔會空打
    function lastHittable() {
        const st = sim.stats(champ);
        for (const e of sim.entities) {
            if (!e.alive || e.kind !== 'minion' || e.team === champ.team) continue;
            if (dist(champ, e) > champ.range + e.r) continue;
            if (e.hp <= st.damage * 1.05) return e;
        }
        return null;
    }

    // 攻城目標：而家打得嘅嗰座敵方建築（規則喺 sim 度，唔喺呢度抄一份）
    function siegeTarget() {
        const t = sim.structureTargetFor(champ);
        if (!t) return null;
        // 要有自己嘅兵喺塔前面食住塔嘅火力，先好上去拆
        const cover = sim.entities.filter(e => e.alive && e.kind === 'minion'
            && e.team === champ.team && dist(e, t) < t.range + 2).length;
        return cover >= 2 ? t : null;
    }

    // 買到嘢先值得行返去。淨係「夠錢買下一件」就返，唔會為咗 100 蚊走返轉頭。
    function wantsToShop() {
        if (champ.items.length >= MAX_ITEMS) return false;
        return nextPurchase(champ.champId, champ.items, champ.gold) != null;
    }

    // 一到泉水就買，買到唔再買得到為止（死完重生嗰陣自動觸發）
    function shop() {
        if (!sim.canShop(champ)) return;
        for (let i = 0; i < MAX_ITEMS; i++) {
            const id = nextPurchase(champ.champId, champ.items, champ.gold);
            if (!id || !sim.buy(champ, id)) break;
        }
    }

    function pickState() {
        const st = sim.stats(champ);
        const hpPct = champ.hp / st.maxHp;
        const { foe, d } = nearestEnemyChamp();

        if (hpPct < 0.28 && champ.mp / champ.maxMp < 0.35) return STATE.BASE;
        // 錢夠買下一件裝就返屋企——冇呢一步，金幣就淨係一個只入唔出嘅數字
        if (wantsToShop() && (!foe || d > 14) && hpPct < 0.92) return STATE.BASE;
        if (hpPct < 0.32) return STATE.RETREAT;
        if (underEnemyTower() && alliedMinionsNear() === 0) return STATE.RETREAT;
        // 攻城要排喺「見到敵方英雄就打」之前。
        // 之前排喺後面，實測 SIEGE 只佔全場 0.9% 時間——因為你攻城嗰陣，
        // 對面一定有人喺塔下面守，敵人永遠喺十三米內，所以個狀態機
        // 永遠喺上一條規則就分叉走咗，SIEGE 係一個到唔到嘅狀態。
        // 拆到塔先係贏，同人喺塔下面換血唔係。
        if (hpPct > 0.5 && siegeTarget() && (!foe || d > 6.5)) return STATE.SIEGE;
        if (foe && d < 13) {
            // 血量比拼：我健康而佢殘，就打；反過來就走
            const theirs = foe.hp / sim.stats(foe).maxHp;
            if (hpPct > theirs - 0.15 + (1 - aggression) * 0.2) return STATE.FIGHT;
            return STATE.RETREAT;
        }
        if (hpPct > 0.5 && siegeTarget()) return STATE.SIEGE;
        return STATE.PUSH;
    }

    function useAbilities(dt) {
        castCd -= dt;
        if (castCd > 0) return;
        const { foe, d } = nearestEnemyChamp();
        const st = sim.stats(champ);
        const hpPct = champ.hp / st.maxHp;

        for (let i = 0; i < 4; i++) {
            if (!sim.castable(champ, i)) continue;
            const ab = champ.def.abilities[i];
            const rank = abilityRank(champ.level, i);
            if (rank <= 0) continue;

            // 保命類：血少先用
            if (ab.form === 'self' && (ab.shield || ab.armourBonus)) {
                if (hpPct < 0.55 && foe && d < 10) { sim.cast(champ, i); castCd = 0.35; return; }
                continue;
            }
            if (ab.form === 'self' && (ab.speedBonus || ab.attackSpeedBonus || ab.damageBonus || ab.healPerSec)) {
                if (foe && d < 11) { sim.cast(champ, i); castCd = 0.35; return; }
                continue;
            }
            // 位移：向後閃係逃命用，向前衝係開打用
            if (ab.form === 'dash') {
                if (ab.backwards) {
                    if (hpPct < 0.4 && foe && d < 7) {
                        sim.cast(champ, i, { x: foe.x, z: foe.z });
                        castCd = 0.4; return;
                    }
                    continue;
                }
                if (foe && d < ab.range + 1 && d > 2.5 && state === STATE.FIGHT) {
                    sim.cast(champ, i, { x: foe.x, z: foe.z });
                    castCd = 0.4; return;
                }
                continue;
            }
            // 治療隊友嘅盾：畀血最少嗰個
            if (ab.allyTarget) {
                const hurt = sim.champions
                    .filter(a => a.alive && a.team === champ.team && dist(champ, a) <= ab.range)
                    .sort((a, b) => a.hp / sim.stats(a).maxHp - b.hp / sim.stats(b).maxHp)[0];
                if (hurt && hurt.hp / sim.stats(hurt).maxHp < 0.7) {
                    sim.cast(champ, i, { targetId: hurt.id });
                    castCd = 0.35; return;
                }
                continue;
            }
            // 攻擊類：優先英雄，冇就清兵
            const target = (foe && d <= (ab.range ?? 10)) ? foe : nearestEnemyMinion(ab.range ?? 10);
            if (!target) continue;
            if (ab.form === 'target') sim.cast(champ, i, { targetId: target.id });
            else sim.cast(champ, i, { x: target.x, z: target.z });
            castCd = 0.35;
            return;
        }
    }

    function nearestEnemyMinion(range) {
        let best = null, bd = Infinity;
        for (const e of sim.entities) {
            if (!e.alive || e.kind !== 'minion' || e.team === champ.team) continue;
            const d = dist(champ, e);
            if (d <= range && d < bd) { bd = d; best = e; }
        }
        return best;
    }

    return {
        get state() { return state; },
        update(dt) {
            if (!champ.alive) return;
            shop();                       // 企喺泉水就自動掃貨
            think -= dt;
            if (think <= 0) { state = pickState(); think = reaction; }
            useAbilities(dt);

            // 被嘲諷就唔使諗
            if (champ.tauntUntil > sim.time) return;

            const { foe, d } = nearestEnemyChamp();
            const home = sideSign(champ.team) * MAP.fountainX;

            if (state === STATE.BASE) { sim.orderMove(champ, home, 0); return; }
            if (state === STATE.RETREAT) {
                sim.orderMove(champ, safeX(), champ.z * 0.6);
                return;
            }
            if (state === STATE.FIGHT && foe) {
                sim.orderAttack(champ, foe.id);
                return;
            }
            if (state === STATE.SIEGE) {
                const t = siegeTarget();
                if (t) { sim.orderAttack(champ, t.id); return; }
            }
            // 推線：先補刀，冇得補就打最前面嗰個目標
            const cs = lastHittable();
            if (cs) { sim.orderAttack(champ, cs.id); return; }
            const minion = nearestEnemyMinion(champ.range + 1);
            if (minion) { sim.orderAttack(champ, minion.id); return; }

            const structure = sim.entities.find(e => e.alive && (e.kind === 'tower' || e.kind === 'nexus')
                && e.team !== champ.team && dist(champ, e) <= champ.range + e.r);
            if (structure && alliedMinionsNear() > 0) { sim.orderAttack(champ, structure.id); return; }

            // 冇嘢打就跟住兵線推
            const front = frontLineX();
            sim.orderMove(champ, front, champ.z * 0.5);
        },
    };

    function frontLineX() {
        const mine = sim.entities.filter(e => e.alive && e.kind === 'minion' && e.team === champ.team);
        if (!mine.length) return safeX();
        const s = sideSign(champ.team);
        // 最前面嗰個我方小兵（即係 x 最靠近敵方嗰邊）
        let best = mine[0];
        for (const m of mine) if (m.x * -s > best.x * -s) best = m;
        return best.x + -s * 1.5;
    }
}
