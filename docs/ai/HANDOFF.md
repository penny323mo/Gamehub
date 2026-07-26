# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `2e87d4e`
Status: Royale performance pass complete and measured

## Current objective

Profile Royale after a long run of feature work (bloom, MSAA, IBL, per-frame
procedural bone animation, synthesized audio, PvP fx channel) and fix what
measurement actually showed to be expensive, rather than guessing.

## Completed

- Measured first. A 180-unit battle cost 2.24ms CPU per frame, of which bone
  animation was 52%, and 5 seconds of fighting allocated 130 canvases.
- Fixed a real disposal bug: every Three.js `Sprite` shares one module-level
  geometry (verified empirically), so `disposeDeep` on an expiring damage number
  invalidated the GPU buffer for every live sprite. `disposeDeep` now skips
  geometry disposal for sprites.
- Added an LRU texture cache for floating damage/heal numbers keyed by
  text plus colour. Canvas allocations during a 5s fight dropped 130 to 74.
- Added animation LOD: above `animLodMin` entities (default 28), non-attacking
  units animate on alternating frames by id. Attacking units always animate, so
  swings never drop frames, and ordinary matches are unaffected.

## Changed files

- `games/royale/src/game.js`
- `docs/ai/HANDOFF.md`

## Verification

- Controlled A/B in one session on an identical deterministic battle, medians of
  five alternating runs: animation LOD off 1.413ms, on 1.140ms, 19% saved.
  An earlier apparent regression came from comparing separate runs with randomly
  placed armies; that comparison was discarded as invalid.
- Canvas allocation during a fixed 5s battle: 130 before, 74 after.
- Leak gate held: 115 geometries and 20 textures stable across match/menu cycles
  in both Clash and RTS, confirming the `disposeDeep` change leaks nothing.
- Bone animation still drives all units (rig test unchanged), full-match sim and
  surrender/menu regression pass.
- `./scripts/check-handoff.sh`: PASS.

## Known issues and cautions

- Deploy for `2e87d4e` verified success; this task's deploy still needs checking.
- Damage-number cache eviction can dispose a texture still used by an in-flight
  sprite. Three re-uploads it on next use, so this is churn, not corruption, and
  the 96-entry cap makes it rare.
- The 19% figure is CPU-side only, measured under swiftshader. Real phone GPUs
  will shift the balance; re-measure on device before tuning further.
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
3. Pick the next Royale item. Open candidates, none started: a second counter
   relationship to widen the tactical triangle, gauntlet stage variety, a
   first-run tutorial, and the replay system. If performance work continues,
   the remaining known cost is bone animation itself (still the largest CPU
   item) and the unmeasured GPU cost of bloom on real devices.

## Do not redo

- Do not re-derive the Royale constraints by reading the whole game; ADR-007 to
  ADR-012 already record them, and Git history is the evidence.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not compare performance across separate runs with randomised battles; use
  the in-session alternating A/B pattern.
- Do not reintroduce hardcoded counter card ids in `ai.js`; extend the `bonusVs`
  and tag data instead.
- Do not give the Royale AI economy bonuses or hidden information.
- Do not create a second parallel handoff file or revive root `progress.md`.
- Do not copy chat transcripts or secrets into repository context files.
