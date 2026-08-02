# Current cross-agent handoff

Updated: 2026-08-02 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Work branch: `main`
Status: 深淵之橋 joystick release, idle animation, and touch shop dead end fixed;
        sim 206/206, browser 88/88

## Current objective

Refine 深淵之橋 to production level across visuals, controls, logic, and game feel. Keep the
mobile-first controls responsive and make attacks and abilities visually distinct and readable.

## Completed

- **Joystick/WASD release now stops immediately.** `input.js` tracks whether the current move order
  belongs to continuous direction input. Releasing the final direction clears only that order;
  an attack order or a later mouse order is preserved.
- **No more running in place.** `sim.js` resets `moving` every tick and real displacement sets it
  again. The renderer now returns the champion to `Idle_Combat` after release instead of retaining
  `Running_A` forever.
- **The shop is operable by touch.** While open it is a true modal layer, blocks controls behind it,
  supports scrolling, has a dim backdrop and a 44 px `返回戰場` action. Purchase feedback renders
  above the shop instead of behind it.
- **The away-from-fountain state has a way out.** The header says `未在泉水`, unactionable items
  are visually muted, and `返程購物` is fixed in the top action row in both orientations. It closes
  the shop and starts recall; opening it during recall does not accidentally cancel the channel.
- **The fountain shop rule is unchanged.** At the fountain, touch-buying an affordable item still
  deducts gold and fills an equipment slot. Away from it, the player gets a visible explanation.
- ADR-100 records the order-ownership, animation-state, and modal-shop decisions.

## Verification

- `node games/moba/tests/sim.mjs` → **206/206**. New T24 proves move → stop returns `moving` to
  false; all match, combat, economy, recall, AI, dash, and bridge-boundary checks still pass.
- `PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node
  games/moba/tests/browser.mjs` → **88/88** with the repo's Playwright dependency available.
  Landscape 1280×640 and portrait 430×860 both pass: touch shop open/buy/close, real virtual-stick
  touch event sequence, zero post-release drift, idle animation, attack-order preservation,
  away-shop feedback, recall action, full match, and zero console errors.
- Headed Chrome smoke at 844×390: assets loaded, match started, shop rendered without overlap,
  `長劍` purchase changed the gold/equipment UI, and the large return action closed the modal.
- `git diff --check` → pass.
- Physical iPhone Safari has not yet been rerun after this checkpoint; Penny's next production
  hard reload is still the final hardware confirmation.

## Changed files

- `games/moba/src/input.js` — continuous-direction order ownership and release cleanup.
- `games/moba/src/sim.js` — per-tick movement-state reset.
- `games/moba/src/hud.js` — modal shop, large close, state/feedback, recall action.
- `games/moba/style.css` — touch/modal layering, 44 px actions, portrait layout, feedback z-index.
- `games/moba/tests/{sim,browser}.mjs` — release, idle, touch, shop, and recall regressions.
- `docs/ai/{DECISIONS,HANDOFF}.md` — ADR-100 and this checkpoint.

## Known issues and cautions

- Real-hardware FPS remains unmeasured. Browser automation covers iPhone-sized layouts and touch
  events but is not a replacement for Safari on Penny's phone.
- Effects are readable by ability *form*, but champions sharing a form can still share a similar
  silhouette. The next visual pass should make attacks recognisable by champion, not just by form.
- Mirror bot matches previously measured 20/24 nexus finishes; do not change combat balance in a
  visual-effects pass without rerunning independent seeds.
- `sim.js` must stay free of three.js imports. `moving` is simulation output; animation clips remain
  renderer-owned.
- The shop is intentionally fountain-only. Do not silently enable remote buying; ADR-094/095 and
  ADR-100 preserve recall as the route from lane gold to usable equipment.

## Exact next action

1. Hard reload the deployed build on a physical iPhone, drag/release the left stick, then test the
   shop once at the fountain and once in lane. Confirm stop/idle and both top-row shop actions.
2. Continue the production visual pass in `src/fx.js`/`view.js`: inventory every champion's basic
   attack and four abilities, then give shared forms champion-specific colour, shape, timing, and
   impact silhouettes. Preserve the current event contracts and add screenshot-visible browser
   assertions rather than checking effect data alone.

## Do not redo

- Click-to-move as primary control or clearing every order on direction release. ADR-091/100.
- Super minions, tighter XP, weaker nexus, or generic tower-HP tuning. Those measured worse.
- Removing the fountain shop rule to hide missing feedback. The modal/recall path is the fix.
- Reusing another game's GLB assets. The current KayKit art is CC0, credited, and compressed.
