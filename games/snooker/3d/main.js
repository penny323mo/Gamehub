const canvas = document.getElementById('game');
const scoreEl = document.getElementById('score');
const turnEl = document.getElementById('turn');
const statusEl = document.getElementById('status');
const stateNoteEl = document.getElementById('state-note');
const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
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
const mobileControlsEl = document.getElementById('mobile-controls');
const mobileChargeBtn = document.getElementById('mobile-charge-btn');

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
controls.rotateSpeed = 0.75; // 降低 25% 靈敏度
controls.zoomSpeed = 0.75;   // 降低 25% 靈敏度
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

const ambientLight = new THREE.AmbientLight(0x9fb6a5, 0.22);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xc9d8f0, 0x172116, 0.18);
hemiLight.position.set(0, 3, 0);
scene.add(hemiLight);

const mainLight1 = new THREE.SpotLight(0xffffff, 1.25);
mainLight1.position.set(0, 2.7, -0.9);
mainLight1.angle = Math.PI / 4;
mainLight1.penumbra = 0.45;
mainLight1.decay = 1.6;
mainLight1.distance = 7;
scene.add(mainLight1);

const mainLight2 = new THREE.SpotLight(0xffffff, 1.25);
mainLight2.position.set(0, 2.7, 0.9);
mainLight2.angle = Math.PI / 4;
mainLight2.penumbra = 0.45;
mainLight2.decay = 1.6;
mainLight2.distance = 7;
scene.add(mainLight2);

const fillLight = new THREE.PointLight(0xffffff, 0.28);
fillLight.position.set(2.2, 1.6, 0.2);
scene.add(fillLight);

// === CYBERPUNK 環境 ===
function createCyberpunkFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // 深色基底
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(0, 0, 512, 512);
  
  // 網格線
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 16; i++) {
    const pos = i * 32;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(512, pos);
    ctx.stroke();
  }
  
  // 隨機發光點
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const hue = Math.random() > 0.5 ? 180 : 300; // cyan or magenta
    const alpha = 0.3 + Math.random() * 0.4;
    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
    ctx.fillRect(x, y, 2, 2);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 4;
  return texture;
}

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(28, 28),
  new THREE.MeshStandardMaterial({ 
    map: createCyberpunkFloorTexture(), 
    roughness: 0.3, 
    metalness: 0.6,
    emissive: 0x001515,
    emissiveIntensity: 0.3,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.82;
floor.position.z = -0.05;
scene.add(floor);

// Cyberpunk 牆壁
const arenaGroup = new THREE.Group();
scene.add(arenaGroup);

function createCyberpunkWallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // 深色背景
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#0a0015');
  gradient.addColorStop(1, '#050510');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 256);
  
  // 霓虹水平線
  const neonColors = ['#ff00ff', '#00ffff', '#ff0080', '#00ff80'];
  for (let i = 0; i < 8; i++) {
    const y = 20 + i * 30 + Math.random() * 10;
    const color = neonColors[i % neonColors.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.globalAlpha = 0.3 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
    
    // 發光效果
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
  
  // 隨機方塊（窗戶/廣告牌效果）
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 480;
    const y = Math.random() * 220;
    const w = 10 + Math.random() * 30;
    const h = 8 + Math.random() * 20;
    const hue = Math.random() > 0.5 ? 280 : 180;
    ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${0.1 + Math.random() * 0.3})`;
    ctx.fillRect(x, y, w, h);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

const cyberpunkWallTex = createCyberpunkWallTexture();
const wallMat = new THREE.MeshStandardMaterial({
  map: cyberpunkWallTex,
  color: 0x1a1a2e,
  roughness: 0.8,
  metalness: 0.1,
  emissive: 0x0a0a15,
  emissiveIntensity: 0.8,
});

const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 8), wallMat);
backWall.position.set(0, 3.2, -9);
arenaGroup.add(backWall);
const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 8), wallMat);
frontWall.position.set(0, 3.2, 9);
frontWall.rotation.y = Math.PI;
arenaGroup.add(frontWall);
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), wallMat);
leftWall.position.set(-9, 3.2, 0);
leftWall.rotation.y = Math.PI / 2;
arenaGroup.add(leftWall);
const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), wallMat);
rightWall.position.set(9, 3.2, 0);
rightWall.rotation.y = -Math.PI / 2;
arenaGroup.add(rightWall);

// 霓虹燈條裝飾
function createNeonStrip(color, length, position, rotation) {
  const geometry = new THREE.BoxGeometry(length, 0.02, 0.02);
  const material = new THREE.MeshBasicMaterial({ 
    color: color,
    transparent: true,
    opacity: 0.9,
  });
  const strip = new THREE.Mesh(geometry, material);
  strip.position.copy(position);
  if (rotation) strip.rotation.copy(rotation);
  
  // 發光效果
  const glowMat = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
  });
  const glow = new THREE.Mesh(new THREE.BoxGeometry(length, 0.08, 0.08), glowMat);
  glow.position.copy(position);
  if (rotation) glow.rotation.copy(rotation);
  
  arenaGroup.add(strip);
  arenaGroup.add(glow);
}

// 創建霓虹招牌文字
function createNeonSign(text, color, position, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = 'transparent';
  ctx.clearRect(0, 0, 512, 128);
  
  ctx.font = 'bold 80px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 發光效果
  ctx.shadowColor = `#${color.toString(16).padStart(6, '0')}`;
  ctx.shadowBlur = 20;
  ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.fillText(text, 256, 64);
  ctx.fillText(text, 256, 64); // 重複增強發光
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  
  const geometry = new THREE.PlaneGeometry(4 * scale, 1 * scale);
  const sign = new THREE.Mesh(geometry, material);
  sign.position.copy(position);
  arenaGroup.add(sign);
  return sign;
}

// 創建霓虹幾何圖案
function createNeonRing(color, radius, position, rotation) {
  const geometry = new THREE.TorusGeometry(radius, 0.015, 8, 32);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const ring = new THREE.Mesh(geometry, material);
  ring.position.copy(position);
  if (rotation) ring.rotation.copy(rotation);
  
  // 發光
  const glowGeom = new THREE.TorusGeometry(radius, 0.05, 8, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.25 });
  const glow = new THREE.Mesh(glowGeom, glowMat);
  glow.position.copy(position);
  if (rotation) glow.rotation.copy(rotation);
  
  arenaGroup.add(ring);
  arenaGroup.add(glow);
}

// 創建霓虹三角形
function createNeonTriangle(color, size, position, rotation) {
  const shape = new THREE.Shape();
  shape.moveTo(0, size);
  shape.lineTo(-size * 0.866, -size * 0.5);
  shape.lineTo(size * 0.866, -size * 0.5);
  shape.lineTo(0, size);
  
  const points = shape.getPoints();
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
  const triangle = new THREE.LineLoop(geometry, material);
  triangle.position.copy(position);
  if (rotation) triangle.rotation.copy(rotation);
  arenaGroup.add(triangle);
}

// === 霓虹裝飾 ===

// 底部霓虹燈條
createNeonStrip(0x00ffff, 20, new THREE.Vector3(0, -0.5, -8.9));
createNeonStrip(0xff00ff, 20, new THREE.Vector3(0, -0.5, 8.9));
createNeonStrip(0x00ff80, 14, new THREE.Vector3(-8.9, -0.5, 0), new THREE.Euler(0, Math.PI / 2, 0));
createNeonStrip(0xff0080, 14, new THREE.Vector3(8.9, -0.5, 0), new THREE.Euler(0, Math.PI / 2, 0));

// 頂部霓虹燈條
createNeonStrip(0x00ffff, 20, new THREE.Vector3(0, 6.5, -8.9));
createNeonStrip(0xff00ff, 20, new THREE.Vector3(0, 6.5, 8.9));
createNeonStrip(0x00ff80, 14, new THREE.Vector3(-8.9, 6.5, 0), new THREE.Euler(0, Math.PI / 2, 0));
createNeonStrip(0xff0080, 14, new THREE.Vector3(8.9, 6.5, 0), new THREE.Euler(0, Math.PI / 2, 0));

// 垂直霓虹燈條（四角）
createNeonStrip(0xff00ff, 7, new THREE.Vector3(-8.9, 3, -8.9), new THREE.Euler(0, 0, Math.PI / 2));
createNeonStrip(0x00ffff, 7, new THREE.Vector3(8.9, 3, -8.9), new THREE.Euler(0, 0, Math.PI / 2));
createNeonStrip(0x00ff80, 7, new THREE.Vector3(-8.9, 3, 8.9), new THREE.Euler(0, 0, Math.PI / 2));
createNeonStrip(0xff0080, 7, new THREE.Vector3(8.9, 3, 8.9), new THREE.Euler(0, 0, Math.PI / 2));

// 斜向裝飾燈條
createNeonStrip(0xffff00, 3, new THREE.Vector3(-7, 5.5, -8.85), new THREE.Euler(0, 0, Math.PI / 6));
createNeonStrip(0xffff00, 3, new THREE.Vector3(7, 5.5, -8.85), new THREE.Euler(0, 0, -Math.PI / 6));

