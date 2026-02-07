const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const turnEl = document.getElementById('turn');
const statusEl = document.getElementById('status');
const stateNoteEl = document.getElementById('state-note');
const powerFillEl = document.getElementById('power-fill');
const debugPanelEl = document.getElementById('debug-panel');
const decisionPanelEl = document.getElementById('decision-panel');
const decisionTextEl = document.getElementById('decision-text');
const decisionTakeBtn = document.getElementById('decision-take');
const decisionForceBtn = document.getElementById('decision-force');
const spinControlEl = document.getElementById('spin-control');
const spinMarkerEl = document.getElementById('spin-marker');
const spinResetBtn = document.getElementById('spin-reset');
const confirmCueBtn = document.getElementById('confirm-cue-btn');

// 手機控制面板
const mobilePowerBtn = document.getElementById('mobile-power-btn');

// 檢測觸控設備
// 允許通過 URL 參數 ?mobile=1 強制啟用手機模式
const urlParams = new URLSearchParams(window.location.search);
const forceMobile = urlParams.get('mobile') === '1' || urlParams.get('forceMobile') === '1';
const isTouchDevice = forceMobile || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
console.log('[Device] isTouchDevice:', isTouchDevice, 'forceMobile:', forceMobile);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x20242a);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.68;
renderer.setClearColor(0x1b1f25, 1);

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  40
);

const cameraHome = {
  position: new THREE.Vector3(0, 2.3, -3.2),
  target: new THREE.Vector3(0, 0.05, 0),
};
camera.position.copy(cameraHome.position);

const controls = THREE.OrbitControls
  ? new THREE.OrbitControls(camera, renderer.domElement)
  : {
    enableDamping: false,
    dampingFactor: 0,
    enablePan: false,
    minDistance: 0,
    maxDistance: 0,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    target: new THREE.Vector3(),
    mouseButtons: {},
    touches: {},
    update() { },
  };
if (!THREE.OrbitControls) {
  console.error('OrbitControls failed to load. Check ./assets/three/OrbitControls.legacy.js');
}
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 1.8;
controls.maxDistance = 6.5;
controls.minPolarAngle = Math.PI * 0.18;
controls.maxPolarAngle = Math.PI * 0.52;
controls.target.copy(cameraHome.target);
controls.mouseButtons = {
  LEFT: null,
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.ROTATE,
};
// 手機觸控設定：單指留俾遊戲瞄準，雙指控制視角
controls.touches = {
  ONE: null,  // 禁用單指控制（避免同瞄準衝突）
  TWO: THREE.TOUCH.DOLLY_ROTATE,  // 雙指：縮放+旋轉
};
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.16);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xc9d8f0, 0x172116, 0.24);
hemiLight.position.set(0, 3, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.72);
dirLight.position.set(-3.2, 4.8, -1.5);
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 1, metalness: 0 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.26;
floor.position.z = -0.05;
scene.add(floor);

const TABLE_LENGTH = 3.6;
const TABLE_WIDTH = 1.8;
const TABLE_HEIGHT = 0.22;
const RAIL_THICK = 0.12;
const RAIL_HEIGHT = 0.08;
const BALL_RADIUS = 0.035;
const CLOTH_Y = 0;

const halfL = TABLE_LENGTH / 2;
const halfW = TABLE_WIDTH / 2;
const playW = TABLE_WIDTH;
const playL = TABLE_LENGTH;

const tableGroup = new THREE.Group();
scene.add(tableGroup);

const worldAxes = new THREE.AxesHelper(2);
worldAxes.visible = false;
scene.add(worldAxes);
const tableAxes = new THREE.AxesHelper(1);
tableAxes.visible = false;
tableGroup.add(tableAxes);

function stickToCloth(mesh, clothMesh, yOffset = 0.002) {
  clothMesh.updateWorldMatrix(true, false);
  const q = new THREE.Quaternion();
  clothMesh.getWorldQuaternion(q);
  mesh.quaternion.copy(q);
  mesh.position.y = clothMesh.position.y + yOffset;
}

function createClothTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a6a3f';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 6000; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = 90 + Math.random() * 30;
    ctx.fillStyle = `rgba(20, ${v}, 55, 0.18)`;
    ctx.fillRect(x, y, 1, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 4.5);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

const clothTexture = createClothTexture();

const cloth = new THREE.Mesh(
  new THREE.PlaneGeometry(TABLE_WIDTH, TABLE_LENGTH),
  new THREE.MeshStandardMaterial({
    map: clothTexture,
    roughness: 0.95,
    metalness: 0.0,
    dithering: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
);
cloth.rotation.x = -Math.PI / 2;
cloth.position.set(0, CLOTH_Y, 0);
const clothOverlay = new THREE.Mesh(
  new THREE.PlaneGeometry(TABLE_WIDTH, TABLE_LENGTH),
  new THREE.MeshStandardMaterial({
    color: 0x145533,
    transparent: true,
    opacity: 0.32,
    roughness: 1,
    metalness: 0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
);
clothOverlay.rotation.x = -Math.PI / 2;
clothOverlay.position.set(0, CLOTH_Y + 0.001, 0);

tableGroup.add(cloth, clothOverlay);

const woodMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a2514,
  roughness: 0.6,
  metalness: 0.1,
});

// Rails with cutouts for pockets (using split BoxGeometry segments)
// Pocket cutout sizes
const pocketGap = 0.12;  // Gap size at pocket positions

// LONG RAILS (x = ±halfW): run along Z axis
// Split into 2 segments with gap at middle (z = 0) for middle pocket
// Also need gaps at corners (z = ±halfL)
const longSegmentLen = (TABLE_LENGTH - pocketGap) / 2 - pocketGap / 2;

// Right long rail (x = +halfW): top and bottom segments
const railRightTop = new THREE.Mesh(
  new THREE.BoxGeometry(RAIL_THICK, RAIL_HEIGHT, longSegmentLen),
  woodMaterial
);
railRightTop.position.set(halfW + RAIL_THICK / 2, RAIL_HEIGHT / 2, (halfL + pocketGap / 2) / 2);

const railRightBottom = new THREE.Mesh(
  new THREE.BoxGeometry(RAIL_THICK, RAIL_HEIGHT, longSegmentLen),
  woodMaterial
);
railRightBottom.position.set(halfW + RAIL_THICK / 2, RAIL_HEIGHT / 2, -(halfL + pocketGap / 2) / 2);

// Left long rail (x = -halfW): same as right
const railLeftTop = new THREE.Mesh(
  new THREE.BoxGeometry(RAIL_THICK, RAIL_HEIGHT, longSegmentLen),
  woodMaterial
);
railLeftTop.position.set(-halfW - RAIL_THICK / 2, RAIL_HEIGHT / 2, (halfL + pocketGap / 2) / 2);

const railLeftBottom = new THREE.Mesh(
  new THREE.BoxGeometry(RAIL_THICK, RAIL_HEIGHT, longSegmentLen),
  woodMaterial
);
railLeftBottom.position.set(-halfW - RAIL_THICK / 2, RAIL_HEIGHT / 2, -(halfL + pocketGap / 2) / 2);

// SHORT RAILS (z = ±halfL): run along X axis
// Only need gaps at corners (x = ±halfW), no middle pocket
const shortRailLen = TABLE_WIDTH - pocketGap;

const railTop = new THREE.Mesh(
  new THREE.BoxGeometry(shortRailLen, RAIL_HEIGHT, RAIL_THICK),
  woodMaterial
);
railTop.position.set(0, RAIL_HEIGHT / 2, halfL + RAIL_THICK / 2);

const railBottom = new THREE.Mesh(
  new THREE.BoxGeometry(shortRailLen, RAIL_HEIGHT, RAIL_THICK),
  woodMaterial
);
railBottom.position.set(0, RAIL_HEIGHT / 2, -halfL - RAIL_THICK / 2);

tableGroup.add(railRightTop, railRightBottom, railLeftTop, railLeftBottom, railTop, railBottom);

const tableBody = new THREE.Mesh(
  new THREE.BoxGeometry(TABLE_WIDTH + RAIL_THICK * 2.4, TABLE_HEIGHT, TABLE_LENGTH + RAIL_THICK * 2.4),
  new THREE.MeshStandardMaterial({ color: 0x21160d, roughness: 0.7, metalness: 0.05 })
);
tableBody.position.y = -TABLE_HEIGHT / 2;
tableGroup.add(tableBody);

// Pocket group and materials
const pocketGroup = new THREE.Group();
pocketGroup.renderOrder = 10;  // Render on top of rails
const pocketRimMaterial = new THREE.MeshStandardMaterial({ color: 0x12161b, roughness: 0.92, metalness: 0.06 });
const pocketWallMaterial = new THREE.MeshStandardMaterial({ color: 0x06080b, roughness: 1, metalness: 0 });
const pocketMouthMaterial = new THREE.MeshStandardMaterial({ color: 0x050607, roughness: 1, metalness: 0, depthWrite: true });
const cornerPieceMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.4, metalness: 0.3 }); // Gold color

// Pocket design following reference image:
// - ALL pockets are FULL CIRCLES (including middle pockets)
// - Corner pockets have gold triangle decorations
// - Middle pockets are on LONG rails (z = ±halfL, x = 0)
const pocketRadiusCorner = 0.062;  // Corner pockets (slightly larger for easier potting)
const pocketRadiusSide = 0.068;    // Middle pockets (larger, easier to pot)
const pocketInset = 0.01;          // Small inset from actual corner
const pocketDepth = 0.08;

// Middle pockets on LONG rails (x = ±halfW, z = 0) - long rails run along Z axis
const pocketDefs = [
  // 4 corner pockets
  { kind: 'corner', x: -halfW + pocketInset, z: -halfL + pocketInset, r: pocketRadiusCorner, corner: 'bl' },
  { kind: 'corner', x: halfW - pocketInset, z: -halfL + pocketInset, r: pocketRadiusCorner, corner: 'br' },
  { kind: 'corner', x: -halfW + pocketInset, z: halfL - pocketInset, r: pocketRadiusCorner, corner: 'tl' },
  { kind: 'corner', x: halfW - pocketInset, z: halfL - pocketInset, r: pocketRadiusCorner, corner: 'tr' },
  // 2 middle pockets on LONG rails (x = ±halfW, z = 0)
  { kind: 'side', x: -halfW, z: 0, r: pocketRadiusSide },  // Left middle
  { kind: 'side', x: halfW, z: 0, r: pocketRadiusSide },   // Right middle
];

