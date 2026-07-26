# Game Hub project context

This is the stable map shared by Codex and Claude Code. Keep it concise and update
it only when architecture, entrypoints, deployment, or verification commands
change. Day-to-day progress belongs in `HANDOFF.md`.

## Repository purpose

Game Hub is a static multi-game website. The root carousel in `index.html` and
`launcher.js` links to independent games under `games/`. Preserve the hub as a
collection: a new or heavily revised game should remain self-contained unless a
shared subsystem genuinely belongs in `games/shared/`.

Production is deployed from `main` by `.github/workflows/deploy-pages.yml` to
GitHub Pages. The workflow stages the repository as a static site and builds
Ashen Rail during deployment.

## High-level map

| Area | Entrypoint | Stack / notes |
| --- | --- | --- |
| Hub carousel | `index.html`, `launcher.js`, `style.css` | Static HTML/CSS/JS; links must work from GitHub Pages subpaths. |
| Gomoku | `games/gomoku/index.html` | Static JS, online features use Supabase. |
| Penny Crush | `games/penny_crush/index.html` | Static game. |
| Big Two | `games/big2/index.html` | Static JS; online/shared infrastructure may use Supabase. |
| Dou Dizhu | `games/doudizhu/index.html` | Static JS; online/shared infrastructure may use Supabase. |
| Snooker | `games/snooker/index.html` | 2D and 3D modes plus shared `games/snooker/online.js`. |
| Tower Defense | `games/tower/dist/index.html` | Vite + TypeScript + Three.js; tracked `dist/` is the hub target. |
| Neon Snake | `games/snake-game/dist/index.html` | React + Vite + TypeScript; tracked `dist/` is the hub target. |
| Empire Royale | `games/royale/index.html` | Static ES modules + vendored Three.js. Two modes: Clash-style lane battle (`game.js`, `ai.js`) and LV2 age-of-empires RTS (`src/rts/`). Shared: `models.js`, `rig.js` (procedural bone animation), `sfx.js`, `net.js`/`pvp.js` (Supabase PvP), `leaderboard.js`, `storage.js`. |
| Ashen Rail | `games/ashen-rail/dist/index.html` | Self-contained Vite + TypeScript + Babylon.js bonus game; CI builds `dist/`. |
| Xiangqi AI | `games/xiangqi-ai/dist/index.html` | Vite + Three.js; hub targets tracked `dist/`. |
| Database | `supabase/migrations/` | Append-only numbered migrations; never edit an applied migration casually. |

## Current architectural invariants

- `launcher.js` is the source of truth for root carousel entries and paths.
- GitHub Pages runs under a repository subpath, so game asset URLs must remain
  relative or otherwise Pages-safe.
- Ashen Rail remains a self-contained bonus game inside the existing hub. Its Vite
  base is relative and deployment builds its ignored `dist/` from source.
- Tower, Snake, and Xiangqi hub links currently target committed `dist/` output.
  Source-only changes to those games are incomplete until the required dist output
  is regenerated and verified.
- Royale carries local vendor modules and Draco assets so production must not
  assume a package-manager build step for that game. See ADR-007 to ADR-012 for
  the Royale rules an editor must not break; the load-bearing ones are: AI gets no
  hidden information and only the explicit ADR-007 gauntlet elixir ramp (1.0 to
  1.2), anything `disposeDeep` reaches needs a per-instance material, character
  motion is generated in `rig.js` rather than baked in the GLBs, and guest-visible
  PvP effects must travel in the snapshot `fx` channel.
- Royale damage passes through one funnel, `Game#damage`. Counter bonuses
  (`bonusVs` against tags such as `heavy`) and armour reduction belong there so
  melee, projectiles, and spells stay consistent; do not special-case card ids in
  `ai.js`.
- Supabase changes go through a new numbered migration. Never expose keys, tokens,
  cookies, or connection secrets in code, handoffs, logs, or commits.
