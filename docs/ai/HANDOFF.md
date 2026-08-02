# Current cross-agent handoff

Updated: 2026-08-02 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `main`
Status: 深淵之橋 shop taps fixed for real phones (ADR-106); crowded-fight FX review done

## Current objective

Close out ADR-103's open item: judge the champion FX in a real crowded fight rather than by
signature, and measure the cost, before calling the MOBA production objective complete.

The overall MOBA production objective is **not finished**. This handoff is a tested checkpoint,
not a claim that crowded-fight readability, performance, controls, logic, and physics are final.

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
  header, ≥44 px `返回戰場`, backdrop as a second close route, all close paths force false.
- ADR-104 supersedes the fountain-only clauses in ADR-088/094/100.

### 深淵之橋 shop taps on a real phone (ADR-106)

- Penny had gold, the card lit gold, and pressing it did nothing. `sim.buy` and the highlight do
  agree — ADR-104 made `canShop()` return `!!c` — the fault was one layer up. The shop panel is
  `overflow-y: auto` with `touch-action: pan-y`, so on iOS a tap that drifts a few pixels is
  classified as a scroll and **no `click` is synthesised**; the cards listened for `click` alone
  and were 7 px-padded targets. Desktop mice and `touchscreen.tap()` never drift, so the suite
  stayed green while the phone was dead. The close button had already been moved to `pointerup`
  for this exact reason; the item cards never followed.
- Cards and bag slots now commit on a guarded `pointerup` (same pointer, <12 px, <800 ms), declare
  `touch-action: manipulation`, stand ≥44 px, show a press state, and name the failure reason.
  Cache token `shop-anywhere-1` → `shop-tap-2` across all six entry points.

### 深淵之橋 crowded-fight FX review (ADR-105)

- Six champions at level 12 in a two-metre cluster firing all four abilities on a loop, at
  844×390 and 430×860; frames captured and magnified. Two faults, both invisible to the signature
  gates because both are about scale and timing, not identity.
- Self-buff sigils were undersized for essentially their whole duration: `cue()` ramped scale
  linearly across `life`, and a self ability passes `life: ab.duration ?? 2.5`, so a shield sat at
  ~60% size for two seconds and only reached full size as it faded. Following sigils now reach
  full size in 0.22 s — absolute seconds, not a fraction of `life` — and hold. This is the concrete form of Penny's
  long-standing "some ability effects are completely invisible".
- The `dome` part used `wireframe: true`; at this camera that is a scribble of triangle edges,
  not a ward. Now a dim shell with a bright rim — the silhouette comes from the edge.
- Measured worst case: geometries 94 idle → 597 peak → 190 at +4 s → 160 at +8 s; FX items 0 → 44
  → 7; draw calls 94 → 1311. **No leak** — the residual past +12 s is the minion wave that spawns
  after the idle baseline was taken, not retained effects.
- Nothing else was tuned; the other profiles read acceptably in the captures.

## Verification

- `node tests/hub.mjs` → **75/75** at 320×568, 440×956, 844×390, 1280×800. Real-browser QA at
  393×852 and 844×390 confirmed the layout, zero console errors, and a working Hub → Xiangqi click.
- `cd games/xiangqi-ai && npm run build` → pass; Xiangqi selftests (legal/search/perf) → pass.
- `node games/moba/tests/cache-bust.mjs` → pass; all six entry/resource tokens agree.
- `node games/moba/tests/sim.mjs` → **206/206 pass**. Away purchase deducts gold and adds stats.
  Twelve mirrored matches: blue/red 2/10; 11 nexus finishes, 1 time-limit; no NaN/bridge escape.
- `node games/moba/tests/browser.mjs` → **112/112 pass** across landscape and portrait (bundled
  Chromium; `PW_CHROMIUM` overrides it). It proves away-from-fountain touch purchase, three close
  routes, full matches, FX gates, zero errors, plus two new ADR-105 gates: a following sigil is
  past 90% scale a quarter-second in, no cast sigil uses a wireframe material, and (ADR-106) a
  drifting pointer-only tap buys while a 40 px drag does not.
- Real-browser 1280×589 shows `商店 · 隨時可買` and the sticky `返回戰場 ×` above the grid.

## Changed files

- Hub launcher plus follow-up: `index.html`, `launcher.js`, `style.css`, `tests/hub.mjs`, Xiangqi
  source/build files, ADR-102, and this handoff.
- MOBA checkpoint plus shop fix: `games/moba/{index.html,style.css}`, `src/{ai,hud,main,sim}.js`,
  `tests/{browser,cache-bust,sim}.mjs`, root `launcher.js`, and `docs/ai/*.md`.

## Known issues and cautions

- The crowded-fight review is now done (ADR-105); what remains unjudged is a physical phone.
- The browser gallery previously called `fx.dispose()` while the live match was running; it was QA
  only and did not modify source. Do not infer a runtime FX lifecycle bug from that experiment.
- Xiangqi `npm ci` reported four dependency audit findings (1 low, 3 high). They were pre-existing,
  outside this UI checkpoint, and were not auto-fixed because that could upgrade the toolchain.
- Two local named stashes may remain as redundant pre-commit backups. Their content is now in this
  checkpoint; do not re-apply them on top of `main`. Cloud agents cannot see local stashes anyway.

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
