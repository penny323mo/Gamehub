import { Color3, Color4, DefaultRenderingPipeline, DirectionalLight, HemisphericLight, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
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
import { RaiderDrone } from "../entities/RaiderDrone";
import { WorldScrollSystem } from "../environment/WorldScrollSystem";
import { GameStateMachine } from "../state/GameStateMachine";
import { PausableClock } from "../systems/PausableClock";
import { ObjectPool } from "../systems/ObjectPool";
import { WaveManager, type DroneVariant, type WaveEvent } from "../systems/WaveManager";

interface Projectile { node: TransformNode; from: Vector3; to: Vector3; progress: number; target: "player" | "core"; }
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
  private readonly processedDeaths = new Set<string>();
  private droneRootPool?: ObjectPool<TransformNode>;
  private projectilePool?: ObjectPool<TransformNode>;

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
    this.hud.show(); this.hud.setTip("左手拖動搖桿移動"); this.tutorialTimer = 0;
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
    this.player.setMovement(this.controls.movement.x, this.controls.movement.y);
    const primaryTarget = this.nearestDrone()?.root.getAbsolutePosition();
    this.player.update(step, primaryTarget); this.core.update(step); this.weapon.update(step); this.camera.update(step, primaryTarget); this.world.update(step);
    if (this.controls.firing) this.fire();
    if (this.state.state === "TUTORIAL") this.updateTutorial(step);
    else for (const event of this.waves.update(step)) this.handleWaveEvent(event);
    this.updateDrones(step); this.updateProjectiles(step); this.updateHud(); this.debug?.update(step, this.renderScale);
  }

  setRenderScale(scale: number): void { this.renderScale = scale; }
  setCameraSetting(key: "shake" | "aimAssist", value: number): void {
    if (this.camera) this.camera.settings[key] = value;
    const settings = this.camera?.settings ?? { sensitivity: 1, shake: key === "shake" ? value : 0.65, aimAssist: key === "aimAssist" ? value : 0.7 };
    localStorage.setItem("ashenRail.camera", JSON.stringify(settings));
  }
  get droneCount(): number { return this.drones.filter((drone) => !drone.dead).length; }

  private setupBattleObjects(): void {
    if (!this.assets) return;
    const train = this.assets.get("train"); train.root.setEnabled(true);
    const roofMaterial = new StandardMaterial("roof-collider-material", this.scene); roofMaterial.diffuseColor = new Color3(0.075, 0.085, 0.08); roofMaterial.specularColor = new Color3(0.34, 0.22, 0.13);
    const roof = MeshBuilder.CreateBox("roof-collider", { width: GAMEPLAY.trainRoof.width, height: 0.3, depth: GAMEPLAY.trainRoof.length }, this.scene); roof.position.set(0, 0.68, 0); roof.material = roofMaterial; roof.metadata = { blocksShots: true };
    for (const [name, x, z, width, depth] of [["left-rail", -3, 0, .25, 17.2], ["right-rail", 3, 0, .25, 17.2], ["front-wall", 0, 8.5, 6, .25], ["back-wall", 0, -8.5, 6, .25]] as [string, number, number, number, number][]) {
      const collider = MeshBuilder.CreateBox(name, { width, height: 1.3, depth }, this.scene); collider.position.set(x, 1.15, z); collider.visibility = 0; collider.metadata = { blocksShots: true };
    }
    const playerAsset = this.assets.get("player"); playerAsset.root.setEnabled(true);
    new AnimationResolver().resolve(playerAsset.animationGroups);
    this.player = new PlayerController(playerAsset.root);
    this.core = new EnergyCore(this.scene);
    const weaponAsset = this.assets.get("weapon"); this.attachment = new WeaponAttachment().attach(playerAsset, weaponAsset);
    this.weapon = new WeaponSystem(this.scene, weaponAsset.root);
    this.camera = new MobileCombatCamera(this.scene, playerAsset.root);
    this.world = new WorldScrollSystem(this.scene);
    this.setupPools();
    this.controls = new TouchControls({ onFire: () => this.fire(), onDodge: () => { if (this.player?.dodge()) this.audio.click(); }, onPause: () => this.pause() });
    this.createPostProcessing(); this.setupShadows();
    this.debug = new DebugPanel(this.scene.getEngine(), this.scene, { player: playerAsset.root, weapon: weaponAsset.root, droneTemplate: this.assets.get("drone").root, cameraOffset: { x: 0, y: 3.15, z: -6.25 } }, () => this.droneCount);
  }

  private setupLighting(): void {
    this.scene.clearColor = new Color4(0.22, 0.09, 0.045, 1); this.scene.fogMode = Scene.FOGMODE_EXP2; this.scene.fogDensity = 0.008; this.scene.fogColor = new Color3(0.38, 0.18, 0.09);
    const ambient = new HemisphericLight("ash-ambient", new Vector3(0, 1, 0), this.scene); ambient.intensity = 0.85; ambient.diffuse = new Color3(1, 0.64, 0.38); ambient.groundColor = new Color3(0.09, 0.05, 0.04);
    const sun = new DirectionalLight("setting-sun", new Vector3(-0.5, -1, 0.35), this.scene); sun.position.set(10, 18, -12); sun.intensity = 2.2; sun.diffuse = new Color3(1, 0.48, 0.25);
  }

  private setupShadows(): void {
    const sun = this.scene.getLightByName("setting-sun"); if (!(sun instanceof DirectionalLight) || !this.assets) return;
    const shadows = new ShadowGenerator(this.quality.shadowSize, sun); shadows.useBlurExponentialShadowMap = true; shadows.blurKernel = 16;
    for (const id of ["player", "weapon"] as const) for (const mesh of this.assets.get(id).meshes) shadows.addShadowCaster(mesh);
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
    if (this.tutorialTimer > 2.7 && !this.tutorialSpawned) { const tutorialDrone = this.spawnDrone("standard"); if (tutorialDrone) { tutorialDrone.attackingCore = false; tutorialDrone.attackTimer = 6; } this.tutorialSpawned = true; this.hud.setTip("右邊開火鍵射擊無人機"); }
    if (this.tutorialTimer > 7) this.hud.setTip("紅色攻擊前用閃避避開");
    if ((this.tutorialTimer >= GAMEPLAY.tutorialSeconds && this.droneCount === 0) || this.tutorialTimer > GAMEPLAY.tutorialSeconds + 7) {
      for (const drone of this.drones) if (!drone.dead) drone.damage(9999);
      this.state.transition("PLAYING"); this.waves.start(); this.hud.setTip("保護能源核心", true);
    }
  }

  private spawnDrone(variant: DroneVariant): RaiderDrone | undefined {
    if (!this.assets || !this.droneRootPool || this.droneCount >= this.quality.maxDrones) return undefined;
    this.side *= -1; const root = this.droneRootPool.acquire(); const drone = new RaiderDrone(root, variant, this.side, this.scene); this.drones.push(drone); return drone;
  }

  private updateDrones(delta: number): void {
    if (!this.player || !this.core) return;
    for (const drone of this.drones) {
      const attack = drone.update(delta, this.player.root.position, this.core.root.position);
      if (attack) {
        if (drone.variant === "kamikaze") { this.core.damage(GAMEPLAY.drone.contactDamage); this.audio.explosion(); this.camera?.shake(0.36, 0.3); }
        else this.spawnProjectile(attack.origin, attack.target);
      }
      if (drone.dead && !this.processedDeaths.has(drone.id)) {
        this.processedDeaths.add(drone.id); this.kills += drone.health === 0 ? 1 : 0;
        if (this.state.state === "PLAYING") for (const event of this.waves.enemyDefeated()) this.handleWaveEvent(event);
      }
    }
    for (let index = this.drones.length - 1; index >= 0; index -= 1) if (this.drones[index]?.state === "Dead") { const drone = this.drones[index]; if (drone) { drone.releaseExtras(); this.droneRootPool?.release(drone.root); } this.drones.splice(index, 1); }
    if (this.player.health <= 0) this.finish(false, "守衛陣亡"); else if (this.core.health <= 0) this.finish(false, "列車核心被摧毀");
  }

  private spawnProjectile(origin: Vector3, target: "player" | "core"): void {
    const node = this.projectilePool?.acquire(); if (!node) return; node.position.copyFrom(origin);
    const destination = target === "player" ? this.player?.root.position.clone() : this.core?.root.position.add(new Vector3(0, 0.8, 0)); if (!destination) return;
    this.projectiles.push({ node, from: origin.clone(), to: destination, progress: 0, target });
  }

  private updateProjectiles(delta: number): void {
    if (!this.player || !this.core) return;
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const shot = this.projectiles[index]; if (!shot) continue; shot.progress += delta * 1.75; shot.node.position = Vector3.Lerp(shot.from, shot.to, Math.min(1, shot.progress));
      if (shot.progress >= 1) {
        if (shot.target === "player") this.player.damage(12); else { this.core.damage(11); this.audio.alert(); }
        this.camera?.shake(0.12, 0.16); this.projectilePool?.release(shot.node); this.projectiles.splice(index, 1);
      }
    }
  }

  private fire(): void {
    if (!this.weapon || !this.camera || (this.state.state !== "TUTORIAL" && this.state.state !== "PLAYING")) return;
    const origin = this.camera.camera.position.clone(); const forward = this.camera.camera.getTarget().subtract(origin).normalize(); const result = this.weapon.shoot(origin, forward, this.drones);
    if (!result.fired) return; this.audio.fire(); this.camera.kick(1); this.camera.shake(0.05, 0.08); this.hud.pulseHit(Boolean(result.hit)); if (result.hit) this.audio.hit(); if (result.killed) this.audio.explosion();
  }

  private handleWaveEvent(event: WaveEvent): void {
    if (event.type === "spawn") this.spawnDrone(event.variant);
    else if (event.type === "intermission") { this.weapon?.refill(); this.hud.setTip(`下一波 ${event.seconds} 秒`, true); }
    else if (event.type === "won") this.finish(true, "航線安全");
  }

  private updateHud(): void {
    if (!this.player || !this.core || !this.weapon) return;
    this.hud.setHealth(this.player.health, this.player.maxHealth, this.core.health, this.core.maxHealth); this.hud.setAmmo(this.weapon.ammo, this.weapon.reloading, this.weapon.reloadProgress); this.hud.setDodgeCooldown(this.player.dodgeCooldown);
    this.hud.setWave(this.state.state === "TUTORIAL" ? "教學" : this.waves.currentLabel, this.state.state === "TUTORIAL" ? this.droneCount : this.waves.remaining);
    if (this.waves.isIntermission) this.hud.setObjective("補給中 · 準備下一波"); else this.hud.setObjective("保護能源核心");
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
    this.processedDeaths.clear(); this.waves.reset(); this.clock.reset(); this.kills = 0; this.tutorialSpawned = false; this.tutorialTimer = 0; this.player?.reset(); this.core?.reset(); this.weapon?.reset(); this.controls?.reset();
  }

  private nearestDrone(): RaiderDrone | undefined { if (!this.player) return undefined; return this.drones.filter((drone) => !drone.dead).sort((a, b) => Vector3.DistanceSquared(a.root.position, this.player?.root.position ?? Vector3.Zero()) - Vector3.DistanceSquared(b.root.position, this.player?.root.position ?? Vector3.Zero()))[0]; }
  private labelFor(id: keyof typeof MODEL_ASSETS): string { return ({ train: "裝甲列車", player: "荒原槍手", weapon: "荒原手炮", drone: "掠奪無人機" })[id]; }

  private setupPools(): void {
    if (!this.assets) return;
    this.droneRootPool = new ObjectPool(
      () => this.assets?.clone("drone", `drone-pooled-${performance.now()}`) ?? new TransformNode("drone-pool-fallback", this.scene),
      (root) => { root.scaling.setAll(MODEL_ASSETS.drone.scale); root.rotation.set(0, 0, 0); root.setEnabled(true); },
      (root) => root.setEnabled(false)
    );
    const material = new StandardMaterial("pooled-bolt-material", this.scene); material.emissiveColor = new Color3(1, 0.08, 0.02); material.disableLighting = true;
    this.projectilePool = new ObjectPool<TransformNode>(
      () => { const bolt = MeshBuilder.CreateSphere(`pooled-bolt-${performance.now()}`, { diameter: 0.18, segments: 6 }, this.scene); bolt.material = material; bolt.setEnabled(false); return bolt; },
      (node) => node.setEnabled(true),
      (node) => node.setEnabled(false)
    );
  }
}
