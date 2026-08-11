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

## ADR-177 — Elden Ring II: three known causes of background shimmer, and an instrument that cannot see it

Date: 2026-08-05. Status: accepted.

Penny: 背景有抖動/閃爍. **I could not reproduce it here, and the reason is worth stating plainly:
flicker is a per-frame phenomenon and this environment renders about three frames a second.** My
capture loop samples every 420 ms — 2.4 Hz against a 60 Hz effect. Any "it looks fine to me" from
this box would be an artefact of the instrument, not a finding.

What the instrument did produce was a false lead. A per-pixel "changes and changes back" map over
six frames put a hot cell at **67 %** — which looked like textbook z-fighting until I looked at the
actual screenshot: that cell is where **the two revenants are standing**, and the alternation is
their idle animation. The measurement was working; it was measuring characters.

The wall hypothesis it suggested was tested anyway and refuted by measurement: ADR-166 deliberately
put the decorative `wall.glb` inner face exactly on the collider plane, which makes those two
surfaces coplanar, so I gave the instanced wall boxes a polygon offset — the hot cell went 67 → 58,
i.e. **not the cause**. The offset stays, because coplanar surfaces are wrong regardless.

So the round is explicit about its epistemic status: three causes that are known to produce exactly
this symptom, fixed from cause rather than from measurement here.

- **The shadow camera slid by sub-texel amounts every frame.** The directional light follows the
  player (it has to; a fixed frustum means no shadows once you leave the arena), but nothing
  quantised that motion, so every shadow edge in the scene resamples each frame and the ground
  crawls. `snapShadowTarget` projects the target onto the light's own basis, rounds to whole texels
  (52 m / 2048 = 25.4 mm, derived from the shadow frustum rather than written down), and projects
  back. Node-tested: forty steps of one-eighth of a texel now move the target on fewer than 35 % of
  frames instead of every one, and never further than a texel and a half from the true position.
- **`near` was 0.1 against a `far` of 180.** The ground and the cobbled path are 15 mm apart; at
  1800:1 on a 16-bit depth buffer — which is what a lot of phones give you — that gap is well inside
  the noise. The camera occlusion logic already guarantees nothing renders closer than 2.4 m, so
  `near` is 0.6 now: six times the precision, nothing clipped.
- The coplanar wall surfaces above.

`npm test` 11/11, `hud-layout.mjs` 62/62. Removing the texel rounding turns the new test red.

If it still shimmers, the thing I need is which surface: ground, walls, sky, or the shadows moving
across them.

## ADR-199 — Tower: the map is a valley cell graph, not a rectangular board

Date: 2026-08-09. Status: accepted.

The Tower board was visually and structurally one 20 × 12 slab even though gameplay only cared about
the 31-cell road. The replacement keeps the stable coordinate system, route length and eight turns,
but defines an asymmetric valley in `core/mapLayout.ts`: each cell has one authoritative
`exists` / `buildable` / `terrain` / `pathIndex` record. Scene construction, economy, picking,
camera and lighting consume that interface. Do not recreate private rectangular masks in those
consumers.

The emerald-rift layout has **148 active cells instead of 240**, one connected land mass, a blocked
outer terrain shell, one river crossed by a real bridge, and **60 eight-neighbour build positions**
next to the route. Those numbers deliberately preserve the previous route length and almost all of
its 62 adjacent positions while changing the silhouette and rhythm; future visual themes may replace
terrain models without quietly changing build rules.

Geometry and gameplay share `SURFACE_Y = 0.2`. Towers, enemies, range rings, the picking plane and
projectile origins use it, because the GLB tiles are 0.2 high. Endpoint buildings are anchored just
outside the first and last path cells; Kenney wall and tower pieces have off-centre authored pivots,
so modular placement centres their actual bounds before rotation or stacking. Weapon assets point
along local -Z while aiming uses +Z, so the model receives a one-time π yaw rather than changing the
aiming maths.

The contract is measured rather than inferred: `map.mjs` guards land connectivity and capacity,
`map-browser.mjs` guards true rendered cell count, blocked river/void taps and mobile framing,
`units.mjs` guards surface height/footprint/evolved silhouettes, and `gateway.mjs` guards lateral
doors, outside anchors, roof clearance and non-white spawn flash.

## ADR-239 — 一粒滑鼠撳唔郁嘅掣，同一粒冇畫出嚟嘅掣分別唔大

- Date: 2026-08-11
- Status: accepted

呢一輪本來想量「關 tab／返 Game Hub 之前有冇交代」。量完先發現嗰條線**冇病可以修**：
局中每一條離開路都擺喺暫停版／選單版（Snake 個 🏠 喺 PAUSED 面板入面、Royale 個 🏳️
投降照計一場敗仗入賬），即係玩家撳嗰陣本來就係有意離開。**唔會為一條量唔到病嘅線
砌一把守唔到嘢嘅尺。** 但量嗰陣撞到另一樣嘢：Snake 個暫停面板寫住「按 **空格鍵** 繼續」。

### 一、你想停嗰陣，停唔停到

`hub-away` 守嘅係**你切走咗，佢有冇自己停**。冇人問過相反嗰條。一量就見到同一個形狀：

    Tower Defense    `#pause-btn` 44×44                        ✓
    Racing Car 3D    `#pause-btn` 44×44                        ✓
    Neon Snake       `isPaused` 得空白鍵／P 撳到                 ✗
    深淵之橋 MOBA     `state.running` 得 `visibilitychange` 撳到  ✗

**機制有，路冇。** 兩隻都唔係「未做」——係做咗一半：Snake 連暫停畫面同「▶ 繼續」都有,
但入去嗰道門淨係得鍵盤；MOBA 個 `state.running` 由頭到尾只有切走個 tab 撳得到。手機
玩家想停一停（有人叫你、要落車），一條路都冇。呢個同 ADR-238 係同一句：**個功能存在
唔等於玩家用到。**

Snake 加咗一粒 45×45 嘅 ⏸／▶ 落 header，鍵盤同個掣行同一個 `togglePause()`（兩份各自
寫，遲早有一份跟唔上）。條 `isRunning` 閘順手封咗個舊坑：開場果版撳空白鍵會令
`isPaused` 變 true，跟住撳 Enter 開波（嗰行淨係設 `isRunning`），局面一開就凍住。

**MOBA 呢半做咗，但唔出街。** 三個位擺一粒新掣，**三個都撞**：⚙ 下面撞打直版兵線
總覽（由 y=96 起企喺左邊）；⚙ 隔籬撞條頂欄（SE 打直 375 闊，個 gap 得 33px）；擺入
條頂欄就令佢由 26 變 44 高，打橫又撞返兵線總覽。**窄畫面根本冇一個空角**——最後改成
「開設定＝暫停」（你調緊畫質，場波本來就唔應該照打），三條停低嘅路（切走、掉 GL
context、玩家自己撳）全部經同一個 `續波()`（唔係嘅話你撳咗暫停、鎖一鎖屏，
`onContextRestored` 就會幫你續返，而你根本冇撳過繼續）。

跟住條 `普攻會真係揮動作` 開始間歇性紅：**baseline 兩跑 196/196，改完六跑出咗八次紅**
（0、1、2、1、2、2——連紅嗰條都跳嚟跳去）。唔係我改咗 sim／view：報告寫住
`鎖差 -110`，即係 `u.rig.time` 已經行過咗成一百秒——條 check 喺 `page.evaluate` 裏面
自己行 `s.step`／`v.update` 嘅同時，**背景嗰個 rAF 主迴圈一路都喺度行同一個 rig**。
即係佢本身就同主迴圈搶緊，郁一郁幀時序就撞中。呢個係條 check 自己嘅 race，
但係我撩到佢。

**未查清楚就唔推。** 一個令現有 gate 唔穩嘅改動，同一個 bug 分別唔大——尤其當佢專門
去踩一條「Penny 親口報過睇唔到攻擊動作」嘅檢查。MOBA 嗰半整份還原（連 `assets-30`
bump），`hub-pause` 入面寫低佢係**一個講明咗嘅缺口**（`未做嘅`），唔係一個唔知嘅病：
條線照量佢、照報「冇暫停控制」，但唔會因為一個已知缺口日日紅。

### 二、真兇：Tower HUD 入面**每一粒掣**，用滑鼠都撳唔郁

把尺一開就報 Tower「撳完照行」。查落去：個掣收到 `pointerdown`、`mousedown`，**跟住
乜都冇**——`mouseup` 同 `click` 永遠唔嚟。用 `el.click()` 就停到，用 tap 就停到，
**得真滑鼠唔得**。

`#hud` 係拖得郁嘅面板（`makeDraggable`），佢喺 `pointerdown` 就 `setPointerCapture`。
指標一畀 `#hud` 攞咗，滑鼠嘅 `mouseup`／`click` 就全部改派去 `#hud`——`click` 於是
喺 `#hud` 度響，永遠唔會喺你撳嗰粒掣度響。掃埋其餘幾粒：**`#skip-prep-btn`、
`#pause-btn`、`#speed-btn`、`#sound-btn` 四粒全部係死嘅。**

點解一直冇人知：**觸控唔受影響**（touch 派生嘅相容滑鼠事件唔會畀 pointer capture
改派），而 Tower 自己啲 test 唔係 `tap()` 就係直接 `el.click()`——**兩種寫法都繞過咗
真正出事嗰條路。** 一粒滑鼠撳唔郁嘅掣，同一粒冇畫出嚟嘅掣分別唔大。

Capture 搬入 `beginDrag()`：佢本來就係為咗拖動途中指標飄出面板都收到 move，**唔係
為咗撳低嗰一下**。`pointermove`／`pointerup` 搬去 `window`——冇咗 capture，指標喺
hold 未夠鐘之前飄出面板就唔會再派事件畀 `el`，個 hold timer 會活過頭、放手亦唔會
重設 `pointerId`；captured 事件本身一樣會由 `el` 冒泡上 `window`，所以一對 listener
兩個階段都掂。

### 三、把尺（`tests/hub-pause.mjs`，6 條）

逐隻寫明個鐘讀邊個 seam——**「畫面有冇郁」分唔開停冇停**（Tower 個暫停畫面自己會呼吸,
Snake 個霓虹背景一直閃）。Snake 冇 seam，所以加咗 `window.__snake.格數()`（`gameTick`
真係行咗一格先加），同 `__gomoku`／`__big2Run` 一樣淨係轉發，冇自己嘅計算。

- 撳之前個鐘要**真係行緊**（冇呢個對照，一隻卡死咗嘅遊戲會喺下面兩條度全綠）
- 打緊嗰陣要有一個見得到嘅暫停控制、44×44、撳落去模擬要真係停、再撳返要行返

兩個把尺自己嘅錯，兩個都係舊坑：

1. **「續」揀咗第一個中嘅元素。** Racing Car 停低之後另開一版 `#screen-pause`，續嗰個
   係 `#resume-btn`，但 DOM 排先嗰個仍然係 `#pause-btn`（撳落去 `pauseRace()` 見到
   `running === false` 就返 false，乜都唔發生）。報咗「Racing 續唔返」——**量緊嘅係我
   揀錯咗嘅元素，唔係隻遊戲。** ADR-238 踩過同一個坑。改成逐個試到個鐘行返為止。
2. **Racing 撳完「開始」仲有一段開賽倒數**，圈鐘停喺 0:00.00；夠唔夠鐘純粹睇部機幾快。
   **一條靠彩數過嘅 gate 同冇 gate 分別唔大**——driver 等到個鐘真係郁咗先量，
   而條對照仍然獨立驗一次，等唔到照樣紅。

Mutation：capture 搬返落 `pointerdown` → 只叫得出 Tower「撳完照行」；拆走 MOBA 個暫停
入口（嗰陣佢仲喺樹上）→ 只叫得出 MOBA「冇暫停控制」。

## ADR-238 — 一個冇人知嘅 Continue，同冇 Continue 分別唔大

Date: 2026-08-11. Status: accepted.

ADR-234–237 令五隻遊戲續得返上一局。但**個功能存在唔等於玩家知**。

玩家撳「返回選單」嗰一刻，就係遊戲同你講「你嗰局仲喺度」嘅唯一機會——
再遲就係下次開頁，而好多人根本唔會再開。

### 量到咩

打到一半撳「返回選單」，個「繼續上一局」掣即刻見唔見到：

| 遊戲 | 見唔見到 |
|---|---|
| Gomoku | ✓ |
| Xiangqi AI | ✓ |
| **Big Two** | **✗** |
| Dou Dizhu | ✓ |

**得 Big Two 一隻漏咗接。** 我喺 ADR-236 寫嗰陣，`更新繼續掣()` 只喺開頁嗰陣
叫過一次，冇喺 `setMode('landing')` 度叫——即係你撳完「退出對局」返到選單,
個掣唔出，玩家會以為局冇咗。其餘三隻同款遊戲都有接。

**同一批改動、同一個 pattern、四隻遊戲，一隻漏咗。** 呢種漏冇 gate 就永遠
唔會發現——因為佢唔會掟錯，亦唔會令任何現有 check 報紅。

### 把尺

`hub-progress` 加第四條：**打到一半返選單，「繼續上一局」要即刻見到。**
driver 加兩個欄：`離`（局中嗰個返選單掣）同 `繼續掣`。

Tower **特登唔掃**：佢個 Home 掣係直接離開個頁去 hub，冇「返自己選單」呢條路;
佢返嚟嗰陣個 `#continue-run` 由 `tower/tests/flow.mjs` 守住。**例外連理由一齊
寫入把尺。**

### 個 selector 又錯一次

第一版寫 `離: '#gomoku-back-btn'`——timeout。嗰個係**開場畫面**嗰個「返回遊戲
大廳」，唔係局中嗰個「返回選單」（後者喺 `#ai-controls` 入面，冇 id，
要靠 `onclick` 認）。

同一個形狀今日已經出現過幾次：**個名似，唔代表係同一件嘢。** 探路嗰陣我用
`'#gomoku-back-btn, [onclick*="backToLanding"]'` 兩個一齊試，後備嗰個中咗,
所以探路報綠——**一個「試幾個 selector，邊個中就用邊個」嘅寫法，會令你以為
自己量緊第一個。**

### 驗證

`hub-progress` **4/4（十隻）**、`hub-tabs` 4/4、`hub-touch` 5/5、`hub-keyboard` 3/3、
`hub-read` 3/3、`hub` 96/96。突變（拆走 Big Two 嗰句 `更新繼續掣()`）報紅，
而且淨係叫 Big Two。

## ADR-237 — Dou Dizhu 補返 Continue：存檔要分得清「叫緊」同「打緊」

Date: 2026-08-10. Status: accepted.

「打到一半走咗仲喺度」呢條線嘅最後一隻。鬥地主同大老二同族，但**多一層**：
叫地主階段。所以個存檔唔可以淨係「一疊牌 ＋ 輪到邊個」——要分得清你係
**叫緊**定**打緊**。

`phase` 存住，兩個階段各自嘅嘢都要存：

- **叫緊**：`bid`（邊個開始、輪到邊個、邊個叫咗、搶咗幾多次、邊個 pass 咗）;
- **打緊**：`landlord`、`bottom`（三張底牌，畫面要出）、`lastPlay`、`passes`。

三家手牌全部存（連兩個電腦）——唔存嘅話續返之後電腦會攞新牌，你面前嗰局
就變咗另一局。

`lastPlay.eval` **唔存**（`evalHand()` 計得返；存住就兩份真相，改咗規則之後
舊存檔會靜靜雞用返舊嗰套）。`state.ui` 都唔存：入面個 `selected` 係 `Set`,
JSON 化唔到，而且「揀緊邊幾張」本來就唔應該跨 session。

### 存喺邊：叫牌階段冇「輪返你」嗰個停點

大老二／棋類都有一個乾淨嘅停點——電腦一輪行完，輪返你嗰刻。鬥地主嘅
**叫牌階段冇**：三家輪流叫，中間可能連續兩個 CPU，而且叫完可能即刻入局。
所以叫牌階段係**每一步都存**（`advanceBid()` 尾）。一手牌都未出過，payload 細,
寫得起。打牌階段就照舊：人出完／人 pass 完／電腦一輪行完輪返你。

### 個 driver：叫緊本身就係一個值得記嘅局面

driver 冇試打到出牌先量。**叫緊你已經睇咗手牌、已經做緊決定**——嗰個就係
一個值得記嘅局面。而且存檔嘅重點正正係「叫緊」同「打緊」分得清,
量叫牌階段就係量嗰個分別。

叫／搶／唔叫三個掣邊個撳得就撳邊個——**三個都係真嘅玩家動作**，唔使喺測試
度揀「最合理」嗰個（嗰樣等於喺測試度抄一次策略）。

### 驗證

`hub-progress` **3/3（十隻）**、`hub-tabs` 4/4、`hub-touch` 5/5、`hub-keyboard` 3/3、
`hub-read` 3/3、`hub-cdn` 3/3、`hub` 96/96。

突變（`續局()` 唔倒返三家手牌）報紅，四樣證據入面三樣一齊倒
（`對得上: false`、`量: 0`、`畫面證據: 0`）。

### 呢條線做完

「打到一半走咗仲喺度」由 Tower 一隻擴到**五隻**：Tower（本來就有）、
Gomoku、Xiangqi、Big Two、Dou Dizhu。`hub-progress` 三條 check 守十隻遊戲。

其餘幾隻唔使：Snake／Racing Car／Royale／MOBA／Penny Crush 存嘅係**累積成績**
（分數榜／最快圈／獎盃／揀邊個英雄／最高分），佢哋冇「一局打到一半」呢個
概念，或者一局短到唔值得存。Snooker 3D 冇單機局面可以存。

## ADR-236 — Big Two 補返 Continue，同埋一條「每加一隻遊戲就要改一次」嘅 check

Date: 2026-08-10. Status: accepted.

棋類兩隻做完（ADR-234/235），輪到牌類。牌類同棋類唔同：**唔可以淨係存個盤**。

存乜：四家手牌（**包括電腦嗰三家**——唔存嘅話續返之後電腦會攞新牌，即係
你面前嗰局變咗另一局）、輪到邊個、檯面嗰手同邊個出、邊個 pass 咗、要唔要
含方塊三。

`table.eval` **唔存**：佢係 `evalHand()` 計出嚟嘅。存住就有兩份真相，而且改咗
`evalHand` 之後，舊存檔會靜靜雞用返舊規則。續返嗰陣重新計。

存喺三個位：人出完牌／人 pass 完／電腦一輪行完輪返你（`step()` 見到 `idx === 0`
就停嗰刻——嗰個正正係一個穩定嘅局面）。收場清、撳「對戰電腦」開新局清。

### 個 driver：十三張牌疊住，撳唔到

第一版撳手牌第一張——timeout。牌係 `<button>` 冇錯，但十三張互相疊住，
第一張嘅中心點畀隔籬張遮住，Playwright 等佢「收得到 pointer event」等到死。

解法唔係 `force: true`（嗰樣等於承認自己撳唔中但照撳），而係**用返遊戲自己個
「提示」掣**：佢會揀一手合法牌落 `ui.selected`，跟住撳「出牌」。提示揀唔到
就撳 pass——一樣係一個真嘅玩家動作。

**唔喺測試度抄一次大老二規則**（開局要含方塊三、之後要壓得住檯面嗰手）——
抄一次就係自己驗自己。

### 條 check 本身要改：欄名唔可以逐隻遊戲改

`hub-progress` 第三條 check（ADR-234 加嘅）本來逐隻遊戲讀自己嘅欄名：
Gomoku 報 `盤上幾多隻`／`棋同空差幾多`，Xiangqi 報 `盤對得上`／`同開局差幾多`,
Big Two 報 `局面對得上`／`手牌張數`。

加到第三隻就撞線：Big Two 冇 `盤上幾多隻`，而條 check 寫住 `v.續到.盤上幾多隻 > 0`
——`undefined > 0` 係 false，**明明啱嘅都報紅**。

**一條要跟住遊戲改名嘅 check，每加一隻遊戲就要改一次，遲早有一次改漏。**
所以統一咗形狀，四樣嘢逐隻都要報：

- `畫面`——真係切到局中；
- `對得上`——**遊戲自己嘅狀態等於存檔**（唔係「存檔仲喺度」）；
- `量`——局面真係有嘢（盤上幾多隻／四家合共幾多張）；
- `畫面證據`——**畫得出嚟**（2D canvas 比像素／WebGL 影相比／牌類數 DOM 上真係
  畫咗幾多張）。

三隻遊戲三種畫面證據，但同一個欄名——條 check 唔使識邊隻係邊隻。

突變（`續局()` 唔倒返四家手牌）報紅，而且四樣入面三樣一齊倒
（`對得上: false`、`量: 0`、`畫面證據: 0`）。

### 驗證

`hub-progress` **3/3**（九隻）、`hub-tabs` 4/4、`hub-touch` 5/5、`hub-keyboard` 3/3、
`hub-read` 3/3、`hub-cdn` 3/3、`hub` 96/96。

### 仲爭

Dou Dizhu。佢同 Big Two 同族但多一層：**叫地主階段**同**地主嗰三張底牌**,
存檔要分得清「叫緊」同「打緊」。做法照抄呢度，但個 state 要自己睇過。

## ADR-235 — Xiangqi 都補返 Continue：一個 3D 盤要換兩次證據先量得到

Date: 2026-08-10. Status: accepted.

ADR-234 幫 Gomoku 補咗「打到一半走咗仲喺度」，同一輪量到 Xiangqi 一樣冇。
呢一輪照抄嗰個做法搬過去。

存乜：成個盤（`Int8Array` 攤做 array）、輪到邊個、難度、第幾手。引擎冇跨局
狀態，呢幾樣就砌返到個局面。每行一步就存；收場清；開新局清。覆蓋式
（同 Tower checkpoint、Gomoku 一樣，喺 ADR-232 個「特登 last-write-wins」名單）。

`history` **唔存**——悔棋唔跨 session。存半份會扮到你悔得返，撳落去先發現冇。
唔如老實出返個空嘅。

### 兩個坑，兩個都係「用平面思維去度一個 3D 嘢」

1. **撳唔到棋。** 第一版用 `(c + 0.5) / 9` 咁計螢幕座標——但個盤係 three.js，
   要經相機投影。撳咗兩下乜都冇發生。
   解法唔係自己補返條投影公式，而係**反用遊戲自己嗰個 `Render.hitTest(px, py)`**
   （螢幕點 → 格）：喺 canvas 上面撒 80×80 格網，逐點問佢係邊格，砌返一張
   「格 → 螢幕點」嘅表。用返佢自己條路，唔使我估幾何。

   順帶：driver 行邊步棋**寫死**紅炮平中（7,1 → 7,4），唔用
   `generateLegalMoves()[0]`——嗰個次序係引擎嘅內部決定，今日啱唔代表聽日啱,
   **driver 唔應該跟住引擎嘅實作漂移**。

2. **量唔到畫面。** WebGL canvas 預設冇 `preserveDrawingBuffer`，`getImageData`
   讀返嚟全零——所以「棋格 vs 空格」嘅色差係 0，同「冇畫」分唔開。
   第二版改用 Playwright 影相（佢影得到 WebGL），但揀錯咗對照：「撳 Continue
   之前 vs 之後」——撳之前仲喺選單，`#board` 隱藏住，直接 timeout；就算影到,
   選單同棋盤梗係唔同，一樣係冇用嘅對照。
   第三版揀啱：**續返嘅局面 vs 開局盤**。撳完 Continue 影一張，再撳「重新開始」
   影多張，兩張一樣就代表佢根本冇畫返你嗰局。

### 證據要兩條腿

`續驗` 而家報兩樣：

- **盤對得上**：遊戲自己個 `board`（由新 seam `window.__xiangqiRun.現盤()` 攞）
  逐格等於存檔個 board，而且輪到嘅人都一樣。**唔可以讀返 storage 當證據**
  ——嗰樣淨係證明「存檔仲喺度」。
- **同開局差幾多**：影相比較，證明真係畫咗出嚟。

突變（`續局()` 唔倒返個盤）**兩條腿一齊報紅**：`盤對得上: false`、
`同開局差幾多: 0`。兩個獨立證據指住同一件事，唔係一條靠彩數。

### 驗證

`hub-progress` **3/3**（八隻）、`hub-tabs` 4/4、`hub-touch` 5/5、`hub-keyboard` 3/3、
`hub-read` 3/3、`hub-cdn` 3/3、`hub` 96/96。

### 仲爭

Big Two／Dou Dizhu。兩隻都係牌類，局面狀態同棋類唔同（手牌係隱藏資訊、
叫地主／出牌階段、AI 手上嗰疊都要一齊存）——**唔可以照抄呢兩隻嘅做法**,
要逐隻自己諗清楚存乜。量度同形狀寫喺 ADR-234。

## ADR-234 — 落咗三十手，一 refresh 就冇晒：Gomoku 補返 Continue

Date: 2026-08-10. Status: accepted.

上一輪留低嘅問題：四隻牌／棋類乜都唔記得，**係漏咗定係設計？**

### 先答個問題

「打完一局記唔記得成績」同「打到一半走咗算唔算數」係兩條唔同嘅問題。
第一條可以答「一局過，唔使記」；第二條唔可以。

實測（人機模式落幾手，然後 refresh）：

| 遊戲 | refresh 之後 | 存低咗 | 有冇提示 |
|---|---|---|---|
| Gomoku | **返咗選單** | 得 `gomoku_clientId`（線上身分） | 冇 |
| Big Two | **返咗選單** | 冇 | 冇 |
| Dou Dizhu | **返咗選單** | 冇 | 冇 |
| Xiangqi AI | **返咗選單** | 得 `xiangqi_clientId` | 冇 |

四隻一樣：局冇咗，冇存過，亦冇任何交代。

而**手機上面呢個唔係「你自己揀走」**：切走 app 之後系統回收咗個 tab，返嚟
就係咁。你落咗三十手對 Hard AI，冇咗就冇咗。

呢個 repo 早就答過呢條問題——Tower 有 checkpoint ＋ 一個**見得到嘅** Continue。
所以答案係：漏咗。

### 做咗邊隻，點解

揀咗 **Gomoku**——四隻入面狀態最深（一局可以落幾十手，對 Hard AI 好花時間），
而且狀態最簡單（15×15 個格 ＋ 輪到邊個 ＋ 難度，AI 本身冇狀態）。

- 存喺 `gomoku_ai_run_v1`，**每落一手就存**（玩家嗰手同 AI 嗰手都存）
  ——唔等收場，因為玩家係隨時切走 app 嘅。
- **覆蓋式，唔用 ADR-232 個 `改存檔()`**：呢個係「呢部機呢一局」嘅進度，
  後面嗰個就係最新，同 Tower 個 checkpoint 一樣喺「特登 last-write-wins」名單。
- 讀返嗰陣**逐格驗**（15×15、每格只可以係 null／black／white、輪到嘅人要合法、
  空盤唔算）——**壞存檔要當冇**，唔可以令個掣撳落去乜都唔發生。
- 出個「繼續上一局」掣，**唔會靜靜雞幫你續**（同 Tower 一樣）。撳「對 AI 對戰」
  ＝開新局，所以嗰條路會清走舊存檔；由局中返選單**唔算放棄**，個掣即刻出返。
- 存嗰陣可能啱啱輪到 AI——續返之後要叫佢行，否則個盤永遠等你落一隻唔到你落嘅棋。

### 把尺：「留得住」唔等於「返得到」

`hub-progress.mjs` 加咗第三條 check：有 Continue 嘅遊戲，**撳落去要真係開返
上一局**。一個續唔返嘅存檔，對玩家嚟講同冇存冇分別。

**條 check 量咗兩個版先分得開兩樣嘢：**

1. 第一版數成塊 canvas 有幾多非背景像素——量到 301。突變（唔畫返啲棋）
   照樣量到 300：嗰 300 個係**格線**，畫盤嗰陣一定有。
   **一條分唔開「格線」同「棋子」嘅 check 係壞 check。**
2. 改成拎「有棋嗰格」同「空格」比：同一條公式算兩個中心點，色差要 > 30。
   公式算錯嘅話兩邊都錯 → 報紅。**錯要向紅嗰邊錯。**

順帶發現第一次嘅突變**根本冇突變到**：`createBoardUI` 入面 `resizeGomokuBoard()`
已經 `drawBoard()`，而 `drawBoard` 係由 `board` 整幅畫返——我喺 `continueGame`
入面逐格叫 `placeStoneUI` 係多餘嘅（而佢自己都係叫 `drawBoard()`，即係畫足
226 次同一幅嘢）。剷咗。真正嘅突變係「`續局()` 唔倒返個盤」，嗰個報紅。

