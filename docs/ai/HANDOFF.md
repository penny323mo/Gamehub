# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `7cd3197`
Status: Royale deployment feedback implemented and browser verified

## Current objective

Make touch card deployment readable before and after release without changing
placement legality, leaking hidden state, or adding simulation cost.

## Completed

- Selecting an affordable card now immediately shows its name, instruction, and
  the pulsing blue legal deployment zones. Spell selection explains that the
  whole battlefield is valid.
- Dragging updates a compact status pill: green means release to deploy, red gives
  the exact public failure reason, including low elixir, own-side restriction,
  locked tower pocket, or collision with a tower/building.
- A successful local release confirms the card name, action, and elixir cost for
  850ms; a PvP guest instead says it is waiting for host confirmation. Failures
  remain visible for the same interval instead of relying on error audio.
- Added `placementInfo` to `Game` and `GuestGame`. Existing `validPlacement` and
  `playCard` use its position, so preview and execution cannot drift apart.
- Guest placement checks derive building/tower collision radii from visible
  snapshot entities while preserving the host's final authority.
- Placement DOM writes are keyed, avoiding repeated live-region and layout writes
  while a pointer remains in the same state.
- Portrait and landscape status-pill positions keep a 10px gap above the hand.

## Changed files

- `games/royale/index.html`
- `games/royale/style.css`
- `games/royale/src/arena.js`
- `games/royale/src/game.js`
- `games/royale/src/pvp.js`
- `games/royale/src/ui.js`
- `games/royale/src/main.js`
- `docs/ai/DECISIONS.md` (ADR-019)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for all changed Royale JS: PASS.
- HTML duplicate-id and UI DOM-reference contract: PASS (133 ids / 86 refs).
- Selecting an archer showed `藍色區域可部署`; the own-zone mesh was visible and
  its opacity changed from 0.144 to 0.152 over 220ms.
- Enemy-side knight preview showed `只可以放己方半場或已攻陷區域`; release kept
  entity count at 6.
- Own-side archer preview showed `放手部署`; release showed `已部署`, reduced
  elixir from 5 to 2, and increased entities from 6 to 8.
- Placement fixtures returned `blocked-building`, `building-own-side`, and
  `locked-pocket`; own-side unit and whole-map spell fixtures returned positions.
- Default flipped guest accepted z=-6 and local replay accepted z=+6. Both rejected
  a watchtower over their own king tower as `blocked-building`.
- Guest mirror create/dispose stayed flat at 157 geometries; a clean match/menu
  cycle returned from 157 to the 115 menu baseline.
- At 390x844, feedback bottom was 692 and hand top was 702. At 844x390, feedback
  bottom was 246 and hand top was 256. Both had zero horizontal overflow.
- Console had no functional errors; only the existing root `/favicon.ico` 404.
- `git diff --check`: PASS.

## Known issues and cautions

- PvP still needs a real two-device Supabase test; local guest snapshot mapping and
  visible collision rules passed, but host rejection timing is not network-tested.
- Placement feedback intentionally does not predict future movement, AI intent,
  target choice, or whether a unit is tactically wise.
- Existing device-specific black-flash verification remains unresolved.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-019
   before changing placement preview or `validPlacement`.
2. Penny can judge on a real phone whether the 850ms result confirmation feels
   long enough without covering combat.
3. Next gameplay/visual round should improve unit readability in dense fights or
   add replay pause/speed only if real play indicates the need.

## Do not redo

- Do not duplicate placement bounds or pocket logic in UI code.
- Do not use hidden hand, AI intent, or future state in placement feedback.
- Do not let a PvP guest bypass host-side placement validation.
- Do not persist detailed match telemetry without explicit authorization.
- Do not amend, rebase, or force-push published `main` history.
