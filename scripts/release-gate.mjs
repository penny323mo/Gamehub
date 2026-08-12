#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const parseArgs = (argv) => {
  const options = { format: 'human', tier: 'fast', run: false, all: false, changedFiles: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--base') options.base = argv[++index];
    else if (value === '--head') options.head = argv[++index];
    else if (value === '--file') options.changedFiles.push(argv[++index]);
    else if (value === '--files-from') options.filesFrom = argv[++index];
    else if (value === '--all') options.all = true;
    else if (value === '--format') options.format = argv[++index];
    else if (value === '--tier') options.tier = argv[++index];
    else if (value === '--github-output') options.githubOutput = argv[++index];
    else if (value === '--run') options.run = true;
    else if (value === '--help' || value === '-h') options.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!['human', 'json'].includes(options.format)) {
    throw new Error(`--format must be human or json, received ${options.format}`);
  }
  if (!['fast', 'full'].includes(options.tier)) {
    throw new Error(`--tier must be fast or full, received ${options.tier}`);
  }
  return options;
};

const usage = () => `Usage: node scripts/release-gate.mjs [options]

Select manifest-defined release gates from changed files.

  --base <git-ref>          diff base (default: HEAD^ when no files are given)
  --head <git-ref>          diff head (default: HEAD)
  --file <path>             add an explicit changed path (repeatable)
  --files-from <path|->     read newline-delimited changed paths
  --all                     select every game explicitly
  --format human|json       output format (default: human)
  --tier fast|full          command tier (default: fast; CI deploy uses full)
  --github-output <path>    append affected_games and run_all outputs
  --run                     execute selected structured build + tier commands
`;