要量遊戲自己嘅狀態就要開 seam：`let board` 喺 classic script 入面唔會上
`window`。加咗 `window.__gomoku`（同 `__TD`／`__racer`／`__pennyCrush` 一致）
——**讀返 storage 就變成「存檔仲喺度」嘅同義詞**，而條 check 想問嘅係
「局真係開返咗未」。

### 其餘三隻

Big Two／Dou Dizhu／Xiangqi 同一個形狀，量度擺喺上面。冇喺呢一輪一齊做,
因為每隻嘅局面狀態都唔同（一手牌／叫地主階段／中國象棋盤 ＋ 將軍狀態），
逐隻都要自己一輪。**做嘅時候可以照抄呢度：存邊啲、幾時存、點驗、Continue
點出。**

### 驗證

`hub-progress` **3/3**（七隻）、`hub-tabs` 4/4、`hub-touch` 5/5、`hub-keyboard` 3/3、
`hub-read` 3/3、`hub-storage` 2/2、`hub` 96/96。

## ADR-233 — 十三隻遊戲一個 origin：key 冇撞，但捉到一隻乜都唔記得嘅

Date: 2026-08-10. Status: accepted.

上一輪寫低嘅接手位：**同一個 origin 開兩隻遊戲，storage key 撞唔撞。**
GitHub Pages 上面成個 hub 係一個 origin，`localStorage` 係逐 origin 分嘅,
唔係逐個資料夾——十三隻遊戲全部擠喺同一個 namespace。

### 量法要兩層，因為第一層掃唔夠

**運行時**（逐隻開、行 driver、dump key）：`Tower Defense` `Neon Snake`
`Empire Royale` `MOBA` `Racing Car` 五隻寫低咗 key，冇一個撞。但**其餘七隻
一個 key 都冇寫**——即係我未去到佢哋會存嘢嗰一刻，**掃唔夠**。

**靜態**（掃源碼，連 `const X = 'lit'` 一齊解）：每隻遊戲都有自己前綴
（`gomoku_` `big2_` `doudizhu_` `snooker_` `tower-defense-` `snake-game-`
`royale-` `moba-` `racer-` `xiangqi_`），**零撞**。共用層唯一嗰個 key 係
`safe-storage.js` 嘅 `__gh_probe__`——寫完即刻刪。

**結論：冇嘢要修。** 但兩層一齊做先得出呢個結論；淨靠運行時嗰層會漏七隻，
淨靠靜態嗰層會漏計算出嚟嘅 key。

### 真正捉到嘅嘢：Penny Crush 乜都唔記得

掃嘅時候見到 **Penny Crush 同 Hub launcher 完全冇掂過 storage**。Hub 冇嘢好記
係啱嘅；但 Penny Crush 有分數。

而呢個 hub 入面**每一隻有分數嘅遊戲都記得你嘅成績**——Snake 記統計同分數榜、
Racing Car 記最快圈、Royale 記獎盃、Tower 記波與波之間嘅進度。得 Penny Crush
一隻一 refresh 就由零開始。**答案本身已經喺屋企，得一隻遊戲冇跟**（同 ADR-211
Draco 一模一樣嘅形狀）。

加咗逐個板大細分開記嘅最高分（`penny-crush-best-v1`）：

- **喺 `updateScore` 破紀錄嗰刻就寫**，唔等收場——呢隻遊戲根本冇「遊戲結束」,
  玩家係直接閂 tab 走人嘅。只喺真係破紀錄先寫，唔會每次得分都寫盤。
- 用返 ADR-232 個 `改存檔()`（寫之前先讀返存檔），所以兩個 tab 開住都唔會
  互相食。而且係 `max` 唔係覆蓋，高嗰個一定留得住。
- 順手補返 `safe-storage.js`（無痕模式下唔好連遊戲都開唔到）。

### 個 driver 第一版係擲毫

`hub-progress.mjs` 加咗 Penny Crush。第一版 driver 靠**隨機撳兩格等消**
——突變測試嗰次連對照（`到咗`）都一齊紅，即係嗰次根本冇撳中。**一條靠彩數
過嘅 gate 同冇 gate 分別唔大**（同 ADR-232 個 seed、ADR-222 個鏡頭係同一種）。

改成用遊戲自己個格陣計出一步真係消得到嘅棋，之後**照樣撳真嗰兩格**
——唔係喺測試度叫 `swapTiles()`，嗰樣等於自己驗自己。

要咁做就要開個 seam：`const PennyCrush = …` 喺 classic script 入面係 script
scope，**唔會上 `window`**（`var` 同函數聲明先會）。加咗 `window.__pennyCrush`,
同 Tower `__TD`／Racing Car `__racer`／Royale `__royale` 一致。

改完之後突變分得清：對照過，淨係「留唔留得住」報紅，而且叫得出 Penny Crush。

### 驗證

`hub-progress` 2/2（六隻）、`hub-tabs` 4/4、`hub-read` 3/3（新加嗰段 Best 字
量到 6 段、對比零問題）、`hub-touch` 5/5、`hub-keyboard` 3/3、`hub-storage` 2/2、
`hub` 96/96。

## ADR-232 — 兩個 tab：打咗兩局淨係記低一局

Date: 2026-08-10. Status: accepted.

上一輪粗掃過「同一部機開兩個 tab」——十二個介面同時開兩版、各撳開場掣，
結果零 error、身分冇撞。**但嗰個結果唔算數**：嗰把尺量緊「未有進度可以撞」
嗰一刻。冇進度就冇嘢好撞，綠得好安詳。

### 量到咩

`localStorage` 係**成個 origin 共用**嘅——兩個 tab 唔係兩部機。而好多遊戲係
「開場讀一次成份存檔入記憶體，收場寫返成份出去」。兩個 tab 同時開住、各打完
一局（`tests/hub-tabs.mjs`）：

| 遊戲 | 記乜 | 起 | A 打完 | 兩個 tab 打完 |
|---|---|---|---|---|
| Neon Snake | `gamesPlayed` | 0 | 1 | **1** |
| Empire Royale | `trophies` | 0 | 30 | **30** |

**兩局變一局。** 呢個係 last-write-wins 嘅預設行為，要特登避先避得到。

### 改法：唔好信記憶體嗰份

新 `games/shared/js/merge-save.mjs` 得一個原語 `改存檔(key, 改, 預設)`
——改嘅時候即刻讀返 storage 現時嘅值，喺嗰個之上改，再寫返去。

（真正同一毫秒嘅兩個寫入仍然可以撞——`localStorage` 冇原子 read-modify-write。
但玩家嘅兩個 tab 唔會喺同一毫秒收場；呢度避嘅係「隔咗成分鐘」嗰種，
即係實際會發生嗰種。）

### 兩次都修錯位，兩次都係同一個教訓

**唔係得「睇落似會出事」嗰個寫入會蓋，係每一個由記憶體快照出發嘅寫入都會蓋。**

1. **Royale**：第一次淨係喺 `recordMatch` 度重讀——跑出嚟一樣紅。查落去，
   第二個 tab 一入場就叫 `markTutorialSeen()`，佢個 `persist()` 已經將成份舊嘢
   （獎盃 0）寫咗返落去，之後 `recordMatch` 由 0 起計。改成**每個改存檔嘅入口**
   （`setDeck`／`setActiveDeck`／`markTutorialSeen`／`recordMatch`）都先重讀。

2. **Snake**：第一次淨係改咗 `saveUserData`——一樣紅。dump 咗成個
   `localStorage` 落去先見到真兇係 **`login()`**：第二個 tab 掛載嗰陣 storage
   仲係空（第一個 tab 未入名），佢個 `prev` 係 `{}`，一登入就將個空物件寫返
   出去，**抹咗第一個 tab 成個 profile**，跟住先至打自己嗰局。

   兩次都係「改咗個最明顯嘅寫入就當修好」，兩次都要 dump 真實 storage 先知
   錯咗邊度。**估唔到就 dump，唔好對住碼再估一次。**

### 邊啲遊戲特登唔掃

只有**累積型**存檔先有呢個病。其餘三隻係特登 last-write-wins：
Tower 嘅 run checkpoint（同一個玩家同一部機，後面嗰個就係最新進度）、
MOBA 嘅 `champion` 設定（記住上次揀邊個，本來就係「最後一次」）、
Racing Car 嘅幽靈（存最快嗰個，唔係存全部）。
**一條會將特登嘅設計叫做 bug 嘅 gate 係壞 gate**，所以例外連理由一齊寫入把尺。

### 把尺

`tests/hub-tabs.mjs` 4/4，四條：兩個 tab 都真係各打完一局（對照）、A 打完個
累積數要真係行過（對照，唔係嘅話下面條 check 量緊空氣）、兩個 tab 各打一局
唔可以少咗一局、兩個 tab 開住零 error。

門檻唔係我揀個數——係「A 一局行咗幾多，兩局就至少要行到咁多嘅兩倍」。

driver 由 `hub-progress.mjs` 抽咗去 `tests/lib/drivers.mjs` 兩把尺共用
——**抄多一份就會有兩份各自漂移嘅真相**。

突變（淨係將 `markTutorialSeen` 退返去）令佢報紅，而且淨係叫 Royale。

## ADR-230 — MOBA: 佢冇一局又一局嘅循環，因為收場個掣係 location.reload()

Date: 2026-08-10. Status: accepted.

ADR-229 收尾寫住「淨返 MOBA 未入洩漏線，佢要打完一場波先有一個完整循環」。
查落去，個前提本身係錯嘅。

### 佢根本冇跨局循環

`main.js` 個 `finish()` 最後一句：

    box.querySelector('button').onclick = () => location.reload();

「再嚟一場」係**重新載入成版**。即係每一場都由一個全新 document 開始,
**結構上唔可能跨局積 DOM**。用「打完一場再打一場」去量 MOBA 嘅洩漏，
量到嘅係「載入一版新嘢」，唔係「積咗嘢」。

**「未冚到」同「冚唔到」係兩件事**，而我上一輪寫成前者。

### 佢真正值得守嘅係局中嗰啲面板

MOBA 局中嘅 UI 全部係 class toggle：`toggleShop()` 只係 `classList.toggle`,
`#buildShop()` 由頭到尾只喺 `#build()` 叫過一次。所以呢條 gate **今日一定平**
——但佢守住嘅係將來：一個「順手改成每次開商店都重新 render 一次道具表」嘅改動,
就會由呢度報出嚟。**一條而家一定綠嘅 gate 唔等於冇用**，只要佢守住嘅嘢係真嘅
而且會壞。

入局要等十幾秒（2.5 MB），所以只入一次，之後五圈開／閂商店好平。

### 突變

令 `toggleShop()` 每次開都留低一個節點 → `[286,287,288,289,290]`，
一圈爬一個，叫得出係 MOBA。

### 九隻全入線

`tests/hub-leak.mjs` 而家冚：Gomoku／Snooker／Xiangqi／Big Two／Dou Dizhu
（入線上大廳 → 返選單）、Tower（說明面板）、Racing Car（日夜切換）、
Snake（撞牆死 → Enter 重開）、MOBA（開／閂商店），加上 Royale 自己嗰把
`leak.mjs`（GPU ＋ DOM，選單→開戰→投降→返選單）——十隻遊戲入面九隻有
in-page 循環守住，Royale 嗰隻另外守。

## ADR-229 — Hub: 洩漏線由六隻擴到八隻，同埋「唔好拎兩個唔同狀態嘅數嚟比」

Date: 2026-08-10. Status: accepted.

ADR-228 用「入線上大廳 → 返選單」冚咗五隻卡牌／棋類，加上 Royale 自己嗰把,
即係六隻。剩低 Tower／Racing Car／Snake／MOBA——佢哋冇「線上大廳」呢條路,
而真正嘅一局循環要打完成局先有，太貴。

### 揀一個平嘅循環好過唔守，但要揀一個真係會重建嘢嘅循環

- **Tower**：開說明面板 → Escape 閂返。係一個 modal，會起同拆 DOM。
- **Racing Car**：日夜切換。會重建燈光／環境——比撳個暫停掣更貼近「會唔會積嘢」
  （而且開場畫面撳暫停根本冇效，`.pause-panel` 淨係喺賽中先出）。
- **Snake**：撞牆死一次 → Enter 重開。佢死得快，係四隻入面唯一一個平到可以
  真係跑一局循環嘅。
- **MOBA**：冇平嘅循環——HUD／商店淨係喺局中存在，而一場波要打完。**冇冚到,
  寫低咗**，唔扮冚到。

### 三個新嘅「把尺講緊自己」

1. **撳個掣同撳 Enter 唔同。** Snake 個 GAME OVER 遮罩寫住「按 ENTER 重新開始」,
   而**撳嗰個「重新開始」掣個遮罩唔會走**。我第一版撳掣，於是隻蛇由頭到尾冇再
   郁過——但每一圈個「入證」都認住上一局殘留嗰個「GAME OVER」，四圈都報「死到」,
   而**一個完全冇動過嘅畫面，DOM 梗係平**。條「出到」check 捉返呢個假綠。
2. **唔好拎兩個唔同狀態嘅數嚟比。** 改用 Enter 之後仲係唔穩：重開之後隻蛇要一陣
   先 arm，撳得太早嗰一圈唔會死。照樣取樣嘅話，嗰圈量到嘅係「冇遮罩」嘅畫面,
   於是讀數喺 565／561 之間上落——**兩個數各自都啱，只係量緊兩個唔同狀態**。
   改成**只喺確認咗個狀態嗰陣先取樣**，跟住四個樣本全部 565。
3. **樣本唔夠就唔算守到。** 只取樣嘅話，一隻永遠入唔到狀態嘅遊戲會攞到零個樣本
   然後「完全平」。所以加咗「取樣 ≥ 3」——Snake 跑八圈攞四個樣本。

### 結果

`tests/hub-leak.mjs` 4/4，八隻全部平。突變（令 Tower 每次開說明留低一個節點）
報 `[323,324,325,326,327]`，叫得出係邊隻——即係新加嗰族循環都真係守到嘢。

## ADR-228 — Hub: 同一個洩漏，另外五隻遊戲都有，但把尺淨係 Royale 有

Date: 2026-08-10. Status: accepted.

ADR-227 喺 Royale 度捉到「反覆入局，`<head>` 一局積一個攞唔到嘅 supabase
`<script>`」，並且修咗共用層嘅 `loadSupabaseSdk()`。但**嗰把尺淨係 Royale 有**
——同一個 loader 另外五隻遊戲（Gomoku／Snooker／Xiangqi／Big Two／Dou Dizhu）
都用緊，冇人守過。

### 循環揀「入線上大廳 → 返選單」

唔係求其揀個掣：①佢**真係行過**個 SDK loader（線上大廳先會叫連線層）；
②佢係玩家真係會做嘅嘢（睇下有冇人喺度，冇就返去打人機）；③平又快。

而且**要擋走第三方**——唔係為咗方便，係為咗量到真嘢：SDK 攞唔到先至會重試，
重試先至會積 element。CDN 通嗰陣個 loader 只會行一次，呢個病量唔到。

### 三個「把尺講緊自己」

1. **兩隻遊戲個 driver 寫錯，於是報咗個假綠。** Snooker 個大廳係
   `#snooker-online-lobby` 唔係 `#online-lobby`；Big Two 個全域叫 `setMode`，
   而幾乎一模一樣嘅 Dou Dizhu 叫 `setGameMode`。兩隻都報「DOM 完全平」
   ——因為根本冇入過大廳。
   **條「先證明個循環真係行過」嘅 check 第一次跑就即刻捉到佢哋**（`入到 0/5`）。
   冇呢條，呢把尺會帶住兩個永遠報綠嘅位交出去。
2. **一句仲喺度顯示緊嘅提示唔係洩漏。** 第一版數全部節點，Gomoku 同 Xiangqi
   報「一圈爬一個」——爬緊嘅係 `.gh-toast`。第三方擋走咗，每圈都彈一句
   「連線服務載入失敗」，而一句 toast 顯示 3.5 秒、我一圈得 1.2 秒。量到嘅係
   「而家畫面上有幾多句提示」，唔係「積咗幾多嘢」。
   改成數之前剔走 toast 子樹——但**唔可以就咁當佢唔存在**，所以另外加一條
   「提示唔准超過 `MAX_TOASTS = 5`」。剔走一樣嘢就要喺第二處補返一條線。
3. `入`／`出` 直接叫遊戲自己嘅全域函數，唔靠撳掣。呢度要嘅唔係「模擬一隻手指」
   （`hub-touch` 守緊嗰樣），係「行完呢條狀態轉換」——ADR-227 就係喺呢個分別
   上面浪費過幾轉（投降流程過唔到 Playwright 嘅 actionability 檢查）。

### 結果

`tests/hub-leak.mjs` 4/4，五隻全部平。突變（拆走共用層嘅 `拆()`）令
Snooker `[86,87,88,89,90]`、Big Two `[141,…,145]`、Dou Dizhu `[150,…,154]`
一圈爬一個——即係 ADR-227 個修正真係喺呢三隻度救咗嘢，而家有尺守住。

Gomoku 同 Xiangqi 喺突變之下**冇報紅**：佢哋 `initOnlineMode` 喺開頁嗰陣叫一次,
唔會每次入大廳都叫，所以呢條循環唔會令佢哋重試。呢個唔係漏網，係佢哋本來就
唔行嗰條路——**寫低咗，免得下次有人以為條 gate 冚咗五隻。**

## ADR-227 — Royale: 一把只守一種資源嘅洩漏閘，會漏走另一種資源嘅洩漏

Date: 2026-08-10. Status: accepted.

新問題：**玩多幾局會唔會愈嚟愈重？** `renderer.info` 係精確整數（GPU 上面仲有
幾多 geometry／texture／shader program），唔似幀時間咁受呢個容器影響（ADR-220）。

### GPU 嗰邊本來就守住咗——係我重複咗

量落去 geometries／textures／programs 連開五局**完全平**。查返先發現
`games/royale/tests/leak.mjs`（ADR-008）一直守住呢兩個數，六個回合。
**我量咗一樣已經有人守嘅嘢。** 應該做嘅唔係另開一把尺，係搵佢冇守嗰面。

### 佢冇守嘅係 DOM

同一個量法之下，DOM 節點數**一局爬一個**：513 → 532 → 533 → 534 → 535…
爬緊嘅係 `<script>`（4 → 10）。逐個睇 src，全部係
`cdn.jsdelivr.net/npm/@supabase/supabase-js@2`。

根因：`loadSdk()` 攞唔到會 `sdkLoadPromise = null` 畀下次再試，
**但上一次嗰個 `<script>` 冇拆走**。即係**網絡差＝重試多＝爬得快**
——最需要佢慳嘅時候佢最漏。

同一個 pattern 喺 `games/shared/js/online_utils.js` 嘅 `loadSupabaseSdk()`
（ADR-209 我自己寫嗰個）一模一樣，而佢係六隻遊戲共用。兩邊一齊修：
三條路（載到／載唔到／逾時）都拆走個 element。載成功都照拆——script 行完
`window.supabase` 已經定義咗，拆走個 element 唔會收返佢。

### 條 gate 擺錯位，會扮成一條守緊嘢嘅 gate

第一版我將 DOM check 加落現有嗰個 loop 度——**突變測試照樣報綠**。
因為嗰個 loop 喺 `page.evaluate` 入面直接叫 `startMatch`，唔會經過選單，
所以連線層根本冇行過。**一條唔行玩家條路嘅 gate，守唔到玩家撞到嘅嘢。**

改成開多一個乾淨實例，行返「選單 → 開戰 → 投降 → 返選單 → 再開戰」。
兩個坑：

1. 入咗局之後 `#start-btn` 個祖先會加 `.hidden`，唔返選單就撳唔到下一次
   ——嗰個係狀態問題，唔係洩漏，但佢扮成一個 timeout 令你以為 gate 壞咗。
2. 投降流程中途嗰幾個掣過唔到 Playwright 嘅 actionability 檢查，
   所以用**原生 DOM click**。呢度要嘅唔係「模擬一個真手指」，
   係「行完呢條狀態轉換」——分得清兩者先寫得出一條唔會無故逾時嘅 gate。

修完：`[513, 531, 531, 531]`。突變（拆走修正）令佢報 `[513, 532, 533, 534]`，
一局一局爬，叫得出係邊條。`leak.mjs` 由 6/6 變 7/7。

## ADR-226 — Hub: 睇唔睇得清——五個主要行動掣，白字擺喺中亮度彩色上面

Date: 2026-08-10. Status: accepted.

已經有「掂得到」（`hub-touch`，44×44）同「去得到」（`hub-keyboard`，Tab ＋ focus
提示）。冇一條問過**睇唔睇得清**。

### 把尺量咗四個版先啱，四次都係量錯

1. **靠 computed style 向上搵底色，凡有 `background-image` 就跳過。**
   body 有個 gradient 就已經觸發——十二個介面入面九個係 100% 跳過，然後報
   「零問題」。**一個量咗零樣嘢得出嚟嘅綠。**
2. 改成量真像素，但攞「框入面嘅眾數」做底色。細細個框（例如 Tower 一個「400」）
   入面**字本身先係眾數**，於是算出「對比 1.02」——即係睇唔到，但佢明明睇得
   好清楚。Tower 一度報咗 35 個假紅。
3. 改成「字色由 computed `color` 攞、底色喺剔走近似字色嘅像素之後再攞眾數」。
   啱咗，但**純 emoji 仲係假紅**：emoji 係多色字形，佢嘅顏色唔係 `color`
   ——Royale／Racing Car 個 🏠 報「對比 3.2」，但個掣本身清清楚楚。
4. **喺 layout 入面唔等於畫得出嚟。** Tower 個 `80g` 有 box、冇 `display:none`、
   又喺 viewport 入面，但畀 overflow 剪走咗——影出嚟一片黑。守衛：框入面搵唔到
   接近字色嘅像素，就當佢冇畫過，唔做證據。加咗之後 Tower 由 62 段「字」變 15 段。

**每一版都要親眼影低嗰個位睇過先信。** 頭三個假紅全部係影完之後先發現。

### 剩低嘅係真嘢

五個介面嘅**主要行動掣**，白字擺喺中亮度彩色上面——望落 OK，但實測跌穿
WCAG AA 4.5:1：

| 位 | 前 | 後 |
|---|---|---|
| Big Two／Dou Dizhu「線上對戰」`#4CAF50` | 2.39 | **5.61**（`#256B29`） |
| MOBA「開打」漸變藍端／紫端 | 2.60／3.85 | **4.90／6.45** |
| Xiangqi「ONLINE 對戰」漸變淺端 `#388e3c` | 3.14 | **4.98**（`#256b29`） |
| MOBA 角色標籤（跟英雄色，最暗嗰隻） | 4.46 | 向白拉三成 |
| Gomoku build 標記 `#666` | 3.09 | `#8a93a8` |

色相全部冇改，淨係加深。MOBA 角色標籤用 `color-mix` 向白拉，
**英雄色本身（環、卡邊）一律唔郁**——唔好為咗一行細字改晒個識別色。

### 字體大細只報唔守

冇一條標準寫死手機最細幾多 px，而 9–11px 喺一個密集嘅遊戲 HUD 度可以係諗過
先咁做。**一條會將深思熟慮嘅決定叫做 bug 嘅 gate 係壞 gate**（同 ADR-206 嗰粒
carousel 圓點一樣嘅判斷）。所以照量、照報，唔守。報出嚟嘅數：Hub 14、MOBA 16、
Racing Car 8、Royale 6、Tower 2、Gomoku 1。

### 把尺

`tests/hub-read.mjs` 3/3。除咗對比之外仲有兩條「唔畀自己扮綠」嘅：
開唔到嘅頁要報紅（唔可以掛咗當冇事），同埋**每個介面都要真係量到字**
——量到零段就係把尺喺嗰度失效，唔係嗰個介面冇字。
突變（兩個掣色改返）令佢報紅，而且叫得出係邊個掣、幾多比。

## ADR-225 — Hub: 守住入去嗰十三條路，冇人守過出返嚟嗰條

Date: 2026-08-10. Status: accepted.

`tests/hub.mjs` 一直守住 launcher **入去**嗰十三條路（每個入口都指住一個存在
嘅檔）。**冇人守過出返嚟嗰條。** 一隻入到去出唔返嘅遊戲係一個陷阱——喺手機
加咗上主畫面之後，連瀏覽器嘅返回掣都未必見得到。

### 量到

十一個介面入面**十個本來就有**一條返 hub 嘅路，而且撳落去真係去到。
**得深淵之橋 MOBA 一條都冇**——成個 `games/moba/` 入面 `index.html` 三個字
一次都冇出現過（連 `src/` 都冇）。開咗佢就淨係得瀏覽器 Back 出得返。

已經喺揀英雄版同收場版各加一條。樣式係**次要動作**（描邊、唔搶「開打」嘅
注意力），但一樣守住 44×44——`tests/hub-touch.mjs` 嗰條線。

**加完即刻畀 MOBA 自己把尺捉到一個回歸**：第一版擺咗喺文檔流入面，
`tests/browser.mjs` 報「SE 直屏／橫屏都見唔到一張完整嘅英雄卡」——個格網本來
就爭緊每一個像素，加一行喺流入面就係搶佢嘅。改成角落絕對定位（同 Royale／
Racing Car／Tower 一樣）之後 196/196。收場版嗰個照留喺流入面，嗰版夠位。

### 四個「把尺講緊自己」

呢一輪把尺錯咗四次，每一次都會令我去「修」一樣冇壞嘅嘢：

1. **淨係掃屬性掃唔到。** Gomoku 同 Xiangqi 個掣寫 `onclick="goToLauncher()"`,
   「返回遊戲大廳」係**文字**。第一版淨係掃 href／onclick／id／class，
   於是報咗五隻「冇路返」——四隻係掃唔到，得一隻係真。
2. **撳第一個唔等於撳啱。** Tower 開場有兩個 🏠：HUD 嗰個 `#hub-btn` 喺開場
   modal 後面（撳唔到，而且本來就唔應該撳到），開場版嗰個「🏠 返回 Game Hub」
   喺 `top: 926`，要捲先見到。第一版撳咗第一個，報 Tower「去唔到」。
   契約係「**有一條行得通嘅路**」，所以改成逐個試。
3. **`getByText` 撞中咗個副標題。** Snake 入名版個副標題寫住「輸入你既名稱
   開始遊戲」，`getByText(/開始遊戲/).first()` 揀咗個 `<p>`——撳落去乜都冇,
   成版嘢冇郁過，於是條 gate 話「Snake 冇路返」。改用
   `getByRole('button', { name: /開始遊戲/ })`。
4. **一個 timeout 掃唔到分階段嘅介面。** Snake 個返回掣喺入名版之後，
   開頁 3.5 秒根本未行到。所以呢把尺要**逐隻遊戲寫明幾時去搵**
   （同 `hub-cdn.mjs` 嘅 `踢` 一樣）。

### 把尺

`tests/hub-home.mjs` 3/3：①行得到嗰一版（量唔到就報紅）②有一條見得到嘅路
③撳落去真係去到（**唔可以淨係睇個 `href` 寫成點**——一條指住唔存在檔案嘅鏈,
睇落一樣好地地）。兩個突變分別打中第 2、3 條：拆走 MOBA 兩條路 → 報
「冇路返」；改成 `index-唔存在.html` → 報「死鏈」。

## ADR-224 — Hub: GL context 掉咗——五隻識講，一隻淨係黑咗

Date: 2026-08-10. Status: accepted.

手機切走去覆個 message、或者記憶體緊張，瀏覽器會**收返個 GL context**。呢個
唔係罕見情況，係 3D 網頁遊戲喺手機上面嘅日常。Tower 老早有 gate
（`tower/tests/flow.mjs`），其餘五隻 3D 遊戲冇人量過。

### 契約

掉咗之後，**唔可以又冇畫面又冇交代**。兩條出路都收貨：畫面自己返到嚟，
或者有嘢話玩家知（暫停／降畫質／叫你重新整理）。

### 量到

六隻**全部都有叫 `preventDefault()`**——冇呢句瀏覽器根本唔會還原，所以呢個
係最低要求，而六隻都做咗。至於「有冇同你講嘢」：

    Tower Defense   「Graphics interrupted」
    Racing Car 3D   「⏸ 已暫停」「手機暫停咗 3D 畫面，正在恢復…」
    Snooker 3D      「3D 畫面失去連線，請重新整理頁面」
    Empire Royale   「⚙️ 已自動調低畫質保持流暢（顯示記憶體不足）」
    深淵之橋 MOBA     HUD flash
    **Xiangqi AI     乜都冇**

