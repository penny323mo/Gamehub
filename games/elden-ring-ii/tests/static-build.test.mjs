import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const gameRoot = new URL("../", import.meta.url);

test("builds a relative-path GitHub Pages entry", async () => {
  const html = await readFile(new URL("dist/index.html", gameRoot), "utf8");
  assert.match(html, /<title>Elden Ring II — Veil of the Hollow Crown<\/title>/);
  assert.match(html, /(?:src|href)="\.\/assets\//);
  assert.doesNotMatch(html, /(?:src|href)="\/assets\//);
});

test("ships the playable models, audio, credits, and metadata", async () => {
  await Promise.all([
    access(new URL("dist/assets/characters/warrior.glb", gameRoot)),
    access(new URL("dist/assets/characters/wizard.glb", gameRoot)),
    access(new URL("dist/assets/characters/ranger.glb", gameRoot)),
    access(new URL("dist/assets/enemies/skeleton-minion.glb", gameRoot)),
    access(new URL("dist/assets/monsters/demon.gltf", gameRoot)),
    access(new URL("dist/assets/audio/music/dream-2-ambience-cc0.m4a", gameRoot)),
    access(new URL("dist/assets/audio/music/mists-in-the-elven-lands-cc0.m4a", gameRoot)),
    access(new URL("dist/assets/licenses/open-game-art-cc0-music.txt", gameRoot)),
    access(new URL("dist/og-game.png", gameRoot)),
  ]);
});

test("keeps nested hosting asset-safe and local-save capable", async () => {
  const [gameClient, audio, progress] = await Promise.all([
    readFile(new URL("src/GameClient.tsx", gameRoot), "utf8"),
    readFile(new URL("src/audio.ts", gameRoot), "utf8"),
    readFile(new URL("src/progress.ts", gameRoot), "utf8"),
  ]);
  assert.match(gameClient, /DefaultLoadingManager\.setURLModifier/);
  assert.match(gameClient, /loaderManager\.setURLModifier/);
  assert.match(audio, /import\.meta\.env\.BASE_URL/);
  assert.match(progress, /window\.localStorage/);
  assert.doesNotMatch(progress, /process\.env/);
});
