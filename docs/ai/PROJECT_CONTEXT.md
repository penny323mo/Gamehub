# Game Hub project context

This is the stable map shared by Codex and Claude Code. Keep it concise and update
it only when architecture, entrypoints, deployment, or verification commands
change. Day-to-day progress belongs in `HANDOFF.md`.

## Repository purpose

Game Hub is a static multi-game website. The four-card paged launcher in `index.html` and
`launcher.js` renders the generated `games/catalog.generated.js` view of
`games/manifest.json`, then links to independent games under `games/`. Preserve the hub as a
collection: a new or heavily revised game should remain self-contained unless a
shared subsystem genuinely belongs in `games/shared/`.

Production is deployed from `main` by `.github/workflows/deploy-pages.yml` to
GitHub Pages. Every deploy validates GameCatalog and the 13-game Hub fast gates;
the manifest-derived ReleaseGate runs the affected games' full build/test plans,
or all games for shared, test, CI, catalog, unknown-game and explicit manual changes.

## High-level map

| Area | Entrypoint | Stack / notes |
| --- | --- | --- |
| Hub launcher | `games/manifest.json`, `games/catalog.generated.js`, `index.html`, `launcher.js`, `style.css` | Manifest is canonical; generated classic script keeps four-card startup synchronous and Pages-safe. |
| Gomoku | `games/gomoku/index.html` | Static JS, online features use Supabase. |
| Penny Crush | `games/penny_crush/index.html` | Static game. |
| Big Two | `games/big2/index.html` | Static JS; online/shared infrastructure may use Supabase. |
| Dou Dizhu | `games/doudizhu/index.html` | Static JS; online/shared infrastructure may use Supabase. |
| Snooker | `games/snooker/index.html` | 2D and 3D modes plus shared `games/snooker/online.js`. |
| Tower Defense | `games/tower/dist/index.html` | Vite + TypeScript + Three.js; tracked `dist/` is the hub target. |
| Neon Snake | `games/snake-game/dist/index.html` | React + Vite + TypeScript; tracked `dist/` is the hub target. |
| Empire Royale | `games/royale/index.html` | Static ES modules + vendored Three.js. Two modes: Clash-style lane battle (`game.js`, `ai.js`) and LV2 age-of-empires RTS (`src/rts/`). Shared: `models.js`, `rig.js` (procedural bone animation), `sfx.js`, `net.js`/`pvp.js` (Supabase PvP), `leaderboard.js`, `storage.js`, `gauntlet.js`, `profiles.js`. Regression suite in `games/royale/tests/`. |
| 深淵之橋 MOBA | `games/moba/index.html` | Static ES modules + vendored Three.js. Deterministic sim, 3v3 bots, mobile HUD, anywhere-purchase shop, and procedural champion FX. Tests in `games/moba/tests/`. |
| Racing Car 3D | `games/Racing Car/index.html` | Static ES modules + vendored Three.js. Continuous spline track (`track.js`) with cached nearest-point samples, track-specific crest/elevation profile plus bounded grade load, route-specific rolling roadside terrain in the single ground mesh, subtle asphalt tyre-wear/dashed centre texture, curvature-derived render-only drift zones with three-stage road-painted entry/apex/exit cues and an arc-distance next-turn HUD, day/dusk/night environment (`environment.js`), sport-arcade acceleration with bounded body pitch/roll and a tuned mid/high-speed power envelope, closer/lower chase camera with bounded acceleration impulse and pointer-transparent speed-streak layer that starts before top speed, bounded driving effects, player-only arcade assists and simple auto-throttle controls, procedural merged-geometry wheel spin/steering (`wheel-motion.js`), four physical AI rivals plus a transparent clone of the normalized player GLB ghost (`rivals.js`, `ghost.js`), and a persistent three-race championship with career records (`season.js`). Draco-compressed player car. Tests in `games/Racing Car/tests/`. |
| Ashen Rail | `games/ashen-rail/dist/index.html` | Self-contained Vite + TypeScript + Babylon.js bonus game; soldier GLB has no clips, so `ProceduralPlayerAnimator` supplies rig-aware locomotion/aim/recoil and `WeaponSystem` supplies local weapon recoil; CI builds `dist/`. |
| Elden Ring II | `games/elden-ring-ii/dist/index.html` | Self-contained Vite + React + TypeScript + Three.js/Cannon-es bonus game; three classes, mobile touch controls, local run history, optional Supabase write, bundled CC0 assets; tracked `dist/` is rebuilt by CI. |
| Xiangqi AI | `games/xiangqi-ai/dist/index.html` | Vite + Three.js; hub targets tracked `dist/`; optional board environment HDR is bundled under `assets/` and copied into `dist/assets/`. |
| Database | `supabase/migrations/` | Append-only numbered migrations; never edit an applied migration casually. |

