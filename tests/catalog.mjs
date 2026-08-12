import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CatalogValidationError,
  catalogErrors,
  catalogTargets,
  getGame,
  launcherEntries,
  loadGameCatalog,
  selectChangedGames,
  validateCatalog
} from '../games/catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = loadGameCatalog({ rootDir: ROOT });

assert.equal(catalog.schemaVersion, 1);
assert.equal(catalog.games.length, 13);
assert.equal(new Set(catalog.games.map(({ id }) => id)).size, 13);
assert.equal(new Set(catalog.games.map(({ entry }) => entry.split(/[?#]/, 1)[0])).size, 13);

for (const game of catalog.games) {
  for (const field of ['id', 'title', 'testName', 'subtitle', 'category', 'entry', 'launchPath', 'icon']) {
    assert.equal(typeof game[field], 'string', `${game.id}.${field} must be a string`);
  }
  assert.equal(game.playable, true, `${game.id} is a public playable target`);
  assert.equal(typeof game.runtime?.kind, 'string');
  assert.equal(typeof game.persistence?.mode, 'string');
  assert.equal(typeof game.capabilities?.touch, 'boolean');
  assert.ok(game.release.roots.length > 0);
  for (const tier of ['fast', 'full']) {
    assert.ok(game.release[tier].length > 0, `${game.id} release.${tier} is empty`);
    for (const command of game.release[tier]) {
      assert.equal(typeof command.cwd, 'string');
      assert.ok(Array.isArray(command.argv) && command.argv.length > 0);
      assert.ok(['node', 'npm', 'npx'].includes(command.argv[0]));
    }
  }
  const entryPath = decodeURIComponent(game.entry.split(/[?#]/, 1)[0]);
  assert.ok(fs.existsSync(path.join(ROOT, entryPath)), `${game.id} entry must exist`);
}

assert.equal(getGame(catalog, 'tower').testName, 'Tower Defense');
assert.equal(getGame('does-not-exist'), undefined);
assert.equal(launcherEntries(catalog).length, 13);
assert.equal(launcherEntries(catalog)[6].link, 'games/tower/dist/index.html');
assert.equal(catalogTargets(catalog).length, 13);
assert.equal(catalogTargets(catalog, { includeHub: true }).length, 14);
assert.equal(catalogTargets(catalog, { includeHub: true })[0].id, 'hub');

assert.deepEqual(selectChangedGames(catalog, ['games/Racing Car/src/car.js']).map(({ id }) => id), ['racer']);
assert.deepEqual(selectChangedGames(catalog, ['docs/GAMEHUB_EVOLUTION_PLAN.md']), []);
assert.equal(selectChangedGames(catalog, ['games/shared/js/safe-storage.js']).length, 13);
assert.equal(selectChangedGames(catalog, ['games/future-game/index.html']).length, 13);

const invalid = JSON.parse(JSON.stringify(catalog));
invalid.games[1].id = invalid.games[0].id;
assert.ok(catalogErrors(invalid, { rootDir: ROOT, checkGenerated: false }).some((error) => error.includes('duplicate game id')));
assert.throws(() => validateCatalog(invalid, { rootDir: ROOT, checkGenerated: false }), CatalogValidationError);

// Manifest text must stay inert when embedded in the classic browser artifact.
// A template literal here would execute `${...}` or close on a backtick.
const hostileText = JSON.parse(JSON.stringify(catalog));
hostileText.games[0].subtitle = 'literal ` ${globalThis.catalogInjected = true}';
assert.equal(catalogErrors(hostileText, { rootDir: ROOT, checkGenerated: false }).length, 0);

const externalSmoke = JSON.parse(JSON.stringify(catalog));
externalSmoke.games[0].smoke.route = 'https://example.com/game';
assert.ok(catalogErrors(externalSmoke, { rootDir: ROOT, checkGenerated: false })
  .some((error) => error.includes('smoke.route must be a Pages-safe relative path')));

const externalIcon = JSON.parse(JSON.stringify(catalog));
externalIcon.games[1].icon = 'https://example.com/logo.png';
assert.ok(catalogErrors(externalIcon, { rootDir: ROOT, checkGenerated: false })
  .some((error) => error.includes('icon must be a Pages-safe local path')));

const generatedCheck = spawnSync(process.execPath, ['scripts/build-game-catalog.mjs', '--check'], {
  cwd: ROOT,
  encoding: 'utf8'
});
assert.equal(generatedCheck.status, 0, generatedCheck.stderr || generatedCheck.stdout);

console.log('CATALOG_TEST=PASS games=13 generated=parity changed-file-selection=ok');
