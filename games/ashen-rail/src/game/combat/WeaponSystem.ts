import { Color3, MeshBuilder, Ray, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { GAMEPLAY } from "../../config/gameplay";
import type { RaiderDrone } from "../entities/RaiderDrone";
import { selectAimTarget } from "./aimAssist";

export interface ShotResult { fired: boolean; hit?: RaiderDrone; killed?: boolean; }

export class WeaponSystem {
  ammo = GAMEPLAY.weapon.magazine;
  readonly magazine = GAMEPLAY.weapon.magazine;
  reloading = false;
  private cooldown = 0;
  private reloadTimer = 0;
  private recoil = 0;
  private aimAssistStrength = 0.7;
  private readonly flash: TransformNode;

  constructor(private readonly scene: Scene, muzzleParent: TransformNode) {
    const material = new StandardMaterial("muzzle-flash-material", scene);
    material.emissiveColor = new Color3(1, 0.45, 0.05); material.disableLighting = true;
    const flash = MeshBuilder.CreatePolyhedron("muzzle-flash", { type: 0, size: 0.18 }, scene);
    flash.material = material; flash.parent = muzzleParent; flash.position.set(0, 0, 1.3); flash.setEnabled(false); this.flash = flash;
  }

  get reloadProgress(): number { return this.reloading ? 1 - this.reloadTimer / GAMEPLAY.weapon.reloadSeconds : 0; }
  get recoilAmount(): number { return this.recoil; }

  update(delta: number): void {
    this.cooldown = Math.max(0, this.cooldown - delta); this.recoil = Math.max(0, this.recoil - delta * 5);
    if (this.reloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) { this.reloading = false; this.ammo = this.magazine; }
    }
  }

  shoot(origin: Vector3, forward: Vector3, drones: readonly RaiderDrone[]): ShotResult {
    if (this.cooldown > 0 || this.reloading) return { fired: false };
    if (this.ammo <= 0) { this.beginReload(); return { fired: false }; }
    this.ammo -= 1; this.cooldown = 1 / GAMEPLAY.weapon.shotsPerSecond; this.recoil = 1;
    this.flash.setEnabled(true); window.setTimeout(() => this.flash.setEnabled(false), 55);
    const candidates = drones.map((drone) => {
      const toDrone = drone.root.getAbsolutePosition().subtract(origin);
      return { id: drone.id, dead: drone.dead, attackingCore: drone.attackingCore, screenAngle: Math.acos(Math.max(-1, Math.min(1, Vector3.Dot(forward.normalizeToNew(), toDrone.normalizeToNew())))), distance: toDrone.length() };
    });
    const selected = this.aimAssistStrength > 0 ? selectAimTarget(candidates, GAMEPLAY.weapon.aimAssistAngle * this.aimAssistStrength) : null;
    const target = selected ? drones.find((drone) => drone.id === selected.id) : undefined;
    const direction = target ? target.root.getAbsolutePosition().subtract(origin).normalize() : forward.normalizeToNew();
    const ray = new Ray(origin, direction, GAMEPLAY.weapon.range);
    const obstruction = this.scene.pickWithRay(ray, (mesh) => mesh.metadata?.blocksShots === true);
    if (target) {
      const targetDistance = Vector3.Distance(origin, target.root.getAbsolutePosition());
      if (!obstruction?.hit || (obstruction.distance ?? Infinity) > targetDistance) {
        const killed = target.damage(GAMEPLAY.weapon.damage);
        this.spawnImpact(target.root.getAbsolutePosition(), killed);
        if (this.ammo === 0) this.beginReload();
        return { fired: true, hit: target, killed };
      }
    }
    if (this.ammo === 0) this.beginReload();
    return { fired: true };
  }

  refill(): void { this.ammo = this.magazine; this.reloading = false; this.reloadTimer = 0; }
  setAimAssistStrength(value: number): void { this.aimAssistStrength = Math.max(0, Math.min(1, value)); }
  reset(): void { this.cooldown = 0; this.recoil = 0; this.flash.setEnabled(false); this.refill(); }

  private beginReload(): void { this.reloading = true; this.reloadTimer = GAMEPLAY.weapon.reloadSeconds; }
  private spawnImpact(position: Vector3, killed: boolean): void {
    const material = new StandardMaterial(`impact-mat-${performance.now()}`, this.scene);
    material.emissiveColor = killed ? new Color3(1, 0.16, 0.02) : new Color3(1, 0.75, 0.2); material.disableLighting = true;
    const impact = MeshBuilder.CreateSphere(`impact-${performance.now()}`, { diameter: killed ? 0.65 : 0.2, segments: 6 }, this.scene);
    impact.position.copyFrom(position); impact.material = material;
    window.setTimeout(() => { impact.dispose(); material.dispose(); }, killed ? 260 : 90);
  }
}
