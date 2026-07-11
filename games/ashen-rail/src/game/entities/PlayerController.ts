import { Scalar, TransformNode, Vector2, Vector3, type Skeleton } from "@babylonjs/core";
import { PLAYER_BOUNDS } from "../../config/assets";
import { GAMEPLAY } from "../../config/gameplay";
import { ProceduralPlayerAnimator } from "../animation/ProceduralPlayerAnimator";

export class PlayerController {
  readonly movement = Vector2.Zero();
  health: number = GAMEPLAY.player.maxHealth;
  readonly maxHealth: number = GAMEPLAY.player.maxHealth;
  dodgeCooldown = 0;
  private dodgeRemaining = 0;
  private invincibleRemaining = 0;
  private proceduralTime = 0;
  private dodgeDirection = new Vector3(0, 0, -1);
  private facingDirection = new Vector3(0, 0, 1);
  private groundHeight: number;
  private readonly animator: ProceduralPlayerAnimator;

  constructor(readonly root: TransformNode, skeletons: readonly Skeleton[] = [], initialGroundHeight = 0) { this.groundHeight = initialGroundHeight; this.animator = new ProceduralPlayerAnimator(root, skeletons); this.root.position.y = initialGroundHeight; }

  setMovement(x: number, y: number): void { this.movement.set(x, y); }

  dodge(): boolean {
    if (this.dodgeCooldown > 0 || this.health <= 0) return false;
    const input = new Vector3(this.movement.x, 0, this.movement.y);
    this.dodgeDirection = input.lengthSquared() > 0.05 ? input.normalize() : this.facingDirection.scale(-1);
    this.dodgeRemaining = GAMEPLAY.player.dodgeDuration;
    this.dodgeCooldown = GAMEPLAY.player.dodgeCooldown;
    this.invincibleRemaining = GAMEPLAY.player.invincibility;
    return true;
  }

  damage(amount: number): boolean {
    if (this.invincibleRemaining > 0 || this.health <= 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invincibleRemaining = 0.25;
    return this.health === 0;
  }

  shoot(): void { this.animator.kick(); }

  reset(groundHeight = this.groundHeight): void { this.health = this.maxHealth; this.dodgeCooldown = 0; this.dodgeRemaining = 0; this.invincibleRemaining = 0; this.proceduralTime = 0; this.groundHeight = groundHeight; this.movement.set(0, 0); this.dodgeDirection.set(0, 0, -1); this.facingDirection.set(0, 0, 1); this.root.position.set(0, groundHeight, -2.2); this.root.rotationQuaternion = null; this.root.rotation.set(0, Math.PI, 0); this.root.setEnabled(true); this.animator.reset(); }

  update(delta: number, target?: Vector3, groundHeight?: number, pose: { aimPitch?: number; reload?: number } = {}): void {
    if (this.health <= 0) { this.root.rotation.z = Scalar.Lerp(this.root.rotation.z, Math.PI / 2, delta * 2.5); return; }
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - delta);
    this.invincibleRemaining = Math.max(0, this.invincibleRemaining - delta);
    const direction = this.dodgeRemaining > 0 ? this.dodgeDirection : new Vector3(this.movement.x, 0, this.movement.y);
    const speed = this.dodgeRemaining > 0 ? GAMEPLAY.player.dodgeSpeed : GAMEPLAY.player.speed;
    if (direction.lengthSquared() > 0.01) {
      direction.normalize();
      this.root.position.addInPlace(direction.scale(speed * delta));
      this.root.position.x = Scalar.Clamp(this.root.position.x, PLAYER_BOUNDS.minX, PLAYER_BOUNDS.maxX);
      this.root.position.z = Scalar.Clamp(this.root.position.z, PLAYER_BOUNDS.minZ, PLAYER_BOUNDS.maxZ);
    }
    this.dodgeRemaining = Math.max(0, this.dodgeRemaining - delta);
    if (groundHeight !== undefined && Number.isFinite(groundHeight)) this.groundHeight = Scalar.Lerp(this.groundHeight, groundHeight, Math.min(1, delta * 12));
    if (target) {
      const deltaTarget = target.subtract(this.root.position);
      this.facingDirection.set(deltaTarget.x, 0, deltaTarget.z).normalize();
      const desired = Math.atan2(deltaTarget.x, deltaTarget.z);
      const angleDelta = Math.atan2(Math.sin(desired - this.root.rotation.y), Math.cos(desired - this.root.rotation.y));
      this.root.rotation.y += angleDelta * Math.min(1, delta * 9);
    }
    this.proceduralTime += delta;
    const moving = direction.lengthSquared() > 0.01;
    this.root.position.y = this.groundHeight + Math.sin(this.proceduralTime * (moving ? 10 : 2.2)) * (moving ? 0.055 : 0.008);
    this.root.rotation.x = Scalar.Lerp(this.root.rotation.x, moving ? -0.075 : Math.sin(this.proceduralTime * 2.2) * 0.008, Math.min(1, delta * 7));
    const walkLean = moving ? -this.movement.x * 0.085 + Math.sin(this.proceduralTime * 10) * 0.03 : 0; this.root.rotation.z = this.dodgeRemaining > 0 ? -this.dodgeDirection.x * 0.28 : Scalar.Lerp(this.root.rotation.z, walkLean, delta * 8);
    this.animator.update(delta, { moving, dodging: this.dodgeRemaining > 0, aimPitch: pose.aimPitch ?? 0, reload: pose.reload ?? 0 });
  }
}
