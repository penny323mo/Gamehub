// 車輛動力學：單軌（bicycle）模型 + 輪胎滑移角 + 摩擦圓。
//
// 點解唔用返之前嗰個「速度 + 側向抓地」簡化版：嗰種模型冇「車頭指向」同
// 「行進方向」嘅分別，所以根本做唔到漂移——冇滑移角就冇反打（countersteer），
// 玩家想控制車尾都無從入手。漂移遊戲嘅核心就係三樣嘢：
//
//   1. 車有偏航角速度（yaw rate），車頭可以同行進方向唔一致
//   2. 每條軸各自計滑移角 α，輪胎側向力係 α 嘅非線性函數，有峰值亦有上限
//   3. 抓地力有總量上限（摩擦圓）：踩油搶咗縱向嘅份額，側向就剩得少
//
// 有咗呢三樣，入彎甩尾、反打救車、油門控制角度全部自然發生，唔使特別寫。

import * as THREE from 'three';

export const CFG = {
    mass: 1180,          // kg
    inertia: 1900,       // 偏航轉動慣量 kg·m²（愈細愈靈活／愈易打圈）
    wheelBaseF: 1.35,    // 前軸距重心
    wheelBaseR: 1.45,    // 後軸距重心（後軸長少少＝直路穩定啲）

    // 驅動力 N（後輪驅動）。8500 ≈ 後輪抓地上限（1.7 × 後軸載荷），
    // 再大就變咗淨係空轉：摩擦圓會食晒側向抓地，一踩油就打圈、揸唔到。
    engineForce: 8500,
    brakeForce: 20000,
    reverseForce: 6000,
    maxSpeed: 62,        // m/s 上限
    dragCoef: 2.6,       // 空氣阻力
    rollResist: 220,     // 滾動阻力

    steerMax: 0.62,      // 最大前輪轉角（弧度，約 35°）——低速泊車先用得晒
    // 高速收窄轉角嘅程度。呢個數要夠大：實測 33 m/s 打 2.2° 前輪角就已經
    // 食到 1g（定圓半徑 111 米）。舊值 0.55 喺同一速度容許 22°，即係玩家
    // 隨手一撳就過咗輪胎峰值——車頭反而冇力，跟住車尾自己盪出去打圈。
    steerSpeedDrop: 2.4,
    steerRate: 5.5,      // 軚盤打得幾快（每秒）

    // 輪胎（Pacejka 簡化）：F = D·sin(C·atan(B·α))
    tyreB: 8.2,
    tyreC: 1.55,
    gripFront: 1.45,     // 摩擦係數
    gripRear: 1.7,       // 後 > 前 ＝ 直路穩定；甩尾靠手煞同摩擦圓，唔係靠後輪本身鬆
    handbrakeGrip: 0.45, // 手煞期間後輪抓地剩返幾多（太低會一拉就打圈、救唔返）
    yawDamp: 2.6,        // 偏航阻尼：控制「甩到幾盡」。太細直接打圈，太大就甩唔郁

    loadTransfer: 0.28,  // 加減速嘅前後載荷轉移比例
    offroadGrip: 0.45,   // 落草抓地
    offroadDrag: 2600,
    wallBounce: 0.4,
};

const G = 9.81;

export class Car {
    constructor(model) {
        this.root = new THREE.Group();
        this.root.add(model);
        this.model = model;

        this.pos = new THREE.Vector3();
        this.vel = new THREE.Vector3();   // 世界座標速度
        this.yaw = 0;                     // 車頭方向（弧度，0 = +z）
        this.yawRate = 0;                 // 偏航角速度
        this.steer = 0;                   // 實際前輪角（平滑過渡）

        this.slipAngle = 0;               // 車身滑移角（行進方向 vs 車頭）
        this.drifting = false;
        this.offroad = false;
        this.wallHit = false;
        this.bodyRoll = 0;
    }

    reset(pos, dir) {
        this.pos.copy(pos); this.pos.y = 0;
        this.vel.set(0, 0, 0);
        this.yaw = Math.atan2(dir.x, dir.z);
        this.yawRate = 0;
        this.steer = 0;
        this.slipAngle = 0;
        this.drifting = false;
        this.wallHit = false;
        this.#sync();
    }

    get speed() { return this.vel.length(); }
    get kmh() { return Math.round(this.speed * 3.6); }
    get forwardSpeed() {
        return this.vel.x * Math.sin(this.yaw) + this.vel.z * Math.cos(this.yaw);
    }

