// 3D 呈現層。讀 sim 嘅狀態去畫，唔會反過來影響 sim——所以規則測試永遠
// 唔使開瀏覽器，而畫面點靚都唔會改到平衡。
//
// 場景係一條橋。打橫揸嘅時候鏡頭喺 +z 望向 z=0，兵線由左去右，一屏睇晒
// 成條線——一條線嘅 MOBA 唔應該要睇小地圖。打直揸就將鏡頭繞 Y 轉九十度，
// 令長嘅地圖軸對正長嘅螢幕軸（原因同量度見 setCameraFocus 上面嗰段）。

import * as THREE from '../vendor/three.module.min.js';
import { EffectComposer } from '../vendor/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/postprocessing/OutputPass.js';
import { MAP, TEAM } from './constants.js?v=buy-rule-17';
import { CHAMPION_LOOK, MINION_LOOK, ARENA_LOOK, TEAM_COLOUR, CLIP, championFx } from './looks.js?v=buy-rule-17';
import { Rig } from './rig.js?v=buy-rule-17';
import { Fx } from './fx.js?v=buy-rule-17';

// 平滑追趕：每秒收窄 rate 咁多，而且同幀率無關。
//
// 之前寫 Math.min(1, dt * rate)。嗰條係「每秒收窄率」嘅一階近似，幀率一變
// 結果就唔同：rate 4 之下，60fps 一秒之後仲剩 1.59% 距離，30fps 剩 1.36%
// ——即係同一場波，喺手機同喺電腦嘅鏡頭跟隨同轉身速度唔一樣。個近似喺
// dt 細嗰陣先準，而手機正正就係 dt 大嗰邊。
//
// 1 - exp(-rate * dt) 係同一條曲線嘅準確解，兩個幀率都剛好剩 1.83%。
const approach = (rate, dt) => 1 - Math.exp(-rate * dt);

const sideSign = (team) => (team === TEAM.BLUE ? -1 : 1);
const UP = new THREE.Vector3(0, 1, 0);
const TMP_DIR = new THREE.Vector3();
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
const GEO_CACHE = new Map();
function sharedGeo(key, make) {
    let g = GEO_CACHE.get(key);
    if (!g) { g = make(); GEO_CACHE.set(key, g); }
    return g;
}

// 血條嘅顏色一定要講血量，唔係講隊伍。舊版填色用隊伍藍／紅，
// 所以一條「紅色血條」可能係滿血嘅紅方——玩家睇極都睇唔出邊個殘。
// 隊伍靠腳下光環同下面嗰條隊色細線交代，血量靠綠→黃→紅。
const HP_FULL = new THREE.Color(0x3ddc84);
const HP_MID = new THREE.Color(0xf2c85b);
const HP_LOW = new THREE.Color(0xff4d3d);

function makeBar(width, teamColour, height = 0.34) {
    const g = new THREE.Group();
    // 四件都一定要 transparent: true。three.js 分開兩次繪製——所有不透明物件
    // 行先，跟住先到透明物件——而 renderOrder 只喺同一次入面排序。之前 back 係
    // 透明、fill 係不透明，所以黑色底板永遠喺綠色血量之後先畫，加埋
    // depthTest: false，就變成一條純黑嘅條。血量色改咗都冇人見過。
    const back = new THREE.Mesh(
        sharedGeo(`bar-back-${width}-${height}`, () => new THREE.PlaneGeometry(width + 0.1, height + 0.09)),
        new THREE.MeshBasicMaterial({ color: 0x05070d, transparent: true, opacity: 0.9, depthTest: false }));
    const fill = new THREE.Mesh(
        sharedGeo(`bar-fill-${width}-${height}`, () => new THREE.PlaneGeometry(width, height)),
        new THREE.MeshBasicMaterial({ color: 0x3ddc84, transparent: true, depthTest: false }));
    fill.position.z = 0.01;
    // 護盾疊喺血量上面，用白色——盾同血唔同質，唔可以同色
    const shield = new THREE.Mesh(
        sharedGeo(`bar-fill-${width}-${height}`, () => new THREE.PlaneGeometry(width, height)),
        new THREE.MeshBasicMaterial({ color: 0xe8f0ff, transparent: true, opacity: 0.85, depthTest: false }));
    shield.position.z = 0.02;
    shield.visible = false;
    // 隊色細線：血量色已經被血量用咗，隊伍就用底下呢條線
    const stripe = new THREE.Mesh(
        sharedGeo(`bar-stripe-${width}`, () => new THREE.PlaneGeometry(width + 0.1, 0.07)),
        new THREE.MeshBasicMaterial({ color: teamColour, transparent: true, depthTest: false }));
    stripe.position.set(0, -(height + 0.09) / 2 - 0.015, 0.01);
    g.add(back, fill, shield, stripe);
    for (const [i, m] of [back, fill, shield, stripe].entries()) m.renderOrder = 900 + i;
    g.userData = { fill, shield, width, colour: new THREE.Color() };
    return g;
}

function setBar(bar, pct, shieldPct = 0) {
    const { fill, shield, width, colour } = bar.userData;
    const p = Math.max(0, Math.min(1, pct));
    fill.scale.x = p || 0.0001;
    fill.position.x = -width * (1 - p) / 2;
    // 綠 → 黃 → 紅，喺 50% 同 25% 兩個位轉色
    if (p > 0.5) colour.copy(HP_MID).lerp(HP_FULL, Math.min(1, (p - 0.5) / 0.3));
    else colour.copy(HP_LOW).lerp(HP_MID, Math.min(1, (p - 0.15) / 0.35));
    fill.material.color.copy(colour);
    const sp = Math.max(0, Math.min(1, shieldPct));
    shield.visible = sp > 0.001;
    if (shield.visible) {
        shield.scale.x = sp;
        shield.position.x = -width / 2 + width * p + (width * sp) / 2;
    }
}

