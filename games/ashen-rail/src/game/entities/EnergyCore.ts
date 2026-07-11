import { Color3, Mesh, MeshBuilder, PointLight, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { CORE_POSITION } from "../../config/assets";
import { GAMEPLAY } from "../../config/gameplay";

export class EnergyCore {
  readonly root: TransformNode;
  health: number = GAMEPLAY.core.maxHealth;
  readonly maxHealth: number = GAMEPLAY.core.maxHealth;
  private readonly glowMaterial: StandardMaterial;
  private readonly healthBack: Mesh;
  private readonly healthFill: Mesh;
  private flash = 0;
  private pulse = 0;

  constructor(scene: Scene) {
    this.root = new TransformNode("energy-core", scene);
    this.root.position = Vector3.FromArray(CORE_POSITION);
    const metal = new StandardMaterial("core-metal", scene);
    metal.diffuseColor = new Color3(0.12, 0.14, 0.14);
    const base = MeshBuilder.CreateCylinder("core-base", { diameter: 1.05, height: 0.28, tessellation: 16 }, scene);
    base.material = metal; base.parent = this.root;
    this.glowMaterial = new StandardMaterial("core-glow", scene);
    this.glowMaterial.diffuseColor = new Color3(1, 0.28, 0.03);
    this.glowMaterial.emissiveColor = new Color3(1, 0.18, 0.01);
    const column = MeshBuilder.CreateCylinder("core-column", { diameter: 0.36, height: 1.22, tessellation: 16 }, scene);
    column.position.y = 0.68; column.material = this.glowMaterial; column.parent = this.root;
    for (let index = 0; index < 3; index += 1) {
      const ring = MeshBuilder.CreateTorus(`core-ring-${index}`, { diameter: 0.72 + index * 0.11, thickness: 0.045, tessellation: 24 }, scene);
      ring.position.y = 0.36 + index * 0.34; ring.rotation.x = Math.PI / 2; ring.material = metal; ring.parent = this.root;
    }
    const light = new PointLight("core-light", new Vector3(0, 1, 0), scene);
    light.diffuse = new Color3(1, 0.25, 0.03); light.intensity = 2.2; light.range = 7; light.parent = this.root;
    const healthBackMaterial = new StandardMaterial("core-health-back-material", scene); healthBackMaterial.diffuseColor = new Color3(0.035, 0.025, 0.025); healthBackMaterial.emissiveColor = new Color3(0.025, 0.015, 0.015); healthBackMaterial.disableLighting = true; healthBackMaterial.disableDepthWrite = true;
    const healthFillMaterial = new StandardMaterial("core-health-fill-material", scene); healthFillMaterial.diffuseColor = new Color3(1, 0.28, 0.03); healthFillMaterial.emissiveColor = new Color3(1, 0.16, 0.01); healthFillMaterial.disableLighting = true; healthFillMaterial.disableDepthWrite = true;
    this.healthBack = MeshBuilder.CreatePlane("core-world-health-back", { width: 1.34, height: 0.17 }, scene); this.healthBack.position.y = 1.62; this.healthBack.parent = this.root; this.healthBack.billboardMode = Mesh.BILLBOARDMODE_ALL; this.healthBack.material = healthBackMaterial; this.healthBack.renderingGroupId = 2; this.healthBack.isPickable = false;
    this.healthFill = MeshBuilder.CreatePlane("core-world-health-fill", { width: 1.22, height: 0.085 }, scene); this.healthFill.position.set(0, 1.62, -0.012); this.healthFill.parent = this.root; this.healthFill.billboardMode = Mesh.BILLBOARDMODE_ALL; this.healthFill.material = healthFillMaterial; this.healthFill.renderingGroupId = 2; this.healthFill.isPickable = false;
  }

  damage(amount: number): boolean {
    if (this.health <= 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.flash = 0.18;
    return this.health === 0;
  }

  reset(): void { this.health = this.maxHealth; this.flash = 0; this.pulse = 0; this.root.scaling.setAll(1); this.root.setEnabled(true); this.healthBack.setEnabled(true); this.healthFill.setEnabled(true); this.glowMaterial.emissiveColor.set(1, 0.18, 0.01); }

  update(delta: number): void {
    this.pulse += delta * (this.health < 35 ? 7 : 3);
    const scale = 1 + Math.sin(this.pulse) * 0.035;
    this.root.scaling.setAll(scale);
    const healthRatio = this.health / this.maxHealth; this.healthFill.scaling.x = healthRatio; this.healthFill.position.x = -(1 - healthRatio) * 0.61;
    this.flash = Math.max(0, this.flash - delta);
    if (this.health === 0) { this.glowMaterial.emissiveColor.set(0.02, 0.01, 0); this.healthBack.setEnabled(false); this.healthFill.setEnabled(false); }
    else if (this.flash > 0) this.glowMaterial.emissiveColor.set(1, 0, 0);
    else this.glowMaterial.emissiveColor.set(1, 0.18, 0.01);
  }
}
