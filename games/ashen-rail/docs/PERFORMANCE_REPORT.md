# 效能報告

## 預算

- Performance：30 FPS、0.75 render scale、512 shadow map、最多 4 架無人機、Bloom 關閉。
- Standard：30 FPS、0.95 render scale、1024 shadow map、最多 6 架無人機、Bloom 開啟。
- High：60 FPS、1.0 render scale、1536 shadow map、最多 6 架無人機、Bloom 開啟。

## 已採用措施

- 列車固定，世界地面及路軌循環向後移。
- 岩石採用 Thin Instances；同一模型無人機由預載 template clone。
- Hitscan 武器，無大量實體子彈。
- 碰撞由簡化車頂／護欄／邊界 box 負責，不使用列車完整 mesh collider。
- DPR 上限 1.5；300 個 frame 平均值持續低於目標 72% 時逐級降低 render scale。
- 死亡無人機、能量彈、短效 impact 會完成後 dispose；同屏敵人有上限。

## Build 體積

四個 runtime GLB 約 18 MB；Babylon.js／loader bundle gzip 約 1 MB 級。Build 後會移除只供存檔嘅 original GLB，避免 Pages 重複部署兩套相同模型。

## 風險

- 四件 Tripo 模型全部有內嵌貼圖，首次網絡下載係主要成本。
- Babylon loader chunk 偏大；下一輪可做 route-level loader split、Meshopt／Draco 壓縮同 KTX2 texture pipeline。
