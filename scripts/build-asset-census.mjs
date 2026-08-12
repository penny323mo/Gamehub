#!/usr/bin/env node

/**
 * Deterministic, dependency-free GLB/glTF census.
 *
 * This script intentionally reports facts that can be read from the glTF JSON
 * document.  It does not infer a game's forward axis, unit scale, semantic
 * clips, or sockets from a node name.  Those decisions belong in the
 * AssetCatalog/RigCatalog authority and are joined in the optional coverage
 * report at the end of the generated file.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  ASSET_CATALOG_RELATIVE_PATH,
  ASSET_CATALOG_SCHEMA_VERSION,
  REPO_ROOT as CATALOG_ROOT,
  assetCatalogErrors,
  auditAssetCoverage,
  loadAssetCatalog
} from '../games/assets/catalog.mjs';

export const CENSUS_SCHEMA_VERSION = 1;
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUTPUT_RELATIVE_PATH = 'games/assets/census.generated.json';
const MODEL_EXTENSIONS = new Set(['.glb', '.gltf']);
const DEPLOY_VARIANTS = new Set(['dist', 'public']);
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;

const compareStrings = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

if (REPO_ROOT !== CATALOG_ROOT) {
  throw new Error(`Repository root mismatch: ${REPO_ROOT} !== ${CATALOG_ROOT}`);
}

function stableSortStrings(values) {
  return [...values].sort(compareStrings);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function finiteVector(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every((component) => typeof component === 'number' && Number.isFinite(component));
}

function finitePositive(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function normalizeRelativePath(value) {
  return value.replaceAll('\\', '/').replace(/^\.\//u, '');
}

function splitPath(relativePath) {
  return normalizeRelativePath(relativePath).split('/').filter(Boolean);
}

function isModelPath(relativePath) {
  return MODEL_EXTENSIONS.has(path.posix.extname(relativePath).toLowerCase());
}

/**
 * Git is the source of truth: ignored node_modules, temporary Playwright
 * output, and untracked downloads must not silently enter the census.
 */
export function trackedModelPaths(rootDir = REPO_ROOT) {
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: rootDir,
    encoding: 'buffer'
  });
  if (result.error) throw new Error(`Unable to list tracked files: ${result.error.message}`);
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8').trim() : '';
    throw new Error(`git ls-files failed${stderr ? `: ${stderr}` : ''}`);
  }
  return result.stdout
    .toString('utf8')
    .split('\0')
    .map(normalizeRelativePath)
    .filter((relativePath) => relativePath && isModelPath(relativePath))
    .sort(compareStrings);
}

function parseGlb(buffer, relativePath) {
  if (buffer.length < 20) throw new Error('glb-header-too-short');
  if (buffer.readUInt32LE(0) !== GLB_MAGIC) throw new Error('glb-invalid-magic');
  if (buffer.readUInt32LE(4) !== GLB_VERSION) throw new Error('glb-unsupported-version');
  const declaredLength = buffer.readUInt32LE(8);
  if (declaredLength < 20 || declaredLength !== buffer.length) throw new Error('glb-invalid-length');

  let offset = 12;
  let jsonChunk = null;
  while (offset + 8 <= declaredLength) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    offset += 8;
    if (chunkLength > declaredLength - offset) throw new Error('glb-invalid-chunk-length');
    if (chunkType === GLB_JSON_CHUNK && jsonChunk === null) {
      jsonChunk = buffer.subarray(offset, offset + chunkLength).toString('utf8').replace(/\u0000+$/u, '').trim();
    }
    offset += chunkLength;
  }
  if (offset !== declaredLength) throw new Error('glb-truncated-chunk');
  if (!jsonChunk) throw new Error('glb-json-chunk-missing');
  try {
    return JSON.parse(jsonChunk);
  } catch {
    throw new Error(`gltf-json-invalid:${relativePath}`);
  }
}

function parseGltf(buffer, relativePath) {
  const extension = path.posix.extname(relativePath).toLowerCase();
  if (extension === '.glb') return parseGlb(buffer, relativePath);
  try {
    return JSON.parse(buffer.toString('utf8'));
  } catch {
    throw new Error(`gltf-json-invalid:${relativePath}`);
  }
}

