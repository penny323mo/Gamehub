// 難度曲線唔可以倒退。
//
// 呢隻遊戲九十九個波，而原本嘅表：**7 個波易過第一波**——最誇張係 wave 38，
// 兩隻 healer 共 180 血，即係第一波（1260）嘅 **14%**，而佢喺第 38 關；仲有
// **21 次一波之內跌超過四成**，其中一次係前一波嘅 **0.08×**。玩落去就係打到
// 中段突然變返教學關。
//
// 條線唔係「單調上升」——一硬一軟係 TD 嘅節奏，作者本身有意做起伏。守嘅係
// **崩唔崩**：唔可以易過第一波，亦唔可以跌穿最近五個非 boss 波嘅峰值一半幾。
//
// 條規則**由 `scripts/fix-wave-curve.mjs` import 返嚟**，唔喺度抄一次——同一件
// 事寫兩次就有兩個答案，而修同守用同一條先至夾得埋。
//
// 跑法：node games/tower/tests/balance.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { totalHp, isBoss, floorFor, FLOOR_FRAC, FLOOR_WINDOW } from '../scripts/fix-wave-curve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CFG = path.join(HERE, '..', 'configs');
const waves = JSON.parse(fs.readFileSync(path.join(CFG, 'waves.json'), 'utf8')).waves;
const enemies = JSON.parse(fs.readFileSync(path.join(CFG, 'enemies.json'), 'utf8'));

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : detail); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const 血 = waves.map((w) => totalHp(w, enemies));
const 第一波 = 血[0];

check('冇一個波易過第一波',
  血.every((h) => h >= 第一波),
  { 第一波, 犯規: 血.map((h, i) => [i + 1, h]).filter(([, h]) => h < 第一波).slice(0, 8) });

const 崩 = [];
for (let i = 0; i < waves.length; i += 1) {
  const floor = floorFor(waves, i, enemies);
  if (floor === null) continue;
  if (血[i] < floor) 崩.push([i + 1, 血[i], Math.round(floor)]);
}
check(`難度唔可以崩（非 boss 波要企得住最近 ${FLOOR_WINDOW} 波峰值嘅 ${FLOOR_FRAC}）`,
  崩.length === 0, { 犯規: 崩.slice(0, 8) });

// boss 每十波一次——如果呢個節奏散咗，上面條「非 boss 地板」就守緊一個唔存在
// 嘅結構。條 gate 唔可以假設佢，要問返佢。
const boss波 = waves.map((w, i) => (isBoss(w) ? i + 1 : 0)).filter(Boolean);
check('boss 波維持住十波一次嘅節奏',
  boss波.length >= 9 && boss波.every((n, k) => k === 0 || n - boss波[k - 1] <= 11),
  { boss波 });

// 賞金要跟住難度走：加咗血冇加錢，就係靜靜哋收緊經濟。
const 賞 = waves.map((w) => w.groups.reduce((s, g) => s + g.count * enemies[g.type].bounty, 0));
const 比 = 血.map((h, i) => h / Math.max(賞[i], 1));
check('每點賞金換到嘅敵人血量，由頭到尾喺同一個數量級',
  Math.max(...比) / Math.min(...比) < 3.5,
  { 最高: +Math.max(...比).toFixed(1), 最低: +Math.min(...比).toFixed(1) });

// 一波幾百隻係實際會拖冧幀率嘅事——留個上限喺度，加波嘅時候會撞到。
const 隻數 = waves.map((w) => w.groups.reduce((s, g) => s + g.count, 0));
check('冇一個波多過 500 隻敵人（再多就係幀率問題唔係難度問題）',
  Math.max(...隻數) <= 500, { 最多: Math.max(...隻數), 喺: 隻數.indexOf(Math.max(...隻數)) + 1 });

console.log(`\ntower 平衡: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗:', failed.join('、'));
if (fail) process.exit(1);
