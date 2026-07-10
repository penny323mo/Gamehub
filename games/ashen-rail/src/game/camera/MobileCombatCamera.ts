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
    const forward = this.getGroundForward();
    const baseFocus = this.player.position.add(forward.scale(5)).add(new Vector3(0, 1.2 + this.pitch * 3, 0));
    const assist = this.manualAimTimer > 0 ? 0.08 : 0.3 * this.settings.aimAssist;
    const focus = target ? Vector3.Lerp(baseFocus, target, assist) : baseFocus;
    const desired = this.player.position.subtract(forward.scale(6.25 + this.recoil * 0.08)).add(new Vector3(0, 3.05 + this.pitch * 1.8 + this.recoil * 0.14, 0));
    if (this.shakeTime > 0) desired.addInPlace(new Vector3((Math.random() - 0.5) * this.shakeStrength, (Math.random() - 0.5) * this.shakeStrength, 0));
    desired.y = Math.max(2.3, desired.y);
    this.camera.position = Vector3.Lerp(this.camera.position, desired, Math.min(1, delta * 7));
    this.camera.setTarget(Vector3.Lerp(this.camera.getTarget(), focus, Math.min(1, delta * 5)));
  }

  kick(amount = 1): void { this.recoil = Math.max(this.recoil, amount); }
  shake(strength: number, duration: number): void { this.shakeStrength = strength * this.settings.shake; this.shakeTime = duration; }
  rotate(delta: Vector2): void {
    if (delta.lengthSquared() < 0.01) return;
    this.yaw += delta.x * 0.005 * this.settings.sensitivity;
    this.pitch = Scalar.Clamp(this.pitch - delta.y * 0.0035 * this.settings.sensitivity, -0.18, 0.42);
    this.manualAimTimer = 1.2;
  }
  getGroundForward(): Vector3 { return new Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw)); }
  getFacingPoint(): Vector3 { return this.player.position.add(this.getGroundForward().scale(8)); }

  private loadSettings(): CameraSettings {
    try { return { sensitivity: 1, shake: 0.65, aimAssist: 0.7, ...JSON.parse(localStorage.getItem("ashenRail.camera") ?? "{}") }; }
    catch { return { sensitivity: 1, shake: 0.65, aimAssist: 0.7 }; }
  }
}