function nodeName(nodes, index) {
  const node = Number.isInteger(index) ? nodes[index] : null;
  return node && typeof node.name === 'string' && node.name.length > 0 ? node.name : null;
}

function buildParents(nodes) {
  const parents = new Map();
  for (const [parentIndex, node] of nodes.entries()) {
    if (!node || !Array.isArray(node.children)) continue;
    for (const childIndex of node.children) {
      if (Number.isInteger(childIndex) && childIndex >= 0 && childIndex < nodes.length && !parents.has(childIndex)) {
        parents.set(childIndex, parentIndex);
      }
    }
  }
  return parents;
}

function explicitAssetMetadata(document) {
  const assetExtras = document?.asset?.extras && typeof document.asset.extras === 'object'
    ? document.asset.extras
    : {};
  const rootExtras = document?.extras && typeof document.extras === 'object' ? document.extras : {};
  const axisExtras = assetExtras.axis && typeof assetExtras.axis === 'object'
    ? assetExtras.axis
    : rootExtras.axis && typeof rootExtras.axis === 'object' ? rootExtras.axis : {};
  const forwardAxis = [assetExtras.forwardAxis, assetExtras.forward_axis, axisExtras.forward, rootExtras.forwardAxis]
    .find((value) => typeof value === 'string' && value.length > 0) ?? null;
  const upAxis = [assetExtras.upAxis, assetExtras.up_axis, axisExtras.up, rootExtras.upAxis]
    .find((value) => typeof value === 'string' && value.length > 0) ?? '+Y';
  const unitScale = [assetExtras.unitScaleMetres, assetExtras.unitScale, assetExtras.metersPerUnit,
    rootExtras.unitScaleMetres, rootExtras.unitScale]
    .find((value) => finitePositive(value)) ?? null;
  return { forwardAxis, upAxis, unitScaleMetres: unitScale };
}

function boundsFromDocument(document) {
  const accessors = Array.isArray(document.accessors) ? document.accessors : [];
  const meshes = Array.isArray(document.meshes) ? document.meshes : [];
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let found = false;
  let invalid = false;
  for (const mesh of meshes) {
    if (!mesh || !Array.isArray(mesh.primitives)) continue;
    for (const primitive of mesh.primitives) {
      const positionIndex = primitive?.attributes?.POSITION;
      const accessor = Number.isInteger(positionIndex) ? accessors[positionIndex] : null;
      if (!accessor || accessor.min === undefined || accessor.max === undefined) continue;
      if (!finiteVector(accessor.min) || !finiteVector(accessor.max)) {
        invalid = true;
        continue;
      }
      const componentType = accessor.componentType;
      const normalizedBound = (value) => {
        if (!accessor.normalized) return value;
        if (![5120, 5121, 5122, 5123, 5124, 5125].includes(componentType)) return null;
        const signed = componentType === 5120 || componentType === 5122 || componentType === 5124;
        const bits = componentType === 5120 || componentType === 5121 ? 8
          : componentType === 5122 || componentType === 5123 ? 16 : 32;
        const positiveMax = signed ? (2 ** (bits - 1)) - 1 : (2 ** bits) - 1;
        if (!Number.isFinite(positiveMax) || positiveMax <= 0) return null;
        return value.map((component) => signed && component < 0 ? component / (2 ** (bits - 1)) : component / positiveMax);
      };
      const boundMin = normalizedBound(accessor.min);
      const boundMax = normalizedBound(accessor.max);
      if (!boundMin || !boundMax || !finiteVector(boundMin) || !finiteVector(boundMax)) {
        invalid = true;
        continue;
      }
      found = true;
      for (let axis = 0; axis < 3; axis += 1) {
        min[axis] = Math.min(min[axis], boundMin[axis]);
        max[axis] = Math.max(max[axis], boundMax[axis]);
      }
    }
  }
  if (!found || invalid || min.some((value) => !Number.isFinite(value)) || max.some((value) => !Number.isFinite(value))) {
    return { bounds: { min: null, max: null, size: null }, missing: invalid ? ['invalid-bounds'] : ['bounds'] };
  }
  return {
    bounds: {
      min,
      max,
      size: max.map((value, index) => value - min[index])
    },
    missing: []
  };
}

