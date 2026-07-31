// 操作。桌面同手機唔係同一套操作硬塞埋一齊，而係兩套各自做到啱嘅嘢：
//
//   桌面：撳地面 = 行過去，撳敵人 = 攻擊佢，QWER = 技能（用滑鼠位置瞄準）。
//   手機：左邊虛擬搖桿控制走位，右邊四粒技能掣可以撳完拖出去瞄準再放手。
//
// 手機嗰套嘅重點係「拖住瞄準」：MOBA 嘅技能要指方向，但手機冇滑鼠位置，
// 所以要由掣本身拖出一條線出去——放手嗰刻先施法。

import * as THREE from '../vendor/three.module.min.js';
import { MAP } from './constants.js';

const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export function createInput(canvas, view, sim, hud) {
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    let aimX = 0, aimZ = 0;                 // 世界座標嘅瞄準點
    let joy = null;                          // { id, cx, cy, dx, dy }
    let aiming = null;                       // { index, id, dx, dy }
    const touch = matchMedia('(pointer: coarse)').matches;

    function toWorld(clientX, clientY) {
        const r = canvas.getBoundingClientRect();
        ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
        ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(ndc, view.camera);
        return ray.ray.intersectPlane(GROUND, hit) ? hit : null;
    }

    // 撳落去嗰點有冇敵方單位／建築（有就當攻擊指令）
    function enemyAt(x, z) {
        let best = null, bd = 3.2;
        for (const e of sim.entities) {
            if (!e.alive || e.team === sim.player.team) continue;
            const r = e.kind === 'champ' ? 1.8 : e.kind === 'minion' ? 1.2 : 4;
            const d = Math.hypot(e.x - x, e.z - z);
            if (d < r && d < bd) { bd = d; best = e; }
        }
        return best;
    }

    function issueOrder(x, z) {
        const p = sim.player;
        if (!p.alive) return;
        const foe = enemyAt(x, z);
        if (foe) sim.orderAttack(p, foe.id);
        else sim.orderMove(p, THREE.MathUtils.clamp(x, -MAP.fountainX, MAP.fountainX),
            THREE.MathUtils.clamp(z, -MAP.halfWidth, MAP.halfWidth));
    }

    function cast(index, ax, az) {
        const p = sim.player;
        if (!p.alive || !sim.castable(p, index)) return false;
        const ab = p.def.abilities[index];
        if (ab.allyTarget) {
            // 隊友技能：揀最近而血最少嗰個（包括自己）
            const mate = sim.champions
                .filter(c => c.alive && c.team === p.team && Math.hypot(c.x - p.x, c.z - p.z) <= ab.range)
                .sort((a, b) => a.hp / sim.stats(a).maxHp - b.hp / sim.stats(b).maxHp)[0];
            return mate ? sim.cast(p, index, { targetId: mate.id }) : false;
        }
        if (ab.form === 'target') {
            const foe = enemyAt(ax, az) ?? nearestFoe(ab.range);
            return foe ? sim.cast(p, index, { targetId: foe.id }) : false;
        }
        return sim.cast(p, index, { x: ax, z: az });
    }

    function nearestFoe(range) {
        const p = sim.player;
        let best = null, bd = range + 2;
        for (const e of sim.entities) {
            if (!e.alive || e.team === p.team || (e.kind !== 'champ' && e.kind !== 'minion')) continue;
            const d = Math.hypot(e.x - p.x, e.z - p.z);
            if (d < bd) { bd = d; best = e; }
        }
        return best;
    }

    // ---------- 桌面 ----------
    function onPointerMove(ev) {
        const w = toWorld(ev.clientX, ev.clientY);
        if (w) { aimX = w.x; aimZ = w.z; }
    }
    function onPointerDown(ev) {
        if (ev.target !== canvas) return;
        const w = toWorld(ev.clientX, ev.clientY);
        if (!w) return;
        aimX = w.x; aimZ = w.z;
        issueOrder(w.x, w.z);
    }
    function onKey(ev) {
        const i = ['q', 'w', 'e', 'r'].indexOf(ev.key.toLowerCase());
        if (i >= 0) { cast(i, aimX, aimZ); ev.preventDefault(); return; }
        if (ev.key.toLowerCase() === 'b') { hud.toggleShop(); ev.preventDefault(); return; }
        if (ev.key.toLowerCase() === 's') { sim.orderStop(sim.player); ev.preventDefault(); }
    }

    // ---------- 手機 ----------
    const stick = document.createElement('div');
    stick.className = 'moba-stick' + (touch ? '' : ' hidden');
    const knob = document.createElement('div');
    knob.className = 'moba-knob';
    stick.append(knob);
    canvas.parentElement.append(stick);

    function stickStart(ev) {
        const t = ev.changedTouches[0];
        joy = { id: t.identifier, cx: t.clientX, cy: t.clientY, dx: 0, dy: 0 };
        stick.classList.add('active');
        stick.style.left = `${t.clientX}px`;
        stick.style.top = `${t.clientY}px`;
        ev.preventDefault();
    }
    function stickMove(ev) {
        if (!joy) return;
        for (const t of ev.changedTouches) {
            if (t.identifier !== joy.id) continue;
            const dx = t.clientX - joy.cx, dy = t.clientY - joy.cy;
            const len = Math.hypot(dx, dy) || 1;
            const k = Math.min(1, len / 54);
            joy.dx = dx / len * k; joy.dy = dy / len * k;
            knob.style.transform = `translate(${joy.dx * 44}px, ${joy.dy * 44}px)`;
        }
    }
    function stickEnd(ev) {
        if (!joy) return;
        for (const t of ev.changedTouches) {
            if (t.identifier !== joy.id) continue;
            joy = null;
            knob.style.transform = '';
            stick.classList.remove('active');
        }
    }

    // 技能掣：撳住可以拖出去瞄準，放手先施法
    const aimLine = document.createElement('div');
    aimLine.className = 'moba-aim hidden';
    canvas.parentElement.append(aimLine);

    function bindSkillButtons() {
        hud.skillBtns.forEach(({ btn }, index) => {
            btn.addEventListener('pointerdown', (ev) => {
                ev.preventDefault();
                btn.setPointerCapture?.(ev.pointerId);
                aiming = { index, id: ev.pointerId, dx: 0, dy: 0 };
                aimLine.classList.remove('hidden');
            });
            btn.addEventListener('pointermove', (ev) => {
                if (!aiming || aiming.id !== ev.pointerId) return;
                const r = btn.getBoundingClientRect();
                aiming.dx = ev.clientX - (r.left + r.width / 2);
                aiming.dy = ev.clientY - (r.top + r.height / 2);
                const len = Math.hypot(aiming.dx, aiming.dy);
                const ang = Math.atan2(aiming.dy, aiming.dx);
                aimLine.style.left = `${r.left + r.width / 2}px`;
                aimLine.style.top = `${r.top + r.height / 2}px`;
                aimLine.style.width = `${Math.min(len, 140)}px`;
                aimLine.style.transform = `rotate(${ang}rad)`;
            });
            const finish = (ev) => {
                if (!aiming || aiming.id !== ev.pointerId) return;
                const { index: i, dx, dy } = aiming;
                aiming = null;
                aimLine.classList.add('hidden');
                const p = sim.player;
                const len = Math.hypot(dx, dy);
                if (len > 14) {
                    // 螢幕方向轉世界方向：鏡頭永遠由 +z 望向 -z，
                    // 所以螢幕右 = 世界 +x、螢幕上 = 世界 -z。
                    const ab = p.def.abilities[i] ?? {};
                    const reach = ab.range ?? 9;
                    const k = reach / len;
                    cast(i, p.x + dx * k, p.z + dy * k);
                } else {
                    const foe = nearestFoe(p.def.abilities[i]?.range ?? 9);
                    cast(i, foe ? foe.x : p.x + (p.team === 0 ? 6 : -6), foe ? foe.z : p.z);
                }
            };
            btn.addEventListener('pointerup', finish);
            btn.addEventListener('pointercancel', () => { aiming = null; aimLine.classList.add('hidden'); });
        });
    }
    bindSkillButtons();

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    canvas.addEventListener('touchstart', stickStart, { passive: false });
    canvas.addEventListener('touchmove', stickMove, { passive: false });
    canvas.addEventListener('touchend', stickEnd);
    canvas.addEventListener('touchcancel', stickEnd);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    return {
        // 搖桿係持續輸入：每幀重新落一個「向前面嗰點行」嘅指令
        update() {
            if (!joy || !sim.player.alive) return;
            const len = Math.hypot(joy.dx, joy.dy);
            if (len < 0.12) return;
            const p = sim.player;
            sim.orderMove(p,
                THREE.MathUtils.clamp(p.x + joy.dx * 12, -MAP.fountainX, MAP.fountainX),
                THREE.MathUtils.clamp(p.z + joy.dy * 12, -MAP.halfWidth, MAP.halfWidth));
        },
        get aim() { return { x: aimX, z: aimZ }; },
        destroy() {
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('keydown', onKey);
            stick.remove();
            aimLine.remove();
        },
    };
}
