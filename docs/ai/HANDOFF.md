# Current cross-agent handoff

Updated: 2026-08-12 (Asia/Macau)
Prepared by: Codex — Game Hub evolution roadmap checkpoint
Integration branch: `main`
Work branch: `main`
Status: the complete evolution roadmap is documented and ready for GitHub relay;
no roadmap implementation has started in this checkpoint.

## Current objective

Use `docs/GAMEHUB_EVOLUTION_PLAN.md` as the planning authority for Game Hub's
next 12 months. It covers physics, visuals, gameplay, shared deep modules, all
character/unit rig and skeleton remapping, free 3D asset intake, scene upgrades,
and dedicated Royale, Racing Car and Elden Ring II scene redesigns.

The first implementation cycle must establish release/asset/rig truth before
adding content, then deliver three bounded vertical slices: Royale three-zone
battlefield, Racing circuit plus fixed physics, and Elden three-part level plus
combat rig. The plan is proposed direction, not permission to rewrite all games
or change accepted gameplay invariants at once.

## Completed

- Added a 12-month, 16-section evolution plan based on the current
  `main@07f470d` source, test contracts, asset licenses and deployment workflow.
- Defined deep shared modules: `GameCatalog`, `PlayerVault`, `ProgressLedger`,
  `HubLifecycle`, `AssetCatalog`/`RigCatalog`, `ReleaseGate`, quality governor,
  performance probe and graphics lifecycle. A universal renderer or physics
  engine is explicitly rejected.
- Defined physics programmes for Racing, shared Snooker 2D/3D table physics,
  Elden combat motor/hit resolver, Ashen movement/shooting, and deterministic
  strategy simulation.
- Defined per-game art families, mobile visual budgets, lighting/camera/VFX
  rules, real-device gates and free-asset acceptance criteria for Kenney,
  Quaternius, KayKit, Poly Haven and individually verified OpenGameArt items.
- Added a complete rig census/remapping programme for Royale, MOBA, Ashen,
  Elden, Tower and Racing mechanical rigs, including semantic motion states,
  clip/contact timing, sockets, fallbacks and clone-independence gates.
- Added scene plans for Royale's three-zone battlefield, Racing's harbour,
  mountain and night-city circuit families, and Elden's causeway, drowned keep
  and throne sequence, plus follow-up direction for Ashen, Tower, MOBA and
  Snooker.
- Added Hub/product work: responsive non-singleton game grid, hero captures,
  profile/Continue/progress, Snake correctness, onboarding, difficulty,
  accessibility, privacy and manifest-driven deploy coverage.
- Recorded measurable Phase 0–4 exits, KPI scorecard, first 30-day sequence,
  non-goals and Definition of Done.

## Changed files

- `docs/GAMEHUB_EVOLUTION_PLAN.md` — complete evidence-based evolution roadmap.
- `docs/ai/HANDOFF.md` — active handoff now points the next agent to that plan.

`PROJECT_CONTEXT.md` and `DECISIONS.md` are unchanged because this checkpoint
documents a proposal; architecture and accepted invariants have not changed yet.

## Verification

- Roadmap structure check: PASS — 16 numbered sections, 16 balanced code-fence
  markers, zero trailing whitespace.
- `git diff --check`: PASS.
- `./scripts/check-handoff.sh`: PASS; handoff remains below 120 lines.
- Pre-publish sync: local `main` and `origin/main` were 0/0 at `07f470d`; the
  roadmap was the only uncommitted file before this handoff update.
- No gameplay build/browser suite was run because this checkpoint changes
  documentation only and does not alter runtime files.

## Known issues and cautions

- KPI draw-call/triangle targets labelled provisional must be replaced or
  confirmed by Phase 0 real-device baselines; SwiftShader is relative evidence,
  not physical-device FPS proof.
- Free asset sources are candidates, not automatic imports. Every new asset must
  retain source URL, license snapshot, checksum, bounds/axis/rig audit and local
  runtime copy; never rely on a production CDN.
- Do not force every actor onto one universal skeleton. Authored, procedural and
  mechanical rigs keep separate adapters while sharing semantic evidence.
- Preserve accepted invariants, especially Racing's X/Z gameplay versus
  render-only surface, Tower's `mapLayout.ts` authority, and MOBA shop access
  being independent from fountain healing.
- Do not begin all three scene rewrites concurrently in one checkout. Use one
  sequential work package or separate task branches with non-overlapping owners.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, confirm the pushed checkpoint SHA,
   then read this file and `docs/GAMEHUB_EVOLUTION_PLAN.md` sections 12–16.
2. Wait for Penny to select/authorize the first implementation package. The
   recommended first package is Phase 0 `GameCatalog` plus manifest-driven
   ReleaseGate; it must not change game behaviour.
3. Before any scene art pass, create and verify the corresponding greybox,
   gameplay witness, RigCatalog entries, license entries and performance budget.

## Do not redo

- Do not rescan the whole repository to recreate this roadmap; use the plan,
  current source and named module/phase boundaries.
- Do not treat the roadmap as already implemented or mark proposed interfaces as
  architecture facts in `PROJECT_CONTEXT.md` before code and contract tests land.
- Do not import every free asset pack, build a universal Game Hub engine, or use
  animation timing as gameplay damage authority.
- Do not force-push or rewrite shared `main` history.
