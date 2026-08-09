// Projectile renderer regression gates: visual axis, resource reuse and cleanup.
// Run: node games/tower/tests/projectile-renderer.mjs
// Source verification: TOWER_URL=http://127.0.0.1:5183/ node games/tower/tests/projectile-renderer.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.glb': 'model/gltf-binary', '.png': 'image/png', '.svg': 'image/svg+xml', '.m4a': 'audio/mp4',
};

let server = null;
let url = process.env.TOWER_URL;
if (!url) {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, pathname);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('404'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  const port = await new Promise((resolve) => server.listen(0, () => resolve(server.address().port)));
  url = `http://127.0.0.1:${port}/games/tower/dist/index.html`;
}

let pass = 0;
let fail = 0;
const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass += 1; console.log(`PASS  ${name}`, JSON.stringify(detail)); }
  else { fail += 1; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

try {
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message.split('\n')[0].slice(0, 180)));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.__TD), null, { timeout: 30_000 });
  await page.click('#start-btn');
  await page.waitForFunction(() => {
    let ground = 0;
    window.__TD.scene.traverse((object) => { if (object.name?.startsWith('ground:')) ground += 1; });
    return ground >= 148;
  }, null, { timeout: 30_000 });

  const result = await page.evaluate(async () => {
    const T = window.__TD;
    T.擂台();
    T.state.speedMultiplier = 0;
    const waitFrames = async (count = 2) => {
      for (let i = 0; i < count; i += 1) await new Promise((resolve) => requestAnimationFrame(resolve));
    };
    const projectile = (id) => ({
      id, fromTowerId: 0, targetEnemyId: 0, towerType: 'arrow', damageType: 'physical',
      damage: 1, aoeRadius: 0, slow: null, dot: null, chain: null,
      x: 0, y: 0.8, z: 0, startX: 0, startY: 0.8, startZ: 0,
      targetX: 1, targetY: 0.8, targetZ: 0, speed: 1, progress: 0, arcHeight: 0, alive: true,
    });
    const directBefore = new Set(T.scene.children.map((object) => object.uuid));
    T.state.projectiles = [projectile(90_001), projectile(90_002)];
    await waitFrames();
    const roots = T.scene.children.filter((object) => !directBefore.has(object.uuid));
    const resources = roots.map((root) => {
      const meshes = [];
      root.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry.computeBoundingBox();
        const size = new object.position.constructor();
        object.geometry.boundingBox.getSize(size);
        meshes.push({
          type: object.geometry.type,
          geometry: object.geometry.uuid,
          material: (Array.isArray(object.material) ? object.material : [object.material]).map((m) => m.uuid),
          size: [size.x, size.y, size.z],
        });
      });
      return meshes;
    });
    const shaft = resources[0]?.find((mesh) => mesh.type === 'CylinderGeometry') ?? null;
    const sameResources = resources.length === 2
      && JSON.stringify(resources[0].map((mesh) => [mesh.geometry, mesh.material]))
        === JSON.stringify(resources[1].map((mesh) => [mesh.geometry, mesh.material]));
    T.state.projectiles = [];
    await waitFrames();
    const directAfterPair = T.scene.children.filter((object) => !directBefore.has(object.uuid)).length;

    const geometryStart = T.renderer.info.memory.geometries;
    const memorySeries = [];
    let nextId = 100_000;
    for (let cycle = 0; cycle < 5; cycle += 1) {
      T.state.projectiles = Array.from({ length: 16 }, () => projectile(nextId++));
      await waitFrames();
      T.state.projectiles = [];
      await waitFrames();
      memorySeries.push(T.renderer.info.memory.geometries);
    }
    return {
      roots: roots.length,
      shaftSize: shaft?.size.map((value) => +value.toFixed(3)) ?? null,
      sameResources,
      directAfterPair,
      geometryStart,
      geometryEnd: T.renderer.info.memory.geometries,
      geometryGrowth: T.renderer.info.memory.geometries - geometryStart,
      memorySeries,
    };
  });

  check('arrow shaft 長軸沿 local Z，唔係直立喺 local Y',
    result.shaftSize && result.shaftSize[2] >= result.shaftSize[1] * 5, result.shaftSize);
  check('同類 projectile 共用 Geometry 同 Material，唔係每粒重新 allocate',
    result.sameResources, { roots: result.roots, sameResources: result.sameResources });
  check('projectile 移除後 scene object 真係清走', result.directAfterPair === 0,
    { directAfterPair: result.directAfterPair });
  check('連續 5 批發射／清場後 GPU geometry memory 有上限', result.geometryGrowth <= 8,
    { start: result.geometryStart, end: result.geometryEnd, growth: result.geometryGrowth, series: result.memorySeries });
  check('量度期間零 browser error', errors.length === 0, errors.slice(0, 3));
  console.log(`\ntower projectile renderer: ${pass}/${pass + fail} 通過`);
  if (failed.length) console.log('失敗項目: ' + failed.join('、'));
} finally {
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
}

process.exit(fail ? 1 : 0);
