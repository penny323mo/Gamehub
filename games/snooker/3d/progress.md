Original prompt: 請由零開始建立一個可直接部署到 GitHub Pages 的 3D 英式桌球（Snooker）遊戲原型，要求使用最簡單結構，不使用 Vite、不使用 npm、不需要 build。只能用純前端靜態檔案：HTML + CSS + JS，外加 assets 資料夾。畫面風格要接近之前較靚的 3D 效果，包括有桌布質感、光照、陰影或假陰影、球有高光反射，鏡頭有空間感。必須在 Safari 和 Chrome 都正常顯示並可互動。

User requested next steps 1-5: add colored balls + rules, foul/free ball/respot, improved physics, AI opponent.

Updates:
- Added colored balls (yellow/green/brown/blue/pink/black) with spots and respot logic.
- Added simplified rules: target tracking (red/color), fouls, free ball availability, color clearance order.
- Added basic AI turn (player 2) aiming at target ball.
- Added fullscreen toggle (F) and updated HUD/README.
- Added render_game_to_text + advanceTime for automated tests.
- Updated foul scoring to max(4, target value) and free ball only if snookered.
- Added snooker detection via line-of-sight checks.
- Improved AI with pocket path scoring and contact-point aiming.
- Added cue stick mesh and arrow-key aim nudges.
- Adjusted respot to only occur while reds remain.
- Switched Three.js imports to local `assets/three/` to fix Safari `file://` black screen.

TODO:
- Run Playwright test loop and review screenshots/logs.
- Tune AI/pocketing realism and snooker detection edge cases.

2026-02-07 update:
- Added foul decision state machine: `FOUL_DECISION` after any foul; beneficiary chooses take-turn or force-fouler-continue.
- Added keyboard decisions in foul state: `Y/Enter/Space` = take turn, `N` = force fouler continue.
- Default game mode is now `P1 vs AI` (`aiEnabled = true`) and HUD shows mode.
- Updated cue placement flow: while cue-in-hand, LMB drag can start from any point; double-click confirms (D-zone validation).
- Foul points now use `max(4, targetValue())`.
- Added `window.__snookerDebug` API to support deterministic self-check loops (reset, place/confirm cue, shoot, runUntilSettled, foul decision, state reads).
- Added `./assets/ui/favicon.svg` and linked it in HTML to avoid favicon 404 noise.
- Lighting reduced further (`ACES exposure=0.68`, lower ambient/hemi/directional) to avoid over-bright view.

Self-check round 1 (break-off) result:
- Functional: PASS
- Boundary: PASS
- Consistency: PASS
- Console: PASS (runtime issues=0; filtered Playwright GPU ReadPixels warning)
- Report artifact: `/Users/a123/AI/snooker/output/selfcheck-round1-rerun/selfcheck-result.json`
- Follow-up fix: AI could stall at `PLACE_CUE` when cue ball in hand. Added `queueAiCuePlacement()` and a fallback AI shot-queue gate whenever AI is current player and can legally shoot.
- Re-ran full 4-step self-check + AI flow check.
- Final report artifact: `/Users/a123/AI/snooker/output/selfcheck-round1-final/selfcheck-result.json` (allPass=true).
- Reproduced real user issue: cue-ball drag and charge shot were not triggering from mouse path.
- Root cause: input bound to `mousedown` on canvas, while OrbitControls consumes pointer events and suppresses compatibility mouse events in this setup.
- Fix: switched primary input path to Pointer Events (`pointerdown/move/up` + pointer capture), kept mouse fallback for older browsers.
- Added strict input diagnostics (`inputDebug` + `canTakeShotReason`) and wired into `render_game_to_text` for validation.
- Self-check round 2 report: `/Users/a123/AI/snooker/output/selfcheck-round2-pointerfix/selfcheck-result.json` (allPass=true).
- UX/rules update per feedback:
  - Foul decision panel now truly conditional (`hidden` + `.show`) and only appears when player is beneficiary of a foul.
  - Cue stick visibility tightened: hidden while cue ball is in hand / pre-aim states; shown only in aiming states.
  - Aim lock implemented during charge drag (direction frozen from pointer-down to pointer-up; only power changes while dragging).
  - D-zone markers upgraded to visible geometric marks (baulk line + D arc mesh) for clear placement reference.
- Pocket geometry pass:
  - Pocket centers moved outside cloth to avoid inward protrusion on green area.
  - Corner and side pockets now have separate shapes/sizes (`kind: corner|side`), with side pockets elongated and smaller radius.
  - Debug pocket metadata now includes `kind`.
- Self-check round 5: `/Users/a123/AI/snooker/output/selfcheck-round5-final/result.json` (allPass=true).

2026-02-07 power tuning + physics fix:
- Increased shot strength ramp to 2x target: `powerMultiplier` 3.0 -> 6.0 and full-charge drag distance 1.2 -> 0.6.
- Fixed runtime physics bug in `applyFriction` (`friction` undefined) by using `linearDrag + rollingDragK * speed` decel model.
- Verified with headless Playwright + `window.__snookerDebug`:
  - cue placement confirmed
  - shot trigger ok
  - measured cue-ball max speed: 7.3046 (full normalized power)
- Artifacts:
  - `/Users/a123/AI/snooker/output/power-check/`
  - `/Users/a123/AI/snooker/output/power-check-after/`

2026-02-10 rail side-pocket stability fix:
- Replaced side-pocket hole builder from arc-based `halfCircleHole` to sampled-point `sideHalfMoonHole` to avoid Path winding/self-intersection failures that caused rail extrusion to collapse into a flat slab.
- Side-pocket holes now generated with `sideHalfMoonHole(hx, z, r, dirX, 0.55, 48)` while keeping pocket centers/checkPockets unchanged.
- Added hard assertions:
  - `outer.holes.length === 1 + pocketCenters.length`
  - `railGeo.computeBoundingBox()` + finite bbox check
- Stabilized unified rail extrusion by preventing overlapping inner-hole/corner-hole degeneracy.
- Kept side pockets as half-moon holes; corner pocket openings now come from enlarged rounded inner opening (no overlapping corner circle holes in rail shape).
- This restores visible cloth and preserves side-pocket half-moon visuals while keeping pocket centers and checkPockets unchanged.
