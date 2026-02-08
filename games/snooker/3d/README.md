# Snooker 3D MVP (Static)

這是一個可直接部署到 GitHub Pages 的 3D 英式桌球（Snooker）遊戲原型。純靜態前端檔案，不使用 Vite / npm / build。

## 專案結構

```
index.html
style.css
main.js
assets/
  textures/
  audio/
  ui/
```

## 本地測試

- 可直接雙擊 `index.html` 開啟
- 或使用簡單伺服器（建議 Safari）：`python3 -m http.server`

## GitHub Pages 設定

1. Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: **main**
4. Folder: **/(root)**

## 操作

- `LMB` 拖拽：瞄準 + 力度，放開出桿
- 犯規後：點擊 D 區擺放白球
- `RMB` 拖拽：旋轉視角
- 滾輪：縮放
- `C`：重置鏡頭
- `R`：重置球局
- `D`：切換 Debug（袋口圈 + 右上角資訊面板）
- `F`：全螢幕

## 規則（簡化）

- 開局目標為紅球
- 紅球進袋 +1，之後打彩球
- 彩球進袋在紅球未清完前會回 spot（respot）
- 犯規（白球落袋/先撞錯球）固定 +4 給對手
- 白球犯規後進入 D 區 ball-in-hand

## 驗收用輸出

- Console 會輸出 `[POCKETS]`（袋口座標）
- Console 會輸出 `[STATE]`（aiming/power/cueSpeed/turnState）
- Console 會輸出 `[RULE]`（入袋、犯規、計分、回位）

## 注意

- 所有資源使用相對路徑（例如 `./assets/...`）
- 不需要伺服器即可遊玩（靜態頁面）
