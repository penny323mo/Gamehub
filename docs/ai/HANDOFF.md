# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `0f6b716`
Status: Racing Car mobile GPU/orientation recovery implemented and browser verified

## Current objective

Move Racing Car from its old pixel/voxel presentation to a genuinely phone-playable,
smooth 3D circuit, including sustained rendering, touch controls, interruption safety,
and readable portrait/landscape framing.

## Completed

- Added explicit WebGL context-loss recovery around Three.js resource restoration.
- Context loss now freezes the race, clears input, releases Wake Lock, and displays a
  recovery overlay above menu/finish with disabled Resume/Return and a reload fallback.
- Context restore requests one render-on-demand frame, hides the reload fallback,
  unlocks navigation, and requires the player to press Resume explicitly.
- Rotation during a race now pauses and clears held input before controls move.
- `pagehide` now uses the same progress-preserving pause path.
- Added committed real `WEBGL_lose_context` and orientation lifecycle gates. See ADR-036.

## Changed files

- `games/Racing Car/index.html`, `style.css`, `src/main.js`
- `games/Racing Car/tests/setup.mjs`, `README.md`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md` (ADR-036), `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 45/45 and setup 44/44.
- All three autopilot races still complete three laps; all have zero rescues.
- Before fix, forced context loss left `running=true`, no overlay, and advanced render
  attempts from 169 to 206 in 600ms despite a dead GPU context.
- After fix, real `WEBGL_lose_context` produced `running=false`, `paused=true`, gas off,
  steering zero, Resume/Return disabled, and visible reload fallback.
- Real context restore produced exactly one dirty frame with the complete world still
  present: 14 draw calls and 54,195 triangles. Explicit Resume restarted continuous frames.
- 320×568 headed-browser recovery overlay passed visual inspection; all three actions
  fit, disabled state is visible, and the overlay stays above the game HUD.
- Synthetic orientation event during held gas/steer paused and reset both inputs; the
  reason shown to the player names the orientation change.
- Existing phone gates remain green: 150% car, 320×568/667×375 layout, dual touch,
  adaptive DPR, idle zero-render, pause/Wake Lock, gyro mapping, and no functional errors.

## Known issues and cautions

- Automated mobile lifecycle evidence is now strong, but Penny's physical phone remains
  the authority for sustained heat/FPS, browser-specific recovery, and gyro feel.
- Do not automatically resume after visibility, orientation, or GPU interruption.
- Three.js rebuilds GPU resources; app code owns state, input, overlay, and explicit resume.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` before reading this file.
2. Penny drives one full lap on her phone, rotates once, backgrounds once, resumes, and
   reports heat/FPS plus touch and gyro feel.
3. If that physical run passes, the original phone-playable smooth-3D objective can be
   closed; otherwise use the measured symptom rather than changing physics by guesswork.

## Do not redo

- Do not remove WebGL context-loss pause, reload fallback, or explicit restore Resume.
- Do not leave Resume/Return enabled while the GPU context is unavailable.
- Do not auto-resume after rotation, visibility, or `pagehide`.
- Do not restore continuous WebGL rendering in menu, pause, or finish states.
- Do not render the hidden physics grid or change simulation based on fps.
- Do not exceed phone DPR caps without physical-device measurements.
- Do not amend, rebase, or force-push published `main` history.
