# Current cross-agent handoff

Updated: 2026-08-04 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: Hub touch targets + stylesheet cache token (ADR-133), combat fixture (ADR-132)

## Current objective

Make the MOBA hold up on Penny's phone. Not finished; this is a tested checkpoint.

## Completed

### Hub the real first screen, and none of its controls were measured (ADR-133)

- ADR-129 one level up: the Hub is what a player opens first. Its suite checks four viewports for
  overlap, overflow and columns — but **not one touch target**, while the MOBA has gated 44 px
  since ADR-107. Measured at all four sizes: page dots **8×8 px**, arrows 34–42.
- Two limits, each with a reason. Arrows are isolated targets with room → 44 px; four dots at 44 px
  is 176 plus 88 of arrows, which cannot fit 320 px, so the dots take WCAG 2.5.8's 24×24 plus a
  spacing assertion (the visible dot stays 8 px via `::before`). Enlarging the arrows pushed the
  dock past its width limit, caught by the existing dock gate, so the counter hides below 380 px.
- **The change would not have reached anyone**: the Hub stamps `launcher.js?v=…` but `style.css`
  had no token, so a CSS-only round — this whole one — shipped invisibly to returning visitors.
  ADR-111's defect with the stylesheet left out. Now stamped, bumped, and gated both directions.
- The verification run then failed on something unrelated, caused by **my own previous fix**: the
  framing gate never required the camera to settle, and `camFocus` chases with `approach(4, dt)`.
  After a teleport the projected position travels **-33.8 → 56.7** over 90 frames against a 45–88
  band, while *walking* it is stable. ADR-132 moved the champion 56 m and the next gate sampled
  mid-catch-up; it now settles the camera and asserts it did.

### Earlier checkpoints, in one line each

- The combat gate said it stood the champion at **x = -6**; at the attack it was at **x = -62**,
  dying in the warm-up and respawning at its own fountain — every swing measured inside the
  fountain, the state ADR-119 named unrepresentative. Fixed by ordering, `atFountain` asserted
  false; the layout gate's 900 ms wait, same shape, **holds** and is asserted too. ADR-132.
- Gold: **74.4% of match time a champion holds enough to buy something while the build list forbids
  it** (avg 1122); a full build costs 8502 and a champion earns 4191 a match, so **0/72 could
  complete one**. `nextPurchase` now scans to the next affordable item within the same build. ADR-130.
- Champion spread was 66 points (longshot 83, duskblade 17), tracking **range** almost exactly; now
  **34** (dawnkeeper 63, duskblade 29) after mechanism-tied changes: melee speed → 7.1/7.4/7.1,
  longshot range 10.4 → 9.6, dawnkeeper armour cut and its Q's reach 12 → 9.5, duskblade's mobility
  8 s → 5 s. Melee die on the way in: **9.6** deaths a match against 1.3–4.3. ADR-130.
- **The yardstick was one of the things being tuned** (ADR-131): buffing melee armour made the game
  *less* even (34 → 66), because ironhulk is a companion in every measured match — the biggest mover
  was untouched dawnkeeper (63 → 83). Reverted; the same flaw hit the earlier pass, so **"66 → 46"
  was never a clean before/after**. `balance.mjs` refuses to judge below 24 matches.
- **Every layout gate began after `#pick-go`**: on short screens the pick grid's visible height was
  smaller than one card (78 vs 228 at 568×320) — **zero complete cards**, `max-height: 74vh` never
  binding under flex shrink. Two probe misreadings: cards below the fold were scrolled out, not lost,
  and counting after scrolling flatters. ADR-129.
- The overlap gate exempted `.moba-tip` for being `pointer-events: none`, though it is the only place
  the game explains an ability: **tip × recall 54×44**, **× recallbar 206×20**, invisible to the gate;
  the line is now decoration vs information. A production bug fell out: the skill button called
  `setPointerCapture` **before** recording aim state, and a throw leaves `pointerup` idle. ADR-128.