    // input: { throttle: -1..1, steer: -1..1, handbrake: bool }
    update(dt, input, track) {
        const fwdX = Math.sin(this.yaw), fwdZ = Math.cos(this.yaw);
        // 側向軸 = 車身 local +x。喺 three.js 右手座標入面，一架向住 +z 嘅車，
        // 佢嘅 local +x 係指住畫面「左」邊（鏡頭喺車後望 +z，畫面右 = 世界 -x）。
        // 成套輪胎／力矩數學就用呢條軸，所以正力＝推向畫面左。
        const latX = fwdZ, latZ = -fwdX;

        // 車身座標速度
        const vLong = this.vel.x * fwdX + this.vel.z * fwdZ;
        const vLat = this.vel.x * latX + this.vel.z * latZ;
        const speed = Math.hypot(vLong, vLat);

        // ---- 轉向：目標角度隨速度收窄，再平滑過渡（軚盤唔會瞬間到底）----
        const speedFactor = 1 / (1 + Math.max(0, speed) * CFG.steerSpeedDrop / 30);
        // input.steer > 0 = 玩家想向畫面右邊；畫面右 = local -x，所以要負號。
        // 唔加呢個負號嘅話，撳右會向左行——同 Penny 早前報嘅「轉向反方向」
        // 係同一個病，只不過嗰次係模型掉轉，今次係物理側向軸嘅符號。
        const target = -input.steer * CFG.steerMax * speedFactor;
        this.steer += (target - this.steer) * Math.min(1, dt * CFG.steerRate);

        this.offroad = !track.isDrivable(this.pos.x, this.pos.z);

        // ---- 縱向力：引擎／煞車／阻力 ----
        let driveF = 0;
        if (input.throttle > 0) driveF = CFG.engineForce * input.throttle;
        else if (input.throttle < 0) {
            driveF = vLong > 0.6 ? -CFG.brakeForce : CFG.reverseForce * input.throttle;
        }
        if (speed > CFG.maxSpeed) driveF = Math.min(driveF, 0);
        const dragF = -CFG.dragCoef * vLong * Math.abs(vLong)
            - Math.sign(vLong) * (CFG.rollResist + (this.offroad ? CFG.offroadDrag : 0));
        const longForce = driveF + dragF;

        // ---- 載荷轉移：加速壓後軸、煞車壓前軸，直接影響各軸抓地上限 ----
        const accelLong = longForce / CFG.mass;
        const wb = CFG.wheelBaseF + CFG.wheelBaseR;
        const staticF = CFG.mass * G * CFG.wheelBaseR / wb;
        const staticR = CFG.mass * G * CFG.wheelBaseF / wb;
        const shift = CFG.mass * accelLong * CFG.loadTransfer;
        const loadF = Math.max(200, staticF - shift);
        const loadR = Math.max(200, staticR + shift);

        // ---- 滑移角：輪胎指向 vs 該軸實際行進方向 ----
        const vRef = Math.max(2.5, Math.abs(vLong));   // 低速唔好除到爆
        const dir = Math.sign(vLong) || 1;
        const slipF = Math.atan2(vLat + this.yawRate * CFG.wheelBaseF, vRef) - this.steer * dir;
        const slipR = Math.atan2(vLat - this.yawRate * CFG.wheelBaseR, vRef);

        // ---- 輪胎側向力 ＋ 摩擦圓 ----
        const surface = this.offroad ? CFG.offroadGrip : 1;
        const frontGrip = CFG.gripFront * surface;
        const rearGrip = CFG.gripRear * surface * (input.handbrake ? CFG.handbrakeGrip : 1);
        // 驅動／煞車用咗幾多抓地，側向就剩返幾多——踩爆油會甩尾就係呢度嚟
        const rearLongUse = Math.min(0.95, Math.abs(driveF) / Math.max(1, rearGrip * loadR));
        const rearCircle = Math.sqrt(Math.max(0, 1 - rearLongUse * rearLongUse));

        const tyre = (slip, grip, load) =>
            -grip * load * Math.sin(CFG.tyreC * Math.atan(CFG.tyreB * slip));

        const latF = tyre(slipF, frontGrip, loadF);
        let latR = tyre(slipR, rearGrip * rearCircle, loadR);
        // 偏航阻尼：模擬輪胎鬆弛同懸掛，防止細小擾動滾成原地打圈。
        // 後軸力矩係 -wheelBaseR·latR，所以要「加」先至同 yawRate 反方向；
        // 減嘅話變咗正回授——轉彎轉到一半自己愈轉愈急，最後打圈。
        latR += this.yawRate * CFG.yawDamp * loadR * 0.02;

        // ---- 合力 → 加速度 ----
        const fx = longForce - latF * Math.sin(this.steer);
        const fy = latF * Math.cos(this.steer) + latR;
        const aLong = fx / CFG.mass;
        const aLat = fy / CFG.mass;

        // 偏航力矩：前軸推頭、後軸擺尾
        const torque = CFG.wheelBaseF * latF * Math.cos(this.steer) - CFG.wheelBaseR * latR;
        this.yawRate += (torque / CFG.inertia) * dt;
        if (speed < 1.2) this.yawRate *= Math.max(0, 1 - dt * 6);   // 停定唔好殘餘自轉
        this.yaw += this.yawRate * dt;

        // 車身座標加速度 → 世界座標。
        // 注意：一定要用「呢一幀開頭嗰對車身軸」（fwd／lat）還原，唔可以用轉完
        // 之後嘅新軸。用新軸嘅話速度向量會硬跟住車頭一齊轉，車頭同行進方向
        // 永遠對齊——滑移角起唔到過 aLat·dt，即係根本冇得漂移。呢個就係
        // 「喺柏油路點打軚都得 6°、落草反而甩到 70°」嗰個病嘅根源。
        const newVLong = vLong + aLong * dt;
        const newVLat = vLat + aLat * dt;
        this.vel.set(
            fwdX * newVLong + latX * newVLat,
            0,
            fwdZ * newVLong + latZ * newVLat,
        );

        // ---- 位置 + 撞欄 ----
        const next = this.pos.clone().addScaledVector(this.vel, dt);
        this.wallHit = false;
        this.#collide(next, track);
        this.pos.copy(next);

        // ---- 漂移狀態 ----
        // 滑移角要用「轉完之後」嘅車頭方向同新速度量，先反映到車尾甩咗幾多
        const nFwdX = Math.sin(this.yaw), nFwdZ = Math.cos(this.yaw);
        const sLong = this.vel.x * nFwdX + this.vel.z * nFwdZ;
        const sLat = this.vel.x * nFwdZ - this.vel.z * nFwdX;
        this.slipAngle = Math.abs(sLong) < 0.5 ? 0 : Math.atan2(sLat, Math.abs(sLong));
        this.drifting = Math.abs(this.slipAngle) > 0.19 && this.speed > 7;   // 約 11°

        // 車身側傾：跟離心力，唔係跟軚盤——甩緊尾嗰陣兩者方向唔同
        const targetRoll = THREE.MathUtils.clamp(-aLat / 26, -0.16, 0.16);
        this.bodyRoll += (targetRoll - this.bodyRoll) * Math.min(1, dt * 7);
        this.#sync();
    }

