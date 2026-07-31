// 角色動畫狀態機。
//
// 呢個檔比其他遊戲嗰個 rig.js 簡單好多，因為模型本身已經有 76 至 95 個
// 手 K 動畫。之前嗰隻遊戲要程序化砌步態，係因為手上啲模型得一副冇名嘅骨；
// 呢度唔使，所以呢度嘅工作淨係「幾時播邊個 clip、點樣過渡」。
//
// 一次性動作（攻擊／施法／受擊／死亡）用 LoopOnce + clampWhenFinished，
// 播完自動落返 idle／run。走路同企定之間用 crossFade，唔會跳格。

import * as THREE from '../vendor/three.module.min.js';

const FADE = 0.18;

export class Rig {
    // look: { model, scale, weapons, attack, abilityClip }
    constructor(object3D, assets, look) {
        this.root = object3D;
        this.look = look;
        this.mixer = new THREE.AnimationMixer(object3D);
        this.actions = new Map();
        this.current = null;
        this.lockUntil = 0;
        this.time = 0;
        this.#applyWeapons();
    }

    // 模型入面所有武器一開始都係 visible，要淨低揀中嗰件。
    // handslot 下面嘅嘢先算武器；身體部件（Knight_Body 之類）唔可以熄。
    #applyWeapons() {
        const keep = new Set(this.look.weapons ?? []);
        for (const slot of ['handslot_l', 'handslot_r', 'handslotl', 'handslotr']) {
            const node = this.root.getObjectByName(slot);
            if (!node) continue;
            node.traverse((o) => {
                if (o === node) return;
                if (o.isMesh || o.isSkinnedMesh) o.visible = keep.has(o.name);
            });
        }
    }

    #action(assets, name) {
        let a = this.actions.get(name);
        if (!a) {
            a = this.mixer.clipAction(assets.clip(name));
            this.actions.set(name, a);
        }
        return a;
    }

    // 循環動作：走路、企定。已經喺播就唔會重播。
    loop(assets, name, timeScale = 1) {
        if (this.time < this.lockUntil) return;
        if (this.current === name) {
            const a = this.actions.get(name);
            if (a) a.timeScale = timeScale;
            return;
        }
        const next = this.#action(assets, name);
        next.reset();
        next.setLoop(THREE.LoopRepeat, Infinity);
        next.clampWhenFinished = false;
        next.timeScale = timeScale;
        next.enabled = true;
        next.setEffectiveWeight(1);
        if (this.current) {
            const prev = this.actions.get(this.current);
            next.crossFadeFrom(prev, FADE, false);
        }
        next.play();
        this.current = name;
    }

    // 一次性動作：播完自動放返控制權。duration 用嚟夾遊戲節奏
    // （例如攻擊間隔 0.8 秒就要喺 0.8 秒內播完成個揮劍）。
    once(assets, name, duration = null, { hold = false } = {}) {
        const a = this.#action(assets, name);
        const clipLen = a.getClip().duration;
        const scale = duration ? clipLen / Math.max(0.08, duration) : 1;
        a.reset();
        a.setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = hold;
        a.timeScale = scale;
        a.enabled = true;
        a.setEffectiveWeight(1);
        if (this.current && this.current !== name) {
            const prev = this.actions.get(this.current);
            if (prev) a.crossFadeFrom(prev, Math.min(FADE, clipLen / scale * 0.3), false);
        }
        a.play();
        this.current = name;
        this.lockUntil = this.time + (hold ? 1e9 : clipLen / scale * 0.92);
    }

    // 死亡：擺定最後一格，唔會彈返 idle
    die(assets, bones = false) {
        this.once(assets, bones ? 'Death_C_Skeletons' : 'Death_A', null, { hold: true });
    }

    revive() { this.lockUntil = 0; this.current = null; this.actions.clear(); this.mixer.stopAllAction(); }

    get busy() { return this.time < this.lockUntil; }

    update(dt) {
        this.time += dt;
        this.mixer.update(dt);
    }

    dispose() {
        this.mixer.stopAllAction();
        this.mixer.uncacheRoot(this.root);
    }
}
