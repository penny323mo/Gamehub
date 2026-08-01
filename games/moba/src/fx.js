// 特效層。
//
// 之前所有技能——直線彈、範圍炸、位移、加持——全部畫同一個擴散圓環，
// 所以撳完技能之後畫面上冇任何嘢話畀你聽發生咗咩事。呢個檔按「技能形態」
// 出唔同嘅視覺，再加傷害數字，令每一下都有交代。
//
// 傷害數字用 canvas 貼圖，同一個數字只畫一次就快取住——一場波幾千個數字，
// 逐個開新 canvas 會即刻卡死。

import * as THREE from '../vendor/three.module.min.js';

const TEXT_CACHE = new Map();
const FONT = '700 64px "Noto Sans HK", system-ui, sans-serif';

function textTexture(text, colour) {
    const key = `${text}|${colour}`;
    let t = TEXT_CACHE.get(key);
    if (t) return t;
    const pad = 14;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = FONT;
    const w = Math.ceil(probe.measureText(text).width) + pad * 2;
    const h = 92;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.font = FONT;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 9;
    g.strokeStyle = 'rgba(6,8,14,0.92)';
    g.strokeText(text, w / 2, h / 2);
    g.fillStyle = colour;
    g.fillText(text, w / 2, h / 2);
    t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.userData = { aspect: w / h };
    TEXT_CACHE.set(key, t);
    return t;
}

