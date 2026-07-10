import "./styles/main.css";
import "@babylonjs/loaders/glTF";
import { ArcRotateCamera, Color3, Color4, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, SceneLoader, StandardMaterial, Vector3 } from "@babylonjs/core";
import { MODEL_ASSETS, type AssetId } from "./config/assets";

const canvas = document.querySelector<HTMLCanvasElement>("#viewer-canvas"); if (!canvas) throw new Error("Viewer canvas missing");
const engine = new Engine(canvas, true); const scene = new Scene(engine); scene.clearColor = new Color4(0.08, 0.06, 0.05, 1);
const camera = new ArcRotateCamera("viewer-camera", -Math.PI / 2, Math.PI / 2.5, 13, new Vector3(0, 1.25, 0), scene); camera.attachControl(canvas, true); camera.lowerRadiusLimit = 5; camera.upperRadiusLimit = 35;
new HemisphericLight("viewer-fill", new Vector3(0, 1, 0), scene).intensity = 1.1; const sun = new DirectionalLight("viewer-sun", new Vector3(-1, -2, 1), scene); sun.intensity = 2;
const groundMaterial = new StandardMaterial("viewer-ground", scene); groundMaterial.diffuseColor = new Color3(0.18, 0.14, 0.11); const ground = MeshBuilder.CreateGround("viewer-ground", { width: 34, height: 18 }, scene); ground.material = groundMaterial;
const ids: AssetId[] = ["player", "train", "weapon", "drone"]; const positions = [-6.2, -2.2, 2.5, 6.2]; const names: Record<AssetId, string> = { player: "玩家", train: "列車", weapon: "手炮", drone: "無人機" };
const messages: string[] = [];
for (let index = 0; index < ids.length; index += 1) {
  const id = ids[index]; if (!id) continue; const config = MODEL_ASSETS[id];
  try { const result = await SceneLoader.ImportMeshAsync(null, "", new URL(config.url, window.location.href).href, scene); const root = result.meshes[0]; if (!root) throw new Error("no root"); root.position.set(positions[index] ?? 0, id === "train" ? 2.7 : id === "weapon" ? 1.5 : 1.05, 0); root.rotation = Vector3.FromArray(config.rotation); root.scaling.setAll(id === "train" ? 4.4 : id === "weapon" ? 1.65 : id === "player" ? 1.4 : 1.15); messages.push(`${names[id]} ✓`); }
  catch (error) { messages.push(`${names[id]} ✗ ${String(error)}`); }
}
const label = document.querySelector("#viewer-label"); if (label) label.textContent = `Asset Viewer · ${messages.join(" · ")}`;
engine.runRenderLoop(() => scene.render()); window.addEventListener("resize", () => engine.resize());
