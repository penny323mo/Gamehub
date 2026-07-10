import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const original = path.join(root, "public/assets/models/original");
const runtime = path.join(root, "public/assets/models/runtime");
const names = {
  "tactical soldier 3d model.glb": "player-soldier.glb",
  "military locomotive 3d model.glb": "train-locomotive.glb",
  "futuristic combat drone 3d model.glb": "enemy-drone.glb",
  "revolver 3d model.glb": "hand-cannon.glb"
};

await mkdir(runtime, { recursive: true });
for (const name of await readdir(original)) {
  const target = names[name];
  if (!target) continue;
  await copyFile(path.join(original, name), path.join(runtime, target));
  console.log(`${name} -> ${target}`);
}
