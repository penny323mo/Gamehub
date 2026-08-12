import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const CATALOG_SCHEMA_VERSION = 1;
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MANIFEST_RELATIVE_PATH = 'games/manifest.json';
export const GENERATED_RELATIVE_PATH = 'games/catalog.generated.js';

const BUILD_POLICIES = new Set(['none', 'tracked-dist', 'generated-dist']);
const SHELL_META = /[;&|<>`$\n\r]/;
const URL_SCHEME = /^[a-z][a-z\d+.-]*:/i;

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function canonicalJson(value) {
  return JSON.stringify(value);
}

function optionsFrom(value) {
  if (typeof value === 'string' || value instanceof URL) return { rootDir: value };
  return value && typeof value === 'object' ? value : {};
}

function rootFrom(options) {
  const rootDir = options.rootDir ?? REPO_ROOT;
  return path.resolve(rootDir instanceof URL ? fileURLToPath(rootDir) : rootDir);
}

function manifestPathFrom(options, rootDir) {
  return path.resolve(options.manifestPath ?? path.join(rootDir, MANIFEST_RELATIVE_PATH));
}

function pathPart(value) {
  return String(value).split(/[?#]/, 1)[0];
}

function decodePath(value) {
  try {
    return decodeURIComponent(pathPart(value));
  } catch {
    return null;
  }
}

function isSafeRelativePath(value, { allowEmpty = false } = {}) {
  if (typeof value !== 'string' || (!allowEmpty && value.length === 0)) return false;
  if (value.startsWith('/') || value.includes('\\') || URL_SCHEME.test(value) || value.startsWith('//')) return false;
  const decoded = decodePath(value);
  if (!decoded || decoded.startsWith('/') || decoded.split('/').includes('..')) return false;
  return true;
}

function resolveRepoPath(rootDir, relativePath) {
  const decoded = decodePath(relativePath);
  if (!decoded || !isSafeRelativePath(relativePath)) return null;
  const resolved = path.resolve(rootDir, decoded);
  const prefix = rootDir.endsWith(path.sep) ? rootDir : `${rootDir}${path.sep}`;
  return resolved === rootDir || resolved.startsWith(prefix) ? resolved : null;
}

function commandShape(command, label, rootDir, errors) {
  if (!command || typeof command !== 'object' || Array.isArray(command)) {
    errors.push(`${label} must be an object with cwd and argv`);
    return;
  }
  if (!isSafeRelativePath(command.cwd, { allowEmpty: true })) errors.push(`${label}.cwd must be a safe relative directory`);
  const cwd = command.cwd === '' ? rootDir : resolveRepoPath(rootDir, command.cwd);
  if (cwd && !fs.existsSync(cwd)) errors.push(`${label}.cwd does not exist: ${command.cwd}`);
  if (cwd && fs.existsSync(cwd) && !fs.statSync(cwd).isDirectory()) errors.push(`${label}.cwd is not a directory: ${command.cwd}`);
  if (!Array.isArray(command.argv) || command.argv.length === 0 || command.argv.some((arg) => typeof arg !== 'string' || arg.length === 0)) {
    errors.push(`${label}.argv must be a non-empty string array`);
    return;
  }
  if (command.argv.some((arg) => SHELL_META.test(arg))) errors.push(`${label}.argv contains shell metacharacters`);
  if (command.timeoutMs !== undefined
      && (!Number.isInteger(command.timeoutMs) || command.timeoutMs < 1_000 || command.timeoutMs > 1_800_000)) {
    errors.push(`${label}.timeoutMs must be between 1000 and 1800000`);
  }
}

function readGeneratedData(rootDir) {
  const artifactPath = path.join(rootDir, GENERATED_RELATIVE_PATH);
  if (!fs.existsSync(artifactPath)) return { missing: true };
  const source = fs.readFileSync(artifactPath, 'utf8');
  const match = source.match(/const GAME_CATALOG_JSON = ("(?:\\.|[^"\\])*");/);
  if (!match) return { invalid: 'generated artifact has no GAME_CATALOG_JSON marker' };
  try {
    return { data: JSON.parse(JSON.parse(match[1])) };
  } catch (error) {
    return { invalid: `generated artifact JSON is invalid: ${error.message}` };
  }
}

export class CatalogValidationError extends Error {
  constructor(errors) {
    super(`GameCatalog validation failed:\n- ${errors.join('\n- ')}`);
    this.name = 'CatalogValidationError';
    this.errors = errors;
  }
}

/** Return validation errors without throwing; useful for tooling and diagnostics. */
export function catalogErrors(input, options = {}) {
  const rootDir = rootFrom(optionsFrom(options));
  const catalog = input && typeof input === 'object' ? input : {};
  const errors = [];
  if (catalog.schemaVersion !== CATALOG_SCHEMA_VERSION) errors.push(`schemaVersion must be ${CATALOG_SCHEMA_VERSION}`);
  if (!Array.isArray(catalog.games)) {
    errors.push('games must be an array');
    return errors;
  }
  if (catalog.games.length === 0) errors.push('games must contain at least one descriptor');

  const ids = new Set();
  const entries = new Set();
  for (const [index, game] of catalog.games.entries()) {
    const label = `games[${index}]`;
    if (!game || typeof game !== 'object' || Array.isArray(game)) {
      errors.push(`${label} must be an object`);
      continue;
    }
    for (const field of ['id', 'title', 'testName', 'subtitle', 'category', 'entry', 'launchPath', 'icon']) {
      if (typeof game[field] !== 'string' || game[field].length === 0) errors.push(`${label}.${field} must be a non-empty string`);
    }
    if (typeof game.id === 'string') {
      if (ids.has(game.id)) errors.push(`duplicate game id: ${game.id}`);
      ids.add(game.id);
    }
    if (typeof game.entry === 'string') {
      if (!isSafeRelativePath(game.entry)) errors.push(`${label}.entry must be a Pages-safe relative path`);
      const canonicalEntry = decodePath(game.entry);
      if (canonicalEntry && entries.has(canonicalEntry)) errors.push(`duplicate game entry: ${canonicalEntry}`);
      if (canonicalEntry) entries.add(canonicalEntry);
      const entryPath = resolveRepoPath(rootDir, game.entry);
      if (!entryPath || !fs.existsSync(entryPath) || !fs.statSync(entryPath).isFile()) errors.push(`${label}.entry does not exist: ${game.entry}`);
    }
    if (typeof game.launchPath === 'string' && !isSafeRelativePath(game.launchPath)) errors.push(`${label}.launchPath must be a Pages-safe relative path`);
    if (game.entry !== game.launchPath) {
      if (pathPart(game.entry) !== pathPart(game.launchPath)) errors.push(`${label}.entry and launchPath must address the same file`);
    }
    if (typeof game.playable !== 'boolean') errors.push(`${label}.playable must be boolean`);
    for (const assetField of ['icon', 'iconWebp']) {
      const asset = game[assetField];
      if (asset === undefined || !game.isImage) continue;
      if (!isSafeRelativePath(asset)) errors.push(`${label}.${assetField} must be a Pages-safe local path`);
      const assetPath = resolveRepoPath(rootDir, asset);
      if (!assetPath || !fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
        errors.push(`${label}.${assetField} does not exist: ${asset}`);
      }
    }
    if (!game.runtime || typeof game.runtime !== 'object') errors.push(`${label}.runtime must be an object`);
    if (!game.persistence || typeof game.persistence !== 'object') errors.push(`${label}.persistence must be an object`);
    if (!game.capabilities || typeof game.capabilities !== 'object') errors.push(`${label}.capabilities must be an object`);
    if (!game.smoke || typeof game.smoke !== 'object' || typeof game.smoke.route !== 'string') {
      errors.push(`${label}.smoke.route is required`);
    } else {
      if (!isSafeRelativePath(game.smoke.route)) errors.push(`${label}.smoke.route must be a Pages-safe relative path`);
      const smokePath = resolveRepoPath(rootDir, game.smoke.route);
      if (!smokePath || !fs.existsSync(smokePath) || !fs.statSync(smokePath).isFile()) {
        errors.push(`${label}.smoke.route does not exist: ${game.smoke.route}`);
      }
    }

    const release = game.release;
    if (!release || typeof release !== 'object') {
      errors.push(`${label}.release must be an object`);
      continue;
    }
    if (!Array.isArray(release.roots) || release.roots.length === 0) errors.push(`${label}.release.roots must be a non-empty array`);
    else release.roots.forEach((root, rootIndex) => {
      if (!isSafeRelativePath(root, { allowEmpty: true })) errors.push(`${label}.release.roots[${rootIndex}] must be a safe relative path`);
      const rootPath = root === '' ? rootDir : resolveRepoPath(rootDir, root);
      if (!rootPath || !fs.existsSync(rootPath)) errors.push(`${label}.release.roots[${rootIndex}] does not exist: ${root}`);
    });
    if (!BUILD_POLICIES.has(release.buildPolicy)) errors.push(`${label}.release.buildPolicy is invalid`);
    if (release.build !== null && release.build !== undefined) commandShape(release.build, `${label}.release.build`, rootDir, errors);
    if (!Array.isArray(release.fast) || release.fast.length === 0) errors.push(`${label}.release.fast must be a non-empty command array`);
    else release.fast.forEach((command, commandIndex) => commandShape(command, `${label}.release.fast[${commandIndex}]`, rootDir, errors));
    if (!Array.isArray(release.full) || release.full.length === 0) errors.push(`${label}.release.full must be a non-empty command array`);
    else release.full.forEach((command, commandIndex) => commandShape(command, `${label}.release.full[${commandIndex}]`, rootDir, errors));
  }
  if (optionsFrom(options).checkGenerated !== false) {
    const generated = readGeneratedData(rootDir);
    if (generated.missing) errors.push(`missing generated artifact: ${GENERATED_RELATIVE_PATH}`);
    else if (generated.invalid) errors.push(generated.invalid);
    else if (canonicalJson(generated.data) !== canonicalJson({ schemaVersion: catalog.schemaVersion, games: catalog.games })) errors.push('generated artifact is out of parity with games/manifest.json');
  }
  return errors;
}

/** Validate a manifest and return it unchanged when it is valid. */
export function validateCatalog(catalog, options = {}) {
  const errors = catalogErrors(catalog, options);
  if (errors.length > 0) throw new CatalogValidationError(errors);
  return catalog;
}

export function loadGameCatalog(value = {}) {
  const options = optionsFrom(value);
  const rootDir = rootFrom(options);
  const manifestPath = manifestPathFrom(options, rootDir);
  let catalog;
  try {
    catalog = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read GameCatalog manifest ${manifestPath}: ${error.message}`);
  }
  if (options.validate !== false) validateCatalog(catalog, { ...options, rootDir, checkGenerated: options.checkGenerated });
  return catalog;
}

