// 郁動嘅重量：兩條純函數，喺 Node 度直接量，唔使開瀏覽器。
import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseBossMove, BOSS_REACH, LEAP_MIN_RANGE, LEAP_MAX_RANGE } from '../src/boss.ts';
import { TURN_RATE, TURN_RATE_ENEMY, TURN_RATE_BOSS, ACCEL, DECEL, turnToward, approachSpeed, snapShadowTarget, gaitStep } from '../src/motion.ts';

test('轉身有速度上限，而且行最短弧', () => {
    const dt = 1 / 60;
    // 一個 180° 反向唔可以一步做完
    let a = 0;
    const 步 = [];
    for (let i = 0; i < 200 && Math.abs(Math.atan2(Math.sin(Math.PI - a), Math.cos(Math.PI - a))) > 1e-6; i++) {
        const 前 = a;
        a = turnToward(a, Math.PI, dt);
        步.push(Math.abs(a - 前));
    }
    assert.ok(步.length > 1, '一步就轉完 180°');
    assert.ok(Math.max(...步) <= TURN_RATE * dt + 1e-9, `一步轉咗 ${Math.max(...步)}`);
    // 180° ÷ 9 rad/s ≈ 0.35 秒
    const 秒 = 步.length * dt;
    assert.ok(秒 > 0.3 && 秒 < 0.42, `轉 180° 用咗 ${秒.toFixed(2)} 秒`);

    // 最短弧：由 350° 去 10° 應該向前轉 20°，唔係向後轉 340°
    const 由 = (350 * Math.PI) / 180, 去 = (10 * Math.PI) / 180;
    assert.ok(turnToward(由, 去, dt) > 由, '揀咗長嗰邊');
});

test('敵人轉得慢過玩家，boss 慢過雜兵', () => {
    assert.ok(TURN_RATE_BOSS < TURN_RATE_ENEMY, 'boss 應該轉得最慢');
    assert.ok(TURN_RATE_ENEMY < TURN_RATE, '雜兵應該轉得慢過玩家');
    // 「繞到佢背後」要做得到：玩家繞半個圈嘅時間，boss 唔追得晒。
    const dt = 1 / 60;
    let boss = 0;
    for (let t = 0; t < 0.35; t += dt) boss = turnToward(boss, Math.PI, dt, TURN_RATE_BOSS);
    assert.ok(boss < Math.PI * 0.75, `boss 0.35 秒轉咗 ${(boss * 180 / Math.PI).toFixed(0)}°，繞後冇意義`);
});

test('起步同煞停都要時間，而且煞停快過起步', () => {
    // 呢條本來寫住 `全速 = 12.5`——一個遊戲一早唔再用嘅數（職業卡而家係
    // 4.4）。支尺量緊一個唔存在嘅機制，就永遠唔會紅。
    const dt = 1 / 60, 全速 = 4.4;
    let v = 0, n = 0;
    while (v < 全速 && n < 6000) { v = approachSpeed(v, 全速, dt); n++; }
    const 起步秒 = n * dt;
    assert.ok(起步秒 > 0.3 && 起步秒 < 1.2, `起步用咗 ${起步秒.toFixed(2)} 秒`);
    let m = 0;
    while (v > 0 && m < 6000) { v = approachSpeed(v, 0, dt); m++; }
    assert.ok(m < n, `煞停 ${m} 幀慢過起步 ${n} 幀`);
    assert.ok(DECEL > ACCEL);
});