const pockets = pocketDefs.map((p) => {
  const isSide = p.kind === 'side';
  const root = new THREE.Group();
  root.position.set(p.x, 0, p.z);
  pocketGroup.add(root);

  if (isSide) {
    // MIDDLE POCKET: Half circle (semicircle) at table edge, opening toward center
    // Only the pocket opening is visible, no hole on the cloth
    const semicircleShape = new THREE.Shape();
    semicircleShape.absarc(0, 0, p.r, 0, Math.PI, false);
    const semicircleGeom = new THREE.ShapeGeometry(semicircleShape, 32);
    const mouth = new THREE.Mesh(semicircleGeom, pocketMouthMaterial);
    mouth.rotation.x = -Math.PI / 2;
    // Rotate based on which side: left pocket opens +X, right pocket opens -X
    mouth.rotation.z = p.x > 0 ? -Math.PI / 2 : Math.PI / 2;
    mouth.position.set(p.x, CLOTH_Y + 0.002, p.z);
    pocketGroup.add(mouth);

    // Half ring rim for middle pocket
    const rimShape = new THREE.Shape();
    rimShape.absarc(0, 0, p.r * 1.1, 0, Math.PI, false);
    const rimHole = new THREE.Path();
    rimHole.absarc(0, 0, p.r * 0.95, 0, Math.PI, false);
    rimShape.holes.push(rimHole);
    const rimGeom = new THREE.ShapeGeometry(rimShape, 32);
    const rim = new THREE.Mesh(rimGeom, pocketRimMaterial);
    rim.rotation.x = -Math.PI / 2;
    rim.rotation.z = p.x > 0 ? -Math.PI / 2 : Math.PI / 2;
    rim.position.set(p.x, CLOTH_Y + 0.003, p.z);
    pocketGroup.add(rim);
  } else {
    // CORNER POCKET: Full circle on cloth
    const mouth = new THREE.Mesh(
      new THREE.CircleGeometry(p.r, 40),
      pocketMouthMaterial
    );
    mouth.position.set(p.x, 0, p.z);
    stickToCloth(mouth, cloth, 0.002);
    pocketGroup.add(mouth);

    // Full rim around corner pocket
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(p.r * 0.95, p.r * 1.1, 48),
      pocketRimMaterial
    );
    rim.position.set(p.x, 0, p.z);
    stickToCloth(rim, cloth, 0.003);
    pocketGroup.add(rim);
  }

  // Pocket wall (cylinder going down) - half cylinder for side pockets
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(p.r * 0.92, p.r * 1.04, pocketDepth, 28, 1, true),
    pocketWallMaterial
  );
  wall.position.set(p.x, CLOTH_Y - pocketDepth / 2, p.z);
  pocketGroup.add(wall);

  return { kind: p.kind, position: new THREE.Vector3(p.x, CLOTH_Y, p.z), radius: p.r };
});

// Add pockets to scene (not tableGroup) so they render on top of rails
scene.add(pocketGroup);

console.log(
  '[POCKETS]',
  pockets.map((p, i) => ({
    id: i,
    x: Number(p.position.x.toFixed(3)),
    z: Number(p.position.z.toFixed(3)),
    r: Number(p.radius.toFixed(3)),
  }))
);

const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 24);
const shadowGeometry = new THREE.CircleGeometry(BALL_RADIUS * 1.25, 24);
const shadowMaterial = new THREE.MeshBasicMaterial({
  color: 0x000000,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});

function makeBallMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.15,
    roughness: 0.18,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    reflectivity: 0.6,
  });
}

const balls = [];
const initialPositions = new Map();

function createBall({ color, type, position, spot = null }) {
  const group = new THREE.Group();
  const sphere = new THREE.Mesh(ballGeometry, makeBallMaterial(color));
  sphere.castShadow = false;
  sphere.receiveShadow = false;

  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial.clone());
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -BALL_RADIUS + 0.0015;

  group.add(shadow, sphere);
  group.position.copy(position);
  scene.add(group);

  const ball = {
    type,
    group,
    sphere,
    shadow,
    position: position.clone(),
    velocity: new THREE.Vector3(),
    pocketed: false,
    spot: spot ? spot.clone() : null,
  };
  balls.push(ball);
  initialPositions.set(ball, position.clone());
  return ball;
}

const ballValues = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7,
};

const baulkLineZ = -TABLE_LENGTH * 0.28;
const dRadius = TABLE_WIDTH * 0.23;

const tableMarkMaterial = new THREE.MeshStandardMaterial({
  color: 0xeaf2ff,
  emissive: 0x2d4158,
  emissiveIntensity: 0.5,
  roughness: 0.25,
  metalness: 0.08,
});

const baulkLine = new THREE.Mesh(
  new THREE.PlaneGeometry(playW, 0.006),  // Full width to table edge
  tableMarkMaterial
);
baulkLine.position.set(0, CLOTH_Y, baulkLineZ);
stickToCloth(baulkLine, cloth, 0.003);
tableGroup.add(baulkLine);

// D arc: semicircle opening towards center of table (positive Z direction)
const dArc = new THREE.Mesh(
  new THREE.RingGeometry(dRadius - 0.0045, dRadius + 0.0045, 72, 1, 0, Math.PI),
  tableMarkMaterial
);
dArc.position.set(0, CLOTH_Y, baulkLineZ);
stickToCloth(dArc, cloth, 0.003);
tableGroup.add(dArc);

const spotMarkers = new THREE.Group();
const spotMaterial = new THREE.MeshStandardMaterial({
  color: 0xf4f8ff,
  emissive: 0x2c3e52,
  emissiveIntensity: 0.35,
  roughness: 0.3,
  metalness: 0.1,
});
const spotRadius = BALL_RADIUS * 0.18;
Object.values({
  yellow: new THREE.Vector3(-dRadius, CLOTH_Y, baulkLineZ),
  green: new THREE.Vector3(dRadius, CLOTH_Y, baulkLineZ),
  brown: new THREE.Vector3(0, CLOTH_Y, baulkLineZ),
  blue: new THREE.Vector3(0, CLOTH_Y, 0),
  pink: new THREE.Vector3(0, CLOTH_Y, TABLE_LENGTH * 0.21),
  black: new THREE.Vector3(0, CLOTH_Y, TABLE_LENGTH * 0.36),
}).forEach((p) => {
  const spot = new THREE.Mesh(new THREE.CircleGeometry(spotRadius, 24), spotMaterial);
  spot.position.set(p.x, p.y, p.z);
  stickToCloth(spot, cloth, 0.0025);
  spotMarkers.add(spot);
});
tableGroup.add(spotMarkers);

const cueStart = new THREE.Vector3(0, BALL_RADIUS, baulkLineZ - 0.14);
const cueBall = createBall({
  color: 0xf4f4f2,
  type: 'cue',
  position: cueStart,
});

const redStartZ = TABLE_LENGTH * 0.24;
const spacing = BALL_RADIUS * 2.05;
let redIndex = 0;
for (let row = 0; row < 5; row += 1) {
  for (let col = 0; col <= row; col += 1) {
    const x = (col - row / 2) * spacing;
    const z = redStartZ + row * spacing * 0.92;
    createBall({ color: 0xb61f25, type: 'red', position: new THREE.Vector3(x, BALL_RADIUS, z) });
    redIndex += 1;
    if (redIndex >= 15) break;
  }
  if (redIndex >= 15) break;
}

const colorSpots = {
  yellow: new THREE.Vector3(-dRadius, BALL_RADIUS, baulkLineZ),
  green: new THREE.Vector3(dRadius, BALL_RADIUS, baulkLineZ),
  brown: new THREE.Vector3(0, BALL_RADIUS, baulkLineZ),
  blue: new THREE.Vector3(0, BALL_RADIUS, 0),
  pink: new THREE.Vector3(0, BALL_RADIUS, TABLE_LENGTH * 0.21),
  black: new THREE.Vector3(0, BALL_RADIUS, TABLE_LENGTH * 0.36),
};

const coloredBalls = [
  { type: 'yellow', color: 0xf0d76a },
  { type: 'green', color: 0x3fc56b },
  { type: 'brown', color: 0x7a4b2b },
  { type: 'blue', color: 0x3a76d0 },
  { type: 'pink', color: 0xf2a0b8 },
  { type: 'black', color: 0x0f0f0f },
];

coloredBalls.forEach((ball) => {
  createBall({
    color: ball.color,
    type: ball.type,
    position: colorSpots[ball.type],
    spot: colorSpots[ball.type],
  });
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -CLOTH_Y);
const aimDirection = new THREE.Vector3(0, 0, 1);
const aimHit = new THREE.Vector3();

function createGuideLine({ color, opacity, dashSize, gapSize }) {
  const positions = new Float32Array(6);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineDashedMaterial({
    color,
    transparent: true,
    opacity,
    dashSize,
    gapSize,
  });
  const line = new THREE.Line(geometry, material);
  line.visible = false;
  line.computeLineDistances();
  scene.add(line);
  return { line, positions };
}

const aimPrimaryGuide = createGuideLine({
  color: 0xf6fbff,
  opacity: 0.82,
  dashSize: 0.065,
  gapSize: 0.05,
});
const aimExtendedGuide = createGuideLine({
  color: 0xdbe6f4,
  opacity: 0.32,
  dashSize: 0.03,
  gapSize: 0.11,
});
const objectPathGuide = createGuideLine({
  color: 0xf8be63,
  opacity: 0.74,
  dashSize: 0.055,
  gapSize: 0.05,
});
const railReflectGuide = createGuideLine({
  color: 0xb8e0ff,
  opacity: 0.58,
  dashSize: 0.045,
  gapSize: 0.08,
});
const cueBallPathGuide = createGuideLine({
  color: 0x88ddff,
  opacity: 0.68,
  dashSize: 0.04,
  gapSize: 0.06,
});

const ghostBallGuide = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS * 0.98, 28, 20),
  new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    roughness: 0.2,
    metalness: 0.06,
    clearcoat: 0.92,
    clearcoatRoughness: 0.14,
    transmission: 0.04,
    depthWrite: false,
  })
);
ghostBallGuide.visible = false;
ghostBallGuide.renderOrder = 3;
scene.add(ghostBallGuide);

const ghostBallWire = new THREE.Mesh(
  new THREE.SphereGeometry(BALL_RADIUS * 1.01, 16, 12),
  new THREE.MeshBasicMaterial({
    color: 0xcde5ff,
    wireframe: true,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  })
);
ghostBallGuide.add(ghostBallWire);

// Spin marker on ghost ball (shows where cue tip hits)
const spinMarkerGeom = new THREE.SphereGeometry(BALL_RADIUS * 0.12, 16, 12);
const spinMarkerMat = new THREE.MeshBasicMaterial({ color: 0xff4444, depthTest: false });
const spinMarkerMesh = new THREE.Mesh(spinMarkerGeom, spinMarkerMat);
spinMarkerMesh.renderOrder = 5;
ghostBallGuide.add(spinMarkerMesh);

function updateGhostBallSpinMarker() {
  // Position the red dot on ghost ball based on spin
  // spin.x = left/right, spin.y = top/bottom
  const offsetScale = BALL_RADIUS * 0.75;
  spinMarkerMesh.position.set(
    -spin.x * offsetScale,  // x: left is positive spin.x, so negate
    -spin.y * offsetScale,  // y: top is negative spin.y
    -BALL_RADIUS * 0.65     // z: on the front face (towards cue)
  );
}

const debugGroup = new THREE.Group();
let debugVisible = false;

function makeCircleLine(radius, color = 0x66ffd1) {
  const segments = 48;
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t) * radius, 0.002, Math.sin(t) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }));
}

pockets.forEach((pocket) => {
  const ring = makeCircleLine(pocket.radius, 0x66ffd1);
  ring.position.set(pocket.position.x, 0.002, pocket.position.z);
  debugGroup.add(ring);
});

const cueRadiusRing = makeCircleLine(BALL_RADIUS, 0xffdf6b);
cueRadiusRing.position.copy(cueBall.position);
debugGroup.add(cueRadiusRing);

debugGroup.visible = debugVisible;
scene.add(debugGroup);

const cueGroup = new THREE.Group();
cueGroup.name = 'cueGroup';
const cueStick = new THREE.Mesh(
  new THREE.CylinderGeometry(0.012, 0.018, 1.2, 14),
  new THREE.MeshStandardMaterial({ color: 0xd3a170, roughness: 0.42, metalness: 0.08 })
);
cueStick.rotation.x = Math.PI / 2;
cueStick.position.z = -0.05;
cueGroup.add(cueStick);
cueGroup.visible = false;
cueGroup.renderOrder = 2;
scene.add(cueGroup);

