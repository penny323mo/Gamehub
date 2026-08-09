// 真 browser renderer budget：同一個 20 塔／150 怪 stress scene，分 desktop 同 mobile 量。
//
// Run against the checked-in build:
//   node games/tower/tests/performance.mjs
// Run against a Vite dev server (so source edits can be verified without writing dist/):
//   TOWER_URL=http://127.0.0.1:5183/ node games/tower/tests/performance.mjs
// Optional screenshots:
//   PERF_SCREENSHOTS=/tmp/tower-perf node games/tower/tests/performance.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const STATIC_ROOT = process.env.TOWER_STATIC_ROOT
  ? path.resolve(process.env.TOWER_STATIC_ROOT)
  : ROOT;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.glb': 'model/gltf-binary', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.m4a': 'audio/mp4',
};

let server = null;
let url = process.env.TOWER_URL;
if (!url) {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(STATIC_ROOT, pathname);
    if (!file.startsWith(STATIC_ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('404'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  const port = await new Promise((resolve) => server.listen(0, () => resolve(server.address().port)));
  url = process.env.TOWER_STATIC_ROOT
    ? `http://127.0.0.1:${port}/index.html`
    : `http://127.0.0.1:${port}/games/tower/dist/index.html`;
}

const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

let pass = 0;
let fail = 0;
const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass += 1; console.log(`PASS  ${name}`, JSON.stringify(detail)); }
  else { fail += 1; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const round = (n, places = 2) => +n.toFixed(places);
const frameSampleCount = Math.max(1, Number(process.env.PERF_SAMPLES ?? 60));
const phaseSampleCount = Math.max(1, Number(process.env.PERF_PHASE_SAMPLES ?? 8));

const profiles = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }, mobile: false },
  {
    name: 'mobile-844x390', viewport: { width: 844, height: 390 }, mobile: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/151 Mobile Safari/537.36',
  },
];