## Current architectural invariants

- `games/manifest.json` is the only authority for public game order, metadata,
  entry paths and release commands. `launcher.js` consumes the generated
  `globalThis.GameCatalog`; after manifest edits run
  `node scripts/build-game-catalog.mjs` and never hand-edit the generated file.
- GitHub Pages runs under a repository subpath, so game asset URLs must remain
  relative or otherwise Pages-safe.
- Ashen Rail remains a self-contained bonus game inside the existing hub. Its Vite
  base is relative and deployment builds its ignored `dist/` from source.
- Elden Ring II is also self-contained. Its Vite base and runtime model/audio URLs
  stay relative because the game is hosted below `games/elden-ring-ii/dist/`.
  GitHub Pages has no server runtime: localStorage is the default persistence and
  Supabase remains optional through browser-safe `VITE_SUPABASE_*` values only.
- Tower, Snake, and Xiangqi hub links currently target committed `dist/` output.
  Source-only changes to those games are incomplete until the required dist output
  is regenerated and verified.
- Snake's name-entry form must stop Enter key propagation before the global game
  keyboard handler, and its board/header widths must stay bound to the mobile
  viewport; `tests/snake-flow.mjs` is the real-browser lifecycle gate. `isSpeedBoost`
  is refreshed on each tick from the held Shift ref or timed-food expiry, so a timed
  boost cannot become permanent after render; blur/hidden events clear the held input.
- Xiangqi's environment map is a local Vite `?url` import of the CC0 Studio Small 09
  HDRI. Keep the tracked `.hdr` in `games/xiangqi-ai/dist/assets/`; do not reintroduce
  a runtime Poly Haven URL. The renderer's local key/rim/ambient lights remain the
  playable fallback if HDR decoding fails.
- Tower's battlefield rules come from `games/tower/src/core/mapLayout.ts`. Render,
  camera, picking, and economy code consume its `LAYOUT` cell metadata instead of
  deriving separate rectangular masks. `route.ts` smooths the authoritative grid
  path for movement without changing build adjacency. `chapters.ts` is the shared
  five-act presentation/tactical timeline. The shared playable surface is
  `SURFACE_Y = 0.2`; resumable runs are saved only at safe prep boundaries. The
  `window.__TD.擂台()` diagnostic arena suppresses automatic wave spawning so
  combat measurements stay locked to manually spawned targets.
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
- Racing Car's sport-arcade presentation is layered around the established
  bicycle model: `CFG` owns the acceleration/steer envelope, `Car.bodyPitch` and
  `bodyRoll` stay bounded, `#sync()` compensates the rigid car mesh's floor
  envelope, and `#speed-lines` must remain `pointer-events:none` below the HUD.
  `Track.surfaceYAtT()` / `surfaceBankAtT()` / `surfacePitchAtT()` are a bounded
  surface profile: the road ribbon, kerbs, guardrails, terrain and trackside
  anchors follow it, while collision/progress remains on the established X/Z grid.
  `Car.renderY` never feeds gameplay. `Car.suspensionHeave` is a bounded
  render-only chassis compression/rebound driven by pitch-rate transitions and
  vertical render-surface rate; it must reset to zero and never feed the
  contact shadow, physics or progress.
  `Car.trackPitch` is the explicit, bounded
  longitudinal grade input: it may contribute a small slope load to speed, but
  never changes `Car.pos.y`, nearestT, collision, checkpoints, progress or AI.
  `Car.longAccel`/`lateralAccel` remain render feedback and `gradeAccel` is the
  only physics-facing grade term; camera impulse,
  bounded camera grade/turn-load lean,
  speed-limited offroad rumble and the bounded exhaust pulses must remain render-only,
  smooth, reset on start/track build, and never feed physics. `Car.reset()` must clear
  posture, rescue and lock flags before the first render of a new run.