let scores = [0, 0];
let currentPlayer = 0;
let turn = 1;
let isCharging = false;
let power = 0;
let shotInProgress = false;
let shotElapsed = 0;
let firstHitType = null;
let shotPotted = [];
let foulThisShot = false;
let foulReason = '';
let expectingColor = false;
let freeBallAvailable = false;
let colorClearIndex = 0;
let aiEnabled = true;
let aiQueued = false;
let snookered = false;
let cueBallInHand = true;
let breakShotPending = true;
let cueBallPottedThisShot = false;
let stationaryTime = 0;
let turnState = 'PLACE_CUE';
let debugLogTimer = 0;
let dragStartPoint = new THREE.Vector3();
const chargeLockedAimDirection = new THREE.Vector3(0, 0, 1);
let fpsSmoothed = 60;
let isDraggingCueBall = false;
let foulDecisionPending = false;
let foulDecisionContext = null;
let showExtendedGuide = true;
let lastAimCollision = null;
const inputDebug = {
  lastMouseDown: '',
  lastMouseUp: '',
  lastMouseMove: '',
  lastBlockReason: '',
};
let activePointerId = null;
const spin = { x: 0, y: 0 };  // x: side spin (-1 to 1), y: top/bottom spin (-1 to 1)
let spinDragging = false;

const maxCharge = 1.25;
const minCharge = 0.2;
const powerMultiplier = 5.81;  // -20% from 7.2 (further reduced for accuracy)
const dragFullPowerDistance = 0.3;
const chargeRate = 0.9;
const cueSpeedCap = 6.78;      // -20% from 8.4 (further reduced for accuracy)
const rollingDragK = 0.609;    // +5% from 0.58 (less icy)
const linearDrag = 0.0168;     // +5% from 0.016
const cushionRestitution = 0.88;  // Increased from 0.86
const cushionTangentialFriction = 0.045;
const ballRestitution = 0.92;
const collisionEnergyRetention = 0.996;
const stopThreshold = 0.12;  // Increased from 0.02
const settledThreshold = 0.01;
const settledDuration = 0.5;
const collisionCellSize = BALL_RADIUS * 3.2;
const frictionExpK = 0.9;  // For exponential friction model


let statusTimer = 0;

function logRule(event, payload = {}) {
  console.log(`[RULE] ${event}`, payload);
}

function setStatus(text, seconds = 2.0) {
  statusEl.textContent = text;
  statusTimer = seconds;
}

function clearStatusIfNeeded(dt) {
  if (statusTimer > 0) {
    statusTimer -= dt;
    if (statusTimer <= 0) {
      statusEl.textContent = '';
    }
  }
}

function redsRemaining() {
  return balls.filter((ball) => ball.type === 'red' && !ball.pocketed).length;
}

function legalTargetTypes() {
  if (freeBallAvailable) return ['red'];
  const reds = redsRemaining();
  if (reds > 0) {
    return expectingColor
      ? ['yellow', 'green', 'brown', 'blue', 'pink', 'black']
      : ['red'];
  }
  const order = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  const target = order[colorClearIndex];
  return target ? [target] : [];
}

function targetValue() {
  const targets = legalTargetTypes();
  if (!targets.length) return 0;
  if (targets[0] === 'red') return 1;
  return ballValues[targets[0]] || 1;
}

function foulPointValue() {
  const firstContactValue = ballValues[firstHitType] || 0;
  let pottedMaxValue = 0;
  for (let i = 0; i < shotPotted.length; i += 1) {
    const v = ballValues[shotPotted[i].type] || 0;
    if (v > pottedMaxValue) pottedMaxValue = v;
  }
  return Math.max(4, targetValue(), firstContactValue, pottedMaxValue);
}

function isLineClear(from, to, ignoreBall = null) {
  const dir = to.clone().sub(from);
  const len = dir.length();
  if (len < 0.0001) return true;
  dir.normalize();
  for (const ball of balls) {
    if (ball.pocketed) continue;
    if (ball === ignoreBall) continue;
    const toBall = ball.position.clone().sub(from);
    const proj = toBall.dot(dir);
    if (proj <= 0 || proj >= len) continue;
    const closest = from.clone().add(dir.clone().multiplyScalar(proj));
    const distSq = closest.distanceToSquared(ball.position);
    if (distSq < (BALL_RADIUS * 2) ** 2) return false;
  }
  return true;
}

function isSnookeredNow() {
  const targets = legalTargetTypes();
  if (!targets.length) return false;
  for (const type of targets) {
    for (const ball of balls) {
      if (ball.type !== type || ball.pocketed) continue;
      if (isLineClear(cueBall.position, ball.position, ball)) {
        return false;
      }
    }
  }
  return true;
}

function currentTargetLabel() {
  if (freeBallAvailable) return 'Free ball';
  const reds = redsRemaining();
  if (reds > 0) {
    return expectingColor ? 'Color' : 'Red';
  }
  const order = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  return order[colorClearIndex] || 'Finish';
}

function updateUi() {
  scoreEl.textContent = `P1: ${scores[0]}  |  P2: ${scores[1]}  |  Mode: P1 vs AI`;
  turnEl.textContent = `Turn: ${turn}  |  Player: ${currentPlayer + 1}  |  Target: ${currentTargetLabel()}${snookered ? ' (Snookered)' : ''}  |  State: ${turnState}`;
  powerFillEl.style.width = `${Math.round(power * 100)}%`;

  if (stateNoteEl) {
    if (foulDecisionPending) {
      stateNoteEl.textContent = '犯規決策中：請按 Y/N 或點下面按鈕。';
    } else if (cueBallInHand) {
      stateNoteEl.textContent = '你有白球在手：拖放到 D 區，再按「確認白球位置」。';
    } else if (shotInProgress || stationaryTime < settledDuration || !allStopped()) {
      stateNoteEl.textContent = '球仍在移動中，請等待停球。';
    } else if (aiEnabled && currentPlayer === 1) {
      stateNoteEl.textContent = 'AI 回合中...';
    } else {
      stateNoteEl.textContent = '可出桿：LMB 拖拽儲力，放開擊球。';
    }
  }

  // 確認白球按鈕：只喺 cueBallInHand 時顯示
  if (confirmCueBtn) {
    if (cueBallInHand && !foulDecisionPending && currentPlayer === 0) {
      confirmCueBtn.classList.add('show');
    } else {
      confirmCueBtn.classList.remove('show');
    }
  }

  updateDecisionPanel();
  if (mobileControlsEl) {
    if (isTouchDevice && (turnState === 'AIMING' || turnState === 'AIMING_DRAG')) {
      mobileControlsEl.classList.add('show');
      mobileControlsEl.hidden = false;
    } else {
      mobileControlsEl.classList.remove('show');
      mobileControlsEl.hidden = true;
    }
  }
}

function updateDecisionPanel() {
  if (!decisionPanelEl || !decisionTextEl) return;
  if (!foulDecisionPending || !foulDecisionContext || foulDecisionContext.beneficiary !== 0) {
    decisionPanelEl.classList.remove('show');
    decisionPanelEl.hidden = true;
    return;
  }
  decisionPanelEl.hidden = false;
  decisionPanelEl.classList.add('show');
  decisionTextEl.textContent =
    `P${foulDecisionContext.fouler + 1} 犯規（${foulDecisionContext.reason}），` +
    `你獲 +${foulDecisionContext.points} 分。要接手，或要求對手續打？`;
}

function allStopped() {
  const threshold = stopThreshold * 0.8;
  return balls.every((ball) => ball.pocketed || ball.velocity.length() <= threshold);
}

function canTakeShot() {
  return !shotInProgress && !cueBallInHand && !foulDecisionPending && stationaryTime >= settledDuration;
}

function canTakeShotReason() {
  if (shotInProgress) return 'SHOT_IN_PROGRESS';
  if (cueBallInHand) return 'CUE_IN_HAND';
  if (foulDecisionPending) return 'FOUL_DECISION';
  if (stationaryTime < settledDuration) return `NOT_SETTLED(${stationaryTime.toFixed(3)})`;
  return 'OK';
}

function resetCamera() {
  camera.position.copy(cameraHome.position);
  controls.target.copy(cameraHome.target);
  controls.update();
}

function resetGame() {
  scores = [0, 0];
  currentPlayer = 0;
  turn = 1;
  power = 0;
  isCharging = false;
  shotInProgress = false;
  firstHitType = null;
  shotPotted = [];
  foulThisShot = false;
  foulReason = '';
  expectingColor = false;
  freeBallAvailable = false;
  colorClearIndex = 0;
  aiQueued = false;
  snookered = false;
  cueBallInHand = true;
  breakShotPending = true;
  cueBallPottedThisShot = false;
  stationaryTime = 0;
  turnState = 'PLACE_CUE';
  debugLogTimer = 0;
  isDraggingCueBall = false;
  foulDecisionPending = false;
  foulDecisionContext = null;
  statusEl.textContent = '';

  balls.forEach((ball) => {
    const initPos = initialPositions.get(ball);
    ball.position.copy(initPos);
    ball.velocity.set(0, 0, 0);
    ball.pocketed = false;
    ball.group.visible = true;
    ball.group.position.copy(initPos);
  });
  cueBall.position.copy(cueStart);
  cueBall.group.position.copy(cueStart);
  snookered = isSnookeredNow();
  updateAimLine();
  updateUi();
  setStatus('P1 vs AI: drag cue ball in D, then double-click to confirm break', 2.2);
}

function setGuideLinePoints(guide, start, end) {
  const p = guide.positions;
  p[0] = start.x;
  p[1] = start.y;
  p[2] = start.z;
  p[3] = end.x;
  p[4] = end.y;
  p[5] = end.z;
  guide.line.geometry.attributes.position.needsUpdate = true;
  guide.line.computeLineDistances();
  guide.line.visible = true;
}

function hideAimGuides() {
  aimPrimaryGuide.line.visible = false;
  aimExtendedGuide.line.visible = false;
  objectPathGuide.line.visible = false;
  railReflectGuide.line.visible = false;
  cueBallPathGuide.line.visible = false;
  ghostBallGuide.visible = false;
}

function getFirstCollision(maxLen) {
  const cx = cueBall.position.x;
  const cz = cueBall.position.z;
  const dir = aimDirection.clone().setY(0);
  if (dir.lengthSq() < 1e-8) return null;
  dir.normalize();

  const minX = -halfW + BALL_RADIUS;
  const maxX = halfW - BALL_RADIUS;
  const minZ = -halfL + BALL_RADIUS;
  const maxZ = halfL - BALL_RADIUS;

  let best = null;

  const considerRailHit = (t, normal) => {
    if (t <= 0 || t > maxLen) return;
    const hitX = cx + dir.x * t;
    const hitZ = cz + dir.z * t;
    if (hitX < minX - 1e-5 || hitX > maxX + 1e-5 || hitZ < minZ - 1e-5 || hitZ > maxZ + 1e-5) {
      return;
    }
    if (!best || t < best.t) {
      best = {
        kind: 'rail',
        t,
        point: new THREE.Vector3(hitX, BALL_RADIUS, hitZ),
        normal,
      };
    }
  };

  if (Math.abs(dir.x) > 1e-6) {
    considerRailHit((minX - cx) / dir.x, new THREE.Vector3(1, 0, 0));
    considerRailHit((maxX - cx) / dir.x, new THREE.Vector3(-1, 0, 0));
  }
  if (Math.abs(dir.z) > 1e-6) {
    considerRailHit((minZ - cz) / dir.z, new THREE.Vector3(0, 0, 1));
    considerRailHit((maxZ - cz) / dir.z, new THREE.Vector3(0, 0, -1));
  }

  const contactDist = BALL_RADIUS * 2;
  const contactDistSq = contactDist * contactDist;
  for (let i = 0; i < balls.length; i += 1) {
    const ball = balls[i];
    if (ball === cueBall || ball.pocketed) continue;

    const rx = ball.position.x - cx;
    const rz = ball.position.z - cz;
    const proj = rx * dir.x + rz * dir.z;
    if (proj < 0 || proj > maxLen) continue;

    const closestSq = rx * rx + rz * rz - proj * proj;
    if (closestSq > contactDistSq) continue;

    const thc = Math.sqrt(Math.max(0, contactDistSq - closestSq));
    let t = proj - thc;
    if (t <= 0) t = proj + thc;
    if (t <= 0 || t > maxLen) continue;

    if (!best || t < best.t) {
      best = {
        kind: 'ball',
        t,
        point: new THREE.Vector3(cx + dir.x * t, BALL_RADIUS, cz + dir.z * t),
        targetBall: ball,
      };
    }
  }

  return best;
}

