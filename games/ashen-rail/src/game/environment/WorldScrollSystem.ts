import { Color3, Matrix, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

interface ScrollItem { mesh: Mesh; speed: number; length: number; wrapAt: number; initialZ: number; }

const ROCK_COUNT = 28;
const SLEEPER_COUNT = 48;
const STREAK_COUNT = 24;

export class WorldScrollSystem {
  private readonly items: ScrollItem[] = [];
  private readonly initialRockZ = Array.from({ length: ROCK_COUNT }, (_, index) => -55 + index * 4.7);
  private readonly initialSleeperZ = Array.from({ length: SLEEPER_COUNT }, (_, index) => -72 + index * 3.55);
  private readonly initialStreakZ = Array.from({ length: STREAK_COUNT }, (_, index) => -60 + index * 6.4);
  private rockZ = [...this.initialRockZ];
  private sleeperZ = [...this.initialSleeperZ];
  private streakZ = [...this.initialStreakZ];
  private readonly rockBase: Mesh;
  private readonly sleeperBase: Mesh;
  private readonly streakBase: Mesh;
  private readonly rockMatrices = new Float32Array(ROCK_COUNT * 16);
  private readonly sleeperMatrices = new Float32Array(SLEEPER_COUNT * 16);
  private readonly streakMatrices = new Float32Array(STREAK_COUNT * 16);

  constructor(scene: Scene) {
    const groundMaterial = new StandardMaterial("desert-ground", scene); groundMaterial.diffuseColor = new Color3(0.105, 0.062, 0.055); groundMaterial.specularColor.set(0, 0, 0);
    const railMaterial = new StandardMaterial("rail-material", scene); railMaterial.diffuseColor = new Color3(0.13, 0.16, 0.18); railMaterial.specularColor = new Color3(0.34, 0.27, 0.2);
    const sleeperMaterial = new StandardMaterial("sleeper-material", scene); sleeperMaterial.diffuseColor = new Color3(0.15, 0.095, 0.065); sleeperMaterial.specularColor.set(0, 0, 0);
    const mesaMaterial = new StandardMaterial("mesa-material", scene); mesaMaterial.diffuseColor = new Color3(0.115, 0.055, 0.065); mesaMaterial.specularColor.set(0, 0, 0);
    const streakMaterial = new StandardMaterial("dust-streak-material", scene); streakMaterial.emissiveColor = new Color3(0.85, 0.36, 0.13); streakMaterial.diffuseColor = new Color3(0.3, 0.12, 0.04); streakMaterial.alpha = 0.42; streakMaterial.disableLighting = true;

    for (let index = 0; index < 5; index += 1) {
      const z = -64 + index * 40;
      const ground = MeshBuilder.CreateGround(`ground-${index}`, { width: 72, height: 40 }, scene); ground.position.set(0, -2.75, z); ground.material = groundMaterial; this.addItem(ground, 18.5, 200, -86);
      for (const x of [-2.15, 2.15]) { const rail = MeshBuilder.CreateBox(`rail-${index}-${x}`, { width: 0.14, height: 0.16, depth: 40 }, scene); rail.position.set(x, -2.58, z); rail.material = railMaterial; this.addItem(rail, 18.5, 200, -86); }
    }

    for (let index = 0; index < 6; index += 1) {
      const side = index % 2 === 0 ? -1 : 1; const mesa = MeshBuilder.CreateCylinder(`distant-mesa-${index}`, { height: 3.5 + index % 3, diameterTop: 3.5, diameterBottom: 8 + index % 3 * 2, tessellation: 6 }, scene);
      mesa.position.set(side * (18 + index % 3 * 7), -1.15 + (index % 3) * 0.25, -20 + index * 26); mesa.scaling.z = 1.8; mesa.material = mesaMaterial; this.addItem(mesa, 4.2, 156, -72);
    }

    this.rockBase = MeshBuilder.CreatePolyhedron("rock-thin-source", { type: 1, size: 1 }, scene); this.rockBase.material = groundMaterial; this.rockBase.alwaysSelectAsActiveMesh = true;
    this.sleeperBase = MeshBuilder.CreateBox("sleeper-thin-source", { width: 5.5, height: 0.11, depth: 0.3 }, scene); this.sleeperBase.material = sleeperMaterial; this.sleeperBase.alwaysSelectAsActiveMesh = true;
    this.streakBase = MeshBuilder.CreateBox("streak-thin-source", { width: 0.045, height: 0.018, depth: 2.2 }, scene); this.streakBase.material = streakMaterial; this.streakBase.alwaysSelectAsActiveMesh = true;
    this.updateThinInstances(0);
  }

  update(delta: number): void {
    for (const item of this.items) { item.mesh.position.z -= item.speed * delta; while (item.mesh.position.z < item.wrapAt) item.mesh.position.z += item.length; }
    this.updateThinInstances(delta);
  }

  reset(): void {
    for (const item of this.items) item.mesh.position.z = item.initialZ;
    this.rockZ = [...this.initialRockZ]; this.sleeperZ = [...this.initialSleeperZ]; this.streakZ = [...this.initialStreakZ]; this.updateThinInstances(0);
  }

  private addItem(mesh: Mesh, speed: number, length: number, wrapAt: number): void { this.items.push({ mesh, speed, length, wrapAt, initialZ: mesh.position.z }); }

  private updateThinInstances(delta: number): void {
    this.rockZ = this.advance(this.rockZ, delta * 12.5, -72, 132);
    for (let index = 0; index < this.rockZ.length; index += 1) { const x = (index % 2 === 0 ? -1 : 1) * (8 + (index % 7) * 3.4); const scale = 0.7 + (index % 4) * 0.28; Matrix.Compose(new Vector3(scale, scale * 0.7, scale), Vector3.Zero().toQuaternion(), new Vector3(x, -2.25, this.rockZ[index] ?? 0)).copyToArray(this.rockMatrices, index * 16); }
    this.rockBase.thinInstanceSetBuffer("matrix", this.rockMatrices, 16, true);

    this.sleeperZ = this.advance(this.sleeperZ, delta * 18.5, -76, 170.4);
    for (let index = 0; index < this.sleeperZ.length; index += 1) Matrix.Translation(0, -2.53, this.sleeperZ[index] ?? 0).copyToArray(this.sleeperMatrices, index * 16);
    this.sleeperBase.thinInstanceSetBuffer("matrix", this.sleeperMatrices, 16, true);

    this.streakZ = this.advance(this.streakZ, delta * 29, -68, 153.6);
    for (let index = 0; index < this.streakZ.length; index += 1) { const side = index % 2 === 0 ? -1 : 1; const x = side * (5.5 + index % 6 * 2.2); const scale = 0.65 + index % 4 * 0.2; Matrix.Compose(new Vector3(scale, 1, scale), Vector3.Zero().toQuaternion(), new Vector3(x, -2.43, this.streakZ[index] ?? 0)).copyToArray(this.streakMatrices, index * 16); }
    this.streakBase.thinInstanceSetBuffer("matrix", this.streakMatrices, 16, true);
  }

  private advance(values: number[], amount: number, wrapAt: number, length: number): number[] { return values.map((value) => { let next = value - amount; while (next < wrapAt) next += length; return next; }); }
}
