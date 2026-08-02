// 特效層。
//
// 之前所有技能——直線彈、範圍炸、位移、加持——全部畫同一個擴散圓環，
// 所以撳完技能之後畫面上冇任何嘢話畀你聽發生咗咩事。呢個檔按「技能形態」
// 出唔同嘅視覺，再加傷害數字，令每一下都有交代。
//
// 傷害數字用 canvas 貼圖，同一個數字只畫一次就快取住——一場波幾千個數字，
// 逐個開新 canvas 會即刻卡死。

import * as THREE from '../vendor/three.module.min.js';

// 快取有上限，而且要 dispose 走被淘汰嘅。實測一場波之後 GPU 貼圖數由 59
// 升到 326——每一個唔同嘅傷害數字都整咗一張新 canvas 貼圖，永遠唔放。
const TEXT_CACHE = new Map();
const TEXT_CACHE_MAX = 96;
const FONT = '700 64px "Noto Sans HK", system-ui, sans-serif';

// 大數字降精度：4 位數嘅傷害逐個整一張貼圖，快取一定爆。
// 玩家睇「1.2k」同睇「1237」嘅資訊量係一樣。
function damageLabel(n) {
    const v = Math.round(n);
    if (v < 1000) return String(v);
    return `${(v / 1000).toFixed(1)}k`;
}

function textTexture(text, colour) {
    const key = `${text}|${colour}`;
    let t = TEXT_CACHE.get(key);
    if (t) {
        // 用過就當最新：Map 保留插入次序，刪咗再插就等於移到最尾
        TEXT_CACHE.delete(key);
        TEXT_CACHE.set(key, t);
        return t;
    }
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
    while (TEXT_CACHE.size > TEXT_CACHE_MAX) {
        const oldest = TEXT_CACHE.keys().next().value;
        TEXT_CACHE.get(oldest).dispose();
        TEXT_CACHE.delete(oldest);
    }
    return t;
}

