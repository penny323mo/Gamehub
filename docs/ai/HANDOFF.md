# Current cross-agent handoff

Updated: 2026-07-27 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Baseline before this task: `965f6c1`
Status: rivals, ghost, rebuilt touch cluster, and a three-race championship

## Current objective

Racing Car was a time trial with nobody to race. Two features close that gap:
computer rivals (someone else's pace) and a ghost of your own best lap (your own).

## Completed

- `src/driver.js`: the pure-pursuit plus curvature-limit controller, shared by the
  game and the lap gates. Skill levels differ mainly in look-ahead and braking;
  `latG` below about 5.5 measurably makes the controller worse, not safer.
- `src/rivals.js`: up to four rivals running the full `car.js` physics — they drift,
  brake, hit barriers, and get towed when stuck exactly as the player does. Drawn as
  low-poly block cars in one `InstancedMesh` (ADR-045): one draw call, 288 triangles.
- Grid sits ahead of the player so rivals are on screen from the first frame. Lap
  records are unaffected: timing starts at the line.
- Standings: a live position readout in the HUD, and a finish table listing every
  car — finishers by time with a gap to the winner, cars still running below them by
  track position marked 未完成 rather than given a made-up time (ADR-051).
- Setting 對手: 獨自計時 / 2 架 / 4 架, persisted. Zero rivals restores the old
  time-trial exactly and draws nothing. Rivals are a fixed roster — 阿烈/阿藍/阿黃/
  阿綠, each with a bound colour and driving personality — and their coloured dots
  show on the minimap so you can see who is near (ADR-052).
- Two real bugs found building the rivals: per-frame modulo ranked a player on pole
  last (ADR-046), and circular separation could not hold a 4.6 m car apart nose-to-
  tail without also forbidding side-by-side racing (ADR-047).
- `src/ghost.js`: the best lap per track, sampled at 10 Hz as pose plus lap-progress
  and replayed as a translucent car, with a live gap readout — green when up on your
  best, red when down (ADR-048). Only a faster lap overwrites it. Setting 幽靈車
  開/關/清除幽靈, on by default. Scenery only: no physics, no contact.
- A third real bug: the player's accumulated lap position was advanced as a side
  effect of a getter only the HUD called, so standings and the ghost depended on
  whether the HUD had drawn (ADR-049).
- Championship: the three circuits in order, points `(entrants − place + 1) × 2` so
  two or four rivals both work, ties broken by countback, progress persisted so it
  survives closing the page (ADR-053). Starting one locks each round's circuit and
  forces at least two rivals — a points table with only your name is not a table.
- Penny's touch report fixed: the right-hand cluster is now one gesture surface
  (ADR-050). Each of gas/brake/drift used to capture its own pointer, so the first
  button a thumb landed on owned it for the whole press — after braking she could
  not get back on the throttle. Sliding between buttons now works in every
  direction, and holding throttle plus handbrake together still works.

## Changed files

- `games/Racing Car/src/driver.js`, `src/rivals.js`, `src/ghost.js` (all new)
- `games/Racing Car/src/main.js`, `src/settings.js`
- `games/Racing Car/index.html`, `style.css`
- `games/Racing Car/tests/rivals.mjs`, `tests/ghost.mjs` (both new), `tests/run-all.mjs`
- `games/Racing Car/src/input.js`
- `games/Racing Car/src/season.js`, `tests/season.mjs` (both new)
- `docs/ai/DECISIONS.md` (ADR-045 to ADR-053), `docs/ai/HANDOFF.md`, `src/minimap.js`

## Verification

- `npm test` in `games/Racing Car/tests`: race 47/47, setup 59/59, rivals 32/32,
  ghost 25/25, season 20/20. One earlier run-all had setup fail once and pass
  standalone and on re-run — treat setup as mildly flaky under back-to-back browser
  launches, not as reliably green.
- Four rivals finish three laps on every circuit (turbo 110–133s, coast 122–134s,
  touge 120–157s) with 2.6 / 11.0 / 5.7 percent off-road and a spread of times.
- Budget with four rivals: 16 draw calls, 55,115 triangles, inside ADR-044's `<18`
  and `<120k` — the field adds one draw call and 288 triangles.
- Separation: four cars forced onto one point push apart to 4.51 m; two running side
  by side 2.6 m apart stay 2.46 m apart. Ranking gate: a player on pole with four
  rivals ahead reads their progress as 0.012–0.025, not 0.9x.
- Screenshots at 430x900: the grid at lights-out, mid-race passing wheel-to-wheel,
  lap 2 at −2.92 on the recorded best, and the finish table (player 4th of 5).
- Ghost gates cover interpolation, shortest-path yaw across ±pi, clamping outside
  range, only-faster-overwrites, clearing. Two rivals plus ghost: 17 calls, 55,133 tris.
- Penny's exact sequence is a gate: gas, slide to drift, slide to brake, release,
  press brake, back to gas, two fingers on gas plus handbrake, then all up with no
  leftover pointers. Codex's 59 control gates still pass unchanged.

## Known issues and cautions

- Deploy is confirmed on `deploy-pages.yml`; the sandbox network policy blocks
  `penny323mo.github.io`, so only the workflow result is checkable.
- The player starts last by design; moving `GRID` behind the line hides rivals
  behind the camera until they overtake.
- Rivals do not drift for score. Separation is positional only: contact nudges cars
  apart, deliberately not a collision model — no spin or damage transfer.
- Still unanswered from her device: whether steering reads correctly (轉向方向
  反轉 is the escape hatch) and whether the gyro default suits her.
- Commits show as Unverified because this environment has no signing key, not a
  wrong identity. Do not rewrite pushed history, do not change `git config`.

## Exact next action

1. Run `./scripts/agent-context.sh --sync` on the intended branch.
2. Ask Penny whether the rebuilt cluster fixes what she reported, and how the rival
   pace feels. `SKILLS` in `driver.js` is the one knob for pace.
3. Natural next step: per-track championship records, or letting Penny pick the
   season length and which circuits are in it.

## Do not redo

- Do not advance track progress from inside a getter or the HUD (ADR-049), replay
  the ghost frame-by-frame, or let it touch physics (ADR-048).
- Do not flip the steering sign in `car.js` without evidence from Penny's device,
  and do not amend or force-push commits already on `origin/main`.
- Do not give the action buttons individual pointer capture again, and do not
  collapse the pointer-to-action map into a single active action (ADR-050).
- Do not recompose world velocity from post-rotation axes (ADR-025), subtract the
  yaw damping term from `latR` (ADR-026), zero a whole axis on barrier contact, or
  remove the stuck tow (ADR-027) — rivals rely on that tow too.
- 其餘唔好再做嘅嘢逐條列喺 DECISIONS.md ADR-022 至 ADR-053，接手前讀一次。
