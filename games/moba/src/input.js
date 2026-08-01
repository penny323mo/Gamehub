// 操作。
//
// 第一版係 LoL 嗰套「撳地面行過去」。實測揸落去唔玩得，原因唔止一個：
//   1. 手機上面掂一下畫面，touchstart 開咗虛擬搖桿，pointerdown 同時又落咗
//      一個「行去嗰點」嘅指令，兩個輸入打架；
//   2. 一條線嘅戰場入面，走位係逐格微調嘅事，撳一下行一段根本跟唔到節奏；
//   3. 電腦冇鍵盤走位，滑鼠要一路撳一路瞄，兩件事搶同一隻手。
//
// 而家改成直接操控：
//   電腦：WASD／方向鍵行，撳敵人打佢，空白鍵打最近嗰個，QWER 跟滑鼠位置施法。
//   手機：左邊拖 = 搖桿，右邊一粒攻擊掣（自動鎖最近），技能掣撳住拖出去瞄準。
// 兩套都係「郁」同「打」分開兩隻手，唔會爭同一個輸入。

import * as THREE from '../vendor/three.module.min.js';
import { MAP } from './constants.js';

const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function createInput(canvas, view, sim, hud) {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const keys = new Set();
    let aimX = 0, aimZ = 0;
    let joy = null;                 // { id, cx, cy, dx, dy }
    let aiming = null;              // { index, id, dx, dy }

    function toWorld(clientX, clientY) {
        const r = canvas.getBoundingClientRect();
        ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, view.camera);
        return ray.ray.intersectPlane(GROUND, hit) ? hit : null;
    }

    function enemyAt(x, z) {
        let best = null, bd = 3.4;
        for (const e of sim.entities) {
            if (!e.alive || e.team === sim.player.team) continue;
            const r = e.kind === 'champ' ? 1.9 : e.kind === 'minion' ? 1.3 : 4.5;
            const d = Math.hypot(e.x - x, e.z - z);
            if (d < r && d < bd) { bd = d; best = e; }
        }
        return best;
    }

    // 「最近而打得到嘅敵人」。補刀優先：血量夠低一下普攻打得死嘅細兵行先，
    // 唔係就揀最近。呢個係整個攻擊掣嘅靈魂——冇補刀優先，攻擊掣就係亂打。
    function autoTarget(range = null) {
        const p = sim.player;
        const st = sim.stats(p);
        const reach = (range ?? p.range) + 0.6;
        let killable = null, kd = Infinity, nearest = null, nd = Infinity;
        for (const e of sim.entities) {
            if (!e.alive || e.team === p.team) continue;
            if (e.kind !== 'champ' && e.kind !== 'minion' && e.kind !== 'tower' && e.kind !== 'nexus') continue;
            const d = Math.hypot(e.x - p.x, e.z - p.z) - (e.r ?? 0);
            if (d > reach) continue;
            if (e.kind === 'minion' && e.hp <= st.damage * 1.05 && d < kd) { kd = d; killable = e; }
            if (d < nd) { nd = d; nearest = e; }
        }
        return killable ?? nearest;
    }

    function attackNearest() {
        const t = autoTarget();
        if (t) sim.orderAttack(sim.player, t.id);
        return !!t;
    }

    function cast(index, ax, az) {
        const p = sim.player;
        if (!p.alive || !sim.castable(p, index)) return false;
        const ab = p.def.abilities[index];
        if (ab.allyTarget) {
            const mate = sim.champions
                .filter(c => c.alive && c.team === p.team && Math.hypot(c.x - p.x, c.z - p.z) <= ab.range)
                .sort((a, b) => a.hp / sim.stats(a).maxHp - b.hp / sim.stats(b).maxHp)[0];
            return mate ? sim.cast(p, index, { targetId: mate.id }) : false;
        }
        if (ab.form === 'target') {
            const foe = enemyAt(ax, az) ?? autoTarget(ab.range);
            return foe ? sim.cast(p, index, { targetId: foe.id }) : false;
        }
        return sim.cast(p, index, { x: ax, z: az });
    }

    // 冇明確瞄準嗰陣（手機淨係撳一下）：射向最近嘅敵人，冇敵人就射向前
    function defaultAim(index) {
        const p = sim.player;
        const ab = p.def.abilities[index] ?? {};
        const foe = autoTarget(ab.range ?? 10);
        if (foe) return { x: foe.x, z: foe.z };
        const dir = p.team === 0 ? 1 : -1;
        return { x: p.x + dir * (ab.range ?? 8), z: p.z };
    }

    // ---------- 電腦 ----------
    function onPointerMove(ev) {
        const w = toWorld(ev.clientX, ev.clientY);
        if (w) { aimX = w.x; aimZ = w.z; }
    }
    function onPointerDown(ev) {
        if (ev.target !== canvas || ev.pointerType === 'touch') return;
        const w = toWorld(ev.clientX, ev.clientY);
        if (!w) return;
        aimX = w.x; aimZ = w.z;
        const foe = enemyAt(w.x, w.z);
        if (foe) sim.orderAttack(sim.player, foe.id);
        else sim.orderMove(sim.player, clamp(w.x, -MAP.fountainX, MAP.fountainX),
            clamp(w.z, -MAP.halfWidth, MAP.halfWidth));
    }
    function onKeyDown(ev) {
        const k = ev.key.toLowerCase();
        const i = ['q', 'w', 'e', 'r'].indexOf(k);
        // W 係走位鍵，唔可以同時做技能鍵。技能用 Q/W/E/R 係 LoL 嘅習慣，
        // 但呢度走位行 WASD，所以第二個技能改用 F，W 專心做前行。
        if (k === 'q' || k === 'f' || k === 'e' || k === 'r') {
            const idx = { q: 0, f: 1, e: 2, r: 3 }[k];
            cast(idx, aimX, aimZ);
            ev.preventDefault();
            return;
        }
        if (k === ' ') { attackNearest(); ev.preventDefault(); return; }
        if (k === 'b') { hud.toggleShop(); ev.preventDefault(); return; }
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
            keys.add(k);
            ev.preventDefault();
        }
    }
    function onKeyUp(ev) { keys.delete(ev.key.toLowerCase()); }
    function onBlur() { keys.clear(); joy = null; }

    // 鍵盤方向：螢幕右 = 世界 +x，螢幕上 = 世界 -z（鏡頭永遠喺 +z 望入去）
    function keyDir() {
        let dx = 0, dz = 0;
        if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
        if (keys.has('d') || keys.has('arrowright')) dx += 1;
        if (keys.has('w') || keys.has('arrowup')) dz -= 1;
        if (keys.has('s') || keys.has('arrowdown')) dz += 1;
        const len = Math.hypot(dx, dz);
        return len ? { dx: dx / len, dz: dz / len } : null;
    }

    // ---------- 手機 ----------
    const stick = document.createElement('div');
    stick.className = 'moba-stick';
    const knob = document.createElement('div');
    knob.className = 'moba-knob';
    stick.append(knob);
    canvas.parentElement.append(stick);

    // 只有畫面左邊一半會開搖桿；右邊留畀技能掣，唔會撞。
    function touchStart(ev) {
        for (const t of ev.changedTouches) {
            if (joy || t.clientX > window.innerWidth * 0.55) continue;
            joy = { id: t.identifier, cx: t.clientX, cy: t.clientY, dx: 0, dy: 0 };
            stick.classList.add('active');
            stick.style.left = `${t.clientX}px`;
            stick.style.top = `${t.clientY}px`;
        }
        if (joy) ev.preventDefault();
    }
    function touchMove(ev) {
        if (!joy) return;
        for (const t of ev.changedTouches) {
            if (t.identifier !== joy.id) continue;
            const dx = t.clientX - joy.cx, dy = t.clientY - joy.cy;
            const len = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, len / 52);
            joy.dx = dx / len * k; joy.dy = dy / len * k;
            knob.style.transform = `translate(${joy.dx * 42}px, ${joy.dy * 42}px)`;
            ev.preventDefault();
        }
    }
    function touchEnd(ev) {
        if (!joy) return;
        for (const t of ev.changedTouches) {
            if (t.identifier !== joy.id) continue;
            joy = null;
            knob.style.transform = '';
            stick.classList.remove('active');
        }
    }

    // 技能掣：撳一下 = 自動瞄最近；撳住拖出去 = 自己指方向，放手先施法
    const aimLine = document.createElement('div');
    aimLine.className = 'moba-aim hidden';
    canvas.parentElement.append(aimLine);

    hud.skillBtns.forEach(({ btn }, index) => {
        btn.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            btn.setPointerCapture?.(ev.pointerId);
            aiming = { index, id: ev.pointerId, dx: 0, dy: 0 };
        });
        btn.addEventListener('pointermove', (ev) => {
            if (!aiming || aiming.id !== ev.pointerId) return;
            const r = btn.getBoundingClientRect();
            aiming.dx = ev.clientX - (r.left + r.width / 2);
            aiming.dy = ev.clientY - (r.top + r.height / 2);
            const len = Math.hypot(aiming.dx, aiming.dy);
            if (len < 12) { aimLine.classList.add('hidden'); return; }
            aimLine.classList.remove('hidden');
            aimLine.style.left = `${r.left + r.width / 2}px`;
            aimLine.style.top = `${r.top + r.height / 2}px`;
            aimLine.style.width = `${Math.min(len, 150)}px`;
            aimLine.style.transform = `rotate(${Math.atan2(aiming.dy, aiming.dx)}rad)`;
        });
        const finish = (ev) => {
            if (!aiming || aiming.id !== ev.pointerId) return;
            const { index: i, dx, dy } = aiming;
            aiming = null;
            aimLine.classList.add('hidden');
            const p = sim.player;
            const len = Math.hypot(dx, dy);
            if (len > 14) {
                const reach = p.def.abilities[i]?.range ?? 9;
                const k = reach / len;
                cast(i, p.x + dx * k, p.z + dy * k);
            } else {
                const a = defaultAim(i);
                cast(i, a.x, a.z);
            }
        };
        btn.addEventListener('pointerup', finish);
        btn.addEventListener('pointercancel', () => { aiming = null; aimLine.classList.add('hidden'); });
    });

    // 攻擊掣：撳住會一路鎖住最近嘅目標
    let attackHeld = false;
    if (hud.attackBtn) {
        hud.attackBtn.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            hud.attackBtn.setPointerCapture?.(ev.pointerId);
            attackHeld = true;
            attackNearest();
        });
        const stop = () => { attackHeld = false; };
        hud.attackBtn.addEventListener('pointerup', stop);
        hud.attackBtn.addEventListener('pointercancel', stop);
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    canvas.addEventListener('touchstart', touchStart, { passive: false });
    canvas.addEventListener('touchmove', touchMove, { passive: false });
    canvas.addEventListener('touchend', touchEnd);
    canvas.addEventListener('touchcancel', touchEnd);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    return {
        // 走位係持續輸入：每個 tick 重新落一個「向呢個方向行」嘅指令。
        // 目標點放遠少少（6 米），噉樣就唔會行到就停、一頓一頓。
        update() {
            const p = sim.player;
            if (!p.alive) return;
            const dir = joy && Math.hypot(joy.dx, joy.dy) > 0.14
                ? { dx: joy.dx, dz: joy.dy }
                : keyDir();
            if (dir) {
                sim.orderMove(p,
                    clamp(p.x + dir.dx * 6, -MAP.fountainX, MAP.fountainX),
                    clamp(p.z + dir.dz * 6, -MAP.halfWidth, MAP.halfWidth));
                return;
            }
            // 冇郁而攻擊掣撳住，或者原本嘅目標死咗，就再鎖一個
            if (attackHeld) {
                const cur = p.orderTarget != null && sim.entities.find(e => e.id === p.orderTarget);
                if (!cur || !cur.alive) attackNearest();
            }
        },
        get aim() { return { x: aimX, z: aimZ }; },
        destroy() {
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
            stick.remove();
            aimLine.remove();
        },
    };
}
