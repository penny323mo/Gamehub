import { FreeCamera, Scalar, Scene, TransformNode, Vector2, Vector3 } from "@babylonjs/core";

export interface CameraSettings { sensitivity: number; shake: number; aimAssist: number; }

export class MobileCombatCamera {
  readonly camera: FreeCamera;
  settings: CameraSettings;
  private shakeTime = 0;
  private shakeStrength = 0;
  private recoil = 0;
  private yaw = 0;
  private pitch = 0.08;
  private manualAimTimer = 0;
  private assistAngle = Infinity; // 目前準星同磁吸目標嘅夾角（畀瞄準摩擦用）

  constructor(scene: Scene, private readonly player: TransformNode) {
    this.settings = this.loadSettings();
    this.camera = new FreeCamera("combat-camera", new Vector3(0, 4.4, -9), scene);
    this.camera.minZ = 0.1; this.camera.maxZ = 170; this.camera.fov = 0.82;
    scene.activeCamera = this.camera;
  }

  update(delta: number, target?: Vector3): void {
    this.manualAimTimer = Math.max(0, this.manualAimTimer - delta);
    this.shakeTime = Math.max(0, this.shakeTime - delta);
    this.recoil = Scalar.Lerp(this.recoil, 0, Math.min(1, delta * 9));
    // 連續雙軸磁吸：唔再等 1.2 秒冇掂先追——拖緊嘅時候都有（減到 30%），
    // 幫手黐實目標；離目標愈遠吸力愈細，唔會成個鏡頭被搶走
    this.assistAngle = Infinity;
    if (target && this.settings.aimAssist > 0) {
      const toTarget = target.subtract(this.player.position);
      const desiredYaw = Math.atan2(toTarget.x, toTarget.z);
      const yawDelta = Math.atan2(Math.sin(desiredYaw - this.yaw), Math.cos(desiredYaw - this.yaw));
      const flat = Math.hypot(toTarget.x, toTarget.z);
      const desiredPitch = Scalar.Clamp(Math.atan2(toTarget.y - 1.4, Math.max(1, flat)) * 0.55 + 0.1, -0.18, 0.42);
      this.assistAngle = Math.abs(yawDelta);
      const falloff = Scalar.Clamp(1 - this.assistAngle / 0.9, 0, 1);
      const manualDamp = this.manualAimTimer > 0 ? 0.3 : 1;
      const pull = Math.min(1, delta * (2.2 + this.settings.aimAssist * 3.4)) * falloff * manualDamp;
      this.yaw += yawDelta * pull;
      this.pitch = Scalar.Lerp(this.pitch, desiredPitch, pull * 0.55);
    }
    const forward = this.getGroundForward();
    const right = new Vector3(forward.z, 0, -forward.x);
    const baseFocus = this.player.position.add(forward.scale(5)).add(new Vector3(0, 0.68 + this.pitch * 2.35, 0));
    const assist = this.manualAimTimer > 0 ? 0 : 0.28 * this.settings.aimAssist;
    const focus = target ? Vector3.Lerp(baseFocus, target, assist) : baseFocus;
    const desired = this.player.position.subtract(forward.scale(5.15 + this.recoil * 0.08)).add(right.scale(0.76)).add(new Vector3(0, 2.28 + this.pitch * 1.55 + this.recoil * 0.14, 0));
    if (this.shakeTime > 0) desired.addInPlace(new Vector3((Math.random() - 0.5) * this.shakeStrength, (Math.random() - 0.5) * this.shakeStrength, 0));
    desired.y = Math.max(this.player.position.y + 2.08, desired.y);
    this.camera.position = Vector3.Lerp(this.camera.position, desired, Math.min(1, delta * 7));
    this.camera.setTarget(Vector3.Lerp(this.camera.getTarget(), focus, Math.min(1, delta * 5)));
  }

  kick(amount = 1): void { this.recoil = Math.max(this.recoil, amount); }
  shake(strength: number, duration: number): void { this.shakeStrength = strength * this.settings.shake; this.shakeTime = duration; }
  rotate(delta: Vector2): void {
    if (delta.lengthSquared() < 0.01) return;
    // 瞄準摩擦：準星掃過目標附近時自動放慢，冇咁易「滑過龍」
    const friction = this.assistAngle < 0.22 ? 1 - 0.42 * this.settings.aimAssist : 1;
    this.yaw += delta.x * 0.0066 * this.settings.sensitivity * friction;
    this.pitch = Scalar.Clamp(this.pitch - delta.y * 0.0046 * this.settings.sensitivity * friction, -0.18, 0.42);
    this.manualAimTimer = 0.9;
  }
  getGroundForward(): Vector3 { return new Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
  get aimPitch(): number { return this.pitch; }
  getFacingPoint(): Vector3 { return this.player.position.add(this.getGroundForward().scale(8)); }
  reset(): void { this.yaw = 0; this.pitch = 0.08; this.manualAimTimer = 0; this.shakeTime = 0; this.shakeStrength = 0; this.recoil = 0; this.camera.position.copyFrom(this.player.position.add(new Vector3(0.76, 2.4, -5.15))); this.camera.setTarget(this.player.position.add(new Vector3(0, 0.87, 5))); }

  private loadSettings(): CameraSettings {
    try { return { sensitivity: 1.15, shake: 0.65, aimAssist: 0.82, ...JSON.parse(localStorage.getItem("ashenRail.camera") ?? "{}") }; }
    catch { return { sensitivity: 1.15, shake: 0.65, aimAssist: 0.82 }; }
  }
}
