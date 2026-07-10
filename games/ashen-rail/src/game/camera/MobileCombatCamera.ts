import { FreeCamera, Scalar, Scene, TransformNode, Vector3 } from "@babylonjs/core";

export interface CameraSettings { sensitivity: number; shake: number; aimAssist: number; }

export class MobileCombatCamera {
  readonly camera: FreeCamera;
  settings: CameraSettings;
  private shakeTime = 0;
  private shakeStrength = 0;
  private recoil = 0;

  constructor(scene: Scene, private readonly player: TransformNode) {
    this.settings = this.loadSettings();
    this.camera = new FreeCamera("combat-camera", new Vector3(0, 4.4, -9), scene);
    this.camera.minZ = 0.1; this.camera.maxZ = 170; this.camera.fov = 0.82;
    scene.activeCamera = this.camera;
  }

  update(delta: number, target?: Vector3): void {
    this.shakeTime = Math.max(0, this.shakeTime - delta);
    this.recoil = Scalar.Lerp(this.recoil, 0, Math.min(1, delta * 9));
    const focus = target ? Vector3.Lerp(this.player.position.add(new Vector3(0, 1.25, 2.5)), target, 0.38 * this.settings.aimAssist) : this.player.position.add(new Vector3(0, 1.15, 4));
    const desired = this.player.position.add(new Vector3(0, 3.15 + this.recoil * 0.14, -6.25 - this.recoil * 0.08));
    if (this.shakeTime > 0) desired.addInPlace(new Vector3((Math.random() - 0.5) * this.shakeStrength, (Math.random() - 0.5) * this.shakeStrength, 0));
    desired.y = Math.max(2.3, desired.y);
    this.camera.position = Vector3.Lerp(this.camera.position, desired, Math.min(1, delta * 7));
    this.camera.setTarget(Vector3.Lerp(this.camera.getTarget(), focus, Math.min(1, delta * 5)));
  }

  kick(amount = 1): void { this.recoil = Math.max(this.recoil, amount); }
  shake(strength: number, duration: number): void { this.shakeStrength = strength * this.settings.shake; this.shakeTime = duration; }

  private loadSettings(): CameraSettings {
    try { return { sensitivity: 1, shake: 0.65, aimAssist: 0.7, ...JSON.parse(localStorage.getItem("ashenRail.camera") ?? "{}") }; }
    catch { return { sensitivity: 1, shake: 0.65, aimAssist: 0.7 }; }
  }
}
