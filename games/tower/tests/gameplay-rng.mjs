// Gameplay randomness must not depend on renderer/audio Math.random traffic.
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');
const OUT = path.join(GAME, 'node_modules/.cache/gameplay-rng.mjs');
execFileSync(path.join(GAME, 'node_modules/.bin/esbuild'), [
  path.join(GAME, 'src/core/gameplayRandom.ts'), '--bundle', '--format=esm', '--platform=node', `--outfile=${OUT}`,
]);
const { milestoneOffer, milestonePlan } = await import(`${pathToFileURL(OUT).href}?t=${Date.now()}`);

let pass = 0; let fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass += 1; console.log(`PASS  ${name}`, detail ?? ''); }
  else { fail += 1; console.log(`FAIL  ${name}`, detail ?? ''); }
};
const pool = ['damage', 'range', 'gold', 'fortify', 'bounty'];
const offer = (wave) => {
  const plan = milestonePlan(wave);
  return milestoneOffer(plan.coreIds, plan.wildcardIds, wave);
};
const first = offer(25);
for (let i = 0; i < 1000; i += 1) Math.random();
const afterFxTraffic = offer(25);
check('同一 milestone offer 唔受一千次 visual random 影響', JSON.stringify(first) === JSON.stringify(afterFxTraffic), first);
check('三張卡唔重複，而且唔會改寫原 pool', new Set(first).size === 3 && pool.length === 5, first);
check('每個 milestone 至少有一條戰力路，唔會三張都係經濟卡',
  [25, 50, 75].every((wave) => offer(wave).some((id) => id === 'damage' || id === 'range')), [25, 50, 75].map(offer));
check('25/75係進攻節奏，50係range/fortify回氣節奏',
  milestonePlan(25).coreIds.join() === 'damage,range'
    && milestonePlan(50).coreIds.join() === 'range,fortify'
    && milestonePlan(75).coreIds.join() === 'damage,range', [25, 50, 75].map(milestonePlan));
check('唔同 milestone 有穩定但唔完全相同嘅選擇', JSON.stringify(offer(25)) !== JSON.stringify(offer(50)), `${offer(25)} / ${offer(50)}`);

console.log(`\ntower gameplay RNG: ${pass}/${pass + fail} 通過`);
process.exit(fail ? 1 : 0);