而 Xiangqi 係**按需渲染**（唔郁就唔重畫），所以掉咗之後個 canvas 真係變空白
——實測 canvas 截圖 8,212 → 1,612 byte（0.20 倍）。即係你望住一塊乜都冇嘅
棋盤，而冇一隻字話你知發生咗咩事。

改法：`render.js` 度加返 `webglcontextlost` 訊息（同 restore 之後清返、
`resize()` ＋ 重畫一次）。訊息條由渲染層自己起，唔喺 `index.html` 度預留位
——嗰樣會變成「兩個地方都要記得改」。

### 五個「把尺講緊自己」

呢一輪把尺錯咗五次，每一次都會令我去修一樣冇壞嘅嘢，或者放過一樣真嘅：

1. **「畫緊」對按需渲染冇意義。** Snooker 同 Xiangqi 唔郁就唔重畫，所以佢哋
   喺**出事之前**已經量到「冇畫緊」。一把喺故障之前已經讀到「壞」嘅尺，
   證明唔到故障之後有嘢壞。改成**叫佢重畫**（搖一搖視窗）先量。
2. **全頁文字比對捉唔到「有冇交代」。** 個遊戲鐘一路行，文字本來就會變
   ——捉到嘅係 `0:15`、`0:03.70`、`▶`。改成出事前影兩次文字集，
   **兩次之間自己會變嗰啲就係噪音**，之後一律唔當佢係「同你講嘢」
   （同 ADR-202 嗰條閃光 gate 一模一樣嘅做法）。
3. **我幫咗佢還原。** 第一版掉完之後自己叫 `ext.restoreContext()`。突變
   （將 Tower 成個 `webglcontextlost` handler 拆走）照樣報綠——因為
   **係我把尺幫佢做咗佢本來要做嗰件事**。改成唔叫，淨係觀察佢有冇
   `preventDefault()` 同會唔會自己返。
4. **`e.children.length === 0` 讀漏咗有子元素嘅訊息。** Snooker 句
   「3D 畫面失去連線」入面有個 `<span>`，於是條 gate 話佢「冇交代」——
   而佢明明有。改成讀**自己嗰啲文字節點**。
5. **讀遲咗。** 交代喺搖視窗之後先讀，而搖視窗會令 renderer 重新 init、
   順手抹走個訊息。Royale 同 Snooker 兩句都係咁樣走甩咗。改成掉完即刻讀。

順帶一提：呢個容器**冇一隻遊戲收到 `webglcontextrestored`**。即係「畫唔畫得
返」喺呢度根本量唔到——之前嗰個「畫返」其實分緊「canvas 清唔清空」，唔係
「有冇復原」。所以條 gate 唔靠佢，靠「攔住 ＋ 有交代」。

### 把尺

`tests/hub-context.mjs` 3/3。突變（拆走 Xiangqi 新加嗰句）報紅，而且叫得出
係邊隻同埋個 canvas 得返 0.28 倍。

## ADR-223 — Hub: 進度記憶——逐隻寫 driver，五隻全部覆蓋

Date: 2026-08-10. Status: accepted.

handoff 剩低最後一個接手位：十二個介面得 Tower 有 checkpoint gate，其餘冇人量過。

### 先講點解上次量錯

上一次用 generic 掃法（開場撳幾下再睇 `localStorage`），掃到九隻「玩完一個字都
冇寫低」，差啲當咗係九個病。查落 Neon Snake 其實有成套 profile／高分系統，
淨係喺 game over 先寫——**掃唔夠，唔係佢冇記**。

所以呢次逐隻寫 driver，而且每隻都要**先證明去到「有嘢值得記」嗰一刻**。
呢個對照唔係裝飾：冇佢嘅話，一隻根本未開始玩嘅遊戲會扮到「冇嘢好記」，
而條 check 會綠得好安詳。（同 ADR-217「隱藏之前個鐘要真係喺度行」、
ADR-219「撳之前先證明個掣真係撳到」係同一種嘢——今個 session 第三次用。）

### 量到咩

| | 到咗「值得記」嗰刻 | 留低咗 |
|---|---|---|
| Tower Defense | 開咗波 | `tower-defense-run-v1` checkpoint（440 bytes） |
| Neon Snake | 死咗（見到「重新開始」） | `snake-game-users`：`gamesPlayed 1`、一筆分數 |
| 深淵之橋 MOBA | 入咗場 | `moba-settings`：`champion: ironward` |
| Empire Royale | 一場波打完 | `royale-save-v1`：`trophies 0 → 30` |
| Racing Car 3D | 跑完一圈 | `racer-ghost-v1:turbo`：圈速 42.5、12 個樣本 |

五隻 reload 之後全部仲喺度——即係真係留低咗，唔係得個記憶體副本。

MOBA 唔存戰績（一場對 AI 嘅波打完就完），但佢記得你揀邊個英雄，即係下次入嚟
唔使由頭揀過。**唔同遊戲「值得留低」嘅嘢唔同**，所以憑據逐隻寫，唔用一條
「有冇寫過 localStorage」通殺。

### Empire Royale：兩條行唔通嘅路，同一條行得通嘅

第一版夠唔到 Royale 收場。試過兩條路，兩條都行唔通，寫低省得下一個再試：

1. **淨係快進**：`g.update(1/60)` 行足 300 秒模擬——冇人出牌就拖到 `overtime`
   僵住，`phase` 永遠唔係 `ended`。
2. **直接寫 `king.hp = 0`**：唔會收場。`#kill` 淨係喺 `#damage` 入面叫,
   唔經傷害路徑就唔會觸發。

行得通嗰條係 repo 自己就有嘅——`royale/tests/match.mjs` 老早寫咗：塞張火球落手、
畀夠水、敵方王塔剩一滴血、`playCard` 落佢個位。**答案又係喺屋企**（同 ADR-209
嘅 lazy SDK、ADR-211 嘅 Draco 一樣）。

仲有一個坑：教學遮罩開住嗰陣**模擬係凍結嘅**（`if (!ui?.tutorialOpen)`），
所以個火球永遠唔會爆。要用返 harness 嗰招，入場之前 `markTutorialSeen()`。

打完一場之後：`royale-save-v1` 由 `trophies: 0` 變 `30`，reload 之後仲喺。

### Racing Car：唔好喺測試度抄一次

佢有記——`racer-ghost-v1:<track>` 存住最佳圈速同幽靈軌跡——但「值得記」嗰一刻要
**跑完一圈**，而一個測試揸唔到一圈。

最順手嘅做法係喺測試度直接叫 `ghostRecorder.commit()`。**唔好**——嗰樣等於自己
驗自己：真正會唔會 commit 係由 `updateGhost()` 睇住 `race.lapTimes.length` 有冇
變嚟決定嘅，跳過佢就冇量過嗰段。

所以改成**推一個圈速入 `race.lapTimes`**，跟住嗰幾步（`commit` → `saveGhost` →
`ghostPlayer.load`）全部係遊戲自己行。量到嘅仍然係真嗰條路。

（要先揸夠一陣：`commit` 見到樣本少過 12 個會直接放棄，所以條 driver 等到
`ghostRecorder.samples.length >= 48` 先推。）

實測：`racer-ghost-v1:turbo`，圈速 42.5、12 個樣本，reload 之後仲喺。

### 五隻都喺度，但冇一條通用路徑

開咗波（Tower）／死咗（Snake）／入咗場（MOBA）／一場波打完（Royale）／跑完一圈
（Racing Car）——**「值得記」嗰一刻逐隻都唔同**，所以 driver 同憑據都逐隻寫。
一條「有冇寫過 localStorage」嘅通用 check 喺呢度冇意義。

### 把尺

`tests/hub-progress.mjs` 2/2（五隻）。三個突變各自打中第二條，而第一條（到咗
「值得記」嗰刻）照樣綠——即係兩條 check 各自守住唔同嘅嘢：拆走 Snake 四處
`saveScore` → 叫得出 Neon Snake；拆走 Royale 收場嗰句 `recordMatch` → 叫得出
Empire Royale；拆走 `saveGhost` → 叫得出 Racing Car 3D。

## ADR-222 — MOBA: 重現唔到嗰個鏡頭偶發，封死佢指住嗰個機制

Date: 2026-08-10. Status: accepted。

ADR-216 留低嘅：`打直：玩家企喺畫面下半但唔會跌出畫外` 五跑紅兩次，方向相反
（`玩家由頂計` 32.1 對 −28.6，而條線係 45–88），其中一次 `鏡頭焦點` 離玩家成
**44 個單位**，但條收斂判斷照樣話 `收斂咗: true`。

### 重現唔到

寫咗個獨立探針，喺同一版度重複跑 framing 嗰段十五次（唔行成個十二分鐘 suite）:
擺玩家喺 −6、隔籬放一隻滿血敵人、行 150 幀 `v.update`。

**十五次全部過**：`由頂計` 55.9–56.3、`焦點離玩家` 0.1–0.3、`途中死過` 全部 N。
跟住行成個 suite，196/196，`途中死過: false`。

即係我**重現唔到**。

### 但個報告指住一個機制，而嗰個機制封得死

framing 嗰段唔係一個乾淨嘅場面——佢繼承住上一段（普攻）留低嘅嘢：隔籬有一隻
滿血敵人企喺 1.5 米。玩家喺嗰 150 幀入面死咗嘅話就會重生返泉水（x ≈ −62），
鏡頭跟住追過去，而量到嘅就係一個**喺半路嘅鏡頭**——啱啱好解釋到「焦點離玩家
44 個單位」同兩次方向相反嘅讀數。

呢一段量嘅係**構圖**，唔係打得贏打唔贏。所以喺量之前同每一幀都撐住玩家生存
（`alive`／`hp`／`respawnAt`）。**呢個唔係放寬斷言**——條 gate 問嘅「玩家喺畫面
邊個位置」同 45–88 條線一個字都冇改，改嘅係「量嗰陣個場面唔可以中途變成另一
個場面」。同 ADR-216 清 `respawnAt` 係同一種嘢。

### 同時畀下次一眼睇得出

報告加咗兩個數：`途中死過`（有冇喺量度窗口入面死過）同 `焦點離玩家`。
下次再紅嘅話，唔使再由零估——一眼就睇得出究竟係唔係呢個原因。
**一個重現唔到嘅偶發，最實際嘅交付品係「下次唔使再由零估」。**

### 冇做嘅嘢

冇改鏡頭邏輯。重現唔到就改鏡頭，係今個 session 已經明文寫低唔做嘅嘢
（ADR-216、ADR-217 都踩過）。

## ADR-221 — Empire Royale: 補返 draw-call 預算，同埋一個曾經永遠報綠嘅數

Date: 2026-08-10. Status: accepted.

ADR-220 留低嘅入手位：Royale 係三隻 3D 遊戲入面最重嗰隻（同一個軟件光柵器
中位幀時間 533ms，Tower 100ms、MOBA 233ms），但 Tower 同 MOBA 都有 draw-call
預算，**佢一條都冇**。呢一輪補返。

### 個數本來係假嘅

ADR-220 度量到 Royale `calls 1、三角 1`——當時當咗係取樣時機錯。修咗時機
（render 完先讀）之後，**仲係 1**。真因係 `EffectComposer`：

- three.js 每次 `renderer.render()` 開頭會 `info.reset()`；
- composer 最後一個 pass 係一塊全屏 quad，佢自己都行一次 `render()`；
- 所以 `composer.render()` 返嚟之後讀到嘅，係**嗰塊 quad**（1 個 call、1 個三角），
  唔係成個場景。

修法：`renderScene()` 入面熄 `renderer.info.autoReset`、自己一幀 `reset()` 一次、
render 完即刻記低（`window.__royaleDrawn`）。呢個數要由 render 完嗰一刻自己記,
唔可以由外面隔住 `requestAnimationFrame` 讀——實測同一個外部取樣點，喺 Tower／
MOBA／Royale 三種 loop 結構下面有三個唔同意思。

### 真數

`__royaleDrawn()`，教學略過之後量 45 秒：

| | calls 中位 | p95 | 尖峰 | 嗰刻單位 | 三角 |
|---|---|---|---|---|---|
| 手機 844×390 | 509 | 519 | **532** | 9 | 867K |
| 桌面 1280×800 | 517 | 525 | 526 | 7 | 773K |

場上得七至九個單位就已經五百幾個 call——即係嗰五百個幾乎全部係**戰場本身**。
（Tower 空場 126、MOBA 一場波 94。）

### 兩條線，唔係一條

上限 **650**（實測尖峰 532，約 1.22 倍）：戰場係靜態嘅，多一兩件裝飾唔會過線，
但掉咗批次（一堆共用 geometry 變成逐件畫）就一定過。

下限 **50**：因為呢個數**曾經係 1，而一條淨係守上限嘅 gate 喺嗰個情況下會
永遠報綠**（1 ≤ 650）。突變測試示範咗呢件事：拆走 `autoReset = false` 之後,
上限嗰條照樣 PASS，得下限嗰條報紅。**一個讀到假數嘅 gate 比冇 gate 更差**,
因為佢會畀你一個「守住咗」嘅錯覺。

### 驗證

`games/royale/tests/perf.mjs` 3/3，已入 `run-all.mjs`。兩個突變各自打中一條：
①拆走 `autoReset = false` → 中位變 1 → **下限**報紅（上限唔會）；
②多畫一次成個場景 → 中位 988／尖峰 1014 → **上限**報紅（下限唔會）。

## ADR-220 — Hub: 流暢度量唔到，但量到一個覆蓋缺口

Date: 2026-08-10. Status: accepted（結論係「量唔到，但搵到要補嘅位」）。

handoff 剩低嘅最後一條玩家感受得到嘅線係「玩落去順唔順」。查完，**呢個容器
量唔到**，但過程中量到一個真嘅覆蓋缺口。記低係為咗下一個人唔好重複試。

### 一、幀時間：Royale 八秒得 13 幀，報唔到 p95

唔量 FPS（swiftshader 純軟件渲染，絕對幀率同真機冇關係），改量**抖唔抖**
——p95 幀時間除以中位數。全部幀一齊變慢，呢個比值唔會變，所以理論上對
「部機幾快」唔敏感。

實測（844×390，入局之後量 8 秒）：

| | 幀數 | 中位 | p95 | p95/中位 |
|---|---|---|---|---|
| Neon Snake | 478 | 16.7ms | 16.7ms | 1.00 |
| Tower Defense | 83 | 99.9ms | 116.7ms | 1.17 |
| Racing Car 3D | 100 | 83.3ms | 100ms | 1.20 |
| 深淵之橋 MOBA | 31 | 233.3ms | 300ms | 1.29 |
| Empire Royale | 13 | 533.3ms | 833.3ms | 1.56 |

**但 Royale 嗰行讀唔得。** 13 個樣本嘅「p95」其實就係第 12 個值，即係接近最大值
——一個樣本數咁少嘅分位數唔係分位數。而佢正正就係最想量嗰隻（最重）。
即係：**呢把尺喺佢最有用嗰個 case 上面失效。**

要喺呢個容器度得到足夠樣本，就要量到成分鐘；而量到嘅仲係 swiftshader 嘅
分佈，唔係真機嘅。所以**唔寫呢條 gate**。

### 二、Draw call：取樣時機錯，讀到 1/1

轉去一個同硬件無關嘅量法——draw call。但量到：

    Tower Defense   draw call 中位 1    三角 1
    深淵之橋 MOBA    draw call 中位 93   三角 89,368
    Empire Royale   draw call 中位 1    三角 1

Tower 同 Royale 嗰個 `1` 唔係真數：three.js 喺每次 `renderer.render()` 開頭
`info.reset()`，而我喺自己嘅 rAF callback 度讀——即係讀緊「reset 咗之後、
遊戲仲未 render」嗰一刻。MOBA 讀到真數，係因為佢個 loop 喺 callback 一開頭
就 `requestAnimationFrame(frame)`，排喺我前面。**同一個取樣點，喺三個唔同嘅
loop 結構下面有三個唔同意思。**

`moba/tests/browser.mjs:879` 嗰條做啱咗：佢**喺遊戲自己嘅 update 之後**讀。
Tower 嗰條一樣。即係呢種量度冇得「喺外面通用咁量」，要接落個 loop 度。

### 三、真嘅發現：Royale 冇 draw-call 預算

Tower 有（`performance.mjs`：空場 budget 450、真峰值 229 怪 budget 1100）,
MOBA 有（`browser.mjs`：一場波尖峰 < 600）。**Empire Royale 一條都冇**
——佢個 `__royaleRenderer` 而家淨係畀滲漏測試用。

而佢係三隻入面最重嗰隻（同一個軟件光柵器之下中位 533ms，Tower 100ms）。
一隻冇預算嘅遊戲，加幾件嘢落場景冇人會攔佢。

**呢一輪唔補**：補得啱嘅話要接落 Royale 自己個 render loop（同 Tower／MOBA
一樣），而唔係喺外面隔住 rAF 估。呢個係下一個人明確嘅入手位：
`games/royale/src/main.js` 嘅 `loop()` 入面 `renderScene()` 之後讀
`renderer.info.render.calls`，再照 Tower 嗰條寫法立一個由實測定嘅 budget。

## ADR-219 — Hub: 聲——一條本來就啱，一條漏咗一隻

Date: 2026-08-10. Status: accepted.

聲從來冇人量過。兩條問題，兩條都係玩家真係感受到嗰種。

### 一、開唔開得到聲——**本來就啱**

瀏覽器嘅 autoplay policy：未有過用戶手勢之前，`AudioContext` 一 new 出嚟就係
`suspended`，而且**唔會自己 resume**。遊戲如果喺載入嗰陣就 new 咗個 context，
之後淨係 `.play()` 而唔 `.resume()`，就會由頭到尾冇聲——而且畫面上一個錯都冇。

實測（喺頁面碼之前 Proxy 住 `AudioContext` 嘅 constructor，記低每一個 new
出嚟嘅 context 同狀態；**唔開 `--autoplay-policy=no-user-gesture-required`**，
因為咁樣就等於喺一個冇 policy 嘅世界度量）：

| | 開場 | 撳咗第一下之後 |
|---|---|---|
| Tower／MOBA／Royale／Snake／Racing Car | **一個 context 都冇 new** | `running` |

五隻全部係「第一下手勢先 new」——即係本來就啱。寫落把尺係為咗守住。
（Snooker 3D 同 Xiangqi 由頭到尾冇 new 過，即係佢哋根本冇遊戲聲。）

### 二、撳咗靜音記唔記得住——**Royale 漏咗**

`games/royale/src/sfx.js` 入面係一個 module-level `let muted = false`，
**一個字都冇存**。即係你每次入嚟都要重新撳一次靜音掣。

同一個 repo 入面 Racing Car 記得住（實測 有聲 → 靜音 → reload 靜音）,
即係呢個唔係大家嘅共識，係漏咗一個——同 ADR-209（Royale 老早就 lazy-load
SDK，得其餘五隻冇跟）係鏡像嘅情況，今次輪到 Royale 做嗰個漏網。

改法跟同一個檔案入面 `main.js` 嘅 `GFX_KEY` 一樣：自己一個 localStorage key
（`royale-muted-v1`），唔塞落 `storage.js` 嗰個存檔（嗰個係獎盃／卡牌／連勝）。
`setMuted` 寫，module 載入嗰陣讀。仲要記住個掣嘅字都要跟返——唔係嘅話載入
返嚟明明係靜音，但個掣寫住 🔊，玩家會以為壞咗。

### 一個對照，救返一個假綠

第一版把尺喺**開場畫面**撳 `#mute-btn`——但嗰個掣喺局內 HUD，撳唔到。於是
「撳完」同「reload 後」兩個讀數一樣，條 check **報綠**。

所以加咗一個對照：**撳之前先要證明個掣真係撳到**（撳完個狀態要同撳之前唔同）。
呢個同 ADR-217 嗰個「隱藏之前個鐘要真係喺度行」係同一種嘢——
**一個冇發生過嘅動作，會令「前後一樣」睇落好似「守得好好」。**

### 把尺

`tests/hub-audio.mjs` 3/3。突變（拆走 `setMuted` 入面嗰句 `localStorage.setItem`）
令第三條報紅，而且叫得出係 Royale、`🔇 → reload 🔊`。

## ADR-218 — Snooker 3D: 查完決定唔改，同埋一個我入唔到嘅狀態

Date: 2026-08-10. Status: accepted（結論係「唔改」）。

ADR-217 之後淨返 Snooker 3D 冇「切走就停」。呢一輪查咗佢，**結論係唔改**。
記低係因為下一個人唔應該由零再查一次——同 ADR-213 對 Royale 一樣。

### 三個查得實嘅事實

1. **佢真係冇 `visibilitychange` handler**（grep 過 `3d/main.js`、`2d/`、`online.js`
   三處，一個都冇）。
2. **佢冇任何計時**：`shotClock` / `turnTimer` / `timeLeft` 三個字喺成隻遊戲度
   都搵唔到。即係你走開嗰陣，**冇一個鐘喺度對你倒數**。
3. **佢係回合制**：唔喺一杆打緊嘅時候，枱面根本冇嘢喺度動——`animate()` 每幀
   照 render，但 `stepSimulation` 冇嘢好行。而一杆由出手到啲波停低係幾秒。

即係話：MOBA 嗰種傷害（你去覆個訊息返嚟已經送咗一血）喺呢度**唔成立**。
最壞情況係你喺一杆飛緊嘅時候切走，返嚟見到啲波已經停晒——但嗰個結果同你
留喺度睇住佢停係一模一樣，因為冇人趁你唔喺度食你。

### 一個我入唔到嘅狀態

想量「一杆飛緊嗰陣切走」嗰個 case，但入唔到局：

    __snookerDebug.placeCueInD(0.05, -0.9)   → { ok: true, x: 0.084, z: -1.008 }
    __snookerDebug.confirmCuePlacement()      → turnState 由 PLACE_CUE 變 AIMING
    __snookerDebug.shoot(0, 1, 0.95)          → 返 true
    但：shotSerial 一直 0、cueBallSpeed 0、actionRequired "WAIT"

`shoot()` 返 true 淨係代表佢收到個方向同力度，唔代表 `shootCueBall()` 真係
出到手（入面仲有 `canTakeShotReason()` 一重）。**呢個係我把尺嘅缺口，唔係
一個發現**——寫低係為咗下一個人由呢度接手，唔使再撞一次。

（第一版仲更差：連 `confirmCuePlacement()` 都冇叫，`turnState` 一直 PLACE_CUE，
量到「打完個鐘都唔郁」——一個「根本冇打過」嘅狀態，扮到似「打完好快就停」。）

### 所以唔改

冇計時、冇對手趁你唔喺度出手、而唯一會動嘅窗口係幾秒。喺呢個情況下加一個
暫停，得到嘅係零，而風險係喺一杆中間 pause 會整亂 `turnState` 同 `stationaryTime`
嗰套判定。**冇量到傷害就唔好落刀。**

下一個人如果要接：入手位係 `canTakeShotReason()` ——搞清楚點解喺 AIMING 之下
仲係出唔到手（多數係啲波未 settle，或者 `foulDecisionPending` 未清）。

## ADR-217 — Hub: 你切走咗，四隻遊戲照打

Date: 2026-08-10. Status: accepted.

轉去 handoff 度寫低但未量過嘅一條：**「返嚟之後仲記唔記得你」**。

第一輪探路量錯咗方向：我掃十二個介面嘅 localStorage，見到九隻「玩完一個字都
冇寫低」，差啲當咗係九個病。查 Neon Snake 先發現佢有成套 profile／高分系統,
淨係喺 game over 先寫——**係我把尺掃唔夠，唔係佢冇記**。掃唔到同掃唔夠喺報告
度長得一模一樣，呢個已經係今個 session 第三次踩。

轉去一條量得準嘅：**你切去另一個 tab，隻遊戲有冇繼續打？**

### 一 grep 就知答案

成個 repo 得 **Tower 同 Racing Car** 有 `visibilitychange` handler。
MOBA、Empire Royale、Neon Snake、Snooker 一個都冇。

實測（隱藏六秒）：

| | 場鐘 | 隱藏期間 |
|---|---|---|
| Tower（對照，已守） | gold＋wave＋敵人數 | **0** |
| 深淵之橋 MOBA | `__sim.time` 2.8 → 11.4 | **＋8.6 秒** |
| Empire Royale | `__royale.game.time` 176.5 → 169.0 | **−7.5 秒**（倒數） |

MOBA 一場十六分鐘。你去覆個訊息返嚟，已經送咗一血。

### 量法有兩個位企唔穩，都要修

1. **`bringToFront` 喺 headless 之下唔會令個頁隱藏。** 第一版量到
   `document.hidden === false`——即係成個量度冇量過任何嘢。改用 override
   `document.hidden`／`visibilityState` 再派 `visibilitychange`，同 Tower 自己條
   gate（`tests/flow.mjs` 嘅 `setVisibility`）一模一樣。而且要試嘅本來就係隻遊戲
   對呢個事件嘅反應，唔係瀏覽器對背景 tab 嘅節流——嗰個係瀏覽器嘅事。

2. **「隱藏期間畫面有冇郁」分唔開停冇停。** Tower 真係停咗，但佢個暫停畫面自己
   會呼吸，照樣報「有郁」。所以逐隻遊戲寫明個鐘讀邊個 seam，**冇 seam 就唔好
   扮量到**（條 gate 讀唔到鐘會報紅，唔會報綠）。

仲有一個位：讀第一個數要**喺隱藏之後**先讀。讀完先隱藏嘅話，中間影相／evaluate
嗰一兩秒都會計落個差度，一個真係識停嘅遊戲都會報「行咗 1.7 秒」。

### 改法：跟 Tower 定落嗰套

停低、講明點解、而且**返嚟唔會偷偷續**——你返嚟嗰一刻手指仲未擺返個位，即刻
恢復等於幫你按咗「繼續」但你未準備好。MOBA 同 Royale 兩邊都係：

- 隱藏 → 把本來行緊嘅迴圈停低（`state.running` / `running`），記住「係我停嘅」。
- 返嚟 → 出一句「你切走咗，已經幫你暫停 — 撳一下繼續」。
- 真係撳／掂／禁任何一下 → 重設 `last`（唔係嘅話第一格個 dt 係「停咗幾耐」，
  即刻追一大步）先至續。

呢兩個位都唔係新發明：MOBA 自己 `onContextLost`／`onContextRestored` 已經係同一
個形狀，連 `last` 要重設嘅理由都寫咗喺註解度。

### Neon Snake：剷咗一次，補返一個對照之後先做得成

Snake 都冇 handler，而佢個 `isPaused` 旗現成，改動係十二行。但第一次**驗唔到**：
把尺量到「隱藏前後 tick 都係 36」，我一度當咗係成功——直到突變測試（拆走
handler）**照樣量到 36 → 36**，先知係條蛇喺量度窗口之前已經死咗，即係個數由頭到
尾冇行過。一個喺「修咗」同「拆咗」兩種情況下讀數一樣嘅量度，證明唔到任何嘢，
所以嗰陣剷咗。

**跟住補返嘅係一個對照：隱藏之前，個鐘要真係喺度行。** 呢個對照即刻捉到兩樣嘢：
①Tower 嗰個鐘（gold＋wave＋敵人數）喺備戰嗰幾秒完全唔郁，換成 `prepTimer`；
②Snake 喺量度窗口之前已經死咗——**個問題一直喺度，只係之前冇嘢問過佢**。

但 Snake 到最後都用唔到「場鐘」呢種證據：佢無人揸就會撞牆，而一死個 tick 就停,
「停咗」同「死咗」永遠讀數一樣。所以改用一個更貼近傷害嘅證據：
**你切走六秒返嚟，係咪已經玩完咗。** 呢個正正就係玩家實際感受到嗰件事。
突變（拆走 handler）之下 `返嚟玩完咗: true`，有修就 `false`——分得開。

Snooker 3D 同樣冇 handler，未量。

### 把尺

`tests/hub-away.mjs` 3/3：①**每個場鐘喺隱藏之前都要真係喺度行**（冇呢個對照，
一隻死咗嘅遊戲會扮到守得好好）；②切走期間場鐘唔可以行（容許 0.5，實測停咗係
實實在在嘅 0，未修係 8.6／7.5）；③Neon Snake 切走六秒返嚟唔可以已經玩完咗。
三個突變分別令對應嘅 check 報紅，而且叫得出係邊隻。

