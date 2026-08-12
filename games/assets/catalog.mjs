import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Build-time asset authority.
 *
 * This module deliberately knows nothing about Three.js, Babylon or a browser
 * renderer.  `catalog.json` describes provenance rules and the small number of
 * semantic overrides; the census builder materialises every physical file and
 * `auditAssetCoverage()` joins the two records.  That keeps the catalog deep
 * (one place for policy) without turning it into a second game engine.
 */
export const ASSET_CATALOG_SCHEMA_VERSION = 1;
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ASSET_CATALOG_RELATIVE_PATH = 'games/assets/catalog.json';
export const RIG_KINDS = new Set(['skinned', 'procedural', 'mechanical']);
export const ASSET_KINDS = new Set(['model', 'texture', 'audio', 'font', 'other']);
export const AXES = new Set(['+X', '-X', '+Y', '-Y', '+Z', '-Z']);
// Provenance ids are namespaced (`kaykit:adventurers-1.0`); asset/rig ids use
// the same grammar so a rule can refer to either without an adapter layer.
const ID_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const URL_PATTERN = /^https?:\/\//i;

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function optionsFrom(value) {
  if (typeof value === 'string' || value instanceof URL) return { rootDir: value };
  return value && typeof value === 'object' ? value : {};
}

function rootFrom(options) {
  const rootDir = options.rootDir ?? REPO_ROOT;
  return path.resolve(rootDir instanceof URL ? fileURLToPath(rootDir) : rootDir);
}

