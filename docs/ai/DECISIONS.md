# Durable agent decisions

Record only decisions that future Codex and Claude Code sessions must preserve.
Progress, temporary debugging notes, and next tasks belong in `HANDOFF.md`.

## ADR-001: Repository-tracked context is the shared memory

- Date: 2026-07-26
- Status: accepted
- Decision: `docs/ai/PROJECT_CONTEXT.md`, `HANDOFF.md`, and `DECISIONS.md` are the
  canonical cross-agent context. Product-specific chat memory may help an agent,
  but it must not be required for the other agent to resume.
- Reason: Codex and Claude Code do not share conversation memory. Git-tracked
  context travels with local and cloud checkouts and can be audited against code.

## ADR-002: One short current handoff, with Git as history

- Date: 2026-07-26
- Status: accepted
- Decision: overwrite `HANDOFF.md` with the current active state instead of
  appending a permanent activity diary. Keep it under roughly 120 lines. Git
  history preserves old handoffs.
- Reason: a short handoff bounds startup cost and reduces stale instructions.

## ADR-003: Code and handoff move together

- Date: 2026-07-26
- Status: accepted
- Decision: the agent completing a task updates the handoff after verification and
  includes that update in the same commit as the completed code whenever practical.
- Reason: another agent must not receive a handoff that describes code unavailable
  on its branch.

## ADR-004: Parallel agents use separate branches

- Date: 2026-07-26
- Status: accepted
- Decision: sequential agents may relay a clean, pushed branch. Concurrent Codex
  and Claude Code work uses separate `codex/<task>` and `claude/<task>` branches,
  with non-overlapping scopes where possible.
- Reason: shared-memory documents do not prevent Git conflicts or partial worktree
  overwrites.

## ADR-005: Evidence beats handoff prose

- Date: 2026-07-26
- Status: accepted
- Decision: Git state, current source, test output, and browser witnesses are
  authoritative. If a handoff conflicts with evidence, stop, investigate, and fix
  the handoff rather than blindly continuing.
- Reason: documentation can become stale; the protocol must fail visibly instead
  of spreading an incorrect assumption.

## ADR-006: GitHub is the relay; synchronize before reading handoff

- Date: 2026-07-26
- Status: accepted
- Decision: the finishing agent commits code and handoff together, pushes the
  authorized branch, and verifies the remote result. The receiving agent fetches
  and safely fast-forwards its checkout before reading the handoff. Local Codex
  and cloud Claude Code use different environments but the same remote checkpoint.
- Reason: reading a locally stale handoff defeats the protocol even when the
  document format itself is correct.

## ADR-007: Royale AI difficulty comes from tactics, never from resources or hidden information

- Date: 2026-07-26
- Status: accepted
- Decision: Empire Royale AI opponents play by the same rules as the player. No
  elixir/resource multipliers beyond a small capped gauntlet ramp, no reading the
  player's hand, no privileged placement. Higher difficulty is expressed as faster
  decision cadence, elixir counting from public `playedCards`, lane pressure,
  proportional defence budgets, and data-driven counter selection.
- Reason: a player reported the stage-8 AI spamming war elephants; the cause was an
  uncapped +15%/stage economy bonus feeding a "always play the highest-HP tank"
  branch. Economy advantages read as cheating and hide weak AI logic.

## ADR-008: Anything disposeDeep can reach owns its material

- Date: 2026-07-26
- Status: accepted
- Decision: Royale's `disposeDeep` disposes geometries and materials
  unconditionally. Objects that it may reach (RTS entities, effects, guest-side
  meshes) must use per-instance materials, never the shared `mat()` cache in
  `models.js`. The RTS module keeps its own `lmat()` helper for this reason.
