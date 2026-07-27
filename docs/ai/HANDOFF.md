# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `8b39d5d`
Status: racer reworked around drifting — three tracks, corrected vehicle dynamics

## Current objective

Penny asked for drifting to be the point of the racing game, for a proper physics
model behind it, and for three selectable tracks with the layout of the Turbo Racing
mat she photographed. Self-contained under `games/Racing Car/`.

## Completed

- Three tracks in `src/tracks.js`, each a centre-line plus a spline tension:
  渦輪場地 (the mat layout — long straight, fast sweeper, infield S, hairpin),
  海岸環線 (open, high-speed), 山道 (tight, technical). `Track` takes waypoints and
  tension as arguments, so a new track is one entry and nothing else. Menu shows a
  picker; best lap and best drift score are saved per track.
- Drift scoring in `race.js`: angle x speed x time x combo accumulates as *pending*,
  banks when the car straightens for 0.55s, combo steps every 1.6s to 5x, and a
  barrier hit voids whatever has not banked. HUD panel appears only while it matters.
- Three genuine faults in the vehicle model, found by measurement, not by feel:
  - Velocity was recomposed with the post-rotation body axes, so slip angle could
    never develop and the car could not drift at all (ADR-025).
  - The yaw damping term had the wrong sign and was amplifying yaw (ADR-026).
  - The steering envelope allowed roughly ten times the front-wheel angle the tyres
    can use at speed, so any real input went past the tyre peak (ADR-026).
- Barrier response now cancels only motion into the barrier, and a car that is stuck
  for three seconds is towed to the last checkpoint (ADR-027). Before this, one
  nose-in contact ended the race with the car pinned at 0 km/h.
- `CFG` retuned against skidpad and lap measurements: engine 8500 N (about the rear
  axle's grip limit), grip 1.45 front / 1.7 rear, handbrake leaves 45 percent rear
  grip, yaw inertia 1900, `steerSpeedDrop` 2.4.

## Changed files

- `games/Racing Car/src/tracks.js` (new), `src/track.js`, `src/car.js`, `src/race.js`,
  `src/main.js`, `index.html`, `style.css`, `tests/race.mjs`
- `docs/ai/DECISIONS.md` (ADR-025, ADR-026, ADR-027), `docs/ai/HANDOFF.md`

## Verification

- `node tests/race.mjs` in `games/Racing Car`: 45/45 checks, no console errors.
- Autopilot completes three laps on all three tracks with the test driver
  (pure-pursuit plus curvature speed limit): turbo 34.9/35.3/35.3s, 0.1 percent
  off-road, zero barrier contacts, zero tows; coast 36.1s x3, 7.7 percent, 11
  contacts; touge 36.6/36.3/36.3s, clean.
- Physics on a friction plane, so the numbers are the tyre model and not the track:
  112 km/h cruise, handbrake plus lock reaches 88 degrees of slip while holding
  107 km/h, the same input without the handbrake gives 3.9 degrees, countersteer
  settles the car in 12 degrees of rotation against 36 if you keep steering into it.
- Steering direction is checked against a chase camera positioned by main.js's own
  rule and three.js's `lookAt`: right input +0.694 along camera-right, left -0.694.
- Track geometry: all three keep more than 36 units between passes of the circuit,
  which is what stops checkpoints from mis-triggering.
- Four track switches leave geometries at 3 and textures at 1.
- Screenshots: menu with the three-track picker, and mid-drift with the pending
  score, combo and angle bar live.

## Known issues and cautions

- Deploy for this commit must be confirmed on `deploy-pages.yml` after merge.
- Needs Penny on a real device: whether the handbrake entry feels right on touch,
  and whether 88 degrees of slip from a held handbrake is too easy to spin into.
  Everything that governs feel is in the `CFG` block at the top of `car.js`.
- Lift-off mid-drift does not save the car; it needs throttle. That is real
  rear-drive behaviour and the test records it, but it is worth telling a player.
- Physics tests must run on the `PLANE` stub, not the track. Holding lock for a
  second leaves any 24-unit-wide road, and then the measurement is the grass
  penalty rather than the tyres — the first version of these tests got this wrong
  and concluded the handbrake made less slip than no handbrake.
- The test driver in `tests/race.mjs` is a real controller now. If it starts failing
  after a physics change, check whether the car or the driver regressed before
  changing thresholds.
- Royale is finished and needs no work; its device checklist still stands.
- Commits show as Unverified because this environment has no signing key, not a
  wrong identity. Do not rewrite pushed history, do not change `git config`.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. There is no active implementation task. If Penny reports a handling problem,
   reproduce it in `tests/race.mjs` first — every fault above was found that way.
3. Otherwise wait for Penny's next scoped request.

## Do not redo

- Do not recompose the car's world velocity from the post-rotation axes (ADR-025).
- Do not subtract the yaw damping term from `latR`, and do not widen
  `steerSpeedDrop` back toward 0.55 (ADR-026).
- Do not go back to zeroing a whole axis on barrier contact, and do not remove the
  stuck tow (ADR-027).
- Do not narrow the grass runoff in `track.js`; four blocks is what makes an
  excursion recoverable instead of a dead stop against a barrier.
- Do not let the race count a lap at the start line; `nextCp` starts at 1 for that
  reason, and `tests/race.mjs` guards it.
- Do not write verification scripts outside the repository (ADR-022).
- Do not remove the bone-texture disposal in `disposeDeep` (ADR-023) or release
  effect resources from `onEnd` instead of `onDispose` (ADR-024).
- Do not make a gauntlet stage harder with AI elixir, HP, or hidden information.
- Do not read `GAME_RULES` directly inside Royale match code; use `game.rules`.
- Do not dispose sprite geometry, and do not dispose damage-number textures at
  effect end; both are shared.
- Do not amend, rebase, or force-push commits that already exist on `origin/main`.
- Do not create a second handoff file, revive `progress.md`, or copy transcripts
  or secrets into repository context files.
