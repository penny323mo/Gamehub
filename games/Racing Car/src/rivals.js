// 電腦對手：同一套物理、同一條賽道，用 driver.js 揸。
//
// 兩個刻意嘅決定：
//
//   1. 對手唔用玩家嗰個 GLB。嗰個模型一架就 17,843 個三角形、一個 draw
//      call；兩架已經爆咗手機預算（<18 calls / <120k tris）。對手改用一架
//      低面數方塊車，全部塞入同一個 InstancedMesh——成組對手夾埋一個 draw
//      call、幾百個三角形。順帶一提，咁樣玩家一眼就分到邊架係自己。
//   2. 對手行足整套 car.js 物理，唔係沿住中線滑行。所以佢哋一樣會甩尾、
//      一樣要煞車、一樣會撞欄——追到／被追過先有意思。

import * as THREE from 'three';
import { Car } from './car.js';
import { createDriver, SKILLS } from './driver.js';

// 每個對手係一個固定嘅身份：名、色、揸車性格。名同色綁死，所以你喺縮圖
// 見到嗰粒紅點，同名次表上面嗰個「阿烈」係同一個人——冇呢層對應，成個
// 名次表都只係四行數字。排位由快到慢，第一格擺最快嗰個。
export const ROSTER = [
    { name: '阿烈', colour: 0xd94f3d, skill: SKILLS.ace },
    { name: '阿藍', colour: 0x3f7fd6, skill: SKILLS.quick },
    { name: '阿黃', colour: 0xe0b23a, skill: SKILLS.quick },
    { name: '阿綠', colour: 0x53b06a, skill: SKILLS.steady },
];
export const RIVAL_COLOURS = ROSTER.map(r => r.colour);
// 起跑格：沿住中線嘅前後偏移同左右偏移（世界單位）。
// 對手排喺玩家「前面」係有意嘅——排後面嘅話鏡頭喺車後，開波成場都見唔到
// 對手，亦都冇嘢追。而家一開波就見到前面幾架車，追過佢哋就係目標。
// 圈速紀錄唔受影響：計時係由自己過線嗰刻開始計。
const GRID = [[9, -4.2], [9, 4.2], [18, -4.2], [18, 4.2]];

// 沿線位置：0 = 起跑線，1 = 跑完一圈。用累積方式而唔係每幀 (t - startT) % 1，
// 因為起跑格喺線前／後嗰陣，取餘數會將「差少少未到線」讀成「差少少就跑完
// 一圈」——實測玩家企喺 pole 都被報成第五。
export function trackDelta(t, lastT) {
    return ((t - lastT + 1.5) % 1) - 0.5;
}
export function signedFrac(t, startT) {
    const f = (t - startT + 1) % 1;
    return f > 0.5 ? f - 1 : f;
}

// 一架低面數方塊車：車身 + 車頂 + 四個轆，全部合併做一份 geometry。
// 玩家幽靈唔再用呢架低模；真正幽靈由 main.js clone 玩家 GLB 後做透明材質，
// 呢度只負責四架實體對手，保留 instance draw 嘅手機預算。
export function blockCarGeometry() {
    const parts = [];
    const push = (w, h, d, x, y, z, shade) => {
        const g = new THREE.BoxGeometry(w, h, d);
        g.translate(x, y, z);
        const n = g.attributes.position.count;
        const col = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = shade; }
        g.setAttribute('shade', new THREE.BufferAttribute(col, 3));
        parts.push(g);
    };
    push(2.0, 0.62, 4.4, 0, 0.62, 0, 1);            // 車身
    push(1.62, 0.52, 1.9, 0, 1.16, -0.15, 0.86);    // 車頂
    push(0.42, 0.52, 0.52, -1.02, 0.34, 1.35, 0.18);
    push(0.42, 0.52, 0.52, 1.02, 0.34, 1.35, 0.18);
    push(0.42, 0.52, 0.52, -1.02, 0.34, -1.35, 0.18);
    push(0.42, 0.52, 0.52, 1.02, 0.34, -1.35, 0.18);

    // 手動合併：唔想淨為咗六個盒就拉 BufferGeometryUtils 入嚟
    let vertCount = 0, idxCount = 0;
    for (const g of parts) { vertCount += g.attributes.position.count; idxCount += g.index.count; }
    const pos = new Float32Array(vertCount * 3);
    const nor = new Float32Array(vertCount * 3);
    const shade = new Float32Array(vertCount * 3);
    const idx = new Uint16Array(idxCount);
    let vo = 0, io = 0;
    for (const g of parts) {
        pos.set(g.attributes.position.array, vo * 3);
        nor.set(g.attributes.normal.array, vo * 3);
        shade.set(g.attributes.shade.array, vo * 3);
        for (let i = 0; i < g.index.count; i++) idx[io + i] = g.index.array[i] + vo;
        vo += g.attributes.position.count;
        io += g.index.count;
        g.dispose();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('shade', new THREE.BufferAttribute(shade, 3));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));
    return geo;
}