function ensureCatalog(catalog) {
  return catalog && Array.isArray(catalog.games) ? catalog : loadGameCatalog();
}

export function catalogList(catalog = loadGameCatalog()) {
  return clone(ensureCatalog(catalog).games);
}

export const listGames = catalogList;

export function getGame(catalog, id) {
  if (typeof catalog === 'string') {
    id = catalog;
    catalog = undefined;
  }
  return ensureCatalog(catalog).games.find((game) => game.id === id);
}

export function launcherEntries(catalog = loadGameCatalog()) {
  return catalogList(catalog).map((game) => ({
    id: game.id,
    title: game.title,
    subtitle: game.subtitle,
    icon: game.icon,
    iconWebp: game.iconWebp,
    isImage: game.isImage,
    category: game.category,
    playable: game.playable,
    link: game.launchPath
  }));
}

function targetFor(game) {
  const roots = clone(game.release.roots);
  const root = roots.find((item) => item.startsWith('games/')) ?? roots[0] ?? game.runtime?.sourceRoot ?? null;
  return {
    id: game.id,
    testName: game.testName,
    title: game.title,
    entry: game.entry,
    launchPath: game.launchPath,
    route: game.smoke?.route ?? game.launchPath,
    viewport: clone(game.smoke?.viewport),
    playable: game.playable,
    root,
    roots,
    release: clone(game.release)
  };
}

