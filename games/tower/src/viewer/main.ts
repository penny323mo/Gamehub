import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TowerRenderer } from '../render/towerRenderer';
import { EnemyRenderer } from '../render/enemyRenderer';
import { FxRenderer } from '../render/fx';
import { ProjectileRenderer } from '../render/projectileRenderer';
import type { Tower, Enemy, Projectile } from '../core/types';
import { cellToWorld } from '../core/path';
import { PROJECTILE_SPEED } from '../core/config';

// Fix Vite HMR creating multiple WebGL contexts on the same canvas
if ((import.meta as any).hot) {
    (import.meta as any).hot.accept(() => {
        (import.meta as any).hot?.invalidate();
    });
}

// Setup basic Three.js scene
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.FogExp2(0x1a1a1a, 0.02);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(3, 4, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 + 0.1; // allow slightly below ground
controls.minDistance = 1;
controls.maxDistance = 20;

// Lighting setup (Studio-like)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.5);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 30;
dirLight.shadow.camera.left = -5;
dirLight.shadow.camera.right = 5;
dirLight.shadow.camera.top = 5;
dirLight.shadow.camera.bottom = -5;
dirLight.shadow.bias = -0.001;
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x4488ff, 1.0);
rimLight.position.set(-5, 5, -5);
scene.add(rimLight);

// Environment
const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
gridHelper.position.y = -0.01;
scene.add(gridHelper);

const planeGeo = new THREE.PlaneGeometry(30, 30);
const planeMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.8,
    metalness: 0.2
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Central container for whatever is being viewed
const container = new THREE.Group();
scene.add(container);

// Instances of our renderers
const towerRenderer = new TowerRenderer(container as any);
const enemyRenderer = new EnemyRenderer(container as any);
const fxRenderer = new FxRenderer(container as any);
const projectileRenderer = new ProjectileRenderer(container as any);

// Fake game state to feed the renderers
let mockState: any = {
    towers: [],
    enemies: [],
    projectiles: []
};

let currentItemType: 'tower' | 'enemy' | null = null;
let currentItemName: string = '';

const TOWER_TYPES = ['arrow', 'cannon', 'ice', 'fire', 'lightning', 'poison', 'sniper'];
const ENEMY_TYPES = ['grunt', 'tank', 'runner', 'swarm', 'shield', 'healer', 'boss'];

// UI Setup
function setupUI() {
    const towerBtns = document.getElementById('tower-btns');
    const enemyBtns = document.getElementById('enemy-btns');

    TOWER_TYPES.forEach(type => {
        const btn = document.createElement('button');
        btn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        btn.onclick = () => showItem('tower', type);
        towerBtns?.appendChild(btn);
    });

    ENEMY_TYPES.forEach(type => {
        const btn = document.createElement('button');
        btn.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        btn.onclick = () => showItem('enemy', type);
        enemyBtns?.appendChild(btn);
    });

    document.getElementById('toggle-grid')?.addEventListener('change', (e) => {
        gridHelper.visible = (e.target as HTMLInputElement).checked;
        plane.visible = (e.target as HTMLInputElement).checked;
    });

    // Default selection
    showItem('tower', 'arrow');
}

function updateActiveButtons() {
    document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));

    const container = currentItemType === 'tower' ? 'tower-btns' : 'enemy-btns';
    const btns = document.getElementById(container)?.querySelectorAll('button');
    btns?.forEach(btn => {
        if (btn.textContent?.toLowerCase() === currentItemName.toLowerCase()) {
            btn.classList.add('active');
        }
    });
}

function showItem(category: 'tower' | 'enemy', name: string) {
    currentItemType = category;
    currentItemName = name;
    updateActiveButtons();

    // Clear old instances in state
    mockState.towers = [];
    mockState.enemies = [];
    mockState.projectiles = [];

    // Reset camera lookat
    controls.target.set(0, 0, 0);

    const newId = Date.now();

    if (category === 'tower') {
        const centerPos = cellToWorld(0, 0); // Find out where 0,0 maps to
        mockState.towers.push({
            id: newId,
            type: name,
            level: 0,
            col: 0,
            row: 0,
            worldX: centerPos.x,
            worldZ: centerPos.z,
            cooldownRemaining: 0,
            range: 3,
            fireRate: 1,
            damage: 10,
            targetId: null,
            totalInvested: 100,
            targetingMode: 'first'
        } as Tower);
        camera.position.set(2, 3, 3);
    } else {
        mockState.enemies.push({
            id: newId,
            type: name,
            maxHp: 100,
            hp: 80,
            maxShield: name === 'shield' ? 50 : 0,
            shield: name === 'shield' ? 50 : 0,
            speed: 1,
            reward: 10,
            bounty: 10,
            alive: true,
            reached: false,
            pathIndex: 0,
            pathProgress: 0,
            worldX: 0,
            worldZ: 0,
            prevWorldX: 0, // static for now
            prevWorldZ: 0,
            damage: 1,
            freezeTimer: 0,
            slow: { pct: 0, remaining: 0 },
            typeEffects: {},
            dots: [],
            armor: 0,
            special: '',
            healCooldown: 0
        } as Enemy);
        camera.position.set(1.5, 2, 2.5);
    }

    // Force sync renderers
    if (category === 'tower') {
        towerRenderer.sync(mockState);
        towerRenderer.showRange(mockState.towers[0], 2.5); // Preview range

        // Center the camera on the tower's actual generated position
        const centerPos = cellToWorld(0, 0);
        controls.target.set(centerPos.x, 0, centerPos.z);
        camera.position.set(centerPos.x + 2, 3, centerPos.z + 3);

    } else {
        // Clear old tower meshes explicitly if switching to enemy
        towerRenderer.sync({ towers: [], enemies: [] } as any);
        enemyRenderer.sync(mockState, 0, camera);

        controls.target.set(0, 0, 0);
        camera.position.set(1.5, 2, 2.5);
    }
}

