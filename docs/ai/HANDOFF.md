# Current cross-agent handoff

Updated: 2026-08-04 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 深淵之橋 render interpolation + frame pacing (ADR-127), combat-gate fixture (ADR-126)

## Current objective

Make the MOBA hold up on Penny's actual phone. The overall production objective is **not
finished**; this handoff is a tested checkpoint, not a claim that everything is final.

## Completed

### 深淵之橋 a 120 Hz screen was being shown 30 Hz motion (ADR-127)

- ADR-126's shape aimed at production code: where does the game advance one layer without the
  other? The main loop. Measured on the real page (this environment renders in software and
  cannot reach these frame rates, so the loop is driven by hand): at 120 fps only **25.2%** of
  frames changed a walking champion's on-screen position, in **0.217 m** jumps. After render
  interpolation: **97.5%**, largest step **0.054 m**; 100% at 60 fps.
- Two limits disagreed silently: `dt` clamped to 0.25 s while six ticks consume 0.2 s, so every
  stalled frame re-queued 0.05 s into `acc`, a pool nothing capped — measured effect was **three
  consecutive six-tick frames** after a 3 s stall, i.e. 0.6 s of match in 50 ms. `MAX_FRAME` is
  now derived from `MAX_STEPS * TICK` so they cannot drift.
- `src/pace.js` owns the rule and is testable in plain node; `view.beforeStep()` owns the
  snapshot the interpolation needs. Interpolation is backward (one tick, 33 ms of latency) and
  snaps on moves over 3 m so blinks do not slide.
- T32 gates the pacing headlessly; `browser.mjs` measures on-screen smoothness at 120/60/30 fps.

### Earlier checkpoints, in one line each

- The combat gate warmed the sim 750 ticks with **no view frame between**, which produced three
  fixture defects at once: the FX count was reading a 25 s backlog (**green for the wrong
  reason**), the chosen target could be killed by an ally inside the measured tick, and an unseen
  respawn made the view run `revive()` — zeroing `lockUntil` — right after the swing started.
  Spied, not inferred: `{once: 1, revive: 1, 前wasAlive: false}`. The warm-up now advances both
  layers. `--hud-floor` also replaced a third hand-tuned percentage on small screens. ADR-126.
- The buy rule was written three times in three different expressions, agreeing **only because
  `canShop` returns `!!c`** — a constant. `sim.buyBlocker` now owns it and returns a reason code;
  the HUD supplies wording. T31 pins the contract across every item × six states. ADR-125.
- Five HUD elements no gate had seen visible: the **settings panel is 341 px tall and does not
  fit 568×320** (its × off-screen, a trap with no exit), `flash()` stacked messages at one spot,
  and percentage-positioned toasts converged on the fixed-pixel bottom HUD. ADR-124.
- A lost GPU context used to end the match (**請重新開一局**) though the browser hands it back
  within a second; it now resumes. ADR-120. A 20× CPU stall and quality switches needed nothing;
  audio was already correct and is now pinned. ADR-121. Twelve models loaded through one
  `Promise.all` with no retry — now three attempts with backoff plus a 再試一次 button. ADR-122.
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered
  the shop button all match. The layout gates had been sampling the frame right after the start —
  champion in the fountain, no gold — so they now stand it outside with gold first. ADR-119.
- Portrait spent **83.6% of the screen on abyss and water**; the camera now rotates 90° about Y,
  giving **70.1% ground and 36.6 m of lane**, and every control follows the rotation. ADR-110.
- Bot update order alternates each tick: blue first gave blue 33/72, red first 48/72. ADR-113.
  Draw calls peak at 286/342 in a real match, not the synthetic 1311. ADR-114.
- `makeRng` used the seed directly as xorshift32 state, so the **first output averaged 0.007** and
  its first consumer is a bot's reaction time. ADR-109. Attack pacing: level 1 took **8.6–12.7 s
  per minion**, slower than the minions; now 5.1–7.9 s. ADR-108.
- iPhone SE (320×568 / 568×320): the HP panel hung off both edges and overlapped the skill
  buttons. Fixed by narrowing content, not moving it. ADR-116.
- Turning and camera follow use `1 - exp(-rate·dt)`: `dt·rate` only holds for small `dt`, so one
  match turned and panned differently at 30 fps than 60. ADR-118.
- Hub launcher: paged groups of four, swipe/arrows/keyboard/dots in one footer dock; Gomoku CSS
  stones; Xiangqi build rewrite. `752bcc3`, ADR-102. Fonts self-hosted, ADR-112.
- Attack FX: `looks.js` holds six basic and 24 ability profiles with stable style IDs; `sim.js`
  carries champion/ability identity through every event. ADR-103. Anywhere shop: buying works
  everywhere, `atFountain()` is healing/recall only — ADR-104 supersedes ADR-088/094/100.
- Touch: an `overflow-y: auto` panel with `touch-action: pan-y` makes iOS read a few pixels of
  drift as a scroll and synthesise no `click` (ADR-106). "What counts as a tap" lives in
  `src/tap.js`; every control uses it, and `browser.mjs` fails under 44 px. ADR-107.
- Crowded-fight FX: self-buff sigils reach full size in 0.22 s of absolute time, not a fraction
  of `life` (a shield sat at ~60%); `dome` is a dim shell with a bright rim. ADR-105.

## Verification

- `node tests/hub.mjs` → **83/83**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  Outfit is vendored (ADR-112); the suite gates the loaded font and the absence of outside
  traffic.
- `node games/moba/tests/cache-bust.mjs` → pass; all six entry/resource tokens agree.
- `node games/moba/tests/sim.mjs` → **238/238 pass**, including the attack-pacing, RNG-diffusion
  and bot-order gates. Twelve mirrored matches still finish, no NaN or bridge escape.
- `node games/moba/tests/browser.mjs` → **170/170 pass** at five sizes (bundled Chromium;
  `PW_CHROMIUM` overrides; ~10 min): full matches, FX and framing, the attack swing actually
  playing, on-screen smoothness at 120/60/30 fps, shop, draw-call budget, a drifting tap buys
  while a 40 px drag does not, every button ≥44 px, asset-retry and context loss, zero errors.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi source/build files.
- MOBA: `games/moba/{index.html,style.css}`, `src/{ai,champions,constants,hud,main,sim,tap}.js`,
  `tests/{browser,cache-bust,sim}.mjs`, root `index.html`/`launcher.js`, and `docs/ai/*.md`.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123): recall interrupted by damage, rotating while
  dead, and losing the GPU context with the shop open. All three hold by construction, so they
  were deliberately left ungated — a gate earns its runtime by guarding something fragile.
- Xiangqi `npm ci` reports four pre-existing audit findings; not auto-fixed (toolchain risk).
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there
  by path. If missing, run `npm ci` there — nothing else installs it.
- `games/tower` still fetches Inter/Oxanium from Google; its @import is inside the built bundle.
- Cache token now covers the whole module graph (ADR-111). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; a partial rename loads a module
  twice under two URLs. `tests/cache-bust.mjs` fails if any local import is out of step.

## Exact next action

1. Sync, then playtest on a physical phone. Frame pacing here is bounded by software
   rasterisation, so it says nothing about real hardware.
2. If pacing is bad, do **not** start with the sigil-geometry merge — ADR-114 measured a real
   match at peak 286/342 draw calls, not 1311. Let the phone name its own bottleneck. Nothing
   else is queued: every axis this environment can measure has been measured.

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched/left-aligned final partial page.
- Do not remove champion/ability metadata from sim events or merge all skills back into one ring.
- Do not restore fountain-only buying or reuse `canShop()` as the home/recall-location predicate.
