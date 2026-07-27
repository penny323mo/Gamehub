// 連續 3D 賽道。Catmull-Rom 曲線同 Uint8Array 格網各有一份工：
//
//   - 曲線生成玩家真正見到嘅連續柏油、路肩、起跑線同金屬護欄；
//   - 格網只做碰撞、落草、檢查點同測試，唔再直接變成畫面上嘅像素地板。
//
// 呢個分層刻意保留成熟嘅賽車規則，同時唔需要靠將 BLOCK 無限縮細嚟扮
// 平滑。視覺 mesh 沿弧長取樣，手機端三角形反而比舊 voxel renderer 少。

import * as THREE from 'three';

// BLOCK 只係物理／查詢格網精度；畫面精度由 VISUAL_STEP 控制。
export const BLOCK = 0.25;
const ROAD_HALF_W = 14;              // 路面半闊（世界單位）→ 全闊 28
const KERB_W = 2;                    // 紅白路肩闊度
const GRASS_W = 6;                   // 外欄位置不變，擴闊部分由草地讓畀行車面
const WALL_W = 3;                    // 欄杆帶闊度
const WALL_H = 2.5;                  // 欄杆高度（世界單位）
const ASPHALT_HALF_W = ROAD_HALF_W - KERB_W;
const RAIL_OFFSET = ROAD_HALF_W + GRASS_W + WALL_W * 0.5;
const VISUAL_STEP = 1.25;
export const ROAD_HALF = Math.round(ROAD_HALF_W / BLOCK);

// 物理地表種類。code 係幕後格網入面存嘅數字（0 = 空）
const KINDS = [
    null,
    { name: 'road', color: 0x4a4a52 },
    { name: 'line', color: 0xe8e2c8 },   // 中線虛線
    { name: 'kerbA', color: 0xd6483b },  // 紅白路肩
    { name: 'kerbB', color: 0xf2f2f2 },
    { name: 'grass', color: 0x5aa04a },
    { name: 'dirt', color: 0x8a6a3a },
    { name: 'water', color: 0x3b7fd4 },
    { name: 'wall', color: 0x9aa0a8 },   // 欄杆：企高，一眼睇到係邊界
    { name: 'start', color: 0x1c1c1c },
    { name: 'startB', color: 0xf4f4f4 },
];
const C = {};
KINDS.forEach((k, i) => { if (k) C[k.name] = i; });
const DRIVABLE = new Set([C.road, C.line, C.start, C.startB, C.kerbA, C.kerbB]);

const _surfaceTextures = new Map();
function surfaceTexture(kind) {
    if (_surfaceTextures.has(kind)) return _surfaceTextures.get(kind);
    const N = 128, data = new Uint8Array(N * N * 4);
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            const i = y * N + x;
            const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            const n = seed - Math.floor(seed);
            let r, g, b;
            if (kind === 'asphalt') {
                const grain = Math.round((n - 0.5) * 22);
                const seam = (x % 47 === 0 && y % 9 < 6) ? -12 : 0;
                r = 62 + grain + seam; g = 64 + grain + seam; b = 68 + grain + seam;
            } else {
                const broad = Math.sin(x * 0.17) * Math.cos(y * 0.13) * 12;
                r = 67 + broad + n * 18; g = 116 + broad + n * 28; b = 53 + broad + n * 13;
            }
            data[i * 4] = Math.max(0, Math.min(255, r));
            data[i * 4 + 1] = Math.max(0, Math.min(255, g));
            data[i * 4 + 2] = Math.max(0, Math.min(255, b));
            data[i * 4 + 3] = 255;
        }
    }
    const tex = new THREE.DataTexture(data, N, N);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    _surfaceTextures.set(kind, tex);
    return tex;
}

export class Track {
    // waypoints：中線座標串；tension 細＝彎位尖（髮夾），大＝圓滑長弧
    constructor(waypoints, tension = 0.5) {
        const pts = waypoints.map(([x, z]) => new THREE.Vector3(x, 0, z));
        this.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', tension);
        this.length = this.curve.getLength();
        // 取樣密度：每半格一個點，確保印路面唔會有窿
        this.samples = Math.ceil(this.length / (BLOCK * 0.5));
        this.#allocGrid(pts);
        this.startT = this.#findStraightStart();
        this.checkpoints = [];
        this.#stampRoad();
        this.#stampSurroundings();
        this.#makeCheckpoints();
    }

