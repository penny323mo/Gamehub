// 比賽規則：倒數、圈數、檢查點、計時，同埋漂移計分。
//
// 漂移計分嘅設計取向：分數 = 角度 × 速度 × 時間 × 連段倍率。三個要點：
//   1. 分數要「入袋」先算數——一路甩尾一路累積，甩完（車身擺返正）先結算，
//      咁樣先有「要唔要再頂多一個彎」嘅取捨
//   2. 撞欄即刻報銷未入袋嗰筆，倍率清零——貼牆刷分冇著數
//   3. 倍率跟連續漂移時間升，斷咗就跌返 1×

const SAVE_KEY = 'racer-best-v2';
const DRIFT_END_GRACE = 0.55;    // 甩完幾耐先當一段結束（連續彎之間會短暫擺正）
const COMBO_MAX = 5;
// 倍率每幾秒升一級。1.6 秒係一個壞巧合：ADR-078 之後，一個做得好嘅單彎
// 漂移實測維持 1.56 秒——即係差 0.04 秒都升唔到 2×，成條倍率階梯（去到
// 5×）除咗連續彎串埋之外根本摸唔到。1.2 秒之下第一級變成攞得到，而
// 3×（2.4 秒）4×（3.6 秒）5×（4.8 秒）仍然要靠串連續彎，階梯有返意義。
const COMBO_STEP = 1.2;
// 卡死幾耐先拖返賽道。車頭頂正欄杆而又踩住油嘅話，物理上係真係郁唔到——
// 唔畀個出路嘅話一次失誤就要重開成場。
const STUCK_LIMIT = 3;

export class Race {
    constructor(track, { laps = 3, trackId = 'default', onEvent = () => { } } = {}) {
        this.track = track;
        this.trackId = trackId;
        this.totalLaps = laps;
        this.onEvent = onEvent;
        this.reset();
    }

    reset() {
        this.state = 'countdown';   // countdown | racing | finished
        this.countdown = 3.2;
        this.lap = 0;
        // 開波時車已經企喺 0 號檢查點上面，所以下一個目標係 1 號。
        // 由 0 開始嘅話，開波嗰刻就會即時「過咗」0 號，變成未跑就算咗一圈。
        this.nextCp = 1;
        this.time = 0;
        this.lapTime = 0;
        this.lapTimes = [];

        // 漂移
        this.driftScore = 0;      // 已入袋
        this.pending = 0;         // 呢一段仲未入袋
        this.combo = 1;
        this.driftTime = 0;       // 呢一段連續甩咗幾耐
        this.sinceDrift = 99;     // 離開漂移狀態幾耐
        this.bestDrift = 0;       // 單段最高分
        this.stuck = 0;           // 卡住咗幾耐（用嚟決定拖唔拖返賽道）

        const saved = this.loadBest();
        this.best = saved.bestLap;
        this.bestScore = saved.bestScore;
        this.wrongWay = false;
    }

    #key() { return `${SAVE_KEY}:${this.trackId}`; }
    loadBest() {
        try {
            const v = JSON.parse(localStorage.getItem(this.#key())) ?? {};
            return { bestLap: v.bestLap ?? null, bestScore: v.bestScore ?? 0 };
        } catch { return { bestLap: null, bestScore: 0 }; }
    }
    #save(patch) {
        try {
            const cur = this.loadBest();
            localStorage.setItem(this.#key(), JSON.stringify({ ...cur, ...patch }));
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
        this.#updateDrift(dt, car);
        this.#updateStuck(dt, car);

        // 檢查點：入到半徑內就當過咗，順住嚟先算
        const cps = this.track.checkpoints;
        const cp = cps[this.nextCp];
        const dx = car.pos.x - cp.pos.x, dz = car.pos.z - cp.pos.z;
        if (dx * dx + dz * dz < 18 * 18) {
            this.nextCp = (this.nextCp + 1) % cps.length;
            // 兜足一圈返到 0 號檢查點（下一個目標變返 1 號）＝完成一圈
            if (this.nextCp === 1) this.#completeLap();
        }

        // 逆行提示：車頭同賽道切線夾角超過 120 度
        const t = this.track.nearestT(car.pos.x, car.pos.z);
        const tan = this.track.curve.getTangentAt(t);
        const fwdX = Math.sin(car.yaw), fwdZ = Math.cos(car.yaw);
        this.wrongWay = (tan.x * fwdX + tan.z * fwdZ) < -0.5 && car.speed > 4;
    }

    #updateDrift(dt, car) {
        if (car.wallHit) {          // 撞欄：未入袋嘅全部報銷
            if (this.pending > 0) this.onEvent('driftLost', Math.round(this.pending));
            this.pending = 0; this.combo = 1; this.driftTime = 0; this.sinceDrift = 99;
            return;
        }
        if (car.drifting) {
            this.sinceDrift = 0;
            this.driftTime += dt;
            // 角度愈大、速度愈快，得分愈高；角度封頂避免原地打圈刷分
            const angle = Math.min(Math.abs(car.slipAngle), 1.1);
            this.pending += angle * car.speed * dt * 6 * this.combo;
            // 連續甩尾每 COMBO_STEP 秒升一級倍率
            this.combo = Math.min(COMBO_MAX, 1 + Math.floor(this.driftTime / COMBO_STEP));
        } else {
            this.sinceDrift += dt;
            if (this.sinceDrift > DRIFT_END_GRACE && this.pending > 0) this.#bank();
        }
    }

    // 卡死救援：停晒又喺賽道外／頂住欄，夠鐘就拖返上一個檢查點重新出發。
    // 唔計時間懲罰，因為卡住嗰段時間本身已經係懲罰；未入袋嘅漂移分照樣報銷。
    #updateStuck(dt, car) {
        const trapped = car.speed < 2.5 && (car.offroad || car.wallHit);
        this.stuck = trapped ? this.stuck + dt : 0;
        if (this.stuck < STUCK_LIMIT) return;
        this.stuck = 0;
        const cps = this.track.checkpoints;
        // 拖返「啱啱過咗」嗰個檢查點，唔係下一個——唔好白送一段路
        const cp = cps[(this.nextCp - 1 + cps.length) % cps.length];
        car.reset(cp.pos, cp.dir);
        this.pending = 0; this.combo = 1; this.driftTime = 0; this.sinceDrift = 99;
        this.onEvent('rescue');
    }

    #bank() {
        const gained = Math.round(this.pending);
        this.driftScore += gained;
        if (gained > this.bestDrift) this.bestDrift = gained;
        if (this.driftScore > this.bestScore) {
            this.bestScore = this.driftScore;
            this.#save({ bestScore: this.driftScore });
        }
        this.onEvent('driftBank', { gained, combo: this.combo, total: this.driftScore });
        this.pending = 0; this.combo = 1; this.driftTime = 0;
    }

    #completeLap() {
        this.lapTimes.push(this.lapTime);
        if (this.best === null || this.lapTime < this.best) {
            this.best = this.lapTime;
            this.#save({ bestLap: this.lapTime });
            this.onEvent('record', this.lapTime);
        }
        this.lap += 1;
        this.lapTime = 0;
        if (this.lap >= this.totalLaps) {
            if (this.pending > 0) this.#bank();       // 收線嗰段照計
            this.state = 'finished';
            this.onEvent('finish', {
                total: this.time, laps: this.lapTimes, best: this.best,
                drift: this.driftScore, bestDrift: this.bestDrift, bestScore: this.bestScore,
            });
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