function updateAimLine() {
  if (!allStopped() || cueBall.pocketed) {
    hideAimGuides();
    cueGroup.visible = false;
    lastAimCollision = null;
    return;
  }
  const inAimStage = !cueBallInHand && !foulDecisionPending;
  if (!inAimStage) {
    hideAimGuides();
    cueGroup.visible = false;
    lastAimCollision = null;
    return;
  }

  const guideY = BALL_RADIUS + 0.004;
  const start = cueBall.position.clone();
  start.y = guideY;
  const dir = aimDirection.clone().setY(0).normalize();
  const searchLen = 2.2 + power * 2.8;
  const extendLen = 5.8;
  const firstHit = getFirstCollision(searchLen);
  lastAimCollision = firstHit
    ? {
      kind: firstHit.kind,
      x: Number(firstHit.point.x.toFixed(4)),
      z: Number(firstHit.point.z.toFixed(4)),
      targetType: firstHit.targetBall ? firstHit.targetBall.type : null,
    }
    : null;

  const primaryEnd = firstHit
    ? firstHit.point.clone().setY(guideY)
    : start.clone().add(dir.clone().multiplyScalar(searchLen));
  setGuideLinePoints(aimPrimaryGuide, start, primaryEnd);

  if (showExtendedGuide) {
    const extendedEnd = start.clone().add(dir.clone().multiplyScalar(extendLen));
    setGuideLinePoints(aimExtendedGuide, start, extendedEnd);
  } else {
    aimExtendedGuide.line.visible = false;
  }

  objectPathGuide.line.visible = false;
  railReflectGuide.line.visible = false;
  cueBallPathGuide.line.visible = false;
  ghostBallGuide.visible = false;

  if (firstHit && firstHit.kind === 'ball' && firstHit.targetBall) {
    ghostBallGuide.visible = true;
    ghostBallGuide.position.set(firstHit.point.x, guideY, firstHit.point.z);
    updateGhostBallSpinMarker();

    const targetPos = firstHit.targetBall.position.clone();
    targetPos.y = guideY;

    // === 使用同 resolveBallCollisions 完全一致嘅碰撞公式 ===
    // 碰撞法線 = 物件球中心 - 白球碰撞時中心 (ghost ball 位置)
    const ghostPos = firstHit.point.clone().setY(0);
    const targetCenter = firstHit.targetBall.position.clone().setY(0);
    const normal = targetCenter.clone().sub(ghostPos);
    if (normal.lengthSq() < 1e-8) return;
    normal.normalize();
    const nx = normal.x;
    const nz = normal.z;

    // 白球入射方向 (dir 已經係單位向量，代表單位速度)
    // 假設白球速度 = dir，目標球靜止
    const cueVelX = dir.x;
    const cueVelZ = dir.z;
    const objVelX_before = 0;  // 目標球靜止
    const objVelZ_before = 0;

    // 相對速度 (同 resolveBallCollisions 一樣：b.velocity - a.velocity)
    const relVx = objVelX_before - cueVelX;
    const relVz = objVelZ_before - cueVelZ;
    const velAlongNormal = relVx * nx + relVz * nz;

    // 使用同實際物理完全一樣嘅 impulse 公式
    const impulse = (-(1 + ballRestitution) * velAlongNormal) / 2;

    // 白球碰撞後速度 (a.velocity -= n * impulse)
    const cueVelAfterX = cueVelX - nx * impulse;
    const cueVelAfterZ = cueVelZ - nz * impulse;

    // 物件球碰撞後速度 (b.velocity += n * impulse)
    const objVelAfterX = objVelX_before + nx * impulse;
    const objVelAfterZ = objVelZ_before + nz * impulse;

    // 考慮 spin.y 高低桿效果 (同 resolveBallCollisions 一樣)
    let cueFinalX = cueVelAfterX;
    let cueFinalZ = cueVelAfterZ;
    const spinMag = Math.abs(spin.y);
    if (spinMag > 0.05) {
      const spinForce = -spin.y * Math.abs(velAlongNormal) * 0.45;
      cueFinalX += nx * spinForce;
      cueFinalZ += nz * spinForce;
    }


    // 考慮 collisionEnergyRetention (同實際碰撞一致)
    const retention = collisionEnergyRetention;
    const objFinalX = objVelAfterX * retention;
    const objFinalZ = objVelAfterZ * retention;
    cueFinalX *= retention;
    cueFinalZ *= retention;

    // 繪製物件球軌跡（橙色）
    const objSpeed = Math.hypot(objFinalX, objFinalZ);
    if (objSpeed > 0.05) {
      const objDirX = objFinalX / objSpeed;
      const objDirZ = objFinalZ / objSpeed;
      const objLen = (showExtendedGuide ? 1.45 : 0.72) * objSpeed;
      const objEnd = targetPos.clone().add(new THREE.Vector3(objDirX * objLen, 0, objDirZ * objLen));
      setGuideLinePoints(objectPathGuide, targetPos, objEnd);
    }

    // 繪製白球碰撞後軌跡（淺藍色）
    const cueFinalSpeed = Math.hypot(cueFinalX, cueFinalZ);
    if (cueFinalSpeed > 0.05) {
      const cueAfterDir = new THREE.Vector3(cueFinalX / cueFinalSpeed, 0, cueFinalZ / cueFinalSpeed);
      const cueAfterLen = (showExtendedGuide ? 0.9 : 0.45) * cueFinalSpeed;
      const cueAfterStart = firstHit.point.clone().setY(guideY);
      const cueAfterEnd = cueAfterStart.clone().add(cueAfterDir.multiplyScalar(cueAfterLen));
      setGuideLinePoints(cueBallPathGuide, cueAfterStart, cueAfterEnd);
    }
  } else if (firstHit && firstHit.kind === 'rail' && firstHit.normal) {
    // 使用同 resolveCushion 一致嘅反彈公式
    const incoming = dir.clone();
    const n = firstHit.normal.clone();

    // 分解法線同切向分量
    const normalDot = incoming.dot(n);
    const normalComponent = n.clone().multiplyScalar(normalDot);
    const tangentComponent = incoming.clone().sub(normalComponent);

    // 應用 cushionRestitution 同 cushionTangentialFriction
    const reflectedNormal = normalComponent.multiplyScalar(-cushionRestitution);
    const reflectedTangent = tangentComponent.multiplyScalar(1 - cushionTangentialFriction);

    // 考慮側旋效果 (spin.x)
    const spinSideEffect = spin.x * 0.35;
    const vn = Math.abs(normalDot);

    // 計算反彈方向
    let reflected = reflectedNormal.add(reflectedTangent);

    // 側旋影響切向速度 (同 resolveCushion 一致)
    if (Math.abs(n.x) > 0.5) {
      // 撞左右邊
      reflected.z += (n.x > 0 ? 1 : -1) * spinSideEffect * vn;
    } else {
      // 撞上下邊
      reflected.x += (n.z > 0 ? -1 : 1) * spinSideEffect * vn;
    }

    if (reflected.lengthSq() > 1e-8) {
      reflected.normalize();
    }

    const reflLen = showExtendedGuide ? 1.2 : 0.62;
    const reflStart = firstHit.point.clone().setY(guideY);
    const reflEnd = reflStart.clone().add(reflected.multiplyScalar(reflLen));
    setGuideLinePoints(railReflectGuide, reflStart, reflEnd);
  }

  const stickLength = 1.2;
  const backOffset = (cueBallInHand ? 0.24 : 0.18) + power * 0.25;
  const stickCenter = cueBall.position
    .clone()
    .add(aimDirection.clone().multiplyScalar(-(stickLength / 2 + backOffset)));
  cueGroup.position.set(stickCenter.x, BALL_RADIUS + 0.02, stickCenter.z);
  cueGroup.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    aimDirection.clone().normalize()
  );
  cueGroup.visible = true;
}

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (raycaster.ray.intersectPlane(tablePlane, aimHit)) {
    if (isCharging) {
      const dragDistance = Math.min(dragFullPowerDistance, dragStartPoint.distanceTo(aimHit));
      power = THREE.MathUtils.clamp(dragDistance / dragFullPowerDistance, 0, 1);
      aimDirection.copy(chargeLockedAimDirection);
    } else {
      const delta = aimHit.clone().sub(cueBall.position).setY(0);
      if (delta.lengthSq() > 0.0001) {
        aimDirection.copy(delta.normalize());
      }
    }
  }
  updateAimLine();
}

function isCuePlacementClearOfBalls(pos) {
  for (let i = 0; i < balls.length; i += 1) {
    const ball = balls[i];
    if (ball === cueBall || ball.pocketed) continue;
    const dx = ball.position.x - pos.x;
    const dz = ball.position.z - pos.z;
    if (dx * dx + dz * dz < (BALL_RADIUS * 2.1) ** 2) return false;
  }
  return true;
}

function isValidCuePlacement(pos) {
  const inTable =
    pos.x > -halfW + BALL_RADIUS &&
    pos.x < halfW - BALL_RADIUS &&
    pos.z > -halfL + BALL_RADIUS &&
    pos.z < halfL - BALL_RADIUS;
  if (!inTable) return false;
  if (!isCuePlacementClearOfBalls(pos)) return false;
  const dx = pos.x - 0;
  const dz = pos.z - baulkLineZ;
  const inD = dx * dx + dz * dz <= dRadius * dRadius && pos.z <= baulkLineZ;
  return inD;
}

function clampCuePlacementToD(pos) {
  const clamped = pos.clone();
  const minX = -halfW + BALL_RADIUS;
  const maxX = halfW - BALL_RADIUS;
  const minZ = -halfL + BALL_RADIUS;
  const maxZ = baulkLineZ;
  clamped.x = THREE.MathUtils.clamp(clamped.x, minX, maxX);
  clamped.z = THREE.MathUtils.clamp(clamped.z, minZ, maxZ);

  const local = clamped.clone();
  local.x -= 0;
  local.z -= baulkLineZ;
  const len = Math.sqrt(local.x * local.x + local.z * local.z);
  if (len > dRadius) {
    const scale = dRadius / len;
    local.x *= scale;
    local.z *= scale;
  }
  clamped.x = local.x;
  clamped.z = local.z + baulkLineZ;
  clamped.y = BALL_RADIUS;
  return clamped;
}

