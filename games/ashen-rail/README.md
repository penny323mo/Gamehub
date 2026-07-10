# 灰燼列車：終末航線

《Ashen Rail: Last Passage》係 Game Hub 內嘅 bonus game：一款以手機橫向雙拇指操作為主嘅第三人稱 3D Web 射擊 Vertical Slice。玩家需要企喺裝甲列車車頂，擊落由左右進場嘅無人機，同時保護中央能源核心。

## 系統要求

- Node.js 22 LTS 或更新版本
- 支援 WebGL 2 嘅現代瀏覽器
- iPhone Safari／Android Chrome 建議橫向遊玩

## 安裝及開發

```bash
cd games/ashen-rail
npm install
npm run assets:inspect
npm run dev
```

Vite 會顯示本機網址。遊戲入口係 `/index.html`，獨立素材 Viewer 係 `/viewer.html`。

## 測試及建構

```bash
npm run lint
npm run test
npm run build
```

建構輸出位於 `dist/`。Vite 使用 `base: "./"`，所有模型及 bundle 都係相對路徑，可直接放入 GitHub Pages repository 子路徑。

## 3D 素材

- 原始版本：`public/assets/models/original/`
- 遊戲 runtime 版本：`public/assets/models/runtime/`
- 素材審計：`docs/ASSET_AUDIT.md`

四件正式素材係 Tactical Soldier、Military Locomotive、Revolver 及 Futuristic Combat Drone。原始 GLB 永不由 optimizer 覆蓋。

## Debug Mode

在網址後加 `?debug=1`：

```text
http://localhost:5173/?debug=1
```

調校面板可調玩家／武器／無人機比例、武器位置與旋轉，並可用 `Copy Config` 複製 JSON。效能 HUD 會顯示 FPS、Active Meshes、Draw Calls 近似值、Textures、Particles、Drone Count 同 Render Scale。

## 手機測試

1. 電腦同手機連接同一個網絡。
2. 執行 `npm run dev -- --host 0.0.0.0`。
3. 用手機開啟 Vite 顯示嘅 Network URL。
4. 轉為橫向，按「開始護送」解鎖音效及嘗試 Fullscreen。

## GitHub Pages

根目錄 `.github/workflows/deploy-pages.yml` 會在 push 到 `main` 後安裝依賴、執行素材審計、lint、test、Vite build，再將整個 Game Hub（包括 `games/ashen-rail/dist/`）部署到 Pages。Game Hub 入口卡指向 `games/ashen-rail/dist/index.html`。

## 已知限制

- 正式模型無 animation clips；玩家動作暫時使用程序化呼吸、移動節奏、後座、閃避傾斜及死亡倒下。
- 程序化 Web Audio 係 placeholder，日後可換 `.ogg`／`.mp3`。
- 第一次下載包括四個高解像度 Tripo GLB，真機首次載入時間視乎網絡。
