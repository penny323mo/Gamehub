// Olden Ring — 千燈 (the thousand lanterns). Render-only dressing, never touches sim state.
//
//   • 千燈古塔: a colossal nine-tier pagoda far behind the citadel, standing under the Olden Ring, every eave
//     strung with lanterns. Its base hides behind the wall; the middle tiers rise into the gameplay frame.
//   • Sky lanterns: a few hundred paper lanterns drifting upward around the arena, swaying, wrapping back to the ground.
//   • Rim lanterns: posts ringing the fight disc, and lantern strings along the wall walk.
//
// Lanterns are unlit HDR colours (> 1.0) so the post chain's bloom picks them up without any extra lights.
// Aesthetic inspired by the "千燈迷樓" lantern-pagoda demo; geometry and code are our own.
import * as THREE from 'three';
import { boxesGeometry, shade } from '../core/voxel.js';
import { makeRng } from '../core/rng.js';
import { pagoda } from './castle.js';

const lit = () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, metalness: 0, flatShading: true });
const LANTERN_HUES = [[1.9, 0.78, 0.2], [1.8, 0.55, 0.16], [2.0, 1.05, 0.3], [1.6, 0.36, 0.14]];   // HDR but under the bleach knee: stay orange/red   // amber, red-orange, gold, deep red

/** Per-eave lantern positions for pagoda(b, x, y, z, w, d, tiers, s) — mirrors castle.js's tier maths. */
function pagodaEaves(x, y, z, w, d, tiers, s, out) {
  let yy = 0, ww = w, dd = d;
  for (let t = 0; t < tiers; t++) {
    const hh = (t === 0 ? 3.4 : 2.6) * s;
    yy += hh;
    const rw = ww * 1.28, rd = dd * 1.3, n = Math.max(6, Math.round(rw / (1.6 * s)));
    for (let i = 0; i <= n; i++) {
      const f = -0.5 + i / n;
      out.push([x + f * rw, y + yy - 0.45 * s, z - rd / 2 - 0.2 * s, s]);      // front eave (faces the arena)
      out.push([x - rw / 2 - 0.2 * s, y + yy - 0.45 * s, z + f * rd, s]);      // left eave
      out.push([x + rw / 2 + 0.2 * s, y + yy - 0.45 * s, z + f * rd, s]);      // right eave
    }
    // lit windows between the front columns
    for (let i = 0; i < 5; i++) out.push([x + (-0.3 + i * 0.15) * ww, y + yy - hh * 0.45, z - dd * 0.36, s * 1.4, 'win']);
    yy += 1.6 * s;
    ww *= 0.72; dd *= 0.72;
  }
  return yy;
}

