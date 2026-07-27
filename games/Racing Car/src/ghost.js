// 幽靈車：重播玩家自己喺呢條賽道嘅最快一圈。
//
// 點解值得做：對手係別人嘅節奏，幽靈車先係「你自己」。冇對手嗰陣（獨自
// 計時模式）佢就係唯一嘅參照物，而且一睇就知自己今圈快咗定慢咗。
//
// 存法：每 0.1 秒一個 (x, z, yaw) 取樣，數字剁到兩位小數。一圈四十秒
// ≈ 400 個取樣，JSON 出嚟約 10 KB，每條賽道一份。localStorage 頂得順，
// 亦都唔使開多一套 IndexedDB。
//
// 對時：重播係「同一個沿線位置」對「同一個沿線位置」比時間，唔係逐幀對。
// 咁樣就算今圈慢咗好多，幽靈車一樣會喺賽道上正確位置出現。

const KEY = 'racer-ghost-v1';
const STEP = 0.1;                    // 取樣間隔（秒）
const MAX_SAMPLES = 3000;            // 五分鐘上限，防止一圈爆咗做無限大

export function ghostKey(trackId) { return `${KEY}:${trackId}`; }

export function loadGhost(trackId) {
    try {
        const raw = localStorage.getItem(ghostKey(trackId));
        if (!raw) return null;
        const v = JSON.parse(raw);
        if (!Array.isArray(v?.s) || v.s.length < 12) return null;
        return v;                    // { t: 圈速, s: [x, z, yaw, 進度, ...] }
    } catch { return null; }
}

export function saveGhost(trackId, lapTime, samples) {
    try {
        localStorage.setItem(ghostKey(trackId), JSON.stringify({
            t: +lapTime.toFixed(3), s: samples,
        }));
        return true;
    } catch { return false; }        // 私隱模式／爆 quota：唔存都照玩
}

export function clearGhost(trackId) {
    try { localStorage.removeItem(ghostKey(trackId)); } catch { }
}

// ---------- 錄影 ----------
export class GhostRecorder {
    constructor() { this.reset(); }

    reset() {
        this.samples = [];
        this.acc = 0;
        this.lapTime = 0;
    }

    // 每幀叫一次。progress 係「呢一圈行咗幾多」（0..1），由外面計。
    sample(dt, car, progress) {
        this.lapTime += dt;
        this.acc += dt;
        if (this.acc < STEP || this.samples.length >= MAX_SAMPLES * 4) return;
        this.acc -= STEP;
        this.samples.push(
            +car.pos.x.toFixed(2), +car.pos.z.toFixed(2),
            +car.yaw.toFixed(3), +progress.toFixed(4),
        );
    }

    // 一圈完咗：夠快就取代舊嗰個
    commit(trackId, lapTime, previousBest) {
        if (this.samples.length < 12) { this.reset(); return false; }
        const better = previousBest == null || lapTime < previousBest;
        if (better) saveGhost(trackId, lapTime, this.samples);
        this.reset();
        return better;
    }
}

// ---------- 重播 ----------
export class GhostPlayer {
    constructor() { this.data = null; this.lapTime = null; }

    load(trackId) {
        this.data = loadGhost(trackId);
        this.lapTime = this.data?.t ?? null;
        return !!this.data;
    }

    get available() { return !!this.data; }
    get count() { return this.data ? this.data.s.length / 4 : 0; }

    // 依「已經行咗幾耐」攞位置——即係幽靈車自己嘅節奏
    at(time) {
        if (!this.data) return null;
        const s = this.data.s, n = s.length / 4;
        const idx = time / STEP;
        if (idx <= 0) return this.#read(0);
        if (idx >= n - 1) return this.#read(n - 1);
        const i = Math.floor(idx), f = idx - i;
        const a = this.#read(i), b = this.#read(i + 1);
        return {
            x: a.x + (b.x - a.x) * f,
            z: a.z + (b.z - a.z) * f,
            // 角度要行最短路徑，唔係嘅話過 ±π 嗰下架車會原地打一個圈
            yaw: a.yaw + shortestAngle(a.yaw, b.yaw) * f,
            progress: a.progress + (b.progress - a.progress) * f,
        };
    }

    // 幽靈車行到「同一個沿線位置」嗰陣用咗幾多秒。用嚟報快咗／慢咗幾多。
    timeAtProgress(progress) {
        if (!this.data) return null;
        const s = this.data.s, n = s.length / 4;
        if (progress <= s[3]) return 0;
        for (let i = 1; i < n; i++) {
            const p = s[i * 4 + 3];
            if (p < progress) continue;
            const prev = s[(i - 1) * 4 + 3];
            const span = p - prev;
            const f = span > 1e-6 ? (progress - prev) / span : 0;
            return (i - 1 + f) * STEP;
        }
        return null;                 // 仲未行到幽靈車嘅終點
    }

    #read(i) {
        const s = this.data.s, o = i * 4;
        return { x: s[o], z: s[o + 1], yaw: s[o + 2], progress: s[o + 3] };
    }
}

export function shortestAngle(from, to) {
    let d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
}
