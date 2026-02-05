# Snooker Spin Control Design (Stage 3)

## 1. 目標
實現「白波旋轉控制」，包括：
- **推桿 (Top Spin)**: 撞擊後跟進 (Follow).
- **拉桿 (Back Spin/Screw)**: 撞擊後後退.
- **左右西 (Side Spin)**: 影響撞庫反彈角度.

## 2. UI 設計
- **位置**: 畫面右下角 (Controls 區域).
- **元件**: `<div id="spinControl">` (圓形白波模擬).
- **交互**:
  - 點擊圓內任意點設定 `spinOffset {x, y}` (-1.0 至 1.0).
  - 顯示一個「紅點」標示當前擊球點.
  - 提供「重置中心」按鈕.

## 3. 物理模型 (簡化版 2D)
由於完整剛體動力學過於複雜，採用 **衝量修正模型 (Impulse Modification)**:

### A. 前後旋 (Follow / Screw)
在 `resolvePair` (球與球碰撞) 時觸發:
- 當涉及 **白波 (Cue Ball)** 時:
  1. 計算碰撞法線 (Collision Normal).
  2. 讀取 `state.spin.y` (負數=推桿, 正數=拉桿 *注: 視乎坐標系*).
  3. **施加額外力**:
     - 若是拉桿: 施加與白波前進方向 **相反** 的力 (或沿碰撞法線反彈).
     - 若是推桿: 施加與白波前進方向 **相同** 的力.
  4. 力度大小 = `CollisionImpulse * SpinMagnitude * Constant`.

### B. 左右西 (Side Spin)
在 `resolveCushion` (撞庫) 時觸發:
- 當涉及 **白波** 時:
  1. 讀取 `state.spin.x`.
  2. 根據撞擊邊界 (上/下/左/右) 修改 `b.vy` 或 `b.vx`.
  3. 例子: 右旋 (Running Side) 撞擊右庫 -> 反彈角度變大 (更平).

## 4. 數據結構
```javascript
state.spin = { x: 0, y: 0 }; // Range: -1.0 to 1.0
```

## 5. 風險控制
- **過度拉桿**: 限制最大 Spin 影響力，避免白波「瞬移」或速度暴增.
- **AI 適配**: AI 暫時默認打中心點 (Spin=0)，下一階段才教 AI 用 Spin.

