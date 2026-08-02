# Current cross-agent handoff

Updated: 2026-08-02 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 深淵之橋 — bars actually draw, dashes cannot freeze a champion, attacks read;
        sim 204/204, browser 66/66

## Current objective

Racing Car is stopped. Build a polished 3v3 single-lane MOBA with genuinely licensed 3D art
and original audio, playable on desktop and phone.

## Completed

- **Art, all CC0 (KayKit), none reused from other games here.** Five Adventurers + four Skeletons
  (rigged, authored animations) plus the Medieval Hexagon pack; 35 MB of sources became 1.97 MB.
  ADR-087 and `games/moba/CREDITS.md`.
- **Audio is synthesised in-browser** (`src/sfx.js`) — no external recordings. Web Audio voices
  for every combat event plus a bar-scheduled i–VI–III–VII loop.
- **Simulation** (`src/sim.js`, no three.js — node runs whole matches): waves, last-hit gold,
  XP sharing, tower aggro and dive punishment, tower order, bounty, items with lifesteal, a
  fountain-only shop, recall, armour decay, and a time-limit verdict by remaining structure HP.
- **The findings that made the game work**: ADR-088 (minion scaling exactly cancelled champion
  scaling; gold had nothing to buy) and ADR-089 (SIEGE sat behind a branch that always fired).
- **Balance, measured.** Mirror lineups: both sides win, every match resolves. Champion win rates
  across a 20-match rotation span 30–70% (was 5–95%).
- Hub entry added to `launcher.js`.
- **Playability** (ADR-090/091): `step()` cleared the event buffer it wrote to, destroying every
  cast event before any consumer saw it — that alone made all abilities invisible. Direct
  WASD/joystick control with an auto-targeting attack button; facing had a spurious 180° flip.
- **Production pass** (ADR-092/093): fixed a GPU bone-texture leak per spawned unit, capped the
  damage-number cache, gated the ultimate at 5/9/12, settings persisted in localStorage with
  automatic quality downgrade, offscreen champion portraits, hit flashes and camera shake.
- **Recall and readability** (ADR-094/095): a 6-second recall channel moved nexus finishes 7/12 →
  10/12 and the median match 22 → 19 min — the shop had been unreachable, so gold never
  circulated. Plus lane overview, ground aim preview, zone-tinted terrain, pinch zoom.
- **Combat legibility** (ADR-096/097): bars coloured by health not team; swing arcs and muzzle
  flashes, because the skeletal animation was playing all along and simply occupies too few
  pixels at this camera distance; homing projectiles carried no velocity vector so they were
  never rotated; `dashFrom` was recorded and never read, so dashes had no trail.
- **What the screenshot showed** (ADR-099): every world health bar was solid black — three.js
  draws opaque then transparent and `renderOrder` only sorts within a pass, so the transparent
  backing plate covered the opaque fill, and ADR-096's health colouring had never once been
  visible. A dash also stored its landing point *before* clamping, so dashing off the rail left
  `c.dash` set forever and `#tickChamp` returns early on it: a permanent freeze, which is what
  Penny hit. Attack swings no longer stretch to fill the cooldown, the attack button has a
  cooldown sweep, and single-target abilities finally draw something at the victim.
- **Fights that resolve** (ADR-098). The suspected cause — bots not focusing fire — was measured
  and wrong (already 1.01 distinct targets per team). The real one: `pickState` re-decided every
  0.2 s with FIGHT and RETREAT on the same threshold, so every engagement shattered into
  three-second standoffs — 664 of them across six matches, 90% with no death. Bots now hold a
  3–5.5 s commitment entered at a higher bar than it is broken at, judge fights by local team
  power rather than by whose health bar is taller, converge on one focus target by a shared
  formula, sidestep skillshots only when the lateral distance is reachable, and take a tower
  without minion cover when the defenders are dead. Kills 365 → 627 over 24 seeds.

## Verification

- `node games/moba/tests/sim.mjs` → 204/204. (Keep the summary print at the end of the file: it
  once sat above T15–T19, so thirty-odd assertions ran uncounted and could not fail the run.)