function findNearestValidCuePlacement(pos) {
  const base = clampCuePlacementToD(pos);
  if (isValidCuePlacement(base)) return base;
  const maxRadius = 0.4;
  const step = BALL_RADIUS * 0.8;
  for (let r = step; r <= maxRadius; r += step) {
    for (let i = 0; i < 18; i += 1) {
      const a = (i / 18) * Math.PI * 2;
      const probe = base.clone().add(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      const clamped = clampCuePlacementToD(probe);
      if (isValidCuePlacement(clamped)) return clamped;
    }
  }
  return base;
}

function isPointerOnCueBall(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(cueBall.sphere, false);
  return hits.length > 0;
}

function updateCueBallPlacementFromPointer(event) {
  updatePointer(event);
  if (!raycaster.ray.intersectPlane(tablePlane, aimHit)) return false;
  const rawPos = new THREE.Vector3(aimHit.x, BALL_RADIUS, aimHit.z);
  const placePos = findNearestValidCuePlacement(rawPos);
  cueBall.position.copy(placePos);
  cueBall.group.position.copy(placePos);
  cueBall.velocity.set(0, 0, 0);
  return isValidCuePlacement(placePos);
}

function startShot() {
  shotInProgress = true;
  shotElapsed = 0;
  cueBallPottedThisShot = false;
  firstHitType = null;
  shotPotted = [];
  foulThisShot = false;
  foulReason = '';
  logRule('shot_start', {
    player: currentPlayer + 1,
    target: currentTargetLabel(),
    cueBall: { x: Number(cueBall.position.x.toFixed(3)), z: Number(cueBall.position.z.toFixed(3)) },
  });
}

function beginFoulDecision({
  fouler,
  beneficiary,
  points,
  reason,
  cueBallInHandAfterFoul,
  cueBallPotted,
  breakShot,
}) {
  foulDecisionPending = true;
  foulDecisionContext = {
    fouler,
    beneficiary,
    points,
    reason,
    cueBallInHandAfterFoul,
    cueBallPotted,
    breakShot,
  };
  cueBallInHand = cueBallInHandAfterFoul;
  freeBallAvailable = false;
  snookered = false;
  stationaryTime = cueBallInHand ? 0 : settledDuration;
  currentPlayer = beneficiary;
  turn += 1;
  turnState = 'FOUL_DECISION';
  setStatus(
    `Foul by P${fouler + 1} (+${points} to P${beneficiary + 1}) • Y=take turn • N=ask P${fouler + 1} continue`,
    4
  );
  logRule('foul', {
    reason,
    fouler: fouler + 1,
    awardedTo: beneficiary + 1,
    points,
    breakShot,
    cueBallPotted,
    cuePlacement: cueBallInHand ? 'D' : 'NONE',
    decisionPending: true,
  });
}

function applyFoulDecision(forceFoulerContinue) {
  if (!foulDecisionPending || !foulDecisionContext) return;
  const ctx = foulDecisionContext;

  // IMPORTANT: Reset expectingColor on foul - next player always starts on red (if reds remain)
  expectingColor = false;

  if (forceFoulerContinue) {
    currentPlayer = ctx.fouler;
    freeBallAvailable = false;
    snookered = !cueBallInHand && isSnookeredNow();
    setStatus(`Decision: P${ctx.beneficiary + 1} asks P${ctx.fouler + 1} to continue`, 2);
    logRule('foul_decision', {
      chooser: ctx.beneficiary + 1,
      mode: 'FORCE_FOULER_CONTINUE',
      nextShooter: ctx.fouler + 1,
    });
  } else {
    currentPlayer = ctx.beneficiary;
    snookered = !cueBallInHand && isSnookeredNow();
    freeBallAvailable = snookered;
    setStatus(
      `Decision: P${ctx.beneficiary + 1} takes turn${freeBallAvailable ? ' (Free ball)' : ''}`,
      2
    );
    logRule('foul_decision', {
      chooser: ctx.beneficiary + 1,
      mode: 'TAKE_TURN',
      nextShooter: ctx.beneficiary + 1,
      freeBall: freeBallAvailable,
    });
  }
  stationaryTime = cueBallInHand ? 0 : settledDuration;
  foulDecisionPending = false;
  foulDecisionContext = null;
  aiQueued = aiEnabled && currentPlayer === 1 && !cueBallInHand;
  updateAimLine();
  updateUi();
}

function endShot() {
  shotInProgress = false;
  const wasBreakShot = breakShotPending;
  breakShotPending = false;
  const reds = redsRemaining();

  const scored = shotPotted.map((ball) => ball.type);
  const pottedReds = scored.filter((type) => type === 'red').length;
  const pottedColors = scored.filter((type) => type !== 'red' && type !== 'cue');

  if (foulThisShot) {
    // 修正：在 Red/Color 循環中（含最後紅波後），入彩波必須 Respot
    if (pottedColors.length > 0) {
      // 只要未進入清台階段（或者清台階段打錯波），都需要 Respot
      // 簡單嚟講：只有在清台階段打入目標彩波時才不需要 Respot
      // 為了安全，如果 reds > 0 或 expectingColor 為真，則肯定 Respot
      if (reds > 0 || expectingColor) {
        respotColors(pottedColors);
      }
    }
    expectingColor = false; // 犯規導致 Break 結束，重置目標為紅波（或 Yellow）
    const foulPoints = foulPointValue();
    const foulerIndex = currentPlayer;
    const awardedIndex = 1 - foulerIndex;
    scores[awardedIndex] += foulPoints;
    beginFoulDecision({
      fouler: foulerIndex,
      beneficiary: awardedIndex,
      points: foulPoints,
      reason: foulReason,
      cueBallInHandAfterFoul: cueBallPottedThisShot || wasBreakShot,
      cueBallPotted: cueBallPottedThisShot,
      breakShot: wasBreakShot,
    });
    updateUi();
    return;
  }

  if (freeBallAvailable) {
    if (scored.length > 0) {
      scores[currentPlayer] += 1;
      setStatus('Free ball potted +1', 1.6);
      if (pottedColors.length > 0 && reds > 0) {
        respotColors(pottedColors);
      }
      freeBallAvailable = false;
      expectingColor = reds > 0;
      snookered = false;
      logRule('freeball_scored', { player: currentPlayer + 1, points: 1 });
    } else {
      freeBallAvailable = false;
      currentPlayer = 1 - currentPlayer;
      turn += 1;
      snookered = isSnookeredNow();
      logRule('freeball_miss', { nextPlayer: currentPlayer + 1 });
    }
    updateUi();
    return;
  }

  // 修正：打入最後紅波後 (reds=0, pottedReds>0) 或打最後彩波 (reds=0, expectingColor=true) 仍應進入此邏輯
  if (reds > 0 || expectingColor || pottedReds > 0) {
    if (!expectingColor) {
      if (pottedReds > 0) {
        scores[currentPlayer] += pottedReds;
        expectingColor = true;
        snookered = false;
        setStatus(`Red +${pottedReds}`, 1.2);
        logRule('red_scored', { player: currentPlayer + 1, points: pottedReds });
      } else {
        currentPlayer = 1 - currentPlayer;
        turn += 1;
        snookered = isSnookeredNow();
        logRule('red_miss_turn_change', { nextPlayer: currentPlayer + 1 });
      }
    } else {
      if (pottedColors.length > 0) {
        const colorScore = pottedColors.reduce((acc, type) => acc + ballValues[type], 0);
        scores[currentPlayer] += colorScore;
        // 在 Red/Color 循環階段（包括最後一粒紅波後的彩波），彩波都要執返起來
        respotColors(pottedColors);
        expectingColor = false;
        snookered = false;
        setStatus(`Color +${colorScore}`, 1.2);
        logRule('color_scored', { player: currentPlayer + 1, points: colorScore, colors: pottedColors });
      } else {
        // Color attempt missed: next player is back on red (if reds remain).
        expectingColor = false;
        currentPlayer = 1 - currentPlayer;
        turn += 1;
        snookered = isSnookeredNow();
        logRule('color_miss_turn_change', { nextPlayer: currentPlayer + 1 });
      }
    }
  } else {
    const order = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
    const targetColor = order[colorClearIndex];
    if (targetColor && pottedColors.includes(targetColor)) {
      scores[currentPlayer] += ballValues[targetColor];
      colorClearIndex += 1;
      snookered = false;
      setStatus(`${targetColor} cleared`, 1.2);
      logRule('clear_color', { player: currentPlayer + 1, color: targetColor, points: ballValues[targetColor] });
    } else {
      currentPlayer = 1 - currentPlayer;
      turn += 1;
      snookered = isSnookeredNow();
      logRule('clear_color_miss_turn_change', { nextPlayer: currentPlayer + 1 });
    }
  }

  updateUi();
  if (aiEnabled && currentPlayer === 1) {
    aiQueued = true;
  }
}

function respotColors(types) {
  types.forEach((type) => {
    const ball = balls.find((b) => b.type === type);
    if (!ball || !ball.spot) return;
    const target = ball.spot.clone();
    let offset = 0;
    while (offset < 4) {
      const clear = balls.every((other) => {
        if (other === ball || other.pocketed) return true;
        const dx = other.position.x - target.x;
        const dz = other.position.z - target.z;
        return dx * dx + dz * dz > (BALL_RADIUS * 2) ** 2;
      });
      if (clear) break;
      offset += 1;
      target.z += BALL_RADIUS * 1.5;
    }
    ball.position.copy(target);
    ball.group.position.copy(target);
    ball.pocketed = false;
    ball.group.visible = true;
    ball.velocity.set(0, 0, 0);
    logRule('respot', {
      color: type,
      x: Number(target.x.toFixed(3)),
      z: Number(target.z.toFixed(3)),
    });
  });
}

function isLegalFirstHit(type) {
  if (freeBallAvailable) return true;
  const reds = redsRemaining();
  if (reds > 0) {
    return expectingColor ? type !== 'red' && type !== 'cue' : type === 'red';
  }
  const order = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  return type === order[colorClearIndex];
}

function shootCueBall() {
  if (!canTakeShot() || cueBall.pocketed || cueBallInHand) {
    inputDebug.lastBlockReason = `shootBlocked reason=${canTakeShotReason()} cuePocketed=${cueBall.pocketed} cueInHand=${cueBallInHand}`;
    return;
  }
  const strength = minCharge + power * (maxCharge - minCharge);
  const impulse = aimDirection.clone().multiplyScalar(strength * powerMultiplier);
  cueBall.velocity.add(impulse);
  if (cueBall.velocity.length() > cueSpeedCap) {
    cueBall.velocity.setLength(cueSpeedCap);
  }
  isCharging = false;
  power = 0;
  stationaryTime = 0;
  turnState = 'BALLS_MOVING';
  startShot();
  updateUi();
}

function queueAiShot() {
  if (!aiQueued || !allStopped()) return;
  if (shotInProgress) return;
  if (cueBallInHand) return;
  aiQueued = false;
  const targets = legalTargetTypes();
  const targetBalls = balls.filter(
    (ball) => targets.includes(ball.type) && !ball.pocketed
  );

  let bestShot = null;
  for (const ball of targetBalls) {
    for (const pocket of pockets) {
      const toPocket = pocket.position.clone().sub(ball.position).setY(0);
      const distPocket = toPocket.length();
      if (distPocket < 0.01) continue;
      const pocketDir = toPocket.clone().normalize();
      const contactPoint = ball.position.clone().sub(pocketDir.multiplyScalar(BALL_RADIUS * 2));
      if (!isLineClear(ball.position, pocket.position, ball)) continue;
      if (!isLineClear(cueBall.position, contactPoint, ball)) continue;

      const distCue = cueBall.position.distanceTo(contactPoint);
      const base = ball.type === 'red' ? 60 : (ballValues[ball.type] || 1) * 12;
      const score = base - distCue * 3.5 - distPocket * 1.5;
      if (!bestShot || score > bestShot.score) {
        bestShot = { ball, pocket, contactPoint, score };
      }
    }
  }

  if (bestShot) {
    const dir = bestShot.contactPoint.clone().sub(cueBall.position).setY(0).normalize();
    aimDirection.copy(dir);
    power = Math.min(0.85, Math.max(0.45, 0.5 + bestShot.score * 0.002));
    shootCueBall();
    return;
  }

  const fallback = targetBalls[0] || balls.find((ball) => ball.type !== 'cue' && !ball.pocketed);
  if (!fallback) return;
  const dir = fallback.position.clone().sub(cueBall.position).setY(0).normalize();
  aimDirection.copy(dir);
  power = 0.35;
  shootCueBall();
}

function queueAiCuePlacement() {
  if (!aiEnabled || currentPlayer !== 1) return;
  if (!cueBallInHand || shotInProgress || foulDecisionPending) return;

  const candidates = [
    new THREE.Vector3(0, BALL_RADIUS, baulkLineZ - dRadius * 0.55),
    new THREE.Vector3(-dRadius * 0.45, BALL_RADIUS, baulkLineZ - dRadius * 0.45),
    new THREE.Vector3(dRadius * 0.45, BALL_RADIUS, baulkLineZ - dRadius * 0.45),
    new THREE.Vector3(0, BALL_RADIUS, baulkLineZ - dRadius * 0.2),
  ];

  let placed = null;
  for (let i = 0; i < candidates.length; i += 1) {
    const probe = findNearestValidCuePlacement(candidates[i]);
    if (isValidCuePlacement(probe)) {
      placed = probe;
      break;
    }
  }
  if (!placed) {
    placed = findNearestValidCuePlacement(cueStart.clone());
  }

  cueBall.position.copy(placed);
  cueBall.group.position.copy(placed);
  cueBall.velocity.set(0, 0, 0);
  cueBallInHand = false;
  stationaryTime = settledDuration;
  turnState = 'AIMING';
  setStatus('AI placed cue ball in D', 0.8);
  logRule('ai_cue_placement', {
    x: Number(placed.x.toFixed(3)),
    z: Number(placed.z.toFixed(3)),
  });
  updateAimLine();
  updateUi();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen().catch(() => { });
  }
}

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// 檢測觸控位置係枱面內定枱外（包括少少邊緣範圍）
function isTouchOnTable(e) {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  const tempPointer = new THREE.Vector2(x, y);
  const tempRaycaster = new THREE.Raycaster();
  tempRaycaster.setFromCamera(tempPointer, camera);
  const hitPoint = new THREE.Vector3();
  if (!tempRaycaster.ray.intersectPlane(tablePlane, hitPoint)) return false;
  // 枱面邊界（加少少緩衝）
  const margin = 0.15;
  return Math.abs(hitPoint.x) <= halfW + margin && Math.abs(hitPoint.z) <= halfL + margin;
}

