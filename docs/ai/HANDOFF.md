# Current cross-agent handoff

Updated: 2026-08-03 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 深淵之橋 attack pacing (ADR-108), RNG seeding (ADR-109), portrait lane vertical (ADR-110)

## Current objective

Make the MOBA hold up on Penny's actual phone. The overall production objective is **not
finished**; this handoff is a tested checkpoint, not a claim that everything is final.

## Completed

### 深淵之橋 the draw-call worry was measured away (ADR-114)

- ADR-105's 1311 draw calls came from a synthetic stress case (six champions in a two-metre
  cluster looping every ability). A real match samples at median **42** / peak **286** in
  portrait and median **162** / peak **342** in landscape — about a quarter of the stress figure
  and well inside a phone budget. The sigil-geometry merge it recommended is retired.
- `browser.mjs` now runs two minutes of real match per orientation and fails above **600** draw
  calls. A budget beats an optimisation aimed at a number that never occurs in play.

### 深淵之橋 bot decision order was picking a winner (ADR-113)

- A bot decision writes straight into sim state, so a bot updated later reads a world where the
  others have already moved this tick. Champions are created blue-first, so the edge always
  landed on the same side. Measured on 72 mirrored matches, changing only the iteration order:
  blue-first → blue wins **33/72**; red-first → **48/72**; alternating → **35/72** (expected 36).
- The player is always blue and their two bot teammates are created before the three enemies, so
  the systematic loser was the player's own team.
- `updateBots(bots, dt, tick)` in `ai.js` alternates direction each tick; no caller iterates the
  list any more. Bias cancels exactly every two ticks, and the match stays deterministic.
- Nexus finishes 65/72 → **69/72**, average match 17.5 → **15.4 min**.

### 深淵之橋 portrait puts the lane up the screen (ADR-110)

- Portrait spent **83.6% of the screen on abyss and water**. Geometric, not artistic: a 17 m
  bridge shown across a 430×860 screen forces a ~50 m vertical span, so no camera placement fixes
  it — the best steepen-and-pull-in variant reached 23.5% ground while cutting visible lane from
  26.9 m to 23.9 m.
- The camera now rotates 90° about Y in portrait: own base at the bottom, enemy at the top.
  **70.1% ground and 36.6 m of lane**, player at 70% down. Landscape untouched.
- Joystick, WASD and aim-drag speak screen directions and share one `screenToWorld` rotation;
  ground picking already raycast. The lane-overview bar stands up too — same drawing code, one
  canvas transform, and CSS alone decides the axis.
- Two old gates hard-coded "+x is right" and now measure against the camera's own vectors. Same
  failure mode as ADR-109: a fixture carrying an unmeasured claim.
### 深淵之橋 the RNG and the attack pacing (ADR-109, ADR-108)

- `makeRng` used the seed directly as xorshift32 state, so the **first output averaged 0.007** —
  and its first consumer is the first bot's reaction time. Seed is now scrambled with eight
  outputs discarded. Blue wins 24/72 → 33/72; the rest was ADR-113.
- Attack pacing: level 1 used to be 1.39–1.59 s per swing and **8.6–12.7 s to kill one minion**,
  slower than the minions themselves. Base attack speed ×1.4 and melee minion 400 → 330 HP put it
  at 0.99–1.13 s and 5.1–7.9 s. ADR-108's figures were re-measured after ADR-109 (the first set
  came from the biased sample) and corrected in place; the gain holds at 58/72 → 65/72.
### Earlier checkpoints, in one line each

- Hub launcher: paged groups of four, swipe/arrows/keyboard/dots in one footer dock; Gomoku CSS
  stones; Xiangqi nested build rewrite. Commit `752bcc3`, ADR-102.
- Attack FX: `looks.js` holds six basic and 24 ability profiles with stable style IDs, `fx.js`
  renders them, `sim.js` carries champion/ability identity through every event. ADR-103.
- Anywhere shop: purchases work everywhere for player and bots; `atFountain()` is healing/recall
  only. ADR-104 supersedes the fountain-only clauses in ADR-088/094/100.
- Shop taps on a real phone: an `overflow-y: auto` panel with `touch-action: pan-y` makes iOS read
  a few pixels of drift as a scroll and synthesise no `click`. ADR-106, generalised by ADR-107.
- Touch audit: "what counts as a tap" now lives in `src/tap.js` and every control uses it; the
  champion select cards had the shop bug on the game's first interaction, and shopbtn/gear/× were
  31/34/24 px. `browser.mjs` now fails if any visible `#hud button` is under 44 px. ADR-107.
- Crowded-fight FX: self-buff sigils now reach full size in 0.22 s of absolute time rather than a
  fraction of `life` (a shield used to sit at ~60%); `dome` is a dim shell with a bright rim, not
  a wireframe scribble. Worst case measured: geometries 94 → 597 peak → 160 at +8 s, draw calls
  94 → 1311, no leak. ADR-105.

## Verification

- `node tests/hub.mjs` → **83/83**; Racing Car 6/6 suites and Royale 8/8 suites also pass. Outfit is now vendored (ADR-112) so the hub makes no external
  request; the suite gates both the loaded font and the absence of outside traffic. Xiangqi build
  + selftests → pass.
- `node games/moba/tests/cache-bust.mjs` → pass; all six entry/resource tokens agree.
- `node games/moba/tests/sim.mjs` → **215/215 pass**, including the attack-pacing, RNG-diffusion
  and bot-order gates. Twelve mirrored matches still finish, no NaN or bridge escape.
- `node games/moba/tests/browser.mjs` → **129/129 pass**, landscape and portrait (bundled
  Chromium; `PW_CHROMIUM` overrides). Away-from-fountain purchase, three close routes, full
  matches, FX gates, zero errors, a following sigil past 90% scale a quarter-second in, no
  wireframe sigils, a drifting tap buys while a 40 px drag does not, every HUD button ≥44 px.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi source/build files.
- MOBA: `games/moba/{index.html,style.css}`, `src/{ai,champions,constants,hud,main,sim,tap}.js`,
  `tests/{browser,cache-bust,sim}.mjs`, root `index.html`/`launcher.js`, and `docs/ai/*.md`.

## Known issues and cautions

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
2. Do **not** start with the sigil-geometry merge if phone pacing is bad — ADR-114 measured a
   real match at peak 286 (portrait) / 342 (landscape) draw calls, not the synthetic 1311.
   Measure the phone first and let it name its own bottleneck.
3. Nothing else is queued: every axis this environment can measure has been measured.

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched/left-aligned final partial page.
- Do not remove champion/ability metadata from sim events or merge all skills back into one ring.
- Do not restore fountain-only buying or reuse `canShop()` as the home/recall-location predicate.
