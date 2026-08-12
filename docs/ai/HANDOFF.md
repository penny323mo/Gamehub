# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing Car ghost pass and Hub return-path audit
Integration branch: `main`
Work branch: `main`
Status: Racing Car plus the Hub-wide return contract are verified on `main`;
receiving agent must sync GitHub first.

## Current objective

Keep Racing Car moving toward a production-ready mobile arcade racer: responsive
but bounded bicycle physics, readable high-speed/drift feedback, believable
ground contact, route-specific roadside depth, a recognizable replay ghost,
stable frame pacing and real browser evidence. Keep every game safely returnable
to the Hub from its visible mobile UI.

## Completed

- Continuous Catmull-Rom road ribbon remains backed by 240 cached X/Z samples;
  collision, checkpoints, progress and AI stay on the established X/Z grid.
- Closed crest/valley waves use `1.78/0.75/0.28`, with track multipliers turbo
  **1.28**, coast **1.14**, touge **1.40**. Touge-rev surface span is
  **7.639m**, maximum pitch **0.04883rad**, and the height/pitch seam is exact.
- `Car.update()` applies bounded `CFG.gradeGravity=4.6` grade load from the
  synced track pitch; `Car.pos.y` remains zero and no height enters collision or
  progress. Render-only suspension/heave/camera cues remain bounded and reset.
- Existing road anchors (player, rivals, ghost, offroad pose, guardrails, trees,
  kerbs, shadow and effects) use the surface helpers. Speed cue cap is **0.82**,
  wheel motion and effects stay in existing low-cost passes.
- Roadside terrain now has deterministic route-specific rolling ground in one
  **96×96** mesh: `terrainHillAmplitude` turbo **0.95**, coast **0.82**, touge
  **1.15**. `TERRAIN_ROAD_CLEARANCE=0.4m` and bank-aware blending keep actual
  interpolated terrain triangles below the curved road; it remains render-only.
- Replay ghost now clones the normalized/painted player GLB as
  `player-ghost-car`; each mesh gets an independent transparent material (opacity
  ≤ **0.32**, depth-write off) and the root follows road y/pitch/bank. RivalField
  only instances the four physical rivals; ghost meshes also own cloned geometry
  and replay-driven wheel spin/steering. The old ghost methods are no-op API
  compatibility and do not draw a block ghost.
- Six tracks (three reverse), player assists/simple auto-throttle, ABS, recovery,
  rivals, season and lifecycle/context-loss contracts remain intact.
- Hub return contract is now complete for all 13 games. Ashen Rail exposes a Hub
  link even when portrait mode's rotate gate is covering the game UI; Elden Ring II
  has a persistent `← HUB` link in the top bar. Both source trees and tracked
  production `dist/` outputs were rebuilt.

## Changed files

- `games/Racing Car/src/track.js` — deterministic rolling terrain, bank-aware underlay and
  triangle-safe mesh heights.
- `games/Racing Car/src/main.js` — player-GLB ghost clone, independent geometry, transparent
  materials, replay wheel motion and surface pose.
- `games/Racing Car/src/rivals.js` — four-rival-only instanced field; remove block ghost pass.
- `games/Racing Car/tests/setup.mjs`, `games/Racing Car/tests/ghost.mjs` — banked-edge,
  interpolated-terrain and animated original-model ghost gates.
- `games/ashen-rail/index.html`, `games/ashen-rail/src/styles/main.css`,
  `games/ashen-rail/dist/` — portrait-safe Hub return link and rebuilt deploy output.
- `games/elden-ring-ii/src/GameClient.tsx`, `games/elden-ring-ii/src/styles.css`,
  `games/elden-ring-ii/dist/` — persistent Hub link and rebuilt deploy output.
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md` (ADR-298/299/300/301),
  `docs/ai/HANDOFF.md`.

## Verification

- `race.mjs` — **136/136**; top **148 km/h**, 0–80 **2.40s**, drift/ABS/wall/
  recovery/roll/suspension/grade gates green, zero browser errors.
- `setup.mjs` — **157/157**; banked edge and real triangle crossover gates green,
  rolling terrain **1.15**, tree anchors **130/130** max error **0**, world
  **16 calls / 73,317 tris**, zero browser errors.
- `rivals.mjs` — **61/61**; four rivals remain one instanced draw.
- `ghost.mjs` — **33/33**; original player model, independent geometry, replay wheel
  motion, transparent materials and no physics influence; busiest night + four rivals
  + ghost + effects = **19 calls / 105,187 tris**,
  under **20 calls / 120k tris**.
- `season.mjs` — **55/55**; `audio.mjs` — **33/33**. Final aggregate `run-all.mjs`
  passed all six suites in one run; the bounded readiness retry stayed unused.
- `node tests/hub.mjs` — **100/100** across 320×568, 440×956, 844×390 and
  1280×800; all 13 launcher links valid and browser errors zero.
- `node tests/hub-home.mjs` — **3/3 contract checks**; all 13 games have a visible
  return route and all 13 clicks reached the repository root `/index.html`.
- `games/ashen-rail`: `npm test` **15/15**, `npm run lint` PASS, `npm run build` PASS.
- `games/elden-ring-ii`: `npm test` **17/17** (typecheck/build/static/map/motion).
- `node --check` on changed JS/tests and `git diff --check` — PASS.
- Real Chromium smoke: **844×390** mobile and **1200×700** desktop; road ribbon,
  rolling ground, kerbs, guardrails, car contact, controls and independent transparent
  ghost clone loaded with console **0 errors**. Screenshots:
  `/tmp/racing-mobile2-terrain-clearance.png`, `/tmp/racing-desktop2-terrain-clearance.png`.

## Known issues and cautions

- Keep terrain as one 96×96 mesh with the bank-aware under-road clearance and query cache at
  240 samples. Do not feed
  `terrainYAt()` or `renderY` into physics, collision, route, progress or AI.
- Keep road harmonics `1.78/0.75/0.28`, grade load, suspension/heave, camera lean and
  speed cue bounded; rerun physical gates and real screenshots before increasing them.
- The rigid GLB has no wheel bones/clips; re-profile `wheel-motion.js` if the asset changes.
  Any new `car.glb` must also be checked for ghost clone material count, silhouette and budget.
- Aggregate `run-all.mjs` may need `RACER_TEST_SETTLE_MS=5000` on pressured Macs;
  readiness-only retry is bounded and does not hide assertion failures.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`; read this handoff and ADR-298–302.
2. If further Racing changes are made, run the named suites plus aggregate and real
   mobile/desktop browser smoke again; if changing Hub navigation, rerun
   `node tests/hub.mjs` and `node tests/hub-home.mjs`.
3. Preserve the Hub return contract: a visible route must work from loading,
   portrait/rotate overlays, menu, pause and result states where that game has them.
4. Run `./scripts/check-handoff.sh`, commit code and handoff together, push the
   authorized checkpoint, and verify `git ls-remote origin refs/heads/main`.

## Do not redo

- Do not restore per-frame curve allocations, reintroduce the low-poly block ghost,
  add draw-call-heavy terrain passes, force-push, or rewrite shared `main` history.
- Do not use a relative link that only works from source `index.html` when the
  tracked deployed entry is nested under `games/*/dist/`; validate the click in
  an HTTP browser at the actual deployed path.