let lastTime = performance.now();

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    controls.update();

    const doAnimate = (document.getElementById('toggle-animate') as HTMLInputElement)?.checked ?? true;
    const doRotate = (document.getElementById('toggle-rotate') as HTMLInputElement)?.checked ?? false;

    if (doRotate) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;
    } else {
        controls.autoRotate = false;
    }

    if (doAnimate) {
        if (currentItemType === 'tower') {
            towerRenderer.animate(dt, mockState);

            // Simulate cooling down
            if (mockState.towers[0].cooldownRemaining > 0) {
                mockState.towers[0].cooldownRemaining -= dt;
            }

            // Simulate sweeping aim
            const t = mockState.towers[0];
            if (t.aimAngle === undefined) t.aimAngle = 0;
            t.aimAngle += dt * 0.8; // Rotate slowly

            // Periodically fake an attack (reset cooldown to trigger animation bump)
            if (t.cooldownRemaining <= 0 && Math.random() < 0.02) {
                t.cooldownRemaining = 1.0; // 1 second cooldown

                let arcHeight = 0;
                let speed = PROJECTILE_SPEED;
                if (t.type === 'cannon' || t.type === 'poison') {
                    arcHeight = 1.5;
                    speed = PROJECTILE_SPEED * 0.8;
                } else if (t.type === 'lightning') {
                    speed = PROJECTILE_SPEED * 8.0;
                } else if (t.type === 'sniper') {
                    speed = PROJECTILE_SPEED * 4.0;
                } else if (t.type === 'fire') {
                    speed = PROJECTILE_SPEED * 0.6;
                }

                const angle = t.aimAngle;
                mockState.projectiles.push({
                    id: Date.now() + Math.random(),
                    towerId: t.id,
                    towerType: t.type,
                    targetId: 0,
                    x: t.worldX,
                    y: 0.8,
                    z: t.worldZ,
                    startX: t.worldX,
                    startY: 0.8,
                    startZ: t.worldZ,
                    targetX: t.worldX + Math.sin(angle) * 3,
                    targetY: 0.3,
                    targetZ: t.worldZ + Math.cos(angle) * 3,
                    speed,
                    progress: 0,
                    arcHeight,
                    damage: 10,
                    alive: true
                } as unknown as Projectile);
            }
        } else {
            // For Swarm wings etc., enemyRenderer handles it in sync()
            // Fake some movement so they point forward
            const e = mockState.enemies[0];
            if (e) {
                e.prevWorldZ = e.worldZ;
                e.worldZ += dt * 0.01;
                if (e.worldZ > 0.1) {
                    e.worldZ = -0.1;
                    e.prevWorldZ = -0.1;
                }
                enemyRenderer.sync(mockState, dt, camera);
            }
        }

        // Simulate projectiles
        for (let i = mockState.projectiles.length - 1; i >= 0; i--) {
            const p = mockState.projectiles[i];
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dz = p.targetZ - p.z;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const step = p.speed * dt;

            if (d <= step || d < 0.1) {
                fxRenderer.addExplosion(p.targetX, p.targetZ, p.towerType);
                p.alive = false;
                mockState.projectiles.splice(i, 1);
            } else {
                p.x += (dx / d) * step;
                p.z += (dz / d) * step;

                const totalDx = p.targetX - p.startX;
                const totalDz = p.targetZ - p.startZ;
                const totalDist = Math.max(0.1, Math.sqrt(totalDx * totalDx + totalDz * totalDz));

                const curDx = p.x - p.startX;
                const curDz = p.z - p.startZ;
                const curDist = Math.sqrt(curDx * curDx + curDz * curDz);

                p.progress = Math.min(1.0, curDist / totalDist);
                const base_y = p.startY + (p.targetY - p.startY) * p.progress;
                if (p.arcHeight > 0) {
                    p.y = base_y + Math.sin(p.progress * Math.PI) * p.arcHeight;
                } else {
                    p.y = base_y;
                }
            }
        }

        fxRenderer.sync(mockState, dt);
        projectileRenderer.sync(mockState, dt);
    } else {
        // Keep UI synced even if not strictly animating
        if (currentItemType === 'enemy') {
            enemyRenderer.sync(mockState, 0, camera);
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

setupUI();
animate();
