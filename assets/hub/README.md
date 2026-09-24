# Hub 封面截圖

`covers/<id>.webp`（480×300，grid 卡用）同 `hero/<id>.webp`（960×600，精選 hero 用）
全部係**本 repo 遊戲自己嘅真實遊玩畫面**，由 `scripts/capture-hub-covers.mjs`
用 headless Chromium（WebGL 經 SwiftShader）影，冇第三方素材，授權跟返各遊戲本身。

- 兩個尺寸係因為 `tests/hub-load.mjs` 守住「原圖 ≤ 最大顯示尺寸 3 倍」。
- 每張 ≤115KB；首屏只 eager 載 hero 同頭四張卡，其餘 `loading="lazy"`。
- 改咗 `launcher.js` 入面 `COVER_VERSION` 先會 bust cache。
- 重影：`node scripts/capture-hub-covers.mjs [id,id]`，影完一定要人手睇。
