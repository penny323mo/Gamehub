# Current cross-agent handoff

Updated: 2026-08-04 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 深淵之橋 economy + champion balance (ADR-130), select/result screens (ADR-129)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.
## Completed

### 深淵之橋 gold sitting in the bank, and a 66-point champion spread (ADR-130)

- ADR-129's shape ("a limit that never binds") turned on the sim. The shutdown cap of 420 gold
  never fires (peak 360) — a safety rail doing its job. The economy is where it paid: sampled
  every second across twelve matches, **74.4% of match time a champion holds enough gold to buy
  something (avg 1122) while the build list forbids it**; 880 carried on average. A full build
  costs 8502, a champion earns 4191 a match, best of 72 was 7654 — **0/72 could complete one**.
  "Save for the big item" assumed the saving ends in a purchase; the match ends first.
  `nextPurchase` now scans to the next affordable item **within the same build** — same final
  set, order adapts. Idle time 74.4% → 64.0%, gold carried 880 → 577.
- Checking that for fairness damage instead found **blue winning 40/40**. Mirrored lineups are
  22/18 and 17/23, so sides and update order are fair; swapping the two default trios flips it to
  red 40/40 — a **composition** imbalance. Per champion against one baseline, 24 matches with
  sides alternated: longshot 83, dawnkeeper 83, ironward 50 (baseline), emberwake 42, ironhulk 25,
  duskblade 17. Win rate tracked **range**; melee speed (6.5–6.9) barely beat ranged (6.3–6.6).
  `Sim`'s default lineup is a test fixture — real matches shuffle, so the spread is what reaches
  players, not that matchup.
- One measured pass, each change tied to a mechanism: melee speed → 7.1/7.4/7.1; longshot range
  10.4 → 9.6; dawnkeeper armour 30/3.9 → 22/3.1; duskblade's only mobility 8 s → 5 s (highest
  ability damage in the game, lowest win rate — it could hurt, it could not get out). Spread
  **66 → 46 points**. Stopped there: at 24 matches the interval is ±17 points, and re-running at 8
  moved the baseline champion itself 46% → 63%. `tests/balance.mjs` records it and stays
  **outside the fast suite** — 48 matches take 126 s, and it refuses to judge below 24.

### Earlier checkpoints, in one line each

- **Every layout gate began after `#pick-go`**, so the first screen had no coverage: on short
  screens the pick grid's visible height was smaller than one card (78 vs 228 at 568×320) —
  **zero complete cards**, because `max-height: 74vh` never binds under flex shrink. Cards now
  compact under 480 px tall. Two probe misreadings on the way — cards below the fold were scrolled
  out, not lost, and counting after scrolling flatters the answer. ADR-129.
- The overlap gate exempted `.moba-tip` for being `pointer-events: none`, though it is the only
  place the game explains an ability: **tip × recall 54×44**, **× recallbar 206×20**, three
  collisions on short landscape — none visible to the gate. The line is now decoration vs
  information. A production bug fell out: the skill button called `setPointerCapture` **before**
  recording aim state, and a throw there (`?.` does not guard a throw) leaves `pointerup` with
  nothing to do — the ability never fires. ADR-128.
- On a 120 Hz screen only **25.2%** of frames changed a walking champion's position, in 0.217 m
  jumps — 120 fps of 30 Hz motion. Render interpolation took it to **97.5%**. Two limits also
  disagreed silently: `dt` clamped to 0.25 s while six ticks consume 0.2 s. `src/pace.js` owns the
  rule and derives `MAX_FRAME` from `MAX_STEPS * TICK`. ADR-127.
- The combat gate warmed the sim 750 ticks with **no view frame between**, producing three
  fixture defects at once — the FX count read a 25 s backlog (**green for the wrong reason**), the
  target could die inside the tick, and an unseen respawn ran `revive()` over the swing. ADR-126.
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`**;
  `sim.buyBlocker` owns it now and T31 pins the contract. ADR-125.
- A lost GPU context used to end the match (**請重新開一局**) though the browser hands it back in
  a second; it now resumes. ADR-120. Audio was already correct and is pinned. ADR-121. Twelve
  models loaded through one `Promise.all` with no retry — now three tries plus a 再試一次 button.
  ADR-122.
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered
  the shop button all match; the gates had been sampling the opening frame, champion in the
  fountain with no gold. ADR-119.
- Bot update order alternates each tick: blue first gave blue 33/72, red first 48/72. ADR-113.
  Draw calls peak at 286/342, not 1311. ADR-114. Portrait spent **83.6% on abyss and water**; the
  camera rotates 90° about Y for **70.1% ground**. ADR-110. `makeRng` used the seed directly as
  xorshift32 state, so the **first output averaged 0.007**, and its first consumer is a bot's
  reaction time. ADR-109. Level-1 attack pacing was **8.6–12.7 s per minion**, now 5.1–7.9.
  ADR-108. iPhone SE: the HP panel hung off both edges (ADR-116); the **settings panel did not
  fit 568×320**. ADR-124.
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118). Hub launcher paged dock, Gomoku CSS
  stones, Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX
  profiles (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100).
- iOS: an `overflow-y: auto` panel with `touch-action: pan-y` reads drift as a scroll and
  synthesises no `click`; "what counts as a tap" lives in `src/tap.js`. ADR-105/106/107.

## Verification

- `node tests/hub.mjs` → **83/83**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
- `node games/moba/tests/cache-bust.mjs` → pass. `node games/moba/tests/sim.mjs` → **238/238**.
  `node games/moba/tests/balance.mjs 24` → all six inside 20–85% (318 s; not a fast gate).
- `node games/moba/tests/browser.mjs` → **185/185 pass** at five sizes (bundled Chromium;
  `PW_CHROMIUM` overrides; ~10 min): champion select and post-match layout, full matches, FX and
  framing, the attack swing playing, smoothness at 120/60/30 fps, a skill press surviving a failed
  pointer capture, shop, draw calls, a drifting tap buys while a 40 px drag does not, ≥44 px.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi source/build files.
- MOBA: `games/moba/{index.html,style.css}`, `src/*.js` (new `pace.js`), `tests/*.mjs` (new
  `balance.mjs`), root `index.html`/`launcher.js`, `scripts/*`, `docs/ai/*.md`.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123/129/130): recall interrupted by damage, rotating
  while dead, GPU context lost with the shop open, `.hidden` swallowing taps, shop/settings both
  open, and the 420-gold shutdown cap never firing. All fine by construction or by measurement.
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there
  by path. If missing, run `npm ci` there. `games/tower` still fetches Inter/Oxanium from Google;
  Xiangqi `npm ci` reports four pre-existing audit findings.
- Cache token covers the whole module graph (ADR-111). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; `tests/cache-bust.mjs` fails if any
  local import is out of step.

## Exact next action

1. Sync, then playtest on a physical phone — ideally 120 Hz, since ADR-127's subject is invisible
   below that. Frame pacing here is bounded by software rasterisation.
2. Champion balance is the open axis: the spread is still 46 points (dawnkeeper 75%, duskblade
   29%). Narrowing it needs ≥24-match runs of `tests/balance.mjs` per change — budget for it.

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched final partial page; do not remove champion/ability metadata from sim
  events, merge all skills back into one ring, restore fountain-only buying, or reuse `canShop()`
  as the home/recall-location predicate.
