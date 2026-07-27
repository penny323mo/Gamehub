// Minecraft 風賽道：成個世界由細方塊砌成（BLOCK 控制格仔大細）。
//
// 做法：先用封閉樣條定義賽道中線，密集取樣，再喺格網度「印」路面；
// 之後掃一次格網，路面隔籬嘅空格就變路肩／欄杆。全部方塊塞入同一個
// InstancedMesh（每格一個 instance + instanceColor），所以成條賽道
// 得一個 draw call，手機都跑得郁。

import * as THREE from 'three';

// BLOCK 純粹係「解像度」旋鈕：所有尺寸都用世界單位寫，除返 BLOCK 先變格數。
// 由 2 縮到 1 之後彎位嘅階梯細一半，望落係弧線而唔係鋸齒，方塊感照樣保留。
export const BLOCK = 1;
const ROAD_HALF_W = 12;              // 路面半闊（世界單位）→ 全闊 24
const KERB_W = 2;                    // 紅白路肩闊度
const GRASS_W = 8;                   // 草地緩衝闊度（衝出去仲救得返）
const WALL_W = 3;                    // 欄杆帶闊度
const WALL_H = 2.5;                  // 欄杆高度（世界單位）
export const ROAD_HALF = Math.round(ROAD_HALF_W / BLOCK);

// 方塊種類：色 + 高度（世界單位；地面全部 1 格厚，欄杆企高啲）
const KIND = {
    road:    { color: 0x4a4a52, h: BLOCK },
    line:    { color: 0xe8e2c8, h: BLOCK },   // 中線虛線
    kerbA:   { color: 0xd6483b, h: BLOCK },   // 紅白路肩
    kerbB:   { color: 0xf2f2f2, h: BLOCK },
    grass:   { color: 0x5aa04a, h: BLOCK },
    dirt:    { color: 0x8a6a3a, h: BLOCK },
    wall:    { color: 0x9aa0a8, h: WALL_H },  // 欄杆：企高，一眼睇到係邊界
    start:   { color: 0x1c1c1c, h: BLOCK },
    startB:  { color: 0xf4f4f4, h: BLOCK },
    water:   { color: 0x3b7fd4, h: BLOCK },
};

export class Track {
    // waypoints：中線座標串；tension 細＝彎位尖（髮夾），大＝圓滑長弧
    constructor(waypoints, tension = 0.5) {
        const pts = waypoints.map(([x, z]) => new THREE.Vector3(x, 0, z));
        this.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', tension);
        this.length = this.curve.getLength();
        // 取樣密度：每半格一個點，確保印路面唔會有窿
        this.samples = Math.ceil(this.length / (BLOCK * 0.5));
        this.cells = new Map();          // "x,z" -> kind
        this.checkpoints = [];
        this.#stampRoad();
        this.#stampSurroundings();
        this.#makeCheckpoints();
    }

    key(cx, cz) { return `${cx},${cz}`; }
    cellAtWorld(x, z) {
        return this.cells.get(this.key(Math.round(x / BLOCK), Math.round(z / BLOCK))) ?? null;
    }
    // 路面／路肩都算「有抓地」；草地同泥地會拖慢
    isDrivable(x, z) {
        const k = this.cellAtWorld(x, z);
        return k === 'road' || k === 'line' || k === 'start' || k === 'startB' || k === 'kerbA' || k === 'kerbB';
    }
    isWall(x, z) { return this.cellAtWorld(x, z) === 'wall'; }

