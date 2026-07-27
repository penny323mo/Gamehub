# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `ee76bec`
Status: Racing Car larger player car, modern mobile controls, and telemetry verified

## Current objective

Move Racing Car from its old pixel/voxel presentation to a genuinely phone-playable,
smooth 3D circuit, including sustained rendering, touch controls, interruption safety,
and readable portrait/landscape framing.

## Completed

- Added a privacy-safe on-device performance report generated from active race frames.
- Report includes active seconds, viewport, quality/DPR, average fps, lowest 3.5-second
  fps window, >34ms frame count, slowest frame, and track id.
- Auto, Sharp, and Battery now all collect fps windows; only Auto may alter DPR.
- Returning to menu exposes the report and a 44px Copy Report button.
- Copy uses the modern Clipboard API, falls back to `execCommand`, and only claims
  success when the browser confirms it; otherwise it tells the player to long-press.
- Added committed report-contract and copy-feedback gates. See ADR-037.
- Enlarged the current 6.9-unit player car by another 50% to 10.35 units (225% of
  the original 4.6-unit model), including its contact shadow. Physics is unchanged.
- Updated the committed visual-scale gate. See ADR-038.
- Replaced the left/right arrows with a MOBA-style analogue joystick: continuous
  horizontal steering, pointer capture, dead zone, release/reset, and gyro arbitration.
- Reworked the right controls into a MOBA-style thumb arc: large gas at bottom-right,
  brake at bottom-left, and drift above. All action controls remain circular and stay
  inside the 320px portrait viewport.
- Added joystick analogue/dead-zone, pointer-capture, release/blur reset, dual-touch,
  responsive hierarchy, and non-overlap gates. See ADR-039.

## Changed files

- `games/Racing Car/index.html`, `style.css`, `src/main.js`, `src/input.js`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md` (ADR-037 to ADR-039), `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 45/45 and setup 48/48.
- Existing three-track physics, 225% car, smooth renderer, dual touch, smallest layouts,
  adaptive DPR, idle GPU, Wake Lock, orientation, and WebGL recovery remain green.
- Headed 430×900 / 3× device DPR / coarse pointer / 4× CPU slowdown generated:
  `23.8s`, Auto DPR `1.50`, average `59 fps`, minimum `59 fps`, two long frames,
  slowest `202ms`, turbo track.
- The generated report appeared after Pause → Return to Menu, wrapped inside the
  settings panel without overflow, and the 44px Copy Report action returned the same text.
- Browser screenshot visually passed; settings, gyro controls, instructions, and Start
  remained usable around the added report.
- Headed 430×900 portrait verified a 108px analogue pad, 92px gas, 60px brake/drift,
  visible 10.35-unit car, and live joystick drag (`aria=82`).
- Headed 844×390 landscape verified a 126px analogue pad, the same right-thumb action
  hierarchy, explicit post-rotation Resume, and zero overlap among controls/speed/minimap.
- No functional browser error; only the pre-existing root favicon 404.

## Known issues and cautions

- This makes physical acceptance measurable but does not fabricate physical evidence.
  Penny must still run it on her phone for heat, Mobile Safari/Chrome, and gyro feel.
- The first shader/warm-up hitch is deliberately included in long-frame/max-frame data.
- Reports contain no user-agent or device identifier; ask Penny for model/browser separately.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` before reading this file.
2. Penny opens the live game, drives one full lap, rotates/backgrounds once, returns to
   menu, taps `複製報告`, and pastes the one-line report with phone/browser and heat feel.
3. If physical average/minimum pacing and controls pass, close the original objective;
   otherwise tune against the measured DPR/fps/long-frame evidence.

## Do not redo

- Do not infer physical-device success from desktop emulation or delete the report gate.
- Do not include user-agent, identifiers, credentials, or secrets in the report.
- Do not let performance telemetry alter physics, collision, or track mesh.
- Do not auto-resume after GPU, rotation, visibility, or page interruption.
- Do not restore continuous WebGL rendering in static states.
- Do not amend, rebase, or force-push published `main` history.
