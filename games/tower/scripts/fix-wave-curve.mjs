// 難度曲線唔可以倒退。
//
// 實測原本嘅 waves.json：**7 個波易過第一波**（wave 38 得 180 血，即係第一波
// 1260 血嘅 14%，而佢喺第 38 關）；**21 次一波之內跌超過四成**，最誇張嗰次係
// 前一波嘅 **0.08×**。
//
// 條規則要留得住作者本身嘅起伏——一硬一軟係 TD 嘅節奏——所以唔係要求單調上升。
// 每個**非 boss** 波（boss 每十波一次，佢哋係特登嘅尖峰，唔可以攞嚟做普通波
// 嘅地板；第一版就係咁計，結果要放大 82 個波、有啲 69 倍）要企得住兩條線：
//   1. 唔可以易過第一波；
//   2. 唔可以低過**之前五個非 boss 波入面最高嗰個**嘅 55%。
// 唔夠就按比例加返啲數量，組成同敵種完全唔郁。
//
// 跑法：node games/tower/scripts/fix-wave-curve.mjs [--write]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CFG = path.join(HERE, '..', 'configs');
const waves = JSON.parse(fs.readFileSync(path.join(CFG, 'waves.json'), 'utf8'));
const enemies = JSON.parse(fs.readFileSync(path.join(CFG, 'enemies.json'), 'utf8'));

export const FLOOR_FRAC = 0.55;
export const FLOOR_WINDOW = 5;
export const totalHp = (wave, table) =>
  wave.groups.reduce((s, g) => s + g.count * table[g.type].hp, 0);
export const isBoss = (wave) => wave.groups.some((g) => g.type === 'boss');

// 每個非 boss 波要企得住嘅地板。回傳 null 即係唔使守（boss 波）。
export const floorFor = (list, i, table) => {
  if (isBoss(list[i])) return null;
  const 近 = [];
  for (let j = Math.max(0, i - FLOOR_WINDOW); j < i; j += 1) {
    if (!isBoss(list[j])) 近.push(totalHp(list[j], table));
  }
  const 第一波 = totalHp(list[0], table);
  return 近.length ? Math.max(第一波, FLOOR_FRAC * Math.max(...近)) : 第一波;
};

const 改 = [];
for (let i = 0; i < waves.waves.length; i += 1) {
  const floor = floorFor(waves.waves, i, enemies);
  if (floor === null) continue;
  const 前 = totalHp(waves.waves[i], enemies);
  if (前 >= floor) continue;
  const k = floor / 前;
  // 按比例加數量，組成唔郁；至少加一隻，否則細波乘完仲係原數。
  for (const g of waves.waves[i].groups) g.count = Math.max(g.count + 1, Math.ceil(g.count * k));
  改.push({ wave: i + 1, 前, 後: totalHp(waves.waves[i], enemies), 地板: Math.round(floor) });
}

console.log(`改咗 ${改.length} 個波：`);
for (const c of 改) console.log(`  wave ${c.wave}: ${c.前} → ${c.後}（地板 ${c.地板}）`);
const 最多 = Math.max(...waves.waves.map((w) => w.groups.reduce((s, g) => s + g.count, 0)));
console.log(`最多敵人嘅一波：${最多} 隻`);
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.join(CFG, 'waves.json'), JSON.stringify(waves, null, 4) + '\n');
  console.log('寫咗入 configs/waves.json');
} else {
  console.log('（試跑，冇寫檔；加 --write 先會寫）');
}
