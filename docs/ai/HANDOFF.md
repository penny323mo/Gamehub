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

### 深淵之橋 the recall button covered the shop button all match (ADR-119)

- `.moba-recall` and `.moba-shopbtn` sat 30 px apart while both are 44 px tall, so recall's lower
  **12–14 px overlapped the shop button** in both orientations — and taps in that band went to
  the shop, since it is later in the DOM. True for the whole match, not an edge case.
- Nothing caught it because every layout gate measured the frame right after the start, where the
  champion is in the fountain (recall hidden) with no gold (shop button short). **The gate was
  measuring a screen the player sees for a few seconds.** Layout gates now stand the champion
  outside the fountain with gold before measuring — that matters more than the CSS.
- Found by rotating the device mid-match, a state never tested. The rotation itself was clean:
  `camYaw` flips, the joystick still drives at the enemy base, the lane bar re-orients.

### 深淵之橋 every skillshot had never once hit anything (ADR-117)

- The straight-line projectile loop lived in `#tickZones`, while `#tickProjectiles` iterated
  **every** projectile and deleted any whose `targetId` did not resolve. Skillshots have no
  `targetId`, so each one died on the tick it was cast and the code that moves it had **never
  run**. 穿甲箭 fired point-blank at an enemy: HP 565 → 565. All four skillshots dealt zero.
- Found while fixing a smaller bug in the same loop: one sample per tick, so a 2.0 m step against
  a 2.02 m hit radius passed through anything between samples. Now a swept segment test.
- T8 stayed green because it asks whether **any** of a champion's four abilities does damage. T29
  fires every skillshot; **T30 sweeps all 24 abilities against what their data declares** and was
  mutation-tested (disabling shields/stuns/slows each made it fail with the right names).
- Effect: nexus 69/72 → **71/72**, match **15.4 → 11.4 min**, blue 39/72. Nothing re-tuned on top.


### 深淵之橋 portrait puts the lane up the screen (ADR-110)

- Portrait spent **83.6% of the screen on abyss and water** — geometric, not artistic. The camera
  rotates 90° about Y in portrait: own base bottom, enemy top. **70.1% ground, 36.6 m of lane**.
- Joystick, WASD and aim-drag share one `screenToWorld` rotation; the lane-overview bar stands up
  too (same drawing code, one canvas transform, CSS decides the axis). Two old gates hard-coded
  "+x is right" and now measure against the camera's own vectors.

### Earlier checkpoints, in one line each

- Bot update order alternates each tick: updating blue first gave blue 33/72, red first 48/72.
  ADR-113. Draw calls peak at 286/342 in a real match, not the synthetic 1311. ADR-114.
- `makeRng` used the seed directly as xorshift32 state, so the **first output averaged 0.007** and
  its first consumer is a bot's reaction time. ADR-109. Attack pacing: level 1 took **8.6–12.7 s
  per minion**, slower than the minions; now 5.1–7.9 s. ADR-108.
- Small screens: an iPhone SE (320×568 / 568×320) found the HP panel hanging off both edges and
  overlapping the skill buttons. Fixed by narrowing content, not moving it. ADR-116.
- Turning and camera follow use `1 - exp(-rate·dt)`; `dt·rate` is only accurate while `dt` is
  small, so the same match turned and panned differently at 30 fps than at 60. ADR-118.
- Hub launcher: paged groups of four with swipe/arrows/keyboard/dots in one footer dock; Gomoku
  CSS stones; Xiangqi nested build rewrite. `752bcc3`, ADR-102. Fonts self-hosted, ADR-112.
- Attack FX: `looks.js` holds six basic and 24 ability profiles with stable style IDs, `fx.js`
  renders them, `sim.js` carries champion/ability identity through every event. ADR-103.
- Anywhere shop: purchases work everywhere for player and bots; `atFountain()` is healing/recall
  only. ADR-104 supersedes the fountain-only clauses in ADR-088/094/100.
- Touch: an `overflow-y: auto` panel with `touch-action: pan-y` makes iOS read a few pixels of
  drift as a scroll and synthesise no `click` (ADR-106). "What counts as a tap" lives in
  `src/tap.js`; every control uses it, and `browser.mjs` fails under 44 px. ADR-107.
- Crowded-fight FX: self-buff sigils reach full size in 0.22 s of absolute time, not a fraction of
  `life` (a shield used to sit at ~60%); `dome` is a dim shell with a bright rim. ADR-105.

## Verification

- `node tests/hub.mjs` → **83/83**; Racing Car 6/6 and Royale 8/8 also pass; Xiangqi build +
  selftests pass. Outfit is vendored (ADR-112), so the suite gates both the loaded font and the
  complete absence of outside traffic.
- `node games/moba/tests/cache-bust.mjs` → pass; all six entry/resource tokens agree.
- `node games/moba/tests/sim.mjs` → **220/220 pass**, including the attack-pacing, RNG-diffusion
  and bot-order gates. Twelve mirrored matches still finish, no NaN or bridge escape.
- `node games/moba/tests/browser.mjs` → **141/141 pass** at five sizes (bundled Chromium;
  `PW_CHROMIUM` overrides): full matches, FX and framing gates, shop, draw-call budget, a drifting
  tap buys while a 40 px drag does not, every HUD button ≥44 px, zero console errors.

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
2. If pacing is bad, do **not** start with the sigil-geometry merge — ADR-114 measured a real
   match at peak 286/342 draw calls, not 1311. Let the phone name its own bottleneck. Nothing
   else is queued: every axis this environment can measure has been measured.

## Do not redo

- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched/left-aligned final partial page.
- Do not remove champion/ability metadata from sim events or merge all skills back into one ring.
- Do not restore fountain-only buying or reuse `canShop()` as the home/recall-location predicate.
