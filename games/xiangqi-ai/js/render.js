/* render.js — Three.js 3D board renderer (pooled, zero-alloc draw)
   Keeps the same Render.* API so main.js needs zero changes. */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {
  COLS, ROWS, RED,
  pSide, idx, rowOf, colOf, pieceName, findKing
} from './engine/types.js';

/* ── Constants ── */
const CELL = 1;
const BOARD_W = (COLS - 1) * CELL;
const BOARD_H = (ROWS - 1) * CELL;
const PIECE_R = 0.4;
const PIECE_H = 0.18;
const MAX_PIECES = 32;

/* ── Colours ── */
const COL_BOARD = 0x87694a;
const COL_LINE = 0x3e2723;
const COL_RED = 0x8e1b1b;
const COL_BLACK = 0x1e2a36;
const COL_PIECE_BODY = 0xcfc7b6;
const COL_SEL = 0x6ea8ff;
const COL_LAST = 0x64b4ff;
const COL_CHECK = 0xff0000;
const COL_DOT = 0x00a000;
const COL_CAP_RING = 0xdc3232;

/* ── State ── */
let canvas, renderer, scene, camera, controls, composer;
let boardGroup;
let selectedIdx = -1;
let legalDests = [];
let lastMove = null;
let checkSide = 0;
let fitDistance = 8;

// ghost move state
let ghostMove = null; // {piece,from,to,t,side,name}
let ghostSlot = null; // {body,ring,label}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hitPlane;

/* ── Pools ── */
const piecePool = [];
const overlayPool = [];

/* ── Shared geometries/materials ── */
let geoCylinder, geoTorus, geoTextPlane, geoHighlight, geoDot, geoCapRing;
let matPieceRed, matPieceBlack, matRingRed, matRingBlack, matBoard;

/* ── Texture cache ── */
const texCache = new Map();

