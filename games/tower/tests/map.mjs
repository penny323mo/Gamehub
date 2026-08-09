// Emerald Rift map contract: the arena follows the route instead of filling a rectangle.
// Run: node games/tower/tests/map.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');
const MAPCFG = JSON.parse(fs.readFileSync(path.join(GAME, 'configs/map.json'), 'utf8'));
const OUT = path.join(GAME, 'node_modules/.cache/map-layout.mjs');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
execFileSync(path.join(GAME, 'node_modules/.bin/esbuild'), [
  path.join(GAME, 'src/core/mapLayout.ts'), '--bundle', '--format=esm', '--platform=node', `--outfile=${OUT}`,
]);
const { LAYOUT } = await import(`${pathToFileURL(OUT).href}?t=${Date.now()}`);

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const key = (c, r) => `${c},${r}`;

const pathSet = new Set(MAPCFG.path.map(([c, r]) => key(c, r)));
const badSteps = [];
for (let i = 1; i < MAPCFG.path.length; i += 1) {
  const [a, b] = [MAPCFG.path[i - 1], MAPCFG.path[i]];
  if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) badSteps.push([a, b]);
}
// 37 格：20×12 擴到 24×14 嗰陣連條路一齊重畫（ADR-205）。呢個數唔係
// 「啱啱好等於 config 有幾多格」——咁樣寫等於冇守到嘢。佢係寫死嘅設計數，
// 有人靜靜雞加減路格就要喺呢度報紅，逼佢連平衡一齊重掃。
check('路線 37 格、每步四鄰、冇重複',
  MAPCFG.path.length === 37 && badSteps.length === 0 && pathSet.size === MAPCFG.path.length,
  { 長: MAPCFG.path.length, 壞步: badSteps.slice(0, 3), unique: pathSet.size });
check('入口同出口就係路線頭尾',
  JSON.stringify(MAPCFG.spawnCell) === JSON.stringify(MAPCFG.path[0])
    && JSON.stringify(MAPCFG.goalCell) === JSON.stringify(MAPCFG.path.at(-1)),
  { spawn: MAPCFG.spawnCell, first: MAPCFG.path[0], goal: MAPCFG.goalCell, last: MAPCFG.path.at(-1) });

const turns = MAPCFG.path.slice(1, -1).filter((p, i) => {
  const a = MAPCFG.path[i], c = MAPCFG.path[i + 2];
  return a[0] !== c[0] && a[1] !== c[1];
}).length;
const active = LAYOUT.cells;
// 8 → 10 個彎：條路長咗 19%，彎數跟住加，唔係將原本嗰條拉直咗算數。
check('新路線保留 10 個彎，但段長唔再機械式重複', turns === 10, { turns });
check('可玩陸地明顯唔係長方形（少過全 grid 70%）',
  active.length < MAPCFG.cols * MAPCFG.rows * 0.7 && active.length >= 160,
  { active: active.length, full: MAPCFG.cols * MAPCFG.rows, pct: +(100 * active.length / (MAPCFG.cols * MAPCFG.rows)).toFixed(1) });
check('每一格路都存在於不規則陸地',
  MAPCFG.path.every(([c, r]) => LAYOUT.cellAt(c, r).exists),
  MAPCFG.path.filter(([c, r]) => !LAYOUT.cellAt(c, r).exists));

// Flood-fill active land: visual masks must never create detached islands.
const remaining = new Set(active.map((c) => key(c.col, c.row)));
const todo = active.length ? [[active[0].col, active[0].row]] : [];
for (let i = 0; i < todo.length; i += 1) {
  const [c, r] = todo[i]; remaining.delete(key(c, r));
  for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const k = key(c + dc, r + dr);
    if (remaining.has(k)) { remaining.delete(k); todo.push([c + dc, r + dr]); }
  }
}
check('陸地係單一連通山谷，冇浮島', remaining.size === 0, [...remaining].slice(0, 8));

const shell = active.filter((c) => c.distanceFromPath === MAPCFG.landRadius && c.pathIndex < 0);
check('外圈全部係不可建造地貌，唔係隱形塔位',
  shell.length > 20 && shell.every((c) => !c.buildable && c.terrain),
  { shell: shell.length, bad: shell.filter((c) => c.buildable || !c.terrain).slice(0, 5) });

const adjacentBuildable = active.filter((c) => c.distanceFromPath === 1 && c.buildable).length;
check('仍保留足夠貼路起塔位，視覺重設唔會抽乾玩法', adjacentBuildable >= 58,
  { adjacentBuildable });
const river = MAPCFG.terrainTiles.filter((t) => t.model === 'tile_riverStraight');
check('河道不可起塔，而且只用一座橋跨過主路',
  river.every((t) => !LAYOUT.cellAt(t.cell[0], t.cell[1]).buildable)
    && MAPCFG.pathTileOverrides.filter((t) => t.model === 'tile_riverBridge').length === 1,
  { river: river.length, bridges: MAPCFG.pathTileOverrides });
check('矩形角落真係 void，而且不可建造',
  !LAYOUT.cellAt(0, 0).exists && !LAYOUT.cellAt(0, 0).buildable,
  LAYOUT.cellAt(0, 0));
const routeRegions = MAPCFG.path.map(([c, r]) => LAYOUT.cellAt(c, r).region?.id);
const regionOrder = routeRegions.filter((id, i) => i === 0 || id !== routeRegions[i - 1]);
check('行軍路線順序穿過森林、裂谷、城堡三個戰區',
  JSON.stringify(regionOrder) === JSON.stringify(['wildwood-gate', 'sunken-crossing', 'bastion-cliff'])
    && active.every((cell) => cell.region),
  { regionOrder, unassigned: active.filter((cell) => !cell.region).length });

console.log(`\ntower 地圖: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
process.exit(fail ? 1 : 0);
