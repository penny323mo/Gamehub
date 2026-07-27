// 比賽規則：倒數、圈數、檢查點、計時、最佳圈存檔。
//
// 檢查點要順序過先算數：唔係嘅話喺起跑線前後掟頭就當跑咗一圈。

const SAVE_KEY = 'racer-best-v1';

export class Race {
    constructor(track, { laps = 3, onEvent = () => {} } = {}) {
        this.track = track;
        this.totalLaps = laps;
        this.onEvent = onEvent;
        this.reset();
    }

    reset() {
        this.state = 'countdown';   // countdown | racing | finished
        this.countdown = 3.2;
        this.lap = 0;
        // 開波時車已經企喺 0 號檢查點上面，所以下一個目標係 1 號。
        // 由 0 開始嘅話，開波嗰刻就會即時「過咗」0 號，變成未跑就算咗一圈
        // （實測：三圈賽只跑到兩圈就完場）。
        this.nextCp = 1;
        this.time = 0;
        this.lapTime = 0;
        this.lapTimes = [];
        this.best = this.loadBest();
        this.wrongWay = false;
    }

    loadBest() {
        try { return JSON.parse(localStorage.getItem(SAVE_KEY))?.bestLap ?? null; } catch { return null; }
    }
    #saveBest(t) {
        try {
            const cur = this.loadBest();
            if (cur === null || t < cur) localStorage.setItem(SAVE_KEY, JSON.stringify({ bestLap: t }));
        } catch { /* 私隱模式：唔存都照玩 */ }
    }

    update(dt, car) {
        if (this.state === 'countdown') {
            const before = Math.ceil(this.countdown);
            this.countdown -= dt;
            const now = Math.ceil(this.countdown);
            if (now !== before && now >= 0) this.onEvent(now === 0 ? 'go' : 'count', now);
            if (this.countdown <= 0) this.state = 'racing';
            return;
        }
        if (this.state !== 'racing') return;

        this.time += dt;
        this.lapTime += dt;

        // 檢查點：入到半徑內就當過咗，順住嚟先算
        const cps = this.track.checkpoints;
        const cp = cps[this.nextCp];
        const dx = car.pos.x - cp.pos.x, dz = car.pos.z - cp.pos.z;
        if (dx * dx + dz * dz < 22 * 22) {
            this.nextCp = (this.nextCp + 1) % cps.length;
            // 兜足一圈返到 0 號檢查點（下一個目標變返 1 號）＝完成一圈
            if (this.nextCp === 1) this.#completeLap();
        }

        // 逆行提示：車頭同賽道切線夾角超過 120 度
        const t = this.track.nearestT(car.pos.x, car.pos.z);
        const tan = this.track.curve.getTangentAt(t);
        const fwdX = Math.sin(car.heading), fwdZ = Math.cos(car.heading);
        this.wrongWay = (tan.x * fwdX + tan.z * fwdZ) < -0.5 && Math.abs(car.speed) > 4;
    }

    #completeLap() {
        this.lapTimes.push(this.lapTime);
        if (this.best === null || this.lapTime < this.best) {
            this.best = this.lapTime;
            this.#saveBest(this.lapTime);
            this.onEvent('record', this.lapTime);
        }
        this.lap += 1;
        this.lapTime = 0;
        if (this.lap >= this.totalLaps) {
            this.state = 'finished';
            this.onEvent('finish', { total: this.time, laps: this.lapTimes, best: this.best });
        } else {
            this.onEvent('lap', this.lap + 1);   // 橫額報「而家跑緊第幾圈」
        }
    }
}

export function fmtTime(s) {
    if (s == null) return '--:--.--';
    const m = Math.floor(s / 60);
    const sec = s - m * 60;
    return `${m}:${sec.toFixed(2).padStart(5, '0')}`;
}
