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

### 深淵之橋 portrait puts the lane up the screen (ADR-110)

- Measured, portrait spent **83.6% of the screen on abyss and water**. The cause is geometric:
  the bridge is 17 m wide, so showing ~25 m of lane on a 430×860 screen forces a ~50 m vertical
  span. No camera placement fixes that — the best steepen-and-pull-in variant reached 23.5%
  ground while cutting visible lane from 26.9 m to 23.9 m.
- The camera now rotates 90° about Y in portrait: own base at the bottom, enemy at the top.
  **70.1% ground and 36.6 m of lane**, player at 70% down. Landscape is untouched.
- Joystick, WASD and ability aim-drag speak screen directions, so they share one
  `screenToWorld` rotation. Ground picking already raycast, so it followed for free.
- Two old gates hard-coded "+x is right" and were rewritten to measure against the camera's own
  right/forward vectors. Same failure mode as ADR-109: a fixture carrying an unmeasured claim.
- The lane-overview bar stands up in portrait too: same drawing code, one canvas transform, and
  CSS alone decides the axis. Its gate reads the rendered pixels against the projected nexuses.

### 深淵之橋 the first random number of every match was not random (ADR-109)

- Mirrored 3v3 gave blue only 24/72 wins. The cause was not balance: `makeRng` used the seed
  directly as xorshift32 state, and a small integer needs several iterations to diffuse. The
  **mean first output was 0.007–0.019** across the seed sets in use, never 0.5. Sequential seeds
  made neighbouring matches correlated, so more matches did not wash it out.
- The first consumer is the first bot's reaction offset, so blue's first champion began every
  match with a fixed extreme value. Seed is now scrambled and eight outputs discarded.
- Blue wins go **24/72 → 33/72** — 0.7σ from even, so no side bias survives that the sample sees.
- ADR-108's published figures were measured on the biased sample and have been **corrected in
  place**; the pacing gain holds at 58/72 → 65/72 and 19.5 → 17.5 min.

### 深淵之橋 basic-attack pacing (ADR-108)

- Penny asked whether the basic-attack cooldown was too long. Measured: at level 1 the interval was
  1.39–1.59 s and a melee minion took 6–8 swings, so **one minion cost 8.6–12.7 seconds** and a
  wave is six of them. A melee minion swings every 0.8 s — the champion was slower than the creeps.
- Base attack speed ×1.4 for all six; melee minion 400 → 330 HP. Per-level growth, per-hit damage,
  ability damage and item values untouched. Level 1 is now 0.99–1.13 s and 5.1–7.9 s per minion.
- Validated on **three independent 24-match sets**, none of them T13's twelve seeds, and
  re-measured after ADR-109: nexus finishes 58/72 → 65/72, average match 19.5 → 17.5 min, kills
  29.3 → 31.8. No sim gate was re-baselined. Blue takes 33/72 both before and after, so the
  pacing change is side-neutral.

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

- `node tests/hub.mjs` → **83/83**. Outfit is now vendored (ADR-112) so the hub makes no external
  request; the suite gates both the loaded font and the absence of outside traffic. Xiangqi build
  + selftests → pass.
- `node games/moba/tests/cache-bust.mjs` → pass; all six entry/resource tokens agree.
- `node games/moba/tests/sim.mjs` → **212/212 pass**, including the level-1 attack-pacing gate and
  the RNG-diffusion gate. Twelve mirrored matches still finish, no NaN or bridge escape.
- `node games/moba/tests/browser.mjs` → **127/127 pass**, landscape and portrait (bundled
  Chromium; `PW_CHROMIUM` overrides). Away-from-fountain purchase, three close routes, full
  matches, FX gates, zero errors, a following sigil past 90% scale a quarter-second in, no
  wireframe sigils, a drifting tap buys while a 40 px drag does not, every HUD button ≥44 px.

## Changed files

- Hub: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi source/build files.
- MOBA: `games/moba/{index.html,style.css}`, `src/{ai,champions,constants,hud,main,sim,tap}.js`,
  `tests/{browser,cache-bust,sim}.mjs`, root `index.html`/`launcher.js`, and `docs/ai/*.md`.

## Known issues and cautions

- The crowded-fight review is now done (ADR-105); what remains unjudged is a physical phone.
- Xiangqi `npm ci` reports four pre-existing audit findings; not auto-fixed (toolchain risk).
- Playwright lives only in `games/Racing Car/tests/node_modules`; both browser suites point there
  by path. If missing, run `npm ci` there — nothing else installs it.
- `games/tower` still fetches Inter/Oxanium from Google; its @import is inside the built bundle.
- Two local named stashes may be redundant pre-commit backups; do not re-apply them on `main`.
- Cache token now covers the whole module graph (ADR-111). Change it with
  `node scripts/moba-bump-cache.mjs <token>` — never by hand; a partial rename loads a module
  twice under two URLs. `tests/cache-bust.mjs` fails if any local import is out of step.

## Exact next action

1. Sync, then playtest on a physical phone. Frame pacing here is bounded by software
   rasterisation, so it says nothing about real hardware.
2. If phone frame pacing does turn out bad, the first lever is merging each sigil's parts into one
   buffer geometry — draw calls go 94 idle → 1311 at the synthetic six-champion peak because every
   ring, ray, spike and rim is its own mesh. Cutting effects is the wrong lever; see ADR-105.
3. Nothing else is queued. The next move is Penny playing it on a phone; every axis this
   environment can measure has been measured.

## Do not redo

- Do not restore the obsolete local MOBA stashes; the checkpoint is now in Git history.
- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched/left-aligned final partial page.
- Do not remove champion/ability metadata from sim events or merge all skills back into one ring.
- Do not restore fountain-only buying or reuse `canShop()` as the home/recall-location predicate.
