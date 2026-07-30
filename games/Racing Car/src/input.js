// 鍵盤 + 觸控 + 陀螺儀。三邊都輸出同一個 { throttle, steer, handbrake }，
// 遊戲本身唔需要知玩家用緊乜。

export const STEER_KEY = 'racer-invert-steer';
export const GYRO_KEY = 'racer-gyro';
export const GYRO_SENS_KEY = 'racer-gyro-sens';
export const GYRO_INVERT_KEY = 'racer-gyro-invert';
export const CONTROL_MODE_KEY = 'racer-control-mode';

// 由傾角（度）算軚。抽出嚟做純函數，先至測得到條曲線本身。
//
// 舊版：11° 就打到盡、直線、冇平滑。手腕郁少少就由零跳到全軚，中間位
// 幾乎冇得微調——Penny 實機講「轉向比例奇怪」，講嘅就係呢個。
//
// 而家三樣一齊改：
//   1. 行程拉長到 30°／靈敏度（正常手腕範圍），唔使死忍住唔郁
//   2. 用低增益曲線而唔係直線：一半行程只係約兩成軚，中間位好幼細，
//      要扭到盡先有全軚。試過 smoothstep，但佢一半行程就已經半軚——
//      「中間好郁」呢個要求佢做唔到
//   3. 死區用「度」而唔係用比例：手係唔可能攞到完全水平嘅
export function gyroSteer(tiltDeg, sens = 1) {
    const s = Math.min(3, Math.max(0.3, Number(sens) || 1));
    const DEAD = 2;
    const span = 30 / s;
    const t = Math.abs(Number(tiltDeg) || 0);
    if (t <= DEAD) return 0;
    const x = Math.min(1, (t - DEAD) / Math.max(1, span - DEAD));
    return Math.sign(tiltDeg) * x * (0.3 + 0.7 * x * x);
}