// 霓虹招牌
createNeonSign('SNOOKER', 0x00ffff, new THREE.Vector3(0, 5.5, -8.85), 1.2);
createNeonSign('🎱 CLUB', 0xff00ff, new THREE.Vector3(0, 4.2, -8.85), 0.8);
createNeonSign('CYBER', 0x00ff80, new THREE.Vector3(-6, 4.5, -8.85), 0.6);
createNeonSign('ARENA', 0xff0080, new THREE.Vector3(6, 4.5, -8.85), 0.6);

// 側牆招牌
const leftSign = createNeonSign('147', 0xffff00, new THREE.Vector3(-8.85, 4.5, 0), 0.8);
leftSign.rotation.y = Math.PI / 2;
const rightSign = createNeonSign('BREAK', 0x00ffff, new THREE.Vector3(8.85, 4.5, 0), 0.7);
rightSign.rotation.y = -Math.PI / 2;

// 霓虹環形裝飾
createNeonRing(0xff00ff, 0.8, new THREE.Vector3(-5, 3, -8.85), new THREE.Euler(0, 0, 0));
createNeonRing(0x00ffff, 0.8, new THREE.Vector3(5, 3, -8.85), new THREE.Euler(0, 0, 0));
createNeonRing(0x00ff80, 0.5, new THREE.Vector3(-3, 2, -8.85), new THREE.Euler(0, 0, 0));
createNeonRing(0xff0080, 0.5, new THREE.Vector3(3, 2, -8.85), new THREE.Euler(0, 0, 0));

// 霓虹三角形裝飾
createNeonTriangle(0xffff00, 0.6, new THREE.Vector3(-7, 2.5, -8.84), new THREE.Euler(0, 0, 0));
createNeonTriangle(0xff00ff, 0.6, new THREE.Vector3(7, 2.5, -8.84), new THREE.Euler(0, 0, Math.PI));
createNeonTriangle(0x00ffff, 0.4, new THREE.Vector3(0, 2.5, -8.84), new THREE.Euler(0, 0, 0));

// 環境彩色補光（不影響桌面）
const purpleLight = new THREE.PointLight(0xff00ff, 0.15);
purpleLight.position.set(-8, 2, -6);
scene.add(purpleLight);

const cyanLight = new THREE.PointLight(0x00ffff, 0.15);
cyanLight.position.set(8, 2, 6);
scene.add(cyanLight);

const yellowLight = new THREE.PointLight(0xffff00, 0.08);
yellowLight.position.set(0, 5, -8);
scene.add(yellowLight);

// === 盆栽植物裝飾 ===
function createPottedPlant(position, scale = 1) {
  const plantGroup = new THREE.Group();
  
  // 花盆
  const potGeom = new THREE.CylinderGeometry(0.12 * scale, 0.09 * scale, 0.18 * scale, 16);
  const potMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a, 
    roughness: 0.8, 
    metalness: 0.3,
    emissive: 0x050505,
    emissiveIntensity: 0.2,
  });
  const pot = new THREE.Mesh(potGeom, potMat);
  pot.position.y = 0.09 * scale;
  plantGroup.add(pot);
  
  // 泥土
  const soilGeom = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.02 * scale, 16);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 1 });
  const soil = new THREE.Mesh(soilGeom, soilMat);
  soil.position.y = 0.17 * scale;
  plantGroup.add(soil);
  
  // 葉子（多層）
  const leafMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a5c2a, 
    roughness: 0.6,
    emissive: 0x0a2010,
    emissiveIntensity: 0.3,
  });
  
  for (let i = 0; i < 8; i++) {
    const leafGeom = new THREE.ConeGeometry(0.06 * scale, 0.25 * scale, 4);
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    const angle = (i / 8) * Math.PI * 2;
    const radius = 0.05 * scale;
    leaf.position.set(
      Math.cos(angle) * radius,
      0.28 * scale + Math.random() * 0.08 * scale,
      Math.sin(angle) * radius
    );
    leaf.rotation.x = (Math.random() - 0.5) * 0.4;
    leaf.rotation.z = (Math.random() - 0.5) * 0.4;
    plantGroup.add(leaf);
  }
  
  // 中心高葉
  for (let i = 0; i < 5; i++) {
    const tallLeafGeom = new THREE.ConeGeometry(0.04 * scale, 0.35 * scale, 4);
    const tallLeaf = new THREE.Mesh(tallLeafGeom, leafMat);
    const angle = (i / 5) * Math.PI * 2 + 0.3;
    tallLeaf.position.set(
      Math.cos(angle) * 0.02 * scale,
      0.35 * scale,
      Math.sin(angle) * 0.02 * scale
    );
    tallLeaf.rotation.x = (Math.random() - 0.5) * 0.2;
    tallLeaf.rotation.z = (Math.random() - 0.5) * 0.2;
    plantGroup.add(tallLeaf);
  }
  
  // 霓虹光環效果（Cyberpunk 風格）
  const ringGeom = new THREE.TorusGeometry(0.15 * scale, 0.008, 8, 24);
  const ringMat = new THREE.MeshBasicMaterial({ 
    color: 0x00ff80, 
    transparent: true, 
    opacity: 0.4 
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.position.y = 0.02 * scale;
  ring.rotation.x = Math.PI / 2;
  plantGroup.add(ring);
  
  plantGroup.position.copy(position);
  arenaGroup.add(plantGroup);
  return plantGroup;
}

// 盆栽已移除（避免同觀眾席衝突）

// === 真實桌球場地元素 ===

// 球杆架
function createCueRack(position, rotation = 0, scale = 1) {
  const rackGroup = new THREE.Group();
  
  // 架子主體
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.7, metalness: 0.1 });
  
  // 底座
  const baseGeom = new THREE.BoxGeometry(0.4, 0.05, 0.15);
  const base = new THREE.Mesh(baseGeom, frameMat);
  base.position.y = 0.025;
  rackGroup.add(base);
  
  // 支架
  const postGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
  const post1 = new THREE.Mesh(postGeom, frameMat);
  post1.position.set(-0.15, 0.6, 0);
  rackGroup.add(post1);
  const post2 = new THREE.Mesh(postGeom, frameMat);
  post2.position.set(0.15, 0.6, 0);
  rackGroup.add(post2);
  
  // 橫樑
  const barGeom = new THREE.BoxGeometry(0.35, 0.03, 0.03);
  const bar1 = new THREE.Mesh(barGeom, frameMat);
  bar1.position.y = 1.0;
  rackGroup.add(bar1);
  const bar2 = new THREE.Mesh(barGeom, frameMat);
  bar2.position.y = 0.5;
  rackGroup.add(bar2);
  
  // 模擬球杆
  const cueMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.5 });
  for (let i = 0; i < 3; i++) {
    const cueGeom = new THREE.CylinderGeometry(0.008, 0.012, 1.3, 8);
    const cue = new THREE.Mesh(cueGeom, cueMat);
    cue.position.set(-0.1 + i * 0.1, 0.75, 0);
    cue.rotation.z = 0.1;
    rackGroup.add(cue);
  }
  
  rackGroup.position.copy(position);
  rackGroup.rotation.y = rotation;
  rackGroup.scale.setScalar(scale);
  arenaGroup.add(rackGroup);
  return rackGroup;
}

// 粉筆座
function createChalkHolder(position, scale = 1) {
  const group = new THREE.Group();

  // 小木盒（枱邊粉筆盒）
  const boxGeom = new THREE.BoxGeometry(0.08, 0.03, 0.06);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x2b2118, roughness: 0.7, metalness: 0.1 });
  const box = new THREE.Mesh(boxGeom, boxMat);
  box.position.y = 0.015;
  group.add(box);

  // 粉筆
  const chalkGeom = new THREE.BoxGeometry(0.025, 0.025, 0.025);
  const chalkMat = new THREE.MeshStandardMaterial({ color: 0x4169e1, roughness: 0.9 });
  const chalk = new THREE.Mesh(chalkGeom, chalkMat);
  chalk.position.y = 0.04;
  group.add(chalk);

  group.position.copy(position);
  group.scale.setScalar(scale);
  arenaGroup.add(group);
  return group;
}

// 三角架（用嚟擺紅波）
function createTriangleRack(position, scale = 1) {
  const group = new THREE.Group();
  
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.6 });
  const shape = new THREE.Shape();
  const size = 0.22;
  shape.moveTo(0, size);
  shape.lineTo(-size * 0.866, -size * 0.5);
  shape.lineTo(size * 0.866, -size * 0.5);
  shape.lineTo(0, size);
  
  const extrudeSettings = { depth: 0.015, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const rack = new THREE.Mesh(geometry, rackMat);
  rack.rotation.x = -Math.PI / 2;
  rack.position.y = 0.01;
  group.add(rack);
  
  group.position.copy(position);
  group.scale.setScalar(scale);
  arenaGroup.add(group);
  return group;
}