- `node games/moba/tests/browser.mjs` → 66/66 (landscape and portrait: load, select, start,
  HUD present, no HUD overlap, centre unobstructed, keyboard movement actually moves the
  champion, an ability press names itself on screen, every ability button carries a name,
  shop, settings panel toggles and persists, quality switch reaches the renderer, portraits
  are real rendered images, post-match scoreboard lists all six, full match, zero console
  errors, plus: a basic attack produces visual effects, projectiles exist and are oriented along
  travel, bar colour tracks health, bars stay narrower than a champion, and all four bar pieces
  share one render pass with the fill above the backing plate).
- AI quality is measured on seeds no tuning touched: nexus-vs-time finishes, kills, skillshot
  accuracy, match length. Never tune against T13's own twelve seeds. ADR-098.

## Changed files

- New: `games/moba/` — `index.html`, `style.css`, `CREDITS.md`, `assets/` (models + licences),
  `vendor/`, `src/{constants,champions,items,sim,ai,looks,rig,assets,view,hud,input,sfx,main}.js`,
  `tests/{sim,browser}.mjs`.
- Also new: `src/fx.js`, `src/settings.js`, `src/portraits.js`.
- Edited: `launcher.js` (hub card), `.gitignore` (a symlinked `node_modules` slipped past the
  trailing-slash pattern), `docs/ai/DECISIONS.md` (ADR-087 through 098).

## Known issues and cautions

- Effects differ by ability *form*; two casters of the same form still share a silhouette.
- Frame rate is unmeasured on real hardware (see the next action).
- Bot-vs-bot mirror matches end at a nexus 20 times in 24 (was 23/24). ADR-098 keeps the trade
  explicit: fights resolve and decisive matches got 2.3 min faster, but even matches now go the
  distance. If that ratio slips further, look there first.
- `ironhulk` measured 30% over 20 matches while the rest sit at 40–70%; small sample, measure more.
- The browser test drives no bot for the player, so it always reaches the 25-minute verdict.
- `sim.js` must never import three.js. That separation is what makes rule bugs findable in node.
- Champion display data lives in `src/looks.js`; `champions.js` stays pure data for node.

## Exact next action

Playtest on a real phone — that is the one thing this environment cannot measure. Frame rate
here is bounded by software rasterisation, so the quality tiers and the auto-downgrade are
untested against real hardware. Check joystick reach, drag-to-aim, and whether the automatic
downgrade ever fires when it should not.

## Do not redo

- Super minions when the enemy loses all towers: measured worse (10/12 → 7/12). ADR-088.
- Click-to-move as the primary control, and clearing `sim.events` inside `step()`. ADR-090/091.
- Reusing the other games' GLB assets: Penny asked for new art, and the KayKit set is already
  loaded, licensed and compressed. ADR-087.
- Re-tuning tower HP to stop stalls: the stall was the bot's unreachable SIEGE state and the
  cancelled scaling curves, not tower durability. ADR-088/089.
- Tightening the XP curve or weakening the nexus to speed matches up: both worse. ADR-092.
- Dirt hexes or stone posts as a centre landmark: both tried and both read badly. ADR-095.
- Trusting a material-colour assertion as proof a thing is visible: the bar passed that test while
  rendering solid black. Check the compositing invariant. ADR-099.
- Raising base attack speed to fix "autos feel slow": 1.59 s at level 1 → 1.24 s at 12 (marksman
  1.39 → 0.69 with items) is League-typical. It was the stretched swing animation. ADR-099.
- Raising the bots' engage threshold globally to stop fights crowding out sieges: measured worse
  at both +0.25 and +0.50, with skillshot accuracy collapsing. Price the objective. ADR-098.
- Making bots focus fire: they already do (1.01 distinct targets per team). ADR-098.
- Tuning bot behaviour against T13's own twelve seeds: it reads as a gain a fresh seed set does
  not reproduce. Measure on seeds no tuning touched. ADR-098.
