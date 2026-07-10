import type { AbstractEngine, Scene, TransformNode } from "@babylonjs/core";
import { MODEL_ASSETS } from "../config/assets";

export interface DebugTargets { player: TransformNode; weapon: TransformNode; droneTemplate: TransformNode; cameraOffset: { x: number; y: number; z: number }; }

export class DebugPanel {
  readonly enabled = new URLSearchParams(window.location.search).get("debug") === "1";
  private timer = 0;
  private readonly panel = document.querySelector<HTMLElement>("#debug-panel");
  private readonly content = document.querySelector<HTMLElement>("#debug-content");
  private readonly perf = document.querySelector<HTMLElement>("#perf-hud");

  constructor(private readonly engine: AbstractEngine, private readonly scene: Scene, private readonly targets: DebugTargets, private readonly droneCount: () => number) {
    if (!this.enabled || !this.panel || !this.content || !this.perf) return;
    this.panel.classList.remove("hidden"); this.buildInputs();
    document.querySelector("#debug-toggle")?.addEventListener("click", () => this.content?.classList.toggle("collapsed"));
    document.querySelector("#copy-config")?.addEventListener("click", () => navigator.clipboard?.writeText(JSON.stringify(this.snapshot(), null, 2)));
  }

  update(delta: number, renderScale: number): void {
    if (!this.enabled || !this.perf) return; this.timer += delta; if (this.timer < 0.3) return; this.timer = 0;
    this.perf.textContent = `FPS ${this.engine.getFps().toFixed(0)}\nActive Meshes ${this.scene.getActiveMeshes().length}\nDraw Calls ${this.scene.getActiveMeshes().length}\nTextures ${this.scene.textures.length}\nParticles ${this.scene.particleSystems.length}\nDrones ${this.droneCount()}\nRender Scale ${renderScale.toFixed(2)}`;
  }

  private buildInputs(): void {
    if (!this.content) return;
    const fields: [string, () => number, (value: number) => void, number][] = [
      ["Weapon X", () => this.targets.weapon.position.x, (v) => this.targets.weapon.position.x = v, 0.01], ["Weapon Y", () => this.targets.weapon.position.y, (v) => this.targets.weapon.position.y = v, 0.01], ["Weapon Z", () => this.targets.weapon.position.z, (v) => this.targets.weapon.position.z = v, 0.01],
      ["Weapon Rot X", () => this.targets.weapon.rotation.x, (v) => this.targets.weapon.rotation.x = v, 0.05], ["Weapon Rot Y", () => this.targets.weapon.rotation.y, (v) => this.targets.weapon.rotation.y = v, 0.05], ["Weapon Rot Z", () => this.targets.weapon.rotation.z, (v) => this.targets.weapon.rotation.z = v, 0.05],
      ["Weapon Scale", () => this.targets.weapon.scaling.x, (v) => this.targets.weapon.scaling.setAll(v), 0.01], ["Player Scale", () => this.targets.player.scaling.x, (v) => this.targets.player.scaling.setAll(v), 0.01], ["Player Rotation", () => this.targets.player.rotation.y, (v) => this.targets.player.rotation.y = v, 0.05], ["Player Ground", () => this.targets.player.position.y, (v) => this.targets.player.position.y = v, 0.01], ["Drone Scale", () => this.targets.droneTemplate.scaling.x, (v) => this.targets.droneTemplate.scaling.setAll(v), 0.01]
    ];
    for (const [label, read, write, step] of fields) {
      const row = document.createElement("label"); row.textContent = label; const input = document.createElement("input"); input.type = "number"; input.step = String(step); input.value = read().toFixed(2); input.addEventListener("input", () => write(Number(input.value))); row.append(input); this.content.append(row);
    }
  }

  private snapshot(): object { return { player: { ...MODEL_ASSETS.player, scale: this.targets.player.scaling.x, rotation: this.targets.player.rotation.asArray(), groundOffset: this.targets.player.position.y }, weapon: { ...MODEL_ASSETS.weapon, scale: this.targets.weapon.scaling.x, position: this.targets.weapon.position.asArray(), rotation: this.targets.weapon.rotation.asArray() }, drone: { ...MODEL_ASSETS.drone, scale: this.targets.droneTemplate.scaling.x } }; }
}
