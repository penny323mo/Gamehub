// 電腦英雄。同 Racing Car 嗰個 AI 一樣，走「狀態機 + 明確入場條件」路線，
// 唔用一條大式去夾所有情況——因為「推線」同「逃命」係相反嘅目標，夾埋一齊
// 就永遠會兩邊都做得半桶水。
//
// 公平原則（同 royale 嘅 ADR-007 一致）：bot 用同一套 sim API、同一批數值、
// 同一個施法距離。佢哋唯一嘅「優勢」係唔會手殘，唯一嘅劣勢係決策簡單。

import { TEAM, MAP, enemyOf } from './constants.js?v=hud-stack-13';
import { abilityRank } from './champions.js?v=hud-stack-13';
import { nextPurchase, ITEMS, BUILDS, MAX_ITEMS } from './items.js?v=hud-stack-13';

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const sideSign = (team) => (team === TEAM.BLUE ? -1 : 1);

const STATE = { PUSH: 'push', SIEGE: 'siege', FIGHT: 'fight', RETREAT: 'retreat', BASE: 'base' };

// 打得起上嚟嘅範圍。同 pickState 嗰個 13 米唔一樣：13 係「我睇唔睇到佢」，
// 呢個 15 係「呢一場交火包住邊幾個人」。
const FIGHT_RADIUS = 15;

// 有效血量：血 + 盾，再按護甲換算成「要食幾多傷害先死」。
// 直接比 hp 會令高甲坦克睇落好脆，集火就會揀錯人。
function effectiveHp(sim, c) {
    const shield = c.shieldUntil > sim.time ? c.shield : 0;
    return (c.hp + shield) * (1 + sim.stats(c).armour / 100);
}

// 一個英雄喺團戰入面值幾多：捱得 × 打得。
function threat(sim, c) {
    const st = sim.stats(c);
    return effectiveHp(sim, c) * st.damage * st.attackSpeed;
}

// 一格入面更新全部 bot。
//
// 點解唔可以淨係 `for (const b of bots) b.update(dt)`：bot 落單係即刻改到
// sim 狀態嘅，所以排喺後面嘅 bot 讀到嘅係「隊友已經郁咗之後」嘅世界，而排
// 頭嗰個讀嘅係舊一格嘅。呢個唔係理論上嘅潔癖——量到嘅：鏡像陣容 72 場，
// 藍方先諗嘅時候藍方贏 33 場，反轉做紅方先諗，藍方贏 48 場。同一份碼、同一
// 組 seed，差別淨係邊個排喺前面。後手贏多啲。
//
// 而玩家永遠喺藍方，佢班隊友嘅 bot 就永遠排喺紅方前面，即係玩家嗰邊長期
// 食暗虧。
//
// 最徹底嘅做法係「全部人先諗，然後先一齊落單」，但噉樣要將 ai.js 嘅決策同
// 落單拆開，改動大而且容易漏。呢度用逐格對調次序：偏差每兩格就準確抵銷一
// 次，唔使靠統計上拉勻，亦都完全決定性（同一個 seed 仍然跑到同一場波）。
export function updateBots(bots, dt, tick) {
    if (tick % 2 === 0) for (let i = 0; i < bots.length; i++) bots[i].update(dt);
    else for (let i = bots.length - 1; i >= 0; i--) bots[i].update(dt);
}

