import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await rm(path.join(root, "dist/assets/models/original"), { recursive: true, force: true });
console.log("Removed archival-only original GLBs from deploy output");
