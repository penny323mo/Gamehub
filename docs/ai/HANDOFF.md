# Current cross-agent handoff

Updated: 2026-08-02 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Work branch: `main`
Status: Elden Ring II side quest integrated and locally browser-verified; production
        deployment is the remaining release gate for this checkpoint

## Current objective

Penny paused the main 深淵之橋 production pass for a side quest: move the existing local
`/Users/penny323/Elden` game into Game Hub as an independent bonus title and deploy it through the
repository's GitHub Pages pipeline.

## Completed

- Added `games/elden-ring-ii/`, a maintainable Vite + React + TypeScript conversion of the original
  Vinext/Cloudflare project. The Three.js/Cannon-es game itself remains intact: three character
  classes, two skeleton waves, two-phase boss, lock-on, stamina/dodge, audio, effects, credits,
  mobile joystick/action controls, and right-side camera drag.
- Copied all runtime models, materials, music, SFX, images, and their CC0 source/license records.
  The fan-made/non-affiliation notice remains in the game and README.
- Converted nested-hosting paths: Vite uses `base: "./"`; Three's default and custom GLTF loading
  managers resolve `/assets/...` through `import.meta.env.BASE_URL`; audio uses the same base.
- Preserved run history as local-first. Optional Supabase writes now use browser-safe
  `VITE_SUPABASE_*` values; no Supabase migration or credential change was made.
- Added the `Elden Ring II` card to `launcher.js` and linked it to
  `games/elden-ring-ii/dist/index.html`.
- Updated Pages CI to cache, install, test, and build Elden Ring II before staging the static site.
- Upgraded the copied Vite toolchain from vulnerable 8.0.13 to 8.2.0; full `npm audit` is clean.
- ADR-101 records the static-hosting, persistence, asset-license, and browser-gate decisions.

## Verification

- `cd games/elden-ring-ii && npm test` → **3/3 pass** after TypeScript and production Vite build.
- `npm audit` → **0 vulnerabilities** (production and development dependencies).
- Local HTTP + headed Chromium at 844×390:
  - Hub has 13 cards; after carousel navigation the active card is `Elden Ring II` and its Play
    action reaches the nested production entry.
  - Title screen reaches `ENTER THE VEIL`; one WebGL canvas, Cannon-es and local persistence are
    active; all required environment/character/enemy requests return 200.
  - Starting the game reaches `playing`; keyboard movement changed player position and right drag
    changed camera yaw; console has **0 errors / 0 warnings**.
- Chromium mobile touch context at 844×390:
  - touch controls are visible; a real CDP touch drag on the joystick changed player position;
    a right-half touch drag changed camera yaw; **0 failed responses / 0 console problems**.
- Production GitHub Pages smoke: **pending push/deploy of this checkpoint**.

## Changed files

- `games/elden-ring-ii/` — source, tests, Vite/static conversion, CC0 runtime assets and licenses.
- `launcher.js` — Hub card and production link.
- `.github/workflows/deploy-pages.yml` — Elden install/test/build stage.
- `.gitignore` — ignored Elden `dist/`; CI is authoritative for production output.
- `docs/ai/{PROJECT_CONTEXT,DECISIONS,HANDOFF}.md` — architecture, ADR-101, current checkpoint.

## Known issues and cautions

- The production bundle is intentionally graphics-heavy (about 23 MB of models/audio plus the
  Three.js game bundle). First load can take longer on a cold mobile connection.
- GitHub Pages cannot run the old Cloudflare worker or server auth. Do not reintroduce worker-only
  imports into the Hub copy; local play must remain fully functional without Supabase.
- Keep model/audio URLs relative. Root `/assets/...` URLs reproduce the 404 failure caught during
  the first browser smoke.
- Penny's paused MOBA effects pass is not part of this checkpoint. Codex preserved that incomplete
  work in the local-only stash `wip/moba-production-fx-before-elden-sidequest`; a cloud agent must
  not assume that stash exists.

## Exact next action

1. Push this checkpoint to `origin/main`, verify the Pages workflow succeeds, then hard-load the
   public Hub and the Elden nested path with cache disabled; require the title screen and assets to
   load without console/network errors.
2. After Penny ends the side quest, resume the mainline from the agreed remote baseline. Local
   Codex may restore the named stash; another environment should ask Penny whether to start a new
   visual-effects pass rather than guessing at unavailable local WIP.

## Do not redo

- Do not copy Vinext/Next/Cloudflare/D1 wrappers into the static Hub; ADR-101.
- Do not move Elden assets to root `/assets`; the folder must remain self-contained.
- Do not delete or pop the named MOBA stash while this side quest is still active.
