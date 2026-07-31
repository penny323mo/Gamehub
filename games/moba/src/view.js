// 3D 呈現層。讀 sim 嘅狀態去畫，唔會反過來影響 sim——所以規則測試永遠
// 唔使開瀏覽器，而畫面點靚都唔會改到平衡。
//
// 場景係一條橫住畫面嘅橋。鏡頭放喺 +z 望向 z=0，兵線由左去右，
// 手機打橫揸就啱啱好一屏睇晒成條線——一條線嘅 MOBA 唔應該要睇小地圖。

import * as THREE from '../vendor/three.module.min.js';
import { EffectComposer } from '../vendor/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/postprocessing/OutputPass.js';
import { MAP, TEAM } from './constants.js';
import { CHAMPION_LOOK, MINION_LOOK, ARENA_LOOK, TEAM_COLOUR, CLIP } from './looks.js';
import { Rig } from './rig.js';

const sideSign = (team) => (team === TEAM.BLUE ? -1 : 1);
const LANE_HALF = MAP.halfWidth;
const GRASS_HALF = LANE_HALF + 5.5;

// hex 排布：橫向對邊闊 2.0，縱向每行相隔 尖對尖 × 3/4。
const HEX_X = ARENA_LOOK.hexAcross;
const HEX_Z = ARENA_LOOK.hexPoint * 0.75;

function firstMesh(obj) {
    let found = null;
    obj.traverse((o) => { if (!found && (o.isMesh || o.isSkinnedMesh)) found = o; });
    return found;
}

// 血條：兩塊面對鏡頭嘅片。用 InstancedMesh 唔化算（每條長度都唔同），
// 但單位數目最多幾十個，兩個 mesh 一條算平。
function makeBar(width, colour) {
    const g = new THREE.Group();
    const back = new THREE.Mesh(
        new THREE.PlaneGeometry(width, 0.26),
        new THREE.MeshBasicMaterial({ color: 0x0b0d12, transparent: true, opacity: 0.75, depthTest: false }));
    const fill = new THREE.Mesh(
        new THREE.PlaneGeometry(width, 0.2),
        new THREE.MeshBasicMaterial({ color: colour, depthTest: false }));
    fill.position.z = 0.01;
    g.add(back, fill);
    back.renderOrder = 900; fill.renderOrder = 901;
    g.userData = { fill, width };
    return g;
}

function setBar(bar, pct) {
    const { fill, width } = bar.userData;
    const p = Math.max(0, Math.min(1, pct));
    fill.scale.x = p || 0.0001;
    fill.position.x = -width * (1 - p) / 2;
}

