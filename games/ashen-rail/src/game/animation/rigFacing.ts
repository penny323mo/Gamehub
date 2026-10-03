import { TransformNode, Vector3, type AbstractMesh, type Skeleton } from "@babylonjs/core";

/**
 * Turn a character's visual so its body faces the root's local +Z.
 *
 * The controller yaws the root with atan2(dx, dz), i.e. it assumes the model faces +Z. The soldier GLB is authored
 * facing sideways, so in game the player stood side-on to the camera — a thin "paper card" (Penny's phone test).
 * Instead of guessing an angle per asset we measure it: the thighs give the body's right axis (L → R), and
 * forward = right × up. The correction is applied to the root's children, so the controller's yaw maths stays as is.
 * Returns the applied correction in degrees (0 when the rig has no thighs to measure).
 */
export function alignRigToRootForward(root: TransformNode, skeletons: readonly Skeleton[], left = ["L_Thigh", "LeftUpLeg", "thigh.L"], right = ["R_Thigh", "RightUpLeg", "thigh.R"]): number {
  const skeleton = skeletons[0];
  if (!skeleton) return 0;
  const find = (names: string[]) => skeleton.bones.find((b) => names.includes(b.name));
  const l = find(left), r = find(right);
  const mesh = root.getChildMeshes(false).find((m): m is AbstractMesh => !!(m as AbstractMesh).skeleton);
  if (!l || !r || !mesh) return 0;
  root.computeWorldMatrix(true);
  for (const m of root.getChildMeshes(false)) m.computeWorldMatrix(true);
  skeleton.computeAbsoluteMatrices(true);   // freshly loaded: bone matrices are not computed until the first render
  const toRoot = root.getWorldMatrix().clone().invert();
  const lp = Vector3.TransformCoordinates(l.getAbsolutePosition(mesh), toRoot);
  const rp = Vector3.TransformCoordinates(r.getAbsolutePosition(mesh), toRoot);
  const rx = rp.x - lp.x, rz = rp.z - lp.z;
  if (Math.hypot(rx, rz) < 1e-4) return 0;
  // forward = right × up = (-rz, 0, rx); yaw of that vector vs +Z
  const bodyYaw = Math.atan2(-rz, rx);
  const correction = -bodyYaw;
  if (Math.abs(correction) < 0.02) return 0;
  // One pivot between the root and everything under it, so the skinned mesh and its bone nodes turn together.
  // (Turning them separately cancels out: skinning reads bones relative to the mesh.)
  const pivot = new TransformNode(`${root.name}-facing`, root.getScene());
  pivot.rotation.y = correction;
  for (const child of [...root.getChildren()]) (child as TransformNode).parent = pivot;
  pivot.parent = root;
  return Math.round((correction * 180) / Math.PI);
}
