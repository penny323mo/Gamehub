import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AssetCatalogValidationError,
  ASSET_CATALOG_SCHEMA_VERSION,
  assetCatalogErrors,
  assetsForGame,
  auditAssetCoverage,
  getAsset,
  getRig,
  loadAssetCatalog,
  loadRigCatalog,
  resolveAssetPath,
  validateAssetCatalog,
} from '../games/assets/catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalog = loadAssetCatalog({ rootDir: ROOT });

assert.equal(catalog.schemaVersion, ASSET_CATALOG_SCHEMA_VERSION);
assert.ok(catalog.provenanceSources.length >= 20);
assert.ok(catalog.pathRules.length >= 15);
assert.ok(catalog.assetOverrides.length >= 10);
assert.ok(catalog.rigs.length >= 10);
assert.equal(new Set(catalog.provenanceSources.map(({ id }) => id)).size, catalog.provenanceSources.length);
assert.equal(assetCatalogErrors(catalog, { rootDir: ROOT }).length, 0);

assert.equal(getAsset(catalog, 'asset:elden-warrior').path, 'games/elden-ring-ii/public/assets/characters/warrior.glb');
assert.equal(getRig(catalog, 'asset:elden-warrior').rigKind, 'skinned');
assert.equal(getRig(catalog, 'rig:racing-car').rigKind, 'mechanical');
assert.equal(loadRigCatalog({ rootDir: ROOT }).length, catalog.rigs.length);
assert.equal(resolveAssetPath(catalog, 'asset:elden-warrior'), path.join(ROOT, 'games/elden-ring-ii/public/assets/characters/warrior.glb'));
assert.equal(resolveAssetPath(catalog, '../secret'), null);
assert.ok(assetsForGame(catalog, 'moba').some(({ assetId }) => assetId === 'asset:moba-knight'));

const census = {
  schemaVersion: 1,
  files: [
    {
      path: 'games/moba/assets/models/champions/knight.glb',
      bytes: fs.statSync(path.join(ROOT, 'games/moba/assets/models/champions/knight.glb')).size,
      sha256: '718fcacb4c9d3490eca2873307aa59a934842d9c69da41806060e27eefba0f35',
      format: 'glb',
      rigFacts: { skeletons: 1, bones: 41, animations: 0 },
      missing: [],
    },
    {
      path: 'games/moba/assets/models/anims.glb',
      bytes: fs.statSync(path.join(ROOT, 'games/moba/assets/models/anims.glb')).size,
      sha256: 'af4c2b0e26d45b7227ed5f54ba833a36b3aef1e345e1dfe54197625951457a69',
      format: 'glb',
      rigFacts: { animations: 23 },
      missing: [],
    },
    {
      path: 'games/Racing Car/assets/car.glb',
      bytes: fs.statSync(path.join(ROOT, 'games/Racing Car/assets/car.glb')).size,
      sha256: '8d246bb29c53ceb735a70c6f2b9d709aef5f9801b8a03120de33d2cd2859dbdf',
      format: 'glb',
      rigFacts: {},
      missing: [],
    },
    {
      path: 'games/royale/assets/models/TowerHouse_FirstAge.glb',
      bytes: fs.statSync(path.join(ROOT, 'games/royale/assets/models/TowerHouse_FirstAge.glb')).size,
      sha256: '0000000000000000000000000000000000000000000000000000000000000000',
      format: 'glb',
      rigFacts: {},
      missing: [],
    },
    {
      path: 'games/royale/assets/models/units/archer.glb',
      bytes: fs.statSync(path.join(ROOT, 'games/royale/assets/models/units/archer.glb')).size,
      sha256: '0000000000000000000000000000000000000000000000000000000000000000',
      format: 'glb',
      rigFacts: {},
      missing: [],
    },
    {
      path: 'games/elden-ring-ii/public/assets/monsters/demon.gltf',
      bytes: fs.statSync(path.join(ROOT, 'games/elden-ring-ii/public/assets/monsters/demon.gltf')).size,
      sha256: '0000000000000000000000000000000000000000000000000000000000000000',
      format: 'gltf',
      rigFacts: {},
      missing: [],
    },
    {
      path: 'games/future/assets/unknown.glb',
      bytes: 12,
      sha256: '0000000000000000000000000000000000000000000000000000000000000000',
      format: 'glb',
      rigFacts: {},
      missing: [],
    },
  ],
};
const coverage = auditAssetCoverage(catalog, { census, rootDir: ROOT });
assert.equal(coverage.counts.files, 7);
assert.equal(coverage.files.find(({ path: p }) => p.endsWith('knight.glb')).sourceId, 'kaykit:adventurers-1.0');
assert.equal(coverage.files.find(({ path: p }) => p.endsWith('anims.glb')).sourceId, 'kaykit:skeletons-1.0');
assert.equal(coverage.files.find(({ path: p }) => p.endsWith('TowerHouse_FirstAge.glb')).sourceId, 'quaternius:rts');
assert.equal(coverage.files.find(({ path: p }) => p.endsWith('units/archer.glb')).sourceId, 'meshy:royale-player-provided');
assert.equal(coverage.files.find(({ path: p }) => p.endsWith('monsters/demon.gltf')).sourceId, 'quaternius:ultimate-platformer');
assert.ok(coverage.files.find(({ path: p }) => p.endsWith('car.glb')).blockers.some((reason) => reason.includes('source')));
assert.ok(coverage.files.find(({ path: p }) => p.includes('future/assets')).blockers.some((reason) => reason.includes('no matching')));
assert.equal(coverage.ok, false);
assert.ok(assetsForGame(catalog, 'moba', { census }).some(({ assetId }) => assetId === 'asset:moba-knight'));

