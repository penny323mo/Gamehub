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
  track, control mode/direction, gyro support/on/direction/sensitivity, screen orientation,
  and audio enabled/ready/broken state. Returning to the menu exposes one compact report
  and a 44px copy button.
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

## ADR-053: The championship scales its points and breaks ties by countback

- Date: 2026-07-27
- Status: accepted
- Decision: `src/season.js` runs the three circuits in order, awarding
  `(entrants - place + 1) * 2` points, and resolves equal totals by countback —
  most wins first, then most seconds, and so on. Progress persists so a season
  survives closing the page.
- Reason: a fixed points table would need rewriting for every rival count the
  設定 offers; deriving it means two rivals and four rivals both work with no
  special cases. Countback rather than "best single finish" because with three
  races and three contenders it is entirely normal for everyone to have won once —
  the first version of this used best finish and a test caught it ranking a
  three-way tie by insertion order.

## ADR-054: Mobile render budgets apply to the full feature composition

- Date: 2026-07-27
- Status: accepted
- Decision: measure night, four rivals, ghost, and active driving effects together.
  Keep that composition below 18 calls and 120,000 triangles. Render the four physical
  rivals and one non-physical ghost as five instances of one `InstancedMesh`; identify
  the ghost through an instanced shader flag and screen-door discard rather than a
  separate transparent material pass. Do not draw the very-low-opacity cloud layer at
  night; preserve clouds in day/dusk and preserve night stars, moon, headlights, and
  reflective track materials.
- Reason: isolated gates reported night 16, rivals +1, ghost +1, and effects +1 as
  individually acceptable, while the actual combined scene reached 19 calls. Batching
  the ghost and dropping the barely visible night cloud recover two calls without
  removing an opponent, ghost timing, driving feedback, or important night readability.

## ADR-055: The player composes the championship, and finished seasons are archived

- Date: 2026-07-28
- Status: accepted
- Decision: `設定` offers a per-circuit 錦標賽賽程 picker. `Season.start(list)` takes
  that composition, cleans it against the circuit pool (unknown ids and duplicates
  removed, player order preserved, empty falls back to the whole pool), and persists it
  with the season so a resumed season keeps the schedule it was started with rather than
  the schedule currently selected. Completing the last round archives the standings to
  `racer-season-hist-v1` (newest first, five kept) at the moment `record()` finishes the
  season, not when the player dismisses the finish screen.
- Reason: the fixed three-race order made a championship a 20-minute commitment with no
  shorter form, and clearing a finished season erased every trace of it — the menu could
  not answer "who won last time". Archiving inside `record()` is the only point that
  survives closing the tab. Cleaning the list rather than trusting it prevents a
  zero-round season, which starts already `finished` and can never be raced.

## ADR-056: Racing Car defaults to simple player-only arcade assistance

- Date: 2026-07-28
- Status: accepted
- Decision: fresh players start in persistent `simple` control mode: throttle is
  automatic, brake overrides it, and handbrake drift retains 72% drive. `standard`
  remains available for manual throttle. The player's car receives bounded
  countersteer, yaw damping, and traction reduction only after handbrake release.
  AI commands set `assist: false`. Gyro reaches full steer at ±16° and starts at
  sensitivity 1.4, while touch steering still overrides orientation input.
- Reason: Penny explicitly prioritised responsiveness and low control burden over
  simulation technique. Requiring simultaneous steering and throttle made mobile play
  needlessly difficult, but route choice, braking, and drift timing still provide the
  decisions. Applying the same helper to AI duplicated its existing controller and
  caused wall hits, so the assist boundary must remain player-only.

## ADR-057: Championship career history is separate from the active season

- Date: 2026-07-28
- Status: accepted
- Decision: keep resumable current-season state in `racer-season-v1` and completed
  career history in `racer-season-records-v1`. Career history stores seasons, titles,
  overall best/last place, and per-track races, wins, and best/last place. Resetting or
  clearing a current season must not clear career history.
- Reason: resumable progress and lifetime achievement have different lifecycles.
  Keeping them in one object made "start a new championship" liable to erase the reason
  to replay. Career records compare places and wins rather than total points because
  championship points scale with the selected number of entrants.

## ADR-058: A championship round is credited only to the circuit it was raced on

- Date: 2026-07-28
- Status: accepted
- Decision: `Season.record(rows, trackId)` rejects a result whose `trackId` is not the
  season's `currentTrack`. `showFinish` passes the circuit actually raced, and the finish
  panel labels a rejected result 練習賽 · 唔計入錦標賽 rather than reporting a saved round.
- Reason: `record()` filed every result under whatever `currentTrack` happened to be,
  and 再跑一次 replays the circuit just finished — after the round had already advanced.
  A measured three-circuit season that used 再跑一次 once recorded the replay of circuit
  one under circuit two's name, advanced the schedule anyway, and never raced circuit
  three; ADR-057's per-circuit career store inherited the same wrong attribution. The
  check belongs in `record()`, not in the finish handler, so a later caller cannot skip
  it — the finish handler was the only caller and still got it wrong.

## ADR-059: Racing Car synthesises its audio instead of shipping sound files

- Date: 2026-07-28
- Status: accepted
- Decision: `src/audio.js` builds engine, tyre, wind, impact, and event sounds with
  WebAudio primitives and no audio assets. Continuous sounds use nodes built once and
  driven per frame through `setTargetAtTime`; short event sounds allocate per call.
  Audio exists only while a race is running — leaving a race silences the graph and
  suspends the context, and a deferred suspend is cancelled if a new race starts first.
  A 音效 開/關 setting persists in `racer-audio`, and with audio off no `AudioContext`
  is ever constructed. Any failure to build a context marks audio broken and the game
  continues silently.
- Reason: an engine note must follow speed continuously; a looped sample pitched by
  `playbackRate` becomes metallic under the 4:1 speed range this car covers, and sound
  files are real mobile data cost for a game that currently ships one 3 MB model. Per
  frame parameter writes avoid the GC pauses that per frame node allocation would cause
  on a phone, which would trade feel for sound — the wrong trade for a driving game.
  Suspending the context off-race matters because an oscillator left running costs
  battery on a screen the player is not racing on.

## ADR-060: Reverse circuits ship only where the AI can lap them cleanly

- Date: 2026-07-28
- Status: accepted
- Decision: `tracks.js` derives reverse variants by reversing a circuit's centreline, but
  only for circuits listed in `REVERSIBLE`. Coast and Touge ship reversed; Turbo does not.
  Each variant is a full circuit with its own id, best lap, ghost, per-circuit career
  record, and championship eligibility. The championship default stays the three forward
  circuits rather than everything.
- Reason: reversing the point list of a closed uniform Catmull-Rom yields the identical
  loop travelled backwards — measured tangent dot −1.000 and length difference 0.0 m — so
  road width, minimum radius, and section clearance are inherited, not re-risked, while
  braking points and corner entry all change. Turbo reversed is excluded on evidence: the
  AI spins at one infield corner every lap and wedges against a barrier until the 3-second
  rescue (521 wall-contact frames, 3 rescues), where Coast and Touge reversed measure 3
  and 0 frames with no rescues. Excluding one variant keeps a single strict gate for every
  circuit instead of a per-circuit exemption.

## ADR-061: One driver implementation, and a curvature window sized to real corners

- Date: 2026-07-28
- Status: accepted
- Decision: `driver.js` estimates curvature over a ±0.008 window of the lap instead of
  ±0.012, and `tests/race.mjs` imports `createDriver` instead of keeping its own copy of
  the controller.
- Reason: the wider window smooths short corners, overestimating their radius and letting
  the driver enter far too fast; across six circuits it cost 1290 wall-contact frames and
  7 rescues against 559 and 3 at ±0.008, with forward circuits unchanged (0/9/0 → 1/6/0)
  and no meaningful lap-time loss. Narrower windows (±0.006, ±0.004) regress because
  straights start reading as curves. The duplicate controller in the test hid the whole
  effect: changing the shipped driver moved nothing, because the gate was measuring a
  controller nothing else used.

## ADR-062: The AI's wrong-way spin is a control-law problem, not a tuning constant

- Date: 2026-07-28
- Status: accepted
- Decision: Turbo reversed stays unshipped until the driver's spin recovery is redesigned.
  Do not reopen it by adjusting single constants. Four attempts are recorded as rejected
  with their measurements, so nobody spends the same day twice.
- Reason: a frame-by-frame trace of the failure shows the mechanism precisely. Once the
  car loses the rear, the controller holds `steer` saturated at 1.0 and, because
  `(vMax - speed) * 0.35` is large at low speed, also commands full throttle. Full lock
  plus full throttle on a rear-drive car is a donut: the trace shows 2.5 s of steer 1.0 /
  throttle 1.0 with slip cycling −37° → −86° → 0 → −84° and the lap parameter frozen near
  t = 0.25, until the 3-second rescue fires. It recurs every lap at the same corner.
- Rejected, each measured over all six circuits (wall-contact frames / rescues):
  a throttle cap proportional to heading error fixed Turbo reversed (0/0) but cost Coast
  25% of its lap time (36 s → 48 s); adding a deadzone to that cap moved the damage to
  Coast (9/4); exempting low speed from the cap sent Turbo reversed back to 374/2 because
  the car needs power to climb out of grass; and yaw-rate damping in the steer command
  wrecked ordinary cornering everywhere (turbo 1706/9, touge 1943/11) since the controller
  needs yaw rate to turn at all.
- The real fix is a state machine that recognises "spun, pointing wrong, low speed" and
  drives a deliberate recovery, rather than one control law asked to both race and rescue.

## ADR-063: Body roll is bounded by the fact that the car model is one rigid piece

- Date: 2026-07-28
- Status: accepted
- Decision: peak body roll is 3°, not 9.2°. `tests/race.mjs` gates roll at 3.5° and the
  body's lowest point at −0.10 m during hard cornering.
- Reason: the roll is applied to the whole car group, wheels included, so any roll lifts
  one side's wheels off the road and pushes the other side through it. At the previous
  0.16 rad the lowest point reached −0.27 m, and Penny's phone report was exactly that —
  "架車好似浮起、轉左轉右好似飛機咁". Three degrees matches a real car's limit and leaves
  about 9 cm of height difference across the body, which is invisible on a 6.9 m car; the
  contact shadow deliberately does not roll, so the car keeps reading as planted.

## ADR-064: Gyro steering has its own direction switch, defaulting to inverted

- Date: 2026-07-28
- Status: accepted
- Decision: `racer-gyro-invert` inverts only the gyro contribution and defaults to on.
  The existing 轉向方向 setting continues to affect touch and gyro together.
- Reason: Penny reports touch steering correct and gyro reversed on her phone. One shared
  switch cannot express that — fixing either input would break the other. The device is
  the only authority here: no desktop derivation of `gamma`/`beta` sign conventions can
  settle which way a phone feels, and the axis choice already varies with
  `screen.orientation.angle`. The default follows her measurement; the switch covers
  devices or grips that disagree.

## ADR-065: Spin recovery is a separate state, and Turbo reversed ships

- Date: 2026-07-28
- Status: accepted
- Decision: `createDriver` holds a recovery state entered when the car is slower than
  6 m/s and pointing more than 80° away from the line, exited when the heading error is
  under 40° and the car is back on the road, with a 3.5 s cap. While recovering it
  commands `throttle: -1` and counter-aimed steer. `REVERSIBLE` now includes Turbo, so
  all six circuits ship. This supersedes ADR-062's decision to keep Turbo reversed out.
- Reason: ADR-062 recorded why four in-line tuning attempts failed — racing and rescuing
  want opposite things, so any correction term strong enough to rescue also slows normal
  cornering. A separate state avoids the trade entirely because the entry condition is
  unreachable while actually racing: no lap in the six-circuit gate enters it except at
  the corner that used to end in a tow. `throttle: -1` needs no phase logic, since
  `car.js` already brakes while rolling forward and reverses once stopped.
- Measured: Turbo reversed goes from 521 wall-contact frames and 3 rescues to 74 and 0.
  Every circuit now needs zero rescues (turbo 0, coast 8, touge 0, turbo-rev 74,
  coast-rev 2, touge-rev 0), and forward lap times are unchanged.

## ADR-066: Gyro steering is a shaped low-gain curve with travel, smoothing, and a reset

- Date: 2026-07-28
- Status: accepted
- Decision: `gyroSteer(tiltDeg, sens)` maps tilt to steer with a 2° deadzone in degrees,
  full lock at `30 / sens` degrees, and the shaping `x * (0.3 + 0.7x²)`. `Input.read`
  low-passes the result at ~11/s. Fresh-install sensitivity is 1.2. A 校正 button now
  exists next to the gyro toggle, as the setting text always promised.
- Reason: Penny's phone verdict was "陀螺儀體驗好差，轉向比例奇怪". The old mapping
  reached full lock at 11°, was linear, and — unlike touch — had no smoothing at all, so
  a wrist twitch swung from nothing to full lock and raw sensor noise reached the wheel.
  Three separate faults presented as one bad feel. The curve gives about 24% steer at
  half travel, so the middle of the range is where fine corrections live, while full lock
  is still reachable. Smoothstep was tried first and rejected: it is 0.5 at half travel,
  which is exactly the property that had to change.

## ADR-067: No rival difficulty setting until the driver's pace is a smooth control

- Date: 2026-07-28
- Status: accepted
- Decision: do not ship a 對手強弱 setting. The `pace` multiplier on the driver's target
  speed exists as a concept but is not exposed, because it does not map monotonically to
  lap time or cleanliness.
- Reason: a difficulty dial has to mean what its label says on every circuit. Measured
  solo, one driver, six circuits, three paces (best lap / off-road / wall frames):
  Turbo 0.82 → 40.7s clean, 0.92 → 44.3s with 7.3% off-road and 8 wall frames,
  1.00 → 36.0s clean. Turbo reversed inverts it: 1.00 → 41.0s with 74 wall frames,
  0.92 → 36.9s clean. Coast is worst in the middle too. A four-car field is no better:
  at full pace the field is slower than at 0.82 on Coast (130.6s vs 115.5s mean) because
  it spends 9.5% of the race off-road instead of 0.4%.
- The cause is that pace shifts where the car arrives at every corner, and this
  centreline pure-pursuit controller either takes a corner cleanly or does not. Lap time
  is therefore chaotic in the parameter rather than smooth.
- Also rejected on measurement: raising pace above 1 (111–138s becomes 160–193s with 15%
  off-road) and promoting every rival one skill tier (112–167s, 13% off-road) — both make
  the field slower, which is the opposite of "harder".
- A real difficulty scale needs a driver that holds its line at any pace — lateral-error
  feedback against a racing line, not a centreline chase with a speed cap. That is its
  own phase with its own evidence, not a setting bolted onto today's controller.

## ADR-068: Braking is modelled per axle, and ABS is a real system rather than a label

- Date: 2026-07-28
- Status: accepted
- Decision: rewrite the longitudinal model. Brake force is a demand distributed across
  axles, each axle's longitudinal force is limited by its own μ·N, and each axle's lateral
  capacity is reduced by its own longitudinal usage. Axle loads and brake forces are
  solved with two passes because they determine each other. `loadTransfer` returns to a
  physical 0.19. ABS (default on, `racer-abs`) keeps the front axle as the main brake,
  caps each axle below its friction limit, releases brake force as steering increases, and
  never locks. With ABS off, a fixed 62/38 hydraulic split can exceed an axle's limit and
  that axle locks — sliding friction longitudinally and almost no lateral force.
- Reason: Penny reported that braking in a straight line with no steering turned the car
  sideways. Reproduced: with the same small disturbance, coasting drifts 4° while braking
  spins 229°. Three compounding faults. Braking was charged entirely to the rear axle's
  friction circle while the front's lateral grip was never debited, so any brake input
  meant "front gripping, rear free". The load-transfer estimate used the unclamped 20,000 N
  demand — 1.84 g, beyond any tyre — which drove rear axle load to the 476 N floor, i.e. a
  rear wheel with no weight on it and therefore no lateral force (−250 N against the
  front's −5000 N). And `loadTransfer` was 0.28, a centre of gravity 0.78 m high.
- Measured after: straight-line stop 1.19 g with 0.0° of heading change; over a bump then
  braking, 1.9° slip with ABS and 87.6° without; trail braking gives 3.9° / 21° / 31.5° of
  body slip at a quarter, half and full steering — a progressive drift entry rather than a
  spin. Handbrake drift is unchanged at 89°, and 0–80 km/h stays 2.77s.
- The AI was retuned in the same pass, as the previous handoff required: `brakeA` drops
  from 8.6/9.0/9.6 to 7.2/7.6/8.1 because the old values were fitted to 1.84 g braking.
  All six circuits now run with zero wall contact, zero rescues and zero off-road, and
  lap times improve (Coast 36.4s to 30.9s).

## ADR-069: Driver aids yield to a countersteering player

- Date: 2026-07-28
- Status: accepted
- Decision: the arcade assists (countersteer, traction cut, yaw damping) scale by
  `1 - clamp(-steer · sign(slipAngle), 0, 1)`. A player holding full opposite lock gets
  none of them; a player not correcting at all gets the full set.
- Reason: the assists could not tell a deliberate drift from a mistake, so they fought
  both. Measured: a 40° handbrake entry held for 2.1 s on raw physics but only 1.6 s with
  assists on, because the machine kept pulling the wheel straight. In a game whose scoring
  is built on drifting, the aid was deleting the mechanic. Countersteer is the honest
  signal of intent — nobody applies opposite lock by accident — so it is what gates the
  aid. With the change, assisted and raw drift durations are identical (2.1 s), recovery
  from a 40° slide improves to 0.55 s, and a player who instead holds the wheel into the
  corner is still rescued in 1.7 s.
- Not addressed here: a drift still decays after about 2 s because the car sheds speed
  (120 km/h to 86 km/h) and hooks up once the rear regains grip. That is a tyre and
  longitudinal balance question, not an aid question, and it needs its own measured pass.

## ADR-070: A wider tyre peak and an explicit drift push make the car playable

- Date: 2026-07-28
- Status: accepted
- Decision: `tyreB` drops from 8.2 to 5.0, moving the tyre's force peak from 11° of slip
  to about 18°. The drift threshold moves with it, 0.19 rad to 0.26 rad. Driver aids keep
  a floor of 45% yaw damping while the player countersteers, even though they give up
  steering authority entirely (ADR-069). A `driftPush` of 5200 N is added along the
  velocity vector while genuinely drifting on throttle, on road, without handbrake.
- Reason: with the peak at 11°, everything past it produced less force, so a drift had no
  equilibrium. Measured: a 35° entry ran away to 78° and then snapped back to 0° in one
  step — bistable, with nothing holdable in between, in a game scored on drifting. At
  peak 18° the same entry overshoots to 62° and settles into a shallow slide instead of
  snapping. Pure steering at full lock rotates 10.9° instead of 6.7°, so the car feels
  alive without ever spinning, and the AI is unaffected (Coast 30.9s to 31.1s, still zero
  wall contact on all six circuits).
- The drift aid is an explicit arcade layer, not physics, and is documented as such.
  Sliding sideways scrubs speed for real — a full-throttle drift measured 11,500 N of
  body-longitudinal force while the car slowed from 118 km/h to 40 km/h, because the body
  axis was 50–87° away from travel. That is correct and it makes drifting pure punishment.
  It is implemented as a refund of at most 70% of the speed the frame actually scrubbed,
  not as a fixed force. The first version used a fixed 5200 N push and measured 148 km/h
  while drifting against 122 km/h cruising — drifting became an accelerator and inverted
  the game. A refund is self-limiting: no scrub, no refund. Measured now: 186 km/h flat
  out straight, 142 km/h sustained drifting, 127 km/h spinning on full lock.
  It is off on grass, off under handbrake, and off below 17° of slip.
- Yaw damping is separated from steering authority because they do different jobs: damping
  resists the rate of change, not the angle the player chose. Removing it entirely (the
  first version of ADR-069) is what made the car bistable.

## ADR-071: The handbrake locks the rear axle, and the wheel turns fast enough to flick

- Date: 2026-07-28
- Status: accepted
- Decision: the handbrake now sets the rear axle's brake force to its sliding-friction
  limit and marks it locked, so it loses lateral grip through the same friction-circle
  path as any other locked wheel (ADR-068). `steerRate` rises from 5.5 to 7.2/s and the
  assist damping floor from 0.45 to 0.62.
- Reason: on a phone nobody holds the handbrake — they tap it. Measured with the real
  simple-mode command stream, a 0.33 s tap produced 6° of body slip and a 0.5 s pull 17°:
  no drift at all. Sweeping `handbrakeGrip` from 0.45 down to 0.22 changed the tap by one
  degree, which showed the rear's grip was never the limiter. Two things were: the
  handbrake only scaled grip instead of modelling a locked wheel, and the wheel itself
  took 0.18 s to reach the commanded angle, so a quick flick was over before the steering
  arrived. With both fixed, a half-second pull now gives 19° of entry and settles at 31°.
- The damping floor rose in the same pass because faster steering re-introduced overshoot:
  the 35° target entry peaked at 75°, past the 70° gate. At 0.62 and 7.2/s it peaks at
  68° while the tap entry stays at 19°. Every other measurement holds: full-lock steering
  still rotates 11° with no spin, straight-line braking is unchanged, and the AI runs all
  six circuits with zero wall contact, zero rescues and zero off-road.

## ADR-072: Landscape only, and rotation stops pausing the race

- Date: 2026-07-28
- Status: superseded by ADR-073, then ADR-074, for the portrait half of the decision; its
  landscape-to-landscape finding still stands
- Decision: Racing Car is a landscape-only game. Pausing is driven by the
  `(orientation: portrait)` media query, not by `orientationchange`. Portrait pauses the
  race with 請打橫手機再繼續 and covers the screen with a rotate prompt; landscape hides it.
  `screen.orientation.lock('landscape')` is attempted on race start where the platform
  supports it and its failure is ignored.
- Reason: Penny's screenshot shows 已暫停 / 手機方向已改變 while the phone was already in
  landscape. `orientationchange` fires on landscape-left to landscape-right flips and when
  a phone near flat is re-classified by the OS — and steering by gyro means continuously
  tilting the phone, so the pause fired in the middle of races. Reading the portrait
  media query instead makes the pause mean what its message says.
- The rotate prompt is what enforces landscape on iOS Safari, which does not implement
  orientation locking. On platforms that do, the lock attempt saves the player the step.

## ADR-073: The game frame is always landscape, so orientation stops existing

- Date: 2026-07-28
- Status: superseded by ADR-074 — the frame's orientation is now a player setting, not a
  fixed choice; the coordinate mapping it introduced is still in use
- Decision: Racing Car renders in a permanently landscape frame. When the device reports
  `(orientation: portrait)`, CSS gives `#game-root` swapped dimensions
  (`width: 100dvh; height: 100dvw`) and rotates it 90° about its top-left corner, so the
  game fills the portrait viewport sideways. Nothing pauses, nothing prompts, and no
  rotate hint exists any more — the markup and CSS for it are deleted. `screen.orientation
  .lock('landscape')` is still attempted at race start on platforms that implement it, but
  it is now only a convenience, not the mechanism.
- Reason: ADR-072 made portrait pause the race and cover the screen with 請打橫手機再繼續.
  Penny's requirement is the opposite: the game must never change direction because of the
  phone. Gyro steering means the phone is tilted continuously, and the OS re-classifies a
  near-flat phone as portrait on its own — so a portrait-triggered pause is the same bug as
  the `orientationchange` pause, just one classification later. Rotating the frame removes
  the trigger instead of making it more selective: there is no orientation the game reacts
  to, because the game only has one.
- Touch input is the part that does not come free. Pointer coordinates arrive in screen
  space, and CSS transforms do not rewrite them, so in a rotated frame a horizontal swipe
  reads as vertical. `Input` gained a `rotated` getter that asks the same media query and a
  `localPoint()` that maps a screen point into the game frame
  (`x = clientY - top`, `y = width - (clientX - left)`, with width and height swapped). The
  joystick's `placeBase` and `move` go through it; the buttons do not need it, because their
  hit test compares screen-space rectangles that the browser has already transformed.
  `setRotated()` exists so tests can force either frame without a real device.
- The rotated frame is what the gates measure, not the CSS: the setup suite now asserts that
  an `orientationchange` in either orientation leaves the race running, that the game frame
  is wider than it is tall while the viewport is 390×844, that the canvas aspect stays above
  1, and that on a rotated frame a stick drag toward the bottom of the screen steers right
  and toward the top steers left. Two older gates measured screen-space rectangles in a
  portrait viewport and were re-pointed at 568×320, which is the shape a phone actually
  presents this game.

## ADR-074: Screen orientation is a manual setting with two values and no automatic mode

- Date: 2026-07-28
- Status: accepted (supersedes ADR-073 and the remainder of ADR-072)
- Decision: 畫面方向 is a player setting stored in `racer-orient`, with exactly two values.
  `portrait` (the default) renders the game into the viewport as-is, with no transform at
  any time. `landscape` renders the game into a landscape frame: while the viewport is
  taller than it is wide, `#game-root` carries `.rot90`, which swaps its dimensions and
  rotates it 90° about the top-left corner; on an already-landscape viewport it does
  nothing. There is no third "automatic" value, and no code path changes the setting on the
  player's behalf. `screen.orientation.lock('landscape')` is attempted at race start only
  when the setting is `landscape`.
- Reason: this is the third answer to the same question, and the first two both failed on
  Penny's phone for the same underlying reason — the game was deciding. ADR-072 paused in
  portrait, which fired mid-race because the OS reclassifies a tilted phone and gyro
  steering means tilting constantly. ADR-073 removed the decision by always rotating, and
  she rejected that too. A setting ends the argument: the only automatic behaviour left is
  the one that implements her choice.
- The rotation must be a class, not a media query, because the media query *is* the
  automatic behaviour. `.rot90` is toggled by `applyOrientation()`, which also pushes the
  same boolean into `Input.setRotated()` so touch mapping and CSS can never disagree —
  `Input` no longer reads `matchMedia` itself.
- Layout inside the frame must be measured against the frame, not the viewport. Two things
  followed: `#game-root` now defines `--fw`/`--fh` (swapped under `.rot90`) and every
  proportional size uses them instead of `vw`/`vh`, and the phone-layout media queries are
  scoped to `#game-root:not(.rot90)` with a rotated equivalent keyed on viewport width for
  the short-side rule. Without the first, the menu panel's `max-height: 88vh` resolved to
  743px inside a 390px-tall frame; without the second, a rotated landscape frame took the
  narrow-portrait pad layout.
- Gates: at 390×844 the default renders a 390×844 frame with `rotated === false` and a
  canvas aspect below 1; tapping 打橫 turns the same device into an 844×390 frame with
  `rotated === true`, aspect above 1, and the choice persisted; tapping 打直 puts it back
  and the joystick's axes swap with it (screen-right steers right unrotated, screen-down
  steers right rotated). `orientationchange` never pauses in either mode. The two suites
  that measure phone layout are back on 320×568, the shape the default now presents.

## ADR-075: Orientation is re-decided, never measured once