// 手機模式：枱外觸控啟用視角旋轉
let isRotatingCamera = false;

// 手機瞄準/儲力狀態（類似 2D 版）
let mobileInputState = 'idle';  // 'idle' | 'aiming' | 'powering'
let mobilePullStart = new THREE.Vector3();  // 開始儲力嘅位置
let mobileAimLocked = false;  // 瞄準方向已鎖定

// 手機模式：預防誤觸控制區（下半部）
function isTouchInControlArea(e) {
  return e.clientY > window.innerHeight * 0.75;
}

function handlePrimaryPointerDown(e) {
  inputDebug.lastMouseDown = `btn=${e.button} x=${e.clientX} y=${e.clientY} state=${turnState}`;
  if (e.button !== 0) return;
  if (foulDecisionPending) return;

  // 手機模式處理
  if (isTouchDevice) {
    // 1. 如果觸控點在下半部控制區 -> 唔處理（讓 HTML 元素接收事件）
    // 或者如果在上半部但係枱外 -> 旋轉視角
    const onTable = isTouchOnTable(e);
    const inControlArea = isTouchInControlArea(e);

    if (inControlArea || !onTable) {
      isRotatingCamera = true;
      controls.enabled = true;
      return;
    }
  }

  // 枱面內操作
  activePointerId = e.pointerId ?? 0;
  if (typeof canvas.setPointerCapture === 'function' && e.pointerId !== undefined) {
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) { }
  }

  if (cueBallInHand) {
    isDraggingCueBall = true;
    turnState = 'PLACE_CUE_DRAG';
    updateCueBallPlacementFromPointer(e);
    setStatus('拖動白球到 D 區...', 0.6);
    return;
  }

  updatePointer(e);
  const reason = canTakeShotReason();
  if (canTakeShot() && (!aiEnabled || currentPlayer === 0)) {
    if (isTouchDevice) {
      // 手機模式：只瞄準，唔儲力
      if (raycaster.ray.intersectPlane(tablePlane, aimHit)) {
        // 瞄準方向 = 白球 → 觸控點
        aimDirection.set(
          aimHit.x - cueBall.position.x,
          0,
          aimHit.z - cueBall.position.z
        ).normalize();
        chargeLockedAimDirection.copy(aimDirection);

        mobileInputState = 'aiming';
        isCharging = false;
        power = 0;
        turnState = 'AIMING_DRAG';
        updateAimLine();
      }


    } else {
      // 電腦版保持原本行為
      isCharging = true;
      power = 0;
      chargeLockedAimDirection.copy(aimDirection);
      if (raycaster.ray.intersectPlane(tablePlane, aimHit)) {
        dragStartPoint.copy(aimHit);
      } else {
        dragStartPoint.copy(cueBall.position);
      }
      turnState = 'AIMING_DRAG';
    }
  } else {
    inputDebug.lastBlockReason = `pointerDownBlocked reason=${reason} aiEnabled=${aiEnabled} player=${currentPlayer + 1}`;
  }
}

// 新的手機 Move 邏輯：只瞄準，不儲力
function handlePrimaryPointerMove(e) {
  inputDebug.lastMouseMove = `x=${e.clientX} y=${e.clientY} dragCue=${isDraggingCueBall} cueInHand=${cueBallInHand}`;
  if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) {
    return;
  }
  if (cueBallInHand && isDraggingCueBall) {
    updateCueBallPlacementFromPointer(e);
    return;
  }

  // 手機模式：只動態瞄準，完全移除儲力邏輯
  if (isTouchDevice && turnState === 'AIMING_DRAG') {
    updatePointer(e);
    if (raycaster.ray.intersectPlane(tablePlane, aimHit)) {
      // 瞄準方向 = 白球 → 觸控點
      aimDirection.set(
        aimHit.x - cueBall.position.x,
        0,
        aimHit.z - cueBall.position.z
      ).normalize();
      chargeLockedAimDirection.copy(aimDirection);
      updateAimLine();
    }
    return;
  }

  updatePointer(e);
  if (turnState === 'AIMING_DRAG' && !isTouchDevice) {
    // 電腦版儲力邏輯保持不變
    if (raycaster.ray.intersectPlane(tablePlane, aimHit)) {
      const dragVec = new THREE.Vector2(aimHit.x - dragStartPoint.x, aimHit.z - dragStartPoint.z);
      const aimVec2D = new THREE.Vector2(chargeLockedAimDirection.x, chargeLockedAimDirection.z);
      const pullBack = -(dragVec.x * aimVec2D.x + dragVec.y * aimVec2D.y);
      power = Math.min(1, Math.max(0, pullBack * 4));
    }
  }
}

function handlePrimaryPointerMove_OLD(e) {
  inputDebug.lastMouseMove = `x=${e.clientX} y=${e.clientY} dragCue=${isDraggingCueBall} cueInHand=${cueBallInHand}`;
  if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) {
    return;
  }
  if (cueBallInHand && isDraggingCueBall) {
    updateCueBallPlacementFromPointer(e);
    return;
  }

  // 手機模式：動態瞄準 + 向後拉儲力
  if (isTouchDevice && turnState === 'AIMING_DRAG') {
    updatePointer(e);
    if (raycaster.ray.intersectPlane(tablePlane, aimHit)) {
      if (!mobileAimLocked) {
        // 瞄準階段：手指指向邊就瞄準邊
        // 計算拖動方向同距離
        const dragVec = new THREE.Vector2(
          aimHit.x - mobilePullStart.x,
          aimHit.z - mobilePullStart.z
        );
        const dragDist = dragVec.length();

        // 計算向後拉嘅距離（沿瞄準方向相反）
        const aimVec2D = new THREE.Vector2(
          chargeLockedAimDirection.x,
          chargeLockedAimDirection.z
        );
        const pullBack = -(dragVec.x * aimVec2D.x + dragVec.y * aimVec2D.y);

        if (pullBack > 0.03) {  // 向後拉超過 3cm = 開始儲力
          mobileAimLocked = true;
          mobileInputState = 'powering';
          isCharging = true;
          setStatus('儲力中...放手出桿', 0.5);
        } else if (dragDist > 0.02) {
          // 向前/側面拖動 = 微調瞄準方向
          aimDirection.set(
            aimHit.x - cueBall.position.x,
            0,
            aimHit.z - cueBall.position.z
          ).normalize();
          chargeLockedAimDirection.copy(aimDirection);
          updateAimLine();
        }
      }

      if (mobileAimLocked && isCharging) {
        // 儲力階段：計算 power（沿瞄準線向後拉嘅距離）
        const dragVec = new THREE.Vector2(
          aimHit.x - mobilePullStart.x,
          aimHit.z - mobilePullStart.z
        );
        const aimVec2D = new THREE.Vector2(
          chargeLockedAimDirection.x,
          chargeLockedAimDirection.z
        );
        const pullBack = -(dragVec.x * aimVec2D.x + dragVec.y * aimVec2D.y);
        // 將拉動距離轉換成 power (0-1)
        power = Math.min(1, Math.max(0, pullBack * 4));  // 0.25m = 全力
      }
    }
    return;
  }

  updatePointer(e);
}

function handlePrimaryPointerUp(e) {
  inputDebug.lastMouseUp = `btn=${e.button} x=${e.clientX} y=${e.clientY} state=${turnState} charging=${isCharging}`;
  if (e.button !== 0) return;

  // 重置視角旋轉模式
  if (isRotatingCamera) {
    isRotatingCamera = false;
    return;
  }

  if (typeof canvas.releasePointerCapture === 'function' && e.pointerId !== undefined) {
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (_) { }
  }
  activePointerId = null;

  if (cueBallInHand && isDraggingCueBall) {
    isDraggingCueBall = false;
    turnState = 'PLACE_CUE';
    setStatus('撳「確認白球位置」按鈕完成', 1.2);
    return;
  }

  // 手機模式：放手只重置狀態，唔出桿（出桿由按鈕負責）
  if (isTouchDevice && turnState === 'AIMING_DRAG') {
    turnState = 'AIMING';
    mobileInputState = 'idle';
    return;
  }

  if (isCharging) {
    shootCueBall();
  }
}

if ('PointerEvent' in window) {
  canvas.addEventListener('pointerdown', handlePrimaryPointerDown);
  window.addEventListener('pointermove', handlePrimaryPointerMove);
  window.addEventListener('pointerup', handlePrimaryPointerUp);
  window.addEventListener('pointercancel', () => {
    activePointerId = null;
    isDraggingCueBall = false;
    isCharging = false;
  });
} else {
  canvas.addEventListener('mousedown', (e) =>
    handlePrimaryPointerDown({ ...e, pointerId: 0 })
  );
  window.addEventListener('mousemove', (e) =>
    handlePrimaryPointerMove({ ...e, pointerId: 0 })
  );
  window.addEventListener('mouseup', (e) =>
    handlePrimaryPointerUp({ ...e, pointerId: 0 })
  );
}
canvas.addEventListener('dblclick', (e) => {
  if (!cueBallInHand) return;
  updateCueBallPlacementFromPointer(e);
  if (!isValidCuePlacement(cueBall.position)) {
    setStatus('Invalid cue placement. Keep cue ball inside D.', 1.6);
    return;
  }
  cueBallInHand = false;
  isDraggingCueBall = false;
  stationaryTime = settledDuration;
  turnState = 'AIMING';
  setStatus('Cue ball confirmed (D). Drag to shoot.', 1.2);
  logRule('cue_placed_confirmed', {
    x: Number(cueBall.position.x.toFixed(3)),
    z: Number(cueBall.position.z.toFixed(3)),
    mode: 'D',
  });
  updateAimLine();
});

if (decisionTakeBtn) {
  decisionTakeBtn.addEventListener('click', () => {
    applyFoulDecision(false);
  });
}
if (decisionForceBtn) {
  decisionForceBtn.addEventListener('click', () => {
    applyFoulDecision(true);
  });
}

