# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `6518ff4`
Status: new game shipped — Block Racer, a Minecraft-style time-trial racer

## Current objective

Build a simple racing game around the sports-car GLB Penny supplied, with a
Minecraft-style blocky track to keep the art direction cheap and consistent.
Self-contained under `games/racer/`, registered in the hub carousel.

## Completed

- `games/racer/`: `track.js` (voxel world), `car.js` (arcade physics), `race.js`
  (laps, checkpoints, timing, best-lap save), `input.js` (keyboard + touch),
  `main.js` (renderer, chase camera, HUD), plus `index.html` and `style.css`.
- Car model compressed from 4.5MB to 221KB: Draco geometry plus a 1024px WebP
  basecolor. It loads through the same vendored loaders Royale uses.
- Track is generated, not hand-placed: a closed Catmull-Rom spline is sampled and
  stamped into a block grid — road, dashed centre line, red-white kerbs — then a
  multi-source BFS grows a four-block grass runoff and a barrier ring beyond it.
  Every block is one instance of a single `InstancedMesh`, so the whole world is
  one draw call.
- Race rules: three laps, twelve ordered checkpoints so cutting the course does not
  count, countdown, per-lap timing, wrong-way warning, best lap in `localStorage`.
- Controls: arrows/WASD plus space to drift on desktop; a left/right pad and a
  gas/brake/drift cluster on touch.
- Registered in `launcher.js` between Royale and Ashen Rail.
- `games/racer/tests/` with the same harness pattern as Royale (ADR-022).

## Changed files

- `games/racer/**` (new game, assets, vendor, tests)
- `launcher.js`, `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/racer/tests`: 15/15 checks pass.
- Autopilot completes three laps in 38.3 / 48.2 / 48.2 seconds with zero frames
  stuck in a barrier and 1.9 percent of time off-road.
- Physics: full throttle reaches 180 km/h on tarmac, braking drops it to 50, and
  the same throttle on grass tops out at 19.
- Resource gate: three race restarts leave geometries at 3 and textures at 1.
- Hub: the carousel shows 方塊賽車 and direct navigation to the game loads it.
- Screenshots at 420x900: menu, and the car mid-track with kerbs, grass, barriers,
  HUD, and touch pad all correct.
- Two real bugs were found and fixed during the build, both by tests rather than by
  eye: the runoff was only two blocks wide so any excursion pinned the car against
  a barrier and killed its speed, and the race counted a lap at the start line so a
  three-lap race finished after two.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge.
- Needs Penny on a real device: touch pad ergonomics, whether the chase camera sits
  well in portrait, and whether the car feels too fast or too slippery. Top speed
  and grip live in one `CFG` block at the top of `car.js`.
- There is no opponent and no collision physics beyond the barriers; it is a time
  trial. An AI or ghost car is the obvious next feature.
- The track is a single circuit defined by `WAYPOINTS` in `track.js`. Adding a
  second track means another waypoint list, nothing more.
- Royale is finished and needs no work; its device checklist still stands.
- Commits show as Unverified because this environment has no signing key, not a
  wrong identity. Do not rewrite pushed history, do not change `git config`.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. There is no active implementation task. If Penny reports a racer issue, start by
   reproducing it in `games/racer/tests/race.mjs`.
3. Otherwise wait for Penny's next scoped request.

## Do not redo

- Do not narrow the grass runoff in `track.js`; four blocks is what makes an
  excursion recoverable instead of a dead stop against a barrier.
- Do not let the race count a lap at the start line; `nextCp` starts at 1 for that
  reason, and `tests/race.mjs` guards it.
- Do not write verification scripts outside the repository (ADR-022).
- Do not remove the bone-texture disposal in `disposeDeep` (ADR-023) or release
  effect resources from `onEnd` instead of `onDispose` (ADR-024).
- Do not make a gauntlet stage harder with AI elixir, HP, or hidden information.
- Do not read `GAME_RULES` directly inside Royale match code; use `game.rules`.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not amend, rebase, or force-push commits that already exist on `origin/main`.
- Do not create a second handoff file, revive `progress.md`, or copy transcripts
  or secrets into repository context files.