function triangleEstimateForPrimitive(primitive, accessors) {
  const mode = primitive?.mode ?? 4;
  const countAccessorIndex = Number.isInteger(primitive?.indices)
    ? primitive.indices
    : primitive?.attributes && Number.isInteger(primitive.attributes.POSITION) ? primitive.attributes.POSITION : null;
  const countAccessor = Number.isInteger(countAccessorIndex) ? accessors[countAccessorIndex] : null;
  if (!countAccessor || !Number.isInteger(countAccessor.count) || countAccessor.count < 0) return null;
  if (mode === 4) return Math.floor(countAccessor.count / 3);
  if (mode === 5 || mode === 6) return Math.max(0, countAccessor.count - 2);
  if (mode === 0 || mode === 1 || mode === 2 || mode === 3) return 0;
  return null;
}

function meshMetrics(document) {
  const accessors = Array.isArray(document.accessors) ? document.accessors : [];
  const meshes = Array.isArray(document.meshes) ? document.meshes : [];
  const triangleEstimates = [];
  let primitiveCount = 0;
  for (const mesh of meshes) {
    if (!mesh || !Array.isArray(mesh.primitives)) continue;
    for (const primitive of mesh.primitives) {
      primitiveCount += 1;
      triangleEstimates.push(triangleEstimateForPrimitive(primitive, accessors));
    }
  }
  const complete = triangleEstimates.every((estimate) => Number.isInteger(estimate));
  const triangles = complete ? triangleEstimates.reduce((sum, estimate) => sum + estimate, 0) : null;
  return {
    triangles,
    accessorTriangleEstimate: triangles,
    triangleEstimates,
    triangleEstimateComplete: complete,
    primitives: primitiveCount,
    meshes: meshes.length,
    accessors: accessors.length
  };
}

function skeletonFacts(document) {
  const nodes = Array.isArray(document.nodes) ? document.nodes : [];
  const skins = Array.isArray(document.skins) ? document.skins : [];
  const parents = buildParents(nodes);
  const details = [];
  const hashPayload = [];
  const allBones = [];
  for (const [skinIndex, skin] of skins.entries()) {
    const joints = Array.isArray(skin?.joints) ? skin.joints.filter((index) => Number.isInteger(index)) : [];
    const bones = joints.map((index) => ({
      index,
      name: nodeName(nodes, index),
      parentIndex: parents.get(index) ?? null,
      parentName: nodeName(nodes, parents.get(index))
    }));
    allBones.push(...bones);
    const rootIndex = Number.isInteger(skin?.skeleton)
      ? skin.skeleton
      : joints.find((index) => !parents.has(index)) ?? null;
    details.push({
      index: skinIndex,
      name: typeof skin?.name === 'string' && skin.name.length > 0 ? skin.name : null,
      rootIndex,
      rootName: nodeName(nodes, rootIndex),
      boneCount: bones.length
    });
    hashPayload.push({
      name: typeof skin?.name === 'string' && skin.name.length > 0 ? skin.name : null,
      rootIndex,
      joints: bones.map(({ index, name, parentIndex }) => ({ index, name, parentIndex }))
    });
  }
  const skeletonHash = details.length > 0 ? sha256(JSON.stringify(hashPayload)) : null;
  return {
    skeletons: details.length,
    skins: details.length,
    bones: allBones,
    skeletonHash,
    skeletonDetails: details
  };
}

