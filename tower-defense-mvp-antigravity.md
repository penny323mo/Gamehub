# ID BUILD SPEC — Solo Tower Defense MVP (Three.js Diorama, A2 Style)

> **Purpose**: This document is written for an **ID tool (Antigravity)** to generate a working codebase.
> 
> **Build target**: a **single‑player tower defense** MVP with **3D diorama (2.5D)** visuals using **Three.js**, with **semi‑realistic cartoon (A2)** styling.

---

## 0) Non‑negotiables (must follow)

- **Single player only** (no leaderboard, no multiplayer, no accounts).
- **Fixed camera** (no rotation). Optional: **zoom** and small **pan**.
- **Grid/tile placement** with **raycast to ground plane only**.
- **Logic/render separation**: gameplay logic must not import/use THREE.
- **Performance**: must run smoothly on mid mobile by using instancing/pooling.
- **Config‑driven numbers**: towers, enemies, waves in JSON so we can tune without code changes.

---

## 1) MVP Scope (what to build)

### Gameplay
- 1 map (fixed)
- 10 waves
- Player starts with **200 gold** and **20 lives**.
- Each enemy reaching the goal reduces lives by **1** (enemy type does not matter).
- Lives do **not** regenerate.
- **Win**: survive through wave 10 with lives > 0.
- **Lose**: lives reach 0.
- Player can build/upgrade/sell **during waves**. No pause (but allow pause in UI if you want; optional).
- **2x speed** toggle: scales time uniformly (cooldowns, spawns, movement, etc.)

### Towers (3 types, 3 levels)
- **Arrow Tower**: single target DPS (baseline)
- **Cannon Tower**: slow AOE splash
- **Ice Tower**: low damage + slow debuff

### Enemies (3 types)
- **Grunt**: fast, low HP
- **Tank**: slow, high HP
- **Runner**: very fast, medium HP

### UI
- HUD: gold, lives, wave number, speed (1x/2x)
- Build menu: choose tower type
- Placement preview: ghost (green/red)
- Tower inspect panel: upgrade / sell
- End screen: victory/defeat + score + rank (S/A/B/C)

---

## 2) Visual & UX Direction (A2 semi‑realistic cartoon)

### Camera
- Use **OrthographicCamera**.
- Fixed isometric‑like angle (tilt ~35–45°, yaw ~30–45°).
- No rotation control.

### Lighting
- 1 DirectionalLight with soft shadows.
- 1 HemisphereLight for fill.
- Shadows: allow tower/enemy to cast; ground receives.

### Materials
- Prefer `MeshStandardMaterial` with low metalness, medium roughness.
- Palette: clean, slightly saturated colors.
- Effects: simple hit sparks, cannon explosion ring, ice slow puff.
- Optional postFX: mild selective bloom for effects only (off on low quality).

---

## 3) Tech Stack (opinionated defaults)

- **Vite + TypeScript**
- **Three.js** (vanilla) OR **react-three-fiber** (choose one). Default: vanilla Three.js for fewer moving parts.
- UI: plain HTML/CSS overlay (no 3D UI)
- Optional: `stats.js` for perf overlay (dev only)

---

## 4) Repository Layout (create this)

```
/ (project root)
  /src
    /core          # pure logic (no THREE)
      gameState.ts
      config.ts
      systems/
        waveSystem.ts
        towerSystem.ts
        combatSystem.ts
        enemySystem.ts
        economySystem.ts
      path.ts
      types.ts
      util/
        rng.ts
    /render        # three.js only
      sceneManager.ts
      camera.ts
      lighting.ts
      meshPool.ts
      instancing.ts
      fx.ts
      picking.ts
    /ui
      hud.ts
      buildMenu.ts
      towerPanel.ts
      endScreen.ts
      style.css
    main.ts
  /public
    /assets
      placeholder/...
  /configs
    map.json
    towers.json
    enemies.json
    waves.json
    scoring.json
```

---

## 5) Core Architecture Requirements

