import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { auditAssetCoverage, isSafeAssetPath, loadAssetCatalog } from '../games/assets/catalog.mjs';
import { OUTPUT_RELATIVE_PATH, CENSUS_SCHEMA_VERSION } from '../scripts/build-asset-census.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(ROOT, OUTPUT_RELATIVE_PATH);
const census = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

assert.equal(census.schemaVersion, CENSUS_SCHEMA_VERSION);
assert.ok(Array.isArray(census.files));
assert.equal(census.files.length, 267);
assert.deepEqual(census.files.map(({ path: relativePath }) => relativePath), [...census.files]
  .map(({ path: relativePath }) => relativePath)
  .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
assert.equal(new Set(census.files.map(({ path: relativePath }) => relativePath)).size, census.files.length);

for (const file of census.files) {
  assert.ok(isSafeAssetPath(file.path), `${file.path} must remain repository-relative`);
  assert.ok(Number.isInteger(file.bytes) && file.bytes >= 0);
  assert.match(file.sha256, /^[a-f0-9]{64}$/u);
  assert.ok(file.format === 'glb' || file.format === 'gltf');
  const absolutePath = path.join(ROOT, file.path);
  assert.equal(fs.statSync(absolutePath).size, file.bytes, `${file.path} byte census drifted`);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(absolutePath)).digest('hex'), file.sha256, `${file.path} checksum drifted`);
  assert.ok(file.runtimePath === null || isSafeAssetPath(file.runtimePath));
  assert.ok(file.sourcePath === null || isSafeAssetPath(file.sourcePath));
  assert.ok(Array.isArray(file.missing));
  if (file.duplicateOf) {
    assert.equal(file.metrics, undefined, `${file.path} duplicate must not repeat deep metrics`);
    assert.equal(file.rigFacts, undefined, `${file.path} duplicate must not repeat deep rig facts`);
    assert.equal(file.metricsRef, file.duplicateOf);
    assert.equal(file.rigFactsRef, file.duplicateOf);
    assert.match(file.factsSha256, /^[a-f0-9]{64}$/u);
  } else {
    assert.ok(file.metrics && typeof file.metrics === 'object');
    assert.ok(file.rigFacts && typeof file.rigFacts === 'object');
    assert.ok(file.metrics.bounds && 'min' in file.metrics.bounds && 'max' in file.metrics.bounds);
  }
}

const canonicalFiles = census.files.filter((file) => file.runtimePath !== null && file.path === file.runtimePath);
assert.equal(canonicalFiles.length, 155);
assert.equal(census.coverage.trackedFiles, 267);
assert.equal(census.coverage.canonicalRuntimeFiles, 155);
assert.equal(census.coverage.sourceOnlyFiles, 4);
assert.equal(census.coverage.duplicateFiles, 108);
assert.equal(census.coverage.parseFailures, 0);
assert.ok(Array.isArray(census.coverage.catalog.blockers));
assert.ok(Array.isArray(census.coverage.catalog.issues));
assert.ok(census.coverage.catalog.issues.some(({ path: relativePath, reason }) => relativePath.endsWith('moba/assets/models/anims.glb') && reason === 'bounds'));
assert.equal(census.coverage.catalog.counts.verified, 127);
assert.equal(census.coverage.catalog.counts.blocked, 28);
assert.equal(census.coverage.catalog.counts.ready, 118);
assert.equal(census.coverage.catalog.counts.readinessBlocked, 37);

const canonicalByPath = new Map(canonicalFiles.map((file) => [file.path, file]));
assert.equal(canonicalByPath.get('games/elden-ring-ii/public/assets/monsters/demon.gltf').format, 'gltf');
assert.equal(canonicalByPath.get('games/elden-ring-ii/public/assets/monsters/demon.gltf').rigFacts.animations, 14);
assert.equal(canonicalByPath.get('games/moba/assets/models/anims.glb').rigFacts.animations, 23);
assert.ok(canonicalByPath.get('games/moba/assets/models/anims.glb').missing.includes('bounds'));
assert.equal(canonicalByPath.get('games/moba/assets/models/champions/knight.glb').rigFacts.skeletons, 1);
assert.equal(canonicalByPath.get('games/moba/assets/models/champions/knight.glb').rigFacts.bones.length, 41);
assert.equal(canonicalByPath.get('games/elden-ring-ii/public/assets/enemies/skeleton-minion.glb').rigFacts.clips.length, 95);
assert.ok(canonicalByPath.get('games/elden-ring-ii/public/assets/enemies/skeleton-minion.glb').rigFacts.channelLayouts.length
  < canonicalByPath.get('games/elden-ring-ii/public/assets/enemies/skeleton-minion.glb').rigFacts.clips.length);

const catalog = loadAssetCatalog({ rootDir: ROOT });
const coverage = auditAssetCoverage(catalog, { census: { schemaVersion: 1, files: canonicalFiles }, rootDir: ROOT });
assert.equal(coverage.counts.files, 155);
assert.equal(coverage.counts.verified, 127);
assert.equal(coverage.counts.blocked, 28);
assert.equal(coverage.counts.ready, 118);
assert.equal(coverage.counts.readinessBlocked, 37);
assert.equal(coverage.files.find(({ path: relativePath }) => relativePath.endsWith('moba/assets/models/anims.glb')).sourceId, 'kaykit:skeletons-1.0');
assert.equal(coverage.files.find(({ path: relativePath }) => relativePath.endsWith('moba/assets/models/arena.glb')).sourceId, 'kaykit:medieval-hexagon-1.0');
assert.equal(coverage.files.find(({ path: relativePath }) => relativePath.endsWith('moba/assets/models/weapons.glb')).sourceId, 'kaykit:adventurers-1.0');
assert.equal(coverage.files.find(({ path: relativePath }) => relativePath.endsWith('elden-ring-ii/public/assets/monsters/demon.gltf')).sourceId, 'quaternius:ultimate-platformer');

const generatedCheck = spawnSync(process.execPath, ['scripts/build-asset-census.mjs', '--check'], {
  cwd: ROOT,
  encoding: 'utf8'
});
assert.equal(generatedCheck.status, 0, generatedCheck.stderr || generatedCheck.stdout);

console.log(`ASSET_CENSUS_TEST=PASS physical=${census.files.length} canonical=${canonicalFiles.length} provenance=${coverage.counts.verified}/${coverage.counts.blocked} readiness=${coverage.counts.ready}/${coverage.counts.readinessBlocked}`);
