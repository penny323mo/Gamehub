import { Quaternion, TransformNode, type Skeleton } from "@babylonjs/core";

interface RigPart { node: TransformNode; rest: Quaternion; }

export interface AnimatorInputs { moving: boolean; dodging: boolean; aimPitch: number; reload: number; }

const normalise = (value: string): string => value.toLowerCase().replace(/[\s_.-]+/gu, "");

/**
 * 全程序化嘅士兵動作（個 GLB 冇 animation clip）。
 * 重要：Tripo rig 嘅主肢體（Pelvis/Spine/Thigh/Calf/Upperarm...）喺 Babylon 入面
 * 全部係 TransformNode——皮膚權重綁咗喺 twist joint 度，而 twist joint 跟住呢啲
 * node 行。直接 setRotationQuaternion 落 skeleton Bone 度會俾 linked node 蓋返，
 * 完全冇效果（舊版一半 pose 就係咁樣變咗死 code，所以個角色似木頭人）。
 * 呢度一律經 TransformNode 郁，分四層混合：步態／呼吸企姿／瞄準俯仰／後座同換彈。
 */
export class ProceduralPlayerAnimator {
  private readonly parts = new Map<string, RigPart>();
  private phase = 0;
  private idleTime = 0;
  private recoil = 0;
  private moveBlend = 0; // 0=企定 1=行緊，crossfade 唔會郁突

  constructor(root: TransformNode, skeletons: readonly Skeleton[]) {
    void skeletons; // API 兼容保留（rig 一律經 TransformNode 郁，唔使 skeleton）
    const wanted = [
      "Pelvis", "Waist", "Spine01", "Spine02", "Head",
      "L_Thigh", "R_Thigh", "L_Calf", "R_Calf", "L_Foot", "R_Foot",
      "L_Clavicle", "R_Clavicle", "L_Upperarm", "R_Upperarm",
      "L_Forearm", "R_Forearm", "L_Hand", "R_Hand",
    ];
    const nodes = root.getChildTransformNodes(false);
    for (const name of wanted) {
      const node = nodes.find((candidate) => normalise(candidate.name) === normalise(name));
      if (!node) continue;
      const rest = node.rotationQuaternion?.clone() ?? Quaternion.FromEulerVector(node.rotation);
      this.parts.set(name, { node, rest });
    }
  }

  kick(): void { this.recoil = 1; }

  reset(): void {
    this.phase = 0; this.idleTime = 0; this.recoil = 0; this.moveBlend = 0;
    for (const part of this.parts.values()) part.node.rotationQuaternion = part.rest.clone();
  }

  update(delta: number, inputs: AnimatorInputs): void {
    const { moving, dodging, aimPitch, reload } = inputs;
    this.moveBlend += ((moving ? 1 : 0) - this.moveBlend) * Math.min(1, delta * 8);
    const walk = this.moveBlend;
    this.phase += delta * (5.4 + walk * 4.6); // 行緊先加快步頻，crossfade 期間唔會跳格
    this.idleTime += delta;
    this.recoil = Math.max(0, this.recoil - delta * 6.5);

    const swing = Math.sin(this.phase) * walk;            // 步態主相位（左右腿反相）
    const swing2 = Math.sin(this.phase * 2) * walk;       // 每步兩次嘅上下顛簸
    const breathe = Math.sin(this.idleTime * 1.7) * (1 - walk * 0.72); // 企定先明顯
    const sway = Math.sin(this.idleTime * 0.9) * (1 - walk); // 企定時重心慢慢左右移
    const reloadArc = Math.sin(Math.PI * Math.min(1, Math.max(0, reload))); // 換彈 0→1→0 弧
    const dodgeLean = dodging ? 0.22 : 0;
    const kick = this.recoil * this.recoil; // 後座前段勁、快速衰減

    // ── 軀幹 ─────────────────────────────────────────────
    // 髖部：行路時左右搖擺＋反向扭腰；企定時輕微重心搖
    this.pose("Pelvis", swing2 * 0.045, -swing * 0.1, swing * 0.07 + sway * 0.03);
    this.pose("Waist", breathe * 0.012 + walk * 0.05, swing * 0.08, -swing * 0.04);
    // 脊骨：呼吸起伏、行路前傾、瞄準俯仰有份、食少少後座
    this.pose("Spine01", breathe * 0.028 + walk * 0.06 + aimPitch * 0.16 - kick * 0.05, swing * 0.06, dodgeLean * 0.5 - sway * 0.02);
    this.pose("Spine02", breathe * 0.02 + walk * 0.03 + aimPitch * 0.24 - kick * 0.08, swing * 0.05, -dodgeLean * 0.3);
    // 頭：反向穩定（一路望住目標嘅感覺），輕微跟步態
    this.pose("Head", -breathe * 0.018 + aimPitch * 0.2 - kick * 0.04, -swing * 0.05, -sway * 0.02);

    // ── 對腳 ─────────────────────────────────────────────
    // 大腿反相擺動；小腿喺後擺收膝；腳掌反向補償保持貼地感
    const lSwing = swing * 0.5;
    const rSwing = -swing * 0.5;
    this.pose("L_Thigh", lSwing, 0, 0);
    this.pose("R_Thigh", rSwing, 0, 0);
    const lKnee = Math.max(0, -Math.sin(this.phase - 0.55)) * 0.85 * walk;
    const rKnee = Math.max(0, Math.sin(this.phase - 0.55)) * 0.85 * walk;
    this.pose("L_Calf", lKnee, 0, 0);
    this.pose("R_Calf", rKnee, 0, 0);
    this.pose("L_Foot", -(lSwing + lKnee) * 0.42 + walk * 0.06, 0, 0);
    this.pose("R_Foot", -(rSwing + rKnee) * 0.42 + walk * 0.06, 0, 0);

    // ── 左臂（自由手：行路大幅擺動＋換彈時伸過去槍度）───────
    this.pose("L_Clavicle", -swing * 0.14, 0, breathe * 0.02 - walk * 0.03);
    this.pose("L_Upperarm", -swing * 0.5 + reloadArc * 0.55, reloadArc * 0.35, walk * 0.05);
    this.pose("L_Forearm", Math.max(0, swing) * 0.34 * walk + reloadArc * 0.75 + breathe * 0.015, 0, 0);
    this.pose("L_Hand", reloadArc * 0.3, 0, 0);

    // ── 右臂（持槍手：keep 近 rest pose 保住枝槍嘅指向，
    //     淨係跟瞄準俯仰＋後座＋好細嘅步態殘餘擺動）────────
    this.pose("R_Clavicle", swing * 0.05 - kick * 0.05, 0, -breathe * 0.02);
    this.pose("R_Upperarm", swing * 0.08 + aimPitch * 0.4 - kick * 0.16 - reloadArc * 0.28, 0, -walk * 0.03);
    this.pose("R_Forearm", -kick * 0.3 + aimPitch * 0.12 + breathe * 0.012 + reloadArc * 0.2, 0, 0);
    this.pose("R_Hand", -kick * 0.14, 0, kick * 0.05);
  }

  private pose(name: string, pitch: number, yaw: number, roll: number): void {
    const part = this.parts.get(name); if (!part) return;
    part.node.rotationQuaternion = part.rest.multiply(Quaternion.RotationYawPitchRoll(yaw, pitch, roll));
  }
}