// 腳下光環：MOBA 靠呢個分敵我，唔係靠模型顏色——同一個英雄兩邊都揀得。
function makeRing(radius, colour) {
    const m = new THREE.Mesh(
        new THREE.RingGeometry(radius * 0.82, radius, 32),
        new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.85,
            side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.06;
    return m;
}

export class View {
    constructor(canvas, assets, sim, opts = {}) {
        this.assets = assets;
        this.sim = sim;
        this.units = new Map();      // entity id -> { obj, rig, bar, ring, look, dead }
        this.projectiles = new Map();
        this.decals = [];
        this.quality = opts.quality ?? 'high';

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.quality !== 'low', powerPreference: 'high-performance' });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.renderer.shadowMap.enabled = this.quality === 'high';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.scene = new THREE.Scene();
        // 天空唔可以係一片死黑：黑色背景之下，遠景嘅山同雲淨係得個剪影，
        // 成個場睇落似浮喺虛空。用一個由地平線暖色漸變上去夜藍嘅穹頂，
        // 霧色取地平線色，遠景就會自然融入天空。
        this.scene.background = null;
        this.scene.add(this.#sky());
        this.scene.fog = new THREE.Fog(0x6d9ad4, 80, 230);

        this.camera = new THREE.PerspectiveCamera(42, 1, 0.5, 400);
        this.camFocus = 0;

        this.#lights();
        this.#buildArena();
        this.#postprocess();
        this.resize();
    }

    #sky() {
        const geo = new THREE.SphereGeometry(300, 32, 20);
        const mat = new THREE.ShaderMaterial({
            side: THREE.BackSide, depthWrite: false, fog: false,
            uniforms: {
                top: { value: new THREE.Color(0x4a71b8) },
                mid: { value: new THREE.Color(0x6d9ad4) },
                bottom: { value: new THREE.Color(0xf0b884) },
            },
            vertexShader: `varying float vH;
                void main(){ vH = normalize(position).y;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
            fragmentShader: `varying float vH;
                uniform vec3 top; uniform vec3 mid; uniform vec3 bottom;
                void main(){
                    float h = clamp(vH, -1.0, 1.0);
                    vec3 c = h > 0.0 ? mix(mid, top, pow(h, 1.7))
                                     : mix(mid, bottom, pow(-h, 0.7));
                    gl_FragColor = vec4(c, 1.0);
                }`,
        });
        return new THREE.Mesh(geo, mat);
    }

    #lights() {
        this.scene.add(new THREE.HemisphereLight(0xa8c6ff, 0x2a2416, 1.5));
        const sun = new THREE.DirectionalLight(0xfff0cf, 2.6);
        sun.position.set(-30, 60, 40);
        if (this.quality === 'high') {
            sun.castShadow = true;
            sun.shadow.mapSize.set(2048, 2048);
            const d = 60;
            Object.assign(sun.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 1, far: 200 });
            sun.shadow.bias = -0.0008;
        }
        this.sun = sun;
        this.scene.add(sun, sun.target);
        // 反方向補一盞冷光，唔會有純黑嘅背面
        const rim = new THREE.DirectionalLight(0x6d8fd6, 0.8);
        rim.position.set(40, 30, -40);
        this.scene.add(rim);
    }

    #postprocess() {
        if (this.quality === 'low') { this.composer = null; return; }
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.6, 0.85);
        this.composer.addPass(bloom);
        this.composer.addPass(new OutputPass());
    }

    // ---------- 戰場 ----------
    #buildArena() {
        const A = this.assets;
        this.#buildGround();

        const put = (name, x, z, scale, rotY = 0) => {
            const o = A.piece(name);
            o.position.set(x, 0, z);
            o.scale.setScalar(scale);
            o.rotation.y = rotY;
            this.scene.add(o);
            return o;
        };

        this.structures = new Map();
        for (const e of this.sim.entities) {
            if (e.kind !== 'tower' && e.kind !== 'nexus') continue;
            const colour = e.team === TEAM.BLUE ? 'blue' : 'red';
            const name = e.kind === 'nexus'
                ? `${ARENA_LOOK.nexus}_${colour}`
                : `${ARENA_LOOK.towerByTier[e.tier]}_${colour}`;
            const scale = e.kind === 'nexus' ? ARENA_LOOK.nexusScale : ARENA_LOOK.towerScale[e.tier];
            const o = put(name, e.x, e.z, scale, e.team === TEAM.BLUE ? Math.PI / 2 : -Math.PI / 2);
            const bar = makeBar(e.kind === 'nexus' ? 7 : 5, TEAM_COLOUR[e.team]);
            bar.position.set(e.x, e.kind === 'nexus' ? 15 : 10, e.z);
            this.scene.add(bar);
            this.structures.set(e.id, { obj: o, bar, entity: e });
        }

        // 基地：兵營同城牆，畀出兵點有個交代
        for (const team of [TEAM.BLUE, TEAM.RED]) {
            const s = sideSign(team);
            const colour = team === TEAM.BLUE ? 'blue' : 'red';
            put(`${ARENA_LOOK.barracks}_${colour}`, s * (MAP.nexusX + 5), -(LANE_HALF + 4), ARENA_LOOK.barracksScale, -s * Math.PI / 2);
            put(`${ARENA_LOOK.barracks}_${colour}`, s * (MAP.nexusX + 5), LANE_HALF + 4, ARENA_LOOK.barracksScale, -s * Math.PI / 2);
            // 城牆貼住橋邊行，唔可以打橫封住條路——玩家要睇得到成條兵線。
            for (let i = 0; i < 4; i++) {
                const x = s * (MAP.nexusX - 4 - i * 4.4);
                for (const side of [-1, 1]) {
                    put(ARENA_LOOK.wall, x, side * (LANE_HALF + 0.8), ARENA_LOOK.wallScale);
                }
            }
            // 泉水：一圈發光嘅地台
            const pad = new THREE.Mesh(
                new THREE.RingGeometry(5.2, 6, 44),
                new THREE.MeshBasicMaterial({ color: TEAM_COLOUR[team], transparent: true, opacity: 0.6,
                    side: THREE.DoubleSide, depthWrite: false }));
            pad.rotation.x = -Math.PI / 2;
            pad.position.set(s * MAP.fountainX, 0.08, 0);
            this.scene.add(pad);
        }

        this.#buildScenery();
    }

    // 地面：hex 拼出嚟嘅路面同草地邊，兩個 InstancedMesh 掂晒成千塊。
    #buildGround() {
        const A = this.assets;
        const grass = firstMesh(A.piece(ARENA_LOOK.tileGrass));
        const road = firstMesh(A.piece(ARENA_LOOK.tileRoad));
        const edge = A.hasPiece(ARENA_LOOK.tileEdge) ? firstMesh(A.piece(ARENA_LOOK.tileEdge)) : null;
        if (!grass || !road) return;

        const roadCells = [], grassCells = [], edgeCells = [];
        const rows = Math.ceil(GRASS_HALF / HEX_Z) + 1;
        const cols = Math.ceil((MAP.fountainX + 10) / HEX_X) + 1;
        for (let r = -rows; r <= rows; r++) {
            const z = r * HEX_Z;
            if (Math.abs(z) > GRASS_HALF + HEX_Z) continue;
            const offset = (r & 1) ? HEX_X / 2 : 0;
            for (let c = -cols; c <= cols; c++) {
                const x = c * HEX_X + offset;
                if (Math.abs(x) > MAP.fountainX + 10) continue;
                // 走得到嘅範圍係草地，出面係水——玩家一眼睇得出條橋去到邊。
                // 之前用石圍欄劃界，喺呢個俯角度睇落似一排踏腳石，睇唔出係牆。
                // 中線鋪一行石路，唔會鋪成一整塊（每行嘅花紋會變成並排間條）。
                if (Math.abs(z) > LANE_HALF) edgeCells.push([x, z]);
                else if (Math.abs(z) < HEX_Z * 0.6) roadCells.push([x, z]);
                else grassCells.push([x, z]);
            }
        }
        for (const [mesh, cells] of [[road, roadCells], [grass, grassCells], [edge, edgeCells]]) {
            if (!mesh || !cells.length) continue;
            const inst = new THREE.InstancedMesh(mesh.geometry, mesh.material, cells.length);
            inst.receiveShadow = true;
            inst.castShadow = false;
            const m = new THREE.Matrix4();
            cells.forEach(([x, z], i) => { m.makeTranslation(x, 0, z); inst.setMatrixAt(i, m); });
            inst.instanceMatrix.needsUpdate = true;
            inst.frustumCulled = false;
            this.scene.add(inst);
        }
    }

    // 橋兩邊嘅深淵同遠景。全部係裝飾，唔會影響碰撞。
    #buildScenery() {
        const A = this.assets;
        const rng = (() => { let s = 20260731; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; })();

        const abyss = new THREE.Mesh(
            new THREE.PlaneGeometry(500, 500),
            new THREE.MeshBasicMaterial({ color: 0x0a0d18 }));
        abyss.rotation.x = -Math.PI / 2;
        abyss.position.y = -6;
        this.scene.add(abyss);

        // 遠景只可以擺喺場後面（-z）。鏡頭喺 +z，近鏡頭嗰邊放山就會擋住兵線——
        // 呢個同啲雲係同一個錯，錯法一樣：忘記咗鏡頭其實喺場嘅一邊，唔係上面。
        for (let x = -MAP.fountainX - 10; x <= MAP.fountainX + 10; x += 5.5) {
            const name = ARENA_LOOK.scenery[Math.floor(rng() * ARENA_LOOK.scenery.length)];
            if (!A.hasPiece(name)) continue;
            const o = A.piece(name);
            o.position.set(x + (rng() - 0.5) * 5, -2 - rng() * 3.5, -(GRASS_HALF + 4 + rng() * 26));
            o.scale.setScalar(2.4 + rng() * 3.6);
            o.rotation.y = rng() * Math.PI * 2;
            this.scene.add(o);
        }
        // 近鏡頭嗰邊只擺矮石，而且壓喺視線下面，做返個崖邊嘅感覺
        for (let x = -MAP.fountainX; x <= MAP.fountainX; x += 7) {
            const name = rng() < 0.5 ? 'rock_single_A' : 'rock_single_C';
            if (!A.hasPiece(name)) continue;
            const o = A.piece(name);
            o.position.set(x + (rng() - 0.5) * 4, -3.5 - rng() * 2, GRASS_HALF + 1.5 + rng() * 4);
            o.scale.setScalar(2 + rng() * 2.5);
            o.rotation.y = rng() * Math.PI * 2;
            this.scene.add(o);
        }

        // 雲一定要擺喺戰場後面（-z）。鏡頭喺 +z 望入去，任何 z 大過 0 嘅雲
        // 都會浮咗喺鏡頭同兵線之間，實測會遮住成個畫面。
        this.clouds = [];
        for (let i = 0; i < 12; i++) {
            const name = ARENA_LOOK.clouds[i % ARENA_LOOK.clouds.length];
            if (!A.hasPiece(name)) continue;
            const o = A.piece(name);
            o.position.set((rng() - 0.5) * 200, 26 + rng() * 20, -70 - rng() * 60);
            o.scale.setScalar(4 + rng() * 5);
            this.scene.add(o);
            this.clouds.push({ obj: o, speed: 0.5 + rng() * 0.8 });
        }
    }

    // ---------- 單位 ----------
    #lookFor(e) {
        return e.kind === 'champ'
            ? CHAMPION_LOOK[e.champId]
            : MINION_LOOK[e.minionKind] ?? MINION_LOOK.melee;
    }

    #spawnUnit(e) {
        const look = this.#lookFor(e);
        const obj = this.assets.unit(e.kind === 'champ' ? 'champ' : 'minion', look.model);
        obj.scale.setScalar(look.scale);
        this.#tint(obj, e.team, e.kind);
        const holder = new THREE.Group();
        holder.add(obj);
        const rig = new Rig(obj, this.assets, look);
        const ring = makeRing(e.kind === 'champ' ? 1.5 : 0.95,
            e.isPlayer ? 0xffe27a : TEAM_COLOUR[e.team]);
        if (e.isPlayer) {
            ring.material.opacity = 1;
            ring.scale.setScalar(1.25);
        }
        holder.add(ring);
        const bar = makeBar(e.kind === 'champ' ? 2.6 : 1.5, TEAM_COLOUR[e.team]);
        this.scene.add(bar);
        this.scene.add(holder);
        const u = { obj: holder, model: obj, rig, bar, ring, look, entity: e, wasAlive: true,
            barY: e.kind === 'champ' ? 3.6 : 2.5 };
        this.units.set(e.id, u);
        rig.loop(this.assets, CLIP.idle);
        return u;
    }

    // 隊伍染色。英雄本身六個造型都唔同，輕輕帶一層就夠；小兵兩邊係同一副
    // 骨頭，唔染就真係分唔開邊隻打邊隻。
    #tint(obj, team, kind) {
        const strength = kind === 'champ' ? 0.16 : 0.42;
        const tint = new THREE.Color(TEAM_COLOUR[team]);
        const cache = new Map();
        obj.traverse((o) => {
            if (!o.isMesh && !o.isSkinnedMesh) return;
            const src = o.material;
            let m = cache.get(src);
            if (!m) {
                m = src.clone();
                m.color = src.color.clone().lerp(tint, strength);
                m.emissive = tint.clone().multiplyScalar(kind === 'champ' ? 0.05 : 0.12);
                cache.set(src, m);
            }
            o.material = m;
        });
    }

    #syncUnits(dt) {
        const seen = new Set();
        for (const e of this.sim.entities) {
            if (e.kind !== 'champ' && e.kind !== 'minion') continue;
            seen.add(e.id);
            let u = this.units.get(e.id);
            if (!u) u = this.#spawnUnit(e);

            if (!e.alive) {
                if (u.wasAlive) {
                    u.wasAlive = false;
                    u.rig.die(this.assets, e.kind === 'minion' || u.look.model.startsWith('skeleton'));
                    u.ring.visible = false;
                    u.bar.visible = false;
                }
                u.rig.update(dt);
                continue;
            }
            if (!u.wasAlive) {           // 重生
                u.wasAlive = true;
                u.rig.revive();
                u.ring.visible = true;
                u.bar.visible = true;
            }

            u.obj.position.set(e.x, 0, e.z);
            if (e.facing != null) {
                const target = e.facing + Math.PI;   // 模型面向 -z，遊戲角度以 +z 為零
                let d = target - u.obj.rotation.y;
                d = Math.atan2(Math.sin(d), Math.cos(d));
                u.obj.rotation.y += d * Math.min(1, dt * 12);
            }

            const st = e.kind === 'champ' ? this.sim.stats(e) : { maxHp: e.maxHp };
            setBar(u.bar, e.hp / st.maxHp);
            u.bar.position.set(e.x, u.barY, e.z);
            u.bar.quaternion.copy(this.camera.quaternion);

            if (!u.rig.busy) {
                if (e.moving) u.rig.loop(this.assets, e.kind === 'champ' ? CLIP.run : CLIP.walk);
                else u.rig.loop(this.assets, CLIP.idleCombat);
            }
            u.rig.update(dt);
        }
        for (const [id, u] of this.units) {
            if (seen.has(id)) continue;
            this.scene.remove(u.obj);
            this.scene.remove(u.bar);
            u.rig.dispose();
            this.units.delete(id);
        }
    }

    // ---------- 事件（打擊、施法、死亡…）----------
    #consumeEvents() {
        for (const ev of this.sim.events) {
            if (ev.type === 'attack') {
                const u = this.units.get(ev.id);
                if (!u) continue;
                const e = u.entity;
                const rate = e.kind === 'champ' ? this.sim.stats(e).attackSpeed : e.attackSpeed;
                u.rig.once(this.assets, u.look.attack, Math.min(1.1, 1 / Math.max(0.2, rate)));
            } else if (ev.type === 'cast') {
                const u = this.units.get(ev.id);
                if (!u?.look.abilityClip) continue;
                u.rig.once(this.assets, u.look.abilityClip[ev.index] ?? u.look.attack, 0.55);
            } else if (ev.type === 'tower') {
                this.#towerFell(ev);
            } else if (ev.type === 'boom' || ev.type === 'zone') {
                this.#burst(ev.x, ev.z, ev.radius, 0xffb055);
            } else if (ev.type === 'warden') {
                const u = this.units.get(ev.target);
                if (u) this.#burst(u.obj.position.x, u.obj.position.z, 2.2, 0xffe9a8);
            }
        }
    }

    #towerFell(ev) {
        for (const [, s] of this.structures) {
            const e = s.entity;
            if (e.kind !== 'tower' || e.team !== ev.team || e.tier !== ev.tier) continue;
            this.scene.remove(s.obj);
            s.bar.visible = false;
            const rubble = this.assets.piece(ARENA_LOOK.rubble);
            rubble.position.set(e.x, 0, e.z);
            rubble.scale.setScalar(ARENA_LOOK.rubbleScale);
            this.scene.add(rubble);
            this.#burst(e.x, e.z, 6, 0xd8c48a);
        }
    }

    // 一個會漲大同褪色嘅環，做技能同爆炸嘅回饋
    #burst(x, z, radius, colour) {
        const m = new THREE.Mesh(
            new THREE.RingGeometry(radius * 0.2, radius * 0.28, 28),
            new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.9,
                side: THREE.DoubleSide, depthWrite: false }));
        m.rotation.x = -Math.PI / 2;
        m.position.set(x, 0.25, z);
        this.scene.add(m);
        this.decals.push({ obj: m, t: 0, life: 0.5, radius });
    }

    #syncDecals(dt) {
        for (const d of this.decals) {
            d.t += dt;
            const k = d.t / d.life;
            d.obj.scale.setScalar(1 + k * 3.4);
            d.obj.material.opacity = Math.max(0, 0.9 * (1 - k));
        }
        this.decals = this.decals.filter((d) => {
            if (d.t < d.life) return true;
            this.scene.remove(d.obj);
            d.obj.geometry.dispose(); d.obj.material.dispose();
            return false;
        });
    }

    // ---------- 彈道 ----------
    #syncProjectiles() {
        const seen = new Set();
        this.sim.projectiles.forEach((p, i) => {
            const key = p.__vid ?? (p.__vid = `p${i}_${Math.random()}`);
            seen.add(key);
            let o = this.projectiles.get(key);
            if (!o) {
                const geo = p.skill
                    ? new THREE.SphereGeometry(0.42, 10, 8)
                    : new THREE.CapsuleGeometry(0.08, 0.7, 4, 6);
                const colour = p.skill ? 0xffd27a : 0xe8e2d0;
                o = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: colour }));
                this.scene.add(o);
                this.projectiles.set(key, o);
            }
            o.position.set(p.x, 1.5, p.z);
        });
        for (const [k, o] of this.projectiles) {
            if (seen.has(k)) continue;
            this.scene.remove(o);
            o.geometry.dispose(); o.material.dispose();
            this.projectiles.delete(k);
        }
    }

    #syncStructures() {
        for (const [, s] of this.structures) {
            if (!s.entity.alive) { s.bar.visible = false; continue; }
            setBar(s.bar, s.entity.hp / s.entity.maxHp);
            s.bar.quaternion.copy(this.camera.quaternion);
        }
    }

    // ---------- 鏡頭 ----------
    // 跟住玩家沿住 x 軸行，永遠由 +z 望入去，所以兵線橫住成個畫面。
    setCameraFocus(x) { this.camFocus = x; }

    #camera(dt) {
        const p = this.sim.player;
        const want = p?.alive ? p.x : this.camFocus;
        this.camFocus += (want - this.camFocus) * Math.min(1, dt * 4);
        const limit = MAP.fountainX - 4;
        const fx = Math.max(-limit, Math.min(limit, this.camFocus));
        this.camera.position.set(fx, this.camHeight, this.camDepth);
        this.camera.lookAt(fx, 1.5, -1.5);
        this.sun.position.set(fx - 30, 60, 40);
        this.sun.target.position.set(fx, 0, 0);
        this.sun.target.updateMatrixWorld();
    }

    resize() {
        const c = this.renderer.domElement;
        const w = c.clientWidth || window.innerWidth;
        const h = c.clientHeight || window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.5);
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h, false);
        this.composer?.setPixelRatio(dpr);
        this.composer?.setSize(w, h);
        this.camera.aspect = w / h;
        // 打直揸手機睇得少啲橫向範圍，所以要拉高拉遠先睇得晒兵線
        const portrait = this.camera.aspect < 1;
        this.camHeight = portrait ? 36 : 28;
        this.camDepth = portrait ? 32 : 26;
        this.camera.fov = portrait ? 52 : 45;
        this.camera.updateProjectionMatrix();
    }

    update(dt) {
        this.#consumeEvents();
        this.#syncUnits(dt);
        this.#syncStructures();
        this.#syncProjectiles();
        this.#syncDecals(dt);
        this.#camera(dt);
        for (const c of this.clouds ?? []) {
            c.obj.position.x += c.speed * dt;
            if (c.obj.position.x > 110) c.obj.position.x = -110;
        }
        if (this.composer) this.composer.render();
        else this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        for (const [, u] of this.units) u.rig.dispose();
        this.renderer.dispose();
    }
}