test('陰影相機只准喺 texel 格上面郁', () => {
    const 偏移 = { x: -18, y: 28, z: 16 };
    const texel = 52 / 2048;                       // 25.4 毫米
    // 玩家每次行一個好細嘅步（遠細過一個 texel），貼格之後個目標唔應該
    // 每步都郁——郁咗就係「陰影每幀爬一下」。
    const 位 = [];
    for (let i = 0; i < 40; i += 1) {
        const p = { x: i * (texel / 8), y: 0, z: 0 };
        const s = snapShadowTarget(p, 偏移, texel);
        位.push(`${s.x.toFixed(4)},${s.y.toFixed(4)},${s.z.toFixed(4)}`);
    }
    // 條不變量唔係「幾多個唔同位置」（嗰個要我自己拍個數出嚟），而係
    // **大部分幀之間根本冇郁過**——郁咗就係陰影爬。八分一 texel 一步，
    // 理應大約每八步先郁一次。
    let 郁過 = 0;
    for (let i = 1; i < 位.length; i += 1) if (位[i] !== 位[i - 1]) 郁過 += 1;
    assert.ok(郁過 / (位.length - 1) < 0.35,
        `${位.length - 1} 步入面郁咗 ${郁過} 次，即係差唔多逐幀都郁`);
    assert.ok(new Set(位).size >= 2, '完全唔郁就變返「行出圓場冇陰影」');
    // 貼格之後個點唔應該離原本個點好遠：最多一個 texel 嘅對角
    for (let i = 0; i < 30; i += 1) {
        const p = { x: i * 0.37, y: 0, z: i * -0.21 };
        const s = snapShadowTarget(p, 偏移, texel);
        const d = Math.hypot(s.x - p.x, s.y - p.y, s.z - p.z);
        assert.ok(d <= texel * 1.5, `貼格之後偏咗 ${d.toFixed(3)} 米`);
    }
});

// ---------------------------------------------------------------------------
// gaitStep：人形嘅一步。

test('起步唔可以一 tick 到全速——條斜坡要真係用到時間', () => {
    const dt = 1 / 60, 全速 = 4.4;
    let g = { heading: 0, speed: 0 };
    let 步 = 0;
    while (g.speed < 全速 * 0.95 && 步 < 6000) { g = gaitStep(g, 0, 全速, dt); 步 += 1; }
    const 秒 = 步 * dt;
    for (let i = 0; i < 200; i++) g = gaitStep(g, 0, 全速, dt);   // 跑到頂
    // 舊值 ACCEL 70：4.4 ÷ 70 = 0.063 秒，而 `delta` 封喺 0.05——即係一幀。
    // 一條有上限嘅斜坡同一個瞬間跳，喺加速度嗰把尺入面分唔開。
    assert.ok(秒 > 0.3, `起步只用咗 ${秒.toFixed(3)} 秒，同一 tick 分唔開`);
    assert.ok(秒 < 1.2, `起步用咗 ${秒.toFixed(3)} 秒，慢到唔似跑`);
    // 而且**去得返**全速——ADR-178 就係條斜坡永遠去唔到目標值。
    assert.ok(Math.abs(g.speed - 全速) < 0.01, `頂到 ${g.speed}，設計 ${全速}`);
});

test('位移沿住面向，唔沿住想去嗰邊（唔會側滑）', () => {
    const dt = 1 / 60, 全速 = 4.4;
    // 先向北跑到全速，然後突然要求向西。
    let g = { heading: 0, speed: 0 };
    for (let i = 0; i < 200; i++) g = gaitStep(g, 0, 全速, dt);
    let 最大側滑 = 0;
    for (let i = 0; i < 200; i++) {
        const r = gaitStep(g, -Math.PI / 2, 全速, dt);
        if (Math.hypot(r.dx, r.dz) > 1e-6) {
            const 差 = Math.atan2(r.dx, r.dz) - r.heading;
            最大側滑 = Math.max(最大側滑, Math.abs(Math.atan2(Math.sin(差), Math.cos(差))));
        }
        g = { heading: r.heading, speed: r.speed };
    }
    // 實測未修之前玩家側滑到 2.0 弧度（115 度）。
    assert.ok(最大側滑 < 1e-9, `側滑咗 ${最大側滑.toFixed(3)} 弧度`);
});

test('轉得越急，維持唔到全速（入彎要收力）', () => {
    const dt = 1 / 60, 全速 = 4.4;
    let 直 = { heading: 0, speed: 0 };
    for (let i = 0; i < 400; i++) 直 = gaitStep(直, 0, 全速, dt);
    // 一路要求一個同面向差九十度嘅方向：轉緊嗰陣一定慢過直路。
    let 彎 = { heading: 0, speed: 0 }, 彎中最快 = 0;
    for (let i = 0; i < 400; i++) {
        彎 = gaitStep(彎, 彎.heading - Math.PI / 2, 全速, dt);
        彎中最快 = Math.max(彎中最快, 彎.speed);
    }
    assert.ok(直.speed > 彎中最快 * 1.5,
        `直路 ${直.speed.toFixed(2)}、一路急轉最快 ${彎中最快.toFixed(2)}——入彎冇收過力`);
});