function animationFacts(document) {
  const animations = Array.isArray(document.animations) ? document.animations : [];
  const accessors = Array.isArray(document.accessors) ? document.accessors : [];
  const clips = [];
  const channelLayouts = new Map();
  const missing = [];
  for (const [index, animation] of animations.entries()) {
    const samplers = Array.isArray(animation?.samplers) ? animation.samplers : [];
    const channels = Array.isArray(animation?.channels) ? animation.channels : [];
    const samplerDurations = samplers.map((sampler) => {
      const input = Number.isInteger(sampler?.input) ? accessors[sampler.input] : null;
      const end = input?.max?.[0];
      return typeof end === 'number' && Number.isFinite(end) && end >= 0 ? end : null;
    });
    const knownDurations = samplerDurations.filter((duration) => duration !== null);
    const durationSec = knownDurations.length === samplers.length && knownDurations.length > 0
      ? Math.max(...knownDurations)
      : null;
    const name = typeof animation?.name === 'string' && animation.name.length > 0 ? animation.name : null;
    if (!name) missing.push(`clip-name:${index}`);
    if (durationSec === null) missing.push(`clip-duration:${index}`);
    const targetNodes = [...new Map(channels
      .map((channel) => {
        const nodeIndex = Number.isInteger(channel?.target?.node) ? channel.target.node : null;
        return [
          `${nodeIndex ?? 'null'}:${typeof channel?.target?.path === 'string' ? channel.target.path : 'null'}`,
          {
            nodeIndex,
            nodeName: nodeName(Array.isArray(document.nodes) ? document.nodes : [], nodeIndex),
            path: typeof channel?.target?.path === 'string' ? channel.target.path : null
          }
        ];
      }))].map(([, target]) => target)
      .sort((a, b) => (a.nodeIndex ?? -1) - (b.nodeIndex ?? -1) || compareStrings(a.path ?? '', b.path ?? ''));
    const channelLayout = {
      channels: channels.length,
      targetNodes,
      targetPaths: stableSortStrings([...new Set(channels
        .map((channel) => channel?.target?.path)
        .filter((value) => typeof value === 'string'))])
    };
    const channelLayoutId = sha256(JSON.stringify(channelLayout)).slice(0, 16);
    channelLayouts.set(channelLayoutId, { id: channelLayoutId, ...channelLayout });
    clips.push({
      index,
      name,
      durationSec,
      channels: channels.length,
      samplerCount: samplers.length,
      channelLayout: channelLayoutId
    });
  }
  return {
    animations: clips.length,
    clips,
    channelLayouts: [...channelLayouts.values()].sort((a, b) => compareStrings(a.id, b.id)),
    missing
  };
}

function explicitSockets(document) {
  const nodes = Array.isArray(document.nodes) ? document.nodes : [];
  const sockets = [];
  for (const [index, node] of nodes.entries()) {
    const extras = node?.extras;
    if (!extras || typeof extras !== 'object' || Array.isArray(extras)) continue;
    const value = extras.socket ?? extras.socketName;
    if (typeof value === 'string' && value.length > 0) sockets.push({ semantic: value, nodeIndex: index, nodeName: nodeName(nodes, index) });
  }
  return sockets.sort((a, b) => compareStrings(a.semantic, b.semantic) || a.nodeIndex - b.nodeIndex);
}

function externalResourceFacts(document, relativePath, rootDir) {
  const directory = path.dirname(path.join(rootDir, relativePath));
  const uris = [];
  for (const collection of [document.buffers, document.images]) {
    if (!Array.isArray(collection)) continue;
    for (const item of collection) if (typeof item?.uri === 'string' && item.uri.length > 0 && !item.uri.startsWith('data:')) uris.push(item.uri);
  }
  const missing = [];
  const resources = [];
  for (const uri of stableSortStrings([...new Set(uris)])) {
    let decoded;
    try {
      decoded = decodeURIComponent(uri);
    } catch {
      missing.push(`external-uri-invalid:${uri}`);
      continue;
    }
    const resolved = path.resolve(directory, decoded);
    const prefix = rootDir.endsWith(path.sep) ? rootDir : `${rootDir}${path.sep}`;
    if (resolved !== rootDir && !resolved.startsWith(prefix)) {
      missing.push(`external-uri-unsafe:${uri}`);
      continue;
    }
    const exists = fs.existsSync(resolved) && fs.statSync(resolved).isFile();
    resources.push({ uri, path: exists ? normalizeRelativePath(path.relative(rootDir, resolved)) : null, exists });
    if (!exists) missing.push(`external-resource-missing:${uri}`);
  }
  return { resources, missing };
}

function parseNodeTransforms(document) {
  const nodes = Array.isArray(document.nodes) ? document.nodes : [];
  const negativeScaleNodes = [];
  for (const [index, node] of nodes.entries()) {
    if (!Array.isArray(node?.scale) || node.scale.length !== 3) continue;
    if (node.scale.some((value) => typeof value === 'number' && Number.isFinite(value) && value < 0)) {
      negativeScaleNodes.push({ index, name: nodeName(nodes, index), scale: node.scale.slice() });
    }
  }
  return negativeScaleNodes;
}