## ADR-216 — MOBA: 兩條偶發 gate，一條查到底修咗，一條查到證據但唔亂修

Date: 2026-08-09. Status: accepted.

呢一輪本來想接住 ADR-212 繼續搞 MOBA 嘅重量，但一開頭就發現**嗰件事已經
喺 `main` 度做咗**（`247f1cd`，量到 12.7 秒，連 `落一批`／`載戰場` 嘅名都一樣）。
我手上兩個 commit 係重複品，剷咗，由 `origin/main` 重新開始——同 ADR-214
入面另一邊做嘅嘢一樣。**兩個 agent 撞同一件事嘅時候，後推嗰個唔應該堆上去。**

跑咗五次 `moba/tests/browser.mjs`（每次 ~12 分鐘）之後，見到嘅唔係重量問題，
係**條 suite 自己有兩處偶發**。196 條 check 入面兩條會間歇性報紅，而佢哋報紅
嘅時候完全似真病。

### 一、`普攻會真係揮動作` ——查到底，修咗 fixture

紅嗰次個報告：`swinging: false`、`clip: "Idle_Combat"`，但 `事件序` 入面
`attack*` 係喺度嘅——**手出咗，係 rig 冇播**。

第一個診斷係錯嘅：我見到 `事件序` 開頭係 `["damage","hit*","attack*",…]`，
就當咗係「同一格畀人打中，受擊動作蓋咗揮擊」。但睇 `rig.js` 就知唔通——
受擊都係行 `once()`，而 `once()` 一定會 set `lockUntil`，即係 `busy` 會係 **true**。
`busy: false` ＋ `clip: Idle_Combat` 即係**乜一次性動作都冇播過**。

真正嘅線索喺同一份報告度：**`重生: 0.13`**——量嗰陣玩家仲喺重生窗口裏面。

而條 test 自己嘅註解老早就寫咗呢個機制：「玩家喺暖機期間死過又重生……
`#consumeEvents` 先播攻擊，`#syncUnits` 跟住 `revive()` 抹走個鎖」。佢當時
嘅補鑊係「兩層一齊暖機」——但**淨係咁唔夠**：如果暖機啱啱喺重生窗口裏面收工，
`p.alive = true` 只係喺 sim 層扮咗佢生返，`respawnAt` 仲喺未來，落一格
`#syncUnits` 照樣 `revive()`。

改法：fixture 度清埋 `p.respawnAt = 0`（本來已經清咗 `stunUntil` /
`rootUntil` / `recallUntil` / `cd`，就係漏咗呢個）。**改嘅係 fixture，
唔係條斷言**——條 gate 一個字都冇放寬。改完 `重生` 由 `0.13`（未來）變
`-84.4`（過去），揮擊 check 過。

中途我試過另一個改法：將 `busy` 由「讀一格」改成「喺一個窗口入面取樣」。
跑完發現 `第幾格揮: 0` 全部——即係個窗口一次都冇用過，而條 gate 照樣紅咗
另一處。**一個修唔到你嗰個病、又永遠唔會執行嘅改動，唔應該留低。** 剷咗。

### 二、`玩家企喺畫面下半但唔會跌出畫外` ——查到證據，但唔亂修

五次跑入面紅咗兩次，而且兩次嘅數完全唔同方向：

| | 玩家x | 鏡頭焦點 | 玩家由頂計 | 夾界 |
|---|---|---|---|---|
| 紅（一） | −6.1 | −14.8 | **32.1** | 58 |
| 紅（二） | −5.7 | −50.x | **−28.6** | 58 |

第二次個焦點離玩家成 44 個單位，而 `收斂咗: true`（用咗 11 幀）。即係鏡頭
「收斂」到一個唔喺玩家度嘅位。

**唔喺呢一輪修**，理由有兩個：一，紅嘅其中一次，我當時手上嗰個改動係
**證實冇執行過**嘅（`第幾格揮: 0`），所以佢同我無關，係本來就偶發；
二，我冇重現到，而喺一個重現唔到嘅情況下改鏡頭邏輯，就係今日已經犯過一次
嘅嘢。留低數同機制描述，畀下一個人由呢度開始，好過我估一個。

## ADR-215 — Hub: 儲存唔到，唔應該連遊戲都開唔到

Date: 2026-08-09. Status: accepted.

Payload 呢條線榨完之後轉去一個從來冇人量過嘅範圍：**儲存**。

三種真實情況會令 `localStorage` 唔用得——Safari 無痕（`getItem` 用得但
`setItem` 掟 QuotaExceededError）、封咗 cookie／第三方 storage（連
`window.localStorage` 呢個 getter 都掟 SecurityError）、儲存空間滿。
呢個 repo 有三十幾處 `setItem`，散落六個 codebase，冇一個介面驗過。

### 量到咩

把兩個 storage 都換成會掟嘢嘅版本，十二個介面逐個開：

| 遊戲 | 見得到嘅控制（正常 → 封存） | 新增 error |
|---|---|---|
| **Racing Car 3D** | **51 → 0** | SecurityError |
| **Neon Snake** | **1 → 0** | SecurityError |
| Gomoku／Snooker／Empire Royale／Xiangqi AI | 冇少 | 各一個 SecurityError |
| 其餘六個 | 冇事 | — |

即係無痕模式／封咗 cookie／空間滿嘅玩家，**有兩隻遊戲係開都開唔到**。

### 修法：改枱面，唔係改每一次落枱

逐個 `setItem` 包 try 係改三十幾次，而且下次加新碼一樣會漏。所以做咗一個
`games/shared/js/safe-storage.js`，喺**任何遊戲碼之前**行一次：摸得到又寫得到
就乜都唔郁；摸唔到或者寫唔到就換一個記憶體版落去。讀嗰邊做 read-through
（記憶體冇就問真嗰個）——無痕模式下舊存檔仲讀得返，唔應該因為寫唔到就連讀
都放棄。記憶體版留唔到嘢過下一次開頁，但本來都留唔到，**分別係「玩得到」
同「開唔到」**。

### 加落去嗰陣撞到三個「特例規則」

1. **xiangqi 個 `vite.config.js` 寫死咗 `online_utils.js` 一個檔名**去做
   `../shared/` → `../../shared/` 嘅路徑上移。加第二個共用檔就靜靜雞唔改寫、
   dist 度 404——而 dev 度係好嘅，所以**喺自己部機試唔到**。改成通用 regex。
   （我中途估過係註解入面有個字面 `<head>` 搞亂 parser，改咗照樣唔得——
   **估錯咗就要驗，唔好當咗係答案。**）

2. **snake 個 `postbuild.mjs` 改「第一個有 src 嘅 script」**。我加咗
   `safe-storage.js` 落 `<head>` 之後，「第一個」變咗佢：真正嗰個 module tag
   冇轉成 defer，而佢自己條 assert **照樣報 OK**——因為佢淨係問「有冇一個
   defer script」，而我啱啱整咗一個出嚟。改成指名搵 `type="module"`，
   再加多兩條「係咪嗰個」嘅 assert。**一條問「有冇」而唔問「係咪嗰個」嘅
   守衛，喺呢種時候會幫倒忙。**

3. **snake 個 dist 本來就同 `npm run build` 出唔到嚟嘅一樣。** 我 rebuild 完先
   見到：committed 嗰份 `<style>` 入面引住 `../../../assets/fonts/*.woff2`
   （全 hub 共用、玩家喺 hub 度已經 cache 咗），但 Vite 會處理 `<style>` 入面嘅
   `url()`，抄成 `./assets/<名>-<hash>.woff2`——**同一批字型要再落多 57 KB**,
   repo 入面又多一份重複。即係嗰份 artifact 唔可重現，**下一個人 build 一次
   就會靜靜雞倒退**。喺 postbuild 度改返指共用路徑、順手刪走抄出嚟嗰四個檔,
   再加一條 assert 守住。

   （條 assert 第一次寫錯：`/\.\/assets\/…\.woff2/` 喺一個已經修好嘅檔上面照樣
   報紅——因為 `../../../assets/` 本身就含住 `./assets/` 呢一串字。加返個引號
   錨先分得開。**一條喺「已經啱」嘅輸入上面報紅嘅 assert，同冇 assert 一樣壞。**）

### 把尺

`tests/hub-storage.mjs`，兩條：封住 storage 之後（a）見得到嘅控制唔可以少過
正常嗰陣、（b）唔可以多咗 browser error。兩條都同「同一版正常嗰陣」比，
唔用寫死嘅數——一隻遊戲改咗版面唔應該令呢把尺報紅。2/2。

突變（拆走 Racing Car 嗰個 script tag）兩條一齊報紅，而且叫得出係邊隻、
由 51 個控制跌到 0。

## ADR-214 — Hub: 捉到漏網之後，要改嘅係網

Date: 2026-08-09. Status: accepted.

呢一輪我同另一個 agent 撞咗同一件事（MOBA 拆資產），佢先推咗（ADR-212，
量到 12.7 秒，比我量到嘅 13.6 秒好）。我剷咗自己嗰個重複嘅 commit，
由 `origin/main` 重新開始。剩返嘅係佢冇做、而我查到嘅兩件事。

### 一、漏網補咗一個位，冇補張網

ADR-210 加咗 `games/shared/js/byte-progress.mjs`，MOBA 嘅 `browser.mjs`
即刻報紅（「冇版本標記」）。修法係喺 `assets.js` 手動寫咗個 `?v=assets-28`。

但 `scripts/moba-bump-cache.mjs` 開頭第一段註解就寫住佢存在嘅理由：
「三十幾個位手改一定漏」。**手動補一次，即係下次 bump 一樣會漏。**
個 regex 由「同層 `./x.js`」擴到埋「共用層 `../../shared/js/x.mjs`」之後，
bump 一次 42 個位（連共用層）一齊改。

### 二、改咗碼但冇 bump token

`247f1cd` 改咗 `games/moba/src/{assets,main}.js`，但 token 一直留喺
`assets-28`。`?v=` 唔變，返轉頭嘅玩家個瀏覽器就照用 cache 入面嗰份——
**個拆分根本到唔到佢哋度**。呢個正正係 ADR-111／ADR-108 講嗰個病。
bump 去 `assets-29` 之後先算真係出到街。

### 三、把尺捉到「冇標記」，捉唔到「標記落後」

突變測試（用返舊嘅 bump regex bump 去 `assets-30`）揭到：`byte-progress.mjs`
留喺 `assets-29` 而其餘去咗 `assets-30`，而 `cache-bust.mjs` **照樣報 PASS**。

因為佢條 regex 都係淨係睇同層 `./x.js`——共用層嗰個 import 喺佢眼中唔存在。
`browser.mjs` 嗰條「每個請求都要有標記」捉到「冇標記」，但捉唔到「標記落後」。
**兩種壞法喺報告度長得唔同，要分開守。** 兩條 regex 一齊擴，突變即刻報紅
而且叫得出係邊個 import、落後咗幾多。

## ADR-213 — Empire Royale: 查完決定唔改，同埋一個我證偽咗嘅假設

Date: 2026-08-09. Status: accepted（結論係「唔改」）。

ADR-212 之後最重嗰隻係 Empire Royale（1,915 KB）。呢一輪查咗佢，**結論係唔改**。
記低係因為下一個人唔應該由零再查一次。

### 先搞清楚啲時間去咗邊

`hub-wait` 報「等咗 20.3 秒」。我第一個念頭係「1,915 KB 喺 Fast 3G 只需 9.2 秒,
即係有十一秒係 CPU（Draco 解碼＋`buildArena`＋`generateCardThumbs`）」——
如果照住呢個念頭去做，就會去優化一個唔存在嘅樽頸。

實測（分開量「最後一個 byte」同「見到選單」）：

| | 落 | 最後一個 byte | 見到選單 | 落完之後 |
|---|---|---|---|---|
| Fast 3G | 1,915 KB | 14.5s | 14.5s | **0.0s** |
| 冇節流 | 1,914 KB | 3.8s | 3.8s | **0.0s** |

**佢係徹頭徹尾嘅下載瓶頸**，落完之後嘅 CPU 近乎零。

（量嘅時候第一版寫錯咗個「幾時算完」：Royale 係 `.remove()` 個載入畫面，
唔係加 `.hidden`，所以我條 `waitForFunction` 等足 180 秒逾時。）

### 三條減磅嘅路，逐條量咗

1. **簡化幾何。** 啲 Meshy 生成模型過度細分得好緊要——`main_base` 83,895 個
   三角、`side_tower` 82,071、`cavalry` 47,346，而手機上面一隻兵得四十幾 px 高。
   但 `simplify --ratio 0.5 --error 0.002` ＋ 重新 Draco 之後：**1,379 → 1,204 KB,
   得 13%**；ratio 0.3 都只係 1,173 KB。三角好多唔代表 byte 好多——Draco 嘅
   熵編碼本來就食咗大部分冗餘。**用睇得出嘅畫質換 13%，唔抵。**
   （過度細分係真嘅 GPU／解碼成本，但唔係呢度嘅 payload 成本。）

2. **貼圖。** 34 個 GLB 加埋，貼圖合共 **0 KB**——全部係幾何同骨骼動畫。
   冇嘢好縮。

3. **延後（ADR-212 對 MOBA 用嗰招）。** 但 Royale 開場就 `buildArena(scene)`
   同 `generateCardThumbs()`，即係場景件同兵種模型喺選單度本來就要用。
   真正「入咗場先用」嗰批得：攻城車 42＋投石車 42＋箭 13＋石 11＋出兵標記 17
   ＋塔廢墟 17 ＝ **142 KB，佔 7%**。要拆散 `buildArena` 換 7%，唔抵。

**所以唔改。** 佢已經有逐格行嘅進度條同 MB 數字（ADR-210），而 14.5 秒喺
Fast 3G 落 1.9 MB 係一個誠實嘅數。

### 一個我證偽咗嘅假設

查嘅途中我以為捉到把尺嘅病：`hub-wait` 每 0.7 秒影一張 JPEG，我推論影相拖慢
咗個頁，所以佢報 20.3 秒而真數係 14.5 秒。我照住改咗把尺——加咗一個唔影相嘅
A pass 專門量時間。

**但實測推翻咗個假設**：MOBA 兩個 pass 量到 **12.7 vs 12.6 秒**，完全冇分別。
而我加嗰個 A pass 自己仲整壞咗兩個讀數（Tower 個 `#start-btn` 一開波仲未存在,
被當成「唔等緊」→ 量到 0.4 秒；Royale 用 `new Function` 每 200ms 重新 parse
→ 量到 41 秒，比佢想量嗰樣嘢仲慢）。

所以個改動剷咗，`hub-wait` 維持原樣。Royale 20.3 vs 14.5 嘅差距**仲係未解釋**
——同一日唔同次跑本來就有波動（今日跑到 17.7 同 20.0），我冇證據話係影相
造成。**一個未證實嘅機制唔可以寫入把尺**；寧願留低「未解釋」呢三個字。

## ADR-212 — MOBA: 你要等埋 576 KB 你喺揀人嗰陣一眼都見唔到嘅嘢

Date: 2026-08-09. Status: accepted.

ADR-211 之後最重嗰隻係 MOBA（2,529 KB、Fast 3G 等 16.0 秒）。入面 888 KB 係
`anims.glb`——**純動畫，冇 mesh，所以 Draco 壓唔到佢**（Draco 係幾何編碼）。

### 先量咗兩條路先揀

1. **刪冇用嘅 clip**：23 個 clip 入面 22 個都用緊，得 `Spawn_Ground`（29 KB）
   冇人叫。個檔本身早就揀過，冇得刪。
2. **resample**：tolerance 0 → 888 KB（冇分別）、0.001 → 825 KB，而 0.001
   已經開始改到動作。動畫本身係密嘅，唔係有水份。
3. **meshopt**：888 → 637 KB（−28%），decoder 得 ~25 KB。量埋誤差：
   旋轉最多 **0.83°**、位移 9.75e-4、縮放 2.42e-4。
   （量誤差嗰陣自己撞咗兩次：先係攞量化過嘅 int16 直接同 float32 比，
   報 3.28e+4；再係逐個數比四元數，報 2.0——其實係 **q 同 −q 係同一個旋轉**，
   要按 channel 嘅 target path 分開、用角度比先啱。）

meshopt 淨賺 226 KB（−9%），但係有損、要加 decoder、要改 build。

### 但量嗰陣見到一個更大嘅槓桿

`portraits.js` 淨係要 `unit('champ', …)` 同 `clip('Idle_Combat')`；
`arena`（246 KB）、`weapons`（98 KB）、三隻小兵（232 KB）**全部只喺 `view.js`
入面用**，即係開咗場之後先用得着。但以前一次過落晒——你要等埋 576 KB 你喺
揀人嗰陣一眼都見唔到嘅嘢，先至畀你揀人。

拆開之後（Fast 3G，390×844）：

    揀人版出到    16.0s → **12.7s**
    到嗰時落咗    2,529 KB → **1,946 KB**

**呢個唔係壓縮，係重排時間軸**——一個 byte 都冇少，但你早咗 3.3 秒見到你
要做嘅決定，而其餘 576 KB 喺你睇緊六張英雄卡嗰陣落。所以呢一輪冇做 meshopt：
同樣嘅工夫，一個係無損早 3.3 秒，一個係有損慳 9%。

### 撳「開打」而場未起好

唔可以扮冇事開場。但**「撳咗冇反應」比「等耐咗」更難頂**（ADR-209 同一句），
所以個掣照撳得：撳完寫住「準備戰場…」，落完自己入場。實測即刻撳嘅話
2.3–3.1 秒入到場，零 error；慢慢揀嘅話撳完 2.8 秒入場，個掣一路寫住「開打」。

### 兩個記錄

1. **「擺喺 `renderPortraits` 之前定之後」實測係一樣**（13.0 vs 13.1 秒，
   兩次都係 1,946 KB）。我本來寫咗一句「兩批同時搶頻寬，等於冇 defer 過」
   ——係錯嘅：render 六個頭像嗰段係 CPU 密集、網絡閒住，第二批喺嗰段時間
   度落，本來就搶唔到頻寬。**個註解要講返實測到嘅嘢，唔係我以為嘅機制。**
2. **MOBA 有個版本標記契約**（每個攞落嚟嘅專案檔都要帶 `?v=`），我個新
   `import` 冇帶，`browser.mjs` 即刻捉到。同一輪入面另一條「打直：玩家企喺
   畫面下半」報過一次紅，再跑兩次都綠——**係嗰條 check 本身唔穩，唔係呢個
   改動整出嚟**（冇當佢係我整壞咗，亦冇當佢冇事發生過）。

### 驗證

`moba sim` 262/262、`moba browser` 196/196、`cache-bust` PASS；
`hub` 96/96、`hub-touch` 5/5、`hub-load` 3/3、`hub-wait` 1/1、`hub-cdn` 3/3。

## ADR-211 — Tower: 一千零八十七 KB 未壓過嘅模型，而隔籬兩隻遊戲一路壓緊

Date: 2026-08-09. Status: accepted.

ADR-210 令三隻重型 3D 遊戲載入嗰陣有咗交代，但**重量本身一直未郁過**：
MOBA 2,527 KB、Royale 1,913 KB、Tower 1,291 KB，全部喺開場畫面就落晒。

其中 Tower 嗰 1,291 KB 入面 **1,087 KB 係未壓過嘅 GLB**——而同一個 repo 入面
MOBA 同 Empire Royale 老早就用緊 Draco（`draco_decoder.wasm` 喺佢哋嘅請求
清單度一直望得到）。即係呢個 repo 自己已經有答案，只係有一隻遊戲冇跟。

### 揀邊種壓縮：量咗三條路先揀

78 個檔逐個壓，量埋 decoder 成本：

| | 模型 | decoder | 合共 |
|---|---|---|---|
| 原本 | 1,183 KB | — | 1,183 KB |
| meshopt | 762 KB | ~25 KB | 787 KB |
| **Draco** | **379 KB** | 246 KB | **625 KB** |

meshopt 個 decoder 細好多（25 KB vs 246 KB），但佢喺呢批模型上面只壓到
64%，Draco 壓到 32%。decoder 係一次性成本而且跨次訪問 cache 得住，
模型係每次都要落——所以揀 Draco。

實際落到嘅數（gzip 照 GitHub Pages 嘅規矩模擬）：**1,291 → 754 KB，−42%**。
其中 GLB 由 1,087 → 348 KB。

### 源檔唔壓

Draco 係有損（位置量化到 14 bit）。`public/models/` 保持原樣，壓縮淨係喺
`scripts/postbuild.mjs` 對住 build 出嚟嗰份做，而且做成 idempotent
（已經有 `KHR_draco_mesh_compression` 就跳過）。壓失敗**大聲掟錯**，
唔可以靜靜雞派一個冇壓嘅檔出去——嗰樣會變成「有時得有時唔得」嘅 bug。

Decoder 同源派（`dist/draco/`）。ADR-209 啱啱先為咗一個 parser-blocking 嘅
CDN script 掃過成個 hub，唔會喺呢度自己再種一個外部依賴。

### 兩把尺跟住修

1. **`hub-load` 一直冇 gzip。** GitHub Pages 會 gzip 文字資產，而個 test
   server 冇——Tower 個 bundle 實際落 202 KB，佢報 823 KB，差成四倍。
   同一日已經喺 ADR-210 度因為冇送 `Content-Length` 撞過一次；
   **一把量唔到真實情況嘅尺，講嘅係佢自己。** 修完全 hub 嘅數都真實咗
   （Big Two 111 → 32 KB、Dou Dizhu 120 → 36 KB）。

2. **新一條 check 令呢件事守得住**：GLB 落多過 300 KB 嘅遊戲，啲有幾何嘅
   模型要壓過。唔靠 grep build script（改咗名就守唔到），而係**讀真正派
   出去嗰個 GLB 嘅 glTF header**睇有冇聲明 `KHR_draco_mesh_compression`
   或者 `EXT_meshopt_compression`。純動畫檔（冇 mesh）唔當佢係漏網——
   MOBA 嗰 888 KB `anims.glb` 冇幾何，壓縮擴充對佢冇意義。
   300 KB 呢條線由實測定：未壓之前 Tower 1,087／MOBA 1,997／Royale 1,343,
   而 Racing Car 216——300 喺兩堆之間，離兩邊都遠。

   突變（將五個敵人模型換返未壓嘅源檔）令佢報紅，而且叫得出係邊五個檔。

### 驗證

Tower 全套三個 suite 過晒（core／browser 5/5 + 6/6 + …／render 20/20）——
包括 `units.mjs` 嘅高度／footprint／輪廓同 `look.mjs`，即係 Draco 嘅量化
冇整走任何一個幾何 gate。

## ADR-210 — Hub: 有字唔等於有交代——進度嘅單位揀錯咗

Date: 2026-08-09. Status: accepted.

一輪「入到局要落幾多」嘅探路，第一個結果就推翻咗我個前提：
**七隻遊戲入局後全部 ＋0 KB。** 唔存在「入到局先落」呢件事——每隻遊戲喺你
仲喺開場畫面、未決定玩唔玩嗰陣，就已經落晒。所以真正嘅問題唔係「入局要
落幾多」，係「落緊嗰陣你睇唔睇得出佢仲行緊」。

### 量到咩

Fast 3G、390×844，量「載入畫面出緊嗰陣，畫面最長靜咗幾耐」：

| 遊戲 | 落 | 最長靜默 |
|---|---|---|
| Tower（ADR-203 修過） | 1,291 KB | **0.0s** |
| 深淵之橋 MOBA | 2,527 KB | **23.6s** |
| Empire Royale | 1,913 KB | **14.4s** |

兩隻都**有字**——「載入資產…」「載入模型中…」——但個字十幾廿秒都唔郁,
條 bar 一直 0%。**有字唔等於有交代。**

### 根因：唔係冇寫進度，係進度嘅單位揀錯咗

兩邊都係 `Promise.all` 平行落十幾個 GLB，而進度用「幾多件落完 / 總共幾多件」
計。平行落嘅時候頻寬係分薄嘅——**冇一件會早早完成**，所以個數由 0 一路企到
最後先跳去 100。改成量位元組（新 `games/shared/js/byte-progress.mjs`，兩隻共用）
就逐格郁：MOBA 由「0/12 企 13 秒」變成 MB 數字逐秒行。

### 唔知總數就唔好報一個數

伺服器冇送 `Content-Length` 嘅話 `e.total` 係 0，總數真係唔知。呢種時候
報 0% 就係退返去原本個病。所以 `建位元組進度` 喺呢種情況報 `null`，UI 出
一條 indeterminate 嘅掃光 bar ＋ 逐秒郁嘅 MB 數字（`prefers-reduced-motion`
之下改成明滅，唔會有橫向移動）。**一條假嘅 0% 比冇 bar 更差**——玩家會以為
佢卡死咗。

### 四個「把尺講緊自己」嘅記錄

1. **量「見唔見到個開始掣」量到 0.08 秒**：啲掣係靜態 HTML，parser 一行到
   就見到。（同 ADR-209 同一個錯，喺同一日再犯一次。）
2. **量到 MOBA「靜默 75 秒」**：其實佢喺揀英雄畫面度等緊你。靜默只喺
   「你仲等緊」嗰段先算數。**一條分唔開「卡住」同「等你」嘅 gate 係壞 gate。**
3. **「撳得到」用 regex 撞**：MOBA 個掣寫「開打」（regex 冇），Racing Car 個
   `#start-btn` 喺 `top: 1851`（844 高嘅畫面下面成千 px，要捲）。兩次都報
   「從來冇」，兩次都係掃唔到。改成逐隻遊戲寫明 selector。
4. **我個測試伺服器冇送 `Content-Length`**（`writeHead` 之後 Node 轉咗 chunked），
   所以 `e.total` 係 0、百分比卡死喺 0%。GitHub Pages 一定會送。
   **一把量唔到真實情況嘅尺，講嘅係佢自己**——我差啲就當咗係產品有病。

### 把尺

`tests/hub-wait.mjs`：載入畫面出緊嗰陣，畫面唔可以靜過 3 秒。門檻由實測定
——修好之後三隻都係 0.0s，未修係 23.6／14.4s，3 秒喺中間離兩邊都好遠。
突變（MOBA 退返「幾多件落完」）令佢報紅，而且叫得出係 MOBA、靜咗 10.7 秒。

## ADR-209 — Hub: 一個 CDN 慢，可以令到六隻本來全本地嘅遊戲乜都唔郁

Date: 2026-08-09. Status: accepted.

一輪「玩落去有冇嘢爆」嘅探路（十二個介面，開場→撳開場掣→亂撳亂禁一輪），
撞到六隻遊戲喺 HTML 度寫住同一句：

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

冇 defer 冇 async——即係**塞住 parser**：呢句未行完，跟住嗰啲本地遊戲碼一行
都行唔到。

### 量咗先講

第一版把尺量錯：攞「見唔見到個開場掣」做憑據，量到 0.08 秒。個數啱，但答緊
另一條問題——啲掣係靜態 HTML，parser 一行到就見到，同 CDN 通唔通完全冇關。
要量嘅係「隻遊戲自己嘅碼幾時先行得到」，即係 DOMContentLoaded。

第三方 origin 吊 8 秒（模擬 CDN 唔通但唔即刻死，即真實網絡最常見嗰種）：

| 遊戲 | 即刻失敗 DCL | 吊 8 秒 | 差 |
|---|---|---|---|
| Gomoku / Big Two / Dou Dizhu / Snooker | 0.04–0.11s | 8.03s | **+7.9~8.0s** |
| Xiangqi AI | 0.49s | 8.38s | **+7.9s** |
| Empire Royale（本來就 lazy） | 0.42s | 0.37s | −0.05s |
| Tower（冇第三方，對照） | 0.31s | 0.26s | −0.05s |

**吊幾多秒就遲幾多秒，一比一。** 而 FCP 照樣 0.08 秒——即係畫面畫咗一半就唔郁，
睇落好似 ready 咗但撳乜都冇反應。個 SDK 淨係「真人對戰」用得着；單機／人機
玩家一世唔會用到佢，但一樣要等。

### 改法：抄返自己屋企已經行緊嘅寫法