// 車身色由 instanceColor 決定，但轆／車頂要暗啲——所以逐個 vertex 帶一個
// shade 係數，喺 shader 度乘落 instance color 度。
function blockCarMaterial() {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: false });
    mat.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nattribute vec3 shade;\nvarying vec3 vShade;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvShade = shade;');
        shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vShade;')
            .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= vShade;');
    };
    mat.customProgramCacheKey = () => 'block-car-vshade-v2';
    return mat;
}

export class RivalField {
    constructor(scene) {
        this.scene = scene;
        this.geometry = blockCarGeometry();
        this.material = blockCarMaterial();
        this.capacity = RIVAL_COLOURS.length;            // 四個實體對手；幽靈係玩家 GLB
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.capacity);
        this.mesh.frustumCulled = false;
        this.mesh.count = 0;
        this.mesh.visible = false;
        scene.add(this.mesh);
        this.rivals = [];
        this.track = null;
        this.laps = 3;
        this.finishOrder = [];
        this.raceTime = 0;
        this._m = new THREE.Matrix4();
        this._q = new THREE.Quaternion();
        this._e = new THREE.Euler(0, 0, 0, 'YZX');
        this._s = new THREE.Vector3(1, 1, 1);
        this._p = new THREE.Vector3();
        this._c = new THREE.Color();
        this._surface = { y: 0, bank: 0, pitch: 0 };
    }

    get count() { return this.rivals.length; }

    // 開一場：n 個對手，全部排喺起跑線後面
    spawn(track, n, laps = 3) {
        this.track = track;
        this.laps = laps;
        this.finishOrder = [];
        this.raceTime = 0;
        this.rivals = [];
        const total = Math.max(0, Math.min(RIVAL_COLOURS.length, n | 0));
        const tan = track.curve.getTangentAt(track.startT);
        const side = new THREE.Vector3(-tan.z, 0, tan.x);
        for (let i = 0; i < total; i++) {
            const [back, across] = GRID[i];
            const pos = track.startPos.clone()
                .addScaledVector(tan, back)
                .addScaledVector(side, across);
            const who = ROSTER[i];
            const car = new Car(new THREE.Group());     // 唔使真 model，畫面靠 instance
            car.reset(pos, tan);
            track.renderPoseAt?.(pos.x, pos.z, this._surface);
            car.setRenderSurface(this._surface.y, this._surface.bank, this._surface.pitch);
            this.rivals.push({
                car, name: who.name,
                driver: createDriver(track, who.skill),
                colour: who.colour,
                // 起步走線偏移：淨係用嚟散開起跑格。呢個偏移會喺頭幾秒收返零——
                // 成場都貼住路邊行嘅話，急彎位一定會跌出路面（實測四架有一架
                // 因為咁樣卡死喺草地，成場跑唔完）。
                lane: across * 0.55,
                lap: 0, nextCp: 1, finished: false, time: 0, stuck: 0,
                lastT: track.nearestT(pos.x, pos.z),
                progress: signedFrac(track.nearestT(pos.x, pos.z), track.startT),
            });
        }
        this.#sync();
        return total;
    }

    clear() {
        this.rivals = [];
        this.finishOrder = [];
        this.mesh.count = 0;
        this.mesh.visible = false;
    }

    // 舊 API 保留畀外部測試／舊交接唔會爆；真正幽靈已由 main.js 畫玩家 GLB。
    setGhost() { }
    clearGhost() { }

    update(dt, track, playerCar) {
        if (!this.rivals.length) return;
        this.raceTime += dt;
        const cps = track.checkpoints;
        for (const r of this.rivals) {
            if (r.finished) continue;
            const t = track.nearestT(r.car.pos.x, r.car.pos.z);
            r.lane *= Math.exp(-dt * 0.45);          // 幾秒之後歸中線
            r.car.update(dt, r.driver.read(r.car, t, r.lane), track);
            this.#unstick(dt, r, track);

            // 計圈：同玩家一樣要順住檢查點行，唔可以兜路
            const cp = cps[r.nextCp];
            const dx = r.car.pos.x - cp.pos.x, dz = r.car.pos.z - cp.pos.z;
            if (dx * dx + dz * dz < 18 * 18) {
                r.nextCp = (r.nextCp + 1) % cps.length;
                if (r.nextCp === 1) {
                    r.lap += 1;
                    if (r.lap >= this.laps) {
                        r.finished = true;
                        r.time = this.raceTime;
                        this.finishOrder.push(r);
                    }
                }
            }
            r.progress += trackDelta(t, r.lastT);
            r.lastT = t;
        }
        this.#separate(playerCar);
        this.#sync();
    }

    // 對手卡死一樣要拖返賽道。玩家喺 race.js 有呢個安全網，對手冇嘅話
    // 一架車撞完欄停咗喺草地，成場比賽就得返三架——實測真係出現過。
    #unstick(dt, r, track) {
        const trapped = r.car.speed < 2.5 && (r.car.offroad || r.car.wallHit);
        r.stuck = trapped ? r.stuck + dt : 0;
        if (r.stuck < 3) return;
        r.stuck = 0;
        const cps = track.checkpoints;
        const cp = cps[(r.nextCp - 1 + cps.length) % cps.length];
        r.car.reset(cp.pos, cp.dir);
        track.renderPoseAt?.(cp.pos.x, cp.pos.z, this._surface);
        r.car.setRenderSurface(this._surface.y, this._surface.bank, this._surface.pitch);
        r.lane = 0;
    }

    // 車同車唔可以疊埋一齊。用車身框（長 × 闊）而唔係一個圓：架車長 4.6 米、
    // 闊 2 米，用圓形嘅話半徑要揀 3.4 先頂得住頭尾相撞，但咁樣並排都會被
    // 推開——變咗永遠冇得埋身鬥。分開兩條軸就兩樣都做得到。
    // 只推位置同接觸方向嘅速度，唔掂輪胎模型：撞車物理係另一件事。
    #separate(playerCar) {
        const HALF_LONG = 2.5, HALF_WIDE = 1.15;
        const bodies = this.rivals.filter(r => !r.finished).map(r => r.car);
        if (playerCar) bodies.push(playerCar);
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const a = bodies[i], b = bodies[j];
                const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
                // 用兩架車嘅平均車頭做參考框
                let fx = Math.sin(a.yaw) + Math.sin(b.yaw);
                let fz = Math.cos(a.yaw) + Math.cos(b.yaw);
                const fl = Math.hypot(fx, fz) || 1;
                fx /= fl; fz /= fl;
                const sx = fz, sz = -fx;
                const along = dx * fx + dz * fz;
                const across = dx * sx + dz * sz;
                const overlapLong = HALF_LONG * 2 - Math.abs(along);
                const overlapWide = HALF_WIDE * 2 - Math.abs(across);
                if (overlapLong <= 0 || overlapWide <= 0) continue;
                // 由淺嗰條軸推出去：貼側就推側，追尾就推前後
                let nx, nz, push;
                if (overlapWide < overlapLong) {
                    const sign = across >= 0 ? 1 : -1;
                    nx = sx * sign; nz = sz * sign; push = overlapWide / 2;
                } else {
                    const sign = along >= 0 ? 1 : -1;
                    nx = fx * sign; nz = fz * sign; push = overlapLong / 2;
                }
                a.pos.x -= nx * push; a.pos.z -= nz * push;
                b.pos.x += nx * push; b.pos.z += nz * push;
                const rel = (b.vel.x - a.vel.x) * nx + (b.vel.z - a.vel.z) * nz;
                if (rel < 0) {
                    a.vel.x += nx * rel * 0.5; a.vel.z += nz * rel * 0.5;
                    b.vel.x -= nx * rel * 0.5; b.vel.z -= nz * rel * 0.5;
                }
            }
        }
    }

    #sync() {
        for (let i = 0; i < this.rivals.length; i++) {
            const r = this.rivals[i];
            this._p.set(r.car.pos.x, r.car.renderY, r.car.pos.z);
            this._e.set(r.car.trackPitch, r.car.yaw, r.car.bodyRoll + r.car.trackBank, 'YZX');
            this._q.setFromEuler(this._e);
            this._m.compose(this._p, this._q, this._s);
            this.mesh.setMatrixAt(i, this._m);
            this._c.setHex(r.colour);
            this.mesh.setColorAt(i, this._c);
        }
        this.mesh.count = this.rivals.length;
        this.mesh.visible = this.rivals.length > 0;
        this.mesh.instanceMatrix.needsUpdate = true;
        if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
    }

    // 名次：進度愈大愈前。玩家嘅進度由外面傳入（race.js 已經計緊圈數）。
    standings(playerProgress) {
        const rows = this.rivals.map(r => ({
            name: r.name, colour: r.colour, progress: r.progress, player: false, finished: r.finished,
        }));
        rows.push({ name: '你', colour: 0xffffff, progress: playerProgress, player: true, finished: false });
        rows.sort((a, b) => b.progress - a.progress);
        return rows;
    }

    // 完賽名次表：跑完嘅按時間排，未跑完嘅按進度排喺後面。
    // 玩家過線就收工，所以對手多數仲喺賽道上面——照樣要有個位排。
    results(playerTime, playerProgress) {
        const rows = this.rivals.map((r) => ({
            label: r.name, colour: r.colour, player: false,
            finished: r.finished, time: r.finished ? r.time : null, progress: r.progress,
        }));
        rows.push({
            label: '你', colour: 0xffffff, player: true,
            finished: true, time: playerTime, progress: playerProgress,
        });
        rows.sort((a, b) => {
            if (a.finished !== b.finished) return a.finished ? -1 : 1;
            if (a.finished) return a.time - b.time;
            return b.progress - a.progress;
        });
        const winner = rows[0]?.finished ? rows[0].time : null;
        return rows.map((row, i) => ({
            ...row,
            place: i + 1,
            gap: row.finished && winner != null && i > 0 ? row.time - winner : null,
        }));
    }

    playerPlace(playerProgress) {
        let place = 1;
        for (const r of this.rivals) if (r.progress > playerProgress) place++;
        return place;
    }

    dispose() {
        this.scene.remove(this.mesh);
        this.geometry.dispose();
        this.material.dispose();
        this.rivals = [];
    }
}
