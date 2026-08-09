import * as THREE from 'three';
import { MAP, GRAPHICS, SURFACE_Y } from '../core/config';
import { cellToWorld } from '../core/path';
import { LAYOUT } from '../core/mapLayout';
import { 取, 預載 } from './assets';
import { pathTiles } from './tileset';

const COLOR_BUILDABLE = 0x43774a;
const COLOR_PATH = 0xb68856;
const COLOR_GRID_LINE = 0x31573a;
const COLOR_SPAWN = 0x63c8ff;
const COLOR_GOAL = 0xff6e56;

interface ModelPlacement {
    position: THREE.Vector3;
    rotationY: number;
    scale: number;
}

export class SceneManager {
    scene: THREE.Scene;
    groundMeshes: THREE.Mesh[] = [];

    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x123122);
    }

    /**
     * 鋪地。
     *
     * 本來呢度係 240 個 `BoxGeometry`，路用色分：泥色係路、綠色係空地，跟住再
     * 用一堆程序幾何砌出生門同終點堡壘。而家全部換成 Kenney 嗰套 CC0 磚——
     * 磚本身啱啱好一格（量過：1.000 × 1.000，而 cellSize 就係 1），所以唔使縮放。
     *
     * 用邊塊磚、轉幾多度，由 `tileset.ts` 純函數答；佢揀嘅嘢有 `tests/tiles.mjs`
     * 守住「格同格接得上」。呢度只負責擺。
     */
    async buildGround(): Promise<void> {
        const { cellSize } = MAP;

        this.buildSkyDome();
        this.buildTerrainUnderlay();

        const 鋪 = pathTiles(MAP.path, MAP.pathTileOverrides);
        const 地貌模型 = LAYOUT.cells.flatMap((cell) => cell.terrain ? [`tiles/${cell.terrain.model}.glb`] : []);
        await 預載([
            'tiles/tile.glb',
            ...new Set(鋪.map((t) => `tiles/${t.model}.glb`)),
            ...new Set(地貌模型),
            'scenery/detail_tree.glb', 'scenery/detail_treeLarge.glb',
            'scenery/detail_rocks.glb', 'scenery/detail_rocksLarge.glb',
            'scenery/detail_crystal.glb', 'scenery/detail_crystalLarge.glb',
        ]);

        // 路格擺路磚，其餘擺草地磚。`groundMeshes` 仲要畀 picking 用嚟認格，
        // 所以每格照樣要有一個帶 userData 嘅 mesh——擺一塊睇唔到嘅平面頂上去，
        // 唔好靠 raycast 打中 GLB 入面隨便一個 sub-mesh（嗰啲冇 userData）。
        const 路格 = new Map(鋪.map((t) => [`${t.col},${t.row}`, t]));
        const pickGeo = new THREE.PlaneGeometry(cellSize, cellSize);
        const pickMat = new THREE.MeshBasicMaterial({ visible: false });
        const groundBatches = new Map<string, ModelPlacement[]>();

        this.buildIslandFoundation();
        for (const cell of LAYOUT.cells) {
            const { col: c, row: r } = cell;
            const pos = cellToWorld(c, r);
            const t = 路格.get(`${c},${r}`);
            const terrain = cell.terrain;
            const modelName = t?.model ?? terrain?.model ?? 'tile';
            const rotK = t?.rotK ?? terrain?.rotK ?? 0;
            // Bridge asset is 0.3 high while every gameplay surface is 0.2. Lower
            // it by 0.1 so its deck meets the road and enemies do not sink into it.
            const rel = `tiles/${modelName}.glb`;
            const batch = groundBatches.get(rel) ?? [];
            batch.push({
                position: new THREE.Vector3(pos.x, modelName === 'tile_riverBridge' ? -0.1 : 0, pos.z),
                rotationY: (rotK * Math.PI) / 2,
                scale: 1,
            });
            groundBatches.set(rel, batch);

            // Keep one cheap semantic marker per cell for browser diagnostics. The GLB
            // meshes themselves are instanced below; rendering 148 full clones cost
            // hundreds of draw calls even though all geometry/materials were shared.
            const marker = new THREE.Group();
            marker.name = `ground:${c},${r}:${modelName}`;
            marker.position.set(pos.x, 0, pos.z);
            this.scene.add(marker);

            const pick = new THREE.Mesh(pickGeo, pickMat);
            pick.rotation.x = -Math.PI / 2;
            pick.position.set(pos.x, SURFACE_Y + 0.001, pos.z);
            pick.userData = { col: c, row: r, type: 'ground' };
            this.scene.add(pick);
            this.groundMeshes.push(pick);
        }
        await this.addInstancedModelBatches(groundBatches, 'ground-batch');
        await this.buildScenery();
        this.buildDistantSilhouettes();
    }

    private buildSkyDome(): void {
        const seg = GRAPHICS.isMobile ? 8 : 24;
        const skyGeo = new THREE.SphereGeometry(80, seg, seg);
        const skyMat = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            uniforms: {
                topColor: { value: new THREE.Color(0x1e4a35) },
                midColor: { value: new THREE.Color(0x255a42) },
                bottomColor: { value: new THREE.Color(0x446238) },
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 midColor;
                uniform vec3 bottomColor;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition).y * 0.5 + 0.5;
                    vec3 color = mix(bottomColor, midColor, smoothstep(0.05, 0.45, h));
                    color = mix(color, topColor, smoothstep(0.5, 1.0, h));
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
        });
        this.scene.add(new THREE.Mesh(skyGeo, skyMat));
    }

    private buildTerrainUnderlay(): void {
        // A very large basin sits below the sculpted terrain. Orthographic rays near
        // the lower corners can hit far beyond the detailed mesh; without this safety
        // floor the renderer exposes hard black triangles at the viewport edges.
        const basinGeo = new THREE.PlaneGeometry(240, 240);
        basinGeo.rotateX(-Math.PI / 2);
        const basinMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x315d38 })
            : new THREE.MeshStandardMaterial({ color: 0x173b24, roughness: 1, metalness: 0 });
        const basin = new THREE.Mesh(basinGeo, basinMat);
        basin.position.y = -1.05;
        basin.receiveShadow = true;
        this.scene.add(basin);

        const width = MAP.cols + GRAPHICS.terrain.underlayPadding * 2;
        const depth = MAP.rows + GRAPHICS.terrain.underlayPadding * 2;
        const segments = GRAPHICS.terrain.underlaySegments;
        const terrainGeo = new THREE.PlaneGeometry(width, depth, segments, segments);
        terrainGeo.rotateX(-Math.PI / 2);

        const positions = terrainGeo.attributes.position as THREE.BufferAttribute;
        const colors = new Float32Array(positions.count * 3);
        const centerX = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
        const centerZ = MAP.origin.z + MAP.rows * MAP.cellSize / 2;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i) + centerX;
            const z = positions.getZ(i) + centerZ;

            const { height, envelope } = this.terrainSample(x, z);
            positions.setY(i, height);

            const shade = THREE.MathUtils.clamp(0.5 + envelope * 0.26 + height * 0.12, 0, 1);
            // 本來係 0x1b3320→0x4f7744。換咗真磚之後板面光好多，場外用返舊色
            // 就變成一片黑，啲樹好似浮喺半空——所以底層地形要跟返上去。
            const low = new THREE.Color(0x3c6b41);
            const high = new THREE.Color(0x74a862);
            const color = low.lerp(high, shade);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        terrainGeo.computeVertexNormals();

        const terrainMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ vertexColors: true })
            : new THREE.MeshStandardMaterial({
                vertexColors: true,
                roughness: 0.98,
                metalness: 0.01,
            });

        const terrain = new THREE.Mesh(terrainGeo, terrainMat);
        terrain.receiveShadow = true;
        this.scene.add(terrain);
    }

    /** Height field falls away from the irregular land, not from a rectangular AABB. */
    private terrainSample(x: number, z: number): { height: number; envelope: number } {
        let nearest = Infinity;
        for (const cell of LAYOUT.cells) {
            const p = cellToWorld(cell.col, cell.row);
            nearest = Math.min(nearest, Math.hypot(x - p.x, z - p.z));
        }
        const envelope = THREE.MathUtils.smoothstep(nearest, 0.55, GRAPHICS.terrain.envelopeRadius);
        const waveA = Math.sin(x * 0.22) * Math.cos(z * 0.18) * 0.16;
        const waveB = Math.sin((x + z) * 0.11) * 0.12;
        return { height: (waveA + waveB) * envelope - 0.58, envelope };
    }

    /** Three terrain zones follow the active cells while leaving gameplay tile heights unchanged. */
    private buildIslandFoundation(): void {
        const count = LAYOUT.cells.length;
        const upperGeo = new THREE.BoxGeometry(MAP.cellSize * 1.02, 0.34, MAP.cellSize * 1.02);
        const cliffGeo = new THREE.BoxGeometry(MAP.cellSize, 1, MAP.cellSize);
        const upperMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x4c7743 })
            : new THREE.MeshStandardMaterial({ color: 0x4c7743, roughness: 0.95, metalness: 0 });
        const upper = new THREE.InstancedMesh(upperGeo, upperMat, count);
        upper.name = 'island-soil';
        const dummy = new THREE.Object3D();
        LAYOUT.cells.forEach((cell, i) => {
            const pos = cellToWorld(cell.col, cell.row);
            dummy.position.set(pos.x, -0.17, pos.z);
            dummy.updateMatrix();
            upper.setMatrixAt(i, dummy.matrix);
        });
        upper.instanceMatrix.needsUpdate = true;
        upper.receiveShadow = true;
        this.scene.add(upper);

        for (const region of LAYOUT.regions) {
            const height = 0.26 + region.foundationTier * 0.18;
            const color = new THREE.Color(region.accent).lerp(new THREE.Color(0x17271f), 0.72).getHex();
            const edgeCells = LAYOUT.cells.filter((cell) => cell.region?.id === region.id
                && this.isIslandEdge(cell.col, cell.row));
            const material = GRAPHICS.isMobile
                ? new THREE.MeshLambertMaterial({ color })
                : new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0 });
            const cliff = new THREE.InstancedMesh(cliffGeo, material, edgeCells.length);
            cliff.name = `island-cliff:${region.id}`;
            cliff.userData.foundationTier = region.foundationTier;
            edgeCells.forEach((cell, index) => {
                const pos = cellToWorld(cell.col, cell.row);
                // Deterministic edge erosion breaks the old ruler-straight slab silhouette.
                const hash = Math.abs(Math.imul(cell.col + 19, 73856093) ^ Math.imul(cell.row + 31, 19349663));
                const footprint = 0.94 + (hash % 9) * 0.012;
                dummy.position.set(pos.x, -0.17 - height / 2, pos.z);
                dummy.scale.set(footprint, height, footprint);
                dummy.updateMatrix();
                cliff.setMatrixAt(index, dummy.matrix);
            });
            cliff.instanceMatrix.needsUpdate = true;
            cliff.receiveShadow = true;
            this.scene.add(cliff);
        }

        this.buildRiverRift();
        this.buildKeepMesa();
    }

    private isIslandEdge(col: number, row: number): boolean {
        return !LAYOUT.cellAt(col - 1, row).exists || !LAYOUT.cellAt(col + 1, row).exists
            || !LAYOUT.cellAt(col, row - 1).exists || !LAYOUT.cellAt(col, row + 1).exists;
    }

    /** Low water and rock shoulders continue the configured river through the split island. */
    private buildRiverRift(): void {
        const riverCells = LAYOUT.cells.filter((cell) => cell.terrain?.model.startsWith('tile_river'));
        const bridge = MAP.pathTileOverrides?.find((tile) => tile.model === 'tile_riverBridge');
        const riverCol = bridge?.cell[0] ?? riverCells[0]?.col;
        if (riverCol === undefined) return;
        const riverRows = [
            ...riverCells.map((cell) => cell.row),
            ...(bridge ? [bridge.cell[1]] : []),
        ];
        const minRow = Math.min(...riverRows);
        const maxRow = Math.max(...riverRows);
        const start = cellToWorld(riverCol, minRow);
        const end = cellToWorld(riverCol, maxRow);
        const water = new THREE.Mesh(
            new THREE.PlaneGeometry(0.72, end.z - start.z + MAP.cellSize + 3),
            GRAPHICS.isMobile
                ? new THREE.MeshLambertMaterial({
                    color: 0x50b5b1, emissive: 0x153d3d, emissiveIntensity: 0.35,
                    transparent: true, opacity: 0.82, depthWrite: false,
                })
                : new THREE.MeshStandardMaterial({
                    color: 0x31989b, emissive: 0x12565a, emissiveIntensity: 0.62,
                    roughness: 0.2, metalness: 0.04, transparent: true, opacity: 0.88, depthWrite: false,
                }),
        );
        water.name = 'river-rift:water';
        water.rotation.x = -Math.PI / 2;
        water.position.set(start.x, -0.27, (start.z + end.z) / 2);
        this.scene.add(water);
    }

    /** A tapered third stratum makes the keep read as a separate defensible mesa. */
    private buildKeepMesa(): void {
        const keepRegion = [...LAYOUT.regions].sort((a, b) => b.foundationTier - a.foundationTier)[0];
        if (!keepRegion) return;
        const keepCells = LAYOUT.cells.filter((cell) => cell.region?.id === keepRegion.id
            && this.isIslandEdge(cell.col, cell.row));
        const geometry = new THREE.BoxGeometry(MAP.cellSize * 0.84, 0.42, MAP.cellSize * 0.84);
        const material = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x1d2924 })
            : new THREE.MeshStandardMaterial({ color: 0x1d2924, roughness: 0.98, metalness: 0 });
        const mesa = new THREE.InstancedMesh(geometry, material, keepCells.length);
        mesa.name = 'keep-mesa:lower-stratum';
        const dummy = new THREE.Object3D();
        keepCells.forEach((cell, index) => {
            const pos = cellToWorld(cell.col, cell.row);
            const cliffHeight = 0.26 + keepRegion.foundationTier * 0.18;
            dummy.position.set(pos.x, -0.17 - cliffHeight - 0.13, pos.z);
            dummy.rotation.set(0, 0, 0);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            mesa.setMatrixAt(index, dummy.matrix);
        });
        mesa.instanceMatrix.needsUpdate = true;
        mesa.receiveShadow = true;
        this.scene.add(mesa);
    }

    /**
     * 場外圍嘅樹同石。
     *
     * 本來係圓柱＋圓錐＋十二面體砌嘅樹，而家用返 kit 嘅模型。擺位用**格座標
     * 做種**嘅偽亂數，唔用 `Math.random()`——唔係嘅話每次入場成片樹林都唔同位，
     * 而 restart 之後條路仲要重畫一次，畫面就會跳。
     */
    private async buildScenery(): Promise<void> {
        const { cols, rows, cellSize } = MAP;
        const 種 = (c: number, r: number, k: number) => {
            const n = Math.sin(c * 127.1 + r * 311.7 + k * 74.7) * 43758.5453;
            return n - Math.floor(n);
        };
        const 樹 = ['scenery/detail_tree.glb', 'scenery/detail_treeLarge.glb'];
        const 石 = ['scenery/detail_rocks.glb', 'scenery/detail_rocksLarge.glb'];
        const 晶 = ['scenery/detail_crystal.glb', 'scenery/detail_crystalLarge.glb'];

        /*
         * **個世界要去到鏡頭望得到嗰度為止，唔係去到一個寫死嘅格數為止。**
         *
         * 原本 `borderSize` 係 9（手機 5），即係佈景去到 X ±19、Z ±15 就冇晒。
         * 但個鏡頭 zoom 得出到 `MAX_FRUSTUM = 22`，即係默認嘅 2.2 倍——
         * 實測嗰陣望到嘅係：**由 19 到 33 一條十四單位闊、乜都冇嘅光板地帶**，
         * 再遠處得返 18 枝孤零零嘅圓錐。
         *
         * 即係話：**你一問「廣闊」，個世界就啱啱喺嗰度斷咗。** 望落唔覺大，
         * 唔係因為地方細，係因為望得最遠嗰陣先至見到冇嘢。
         *
         * 所以個範圍由 `CAMERA_REACH` 推出嚟（鏡頭 zoom 到盡、加埋斜視拉長）。
         * 密度跟距離跌：近處照舊，遠處疏——遠景要嘅係輪廓同層次，唔係數量，
         * 而 instance 數要有得封頂。
         */
        const CAMERA_REACH = GRAPHICS.isMobile ? 16 : 27;    // 由地圖邊緣再向外幾多格
        const borderSize = CAMERA_REACH;
        const 近密 = GRAPHICS.isMobile ? 0.18 : 0.34;         // 貼住島嗰圈
        const 遠密 = GRAPHICS.isMobile ? 0.05 : 0.09;         // 最外圈
        const 近石 = GRAPHICS.isMobile ? 0.06 : 0.14;
        const 內圈 = GRAPHICS.isMobile ? 5 : 9;               // 原本嗰個範圍，密度維持原狀
        const batches = new Map<string, ModelPlacement[]>();

        for (let c = -borderSize; c < cols + borderSize; c++) {
            for (let r = -borderSize; r < rows + borderSize; r++) {
                let 近陸地 = false;
                for (let dc = -1; dc <= 1 && !近陸地; dc += 1) {
                    for (let dr = -1; dr <= 1; dr += 1) {
                        if (LAYOUT.cellAt(c + dc, r + dr).exists) { 近陸地 = true; break; }
                    }
                }
                if (近陸地) continue;
                // 離島幾遠（用格數算，唔使開方都夠準）
                const 出界 = Math.max(0, -c, c - (cols - 1), -r, r - (rows - 1));
                const t = Math.min(1, Math.max(0, (出界 - 內圈) / Math.max(1, borderSize - 內圈)));
                const treeDensity = 近密 + (遠密 - 近密) * t;
                const rockDensity = 近石 * (1 - t * 0.72);
                const 骰 = 種(c, r, 1);
                let 揀: string | null = null;
                if (骰 < treeDensity) 揀 = 樹[種(c, r, 2) < 0.62 ? 0 : 1];
                else if (骰 < treeDensity + rockDensity) 揀 = 石[種(c, r, 3) < 0.6 ? 0 : 1];
                else if (骰 < treeDensity + rockDensity + 0.02) 揀 = 晶[種(c, r, 4) < 0.7 ? 0 : 1];
                if (!揀) continue;

                const pos = cellToWorld(c, r);
                const x = pos.x + (種(c, r, 5) - 0.5) * cellSize * 0.8;
                const z = pos.z + (種(c, r, 6) - 0.5) * cellSize * 0.8;
                const batch = batches.get(揀) ?? [];
                batch.push({
                    position: new THREE.Vector3(x, this.terrainSample(x, z).height, z),
                    rotationY: 種(c, r, 7) * Math.PI * 2,
                    scale: 0.8 + 種(c, r, 8) * 0.9,
                });
                batches.set(揀, batch);
            }
        }

        // Reuse the same CC0 rock cluster already present in the scenery instead of a
        // row of procedural spheres: four staggered shoulders frame each river mouth.
        const riverCells = LAYOUT.cells.filter((cell) => cell.terrain?.model.startsWith('tile_river'));
        const bridge = MAP.pathTileOverrides?.find((tile) => tile.model === 'tile_riverBridge');
        if (riverCells.length > 0 || bridge) {
            const riverCol = bridge?.cell[0] ?? riverCells[0].col;
            const rows = [...riverCells.map((cell) => cell.row), ...(bridge ? [bridge.cell[1]] : [])];
            const minRow = Math.min(...rows);
            const maxRow = Math.max(...rows);
            const bank = batches.get('scenery/detail_rocks.glb') ?? [];
            for (const row of [minRow - 1, minRow, maxRow, maxRow + 1]) {
                const p = cellToWorld(riverCol, row);
                for (const side of [-1, 1]) {
                    const hash = Math.abs(row * 17 + side * 13);
                    bank.push({
                        position: new THREE.Vector3(
                            p.x + side * (0.48 + (hash % 3) * 0.08),
                            -0.22,
                            p.z + ((hash % 5) - 2) * 0.08,
                        ),
                        rotationY: hash * 0.83,
                        scale: 0.62 + (hash % 4) * 0.08,
                    });
                }
            }
            batches.set('scenery/detail_rocks.glb', bank);
            const marker = new THREE.Group();
            marker.name = 'river-rift:shoulders';
            this.scene.add(marker);
        }
        await this.addInstancedModelBatches(batches, 'scenery-batch');
    }

    /** Batch static GLB sub-meshes by model while preserving every source transform/material. */
    private async addInstancedModelBatches(batches: Map<string, ModelPlacement[]>, prefix: string): Promise<void> {
        for (const [rel, placements] of batches) {
            if (placements.length === 0) continue;
            const template = await 取(rel);
            template.updateWorldMatrix(true, true);
            let meshIndex = 0;
            template.traverse((object) => {
                const source = object as THREE.Mesh;
                if (!source.isMesh) return;
                const instances = new THREE.InstancedMesh(source.geometry, source.material, placements.length);
                instances.name = `${prefix}:${rel}:${meshIndex++}`;
                const placementMatrix = new THREE.Matrix4();
                const composed = new THREE.Matrix4();
                const quaternion = new THREE.Quaternion();
                const scale = new THREE.Vector3();
                placements.forEach((placement, index) => {
                    quaternion.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, placement.rotationY);
                    scale.setScalar(placement.scale);
                    placementMatrix.compose(placement.position, quaternion, scale);
                    composed.multiplyMatrices(placementMatrix, source.matrixWorld);
                    instances.setMatrixAt(index, composed);
                });
                instances.instanceMatrix.needsUpdate = true;
                instances.castShadow = source.castShadow;
                instances.receiveShadow = source.receiveShadow;
                instances.renderOrder = source.renderOrder;
                this.scene.add(instances);
            });
        }
    }

    private buildDistantSilhouettes(): void {
        const ridgeGeo = new THREE.ConeGeometry(2.6, 5.2, 5);
        const ridgeMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x315d3b })
            : new THREE.MeshStandardMaterial({
                color: 0x294f35, emissive: 0x0b1d12, emissiveIntensity: 0.28,
                roughness: 0.95, metalness: 0.01,
            });
        const radiusX = MAP.cols * 0.75;
        const radiusZ = MAP.rows * 0.95;
        const centerX = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
        const centerZ = MAP.origin.z + MAP.rows * MAP.cellSize / 2;
        const 種 = (i: number, k: number): number => {
            const n = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
            return n - Math.floor(n);
        };

        /*
         * 遠山由**一圈 18 枝**變成**三圈**，而且由 18 個 Mesh 併成一個 InstancedMesh。
         *
         * 兩個理由：
         *  • 一圈孤零零嘅圓錐冇景深。真係望落遠嘅係一重疊一重——近嘅高、清、企得密，
         *    遠嘅矮、淡、疏。三圈唔同半徑同大細就係咁嚟。
         *  • 原本 18 枝係 18 個 draw call。併成 instanced 之後係 **1 個**，
         *    即係加咗兩倍山數，draw call 反而少咗 17 個。**加嘢唔一定要加成本。**
         */
        const 圈 = GRAPHICS.isMobile
            ? [{ 遠: 12, 數: 10, 大: 0.8 }, { 遠: 20, 數: 12, 大: 1.15 }]
            : [{ 遠: 14, 數: 18, 大: 0.85 }, { 遠: 24, 數: 22, 大: 1.25 }, { 遠: 34, 數: 26, 大: 1.75 }];
        const total = 圈.reduce((s, r) => s + r.數, 0);
        const ridges = new THREE.InstancedMesh(ridgeGeo, ridgeMat, total);
        ridges.name = 'distant-ridges';
        ridges.castShadow = false;
        ridges.receiveShadow = true;
        const dummy = new THREE.Object3D();
        let i = 0;
        for (const [ring, { 遠, 數, 大 }] of 圈.entries()) {
            for (let k = 0; k < 數; k += 1) {
                const s = ring * 97 + k;
                // 每圈起角唔同，唔係嘅話三圈會排成一條直線
                const t = ((k + 種(s, 9) * 0.6) / 數) * Math.PI * 2 + ring * 0.7;
                dummy.position.set(
                    centerX + Math.cos(t) * (radiusX + 遠 + 種(s, 1) * 7),
                    1.15 + 種(s, 2) * 0.65 + ring * 0.5,
                    centerZ + Math.sin(t) * (radiusZ + 遠 + 種(s, 3) * 7),
                );
                dummy.scale.setScalar((0.72 + 種(s, 4) * 0.72) * 大);
                dummy.rotation.set(0, 種(s, 5) * Math.PI * 2, 0);
                dummy.updateMatrix();
                ridges.setMatrixAt(i, dummy.matrix);
                i += 1;
            }
        }
        ridges.instanceMatrix.needsUpdate = true;
        this.scene.add(ridges);
    }
}