function readFileRecord(rootDir, relativePath, groupInfo) {
  const absolutePath = path.join(rootDir, relativePath);
  const bytes = fs.readFileSync(absolutePath);
  const format = path.posix.extname(relativePath).toLowerCase() === '.glb' ? 'glb' : 'gltf';
  const record = {
    path: relativePath,
    bytes: bytes.byteLength,
    sha256: sha256(bytes),
    format,
    metrics: {
      bounds: { min: null, max: null, size: null },
      triangles: null,
      accessorTriangleEstimate: null,
      triangleEstimates: [],
      triangleEstimateComplete: false,
      materials: 0,
      textures: 0,
      images: 0,
      primitives: 0,
      meshes: 0,
      nodes: 0,
      accessors: 0,
      skins: 0,
      animations: 0,
      clips: 0,
      textureMemoryBytes: null
    },
    rigFacts: {
      skeletons: 0,
      skins: 0,
      bones: [],
      skeletonHash: null,
      skeletonDetails: [],
      animations: 0,
      clips: [],
      sockets: [],
      axis: { upAxis: '+Y', forwardAxis: null, unitScaleMetres: null, handedness: 'right-handed' },
      missing: ['forward-axis', 'unit-scale', 'sockets'],
      semanticStatus: 'not-applicable',
      negativeScaleNodes: []
    },
    duplicateOf: groupInfo.duplicateOf,
    runtimePath: groupInfo.runtimePath,
    sourcePath: groupInfo.sourcePath,
    variant: groupInfo.variant,
    duplicateGroup: groupInfo.groupKey,
    missing: []
  };

  let document;
  try {
    document = parseGltf(bytes, relativePath);
  } catch (error) {
    record.missing.push('parse-error');
    record.parseError = error instanceof Error ? error.message : String(error);
    return record;
  }
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    record.missing.push('gltf-document');
    return record;
  }

  const arrays = {
    accessors: Array.isArray(document.accessors) ? document.accessors : [],
    animations: Array.isArray(document.animations) ? document.animations : [],
    images: Array.isArray(document.images) ? document.images : [],
    materials: Array.isArray(document.materials) ? document.materials : [],
    meshes: Array.isArray(document.meshes) ? document.meshes : [],
    nodes: Array.isArray(document.nodes) ? document.nodes : [],
    textures: Array.isArray(document.textures) ? document.textures : []
  };
  const bounds = boundsFromDocument(document);
  const mesh = meshMetrics(document);
  const skeleton = skeletonFacts(document);
  const animation = animationFacts(document);
  const metadata = explicitAssetMetadata(document);
  const sockets = explicitSockets(document);
  const external = externalResourceFacts(document, relativePath, rootDir);
  const negativeScaleNodes = parseNodeTransforms(document);
  const hasActorFacts = skeleton.skeletons > 0 || animation.animations > 0;
  const rigMissing = [];
  if (!metadata.forwardAxis) rigMissing.push('forward-axis');
  if (!metadata.unitScaleMetres) rigMissing.push('unit-scale');
  if (sockets.length === 0 && hasActorFacts) rigMissing.push('sockets');
  if (hasActorFacts) rigMissing.push('semantic-clips');

  record.metrics = {
    bounds: bounds.bounds,
    triangles: mesh.triangles,
    accessorTriangleEstimate: mesh.accessorTriangleEstimate,
    triangleEstimates: mesh.triangleEstimates,
    triangleEstimateComplete: mesh.triangleEstimateComplete,
    materials: arrays.materials.length,
    textures: arrays.textures.length,
    images: arrays.images.length,
    primitives: mesh.primitives,
    meshes: mesh.meshes,
    nodes: arrays.nodes.length,
    accessors: mesh.accessors,
    skins: skeleton.skins,
    animations: animation.animations,
    clips: animation.clips.length,
    textureMemoryBytes: null
  };
  record.rigFacts = {
    ...skeleton,
    ...animation,
    sockets,
    axis: {
      upAxis: metadata.upAxis,
      forwardAxis: metadata.forwardAxis,
      unitScaleMetres: metadata.unitScaleMetres,
      handedness: 'right-handed'
    },
    missing: stableSortStrings([...new Set(rigMissing)]),
    semanticStatus: hasActorFacts ? 'missing' : 'not-applicable',
    negativeScaleNodes
  };
  record.externalResources = external.resources;
  record.parseDocument = {
    assetVersion: typeof document.asset?.version === 'string' ? document.asset.version : null,
    generator: typeof document.asset?.generator === 'string' ? document.asset.generator : null,
    scenes: Array.isArray(document.scenes) ? document.scenes.length : 0
  };
  record.missing.push(...bounds.missing, ...mesh.triangleEstimates
    .map((estimate, index) => (estimate === null ? `triangle-estimate:${index}` : null))
    .filter(Boolean), ...animation.missing, ...external.missing);
  if (negativeScaleNodes.length > 0) record.missing.push('negative-scale');
  record.missing = stableSortStrings([...new Set(record.missing)]);
  return record;
}

