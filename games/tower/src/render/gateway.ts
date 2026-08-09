import * as THREE from 'three';
import { MAP, GRAPHICS, SURFACE_Y } from '../core/config';
import { buildPathWorld, cellToWorld } from '../core/path';
import { 取同步 } from './assets';

// 條路兩頭嘅嘢：**入口一對門，出口一座城堡**。
//
// 換咗真磚之後，條路兩頭係就咁斷咗喺度——怪由一格空地行出嚟，行到另一格空地
// 就消失。玩家睇唔出「呢度係佢哋出嚟嘅位」同「呢度係我要守嘅位」，而呢兩件事
// 係一隻塔防最核心嘅兩個地方。
//
// 兩邊都用 Kenney fantasy town kit（CC0，同 TD kit 一樣係一單位格，量過）：
//
//  • **出生門**：一個門框加**兩塊真門板**，各自繞自己嗰條邊轉。每次出怪就
//    「啪」一聲揈開再慢慢閂返，同時閃一下光。開門嘅時機唔係計時器夾出嚟，
//    係由 `enemySpawned` 事件推——一隻怪一次，唔會有出咗怪但道門冇郁。
//  • **終點城堡**：牆＋屋頂＋旗，加一條**血量條**。條血量條唔係 HUD 上面
//    嗰個數嘅副本，佢就係擺喺你要守嗰個位上面，望住個場就知仲剩幾多。

const 門開角 = Math.PI * 0.62;      // 揈到幾開
const 門開時間 = 0.18;              // 揈開幾快（秒）
const 門閂時間 = 0.85;              // 閂返幾耐

interface 門 {
    node: THREE.Object3D;
    閂角: number;
    方向: 1 | -1;
}

export class Gateway {
    private scene: THREE.Scene;
    private 門扇: 門[] = [];
    private 開度 = 0;               // 0 = 閂晒，1 = 開晒
    private 閃 = 0;                 // 1 → 0
    private 閃燈: THREE.PointLight | null = null;
    private 光環: THREE.Mesh | null = null;
    private 光幕: THREE.Mesh | null = null;
    private 光柱: THREE.Mesh | null = null;
    private 血條: THREE.Mesh | null = null;
    private 血條底: THREE.Mesh | null = null;
    private 血條長 = 2.1;
    private 血條位 = new THREE.Vector3();
    private 上次命 = -1;
    private 旗: THREE.Object3D[] = [];
    private 入口組: THREE.Group | null = null;
    private 城堡組: THREE.Group | null = null;
    private 城堡頂 = 0;
    private time = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /** 開場前預載嘅清單——由呢度出，唔好兩邊各寫一份。 */
    static 清單(): string[] {
        return [
            'structures/wallDoorwaySquareWide.glb', 'structures/wallDoor.glb',
            'structures/pillarStone.glb', 'structures/wallArch.glb',
            'structures/wall.glb', 'structures/wallWindowRound.glb',
            'structures/wallCorner.glb', 'structures/roofHighPoint.glb',
            'structures/bannerRed.glb', 'structures/bannerGreen.glb',
            'structures/lantern.glb', 'structures/stairsStone.glb',
        ];
    }

    build(): void {
        this.buildSpawnGate();
        this.buildGoalKeep();
    }

