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
import { ARENA_RADIUS, BOSS_SPAWN_Z, CAMERA_BACK, FOG_GATE, PLAYER_SPAWN_Z, buildMap } from "./map";
import { MINION_ATTACK_RANGE, MINION_SPEED, canLand, chaseDirection, makeBlocked, makeLineOfSight } from "./chase";
import { ACCEL, DECEL, LUNGE_SPEED, TURN_RATE, TURN_RATE_ATTACK, TURN_RATE_BOSS, TURN_RATE_ENEMY, approachSpeed, snapShadowTarget, turnToward } from "./motion";
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
  lastAttackMotion: number;
  avoid: { turn: number };
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

// Boss 招式：第二階段先開撲擊。
//
// 本來 boss 由頭到尾得一招（Punch），而「第二階段」只係同一招換咗一組數
// （前搖 0.72 → 0.52、傷害 25 → 34、半徑 3.9 → 4.5）。玩家角度睇，第二
// 階段唔係一件新嘢，只係同一件嘢快咗——打法完全唔使變，企遠啲一樣安全。
// demon.gltf 有十四段動畫，用緊得五段；Jump／Jump_Land 一直冇出現過。
//
// 揀招寫成純函數，唔寫喺 tick 入面：要驗「第二階段真係多咗招」，唔應該
// 要求測試打贏兩波雜兵先見到 boss。
// 目標離幾遠先值得亮光柱。抽成純函數嘅理由同 chooseBossMove 一樣：
// 「遠嘅時候會亮」呢個方向要打到第三關先驗到，而一條要贏咗場先量到嘢
// 嘅 gate 冇人會跑。
export const WAYPOINT_MIN_DISTANCE = 25;
export const shouldShowWaypoint = (distance: number | null, alive: boolean) =>
  alive && distance != null && distance > WAYPOINT_MIN_DISTANCE;

// 地圖嘅骨架數（場邊半徑、boss 出生點、霧門）全部住喺 `map.ts`。呢度轉出去，
// 令現有嘅 import 唔使改。擺喺 module 層係因為畫霧門喺檔案上半段而個 collider
// 喺下半段——同 ADR-151 嗰個 `minionRadius` TDZ 一模一樣嘅坑。
export { ARENA_RADIUS, BOSS_SPAWN_Z, FOG_GATE, PLAYER_SPAWN_Z } from "./map";

