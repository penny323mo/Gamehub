// 雜兵點樣追你——一條純函數，冇 three.js 冇 cannon-es。
//
// 抽咗出嚟係為咗喺測試度**跑返同一條規則**。之前想量「敵人追唔追得到玩家」
// 淨係得一條路：喺瀏覽器度真係企定等佢行過嚟，而軟件光柵化一秒三幀，量到
// 嘅係機械人蠢定係地圖爛，分唔開（ADR-157）。而家測試可以攞住同一條規則、
// 同一批 collider、固定步長行幾千步，一次 evaluate 就有答案。
//
// 抄一份出嚟做測試係唔算數嘅：抄出嚟嗰份綠，只證明抄本自己一致。

export const MINION_ATTACK_RANGE = 1.82;
// 雜兵速度。同玩家一樣，呢個數而家係**真數**（位置自己積分），唔再係一個
// 只送到兩成三嘅指令值。3.6–4.4 對住玩家 4.4：追得到，但唔會貼到實。
// 雜兵一定要慢過玩家行路。
//
// 舊值 `[3.6, 4.1, 4.4]` 對住玩家 4.4（oathbound）：**第三波同你一模一樣快，
// 仲要快過 wizard 嘅 4.2**，第二波係你嘅 93%。即係「行開啲」呢個動作唔存在
// ——行路每秒只賺 0.3 米，開 7 米要 23 秒。唯一拉得開嘅係衝刺，而衝刺食 13/秒
// **兼且封鎖 28/秒嘅回氣**：**拉開嘅工具，食緊你拉開想回復嗰樣嘢**。
//
// 實測（ADR-187 加咗藥瓶之後）：bot 兩局入面**想拉開 21 次、成功 0 次、三支藥
// 一支都飲唔到**。個回復手段存在但攞唔到。
//
// 而家係玩家 4.4 嘅 73%／77%／84%：行路拉得開（每秒賺 1.2／1.0／0.7 米），
// 而衝刺仍然係「快，但要畀體力」嗰個選擇。
export const MINION_SPEED = [3.2, 3.4, 3.7];
export const SEPARATION_RANGE = 1.5;      // 相距近過呢個就互相推開
export const SEPARATION_WEIGHT = 0.72;

export type Pt = { x: number; z: number };
export type Box = { x: number; z: number; hx: number; hz: number; ry: number };

// 一步望幾遠。行得太短就迴避得太遲，太長就成日兜路。
export const AVOID_PROBE = 1.6;
// 試幾多個角度。細角度行先，所以冇嘢擋嗰陣同直路一模一樣。
const 試轉 = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, 1.75, -1.75, 2.1, -2.1, 2.45, -2.45];

// 一個「呢個位企唔企得」嘅判斷，由 collider 表出。遊戲同測試共用呢一個，
// 唔係各寫一份——ADR-165 就係因為同一條轉角公式抄咗五次而五次一齊錯。
// 繞 Y 轉 θ：世界 → 本地係 lx = dx·cosθ − dz·sinθ。
export const makeBlocked = (boxes: readonly Box[], radius: number) =>
  (x: number, z: number): boolean => boxes.some((b) => {
    const dx = x - b.x, dz = z - b.z;
    const c = Math.cos(b.ry), s = Math.sin(b.ry);
    const lx = dx * c - dz * s, lz = dx * s + dz * c;
    return Math.abs(lx) <= b.hx + radius && Math.abs(lz) <= b.hz + radius;
  });

// 追擊方向：朝住目標，加上同其他雜兵之間嘅互相推開，然後**避開擋住嘅嘢**。
//
// 本來冇迴避。實測 233 個玩家企得到嘅位入面**18 個係雜兵永遠到唔到嘅**——
// 佢哋撞住圓場嗰兩條柱（±11.2, -11.6）同投石車（13, 8）就停喺度。而清晒一
// 波先開到下一關，即係嗰啲位唔止「打得輕鬆啲」，係成局卡死。
//
// 迴避用最平嗰種：向住目標行唔通，就左右試細角度，邊個先通行邊個。冇嘢擋
// 嗰陣第一個試嘅就係直路，所以行為完全冇變。凹角仍然困得住，但障礙物係凸嘅。
export type AvoidMemo = { turn: number };