Empire Royale 老早冇呢個病——`royale/src/net.js` 揀咗玩家真係撳落去先攞 SDK，
連理由都寫咗喺註解度。呢一輪做嘅係將同一個做法搬上 `shared/js/online_utils.js`
（`loadSupabaseSdk()`），六個 HTML 度嗰句 parser-blocking script 全部拆走，
五個 `online.js` 嘅 init 改成「冇 SDK 就攞完再入返嚟」。

### 順手補返一個本來就有嘅窿

由「開頁就攞」改成「用到先攞」，中間有段時間 SDK 未到。但呢個窿其實本來就有：
SDK 攞唔到嗰陣，`joinFixedRoom` 見到冇 client 就**靜靜雞 return**——撳落去乜都
唔會發生，連錯都唔報。以前撞唔到，係因為成版嘢都未郁，玩家根本撳唔到。
所以加咗 `holdOnlineEntries()`：攞緊 SDK 嗰段時間擺個佔位守住入口，撳到就話
「連線服務載入中…」，SDK 到咗幫你叫返真嗰個，到唔到就照實話你知。

### 三個「量錯／守唔到」嘅記錄

1. **「已經有真嘢就唔踩」係反轉咗嘅。** 呢啲 `online.js` 係 classic script，
   `async function joinFixedRoom() {}` 一 parse 就已經係 `window.joinFixedRoom`
   ——「已經有真嘢」永遠成立，個佔位一世擺唔落去。改成照踩、記住原本嗰個。

2. **同一句碼喺三種載入方式下面行為唔同。** classic script 入面
   `window.joinFixedRoom` 同頂層函數綁定係同一樣嘢，所以擺完佔位之後
   `window.joinFixedRoom = joinFixedRoom;` 係將佔位指返自己，真嘢永遠掛唔返，
   之後每一撳都多彈一句「載入中…」。Snooker 冇事（全域名同函數名唔同），
   Xiangqi 冇事（module）。改成 SDK 一到就自己卸下個佔位。
   **呢個病係我親手整出嚟嘅，而且係把尺利咗之後先捉到**——第一版條 check
   問「係唔係 function」，而佔位自己都係 function，扮得過骨。

3. **一條分唔開「即刻有交代」同「等足八秒先有交代」嘅 gate 係壞 gate。**
   第 3 條 check 本來畀 8 秒窗口，突變測試（拆走佔位嘅 toast）照樣報綠——因為
   `loadSupabaseSdk` 自己 8 秒逾時嗰句「載入失敗」啱啱好頂咗上嚟。收窄到
   1.5 秒之後，突變即刻報紅，而且五隻遊戲一齊報。

### 把尺

`tests/hub-cdn.mjs`，三條：DCL 之差 ≤ 1 秒（實測噪音 ±0.11，個病 +7.9，
1 秒喺兩者中間離得好遠）；SDK 到得返真入口要掛返上去（用 `__holdingForSdk`
記號分，唔係淨係問 typeof）；SDK 未到撳落去 1.5 秒內要有交代。3/3。
三個突變分別令三條 check 報紅，而且報得出係邊隻遊戲。

## ADR-208 — Hub: 鍵盤契約——十二個介面本來就啱，三次紅都係我把尺錯

Date: 2026-08-09. Status: accepted.

之前三把尺（hub-touch、hub-load、Tower 自己嗰套）全部係量「用手指掂」。
但唔係人人用手指：用鍵盤嘅人、用開關掃描器嘅人、部電話插住實體鍵盤嘅人，
佢哋淨係得 Tab 同 Enter。`tests/hub-keyboard.mjs` 問兩句——每個控制 Tab
去唔去得到、focus 去到嗰陣睇唔睇得到。

**結果：十二個介面全部本來就啱，一行遊戲碼都冇改。** 呢一輪嘅交付品係
把尺本身，同埋三個「量錯」嘅記錄。三次報紅全部係我把尺嘅問題，
每次都要驗到底先知——**如果就咁信咗，我就會去「修」三樣本來冇壞嘅嘢。**

### 第一次紅：Tower 21 個控制得 6 個 Tab 到

睇落好嚴重。實情係 Tower 開場畫面係 modal，`syncModalIsolation` 將 modal
以外嘅嘢全部設成 `inert`——**你未開波之前本來就唔應該 Tab 到 pause 掣**。
嗰 15 個係特登唔畀掂嘅。

改法唔係逐個機制去認（inert／aria-hidden／disabled／tabindex=-1…），
而係問一條唔關機制事嘅問題：**佢究竟收唔收得到 focus？**
收得到就一定要 Tab 去到；收唔到就係特登擋住，唔關 Tab 事。

### 第二次紅：兩個「focus 冇提示」

`.nav-btn:focus-visible` 明明寫住換 background。點解量到冇變？
因為佢寫住 `transition: background 0.2s`，而我禁完 Tab **即刻**讀 computed
style——讀到嘅係動畫第 0 格，即係仲未變色；跟住 blur 再讀，又係差唔多。
兩邊一樣，於是報「冇提示」。

**同閃光 gate（ADR-202）一模一樣嘅錯：喺一個過渡緊嘅嘢上面攞 t=0 嗰一格。**
等 260ms 先讀，兩個紅一齊冇咗。

### 第三次紅：Racing Car 18 個控制得 17 個

呢個最陰：`hub-btn` 收得到 focus、喺 DOM 度又排得幾前，但 Tab 掃唔到。
實情係**掃唔夠**，唔係掃唔到——我嘅預算係「我數到嘅控制數 × 2 ＋ 8」，
但「我認為見得到嘅控制」同「成頁真係有幾多嘢 focus 得到」係兩個數：
我數到 18，實際遠遠唔止（六個賽道掣、八個顏色格、一堆開關），
禁足 26 下都未繞返轉頭。

**「掃唔到」同「掃唔夠」喺報告度長得一模一樣。** 預算改成對住成頁嘅
可 focus 總數計，即刻 18/18。

### 順帶：把尺唔可以慢到冇人跑

每禁一下 Tab 等兩次 260ms，十二隻遊戲要成八分鐘。改成同一個 id 只驗一次
（`驗過` set），快返幾倍。**一把慢到冇人肯跑嘅 gate，同冇 gate 分別唔大。**

## ADR-207 — Hub: 每個玩家一入嚟就落 847K，去畫兩個 52×52 嘅 icon

Date: 2026-08-09. Status: accepted.

ADR-203 喺 Tower 度量過載入成本。同一把尺掃成個 hub。

**量嘅係瀏覽器實際落咗幾多，唔係磁碟有幾大。** 磁碟上面 Snooker 27 MB、
Royale 21 MB、Racing Car 20 MB，但 Snooker 實際只落 **123 KB**——
嗰啲係冇 reference 到嘅資產同 vendored 源碼，落唔到玩家部電話度。
**兩個數差成二百倍，用錯嗰個就會去優化一件根本冇人落嘅嘢。**

實測（390×844，開場畫面直到網絡靜低為止）：

| 遊戲 | 落幾多 | 大頭 |
| --- | --- | --- |
| 深淵之橋 MOBA | 3,426 KB | glb 1,997K |
| Empire Royale | 2,682 KB | glb 1,344K ＋ js 1,286K |
| Tower Defense | 1,864 KB | glb 1,087K |
| Racing Car 3D | 1,556 KB | js 1,114K |
| **Hub launcher** | **904 KB** | **png 847K** |
| 其餘七個 | 76–596 KB | |

冇一個誇張。但 **hub launcher 係每個玩家第一個掂到嘅頁**，而佢 904 KB
入面 847 KB 係兩張圖：

| 檔案 | 大細 | 原尺寸 | 手機顯示 | 倍 |
| --- | --- | --- | --- | --- |
| `xiangqi_logo.png` | 498 KB | 640×640 | 52×52 | 12.3× |
| `doudizhu_logo.png` | 349 KB | 1024×1024 | 52×52 | 19.7× |

縮到 160×160（桌面最大顯示 72 × DPR 2 = 144，留少少頭位）：
WebP 10K、PNG 76K。用 `<picture>`——撐 WebP 落 10K，唔撐落返 PNG，
**保住原本個 logo，唔會 fallback 去一個唔啱嘅 emoji**（原本 `onerror`
係換做 🀄，對呢兩隻遊戲嚟講係錯嘅圖）。Hub launcher **904 KB → 68 KB**。

冇 PIL／ImageMagick／sharp，用 Chromium 自己嘅 canvas 縮。

### 兩條 gate，兩條都係量完先定

- **開場畫面 4 MB 上限。** 我第一版寫 5 MB，十二個一個都捉唔到——
  **一條分唔開任何嘢嘅線唔算 gate。**
- **圖唔可以大過佢最大顯示尺寸嘅 3 倍。** 呢條先係真正捉到嘢嗰條：
  904 KB 本身唔算誇張，**量「重量」係捉唔到佢嘅，量「倍數」先捉到**。

倍數要對住「**最大**會顯示到幾大」計，唔係對住其中一個 viewport。
我第一版淨係喺 390×844 度量，160 嘅 icon 喺手機顯示 52 就讀到 3.1 倍報紅
——但同一張圖喺桌面顯示 72，DPR 2 之下要 144，160 係啱嘅。
**對住最細嗰個 viewport 計倍數，等於叫人服務唔到大螢幕。**
而家兩個 viewport 都量，每張圖取最大顯示尺寸。

### Mutation 都做錯咗一次

第一次我淨係換返大 PNG，gate 照綠——因為 `<picture>` 服務緊 WebP，
大 PNG 根本冇落過。要連 `<source>` 一齊拆走，令個大圖真係被服務，
先驗到（8.9× 同 14.2×，hub 打回 905 KB）。
**拆嘅嘢要係「真係被用到嗰件」，唔係「睇落似嗰件」。**

## ADR-206 — Hub: 同一把尺掃十二個介面，二十四個掂唔到嘅掣

Date: 2026-08-09. Status: accepted.

ADR-202 喺 Tower 度砌咗把「真手機人體工學」嘅尺，捉到六個低過 44×44 嘅掣。
嗰把尺淨係量咗**一隻**遊戲。呢個 hub 有十二個介面，其餘十一個從來冇量過。
呢一輪就係將同一把尺掃過所有嘢。

### 四條問題，三條本來就乾淨

`tests/hub-touch.mjs` 喺 iPhone SE 375×667 度逐個開場畫面問四句：

| | 結果 |
| --- | --- |
| 十二個介面全部載得起 | **本來就過** |
| 開場零 browser error | **本來就過** |
| 375px 之下唔打橫爆版 | **本來就過** |
| 掂得到嘅控制 ≥ 44×44 | **八個介面、二十四個掣唔過** |

**三條乾淨嘅一樣有價值**：佢哋而家係守住嘅契約，唔係「我估冇事」。

### 捉到啲乜

| 介面 | 細掣 | 最嚴重 |
| --- | --- | --- |
| Empire Royale | **12** | hub／mute／help／quit 四個 40×40、五個分頁 58×**35**、模式掣 96×41、難度掣 96×43 |
| Hub launcher | 4 | carousel 圓點 24×24（**見下——唔係 bug**） |
| Tower Defense | 3 | 開場難度掣 81×**37** |
| Big Two／Dou Dizhu | 各 1 | `.btn--nav` 163×**39** |
| Penny Crush | 1 | `.pill-btn` 186×**42** |
| Racing Car 3D | 1 | `#hub-btn` **42×42** |
| Xiangqi AI | 1 | 返回掣 200×**43** |

**Tower 嗰三個要特別講**：佢哋係開場畫面嘅難度掣。ADR-202 嗰把尺係
**撳咗 START 之後先量**，嗰陣開場畫面已經收起——所以由頭到尾睇唔到。
一把尺嘅盲點唔會自己講出嚟，要另一把尺喺唔同時機量先捉到。

### 有理由嘅例外唔可以當 bug

Hub 嗰四粒 carousel 圓點，`style.css` 已經寫得好清楚：特登用 WCAG 2.5.8 嘅
**24×24** 而唔係 44，因為喺 320px 闊之下四粒各佔 44 已經 176，加埋兩個箭咀
88 就塞唔落——條線唔係唔想守，係幾何上守唔到；佢用間距保證每粒點嘅 24px
方框唔會互搶，箭咀就照守 44。

**一條會將深思熟慮嘅決定叫做 bug 嘅 gate，係壞 gate。** 但處理方法唔係將
標準由 44 改細——咁樣連真係壞嗰啲都會一齊放過。做法係**逐個寫明例外，
連理由一齊寫入把尺度**：

```js
const 例外 = [{ 揀: '.carousel-dot', 最細: 24, 因: 'WCAG 2.5.8；320px 度 44×4 塞唔落' }];
```

下次有人見到呢粒點細過 44，會喺尺度讀到點解，而唔係再嘈一次。

### 改法

一律落 `min-height`／`min-width`，唔加 padding——**真正嘅問題係「最細幾多」，
唔係「有幾多留白」**；加 padding 會連桌面版一齊變肥。

一個要記住嘅連鎖：Royale 四個角掣由 40 加到 44 之後，`#help-btn` 嘅
`right: 58px` 同 `#cam-controls` 嘅 `top: 58px` **係手算出嚟嘅「40 ＋ 間距」**，
唔跟住加就會迫埋一齊。兩個都加到 62。**改一個尺寸嗰陣，要搵返邊啲數
係由佢推出嚟嘅。**

修完再掃，仲有兩個先浮現（Royale 難度掣 96×43、象棋返回掣 200×43）——
**佢哋本來畀第一層擋住咗**。所以修完一定要再量一次，唔可以修完就當完。

### 驗證

`tests/hub-touch.mjs` 4/4，二十四個細掣清零。Mutation 驗過：
將 Royale 兩個修正還原，gate 即刻報紅，逐個叫出 `hub-btn` 40×40
同五個 `start-tab` 58×35。Tower 自己套件照樣全綠。

### 一個環境上嘅坑

Playwright 淨係裝喺 `games/tower/node_modules`（成個 repo 得嗰度有 package.json）。
呢個 test 係跨遊戲嘅，唔應該搬入 Tower 度住，所以做咗 fallback：先試普通
resolve，唔得就直接指去 Tower 嗰份，兩條路都唔通先掟錯，
**而且錯誤訊息會講返點裝**——一句「Cannot find package」對下一個人冇任何用。

### 補一輪：橫屏（同一個 ADR 下面）

第一版把尺淨係量直屏。**打機多數係打橫攞電話**，而橫屏係另一個方向緊
——高度得 375，任何靠垂直排嘅版面喺嗰度先爆。加咗第二個姿勢之後，
量嘅嘢由 12 個變 24 個組合，捉到兩樣：

- **Empire Royale `#rank-badge` 189×36（淨係橫屏）**。佢喺 `ui.js` 度 set 咗
  `tabIndex`／`role=button`／click handler，係真掂得到嘅嘢。直屏度個名同獎盃
  分兩行所以夠高，橫屏排返一行就得 36。**同一個元素喺兩個姿勢有兩個高度，
  淨係量一個姿勢係睇唔到嘅。**
- **四個「跌出畫面底」嘅控制，驗完全部唔係 bug**：MOBA 三張選角卡、
  Racing Car 嘅賽道掣，`scrollIntoView` 之後全部入到畫面，即係捲得到＝撳得到。

第二點值得寫低，因為我差啲又犯同一個錯。「喺畫面外」唔等於「掂唔到」——
ADR-202 就係讀咗 `#build-menu` 嘅 `overflow-x` 係 visible 就話「買唔到狙擊塔」，
其實捲喺入面嘅 `.build-grid`。所以呢條 check **唔靠讀 computed style 去估，
真係捲一次再睇**。天真版本會報四個假陽性，而我就會走去「修」四個本來冇壞嘅版面。

## ADR-205 — Tower: 輕微擴格，條路重畫，難度補返

Date: 2026-08-09. Status: accepted.

ADR-204 令個世界望落闊咗，但**可玩範圍冇郁**。Penny 跟住講：
「輕微擴格，連條路都要相應拉長或者重新規劃」。呢一輪就係嗰樣。

### 改咗乜

| | 之前 | 之後 |
| --- | --- | --- |
| 格 | 20 × 12 | **24 × 14** |
| origin | (−10, −6) | (−12, −7) |
| 可玩陸地 | 148 格（佔 grid 61.7%） | **178 格**（佔 336 嘅 53%） |
| 條路 | 31 格、8 個彎 | **37 格、10 個彎** |
| 路程（raw／smooth） | 30 / 29.1 | **36 / 35.09** |
| 貼路可起塔位 | 60 | **72** |
| 入口／出口 | [0,5] / [19,4] | [0,6] / [23,5] |
| 三個戰區 colRange | 0-6 / 7-12 / 13-19 | **0-7 / 8-15 / 16-23** |
| 河／橋 | col 10、橋喺 [10,4] | **col 11、橋喺 [11,5]** |

條路唔係將舊嗰條拉直咗算數：11 段、10 個彎，段長 5/3/4/4/5/2/4/3/3/1/3，
仲係四鄰、冇重複、頭尾就係 spawn／goal，順序穿過三個戰區。
`landRadius: 2`、`buildRadius: 1` 冇改，所以山谷嘅形狀語言一樣。

### 難度：擴完之後一定要重掃，唔掃就係靜靜雞調低咗

擴格同拉長條路，兩樣都對玩家有利：敵人喺火力下行耐咗 20%，可起塔位多咗 12 個。
實測（seed 198，曲率照舊 0.0016）：

| cap | 舊地圖 | 新地圖（未補） |
| --- | --- | --- |
| 20 | LOST wave 90 | LOST wave 90 |
| 30 | WON，**16/20 命**，跌命喺 90／95／99 | WON，**20/20 命，一條都冇跌** |
| 無限制 | WON 20/20 | WON 20/20 |

即係話 ADR-200 特登擺喺最後三分一嗰浸壓力**冇晒**。呢個唔係「順便變咗」，
係我改嘅嘢直接造成——**擴地圖唔補返難度，等於靜靜雞調低咗遊戲難度而唔講。**

掃 `HP_CURVE`（二次項，`HP_CURVE_CAP = 45`）：

| 曲率 | cap 30 結果 |
| --- | --- |
| 0.0016 | 20/20（冇壓力） |
| 0.0022 | 20/20（一啲分別都冇） |
| 0.0024 | 18/20 |
| **0.0026** | **15/20**，19@86 → 17@91 → 15@100 |

揀 0.0026——最貼近原本嘅 16/20，而且跌命係逐步嚟，唔係三個尖峰。

補完之後嘅梯度：

| cap | 結果 |
| --- | --- |
| 20 | LOST wave 80 |
| 30 | WON，15/20 命 |
| 無限制 | WON，20/20 命，66 座塔，剩 9,120 金 |

**兩樣要照直講：**

- **cap 20 由第 90 波跌到第 80 波死。** 0.0024 同 0.0026 都係 80，即係呢一格
  唔係曲率推嘅，係地圖本身推嘅。低嗰級真係硬咗，唔係同原本一樣。
- **反而「錢用唔晒」嗰個老問題好返好多**：ADR-201 記低 cap-30 第 87 波之後
  剩 54,248 金冇得使；而家無限制跑法最後只剩 **9,120**——多咗 12 個塔位，
  個沉澱池就有得裝。呢個係擴格嘅副作用，唔係我特登整。

### Gate 點跟住郁

有四個 gate 寫住舊設計嘅數，全部要改，而且改嘅時候要問一句
「呢個數守緊乜」，唔係求其填返個新數：

- `map.mjs`「31 格 / 8 個彎」→ **37 / 10**。呢兩個係**寫死嘅設計數**，
  唔可以寫成 `=== MAPCFG.path.length`——咁樣等於冇守到嘢。有人靜靜雞加減路格，
  就要喺呢度報紅，逼佢連平衡一齊重掃。
- `map.mjs` 陸地下限 130 → **160**。
- `map-browser.mjs` / `performance.mjs` / `projectile-renderer.mjs` 148 → **178**。
- `route.mjs` controls 10 → **12**（2 個端點 ＋ 10 個彎）。
- 幾個測試度寫死嘅格要搬：起塔 [11,5]→[9,4]（舊嗰個而家係橋）、
  河 [10,3]→[11,4]。void 格 [5,1] 喺新地圖一樣係 void，冇郁。

順帶一提，我第一次以為捉齊晒，跑全套先發現 `flow.mjs` 仲有**三處**寫死 [11,5]：
`T.build('arrow', 11, 5)`、Continue 還原嗰條嘅期望值、
同埋多點觸控測試入面用世界座標寫嘅 `11.5 / 5.5`。頭兩處 grep 「11, 5」搵到，
最後嗰處係 `11.5` ——**grep 一個格座標搵唔到用世界座標寫嘅同一格。**
擴地圖嗰陣要記住：一個格可以用三種寫法散落喺套件度。

ADR-204 嗰條「世界要伸到鏡頭望得到嗰度」**自己跟住擴咗**——佈景範圍由
`cols`／`rows` 推出嚟，所以 31.4 → 35.1，唔使人手改。**呢個就係當初唔寫死嘅回報。**

## ADR-204 — Tower: 個世界喺你最想望遠嗰陣斷咗

Date: 2026-08-09. Status: accepted.

Penny 講「我覺得個地圖唔夠廣闊」。呢句有幾個讀法，而佢哋要做嘅嘢差好遠：
格數細？鏡頭太貼？四圍太多空白？定係冇遠景？所以先量，唔靠估。

### 一次量錯，要講清楚

第一次我攞每個 mesh 嘅 `getWorldPosition` 去量場景範圍，得出「島以外乜都冇」。
**錯咗**：`InstancedMesh` 嘅 `position` 永遠喺原點，佢啲 instance 喺 `instanceMatrix` 入面。
用嗰個量法，成個世界都會縮埋喺 (0,0)。拆返 `instanceMatrix` 之後真相係：
場外**本來就有 1,115 件佈景**。呢個結論同上一個完全相反，而兩個都係「量出嚟」嘅。
**量錯對象嘅結論同量啱嘅一樣有說服力。**

### 真相

拆返 matrix 之後，個世界係咁樣一層層：

| 層 | 到幾遠 |
| --- | --- |
| 可玩島（148 格） | 10 |
| 場外佈景 1,115 件 | X ±19、Z ±15 |
| **乜都冇** | **19 → 33** |
| 18 枝孤零零嘅圓錐 | ~35 |
| 天幕 | 80 |

而個鏡頭 zoom 得出到 `MAX_FRUSTUM = 22`，即係默認嘅 **2.2 倍**，望到嘅半對角 24.2。

即係話：**你一問「廣闊」，個世界就啱啱喺嗰度斷咗。** 望落唔覺大，
唔係因為地方細，係因為望得最遠嗰陣先至見到冇嘢——十四單位闊嘅光板地帶，
加十八枝插喺度嘅圓錐。

### 改法（一格可玩地都冇郁）

- **佈景範圍由鏡頭推出嚟，唔再係寫死嘅 `borderSize = 9`。** 密度跟距離跌
  （近 0.34 → 遠 0.09），遠景要嘅係輪廓同層次，唔係數量，而 instance 數要封到頂。
- **遠山由一圈 18 枝變三圈，而且 18 個 Mesh 併成一個 InstancedMesh。**
  一圈孤零零嘅圓錐冇景深；真係望落遠嘅係一重疊一重——近嘅高、清、密，遠嘅矮、淡、疏。
  順帶：18 個 draw call 變 1 個，**加咗兩倍山數，draw call 反而少咗 17 個。**
- **`underlayPadding` 同高度包絡線拆開兩個數。** `terrainSample` 本來攞
  `underlayPadding` 做 smoothstep 上限，即係「鋪遠啲」會靜靜雞將島邊嘅起伏攤平。
  新加 `envelopeRadius` 保持原值，所以島邊嘅樣一模一樣。

`LAYOUT` 冇改，148 格冇改，路線／經濟／波表一個數都冇郁。
新加嘅嘢全部係 instanced、唔可以 pick、唔喺 `LAYOUT` 入面。

### 量到嘅結果

| | 改之前 | 改之後 |
| --- | --- | --- |
| 佈景件數 | 1,115 | 3,775 |
| 佈景伸到 | X ±19、Z ±15 | X ±37、Z ±33 |
| 遠山 | 18 件、一圈 | 66 件、三圈，到 X ±54 |
| 桌面空場 draw calls | 247 | **248** |
| 手機空場 draw calls | 125 | **126** |
| 桌面空場三角 | 141,362 | **384,294** |
| 手機空場三角 | 34,588 | **62,172** |

Draw call 平咗，三角桌面 2.7 倍、手機 1.8 倍。兩邊都仲遠低過 budget
（桌面 248/1000、手機 126/450），`performance.mjs` 20/20 照過。
**呢個係要講明嘅代價**：換嚟嘅係「zoom 到盡都仲有世界睇」。

### Gate

`map-browser.mjs` 加一條：**最遠嗰件擺設要超出鏡頭 zoom 到盡望到嘅範圍**。
唔量「有幾多樹」——量嘅係伸得夠唔夠遠，因為嗰個先係同「廣闊」直接對應嘅數，
而且將來收窄佈景、或者放寬 zoom 上限，任何一邊郁都會報紅。

Mutation 驗過：範圍改返舊值 → 佈景最遠 18.3 < 24.2，報紅。

**條 gate 我第一版又寫錯咗一次**：加咗 `佈景數 > 2000`，即刻喺呢個 390×844 嘅
viewport 報紅——手機本來就特登擺少啲（930 件），2000 係我照桌面嗰個 3,775 度出嚟。
而且件數根本唔係要守嘅嘢：有人調密度就會無辜報紅，但個世界一樣咁闊。
**又一次係「未量過就寫低一個數」。** 剷咗，只守伸得夠遠。

### 未做嘅

**可玩範圍本身冇加大。** 148 格、~60 個可起塔位維持原狀——加大格數會郁到
ADR-200 量過嘅 99 波容量梯度（cap 20 輸、cap 30 贏 16 命、無限制贏 20 命），
嗰個要重新掃一次 playthrough 先好郁，係另一輪嘅事。
呢一輪處理嘅係「望落有幾闊」，唔係「打起上嚟有幾大」。
如果 Penny 要嘅係後者，下一輪就係擴格 ＋ 重掃梯度。

## ADR-203 — Tower: 撳咗 START 之後嗰廿三秒，畫面乜都冇講

Date: 2026-08-09. Status: accepted.

ADR-202 守住「喺一部真手機上面掂唔掂得到、睇唔睇得到」。跟落嚟同一條線再問一句：
**由開網頁到真係打得，玩家等緊嗰陣睇到啲乜？**

### 量到嘅嘢

用 CDP `Network.emulateNetworkConditions` 落真節流（唔係 `sleep` 扮慢——
扮慢嘅測試證明唔到真慢嗰陣點），390×844 手機：

| 網速 | START 出現 | 真係打得 | **撳完等咗** | 期間畫面變過？ |
| --- | --- | --- | --- | --- |
| 冇限速 | 1.1s | 4.7s | 3.5s | **冇** |
| Fast 3G 1.6Mb/s | 0.4s | 11.8s | 7.1s | **冇** |
| Slow 3G 0.4Mb/s | 0.7s | 40.6s | 23.7s | **冇** |

要落 **1,860 KB**：17 KB HTML ＋ 758 KB JS ＋ **1,086 KB GLB**。

個掣喺第 0.4 秒就擺喺你面前，但要到第 11.8 秒先至撳得郁。而撳落去之後
**畫面一個 pixel 都冇變**：仲係寫住「▶ START」、仲係 enabled、仲係
`cursor: pointer`、開場畫面仲喺度。玩家收到嘅唯一訊息係「撳咗冇反應」。

`enterRun()` 第一行係 `await 地面好`——一個冇任何 UI 嘅 await。

### 兩件事一齊壞

**一、冇交代。** 呢個唔係美觀問題。3.5 秒嘅靜默已經令人以為撳漏咗；23.7 秒
係足以令人以為隻 game 壞咗。

**二、跟住必然會再撳。** 而再撳一次會**真係再開多一次波**——實測
`開波次數 = 2`：兩次 `startNextWave`、兩次 `audioSystem.startMusic()`（音樂疊住播）、
第二次仲會覆蓋 `state`，第一次嗰個變孤兒。喺一個要等 24 秒嘅畫面度，
「再撳一次」唔係邊緣情況，係必然發生嘅事。

### 改法

- **進度計喺 `載模型` 度，唔喺 `預載` 度。** 開場要載嘅嘢由兩條清單嚟
  （`main.ts` 嗰條同 `sceneManager.buildGround()` 入面嗰條），喺 `預載` 度計就要
  兩邊各計一份再夾埋。`載模型` 係兩邊都一定經過嘅窄門，而且本身已經去重。
  「總數」寫明係**叫過幾多**而唔係**一共有幾多**——後者我冇一個地方知道，
  唔好扮知。