- Racing Car's hot runtime queries use `Track.querySamples` (240 precomputed XZ
  points) and `Car._nextPos`; direction-only main recovery, wrong-way tangents and
  AI lateral offsets use `Track.tangentAtT()` with reused scratch vectors, while AI
  keeps spline points for accurate aim targets. Rival matrix axes also reuse optional
  targets/scratch vectors. Keep those allocations out of the frame loop. Road
  centre/tyre-wear cues, surface-anchored tyre smoke and
  exhaust pulses and brake glow belong in the existing texture/effects instance pass
  so the mobile draw budget does not gain a road-marker, tail-smoke or brake-glow pass.
  Terrain height is built once as a **96×96 single mesh**; the extra
  under-road clearance and triangle-cross-over gate keep curved-road terrain
  from intruding into the ribbon. Do not replace it with per-frame terrain
  generation or a second road pass.
- Racing Car roadside ground uses `Track.terrainHillAmplitude` (turbo **0.95**,
  coast **0.82**, touge **1.15**) and a deterministic `terrainPhase` to add bounded
  low-frequency undulation only where the road blend fades out. It is render-only:
  `terrainYAt()` must not alter road surface, X/Z collision, route, progress or AI;
  `TERRAIN_ROAD_CLEARANCE` keeps the terrain below the road while the blend is
  active, and tree anchors must keep querying the same helper so roots do not
  float or sink.
- Racing Car drift guidance is derived at build time from `Track.#radiusAt()` into
  `driftZones` (maximum seven per direction/profile). Each zone owns `entryT`,
  `t`, `exitT`, `direction` and `turnSign`; the three arrow meshes are built once,
  merged into the existing kerb vertex-color geometry, and the source
  `drift-zone-cues` InstancedMesh remains hidden for diagnostics. HUD preview uses
  arc-length from the current nearest sample. Keep this render/DOM layer out of
  physics, checkpoints, AI, progress and ranking; keep the **<18 calls / <120k
  triangles** gates green.
- Racing Car's replay ghost is the normalized painted player GLB cloned once at load.
  Every ghost mesh gets its own transparent material (opacity ≤ **0.32**, depth-write
  off), and `main.js` positions the root with the same road `y/pitch/bank` surface pose.
  Ghost meshes also own independent cloned geometry and a render-only
  `createWheelMotion()` controller driven by replay displacement/yaw; this must
  never mutate the player model or enter physics. `RivalField` reserves its
  InstancedMesh for four physical rivals only; keep the transparent GLB within
  the **20 calls / 120k triangles** combined mobile budget and never let the ghost
  enter physics, ranking, collision or progress.
- Racing Car's visual track profile uses the `elevation` value on each track
  definition (turbo **1.34**, coast **1.14**, touge **1.40**) plus closed integer
  frequency waves (`1.78/0.75/0.28`) to create a more legible crest/grade at build time. The
  constructor clamps this render-only multiplier to **0.75–1.40**; physics,
  collision, progress, checkpoints and AI stay on the established X/Z grid.
  Corner chevrons are upright render-only warning
  signs built once from profile curvature. Their single shape includes a short
  integral stem;
  keep them outside the road ribbon and inside the guardrail, use the single
  `corner-chevron-landmarks` InstancedMesh (six to fourteen instances per
  track), and keep palette/high contrast independent from steering, collision,
  checkpoints, progress and speed.
- Racing Car's rigid GLB has no wheel bones/clips; `wheel-motion.js` classifies
  four merged-geometry wheel clusters for render-only spin and front steering.
  It must not become a physics, collision or gameplay dependency. Turbo's default
  route keeps its long start straight, then feeds a high-speed right bend into
  an offset reverse-S and deep hairpin for a brake → handbrake → countersteer →
  throttle-out drift rhythm; the Catmull-Rom centreline remains the sole source
  for road, grid, checkpoints, AI and reverse routes. Because the player GLB
  merges body and tyre vertices, wheel motion updates positions but deliberately
  leaves the shared normal attribute untouched; rotating those normals per frame
  makes body/tyre specular seams flicker on mobile.