const normalizeChangedPath = (value) => {
  if (typeof value !== 'string') throw new Error('Changed path must be a string');
  const normalized = value.replaceAll('\\', '/').replace(/^\.\//, '').trim();
  if (!normalized || normalized.startsWith('/') || normalized.split('/').includes('..')) {
    throw new Error(`Unsafe changed path: ${value}`);
  }
  return normalized;
};

const resolveRepoFile = (value, label) => {
  if (typeof value !== 'string' || !value || value.startsWith('/')
      || value.replaceAll('\\', '/').split('/').includes('..')) {
    throw new Error(`${label} must be a safe repository-relative path`);
  }
  const resolved = path.resolve(ROOT, value);
  if (!resolved.startsWith(`${ROOT}${path.sep}`)) {
    throw new Error(`${label} escaped the repository`);
  }
  return resolved;
};

const readChangedFiles = (options) => {
  const explicit = [...options.changedFiles];
  if (options.filesFrom) {
    const source = options.filesFrom === '-'
      ? fs.readFileSync(0, 'utf8')
      : fs.readFileSync(resolveRepoFile(options.filesFrom, '--files-from'), 'utf8');
    explicit.push(...source.split(/\r?\n/));
  }
  const normalizedExplicit = explicit.filter((entry) => entry?.trim()).map(normalizeChangedPath);
  if (normalizedExplicit.length) return [...new Set(normalizedExplicit)].sort();

  const base = options.base ?? 'HEAD^';
  const head = options.head ?? 'HEAD';
  const result = spawnSync('git', ['diff', '--name-only', '--no-renames', base, head, '--'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`git diff failed for ${base}..${head}: ${(result.stderr || result.stdout).trim()}`);
  }
  return [...new Set(result.stdout.split(/\r?\n/).filter(Boolean).map(normalizeChangedPath))].sort();
};

const importCatalog = async () => {
  const modulePath = path.join(ROOT, 'games', 'catalog.mjs');
  if (!fs.existsSync(modulePath)) {
    throw new Error('games/catalog.mjs is missing; build the canonical GameCatalog first');
  }
  return import(`${pathToFileURL(modulePath).href}?release-gate=${Date.now()}`);
};

const isPrefix = (file, root) => file === root || file.startsWith(`${root}/`);

const fallbackSelect = (catalog, changedFiles) => {
  const globalRoots = [
    'games/manifest.json',
    'games/catalog.mjs',
    'games/catalog.generated.js',
    'launcher.js',
    'index.html',
    'style.css',
    'assets',
    'supabase',
    'games/shared',
    'tests',
    '.github',
    'package.json',
    'package-lock.json',
    'vite.config.js',
    'scripts/build-game-catalog.mjs',
    'scripts/install-release-deps.mjs',
    'scripts/release-gate.mjs',
  ];
  const knownGameRoots = catalog.games.flatMap((game) => game.release?.roots ?? []);
  const recognizedNonRuntimeRoots = ['docs', 'README.md', 'AGENTS.md', '.gitignore'];
  const unknownGamePath = changedFiles.some((file) => file.startsWith('games/')
    && !knownGameRoots.some((root) => isPrefix(file, root))
    && !globalRoots.some((root) => isPrefix(file, root)));
  const unknownRootPath = changedFiles.some((file) => !file.includes('/')
    && !globalRoots.some((root) => isPrefix(file, root))
    && !recognizedNonRuntimeRoots.some((root) => isPrefix(file, root)));
  const unknownScriptPath = changedFiles.some((file) => file.startsWith('scripts/')
    && !globalRoots.some((root) => isPrefix(file, root)));
  const unclassifiedPath = changedFiles.some((file) =>
    !recognizedNonRuntimeRoots.some((root) => isPrefix(file, root))
    && !globalRoots.some((root) => isPrefix(file, root))
    && !knownGameRoots.some((root) => isPrefix(file, root)));
  const runAll = unknownGamePath || unknownRootPath || unknownScriptPath || unclassifiedPath
    || changedFiles.some((file) => globalRoots.some((root) => isPrefix(file, root)));
  if (runAll) return { runAll: true, games: catalog.games, reasons: ['shared-or-hub-change'] };

  const games = catalog.games.filter((game) => changedFiles.some((file) =>
    (game.release?.roots ?? []).some((root) => isPrefix(file, root))));
  return { runAll: false, games, reasons: games.length ? ['game-root-change'] : ['no-runtime-change'] };
};

const selectRelease = (catalogModule, catalog, changedFiles) => {
  // The gate owns the fail-closed boundary.  Even if the catalog provides a
  // narrower selector, shared Hub files and unknown games/ paths must run all
  // games so a manifest omission can never silently bypass CI.
  const safetySelection = fallbackSelect(catalog, changedFiles);
  if (safetySelection.runAll) return safetySelection;

  if (typeof catalogModule.selectChangedGames === 'function') {
    const selected = catalogModule.selectChangedGames(catalog, changedFiles);
    const selectedGames = Array.isArray(selected)
      ? selected
      : (selected.games ?? selected.affectedGames ?? []);
    const games = selectedGames
      .map((game) => typeof game === 'string' ? catalog.games.find(({ id }) => id === game) : game)
      .filter(Boolean);
    return {
      runAll: Boolean(!Array.isArray(selected) && selected.runAll),
      games,
      reasons: Array.isArray(selected) ? safetySelection.reasons : (selected.reasons ?? safetySelection.reasons),
    };
  }
  return safetySelection;
};

const assertStructuredCommand = (command, gameId) => {
  if (!command || typeof command !== 'object' || Array.isArray(command)) {
    throw new Error(`${gameId} release fast command must be a structured object`);
  }
  if (typeof command.cwd !== 'string' || !command.cwd || command.cwd.startsWith('/')
      || command.cwd.split('/').includes('..')) {
    throw new Error(`${gameId} release command has unsafe cwd`);
  }
  if (!Array.isArray(command.argv) || !command.argv.length
      || command.argv.some((part) => typeof part !== 'string' || !part)) {
    throw new Error(`${gameId} release command must have non-empty string argv`);
  }
  if (!['node', 'npm', 'npx'].includes(command.argv[0])) {
    throw new Error(`${gameId} release command executable is not allowlisted: ${command.argv[0]}`);
  }
  if (command.timeoutMs !== undefined
      && (!Number.isInteger(command.timeoutMs) || command.timeoutMs < 1_000 || command.timeoutMs > 1_800_000)) {
    throw new Error(`${gameId} release command timeoutMs must be between 1000 and 1800000`);
  }
};

const commandsFor = (games, tier) => games.flatMap((game) => {
  const tierCommands = game.release?.[tier];
  if (!Array.isArray(tierCommands) || tierCommands.length === 0) {
    throw new Error(`${game.id} has no release.${tier} commands`);
  }
  // Each tier is a complete, ordered execution plan. `release.build` is
  // descriptive metadata for catalog consumers; implicitly prepending it here
  // would double-build packages whose full test already includes the build.
  const commands = tierCommands;
  const seen = new Set();
  return commands.flatMap((command) => {
    assertStructuredCommand(command, game.id);
    const key = JSON.stringify([command.cwd, command.argv]);
    if (seen.has(key)) return [];
    seen.add(key);
    return [{ gameId: game.id, timeoutMs: 600_000, ...command }];
  });
});

const runCommands = (commands) => {
  for (const command of commands) {
    const cwd = path.resolve(ROOT, command.cwd);
    if (!cwd.startsWith(`${ROOT}${path.sep}`) && cwd !== ROOT) {
      throw new Error(`Command escaped repository: ${command.cwd}`);
    }
    console.log(`\n[release:${command.gameId}] (${command.cwd}) ${command.argv.join(' ')}`);
    const result = spawnSync(command.argv[0], command.argv.slice(1), {
      cwd,
      stdio: 'inherit',
      env: process.env,
      timeout: command.timeoutMs,
    });
    if (result.error?.code === 'ETIMEDOUT') {
      throw new Error(`${command.gameId} required gate timed out after ${command.timeoutMs}ms`);
    }
    if (result.status !== 0) throw new Error(`${command.gameId} required gate failed (${result.status})`);
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  const changedFiles = options.all ? ['games/manifest.json'] : readChangedFiles(options);
  const catalogModule = await importCatalog();
  const load = catalogModule.loadGameCatalog ?? catalogModule.loadCatalog;
  if (typeof load !== 'function') throw new Error('GameCatalog must export loadGameCatalog()');
  const catalog = load({ rootDir: ROOT });
  if (!catalog || !Array.isArray(catalog.games)) throw new Error('GameCatalog returned no games array');

  const selection = selectRelease(catalogModule, catalog, changedFiles);
  const commands = commandsFor(selection.games, options.tier);
  const report = {
    changedFiles,
    tier: options.tier,
    runAll: selection.runAll,
    reasons: selection.reasons,
    affectedGames: selection.games.map(({ id }) => id),
    commands,
  };

  if (options.format === 'json') console.log(JSON.stringify(report));
  else {
    console.log(`Changed files: ${changedFiles.length}`);
    console.log(`Scope: ${selection.runAll ? 'all games' : (selection.games.length ? 'changed games' : 'docs/non-runtime only')}`);
    console.log(`Affected games: ${report.affectedGames.join(', ') || '(none)'}`);
    console.log(`Required ${options.tier} commands: ${commands.length}`);
  }

  if (options.githubOutput) {
    const outputPath = resolveRepoFile(options.githubOutput, '--github-output');
    fs.appendFileSync(outputPath,
      `affected_games=${JSON.stringify(report.affectedGames)}\nrun_all=${selection.runAll}\n`, 'utf8');
  }
  if (options.run) runCommands(commands);
};

main().catch((error) => {
  console.error(`RELEASE_GATE=FAIL ${error.message}`);
  process.exitCode = 1;
});