export class Fx {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.items = [];        // { obj, t, life, kind, ... }
        this.pool = [];         // 用完嘅傷害數字 sprite 留返轉頭用
    }

    #add(obj, life, step) {
        this.scene.add(obj);
        this.items.push({ obj, t: 0, life, step });
        return obj;
    }

    // ---------- 傷害／治療數字 ----------
    number(x, z, amount, kind = 'damage') {
        const text = kind === 'heal' ? `+${Math.round(amount)}` : String(Math.round(amount));
        const colour = kind === 'heal' ? '#7ef0a8'
            : kind === 'crit' ? '#ffd24a'
            : kind === 'mine' ? '#fff3d0' : '#ff9d8d';
        const tex = textTexture(text, colour);
        const sp = this.pool.pop() ?? new THREE.Sprite(
            new THREE.SpriteMaterial({ transparent: true, depthTest: false }));
        sp.material.map = tex;
        sp.material.opacity = 1;
        sp.material.needsUpdate = true;
        const scale = kind === 'mine' || kind === 'crit' ? 1.5 : 1.1;
        sp.scale.set(scale * tex.userData.aspect, scale, 1);
        sp.position.set(x + (Math.random() - 0.5) * 1.2, 2.4, z + (Math.random() - 0.5) * 0.8);
        sp.renderOrder = 950;
        sp.visible = true;
        const driftX = (Math.random() - 0.5) * 1.6;
        this.#add(sp, 0.95, (it, k) => {
            it.obj.position.y = 2.4 + k * 2.6;
            it.obj.position.x += driftX * 0.016;
            it.obj.material.opacity = k < 0.55 ? 1 : 1 - (k - 0.55) / 0.45;
        });
    }

    // ---------- 地面環（範圍技、爆炸、塔冧）----------
    ring(x, z, radius, colour, { life = 0.5, from = 0.25, to = 1.15, y = 0.25 } = {}) {
        const m = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.86, radius, 40),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.95,
                side: THREE.DoubleSide, depthWrite: false }));
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, y, z);
        m.scale.setScalar(from);
        this.#add(m, life, (it, k) => {
            it.obj.scale.setScalar(from + (to - from) * k);
            it.obj.material.opacity = 0.95 * (1 - k);
        });
        return m;
    }

    // 實心閃光：爆炸嘅第一格
    flash(x, z, radius, colour, life = 0.28) {
        const m = new THREE.Mesh(
            new THREE.CircleGeometry(radius, 36),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.55,
                depthWrite: false }));
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.18, z);
        this.#add(m, life, (it, k) => { it.obj.material.opacity = 0.55 * (1 - k); });
    }

    // ---------- 預警圈（有延遲嘅技能）----------
    // 一個由細變大填滿嘅圈，填滿嗰刻就係打中嗰刻——玩家有得閃。
    telegraph(x, z, radius, delay, colour = 0xff6a4a) {
        const outline = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.95, radius, 40),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.9,
                side: THREE.DoubleSide, depthWrite: false }));
        outline.rotation.x = -Math.PI / 2;
        outline.position.set(x, 0.16, z);
        this.#add(outline, delay, () => {});
        const fill = new THREE.Mesh(
            new THREE.CircleGeometry(radius, 36),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.3,
                depthWrite: false }));
        fill.rotation.x = -Math.PI / 2;
        fill.position.set(x, 0.14, z);
        fill.scale.setScalar(0.05);
        this.#add(fill, delay, (it, k) => { it.obj.scale.setScalar(0.05 + 0.95 * k); });
    }

    // ---------- 持續地帶（火地、治療圈、陷阱）----------
    zone(x, z, radius, colour, duration, follow = null) {
        const g = new THREE.Group();
        const disc = new THREE.Mesh(
            new THREE.CircleGeometry(radius, 40),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.22,
                depthWrite: false }));
        disc.rotation.x = -Math.PI / 2;
        const edge = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.93, radius, 40),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.85,
                side: THREE.DoubleSide, depthWrite: false }));
        edge.rotation.x = -Math.PI / 2;
        edge.position.y = 0.02;
        g.add(disc, edge);
        g.position.set(x, 0.12, z);
        this.#add(g, duration, (it, k) => {
            const pulse = 0.85 + Math.sin(it.t * 9) * 0.15;
            edge.material.opacity = 0.85 * pulse * (1 - k * 0.6);
            disc.material.opacity = 0.22 * (1 - k * 0.5);
            if (follow) { g.position.x = follow.x; g.position.z = follow.z; }
        });
        return g;
    }

    // ---------- 自身加持：腳下轉緊嘅光環 ----------
    aura(host, colour, duration) {
        const g = new THREE.Group();
        for (let i = 0; i < 2; i++) {
            const r = 1.7 + i * 0.5;
            const m = new THREE.Mesh(
                new THREE.RingGeometry(r * 0.9, r, 6),
                new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.8,
                    side: THREE.DoubleSide, depthWrite: false }));
            m.rotation.x = -Math.PI / 2;
            m.position.y = 0.1 + i * 0.55;
            g.add(m);
        }
        this.#add(g, duration, (it, k) => {
            g.position.set(host.x, 0, host.z);
            g.children[0].rotation.z += 0.05;
            g.children[1].rotation.z -= 0.035;
            for (const c of g.children) c.material.opacity = 0.8 * (1 - k * 0.8);
        });
    }

    // ---------- 位移殘影 ----------
    streak(x0, z0, x1, z1, colour = 0xbfd4ff) {
        const len = Math.hypot(x1 - x0, z1 - z0) || 0.1;
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(len, 1.5),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.5,
                side: THREE.DoubleSide, depthWrite: false }));
        m.rotation.x = -Math.PI / 2;
        m.rotation.z = -Math.atan2(z1 - z0, x1 - x0);
        m.position.set((x0 + x1) / 2, 0.3, (z0 + z1) / 2);
        this.#add(m, 0.32, (it, k) => { it.obj.material.opacity = 0.5 * (1 - k); });
    }

    // ---------- 治療上升粒 ----------
    heal(x, z) {
        for (let i = 0; i < 5; i++) {
            const m = new THREE.Mesh(
                new THREE.SphereGeometry(0.14, 6, 5),
                new THREE.MeshBasicMaterial({ color: 0x7ef0a8, transparent: true, opacity: 0.95 }));
            const ox = (Math.random() - 0.5) * 1.6, oz = (Math.random() - 0.5) * 1.6;
            m.position.set(x + ox, 0.3 + Math.random() * 0.5, z + oz);
            this.#add(m, 0.7, (it, k) => {
                it.obj.position.y += 0.045;
                it.obj.material.opacity = 0.95 * (1 - k);
            });
        }
    }

    update(dt) {
        for (const it of this.items) {
            it.t += dt;
            it.step(it, Math.min(1, it.t / it.life));
        }
        this.items = this.items.filter((it) => {
            if (it.t < it.life) return true;
            this.scene.remove(it.obj);
            if (it.obj.isSprite) { it.obj.visible = false; this.pool.push(it.obj); return false; }
            it.obj.traverse?.((o) => { o.geometry?.dispose(); o.material?.dispose(); });
            it.obj.geometry?.dispose?.();
            it.obj.material?.dispose?.();
            return false;
        });
    }
}
