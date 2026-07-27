# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `0406570`
Status: Racing Car smooth 3D renderer and mobile input hardening implemented and browser verified

## Current objective

Move Racing Car from its pixel/voxel presentation to a genuinely phone-playable,
smooth 3D circuit while preserving the already-correct drift physics, lap rules,
track safety, and configurable steering direction.

## Completed

- Replaced the player-visible grid renderer with a continuous curve-based circuit:
  textured asphalt ribbon, clean alternating kerbs, checker start line, smooth grass,
  two-level metal tube guardrails, instanced supports, and 130 trackside trees.
- Kept the existing 0.25-unit grid behind the scenes for road/wall lookup, rescue,
  lap checkpoints, and tests. Physics and visuals no longer share a resolution knob.
- Removed the dashed centre road line and Minecraft branding. The hub and game now
  identify the title as `Racing Car 3D` and describe a smooth 3D circuit.
- Replaced lit block clouds with distant unlit soft clouds, avoiding dark overhead
  shapes and preserving one instanced draw call.
- Capped coarse-pointer devices at 1.5 render DPR to reduce sustained phone GPU load.
- Added landscape-specific chase-camera framing. It moves closer/lower and reduces
  vertical FOV so the car remains readable in a short 900x430 viewport.
- Hardened touch controls with per-button pointer capture. Gas and steering remain
  active if a thumb slides slightly, two pointers work together, and blur clears all
  held input to prevent a stuck throttle after app switching.
- Updated the committed setup suite to guard the new renderer and real two-pointer
  DOM path rather than treating smaller voxel cells as visual completion.

## Changed files

- `games/Racing Car/src/track.js`, `main.js`, `input.js`, `settings.js`
- `games/Racing Car/index.html`
- `games/Racing Car/tests/` documentation, harness labels, setup checks, package label
- `launcher.js`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md` (ADR-032), `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 45/45, setup 28/28.
- All three autopilot runs still complete three laps. Turbo and touge have zero
  barrier contact; coast has 13 contacts; all three have zero rescues.
- Renderer gate on touge: `smooth-ribbon`, 568 curve segments, 316 rail posts,
  130 trees, 54,195 triangles, 14 draw calls.
- Observed coast in the interactive browser at 59,073 triangles. The old turbo
  renderer baseline was 86,121 triangles, so the richer scene uses less geometry.
- Four track switches stayed flat at 14 geometries and 4 textures.
- Real DOM two-pointer test held gas and right steering simultaneously; blur released
  both. Interactive hold moved the car 18.85 m, changed yaw 1.615 rad, and left zero
  held buttons after release.
- Portrait 430x900 and landscape 900x430 passed visual inspection. Landscape keeps
  all controls inside the viewport, has zero horizontal overflow, and uses FOV 58.
- Direct HTTP browser smoke had zero console errors or warnings.
- `node --check` for changed runtime/test modules and `git diff --check`: PASS.

## Known issues and cautions

- Automated mobile viewports and pointer events pass, but Penny's physical phone is
  still the authority for sustained FPS, steering feel, and gyro sensitivity.
- The physical phone should test both portrait and landscape for at least one lap.
- Do not remove the hidden grid: car collision and lap safety deliberately still use it.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` before reading this file.
2. Penny drives one lap on her phone in portrait and landscape, first with normal
   steering and then gyro if desired, and reports FPS/heat plus control feel.
3. If the physical device remains smooth, continue with environment depth or car
   feedback only when Penny requests it; do not return to voxel rendering.

## Do not redo

- Do not render the physics grid or derive visual resolution from `BLOCK`.
- Do not replace tube rails with collision cubes or per-cell barrier meshes.
- Do not raise phone DPR above 1.5 without a measured device budget.
- Do not flip steering physics again without physical-device evidence; use the
  existing normal/reverse setting.
- Do not remove pointer capture or blur cleanup from multi-touch controls.
- Do not amend, rebase, or force-push published `main` history.