// 確認白球位置按鈕 (方便手機操作)
if (confirmCueBtn) {
  confirmCueBtn.addEventListener('click', () => {
    if (!cueBallInHand) return;
    if (!isValidCuePlacement(cueBall.position)) {
      setStatus('Invalid cue placement. Keep cue ball inside D.', 1.6);
      return;
    }
    cueBallInHand = false;
    isDraggingCueBall = false;
    stationaryTime = settledDuration;
    turnState = 'AIMING';
    setStatus('白球位置已確認，可以出桿。', 1.2);
    logRule('cue_placed_confirmed', {
      x: Number(cueBall.position.x.toFixed(3)),
      z: Number(cueBall.position.z.toFixed(3)),
      mode: 'D',
    });
    updateUi();
    updateAimLine();
  });
}

// 手機儲力按鈕事件
if (mobilePowerBtn) {
  let powerInterval = null;
  let powerDirection = 1; // 1: increasing, -1: decreasing

  const startCharging = (e) => {
    e.preventDefault();
    if (!canTakeShot()) return;
    if (aiEnabled && currentPlayer !== 0) return;

    isCharging = true;
    power = 0;
    powerDirection = 1;
    mobilePowerBtn.classList.add('charging');
    mobilePowerBtn.textContent = '放手出桿';

    // 鎖定瞄準方向
    chargeLockedAimDirection.copy(aimDirection);

    if (powerInterval) clearInterval(powerInterval);
    powerInterval = setInterval(() => {
      power += 0.02 * powerDirection;
      if (power >= 1) {
        power = 1;
        powerDirection = -1;
      } else if (power <= 0) {
        power = 0;
        powerDirection = 1;
      }
      // 更新 UI (powerFillEl 會喺 updateUi 更新，呢度主要更新按鈕視覺)
      updateUi();
    }, 16);
  };

  const stopChargingAndShoot = (e) => {
    e.preventDefault();
    if (!isCharging) return;

    if (powerInterval) {
      clearInterval(powerInterval);
      powerInterval = null;
    }

    mobilePowerBtn.classList.remove('charging');
    mobilePowerBtn.textContent = '撳住儲力';

    shootCueBall();
    isCharging = false;
    power = 0;
  };

  mobilePowerBtn.addEventListener('pointerdown', startCharging);
  mobilePowerBtn.addEventListener('touchstart', startCharging);

  mobilePowerBtn.addEventListener('pointerup', stopChargingAndShoot);
  mobilePowerBtn.addEventListener('touchend', stopChargingAndShoot);
  mobilePowerBtn.addEventListener('pointerleave', stopChargingAndShoot);
}

// Spin control UI handlers
function updateSpinMarker() {
  if (!spinMarkerEl || !spinControlEl) return;
  const rect = spinControlEl.getBoundingClientRect();
  const radius = rect.width / 2;
  const offsetX = spin.x * (radius - 5);
  const offsetY = spin.y * (radius - 5);
  spinMarkerEl.style.left = `calc(50% + ${offsetX}px)`;
  spinMarkerEl.style.top = `calc(50% + ${offsetY}px)`;
}

if (spinControlEl) {
  const handleSpinPointer = (e) => {
    const rect = spinControlEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2 - 5;
    let dx = (e.clientX - cx) / radius;
    let dy = (e.clientY - cy) / radius;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) { dx /= dist; dy /= dist; }
    spin.x = dx;
    spin.y = dy;
    updateSpinMarker();
  };

  spinControlEl.addEventListener('pointerdown', (e) => {
    spinDragging = true;
    spinControlEl.setPointerCapture(e.pointerId);
    handleSpinPointer(e);
  });

  spinControlEl.addEventListener('pointermove', (e) => {
    if (spinDragging) handleSpinPointer(e);
  });

  spinControlEl.addEventListener('pointerup', (e) => {
    spinDragging = false;
    spinControlEl.releasePointerCapture(e.pointerId);
  });

  spinControlEl.addEventListener('pointercancel', (e) => {
    spinDragging = false;
  });
}

if (spinResetBtn) {
  spinResetBtn.addEventListener('click', () => {
    spin.x = 0;
    spin.y = 0;
    updateSpinMarker();
  });
}

window.addEventListener('keydown', (e) => {
  if (foulDecisionPending && (e.code === 'KeyY' || e.code === 'Enter' || e.code === 'Space')) {
    applyFoulDecision(false);
    return;
  }
  if (foulDecisionPending && e.code === 'KeyN') {
    applyFoulDecision(true);
    return;
  }
  if (e.code === 'KeyR') {
    resetGame();
  }
  if (e.code === 'KeyC') {
    resetCamera();
  }
  if (e.code === 'KeyD') {
    debugVisible = !debugVisible;
    debugGroup.visible = debugVisible;
    worldAxes.visible = debugVisible;
    tableAxes.visible = debugVisible;
    setStatus(`Debug ${debugVisible ? 'ON' : 'OFF'}`, 1.2);
  }
  if (e.code === 'KeyF') {
    toggleFullscreen();
  }
  if (e.code === 'KeyG') {
    showExtendedGuide = !showExtendedGuide;
    setStatus(`Guide ${showExtendedGuide ? 'Extended' : 'Basic'}`, 1.2);
    updateAimLine();
  }
});

document.addEventListener('fullscreenchange', () => {
  onResize();
});

function resolveCushion(ball) {
  const spinSideEffect = ball.type === 'cue' ? spin.x * 0.35 : 0;
  const bx = ball.position.x;
  const bz = ball.position.z;

  // Check if ball is near any pocket (skip cushion collision if so)
  const isNearPocket = pockets.some((p) => {
    const dx = bx - p.position.x;
    const dz = bz - p.position.z;
    return Math.hypot(dx, dz) < p.radius + BALL_RADIUS * 0.5;
  });

  if (isNearPocket) return;  // Let ball fall into pocket instead of bouncing

  if (ball.position.x < -halfW + BALL_RADIUS) {
    ball.position.x = -halfW + BALL_RADIUS;
    if (ball.velocity.x < 0) {
      const vn = Math.abs(ball.velocity.x);
      ball.velocity.x *= -cushionRestitution;
      ball.velocity.z *= 1 - cushionTangentialFriction;
      ball.velocity.z -= spinSideEffect * vn;
    }
  }
  if (ball.position.x > halfW - BALL_RADIUS) {
    ball.position.x = halfW - BALL_RADIUS;
    if (ball.velocity.x > 0) {
      const vn = Math.abs(ball.velocity.x);
      ball.velocity.x *= -cushionRestitution;
      ball.velocity.z *= 1 - cushionTangentialFriction;
      ball.velocity.z += spinSideEffect * vn;
    }
  }
  if (ball.position.z < -halfL + BALL_RADIUS) {
    ball.position.z = -halfL + BALL_RADIUS;
    if (ball.velocity.z < 0) {
      const vn = Math.abs(ball.velocity.z);
      ball.velocity.z *= -cushionRestitution;
      ball.velocity.x *= 1 - cushionTangentialFriction;
      ball.velocity.x += spinSideEffect * vn;
    }
  }
  if (ball.position.z > halfL - BALL_RADIUS) {
    ball.position.z = halfL - BALL_RADIUS;
    if (ball.velocity.z > 0) {
      const vn = Math.abs(ball.velocity.z);
      ball.velocity.z *= -cushionRestitution;
      ball.velocity.x *= 1 - cushionTangentialFriction;
      ball.velocity.x -= spinSideEffect * vn;
    }
  }
}

function handlePocket(ball) {
  if (ball.type === 'cue') {
    foulThisShot = true;
    foulReason = 'Cue ball potted';
    cueBallPottedThisShot = true;
    ball.velocity.set(0, 0, 0);
    ball.position.copy(cueStart);
    ball.group.position.copy(cueStart);
    ball.pocketed = false;
    cueBallInHand = true;
    stationaryTime = 0;
    logRule('cue_pocketed', { player: currentPlayer + 1 });
    return;
  }

  ball.pocketed = true;
  ball.group.visible = false;
  ball.velocity.set(0, 0, 0);
  shotPotted.push(ball);
  logRule('ball_pocketed', { type: ball.type });
}

function checkPockets(ball) {
  for (let i = 0; i < pockets.length; i += 1) {
    const pocket = pockets[i];
    const dx = ball.position.x - pocket.position.x;
    const dz = ball.position.z - pocket.position.z;
    if (dx * dx + dz * dz < pocket.radius * pocket.radius) {
      handlePocket(ball);
      return true;
    }
  }
  return false;
}