- **撳完即刻停用個掣、擺條進度出嚟**，逐格更新到落齊（實測由 11/66 行到 20/66，
  條 bar 17% → 30%）。
- **`啟動中` 擋重入**（同 `disabled` 兩重；`disabled` 係今日實際擋到嗰個）。

### 把尺自己也錯過一次，同上一輪一模一樣

第一版嘅「撳兩下唔會開兩次波」係攞 `state.currentWave === 0` 去驗。
**拆走防護之後條 gate 一樣綠**——因為第二次 `enterRun` 整個**全新** state 出嚟，
佢一樣係 wave 0、一樣係 400 金。個現象喺遊戲狀態度根本睇唔出；真正睇得出嘅
後果係音樂疊住播，而嗰樣量唔到。

所以喺 seam 上面加咗一個 `開波次數`。**加呢個數唯一嘅理由就係要量得到**——
seam 存在就係為咗呢啲量唔到嘅嘢。改完 mutation 驗到：拆走防護 → `開波次數: 2`，
gate 報紅；裝返 → 1。

呢個係**同一輪入面第二次**遇到「一條分唔開有冇 bug 嘅 gate」。ADR-202 嗰條
係門檻細過雜訊，呢條係量錯咗個量。兩者外表都係綠色。
**寫完一條 gate 一定要拆走個修正再跑一次**，唔係一個可選步驟。

### 留低嘅

1,860 KB 本身冇改細。呢一輪守嘅係「等緊嗰陣有冇交代」，唔係「等幾耐」——
等幾耐一半係條線嘅事。真要縮，`758 KB` 嘅單 chunk（Vite 一路喺度警告）
同 `1,086 KB` GLB 兩邊都有位，但嗰個係另一輪嘅事，而且要先有一條量載入時間嘅 gate
先好郁——`tests/load.mjs` 而家有咗個位擺。

## ADR-202 — Tower: 手機掂得到／睇得到，同一條從來冇量到閃光嘅 gate

Date: 2026-08-09. Status: accepted.

呢一輪三件事，形狀一樣：**有人喺冇量度之前就寫低咗一個數，之後冇人再問返嗰個數啱唔啱。**
入手點係「Codex 套件冇守到嘅範圍」——佢守地圖、路線、章節、經濟、效能，
但冇一條問過「喺一部真手機上面，呢個掣掂唔掂得到、呢個數睇唔睇得到」。

### 一、六個掂唔到嘅掣，同一條睇唔出捲得到嘅塔欄

`#hud>button` 只寫 `padding: 9px 14px`，高度跟字大細行。iPhone SE 375×667 實測六個掣
低過 44px：pause **37×37**、help 39×36、speed／sound／hub 46–47×36、skip 81×36。
Apple HIG 要 44pt、Material 要 48dp，而最細嗰個 pause 正正係你喺壓力下最想撳嗰個。
落 `min-height/min-width: 44px`（唔係加 padding——加 padding 連桌面版一齊變肥，
而真正嘅問題係「最細幾多」，唔係「有幾多留白」）。**新 gate 跟住即刻捉多一個我未量過嘅**：
SE 橫嘅淺身底座 `.build-btn` 係 48×**42**，差兩格，一併修。

塔欄嗰條我第一版**讀錯咗對象**：我量咗外層 `#build-menu` 嘅 `overflow-x`（`visible`），
就下結論「捲唔到、買唔到狙擊塔」。捲係喺入面嘅 `.build-grid`，而且捲得好地地——
兩頭都去到（捲到盡見到 Sniper，捲返轉頭見到 Arrow）。**量錯對象嘅結論，
同量啱嘅結論一樣有說服力**，所以呢條 gate 唔信 computed style，真係捲一次再數邊個掣入到畫面。
真正剩低嘅缺陷細好多：七個掣要 386px 而個格得 341px，但捲軸收埋咗、最右嗰個貼邊切斷，
睇落似係最後一個。加兩邊 `mask-image` 漸隱做「呢邊仲有嘢」嘅提示。

### 二、備戰橫額壓住 gold／lives／wave

`#wave-banner` 寫 `top: 88px` ＋ `transform: translate(-50%, -50%)`。兩個問題疊埋：
`top` 拉咗 −50% 之後指嘅係橫額**中心**，所以個橫額嘅頂邊實際喺 28px，寬屏度甚至 −1px；
而 88 呢個數假設 HUD 永遠 74px 高。實測 HUD 有四個高度：

| 尺寸 | HUD 高 |
| --- | --- |
| 桌面 1280×800 | 56px |
| iPhone SE 橫 667×375 | 110px |
| iPhone SE／12 直 | 164px（`flex-wrap` 摺兩行） |

Skip 掣一出現仲會再摺多一行。88 只喺其中一種情況啱。

**幾何相交**：SE 直 gold 73%／lives 82%／wave 75%；SE 橫 90%／100%／100%；桌面 wave 42%。
**再用 pixel diff 驗返「疊到」係咪等於「遮到」**——因為橫額係 `pointer-events: none`，
所有 hit-test 都過，你淨睇互動係捉唔到呢個 bug 嘅。收起橫額前後，三塊 crop 分別變咗
40–57% pixel。**同時要量雜訊底**：3D 場景一路喺度郁，HUD 又有 `backdrop-filter`，
唔量對照組就會將場景嘅動靜當咗係橫額。雜訊底 5–16%，訊號 40–57%，分得開。
而桌面 gold 訊號 16.5 對雜訊 18.7——**冇遮到**，同幾何嗰邊講嘅 0% 對得上。
兩把尺互相驗證，先信。

**改法**：`--hud-bottom` 由 `main.ts` 喺每次擺橫額出嚟嗰陣量 HUD 實際 `bottom` 寫入，
CSS 用 `top: calc(var(--hud-bottom, 88px) + 10px)`，同時 `translate` 淨返打橫。
HUD 係拖得郁嘅（`makeDraggable`），所以個錨跟位置，唔淨係跟大細；備戰嗰陣逐格量，
拖完、摺完、轉屏都自動啱。淺身畫面（`max-height: 500px`）另外收細橫額字體到 15px——
喺 375px 高嘅畫面度，三行章節開場本來 177px 高，即係食走成半幅戰場。

改完五個尺寸幾何相交全部 0%，pixel 訊號跌返落雜訊水平。

上面三條全部入咗新嘅 `tests/touch.mjs`（六條，已入 `npm run test:browser`）。
Mutation 驗過兩次：拆走 `min-height` 就逐個叫返出嗰六個細掣；
改返 `top: 88px` 就報紅，逐個叫出 `hud-gold` 60–72%、`hud-lives` 67–81%、`hud-wave` 74–95%。

把尺本身仲有一個位要記住：**橫額最肥嗰一刻係章節開場嗰三行**（SE 橫 177px 高），
而佢只喺第 1、21、41… 波出現，過幾秒就縮返一行 28px。我第一版寫死「等 8 秒先量」，
量到嘅係最易過嗰一格；改成 `waitForFunction` 等到三行版本真係出咗嚟先量。
連 `行 >= 3` 都要 assert——**唔係咁嘅話，gate 綠只係代表橫額冇出過。**

### 三、門口閃光嗰條 gate 一路靠彩數過

跑新 gate 嗰陣順手發現 `tests/gateway.mjs` 嘅閃光檢查會間歇報紅。**先驗係咪我整嘅**：
改動前個 build 同樣三跑兩過一敗，訊號一模一樣——唔關我事，係本身就爛。

爛喺兩個假設：

1. **影一張相要成秒。** swiftshader 之下 `page.screenshot` ＋ 解碼一個回合約 1 秒，
   所以「連影四張攞峰值」係喺出怪後第 1、2、3、4 秒影，而 `閃` 嘅衰減係 **0.55 秒**。
   四張相冇一張影到閃光。
2. **個底自己喺度呼吸。** 門口常駐光幕係 `0.07 + 閃*0.26 + sin(time*2.6)*0.015`，週期 2.42 秒。
   實測同一個 run 連續五格底色：青 2.54 → 3.64 → 0.90 → 4.08 → 1.88。
   **淨係個底就掃過 0.9–4.1pp**，而所謂「閃光峰值」讀到 4.4。

即係話：呢條 gate 比較緊「同一條正弦波嘅兩格」，門有冇閃根本影響唔到結果。
門檻寫 `青增 >= 0.45`，比個底自己嘅擺幅細成七倍。
**一條測唔到自己要測嗰樣嘢嘅 gate，比冇 gate 更差——佢教你當紅色係雜訊。**

**改法**（兩邊對稱）：底色跨足一個完整光幕週期連影六張攞最大值；閃光就用一個
收得返嘅 timer 每 16ms 撳住 `開門()`，令 `閃` 喺影相期間停喺 1 附近，
真係影到閃住嗰一刻。再加一條 check 驗 `閃前 < 0.02 && 閃中 > 0.5 && 收咗 < 0.02`
——**奏唔到嘅樂器係關於樂器嘅證據，唔係關於首歌。**

中間試錯三次，三次都係同一個形狀：**用真實秒數等一件行緊另一把鐘嘅事。**

- 「影相前撳一次 `開門()`」代替撳住——量到 **青增 −0.24**，一格都冇影到。
  撳完到真正影到嗰格中間隔咗成條 0.55 秒衰減曲線。
- 用 `setInterval` 撳住但 handle 擺喺 `__TD` 上面——收唔返，留低一道永遠開住嘅門。
  handle 改擺 `window`，收完仲要驗返真係收咗。
- **最要緊嗰個**：swiftshader 之下一格畫面可以行成半秒，而 `rawDt` 封頂 0.1 秒
  ——即係**遊戲鐘行得比真實鐘慢幾倍**。等 1200ms 之後 `閃` 應該歸零，實測仲有 0.455；
  等 150ms 之後 `閃` 應該係 1，實測係 0。連原本嗰條「開完會自己閂返」寫死等 1600ms
  都係同一個病：喺拖慢咗嘅鐘之下只夠 `開度` 由 1 跌到 0.294 就去驗，於是報紅
  ——**紅嘅係把尺，唔係道門。** 全部改成 `waitForFunction` 等狀態本身。
  順帶一提，`f < 0.02 ? f : false` 呢種寫法喺 `閃 === 0` 嗰一刻係 falsy，
  waitForFunction 會當條件未成立咁等落去——**條件啱到極致嗰一刻正正就係佢睇漏嗰一刻**，
  所以要包一層 `{v: f}`。

改完連跑三次：底色峰值 3.59／3.86／4.12pp 青，撳住閃光 13.71／14.11／14.56pp，
**青增 10.12／9.99／10.70**，亮度 +15.5 到 +16.7，純白 1.22–1.28%。
門檻由呢啲數定：**青增 ≥ 4**（高過光幕自己 3.2pp 嘅擺幅，低過 ~10pp 訊號一大截），
純白上限 2.5%（守嘅係「成大片白到見唔到道門」嗰個舊 bug，唔係守正常峰值）。
舊嗰條 `青增 >= 0.45` 比個底自己嘅擺幅細成七倍，由頭到尾都係一個過得太易嘅數。

Mutation 驗過：將 `閃燈`、`光環`、`光柱` 三樣嘅閃光貢獻全部歸零，
**青增 由 ~10 跌到 0.30，gate 報紅**，而「影相期間真係閃緊」嗰條照樣綠
——即係報紅嘅責任落喺遊戲度，唔係落喺把尺度。呢個先叫分得開。

## ADR-201 — Tower: verifying ADR-200's capacity gradient, and correcting a conclusion I measured too short

Date: 2026-08-09. Status: accepted.

ADR-200 (Codex) landed a full battlefield redesign while this agent was mid-round on the old map.
Two things needed settling before anything else: whether ADR-200's claims reproduce independently,
and what happens to the round I had built on the superseded map.

**The capacity gradient reproduces exactly.** Re-run in a different container, seed 198, cap 30:
**won all 99 waves with 16/20 lives, lives lost at waves 90, 95 and 99, last spend at wave 87** —
identical to the witness recorded in ADR-200. The fast suites also pass here: map 11/11, route 8/8,
chapters 7/7, balance 10/10, tiles 7/7.

**And that corrects me.** ADR-198 and ADR-199 concluded "a full build is never threatened", measured
over waves 1–46 of a **99-wave** campaign. On this baseline the pressure is deliberately placed in
the last third: nothing at wave 45, three lives gone by wave 99. The conclusion was not wrong about
what it saw; it was drawn from a window that ended before the campaign's climax began. A 45-wave
probe cannot answer a 99-wave question, and I should have noticed that the wave table kept going.

**The build-pad round is withdrawn, not merged.** `d18b36e` cut the map to 22 explicit build pads
because 62 adjacent cells made placement a non-decision at the measured knee. ADR-200 replaced the
map with `mapLayout.ts` as the single buildability authority, and its handoff states the rule
plainly: *do not reshape the map merely to tune a bot*. That commit did exactly that, on a map that
no longer exists. It stays on the work branch's history and on `backup/pads-old-map`; the branch tree
is now identical to `main`. The gold multiplier from the same commit is also withdrawn — ADR-200's
independent HP and bounty curves bring income-over-spend to **1.02×** at wave 45, against the 2.38×
my multiplier reached.

Two things carry forward as observations rather than defects:

- On the cap-30 probe, **spending stops at wave 87 and 54,248 gold is left unspent** (income ÷ spend
  1.39×). That is the ADR-194 shape — the sink runs dry — but at wave 87 instead of wave 26, so it
  is now a tail, not a hole. Worth a number, not a redesign.
- **This cloud container cannot run the Tower suites without `PW_CHROMIUM=/opt/pw-browsers/chromium`.**
  ADR-200 gave Tower its own Playwright, which pins a browser build that is not installed here; the
  tests honour the env var, so the fix is one line, but the next cloud agent will hit it on its first
  command and should not spend time diagnosing it.

## ADR-200 — Tower: one battlefield has three regions, five acts and one safe campaign lifecycle

Date: 2026-08-09. Status: accepted.

The 99-wave campaign stays on one continuous battlefield, but it is no longer one undifferentiated
strip. `map.json` defines three ordered regions — Wildwood Gate, Sunken Crossing and Bastion Cliff —
and `chapters.ts` defines five 20/20/20/20/19-wave acts. The same chapter data drives HUD copy,
opening banners, atmosphere colours and tactical labels; do not create separate visual and gameplay
chapter tables. Region foundations use three vertical tiers, a central river rift and a keep mesa so
the silhouette reads as a journey without changing the authoritative build grid.

Enemy movement follows a 246-sample smooth route generated from the 31 grid cells. The route begins
on the spawn-gate plane, remains within 0.42 cells of the road, limits each sample turn to 26.9° and
finishes on the existing goal cell. Build range and adjacency continue to use the grid; do not use
the smoothed samples as a second map authority. Endpoint buildings are positioned from the same
route anchors so enemies cannot pop in on the wrong side of a decorative gate.

Campaign randomness is split from visual `Math.random`: wave modifiers and milestone card offers
use deterministic gameplay sampling. The accepted milestone rhythm is offence at waves 25 and 75,
with range/fortify recovery at wave 50. Enemy HP curvature and bounty scaling are independent.
Evolved towers retain two paid post-evolution levels. Seed-198 witnesses define the intended capacity
gradient: 20 towers lose at wave 90, 30 towers finish with 16/20 lives, and an unrestricted build
finishes with 20/20 while still spending at wave 99. Treat those runs as comparative policy probes,
not a claim that every player build must reproduce them.

Resume data is a versioned, 30-day local checkpoint written only during preparation, never with live
enemies or projectiles. Help, backgrounding and WebGL context loss pause explicitly; returning to the
foreground or restoring WebGL never silently resumes. Restart clears selection, floating UI and
pause residue. Static terrain is batched, projectile geometry/materials are shared, and the renderer
tests guard zero projectile-geometry growth plus draw-call budgets at the real 229-enemy campaign
peak. These lifecycle and resource rules are part of the campaign design, not optional polish.

## ADR-198 — Tower: raising enemy HP does not threaten a full build, and the measurements say why

Date: 2026-08-08. Status: accepted.

ADR-194 measured the defect and left it open: a build policy any beginner could execute reaches
**wave 41 without losing one of 20 lives**, with a median deepest penetration of **0.03** — enemies
die in the first three percent of the road. This round went after it, and the eight runs it took are
worth more than the change they produced.

The obvious lever is the HP curve. Enemy HP scaled as `1 + wave × 0.04`, so wave 40 enemies had
2.6× base HP. I put a tunable on it (`window.__TD.設曲率`) so a value could be swept in the browser
without a rebuild per point, and swept:

| curve | lives at wave 41 | deepest penetration (max / median) |
|---|---|---|
| linear only (shipped) | 20/20 | 0.47 / 0.03 |
| + 0.0006 w² | 20/20 | 0.50 / 0.07 |
| + 0.0015 w² | 20/20 | 0.67 / 0.07 |
| + 0.004 w² | 20/20 | 0.83 / 0.07 |
| + 0.009 w² | **5/20** | 0.97 / 0.10 |
| 0.16 w + 0.0016 w² | 20/20 | 0.87 / 0.07 |

Two things fall out. First, **the 0.009 result is a cliff, not a curve** — every life was lost in
wave 41 alone, waves 1–40 still untouched. Second, and more useful: at `0.16 w + 0.0016 w²` the
enemies reach 87 % of the road and **still nobody gets through**. Nearly four times the HP moves the
kill point down the road but does not change the outcome, because 56 towers along a 31-cell path is
simply more gauntlet than any amount of HP survives.

So the binding constraint was never the HP curve. It is that **the map allows 62 path-adjacent
towers**, which is far more than any considered build, and the game hands out enough gold to fill
them all by wave 26. The confirmation is one run: capping the bot at **20 towers** — an ordinary
build — the new curve takes it to **3 of 20 lives by wave 41**. The curve bites. What does not bite
is a player who simply keeps pressing build until the map is full.

Shipped: `1 + w × 0.04 + 0.0016 × min(w, 45)²`. The cap matters. Uncapped, wave 99 would sit at
**32×** base HP against waves already carrying 455 enemies — unfinishable. Capped, wave 40 goes
2.60× → 5.16× (**1.98×** harder, the mid-game hollow this was aimed at) while wave 99 goes
4.96× → 8.20× (1.65×), so the campaign keeps its shape.

**Left open, deliberately.** A full 56-tower build still finishes wave 45 at 20/20. The lever for
that is the map or the economy — fewer buildable cells, or gold that cannot fill them — not more HP,
and this round's measurements are what rule the HP lever out. That is worth more than a number I
could have guessed.

The gate for the spawn flash cost four attempts and each failure was mine, not the game's:

1. "Brightness must rise by 4" — written before any measurement. The crop is mostly grass; its mean
   barely moves.
2. "+1" — inside the jitter. And the confound is structural: **the doors swing open in the same
   instant and expose darker ground**, so the frame can get *dimmer* while the flash is plainly
   visible (measured −0.2, −0.1). Brightness sums two opposing effects and cannot separate them.
3. Sampling one frame of a 0.55 s transient — the cyan ratio wandered 2.2–4.5. Take the peak of four.
4. The baseline was contaminated: **the game was spawning its own enemies during the measurement**,
   so "quiet" sometimes caught a real flash (cyan 0.58 % → 1.54 %). Clearing `spawnCounts` to stop it
   made things worse — that completes the wave and starts the next one. The fix is to pause the game
   and drive every spawn from the test.

The final form measures the **expanding ground ring**, which exists only during the flash, in a crop
wide enough to contain it — rather than the doorway, where a permanent glow I had added oscillates by
about as much as the flash adds. Signal and noise were the same object.

`gateway.mjs` 6/6, and the other seven suites unchanged.

## ADR-197 — Tower: the last of the hand-built geometry is gone

Date: 2026-08-08. Status: accepted.

`towerRenderer.ts` was 942 lines and `enemyRenderer.ts` was 629, and between them they contained
every visible object in the game as cylinders, spheres and cones — one hand-written constructor per
tower type, another per enemy type. Both are now built from the CC0 kits. The two files are **544 and
360 lines**, and the bundle went *down* 798 → 760 kB despite gaining a loader.