// The checked-in generated census is the release evidence.  Keep the license
// coverage count independent from rig/readiness gaps: the current baseline is
// 127 provenance-covered files and 28 explicit source/license blockers.
const generatedCensus = JSON.parse(fs.readFileSync(path.join(ROOT, 'games/assets/census.generated.json'), 'utf8'));
const canonicalFiles = generatedCensus.files.filter((file) => file.runtimePath !== null && file.path === file.runtimePath);
const baseline = auditAssetCoverage(catalog, { census: { schemaVersion: 1, files: canonicalFiles }, rootDir: ROOT });
assert.equal(canonicalFiles.length, 155);
assert.equal(baseline.counts.verified, 127);
assert.equal(baseline.counts.blocked, 28);
assert.equal(baseline.files.find(({ path: p }) => p.endsWith('elden-ring-ii/public/assets/characters/warrior.glb')).provenanceStatus, 'verified');
assert.equal(baseline.files.find(({ path: p }) => p.endsWith('tower/public/models/enemies/skeleton.glb')).sourceId, 'kenney:graveyard-kit-3.0');
assert.equal(baseline.files.find(({ path: p }) => p.endsWith('Racing Car/assets/car.glb')).provenanceStatus, 'blocked');

const invalid = JSON.parse(JSON.stringify(catalog));
invalid.pathRules[0].sourceId = 'does-not-exist';
assert.ok(assetCatalogErrors(invalid, { rootDir: ROOT }).some((error) => error.includes('sourceId is unknown')));
assert.throws(() => validateAssetCatalog(invalid, { rootDir: ROOT }), AssetCatalogValidationError);

const unsafe = JSON.parse(JSON.stringify(catalog));
unsafe.assetOverrides[0].path = '../outside.glb';
assert.ok(assetCatalogErrors(unsafe, { rootDir: ROOT }).some((error) => error.includes('repository-relative')));

console.log(`ASSET_CATALOG_TEST=PASS sources=${catalog.provenanceSources.length} rules=${catalog.pathRules.length} overrides=${catalog.assetOverrides.length} rigs=${catalog.rigs.length} coverage-blockers=${coverage.blockers.length}`);