    // ── 入口：一對門 ──
    private buildSpawnGate(): void {
        const [c, r] = MAP.spawnCell;
        const pos = cellToWorld(c, r);
        const 組 = new THREE.Group();
        組.name = 'spawn-gate';
        // 門要**打橫攔住條路**：條路由呢格去下一格嗰個方向，就係穿過道門嘅方向。
        //
        // `wallDoorwaySquareWide` 嘅**薄身係 X 軸**（量過：0.1 × 1.0 × 1.0），
        // 即係塊牆本身企喺 YZ 平面、法線指住 ±X。所以除咗轉去路嘅方向之外
        // 仲要**加多 90°**，先至係「牆攔住條路、門口對正你行嘅方向」。
        // 唔加嗰陣道門係打側企喺路邊，而個光幕會埋咗入塊牆入面——
        // 實測就係咁：`閃` 讀到 0.82，但門口嗰笪像素**一點都冇光咗**。
        const route = buildPathWorld();
        const 入口位 = route[0] ?? pos;
        const 下pos = route[1] ?? cellToWorld(MAP.path[1]?.[0] ?? c, MAP.path[1]?.[1] ?? r);
        // 門係場外建築，門口先對住第一格；擺正喺第一格中心會成座壓住路面。
        組.position.set(入口位.x, SURFACE_Y, 入口位.z);
        // 模型牆身法線係 local +X；將 +X 對住條路方向。
        組.rotation.y = Math.atan2(下pos.x - 入口位.x, 下pos.z - 入口位.z) - Math.PI / 2;
        // 舊比例開門時足足闊 3.53 格、高 4.14 格，搶晒成個畫面。
        組.scale.setScalar(0.85);
        this.scene.add(組);
        this.入口組 = 組;

        // 門框（牆上開一個闊方口）——薄身，所以打橫擺喺格中間。
        const 框 = 取同步('structures/wallDoorwaySquareWide.glb');
        框.scale.setScalar(1.45);
        中心XZ(框);
        染(框, 0xd8dde3, 0x9aa4ae);
        組.add(框);

        // 兩條柱夾住，令道門睇落係一件建築唔係一片牆。
        for (const s of [-1, 1]) {
            const 柱 = 取同步('structures/pillarStone.glb');
            柱.scale.set(1.35, 1.75, 1.35);
            中心XZ(柱);
            // wall 模型薄軸係 X、闊軸係 Z，所以左右係 Z，唔係 X。
            柱.position.z += s * 0.72;
            染(柱, 0xe2e6ea, 0xa6b0b9);
            組.add(柱);

            const 燈 = 取同步('structures/lantern.glb');
            燈.scale.setScalar(0.9);
            中心XZ(燈);
            燈.position.y = 1.72;
            燈.position.z += s * 0.72;
            組.add(燈);
        }

        // 兩塊門板：各自掛喺自己嗰條邊，繞邊轉——所以要用一個 pivot。
        for (const s of [-1, 1] as const) {
            const 樞 = new THREE.Group();
            樞.position.set(0, 0, s * 0.66);
            組.add(樞);

            const 板 = 取同步('structures/wallDoor.glb');
            // 原件係一整扇 1 格闊嘅門；兩塊各收成半扇，再由門鉸推向中線。
            // 舊版兩塊都係 1.3 格闊兼疊埋一齊，開門時先會橫跨三格幾。
            板.scale.set(1.3, 1.45, 0.65);
            中心XZ(板);
            板.position.z -= s * 0.33;
            染(板, 0xc98a4b, 0x8d5c2e);
            樞.add(板);

            this.門扇.push({ node: 樞, 閂角: 0, 方向: s });
        }

        // 出怪嗰下閃一閃：一盞燈 ＋ 一個由門口擴散出嚟嘅光環。
        // 淨靠一盞點光唔夠——喺呢個亮度嘅場入面睇落只係「稍為光咗少少」。
        this.閃燈 = new THREE.PointLight(0x9beeff, 0, 12, 1.2);
        this.閃燈.position.set(0, 0.9, 0);
        組.add(this.閃燈);

        // 光環平躺喺地上，由細擴到大同時淡出——一眼睇得出「有嘢出咗嚟」。
        const 環 = new THREE.Mesh(
            new THREE.RingGeometry(0.30, 0.62, 44),
            new THREE.MeshBasicMaterial({
                color: 0xa8f2ff, transparent: true, opacity: 0,
                side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
            }),
        );
        環.rotation.x = -Math.PI / 2;
        環.position.y = 0.28;
        組.add(環);
        this.光環 = 環;

        // 門口嗰浸光幕：怪就係由呢度行出嚟。
        const 幕 = new THREE.Mesh(
            new THREE.PlaneGeometry(1.35, 1.55),
            new THREE.MeshBasicMaterial({
                color: 0x9deeff, transparent: true, opacity: 0.16,
                side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
            }),
        );
        幕.rotation.y = Math.PI / 2;      // 對正門口（塊牆法線係 ±X）
        幕.position.set(0, 0.66, 0);
        組.add(幕);
        this.光幕 = 幕;

        // 一枝向上射嘅光柱：俯視角度下，平躺喺地嘅環好易畀建築遮住，
        // 而一枝企起身嘅柱點都望得到。
        const 柱光 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.26, 0.4, 2.4, 18, 1, true),
            new THREE.MeshBasicMaterial({
                color: 0xb7f4ff, transparent: true, opacity: 0,
                side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
            }),
        );
        柱光.position.set(0, 1.2, 0);
        組.add(柱光);
        this.光柱 = 柱光;
    }

    // ── 出口：城堡＋血量條 ──
    private buildGoalKeep(): void {
        const [c, r] = MAP.goalCell;
        const pos = cellToWorld(c, r);
        const 組 = new THREE.Group();
        組.name = 'goal-keep';
        // 面向條路入嚟嘅方向
        const 前 = MAP.path[MAP.path.length - 2] ?? MAP.path[MAP.path.length - 1];
        const 前pos = cellToWorld(前[0], 前[1]);
        const 城堡位 = endpointOutside(pos, 前pos, 0.38);
        // 同入口一樣，主體企出場外，入口先接住最後一格。舊版中心壓正尾格，
        // 2.7×2.7 格嘅 footprint 令敵人似穿牆入去。
        組.position.set(城堡位.x, SURFACE_Y, 城堡位.z);
        組.rotation.y = Math.atan2(前pos.x - pos.x, 前pos.z - pos.z);
        組.scale.setScalar(1.0);
        this.scene.add(組);
        this.城堡組 = 組;

        // 一圈矮牆，正面（local +Z，面向條路）用拱門。牆模型薄軸係 X：
        // 左右牆唔轉，前後牆先轉 90°。舊版啱啱調轉，四件砌成 L 形。
        const 牆位: [string, number, number, number][] = [
            ['structures/wall.glb', -0.5, 0, 0],
            ['structures/wall.glb', 0.5, 0, 0],
            ['structures/wall.glb', 0, -0.5, Math.PI / 2],
            ['structures/wallArch.glb', 0, 0.5, Math.PI / 2],
        ];
        for (const [rel, dx, dz, ry] of 牆位) {
            const w = 取同步(rel);
            w.scale.setScalar(1.0);
            w.rotation.y = ry;
            中心XZ(w);
            w.position.x += dx;
            w.position.z += dz;
            染(w, 0xdde2e7, 0x9fa9b2);
            組.add(w);
        }

        // 主樓：牆再疊一層，加尖頂。
        const 樓 = new THREE.Group();
        樓.position.y = 1.0;
        組.add(樓);
        const 樓牆: [number, number, number][] = [
            [-0.31, 0, 0], [0.31, 0, 0],
            [0, -0.31, Math.PI / 2], [0, 0.31, Math.PI / 2],
        ];
        for (const [dx, dz, ry] of 樓牆) {
            const w = 取同步('structures/wall.glb');
            w.scale.set(0.64, 0.8, 0.64);
            w.rotation.y = ry;
            中心XZ(w);
            w.position.x += dx;
            w.position.z += dz;
            染(w, 0xe8ecef, 0xacb5bd);
            樓.add(w);
        }
        const 頂 = 取同步('structures/roofHighPoint.glb');
        頂.scale.setScalar(0.78);
        中心XZ(頂);
        頂.position.y = 0.8;
        染頂(頂, 0xe0503f, 0xff7b66);
        樓.add(頂);

        // 兩支旗，會慢慢飄——望落唔會死實實。
        for (const s of [-1, 1]) {
            const f = 取同步('structures/bannerGreen.glb');
            f.scale.setScalar(0.9);
            中心XZ(f);
            f.position.x += s * 0.62;
            f.position.y = 1.05;
            f.position.z -= 0.42;
            組.add(f);
            this.旗.push(f);
        }

        // 血量條：擺喺城堡上面，唔係 HUD 嘅副本，係守緊嗰個位嘅狀態。
        //
        // **要掛喺 scene 根，唔可以掛入個城堡 group。** 個 group 為咗面向條路
        // 轉咗 Y，抄鏡頭 quaternion 落一個轉咗向嘅 parent 入面，出嚟嘅世界朝向
        // 係「parent 轉向 × 鏡頭轉向」——即係永遠都唔會正對鏡頭。第一版就係咁，
        // 條 bar 側到剩返一條線。
        組.updateWorldMatrix(true, true);
        const 城堡頂 = new THREE.Box3().setFromObject(組).max.y;
        this.城堡頂 = 城堡頂;
        const 條位 = new THREE.Vector3(城堡位.x, 城堡頂 + 0.22, 城堡位.z);
        const 底 = new THREE.Mesh(
            new THREE.PlaneGeometry(this.血條長 + 0.14, 0.3),
            new THREE.MeshBasicMaterial({ color: 0x140b0b, transparent: true, opacity: 0.85, depthTest: false, depthWrite: false }),
        );
        底.position.copy(條位);
        底.renderOrder = 900;
        this.scene.add(底);
        this.血條底 = 底;

        const 條 = new THREE.Mesh(
            new THREE.PlaneGeometry(this.血條長, 0.2),
            // **要 `transparent: true`。** three.js 係先畫晒不透明物件，再畫透明嗰批，
            // 而 `renderOrder` 只喺同一批入面排先後。條綠 bar 唔設 transparent 就
            // 變咗喺不透明批入面先畫，跟住半透明嘅黑底喺後面畫，反而蓋住咗佢
            // ——實測就係咁：`血條闊` 讀到 1（即係有畫），但畫面上淨係見到黑底。
            new THREE.MeshBasicMaterial({ color: 0x54e06a, transparent: true, opacity: 1, depthTest: false, depthWrite: false }),
        );
        條.position.copy(條位);
        條.renderOrder = 901;
        this.scene.add(條);
        this.血條 = 條;
        this.血條位 = 條位;
    }

    /** 出咗一隻怪：揈開道門，閃一下。 */
    開門(): void {
        this.開度 = 1;
        this.閃 = 1;
    }

    update(dt: number, lives: number, maxLives: number, camera: THREE.Camera): void {
        this.time += dt;

        // 開度：揈開快、閂返慢。用時間常數，唔跟幀率。
        const 目標 = 0;
        const 速 = this.開度 > 目標 ? dt / 門閂時間 : dt / 門開時間;
        this.開度 = Math.max(0, this.開度 - 速);
        const 角 = 門開角 * easeOut(this.開度);
        for (const d of this.門扇) d.node.rotation.y = d.閂角 + 角 * d.方向;

        // 閃光衰減
        this.閃 = Math.max(0, this.閃 - dt / 0.55);
        // 舊值 60 配 6.2× 光環，連續出怪時會變成一大團純白，門本身完全睇唔到。
        if (this.閃燈) this.閃燈.intensity = this.閃 * this.閃 * 4.5;
        if (this.光環) {
            const t = 1 - this.閃;                      // 0 → 1
            const s2 = 0.75 + t * 3.2;
            this.光環.scale.set(s2, s2, 1);
            (this.光環.material as THREE.MeshBasicMaterial).opacity = this.閃 * 0.3;
        }
        if (this.光柱) {
            const m = this.光柱.material as THREE.MeshBasicMaterial;
            m.opacity = this.閃 * 0.12;
            const w = 0.7 + (1 - this.閃) * 0.8;
            this.光柱.scale.set(w, 1, w);
            this.光柱.visible = this.閃 > 0.01;
        }
        if (this.光幕) {
            const m = this.光幕.material as THREE.MeshBasicMaterial;
            m.opacity = 0.07 + this.閃 * 0.26 + Math.sin(this.time * 2.6) * 0.015;
        }

        // 旗飄
        for (let i = 0; i < this.旗.length; i += 1) {
            this.旗[i].rotation.y = Math.sin(this.time * 1.1 + i * 1.7) * 0.22;
        }

        // 血量條：由左邊縮，唔係由中間縮——縮向中間睇落好似兩邊都輸緊。
        if (this.血條 && this.血條底) {
            if (lives !== this.上次命) {
                this.上次命 = lives;
                const f = maxLives > 0 ? Math.max(0, Math.min(1, lives / maxLives)) : 0;
                this.血條.scale.x = Math.max(0.001, f);
                const mat = this.血條.material as THREE.MeshBasicMaterial;
                mat.color.setHex(f > 0.6 ? 0x54e06a : f > 0.28 ? 0xe0c144 : 0xe05a4a);
            }
            // 條 bar 要成日望住鏡頭。掛咗喺 scene 根，所以直接抄鏡頭轉向就啱。
            this.血條底.quaternion.copy(camera.quaternion);
            this.血條.quaternion.copy(camera.quaternion);
            // 縮嘅時候要跟住鏡頭嘅「右」方向偏，唔係跟世界 X。
            const 右 = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            const f = this.血條.scale.x;
            this.血條.position.copy(this.血條位).addScaledVector(右, -(this.血條長 * (1 - f)) / 2);
        }
    }

    /** 量度用：開關狀態同建築定位，讓測試守住兩邊唔再壓住路面。 */
    狀態(): {
        開度: number; 閃: number; 門角: number[]; 血條闊: number;
        入口位: [number, number]; 城堡位: [number, number]; 門樞位: [number, number][];
        城堡頂: number; 血條Y: number;
    } {
        const 入 = this.入口組?.position;
        const 城 = this.城堡組?.position;
        return {
            開度: +this.開度.toFixed(3),
            閃: +this.閃.toFixed(3),
            門角: this.門扇.map((d) => +d.node.rotation.y.toFixed(3)),
            血條闊: +(this.血條?.scale.x ?? -1).toFixed(3),
            入口位: [+( 入?.x ?? 0).toFixed(3), +(入?.z ?? 0).toFixed(3)],
            城堡位: [+( 城?.x ?? 0).toFixed(3), +(城?.z ?? 0).toFixed(3)],
            門樞位: this.門扇.map((d) => [+d.node.position.x.toFixed(3), +d.node.position.z.toFixed(3)]),
            城堡頂: +this.城堡頂.toFixed(3),
            血條Y: +(this.血條位.y ?? 0).toFixed(3),
        };
    }
}

