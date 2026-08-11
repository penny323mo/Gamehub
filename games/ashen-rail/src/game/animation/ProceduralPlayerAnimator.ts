import { Quaternion, TransformNode, type Skeleton } from "@babylonjs/core";

interface RigPart { node: TransformNode; rest: Quaternion; }

export interface AnimatorInputs { moving: boolean; dodging: boolean; aimPitch: number; reload: number; turnRate?: number; }
export interface AnimatorDiagnostics { partNames: string[]; phase: number; moveBlend: number; recoil: number; }

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
    const wanted: Record<string, readonly string[]> = {
      Hip: ["Hip"], Pelvis: ["Pelvis"], Waist: ["Waist"], Spine01: ["Spine01"], Spine02: ["Spine02"], Head: ["Head"],
      L_Thigh: ["L_Thigh", "L_ThighTwist01"], R_Thigh: ["R_Thigh", "R_ThighTwist01"],
      L_Calf: ["L_Calf", "L_CalfTwist01"], R_Calf: ["R_Calf", "R_CalfTwist01"], L_Foot: ["L_Foot"], R_Foot: ["R_Foot"],
      L_Clavicle: ["L_Clavicle"], R_Clavicle: ["R_Clavicle"],
      L_Upperarm: ["L_Upperarm", "L_UpperarmTwist01"], R_Upperarm: ["R_Upperarm", "R_UpperarmTwist01"],
      L_Forearm: ["L_Forearm", "L_ForearmTwist01"], R_Forearm: ["R_Forearm", "R_ForearmTwist01"], L_Hand: ["L_Hand"], R_Hand: ["R_Hand"],
    };
    const nodes = this.collectNodes(root);
    for (const [name, aliases] of Object.entries(wanted)) {
      const node = aliases.map((alias) => nodes.find((candidate) => normalise(candidate.name) === normalise(alias))).find(Boolean);
      if (!node) continue;
      const rest = node.rotationQuaternion?.clone() ?? Quaternion.FromEulerVector(node.rotation);
      this.parts.set(name, { node, rest });
    }
  }

  diagnostics(): AnimatorDiagnostics { return { partNames: [...this.parts.keys()], phase: this.phase, moveBlend: this.moveBlend, recoil: this.recoil }; }

  kick(): void { this.recoil = 1; }

  reset(): void {
    this.phase = 0; this.idleTime = 0; this.recoil = 0; this.moveBlend = 0;
    for (const part of this.parts.values()) part.node.rotationQuaternion = part.rest.clone();
  }

  update(delta: number, inputs: AnimatorInputs): void {
    const { moving, dodging, aimPitch, reload, turnRate = 0 } = inputs;
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
    const turnLean = Math.max(-1, Math.min(1, turnRate));
    const kick = this.recoil * this.recoil; // 後座前段勁、快速衰減

    // ── 軀幹 ─────────────────────────────────────────────
    // 髖部：行路時左右搖擺＋反向扭腰；企定時輕微重心搖
    this.pose("Hip", swing2 * 0.03, -swing * 0.05 + turnLean * 0.035, swing * 0.04 + sway * 0.02 - turnLean * 0.06);
    this.pose("Pelvis", swing2 * 0.07, -swing * 0.14 + turnLean * 0.06, swing * 0.1 + sway * 0.04 - turnLean * 0.1);
    this.pose("Waist", breathe * 0.012 + walk * 0.05, swing * 0.08, -swing * 0.04);
    // 脊骨：呼吸起伏、行路前傾、瞄準俯仰有份、食少少後座
    this.pose("Spine01", breathe * 0.028 + walk * 0.1 + aimPitch * 0.2 - kick * 0.08, swing * 0.1 + turnLean * 0.08, dodgeLean * 0.65 - sway * 0.03 - turnLean * 0.13);
    this.pose("Spine02", breathe * 0.02 + walk * 0.06 + aimPitch * 0.3 - kick * 0.12, swing * 0.08 + turnLean * 0.14, -dodgeLean * 0.38 - turnLean * 0.08);
    // 頭：反向穩定（一路望住目標嘅感覺），輕微跟步態
    this.pose("Head", -breathe * 0.018 + aimPitch * 0.24 - kick * 0.06, -swing * 0.08 - turnLean * 0.12, -sway * 0.03 + turnLean * 0.08);

    // ── 對腳 ─────────────────────────────────────────────
    // 大腿反相擺動；小腿喺後擺收膝；腳掌反向補償保持貼地感
    const lSwing = swing * 0.78;
    const rSwing = -swing * 0.78;
    this.pose("L_Thigh", lSwing, 0, 0);
    this.pose("R_Thigh", rSwing, 0, 0);
    const lKnee = Math.max(0, -Math.sin(this.phase - 0.55)) * 1.05 * walk;
    const rKnee = Math.max(0, Math.sin(this.phase - 0.55)) * 1.05 * walk;
    this.pose("L_Calf", lKnee, 0, 0);
    this.pose("R_Calf", rKnee, 0, 0);
    this.pose("L_Foot", -(lSwing + lKnee) * 0.42 + walk * 0.06, 0, 0);
    this.pose("R_Foot", -(rSwing + rKnee) * 0.42 + walk * 0.06, 0, 0);

    // ── 左臂（自由手：行路大幅擺動＋換彈時伸過去槍度）───────
    this.pose("L_Clavicle", -swing * 0.2 - turnLean * 0.03, turnLean * 0.04, breathe * 0.03 - walk * 0.05);
    this.pose("L_Upperarm", -swing * 0.72 + reloadArc * 0.7, reloadArc * 0.45 + turnLean * 0.05, walk * 0.08);
    this.pose("L_Forearm", Math.max(0, swing) * 0.5 * walk + reloadArc * 0.95 + breathe * 0.02, 0, -turnLean * 0.04);
    this.pose("L_Hand", reloadArc * 0.38, 0, -turnLean * 0.04);

    // ── 右臂（持槍手：keep 近 rest pose 保住枝槍嘅指向，
    //     淨係跟瞄準俯仰＋後座＋好細嘅步態殘餘擺動）────────
    this.pose("R_Clavicle", swing * 0.08 - kick * 0.1, turnLean * 0.025, -breathe * 0.03 - turnLean * 0.04);
    this.pose("R_Upperarm", swing * 0.12 + aimPitch * 0.52 - kick * 0.26 - reloadArc * 0.35, turnLean * 0.04, -walk * 0.05);
    this.pose("R_Forearm", -kick * 0.48 + aimPitch * 0.16 + breathe * 0.018 + reloadArc * 0.26, 0, -turnLean * 0.03);
    this.pose("R_Hand", -kick * 0.24, 0, kick * 0.1);
  }

  private pose(name: string, pitch: number, yaw: number, roll: number): void {
    const part = this.parts.get(name); if (!part) return;
    part.node.rotationQuaternion = part.rest.multiply(Quaternion.RotationYawPitchRoll(yaw, pitch, roll));
  }

  private collectNodes(root: TransformNode): TransformNode[] {
    const nodes = [root, ...root.getChildTransformNodes(false), ...root.getDescendants(false).filter((node): node is TransformNode => node instanceof TransformNode)];
    return [...new Map(nodes.map((node) => [node.uniqueId, node])).values()];
  }
}
