import { Matrix, Vector3, type AbstractMesh, type Skeleton } from "@babylonjs/core";

/**
 * 士兵 GLB（Tripo 匯出）嘅蒙皮權重係壞嘅：29k 個頂點幾乎全部 100% 綁死喺 `Root`，仲有 NaN 權重。
 * 結果成個人係一嚿硬物——ProceduralPlayerAnimator 點郁骨頭，網格都唔會變形（Penny 話「似紙牌」「唔識郁」）。
 *
 * 呢度喺載入時按骨骼靜止姿態重新計權重：每條肢體段（髖→膝、膝→腳踝…）派畀一條會跟住動嘅 joint，
 * 頂點按「離每條段幾遠」用反距離⁴ 取最近 4 條混合。唔係美術級權重，但腳會行、手會擺、身會扭。
 */
interface Segment { from: string; to?: string; extend?: number; bone: string; }

const SIDES = ["L", "R"] as const;
const SEGMENTS: Segment[] = [
  { from: "Hip", to: "Waist", bone: "Pelvis" },
  { from: "Waist", to: "Spine01", bone: "Waist" },
  { from: "Spine01", to: "Spine02", bone: "Spine01" },
  { from: "Spine02", to: "NeckTwist01", bone: "Spine02" },
  { from: "NeckTwist01", to: "Head", bone: "NeckTwist01" },
  { from: "Head", extend: 0.12, bone: "Head" },
  ...SIDES.flatMap((s): Segment[] => [
    { from: `${s}_Thigh`, to: `${s}_Calf`, bone: `${s}_ThighTwist01` },
    { from: `${s}_Calf`, to: `${s}_Foot`, bone: `${s}_CalfTwist01` },
    { from: `${s}_Foot`, to: `${s}_ToeBase`, bone: `${s}_Foot` },
    { from: `${s}_ToeBase`, extend: 0.06, bone: `${s}_ToeBase` },
    { from: `${s}_Clavicle`, to: `${s}_Upperarm`, bone: `${s}_Clavicle` },
    { from: `${s}_Upperarm`, to: `${s}_Forearm`, bone: `${s}_UpperarmTwist01` },
    { from: `${s}_Forearm`, to: `${s}_Hand`, bone: `${s}_ForearmTwist01` },
    { from: `${s}_Hand`, extend: 0.08, bone: `${s}_Hand` },
  ]),
];

/** 有效權重太少（大部分頂點淨係綁 Root）先需要重算；正常綁好嘅模型唔掂。 */
export function needsAutoSkin(mesh: AbstractMesh, skeleton: Skeleton): boolean {
  const indices = mesh.getVerticesData("matricesIndices"), weights = mesh.getVerticesData("matricesWeights");
  if (!indices || !weights) return false;
  const root = skeleton.bones.find((b) => !b.getParent())?.getIndex() ?? 0;
  let rigid = 0, total = 0;
  for (let i = 0; i < indices.length; i += 4) {
    total++;
    let best = 0, bestW = -1;
    for (let c = 0; c < 4; c++) { const w = weights[i + c] ?? 0; if (w > bestW) { bestW = w; best = indices[i + c] ?? 0; } }
    if (best === root || !(bestW > 0)) rigid++;
  }
  return total > 0 && rigid / total > 0.8;
}

/** 返回重算咗幾多個頂點（0 = 骨架唔齊，冇改）。 */
export function autoSkin(mesh: AbstractMesh, skeleton: Skeleton): number {
  const positions = mesh.getVerticesData("position");
  if (!positions) return 0;
  skeleton.computeAbsoluteMatrices(true);
  const byName = new Map(skeleton.bones.map((b) => [b.name, b]));
  const jointPos = (name: string): Vector3 | undefined => byName.get(name)?.getAbsoluteMatrix().getTranslation();

  // 骨架空間嘅肢體段（同蒙皮輸出同一個空間）
  const segs: { a: Vector3; b: Vector3; index: number }[] = [];
  for (const seg of SEGMENTS) {
    const a = jointPos(seg.from), bone = byName.get(seg.bone);
    if (!a || !bone || bone.getIndex() < 0) continue;
    let b = seg.to ? jointPos(seg.to) : undefined;
    if (!b) {
      const parent = byName.get(seg.from)?.getParent();
      const dir = parent ? a.subtract(parent.getAbsoluteMatrix().getTranslation()) : new Vector3(0, 1, 0);
      b = a.add(dir.normalize().scale(seg.extend ?? 0.05));
    }
    segs.push({ a, b, index: bone.getIndex() });
  }
  if (segs.length < 20) return 0;

  // 頂點而家點畫（全部綁 Root）＝ Root 嘅蒙皮矩陣 × 原位置 → 骨架空間
  const rootBone = skeleton.bones.find((b) => !b.getParent());
  const skin = skeleton.getTransformMatrices(mesh);
  const rootIndex = rootBone?.getIndex() ?? 0;
  const toSkeleton = Matrix.FromArray(skin, rootIndex * 16);

  const count = positions.length / 3;
  const indices = new Float32Array(count * 4), weights = new Float32Array(count * 4);
  const v = new Vector3(), best = new Float32Array(segs.length);
  for (let i = 0; i < count; i++) {
    Vector3.TransformCoordinatesFromFloatsToRef(positions[i * 3] ?? 0, positions[i * 3 + 1] ?? 0, positions[i * 3 + 2] ?? 0, toSkeleton, v);
    for (let s = 0; s < segs.length; s++) {
      const { a, b } = segs[s]!;
      const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
      const len2 = abx * abx + aby * aby + abz * abz || 1e-9;
      const t = Math.max(0, Math.min(1, ((v.x - a.x) * abx + (v.y - a.y) * aby + (v.z - a.z) * abz) / len2));
      const dx = v.x - (a.x + abx * t), dy = v.y - (a.y + aby * t), dz = v.z - (a.z + abz * t);
      const d2 = dx * dx + dy * dy + dz * dz;
      best[s] = 1 / (d2 * d2 + 1e-10);                     // 反距離⁴
    }
    // 取最大嘅 4 個
    const top: number[] = [];
    for (let s = 0; s < segs.length; s++) {
      if (top.length < 4) { top.push(s); continue; }
      let lo = 0; for (let k = 1; k < 4; k++) if (best[top[k]!]! < best[top[lo]!]!) lo = k;
      if (best[s]! > best[top[lo]!]!) top[lo] = s;
    }
    let sum = 0; for (const s of top) sum += best[s]!;
    top.forEach((s, k) => {
      indices[i * 4 + k] = segs[s]!.index;
      weights[i * 4 + k] = best[s]! / sum;
    });
  }
  // 骨架空間位置要寫返入 mesh 空間：新權重下每個頂點跟住自己啲骨，
  // 所以 position 要係「bind pose 下嘅位置」——即係 inverse(各骨蒙皮矩陣) 混合。靜止姿態時各骨蒙皮矩陣
  // 同 Root 嘅一樣（Tripo 匯出嘅 bind pose ＝ 靜止姿態），所以原 position 唔使改。
  mesh.setVerticesData("matricesIndices", indices, false, 4);
  mesh.setVerticesData("matricesWeights", weights, false, 4);
  return count;
}