    // ---------- 格網 ----------
    #allocGrid(pts) {
        const pad = ROAD_HALF_W + KERB_W + GRASS_W + WALL_W + 6;
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        for (const p of pts) {
            minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
            minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
        }
        this.minCX = Math.floor((minX - pad) / BLOCK);
        this.minCZ = Math.floor((minZ - pad) / BLOCK);
        this.gw = Math.ceil((maxX + pad) / BLOCK) - this.minCX + 1;
        this.gh = Math.ceil((maxZ + pad) / BLOCK) - this.minCZ + 1;
        this.grid = new Uint8Array(this.gw * this.gh);
        this.cellCount = 0;
    }

    #idx(cx, cz) {
        const x = cx - this.minCX, z = cz - this.minCZ;
        if (x < 0 || z < 0 || x >= this.gw || z >= this.gh) return -1;
        return z * this.gw + x;
    }
    #get(cx, cz) { const i = this.#idx(cx, cz); return i < 0 ? 0 : this.grid[i]; }
    #set(cx, cz, code, force = false) {
        const i = this.#idx(cx, cz);
        if (i < 0) return;
        if (!force && this.grid[i]) return;
        if (!this.grid[i]) this.cellCount++;
        this.grid[i] = code;
    }

    codeAtWorld(x, z) {
        return this.#get(Math.round(x / BLOCK), Math.round(z / BLOCK));
    }
    // 路面／路肩都算「有抓地」；草地同泥地會拖慢
    isDrivable(x, z) { return DRIVABLE.has(this.codeAtWorld(x, z)); }
    isWall(x, z) { return this.codeAtWorld(x, z) === C.wall; }
    // 測試用：搵返第一格指定種類嘅世界座標
    findCell(name) {
        const code = C[name];
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] !== code) continue;
            const cx = (i % this.gw) + this.minCX, cz = Math.floor(i / this.gw) + this.minCZ;
            return [cx * BLOCK, cz * BLOCK];
        }
        return null;
    }

    // ---------- 曲率 ----------
    #radiusAt(t) {
        const d = 0.012;
        const a = this.curve.getPointAt((t + 1 - d) % 1);
        const b = this.curve.getPointAt(t % 1);
        const c = this.curve.getPointAt((t + d) % 1);
        const ab = a.distanceTo(b), bc = b.distanceTo(c), ac = a.distanceTo(c);
        const area = Math.abs((b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z)) / 2;
        return area < 1e-4 ? 1e4 : (ab * bc * ac) / (4 * area);
    }

    // 起跑線一定要擺喺直路上面，而且要打橫過晒條路先似樣。
    // 由 t=0 開始（即係 waypoint 表第一個點）好多時啱啱好落喺彎中，
    // 開波就要即刻扭軚，鏡頭亦都望住欄杆——所以呢度自動搵最直嗰段。
    #findStraightStart() {
        const N = 240;
        let bestT = 0, bestScore = -1;
        for (let i = 0; i < N; i++) {
            const t = i / N;
            // 起跑線前後各留一段：後面 25 米（排位）、前面 60 米（加速區）
            let worst = Infinity;
            for (let d = -25; d <= 60; d += 5) {
                worst = Math.min(worst, this.#radiusAt((t + d / this.length + 1) % 1));
            }
            if (worst > bestScore) { bestScore = worst; bestT = t; }
        }
        this.startStraightR = Math.round(bestScore);
        return bestT;
    }

    // ---------- 印格 ----------
    #stampRoad() {
        const up = new THREE.Vector3(0, 1, 0);
        const tmp = new THREE.Vector3();
        for (let i = 0; i < this.samples; i++) {
            const t = i / this.samples;
            const p = this.curve.getPointAt(t);
            const tan = this.curve.getTangentAt(t);
            const side = tmp.copy(tan).cross(up).normalize();
            for (let w = -ROAD_HALF; w <= ROAD_HALF; w++) {
                const x = p.x + side.x * w * BLOCK;
                const z = p.z + side.z * w * BLOCK;
                const cx = Math.round(x / BLOCK), cz = Math.round(z / BLOCK);
                let code = C.road;
                const wWorld = Math.abs(w) * BLOCK;
                // 取樣間距係 BLOCK/2，所以「幾多個取樣＝幾多世界單位」要除返
                const per = Math.max(1, Math.round(1.5 / (BLOCK * 0.5)));
                if (wWorld > ROAD_HALF_W - KERB_W) {
                    code = (Math.floor(i / per) % 2 === 0) ? C.kerbA : C.kerbB;
                } else if (wWorld < 0.5 && Math.floor(i / (per * 2)) % 2 === 0) {
                    code = C.line;                     // 中線虛線
                }
                this.#set(cx, cz, code, true);
            }
        }
        // 起跑／終點線：一條打橫嘅黑白格，橫跨成條路
        const p0 = this.curve.getPointAt(this.startT);
        const tan0 = this.curve.getTangentAt(this.startT);
        const side0 = new THREE.Vector3().copy(tan0).cross(up).normalize();
        const depth = Math.round(3 / BLOCK);          // 3 個世界單位深
        for (let w = -ROAD_HALF + 1; w <= ROAD_HALF - 1; w++) {
            for (let d = 0; d < depth; d++) {
                const x = p0.x + side0.x * w * BLOCK + tan0.x * d * BLOCK;
                const z = p0.z + side0.z * w * BLOCK + tan0.z * d * BLOCK;
                // 黑白格用世界單位分塊，唔係逐格跳（BLOCK 細咗都仲係睇得出格仔）
                const cell = Math.floor(w * BLOCK / 1.5) + Math.floor(d * BLOCK / 1.5);
                this.#set(Math.round(x / BLOCK), Math.round(z / BLOCK),
                    (Math.abs(cell) % 2 === 0) ? C.start : C.startB, true);
            }
        }
        this.startPos = p0.clone();
        this.startDir = tan0.clone();
    }

    // 由所有路面格做多源 BFS 向外擴：草地緩衝區，再出面先至係欄杆。
    // 之前只留兩格草，跌出路面即刻貼欄，速度被反覆撞擊鎖死——賽車遊戲要有
    // 「衝出去仲救得返」嘅空間，唔係一出界就完。
    #stampSurroundings() {
        const GRASS_DEPTH = Math.round(GRASS_W / BLOCK);
        const WALL_DEPTH = GRASS_DEPTH + Math.round(WALL_W / BLOCK);
        let frontier = [];
        for (let i = 0; i < this.grid.length; i++) if (this.grid[i]) frontier.push(i);
        for (let depth = 1; depth <= WALL_DEPTH; depth++) {
            const next = [];
            const code = depth <= GRASS_DEPTH ? C.grass : C.wall;
            for (const i of frontier) {
                const x = i % this.gw, z = (i - x) / this.gw;
                for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nx = x + dx, nz = z + dz;
                    if (nx < 0 || nz < 0 || nx >= this.gw || nz >= this.gh) continue;
                    const ni = nz * this.gw + nx;
                    if (this.grid[ni]) continue;
                    this.grid[ni] = code;
                    this.cellCount++;
                    next.push(ni);
                }
            }
            frontier = next;
        }
        // 草地上撒少少泥同水，唔好一望無際都係綠色
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i] !== C.grass) continue;
            const x = (i % this.gw) + this.minCX, z = Math.floor(i / this.gw) + this.minCZ;
            const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
            const r = n - Math.floor(n);
            // 斑塊用「大格」判斷，唔係逐格——BLOCK 縮細之後逐格撒會變雜訊
            const bx = Math.floor(x * BLOCK / 2), bz = Math.floor(z * BLOCK / 2);
            const m = Math.sin(bx * 45.164 + bz * 23.14) * 43758.5453;
            const rb = m - Math.floor(m);
            if (rb > 0.94) this.grid[i] = C.dirt;
            else if (rb > 0.91) this.grid[i] = C.water;
            else if (r > 0.995) this.grid[i] = C.dirt;
        }
    }

    // 賽道自身最近間距：唔同段落貼得太近，檢查點同落點判斷都會出事。
    minSelfClearance() {
        const N = 200, pts = [];
        for (let i = 0; i < N; i++) pts.push(this.curve.getPointAt(i / N));
        let best = Infinity;
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const along = Math.min(j - i, N - (j - i));
                if (along < N * 0.08) continue;
                const d = pts[i].distanceTo(pts[j]);
                if (d < best) best = d;
            }
        }
        return best;
    }

    // 檢查點：由起跑線開始沿賽道平均分佈，用嚟防止兜路兼計圈
    #makeCheckpoints(count = 12) {
        for (let i = 0; i < count; i++) {
            const t = (this.startT + i / count) % 1;
            const p = this.curve.getPointAt(t);
            const tan = this.curve.getTangentAt(t);
            this.checkpoints.push({ pos: p.clone(), dir: tan.clone(), t });
        }
    }

    // 車喺賽道邊個位置（0..1）——用嚟判斷方向啱唔啱同計進度
    nearestT(x, z) {
        let bestT = 0, bestD = Infinity;
        const N = 240;
        for (let i = 0; i < N; i++) {
            const t = i / N;
            const p = this.curve.getPointAt(t);
            const d = (p.x - x) ** 2 + (p.z - z) ** 2;
            if (d < bestD) { bestD = d; bestT = t; }
        }
        return bestT;
    }

    // ---------- 連續視覺 mesh ----------
    #stripGeometry(offsetA, offsetB, y = 0) {
        const pos = [], uv = [], idx = [];
        const up = new THREE.Vector3(0, 1, 0);
        const segments = this.visualSegments;
        for (let i = 0; i <= segments; i++) {
            const t = (i % segments) / segments;
            const p = this.curve.getPointAt(t);
            const side = this.curve.getTangentAt(t).cross(up).normalize();
            pos.push(
                p.x + side.x * offsetA, y, p.z + side.z * offsetA,
                p.x + side.x * offsetB, y, p.z + side.z * offsetB,
            );
            const along = i / segments * this.length / 5;
            uv.push(along, 0, along, 1);
        }
        for (let i = 0; i < segments; i++) {
            const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
            idx.push(a, b, c, b, d, c);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        return geo;
    }

    #buildRoad() {
        const mat = new THREE.MeshStandardMaterial({
            color: 0x777b80, map: surfaceTexture('asphalt'),
            roughness: 0.88, metalness: 0.02,
        });
        const mesh = new THREE.Mesh(this.#stripGeometry(-ASPHALT_HALF_W, ASPHALT_HALF_W, 0.015), mat);
        mesh.name = 'smooth-asphalt';
        mesh.receiveShadow = true;
        return mesh;
    }

    // 路肩每段獨立頂點，紅白之間唔會被 vertex interpolation 溝成粉紅。
    #buildKerbs() {
        const pos = [], col = [], idx = [];
        const up = new THREE.Vector3(0, 1, 0);
        const red = new THREE.Color(0xc62828), white = new THREE.Color(0xf4f1e8);
        let v = 0;
        const addBand = (p0, s0, p1, s1, a, b, color) => {
            pos.push(
                p0.x + s0.x * a, 0.035, p0.z + s0.z * a,
                p0.x + s0.x * b, 0.035, p0.z + s0.z * b,
                p1.x + s1.x * a, 0.035, p1.z + s1.z * a,
                p1.x + s1.x * b, 0.035, p1.z + s1.z * b,
            );
            for (let k = 0; k < 4; k++) col.push(color.r, color.g, color.b);
            idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
            v += 4;
        };
        for (let i = 0; i < this.visualSegments; i++) {
            const t0 = i / this.visualSegments, t1 = (i + 1) / this.visualSegments;
            const p0 = this.curve.getPointAt(t0), p1 = this.curve.getPointAt(t1 % 1);
            const s0 = this.curve.getTangentAt(t0).cross(up).normalize();
            const s1 = this.curve.getTangentAt(t1 % 1).cross(up).normalize();
            const color = Math.floor(i * this.length / this.visualSegments / 2.5) % 2 ? white : red;
            addBand(p0, s0, p1, s1, -ROAD_HALF_W, -ASPHALT_HALF_W, color);
            addBand(p0, s0, p1, s1, ASPHALT_HALF_W, ROAD_HALF_W, color);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
            vertexColors: true, roughness: 0.7, metalness: 0.02,
        }));
        mesh.name = 'continuous-kerbs';
        mesh.receiveShadow = true;
        return mesh;
    }

    #buildStartLine() {
        const pos = [], col = [], idx = [];
        const up = new THREE.Vector3(0, 1, 0);
        const p = this.startPos, tan = this.startDir.clone().normalize();
        const side = tan.clone().cross(up).normalize();
        const dark = new THREE.Color(0x17191c), light = new THREE.Color(0xf5f3eb);
        const cell = 1.5, depth = 3;
        let v = 0, row = 0;
        for (let d = 0; d < depth - 0.01; d += cell, row++) {
            let column = 0;
            for (let w = -ASPHALT_HALF_W; w < ASPHALT_HALF_W - 0.01; w += cell, column++) {
                const w1 = Math.min(ASPHALT_HALF_W, w + cell);
                const d1 = Math.min(depth, d + cell);
                const point = (ww, dd) => p.clone().addScaledVector(side, ww).addScaledVector(tan, dd);
                const a = point(w, d), b = point(w1, d), c = point(w, d1), e = point(w1, d1);
                pos.push(a.x, 0.045, a.z, b.x, 0.045, b.z, c.x, 0.045, c.z, e.x, 0.045, e.z);
                const color = (row + column) % 2 ? dark : light;
                for (let k = 0; k < 4; k++) col.push(color.r, color.g, color.b);
                idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2);
                v += 4;
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72 }));
        mesh.name = 'start-finish-line';
        return mesh;
    }

    #offsetCurve(offset, y) {
        const points = [], up = new THREE.Vector3(0, 1, 0);
        const count = Math.max(96, Math.ceil(this.length / 3));
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const p = this.curve.getPointAt(t);
            const side = this.curve.getTangentAt(t).cross(up).normalize();
            points.push(new THREE.Vector3(p.x + side.x * offset, y, p.z + side.z * offset));
        }
        return new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5);
    }

    #buildGuardrails() {
        const group = new THREE.Group();
        group.name = 'metal-guardrails';
        const railSegments = Math.max(128, Math.ceil(this.length / 1.8));
        for (const sign of [-1, 1]) {
            for (const y of [0.68, 1.26]) {
                const geo = new THREE.TubeGeometry(this.#offsetCurve(sign * RAIL_OFFSET, y), railSegments, 0.16, 6, true);
                const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
                    color: 0xc7cdd1, roughness: 0.3, metalness: 0.82,
                }));
                mesh.receiveShadow = true;
                group.add(mesh);
            }
        }

        const spacing = 4.5;
        const perSide = Math.max(32, Math.ceil(this.length / spacing));
        const posts = new THREE.InstancedMesh(
            new THREE.BoxGeometry(0.18, 1.55, 0.18),
            new THREE.MeshStandardMaterial({ color: 0x8f989f, roughness: 0.4, metalness: 0.7 }),
            perSide * 2,
        );
        const up = new THREE.Vector3(0, 1, 0), matrix = new THREE.Matrix4();
        let at = 0;
        for (const sign of [-1, 1]) {
            for (let i = 0; i < perSide; i++) {
                const t = i / perSide;
                const p = this.curve.getPointAt(t);
                const side = this.curve.getTangentAt(t).cross(up).normalize();
                matrix.makeTranslation(p.x + side.x * sign * RAIL_OFFSET, 0.76, p.z + side.z * sign * RAIL_OFFSET);
                posts.setMatrixAt(at++, matrix);
            }
        }
        posts.instanceMatrix.needsUpdate = true;
        group.add(posts);
        this.wallCount = at;
        return group;
    }

    #buildTerrain() {
        const width = this.gw * BLOCK, depth = this.gh * BLOCK;
        const tex = surfaceTexture('grass');
        tex.repeat.set(Math.max(1, width / 18), Math.max(1, depth / 18));
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth),
            new THREE.MeshStandardMaterial({ color: 0x82a968, map: tex, roughness: 1, metalness: 0 }),
        );
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set((this.minCX + this.gw / 2) * BLOCK, -0.07, (this.minCZ + this.gh / 2) * BLOCK);
        mesh.receiveShadow = true;
        mesh.name = 'smooth-terrain';
        return mesh;
    }

    #buildTrees() {
        const group = new THREE.Group();
        group.name = 'trackside-trees';
        const target = 130, positions = [];
        let seed = (this.gw * 73856093 ^ this.gh * 19349663) >>> 0;
        const rnd = () => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            return seed / 4294967296;
        };
        const minX = this.minCX * BLOCK, minZ = this.minCZ * BLOCK;
        const width = this.gw * BLOCK, depth = this.gh * BLOCK;
        for (let tries = 0; tries < 1300 && positions.length < target; tries++) {
            const x = minX + rnd() * width, z = minZ + rnd() * depth;
            const t = this.nearestT(x, z), p = this.curve.getPointAt(t);
            if (Math.hypot(x - p.x, z - p.z) < RAIL_OFFSET + 8) continue;
            positions.push({ x, z, s: 0.75 + rnd() * 0.75 });
        }
        const trunks = new THREE.InstancedMesh(
            new THREE.CylinderGeometry(0.34, 0.48, 3.8, 7),
            new THREE.MeshStandardMaterial({ color: 0x70513a, roughness: 1 }), positions.length,
        );
        const crowns = new THREE.InstancedMesh(
            new THREE.ConeGeometry(2.15, 5.6, 9),
            new THREE.MeshStandardMaterial({ color: 0x315f35, roughness: 0.92 }), positions.length,
        );
        const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
        positions.forEach((p, i) => {
            s.setScalar(p.s);
            m.compose(new THREE.Vector3(p.x, 1.9 * p.s - 0.06, p.z), q, s);
            trunks.setMatrixAt(i, m);
            m.compose(new THREE.Vector3(p.x, 5.4 * p.s - 0.06, p.z), q, s);
            crowns.setMatrixAt(i, m);
        });
        trunks.instanceMatrix.needsUpdate = crowns.instanceMatrix.needsUpdate = true;
        group.add(trunks, crowns);
        this.treeCount = positions.length;
        return group;
    }

    setTimeOfDay(id) {
        this.timeOfDay = id;
        if (!this.visualRoot) return;
        const night = id === 'night';
        const dusk = id === 'dusk';
        const setEmissive = (material, color, intensity) => {
            if (!material?.emissive) return;
            material.emissive.setHex(color);
            material.emissiveIntensity = intensity;
        };

        this.road.material.color.setHex(night ? 0x526071 : dusk ? 0x777277 : 0x777b80);
        setEmissive(this.road.material, night ? 0x172a43 : 0x000000, night ? 0.42 : 0);
        this.ground.material.color.setHex(night ? 0x415c43 : dusk ? 0x7f825d : 0x82a968);
        setEmissive(this.ground.material, night ? 0x101b14 : 0x000000, night ? 0.16 : 0);
        setEmissive(this.kerbs.material, night ? 0x35252d : dusk ? 0x2a160c : 0x000000,
            night ? 0.62 : dusk ? 0.18 : 0);
        setEmissive(this.startLine.material, night ? 0x303744 : 0x000000, night ? 0.5 : 0);

        this.walls.traverse((object) => {
            if (!object.material) return;
            setEmissive(object.material, night ? 0x29476d : dusk ? 0x291d13 : 0x000000,
                night ? 0.95 : dusk ? 0.12 : 0);
        });
        const [trunks, crowns] = this.trees.children;
        trunks?.material?.color.setHex(night ? 0x44372f : dusk ? 0x68503d : 0x70513a);
        crowns?.material?.color.setHex(night ? 0x1d3828 : dusk ? 0x40533a : 0x315f35);
        setEmissive(crowns?.material, night ? 0x07150e : 0x000000, night ? 0.2 : 0);
    }

    build(scene) {
        this.visualStyle = 'smooth-ribbon';
        this.visualSegments = Math.max(320, Math.ceil(this.length / VISUAL_STEP));
        this.visualRoot = new THREE.Group();
        this.visualRoot.name = 'smooth-racing-circuit';
        this.ground = this.#buildTerrain();
        this.road = this.#buildRoad();
        this.kerbs = this.#buildKerbs();
        this.startLine = this.#buildStartLine();
        this.walls = this.#buildGuardrails();
        this.trees = this.#buildTrees();
        this.visualRoot.add(this.ground, this.road, this.kerbs, this.startLine, this.walls, this.trees);
        scene.add(this.visualRoot);
        this.setTimeOfDay(this.timeOfDay ?? 'day');
        this.groundQuads = this.visualSegments;
        return this.road;
    }

    dispose(scene) {
        if (!this.visualRoot) return;
        scene.remove(this.visualRoot);
        const geometries = new Set(), materials = new Set();
        this.visualRoot.traverse((o) => {
            if (o.geometry) geometries.add(o.geometry);
            if (Array.isArray(o.material)) o.material.forEach(m => materials.add(m));
            else if (o.material) materials.add(o.material);
        });
        geometries.forEach(g => g.dispose());
        materials.forEach(m => m.dispose()); // surface DataTexture 係 app 共用，唔喺度 dispose
        this.visualRoot.clear();
        this.visualRoot = this.ground = this.road = this.kerbs = this.startLine = this.walls = this.trees = null;
    }
}