- Racing Car's current sport envelope is deliberately bounded: `engineForce=10000`,
  `maxSpeed=68`, `dragCoef=2.4`, `gradeGravity=4.6`, and `handbrakeGrip=0.35` are
  tuned against the physical drift/ABS/grade gates. The speed-streak layer begins
  at `10 m/s`, caps at opacity **0.82** and remains render-only; do not turn it into
  a pointer-input dependency.
- Simple mode keeps `AUTO_LIFT=0.4` and full-lock throttle at `0.6`, but its lift shape
  has a 25% steering knee: tiny corrections keep >90% push while a half-stick turn
  gives the rear axle back enough grip for responsive mobile turn-in. Touch steering
  smoothing is faster than keyboard smoothing; keep the end-to-end touch t45 gate green.
- Ashen Rail's player GLB has a skeleton but no animation clips. `ProceduralPlayerAnimator`
  owns semantic rig aliases and procedural locomotion/aim/recoil; `PlayerController` owns
  turn-rate input and `WeaponSystem` owns local weapon recoil. The `__ashenRail` seam is
  dev-only and must not become a production gameplay dependency. Its entry preloads the
  shared safe-storage shim before modules; `scripts/prune-dist.mjs` rewrites that classic
  script's path for the nested tracked `dist/` deployment, so blocked storage cannot stop
  boot.
  Keep the 0–80, drift, autopilot, floor-clearance, and mobile layout gates green.
- 深淵之橋 uses `Sim#atFountain()` only for healing/recall location. `Sim#canShop()` permits
  purchases anywhere; do not re-couple those concepts. Its Hub link and changed entry assets use
  one cache-bust token so Safari cannot keep an obsolete shop UI/rule after a Pages deploy.

## Verification matrix

Choose checks proportionate to the files changed and record exact results in the
handoff. Do not claim a check passed unless it ran.

### GameCatalog / release infrastructure

```sh
node scripts/build-game-catalog.mjs --check
node tests/catalog.mjs
node tests/release-gate.mjs
node scripts/release-gate.mjs --file games/<game>/... --tier full
```

`games/manifest.json` owns the 13-game inventory and structured `fast`/`full`
commands. ReleaseGate executes argv arrays without a shell, applies bounded
timeouts, selects only a directly changed game, and fails closed to all games for
shared, Hub-test, CI, catalog, unknown-game or explicit `--all` releases. Deploy CI
installs package-lock dependencies selected by that plan, runs its `full` tier,
and always runs Hub layout/load/touch/storage/home browser gates.

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

### 深淵之橋 MOBA

```sh
node games/moba/tests/cache-bust.mjs
node games/moba/tests/sim.mjs
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  node games/moba/tests/browser.mjs
```

The browser suite covers landscape/portrait touch purchase and all shop exit routes as well as
gameplay, FX, cleanup, and full-match gates. The in-match gear is the mobile-safe
"open settings and pause" entry; `main.js` keeps manual, visibility, and WebGL-context pause
reasons separate so closing one overlay cannot resume another pause. Visual changes still need a
real rendered inspection.

### Elden Ring II

From `games/elden-ring-ii/`:

```sh
npm ci
npm audit
npm test
```

`npm test` runs TypeScript, the relative-path production build, and static asset
gates. Then use a real browser to follow the Hub card and verify the title screen,
game start, movement, right-side camera drag, mobile touch controls, and zero
failed model/audio requests or console errors.

The long witness `node --experimental-strip-types tests/playthrough-full.mjs` writes
to `/tmp/gamehub-elden-ring-ii-playthrough-full.txt` by default. Override with
`ER2_PLAYTHROUGH_OUT=/path/to/file`; set `PW_CHROMIUM` when the default cloud
Chromium path is not present. The witness drives visible/input-equivalent movement,
healing and telegraph dodges, then emits `PLAYTHROUGH=PASS` and exits non-zero unless
the game itself reports chapter 3 `status=victory`; a timeout, death, or merely
reaching the boss is a failure.