/** Return all public game targets; includeHub adds the synthetic root launcher target. */
export function catalogTargets(catalog = loadGameCatalog(), options = {}) {
  if (typeof catalog === 'boolean') {
    options = { includeHub: catalog };
    catalog = undefined;
  } else if (catalog && !Array.isArray(catalog.games)
      && (Object.hasOwn(catalog, 'includeHub') || Object.hasOwn(catalog, 'rootDir'))) {
    options = catalog;
    catalog = loadGameCatalog(options);
  }
  const targets = catalogList(catalog).map(targetFor);
  if (options?.includeHub) {
    targets.unshift({
      id: 'hub',
      testName: 'Game Hub',
      title: 'Game Hub',
      entry: 'index.html',
      launchPath: 'index.html',
      route: '/',
      viewport: { width: 1280, height: 720 },
      playable: true,
      root: '.',
      roots: ['index.html', 'launcher.js'],
      release: { roots: ['index.html', 'launcher.js'], buildPolicy: 'none', build: null, fast: [], full: [] }
    });
  }
  return targets;
}

export const allHubTargets = catalogTargets;

function normalizeChangedFile(file) {
  if (typeof file === 'string') return file.replace(/^\.\//, '').replaceAll('\\', '/');
  if (file && typeof file === 'object') return normalizeChangedFile(file.path ?? file.file ?? file.name ?? '');
  return '';
}

function pathMatchesRoot(file, root) {
  const cleanRoot = root.replace(/^\.\//, '').replace(/\/$/, '');
  return file === cleanRoot || file.startsWith(`${cleanRoot}/`);
}

/** Select games affected by changed files. Shared hub/runtime files select every game. */
export function selectChangedGames(catalog, changedFiles, options = {}) {
  if (Array.isArray(catalog) || typeof catalog === 'string') {
    options = changedFiles && !Array.isArray(changedFiles) && typeof changedFiles === 'object' ? changedFiles : options;
    changedFiles = catalog;
    catalog = undefined;
  }
  const selectedCatalog = ensureCatalog(catalog);
  const files = (Array.isArray(changedFiles) ? changedFiles : [changedFiles]).map(normalizeChangedFile).filter(Boolean);
  if (files.length === 0) return [];
  const globalFiles = new Set([
    'index.html', 'launcher.js', 'style.css', MANIFEST_RELATIVE_PATH,
    'package.json', 'package-lock.json', 'vite.config.js',
    'games/catalog.mjs', GENERATED_RELATIVE_PATH,
    'scripts/build-game-catalog.mjs', 'scripts/install-release-deps.mjs',
    'scripts/release-gate.mjs'
  ]);
  const globalPrefixes = ['games/shared/', 'assets/', 'supabase/', 'tests/', '.github/', 'scripts/'];
  const documentedOnly = (file) => file === 'README.md' || file === 'AGENTS.md'
    || file === '.gitignore' || file.startsWith('docs/');
  const knownGamePath = (file) => selectedCatalog.games.some((game) =>
    game.release.roots.some((root) => pathMatchesRoot(file, root)));
  const relevantUnknown = files.some((file) => globalFiles.has(file)
    || globalPrefixes.some((prefix) => file.startsWith(prefix))
    || (!documentedOnly(file) && !knownGamePath(file)));
  if (relevantUnknown && options.includeUnknown !== false) return catalogList(selectedCatalog);
  const selected = selectedCatalog.games.filter((game) => game.release.roots.some((root) => files.some((file) => pathMatchesRoot(file, root))));
  if (selected.length === 0 && options.includeUnknown) return catalogList(selectedCatalog);
  return clone(selected);
}

export const gamesForChangedFiles = selectChangedGames;

export function createCatalogApi(catalog = loadGameCatalog()) {
  const selected = ensureCatalog(catalog);
  return Object.freeze({
    schemaVersion: selected.schemaVersion,
    list: () => catalogList(selected),
    get: (id) => getGame(selected, id),
    launcherEntries: () => launcherEntries(selected),
    targets: (options) => catalogTargets(selected, options),
    selectChangedGames: (changedFiles, options) => selectChangedGames(selected, changedFiles, options)
  });
}

export const loadCatalog = loadGameCatalog;
export const validateManifest = validateCatalog;
export const publicEntries = launcherEntries;

export default loadGameCatalog;
