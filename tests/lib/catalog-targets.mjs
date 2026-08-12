import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalogTargets as buildCatalogTargets, loadGameCatalog } from '../../games/catalog.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

const catalogEntries = (rootDir) => {
  const catalog = loadGameCatalog({ rootDir });
  const loaded = buildCatalogTargets(catalog, { includeHub: false });
  if (Array.isArray(loaded)) {
    return loaded.map((entry) => Array.isArray(entry)
      ? { testName: entry[0], entry: entry[1] }
      : entry);
  }
  throw new TypeError('Game catalog targets must return an array');
};

const targetUrl = (entry) => {
  const launchPath = entry?.entry ?? entry?.launchPath;
  if (typeof launchPath !== 'string' || launchPath.length === 0) {
    throw new TypeError(`Game catalog entry ${entry?.id ?? '<unknown>'} has no entry path`);
  }
  const withoutQuery = launchPath.split(/[?#]/, 1)[0];
  const decoded = decodeURIComponent(withoutQuery);
  return `/${decoded.replace(/^\/+/, '')}`;
};

/**
 * Return the common [testName, URL] roster used by hub browser contracts.
 * The Hub launcher is deliberately opt-in because hub-home exercises games only.
 */
export function catalogTargets({ includeHub = false, rootDir = ROOT } = {}) {
  const targets = catalogEntries(rootDir).map((entry) => [entry.testName, targetUrl(entry)]);
  return includeHub ? [['Hub launcher', '/index.html'], ...targets] : targets;
}

/**
 * Return descriptor-backed targets for tests that need to attach game-specific hooks.
 */
export function catalogTargetEntries({ includeHub = false, rootDir = ROOT } = {}) {
  const targets = catalogEntries(rootDir).map((entry) => ({
    ...entry,
    名: entry.testName,
    url: targetUrl(entry),
  }));
  return includeHub
    ? [{ id: 'hub', testName: 'Hub launcher', 名: 'Hub launcher', url: '/index.html' }, ...targets]
    : targets;
}
