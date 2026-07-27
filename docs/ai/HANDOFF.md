# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `10d3596`
Status: racer round two — Penny's device feedback addressed, settings and minimap added

## Current objective

Penny played the drift build on her phone and reported six things: steering still
feels mirrored, the start line sits mid-corner, no way to tell where she is on the
track, no settings, the blocks are still coarse, and the car looks like it floats.

## Completed

- Steering: every layer measures correct — physics sign, camera basis, `Input`
  mapping, the touch button ids, and an end-to-end test that presses the real
  buttons and compares against the live camera (holding the left pad increases yaw,
  which is screen-left). What was genuinely wrong was the body roll: the car leaned
  *into* corners like a motorbike, which reads as the car turning the wrong way.
  That sign is fixed. A 轉向方向 正常/反轉 toggle now exists as an escape hatch,
  since Penny's device is the final authority and guessing again would waste a day.
- Start line now sits on the straightest part of each circuit, found by scanning
  curvature over an 85 m window, and is laid across the full road width. All three
  circuits gained a real main straight: turbo 677 m radius, coast 205, touge 447.
- Minimap (`src/minimap.js`): 2D canvas — outline, start marker, car triangle.
  Not a second 3D camera; a render target is expensive on a phone.
- Settings panel: eight body colours, day/dusk/night, steering direction, gyroscope
  steering with a sensitivity slider. All persisted. Gyro uses absolute tilt with a
  calibration zero, picks gamma or beta from `screen.orientation.angle`, has a dead
  zone, and yields to the touch pad when a finger is down. iOS needs the permission
  request inside a real click, so it is wired to the button and cannot be automatic.
- Blocks halved to 0.5 world units with the ground rebuilt as merged top-face quads
  and a noise texture for per-cell shading (ADR-028). Twice the resolution for
  8,928 quads instead of 126,789 cubes; 5 draw calls, 222k triangles.
- Car no longer looks like it floats: it was always at exactly y=0, but nothing
  grounded it visually. Added a contact-shadow plane that tracks position and yaw
  but deliberately not body roll.
- Two more model faults found while chasing an autopilot failure: drive force
  ignored rear traction (ADR-029), and the chase camera lost the car off-screen
  during big drifts (ADR-030).
- coast was redrawn. Its old west end ran a 989 m radius sweeper straight into a
  73 m corner — a 93 percent radius drop, unbrakeable, and the autopilot crashed
  there every single lap. It is now an undulating ellipse with a flat main straight.

## Changed files

- `games/Racing Car/src/`: `track.js` (rewritten), `tracks.js`, `car.js`, `input.js`,
  `main.js`, plus new `settings.js` and `minimap.js`
- `games/Racing Car/`: `index.html`, `style.css`
- `games/Racing Car/tests/`: `race.mjs`, new `setup.mjs`, `run-all.mjs`
- `docs/ai/DECISIONS.md` (ADR-028, ADR-029, ADR-030), `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: race 45/45, setup 25/25, no console errors.
- Autopilot completes three laps on all three circuits: turbo 39.2/36.5/36.6s with
  zero barrier contacts and zero tows, coast 50.3/36.3/38.4s with 90 contacts and
  one tow, touge 38.1/36.7/36.7s clean.
- Geometry measured in-page: `BLOCK` 0.5, 126,789 cells, 8,928 ground quads,
  5 draw calls, 222,385 triangles.
- Settings verified by reading back what they changed: colour reaches the body
  material and persists, day and night differ in exposure, invert flips the
  measured direction of travel exactly (+0.608 to -0.608), gyro maps tilt to steer
  with a dead zone and loses to the touch pad.
- Screenshots at 430x900: menu with the settings panel, standing on the start line
  with the straight ahead and the minimap live, mid-drift with the car held sideways
  in frame and its shadow under it, and the same corner at night.
- Steering chain re-verified end to end: real key and touch events through `Input`
  and the main loop, compared against the live camera basis.

## Known issues and cautions

- Deploy must be confirmed on `deploy-pages.yml` after merge. The sandbox network
  policy blocks `penny323mo.github.io`, so only the workflow result is checkable.
- Still needs Penny: whether the steering now reads correctly (and if not, whether
  the 反轉 toggle fixes it), and whether the gyro sensitivity default suits her.
- The lap test's driver is a simple pure-pursuit controller. It occasionally
  overcooks coast's fastest corners, so the tow check allows up to two per race;
  the real guards are lap completion, time off-road, and barrier contacts.
- Physics tests must run on the `PLANE` stub, not the track — see the comment at
  the top of the T2 block for why.
- Royale is finished and needs no work; its device checklist still stands.
- Commits show as Unverified because this environment has no signing key, not a
  wrong identity. Do not rewrite pushed history, do not change `git config`.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Wait for Penny's verdict on the steering direction. If it still reads mirrored
   on her device with 正常 selected, the answer is not another physics change —
   capture what she sees, because every layer here now measures correct.
3. Otherwise wait for her next scoped request.

## Do not redo

- Do not flip the steering sign in `car.js` again without evidence from Penny's
  device; the invert toggle exists precisely so nobody guesses at it.
- Do not recompose the car's world velocity from post-rotation axes (ADR-025).
- Do not subtract the yaw damping term from `latR`, and do not widen
  `steerSpeedDrop` back toward 0.55 (ADR-026).
- Do not zero a whole axis on barrier contact, and do not remove the stuck tow
  (ADR-027).
- Do not put per-cell colour jitter back into vertex colours — that is what forces
  every cell to be its own quad (ADR-028).
- Do not remove the rear traction cap (ADR-029) or point the chase camera straight
  down the heading (ADR-030).
- Do not narrow the grass runoff in `track.js`, and do not let the race count a
  lap at the start line (`nextCp` starts at 1).
- Do not write verification scripts outside the repository (ADR-022).
- Do not remove the bone-texture disposal in `disposeDeep` (ADR-023) or release
  effect resources from `onEnd` instead of `onDispose` (ADR-024).
- Do not make a gauntlet stage harder with AI elixir, HP, or hidden information.
- Do not read `GAME_RULES` directly inside Royale match code; use `game.rules`.
- Do not dispose sprite geometry or damage-number textures at effect end.
- Do not amend, rebase, or force-push commits that already exist on `origin/main`.
- Do not create a second handoff file, revive `progress.md`, or copy transcripts
  or secrets into repository context files.
