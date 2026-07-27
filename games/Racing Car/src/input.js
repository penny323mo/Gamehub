// 鍵盤 + 觸控。兩邊都輸出同一個 { throttle, steer, handbrake }，
// 遊戲本身唔需要知玩家用緊乜。

export class Input {
    constructor(root) {
        this.keys = new Set();
        this.touch = { left: false, right: false, gas: false, brake: false, drift: false };
        this.steerSmooth = 0;

        addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
            this.keys.add(e.key.toLowerCase());
        });
        addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
        addEventListener('blur', () => this.keys.clear());

        // 觸控掣：pointer 事件一次過搞掂滑鼠同手指
        for (const [id, prop] of [['pad-left', 'left'], ['pad-right', 'right'],
                                  ['pad-gas', 'gas'], ['pad-brake', 'brake'], ['pad-drift', 'drift']]) {
            const el = root.querySelector(`#${id}`);
            if (!el) continue;
            const on = (v) => (ev) => { ev.preventDefault(); this.touch[prop] = v; el.classList.toggle('held', v); };
            el.addEventListener('pointerdown', on(true));
            el.addEventListener('pointerup', on(false));
            el.addEventListener('pointercancel', on(false));
            el.addEventListener('pointerleave', on(false));
        }
    }

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

        return {
            throttle: (up ? 1 : 0) - (down ? 1 : 0),
            steer: this.steerSmooth,
            handbrake: drift,
        };
    }
}