// 記分板
function createScoreboard(position) {
  const group = new THREE.Group();
  
  // 背板
  const boardGeom = new THREE.BoxGeometry(1.5, 0.8, 0.05);
  const boardMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.5, 
    metalness: 0.3,
    emissive: 0x050505,
    emissiveIntensity: 0.3,
  });
  const board = new THREE.Mesh(boardGeom, boardMat);
  group.add(board);
  
  // 霓虹邊框
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
  const topEdge = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.02, 0.02), edgeMat);
  topEdge.position.y = 0.41;
  group.add(topEdge);
  const bottomEdge = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.02, 0.02), edgeMat);
  bottomEdge.position.y = -0.41;
  group.add(bottomEdge);
  
  // 文字標籤
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 512, 256);
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#00ffff';
  ctx.textAlign = 'center';
  ctx.fillText('PLAYER 1', 130, 80);
  ctx.fillText('PLAYER 2', 382, 80);
  ctx.font = 'bold 60px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('0', 130, 160);
  ctx.fillText('0', 382, 160);
  ctx.fillStyle = '#ff00ff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('VS', 256, 120);
  
  const texture = new THREE.CanvasTexture(canvas);
  const labelMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), labelMat);
  label.position.z = 0.03;
  group.add(label);
  
  group.position.copy(position);
  arenaGroup.add(group);
  return group;
}

// 觀眾座椅（簡化版）
let audienceSilhouetteTexture;
function getAudienceSilhouetteTexture() {
  if (audienceSilhouetteTexture) return audienceSilhouetteTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 身體
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(128, 340, 70, 110, 0, 0, Math.PI * 2);
  ctx.fill();
  // 頭
  ctx.beginPath();
  ctx.ellipse(128, 180, 50, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  // 肩膀
  ctx.fillRect(58, 250, 140, 70);
  // 手臂
  ctx.fillRect(30, 270, 40, 120);
  ctx.fillRect(186, 270, 40, 120);
  // 腿
  ctx.fillRect(80, 420, 35, 80);
  ctx.fillRect(141, 420, 35, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.encoding = THREE.sRGBEncoding;
  audienceSilhouetteTexture = tex;
  return tex;
}

function createAudienceSeats(position, count = 5, scale = 1, rotationY = 0, addToArena = true, seatSpacing = 0.7, addPeople = true) {
  const group = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.8 });
  
  for (let i = 0; i < count; i++) {
    const seatGroup = new THREE.Group();
    
    // 座位
    const seatGeom = new THREE.BoxGeometry(0.4, 0.08, 0.35);
    const seat = new THREE.Mesh(seatGeom, seatMat);
    seat.position.y = 0.35;
    seatGroup.add(seat);
    
    // 靠背
    const backGeom = new THREE.BoxGeometry(0.4, 0.5, 0.05);
    const back = new THREE.Mesh(backGeom, seatMat);
    back.position.set(0, 0.6, -0.15);
    seatGroup.add(back);
    
    // 腳
    const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 });
    const leg1 = new THREE.Mesh(legGeom, legMat);
    leg1.position.set(-0.15, 0.15, 0.12);
    seatGroup.add(leg1);
    const leg2 = new THREE.Mesh(legGeom, legMat);
    leg2.position.set(0.15, 0.15, 0.12);
    seatGroup.add(leg2);
    const leg3 = new THREE.Mesh(legGeom, legMat);
    leg3.position.set(-0.15, 0.15, -0.12);
    seatGroup.add(leg3);
    const leg4 = new THREE.Mesh(legGeom, legMat);
    leg4.position.set(0.15, 0.15, -0.12);
    seatGroup.add(leg4);

    // 觀眾（紙板剪影）
    if (addPeople) {
      const tex = getAudienceSilhouetteTexture();
      const colors = [0xff5f6d, 0x6a8dff, 0x5fd38b, 0xf6c945, 0xc77dff, 0xff8fab];
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });
      const width = 0.45 + Math.random() * 0.1;
      const height = 0.9 + Math.random() * 0.15;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
      plane.position.set(0, 0.75, -0.08);
      plane.rotation.y = (Math.random() - 0.5) * 0.2; // 少少角度
      seatGroup.add(plane);
    }
    
    seatGroup.position.x = (i - (count - 1) / 2) * seatSpacing;
    group.add(seatGroup);
  }
  
  group.position.copy(position);
  group.scale.setScalar(scale);
  group.rotation.y = rotationY;
  if (addToArena) arenaGroup.add(group);
  return group;
}

function createAudienceBlock(position, rows = 2, perRow = 5, rowGap = 0.8, scale = 1, rotationY = 0, seatSpacing = 0.7, addPeople = true) {
  const block = new THREE.Group();
  for (let r = 0; r < rows; r++) {
    const row = createAudienceSeats(new THREE.Vector3(0, 0, 0), perRow, 1, 0, false, seatSpacing, addPeople);
    row.position.z = r * rowGap; // 向枱方向排
    row.position.y = 0; // 全部同一高度
    block.add(row);
  }
  block.position.copy(position);
  block.scale.setScalar(scale);
  block.rotation.y = rotationY;
  arenaGroup.add(block);
  return block;
}

// 飲品桌
function createSideTable(position, scale = 1) {
  const group = new THREE.Group();
  
  // 桌面
  const topGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 16);
  const topMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3, metalness: 0.6 });
  const top = new THREE.Mesh(topGeom, topMat);
  top.position.y = 0.6;
  group.add(top);
  
  // 桌腳
  const legGeom = new THREE.CylinderGeometry(0.02, 0.03, 0.6, 8);
  const leg = new THREE.Mesh(legGeom, topMat);
  leg.position.y = 0.3;
  group.add(leg);
  
  // 水杯
  const glassGeom = new THREE.CylinderGeometry(0.03, 0.025, 0.08, 12);
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xaaddff, 
    transparent: true, 
    opacity: 0.4, 
    roughness: 0.1 
  });
  const glass = new THREE.Mesh(glassGeom, glassMat);
  glass.position.set(0.08, 0.65, 0);
  group.add(glass);
  
  // 水
  const waterGeom = new THREE.CylinderGeometry(0.025, 0.022, 0.05, 12);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x4488cc, transparent: true, opacity: 0.6 });
  const water = new THREE.Mesh(waterGeom, waterMat);
  water.position.set(0.08, 0.635, 0);
  group.add(water);
  
  group.position.copy(position);
  group.scale.setScalar(scale);
  arenaGroup.add(group);
  return group;
}

// 比賽者椅子
function createPlayerChair(position, scale = 1, rotationY = 0) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.7, metalness: 0.2 });

  // 座面
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.35), mat);
  seat.position.y = 0.32;
  group.add(seat);

  // 靠背
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.06), mat);
  back.position.set(0, 0.55, -0.15);
  group.add(back);

  // 四腳
  const legGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.5 });
  const legPos = [
    [-0.14, 0.16, 0.14],
    [0.14, 0.16, 0.14],
    [-0.14, 0.16, -0.14],
    [0.14, 0.16, -0.14],
  ];
  legPos.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeom, legMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  group.position.copy(position);
  group.scale.setScalar(scale);
  group.rotation.y = rotationY;
  arenaGroup.add(group);
  return group;
}

// 長枱 + 獎杯
function createTrophyTable(position, scale = 1) {
  const group = new THREE.Group();
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.4, metalness: 0.3 });

  const topHeight = 0.06;
  const topY = 0.6;
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, topHeight, 0.5), tableMat);
  top.position.y = topY;
  group.add(top);

  const legGeom = new THREE.BoxGeometry(0.08, 0.6, 0.08);
  const legOffsets = [
    [-0.8, 0.3, -0.18],
    [0.8, 0.3, -0.18],
    [-0.8, 0.3, 0.18],
    [0.8, 0.3, 0.18],
  ];
  legOffsets.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeom, tableMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  // 獎杯（精準貼枱面）
  const surfaceY = topY + topHeight / 2;
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 });

  const baseH = 0.08;
  const stemH = 0.12;
  const cupH = 0.2;

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, baseH, 16), goldMat);
  base.position.y = surfaceY + baseH / 2;
  group.add(base);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, stemH, 12), goldMat);
  stem.position.y = surfaceY + baseH + stemH / 2;
  group.add(stem);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, cupH, 16), goldMat);
  cup.position.y = surfaceY + baseH + stemH + cupH / 2;
  group.add(cup);

  // 小耳
  const handleGeom = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
  const handleL = new THREE.Mesh(handleGeom, goldMat);
  handleL.position.set(-0.17, cup.position.y + 0.01, 0);
  handleL.rotation.y = Math.PI / 2;
  group.add(handleL);
  const handleR = new THREE.Mesh(handleGeom, goldMat);
  handleR.position.set(0.17, cup.position.y + 0.01, 0);
  handleR.rotation.y = Math.PI / 2;
  group.add(handleR);

  group.position.copy(position);
  group.scale.setScalar(scale);
  arenaGroup.add(group);
  return group;
}

