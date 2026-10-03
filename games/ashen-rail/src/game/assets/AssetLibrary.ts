import "@babylonjs/loaders/glTF";
import { MeshoptCompression } from "@babylonjs/core/Meshes/Compression/meshoptCompression";
import { AbstractMesh, Color3, MeshBuilder, Scene, SceneLoader, StandardMaterial, TransformNode, Vector3, type AnimationGroup, type Skeleton } from "@babylonjs/core";
import { MODEL_ASSETS, type AssetId } from "../../config/assets";
import { alignRigToRootForward } from "../animation/rigFacing";

export interface LoadedAsset {
  id: AssetId;
  root: AbstractMesh | TransformNode;
  meshes: AbstractMesh[];
  skeletons: Skeleton[];
  animationGroups: AnimationGroup[];
  fallback: boolean;
  error?: string;
}

export type AssetProgress = (id: AssetId, completed: number, total: number) => void;

// All four GLBs are meshopt-compressed. Babylon's default decoder URL is cdn.babylonjs.com; where that host is
// blocked every model fell back to a primitive (the soldier became a box, the train vanished). Ship our own copy.
MeshoptCompression.Configuration = { decoder: { url: new URL("assets/vendor/meshopt/meshopt_decoder.js", window.location.href).href } };

export class AssetLibrary {
  private readonly loaded = new Map<AssetId, LoadedAsset>();
  constructor(private readonly scene: Scene) {}

  async loadAll(progress: AssetProgress): Promise<Map<AssetId, LoadedAsset>> {
    const ids: AssetId[] = ["train", "player", "weapon", "drone"];
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index];
      if (!id) continue;
      const asset = await this.load(id);
      this.loaded.set(id, asset);
      progress(id, index + 1, ids.length);
    }
    return this.loaded;
  }

  get(id: AssetId): LoadedAsset {
    const asset = this.loaded.get(id);
    if (!asset) throw new Error(`Asset not loaded: ${id}`);
    return asset;
  }

  clone(id: AssetId, name: string): TransformNode {
    const source = this.get(id).root;
    const clone = source.clone(name, null, false);
    if (!clone) throw new Error(`Unable to clone asset: ${id}`);
    clone.setEnabled(true);
    return clone;
  }

  private async load(id: AssetId): Promise<LoadedAsset> {
    const config = MODEL_ASSETS[id];
    try {
      const absolute = new URL(config.url, window.location.href).href;
      const result = await SceneLoader.ImportMeshAsync(null, "", absolute, this.scene);
      const root = result.meshes[0];
      if (!root) throw new Error("GLB did not create a root mesh");
      root.name = `${id}-root`;
      root.position = Vector3.FromArray(config.position);
      root.rotation = Vector3.FromArray(config.rotation);
      root.scaling.setAll(config.scale);
      // The glTF loader's root carries a Z = -1 scale (right- to left-handed). setAll() erased it, which mirrored the
      // soldier and flipped its triangle winding. Keep the flip for the player (the only asymmetric, skinned asset).
      if (id === "player") root.scaling.z = -config.scale;
      for (const mesh of result.meshes) {
        mesh.isPickable = id === "drone" || id === "train";
        mesh.receiveShadows = id === "train";
        if (id === "train") mesh.metadata = { ...mesh.metadata, trainSurface: true, blocksShots: true };
      }
      if (id === "train") this.normalizeTrain(root);
      if (id === "player") { const deg = alignRigToRootForward(root, result.skeletons); if (deg) console.info(`[AssetLibrary] player rig turned ${deg}° to face +Z`); }
      if (id === "drone") root.setEnabled(false);
      return { id, root, meshes: result.meshes, skeletons: result.skeletons, animationGroups: result.animationGroups, fallback: false };
    } catch (error) {
      console.error(`[AssetLibrary] ${id} failed`, error);
      const mesh = id === "drone" ? MeshBuilder.CreatePolyhedron(`${id}-fallback`, { type: 1, size: 1 }, this.scene) : MeshBuilder.CreateBox(`${id}-fallback`, { size: 1 }, this.scene);
      const material = new StandardMaterial(`${id}-fallback-mat`, this.scene);
      material.diffuseColor = id === "train" ? new Color3(0.18, 0.2, 0.17) : id === "player" ? new Color3(0.25, 0.33, 0.28) : id === "weapon" ? new Color3(0.22, 0.16, 0.11) : new Color3(0.42, 0.08, 0.04);
      mesh.material = material;
      mesh.position = Vector3.FromArray(config.position);
      mesh.rotation = Vector3.FromArray(config.rotation);
      mesh.scaling.setAll(config.scale);
      if (id === "train") { mesh.isPickable = true; mesh.metadata = { trainSurface: true, blocksShots: true }; this.normalizeTrain(mesh); }
      if (id === "drone") mesh.setEnabled(false);
      return { id, root: mesh, meshes: [mesh], skeletons: [], animationGroups: [], fallback: true, error: String(error) };
    }
  }

  private normalizeTrain(root: TransformNode): void {
    root.computeWorldMatrix(true); for (const mesh of root.getChildMeshes(false)) mesh.computeWorldMatrix(true);
    let bounds = root.getHierarchyBoundingVectors(true); const size = bounds.max.subtract(bounds.min);
    root.scaling.multiplyInPlace(new Vector3(6.2 / Math.max(0.001, size.x), 3.3 / Math.max(0.001, size.y), 18 / Math.max(0.001, size.z)));
    root.computeWorldMatrix(true); for (const mesh of root.getChildMeshes(false)) mesh.computeWorldMatrix(true);
    bounds = root.getHierarchyBoundingVectors(true); const centerX = (bounds.min.x + bounds.max.x) / 2; const centerZ = (bounds.min.z + bounds.max.z) / 2;
    root.position.addInPlace(new Vector3(-centerX, -2.52 - bounds.min.y, -centerZ)); root.computeWorldMatrix(true);
  }
}
