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
// 加速度。
//
// 呢兩個數本來係 70 同 95，而**條上限乜都冇做過**：全速 4.4 米／秒配 70
// 米／秒²，即係斜坡 0.063 秒行完，而 `delta` 封咗喺 0.05 秒——**一幀**。
// 實測起步用時 **0.05 秒**，即係由靜止到全速真係一 tick。一條有上限嘅斜坡
// 同一個瞬間跳，喺「加速度」呢把尺入面分唔開，要問嘅係**用咗幾耐**。
//
// 人由企定去到慢跑大約半秒到一秒。8 米／秒²＝4.4 米／秒用 0.55 秒，煞停
// 快一半。（70 嗰個數係 ADR-176 為咗餵飽閃避嗰條 gate 揀嘅，而嗰陣個玩家
// 實際只行到指令嘅兩成三，成條線都建喺一個爛咗嘅速度上面。）
export const ACCEL = 8;            // 米／秒²
export const DECEL = 14;           // 煞停快過起步，否則會「溜冰」


// 一刀落去嘅踏前。實測未加之前，**企定同跑住出手，位移都係 0.00 米**——把刀
// 好似個轉盤咁掃過，隻腳釘死喺地下。呢個距離要**由招式決定**，唔係由你出手
// 嗰刻啱好跑緊幾快決定，所以佢係一個常數速度曲線，唔係「保留原本嘅速度」。
export const LUNGE_SPEED = 6.4;    // 米／秒，喺前搖嗰段線性收到零
// 鎖定住出手嗰陣仲可以微調準星，但唔可以原地轉圈——比行路慢一半。
export const TURN_RATE_ATTACK = 4.5;

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

// ---------------------------------------------------------------------------
// 一步「人形嘅郁動」：轉身 → 沿住面向行。
//
// 未有呢條規則之前，位移用嘅係**想去嗰個方向**，而個模型嘅朝向係另一條有
// 上限嘅線——兩條線分開，身體就會滑向一個佢完全冇面住嘅方向。實測**玩家
// 側滑到 2.0 弧度（115 度）**：撳 A 嗰陣個人面住北，身體向西全速平移，而
// 跑步動畫照樣向前踩。敵人係 0.43 弧度（25 度）。
//
// 人唔係咁行嘅。人係先轉身，再向住自己面住嗰邊行；而且**轉得越急就越維持
// 唔到全速**——入彎要收力，唔係原速掃過去。呢條規則做齊三樣。
export type Gait = { heading: number; speed: number };

// 轉幾急就蝕幾多速度。1 = 偏離九十度或以上就完全停低（要先煞停再轉身），
// 0 = 點轉都唔蝕。0.8 留返少少餘速，唔會撳一下掉頭就釘死喺度。
export const TURN_DRAG = 0.8;

export const gaitStep = (
  gait: Gait,
  // 想向邊行（弧度）。`null` = 冇輸入，收油煞停，朝向唔變。
  desired: number | null,
  maxSpeed: number,
  dt: number,
  turnRate = TURN_RATE,
  accel = ACCEL,
  decel = DECEL,
): { heading: number; speed: number; dx: number; dz: number } => {
  const heading = desired === null
    ? gait.heading
    : turnToward(gait.heading, desired, dt, turnRate);
  let target = 0;
  if (desired !== null) {
    const 偏 = Math.abs(Math.atan2(Math.sin(desired - heading), Math.cos(desired - heading)));
    target = maxSpeed * (1 - TURN_DRAG * Math.min(1, 偏 / (Math.PI / 2)));
  }
  const speed = approachSpeed(gait.speed, target, dt, accel, decel);
  // 位移沿住**面向**，唔沿住想去嗰邊。呢一行就係「唔會側滑」本身。
  return { heading, speed, dx: Math.sin(heading) * speed * dt, dz: Math.cos(heading) * speed * dt };
};
