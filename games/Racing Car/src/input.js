// 鍵盤 + 觸控 + 陀螺儀。三邊都輸出同一個 { throttle, steer, handbrake }，
// 遊戲本身唔需要知玩家用緊乜。

export const STEER_KEY = 'racer-invert-steer';
export const GYRO_KEY = 'racer-gyro';
export const GYRO_SENS_KEY = 'racer-gyro-sens';

export class Input {
    constructor(root) {
        this.keys = new Set();
        this.touch = { left: false, right: false, steer: 0, gas: false, brake: false, drift: false };
        this.touchPointers = new Map();
        this.gasGestureAction = null;
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

        // 煞車／飄移可以直接撳；亦可以由主油門一路按住滑過去切換。
        const actionIds = { gas: 'pad-gas', brake: 'pad-brake', drift: 'pad-drift' };
        const syncActions = () => {
            for (const [prop, id] of Object.entries(actionIds)) {
                this.touch[prop] = this.touchPointers.has(prop) || this.gasGestureAction === prop;
                root.querySelector(`#${id}`)?.classList.toggle('held', this.touch[prop]);
            }
        };
        for (const [id, prop] of [['pad-brake', 'brake'], ['pad-drift', 'drift']]) {
            const el = root.querySelector(`#${id}`);
            if (!el) continue;
            const down = (ev) => {
                ev.preventDefault();
                this.touchPointers.set(prop, ev.pointerId);
                syncActions();
                // 手指稍為滑出圓角掣都繼續收 input，直到真正放手；兩隻手指
                // 各自 capture 自己嗰粒掣，所以油門 + 轉向可以同時成立。
                try { el.setPointerCapture(ev.pointerId); } catch { }
            };
            const up = (ev) => {
                if (this.touchPointers.get(prop) !== ev.pointerId) return;
                ev.preventDefault();
                this.touchPointers.delete(prop);
                syncActions();
            };
            el.addEventListener('pointerdown', down);
            el.addEventListener('pointerup', up);
            el.addEventListener('pointercancel', up);
            el.addEventListener('lostpointercapture', up);
        }

        const gas = root.querySelector('#pad-gas');
        if (gas) {
            const actionAt = (x, y) => {
                const gasRect = gas.getBoundingClientRect();
                const cx = gasRect.left + gasRect.width / 2;
                const cy = gasRect.top + gasRect.height / 2;
                const dx = x - cx, dy = y - cy;
                // 右拇指由油門向左滑：水平／左下係煞車，左上係飄移。
                // 用方向區而唔係只靠另一粒圓形 hitbox，滑過兩掣之間都唔會斷動作。
                if (dx < -gasRect.width * 0.28) {
                    return dy < -gasRect.height * 0.34 ? 'drift' : 'brake';
                }
                return 'gas';
            };
            const move = (ev) => {
                if (this.touchPointers.get('action') !== ev.pointerId) return;
                ev.preventDefault();
                this.gasGestureAction = actionAt(ev.clientX, ev.clientY);
                syncActions();
            };
            const down = (ev) => {
                ev.preventDefault();
                this.touchPointers.set('action', ev.pointerId);
                this.gasGestureAction = 'gas';
                syncActions();
                root.querySelector('.pad-side.right')?.classList.add('gesture-active');
                try { gas.setPointerCapture(ev.pointerId); } catch { }
            };
            const up = (ev) => {
                if (this.touchPointers.get('action') !== ev.pointerId) return;
                ev.preventDefault();
                this.touchPointers.delete('action');
                this.gasGestureAction = null;
                syncActions();
                root.querySelector('.pad-side.right')?.classList.remove('gesture-active');
            };
            gas.addEventListener('pointerdown', down);
            gas.addEventListener('pointermove', move);
            gas.addEventListener('pointerup', up);
            gas.addEventListener('pointercancel', up);
            gas.addEventListener('lostpointercapture', up);
        }

        // 現代 MOBA 式浮動搖桿：左手區任何位置都可以落手，底盤會移到
        // 拇指下面；拖動距離直接變成 -1..1 嘅連續轉向。Pointer capture
        // 令手指拖出起手區同圓盤之後都繼續收 input，直到真正放手。
        const zone = root.querySelector('#steer-zone');
        const stick = root.querySelector('#steer-stick');
        const knob = root.querySelector('#steer-knob');
        if (zone && stick && knob) {
            const placeBase = (ev) => {
                const zoneRect = zone.getBoundingClientRect();
                const size = stick.getBoundingClientRect().width;
                const radius = size / 2;
                const x = Math.max(radius, Math.min(zoneRect.width - radius, ev.clientX - zoneRect.left));
                const y = Math.max(radius, Math.min(zoneRect.height - radius, ev.clientY - zoneRect.top));
                stick.style.left = `${(x - radius).toFixed(1)}px`;
                stick.style.top = `${(y - radius).toFixed(1)}px`;
                stick.style.bottom = 'auto';
            };
            const move = (ev) => {
                if (this.touchPointers.get('steer') !== ev.pointerId) return;
                ev.preventDefault();
                const rect = stick.getBoundingClientRect();
                const max = Math.max(1, rect.width * 0.34);
                let dx = ev.clientX - (rect.left + rect.width / 2);
                let dy = ev.clientY - (rect.top + rect.height / 2);
                const distance = Math.hypot(dx, dy);
                if (distance > max) { dx *= max / distance; dy *= max / distance; }
                this.touch.steer = Math.max(-1, Math.min(1, dx / max));
                if (Math.abs(this.touch.steer) < 0.08) this.touch.steer = 0;
                knob.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
                stick.setAttribute('aria-valuenow', String(Math.round(this.touch.steer * 100)));
            };
            const down = (ev) => {
                ev.preventDefault();
                this.touchPointers.set('steer', ev.pointerId);
                placeBase(ev);
                stick.classList.add('held');
                zone.classList.add('held');
                try { zone.setPointerCapture(ev.pointerId); } catch { }
                move(ev);
            };
            const up = (ev) => {
                if (this.touchPointers.get('steer') !== ev.pointerId) return;
                ev.preventDefault();
                this.touchPointers.delete('steer');
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
        this.gasGestureAction = null;
        for (const key of Object.keys(this.touch)) this.touch[key] = false;
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
        const keyTarget = (right ? 1 : 0) - (left ? 1 : 0);
        const stickActive = this.touchPointers.has('steer') || Math.abs(this.touch.steer) > 0.01;
        const target = stickActive ? this.touch.steer : keyTarget;
        this.steerSmooth += (target - this.steerSmooth) * Math.min(1, dt * 9);
        if (Math.abs(this.steerSmooth) < 0.01) this.steerSmooth = 0;

        // 陀螺儀：±22 度（乘靈敏度）打到盡。手指撳掣有輸入嗰陣以手指優先，
        // 唔係嘅話兩種輸入會打交。
        let steer = this.steerSmooth;
        if (this.gyro.on && target === 0 && !stickActive) {
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
