# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `4259879`
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
- Start line sits on the straightest part of each circuit (curvature scanned over an
  85 m window) and is laid across the full road width. All three gained a real main
  straight: turbo 677 m radius, coast 282, touge 447.
- Minimap (`src/minimap.js`): 2D canvas — outline, start marker, car triangle.
  Not a second 3D camera; a render target is expensive on a phone.
- Settings panel: eight body colours, day/dusk/night, steering direction, gyroscope
  steering with a sensitivity slider. All persisted. Gyro uses absolute tilt with a
  calibration zero, picks gamma or beta from `screen.orientation.angle`, has a dead
  zone, and yields to the touch pad when a finger is down. iOS needs the permission
  request inside a real click, so it is wired to the button and cannot be automatic.
- Blocks are a quarter of their original size. Ground is merged top-face quads with
  a noise texture for per-cell shading (ADR-028); barriers merge into runs (ADR-031).
  Four times the resolution for 86k triangles in 5 draw calls — less than it cost at
  half the resolution before merging.
- Car no longer looks like it floats: it was always at exactly y=0, but nothing
  grounded it visually. Added a contact-shadow plane that tracks position and yaw
  but deliberately not body roll.
- Two more model faults found while chasing an autopilot failure: drive force
  ignored rear traction (ADR-029), and the chase camera lost the car off-screen
  during big drifts (ADR-030).
- coast was redrawn twice. Its first west end ran a 989 m sweeper into a 73 m corner
  — unbrakeable, crashed every lap. The ellipse that replaced it had 38 m ends,
  which contradicts its own billing as the fast flowing circuit. It is now a rounded
  rectangle: 55 m minimum radius, 79 m at the tenth percentile, flat main straight.

## Changed files

- `games/Racing Car/src/`: `track.js` (rewritten), `tracks.js`, `car.js`, `input.js`,
  `main.js`, plus new `settings.js` and `minimap.js`
- `games/Racing Car/`: `index.html`, `style.css`
- `games/Racing Car/tests/`: `race.mjs`, new `setup.mjs`, `run-all.mjs`
- `docs/ai/DECISIONS.md` (ADR-028 to ADR-031), `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: race 45/45, setup 25/25, no console errors.
- Autopilot completes three clean laps on all three circuits with zero tows:
  turbo 38.7/36.3/36.3s and touge 38.1/36.7/36.7s with no barrier contact at all,
  coast 41.3/40.6/40.3s with 13 contacts.
- Geometry measured in-page: `BLOCK` 0.25, 504,260 cells, 19,594 ground quads,
  2,364 barrier runs, 5 draw calls, 86,121 triangles.
- Settings verified by reading back what they changed: colour reaches the body
  material and persists, day and night differ in exposure, invert flips the
  measured direction of travel exactly (+0.608 to -0.608), gyro maps tilt to steer
  with a dead zone and loses to the touch pad.
- Screenshots at 430x900: menu with the settings panel, standing on the start line
  with the straight ahead and the minimap live, mid-drift with the car held sideways
  in frame and its shadow under it, and the same corner at night.

## Known issues and cautions

- Deploy must be confirmed on `deploy-pages.yml` after merge. The sandbox network
  policy blocks `penny323mo.github.io`, so only the workflow result is checkable.
- Still needs Penny: whether the steering now reads correctly (and if not, whether
  the 反轉 toggle fixes it), and whether the gyro sensitivity default suits her.
- The lap test's driver is a simple pure-pursuit controller with a curvature speed
  limit. When it starts failing after a physics change, check whether the car or the
  driver regressed — twice now the driver was the one at fault.
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
- Do not put per-cell colour jitter back into vertex colours, and do not un-merge
  the barrier runs — both are what let `BLOCK` be 0.25 (ADR-028, ADR-031).
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
