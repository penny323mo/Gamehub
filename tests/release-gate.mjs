import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(ROOT, 'scripts', 'release-gate.mjs');

const run = (files, tier = 'fast') => {
  const args = [SCRIPT, '--format', 'json', '--tier', tier];
  for (const file of files) args.push('--file', file);
  const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout.trim());
};

const catalog = await import('../games/catalog.mjs');
const current = catalog.loadGameCatalog({ rootDir: ROOT });
assert.equal(current.games.length, 13);

const explicitAll = spawnSync(process.execPath,
  [SCRIPT, '--format', 'json', '--tier', 'fast', '--all'], { cwd: ROOT, encoding: 'utf8' });
assert.equal(explicitAll.status, 0, explicitAll.stderr || explicitAll.stdout);
assert.equal(JSON.parse(explicitAll.stdout).affectedGames.length, 13);

const docs = run(['docs/GAMEHUB_EVOLUTION_PLAN.md']);
assert.deepEqual(docs.affectedGames, []);
assert.equal(docs.runAll, false);

const racing = run(['games/Racing Car/src/car.js']);
assert.deepEqual(racing.affectedGames, ['racer']);
assert.equal(racing.runAll, false);
assert.ok(racing.commands.length > 0);

const racingFull = run(['games/Racing Car/src/car.js'], 'full');
assert.equal(racingFull.tier, 'full');
assert.ok(racingFull.commands.some(({ argv }) => argv.includes('test')),
  'full release tier must include the game owner test command');

const shared = run(['games/shared/js/safe-storage.js']);
assert.equal(shared.runAll, true);
assert.equal(shared.affectedGames.length, 13);

const launcher = run(['launcher.js']);
assert.equal(launcher.runAll, true);
assert.equal(launcher.affectedGames.length, 13);

const releaseInfrastructure = run(['scripts/install-release-deps.mjs']);
assert.equal(releaseInfrastructure.runAll, true);
assert.equal(releaseInfrastructure.affectedGames.length, 13);

const hubContract = run(['tests/hub-home.mjs']);
assert.equal(hubContract.runAll, true);
assert.equal(hubContract.affectedGames.length, 13);

const unknownSharedScript = run(['scripts/new-shared.mjs']);
assert.equal(unknownSharedScript.runAll, true);

const rootConfig = run(['package.json']);
assert.equal(rootConfig.runAll, true);

const sharedAsset = run(['assets/xiangqi_logo.webp']);
assert.equal(sharedAsset.runAll, true);

const sharedBackend = run(['supabase/migrations/999_shared.sql']);
assert.equal(sharedBackend.runAll, true);

const futureRoot = run(['config/new-runtime.js']);
assert.equal(futureRoot.runAll, true,
  'unclassified future directories must fail closed until classified explicitly');

const manifest = run(['games/manifest.json']);
assert.equal(manifest.runAll, true);
assert.equal(manifest.affectedGames.length, 13);

const unknownGame = run(['games/future-game/index.html']);
assert.equal(unknownGame.runAll, true,
  'unknown paths below games/ must select all so a new game cannot bypass release gates');

const renamePair = run([
  'games/Racing Car/src/legacy-name.js',
  'games/Racing Car/src/current-name.js',
]);
assert.deepEqual(renamePair.affectedGames, ['racer'],
  'both sides of a rename must remain inside the owning game gate');

const unsafe = spawnSync(process.execPath,
  [SCRIPT, '--format', 'json', '--file', '../outside'], { cwd: ROOT, encoding: 'utf8' });
assert.notEqual(unsafe.status, 0);
assert.match(unsafe.stderr, /Unsafe changed path/);

const invalidRef = spawnSync(process.execPath,
  [SCRIPT, '--format', 'json', '--base', 'definitely-not-a-git-ref', '--head', 'HEAD'],
  { cwd: ROOT, encoding: 'utf8' });
assert.notEqual(invalidRef.status, 0);
assert.match(invalidRef.stderr, /git diff failed/);

for (const flag of ['--files-from', '--github-output']) {
  const escaped = spawnSync(process.execPath,
    [SCRIPT, '--format', 'json', '--file', 'docs/README.md', flag, '../outside'],
    { cwd: ROOT, encoding: 'utf8' });
  assert.notEqual(escaped.status, 0);
  assert.match(escaped.stderr, /safe repository-relative path/);
}

console.log('RELEASE_GATE_TEST=PASS cases=20');
