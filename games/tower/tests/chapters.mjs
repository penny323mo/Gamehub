// Campaign contract: the redesigned battlefield is paced as five coherent acts.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');
const OUT = path.join(GAME, 'node_modules/.cache/chapters.mjs');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
execFileSync(path.join(GAME, 'node_modules/.bin/esbuild'), [
  path.join(GAME, 'src/core/chapters.ts'), '--bundle', '--format=esm', '--platform=node', `--outfile=${OUT}`,
]);
const { CAMPAIGN_CHAPTERS, chapterForWave, chapterProgress, isChapterOpening } =
  await import(`${pathToFileURL(OUT).href}?t=${Date.now()}`);

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass += 1; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail += 1; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

check('99波分成五章，而唔係一條冇段落嘅數字長廊', CAMPAIGN_CHAPTERS.length === 5,
  CAMPAIGN_CHAPTERS.map((c) => [c.startWave, c.endWave]));
const coverage = Array.from({ length: 99 }, (_, i) => i + 1).map((wave) =>
  CAMPAIGN_CHAPTERS.filter((chapter) => wave >= chapter.startWave && wave <= chapter.endWave).length);
check('每一波只屬於一章，冇空白亦冇重疊', coverage.every((count) => count === 1),
  coverage.map((count, i) => [i + 1, count]).filter(([, count]) => count !== 1));
check('章節轉場落喺20/40/60/80 Boss之後，最後章直達99',
  JSON.stringify(CAMPAIGN_CHAPTERS.map((c) => c.endWave)) === JSON.stringify([20, 40, 60, 80, 99]));
check('章首1/21/41/61/81可由同一helper辨認',
  [1, 21, 41, 61, 81].every(isChapterOpening) && ![2, 20, 40, 99].some(isChapterOpening));
check('chapter lookup邊界同endless都穩定',
  chapterForWave(1).id === 'verdant-border'
    && chapterForWave(20).id === 'verdant-border'
    && chapterForWave(21).id === 'sunken-gorge'
    && chapterForWave(99).id === 'last-bastion'
    && chapterForWave(120).id === 'last-bastion');
check('每章有完整視覺同戰術資料，唔係淨係換標題',
  CAMPAIGN_CHAPTERS.every((c) => c.title && c.subtitle && c.tacticalFocus && c.tint.length === 3
    && c.tint.every((v) => Number.isFinite(v) && v > 0) && Number.isInteger(c.accent) && Number.isInteger(c.fog)));
check('章內progress由開場正數推到1並會clamp',
  CAMPAIGN_CHAPTERS.every((c) => chapterProgress(c.startWave) > 0
    && chapterProgress(c.startWave) <= 0.06 && chapterProgress(c.endWave) === 1)
    && chapterProgress(999) === 1);

console.log(`\ntower 戰役章節: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
process.exit(fail ? 1 : 0);
