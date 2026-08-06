// 郁動嘅重量：轉身要時間，起步同煞停都要時間。
//
// 呢個檔冇 three.js 冇 cannon-es，淨係兩條純函數加佢哋嘅常數，所以喺 Node
// 度直接量得到。
//
// 點解要抽出嚟：實測未修之前，玩家**最快轉向 62.6 弧度／秒（每秒 3587 度）、
// 最快加速 250 米／秒²（約 25 g）**。兩樣都係「一 tick 做完」——推前推後之間
// 冇任何過渡，所以隻角色望落唔似有重量，似個機械臂。人形角色轉身大約每秒
// 360–540 度，而起步加速度就算誇張都唔會過三十幾。

export const TURN_RATE = 9;        // 弧度／秒 ≈ 每秒 516 度
// 敵人轉得慢過玩家——「繞到佢背後」先至係一個做得到嘅動作。本來佢哋每一幀
// 都直接指住你，即係繞後等於唔存在。
export const TURN_RATE_ENEMY = 5.2;
export const TURN_RATE_BOSS = 3.4;   // 大隻嘅轉得更慢，撲擊之後尤其明顯
// 加速度：55 嗰陣「不停碌收到嘅傷害要低過企定一半」條 gate 啱啱好肥（3.56%
// 對 3.48% 上限）——起步太慢就走位唔切。70 仲係一條真斜坡（全速 12.5 大約
// 0.18 秒到，未修之前係一 tick），但唔會蝕咗閃避嘅價值。
export const ACCEL = 70;           // 米／秒²
export const DECEL = 95;           // 煞停快過起步，否則會「溜冰」

// 由 `from` 轉向 `to`，一步最多轉 `rate * dt`。
// 用最短弧：由 350° 去 10° 係轉 20°，唔係轉 340°。
export const turnToward = (from: number, to: number, dt: number, rate = TURN_RATE): number => {
  const diff = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  const step = rate * dt;
  if (Math.abs(diff) <= step) return to;
  return from + Math.sign(diff) * step;
};

// 速度向目標靠，加速同減速用唔同嘅上限。
export const approachSpeed = (
  current: number, target: number, dt: number,
  accel = ACCEL, decel = DECEL,
): number => {
  const rate = Math.abs(target) > Math.abs(current) ? accel : decel;
  const diff = target - current;
  const step = rate * dt;
  return Math.abs(diff) <= step ? target : current + Math.sign(diff) * step;
};

// 陰影貼圖嘅 texel 對齊。
//
// 平行光嘅陰影相機跟住玩家行（唔跟就一行出圓場全場冇陰影，ADR 早有記錄），
// 但佢每幀滑動嘅距離唔係 texel 嘅整數倍——即係同一條陰影邊界每幀落喺 texel
// 嘅唔同位置，全場陰影會「爬」同埋閃。呢個係固定框陰影最常見嗰個瑕疵。
//
// 解法唔係郁少啲，係**只准喺 texel 格上面郁**：將目標點投影落光源自己嗰個
// 基底，四捨五入到整數 texel，再投返出嚟。
export type Vec3 = { x: number; y: number; z: number };

const 減 = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const 叉 = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x,
});
const 點 = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const 歸一 = (a: Vec3): Vec3 => {
  const n = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / n, y: a.y / n, z: a.z / n };
};

// `offset` 係光源相對目標嘅固定偏移（光源位置 = 目標 + offset）。
export const snapShadowTarget = (target: Vec3, offset: Vec3, texel: number): Vec3 => {
  if (!(texel > 0)) return { ...target };
  const 前 = 歸一(減({ x: 0, y: 0, z: 0 }, offset));      // 由光源望向目標
  const 右 = 歸一(叉(前, { x: 0, y: 1, z: 0 }));
  const 上 = 叉(右, 前);
  // 三個軸都貼格。沿住光線方向嗰個其實唔影響陰影（只改深度範圍），但一齊
  // 貼咗，條不變量就簡單得多——**回傳嘅位置本身係量化嘅**，唔使叫測試自己
  // 再砌一次同一個基底去驗（抄一次基底＝多一個會錯嘅地方）。
  const a = Math.round(點(target, 右) / texel) * texel;
  const b = Math.round(點(target, 上) / texel) * texel;
  const c = Math.round(點(target, 前) / texel) * texel;
  return {
    x: 右.x * a + 上.x * b + 前.x * c,
    y: 右.y * a + 上.y * b + 前.y * c,
    z: 右.z * a + 上.z * b + 前.z * c,
  };
};
