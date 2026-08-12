#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gateArgs = [path.join(ROOT, 'scripts/release-gate.mjs'), '--format', 'json', '--tier', 'full'];
const skipped = new Set();
for (let index = 2; index < process.argv.length; index += 1) {
  if (process.argv[index] === '--skip') {
    const cwd = process.argv[++index];
    if (!cwd || cwd.startsWith('/') || cwd.split('/').includes('..')) {
      throw new Error('--skip requires a safe repository-relative directory');
    }
    skipped.add(cwd.replaceAll('\\', '/').replace(/\/$/, ''));
  } else {
    gateArgs.push(process.argv[index]);
  }
}

const planned = spawnSync(process.execPath, gateArgs, { cwd: ROOT, encoding: 'utf8' });
if (planned.status !== 0) {
  process.stderr.write(planned.stderr || planned.stdout);
  process.exit(planned.status ?? 1);
}

const report = JSON.parse(planned.stdout);
const packageDirs = [...new Set(report.commands
  .map(({ cwd }) => cwd)
  .filter((cwd) => !skipped.has(cwd)
    && fs.existsSync(path.join(ROOT, cwd, 'package-lock.json'))))];

for (const cwd of packageDirs) {
  console.log(`[release:deps] (${cwd}) npm ci`);
  const installed = spawnSync('npm', ['ci'], {
    cwd: path.join(ROOT, cwd),
    stdio: 'inherit',
    timeout: 600_000,
  });
  if (installed.error?.code === 'ETIMEDOUT') {
    console.error(`${cwd}: npm ci timed out`);
    process.exit(1);
  }
  if (installed.status !== 0) process.exit(installed.status ?? 1);
}

console.log(`RELEASE_DEPS=PASS package_dirs=${packageDirs.length}`);
