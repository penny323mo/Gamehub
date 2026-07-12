// LV2 RTS 控制層：框選／點選、tap 下令、選取面板（訓練/建造）、資源 HUD、建造擺位。
// 由 main.js 用共用嘅 scene/camera/renderer 建立，喺 RTS 模式期間接管單指輸入。
import * as THREE from 'three';
import { TEAM } from '../constants.js';
import { RtsGame, RTS_UNITS, RTS_BUILDINGS, TC_UPGRADE, RTS_MAX_AGE } from './rts.js';
import { RtsAI } from './rts-ai.js';

const $ = (id) => document.getElementById(id);

export function createRtsMode(deps) {
    const { scene, camera, renderer, screenToWorld, zoomBy, onExit } = deps;
    const canvas = renderer.domElement;

    let game = null;
    let ai = null;
    let active = false;
    let selected = [];       // 選中嘅實體（單位 array，或單一建築）
    let placeMode = null;    // { type } 建造擺位模式
    const selRings = [];     // 選取指示環（重用）
    const ringGeo = new THREE.RingGeometry(0.42, 0.56, 20);

    // 建造擺位 ghost
    const buildGhost = new THREE.Mesh(
        new THREE.CircleGeometry(1, 28),
        new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.35, depthTest: false })
    );
    buildGhost.rotation.x = -Math.PI / 2;
    buildGhost.renderOrder = 8;
    buildGhost.visible = false;
    scene.add(buildGhost);

    // 集結點旗標（揀住建築先顯示）
    const rallyFlag = new THREE.Group();
    {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), new THREE.MeshBasicMaterial({ color: 0x8a6a3a }));
        pole.position.y = 0.8;
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.36), new THREE.MeshBasicMaterial({ color: 0x7dff8a, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }));
        flag.position.set(0.3, 1.4, 0);
        rallyFlag.add(pole, flag);
        rallyFlag.visible = false;
        rallyFlag.renderOrder = 12;
        scene.add(rallyFlag);
    }
    function updateRallyFlag() {
        const b = selected.length === 1 && selected[0].kind === 'building' ? selected[0] : null;
        if (b && b.rally) { rallyFlag.position.set(b.rally.x, 0, b.rally.z); rallyFlag.visible = true; }
        else rallyFlag.visible = false;
    }

    let toastT = 0;

    function start(difficulty = 'hard') {
        cleanup();
        game = new RtsGame(scene, {
            onResources: refreshHud,
            onEvent: (msg, team) => { if (team === TEAM.PLAYER) toast(msg); },
            onEnd: (result) => {
                const won = result.winner === TEAM.PLAYER;
                toast(won ? '🏆 勝利！攻陷敵方城鎮中心' : result.winner === null ? '🤝 和局' : '💀 你嘅城鎮中心被摧毀', 4000);
                setTimeout(() => { if (active) exit(); }, 3200);
            },
        });
        ai = new RtsAI(game, difficulty);
        active = true;
        selected = [];
        placeMode = null;
        $('rts-hud').classList.remove('hidden');
        renderActions();
        refreshHud();
        toast('單指框選/點選 · 點地面下令 · 雙指縮放同平移鏡頭', 4000);
    }

    function exit() {
        active = false;
        $('rts-hud').classList.add('hidden');
        cleanup();
        onExit?.();
    }

    function cleanup() {
        game?.dispose(); game = null; ai = null;
        for (const r of selRings) { scene.remove(r); r.geometry !== ringGeo && r.geometry.dispose(); r.material.dispose(); }
        selRings.length = 0;
        buildGhost.visible = false;
        rallyFlag.visible = false;
        selected = [];
    }

    // ---------- 每幀 ----------
    function update(dt) {
        if (!active || !game) return;
        game.update(dt);
        ai?.update(dt);
        game.updateHpBarOrientation(camera.quaternion);
        // 清走死咗嘅選取
        selected = selected.filter(e => !e.dead);
        syncSelRings();
        updateRallyFlag();
        if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('rts-toast').classList.add('hidden'); }
        refreshHud();
    }

    function syncSelRings() {
        const units = selected.filter(e => e.kind === 'unit');
        while (selRings.length < units.length) {
            const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x7dff8a, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthTest: false }));
            r.rotation.x = -Math.PI / 2; r.renderOrder = 11; scene.add(r); selRings.push(r);
        }
        while (selRings.length > units.length) { const r = selRings.pop(); scene.remove(r); r.material.dispose(); }
        units.forEach((u, i) => { selRings[i].position.set(u.x, 0.06, u.z); selRings[i].scale.setScalar((u.radius ?? 0.35) / 0.45 + 0.3); });
        // 建築選取：畫大環
        const b = selected.find(e => e.kind === 'building');
        if (b && !units.length) {
            if (!selRings.length) { const r = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x7dff8a, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthTest: false })); r.rotation.x = -Math.PI / 2; r.renderOrder = 11; scene.add(r); selRings.push(r); }
            selRings[0].position.set(b.x, 0.06, b.z); selRings[0].scale.setScalar((b.radius + 0.6) / 0.45);
        }
    }

    // ---------- 輸入 ----------
    let downX = 0, downY = 0, dragging = false, downTime = 0;
    const DRAG_THRESH = 10;

    function onPointerDown(clientX, clientY) {
        if (!active) return;
        downX = clientX; downY = clientY; dragging = false; downTime = performance.now();
        // 建造擺位模式：郁 ghost
        if (placeMode) { const w = screenToWorld(clientX, clientY); if (w) buildGhost.position.set(w.x, 0.05, w.z); }
    }

    function onPointerMove(clientX, clientY) {
        if (!active) return;
        if (placeMode) {
            const w = screenToWorld(clientX, clientY);
            if (w) { buildGhost.position.set(w.x, 0.05, w.z); buildGhost.visible = true; }
            return;
        }
        if (Math.hypot(clientX - downX, clientY - downY) > DRAG_THRESH) {
            dragging = true;
            const box = $('rts-selbox');
            box.style.display = 'block';
            box.style.left = Math.min(downX, clientX) + 'px';
            box.style.top = Math.min(downY, clientY) + 'px';
            box.style.width = Math.abs(clientX - downX) + 'px';
            box.style.height = Math.abs(clientY - downY) + 'px';
        }
    }

    // 第二隻手指落嚟（縮放/平移）→ 取消緊做嘅框選/tap
    function cancelGesture() {
        dragging = false;
        $('rts-selbox').style.display = 'none';
    }

    function onPointerUp(clientX, clientY) {
        if (!active) return;
        $('rts-selbox').style.display = 'none';

        // 建造擺位：落地起建築
        if (placeMode) {
            const w = screenToWorld(clientX, clientY);
            const vills = selected.filter(e => e.unitType === 'villager');
            if (w && vills.length) game.startBuild(vills, placeMode.type, w.x, w.z, TEAM.PLAYER);
            placeMode = null; buildGhost.visible = false; renderActions();
            return;
        }

        if (dragging) {
            // 框選：projection 落屏幕空間，揀入框嘅玩家單位
            const x1 = Math.min(downX, clientX), x2 = Math.max(downX, clientX);
            const y1 = Math.min(downY, clientY), y2 = Math.max(downY, clientY);
            const picked = [];
            for (const u of game.playerUnits) {
                const s = project(u.x, 1.0, u.z);
                if (s && s.x >= x1 && s.x <= x2 && s.y >= y1 && s.y <= y2) picked.push(u);
            }
            if (picked.length) { selected = picked; renderActions(); }
            return;
        }

        // 單擊（tap）
        const w = screenToWorld(clientX, clientY);
        if (!w) return;
        const hit = game.entityAt(w.x, w.z);
        const units = selected.filter(e => e.kind === 'unit');
        const selBuilding = selected.find(e => e.kind === 'building');

        // A) 撳中自己嘅嘢：一律優先當「選取」，方便隨時轉揀單位（唔會誤變移動指令）；
        //    例外：揀住村民撳自己未完成建築 = 去幫手起
        if (hit && hit.team === TEAM.PLAYER) {
            const vills = units.filter(u => u.unitType === 'villager');
            if (hit.kind === 'building' && !hit.complete && vills.length) {
                game.commandBuild(vills, hit); pingCommand(w.x, w.z, 'build'); return;
            }
            selected = [hit]; renderActions(); return;
        }

        // B) 有選中單位 → 落指令（攻擊敵人／採集資源／移動；純移動會脫離戰鬥可以撤退）
        if (units.length) {
            const kind = game.commandSmart(units, w.x, w.z, TEAM.PLAYER);
            pingCommand(w.x, w.z, kind);
            return;
        }

        // C) 選咗建築 → tap 地面 = 設集結點
        if (selBuilding && !selBuilding.dead) {
            selBuilding.rally = { x: w.x, z: w.z };
            updateRallyFlag();
            pingCommand(w.x, w.z, 'move');
            return;
        }

        // D) 咩都冇揀又撳空地 → 清選取
        selected = []; renderActions();
    }

    function project(x, y, z) {
        const v = new THREE.Vector3(x, y, z).project(camera);
        if (v.z > 1) return null;
        const rect = canvas.getBoundingClientRect();
        return { x: rect.left + (v.x * 0.5 + 0.5) * rect.width, y: rect.top + (-v.y * 0.5 + 0.5) * rect.height };
    }

    // 指令回饋圈
    const pingGeo = new THREE.RingGeometry(0.2, 0.34, 20);
    function pingCommand(x, z, kind) {
        const color = kind === 'attack' ? 0xff5a4a : kind === 'gather' ? 0xffd24a : 0x6affa0;
        const m = new THREE.Mesh(pingGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthTest: false }));
        m.rotation.x = -Math.PI / 2; m.position.set(x, 0.07, z); m.renderOrder = 12; scene.add(m);
        const t0 = performance.now();
        const anim = () => {
            const p = (performance.now() - t0) / 400;
            if (p >= 1 || !active) { scene.remove(m); m.material.dispose(); return; }
            m.scale.setScalar(1 + p * 2.5); m.material.opacity = 0.9 * (1 - p);
            requestAnimationFrame(anim);
        };
        anim();
    }

    // ---------- HUD ----------
    function refreshHud() {
        if (!game) return;
        const r = game.res[TEAM.PLAYER];
        $('rts-food').textContent = Math.floor(r.food);
        $('rts-gold').textContent = Math.floor(r.gold);
        $('rts-pop').textContent = game.population(TEAM.PLAYER);
        $('rts-pop-cap').textContent = game.popCap[TEAM.PLAYER];
    }

    function renderActions() {
        const info = $('rts-sel-info');
        const acts = $('rts-actions');
        acts.innerHTML = '';
        updateRallyFlag();
        if (!selected.length) { info.textContent = '揀你嘅單位或建築落指令'; return; }

        const building = selected.find(e => e.kind === 'building');
        const units = selected.filter(e => e.kind === 'unit');

        if (building && !units.length) {
            const def = building.def;
            if (!building.complete) { info.textContent = `${def.icon} ${def.name}（建造中 ${Math.round(building.buildProgress * 100)}%）`; return; }
            const age = game.teamAge(TEAM.PLAYER);
            // 城鎮中心：升級主城
            if (building.buildingType === 'towncenter') {
                if (building.upgrading) {
                    const pct = Math.round((1 - building.upgrading.timer / building.upgrading.total) * 100);
                    info.textContent = `${def.icon} ${def.name}（第 ${building.age} 代 · 升級中 ${pct}%）`;
                } else {
                    info.textContent = `${def.icon} ${def.name}（第 ${building.age} 代）${building.trainQueue.length ? `　生產中×${building.trainQueue.length}` : ''}`;
                }
                acts.appendChild(trainBtn('villager', building));
                if (!building.upgrading && building.age < RTS_MAX_AGE) {
                    const up = TC_UPGRADE[building.age + 1];
                    acts.appendChild(actionBtn(`⬆️ 升級到第 ${building.age + 1} 代`, costStr(up.cost), () => { game.queueUpgrade(building); renderActions(); }));
                }
                return;
            }
            // 兵營：全兵種，按時代 gate（未夠代顯示鎖）
            info.textContent = `${def.icon} ${def.name}（第 ${age} 代）${building.trainQueue.length ? `　生產中×${building.trainQueue.length}` : ''}`;
            for (const t of def.trains) acts.appendChild(trainBtn(t, building, age));
            return;
        }

        const vills = units.filter(u => u.unitType === 'villager');
        const summary = summarize(units);
        info.textContent = `已選 ${units.length} 個單位：${summary}`;
        if (vills.length) {
            acts.appendChild(actionBtn('🏰 建兵營', costStr(RTS_BUILDINGS.barracks.cost), () => enterPlace('barracks')));
            acts.appendChild(actionBtn('🏠 建房屋', costStr(RTS_BUILDINGS.house.cost), () => enterPlace('house')));
        }
        acts.appendChild(actionBtn('🛑 停止', '', () => { game.commandMove(units, units[0].x, units[0].z); for (const u of units) u.command = { type: 'idle' }; }));
    }

    function enterPlace(type) {
        placeMode = { type };
        buildGhost.scale.setScalar(RTS_BUILDINGS[type].radius);
        buildGhost.visible = true;
        toast(`揀位置起 ${RTS_BUILDINGS[type].name}`);
    }

    function actionBtn(label, cost, onClick) {
        const b = document.createElement('button');
        b.className = 'rts-act-btn';
        b.innerHTML = `<span>${label}</span>${cost ? `<small>${cost}</small>` : ''}`;
        b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
        return b;
    }
    // 訓練掣：未到時代就鎖住顯示「🔒N代」
    function trainBtn(type, building, age = 99) {
        const u = RTS_UNITS[type];
        const locked = (u.age ?? 1) > age;
        if (locked) {
            const b = document.createElement('button');
            b.className = 'rts-act-btn locked';
            b.innerHTML = `<span>${u.icon} ${u.name}</span><small>🔒 ${u.age} 代</small>`;
            b.addEventListener('click', (e) => { e.stopPropagation(); toast(`${u.name} 要升級主城到第 ${u.age} 代`); });
            return b;
        }
        return actionBtn(`${u.icon} ${u.name}`, costStr(u.cost), () => { game.queueTrain(building, type); renderActions(); });
    }
    function costStr(cost) {
        if (!cost) return '';
        const parts = [];
        if (cost.food) parts.push(`🍖${cost.food}`);
        if (cost.gold) parts.push(`🪙${cost.gold}`);
        return parts.join(' ');
    }
    function summarize(units) {
        const c = {};
        for (const u of units) c[u.unitType] = (c[u.unitType] ?? 0) + 1;
        return Object.entries(c).map(([t, n]) => `${RTS_UNITS[t].icon}${n}`).join(' ');
    }

    function toast(msg, ms = 1800) {
        const t = $('rts-toast');
        t.textContent = msg; t.classList.remove('hidden'); toastT = ms / 1000;
    }

    // HUD 按鈕
    $('rts-quit').addEventListener('click', exit);
    $('rts-zoom-in').addEventListener('click', () => zoomBy(1.2));
    $('rts-zoom-out').addEventListener('click', () => zoomBy(1 / 1.2));

    return {
        start, exit, update, cancelGesture,
        onPointerDown, onPointerMove, onPointerUp,
        get active() { return active; },
        get game() { return game; },
        get ai() { return ai; },
        project, // 畀自動化測試計單位屏幕座標
    };
}
