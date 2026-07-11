import { Color3, Color4, DefaultRenderingPipeline, DirectionalLight, HemisphericLight, MeshBuilder, Ray, Scene, ShadowGenerator, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { MODEL_ASSETS } from "../../config/assets";
import { GAMEPLAY } from "../../config/gameplay";
import type { QualityPreset } from "../../config/quality";
import { AudioManager } from "../../audio/AudioManager";
import { DebugPanel } from "../../debug/DebugPanel";
import { TouchControls } from "../../ui/TouchControls";
import { Hud } from "../../ui/Hud";
import { AnimationResolver } from "../animation/AnimationResolver";
import { AssetLibrary } from "../assets/AssetLibrary";
import { WeaponAttachment, type WeaponAttachmentResult } from "../assets/WeaponAttachment";
import { MobileCombatCamera } from "../camera/MobileCombatCamera";
import { WeaponSystem } from "../combat/WeaponSystem";
import { EnergyCore } from "../entities/EnergyCore";
import { PlayerController } from "../entities/PlayerController";
import { cameraRelativeMovement } from "../entities/movement";
import { RaiderDrone } from "../entities/RaiderDrone";
import { WorldScrollSystem } from "../environment/WorldScrollSystem";
import { GameStateMachine } from "../state/GameStateMachine";
import { resolveOutcome } from "../state/OutcomeResolver";
import { PausableClock } from "../systems/PausableClock";
import { ObjectPool } from "../systems/ObjectPool";
import { WaveManager, type DroneVariant, type WaveEvent } from "../systems/WaveManager";

interface Projectile { node: TransformNode; velocity: Vector3; age: number; maxAge: number; target: "player" | "core"; }
export interface BattleCallbacks { onLoaded: (errors: string[]) => void; onProgress: (label: string, progress: number) => void; onResult: (won: boolean, stats: BattleStats) => void; onError: (message: string) => void; }
export interface BattleStats { elapsed: number; kills: number; coreHealth: number; }

export class TrainBattleScene {
  readonly state = new GameStateMachine();
  readonly clock = new PausableClock();
  readonly hud = new Hud();
  readonly audio = new AudioManager();
  readonly scene: Scene;
  controls?: TouchControls;
  attachment?: WeaponAttachmentResult;
  private assets?: AssetLibrary;
  private player?: PlayerController;
  private core?: EnergyCore;
  private camera?: MobileCombatCamera;
  private weapon?: WeaponSystem;
  private world?: WorldScrollSystem;
  private debug?: DebugPanel;
  private readonly waves = new WaveManager();
  private readonly drones: RaiderDrone[] = [];
  private readonly projectiles: Projectile[] = [];
  private tutorialTimer = 0;
  private tutorialSpawned = false;
  private kills = 0;
  private side = -1;
  private renderScale = 1;
  private pendingVictory = false;
  private lastAnnouncedWave = -2;
  private readonly processedDeaths = new Set<string>();
  private readonly uncreditedDeaths = new Set<string>();
  private droneRootPool?: ObjectPool<TransformNode>;
  private projectilePool?: ObjectPool<TransformNode>;
  private shadows?: ShadowGenerator;

  constructor(engineScene: Scene, private readonly quality: QualityPreset, private readonly callbacks: BattleCallbacks) {
    this.scene = engineScene;
    this.setupLighting();
    this.setupStateListeners();
  }

  async load(): Promise<void> {
    this.state.transition("LOADING");
    this.assets = new AssetLibrary(this.scene);
    const loaded = await this.assets.loadAll((id, completed, total) => this.callbacks.onProgress(this.labelFor(id), completed / total));
    const errors = [...loaded.values()].filter((asset) => asset.fallback).map((asset) => `${this.labelFor(asset.id)}：${asset.error ?? "載入失敗"}`);
    this.setupBattleObjects();
    this.state.transition("READY");
    this.callbacks.onLoaded(errors);
  }

  start(): void {
    if (!this.player || !this.core || !this.weapon || !this.controls) return;
    if (this.state.state !== "READY" && this.state.state !== "WON" && this.state.state !== "LOST") return;
    if (this.state.state !== "READY") this.state.transition("READY");
    this.reset();
    this.state.transition("TUTORIAL");
    this.hud.show(); this.hud.setTip("左手移動 · 右半屏拖動轉向"); this.tutorialTimer = 0;
  }

  pause(): void {
    if (this.state.state === "TUTORIAL" || this.state.state === "PLAYING") this.state.transition("PAUSED");
  }

  resume(): void { if (this.state.state === "PAUSED") this.state.transition(this.state.resumeState); }

  update(delta: number): void {
    if (!this.player || !this.core || !this.weapon || !this.camera || !this.world || !this.controls) return;
    const active = this.state.state === "TUTORIAL" || this.state.state === "PLAYING";
    this.clock.paused = !active;
    if (!active) return;
    const step = Math.min(delta, 0.05); this.clock.update(step); this.controls.update();
    const lookDelta = this.controls.consumeLookDelta();
    this.camera.rotate(lookDelta);
    if (lookDelta.lengthSquared() > 0.01) this.hud.setAimHint(false);
    const forward = this.camera.getGroundForward();
    const movement = cameraRelativeMovement(this.controls.movement.x, this.controls.movement.y, { x: forward.x, z: forward.z });
    this.player.setMovement(movement.x, movement.z);
    const primaryTarget = this.primaryCameraTarget()?.root.getAbsolutePosition();
    this.player.update(step, this.camera.getFacingPoint()); this.core.update(step); this.weapon.update(step); this.camera.update(step, primaryTarget); this.world.update(step);
    if (this.controls.firing) this.fire();
    if (this.state.state === "TUTORIAL") this.updateTutorial(step);
    else for (const event of this.waves.update(step)) this.handleWaveEvent(event);
    this.updateDrones(step); this.updateProjectiles(step); this.resolveBattleOutcome(); this.updateHud(); this.debug?.update(step, this.renderScale);
  }

  setRenderScale(scale: number): void { this.renderScale = scale; }
  setCameraSetting(key: "shake" | "aimAssist", value: number): void {
    if (this.camera) this.camera.settings[key] = value;
    if (key === "aimAssist") this.weapon?.setAimAssistStrength(value);
    const settings = this.camera?.settings ?? { sensitivity: 1, shake: key === "shake" ? value : 0.65, aimAssist: key === "aimAssist" ? value : 0.7 };
    localStorage.setItem("ashenRail.camera", JSON.stringify(settings));
  }
  get droneCount(): number { return this.drones.filter((drone) => !drone.dead).length; }

  private setupBattleObjects(): void {
    if (!this.assets) return;
    const train = this.assets.get("train"); train.root.setEnabled(true); this.createDeckFixtures();
    const roofMaterial = new StandardMaterial("roof-collider-material", this.scene); roofMaterial.diffuseColor = new Color3(0.075, 0.085, 0.08); roofMaterial.specularColor = new Color3(0.34, 0.22, 0.13);
    const roof = MeshBuilder.CreateBox("roof-collider", { width: GAMEPLAY.trainRoof.width, height: 0.3, depth: GAMEPLAY.trainRoof.length }, this.scene); roof.position.set(0, 0.68, 0); roof.material = roofMaterial; roof.visibility = 0; roof.metadata = { blocksShots: true };
    for (const [name, x, z, width, depth] of [["left-rail", -3, 0, .25, 17.2], ["right-rail", 3, 0, .25, 17.2], ["front-wall", 0, 8.5, 6, .25], ["back-wall", 0, -8.5, 6, .25]] as [string, number, number, number, number][]) {
      const collider = MeshBuilder.CreateBox(name, { width, height: 1.3, depth }, this.scene); collider.position.set(x, 1.15, z); collider.visibility = 0; collider.metadata = { blocksShots: true };
    }
    const playerAsset = this.assets.get("player"); playerAsset.root.setEnabled(true);
    new AnimationResolver().resolve(playerAsset.animationGroups);
    const playerMarkerMaterial = new StandardMaterial("player-marker-material", this.scene); playerMarkerMaterial.emissiveColor = new Color3(0.18, 0.62, 0.82); playerMarkerMaterial.diffuseColor = new Color3(0.05, 0.18, 0.24); playerMarkerMaterial.alpha = 0.58; playerMarkerMaterial.disableLighting = true;
    const playerMarker = MeshBuilder.CreateTorus("player-position-marker", { diameter: 1.05, thickness: 0.035, tessellation: 24 }, this.scene); playerMarker.position.y = -0.11; playerMarker.material = playerMarkerMaterial; playerMarker.parent = playerAsset.root; playerMarker.isPickable = false;
    this.player = new PlayerController(playerAsset.root);
    this.core = new EnergyCore(this.scene);
    const weaponAsset = this.assets.get("weapon"); this.attachment = new WeaponAttachment().attach(playerAsset, weaponAsset);
    this.weapon = new WeaponSystem(this.scene, weaponAsset.root);
    this.camera = new MobileCombatCamera(this.scene, playerAsset.root);
    this.weapon.setAimAssistStrength(this.camera.settings.aimAssist);
    this.world = new WorldScrollSystem(this.scene);
    this.setupPools();
    this.controls = new TouchControls({ onFire: () => this.fire(), onDodge: () => { if (this.player?.dodge()) this.audio.click(); }, onPause: () => this.pause() });
    this.createPostProcessing(); this.setupShadows();
    this.debug = new DebugPanel(this.scene.getEngine(), this.scene, { player: playerAsset.root, weapon: weaponAsset.root, droneTemplate: this.assets.get("drone").root, cameraOffset: { x: 0.76, y: 2.68, z: -5.3 } }, () => this.droneCount);
  }

  private setupLighting(): void {
    this.scene.clearColor = new Color4(0.055, 0.06, 0.085, 1); this.scene.fogMode = Scene.FOGMODE_EXP2; this.scene.fogDensity = 0.007; this.scene.fogColor = new Color3(0.2, 0.135, 0.12);
    const ambient = new HemisphericLight("ash-ambient", new Vector3(0, 1, 0), this.scene); ambient.intensity = 0.78; ambient.diffuse = new Color3(0.68, 0.72, 0.86); ambient.groundColor = new Color3(0.075, 0.055, 0.07);
    const sun = new DirectionalLight("setting-sun", new Vector3(-0.5, -1, 0.35), this.scene); sun.position.set(10, 18, -12); sun.intensity = 2.35; sun.diffuse = new Color3(1, 0.48, 0.25);
  }

  private createDeckFixtures(): void {
    const armor = new StandardMaterial("train-armor", this.scene); armor.diffuseColor = new Color3(0.09, 0.105, 0.1); armor.specularColor = new Color3(0.38, 0.3, 0.22);
    const trim = new StandardMaterial("train-trim", this.scene); trim.diffuseColor = new Color3(0.24, 0.12, 0.065); trim.emissiveColor = new Color3(0.035, 0.012, 0.004);
    for (const x of [-3.03, 3.03]) {
      const edge = MeshBuilder.CreateBox(`deck-edge-${x}`, { width: 0.14, height: 0.18, depth: 17.2 }, this.scene); edge.position.set(x * 0.92, 0.88, 0); edge.material = armor;
      for (const z of [-6.35, -2.12, 2.12, 6.35]) {
        const rail = MeshBuilder.CreateBox(`roof-rail-${x}-${z}`, { width: 0.11, height: 0.24, depth: 3.35 }, this.scene); rail.position.set(x * 0.91, 1.14, z); rail.material = trim;
        for (const postZ of [z - 1.55, z + 1.55]) { const post = MeshBuilder.CreateBox(`rail-post-${x}-${postZ}`, { width: 0.16, height: 0.58, depth: 0.16 }, this.scene); post.position.set(x * 0.91, 1.13, postZ); post.material = armor; }
      }
    }
    for (const z of [-7.4, -3.7, 0, 3.7, 7.4]) { const marker = MeshBuilder.CreateBox(`deck-marker-${z}`, { width: 5.35, height: 0.025, depth: 0.07 }, this.scene); marker.position.set(0, 0.845, z); marker.material = trim; }
  }

  private setupShadows(): void {
    const sun = this.scene.getLightByName("setting-sun"); if (!(sun instanceof DirectionalLight) || !this.assets) return;
    this.shadows = new ShadowGenerator(this.quality.shadowSize, sun); this.shadows.useBlurExponentialShadowMap = true; this.shadows.blurKernel = 16;
    for (const id of ["player", "weapon"] as const) for (const mesh of this.assets.get(id).meshes) this.shadows.addShadowCaster(mesh);
    if (this.quality.shadowSize > 512) for (const mesh of this.core?.root.getChildMeshes(false) ?? []) this.shadows.addShadowCaster(mesh);
  }

  private createPostProcessing(): void {
    if (!this.camera || !this.quality.bloom) return;
    const pipeline = new DefaultRenderingPipeline("wasteland-pipeline", true, this.scene, [this.camera.camera]); pipeline.bloomEnabled = true; pipeline.bloomWeight = 0.18; pipeline.bloomThreshold = 0.84; pipeline.bloomKernel = 32; pipeline.imageProcessingEnabled = true; pipeline.imageProcessing.contrast = 1.18; pipeline.imageProcessing.exposure = 1.05;
  }

  private setupStateListeners(): void {
    this.state.onChange((state) => {
      if (state === "PAUSED") document.querySelector("#pause-screen")?.classList.remove("hidden");
      else document.querySelector("#pause-screen")?.classList.add("hidden");
    });
  }

  private updateTutorial(delta: number): void {
    this.tutorialTimer += delta;
    if (this.tutorialTimer > 2.7 && !this.tutorialSpawned) { const tutorialDrone = this.spawnDrone("standard"); if (tutorialDrone) { tutorialDrone.attackingCore = false; tutorialDrone.attackTimer = 6; } this.tutorialSpawned = true; this.hud.setTip("拖右半屏瞄準，再按開火"); }
    if (this.tutorialTimer > 7) this.hud.setTip("紅色攻擊前用閃避避開");
    if ((this.tutorialTimer >= GAMEPLAY.tutorialSeconds && this.droneCount === 0) || this.tutorialTimer > GAMEPLAY.tutorialSeconds + 7) {
      for (const drone of this.drones) if (!drone.dead) { this.uncreditedDeaths.add(drone.id); drone.damage(9999); }
      this.state.transition("PLAYING"); this.waves.start(); this.hud.setTip("", false);
    }
  }

  private spawnDrone(variant: DroneVariant): RaiderDrone | undefined {
    if (!this.assets || !this.droneRootPool || this.droneCount >= this.quality.maxDrones) return undefined;
    this.side *= -1; const root = this.droneRootPool.acquire(); const drone = new RaiderDrone(root, variant, this.side, this.scene); this.drones.push(drone);
    if (this.quality.shadowSize > 512) for (const mesh of root.getChildMeshes(false)) this.shadows?.addShadowCaster(mesh);
    return drone;
  }

  private updateDrones(delta: number): void {
    if (!this.player || !this.core) return;
    for (const drone of this.drones) {
      const attack = drone.update(delta, this.player.root.position, this.core.root.position);
      if (drone.consumeArmedSignal()) { this.audio.alert(); this.hud.showWaveBanner("核心威脅 · 爆破倒數", true); }
      if (attack) {
        if (drone.variant === "kamikaze") { const before = this.core.health; this.core.damage(GAMEPLAY.drone.contactDamage); if (this.core.health < before) this.hud.flashDamage("core"); this.audio.explosion(); this.camera?.shake(0.36, 0.3); }
        else this.spawnProjectile(attack.origin, attack.target);
      }
      if (drone.dead && !this.processedDeaths.has(drone.id)) {
        this.processedDeaths.add(drone.id); this.kills += drone.health === 0 && !this.uncreditedDeaths.has(drone.id) ? 1 : 0;
        if (this.state.state === "PLAYING") for (const event of this.waves.enemyDefeated()) this.handleWaveEvent(event);
      }
    }
    for (let index = this.drones.length - 1; index >= 0; index -= 1) if (this.drones[index]?.state === "Dead") { const drone = this.drones[index]; if (drone) { drone.releaseExtras(); this.droneRootPool?.release(drone.root); } this.drones.splice(index, 1); }
  }

  private spawnProjectile(origin: Vector3, target: "player" | "core"): void {
    const node = this.projectilePool?.acquire(); if (!node) return; node.position.copyFrom(origin);
    const destination = this.projectileTargetPosition(target); if (!destination) { this.projectilePool?.release(node); return; }
    const velocity = destination.subtract(origin).normalize().scale(GAMEPLAY.drone.projectileSpeed); node.lookAt(destination);
    this.projectiles.push({ node, velocity, age: 0, maxAge: 3.2, target });
  }

  private updateProjectiles(delta: number): void {
    if (!this.player || !this.core) return;
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const shot = this.projectiles[index]; if (!shot) continue; shot.age += delta;
      const travel = shot.velocity.scale(delta); const direction = travel.normalizeToNew();
      const coverHit = this.scene.pickWithRay(new Ray(shot.node.position, direction, travel.length()), (mesh) => Boolean(mesh.metadata?.blocksShots));
      if (coverHit?.hit) { this.releaseProjectile(index, shot); continue; }
      shot.node.position.addInPlace(travel);
      const destination = this.projectileTargetPosition(shot.target); const radius = shot.target === "player" ? 0.68 : 0.82;
      if (destination && Vector3.DistanceSquared(shot.node.position, destination) <= radius * radius) {
        if (shot.target === "player") { const before = this.player.health; this.player.damage(12); if (this.player.health < before) this.hud.flashDamage("player"); }
        else { const before = this.core.health; this.core.damage(9); if (this.core.health < before) { this.audio.alert(); this.hud.flashDamage("core"); } }
        this.camera?.shake(0.12, 0.16); this.releaseProjectile(index, shot);
      } else if (shot.age >= shot.maxAge) this.releaseProjectile(index, shot);
    }
  }

  private fire(): void {
    if (!this.weapon || !this.camera || (this.state.state !== "TUTORIAL" && this.state.state !== "PLAYING")) return;
    const origin = this.camera.camera.position.clone(); const forward = this.camera.camera.getTarget().subtract(origin).normalize(); const result = this.weapon.shoot(origin, forward, this.drones);
    if (!result.fired) return; this.audio.fire(); this.camera.kick(1); this.camera.shake(0.05, 0.08); this.hud.pulseHit(Boolean(result.hit)); if (result.hit) this.audio.hit(); if (result.killed) this.audio.explosion();
  }

  private handleWaveEvent(event: WaveEvent): void {
    if (event.type === "spawn") { const spawned = this.spawnDrone(event.variant); this.waves.confirmSpawn(event.variant, Boolean(spawned)); }
    else if (event.type === "intermission") { this.weapon?.refill(); this.hud.setTip(`下一波 ${event.seconds} 秒`, true); }
    else if (event.type === "won") this.pendingVictory = true;
  }

  private updateHud(): void {
    if (!this.player || !this.core || !this.weapon) return;
    this.hud.setHealth(this.player.health, this.player.maxHealth, this.core.health, this.core.maxHealth); this.hud.setAmmo(this.weapon.ammo, this.weapon.reloading, this.weapon.reloadProgress); this.hud.setDodgeCooldown(this.player.dodgeCooldown);
    this.hud.setWave(this.state.state === "TUTORIAL" ? "教學" : this.waves.currentLabel, this.state.state === "TUTORIAL" ? this.droneCount : this.waves.remaining);
    if (this.state.state === "PLAYING" && this.waves.waveIndex !== this.lastAnnouncedWave) { this.lastAnnouncedWave = this.waves.waveIndex; this.hud.showWaveBanner(this.waves.currentLabel); }
    if (this.waves.isIntermission) { const seconds = Math.max(1, Math.ceil(this.waves.intermissionRemaining)); this.hud.setObjective(`補給中 · ${seconds} 秒`); this.hud.setTip(`下一波 ${seconds} 秒`, true); }
    else { this.hud.setObjective("保護能源核心"); if (this.state.state === "PLAYING") this.hud.setTip("", false); }
    const threat = this.priorityThreat();
    if (!threat || !this.camera) this.hud.setThreat(0, false);
    else { const toThreat = threat.root.getAbsolutePosition().subtract(this.player.root.position); const forward = this.camera.getGroundForward(); const right = new Vector3(forward.z, 0, -forward.x); const angle = Math.atan2(Vector3.Dot(toThreat, right), Vector3.Dot(toThreat, forward)); const onScreen = Math.cos(angle) > 0.45 && Math.abs(angle) < 0.68; this.hud.setThreat(angle, !onScreen); }
  }

  private finish(won: boolean, title: string): void {
    if (this.state.state !== "PLAYING" && this.state.state !== "TUTORIAL") return;
    this.state.transition(won ? "WON" : "LOST");
    if (won) this.audio.victory(); else this.audio.defeat();
    this.hud.hide(); this.callbacks.onResult(won, { elapsed: this.clock.elapsed, kills: this.kills, coreHealth: this.core?.health ?? 0 });
    const titleNode = document.querySelector("#result-title"); if (titleNode) titleNode.textContent = title;
  }

  private reset(): void {
    for (const drone of this.drones) { drone.releaseExtras(); this.droneRootPool?.release(drone.root); } this.drones.length = 0; this.projectilePool?.releaseAll(); this.projectiles.length = 0;
    this.processedDeaths.clear(); this.uncreditedDeaths.clear(); this.waves.reset(); this.clock.reset(); this.kills = 0; this.side = -1; this.pendingVictory = false; this.lastAnnouncedWave = -2; this.tutorialSpawned = false; this.tutorialTimer = 0;
    this.player?.reset(); this.core?.reset(); this.weapon?.reset(); this.camera?.reset(); this.world?.reset(); this.controls?.reset(); this.hud.setThreat(0, false); this.hud.setAimHint(true);
  }

  private primaryCameraTarget(): RaiderDrone | undefined {
    if (!this.player || !this.camera) return undefined; const forward = this.camera.getGroundForward();
    return this.drones.filter((drone) => !drone.dead && Vector3.Dot(drone.root.position.subtract(this.player?.root.position ?? Vector3.Zero()).normalize(), forward) > 0.15).sort((a, b) => Vector3.DistanceSquared(a.root.position, this.player?.root.position ?? Vector3.Zero()) - Vector3.DistanceSquared(b.root.position, this.player?.root.position ?? Vector3.Zero()))[0];
  }
  private priorityThreat(): RaiderDrone | undefined { if (!this.player) return undefined; return this.drones.filter((drone) => !drone.dead).sort((a, b) => Number(b.attackingCore) - Number(a.attackingCore) || Vector3.DistanceSquared(a.root.position, this.player?.root.position ?? Vector3.Zero()) - Vector3.DistanceSquared(b.root.position, this.player?.root.position ?? Vector3.Zero()))[0]; }
  private projectileTargetPosition(target: "player" | "core"): Vector3 | undefined { if (target === "player") return this.player?.root.position.add(new Vector3(0, 0.72, 0)); return this.core?.root.position.add(new Vector3(0, 0.72, 0)); }
  private releaseProjectile(index: number, shot: Projectile): void { this.projectilePool?.release(shot.node); this.projectiles.splice(index, 1); }
  private resolveBattleOutcome(): void {
    if (!this.player || !this.core) return;
    const outcome = resolveOutcome(this.player.health, this.core.health, this.pendingVictory && this.projectiles.length === 0 && this.drones.length === 0);
    if (outcome === "LOST_PLAYER") this.finish(false, "守衛陣亡"); else if (outcome === "LOST_CORE") this.finish(false, "列車核心被摧毀"); else if (outcome === "WON") this.finish(true, "航線安全");
  }
  private labelFor(id: keyof typeof MODEL_ASSETS): string { return ({ train: "裝甲列車", player: "荒原槍手", weapon: "荒原手炮", drone: "掠奪無人機" })[id]; }

  private setupPools(): void {
    if (!this.assets) return;
    this.droneRootPool = new ObjectPool(
      () => this.assets?.clone("drone", `drone-pooled-${performance.now()}`) ?? new TransformNode("drone-pool-fallback", this.scene),
      (root) => { root.scaling.setAll(MODEL_ASSETS.drone.scale); root.rotationQuaternion = null; root.rotation.set(0, 0, 0); root.setEnabled(true); },
      (root) => root.setEnabled(false)
    );
    const material = new StandardMaterial("pooled-bolt-material", this.scene); material.emissiveColor = new Color3(1, 0.08, 0.02); material.disableLighting = true;
    this.projectilePool = new ObjectPool<TransformNode>(
      () => { const root = new TransformNode(`pooled-bolt-${performance.now()}`, this.scene); const head = MeshBuilder.CreateSphere(`${root.name}-head`, { diameter: 0.25, segments: 6 }, this.scene); head.material = material; head.parent = root; const trail = MeshBuilder.CreateCylinder(`${root.name}-trail`, { height: 0.8, diameter: 0.075, tessellation: 6 }, this.scene); trail.material = material; trail.parent = root; trail.rotation.x = Math.PI / 2; trail.position.z = -0.36; root.setEnabled(false); return root; },
      (node) => { node.rotationQuaternion = null; node.rotation.set(0, 0, 0); node.setEnabled(true); },
      (node) => node.setEnabled(false)
    );
  }
}
