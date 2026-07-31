# Current cross-agent handoff

Updated: 2026-07-31 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: new game 深淵之橋 (games/moba) built end to end; sim 152/152, browser 28/28

## Current objective

Racing Car is stopped. Build a polished 3v3 single-lane MOBA with genuinely licensed 3D art
and original audio, playable on desktop and phone.

## Completed

- **Art, all CC0 (KayKit), none reused from other games in this repo.** Five Adventurers +
  four Skeletons (rigged, authored animations) and the Medieval Hexagon pack (towers, castles,
  barracks, walls, rubble, hex terrain, scenery). Nine source files were 35 MB; the whole
  game's art is now 1.97 MB. See ADR-087 and `games/moba/CREDITS.md`.
- **Audio is synthesised in-browser** (`src/sfx.js`) — no external recordings at all. Web Audio
  voices for melee/arrow/cast/blast/heal/tower-fall/level-up/kill plus a bar-scheduled
  i–VI–III–VII loop with bass, pad, arpeggio and drums.
- **Simulation** (`src/sim.js`, no three.js — node runs whole matches): waves, last-hit gold,
  XP sharing, tower aggro and dive punishment, outer-to-inner tower order, bounty/shutdown,
  items with lifesteal, a fountain-only shop, structure-armour decay, and a time-limit verdict
  by remaining structure HP so no match ends without a result.
- **The three findings that made the game work** are ADR-088 (minion scaling exactly cancelled
  champion scaling; gold had nothing to buy) and ADR-089 (the bot's SIEGE state was ordered
  behind a branch that always fired first; `dawnkeeper`'s passive was card text only).
- **Balance, measured.** Mirror lineups over eight seeds: both sides win, every match resolves.
  Champion win rates across a 20-match rotation now span 30–70% (was 5–95%).
- **View/HUD/input**: hex causeway over water, team-tinted units with ground rings and a gold
  ring for the player, gradient sky, bloom; desktop click-to-move + QWER + B, phone joystick
  plus drag-to-aim ability buttons; champion select, shop, scoreboard, kill feed.
- Hub entry added to `launcher.js`.

## Verification

- `node games/moba/tests/sim.mjs` → 152/152.
- `node games/moba/tests/browser.mjs` → 28/28 (landscape and portrait: load, select, start,
  HUD present, no HUD overlap, centre of screen unobstructed, shop, full match, zero console
  errors).

## Changed files

- New: `games/moba/` — `index.html`, `style.css`, `CREDITS.md`, `assets/` (models + licences),
  `vendor/`, `src/{constants,champions,items,sim,ai,looks,rig,assets,view,hud,input,sfx,main}.js`,
  `tests/{sim,browser}.mjs`.
- Edited: `launcher.js` (hub card), `docs/ai/DECISIONS.md` (ADR-087/088/089).

## Known issues and cautions

- Every ability cast draws the same expanding ring; there is no per-champion VFX yet.
- `ironhulk` measured 30% over a 20-match rotation while the rest sit at 40–70%. The sample is
  small — measure more before changing numbers.
- The browser test drives no bot for the player's champion, so it always reaches the 25-minute
  verdict. That is the test standing still, not the game stalling.
- `sim.js` must never import three.js. That separation is what makes rule bugs findable in node.
- Champion display data (models, weapons, clip names) lives in `src/looks.js`; `champions.js`
  stays pure data so node can import it.

## Exact next action

Playtest on a phone for feel — drag-to-aim on the ability buttons, camera framing while dead,
and whether a tower dive reads clearly — then add per-champion cast VFX in `view.js`.

## Do not redo

- Super minions when the enemy loses all towers: measured worse (nexus finishes 10/12 → 7/12,
  median 20 → 22 min). ADR-088.
- Reusing the other games' GLB assets: Penny asked explicitly for new art, and the KayKit set
  is already loaded, licensed and compressed. ADR-087.
- Re-tuning tower HP to stop stalls: the stall was the bot's unreachable SIEGE state and the
  cancelled scaling curves, not tower durability. ADR-088/089.