export const chaseDirection = (
  from: Pt, to: Pt, others: readonly Pt[],
  blocked?: (x: number, z: number) => boolean,
  memo?: AvoidMemo,
): Pt => {
  let dx = to.x - from.x, dz = to.z - from.z;
  const len = Math.hypot(dx, dz) || 1;
  dx /= len; dz /= len;
  let sx = 0, sz = 0;
  for (const other of others) {
    const ax = from.x - other.x, az = from.z - other.z;
    const d2 = ax * ax + az * az;
    if (d2 > 0.001 && d2 < SEPARATION_RANGE * SEPARATION_RANGE) {
      const d = Math.sqrt(d2);
      const w = 1 - d / SEPARATION_RANGE;
      sx += (ax / d) * w; sz += (az / d) * w;
    }
  }
  dx += sx * SEPARATION_WEIGHT; dz += sz * SEPARATION_WEIGHT;
  const n = Math.hypot(dx, dz) || 1;
  const base = { x: dx / n, z: dz / n };
  if (!blocked) return base;
  const 轉 = (t: number) => {
    const c = Math.cos(t), s = Math.sin(t);
    return { x: base.x * c - base.z * s, z: base.x * s + base.z * c };
  };
  const 通 = (v: Pt) => !blocked(from.x + v.x * AVOID_PROBE, from.z + v.z * AVOID_PROBE);
  if (通(base)) { if (memo) memo.turn = 0; return base; }
  // 揀咗邊就唔好變。
  //
  // 冇呢一段，每一步都重新揀左定右，遇到大嘅障礙就會喺佢面前左右擺——實測
  // 庭院嗰嚿石個 collider **8.7 米闊**，而每步望前得 1.6 米，所以雜兵停喺
  // 石嘅東面永遠繞唔過。記住上一步揀咗邊，只要嗰邊仲通就一直行落去，就會
  // 沿住個障礙滑出去。
  const 先試 = memo && memo.turn !== 0
    ? 試轉.filter((t) => t === 0 || Math.sign(t) === Math.sign(memo.turn))
    : 試轉;
  for (const list of [先試, 試轉]) {
    for (const t of list) {
      if (t === 0) continue;
      const v = 轉(t);
      if (通(v)) { if (memo) memo.turn = t; return v; }
    }
  }
  return base;
};

// 兩點之間有冇嘢擋住。
//
// 搵攻擊目標本來淨係計距離同橫向偏移——即係**隔住條柱一樣打得中**，而且兩
// 邊都係：你射得穿佢，佢都打得穿你。場入面啲柱同石本來就係為咗做掩護，一日
// 冇視線檢查，佢哋喺戰鬥入面等於唔存在。
//
// 一條線段對一堆方盒，用取樣：步長細過最薄嗰塊牆（0.42 米半厚）就唔會漏。
export const LOS_STEP = 0.3;
export const makeLineOfSight = (boxes: readonly Box[]) => {
  const blocked = makeBlocked(boxes, 0);
  return (from: Pt, to: Pt): boolean => {
    const dx = to.x - from.x, dz = to.z - from.z;
    const len = Math.hypot(dx, dz);
    if (len < 1e-6) return true;
    const steps = Math.ceil(len / LOS_STEP);
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      if (blocked(from.x + dx * t, from.z + dz * t)) return false;
    }
    return true;
  };
};

// 一下攻擊落唔落得到：夠唔夠近，**同埋**中間冇嘢擋。
//
// 之前兩邊都淨係計距離。ADR-172 加咗視線落玩家嗰邊，但敵人出手嗰兩個判定
// 冇跟——實測射程之內、視線斷咗嘅位置，**雜兵 85/85、boss 一階 128/128、
// 二階 196/196 全部照打得中**。即係我上一輪令掩護變成「淨係幫到敵人」，
// 比兩邊一齊錯仲差。一條規則，三個出手點一齊用。
export const canLand = (
  from: Pt, to: Pt, reach: number,
  sight: (a: Pt, b: Pt) => boolean,
): boolean => Math.hypot(to.x - from.x, to.z - from.z) < reach && sight(from, to);
