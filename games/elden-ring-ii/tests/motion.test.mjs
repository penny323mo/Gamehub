// 郁動嘅重量：兩條純函數，喺 Node 度直接量，唔使開瀏覽器。
import test from 'node:test';
import assert from 'node:assert/strict';
import { TURN_RATE, TURN_RATE_ENEMY, TURN_RATE_BOSS, ACCEL, DECEL, turnToward, approachSpeed, snapShadowTarget } from '../src/motion.ts';

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
    const dt = 1 / 60, 全速 = 12.5;
    let v = 0, n = 0;
    while (v < 全速 && n < 600) { v = approachSpeed(v, 全速, dt); n++; }
    const 起步秒 = n * dt;
    assert.ok(起步秒 > 0.15 && 起步秒 < 0.35, `起步用咗 ${起步秒.toFixed(2)} 秒`);
    let m = 0;
    while (v > 0 && m < 600) { v = approachSpeed(v, 0, dt); m++; }
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
