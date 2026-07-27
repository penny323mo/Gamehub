// 電腦車手：pure-pursuit 追線 ＋ 曲率限速。
//
// 呢個控制器本來喺 tests/race.mjs 入面淨係做「自動駕駛跑三圈」嘅把關，
// 而家搬咗出嚟做真正嘅對手。兩邊用同一份 code 係有意嘅：測試每次跑完
// 三條賽道，就等於同時驗咗對手唔會卡死、唔會兜路、唔會撞到面目全非。
//
// 三個部分：
//   1. 追線：望前一段（速度愈快望愈遠），扭向嗰個點
//   2. 限速：睇前面嘅曲率半徑，連埋煞車距離，計出而家最多行幾快
//   3. 救車：滑移角大就收油兼以反打為主——一路滑一路踩爆油只會打圈

import * as THREE from 'three';

// 難度：latG 係肯食幾多側向 g（架車真係食到約 1g），look 係望前幾遠。
// 三個難度嘅 latG 特登夾得好埋（6.0 / 6.2 / 6.4）。實測 latG 一低過 5.5
// 反而更差：慢入彎令車喺彎入面留耐咗，個簡單控制器有更多時間累積追線
// 誤差。差異主要靠望前距離同煞車能力，唔係靠「肯唔肯食 g」。
export const SKILLS = {
    steady: { latG: 6.0, look: 0.5, brakeA: 8.6, name: '穩陣' },
    quick: { latG: 6.2, look: 0.55, brakeA: 9, name: '進取' },
    ace: { latG: 6.4, look: 0.62, brakeA: 9.6, name: '好手' },
};

export function createDriver(track, skill = SKILLS.quick) {
    const P = new THREE.Vector3(), Q = new THREE.Vector3(), R = new THREE.Vector3();
    const to = new THREE.Vector3(), fwd = new THREE.Vector3();

    // 三點定圓：估中線喺 t 附近嘅曲率半徑
    const radiusAt = (t) => {
        P.copy(track.curve.getPointAt((t + 1 - 0.012) % 1));
        Q.copy(track.curve.getPointAt(t % 1));
        R.copy(track.curve.getPointAt((t + 0.012) % 1));
        const a = P.distanceTo(Q), b = Q.distanceTo(R), c = P.distanceTo(R);
        const area = Math.abs((Q.x - P.x) * (R.z - P.z) - (R.x - P.x) * (Q.z - P.z)) / 2;
        return area < 1e-4 ? 1e4 : (a * b * c) / (4 * area);
    };

    return {
        radiusAt,
        // lateral：想行喺中線嘅左／右幾多米（用嚟分開起跑格同走位）
        read(car, t, lateral = 0) {
            const speed = car.speed;
            const aheadT = (t + (8 + speed * skill.look) / track.length) % 1;
            const aim = track.curve.getPointAt(aheadT);
            if (lateral) {
                const tan = track.curve.getTangentAt(aheadT);
                aim.x += -tan.z * lateral;
                aim.z += tan.x * lateral;
            }
            to.set(aim.x - car.pos.x, 0, aim.z - car.pos.z).normalize();
            fwd.set(Math.sin(car.yaw), 0, Math.cos(car.yaw));

            // 望幾遠由煞車距離反推：長直路接急彎嗰陣，死板望前 90 米
            // 係一定唔夠位收速——見到個彎嗰陣已經入唔到。
            const scan = Math.min(400, speed * speed / (2 * skill.brakeA) + 30);
            let vMax = 70;
            for (let d = 0; d <= scan; d += 6) {
                const vc = Math.sqrt(skill.latG * radiusAt((t + d / track.length) % 1));
                vMax = Math.min(vMax, Math.sqrt(vc * vc + 2 * skill.brakeA * d));
            }

            const angErr = Math.atan2(fwd.x * to.z - fwd.z * to.x, fwd.dot(to));
            // 收油救車只喺有速度嗰陣先有意義。慢車又減油嘅話，喺草地上面
            // 油門推力細過 offroadDrag，架車永遠爬唔返上賽道。
            const slip = Math.abs(car.slipAngle);
            const ease = (slip > 0.3 && speed > 10)
                ? Math.max(0.15, 1 - (slip - 0.3) * 2.2)
                : 1;
            return {
                throttle: Math.max(-1, Math.min(1, (vMax - speed) * 0.35)) * ease,
                steer: Math.max(-1, Math.min(1, angErr * 1.7 * ease - car.slipAngle * 1.3)),
                handbrake: false,
            };
        },
    };
}