- Reason: disposing a cached material silently breaks every other object still
  using it. The regression guard is the GPU resource baseline: repeated
  match/menu cycles must stay flat at 116 geometries (the extra persistent entry
  is ADR-020's instanced clarity layer).

## ADR-009: Royale unit animation is procedural bone animation

- Date: 2026-07-26
- Status: accepted
- Decision: the Meshy character GLBs are skinned but ship zero animation clips.
  All motion is generated at runtime by `games/royale/src/rig.js`, which infers
  legs, torso, and arms from rest-pose skeleton geometry because the joints are
  unnamed (`Bone_NNN`). Per-unit gait and one of four attack styles
  (swing/thrust/shoot/cast) are configured in `models.js`.
- Reason: an agent assuming baked clips will look for animation data that does not
  exist, and name-based rig lookups fail on these auto-rigged skeletons.

## ADR-010: Royale ships Draco-compressed models with a vendored decoder

- Date: 2026-07-26
- Status: accepted
- Decision: `games/royale/assets/models` is Draco-compressed (26MB to 1.3MB) and
  `games/royale/vendor/draco/` holds the same-origin decoder. Never commit
  uncompressed replacements, and never point the loader at an external CDN.
- Reason: the game must stay installable from a static Pages subpath with no build
  step and no third-party runtime dependency.

## ADR-011: Royale PvP is a host-authoritative relay; transient effects need explicit sync

- Date: 2026-07-26
- Status: accepted
- Decision: the host runs the only real simulation and broadcasts snapshots; the
  guest renders a mirror. Anything the guest cannot infer from entity state -
  spell impacts, death explosions, heal pulses - must travel in the snapshot `fx`
  channel. Snapshot shape changes require updating host serialize, guest apply,
  and the persisted reconnect snapshot together.
- Reason: guests silently saw no spell explosions for the entire PvP lifetime
  because the effects existed only in host-local code.

## ADR-012: Royale degrades graphics on WebGL context loss instead of capping everyone

- Date: 2026-07-26
- Status: accepted
- Decision: post-processing runs with MSAA at full device pixel ratio by default.
  A real `webglcontextlost` event sets the `royale_gfx_safe` localStorage flag, and
  later loads use conservative settings on that device only.
- Reason: post-processing render targets can exhaust memory on some phones, but
  lowering quality globally to protect a minority both dulls the image and removes
  the canvas antialiasing that EffectComposer bypasses.

## ADR-013: Royale gauntlet stages vary through symmetric battlefield conditions

- Date: 2026-07-26
- Status: accepted
- Decision: gauntlet stage variety comes from `games/royale/src/gauntlet.js`, a
  data table of conditions that apply equally to both sides, plus a deterministic
  opponent rotation. `Game` accepts a `rules` override (merged over `GAME_RULES`),
  `towerHpMult`, and `fountainFromStart`, and every rule read inside the match
  goes through `this.rules`, including `ai.js` and `ui.js`. Conditions must never
  override `elixirMax`, and must never favour one side.
- Reason: stages previously differed only by difficulty label, so the ladder felt
  identical from stage 3 onwards. Making difficulty come from asymmetric numbers
  is exactly what ADR-007 forbids, and reading `GAME_RULES` directly made
  per-match rules impossible without editing shared constants.

## ADR-014: Royale first-run tutorial pauses play and does not interrupt veterans

- Date: 2026-07-26
- Status: accepted
- Decision: a fresh player's first single or gauntlet match opens the three-step
  tutorial and pauses simulation until completion or skip. Completion is stored in
  `royale-save-v1`; saves with any recorded match do not auto-open it. The `❓`
  HUD button always allows replay. PvP and LV2 never auto-open this Clash tutorial.
- Reason: onboarding must not let the AI attack while the player reads, must not
  surprise existing players after an update, and must remain recoverable after a
  skip without adding a second settings screen.

## ADR-015: Royale player profiles are local save slots, not cloud accounts

- Date: 2026-07-26
- Status: accepted
- Decision: Royale supports multiple players on one browser through a name and a
  4–12 character local code. Each player receives separate save, leaderboard name,
  and leaderboard identity keys. Codes are stored as salted SHA-256 hashes, never
  plaintext. The first created player copies the legacy `royale-save-v1` and
  player id into its scoped keys; the legacy keys remain untouched as a recovery
  fallback.
- Reason: Penny needs a lightweight way for different local players to resume
  their own progress without introducing authentication infrastructure. This code
  separates save slots only: it cannot recover data on another device and is not
  a security boundary or a cloud password.

## ADR-016: Royale lane pressure uses visible battlefield state only

- Date: 2026-07-26
- Status: accepted
- Decision: the left/right pressure HUD derives strength only from living,
  non-building units already visible on the battlefield. Each unit contributes
  its card cost divided by summon count, scaled by remaining HP. It updates at 4Hz,
  warns only when enemy pressure is at least 4 and 35% above friendly pressure,
  and mirrors world x for the PvP guest's 180-degree camera.
- Reason: players need a quick defence cue during dense battles, but the cue must
  not expose the AI hand, elixir, intended placement, or any other hidden state.
  Per-unit cost splitting prevents swarm cards from being counted multiple times.

## ADR-017: Royale tactical recap samples simulation time, not wall time

- Date: 2026-07-26
- Status: accepted
- Decision: the post-match tactical recap reuses the visible lane-pressure samples
  from ADR-016. Danger duration advances from the Game/GuestGame simulation clock,
  so tutorial pause, background throttling, and render speed do not inflate it.
  The recap reports the most pressured lane, any-danger duration, strongest push,
  and one bounded coaching message; it does not persist hidden analytics.
- Reason: wall-clock sampling would punish a player for reading the tutorial or
  running on a slow device. A compact actionable recap teaches more than a raw
  chart while keeping the analysis explainable from battlefield state.

## ADR-018: Royale highlight replay uses sanitized visible-state snapshots

- Date: 2026-07-26
- Status: accepted
- Decision: single-player and gauntlet matches retain only the latest 12 seconds
  of 5Hz snapshots in memory. Before storage, the enemy hand, elixir, and next
  card are removed. Playback uses the existing guest snapshot renderer in local
  orientation; it never re-simulates battle logic, records rewards, or changes the
  completed result. Replay meshes are disposed through the normal match cleanup.
- Reason: a short result-screen highlight helps players understand the finish
  without requiring deterministic replay infrastructure, persistent telemetry,
  or exposing information the player could not see during the match.

## ADR-019: Royale placement preview and card play share one rules path

- Date: 2026-07-26
- Status: accepted
- Decision: `Game` and `GuestGame` expose `placementInfo`, which returns the same
  clamped position used by `validPlacement` plus a bounded public reason code.
  Selection, drag feedback, and actual card play therefore evaluate one placement
  rules path. Feedback may use current elixir, destroyed towers, and visible
  buildings only; the PvP host remains authoritative over the final command.
- Reason: a red or green ring without an explanation makes touch deployment feel
  arbitrary, while duplicating placement rules in UI code inevitably creates
  cases where the preview says yes and `playCard` says no.

## ADR-020: Royale combat clarity uses one instanced team-marker layer

- Date: 2026-07-26
- Status: accepted
- Decision: living non-building units receive a subtle team-colour ground ring
  through one persistent `InstancedMesh` capped at 72 instances. Full-health unit
  bars appear only while a target is inside attack reach; damaged bars remain
  visible. `GuestGame` maps raw host teams to the local viewer before constructing
  models and HP bars, while retaining raw teams for authoritative snapshots.
- Reason: permanent per-unit meshes or always-visible health bars would multiply
  draw calls and UI clutter in swarm fights. One instanced layer preserves enemy
  and ally silhouettes at phone scale, and local colour mapping prevents a PvP
  guest from seeing their own army in the opponent's red.

## ADR-021: Royale spell warnings are synchronized pre-impact effects

- Date: 2026-07-26
- Status: accepted
- Decision: every spell cast creates a team-coloured telegraph whose fixed outer
  boundary is the true splash radius and whose inner countdown contracts until the
  authoritative cast delay expires. The host sends a `k: 'spell'` event through the
  existing snapshot `fx` channel with the remaining delay, not its private simulation
  timestamp. `GuestGame` maps the raw team to the local viewer before rendering; the
  same path powers highlight replay. Telegraphs may clarify timing but must not alter
  spell damage, radius, or impact time.
- Reason: a static host-only ring neither tells the player when damage will land nor
  warns a PvP guest before the impact. Sending remaining time survives lower snapshot
  rates without restarting a full warning, and preserving the real simulation as the
  authority avoids visual UI changing game balance.

## ADR-022: Royale regression checks live in the repository, not in an agent sandbox

- Date: 2026-07-26
- Status: accepted
- Decision: the Royale checks a handoff cites must exist under
  `games/royale/tests/` and run through `npm test` there. `lib/harness.mjs` owns
  the static server, browser resolution, tutorial suppression, and scoring, so a
  test file contains only its assertions. The leak-gate baseline lives in
  `leak.mjs`; changing it requires saying why in the handoff.
- Reason: the suite previously existed only inside one cloud session's temporary
  directory. A receiving agent could read "leak gate 116 geometries" and had no way
  to reproduce it, which breaks the handoff exactly where verification matters. It
  also meant a feature landing in one agent's session, such as the first-run
  tutorial modal, silently broke automation the other agent could not see.

## ADR-023: disposeDeep also owns per-instance skeleton bone textures

- Date: 2026-07-26
- Status: accepted
- Decision: `disposeDeep` disposes `o.skeleton?.boneTexture` alongside geometry and
  materials. Every `SkeletonUtils.clone` produces its own `Skeleton`, and Three
  lazily allocates a bone `DataTexture` per skeleton (36 bones becomes 12x12), which
  `material.dispose()` never touches.
- Reason: LV2 leaked ten GPU textures per entry because ten skinned units are on the
  map at start; four enter/exit cycles measured 32, 44, 56, 68 textures. With the
  disposal in place the count is flat at 20, the same baseline as Clash. The leak was
  invisible to the Clash gate, which is why `tests/rts.mjs` now watches textures too.

## ADR-024: Effect teardown uses onDispose; onEnd stays a timing hook

- Date: 2026-07-26
- Status: accepted
- Decision: an effect that owns a GPU resource releases it in `onDispose`, which
  runs both when the effect completes and when the match is torn down.
  `onEnd` keeps its original meaning — "the duration elapsed, now do the thing" —
  and is never called during teardown, because for spells it detonates the impact.
- Reason: the crown-pop effect owned a `CanvasTexture` and released it in `onEnd`.
  Destroying a king tower ends the match immediately, so cleanup ran before the
  effect finished and the texture leaked every match. Calling `onEnd` from cleanup
  would have "fixed" the leak by applying spell damage during teardown.

## ADR-025: Body-frame velocity is restored with the axes it was measured in

- Date: 2026-07-27
- Status: accepted
- Decision: in `games/Racing Car/src/car.js`, the new world velocity is composed
  from the forward/lateral axes captured at the *start* of the step, not from the
  axes after the yaw integration. Body slip angle is then measured against the new
  heading.
- Reason: composing with the post-rotation axes rotates the velocity vector exactly
  with the car, so heading and travel direction can never separate by more than one
  frame of lateral acceleration. Measured slip on tarmac was 6 degrees at full lock
  with the handbrake pulled, while grass — where longitudinal drag shrinks the
  denominator — reported 70. Every drift behaviour in the game depends on this: no
  slip angle means no countersteer, no drift scoring, and no reason to have a
  bicycle model at all.

## ADR-026: Yaw damping adds to the rear lateral force, and the steering envelope
follows what the tyres can use

- Date: 2026-07-27
- Status: accepted
- Decision: the yaw damping term is added to `latR`, not subtracted, and
  `steerSpeedDrop` is 2.4 so peak front-wheel angle at speed lands near the tyre's
  usable range.
- Reason: rear yaw torque is `-wheelBaseR * latR`, so subtracting the damping term
  raised the torque in the direction the car was already rotating — a positive
  feedback loop that turned every mid-corner correction into a spin. Separately, a
  skidpad measurement showed 2.2 degrees of front-wheel angle already produces 1g at
  33 m/s; the old envelope allowed 22 degrees there, so a light steering input went
  straight past the tyre's peak, the nose lost force, and the tail came round. Both
  faults were masked by ADR-025's bug, which prevented slip from developing at all.

## ADR-027: A barrier can slow a car down but never end its race

- Date: 2026-07-27
- Status: accepted
- Decision: collision response cancels only the component of motion into the
  barrier — the car keeps sliding along it — and `Race` tows the car back to the
  last checkpoint after three seconds below 2.5 m/s while off-track or in contact.
- Reason: the previous response zeroed a whole axis of both position and velocity,
  so a car nose-in against a barrier stopped dead and stayed there with the throttle
  pinned; the autopilot recorded fourteen thousand consecutive contact frames in one
  run. Sliding contact is the physical behaviour and the tow is the arcade safety
  net; `tests/race.mjs` asserts both, and that a clean lap needs no tow.

## ADR-028: The blocky ground is drawn as merged top-face quads, not cubes

- Date: 2026-07-27
- Status: accepted
- Decision: `games/Racing Car/src/track.js` keeps the cell grid in a `Uint8Array`
  (not a `Map<string>`), renders the ground as run-merged quads with one texel of a
  64x64 nearest-filtered noise texture per cell, and reserves real boxes for the
  barriers. `BLOCK` is 0.5.
- Reason: Penny asked for the grid squares to be less obvious, which means smaller
  cells, which quadruples the cell count. The ground is flat, so only its top face
  is ever visible: two triangles per cell instead of twelve. Because the per-cell
  brightness now comes from a texture rather than vertex colours, adjacent cells of
  the same kind merge into runs — 126,789 cells collapse to 8,928 quads, and the
  whole world is 5 draw calls and 222k triangles at twice the resolution.

## ADR-029: Rear drive force is capped by rear traction

- Date: 2026-07-27
- Status: accepted
- Decision: `driveF` is clamped to `gripRear * loadR` before it is applied, and the
  friction-circle share is computed from the clamped value.
- Reason: without the cap the car received the full engine force as forward thrust
  while the friction circle simultaneously stripped its lateral grip — fast and
  steerless at the same time, which is not a state a real car can be in. It made
  the car spin under power at low speed; the autopilot logged 861 barrier contacts
  on one track and 3 tows per race. With the cap the same run is 90 contacts and
  one tow.

## ADR-030: The chase camera follows travel direction while drifting

- Date: 2026-07-27
- Status: accepted
- Decision: the camera's chase axis is the heading blended toward the velocity
  direction in proportion to body slip, and the position smoothing no longer
  loosens during a drift.
- Reason: aiming the camera down the heading puts the car off the bottom of the
  screen once slip passes about 60 degrees — verified in a screenshot, the car was
  a sliver at the frame edge. In a game whose whole subject is drifting, the drift
  is the moment the player most needs to see the car.

## ADR-031: Barriers merge into runs, which is what lets BLOCK reach 0.25

- Date: 2026-07-27
- Status: accepted
- Decision: barrier cells merge along x into single scaled boxes, the same way the
  ground merges into quads (ADR-028). `BLOCK` is 0.25 and the noise texture is
  128x128 so one texel still covers one cell without visible tiling.
- Reason: after ADR-028 the ground was nearly free and the barriers became the whole
  cost — 15,421 cubes, 185k of the 222k triangles, and the reason the blocks could
  not shrink further. Merged runs scale with the circuit's perimeter instead of with
  1/BLOCK², so 2,364 runs cover the same barriers. At a quarter of the original
  block size the whole world is 86k triangles in 5 draw calls, well under what it
  cost at half the resolution.

## ADR-032: Racing Car separates continuous visuals from its collision grid

- Date: 2026-07-27
- Status: accepted
- Supersedes: the player-visible rendering portions of ADR-028 and ADR-031;
  their compact grid representation remains in force for physics queries only.
- Decision: `Track` keeps the 0.25-unit `Uint8Array` grid solely for drivable
  surface, wall, checkpoint, rescue, and regression queries. Player-visible track
  geometry comes from the closed Catmull-Rom curve: a continuous textured asphalt
  ribbon, segment-coloured kerbs, mesh start line, tube guardrails, instanced posts,
  smooth terrain, and instanced trees. Visual tessellation follows world-space arc
  length and is independent of `BLOCK`. Coarse-pointer devices cap render DPR at
  1.5, and landscape uses a closer chase-camera composition.
- Reason: shrinking voxel cells reduced the obvious square size but could never turn
  coloured grass cells and box walls into a realistic circuit; it also spent mobile
  memory on half a million cells' visual representation. Separating rules from
  rendering preserves the proven three-lap physics while reducing the observed
  scene from 86,121 to about 54–59k triangles and upgrading it to smooth 3D.

## ADR-033: Racing Car owns phone quality and session lifecycle explicitly

- Date: 2026-07-27
- Status: accepted
- Decision: phone users can choose Auto, Sharp, or Battery quality. Coarse-pointer
  DPR caps are 1.5, 1.75, and 1 respectively. Auto samples only active, visible race
  frames in 3.5-second windows, drops DPR by 0.25 below 43 fps, and requires three
  windows above 57 fps before raising it. It never changes simulation or mesh shape.
  Every race offers an explicit pause overlay; visibility loss pauses rather than
  auto-resuming, clears held input, invalidates any pending asynchronous wake-lock
  request, and releases the screen wake lock. Resume resets
  the frame timestamp and reacquires wake lock when the browser supports it.
- Reason: one fixed pixel ratio cannot represent both a recent flagship and a warm,
  throttled older phone. A backgrounded mobile tab can also return with stale touch
  state or surprise motion. Rendering resolution is the safest runtime load control,
  and visible user-controlled resume is safer than guessing when play should restart.

## ADR-034: Racing Car renders continuously only during an active race

- Date: 2026-07-27
- Status: accepted
- Decision: the WebGL/rAF loop runs continuously only while a race is active.
  Menu, pause, and finish states sleep completely; resize, track, paint, and time-of-day
  changes invalidate the scene and request exactly one frame. A finishing race still
  draws its last active frame before sleeping. Portrait controls must fit at 320×568
  with every touch target at least 44px; the 667×375 landscape speed HUD must not
  overlap either the minimap or gas control.
- Reason: a paused 3× DPR phone under 4× CPU slowdown was still issuing 299 WebGL
  renders in five seconds. After render-on-demand it issues zero while paused or in
  the menu, without changing the active-race 60 fps path. The old fixed control sizes
  also clipped 42px of the gas button at 360px portrait width, making a visually
  present control partly untouchable.

## ADR-035: Racing Car player model is 50% larger without changing physics

- Date: 2026-07-27
- Status: accepted
- Decision: normalize the player GLB to a 6.9-unit visual length instead of 4.6,
  and scale its contact-shadow plane by the same 1.5 factor. Keep `Car` physics,
  wheelbase, collision queries, speed, and camera rules unchanged.
- Reason: Penny explicitly requested the car proportion be 50% larger. This is a
  readability/composition change; coupling it to the proven drift model would alter
  control feel and invalidate the three-track gameplay baseline unnecessarily.

## ADR-036: Mobile GPU and orientation interruptions pause before recovery

- Date: 2026-07-27
- Status: accepted
- Decision: a `webglcontextlost` event immediately prevents default teardown, pauses
  the race, clears input, releases wake lock, disables Resume and Return to Menu,
  and exposes a reload fallback. `webglcontextrestored` requests one dirty frame,
  unlocks the controls, and still requires explicit Resume. Orientation change and
  `pagehide` also pause rather than moving controls or leaving the page under held input.
- Reason: forced browser evidence showed the old game remained `running=true` and
  advanced 37 render attempts in 600ms after its GPU context was gone, with no player
  warning. Mobile browsers can reclaim WebGL under memory pressure or app switching;
  physics must not continue behind a black canvas. Rotation likewise relocates touch
  controls, so retaining a held pointer is unsafe.

## ADR-037: Physical phone acceptance uses an in-game performance report

- Date: 2026-07-27
- Status: accepted
- Decision: active race frames record elapsed time, average fps, minimum 3.5-second
  fps window, frames above 34ms, slowest frame, render DPR, viewport, quality mode,
  and track. Returning to the menu exposes one compact report and a 44px copy button.
  Sampling continues in Auto, Sharp, and Battery; it never changes simulation.
  Clipboard feedback says copied only after the Clipboard API or fallback confirms it.
- Reason: desktop emulation cannot certify a physical phone's heat or browser-specific
  frame pacing, and subjective “feels smooth” feedback is too weak to tune safely.
  A report generated on the actual device makes the last acceptance run reproducible
  without collecting user identity, user-agent, credentials, or other private data.

## ADR-038: Racing Car player model is enlarged by another 50 percent

- Date: 2026-07-27
- Status: accepted
- Supersedes: ADR-035 visual size only; its physics-isolation rule remains active.
- Decision: normalize the player GLB to a 10.35-unit visual length, 1.5 times the
  previous 6.9-unit presentation and 2.25 times the original 4.6-unit baseline.
  Scale the contact shadow with it, while leaving `Car` physics, collision,
  wheelbase, speed, camera, and track geometry unchanged.
- Reason: Penny explicitly requested the currently displayed car be 50% larger.

## ADR-039: Racing Car uses modern mobile analogue controls

- Date: 2026-07-27
- Status: accepted
- Decision: replace the two digital steering arrows with one fixed circular analogue
  joystick that emits continuous -1..1 steering, has a centre dead zone, captures its
  pointer, and resets on release or interruption. Arrange circular gas, brake, and drift
  actions as a right-thumb arc with gas as the largest primary action. Preserve keyboard,
  gyro, invert-steering, dual-touch, safe-area, and minimum-target behavior.
- Reason: a modern competitive-mobile control surface gives the left thumb progressive
  steering and the right thumb a clearer primary/secondary action hierarchy than five
  equally weighted buttons. The interaction model is generic; no third-party artwork or
  branded game assets are copied.

## ADR-040: Mobile controls honor asymmetric safe areas and capture loss

- Date: 2026-07-27
- Status: accepted
- Decision: request `viewport-fit=cover`, keep left/right/bottom safe-area values
  independent, and position the fixed game root with dynamic viewport units plus the
  existing fixed-inset fallback. Every held driving pointer must release on
  `lostpointercapture` as well as pointer up/cancel, including joystick visual state.
- Reason: an iPhone landscape notch can occupy either side, while browser chrome changes
  the visual viewport height. Safari or Android system gestures can also revoke pointer
  capture without a normal pointer-up event; stale throttle or steering is unsafe.

## ADR-041: Racing Car completes first-frame warm-up behind loading

- Date: 2026-07-27
- Status: accepted
- Decision: keep the loading overlay visible until the first car/world WebGL frame has
  rendered. Pre-draw the minimap and initialize HUD text while that overlay is present;
  only then reveal the start menu and set the public ready state.
- Reason: under 4× CPU throttling the first race had one 101.2ms frame while later races
  peaked at 18.7ms. Moving real Canvas2D/HUD work and WebGL compilation before player
  interaction reduced the first-race maximum to 31.8ms without excluding it from metrics
  or lowering DPR.

## ADR-042: Racing Car prioritizes thumb continuity and a wider driving surface

- Date: 2026-07-27
- Status: accepted
- Supersedes: ADR-038 visual size and ADR-039 fixed-joystick interaction only.
- Decision: normalize the player car to 6.9 visual units while leaving its physics
  footprint unchanged. Expand the road from 24 to 28 world units without moving the
  guardrails by reallocating two units of grass per side. Use a larger floating left
  steering zone whose captured pointer keeps steering outside the visible circle. Make
  gas the 108px primary action and allow one held gas pointer to slide left into brake,
  left-up into drift, and back into gas without releasing. Add low-speed launch torque
  that fades to the established engine output by 25m/s.
- Reason: the 10.35-unit car obscured the road, the fixed joystick demanded precise
  initial thumb placement, and isolated right-side hitboxes forced unnecessary release
  and reacquisition. A wider road and continuous thumb gestures improve phone play while
  preserving high-speed stability, safe-area rules, capture-loss reset, and physics size.

## ADR-043: Racing Car day/night uses three bounded environment layers

- Date: 2026-07-27
- Status: accepted
- Decision: render time of day with one camera-following shader sky dome, one reusable
  sun/moon sprite, and one deterministic star Points layer. Attach one shadowless
  SpotLight to the player car for dusk/night, and change existing road, kerb, start-line,
  guardrail, terrain, tree, and cloud materials for each time preset. Keep night below 18
  draw calls and 120,000 triangles; do not create per-post or per-tree real lights.
- Reason: flat background colors did not provide a credible time system or enough night
  driving information. Three bounded layers plus existing-material emissive changes make
  every preset visibly distinct and the road readable while keeping mobile GPU cost
  measurable and independent of track length.

## ADR-044: Racing Car driving feedback stays in one bounded render layer

- Date: 2026-07-27
- Status: accepted
- Decision: render rear-wheel marks, tyre smoke, off-road dust, and impact sparks through
  one fixed-capacity instanced geometry and one shader material. Reuse 128 mark slots and
  48 particle slots in circular pools, clear them on race/track reset, and keep the busy
  night scene below 18 draw calls and 120,000 triangles. `car.js` may expose inward
  `wallImpact` speed, but sparks and short camera shake remain visual consumers only.
  Keep the floating steering disc at least 156px in standard landscape and 118px at the
  320px portrait gate while preserving pointer capture and safe-area bounds.
- Reason: tyre contact and collision need readable feedback, but a mesh/material per
  particle would make cost grow with play time. A single capped layer gives drift,
  surface, and impact cues at a measured one-draw cost; the larger left disc improves
  thumb control without reverting to circle-bound input.

## ADR-045: Rivals share the player's physics but not the player's model

- Date: 2026-07-27
- Status: accepted
- Decision: computer rivals in `src/rivals.js` run the full `car.js` bicycle model
  driven by `src/driver.js`, but are drawn as a low-poly block car in a single
  `InstancedMesh`. The pure-pursuit driver moved out of `tests/race.mjs` so the game
  and the lap gates run the same controller.
- Reason: the player's GLB is 17,843 triangles and one draw call, so two rivals alone
  would breach the phone budget set in ADR-044 (<18 calls, <120k triangles). The whole
  four-car field now costs one draw call and 288 triangles, and the visual difference
  makes the player's own car unmistakable at a glance. Sharing the driver means every
  test run of the three circuits is also a test of the opponents.

## ADR-046: Track position is accumulated, never taken modulo per frame

- Date: 2026-07-27
- Status: accepted
- Decision: both the player and each rival keep a running position along the circuit,
  advanced each frame by the shortest signed step along the curve. Standings compare
  those accumulated values.
- Reason: computing `(t - startT + 1) % 1` fresh each frame cannot tell "just short of
  the line" from "just short of a full lap". With the grid placed off the line, a player
  sitting on pole was ranked last, and a car a metre behind the line read as 0.99 laps
  ahead. Accumulation also survives the grid being moved ahead of or behind the line.

## ADR-047: Cars separate with a body box, not a circle

- Date: 2026-07-27
- Status: accepted
- Decision: car-to-car separation resolves along whichever axis of the shared body
  frame is less deeply overlapped, using half-extents of 2.5 by 1.15.
- Reason: a circle cannot express a 4.6 by 2.0 metre car. A radius large enough to stop
  nose-to-tail interpenetration also shoves cars apart when they run side by side,
  which removes wheel-to-wheel racing — the reason for having rivals at all.

## ADR-048: The ghost replays by lap position, not by frame

- Date: 2026-07-27
- Status: accepted
- Decision: `src/ghost.js` samples the player's best lap every 0.1s as
  (x, z, yaw, lap-progress) and stores it per track in `localStorage`. Playback
  positions the ghost from elapsed lap time, and the gap readout compares the
  player's current lap position against the time the ghost reached that same
  position.
- Reason: a frame-by-frame replay drifts out of meaning the moment the current lap
  differs from the recorded one — a slow lap would leave the ghost parked in an
  unrelated part of the circuit. Storing lap-progress alongside the pose is what
  makes "you are 2.9 seconds up on your best" answerable at all. Sampling at 10 Hz
  keeps a forty-second lap near 10 KB, which fits `localStorage` without a second
  storage layer.

## ADR-049: Track progress advances in the frame loop, not inside the HUD

- Date: 2026-07-27
- Status: accepted
- Decision: `advancePlayerProgress()` runs once per physics frame; `playerProgress()`
  is a pure read.
- Reason: the accumulator was previously advanced as a side effect of the getter,
  which only the HUD called. Standings and the ghost both consume that value, so
  "how far round the lap is the player" silently depended on whether the HUD had
  been drawn this frame. It was caught when a headless run produced a null gap.

## ADR-050: The right-hand action cluster is one gesture surface

- Date: 2026-07-27
- Status: accepted
- Decision: gas, brake and drift no longer capture pointers individually. The
  container captures, each live pointer is mapped to whichever button it is
  currently over, and that mapping updates as the finger moves. Which button a
  press starts on comes from `ev.target`; movement resolves by coordinates,
  exact-rect first and only then a widened rect.
- Reason: Penny reported that after braking she could not get back on the throttle.
  With per-button capture, the first button a finger lands on owns that pointer for
  its whole lifetime, so sliding to another button is silently ignored and the
  release lands on the wrong element. The previous "slide off the throttle" gesture
  also only recognised leftward movement while the three buttons are stacked
  vertically, so dragging up did nothing. Keeping a pointer-to-action map rather
  than a single active action is what preserves holding throttle and handbrake
  together, which is the game's own documented drift technique.

## ADR-051: The finish table ranks unfinished rivals without inventing a time

- Date: 2026-07-27
- Status: accepted
- Decision: the finish screen lists every car. Finishers sort by total time and show
  a gap to the winner; cars still on track sort below them by track position and
  show 未完成 rather than any number.
- Reason: the race ends when the player crosses the line, so rivals are usually still
  running. Extrapolating a finish time for them would put a fabricated number next to
  real ones on the same screen. Position order is knowable and honest; their time is
  not, so it is not shown.

## ADR-052: Rivals are a fixed roster, and one ranking feeds every readout

- Date: 2026-07-27
- Status: accepted
- Decision: `ROSTER` in `rivals.js` binds a name, a colour and a skill together, and
  grid slots are filled from it in order. The finish screen's 名次 line and its
  standings table both read from a single `results()` call.
- Reason: "對手 1/2/3/4" gives a table of numbers; a name attached to the colour you
  actually see on the minimap and on track is what makes a result mean something.
  Separately, the headline and the table were computed two different ways — position
  by track progress versus finishing time — and a screenshot caught them disagreeing:
  第 1 / 5 above a table putting the player 4th. Finished rivals stop advancing
  progress, so the two rankings drift apart exactly when the result is shown.
