import { copyFile, mkdtemp, readdir, rm } from "node:fs/promises";
import { execFile as execFileCallback } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const original = path.join(root, "public/assets/models/original");
const runtime = path.join(root, "public/assets/models/runtime");
const names = {
  "tactical soldier 3d model.glb": "player-soldier.glb",
  "military locomotive 3d model.glb": "train-locomotive.glb",
  "futuristic combat drone 3d model.glb": "enemy-drone.glb",
  "revolver 3d model.glb": "hand-cannon.glb",
};
const cliVersion = "4.2.1";

// The runtime GLBs are checked in because CI must build offline and the deploy
// job must never depend on a package that can rewrite production assets. This
// command is an explicit asset-authoring step. It uses a pinned, ephemeral CLI
// by default; GLTF_TRANSFORM_BIN can point at a locally installed binary for
// fully offline regeneration.
const cli = process.env.GLTF_TRANSFORM_BIN ?? "npx";
const cliPrefix = process.env.GLTF_TRANSFORM_BIN ? [] : ["--yes", `@gltf-transform/cli@${cliVersion}`];
const staged = await mkdtemp(path.join(root, ".asset-optimize-"));

try {
  await readdir(original);
  const jobs = [];
  for (const name of await readdir(original)) {
    const target = names[name];
    if (!target) continue;
    jobs.push({ input: path.join(original, name), output: path.join(staged, target), target });
  }
  if (jobs.length !== Object.keys(names).length) {
    throw new Error(`Expected ${Object.keys(names).length} source models, found ${jobs.length}`);
  }

  for (const job of jobs) {
    try {
      const { stdout, stderr } = await execFile(cli, [
        ...cliPrefix,
        "optimize",
        job.input,
        job.output,
        "--compress",
        "meshopt",
        "--texture-compress",
        "webp",
      ], { cwd: root, maxBuffer: 2 * 1024 * 1024 });
      if (stdout.trim()) console.log(stdout.trim());
      if (stderr.trim()) console.warn(stderr.trim());
    } catch (error) {
      const detail = error && typeof error === "object" && "stderr" in error ? String(error.stderr) : String(error);
      throw new Error(`Unable to optimize ${path.basename(job.input)}: ${detail.trim()}`, { cause: error });
    }
  }

  // Do not touch the checked-in runtime directory until every model has been
  // transformed successfully. A failed authoring run therefore cannot leave
  // a half-old/half-new asset set that only fails on one device.
  for (const job of jobs) {
    await copyFile(job.output, path.join(runtime, job.target));
    console.log(`${path.basename(job.input)} -> ${job.target}`);
  }
} finally {
  await rm(staged, { recursive: true, force: true });
}
