// Minecraft 風賽道：成個世界由細方塊砌成（BLOCK 控制格仔大細）。
//
// 做法：先用封閉樣條定義賽道中線，密集取樣，再喺格網度「印」路面；
// 之後由所有路面格做多源 BFS 向外長草地同欄杆。
//
// 兩個令格仔可以縮細嘅設計（Penny 話「一格一格好奇怪，睇吓可唔可以最小化」）：
//
//   1. 格網用 Uint8Array，唔用 Map<string>。BLOCK 0.5 有成十二萬格，
//      每格一條 "x,z" 字串 key 嘅話單係 Map 就食十幾 MB，手機頂唔順。
//   2. 地面唔再逐格畫一個立方體。地面本來就係平嘅——由上面望落去
//      淨係見到頂面，所以每格 2 個三角形就夠（本來 12 個），而且同色
//      嘅格仔可以沿住 x 併埋一條長條。欄杆企高，仍然要真方塊。
//
// 每格嘅光暗差異改用一張 64×64 nearest-filter 噪聲圖，UV 啱啱好一格
// 一個 texel。咁樣手砌質感照樣喺度，但幾何可以併埋——如果將 jitter 直接
// 寫落 vertex color，就會逼住每格獨立，永遠併唔到。

import * as THREE from 'three';

// BLOCK 純粹係「解像度」旋鈕：所有尺寸都用世界單位寫，除返 BLOCK 先變格數。
// 0.25 = 原本嘅四分一。做得到係因為地面同欄杆都併咗條：turbo 由 50 萬格
// 收成 19,594 個 quad ＋ 2,364 條欄杆＝六萬幾個三角形，反而少過未併之前
// 用 0.5 嗰陣嘅二十二萬。
export const BLOCK = 0.25;
const ROAD_HALF_W = 12;              // 路面半闊（世界單位）→ 全闊 24
const KERB_W = 2;                    // 紅白路肩闊度
const GRASS_W = 8;                   // 草地緩衝闊度（衝出去仲救得返）
const WALL_W = 3;                    // 欄杆帶闊度
const WALL_H = 2.5;                  // 欄杆高度（世界單位）
export const ROAD_HALF = Math.round(ROAD_HALF_W / BLOCK);

// 方塊種類。code 係格網入面存嘅數字（0 = 空）
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

// 一格一個 texel 嘅光暗噪聲。整一次就成個 app 共用。
// 128×128：BLOCK 0.25 之下每 32 個世界單位先重複一次，望唔出貼圖接縫。
let _noiseTex = null;
function noiseTexture() {
    if (_noiseTex) return _noiseTex;
    const N = 128, data = new Uint8Array(N * N * 4);
    for (let i = 0; i < N * N; i++) {
        const n = Math.sin(i * 12.9898 + (i % N) * 78.233) * 43758.5453;
        const v = Math.round(238 + ((n - Math.floor(n)) - 0.5) * 34);   // 約 ±7%
        data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v;
        data[i * 4 + 3] = 255;
    }
    _noiseTex = new THREE.DataTexture(data, N, N);
    _noiseTex.wrapS = _noiseTex.wrapT = THREE.RepeatWrapping;
    _noiseTex.magFilter = _noiseTex.minFilter = THREE.NearestFilter;
    _noiseTex.needsUpdate = true;
    return _noiseTex;
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

    // ---------- 砌 mesh ----------
    // 地面：同色格仔沿 x 併成長條，每條 2 個三角形
    #buildGround() {
        const pos = [], col = [], uv = [], idx = [];
        const c = new THREE.Color();
        const half = BLOCK / 2;
        let v = 0;
        for (let z = 0; z < this.gh; z++) {
            let run = 0, runStart = 0;
            const flush = (endX) => {
                if (!run) return;
                const x0 = (runStart + this.minCX) * BLOCK - half;
                const x1 = (endX - 1 + this.minCX) * BLOCK + half;
                const z0 = (z + this.minCZ) * BLOCK - half, z1 = z0 + BLOCK;
                pos.push(x0, 0, z0, x1, 0, z0, x1, 0, z1, x0, 0, z1);
                // UV 一格一個 texel（噪聲圖 64×64，nearest）
                const u0 = (runStart + this.minCX) / 128, u1 = (endX + this.minCX) / 128;
                const w0 = (z + this.minCZ) / 128, w1 = w0 + 1 / 128;
                uv.push(u0, w0, u1, w0, u1, w1, u0, w1);
                c.setHex(KINDS[run].color);
                for (let k = 0; k < 4; k++) col.push(c.r, c.g, c.b);
                idx.push(v, v + 2, v + 1, v, v + 3, v + 2);
                v += 4;
                run = 0;
            };
            for (let x = 0; x < this.gw; x++) {
                const code = this.grid[z * this.gw + x];
                const paint = (code && code !== C.wall) ? code : 0;
                if (paint !== run) { flush(x); run = paint; runStart = x; }
            }
            flush(this.gw);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        this.groundQuads = v / 4;
        return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
            vertexColors: true, map: noiseTexture(),
        }));
    }

    // 欄杆：企高，所以要真方塊。同地面一樣沿 x 併埋成一條條長方體——
    // 欄杆帶有六格深，逐格一個立方體嘅話佢一個就食晒八成三角形，
    // 反而變咗「格仔想縮細」嘅樽頸。併咗之後個數同賽道周長成正比，
    // 唔再同 BLOCK 嘅平方成反比。
    #buildWalls() {
        const geo = new THREE.BoxGeometry(1, WALL_H, BLOCK);   // x 方向之後用 scale 撐長
        const runs = [];
        for (let z = 0; z < this.gh; z++) {
            let start = -1;
            for (let x = 0; x <= this.gw; x++) {
                const isWall = x < this.gw && this.grid[z * this.gw + x] === C.wall;
                if (isWall && start < 0) start = x;
                else if (!isWall && start >= 0) { runs.push([start, x, z]); start = -1; }
            }
        }
        const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial(), runs.length);
        const m = new THREE.Matrix4(), color = new THREE.Color();
        const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
        runs.forEach(([x0, x1, z], j) => {
            const len = (x1 - x0) * BLOCK;
            const cx = (x0 + this.minCX) * BLOCK - BLOCK / 2 + len / 2;
            const cz = (z + this.minCZ) * BLOCK;
            p.set(cx, WALL_H / 2 - BLOCK, cz);
            s.set(len, 1, 1);
            m.compose(p, q, s);
            mesh.setMatrixAt(j, m);
            const nz = Math.sin((x0 + this.minCX) * 45.164 + (z + this.minCZ) * 23.14) * 43758.5453;
            color.setHex(KINDS[C.wall].color).multiplyScalar(1 + ((nz - Math.floor(nz)) - 0.5) * 0.12);
            mesh.setColorAt(j, color);
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        this.wallCount = runs.length;
        return mesh;
    }

    build(scene) {
        this.ground = this.#buildGround();
        this.walls = this.#buildWalls();
        this.ground.receiveShadow = true;
        scene.add(this.ground);
        scene.add(this.walls);
        return this.ground;
    }

    dispose(scene) {
        for (const m of [this.ground, this.walls]) {
            if (!m) continue;
            scene.remove(m);
            m.geometry.dispose();
            m.material.dispose();          // 噪聲圖係共用嘅，唔可以喺度 dispose
        }
        this.ground = this.walls = null;
    }
}
