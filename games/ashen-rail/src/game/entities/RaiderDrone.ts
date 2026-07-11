import { Color3, MeshBuilder, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { GAMEPLAY } from "../../config/gameplay";
import type { DroneVariant } from "../systems/WaveManager";
import { KAMIKAZE_ARMING_DISTANCE, shouldKamikazeDetonate } from "./kamikaze";

const sharedMaterials = new WeakMap<Scene, Map<string, StandardMaterial>>();
function emissiveMaterial(scene: Scene, name: string, color: Color3): StandardMaterial {
  let materials = sharedMaterials.get(scene); if (!materials) { materials = new Map(); sharedMaterials.set(scene, materials); }
  const existing = materials.get(name); if (existing) return existing;
  const material = new StandardMaterial(name, scene); material.emissiveColor = color; material.diffuseColor = color.scale(0.4); material.disableLighting = true; materials.set(name, material); return material;
}

export type DroneState = "Spawning" | "Approaching" | "Holding" | "Strafing" | "AttackingPlayer" | "AttackingCore" | "Stunned" | "Dying" | "Dead";
export interface DroneAttack { target: "player" | "core"; origin: Vector3; }

export class RaiderDrone {
  readonly id = crypto.randomUUID();
  state: DroneState = "Spawning";
  health: number;
  readonly maxHealth: number;
  dead = false;
  attackTimer = 1.4;
  age = 0;
  strafeSign: number;
  attackingCore: boolean;
  private dyingTimer = 0.45;
  private flash = 0;
  private readonly aura?: TransformNode;
  private readonly warningRing: TransformNode;
  private readonly coreGlow: TransformNode;
  private kamikazeArmed = false;
  private kamikazeCountdown = 1.05;
  private armedSignal = false;

  constructor(readonly root: TransformNode, readonly variant: DroneVariant, side: number, scene: Scene) {
    this.maxHealth = variant === "elite" ? GAMEPLAY.drone.eliteHealth : GAMEPLAY.drone.health;
    this.health = this.maxHealth;
    this.strafeSign = side;
    this.attackingCore = variant === "kamikaze" || Math.random() < 0.42;
    root.position.set(side * 10, 3.8 + Math.random() * 1.8, 8 + Math.random() * 6);
    root.scaling.scaleInPlace(variant === "elite" ? 1.18 : variant === "kamikaze" ? 1.1 : 1);
    const coreGlow = MeshBuilder.CreateSphere(`hostile-core-${this.id}`, { diameter: 0.28, segments: 8 }, scene); coreGlow.material = emissiveMaterial(scene, "hostile-core-material", new Color3(1, 0.03, 0.01)); coreGlow.parent = root; this.coreGlow = coreGlow;
    const warningRing = MeshBuilder.CreateTorus(`attack-warning-${this.id}`, { diameter: 1.85, thickness: 0.045, tessellation: 20 }, scene); warningRing.material = emissiveMaterial(scene, "attack-warning-material", new Color3(1, 0.32, 0.03)); warningRing.parent = root; warningRing.rotation.x = Math.PI / 2; warningRing.setEnabled(false); this.warningRing = warningRing;
    if (variant === "kamikaze") {
      const aura = MeshBuilder.CreateTorus(`danger-aura-${this.id}`, { diameter: 2.2, thickness: 0.08, tessellation: 24 }, scene);
      aura.material = emissiveMaterial(scene, "danger-aura-material", new Color3(1, 0.08, 0)); aura.parent = root; aura.rotation.x = Math.PI / 2; this.aura = aura;
    }
  }

  damage(amount: number): boolean {
    if (this.dead) return false;
    this.health = Math.max(0, this.health - amount); this.flash = 0.12;
    if (this.health === 0) { this.dead = true; this.state = "Dying"; return true; }
    this.state = "Stunned"; return false;
  }

  update(delta: number, player: Vector3, core: Vector3): DroneAttack | null {
    this.age += delta; this.attackTimer -= delta; this.flash = Math.max(0, this.flash - delta);
    if (this.state === "Dying") {
      this.dyingTimer -= delta; this.root.scaling.scaleInPlace(Math.max(0.1, 1 - delta * 4)); this.root.rotation.z += delta * 10;
      if (this.dyingTimer <= 0) { this.state = "Dead"; this.root.setEnabled(false); }
      return null;
    }
    if (this.variant === "kamikaze") {
      this.state = "AttackingCore";
      const direction = core.subtract(this.root.position);
      const distance = direction.length();
      if (distance <= KAMIKAZE_ARMING_DISTANCE) {
        if (!this.kamikazeArmed) { this.kamikazeArmed = true; this.armedSignal = true; }
        this.state = "Holding"; this.kamikazeCountdown -= delta;
        const pulse = 1 + Math.sin(this.age * 22) * 0.18; this.aura?.scaling.setAll(pulse); this.warningRing.setEnabled(true); this.warningRing.scaling.setAll(pulse);
        if (shouldKamikazeDetonate(distance, this.kamikazeCountdown)) { this.dead = true; this.state = "Dying"; return { target: "core", origin: this.root.position.clone() }; }
        return null;
      }
      this.root.position.addInPlace(direction.normalize().scale(GAMEPLAY.drone.speed * 1.35 * delta));
      this.root.lookAt(core);
      return null;
    }
    const target = this.attackingCore ? core : player;
    const desired = new Vector3(this.strafeSign * (4.8 + Math.sin(this.age) * 1.2), 3.4 + Math.sin(this.age * 1.8) * 0.5, 3 + Math.cos(this.age * 0.7) * 4.5);
    const distance = Vector3.Distance(this.root.position, desired);
    this.state = distance > 1 ? "Approaching" : "Strafing";
    this.root.position.addInPlace(desired.subtract(this.root.position).scale(Math.min(1, delta * (distance > 1 ? 1.25 : 0.6))));
    this.root.lookAt(target);
    const telegraphing = distance < 3 && this.attackTimer < 0.65; this.warningRing.setEnabled(telegraphing || this.flash > 0); if (telegraphing) this.warningRing.scaling.setAll(1 + Math.sin(this.age * 16) * 0.12);
    if (this.attackTimer <= 0 && distance < 3) { this.warningRing.setEnabled(false); this.attackTimer = GAMEPLAY.drone.attackInterval + Math.random() * 0.8; this.state = this.attackingCore ? "AttackingCore" : "AttackingPlayer"; return { target: this.attackingCore ? "core" : "player", origin: this.root.position.clone() }; }
    return null;
  }

  consumeArmedSignal(): boolean { const armed = this.armedSignal; this.armedSignal = false; return armed; }
  releaseExtras(): void { this.aura?.dispose(); this.warningRing.dispose(); this.coreGlow.dispose(); }
}