// 腳下光環：MOBA 靠呢個分敵我，唔係靠模型顏色——同一個英雄兩邊都揀得。
function makeRing(radius, colour) {
    const m = new THREE.Mesh(
        sharedGeo(`ring-${radius}`, () => new THREE.RingGeometry(radius * 0.82, radius, 32)),
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
        this.quality = opts.quality ?? 'high';
        this.onCast = opts.onCast ?? (() => {});

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.quality !== 'low', powerPreference: 'high-performance' });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.frameTimes = [];
        this.autoDropped = false;
        this.onQuality = opts.onQuality ?? (() => {});

        this.scene = new THREE.Scene();
        // 天空唔可以係一片死黑：黑色背景之下，遠景嘅山同雲淨係得個剪影，
        // 成個場睇落似浮喺虛空。用一個由地平線暖色漸變上去夜藍嘅穹頂，
        // 霧色取地平線色，遠景就會自然融入天空。
        this.scene.background = null;
        this.scene.add(this.#sky());
        this.scene.fog = new THREE.Fog(0x6d9ad4, 80, 230);

        this.camera = new THREE.PerspectiveCamera(42, 1, 0.5, 400);
        this.camFocus = 0;

        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.contextLost = true;
            this.onContextLost?.();
        });
        // 掉咗嘅 context 係會返嚟嘅。手機鎖屏、切走一陣、記憶體壓力都會令
        // 瀏覽器收返個 GPU context，跟住又會還返畀你——而 three.js 喺
        // webglcontextrestored 之後會自己重新上載幾何同貼圖。之前呢度淨係
        // 將旗標熄返，冇通知過任何人，所以場波就永遠停咗喺嗰一格。
        canvas.addEventListener('webglcontextrestored', () => {
            this.contextLost = false;
            this.onContextRestored?.();
        });
        this.onContextLost = opts.onContextLost ?? null;
        this.onContextRestored = opts.onContextRestored ?? null;

        this.playerColour = CHAMPION_LOOK[sim.player?.champId]?.ringColour ?? 0xffe27a;
        this.#lights();
        this.#buildArena();
        this.fx = new Fx(this.scene, this.camera);
        this.#playerMarks();
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
        sun.castShadow = true;
        sun.shadow.mapSize.set(1536, 1536);
        const d = 60;
        Object.assign(sun.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 1, far: 200 });
        sun.shadow.bias = -0.0008;
        this.sun = sun;
        this.scene.add(sun, sun.target);
        // 反方向補一盞冷光，唔會有純黑嘅背面
        const rim = new THREE.DirectionalLight(0x6d8fd6, 0.8);
        rim.position.set(40, 30, -40);
        this.scene.add(rim);
    }

    // 三個檔嘅分別淨係三樣嘢：後製、陰影、解析度倍率。
    // 之前 medium 都開住 bloom——手機上面 bloom 係全屏 fill rate，
    // 正正係最唔應該留畀中低階機嘅嗰樣。
    static QUALITY = {
        high: { bloom: true, shadows: true, dpr: 2 },
        medium: { bloom: false, shadows: true, dpr: 1.5 },
        low: { bloom: false, shadows: false, dpr: 1 },
    };

    #postprocess() {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.6, 0.85);
        this.composer.addPass(this.bloomPass);
        this.composer.addPass(new OutputPass());
        this.setQuality(this.quality);
    }

    setQuality(q) {
        const cfg = View.QUALITY[q] ?? View.QUALITY.medium;
        this.quality = q;
        this.renderer.shadowMap.enabled = cfg.shadows;
        this.sun.castShadow = cfg.shadows;
        if (this.bloomPass) this.bloomPass.enabled = cfg.bloom;
        // 材質已經編譯過，關陰影要話畀 three 知要重新編
        this.scene.traverse((o) => {
            const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
            for (const m of mats) m.needsUpdate = true;
        });
        this.resize();
        this.onQuality(q);
    }

    // 自動降級：連續一段時間跑唔到就落一檔。玩家寧願冇 bloom，
    // 都好過睇住一格一格。只降唔升，避免喺臨界點左右閃嚟閃去。
    #watchFrames(dt) {
        if (this.autoDropped || this.quality === 'low' || dt <= 0) return;
        this.frameTimes.push(dt);
        if (this.frameTimes.length < 120) return;
        const sorted = this.frameTimes.slice().sort((a, b) => a - b);
        const median = sorted[sorted.length >> 1];
        this.frameTimes.length = 0;
        if (median > 1 / 34) {
            this.autoDropped = true;
            this.setQuality(this.quality === 'high' ? 'medium' : 'low');
        }
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
            // 塔腳嘅台座：塔唔會似插咗支嘢落草地，而且遠處都認得出「呢度有塔」
            const baseName = `${ARENA_LOOK.towerBase}_${colour}`;
            if (e.kind === 'tower' && A.hasPiece(baseName)) put(baseName, e.x, e.z, scale * 0.95);
            const o = put(name, e.x, e.z, scale, e.team === TEAM.BLUE ? Math.PI / 2 : -Math.PI / 2);
            const bar = makeBar(e.kind === 'nexus' ? 7 : 5, TEAM_COLOUR[e.team], 0.5);
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

        // 中線：兩隊喺呢度相遇，所以要一眼認得出。
        // 試過兩樣都唔work：兩塊泥地 hex 佔咗成條橋闊度嘅三分一，睇落似地面壞咗；
        // 兩支石柱喺打直畫面度似浮喺半空。淨返一條橫過橋面嘅光線最乾淨——
        // 同 LoL 條河一樣：講得清「呢度係中線」，但唔搶戲。
        const midLine = new THREE.Mesh(
            new THREE.PlaneGeometry(1.1, LANE_HALF * 2),
            new THREE.MeshBasicMaterial({ color: 0xf4e3b4, transparent: true, opacity: 0.34,
                depthWrite: false }));
        midLine.rotation.x = -Math.PI / 2;
        midLine.position.set(0, 0.04, 0);
        this.scene.add(midLine);

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
        // 分區上色。一條 124 米嘅橋成片同一個黃綠色，玩家睇一眼分唔出
        // 自己喺自己半場定對面半場——而「我而家喺邊」係 MOBA 每一秒都要答嘅問題。
        // 藍方地帶偏冷、紅方地帶偏暖、中線保持原色，三段一眼分得出。
        const zoneTint = new THREE.Color();
        const blueZone = new THREE.Color(0x9fb6e8);
        const redZone = new THREE.Color(0xe8b39f);
        const neutral = new THREE.Color(0xffffff);
        const tintAt = (x) => {
            const t = Math.min(1, Math.max(0, (Math.abs(x) - MAP.towerX[0] * 0.45) / (MAP.nexusX * 0.7)));
            zoneTint.copy(neutral).lerp(x < 0 ? blueZone : redZone, t * 0.85);
            return zoneTint;
        };
        for (const [mesh, cells] of [[road, roadCells], [grass, grassCells], [edge, edgeCells]]) {
            if (!mesh || !cells.length) continue;
            // 材質要 clone：instanceColor 一開就會影響用同一個材質嘅所有嘢
            const inst = new THREE.InstancedMesh(mesh.geometry, mesh.material.clone(), cells.length);
            inst.receiveShadow = true;
            inst.castShadow = false;
            const m = new THREE.Matrix4();
            cells.forEach(([x, z], i) => {
                m.makeTranslation(x, 0, z);
                inst.setMatrixAt(i, m);
                inst.setColorAt(i, mesh === edge ? neutral : tintAt(x));
            });
            inst.instanceMatrix.needsUpdate = true;
            if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
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

    // 玩家嘅普攻範圍。MOBA 最基本嘅一條資訊——你而家打唔打得到——
    // 之前完全冇顯示，所以走位變咗靠估。
    #playerMarks() {
        const p = this.sim.player;
        if (!p) return;
        // 半徑做 1，行時用 scale 撐開——射程唔係常數（換英雄、日後加裝備都會變），
        // 幾何體一鑄死就會同真實射程脫節。
        const g = new THREE.Mesh(
            sharedGeo('unit-ring', () => new THREE.RingGeometry(0.986, 1, 64)),
            new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0.2,
                side: THREE.DoubleSide, depthWrite: false }));
        g.rotation.x = -Math.PI / 2;
        g.position.y = 0.05;
        this.scene.add(g);
        this.rangeRing = g;

        // 施法預覽：一個射程圈 + 一條指住瞄準方向嘅帶 + 落點圓。
        // 唔知自己打唔打得到、去邊度炸，係 MOBA 最貴嘅資訊缺口。
        const mk = (geo, colour, opacity) => {
            const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
                color: colour, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
            m.rotation.x = -Math.PI / 2;
            m.visible = false;
            this.scene.add(m);
            return m;
        };
        this.aimRange = mk(sharedGeo('unit-ring', () => new THREE.RingGeometry(0.986, 1, 64)), 0xffe27a, 0.34);
        this.aimBeam = mk(new THREE.PlaneGeometry(1, 1), 0xffe27a, 0.2);
        this.aimSpot = mk(new THREE.CircleGeometry(1, 36), 0xffe27a, 0.24);
        this.aimSpotRing = mk(new THREE.RingGeometry(0.94, 1, 40), 0xffe27a, 0.75);
    }

    // 由 input 每幀叫：aim = null 就收起，否則畫返個技能實際會點打。
    showAim(aim) {
        const on = !!aim;
        for (const m of [this.aimRange, this.aimBeam, this.aimSpot, this.aimSpotRing]) {
            if (m) m.visible = false;
        }
        if (!on) return;
        const p = this.sim.player;
        const ab = aim.ability;
        const colour = aim.colour ?? 0xffe27a;
        const reach = ab.range ?? 9;

        this.aimRange.visible = true;
        this.aimRange.position.set(p.x, 0.07, p.z);
        this.aimRange.scale.setScalar(reach);
        this.aimRange.material.color.setHex(colour);

        // 落點：夾返喺射程之內，噉玩家見到嘅就係真正會發生嘅位置
        const dx = aim.x - p.x, dz = aim.z - p.z;
        const d = Math.hypot(dx, dz) || 1;
        const k = Math.min(1, reach / d);
        const tx = p.x + dx * k, tz = p.z + dz * k;

        if (ab.form === 'skillshot' || ab.form === 'dash') {
            this.aimBeam.visible = true;
            this.aimBeam.material.color.setHex(colour);
            const width = ab.width ? ab.width * 2 : 1.6;
            this.aimBeam.scale.set(reach, width, 1);
            this.aimBeam.rotation.z = -Math.atan2(dz, dx);
            this.aimBeam.position.set(p.x + (dx / d) * reach / 2, 0.09, p.z + (dz / d) * reach / 2);
        } else if (ab.radius) {
            for (const m of [this.aimSpot, this.aimSpotRing]) {
                m.visible = true;
                m.material.color.setHex(colour);
                m.position.set(tx, 0.09, tz);
                m.scale.setScalar(ab.radius);
            }
        } else {
            this.aimSpotRing.visible = true;
            this.aimSpotRing.material.color.setHex(colour);
            this.aimSpotRing.position.set(tx, 0.09, tz);
            this.aimSpotRing.scale.setScalar(1.4);
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
        // 血條要窄過個角色本身。3.6 闊嗰版實測比角色仲闊，幾個人企埋一齊
        // 就疊成一堆互相蓋住嘅色塊——條數係讀到嘅，但邊條屬於邊個就讀唔到。
        const bar = makeBar(e.kind === 'champ' ? 2.1 : 1.15, TEAM_COLOUR[e.team],
            e.kind === 'champ' ? 0.3 : 0.2);
        this.scene.add(bar);
        this.scene.add(holder);
        const u = { obj: holder, model: obj, rig, bar, ring, look, entity: e, wasAlive: true,
            barY: e.kind === 'champ' ? 3.9 : 2.6, flashUntil: -1, baseEmissive: null };
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

            // 位移殘影：由起點拉到而家嘅位置
            if (u.dashFrom) {
                const moved = Math.hypot(e.x - u.dashFrom.x, e.z - u.dashFrom.z);
                if (moved > 1.2) {
                    this.fx.streak(u.dashFrom.x, u.dashFrom.z, e.x, e.z,
                        u.dashFrom.profile?.colour ?? u.dashFrom.colour, u.dashFrom.profile);
                    u.dashFrom = null;
                } else if ((u.dashAge = (u.dashAge ?? 0) + dt) > 0.5) {
                    u.dashFrom = null; u.dashAge = 0;
                }
            }
            u.obj.position.set(e.x, 0, e.z);
            if (e.facing != null) {
                // KayKit 嘅角色向 +z，同 three.js 一樣，而 sim 個 facing 就係
                // atan2(dx, dz)——即係 rotation.y 直接就啱。之前加咗 Math.PI
                // 「修正」一個唔存在嘅偏差，結果全場人背住敵人打。
                const target = e.facing;
                let d = target - u.obj.rotation.y;
                d = Math.atan2(Math.sin(d), Math.cos(d));
                u.obj.rotation.y += d * approach(12, dt);
            }

            const st = e.kind === 'champ' ? this.sim.stats(e) : { maxHp: e.maxHp };
            const shieldPct = e.kind === 'champ' && e.shieldUntil > this.sim.time
                ? e.shield / st.maxHp : 0;
            setBar(u.bar, e.hp / st.maxHp, shieldPct);
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
            this.#disposeUnit(u);
            this.units.delete(id);
        }
    }

    // 單位收工：材質係逐個單位 clone 出嚟嘅（隊伍染色），唔放就一波兵死一次
    // 漏一批。幾何體係共用嘅，所以唔可以喺呢度 dispose。
    #disposeUnit(u) {
        this.scene.remove(u.obj);
        this.scene.remove(u.bar);
        u.rig.dispose();
        const mats = new Set();
        const skels = new Set();
        for (const root of [u.obj, u.bar]) {
            root.traverse((o) => {
                // 每個 clone 出嚟嘅骨架都有自己一張 bone texture（three r151+）。
                // 實測跑十分鐘之後，場景入面得九張貼圖，但 GPU 揸住一百八十幾張——
                // 差額就係一隻兵一張、死咗都冇放嘅骨架貼圖。
                if (o.isSkinnedMesh && o.skeleton) skels.add(o.skeleton);
                const list = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
                for (const m of list) mats.add(m);
            });
        }
        for (const m of mats) m.dispose();
        for (const sk of skels) sk.dispose?.();
    }

    // ---------- 事件（打擊、施法、死亡…）----------
    #eventFx(ev) {
        const src = this.sim.entities.find(e => e.id === (ev.sourceId ?? ev.id));
        const championId = ev.championId ?? src?.champId ?? src?.def?.id;
        let index = ev.index ?? ev.abilityIndex;
        if (index == null && ev.key && src?.def?.abilities) {
            index = src.def.abilities.findIndex(a => a.key === ev.key);
        }
        return championFx(championId, index != null && index >= 0 ? index : null);
    }

    #consumeEvents(events) {
        const me = this.sim.player;
        for (const ev of events) {
            switch (ev.type) {
                case 'attack': {
                    const u = this.units.get(ev.id);
                    if (!u) break;
                    const e = u.entity;
                    // 揮劍要快，唔可以拉到成個冷卻咁長。攻擊間隔係 1.5 秒，
                    // 之前就將一下揮擊攤開喺 1.1 秒度播——即係全程慢動作，
                    // 睇落好似永遠喺度舉劍、由頭到尾都未斬落去。真遊戲係
                    // 「斬得快，然後等」，唔係「慢慢斬足個冷卻」。
                    const rate = e.kind === 'champ' ? this.sim.stats(e).attackSpeed : e.attackSpeed;
                    const gap = 1 / Math.max(0.2, rate);
                    u.rig.once(this.assets, u.look.attack, Math.min(0.42, gap * 0.75));
                    // 揮擊軌跡。喺呢個俯視距離，一個 1.7 米高嘅角色揮劍嘅骨骼動作
                    // 佔唔到幾多像素，實測就係「乜都見唔到」。真遊戲靠武器拖影
                    // 交代呢一下——所以近戰畫一道弧，遠程／法術喺出手位置閃一下。
                    const t = this.sim.entities.find(x => x.id === ev.target);
                    if (!t) break;
                    const melee = e.range < 5;
                    const profile = e.kind === 'champ' ? championFx(e.def.id) : {
                        style: melee ? 'minion-slash' : 'minion-shot',
                        family: melee ? 'guard' : 'arrow',
                        colour: u.look.ringColour ?? 0xffe9c4, accent: 0xffffff,
                    };
                    this.fx.attack(e.x, e.z, t.x, t.z, profile);
                    break;
                }
                case 'hit': {
                    const src = this.sim.entities.find(e => e.id === ev.id);
                    const t = this.sim.entities.find(e => e.id === ev.target);
                    if (!src || !t) break;
                    const profile = src.kind === 'champ' ? championFx(src.def.id) : {
                        style: 'minion-impact', family: 'guard', colour: 0xffe9c4,
                        accent: 0xffffff, sides: 6, rays: 3,
                    };
                    this.fx.hit(t.x, t.z, profile, t.kind === 'champ' ? 1 : 0.75);
                    break;
                }
                case 'cast': this.#onCast(ev); break;
                case 'damage': {
                    const hit = this.units.get(ev.target);
                    if (hit && ev.amount >= 1) this.#flashUnit(hit);
                    if (ev.target === me.id && ev.amount > this.sim.stats(me).maxHp * 0.06) {
                        this.shake = Math.min(0.9, (this.shake ?? 0) + 0.35);
                    }
                    // 只出玩家打人同玩家食嘢嘅數字。全場都出嘅話，
                    // 一波兵開打就會有幾十個數字浮住，反而咩都睇唔到。
                    const t = this.sim.entities.find(x => x.id === ev.target);
                    if (!t || ev.amount < 1) break;
                    if (ev.source === me.id) this.fx.number(t.x, t.z, ev.amount, 'mine');
                    else if (ev.target === me.id) this.fx.number(t.x, t.z, ev.amount, 'damage');
                    break;
                }
                case 'heal': {
                    const t = this.sim.entities.find(x => x.id === ev.target);
                    if (!t) break;
                    this.fx.heal(t.x, t.z);
                    if (ev.target === me.id) this.fx.number(t.x, t.z, ev.amount, 'heal');
                    break;
                }
                case 'boom': {
                    const profile = this.#eventFx(ev);
                    if (profile) this.fx.cue(ev.x, ev.z, profile, {
                        life: 0.58, radius: ev.radius * (profile.impact ?? 1),
                        kind: 'ability-impact', impact: true,
                    });
                    else {
                        this.fx.flash(ev.x, ev.z, ev.radius, 0xffd08a);
                        this.fx.ring(ev.x, ev.z, ev.radius, 0xffb055,
                            { life: 0.45, from: 0.4, to: 1.05 });
                    }
                    break;
                }
                // 單體技能：由施法者拉一道光去受者，再喺受者度爆一下。
                // 一個「隔空指一指就跌血」嘅技能，唔畫呢兩下就等於冇施放過。
                case 'strike': {
                    const src = this.units.get(ev.sourceId);
                    const profile = this.#eventFx(ev);
                    const colour = ev.ally ? 0x8fe9c0
                        : (profile?.colour ?? src?.look.ringColour ?? 0xffd27a);
                    if (src) {
                        this.fx.streak(src.obj.position.x, src.obj.position.z, ev.x, ev.z,
                            colour, profile ?? {});
                    }
                    if (profile) this.fx.cue(ev.x, ev.z, profile, {
                        life: 0.48, radius: ev.ally ? 2.2 : 2.6,
                        kind: ev.ally ? 'ally-impact' : 'ability-impact', impact: true,
                    });
                    else {
                        this.fx.flash(ev.x, ev.z, ev.ally ? 2.2 : 2.6, colour, 0.32);
                        this.fx.ring(ev.x, ev.z, ev.ally ? 2.0 : 2.4, colour,
                            { life: 0.42, from: 0.35, to: 1.25 });
                    }
                    break;
                }
                case 'abilityImpact': {
                    const profile = this.#eventFx(ev);
                    if (profile) this.fx.cue(ev.x, ev.z, profile, {
                        life: 0.4, radius: (ev.radius ?? 1.6) * (profile.impact ?? 1),
                        kind: 'ability-impact', impact: true,
                    });
                    break;
                }
                case 'telegraph': {
                    const profile = this.#eventFx(ev);
                    this.fx.telegraph(ev.x, ev.z, ev.radius, ev.delay,
                        profile?.colour ?? 0xff6a4a, profile);
                    break;
                }
                // 地面區域用施法者嘅代表色，唔好成場都係同一橙色
                case 'zone': {
                    const src = this.units.get(ev.sourceId);
                    const profile = this.#eventFx(ev);
                    this.fx.zone(ev.x, ev.z, ev.radius,
                        profile?.colour ?? src?.look.ringColour ?? 0xff8a4a,
                        ev.duration ?? 4, null, profile);
                    break;
                }
                case 'trap': {
                    const profile = this.#eventFx(ev);
                    this.fx.zone(ev.x, ev.z, ev.radius, profile?.colour ?? 0x63c98a,
                        ev.duration ?? 6, null, profile);
                    break;
                }
                case 'trapFire': {
                    const profile = this.#eventFx(ev);
                    if (profile) this.fx.cue(ev.x, ev.z, profile, {
                        life: 0.44, radius: ev.radius ?? 3, kind: 'ability-impact', impact: true,
                    });
                    else this.fx.ring(ev.x, ev.z, 3, 0x9a6ad6, { life: 0.4 });
                    break;
                }
                case 'tower': this.#towerFell(ev); break;
                case 'levelup': {
                    const u = this.units.get(ev.id);
                    if (u) this.fx.ring(u.obj.position.x, u.obj.position.z, 2.4, 0xffe27a,
                        { life: 0.6, from: 0.3, to: 1.4 });
                    break;
                }
                case 'warden': {
                    const t = this.sim.entities.find(x => x.id === ev.target);
                    if (t) {
                        this.fx.ring(t.x, t.z, 2.6, 0xffe9a8, { life: 0.7, from: 0.4, to: 1.6 });
                        this.fx.flash(t.x, t.z, 2.6, 0xffe9a8, 0.4);
                    }
                    break;
                }
                default: break;
            }
        }
    }

    // 受擊閃一下：唔知自己有冇打中，係打擊感最大嘅缺口。
    // 用 emissive 唔用換材質——材質已經係逐個單位 clone 出嚟，改返轉頭好平。
    #flashUnit(u) {
        if (u.flashUntil > this.fxTime) return;      // 已經閃緊就唔重複
        u.flashUntil = this.fxTime + 0.12;
        u.model.traverse((o) => {
            const m = o.material;
            if (!m?.emissive) return;
            if (!u.baseEmissive) u.baseEmissive = new Map();
            if (!u.baseEmissive.has(m)) u.baseEmissive.set(m, m.emissive.clone());
            m.emissive.setRGB(0.55, 0.42, 0.38);
        });
    }

    #clearFlashes() {
        for (const [, u] of this.units) {
            if (!u.baseEmissive || u.flashUntil > this.fxTime) continue;
            for (const [m, c] of u.baseEmissive) m.emissive.copy(c);
            u.baseEmissive = null;
        }
    }

    // 施法：動作 + 按形態出視覺 + 報返個技能名畀玩家知撳咗咩
    #onCast(ev) {
        const u = this.units.get(ev.id);
        if (!u) return;
        const e = u.entity;
        const ab = e.def.abilities[ev.index];
        if (u.look.abilityClip) {
            u.rig.once(this.assets, u.look.abilityClip[ev.index] ?? u.look.attack, 0.55);
        }
        const colour = u.look.ringColour ?? 0xffd27a;
        const x = u.obj.position.x, z = u.obj.position.z;
        const profile = championFx(e.def.id, ev.index) ?? {
            style: `${e.def.id}-${ab.key}`, family: ab.form, colour, accent: 0xffffff,
            sides: 10, rings: 1, rays: 4,
        };
        // 一招一個穩定剪影；self 技會跟住角色留低，其他招先喺起手位打一個短 cue，
        // 命中／落地再由 strike、zone、boom、abilityImpact 畫第二拍。
        const self = ab.form === 'self';
        this.fx.cue(x, z, profile, {
            life: self ? (ab.duration ?? 2.5) : 0.5,
            radius: self ? Math.min(5.2, ab.radius ?? 2.5) : 1.8,
            follow: self ? e : null,
            kind: 'ability-cast',
        });
        switch (ab.form) {
            case 'self': break;
            case 'dash':
                // 記住起點，等下一幀單位真係彈開咗先畫殘影：
                // 施法嗰刻佢仲未郁，即刻畫嘅話係一條零長度嘅線。
                u.dashFrom = { x, z, colour, profile };
                break;
            default: break;
        }
        if (e.isPlayer) this.onCast(ab);
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
            this.fx.flash(e.x, e.z, 7, 0xd8c48a, 0.5);
            this.fx.ring(e.x, e.z, 7, 0xd8c48a, { life: 0.9, from: 0.3, to: 1.4 });
        }
    }

    // ---------- 彈道 ----------
    #makeProjectile(p) {
        const src = this.sim.entities.find(e => e.id === p.sourceId);
        const profile = src?.kind === 'champ'
            ? championFx(src.def.id, p.skill ? p.abilityIndex : null) : null;
        const shape = profile?.projectile ?? p.kind ?? 'bolt';
        const colour = profile?.colour ?? (p.skill ? 0xffd27a : 0xffe9c4);
        const accent = profile?.accent ?? colour;
        const g = new THREE.Group();
        const solid = (c) => new THREE.MeshBasicMaterial({ color: c });
        const glow = (c, opacity = 0.28) => new THREE.MeshBasicMaterial({ color: c,
            transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });

        if (shape.startsWith('arrow')) {
            const ultimate = shape === 'arrow-ultimate';
            const heavy = ultimate || shape === 'arrow-heavy';
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(heavy ? 0.13 : 0.085, heavy ? 0.13 : 0.085,
                    ultimate ? 2.8 : heavy ? 2.2 : 1.65, 6), solid(colour));
            const tip = new THREE.Mesh(
                new THREE.ConeGeometry(heavy ? 0.32 : 0.22, heavy ? 0.72 : 0.48, 5), solid(accent));
            tip.position.y = ultimate ? 1.72 : heavy ? 1.35 : 1.03;
            const fletchA = new THREE.Mesh(
                new THREE.BoxGeometry(heavy ? 0.72 : 0.48, 0.28, 0.06), glow(accent, 0.78));
            fletchA.position.y = ultimate ? -1.35 : heavy ? -1.05 : -0.77;
            const fletchB = fletchA.clone(); fletchB.rotation.y = Math.PI / 2;
            g.add(shaft, tip, fletchA, fletchB);
            if (ultimate) {
                for (const y of [-0.55, 0.25]) {
                    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.055, 5, 12), glow(accent, 0.62));
                    halo.rotation.x = Math.PI / 2; halo.position.y = y; g.add(halo);
                }
            }
        } else if (shape.startsWith('ember')) {
            const fast = shape === 'ember-fast';
            const core = new THREE.Mesh(new THREE.SphereGeometry(fast ? 0.42 : 0.34, 10, 7), solid(accent));
            const shell = new THREE.Mesh(new THREE.SphereGeometry(fast ? 0.78 : 0.62, 9, 6), glow(colour, 0.34));
            const tail = new THREE.Mesh(new THREE.ConeGeometry(fast ? 0.38 : 0.3, fast ? 1.8 : 1.3, 7), glow(colour, 0.42));
            tail.rotation.z = Math.PI; tail.position.y = fast ? -1.05 : -0.78;
            g.add(core, shell, tail);
        } else if (shape.startsWith('holy')) {
            const lance = shape === 'holy-lance';
            const core = new THREE.Mesh(
                new THREE.CapsuleGeometry(lance ? 0.3 : 0.2, lance ? 2.5 : 1.55, 5, 8), solid(colour));
            const shell = new THREE.Mesh(
                new THREE.CapsuleGeometry(lance ? 0.62 : 0.42, lance ? 2.8 : 1.8, 5, 8), glow(accent, 0.28));
            g.add(core, shell);
            const count = lance ? 3 : 1;
            for (let i = 0; i < count; i++) {
                const halo = new THREE.Mesh(new THREE.TorusGeometry(lance ? 0.55 : 0.38, 0.05, 5, 12),
                    glow(accent, 0.7));
                halo.rotation.x = Math.PI / 2;
                halo.position.y = (i - (count - 1) / 2) * 0.78;
                g.add(halo);
            }
        } else {
            const core = new THREE.Mesh(
                new THREE.CapsuleGeometry(p.skill ? 0.4 : 0.16, p.skill ? 1.8 : 1.5, 6, 10), solid(colour));
            const shell = new THREE.Mesh(
                new THREE.CapsuleGeometry(p.skill ? 0.85 : 0.4, p.skill ? 2.1 : 1.7, 6, 10),
                glow(accent, p.skill ? 0.3 : 0.22));
            g.add(core, shell);
        }
        g.userData.prev = new THREE.Vector2(p.x, p.z);
        g.userData.fxStyle = profile?.style ?? `projectile-${shape}`;
        g.userData.fxFamily = profile?.family ?? shape;
        g.userData.projectileShape = shape;
        return g;
    }

    #disposeProjectile(o) {
        this.scene.remove(o);
        o.traverse((part) => { part.geometry?.dispose(); part.material?.dispose(); });
    }

    #syncProjectiles() {
        const seen = new Set();
        this.sim.projectiles.forEach((p, i) => {
            const key = p.__vid ?? (p.__vid = `p${i}_${Math.random()}`);
            seen.add(key);
            let o = this.projectiles.get(key);
            if (!o) {
                // 箭、火、聖光各自有實際幾何剪影；唔再係所有技能一條同色膠囊。
                o = this.#makeProjectile(p);
                this.scene.add(o);
                this.projectiles.set(key, o);
            }
            // 方向：技能彈有 vx/vz，普攻箭係追蹤型冇方向向量，
            // 所以用「上一幀到今幀」嘅位移推返出嚟。
            const prev = o.userData.prev;
            let dx = p.vx ?? (p.x - prev.x);
            let dz = p.vz ?? (p.z - prev.y);
            if (Math.abs(dx) < 1e-5 && Math.abs(dz) < 1e-5) { dx = o.userData.dx ?? 1; dz = o.userData.dz ?? 0; }
            o.userData.dx = dx; o.userData.dz = dz;
            prev.set(p.x, p.z);
            o.position.set(p.x, 1.4, p.z);
            o.quaternion.setFromUnitVectors(
                UP, TMP_DIR.set(dx, 0, dz).normalize());
        });
        for (const [k, o] of this.projectiles) {
            if (seen.has(k)) continue;
            this.#disposeProjectile(o);
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
    // 跟住玩家沿住 x 軸行。打橫由 +z 望入去，兵線橫住成個畫面。
    //
    // 打直就唔可以照搬。橋面淨係 17 米闊，而要睇到大約 25 米兵線就要 25 米
    // 嘅橫向視野；430×860 嘅螢幕高係闊嘅兩倍，於是縱向視野變成 50 米——
    // 量出嚟橋面只佔畫面 16.4%，其餘 83.6% 係深淵同水。試過純粹將鏡頭
    // 扯高扯近（h50 d18 fov48），橋面只升到 23.5%，而兵線可見闊度由
    // 26.9 米跌到 23.9 米：換嚟嘅唔抵。
    //
    // 真正嘅答案係轉軸：打直嗰陣將鏡頭繞 Y 轉九十度，令長嗰條地圖軸對正
    // 長嗰條螢幕軸。自己嘅基地喺畫面下、敵方喺畫面上，同大部分手機 MOBA
    // 嘅直向版一樣。
    setCameraFocus(x) { this.camFocus = x; }

    // 鏡頭嘅偏航角（弧度）。0 = 打橫嘅原本角度；-π/2 = 打直，望向 +x。
    // input.js 要攞呢個角去轉搖桿嘅方向，所以佢係 view 嘅公開狀態。
    get camYaw() { return this.portrait ? -Math.PI / 2 : 0; }

    // 縮放：一條 124 米嘅線，固定鏡頭只見到大約一半。
    // 拉遠係「我睇下前面有咩嚟緊」，拉近係「我而家要打得準」。
    zoomBy(factor) {
        this.camZoom = Math.min(1.7, Math.max(0.7, (this.camZoom ?? 1) * factor));
        this.resize();
    }

    #camera(dt) {
        const p = this.sim.player;
        // 死咗就跟最近嘅隊友，冇隊友就跟兵線——原本會定格喺屍體度，
        // 玩家等重生嗰十幾秒完全睇唔到場上發生緊咩事。
        let want = this.camFocus;
        if (p?.alive) want = p.x;
        else {
            const mate = this.sim.champions
                .filter(c => c.alive && c.team === p.team)
                .sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0];
            if (mate) want = mate.x;
            else {
                const mine = this.sim.entities.filter(e => e.alive && e.kind === 'minion' && e.team === p.team);
                if (mine.length) want = mine.reduce((a, b) => a + b.x, 0) / mine.length;
            }
        }
        this.camFocus += (want - this.camFocus) * approach(4, dt);
        const limit = MAP.fountainX - 4;
        const fx = Math.max(-limit, Math.min(limit, this.camFocus));
        // 鏡頭震：食到重手先震，唔係下下都震，否則反而睇唔清
        this.shake = Math.max(0, (this.shake ?? 0) - dt * 3.2);
        const s = this.shake * this.shake;
        const jx = (Math.random() - 0.5) * s * 1.4;
        const jy = (Math.random() - 0.5) * s * 1.4;
        const zoom = this.camZoom ?? 1;
        // 鏡頭企喺焦點後面 camDepth 米、高 camHeight 米，方向由 camYaw 決定。
        // yaw = 0 就係原本嘅 (0, H, D)；yaw = -π/2 就變成 (-D, H, 0)，即係企喺
        // 藍方嗰邊望向 +x —— 敵方基地喺畫面上方。
        const yaw = this.camYaw;
        const back = this.camDepth * zoom;
        const ox = Math.sin(yaw) * back;
        const oz = Math.cos(yaw) * back;
        // 望遠少少過焦點。打橫得 1.5 米，因為兵線本來就橫住成個畫面。
        // 打直就要望多啲前面：條線係垂直嘅，玩家應該企喺畫面下三分一，
        // 上面留返嚟睇緊有咩推緊過嚟。
        const lookAhead = this.portrait ? 2 : 1.5;
        this.camera.position.set(fx + ox + jx, this.camHeight * zoom + jy, oz);
        this.camera.lookAt(fx - Math.sin(yaw) * lookAhead, 1.5, -Math.cos(yaw) * lookAhead);
        this.sun.position.set(fx - 30, 60, 40);
        this.sun.target.position.set(fx, 0, 0);
        this.sun.target.updateMatrixWorld();
    }

    resize() {
        const c = this.renderer.domElement;
        const w = c.clientWidth || window.innerWidth;
        const h = c.clientHeight || window.innerHeight;
        const cfg = View.QUALITY[this.quality] ?? View.QUALITY.medium;
        const dpr = Math.min(window.devicePixelRatio || 1, cfg.dpr);
        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(w, h, false);
        this.composer?.setPixelRatio(dpr);
        this.composer?.setSize(w, h);
        this.camera.aspect = w / h;
        // 打直嗰陣鏡頭已經轉咗軸（見 setCameraFocus 上面），長嘅螢幕軸對正
        // 長嘅地圖軸，所以唔使再為咗塞條兵線入去而拉到咁遠。
        this.portrait = this.camera.aspect < 1;
        this.camHeight = this.portrait ? 32 : 30;
        this.camDepth = this.portrait ? 16 : 28;
        this.camera.fov = this.portrait ? 44 : 47;
        this.camera.updateProjectionMatrix();
    }

    // events：呢一幀入面所有 sim step 收埋一齊嘅事件（見 main.js 嘅註解）
    update(dt, events = []) {
        this.fxTime = (this.fxTime ?? 0) + dt;
        this.#consumeEvents(events);
        this.#clearFlashes();
        this.#syncUnits(dt);
        this.#syncStructures();
        this.#syncProjectiles();
        this.fx.update(dt);
        if (this.rangeRing) {
            const p = this.sim.player;
            this.rangeRing.visible = p.alive;
            this.rangeRing.position.set(p.x, 0.05, p.z);
            this.rangeRing.scale.setScalar(p.range);
        }
        this.#camera(dt);
        for (const c of this.clouds ?? []) {
            c.obj.position.x += c.speed * dt;
            if (c.obj.position.x > 110) c.obj.position.x = -110;
        }
        if (this.contextLost) return;
        this.#watchFrames(dt);
        if (this.bloomPass?.enabled) this.composer.render();
        else this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        for (const [, u] of this.units) this.#disposeUnit(u);
        this.units.clear();
        for (const [, o] of this.projectiles) this.#disposeProjectile(o);
        this.projectiles.clear();
        this.fx.dispose();
        this.renderer.dispose();
    }
}
