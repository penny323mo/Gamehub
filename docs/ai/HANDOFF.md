# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — cross-game completion audit, browser-fixture hardening and Elden witness
Integration branch: `main`
Work branch: `main`
Status: latest checkpoint is verified locally and ready for the next agent;
sync GitHub before reading this file.

## Current objective

Keep Game Hub and its games moving toward production-ready mobile play. This
checkpoint is an evidence pass across Racing, MOBA, Tower, Royale and Elden;
next agent should sync this commit before choosing the next product gap. Do not
treat a build alone as visual evidence: use the real browser gates below.

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
- Cross-game browser audit completed on local Chromium: Hub away/pause/leak
  **3/3, 6/6, 4/4**; root flows Gomoku **10/10**, Big Two **4/4**, Dou Dizhu
  **4/4**, Penny Crush **7/7**, Snake **10/10**, Snooker **25/25**, Xiangqi
  **5/5**; MOBA sim/cache/browser **262/262, pass, 206/206**.
- Tower core stayed green (**map 11/11, route 8/8, chapters 7/7, RNG 5/5,
  tiles 7/7, balance 10/10**). Flow is **20/20** after the test waits for the
  visible panel layout and uses a real mouse pointer path for long-press drag;
  runtime rollback is covered by the blur and visibility gates.
- Royale individual browser gates: leak **7/7**, perf **3/3**, gauntlet
  **17/17**, combat **8/8**, pvp guest **12/12**, match **11/11**, features
  **27/27**, RTS **29/29**, session **5/5**. Its shared harness now waits for
  `#start-btn` after loading and bounded-retries the test-only tutorial flag.

## Changed files

- `games/ashen-rail/index.html` — safe-storage preload and focusable canvas.
- `games/ashen-rail/src/styles/main.css` — visible canvas focus ring.
- `games/ashen-rail/scripts/prune-dist.mjs` and tracked `dist/` — nested path
  rewrite and rebuilt deploy output.
- `games/elden-ring-ii/src/styles.css` — AA subtitle color and canvas/class/
  utility focus states; tracked `dist/` rebuilt.
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md` and this handoff.
- `games/royale/tests/lib/harness.mjs` — visible-start wait and bounded tutorial
  flag retry for local/Cloud Chromium differences.
- `games/tower/tests/flow.mjs` — re-read panel box after layout settles before
  blur/visibility drag cancellation.
- `games/elden-ring-ii/tests/playthrough-full.mjs` — portable output path,
  `PW_CHROMIUM` override, visible-telegraph dodge policy and fail-fast
  `PLAYTHROUGH=PASS` contract.

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
- Elden `npm test` is **17/17**. The long browser witness now uses only visible
  Boss telegraph state plus keyboard-equivalent dodge/movement and reached real
  `status=victory` in the latest two final runs; one earlier RNG run failed
  honestly. Latest: chapter 3 cleared,
  player **48 HP**, 35 attacks / 476 damage / 66s. It emits `PLAYTHROUGH=PASS`
  and exits non-zero unless the game itself reports victory.

## Known issues and cautions

- The Ashen Vite build still prints a non-fatal warning because the classic
  safe-storage script cannot be bundled; do not remove the script or prune
  rewrite. Verify both source and nested `dist/index.html` paths after changes.
- Racing's rigid GLB has no baked wheel clips; keep wheel motion and ghost
  animation render-only and re-profile if `assets/car.glb` changes.
- Keep Racing terrain as one 96×96 mesh and preserve road clearance; never feed
  `terrainYAt()`/render pose back into physics, collision, progress or AI.
- Do not force-push or rewrite shared `main`; do not restore the old block ghost.
- Do not call the Elden full witness green when the bot dies, stalls, or merely
  reaches the boss: require the explicit `PLAYTHROUGH=PASS` and zero exit code.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, then read this handoff and ADR-298–305.
2. If touching Elden, keep the witness input-equivalent: approach, dodge visible
  telegraphs, heal, require `status === victory`; never use `__ER2.推關()` in the
  full-clear assertion.
3. If touching Royale, run `PLAYWRIGHT_CHROMIUM=/path/to/chrome npm test` from
   `games/royale/tests`; individual suites remain authoritative when a slow
   software-renderer aggregate launch times out.
4. For Racing or Hub changes, run named suites plus real mobile/desktop smoke; keep this file short and replace it at each checkpoint.
5. Run `./scripts/check-handoff.sh`, commit code/docs, push the authorized checkpoint, then verify `git ls-remote origin refs/heads/main`.

## Do not redo

- Do not rescan the whole repository before syncing and reading the named files.
- Do not add a second terrain pass, per-frame curve allocations, or low-poly
  ghost; every browser-visible change needs an HTTP witness.
