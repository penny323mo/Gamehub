import * as THREE from 'three';
import { MAP, GRAPHICS } from '../core/config';
import { cellToWorld } from '../core/path';
import { 取, 預載 } from './assets';
import { pathTiles } from './tileset';

const COLOR_BUILDABLE = 0x43774a;
const COLOR_PATH = 0xb68856;
const COLOR_GRID_LINE = 0x31573a;
const COLOR_SPAWN = 0x63c8ff;
const COLOR_GOAL = 0xff6e56;

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
        const { cols, rows, cellSize, origin } = MAP;

        this.buildSkyDome();
        this.buildTerrainUnderlay();

        const 鋪 = pathTiles(MAP.path);
        await 預載([
            'tiles/tile.glb',
            ...new Set(鋪.map((t) => `tiles/${t.model}.glb`)),
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

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const pos = cellToWorld(c, r);
                const t = 路格.get(`${c},${r}`);
                const model = await 取(t ? `tiles/${t.model}.glb` : 'tiles/tile.glb');
                model.position.set(pos.x, 0, pos.z);
                model.rotation.y = t ? t.rotationY : 0;
                this.scene.add(model);

                const pick = new THREE.Mesh(pickGeo, pickMat);
                pick.rotation.x = -Math.PI / 2;
                pick.position.set(pos.x, 0.201, pos.z);
                pick.userData = { col: c, row: r, type: 'ground' };
                this.scene.add(pick);
                this.groundMeshes.push(pick);
            }
        }

        // 磚只有 0.2 厚，底下要有嘢托住，唔係側視就見到浮喺半空。
        // 高度要放喺磚**底下**：底板 0.34 厚，中心擺 -0.18 即係頂面啱啱 -0.01，
        // 唔會浸過磚面。擺錯咗（-0.02）個頂面就去到 0.15，成塊地變咗一浸平色。
        const boardGeo = new THREE.BoxGeometry(cols * cellSize + 0.9, 0.34, rows * cellSize + 0.9);
        const boardMat = GRAPHICS.isMobile
            ? new THREE.MeshBasicMaterial({ color: 0x4a7a3f })
            : new THREE.MeshStandardMaterial({ color: 0x4a7a3f, roughness: 0.95, metalness: 0 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.set(origin.x + cols * cellSize / 2, -0.18, origin.z + rows * cellSize / 2);
        board.receiveShadow = true;
        this.scene.add(board);

        this.buildBoardFrame(board.position);
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

            const boardDx = Math.max(0, Math.abs(x - centerX) - MAP.cols * 0.52);
            const boardDz = Math.max(0, Math.abs(z - centerZ) - MAP.rows * 0.52);
            const edgeDistance = Math.sqrt(boardDx * boardDx + boardDz * boardDz);
            const envelope = THREE.MathUtils.smoothstep(edgeDistance, 0.25, GRAPHICS.terrain.underlayPadding);

            const waveA = Math.sin(x * 0.22) * Math.cos(z * 0.18) * 0.16;
            const waveB = Math.sin((x + z) * 0.11) * 0.12;
            const height = (waveA + waveB) * envelope - 0.58;
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

    private buildBoardFrame(boardPosition: THREE.Vector3): void {
        const frameGeo = new THREE.BoxGeometry(MAP.cols + 1.35, 0.2, MAP.rows + 1.35);
        const frameMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x2f4d33 })
            : new THREE.MeshStandardMaterial({ color: 0x2f4d33, roughness: 0.8, metalness: 0 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.copy(boardPosition);
        frame.position.y = -0.34;
        frame.receiveShadow = true;
        this.scene.add(frame);
    }

    private addRoadSegment(
        mid: THREE.Vector3,
        length: number,
        width: number,
        height: number,
        y: number,
        angle: number,
        material: THREE.Material
    ): void {
        const segment = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), material);
        segment.position.copy(mid);
        segment.position.y = y;
        segment.rotation.y = angle;
        segment.receiveShadow = true;
        this.scene.add(segment);
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

        const borderSize = GRAPHICS.isMobile ? 5 : 9;
        const treeDensity = GRAPHICS.isMobile ? 0.18 : 0.34;
        const rockDensity = GRAPHICS.isMobile ? 0.06 : 0.14;

        for (let c = -borderSize; c < cols + borderSize; c++) {
            for (let r = -borderSize; r < rows + borderSize; r++) {
                if (c >= -1 && c <= cols && r >= -1 && r <= rows) continue;
                const 骰 = 種(c, r, 1);
                let 揀: string | null = null;
                if (骰 < treeDensity) 揀 = 樹[種(c, r, 2) < 0.62 ? 0 : 1];
                else if (骰 < treeDensity + rockDensity) 揀 = 石[種(c, r, 3) < 0.6 ? 0 : 1];
                else if (骰 < treeDensity + rockDensity + 0.02) 揀 = 晶[種(c, r, 4) < 0.7 ? 0 : 1];
                if (!揀) continue;

                const pos = cellToWorld(c, r);
                const o = await 取(揀);
                o.position.set(
                    pos.x + (種(c, r, 5) - 0.5) * cellSize * 0.8,
                    0,
                    pos.z + (種(c, r, 6) - 0.5) * cellSize * 0.8,
                );
                o.rotation.y = 種(c, r, 7) * Math.PI * 2;
                o.scale.setScalar(0.8 + 種(c, r, 8) * 0.9);
                this.scene.add(o);
            }
        }
    }

    private buildDistantSilhouettes(): void {
        const ridgeGeo = new THREE.ConeGeometry(2.8, 6.5, 4);
        const ridgeMat = GRAPHICS.isMobile
            ? new THREE.MeshLambertMaterial({ color: 0x102318 })
            : new THREE.MeshStandardMaterial({ color: 0x102318, roughness: 0.95, metalness: 0.01 });
        const radiusX = MAP.cols * 0.75;
        const radiusZ = MAP.rows * 0.95;
        const centerX = MAP.origin.x + MAP.cols * MAP.cellSize / 2;
        const centerZ = MAP.origin.z + MAP.rows * MAP.cellSize / 2;
        const count = GRAPHICS.isMobile ? 8 : 18;

        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 2;
            const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
            ridge.position.set(
                centerX + Math.cos(t) * (radiusX + 10 + Math.random() * 5),
                1.8 + Math.random() * 0.9,
                centerZ + Math.sin(t) * (radiusZ + 10 + Math.random() * 5)
            );
            ridge.scale.setScalar(0.8 + Math.random() * 1.2);
            ridge.rotation.y = Math.random() * Math.PI * 2;
            ridge.castShadow = false;
            ridge.receiveShadow = true;
            this.scene.add(ridge);
        }
    }
}
