import { Color3, Matrix, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

interface ScrollItem { mesh: Mesh; speed: number; length: number; }

export class WorldScrollSystem {
  private readonly items: ScrollItem[] = [];
  private rockBase: Mesh;
  private rockZ = Array.from({ length: 28 }, (_, index) => -55 + index * 4.1);
  private readonly rockMatrices = new Float32Array(28 * 16);

  constructor(scene: Scene) {
    const groundMaterial = new StandardMaterial("desert-ground", scene); groundMaterial.diffuseColor = new Color3(0.25, 0.12, 0.065); groundMaterial.specularColor.set(0, 0, 0);
    const railMaterial = new StandardMaterial("rail-material", scene); railMaterial.diffuseColor = new Color3(0.15, 0.16, 0.15);
    for (let index = 0; index < 5; index += 1) {
      const ground = MeshBuilder.CreateGround(`ground-${index}`, { width: 64, height: 32 }, scene); ground.position.set(0, -2.75, -32 + index * 32); ground.material = groundMaterial; this.items.push({ mesh: ground, speed: 17, length: 160 });
      for (const x of [-2.15, 2.15]) {
        const rail = MeshBuilder.CreateBox(`rail-${index}-${x}`, { width: 0.14, height: 0.16, depth: 32 }, scene); rail.position.set(x, -2.58, ground.position.z); rail.material = railMaterial; this.items.push({ mesh: rail, speed: 17, length: 160 });
      }
    }
    this.rockBase = MeshBuilder.CreatePolyhedron("rock-thin-source", { type: 1, size: 1 }, scene); this.rockBase.material = groundMaterial; this.rockBase.isVisible = false;
    this.updateRocks(0);
  }

  update(delta: number): void {
    for (const item of this.items) {
      item.mesh.position.z -= item.speed * delta;
      if (item.mesh.position.z < -96) item.mesh.position.z += item.length;
    }
    this.updateRocks(delta);
  }

  private updateRocks(delta: number): void {
    this.rockZ = this.rockZ.map((value) => value - delta * 13 < -70 ? value - delta * 13 + 116 : value - delta * 13);
    for (let index = 0; index < this.rockZ.length; index += 1) {
      const x = (index % 2 === 0 ? -1 : 1) * (8 + (index % 7) * 3.4);
      const scale = 0.7 + (index % 4) * 0.28;
      const matrix = Matrix.Compose(new Vector3(scale, scale * 0.7, scale), Vector3.Zero().toQuaternion(), new Vector3(x, -2.25, this.rockZ[index] ?? 0));
      matrix.copyToArray(this.rockMatrices, index * 16);
    }
    this.rockBase.thinInstanceSetBuffer("matrix", this.rockMatrices, 16, true);
  }
}
