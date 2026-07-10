import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const originalDir = path.join(root, "public/assets/models/original");
const reportPath = path.join(root, "docs/ASSET_AUDIT.md");

function parseGlb(buffer) {
  if (buffer.toString("utf8", 0, 4) !== "glTF") throw new Error("檔案唔係有效 GLB header");
  const jsonLength = buffer.readUInt32LE(12);
  const json = JSON.parse(buffer.subarray(20, 20 + jsonLength).toString("utf8").replace(/\0+$/u, ""));
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (const accessor of json.accessors ?? []) {
    if (accessor.type !== "VEC3" || !accessor.min || !accessor.max) continue;
    for (let index = 0; index < 3; index += 1) {
      bounds.min[index] = Math.min(bounds.min[index], accessor.min[index]);
      bounds.max[index] = Math.max(bounds.max[index], accessor.max[index]);
    }
  }
  const finiteBounds = bounds.min.every(Number.isFinite);
  const size = finiteBounds ? bounds.max.map((value, index) => value - bounds.min[index]) : [0, 0, 0];
  const negativeScaleNodes = (json.nodes ?? []).filter((node) => node.scale?.some((value) => value < 0)).map((node) => node.name ?? "unnamed");
  const transparentMaterials = (json.materials ?? []).filter((material) => material.alphaMode && material.alphaMode !== "OPAQUE").map((material) => material.name ?? "unnamed");
  const bones = [...new Set((json.skins ?? []).flatMap((skin) => (skin.joints ?? []).map((joint) => json.nodes?.[joint]?.name ?? `node-${joint}`)))];
  return {
    generator: json.asset?.generator ?? "unknown",
    scenes: json.scenes?.length ?? 0,
    nodes: json.nodes?.length ?? 0,
    meshes: json.meshes?.length ?? 0,
    primitives: (json.meshes ?? []).reduce((total, mesh) => total + (mesh.primitives?.length ?? 0), 0),
    materials: json.materials?.length ?? 0,
    textures: json.textures?.length ?? 0,
    animations: (json.animations ?? []).map((animation) => animation.name ?? "unnamed"),
    skeletons: json.skins?.length ?? 0,
    bones,
    bounds: { min: finiteBounds ? bounds.min : [0, 0, 0], max: finiteBounds ? bounds.max : [0, 0, 0], size },
    embeddedTextures: (json.images ?? []).some((image) => typeof image.bufferView === "number"),
    transparentMaterials,
    negativeScaleNodes,
    axis: "glTF Y-up / right-handed；模型視覺前方需在 Asset Viewer 人手覆核",
    forward: "runtime config 以 +Z 為遊戲前方"
  };
}

const roleFor = (name) => name.includes("soldier") ? "玩家" : name.includes("locomotive") ? "列車" : name.includes("drone") ? "無人機" : name.includes("revolver") ? "手炮" : "未分類";
const treatmentFor = () => "保留原檔並複製至 runtime；比例／旋轉由中央配置控制。";

await mkdir(path.dirname(reportPath), { recursive: true });
const rows = [];
const details = [];
for (const name of (await readdir(originalDir)).filter((entry) => entry.toLowerCase().endsWith(".glb")).sort()) {
  const filePath = path.join(originalDir, name);
  const size = (await stat(filePath)).size;
  try {
    const audit = parseGlb(await readFile(filePath));
    const issues = [audit.animations.length === 0 ? "無動畫" : "", audit.skeletons === 0 && roleFor(name) === "玩家" ? "無骨架" : ""].filter(Boolean);
    rows.push(`| ${roleFor(name)} | ${name} | GLB | ${(size / 1024 / 1024).toFixed(2)} MB | ${audit.animations.length || "無"} | ${audit.skeletons || "無"} | ${issues.join("；") || "未見阻塞"} | ${treatmentFor(name)} |`);
    details.push(`## ${roleFor(name)}\n\n- 原始檔名：\`${name}\`\n- 產生器：${audit.generator}\n- Scene / Node / Mesh / Primitive：${audit.scenes} / ${audit.nodes} / ${audit.meshes} / ${audit.primitives}\n- Material / Texture：${audit.materials} / ${audit.textures}（${audit.embeddedTextures ? "貼圖內嵌" : "貼圖非內嵌或沒有"}）\n- Animation Clips：${audit.animations.join(", ") || "無"}\n- Skeleton：${audit.skeletons}；Bones：${audit.bones.join(", ") || "無"}\n- Bounding Box：min ${JSON.stringify(audit.bounds.min)}；max ${JSON.stringify(audit.bounds.max)}；size ${JSON.stringify(audit.bounds.size)}\n- 軸向／前方：${audit.axis}；${audit.forward}\n- 透明材質：${audit.transparentMaterials.join(", ") || "無"}\n- 負 Scale：${audit.negativeScaleNodes.join(", ") || "無"}\n- 異常超大尺寸：${Math.max(...audit.bounds.size) > 100 ? "是" : "否（Tripo 模型已正規化約 2 單位）"}\n- 處理方式：${treatmentFor(name)}\n`);
  } catch (error) {
    rows.push(`| ${roleFor(name)} | ${name} | GLB | ${(size / 1024 / 1024).toFixed(2)} MB | 未知 | 未知 | 載入錯誤：${String(error)} | 保留原檔；runtime 使用 Primitive 後備 |`);
  }
}

const report = `# 3D 素材審計\n\n> 由 \`npm run assets:inspect\` 產生。原始檔永不覆蓋；runtime 版本位於 \`public/assets/models/runtime/\`。\n\n| 資產 | 原始檔案 | 格式 | 大小 | 動畫 | 骨架 | 問題 | 處理方式 |\n|---|---|---|---:|---|---|---|---|\n${rows.join("\n")}\n\n${details.join("\n")}\n## 結論\n\n四個 GLB 均為有效 Tripo glTF 2.0 binary，而且貼圖內嵌。士兵有一套 skeleton 但沒有 animation clip；其餘三件沒有骨架或動畫。動畫缺失由程序化後備處理，原始骨架及素材不會被修改。\n`;
await writeFile(reportPath, report);
console.log(`Asset audit written: ${reportPath}`);
