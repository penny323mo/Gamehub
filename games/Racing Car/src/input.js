// 鍵盤 + 觸控 + 陀螺儀。三邊都輸出同一個 { throttle, steer, handbrake }，
// 遊戲本身唔需要知玩家用緊乜。

export const STEER_KEY = 'racer-invert-steer';
export const GYRO_KEY = 'racer-gyro';
export const GYRO_SENS_KEY = 'racer-gyro-sens';

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
        this.gyroSens = Number(localStorage.getItem(GYRO_SENS_KEY) ?? 1);

        // 陀螺儀
        this.gyro = { on: false, tilt: 0, zero: null, supported: 'DeviceOrientationEvent' in window };

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
                if (this.touchPointers.get(ev.pointerId) !== 'steer') return;
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