**Towers stack instead of being sculpted.** Kenney's tower kit is modular: `base → bottom → middle →
top`, each segment exactly 0.500 high (measured, and `assets.mjs` holds that number). That is the
same shape as the game's own three-level upgrade, so a level is a segment — no separate visual rule
to keep in sync. Seven tower types against four weapon heads are separated by body shape (round vs
square), roof variant, and the colours the game already used for each type, so the HUD, projectiles
and effects still agree with the tower.

Two things had to be got right rather than guessed:

- **Weapon towers wear no roof.** The roofs are 0.93–1.18 tall and the weapons 0.19–0.63; mounting
  one on the other buries the weapon inside the roof and you can no longer see what it is aiming at.
  Open battlements with the weapon standing on them is how the kit's own sample towers are built.
  Ice and poison have no matching head (the kit has four), so they get a roof and a spinning crystal
  — which also gives them a silhouette that reads apart from the other five.
- **Enemies stay instanced.** A wave can hold 455 enemies (`balance.mjs` guards that ceiling), so a
  cloned `Object3D` each would be thousands of draw calls. Instead the GLB's sub-meshes are unpacked
  into the *existing* `EnemyPartDef` list — geometry, material, and the sub-mesh's own transform
  baked into the geometry once with `applyMatrix4` rather than multiplied every frame. The whole
  instancing / animation / HP-bar machinery above it is untouched. Five creatures cover seven types;
  `swarm` and `shield` are a small skeleton and a blue zombie, and that compromise is written down
  rather than hidden.

The gate (`tests/units.mjs`, 10 checks) asks the questions that would actually catch a regression:
every type builds at all (`取同步` throws when a piece was never preloaded, so "it built" is a real
assertion); each level is **taller** and has **more meshes** than the last; the identification colour
is read **from the scene graph**, not from pixels. That last choice came from failing twice: a tower
is a few dozen pixels on screen and a crop around it is nine-tenths grass, so both pixel versions
read the grass colour back and reported all seven towers as green — evidence about the ruler, not
about the game. Mutations: dropping the per-level stacking turns three checks red with heights
`[1.039, 1.039, 1.039]` and identical mesh counts; swapping the enemy geometry for a box drops the
triangle count to 12.

One more ruler bug worth keeping: the first version of the instancing check read 85 `InstancedMesh`
objects with **every count at 0**, because it spawned enemies and inspected the scene inside the same
`page.evaluate` — `sync()` sets those counts inside the rAF loop, which had not run yet. It was
measuring a scene that had never been drawn.

Eight suites green: look 7/7, assets 8/8, tiles 6/6, gateway 6/6, units 10/10, smoke 5/5,
balance 6/6, combat 8/8.

## ADR-196 — Tower: the road had no beginning and no end

Date: 2026-08-08. Status: accepted.

Replacing the procedural board with real tiles (ADR-195's follow-up) removed two things I had not
accounted for: the old `buildSpawnPortal()` and `buildGoalKeep()`. What was left was a road that
started in an empty square and ended in another empty square — enemies walked out of nowhere and
vanished into nowhere. Those two squares are the only two places in a tower defence that matter:
where they come from, and what you are defending.

Both are rebuilt from Kenney's fantasy-town kit (CC0, and measured to be on the same one-unit grid
as the tower-defense kit — walls 1.0 × 1.0, pillars 1.0 tall — so the two kits mix without scaling):

- **The entrance is a pair of doors.** A wide doorway wall, two flanking pillars with lanterns, and
  two `wallDoor` panels each on its own pivot so they swing from their outer edge. Every spawn slams
  them open and they ease shut over ~0.85 s. The trigger is a new `enemySpawned` bus event, not a
  timer — one monster, one swing, and the gate test therefore also covers that the event fires.
- **The exit is a keep with a health bar.** Walls, a second storey, a red roof, two banners that
  drift, and a bar above it that tracks lives. It is not a copy of the HUD number: it sits on the
  thing you are defending, so the state is where your eyes already are.

Three defects, each found by measuring rather than looking:

1. **The health bar was invisible.** `血條闊` read 1 — it was there and full-width — but the screen
   showed only the dark backing. The bar was opaque and the backing transparent, and **three.js
   draws every opaque object before any transparent one**; `renderOrder` only sorts within a pass.
   The green bar drew first and the半-transparent backing painted over it. Marking the bar
   `transparent: true` puts both in the same pass, where the render order applies.
2. **The billboard was in a rotated parent.** The bar was a child of the keep group, which is
   rotated to face the incoming road. Copying the camera quaternion onto a child composes with the
   parent's rotation, so it never actually faced the camera. It hangs off the scene root now.
3. **The gate was rotated ninety degrees wrong, and the measurement is what said so.**
   `wallDoorwaySquareWide` is 0.1 × 1.0 × 1.0 — its thin axis is **X**, so the wall stands in the YZ
   plane. Aiming local +Z down the path put the wall *alongside* the road instead of across it, and
   buried the portal glow inside the wall. The flash variable read 0.82 while the pixels at the gate
   went the wrong way: brightness **53.3 → 48.5**, cyan 0.63 % → 0.85 %. After the extra 90°, cyan
   goes **0.65 % → 2.92 %** and brightness rises.

That third one also corrected my ruler. I had written the gate as "brightness must rise by 4" before
having a single measurement. The crop is mostly grass and stone, so its mean moves slowly; the signal
that actually separates a flash from no flash is the **cyan fraction**, which is 1.35× when broken
and 3.9–4.5× when working. The threshold is now derived from both measured states and both numbers
are recorded in the test, so the next person can see why the line sits where it does.

`gateway.mjs` 6/6, and look 7/7, assets 8/8, tiles 6/6, smoke 5/5, balance 6/6, combat 8/8 all still
green.

## ADR-195 — Tower: from zero assets to 66 CC0 models, and the road that actually reaches them

Date: 2026-08-08. Status: accepted (half done — the renderers still draw the old procedural geometry).

Penny wants the hand-built 3D gone. It should go: `towerRenderer.ts` is nine hundred lines that
assemble every tower out of cylinders and boxes, and the game ships **no asset files at all**. The
question was never whether to replace it, only what with — so this round is the scan, the fetch, and
a ruler over what arrived. The renderers are the next round.

**What this environment can actually reach.** I measured rather than assumed, and the answer is
narrow. Blocked by the egress proxy: `kenney.nl`, `quaternius.com`, `polyhaven.com`,
`opengameart.org`, `itch.io`, `codeload.github.com` (so no repo zips), the GitHub REST API (this
session is bound to its own repositories), and `github.com` HTML. Reachable: **`git ls-remote` /
`git clone` against public GitHub repos**, and **`raw.githubusercontent.com`** for individual files.
That single fact decided the sourcing strategy: a blob-less partial clone to enumerate a repo's tree,
then per-file fetches over `raw`. Anything that only exists behind an itch.io download button is out
of reach from here regardless of its licence.

**What is there.** `ETdoFresh/kenney.nl` mirrors Kenney's CC0 packs — 46,424 files, of which 23 kits
carry 3D models. The one that matters is **`tower-defense-kit-1`, 146 glTF models**, and it is a
closer fit than anything I would have designed:

- **Towers are modular**: `towerRound_`/`towerSquare_` × `base / bottomA-C / middleA-C / topA-C /
  roofA-C`, plus four weapon heads (`ballista`, `blaster`, `cannon`, `catapult`). A three-level
  upgrade is a segment stacked on, which is exactly the game's model.
- **Tiles**: straight, corners, crossing, split, spawn, end, river, hill, slope — and a full snow
  reskin of all of it.
- Details and wooden structures; the only enemies are UFOs, which is the wrong genre here.

For enemies, `kenney_graveyardkit_3` has **skeleton, zombie, ghost, vampire, digger** as GLB. Five
creatures against seven enemy types, so two still need an answer — scale and tint variants are the
cheap one, another CC0 pack the honest one. Also confirmed reachable and unused so far:
`kenney_natureKit_2.1` (329), `fantasy-town-kit-1.0` (153), `kenney_3droadpack` (302),
`kenney_hexagonkit_1` (63), and the KayKit CC0 repos (Halloween Bits 63, Medieval Hexagon 221,
City Builder 41, Prototype Bits 72).

**66 files, 1.2 MB**, pulled by `scripts/fetch-assets.mjs` from a manifest with both `License.txt`
files alongside them — because "which file, from where, under what licence" is not something a commit
message can be checked against later.

**The measurements are the reason to be confident, not the screenshots.** `tests/assets.mjs` runs the
game's own loader (`src/render/assets.ts`), not a second one written for the test:

- **All 21 tiles are exactly 1.000 × 1.000**, and `map.json` says `cellSize: 1`. No scaling, no
  fudging — the grid the game already has *is* the grid the kit was authored on.
- **All 18 tower segments are exactly 0.500 high**, so stacking them leaves no seam.
- Every GLB parses, has meshes, materials and triangles; the heaviest is **920 triangles**; all are
  self-contained with **zero textures** — flat-coloured materials, 12–33 KB each.

Two mistakes worth keeping. I first exposed the whole `THREE` namespace on the debug seam so the test
could measure bounding boxes, which defeated tree-shaking and took the bundle from **707 to 887 kB**
— a debug hook is not worth 180 kB of shipped code, and the fix (expose the game's own `量模型`)
is also the more honest instrument, since it now measures the loader the game runs. And
`new URL('../../public/assets/', import.meta.url)` resolved, after Vite's rewrite, to the bundle's own
filename with the asset path glued on: **`index-BPBhRWuv.jstiles/tile.glb`**, a URL that can only
404 and that no amount of reading the source before building would have revealed. Relative
`models/` works in dev and in `dist` alike. Moving the folder from `public/assets/` to
`public/models/` also stops Vite merging the kit into `dist/assets/` next to its own hashed bundles.

Not done, and not dressed up as done: `towerRenderer.ts`, `enemyRenderer.ts` and the ground are still
the old procedural geometry. Nothing on screen has changed yet. What has changed is that the models
are in the repo, licensed, verified loadable, and dimensionally proven against the map the game
already uses.

## ADR-194 — Tower: the map runs out of things to sell you at wave 26 of 99

Date: 2026-08-08. Status: accepted.

ADR-193 ended with a measurement I could not leave alone: a build policy any beginner could execute —
build beside the path, upgrade when you can, otherwise build another — reaches **wave 41 without
losing one of its 20 lives**. This round was about naming what that number means, and it turned out
to be two separate defects that had been reading as one.

`tests/playthrough.mjs` now measures three things it did not: it takes **evolutions** (without them
I could not tell "the game has nothing to sell you" from "my bot does not know how to buy"), it
accepts a **tower cap** so the difficulty can be probed from below, and it records **how far the
deepest enemy of each wave gets along the path**, as a fraction. That last number is the one that
says how close a wave came, which "you cleared it" never does.

What they say:

- **Income 41,184 over 40 waves. Everything the map can absorb: 29,260.** You can buy a maxed,
  evolved tower on every path-adjacent cell and still be holding **12,324 gold** — with 59 waves
  left to play. The purchase completes around wave 26. From there the only decision left is when to
  press build.
- **Deepest penetration, median across 40 waves: 0.03.** Enemies die in the first three percent of
  the path. The single deepest moment all game was 0.47, and the closest wave was **wave 1**, played
  with two towers.
- The game is not *incapable* of difficulty — capping the build makes it real: **6 towers loses at
  wave 30, 10 towers loses at wave 40**. So the waves can kill you. They just never get the chance,
  because the game hands out more money than the map can take.

The first defect is a missing sink, and it had a cause worth naming on its own: **six of the seven
towers have no evolution at all.** Only `arrow` had any; every other tower reaches level 3 and the
panel turns into a dead `⬆ MAX` button. So the entire late-game spend was 42 arrow evolutions at 250,
and there was nothing else to want. Each base tower now has one — the geometry falls through to the
base builder the way `arrow_rapid` already did, so this is a colour, a stat line and a config entry
rather than new art — priced at one-for-one with the tower's cumulative investment. The most
expensive fully-realised tower goes from 530 to 1,000, the map absorbs 62,000 instead of 32,860, and
the point where you can afford all of it moves from wave 51 to **wave 78 of 99** (config arithmetic,
which is a lower bound: the live run with difficulty scaling and interest bought out at 26). Measured
end to end afterwards: leftover gold at wave 41 falls **12,324 → 5,206** and income over spend falls
**1.41× → 1.13×**.

Adding those six types immediately exposed a bug that had been sitting under the two arrow
evolutions: the projectile renderer normalised evolved types with
`type === 'arrow_rapid' || type === 'arrow_pierce' ? 'arrow' : type`, and `fx.ts` looked up trail and
impact colours in a table keyed by base type. Every evolved type outside that hardcoded pair would
have fallen through the mesh switch and drawn **no projectile at all**, and taken `undefined` for its
colour. Both now derive the base type from the name once — evolved types are `base_suffix` by
construction — instead of listing the cases.

The gate is config arithmetic, no browser: what one cell can absorb × the path-adjacent cells,
against what the waves pay out. Restoring the old `towers.json` turns it red naming wave 51.
`balance.mjs` 6/6, `combat.mjs` 8/8, `smoke.mjs` 5/5.

The second defect is **not** fixed and I am not going to pretend the sink touched it: after all of
the above, the run is still **20/20 lives at wave 41 with a median penetration of 0.03**. Spending is
now a real decision; surviving still is not. That is a wave-curve change — the numbers to aim at are
in hand (6 towers dies at 30, 10 at 40, 56 is untouchable), and it needs to be walked in against
`playthrough.mjs` a step at a time rather than guessed in one go, because the failure mode of
overshooting is a game nobody can finish.

## ADR-193 — Tower: burn damage was the tick rate, not the number on the card

Date: 2026-08-08. Status: accepted.

Every tower panel in this game makes an arithmetic promise: `DPS: 30.0`, and for the two burn
towers, `DOT: 18 dmg/s (5s)`. The enemy table makes another: the boss has **12 armour and resists
poison**, the tank has **8 armour and is weak to fire**. ADR-192 opened the first two rulers on this
game — does it load, does the difficulty curve collapse — and neither of them touched combat. So
none of those promises had ever been checked against what the code does.

The burn tick was this:

```ts
const dotDmg = dot.dps * dt;
applyRawDamage(state, enemy, dotDmg, dot.damageType);   // → Math.max(1, dmg - armor)
```

`Math.max(1, dmg - armor)` is a rule about **one hit**: a hit always lands for at least a point.
Applied to a **per-tick slice of a continuous stream** it says something completely different —
at least a point *every tick*, which at `LOGIC_DT = 0.05` is **at least 20 damage per second**.
Every configured burn in the game is below that. Measured on the shipped build:

| burn | configured | measured |
|---|---|---|
| grunt, 10 dps | 10 | **20** |
| grunt, 8 dps | 8 | **20** |
| tank (8 armour, **weak to fire**), 24 dps | 36 intended | **20** |
| boss (12 armour, **resists poison**), 18 dps | 9 intended | **20** |

Armour, resistance and weakness all landed *below* the floor, so the floor ate all three. The
sharpest way to say it: **being weak to fire made the tank take less fire damage than a plain grunt
with no weakness at all** — 20 against 24. And the boss's poison resistance plus twelve armour
produced exactly the same number as no defences whatsoever.

The floor now sits on the **dps**, not on the slice: mitigate per second, then multiply by `dt`. That
makes it a statement about the game rather than about the step size. The gate that catches it runs
the same ten-second burn at `dt` = 0.1, 0.05 and 0.0125; before the fix those read **100 / 200 /
800** — burn damage was *literally proportional to tick rate* — and now they read 80 / 80 / 80.

Two more things fell out of the same function:

- **Burns stacked without limit.** Both impact sites wrote their own `dots.push({...})` — the same
  fact written twice, with the comment "stacking with existing" — and nothing capped it. Poison L3
  fires every second and burns for five, so **one tower stacked five burns on one enemy** and dealt
  five times the number on its own panel. Measured against a pinned target: fire **1.93×** and
  poison **2.20×** their advertised output. Same damage type now refreshes instead of stacking;
  different types still burn together, because fire and poison are two things.
- Burn damage was credited to `damageByType.poison` **regardless of the actual type**, so every fire
  tower's contribution showed up under poison on the end screen.

Mutations, run separately so the two defects stay separable: restoring the per-tick floor turns the
tick-rate gate and both counter gates red with the original 20/20/20; restoring `dots.push` turns
the stack-count gates red at 2 and 6 concurrent burns and pushes fire and poison back over their
panels. `tests/combat.mjs` 8/8, smoke 5/5, balance 5/5.

One gate was red for a while and it was my ruler, not the game: sniper measured 41.7 dps against a
promised 35.7 because a twelve-second window hands out a free opening shot every time (cooldowns
start at zero). Warm up for six seconds and measure a minute and it reads 35.0. And I lost a round
to the trap already written down in ADR-181 — the `dt` argument I had just added to the debug seam
was **not in `dist`**, because I had not rebuilt. The numbers looked like a real half-rate bug.

Fire and poison lost roughly half their real output here, so the honest follow-up is whether the
game still holds up. `tests/playthrough.mjs` drives a real run through the seam with a policy any
first-time player could execute — build beside the path, upgrade when you can, otherwise build
another. It reaches **wave 41 having lost 0 of 20 lives**, fills every buildable cell at **56
towers**, upgrades all of them, takes all 42 available evolutions, and still ends holding **12,548
gold**. (My first run banked 24,106 because the policy did not try evolutions at all — that number
was my bot's limit, not the game's, and the corrected figure is the one to quote.) So the nerf costs
the game nothing, and the thing worth naming next is not tower strength — it is that **the first
forty waves cannot threaten a player who simply keeps building**.

## ADR-192 — Tower: the first ruler, and a difficulty curve that went backwards

Date: 2026-08-06. Status: accepted.

Seven thousand lines of TypeScript and **no test of any kind** — the one file named like a test was three
lines printing three.js properties. So the first question was not "how does it look", it was whether it
loads, draws, and does so without reaching outside itself.

`tests/smoke.mjs` (5 checks) found two things immediately:

- **The stylesheet's first line was `@import url('https://fonts.googleapis.com/…')`.** A CSS `@import`
  is only discovered after that stylesheet has downloaded and parsed, so it costs a *serialised* second
  request to a third party, and it **blocks rendering**. For a static game shipped on Pages that is a
  first-paint dependency on a host you do not control — measured here as `net::ERR_CONNECTION_RESET`,
  with the fallback being a bare `sans-serif` that matches neither weight nor width. Two local stacks
  now, in `--font-ui` / `--font-display`. The gate is binary: **zero cross-origin requests**.
- **A 404 on every load** for `/favicon.ico`, because the page declared no icon. The repo already has a
  convention — an inline `data:image/svg+xml` — that several other games follow.

Then the substantive one. `tests/balance.mjs` on the 99-wave table:

- **Seven waves were easier than wave one.** The worst is **wave 38: two healers, 180 hp — 14 % of wave
  one's 1260, at the thirty-eighth wave.** Also wave 34 at 500 and wave 12 at 750.
- **Twenty-one times the difficulty fell by more than 40 % in a single wave**, one of them to **0.08×**
  the wave before it. Play far enough and the game turns back into its own tutorial.

The rule deliberately is *not* "monotonically rising" — hard-then-easy is the rhythm of the genre and the
author clearly built that in. What it forbids is collapse: a non-boss wave must be at least as hard as
wave one, and at least 55 % of the strongest of the previous five non-boss waves.

**My first version of that rule was wrong, and the numbers said so.** I let boss waves feed the running
maximum, so after wave 30's 14,680 hp every ordinary wave had to clear 12,478 — it wanted to scale **82
of 89 waves, one of them 69×**. Boss waves are deliberate spikes; using them as the floor for normal
waves measures a game nobody designed. Restricted to the non-boss series, the same rule touches 22 waves,
each landing just above its floor, and the largest enemy count in the game is unchanged at 455.

`scripts/fix-wave-curve.mjs` applies it and `tests/balance.mjs` **imports the rule from that script**
rather than restating it — one fact, one place. Reverting the data turns both curve gates red and names
exactly the waves above.

Bounty scales with count, so raising a wave's size raises its payout too; the gate checks that the
hp-per-gold ratio stays inside one band (5.6 to 15.6) so a difficulty fix cannot quietly tighten the
economy.


## ADR-191 — Elden Ring II: it can be finished

Date: 2026-08-06. Status: accepted.

    [3s]  wave 1   hp 100  stam 100  flasks 3
    [8s]  wave 2   hp  80  stam  48  flasks 3
    [20s] wave 3   hp  87  stam  70  flasks 1
    [36s] boss     hp 100  stam  71  flasks 0
    [82s] victory  hp   7  flasks 0        39 swings, 476 damage

Three waves and the boss, end to end, in 82 seconds of game time, finishing on **7 health with no
flasks left**. Whatever else is true of the balance, the last ten seconds of that run were not
comfortable, which is roughly where a first clear wants to land.

Getting there needed no further changes to the game — the fixes were already in: the lunge that
overshot its target (ADR-189), regeneration through the recovery frames (ADR-190), the flask and the
enemy speeds (ADR-187/188). What it needed was an instrument that could actually play.

**The bot was the bottleneck, and the bottleneck was the round trip.** Every decision cost a
`page.evaluate` — roughly 0.3–0.5 seconds of *game* time at this frame rate — so it swung once every
2.2 s where the game allows 0.87, and spent the rest of its life walking and turning. Moving the policy
**inside the page**, on a 90 ms interval dispatching synthetic key events, removed the round trip
entirely: 4,600 decisions in a run instead of a few hundred.

Two things then blocked it, both bot-side, and both worth recording because they look like game bugs
until you name them:

- **No pathfinding.** It walked straight at a boss sixty metres away through a corridor and pinned
  itself on a wall for **200 seconds with the boss untouched at 100 hp**. A stuck-detector that strafes
  when the distance stops falling was enough — the flood-fill gate had already proved the route exists.
- **Dodge-lock.** At low health the policy dodges whenever something is winding up, and a boss winds up
  constantly, so it froze into a **15 hp against 10 hp standoff for two hundred seconds** without ever
  swinging. One rule — stop dodging once the boss is nearly dead — turned that standoff into the kill.

Neither is a defect in the game, and it matters to say so: for several rounds I had been treating a bot
that could not finish as evidence about the game. It was evidence about the bot. The arithmetic was the
honest instrument throughout, and it said the run was survivable two ADRs ago.

`tests/playthrough-full.mjs` runs the clear and `tests/first-clear.log` is the run above. It takes about
a quarter of an hour of wall time here, so it stays out of `hud-layout.mjs`; the suite keeps the bounded
invariants that this run depends on — the core exchange, point-blank hits, the flask, the disengage
window.


## ADR-190 — Elden Ring II: stamina regenerated during nothing, and the core exchange lost

Date: 2026-08-06. Status: accepted.

The question that actually decides whether this game ships is not "can a bot finish it" — that measures
the bot. It is: **stand in front of the first wave, press attack, nothing else. Do you win?**

You did not. Two reasons, both now fixed and both measured.

**Regeneration was blocked during the whole swing.** The attack animation runs 0.66 s and lands at 0.27 s;
the remaining 0.39 s is recovery, and stamina was suppressed through all of it. Sustained cadence came to
one swing per 1.26 s — **11.9 dps** against wave two's 24.4 — and a full bar bought 5 swings while a single
minion needs 3. What you cannot cancel is the wind-up; once the blow has landed you are already recovering,
and breathing there is fair. Regeneration is now blocked only while `state === "attack" && now < impactAt`.

**And ADR-189's lunge bug was suppressing the rest**: point-blank swings passed through the target, so the
real output was 0.4 dps rather than 11.9.

With both fixed, the trade measures: **13 seconds of nothing but the attack key clears wave one and wins the
exchange 133 damage to 100** — no dodging, no retreating, no flask. The gate asserts exactly that, and
deliberately does not require the player to survive afterwards: the policy then keeps standing in wave two
against three minions with no healing, and dies. If the loop wins with no defensive play at all, it wins
with the dodge, the retreat and the three flasks that the game actually gives you.

**I misread this measurement once before believing it.** The first trade probe reported "146 damage dealt,
zero minions killed", which looked like damage vanishing. Printing the minions' health showed
`[35,35] → [22,35,18]` with the count going 2 → 3: both wave-one minions had died, the encounter had
advanced, and I was looking at wave two's fresh spawns. The reading was right; my interpretation invented
a bug that was not there.

**What this does and does not establish.** It establishes the core exchange is winnable and that a wave
falls to it. It does not establish a full clear — three waves and the boss end to end — and the bot still
does not get there. But the failure is no longer arithmetic, and that is a different kind of gap.

Suite: 91 → **92** browser checks.

## ADR-189 — Elden Ring II: you could not hit an enemy standing next to you

Date: 2026-08-06. Status: accepted.

Chasing completability, I logged every swing the bot threw — distance, angle, hit or miss. The pattern
was backwards:

    4.2 m 中   2.4 m 中   1.6 m 空   1.8 m 空   1.8 m 空

**The near swings missed and the far ones landed.** The lunge is the cause: for the 0.27 s wind-up the
attack writes `LUNGE_SPEED` into the player's speed, carrying them about 0.86 m forward, while the minion
closes about the same. Starting inside ~1.8 m the player **travels past the target**, and the impact test
requires `projected > -radius` — once they are behind you, you did not hit them. The player's real output
was **0.4 dps against a designed 11.9**. The lunge now stops at contact: it still covers whatever distance
the move specifies (ADR-176's rule stands), it just cannot pass through the thing it is aimed at. Same
scenario, same bot: **30 damage → 128**.

Logging the angle as well exposed a second, sharper edge. The wind-up allows `TURN_RATE_ATTACK × impactDelay`
= **70° of turn**, and the misses were all beyond it — 148°, 156°, 153°, 180° — while everything inside 115°
landed. The game was **auto-selecting a target you cannot physically face, and charging 17 stamina for the
swing.**

**I tried to fix that and made it much worse.** Refusing to auto-target anything outside the turnable cone
produced a deadlock: facing away → no target → the attack's turn has nothing to turn toward → still facing
away. Every swing logged 180°, and damage fell from 128 back to **17**. Reverted, with the reason recorded
in the source: *turning slowly beats not turning* — a swing that whiffs but rotates you means the next one
lands. The remaining angle misses are the player's own facing, which movement fixes at rate 9; a bot that
steps toward its target before swinging goes from 2/5 to **7/7**.

The gate does not depend on the bot playing well: stand until a minion is inside 1.9 m, swing three times,
require damage. Before the fix that is exactly the case that produced nothing.

**A third defect surfaced while gating the flask: the interact input was being eaten.** `queuedInteract`
was cleared every frame unconditionally, while drinking additionally requires `now >= knockbackUntil` —
so pressing `E` on a frame where you happen to be taking a hit silently did nothing. You only ever want a
flask mid-fight, and mid-fight you are being hit; at three or four frames a second one frame is a quarter
of a second of input. The gate read it plainly: pressed `E`, health 50 → 40, flasks 3 → 3. Interact is
buffered for 0.45 s now, and the gate reads 50 → 100 with a flask spent.

**And the same real-versus-motion-time confusion, for the third time this session.** The debris-gravity
gate pressed attack and sampled 250 ms later — but impact lands 0.27 *motion* seconds after the swing,
which at this frame rate is about 1.1 real seconds, so both samples fell before there was anything to
measure and it read `null`. It waits for the burst to exist now. Three separate instruments this session
have used real milliseconds to wait for something that runs on the motion clock.

**Completability is still not demonstrated.** With the lunge fixed and a policy that faces before swinging,
manages stamina, and drinks, the bot clears wave one at 90 health and dies in wave two having spent all
three flasks and killed one of three. Better than any previous round, still not a clear. I have stopped
short of tuning the policy further, because past this point the thing being measured is the policy.

Suite: 90 → **91** browser checks.

## ADR-188 — Elden Ring II: the flask I added could never be drunk

Date: 2026-08-06. Status: accepted.

ADR-187 gave the player three flasks because the health budget did not cover the route. Then I measured
whether they get used: across two bot runs, **21 attempts to break away, 0 successes, 0 flasks drunk.**
The recovery existed and was unreachable.

The cause is in two numbers that were never compared. The player walks at **4.4** (oathbound; the wizard
is 4.2). Minions ran at **[3.6, 4.1, 4.4]** — **wave three matched the player exactly and outran the
wizard**, and wave two came to 93 %. Walking away gains 0.3 m/s, so opening the 7 m a drink needs takes
23 seconds of uninterrupted retreat. The only real disengage was the sprint, which drains 13/s **and
suppresses the 28/s regeneration** — *the tool for breaking off spends the resource you are breaking off
to recover.* Minions are 73/77/84 % of walking speed now, so retreating on foot gains 1.2/1.0/0.7 m/s.
Measured after the change: walking from 1.8 m opened **5.9–6.6 m**, at a cost of about 20 health.

The gate compares **the game's own two numbers** — `動作().設計速` against `敵動作().設計速` — rather
than a threshold I picked. With the old values it reads a gain of 0.0 on wave three, which is the defect
stated as arithmetic.

**My instrument had the same defect the game did, and I had already written it up once.** The bot issued
commands in real milliseconds — a 1.2-second sprint retreat. This environment runs three to four frames a
second with `delta` clamped, so 1.2 real seconds is **0.2 seconds of game time**, and one retreat covered
0.7 m before the bot re-decided. That is exactly the hole ADR-187 found in four suite gates: *scripts
written in real seconds driving something that runs on motion time.* I found it again in my own bot, one
round later, after fixing it elsewhere. The bot waits on motion seconds now.

**What is still not established:** the bot does not finish the game. It reaches wave two and dies. The
claims here are narrow and each is separately measured — the health budget covers the route (ADR-187),
and a disengage window now exists (this one). Whether a person can chain them into a clear is unproven,
and I am not going to keep improving the bot until it says yes, because at that point I would be
measuring the bot.

Suite: 89 → **90** browser checks.

## ADR-187 — Elden Ring II: the run needed more health than the game gave you

Date: 2026-08-06. Status: accepted.

"Product-grade" starts with one question: can the game be finished? It could not, and the proof is
arithmetic on the game's own constants rather than on how well a bot plays.

An attack costs 17 stamina and takes 0.66 s, and **stamina does not regenerate while attacking**
(28/s otherwise). Sustained cadence is therefore roughly one swing per 1.26 s — **11.9 dps**. Wave two
is three minions at 13 damage every ~1.6 s: **24.4 dps** against you. Even fighting them strictly one
at a time, a minion takes 2.9 s to kill and costs 23 health, so wave one runs 47 and wave two 70:
**117 damage against a 100-point pool, before wave three and before the boss exists.**

And there was **no way to recover mid-fight**. The two graces heal to full, but they are fixed points;
the fight drifts away from them, and a bot that tried to walk back to one died on the way every single
time. The game had the bonfire half of the soulslike frame and not the flask half.

So: three flasks, 55 health each, drinkable anywhere — **with a 0.95 s lockout** during which you
cannot attack or dodge, which is what makes *when* to drink a decision rather than free health. Graces
refill them. The budget goes from 100 to 265, which covers the ~200 the run demands.

Mobile had a worse version of the same problem: the touch layout has ◎ / DODGE / ⚔ and **no interact
button at all**, so phone players could never even use a grace. One button, two meanings — the same as
`E` on a keyboard: rest if you are standing at a grace, drink otherwise.

**Being honest about what this does not prove.** The bot still cannot finish the game; it dies on wave
two. But a bot dying proves things about the bot, and I had already caught myself tuning the bot rather
than the game — teaching it to sprint-kite made it *worse*, because sprint drains the same stamina that
attacking and dodging need. The claim here is narrow and arithmetic: the health budget now covers the
route. Whether a person can clear it is not established.

**Four gates went red that had nothing to do with flasks**, and the cause was ADR-186's speed-up. Those
scripts are written in real seconds while the thing they drive runs on motion time; making the game run
2.5× faster per real second meant the player absorbed 2.5× the punishment during an unchanged script and
died before the measurement. The scripts are rescaled. One of the four was a genuine ruler bug: knockback
**writes** `playerSpeed` (4.2), the next frame's ramp decelerates from there, and top speed recorded a
number the player never produced — the mobile stick read 3.5 against a predicted 2.2. Being shoved is not
your speed, which is the same hole ADR-180 closed in the acceleration ruler.

Also recorded, measured but unchanged: **one stamina bar buys 5 swings, and a minion takes 3** — a wave
of three costs two full bars of offence. The flask fixes the health budget; it does not touch that.

Suite: 84 → **89** browser checks.

## ADR-186 — Elden Ring II: the suite got slow enough to start failing gates that were not broken

Date: 2026-08-06. Status: accepted.

The ER2 browser suite had grown to roughly half an hour and then stopped being merely slow: a run died
outright when the mobile block waited sixty seconds for an enable-able Enter button, and a later run
reported two red gates whose code was fine. Slowness had turned into wrong answers.

There was no ruler for "which gate is slow", so `ER2_TIME=1` now prints the seconds between checks and
a top-ten at the end. Measuring first paid immediately — my guess had been the explicit waits, which
came to about eight minutes of a thirty-minute run.

**Two causes, both structural.**

- **Two blocks ran before the shared page was parked.** That page is a live WebGL loop; under software
  rasterisation it takes the CPU with it, and the mobile block — which opens its own context — was
  competing with it. A comment at the parking line already described this hazard for the blocks below
  it; two blocks above it were doing exactly what the comment warned about. Both are self-contained, so
  they moved below the park with no other change. **955 s**, down from about thirty minutes.
- **Resolution is frame rate here, and frame rate is game time.** `delta` is clamped to 0.05, so every
  gate that waits for motion seconds pays whatever the frame rate costs. Measured on this machine:
  640×380 gives **1.7 fps**, 420×250 **3.2**, 320×190 **4.2**. Not one of the measurement pages cares
  about resolution — they read motion seconds and counters — so they run at 320×190 now. Layout, camera
  and touch gates keep their real sizes, because size is the thing they measure. **955 s → 637 s**, with
  the boss fight going 174 s → 63 s and the boss restart 131 s → 60 s.

**Two of my own gates were asking the wrong question, and load exposed it.**

- The mobile sprint gate required both a speed above the walk cap *and* a `Run*` animation. Speed above
  4.4 is already a proof — the walking path's target is `speed × 推度` with `推度 ≤ 1`, so it cannot
  produce it. The animation is a sampled instant, and one run caught `RecieveHit` at exactly the wrong
  moment: 6.82 m/s, gate red. The clause proved nothing and only added a state that could flicker.
- The camera-settling gate asserted "tail median below 0.02", a number lifted from a single measurement
  of 0.004. A run read 0.025 on a tail going 0.028 → 0.016 — **converging, and marked red for it**. The
  mutation's signature was never magnitude; it was *never settling*, wandering 0.03–0.16 up and down.
  The gate asks whether the tail decreases now, which is what convergence means and needs no constant
  — and then it went red a third time, on `[0,0,0,0,0,0]`: **the system settled so completely that
  "still shrinking" stopped being true of it.** Having arrived counts as having settled.

Suite: 84 checks, **637 s** with timing on. Not fast, but it now finishes without eating its own results.

## ADR-185 — Elden Ring II: Penny says the screen shakes, and the first number I produced was my own ruler's

Date: 2026-08-06. Status: accepted.

ADR-177 investigated the same report with screenshots and failed, for a reason worth restating: a
per-frame artefact cannot be sampled at 2.4 Hz. This round used a **per-frame in-game ruler** instead
— camera position, occlusion distance, and the camera's distance from its own smoothing target,
recorded inside the render loop. That removes the screenshot limitation but not the frame-rate one, so
I still could not reproduce the shake directly; what it did do was let me find two real defects.

**The first number I got was wrong, and it was mine.** `allowed` — the wall-occlusion camera distance
— appeared to jump **8.2 m in one frame while the player stood perfectly still**. `量鏡開()` reset the
sample buffers but not `上幀allowed`, so the first frame compared 8.4 against 0. With the reset fixed:
standing still, `allowed` moves **0.021 m** and the camera **0.012 m** median. The camera is steady.
I nearly went and "fixed" a stable system. Every ruler needs its own first-sample guard.

Two defects it did find:

- **The renderer and the composer present at different pixel ratios** — `min(dpr, 1.8)` against
  `min(dpr, 1.55)`. Below 1.55 they clamp to the same value, which is why **this defect is invisible on
  the test machine and on ordinary desktop monitors**, and why a gate on the default page would be
  green with it still present: measured, dsf 1 reads 1 against 1, dsf 2 reads **1.8 against 1.55**. At
  phone or retina density every frame is rendered at 1.55 and blitted into a 1.8 canvas — a non-integer
  resample, every frame, under a camera that never stops moving. Edges crawl. The gate runs at
  `deviceScaleFactor: 3` for exactly this reason.
- **The shake was written into the smoothing state.** `camera.position` *is* the lerp's state, and the
  shake was added to it after the lerp, so each shake sample persisted and bled off at only the lerp
  rate while the next one piled on. Isolated properly — pushed to the boss stage so the minions are
  dead and the boss is still sixty metres away, giving a stationary camera target — repeated shakes
  left the state **wandering between 0.03 and 0.16 m and never settling**; with the shake as a
  render-time offset it converges to **0.004**. Combat fires shakes continuously, and ADR-184 has just
  made the boss land attacks it never used to, so this wobble is now permanent during a fight.

Isolation mattered more than usual here. My first two attempts at the shake experiment were
contaminated — minions kept hitting the player, the knockback moved the camera target a full metre, and
I read the smoothing lag as accumulation. The measurement only became decisive once the scene had
nothing in it that could move the target.

**What I have not established** is that either defect is what Penny is seeing. The first fits the
symptom well and only appears on a high-density display; the second is real but small. Both are fixed
and gated; if it still shakes, the useful next facts are the device and whether it shakes in the menu
as well as in play.

Suite: 82 → **84** browser checks.

## ADR-184 — Elden Ring II: the boss crossed sixty metres, changed phase, and dropped to one bar without throwing a single punch

Date: 2026-08-06. Status: accepted.

`__ER2.推關()` from ADR-182 made the boss reachable in a test for the first time. The first thing it
did was expose a defect in itself, and then two in the fight.

**The seam built a state the game cannot be in.** It advanced the stage without killing anything, so
the boss opened while all eight minions were still alive and chasing. The ruler then measured a fight
where the player is beaten to death by trash while the boss is still sixty metres away — a game that
does not exist, the ADR-169/180 trap once more. The reason it could not do better is that the whole
"a minion dies" sequence lived **inside the player's impact handler**: the only way to kill a minion
was to swing at it. That is now `殺死雜兵()`, called by both.

With a faithful state, two real defects:

- **The leap can never be chosen.** `chooseBossMove` returns `"leap"` only when
  `distance > LEAP_MIN_RANGE` (6.5), and the call site sits after `else if (bossDistance > BOSS_REACH)`
  — reachable only when distance ≤ **3.15**. 3.15 < 6.5. The pure function has a gate and the gate is
  green, because it feeds the function distances the game never supplies. Exactly ADR-179's `locked`.
  And measurement found a second lock on the same door: the boss enters phase 2 at a measured **6.0 m**,
  already inside the leap's minimum, so even with the call site fixed a "phase-2 move" could never reach
  its own range. A gap-closer that unlocks only after the gap is closed is not a gap-closer. Both phases
  leap now; phase 2 leaps far more often, and there is a `LEAP_MAX_RANGE` because the flight is
  `displacement ÷ remaining wind-up` and an unbounded leap flies at an absurd speed.
- **Every hit cancelled whatever the boss was doing.** A landing blow set `state = "hit"`
  unconditionally, wind-up included, so the attack simply evaporated. Measured against a ranger: the
  boss reached **17 hp having started 1 attack and landed 0** — it crossed sixty metres, changed phase,
  and fell to one bar without ever throwing a punch. The telegraph ring was decoration; the counterplay
  was "out-damage it", not "read it and move". Hyper-armour now: a hit does not interrupt a wind-up
  (death still overrides everything). After: **4 attacks started, 4 landed, 132 damage dealt**, and the
  leap fires — the phase-2 transition was measured mid-leap at 1.5 m.

The rule moved to `src/boss.ts` (no three.js, no cannon-es, no JSX) so Node can test it. That was forced
by the work: a `.tsx` cannot be imported under `--experimental-strip-types`, so a rule living in
`GameClient.tsx` is testable only through a browser. The new Node test asserts what the browser cannot:
that the leap window is **compatible with the call site** — `LEAP_MIN_RANGE > BOSS_REACH` and the window
is wide enough to survive the boss crossing it.

**Three existing gates went red, all for real reasons, and two of them had been green for the wrong one.**

- `第一階段永遠淨係用拳` and `第二階段企遠會撲` both built their "far" distance as `LEAP_MIN_RANGE + 8`
  = 14.5 m. With an upper bound that is now outside the window, so both read "punch". A ruler that
  constructs the rule's input from one end of the range cannot follow the rule; the seam exposes
  `leapRange()` now and the gates sample the middle of the window. The phase-1 gate was also asserting
  a design that measurement has retired, so it asks the real distinction instead: both phases leap,
  **phase 2 far more often** (12/40 against 22/40).
- The boss-restart gate from ADR-182 stopped seeing the player die. It had been passing because
  **eight minions that should not have existed were killing them** — the very state the seam fix
  removed. My own gate from the previous round, green for the wrong reason, one round later. It walks
  the player to the boss now instead of waiting for a boss sixty metres away.

Suite: 78 → **82** browser checks, `npm test` 16 → **17**. Both fixes were reverted and reproduced
their original measurements: without hyper-armour, 4 attacks started and **1 landed**; with the leap
choice back behind the approach branch, **0 leaps**.

## ADR-183 — Elden Ring II: the analog stick was digital, and half the players could not run

Date: 2026-08-06. Status: accepted.

Two defects in one quantity: the stick's deflection.

**`updateStick` computes a magnitude and the game throws it away.** One line later, `movement.normalize()`
discards it, so a gentle nudge and a full push produce exactly the same 4.4 m/s. There is no walking in
this game on a touch device — only stopped and full speed. Measured after the fix: a half push (26 px of
the 52 px radius) gives **2.2 m/s with the Walk animation**, where it previously gave 4.4.

**Sprint was bound to `ShiftLeft` and nothing else.** The touch scheme has exactly three action buttons —
◎ / DODGE / ⚔ — so the entire 1.55× movement mechanic was unreachable on a phone. That is not a tuning
gap, it is a mechanic that half the audience never had. A fourth button was the obvious move and the
wrong one: ADR-175 already fought a round over action-button placement crowding the stick zone. The
console convention costs no UI at all — **push the stick to the ring and you run**. Threshold 0.97, which
means the thumb has to reach or pass the visible ring, so it cannot be hit by accident, and partial
deflection now has a real purpose to make it worth staying inside. Measured: full push **5.6 m/s with
`Run_Weapon`**, against a 4.4 walk.

Keyboard is untouched by construction: its input magnitude is always 1 (diagonals clamp from √2), so the
new scaling is a no-op there, and the sprint threshold reads a **separate** touch-only magnitude — reading
the combined one would have made `W` alone a sprint.

One thing fixed on the way past: the walk animation's rate was `新速 / speed`, where `speed` is the target
for this frame. With a scaled target that ratio is ~1 whatever the speed, so a slow walk would play feet
at full rate — the exact foot-slide that block was written to fix. The denominator is the class's base
speed now.

Suite: 76 → **78** browser checks.

## ADR-182 — Elden Ring II: dying sent you back to the first wave, and no test could reach the boss

Date: 2026-08-06. Status: accepted.

Open since ADR-170 and deferred twice: `restart()` set `encounterStage = 0` unconditionally. Measured
end to end — cleared wave 1, died on wave 2, pressed R — and it puts you back on **wave-1**. Everything
you had already done, you do again. The arena has checkpoints (graces) and they meant nothing across a
death.

The soulslike convention is *enemies reset, world progress does not*, and that is what it does now:
the boss returns to full health, the wave you died on comes back whole, cleared waves stay cleared,
and the fog gates match the stage you had reached rather than closing in front of you again.

**The reason this sat for three rounds is that no test could get to the boss.** Clearing three waves
of trash in a 3 fps software rasteriser takes minutes, so "die to the boss, then restart" was a path
nothing had ever executed — the same shape as ADR-179's `locked` branch. `__ER2.推關()` fixes that: it
**re-implements nothing**, it calls the game's own `activateWave` / `unlockBossEncounter`, exactly as
`zoomBy` calls the game's own zoom. The boss encounter is now reachable in seconds.

It immediately earned its keep by catching a defect **I had just written**. Restart set `gateFade = 1`
so the gate would fade in; but the per-frame fade block is `if (bossActive && gateFade > 0)` and it
assigns `visible = gateFade > 0`, so on a boss restart my `visible = false` was overwritten and a fog
gate **faded into existence in the middle of the boss arena — drawn, but with no collider**. The gate
that caught it asks a question worth keeping: *the number of gates drawn equals the number of gates
that stop you*.

**The same build hazard as ADR-181, again.** The first mutation had a type error, `npm run build`
aborted, the stale `dist` stayed on disk, and the probe reported healthy numbers. I now expect this:
if a mutation's numbers do not move, check that the build actually produced a new bundle.

**One flake removed by construction.** The entry sequence (click class, click enter, wait) was copied
into six places using Playwright's `click()`, which waits for a scheduled navigation that never comes.
With the suite now opening eight pages, the sixth started timing out — the mobile block had documented
this exact failure and its DOM-click workaround years of context ago, in one place only. There is one
`入場()` helper now.

Suite: 72 → **76** browser checks.

## ADR-181 — Elden Ring II: an impact effect that did not know it was an impact

Date: 2026-08-06. Status: accepted.

Three measured defects in the hit effect, all the same shape: the effect is drawn without reference
to the event it depicts.

- **One emitter for the whole game.** `burst()` overwrote a single `THREE.Points`, so a second hit
  inside the 0.55 s lifetime **teleported the first cloud onto the new position**. Measured in a real
  fight: **two of seven bursts stolen (29 %)** — you land a blow and its debris jumps onto you
  because a minion hit you in the same beat. Now a pool of five, evicting the oldest; peak concurrent
  use measured at 2.
- **The spray ignored the blow.** Horizontal velocities were isotropic random and vertical was
  `random() * 4.2` — **never negative**, so 39–42 of 42 particles always flew upward. Whatever angle
  you struck from, the same fountain came out. Debris now launches into a cone around the blow
  direction, with lift that can be downward. Directional concentration (mean velocity ÷ mean speed)
  goes from **0.03–0.11**, which is the noise floor, to **0.75–0.93**.
- **Debris fell at 5 m/s².** Half gravity, so it hung in the air. Measured by integration rather than
  by reading the constant: **5.0 → 9.80** against a true 9.81.

**A hazard worth writing down.** The first mutation run reported 72/72 green. The mutation had a type
error, `npm run build` aborted, and **the previous `dist` was still on disk** — the suite serves
`dist`, so it happily tested the unmutated bundle and called it green. A build that fails leaves a
stale artifact that reads as success. The mutation was rewritten to compile, and then all three gates
went red reproducing the original figures exactly: 被搶 2/7, 集中度 0.03–0.11, 重力 5.0.

Camera shake is still a constant 0.24 for every player attack regardless of damage (13 through 22).
That is visible in the source but I have not measured it as a defect, so it is left alone and noted.

Suite: 69 → **72** browser checks.

## ADR-180 — Elden Ring II: the acceleration cap that finished in one frame, and a body that walked sideways

Date: 2026-08-06. Status: accepted.

ADR-176 gave the player an acceleration cap and I recorded it as fixed. It was not. `ACCEL = 70`
against a top speed of 4.4 m/s means the ramp completes in **0.063 s**, and `delta` is clamped to
0.05 — **one frame**. Measured on the shipped build: **time from standstill to top speed, 0.05 s**.
A capped ramp and an instant jump are the same number under an acceleration ruler; the question that
separates them is *how long did it take*, and nothing asked it. 70 m/s² is 7 g.

The second defect was visible rather than numeric. Displacement used **the direction you want to go**
while the model's facing was a separate rate-limited line, so the body slid in a direction it was not
facing at all: **player sideslip 2.0 rad (115°)** — hold A and the character faces north while
travelling west at full speed with the run animation playing forward. Minions measured 0.43 rad.

Both are now one rule, `gaitStep` in `src/motion.ts`: turn toward the desired heading at the capped
rate, move **along the facing**, and lose speed while turning hard (a runner brakes into a corner).
Player, minions, boss and the `追擊試` reachability seam all call it — the seam especially, because a
seam running different rules from the game measures an enemy that does not exist (ADR-169's trap).
`ACCEL` 70 → 8, `DECEL` 95 → 14. Sideslip 2.0 → **0.00** and 0.43 → **0.00**.

**Three rulers were measuring something other than what they named.**

- The acceleration gate read **41.4 m/s² against a limit of 14**, unchanged when I excluded wall
  collisions. It derived acceleration from *position deltas*, and a position delta also contains wall
  sliding, gravity, and **minions shoving the player through rigid-body contact**. Being pushed is not
  your acceleration. It now measures the step the controller applied to itself, on frames nothing
  interfered: exactly `DECEL`.
- The minion-cadence gate ran on the shared page and its 32-second window ended with
  `狀態: "dead"` — it was **measuring a corpse**, and it had been for some time. Own page, and it
  stops the moment the player dies instead of timing out into nothing.
- `打得死嘢` asked whether an enemy count dropped, and four impacts × ~17 damage = 68 against two
  minions' 70 hp: **the threshold was finer than the thing it guarded**, one hit either way. It
  measures cumulative damage dealt now, which has no threshold sitting in noise.

**One gate I wrote and then deleted.** A browser check on ramp duration read 0.5 s healthy and 0.3 s
with `ACCEL` put back to 70 — another line I would have had to pick inside the noise, because in the
real game "starting" and "turning" are not separable (turning costs speed by design). The pure-function
test answers the same question at **0.067 s versus 0.55 s**. It also carries the check the browser
gates structurally cannot: they compare against the game's own constant, so changing the constant
moves both sides — a Node test asserts `ACCEL` is on a human scale at all.

Suite: 68 → **69** browser checks (one added, one deleted), `npm test` 11 → **16**, hub 96/96. Both
fixes were reverted and reproduced their original measurements.

## ADR-179 — Elden Ring II: the archer fires sideways, and my first ruler read its own denominator wrong

Date: 2026-08-06. Status: accepted.

The last red gate was `WAYFARER：打得死嘢，推得郁關卡` — arrows fly, nothing dies. Chasing it turned
up one real defect, one visual defect, and one instrument error of my own.

**The instrument error first, because it shaped everything after it.** I instrumented "the target we
aim at" versus "the target damage resolves against" and read **對得上 3/6 and 4/7** — half the arrows
apparently landing on nothing. That denominator was **發招 (swings started)**, not **落點 (impacts
that actually ran)**. Once I counted impacts, the pre-fix build read **4/4** — the two target rules
had never disagreed. The missing swings were interruptions: a minion hits you mid-draw, the state
leaves `attack`, and the impact block never runs. Correct behaviour, misread as a bug. I had already
written the "fix" (projectiles resolve against what they were launched at) before checking; the
mutation showed **identical numbers with the branch deleted**, so it is gone. One rule at impact.

**The real defect.** Attack turning was written `if (locked && …)`. `locked` initialises to `true`,
so every one of the sixty-four gates ran locked and **the `false` branch of that condition had never
been executed by anything**. My first version of the facing gate measured on a locked page: green,
and just as green with the `locked &&` put back — worthless. Pressing Q first is what made the ruler
real: **at impact the character is still 0.43 / 0.39 / 0.17 / 0.46 rad off its target (up to 26°),
identical to the deviation at swing start** — the entire wind-up passes without the body rotating at
all. It looses arrows out of its side. Lock-on should govern *how much* aim correction you get, not
*whether you look at the thing you are hitting*. Turning now runs whenever there is a target, at the
existing `TURN_RATE_ATTACK`; deviation at impact goes to **0.00** from launch deviations up to 0.82.

**The visual defect.** The projectile's destination was copied once at launch, and the target walks
during the 0.43 s flight: the arrow buries itself **up to 1.8 m from the enemy** in open ground while
that enemy takes full damage. The destination tracks the live target now. Two rulers, deliberately
split: `箭落差` measures how far the target moved during flight (independent of any fix, so it stays
non-zero and keeps the gate from passing vacuously), `箭到位` measures where the drawn arrow actually
stops — 1.8 → 0.00, and reverting the tracking puts `箭到位` back exactly equal to `箭落差`.

**A gate that was green for the wrong reason.** `打得死嘢，推得郁關卡` asserted
`關 !== 'wave-1' || 狀態 !== 'playing'` — and **dying also stops the status being `playing`**. Stand
still until a minion kills you and the gate passed. It now requires `狀態 !== 'defeat'` and that the
enemy count actually fell.

Suite: 64 → **68** browser checks, `npm test` 11/11, hub 96/96. Every new gate was run against its
mutation and reproduced the original measurement.

## ADR-178 — Elden Ring II: I shipped a character who moves at 0.09 m/s, and sixty-two gates said fine

Date: 2026-08-05. Status: accepted.

Going after attack feel, I measured the wrong thing first and found something much worse.

ADR-176 replaced `velocity = direction × speed` with a ramp: `approachSpeed(現速, speed, delta)`,
where `現速` was read back off the physics body. But every frame begins with
`playerBody.velocity.x = 0`, so `現速` is **always zero** — the ramp restarted from a standstill on
every frame and the commanded speed never exceeded `ACCEL × delta`. Measured on the shipped build:
the player travels **0.09 m/s against a designed 12.5**. The game was close to unplayable and I
merged it.

Sixty-two gates were green. Every one of them measured a **rate of change** — peak turn rate, peak
acceleration, damage per second — and not one measured **a value**. The acceleration gate in
particular read exactly `ACCEL`, which is what a correct ramp and a completely broken one both
produce. Speed now has its own state variable, and the suite asks the question it never asked:
**does the character reach the speed printed on its own class card?** 12.5 against 12.5.

The attack work that started the round:

- **A swing moved the character 0.00 m**, standing or running — the blade sweeps like a turnstile
  while the feet stay planted. There is a lunge now, and the important part is that it is *written*
  rather than *added*: velocity is set to `LUNGE_SPEED` decaying across the wind-up, so the step is
  the same whether you attacked from a sprint or from a standstill. The distance belongs to the
  move, not to how fast you happened to be running.
- **ADR-176's turn cap had a hole**: locked-on attacks still ran `player.rotation = atan2(...)`
  outright, so you could still spin instantly mid-swing. Attacks turn at half the walking rate now —
  enough to correct your aim, not enough to pirouette.

Left open and measured, not hidden: **the body travels at 28 % of its commanded velocity** —
3.48 m/s sustained against 12.5 commanded. Removing the per-frame zeroing changes nothing (3.47), so
it is not that. This is long-standing, not from this round, and it means the speed on the class card
has never been the speed you move at. Fixing it properly means integrating the character
kinematically and leaving cannon-es for collision only — too large to start at this end of a long
session, and it needs its own round.

Mutations: reading `現速` back off the body reproduces **3.5 against 12.5**; deleting the lunge
reproduces `踏前實速 0`. `hud-layout.mjs` 64/64.

## ADR-240 — MOBA 嘅齒輪係手機暫停入口，停頓原因要分開記

Date: 2026-08-11. Status: accepted.

窄手機版 MOBA 已經冇一個唔撞 HUD 嘅空角再放第四粒按鈕。保留原有 44×44 齒輪，將佢標成
「開設定並暫停」；玩家開畫質／音效設定時，場波必須停低，關閉後先繼續。`aria-label`、
`title` 同 `aria-expanded` 要同時反映呢個用途，唔可以只靠 ⚙ 圖示。

`main.js` 用 `pauseReasons` set 分開 `manual`、`visibility`、`context`。任何一個 reason
存在都唔行模擬；解除其中一個只可以喺 set 清空時重設 frame clock 同續波。呢個保證玩家開住
設定時鎖屏／WebGL context 恢復，唔會偷偷續返未準備好嘅一局。

瀏覽器測試若要手動推 `sim`／`view`，先經真實齒輪停低主 rAF；fixture 重設死亡角色時亦要
同步清 `view` 嘅 dead rig，否則測試會自己抹走攻擊 lock，製造間歇性假紅。`hub-pause` 唔再
為 MOBA 保留 known-exception；以真手機 viewport 實測停住與續返。

## ADR-241 — 對比度尺只量玩家實際見到嘅文字

Date: 2026-08-11. Status: accepted.

Tower 開場 `▶ START` 原本係白字配淺色 cyan gradient，手機截圖量到只有 2.69:1；按鈕主
gradient 兩個 stop 改用深青色，保留原有視覺語言但達到 WCAG AA。今後 action button 嘅
白字對比要由真像素 gate 守住，唔可以靠陰影或肉眼估。

同一輪亦確認「有 layout box」唔等於「玩家見到」：開場 modal 蓋住 Tower build menu 時，
`.build-name` 會被像素尺誤報低對比。`tests/hub-read.mjs` 先以 `elementFromPoint()` 確認
文字中心點係最上層可見元素，再量背景；遮住嘅 DOM 唔係可讀性 failure。

## ADR-242 — WebGL context loss 要有持續復原出口，唔可以只靠 flash

Date: 2026-08-11. Status: accepted.

MOBA 掉 WebGL context 時原本只顯示 1.6 秒 flash。真實 Hub gate 會等到 context 自己恢復前先量畫面；
flash 早已消失，玩家見到嘅係一塊冇反應嘅黑畫面。新增 `.moba-context-recovery` modal card，
持續交代「畫面暫時中斷」及「遊戲已暫停」，並提供重新整理出口；`webglcontextrestored` 後先由
HUD 收起。呢個 card 唔取代 pause reason set，設定、切走同 context 仍然各自計數，避免其中一個
reason 清走就錯誤續波。

同一輪把 MOBA 所有 local imports、entry、Hub launcher/style 共用 `assets-31`，因為只 bump
`main.js` 會令 Safari/GitHub Pages 混載舊 HUD/規則 module。Hub context driver 文字節點亦必須
null-safe；detached loading DOM 唔應該被測試本身誤報 browser error。

## ADR-243 — 長時間真 browser 量度要隔離局面，burst 量度要鎖定同一個樣本

Date: 2026-08-11. Status: accepted.

Elden Ring II 嘅手機速度 gate 需要等足幾秒，第一個樣本可以令玩家走入戰鬥甚至死亡；下一個
樣本唔可以假設 `.touch-zone` 仲存在。兩個速度 probe 每次重新入場，死亡後收場只做安全放手，
保留遊戲死亡時收起控制區嘅正常行為。

同一個碎屑池會揀「命最長」嗰蓬回報。量重力時兩次讀取之間如果有新 burst，兩個 `vy` 係兩蓬
唔同嘅初速度，唔可以相減；只接受 `打擊().次數` 不變嘅連續樣本。箭追擊同未鎖定轉向 gate
亦要以真實玩家輸入（橫移／死亡後 R 重開）取得足夠落點，唔好用測試專用 state 代替。

## ADR-244 — Xiangqi 環境光要自包含，失敗時唔阻住入局

Date: 2026-08-11. Status: accepted.

Xiangqi 3D 棋盤嘅 Studio Small 09 1k HDRI 係 CC0 資產，放喺
`games/xiangqi-ai/assets/`，由 Vite `?url` import 並一同生成 tracked `dist/assets/`。
GitHub Pages／離線瀏覽唔可以再依賴 Poly Haven runtime URL；`tests/hub-cdn.mjs` 會守住 source
冇外部 HDR URL、dist 有唯一 `.hdr` 同 bundle 真係引用該檔。

HDR 只係環境光增益，唔係玩法依賴。`HDRLoader` decode/load 失敗時保留現有 key/rim/ambient
lights，並顯示短暫 status message；context-loss 嘅持續復原提示優先於呢個非阻塞提示。

## ADR-245 — Xiangqi 悔棋要解鎖控制，同存檔一齊回退

Date: 2026-08-11. Status: accepted.

落子動畫完成後先解除 `moveLock` 再 redraw，否則 `悔棋` 會永遠保留動畫期間嘅 disabled 狀態。
悔棋亦必須同步 resumable localStorage：有 history 就存返目前局面，冇 history 就清除存檔。
`tests/xiangqi-flow.mjs` 用真實 mobile tap、AI 回應、悔棋同 refresh/Continue 守住呢兩條 invariant。

## ADR-246 — Gomoku AI 延遲落子要有 lifecycle cancellation

Date: 2026-08-11. Status: accepted.

Gomoku 人機模式嘅白子由 500ms delayed timer 落。原本玩家落完黑子後即刻返選單，再開一局，舊 timer
仍然會對新 board 執行：新局會無故多一粒黑子，輪次亦跳到白子。呢個係導航／reset 之間嘅 state
pollution，唔係 AI 策略問題。

`ai.js` 用可取消 timer 加 token guard；`resetGame`、`continueGame`、離開選單同轉去非 AI mode
都會取消 pending move，`makeAIMove` 亦只接受仍然係 AI 白子回合嘅 state。`tests/gomoku-flow.mjs`
用真實 mobile browser 守住「離開後立即重開仍然係空盤」同「正常新局仍會落白子」兩條 invariant。
Gomoku 六個 local script 共用同一個 cache token，避免 Pages/Safari 混載舊 lifecycle code。

## ADR-247 — Big Two CPU queue 要按 deal generation 取消

Date: 2026-08-11. Status: accepted.

Big Two 為咗畀玩家睇清楚每一步，用 450/600ms timer chain 執行 CPU。原本退出對局或重新 deal
唔會取消舊 chain；真實 mobile flow 可以令舊 callback 同新局 callback 同時消耗新手牌。

`app.js` 以 timer handle 加 generation token 管理 CPU queue。進入 landing、轉 mode、開始／重新開始、
續局同新 deal 都會 invalidate 舊 generation；只有當前 generation 可以再 schedule 下一步。`tests/big2-flow.mjs`
用真實 mobile browser 先開 CPU turn、即刻退出再開 CPU turn，守住舊 generation **0** fire 同新局正常
**1** 個 CPU turn。兩個 local script 共用新 cache token，避免 Pages/Safari 混載舊 queue code。

## ADR-248 — Dou Dizhu 叫牌／出牌 CPU loop 要共用 generation

Date: 2026-08-11. Status: accepted.

Dou Dizhu 有兩套 delayed loop：叫地主同出牌。原本兩套都直接 `setTimeout`，退出、重新發牌、續局或
切換 online mode 時冇取消；舊叫牌 callback 可以落入新局，亦會同新局 loop 疊加。

`game.js` 提供單一 timer handle 加 generation scheduler，`ui.js` 嘅 bid/play loop、Continue 同 online
CPU fallback 全部經同一個 seam；`main.js` mode switch 先 invalidate 舊 generation。`tests/doudizhu-flow.mjs`
用真實 mobile browser 守住舊 generation **0** fire、新局正常 **1** 個 CPU 叫牌回合，同八個 local script
cache token 一致。

## ADR-249 — Penny Crush 消除鏈要按局面 generation 取消

Date: 2026-08-11. Status: accepted.

Penny Crush 嘅消除、補位、連鎖同特殊磚係多段 `async` 動畫鏈。原本 Restart 只重設棋盤同分數，
舊鏈喺等待 320/300ms 後仍會對新棋盤加分、補位或結束新回合；真實手機 flow 實測新局由 0 分
變成 30 分。

`penny_crush.js` 以 `generation` 加 `waitFor()` guard 包住所有消除／補位／特殊磚遞迴入口；
`init`、`stop`、`exit` 會 invalidate 舊 generation，同時清走殘留動畫 DOM。`tests/penny-crush-flow.mjs`
守住 Restart 後舊鏈 **0** 分污染、新局正常消除計分，同一個 cache-bust token 保證 Pages 不會混載舊 script。

## ADR-250 — Snake 登入 Enter 同手機版棋盤要隔離遊戲 lifecycle

Date: 2026-08-11. Status: accepted.

Snake 的全域 `keydown` handler 會用 Enter 啟動未開始嘅局面。名稱表單提交如果冒泡到 window，玩家按 Enter
登入嗰一下就會同時偷開局；所以 `NameInput` form 必須 stop keydown propagation，登入只做 login，開始仍由
遊戲 menu 或遊戲內明確操作觸發。

原本 game board 固定 500px，手機 390px 即使 menu 蓋住仍會令 document 橫向 overflow。`.gameWrapper`、header
同 board 而家以 viewport-bound width/`aspect-ratio` 排版，desktop 保留 500px 上限。`tests/snake-flow.mjs`
用真實 mobile browser 守住 Enter isolation、開局 tick、pause/resume、遊戲中無 overflow、返回 Hub 同 zero errors。
