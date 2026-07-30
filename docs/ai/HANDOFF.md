# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Baseline before this task: `2dec492`
Status: turn-in, drift hold, simple-mode throttle, wall grazes and rival pace all remeasured

## Current objective

Close out phone-only complaints (orientation, hub card, steering reach), then raise playability.

## Completed

- 畫面方向 is a player setting (`racer-orient`, default `portrait`) with no "automatic" value
  (ADR-074); iOS reports stale sizes so nothing measures once — `applyOrientation()` re-runs on
  every signal, plus a `ResizeObserver` (ADR-075). Stick: `dx` clamped alone, 20/s (ADR-076).
- Turn-in (ADR-079, reverting ADR-077's expo curve): the stick is unshaped and the front axle
  gains up to 70% grip while the throttle is not negative, the handbrake is off and slip is under
  8°. Half-stick `t45` 1.91/2.02/2.17s → 1.25/1.38/1.70s at 14/22/30 m/s.
- Drifts hold (ADR-078): past 15° of slip under throttle the rear axle loses grip, tapering off
  by 46°. A handbrake entry used to collapse in 0.81s with the countersteer gain making no
  difference; the gain now separates.
- 簡易模式 (the default) no longer pins the throttle at 1.0: `1 - 0.4·|steer|` (ADR-080). Full
  throttle leaves only 51% of the rear's lateral grip, 60% leaves 85%; one 90° corner at 28 m/s
  took 107 m of travel, now 72 m — on a 15 m road, wall versus corner.
- Grazing a wall no longer ends the race (ADR-081): a 10° contact took 108 km/h to 0. Only the
  along-wall component is scaled and the heading turns toward the tangent; it now bottoms at
  34 km/h and is back to 70 in three seconds.
- Rivals now use the car (ADR-082): `latG` 6.0/6.2/6.4 → 7.2/7.5/7.8 against a measured 1.25 g;
  three-lap times 95–112s → 88–107s with wall, off-road and rescue counts still zero. An
  auto-brake for simple mode is rejected — the delayed novice model is a feedback loop, fit for
  spotting disasters but not for tuning constants.
- The player gets a spin recovery too (ADR-083): `Car.unspin()` turns the heading toward the
  track at ≤1.5 rad/s while below 5 m/s and more than 80° out, holding until within 25°. A 150°
  spin was unrecoverable for a simple-mode player in 25s; now it comes back in 1.47s.
- Drifting is a cornering technique (ADR-085). The old "keep 70% of speed" floor divided by the
  straight-line terminal speed (186 km/h), which no corner reaches, so any real drift failed it.
  Against the same-radius grip speed: 0.30 held 1.7s on a 147 m radius at 69%; 0.38 holds 13.8s
  on 52 m at 94%. Power oversteer is suspended 1.2s after a wall hit (graze 44 → 94 km/h).
- The drift gauge reads the real band (ADR-086): it mapped 0–60° for an older car, so a held 31°
  drift showed 52% and "hot" sat past where power oversteer ends. It now runs from
  `driftPowerLo` to `driftPowerOut` read out of `CFG` — the third constant found stale after
  `latG` and the combo step, all from a value written down twice.
- The combo ladder is reachable (ADR-084): the step was 1.6s while the best measured single
  drift held 1.56s, so 2× was 0.04s out of reach. Now 1.2s; 3×/4×/5× still need linked corners.
- Hub carousel on phones: the card fills 90% of a 440px viewport (was 64%); neighbours wholly
  visible or wholly hidden. Also fixed: a rotated frame taking the narrow-portrait pad layout,
  `max-height: 88vh` → 743px in a rotated frame, a stray `rotatedOverride`.

## Changed files

- `games/Racing Car/src/`: `settings.js`, `main.js`, `input.js`, `car.js`; plus `style.css`,
  `index.html`, `tests/setup.mjs`, `tests/season.mjs`, `tests/race.mjs`
- Hub: `style.css`, `launcher.js`, `tests/hub.mjs`; docs: `DECISIONS.md`, `HANDOFF.md`

## Verification

- Suites: race 124/124, setup 125/125, rivals 61/61, ghost 29/29, season 55/55,
  audio 32/32 (426/426); `run-all` green. AI 0–0.3% off-road on all six circuits. Hub 33/33.
- Orientation gates: 打直/打橫 give the right frame at 390×844 and persist, the joystick axes
  swap, the canvas fills the frame, `orientationchange` never pauses, a stubbed stale
  `visualViewport` recovers within a second, and resizing `#game-root` with no event still works.
- Gates: full stick reach at 0/20/40/60° in 0.10s; half-stick `t45` ≤1.45/1.55/1.80s; simple-mode
  lift 0.6 at full lock, −1 braking; drift held ≥1.3s at 25–40°, keeps ≥80% of same-radius grip
  speed on a <90 m radius for >5s, reaches combo 2, and the gauge follows `CFG`; a 150° spin
  recovers in 2s; a 10° graze stays >20 km/h; hub neighbours hidden and card unclipped.

## Remaining release gates

- Penny drives the new turn-in and auto-lift: half-stick biting, corners makeable, drift
  holding. Levers if short: `turnInBoost`, `AUTO_LIFT`, drift-speed floor. Gyro unconfirmed.
- Penny checks the new braking (straight stays straight, corner rotates) and audio balance,
  then taps 複製報告 and pastes the one-line report.

## Known issues and cautions

- 打橫 mode is a CSS transform: anything reading pointer coordinates must go through
  `Input.localPoint()`. Inside `#game-root` use `--fw`/`--fh`, never `vw`/`vh`. Hub cards are
  sized in `%` of the carousel frame — its outer padding eats 42px a side, so `vw` overflows.
- ADR-062's rejected attempts stay rejected; ADR-065 supersedes only its Turbo decision. Brake
  force is demand, not delivered; any change must retune `SKILLS.brakeA` too.
- A drift holds only with the throttle down, and only outside the 1.2s window after a wall hit.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-074 to ADR-084.
2. Penny sends the copied phone report plus judgements: which 畫面方向 she settled on and
   whether it behaves, gyro direction and sensitivity, audio balance. Tune only those.

## Do not redo

- Do not reintroduce a portrait pause, a rotate prompt, an "automatic" third orientation
  value, or code that changes 畫面方向 for the player (ADR-074, superseding 072 and 073).
- Do not read raw `clientX/clientY` for in-game positioning; use `Input.localPoint()`.
- Do not decide the orientation from one measurement or size `#game-root` from JS pixels; do not
  clamp the steering stick into a circle or smooth an analogue stick (ADR-075, ADR-076).
- Do not put a curve back on the stick, raise `gripFront` unconditionally, or lower
  `steerSpeedDrop` below 2.4 — turn-in belongs to the 8° front-grip window (ADR-079).
- Do not lengthen a drift with yaw damping (ADR-078), and do not compare drift speed against
  the straight-line terminal speed — the denominator is the same-radius grip speed (ADR-085).
- Do not give `unspin` a single threshold — entry 80°, exit 25° (ADR-083) — and do not raise the
  combo step back to 1.6s: the best measured drift holds 1.56s (ADR-084).
- Do not give simple mode an automatic brake, and do not tune constants against a novice model
  with reaction delay in the loop — it is a feedback loop, not an instrument (ADR-082).
- Do not add device identifiers to reports, raise body roll past 3.5°, or roll the contact
  shadow (ADR-063).
- Do not merge the gyro-only direction switch into shared touch direction (ADR-064), flip gyro
  signs or tune sensitivity/audio without device evidence, retry ADR-062's four rejected Turbo
  tweaks, fold spin recovery into the control law, or make the gyro map linear (ADR-066).
- Do not add a rival difficulty setting (ADR-067) or raise `latG` past 7.8 (ADR-082).
- Do not charge braking to one axle's friction circle, raise `loadTransfer` above 0.2, or change
  braking without retuning the AI (ADR-068).
- Do not let aids steal steering while the player holds opposite lock (ADR-069), but do not
  remove the yaw-damping floor either — that is what made the car bistable.
- Do not move the tyre peak back to 11°, raise the drift threshold and tyre peak
  independently, or turn the drift refund back into a fixed force (ADR-070).
- Do not model the handbrake as a grip multiplier alone, or raise `steerRate` without
  re-checking drift overshoot (ADR-071). Do not add audio files or per-frame audio nodes.
- Do not amend, rebase, or force-push published `main` history.