// === 大電視計分牌 ===
let tvScoreCanvas, tvScoreCtx, tvScoreTexture;

function getTVScoreTexture() {
  if (tvScoreTexture) return tvScoreTexture;
  tvScoreCanvas = document.createElement('canvas');
  tvScoreCanvas.width = 1024;
  tvScoreCanvas.height = 512;
  tvScoreCtx = tvScoreCanvas.getContext('2d');
  tvScoreTexture = new THREE.CanvasTexture(tvScoreCanvas);
  tvScoreTexture.encoding = THREE.sRGBEncoding;
  return tvScoreTexture;
}

function createTVScoreboard(position) {
  const group = new THREE.Group();
  
  // 電視外框
  const frameGeom = new THREE.BoxGeometry(4.2, 2.4, 0.15);
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0x0a0a0a, 
    roughness: 0.3, 
    metalness: 0.8 
  });
  const frame = new THREE.Mesh(frameGeom, frameMat);
  group.add(frame);
  
  // 霓虹邊框
  const neonColors = [0x00ffff, 0xff00ff];
  const edgePositions = [
    { size: [4.3, 0.03, 0.03], pos: [0, 1.22, 0.08], color: neonColors[0] },
    { size: [4.3, 0.03, 0.03], pos: [0, -1.22, 0.08], color: neonColors[0] },
    { size: [0.03, 2.5, 0.03], pos: [-2.12, 0, 0.08], color: neonColors[1] },
    { size: [0.03, 2.5, 0.03], pos: [2.12, 0, 0.08], color: neonColors[1] },
  ];
  
  edgePositions.forEach(({ size, pos, color }) => {
    const edgeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
    const edge = new THREE.Mesh(new THREE.BoxGeometry(...size), edgeMat);
    edge.position.set(...pos);
    group.add(edge);
    
    // 發光
    const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
    const glow = new THREE.Mesh(new THREE.BoxGeometry(size[0] * 1.5, size[1] * 1.5, size[2]), glowMat);
    glow.position.set(...pos);
    group.add(glow);
  });
  
  // 電視屏幕（共用同一個 Canvas）
  const screenMat = new THREE.MeshBasicMaterial({ map: getTVScoreTexture() });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 2.1), screenMat);
  screen.position.z = 0.08;
  group.add(screen);
  
  // 電視底座
  const standGeom = new THREE.BoxGeometry(0.8, 0.1, 0.3);
  const stand = new THREE.Mesh(standGeom, frameMat);
  stand.position.y = -1.3;
  group.add(stand);
  
  const poleGeom = new THREE.CylinderGeometry(0.05, 0.06, 0.5, 12);
  const pole = new THREE.Mesh(poleGeom, frameMat);
  pole.position.y = -1.0;
  group.add(pole);
  
  group.position.copy(position);
  arenaGroup.add(group);
  
  return group;
}

function updateTVScoreboard() {
  if (typeof scores === 'undefined' || typeof balls === 'undefined') return;
  if (typeof currentTargetLabel !== 'function') return;
  if (!tvScoreCtx) {
    getTVScoreTexture();
  }
  if (!tvScoreCtx) return;
  
  const ctx = tvScoreCtx;
  const w = 1024, h = 512;
  
  // 背景漸變
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#0a0020');
  gradient.addColorStop(0.5, '#100030');
  gradient.addColorStop(1, '#0a0020');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  // 網格線效果
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 26);
    ctx.lineTo(w, i * 26);
    ctx.stroke();
  }
  
  // 標題
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  ctx.fillText('SNOOKER CHAMPIONSHIP', w / 2, 60);
  ctx.shadowBlur = 0;
  
  // 分隔線
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 90);
  ctx.lineTo(w - 100, 90);
  ctx.stroke();
  
  // Player 1
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(playerNames[0] || 'PLAYER 1', 80, 160);
  
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#00ff80';
  ctx.shadowColor = '#00ff80';
  ctx.shadowBlur = 20;
  ctx.fillText(String(scores[0]), 120, 300);
  ctx.shadowBlur = 0;
  
  // VS
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff00ff';
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 10;
  ctx.fillText('VS', w / 2, 240);
  ctx.shadowBlur = 0;
  
  // Player 2 (AI)
  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'right';
  ctx.fillText(playerNames[1] || 'PLAYER 2', w - 80, 160);
  
  ctx.font = 'bold 120px Arial';
  ctx.fillStyle = '#ff0080';
  ctx.shadowColor = '#ff0080';
  ctx.shadowBlur = 20;
  ctx.fillText(String(scores[1]), w - 200, 300);
  ctx.shadowBlur = 0;
  
  // Frame / Turn 資訊
  ctx.font = '28px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#aaaaaa';
  const targetLabel = currentTargetLabel();
  ctx.fillText(`Turn ${turn}  |  Target: ${targetLabel}  |  ${currentPlayer === 0 ? playerNames[0] : playerNames[1]} to play`, w / 2, 400);
  
  // 剩餘紅球
  const redsLeft = balls.filter(b => b.type === 'red' && !b.pocketed).length;
  ctx.fillStyle = '#ff4444';
  ctx.fillText(`Reds: ${redsLeft}`, w / 2, 450);
  
  // 更新 texture
  if (tvScoreTexture) {
    tvScoreTexture.needsUpdate = true;
  }
}

// Overhead lamp (classic green shade)
const lampGroup = new THREE.Group();
scene.add(lampGroup);
const lampShadeGeom = new THREE.CylinderGeometry(0.6, 0.8, 0.15, 32, 1, true);
const lampShadeMat = new THREE.MeshStandardMaterial({
  color: 0x1a5c3a,
  roughness: 0.7,
  metalness: 0.2,
  side: THREE.DoubleSide
});
const lampShade = new THREE.Mesh(lampShadeGeom, lampShadeMat);
lampShade.position.set(0, 2.2, 0);
lampGroup.add(lampShade);
const lampTop = new THREE.Mesh(
  new THREE.CylinderGeometry(0.58, 0.6, 0.02, 32),
  new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5, metalness: 0.5 })
);
lampTop.position.set(0, 2.28, 0);
lampGroup.add(lampTop);
const lampRim = new THREE.Mesh(
  new THREE.TorusGeometry(0.8, 0.015, 8, 32),
  new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.3, metalness: 0.7 })
);
lampRim.rotation.x = Math.PI / 2;
lampRim.position.set(0, 2.12, 0);
lampGroup.add(lampRim);
const ropeGeom = new THREE.CylinderGeometry(0.008, 0.008, 1.5, 8);
const ropeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
const rope = new THREE.Mesh(ropeGeom, ropeMat);
rope.position.set(0, 3.0, 0);
lampGroup.add(rope);

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
  ctx.fillStyle = '#0e5a35';
  ctx.fillRect(0, 0, size, size);

  // 細碎纖維噪點
  for (let i = 0; i < 8000; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const v = 70 + Math.random() * 30;
    ctx.fillStyle = `rgba(15, ${v}, 45, 0.22)`;
    ctx.fillRect(x, y, 1, 1);
  }

  // 長條纖維（模擬草絲方向）
  ctx.strokeStyle = 'rgba(20, 90, 50, 0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 220; i += 1) {
    const y = Math.random() * size;
    const x = Math.random() * size;
    const len = 8 + Math.random() * 24;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
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

function createClothNormalMap() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  // 模擬草絲方向的凹凸
  for (let i = 0; i < 240; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 10 + Math.random() * 26;
    const tilt = (Math.random() - 0.5) * 6;
    ctx.strokeStyle = 'rgba(110, 130, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + tilt);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 4.5);
  return texture;
}

const clothTexture = createClothTexture();
const clothNormal = createClothNormalMap();

const cloth = new THREE.Mesh(
  new THREE.PlaneGeometry(TABLE_WIDTH, TABLE_LENGTH),
  new THREE.MeshStandardMaterial({
    map: clothTexture,
    normalMap: clothNormal,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughness: 0.8,
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

function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#3a2618';
  ctx.fillRect(0, 0, 512, 512);

  // 木紋條紋
  for (let i = 0; i < 60; i++) {
    const y = i * 8 + Math.random() * 4;
    const alpha = 0.08 + Math.random() * 0.12;
    ctx.strokeStyle = `rgba(120, 85, 55, ${alpha})`;
    ctx.lineWidth = 2 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y + (Math.random() - 0.5) * 6);
    ctx.stroke();
  }

  // 細小木結
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 6 + Math.random() * 10;
    ctx.strokeStyle = 'rgba(70, 45, 25, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.2);
  texture.encoding = THREE.sRGBEncoding;
  texture.anisotropy = 4;
  return texture;
}

const woodMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a2f1f,
  map: createWoodTexture(),
  roughness: 0.25,
  metalness: 0.25,
  clearcoat: 0.6,
  clearcoatRoughness: 0.15,
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
  woodMaterial
);
tableBody.position.y = -TABLE_HEIGHT / 2;
tableGroup.add(tableBody);