    #set(cx, cz, kind, force = false) {
        const k = this.key(cx, cz);
        if (!force && this.cells.has(k)) return;
        this.cells.set(k, kind);
    }

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
                let kind = 'road';
                const wWorld = Math.abs(w) * BLOCK;
                // 取樣間距係 BLOCK/2，所以「幾多個取樣＝幾多世界單位」要除返
                const per = Math.max(1, Math.round(1.5 / (BLOCK * 0.5)));
                if (wWorld > ROAD_HALF_W - KERB_W) {
                    // 路肩紅白間條，跟住沿線距離變色
                    kind = (Math.floor(i / per) % 2 === 0) ? 'kerbA' : 'kerbB';
                } else if (wWorld < BLOCK && Math.floor(i / (per * 2)) % 2 === 0) {
                    kind = 'line';                     // 中線虛線
                }
                this.#set(cx, cz, kind, true);
            }
        }
        // 起跑／終點線：一條黑白格
        const p0 = this.curve.getPointAt(0);
        const tan0 = this.curve.getTangentAt(0);
        const side0 = new THREE.Vector3().copy(tan0).cross(up).normalize();
        const startDepth = Math.max(2, Math.round(3 / BLOCK));   // 起跑線 3 個世界單位闊
        for (let w = -ROAD_HALF + 1; w <= ROAD_HALF - 1; w++) {
            for (let d = 0; d < startDepth; d++) {
                const x = p0.x + side0.x * w * BLOCK + tan0.x * d * BLOCK;
                const z = p0.z + side0.z * w * BLOCK + tan0.z * d * BLOCK;
                // 黑白格用世界單位分塊，唔係逐格跳（BLOCK 細咗都仲係睇得出格仔）
                const cell = Math.floor(w * BLOCK / 2) + Math.floor(d * BLOCK / 2);
                this.#set(Math.round(x / BLOCK), Math.round(z / BLOCK),
                    (Math.abs(cell) % 2 === 0) ? 'start' : 'startB', true);
            }
        }
        this.startPos = p0.clone();
        this.startDir = tan0.clone();
    }

    // 由所有路面格做多源 BFS 向外擴：1–4 格草地做緩衝區，5–6 格先至係欄杆。
    // 之前只留兩格草，跌出路面即刻貼欄，速度被反覆撞擊鎖死——賽車遊戲要有
    // 「衝出去仲救得返」嘅空間，唔係一出界就完。
    #stampSurroundings() {
        const GRASS_DEPTH = Math.round(GRASS_W / BLOCK);
        const WALL_DEPTH = GRASS_DEPTH + Math.round(WALL_W / BLOCK);
        let frontier = [...this.cells.keys()].map(k => k.split(',').map(Number));
        const seen = new Set(this.cells.keys());
        for (let depth = 1; depth <= WALL_DEPTH; depth++) {
            const next = [];
            for (const [cx, cz] of frontier) {
                for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const nx = cx + dx, nz = cz + dz;
                    const k = this.key(nx, nz);
                    if (seen.has(k)) continue;
                    seen.add(k);
                    this.cells.set(k, depth <= GRASS_DEPTH ? 'grass' : 'wall');
                    next.push([nx, nz]);
                }
            }
            frontier = next;
        }
        // 草地上撒少少泥同水，唔好一望無際都係綠色
        for (const [k, kind] of [...this.cells]) {
            if (kind !== 'grass') continue;
            const [cx, cz] = k.split(',').map(Number);
            const n = Math.sin(cx * 12.9898 + cz * 78.233) * 43758.5453;
            const r = n - Math.floor(n);
            if (r > 0.93) this.cells.set(k, 'dirt');
            else if (r > 0.90) this.cells.set(k, 'water');
        }
    }

    // 賽道自身最近間距：唔同段落貼得太近，檢查點同落點判斷都會出事。
    // 測試會用呢個把關（改賽道形狀之後必定要重跑）。
    minSelfClearance() {
        const N = 200, pts = [];
        for (let i = 0; i < N; i++) pts.push(this.curve.getPointAt(i / N));
        let best = Infinity;
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                // 沿線相鄰嘅點當然近，跳過（環狀距離要兩邊都計）
                const along = Math.min(j - i, N - (j - i));
                if (along < N * 0.08) continue;
                const d = pts[i].distanceTo(pts[j]);
                if (d < best) best = d;
            }
        }
        return best;
    }

    // 檢查點：沿賽道平均分佈，用嚟防止兜路兼計圈
    #makeCheckpoints(count = 12) {
        for (let i = 0; i < count; i++) {
            const t = i / count;
            const p = this.curve.getPointAt(t);
            const tan = this.curve.getTangentAt(t);
            this.checkpoints.push({ pos: p.clone(), dir: tan.clone(), t });
        }
    }

    // 車喺賽道邊個位置（0..1）——用嚟判斷方向啱唔啱同計進度
    nearestT(x, z, hintT = null) {
        const probe = new THREE.Vector3(x, 0, z);
        let bestT = 0, bestD = Infinity;
        const N = 240;
        for (let i = 0; i < N; i++) {
            const t = i / N;
            const p = this.curve.getPointAt(t);
            const d = (p.x - probe.x) ** 2 + (p.z - probe.z) ** 2;
            if (d < bestD) { bestD = d; bestT = t; }
        }
        return bestT;
    }

    // 砌 mesh：一個 InstancedMesh 裝晒所有方塊
    build(scene) {
        const geo = new THREE.BoxGeometry(BLOCK, BLOCK, BLOCK);
        const mat = new THREE.MeshLambertMaterial({ vertexColors: false });
        const mesh = new THREE.InstancedMesh(geo, mat, this.cells.size);
        const m = new THREE.Matrix4();
        const color = new THREE.Color();
        let i = 0;
        const scale = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const pos = new THREE.Vector3();
        for (const [k, kind] of this.cells) {
            const [cx, cz] = k.split(',').map(Number);
            const def = KIND[kind];
            // 地面方塊頂面對齊 y=0；欄杆用 scale 撐高，唔使疊幾層 instance
            const hy = def.h / BLOCK;
            scale.set(1, hy, 1);
            pos.set(cx * BLOCK, def.h / 2 - BLOCK, cz * BLOCK);
            m.compose(pos, quat, scale);
            mesh.setMatrixAt(i, m);
            // 每格輕微色差：Minecraft 嗰種手砌質感，唔會一片死色
            const n = Math.sin(cx * 45.164 + cz * 23.14) * 43758.5453;
            const jitter = 1 + ((n - Math.floor(n)) - 0.5) * 0.16;
            color.setHex(def.color).multiplyScalar(jitter);
            mesh.setColorAt(i, color);
            i++;
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        scene.add(mesh);
        this.mesh = mesh;
        return mesh;
    }

    dispose(scene) {
        if (!this.mesh) return;
        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh = null;
    }
}
