# Current cross-agent handoff

Updated: 2026-08-11 (Asia/Macau)
Prepared by: Codex — Racing feel + Ashen animation checkpoint
Integration branch: `main`
Work branch: `main`
Status: 今輪 source、tracked build output 同 handoff 已完成，targeted gates 全綠；下一步係
review diff、commit 同 push，之後再用 local/origin SHA 驗證交接點。唔需要 force-push。

## Current objective

令 Racing Car 更有真實推背／速度／車身重量，同時收口 Ashen Rail 玩家人物「硬直」問題；
保留現有手機控制、爽快輔助、賽道穩定性、draw budget 同 Pages-safe asset pipeline。

## Completed

- Racing Car 鏡頭收近及降低，令車身成為畫面主角；速度會平滑提高 FOV。
- `Car` 暴露 render-only longitudinal/lateral acceleration，鏡頭以受限反向位移及細速度脈衝
  讀出加油／煞車載荷；物理位置、碰撞、漂移規則不變。
- Ashen soldier rig 加入 semantic aliases／完整 descendant node collection；無 animation clip
  仍由 procedural animator 驅動，新增 Hip、turn lean、放大步態、瞄準及 recoil pose。
- Ashen `PlayerController` 將轉身速度傳入 animator；`WeaponSystem` 對掛在 `R_Hand` 嘅手炮
  加入短促 local recoil 位移／俯仰，reset 會復原。
- Ashen dev-only `window.__ashenRail` diagnostic seam 只喺 Vite dev build 暴露，production 會被
  `import.meta.env.DEV` 消除；可讀 active part names、phase、move blend、recoil。
- Ashen animation regression test 加入 rig alias、步態 pose 同 recoil pose 檢查；tracked `dist`
  由正式 build 更新。

## Changed files

- `games/Racing Car/src/car.js`
- `games/Racing Car/src/main.js`
- `games/ashen-rail/src/game/animation/ProceduralPlayerAnimator.ts`
- `games/ashen-rail/src/game/entities/PlayerController.ts`
- `games/ashen-rail/src/game/combat/WeaponSystem.ts`
- `games/ashen-rail/src/game/scenes/TrainBattleScene.ts`
- `games/ashen-rail/src/app/GameApp.ts`
- `games/ashen-rail/src/tests/game.test.ts`
- `games/ashen-rail/dist/index.html` and rebuilt hashed game asset
- `docs/ai/PROJECT_CONTEXT.md`, `docs/ai/DECISIONS.md`

## Verification

- `cd "games/Racing Car/tests" && node race.mjs` — **125/125**；0–80 **2.47s**、track peak
  **144 km/h**、cruise **134 km/h**、pitch peak **1.6°**、floor lowest **−0.089m**，六條賽道
  自動駕駛三圈、零 wall hit/rescue。
- 同目錄 `node setup.mjs` — **126/126**；320×568、667×375、844×390 responsive/touch/gyro、
  speed layer pointer gate、lifecycle、context-loss、零 browser errors。
- Racing 真 Chromium 844×390 smoke：改後車身框明顯收近，live screenshot `/tmp/racer-camera-speed2.png`
  可見約 61 km/h；無 page error。前一輪高速 `/tmp/racer-sport-fast.png` 亦驗到 speed-lines active。
- `cd games/ashen-rail && npm run lint` — PASS；`npm test` — **15/15**；`npm run build` — PASS，
  tracked dist 已重建。
- Ashen 真 Chromium 844×390 smoke：loading/start/TUTORIAL 正常；active animator parts **20/20**；
  開槍約 35ms 手炮 local position `z 0.05 → -0.02875`、rotation `x 0 → -0.05625`，約 220ms
  復原；page/console errors **0**。截圖 `/tmp/ashen-anim-idle2.png`、`/tmp/ashen-anim-run2.png`、
  `/tmp/ashen-anim-fire2.png`（local only）。

## Known issues and cautions

- Racing aggregate `npm test` 曾喺連續啟動第二個 Chromium 偶發卡在 `openRacer()` ready wait；
  今次按 suite 分開跑，唔好將 aggregate hang 當 assertion pass。
- Ashen GLB 本身仍然冇 animation clips；今 checkpoint 有意採用程序化 fallback，唔假裝素材有 clip。
  若日後換 animated asset，仍要保留 aliases、recoil contract 同 browser visual gate。
- `__ashenRail` 只係 dev diagnostic，唔可以變成 production gameplay API。

## Exact next action

1. Review `git diff --stat`／`git diff --check`，確認只有上面列明嘅 Racing、Ashen、docs/build output。
2. Run `./scripts/check-handoff.sh`，commit code + tracked dist + handoff/ADR 一起落 `main`。
3. Push `main`（user 已授權 cloud handoff），再確認 `git rev-parse HEAD` 同
   `git rev-parse origin/main` 完全相同、worktree clean。
4. 下一棒先 `./scripts/agent-context.sh --sync` 再讀本 handoff；未有新要求前，優先做 Racing
   real-device feel review 或 Ashen dodge/death animation，而唔好重新掃全 repo。

## Do not redo

- 唔好放大 Racing body pitch/roll 到破壞 floor-clearance；用 camera/effects 做回饋。
- 唔好令 `#speed-lines` 接 pointer、遮 HUD 或參與 physics。
- 唔好刪除 Ashen runtime GLB、改回無 alias 嘅 rigid pose，或把 dev diagnostic 放入 production。