// 前方木紋面板（加強木紋視覺）
const frontPanel = new THREE.Mesh(
  new THREE.PlaneGeometry(TABLE_WIDTH + RAIL_THICK * 2.4, TABLE_HEIGHT * 0.55),
  woodMaterial
);
frontPanel.position.set(0, -TABLE_HEIGHT * 0.55, -(TABLE_LENGTH + RAIL_THICK * 2.4) / 2 - 0.001);
frontPanel.rotation.y = Math.PI; // 面向鏡頭
frontPanel.rotation.x = 0;
frontPanel.castShadow = false;
frontPanel.receiveShadow = true;
tableGroup.add(frontPanel);

// Table legs
function createTableLeg(x, z) {
  const tableBodyBottom = tableBody.position.y - TABLE_HEIGHT / 2;
  const floorY = floor.position.y;
  const legHeight = Math.max(0.35, tableBodyBottom - floorY);
  const legGeom = new THREE.CylinderGeometry(0.07, 0.085, legHeight, 18);
  const leg = new THREE.Mesh(legGeom, woodMaterial.clone());
  leg.position.set(x, floorY + legHeight / 2, z);
  return leg;
}
const legInsetX = halfW + RAIL_THICK * 0.62;
const legInsetZ = halfL + RAIL_THICK * 0.62;
tableGroup.add(createTableLeg(-legInsetX, -legInsetZ));
tableGroup.add(createTableLeg(legInsetX, -legInsetZ));
tableGroup.add(createTableLeg(-legInsetX, legInsetZ));
tableGroup.add(createTableLeg(legInsetX, legInsetZ));

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
    createBall({ color: 0xae1e23, type: 'red', position: new THREE.Vector3(x, BALL_RADIUS, z) });
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
  { type: 'yellow', color: 0xd8ae1d },
  { type: 'green', color: 0x3cbf66 },
  { type: 'brown', color: 0x744728 },
  { type: 'blue', color: 0x376fc6 },
  { type: 'pink', color: 0xd94f84 },
  { type: 'black', color: 0x0e0e0e },
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

// 放置場地元素（必須喺 CLOTH_Y, halfL 定義之後）
createCueRack(new THREE.Vector3(-6.5, -0.82, -7), Math.PI / 4, 2);
createCueRack(new THREE.Vector3(6.5, -0.82, -7), -Math.PI / 4, 2);
// 粉筆 item 已移除（避免放位突兀）
// 三角架已移除（避免出現地面三角形殘影）

// 四面電視計分牌
const tvBack = createTVScoreboard(new THREE.Vector3(0, 2.8, -8.5));
const tvFront = createTVScoreboard(new THREE.Vector3(0, 2.8, 8.5));
tvFront.rotation.y = Math.PI;
const tvLeft = createTVScoreboard(new THREE.Vector3(-8.5, 2.8, 0));
tvLeft.rotation.y = Math.PI / 2;
const tvRight = createTVScoreboard(new THREE.Vector3(8.5, 2.8, 0));
tvRight.rotation.y = -Math.PI / 2;

