import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await rm(path.join(root, "dist/assets/models/original"), { recursive: true, force: true });
const entry = path.join(root, "dist/index.html");
const html = await readFile(entry, "utf8");
const rewritten = html.replace(
  'src="../shared/js/safe-storage.js"',
  'src="../../shared/js/safe-storage.js"',
);
if (rewritten === html) {
  throw new Error("Ashen Rail dist entry is missing the source storage fallback path");
}
await writeFile(entry, rewritten);
console.log("Removed archival-only original GLBs from deploy output");
