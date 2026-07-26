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
  match/menu cycles must stay flat at 115 geometries.

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
