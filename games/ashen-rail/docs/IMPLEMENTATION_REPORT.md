# 第一版實作報告

## 已完成

- Vite + TypeScript + Babylon.js 完全靜態遊戲專案
- 獨立 Asset Viewer、GLB audit、runtime copy pipeline
- 半固定越肩鏡頭、手機 joystick、射擊、閃避、暫停、重新開始
- Hitscan 手炮、自動換彈、Aim Assist、命中及爆炸回饋
- 普通／精英／爆破無人機、左右航點、玩家／核心攻擊
- 三波流程、教學、勝利／兩種失敗狀態
- 程序化能源核心、世界滾動、沙漠 parallax、Thin Instance 岩石
- 程序化 Web Audio、畫質配置、自適應 render scale、debug HUD
- GitHub Pages workflow 同 Game Hub bonus game 入口

## 3D 素材整合

- 玩家：Tactical Soldier GLB；有 skeleton、沒有 animation clip，使用程序化後備動作。
- 列車：Military Locomotive GLB；固定於局部世界，車頂 gameplay 使用簡化 box bounds。
- 手炮：Revolver GLB；右手骨骼採 fuzzy matching，失敗時退回右手 node／玩家 root。
- 無人機：Futuristic Combat Drone GLB；共用 template，變體透過 scale、emissive danger aura 同數值區分。

實際骨名、bounds、材質、貼圖及 animation 資訊詳見 `ASSET_AUDIT.md`。Runtime 最終掛骨 socket 會在 browser console/debug panel 顯示。

## 重要技術決定

- Bonus game 位於 `games/ashen-rail/`，不改寫現有 Game Hub 或其他遊戲。
- 列車不使用高速剛體；環境反向滾動建立速度感。
- Game State 由單一 state machine 管理，波次及 pause clock 可獨立測試。
- 正式模型失敗會顯示錯誤，並建立 Primitive 後備避免白屏。

## 驗證狀態

- `npm run assets:inspect`：通過
- `npm run lint`：通過
- `npm run test`：10 tests 通過
- `npm run build`：通過
- Browser smoke：通過（844×390 手機橫向 viewport；Viewer 四模型、載入、開始、HUD、射擊、擊落、暫停、繼續；console 0 errors）
- `dist/` 大小：30 MB；runtime GLB 20 MB；archival original GLB 已從 deploy output 移除

## 已知限制及下一輪三項

1. 將四件 GLB 做 Meshopt／Draco + KTX2 壓縮，降低首次載入。
2. 補正式角色 animation clips 同正式音效，取代程序化 fallback。
3. 用 iPhone Safari／Android Chrome 實機調校武器 socket、相機同效能 preset。