    // 撞欄：四邊試探砌出一條牆法線，然後淨係抵消「撞入去」嗰個分量。
    // 舊版係逐條軸直接 next.x = pos.x，等於連沿住欄杆滑行嗰個分量都殺埋——
    // 車頭一頂到欄就原地釘死，踩爆油都郁唔到（自動駕駛實測撞完 v=0 到收場）。
    #collide(next, track) {
        const r = 1.2;   // 車身半闊（世界單位）——唔可以跟 BLOCK 縮，否則細格會鑽穿欄杆
        let nx = 0, nz = 0;
        if (track.isWall(next.x + r, next.z)) nx -= 1;
        if (track.isWall(next.x - r, next.z)) nx += 1;
        if (track.isWall(next.x, next.z + r)) nz -= 1;
        if (track.isWall(next.x, next.z - r)) nz += 1;
        if (nx === 0 && nz === 0) return;
        this.wallHit = true;
        const len = Math.hypot(nx, nz);
        nx /= len; nz /= len;                       // 法線：由牆指返出空地
        // 位置：抵消呢一步入牆嘅部分，沿牆方向照行
        const push = (next.x - this.pos.x) * nx + (next.z - this.pos.z) * nz;
        if (push < 0) { next.x -= nx * push; next.z -= nz * push; }
        // 速度：入牆分量反彈，切向分量保留（再食少少摩擦）
        const into = this.vel.x * nx + this.vel.z * nz;
        if (into < 0) {
            this.vel.x -= nx * into * (1 + CFG.wallBounce);
            this.vel.z -= nz * into * (1 + CFG.wallBounce);
        }
        this.vel.multiplyScalar(0.86);
        this.yawRate *= 0.5;
    }

    #sync() {
        this.root.position.set(this.pos.x, 0, this.pos.z);
        this.root.rotation.set(0, this.yaw, this.bodyRoll, 'YZX');
    }
}
