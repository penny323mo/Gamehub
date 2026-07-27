// 街機風車輛物理。唔做真實懸掛／輪胎模型——目標係「一上手就識玩，
// 入彎收油會有回報」。核心係三樣：引擎推力、速度相關轉向、側向抓地。

import * as THREE from 'three';
import { BLOCK } from './track.js';

const CFG = {
    engine: 26,          // 引擎加速度（單位/秒²）
    brake: 42,           // 煞車減速
    drag: 0.42,          // 空氣阻力係數（同速度平方成正比）
    rollDrag: 3.2,       // 滾動阻力
    maxSpeed: 54,   // 再快就變咗一眨眼過晒彎；街機要嘅係「快得嚟揸得住」
    reverseMax: 14,
    steerRate: 2.1,      // 每秒最大轉向角速度（弧度）
    steerAtSpeed: 0.34,  // 高速時轉向收窄嘅程度
    grip: 7.5,           // 側向抓地（愈大愈唔會飄）
    driftGrip: 2.6,      // 手煞側滑時嘅抓地
    offroadDrag: 14,     // 落草嘅額外阻力
    offroadMax: 22,      // 落草嘅極速上限
    wallBounce: 0.35,    // 撞欄反彈
};

export class Car {
    constructor(model) {
        this.root = new THREE.Group();
        this.root.add(model);
        this.model = model;
        this.pos = new THREE.Vector3();
        this.vel = new THREE.Vector3();   // 世界速度（y 一直係 0）
        this.heading = 0;                 // 車頭方向（弧度，0 = +x）
        this.speed = 0;                   // 沿車頭方向嘅速度（負 = 倒車）
        this.drifting = false;
        this.offroad = false;
        this.bodyRoll = 0;
    }

    reset(pos, dir) {
        this.pos.copy(pos);
        this.pos.y = 0;
        this.vel.set(0, 0, 0);
        this.speed = 0;
        this.heading = Math.atan2(dir.x, dir.z);
        this.#sync();
    }

    // input: { throttle: -1..1, steer: -1..1, handbrake: bool }
    update(dt, input, track) {
        const fwd = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
        const right = new THREE.Vector3(fwd.z, 0, -fwd.x);

        // 轉向：企定唔轉得，愈快轉幅愈細（唔係咁樣高速會即刻打圈）
        const speedAbs = Math.abs(this.speed);
        const steerScale = Math.min(1, speedAbs / 6) / (1 + speedAbs * CFG.steerAtSpeed / 10);
        this.heading += input.steer * CFG.steerRate * steerScale * dt * Math.sign(this.speed || 1);

        // 縱向：油門／煞車／阻力
        const throttle = input.throttle;
        let accel = 0;
        if (throttle > 0) accel = CFG.engine * throttle;
        else if (throttle < 0) accel = (this.speed > 0.5 ? -CFG.brake : CFG.engine * 0.55 * throttle);
        this.offroad = !track.isDrivable(this.pos.x, this.pos.z);
        const drag = CFG.rollDrag + (this.offroad ? CFG.offroadDrag : 0);
        accel -= Math.sign(this.speed) * (CFG.drag * this.speed * this.speed / 100 + drag * 0.1);
        this.speed += accel * dt;

        const cap = this.offroad ? CFG.offroadMax : CFG.maxSpeed;
        this.speed = Math.max(-CFG.reverseMax, Math.min(cap, this.speed));
        if (Math.abs(this.speed) < 0.05 && throttle === 0) this.speed = 0;

        // 側向抓地：車身速度分解成前後 + 左右，左右嗰截逐漸食走
        const vFwd = fwd.clone().multiplyScalar(this.speed);
        const lateral = this.vel.clone().sub(fwd.clone().multiplyScalar(this.vel.dot(fwd)));
        this.drifting = input.handbrake && speedAbs > 8;
        const grip = this.drifting ? CFG.driftGrip : CFG.grip;
        lateral.multiplyScalar(Math.max(0, 1 - grip * dt));
        // 轉向會產生側向速度（就係「車頭指過去、車身跟住甩」嗰種感覺）
        lateral.add(right.clone().multiplyScalar(input.steer * speedAbs * (this.drifting ? 0.5 : 0.16) * dt));
        this.vel.copy(vFwd).add(lateral);

        const next = this.pos.clone().addScaledVector(this.vel, dt);
        this.#collide(next, track);
        this.pos.copy(next);

        // 車身側傾：轉向 + 側滑，畀返少少重量感
        const targetRoll = -input.steer * Math.min(1, speedAbs / 30) * 0.12;
        this.bodyRoll += (targetRoll - this.bodyRoll) * Math.min(1, dt * 6);
        this.#sync();
    }

    // 撞欄：分開 x／z 試探，撞到就抵返嗰個軸並反彈
    #collide(next, track) {
        const r = BLOCK * 0.6;
        for (const [dx, dz] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
            if (!track.isWall(next.x + dx, next.z + dz)) continue;
            if (dx !== 0) {
                next.x = this.pos.x;
                this.vel.x *= -CFG.wallBounce;
            } else {
                next.z = this.pos.z;
                this.vel.z *= -CFG.wallBounce;
            }
            this.speed *= 0.55;
        }
    }

    #sync() {
        this.root.position.set(this.pos.x, 0, this.pos.z);
        this.root.rotation.set(0, this.heading, this.bodyRoll, 'YZX');
    }

    get kmh() { return Math.round(Math.abs(this.speed) * 3.6 * 1.4); }
}
