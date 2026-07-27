# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `4f93d3d`
Status: Racing Car idle GPU, smallest-phone layout, and 150% car visual implemented and browser verified

## Current objective

Move Racing Car from its old pixel/voxel presentation to a genuinely phone-playable,
smooth 3D circuit, including sustained rendering, touch controls, interruption safety,
and readable portrait/landscape framing.

## Completed

- Changed the main loop from permanent 60 fps WebGL rendering to active-race-only
  animation. Menu, pause, and finish now stop the render loop completely.
- Resize, track selection, paint, and time-of-day changes invalidate the scene and
  request one frame, so sleeping menus remain visually current without sustained GPU use.
- Preserved the final race frame when `race.update` finishes during an active frame.
- Added a renderer-ready signal so tests do not race an on-demand initial frame.
- Added narrow portrait controls for 320–390px screens. At 320×568 all five controls
  fit, the smallest are 46px, and the 44px pause button does not overlap the HUD.
- Added short-landscape positioning. At 667×375 the speed display sits between the
  minimap and gas control with zero overlap.
- Added committed gates for idle rendering, one-frame invalidation, touch target bounds,
  and portrait/landscape HUD overlap. See ADR-034.
- Enlarged the player car from 4.6 to 6.9 visual units (150%) and enlarged its contact
  shadow equally, while preserving the existing physics and collision model. See ADR-035.

## Changed files

- `games/Racing Car/src/main.js`, `style.css`
- `games/Racing Car/tests/setup.mjs`, `lib/harness.mjs`, `README.md`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md` (ADR-034/035), `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 45/45 and setup 41/41.
- All three autopilot races still complete three laps; all have zero rescues.
- Renderer/resource gate remains 54,195 triangles, 14 draw calls, 14 geometries,
  and 4 textures after four track changes.
- Before fix, a five-second paused 3× DPR / coarse-pointer / 4× CPU slowdown browser
  issued 299 renders. After fix, five seconds paused = 0 and five seconds menu = 0.
- Under the same slowdown, active Auto remained 59.99 fps at its 1.5× phone DPR cap.
- Committed idle gate: menu 0 frames, setting change 1 frame, then 0 frames.
- 320×568 browser screenshot visually passed; all controls are inside the viewport,
  smallest touch target 46px, pause/HUD overlap 0.
- 667×375 browser screenshot visually passed; speed/minimap and speed/gas overlap 0.
- The 150% car passed screenshots at both 320×568 and 667×375; target and measured
  local visual length are both 6.9, with the road and controls still readable.
- Real CDP two-touch at 667×375 held gas + right simultaneously: 15.66m movement,
  49 km/h, 1.617rad yaw change; touch end cleared both inputs and held classes.
- Browser console has no functional error; only the pre-existing root favicon 404.

## Known issues and cautions

- Automated slow-device and smallest-layout evidence is now strong, but Penny's
  physical phone remains the authority for sustained heat/FPS and gyro feel.
- Auto may lower render DPR only; never alter physics, collision, or track mesh by fps.
- Sleeping static states depend on explicit invalidation; any future 3D menu animation
  or scene-setting action must call `requestRender` or deliberately restart the loop.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` before reading this file.
2. Penny drives one full lap on her phone in portrait and landscape, backgrounds once,
   resumes, and reports heat/FPS plus touch and gyro feel.
3. Compare Auto with Battery only if the phone gets warm; preserve identical gameplay.

## Do not redo

- Do not restore continuous WebGL rendering in menu, pause, or finish states.
- Do not remove dirty-frame invalidation from resize, track, paint, or time changes.
- Do not render the hidden physics grid or derive mesh resolution from `BLOCK`.
- Do not change simulation or collision based on measured fps.
- Do not auto-resume a backgrounded race or keep wake lock while paused.
- Do not exceed phone DPR caps without physical-device measurements.
- Do not amend, rebase, or force-push published `main` history.