- On a 120 Hz screen only **25.2%** of frames changed a walking champion's position, in 0.217 m
  jumps — 120 fps of 30 Hz motion; render interpolation took it to **97.5%**, and `src/pace.js` owns
  the fixed-step rule, deriving `MAX_FRAME` from `MAX_STEPS * TICK`. ADR-127.
- The combat gate warmed the sim 750 ticks with **no view frame between**: the FX count read a 25 s
  backlog (**green for the wrong reason**), the target could die inside the tick, and an unseen
  respawn ran `revive()` over the swing. ADR-126.
- The buy rule was written three times, agreeing **only because `canShop` returns `!!c`**;
  `sim.buyBlocker` owns it and T31 pins the contract (ADR-125). A lost GPU context used to end the
  match though the browser returns it in a second (ADR-120); audio was already correct and is
  pinned (ADR-121); twelve models loaded through one `Promise.all` with no retry — now three tries
  plus a 再試一次 button (ADR-122).
- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall covered
  the shop button all match; the gates had been sampling the opening frame. ADR-119.
- Bot update order alternates each tick (ADR-113); draw calls peak at 286/342, not 1311 (ADR-114);
  portrait spent **83.6% on abyss and water** before the camera rotated 90° about Y for **70.1%
  ground** (ADR-110); `makeRng` used the seed directly as xorshift32 state so the **first output
  averaged 0.007** (ADR-109); level-1 attack pacing was **8.6–12.7 s per minion**, now 5.1–7.9
  (ADR-108); the SE HP panel hung off both edges (ADR-116); the **settings panel did not fit
  568×320** (ADR-124).
- `1 - exp(-rate·dt)` for turn/camera follow (ADR-118); Hub launcher paged dock, Gomoku CSS
  stones, Xiangqi build rewrite (`752bcc3`, ADR-102), fonts self-hosted (ADR-112), `looks.js` FX
  profiles (ADR-103), anywhere-shop (ADR-104, supersedes ADR-088/094/100).
- iOS: `overflow-y: auto` + `touch-action: pan-y` reads drift as a scroll and synthesises no `click`;
  `src/tap.js` owns "what counts as a tap". ADR-105/106/107.

## Verification

- `node tests/hub.mjs` → **95/95**; Racing Car 6/6, Royale 8/8, Xiangqi build + selftests pass.
  `cache-bust.mjs` → pass; `sim.mjs` → **238/238**; `balance.mjs 24` → all six inside 20–85%
  (318 s, not a fast gate).
- `node games/moba/tests/browser.mjs` → **192/192 pass** at five sizes (~10 min): select and
  post-match layout, full matches, FX and framing, the attack swing playing, smoothness at
  120/60/30 fps, a skill press surviving a failed pointer capture, shop, draw calls, taps.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi build files. MOBA:
  `games/moba/*` (new `src/pace.js`, `tests/balance.mjs`), `scripts/*`, `docs/ai/*.md`.

## Known issues and cautions

- Checked and clean, do not re-derive (ADR-123/129/130/132): recall interrupted by damage, rotating
  while dead, GPU context lost with the shop open, `.hidden` swallowing taps, shop/settings both
  open, the 420-gold shutdown cap never firing, the layout gate's 900 ms wait not drifting.
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there by
  path — if missing, `npm ci` there. `games/tower` still fetches Inter/Oxanium from Google; Xiangqi
  `npm ci` reports four pre-existing audit findings.
- Cache token covers the whole module graph **and the Hub stylesheet** (ADR-111/133). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; `cache-bust.mjs` fails on any drift.

## Exact next action

1. Sync, then playtest on a physical phone — ideally 120 Hz, since ADR-127's subject is invisible
   below that; frame pacing here is bounded by software rasterisation.
2. Champion balance is the open axis: spread 34 points (dawnkeeper 63%, duskblade 29%). Narrowing
   it needs ≥24-match runs per change (~5 min each) and **must not touch
   ironward/longshot/ironhulk** — those three are the measuring stick (ADR-131).

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, or a
  stretched final partial page; do not remove champion/ability metadata from sim events, merge
  skills back into one ring, restore fountain-only buying, or reuse `canShop()` for location.