function variantForPath(relativePath) {
  const parts = splitPath(relativePath);
  return parts[0] === 'games' && DEPLOY_VARIANTS.has(parts[2]) ? parts[2] : 'direct';
}

function canonicalGroupKey(relativePath) {
  const parts = splitPath(relativePath);
  if (parts[0] === 'games' && DEPLOY_VARIANTS.has(parts[2])) {
    return [...parts.slice(0, 2), ...parts.slice(3)].join('/');
  }
  return relativePath;
}

function groupInfoForPaths(paths) {
  const groups = new Map();
  for (const relativePath of paths) {
    const key = canonicalGroupKey(relativePath);
    const variant = variantForPath(relativePath);
    const files = groups.get(key) ?? [];
    files.push({ path: relativePath, variant });
    groups.set(key, files);
  }
  const infos = new Map();
  for (const [groupKey, files] of groups.entries()) {
    const sorted = files.sort((a, b) => compareStrings(a.path, b.path));
    const dist = sorted.find((file) => file.variant === 'dist');
    const direct = sorted.find((file) => file.variant === 'direct');
    const publicFile = sorted.find((file) => file.variant === 'public');
    // `public/` is the catalog's canonical source/runtime identity.  Tracked
    // `dist/` copies are delivery duplicates and must never become a second
    // provenance asset.  Direct assets (Racing/MOBA/Royale) are canonical as
    // written.  Ashen `public/.../original/` inputs intentionally have no
    // runtime identity until an output mapping is present.
    const runtime = (publicFile && (!/\/original(?:\/|$)/u.test(publicFile.path) || dist))
      ? publicFile
      : direct ?? null;
    const source = publicFile ?? null;
    for (const file of sorted) {
      infos.set(file.path, {
        groupKey,
        variant: file.variant,
        runtimePath: runtime?.path ?? null,
        sourcePath: source?.path ?? null,
        duplicateOf: runtime && file.path !== runtime.path ? runtime.path : null,
        groupSize: sorted.length
      });
    }
  }
  return infos;
}

function buildCoverageMetadata(files, catalogReport) {
  const runtime = files.filter((file) => file.runtimePath !== null && file.path === file.runtimePath);
  const sourceOnly = files.filter((file) => file.runtimePath === null);
  const duplicates = files.filter((file) => file.duplicateOf !== null);
  const groups = new Set(files.map((file) => file.duplicateGroup));
  const metadata = {
    trackedFiles: files.length,
    canonicalRuntimeFiles: runtime.length,
    sourceOnlyFiles: sourceOnly.length,
    duplicateFiles: duplicates.length,
    duplicateGroups: groups.size,
    parseFailures: files.filter((file) => file.missing.includes('parse-error')).length,
    filesWithMissingFacts: files.filter((file) => file.missing.length > 0 || file.rigFacts?.missing?.length > 0).length,
    catalog: { status: 'missing', ok: null, blockers: [], issues: [] }
  };
  if (catalogReport) {
    metadata.catalog = {
      status: catalogReport.status,
      ok: catalogReport.ok,
      blockers: catalogReport.blockers,
      issues: catalogReport.issues ?? [],
      counts: catalogReport.counts
    };
  }
  return metadata;
}

