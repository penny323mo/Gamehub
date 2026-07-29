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
- Status: accepted
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
- Status: accepted
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
