# Current cross-agent handoff

Updated: 2026-08-09 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Work branch: `main`
Status: Tower three-region campaign redesign complete and verified; this commit is the durable checkpoint

## Current objective

Treat the redesigned Tower Defense campaign as the new baseline. Penny asked for the flat rectangle,
odd gate/keep placement and overall game configuration to be rethought. That work is complete. The
next agent should start from GitHub `main`, inspect this checkpoint and continue only from a new
request or a real-device feel issue.

## Completed

- Replaced the visible 20×12 slab with one connected 148-cell irregular valley (61.7% of the old
  rectangle): void corners, forest/hill shell, build pads, a central river rift and one real bridge.
- Divided the journey into Wildwood Gate, Sunken Crossing and Bastion Cliff. Instanced foundations
  use three height tiers plus a keep mesa, so the battlefield reads as three places rather than one
  diagonal board.
- Added `core/mapLayout.ts` as the sole authority for cell existence, terrain, path and buildability.
  Render, camera, picking, lighting and economy consume `LAYOUT`; 60 useful adjacent build cells remain.
- Replanned the road as an asymmetric 31-cell/eight-turn route and added `core/route.ts`: enemies use
  246 near-even samples, turn smoothly, emerge on the gate plane and still finish on the goal cell.
- Corrected the spawn gate axes/half-door pivots and put both gateway and keep outside the endpoint
  road cells. The keep is four-sided; its health bar clears the roof; the spawn flash no longer blows
  out half the map.
- Put tower roots, enemies, picking and rings on the real tile surface (`SURFACE_Y = 0.2`). Fixed
  authored pivots, weapon forward direction, fixed ice/poison roofs and evolved three-storey silhouettes.
- Added five acts in `core/chapters.ts` across waves 1–99. HUD, act-opening banner and atmosphere use
  the same chapter data rather than independent labels.
- Reworked late-game economy: HP and bounty curves are independent, all evolution paths retain two
  paid levels, milestone offers use deterministic gameplay RNG, and spending can continue through wave 99.
- Added a versioned 30-day prep-boundary Continue checkpoint. Help/background/WebGL loss pause safely;
  foreground/context restore never auto-resumes; Restart clears build, floating UI and pause residue.
- Fixed mobile pure-tap placement, multi-touch build safety and the 844×390 landscape build dock.
- Batched static GLBs, shared projectile GPU resources, fixed projectile axis and smoothed enemy yaw.
- Added local Playwright ownership and grouped `npm test`; Pages CI now audits/tests Tower before deploy.
- Rebuilt tracked production output: `games/tower/dist/assets/index-Ch4DeV1Y.js`.

## Verification

- `npm test`: PASS after the final source change.
  - core: map 11/11, route 8/8, chapters 7/7, gameplay RNG 5/5, tiles 7/7, balance 10/10.
  - browser: smoke 5/5, assets 8/8, combat 13/13, units 14/14, gateway 10/10,
    look 9/9, map-browser 7/7, flow 18/18; zero browser errors.
  - render: projectile 5/5 and performance 20/20; projectile geometry growth stayed 0.
- Real-browser map witness: exactly 148 ground/foundation instances, void taps blocked, river and bridge
  rendered, both endpoints visible at 844×390, and a pure mobile tap builds in the intended cell.
- Seed-198 99-wave policy probes with the same milestone choices:
  - cap 20: LOST wave 90, 0/20 lives, spent 93,950; last spend wave 73.
  - cap 30: WON all 99, 16/20 lives, spent 139,790; last spend wave 87.
  - unrestricted: WON all 99, 20/20 lives, max penetration 0.73, spent 182,930; last spend wave 99.
- Campaign-peak (229 enemies) draw calls: desktop 1,563; mobile 844×390 733. Software Chrome
  frame times are comparative only, not physical-phone FPS evidence.
- `npm audit --audit-level=high`, syntax checks, handoff check and `git diff --check` are finish gates.

## Changed files

- `.github/workflows/deploy-pages.yml`
- `games/tower/{configs,src,tests,package*.json,index.html,dist}/`
- `docs/ai/{PROJECT_CONTEXT,DECISIONS,HANDOFF}.md`

## Known issues and cautions

- Vite reports one 774.91 kB main-chunk warning. It is not a correctness failure, but future loading
  work may split Three.js/game code without weakening the current asset and browser gates.
- SwiftShader performance numbers are regression comparisons, not a claim of 60 FPS on Penny's phone.
  Any reported physical-device framing, colour or feel issue should be reproduced on that viewport.
- The playthrough harness is one deterministic greedy policy. Preserve the 20/30/unrestricted gradient,
  but do not reshape the map merely to tune a bot.
- Untracked Ashen Rail and Elden Ring II dist assets were outside this scope and deliberately preserved.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, confirm `main`/`origin/main` contains this checkpoint, then
   read ADR-199/200 and inspect the files named above; do not rescan the whole repo.
2. Hard-reload the deployed Tower card if doing visual work. Start from a concrete Penny report or
   physical-device observation; there is no known carry-over correctness blocker in this handoff.
3. Keep one game/task per checkpoint and update this file with the next verified active state.

## Do not redo

- Do not restore a rectangular mask, duplicate `LAYOUT`, or use the smooth movement route as build authority.
- Do not move gate/keep back onto endpoint cells or decouple spawn positions from the shared route anchors.
- Do not re-couple HP and bounty, visual and gameplay RNG, or save live mid-wave entities.
- Do not replace batched terrain/instanced enemies/shared projectile resources with per-object allocation.