// Boss 埋到幾近就唔再行、開始出手。
export const BOSS_REACH = 3.15;
export const LEAP_MIN_RANGE = 6.5;
export type BossMove = "punch" | "leap";
// `見到落點` 一日冇，boss 就會撲向一個佢去唔到嘅位——實測第二階段嘅撲擊組合
// 入面 **32.8% 中間有嘢擋住**（未修走廊牆之前係 56.6%）。撲擊嘅預警圈畫喺
// 落點，而傷害亦都由落點度起，所以撲向柱後面唔止撞埋去咁簡單：個圈畫咗喺你
// 過唔到嘅地方，而隻怪就卡喺柱前面。見唔到就打拳。
export const chooseBossMove = (
  phase: 1 | 2,
  distance: number,
  roll: number,
  見到落點 = true,
): BossMove =>
  phase === 2 && distance > LEAP_MIN_RANGE && roll < 0.55 && 見到落點 ? "leap" : "punch";

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
  const [stickOrigin, setStickOrigin] = useState<{ x: number; y: number } | null>(null);
  // `updateStick` 係 pointermove 嗰下即刻行，而 React state 要下一個 render
  // 先睇得到——所以中心點要有個 ref，否則第一下拖會攞到 null。
  const stickOriginRef = useRef<{ x: number; y: number } | null>(null);

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
    // 縮放。抄深淵之橋嗰條線（`view.zoomBy`）：夾喺 0.7–1.7，滾輪同雙指都用得。
    // 拉遠係「我睇下周圍有咩」，拉近係「我而家要打得準」——一個第三身遊戲冇呢
    // 個掣，玩家連自己企喺個場邊個位都判斷唔到。
    let camZoom = 1;
    const zoomBy = (factor: number) => {
      camZoom = Math.min(1.7, Math.max(0.7, camZoom * factor));
    };
    const pinchPointers = new Map<number, { x: number; y: number }>();
    let pinchSpan = 0;
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

    // `near` 本來 0.1，而 `far` 180——1800:1 嘅深度範圍。地面同石路面只差 15
    // 毫米，喺精度低嘅深度緩衝（手機好多時 16 bit）上面就會互相穿插閃爍。
    // 鏡頭遮擋邏輯保證咗**冇嘢會近過 2.4 米**（`Math.max(2.4, t0)`），所以
    // `near` 拉到 0.6 一件嘢都唔會被切走，而深度精度直接好六倍。
    const camera = new THREE.PerspectiveCamera(48, 1, 0.6, 180);
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
    // 一個 texel 蓋幾多米：52 米闊嘅框攤喺 2048 貼圖上面 = 25.4 毫米。
    const SHADOW_TEXEL =
      (moonLight.shadow.camera.right - moonLight.shadow.camera.left) / moonLight.shadow.mapSize.x;
    scene.add(moonLight);
    scene.add(moonLight.target);

    const arenaFill = new THREE.PointLight("#7f9fc8", 14, 38, 1.55);
    arenaFill.position.set(0, 9, 10);
    scene.add(arenaFill);

    // 西面庭院自己嘅補光。冇呢盞，過咗橋就只剩半球光，個場會平到冇立體感。
    const courtFill = new THREE.PointLight("#6f8fbe", 13, 34, 1.6);
    courtFill.position.set(-60, 9, 0);
    scene.add(courtFill);

    // 北面聖所自己嘅光。用暖紅色，同圓場嗰啲冷藍分開——過咗霧門就係另一
    // 個地方，唔淨止係另一格空地。
    const sanctumFill = new THREE.PointLight("#c06a4a", 16, 42, 1.7);
    sanctumFill.position.set(0, 11, BOSS_SPAWN_Z);
    scene.add(sanctumFill);

    // L 形捷徑自己嘅光，擺喺拐角——由兩邊行過嚟都照得到。
    const linkFill = new THREE.PointLight("#7b86a8", 11, 36, 1.6);
    linkFill.position.set(-60, 8, -48);
    scene.add(linkFill);

    // 分區補光行遠咗就熄。
    //
    // PointLight 設咗 `distance` 之後，超過嗰個距離貢獻係零——但 three.js
    // 照樣將佢放入 shader 嘅燈迴圈，即係每一個著色片元都照計一次。地圖由
    // 一個場變三個場之後，庭院同聖所嗰兩盞喺圓場度**畫面上完全睇唔到，
    // 但每一幀都照畀錢**。實測熄咗兩盞：2.0 → 2.3 fps（軟件光柵化，絕對值
    // 冇意思，但相對係真）。
    //
    // 個門檻由燈自己個 `distance` 出，唔另外寫一個數——兩個數各寫各嘅，
    // 就係今個 session 捉過好多次嗰個形狀。
    const regionalFills = [courtFill, sanctumFill, linkFill];

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

    // 地面要蓋得晒成幅地圖：西面庭院去到 x ≈ -77，北面聖所去到 z ≈ -68。
    const GROUND_W = 200;
    const GROUND_D = 170;

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

    // 目標指示光柱。
    //
    // 第三關喺西面庭院，離出生點六十米。目標面板寫住「Take the westgate
    // courtyard」，但喺一個夜晚、冇小地圖、二百米闊嘅場入面，一句字唔等於
    // 一個方向——清完第二波之後玩家企喺原地，而下一個目標喺畫面外。
    // 呢個缺口係我自己擴地圖整出嚟嘅，所以要一齊修。
    const waypoint = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 1.4, 26, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: "#e7bd67",
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    );
    waypoint.position.y = 13;
    waypoint.visible = false;
    scene.add(waypoint);

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

    // 揮擊弧線嘅幾何要由**打中判定用嘅同一組數**度計出嚟。
    //
    // 本來畫嘅係一個半徑 1.55（縮放後 1.1–2.0 米）、跨 243° 嘅圓環，而真正
    // 嘅判定係一條向前 4.4 米、側向 ±1.32 米（即係 ±17°）嘅膠囊。畫面同規則
    // 講緊兩件唔同嘅事：射程少報咗一倍幾（你打得到弧線從來冇掃過嘅嘢），
    // 而覆蓋角度多報咗十四倍（睇落掃成個身位，實際係向前㧬一下）。
    // 同一個病喺 MOBA 度出現過（ADR-125／144）：一件事寫兩次就有兩個答案。
    const SWEEP_RADIUS = { melee: 0.92, ranged: 0.28 };
    // 只用武器自己嗰個 sweep，唔加目標半徑——判定加目標半徑係「隻怪有幾
    // 肥」嘅事，唔係「你把刀掃幾闊」。（第一版加咗，而 `minionRadius` 喺
    // 五十行之後先宣告，一載入就 TDZ 死機、成版黑晒——係條「零 page error」
    // 嘅 gate 捉返嘅。）
    const arcGeometryFor = (range: number, sweep: number) =>
      new THREE.TorusGeometry(range * 0.82, 0.05, 6, 42, 2 * Math.atan2(sweep, range));
    const attackArc = new THREE.Mesh(
      arcGeometryFor(CLASS_CONFIG.warrior.range, SWEEP_RADIUS.melee),
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
    bossRoot.position.set(0, 0, BOSS_SPAWN_Z);
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
      position: new CANNON.Vec3(0, playerGroundOffset, PLAYER_SPAWN_Z),
    });
    addCapsuleShapes(playerBody, playerRadius, playerSegment);
    const bossBody = new CANNON.Body({
      mass: 190,
      material: enemyPhysicsMaterial,
      linearDamping: 0.86,
      fixedRotation: true,
      position: new CANNON.Vec3(0, bossGroundOffset, BOSS_SPAWN_Z),
    });
    addCapsuleShapes(bossBody, bossRadius, bossSegment);
    playerBody.updateMassProperties();
    bossBody.updateMassProperties();
    physicsWorld.addBody(playerBody);
    physicsWorld.addBody(bossBody);

    // 記住所有靜態障礙，畀測試查「兩個場之間有冇路行」。
    // 用瀏覽器行過去驗證喺呢度唔可行：軟件光柵化只得三幀，角色一秒行
    // 半米，而且一撞到雜兵就企喺度——量到嘅係機械人蠢，唔係地圖通唔通。
    // 記住嘅係「而家真係喺物理世界入面嘅障礙」，唔係「開場擺過啲乜」。
    // 第一版只加唔減：霧門一拆走，佢喺呢張表度仲係一堵牆，而重開再建一次
    // 就變成兩堵。條連通性 gate 靠呢張表答「路通唔通」，所以一張只加唔減
    // 嘅表，答案會愈嚟愈錯。
    type StaticBox = { x: number; y: number; z: number; hx: number; hy: number; hz: number; ry: number; tag?: string; body: CANNON.Body };
    const staticBoxes: StaticBox[] = [];
    type SceneryBox = { url: string; x: number; z: number; hx: number; hz: number; top: number; bottom: number;
      solid: boolean; run?: { 面軸: "x" | "z"; 面: number; 內: 1 | -1 } };
    const sceneryBoxes: SceneryBox[] = [];
    const removeStaticBox = (body: CANNON.Body) => {
      physicsWorld.removeBody(body);
      const i = staticBoxes.findIndex((b) => b.body === body);
      if (i >= 0) staticBoxes.splice(i, 1);
    };
    const addStaticBox = (
      position: [number, number, number],
      halfExtents: [number, number, number],
      rotationY = 0,
      tag?: string,
    ) => {
      const body = new CANNON.Body({
        type: CANNON.Body.STATIC,
        material: groundPhysicsMaterial,
        shape: new CANNON.Box(new CANNON.Vec3(...halfExtents)),
        position: new CANNON.Vec3(...position),
      });
      body.quaternion.setFromEuler(0, rotationY, 0);
      physicsWorld.addBody(body);
      staticBoxes.push({
        x: position[0], y: position[1], z: position[2],
        hx: halfExtents[0], hy: halfExtents[1], hz: halfExtents[2], ry: rotationY, tag, body,
      });
      return body;
    };

    // 個場嘅形狀喺 `map.ts`。呢度淨係話「點樣擺一個盒」，唔再話「盒喺邊」。
    const { ARENA, BRIDGE, COURT, NORTH, HALL, LINK, LINK_RUN, WALL_T } = buildMap(addStaticBox);
    // ---------- 睇得見嗰堵牆，同撞得到嗰堵係同一堵 ----------
    //
    // 實測：93 個 collider、612.2 米牆，其中 **187.6 米（30.6%）一米半範圍
    // 內冇任何睇得見嘅嘢**，20 個 collider 成條長度都係隱形。原因唔係漏擺
    // 模型，係**「牆喺邊」寫咗兩次**：collider 由 BRIDGE／HALL／LINK 嗰幾個
    // 數生出嚟（走廊 z = ±5.6、由 x = -47 一路到 -22.35 連住），而畫面上面
    // 嗰啲 `wall.glb` 係手寫嘅座標表（z = ±5.8，只擺喺 x = -27.5／-34.5／
    // -41.5／-46.5 四個位）。個模型闊 3.97 米、間距 7 米——即係**每兩幅牆之
    // 間有三米望落係空嘅，但行過去照撞**；而三個圓場嘅環牆（85 個 collider）
    // 由頭到尾完全冇對應嘅網格，成個圓場其實圍住一道隱形欄。
    //
    // 所以唔係「補返啲模型落去」——補幾多都係第二張表，第三次改就again 甩。
    // 直接由 collider 表本身畫：一個 InstancedMesh，一個 draw call，
    // **每一個標住 `wall` 嘅 collider 一定有一格網格喺同一個位、同一個尺寸、
    // 同一個角度**，因為兩樣嘢由同一個 for loop 出。手擺嘅 `wall.glb` 同塔
    // 就變返做裝飾，疊喺實體牆前面。
    const wallBoxes = staticBoxes.filter((b) => b.tag === "wall");
    const wallMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      // `polygonOffset`：實體牆嘅盒同裝飾用嘅 `wall.glb` **啱啱好同一個平面**
      // ——ADR-166 特登將模型內面貼實 collider 面（唔貼實就會企到入牆），而
      // 貼實嘅代價就係兩塊面同深度，深度緩衝分唔開邊塊喺前，逐幀跳來跳去。
      // 實測企定唔郁連拍六幀，畫面有一格 **67% 像素喺度「跳完又跳返」**。
      // 唔郁幾何（郁咗就同 ADR-165 條「網格＝collider」gate 打交），淨係喺深
      // 度上面推後少少，等裝飾嗰塊永遠贏。
      new THREE.MeshStandardMaterial({
        color: "#6c706d", roughness: 0.94, metalness: 0.04,
        polygonOffset: true, polygonOffsetFactor: 1.2, polygonOffsetUnits: 1.2,
      }),
      wallBoxes.length,
    );
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    {
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const tint = new THREE.Color();
      wallBoxes.forEach((b, i) => {
        q.setFromEuler(new THREE.Euler(0, b.ry, 0));
        m.compose(
          new THREE.Vector3(b.x, b.y, b.z),
          q,
          new THREE.Vector3(b.hx * 2, b.hy * 2, b.hz * 2),
        );
        wallMesh.setMatrixAt(i, m);
        // 每格輕微色差，唔係全部一嚿灰。
        const v = 0.86 + ((i * 37) % 17) / 60;
        wallMesh.setColorAt(i, tint.setRGB(0.42 * v, 0.44 * v, 0.43 * v));
      });
      wallMesh.instanceMatrix.needsUpdate = true;
    }
    scene.add(wallMesh);

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
    // 霧門有**兩道**，唔係一道。
    //
    // ADR-161 將地圖砌成一個環（庭院 → L 形捷徑 → 聖所西口）之後，霧門就
    // 冇再攔到任何嘢：北面通道嗰道照擺，但玩家一步都唔使打，由西面兜個圈
    // 就直接行到入 boss 場。舊嗰條連通性 gate 睇唔到——佢淨係沿住 x = 0
    // 行落去，即係**淨係行霧門嗰條路**。改成 flood fill 第一次跑就紅。
    //
    // 兩道門用同一組尺寸、同一個 shader、同一個淡出，出處只有一個。
    const FOG_GATE_PLACES: Array<{ pos: [number, number, number]; ry: number }> = [
      { pos: [FOG_GATE.pos[0], FOG_GATE.pos[1], FOG_GATE.pos[2]], ry: 0 },
      { pos: [-NORTH.r + 0.6, FOG_GATE.pos[1], NORTH.cz], ry: Math.PI / 2 },
    ];
    const bossGates = FOG_GATE_PLACES.map((place, i) => {
      const mesh = i === 0 ? bossGate : (bossGate.clone() as THREE.Mesh);
      mesh.position.set(place.pos[0], place.pos[1], place.pos[2]);
      mesh.rotation.y = place.ry;
      scene.add(mesh);
      return mesh;
    });
    // 霧門個 collider 只有一個出處。
    //
    // 本來位置同尺寸寫咗兩次——一次喺呢度，一次喺 `restart()` 入面。
    // ADR-154 將霧門由 `z = -9`／半闊 4 搬去通道口（`-ARENA_RADIUS + 0.6`／
    // 半闊 5.6）嗰陣，只改到呢度。即係**死一次撳 R 之後，圓場正中就多咗
    // 一道睇唔見嘅牆**，而且闊度同畫出嚟嗰道都唔夾。一件事寫兩次就有兩個
    // 答案——今個 session 第三次撞到同一個形狀（ADR-144／151）。
    //
    // 標住 `fog-gate`：佢係打完三關會拆走嘅暫時牆，唔應該同永久牆一齊計
    // 「條路通唔通」。冇呢個標記，「封死北面」同「霧門喺度」喺同一個 z 位
    // 置，連通性 gate 就分唔開（ADR-154 自己中過）。
    const makeFogGateBodies = () =>
      FOG_GATE_PLACES.map((place) => addStaticBox(place.pos, FOG_GATE.half, place.ry, "fog-gate"));
    let bossGateBodies: CANNON.Body[] = makeFogGateBodies();
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
      avoid: { turn: 0 },
      knockbackUntil: 0,
      move: "punch" as BossMove,
      leapTarget: new THREE.Vector3(),
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
    // 「機械人」有冇得量？有：**一幀之內轉幾多度、一幀之內加幾多速**。人手做
    // 唔到瞬間反向，一隻腳踩住地嘅角色亦都唔會一 tick 由靜止去到全速。呢兩個
    // 峰值就係「機械」同「有重量」之間嗰條界。
    let 上幀朝向: number | null = null;
    let 上幀速度 = 0;
    let 最快轉向 = 0;      // 弧度／秒
    let 最快加速 = 0;      // 米／秒²
    let 上幀自己行 = false;
    // 出手嗰一下，攻擊者自己郁咗幾多米。
    // 一刀斬落去應該係一個「踏前」——距離要由招式決定，唔係由你出手嗰刻
    // 啱好跑緊幾快決定。
    const 出手位移: number[] = [];
    let 出手中 = false;
    let 出手起點 = { x: 0, z: 0 };
    let 踏前幀 = 0, 踏前力 = 0, 踏前實速 = 0;
    // 玩家自己嗰個速度狀態（唔可以由 body 讀返，見下面）。
    let playerSpeed = 0;
    let 最高速 = 0;
    // 每次出手之間隔咗幾多「郁動秒」。
    //
    // 本來條 gate 係「22 秒窗口入面數下數，除以郁動秒」。實測窗口得 3.9 秒
    // 郁動時間、出手 **4** 下——即係**一下出手 = 0.26/秒**，而條門檻係 0.9，
    // 啱好夾喺 3 下（0.81）同 4 下（1.04）之間。上一次跑係 3 下所以綠，今次
    // 4 下就紅：**條 gate 分辨率細過佢自己要守嗰個效果**，之前綠係彩數。
    // 拉長窗口都唔得——玩家企喺度俾人打，捱唔到九十秒。
    //
    // 改為直接量間隔，而且**特登用 `motionClock` 而唔用 `now`**：`nextAttack`
    // 寫住 `now + 1.4 + rand`，所以 `now` 一日係郁動鐘，間隔就一定 ≥ 1.4。
    // 如果有人將 `now` 改返做真實時間（ADR-150 嗰個缺陷），出手就會每 1.4 秒
    // **真實時間**一下，換算返郁動時間得 0.25 秒左右——一條 gate 分得開。
    const attackGaps: number[] = [];

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
      bossGateBodies.forEach(removeStaticBox);
      bossGateBodies = [];
      gateFade = 1;
      bossBody.position.set(0, bossGroundOffset, BOSS_SPAWN_Z);
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

    // `需要視線` 只有射嘢嗰邊會開：鏡頭鎖敵人唔應該因為對方閃咗入柱後面
    // 就即刻甩鏡，但一支箭係唔應該穿過條柱嘅。
    const nearestEnemy = (需要視線 = false) => {
      const 睇得到 = 需要視線 ? makeLineOfSight(staticBoxes) : null;
      const 見到 = (root: THREE.Object3D) =>
        !睇得到 || 睇得到(playerRoot.position, root.position);
      let nearest: MinionEnemy | "boss" | null =
        bossActive && boss.hp > 0 && 見到(bossRoot) ? "boss" : null;
      let nearestDistance = nearest === "boss"
        ? playerRoot.position.distanceToSquared(bossRoot.position)
        : Number.POSITIVE_INFINITY;
      livingMinions().forEach((minion) => {
        const distance = playerRoot.position.distanceToSquared(minion.root.position);
        if (distance < nearestDistance && 見到(minion.root)) {
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
      const 睇得到 = makeLineOfSight(staticBoxes);
      let best: MinionEnemy | "boss" | null = null;
      let bestScore = Number.POSITIVE_INFINITY;
      candidates.forEach((candidate) => {
        const root = targetRoot(candidate);
        if (!root) return;
        // 隔住牆嘅唔算目標。冇呢一行，場入面啲柱同石喺戰鬥入面等於唔存在。
        if (!睇得到(origin, root.position)) return;
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
      solid = false,
    ) => {
      const gltf = await loadModel(url);
      const object = gltf.scene;
      configureModel(object, height, tint, tintStrength);
      object.position.x += position[0];
      object.position.y += position[1];
      object.position.z += position[2];
      object.rotation.y = rotation;
      scene.add(object);
      // 記低佢真正佔咗嘅世界空間（唔係擺落去嗰個座標）。collider 表答
      // 「撞到乜」，呢張表答「見到乜」——兩張表夾埋先答得到「撞到嘅嘢
      // 望唔望得見」。
      const bb = new THREE.Box3().setFromObject(object);
      sceneryBoxes.push({
        url: url.slice(url.lastIndexOf("/") + 1),
        x: (bb.min.x + bb.max.x) / 2, z: (bb.min.z + bb.max.z) / 2,
        hx: (bb.max.x - bb.min.x) / 2, hz: (bb.max.z - bb.min.z) / 2,
        top: bb.max.y, bottom: bb.min.y, solid,
      });
      // 障礙物嘅 collider 由模型自己度出嚟，唔再手寫。
      //
      // 本來場入面十件嘢各自手寫一個盒（`addStaticBox([-14, 1.5, 12], …)`），
      // 同擺模型嗰行完全分開。結果：(9, 15) 有個 1.7 米嘅盒但由頭到尾冇模型
      // ——出生點喺 z = 17，即係開波行兩步就撞到一嚿睇唔見嘅嘢；而反方向
      // 一樣衰，庭院同聖所嗰六條柱、一棵樹、一嚿石係穿得過嘅，圓場入面
      // 一模一樣嘅模型就撞得到。**同一個模型，一個場實心一個場穿得過。**
      //
      // 用全個 AABB 做 collider 唔啱：樹嘅 AABB 係成個樹冠，會變成貼地一圈
      // 望唔到嘅牆。真正擋住你嘅係**身位高度嗰截**，所以只量 2 米以下嗰截
      // 幾何——樹就係樹幹，塔就係塔基，牆模型就係成幅牆。
      if (solid) {
        const 身位 = new THREE.Box3();
        const v = new THREE.Vector3();
        object.updateWorldMatrix(true, true);
        object.traverse((node) => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh || !mesh.geometry) return;
          const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute | undefined;
          if (!pos) return;
          for (let i = 0; i < pos.count; i += 1) {
            v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
            if (v.y <= 2) 身位.expandByPoint(v);
          }
        });
        const 用 = 身位.isEmpty() ? bb : 身位;
        addStaticBox(
          [(用.min.x + 用.max.x) / 2, bb.max.y / 2, (用.min.z + 用.max.z) / 2],
          [
            Math.max(0.3, (用.max.x - 用.min.x) / 2),
            Math.max(0.5, bb.max.y / 2),
            Math.max(0.3, (用.max.z - 用.min.z) / 2),
          ],
          0,
          "prop",
        );
      }
      return object;
    };

    // 沿住一條走廊鋪一排牆，而且**貼返 collider 個面**。
    //
    // 實測：二十八幅走廊裝飾牆，每一幅嘅內面都喺 collider 面**入面 1.36 米**
    // （兩塊 kaykit 係 1.58）——即係你望住幅牆行埋去，會喺牆入面成米幾先停。
    // 成因同 ADR-165 嗰單一樣：模型擺喺手寫嘅 `z = ±5.8`，而 collider 由
    // `BRIDGE.halfWidth = 5.6` 生出，兩個數各自寫。順帶：橋長 24.65 米但得
    // 15.9 米有模型，其餘靠 ADR-165 嗰啲盒頂住。
    //
    // 而家一律由走廊自己嗰組數出：`面` 係 collider 中心線，`內` 指住行人嗰
    // 邊，模型量到幾深就向外退幾多，鋪幾多塊由走廊長度除以模型自己嘅闊度。
    // 改走廊闊度、改起訖點、換一個大細唔同嘅模型，三樣都唔使再改第二個數。
    const 鋪一排 = async (
      url: string, height: number, tint: string,
      run: { 面軸: "x" | "z"; 面: number; 內: 1 | -1; 由: number; 到: number },
    ) => {
      const gltf = await loadModel(url);
      configureModel(gltf.scene, height, tint, 0.48);
      const bb = new THREE.Box3().setFromObject(gltf.scene);
      const 深 = run.面軸 === "x" ? bb.max.x - bb.min.x : bb.max.z - bb.min.z;
      const 闊 = run.面軸 === "x" ? bb.max.z - bb.min.z : bb.max.x - bb.min.x;
      // 模型內面貼實 collider 內面：中心 = 面 + 內 × (WALL_T − 深/2)
      const 面座標 = run.面 + run.內 * (WALL_T - 深 / 2);
      const 長 = Math.abs(run.到 - run.由);
      const 幾多 = Math.max(1, Math.round(長 / 闊));
      const 步 = (run.到 - run.由) / 幾多;
      const 出: THREE.Object3D[] = [];
      for (let i = 0; i < 幾多; i += 1) {
        const 沿 = run.由 + 步 * (i + 0.5);
        const x = run.面軸 === "x" ? 面座標 : 沿;
        const z = run.面軸 === "x" ? 沿 : 面座標;
        const object = i === 0 ? gltf.scene : gltf.scene.clone(true);
        object.position.set(x, 0, z);
        object.rotation.y = run.面軸 === "x" ? Math.PI / 2 : 0;
        scene.add(object);
        const box = new THREE.Box3().setFromObject(object);
        sceneryBoxes.push({
          url: url.slice(url.lastIndexOf("/") + 1),
          x: (box.min.x + box.max.x) / 2, z: (box.min.z + box.max.z) / 2,
          hx: (box.max.x - box.min.x) / 2, hz: (box.max.z - box.min.z) / 2,
          top: box.max.y, bottom: box.min.y, solid: false,
          run: { 面軸: run.面軸, 面: run.面, 內: run.內 },
        });
        出.push(object);
      }
      return 出;
    };

    const selectCharacterClass = (characterClass: CharacterClass) => {
      // 每個職業射程唔同，弧線要跟返佢自己嗰個（遠程唔會顯示，但一樣計啱）。
      const cfg = CLASS_CONFIG[characterClass];
      attackArc.geometry.dispose();
      attackArc.geometry = arcGeometryFor(
        cfg.range,
        cfg.projectile === "none" ? SWEEP_RADIUS.melee : SWEEP_RADIUS.ranged,
      );
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
        addEnvironment("/assets/environment/siege-trebuchet.glb", 5.6, [13, 0, 8], -0.7, "#948570", 0.48, true),
        addEnvironment("/assets/environment/rocks-large.glb", 3.8, [-14, 0, 12], 0.4, "#8b8d88", 0.48, true),
        // (9, 15) 一直有個 1.7 米嘅 collider 但冇模型——開波行兩步就撞到一嚿
        // 睇唔見嘅嘢。ADR-165 補咗嚿石落去，**而嗰個位就係第一個恩典點**：
        // 即係由一開始，個 checkpoint 就企唔到人，補完石之後仲要變咗嚿石壓住
        // 佢。石搬去 (15.5, 12)，恩典點唔郁。
        addEnvironment("/assets/environment/rocks-large.glb", 1.6, [15.5, 0, 12], 1.1, "#8b8d88", 0.48, true),
        addEnvironment("/assets/environment/rocks-large.glb", 4.4, [14, 0, -6], 1.7, "#838985", 0.48, true),
        addEnvironment("/assets/environment/tree-large.glb", 8.5, [-18, 0, 10], -0.6, "#56635b", 0.48, true),
        addEnvironment("/assets/environment/tree-large.glb", 7.4, [18, 0, 14], 0.8, "#526057", 0.48, true),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_arched.gltf.glb", 7.6, [0, 0, -21.4], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_broken.gltf.glb", 7.2, [-7.2, 0, -21.2], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_cracked.gltf.glb", 7.2, [7.2, 0, -21.2], 0, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_window_open.gltf.glb", 6.2, [-14.2, 0, -18.5], 0.08, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/wall_window_open.gltf.glb", 6.2, [14.2, 0, -18.5], -0.08, "#909aa0", 0.08),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [-4.7, 0, -17.8], 0, "#909aa0", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [4.7, 0, -17.8], 0, "#909aa0", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/column.gltf.glb", 5.2, [-11.2, 0, -11.6], 0, "#909aa0", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/column.gltf.glb", 5.2, [11.2, 0, -11.6], 0, "#909aa0", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.7, [-8.8, 0, -13.8], 0.3, "#8a8f91", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.5, [8.9, 0, -12.4], -0.5, "#8a8f91", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/banner_patternA_red.gltf.glb", 3.4, [-3.2, 3.2, -21], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/banner_patternA_red.gltf.glb", 3.4, [3.2, 3.2, -21], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-2.2, 2.5, -20.7], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [2.2, 2.5, -20.7], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/barrel_small_stack.gltf.glb", 1.3, [-11.5, 0, 1.5], 0.4, "#ffffff", 0, true),
        addEnvironment("/assets/environment/kaykit-dungeon/crates_stacked.gltf.glb", 1.8, [11.5, 0, 0], -0.35, "#ffffff", 0, true),

        // ---------- 西面：門、橋、庭院 ----------
        // 呢三個模型（gate、bridge-straight-pillar、tower-square-top-roof-
        // high-windows）一直都喺 public/ 入面、一直都 ship 咗畀玩家落載，
        // 但一格都冇出現過。擴地圖唔使加新資產，用返已經喺度嗰啲就夠。
        addEnvironment("/assets/environment/gate.glb", 8.6, [-22.3, 0, 0], Math.PI / 2, "#8a9196"),
        // 通道兩邊用 wall.glb 砌走廊。原本擺咗三座 bridge-straight-pillar
        // 落中線，影出嚟先知嗰個模型係一整段有橋墩嘅高架橋——橋面喺人頭
        // 高度，玩家係由**橋底**穿過去，畫面讀落係一堵牆擋住條路。連通性
        // 個 gate 當時係綠嘅（物理上真係行得過），但綠嘅 gate 唔代表個景啱。
        ...[1, -1].map((內) => 鋪一排("/assets/environment/wall.glb", 5.2, "#818986", {
          面軸: "z", 面: -內 * BRIDGE.halfWidth, 內: 內 as 1 | -1,
          由: BRIDGE.x0, 到: BRIDGE.x1,
        })),
        // 兩座塔擺喺庭院牆外做天際線，唔擺入場中——16 米高嘅塔放喺一個
        // 十幾米半徑嘅院入面，鏡頭一入去就係成幅牆。
        addEnvironment("/assets/environment/tower-square-top-roof-high-windows.glb", 16, [-62, 0, -24], 0, "#818b90"),
        addEnvironment("/assets/environment/tower-square.glb", 11, [-78, 0, 9], 0.5, "#7c8582"),
        addEnvironment("/assets/environment/wall-corner-half-tower.glb", 7.8, [-60, 0, 17.6], Math.PI, "#7d8582"),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [-53, 0, -9.6], 0, "#909aa0", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 5.6, [-53, 0, 9.6], 0, "#909aa0", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.8, [-64.5, 0, 8.4], 0.9, "#8a8f91", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-51.6, 2.5, -3.6], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-51.6, 2.5, 3.6], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/rocks-large.glb", 4.0, [-68, 0, -8], 2.2, "#8b8d88", 0.48, true),
        addEnvironment("/assets/environment/tree-large.glb", 8.0, [-66, 0, 12], 1.1, "#56635b", 0.48, true),

        // ---------- 北面：通道同聖所 ----------
        ...[1, -1].map((內) => 鋪一排("/assets/environment/wall.glb", 5.2, "#7c8489", {
          面軸: "x", 面: -內 * HALL.halfWidth, 內: 內 as 1 | -1,
          由: HALL.z0, 到: HALL.z1,
        })),
        addEnvironment("/assets/environment/tower-square.glb", 12, [-17, 0, -62], 0.3, "#79817f"),
        addEnvironment("/assets/environment/tower-square.glb", 12, [17, 0, -62], -0.3, "#79817f"),
        addEnvironment("/assets/environment/wall-doorway.glb", 7.4, [0, 0, -67], Math.PI, "#8b9290"),
        // 聖所係三個場入面最疏嗰個：實測 **0.48 件/100 平方米**（圓場 0.96、
        // 庭院 0.55），而且淨係得兩種嘢（四條柱、兩堆碎石）。
        //
        // 加嘢唔可以再抄多幾條柱落去（Penny 講明唔好重覆用現有 3D 資產），而
        // 成個倉入面**得返一個 ship 咗但由頭到尾冇出現過嘅模型**：
        // `bridge-straight-pillar`。ADR-161 擺過佢落中線，影出嚟先知橋面喺人
        // 頭高度，玩家由橋底穿過去讀落係一堵牆——所以佢唔啱做路。做**塌咗嘅
        // 高架水道**就啱：擺喺 boss 背後貼住北牆，你係喺佢面前打，唔係穿過佢。
        addEnvironment("/assets/environment/bridge-straight-pillar.glb", 9, [0, 0, -63], 0, "#7f8a8d", 0.48, true),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 6.2, [-9, 0, -41], 0, "#9aa2a6", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 6.2, [9, 0, -41], 0, "#9aa2a6", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 6.2, [-9, 0, -55], 0, "#9aa2a6", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/pillar_decorated.gltf.glb", 6.2, [9, 0, -55], 0, "#9aa2a6", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/banner_patternA_red.gltf.glb", 3.8, [-4, 3.4, -66.4], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/banner_patternA_red.gltf.glb", 3.8, [4, 3.4, -66.4], 0, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 2.0, [-12, 0, -47], 0.6, "#8a8f91", 0.08, true),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.8, [12, 0, -50], -0.9, "#8a8f91", 0.08, true),

        // ---------- 庭院 → 聖所 嘅 L 形捷徑 ----------
        // 走廊兩邊行牆，拐角擺座塔做地標——一條淨係得兩幅牆嘅通道，行到中間
        // 唔知自己去緊邊。
        鋪一排("/assets/environment/wall.glb", 5.2, "#79827f",
          { 面軸: "x", 面: LINK_RUN.西, 內: 1, 由: LINK_RUN.起, 到: LINK_RUN.南 }),
        鋪一排("/assets/environment/wall.glb", 5.2, "#79827f",
          { 面軸: "x", 面: LINK_RUN.東, 內: -1, 由: LINK_RUN.起, 到: LINK_RUN.北 }),
        addEnvironment("/assets/environment/wall-corner-half-tower.glb", 8.4, [-66, 0, -54], 0, "#7d8582"),
        鋪一排("/assets/environment/wall.glb", 5.2, "#79827f",
          { 面軸: "z", 面: LINK_RUN.南, 內: 1, 由: LINK_RUN.西, 到: LINK_RUN.尾 }),
        鋪一排("/assets/environment/wall.glb", 5.2, "#79827f",
          { 面軸: "z", 面: LINK_RUN.北, 內: -1, 由: LINK_RUN.東, 到: LINK_RUN.尾 }),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-54.6, 2.5, -30], -Math.PI / 2, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/torch_mounted.gltf.glb", 1.3, [-44, 2.5, -42.6], Math.PI, "#ffffff", 0),
        addEnvironment("/assets/environment/kaykit-dungeon/rubble_large.gltf.glb", 1.6, [-58, 0, -46], 1.4, "#8a8f91", 0.08, true),
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
        { wave: 0, spawn: [-4.2, 3.2] },
        { wave: 0, spawn: [4.2, 2.2] },
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
          lastAttackMotion: 0,
          avoid: { turn: 0 },
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
      playerBody.position.set(0, playerGroundOffset, PLAYER_SPAWN_Z);
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
      bossRoot.position.set(0, 0, BOSS_SPAWN_Z);
      bossBody.position.set(0, bossGroundOffset, BOSS_SPAWN_Z);
      bossBody.velocity.setZero();
      bossBody.angularVelocity.setZero();
      bossBody.wakeUp();
      bossRoot.visible = true;
      bossActive = false;
      encounterStage = 0;
      attackTarget = null;
      runStartedAt = performance.now();
      runRecorded = false;
      bossGates.forEach((mesh) => { mesh.visible = true; });
      gateFade = 1;
      (bossGate.material as THREE.ShaderMaterial).uniforms.opacity.value = 0.82;
      // 唔用 `if (!bossGateBody)`：嗰個寫法令「開咗 boss 門先死」同「未開就
      // 死」行兩條唔同嘅路，而只有前者會重建個 collider。結果就係一條要
      // 「打到 boss、死、再重開」先觸發到嘅 bug——而條測試點都行唔到嗰度。
      // 一律拆走再重建，兩種死法行同一條路。
      bossGateBodies.forEach(removeStaticBox);
      bossGateBodies = makeFogGateBodies();
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
      if (event.pointerType !== "mouse") {
        pinchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pinchPointers.size === 2) pinchSpan = 0;
      }
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
      onPinchMove(event);
      // 兩隻手指喺度就係縮放，唔係轉鏡頭——否則一捏就連帶掃咗個 yaw。
      if (pinchPointers.size >= 2) return;
      if (!cameraDragging || cameraPointerId !== event.pointerId) return;
      const horizontalDelta =
        event.pointerType === "mouse" ? event.movementX : event.clientX - lastCameraPointerX;
      cameraYaw -= horizontalDelta * (event.pointerType === "mouse" ? 0.005 : 0.009);
      lastCameraPointerX = event.clientX;
      event.preventDefault();
    };
    const onPointerUp = (event: PointerEvent) => {
      pinchPointers.delete(event.pointerId);
      if (pinchPointers.size < 2) pinchSpan = 0;
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
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomBy(event.deltaY > 0 ? 1.09 : 1 / 1.09);
    };
    const onPinchMove = (event: PointerEvent) => {
      if (!pinchPointers.has(event.pointerId)) return;
      pinchPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pinchPointers.size !== 2) return;
      const [a, b] = [...pinchPointers.values()];
      const span = Math.hypot(a.x - b.x, a.y - b.y);
      // 同深淵之橋一樣：6 px 死區，否則手指微震都會不停縮放。
      if (pinchSpan && Math.abs(span - pinchSpan) > 6) zoomBy(pinchSpan / span);
      pinchSpan = span;
    };
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
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
      map: () => ({ arenaR: ARENA.r, court: { ...COURT }, bridge: { ...BRIDGE }, north: { ...NORTH }, hall: { ...HALL }, link: { ...LINK }, wallT: WALL_T }),
      walls: () => staticBoxes.map(({ body: _b, ...rest }) => rest),
      scenery: () => sceneryBoxes.map((b) => ({ ...b })),
      // 由真正畫緊嗰個 InstancedMesh 度拆返出嚟，唔係抄一份來源數據——
      // 「畫嘅」同「撞嘅」要夾得埋，就一定要兩邊都問返實物。
      wallMesh: () => {
        const m = new THREE.Matrix4(), p = new THREE.Vector3();
        const q = new THREE.Quaternion(), s = new THREE.Vector3();
        const e = new THREE.Euler();
        const out = [];
        for (let i = 0; i < wallMesh.count; i += 1) {
          wallMesh.getMatrixAt(i, m);
          m.decompose(p, q, s);
          e.setFromQuaternion(q, "YXZ");
          out.push({ x: p.x, y: p.y, z: p.z, hx: s.x / 2, hy: s.y / 2, hz: s.z / 2, ry: e.y });
        }
        return out;
      },
      clock: () => ({ real: performance.now() / 1000, motion: motionClock, attacks: minionAttacks,
        間隔: attackGaps.slice() }),
      // 揮擊弧線畫成點 vs 判定實際係點——兩組數分開出，等測試可以夾佢哋
      bossMove: (phase: 1 | 2, distance: number, roll: number, 見到落點 = true) =>
        chooseBossMove(phase, distance, roll, 見到落點),
      leapMinRange: () => LEAP_MIN_RANGE,
      waypoint: () => ({ 亮: waypoint.visible, x: waypoint.position.x, z: waypoint.position.z,
        門檻: WAYPOINT_MIN_DISTANCE }),
      waypointRule: (distance: number | null, alive: boolean) => shouldShowWaypoint(distance, alive),
      fills: () => regionalFills.map((f) => ({
        亮: f.visible, 射程: f.distance,
        離玩家: +playerRoot.position.distanceTo(f.position).toFixed(1),
      })),
      swing: () => {
        const p = attackArc.geometry.parameters as { radius: number; arc: number };
        const cfg = CLASS_CONFIG[currentClass];
        return {
          畫: { 半徑: p.radius * attackArc.scale.x, 角度: p.arc },
          判: { 射程: cfg.range, 側向: (cfg.projectile === "none" ? SWEEP_RADIUS.melee : SWEEP_RADIUS.ranged) + minionRadius },
        };
      },
      spawns: () => minions.map((m) => ({ wave: m.wave, x: m.spawn[0], z: m.spawn[1] })),
      graces: () => graces.map((g) => ({ x: g.position.x, z: g.position.z })),
      視線: (from: [number, number], to: [number, number]) =>
        makeLineOfSight(staticBoxes)({ x: from[0], z: from[1] }, { x: to[0], z: to[1] }),
      // 敵人出手嗰條規則本身，唔係抄一份出嚟——遊戲三個出手點行嘅係同一個
      // `canLand`。射程照跟遊戲自己啲數。
      出手: (from: [number, number], to: [number, number], reach: number) =>
        canLand({ x: from[0], z: from[1] }, { x: to[0], z: to[1] }, reach,
          makeLineOfSight(staticBoxes)),
      射程: () => ({ 雜兵: 2.35, boss一階: 3.9, boss二階: 4.5, 撲擊: 5.2 }),
      動作: () => ({
        最快轉向: +最快轉向.toFixed(2), 最快加速: +最快加速.toFixed(2),
        速度: +Math.hypot(playerBody.velocity.x, playerBody.velocity.z).toFixed(2),
        動畫: currentPlayerAction,
        出手位移: 出手位移.slice(), 踏前幀, 踏前力: +踏前力.toFixed(2),
        最高速: +最高速.toFixed(2), 設計速: CLASS_CONFIG[currentClass].speed,
        踏前實速: +踏前實速.toFixed(2),
      }),
      重置動作量度: () => { 最快轉向 = 0; 最快加速 = 0; 出手位移.length = 0; 踏前幀 = 0; 踏前力 = 0; 最高速 = 0; 踏前實速 = 0; },
      // 條線由遊戲自己出，唔喺測試度寫死。
      郁動上限: () => ({ 轉向: TURN_RATE, 加速: ACCEL, 減速: DECEL, 踏前: LUNGE_SPEED }),
      zoom: () => camZoom,
      zoomBy: (f: number) => { zoomBy(f); return camZoom; },
      // 由 A 追去 B，行一次真物理，唔畫任何嘢。
      //
      // 「雜兵追唔追得到你」呢條問題之前答唔到：唯一嘅方法係喺瀏覽器度企定
      // 等佢行過嚟，而軟件光柵化一秒三幀、角色一秒行半米——量到嘅係機械人蠢
      // 定係地圖爛，分唔開（ADR-157）。呢度用**同一批 collider**（連今個
      // session 先啱啱變實心嗰啲柱同石）同**同一條追擊規則**（`chase.ts`），
      // 固定 1/60 步長行落去，一次 evaluate 幾千步，同幀率完全無關。
      //
      // 點解要緊：清晒一波先開到下一關。有一個玩家企得到嘅位置係雜兵永遠
      // 到唔到嘅，就唔止「打得輕鬆啲」——係成局卡死。
      追擊試: (from: [number, number], to: [number, number], seconds = 24, 邊個 = "minion") => {
        const 誰 = 邊個 === "boss"
          ? { r: bossRadius, seg: bossSegment, 高: bossGroundOffset, 速: 6.3, 射: BOSS_REACH, 質: 120 }
          : { r: minionRadius, seg: minionSegment, 高: minionGroundOffset, 速: MINION_SPEED[2], 射: MINION_ATTACK_RANGE, 質: 44 };
        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -18, 0) });
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.defaultContactMaterial.friction = 0.02;
        world.addBody(new CANNON.Body({
          type: CANNON.Body.STATIC, shape: new CANNON.Plane(),
          quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
        }));
        for (const b of staticBoxes) {
          const body = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Box(new CANNON.Vec3(b.hx, b.hy, b.hz)),
            position: new CANNON.Vec3(b.x, b.y, b.z),
          });
          body.quaternion.setFromEuler(0, b.ry, 0);
          world.addBody(body);
        }
        const runner = new CANNON.Body({
          mass: 誰.質, linearDamping: 0.84, fixedRotation: true,
          position: new CANNON.Vec3(from[0], 誰.高, from[1]),
        });
        addCapsuleShapes(runner, 誰.r, 誰.seg);
        runner.updateMassProperties();
        world.addBody(runner);
        const 目標 = { x: to[0], z: to[1] };
        const memo = { turn: 0 };
        const dt = 1 / 60;
        let 最近 = Infinity, 用咗 = seconds;
        for (let step = 0; step * dt < seconds; step += 1) {
          const 位 = { x: runner.position.x, z: runner.position.z };
          const d = Math.hypot(位.x - 目標.x, 位.z - 目標.z);
          if (d < 最近) 最近 = d;
          if (d <= 誰.射) { 用咗 = step * dt; break; }
          const dir = chaseDirection(位, 目標, [], makeBlocked(staticBoxes, 誰.r), memo);
          runner.velocity.x = dir.x * 誰.速;
          runner.velocity.z = dir.z * 誰.速;
          world.step(dt);
        }
        return { 最近: +最近.toFixed(2), 用咗: +用咗.toFixed(2),
          到: 最近 <= 誰.射,
          尾: [+runner.position.x.toFixed(1), +runner.position.z.toFixed(1)] };
      },
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
        bossGates.forEach((mesh) => { mesh.visible = gateFade > 0; });
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
          attackTarget = nearestEnemy(true);
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
            // ADR-176 封咗郁動嗰邊嘅瞬間轉向，但呢行漏咗——鎖定住出手照樣
            // 一幀轉曬。出手中轉得慢過行路：可以修正準星，唔可以原地打轉。
            player.rotation = turnToward(
              player.rotation, Math.atan2(toBoss.x, toBoss.z), delta, TURN_RATE_ATTACK);
          }
          const attackProgress =
            1 - (player.stateUntil - now) / classConfig.attackDuration;
          // 踏前：由招式話事，唔係由你出手嗰刻啱好幾快話事。所以速度**寫落去**
          // （唔係加落去），喺前搖嗰段線性收到零；過咗撞擊點就完全停低。
          if (classConfig.projectile === "none") {
            const 前搖 = Math.max(0.001, classConfig.impactDelay / classConfig.attackDuration);
            const 力 = attackProgress < 前搖 ? 1 - attackProgress / 前搖 : 0;
            playerBody.velocity.x = Math.sin(player.rotation) * LUNGE_SPEED * 力;
            playerBody.velocity.z = Math.cos(player.rotation) * LUNGE_SPEED * 力;
            playerSpeed = LUNGE_SPEED * 力;
            踏前幀 += 1; 踏前力 = Math.max(踏前力, 力);
          }
          attackArc.position.copy(playerRoot.position).add(new THREE.Vector3(0, 1.15, 0));
          attackArc.rotation.z = -player.rotation + 0.2;
          attackArc.scale.setScalar(0.94 + attackProgress * 0.1);
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
              classConfig.projectile === "none" ? SWEEP_RADIUS.melee : SWEEP_RADIUS.ranged,
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
          // 唔再一 tick 到全速：由而家嘅速度向目標靠。
          //
          // **個「現速」唔可以由 body 度讀返**：每一幀開頭都有
          // `playerBody.velocity.x = 0`，所以讀返嚟永遠係零，條斜坡每幀由零
          // 重新開始，實際速度就變成 `ACCEL × delta`——實測玩家平均得
          // **0.09 米／秒**（設計 12.5），而六十二條 gate 全綠，因為冇一條量
          // 過最高速度，全部淨係量變化率。所以速度自己要有個狀態。
          const 新速 = approachSpeed(playerSpeed, speed, delta);
          playerSpeed = 新速;
          最高速 = Math.max(最高速, 新速);
          playerBody.velocity.x = movement.x * 新速;
          playerBody.velocity.z = movement.z * 新速;
          // 轉身有速度上限。要轉嘅係 `player.rotation` **本身**，唔淨係個模型：
          // 揮擊判定用嘅就係佢，兩者一分開，弧線就會講大話（ADR-151）。
          player.rotation = turnToward(player.rotation, Math.atan2(movement.x, movement.z), delta);
          if (now >= nextFootstep) {
            gameAudio.play("footstep", playerRoot.position.x, playerRoot.position.z);
            nextFootstep = now + (sprinting ? 0.14 : 0.2);
          }
          if (sprinting) player.stamina = Math.max(0, player.stamina - delta * 13);
          // 動畫速率跟**真實地面速度**，唔係一個常數。起步嗰兩三幀身體仲未到
          // 全速，而腳照樣用全速踩——嗰個就係「腳踏空」嘅來源。
          const 步速 = sprinting ? 1.9 : 2.15;
          currentPlayerAction = playAction(
            playerActions,
            sprinting
              ? currentClass === "ranger"
                ? "Run_Holding"
                : "Run_Weapon"
              : "Walk",
            currentPlayerAction,
            false,
            步速 * Math.max(0.35, 新速 / speed),
          );
          playerActions.get(currentPlayerAction)?.setEffectiveTimeScale(步速 * Math.max(0.35, 新速 / speed));
        } else {
          // 放手唔係即刻停：由 `DECEL` 收返落零，方向保持原本嗰個。
          playerSpeed = approachSpeed(playerSpeed, 0, delta);
          if (playerSpeed > 0.01) {
            playerBody.velocity.x = Math.sin(player.rotation) * playerSpeed;
            playerBody.velocity.z = Math.cos(player.rotation) * playerSpeed;
          }
          currentPlayerAction = playAction(playerActions, "Idle_Weapon", currentPlayerAction);
        }

        if (player.state !== "attack" && player.state !== "dodge" && !keys.has("ShiftLeft")) {
          player.stamina = Math.min(100, player.stamina + delta * 28);
        }

        // 出手期間攻擊者自己行咗幾遠
        if (player.state === "attack") {
          踏前實速 = Math.max(踏前實速, Math.hypot(playerBody.velocity.x, playerBody.velocity.z));
        }
        if (player.state === "attack" && !出手中) {
          出手中 = true;
          出手起點 = { x: playerRoot.position.x, z: playerRoot.position.z };
        } else if (player.state !== "attack" && 出手中) {
          出手中 = false;
          出手位移.push(+Math.hypot(
            playerRoot.position.x - 出手起點.x, playerRoot.position.z - 出手起點.z).toFixed(2));
          if (出手位移.length > 40) 出手位移.shift();
        }
        // 加速度只計「自己行」嗰啲幀。擊退同閃避係衝量——一下撞埋嚟或者一個
        // 翻滾**本來就應該係瞬間**，將佢哋撈埋一齊量，就係用一把尺量兩件事。
        const 自己行 = player.state === "idle" && now >= player.knockbackUntil;
        if (上幀朝向 !== null && delta > 0) {
          const d = Math.atan2(Math.sin(player.rotation - 上幀朝向), Math.cos(player.rotation - 上幀朝向));
          最快轉向 = Math.max(最快轉向, Math.abs(d) / delta);
          const v = Math.hypot(playerBody.velocity.x, playerBody.velocity.z);
          if (自己行 && 上幀自己行) 最快加速 = Math.max(最快加速, Math.abs(v - 上幀速度) / delta);
          上幀速度 = v;
        } else {
          上幀速度 = Math.hypot(playerBody.velocity.x, playerBody.velocity.z);
        }
        上幀自己行 = 自己行;
        上幀朝向 = player.rotation;
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
              if (
                canLand(minion.root.position, playerRoot.position, 2.35,
                  makeLineOfSight(staticBoxes))
                && now > player.invincibleUntil
              ) {
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
          } else if (minionDistance > MINION_ATTACK_RANGE) {
            minion.state = "run";
            // 條規則喺 `chase.ts`，測試行嘅係同一條。
            const direction = chaseDirection(
              minion.root.position,
              playerRoot.position,
              livingMinions().filter((other) => other !== minion).map((other) => other.root.position),
              makeBlocked(staticBoxes, minionRadius),
              minion.avoid,
            );
            const speed = MINION_SPEED[minion.wave];
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
            if (minion.lastAttackMotion > 0) attackGaps.push(motionClock - minion.lastAttackMotion);
            minion.lastAttackMotion = motionClock;
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
          // 雜兵同 boss 一樣要有轉身時間。佢哋本來每一幀都直接指住你，
          // 即係你繞到佢背後嗰一刻佢已經轉咗——**繞後**呢個動作等於唔存在。
          minion.root.rotation.y = turnToward(
            minion.root.rotation.y, Math.atan2(toPlayer.x, toPlayer.z), delta, TURN_RATE_ENEMY);
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
          const leaping = boss.move === "leap";
          const windup = leaping ? 0.78 : boss.phase === 2 ? 0.52 : 0.72;
          const hitRadius = leaping ? 5.2 : boss.phase === 2 ? 4.5 : 3.9;
          telegraph.visible = true;
          // 撲擊嘅圈畫喺落點，普通拳嘅圈畫喺自己身上。
          telegraph.position.x = leaping ? boss.leapTarget.x : bossRoot.position.x;
          telegraph.position.z = leaping ? boss.leapTarget.z : bossRoot.position.z;
          const pulse = clamp(1 - (boss.impactAt - now) / windup, 0, 1);
          telegraph.scale.setScalar((leaping ? 1.55 : 0.4) + pulse * (leaping ? 0.62 : 0.9));
          (telegraph.material as THREE.MeshBasicMaterial).opacity = 0.25 + pulse * 0.65;
          if (leaping && !boss.impactDone) {
            // 向住鎖死咗嘅落點飛，順手起一個弧線高度。
            const toLand = boss.leapTarget.clone().sub(bossRoot.position);
            toLand.y = 0;
            const remain = Math.max(0.02, boss.impactAt - now);
            bossBody.velocity.x = toLand.x / remain;
            bossBody.velocity.z = toLand.z / remain;
            bossRoot.position.y = Math.sin(pulse * Math.PI) * 1.9;
          }
          if (!boss.impactDone && now >= boss.impactAt) {
            boss.impactDone = true;
            telegraph.visible = false;
            bossRoot.position.y = 0;
            if (leaping) {
              bossBody.velocity.x = 0;
              bossBody.velocity.z = 0;
              currentBossAction = playAction(bossActions, "Jump_Land", currentBossAction, true, 1.2);
              cameraShake = 0.6;
            }
            gameAudio.play("bossSlam", bossRoot.position.x, bossRoot.position.z);
            // 撲擊量嘅係「離落點幾遠」，唔係「離 boss 幾遠」——玩家係靠
            // 個圈避開嗰塊地，唔係靠避開隻怪。
            // 撲擊由落點度起，普攻由 boss 度起——同上面嗰句一樣嘅道理，
            // 而視線亦都要由同一點度：一浸由落點散開嘅衝擊波，擋唔擋得住
            // 睇嘅係落點同你之間有冇嘢，唔係隻怪同你之間。
            const 出手點 = leaping ? boss.leapTarget : bossRoot.position;
            if (
              canLand(出手點, playerRoot.position, hitRadius, makeLineOfSight(staticBoxes))
              && now > player.invincibleUntil
            ) {
              player.hp = clamp(player.hp - (leaping ? 30 : boss.phase === 2 ? 34 : 25), 0, 100);
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
        } else if (bossDistance > BOSS_REACH) {
          boss.state = "run";
          // Boss 同雜兵行同一條規則。**佢本來冇迴避**，而聖所而家有四條實心
          // 柱（ADR-165 之後）——一隻兜唔到柱嘅 boss 唔會卡死成局（佢唔使清），
          // 但佢會喺柱前面企定畀人免費打，而個場最大嗰個特徵就係嗰四條柱。
          const direction = chaseDirection(
            bossRoot.position,
            playerRoot.position,
            [],
            makeBlocked(staticBoxes, bossRadius),
            boss.avoid,
          );
          const bossSpeed = boss.phase === 2 ? 8.3 : 6.3;
          bossBody.velocity.x = direction.x * bossSpeed;
          bossBody.velocity.z = direction.z * bossSpeed;
          currentBossAction = playAction(bossActions, "Run", currentBossAction, false, boss.phase === 2 ? 2.1 : 1.82);
        } else if (now >= boss.nextAttack) {
          boss.move = chooseBossMove(
            boss.phase as 1 | 2, bossDistance, Math.random(),
            makeLineOfSight(staticBoxes)(bossRoot.position, playerRoot.position),
          );
          boss.state = "windup";
          boss.impactDone = false;
          if (boss.move === "leap") {
            // 撲擊：起跳嗰刻鎖死落點，然後成段前搖都向住嗰點飛。
            // 預警圈畫喺**落點**唔係畫喺 boss 度——玩家要讀嘅係「佢會落
            // 邊」，唔係「佢而家企邊」。呢個先係同 Punch 唔同嘅玩法。
            boss.leapTarget.copy(playerRoot.position);
            boss.impactAt = now + 0.78;
            boss.stateUntil = boss.impactAt + 0.2;
            boss.nextAttack = now + 2.4;
            currentBossAction = playAction(bossActions, "Jump", currentBossAction, true, 1.05);
          } else {
            boss.impactAt = now + (boss.phase === 2 ? 0.52 : 0.72);
            boss.stateUntil = boss.impactAt + 0.15;
            boss.nextAttack = now + (boss.phase === 2 ? 1.55 : 2.2);
            currentBossAction = playAction(bossActions, "Punch", currentBossAction, true, boss.phase === 2 ? 1.3 : 0.95);
          }
        } else {
          boss.state = "idle";
          currentBossAction = playAction(bossActions, "Idle", currentBossAction);
        }
        if (boss.state !== "dead") {
          bossRoot.rotation.y = turnToward(
            bossRoot.rotation.y, Math.atan2(toBoss.x, toBoss.z), delta, TURN_RATE_BOSS);
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
      const cameraDistance = (locked && cameraTarget ? CAMERA_BACK + 1.3 : CAMERA_BACK) * camZoom;
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
        // 呢個 pad 唔係「畀鏡頭啲鬆動位」咁簡單：碰撞盒係 0.42 米薄，而畫
        // 出嚟嗰幅 `wall.glb` 厚好多。鏡頭停喺盒外面 0.5 米，實際上已經插咗
        // 入面幅牆嘅網格——實測企喺捷徑走廊度影相，成幅畫係黑嘅，而附近根本
        // 冇嘢擋喺鏡頭同角色之間。所以 pad 要蓋埋視覺網格伸出碰撞盒嗰截。
        const pad = 1.35;
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
      // 鏡頭俾牆逼近咗就要**升高兼俯視**，唔係跟住縮埋落地。
      //
      // 本來高度係 `2.2 + (allowed / cameraDistance) * 2.6`，即係愈近愈矮——
      // 兩樣一齊縮，角色就會塞爆成幅畫。實測開波第一格：出生點 (0, 17) 離南
      // 面環牆得 5.35 米，而鏡頭要 8.3 + 1.77 米先企得穩，所以 `allowed` 直接
      // 跌到下限 **2.4 米**（實測四個尺寸 2.73–2.84）——**入場第一眼就係設計
      // 距離嘅三分一**。愈逼近就愈高，最少維持到望得到自己企喺邊。
      const 逼近 = 1 - allowed / cameraDistance;
      targetCamera.set(
        playerRoot.position.x + camDir.x * allowed,
        2.2 + (allowed / cameraDistance) * 2.6 + 逼近 * 3.4,
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
      // 目標離得遠先亮光柱：近嘅時候你已經見到敵人，再插支柱落去就係阻住。
      {
        const live = livingMinions();
        const targetPos = bossActive && boss.hp > 0
          ? bossRoot.position
          : live.length
            ? live.reduce((sum, m) => sum.add(m.root.position), new THREE.Vector3())
                .multiplyScalar(1 / live.length)
            : null;
        const far = shouldShowWaypoint(
          targetPos == null ? null : playerRoot.position.distanceTo(targetPos),
          player.state !== "dead" && boss.state !== "dead",
        );
        waypoint.visible = far;
        if (far && targetPos) {
          waypoint.position.set(targetPos.x, 13, targetPos.z);
          (waypoint.material as THREE.MeshBasicMaterial).opacity =
            0.1 + Math.sin(now * 1.6) * 0.045;
        }
      }

      for (const fill of regionalFills) {
        fill.visible = playerRoot.position.distanceTo(fill.position) < fill.distance + 6;
      }

      camera.lookAt(cameraLook);
      // 陰影框跟玩家行。唔 update target 嘅 matrix 嘅話，three.js 仲係
      // 用住舊嗰個方向——燈郁咗，陰影唔郁。
      // 陰影相機只准喺 texel 格上面郁——唔貼格就會全場陰影每幀「爬」一下。
      // texel 大細由陰影框同貼圖尺寸出，唔另外寫一個數。
      const 貼格 = snapShadowTarget(playerRoot.position, MOON_OFFSET, SHADOW_TEXEL);
      moonLight.target.position.set(貼格.x, 貼格.y, 貼格.z);
      moonLight.position.set(貼格.x + MOON_OFFSET.x, 貼格.y + MOON_OFFSET.y, 貼格.z + MOON_OFFSET.z);
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
      renderer.domElement.removeEventListener("wheel", onWheel);
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
    if (stickPointer.current !== event.pointerId) return;
    const 中 = stickOriginRef.current;
    if (!中) return;
    // 半徑同深淵之橋一樣行 52px：一個大姆指掃得舒服嘅距離。
    const radius = 52;
    const x = clamp((event.clientX - 中.x) / radius, -1, 1);
    const y = clamp((event.clientY - 中.y) / radius, -1, 1);
    const length = Math.hypot(x, y);
    const next = length > 1 ? { x: x / length, y: y / length } : { x, y };
    setStick(next);
    engineRef.current?.setMove(next.x, next.y);
  };

  const releaseStick = () => {
    stickPointer.current = null;
    stickOriginRef.current = null;
    setStickOrigin(null);
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
          {/* 搖桿浮動，唔再釘死喺左下角。
              實測釘死嗰陣，打橫嘅時候佢個中心喺畫面 **8.3%／10.5%** 位置、左
              邊淨係 20px——即係大姆指要伸到最邊先撳到（Penny：「控桿太左」）。
              深淵之橋嘅做法係：畫面左邊嗰半，你撳邊度佢就喺邊度出現。冇「太
              左」呢回事，因為佢冇固定位置。 */}
          <div
            className="touch-zone"
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") return;
              stickPointer.current = event.pointerId;
              stickOriginRef.current = { x: event.clientX, y: event.clientY };
              setStickOrigin(stickOriginRef.current);
              // 捕捉係錦上添花，狀態先係正經事——同深淵之橋一樣包住 try：
              // 冇 active pointer 嗰陣佢會掟錯，而嗰下錯會打斷成個 handler。
              try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* 冇捕捉照用 */ }
            }}
            onPointerMove={updateStick}
            onPointerUp={releaseStick}
            onPointerCancel={releaseStick}
          >
            {stickOrigin && (
              <div
                ref={stickRef}
                className="touch-stick"
                style={{ left: stickOrigin.x, top: stickOrigin.y }}
              >
                <i style={{ transform: `translate(${stick.x * 28}px, ${stick.y * 28}px)` }} />
              </div>
            )}
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
