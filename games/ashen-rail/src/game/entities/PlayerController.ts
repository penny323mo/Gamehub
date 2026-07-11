import { Scalar, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import { PLAYER_BOUNDS } from "../../config/assets";
import { GAMEPLAY } from "../../config/gameplay";

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

  constructor(readonly root: TransformNode) {}

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

  reset(): void { this.health = this.maxHealth; this.dodgeCooldown = 0; this.dodgeRemaining = 0; this.invincibleRemaining = 0; this.proceduralTime = 0; this.movement.set(0, 0); this.dodgeDirection.set(0, 0, -1); this.facingDirection.set(0, 0, 1); this.root.position.set(0, 1.02, -2.2); this.root.rotationQuaternion = null; this.root.rotation.set(0, Math.PI, 0); this.root.setEnabled(true); }

  update(delta: number, target?: Vector3): void {
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
    if (target) {
      const deltaTarget = target.subtract(this.root.position);
      this.facingDirection.set(deltaTarget.x, 0, deltaTarget.z).normalize();
      const desired = Math.atan2(deltaTarget.x, deltaTarget.z);
      const angleDelta = Math.atan2(Math.sin(desired - this.root.rotation.y), Math.cos(desired - this.root.rotation.y));
      this.root.rotation.y += angleDelta * Math.min(1, delta * 9);
    }
    this.proceduralTime += delta;
    const moving = direction.lengthSquared() > 0.01;
    this.root.position.y = 1.02 + Math.sin(this.proceduralTime * (moving ? 9 : 2.2)) * (moving ? 0.035 : 0.012);
    this.root.rotation.z = this.dodgeRemaining > 0 ? -this.dodgeDirection.x * 0.28 : Scalar.Lerp(this.root.rotation.z, 0, delta * 8);
  }
}
