// Continuous route contract: road tiles stay authoritative, while enemies use
// an evenly sampled rounded spine that also starts inside the spawn gateway.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');
const MAP = JSON.parse(fs.readFileSync(path.join(GAME, 'configs/map.json'), 'utf8'));
const OUT = path.join(GAME, 'node_modules/.cache/smooth-route.mjs');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
execFileSync(path.join(GAME, 'node_modules/.bin/esbuild'), [
  path.join(GAME, 'src/core/route.ts'), '--bundle', '--format=esm', '--platform=node', `--outfile=${OUT}`,
]);
const { buildSmoothRoute, simplifyRoute, DEFAULT_ROUTE_OPTIONS } = await import(`${pathToFileURL(OUT).href}?t=${Date.now()}`);

const centres = MAP.path.map(([col, row]) => ({
  x: MAP.origin.x + (col + 0.5) * MAP.cellSize,
  z: MAP.origin.z + (row + 0.5) * MAP.cellSize,
}));
const route = buildSmoothRoute(centres);
let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass += 1; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail += 1; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const dist = (a, b) => Math.hypot(b.x - a.x, b.z - a.z);
const totalLength = (points) => points.slice(1).reduce((sum, p, i) => sum + dist(points[i], p), 0);

const controls = simplifyRoute(centres);
check('37格路濃縮成入口、出口同10個真正轉角', controls.length === 12,
  { cells: centres.length, controls: controls.length });

const first = route[0], firstCell = centres[0], last = route.at(-1), lastCell = centres.at(-1);
check('敵人由閘門平面出現，唔係穿過門後先 pop 出嚟',
  Math.abs(dist(first, firstCell) - DEFAULT_ROUTE_OPTIONS.entryExtension) < 0.01 && first.x < firstCell.x,
  { first, firstCell, entry: +dist(first, firstCell).toFixed(3) });
check('終點仍落喺城堡門口最後一格，唔改玩家防線終點', dist(last, lastCell) < 1e-7,
  { last, lastCell });

const segmentLengths = route.slice(1).map((p, i) => dist(route[i], p));
check('平滑路徑用近似等距小段，target progress唔會喺彎位跳數',
  Math.max(...segmentLengths) <= DEFAULT_ROUTE_OPTIONS.sampleSpacing + 0.001 && Math.min(...segmentLengths) > 0.03,
  { min: +Math.min(...segmentLengths).toFixed(3), max: +Math.max(...segmentLengths).toFixed(3), samples: route.length });

const angleDiff = (a, b) => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
};
const headings = route.slice(1).map((p, i) => Math.atan2(p.x - route[i].x, p.z - route[i].z));
const turns = headings.slice(1).map((h, i) => angleDiff(h, headings[i]));
check('每一小段轉向少過35度，唔再喺一格中心瞬間轉90度', Math.max(...turns) < 35 * Math.PI / 180,
  { maxTurnDeg: +(Math.max(...turns) * 180 / Math.PI).toFixed(1) });

const pointToSegment = (p, a, b) => {
  const dx = b.x - a.x, dz = b.z - a.z;
  const denom = dx * dx + dz * dz;
  const t = denom ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / denom)) : 0;
  return Math.hypot(p.x - (a.x + dx * t), p.z - (a.z + dz * t));
};
const maxRoadOffset = Math.max(...route.map((p) => Math.min(...centres.slice(1).map((b, i) => pointToSegment(p, centres[i], b)))));
check('圓滑行線仍留喺原本路磚闊度內', maxRoadOffset <= 0.43,
  { maxRoadOffset: +maxRoadOffset.toFixed(3) });

const rawLength = totalLength(centres);
const smoothLength = totalLength(route);
check('改彎位同加入口後總路程維持同一平衡級別', smoothLength >= rawLength * 0.97 && smoothLength <= rawLength * 1.03,
  { rawLength: +rawLength.toFixed(3), smoothLength: +smoothLength.toFixed(3) });
check('同一地圖每次產生完全相同路線', JSON.stringify(route) === JSON.stringify(buildSmoothRoute(centres)));

console.log(`\ntower 平滑路徑: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
process.exit(fail ? 1 : 0);
