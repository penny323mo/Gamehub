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
