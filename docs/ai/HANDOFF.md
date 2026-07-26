# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `12c4d02`
Status: black-screen-flash regression fixed; graphics degradation now converges

## Current objective

Fix the black-screen flash the player reported during play. This was a regression
I introduced: `502ceec` raised the pixel ratio back to 2 and added 4x MSAA to cure
jaggies, pushing post-processing memory well past the configuration that had
already flashed once, and the self-heal only applied on the next page load.

## Completed

- Halved post-processing memory: composer render targets now use
  `UnsignedByteType` instead of EffectComposer's default `HalfFloatType`. The
  scene is already tone-mapped into 0-1 by the renderer, so an 8-bit buffer keeps
  the 0.9 bloom threshold working. Measured 57.6MB -> 28.8MB on a 420x900 DPR-3
  viewport.
- Replaced the fixed DPR cap with a drawing-pixel budget. A DPR of 2 costs very
  different amounts on a small phone versus a large one, so capping DPR did not
  actually cap memory; the budget does, and it is recomputed on resize and
  orientation change.
- Degradation is now immediate and in-session. Previously a context loss only set
  a flag for the next load, so memory pressure persisted and the same match kept
  flashing. `degradeGraphics()` now drops post-processing and lowers the pixel
  ratio right away, then keeps rendering.
- Degradation now converges. The flag became a strike counter: 0 = full quality,
  1 = no MSAA plus a smaller budget, 2+ = no post-processing at all. A boolean
  could not converge, because a device that still could not cope would flash once
  every session forever.
- The recovery path is wrapped in try/catch; it must never be the thing that
  throws, including when the context is lost before the UI exists.

## Changed files

- `games/royale/src/main.js`
- `docs/ai/HANDOFF.md`

## Verification

- Simulated a 420x900 DPR-3 phone: pixel ratio resolved to 2, buffer 840x1800,
  render targets confirmed `UnsignedByteType` with 4x MSAA, estimated
  post-processing memory 28.8MB.
- Dispatched a real `webglcontextlost` event mid-match: post-processing was
  removed immediately, pixel ratio dropped 2 -> 1.5, the strike counter was
  written, the simulation kept stepping, and rendering continued.
- Tier convergence checked by reloading at each strike value: 0 gives MSAA 4 at
  ratio 2, 1 gives MSAA 0 at ratio 1.74, 2 gives no composer.
- Antialiasing preserved: MSAA 4 still present on both targets and retained
  across resize.
- Leak gate held: 115 geometries and 20 textures stable across match/menu cycles.
- Full-match sim and surrender/menu regression pass.
- `./scripts/check-handoff.sh`: PASS.

## Known issues and cautions

- Deploy for `12c4d02` verified success; this task's deploy still needs checking.
- The player should clear `royale_gfx_safe` in localStorage if an earlier flash
  already recorded a strike and they want to re-test full quality.
- Memory figures are estimates from buffer dimensions, not driver readings. If
  flashing persists on device, the next lever is bloom resolution or dropping
  post-processing on that tier.
- Damage-number cache eviction can dispose a texture still used by an in-flight
  sprite. Three re-uploads it on next use, so this is churn, not corruption.
- Live PvP flows (reconnect on both roles, 30s disconnect grace, walkover) remain
  unverified on real hardware; the cloud sandbox cannot reach Supabase.
- Royale graphics auto-downgrade through the `royale_gfx_safe` localStorage flag;
  clear it before testing full-quality rendering paths.
- Earlier cautions still apply: root `progress.md` is historical, some old remote
  branches are not ancestors of `main`, and Pages CI runs the full automated
  lint/test/build sequence only for Ashen Rail.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Read `PROJECT_CONTEXT.md`, this handoff, and ADR-007 to ADR-012 before editing
   anything under `games/royale/`.
3. Ask the player whether the black flash is gone before tuning graphics further;
   only device feedback can close this one.
4. Otherwise pick the next Royale item. Open candidates, none started: a second
   counter relationship to widen the tactical triangle, gauntlet stage variety, a
   first-run tutorial, and the replay system.

## Do not redo

- Do not re-derive the Royale constraints by reading the whole game; ADR-007 to
  ADR-012 already record them, and Git history is the evidence.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not compare performance across separate runs with randomised battles; use
  the in-session alternating A/B pattern.
- Do not restore `HalfFloatType` composer targets or a plain DPR cap; both were
  measured causes of the black-flash regression.
- Do not make graphics self-heal a boolean again; it must escalate so it
  converges.
- Do not reintroduce hardcoded counter card ids in `ai.js`; extend the `bonusVs`
  and tag data instead.
- Do not give the Royale AI economy bonuses or hidden information.
- Do not create a second parallel handoff file or revive root `progress.md`.
- Do not copy chat transcripts or secrets into repository context files.
