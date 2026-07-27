# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `adac4b5`
Status: Racing Car day/dusk/night environment checkpoint complete

## Current objective

Continue upgrading Racing Car gameplay, visuals, physics, tracks, and time-of-day from the
phone-control checkpoint, with measurable mobile rendering limits.

## Completed

- Added `environment.js`: one gradient shader sky dome, one reusable sun/moon sprite,
  and one deterministic 150-star Points layer. The environment follows camera position
  without rotating with the car, so sky directions remain world-stable.
- Added one shadowless, car-mounted SpotLight. It is disabled in daytime, 95 intensity at
  dusk, and 450 at night; its target remains 30 units ahead of the car through turning.
- Day, dusk, and night now have independent horizon/zenith, sky glow, celestial color /
  size, star opacity, headlight color/intensity, cloud color, and cloud opacity.
- Night readability now reuses existing materials: asphalt, terrain, kerbs, start line,
  guardrails/posts, and trees change color/emissive state without extra track draw calls.
- Track changes and time switching remain render-on-demand in menus and static states.
- Added gates for all three environment states, headlight attachment, night road/rail
  emissive values, and the complete-night renderer budget. See ADR-043.
- Preserved the 6.9-unit car, 28-unit road, floating steering zone, gas slide gestures,
  low-speed torque curve, safe-area/capture-loss rules, and every ADR-042 regression.

## Changed files

- `games/Racing Car/src/environment.js` (new)
- `games/Racing Car/src/main.js`, `settings.js`, `track.js`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/PROJECT_CONTEXT.md`, `DECISIONS.md`, `HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 46/46 and setup 55/55 (101/101).
- All three autopilots still completed three laps; Coast remained at 5% off-road, nine
  wall-hit frames, and zero rescues; Turbo/Touge remained zero-rescue.
- Day renderer: 15 draw calls. Complete night: 16 draw calls and 54,827 triangles, below
  the existing `<18` / `<120k` mobile gates. Four track swaps held at 15 geometries and
  four textures, proving the global environment does not leak per track.
- Headed Chromium visual comparison at 844×390 confirmed distinct readable day, warm
  dusk, and dark star/reflector/headlight night scenes.
- Headed night run at 844×390 for 6.48s: average 60.02 fps, minimum window 60.28 fps,
  zero long frames, maximum 18.7ms, DPR 1. Only the pre-existing favicon 404 appeared.

## Known issues and cautions

- Desktop Chromium cannot certify phone heat, Safari GPU behavior, or sustained physical
  phone night-race performance; retain the in-game privacy-safe report for that evidence.
- Sun/moon direction is world-stable and may be outside the camera on some track headings.
- The single headlight is deliberately shadowless. Do not add many real track lights;
  use instancing or emissive material changes and remeasure the night budget instead.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads this checkpoint.
2. Continue the next coherent gameplay/visual/physics/track phase from ADR-043; do not
   replace the bounded environment with per-object lights.
3. On a future phone run, compare day/night heat and paste the performance report if the
   night shader or headlight causes device-specific pacing changes.

## Do not redo

- Do not restore flat-color-only time presets or remove night road/rail readability.
- Do not exceed the night render budget without measured phone-relevant justification.
- Do not restore the 10.35-unit car, 24-unit road, fixed circle-only steering, or isolated
  gas pointer unless Penny explicitly requests a reversal.
- Do not remove safe-area, capture-loss, warm-up, adaptive-DPR, or interruption recovery.
- Do not infer physical-device success from desktop emulation.
- Do not amend, rebase, or force-push published `main` history.