function compactDuplicateRecord(record) {
  if (!record.duplicateOf) return record;
  const factsSha256 = sha256(JSON.stringify({
    metrics: record.metrics,
    rigFacts: record.rigFacts,
    externalResources: record.externalResources,
    parseDocument: record.parseDocument
  }));
  const {
    metrics: _metrics,
    rigFacts: _rigFacts,
    externalResources: _externalResources,
    parseDocument: _parseDocument,
    ...identity
  } = record;
  return {
    ...identity,
    factsSha256,
    metricsRef: record.duplicateOf,
    rigFactsRef: record.duplicateOf
  };
}

function loadCoverage(rootDir, census) {
  const catalogPath = path.join(rootDir, ASSET_CATALOG_RELATIVE_PATH);
  if (!fs.existsSync(catalogPath)) {
    return { status: 'missing', ok: null, blockers: ['asset-catalog-missing'], issues: [] };
  }
  try {
    const catalog = loadAssetCatalog({ rootDir, validate: false });
    const errors = assetCatalogErrors(catalog, { rootDir });
    if (errors.length > 0) return {
      status: 'invalid',
      ok: false,
      blockers: errors.map((reason) => ({ path: ASSET_CATALOG_RELATIVE_PATH, reason })),
      issues: []
    };
    // Provenance is audited once per canonical runtime identity.  The full
    // physical census remains in the generated artifact, while dist copies
    // and source-only inputs are represented by `duplicateOf`/`runtimePath`.
    const canonicalCensus = {
      schemaVersion: census.schemaVersion,
      files: census.files.filter((file) => file.runtimePath !== null && file.path === file.runtimePath)
    };
    const report = auditAssetCoverage(canonicalCensus, { rootDir });
    return {
      status: 'audited',
      ok: report.ok,
      blockers: report.blockers,
      issues: report.issues,
      counts: report.counts
    };
  } catch (error) {
    return {
      status: 'error',
      ok: false,
      blockers: [{ path: ASSET_CATALOG_RELATIVE_PATH, reason: error instanceof Error ? error.message : String(error) }],
      issues: []
    };
  }
}

export function buildCensus({ rootDir = REPO_ROOT } = {}) {
  const modelPaths = trackedModelPaths(rootDir);
  const infos = groupInfoForPaths(modelPaths);
  const files = modelPaths
    .map((relativePath) => readFileRecord(rootDir, relativePath, infos.get(relativePath)))
    .map(compactDuplicateRecord);
  const census = {
    schemaVersion: CENSUS_SCHEMA_VERSION,
    files,
    coverage: buildCoverageMetadata(files, null)
  };
  const catalogCoverage = loadCoverage(rootDir, census);
  census.coverage = buildCoverageMetadata(files, catalogCoverage);
  return census;
}

function serialized(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function writeOrCheckCensus({ rootDir = REPO_ROOT, checkOnly = false } = {}) {
  const outputPath = path.join(rootDir, OUTPUT_RELATIVE_PATH);
  const census = buildCensus({ rootDir });
  const expected = serialized(census);
  if (checkOnly) {
    const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : null;
    if (current !== expected) {
      console.error(`${OUTPUT_RELATIVE_PATH} is stale; run node scripts/build-asset-census.mjs`);
      return { census, status: 1 };
    }
    console.log(`Asset census generated artifact: PASS (files=${census.files.length}, runtime=${census.coverage.canonicalRuntimeFiles})`);
    return { census, status: 0 };
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, expected);
  console.log(`Wrote ${OUTPUT_RELATIVE_PATH} (files=${census.files.length}, runtime=${census.coverage.canonicalRuntimeFiles})`);
  if (census.coverage.parseFailures > 0) return { census, status: 1 };
  if (census.coverage.catalog.status === 'invalid' || census.coverage.catalog.status === 'error') return { census, status: 1 };
  return { census, status: 0 };
}

function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has('--help')) {
    console.log('Usage: node scripts/build-asset-census.mjs [--check]');
    return;
  }
  const result = writeOrCheckCensus({ checkOnly: args.has('--check') });
  if (result.status !== 0) process.exitCode = result.status;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) main();
