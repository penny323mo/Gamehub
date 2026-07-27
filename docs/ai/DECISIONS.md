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
