# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `1d9b8a1`
Status: Racing Car now has computer rivals, standings, and a starting grid

## Current objective

Racing Car was a time trial with nobody to race. The previous checkpoint's own
handoff named an AI or ghost car as the obvious next feature, and the lap tests
already contained a proven driver. This turns that driver into real opponents.

## Completed

- `src/driver.js`: the pure-pursuit plus curvature-limit controller, moved out of
  `tests/race.mjs` so the game and the lap gates run the same code. Three skill
  levels differ mainly in look-ahead and braking, not in cornering appetite —
  dropping `latG` below about 5.5 measurably makes the controller worse, not safer.
- `src/rivals.js`: up to four rivals running the full `car.js` physics. They drift,
  brake, hit barriers, and get towed after three seconds stuck exactly as the player
  does. Drawn as one low-poly block car per instance in a single `InstancedMesh`
  (ADR-045) — the whole field is one draw call and 288 triangles.
- Grid sits ahead of the player so the rivals are on screen from the first frame and
  there is immediately something to chase. Lap records are unaffected because timing
  starts when the player crosses the line.
- Standings: a position readout in the HUD and a 名次 row on the finish screen.
- Setting 對手: 獨自計時 / 2 架 / 4 架, persisted. Zero rivals restores the old
  time-trial exactly and draws nothing.
- Two real bugs found and fixed while building this: per-frame modulo made a player
  on pole rank last (ADR-046), and circular separation could not hold a 4.6 m car
  apart nose-to-tail without also forbidding side-by-side racing (ADR-047).

## Changed files

- `games/Racing Car/src/driver.js`, `src/rivals.js` (both new)
- `games/Racing Car/src/main.js`, `src/settings.js`
- `games/Racing Car/index.html`, `style.css`
- `games/Racing Car/tests/rivals.mjs` (new), `tests/run-all.mjs`
- `docs/ai/DECISIONS.md` (ADR-045 to ADR-047), `docs/ai/HANDOFF.md`

## Verification

- `npm test` in `games/Racing Car/tests`: race 47/47, setup 59/59, rivals 32/32.
  Codex's existing gates were not modified.
- Four rivals finish three laps on every circuit: turbo 110.1/110.6/112.0/132.7s,
  coast 122.1/125.4/127.6/133.9s, touge 120.3/121.9/122.3/156.5s. Off-road time is
  2.6 / 11.0 / 5.7 percent and each circuit produces a spread of finishing times,
  which is what proves the skill levels are actually doing something.
- Budget with four rivals on track: 16 draw calls and 55,115 triangles, inside
  ADR-044's `<18` and `<120k`. The field adds exactly one draw call and 288 triangles.
- Separation: four cars forced onto one point push apart to 4.51 m; two cars running
  side by side 2.6 m apart stay 2.46 m apart instead of being shoved off line.
- Ranking regression gate: a player on pole with four rivals ahead reads their
  progress as 0.012–0.025, not 0.9x.
- Screenshots at 430x900: the four-car grid ahead of the player at lights-out, and
  mid-race with the player up to 2nd and passing wheel-to-wheel.

## Known issues and cautions

- Deploy must be confirmed on `deploy-pages.yml` after merge. The sandbox network
  policy blocks `penny323mo.github.io`, so only the workflow result is checkable.
- The player starts last by design. If Penny wants to start on pole, move `GRID` in
  `rivals.js` behind the line — but then the rivals are behind the camera and
  invisible until they overtake, which is why it is this way round.
- Rivals do not drift for score and do not affect the player's drift banking. They
  are racing opponents, not a scoring mechanic.
- Separation is positional only. It is deliberately not a collision model: contact
  nudges cars apart, it does not transfer spin or damage.
- Still unanswered from Penny's device: whether steering now reads correctly (the
  轉向方向 反轉 toggle is the escape hatch) and whether the gyro default suits her.
- Royale is finished and needs no work; its device checklist still stands.
- Commits show as Unverified because this environment has no signing key, not a
  wrong identity. Do not rewrite pushed history, do not change `git config`.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Ask Penny how the rivals feel before tuning them: pace, aggression, and whether
   four cars is too busy on a phone screen. `SKILLS` in `driver.js` is the one knob.
3. A ghost of the player's own best lap is the natural companion feature and reuses
   the same standings plumbing.

## Do not redo

- Do not give rivals the player's GLB, and do not give each rival its own mesh or
  material — that is what breaks the phone budget (ADR-045).
- Do not compute track position with a per-frame modulo (ADR-046).
- Do not replace body-box separation with a single radius (ADR-047).
- Do not duplicate the driver back into the tests; the shared copy is the point.
- Do not restore per-frame overlapping thick skid segments or dotted opaque smoke,
  allocate a mesh per particle, or leave effects alive across restarts (ADR-044).
- Do not shrink the 156px landscape / 118px narrow steering disc without Penny asking.
- Do not remove safe-area, capture-loss, warm-up, adaptive-DPR, or interruption
  recovery, and do not infer physical-device success from desktop emulation.
- Do not flip the steering sign in `car.js` without evidence from Penny's device.
- Do not recompose the car's world velocity from post-rotation axes (ADR-025), or
  subtract the yaw damping term from `latR` (ADR-026).
- Do not zero a whole axis on barrier contact, and do not remove the stuck tow
  (ADR-027) — rivals now rely on the same rule.
- Do not remove the rear traction cap (ADR-029) or point the chase camera straight
  down the heading (ADR-030).
- Do not write verification scripts outside the repository (ADR-022).
- Do not amend, rebase, or force-push commits that already exist on `origin/main`.
- Do not create a second handoff file or copy transcripts or secrets into context files.
