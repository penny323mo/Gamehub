import { Color3, MeshBuilder, Ray, Scene, StandardMaterial, TransformNode, Vector3, type PickingInfo } from "@babylonjs/core";
import { GAMEPLAY } from "../../config/gameplay";
import type { RaiderDrone } from "../entities/RaiderDrone";
import { selectAimTarget, selectDirectRayTarget } from "./aimAssist";

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
  private readonly tracerMissMaterial: StandardMaterial;
  private readonly tracerHitMaterial: StandardMaterial;
  private readonly tracerKillMaterial: StandardMaterial;

  constructor(private readonly scene: Scene, muzzleParent: TransformNode) {
    const material = new StandardMaterial("muzzle-flash-material", scene);
    material.emissiveColor = new Color3(1, 0.45, 0.05); material.disableLighting = true;
    const flash = MeshBuilder.CreatePolyhedron("muzzle-flash", { type: 0, size: 0.18 }, scene);
    flash.material = material; flash.parent = muzzleParent; flash.position.set(0, 0, 1.3); flash.setEnabled(false); this.flash = flash;
    this.tracerMissMaterial = this.makeEffectMaterial("player-tracer-miss", new Color3(1, 0.48, 0.08));
    this.tracerHitMaterial = this.makeEffectMaterial("player-tracer-hit", new Color3(0.12, 0.8, 1));
    this.tracerKillMaterial = this.makeEffectMaterial("player-tracer-kill", new Color3(1, 0.86, 0.2));
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
    const solution = this.resolveAim(origin, forward, drones);
    const target = solution.target;
    const targetDistance = target ? Vector3.Distance(origin, target.root.getAbsolutePosition()) : Infinity;
    const clearShot = Boolean(target) && (!solution.obstruction?.hit || (solution.obstruction.distance ?? Infinity) > targetDistance);
    let tracerEnd = solution.obstruction?.pickedPoint?.clone() ?? origin.add(solution.direction.scale(Math.min(GAMEPLAY.weapon.range, 28)));
    let result: ShotResult = { fired: true };
    if (target && clearShot) {
      tracerEnd = target.root.getAbsolutePosition().clone(); const killed = target.damage(GAMEPLAY.weapon.damage); this.spawnImpact(tracerEnd, killed); result = { fired: true, hit: target, killed };
    }
    this.spawnTracer(this.flash.getAbsolutePosition(), tracerEnd, result.killed ? "kill" : result.hit ? "hit" : "miss");
    if (this.ammo === 0) this.beginReload();
    return result;
  }

  previewTarget(origin: Vector3, forward: Vector3, drones: readonly RaiderDrone[]): RaiderDrone | undefined {
    const solution = this.resolveAim(origin, forward, drones); if (!solution.target) return undefined;
    const distance = Vector3.Distance(origin, solution.target.root.getAbsolutePosition()); return !solution.obstruction?.hit || (solution.obstruction.distance ?? Infinity) > distance ? solution.target : undefined;
  }

  private resolveAim(origin: Vector3, forward: Vector3, drones: readonly RaiderDrone[]): { target?: RaiderDrone; direction: Vector3; obstruction?: PickingInfo } {
    const normal = forward.normalizeToNew();
    const candidates = drones.map((drone) => {
      const toDrone = drone.root.getAbsolutePosition().subtract(origin);
      return { id: drone.id, dead: drone.dead, attackingCore: drone.attackingCore, screenAngle: Math.acos(Math.max(-1, Math.min(1, Vector3.Dot(normal, toDrone.normalizeToNew())))), distance: toDrone.length() };
    });
    const direct = selectDirectRayTarget(drones.map((drone) => { const toDrone = drone.root.getAbsolutePosition().subtract(origin); const forwardDistance = Vector3.Dot(toDrone, normal); const perpendicularDistance = Math.sqrt(Math.max(0, toDrone.lengthSquared() - forwardDistance * forwardDistance)); return { id: drone.id, dead: drone.dead, forwardDistance, perpendicularDistance, radius: drone.variant === "elite" ? 1.05 : 0.88 }; }));
    const selected = this.aimAssistStrength > 0 ? selectAimTarget(candidates, GAMEPLAY.weapon.aimAssistAngle * this.aimAssistStrength) : null;
    const targetId = direct?.id ?? selected?.id; const target = targetId ? drones.find((drone) => drone.id === targetId) : undefined;
    const direction = target ? target.root.getAbsolutePosition().subtract(origin).normalize() : normal;
    const ray = new Ray(origin, direction, GAMEPLAY.weapon.range);
    const obstruction = this.scene.pickWithRay(ray, (mesh) => mesh.metadata?.blocksShots === true);
    return { target, direction, obstruction: obstruction ?? undefined };
  }

  refill(): void { this.ammo = this.magazine; this.reloading = false; this.reloadTimer = 0; }
  setAimAssistStrength(value: number): void { this.aimAssistStrength = Math.max(0, Math.min(1, value)); }
  reset(): void { this.cooldown = 0; this.recoil = 0; this.flash.setEnabled(false); this.refill(); }

  private beginReload(): void { this.reloading = true; this.reloadTimer = GAMEPLAY.weapon.reloadSeconds; }
  private makeEffectMaterial(name: string, color: Color3): StandardMaterial { const material = new StandardMaterial(name, this.scene); material.emissiveColor = color; material.diffuseColor = color.scale(0.22); material.disableLighting = true; return material; }
  private spawnTracer(start: Vector3, end: Vector3, result: "miss" | "hit" | "kill"): void {
    if (Vector3.DistanceSquared(start, end) < 0.01) return;
    const tracer = MeshBuilder.CreateTube(`player-tracer-${performance.now()}`, { path: [start, end], radius: result === "miss" ? 0.018 : 0.028, tessellation: 5 }, this.scene);
    tracer.material = result === "kill" ? this.tracerKillMaterial : result === "hit" ? this.tracerHitMaterial : this.tracerMissMaterial; tracer.isPickable = false;
    window.setTimeout(() => tracer.dispose(), result === "miss" ? 85 : 130);
  }
  private spawnImpact(position: Vector3, killed: boolean): void {
    const impact = MeshBuilder.CreateSphere(`impact-${performance.now()}`, { diameter: killed ? 0.65 : 0.2, segments: 6 }, this.scene);
    impact.position.copyFrom(position); impact.material = killed ? this.tracerKillMaterial : this.tracerHitMaterial;
    window.setTimeout(() => impact.dispose(), killed ? 260 : 110);
  }
}