const results = [];
try {
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      deviceScaleFactor: 1,
      isMobile: profile.mobile,
      hasTouch: profile.mobile,
      userAgent: profile.userAgent,
    });
    const page = await context.newPage();
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

    await page.evaluate(() => {
      const T = window.__TD;
      T.擂台(999999);
      T.state.speedMultiplier = 0;
    });
    const phaseSnapshot = async (sampleCount = phaseSampleCount) => page.evaluate(async (count) => {
      const T = window.__TD;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      T.renderer.info.autoReset = false;
      T.renderer.info.reset();
      const frameTimes = [];
      let previous = performance.now();
      for (let i = 0; i < count; i += 1) {
        const now = await new Promise((resolve) => requestAnimationFrame(resolve));
        frameTimes.push(now - previous);
        previous = now;
      }
      const render = {
        calls: T.renderer.info.render.calls / count,
        triangles: T.renderer.info.render.triangles / count,
      };
      T.renderer.info.autoReset = true;
      T.renderer.info.reset();
      let objects = 0; let visibleMeshes = 0;
      T.scene.traverse((object) => {
        objects += 1;
        if (object.isMesh && object.visible) visibleMeshes += 1;
      });
      frameTimes.sort((a, b) => a - b);
      return {
        calls: render.calls, triangles: render.triangles, objects, visibleMeshes,
        medianMs: frameTimes[Math.floor(frameTimes.length * 0.5)],
        p95Ms: frameTimes[Math.min(frameTimes.length - 1, Math.floor(frameTimes.length * 0.95))],
      };
    }, sampleCount);
    const emptyPhase = await phaseSnapshot();
    const visualStructure = await page.evaluate(() => {
      const T = window.__TD;
      const cliff = (name) => {
        const object = T.scene.getObjectByName(name);
        return { count: object?.count ?? 0, tier: object?.userData?.foundationTier ?? 0 };
      };
      return {
        wildwood: cliff('island-cliff:wildwood-gate'),
        crossing: cliff('island-cliff:sunken-crossing'),
        bastion: cliff('island-cliff:bastion-cliff'),
        keepMesa: T.scene.getObjectByName('keep-mesa:lower-stratum')?.count ?? 0,
        water: Boolean(T.scene.getObjectByName('river-rift:water')),
        shoulders: Boolean(T.scene.getObjectByName('river-rift:shoulders')),
        moteArea: T.scene.getObjectByName('ambient-motes')?.userData?.area ?? null,
      };
    });
    const screenshotPrefix = process.env.PERF_SCREENSHOTS;
    if (screenshotPrefix) {
      await page.evaluate(() => document.getElementById('wave-banner')?.classList.add('hidden'));
      await page.screenshot({ path: `${screenshotPrefix}-${profile.name}-empty.png` });
    }

    const yaw = await page.evaluate(async () => {
      const T = window.__TD;
      T.spawn('grunt', 5);
      const enemy = T.state.enemies[T.state.enemies.length - 1];
      enemy.speed = 0;
      // Establish +Z facing, then turn the render direction 90 degrees towards +X.
      enemy.prevWorldX = enemy.worldX;
      enemy.prevWorldZ = enemy.worldZ - 1;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const start = enemy.displayRot ?? null;
      enemy.prevWorldX = enemy.worldX - 1;
      enemy.prevWorldZ = enemy.worldZ;
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const afterOneFrame = enemy.displayRot ?? null;
      for (let i = 0; i < 12; i += 1) await new Promise((resolve) => requestAnimationFrame(resolve));
      const settled = enemy.displayRot ?? null;
      T.state.enemies = [];
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { start, afterOneFrame, settled };
    });

    // Exercise context recovery while the fully loaded scene is still light. Losing a
    // software WebGL context after the 20-tower/150-enemy stress pass can crash the
    // browser process itself and tests browser limits rather than app lifecycle.
    const lifecycle = await page.evaluate(async () => {
      const canvas = window.__TD.renderer.domElement;
      const gl = window.__TD.renderer.getContext();
      const ext = gl.getExtension('WEBGL_lose_context');
      if (!ext) return { supported: false, lost: 0, restored: 0, recovered: false };
      let lost = 0; let restored = 0;
      canvas.addEventListener('webglcontextlost', (event) => { lost += 1; event.preventDefault(); }, { once: true });
      canvas.addEventListener('webglcontextrestored', () => { restored += 1; }, { once: true });
      ext.loseContext();
      await new Promise((resolve) => setTimeout(resolve, 120));
      ext.restoreContext();
      const deadline = performance.now() + 3_000;
      while (restored === 0 && performance.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const safelyPaused = window.__TD.state.paused;
      return { supported: true, lost, restored, recovered: !gl.isContextLost(), safelyPaused };
    });
    // Resume through the real recovery UI, proving the modal/focus lifecycle as well
    // as keeping later screenshots free of a synthetic hidden-overlay state.
    if (lifecycle.supported && lifecycle.safelyPaused) {
      await page.click('#resume-btn');
      await page.waitForFunction(() => !window.__TD.state.paused);
    }

    const towerSetup = await page.evaluate(async () => {
      const T = window.__TD;
      const towerTypes = ['arrow', 'cannon', 'fire', 'ice', 'poison', 'sniper', 'lightning'];
      const built = [];
      for (let row = 0; row < 12 && built.length < 20; row += 1) {
        for (let col = 0; col < 20 && built.length < 20; col += 1) {
          const tower = T.build(towerTypes[built.length % towerTypes.length], col, row);
          if (tower) built.push([col, row]);
        }
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { towers: built.length };
    });
    const towerPhase = await phaseSnapshot();

    const enemySetup = await page.evaluate(async () => {
      const T = window.__TD;
      const enemyTypes = ['grunt', 'runner', 'swarm', 'tank', 'shield', 'healer', 'boss'];
      for (let i = 0; i < 150; i += 1) {
        T.spawn(enemyTypes[i % enemyTypes.length], i % 30);
        const enemy = T.state.enemies[T.state.enemies.length - 1];
        enemy.speed = 0;
        enemy.hp = enemy.maxHp = 1_000_000_000;
        enemy.shield = enemy.maxShield = 1_000_000_000;
      }
      // Keep the full render-sync path running while making the stress scene deterministic.
      T.state.speedMultiplier = 0;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return { enemies: T.state.enemies.length };
    });
    const setup = { towers: towerSetup.towers, enemies: enemySetup.enemies };

    const measured = await page.evaluate(async (sampleCount) => {
      const T = window.__TD;
      const info = T.renderer.info;
      // Finish the current game frame, then reset. Each following rAF interval contains
      // exactly one game-loop render because the game registered its callback first.
      await new Promise((resolve) => requestAnimationFrame(resolve));
      info.autoReset = false;
      info.reset();
      const frameTimes = [];
      let previous = performance.now();
      for (let i = 0; i < sampleCount; i += 1) {
        const now = await new Promise((resolve) => requestAnimationFrame(resolve));
        frameTimes.push(now - previous);
        previous = now;
      }
      const render = {
        calls: info.render.calls / sampleCount,
        triangles: info.render.triangles / sampleCount,
        lines: info.render.lines / sampleCount,
        points: info.render.points / sampleCount,
      };
      const memory = { ...info.memory };
      info.autoReset = true;
      info.reset();

      const sorted = [...frameTimes].sort((a, b) => a - b);
      const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
      const scene = {
        objects: 0, meshes: 0, visibleMeshes: 0, instancedMeshes: 0, instances: 0,
        lights: 0, materials: new Set(), geometries: new Set(),
      };
      T.scene.traverse((object) => {
        scene.objects += 1;
        if (object.isLight) scene.lights += 1;
        if (!object.isMesh) return;
        scene.meshes += 1;
        if (object.visible) scene.visibleMeshes += 1;
        if (object.isInstancedMesh) {
          scene.instancedMeshes += 1;
          scene.instances += object.count;
        }
        if (object.geometry?.uuid) scene.geometries.add(object.geometry.uuid);
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) if (material?.uuid) scene.materials.add(material.uuid);
      });
      return {
        frame: {
          median: percentile(0.5), p95: percentile(0.95), p99: percentile(0.99),
          over20: frameTimes.filter((ms) => ms > 20).length,
          over33: frameTimes.filter((ms) => ms > 33.34).length,
          samples: frameTimes.length,
        },
        render, memory,
        scene: { ...scene, materials: scene.materials.size, geometries: scene.geometries.size },
      };
    }, frameSampleCount);

    const campaignPeakEnemies = await page.evaluate(async () => {
      const T = window.__TD;
      const enemyTypes = ['grunt', 'runner', 'swarm', 'tank', 'shield', 'healer', 'boss'];
      while (T.state.enemies.length < 229) {
        const i = T.state.enemies.length;
        T.spawn(enemyTypes[i % enemyTypes.length], i % 30);
        const enemy = T.state.enemies[T.state.enemies.length - 1];
        enemy.speed = 0;
        enemy.hp = enemy.maxHp = 1_000_000_000;
        enemy.shield = enemy.maxShield = 1_000_000_000;
      }
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return T.state.enemies.length;
    });
    const campaignPeak = await phaseSnapshot(Math.min(frameSampleCount, 30));

    const dimensions = async () => page.evaluate(() => {
      const T = window.__TD;
      const canvas = T.renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      const target = new T.camera.position.constructor();
      T.renderer.getDrawingBufferSize(target);
      return {
        viewport: [innerWidth, innerHeight], css: [round(rect.width), round(rect.height)],
        canvas: [canvas.width, canvas.height], drawingBuffer: [target.x, target.y],
        pixelRatio: devicePixelRatio,
        cameraAspect: (T.camera.right - T.camera.left) / (T.camera.top - T.camera.bottom),
      };
      function round(value) { return Math.round(value * 100) / 100; }
    });
    const beforeResize = await dimensions();
    const alternate = profile.mobile ? { width: 740, height: 430 } : { width: 1024, height: 640 };
    await page.setViewportSize(alternate);
    await page.waitForTimeout(150);
    const afterResize = await dimensions();
    await page.setViewportSize(profile.viewport);
    await page.waitForTimeout(150);
    const afterRestoreSize = await dimensions();

    if (screenshotPrefix) await page.screenshot({ path: `${screenshotPrefix}-${profile.name}.png` });

    const result = {
      profile: profile.name, setup, visualStructure, yaw,
      phases: {
        empty: Object.fromEntries(Object.entries(emptyPhase).map(([key, value]) => [key, round(value)])),
        towers20: Object.fromEntries(Object.entries(towerPhase).map(([key, value]) => [key, round(value)])),
        campaignPeak229: Object.fromEntries(Object.entries(campaignPeak).map(([key, value]) => [key, round(value)])),
      },
      frame: Object.fromEntries(Object.entries(measured.frame).map(([key, value]) =>
        [key, typeof value === 'number' && key !== 'samples' ? round(value) : value])),
      render: Object.fromEntries(Object.entries(measured.render).map(([key, value]) => [key, round(value)])),
      memory: measured.memory, scene: measured.scene,
      resize: { before: beforeResize, alternate: afterResize, restored: afterRestoreSize },
      lifecycle, errors,
    };
    results.push(result);
    console.log(`METRIC ${profile.name} ${JSON.stringify(result)}`);

    check(`${profile.name}: stress scene 完整`, setup.towers === 20 && setup.enemies === 150, setup);
    const emptyCallBudget = profile.mobile ? 450 : 1_000;
    check(`${profile.name}: 靜態地圖 GLB 有 batching，空場 draw calls 受控`,
      emptyPhase.calls <= emptyCallBudget,
      { calls: round(emptyPhase.calls), budget: emptyCallBudget, visibleMeshes: emptyPhase.visibleMeshes });
    check(`${profile.name}: 西林台／中央裂谷／城堡 mesa 三段 visual structure 齊全`,
      visualStructure.wildwood.count > 0 && visualStructure.crossing.count > 0
        && visualStructure.bastion.count > 0 && visualStructure.keepMesa > 0
        && visualStructure.water && visualStructure.shoulders,
      visualStructure);
    check(`${profile.name}: 三個 authoritative region 產生三級 foundation silhouette`,
      visualStructure.wildwood.tier === 1 && visualStructure.crossing.tier === 2
        && visualStructure.bastion.tier === 3,
      { wildwood: visualStructure.wildwood, crossing: visualStructure.crossing, bastion: visualStructure.bastion });
    const moteArea = visualStructure.moteArea;
    check(`${profile.name}: ambient motes 跟不規則地圖 bounds，入口同出口都有覆蓋`,
      moteArea && moteArea.minX <= -11 && moteArea.maxX >= 11
        && moteArea.maxZ - moteArea.minZ <= 13,
      moteArea);
    check(`${profile.name}: 敵人 90 度轉角先平滑轉身，再收斂到新方向`,
      yaw.start !== null && Math.abs(yaw.start) < 0.05
        && yaw.afterOneFrame > 0.01 && yaw.afterOneFrame < Math.PI / 2 - 0.05
        && yaw.settled > yaw.afterOneFrame && Math.abs(yaw.settled - Math.PI / 2) < 0.08,
      yaw);
    const peakCallBudget = profile.mobile ? 1_100 : 2_200;
    check(`${profile.name}: campaign 真峰值 229 怪仍守住 draw-call budget`,
      campaignPeakEnemies === 229 && campaignPeak.calls <= peakCallBudget,
      { enemies: campaignPeakEnemies, calls: round(campaignPeak.calls), budget: peakCallBudget,
        medianMs: round(campaignPeak.medianMs), p95Ms: round(campaignPeak.p95Ms) });
    const resizeOkay = [afterResize, afterRestoreSize].every((sample) =>
      sample.css[0] === sample.viewport[0]
      && sample.css[1] === sample.viewport[1]
      && sample.drawingBuffer[0] === sample.canvas[0]
      && sample.drawingBuffer[1] === sample.canvas[1]
      && Math.abs(sample.cameraAspect - sample.viewport[0] / sample.viewport[1]) < 0.002);
    check(`${profile.name}: resize 同 drawing buffer／camera 同步`, resizeOkay,
      { alternate: afterResize, restored: afterRestoreSize });
    check(`${profile.name}: WebGL context loss 後可以 restore`,
      !lifecycle.supported || (lifecycle.lost === 1 && lifecycle.restored === 1
        && lifecycle.recovered && lifecycle.safelyPaused), lifecycle);
    check(`${profile.name}: 量度期間零 browser error`, errors.length === 0, errors.slice(0, 3));
    await context.close();
  }
} finally {
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
}

console.log(`\ntower renderer/performance: ${pass}/${pass + fail} 通過`);
console.log(JSON.stringify(results, null, 2));
if (failed.length) console.log('失敗項目: ' + failed.join('、'));
process.exit(fail ? 1 : 0);
