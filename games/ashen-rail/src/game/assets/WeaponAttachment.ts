import { AbstractMesh, Bone, TransformNode, Vector3 } from "@babylonjs/core";
import type { LoadedAsset } from "./AssetLibrary";
import { MODEL_ASSETS } from "../../config/assets";

export interface WeaponAttachmentResult { mode: "bone" | "node"; socket: string; }

const normalise = (value: string): string => value.toLowerCase().replace(/[\s_.-]+/gu, "");

export class WeaponAttachment {
  attach(player: LoadedAsset, weapon: LoadedAsset): WeaponAttachmentResult {
    const config = MODEL_ASSETS.weapon;
    const candidates = MODEL_ASSETS.player.weaponSocket ?? [];
    const bones = player.skeletons.flatMap((skeleton) => skeleton.bones);
    const bone = this.findBone(bones, candidates);
    const weaponRoot = weapon.root;
    weaponRoot.setEnabled(true);
    weaponRoot.scaling.setAll(config.scale);
    weaponRoot.position = Vector3.FromArray(config.position);
    weaponRoot.rotation = Vector3.FromArray(config.rotation);

    const skinnedMesh = player.meshes.find((mesh) => mesh.skeleton) ?? player.meshes.find((mesh) => mesh instanceof AbstractMesh);
    if (bone && skinnedMesh && weaponRoot instanceof AbstractMesh) {
      weaponRoot.attachToBone(bone, skinnedMesh);
      return { mode: "bone", socket: bone.name };
    }

    const node = this.findNode(player.root, candidates) ?? player.root;
    weaponRoot.parent = node;
    return { mode: "node", socket: node.name };
  }

  private findBone(bones: readonly Bone[], candidates: readonly string[]): Bone | undefined {
    for (const candidate of candidates) {
      const exact = bones.find((bone) => normalise(bone.name) === normalise(candidate));
      if (exact) return exact;
    }
    return bones.find((bone) => /righthand|handr|rhand|forearmr|rforearm/u.test(normalise(bone.name)));
  }

  private findNode(root: TransformNode, candidates: readonly string[]): TransformNode | undefined {
    const nodes = [root, ...root.getChildTransformNodes(false)];
    return nodes.find((node) => candidates.some((candidate) => normalise(node.name) === normalise(candidate))) ?? nodes.find((node) => /righthand|handr|rhand/u.test(normalise(node.name)));
  }
}