function stripQuery(value) {
  return String(value).split(/[?#]/u, 1)[0];
}

function decodePath(value) {
  try {
    return decodeURIComponent(stripQuery(value));
  } catch {
    return null;
  }
}

/** Pages-safe repository-relative path check shared by catalog and census. */
export function isSafeAssetPath(value, { allowDirectory = false } = {}) {
  if (typeof value !== 'string' || value.length === 0 || value.startsWith('/') || value.includes('\\')) return false;
  const decoded = decodePath(value);
  if (!decoded || decoded.startsWith('/') || decoded.split('/').includes('..')) return false;
  if (/^[a-z][a-z\d+.-]*:/iu.test(decoded) || decoded.startsWith('//')) return false;
  if (!allowDirectory && decoded.endsWith('/')) return false;
  return true;
}

function resolveRepoPath(rootDir, relativePath, { allowDirectory = false } = {}) {
  const decoded = decodePath(relativePath);
  if (!decoded || !isSafeAssetPath(relativePath, { allowDirectory })) return null;
  const resolved = path.resolve(rootDir, decoded);
  const prefix = rootDir.endsWith(path.sep) ? rootDir : `${rootDir}${path.sep}`;
  return resolved === rootDir || resolved.startsWith(prefix) ? resolved : null;
}

function readCatalogFile(rootDir, catalogPath) {
  const resolved = resolveRepoPath(rootDir, catalogPath ?? ASSET_CATALOG_RELATIVE_PATH);
  if (!resolved) throw new Error(`Unsafe AssetCatalog path: ${catalogPath}`);
  try {
    return JSON.parse(fs.readFileSync(resolved, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read AssetCatalog ${resolved}: ${error.message}`);
  }
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function idError(value, label, errors) {
  if (!nonEmptyString(value) || !ID_PATTERN.test(value)) errors.push(`${label} must be a lowercase id (a-z, 0-9, ., _, :, -, _)`);
}

function arrayOfStrings(value, label, errors, { allowEmpty = true } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.some((item) => !nonEmptyString(item))) {
    errors.push(`${label} must be a${allowEmpty ? '' : ' non-empty'} string array`);
  }
}

function vector(value, label, errors, { allowZero = true } = {}) {
  if (!Array.isArray(value) || value.length !== 3 || value.some((item) => typeof item !== 'number' || !Number.isFinite(item))) {
    errors.push(`${label} must be a finite 3-number vector`);
    return;
  }
  if (!allowZero && value.every((item) => item === 0)) errors.push(`${label} cannot be the zero vector`);
}

function safeFile(rootDir, value, label, errors, { required = true } = {}) {
  if (value == null && !required) return null;
  if (!isSafeAssetPath(value)) {
    errors.push(`${label} must be a repository-relative file path`);
    return null;
  }
  const resolved = resolveRepoPath(rootDir, value);
  if (!resolved || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) errors.push(`${label} does not exist: ${value}`);
  return resolved;
}

function validateSourceGroups(catalog, rootDir, errors, options) {
  if (!Array.isArray(catalog.provenanceSources)) {
    errors.push('provenanceSources must be an array');
    return new Map();
  }
  const ids = new Set();
  const sources = new Map();
  for (const [index, source] of catalog.provenanceSources.entries()) {
    const label = `provenanceSources[${index}]`;
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    idError(source.id, `${label}.id`, errors);
    if (ids.has(source.id)) errors.push(`duplicate provenance source id: ${source.id}`);
    ids.add(source.id);
    sources.set(source.id, source);
    const status = source.status ?? 'verified';
    if (!['verified', 'blocked'].includes(status)) errors.push(`${label}.status must be verified or blocked`);
    for (const field of ['title', 'author']) if (!nonEmptyString(source[field])) errors.push(`${label}.${field} must be a non-empty string`);
    if (status === 'verified') {
      for (const field of ['sourceUrl', 'license', 'licenseUrl', 'evidencePath']) {
        if (!nonEmptyString(source[field])) errors.push(`${label}.${field} is required for a verified source`);
      }
      if (nonEmptyString(source.sourceUrl) && !URL_PATTERN.test(source.sourceUrl)) errors.push(`${label}.sourceUrl must be http(s)`);
      if (nonEmptyString(source.licenseUrl) && !URL_PATTERN.test(source.licenseUrl)) errors.push(`${label}.licenseUrl must be http(s)`);
      if (nonEmptyString(source.evidencePath)) safeFile(rootDir, source.evidencePath, `${label}.evidencePath`, errors);
    } else {
      arrayOfStrings(source.blockers, `${label}.blockers`, errors, { allowEmpty: false });
    }
    if (source.notes !== undefined && !nonEmptyString(source.notes)) errors.push(`${label}.notes must be a non-empty string when provided`);
  }
  return sources;
}

function validatePathRules(catalog, sources, errors) {
  if (!Array.isArray(catalog.pathRules)) {
    errors.push('pathRules must be an array');
    return [];
  }
  const ids = new Set();
  const prefixes = new Set();
  const rules = [];
  for (const [index, rule] of catalog.pathRules.entries()) {
    const label = `pathRules[${index}]`;
    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    idError(rule.id, `${label}.id`, errors);
    if (ids.has(rule.id)) errors.push(`duplicate path rule id: ${rule.id}`);
    ids.add(rule.id);
    if (!isSafeAssetPath(rule.prefix, { allowDirectory: true })) errors.push(`${label}.prefix must be a safe repository path (directory prefixes should end with /)`);
    if (prefixes.has(rule.prefix)) errors.push(`duplicate path rule prefix: ${rule.prefix}`);
    prefixes.add(rule.prefix);
    if (!sources.has(rule.sourceId)) errors.push(`${label}.sourceId is unknown: ${rule.sourceId}`);
    if (!ASSET_KINDS.has(rule.assetKind)) errors.push(`${label}.assetKind is invalid`);
    arrayOfStrings(rule.gameIds, `${label}.gameIds`, errors, { allowEmpty: false });
    const status = rule.status ?? (sources.get(rule.sourceId)?.status ?? 'verified');
    if (!['verified', 'blocked'].includes(status)) errors.push(`${label}.status must be verified or blocked`);
    if (status === 'blocked') arrayOfStrings(rule.blockers, `${label}.blockers`, errors, { allowEmpty: false });
    rules.push(rule);
  }
  return rules;
}

function validateMetrics(metrics, label, errors) {
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
    errors.push(`${label} must be an object`);
    return;
  }
  vector(metrics.bounds?.min, `${label}.bounds.min`, errors);
  vector(metrics.bounds?.max, `${label}.bounds.max`, errors);
  vector(metrics.bounds?.size, `${label}.bounds.size`, errors);
  for (const field of ['triangles', 'materials', 'textures', 'textureMemoryBytes', 'skeletons', 'meshes', 'nodes']) {
    if (metrics[field] !== undefined && (!Number.isInteger(metrics[field]) || metrics[field] < 0)) errors.push(`${label}.${field} must be a non-negative integer`);
  }
  if (!Array.isArray(metrics.clips) || metrics.clips.some((clip) => !nonEmptyString(clip))) errors.push(`${label}.clips must be a string array`);
  if (!AXES.has(metrics.forwardAxis)) errors.push(`${label}.forwardAxis must be a glTF/game axis`);
  if (metrics.upAxis !== '+Y') errors.push(`${label}.upAxis must be +Y`);
  if (typeof metrics.unitScale !== 'number' || !Number.isFinite(metrics.unitScale) || metrics.unitScale <= 0) errors.push(`${label}.unitScale must be a positive number`);
  vector(metrics.pivot, `${label}.pivot`, errors);
}

function validateAssetOverrides(catalog, sources, rigs, rootDir, errors, options) {
  if (!Array.isArray(catalog.assetOverrides)) {
    errors.push('assetOverrides must be an array');
    return [];
  }
  const ids = new Set();
  const paths = new Set();
  const overrides = [];
  for (const [index, asset] of catalog.assetOverrides.entries()) {
    const label = `assetOverrides[${index}]`;
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    idError(asset.assetId, `${label}.assetId`, errors);
    if (ids.has(asset.assetId)) errors.push(`duplicate asset override id: ${asset.assetId}`);
    ids.add(asset.assetId);
    if (!isSafeAssetPath(asset.path)) errors.push(`${label}.path must be a repository-relative file path`);
    if (paths.has(asset.path)) errors.push(`duplicate asset override path: ${asset.path}`);
    paths.add(asset.path);
    if (options.checkFiles !== false) safeFile(rootDir, asset.path, `${label}.path`, errors);
    if (asset.sourceId !== undefined && !sources.has(asset.sourceId)) errors.push(`${label}.sourceId is unknown: ${asset.sourceId}`);
    if (!ASSET_KINDS.has(asset.assetKind)) errors.push(`${label}.assetKind is invalid`);
    arrayOfStrings(asset.gameIds, `${label}.gameIds`, errors, { allowEmpty: false });
    const status = asset.status ?? (sources.get(asset.sourceId)?.status ?? 'verified');
    if (!['verified', 'blocked'].includes(status)) errors.push(`${label}.status must be verified or blocked`);
    if (status === 'blocked') arrayOfStrings(asset.blockers, `${label}.blockers`, errors, { allowEmpty: false });
    if (asset.rigId !== undefined && !rigs.has(asset.rigId)) errors.push(`${label}.rigId is unknown: ${asset.rigId}`);
    if (asset.metrics !== undefined) validateMetrics(asset.metrics, `${label}.metrics`, errors);
    overrides.push(asset);
  }
  return overrides;
}

function validateSocket(socket, label, errors) {
  if (!socket || typeof socket !== 'object' || Array.isArray(socket)) {
    errors.push(`${label} must be an object`);
    return;
  }
  arrayOfStrings(socket.nodes, `${label}.nodes`, errors, { allowEmpty: false });
  if (socket.required !== undefined && typeof socket.required !== 'boolean') errors.push(`${label}.required must be boolean`);
  if (socket.offset !== undefined) vector(socket.offset, `${label}.offset`, errors);
}

function validateClip(clip, label, errors) {
  if (!clip || typeof clip !== 'object' || Array.isArray(clip)) {
    errors.push(`${label} must be an object`);
    return;
  }
  if (clip.kind === 'clip') {
    if (!nonEmptyString(clip.name)) errors.push(`${label}.name is required for authored clip`);
    if (typeof clip.durationSec !== 'number' || !Number.isFinite(clip.durationSec) || clip.durationSec <= 0) errors.push(`${label}.durationSec must be positive`);
    for (const field of ['loop', 'rootMotion', 'interruptible']) if (typeof clip[field] !== 'boolean') errors.push(`${label}.${field} must be boolean`);
    if (clip.contactFrame !== undefined && (typeof clip.contactFrame !== 'number' || clip.contactFrame < 0 || clip.contactFrame > 1)) errors.push(`${label}.contactFrame must be a normalized number`);
    if (clip.sourceSkeleton !== undefined && !SHA256_PATTERN.test(clip.sourceSkeleton)) errors.push(`${label}.sourceSkeleton must be sha256`);
  } else if (clip.kind === 'procedural') {
    if (!nonEmptyString(clip.driver)) errors.push(`${label}.driver is required for procedural fallback`);
    if (!nonEmptyString(clip.state)) errors.push(`${label}.state is required for procedural fallback`);
  } else {
    errors.push(`${label}.kind must be clip or procedural`);
  }
}

function validateRigs(catalog, errors) {
  if (!Array.isArray(catalog.rigs)) {
    errors.push('rigs must be an array');
    return new Map();
  }
  const ids = new Set();
  const assets = new Set();
  const rigs = new Map();
  for (const [index, rig] of catalog.rigs.entries()) {
    const label = `rigs[${index}]`;
    if (!rig || typeof rig !== 'object' || Array.isArray(rig)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    idError(rig.id, `${label}.id`, errors);
    if (ids.has(rig.id)) errors.push(`duplicate rig id: ${rig.id}`);
    ids.add(rig.id);
    if (assets.has(rig.assetId)) errors.push(`duplicate rig assetId: ${rig.assetId}`);
    assets.add(rig.assetId);
    if (!RIG_KINDS.has(rig.rigKind)) errors.push(`${label}.rigKind is invalid`);
    if (!nonEmptyString(rig.root)) errors.push(`${label}.root must be a non-empty node name`);
    if (!AXES.has(rig.forwardAxis)) errors.push(`${label}.forwardAxis must be a glTF/game axis`);
    if (rig.upAxis !== '+Y') errors.push(`${label}.upAxis must be +Y`);
    if (typeof rig.scaleMetres !== 'number' || !Number.isFinite(rig.scaleMetres) || rig.scaleMetres <= 0) errors.push(`${label}.scaleMetres must be positive`);
    if (rig.rigKind === 'skinned' && !SHA256_PATTERN.test(rig.skeletonHash ?? '')) errors.push(`${label}.skeletonHash is required for skinned rigs`);
    if (!rig.bones || typeof rig.bones !== 'object' || Array.isArray(rig.bones)) errors.push(`${label}.bones must be a semantic bone map`);
    else for (const [semantic, nodes] of Object.entries(rig.bones)) arrayOfStrings(nodes, `${label}.bones.${semantic}`, errors, { allowEmpty: false });
    if (!rig.sockets || typeof rig.sockets !== 'object' || Array.isArray(rig.sockets)) errors.push(`${label}.sockets must be a socket map`);
    else for (const [semantic, socket] of Object.entries(rig.sockets)) validateSocket(socket, `${label}.sockets.${semantic}`, errors);
    if (!rig.clips || typeof rig.clips !== 'object' || Array.isArray(rig.clips)) errors.push(`${label}.clips must be a semantic clip map`);
    else for (const [semantic, clip] of Object.entries(rig.clips)) validateClip(clip, `${label}.clips.${semantic}`, errors);
    rigs.set(rig.id, rig);
  }
  return rigs;
}

export class AssetCatalogValidationError extends Error {
  constructor(errors) {
    super(`AssetCatalog validation failed:\n- ${errors.join('\n- ')}`);
    this.name = 'AssetCatalogValidationError';
    this.errors = errors;
  }
}

/** Return structural/policy errors without throwing. */
export function assetCatalogErrors(input, options = {}) {
  const opts = optionsFrom(options);
  const rootDir = rootFrom(opts);
  const catalog = input && typeof input === 'object' ? input : {};
  const errors = [];
  if (catalog.schemaVersion !== ASSET_CATALOG_SCHEMA_VERSION) errors.push(`schemaVersion must be ${ASSET_CATALOG_SCHEMA_VERSION}`);
  const sources = validateSourceGroups(catalog, rootDir, errors, opts);
  validatePathRules(catalog, sources, errors);
  const rigs = validateRigs(catalog, errors);
  validateAssetOverrides(catalog, sources, rigs, rootDir, errors, opts);
  if (catalog.defaults !== undefined) {
    if (!catalog.defaults || typeof catalog.defaults !== 'object' || Array.isArray(catalog.defaults)) errors.push('defaults must be an object');
    else {
      if (!['blocked', 'verified'].includes(catalog.defaults.status)) errors.push('defaults.status must be blocked or verified');
      if (catalog.defaults.status === 'blocked') arrayOfStrings(catalog.defaults.blockers, 'defaults.blockers', errors, { allowEmpty: false });
    }
  }
  return errors;
}

export const catalogErrors = assetCatalogErrors;

/** Validate and return the catalog unchanged. */
export function validateAssetCatalog(catalog, options = {}) {
  const errors = assetCatalogErrors(catalog, options);
  if (errors.length > 0) throw new AssetCatalogValidationError(errors);
  return catalog;
}

export function loadAssetCatalog(value = {}) {
  const options = optionsFrom(value);
  const rootDir = rootFrom(options);
  const catalog = Array.isArray(options.pathRules) ? options : readCatalogFile(rootDir, options.catalogPath);
  if (options.validate !== false) validateAssetCatalog(catalog, { ...options, rootDir });
  return catalog;
}

export function loadRigCatalog(value = {}) {
  return clone(loadAssetCatalog(value).rigs);
}

function ensureCatalog(value) {
  return value && Array.isArray(value.pathRules) && Array.isArray(value.provenanceSources) ? value : loadAssetCatalog(value);
}

function argumentCatalogId(first, second) {
  if (typeof first === 'string') return { catalog: loadAssetCatalog(), id: first };
  if (first && Array.isArray(first.pathRules)) return { catalog: first, id: second };
  return { catalog: loadAssetCatalog(first), id: second };
}

/** Look up a semantic override by asset id. */
export function getAsset(first, second) {
  const { catalog, id } = argumentCatalogId(first, second);
  return clone(catalog.assetOverrides.find((asset) => asset.assetId === id || asset.path === id));
}

/** Look up a RigDescriptor by rig id or asset id. */
export function getRig(first, second) {
  const { catalog, id } = argumentCatalogId(first, second);
  return clone(catalog.rigs.find((rig) => rig.id === id || rig.assetId === id));
}

function ruleForPath(catalog, relativePath) {
  const pathValue = stripQuery(relativePath).replaceAll('\\', '/').replace(/^\.\//u, '');
  return catalog.pathRules
    .filter((rule) => rule.prefix.endsWith('/') ? pathValue.startsWith(rule.prefix) : pathValue === rule.prefix)
    .sort((a, b) => {
      const bySpecificity = b.prefix.length - a.prefix.length;
      if (bySpecificity !== 0) return bySpecificity;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    })[0] ?? null;
}

function overrideForPath(catalog, relativePath) {
  const pathValue = stripQuery(relativePath).replaceAll('\\', '/').replace(/^\.\//u, '');
  return catalog.assetOverrides.find((asset) => asset.path === pathValue) ?? null;
}

function deterministicAssetId(relativePath) {
  const normalized = stripQuery(relativePath).replaceAll('\\', '/').replace(/^\.\//u, '');
  const slug = normalized.replace(/[^a-zA-Z0-9]+/gu, '-').replace(/^-|-$/gu, '').toLowerCase();
  return `asset-${slug || crypto.createHash('sha1').update(normalized).digest('hex').slice(0, 12)}`;
}

function normalizeCensus(census) {
  if (!census || typeof census !== 'object' || census.schemaVersion !== ASSET_CATALOG_SCHEMA_VERSION || !Array.isArray(census.files)) {
    throw new Error('Asset census must have schemaVersion 1 and a files array');
  }
  const seen = new Set();
  for (const [index, file] of census.files.entries()) {
    const label = `census.files[${index}]`;
    if (!file || typeof file !== 'object' || !isSafeAssetPath(file.path)) throw new Error(`${label}.path is unsafe or missing`);
    if (seen.has(file.path)) throw new Error(`duplicate census path: ${file.path}`);
    seen.add(file.path);
    if (!Number.isInteger(file.bytes) || file.bytes < 0) throw new Error(`${label}.bytes must be a non-negative integer`);
    if (!SHA256_PATTERN.test(file.sha256 ?? '')) throw new Error(`${label}.sha256 must be lowercase sha256`);
    if (!nonEmptyString(file.format)) throw new Error(`${label}.format is required`);
    if (file.missing !== undefined && (!Array.isArray(file.missing) || file.missing.some((reason) => !nonEmptyString(reason)))) {
      throw new Error(`${label}.missing must be a string array`);
    }
  }
  return census.files;
}

/**
 * Join a generated physical-file census to provenance rules and overrides.
 * The result is intentionally a report, not a throw: unknown/unlicensed files
 * become explicit blockers for CI while the rest of the report stays useful.
 */
export function auditAssetCoverage(first, second = {}) {
  let catalog;
  let census;
  let options;
  if (first && Array.isArray(first.files)) {
    catalog = loadAssetCatalog(second);
    census = first;
    options = optionsFrom(second);
  } else {
    catalog = ensureCatalog(first);
    census = second?.census ?? second;
    options = optionsFrom(second);
  }
  const files = normalizeCensus(census);
  const rootDir = rootFrom(options);
  const sources = new Map(catalog.provenanceSources.map((source) => [source.id, source]));
  const defaults = catalog.defaults ?? { status: 'blocked', blockers: ['no matching provenance path rule'] };
  const reportFiles = files.map((file) => {
    const override = overrideForPath(catalog, file.path);
    const rule = ruleForPath(catalog, file.path);
    const sourceId = override?.sourceId ?? rule?.sourceId ?? null;
    const source = sourceId ? sources.get(sourceId) : null;
    // A verified source omits `status` by design.  Do not let the catalog-wide
    // blocked fallback accidentally downgrade every verified rule.  Keep this
    // provenance result separate from technical readiness: a missing axis or
    // socket is a rig issue, not evidence that a CC0 source is unlicensed.
    const provenanceStatus = override?.status ?? rule?.status ?? source?.status ?? (source ? 'verified' : (defaults.status ?? 'blocked'));
    const provenanceBlockers = [...(override?.blockers ?? []), ...(rule?.blockers ?? [])];
    const issues = [...(file.missing ?? [])];
    if (options.verifyChecksums !== false) {
      const localPath = resolveRepoPath(rootDir, file.path);
      if (!localPath || !fs.existsSync(localPath) || !fs.statSync(localPath).isFile()) {
        issues.push('runtime file is missing from the checkout');
      } else {
        const local = fs.readFileSync(localPath);
        if (local.length !== file.bytes) issues.push(`runtime byte count mismatch: census=${file.bytes} local=${local.length}`);
        const localHash = crypto.createHash('sha256').update(local).digest('hex');
        if (localHash !== file.sha256) issues.push('runtime sha256 mismatch');
      }
    }
    if (!rule && !override) provenanceBlockers.push(...(defaults.blockers ?? ['no matching provenance path rule']));
    if (!source) provenanceBlockers.push('provenance source is missing');
    else if (source.status === 'blocked') provenanceBlockers.push(...(source.blockers ?? ['provenance source is blocked']));
    if (provenanceStatus === 'blocked' && provenanceBlockers.length === 0) provenanceBlockers.push('asset is explicitly blocked without a reason');
    const rigFacts = file.rigFacts ?? {};
    const rigId = override?.rigId ?? null;
    const rig = rigId ? catalog.rigs.find((candidate) => candidate.id === rigId) : null;
    const hasRigFacts = Number(rigFacts.skeletons ?? rigFacts.skins ?? 0) > 0
      || Number(rigFacts.animations ?? rigFacts.clips ?? 0) > 0
      || (Array.isArray(rigFacts.bones) && rigFacts.bones.length > 0);
    if (hasRigFacts && !rig) issues.push('rig descriptor missing for skeletal/animated asset');
    if (rigId && !rig) issues.push(`rig descriptor not found: ${rigId}`);
    const uniqueProvenanceBlockers = [...new Set(provenanceBlockers)];
    const uniqueIssues = [...new Set(issues)];
    const readinessStatus = provenanceStatus === 'verified' && uniqueIssues.length === 0 ? 'ready' : 'blocked';
    return {
      ...clone(file),
      assetId: override?.assetId ?? deterministicAssetId(file.path),
      assetKind: override?.assetKind ?? rule?.assetKind ?? 'other',
      gameIds: clone(override?.gameIds ?? rule?.gameIds ?? []),
      sourceId,
      source: source ? { ...clone(source), status: source.status ?? 'verified' } : null,
      rigId,
      // `status` remains a compatibility alias for provenanceStatus.  New
      // callers should use the explicit fields below.
      status: provenanceStatus,
      provenanceStatus,
      provenanceBlockers: uniqueProvenanceBlockers,
      readinessStatus,
      issues: uniqueIssues,
      blockers: uniqueProvenanceBlockers,
    };
  });
  const blockers = reportFiles.flatMap((file) => file.provenanceBlockers.map((reason) => ({ path: file.path, reason })));
  const issues = reportFiles.flatMap((file) => file.issues.map((reason) => ({ path: file.path, reason })));
  const byGame = new Map();
  for (const file of reportFiles) for (const gameId of file.gameIds) byGame.set(gameId, (byGame.get(gameId) ?? 0) + 1);
  return {
    schemaVersion: ASSET_CATALOG_SCHEMA_VERSION,
    ok: blockers.length === 0 && issues.length === 0,
    files: reportFiles,
    blockers,
    issues,
    counts: {
      files: reportFiles.length,
      verified: reportFiles.filter((file) => file.status === 'verified').length,
      blocked: reportFiles.filter((file) => file.status === 'blocked').length,
      ready: reportFiles.filter((file) => file.readinessStatus === 'ready').length,
      readinessBlocked: reportFiles.filter((file) => file.readinessStatus === 'blocked').length,
      byGame: Object.fromEntries([...byGame.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))),
    },
    options: { rootDir: options.rootDir ?? REPO_ROOT },
  };
}

/** Resolve a catalog asset path to a local file without allowing traversal. */
export function resolveAssetPath(first, second, third = {}) {
  const { catalog, id } = argumentCatalogId(first, second);
  const asset = getAsset(catalog, id) ?? (isSafeAssetPath(id) ? { path: id } : null);
  if (!asset) return null;
  const rootDir = rootFrom(optionsFrom(third));
  return resolveRepoPath(rootDir, asset.path);
}

/** Return overrides assigned to a game, or covered census files when supplied. */
export function assetsForGame(first, second, third = {}) {
  let catalog;
  let gameId;
  let census;
  if (typeof first === 'string') {
    catalog = loadAssetCatalog();
    gameId = first;
  } else {
    catalog = ensureCatalog(first);
    gameId = second;
    census = third?.census ?? (second && typeof second === 'object' ? second : null);
  }
  if (census?.files) return auditAssetCoverage(catalog, { census }).files.filter((file) => file.gameIds.includes(gameId));
  const rules = catalog.pathRules.filter((rule) => rule.gameIds.includes(gameId));
  return clone(catalog.assetOverrides.filter((asset) => asset.gameIds.includes(gameId) || rules.some((rule) => asset.path.startsWith(rule.prefix))));
}

export default {
  loadAssetCatalog,
  loadRigCatalog,
  validateAssetCatalog,
  assetCatalogErrors,
  auditAssetCoverage,
  getAsset,
  getRig,
  resolveAssetPath,
  assetsForGame,
};