export class Fx {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.items = [];        // { obj, t, life, kind, ... }
        this.pool = [];         // 用完嘅傷害數字 sprite 留返轉頭用
    }

    #add(obj, life, step, meta = {}) {
        obj.userData.fx = { kind: meta.kind ?? 'generic', style: meta.style ?? null,
            family: meta.family ?? null };
        this.scene.add(obj);
        this.items.push({ obj, t: 0, life, step, ...meta });
        return obj;
    }

    // ---------- 傷害／治療數字 ----------
    number(x, z, amount, kind = 'damage') {
        const text = kind === 'heal' ? `+${damageLabel(amount)}` : damageLabel(amount);
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
    telegraph(x, z, radius, delay, colour = 0xff6a4a, profile = null) {
        const sides = Math.max(3, profile?.sides ?? 40);
        const outline = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.95, radius, sides),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.9,
                side: THREE.DoubleSide, depthWrite: false }));
        outline.rotation.x = -Math.PI / 2;
        outline.position.set(x, 0.16, z);
        this.#add(outline, delay, () => {}, { kind: 'telegraph-outline',
            style: profile?.style, family: profile?.family });
        const fill = new THREE.Mesh(
            new THREE.CircleGeometry(radius, sides),
            new THREE.MeshBasicMaterial({ color: profile?.accent ?? colour, transparent: true, opacity: 0.3,
                depthWrite: false }));
        fill.rotation.x = -Math.PI / 2;
        fill.position.set(x, 0.14, z);
        fill.scale.setScalar(0.05);
        this.#add(fill, delay, (it, k) => { it.obj.scale.setScalar(0.05 + 0.95 * k); },
            { kind: 'telegraph-fill', style: profile?.style, family: profile?.family });
        if (profile) this.cue(x, z, profile, { life: delay, radius, kind: 'telegraph' });
    }

    // ---------- 持續地帶（火地、治療圈、陷阱）----------
    zone(x, z, radius, colour, duration, follow = null, profile = null) {
        const sides = Math.max(3, profile?.sides ?? 40);
        const g = new THREE.Group();
        const disc = new THREE.Mesh(
            new THREE.CircleGeometry(radius, sides),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.22,
                depthWrite: false }));
        disc.rotation.x = -Math.PI / 2;
        const edge = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.93, radius, sides),
            new THREE.MeshBasicMaterial({ color: profile?.accent ?? colour, transparent: true, opacity: 0.85,
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
        }, { kind: 'zone-bed', style: profile?.style, family: profile?.family });
        if (profile) this.cue(x, z, profile, { life: duration, radius, follow, kind: 'zone-sigil' });
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

    // ---------- 揮擊軌跡 ----------
    // 由攻擊者掃向目標嘅一道弧。呢個唔係裝飾：喺俯視鏡頭下面，
    // 一個角色揮劍嘅骨骼動作淨係佔幾十個像素，玩家實際上係「見唔到」佢出手。
    // 弧線係大部分動作遊戲用嚟交代「呢一下打出去咗」嘅辦法。
    slash(x0, z0, x1, z1, colour = 0xffe9c4, profile = {}) {
        const ang = Math.atan2(z1 - z0, x1 - x0);
        const g = new THREE.Group();
        const weight = profile.weight ?? 1;
        const blades = profile.blades ?? 1;
        const arcs = [];
        for (let i = 0; i < blades; i++) {
            const arc = new THREE.Mesh(
                new THREE.RingGeometry(1.35, 1.35 + 0.78 * weight, 20, 1,
                    -0.9 + i * 0.24, 1.8 - i * 0.18),
                new THREE.MeshBasicMaterial({ color: i ? (profile.accent ?? colour) : colour,
                    transparent: true, opacity: i ? 0.7 : 0.94,
                    side: THREE.DoubleSide, depthWrite: false }));
            arc.rotation.x = -Math.PI / 2;
            arc.position.y = i * 0.12;
            arc.userData.baseOpacity = arc.material.opacity;
            arcs.push(arc); g.add(arc);
        }
        g.position.set(x0, 1.15, z0);
        g.rotation.y = -ang;
        this.#add(g, 0.22, (it, k) => {
            // 由後掃到前，同時淡出：一道掃過去嘅光，唔係一個固定嘅扇形
            g.rotation.y = -ang + (0.5 - k) * 0.9;
            arcs.forEach((arc, i) => {
                arc.scale.setScalar(0.82 + k * (0.42 + weight * 0.12) + i * 0.05);
                arc.material.opacity = arc.userData.baseOpacity * (1 - k * k);
            });
        }, { kind: 'basic-windup', style: profile.style, family: profile.family });
    }

    // 遠程／法術出手：喺手嗰邊向住目標閃一下
    muzzle(x0, z0, x1, z1, colour = 0xffe9c4, profile = {}) {
        const d = Math.hypot(x1 - x0, z1 - z0) || 1;
        const nx = (x1 - x0) / d, nz = (z1 - z0) / d;
        const family = profile.family ?? 'bolt';
        const sides = family === 'arrow' ? 4 : family === 'holy' ? 8 : 12;
        const g = new THREE.Group();
        const core = new THREE.Mesh(
            new THREE.CircleGeometry(family === 'fire' ? 0.86 : 0.72, sides),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.98,
                depthWrite: false }));
        const halo = new THREE.Mesh(
            new THREE.RingGeometry(family === 'holy' ? 0.65 : 0.5, family === 'holy' ? 0.92 : 0.8, sides),
            new THREE.MeshBasicMaterial({ color: profile.accent ?? colour, transparent: true,
                opacity: family === 'fire' ? 0.55 : 0.8, side: THREE.DoubleSide, depthWrite: false }));
        core.userData.baseOpacity = core.material.opacity;
        halo.userData.baseOpacity = halo.material.opacity;
        g.add(core, halo);
        g.position.set(x0 + nx * 1.0, 1.4, z0 + nz * 1.0);
        this.#add(g, 0.18, (it, k) => {
            g.quaternion.copy(this.camera.quaternion);
            g.rotation.z += family === 'fire' ? 0.18 : family === 'holy' ? -0.08 : 0;
            core.scale.setScalar(0.55 + k * (family === 'fire' ? 1.4 : 1.0));
            halo.scale.setScalar(0.8 + k * 1.25);
            core.material.opacity = core.userData.baseOpacity * (1 - k);
            halo.material.opacity = halo.userData.baseOpacity * (1 - k);
        }, { kind: 'basic-windup', style: profile.style, family });
    }

    // ---------- 英雄專屬施法徽記 ----------
    // 唔靠 shader 或貼圖：圈數、角數、射線、穹頂、柱、尖刺同收縮方向組合成
    // 穩定剪影。低畫質一樣會畫得到，亦避免每招另外載一張透明 PNG。
    cue(x, z, profile = {}, {
        life = 0.5, radius = 2.1, follow = null, kind = 'cast', impact = false,
    } = {}) {
        const g = new THREE.Group();
        const sides = Math.max(3, profile.sides ?? 12);
        const rings = Math.max(1, profile.rings ?? 1);
        const rays = Math.max(0, profile.rays ?? 0);
        const colour = profile.colour ?? 0xffd27a;
        const accent = profile.accent ?? colour;
        const mat = (c, opacity, extra = {}) => {
            const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity,
                depthWrite: false, side: THREE.DoubleSide, ...extra });
            m.userData.fxOpacity = opacity;
            return m;
        };

        for (let i = 0; i < rings; i++) {
            const r = radius * (0.42 + i * 0.19);
            const band = new THREE.Mesh(
                new THREE.RingGeometry(r * 0.86, r, sides),
                mat(i % 2 ? accent : colour, 0.82 - i * 0.1));
            band.rotation.x = -Math.PI / 2;
            band.position.y = 0.09 + i * 0.035;
            band.userData.fxPart = 'ring';
            g.add(band);
        }

        for (let i = 0; i < rays; i++) {
            const a = i / rays * Math.PI * 2;
            const ray = new THREE.Mesh(
                new THREE.PlaneGeometry(radius * (impact ? 0.9 : 0.68), 0.09 + (i % 2) * 0.045),
                mat(i % 2 ? accent : colour, 0.68));
            ray.rotation.x = -Math.PI / 2;
            ray.rotation.z = -a;
            ray.position.set(Math.cos(a) * radius * 0.36, 0.13, Math.sin(a) * radius * 0.36);
            ray.userData.fxPart = 'ray';
            g.add(ray);
        }

        if (profile.cross) {
            for (const a of [Math.PI / 4, -Math.PI / 4]) {
                const blade = new THREE.Mesh(
                    new THREE.PlaneGeometry(radius * 1.45, 0.17), mat(accent, 0.86));
                blade.rotation.x = -Math.PI / 2;
                blade.rotation.z = a;
                blade.position.y = 0.18;
                blade.userData.fxPart = 'cross';
                g.add(blade);
            }
        }

        if (profile.dome) {
            // 之前用 wireframe：喺三十米外，一個半球嘅三角網只會睇成一舊白色
            // 亂線，似渲染出錯多過似護罩。實測影相放大先睇得出係咩。
            // 改成「淡外殼 + 底邊一圈亮線」——遠距離靠嗰圈亮線交代個罩嘅範圍，
            // 外殼負責質感。剪影靠邊緣，唔靠密度，係遠鏡頭嘅通用做法。
            const dome = new THREE.Mesh(
                new THREE.SphereGeometry(radius * 0.72, sides, Math.max(4, Math.floor(sides / 2)),
                    0, Math.PI * 2, 0, Math.PI / 2),
                mat(accent, 0.16));
            dome.position.y = 0.1;
            dome.userData.fxPart = 'dome';
            g.add(dome);
            const rim = new THREE.Mesh(
                new THREE.RingGeometry(radius * 0.66, radius * 0.75, sides * 2),
                mat(accent, 0.9));
            rim.rotation.x = -Math.PI / 2;
            rim.position.y = 0.12;
            rim.userData.fxPart = 'dome-rim';
            g.add(rim);
        }

        if (profile.pillar) {
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(radius * 0.12, radius * 0.38, radius * 2.4, sides, 1, true),
                mat(accent, 0.28));
            pillar.position.y = radius * 1.18;
            pillar.userData.fxPart = 'pillar';
            g.add(pillar);
        }

        if (profile.spikes || profile.flames) {
            const count = profile.spikes ? Math.max(5, Math.min(10, sides)) : Math.max(4, Math.min(8, rays));
            for (let i = 0; i < count; i++) {
                const a = i / count * Math.PI * 2;
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(profile.spikes ? 0.16 : 0.22,
                        radius * (profile.spikes ? 0.65 : 0.95), profile.spikes ? 4 : 6),
                    mat(i % 2 ? accent : colour, profile.spikes ? 0.72 : 0.58));
                spike.position.set(Math.cos(a) * radius * 0.63,
                    radius * (profile.spikes ? 0.3 : 0.43), Math.sin(a) * radius * 0.63);
                spike.rotation.z = profile.spikes ? -a * 0.12 : 0;
                spike.userData.fxPart = profile.spikes ? 'spike' : 'flame';
                g.add(spike);
            }
        }

        if (impact) {
            const core = new THREE.Mesh(
                new THREE.CircleGeometry(radius * 0.58, sides), mat(accent, 0.42));
            core.rotation.x = -Math.PI / 2;
            core.position.y = 0.075;
            core.userData.fxPart = 'impact';
            g.add(core);
        }

        g.position.set(x, 0, z);
        const startScale = profile.collapse ? 1.42 : (impact ? 0.28 : 0.52);
        const endScale = profile.collapse ? 0.46 : (impact ? 1.24 : 1.08);
        g.scale.setScalar(startScale);
        this.#add(g, life, (it, k) => {
            if (follow) g.position.set(follow.x, 0, follow.z);
            const pulse = 0.9 + Math.sin(it.t * 10) * 0.1;
            // 跟身嘅（self 增益）要即刻脹到應有大細再守住。線性拉勻成條 life
            // 對一個 0.5 秒嘅閃光啱，但護盾類 life 有兩秒半——照拉嘅話全程
            // 都得六成大，到脹夠嗰刻已經開始淡出，等於成個持續時間都睇唔真。
            //
            // 用絕對秒數，唔用 life 嘅百分比：一個護盾彈出嚟幾快，唔應該
            // 取決於佢有幾長命。用百分比嘅話，八秒嘅增益就要成秒半先脹夠。
            const grow = follow ? Math.min(1, it.t / 0.22) : k;
            g.scale.setScalar((startScale + (endScale - startScale) * grow) * pulse);
            g.rotation.y = it.t * (profile.family === 'shadowdash' || profile.family === 'bladedance' ? 2.4 : 0.7);
            const fade = k < 0.72 ? 1 : Math.max(0, (1 - k) / 0.28);
            g.traverse((o) => {
                if (o.material?.userData?.fxOpacity != null) {
                    o.material.opacity = o.material.userData.fxOpacity * fade;
                }
            });
        }, { kind, style: profile.style, family: profile.family });
        return g;
    }

    attack(x0, z0, x1, z1, profile = {}) {
        if (['arrow', 'fire', 'holy'].includes(profile.family)) {
            this.muzzle(x0, z0, x1, z1, profile.colour, profile);
        } else {
            this.slash(x0, z0, x1, z1, profile.colour, profile);
        }
    }

    hit(x, z, profile = {}, scale = 1) {
        return this.cue(x, z, profile, {
            life: profile.family === 'axe' || profile.family === 'cleave' ? 0.38 : 0.28,
            radius: (profile.weight ?? 1) * 1.35 * scale,
            kind: 'impact', impact: true,
        });
    }

    // ---------- 位移殘影 ----------
    streak(x0, z0, x1, z1, colour = 0xbfd4ff, profile = {}) {
        const len = Math.hypot(x1 - x0, z1 - z0) || 0.1;
        const width = profile.trailWidth ?? 1.5;
        const ang = Math.atan2(z1 - z0, x1 - x0);
        const g = new THREE.Group();
        const count = profile.twin ? 2 : 1;
        for (let i = 0; i < count; i++) {
            const m = new THREE.Mesh(
                new THREE.PlaneGeometry(len, width * (i ? 0.48 : 1)),
                new THREE.MeshBasicMaterial({ color: i ? (profile.accent ?? colour) : colour,
                    transparent: true, opacity: i ? 0.36 : 0.52,
                    side: THREE.DoubleSide, depthWrite: false }));
            m.rotation.x = -Math.PI / 2;
            m.rotation.z = -ang;
            const off = count === 2 ? (i ? 0.42 : -0.42) : 0;
            m.position.set(-Math.sin(ang) * off, i * 0.07, Math.cos(ang) * off);
            m.userData.baseOpacity = m.material.opacity;
            g.add(m);
        }
        g.position.set((x0 + x1) / 2, 0.3, (z0 + z1) / 2);
        this.#add(g, 0.36, (it, k) => {
            for (const m of g.children) m.material.opacity = m.userData.baseOpacity * (1 - k);
        }, { kind: 'dash-trail', style: profile.style, family: profile.family });
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
            return false;
        });
    }

    dispose() {
        for (const it of this.items) {
            this.scene.remove(it.obj);
            if (it.obj.isSprite) it.obj.material?.dispose();
            else it.obj.traverse?.((o) => { o.geometry?.dispose(); o.material?.dispose(); });
        }
        this.items.length = 0;
        for (const sp of this.pool) sp.material?.dispose();
        this.pool.length = 0;
    }
}