### Snake Game

From `games/snake-game/`:

```sh
npm run lint
npm run build
cd ../..
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/snake-flow.mjs
```

`npm run build` regenerates the tracked hub target. `npm run lint` is expected to be
clean; three intentional external/visual hydration effects use narrow file-level
suppression comments. The mobile browser gate checks
Enter login isolation, responsive width before/after start, real ticks, pause/resume,
return-to-Hub, and unexpected browser errors. Vite may print the existing non-fatal
classic `safe-storage.js` script warning while still producing a valid tracked build.

### Tower Defense

From `games/tower/`:

```sh
npm ci
npm audit --audit-level=high
npm test
```

`npm test` rebuilds tracked `dist/`, then runs core, real-browser flow/gameplay,
renderer-resource, desktop and 844×390 mobile gates. For a slower deterministic
balance witness, run:

```sh
node tests/playthrough.mjs 99 20 0.04 0.0016 198
node tests/playthrough.mjs 99 30 0.04 0.0016 198
node tests/playthrough.mjs 99 999 0.04 0.0016 198
```

The harness reports how far a simple spend-and-build policy gets rather than
acting as a binary regression gate. Visual or control changes still need a real
rendered inspection at the affected viewport.

### Xiangqi AI

From `games/xiangqi-ai/`:

```sh
npm run build
node js/engine/selftest_legal.js
node js/engine/selftest_search.js
node js/engine/selftest_perf.js
cd ../..
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/xiangqi-flow.mjs
```

The browser flow gate covers real mobile tap → AI response → undo → refresh/Continue
storage consistency. Record any environment-specific limitation instead of silently
skipping it.

### Gomoku

```sh
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/gomoku-flow.mjs
```

The browser flow covers mobile human tap → delayed AI response, immediate return-to-menu and fresh-game
restart, and verifies that a stale AI timer cannot place a stone in the new game. It also checks the six local
script cache tokens stay aligned; optional online probes are intentionally blocked in the offline harness.

### Big Two

```sh
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/big2-flow.mjs
```

The browser flow covers mobile local start → CPU delayed turn, immediate exit and fresh restart, and verifies
that an old CPU timer generation cannot consume cards from the new deal. It also checks the two local script
cache tokens stay aligned; optional online probes are intentionally blocked in the offline harness.

### Dou Dizhu

```sh
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/doudizhu-flow.mjs
```

The browser flow covers mobile local start → human bid → delayed CPU bid, immediate exit and fresh restart, and
verifies that an old bidding/play timer generation cannot mutate the new deal. It also checks the eight local
script cache tokens stay aligned; optional online probes are intentionally blocked in the offline harness.

### Penny Crush

```sh
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/penny-crush-flow.mjs
```

The flow uses a deterministic forced swap on a mobile 8×8 board, verifies Restart invalidates the prior
消除／補位 async chain, and then verifies a fresh match still completes and scores. `generation` is the
local lifecycle authority; source changes to the async match pipeline must preserve that guard.

### Snooker

```sh
PW_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node tests/snooker-flow.mjs
```

The flow covers the root single-player picker, mobile 2D canvas drag-to-shot and restart, 3D WebGL
start state, return navigation, and zero unexpected browser errors. Online room probes remain intentionally
outside the offline gate.

### Royale

There is no single root test command that certifies these games. Use targeted
tests or existing self-check hooks where present, syntax/import checks where
useful, and a real browser smoke for the changed flow. Online-mode changes require
multi-client verification and must state whether Supabase migrations were merely
added or actually applied.

Racing Car 3D has its own suite; run it for any change under `games/Racing Car/`.
The folder name contains a space, so quote it in shell commands and percent-encode
it in links (`games/Racing%20Car/index.html`):

```sh
cd "games/Racing Car/tests"
npm install        # once
PLAYWRIGHT_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  npm test         # full runner; may report a bounded TIMEOUT under repeated Chrome launch pressure

# On a pressured Mac, use these authoritative suites separately:
PLAYWRIGHT_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node race.mjs
PLAYWRIGHT_CHROMIUM='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node setup.mjs
```