const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);

/** 將端點建築沿住「遠離條路」方向推到場外，支援日後換一條唔係橫向嘅路。 */
function endpointOutside(endpoint: { x: number; z: number }, neighbour: { x: number; z: number }, distance: number): { x: number; z: number } {
    const dx = endpoint.x - neighbour.x;
    const dz = endpoint.z - neighbour.z;
    const len = Math.hypot(dx, dz) || 1;
    return { x: endpoint.x + (dx / len) * distance, z: endpoint.z + (dz / len) * distance };
}

/** Kenney 呢批牆件原點貼住一邊；擺位前先將幾何中心搬返模型原點。 */
function 中心XZ(root: THREE.Object3D): void {
    root.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.x -= center.x;
    root.position.z -= center.z;
}

/** 石同木換色——同 towerRenderer 一樣，clone 過先改，唔好改到共用嗰份。 */
function 染(root: THREE.Object3D, 石: number, 深: number): void {
    root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const 舊 = Array.isArray(m.material) ? m.material : [m.material];
        const 新 = 舊.map((mm) => {
            const mat = mm as THREE.MeshStandardMaterial;
            if (!/^(stone|stoneDark|wood|woodDark)$/.test(mat.name)) return mat;
            const c = mat.clone();
            c.color.setHex(/Dark$/.test(mat.name) ? 深 : 石);
            if (GRAPHICS.enableShadows) m.castShadow = true;
            return c;
        });
        m.material = Array.isArray(m.material) ? 新 : 新[0];
    });
}

function 染頂(root: THREE.Object3D, 深: number, 淺: number): void {
    root.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const 舊 = Array.isArray(m.material) ? m.material : [m.material];
        const 新 = 舊.map((mm) => {
            const mat = mm as THREE.MeshStandardMaterial;
            if (!/^roofRed/.test(mat.name)) return mat;
            const c = mat.clone();
            c.color.setHex(mat.name === 'roofRedLight' ? 淺 : 深);
            return c;
        });
        m.material = Array.isArray(m.material) ? 新 : 新[0];
    });
}
