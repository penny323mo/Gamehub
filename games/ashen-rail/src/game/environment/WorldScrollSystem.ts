import { Color3, DynamicTexture, Matrix, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";

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

    // 中景 mesa：推遠（|x| 26-47）、放慢（2.6），先至似「遠處嘅地貌」而唔係
    // 一嚿嚿嘢喺你隔籬向後飛
    for (let index = 0; index < 8; index += 1) {
      const side = index % 2 === 0 ? -1 : 1; const mesa = MeshBuilder.CreateCylinder(`distant-mesa-${index}`, { height: 3.2 + index % 3 * 1.4, diameterTop: 2.6 + index % 2 * 2, diameterBottom: 9 + index % 4 * 2.6, tessellation: 7 }, scene);
      mesa.position.set(side * (26 + index % 3 * 7), -1.35 + (index % 3) * 0.2, -30 + index * 24); mesa.scaling.z = 2.3; mesa.material = mesaMaterial; this.addItem(mesa, 2.6, 192, -88);
    }

    this.buildSky(scene);
    this.buildRidges(scene, mesaMaterial);
    this.buildPoles(scene, sleeperMaterial);

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

  // 天空：反面大球＋直向漸層貼圖（灰燼黃昏：地平線橙紅 → 頂部暗紫藍）＋落日
  private buildSky(scene: Scene): void {
    const texture = new DynamicTexture("ashen-sky-gradient", { width: 4, height: 256 }, scene, false);
    const context = texture.getContext();
    const gradient = context.createLinearGradient(0, 256, 0, 0);
    gradient.addColorStop(0, "#5a2317");
    gradient.addColorStop(0.22, "#7a3a1d");
    gradient.addColorStop(0.45, "#4a2333");
    gradient.addColorStop(0.75, "#241a33");
    gradient.addColorStop(1, "#12101f");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 4, 256);
    texture.update(false);
    const material = new StandardMaterial("ashen-sky-material", scene);
    material.emissiveTexture = texture; material.disableLighting = true; material.backFaceCulling = false;
    material.fogEnabled = false; // 天空唔受霧影響，地面霧色同地平線漸層顏色對齊就夠
    const dome = MeshBuilder.CreateSphere("ashen-sky-dome", { diameter: 300, segments: 12, sideOrientation: Mesh.BACKSIDE }, scene);
    dome.material = material; dome.isPickable = false; dome.infiniteDistance = true; dome.renderingGroupId = 0;

    const sunMaterial = new StandardMaterial("ashen-sun-material", scene);
    sunMaterial.emissiveColor = new Color3(1, 0.52, 0.2); sunMaterial.disableLighting = true; sunMaterial.fogEnabled = false;
    const sun = MeshBuilder.CreateDisc("ashen-sun", { radius: 11, tessellation: 40 }, scene);
    sun.material = sunMaterial; sun.position.set(-58, 9, 128); sun.billboardMode = Mesh.BILLBOARDMODE_ALL;
    sun.isPickable = false; sun.infiniteDistance = true;
  }

  // 遠山剪影：兩層鋸齒 ribbon，好慢咁郁（0.9 / 0.4）製造真實視差；
  // 霧＋剪影色令佢哋溶入地平線，wrap 嗰下匿喺霧入面唔會見到「彈返嚟」
  private buildRidges(scene: Scene, material: StandardMaterial): void {
    const makeRidge = (name: string, x: number, z: number, width: number, peak: number, seed: number, speed: number, wrapLength: number): void => {
      const top: Vector3[] = []; const bottom: Vector3[] = [];
      const segments = 14;
      for (let index = 0; index <= segments; index += 1) {
        const t = index / segments;
        const zz = (t - 0.5) * width;
        const jag = Math.abs(Math.sin(seed * 12.9 + index * 2.3)) * 0.55 + Math.abs(Math.sin(seed * 7.7 + index * 0.9)) * 0.45;
        top.push(new Vector3(0, 0.8 + jag * peak, zz));
        bottom.push(new Vector3(0, -3.2, zz));
      }
      const ridge = MeshBuilder.CreateRibbon(name, { pathArray: [top, bottom], sideOrientation: Mesh.DOUBLESIDE }, scene);
      ridge.position.set(x, -1.6, z); ridge.material = material; ridge.isPickable = false;
      this.addItem(ridge, speed, wrapLength, -wrapLength * 0.55);
    };
    for (let index = 0; index < 3; index += 1) {
      makeRidge(`ridge-far-${index}`, (index % 2 === 0 ? -1 : 1) * 68, -60 + index * 78, 120, 7.5, index + 1, 0.4, 240);
      makeRidge(`ridge-mid-${index}`, (index % 2 === 0 ? 1 : -1) * 50, -40 + index * 66, 96, 5.2, index + 4, 0.9, 210);
    }
  }

  // 路軌電線桿：近景快視差（同地面同速），最直接嘅「列車開得好快」訊號
  private buildPoles(scene: Scene, material: StandardMaterial): void {
    for (let index = 0; index < 10; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const pole = MeshBuilder.CreateBox(`trackside-pole-${index}`, { width: 0.16, height: 4.6, depth: 0.16 }, scene);
      pole.position.set(side * 6.8, -0.45, -70 + index * 19);
      const arm = MeshBuilder.CreateBox(`trackside-arm-${index}`, { width: 1.3, height: 0.12, depth: 0.12 }, scene);
      arm.parent = pole; arm.position.set(-side * 0.45, 2.05, 0);
      pole.material = material; arm.material = material;
      this.addItem(pole, 18.5, 190, -83);
    }
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
