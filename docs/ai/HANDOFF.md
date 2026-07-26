# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `64f6967`
Status: Royale dense-combat clarity implemented and browser verified

## Current objective

Keep units, teams, and health readable during dense phone-scale fights without
adding one mesh/draw call per unit or covering ordinary marching with UI.

## Completed

- Added a subtle blue/red ground ring below every living non-building unit.
- All rings use one persistent `InstancedMesh`, capped at 72 instances, and share
  the existing deployment-ring geometry. Dense fights therefore add one clarity
  layer rather than one scene object and draw call per unit.
- Ring scale follows unit radius, so elephants and siege silhouettes receive a
  larger footprint while swarm troops remain compact.
- A full-health unit now shows its HP bar only when its current target is inside
  attack reach. Damaged units retain the existing persistent bar; marching units
  do not create a wall of full bars.
- Guest snapshots retain raw host teams for simulation and mapping, but models,
  towers, HP bars, and clarity markers now use local viewer colours. A PvP guest's
  own army is blue and the host opponent is red.
- Guest attack snapshots keep a full-health combat bar visible for 0.7 seconds,
  preventing 10Hz snapshot gaps from making it flicker.
- Cleanup immediately sets the shared marker instance count to zero.

## Changed files

- `games/royale/src/main.js`
- `games/royale/src/game.js`
- `games/royale/src/pvp.js`
- `docs/ai/PROJECT_CONTEXT.md` (GPU baseline 116)
- `docs/ai/DECISIONS.md` (ADR-020 and ADR-008 baseline)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for all changed Royale JS: PASS.
- Dense browser fixture created 22 living units (11 per side); marker count was
  exactly 22 and the scene contained one named clarity `InstancedMesh`.
- Marker instance 0 was blue `[0.332, 0.578, 1]`; the first enemy instance was
  red `[1, 0.434, 0.332]`.
- Twelve still-full-health units with a live in-range target had visible bars.
  The 22-unit fight had 22 visible bars after damage began.
- Guest own raw team 1 mapped to visual team 0 and blue HP fill `3ba2ff`; raw host
  team 0 mapped to visual team 1 and red HP fill `ff5544`.
- Guest full-health combat bar was visible at attack, remained after 0.5 seconds,
  and hid after the 0.7-second hold expired.
- Portrait 390x844 and landscape 844x390 dense-fight screenshots passed visual
  inspection with 22 markers and zero horizontal overflow.
- Guest mirror create/dispose stayed flat at 246 geometries inside the dense
  fixture. Dense cleanup returned 246 to the 116 menu baseline.
- A separate three-unit cycle changed marker count 3 to 0 and returned to 116.
- Console had no functional errors; only the existing root `/favicon.ico` 404.
- `git diff --check`: PASS.

## Known issues and cautions

- The clarity layer intentionally caps at 72 units. A pathological debug swarm
  above that count still plays, but later units do not receive rings.
- PvP local colour mapping passed snapshot-mirror tests; live two-device Supabase
  matchmaking and latency remain unavailable in the local sandbox.
- Existing device-specific black-flash verification remains unresolved.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-020
   before changing unit rings, HP visibility, or GuestGame team colour.
2. Penny can judge on a real phone whether ring opacity 0.58 is strong enough in
   a normal fight without looking too gamey.
3. Next gameplay/visual round should improve spell targeting/timing readability
   or add replay pause/speed if real play indicates the need.

## Do not redo

- Do not replace the instanced layer with one mesh/material per unit.
- Do not show full HP bars for every marching unit.
- Do not swap raw snapshot entity teams; only map the visual team at render time.
- Do not persist detailed match telemetry without explicit authorization.
- Do not amend, rebase, or force-push published `main` history.
