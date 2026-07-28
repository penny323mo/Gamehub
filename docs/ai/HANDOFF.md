# Current cross-agent handoff

Updated: 2026-07-28 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `8c6577e`
Status: release-browser audit complete; production favicon 404 removed locally

## Current objective

Move Racing Car toward publish-ready status with evidence from the deployed game, while
preserving the phone-only gyro/audio checks for Penny's real device.

## Completed

- Audited the deployed Racing Car build in real Chrome mobile viewports.
- Confirmed Simple mode auto-accelerates, and the brake/drift touch controls produce the
  intended live input states when held.
- Confirmed WebAudio starts cleanly during a race and body roll remains level on a straight.
- Found the only production console error: the browser requested the site's missing root
  `/favicon.ico`.
- Added an inline chequered-flag SVG favicon, removing that external request and keeping
  future console errors meaningful.
- Added a setup regression gate so the game cannot silently return to the root favicon 404.

## Changed files

- `games/Racing Car/index.html`
- `games/Racing Car/tests/setup.mjs`
- `docs/ai/HANDOFF.md`

## Verification

- Deployed build, Chrome 844x390: Simple mode reached 80 km/h in 2.78 s; brake held gave
  `throttle=-1`; drift held gave `throttle=0.72` and `handbrake=true`; release restored
  auto-throttle. WebAudio was running with no broken state.
- Deployed build visual smoke: HUD, car, track, minimap, joystick, brake, drift, and throttle
  controls were readable and correctly placed in landscape.
- Targeted setup suite: 83/83 passed, including the new inline-favicon gate.
- Fresh local Chrome context, 390x844: game menu and all five track choices loaded; favicon
  resolved to a `data:image/svg+xml` URL; console errors and page errors were both zero.
- The deployed build used for the first audit still contained the old favicon; repeat the
  production console check after this checkpoint deploys.

## Known issues and cautions

- Physical-phone evidence is still required before final publish-ready sign-off: confirm
  gyro direction/sensitivity and listen to the synthesized audio balance on Penny's device.
- Turbo reversed stays out until its AI gains a recovery state machine; read ADR-062 before
  touching it.
- `car.js` still applies full brake force for any negative throttle. Retune the driver in the
  same pass if that behavior changes.
- Commits may show Unverified without a signing key; do not rewrite published history.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-062 to ADR-064.
2. Verify the deployed checkpoint in a fresh browser context has zero console errors.
3. Ask Penny to test gyro direction/sensitivity and audio balance on her phone. Tune only
   from that real-device report; desktop emulation cannot validate device orientation.

## Do not redo

- Do not raise body roll past 3.5°, and do not roll the contact shadow (ADR-063).
- Do not merge the gyro-only direction switch into the shared touch direction (ADR-064).
- Do not flip gyro signs or retune sensitivity without physical-device evidence.
- Do not retry the four rejected Turbo-reversed constant tweaks in ADR-062.
- Do not make braking proportional without retuning the AI driver in the same pass.
- Do not add audio files or allocate audio nodes per frame; keep audio off-race silent.
- Do not split ghost/rivals into extra draws or restore night clouds without remeasurement.
- Do not amend, rebase, or force-push published `main` history.
