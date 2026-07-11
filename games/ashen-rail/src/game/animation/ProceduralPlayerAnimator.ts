import { Bone, Quaternion, Space, TransformNode, type Skeleton } from "@babylonjs/core";

interface AnimatedBone { bone: Bone; rest: Quaternion; }
interface AnimatedNode { node: TransformNode; rest: Quaternion; }

const normalise = (value: string): string => value.toLowerCase().replace(/[\s_.-]+/gu, "");

export class ProceduralPlayerAnimator {
  private readonly bones = new Map<string, AnimatedBone>();
  private readonly nodes = new Map<string, AnimatedNode>();
  private phase = 0;
  private recoil = 0;

  constructor(root: TransformNode, skeletons: readonly Skeleton[]) {
    const wanted = ["L_Thigh", "R_ThighTwist01", "Spine01", "Spine02", "L_Clavicle", "R_Clavicle", "L_UpperarmTwist01", "R_UpperarmTwist01", "Head"];
    const available = skeletons.flatMap((skeleton) => skeleton.bones);
    for (const name of wanted) {
      const bone = available.find((candidate) => normalise(candidate.name) === normalise(name));
      if (bone) this.bones.set(name, { bone, rest: bone.getRotationQuaternion(Space.LOCAL).clone() });
    }
    const wantedNodes = ["L_Calf", "R_Thigh", "R_Calf", "L_Upperarm", "R_Upperarm", "L_Forearm", "R_Forearm"];
    const transformNodes = root.getChildTransformNodes(false);
    for (const name of wantedNodes) { const node = transformNodes.find((candidate) => normalise(candidate.name) === normalise(name)); if (node) this.nodes.set(name, { node, rest: node.rotationQuaternion?.clone() ?? Quaternion.FromEulerVector(node.rotation) }); }
  }

  kick(): void { this.recoil = 1; }

  reset(): void {
    this.phase = 0; this.recoil = 0;
    for (const entry of this.bones.values()) entry.bone.setRotationQuaternion(entry.rest, Space.LOCAL);
    for (const entry of this.nodes.values()) entry.node.rotationQuaternion = entry.rest.clone();
  }

  update(delta: number, moving: boolean, dodging: boolean): void {
    this.phase += delta * (moving ? 9 : 2.2); this.recoil = Math.max(0, this.recoil - delta * 8);
    const stride = moving ? Math.sin(this.phase) * 0.38 : 0;
    const breathing = Math.sin(this.phase) * 0.022;
    const dodgeLean = dodging ? 0.13 : 0;
    this.pose("L_Thigh", stride, 0, 0);
    this.pose("R_ThighTwist01", -stride * 0.3, 0, 0);
    this.poseNode("R_Thigh", -stride, 0, 0);
    this.poseNode("L_Calf", -Math.max(0, -stride) * 0.62, 0, 0);
    this.poseNode("R_Calf", -Math.max(0, stride) * 0.62, 0, 0);
    this.pose("Spine01", breathing - this.recoil * 0.075, 0, dodgeLean);
    this.pose("Spine02", breathing * 0.65 - this.recoil * 0.1, 0, -dodgeLean * 0.45);
    this.pose("L_Clavicle", -stride * 0.22, 0, moving ? -0.025 : breathing * 0.4);
    this.pose("R_Clavicle", stride * 0.16 - this.recoil * 0.055, 0, moving ? 0.02 : -breathing * 0.35);
    this.pose("L_UpperarmTwist01", -stride * 0.2, 0, 0);
    this.pose("R_UpperarmTwist01", stride * 0.1 - this.recoil * 0.08, 0, 0);
    this.poseNode("L_Upperarm", -stride * 0.56, 0, 0);
    this.poseNode("R_Upperarm", stride * 0.42 - this.recoil * 0.09, 0, 0);
    this.poseNode("L_Forearm", Math.max(0, stride) * 0.18, 0, 0);
    this.poseNode("R_Forearm", -this.recoil * 0.08, 0, 0);
    this.pose("Head", -breathing * 0.35, moving ? Math.sin(this.phase * 0.5) * 0.025 : 0, 0);
  }

  private pose(name: string, pitch: number, yaw: number, roll: number): void {
    const entry = this.bones.get(name); if (!entry) return;
    entry.bone.setRotationQuaternion(entry.rest.multiply(Quaternion.RotationYawPitchRoll(yaw, pitch, roll)), Space.LOCAL);
  }

  private poseNode(name: string, pitch: number, yaw: number, roll: number): void { const entry = this.nodes.get(name); if (!entry) return; entry.node.rotationQuaternion = entry.rest.multiply(Quaternion.RotationYawPitchRoll(yaw, pitch, roll)); }
}
