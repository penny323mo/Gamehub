# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `8722b60`
Status: Racing Car mobile safe-area and forced-touch interruption gaps fixed

## Current objective

Move Racing Car from its old pixel/voxel presentation to a genuinely phone-playable,
smooth 3D circuit, including sustained rendering, modern touch controls, interruption
safety, and readable portrait/landscape framing.

## Completed

- Added `viewport-fit=cover` so Mobile Safari exposes real notch/home-indicator insets.
- Split left, right, and bottom control safe areas into independent CSS properties;
  right-side action controls no longer reuse the left notch inset.
- Added dynamic viewport sizing while preserving fixed-inset fallback behavior.
- Gas, brake, drift, and analogue joystick now release on `lostpointercapture` as well
  as pointer up/cancel. Forced capture loss clears input, pointer ownership, held style,
  joystick ARIA value, and knob translation. See ADR-040.
- Preserved the 10.35-unit player car, modern analogue controls, physical-phone report,
  interruption recovery, adaptive DPR, and smooth 3D track from ADR-032 to ADR-039.

## Changed files

- `games/Racing Car/index.html`, `style.css`, `src/input.js`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md` (ADR-040), `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 45/45 and setup 50/50.
- Forced `lostpointercapture` with held gas + full-right joystick reset both values,
  two pointer owners, held classes, ARIA value, and knob transform to neutral.
- Simulated 844×390 landscape safe areas of left 34px, right 52px, bottom 21px:
  joystick and gas retained their independent edge distances; viewport meta included
  `viewport-fit=cover`.
- 320×568 portrait and 667×375 landscape legacy gates remained green, including 44px
  targets, 100px joystick, circular action hierarchy, minimap/speed/control non-overlap.
- Headed hardware-accelerated 844×390 / DPR 3 / 4× CPU run for 12 seconds: average
  53 fps, recent window 60 fps, minimum window 41 fps, Auto DPR 1.25, 13 draw calls,
  53,941 triangles. Six long frames included the initial 500ms warm-up hitch.
- SwiftShader contrast ran 1×/2×/4× CPU at 24/22/21 fps while JS script time stayed
  only 54/68/133ms per six seconds; this identifies software rasterization, not game JS,
  as that lane's bottleneck.
- No functional browser error; only the pre-existing root favicon 404.

## Known issues and cautions

- Desktop hardware and emulation still cannot certify phone heat, Mobile Safari/Chrome,
  home-indicator ergonomics, gyro feel, or a sustained physical-device lap.
- The first shader/model warm-up hitch is deliberately included in report data.
- Reports contain no user-agent or device identifier; ask Penny for model/browser separately.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` before reading this file.
2. Penny opens the live game on her phone, drives one full lap, rotates/backgrounds once,
   returns to menu, taps `複製報告`, and pastes the report with phone/browser and heat feel.
3. If physical controls, safe areas, average/minimum pacing, and heat pass, close the
   original objective; otherwise tune against the measured report and exact device symptom.

## Do not redo

- Do not remove `viewport-fit=cover`, independent safe-area edges, or capture-loss reset.
- Do not infer physical-device success from desktop emulation or software rendering.
- Do not include user-agent, identifiers, credentials, or secrets in the report.
- Do not let performance telemetry alter physics, collision, or track mesh.
- Do not auto-resume after GPU, rotation, visibility, or page interruption.
- Do not restore continuous WebGL rendering in static states.
- Do not amend, rebase, or force-push published `main` history.
