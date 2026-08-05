"use client";

import { useEffect, useRef, useState } from "react";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { GameAudio } from "./audio";
import { hasSupabaseFoundation, recordCompletedRun } from "./progress";

type GameStatus = "loading" | "ready" | "playing" | "victory" | "dead" | "error";
type CharacterClass = "warrior" | "wizard" | "ranger";

const CLASS_CONFIG: Record<
  CharacterClass,
  {
    label: string;
    epithet: string;
    icon: string;
    asset: string;
    attackAnimations: [string, string];
    attackCost: number;
    attackDuration: number;
    impactDelay: number;
    damage: [number, number];
    range: number;
    speed: number;
    focus: number;
    projectile: "none" | "magic" | "arrow";
  }
> = {
  warrior: {
    label: "OATHBOUND",
    epithet: "Blade · Guard · Poise",
    icon: "⚔",
    asset: "/assets/characters/warrior.glb",
    attackAnimations: ["Sword_Attack", "Sword_Attack2"],
    attackCost: 17,
    attackDuration: 0.66,
    impactDelay: 0.27,
    damage: [13, 17],
    range: 4.4,
    speed: 12.5,
    focus: 72,
    projectile: "none",
  },
  wizard: {
    label: "ASTROLOGER",
    epithet: "Sorcery · Range · Burst",
    icon: "✦",
    asset: "/assets/characters/wizard.glb",
    attackAnimations: ["Spell1", "Spell2"],
    attackCost: 23,
    attackDuration: 0.82,
    impactDelay: 0.48,
    damage: [18, 22],
    range: 16,
    speed: 12.1,
    focus: 100,
    projectile: "magic",
  },
  ranger: {
    label: "WAYFARER",
    epithet: "Bow · Mobility · Precision",
    icon: "➶",
    asset: "/assets/characters/ranger.glb",
    attackAnimations: ["Bow_Shoot", "Bow_Shoot"],
    attackCost: 20,
    attackDuration: 0.76,
    impactDelay: 0.43,
    damage: [15, 19],
    range: 18,
    speed: 13.4,
    focus: 84,
    projectile: "arrow",
  },
};

type HudState = {
  hp: number;
  stamina: number;
  bossHp: number;
  status: GameStatus;
  locked: boolean;
  hint: string;
  loading: number;
  encounter: "approach" | "cloister" | "causeway" | "boss";
  enemiesRemaining: number;
  bossActive: boolean;
};

type EngineBridge = {
  startAudio: () => void;
  setMuted: (muted: boolean) => void;
  selectClass: (characterClass: CharacterClass) => void;
  attack: () => void;
  dodge: () => void;
  toggleLock: () => void;
  interact: () => void;
  restart: () => void;
  setMove: (x: number, y: number) => void;
};

type MinionEnemy = {
  root: THREE.Group;
  body: CANNON.Body;
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  healthFill: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  healthBar: THREE.Group;
  hp: number;
  active: boolean;
  bodyAdded: boolean;
  wave: 0 | 1 | 2;
  state: "idle" | "run" | "attack" | "hit" | "dead";
  stateUntil: number;
  impactAt: number;
  impactDone: boolean;
  nextAttack: number;
  currentAction: string;
  spawn: [number, number];
  knockbackUntil: number;
};

const INITIAL_HUD: HudState = {
  hp: 100,
  stamina: 100,
  bossHp: 100,
  status: "loading",
  locked: true,
  hint: "",
  loading: 0,
  encounter: "approach",
  enemiesRemaining: 2,
  bossActive: false,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const resolveStaticAsset = (url: string) =>
  url.startsWith("/assets/")
    ? `${import.meta.env.BASE_URL}${url.slice(1)}`
    : url;

function configureModel(
  root: THREE.Object3D,
  targetHeight: number,
  tint?: string,
  tintStrength = 0.48,
) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.setScalar(scale);
  const scaledBox = new THREE.Box3().setFromObject(root);
  root.position.y -= scaledBox.min.y;

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const next = materials.map((source) => {
      const material = source.clone();
      if (material instanceof THREE.MeshStandardMaterial) {
        material.roughness = Math.max(material.roughness, 0.62);
        if (tint) material.color.lerp(new THREE.Color(tint), tintStrength);
      }
      return material;
    });
    child.material = Array.isArray(child.material) ? next : next[0];
  });
}

