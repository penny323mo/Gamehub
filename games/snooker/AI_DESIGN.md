# Snooker AI Design Document (Stage 2)

## 1. 核心概念
將遊戲由「單人練習」升級為「回合制對戰」。
引入簡單 AI 對手，具備基本的進攻能力。

## 2. 狀態管理 (State Management)
新增狀態變數：
- `state.mode`: `'practice'` (default) | `'ai'`
- `state.difficulty`: `'easy'` | `'normal'` | `'hard'`
- `state.turn`: `'player'` | `'ai'`
- `state.isProcessingAI`: `boolean` (防止 AI 思考時玩家操作)

## 3. 回合切換邏輯 (Turn Switching)
修改 `resolveTurn` 函數，在回合結算後判斷下一手：
- **維持回合 (Keep Turn)**:
  - 合法入球 (Pot Valid Ball)
- **交換回合 (Switch Turn)**:
  - 犯規 (Foul)
  - 打失 (Miss / No Pot)

若切換至 AI，鎖定 UI 輸入 (`state.inputState = 'locked'`)，並延遲 1-2 秒執行 AI 邏輯。

## 4. AI 決策邏輯 (The Brain)
函數 `aiDecide()` 步驟：

1.  **識別目標 (Identify Targets)**:
    - 若 `Phase == RED`: 所有紅波。
    - 若 `Phase == COLOUR`: 
      - 若剛入紅波: 所有彩波。
      - 若自由擊球: 指定彩波。

2.  **評估路徑 (Evaluate Shots)**:
    - 遍歷 `(Target Ball, Pocket)` 所有組合。
    - 檢查 **CUE -> TARGET** 之間有無阻擋 (`checkLineOfSight`)。
    - 檢查 **TARGET -> POCKET** 之間有無阻擋。
    - 計算 **難度分 (Score)**: 距離越短、角度越直 = 分數越高。

3.  **執行射擊 (Execute)**:
    - 選擇最高分路徑。
    - **難度干擾 (Error Injection)**:
      - `Easy`: 瞄準角度隨機偏差 ±3~5度，力度不穩定。
      - `Normal`: 偏差 ±0.5~1度。
      - `Hard`: 精準瞄準，力度完美。
    - 設定 `state.aimAngle` 和 `state.pullPower`。
    - 呼叫 `shoot()`。

## 5. UI 改動
- **Top Bar**: 新增 `<select>` 下拉選單選擇模式。
- **Status Panel**: 顯示 "當前回合: Player/AI"。

## 6. 技術風險與對策
- **風險**: AI 打唔到波（被 Block 死）。
  - **對策**: 若無合法路徑，AI 會大力 "Lash" (亂打) 解救，或者打向波堆中心。
- **風險**: AI 思考時玩家誤觸。
  - **對策**: 強制 `pointer-events: none` 或在 `pointerdown` 檢查 `turn`。