### 5.1 Logic/Render Separation
- **core/** must not import `three`.
- Render reads state via a snapshot and updates only changed entities.

### 5.2 Fixed‑step logic + interpolated render
- Logic tick: **20Hz** (50ms). Use accumulator in RAF loop.
- Render at RAF rate; interpolate enemy positions.

### 5.3 Object pooling
- Pool enemies and projectiles (avoid frequent allocations).

### 5.4 Instancing
- Enemies: InstancedMesh per enemy type.
- Projectiles/effects: instanced or pooled sprites.
- Towers: individual meshes (count <= 50).

### 5.5 Placement raycast (fast)
- Raycast against a **ground plane** (not full scene traversal).
- Convert hit point to grid cell.

---

## 6) Data Schemas (configs)

### 6.1 map.json
- Grid size, cellSize, world origin, cell types, path nodes.

Example:
```json
{
  "cols": 20,
  "rows": 12,
  "cellSize": 1,
  "origin": {"x": -10, "z": -6},
  "cells": "...RLE_OR_ARRAY...",
  "path": [[0,5],[1,5],[2,5],[3,5],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],[12,6],[13,6],[14,6],[15,6],[16,6],[17,6],[18,6],[19,6]],
  "spawnCell": [0,5],
  "goalCell": [19,6]
}
```

### 6.2 towers.json (include Arrow from spec)
```json
{
  "arrow": {
    "name": "Arrow Tower",
    "levels": [
      {"buildCost": 100, "upgradeCost": 0,   "damage": 15, "cooldownSec": 1.0, "range": 3.0, "slow": null, "aoeRadius": 0},
      {"buildCost": 0,   "upgradeCost": 80,  "damage": 25, "cooldownSec": 0.9, "range": 3.0, "slow": null, "aoeRadius": 0},
      {"buildCost": 0,   "upgradeCost": 120, "damage": 40, "cooldownSec": 0.8, "range": 3.5, "slow": null, "aoeRadius": 0}
    ]
  },
  "cannon": {
    "name": "Cannon Tower",
    "levels": [
      {"buildCost": 140, "upgradeCost": 0,   "damage": 40, "cooldownSec": 2.2, "range": 3.0, "slow": null, "aoeRadius": 1.2},
      {"buildCost": 0,   "upgradeCost": 110, "damage": 65, "cooldownSec": 2.0, "range": 3.2, "slow": null, "aoeRadius": 1.3},
      {"buildCost": 0,   "upgradeCost": 160, "damage": 95, "cooldownSec": 1.8, "range": 3.5, "slow": null, "aoeRadius": 1.4}
    ]
  },
  "ice": {
    "name": "Ice Tower",
    "levels": [
      {"buildCost": 120, "upgradeCost": 0,   "damage": 8,  "cooldownSec": 0.8, "range": 3.0, "slow": {"pct": 0.30, "durationSec": 2.0}, "aoeRadius": 0},
      {"buildCost": 0,   "upgradeCost": 90,  "damage": 12, "cooldownSec": 0.75,"range": 3.2, "slow": {"pct": 0.35, "durationSec": 2.2}, "aoeRadius": 0},
      {"buildCost": 0,   "upgradeCost": 140, "damage": 18, "cooldownSec": 0.70,"range": 3.5, "slow": {"pct": 0.40, "durationSec": 2.4}, "aoeRadius": 0}
    ]
  }
}
```

> Notes:
> - Cannon/ice numbers are initial defaults to make the game playable. Keep config‑driven.
> - Sell value: 70% of total invested cost (build + upgrades).

### 6.3 enemies.json
```json
{
  "grunt": {"name":"Grunt", "hp": 60,  "speed": 1.6, "bounty": 8},
  "tank":  {"name":"Tank",  "hp": 220, "speed": 0.8, "bounty": 14},
  "runner":{"name":"Runner","hp": 90,  "speed": 2.2, "bounty": 10}
}
```

### 6.4 waves.json (10 waves)
- Define each wave as spawn groups (type, count, interval).
- Provide a short prep time between waves (e.g., 6 seconds).

```json
{
  "prepSec": 6,
  "waves": [
    {"groups":[{"type":"grunt","count":10,"intervalSec":0.7}]},
    {"groups":[{"type":"grunt","count":12,"intervalSec":0.65}]},
    {"groups":[{"type":"grunt","count":8,"intervalSec":0.7},{"type":"runner","count":5,"intervalSec":0.9}]},
    {"groups":[{"type":"tank","count":4,"intervalSec":1.4},{"type":"grunt","count":10,"intervalSec":0.6}]},
    {"groups":[{"type":"runner","count":12,"intervalSec":0.5}]},
    {"groups":[{"type":"tank","count":5,"intervalSec":1.3},{"type":"runner","count":8,"intervalSec":0.7}]},
    {"groups":[{"type":"tank","count":6,"intervalSec":1.25},{"type":"grunt","count":12,"intervalSec":0.55}]},
    {"groups":[{"type":"runner","count":18,"intervalSec":0.45}]},
    {"groups":[{"type":"tank","count":7,"intervalSec":1.2},{"type":"runner","count":10,"intervalSec":0.6}]},
    {"groups":[{"type":"tank","count":10,"intervalSec":1.1},{"type":"runner","count":12,"intervalSec":0.55}]}
  ]
}
```

### 6.5 scoring.json (from spec)
```json
{
  "waveScore": 100,
  "lifeBonus": 50,
  "perfectWaveBonus": 200,
  "ranks": [
    {"name":"S","min":7500},
    {"name":"A","min":5500},
    {"name":"B","min":3500},
    {"name":"C","min":0}
  ]
}
```

---

## 7) UX Details (must implement)

- Placement preview:
  - green ghost if valid tile
  - red ghost if invalid (blocked/path/occupied/no gold)
- Tower panel:
  - shows level, damage, cooldown, range, special (aoe/slow)
  - upgrade button disabled if not enough gold or already max
  - sell button shows refund amount
- Wave transitions:
  - countdown during prepSec
  - wave number banner
- Speed toggle:
  - 1x/2x button; affects logic dt multiplier

---

## 8) Acceptance Checklist (Definition of Done)

### Functional
- Can play from start to end screen (win/lose).
- 3 towers implemented with all 3 levels.
- 3 enemy types implemented.
- 10 waves spawn correctly; wave ends when all spawned enemies are dead or escaped.
- Gold economy works; sell returns 70% of invested.
- Scoring and S/A/B/C rank computed.

### Performance
- Enemy rendering uses instancing.
- No per‑frame allocations in hot loops (use pools).
- Quality tiers: high/medium/low (low disables shadows & postFX).

### Usability
- New player can place first tower within 60 seconds.
- Clear indication for buildable vs non‑buildable tiles.

---

## 9) Implementation Plan (task order)

1) Boot project (Vite TS), load configs.
2) Build logic core: map/grid, path traversal, wave spawner.
3) Implement towers + combat (range targeting, cooldowns, damage, slow, aoe).
4) Implement economy, upgrade/sell.
5) Implement Three.js render: map, towers, instanced enemies, effects.
6) Implement picking + placement preview + UI overlay.
7) Add scoring + end screen.
8) Add performance tiers and basic profiling.

---

## 10) Constraints / Don’ts
- Don’t add multiplayer.
- Don’t add procedural maps.
- Don’t add A* pathfinding.
- Don’t build UI inside 3D scene.
- Don’t hardcode numbers in code; use JSON configs.

---

## 11) Output
Deliver a runnable web project with:
- `npm install && npm run dev` works
- `npm run build` produces static assets

