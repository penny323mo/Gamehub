# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Racing ghost, Hub return, storage resilience and keyboard/readability audit
Integration branch: `main`
Work branch: `main`
Status: latest checkpoint is verified locally and ready for the next agent;
sync GitHub before reading this file.

## Current objective

Keep Game Hub and its games moving toward production-ready mobile play. The
current high-value work is Racing Car feel/visual polish while preserving the
Hub-wide return, lifecycle, accessibility and storage contracts. Do not treat a
build alone as visual evidence: use the real browser gates below.

## Completed

- Racing Car keeps the continuous Catmull-Rom road ribbon with 240 cached X/Z
  samples, bounded grade load, route-specific rolling terrain in one 96×96 mesh,
  and the player GLB as a transparent replay ghost. The ghost owns cloned
  geometry/materials, render-only wheel motion and never enters physics,
  collision, ranking or progress.
- Racing Car remains sport-arcade rather than hardcore: simple auto-throttle,
  ABS/recovery assists, bounded camera/body cues, six tracks including reverse
  routes, four physical rivals and persistent season progress remain intact.
- Every Hub game has a visible return route; Ashen Rail's portrait/rotate screen
  and Elden Ring II's persistent `← HUB` link are included in tracked `dist/`.
- Ashen Rail now preloads `games/shared/js/safe-storage.js` before its module.
  `scripts/prune-dist.mjs` rewrites the nested deployed path to
  `../../shared/js/safe-storage.js`, so blocked/private storage falls back to
  memory without preventing boot.
- Elden Ring II class subtitle color now passes the pixel-based AA gate. Ashen
  and Elden 3D canvases, Elden class cards, utility buttons and credits close
  button expose visible keyboard focus rings; Ashen's canvas is explicitly
  `tabindex="0"`.

## Changed files

- `games/ashen-rail/index.html` — safe-storage preload and focusable canvas.
- `games/ashen-rail/src/styles/main.css` — visible canvas focus ring.
- `games/ashen-rail/scripts/prune-dist.mjs` and tracked `dist/` — nested path
  rewrite and rebuilt deploy output.
- `games/elden-ring-ii/src/styles.css` — AA subtitle color and canvas/class/
  utility focus states; tracked `dist/` rebuilt.
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md` and this handoff.

## Verification

- `games/ashen-rail`: `npm test` **15/15**, `npm run lint` PASS, `npm run build`
  PASS (the known Vite classic-script warning is followed by prune success).
- `games/elden-ring-ii`: `npm test` **17/17** (typecheck/build/static/map/motion).
- `node tests/hub-storage.mjs`: **2/2**; all 14 games keep the same visible
  control count when both storage getters throw, with no new browser errors.
- `node tests/hub-read.mjs`: **3/3**; all 14 opening screens produced samples
  and all measured text passed WCAG AA contrast.
- `node tests/hub-keyboard.mjs`: **3/3**; all visible controls are Tab-reachable,
  focus is visibly different, and zero browser errors occurred.
- `node tests/hub-home.mjs`: **3/3**; all 13 game return routes were clicked
  from the actual HTTP pages and reached `/index.html`.
- Earlier Racing evidence remains authoritative: race **136/136**, setup
  **157/157**, rivals **61/61**, ghost **33/33**, season **55/55**, audio
  **33/33**, aggregate all green; headed 844×390 and 1200×700 smoke had zero
  console errors and measured 19 calls / 105,187 tris at the busiest ghost case.

## Known issues and cautions

- The Ashen Vite build still prints a non-fatal warning because the classic
  safe-storage script cannot be bundled; do not remove the script or prune
  rewrite. Verify both source and nested `dist/index.html` paths after changes.
- Racing's rigid GLB has no baked wheel clips; keep wheel motion and ghost
  animation render-only and re-profile if `assets/car.glb` changes.
- Keep Racing terrain as one 96×96 mesh and preserve road clearance; never feed
  `terrainYAt()`/render pose back into physics, collision, progress or AI.
- Do not force-push or rewrite shared `main`; do not restore the old block ghost.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, then read this handoff and ADR-298–304.
2. For Racing changes, run the named suites plus real mobile/desktop smoke. For
   Hub or entry changes, rerun `hub.mjs`, `hub-home.mjs`, `hub-storage.mjs`,
   `hub-keyboard.mjs` and `hub-read.mjs` as appropriate.
3. Keep `docs/ai/HANDOFF.md` short and replace it at each completed checkpoint.
4. Run `./scripts/check-handoff.sh`, commit code and docs together, push the
   authorized checkpoint, then verify `git ls-remote origin refs/heads/main`.

## Do not redo

- Do not rescan the whole repository before syncing and reading the named files.
- Do not add a second terrain render pass, per-frame curve allocations, or a
  low-poly replacement ghost to solve visual issues.
- Do not claim a browser-visible change is ready without an HTTP browser witness.