function resolveBallCollisions() {
  const buckets = new Map();
  for (let i = 0; i < balls.length; i += 1) {
    const ball = balls[i];
    if (ball.pocketed) continue;
    const cx = Math.floor(ball.position.x / collisionCellSize);
    const cz = Math.floor(ball.position.z / collisionCellSize);
    const key = `${cx},${cz}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(i);
  }

  const tested = new Set();
  for (let i = 0; i < balls.length; i += 1) {
    const a = balls[i];
    if (a.pocketed) continue;
    const cx = Math.floor(a.position.x / collisionCellSize);
    const cz = Math.floor(a.position.z / collisionCellSize);
    for (let ox = -1; ox <= 1; ox += 1) {
      for (let oz = -1; oz <= 1; oz += 1) {
        const key = `${cx + ox},${cz + oz}`;
        const candidates = buckets.get(key);
        if (!candidates) continue;
        for (let k = 0; k < candidates.length; k += 1) {
          const j = candidates[k];
          if (j <= i) continue;
          const pairKey = `${i}:${j}`;
          if (tested.has(pairKey)) continue;
          tested.add(pairKey);
          const b = balls[j];
          if (b.pocketed) continue;
          const dx = b.position.x - a.position.x;
          const dz = b.position.z - a.position.z;
          const distSq = dx * dx + dz * dz;
          const minDist = BALL_RADIUS * 2;
          if (distSq > minDist * minDist) continue;

          const dist = Math.sqrt(distSq) || 0.0001;
          const nx = dx / dist;
          const nz = dz / dist;

          const overlap = minDist - dist;
          a.position.x -= nx * (overlap / 2);
          a.position.z -= nz * (overlap / 2);
          b.position.x += nx * (overlap / 2);
          b.position.z += nz * (overlap / 2);

          // Relative velocity from A to B projected onto collision normal.
          const relVx = b.velocity.x - a.velocity.x;
          const relVz = b.velocity.z - a.velocity.z;
          const velAlongNormal = relVx * nx + relVz * nz;
          if (velAlongNormal >= 0) continue;

          // Equal-mass 2D impulse resolution.
          const impulse = (-(1 + ballRestitution) * velAlongNormal) / 2;

          a.velocity.x -= nx * impulse;
          a.velocity.z -= nz * impulse;
          b.velocity.x += nx * impulse;
          b.velocity.z += nz * impulse;

          a.velocity.multiplyScalar(collisionEnergyRetention);
          b.velocity.multiplyScalar(collisionEnergyRetention);

          if (shotInProgress && !firstHitType) {
            if (a.type === 'cue') firstHitType = b.type;
            if (b.type === 'cue') firstHitType = a.type;
          }

          // Spin effect: follow/screw after cue ball collision
          if (a.type === 'cue' || b.type === 'cue') {
            const cue = a.type === 'cue' ? a : b;
            const other = a.type === 'cue' ? b : a;
            const spinMag = Math.abs(spin.y);
            if (spinMag > 0.05) {
              // spin.y < 0 = top spin (follow), spin.y > 0 = bottom spin (screw)
              const contactDx = other.position.x - cue.position.x;
              const contactDz = other.position.z - cue.position.z;
              const contactDist = Math.hypot(contactDx, contactDz) || 0.0001;
              const dirX = contactDx / contactDist;
              const dirZ = contactDz / contactDist;
              const spinForce = -spin.y * Math.abs(velAlongNormal) * 0.45;
              cue.velocity.x += dirX * spinForce;
              cue.velocity.z += dirZ * spinForce;
            }
          }
        }
      }
    }
  }
}

function applyFriction(ball, dt) {
  const speed = ball.velocity.length();
  if (speed <= 0) return;
  // Blend a small linear drag with speed-proportional rolling loss for stable stop behavior.
  const decel = linearDrag + rollingDragK * speed;
  const newSpeed = Math.max(0, speed - decel * dt);
  if (newSpeed === 0) {
    ball.velocity.set(0, 0, 0);
  } else {
    ball.velocity.multiplyScalar(newSpeed / speed);
  }
}

function updatePhysics(dt) {
  balls.forEach((ball) => {
    if (ball.pocketed) return;
    ball.position.addScaledVector(ball.velocity, dt);
    ball.position.y = BALL_RADIUS;

    if (checkPockets(ball)) return;
    resolveCushion(ball);
    applyFriction(ball, dt);
    if (ball.velocity.length() < stopThreshold) {
      ball.velocity.set(0, 0, 0);
    }
  });

  // A couple of solver passes improve stability in clustered contacts.
  resolveBallCollisions();
  resolveBallCollisions();

  balls.forEach((ball) => {
    if (!ball.pocketed) {
      ball.group.position.copy(ball.position);
    }
  });

  cueRadiusRing.position.copy(cueBall.position);
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', onResize);

function evaluateShotIfStopped() {
  if (!shotInProgress) return;
  if (!allStopped()) return;

  if (!firstHitType) {
    foulThisShot = true;
    foulReason = 'No ball hit';
  } else if (!isLegalFirstHit(firstHitType)) {
    foulThisShot = true;
    foulReason = `Hit ${firstHitType} first`;
  }

  const scored = shotPotted.map((ball) => ball.type);
  const pottedReds = scored.filter((type) => type === 'red').length;
  const pottedColors = scored.filter((type) => type !== 'red' && type !== 'cue');
  const reds = redsRemaining();

  if (!foulThisShot && !freeBallAvailable) {
    if (reds > 0) {
      if (!expectingColor && pottedColors.length > 0) {
        foulThisShot = true;
        foulReason = 'Potted color on red';
      }
      if (expectingColor && pottedReds > 0) {
        foulThisShot = true;
        foulReason = 'Potted red on color';
      }
    } else {
      const order = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
      const targetColor = order[colorClearIndex];
      if (pottedColors.length > 0 && pottedColors.some((type) => type !== targetColor)) {
        foulThisShot = true;
        foulReason = `Wrong color (${targetColor} required)`;
      }
    }
  }

  endShot();
}

function stepSimulation(dt) {
  // Sub-stepping: 當球速快時，將 dt 拆分成更細嘅步長
  // 確保每步移動距離 < 球直徑嘅一半，避免穿透
  const maxSpeed = Math.max(...balls.map(b => b.pocketed ? 0 : b.velocity.length()));
  const maxStepDist = BALL_RADIUS; // 每步最多移動一個半徑
  const minSubstepDt = maxSpeed > 0.01 ? maxStepDist / maxSpeed : dt;
  const substeps = Math.max(1, Math.min(8, Math.ceil(dt / minSubstepDt)));
  const subDt = dt / substeps;

  for (let i = 0; i < substeps; i++) {
    updatePhysics(subDt);
  }

  if (allStopped()) {
    stationaryTime = Math.min(2, stationaryTime + dt);
  } else {
    stationaryTime = 0;
  }

  if (shotInProgress) {
    shotElapsed += dt;
    if (stationaryTime >= settledDuration || shotElapsed > 10) {
      evaluateShotIfStopped();
    }
  }

  if (foulDecisionPending && aiEnabled && foulDecisionContext && foulDecisionContext.beneficiary === 1) {
    // Simple AI choice: take the table after opponent foul.
    applyFoulDecision(false);
  }

  if (!foulDecisionPending && !shotInProgress && aiEnabled && currentPlayer === 1 && cueBallInHand) {
    queueAiCuePlacement();
  }

  if (
    !foulDecisionPending &&
    !shotInProgress &&
    aiEnabled &&
    currentPlayer === 1 &&
    !cueBallInHand &&
    canTakeShot() &&
    !isCharging
  ) {
    aiQueued = true;
  }

  if (!foulDecisionPending && !shotInProgress && aiEnabled && currentPlayer === 1) {
    queueAiShot();
  }

  if (foulDecisionPending) {
    turnState = 'FOUL_DECISION';
  } else if (cueBallInHand) {
    turnState = 'PLACE_CUE';
  } else if (shotInProgress || stationaryTime < settledDuration || !allStopped()) {
    turnState = 'BALLS_MOVING';
  } else if (isCharging) {
    turnState = 'AIMING_DRAG';
  } else {
    turnState = 'AIMING';
  }

  debugLogTimer += dt;
  if (debugLogTimer >= 0.6) {
    debugLogTimer = 0;
    console.log(
      `[STATE] aiming=${isCharging} power=${power.toFixed(2)} cueSpeed=${cueBall.velocity.length().toFixed(3)} turnState=${turnState} foulDecision=${foulDecisionPending}`
    );
  }

  clearStatusIfNeeded(dt);
  updateAimLine();
  updateUi();
}

const clock = new THREE.Clock();
const fixedDt = 1 / 60;
let accumulator = 0;
function animate() {
  const dt = Math.min(clock.getDelta(), 0.1);
  accumulator += dt;
  let steps = 0;
  while (accumulator >= fixedDt && steps < 6) {
    stepSimulation(fixedDt);
    accumulator -= fixedDt;
    steps += 1;
  }
  if (steps >= 6) accumulator = 0;
  fpsSmoothed = fpsSmoothed * 0.9 + (1 / Math.max(dt, 0.0001)) * 0.1;
  controls.update();
  updateDebugPanel();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.advanceTime = (ms) => {
  let remain = Math.max(0, ms) / 1000;
  while (remain > 0) {
    const dt = Math.min(fixedDt, remain);
    stepSimulation(dt);
    remain -= dt;
  }
};

function updateDebugPanel() {
  if (!debugVisible) {
    debugPanelEl.style.display = 'none';
    return;
  }
  const liveBalls = balls.filter((b) => !b.pocketed);
  const speedLines = liveBalls
    .slice(0, 8)
    .map((b) => `${b.type}: ${b.velocity.length().toFixed(3)}`)
    .join('\n');
  debugPanelEl.style.display = 'block';
  debugPanelEl.textContent =
    `fps: ${fpsSmoothed.toFixed(1)}\n` +
    `state: ${turnState}\n` +
    `aiming: ${isCharging}\n` +
    `power: ${power.toFixed(3)}\n` +
    `cueSpeed: ${cueBall.velocity.length().toFixed(3)}\n` +
    `liveBalls: ${liveBalls.length}\n` +
    `${speedLines}`;
}

window.render_game_to_text = () => {
  const payload = {
    mode: shotInProgress ? 'shot' : 'aim',
    coordinate: 'x right, z forward (toward top pockets), y up',
    player: currentPlayer + 1,
    scores,
    target: currentTargetLabel(),
    freeBallAvailable,
    snookered,
    turnState,
    foulDecisionPending,
    foulDecisionContext,
    actionRequired: foulDecisionPending
      ? 'FOUL_DECISION'
      : cueBallInHand
        ? 'PLACE_CUE_IN_D'
        : canTakeShot()
          ? 'CAN_SHOOT'
          : 'WAIT',
    cuePlacementMode: cueBallInHand ? 'D' : 'NONE',
    aiming: isCharging,
    power: Number(power.toFixed(3)),
    cueBallSpeed: Number(cueBall.velocity.length().toFixed(4)),
    cueVisible: cueGroup.visible,
    aimDir: { x: Number(aimDirection.x.toFixed(4)), z: Number(aimDirection.z.toFixed(4)) },
    guide: {
      extended: showExtendedGuide,
      primaryVisible: aimPrimaryGuide.line.visible,
      extendedVisible: aimExtendedGuide.line.visible,
      ghostVisible: ghostBallGuide.visible,
      objectPathVisible: objectPathGuide.line.visible,
      railReflectVisible: railReflectGuide.line.visible,
      firstCollision: lastAimCollision,
    },
    redsRemaining: redsRemaining(),
    expectingColor,
    cue: { x: cueBall.position.x, z: cueBall.position.z },
    balls: balls.map((ball) => ({
      type: ball.type,
      x: ball.position.x,
      z: ball.position.z,
      pocketed: ball.pocketed,
    })),
    inputDebug,
  };
  return JSON.stringify(payload);
};

window.__snookerDebug = {
  reset() {
    resetGame();
    return JSON.parse(window.render_game_to_text());
  },
  setAiEnabled(enabled) {
    aiEnabled = !!enabled;
    aiQueued = aiEnabled && currentPlayer === 1 && !cueBallInHand && !foulDecisionPending;
    updateUi();
    return { aiEnabled };
  },
  getPocketPositions() {
    return pockets.map((p, idx) => ({
      id: idx,
      kind: p.kind,
      x: Number(p.position.x.toFixed(4)),
      z: Number(p.position.z.toFixed(4)),
      r: Number(p.radius.toFixed(4)),
    }));
  },
  placeCueInD(x, z) {
    const pos = findNearestValidCuePlacement(new THREE.Vector3(x, BALL_RADIUS, z));
    cueBall.position.copy(pos);
    cueBall.group.position.copy(pos);
    cueBall.velocity.set(0, 0, 0);
    cueBallInHand = true;
    isDraggingCueBall = false;
    stationaryTime = 0;
    updateAimLine();
    updateUi();
    return {
      ok: isValidCuePlacement(pos),
      x: Number(pos.x.toFixed(4)),
      z: Number(pos.z.toFixed(4)),
    };
  },
  setBallPosition(type, index, x, z) {
    const matches = balls.filter((b) => b.type === type);
    const ball = matches[index];
    if (!ball) return false;
    ball.pocketed = false;
    ball.group.visible = true;
    ball.position.set(x, BALL_RADIUS, z);
    ball.group.position.copy(ball.position);
    ball.velocity.set(0, 0, 0);
    return true;
  },
  confirmCuePlacement() {
    if (!cueBallInHand || !isValidCuePlacement(cueBall.position) || foulDecisionPending) {
      return false;
    }
    cueBallInHand = false;
    stationaryTime = settledDuration;
    turnState = 'AIMING';
    updateAimLine();
    updateUi();
    return true;
  },
  shoot(dirX, dirZ, normalizedPower = 0.65) {
    if (foulDecisionPending) return false;
    const dir = new THREE.Vector3(dirX, 0, dirZ);
    if (dir.lengthSq() < 1e-6) return false;
    aimDirection.copy(dir.normalize());
    power = THREE.MathUtils.clamp(normalizedPower, 0, 1);
    shootCueBall();
    return true;
  },
  resolveFoulDecision(mode = 'take') {
    if (!foulDecisionPending) return false;
    applyFoulDecision(mode === 'force');
    return true;
  },
  step(ms = 16.67) {
    window.advanceTime(ms);
    return JSON.parse(window.render_game_to_text());
  },
  runUntilSettled(maxSeconds = 12) {
    const maxSteps = Math.ceil((maxSeconds * 1000) / (fixedDt * 1000));
    for (let i = 0; i < maxSteps; i += 1) {
      stepSimulation(fixedDt);
      if (!shotInProgress && !foulDecisionPending && allStopped() && stationaryTime >= settledDuration) {
        break;
      }
    }
    return JSON.parse(window.render_game_to_text());
  },
  state() {
    return JSON.parse(window.render_game_to_text());
  },
};

onResize();
resetGame();
updatePointer({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
animate();
