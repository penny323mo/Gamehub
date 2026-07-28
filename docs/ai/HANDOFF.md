# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Codex (local), integrating Claude Code cloud commit `ba9861a`
Integration branch: `main`
Original shared baseline: `23211ae`
Status: configurable championship, career records, and arcade-controls checkpoint complete

## Current objective

Continue Racing Car as a mobile-first arcade racer: immediate acceleration, forgiving
controls, player-chosen championships, persistent replay value, and measured phone cost.

## Completed

- Integrated Claude Code's `ba9861a` without dropping either side: the player can choose
  one to three championship circuits, the active schedule persists independently of
  later setting changes, and invalid/empty schedules safely fall back to the circuit pool.
- Finished seasons archive immediately to `racer-season-hist-v1` (newest first, five
  retained). The menu shows champion, round count, player place, points, and a clear action.
- Added the complementary `racer-season-records-v1` career store: completed seasons,
  titles, best/last overall place, and per-track races, wins, and best/last place.
  Clearing an active season does not remove either archive or career summary.
- The start menu now shows schedule picker, recent champions, lifetime championship, and
  selected-track records. Result panels confirm saved rounds and new best/championship.
  Career cards wrap safely inside a 320px viewport.
- Increased launch force from 10,200 to 11,600 while retaining high-speed engine output.
  Deterministic 0–80 km/h improved from 2.98s to 2.77s; track top speed remained 147 km/h.
- Player cars receive bounded countersteer, yaw stabilization, and traction reduction
  after handbrake release. Handbrake initiation stays unassisted. AI sets `assist: false`
  because its own controller already performs line-following and countersteer.
- Added persistent `簡易（自動加速）` / `標準` modes, defaulting to simple. Simple applies
  full auto throttle, gives braking priority, and keeps 72% throttle during handbrake drift.
  The former gas button clearly displays `AUTO / 自動`.
- Gyro full-steer travel is now ±16° instead of ±22°, with fresh-install sensitivity 1.4.
  Tests dispatch real `deviceorientation` events through calibration and verify both signs.
- Preserved ADR-055 from the cloud phase; added ADR-056 and ADR-057 for player-only arcade
  assistance and the separate career-summary lifecycle.

## Changed files

- Cloud phase: `src/season.js`, `src/settings.js`, `src/main.js`, `index.html`, `style.css`,
  `tests/season.mjs`, and handoff/decision docs.
- Local phase: `src/car.js`, `src/driver.js`, `src/input.js`, plus the shared championship,
  UI, tests, project context, and handoff files.

## Verification

- `npm test` in `games/Racing Car/tests`: PASS — race 49/49, setup 76/76,
  rivals 47/47, ghost 29/29, season 49/49 (250/250).
- Combined season gate covers custom one/two/three-circuit schedules, saved schedule resume,
  invalid-list fallback, immediate five-entry archive, clear lifecycle, career totals,
  per-track records, and both history panels through real UI clicks.
- Physics gate: 0–80 km/h 2.77s, track top speed 147 km/h, handbrake slip 88.4°.
  From the same 21.9° slide, neutral steering with assists ended the first second at
  19° slip / 20° rotation versus 46° / 44° without assists.
- All three autopilot circuits completed three laps without rescue; all four rivals
  completed every circuit; the combined night + rivals + ghost + effects budget stayed
  covered by the existing `<18` calls / `<120k` triangles gate.
- Fresh headed Chromium at 844×390: simple mode accelerated without a gas press to
  80 km/h in 2.76s; real pointer hold produced brake `-1`, drift handbrake + `0.72`
  throttle, and release returned to auto throttle `1`.
- Headed inspection at 320×568 and 844×390 confirmed readable schedule/control/career UI,
  horizontal `AUTO / 自動`, and no overlap among steering, actions, HUD, minimap, or track.
  The only browser console error was the known local favicon 404.

## Known issues and cautions

- Desktop synthetic orientation events prove the full browser input path and axis signs,
  but only a physical iPhone can certify permission prompts, hand feel, and sensitivity.
  iOS still requires pressing `開（扭手機）` in Safari/HTTPS.
- A tab kept open across source edits may retain cached ES modules; use a fresh page/context
  when locally comparing a new build. A fresh context loaded the new mode correctly.
- Simple mode is deliberately the default. Do not make gas presses mandatory again unless
  Penny explicitly changes the arcade-first direction.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync` and reads ADR-055 to ADR-057.
2. On a physical phone, try gyro at sensitivity 1.4 / ±16° and report whether it is still
   too slow or too fast; adjust only from that evidence.
3. Continue one coherent gameplay phase, preferably a small career reward, while preserving
   both championship storage lifecycles and the combined mobile render-budget gate.

## Do not redo

- Do not read a running season's schedule from current settings; use its stored `trackIds`.
- Do not move archive creation out of `record()` or let season reset clear archive/career.
- Do not compare career points across seasons; entrant counts change the points scale.
- Do not apply player assists to AI commands; `driver.js` already countersteers.
- Do not split ghost/rivals into extra draws or restore night clouds without remeasurement.
- Do not flip steering/gyro signs without physical-device evidence.
- Do not amend, rebase, or force-push published `main` history.
