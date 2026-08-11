# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — Racing Car sport-arcade feel checkpoint
Integration branch: `main`
Work branch: `main`
Status: Racing Car 的有界加速／姿態／鏡頭／速度回饋已完成 targeted verification；本機同
origin 在開始今輪前都係 `5b584a3`；本 checkpoint commit 已準備好，push 後要以 remote SHA
重新核對。共享 worktree
原本已有 Ashen Rail、Elden Ring II 同 Hub 入口嘅未提交變更；今輪冇覆蓋、冇回退，交接前會
同 Racing 一齊保留成明確 checkpoint。

## Current objective

令賽車由「有物理數字但畫面似模型滑過」變成較真實而爽快嘅 sport-arcade：更有推背感、
有受限載荷姿態、鏡頭讀到路面速度、漂移仍然易救，並保持手機控制／draw budget／既有賽道穩定。

## Completed

- Racing Car sport-arcade pass、body-pitch floor compensation、camera framing、speed feedback 同
  regression gates 已完成；targeted physics/UI/browser evidence 已記錄如下。
- ADR-265 同 `PROJECT_CONTEXT.md` 已更新，下一棒只需同步後按 exact next action 接手。

## Changed files

- `games/Racing Car/src/car.js`：`launchForce=12800`、`engineForce=9500`、`maxSpeed=66`、
  `dragCoef=2.5`、`steerRate=7.6`；新增 `bodyPitch`（上限 0.028rad、平滑回正）同
  `bodyPitchLift=3.4`。lift 只係補 rigid 車模旋轉後嘅 floor envelope，物理 root 仍以 y=0
  計算。ABS、手煞鎖後軸、漂移 refund／assist contract 保留。
- `games/Racing Car/src/main.js`：追車鏡頭較低較近、速度提高 FOV，極細 yaw-rate horizon roll；
  HUD 新增 `#speed-lines` 狀態更新，高速先顯示，漂移只改色調。
- `games/Racing Car/index.html`, `style.css`：新增低透明度、`aria-hidden`、
  `pointer-events:none` 速度 streak layer；HUD z-index 保持控件可操作。
- `games/Racing Car/tests/race.mjs`：加 body-pitch 有界／實際生效 gate。
- `games/Racing Car/tests/setup.mjs`：加速度層存在、absolute、唔攔截輸入 gate。
- Durable decision 已寫入 ADR-265；架構／verification invariants 已更新至 `PROJECT_CONTEXT.md`。

## Verification

- `cd "games/Racing Car/tests" && node race.mjs` — **125/125**。
  Key witness: 0–80 **2.47s**, track peak **144 km/h**, cruise **134 km/h**, handbrake
  entry **19°**, pitch peak **1.6°**, floor lowest **−0.089m**, six directions all finish
  three laps with no wall hits/rescue.
- `node setup.mjs` — **126/126**；includes 320×568 / 844×390 layout, camera, minimap,
  touch/gyro/simple mode, resource/lifecycle, overlay pointer gate and zero browser errors.
- Real Chromium 844×390 smoke — menu and live screenshots inspected. Around **153 km/h**
  `#speed-lines` was `active` at computed opacity ~**0.264**; car/camera readable and no
  page/console errors. Evidence files: `/tmp/racer-sport-menu.png`, `/tmp/racer-sport-live.png`,
  `/tmp/racer-sport-fast.png` (local only, not commit artifacts).
- `npm test` run-all was attempted twice; race passed **125/125**, but the next child browser
  intermittently stalled in `openRacer()` before ready (environment/GPU startup, not an assertion).
  Do not call the aggregate runner green from that attempt; run WebGL suites one at a time.

## Preserved prior local snapshot

- Ashen Rail runtime/public GLBs and `scripts/optimize-assets.mjs` are still dirty from the previous
  asset pass. The user’s earlier Ashen animation issue is **not** solved here; next agent should inspect
  the player GLB clip/skeleton and wire procedural animation or a legal animated asset without undoing
  the load optimization.
- Elden Ring II compressed public/dist assets, meshopt loader/start gating in `src/GameClient.tsx`,
  rebuilt hashed dist entry, and Hub test/entry additions for Ashen + Elden remain intentional dirty
  changes. Validate the relevant game builds before staging; do not blindly regenerate or delete assets.

## Exact next action

1. Run `./scripts/agent-context.sh --sync`, then read this file, `PROJECT_CONTEXT.md`, and ADR-265.
2. Confirm `git status`/diff ownership; run Racing `node race.mjs` and `node setup.mjs` separately under
   GPU pressure, then validate Ashen/Elden dirty snapshot with their documented build/tests.
3. Run `./scripts/check-handoff.sh` and `git diff --check`; commit Racing/docs plus the intentionally
   preserved prior snapshot together only after reviewing the full staged diff.
4. Push `main`, verify local SHA equals `origin/main`, then continue Ashen animation or take the next
   player-facing risk. No force-push; do not overwrite another agent’s dirty work.

## Known issues and cautions

- Racing `npm test` aggregate runner has an environment/GPU startup hang after the first child; report
  individual suite results rather than claiming the aggregate green without an exit code.
- Ashen player animation remains an open product task; the optimized assets are not proof of animation clips.

## Do not redo

- Do not remove the Racing floor-lift compensation or relax the body-pitch/floor gates just to make the
  car look more dramatic; use camera/effects or a properly pivoted asset for future feel work.
- Do not make `#speed-lines` receive pointers, cover HUD controls, or become a physics dependency; do not
  revert the Ashen/Elden/Hub dirty snapshot or stage unrelated generated files blindly.
