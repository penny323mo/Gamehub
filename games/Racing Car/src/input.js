// 鍵盤 + 觸控 + 陀螺儀。三邊都輸出同一個 { throttle, steer, handbrake }，
// 遊戲本身唔需要知玩家用緊乜。

export const STEER_KEY = 'racer-invert-steer';
export const GYRO_KEY = 'racer-gyro';
export const GYRO_SENS_KEY = 'racer-gyro-sens';

export class Input {
    constructor(root) {
        this.keys = new Set();
        this.touch = { left: false, right: false, gas: false, brake: false, drift: false };
        this.touchPointers = new Map();
        this.steerSmooth = 0;

        // 設定：轉向反轉係畀 Penny 嘅逃生門。所有量度（物理、鏡頭右向量、
        // 端到端撳掣測試）都話而家個方向啱，但玩家先係最終標準——與其
        // 靠估，不如畀佢一撳就掉轉。
        this.invert = localStorage.getItem(STEER_KEY) === '1';
        this.gyroSens = Number(localStorage.getItem(GYRO_SENS_KEY) ?? 1);

        // 陀螺儀
        this.gyro = { on: false, tilt: 0, zero: null, supported: 'DeviceOrientationEvent' in window };

        addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
            this.keys.add(e.key.toLowerCase());
        });
        addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
        addEventListener('blur', () => this.reset(root));

        // 觸控掣：pointer 事件一次過搞掂滑鼠同手指
        for (const [id, prop] of [['pad-left', 'left'], ['pad-right', 'right'],
                                  ['pad-gas', 'gas'], ['pad-brake', 'brake'], ['pad-drift', 'drift']]) {
            const el = root.querySelector(`#${id}`);
            if (!el) continue;
            const down = (ev) => {
                ev.preventDefault();
                this.touchPointers.set(prop, ev.pointerId);
                this.touch[prop] = true;
                el.classList.add('held');
                // 手指稍為滑出圓角掣都繼續收 input，直到真正放手；兩隻手指
                // 各自 capture 自己嗰粒掣，所以油門 + 轉向可以同時成立。
                try { el.setPointerCapture(ev.pointerId); } catch { }
            };
            const up = (ev) => {
                if (this.touchPointers.get(prop) !== ev.pointerId) return;
                ev.preventDefault();
                this.touchPointers.delete(prop);
                this.touch[prop] = false;
                el.classList.remove('held');
            };
            el.addEventListener('pointerdown', down);
            el.addEventListener('pointerup', up);
            el.addEventListener('pointercancel', up);
        }
    }

    reset(root = document) {
        this.keys.clear();
        this.touchPointers.clear();
        for (const key of Object.keys(this.touch)) this.touch[key] = false;
        this.steerSmooth = 0;
        root.querySelectorAll?.('.pad-btn.held').forEach(el => el.classList.remove('held'));
    }

    setInvert(v) {
        this.invert = !!v;
        try { localStorage.setItem(STEER_KEY, v ? '1' : '0'); } catch { }
    }
    setGyroSens(v) {
        this.gyroSens = v;
        try { localStorage.setItem(GYRO_SENS_KEY, String(v)); } catch { }
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
    calibrateGyro() { this.gyro.zero = null; }

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

        // 轉向做平滑：直接 -1/0/1 會好突兀，尤其係鍵盤
        const target = (right ? 1 : 0) - (left ? 1 : 0);
        this.steerSmooth += (target - this.steerSmooth) * Math.min(1, dt * 9);
        if (Math.abs(this.steerSmooth) < 0.01) this.steerSmooth = 0;

        // 陀螺儀：±22 度（乘靈敏度）打到盡。手指撳掣有輸入嗰陣以手指優先，
        // 唔係嘅話兩種輸入會打交。
        let steer = this.steerSmooth;
        if (this.gyro.on && target === 0) {
            const span = 22 / Math.max(0.3, this.gyroSens);
            steer = Math.max(-1, Math.min(1, this.gyro.tilt / span));
            if (Math.abs(steer) < 0.06) steer = 0;      // 死區：唔會自己遊走
        }

        return {
            throttle: (up ? 1 : 0) - (down ? 1 : 0),
            steer: this.invert ? -steer : steer,
            handbrake: drift,
        };
    }
}
