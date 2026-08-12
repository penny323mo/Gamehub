# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing Car rolling terrain and original-model ghost pass
Integration branch: `main`
Work branch: `main`
Status: Racing Car source, tests, headed smoke and docs are ready for the next
verified `main` checkpoint; receiving agent must sync GitHub first.

## Current objective

Keep Racing Car moving toward a production-ready mobile arcade racer: responsive
but bounded bicycle physics, readable high-speed/drift feedback, believable
ground contact, route-specific roadside depth, a recognizable replay ghost,
stable frame pacing and real browser evidence.

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
- Roadside terrain now has deterministic route-specific rolling ground in the
  same 32×32 mesh: `terrainHillAmplitude` turbo **0.95**, coast **0.82**, touge
  **1.15**. It is render-only and fades back to the road blend.
- Replay ghost now clones the normalized/painted player GLB as
  `player-ghost-car`; each mesh gets an independent transparent material (opacity
  ≤ **0.32**, depth-write off) and the root follows road y/pitch/bank. RivalField
  only instances the four physical rivals; the old ghost methods are no-op API
  compatibility and do not draw a block ghost.
- Six tracks (three reverse), player assists/simple auto-throttle, ABS, recovery,
  rivals, season and lifecycle/context-loss contracts remain intact.

## Changed files

- `games/Racing Car/src/track.js` — deterministic rolling terrain metadata and mesh heights.
- `games/Racing Car/src/main.js` — player-GLB ghost clone, transparent materials and surface pose.
- `games/Racing Car/src/rivals.js` — four-rival-only instanced field; remove block ghost pass.
- `games/Racing Car/tests/setup.mjs`, `games/Racing Car/tests/ghost.mjs` — terrain and
  original-model ghost gates.
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md` (ADR-298/299),
  `docs/ai/HANDOFF.md`.

## Verification

- `race.mjs` — **136/136**; top **148 km/h**, 0–80 **2.40s**, drift/ABS/wall/
  recovery/roll/suspension/grade gates green, zero browser errors.
- `setup.mjs` — **155/155**; rolling terrain **1.15**, tree anchors **130/130**
  max error **0**, world **16 calls / 56,933 tris**, zero browser errors.
- `rivals.mjs` — **61/61**; four rivals remain one instanced draw.
- `ghost.mjs` — **32/32**; original player model, transparent materials, no physics
  influence; busiest night + four rivals + ghost + effects = **19 calls / ≤88,865 tris**,
  under **20 calls / 120k tris**.
- `season.mjs` — **55/55**; `audio.mjs` — **33/33**. Aggregate `run-all.mjs`
  passed all six suites (setup/season needed the runner's bounded readiness-only retry once).
- `node --check` on changed JS/tests and `git diff --check` — PASS.
- Real headed root-served smoke: **844×390** mobile and **1200×700** desktop; road
  ribbon, rolling ground, kerbs, guardrails, car contact, controls and transparent
  ghost clone loaded with console **0 errors**.

## Known issues and cautions

- Keep terrain as one 32×32 mesh and query cache at 240 samples. Do not feed
  `terrainYAt()` or `renderY` into physics, collision, route, progress or AI.
- Keep road harmonics `1.78/0.75/0.28`, grade load, suspension/heave, camera lean and
  speed cue bounded; rerun physical gates and real screenshots before increasing them.
- The rigid GLB has no wheel bones/clips; re-profile `wheel-motion.js` if the asset changes.
  Any new `car.glb` must also be checked for ghost clone material count, silhouette and budget.
- Aggregate `run-all.mjs` may need `RACER_TEST_SETTLE_MS=5000` on pressured Macs;
  readiness-only retry is bounded and does not hide assertion failures.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`; read this handoff and ADR-298/299.
2. If further Racing changes are made, run the named suites plus aggregate and headed
   mobile/desktop smoke again.
3. Run `./scripts/check-handoff.sh`, commit code and handoff together, push the
   authorized checkpoint, and verify `git ls-remote origin refs/heads/main`.

## Do not redo

- Do not restore per-frame curve allocations, reintroduce the low-poly block ghost,
  add draw-call-heavy terrain passes, force-push, or rewrite shared `main` history.