export function buildLanterns(scene, { wallZ, gateX, castle, sunDir, quality = 1 }) {
  const r = makeRng(1717);
  const spots = [];   // [x, y, z, scale, kind?]

  // ---- 千燈古塔: nine tiers, under the ring (along the ring-heart's azimuth), far past the wall
  const SZ = wallZ + 125, SX = (sunDir.x / sunDir.z) * SZ;
  const spire = [];
  pagoda(spire, SX, 0, SZ, 44, 40, 9, 2.4);
  const spireMesh = new THREE.Mesh(boxesGeometry(spire.map((b) => ({ ...b, c: darken(b.c) }))), lit());
  scene.add(spireMesh);
  pagodaEaves(SX, 0, SZ, 44, 40, 9, 2.4, spots);
  // two lesser pagodas flanking it
  for (const [dx, dz, t, s] of [[-70, 30, 5, 1.9], [62, 18, 4, 1.7]]) {
    const bb = [];
    pagoda(bb, SX + dx, 0, SZ + dz, 26, 24, t, s);
    scene.add(new THREE.Mesh(boxesGeometry(bb.map((b) => ({ ...b, c: darken(b.c) }))), lit()));
    pagodaEaves(SX + dx, 0, SZ + dz, 26, 24, t, s, spots);
  }

  // ---- lantern strings along the wall walk and the gatehouse eaves
  const H = castle.H;
  for (let x = -128; x < castle.x1 - 1; x += 2.6 + r.range(-0.4, 0.4)) {
    const sag = Math.sin((x / 2.6) * Math.PI) * 0.25;
    spots.push([x, H + 2.1 - Math.abs(sag), wallZ - 0.9, 0.9]);
  }
  for (let i = 0; i < 12; i++) spots.push([gateX - 11 + i * 2, H + 4.2, wallZ - 0.6, 1.1]);

  // ---- rim posts around the fight disc (ARENA_RADIUS 46): dark posts with a lantern hanging off a crossbar
  const posts = [];
  const RIM = 49, NP = 28;
  for (let i = 0; i < NP; i++) {
    const a = (i / NP) * Math.PI * 2 + 0.06;
    const x = Math.sin(a) * RIM, z = Math.cos(a) * RIM;
    if (z > wallZ - 8) continue;
    const h = 4.2 + r.range(-0.3, 0.4);
    posts.push({ s: [0.28, h, 0.28], p: [x, h / 2, z], c: shade(0x2a1d18, r.range(0.8, 1.1)) });
    posts.push({ s: [0.16, 0.16, 1.3], p: [x - Math.sin(a) * 0.55, h - 0.25, z - Math.cos(a) * 0.55], r: [0, a, 0], c: 0x241812 });
    spots.push([x - Math.sin(a) * 1.05, h - 0.95, z - Math.cos(a) * 1.05, 1.05]);
  }
  if (posts.length) {
    const pm = new THREE.Mesh(boxesGeometry(posts), lit());
    pm.castShadow = true; pm.receiveShadow = true;
    scene.add(pm);
  }

  // ---- static lanterns (spire eaves, windows, walls, rim): one instanced mesh
  const box = new THREE.BoxGeometry(0.55, 0.7, 0.55);
  const staticMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const fixed = new THREE.InstancedMesh(box, staticMat, spots.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  const col = new THREE.Color();
  spots.forEach(([x, y, z, s, kind], i) => {
    if (kind === 'win') { sc.set(s * 1.1, s * 0.9, 0.2); col.setRGB(1.5, 0.8, 0.25); }
    else { sc.setScalar(s); const hc = LANTERN_HUES[r.int(0, LANTERN_HUES.length - 1)]; col.setRGB(hc[0], hc[1], hc[2]); }
    fixed.setMatrixAt(i, m.compose(p.set(x, y, z), q.identity(), sc));
    fixed.setColorAt(i, col);
  });
  fixed.instanceMatrix.needsUpdate = true;
  scene.add(fixed);

  // ---- sky lanterns: rise, sway, wrap
  const NS = Math.round(360 * quality);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const sky = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), skyMat, NS);
  sky.frustumCulled = false;
  const L = [];
  for (let i = 0; i < NS; i++) {
    // mostly beyond the wall and the flanks, a few drifting over the arena itself
    const a = r.range(0, Math.PI * 2), rad = r.chance(0.12) ? r.range(20, 45) : r.range(60, 260);
    const x = Math.sin(a) * rad, z = Math.cos(a) * rad + (r.chance(0.6) ? wallZ * 0.9 : 0);
    L.push({ x, z, y0: r.range(0, 80), v: r.range(0.35, 1.1), ph: r.range(0, 6.28), s: r.range(0.7, 1.5) * (rad > 150 ? 1.8 : 1) });
    const hc = LANTERN_HUES[r.int(0, LANTERN_HUES.length - 1)], k = r.range(0.7, 1.15);
    sky.setColorAt(i, col.setRGB(hc[0] * k, hc[1] * k, hc[2] * k));
  }
  scene.add(sky);
  const pose = (t) => {
    for (let i = 0; i < NS; i++) {
      const l = L[i];
      const y = 4 + ((l.y0 + t * l.v) % 80);
      e.set(Math.sin(t * 0.7 + l.ph) * 0.08, t * 0.1 + l.ph, Math.cos(t * 0.6 + l.ph) * 0.08);
      sky.setMatrixAt(i, m.compose(p.set(l.x + Math.sin(t * 0.3 + l.ph) * 1.5, y, l.z + Math.cos(t * 0.25 + l.ph) * 1.5), q.setFromEuler(e), sc.setScalar(l.s)));
    }
    sky.instanceMatrix.needsUpdate = true;
  };
  pose(0);

  // gentle flicker on the static set: one shared scalar (cheap, no per-instance writes)
  return {
    update(t) {
      pose(t);
      const f = 0.92 + Math.sin(t * 9.1) * 0.04 + Math.sin(t * 13.7) * 0.03;
      staticMat.color.setScalar(f);
    },
  };
}

/** Night palette for pagoda voxels: darker, bluer wood; lacquer stays red. */
function darken(c) {
  const rr = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  const L = (rr + g + b) / 3;
  return shade(((Math.min(255, rr * 0.55 + L * 0.05) << 16) | (Math.min(255, g * 0.55 + L * 0.06) << 8) | Math.min(255, b * 0.7 + L * 0.12)) >>> 0, 1);
}
