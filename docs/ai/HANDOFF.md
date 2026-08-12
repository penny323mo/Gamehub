# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — intermediate Hub UI checkpoint
Integration branch: `main`
Work branch: `main`
Status: Remote checkpoint `720e145` is on `origin/main`; the Hub art direction is
**not accepted** and its redesign precedes all Phase 0C work.
## Current objective

First, rebuild the Hub themes under Evolution Plan §5.5 and ADR-312. Penny rejected
all three current variants, including default Neon, because they still read as one
card carousel. Thumbnail/media, item form, app shell, information hierarchy and
navigation composition must also differ.

This is a UI-only scope. Preserve every game runtime, the 13-game catalog order,
entry links, storage safety and launch/input semantics; theme-specific navigation
may change but must remain keyboard/touch accessible.

## Completed

- Phase 0B is preserved in remote commit `7c032b3`: AssetCatalog/RigCatalog,
  deterministic 155-model runtime census, provenance 127 verified / 28 blocked,
  and readiness 118 ready / 37 blocked.
- Added a functional three-theme scaffold: `neon-grid`, `editorial-arcade` and
  `command-deck`; native 44 px theme buttons persist under `gamehub-theme-v1`
  and safely fall back when Web Storage is blocked.
- Preserved the manifest-derived 13 entries, 4/4/4/1 pages, hrefs, inactive-page
  tab contract, arrows, dots, keyboard and touch gestures.
- Added `tests/hub-themes.mjs` and Pages CI wiring. The current contract exercises
  all three theme IDs at five viewports, storage/reload, blocked storage,
  keyboard, swipe/touchcancel, overflow and browser/network errors.
- Split the root Hub cache token from the MOBA module graph (ADR-311). Root
  launcher/style use `assets-32`; MOBA remains on `assets-31`.
- Added a command-specific 20-minute ReleaseGate timeout for the existing MOBA
  browser suite. GitHub run `31583123038` showed assertions continuing to pass;
  the old outer 10-minute bound closed the page before completion.
- Added Evolution Plan §5.5 and ADR-312. They make the rejected visual result and
  the new shell/media/item acceptance contract durable for the next agent.

## Rejected prototype — do not mistake this for completion

- Current Neon is the old four-tile grid, Editorial is a feature card plus three
  compact rows, and Command is four rows plus a side pager. All three still inherit
  too much of the same header, icon/thumbnail treatment, rounded-card silhouette
  and content hierarchy; none is an accepted visual baseline.
- The earlier `205/205` theme result is a **functional/responsive scaffold pass**,
  not visual acceptance. Automated geometry can prove that controls work and do
  not overlap; it cannot overrule Penny's headed visual review.
- The next implementation may replace the internal card DOM. Keep only the
  stable outer launch anchor/data-game-id, catalog data and accessibility/input
  behavior where useful; do not preserve one universal visual `GameCard` merely
  because the current test queries it.

## Changed files

- Hub scaffold: `index.html`, `launcher.js`, `style.css`.
- UI contract/CI: `tests/hub-themes.mjs`, `.github/workflows/deploy-pages.yml`.
- Cache/release integration: `games/moba/tests/cache-bust.mjs`,
  `scripts/moba-bump-cache.mjs`, `games/manifest.json`, generated catalog.
- Roadmap/context: `docs/GAMEHUB_EVOLUTION_PLAN.md`, `PROJECT_CONTEXT.md`,
  `DECISIONS.md`, this handoff.

## Verification

- Final functional scaffold rerun after this documentation checkpoint:
  `node tests/hub-themes.mjs` PASS `205/205` across 320x568, 375x667, 667x375,
  844x390 and 1280x800; zero console/page/HTTP/external-request errors. This is
  still not visual acceptance.
- Final Hub reruns: layout `100/100`, touch `5/5`, keyboard `3/3`, storage `2/2`,
  load `3/3`, Home `3/3`, readability `3/3`. Two concurrent-run transient misses
  passed serially; no game runtime was changed.
- Final static/infrastructure checks: launcher/theme Node syntax PASS; catalog
  artifact parity and catalog contract PASS; ReleaseGate `20/20`; MOBA/Hub cache
  token contract `3/3`; workflow YAML PASS; `git diff --check` PASS;
  `./scripts/check-handoff.sh` PASS.
- Local/remote code SHA matched `720e145`; Pages run `31587293353` was in progress
  at handoff and is non-blocking unless it reports an actionable regression.

## Known issues and cautions

- Visual acceptance is open and is the highest-priority blocker. Do not report
  any of the three current variants as complete until §5.5 screenshot/layout-
  signature and Penny headed acceptance all pass.
- Game media is still mainly the old emoji/local-logo treatment. The redesign
  needs canonical gameplay capture variants with explicit crop/aspect/byte
  budgets; this remains UI media work and must not modify game logic.
- Phase 0B license blockers remain Racing Tripo 1, Ashen Tripo 4 and Royale Meshy
  23. Do not relabel or reuse them without evidence.
- `hub-cdn.mjs` previously measured Xiangqi DCL timing at 1.07–1.10 seconds
  against a 1.0-second threshold while every functional CDN assertion passed.
  This is outside the UI scope; remeasure on a quiet runner instead of rewriting
  Xiangqi.
- The MOBA full browser suite is intentionally long. Keep its command-specific
  timeout; do not raise the global default or weaken gameplay assertions.

## Exact next action

1. **First TODO — rebuild the Hub UI.** Start from Evolution Plan §5.5 and
   ADR-312. Produce three independently composed shells and three different game
   media/item archetypes, not a shared rounded card with theme modifiers.
2. Extend `tests/hub-themes.mjs` with shell/nav/item/media layout signatures, then
   inspect full-page screenshots at all five canonical viewports. Zero automated
   errors is necessary but Penny's headed visual acceptance is the completion
   gate.
3. Keep the side quest UI-only, update the root Hub cache token, run Hub/catalog/
   release/handoff gates, commit and push the accepted redesign.
4. Only after UI acceptance, resume Phase 0C scene/rig/performance baselines for
   Royale, Racing and Elden.

## Do not redo

- Do not rescan or recreate GameCatalog, ReleaseGate, AssetCatalog or RigCatalog.
- Do not use one universal thumbnail/card component and call CSS colour, font,
  radius, shadow, crop ratio or ordering changes a new theme.
- Do not change game order, links, save data or any game runtime for this task.
- Do not treat `205/205` as proof of visual quality or weaken tests to fit a bad
  layout.
- Do not hand-edit generated catalog/census files, merge Hub/MOBA cache tokens,
  force-push, or claim the 12-month evolution roadmap complete.
