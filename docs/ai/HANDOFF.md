# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `88d7ca5`
Status: Racing Car first-race warm-up hitch removed and browser verified

## Current objective

Move Racing Car from its old pixel/voxel presentation to a genuinely phone-playable,
smooth 3D circuit, including sustained rendering, modern touch controls, interruption
safety, and readable portrait/landscape framing.

## Completed

- Loading now remains visible until the first complete car/world WebGL frame renders.
- Minimap Canvas2D and HUD text/layout initialize behind loading instead of on the first
  active race frame. Start is revealed only after that warm-up and public ready state.
- Added a committed gate proving ready/loading/menu state, pre-drawn minimap pixels, and
  initialized speed/lap HUD. See ADR-041.
- Preserved the 10.35-unit car, smooth 3D tracks, analogue/action controls, independent
  notch safe areas, capture-loss reset, interruption recovery, adaptive DPR, idle GPU,
  and privacy-safe physical-phone report from ADR-032 to ADR-040.

## Changed files

- `games/Racing Car/src/main.js`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md` (ADR-041), `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 45/45 and setup 51/51.
- Startup gate at public ready: loading hidden, menu visible, minimap had 3,227 inked
  pixels, speed `0`, lap `1/3`, and first complete 3D frame already rendered.
- Same headed hardware A/B at 844×390, DPR 3, 4× CPU, five seconds per race:
  - Before: first race 59.16 fps, one long frame, maximum 101.2ms.
  - After: first race 59.96 fps, zero long frames, maximum 31.8ms.
  - After warm cache: races two/three 60.01/60.09 fps, zero long frames, max 18.7ms.
- DPR stayed 1.5 in all A/B rounds; the improvement did not trade away image quality.
- Existing 320×568 and 667×375 layout, safe-area, touch/capture, GPU recovery,
  three-track autopilot, resource, and performance-report gates all remained green.
- No functional browser error; only the pre-existing root favicon 404.

## Known issues and cautions

- Desktop hardware and emulation still cannot certify phone heat, Mobile Safari/Chrome,
  home-indicator ergonomics, gyro feel, or a sustained physical-device lap.
- Performance reports continue to include every active race frame; do not hide real hitches.
- Reports contain no user-agent or device identifier; ask Penny for model/browser separately.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` before reading this file.
2. Penny opens the live game on her phone, drives one full lap, rotates/backgrounds once,
   returns to menu, taps `複製報告`, and pastes the report with phone/browser and heat feel.
3. If physical controls, safe areas, average/minimum pacing, and heat pass, close the
   original objective; otherwise tune against the measured report and exact device symptom.

## Do not redo

- Do not reveal Start before the first complete 3D frame or move minimap/HUD warm-up back
  into the first active frame.
- Do not remove `viewport-fit=cover`, independent safe-area edges, or capture-loss reset.
- Do not infer physical-device success from desktop emulation or software rendering.
- Do not include user-agent, identifiers, credentials, or secrets in the report.
- Do not let performance telemetry alter physics, collision, or track mesh.
- Do not auto-resume after GPU, rotation, visibility, or page interruption.
- Do not restore continuous WebGL rendering in static states.
- Do not amend, rebase, or force-push published `main` history.
