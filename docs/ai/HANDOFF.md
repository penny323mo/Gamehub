# Current cross-agent handoff

Updated: 2026-08-04 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 深淵之橋 tooltip layout + pointer capture (ADR-128), render interpolation (ADR-127)

## Current objective

Make the MOBA hold up on Penny's actual phone. Not finished; this is a tested checkpoint.

## Completed

### 深淵之橋 the overlap gate excused the panel players actually read (ADR-128)

- ADR-127's shape aimed at my own last change first: `--hud-floor: 202px` was hand-computed from
  `.moba-recall`'s `150 + 44 + 8` with nothing tying them together. Now derived from
  `--recall-bottom` and `--touch` — I had introduced the defect in the round that named it.
- The gate exempted `.moba-tip` for being `pointer-events: none`, but that is the only place the
  game explains an ability. With recall, cast banner, toast and description all up: landscape
  **tip × recall 54×44**, portrait **tip × recallbar 206×20**, short landscape three collisions —
  three of four sizes, none of them visible to the gate. The line is now decoration vs
  information, and the description moved into the centre-bottom row, which is an explicit order
  (toast at `--hud-floor`, description at `--centre-2`), trimmed 95→77 px on 568-tall screens and
  centred in the free band on 320-tall landscape. All four sizes measure clean.
- **A production bug fell out of it**: the skill button called `setPointerCapture` *before*
  recording aim state. It throws `NotFoundError` when a system gesture cancels a pointer mid
  dispatch, `?.` does not guard a throw, and `pointerup` starts with "no state, do nothing" — so
  the ability never fires. Measured both ways: with the guard cd 6.6 / mana 280→260; without it
  cd 0, mana unchanged, **no cast**. Same silent failure as ADR-106/107, third route.

### Earlier checkpoints, in one line each

- On a 120 Hz screen only **25.2%** of frames changed a walking champion's position, in 0.217 m
  jumps — the phone drew 120 fps of 30 Hz motion. Render interpolation took it to **97.5%**,
  largest step 0.054 m. Two limits also disagreed silently: `dt` clamped to 0.25 s while six ticks
  consume 0.2 s, so each stalled frame re-queued 0.05 s into an uncapped pool — **three
  consecutive six-tick frames** after a 3 s stall. `src/pace.js` now owns the rule, is testable in
  plain node, and derives `MAX_FRAME` from `MAX_STEPS * TICK`. ADR-127.
- The combat gate warmed the sim 750 ticks with **no view frame between**, producing three
  fixture defects at once: the FX count read a 25 s backlog (**green for the wrong reason**), the
  target could be killed by an ally inside the measured tick, and an unseen respawn made the view
  run `revive()` — zeroing `lockUntil` — right after the swing started. Spied, not inferred:
  `{once: 1, revive: 1, 前wasAlive: false}`. The warm-up now advances both layers. ADR-126.
- The buy rule was written three times in three different expressions, agreeing **only because
  `canShop` returns `!!c`** — a constant. `sim.buyBlocker` now owns it and returns a reason code;
  the HUD supplies wording. T31 pins the contract across every item × six states. ADR-125.
- Five HUD elements no gate had seen visible: the **settings panel is 341 px tall and does not fit
  568×320** — its × off-screen, a trap with no exit. ADR-124.
- A lost GPU context used to end the match (**請重新開一局**) though the browser hands it back in
  a second; it now resumes. ADR-120. A 20× CPU stall and quality switches needed nothing; audio
  was already correct and is now pinned. ADR-121. Twelve models loaded through one `Promise.all`
  with no retry — now three tries with backoff plus a 再試一次 button. ADR-122.
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered
  the shop button all match. The gates had been sampling the frame right after the start —
  champion in the fountain, no gold — so they now stand it outside with gold first. ADR-119.