// 觀眾區（後方 + 左右牆）
// 觀眾席（只保留凳，無假人）
createAudienceBlock(new THREE.Vector3(0, -0.82, 7.2), 2, 5, 0.8, 2, Math.PI, 0.8, false);
// 前方（飲品枱位置）不設觀眾席
createAudienceBlock(new THREE.Vector3(-7.2, -0.82, 0), 2, 5, 0.8, 2, Math.PI / 2, 0.8, false);
createAudienceBlock(new THREE.Vector3(7.2, -0.82, 0), 2, 5, 0.8, 2, -Math.PI / 2, 0.8, false);
createSideTable(new THREE.Vector3(-3, -0.82, -6.5), 2);
createSideTable(new THREE.Vector3(3, -0.82, -6.5), 2);
// 飲品枱各放 1 張比賽者椅
createPlayerChair(new THREE.Vector3(-3.0, -0.82, -6.9), 2, 0);
createPlayerChair(new THREE.Vector3(3.0, -0.82, -6.9), 2, 0);
// 中間長枱 + 獎杯
createTrophyTable(new THREE.Vector3(0, -0.82, -6.9), 1.6);

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
  color: 0xffffff,
  opacity: 0.95,
  dashSize: 0.065,
  gapSize: 0.05,
});
const aimExtendedGuide = createGuideLine({
  color: 0xc0d0e8,
  opacity: 0.5,
  dashSize: 0.03,
  gapSize: 0.11,
});
const objectPathGuide = createGuideLine({
  color: 0xffaa00,
  opacity: 0.92,
  dashSize: 0.055,
  gapSize: 0.05,
});
const railReflectGuide = createGuideLine({
  color: 0x66ccff,
  opacity: 0.85,
  dashSize: 0.045,
  gapSize: 0.08,
});
const cueBallPathGuide = createGuideLine({
  color: 0x44ddff,
  opacity: 0.88,
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
const cueSpeedCap = 7.46;      // +10%
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

function colorsRemaining() {
  return balls.filter((ball) => ball.type !== 'red' && ball.type !== 'cue' && !ball.pocketed).length;
}

function legalTargetTypes() {
  if (freeBallAvailable) return ['red'];
  const reds = redsRemaining();
  if (reds > 0) {
    return expectingColor
      ? ['yellow', 'green', 'brown', 'blue', 'pink', 'black']
      : ['red'];
  }
  // 最後紅波後仲有一次打任意彩波
  if (expectingColor) {
    return ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
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
  // 最後紅波後仲有一次打任意彩波
  if (expectingColor) {
    return 'Color';
  }
  const order = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
  return order[colorClearIndex] || 'Finish';
}

function updateUi() {
  // 最終保險：全部清晒就完場
  if (!gameOver && redsRemaining() === 0 && colorsRemaining() === 0) {
    endGame();
    return;
  }

  scoreEl.textContent = `${playerNames[0]}: ${scores[0]}  |  ${playerNames[1]}: ${scores[1]}  |  Mode: ${playerNames[0]} vs ${playerNames[1]}`;
  turnEl.textContent = `Turn: ${turn}  |  Player: ${currentPlayer === 0 ? playerNames[0] : playerNames[1]}  |  Target: ${currentTargetLabel()}${snookered ? ' (Snookered)' : ''}  |  State: ${turnState}`;
  powerFillEl.style.width = `${Math.round(power * 100)}%`;

  // 更新大電視計分牌
  updateTVScoreboard();

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
  document.body.classList.toggle('cue-placement', cueBallInHand);
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
  return !gameOver && !shotInProgress && !cueBallInHand && !foulDecisionPending && stationaryTime >= settledDuration;
}

function canTakeShotReason() {
  if (gameOver) return 'GAME_OVER';
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
  gameOver = false;
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
  const extendLen = 5.8;
  const searchLen = extendLen; // always search full range for collision
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

    // === 使用與 resolveBallCollisions 相同流程嘅迷你模擬，取得碰撞後速度 ===
    // 保持公式不變，只令預測線跟足實際 solver

    // 白球入射方向 + 實際速度（含 powerMultiplier 與速度上限）
    const actualPower = minCharge + power * (maxCharge - minCharge);
    const rawSpeed = actualPower * powerMultiplier;
    const cueSpeed = Math.min(rawSpeed, cueSpeedCap);

    const simulateCollisionVelocities = () => {
      const cuePos = cueBall.position.clone().setY(0);
      const objPos = firstHit.targetBall.position.clone().setY(0);
      const cueVel = new THREE.Vector3(dir.x * cueSpeed, 0, dir.z * cueSpeed);
      const objVel = new THREE.Vector3(0, 0, 0);
      const baseDt = 1 / 60;

      const applyFrictionLocal = (vel, dt) => {
        const speed = vel.length();
        if (speed <= 0) return;
        const decel = linearDrag + rollingDragK * speed;
        const newSpeed = Math.max(0, speed - decel * dt);
        if (newSpeed === 0) {
          vel.set(0, 0, 0);
        } else {
          vel.multiplyScalar(newSpeed / speed);
        }
      };

      for (let i = 0; i < 240; i++) {
        const maxSpeed = Math.max(cueVel.length(), objVel.length());
        if (maxSpeed <= stopThreshold) break;
        const maxStepDist = BALL_RADIUS;
        const minSubstepDt = maxSpeed > 0.01 ? maxStepDist / maxSpeed : baseDt;
        const substeps = Math.max(1, Math.min(8, Math.ceil(baseDt / minSubstepDt)));
        const subDt = baseDt / substeps;

        for (let s = 0; s < substeps; s++) {
          cuePos.addScaledVector(cueVel, subDt);
          objPos.addScaledVector(objVel, subDt);

          applyFrictionLocal(cueVel, subDt);
          applyFrictionLocal(objVel, subDt);

          const dx = objPos.x - cuePos.x;
          const dz = objPos.z - cuePos.z;
          const distSq = dx * dx + dz * dz;
          const minDist = BALL_RADIUS * 2;
          if (distSq <= minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.0001;
            const nx = dx / dist;
            const nz = dz / dist;
            const overlap = minDist - dist;

            cuePos.x -= nx * (overlap / 2);
            cuePos.z -= nz * (overlap / 2);
            objPos.x += nx * (overlap / 2);
            objPos.z += nz * (overlap / 2);

            const relVx = objVel.x - cueVel.x;
            const relVz = objVel.z - cueVel.z;
            const velAlongNormal = relVx * nx + relVz * nz;
            if (velAlongNormal < 0) {
              const impulse = (-(1 + ballRestitution) * velAlongNormal) / 2;
              cueVel.x -= nx * impulse;
              cueVel.z -= nz * impulse;
              objVel.x += nx * impulse;
              objVel.z += nz * impulse;

              cueVel.multiplyScalar(collisionEnergyRetention);
              objVel.multiplyScalar(collisionEnergyRetention);

              const spinMag = Math.abs(spin.y);
              if (spinMag > 0.05) {
                const spinForce = -spin.y * Math.abs(velAlongNormal) * 0.45;
                cueVel.x += nx * spinForce;
                cueVel.z += nz * spinForce;
              }
            }

            return {
              cueVel: cueVel.clone(),
              objVel: objVel.clone(),
              collisionPoint: cuePos.clone(),
            };
          }
        }
      }

      return {
        cueVel: new THREE.Vector3(0, 0, 0),
        objVel: new THREE.Vector3(0, 0, 0),
        collisionPoint: firstHit.point.clone().setY(0),
      };
    };

    const sim = simulateCollisionVelocities();
    const cueFinalX = sim.cueVel.x;
    const cueFinalZ = sim.cueVel.z;
    const objFinalX = sim.objVel.x;
    const objFinalZ = sim.objVel.z;
    const collisionPoint = sim.collisionPoint.clone().setY(guideY);

    // 更新 ghost ball 位置，與實際微型模擬碰撞點一致
    ghostBallGuide.position.copy(collisionPoint);
    updateGhostBallSpinMarker();

    // === 修正：用與 stepSimulation 同步嘅 substep 模式計算軌跡長度 ===
    // 保持公式不變，只調整步進方式，減少高速時誤差
    function simulateTrajectoryLength(vx, vz, maxLen = 3.0) {
      let speed = Math.hypot(vx, vz);
      if (speed < 0.01) return 0;
      let totalDist = 0;
      const baseDt = 1 / 60; // 與主迴圈一致嘅時間步

      for (let i = 0; i < 240 && speed > stopThreshold && totalDist < maxLen; i++) {
        // 模擬 stepSimulation 的 substep
        const maxStepDist = BALL_RADIUS;
        const minSubstepDt = speed > 0.01 ? maxStepDist / speed : baseDt;
        const substeps = Math.max(1, Math.min(8, Math.ceil(baseDt / minSubstepDt)));
        const subDt = baseDt / substeps;

        for (let s = 0; s < substeps && speed > stopThreshold && totalDist < maxLen; s++) {
          const step = speed * subDt;
          totalDist += step;
          const decel = linearDrag + rollingDragK * speed;
          speed = Math.max(0, speed - decel * subDt);
        }
      }
      return totalDist;
    }

    // 繪製物件球軌跡（橙色）— 使用實際初速 + 摩擦模擬距離
    const objSpeed = Math.hypot(objFinalX, objFinalZ);
    if (objSpeed > 0.05) {
      const objDirX = objFinalX / objSpeed;
      const objDirZ = objFinalZ / objSpeed;
      const objLen = simulateTrajectoryLength(objFinalX, objFinalZ, showExtendedGuide ? 2.5 : 1.2);
      const objEnd = targetPos.clone().add(new THREE.Vector3(objDirX * objLen, 0, objDirZ * objLen));
      setGuideLinePoints(objectPathGuide, targetPos, objEnd);
    }

    // 繪製白球碰撞後軌跡（淺藍色）— 使用實際初速 + 摩擦模擬距離
    const cueFinalSpeed = Math.hypot(cueFinalX, cueFinalZ);
    if (cueFinalSpeed > 0.05) {
      const cueAfterDirX = cueFinalX / cueFinalSpeed;
      const cueAfterDirZ = cueFinalZ / cueFinalSpeed;
      const cueAfterLen = simulateTrajectoryLength(cueFinalX, cueFinalZ, showExtendedGuide ? 1.8 : 0.9);
      const cueAfterStart = collisionPoint.clone();
      const cueAfterEnd = cueAfterStart.clone().add(new THREE.Vector3(cueAfterDirX * cueAfterLen, 0, cueAfterDirZ * cueAfterLen));
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
  const towardTable = dz <= 0; // D 區開口向枱內（負 Z）
  const inD = dx * dx + dz * dz <= dRadius * dRadius && towardTable;
  return inD;
}

function clampCuePlacementToD(pos, ignoreCamera = false) {
  const clamped = pos.clone();
  const minX = -halfW + BALL_RADIUS;
  const maxX = halfW - BALL_RADIUS;
  const minZ = -halfL + BALL_RADIUS;
  const maxZ = halfL - BALL_RADIUS;
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

  // keep only the half-circle that opens toward table (negative Z)
  if ((clamped.z - baulkLineZ) > 0) {
    clamped.z = baulkLineZ;
  }

  clamped.y = BALL_RADIUS;
  return clamped;
}

function findNearestValidCuePlacement(pos, ignoreCamera = false) {
  const base = clampCuePlacementToD(pos, ignoreCamera);
  if (isValidCuePlacement(base)) return base;
  const maxRadius = 0.4;
  const step = BALL_RADIUS * 0.8;
  for (let r = step; r <= maxRadius; r += step) {
    for (let i = 0; i < 18; i += 1) {
      const a = (i / 18) * Math.PI * 2;
      const probe = base.clone().add(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      const clamped = clampCuePlacementToD(probe, ignoreCamera);
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
    // 犯規：任何入袋的彩波都應該放返出嚟（包括清台階段打錯波）
    if (pottedColors.length > 0) {
      respotColors(pottedColors);
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

      // 檢查遊戲是否結束（黑球已入 或 已清晒）
      if (colorClearIndex >= 6 || targetColor === 'black' || colorsRemaining() === 0) {
        endGame();
        return;
      }
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

// 遊戲結束處理
let gameOver = false;
let playerNames = ['P1', 'AI'];
function endGame() {
  console.log('[GAME] endGame() called, scores:', scores);
  gameOver = true;
  const winner = scores[0] > scores[1] ? 1 : (scores[1] > scores[0] ? 2 : 0);
  const winnerText = winner === 0 ? '平手！' : `Player ${winner} 勝出！`;
  const finalScore = `最終比分：P1 ${scores[0]} - ${scores[1]} P2`;

  logRule('game_over', { winner, scores: [...scores] });

  // 顯示結果
  setStatus(`${winnerText} ${finalScore}`, 999);

  // 顯示重新開始按鈕
  showGameOverPanel(winnerText, finalScore);
}

function showGameOverPanel(winnerText, finalScore) {
  console.log('[GAME] showGameOverPanel called');
  // 建立遊戲結束面板
  let panel = document.getElementById('game-over-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'game-over-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      padding: 40px 60px;
      border-radius: 16px;
      text-align: center;
      z-index: 1000;
      font-family: system-ui, sans-serif;
    `;
    document.body.appendChild(panel);
  }

  panel.innerHTML = `
    <h1 style="margin: 0 0 10px 0; font-size: 32px; color: #ffd700;">${winnerText}</h1>
    <p style="margin: 0 0 30px 0; font-size: 20px; opacity: 0.8;">${finalScore}</p>
    <button id="restart-btn" style="
      padding: 14px 40px;
      font-size: 18px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    ">重新開始</button>
  `;
  panel.style.display = 'block';

  document.getElementById('restart-btn').addEventListener('click', () => {
    panel.style.display = 'none';
    gameOver = false;
    resetGame();
  });
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
  // 修正：最後紅波後仲有一次打任意彩波機會
  if (expectingColor) {
    return type !== 'red' && type !== 'cue';
  }
  // 修正：如果 reds=0 但打中 red（即打緊最後一粒紅），都係合法
  if (type === 'red') {
    return true;
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
  if (gameOver) return;
  aiQueued = false;
  const targets = legalTargetTypes();
  const targetBalls = balls.filter(
    (ball) => targets.includes(ball.type) && !ball.pocketed
  );

  let bestShot = null;

  // 1) 嘗試直接入袋
  for (const ball of targetBalls) {
    for (const pocket of pockets) {
      const toPocket = pocket.position.clone().sub(ball.position).setY(0);
      const distPocket = toPocket.length();
      if (distPocket < 0.01) continue;
      const pocketDir = toPocket.clone().normalize();
      const contactPoint = ball.position.clone().sub(pocketDir.multiplyScalar(BALL_RADIUS * 2));

      // 檢查目標球到袋口有冇被擋
      if (!isLineClear(ball.position, pocket.position, ball)) continue;
      // 檢查白球到接觸點有冇被擋
      if (!isLineClear(cueBall.position, contactPoint, ball)) continue;

      const distCue = cueBall.position.distanceTo(contactPoint);
      const base = ball.type === 'red' ? 60 : (ballValues[ball.type] || 1) * 12;

      // 計算擊球角度（越直越好）
      const cueToBall = contactPoint.clone().sub(cueBall.position).setY(0).normalize();
      const ballToPocket = pocketDir;
      const angleCos = Math.abs(cueToBall.dot(ballToPocket));
      const angleBonus = angleCos * 20;

      const score = base - distCue * 3.5 - distPocket * 1.5 + angleBonus;
      if (!bestShot || score > bestShot.score) {
        bestShot = { ball, pocket, contactPoint, score, kind: 'direct' };
      }
    }
  }

  // 2) 如果冇直接路線，嘗試經枱邊反彈打到目標球
  if (!bestShot) {
    const cushions = [
      { normal: new THREE.Vector3(1, 0, 0), x: -halfW + BALL_RADIUS, axis: 'x' },   // 左邊
      { normal: new THREE.Vector3(-1, 0, 0), x: halfW - BALL_RADIUS, axis: 'x' },   // 右邊
      { normal: new THREE.Vector3(0, 0, 1), z: -halfL + BALL_RADIUS, axis: 'z' },   // 底邊
      { normal: new THREE.Vector3(0, 0, -1), z: halfL - BALL_RADIUS, axis: 'z' },   // 頂邊
    ];

    for (const ball of targetBalls) {
      for (const cushion of cushions) {
        // 計算反彈點：入射角 = 反射角
        // 鏡像目標球位置
        let mirrorBall;
        if (cushion.axis === 'x') {
          mirrorBall = new THREE.Vector3(
            2 * cushion.x - ball.position.x,
            ball.position.y,
            ball.position.z
          );
        } else {
          mirrorBall = new THREE.Vector3(
            ball.position.x,
            ball.position.y,
            2 * cushion.z - ball.position.z
          );
        }

        // 白球到鏡像球嘅直線
        const toMirror = mirrorBall.clone().sub(cueBall.position).setY(0);
        const distTotal = toMirror.length();
        if (distTotal < 0.1) continue;
        const dirToMirror = toMirror.normalize();

        // 計算反彈點
        let bouncePoint;
        if (cushion.axis === 'x') {
          const t = (cushion.x - cueBall.position.x) / dirToMirror.x;
          if (t < 0.1) continue;
          bouncePoint = new THREE.Vector3(
            cushion.x,
            BALL_RADIUS,
            cueBall.position.z + dirToMirror.z * t
          );
        } else {
          const t = (cushion.z - cueBall.position.z) / dirToMirror.z;
          if (t < 0.1) continue;
          bouncePoint = new THREE.Vector3(
            cueBall.position.x + dirToMirror.x * t,
            BALL_RADIUS,
            cushion.z
          );
        }

        // 檢查反彈點係咪喺枱內
        if (Math.abs(bouncePoint.x) > halfW - BALL_RADIUS * 1.5 ||
            Math.abs(bouncePoint.z) > halfL - BALL_RADIUS * 1.5) continue;

        // 檢查白球到反彈點有冇被擋
        if (!isLineClear(cueBall.position, bouncePoint, null)) continue;
        // 檢查反彈點到目標球有冇被擋
        if (!isLineClear(bouncePoint, ball.position, ball)) continue;

        const distCue = cueBall.position.distanceTo(bouncePoint);
        const distBounce = bouncePoint.distanceTo(ball.position);
        const base = ball.type === 'red' ? 40 : (ballValues[ball.type] || 1) * 8;  // 反彈球分數較低
        const score = base - distCue * 2 - distBounce * 2;

        if (!bestShot || score > bestShot.score) {
          bestShot = {
            ball,
            contactPoint: bouncePoint,
            score,
            kind: 'cushion',
            aimDir: dirToMirror.clone(),
          };
        }
      }
    }
  }

  if (bestShot) {
    if (bestShot.kind === 'cushion' && bestShot.aimDir) {
      aimDirection.copy(bestShot.aimDir);
    } else {
      const dir = bestShot.contactPoint.clone().sub(cueBall.position).setY(0).normalize();
      aimDirection.copy(dir);
    }
    power = Math.min(0.85, Math.max(0.5, 0.55 + bestShot.score * 0.002));
    shootCueBall();
    return;
  }

  // 3) 冇任何路線：打安全球（輕輕打向目標球方向）
  const fallback = targetBalls[0] || balls.find((ball) => ball.type !== 'cue' && !ball.pocketed);
  if (!fallback) return;

  // 搵一個唔會俾其他球擋住嘅目標
  let safeTarget = null;
  for (const ball of targetBalls) {
    if (isLineClear(cueBall.position, ball.position, ball)) {
      safeTarget = ball;
      break;
    }
  }
  if (!safeTarget) safeTarget = fallback;

  const dir = safeTarget.position.clone().sub(cueBall.position).setY(0).normalize();
  aimDirection.copy(dir);
  power = 0.25;  // 安全球用細力
  shootCueBall();
}

function queueAiCuePlacement() {
  if (!aiEnabled || currentPlayer !== 1) return;
  if (!cueBallInHand || shotInProgress || foulDecisionPending) return;
  if (gameOver) return;

  console.log('[AI] queueAiCuePlacement triggered');

  const targets = legalTargetTypes();
  const targetBalls = balls.filter(
    (ball) => targets.includes(ball.type) && !ball.pocketed
  );

  // 評估每個候選位置：邊個對目標球最有利
  const baseCandidates = [
    new THREE.Vector3(-dRadius * 0.6, BALL_RADIUS, baulkLineZ - dRadius * 0.3),
    new THREE.Vector3(dRadius * 0.6, BALL_RADIUS, baulkLineZ - dRadius * 0.3),
    new THREE.Vector3(0, BALL_RADIUS, baulkLineZ - dRadius * 0.7),
    new THREE.Vector3(-dRadius * 0.3, BALL_RADIUS, baulkLineZ - dRadius * 0.5),
    new THREE.Vector3(dRadius * 0.3, BALL_RADIUS, baulkLineZ - dRadius * 0.5),
    new THREE.Vector3(0, BALL_RADIUS, baulkLineZ - dRadius * 0.3),
    new THREE.Vector3(-dRadius * 0.8, BALL_RADIUS, baulkLineZ),
    new THREE.Vector3(dRadius * 0.8, BALL_RADIUS, baulkLineZ),
  ];

  let bestPlacement = null;
  let bestScore = -Infinity;

  for (const candidate of baseCandidates) {
    const probe = findNearestValidCuePlacement(candidate, true);
    if (!isValidCuePlacement(probe)) continue;

    // 評估呢個位置對打波有幾好
    let placeScore = 0;
    for (const ball of targetBalls) {
      // 檢查有冇清晰路線
      if (isLineClear(probe, ball.position, ball)) {
        const dist = probe.distanceTo(ball.position);
        placeScore += 50 - dist * 10;  // 越近越好

        // 檢查有冇直接入袋機會
        for (const pocket of pockets) {
          const toPocket = pocket.position.clone().sub(ball.position).setY(0);
          const pocketDir = toPocket.clone().normalize();
          const contactPoint = ball.position.clone().sub(pocketDir.multiplyScalar(BALL_RADIUS * 2));
          if (isLineClear(ball.position, pocket.position, ball) &&
              isLineClear(probe, contactPoint, ball)) {
            placeScore += 30;  // 有入袋機會加分
          }
        }
      }
    }

    if (placeScore > bestScore) {
      bestScore = placeScore;
      bestPlacement = probe;
    }
  }

  if (!bestPlacement) {
    bestPlacement = findNearestValidCuePlacement(cueStart.clone(), true);
  }

  cueBall.position.copy(bestPlacement);
  cueBall.group.position.copy(bestPlacement);
  cueBall.velocity.set(0, 0, 0);
  cueBallInHand = false;
  stationaryTime = settledDuration;
  turnState = 'AIMING';
  setStatus('AI placed cue ball in D', 0.8);
  logRule('ai_cue_placement', {
    x: Number(bestPlacement.x.toFixed(3)),
    z: Number(bestPlacement.z.toFixed(3)),
    score: bestScore,
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
let mobileChargeActive = false;  // 手機儲力按鈕中

// 手機模式：預防誤觸控制區（下半部）
function isTouchInControlArea(e) {
  if (cueBallInHand) return false;
  return e.clientY > window.innerHeight * 0.75;
}

function handlePrimaryPointerDown(e) {
  inputDebug.lastMouseDown = `btn=${e.button} x=${e.clientX} y=${e.clientY} state=${turnState}`;
  if (e.button !== 0) return;
  if (foulDecisionPending) return;
  if (isTouchDevice && mobileChargeActive) return;

  // 手機模式處理
  if (isTouchDevice) {
    // 白球在手：任何觸控優先當成放球，禁止進入旋轉視角
    if (cueBallInHand) {
      // continue to placement flow
    } else {
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
    updateCueBallPlacementFromPointer(e); // 若 raycast miss 會返回 false，但仍保持拖放狀態
    setStatus('拖動白球到 D 區...', 0.6);
    return;
  }

  updatePointer(e);
  const reason = canTakeShotReason();
  // 檢查是否點擊了 UI 元素 (雖然有 stopPropagation，但為了保險)
  // 這裡假設 e.target 可能是 canvas，如果有點擊穿透問題可以在這裡加

  if (canTakeShot() && (!aiEnabled || currentPlayer === 0)) {
    // 判斷點擊位置是否在白球「前方」 (僅限手機單點瞄準)
    if (isTouchDevice && raycaster.ray.intersectPlane(tablePlane, aimHit)) {
      // 計算相機前向向量 (投影到水平面)
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();

      // 計算白球到點擊點的向量
      const touchDir = new THREE.Vector3().subVectors(aimHit, cueBall.position);
      touchDir.y = 0;
      touchDir.normalize();

      // 如果點擊點在白球後方 (dot < 0)，忽略該操作，防止誤觸導致視角 180 度翻轉
      // 用戶要求：「定義返喺球桿同球嘅前面方向先至做瞄準」
      if (touchDir.dot(camDir) < 0) {
        return;
      }
    }

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
  if (isTouchDevice && mobileChargeActive) {
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
  if (turnState === 'AIMING_DRAG' && !isTouchDevice && isCharging) {
    // 電腦版儲力邏輯保持不變
    if (raycaster.ray.intersectPlane(tablePlane, aimHit)) {
      const dragVec = new THREE.Vector2(aimHit.x - dragStartPoint.x, aimHit.z - dragStartPoint.z);
      const aimVec2D = new THREE.Vector2(chargeLockedAimDirection.x, chargeLockedAimDirection.z);
      const pullBack = -(dragVec.x * aimVec2D.x + dragVec.y * aimVec2D.y);

      // 只有向後拉先更新 power；向前或停留唔改
      if (pullBack > 0.02) {
        power = Math.min(1, Math.max(0, pullBack * 4));
      } else if (pullBack < -0.03) {
        // 向前拉超過閾值：取消拉桿
        power = 0;
        isCharging = false;
        turnState = 'AIMING';
        if (powerFillEl) powerFillEl.style.width = '0%';
        updateAimLine();
      }
      // pullBack 在 [-0.03, 0.02] 之間：維持現狀，唔變
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
if (mobileChargeBtn) {
  let rafId = null;
  let lastTick = 0;

  const tickCharge = () => {
    if (!isCharging) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    const rate = 1.2; // 線性上升
    power = Math.min(1, power + dt * rate);
    // 只更新 power bar，避免重排
    if (powerFillEl) powerFillEl.style.width = `${Math.round(power * 100)}%`;
    rafId = requestAnimationFrame(tickCharge);
  };

  const startCharging = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canTakeShot()) return;
    if (aiEnabled && currentPlayer !== 0) return;

    isCharging = true;
    mobileChargeActive = true;
    power = 0;
    mobileChargeBtn.classList.add('charging');
    mobileChargeBtn.textContent = '放手出桿';

    // 鎖定瞄準方向
    chargeLockedAimDirection.copy(aimDirection);

    if (rafId) cancelAnimationFrame(rafId);
    lastTick = performance.now();
    rafId = requestAnimationFrame(tickCharge);
  };

  const cancelCharging = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isCharging) return;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    mobileChargeActive = false;
    mobileChargeBtn.classList.remove('charging');
    mobileChargeBtn.textContent = '撳住儲力';
    isCharging = false;
    power = 0;
    if (powerFillEl) powerFillEl.style.width = '0%';
  };

  const stopChargingAndShoot = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCharging) return;

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    mobileChargeActive = false;
    mobileChargeBtn.classList.remove('charging');
    mobileChargeBtn.textContent = '撳住儲力';

    shootCueBall();
    isCharging = false;
    power = 0;
    if (powerFillEl) powerFillEl.style.width = '0%';
  };

  mobileChargeBtn.addEventListener('pointerdown', startCharging);
  mobileChargeBtn.addEventListener('touchstart', startCharging);

  const withinButton = (e) => {
    const rect = mobileChargeBtn.getBoundingClientRect();
    const x = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    const y = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
    if (x == null || y == null) return true;
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  mobileChargeBtn.addEventListener('pointerup', stopChargingAndShoot);
  mobileChargeBtn.addEventListener('touchend', stopChargingAndShoot);
  mobileChargeBtn.addEventListener('touchcancel', cancelCharging);

  mobileChargeBtn.addEventListener('pointermove', (e) => {
    if (isCharging && !withinButton(e)) {
      cancelCharging(e);
    }
  });
  mobileChargeBtn.addEventListener('touchmove', (e) => {
    if (isCharging && !withinButton(e)) {
      cancelCharging(e);
    }
  }, { passive: false });
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
    const distSq = dx * dx + dz * dz;

    // 中袋（side pocket）：只有球喺枱邊內側先算入袋
    if (pocket.kind === 'side') {
      // 中袋係半圓形，開口向枱內
      // 左中袋 (x = -halfW)：球要喺 x > pocket.x 先算入袋範圍
      // 右中袋 (x = +halfW)：球要喺 x < pocket.x 先算入袋範圍
      const isLeftPocket = pocket.position.x < 0;
      const inPocketZone = isLeftPocket ? (ball.position.x > pocket.position.x - pocket.radius * 0.3) 
                                         : (ball.position.x < pocket.position.x + pocket.radius * 0.3);
      if (!inPocketZone) continue;
      // 縮細中袋檢測半徑，避免擦邊誤判
      if (distSq < (pocket.radius * 0.75) * (pocket.radius * 0.75)) {
        handlePocket(ball);
        return true;
      }
    } else {
      // 角袋：保持原本邏輯
      if (distSq < pocket.radius * pocket.radius) {
        handlePocket(ball);
        return true;
      }
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
      // 新增：紅球後打彩球階段，入嘅彩球必須同 firstHit 一致
      if (expectingColor && pottedColors.length > 0 && firstHitType) {
        if (pottedColors.some((type) => type !== firstHitType)) {
          foulThisShot = true;
          foulReason = `Potted ${pottedColors.find(t => t !== firstHitType)} but hit ${firstHitType} first`;
        }
      }
    } else if (expectingColor) {
      // 最後紅波後打彩波階段，任意彩波都合法，但入波必須同 firstHit 一致
      if (pottedReds > 0) {
        foulThisShot = true;
        foulReason = 'Potted red on color';
      }
      if (pottedColors.length > 0 && firstHitType && firstHitType !== 'red') {
        if (pottedColors.some((type) => type !== firstHitType)) {
          foulThisShot = true;
          foulReason = `Potted ${pottedColors.find(t => t !== firstHitType)} but hit ${firstHitType} first`;
        }
      }
    } else {
      // 清台階段：必須按順序打
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
    console.log('[AI] About to call queueAiCuePlacement, cueBallInHand=', cueBallInHand);
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

// 玩家名稱輸入
if (player1NameInput) {
  player1NameInput.addEventListener('input', () => {
    playerNames[0] = player1NameInput.value.trim() || 'P1';
    updateUi();
  });
}
if (player2NameInput) {
  player2NameInput.addEventListener('input', () => {
    playerNames[1] = player2NameInput.value.trim() || 'AI';
    updateUi();
  });
}

// HUD 展開/縮細按鈕（只收埋操作說明）
const hudHintWrapper = document.getElementById('hud-hint-wrapper');
const hudToggleBtn = document.getElementById('hud-toggle');
if (hudHintWrapper && hudToggleBtn) {
  hudToggleBtn.addEventListener('click', () => {
    hudHintWrapper.classList.toggle('collapsed');
    hudToggleBtn.textContent = hudHintWrapper.classList.contains('collapsed') ? '▼' : '▲';
  });
}

// 防止手機控制面板誤觸
if (mobileControlsEl) {
  const stopProp = (e) => e.stopPropagation();
  mobileControlsEl.addEventListener('touchstart', stopProp, { passive: false });
  mobileControlsEl.addEventListener('touchmove', stopProp, { passive: false });
  mobileControlsEl.addEventListener('touchend', stopProp, { passive: false });
  mobileControlsEl.addEventListener('mousedown', stopProp);
  mobileControlsEl.addEventListener('mousemove', stopProp);
  mobileControlsEl.addEventListener('mouseup', stopProp);
}

animate();