function getCachedTexture(side, name) {
  const key = `${side}:${name}`;
  let tex = texCache.get(key);
  if (tex) return tex;

  const c = document.createElement('canvas');
  if (side === 0) {
    c.width = 1024;
    c.height = 256;
  } else {
    c.width = 128;
    c.height = 128;
  }

  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = side === RED ? '#8c1f1f' : '#24313c';
  ctx.font = side === 0
    ? 'bold 220px "Noto Serif TC","Songti SC","SimSun",serif'
    : `bold ${Math.floor(c.width * 0.65)}px "Noto Serif TC","Songti SC","SimSun",serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, c.width / 2, c.height / 2);

  tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  texCache.set(key, tex);
  return tex;
}

/* ── Helpers: board coords ↔ world ── */
function toWorldX(col) { return col * CELL - BOARD_W / 2; }
function toWorldZ(row) { return (ROWS - 1 - row) * CELL - BOARD_H / 2; }
function toWorld(row, col) {
  return new THREE.Vector3(toWorldX(col), 0, toWorldZ(row));
}

function fromWorld(x, z) {
  const col = Math.round((x + BOARD_W / 2) / CELL);
  const row = Math.round((ROWS - 1) - (z + BOARD_H / 2) / CELL);
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1;
  return idx(row, col);
}

function fitCameraToObject(cam, object, ctrls, offset = 1.25) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const fov = THREE.MathUtils.degToRad(cam.fov);
  const fitHeightDist = (size.y / 2) / Math.tan(fov / 2);
  const fitWidthDist = (size.x / 2) / Math.tan(fov / 2) / cam.aspect;
  const fitDepthDist = (size.z / 2) / Math.tan(fov / 2);
  const distance = offset * Math.max(fitHeightDist, fitWidthDist, fitDepthDist, 1.0);

  const dir = cam.position.clone().sub(center).normalize();
  cam.position.copy(center).add(dir.multiplyScalar(distance));
  cam.near = Math.max(0.01, distance / 100);
  cam.far = distance * 100;
  cam.updateProjectionMatrix();

  if (ctrls) {
    ctrls.target.copy(center);
    ctrls.minDistance = distance * 0.95;
    ctrls.maxDistance = distance * 2.0;
    ctrls.update();
  }

  return { distance, center };
}

function createWoodNormalMap() {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const wave = Math.sin((x / size) * Math.PI * 20) * 0.5 + 0.5;
      const grain = 118 + Math.floor(wave * 20);
      data[i] = 128;
      data[i + 1] = grain;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  tex.needsUpdate = true;
  return tex;
}

function renderFrame() {
  if (controls) controls.update();
  if (composer) composer.render();
  else renderer.render(scene, camera);
  requestAnimationFrame(renderFrame);
}

/* ── Init ── */
function init(cvs) {
  canvas = cvs;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.physicallyCorrectLights = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x0f1115);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1115);

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(7, 8, -9);
  camera.lookAt(0, 0, 0);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = true;
  controls.zoomSpeed = 0.85;
  controls.enableRotate = true;
  controls.rotateSpeed = 0.45;
  controls.enablePan = false;
  controls.minPolarAngle = THREE.MathUtils.degToRad(15);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(80);

  const hemi = new THREE.HemisphereLight(0xe5ecf5, 0x20242a, 0.2);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0xffffff, 0.08);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xe8f0ff, 1.03);
  key.position.set(5.5, 9.5, -3.8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 5;
  key.shadow.bias = -0.0001;
  key.shadow.normalBias = 0.022;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x7fa3ff, 0.32);
  rim.position.set(-7.5, 6.0, 7.5);
  rim.castShadow = true;
  rim.shadow.mapSize.set(2048, 2048);
  rim.shadow.radius = 4;
  rim.shadow.bias = -0.00008;
  rim.shadow.normalBias = 0.018;
  scene.add(rim);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  new RGBELoader().load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
    (hdr) => {
      const envRT = pmremGenerator.fromEquirectangular(hdr);
      scene.environment = envRT.texture;
      hdr.dispose();
      pmremGenerator.dispose();
    }
  );

  boardGroup = new THREE.Group();
  scene.add(boardGroup);

  const planeGeo = new THREE.PlaneGeometry(BOARD_W + 2, BOARD_H + 2);
  const planeMat = new THREE.MeshBasicMaterial({ visible: false });
  hitPlane = new THREE.Mesh(planeGeo, planeMat);
  hitPlane.rotation.x = -Math.PI / 2;
  scene.add(hitPlane);

  buildBoard();
  buildSharedGeometry();
  buildPiecePool();
  buildOverlayPool();
  buildGhostSlot();

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.0, 0.0, 1.0);
  composer.addPass(bloom);

  const fit = fitCameraToObject(camera, boardGroup, controls, 1.25);
  fitDistance = fit.distance;

  camera.position.z = -Math.abs(camera.position.z);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();

  renderFrame();
}

/* ── Resize ── */
function resize() {
  const wrap = canvas.parentElement;
  const w = wrap.clientWidth;
  const h = w * (10.2 / 9);
  renderer.setSize(w, h);
  if (composer) composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  const fit = fitCameraToObject(camera, boardGroup, controls, 1.25);
  fitDistance = fit.distance;

  // Keep default view from Red side (red at bottom) after every resize/refit.
  camera.position.z = -Math.abs(camera.position.z);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);

  controls.minDistance = fitDistance * 0.95;
  controls.maxDistance = fitDistance * 2.0;
  controls.update();
  if (composer) composer.render(); else renderer.render(scene, camera);
}

/* ── Build static board ── */
function buildBoard() {
  const boardThickness = 0.34;
  const geo = new THREE.BoxGeometry(BOARD_W + 0.8, boardThickness, BOARD_H + 0.8);
  const woodNormal = createWoodNormalMap();
  matBoard = new THREE.MeshPhysicalMaterial({
    color: COL_BOARD,
    emissive: 0x000000,
    emissiveIntensity: 0.0,
    roughness: 0.82,
    metalness: 0.0,
    normalMap: woodNormal,
    normalScale: new THREE.Vector2(0.3, 0.3),
    clearcoat: 0.0
  });
  const plane = new THREE.Mesh(geo, matBoard);
  plane.position.y = -boardThickness / 2 - 0.02;
  plane.receiveShadow = true;
  boardGroup.add(plane);

  const lineMat = new THREE.LineBasicMaterial({ color: COL_LINE });

  for (let r = 0; r < ROWS; r++) {
    const pts = [toWorld(r, 0), toWorld(r, COLS - 1)];
    pts.forEach(p => p.y = 0.001);
    boardGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  for (let c = 0; c < COLS; c++) {
    if (c === 0 || c === COLS - 1) {
      const pts = [toWorld(0, c), toWorld(ROWS - 1, c)];
      pts.forEach(p => p.y = 0.001);
      boardGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    } else {
      const pts1 = [toWorld(0, c), toWorld(4, c)];
      pts1.forEach(p => p.y = 0.001);
      boardGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts1), lineMat));
      const pts2 = [toWorld(5, c), toWorld(9, c)];
      pts2.forEach(p => p.y = 0.001);
      boardGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), lineMat));
    }
  }

  const palaceLines = [
    [toWorld(0, 3), toWorld(2, 5)],
    [toWorld(0, 5), toWorld(2, 3)],
    [toWorld(7, 3), toWorld(9, 5)],
    [toWorld(7, 5), toWorld(9, 3)],
  ];
  for (const pts of palaceLines) {
    pts.forEach(p => p.y = 0.001);
    boardGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }

  for (const [text, col] of [['漢界', 2], ['楚河', 6]]) {
    const tex = getCachedTexture(0, text);
    const tMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false });
    tMat.polygonOffset = true;
    tMat.polygonOffsetFactor = -1;
    tMat.polygonOffsetUnits = -1;
    const tGeo = new THREE.PlaneGeometry(2.35, 0.72);
    const tMesh = new THREE.Mesh(tGeo, tMat);
    const pos = toWorld(4.5, col);
    tMesh.position.set(pos.x, 0.03, pos.z);
    tMesh.rotation.x = -Math.PI / 2;
    tMesh.rotation.z = Math.PI;
    tMesh.renderOrder = 1000;
    boardGroup.add(tMesh);
  }
}

/* ── Shared geometry (once) ── */
function buildSharedGeometry() {
  geoCylinder = new THREE.CylinderGeometry(PIECE_R, PIECE_R, PIECE_H, 32);
  geoTorus = new THREE.TorusGeometry(PIECE_R * 0.7, 0.015, 8, 32);
  geoTextPlane = new THREE.PlaneGeometry(PIECE_R * 1.5, PIECE_R * 1.5);
  geoHighlight = new THREE.CircleGeometry(PIECE_R + 0.06, 32);
  geoDot = new THREE.CircleGeometry(0.1, 16);
  geoCapRing = new THREE.RingGeometry(PIECE_R - 0.04, PIECE_R + 0.04, 32);

  matPieceRed = new THREE.MeshPhysicalMaterial({
    color: COL_PIECE_BODY,
    roughness: 0.56,
    metalness: 0.02,
    clearcoat: 0.18,
    clearcoatRoughness: 0.35
  });
  matPieceBlack = new THREE.MeshPhysicalMaterial({
    color: COL_PIECE_BODY,
    roughness: 0.56,
    metalness: 0.02,
    clearcoat: 0.18,
    clearcoatRoughness: 0.35
  });
  matRingRed = new THREE.MeshBasicMaterial({ color: COL_RED });
  matRingBlack = new THREE.MeshBasicMaterial({ color: COL_BLACK });
}

/* ── Piece pool (32 slots) ── */
function buildPiecePool() {
  for (let i = 0; i < MAX_PIECES; i++) {
    const body = new THREE.Mesh(geoCylinder, matPieceRed);
    body.castShadow = true;
    body.receiveShadow = true;
    body.visible = false;
    scene.add(body);

    const ring = new THREE.Mesh(geoTorus, matRingRed);
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    scene.add(ring);

    const labelMat = new THREE.MeshBasicMaterial({ transparent: true });
    labelMat.polygonOffset = true;
    labelMat.polygonOffsetFactor = -1;
    labelMat.polygonOffsetUnits = -1;
    const label = new THREE.Mesh(geoTextPlane, labelMat);
    label.rotation.x = -Math.PI / 2;
    label.rotation.z = Math.PI;
    label.visible = false;
    scene.add(label);

    piecePool.push({ body, ring, label });
  }
}

function buildGhostSlot() {
  const body = new THREE.Mesh(geoCylinder, matPieceRed);
  body.castShadow = true;
  body.receiveShadow = true;
  body.visible = false;
  scene.add(body);

  const ring = new THREE.Mesh(geoTorus, matRingRed);
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  scene.add(ring);

  const labelMat = new THREE.MeshBasicMaterial({ transparent: true });
  labelMat.polygonOffset = true;
  labelMat.polygonOffsetFactor = -1;
  labelMat.polygonOffsetUnits = -1;
  const label = new THREE.Mesh(geoTextPlane, labelMat);
  label.rotation.x = -Math.PI / 2;
  label.rotation.z = Math.PI;
  label.visible = false;
  scene.add(label);

  ghostSlot = { body, ring, label };
}

/* ── Overlay pool ── */
function buildOverlayPool() {
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geoHighlight, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    scene.add(mesh);
    overlayPool.push({ mesh, kind: 'highlight' });
  }
  for (let i = 0; i < 44; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: COL_DOT, transparent: true, opacity: 0.6 });
    const mesh = new THREE.Mesh(geoDot, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    scene.add(mesh);
    overlayPool.push({ mesh, kind: 'dot' });
  }
  for (let i = 0; i < 16; i++) {
    const mat = new THREE.MeshBasicMaterial({ color: COL_CAP_RING, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const mesh = new THREE.Mesh(geoCapRing, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    scene.add(mesh);
    overlayPool.push({ mesh, kind: 'ring' });
  }
}

/* ── Draw (pool-based, zero alloc) ── */
function draw(board) {
  for (const p of piecePool) {
    p.body.visible = false;
    p.ring.visible = false;
    p.label.visible = false;
  }
  for (const o of overlayPool) o.mesh.visible = false;
  if (ghostSlot) {
    ghostSlot.body.visible = false;
    ghostSlot.ring.visible = false;
    ghostSlot.label.visible = false;
  }

  let hlIdx = 0;
  let dotIdx = 0;
  let ringIdx = 0;

  const hlStart = 0;
  const dotStart = 5;
  const ringStart = 5 + 44;

  function placeHighlight(boardIdx, color, opacity) {
    if (hlIdx >= 5) return;
    const slot = overlayPool[hlStart + hlIdx++];
    const r = rowOf(boardIdx), c = colOf(boardIdx);
    slot.mesh.position.set(toWorldX(c), 0.002, toWorldZ(r));
    slot.mesh.material.color.setHex(color);
    slot.mesh.material.opacity = opacity;
    slot.mesh.visible = true;
  }

  if (lastMove) {
    placeHighlight(lastMove.from, COL_LAST, 0.2);
    placeHighlight(lastMove.to, COL_LAST, 0.3);
  }
  if (checkSide) {
    const ki = findKing(board, checkSide);
    if (ki >= 0) placeHighlight(ki, COL_CHECK, 0.3);
  }
  if (selectedIdx >= 0) {
    placeHighlight(selectedIdx, COL_SEL, 0.5);
  }

  for (const dest of legalDests) {
    const r = rowOf(dest), c = colOf(dest);
    const wx = toWorldX(c), wz = toWorldZ(r);
    if (board[dest]) {
      if (ringIdx < 16) {
        const slot = overlayPool[ringStart + ringIdx++];
        slot.mesh.position.set(wx, 0.003, wz);
        slot.mesh.visible = true;
      }
    } else {
      if (dotIdx < 44) {
        const slot = overlayPool[dotStart + dotIdx++];
        slot.mesh.position.set(wx, 0.003, wz);
        slot.mesh.visible = true;
      }
    }
  }

  let pi = 0;
  for (let i = 0; i < 90; i++) {
    const p = board[i];
    if (!p || pi >= MAX_PIECES) continue;

    const r = rowOf(i), c = colOf(i);
    const wx = toWorldX(c), wz = toWorldZ(r);
    const side = pSide(p);
    const name = pieceName(p);
    const slot = piecePool[pi++];

    slot.body.material = side === RED ? matPieceRed : matPieceBlack;
    slot.body.position.set(wx, PIECE_H / 2, wz);
    slot.body.visible = true;

    slot.ring.material = side === RED ? matRingRed : matRingBlack;
    slot.ring.position.set(wx, PIECE_H + 0.001, wz);
    slot.ring.visible = true;

    const tex = getCachedTexture(side, name);
    if (slot.label.material.map !== tex) {
      slot.label.material.map = tex;
      slot.label.material.needsUpdate = true;
    }
    slot.label.position.set(wx, PIECE_H + 0.002, wz);
    slot.label.visible = true;
  }

  // draw ghost piece if active
  if (ghostMove && ghostSlot) {
    const fromR = rowOf(ghostMove.from), fromC = colOf(ghostMove.from);
    const toR = rowOf(ghostMove.to), toC = colOf(ghostMove.to);
    const t = ghostMove.t;
    const x = toWorldX(fromC) + (toWorldX(toC) - toWorldX(fromC)) * t;
    const z = toWorldZ(fromR) + (toWorldZ(toR) - toWorldZ(fromR)) * t;

    ghostSlot.body.material = ghostMove.side === RED ? matPieceRed : matPieceBlack;
    ghostSlot.body.position.set(x, PIECE_H / 2, z);
    ghostSlot.body.visible = true;

    ghostSlot.ring.material = ghostMove.side === RED ? matRingRed : matRingBlack;
    ghostSlot.ring.position.set(x, PIECE_H + 0.001, z);
    ghostSlot.ring.visible = true;

    const tex = getCachedTexture(ghostMove.side, ghostMove.name);
    if (ghostSlot.label.material.map !== tex) {
      ghostSlot.label.material.map = tex;
      ghostSlot.label.material.needsUpdate = true;
    }
    ghostSlot.label.position.set(x, PIECE_H + 0.002, z);
    ghostSlot.label.visible = true;
  }

  if (composer) composer.render(); else renderer.render(scene, camera);
}

/* ── Hit test ── */
function hitTest(px, py) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((px - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((py - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(hitPlane);
  if (hits.length === 0) return -1;

  const pt = hits[0].point;
  return fromWorld(pt.x, pt.z);
}

/* ── Setters ── */
function setSelected(i, dests) { selectedIdx = i; legalDests = dests || []; }
function setLastMove(mv) { lastMove = mv; }
function setCheck(side) { checkSide = side; }

// optional API (backward compatible)
function setGhostMove(piece, from, to, t, side, name) {
  ghostMove = { piece, from, to, t, side, name };
}
function clearGhost() {
  ghostMove = null;
}

export const Render = {
  init,
  resize,
  draw,
  hitTest,
  setSelected,
  setLastMove,
  setCheck,
  setGhostMove,
  clearGhost
};