- Date: 2026-07-28
- Status: accepted (refines ADR-074's mechanism; the setting itself is unchanged)
- Decision: `applyOrientation()` measures through `visualViewport` (falling back to
  `innerWidth`/`innerHeight`) and is re-run — not merely followed by a `resize()` — on
  `resize`, `visualViewport.resize`, and on returning from the background. An
  `orientationchange` schedules five re-decisions (0/80/200/450/800 ms) instead of one. The
  frame's own width and height stay in CSS as `dvw`/`dvh`, and a `ResizeObserver` on
  `#canvas-holder` re-runs `renderer.setSize()` whenever the box changes.
- Reason: Penny reported that rotating the iPhone still scrambled the display under
  ADR-074. iOS Safari fires `orientationchange` before the viewport actually changes and
  reports intermediate sizes during the rotation, so a single measurement at event time can
  be the pre-rotation one. The old code then latched that wrong answer into the `.rot90`
  class and never revisited it — every later event only re-ran `resize()`. Anything that
  measures once on iOS is wrong; the fix is to keep asking.
- Sizing the frame from JS pixels was tried and reverted in the same pass. It makes the
  frame depend on an event arriving, which is exactly the dependency being removed — a
  viewport change with a late handler left the frame at the old pixel size. `dvw`/`dvh`
  are correct the moment the viewport changes, with no JS involved.
- Gates: with a stubbed `visualViewport` returning the pre-rotation size, an
  `orientationchange` makes the game decide wrongly, and it recovers to the correct class
  within a second with no further event dispatched. Separately, resizing `#game-root`
  directly — no event of any kind — still resizes the canvas and the drawing buffer to
  match. The canvas is asserted to fill the frame, and the frame to equal the (swapped
  where rotated) viewport, in all three orientation states.

## ADR-076: The steering stick is one axis, and it is not smoothed twice

- Date: 2026-07-28
- Status: accepted
- Decision: the joystick's steering value comes from `dx` clamped on its own, not from the
  point clamped into a circle; the circle is applied only to the knob's drawn position. The
  input smoothing rate rises from 9/s to 20/s while the stick is active, and stays at 9/s
  for keyboard input.
- Reason: Penny reported she could not get a big turn. Two separate limiters, both in the
  input, neither in the car. First, clamping `(dx, dy)` into a circle scales `dx` by
  `max/hypot(dx, dy)` — a thumb that arcs downward as it sweeps right, which is how a thumb
  pivoting at the palm actually moves, loses steering in proportion to the arc: measured
  0.77 of full lock at 40° and 0.50 at 60°. Steering only reads x, so y must not take any
  of it. Second, the stick's position is already a continuous analogue value, so the
  first-order smoothing on top of it was pure latency: 0.25 s to 90% and 0.48 s to full,
  before the car's own `steerRate` transition. The two stacked into "no matter how I pull
  it, there is not enough lock".
- The car was measured and left alone. On flat ground at full lock it holds 1.22–1.26 g at
  every speed from 12 to 42 m/s, settling into an 18–41 m radius, with the arcade assists
  making almost no difference in steady state. Nothing about the vehicle limits the turn,
  so no grip, `steerMax`, or `steerSpeedDrop` value was touched — and `steerRate` stays at
  ADR-071's 7.2, which the drift-overshoot gate still protects.
- Gates: pulling the stick to full reach at 0°, 20°, 40° and 60° below horizontal must all
  give full lock; the knob must still stay inside the dial; and full lock must arrive within
  0.12 s (now 0.10 s).

## ADR-077: The stick gets an expo curve, because the top of its travel did nothing

- Date: 2026-07-28
- Status: reverted by ADR-079 — the curve fixed a high-speed metric and cost mid-stick
  authority at every speed, which is the opposite of what Penny reported
- Decision: the joystick's steering value passes through `steerExpo()`,
  `x·(0.45 + 0.55·x²)` — the same family as `gyroSteer()`'s curve but shallower, since a
  thumb is more precise than a wrist. It is applied in `Input`, so it shapes the player's
  stick and keyboard ramp only: the AI driver's commands and the arcade countersteer assist
  are untouched.
- Reason: measured on flat ground at a held speed, the fraction of maximum yaw rate reached
  per unit of stick was badly front-loaded. At 40 m/s, 20% of travel already produced 75% of
  the car's maximum cornering and 40% produced 94%; at 30 m/s, 40% produced 86%. The car
  reaches its friction limit long before the stick reaches its stop, so the top half of the
  travel could not change anything while the bottom fifth changed everything — twitchy at
  speed and, from the player's side, indistinguishable from "a big pull does nothing".
  After the curve: 40 m/s reads 0.44/0.77/0.93 at 20/40/60%, and 30 m/s reads
  0.30/0.61/0.85.
- Nothing was taken away. The curve passes 0 and ±1 through unchanged, so full lock is still
  full lock and the countersteer needed to catch a slide is unaffected. Maximum yaw rate at
  each speed is identical before and after (0.636 / 0.432 / 0.327 rad/s at 20 / 30 / 40 m/s),
  as is the time to reach 90% of it (0.21 / 0.16 / 0.13 s).
- Reducing the wheel angle itself was considered and rejected: shrinking `steerMax` or
  steepening `steerSpeedDrop` would fix the same curve, but it also removes the lock
  available for countersteering out of a drift, and it changes what the AI's own steering
  commands mean — which the handoff requires retuning `SKILLS.brakeA` alongside. Shaping the
  player's input has neither cost.
- The 90%-of-lock timing gate moved from 0.12 s to 0.15 s, because the curve makes the last
  stretch of output need the last stretch of travel. Measured 0.133 s, against 0.25 s before
  ADR-076.

## ADR-078: Power oversteer is what holds a drift; yaw damping never was

- Date: 2026-07-28
- Status: accepted; its `driftPower` value is superseded by ADR-085, which fixed the speed
  rule the value was fitted to
- Decision: while the assists are on, the player is not braking or on the handbrake, the car
  is on tarmac, the throttle is above `driftPowerThrottle` and the body slip is already past
  `driftPowerLo` (15°), the rear axle's grip is reduced by up to `driftPower` (0.30). The
  reduction rises from 15° to `driftPowerHi` (24°) and falls back to zero by `driftPowerOut`
  (39°), so the effect cannot drive the angle past the band it is meant to hold. This is an
  arcade layer, declared as such, on the same conditions as ADR-070's drift refund.
- Reason: a drift could not be held and, worse, the player had no say in it. From a handbrake
  entry at 30 m/s the slide peaked at 26° and collapsed in 0.81 s, and sweeping the player's
  countersteer gain from 0.4 to 2.0 changed the held time by less than a hundredth of a
  second — in a drift-scoring game, the scoring mechanic was not a skill. With the change the
  same entry holds 1.56 s at an average 25° and a 31° peak, and the gain sweep now separates:
  weaker countersteer gives shorter drifts.
- The yaw-damping "drift window" tried first is rejected and removed. Fading the damping
  between 15° and 46° bought nothing at all — held time stayed at 0.8–0.9 s with the window
  open or shut, at any damping level — while pushing the 35°-entry overshoot from 68° to 75°,
  past its 70° gate. Damping resists the rate of change, so it never was what ended the
  drift; the rear axle regaining grip was.
- The looser tuning is documented rather than shipped. `driftPower` 0.38 with a 27°–46° taper
  holds the full 6.4 s measurement window at 36°, but the sustained angle drops drift speed to
  55% of the straight-line figure, below ADR-070's 70% floor. Sitting that sideways genuinely
  is that slow, so raising the hold further means deciding that ADR-070's floor is the wrong
  rule — Penny's call on a phone, not a desktop one.
- Gates: the drift must hold at least 1.3 s from a phone-shaped entry, settle in a 25–40°
  band without spinning, and be measurably shorter with `driftPower` at zero. The existing
  overshoot (≤70°), refund-exploit (drift slower than straight) and speed-retention (≥70%)
  gates all still pass, as does the AI at 0–0.3% off-road across all six circuits.

## ADR-079: Turn-in comes from a conditional front-grip assist, not from a stick curve

- Date: 2026-07-28
- Status: accepted (reverts ADR-077)
- Decision: the joystick's value goes to the car unshaped — `steerExpo()` and its gates are
  deleted. In its place, while the assists are on, the throttle is not negative, the handbrake
  is off and the body slip is under `turnInMaxSlip` (8°), the front axle's grip is multiplied
  by up to `1 + turnInBoost` (0.7), scaled by how much steering the player is asking for and
  fading to nothing as the slip approaches 8°.
- Reason: Penny said three times that the car would not turn. The metric that finally showed
  it is `t45` — the time from a straight line to 45° of heading change. At half stick it was
  1.91 / 2.02 / 2.17 s at 14 / 22 / 30 m/s: barely speed-dependent, because at mid stick the
  limiter is the front wheel angle, not grip. ADR-077's expo curve made exactly that worse,
  and it is reverted: linear alone takes half-stick t45 at 14 m/s from 1.91 to 1.57 s.
- Every other lever was measured and rejected. Inertia 1900 → 1550 bought 0.02 s. `steerRate`
  7.2 → 10 bought 0.04 s. `steerSpeedDrop` 2.4 → 1.5 bought 0.2–0.3 s but pushed the 35°-entry
  overshoot from 68° to 75°, past its gate. Raising `gripFront` 1.45 → 1.72 was the single
  biggest gain (t45 full-lock at 40 m/s halved) but broke eleven gates at once — braking into a
  corner went from 19° to 61° of slip, a handbrake tap reached 87°, and the AI hit walls for
  493 frames on Coast. Scaling both axles together destabilised braking instead, because more
  grip means more deceleration and a lighter rear.
- What made it safe was the window, not the size. Gating the boost to under 8° of slip keeps it
  out of the two situations where extra front grip is dangerous — braking into a corner and any
  slide — so it can be large without feeding either. Final: half-stick t45 1.25 / 1.38 / 1.70 s
  and full-lock 1.49 s at 30 m/s, while the 35° overshoot stays at 68°, drift speed stays at
  76% of straight-line, and a handbrake tap still enters at 34°. All three were identical
  before and after, and the AI stays at 0–0.3% off-road across the six circuits.
- Gates: half-stick `t45` must stay under 1.45 / 1.55 / 1.80 s at 14 / 22 / 30 m/s, full lock
  under 1.55 s at 30 m/s, and turning the boost off must measurably slow both.

## ADR-080: Simple mode lifts off the throttle when the player steers

- Date: 2026-07-28
- Status: accepted
- Decision: in 簡易模式 the automatic throttle is `1 - AUTO_LIFT·|steer|` with `AUTO_LIFT`
  0.4, so full lock leaves 60% throttle. Braking still overrides everything and the drift
  button keeps its own 0.72. Standard mode is untouched — it has no automatic throttle at all.
- Reason: simple mode is the default, and it held the throttle at exactly 1.0 for the entire
  race. The friction circle then decides the rest: at 8500 N of drive against roughly 9900 N
  of rear capacity, 86% of the circle is spent longitudinally and only
  `sqrt(1 - 0.86²) ≈ 51%` of the rear's lateral grip remains. At 60% throttle that becomes
  52% spent and 85% remaining — the same corner has about 1.7× the lateral grip. A mode that
  never lifts forces the player through every corner on half their grip, which is not a
  difficulty setting, it is a defect in the mode.
- Measured on one 90° corner entered at 28 m/s at full lock: full throttle needs 107 m of
  travel and 3.68 s to complete the turn, auto-lift needs 72 m and 2.92 s, and a full lift
  (what standard mode allows) needs 44 m. On a road about 15 m wide, 107 m versus 72 m is the
  difference between hitting the wall and making the corner.
- 0.4 is chosen so full lock still leaves 0.6, above `driftPowerThrottle` (0.5), which keeps
  ADR-078's power oversteer available to a simple-mode player. A deeper lift would take
  drifting away from the mode that most needs the help.
- Gates: straight-line simple mode is still full throttle, the lift is proportional and
  monotonic in steering, full lock stays between 0.55 and 0.65, braking still returns −1, and
  standard mode still returns 0 with no keys held.

## ADR-081: Grazing a wall costs speed, not the race

- Date: 2026-07-28
- Status: accepted
- Decision: a wall contact now scales only the along-wall velocity component, by `wallScrape`
  (0.97), instead of scaling the whole velocity vector by 0.86; and it turns the car's heading
  `wallAlign` (0.25) of the way toward the wall's tangent, in the direction it is already
  travelling. The normal-direction bounce (`wallBounce` 0.4) is unchanged.
- Reason: the shallower the contact, the worse the punishment. Measured at 30 m/s with the
  throttle held down, a 10° graze took the car from 108 km/h to 0 and left it at 1 km/h three
  seconds later, while a harder 25° hit kept 42 km/h. Two causes compounded. The blanket 0.86
  ran on every contact frame, so repeated light contact ground the along-wall speed away as
  well as the into-wall speed. And nothing corrected the heading, so after the bounce the car
  was pointing across its own velocity, and the tyres scrubbed the rest away at a slip angle
  near 90°. The AI has a recovery state machine for exactly this; the player has none, so for
  the player one touch ended the race.
- After: the 10° graze bottoms out at 34 km/h and is back to 70 km/h three seconds later; the
  25° hit bottoms out at 56 and returns to 87. Contact frames drop from 2–3 to 1–2, so the car
  slides along instead of grinding. The harder hit still costs more than the lighter one, which
  is the ordering that was inverted before.
- Off-road was measured in the same pass and left alone: a full second on the grass at 30 m/s
  costs 1 km/h and is recovered in 0.1 s, because `offroadDrag` (2600 N) is small against the
  engine's 8500 N. Grass is a cornering penalty, not a time penalty, and that is fine.
- Gates: a 10° graze must stay above 20 km/h and recover past 50 km/h within three seconds, a
  25° hit must cost more than the 10° one yet still recover past 60, and restoring the old
  constants must measurably re-break it.

## ADR-082: Rivals were using half the car; auto-braking for simple mode is rejected

- Date: 2026-07-28
- Status: accepted
- Decision: `SKILLS.latG` rises from 6.0/6.2/6.4 to 7.2/7.5/7.8 m/s², keeping the tight spread
  ADR-061 argued for. Simple mode does **not** get an automatic brake; it keeps ADR-080's
  auto-lift only.
- Reason: the car's measured steady-state cornering limit is 1.25 g (12.3 m/s²), and the
  turn-in assist of ADR-079 is available to the AI as well, so at 6.2 the rivals were cornering
  at half of what the car can do. A deliberately handicapped novice — the AI's own line with
  0.25 s of reaction delay and steering quantised to five positions — completed three laps in
  84–91 s on three circuits while the rivals took 95–112 s. A race a hobbled driver wins by
  twenty seconds is a procession, not a race.
- 7.5 is the ceiling that stays clean, established by sweeping all six circuits: at 7.5 the
  three-lap times fall to 88–107 s with wall contacts, off-road frames and rescues all still
  exactly zero; at 9.0 Coast-reverse breaks (291 rescue frames, 6% off-road); at 10.5 Coast
  breaks instead. Nothing was given to the rivals that the player does not have — this is
  calibration to the car, not an economy bonus, and ADR-007's rule still holds.
- The auto-brake attempt is rejected on its own evidence. Simple mode has no active
  deceleration at all, so the novice model failed to finish Turbo. Adding a brake that fires on
  large steering above a speed threshold fixed Coast (395 s → 104 s, wall frames 17,532 → 33)
  but wrecked Touge (84 → 152 s), Coast-reverse (91 → 259 s) and Touge-reverse (90 → 228 s),
  and never fixed Turbo. Sweeping its three constants produced no combination that helped more
  than one circuit at a time.
- The deeper lesson is about the instrument, not the feature. A novice model with reaction
  delay in the loop is unstable: the delay and the brake assist form a feedback loop whose
  oscillations dominate the result, so the numbers measure the model rather than the game. It
  is fine for spotting a disaster (Turbo at 79–89% off-road) and unfit for tuning constants.
  Anything that must be tuned needs a deterministic scenario, like the single-corner
  measurement behind ADR-080 or the six-circuit AI sweep above.

## ADR-083: The player gets a spin recovery too

- Date: 2026-07-28
- Status: accepted
- Decision: `Car.unspin(dirX, dirZ, dt)` turns the car's heading toward the track's forward
  direction at up to `unspinRate` (1.5 rad/s) while the assists are on, the car is slower than
  `unspinSpeed` (5 m/s), and the heading is more than `unspinAngle` (80°) out. It keeps helping
  until the error is under `unspinExit` (25°), then hands back. `main.js` calls it each racing
  frame with the tangent at the player's nearest point on the centreline.
- Reason: ADR-065 gave the AI a recovery state machine and nothing was ever given to the player.
  Measured from a 150° spin at walking pace, a simple-mode player who only steers never
  recovered in 25 seconds — the automatic throttle drove the car sideways off the road (641
  off-road frames) and it ended up travelling backwards along the circuit. Pressing the brake to
  reverse was worse. For the default control mode, one spin ended the race.
- The two thresholds are not decoration. With a single 80° threshold the assist stops with the
  car still 80° sideways, which the automatic throttle immediately turns into a run off the
  road; hysteresis to 25° is what makes the recovery usable. Measured: 150° comes back in 1.47 s
  and 90° in 0.77 s, and off-road frames in the spun-player scenario fall from 641 to 166.
- It cannot fire during real driving. At 20 m/s it declines even at 150° out, and at walking pace
  it declines at 40° out, so ordinary cornering, drifting (always fast) and parking-speed
  manoeuvring are all untouched. That is the same "narrow entry" discipline ADR-065 relied on.
- Not fixed, and deliberately: a player who is already up to speed pointing the wrong way. That
  is not a spin, and the 掉頭 warning already covers it. The novice control law used for probing
  drives a wide circle the wrong way there, which is a limit of the model (ADR-082), not a
  measurement of the game.
- Gates: 150° recovers within 2 s, 90° within 1.5 s, and the assist declines both at speed and
  at small angles.

## ADR-084: The combo ladder has to be reachable

- Date: 2026-07-28
- Status: accepted
- Decision: the drift combo steps every `COMBO_STEP` = 1.2 s instead of 1.6 s. `COMBO_MAX`
  stays at 5.
- Reason: 1.6 s was a bad coincidence. After ADR-078 the best a well-executed single-corner
  drift holds is 1.56 s, measured — four hundredths of a second short of 2×. So the whole
  ladder up to 5× was unreachable except by chaining corners inside the 0.55 s grace window,
  which means the reward for the skill ADR-078 had just made possible was invisible. At 1.2 s
  the first rung is earned by a good single drift (measured: 1.57 s held, combo 2, 143 points
  banked), while 3× at 2.4 s, 4× at 3.6 s and 5× at 4.8 s still require linking corners, so
  the ladder keeps its headroom.
- Gate: the same phone-shaped handbrake entry used by ADR-078's hold gate must reach combo 2
  and bank a non-zero score. Tying the gate to the same scenario means the two constants
  cannot drift apart again: if the achievable hold time changes, this gate fails.

## ADR-085: Compare a drift against the same corner, not against a straight line

- Date: 2026-07-28
- Status: accepted (supersedes ADR-070's speed floor and ADR-078's `driftPower` value)
- Decision: the rule "a drift must not be so slow that nobody uses it" is now measured against
  the grip-limited speed for the *same path radius*, not against the car's straight-line
  terminal speed. With the metric fixed, `driftPower` goes to 0.38 with a 27°–46° taper.
  Power oversteer is additionally suppressed for `wallDriftCooldown` (1.2 s) after any wall
  contact.
- Reason: the old floor divided by the wrong thing. The denominator was 186 km/h — what the
  car reaches after twelve seconds of full throttle in a straight line — and no one takes a
  corner at terminal speed, so the rule asked a drift to do something physically impossible
  and any tuning that produced a real sustained drift "failed" it. Measured against the right
  denominator the two candidates invert completely:
  - `driftPower` 0.30: holds 1.7 s, path radius 147 m, 106 km/h against 153 km/h on grip — 69%
  - `driftPower` 0.38: holds 13.8 s, path radius 52 m, 85 km/h against 91 km/h on grip — 94%
  The looser setting is not just a longer drift; it is a line three times tighter that gives up
  6% of speed. That is drifting as a cornering technique rather than as a penalty, which is what
  a drift-scoring game is supposed to be about.
- ADR-070's anti-exploit rule is untouched and still passes: a drift must never be faster than
  driving straight, and the refund stays bounded by the speed actually scrubbed.
- The wall cooldown came out of the same pass. With the rear left loose, a 25° wall hit
  recovered to only 44 km/h in three seconds instead of 87, because the assist kept the car
  sideways after an impact the player did not choose. Power oversteer is a "you chose to drift"
  aid, so a collision now suspends it for 1.2 s; the graze gates return to 56 km/h minimum and
  94 km/h after three seconds.
- Gates: the sustained drift must keep at least 80% of the same-radius grip speed, run a radius
  under 90 m, and last more than 5 s. The old straight-line comparison is deleted rather than
  relaxed — a wrong denominator cannot be fixed by moving its threshold.

## ADR-086: The drift gauge reads the car's real band, and derives it from the physics

- Date: 2026-07-28
- Status: accepted
- Decision: the HUD drift-angle bar maps `driftPowerLo` (15°, where scoring starts) to 0% and
  `driftPowerOut` (46°, where power oversteer has fully tapered off) to 100%, reading the two
  ends straight out of `CFG` rather than from literals. "Hot" moves from 70% to 85%.
- Reason: the bar mapped 0–60° to 0–100%, a range chosen for an older car. Under the physics
  the game actually has, a sustained, well-driven drift settles around 31° — which the old bar
  showed as 52%, i.e. "mediocre" — and the hot state at 42° sat past the point where power
  oversteer is gone, so it was effectively unreachable while still in control. The bar is the
  only feedback the player gets for this mechanic, and it was teaching the wrong thing: that a
  good drift is a poor one and that the interesting region is somewhere you cannot hold.
- Reading `CFG` instead of copying numbers is the point, not an implementation detail. This is
  the third constant found stale against a car that has moved (after ADR-082's `latG` and
  ADR-084's combo step), and all three came from a value being written down twice. A gate
  shrinks `driftPowerOut` at runtime and requires the bar to respond, so the two can no longer
  separate.
- Gates: the bar reads 0% at the scoring threshold, 100% at the taper end and above, at least
  45% at a held 31°, is hot only near full, and follows a runtime change to `driftPowerOut`.

## ADR-087: A shared animation library, not nine copies of the same clips

- Date: 2026-07-31
- Status: accepted
- Decision: the MOBA's nine KayKit characters ship as mesh-and-skin only (~90 KB each, Draco);
  the 23 animation clips they all use live once in `anims.glb` (0.87 MB) and are bound to any
  model at runtime.
- Reason: the packs' nine source files total 35 MB, of which the meshes are a rounding error —
  6 500 triangles and a 15 KB atlas apiece. The weight is 76–95 authored clips stored nine
  times. Measurement showed all nine share the identical 41-bone rig with identical bone names,
  and the Skeletons pack's 95 clips are a strict superset of the Adventurers' 76. three.js
  binds an `AnimationClip` by node name, not by skeleton object, so one library plays on every
  model. Whole-game art: 35 MB → 1.97 MB.
- Also recorded because the disposal was not obvious: `Animation.dispose()` leaves its channels,
  samplers and their accessors orphaned, so stripping animations left a 3.4 MB file at 2.05 MB.
  Accessors have to be collected and disposed bottom-up, minus the ones surviving clips still use.

## ADR-088: Items exist because without them the game cannot end

- Date: 2026-07-31
- Status: accepted
- Decision: six-slot items with a fountain-only shop, per-champion build orders the bots follow,
  and a minion HP curve (`hpPerMin` 22 → 9) that lets champions out-scale the wave.
- Reason: a 25-minute six-bot match destroyed zero towers. Instrumenting it showed why: a
  champion needed exactly seven auto-attacks to kill a melee minion at level 1 *and* at level 12
  — minion `hpPerMin` had been tuned independently of champion `dmgPerLvl` and the two cancelled.
  Clear speed never improves, so a wave never breaks, so winning a fight never becomes tower
  damage. Gold accrued from kills, CS and towers and was never spendable, so the economy was a
  number that only went up. Items are the missing link in "win → gold → clear faster → push".
- Rejected on evidence: super minions when the enemy's towers are gone (LoL's inhibitor rule).
  Across twelve mirror matches it moved nexus finishes from 10/12 to 7/12 and the median from
  20 to 22 minutes — both teams reach "enemy has no towers" at about the same time, so the
  bonus cancels, and the dead super minions feed the defenders 130 XP and 60 gold apiece.
  Narrowing it to "only while I still hold a tower" produced byte-identical results.

## ADR-089: The bot's siege state was unreachable, not underused

- Date: 2026-07-31
- Status: accepted
- Decision: `SIEGE` is tested before the "an enemy champion is within 13 m" branch, gated on
  being healthy with minion cover and no enemy inside 6.5 m.
- Reason: SIEGE occupied 0.9% of bot time and towers stalled at partial HP. The cause was
  ordering, not tuning: you siege a tower precisely when defenders are standing under it, so
  the FIGHT/RETREAT branch always fired first and the state machine could never reach SIEGE.
  After the reorder, matches run 13–25 minutes (median ~19) and 10 of 12 end at a nexus.
- Also fixed here: `dawnkeeper`'s passive existed only as card text with no implementation —
  the one champion of six playing a man down, at a 20% win rate. Implemented, it returned to
  50%. Same failure class as a stale constant: something written down once and never wired up.

## ADR-090: Events are drained by the reader, not cleared by the writer

- Date: 2026-07-31
- Status: accepted
- Decision: `Sim.events` is emptied by `Sim.drain()` when a consumer takes it, not at the top of
  `step()`. `main.js` drains once per fixed step and hands the accumulated array to the view.
- Reason: Penny reported that abilities did nothing visible — no animation, no effect, no
  banner. The cause was the event buffer's lifetime, not the effects. Casting happens *before*
  `step()` — the player's key handler fires between frames, and bots cast inside
  `bot.update()`, which runs immediately before `step()`. Clearing at the top of `step()`
  therefore destroyed every `cast` event before any consumer could read it. A second, smaller
  version of the same fault: the view read `sim.events` once per rendered frame while the loop
  ran up to six sim steps per frame, so all but the last step's events were dropped.
- The general shape: a buffer whose producer and consumer disagree about who owns the reset.
  Writer-clears is only safe when every producer runs inside the same call, and here two of the
  three did not. `drain()` makes the reader the owner; an emit-side cap keeps headless runs that
  never drain from growing without bound.
- Gates: `sim.mjs` asserts a player cast survives the following `step()`, that bot casts are
  observed, that `drain()` empties, and that the buffer stays capped when nobody drains.
  `browser.mjs` presses an ability and requires the on-screen cast banner to name it.

## ADR-091: Direct movement, because click-to-move fought the joystick

- Date: 2026-07-31
- Status: accepted
- Decision: WASD/arrows on desktop and a left-half joystick on phone drive the champion
  continuously; a dedicated attack button (space on desktop) auto-targets, preferring a minion
  that one auto-attack would kill. Abilities move to Q/F/E/R so W stays a movement key.
- Reason: the first version was LoL's click-to-move. On a phone a single tap started the
  joystick *and* issued a move-to-tap order, so the two inputs fought; on desktop there were no
  movement keys, so aiming and walking shared one hand. Penny's verdict was that it was
  unplayable, and the two inputs contending for the same gesture is a design fault, not a tuning
  one.
- Also in this pass, because "I can't tell what the abilities are" is the same complaint from
  the UI side: ability buttons show the ability's name and rank, casting names the ability
  on-screen, damage and healing numbers float over the target, the player's auto-attack range
  is drawn on the ground, and each ability form now renders its own effect (bolt, telegraph,
  field, aura, streak) instead of one shared expanding ring.
- Also fixed: the model was rotated by an extra 180°. Measured against a reference arrow, the
  KayKit rigs face +Z, which is exactly what `atan2(dx, dz)` produces — the correction was for
  a discrepancy that did not exist, so every unit fought with its back turned.

## ADR-092: The ultimate was available at level 1, and the A/B went the other way

- Date: 2026-08-02
- Status: accepted
- Decision: `abilityRank` gates the ultimate at levels 5 / 9 / 12. Outer towers 1200 HP, inner
  1550, nexus 2300; structure armour decays from 9 to 18 minutes.
- Reason: the function's own doc comment said "the ult rises at 6 and 11, not at level 1" while
  the code returned rank 1 from level 1, and the test asserted the code's behaviour rather than
  the stated intent — so the disagreement survived. champions.js opens by stating "R should be a
  moment, not a bigger Q"; an ultimate from level 1 is neither.
- The measurement is worth recording because my first attribution was wrong. Gating the ult
  initially looked like it slowed matches (nexus finishes 6/8 → 4/8), so I compensated: cutting
  structure HP helped a little, tightening the XP curve by 20% made it *worse* (7/12 → 5/12 —
  levelling faster thickens both teams and towers get harder, not easier), and weakening the
  nexus into "an objective, not a third tower" was worse still (7/12 → 4/12; its firing arc is
  what stops the defender's fresh waves walking straight back out). With the settings finally
  in place, a clean A/B on the ult alone gave **7/12 with the gate and 4/12 without it** — the
  gate is better on design *and* on the measurement. The earlier reading was an interaction
  with tower HP, not an effect of the ult.
- Gates: `sim.mjs` asserts the ult is absent at levels 1–4 and rises at 5/9/12, and runs twelve
  mirror matches requiring every one to produce a winner and a majority to end at a nexus. The
  measured rate is 7/12 for bot-vs-bot; a human player is the asymmetry that breaks a mirror.

## ADR-093: One texture per unit was leaking — the skeleton's own bone texture

- Date: 2026-08-02
- Status: accepted
- Decision: `View.#disposeUnit` disposes each removed unit's cloned materials *and* its
  `Skeleton`; damage-number textures use an LRU cache of 96 with disposal, and values ≥ 1000
  render as "1.2k"; bar and ring geometries are shared rather than built per unit.
- Reason: over ten minutes the GPU texture count climbed 59 → 326 while the scene only ever
  referenced nine textures, and geometry climbed 100 → 230. The gap tracked the number of
  minions spawned, one texture each: since three r151 every `Skeleton` owns a bone `DataTexture`,
  and `SkeletonUtils.clone()` makes a new skeleton per unit. Disposing materials does not
  release it. After the fix the count rises and falls with live units instead of only rising.
- Also measured here: the JS is not the constraint. A sim step costs 0.062 ms and the HUD
  update 0.045 ms, so the whole fixed-step budget is about 0.17 ms per frame. Frame rate in the
  headless harness is bounded by software rasterisation (17 fps on an empty scene), so no real
  device conclusion can be drawn from it — hence quality tiers plus an automatic one-step
  downgrade when the median frame time stays above 1/34 s, rather than tuning to a fake number.

## ADR-094: Recall, because without it the shop was a system nobody could use

- Date: 2026-08-02
- Status: accepted
- Decision: a 6-second recall channel (X, or a HUD button), cancelled by taking damage or by
  any move / attack / cast order. Bots use it whenever they want to shop and no enemy is within
  16 m.
- Reason: the fountain is 62 m from the centre — about nine seconds each way, so a shopping trip
  cost roughly twenty seconds of doing nothing. Items are the only outlet for gold and the only
  reason gold exists (ADR-088), so a shop that expensive to reach is a system that quietly does
  not run. Measured over twelve mirror matches, adding recall moved nexus finishes from 7/12 to
  **10/12** and the median match from 22 to 19 minutes, with the fastest at 13. Nothing else was
  touched; the economy simply started circulating.
- Bug found while building it, worth naming: `recallUntil` was doing two jobs — "am I
  recalling" and "when does it finish" — so `recallUntil <= time` meant both "not recalling"
  and "just finished", and the completion branch was unreachable. 0 is now the sentinel and the
  timestamp only ever means a deadline.
- Gates: `sim.mjs` asserts recall cannot start at the fountain, that the channel holds the
  champion still, that it teleports on completion, and that damage, a move order and a cast
  each cancel it.

## ADR-095: A lane game needs a lane readout, and a spell needs to show where it lands

- Date: 2026-08-02
- Status: accepted
- Decision: a lane overview strip across the top (structures as ticks that grey out when
  destroyed, champion dots hollow when dead, per-team wave centroids) and a ground aim preview
  while an ability is held (range ring, beam for skillshots and dashes, landing circle for
  areas), plus zone-tinted terrain, tower plinths, a centre line, and wheel/pinch zoom.
- Reason: the map *is* one line, which was used as the argument for having no minimap — but the
  question a player asks every few seconds ("where is the wave, who is missing, can I go in")
  had no answer on screen at all. The same gap on the ability side: you pressed a key and found
  out where it went afterwards. Neither is polish; both are the information a MOBA runs on.
- Rejected along the way: two dirt hexes as a centre landmark (they covered a third of the
  bridge's width and read as damaged ground), then two stone posts (in portrait they read as
  floating pillars). A single light stripe across the lane says the same thing and stays out of
  the way.

## ADR-096: Health bars were coloured by team, so they never showed health

- Date: 2026-08-02
- Status: accepted
- Decision: the fill is green → amber → red by remaining health, the team is carried by a thin
  stripe under the bar, and champion bars are 2.1 world units wide (narrower than the model),
  minions 1.15. Shields draw as a white segment past the health.
- Reason: Penny reported the health display "doesn't look right". It wasn't a rendering fault —
  the bar was filled with the *team* colour, so a full-health red champion and a nearly-dead one
  looked identical, and a red bar meant "red team", not "in danger". A health bar that does not
  encode health is decoration. The first correction over-shot: at 3.6 units the bars were wider
  than the characters, so in any scrum they stacked into overlapping slabs and you could no
  longer tell which bar belonged to whom.

## ADR-097: At this camera distance, skeletal animation alone does not read

- Date: 2026-08-02
- Status: accepted
- Decision: every basic attack also draws a sweeping arc (melee) or a muzzle flash (ranged) in
  the attacker's colour; projectiles are thicker, brighter and oriented along travel; dashes
  leave a streak.
- Reason: Penny reported not seeing attacks or spell trails at all. Measuring the bones proved
  the animation *was* playing — the hand bone's quaternion changed every frame. The problem is
  scale: a 1.7 m character swinging a sword occupies a few dozen pixels from a 30 m camera, so
  the pose change is real and still invisible. Action games solve this with a weapon trail, not
  with a better animation.
- The projectiles had a separate, concrete fault: basic attacks are homing and carry no velocity
  vector, so the orientation branch never ran and the arrow stayed a 0.09-radius vertical stick.
  Direction now comes from the frame-to-frame displacement when no velocity exists. A third
  piece was simply never connected: `dashFrom` was recorded on every dash cast and never read,
  so displacement abilities had no trail at all.
- Gates: `browser.mjs` asserts a basic attack adds visual effects, that projectiles exist in the
  view whenever the sim has them, that every projectile is rotated off vertical, that the bar
  colour changes with health, and that bars stay narrower than a champion.

## ADR-098: A bot that re-decides every 0.2 seconds never finishes a fight

- Date: 2026-08-02
- Status: accepted
- Decision: four changes to `ai.js`, all in the same direction — make a decision, then live with
  it long enough for it to mean something.
  1. **Commitment.** Entering FIGHT locks the choice in for 3–5.5 s (longer for aggressive
     personalities), and the threshold to enter is higher than the threshold to break off.
     Breaking off starts a 2.5 s disengage window so a retreat is not reversed mid-step.
  2. **Local power, not personal health.** FIGHT/RETREAT compares both sides' effective HP ×
     damage × attack speed within 15 m of the contact point, ×1.6 for whoever's tower covers it.
  3. **Shared focus target.** Every bot on a team runs the same scoring formula over the same
     state, so all three converge on one enemy — squishy, low, and reachable scores lowest —
     without any shared "captain" object or update ordering.
  4. **Reachable-only dodging**, and a **power-play siege window**: with the defenders dead or
     out of position, two healthy champions may hit a tower without minion cover.
- Reason: the complaint was that team fights read as a mush. The first hypothesis — bots not
  focusing fire — was measured and **wrong**: concentration was already 1.01 distinct targets per
  team, where 1.00 is perfect focus. The measurement did find the real fault: 664 "fights" across
  six matches averaging 3.6 s, 90% of them producing no death. `pickState` is a pure function of
  the current instant, recomputed every 0.18–0.40 s, and FIGHT and RETREAT sat on the *same*
  threshold — two champions trading damage cross it in opposite directions every second or so, so
  every engagement shattered into a dozen three-second standoffs. A decision re-derived faster
  than its own consequences arrive is not a decision.
- Comparing 1v1 health percentages was its own bug: a bot in a 3v1 walked away because its bar
  was lower, and a bot in a 1v3 charged in because its bar was higher.
- Measured on 24 seeds that no tuning touched, mirror lineups, whole matches:

  | version | nexus finishes | kills | skillshot hits | mean match |
  | --- | --- | --- | --- | --- |
  | before | 23/24 | 365 | 77% | 18.4 min |
  | commitment + focus + power ratio | 19/24 | 736 | 75% | 19.0 min |
  | **shipped** (that + power-play window) | **20/24** | **627** | **76%** | **17.3 min** |

- **This is a trade, not a free win, and the shipped column is worse on one axis.** Three more
  matches out of 24 now reach the 25-minute limit. What was bought: fights that resolve (kills
  365 → 627, and the share of fights producing a death went 10% → 28%) and *faster* decisive
  matches — the games that do end at a nexus dropped from 18.1 to 15.8 minutes. The game became
  polarised rather than slower: a team that wins fights now closes them out, and a genuinely even
  match goes the distance. That is what a MOBA should do, so it ships.
- **Method error worth keeping.** The first tuning round ran on the twelve seeds T13 itself uses,
  read 10/12 → 11/12, and called it an improvement. On 24 fresh seeds that gain did not exist.
  Tuning against the test's own seeds is tuning against the test. Every number above comes from
  the independent set; T13 is now only a gate, never a search space.
- Rejected, measured: raising the engage threshold globally so bots fight less — 8/12 at +0.25 and
  9/12 at +0.50 on the tuning set, with skillshot accuracy collapsing to 45% because bots stopped
  closing at all. Declining a fight and abandoning the objective are the same mistake in different
  clothes; the fix was to price the objective, not to suppress fighting.
- Dodging deliberately does nothing at point-blank range. Clearing a projectile's width needs a
  lateral speed inversely proportional to the time left, and that exceeds a champion's move speed
  well before contact — a bot that sidesteps anyway takes the hit *and* loses its position. The
  test is not "is this dangerous" but "starting now, is there time to get out".
- Gates: `sim.mjs` T21 asserts a bot sidesteps a projectile 1.6 s out, that the sidestep is
  perpendicular and stays on the bridge, and that a projectile 0.15 s out produces no movement at
  all. T13 still requires nexus finishes to be the majority outcome.

## ADR-099: The health bar was correct all along; it was never drawn

- Date: 2026-08-02
- Status: accepted
- Decision: all four pieces of a unit bar are now `transparent: true`; a dash's landing point is
  clamped *before* it is stored and every dash carries a deadline; `orderMove` clamps its goal to
  the reachable region; the basic-attack swing plays in at most 0.42 s instead of stretching to
  fill the cooldown; the attack button draws a cooldown sweep; and single-target abilities emit a
  `strike` event so something happens at the victim.
- Reason: Penny sent a screenshot with three complaints. Cropping and magnifying it settled the
  first one immediately — every world-space health bar was **solid black**, with the team-colour
  stripe visible underneath it. So the bar rendered, the stripe rendered, and the green fill did
  not. The cause is that three.js draws opaque objects in one pass and transparent ones in a
  second, and `renderOrder` only sorts *within* a pass. The backing plate was
  `transparent: true`, the fill was opaque — so the near-black plate was always painted after the
  fill, and with `depthTest: false` it covered it completely. ADR-096 changed the fill to encode
  health rather than team; that change was correct and has never once been visible on screen.
- **The gate that should have caught it read the data, not the picture.** `browser.mjs` asserted
  that `fill.material.color` differs between full and low health. It did, every time, while the
  screen showed a black rectangle. A test that inspects the model cannot see the compositing. The
  new assertions check the invariant that actually broke: all four bar pieces must sit in the same
  render pass, and the fill's `renderOrder` must exceed the backing plate's.
- The freeze Penny reported ("卡死喺嗰邊") was a hard lock with a provable cause. `_form_dash`
  built the landing point, called `#clampToBridge` on a **temporary object**, and threw the result
  away — `c.dash` kept the unclamped coordinates. `#tickDash` then clamps the champion's position
  to the bridge every tick while the target sits off it, so `remain` never shrinks below one step,
  the dash never ends, and `#tickChamp` opens with `if (c.dash) return`. The champion stops
  moving, attacking and casting, permanently. Emberwake's E dashes *backwards*, so standing near
  the rail and pressing it walked straight into this. This is the third instance of the same
  shape in this game — `dashFrom` written and never read, `sim.events` cleared by its writer — so
  it is worth naming: **a computation whose result nobody consumes.**
- A second, milder stall shared the boundary: `input.js` clamps the movement goal to
  ±`MAP.halfWidth` while entities clamp to ±(`halfWidth` − `r`). Off by one radius, so
  `#moveToward` never reported arrival, `orderX` never cleared, and the champion ground against
  the rail. `orderMove` now clamps its own goal, and `#moveToward` gives up on a goal it cannot
  make progress towards.
- On "is the basic attack cooldown too long": measured, it is 1.59 s at level 1 for the slowest
  champion and 1.24 s at 12; a marksman goes 1.39 → 0.69 with items. Those are League-typical and
  they do scale — an earlier reading that said otherwise was my measurement error (setting
  `c.level` directly does not recompute derived stats). The number is fine; what was broken is
  that the swing animation was stretched to `min(1.1 s, the whole cooldown)`, so every attack
  played in slow motion and never appeared to land, and the attack button gave no feedback at all
  while it recharged. Fast swing plus a cooldown sweep, no balance change.
- Single-target abilities emitted no visual event whatsoever. The caster got a small ring at its
  feet and the victim got nothing — pointing at someone eight metres away and watching their
  health drop. They now draw a streak from caster to victim and a burst on arrival; ally-targeted
  shields, which previously produced no event at all, use the same path in green.

## ADR-100: Direct movement owns only its own order; the shop must never become a touch dead end

- Date: 2026-08-02
- Status: accepted
- Decision: WASD and the virtual joystick keep an input-local ownership flag for their repeated
  movement order. Releasing the final direction clears that order immediately, but only while no
  attack order has taken over. `moving` is reset at the start of every simulation tick and set
  again only by real displacement, so animation state describes the current tick rather than the
  last time the unit moved.
- The fountain-only shop rule stays. The shop is now a real modal touch layer with a dim backdrop,
  a 44 px `返回戰場` action, visible purchase success/failure feedback above the modal, and a
  top-bar `返程購物` action whenever the player is away from the fountain. Both actions remain in
  view in portrait; putting recall after the sixteen-item grid failed because it sat below the
  phone viewport and reproduced the reported dead end.
- Reason: joystick `update()` placed a goal six metres ahead on every tick. `touchend` removed the
  stick but left its final goal behind, so the champion walked the remaining distance. Clearing
  every order on release was not acceptable: an attack or mouse order may have replaced the stick
  between input events. Separately, `moving` was only ever set true by `#moveToward`; an idle tick
  never reset it, which left `Running_A` playing after the unit had stopped.
- The shop screenshot was taken away from the fountain. `sim.buy()` correctly rejected the item,
  but `.moba-flash` rendered below the z-30 shop and the only close target was a small `×`. The
  correct rule therefore looked like a frozen UI. Do not remove the fountain economy to mask an
  interaction failure; expose the state and a direct route back instead.
- Gates: `sim.mjs` T24 proves move → stop produces `moving === false`. `browser.mjs` now runs with
  touch enabled in landscape and portrait, drives `touchstart → touchmove → touchend`, requires no
  post-release drift and `Idle_Combat`, preserves a replacement attack order, touch-buys and closes
  the shop at the fountain, and verifies visible refusal plus working recall away from it.

## ADR-101: Elden Ring II is a self-contained static bonus game, not a worker app

- Date: 2026-08-02
- Status: accepted
- Decision: the Game Hub copy lives under `games/elden-ring-ii/` as a Vite + React client app.
  Pages builds its ignored `dist/` in CI, the hub links to `dist/index.html`, and every runtime
  model/audio URL resolves from Vite's relative `BASE_URL`. The original Vinext, Next, Cloudflare,
  D1, and server-auth wrappers do not move into Game Hub because GitHub Pages cannot execute them.
- Persistence remains local-first. Run history always uses localStorage; an authenticated Supabase
  write is optional only when browser-safe `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY` values are provided. No migration is applied as part of this
  integration.
- Asset provenance moves with the game. The bundled Quaternius, Kenney, KayKit, Poly Haven, and
  OpenGameArt files retain their source/license records under `public/assets/licenses/`, and the
  in-game credits/fan-made disclaimer remain available.
- Runtime model loads retry up to three times. A persistent failure must offer an explicit reload
  action and must never change the title screen to a playable state with an empty 3D world.
- Reason: copying the old worker build would leave no static HTML entry and absolute `/assets/...`
  paths would escape the nested game folder. A thin client conversion preserves the actual 3D
  game while making its deploy/runtime contract match the existing static Hub.
- Gates: `npm test` covers typecheck, relative build output, required models/audio/licenses, and
  local-save source. Browser QA must additionally prove Hub navigation, all 3D requests at 200,
  gameplay start, movement, camera drag, and mobile touch input with zero console errors.

## ADR-102: The Hub pages games in groups of four instead of featuring one card at a time

- Date: 2026-08-02
- Status: accepted
- Decision: `launcher.js` remains the game-list source of truth, but renders four-game pages.
  Wide screens show four columns and phone widths show the same four games as a 2×2 grid. Swipe,
  arrows, keyboard navigation, dots, and page status all advance one group; hidden pages are not
  keyboard-focusable. The final page may contain fewer than four cards rather than duplicating a
  game merely to fill space.
- The first group intentionally keeps related tabletop games together in this order: 五子棋,
  中國象棋, 鋤大D, 鬥地主. The Gomoku mark uses two equal CSS stones instead of platform emoji,
  whose black and white glyphs render at visibly different sizes.
- Short landscape phones have a compact four-column treatment so the complete cards, Play actions,
  arrows, and page status remain within 844×390. Phone portrait uses 2×2; neither mode may make the
  document wider or taller than the viewport.
- On phone portrait, cards use compact app-tile proportions rather than four tall feature panels.
  Arrows, dots, and page status share one centred footer dock. A partial page containing one game
  keeps the same tile size as a full page and is centred on both axes instead of stretching to the
  full page height or anchoring to the left.
- Xiangqi's source page is one level above its built `dist/` page. Its Vite build rewrites the
  shared online-helper URL from `../shared/` to `../../shared/`; otherwise Hub navigation succeeds
  but production silently requests the nonexistent `games/xiangqi-ai/shared/` path.
- Gates: `node tests/hub.mjs` covers 320×568, 440×956, 844×390, and 1280×800, including ordering,
  layout, full-viewport fit, compact portrait-card height, footer grouping, tall-phone vertical
  balance, final-card size/centring, swipe/keyboard/dot navigation, focus isolation, unique entries,
  equal Gomoku stones, and zero Hub browser errors. A real card click must also reach Xiangqi's
  built page with its canvas and shared helper requests returning successfully.

## ADR-103: Champion attacks use stable procedural visual grammars carried by simulation events

- Date: 2026-08-02
- Status: accepted
- Decision: each 深淵之橋 champion owns one basic-attack profile and four ability profiles in
  `looks.js` (`CHAMPION_FX`). Profiles name a stable style/family and combine colour, polygon
  sides, rings, rays, cross, dome, pillar, spikes/flames, collapse direction, blade count, trail
  width, and projectile family. `fx.js` turns those profiles into low-cost procedural geometry;
  this identity must not collapse back to a shared coloured ring for every skill.
- The simulation is authoritative for visual identity. Casts, skill projectiles, impacts, zones,
  traps, and trap triggers carry source/champion/ability metadata. `view.js` resolves the profile
  from that metadata, so bot and player casts share the same language and effects do not guess
  from colour alone.
- Longshot arrows, Emberwake fire, and Dawnkeeper holy bolts use materially different projectile
  geometry and orientation. All transient groups must dispose their geometry/material at the end
  of life; projectile cleanup traverses child meshes, and `View.dispose()` clears the FX layer.
- Gates: the browser suite requires six distinct basic-attack style/geometry signatures, all 24
  ability style IDs with at least 20 distinct silhouettes (currently 24), three projectile model
  classes, zero residual FX after a stress burst, both mobile layouts, a completed match, and zero
  console errors. These structural gates do not replace subjective crowded-teamfight readability
  or physical-device performance QA; those remain the next production pass.

## ADR-104: 深淵之橋 uses an anywhere-purchase shop and versioned shop entry chain

- Date: 2026-08-02
- Status: accepted; supersedes the fountain-only clauses of ADR-088, ADR-094, and ADR-100
- Decision: player and bot purchases are legal anywhere on the bridge. `Sim#atFountain()` owns the
  location question for healing and recall; `Sim#canShop()` is a separate purchase gate and must
  not be reused to infer whether a champion is home. The shop says `隨時可買`; its optional recall
  action is `返程回血`, not a prerequisite for buying.
- The shop has three independent mobile exits: a sticky, minimum-44-px `返回戰場` action, a full
  screen backdrop, and `返程回血` (which closes before starting recall). Closing uses an idempotent
  `force=false` path so pointer and synthesised click events cannot reopen the modal.
- The reported screenshot contained the removed text `商店（要返到泉水先買得到）`, proving the
  phone had retained old `hud.js/style.css`. The Hub MOBA link, MOBA stylesheet/entry module, and
  changed `hud.js/sim.js` imports therefore carry one shared `shop-anywhere-1` version token. The
  fast cache-bust gate prevents a future edit from silently breaking that delivery chain.
- Gates: `cache-bust.mjs` checks the six tokens; `sim.mjs` proves an away purchase deducts gold and
  changes stats; `browser.mjs` touch-buys away from the fountain and closes via the 44-px action,
  backdrop, and recall in landscape and portrait, with zero console errors.

## ADR-105: A buff that spends its whole life at 60% size is a buff nobody sees

- Date: 2026-08-02
- Status: accepted
- Decision: `cue()` now grows a *following* (self-buff) sigil to full size within the first 18% of
  its life and holds it there, instead of ramping linearly across the whole duration; and the
  `dome` part is a faint translucent shell with a bright rim ring rather than a wireframe mesh.
  The grow-in is measured in absolute seconds (0.22 s), not as a fraction of `life` — how fast a
  shield pops in should not depend on how long it lasts.
- Reason: this is the crowded-fight readability review ADR-103 left open. Six champions were
  pushed into a two-metre cluster at level 12 and made to fire all four abilities on a loop, at
  844×390 and 430×860, and the frames were captured and magnified rather than judged by eye at
  full size. Two faults came out of that, both invisible to the geometry-signature gates because
  both are about *scale and timing*, not identity.
- **The self-buff sigil was undersized for essentially its entire duration.** `cue()` interpolates
  scale from 0.52 to 1.08 linearly over `life`. For a 0.5 s cast flash that reads as an expanding
  burst, which is right. But a self ability passes `life: ab.duration ?? 2.5`, so a shield spends
  two seconds at roughly 60% size and only reaches full size at the moment it fades out. Magnified,
  Ironward's 鐵壁 was a knot of white lines around his ankles — smaller than the character it was
  supposed to be protecting. This is the concrete form of Penny's long-standing "some ability
  effects are completely invisible": they are not missing, they are drawn too small to notice.
- **`wireframe: true` does not survive this camera.** A hemisphere rendered as its own triangle
  mesh, thirty metres out on a phone, is a scribble — it reads as a rendering fault, not a ward.
  Five ability profiles used it. A dim shell carrying a bright rim ring reads at distance because
  the silhouette comes from the edge, not from line density. Before/after captures of the same
  frame confirm it.
- Measured, worst case (six champions, four abilities each, fired within ~1.2 s):

  | | idle | peak | +4 s | +8 s |
  | --- | --- | --- | --- | --- |
  | geometries | 94 | 597 | 190 | 160 |
  | FX items | 0 | 44 | 8 | 7 |
  | draw calls | 94 | 1311 | — | — |

- **No leak.** The residual above idle at +12 s and beyond is live gameplay, not retained effects:
  the idle baseline was sampled before the first minion wave, which spawns at 12 s, so the extra
  scene children are minions. Effects fall from 597 geometries to 190 within four seconds.
- The number worth watching is **draw calls: 94 idle, 1311 at the synthetic peak.** Each sigil is
  built from many small meshes (rings, rays, spikes, dome, rim, pillar), so density multiplies
  call count roughly fourteen-fold. Real play fires perhaps a quarter of that storm, but if phone
  frame pacing ever becomes a problem this is where to look first — merging a sigil's parts into
  one buffer geometry, not cutting effects.
- Gates: `browser.mjs` asserts a following sigil is past 90% scale a quarter-second into a
  2.5-second buff, and that no cast sigil uses a wireframe material. The first gate caught my own
  first attempt: ramping over 18% of `life` still left a 2.5-second shield undersized at 0.25 s.
- Not changed: nothing else was tuned. The remaining profiles read acceptably at both sizes in the
  captures, and tuning them without a specific fault would be redecorating.

## ADR-106: The shop button worked everywhere except on a phone

- Date: 2026-08-02
- Status: accepted
- Decision: shop cards and bag slots commit on a guarded `pointerup` — same pointer, under 12 px
  of drift, under 800 ms — with `click` kept for keyboard and assistive tech and suppressed by a
  flag that the next `pointerdown` clears. The cards declare `touch-action: manipulation`, stand at least 44 px tall, and
  show a press state. Failures name the actual reason instead of listing possibilities.
- Reason: Penny reported having gold, seeing the card light up gold, and getting nothing at all
  when pressing it. The gold highlight and `sim.buy` do agree — ADR-104 reduced `canShop()` to
  `!!c`, so the purchase is not gated by position any more. The fault is one layer up. The shop
  panel is `overflow-y: auto` with `touch-action: pan-y`, so vertical gestures belong to the
  scroller; on iOS a tap that drifts a few pixels inside such a container is classified as a
  scroll and **no `click` is ever synthesised**. The card was listening for `click` alone, and was
  a 7 px-padded target inside that scroller. A desktop mouse and Playwright's `touchscreen.tap()`
  both produce zero-movement input, so the click always fired for them: the suite was green while
  the phone was dead. The codebase already knew this — the close button had been moved to
  `pointerup` for exactly this reason — the item cards simply never followed.
- **The old gate could not have caught it.** `touchscreen.tap(x, y)` does not drift, so it tests
  the one input the real device rarely produces. The new gate dispatches pointer events only, with
  a six-pixel offset and no `click` at all, so it fails on the previous code by construction; it
  also asserts a forty-pixel drag does *not* buy, that the computed `touch-action` is
  `manipulation`, and that the card is at least 44 px tall.
- Measured after the change, 430×860: a six-pixel drift buys (items 0 → 1), a forty-pixel drag
  does not, `touch-action` is `manipulation`, card height 69 px, zero console errors.
- Also fixed while in here: `flash('金幣唔夠或者裝備格已滿')` asked the player to guess which of
  two things was wrong. It now says `爭 N 金` or `裝備已滿 6 格，賣一件先`, and the card itself
  carries the reason before you press it — a dimmed card with `· 唔夠` on the price. Bag slots
  had the same click-only binding and are now armed the same way, with a sale confirmation.
- **De-duplicating the compatibility click by time was itself a bug, and the new gate caught it.**
  The first version treated any `click` within 600 ms of a handled `pointerup` as a duplicate. In
  an idle probe the two are five milliseconds apart, so it looked correct; in the full suite, with
  a match running and the main thread busy, the gap exceeded 600 ms and one tap bought two items.
  A phone is the environment most likely to stall, so a timing window was exactly the wrong
  mechanism. The flag is deterministic: set on a handled `pointerup`, cleared by the click that
  follows or by the next `pointerdown` if none ever comes.
- Cache token moved `shop-anywhere-1` → `shop-tap-2` across all six entry points, because a fix
  that ships behind a stale `hud.js` is not a fix. `cache-bust.mjs` keeps the six in agreement.

## ADR-107: The same touch defect was in five more places, including the first screen

- Date: 2026-08-02
- Status: accepted
- Decision: "what counts as a tap" now lives in one module, `src/tap.js`, and every interactive
  control in the MOBA uses it. Every button is at least 44 px on its short side and declares
  `touch-action: manipulation`. `browser.mjs` gates the reach rule across the whole HUD.
- Reason: Penny's last two reports — the joystick not stopping on release, and the shop not
  buying — were the same defect wearing different clothes, and both reached her because the suite
  cannot see it. So instead of waiting for the third report, every control was measured: real
  rendered size, computed `touch-action`, and enclosing scroll container, at 430×860.
- What that found, all confirmed by measurement rather than reading:
  - **`pick-card` — the champion select cards — were `click`-only inside `#pick-grid`, which is
    `overflow-y: auto`.** Identical to the shop bug, on the first interaction in the game. A
    finger that drifts while choosing a champion selects nothing.
  - `moba-shopbtn` rendered **31 px** tall and `moba-gear` **34 px**; the settings `×` was
    **24 px**. All below the 44 px a finger can reliably hit.
  - `recall`, `shop`, `backdrop`, `gear`, settings toggles and the quality segments were all
    `click`-only.
- **A private copy of the tap logic is how the select screen got missed.** ADR-106 put the
  guarded-`pointerup` handler inside `Hud` as a private method, so it fixed the shop and could not
  fix anything outside the HUD. Extracting it to `tap.js` is the fix at the right depth: one
  definition of the gesture, used by the HUD, the select screen and anything added later.
- Measured after the change at 430×860: a pointer-only tap with a seven-pixel drift selects a
  champion (the old code selects nothing), the match starts, and no HUD button is under 44 px.
- Gates: `browser.mjs` now walks every visible `#hud button` and fails if any short side is under
  44 px. That is a rule about the whole surface rather than about the buttons that happen to be
  named in a test today, so a new control cannot quietly reintroduce the defect.
- One gate had to be fixed on the way: the basic-attack FX gate measured the **net change** in
  `fx.items.length` across one frame. That pool drains at the same time, so when more old effects
  expired than new ones were added the difference read zero and the gate failed while the attack
  was in fact drawing. It now records the identity of the items that were already there and counts
  only the genuinely new ones. This is the fourth appearance of "a net delta on a draining pool";
  the rule is to count identities, not sizes, whenever the pool has its own lifetime.
- Note on the audit tool: its listener column reads `?` because extracting a CDP `objectId` from a
  Playwright handle did not work. Sizes and `touch-action` are real measurements; the listener
  bindings were confirmed by reading the source. Worth fixing if the audit is ever re-run.

## ADR-108: The basic attack was slower than a minion's, and the opening felt dead

- Date: 2026-08-03
- Status: accepted
- Decision: champion base attack speed goes up ×1.4 across all six, and the melee minion drops from
  400 to 330 HP. Per-level growth, per-hit damage, ability damage and item values are untouched.
- Reason: Penny asked, in her own words, whether the basic attack cooldown was too long. It was,
  and the measurement is worse than the question implies. At level 1 the interval was 1.39–1.59 s
  and a melee minion took 6–8 swings, so **one minion cost 8.6–12.7 seconds**. A wave is six
  minions. The mage was the worst case at 12.7 s. Meanwhile a melee minion swings every 0.8 s —
  the champion was attacking slower than the creeps it was fighting.
- After: level-1 interval 0.99–1.13 s and one minion in 5.1–7.9 s. Level 12 is 0.79–0.95 s.
- Rejected — keeping DPS constant by lowering per-hit damage as attack speed rose. It would have
  made the animation more frequent and changed nothing about the ten seconds a minion survives,
  which is the actual complaint. It would also have forced every `adRatio` to be re-tuned, since
  ability damage reads the same `damage` stat.
- Rejected — leaving minion HP alone. Attack speed alone still left the mage at seven swings; the
  sponge is half the problem and it lives in the minion, not the champion.
- Validated on three independent 24-match sets, none of them the twelve seeds T13 uses, because
  tuning against a gate's own seeds is exactly the mistake made in ADR-098:
  - nexus finishes **58/72 → 65/72**
  - average match **19.5 min → 17.5 min**
  - average kills 29.3 → 31.8, so fights did not turn into a bloodbath
  - **these figures were re-measured after ADR-109.** The numbers first recorded here (57→69,
    19.0→15.8 min) came from a biased sample: the RNG's first output was near zero every match,
    so the first bot's reaction time was not random. The direction and the conclusion hold; the
    size was overstated.
  - all 208 sim gates pass unchanged; not one threshold had to be re-baselined
- **Not caused by this change:** red side won far more than blue on mirrored lineups — 25/72 blue
  before, 24/72 after. That investigation became ADR-109 and found the cause was the RNG, not the
  balance. Re-measured with the fixed RNG, blue takes 33/72 both before and after this change, so
  the pacing change is side-neutral, which is what was claimed here.
- Gate: T25 asserts a level-1 interval at or under 1.15 s and a first-wave melee minion dead within
  8 s, for every champion. The ceiling is the mage by design — she clears with W, not with autos —
  so the rule reads "even the one who is worst at auto-attacking does not wait ten seconds".

## ADR-109: The first random number of every match was not random

- Date: 2026-08-03
- Status: accepted
- Decision: `makeRng` now scrambles the seed through a multiply-xor before it becomes xorshift32
  state, and discards eight outputs before returning the generator. Same seed, same match; a
  different sequence.
- Reason: the old code used the seed directly as xorshift32 state. A 32-bit xorshift needs several
  iterations to diffuse a small integer, so the early outputs are not usable. Measured over the
  seed sets in use, the **mean of the first output was 0.007, 0.013, 0.019 and 0.001** — not 0.5.
  The second was anywhere from 0.21 to 0.77 depending on the block of seeds. Sequential seeds
  (101, 102, 103…) made it worse: neighbouring matches drew correlated early values, so averaging
  over more matches did not wash it out.
- The first consumer is the first bot's reaction offset, `think = sim.rng() * reaction`. So blue's
  first champion started every single match with an effectively fixed, extreme reaction time.
- How it was found: mirrored 3v3 lineups produced 24/72 wins for blue. The per-minute diagnostic
  showed blue ahead at 2 minutes, level at 5, behind at 10 — a compounding effect, not a spawn
  asymmetry. Map, spawns and wave positions are all mirror-symmetric under x → −x, so the bias had
  to be in something that is not part of the geometry.
- Effect: blue wins go **24/72 → 33/72** on the same three 24-match sets. 33 against an expected
  36 is 0.7σ, so no side bias survives that the sample can see.
- Consequence for ADR-108: its published figures were measured on the biased sample and have been
  corrected in place. Re-measured with both variants under the fixed RNG, the pacing change still
  improves nexus finishes 58/72 → 65/72 and shortens matches 19.5 → 17.5 min.
- Gate: T26 draws the first output for seeds 1–200 and requires the mean within 0.06 of 0.5, a
  balanced split either side of 0.5, and the first draw to be no more special than the fifth. It
  also asserts that the same seed still reproduces the same sequence, which is the property the
  fix must not break.
- The wider lesson, and the reason this is an ADR rather than a one-line fix: **a seeded generator
  is part of the test fixture, not just the game.** Every gate that runs matches was reading a
  distribution with a fixed point in it. Nothing failed, because nothing was measuring the
  generator — the same shape as "a test that encodes the code's behaviour rather than the intent".
- Related, found while re-running the suite after this fix: `browser.mjs` imported `playwright` as
  a bare specifier, which resolved only through an untracked `node_modules` somewhere above
  `games/moba/tests/`. There is no `package.json` at that level, so on a fresh clone the MOBA
  browser suite had never been runnable. It now points at `games/Racing Car/tests/node_modules`
  explicitly, the same route `tests/hub.mjs` already used.

## ADR-110: In portrait the lane now runs up the screen, not across it

- Date: 2026-08-03
- Status: accepted
- Decision: when the viewport is taller than it is wide, the camera rotates 90° about Y so the
  long map axis maps to the long screen axis. Your base is at the bottom, the enemy at the top.
  Landscape is untouched — `camYaw` is 0 there and every formula reduces to what it was.
- Reason: measured, portrait spent **83.6% of the screen on abyss and water**; only 16.4% was
  ground you can stand on. The handoff had this as "roughly half", which understated it. The cause
  is geometric, not artistic: the bridge is 17 m wide, but showing ~25 m of lane across a 430×860
  screen forces a ~50 m vertical span, so the bridge can never be more than about a third of the
  frame however the camera is placed.
- Rejected — just steepening and pulling in the existing camera. Measured across four variants: the
  best (h50 d18 fov48) reached 23.5% ground while cutting visible lane from 26.9 m to 23.9 m.
  Paying lane visibility for seven points of ground is not a trade worth making.
- After rotating: **70.1% ground, 36.6 m of lane visible**, player at 70% down the screen. Both
  numbers move the right way at once, which is the tell that the axis was the real constraint.
- Camera settled at height 32, depth 16, fov 44, looking 2 m ahead of the player. Those four were
  chosen by measuring ground coverage, visible lane length and the player's on-screen height
  together — a steeper camera reduces tower occlusion but also shortens the lane you can see.
- What had to follow the camera: the joystick and WASD speak **screen** directions, so both now go
  through one `screenToWorld` rotation; ability aim-drag likewise. Ground picking already went
  through a raycast, so it followed for free.
- Gates, all orientation-aware because the two orientations promise different things:
  - ground coverage ≥50% in portrait, ≥15% in landscape (landscape is a deliberate wide vista)
  - ≥30 m of lane visible, and the player on screen between 45% and 88% down
  - dragging the stick right moves the champion **along the camera's right vector**, not along +x;
    the old gate asserted +x and would have passed a camera that ignored the rotation entirely
  - pushing up moves along the camera's forward vector, and in portrait that must also be toward
    the enemy base
- Two existing gates had to be rewritten rather than re-baselined: the joystick drag and the WASD
  walk both hard-coded "+x is right". They were not wrong before — they encoded an assumption that
  had been true. That is the same failure mode as ADR-109's RNG: the fixture quietly carried an
  assumption nobody was measuring.
- Follow-up in the same commit series: the lane-overview bar now stands up in portrait too. The
  drawing code did not change at all — only the canvas transform, mapping `(along, across)` onto
  `(v, height − u)`, so blue base sits at the bottom exactly as the camera shows it. Which way it
  runs is decided by CSS alone; the JS reads the box it was given rather than repeating the media
  query, so the two cannot drift apart.
- Its gate reads the rendered canvas rather than the code: it projects both nexuses through the
  real camera to learn which way the battlefield runs, then finds the blue and red pixel centroids
  in the bar and requires both the axis and the ends to agree. A gate that recomputed the bar
  mapping would only prove the formula equals itself.

## ADR-111: The cache token covered the entry points but not the module graph

- Date: 2026-08-03
- Status: accepted
- Decision: every local module import inside `games/moba/src` carries the same `?v=` token as the
  entry points. `scripts/moba-bump-cache.mjs` rewrites all 35 sites at once, and
  `tests/cache-bust.mjs` now fails if any local import is missing the token or carries a different
  one.
- Reason: browsers cache per URL. Bumping `main.js?v=…` gets a fresh `main.js` and nothing else —
  everything it imports without a query can still be served from cache. ADR-108 changed balance
  numbers in `champions.js` and `constants.js`; neither was under any token, so a returning player
  could have loaded new `sim.js` against a cached old `constants.js`. Not a hypothetical shape of
  bug: a hybrid build like that fails in ways that reproduce on nobody's machine.
- Why a script rather than hand-editing: 35 sites, and a *partial* rename is worse than none. A
  module imported under two different URLs is loaded twice, giving two copies of its state. The
  token now has exactly one way to change, and a test that fails if it changed unevenly.
- Rejected — a build step. The game is deliberately buildless; a query string on an import
  specifier costs nothing at runtime and keeps `node tests/sim.mjs` working unchanged (node
  resolves file URLs with queries fine, verified before committing to the approach).
- Also fixed here: three motion gates asserted **distance** where they meant **direction**. One of
  them failed on a rerun with the champion moving 1.1 m instead of 3 m — the direction was exactly
  right, the machine was just busier. They now require the displacement to lie along the intended
  screen axis and to dominate the perpendicular component, which is what "push up goes up"
  actually claims. A distance threshold in a timed window measures how loaded the box is.

## ADR-112: The hub fetched its font from Google on every page load

- Date: 2026-08-03
- Status: accepted
- Decision: Outfit is vendored at `assets/fonts/outfit-latin.woff2` (SIL OFL 1.1, licence and
  provenance in `assets/fonts/`). The hub and three game stylesheets declare a local `@font-face`
  instead of `@import`ing from `fonts.googleapis.com`.
- Reason: the old `@import` cost **two blocking cross-origin round trips per page** — fetch the
  CSS, then fetch the woff2 the CSS names — before any text could render in the intended face. On
  a slow phone connection that is the blank stretch after tapping a game. With no network at all
  it silently falls back to system fonts, which is how this was found: the hub suite had four
  failures, all one blocked request.
- One file covers everything: Google's CSS serves the **same URL for all five weights** (300–800),
  so a single 32 KB latin subset loses nothing. Declared as `font-weight: 300 800` rather than
  five identical rules.
- Rejected — a shared `assets/fonts/outfit.css` that each page `@import`s. That reinstates one of
  the two round trips it was meant to remove. Each stylesheet declares the face itself with its
  own relative path; four short duplicated blocks beat a request.
- Gates: the hub suite now asserts `document.fonts.check('700 16px Outfit')` at each of its four
  sizes, and separately that the page makes **no external request at all**. "Zero console errors"
  never caught this — a font that fails to load is not an error, it is a silent downgrade. Hub is
  now **83/83**, up from 71/75 where the four failures were this bug.
- Snake game followed in the same pass: Orbitron and Rajdhani are vendored the same way, and its
  three `<link>` tags (two preconnects plus the stylesheet, which then pulled four woff2 files)
  became one inline `<style>`. Both `index.html` and the tracked `dist/index.html` were edited so
  a rebuild carries the change rather than reverting it. Verified: all four faces report
  `loaded` with zero failed requests.
- Not done: `games/tower` (Inter, Oxanium). Its `@import` is bundled into
  `dist/assets/index-*.js`, so moving it means running that build — a separate job.

## ADR-113: Whichever team's bots decided last was winning more

- Date: 2026-08-03
- Status: accepted
- Decision: bot decisions now alternate direction every tick, through one shared `updateBots(bots,
  dt, tick)` in `ai.js` that `main.js` and the test harnesses both call. No caller iterates the
  bot list itself any more.
- Reason: a bot's decision writes straight into sim state — `orderMove`, `orderAttack` and `cast`
  all mutate immediately. So a bot updated later in the loop reads a world in which its allies and
  opponents have *already moved this tick*, while the first bot in the list reads last tick's
  world. That is a within-tick information advantage, and it lands entirely on one side because
  champions are created blue-first.
- Measured across the same three 24-match mirrored sets (72 matches), changing nothing but the
  iteration order:
  - blue decides first → blue wins **33/72**
  - red decides first → blue wins **48/72**
  - alternating → blue wins **35/72**, against an expected 36
- This is what was left over after ADR-109. The RNG bug and this one were pulling the same way,
  which is why the residual after fixing the RNG still looked like a red-side edge.
- The player is always blue, and the player's two bot teammates are always created before the
  three enemy bots. So the systematic loser was the player's own team.
- Rejected — "everyone decides from a snapshot, then all orders apply". That is the fully correct
  model, but it means splitting decision from mutation throughout `ai.js`, and every path that
  currently calls `sim.cast` mid-decision would need an intent object. Alternating cancels the
  bias **exactly** every two ticks rather than statistically, costs one parameter, and stays
  deterministic — same seed, same match.
- Side effect worth noting: nexus finishes went 65/72 → **69/72** and average match 17.5 → 15.4
  min. Removing a persistent structural edge makes matches resolve on play rather than grind.
- Gate: T27 drives `updateBots` with recording stubs and asserts the two-tick cycle visits every
  bot exactly once and swaps first and last. The win-rate evidence needs 72 matches, which is not
  a fast gate; the mechanism is what a test can hold.
- One gate needed fixing on the way, twice, and both were the gate's fault. It measured the
  champion's **absolute position** as if it were displacement — true only while the start happened
  to be the origin — and it took its measurement mid-wave, where unit collision pushed the
  champion 2.29 m sideways and swamped the direction being tested. It now starts from a clear spot
  in friendly territory and subtracts the start. Perpendicular drift is 0.00 in both orientations.

## ADR-114: The draw-call optimisation ADR-105 recommended is not needed

- Date: 2026-08-03
- Status: accepted (supersedes ADR-105's "first lever" advice)
- Decision: do **not** merge sigil parts into single buffer geometries. The recommendation is
  retired, and a draw-call budget gate is added in its place.
- Reason: ADR-105 measured 1311 draw calls and named that merge as the first thing to try if phone
  frame pacing turned out bad. That 1311 came from a **synthetic scenario** — six champions held
  in a two-metre cluster firing all four abilities on a loop — which was the right way to stress
  the FX renderer but the wrong number to plan performance around. Measured across a full
  bot-vs-bot match instead, sampling twice a second:
  - portrait 430×860 — median **42**, p90 114, p99 210, **peak 286** (11 samples' worth of FX live
    at the peak: 5 items)
  - landscape 844×390 — median **162**, p90 249, p99 313, **peak 342**
- So the realistic peak is about a quarter of the synthetic one, and comfortably inside a phone
  budget. Spending a day flattening sigil geometry would have been work aimed at a number that
  never occurs in play.
- Portrait draws far less than landscape (median 42 vs 162) because the rotated camera sees a
  narrower slice of the map. An unplanned second benefit of ADR-110.
- Gate instead of optimisation: `browser.mjs` now runs two minutes of real match per orientation,
  samples draw calls each second, and fails above **600** — roughly double the measured peak. The
  point is that a future effect which blows the budget has to be a decision someone notices, not a
  quiet slide.
- The honest lesson: a stress test tells you what the renderer does under load; it does not tell
  you what the game does. Both are worth measuring, but only one of them is a budget.

## ADR-115: Four things measured, none of them changed

- Date: 2026-08-03
- Status: accepted
- Decision: record these numbers and take **no action** on any of them. They were each investigated
  as a suspected defect and each came back clean or unprovable. Written down so the next agent does
  not re-derive them.
- **Income composition** (12 matches, mirrored). At 10 minutes an average champion has earned
  ~4025 gold: passive **48%**, kills **25%**, assists **17%**, last-hitting **10%**. The first
  reading of this said "82% passive" — that was wrong, it left kill and assist gold out. Farming
  being a tenth of income looks alarming against a desktop MOBA, but this is a 3v3 one-lane phone
  game with six-minion waves; fighting carrying 42% is a defensible shape, not a fault.
- **Last-hit reachability.** 6080 minion deaths: **43% die to champions**, 49% to other minions,
  6% to towers. The gold-on-last-hit rule is live and reachable, so the low CS count (20 by ten
  minutes) is wave size, not a broken mechanic.
- **Do early leads convert?** Across 72 mirrored matches, first blood predicts the winner **43%**,
  first tower **58%**, a five-minute gold lead **60%**. On a desktop MOBA those would read as a
  flat economy. **But this is bot-versus-bot**, and these bots do not press an advantage — the
  measurement cannot separate "leads don't convert" from "bots don't convert them". Changing the
  economy on this evidence would repeat the ADR-098 mistake of tuning against the wrong signal.
  Left alone, deliberately, until a human's leads can be watched.
- **Health-bar readability in a portrait fight.** A captured six-champion pile looked cluttered.
  Measured properly in landscape: bars overlap **5%** of their own area — low. The portrait
  measurement was invalid (the probe offset along world x, which under the rotated camera points
  into the screen, not across it) and the screenshot shows the bars billboarding correctly. No
  defect that a measurement supports; the clutter is six champions standing in two metres.
- The point of writing up four non-findings: each one was a plausible-sounding change that would
  have shipped on a screenshot or a single statistic. Three of the four had a measurement that
  contradicted the hunch, and the fourth had a measurement that could not support it either way.

## ADR-116: The smallest real phone had never been opened

- Date: 2026-08-03
- Status: accepted
- Decision: the MOBA is checked at **320×568 and 568×320** (iPhone SE) as well as the two sizes
  already covered, and the HUD narrows its own contents rather than only moving them.
- Reason: the suite tested 1280×640 and 430×860. An SE is neither, and it is the size where
  "everything is pinned to an edge" stops working. Opening it found three faults in one pass:
  - portrait 320 — `.moba-panel` is intrinsically **337 px** wide because `.moba-stats` is
    `white-space: nowrap`. Centred, it hangs 8 px off **both** edges, so the player cannot see the
    ends of their own health bar.
  - landscape 568 — the panel and the skill buttons **overlap 194×60**: the buttons you press sit
    on top of the health you need to read.
  - landscape 568 — the lane overview and the scoreboard overlap 100×26.
- All three are the same shape as the two defects that reached Penny before: not a wrong value, a
  layout that only works above some width nobody had checked.
- The fix narrows content (bar widths, portrait tile, board columns, wrapped stats) instead of
  shuffling positions, because at 568 px there is no arrangement of the full-size pieces that
  fits. Buttons stay at or above 44 px — that rule is not negotiable against layout pressure.
- One thing the first fix got wrong: the new media block was written **above** the base rules, so
  `.moba-lane` and `.moba-attack` overrode it and two of the three overlaps survived at reduced
  size. Moved to the end of the file. Measured again after: zero overlaps, nothing off-screen,
  nothing under 44 px, at both sizes.
- Also: Chinese has no word boundaries for line breaking, so the wrapped stats broke 「補刀」into
  「補 / 刀」. `word-break: keep-all` holds words together.
- Gate: a **layout-only** pass at both SE sizes. The two existing viewports still run everything —
  full match, FX, shop, draw-call budget — but all three faults here were geometry, so the new
  pass boots, measures, and closes. Full coverage of the size at a fraction of the cost.

## ADR-117: Every skillshot in the game had never once hit anything

- Date: 2026-08-03
- Status: accepted
- Decision: all projectile motion now lives in `#tickProjectiles`. The homing loop skips
  `p.skill`, and the straight-line loop moved in beside it and now tests a **swept segment**
  rather than the arrival point.
- Reason, in the order it was found:
  1. The straight-line loop advanced the projectile a full tick and then measured distance from
     the **new point**. One sample per tick. Longshot's ultimate moves 2.0 m per tick while a
     minion's hit radius is `width 1.4 + r 0.62 = 2.02` — a 0.02 m margin, so anything sitting
     between two samples and slightly off-centre is passed straight through.
  2. Writing the test for that exposed something far worse. The straight-line loop lived inside
     `#tickZones`, while `#tickProjectiles` iterated **every** projectile and killed any whose
     `targetId` did not resolve to a live entity. Skillshots have no `targetId`. So every
     skillshot was destroyed on the tick it was cast, and the code that would have moved it had
     **never executed once**.
- Measured before the fix: 穿甲箭 fired at an enemy eight metres away in a clear line, over a
  full second — target HP 565 → 565. All four skillshots (穿甲箭, 致命一箭, 火花, 聖光) dealt
  exactly zero. After: 172 / 422 / 160 / 130.
- Why no test caught it: T8 asks whether *any* of a champion's four abilities deals damage. Every
  skillshot champion also has a working dash, aoe or self ability, so T8 stayed green while a
  quarter of the game's abilities did nothing. A test that asks "does at least one work" cannot
  find "this whole class never works".
- The structural cause is worth naming: two halves of one job in two files' worth of distance
  apart, with no statement of which owned what. The homing loop's "no target means delete" was
  correct **for the projectiles it was written for** and catastrophic for the ones it inherited.
  Both now sit in one function that says at the top which kind is which.
- Effect on play, three 24-match mirrored sets: nexus finishes 69/72 → **71/72**, average match
  **15.4 → 11.4 min**, kills 30 → 27, blue 35/72 → 39/72 (0.7σ from even). Shorter because the
  mirror lineup holds three of the game's four skillshots, and they now work. 11.4 minutes is a
  reasonable length for a 3v3 phone MOBA, so nothing was re-tuned on top — re-balancing in the
  same change as a bug fix would blend the two beyond telling apart.
- Follow-up sweep, same session: with skillshots fixed, **every one of the 24 abilities now
  delivers what its data declares** — damage, heal, shield, stun, root, slow, buff, displacement.
  Two more looked broken at first and both were the probe, not the game: 庇護 is `allyTarget` and
  was being cast at an enemy, and 黎明's `apRatio` scales its heal, not damage. Neither was
  reported until the probe was corrected and re-run.
- That sweep is now T30, driven from `champions.js` rather than from a list of ability names, so
  a new ability is covered the day it is added. It was mutation-tested before being trusted:
  disabling shields, stuns and slows in turn each made it fail and name the exact abilities
  affected (3, 1 and 3 of them). A gate nobody has watched fail is not yet a gate.
- Gates: T28 rebuilds the tunnelling geometry exactly (target midway between samples, 1.9 m off a
  2.02 m capsule) and requires a hit. T29 fires **every** skillshot in the game at an enemy in its
  path and requires damage from each — a rule about the class, not about the ability that happened
  to be broken today.

## ADR-118: Two smoothings ran faster on a phone than on a desktop

- Date: 2026-08-03
- Status: accepted
- Decision: champion turning and camera follow use `1 - exp(-rate * dt)` instead of
  `Math.min(1, dt * rate)`.
- Reason: `dt * rate` is the first-order approximation of an exponential approach, and it is only
  accurate while `dt` is small — which is the desktop case, not the phone case. At rate 4, one
  second of catch-up leaves **1.59% of the distance at 60 fps but 1.36% at 30 fps**: the same
  match has a different camera lag and a different turn speed depending on the device. The exact
  form leaves 1.83% at both, by construction.
- Small in isolation; recorded because the shape recurs. Any `x += (target - x) * dt * k` carries
  it, and the correction is local and free.
- Scope checked, not assumed: these were the only two in `view.js`, `fx.js` and `rig.js`. The
  camera shake is a linear decay, which is already frame-rate independent and was left alone.
- Also examined and **not** changed, because measurement did not support a change:
  - damage numbers are world-space sprites, so they are larger in portrait — but so is everything
    else, since the portrait camera is closer. The composition is unchanged; there is no defect.
  - dash contact resolution uses the same one-sample-per-tick test that broke skillshots, but a
    dash steps 0.87 m against a 2.02 m contact radius. The miss band is 0.04 m wide out of 2.02.
  - unit separation already clamps to the bridge; zone ticks use a fixed interval and cannot be
    outrun by any unit or dash speed in the game.

## ADR-119: The recall button sat on top of the shop button for the whole match

- Date: 2026-08-03
- Status: accepted
- Decision: the bottom-right stack (skills, shop, recall) is spaced 52 px per layer, since every
  layer is 44 px tall. The lane overview is `min(560px, 100vw - 340px)` so it cannot reach the
  scoreboard at mid widths.
- Reason: `.moba-recall` and `.moba-shopbtn` were 30 px apart while both are 44 px tall, so recall's
  lower **12 px (portrait) / 14 px (landscape) overlapped the shop button** — and the shop button
  is later in the DOM, so taps in that band went to the shop. This was true in **both orientations
  for the entire match**, not an edge case.
- Why nothing caught it: every layout gate measured the frame right after the match starts, and in
  that frame the champion is standing in the fountain — where `recallBtn` is hidden — with no gold,
  so the shop button is still the short "商店" rather than "商店 · 可買 …". **The gate was
  measuring a screen the player only sees for the first few seconds.** The fix that matters here
  is not the CSS: the layout gates now place the champion out of the fountain with gold in hand
  before measuring anything.
- Found by a genuinely new axis: rotating the device mid-match. The rotation itself came through
  clean — `camYaw` flips, the joystick still drives toward the enemy base, the lane bar re-orients,
  zero console errors — but standing in a real mid-match state to test it is what exposed the
  overlap that had always been there.
- Also fixed: at 860 px wide the lane overview is 560 px centred, reaching x 710, while the
  scoreboard starts at 700. 1280 and 430 both miss it, so `860×430` is now a third layout size.
- Verified the gate fails for the right reason before trusting it: against the old CSS it reports
  `moba-recall × moba-shopbtn (54×12)`, `(54×14)` and `moba-lane × moba-board (12×26)` — the exact
  three defects, at the exact sizes.

## ADR-120: A lost GPU context wrote off the whole match

- Date: 2026-08-03
- Status: accepted
- Decision: `webglcontextrestored` resumes the match. `View` gained an `onContextRestored`
  callback; `main.js` clears the accumulator, resets `last` and sets `running` back to true.
- Reason: the browser takes the WebGL context back on lock-screen, on a spell in the background,
  and under memory pressure — then hands it back, typically within a second. The old handler
  stopped the loop and told the player **"顯示裝置重置咗，請重新開一局"**. Measured: after
  `restoreContext()` the flag correctly cleared, and the match stayed frozen at 5.8 s forever. A
  match in progress was written off because a phone locked for a moment.
- three.js re-uploads geometries and textures itself after a restore, so resuming is enough —
  confirmed, not assumed: after the fix the sim advances (6.4 → 8.0 s) **and the renderer issues
  42 draw calls**, with zero console errors. Checking that time advances would not have been
  enough; a frozen picture with a ticking clock is still broken.
- `state.last` is reset on resume so the first frame does not charge the whole pause as `dt`.
- Two neighbouring states were checked in the same pass and needed **no change**:
  - a long stall (CPU throttled 20×) advanced the sim 3.2 s over 5.5 s of wall clock with no
    teleport, freeze or error — the `min(0.25, dt)` clamp and the six-step cap degrade gracefully,
    which is what they are for.
  - switching quality low → high → medium mid-match threw nothing and left state intact.
- Gate: lose the context, require the game to pause; restore it, require the flag to clear, the
  sim to advance, **and draw calls to be issued**. Verified to fail on the old code for the right
  reason: `場波行返: false, 畫返嘢: false, 由 1.6 到 1.6`.

## ADR-121: The audio chain was already correct, and is now pinned

- Date: 2026-08-03
- Status: accepted
- Decision: no code change. Three properties of the audio path are now gated, because all three
  currently hold **by side effect** rather than by anything that states them.
- Measured: no `AudioContext` exists before the first gesture (so no autoplay violation); it is
  `running` immediately after the first tap; and after being forced to `suspended` it returns to
  `running` within about three seconds of ordinary play.
- The third one deserves the gate most. It works because every sound-playing function calls
  `#ensure()`, which happens to `resume()` a suspended context. Nothing says that is the contract.
  A refactor that hoisted `#ensure()` out of the play path would break it, and the symptom would
  be **the game going silent with no error at all** — invisible to every existing check.
- Two probe errors were caught before reporting, which is the point worth recording:
  - the first run measured the context two seconds into a fresh match and saw it stay suspended.
    There had simply been **no sound events** — no minions had spawned and nobody was fighting.
  - the second drained `sim` events inside the probe to force some, which **stole them from the
    real frame loop** that feeds `sfx.consume`. The fix was to stop draining, place a reachable
    target, and let the real loop run.
  Reported either way, this would have been a fabricated iOS audio bug with a plausible story
  attached. The rule that keeps holding: a failing measurement is a claim about the probe until
  the probe has been checked.

## ADR-122: One dropped asset ended the session

- Date: 2026-08-03
- Status: accepted
- Decision: each GLB load retries three times with a 300/600 ms backoff, and if it still fails the
  loading screen offers a **再試一次** button instead of a dead end.
- Reason: twelve models load through one `Promise.all` with no retry. Measured by aborting a single
  request: the screen reads **"載入失敗：Failed to fetch"** and stays there. Nothing else happens —
  no retry, no button, and the only way out is for the player to think of reloading the page
  themselves. On a phone with a patchy connection, one dropped fetch out of twelve ends the
  session before the game has started.
- After: a single transient failure is absorbed and the game reaches champion select normally.
  Five consecutive failures still fail — correctly, because pretending otherwise would show a
  world with a missing model — but now with a 126×48 button that reloads.
- Gate: abort one asset once and require champion select; abort it repeatedly and require the
  retry button to exist and to be at least 44 px.
- A third probe-reading error this session, recorded because the pattern is consistent. The first
  run of this probe reported `甩咗 0 次` — the interception never matched, because I had guessed
  the model filename (`swordsman.glb`) instead of reading `CHAMPION_MODELS` (`knight.glb`). The
  second run printed four lines per case and I misread which case a line belonged to, briefly
  believing the retry button appeared on a **successful** load — which would have contradicted the
  code. Printing one object per case settled it. Each of the three errors this session was in
  reading the measurement, not in the game; each was caught by re-measuring rather than by
  reasoning about the result.

## ADR-123: Three stacked states, all clean, and deliberately not gated

- Date: 2026-08-03
- Status: accepted
- Decision: no code change and **no new gates**. Recorded so the next agent does not spend the
  round re-deriving it.
- Two of the six finds this session came from stacking two states (rotate *while* away from the
  fountain; lose the context *while* mid-match), so the remaining three combinations were checked:
  - **recall interrupted by damage.** Channel starts, bar shows, button lights; taking a hit
    cancels it in the sim, and the bar hides and the button un-lights in the same breath.
  - **rotating the device while dead.** The death overlay stays up and fits the new viewport
    (860×430 exactly), `camYaw` flips correctly, and respawning clears the overlay.
  - **losing the GPU context with the shop open.** The shop stays open across the loss, and after
    the restore an item can still be bought (0 → 1 items).
- Zero console errors in all three.
- Why no gates, when the audio check in ADR-121 did get one: audio held only as a **side effect**
  of `#ensure()` sitting inside the play path — nothing declared it, and losing it would be silent.
  These three hold **by construction**: the HUD reads sim state every frame, the overlay is CSS in
  normal flow, and the shop is DOM the renderer never touches. Gating them would add suite time to
  protect invariants no plausible refactor threatens. A gate earns its runtime by guarding
  something fragile, not merely something true.

## ADR-124: The other five HUD elements no gate had ever seen

- Date: 2026-08-03
- Status: accepted
- Decision: three layout fixes, and the layout gate now forces normally-hidden HUD visible before
  measuring.
- Method, and the reason this round is different from the seven before it: instead of picking
  another untested state, the **shape** of ADR-119 was turned into a search. That bug existed
  because the recall button is hidden at the fountain, so no gate had ever seen it on screen. So:
  which other elements are hidden by default? `hud.js` toggles `hidden` on six things. Five had
  never been measured visible. Four of the six sizes × states combinations came back dirty.
- What it found:
  - **the settings panel is 341 px tall and does not fit a 568×320 phone.** Centred, its top lands
    at y = −10 — and the × that closes it is at the top. Opening settings on a small landscape
    phone was a trap with no way out. Now `max-height: calc(100vh - 20px)` with scrolling; the
    controls inside already use `armTap`, so the scroll container cannot eat their taps (ADR-107).
  - **`flash()` stacked.** Every message is appended at the same fixed spot and lives 1.6 s, so two
    within that window render on top of each other. ADR-120 made this reachable in normal play:
    losing the context prints one message and restoring prints another about a second later. It
    now replaces rather than stacks.
  - the toast sat at `bottom: 24%` while the bottom HUD is positioned in fixed pixels, so on short
    screens the two converged — it hit the cast banner, the HP panel and the shop button depending
    on size. Moved above the cast banner at 38% with a width cap: one change, no size-specific
    rules, all 24 size × state combinations clean.
- Not a defect, though the first pass flagged it: `moba-tip` overlapping buttons. It is
  `pointer-events: none` and only visible while a skill button is held. The probe was classifying
  a popup as a panel; the tooltip and the full-screen overlays are now excluded.
- Gate: each layout size additionally channels a recall, shows a cast banner plus a toast, and
  opens the settings panel, re-running the same geometry check on each. Confirmed to fail on the
  old CSS with the exact three defects.
- One more correction, after the gate first shipped: it flagged the cast banner grazing the toast
  by 8 px at two sizes, which a standalone probe had called clean. The difference was **when**
  each sampled — `castpop` travels 24 px upward over 0.85 s, so whether the boxes touch depends
  on the frame you measure. A check whose answer moves with sampling time is not a check. Both
  are `pointer-events: none` decorations that fade inside a second, so they are now excluded
  from mutual overlap alongside the tooltip. The line is deliberate rather than convenient:
  this gate exists for "a finger must be able to hit it" and "information must stay readable".
  The toast against solid things — the HP panel, the shop button — is still checked, and those
  were the real defects.

## ADR-125: The buy rule was written three times, agreeing only by luck

- Date: 2026-08-03
- Status: accepted
- Decision: `sim.buyBlocker(champ, itemId)` is the single owner of "may this be bought", and
  returns a reason code or `null`. `sim.buy` refuses when it returns a reason; the HUD asks it
  for the refusal message and for the card colour. Reason codes, not sentences — the rule
  belongs to the sim, the wording belongs to the HUD.
- Method: this round searched for the **second** defect shape rather than another untested
  state. ADR-117 was "two halves of one job in two places, with nothing saying which owns
  what". Every collection in `sim` now drains in exactly one place, so the search moved to the
  other flavour: the same *decision* derived more than once.
- Found three copies of the buy rule, and they were not even the same expression:
  - `sim.buy`: refuse when `!canShop(c)`
  - `hud.#cannotBuy`: refuse when `!alive && !canShop(p)`
  - the shop card colouring: a third derivation of afford / poor / full
  They agreed **only because `canShop` returns `!!c`** — a constant. Nothing stated that, and
  ADR-104 had already changed that function once.
- Why it matters concretely: the day `canShop` gains real content, the HUD lights a card and
  offers no reason while `sim.buy` silently returns false. That is exactly the symptom that
  reached Penny twice — ADR-106 and ADR-107 were both "the card looks buyable and tapping does
  nothing". This was the same failure waiting behind a constant.
- Gate T31 pins the contract itself rather than any one rule: across every item × six player
  states, `buyBlocker(...) === null` must hold exactly when `buy(...)` succeeds, and the bag
  must change only when it succeeds.
- Both directions were checked before trusting it:
  - making `canShop` meaningful (`c.alive`) keeps the suite green — the new design absorbs the
    change that would have split the old one.
  - reintroducing a private copy inside `buy`, with `<=` instead of `<`, fails the gate and
    names the case: **`長劍/啱啱夠: blocker=null 但 buy=false`**. That is the "I have exactly
    400 gold and the button does nothing" bug, caught at the boundary.

## ADR-126: The combat gate warmed the sim for 25 seconds without the view

- Date: 2026-08-04
- Status: accepted
- Decision: the browser suite's combat fixture advances **both** layers during its warm-up
  (`s.step` every tick, `v.update` every third tick, exactly as `main.js` batches events on a
  slow machine). Nothing that measures the view may hold the view still.
- Method: this round searched for ADR-124's shape — "a check whose answer moves with sampling
  time" — and audited `tests/browser.mjs` for values that were computed but never asserted.
  Two existed. `buff.mid` passed at 0.98. `animating: u.rig.busy` failed.
- Chasing that one failure produced **three** defects in the fixture, all from one root: the
  warm-up ran 750 sim ticks with no view frame in between.
  - the 25 seconds of events arrived in one batch, so "how many effects did this attack draw"
    was counting the backlog — the gate had been **green for the wrong reason**;
  - the chosen minion could be down to a few hit points, and an ally's arrow landed earlier in
    the same tick, so the target died and the attack was correctly cancelled. The gate was
    measuring a corpse;
  - the player had died and respawned during the warm-up. The view's last memory of it was
    "dead", so its next frame ran `revive()` — which zeroes `lockUntil` — in `#syncUnits`,
    immediately after `#consumeEvents` had started the swing. Measured, not inferred: a spy on
    the rig reported `{once: 1, revive: 1, 前wasAlive: false}`.
- The game itself was never wrong here. In real play the view runs every frame, so a respawn
  and a swing cannot share one frame. Three separate patches would each have hidden one
  symptom; advancing both layers removes the cause and all three at once.
- Four wrong readings preceded the answer, and each was overturned by measuring again rather
  than by reasoning about the contradiction. The low-hit-point theory was **refuted** by a probe
  (the player still swung, and took the kill) before the real cause — an ally landing the kill
  first — showed up in the suite's own diagnostics. A failed measurement, before the probe
  itself has been checked, is only an accusation against the probe.
- The gate was checked in the failing direction: deleting the `rig.once(...)` call in the
  `attack` handler fails exactly the two `swinging` checks and nothing else.
- That mutation run also exposed a **pre-existing flake** of the same shape: with no skillshot
  on the champion, the projectile check hoped an archer would fire inside a 1.3-second window.
  It now hands a ranged minion a target in range, so an arrow is certain.
- Layout, same round: `.moba-flash` at `bottom: 38%` is 216 px on a 568-tall iPhone SE, which
  lands inside the recall button's band (210–254) — a 29×32 overlap. The percentage-versus-pixel
  collision ADR-124 named had simply moved to the next element. Rather than retune a third
  percentage, `--hud-floor` now states the top of the bottom-right button stack once, and both
  floating centre elements sit above it via `max()`.

## ADR-127: On a 120 Hz screen the game moved at 30 Hz

- Date: 2026-08-04
- Status: accepted
- Decision: `src/pace.js` owns the fixed-timestep rule and answers three questions at once —
  how many ticks this frame runs, how much time is left over, and the alpha the view renders
  at. The view interpolates unit and projectile positions between the previous tick and the
  current one; `view.beforeStep()` takes the snapshot, so whoever renders the interpolation
  also owns the data it needs.
- Method: ADR-126 was a fixture that advanced one layer while holding the other still. That
  shape was then aimed at production code: where does the game advance one layer without the
  other? The main loop is where the two meet.
- Measured on the real page, driving the loop by hand because this environment renders in
  software and cannot reach the frame rates in question:
  - at 120 fps only **25.2%** of frames changed a walking champion's on-screen position, in
    jumps of **0.217 m** — a 120 Hz phone was being shown 30 Hz motion;
  - at 60 fps, 50.4%. At 30 fps, 70.6% — there one frame is one tick, so nothing is wrong.
  After interpolation: **97.5%** at 120 fps with a largest step of **0.054 m**, and 100% at 60.
- Two limits in the old loop disagreed without either knowing: `dt` was clamped to 0.25 s while
  six ticks only consume 0.2 s, so every maximally-stalled frame silently re-queued 0.05 s into
  `acc` — a pool nothing ever capped. The clamp's whole purpose was "this time is not repaid".
  Measured consequence: after a 3-second stall the old loop ran **three consecutive frames of
  six ticks** — 0.6 s of match in 50 ms, a visible fast-forward. `MAX_FRAME` is now derived as
  `MAX_STEPS * TICK`, so the two cannot drift apart, and the leftover is capped explicitly.
- Interpolation is backward, not predictive: the view renders between the last two ticks, which
  costs one tick (33 ms) of latency and is smooth at every frame rate. Extrapolation avoids the
  latency but snaps when it guesses a turn wrong, and a MOBA champion turns constantly.
- A move over 3 m in one tick is a teleport (blink, respawn), not walking, and snaps. Sliding a
  blink across the map at 30× would be worse than the stutter it replaces.
- Gates: T32 in `sim.mjs` pins the pacing rule headlessly — game time tracks wall time when
  frames are smooth, `alpha` stays in [0, 1), the leftover pool never exceeds one tick, a
  3-second stall is followed by **no frame above one tick**, and a 30-second background gap
  drops its time instead of repaying it. `browser.mjs` measures the on-screen smoothness at
  120/60/30 fps on the real view.
- The failing direction is the pre-change measurement itself: the same probe, on the same page,
  against the same view, read 0.252 before the change and the gate demands 0.9. The 30 fps row
  is deliberately held to a weaker bar — at the sim rate there is nothing between two ticks to
  interpolate, and asking for smoothness there is asking the wrong question.

## ADR-128: The overlap gate excused the one panel players actually read

- Date: 2026-08-04
- Status: accepted
- Decision: the layout gate's exemption list is drawn on **decoration versus information**,
  not on `pointer-events: none`. `.moba-tip` — the ability description — is checked like any
  solid element; `.moba-cast` and `.moba-goldpop` remain exempt because they are transient,
  non-interactive flourishes.
- Method: ADR-127's shape was "two numbers that must agree, written independently". The first
  place to look was the change I had just made: `--hud-floor: 202px` was hand-computed from
  `.moba-recall`'s `150px + 44 + 8` with nothing tying them together. It is now derived from
  `--recall-bottom` and `--touch`, so moving the button moves the floor. I introduced that
  defect in the same round that named the shape.
- Auditing the rest of the stack led to the exemption list, and the exemption turned out to be
  hiding real collisions. Measured with everything on screen at once — recall channelling,
  cast banner, toast, and the description open:
  - landscape 1280×640: `.moba-tip` × `.moba-recall` **54×44**, × `.moba-shopbtn` 68×6
  - portrait 430×860: × `.moba-recallbar` **206×20** — the description reduced to its title
  - landscape 568×320: × recall 54×44, × shop 68×6, × scoreboard 118×7
  Three of four tested sizes. The gate could not see any of it.
- The fix is positional, not a new magic number: the description moved out of the right-hand
  button column into the centre-bottom row, which is now an explicit order — toast at
  `--hud-floor`, description at `--centre-2` above it. On 568-tall screens the description
  itself is trimmed (smaller type, tighter padding: 95 px → 77 px), because the band between
  the scoreboard and the floor is 126 px and the two do not both fit at full size. Short
  landscape (320 tall) has no room above the floor at all, so there the description centres
  vertically in the free band between scoreboard and recall bar. All four sizes measure clean.
- **A production bug fell out of the gate change.** Driving the description from a synthetic
  `pointerdown` raised `NotFoundError` from `setPointerCapture`, and the skill-button handler
  called it *before* recording the aim state. A throw there skips the state, and `pointerup`
  begins with "no state, do nothing" — so the ability never fires. `?.` guards a missing
  method, not a throwing one. On a phone this is reachable: a system gesture can cancel a
  pointer between dispatch and handler. State is now recorded first and the capture is
  attempted in a `try`.
- Both directions measured on the real page: with the guard, cooldown 6.6 s and mana 280 → 260,
  console clean. Without it, cooldown 0, mana unchanged, ability **never cast**, console error.
  That is the same silent failure as ADR-106/107 — "I keep pressing and nothing happens" —
  reached this time through a third route, and now gated end to end at every layout size.

## ADR-129: The first screen of the game had never been measured

- Date: 2026-08-04
- Status: accepted
- Decision: the champion-select and post-match screens are gated at every layout size, and on
  screens under 480 px tall the champion cards are compacted so at least one whole card is
  always visible.
- Method: two clean negatives first, both recorded so nobody re-derives them —
  `.hidden` is `display: none !important` and every `opacity: 0` element also sets
  `pointer-events: none`, so no invisible element can eat a tap; and `toggleShop` /
  `toggleSettings` close each other by construction, so the "panel with no exit" of ADR-124
  cannot recur through that pair.
- Then the surface nothing had ever looked at: **every layout gate begins after `#pick-go` is
  clicked**. The screen the player sees first had no coverage at all.
- **I misread the first measurement and have to say so.** Champion cards laid out below the
  fold (the last one at y1234 in a 568-tall viewport) looked like "four of six champions
  cannot be chosen". `#pick-grid` is `overflow-y: auto`; the cards were scrolled out, not
  lost. Scrolling to the bottom puts the last card on screen and its centre hit-tests to
  itself. That was the fifth probe misreading this session, and the same lesson each time: a
  failed measurement is an accusation against the probe until the probe has been checked.
- The real defect, once measured properly: on short screens the grid's **visible height is
  smaller than one card** — 78 px against 228 px at 568×320, 178 px against 258 px at 860×430.
  Zero complete cards at either size; choosing a champion meant reading through a slot.
- Cause: `#pick-grid` carries `max-height: 74vh`, but `#select` is a flex column, so flex
  shrink settles the height first and that maximum never binds. A limit that never applies is
  indistinguishable from one that is wrong.
- Fix compacts the card on `max-height: 480px` rather than moving anything: the passive text
  (the tallest block) is dropped, the portrait goes 78 → 38 px, and the heading and start button
  give back height. Under 400 px tall the keyboard-controls hint is hidden outright — it costs
  28 px and is useless on a 320 px-tall touch device, whereas trimming the card further would
  have started removing ability names, turning "pick a champion" into "pick a name".
- The count moves with scroll position: at the bottom the last row sits flush with the grid edge
  and looks better than the top does. My probe counted after scrolling and reported 2 where the
  gate, counting at rest, reported 0 — the ADR-124 shape again, this time flattering me. The
  invariant is fixed at the unscrolled top, because that is what the player sees first.
  Measured there afterwards: 2 whole cards at 568×320, 4 at 860×430, 1 at 320×568, 4 at 430×860.
- Gates now assert, at every size: at least one whole card visible, the last card reachable
  after scrolling to the bottom, the start button ≥44 px and hit-testing to itself, no
  horizontal overflow, and — after the match — that **再嚟一場** is on screen and hit-testable.
  The post-match screen previously had its rows counted but its only exit never checked.

## ADR-130: Gold that sits in the bank, and champions that were never in the same match

- Date: 2026-08-04
- Status: accepted
- Method: ADR-129's shape was "a limit that never binds". Applied to the sim: every clamp has
  two sides, and whichever never wins is dead. Twelve matches, sampled every tick.
  - `TOWER.rampMax` binds 2307 times, the 8-stack cap 23356 times — both load-bearing.
  - the shutdown cap of 420 gold **never binds**; the highest raw value reached is 360. Left
    alone: a safety rail that never fires in normal play is doing its job.
- Then the same question about the economy, which is where it paid. Sampling every second
  across twelve matches: **74.4% of match time a champion holds enough gold to buy something
  (average 1122) while the build list refuses to let them buy anything**, and 880 gold is
  carried on average across the whole match. A full build costs 8502 on average; a champion
  earns 4191 in a match and the best of 72 earned 7654, so **0/72 could ever complete one**.
  The rule "save for the big item rather than pile up junk" was sound, but it assumed the
  saving ends in a purchase. Measured, the match ends first.
- `nextPurchase` now scans past an unaffordable entry to the next affordable one **within the
  champion's own build**. The final set of items is unchanged; only the order adapts to what
  is affordable, so nothing turns into junk. Idle-gold time 74.4% → 64.0%, average gold
  carried 880 → 577.
- A first reading of "matches got 28% shorter" was **small-sample noise**: over 12 seeds 8.6 →
  6.2 minutes, but over 40 seeds the medians are 7.7 (before) and 7.9 (after).
- The second finding came from checking whether that change had broken fairness. It had not —
  but the check itself failed: **blue won 40 out of 40**. Isolating it:
  - mirrored lineups: 22/18 and 17/23 — side, map and update order are fair (ADR-113 holds);
  - the default lineup: blue 40/40, and swapping the two trios left-to-right gives red 40/40.
  So it is a **composition** imbalance, not a side one. Measured per champion against a common
  baseline, 24 matches each with sides alternated: longshot 83%, dawnkeeper 83%, ironward 50%
  (the baseline, confirming the harness is fair), emberwake 42%, ironhulk 25%, duskblade 17%.
  Win rate tracked attack **range** almost perfectly, and melee move speed (6.5–6.9) was barely
  above ranged (6.3–6.6) — the melee champions could not reach anyone.
- Note before acting on it: `Sim`'s default lineup is a **test fixture**. Real matches shuffle
  the five AI champions (`main.js`), so no player ever sees that 40/40 matchup. The spread
  itself is what reaches players: with a 66-point range, the shuffle decides many matches
  before they start.
- One measured pass, each change tied to the mechanism rather than to the number it moves:
  melee speed 6.5/6.9/6.5 → 7.1/7.4/7.1 so melee can close; longshot range 10.4 → 9.6, which
  was far above the next-longest 9.5; dawnkeeper armour 30/3.9 → 22/3.1, since an 8.5-range
  support had tank-grade effective HP; duskblade's only mobility 8 s → 5 s cooldown — it had
  the highest ability damage in the game and the lowest win rate, so it was not failing to
  hurt, it was failing to get back out. Spread **66 → 46 points**; duskblade 17% → 29%,
  longshot 83% → 54%.
- Tuning stopped there deliberately. At 24 matches the 95% interval is roughly ±17 points, so
  29 and 75 are distinguishable but 46 and 54 are not. Re-running at 8 matches moved the
  baseline champion itself from 46% to 63% — proof that further tuning would be tuning noise.
- `games/moba/tests/balance.mjs` records the measurement and is **deliberately not in the fast
  suite**: 48 matches take 126 s, and win rate has no shortcut — a table of stats cannot
  predict it. It refuses to pass judgement below 24 matches, and flags any champion outside
  20–85%. T13 stays as the fast check, but "both sides have won" and "both sides had a game"
  are different claims, and only the slow one can tell them apart.
- One of my own gates had to be dismantled in the same round. The 30 fps row of the smoothness
  check asserted `moved > 0.7`, a number taken from a single observation (0.798). Raising a
  champion's move speed dropped it to 0.664 — a change with nothing to do with smoothness. At the
  sim rate one frame *is* one tick, so whether the position changes is decided by beat alignment,
  not by rendering; the row is a baseline observation and now asserts only that interpolation did
  not lose distance. I had written that reasoning into the comment and then invented a threshold
  underneath it anyway.

## ADR-131: The yardstick was one of the things being tuned

- Date: 2026-08-04
- Status: accepted
- Decision: `tests/balance.mjs` states in its header that the baseline champion and the two
  companions **are the measuring stick**. Changing any of their numbers invalidates comparison
  between runs, even though each run's spread remains internally valid.
- Continuing ADR-130: dawnkeeper was the last outlier at 75%. Its Q reaches **12 m** — further
  than every champion's attack range, longshot included at 9.6 — pierces, damages enemies and
  heals allies on the same 7-second button. Two jobs from outside everyone else's reach.
  Range 12 → 9.5, matching the next-longest ability. Measured: dawnkeeper 75% → 63%, spread
  **46 → 34 points**, and the other five rows came back digit-for-digit identical, which is
  what a correctly isolated change looks like.
- Then a diagnostic before touching the low end: melee champions are not failing to use their
  kits, they are dying on the way in. Deaths per match — duskblade **9.6**, ironhulk 5.9,
  against 1.3–4.3 for the ranged three; duskblade takes 2.3 kills, ironhulk 0.8.
- So armour went up on both melee (duskblade 28→34, ironhulk 31→36), armour being the stat
  that governs surviving the approach. It made the game **less** even: spread 34 → 66,
  duskblade 29% → 17%. Reverted.
- The reason is the finding worth keeping. **ironhulk is one of the two companions**, so
  buffing it changed both teams in every match — the yardstick moved. The champion that
  shifted most was dawnkeeper (63% → 83%), which I had not touched at all: a melee-heavier
  game makes healing worth more. The same flaw quietly affected ADR-130's pass, which changed
  the baseline and both companions, so **"66 → 46" is not a clean before/after** — each number
  is a valid snapshot of its own configuration, but the two were not measured against the
  same stick.
- The revert was verified at the byte level rather than by re-running: after undoing the two
  armour lines, `git diff` against HEAD contains only the dawnkeeper hunk, so the tree is
  exactly the state that produced the 34-point measurement, and the sim is deterministic.
- Tuning stops here. The remaining spread is 34 points against a ±17-point interval, which is
  about one interval — the next honest step is a bigger sample, not another change.

## ADR-132: The combat gate measured a champion standing in its own fountain

- Date: 2026-08-04
- Status: accepted
- Decision: the combat fixture places the champion **after** the warm-up, not before, and the
  gate asserts that at the moment of measurement it is not standing in a fountain.
- Method: ADR-131's shape — a measurement that depends on something the measurement itself
  changes — pointed at the test suite. Sixty-odd gates run in sequence on one page; some reset
  the player and some do not, with nothing saying which owns what (ADR-117 again). So the
  question became: does any gate's verdict rest on state an earlier gate left behind?
- Instrumented rather than reasoned about. The combat gate says it stands the champion at
  **x = -6**; measured at the moment of the attack it is at **x = -62**, 56 m away, at both
  layout sizes. Clearing the standing attack order left by the earlier keyboard gate did not
  move the number: the champion **dies during the 25-second warm-up and respawns at its own
  fountain**, which ADR-126 had already recorded as a fact about that warm-up without anyone
  noticing it also relocated the fixture.
- So every swing, every hit spark and every projectile in that gate was being measured inside
  the fountain — the exact state ADR-119 singled out as unrepresentative (regeneration on, no
  enemies nearby, recall button hidden). The gate was green and had been green for the wrong
  reason a third time, in the same block that ADR-126 had already corrected twice.
- The fix is ordering, not another patch: the warm-up runs first to produce a live match, then
  the fixture is stated — orders cleared, position, health, level — and only then is anything
  measured. `atFountain` is asserted false at measurement time, so the claim the gate makes
  about its own state is now checked rather than assumed.
- Kept as a payload: the pre-placement position (-62) still travels with the failure output,
  because "where the champion drifted to" is the first thing worth knowing if this ever
  regresses.
- The same question was then put to the other gate that sets a state and *then lets time run*:
  the layout gate places the champion at mid-lane with gold and waits 900 ms before measuring.
  Measured at all three sizes, it holds — not in a fountain, alive, 3003 gold, still at x = 0,
  recall button visible. A clean negative, and now asserted rather than assumed, because the
  whole point of ADR-119 was that the recall/shop overlap is only visible while the recall
  button exists. Two sites of one shape: one was wrong by 56 m, one was right; neither had been
  checked.

## ADR-133: The Hub is the real first screen, and none of its controls were measured

- Date: 2026-08-04
- Status: accepted
- Decision: `tests/hub.mjs` gates touch targets at all four viewports — arrows at 44 px, the
  page dots at 24 px with centres no closer than 24 px, and every control hit-testing to
  itself. `index.html` now version-stamps `style.css`, and the bump script and cache gate
  cover it.
- Method: ADR-129 found that the champion-select screen had no coverage because every gate
  started after it. One level up, the Hub is what a player actually opens first. Its suite
  already checks four viewports for overlap, overflow and column counts — genuinely good
  coverage — but **not one touch target**, while the MOBA has gated 44 px since ADR-107.
- Measured before changing anything, all four sizes: page dots **8×8 px**, arrows 34–42 px.
  Every interactive control in the Hub was under the project's own line.
- Two different limits, each with a reason rather than a convenience. Arrows are isolated
  targets with room, so they take the project's 44 px. Four dots at 44 px each is 176 px,
  plus 88 px of arrows, which does not fit a 320 px screen — the rule is not being dodged,
  it is geometrically unavailable. The dots take WCAG 2.5.8's 24×24 instead, with a spacing
  assertion so neighbours cannot steal each other's area. The visible dot stays 8 px, drawn
  by `::before`; only the finger area grew.
- Enlarging the arrows pushed the control dock to 281 px against a 249.6 px limit at 320 px
  wide, and the existing dock gate caught it. The page counter is hidden below 380 px: four
  dots already say which group of four you are on, and a finger-reachable arrow is not
  something to trade away for a label that repeats them.
- **The change would not have reached anyone.** The Hub stamps `launcher.js?v=…` but its
  `style.css` had no token at all, so a CSS-only round — which this entire one was — would
  have shipped invisibly to any returning visitor. This is ADR-111's defect with the
  stylesheet left out. `style.css` is now stamped, `moba-bump-cache.mjs` rewrites it, and
  `cache-bust.mjs` fails when it drifts — checked in both directions.
- The verification run for this round failed on something unrelated, and the cause was **my own
  previous fix**. The framing gate projects the champion through the camera and asks whether it
  sits in the lower half of the screen. But `camFocus` chases with `approach(4, dt)`, so before
  the camera has caught up the answer is meaningless: measured over 90 frames after a
  teleport the value travels from **-33.8 to 56.7** — 90 points, against a 45–88 band — while
  *walking* it is stable (ranges of 4.4 and 9.3). ADR-132 moved the champion from x = -62 back to
  x = -6 after the warm-up, and the next gate sampled during that 56 m catch-up. The gate had
  never required the camera to settle; it had been passing on luck, and my change is what
  collected. It now advances view frames until the projected position stops moving and asserts
  that it did — five frames at both sizes, settling at 53 and 56.7.

## ADR-134: Nineteen of sixty-seven requests carried a version token

- Date: 2026-08-04
- Status: accepted
- Decision: model files and the Hub's font and logos carry the cache token; the token for
  models is read from `assets.js`'s own module URL rather than written down again; and the
  browser suite records every request the game actually makes and fails on any project-owned
  URL without a token.
- Method: ADR-133 fixed one untagged file by hand. The same shape asked systematically —
  *which files does the game actually fetch, and which of them carry a token* — is not a code
  question, so it was measured by recording requests instead of reading imports.
- Opening one match: **67 requests, 19 tagged**. Untagged were the whole of `vendor/`, the
  Draco decoder, and **all twelve `.glb` models**. The Hub added its font and two logos.
  `cache-bust.mjs` had been green throughout — it checks `src/` imports, which were never the
  part at risk.
- The models matter concretely because Penny's standing instruction is not to reuse existing 3D
  assets: models *will* be replaced, and a replacement would have reached returning players as
  new code driving an old mesh.
- `vendor/` is deliberately left alone, with the reason recorded rather than the omission: those
  files import each other by relative path, so tagging them means editing third-party source.
  The correct move for a vendor upgrade is to rename the directory (`vendor/three-r160/`),
  which changes every importing URL at once and is stronger than a query string. `blob:` URLs
  from the Draco worker never touch the HTTP cache.
- The model token comes from `new URL(import.meta.url).searchParams.get('v')`, so the bump
  script needs no new rewrite site and there is no second place to forget. The Hub's font and
  logos are in CSS and data, so those did get explicit bump-script entries.
- The change immediately broke two gates, which is the point of having them: the asset-retry
  test intercepted `**/*.glb`, and a query string stops that pattern matching, so it silently
  aborted nothing and the failure it simulates never happened. It now matches on `pathname`,
  which further parameters cannot break.
- Two more assertions ride on the same recording, both clean when measured and both cheap to
  keep. **No external request**: ADR-112 vendored the fonts precisely for this, but the guard
  only ever existed on the Hub — the MOBA had none, and now anyone who reaches for a CDN trips
  it. **No response at 400 or above**: a mistyped asset path is swallowed by the retry logic and
  surfaces only as a unit with no model, which nobody would trace back to a path. 195/195.

## ADR-135: Doubling the numbers that shape how the game feels changed nothing

- Date: 2026-08-04
- Status: accepted
- Decision: `tests/sim.mjs` gains T33, which pins the **consequence** of out-of-combat
  regeneration — how long a champion at half health takes to reach full while standing safe —
  in a band wide enough for rebalancing and narrow enough to catch a doubling.
- Method: the "computed but never asserted" audit was run on `sim.mjs` for the first time and
  came back empty; every candidate turned out to feed an assertion indirectly. So the question
  was asked the harder way: mutation testing. `sim.mjs` runs in 25 s, which makes a campaign
  affordable.
- **The first campaign was worthless and I have to say so.** Fourteen boundary mutations
  (`>=` → `>` and the like) all survived, which looks damning until you notice that in float
  time those are *equivalent mutants*: `time >= until` and `time > until` differ only at exact
  equality, which accumulated floats essentially never hit. That result described my choice of
  operator, not the suite.
- The second campaign used operators that cannot be equivalent — double a numeric literal.
  **11 of 12 survived**, and several are unambiguously behavioural: out-of-combat regeneration
  halved, minion arrow speed doubled, target-search radius doubled, fountain radius doubled.
  238 checks, none of them noticed.
- The answer is **not** to pin each constant. That produces tests that record the
  implementation instead of the intent — the anti-pattern this project has named repeatedly.
  What deserves a guard is the thing a player experiences.
- Measured before choosing one: half health to full, standing safe, takes **199.7 / 242.5 /
  267 seconds** at levels 1 / 6 / 12. Three to five minutes, against an average match of about
  eight. Waiting is therefore not a way back into a fight — recalling is the only option. That
  is a design position rather than a defect, so the gate holds the consequence at 120–360 s
  and leaves room to move it deliberately.
- Checked both ways: the suite passes at 241/241, and restoring the `/5` → `/10` mutation now
  fails all three levels instead of passing silently.
- The other survivors are recorded, not gated. Arrow speed, aggro radius and fountain radius
  each need the same treatment — name the player-visible consequence first, then guard that —
  and that is worth doing one at a time rather than in a sweep.
- First of those, done the same way. `if (d > 18) continue;` governs minion target acquisition;
  the consequence is **how close you can walk to an enemy minion before it turns on you**, which
  decides whether you can move past a lane without committing to a fight. Swept a lone minion
  against a lone champion: the boundary is exactly **18 m**, about half a portrait screen (a
  portrait view shows 36.6 m of lane), so you see the minion while still having the choice.
  T34 asserts the acquisition distance lands in 12–24 m — "not aggro on sight" at one end, "not
  invisible" at the other — and finds it by bisection rather than by reading the constant.
  Checked both ways: doubling the constant gives 35.8 and fails, halving gives 8.9 and fails.
- Second: the homing-projectile `speed: 30`. The consequence is **the beat between a ranged basic
  attack leaving and landing** — short enough and it reads as an instant hit with no travelling
  object. Flight time is exactly proportional to distance: 0.067 s at 4 m, 0.2 s at 8 m, and
  **0.267 s at maximum range**, about a quarter second. T35 pins 0.18–0.45 s at max range plus
  the proportionality; speed 60 gives 0.133 and fails, speed 15 gives 0.533 and fails.
- Third: the tower's `r: 2.2`. Two probe errors before a usable number, both worth recording. The
  first asked "can a melee champion damage the tower" — always yes, because the champion walks in
  regardless of where it is placed. The second asked the same thing from further away, which
  changed nothing for the same reason. The quantity is **where it stops**: `champ.range + tower.r`,
  measured at 3.24 / 4.19 / 6.56 m for r of 1.1 / 2.2 / 4.4. That is dive geometry — how far into
  a tower's threat you stand while hitting it. T36 pins 3.5–5.2 m, and both the doubling and the
  halving now fail; the first band I wrote (3–5) caught only the doubling, which is half a gate.

## ADR-136: Inverting conditions found four branches nothing was watching

- Date: 2026-08-04
- Status: accepted
- Decision: T37–T39 cover the three consequential branches that survived condition inversion —
  who is paid when a tower falls, the second tiebreak at the time limit, and whether an
  area ability respects its radius.
- Method: the numeric-doubling operator was exhausted, so the campaign switched to inverting
  `if` conditions — an operator that cannot produce equivalent mutants. **8 of 12 died**, which
  is a much healthier picture than the constants gave and says the suite guards logic well.
  The four survivors were specific rather than diffuse.
- `if (c.team !== team) continue;` in the tower-kill payout. Inverted, the gold for destroying
  a tower goes to **the team that lost it** — something a player would notice within a second —
  and nothing failed. T37 now checks both halves: the destroying side is paid, the losing side
  gets nothing.
- `if (kb !== kr)` is the *second* tiebreak at the time limit: equal building HP falls through
  to kill count. The existing test only ever exercised the first tiebreak, so this branch had
  never run at all. T38 forces equal building HP and an uneven kill count.
- `if (dist(c, e) <= ab.radius + e.r)` appears twice — dash splash and taunt. Inverted, an area
  ability hits everyone *outside* its radius and the suite is silent: T30 checks that each
  ability delivers its declared effects, but never that the radius bounds them. An area ability
  that ignores its radius is a global ability. T39 puts one enemy inside and one outside.
- Two fixture errors on the way to T37, both mine and both worth recording. Picking a red tower
  with `find` returned an inner one, which cannot be damaged until the outer falls — the test
  failed for a reason that had nothing to do with the rule. Then `damage(tower, hp + 1)` left
  it alive at 215 HP, because structure armour absorbed a fifth of the hit. Both were found by
  printing the intermediate state rather than re-reading the rule.
- All three mutants now fail and the clean tree passes 252/252.
- `view.js` had never been mutated, and at ten minutes a run a broad campaign is not affordable.
  So two mutations were chosen rather than sampled — the two behaviours **ADR-127 claims in its
  own text**, on the principle that an ADR asserting something untested is the worst kind of
  documentation. Removing the 3 m teleport threshold fails the high-refresh jump check; removing
  the camera's `approach(4, dt)` smoothing fails the portrait framing check. Both claims are
  genuinely guarded. The second is caught by the framing gate repaired one round earlier in
  ADR-133 — a gate written for a different reason, earning its keep twice.
- The same question put to `input.js` and `hud.js`, again choosing the mutations from what an ADR
  claims out loud. Removing the joystick's camera-yaw rotation (ADR-110: "every control follows
  the rotation") fails **five** gates at once — that claim is well covered. Removing the line in
  `flash()` that clears the previous toast (ADR-124: "`flash()` stacked messages at one spot")
  **survives, 195/195**.
- So ADR-124 has been stating a fixed defect that nothing verifies. The hidden-HUD gate only ever
  raised one toast, so stacking had no opportunity to happen. It now raises two in succession and
  requires exactly one `.moba-flash` to remain. Checked both ways: clean is 195/195, and putting
  the stacking back fails at all three layout sizes.
- Worth naming as its own shape: **a claim in an ADR is not a guard**. Three ADR claims were
  mutated this round and the previous one; two were covered, one was not, and there was no way to
  tell which without spraying. Prose that describes a fix reads exactly the same whether or not a
  test stands behind it.
- Applying that shape to the back catalogue found a fourth: ADR-118 claims that `1 - exp(-rate·dt)`
  makes turning and camera follow **behave the same at any frame rate**, and nothing compared two
  frame rates — the smoothness gates each ask one rate whether it looks smooth. The new check runs
  exactly one second of camera catch-up at 30 and at 60 fps and requires agreement. Clean: both
  leave −0.7326, which is the 1.83% ADR-118 states, to four decimals. Reverted to `dt·rate`:
  −0.5465 against −0.6372, a 0.0906 gap, and it fails.
- One loose end recorded rather than papered over. The portrait framing check failed on two runs
  during this round and passed on the others, including the clean run afterwards. The diagnostic
  fields it needed — the champion's x, the camera focus, and the clamp at `fountainX - 4` — are
  now part of its payload, and on a passing run they read −6.8 / −6.8 / 58, nowhere near the
  clamp. My hypothesis was that the champion had drifted to its fountain where the camera clamps
  and stops centring it, and **that is not confirmed**; the next failure will now name its own
  cause instead of needing another campaign to guess at it.

## ADR-140: ADR-117's headline gate had never tested what it claimed

- Date: 2026-08-05
- Status: accepted
- Decision: T28 builds its target from a **real minion** taken out of the wave, with its speed
  zeroed so the geometry the test describes is the geometry it measures.
- Method: continuing the "a claim in an ADR is not a guard" sweep into the sim layer, where a
  mutation costs 25 s instead of ten minutes. Four claims sprayed: ADR-113 (bot order
  alternates) and ADR-104 (buying is not tied to the fountain) both died properly. Two lived.
- ADR-117 is the one that matters — "every skillshot in the game had never once hit anything",
  fixed by swept-segment collision. Forcing the projectile back to endpoint sampling left the
  suite at 252/252. Chasing that took two wrong probes of my own before the answer appeared:
  the first mutation produced `NaN` rather than endpoint sampling, and reading the intermediate
  values is what showed it.
- The cause is in the fixture, and it is worse than a weak assertion. T28 built its victim by
  hand — an object literal with `kind: 'minion'` and a handful of fields. The minion tick then
  ran on it, read the fields that were missing, and wrote **`NaN` into its coordinates**. Every
  distance comparison against `NaN` is false, so `if (d > width + r) continue` never fired and
  the projectile hit everything in the world. The gate reported the victim damaged, which is
  what it asserts, so it stayed green from the day it was written.
- Measured after the fixture was rebuilt from a real minion: clean code damages the victim
  (500 → 400), endpoint sampling leaves it **untouched at 500** and the gate fails. That is the
  first time this check has distinguished the two.
- The other survivor is not a defect. ADR-109 credits both a seed diffusion and an 8-step
  warm-up; removing the warm-up changes nothing the suite can see, and measuring 4000 seeds
  says why — first-output mean is 0.5005 without it against 0.5069 with it, and the buckets are
  if anything flatter (389–412 against 352–437). Without the **diffusion** the mean is 0.1222,
  which was the original defect. The diffusion carries the fix; the warm-up is belt and braces.
  It stays, because removing it reseeds every deterministic test for no measurable gain, but
  ADR-109 should not be read as saying both halves are load-bearing.
- Rather than auditing the remaining hand-built fixtures one at a time, `sim.mjs` now wraps
  `Sim.prototype.step` once and asserts the invariant directly: **no entity ever holds a
  non-finite x, z or hp**. One malformed object dropped into a real system raises nothing; it
  just turns into `NaN`, and every `>` comparison against `NaN` is false, so every distance guard
  in the game quietly stops existing.
- Two corrections to my own work while building it. The first version sampled every thirtieth
  step to save time and **failed to catch T28**, which runs four steps — an invariant that only
  holds over long matches cannot protect short-lived fixtures, which are exactly the ones most
  likely to be malformed. Per-step checking costs 25.1 s -> 25.4 s, so the saving bought nothing
  and cost the only case that mattered.
- The second: my first attempt to verify it in the failing direction reverted T28 only partly,
  leaving `victim.speed = 0` in place, which is enough to stop the NaN, so it looked as though the
  invariant did not work. Verified properly with a genuinely field-incomplete minion, it fires —
  and shows the contamination **spreads**: one bad object puts `NaN` into six champions' positions
  through the separation pass. That is why the T28 projectile hit everything rather than nothing.

## ADR-141 — How much of a match the player spends unable to act, and why the respawn timer is not the lever

Status: accepted. Date: 2026-08-05.

The gates so far measure whether rules are correct. None of them measures the quantity a player
actually feels: **how much of a match is spent holding a phone that does not respond**. T10 asks
whether a respawn time exists, which is always yes.

Measured, 157 respawns across six champions: the nominal timer (`RESPAWN_BASE +
RESPAWN_PER_LEVEL × level`) has a median of 15.2 s, but the player is not back in the game until
they have also walked from the fountain — a further 5.8 s median, 41 m. **The constant named
"respawn time" under-states the real wait by 48% on average.** Same shape as `dropped` in
`pace.js`: a number that names a whole policy and owns half of it. Total per death: 22.3 s median,
45.4 s worst. Melee champions die 9 times a match; one measured match was **45% unplayable**.

Two obvious fixes were implemented, measured, and **both reverted**.

- Flattening the curve (8 + 1.8·L → 6 + 1.1·L, a 35% cut) changed total unplayable time by one
  second across 24 matches: **150 s against 151 s**. Deaths per match rose from 7.6 to 9.9 — you
  come back sooner, so you die sooner. The idle total is a fixed point of the **death rate**, not
  of the timer. Pushed further (5 + 0.75·L) matches stretched from 9.6 to 13.9 minutes.
- A decaying speed boost on leaving your own fountain, sized so it reaches zero at |x| = 32 while
  first contact happens at |x| = 29 median — geometry doing the work of an out-of-combat check.
  At 24 matches it made idle time **worse** (150 → 158 s) by lengthening matches. At 8 matches the
  two configurations it was tested against disagreed in sign, which is the whole reason it was
  re-run at 24.

The gate went through three versions, and the two discarded ones are the finding.

- **Version one measured a proportion.** Cutting the timer to 5 + 0.75·L moved it from 26% to 19%
  and it passed — while absolute idle time got worse. The denominator grew.
- **Version two measured absolute seconds.** Verifying it in the failing direction by halving the
  tracked champion's HP made it read 182 s → 91 s and pass, because the team now loses in four
  minutes. The numerator shrank for the same reason.
- Both are the same illness: any per-match total or fraction moves with match length, and match
  length is one of the things under test. **A quantity normalised by something you are changing
  cannot answer a question about it.**

What is gated now, each owning one failure mode that the others cannot dilute:

- `sim.mjs` T40: longest single lockout ≤ 40 s, and no match over 16 minutes. Verified failing —
  tripling `RESPAWN_BASE` to 25 leaves the mean untouched (182 → 196, noise) but takes the longest
  lockout to 62 s and fires. Three seeds resolve this cleanly (36 against 62).
- `balance.mjs`: deaths per minute ≤ 1.05, currently 0.21–0.80. This one **cannot** live in the
  fast suite: three seeds read 0.87 against 0.90 for a change that is 0.79 against 1.04 at 24
  seeds. A gate that cannot resolve the effect it names is not loose, it is fake — the same rule
  `balance.mjs` already states about win rates below 24 matches.

All three lines are ratchets set above the measured worst, not targets. Three minutes of a
ten-minute match is still too much idle time; the measurement says the way down is the melee death
rate (ADR-130's open axis), not any timer.

## ADR-142 — `ai.js` had no guard on when abilities fire, and a metric that reads well in both directions is not a guard

Status: accepted. Date: 2026-08-05.

Starting point was a pair of numbers that looked like a bug. Duskblade — the assassin, 2.4 m
range, worst win rate (29%) and highest death rate (0.80 a minute) — has its dash **off cooldown
80% of the time, the highest of the six**, and casts it **1.9 times a minute, the lowest**. Every
other champion converts availability into use at two to five times that rate.

It is not the bot. Measured over six matches: whenever the geometric window is open (dash ready,
an enemy champion between 2.5 m and dash range) it casts on average every **1.5 s** against a 5 s
cooldown — as often as the cooldown permits. The window is open for **185 s out of 3081 s alive**.
The assassin does not lack the instinct, it lacks the opportunity.

That investigation exposed something with no guard at all: **the mutation sweep of ADR-135 covered
`sim`, `input`, `hud` and `view`, but never `ai.js`** — and four of the five champions on screen
are driven by it. The dash rule requires `state === STATE.FIGHT`. Narrow that condition by any
means — a moved engage threshold, a change to the state machine, a change to `fightTarget()` — and
the dash silently becomes an ability that never fires, while every existing check stays green. T30
asks whether an ability does what its data says, never when it is used.

T41 now measures the conversion: with the window open, a cast must follow within 3 s (currently
1.57 s). Verified against three independent mutations of `ai.js`, all of which kill it: deleting
the dash branch (0 casts), swapping `STATE.FIGHT` for the unreachable `STATE.SIEGE` (5 casts,
41 s apart), and raising the lower distance bound past the ability's range (0 casts). The 3 s line
is deliberately loose — a broken rule does not drift, it goes to zero, so the gate only has to
separate "fires" from "never fires".

**The gate this replaced is the more useful record.** The first version measured how much of its
alive time a melee champion spends within `range + target.r` of an enemy champion — duskblade
9.5%, ironhulk 15.1%, ironward 15.7%, and duskblade being lowest lines up with its win rate and
death rate. Verifying it in the failing direction by cutting duskblade's speed from 7.4 to 3.5
sent the number **up to 17.8%**: a champion that cannot close also cannot disengage, and time
spent being caught and killed counts as contact. The metric reads plausibly in both directions —
low means either cannot reach (bad) or fights resolve fast (neutral); high means either doing its
job (good) or standing there dying (bad). **A number with a good story for every direction is a
description, not a guard**, and it was deleted rather than shipped.

Two probe defects on the way, both of which produced clean-looking tables of zeros before they
were caught: the cast event carries `index`, not `slot`, and the hit event carries `target`, not
`targetId`. A row of all zeros across every champion is a probe signature, not a finding. A third,
worse one: measuring reach as `d <= range` instead of the game's own `d <= range + target.r`
dropped duskblade from 9.9% to 0.6% and nearly became the headline "the assassin never reaches
anyone". Measure with the expression the system actually evaluates, not one that sounds equivalent.

## ADR-143 — Mutation sweep of `ai.js`, and two ways a sweep lies to you

Status: accepted. Date: 2026-08-05.

ADR-142 found that `ai.js` had never been swept even though it drives four of the five champions
on screen. Fourteen mutations — condition inversion and rule removal, the operators ADR-135 showed
actually kill things — run against `sim.mjs`. **Seven killed, seven survived.**

Three survivors were one shape: a rule that never holds, so a whole class of behaviour silently
disappears while 256 checks stay green — bots never using survival abilities, never healing allies,
never dashing. Patching three rules would be three special cases. **T42 asks the general question
instead: after two real matches, has every ability of every champion actually been cast, and has
every bot actually bought items.** One gate covers the class, including abilities not yet written.
Verified failing on the survival-ability mutation (`ironward.W`, `ironward.R`, `ironhulk.W` never
fire) and the ally-heal mutation (`dawnkeeper.W`). The threshold is "at all", not "enough": a rule
that has become unreachable does not drift downward, it goes to zero.

**A mutation that does not do what its label says makes a gate look weak when it is not.** The
sweep reported "never buys anything" as a survivor. It was not a buy mutation — it disabled
`wantsToShop()`, which since ADR-104's anywhere-shop only decides whether to walk home. Mutating
the actual `shop()` body kills T42 immediately (0 items for all six) **and** T40, because an
itemless match drags to 17 minutes. The label was wrong, not the suite.

**A survivor is only a survivor against the detector you ran.** The sweep ran against `sim.mjs`
alone. Two of the remaining survivors — never retreating below 32% HP, and engaging without
consulting the power ratio at all — move deaths per minute from 0.79 to **1.21** and **1.47** at 24
seeds, far outside `balance.mjs`'s 1.05 bound. Confirmed by running the slow suite against the
retreat mutation rather than inferring it: duskblade lands at 8% win rate and 1.26 deaths a minute,
and both lines fire. These behaviours were guarded all along, by a suite the sweep never invoked.

That confirmation exposed a defect in `balance.mjs` itself, written one round earlier: the win-rate
check called `process.exit(1)` before the deaths-per-minute check could run, so a change breaking
both reported only the first and the second looked clean. **A gate that hides another gate is a
gate missing.** Both now collect into one list and report together — verified on the same mutation,
which now prints both lines.

Still unguarded and accepted as such: sieging while defenders are present, and not disengaging at
17% HP under commitment. Both make the bot play worse without changing any measured outcome outside
noise, and no threshold for "the bot retreats often enough" survives the test ADR-142 sets — it
would read plausibly in both directions.

## ADR-144 — One fact written in three places, and 11.2% of attack sounds were wrong

Status: accepted. Date: 2026-08-05.

`sim.js` emits twenty-six event types. Six of them — `gameover`, `recallStart`, `respawn`, `sell`,
`shoot`, `wave` — have no consumer anywhere in `src/`. Most are harmless: the HUD polls
`recallProgress()` rather than listening for `recallStart`, and the match-over screen reads
`sim.over`. `shoot` is not harmless. It is emitted at the exact moment a projectile is created and
says what kind — and both consumers ignore it and re-derive the same fact from range:

| where | expression |
|---|---|
| `sim.js` | `proj && dist(a, target) > 2.5` |
| `sfx.js` | `a.def?.projectile \|\| a.range > 5` |
| `view.js` | `e.range < 5` |

Three expressions, three answers. Measured over two full matches, 5253 auto-attacks: **588 of them
(11.2%) played a bowstring sound with nothing flying**, and the reverse error was zero. The
breakdown is worse than the total suggests — **350 of the 588 are towers and the nexus, which have
no projectile at all, so every single shot a tower takes at you is wrong**. The rest are ranged
units attacking inside 2.5 m, where the sim resolves the hit instantly. `view.js` has the same
defect visually, drawing an arrow trail for the same shots.

The fix is not a fourth condition in each consumer. The `attack` event now carries `projectile`,
set from the one place that knows, and both consumers read it — the same rule `ai.js` already
states for siege targeting: 「規則喺 sim 度，唔喺呢度抄一份」.

T43 guards the contract dynamically: over two matches, every `attack` event's `projectile` must
agree with whether a `shoot` was actually emitted for that attacker, and structures must never
report one. Verified failing by re-introducing the old `sfx.js` heuristic into the emit, which
reproduces the measured numbers exactly — 588 disagreements, 350 of them structures — and by
dropping the 2.5 m condition (2993 disagreements).

Note for the next sweep: a static grep for `case 'x'` found the consumer list, but the six
unconsumed types were only confirmed by grepping the raw names across all of `src/` — the first
pass would have missed any handler written in another syntax. The check that matters is the
dynamic one; the grep only pointed at where to look. Source changed, so the cache token moved to
`assets-27`.

## ADR-145 — Two of the hub's thirteen tiles have been 404 on the live site

Status: accepted. Date: 2026-08-05.

Every round so far has measured the MOBA. The hub itself has been measured for touch-target sizes,
carousel geometry and dot spacing (ADR-133) — but never for the most basic property of a menu:
**that tapping a tile leads somewhere.** Loading all eleven launcher entries in a browser and
recording responses found `games/ashen-rail/dist/index.html` returning **404**. Reading the links
statically instead of through a browser found thirteen entries and a second dead one,
`games/elden-ring-ii/dist/index.html` — the browser sweep had missed it because my entry-extraction
regex required an `id:` field the launcher does not always place nearby. The cheap static check was
both faster and more complete than the elaborate one.

The cause is `.gitignore`: both `dist/` directories were excluded. This repo is a static GitHub
Pages site with no CI build step — Pages serves the checked-in files, so `dist/` is not an
intermediate artefact, it **is** the deliverable. `tower`, `snake-game` and `xiangqi-ai` all commit
theirs; these two did not. A generic habit ("don't commit build output") applied to a repo where
the build output is the website means "don't ship it".

Both projects build cleanly from source (`npm ci` then `npm run build`, 133 and 47 packages), and
both were loaded in a browser before committing: Ashen Rail reaches its loading screen at
「載入 荒原槍手… 50%」, Elden Ring II renders its title, **zero page errors and zero external
requests each**. The builds add ~53 MB across 1002 files, an order of magnitude more than the other
committed dists (716 KB / 276 KB / 616 KB) because both ship GLB models and audio.

That size is a real cost and it is largely duplication: `dist/assets` is a copy of `public/`, which
git already tracks. The alternative — `publicDir: false` plus rewriting asset URLs to `../public/`
— was rejected rather than skipped: the URLs are relative under `base: "./"`, the change would
break `npm run dev` (Vite refuses paths outside the project root), and neither game can be visually
verified from here. A dead tile is strictly worse than a duplicated asset, and consistency with the
three games that already work matters more than the megabytes.

`tests/hub.mjs` now reads every `link:` in `launcher.js` and asserts the file exists. It fired on
both dead links before the fix and passes at 13/13 after. The `.gitignore` comment states the rule
that was missing: excluding a `dist/` requires removing its launcher tile in the same change.

Two clean negatives found on the way, both recorded so they are not re-investigated. Four games
load `@supabase/supabase-js@2` from jsdelivr and one fetches an HDRI from `dl.polyhaven.org`;
blocking every external host shows they degrade rather than break — gomoku logs
`[Online] Supabase SDK not loaded` and carries on, and no game raises a page error. And
`games/gomoku/build_info.js` 404s locally because `deploy-pages.yml:66` generates it at deploy
time; the page guards on `window.__BUILD__` and simply shows nothing.

## ADR-146 — A cooldown that only ticks while you are using it (Penny's bug report)

Status: accepted. Date: 2026-08-05.

Penny sent a screenshot: 「技能CD會卡住」 — the basic-attack button's cooldown sweep frozen mid-way.

Both cooldowns in the game were decremented inside the code path that *uses* them rather than in
the tick:

- `a.cd -= dt` lived in `#tryAttack`, which is only called when a unit has a target in range.
  Measured: attack once, then stop — `p.cd` sits at **0.925 for as long as you like** (5 s sampled,
  it never moves). Two consequences, one cosmetic and one not: the button sweep sticks, and
  re-engaging ten seconds later still makes you wait out the frozen remainder before the first swing.
- `abilityCd` was decremented in `#tickChampion`, which dead units never reach. Measured: cast, die,
  wait two seconds — the cooldown is unchanged. You die with a 60 s ult and come back to a 60 s ult.
  Death already costs 22 s of idle time (ADR-141); this charges for it twice.

**This is the same shape the same loop was already fixed for once.** `moving` used to be set only in
`#moveToward` and never cleared, so a champion that stopped walking ran on the spot forever. A value
that only某條路徑有人管. Both cooldowns now decrement unconditionally at the top of `step()`'s entity
loop, before the `alive` check, and the two old sites are gone.

Attack rate is unchanged: longshot, ironhulk and duskblade each land exactly 20 attacks in 20 s
before and after, matching their attack-speed stat. T44 guards both halves and was verified by
putting each decrement back where it was — the attack half freezes at 0.925, the ability half stays
at 7.00 through two seconds of death.

**The fix makes the game harder, and the balance suite now fails.** Towers and minions were the
biggest beneficiaries of the bug: an idle tower kept a stale cooldown, so its first shot on
acquiring a target was delayed. It now fires immediately, which is what it should always have done.
Melee champions, who spend the most time walking into tower and minion fire, lose the most. Measured
at 24 matches: the spread goes from 34 points to 45, and **ironhulk falls to 17%, below the project's
own 20% floor** — consistently, in both the full fix and the attack-half-only variant (17% in each).
Duskblade reads 13% with both halves and in-band with the attack half alone, which at ±17 points of
confidence is noise; ironhulk is the robust signal.

The fix ships anyway. A cooldown that stops running when you look away is a defect Penny can see,
and reverting it to keep a balance number would be keeping a bug because it happened to compensate
for a different problem. What the numbers actually say is that **melee were being protected by this
bug** — ADR-130's open axis was worse than measured all along. Re-tuning in the same round would
repeat ADR-131's mistake of moving the yardstick while measuring with it, so the balance suite is
left red, stated plainly here and in the handoff, and the next round is dedicated to it with a fresh
baseline. Source changed; cache token moved to `assets-28`.

## ADR-147 — Elden Ring II: two breakpoint systems that never agreed, and the first instrument for this game

Status: accepted. Date: 2026-08-05.

This game had no test beyond `static-build.test.mjs`, which checks that files exist. Nothing had ever
looked at the running game, so the first work is an instrument, not a change: `tests/hud-layout.mjs`
serves `dist/` over a local server, drives a real browser into gameplay through the same clicks a
player makes, and measures every HUD element's rectangle. Draw calls and frame counts are wrapped at
`WebGLRenderingContext.prototype` before page load, so nothing in the game needs a test hook.

What it found: `.player-hud` was positioned with a hard-coded `top` — **91px on desktop, 63px on
narrow/coarse, 45px on short landscape** — while the brand lockup directly above it sizes with
`font-size: clamp(20px, 2vw, 30px)`, so its height tracks viewport *width*. Two halves of one job,
written in two places, keyed off two different axes. They agree only at the sizes someone happened
to open. Measured across five viewports: clean at 1280×800, clean at 667×375 and 375×667, and
**broken at 900×500 and at 844×390 — iPhone 14 in landscape**, where `VEIL OF THE HOLLOW CROWN`
overlaps the class sigil by 45×8 px and the class name by 97×5 px.

The fix is structural rather than another offset: `.player-hud` moves inside the topbar's left
column and flows under the brand lockup, and all three hard-coded `top` values are deleted. Nothing
now needs to track anything. 7/7 across the five viewports, verified by screenshot as well as by
rectangle — "no overlap" is also satisfiable by pushing an element off-screen, which the picture
rules out.

One correction to my own gate while building it. The overlap threshold started at 6px and **hid a
real 5px collision** (`VEIL OF THE HOLLOW CROWN` × `OATHBOUND`); it is 1px now. A threshold chosen
for comfort rather than from the defect is a line drawn where it cannot see what it is guarding.
The detector also has to skip full-screen backdrops — the canvas, vignette and grain cover
everything by construction, and counting them reported 12 overlaps of which 12 were noise.

## ADR-148 — Elden Ring II: the map could not be expanded until the camera stopped going through walls

Status: accepted. Date: 2026-08-05.

The whole game was one circular arena of radius 22.35 — 1569 m² — with spawn, both minion waves and
the boss all strung along `x ≈ 0` from `z = +17` to `z = -15`. Roughly a quarter of the floor was
ever a reason to walk anywhere; the rest is reachable and pointless. Expanding it is therefore not
"make the circle bigger": empty floor is not map.

Three environment models ship to every player and were never placed in a single frame:
`bridge-straight-pillar.glb`, `gate.glb`, `tower-square-top-roof-high-windows.glb`. The expansion is
built from those — a gate in the west wall, a walled causeway, and a second courtyard (centre
`x = -60`, radius 17) with two towers as skyline. The arena shape is now **data** (`ARENA`, `GATE`,
`BRIDGE`, `COURT`) and the walls are generated from it, so "where the walls are" and "what the map
is" cannot drift apart. The gate opening is defined by **angle**, not by skipping a segment index —
skipping an index makes the doorway's width depend on the segment count.

**The order of work was wrong at first, and measuring is what corrected it.** With the corridor
built, the connectivity gate went green — the physics world genuinely has a clear path from `x = 0`
to `x = -60`. The screenshots did not agree: standing in the causeway, the entire frame was a slab
of stone. Two separate causes, and neither was the corridor.

- `bridge-straight-pillar.glb` is a *viaduct* — deck at head height on piers. Placing three of them
  down the centreline meant the player walked underneath, and the model read as a wall across the
  road. Replaced with `wall.glb` pieces lining the causeway.
- The real one: **the third-person camera had no occlusion handling at all.** It sat rigidly 8.3 m
  behind the player and never asked whether anything was there. In a single open arena that
  assumption holds because nothing is ever behind you. Arithmetic from the existing constants shows
  it was already broken before any of this work: the player spawns at `z = 17`, so the camera sits
  at `z = 25.3` while the arena wall is at 22.35 — **the camera starts 2.95 m outside the arena**.
  Measured in the running game with occlusion disabled: 25.85. With it: 20.51.

So the camera fix is not a consequence of the new map; the new map is what made a pre-existing
defect visible. The camera now marches a 2D slab test from the player along the boom and stops at
the first static box, with a 2.4 m floor, and its height interpolates with the shortened distance so
a pulled-in camera looks down rather than clipping. In the open arena at full extension the framing
is unchanged.

Two smaller things. The moon's shadow camera was a fixed ±32 box around the origin, which the new
courtyard falls entirely outside; enlarging it to cover the map would spread one 2048 map over
160 m (31 mm/texel → 78 mm). It follows the player instead and **narrows** to ±26, so shadows are
sharper than before at any map size. And I added a `window.__ER2` debug object before noticing the
game already publishes player position, camera yaw, enemy count and minion states on
`mount.dataset` — the same "one fact, two sources" shape as ADR-144. `__ER2` is now only the two
things dataset cannot express: the map shape and the static-box list.

Gates: 9/9 in `tests/hud-layout.mjs`, each verified failing. Closing the gate opening blocks the
corridor at `x = -21.75…-23`; disabling the camera pull-in puts the camera 3.5 m outside the wall.

## ADR-149 — Elden Ring II: giving the new courtyard a reason to exist

Status: accepted. Date: 2026-08-05.

ADR-148 built the westgate causeway and courtyard but left them scenery — a place with nothing in
it. A map you can walk to and have no reason to visit is the same defect the expansion was meant to
fix, just moved somewhere new.

The courtyard is now the third ward. Waves were typed `0 | 1` and the encounter was
`"approach" | "cloister" | "boss"`; both are widened, three revenants spawn in the courtyard, and
`advanceEncounter` runs 0 → 1 → 2 → boss, so **the boss gate does not open until the courtyard is
taken**. Going west is no longer optional.

Two places resisted the third case, and both were the same shape — a binary written as a ternary:

- `wave === 0 ? "approach" : "cloister"` appeared twice in `activateWave` (audio mix and HUD state).
  With a third wave the two copies would have to be corrected in lockstep. Replaced with one indexed
  table.
- Minion damage, speed and reach were each `minion.wave === 0 ? a : b`. Now `[a, b, c][minion.wave]`,
  with the courtyard wave hitting for 15 against 10/13 and moving at 5.4 against 4.3/5.1.

The grace point had the same problem in a worse form. It was a single `grace` whose position was
read in three separate places — distance test, the `E` heal, and the hint string. Copying it for a
second location would have written one job twice; instead `graces` is a list and everything asks
`nearestGrace(...)`. The second one sits in the courtyard at `(-52.5, -6.5)`, so clearing the third
ward does not require walking the whole causeway back to heal.

New gates, both verified failing. **Three waves, none empty** reads 2/3/3. **No spawn point is
stuck inside geometry** tests all eight spawns against the real static-box list — an enemy spawned
inside a rock does not error, it just never arrives, and since each ward requires clearing the last,
one bad spawn ends the run permanently. Moving a courtyard spawn onto the wall at `(-60, 17)` fires
it. `tests/hud-layout.mjs` is 11/11.

## ADR-150 — Elden Ring II ran on two clocks, and the slower your device the less fair the game got

Status: accepted. Date: 2026-08-05.

While driving the game headlessly I could not get the player anywhere: minions ignored me for twenty
seconds, and the warrior — whose `speed` constant is 12.5 — covered ground at roughly 0.6 m/s. The
first explanation I reached for was that my test robot was bad. It was not, and chasing the real
answer found the biggest gameplay defect in this game so far.

The tick had **two clocks**:

- `const now = nowMs / 1000` — raw `performance.now()`. Every combat timer hangs off this: minion
  attack cadence, `boss.impactAt`, the telegraph ring's shrink, `stateUntil`, and the player's
  dodge invincibility window.
- `const delta = Math.min((nowMs - lastTime) / 1000, 0.05)` — clamped. Movement, physics and all
  animation mixers use this.

The clamp is a legitimate spiral-of-death guard, but it means that below 20 fps game motion advances
slower than real time while **the combat timers do not**. The player moves in slow motion into
attacks arriving at full speed, with a dodge window measured in real seconds. The game gets harder
in exact proportion to how badly the device is struggling, silently.

Measured with CPU throttling, counting minion attacks per second of *motion* time: **2.33 at 1×,
2.90 at 6× — 25% more attacks for the same amount of movement.** Anchoring against the game's own
constant makes it starker still: minions are specified to attack every 1.4 s, i.e. at most 0.71/s,
and they were landing 2.33–2.90 — **three to four times the designed cadence** whenever frames were
slow. After unifying on one accumulated clock: 0.62–0.67, which is what the constant says.

`now` is now `motionClock`, accumulated from the same `delta`, and the three `performance.now()`
spawn-time assignments follow it. Time still dilates under load — that is the guard doing its job —
but everything dilates together. Run duration for the stats record deliberately stays on wall clock;
that is a real-world number, not a gameplay one.

The gate is anchored to the constant rather than to a second measurement, because two runs can both
be wrong in the same way: attacks per motion-second must be ≤ 0.9. It reads 0.48 now and **2.63**
with the old `now` restored.

One more from the same family, found by grepping for smoothing that ignores `delta`: the lock-on
camera blended its look target with a bare `lerp(..., 0.34)` while the same camera's position uses
`1 - pow(0.001, delta)` and its yaw uses `delta * 2.2`. Two thirds of one job was frame-rate
independent and the last third was not, so tracking lag behind a moving target differed roughly
fourfold between 30 and 120 fps. Now `1 - pow(0.002, delta)`.

## ADR-151 — Elden Ring II: the swing arc was drawing a different weapon than the one that hits

Status: accepted. Date: 2026-08-05.

The melee attack draws `attackArc`, a torus of radius 1.55 scaled 0.72–1.30 spanning `Math.PI * 1.35`
— a **243° ring at 1.1–2.0 m**. The hit test is `findSweptAttackTarget(classConfig.range, 0.92)`: a
forward capsule reaching **4.4 m** with a lateral half-width of 1.32 m, i.e. a cone of about **33°**.

Two independent numbers describing one swing, written in two places, disagreeing in both directions
at once: the picture **hides more than half the reach** (you kill things the arc never touched) and
**over-states the spread fourteenfold** (it looks like a sweep around the body; it is a forward
poke). Same family as ADR-125 and ADR-144 in the MOBA — one fact with two sources gets two answers.

The arc geometry is now derived from the same constants the hit test uses, rebuilt per class in
`selectCharacterClass` since each class has its own range, and the sweep radius is a named constant
both sides read. The visual sits at `range * 0.82` = 3.61 m with a 24° span.

The arc deliberately uses the weapon's sweep alone and **not** the target radius the hit test adds:
how fat the enemy is belongs to the enemy, not to how wide your blade travels. My first version did
add it — and `minionRadius` is declared fifty lines *after* `attackArc` is constructed, so the call
hit the temporal dead zone and the game died on load with a black screen. The suite's "zero page
error" check caught it on the next run; the layout checks alone would not have, because a page that
never renders has no overlapping elements.

The gate states a position rather than restating the formula (a test that recomputes the
implementation only proves the implementation ran): the drawing may not promise reach the rules do
not have, may not hide more than 40% of the reach they do have, and may not exceed the real cone by
more than 20%. Restoring the old torus fires two of the three — 1.55 against a required 2.64, and
243° against 33°. The first check stays green there, correctly: the old arc under-promised reach
rather than over-promising it, and each check owns one direction.

Left measured but unchanged: a swing damages exactly one enemy, because `findSweptAttackTarget`
returns a single best candidate. With three-revenant waves that is now visible, but whether a sweep
should cleave is a balance decision, not a defect, and it is recorded here rather than guessed at.

## ADR-152 — Elden Ring II: phase two was the same fight with bigger numbers

Status: accepted. Date: 2026-08-05.

The boss had exactly one attack. `boss.phase = 2` at half health changed the windup (0.72 → 0.52),
the damage (25 → 34), the hit radius (3.9 → 4.5), the cadence and the run speed — every one of them
a number on the same `Punch`. Nothing the player *does* changes: read the ring on the boss, roll,
punish. A second phase that alters no decision is a difficulty slider wearing a phase transition's
clothes.

`demon.gltf` ships fourteen animation clips and the game uses five. `Jump`, `Jump_Land`, `Duck`,
`Wave`, `Weapon`, `No`, `Yes` and `Jump_Idle` have never been on screen — the same finding as the
three never-placed environment models in ADR-148. Phase two now opens with a **leap**: the landing
point is locked at take-off, the boss flies there over 0.78 s on a sine arc, and the telegraph ring
is drawn **at the landing point rather than on the boss**. That is the part that makes it a
different fight — the thing you read is where it will land, not where it is standing, so backing
away is no longer automatically safe. Impact distance is measured against the locked landing point
for the same reason.

The move choice is a **pure function at module scope**, `chooseBossMove(phase, distance, roll)`, not
a branch buried in the tick. The reason is testability, and it is not academic: reaching the boss
headlessly means clearing eight revenants under software rasterisation at three frames a second. A
gate that requires winning the game before it can observe anything is a gate nobody will ever run.
Extracting the decision means the whole input space can be swept in a millisecond.

Three checks, all verified failing by making `chooseBossMove` return `"punch"` unconditionally:
phase one is punch-only at every distance; phase two beyond 6.5 m produces **both** moves across
forty rolls; phase two inside 6.5 m stays punch, because a leap is how you close distance, not
something you do while already in someone's face. Only the middle one fires on the mutant — correct,
since the other two describe behaviour the old code also had.

`tests/hud-layout.mjs` is 18/18.

## ADR-153 — Elden Ring II: the third ward was sixty metres away and nothing pointed at it

Status: accepted. Date: 2026-08-05.

Playing the game through the browser for the first time since changing the encounter chain confirmed
0 → 1 works: two revenants die, the cloister wave of three spawns. It also exposed a gap **this
session created**. ADR-149 put ward three in the courtyard at `x = -60`. The objective panel says
"Take the westgate courtyard", but a line of text is not a direction on a 200 m map at night with no
minimap. Clear the cloister and you stand where you are with the next objective off-screen.

A faint additive light shaft now marks the live objective — the mean position of the living
revenants, or the boss — and only when it is more than 25 m away. Both directions matter and both
are gated: an always-on beacon passes "shows when far" and is a *worse* game, because in melee it is
a column planted on top of the thing you are fighting.

`shouldShowWaypoint(distance, alive)` is a pure module-scope function, same reasoning as
`chooseBossMove` in ADR-152: the "shows when far" case only occurs in ward three, and a gate that
must beat two waves to observe anything will never run. The running-state check still covers
integration — at spawn, with the objective 5.8 m away, the beam is off. Making the rule return
`alive && distance != null` fires both checks.

Two corrections from actually playing. My first pass drove the game with `Space` believing it was
attack — it is dodge; attack is `J`/`F`. Forty rolls carried the player from `z = 17` to `z = -8`
with nothing killed, and I nearly recorded "attacks do not land" as a defect. Reading the key map
before writing the probe would have cost a minute. Second, the causeway was built 6.4 m wide, and a
screenshot from inside it is half stone: the camera sits 8 m behind the player, so a corridor
narrower than that has nowhere for it to go even with ADR-148's pull-in. It is 11.2 m now, with the
visual walls and the physics rails both derived from the same `BRIDGE.halfWidth`, and the doorway
angle widened to match.

`tests/hud-layout.mjs` is 20/20.

## ADR-154 — Elden Ring II: the fog gate opened onto the same field it was standing in

Status: accepted. Date: 2026-08-05.

The boss fight happened at `z = -15` — inside the same 22.35 m circle as both minion waves, with the
fog wall at `z = -9` fencing off the northern third. Roughly thirteen metres deep, for a boss that
as of ADR-152 leaps 6.5 m and covers the gap in under a second. Passing through a fog gate is the
genre's clearest promise that somewhere else begins; here it opened onto the same floor.

The map is now three places. North of the arena: an opening in the ring wall at `-π/2`, an 11.2 m
walled hall, and a sanctum of radius 20 centred at `z = -48` with its own **warm** fill light against
the arena's cold blue, two towers, a doorway, four pillars and banners. The boss and the fog gate
move with it — the gate now sits at the mouth of the hall on the arena's north wall, widened from
8 m to 11.2 m to match `HALL.halfWidth`, and the ground plane grows to 170 m deep to carry it.

`ringWall` took a single optional `skip`; the arena needs two openings now, so it takes a list. The
opening angles stay angles rather than segment indices, for the reason ADR-148 gave: an index makes
the doorway's width depend on the segment count.

`ARENA_RADIUS` and `BOSS_SPAWN_Z` are module-scope constants, not locals in the effect. The boss
spawn and the gate position are needed in the first half of the file while the map data block sits
in the second — exactly the temporal-dead-zone trap that took the game to a black screen in ADR-151.
Once bitten.

**My own gate failed to catch its own defect first time round.** I extended the corridor check north
with `北.every(z => z > -24)`, reasoning that the fog gate blocks around `z = -21.75` so anything
past `-24` must be a real wall. Sealing the north opening entirely — the exact regression the check
exists for — left it green, because the arena wall sits at `-22.35`, which is also greater than
`-24`. A threshold cannot separate two things that occupy the same position. `addStaticBox` now
takes a tag, the fog gate carries `"fog-gate"`, and the check filters it out and demands **zero**
permanent walls. Sealing the opening now reports blockage at `-21.75` through `-23` and fires. This
is the fifth time this session a gate has been green for the wrong reason; the tell each time was
running the mutation rather than trusting the green.

`tests/hud-layout.mjs` is 21/21.

## ADR-155 — Elden Ring II: three regions were paying for each other's lights

Status: accepted. Date: 2026-08-05.

After the map went from one arena to three regions I re-measured what it costs, which is the part
that is easy to skip once the screenshots look right. Draw calls went **137 → 158** for roughly
thirty added models — fine, frustum culling is doing its job. Frame rate dropped **3.0 → 2.0**,
which under software rasterisation means nothing in absolute terms but is a real relative signal.

The cause is not geometry. `courtFill` and `sanctumFill` are `PointLight`s with `distance` set to 34
and 42, so past that range they contribute exactly zero — but three.js still puts every visible
light into the shader's light loop, so every shaded fragment in the arena pays for two lights that
cannot be seen from there. Measured by hiding both: **2.0 → 2.3 fps**, with draw calls unchanged at
158, which is the shape you would expect from per-fragment cost rather than per-object.

Regional fills are now switched off when the player is further away than the light's own
`distance` (plus 6 m of hysteresis). The threshold is **read off the light** rather than written
beside it — a second constant that has to track the first is the defect shape this session has hit
repeatedly, most recently in ADR-154's own gate. It also scales: a fourth region costs nothing in
the other three.

Gated by asking the light, not by restating the rule: no fill may be lit while further from the
player than its own range. Forcing `visible = true` fires it — at spawn the courtyard fill is 63 m
away with a 34 m range and the sanctum fill 65.9 m with 42 m, both lit and both invisible.

`tests/hud-layout.mjs` is 22/22.

## ADR-156 — Elden Ring II: restarting built an invisible wall across the arena

Status: accepted. Date: 2026-08-05.

I had changed a great deal of state this session without ever exercising `restart()`. Reading it
found the fog gate's collider written **twice** — once where it is created, once inside `restart()`.
ADR-154 moved the gate from `z = -9`, half-width 4, to the hall mouth at `-21.75`, half-width 5.6,
and only touched the first. Die, press R, and an **8 m invisible wall reappears across the middle of
the arena**, where nothing is drawn and where the visible gate is 11.2 m wide somewhere else. One
fact written twice gives two answers — the third time this session (ADR-144, ADR-151).

Position and size are now one `FOG_GATE` constant at module scope, with a single `makeFogGateBody()`
used by both paths. Module scope because the mesh is positioned in the first half of the file and
the body created in the second; TypeScript caught the ordering this time, unlike ADR-151's runtime
dead zone.

**The gate for it had to be strengthened twice, and the mutation caught both weaknesses.**

- First version: die to the wave-two revenants, press R, compare the fog-gate boxes. Green with the
  bug restored — because `restart()` only rebuilt the collider `if (!bossGateBody)`, and the body is
  nulled only when the boss unlocks. Dying before the boss never runs the broken line. So the fix is
  also a structural one: `restart()` now always removes and rebuilds, and both ways of dying take the
  same path. A branch that only one route reaches is a branch no test will reach either.
- Second version: still green, because the check counted boxes **tagged** `fog-gate`, and the stray
  the bug creates is untagged. It now compares the whole static-geometry set before and after, which
  fires and names the intruder: `0.00,-9.00,4,0.36`.

Making restart unconditional exposed a third defect, in my own instrumentation. `staticBoxes` only
ever grew — `physicsWorld.removeBody` drops the body but left the record, so a removed fog gate
stayed a wall in the list the connectivity gate reads, and rebuilding it produced two. There is now
`removeStaticBox(body)` keeping both in step, and `walls()` no longer leaks the body handle.

That is the seventh gate this session found green for the wrong reason, and the seventh time the
tell was the same: run the mutation, do not trust the green. `tests/hud-layout.mjs` is 25/25, and it
now genuinely plays the game — it stands still until the revenants kill it, then restarts.

## ADR-157 — Elden Ring II: a bot that plays, and two things it proved were not wrong

Status: accepted. Date: 2026-08-05.

`tests/hud-layout.mjs` had started genuinely playing the game (standing still until the revenants
kill it, ADR-156), so the obvious next question was whether the game can be finished at all — the
one property no gate covers. `tests/playthrough.mjs` drives a bot that walks to the nearest revenant
and swings inside melee reach, prints what ward it reaches, and **does not judge**. It is not in the
fast suite.

It does not judge because a bot dying proves nothing about the game. Two runs: ward one (two
revenants) cleared in 26–28 s; ward two (three) killed **2 of 3** before the bot died. A human
repositions and rolls; the bot walks in and trades. That is a difficulty step, and the number is a
reference line, not a pass mark.

Two hypotheses formed on the way, both measured, **both wrong** — recorded so they are not
re-derived.

- Reading the death snapshot, the three ward-two revenants sat within 1.7 m of each other and looked
  like a single blob you cannot fight or separate, which would have made the AI's separation force
  the culprit. Measured across 29 samples during the fight: median gap **3.09 m**, minimum 1.12, and
  **0%** under 0.9 m, where two capsules touching is 0.80. Separation works. The snapshot was the
  instant of death, when all three had converged on the same corpse — one frame is not a pattern.
- The first bot dodged whenever an enemy came within 2.6 m, and killed nothing in 89 seconds. Melee
  reach is 4.4 m, so it was rolling away at exactly the distance it could have hit from. Bot, not
  game. Same shape as reading `Space` as attack in ADR-153: two rounds lost to not checking the
  numbers the game already states.

Nothing was tuned on any of this. The ward-two step might warrant a change, but a bot's death is not
the evidence that would justify one, and the one lever that suggests itself — letting a swing cleave
— is now argued *against* by ADR-151: the arc was made honest about being a narrow 24° poke, so
cleaving would put the picture and the rules back out of step in the opposite direction.

## ADR-158 — Elden Ring II: two thirds of the classes had never been loaded

Status: accepted. Date: 2026-08-05.

Two checks, one of which found nothing and one of which found a hole in the suite itself.

**Animation names resolve.** A clip name that does not exist in the model fails silently —
`playAction` simply finds nothing and the character keeps its previous pose, which is the same
"a whole behaviour quietly missing" shape as ADR-117 in the MOBA. Reading the GLB JSON chunks
directly and comparing against every name the code asks for: the player's `Death`, `Idle_Weapon`,
`RecieveHit`, `Roll`, `Walk`, `Run_Weapon`/`Run_Holding` and each class's attack pair; the minion's
`Spawn_Ground_Skeletons`, `Running_A`, `Unarmed_Melee_Attack_Punch_A`, `Idle_Combat`, `Death_A`,
`Hit_A`; the boss's seven. **Every one exists**, including the ranger correctly asking for
`Run_Holding` where it has no `Run_Weapon`. Clean negative, recorded so it is not re-derived.

**But every check in the suite picked OATHBOUND.** Two of three classes had never been loaded in a
test. They are not cosmetic variants: they fire projectiles, use different attack clips, and reach
16 m and 18 m against melee's 4.4. Anything broken there hits a third of players on the first screen
while the suite stays green.

The suite now runs a compact per-class pass — loads, zero errors, arc geometry derived from that
class's own range, and actually kills something — rather than repeating all 25 checks three times.
Measured: ASTROLOGER draws 13.12 m at 2° against a 16 m reach, WAYFARER 14.76 m against 18 m, and
both clear ward one in 26 swings. Verified failing by making `selectCharacterClass` rebuild the arc
from the warrior's numbers: both read 3.61 m against their real 16 and 18.

One mechanical note. The per-class pass opens new pages while the main page is still running a WebGL
loop, and under software rasterisation that starved the CPU enough that clicking a class button
timed out at 30 s. The main page is parked at `about:blank` first; nothing after that point uses it.

`tests/hud-layout.mjs` is 31/31.

## ADR-159 — Elden Ring II: the dodge's invincibility frames never get a chance to matter

Status: accepted. Date: 2026-08-05.

Twenty-four checks and not one touched the dodge, which is the core verb of the genre. Broken
i-frames raise no error; they turn into "why do I get hit when I roll" while the suite stays green.

Measured as a consequence rather than pinned as a constant: damage taken per second of **motion**
time — motion, not wall clock, because the standing run dies early and real seconds are not
comparable. Standing still: **8.89–9.02 %HP/s**. Rolling continuously: **1.78 %HP/s**, an 80% cut.
The gate demands at least half.

Then the mutation refused to fire. Deleting the invincibility window entirely —
`invincibleUntil = now` instead of `now + 0.52` — moved rolling from 1.78 to **1.77**. So I took the
two mechanisms apart, because "i-frames do nothing" and "i-frames are redundant here" are different
claims and only the second turned out to be true:

| | no displacement | with displacement |
|---|---|---|
| **no i-frames** | 9.05 %/s | 1.77 %/s |
| **with i-frames** | 4.67 %/s | 1.78 %/s |

Read across: i-frames on their own are worth a **48% cut** (9.05 → 4.67) — they work. Read down the
right column: on top of the displacement they are worth **nothing** (1.77 → 1.78). A roll travels
12.4 m/s for 0.68 s, about **8.4 m**, while a revenant attacks from 1.82 m. You are already gone;
the invincibility never gets tested. And the top-left cell confirms the floor — rolling in place
with no i-frames is exactly as bad as not rolling at all (9.05 against 8.89).

The check is kept and renamed to say what it actually holds: **it guards the displacement.** Removing
the i-frames leaves it green, and that is now written into the test beside the table rather than
being a surprise for whoever runs the mutation next. Nothing was changed in the game. The i-frames
are not dead code — they are load-bearing in exactly the situations this environment cannot produce
(cornered, or rolling through an attack already in flight), and deleting a mechanic because it did
not show up in one measurement would be the same error as tuning on a bot's death (ADR-157).

That is the eighth gate this session found green for a reason other than the one it appeared to
test. The tell was the same every time.

## ADR-160 — Elden Ring II: the death screen had never been laid out, and my detector cried wolf on it

Status: accepted. Date: 2026-08-05.

Two more silent-failure sweeps, both clean, then a real gap.

**Sound names all resolve.** A `gameAudio.play("typo")` makes no noise and no error. Comparing every
call site against the registry: ten names appear as literals and seven more arrive through the
ternaries that pick per class (`cast`/`bowRelease`/`swordSwing` on release,
`magicHit`/`arrowHit`/`bossHit` on impact) plus `enemyDeath`. All seventeen defined sounds are
played and all played names are defined — nothing dead, nothing missing. Same result as the
animation-clip sweep in ADR-158. Recorded so neither is re-derived.

**But the five-viewport overlap check only ever ran during ward one.** Every layout measurement in
this suite happened while the first two revenants were alive, so the "YOU DIED" panel — which every
player sees, at the moment they least want a broken screen — had never been measured at any size.
The suite already dies on purpose for ADR-156's restart check, so the measurement was nearly free:
re-run the five viewports before pressing R.

It reported an overlap at **all five sizes**, and it was **my detector, not the game**. The pair was
`R Rise at the Golden Remnant × R` — a `<button>` and the `<kbd>R</kbd>` inside it. The leaf-only
rule skips any element with children *except* BUTTON, deliberately, because buttons are tap targets
worth measuring; the consequence is that a button and its own child always "overlap". Containment is
now excluded on both sides.

Narrowing a detector is where you can quietly blind it, so the fix was checked against the defect it
was built for: restoring ADR-147's hard-coded `top: 45px` on `.player-hud` still produces
`VEIL OF THE HOLLOW CROWN × ⚔ (45×8)` and `× OATHBOUND (97×5)` at 844×390 — and now also in the
death state, which is new coverage. With the fix and clean CSS, the death screen is genuinely clear
at all five sizes.

That is the ninth "for the wrong reason" this session and the first that was **red** for the wrong
reason rather than green. The correction is the same either way: run the mutation.

`tests/hud-layout.mjs` is 33/33.

## ADR-161 — Elden Ring II: the map was a tree, and the camera was standing inside the walls

Status: accepted. Date: 2026-08-05.

The west courtyard was a **dead end I built myself**. Ward three sits at `x = -60`; clearing it meant
walking the whole 60 m causeway back east and then 48 m north to the fog gate — about 120 m of
retreading ground you have already seen, which is the part of level design players notice as tedium
rather than distance.

The map is a **loop** now. The courtyard gets a north opening, the sanctum gets a west one, and an
L-shaped passage joins them: south along `x = -60` to `z = -48`, then east to the sanctum. Same
11.2 m width as the other corridors, read off `BRIDGE.halfWidth` rather than written again.

The L corner was wrong on the first attempt, and the connectivity gate caught it before any
screenshot. Walls were built as centre-plus-half-length, symmetric, so **each leg's wall ran straight
through the other leg's mouth** — the horizontal run's north wall spanned `x = -60…-20`, sealing the
vertical corridor, and the vertical run's east wall spanned `z = -11…-54`, sealing the horizontal
one. The gate named both (`z-41.8…-43.0` and `x-55.0…-53.8`). Walls are now built from explicit
start and end points and stop at the corner, which is what an L needs.

Then the screenshot came back **black** — and the wall list said nothing stood between the camera
and the player. The camera occlusion (ADR-148) marches against `staticBoxes`, which are **0.42 m
thick**, while the `wall.glb` mesh drawn at the same place is far thicker. The camera stopped
legitimately outside the collider at `x = -64.63`, roughly half a metre clear of it, and that put it
**inside the visual wall**, which then filled the frame. The pad went from 0.55 to 1.35 m so the stop
distance covers the mesh, not just the box. This is a general fix, not a corridor one — it applies
anywhere the camera backs into a wall, and it is probably what the causeway widening in ADR-153
papered over rather than solved.

Two rounds of "the picture and the data disagree, so measure which one is lying" — the first time
the data was right (walls crossing), the second time the data was incomplete (colliders are not the
meshes).

`tests/hud-layout.mjs` is 34/34; sealing the courtyard's north opening fires the new loop check at
`z -16.3…-17.8`.

## ADR-162 — Elden Ring II: measuring the pixels, and one metric that could not tell two failures apart

Status: accepted. Date: 2026-08-05.

Every layout check in this suite measures rectangles, and rectangles are blind to the failure that
bit twice this session: the camera ending up inside a wall. Both times the wall list said nothing
stood between camera and player — because the colliders are 0.42 m thick and the meshes are not
(ADR-161). Nothing in the suite looks at what was actually drawn.

So: sample the framebuffer. A band across the lower-middle of the frame, avoiding the HUD, reduced
to mean luminance, luminance standard deviation, and distinct colours at 5-bit-per-channel
quantisation. Three states measured:

| | mean | stdev | colours |
|---|---|---|---|
| normal spawn | 34.3 | 16.6 | 308 |
| camera inside a wall | 25.6 | 7.2 | 66 |
| all scene lights off | 10.3 | 21.9 | 232 |

**The first version used standard deviation alone and did not fire.** Killing the moon and
hemisphere lights dropped the mean to 10.3 — and pushed stdev *up* to 21.9, because a nearly black
frame with a few bright points is high-variance. Contrast is not brightness, and one number cannot
own two failures.

Two checks now, each owning one: **distinct colours ≥ 120** catches a flat surface filling the frame
(66 when buried, 227–308 otherwise), and **mean luminance ≥ 18** catches a scene that is effectively
unlit (10.3–10.5 with lights off, 25–34 otherwise). Both verified in both directions: the buried
camera fires the first and leaves the second green; the lights mutation does the exact reverse.

What they do **not** guard is stated in the test beside them: both sample the spawn frame, and both
of this session's camera-in-wall incidents happened in corridors the suite cannot walk to. They
would not have caught either one. What they do guard is the first frame every player sees — a
lighting regression, a camera starting inside a structure, a render pipeline that silently produces
nothing — and no other check in this repo looks at a pixel.

That is the tenth "for the wrong reason" this session, and the second where the metric, not the
code, was the thing that was wrong.

`tests/hud-layout.mjs` is 36/36.

## ADR-163 — Elden Ring II: the button that starts the game was 30 px tall on a phone

Status: accepted. Date: 2026-08-05.

Every layout measurement in this suite happened *after* clicking into the game, so the title and
class-select screen — literally the first thing every player sees, and the only route into the game
— had never been measured at any viewport. Same gap as the death overlay in ADR-160, one screen
earlier. The entry sequence is now deferred until after a five-viewport sweep of the title screen.

The overlap sweep immediately reported dozens of collisions at every size, and again they were
**mine**. `.sigil` is `<div aria-hidden="true"><i/><b/><em/></div>` — three absolutely-positioned
shapes stacked **on purpose** to draw an emblem. Decoration is not content; the detector now skips
anything inside an `[aria-hidden="true"]` subtree, the same reasoning that already excluded the
canvas, vignette and grain. With that, the title screen is genuinely clean at all five sizes.

The real finding is the touch targets. The three class buttons are 114×60 everywhere. **`ENTER THE
VEIL` is 41 px tall on desktop and portrait, and 30–31 px on both landscape phone sizes** — the
configurations where a thumb is actually involved. 44 px is not a number I invented: it is the line
this project already applies to the Hub (ADR-133).

The cause is that its height was entirely emergent — 10 px of text plus `padding: 14px 30px` gives
41 px, and the narrow-viewport media query trims the padding further, dropping it to 30. A height
that is a by-product of two unrelated declarations will drift every time either one is touched.
`min-height: 44px` with grid centring makes the floor explicit, so padding can change freely without
the tap target following it down.

The check measures **all four buttons at all five viewports** rather than once, because a control
being comfortable on a desktop says nothing about a phone — which is exactly how this one survived.
Removing the `min-height` reproduces 41/41/30/31/41.

`tests/hud-layout.mjs` is 38/38.

## ADR-164 — Elden Ring II: the last two unmeasured screens, and a stack held together by luck

Status: accepted. Date: 2026-08-05.

Continuing the sweep of states nothing had ever laid out: the two utility buttons (♪ mute, ©
credits) and the credits panel itself. Both are reachable without playing a second of the game, and
neither had been measured.

**The buttons are 32×32 at every viewport** — below the 44 px line this project already applies to
the Hub (ADR-133), and the same class of defect as the 30 px start button in ADR-163. The credits
close button shares the rule and was equally small. All three are 44 px now.

**The credits overlaps were my detector again — third time.** It reported pairs like
`Oathbound. × Credits & Licenses`: the title screen showing through the modal. A modal is *supposed*
to cover what is behind it, so when one is open only its subtree is measured.

Enlarging the buttons then broke the in-game HUD at three viewports: `♪ × FIRST WARD · REVENANT
LINE (44×3)`. The right-hand column was three unrelated constants — buttons at `top: 82px`, 32 px
tall, objective panel at `top: 103px` — leaving 21 px of clearance for a 32 px element. **They were
already overlapping before I touched anything**; the buttons covered the panel's box and merely
missed its text, so nothing complained. Twelve more pixels turned a latent collision into a visible
one.

The panel's offset is now `calc(var(--utility-top) + var(--utility-size) + var(--utility-gap))`, so
the stack cannot drift again, and the narrow-viewport media query overrides `--utility-top` alone
instead of restating the sizes — which is what had been forcing 30 px on the two smallest screens
even after the base rule was fixed. Same remedy as `.player-hud` in ADR-147: stop writing the second
number.

Worth stating plainly: this round's defect was **created by this round's fix**, and only caught
because the whole suite reruns. A change that satisfies the check you just wrote is not finished
until everything else still passes.

`tests/hud-layout.mjs` is 40/40; setting `--utility-size` back to 32 px reproduces the failure at
all five sizes.

## ADR-165 — Elden Ring II: the walls you hit were not the walls you saw, and my ruler was mirrored

Date: 2026-08-05. Status: accepted.

The connectivity gate from ADR-154 answers "can you walk from A to B". It has never been able to
answer "does the thing stopping you look like anything". So I measured that: sample every collider
every 0.5 m and ask whether any visible geometry stands within 1.5 m. **93 colliders, 612.2 m of
wall, 187.6 m of it (30.6 %) invisible, and 20 colliders invisible along their entire length.**

The cause is the shape this project keeps producing: *the map's outline is written twice*. Colliders
come from `BRIDGE`/`HALL`/`LINK` — the bridge railings are one continuous box from x = −47 to
−22.35 at z = ±5.6. The walls you see are a separate hand-written coordinate list of `wall.glb`
copies at z = ±5.8, placed at four x positions 7 m apart while the model is 3.97 m wide: **three
metres of visible gap between each pair, all of it solid.** The three ring walls — 85 colliders, the
entire perimeter of all three regions — had no visible counterpart at all. The arena was an
invisible fence.

Adding more models would only have written the list a third time. The colliders are now the mesh:
one `InstancedMesh` built from the same `staticBoxes` loop that creates the bodies, so every
`wall`-tagged collider has a box at the same place, size and angle by construction, and the gltf
walls become decoration in front of it. Wall height went 3.6 m → 5.2 m to match `wall.glb` rather
than being a number of its own. 30.6 % → 0 %.

The reverse held too, and it was the same cause: prop colliders were a second hand-written table of
ten `addStaticBox` calls. One of them, at (9, 15), had no model — an invisible rock two steps from
the spawn point. And **the same model was solid in one region and walk-through in another**: two of
eight `pillar_decorated`, two of three `tree-large`, three of four `rocks-large`. Prop colliders are
now measured off the model itself — specifically the geometry below 2 m, because a tree's full AABB
is its canopy and would fence off the ground around it, while what actually blocks you is what
stands at body height. Ten hand-written boxes deleted.

Then the new flood-fill connectivity gate — a proper 0.5 m grid fill from the spawn, replacing a
centre-line scan that answered "is this one line clear" instead of "can you get there" — found
something worse. **The fog gate had stopped gating anything.** When ADR-161 made the map a loop, it
also created a second route into the boss sanctum through the courtyard and the L shortcut, and the
fog gate only ever stood in the north hall. You could reach the boss without clearing a single wave.
The old gate could not see it because it walked only x = 0 — that is, only through the fog gate. Two
fog gates now, both from one `FOG_GATE` shape and one shader, raised and dropped together.

Three of my own instruments were wrong, and only mutation runs found them:

- **The rotation convention was mirrored, in all five copies of it.** World → local about Y is
  `lx = dx·cosθ − dz·sinθ`; every copy wrote `cos(−ry)`. Sweeping the arena ring: the correct
  convention finds exactly two gaps (west 2.86–3.42, north 4.43–4.99), the mirrored one finds
  **twenty**. It stayed hidden for rounds because a mirrored ring is still a ring — every gate that
  only asked "is it sealed" got the right answer from the wrong world. The flood fill escaped
  through a phantom gap on its first run. There is one ruler now, installed on the page.
- The solidity gate's "is it on a region boundary" clause tested `|z| ≈ bridge.halfWidth` without
  restricting x, so it excluded anything at |z| ≈ 5.6 anywhere on the map — including the two
  courtyard pillars the gate existed to catch. Removing their colliders left it green.
- The minion cadence gate divided attacks by motion-seconds over a 22 s window: 3.9 motion-seconds
  and 4 attacks, so **one attack is worth 0.26/s against a 0.9 threshold**. Three attacks reads
  0.81 and passes, four reads 1.04 and fails — the same build, twice. It was green by luck. It now
  measures the motion-time gap between one minion's consecutive attacks against the game's own
  `1.4`, which a real-clock regression would show as ≈0.25.

Verified in both directions. `hud-layout.mjs` is 43/43; the mutations reproduce 27 % invisible wall,
0 of 83 wall meshes, a bypassable fog gate, two walk-through courtyard pillars, and a 0.9 s attack
gap.

Not done, and stated rather than quietly dropped: the decorative `wall.glb` copies still sit 1.8 m
inside the collider plane they decorate, so their visible inner face is not where you stop. The new
boxes make that overlap visible instead of invisible, which is better but not right.

## ADR-166 — Elden Ring II: the wall you see and the wall you stop at were a metre and a third apart

Date: 2026-08-05. Status: accepted.

ADR-165 ended by naming this and not fixing it, so here it is measured: **all 28 corridor wall
models had their inner face 1.36 m inside the collider plane** (two kaykit pieces, 1.58 m). You walk
at a wall, and you stop a metre and a third after entering it. Same cause as the round before —
the models sat at hand-written `z = ±5.8` while the colliders came from `BRIDGE.halfWidth = 5.6`.
Coverage was thin too: 15.9 m of models along a 24.65 m bridge.

Both now come from the corridor's own numbers. `鋪一排()` takes a face plane, which side the player
is on, and a run; it loads the model once, measures it, sets the centre to `面 + 內·(WALL_T − 深/2)`
so the model's inner face lands exactly on the collider face, and tiles `round(run / model width)`
copies. Changing a corridor's width, its endpoints, or the model itself now needs no second number.
The four flatMap coordinate lists are gone; the L-shortcut's start/end points were hoisted into
`LINK_RUN` so the colliders and the decoration read the same six values. 28 models → 60, inner-face
error 1.36 m → 0.00 m.

Cost of doubling the models: motion-seconds over a fixed 32 s window went 6.0 → 5.9, under 2 % and
inside run-to-run noise. The clones share geometry and material, so this is draw calls, not geometry.

**The gate was green under its own mutation** — the sixth time this session. `內` points at the
walkable side, so a wall intruding into the corridor gives a *positive* projected difference; I
filtered on `< -0.05`. Putting the models back at ±5.8 left it passing. With the sign corrected the
mutation reports `wall.glb (-44.9, -5.8) 入咗 1.36m` — the number measured before the fix, which is
the only evidence that the gate resolves the thing it is named after.

`hud-layout.mjs` is 44/44.

## ADR-167 — Elden Ring II: the map moves out of the React effect, and gets tested in 270 ms

Date: 2026-08-05. Status: accepted.

Every question about this map has had to be answered through a real browser, because the map only
existed inside a `useEffect`. That is why ADR-157 gave up on a playing bot: software rasterisation
runs at three frames a second and the character walks half a metre in one, so "the enemy never
reached me" and "the map is broken" are the same measurement. It is also why the mirrored rotation
of ADR-165 survived so long — the only instrument was expensive enough that nobody ran two of them.

`src/map.ts` now holds the shape: the constants, and `buildMap(add)` which generates every static
box. It imports neither three.js nor cannon-es — placing a box is injected. The game passes "make a
CANNON body"; a test passes "write this down", and gets the whole collision world in Node.

Behaviour-preserving by construction and by check: the 111-box collider table, dumped from the
running game and sorted, is **byte-identical before and after**.

`tests/map.test.mjs` runs in Node with `--experimental-strip-types`, in **270 ms** against the
browser suite's six and a half minutes, and asks three things the browser suite never could afford
to: that all three regions are reachable from the spawn, that the playable area is **sealed** (the
ground is an infinite plane, so "can you walk off the map" is a real question and had never been
asked), and that each ring wall has exactly the openings it should, at the angles it should.

Two of the three failed on their first run, and both were the instrument:

- The containment probes sat outside the flood-fill grid, so the index ran off the end of one column
  into the next and read a neighbouring cell — a fabricated "you can walk off the map". `到()` now
  throws on an out-of-range probe instead of answering.
- The opening sweep starts at angle 0, so the courtyard's east gate — which straddles 0 — came back
  as **two** openings at 0.05 and 6.23. Wrapping segments are now joined before counting.

Verified in the failing direction, all three mutations sub-second: sealing the arena's north gate
gives `1 opening, expected 2`; shortening the bridge railings by 3 m gives `漫咗出場外 (0, 45)`;
restoring the mirrored rotation convention fails all three at once. Sealing the north gate does
*not* make the sanctum unreachable — the L shortcut still gets there — which is the map being a
ring, and is why the two tests are not redundant.

`npm test` is now 6/6 and covers map shape as well as the built files.

## ADR-168 — Elden Ring II: 18 places a player could stand where the wave could never reach them

Date: 2026-08-05. Status: accepted.

ADR-167 said the point of moving the map out of the React effect was to make "can the enemy reach
you" answerable. Here is the answer, and it is bad — and it is bad *because of ADR-165*.

The chase rule moved to `src/chase.ts` as a pure function, and `__ER2.追擊試(from, to, seconds)` runs
it against the real collider table in a throwaway `CANNON.World` at a fixed 1/60 step, drawing
nothing. 233 chases take four seconds inside one `evaluate()`, with no dependence on frame rate at
all — the thing that made this unanswerable for eight rounds.

Sampling player positions across each wave's region: **18 of 233 could never be reached.** The
minions stopped dead at (±11.2, −11.6), (13, 8) and (−68, −8) — the columns, the trebuchet and the
courtyard rock, every one of them a prop that *had no collider until earlier today*, when ADR-165
made props solid to stop them being walk-through. And because a wave must be cleared before the next
one starts, an unreachable player position is not "an easier fight", it is a dead run.

The chase rule had no avoidance at all. It now probes 1.6 m ahead and, if that is blocked, tries
turns out to ±2.45 rad and takes the first clear one — when nothing is in the way the first probe is
the straight line, so open-field behaviour is unchanged. That fixed 17 of 18.

The last one needed the part that is easy to leave out: **once you have picked a side, keep it.**
Re-deciding every step makes the minion oscillate in front of anything wider than the probe, and the
courtyard rock's collider is 8.7 m across against a 1.6 m lookahead. With the turn sign remembered
between steps it slides along the obstacle instead. 18 → **0**, longest chase 16.3 s against a 24 s
budget.

Two things worth writing down rather than fixing quietly. That rock's collider is 8.7 × 9.3 m, from
the "geometry below 2 m" rule of ADR-165 — `rocks-large` is a scattered cluster, so at body height
it really is that wide, but the hand-written box it replaced was 4.2 m. The visible model is 14 m
across, so its outermost stones are still walk-through. Neither is wrong exactly; both are bigger
changes to how that corner of the courtyard plays than "give the props colliders" sounds.

Verified in the failing direction: deleting the avoidance branch reproduces exactly 18, at the same
coordinates. `hud-layout.mjs` is 45/45.

## ADR-169 — Elden Ring II: a quarter of the boss arena was a safe spot, and my probe was measuring a boss the game does not have

Date: 2026-08-05. Status: accepted.

ADR-168 gave the minions avoidance. The boss still steered with a bare `toBoss.normalize()`, and the
sanctum has had four solid pillars since ADR-165. So the same measurement, pointed at the boss.

It came back 0 of 41 unreachable — and that was wrong. `追擊試()` calls `chaseDirection`, which now
avoids obstacles; the boss's own code did not. **The probe was measuring a boss the game does not
have.** That is the failure mode this whole method exists to catch, and it caught it only because
the number was suspiciously clean for a rule with no avoidance in it.

With the boss wired to the same rule and the avoidance branch removed at the call site — so the
measurement is of the shipped rule minus one change — the real number is **10 of 41 positions the
boss can never reach**, and it stops at x = ±4.3 in every one of them: the inner face of the pillars
at (±9, −41) and (±9, −55). A quarter of the boss arena was somewhere you could stand and watch the
Crownless jog on the spot.

Unlike the minion case this is not a softlock — nothing requires the boss to reach you — which is
exactly why it would never have shown up in a playthrough that anybody bothered to finish. It is
just the climax of the game being free if you stand in the right place.

Boss now uses `chaseDirection` with `makeBlocked(staticBoxes, bossRadius)` and its own turn memory.
0 of 41, longest chase 9.4 s. `BOSS_REACH` is a named constant now rather than a `3.15` written in
the chase branch and nowhere else, so the probe and the game agree on when the boss stops running.

`hud-layout.mjs` 46/46, `npm test` 6/6, `hub.mjs` 96/96.

## ADR-170 — Elden Ring II: something was standing on both checkpoints

Date: 2026-08-05. Status: accepted.

Third consequence of ADR-165, after the 18 unreachable player positions and the boss's quarter-arena
safe spot. The graces — this game's only heal and its only checkpoints — are at (9, 15) and
(−52.5, −6.5). Measured: **both are inside a collider.**

(9, 15) was blocked *before today*. The hand-written obstacle box `addStaticBox([9, 0.75, 15], …)`
sat exactly on it, which is also why ADR-165's invisible-collider sweep found an obstacle there with
no model and dutifully placed a rock on it. The invisible thing standing on the checkpoint became a
visible rock standing on the checkpoint. Nothing errors when a checkpoint cannot be stood on; it
simply stops existing.

(−52.5, −6.5) I broke today, by giving the courtyard's `pillar_decorated` pieces colliders.

Both props moved, both graces left where they are — a checkpoint's position is a gameplay decision,
a decoration's is not. The rock goes to (15.5, 12); the courtyard pillars to (−53, ±9.6) with their
torches following, which also widens the gateway they frame.

The gate asserts every grace is standable, and putting the rock back on (9, 15) reproduces
`企唔到 ['9.1,15.1 prop']`.

Worth writing down and not acting on yet: `restart()` sets `encounterStage = 0`, so dying to the
boss replays all three waves. In a game with graces in it, that is the wrong shape — but changing
where a death sends you is a design decision with a difficulty curve attached (ADR-141 measured that
curve once already), not a defect to quietly patch at the end of a long session.

`hud-layout.mjs` 47/47.

## ADR-171 — Elden Ring II: the sanctum was the emptiest region, and there was exactly one asset left

Date: 2026-08-05. Status: accepted.

The handoff has said for several rounds that "the sanctum has nothing but the boss". Measured, that
is wrong in its reason and right in its conclusion. Counting ground-standing props over 1 m tall,
excluding the corridor wall runs: arena **0.96 per 100 m²** (15 items, 9 kinds), courtyard **0.55**
(5 items, 4 kinds), sanctum **0.48** (6 items, **2 kinds** — four pillars and two piles of rubble).
So the boss arena is the sparsest and by far the most repetitive, not empty.

The obvious fix — more pillars — is the one thing not allowed: Penny's standing instruction is not
to keep reusing the existing 3D assets. Counting every environment model against its uses in the
source, exactly one has shipped to players and never once appeared: `bridge-straight-pillar`.
ADR-161 tried it down the middle of the west corridor and rejected it, because the render showed the
deck sitting at head height so the player walks *under* it and the frame reads as a wall across the
path. That makes it wrong as a route and right as a **ruin**: placed behind the boss against the
north wall at (0, −63), you fight in front of it rather than through it.

It is solid, from the same "geometry below 2 m" rule as every other prop, and the gates decided
whether that was allowed: the boss reachability probe drops from 41 sample positions to 38 (three
now sit inside the ruin) and still reports **0 unreachable**. Sanctum density 0.48 → 0.56.

Worth stating plainly rather than papering over: with one unused asset in the repository and a
standing instruction against reusing the rest, the amount of *visual* expansion available without
new art is exactly one model. Further map growth needs either new assets or geometry that is not
model-based.

`hud-layout.mjs` 47/47, `npm test` 6/6, `hub.mjs` 96/96.

## ADR-172 — Elden Ring II: cover did nothing, because nothing ever checked whether it was in the way

Date: 2026-08-05. Status: accepted.

`findSweptAttackTarget` scored candidates on forward distance and lateral offset. `nearestEnemy`,
which picks what a projectile flies at, used squared distance. Neither asked whether anything stood
between. So every pillar, column, rock and wall in the game was **decoration as far as combat was
concerned** — you shoot through them, and the minions punch through them — and this held in both
directions, which is why nothing about it ever felt asymmetric enough to notice.

It is also the last piece of the ADR-165 thread. Those props only became solid at all this session;
before that you could walk through them too, so "does cover work" was not yet a question that had
a wrong answer.

`makeLineOfSight(boxes)` in `chase.ts` samples the segment at 0.3 m — under the thinnest wall's
0.42 m half-thickness, so nothing slips through a gap between samples. Swept melee targeting rejects
candidates without sight; `nearestEnemy(需要視線)` takes it as an argument and only the projectile
site passes `true`, because an arrow should not pass through a column but the camera should not snap
off a target the instant it steps behind one.

Both directions gated, and both mutations run: with sight never blocked, `隔住一件障礙物` fails on
all 27 props; with everything blocking, the open-ground control fails **and both ranged classes stop
being able to clear wave 1** — which is the part worth having, because it shows the seam the gate
reads and the code path the game runs are the same one, not two implementations that agree.

`hud-layout.mjs` 49/49.

## ADR-173 — Elden Ring II: last round I fixed one side of the wall, which is worse than fixing neither

Date: 2026-08-05. Status: accepted.

ADR-172's own text said the cover problem "held in both directions, which is why nothing about it
ever felt asymmetric enough to notice" — and then gave line of sight to the player's targeting only.
The two places an enemy damages you still asked one question: distance.

Measured against the shipped build: positions where an attacker and the player stand on opposite
sides of a real obstacle, close enough to be in reach — **minion 85/85, boss phase one 128/128,
phase two 196/196 still land.** Every single one. So after last round, cover was worth 100% to the
player and 0% to the enemies. That is a worse game than the one where neither side had it, because
it is the player's own advantage that hides the bug from them.

One rule now, `canLand(from, to, reach, sight)` in `chase.ts`, used at all three impact sites. For
a leap the origin is the landing point rather than the boss, matching the existing rule that the
leap measures distance from where it lands — you dodge the circle, not the monster — so the sight
line is cast from the same place the damage is.

Both directions gated over 612 sampled positions, with reaches read from the game rather than
written into the test. Making `canLand` ignore sight reproduces the walls at (22.4, 0), (21.9, 4.4)
and the rest; a control at the same distances in open ground fails if the rule ever refuses
everything.

`hud-layout.mjs` 51/51.

Also recorded: the container reverted the clone to `aa4569f` for the third time this session. Every
round was already pushed, so the fix was `git fetch` plus `npm ci`; nothing was lost. The habit of
committing and merging every round is what makes that a two-minute recovery.

## ADR-174 — Elden Ring II: the corridor ran twenty metres into the boss arena

Date: 2026-08-05. Status: accepted.

Now that cover means something, the boss's leap became worth measuring: it locks a landing point at
take-off, draws the telegraph there, and measures damage from there. Sampling every phase-two leap
pair in the sanctum, **56.6 % had something between the boss and the landing point.**

The examples pointed at `x = ±5.6` — the north hall's walls. `HALL.z0` was `BOSS_SPAWN_Z`, one
number doing two unrelated jobs: the boss stands at the sanctum's centre (0, −48), while the
sanctum's south gate is at `NORTH.cz + NORTH.r = −28`. So the corridor's two walls ran twenty metres
past the door and **cut the southern half of the boss arena in two**. Deriving `z0` from the gate
drops the blocked leaps to 32.8 %, opens ten more standable positions, and takes the boss's longest
chase across its own arena from **9.4 s to 2.9 s** — it had been walking around a wall that should
never have been there.

The remaining third is real cover, so the fix is the rule, not the map: `chooseBossMove` takes
`見到落點` and will not choose a leap it cannot see. A boss that leaps at a pillar puts the warning
circle somewhere the player cannot be standing and then wedges itself against the column.

The invariant is not "how long is the corridor". It is **a region may not contain walls that are not
its own ring** — put obstacles inside a room, not corridors. As a 40 ms Node check it immediately
found the same bug on the west side: `BRIDGE.x0` was a hand-written `-47` while the courtyard's east
edge is `COURT.cx + COURT.r = -43`, so the bridge railings poked four metres into the courtyard.
Both now derive from the region they end at. Both mutations name their own region: restoring
`BOSS_SPAWN_Z` reports `聖所: 牆 (-5.6, -35.2)`, restoring `-47` reports the courtyard pair.

`map.test.mjs` 4/4 in 40 ms, `hud-layout.mjs` 52/52.

## ADR-175 — Elden Ring II: Penny played it on a phone and named three things in one sentence

Date: 2026-08-05. Status: accepted.

「點解一入去視覺咁近，冇 zoom in zoom out 功能，控桿太左，麻煩參考深淵之橋個邊。」 Three defects, all
real, all measurable, none of which fifty-two gates had caught — because every one of them is about
what the game *feels* like to hold, and the whole suite had been measuring what it *is*.

**Too close on entry.** Measured at four viewports: the camera sits **2.73–2.84 m** behind the
player at spawn, against a designed 8.3 m. The player spawned at a hand-written `z = 17`, which is
5.35 m from the arena's south ring wall, and the camera needs `8.3 + 0.42 + 1.35 = 10.07` m of room
behind — so the occlusion logic clamped it to its 2.4 m floor on the very first frame. The spawn is
now `ARENA_RADIUS − CAMERA_CLEARANCE`, derived rather than written, and wave one's two revenants
moved with it to keep the opening distance. **2.73 → 8.84–9.13 m.** Separately, the camera used to
*drop* as it was squeezed (`2.2 + (allowed/distance) × 2.6`), so both numbers shrank together and
the character filled the frame; it now rises as it closes in, which helps everywhere near a wall,
not just at the spawn.

**No zoom.** 深淵之橋 has had `view.zoomBy` for rounds — clamped 0.7–1.7, wheel on desktop, pinch on
touch, with a 6 px dead zone so a trembling finger doesn't ratchet it. ER2 now has the same rule,
the same limits, and the same dead zone, applied to the follow distance.

**Stick too far left.** It was pinned to the layout: measured centre at **8.3 % and 10.5 % of screen
width** in the two landscape phone sizes, 20 px from the edge — a thumb has to leave the grip to
reach it. 深淵之橋's answer is that the stick has no position: touch anywhere in the left 55 % and it
appears under your finger. ER2 does that now, with the same 52 px throw.

Two defects came out of that last change and were caught by re-running everything. Taking the stick
out of the flex flow (`position: fixed`) left `justify-content: space-between` with one child, which
threw the three action buttons to the **left** — into the stick zone, so tapping ATTACK would have
opened the stick. And `setPointerCapture` throws when there is no live pointer, which aborted the
whole handler; 深淵之橋 already wraps that call in a `try` for exactly this reason, and now so does
this.

One of the new gates failed for my own reasons before it failed for the game's: the mobile styles
live behind `@media (max-width: 760px), (pointer: coarse)`, and the suite's page has neither, so
`.touch-stick` had no `position: fixed` and the gate reported the stick appearing at (0, 0). It runs
on a `hasTouch` context now.

All three mutations reproduce their measurement: spawn back to 17 gives 2.69–2.80 m at five sizes,
an unclamped zoom gives 2.81 and 0.21, a pinned stick reports the same offset at every touch point.
`hud-layout.mjs` 60/60.

## ADR-176 — Elden Ring II: the character turned at 3587 degrees a second

Date: 2026-08-05. Status: accepted.

"Robotic" sounds like a taste judgement until you ask what a robot does that a body cannot: it
changes state instantly. Two numbers say it, and both were measured inside the game rather than
guessed — peak turn rate and peak locomotion acceleration, in radians and metres per **motion**
second so frame rate cannot flatter them.

**62.6 rad/s — 3587°/s — and 250 m/s², about 25 g.** The character spun ten times faster than any
body turns and reached 12.5 m/s in a single clamped tick. `player.rotation` was assigned
`Math.atan2(movement.x, movement.z)` outright and `playerBody.velocity` was assigned `direction ×
speed` outright. Nothing in between.

`src/motion.ts` holds the two rules, pure, no three.js and no cannon-es, so Node tests them in
milliseconds: `turnToward` (capped, shortest-arc — 350° to 10° turns forward through 20°) and
`approachSpeed` (separate accel and decel limits, because stopping slower than starting is what
skating feels like). Player turn is 9 rad/s (516°/s) and acceleration 70 m/s², reaching full speed in
0.18 s. The turn cap is applied to `player.rotation` itself, not to the model, because the swing
test reads that same value — splitting them is how the attack arc starts lying (ADR-151).

Enemies got turn rates too, and slower ones: 5.2 rad/s for revenants, 3.4 for the boss. They used to
face you exactly every frame, which means **getting behind something was not a move that existed**.

Animation playback now follows real ground speed instead of a constant `2.15`, so the first strides
of a move no longer run at full cadence while the body is still accelerating.

Three gates in the existing suite went red, and each was worth the trip:

- The dodge gate (ADR-159) measured "how fast do you die" over a fixed number of real seconds. Run
  twice on identical code it read **2.00× and 1.74×** against a 2× threshold — the line sat inside
  the noise. It now runs both conditions for the same 7 s of motion time and compares damage taken:
  **60 % standing, 20 % rolling, a clean 3×.**
- The attack-cadence gate read zero attacks. Not the game: **my new motion gate drove the player
  around the shared page for sixteen seconds and left them dead**, so everything downstream measured
  a corpse. It has its own page now.
- Acceleration at 55 m/s² was slow enough to cost the dodge gate its margin; 70 keeps the ramp and
  the evasion.

Verified by mutation: making both helpers return their targets outright reproduces **62.6 rad/s and
250 m/s² exactly** — the numbers from before the fix, off the same instrument. `hud-layout.mjs`
62/62, `npm test` 10/10.

Not done: attack feel itself — no lunge, no hit-stop, no impact recoil. That is the next round.
