# Current cross-agent handoff

Updated: 2026-07-26 (Asia/Macau)
Prepared by: Codex (local)
Integration branch: `main`
Baseline before this task: `85a7a17`
Status: Royale tactical lane-pressure HUD implemented and browser verified

## Current objective

Improve gameplay readability and visual feedback so players can identify which
lane needs defence during a dense fight without receiving hidden information.

## Completed

- Added a compact two-lane pressure panel below the crown/timer HUD.
- Each lane shows friendly blue versus enemy red visible troop strength.
- A lane pulses and displays `左路告急` / `右路告急`; simultaneous danger displays
  `雙路受壓`.
- Strength uses card cost divided by summon count, scaled by remaining HP. Dead
  units, towers, and player-built buildings do not count.
- Danger requires enemy pressure >= 4 and >135% of friendly pressure, avoiding
  noise from a single weak unit.
- The calculation is gated to 4Hz instead of scanning entities and writing DOM at
  render-frame frequency.
- PvP guest pressure uses screen-space left/right after the 180-degree guest camera
  flip. No hand, elixir, planned placement, or other hidden AI/PvP data is read.
- Portrait and landscape layouts reposition the panel without covering crowns,
  camera controls, battlefield cards, or the hand.

## Changed files

- `games/royale/index.html`
- `games/royale/style.css`
- `games/royale/src/ui.js`
- `games/royale/src/game.js`
- `games/royale/src/pvp.js`
- `docs/ai/DECISIONS.md` (ADR-016)
- `docs/ai/HANDOFF.md`

## Verification

- `node --check` for changed Royale JS: PASS.
- HTML duplicate-id and UI DOM-reference contract check: PASS.
- Browser synthetic fight: 9 enemy elixir invested on screen-left produced 100%
  red, `leftDanger=true`, and `⚠️ 左路告急`.
- Friendly reinforcement: 14 friendly elixir changed the lane to about 53% blue /
  47% red, cleared `leftDanger`, and removed the warning.
- Multi-unit card scoring was corrected and retested after dividing card cost by
  `card.count`.
- Guest mapping check: world x=+4 mapped to guest screen x=-4, and world x=-3 to
  guest screen x=+3.
- Real browser visual checks passed at 390x844 portrait and 844x390 landscape.
  Landscape panel bounds were x=292..552, y=62..100; hand started at x=506,y=256.
- No horizontal overflow. Console had no functional error; only existing root
  `/favicon.ico` 404.
- `git diff --check`: PASS.

## Known issues and cautions

- Pressure is an intentionally approximate tactical cue, not a damage simulator;
  it does not model range, armour, counters, spells, or tower fire.
- Live two-device Supabase PvP is still not available in the local sandbox; guest
  coordinate mapping and GuestGame behavior were verified locally.
- Existing device-specific black-flash verification remains unresolved and is
  unrelated to this HUD.

## Exact next action

1. Receiving agent runs `./scripts/agent-context.sh --sync`, then reads ADR-016 and
   this handoff before changing Royale HUD or PvP view mapping.
2. On a real phone, Penny can confirm whether the warning improves defence timing
   without becoming distracting during a normal match.
3. Next gameplay/visual round can add a short post-match tactical recap using the
   same visible pressure data, without implementing hidden-state analytics.

## Do not redo

- Do not calculate pressure from hands, elixir, AI intent, or future placement.
- Do not count a group card's full cost once per summoned entity.
- Do not update pressure every render frame.
- Do not use raw world x as guest screen left/right.
- Do not amend, rebase, or force-push published `main` history.