export class Input {
    constructor(root) {
        this.keys = new Set();
        this.touch = { left: false, right: false, steer: 0, gas: false, brake: false, drift: false };
        // pointerId -> 'gas' | 'brake' | 'drift' | 'steer'
        this.touchPointers = new Map();
        this.steerSmooth = 0;

        // 設定：轉向反轉係畀 Penny 嘅逃生門。所有量度（物理、鏡頭右向量、
        // 端到端撳掣測試）都話而家個方向啱，但玩家先係最終標準——與其
        // 靠估，不如畀佢一撳就掉轉。
        this.invert = localStorage.getItem(STEER_KEY) === '1';
        this.gyroSens = Number(localStorage.getItem(GYRO_SENS_KEY) ?? 1.2);
        // 陀螺儀方向獨立於觸控轉向。Penny 實機報告：觸控方向啱，陀螺儀
        // 相反。兩者共用一個 invert 掣嘅話，修好一個就整壞另一個。
        this.gyroInvert = localStorage.getItem(GYRO_INVERT_KEY) !== '0';
        this.controlMode = localStorage.getItem(CONTROL_MODE_KEY) === 'standard'
            ? 'standard'
            : 'simple';

        // 陀螺儀
        this.gyro = { on: false, tilt: 0, zero: null, supported: 'DeviceOrientationEvent' in window };
        // 陀螺儀讀數本身有雜訊，而且之前完全冇平滑（觸控有，陀螺儀繞過咗）。
        this.gyroSmooth = 0;
        // 玩家喺設定揀咗「打橫」而部機又報打直嗰陣，CSS 會將成個遊戲轉 90°
        // （ADR-074）。按鈕嘅命中測試用螢幕座標 AABB，轉唔轉都啱；但搖桿要
        // 嘅係「遊戲座標」嘅左右，喺轉咗之後對應螢幕嘅上下，所以要換軸。
        // 呢個 flag 由 main.js 同 CSS class 一齊 set，唔喺呢度自己估。
        this.rotated = false;

        addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
            this.keys.add(e.key.toLowerCase());
        });
        addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
        addEventListener('blur', () => this.reset(root));

        // 右手動作區當成「一塊」手勢面，唔係三粒各自為政嘅掣。
        //
        // 舊做法係三粒掣各自 setPointerCapture：手指一落咗喺其中一粒，
        // 之後所有事件都鎖死喺嗰粒度，滑去第二粒係完全收唔到——Penny 實測
        // 「撳完煞車再換返去油門好似冇反應」就係咁嚟。另外舊嗰套「由油門
        // 滑去其他掣」淨係認向左移動，但三粒掣係打直疊住嘅，向上拉自然
        // 冇反應。
        //
        // 而家：capture 喺容器度，逐隻手指記住佢而家喺邊粒掣上面，郁到
        // 邊就即刻轉做邊個動作。同時容得落多隻手指——踩住油門再撳手煞
        // 係呢隻遊戲入面最基本嘅甩尾手法，唔可以做唔到。
        const cluster = root.querySelector('.pad-side.right');
        const actionEls = {
            gas: root.querySelector('#pad-gas'),
            brake: root.querySelector('#pad-brake'),
            drift: root.querySelector('#pad-drift'),
        };
        const syncActions = () => {
            const live = new Set(this.touchPointers.values());
            for (const [prop, el] of Object.entries(actionEls)) {
                this.touch[prop] = live.has(prop);
                el?.classList.toggle('held', this.touch[prop]);
            }
        };
        this.syncActions = syncActions;

        // 落手嗰下信瀏覽器自己嘅命中判斷（ev.target）——佢比我哋自己度
        // rect 準，而且合成事件唔一定帶座標。手指郁動嗰陣就唔可以靠
        // target 了：capture 之後 target 永遠係容器，唯一嘅訊號係座標。
        const actionOfElement = (node) => {
            const el = node?.closest?.('#pad-gas, #pad-brake, #pad-drift');
            if (!el) return null;
            return el.id === 'pad-gas' ? 'gas' : el.id === 'pad-brake' ? 'brake' : 'drift';
        };

        // 手指喺邊粒掣上面。要先掃一次「真正落喺個掣入面」，掃完冇先至放寬——
        // 一次過用放寬咗嘅範圍嘅話，最大粒嗰個（油門）會食埋隔籬掣嘅位置，
        // 由油門拉去飄移永遠都變唔到。
        const actionAt = (x, y) => {
            const rects = [];
            for (const [prop, el] of Object.entries(actionEls)) {
                const r = el?.getBoundingClientRect();
                // 量到零尺寸即係個 HUD 未顯示／已隱藏。呢種情況下面所有
                // 「最近嗰粒」嘅距離都係零，隨便揀一粒就會亂跳動作。
                if (r && r.width > 0 && r.height > 0) rects.push([prop, r]);
            }
            if (!rects.length) return null;
            for (const [prop, r] of rects) {
                if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return prop;
            }
            // 掣同掣之間有罅，滑過罅位唔應該斷開動作
            for (const [prop, r] of rects) {
                const padX = r.width * 0.2, padY = r.height * 0.2;
                if (x >= r.left - padX && x <= r.right + padX
                    && y >= r.top - padY && y <= r.bottom + padY) return prop;
            }
            let best = null, bestDist = Infinity;
            for (const [prop, r] of rects) {
                const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
                if (d < bestDist) { bestDist = d; best = prop; }
            }
            return best;
        };

        if (cluster) {
            const down = (ev) => {
                const action = actionOfElement(ev.target) ?? actionAt(ev.clientX, ev.clientY);
                if (!action) return;
                ev.preventDefault();
                this.touchPointers.set(ev.pointerId, action);
                syncActions();
                cluster.classList.add('gesture-active');
                try { cluster.setPointerCapture(ev.pointerId); } catch { }
            };
            const move = (ev) => {
                if (!this.touchPointers.has(ev.pointerId)) return;
                ev.preventDefault();
                // 量唔到位置就維持原本動作，唔好亂跳
                const action = actionAt(ev.clientX, ev.clientY);
                if (action && action !== this.touchPointers.get(ev.pointerId)) {
                    this.touchPointers.set(ev.pointerId, action);
                    syncActions();
                }
            };
            const up = (ev) => {
                if (!this.touchPointers.has(ev.pointerId)) return;
                ev.preventDefault();
                this.touchPointers.delete(ev.pointerId);
                syncActions();
                if (![...this.touchPointers.values()].some(a => a !== 'steer')) {
                    cluster.classList.remove('gesture-active');
                }
            };
            cluster.addEventListener('pointerdown', down);
            cluster.addEventListener('pointermove', move);
            cluster.addEventListener('pointerup', up);
            cluster.addEventListener('pointercancel', up);
            // 手機喺記憶體壓力／來電嗰陣會收走 capture。收走即刻當放手，
            // 否則油門會一直「撳住」，玩家返到嚟先發現架車已經衝咗出去。
            // pointerup 一定行喺 lostpointercapture 之前，所以唔會重覆處理。
            cluster.addEventListener('lostpointercapture', up);
        }

        // 現代 MOBA 式浮動搖桿：左手區任何位置都可以落手，底盤會移到
        // 拇指下面；拖動距離直接變成 -1..1 嘅連續轉向。Pointer capture
        // 令手指拖出起手區同圓盤之後都繼續收 input，直到真正放手。
        const zone = root.querySelector('#steer-zone');
        const stick = root.querySelector('#steer-stick');
        const knob = root.querySelector('#steer-knob');
        if (zone && stick && knob) {
            const placeBase = (ev) => {
                const p = this.localPoint(zone, ev.clientX, ev.clientY);
                const size = stick.offsetWidth || 156;
                const radius = size / 2;
                const x = Math.max(radius, Math.min(p.w - radius, p.x));
                const y = Math.max(radius, Math.min(p.h - radius, p.y));
                stick.style.left = `${(x - radius).toFixed(1)}px`;
                stick.style.top = `${(y - radius).toFixed(1)}px`;
                stick.style.bottom = 'auto';
            };
            const move = (ev) => {
                if (this.touchPointers.get(ev.pointerId) !== 'steer') return;
                ev.preventDefault();
                const size = stick.offsetWidth || 156;
                const max = Math.max(1, size * 0.34);
                const p = this.localPoint(stick, ev.clientX, ev.clientY);
                const dx = p.x - size / 2;
                const dy = p.y - size / 2;
                // 轉向淨係用得着 x 軸，所以 x 要自己夾自己。舊寫法將 (dx, dy)
                // 一齊夾入個圓，拇指順住手腕弧線拉落斜就會連 x 一齊縮細：
                // 實測拉 40° 得 0.77 軚、60° 得 0.50，即係 Penny 講嘅「點拉
                // 都唔夠幅度」。個圓形只係顯示用，唔應該食走轉向量。
                this.touch.steer = Math.max(-1, Math.min(1, dx / max));
                if (Math.abs(this.touch.steer) < 0.08) this.touch.steer = 0;
                // 圓芯仍然留喺個圓入面，睇落先似搖桿
                let kx = dx, ky = dy;
                const distance = Math.hypot(kx, ky);
                if (distance > max) { kx *= max / distance; ky *= max / distance; }
                knob.style.transform = `translate(${kx.toFixed(1)}px, ${ky.toFixed(1)}px)`;
                stick.setAttribute('aria-valuenow', String(Math.round(this.touch.steer * 100)));
            };
            const down = (ev) => {
                ev.preventDefault();
                this.touchPointers.set(ev.pointerId, 'steer');
                placeBase(ev);
                stick.classList.add('held');
                zone.classList.add('held');
                try { zone.setPointerCapture(ev.pointerId); } catch { }
                move(ev);
            };
            const up = (ev) => {
                if (this.touchPointers.get(ev.pointerId) !== 'steer') return;
                ev.preventDefault();
                this.touchPointers.delete(ev.pointerId);
                this.touch.steer = 0;
                stick.classList.remove('held');
                zone.classList.remove('held');
                stick.setAttribute('aria-valuenow', '0');
                knob.style.transform = '';
                stick.style.left = '';
                stick.style.top = '';
                stick.style.bottom = '';
            };
            zone.addEventListener('pointerdown', down);
            zone.addEventListener('pointermove', move);
            zone.addEventListener('pointerup', up);
            zone.addEventListener('pointercancel', up);
            zone.addEventListener('lostpointercapture', up);
        }
    }

    reset(root = document) {
        this.keys.clear();
        this.touchPointers.clear();
        for (const key of Object.keys(this.touch)) this.touch[key] = false;
        this.touch.steer = 0;
        this.steerSmooth = 0;
        root.querySelectorAll?.('.pad-btn.held').forEach(el => el.classList.remove('held'));
        root.querySelector?.('.pad-side.right')?.classList.remove('gesture-active');
        const stick = root.querySelector?.('#steer-stick');
        const zone = root.querySelector?.('#steer-zone');
        const knob = root.querySelector?.('#steer-knob');
        stick?.classList.remove('held');
        zone?.classList.remove('held');
        stick?.setAttribute('aria-valuenow', '0');
        if (knob) knob.style.transform = '';
        if (stick) {
            stick.style.left = '';
            stick.style.top = '';
            stick.style.bottom = '';
        }
    }

    setInvert(v) {
        this.invert = !!v;
        try { localStorage.setItem(STEER_KEY, v ? '1' : '0'); } catch { }
    }
    setGyroSens(v) {
        this.gyroSens = v;
        try { localStorage.setItem(GYRO_SENS_KEY, String(v)); } catch { }
    }
    setRotated(on) {
        this.rotated = !!on;
        return this.rotated;
    }

    // 將螢幕上嘅一點，換成「相對某個元素、喺遊戲座標系」嘅位置。
    // 轉咗 90°（rotate(90deg) translateY(-100%)，原點左上）之後：
    // 遊戲 x 沿住螢幕由上往下走，遊戲 y 沿住螢幕由右往左走。
    localPoint(el, clientX, clientY) {
        const r = el.getBoundingClientRect();
        if (!this.rotated) {
            return { x: clientX - r.left, y: clientY - r.top, w: r.width, h: r.height };
        }
        return {
            x: clientY - r.top,
            y: r.width - (clientX - r.left),
            w: r.height,
            h: r.width,
        };
    }

    setGyroInvert(on) {
        this.gyroInvert = !!on;
        try { localStorage.setItem(GYRO_INVERT_KEY, this.gyroInvert ? '1' : '0'); } catch { }
        return this.gyroInvert;
    }
    setControlMode(mode) {
        this.controlMode = mode === 'standard' ? 'standard' : 'simple';
        try { localStorage.setItem(CONTROL_MODE_KEY, this.controlMode); } catch { }
    }

    // iOS 要喺一個真實 user gesture 入面問權限，所以呢個一定要由撳掣叫。
    async enableGyro() {
        if (!this.gyro.supported) return false;
        try {
            const ctor = DeviceOrientationEvent;
            if (ctor.requestPermission && await ctor.requestPermission() !== 'granted') return false;
        } catch { return false; }
        if (!this.gyro.on) addEventListener('deviceorientation', this.#onTilt, { passive: true });
        this.gyro.on = true;
        this.gyro.zero = null;                 // 下一個事件就攞嚟做水平基準
        try { localStorage.setItem(GYRO_KEY, '1'); } catch { }
        return true;
    }
    disableGyro() {
        if (this.gyro.on) removeEventListener('deviceorientation', this.#onTilt);
        this.gyro.on = false; this.gyro.tilt = 0; this.gyro.zero = null;
        try { localStorage.setItem(GYRO_KEY, '0'); } catch { }
    }
    // 而家個姿勢當「軚盤打直」——打橫揸、攤喺床上都用得
    calibrateGyro() { this.gyro.zero = null; this.gyroSmooth = 0; return true; }

    #onTilt = (e) => {
        if (e.beta === null || e.gamma === null) return;
        // 直度揸手機：左右扭手腕係 gamma；打橫就變咗 beta。
        // 用 screen.orientation.angle 揀返啱嗰個軸，同埋處理正負。
        const angle = screen.orientation?.angle ?? window.orientation ?? 0;
        let raw;
        if (angle === 90) raw = -e.beta;
        else if (angle === 270 || angle === -90) raw = e.beta;
        else raw = e.gamma;
        if (this.gyro.zero === null) this.gyro.zero = raw;
        this.gyro.tilt = raw - this.gyro.zero;
    };

    read(dt) {
        const k = this.keys;
        const up = k.has('arrowup') || k.has('w') || this.touch.gas;
        const down = k.has('arrowdown') || k.has('s') || this.touch.brake;
        const left = k.has('arrowleft') || k.has('a') || this.touch.left;
        const right = k.has('arrowright') || k.has('d') || this.touch.right;
        const drift = k.has(' ') || k.has('shift') || this.touch.drift;

        // 轉向做平滑：鍵盤係 -1/0/1，唔平滑就好突兀。
        // 但搖桿唔同——手指位置本身已經係連續值，再平滑就係純粹加延遲：
        // 實測要 0.25 秒先到九成、0.48 秒先到底，而架車自己仲有 steerRate
        // 嘅過渡，兩層疊埋就係「點打都唔夠幅度」。所以搖桿行快好多嘅係數。
        const keyTarget = (right ? 1 : 0) - (left ? 1 : 0);
        const stickActive = this.touchPointers.has('steer') || Math.abs(this.touch.steer) > 0.01;
        const target = stickActive ? this.touch.steer : keyTarget;
        this.steerSmooth += (target - this.steerSmooth) * Math.min(1, dt * (stickActive ? 20 : 9));
        if (Math.abs(this.steerSmooth) < 0.01) this.steerSmooth = 0;

        // 搖桿唔再過曲線（ADR-079 撤回 ADR-077）。壓低中段嘅代價係中段
        // 唔夠軚打：實測 14 m/s 打半軚要 1.91 秒先扭到 45°，直接線性得 1.57，
        // 而 Penny 兩次回饋都係「轉向唔夠」。高速嘅過敏由 steerSpeedDrop
        // 負責，唔應該再用一條曲線喺低速一齊罰。
        let steer = this.steerSmooth;
        if (this.gyro.on && target === 0 && !stickActive) {
            // 預設反轉：實機（Penny 部機，直度揸）扭右邊落去係向左轉，
            // 同直覺相反。裝置係最終標準，desktop 點推導都冇用。
            const sign = this.gyroInvert ? -1 : 1;
            const want = sign * gyroSteer(this.gyro.tilt, this.gyroSens);
            // 平滑：感應器一格格跳，直接出去就會覺得架車自己抽搐
            this.gyroSmooth += (want - this.gyroSmooth) * Math.min(1, dt * 11);
            if (Math.abs(this.gyroSmooth) < 0.004) this.gyroSmooth = 0;
            steer = this.gyroSmooth;
        } else {
            this.gyroSmooth = 0;
        }

        // 簡易模式只要求玩家掌軚、煞車同漂移。比賽未開始時主迴圈唔會 read，
        // 所以自動油門只會喺綠燈後生效；煞車永遠優先，漂移時保留少量動力。
        const throttle = this.controlMode === 'simple'
            ? (down ? -1 : drift ? 0.72 : 1)
            : (up ? 1 : 0) - (down ? 1 : 0);
        return {
            throttle,
            steer: this.invert ? -steer : steer,
            handbrake: drift,
        };
    }
}