test('放手（desired = null）會煞停，而且唔會轉身', () => {
    const dt = 1 / 60, 全速 = 4.4;
    let g = { heading: 1.1, speed: 0 };
    for (let i = 0; i < 300; i++) g = gaitStep(g, 1.1, 全速, dt);
    assert.ok(g.speed > 全速 * 0.9, '未跑到速');
    let 步 = 0;
    while (g.speed > 0.01 && 步 < 6000) { g = gaitStep(g, null, 全速, dt); 步 += 1; }
    assert.equal(g.speed, 0);
    assert.equal(g.heading, 1.1, '收油唔應該轉身');
    const 秒 = 步 * dt;
    assert.ok(秒 > 0.15 && 秒 < 0.7, `煞停用咗 ${秒.toFixed(3)} 秒`);
});

test('加速度要係人嘅尺度，唔係火箭', () => {
    // 呢條唔同上面嗰啲：上面問「有冇上限」，呢條問「個上限本身合唔合理」。
    // 瀏覽器嗰邊嘅 gate 同**遊戲自己個常數**比，所以改咗常數兩邊一齊郁——
    // 佢永遠捉唔到「個常數係 70 米／秒²（7 g）」呢件事。
    //
    // 人由企定去到慢跑大約 3–5 米／秒²，衝刺起步誇張啲十幾。30 已經好鬆。
    assert.ok(ACCEL > 2 && ACCEL <= 30, `ACCEL = ${ACCEL} 米／秒²（${(ACCEL / 9.81).toFixed(1)} g）`);
    assert.ok(DECEL > ACCEL && DECEL <= 40, `DECEL = ${DECEL}`);
});

test('撲擊有一個真嘅距離窗口，而且遊戲餵得到佢', () => {
    // `chooseBossMove` 本來寫住 `phase === 2 && distance > LEAP_MIN_RANGE`，而
    // 個 caller 只有 `distance <= BOSS_REACH`（3.15）先入到去——3.15 < 6.5，
    // **呢個分支喺遊戲入面永遠揀唔到**。條純函數 gate 綠，因為佢直接餵咗一啲
    // 遊戲從來唔會餵嘅距離。所以呢度要問埋：個窗口同 caller 對唔對得上。
    assert.ok(LEAP_MIN_RANGE > BOSS_REACH,
        '撲擊嘅最短距離要遠過埋身距離，否則佢淨係一個貴啲嘅拳');
    assert.ok(LEAP_MAX_RANGE > LEAP_MIN_RANGE + 2,
        `窗口得 ${(LEAP_MAX_RANGE - LEAP_MIN_RANGE).toFixed(1)} 米，boss 行過嗰段路太快`);
    // 窗口入面揀得到，窗口外面揀唔到。
    assert.equal(chooseBossMove(2, LEAP_MIN_RANGE + 0.1, 0.1), 'leap');
    assert.equal(chooseBossMove(2, LEAP_MAX_RANGE - 0.1, 0.1), 'leap');
    assert.equal(chooseBossMove(2, LEAP_MIN_RANGE - 0.1, 0.1), 'punch');
    assert.equal(chooseBossMove(2, LEAP_MAX_RANGE + 5, 0.1), 'punch', '由太遠都撲，就會飛得癲');
    // 兩個階段都撲得到——實測 boss 換第二階段嗰刻距離已經係 6.0 米（細過
    // 6.5），即係「第二階段先有嘅招」永遠等唔到自己嘅距離。
    assert.equal(chooseBossMove(1, LEAP_MIN_RANGE + 0.5, 0.1), 'leap');
    // 但第二階段撲得密好多。
    assert.equal(chooseBossMove(1, LEAP_MIN_RANGE + 0.5, 0.45), 'punch');
    assert.equal(chooseBossMove(2, LEAP_MIN_RANGE + 0.5, 0.45), 'leap');
    // 見唔到落點就唔撲（ADR-174）。
    assert.equal(chooseBossMove(2, LEAP_MIN_RANGE + 0.5, 0.1, false), 'punch');
});