The autopilot lap is the load-bearing gameplay check: a broken track shape, an
impossible corner, or barriers too close to the road all fail it immediately. The
setup suite also guards the continuous-ribbon renderer, mobile geometry budget,
idle render-on-demand, 320×568 portrait and 667×375 landscape control/HUD layout,
dual-touch input, adaptive DPR limits, pause/wake-lock lifecycle, WebGL context
loss/restore, orientation pause, settings, gyro mapping, and minimap.
The Racing Car harness reads `PLAYWRIGHT_CHROMIUM` (the root Hub/MOBA harnesses read
`PW_CHROMIUM`); `run-all.mjs` puts a per-suite timeout, process-group cleanup and a
5-second default teardown window around the same children, so a Chromium allocator
hang is reported as `TIMEOUT` instead of leaving CI waiting forever. If a child reports
only the known `__racer.ready` timeout, the aggregate runner performs one bounded
readiness-only retry; assertion failures are not retried. The shared `openRacer()` also
closes its browser and HTTP server on readiness failure, so a timed-out child cannot
poison the next suite. `RACER_TEST_SETTLE_MS` can override the settle window when a
machine needs a different value. Run the WebGL suites separately under GPU pressure;
a bounded aggregate timeout is not gameplay evidence.
It also verifies the enlarged floating analogue joystick/right-thumb slide-action cluster, the
day/dusk/night sky, stars, headlight, reflective-track states, fixed-capacity driving
effects, player-only arcade assists, simple-mode/gyro input, rivals/ghost/season career
rules, and the combined night + rivals + ghost + effects
render budget, dual-touch and
capture-loss reset, asymmetric notch safe areas, `viewport-fit=cover`, and the on-device
performance report contract (FPS windows, long frames, DPR, viewport, track, control mode,
gyro direction/sensitivity, screen orientation, audio state, and copy feedback) used for
physical-phone handoff evidence. The startup gate requires the first
complete WebGL frame plus pre-drawn minimap/HUD before the loading overlay reveals Start.
The car keeps raw `trackPitch`/`trackBank` as surface truth and applies a bounded
render-only suspension follow (max 0.018/0.015 rad) to the visual root, so stronger
crest/bank transitions have weight without changing `Car.pos.y`, collision, progress,
AI, or the contact-shadow anchor. `Car.update()` may additionally use the current
track pitch through the bounded `CFG.gradeGravity`/`gradeAccel` term to make speed
rise/fall over a hill; this is the only gameplay-facing surface cue and must not
become a height/collision query. `main.js` also smooths a clamped `cameraGrade`
  copy of raw `trackPitch` into small chase-camera position/look-target offsets, and smooths a
  clamped `cameraLean` from lateral load/yaw into a ±0.032rad horizon cue; both reset on
  start/track build and must remain render-only (no FOV, input, physics or per-frame curve query).
  The chase look target may blend up to 0.24 toward a 12–22m ahead track tangent from the
  existing 240 query samples via `Track.tangentAtT()`, and `cameraElevationLook` may add a
  bounded ±0.18 look-target elevation cue from an independent 24–42m cached `surfaceYAtT()`
  profile. Both are render-only and must not call Catmull-Rom per frame or change the car's
  actual travel direction; reset both on start/track build.
  `syncCarRenderSurface()` updates the contact shadow in the same transaction so reset/track
  changes cannot leave one frame of stale shadow placement.

Royale has a committed regression suite. Run it for any change under
`games/royale/`:

```sh
cd games/royale/tests
npm install        # once
npm test           # leak, gauntlet, combat, pvp-guest, match; non-zero exit on failure
```

The harness waits for the visible start screen after loading and uses a bounded
retry around the test-only tutorial flag; this prevents software-renderer page
startup races from masquerading as game failures. `PLAYWRIGHT_CHROMIUM` selects a
local browser when `/opt/pw-browsers/chromium` is absent.

It covers the ADR invariants that are cheap to break silently: the GPU leak gate
(ADR-008), gauntlet condition symmetry (ADR-007/013), the `Game#damage` funnel,
PvP guest viewpoint mapping (ADR-011), and match lifecycle. See
`games/royale/tests/README.md`. The suite is test-only; production still needs no
build step.

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