- Visual, camera, input, responsive-layout, audio, and gameplay-feel changes need
  real browser verification at the relevant desktop/mobile viewport.

## Verification matrix

Choose checks proportionate to the files changed and record exact results in the
handoff. Do not claim a check passed unless it ran.

### Hub or any static game

- Serve the repository over HTTP; do not rely only on `file://` behavior.
- Open the hub, follow the affected card, and check the browser console.
- Verify direct navigation to the affected game path.
- For mobile changes, test a phone-sized viewport and relevant touch controls.

### Ashen Rail

From `games/ashen-rail/`:

```sh
npm run assets:inspect
npm run lint
npm run test
npm run build
```

Then run a browser smoke test. CI runs these four commands on every push to
`main`.

### Snake Game

From `games/snake-game/`:

```sh
npm run lint
npm run build
```

Confirm the rebuilt tracked `dist/index.html` works through the hub.

### Tower Defense

From `games/tower/`:

```sh
npm run build
```

Confirm the rebuilt tracked `dist/index.html` and relevant gameplay path in a
browser.

### Xiangqi AI

From `games/xiangqi-ai/`:

```sh
npm run build
node js/engine/selftest_legal.js
node js/engine/selftest_search.js
node js/engine/selftest_perf.js
```

Record any environment-specific limitation instead of silently skipping it.

### Royale, Snooker, Gomoku, Big Two, Dou Dizhu, Penny Crush

There is no single root test command that certifies these games. Use targeted
tests or existing self-check hooks where present, syntax/import checks where
useful, and a real browser smoke for the changed flow. Online-mode changes require
multi-client verification and must state whether Supabase migrations were merely
added or actually applied.

Royale specifics that repeatedly matter:

- Headless smoke runs under swiftshader, where `requestAnimationFrame` drops to
  roughly five frames per second. Wall-clock waits overshoot; step the simulation
  manually (`for (...) game.update(1/60)`) and freeze it before capturing.
- `main.js` exposes `window.__royale`, `__royaleRenderer`, `__royaleCamera`,
  `__royaleComposer()`, `__royaleShake()`, and `__rts` for automated inspection.
- Treat a flat GPU resource count across repeated match/menu cycles as the leak
  gate; the current baseline is 116 geometries (including the persistent
  instanced unit-clarity layer from ADR-020).
- The cloud sandbox cannot reach Supabase, so live PvP paths (matchmaking,
  reconnect, disconnect grace, walkover) can only be certified on real devices.

## Deployment and Git rules

- GitHub is the relay point between Codex and Claude Code; local-only context is
  not a completed handoff.
- `origin/main` is the shared integration baseline for sequential work.
- Local Codex start: run `./scripts/agent-context.sh --sync`. Fetch remote state
  first, safely fast-forward a clean branch that is only behind, and only then read
  the handoff from disk.
- Claude Code cloud start: confirm the intended branch/upstream, fetch GitHub, and
  safely fast-forward before reading the handoff. A cloud checkout is not assumed
  current merely because it is hosted remotely.
- Sequential work may hand off on the same branch after a verified commit and
  push. Parallel work must use separate task branches.
- The finishing agent updates code and handoff in the same commit, pushes it, and
  verifies the remote branch. The receiving agent does not begin from an
  uncommitted or unpushed handoff.
- Do not automatically merge old `claude/*` or `auto/*` branches merely because
  commits are not ancestors of `main`; equivalent work may already have evolved
  elsewhere.
- Never auto-commit or auto-push without Penny's authorization.

## Context maintenance rules

- `PROJECT_CONTEXT.md`: stable facts and commands only.
- `HANDOFF.md`: replace with the latest active state; target at most 120 lines.
- `DECISIONS.md`: append only durable decisions, not progress updates.
- Git commits/diffs remain the evidence. If documentation contradicts source or
  Git, investigate and correct the documentation in the same task.
