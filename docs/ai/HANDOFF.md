# Current cross-agent handoff

Updated: 2026-08-03 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 深淵之橋 every control audited for touch (ADR-107); shop + FX work landed

## Current objective

Make the MOBA hold up on Penny's actual phone. The overall production objective is **not
finished**; this handoff is a tested checkpoint, not a claim that everything is final.

## Completed

### Hub launcher

- Commit `752bcc3` replaces the single oversized card with paged groups of four: one row on
  desktop/short landscape, a 2×2 grid in phone portrait, with swipe, arrows, keyboard, dots and
  page status in one centred footer dock. A final partial page keeps normal tile size and centres.
- Gomoku uses two equal CSS stones, not joined emoji. 844×390 has a compact treatment.
- Xiangqi's build rewrites `../shared/` to `../../shared/` and regenerates tracked `dist/`.
- ADR-102 records the durable launcher and nested-build decisions.

### 深淵之橋 attack-FX checkpoint

- `looks.js` defines six basic and 24 ability profiles, each with a stable style ID and a
  procedural grammar; `fx.js` renders them; `sim.js` carries champion/ability identity through
  every event so player and bot abilities reach the same renderer path.
- `browser.mjs` proves six distinct basic signatures, 24 ability IDs with 24 distinct geometry
  signatures, three projectile classes, and zero leftover scene objects. ADR-103.

### 深淵之橋 anywhere shop and modal exit

- Purchases work anywhere for player and bots; `atFountain()` is now healing/recall only. Sticky
  header, ≥44 px `返回戰場`, backdrop as a second close route. ADR-104 supersedes the
  fountain-only clauses in ADR-088/094/100.

### 深淵之橋 touch audit across every control (ADR-107)

- Two reports in a row (joystick, shop) were the same defect, and both reached Penny because the
  suite cannot see it. So every control was measured at 430×860 instead of waiting for a third.
- Found: the **champion select cards** were `click`-only inside an `overflow-y: auto` grid — the
  shop bug on the game's first interaction; `moba-shopbtn` was 31 px tall, `moba-gear` 34 px, the
  settings `×` 24 px; recall/shop/backdrop/gear/settings toggles were all `click`-only.
- "What counts as a tap" now lives in `src/tap.js` and everything uses it. ADR-106 had put that
  logic inside `Hud` as a private method, which is exactly why the select screen was missed. The
  bag row now rebuilds only when its contents change, not on every frame the shop is open.
- `browser.mjs` now fails if any visible `#hud button` has a short side under 44 px — a rule about
  the whole surface, so a new control cannot quietly reintroduce it.

### 深淵之橋 shop taps on a real phone (ADR-106)

- Penny had gold, the card lit gold, pressing it did nothing. The highlight and `sim.buy` agree —
  ADR-104 made `canShop()` return `!!c` — the fault was one layer up: the panel is `overflow-y:
  auto` with `touch-action: pan-y`, so on iOS a tap that drifts a few pixels counts as a scroll and
  **no `click` is synthesised**. Desktop mice and `touchscreen.tap()` never drift, so the suite
  stayed green while the phone was dead.
- Cards and bag slots now commit on a guarded `pointerup`, show a press state, and name the
  failure reason instead of listing possibilities.

### 深淵之橋 crowded-fight FX review (ADR-105)

- Six champions at level 12 in a two-metre cluster firing all four abilities on a loop, at
  844×390 and 430×860; frames captured and magnified. Two faults, both invisible to the signature
  gates because both are about scale and timing, not identity.
- Self-buff sigils were undersized for their whole duration: `cue()` ramped scale linearly across
  `life`, and a self ability passes `life: ab.duration ?? 2.5`, so a shield sat at ~60% size for
  two seconds and only reached full size as it faded. Following sigils now reach full size in
  0.22 s — absolute seconds, not a fraction of `life`. This is the concrete form of Penny's
  long-standing "some ability effects are completely invisible".
- The `dome` part used `wireframe: true`; at this camera that is a scribble of triangle edges,
  not a ward. Now a dim shell with a bright rim — the silhouette comes from the edge.
- Measured worst case: geometries 94 idle → 597 peak → 190 at +4 s → 160 at +8 s; FX items 0 → 44
  → 7; draw calls 94 → 1311. **No leak** — the residual past +12 s is the minion wave that spawns
  after the idle baseline was taken. Nothing else was tuned; the rest read fine in the captures.

## Verification

- `node tests/hub.mjs` → **71/75**. All four failures are the same blocked request: the test
  browser cannot reach `fonts.googleapis.com` in this sandbox. Hub code is unchanged and the page
  falls back to system fonts; Xiangqi build + selftests → pass.
- `node games/moba/tests/cache-bust.mjs` → pass; all six entry/resource tokens agree.
- `node games/moba/tests/sim.mjs` → **206/206 pass**. Twelve mirrored matches: 11 nexus finishes,
  1 time-limit, no NaN or bridge escape.
- `node games/moba/tests/browser.mjs` → **114/114 pass**, landscape and portrait (bundled
  Chromium; `PW_CHROMIUM` overrides). Away-from-fountain purchase, three close routes, full
  matches, FX gates, zero errors, a following sigil past 90% scale a quarter-second in, no
  wireframe sigils, a drifting tap buys while a 40 px drag does not, every HUD button ≥44 px.

## Changed files

- Hub launcher plus follow-up: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi
  source/build files, ADR-102, and this handoff.
- MOBA checkpoint plus shop fix: `games/moba/{index.html,style.css}`, `src/{ai,hud,main,sim}.js`,
  `tests/{browser,cache-bust,sim}.mjs`, root `launcher.js`, and `docs/ai/*.md`.

## Known issues and cautions

- The crowded-fight review is now done (ADR-105); what remains unjudged is a physical phone.
- Xiangqi `npm ci` reports four pre-existing audit findings; not auto-fixed (toolchain risk).
- Two local named stashes may be redundant pre-commit backups; do not re-apply them on `main`.

## Exact next action

1. Sync, then playtest on a physical phone. That is now the only unmeasured axis: frame pacing
   here is bounded by software rasterisation, so it says nothing about real hardware.
2. If phone frame pacing does turn out bad, the first lever is merging each sigil's parts into one
   buffer geometry — draw calls go 94 idle → 1311 at the synthetic six-champion peak because every
   ring, ray, spike and rim is its own mesh. Cutting effects is the wrong lever; see ADR-105.
3. Portrait (430×860) spends roughly half the screen on abyss and water, with the lane in a thin
   band. It is thematically correct but wasteful; worth a framing pass if Penny raises it.

## Do not redo

- Do not restore the obsolete local MOBA stashes; the checkpoint is now in Git history.
- Do not revert the Hub to absolute one-card carousel positioning, platform Gomoku emoji, floating
  edge arrows, or a stretched/left-aligned final partial page.
- Do not remove champion/ability metadata from sim events or merge all skills back into one ring.
- Do not restore fountain-only buying or reuse `canShop()` as the home/recall-location predicate.
