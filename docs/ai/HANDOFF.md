# Current cross-agent handoff

Updated: 2026-07-31 (Asia/Macau)
Prepared by: Claude Code (cloud)
Integration branch: `main`
Work branch: `claude/3d-tower-defense-game-rld6ts`
Status: 深淵之橋 production pass — leaks fixed, settings, portraits, scoreboard, feel;
        sim 183/183, browser 52/52

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
- **Playability pass after Penny's first playtest** (ADR-090/091): the event buffer was cleared
  by the writer at the top of `step()`, which destroyed every cast event before any consumer
  saw it — that alone made all abilities invisible. Controls moved from click-to-move to direct
  WASD/joystick with an auto-targeting attack button. Model facing had a spurious 180° flip.
  Ability buttons now carry names and ranks, casting names the ability, damage numbers float,
  and each ability form draws its own effect.
- **Production pass** (ADR-092/093): fixed a GPU texture leak of one bone texture per spawned
  unit; capped the damage-number texture cache; shared bar/ring geometry. Gated the ultimate at
  levels 5/9/12 (it was available at level 1, contradicting its own comment) and re-tuned
  structures around it with a clean A/B. Added a settings panel (sound, music, three quality
  tiers) persisted in localStorage, automatic quality downgrade on sustained low frame times,
  WebGL context-loss handling, and iOS-safe resize handling. Champion portraits are rendered
  once offscreen at boot and reused in the select cards, the HUD and the post-match scoreboard.
  Feel: units flash on hit, the camera shakes on heavy hits and follows a team-mate while you
  are dead, and skill projectiles take the caster's colour.

## Verification

- `node games/moba/tests/sim.mjs` → 183/183. (It read 152 before: the summary line sat above
  T15–T19, so thirty-odd assertions ran but were never counted and could not fail the run.
  The summary now lives at the end of the file.)
- `node games/moba/tests/browser.mjs` → 52/52 (landscape and portrait: load, select, start,
  HUD present, no HUD overlap, centre unobstructed, keyboard movement actually moves the
  champion, an ability press names itself on screen, every ability button carries a name,
  shop, settings panel toggles and persists, quality switch reaches the renderer, portraits
  are real rendered images, post-match scoreboard lists all six, full match, zero console
  errors).

## Changed files

- New: `games/moba/` — `index.html`, `style.css`, `CREDITS.md`, `assets/` (models + licences),
  `vendor/`, `src/{constants,champions,items,sim,ai,looks,rig,assets,view,hud,input,sfx,main}.js`,
  `tests/{sim,browser}.mjs`.
- Also new: `src/fx.js`, `src/settings.js`, `src/portraits.js`.
- Edited: `launcher.js` (hub card), `.gitignore` (a symlinked `node_modules` slipped past the
  trailing-slash pattern), `docs/ai/DECISIONS.md` (ADR-087 through 093).

## Known issues and cautions

- Effects differ by ability *form*; projectiles and cast rings now take the caster's colour,
  but two casters of the same form still share a silhouette.
- Frame rate is unmeasured on real hardware (see the next action).
- Bot-vs-bot mirror matches end at a nexus 7 times in 12; the rest are decided on remaining
  structure HP at the 25-minute limit.
- `ironhulk` measured 30% over a 20-match rotation while the rest sit at 40–70%. The sample is
  small — measure more before changing numbers.
- The browser test drives no bot for the player's champion, so it always reaches the 25-minute
  verdict. That is the test standing still, not the game stalling.
- `sim.js` must never import three.js. That separation is what makes rule bugs findable in node.
- Champion display data (models, weapons, clip names) lives in `src/looks.js`; `champions.js`
  stays pure data so node can import it.

## Exact next action

Playtest on a real phone — that is the one thing this environment cannot measure. Frame rate
here is bounded by software rasterisation, so the quality tiers and the auto-downgrade are
untested against real hardware. Check joystick reach, drag-to-aim, and whether the automatic
downgrade ever fires when it should not.

## Do not redo

- Super minions when the enemy loses all towers: measured worse (nexus finishes 10/12 → 7/12,
  median 20 → 22 min). ADR-088.
- Click-to-move as the primary control, and clearing `sim.events` inside `step()`. ADR-090/091.
- Reusing the other games' GLB assets: Penny asked explicitly for new art, and the KayKit set
  is already loaded, licensed and compressed. ADR-087.
- Re-tuning tower HP to stop stalls: the stall was the bot's unreachable SIEGE state and the
  cancelled scaling curves, not tower durability. ADR-088/089.
- Tightening the XP curve, or weakening the nexus, to speed matches up: both measured worse.
  ADR-092.
