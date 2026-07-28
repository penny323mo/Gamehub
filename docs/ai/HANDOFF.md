# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `cbccc9e`
Status: Racing Car now has synthesised audio; new `audio.mjs` suite added

## Current objective

Close the largest remaining feel gap: the racer had no sound at all. Add engine, tyre,
wind, impact, and event audio without shipping assets or spending render budget.

## Completed

- Added `src/audio.js`: a WebAudio synthesiser with no audio files. Engine is two
  detuned sawtooths plus a sub sine through a throttle-driven lowpass, with five gear
  bands so acceleration has shape; tyre noise is band-passed and gated on slip angle,
  speed, handbrake, and surface; wind is a low-passed noise bed above 8 m/s; wall
  impacts and the eight `race.js` events get short synthesised sounds.
- Continuous nodes are built once and driven per frame with `setTargetAtTime`. Nothing
  is allocated per frame, so sound cannot introduce GC stutter into the driving loop.
- Audio exists only during a race. `startRace`/`stopRace`/`pauseRace`/`resumeRace`/
  `toMenu`/`showFinish` and the visibility handler all drive it, and the context is
  suspended off-race so no oscillator burns battery on a static screen.
- Fixed a defect my own test caught: the post-race suspend is deferred 220 ms, and a
  quick 再跑一次 would land inside that window, so the late suspend silenced the entire
  next race. `startRace` now cancels the pending timer and the timer re-checks state.
- 設定 gained a 音效 開/關 row, persisted in `racer-audio`. With audio off no
  `AudioContext` is constructed at all; the first pointerdown/keydown unlocks it for iOS.
- Added ADR-059 and `tests/audio.mjs` (32 assertions), registered in `run-all.mjs`.

## Changed files

- `games/Racing Car/src/audio.js` (new), `src/main.js`, `index.html`
- `games/Racing Car/tests/audio.mjs` (new), `tests/run-all.mjs`
- `docs/ai/DECISIONS.md`, `HANDOFF.md`

## Verification

- `node run-all.mjs`: PASS — race 49/49, setup 76/76, rivals 47/47, ghost 29/29,
  season 53/53, audio 32/32 (286/286).
- Audio suite measures parameters and node state rather than listening: gear bands drop
  pitch at each change, throttle raises both gain and filter cutoff, tyre noise stays
  silent while straight or slow and opens on slip/handbrake, wind is clamped, no context
  is built while audio is off, leaving a race silences and suspends within 350 ms,
  a quick restart stays running, all eight race events plus wall impact fire, and a
  context factory that throws or returns null leaves the game playable and silent.
- Headed Chromium at 390×844: the 音效 row renders in 設定 with no panel overflow
  (scrollWidth == clientWidth == 355).
- Audio adds no draw calls or triangles, so the ADR-044/054 render gates are untouched.

## Known issues and cautions

- Nobody has actually listened to this on a phone. Balance, harshness of the sawtooth
  engine at high gears, and whether the tyre bed is too loud need Penny's ears.
- Still unconfirmed on her device: gyro at 1.4 / ±16°, simple mode feel, the rebuilt
  touch cluster, steering direction, and rival pace.
- 再跑一次 mid-championship is a practice run and does not score (ADR-058). If she wants
  it to re-run the scheduled circuit instead, that is a UI decision — ask first.
- The sandbox network policy blocks `penny323mo.github.io`; only the deploy workflow
  result is checkable from here, never the live page.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads ADR-058 to ADR-059.
2. Get phone evidence for audio balance, gyro sensitivity, and simple mode before tuning
   any of them further; every one is a taste judgement desktop cannot settle.
3. Continue one coherent gameplay phase while preserving the championship storage
   lifecycles, the combined render-budget gate, and the off-race silence rule.

## Do not redo

- Do not add audio files or allocate audio nodes per frame; do not let sound keep
  playing off-race or leave the context running on menus (ADR-059).
- Do not credit a championship round without checking the circuit raced (ADR-058).
- Do not read a running season's schedule from current settings; use its stored `trackIds`.
- Do not move archive creation out of `record()` or let season reset clear archive/career.
- Do not apply player assists to AI commands; `driver.js` already countersteers.
- Do not split ghost/rivals into extra draws or restore night clouds without remeasurement.
- Do not advance progress from a getter/HUD, replay ghost frame-by-frame, or give action
  buttons individual pointer capture (ADR-048 to ADR-050).
- Do not flip steering/gyro signs without physical-device evidence.
- Do not amend, rebase, or force-push published `main` history.
