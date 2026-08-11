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
// brakeA 要對得返實際攞得到嘅減速度。物理改成「制動受摩擦圓限制」之後，
// 直線煞車係 1.19 g（11.7 m/s²），但一打軚 ABS 就讓返抓地畀側向，實際
// 得七八成。舊值 8.6–9.6 係對住舊嘅 1.84 g 制動調嘅，煞車點太遲——
// 海岸即刻由 6 幀掂欄變 259 幀。
// latG 由 6.0–6.4 升到 7.2–7.8。原本嗰組係對住舊嘅車調嘅，而家架車實測
// 定圓可以食 1.25 g（12.3 m/s²），入彎輔助（ADR-079）AI 一樣用得——即係
// 對手一直只用咗架車一半嘅過彎能力。升上去唔係作弊，係校準返真實能力。
// 六條賽道逐個掃：7.5 之下三圈由 95–112 秒收到 88–107 秒，而掂欄、落草、
// 救車全部維持 0；9.0 開始爆（coast-rev 救車 291 幀、落草 6%），10.5 就
// 換 coast 爆。所以 7.5 係「攞得到而唔會撞」嘅邊界，三個難度照舊夾埋。
export const SKILLS = {
    steady: { latG: 7.2, look: 0.5, brakeA: 7.2, name: '穩陣' },
    quick: { latG: 7.5, look: 0.55, brakeA: 7.6, name: '進取' },
    ace: { latG: 7.8, look: 0.62, brakeA: 8.1, name: '好手' },
};

export function createDriver(track, skill = SKILLS.quick) {
    const P = new THREE.Vector3(), Q = new THREE.Vector3(), R = new THREE.Vector3();
    const aim = new THREE.Vector3(), aimTan = new THREE.Vector3();
    const to = new THREE.Vector3(), fwd = new THREE.Vector3();

    // 打圈之後嘅復原：獨立狀態，唔係喺賽車控制律入面加修正項。
    //
    // ADR-062 記低咗四個「調一個常數」嘅方案點解全部失敗：賽車同救車係兩件
    // 相反嘅事（一個要快、一個要停），夾埋一條式度，改到救得返就一定會拖慢
    // 正常過彎。真正嘅分別喺入場條件夠辣——慢過 6 m/s 而且車頭指錯 80° 以上，
    // 正常揸車永遠唔會踩中，所以賽車路徑完全冇被碰過。
    const RECOVER_ENTER_SPEED = 6, RECOVER_ENTER_ANGLE = 1.4;
    const RECOVER_EXIT_ANGLE = 0.7, RECOVER_MAX = 3.5;
    let recoverFor = 0;

    // 三點定圓：估中線喺 t 附近嘅曲率半徑。
    //
    // 取樣窗口 0.008（≈ ±6 米）唔係求其揀：原本用 0.012（±8.4 米）對短促
    // 嘅急彎會「平滑」咗個彎，半徑估得太大，於是入彎速度批得太高。實測
    // 六條賽道嘅掂欄總幀數 1290 → 559、拖車 7 → 3，山道逆向由 569 幀變 0，
    // 正向三條基本上唔變（0/9/0 → 1/6/0），單圈時間亦冇明顯變慢。
    // 再窄（0.006、0.004）反而差返轉頭：估得太局部，直路上嘅微小彎曲
    // 都會被當成彎，車手無端端喺直路收油。
    const CURVE_WINDOW = 0.008;
    const radiusAt = (t) => {
        // CatmullRomCurve3 支援 optionalTarget；AI 每幀會重複估曲率，唔可以
        // 令每個取樣都 new 三個 Vector3，否則手機長直路會由 GC 製造長幀。
        track.curve.getPointAt((t + 1 - CURVE_WINDOW) % 1, P);
        track.curve.getPointAt(t % 1, Q);
        track.curve.getPointAt((t + CURVE_WINDOW) % 1, R);
        const a = P.distanceTo(Q), b = Q.distanceTo(R), c = P.distanceTo(R);
        const area = Math.abs((Q.x - P.x) * (R.z - P.z) - (R.x - P.x) * (Q.z - P.z)) / 2;
        return area < 1e-4 ? 1e4 : (a * b * c) / (4 * area);
    };

    return {
        radiusAt,
        get recovering() { return recoverFor > 0; },
        // lateral：想行喺中線嘅左／右幾多米（用嚟分開起跑格同走位）
        read(car, t, lateral = 0, dt = 1 / 60) {
            const speed = car.speed;
            const aheadT = (t + (8 + speed * skill.look) / track.length) % 1;
            track.curve.getPointAt(aheadT, aim);
            if (lateral) {
                // 走線偏移只需要方向；用 Track 嘅 cached query samples，唔好每架
                // 對手每幀都重新取 Catmull-Rom tangent。aim 點本身仍然保留 spline
                // 精度，避免改變對手真正追嘅路線。
                if (track.tangentAtT) track.tangentAtT(aheadT, aimTan);
                else track.curve.getTangentAt(aheadT, aimTan);
                aim.x += -aimTan.z * lateral;
                aim.z += aimTan.x * lateral;
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

            // ---- 復原狀態 ----
            if (recoverFor <= 0 && speed < RECOVER_ENTER_SPEED
                && Math.abs(angErr) > RECOVER_ENTER_ANGLE) {
                recoverFor = RECOVER_MAX;
            }
            if (recoverFor > 0) {
                recoverFor -= dt;
                const done = Math.abs(angErr) < RECOVER_EXIT_ANGLE && !car.offroad;
                if (done || recoverFor <= 0) recoverFor = 0;
                else {
                    // throttle -1 喺 car.js 度會自動分工：仲向前行就係煞車，
                    // 停咗就變倒車。所以一條指令就做齊「停低」同「退返出嚟」。
                    // 軚打反方向：倒車嗰陣車尾行先，軚反打先擺得返車頭向賽道。
                    return {
                        throttle: -1,
                        steer: Math.max(-1, Math.min(1, -angErr * 1.2)),
                        handbrake: false, assist: false,
                    };
                }
            }

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
                // AI 已經有自己嘅路線、收油同反打控制器，唔可以再疊玩家輔助搶軚。
                assist: false,
            };
        },
    };
}