- Bot update order alternates each tick: blue first gave blue 33/72, red first 48/72. ADR-113.
  Draw calls peak at 286/342 in a real match, not the synthetic 1311. ADR-114. Portrait spent
  **83.6% of the screen on abyss and water**; the camera now rotates 90° about Y, giving
  **70.1% ground and 36.6 m of lane**, and every control follows. ADR-110.
- `makeRng` used the seed directly as xorshift32 state, so the **first output averaged 0.007**,
  and its first consumer is a bot's reaction time. ADR-109. Attack pacing: level 1 took
  **8.6–12.7 s per minion**, slower than the minions; now 5.1–7.9 s. ADR-108. iPhone SE
  (320×568 / 568×320): the HP panel hung off both edges and overlapped the skill buttons; fixed
  by narrowing content, not moving it. ADR-116.
- Turning and camera follow use `1 - exp(-rate·dt)`; `dt·rate` only holds for small `dt`, so one
  match turned and panned differently at 30 fps than 60. ADR-118.
- Hub launcher: paged groups of four in one footer dock; Gomoku CSS stones; Xiangqi build
  rewrite. `752bcc3`, ADR-102. Fonts self-hosted, ADR-112. Attack FX: `looks.js` holds six basic
  and 24 ability profiles with stable style IDs, and `sim.js` carries champion/ability identity
  through every event. ADR-103. Anywhere shop: buying works everywhere, `atFountain()` is
  healing/recall only — ADR-104 supersedes ADR-088/094/100.
- Touch: an `overflow-y: auto` panel with `touch-action: pan-y` makes iOS read a few pixels of
  drift as a scroll and synthesise no `click` (ADR-106); "what counts as a tap" lives in
  `src/tap.js`. Crowded-fight FX sizing is absolute-time, not a fraction of `life`. ADR-105/107.

## Verification

- `node tests/hub.mjs` → **83/83**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  Outfit is vendored (ADR-112); the suite gates the font and the absence of outside traffic.
- `node games/moba/tests/cache-bust.mjs` → pass; all six entry/resource tokens agree.
- `node games/moba/tests/sim.mjs` → **238/238 pass**, including attack pacing, RNG diffusion, bot
  order and frame pacing. Twelve mirrored matches still finish, no NaN or bridge escape.
- `node games/moba/tests/browser.mjs` → **172/172 pass** at five sizes (bundled Chromium;
  `PW_CHROMIUM` overrides; ~10 min): full matches, FX and framing, the attack swing playing,
  smoothness at 120/60/30 fps, a skill press surviving a failed pointer capture, shop, draw-call
  budget, a drifting tap buys while a 40 px drag does not, ≥44 px, asset retry, context loss.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi source/build files.
- MOBA: `games/moba/{index.html,style.css}`, `src/*.js` (new `pace.js`), `tests/*.mjs`, root
  `index.html`/`launcher.js`, `scripts/moba-bump-cache.mjs`, and `docs/ai/*.md`.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123): recall interrupted by damage, rotating while
  dead, and losing the GPU context with the shop open — all three hold by construction and were
  deliberately left ungated. Xiangqi `npm ci` reports four pre-existing audit findings.
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there
  by path. If missing, run `npm ci` there — nothing else installs it. `games/tower` still fetches
  Inter/Oxanium from Google; its @import is inside the built bundle.
- Cache token covers the whole module graph (ADR-111). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; a partial rename loads a module
  twice under two URLs. `tests/cache-bust.mjs` fails if any local import is out of step.

## Exact next action

1. Sync, then playtest on a physical phone — ideally a 120 Hz one, since ADR-127's whole subject
   is invisible below that. Frame pacing here is bounded by software rasterisation.
2. If pacing is bad, do **not** start with the sigil-geometry merge — ADR-114 measured a real
   match at peak 286/342 draw calls, not 1311. Let the phone name its own bottleneck.

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched/left-aligned final partial page. Do not remove champion/ability
  metadata from sim events, nor merge all skills back into one ring.
- Do not restore fountain-only buying or reuse `canShop()` as the home/recall-location predicate.