export default function GameClient() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<EngineBridge | null>(null);
  const startedRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const [audioMuted, setAudioMuted] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<CharacterClass>("warrior");
  const selectedClassRef = useRef<CharacterClass>("warrior");
  const stickRef = useRef<HTMLDivElement>(null);
  const stickPointer = useRef<number | null>(null);

  useEffect(() => {
    startedRef.current = started;
  }, [started]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let alive = true;
    let frame = 0;
    let lastTime = performance.now();
    let lastHudUpdate = 0;
    let lastDebugUpdate = 0;
    let worldReady = false;
    let cameraYaw = 0;
    let cameraShake = 0;
    let cameraDragging = false;
    let cameraPointerId: number | null = null;
    let lastCameraPointerX = 0;
    const gameAudio = new GameAudio();
    THREE.DefaultLoadingManager.setURLModifier(resolveStaticAsset);
    let nextFootstep = 0;
    mount.dataset.physicsEngine = "cannon-es";
    mount.dataset.persistence = hasSupabaseFoundation ? "supabase-ready" : "local-ready";

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111927");
    scene.fog = new THREE.Fog("#1b2736", 34, 96);

    const physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -18, 0),
    });
    physicsWorld.allowSleep = true;
    physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld);
    const physicsSolver = new CANNON.GSSolver();
    physicsSolver.iterations = 9;
    physicsSolver.tolerance = 0.001;
    physicsWorld.solver = physicsSolver;
    const groundPhysicsMaterial = new CANNON.Material("stone");
    const actorPhysicsMaterial = new CANNON.Material("actor");
    const enemyPhysicsMaterial = new CANNON.Material("enemy");
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(actorPhysicsMaterial, groundPhysicsMaterial, {
        friction: 0.22,
        restitution: 0,
        contactEquationStiffness: 1e7,
      }),
    );
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(actorPhysicsMaterial, actorPhysicsMaterial, {
        friction: 0.08,
        restitution: 0,
      }),
    );
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(enemyPhysicsMaterial, groundPhysicsMaterial, {
        friction: 0.035,
        restitution: 0,
        contactEquationStiffness: 1e7,
      }),
    );
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(enemyPhysicsMaterial, enemyPhysicsMaterial, {
        friction: 0.025,
        restitution: 0,
      }),
    );
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(enemyPhysicsMaterial, actorPhysicsMaterial, {
        friction: 0.035,
        restitution: 0,
      }),
    );
    const physicsGround = new CANNON.Body({
      type: CANNON.Body.STATIC,
      material: groundPhysicsMaterial,
      shape: new CANNON.Plane(),
    });
    physicsGround.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(physicsGround);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
    camera.position.set(0, 5.2, 11);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
    renderer.domElement.setAttribute("aria-label", "Elden Ring II 3D battle arena");
    renderer.domElement.setAttribute("tabindex", "0");
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.55));
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0.28,
      0.42,
      0.84,
    );
    const outputPass = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    mount.dataset.postProcessing = "aces-bloom";

    const hemi = new THREE.HemisphereLight("#9eb7da", "#242128", 1.12);
    scene.add(hemi);

    // 月光嘅陰影相機跟住玩家行，唔係釘死喺原點。
    //
    // 本來係 ±32 米一個固定框，啱啱好蓋得住嗰個半徑 22 嘅圓場。地圖向西
    // 擴咗之後，庭院喺 x = -60，完全跌出個框——即係行過去就成個場冇晒
    // 陰影。而「將個框車大到蓋晒」係最差嗰個答案：同一張 2048 貼圖攤開
    // 一倍半，全場陰影一齊變糊（31 毫米／texel 變 78）。
    // 跟住玩家行反而可以收窄到 ±26，即係比原本仲要銳利，而且無論地圖
    // 幾大都一樣。
    const MOON_OFFSET = new THREE.Vector3(-18, 28, 16);
    const moonLight = new THREE.DirectionalLight("#c7d8f4", 3.35);
    moonLight.position.copy(MOON_OFFSET);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.set(2048, 2048);
    moonLight.shadow.camera.left = -26;
    moonLight.shadow.camera.right = 26;
    moonLight.shadow.camera.top = 26;
    moonLight.shadow.camera.bottom = -26;
    moonLight.shadow.camera.far = 90;
    moonLight.shadow.bias = -0.0005;
    scene.add(moonLight);
    scene.add(moonLight.target);

    const arenaFill = new THREE.PointLight("#7f9fc8", 14, 38, 1.55);
    arenaFill.position.set(0, 9, 10);
    scene.add(arenaFill);

    // 西面庭院自己嘅補光。冇呢盞，過咗橋就只剩半球光，個場會平到冇立體感。
    const courtFill = new THREE.PointLight("#6f8fbe", 13, 34, 1.6);
    courtFill.position.set(-60, 9, 0);
    scene.add(courtFill);

    const bloodLight = new THREE.PointLight("#b72c1e", 22, 20, 2);
    bloodLight.position.set(0, 3.5, -8);
    scene.add(bloodLight);

    const graceLight = new THREE.PointLight("#e7bd67", 26, 18, 2);
    graceLight.position.set(9, 2.2, 15);
    scene.add(graceLight);

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(110, 32, 20),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          topColor: { value: new THREE.Color("#07101f") },
          horizonColor: { value: new THREE.Color("#35465b") },
          groundColor: { value: new THREE.Color("#121824") },
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 horizonColor;
          uniform vec3 groundColor;
          varying vec3 vWorldPosition;
          void main() {
            float height = normalize(vWorldPosition).y;
            float skyBlend = smoothstep(0.02, 0.65, height);
            float groundBlend = smoothstep(-0.34, -0.02, height);
            vec3 lower = mix(groundColor, horizonColor, groundBlend);
            gl_FragColor = vec4(mix(lower, topColor, skyBlend), 1.0);
          }
        `,
      }),
    );
    scene.add(sky);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: "#c5cfda", fog: false }),
    );
    moon.position.set(-34, 29, -68);
    scene.add(moon);

    const moonHalo = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 7.5, 64),
      new THREE.MeshBasicMaterial({
        color: "#8ea0bb",
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false,
        fog: false,
      }),
    );
    moonHalo.position.copy(moon.position).add(new THREE.Vector3(0, 0, 0.2));
    moonHalo.lookAt(camera.position);
    scene.add(moonHalo);

    // 地面要蓋得晒新地圖：西面庭院去到 x ≈ -73.5，東面圓場去到 +22.35。
    const GROUND_W = 200;
    const GROUND_D = 110;

    const textureLoader = new THREE.TextureLoader();
    const diffuseMap = textureLoader.load("/assets/materials/cobblestone-01/diffuse.jpg");
    const normalMap = textureLoader.load("/assets/materials/cobblestone-01/normal.jpg");
    const roughnessMap = textureLoader.load("/assets/materials/cobblestone-01/roughness.jpg");
    const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    [diffuseMap, normalMap, roughnessMap].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // 地面本來 84×84、repeat 12（即 0.143 個貼圖／米）。地圖向西擴咗之後
      // 個平面要跟住大，而 repeat 要跟住比例走——唔跟嘅話新嗰邊嘅石仔會
      // 被扯到成米咁大。呢兩個數係同一件事嘅兩半，所以由同一組常數計出嚟。
      texture.repeat.set(GROUND_W / 7, GROUND_D / 7);
      texture.anisotropy = maxAnisotropy;
    });
    diffuseMap.colorSpace = THREE.SRGBColorSpace;

    const groundGeometry = new THREE.PlaneGeometry(GROUND_W, GROUND_D);
    const ground = new THREE.Mesh(
      groundGeometry,
      new THREE.MeshStandardMaterial({
        color: "#68717a",
        map: diffuseMap,
        normalMap,
        normalScale: new THREE.Vector2(0.72, 0.72),
        roughness: 0.9,
        roughnessMap,
        metalness: 0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const pathDiffuseMap = textureLoader.load("/assets/materials/cobblestone-01/diffuse.jpg");
    const pathNormalMap = textureLoader.load("/assets/materials/cobblestone-01/normal.jpg");
    const pathRoughnessMap = textureLoader.load("/assets/materials/cobblestone-01/roughness.jpg");
    [pathDiffuseMap, pathNormalMap, pathRoughnessMap].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1.5, 9);
      texture.anisotropy = maxAnisotropy;
    });
    pathDiffuseMap.colorSpace = THREE.SRGBColorSpace;
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(7.5, 42, 1, 1),
      new THREE.MeshStandardMaterial({
        color: "#7d7364",
        map: pathDiffuseMap,
        normalMap: pathNormalMap,
        normalScale: new THREE.Vector2(0.82, 0.82),
        roughness: 0.86,
        roughnessMap: pathRoughnessMap,
      }),
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, 0.015, -1);
    path.receiveShadow = true;
    scene.add(path);

    const boundary = new THREE.Mesh(
      new THREE.RingGeometry(23, 23.4, 96),
      new THREE.MeshBasicMaterial({
        color: "#8c2a1e",
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
      }),
    );
    boundary.rotation.x = -Math.PI / 2;
    boundary.position.y = 0.04;
    scene.add(boundary);

    // 恩典點係一個列表，唔係一個變數。
    //
    // 本來得一個 `grace`，而佢個位置喺三個地方各自讀一次（量距離、按 E
    // 回血、出提示）。加第二個嗰陣，如果照抄一份就會變成同一份工寫兩次
    // ——第三次改嘅時候一定有一邊漏。而家一律問「最近嗰個」。
    const makeGrace = (x: number, z: number) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.2, 0.24, 9),
        new THREE.MeshStandardMaterial({ color: "#28241c", roughness: 0.9 }),
      );
      base.receiveShadow = true;
      group.add(base);
      const spiral = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.34, 0.055, 72, 8, 2, 3),
        new THREE.MeshBasicMaterial({ color: "#f0c96f" }),
      );
      spiral.position.y = 0.72;
      spiral.scale.set(1, 1.8, 1);
      group.add(spiral);
      scene.add(group);
      return group;
    };
    // 第二個擺喺西面庭院：過咗橋、打第三波之前有個唞氣位。冇呢個，
    // 玩家由頭到尾要走返成條走廊返去回血。
    const graces = [makeGrace(9, 15), makeGrace(-52.5, -6.5)];
    const grace = graces[0];
    const nearestGrace = (from: THREE.Vector3) => {
      let best = graces[0], bestD = Infinity;
      for (const g of graces) {
        const d = from.distanceTo(g.position);
        if (d < bestD) { best = g; bestD = d; }
      }
      return { grace: best, distance: bestD };
    };

    const starMaterial = new THREE.PointsMaterial({
      color: "#dcb85f",
      size: 0.055,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(540 * 3);
    for (let i = 0; i < 540; i += 1) {
      const radius = 8 + Math.random() * 34;
      const angle = Math.random() * Math.PI * 2;
      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = Math.random() * 13;
      starPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const ash = new THREE.Points(starGeometry, starMaterial);
    scene.add(ash);

    const graceParticleGeometry = new THREE.BufferGeometry();
    const graceParticles = new Float32Array(80 * 3);
    for (let i = 0; i < 80; i += 1) {
      const radius = Math.random() * 2.4;
      const angle = Math.random() * Math.PI * 2;
      graceParticles[i * 3] = Math.cos(angle) * radius;
      graceParticles[i * 3 + 1] = Math.random() * 4;
      graceParticles[i * 3 + 2] = Math.sin(angle) * radius;
    }
    graceParticleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(graceParticles, 3),
    );
    const graceDust = new THREE.Points(
      graceParticleGeometry,
      new THREE.PointsMaterial({
        color: "#f0cb72",
        size: 0.075,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    graceDust.position.copy(grace.position);
    scene.add(graceDust);
    const graceDustB = graceDust.clone();
    graceDustB.position.copy(graces[1].position);
    scene.add(graceDustB);
    const graceLightB = new THREE.PointLight("#e7bd67", 26, 18, 2);
    graceLightB.position.copy(graces[1].position).setY(2.2);
    scene.add(graceLightB);

    const telegraph = new THREE.Mesh(
      new THREE.RingGeometry(2.35, 2.55, 64),
      new THREE.MeshBasicMaterial({
        color: "#e4432f",
        transparent: true,
        opacity: 0.68,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    telegraph.rotation.x = -Math.PI / 2;
    telegraph.position.y = 0.06;
    telegraph.visible = false;
    scene.add(telegraph);

    const attackArc = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.045, 6, 42, Math.PI * 1.35),
      new THREE.MeshBasicMaterial({
        color: "#efc86f",
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    attackArc.visible = false;
    attackArc.rotation.x = Math.PI / 2;
    scene.add(attackArc);

    const magicProjectile = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.34, 2),
      new THREE.MeshStandardMaterial({
        color: "#b7edff",
        emissive: "#20a7ff",
        emissiveIntensity: 7.5,
        roughness: 0.16,
        metalness: 0.05,
      }),
    );
    const magicRingMaterial = new THREE.MeshBasicMaterial({
      color: "#80ddff",
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const magicRingA = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.035, 8, 32),
      magicRingMaterial,
    );
    const magicRingB = magicRingA.clone();
    magicRingA.rotation.x = Math.PI / 2;
    magicRingB.rotation.y = Math.PI / 2;
    magicProjectile.add(magicRingA, magicRingB);
    const magicHalo = new THREE.PointLight("#69cfff", 28, 10, 2);
    magicProjectile.add(magicHalo);
    magicProjectile.visible = false;
    scene.add(magicProjectile);

    const arrowProjectile = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.05, 6),
      new THREE.MeshStandardMaterial({
        color: "#d4b36c",
        emissive: "#77501c",
        emissiveIntensity: 0.6,
        roughness: 0.55,
      }),
    );
    arrowProjectile.rotation.z = Math.PI / 2;
    arrowProjectile.visible = false;
    scene.add(arrowProjectile);
    const projectileStart = new THREE.Vector3();
    const projectileTarget = new THREE.Vector3();

    const impactGeometry = new THREE.BufferGeometry();
    const impactPositions = new Float32Array(42 * 3);
    impactGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(impactPositions, 3),
    );
    const impact = new THREE.Points(
      impactGeometry,
      new THREE.PointsMaterial({
        color: "#ffcf72",
        size: 0.12,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(impact);
    let impactLife = 0;
    const impactVelocities = Array.from({ length: 42 }, () => new THREE.Vector3());

    const playerRoot = new THREE.Group();
    const bossRoot = new THREE.Group();
    playerRoot.position.set(0, 0, 17);
    bossRoot.position.set(0, 0, -15);
    scene.add(playerRoot, bossRoot);

    const addCapsuleShapes = (body: CANNON.Body, radius: number, segment: number) => {
      body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, -segment, 0));
      body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, 0, 0));
      body.addShape(new CANNON.Sphere(radius), new CANNON.Vec3(0, segment, 0));
    };
    const playerRadius = 0.48;
    const playerSegment = 0.38;
    const playerGroundOffset = playerRadius + playerSegment;
    const bossRadius = 0.86;
    const bossSegment = 0.72;
    const bossGroundOffset = bossRadius + bossSegment;
    const minionRadius = 0.4;
    const minionSegment = 0.34;
    const minionGroundOffset = minionRadius + minionSegment;
    const playerBody = new CANNON.Body({
      mass: 72,
      material: actorPhysicsMaterial,
      linearDamping: 0.78,
      fixedRotation: true,
      position: new CANNON.Vec3(0, playerGroundOffset, 17),
    });
    addCapsuleShapes(playerBody, playerRadius, playerSegment);
    const bossBody = new CANNON.Body({
      mass: 190,
      material: enemyPhysicsMaterial,
      linearDamping: 0.86,
      fixedRotation: true,
      position: new CANNON.Vec3(0, bossGroundOffset, -15),
    });
    addCapsuleShapes(bossBody, bossRadius, bossSegment);
    playerBody.updateMassProperties();
    bossBody.updateMassProperties();
    physicsWorld.addBody(playerBody);
    physicsWorld.addBody(bossBody);

    // 記住所有靜態障礙，畀測試查「兩個場之間有冇路行」。
    // 用瀏覽器行過去驗證喺呢度唔可行：軟件光柵化只得三幀，角色一秒行
    // 半米，而且一撞到雜兵就企喺度——量到嘅係機械人蠢，唔係地圖通唔通。
    const staticBoxes: Array<{ x: number; z: number; hx: number; hz: number; ry: number }> = [];
    const addStaticBox = (
      position: [number, number, number],
      halfExtents: [number, number, number],
      rotationY = 0,
    ) => {
      staticBoxes.push({
        x: position[0], z: position[2],
        hx: halfExtents[0], hz: halfExtents[2], ry: rotationY,
      });
      const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        material: groundPhysicsMaterial,
        shape: new CANNON.Box(new CANNON.Vec3(...halfExtents)),
        position: new CANNON.Vec3(...position),
      });
      body.quaternion.setFromEuler(0, rotationY, 0);
      physicsWorld.addBody(body);
      return body;
    };

    // ---------- 地圖形狀 ----------
    //
    // 本來成隻遊戲得一個半徑 22.35 嘅圓場，而所有嘢都排喺 z = +17 行到
    // z = -15 嗰條走廊入面（出生、兩波雜兵、boss 全部喺 x ≈ 0 附近）。
    // 即係一個 1569 平方米嘅場，真正用到嘅大約係 12 米闊嗰條，四分三嘅
    // 地你行得到但永遠冇理由去。
    //
    // 所以擴張唔係「將個圓車大啲」——空地唔係地圖。西面開一道門，過條橋
    // 去到第二個庭院，嗰度有自己嘅目標。橋同門同塔用嘅係倉入面已經有、
    // 但由頭到尾冇擺出嚟過嘅三個模型（bridge-straight-pillar、gate、
    // tower-square-top-roof-high-windows）——佢哋一直都有 ship 畀玩家落載，
    // 只係一格都冇出現過。
    //
    // 個形狀寫成數據，唔係一堆 addStaticBox。牆係由呢幾個數生出嚟嘅，
    // 所以「牆喺邊」同「地圖係點」永遠唔會各講各嘅。
    const ARENA = { r: 22.35 };
    const GATE = { angle: Math.PI, halfWidth: 0.16 };   // 西面開口（弧度）
    const BRIDGE = { x0: -47, x1: -ARENA.r, halfWidth: 3.2 };
    const COURT = { cx: -60, cz: 0, r: 17 };
    const WALL_Y = 1.8, WALL_H = 1.8, WALL_T = 0.42;

    // 圓形牆，但要留返個門口。留門嗰段唔可以靠「跳過一格」——一格嘅闊度
    // 係跟分段數走嘅，改分段數個門口就會自己變大變細。所以用角度界定。
    const ringWall = (cx: number, cz: number, radius: number, segments: number,
                      skip?: { angle: number; halfWidth: number }) => {
      const half = radius * Math.tan(Math.PI / segments) + 0.18;
      for (let index = 0; index < segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        if (skip) {
          let d = Math.abs(angle - skip.angle) % (Math.PI * 2);
          if (d > Math.PI) d = Math.PI * 2 - d;
          if (d < skip.halfWidth) continue;
        }
        addStaticBox(
          [cx + Math.cos(angle) * radius, WALL_Y, cz + Math.sin(angle) * radius],
          [half, WALL_H, WALL_T],
          Math.PI / 2 - angle,
        );
      }
    };
    ringWall(0, 0, ARENA.r, 32, GATE);
    ringWall(COURT.cx, COURT.cz, COURT.r, 28, { angle: 0, halfWidth: 0.19 });

    // 橋兩邊嘅欄杆。冇欄杆嘅話玩家會由橋邊行出去，然後企喺半空——
    // 呢度冇「跌落去」呢回事，地板係一塊無限平面。
    const bridgeLength = BRIDGE.x1 - BRIDGE.x0;
    const bridgeMidX = (BRIDGE.x0 + BRIDGE.x1) / 2;
    for (const side of [-1, 1]) {
      addStaticBox(
        [bridgeMidX, WALL_Y, side * BRIDGE.halfWidth],
        [bridgeLength / 2, WALL_H, WALL_T],
      );
    }
    addStaticBox([-14, 1.5, 12], [2.1, 1.5, 1.8], -0.4);
    addStaticBox([14, 1.7, -6], [2.3, 1.7, 2], -1.7);
    addStaticBox([13, 1.5, 8], [2.2, 1.5, 1.4], 0.7);
    addStaticBox([-18, 2.2, 10], [1.25, 2.2, 1.25]);
    addStaticBox([18, 2.2, 14], [1.25, 2.2, 1.25]);
    addStaticBox([9, 0.75, 15], [0.85, 0.75, 0.85]);
    addStaticBox([-4.7, 2.4, -17.8], [0.7, 2.4, 0.7]);
    addStaticBox([4.7, 2.4, -17.8], [0.7, 2.4, 0.7]);
    addStaticBox([-11.2, 2.3, -11.6], [0.75, 2.3, 0.75]);
    addStaticBox([11.2, 2.3, -11.6], [0.75, 2.3, 0.75]);

    const bossGate = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 5, 16, 10),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          time: { value: 0 },
          opacity: { value: 0.82 },
        },
        vertexShader: `
          uniform float time;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 shifted = position;
            shifted.z += sin(position.y * 4.5 + time * 2.4) * 0.08;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(shifted, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float opacity;
          varying vec2 vUv;
          void main() {
            float edge = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x));
            float vertical = 0.5 + 0.5 * sin(vUv.y * 28.0 - time * 3.0);
            vec3 color = mix(vec3(0.18, 0.03, 0.03), vec3(0.82, 0.14, 0.07), vertical);
            gl_FragColor = vec4(color, (0.28 + vertical * 0.34) * edge * opacity);
          }
        `,
      }),
    );
    bossGate.position.set(0, 2.5, -9);
    scene.add(bossGate);
    let bossGateBody: CANNON.Body | null = addStaticBox(
      [0, 2.5, -9],
      [4, 2.5, 0.36],
    );
    let gateFade = 1;

    let playerMixer: THREE.AnimationMixer | null = null;
    let bossMixer: THREE.AnimationMixer | null = null;
    let playerActions = new Map<string, THREE.AnimationAction>();
    const bossActions = new Map<string, THREE.AnimationAction>();
    const playerLoadouts = new Map<
      CharacterClass,
      {
        root: THREE.Object3D;
        mixer: THREE.AnimationMixer;
        actions: Map<string, THREE.AnimationAction>;
      }
    >();
    let currentClass = selectedClassRef.current;
    let currentPlayerAction = "";
    let currentBossAction = "";

    const playAction = (
      actionMap: Map<string, THREE.AnimationAction>,
      name: string,
      current: string,
      loopOnce = false,
      timeScale = 1,
    ) => {
      if (current === name) return current;
      const next = actionMap.get(name);
      if (!next) return current;
      const previous = actionMap.get(current);
      previous?.fadeOut(0.16);
      next.reset();
      next.setEffectiveTimeScale(timeScale);
      next.setLoop(loopOnce ? THREE.LoopOnce : THREE.LoopRepeat, loopOnce ? 1 : Infinity);
      next.clampWhenFinished = loopOnce;
      next.fadeIn(0.16).play();
      return name;
    };

    const keys = new Set<string>();
    const touchMove = new THREE.Vector2();
    let queuedAttack = false;
    let queuedDodge = false;
    let queuedLock = false;
    let queuedInteract = false;

    const player = {
      hp: 100,
      stamina: 100,
      rotation: Math.PI,
      state: "idle" as "idle" | "attack" | "dodge" | "dead",
      stateUntil: 0,
      impactAt: 0,
      impactDone: false,
      invincibleUntil: 0,
      knockbackUntil: 0,
      knockbackDirection: new THREE.Vector3(),
      combo: 0,
      dodgeDirection: new THREE.Vector3(0, 0, -1),
    };

    const boss = {
      hp: 100,
      state: "idle" as "idle" | "run" | "windup" | "recover" | "hit" | "dead",
      stateUntil: 0,
      impactAt: 0,
      impactDone: false,
      nextAttack: 0,
      phase: 1,
      knockbackUntil: 0,
    };

    const minions: MinionEnemy[] = [];
    let encounterStage: 0 | 1 | 2 | 3 = 0;
    let bossActive = false;
    let attackTarget: MinionEnemy | "boss" | null = null;
    let runStartedAt: number | null = null;
    let runRecorded = false;

    const persistRun = (result: "victory" | "dead") => {
      if (runRecorded) return;
      runRecorded = true;
      const durationMs = Math.max(
        1,
        Math.round(performance.now() - (runStartedAt ?? performance.now() - 1)),
      );
      void recordCompletedRun({
        characterClass: currentClass,
        result,
        durationMs,
        minionsDefeated: minions.filter((minion) => minion.hp <= 0).length,
        bossHpRemaining: Math.round(boss.hp),
      });
    };

    // 量度用：郁動用嘅時間累加咗幾多、雜兵出咗幾多手。
    let motionClock = 0;
    let minionAttacks = 0;

    const livingMinions = () => minions.filter((minion) => minion.active && minion.hp > 0);

    const activateWave = (wave: 0 | 1 | 2) => {
      encounterStage = wave;
      minions.forEach((minion) => {
        if (minion.wave !== wave) return;
        minion.hp = 35;
        minion.active = true;
        minion.state = "idle";
        minion.stateUntil = 0;
        minion.knockbackUntil = 0;
        minion.impactDone = false;
        minion.nextAttack = motionClock + 0.8 + Math.random() * 0.7;
        minion.root.visible = true;
        minion.healthBar.visible = true;
        minion.healthFill.scale.x = 1;
        minion.healthFill.position.x = 0;
        minion.body.position.set(minion.spawn[0], minionGroundOffset, minion.spawn[1]);
        minion.body.velocity.setZero();
        minion.body.collisionResponse = true;
        if (!minion.bodyAdded) {
          physicsWorld.addBody(minion.body);
          minion.bodyAdded = true;
        }
        minion.body.wakeUp();
        minion.currentAction = playAction(
          minion.actions,
          "Spawn_Ground_Skeletons",
          minion.currentAction,
          true,
          1.18,
        );
        burst(minion.root.position, "#8cb9a1");
        gameAudio.play("enemySpawn", minion.root.position.x, minion.root.position.z);
      });
      // 三個 wave 對三個名，用一個表——之前係 `wave === 0 ? a : b`，
      // 寫喺兩個地方，加第三個就一定有一邊漏。
      const mix = (["approach", "cloister", "causeway"] as const)[wave];
      gameAudio.setEncounter(mix);
      const count = minions.filter((minion) => minion.wave === wave).length;
      setHud((state) => ({
        ...state,
        encounter: mix,
        enemiesRemaining: count,
        bossActive: false,
      }));
    };

    const unlockBossEncounter = () => {
      encounterStage = 3;
      bossActive = true;
      if (bossGateBody) {
        physicsWorld.removeBody(bossGateBody);
        bossGateBody = null;
      }
      gateFade = 1;
      bossBody.position.set(0, bossGroundOffset, -15);
      bossBody.velocity.setZero();
      bossBody.wakeUp();
      boss.nextAttack = motionClock + 1.4;
      burst(bossRoot.position, "#ff4b2e");
      gameAudio.setEncounter("boss");
      gameAudio.play("gateOpen", bossGate.position.x, bossGate.position.z);
      setHud((state) => ({
        ...state,
        encounter: "boss",
        enemiesRemaining: 0,
        bossActive: true,
      }));
    };

    const advanceEncounter = () => {
      if (livingMinions().length > 0) {
        setHud((state) => ({ ...state, enemiesRemaining: livingMinions().length }));
        return;
      }
      if (encounterStage === 0) activateWave(1);
      else if (encounterStage === 1) activateWave(2);
      else if (encounterStage === 2) unlockBossEncounter();
    };

    const nearestEnemy = () => {
      let nearest: MinionEnemy | "boss" | null = bossActive && boss.hp > 0 ? "boss" : null;
      let nearestDistance = nearest === "boss"
        ? playerRoot.position.distanceToSquared(bossRoot.position)
        : Number.POSITIVE_INFINITY;
      livingMinions().forEach((minion) => {
        const distance = playerRoot.position.distanceToSquared(minion.root.position);
        if (distance < nearestDistance) {
          nearest = minion;
          nearestDistance = distance;
        }
      });
      return nearest;
    };

    const targetRoot = (target: MinionEnemy | "boss" | null) =>
      target === "boss" ? bossRoot : target?.root ?? null;

    const findSweptAttackTarget = (
      range: number,
      sweepRadius: number,
    ): MinionEnemy | "boss" | null => {
      const origin = playerRoot.position;
      const attackDirection = new THREE.Vector3(
        Math.sin(player.rotation),
        0,
        Math.cos(player.rotation),
      );
      const candidates: Array<MinionEnemy | "boss"> = [...livingMinions()];
      if (bossActive && boss.hp > 0) candidates.push("boss");
      let best: MinionEnemy | "boss" | null = null;
      let bestScore = Number.POSITIVE_INFINITY;
      candidates.forEach((candidate) => {
        const root = targetRoot(candidate);
        if (!root) return;
        const offset = root.position.clone().sub(origin);
        const projected = offset.dot(attackDirection);
        const radius = candidate === "boss" ? bossRadius : minionRadius;
        if (projected < -radius || projected > range + radius) return;
        const lateralSq = Math.max(0, offset.lengthSq() - projected * projected);
        const hitWidth = sweepRadius + radius;
        if (lateralSq > hitWidth * hitWidth) return;
        const preferredBias = candidate === attackTarget ? -0.45 : 0;
        const score = projected + Math.sqrt(lateralSq) * 1.6 + preferredBias;
        if (score < bestScore) {
          best = candidate;
          bestScore = score;
        }
      });
      return best;
    };

    const beginAudio = () => {
      void gameAudio.start().then(() => {
        if (alive) mount.dataset.audioReady = "true";
      });
    };

    const burst = (position: THREE.Vector3, color = "#ffcf72") => {
      impact.position.copy(position).add(new THREE.Vector3(0, 1.25, 0));
      const attribute = impactGeometry.attributes.position as THREE.BufferAttribute;
      const material = impact.material as THREE.PointsMaterial;
      material.color.set(color);
      material.opacity = 1;
      for (let i = 0; i < 42; i += 1) {
        attribute.setXYZ(i, 0, 0, 0);
        impactVelocities[i].set(
          (Math.random() - 0.5) * 5,
          Math.random() * 4.2,
          (Math.random() - 0.5) * 5,
        );
      }
      attribute.needsUpdate = true;
      impactLife = 0.55;
    };

    const loaderManager = new THREE.LoadingManager();
    loaderManager.setURLModifier(resolveStaticAsset);
    loaderManager.onProgress = (_url, loaded, total) => {
      if (!alive) return;
      setHud((state) => ({ ...state, loading: Math.round((loaded / total) * 100) }));
    };
    const loader = new GLTFLoader(loaderManager);
    const loadModel = async (url: string) => {
      let latestError: unknown = new Error(`Unable to load ${url}`);
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          return await loader.loadAsync(url);
        } catch (error) {
          latestError = error;
          if (attempt < 2) {
            await new Promise((resolve) => window.setTimeout(resolve, 300 * (attempt + 1)));
          }
        }
      }
      throw latestError;
    };

    const addEnvironment = async (
      url: string,
      height: number,
      position: [number, number, number],
      rotation = 0,
      tint = "#77766f",
      tintStrength = 0.48,
    ) => {
      const gltf = await loadModel(url);
      const object = gltf.scene;
      configureModel(object, height, tint, tintStrength);
      object.position.x += position[0];
      object.position.y += position[1];
      object.position.z += position[2];
      object.rotation.y = rotation;
      scene.add(object);
      return object;
    };

    const selectCharacterClass = (characterClass: CharacterClass) => {
      currentClass = characterClass;
      mount.dataset.characterClass = characterClass;
      playerLoadouts.forEach((loadout, loadoutClass) => {
        loadout.root.visible = loadoutClass === characterClass;
      });
      const loadout = playerLoadouts.get(characterClass);
      if (!loadout) return;
      playerMixer?.stopAllAction();
      playerMixer = loadout.mixer;
      playerActions = loadout.actions;
      currentPlayerAction = "";
      currentPlayerAction = playAction(playerActions, "Idle_Weapon", currentPlayerAction);
    };

    const loadWorld = async () => {
      const environmentPromise = Promise.all([
        addEnvironment("/assets/environment/wall-doorway.glb", 7.4, [0, 0, -24], Math.PI, "#989f9d"),
        addEnvironment("/assets/environment/tower-square.glb", 12, [-9, 0, -25], 0, "#878e8c"),
        addEnvironment("/assets/environment/wall.glb", 5.2, [-17.5, 0, -19], Math.PI / 2, "#818986"),
        addEnvironment("/assets/environment/wall.glb", 5.2, [17.5, 0, -19], Math.PI / 2, "#818986"),
        addEnvironment("/assets/environment/wall-corner-half-tower.glb", 7.8, [-21, 0, 0], Math.PI / 2, "#7d8582"),
        addEnvironment("/assets/environment/wall-corner-half-tower.glb", 7.8, [21, 0, 0], -Math.PI / 2, "#7d8582"),
        addEnvironment("/assets/environment/siege-trebuchet.glb", 5.6, [13, 0, 8], -0.7, "#948570"),
        addEnvironment("/assets/environment/rocks-large.glb", 3.8, [-14, 0, 12], 0.4, "#8b8d88"),
        addEnvironment("/assets/environment/rocks-large.glb", 4.4, [14, 0, -6], 1.7, "#838985"),
        addEnvironment("/assets/environment/tree-large.glb", 8.5, [-18, 0, 10], -0.6, "#56635b"),
        addEnvironment("/assets/environment/tree-large.glb", 7.4, [18, 0, 14], 0.8, "#526057"),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_arched.gltf.glb", 7.6, [0, 0, -21.4], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_broken.gltf.glb", 7.2, [-7.2, 0, -21.2], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_cracked.gltf.glb", 7.2, [7.2, 0, -21.2], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_window_open.gltf.glb", 6.2, [-14.2, 0, -18.5], 0.08, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_window_open.gltf.glb", 6.2, [14.2, 0, -18.5], -0.08, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [-4.7, 0, -17.8], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [4.7, 0, -17.8], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/column.gltf.glb", 5.2, [-11.2, 0, -11.6], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/column.gltf.glb", 5.2, [11.2, 0, -11.6], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.7, [-8.8, 0, -13.8], 0.3, "#8a8f91", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.5, [8.9, 0, -12.4], -0.5, "#8a8f91", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/banner_patternA_red.gltf.glb", 3.4, [-3.2, 3.2, -21], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/banner_patternA_red.gltf.glb", 3.4, [3.2, 3.2, -21], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-2.2, 2.5, -20.7], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [2.2, 2.5, -20.7], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/barrel_small_stack.gltf.glb", 1.3, [-11.5, 0, 1.5], 0.4, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/crates_stacked.gltf.glb", 1.8, [11.5, 0, 0], -0.35, "#ffffff", 0),

        // ---------- 西面：門、橋、庭院 ----------
        // 呢三個模型（gate、bridge-straight-pillar、tower-square-top-roof-
        // high-windows）一直都喺 public/ 入面、一直都 ship 咗畀玩家落載，
        // 但一格都冇出現過。擴地圖唔使加新資產，用返已經喺度嗰啲就夠。
        addEnvironment("/assets/environment/gate.glb", 8.6, [-22.3, 0, 0], Math.PI / 2, "#8a9196"),
        // 通道兩邊用 wall.glb 砌走廊。原本擺咗三座 bridge-straight-pillar
        // 落中線，影出嚟先知嗰個模型係一整段有橋墩嘅高架橋——橋面喺人頭
        // 高度，玩家係由**橋底**穿過去，畫面讀落係一堵牆擋住條路。連通性
        // 個 gate 當時係綠嘅（物理上真係行得過），但綠嘅 gate 唔代表個景啱。
        ...[-27.5, -34.5, -41.5, -46.5].flatMap((x) => [
          addEnvironment("/assets/environment/wall.glb", 5.2, [x, 0, -3.4], 0, "#818986"),
          addEnvironment("/assets/environment/wall.glb", 5.2, [x, 0, 3.4], 0, "#818986"),
        ]),
        // 兩座塔擺喺庭院牆外做天際線，唔擺入場中——16 米高嘅塔放喺一個
        // 十幾米半徑嘅院入面，鏡頭一入去就係成幅牆。
        addEnvironment("/assets/environment/tower-square-top-roof-high-windows.glb", 16, [-62, 0, -24], 0, "#818b90"),
        addEnvironment("/assets/environment/tower-square.glb", 11, [-78, 0, 9], 0.5, "#7c8582"),
        addEnvironment("/assets/environment/wall-corner-half-tower.glb", 7.8, [-60, 0, 17.6], Math.PI, "#7d8582"),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [-53, 0, -7.4], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [-53, 0, 7.4], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.8, [-58.5, 0, 5.1], 0.9, "#8a8f91", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-51.6, 2.5, -2.4], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-51.6, 2.5, 2.4], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/rocks-large.glb", 4.0, [-68, 0, -8], 2.2, "#8b8d88"),
        addEnvironment("/assets/environment/tree-large.glb", 8.0, [-66, 0, 12], 1.1, "#56635b"),
      ]);
      const characterClasses = Object.keys(CLASS_CONFIG) as CharacterClass[];
      const [characterGltfs, bossGltf, skeletonGltf] = await Promise.all([
        Promise.all(characterClasses.map((characterClass) =>
          loadModel(CLASS_CONFIG[characterClass].asset),
        )),
        loadModel("/assets/monsters/demon.gltf"),
        loadModel("/assets/enemies/skeleton-minion.glb"),
      ]);
      if (!alive) return;

      characterGltfs.forEach((gltf, index) => {
        const characterClass = characterClasses[index];
        const tint =
          characterClass === "wizard"
            ? "#aebbd2"
            : characterClass === "ranger"
              ? "#b7b29f"
              : "#c4c7c7";
        configureModel(gltf.scene, 2.12, tint, 0.18);
        const mixer = new THREE.AnimationMixer(gltf.scene);
        const actions = new Map<string, THREE.AnimationAction>();
        gltf.animations.forEach((clip) => actions.set(clip.name, mixer.clipAction(clip)));
        gltf.scene.visible = false;
        playerRoot.add(gltf.scene);
        playerLoadouts.set(characterClass, { root: gltf.scene, mixer, actions });
      });
      selectCharacterClass(currentClass);

      configureModel(bossGltf.scene, 4.55, "#b77b72", 0.22);
      bossRoot.add(bossGltf.scene);
      bossMixer = new THREE.AnimationMixer(bossGltf.scene);
      bossGltf.animations.forEach((clip) =>
        bossActions.set(clip.name, bossMixer!.clipAction(clip)),
      );
      currentBossAction = playAction(bossActions, "Idle", "");

      configureModel(skeletonGltf.scene, 1.88, "#afb8b0", 0.08);
      const minionSpawns: Array<{ wave: 0 | 1 | 2; spawn: [number, number] }> = [
        { wave: 0, spawn: [-4.2, 8.2] },
        { wave: 0, spawn: [4.2, 7.2] },
        { wave: 1, spawn: [-5.1, -2.7] },
        { wave: 1, spawn: [0, -5.3] },
        { wave: 1, spawn: [5.1, -2.7] },
        // 第三波擺喺西面庭院。冇呢一波，新地圖就係得個景 —— 有地方，
        // 但玩家永遠冇理由行過去。而家唔清呢一波，boss 門唔會開。
        { wave: 2, spawn: [-56.5, -4.6] },
        { wave: 2, spawn: [-61.5, 0] },
        { wave: 2, spawn: [-56.5, 4.6] },
      ];
      minionSpawns.forEach(({ wave, spawn }) => {
        const model = cloneSkinned(skeletonGltf.scene);
        const root = new THREE.Group();
        root.add(model);
        root.position.set(spawn[0], 0, spawn[1]);
        root.visible = false;
        const mixer = new THREE.AnimationMixer(model);
        const actions = new Map<string, THREE.AnimationAction>();
        skeletonGltf.animations.forEach((clip) =>
          actions.set(clip.name, mixer.clipAction(clip)),
        );

        const healthBar = new THREE.Group();
        const healthBack = new THREE.Mesh(
          new THREE.PlaneGeometry(0.94, 0.1),
          new THREE.MeshBasicMaterial({
            color: "#090a0b",
            transparent: true,
            opacity: 0.82,
            depthTest: false,
          }),
        );
        const healthFill = new THREE.Mesh(
          new THREE.PlaneGeometry(0.86, 0.055),
          new THREE.MeshBasicMaterial({
            color: "#a9362e",
            depthTest: false,
          }),
        );
        healthFill.position.z = 0.01;
        healthBar.add(healthBack, healthFill);
        healthBar.position.y = 2.22;
        healthBar.renderOrder = 10;
        healthBar.visible = false;
        root.add(healthBar);

        const body = new CANNON.Body({
          mass: 44,
          material: enemyPhysicsMaterial,
          linearDamping: 0.84,
          fixedRotation: true,
          position: new CANNON.Vec3(spawn[0], minionGroundOffset, spawn[1]),
        });
        addCapsuleShapes(body, minionRadius, minionSegment);
        body.updateMassProperties();
        scene.add(root);
        minions.push({
          root,
          body,
          mixer,
          actions,
          healthFill,
          healthBar,
          hp: 35,
          active: false,
          bodyAdded: false,
          wave,
          state: "idle",
          stateUntil: 0,
          impactAt: 0,
          impactDone: false,
          nextAttack: 0,
          currentAction: "",
          spawn,
          knockbackUntil: 0,
        });
      });

      await environmentPromise;

      const torchLightLeft = new THREE.PointLight("#ff9a48", 22, 12, 2);
      torchLightLeft.position.set(-2.2, 3.8, -20.2);
      const torchLightRight = torchLightLeft.clone();
      torchLightRight.position.x = 2.2;
      scene.add(torchLightLeft, torchLightRight);

      if (!alive) return;
      activateWave(0);
      worldReady = true;
      delete mount.dataset.loadError;
      setHud((state) => ({
        ...state,
        loading: 100,
        status: startedRef.current ? "playing" : "ready",
      }));
    };

    loadWorld().catch((error) => {
      console.error("Failed to load the 3D world", error);
      if (alive) {
        mount.dataset.loadError = "true";
        setHud((state) => ({ ...state, status: "error", loading: 0 }));
      }
    });

    const restart = () => {
      player.hp = 100;
      player.stamina = 100;
      player.state = "idle";
      player.stateUntil = 0;
      player.invincibleUntil = 0;
      player.knockbackUntil = 0;
      playerRoot.position.set(0, 0, 17);
      playerBody.position.set(0, playerGroundOffset, 17);
      playerBody.velocity.setZero();
      playerBody.angularVelocity.setZero();
      playerBody.wakeUp();
      player.rotation = Math.PI;
      playerRoot.rotation.y = player.rotation;
      boss.hp = 100;
      boss.state = "idle";
      boss.phase = 1;
      boss.knockbackUntil = 0;
      boss.nextAttack = motionClock + 1.4;
      bossRoot.position.set(0, 0, -15);
      bossBody.position.set(0, bossGroundOffset, -15);
      bossBody.velocity.setZero();
      bossBody.angularVelocity.setZero();
      bossBody.wakeUp();
      bossRoot.visible = true;
      bossActive = false;
      encounterStage = 0;
      attackTarget = null;
      runStartedAt = performance.now();
      runRecorded = false;
      bossGate.visible = true;
      gateFade = 1;
      (bossGate.material as THREE.ShaderMaterial).uniforms.opacity.value = 0.82;
      if (!bossGateBody) {
        bossGateBody = addStaticBox([0, 2.5, -9], [4, 2.5, 0.36]);
      }
      minions.forEach((minion) => {
        minion.mixer.stopAllAction();
        minion.currentAction = "";
        minion.active = false;
        minion.hp = 35;
        minion.state = "idle";
        minion.knockbackUntil = 0;
        minion.healthBar.visible = false;
        minion.root.visible = false;
        minion.body.collisionResponse = true;
        minion.body.velocity.setZero();
        if (minion.bodyAdded) {
          physicsWorld.removeBody(minion.body);
          minion.bodyAdded = false;
        }
      });
      bloodLight.color.set("#b72c1e");
      bloodLight.intensity = 22;
      currentPlayerAction = playAction(playerActions, "Idle_Weapon", currentPlayerAction);
      currentBossAction = playAction(bossActions, "Idle", currentBossAction);
      gameAudio.setEncounter("approach");
      activateWave(0);
      setHud({
        ...INITIAL_HUD,
        status: "playing",
        loading: 100,
        locked: true,
        encounter: "approach",
        enemiesRemaining: 2,
        bossActive: false,
      });
      renderer.domElement.focus();
    };

    engineRef.current = {
      startAudio: beginAudio,
      setMuted: (muted) => gameAudio.setMuted(muted),
      selectClass: selectCharacterClass,
      attack: () => {
        queuedAttack = true;
        beginAudio();
      },
      dodge: () => {
        queuedDodge = true;
        beginAudio();
      },
      toggleLock: () => {
        queuedLock = true;
        beginAudio();
      },
      interact: () => {
        queuedInteract = true;
      },
      restart,
      setMove: (x, y) => touchMove.set(x, y),
    };

    const onKeyDown = (event: KeyboardEvent) => {
      keys.add(event.code);
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.repeat) return;
      if (event.code === "Space") queuedDodge = true;
      if (event.code === "KeyJ" || event.code === "KeyF") queuedAttack = true;
      if (event.code === "KeyQ") queuedLock = true;
      if (event.code === "KeyE") queuedInteract = true;
      if (event.code === "KeyR" && (player.state === "dead" || boss.state === "dead")) restart();
      beginAudio();
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code);
    const onPointerDown = (event: PointerEvent) => {
      renderer.domElement.focus();
      beginAudio();
      const canvasBounds = renderer.domElement.getBoundingClientRect();
      const isTouchCameraDrag =
        event.pointerType !== "mouse" &&
        event.clientX >= canvasBounds.left + canvasBounds.width * 0.5;
      const isMouseCameraDrag = event.pointerType === "mouse" && event.button === 2;
      if (isTouchCameraDrag || isMouseCameraDrag) {
        cameraDragging = true;
        cameraPointerId = event.pointerId;
        lastCameraPointerX = event.clientX;
        if (locked) {
          locked = false;
          setHud((state) => ({ ...state, locked: false }));
        }
        renderer.domElement.setPointerCapture(event.pointerId);
        event.preventDefault();
      } else if (event.pointerType === "mouse" && event.button === 0 && startedRef.current) {
        queuedAttack = true;
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!cameraDragging || cameraPointerId !== event.pointerId) return;
      const horizontalDelta =
        event.pointerType === "mouse" ? event.movementX : event.clientX - lastCameraPointerX;
      cameraYaw -= horizontalDelta * (event.pointerType === "mouse" ? 0.005 : 0.009);
      lastCameraPointerX = event.clientX;
      event.preventDefault();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (cameraPointerId !== event.pointerId) return;
      cameraDragging = false;
      cameraPointerId = null;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };
    const onContextMenu = (event: MouseEvent) => event.preventDefault();
    const onResize = () => {
      if (!mount) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    renderer.domElement.addEventListener("contextmenu", onContextMenu);
    onResize();

    const movement = new THREE.Vector3();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const targetCamera = new THREE.Vector3();
    const cameraLook = new THREE.Vector3();
    const toBoss = new THREE.Vector3();
    let locked = true;

    const tick = (nowMs: number) => {
      if (!alive) return;
      // 只讀嘅量度接口。冇呢個，測試就只可以望住畫面估——而「玩家去唔去到
    // 西面庭院」呢條問題，望畫面係答唔到嘅（黑燈瞎火、鏡頭又跟住人）。
    // 只出唔入：冇任何一個欄位改得到遊戲狀態。
    (window as unknown as { __ER2?: unknown }).__ER2 = {
      // 只放 mount.dataset 冇嘅嘢。位置、敵人數、鏡頭角度嗰啲一早已經喺
      // dataset 度，喺呢度再開一份就係同一件事有兩個出處。
      map: () => ({ arenaR: ARENA.r, court: { ...COURT }, bridge: { ...BRIDGE } }),
      walls: () => staticBoxes.map((b) => ({ ...b })),
      clock: () => ({ real: performance.now() / 1000, motion: motionClock, attacks: minionAttacks }),
      spawns: () => minions.map((m) => ({ wave: m.wave, x: m.spawn[0], z: m.spawn[1] })),
    };

    frame = requestAnimationFrame(tick);
      // 成隻遊戲得一把鐘。
      //
      // 本來 `now` 係 `performance.now()`（真實時間），而郁動、物理、動畫
      // 用嘅係夾住 0.05 秒嘅 `delta`。即係兩把鐘：幀率一跌，角色行慢咗，
      // 但雜兵嘅出手間隔、boss 個預警圈、閃避嘅無敵幀全部照住真實時間走。
      // 部機愈跟唔上，隻遊戲對玩家愈唔公平——而呢件事係靜靜哋發生嘅。
      //
      // 實測（CPU 節流 1× 對 6×）：每一秒郁動時間，雜兵出手由 2.33 升到
      // 2.90 下，多咗兩成半。而家 `now` 由同一個 `delta` 累加出嚟，兩把鐘
      // 併返做一把——夾時間依然會令成隻遊戲慢，但慢得一致。
      const delta = Math.min((nowMs - lastTime) / 1000, 0.05);
      lastTime = nowMs;
      motionClock += delta;
      const now = motionClock;
      playerMixer?.update(delta);
      bossMixer?.update(delta);
      minions.forEach((minion) => minion.mixer.update(delta));
      const gateMaterial = bossGate.material as THREE.ShaderMaterial;
      gateMaterial.uniforms.time.value = now;
      if (bossActive && gateFade > 0) {
        gateFade = Math.max(0, gateFade - delta * 0.75);
        gateMaterial.uniforms.opacity.value = gateFade;
        bossGate.visible = gateFade > 0;
      }

      ash.rotation.y += delta * 0.008;
      const ashPos = starGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < ashPos.count; i += 1) {
        let y = ashPos.getY(i) + delta * (0.11 + (i % 7) * 0.012);
        if (y > 14) y = 0;
        ashPos.setY(i, y);
      }
      ashPos.needsUpdate = true;

      // 兩個恩典點一齊轉。`graces` 係列表，所以呢度唔使記住有幾多個。
      for (const g of graces) {
        const spiral = g.children[1];
        spiral.rotation.y += delta * 0.7;
        spiral.rotation.z = Math.sin(now * 0.8) * 0.14;
      }
      graceLight.intensity = 23 + Math.sin(now * 2.2) * 4;
      graceLightB.intensity = graceLight.intensity;
      const gracePos = graceParticleGeometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < gracePos.count; i += 1) {
        let y = gracePos.getY(i) + delta * (0.28 + (i % 5) * 0.05);
        if (y > 4) y = 0;
        gracePos.setY(i, y);
      }
      gracePos.needsUpdate = true;

      if (impactLife > 0) {
        impactLife -= delta;
        const attribute = impactGeometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < attribute.count; i += 1) {
          const velocity = impactVelocities[i];
          velocity.y -= delta * 5;
          attribute.setXYZ(
            i,
            attribute.getX(i) + velocity.x * delta,
            attribute.getY(i) + velocity.y * delta,
            attribute.getZ(i) + velocity.z * delta,
          );
        }
        attribute.needsUpdate = true;
        (impact.material as THREE.PointsMaterial).opacity = clamp(impactLife * 2, 0, 1);
      }

      if (queuedLock) {
        locked = !locked;
        queuedLock = false;
        if (locked) gameAudio.play("lockOn", playerRoot.position.x, playerRoot.position.z);
        setHud((state) => ({ ...state, locked }));
      }

      const canPlay = startedRef.current && worldReady;
      if (canPlay && player.state !== "dead" && boss.state !== "dead") {
        if (runStartedAt === null) runStartedAt = nowMs;
        const classConfig = CLASS_CONFIG[currentClass];
        playerBody.wakeUp();
        bossBody.wakeUp();
        playerBody.velocity.x = 0;
        playerBody.velocity.z = 0;
        if (now >= boss.knockbackUntil) {
          bossBody.velocity.x = 0;
          bossBody.velocity.z = 0;
        }
        forward.set(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
        right.set(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
        const inputX =
          (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
          (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) +
          touchMove.x;
        const inputY =
          (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) -
          (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0) -
          touchMove.y;
        movement.copy(forward).multiplyScalar(inputY).addScaledVector(right, inputX);
        if (movement.lengthSq() > 1) movement.normalize();

        if (
          queuedDodge &&
          now >= player.knockbackUntil &&
          player.state === "idle" &&
          player.stamina >= 24
        ) {
          player.state = "dodge";
          player.stateUntil = now + 0.68;
          player.invincibleUntil = now + 0.52;
          player.stamina -= 24;
          if (movement.lengthSq() > 0.03) {
            player.dodgeDirection.copy(movement).normalize();
          } else {
            player.dodgeDirection.set(Math.sin(player.rotation), 0, Math.cos(player.rotation));
          }
          currentPlayerAction = playAction(playerActions, "Roll", currentPlayerAction, true, 1.16);
          gameAudio.play("dodge", playerRoot.position.x, playerRoot.position.z);
        }
        queuedDodge = false;

        if (
          queuedAttack &&
          now >= player.knockbackUntil &&
          player.state === "idle" &&
          player.stamina >= classConfig.attackCost
        ) {
          player.state = "attack";
          player.stateUntil = now + classConfig.attackDuration;
          player.impactAt = now + classConfig.impactDelay;
          player.impactDone = false;
          player.stamina -= classConfig.attackCost;
          player.combo = (player.combo + 1) % 2;
          attackTarget = nearestEnemy();
          const selectedTargetRoot = targetRoot(attackTarget);
          const attackName = classConfig.attackAnimations[player.combo];
          currentPlayerAction = playAction(playerActions, attackName, currentPlayerAction, true, 1.26);
          attackArc.visible = classConfig.projectile === "none";
          if (classConfig.projectile !== "none") {
            projectileStart.copy(playerRoot.position).add(new THREE.Vector3(0, 1.32, 0));
            if (selectedTargetRoot) {
              projectileTarget.copy(selectedTargetRoot.position).add(new THREE.Vector3(0, 1.22, 0));
            } else {
              projectileTarget
                .copy(projectileStart)
                .add(new THREE.Vector3(
                  Math.sin(player.rotation) * classConfig.range,
                  0,
                  Math.cos(player.rotation) * classConfig.range,
                ));
            }
            magicProjectile.position.copy(projectileStart);
            arrowProjectile.position.copy(projectileStart);
            magicProjectile.visible = classConfig.projectile === "magic";
            arrowProjectile.visible = classConfig.projectile === "arrow";
          }
          gameAudio.play(
            classConfig.projectile === "magic"
              ? "cast"
              : classConfig.projectile === "arrow"
                ? "bowRelease"
                : "swordSwing",
            playerRoot.position.x,
            playerRoot.position.z,
          );
        }
        queuedAttack = false;

        if (now < player.knockbackUntil) {
          playerBody.velocity.x = player.knockbackDirection.x;
          playerBody.velocity.z = player.knockbackDirection.z;
        } else if (player.state === "dodge") {
          playerBody.velocity.x = player.dodgeDirection.x * 12.4;
          playerBody.velocity.z = player.dodgeDirection.z * 12.4;
          player.rotation = Math.atan2(player.dodgeDirection.x, player.dodgeDirection.z);
          if (now >= player.stateUntil) player.state = "idle";
        } else if (player.state === "attack") {
          const activeTargetRoot = targetRoot(attackTarget);
          if (activeTargetRoot) toBoss.copy(activeTargetRoot.position).sub(playerRoot.position);
          else toBoss.set(Math.sin(player.rotation), 0, Math.cos(player.rotation));
          if (locked && toBoss.lengthSq() > 0.01) {
            player.rotation = Math.atan2(toBoss.x, toBoss.z);
          }
          const attackProgress =
            1 - (player.stateUntil - now) / classConfig.attackDuration;
          attackArc.position.copy(playerRoot.position).add(new THREE.Vector3(0, 1.15, 0));
          attackArc.rotation.z = -player.rotation + 0.2;
          attackArc.scale.setScalar(0.72 + attackProgress * 0.58);
          (attackArc.material as THREE.MeshBasicMaterial).opacity = clamp(1 - attackProgress, 0, 0.8);
          if (classConfig.projectile !== "none" && !player.impactDone) {
            const flightProgress = clamp(
              attackProgress * (classConfig.attackDuration / classConfig.impactDelay),
              0,
              1,
            );
            const activeProjectile =
              classConfig.projectile === "magic" ? magicProjectile : arrowProjectile;
            activeProjectile.position.lerpVectors(
              projectileStart,
              projectileTarget,
              1 - Math.pow(1 - flightProgress, 2),
            );
            if (classConfig.projectile === "magic") {
              magicProjectile.rotation.x += delta * 9;
              magicProjectile.rotation.y += delta * 12;
              magicProjectile.scale.setScalar(0.82 + Math.sin(now * 28) * 0.15);
              magicRingA.rotation.z += delta * 8;
              magicRingB.rotation.z -= delta * 10;
            } else {
              const arrowDirection = projectileTarget.clone().sub(projectileStart).normalize();
              arrowProjectile.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                arrowDirection,
              );
            }
          }
          if (!player.impactDone && now >= player.impactAt) {
            player.impactDone = true;
            magicProjectile.visible = false;
            arrowProjectile.visible = false;
            attackTarget = findSweptAttackTarget(
              classConfig.range,
              classConfig.projectile === "none" ? 0.92 : 0.28,
            );
            const hitTargetRoot = targetRoot(attackTarget);
            if (attackTarget && hitTargetRoot) {
              const damage = classConfig.damage[player.combo];
              if (attackTarget === "boss") {
                boss.hp = clamp(boss.hp - damage, 0, 100);
                boss.state = boss.hp <= 0 ? "dead" : "hit";
                boss.stateUntil = now + 0.34;
                boss.knockbackUntil = now + 0.16;
                bossBody.velocity.x = Math.sin(player.rotation) * 2.2;
                bossBody.velocity.z = Math.cos(player.rotation) * 2.2;
              } else {
                attackTarget.hp = clamp(attackTarget.hp - damage, 0, 35);
                const healthProgress = attackTarget.hp / 35;
                attackTarget.healthFill.scale.x = healthProgress;
                attackTarget.healthFill.position.x = -0.43 * (1 - healthProgress);
                attackTarget.state = attackTarget.hp <= 0 ? "dead" : "hit";
                attackTarget.stateUntil = now + 0.3;
                attackTarget.knockbackUntil = now + 0.22;
                attackTarget.body.velocity.x = Math.sin(player.rotation) * 4.6;
                attackTarget.body.velocity.z = Math.cos(player.rotation) * 4.6;
              }
              const hitPosition = hitTargetRoot.position;
              burst(
                hitPosition,
                classConfig.projectile === "magic" ? "#70ccff" : "#ffcf72",
              );
              gameAudio.play(
                classConfig.projectile === "magic"
                  ? "magicHit"
                  : classConfig.projectile === "arrow"
                    ? "arrowHit"
                    : "bossHit",
                hitPosition.x,
                hitPosition.z,
              );
              cameraShake = 0.24;
              if (attackTarget === "boss") {
                if (boss.hp <= 0) {
                  currentBossAction = playAction(bossActions, "Death", currentBossAction, true, 0.82);
                  gameAudio.play("victory", bossRoot.position.x, bossRoot.position.z);
                  setHud((state) => ({ ...state, bossHp: 0, status: "victory" }));
                  persistRun("victory");
                } else {
                  currentBossAction = playAction(bossActions, "HitReact", currentBossAction, true, 1.1);
                }
              } else if (attackTarget.hp <= 0) {
                attackTarget.active = false;
                attackTarget.healthBar.visible = false;
                attackTarget.body.velocity.setZero();
                attackTarget.body.collisionResponse = false;
                if (attackTarget.bodyAdded) {
                  physicsWorld.removeBody(attackTarget.body);
                  attackTarget.bodyAdded = false;
                }
                attackTarget.currentAction = playAction(
                  attackTarget.actions,
                  "Death_A",
                  attackTarget.currentAction,
                  true,
                  1.08,
                );
                gameAudio.play(
                  "enemyDeath",
                  attackTarget.root.position.x,
                  attackTarget.root.position.z,
                );
                advanceEncounter();
              } else {
                attackTarget.currentAction = playAction(
                  attackTarget.actions,
                  "Hit_A",
                  attackTarget.currentAction,
                  true,
                  1.1,
                );
              }
            }
          }
          if (now >= player.stateUntil) {
            player.state = "idle";
            attackTarget = null;
            attackArc.visible = false;
            magicProjectile.visible = false;
            arrowProjectile.visible = false;
          }
        } else if (movement.lengthSq() > 0.035) {
          const sprinting = keys.has("ShiftLeft") && player.stamina > 2;
          const speed = sprinting ? classConfig.speed * 1.55 : classConfig.speed;
          movement.normalize();
          playerBody.velocity.x = movement.x * speed;
          playerBody.velocity.z = movement.z * speed;
          player.rotation = Math.atan2(movement.x, movement.z);
          if (now >= nextFootstep) {
            gameAudio.play("footstep", playerRoot.position.x, playerRoot.position.z);
            nextFootstep = now + (sprinting ? 0.14 : 0.2);
          }
          if (sprinting) player.stamina = Math.max(0, player.stamina - delta * 13);
          currentPlayerAction = playAction(
            playerActions,
            sprinting
              ? currentClass === "ranger"
                ? "Run_Holding"
                : "Run_Weapon"
              : "Walk",
            currentPlayerAction,
            false,
            sprinting ? 1.9 : 2.15,
          );
        } else {
          currentPlayerAction = playAction(playerActions, "Idle_Weapon", currentPlayerAction);
        }

        if (player.state !== "attack" && player.state !== "dodge" && !keys.has("ShiftLeft")) {
          player.stamina = Math.min(100, player.stamina + delta * 28);
        }

        playerRoot.rotation.y = player.rotation;

        const near = nearestGrace(playerRoot.position);
        const distanceToGrace = near.distance;
        if (queuedInteract && distanceToGrace < 3.2) {
          player.hp = 100;
          player.stamina = 100;
          burst(near.grace.position, "#f3ce72");
          gameAudio.play("heal", near.grace.position.x, near.grace.position.z);
        }
        queuedInteract = false;

        minions.forEach((minion) => {
          if (!minion.active || minion.hp <= 0) return;
          minion.body.wakeUp();
          if (now >= minion.knockbackUntil) {
            minion.body.velocity.x = 0;
            minion.body.velocity.z = 0;
          }
          const toPlayer = playerRoot.position.clone().sub(minion.root.position);
          const minionDistance = toPlayer.length();

          if (minion.state === "hit") {
            if (now >= minion.stateUntil) minion.state = "idle";
          } else if (minion.state === "attack") {
            if (!minion.impactDone && now >= minion.impactAt) {
              minion.impactDone = true;
              if (minionDistance < 2.35 && now > player.invincibleUntil) {
                player.hp = clamp(player.hp - [10, 13, 15][minion.wave], 0, 100);
                player.knockbackUntil = now + 0.18;
                player.knockbackDirection.copy(toPlayer).normalize().multiplyScalar(4.2);
                burst(playerRoot.position, "#b74937");
                gameAudio.play("playerHit", playerRoot.position.x, playerRoot.position.z);
                cameraShake = 0.24;
                if (player.hp <= 0) {
                  player.state = "dead";
                  currentPlayerAction = playAction(
                    playerActions,
                    "Death",
                    currentPlayerAction,
                    true,
                    0.9,
                  );
                  setHud((state) => ({ ...state, hp: 0, status: "dead" }));
                  persistRun("dead");
                } else {
                  player.state = "idle";
                  currentPlayerAction = playAction(
                    playerActions,
                    "RecieveHit",
                    currentPlayerAction,
                    true,
                    1.1,
                  );
                }
              }
            }
            if (now >= minion.stateUntil) minion.state = "idle";
          } else if (minionDistance > 1.82) {
            minion.state = "run";
            const direction = toPlayer.normalize();
            const separation = new THREE.Vector3();
            livingMinions().forEach((other) => {
              if (other === minion) return;
              const away = minion.root.position.clone().sub(other.root.position);
              const distanceSq = away.lengthSq();
              if (distanceSq > 0.001 && distanceSq < 2.25) {
                separation.add(away.normalize().multiplyScalar(1 - Math.sqrt(distanceSq) / 1.5));
              }
            });
            direction.addScaledVector(separation, 0.72).normalize();
            const speed = [4.3, 5.1, 5.4][minion.wave];
            minion.body.velocity.x = direction.x * speed;
            minion.body.velocity.z = direction.z * speed;
            minion.currentAction = playAction(
              minion.actions,
              "Running_A",
              minion.currentAction,
              false,
              [1.84, 2.16, 2.24][minion.wave],
            );
          } else if (now >= minion.nextAttack) {
            minion.state = "attack";
            minion.impactDone = false;
            minion.impactAt = now + 0.42;
            minion.stateUntil = now + 0.82;
            minion.nextAttack = now + 1.4 + Math.random() * 0.45;
            minionAttacks += 1;
            gameAudio.play("enemyAttack", minion.root.position.x, minion.root.position.z);
            minion.currentAction = playAction(
              minion.actions,
              "Unarmed_Melee_Attack_Punch_A",
              minion.currentAction,
              true,
              1.15,
            );
          } else {
            minion.state = "idle";
            minion.currentAction = playAction(
              minion.actions,
              "Idle_Combat",
              minion.currentAction,
            );
          }
          minion.root.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
        });

        if (bossActive) {
        toBoss.copy(playerRoot.position).sub(bossRoot.position);
        const bossDistance = toBoss.length();
        if (boss.hp <= 50 && boss.phase === 1) {
          boss.phase = 2;
          bloodLight.color.set("#ff3822");
          bloodLight.intensity = 34;
          burst(bossRoot.position, "#ff3d2b");
          gameAudio.play("bossSlam", bossRoot.position.x, bossRoot.position.z);
        }

        if (boss.state === "dead") {
          telegraph.visible = false;
        } else if (boss.state === "hit") {
          if (now >= boss.stateUntil) boss.state = "idle";
        } else if (boss.state === "windup") {
          telegraph.visible = true;
          telegraph.position.x = bossRoot.position.x;
          telegraph.position.z = bossRoot.position.z;
          const pulse = clamp(1 - (boss.impactAt - now) / (boss.phase === 2 ? 0.52 : 0.72), 0, 1);
          telegraph.scale.setScalar(0.4 + pulse * 0.9);
          (telegraph.material as THREE.MeshBasicMaterial).opacity = 0.25 + pulse * 0.65;
          if (!boss.impactDone && now >= boss.impactAt) {
            boss.impactDone = true;
            telegraph.visible = false;
            gameAudio.play("bossSlam", bossRoot.position.x, bossRoot.position.z);
            if (bossDistance < (boss.phase === 2 ? 4.5 : 3.9) && now > player.invincibleUntil) {
              player.hp = clamp(player.hp - (boss.phase === 2 ? 34 : 25), 0, 100);
              player.knockbackUntil = now + (boss.phase === 2 ? 0.32 : 0.24);
              player.knockbackDirection
                .copy(toBoss)
                .normalize()
                .multiplyScalar(boss.phase === 2 ? 7.4 : 5.8);
              burst(playerRoot.position, "#d64a35");
              gameAudio.play("playerHit", playerRoot.position.x, playerRoot.position.z);
              cameraShake = 0.46;
              if (player.hp <= 0) {
                player.state = "dead";
                currentPlayerAction = playAction(playerActions, "Death", currentPlayerAction, true, 0.9);
                setHud((state) => ({ ...state, hp: 0, status: "dead" }));
                persistRun("dead");
              } else {
                player.state = "idle";
                currentPlayerAction = playAction(playerActions, "RecieveHit", currentPlayerAction, true, 1.1);
              }
            }
          }
          if (now >= boss.stateUntil) {
            boss.state = "recover";
            boss.stateUntil = now + (boss.phase === 2 ? 0.25 : 0.5);
          }
        } else if (boss.state === "recover") {
          if (now >= boss.stateUntil) boss.state = "idle";
        } else if (bossDistance > 3.15) {
          boss.state = "run";
          const direction = toBoss.normalize();
          const bossSpeed = boss.phase === 2 ? 8.3 : 6.3;
          bossBody.velocity.x = direction.x * bossSpeed;
          bossBody.velocity.z = direction.z * bossSpeed;
          currentBossAction = playAction(bossActions, "Run", currentBossAction, false, boss.phase === 2 ? 2.1 : 1.82);
        } else if (now >= boss.nextAttack) {
          boss.state = "windup";
          boss.impactDone = false;
          boss.impactAt = now + (boss.phase === 2 ? 0.52 : 0.72);
          boss.stateUntil = boss.impactAt + 0.15;
          boss.nextAttack = now + (boss.phase === 2 ? 1.55 : 2.2);
          currentBossAction = playAction(bossActions, "Punch", currentBossAction, true, boss.phase === 2 ? 1.3 : 0.95);
        } else {
          boss.state = "idle";
          currentBossAction = playAction(bossActions, "Idle", currentBossAction);
        }
        if (boss.state !== "dead") {
          bossRoot.rotation.y = Math.atan2(toBoss.x, toBoss.z);
        }
        } else {
          telegraph.visible = false;
          bossBody.velocity.x = 0;
          bossBody.velocity.z = 0;
          currentBossAction = playAction(bossActions, "Idle", currentBossAction);
        }

        const hint = distanceToGrace < 3.2 ? "Press E to commune with the Golden Remnant" : "";
        if (nowMs - lastHudUpdate > 90) {
          lastHudUpdate = nowMs;
          setHud((state) => ({
            ...state,
            hp: Math.round(player.hp),
            stamina: Math.round(player.stamina),
            bossHp: Math.round(boss.hp),
            hint,
            locked,
          }));
        }
      }

      physicsWorld.step(1 / 60, delta, 4);
      playerRoot.position.set(
        playerBody.position.x,
        Math.max(0, playerBody.position.y - playerGroundOffset),
        playerBody.position.z,
      );
      bossRoot.position.set(
        bossBody.position.x,
        Math.max(0, bossBody.position.y - bossGroundOffset),
        bossBody.position.z,
      );
      minions.forEach((minion) => {
        if (minion.bodyAdded) {
          minion.root.position.set(
            minion.body.position.x,
            Math.max(0, minion.body.position.y - minionGroundOffset),
            minion.body.position.z,
          );
        }
        minion.healthBar.lookAt(camera.position);
      });
      if (nowMs - lastDebugUpdate > 100) {
        lastDebugUpdate = nowMs;
        mount.dataset.playerPosition =
          `${playerBody.position.x.toFixed(2)},${playerBody.position.z.toFixed(2)}`;
        mount.dataset.cameraYaw = cameraYaw.toFixed(3);
        mount.dataset.cameraPosition =
          `${camera.position.x.toFixed(2)},${camera.position.z.toFixed(2)}`;
        mount.dataset.targetLocked = String(locked);
        mount.dataset.bossPosition =
          `${bossBody.position.x.toFixed(2)},${bossBody.position.z.toFixed(2)}`;
        mount.dataset.encounter = encounterStage === 3 ? "boss" : `wave-${encounterStage + 1}`;
        mount.dataset.enemiesRemaining = String(livingMinions().length);
        mount.dataset.minionPositions = livingMinions()
          .map((minion) => `${minion.body.position.x.toFixed(1)},${minion.body.position.z.toFixed(1)}`)
          .join("|");
        mount.dataset.minionVelocities = livingMinions()
          .map((minion) => `${minion.body.velocity.x.toFixed(2)},${minion.body.velocity.z.toFixed(2)}`)
          .join("|");
        mount.dataset.minionStates = livingMinions().map((minion) => minion.state).join("|");
        mount.dataset.gameStatus =
          player.state === "dead" ? "dead" : boss.state === "dead" ? "victory" : "playing";
      }

      const cameraTarget = targetRoot(nearestEnemy());
      const cameraDistance = locked && cameraTarget ? 9.6 : 8.3;
      const desiredYaw = locked
        ? Math.atan2(
            (cameraTarget?.position.x ?? playerRoot.position.x) - playerRoot.position.x,
            (cameraTarget?.position.z ?? playerRoot.position.z - 1) - playerRoot.position.z,
          ) + Math.PI
        : cameraYaw;
      if (locked && cameraTarget) cameraYaw += Math.atan2(Math.sin(desiredYaw - cameraYaw), Math.cos(desiredYaw - cameraYaw)) * delta * 2.2;
      // 鏡頭撞牆就收短。
      //
      // 本來鏡頭永遠釘死喺玩家後面 8.3 米，冇問過嗰個位有冇嘢。喺一個
      // 空曠圓場入面呢個假設成立，因為玩家背後乜都冇；一開走廊同庭院，
      // 鏡頭就直接插入牆入面，畫面變成一幅貼面嘅石屎——實測擺個角色落
      // 新通道度影相，成幅畫都係牆。
      //
      // 呢個唔係新地圖嘅缺陷，係鏡頭一直都冇做遮擋處理，只不過舊地圖冇
      // 嘢遮到佢。所以次序係：先修鏡頭，先開得到室內空間。
      const camDir = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
      const camOrigin = playerRoot.position.clone().setY(2.6);
      let allowed = cameraDistance;
      for (const b of staticBoxes) {
        // 由玩家向鏡頭方向行，撞到邊個盒就喺嗰度停。用 2D 就夠：所有靜態
        // 障礙都係由地面起、垂直嘅牆同石。
        const c = Math.cos(-b.ry), sn = Math.sin(-b.ry);
        const pad = 0.55;
        const ox = camOrigin.x - b.x, oz = camOrigin.z - b.z;
        const lox = ox * c - oz * sn, loz = ox * sn + oz * c;
        const ldx = camDir.x * c - camDir.z * sn, ldz = camDir.x * sn + camDir.z * c;
        // 光線同軸對齊方盒相交（slab 法）
        let t0 = 0, t1 = allowed;
        let ok = true;
        for (const [o, d, h] of [[lox, ldx, b.hx + pad], [loz, ldz, b.hz + pad]] as const) {
          if (Math.abs(d) < 1e-6) { if (Math.abs(o) > h) { ok = false; break; } continue; }
          const ta = (-h - o) / d, tb = (h - o) / d;
          t0 = Math.max(t0, Math.min(ta, tb));
          t1 = Math.min(t1, Math.max(ta, tb));
          if (t0 > t1) { ok = false; break; }
        }
        if (ok && t0 < allowed) allowed = Math.max(2.4, t0);
      }
      targetCamera.set(
        playerRoot.position.x + camDir.x * allowed,
        2.2 + (allowed / cameraDistance) * 2.6,
        playerRoot.position.z + camDir.z * allowed,
      );
      camera.position.lerp(targetCamera, 1 - Math.pow(0.001, delta));
      if (cameraShake > 0) {
        cameraShake = Math.max(0, cameraShake - delta * 1.8);
        camera.position.x += (Math.random() - 0.5) * cameraShake;
        camera.position.y += (Math.random() - 0.5) * cameraShake;
      }
      cameraLook.copy(playerRoot.position).add(new THREE.Vector3(0, 1.25, 0));
      if (locked && cameraTarget) {
        // 同一個鏡頭有三處平滑：位置用 `1 - pow(0.001, delta)`、偏航用
        // `delta * 2.2`，得呢一處係一個裸常數 0.34。即係鎖定之後個注視點
        // 每一「幀」拉近三成四，而唔係每一「秒」——三十幀同一百二十幀之下
        // 追唔追得上目標差四倍。三分一嘅工冇跟另外三分二。
        cameraLook.lerp(
          cameraTarget.position.clone().add(new THREE.Vector3(0, 1.35, 0)),
          1 - Math.pow(0.002, delta),
        );
      }
      camera.lookAt(cameraLook);
      // 陰影框跟玩家行。唔 update target 嘅 matrix 嘅話，three.js 仲係
      // 用住舊嗰個方向——燈郁咗，陰影唔郁。
      moonLight.position.copy(playerRoot.position).add(MOON_OFFSET);
      moonLight.target.position.copy(playerRoot.position);
      moonLight.target.updateMatrixWorld();
      moonHalo.lookAt(camera.position);
      gameAudio.updateListener(
        camera.position.x,
        camera.position.z,
        -Math.sin(cameraYaw),
        -Math.cos(cameraYaw),
      );
      composer.render();
    };

    frame = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      renderer.domElement.removeEventListener("contextmenu", onContextMenu);
      gameAudio.destroy();
      playerMixer?.stopAllAction();
      bossMixer?.stopAllAction();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh || object instanceof THREE.Points)) return;
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      engineRef.current = null;
    };
  }, []);

  const startGame = () => {
    engineRef.current?.selectClass(selectedClassRef.current);
    setStarted(true);
    setHud((state) => ({
      ...state,
      status: state.status === "ready" ? "playing" : state.status,
    }));
    engineRef.current?.startAudio();
  };

  const updateStick = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointer.current !== event.pointerId || !stickRef.current) return;
    const box = stickRef.current.getBoundingClientRect();
    const radius = box.width * 0.36;
    const x = clamp((event.clientX - (box.left + box.width / 2)) / radius, -1, 1);
    const y = clamp((event.clientY - (box.top + box.height / 2)) / radius, -1, 1);
    const length = Math.hypot(x, y);
    const next = length > 1 ? { x: x / length, y: y / length } : { x, y };
    setStick(next);
    engineRef.current?.setMove(next.x, next.y);
  };

  const releaseStick = () => {
    stickPointer.current = null;
    setStick({ x: 0, y: 0 });
    engineRef.current?.setMove(0, 0);
  };

  const toggleAudio = () => {
    const nextMuted = !audioMuted;
    setAudioMuted(nextMuted);
    engineRef.current?.setMuted(nextMuted);
  };

  const chooseClass = (characterClass: CharacterClass) => {
    selectedClassRef.current = characterClass;
    setSelectedClass(characterClass);
    engineRef.current?.selectClass(characterClass);
  };

  const encounterCopy = {
    approach: {
      area: "Ashen Approach",
      kicker: "FIRST WARD · REVENANT LINE",
      objective: "Break the outer sentinels",
    },
    cloister: {
      area: "Broken Cloister",
      kicker: "SECOND WARD · INNER COURT",
      objective: "Clear the cloister wardens",
    },
    causeway: {
      area: "Westgate Causeway",
      kicker: "THIRD WARD · BEYOND THE GATE",
      objective: "Take the westgate courtyard",
    },
    boss: {
      area: "Crownless Sanctum",
      kicker: "FINAL ENCOUNTER · REMEMBRANCE-BEARER",
      objective: "Sever the Crownless",
    },
  }[hud.encounter];

  return (
    <main className="game-shell">
      <div ref={mountRef} className="game-canvas" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <header className="game-topbar">
        <div className="topbar-left">
          <div className="brand-lockup" aria-label="Elden Ring Two">
            <span className="brand-kicker">A FAN-MADE WEB EXPERIENCE</span>
            <strong>ELDEN RING <i>II</i></strong>
            <span className="brand-subtitle">VEIL OF THE HOLLOW CROWN</span>
          </div>
          {/* 玩家狀態排喺品牌字下面，用正常文檔流，唔用寫死嘅 top。
              之前佢係 position:absolute 加三個斷點各自一個 top（91／63／45），
              而上面嘅字高度係跟闊度變嘅（clamp(20px, 2vw, 30px)）——兩套斷點
              喺 844×390（iPhone 14 打橫）夾唔埋，個副標題就壓住咗徽章同職業名。 */}
          {started && hud.status !== "loading" && (
            <section className="player-hud" aria-label="Player status">
              <div className="rune-mark">{CLASS_CONFIG[selectedClass].icon}</div>
              <div className="player-bars">
                <small>{CLASS_CONFIG[selectedClass].label}</small>
                <div className="bar health"><i style={{ width: `${hud.hp}%` }} /></div>
                <div className="bar focus">
                  <i style={{ width: `${CLASS_CONFIG[selectedClass].focus}%` }} />
                </div>
                <div className="bar stamina"><i style={{ width: `${hud.stamina}%` }} /></div>
              </div>
            </section>
          )}
        </div>
        <div className="area-name">
          <span>FORSAKEN REALM</span>
          <strong>{started ? encounterCopy.area : "Citadel of Ash"}</strong>
        </div>
      </header>

      <nav className="utility-controls" aria-label="Game options">
        <button
          type="button"
          onClick={toggleAudio}
          aria-label={audioMuted ? "Unmute game audio" : "Mute game audio"}
          aria-pressed={audioMuted}
          title={audioMuted ? "Unmute audio" : "Mute audio"}
        >
          {audioMuted ? "◌" : "♪"}
        </button>
        <button
          type="button"
          onClick={() => setCreditsOpen(true)}
          aria-label="Open credits and licenses"
          title="Credits and licenses"
        >
          ©
        </button>
      </nav>

      {started && hud.status !== "loading" && hud.bossActive && hud.bossHp > 0 && (
        <section className="boss-hud" aria-label="Boss status">
          <span>REMEMBRANCE-BEARER</span>
          <h2>VARGHAST, THE CROWNLESS</h2>
          <div className="boss-bar"><i style={{ width: `${hud.bossHp}%` }} /></div>
        </section>
      )}

      {started && hud.status === "playing" && (
        <aside className="objective-panel">
          <span>{encounterCopy.kicker}</span>
          <strong>{encounterCopy.objective}</strong>
          <p>
            {hud.bossActive
              ? hud.locked
                ? "Target locked · Q to release"
                : "Free camera · Q to lock"
              : `${hud.enemiesRemaining} revenant${hud.enemiesRemaining === 1 ? "" : "s"} remain`}
          </p>
        </aside>
      )}

      {started && hud.hint && hud.status === "playing" && (
        <div className="interaction-prompt"><kbd>E</kbd>{hud.hint.replace("Press E to ", "")}</div>
      )}

      {!started && (
        <section className="title-screen">
          <div className="sigil" aria-hidden="true"><i /><b /><em /></div>
          <p className="eyebrow">THE SHATTERED AGE CONTINUES</p>
          <h1>Rise once more,<br /><span>Oathbound.</span></h1>
          <p className="intro-copy">
            Beyond the Erdtree&apos;s dying light, a crown without a lord calls the dead to war.
          </p>
          <div className="class-selector" role="radiogroup" aria-label="Choose a character class">
            {(Object.keys(CLASS_CONFIG) as CharacterClass[]).map((characterClass) => {
              const character = CLASS_CONFIG[characterClass];
              const active = selectedClass === characterClass;
              return (
                <button
                  key={characterClass}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  className={active ? "selected" : ""}
                  onClick={() => chooseClass(characterClass)}
                >
                  <i aria-hidden="true">{character.icon}</i>
                  <strong>{character.label}</strong>
                  <span>{character.epithet}</span>
                </button>
              );
            })}
          </div>
          <button
            className="enter-button"
            onClick={hud.status === "error" ? () => window.location.reload() : startGame}
            disabled={hud.status === "loading"}
          >
            <span>
              {hud.status === "loading"
                ? `FORGING THE REALM · ${hud.loading}%`
                : hud.status === "error"
                  ? "RETRY LOADING THE REALM"
                  : "ENTER THE VEIL"}
            </span>
          </button>
          <div className="control-hints">
            <span><kbd>WASD</kbd> Move</span>
            <span><kbd>J</kbd> Strike</span>
            <span><kbd>SPACE</kbd> Dodge</span>
            <span><kbd>Q</kbd> Lock</span>
          </div>
        </section>
      )}

      {(hud.status === "victory" || hud.status === "dead") && started && (
        <section className={`result-screen ${hud.status}`}>
          <span>{hud.status === "victory" ? "GREAT ENEMY FELLED" : "YOU DIED"}</span>
          <p>{hud.status === "victory" ? "The Hollow Crown remembers your name." : "The Lands Between are not yet done with you."}</p>
          <button onClick={() => engineRef.current?.restart()}>
            <kbd>R</kbd> {hud.status === "victory" ? "Face the remembrance again" : "Rise at the Golden Remnant"}
          </button>
        </section>
      )}

      {started && hud.status === "playing" && (
        <div className="mobile-controls" aria-label="Touch controls">
          <span className="touch-look-hint" aria-hidden="true">DRAG RIGHT SIDE · LOOK</span>
          <div
            ref={stickRef}
            className="touch-stick"
            onPointerDown={(event) => {
              stickPointer.current = event.pointerId;
              event.currentTarget.setPointerCapture(event.pointerId);
              updateStick(event);
            }}
            onPointerMove={updateStick}
            onPointerUp={releaseStick}
            onPointerCancel={releaseStick}
          >
            <i style={{ transform: `translate(${stick.x * 28}px, ${stick.y * 28}px)` }} />
          </div>
          <div className="touch-actions">
            <button className="touch-lock" onPointerDown={() => engineRef.current?.toggleLock()} aria-label="Toggle target lock">◎</button>
            <button className="touch-dodge" onPointerDown={() => engineRef.current?.dodge()} aria-label="Dodge">DODGE</button>
            <button className="touch-attack" onPointerDown={() => engineRef.current?.attack()} aria-label="Attack">
              {selectedClass === "wizard" ? "✦" : selectedClass === "ranger" ? "➶" : "⚔"}
            </button>
          </div>
        </div>
      )}

      {creditsOpen && (
        <section
          className="credits-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="credits-title"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) setCreditsOpen(false);
          }}
        >
          <div className="credits-card">
            <button
              type="button"
              className="credits-close"
              onClick={() => setCreditsOpen(false)}
              aria-label="Close credits"
            >
              ×
            </button>
            <span>ASSET PROVENANCE</span>
            <h2 id="credits-title">Credits & Licenses</h2>
            <p>
              Music: “Dream 2 (Ambience)” by Marcus Davies and “Mists in the Elven Lands”
              by Kaiser / The Oracle, released under{" "}
              <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">
                CC0 1.0
              </a>. Edited and encoded for interactive web playback; attribution is not required.
            </p>
            <p>
              Sound effects: “RPG Audio” and “Impact Sounds” by{" "}
              <a href="https://kenney.nl/" target="_blank" rel="noreferrer">Kenney</a>, CC0 1.0.
            </p>
            <p>
              3D characters by Quaternius, environment by Kenney, and Cobblestone 01 PBR material
              by <a href="https://polyhaven.com/a/cobblestone_01" target="_blank" rel="noreferrer">Poly Haven</a>,
              all CC0 1.0.
            </p>
            <p className="fan-notice">
              Non-commercial fan concept. Not affiliated with or endorsed by FromSoftware or Bandai Namco.
            </p>
          </div>
        </section>
      )}

      <footer className="game-footer">
        <span>REAL-TIME 3D · ORIGINAL GAMEPLAY CONCEPT</span>
        <span>LICENSED ASSETS · CREDITS AVAILABLE</span>
      </footer>
    </main>
  );
}