export function createBot(sim, champ, opts = {}) {
    // 個性由 sim 個 seeded rng 抽：同一個種子跑到同一場波（測試要重現），
    // 但唔同種子會有唔同性格嘅對手。冇呢一步，六個種子跑出嚟係六場一模一樣
    // 嘅比賽——實測過，連完場時間都同到一秒不差。
    const aggression = opts.aggression ?? (0.38 + sim.rng() * 0.40);  // 0 = 怕死，1 = 搏命
    const reaction = opts.reaction ?? (0.18 + sim.rng() * 0.22);      // 幾耐諗一次
    let state = STATE.PUSH;
    let think = sim.rng() * reaction;
    let castCd = 0;
    // 打落去就要打完：入場同離場用兩條唔同嘅線。冇呢兩個時間戳，
    // pickState 每 0.2 秒重算一次，兩邊互換血就會不停對調 FIGHT/RETREAT。
    let commitUntil = 0;
    let disengageUntil = 0;
    let dodgeUntil = 0;

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

    // 局部戰力比：呢一團交火，我哋 vs 佢哋邊個大。
    // 之前係比 1v1 血量百分比——所以三打一都會有人因為自己血少啲而掉頭走，
    // 一打三又會因為自己血多啲而衝上去送頭。MOBA 打嘅係人數同位置，唔係血條高低。
    function powerRatio(x, z) {
        let mine = 0, theirs = 0;
        for (const c of sim.champions) {
            if (!c.alive || Math.hypot(c.x - x, c.z - z) > FIGHT_RADIUS) continue;
            if (c.team === champ.team) mine += threat(sim, c);
            else theirs += threat(sim, c);
        }
        if (theirs <= 0) return Infinity;
        // 塔底下打交係有著數嘅，計落個比例度
        if (towerCover(x, z, champ.team)) mine *= 1.6;
        if (towerCover(x, z, enemyOf(champ.team))) theirs *= 1.6;
        return mine / theirs;
    }

    function towerCover(x, z, team) {
        return sim.entities.some(e => e.alive && e.team === team
            && (e.kind === 'tower' || e.kind === 'nexus')
            && Math.hypot(e.x - x, e.z - z) <= e.range);
    }

    // 集火目標。全隊各自計，但計法一模一樣，所以三個人會揀到同一個——
    // 唔使一個共用嘅「隊長」狀態，亦都唔會有邊個先跑嘅次序問題。
    function focusTarget() {
        let best = null, bestScore = Infinity;
        for (const e of sim.champions) {
            if (!e.alive || e.team === champ.team) continue;
            let nearest = Infinity, engaged = 0;
            for (const a of sim.champions) {
                if (!a.alive || a.team !== champ.team) continue;
                const d = dist(a, e);
                if (d < nearest) nearest = d;
                if (d <= FIGHT_RADIUS) engaged++;
            }
            if (!engaged) continue;
            // 分數越低越優先：殘血、脆皮、多人打得到、企得近，全部拉低分數
            const score = effectiveHp(sim, e) / engaged * (1 + nearest / 20);
            if (score < bestScore) { bestScore = score; best = e; }
        }
        return best;
    }

    // 打邊個：斬得死嘅一定唔放走，其次跟隊伍集火，最後先係最近嗰個。
    function fightTarget() {
        const st = sim.stats(champ);
        let killable = null, kd = Infinity;
        for (const e of sim.champions) {
            if (!e.alive || e.team === champ.team) continue;
            const d = dist(champ, e);
            if (d > champ.range + 3) continue;
            if (effectiveHp(sim, e) > st.damage * 2.5) continue;
            if (d < kd) { kd = d; killable = e; }
        }
        if (killable) return killable;
        const focus = focusTarget();
        if (focus && dist(champ, focus) <= 16) return focus;
        return nearestEnemyChamp().foe;
    }

    // 閃技能。埋到身先側身係閃唔到嘅——要橫向行出彈道闊度之外，
    // 需要嘅速度同剩返嘅時間成反比，貼身嗰陣個數字會超過角色跑得幾快。
    // 所以呢度計嘅唔係「有冇危險」，而係「而家開始行，夠唔夠時間行得出去」；
    // 夠先郁，唔夠就企定食佢，唔好行兩步又食埋。
    function dodge() {
        if (sim.time < dodgeUntil) return true;     // 閃緊，唔好落新指令蓋過去
        const speed = sim.stats(champ).speed;
        for (const p of sim.projectiles) {
            if (!p.skill || p.team === champ.team) continue;
            const ahead = (champ.x - p.x) * p.vx + (champ.z - p.z) * p.vz;
            if (ahead <= 0 || ahead > p.left) continue;          // 喺我後面，或者射唔到咁遠
            const cross = (champ.x - p.x) * p.vz - (champ.z - p.z) * p.vx;
            const clear = p.width + champ.r + 0.35;
            if (Math.abs(cross) >= clear) continue;              // 本來就掃唔到我
            const tti = ahead / p.speed;
            // 向已經偏開嗰邊行最短。行出橋外就要試另一邊，但另一邊係要
            // 橫跨成條彈道，距離長成倍——所以個 step 要重計，唔可以照用短嗰個，
            // 否則貼近橋邊嗰陣會「閃」咗入彈道中間。
            let sign = cross >= 0 ? 1 : -1;
            let step = clear - Math.abs(cross) + 0.6;
            if (Math.abs(champ.z - p.vx * sign * step) > MAP.halfWidth - 0.5) {
                sign = -sign;
                step = clear + Math.abs(cross) + 0.6;
            }
            if (step / Math.max(0.1, tti) > speed * 0.95) continue;   // 點行都閃唔切
            sim.orderMove(champ, champ.x + p.vz * sign * step, champ.z - p.vx * sign * step);
            dodgeUntil = sim.time + Math.min(tti, 0.9);
            return true;
        }
        return false;
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
        if (cover >= 2) return t;
        // 打贏咗一波就係攻城窗口：守嘅人死晒或者未返到，塔就冇人幫佢拖時間，
        // 幾個英雄夠打得散佢。唔趁呢陣拆，一場贏咗嘅團戰收成就係零——
        // 團戰打得有結果但冇嘢收，只不過係死多幾次。
        const defenders = sim.champions.filter(e => e.alive && e.team !== champ.team
            && dist(e, t) < t.range + 6).length;
        if (defenders > 0) return null;
        const mates = sim.champions.filter(e => e.alive && e.team === champ.team
            && dist(e, t) < t.range + 6).length;
        return mates >= 2 && champ.hp / sim.stats(champ).maxHp > 0.45 ? t : null;
    }

    // 買裝可以喺戰線完成；返程決策只再睇血魔狀態，唔會為購物放棄兵線。
    function wantsToShop() {
        if (champ.items.length >= MAX_ITEMS) return false;
        return nextPurchase(champ.champId, champ.items, champ.gold) != null;
    }

    // 同玩家公平：AI 夠錢亦可以即時沿出裝表買，買到唔再負擔為止。
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
        // 已經落咗場、對手仲喺埋一齊，就當自己喺交火中間
        const committed = sim.time < commitUntil && foe && d < FIGHT_RADIUS;

        if (committed) {
            // 承諾唔等於送頭：真係打殘咗就一定要走
            if (hpPct < 0.17) { commitUntil = 0; disengageUntil = sim.time + 3; return STATE.RETREAT; }
        } else {
            if (hpPct < 0.28 && champ.mp / champ.maxMp < 0.35) return STATE.BASE;
            // 錢夠買下一件裝就返屋企——冇呢一步，金幣就淨係一個只入唔出嘅數字
            if (wantsToShop() && (!foe || d > 14) && hpPct < 0.92) return STATE.BASE;
            if (hpPct < 0.32) return STATE.RETREAT;
            // 走就走乾淨。唔設呢段冷卻，退到一半又見血條反超就即刻返轉頭，
            // 一場交火會斷開成十幾場「三秒無傷害對峙」。
            if (sim.time < disengageUntil) return STATE.RETREAT;
            if (underEnemyTower() && alliedMinionsNear() === 0) return STATE.RETREAT;
            // 攻城要排喺「見到敵方英雄就打」之前。
            // 之前排喺後面，實測 SIEGE 只佔全場 0.9% 時間——因為你攻城嗰陣，
            // 對面一定有人喺塔下面守，敵人永遠喺十三米內，所以個狀態機
            // 永遠喺上一條規則就分叉走咗，SIEGE 係一個到唔到嘅狀態。
            // 拆到塔先係贏，同人喺塔下面換血唔係。
            if (hpPct > 0.5 && siegeTarget() && (!foe || d > 6.5)) return STATE.SIEGE;
        }
        if (foe && d < 13) {
            const ratio = powerRatio((champ.x + foe.x) / 2, (champ.z + foe.z) / 2);
            // 有塔拆嗰陣，一場五五波嘅團戰係蝕本生意：贏咗都冇嘢收，
            // 輸咗就冇咗個攻城窗口。所以有目標嗰陣，開打嘅門檻要高啲。
            const objective = siegeTarget() ? 0.3 : 0;
            // 入場門檻高過離場門檻。兩條線一樣嘅話就係開關喺臨界點度震。
            const engageAt = 1.05 - aggression * 0.35 + objective;
            const floor = committed ? (engageAt - objective) * 0.62 : engageAt;
            if (ratio >= floor) {
                if (!committed) commitUntil = sim.time + 3 + aggression * 2.5;
                return STATE.FIGHT;
            }
            commitUntil = 0;
            // 打唔過唔等於要走。有塔拆就去拆塔，讓對面嚟守——
            // 硬食一場打唔贏嘅交火，同掉頭返屋企，兩樣都係唔要嗰座塔。
            if (hpPct > 0.5 && siegeTarget()) return STATE.SIEGE;
            disengageUntil = sim.time + 2.5;
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
        // foe = 最近嘅威脅（保命同閃避睇呢個），aim = 隊伍集火嗰個（傷害技能打呢個）。
        // 兩者分開，先至唔會出現「三個人各自打自己面前嗰個」。
        const aim = (state === STATE.FIGHT ? fightTarget() : null) ?? foe;
        const aimD = aim ? dist(champ, aim) : Infinity;

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
                if (aim && aimD < ab.range + 1 && aimD > 2.5 && state === STATE.FIGHT) {
                    sim.cast(champ, i, { x: aim.x, z: aim.z });
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
            // 攻擊類：優先集火目標，其次最近嘅敵人，都唔喺射程就清兵
            const reach = ab.range ?? 10;
            const target = (aim && aimD <= reach) ? aim
                : (foe && d <= reach) ? foe
                : nearestEnemyMinion(reach);
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
            shop();                       // 夠錢就自動沿出裝表買
            think -= dt;
            if (think <= 0) { state = pickState(); think = reaction; }
            useAbilities(dt);

            // 被嘲諷就唔使諗
            if (champ.tauntUntil > sim.time) return;
            // 閃避排喺所有指令之前：一閃就係一閃，唔會同時想行去打人
            if (state !== STATE.BASE && dodge()) return;

            const { foe, d } = nearestEnemyChamp();
            const home = sideSign(champ.team) * MAP.fountainX;

            if (state === STATE.BASE) {
                // 返程讀緊秒就唔好落指令——落一個就即刻打斷咗自己
                if (sim.recallProgress(champ) > 0) return;
                // 安全（附近冇敵人）就用返程，唔係就照行返去
                const safe = !foe || d > 16;
                if (safe && !sim.atFountain(champ) && sim.startRecall(champ)) return;
                sim.orderMove(champ, home, 0);
                return;
            }
            if (state === STATE.RETREAT) {
                sim.orderMove(champ, safeX(), champ.z * 0.6);
                return;
            }
            if (state === STATE.FIGHT) {
                const t = fightTarget();
                if (t) { sim.orderAttack(champ, t.id); return; }
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
