# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `e9b073b`
Status: Racing Car phone quality and session lifecycle implemented and browser verified

## Current objective

Move Racing Car from its old pixel/voxel presentation to a genuinely phone-playable,
smooth 3D circuit, including sustained rendering, touch controls, interruption safety,
and readable portrait/landscape framing.

## Completed

- Added Auto, Sharp, and Battery quality modes to the existing persisted settings.
  Coarse-pointer caps are 1.5×, 1.75×, and 1× DPR respectively.
- Auto quality measures only active, visible race frames. A 3.5-second window below
  43 fps drops DPR by 0.25; raising it requires three windows above 57 fps. Physics,
  track mesh, lap timing, and controls never change with quality.
- Added an always-reachable pause button and a touch-sized pause overlay with Resume
  and Return to Menu. Pause freezes simulation, clears every held pointer/key, and
  keeps the current lap state visible behind the overlay.
- `visibilitychange` pauses with an explicit interruption reason. It never silently
  resumes when the player returns from a call, lock screen, or another app.
- Added Screen Wake Lock lifecycle on supported browsers: acquire during an active
  race, invalidate late asynchronous requests and release on pause/menu/finish,
  reacquire only after explicit resume.
- Resume resets the frame timestamp so time spent paused cannot become a large physics
  step. Starting a new Auto race returns to the device-safe DPR ceiling before sampling.
- Refactored `Input.reset` as the single cleanup path for blur, pause, menu, and finish.
- Expanded the committed setup suite to cover quality caps/persistence/selection,
  pause/resume/menu state, input cleanup, and wake-lock acquire/release.

## Changed files

- `games/Racing Car/index.html`, `style.css`
- `games/Racing Car/src/main.js`, `input.js`, `settings.js`
- `games/Racing Car/tests/setup.mjs`, `README.md`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md` (ADR-033), `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 45/45 and setup 35/35;
  deterministic Wake Lock lifecycle recorded exactly two releases (stale request
  plus active lock on pause).
- All three autopilot races still finish three laps; no track needs a rescue.
- Renderer/resource gate remains flat at 14 geometries and 4 textures across four
  track changes. Smooth-renderer gate remains 54,195 triangles and 14 draw calls.
- Quality pure caps passed for a simulated 3× DPR phone: Auto 1.5, Sharp 1.75,
  Battery 1. Persisted Auto leaves exactly one selected UI button and a live DPR note.
- DOM two-pointer gas + steer and blur cleanup still pass after the input refactor.
- Pause test proved `running=false`, `paused=true`, throttle false, steering zero,
  visible overlay and preserved reason. Resume reversed the state and hid the overlay.
- In interactive Chromium, wake lock was active after Resume and false after Pause;
  the committed deterministic mock also verifies late-request invalidation.
- Portrait 430x900 and landscape 900x430 pause overlays passed visual inspection.
  Landscape buttons stayed inside the viewport with zero horizontal overflow.
- Direct HTTP browser smoke had no functional console error; only root favicon 404.
- Changed JS/MJS `node --check`, `git diff --check`, and handoff check: PASS.

## Known issues and cautions

- Automated mobile viewports, pointer events, adaptive policy, and lifecycle pass.
  Penny's physical phone remains the authority for sustained heat/FPS and gyro feel.
- Wake Lock is progressive enhancement; unsupported or denied requests fail quietly.
- Auto controls render DPR only. Do not make low FPS alter physics timestep or track mesh.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` before reading this file.
2. Penny drives one complete lap on her phone in portrait and landscape, backgrounds
   the game once, resumes, and reports heat/FPS plus steering and gyro feel.
3. Use the on-screen quality mode to compare Auto with Battery if the phone gets warm;
   preserve the same gameplay and continuous 3D scene in both modes.

## Do not redo

- Do not render the hidden physics grid or derive mesh resolution from `BLOCK`.
- Do not change simulation, collision, or AI driver based on measured fps.
- Do not auto-resume a backgrounded race.
- Do not keep wake lock while paused or in menus.
- Do not remove pointer capture, `Input.reset`, or pause input cleanup.
- Do not exceed the phone DPR caps without physical-device measurements.
- Do not amend, rebase, or force-push published `main` history.
