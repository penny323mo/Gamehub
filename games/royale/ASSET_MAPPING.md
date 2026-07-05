# ASSET_MAPPING.md — Meshy.ai 模型對照表

來源：全部 23 個 GLB 均為 **Meshy.ai generated GLB asset**（玩家生成、上載）。
上載時中文檔名被系統轉成底線，以下「原始檔名」按檔名底線數目＋模型目測交叉核對還原。

> 路徑說明：本遊戲為純靜態部署（無 build step），故資料夾為
> `games/royale/assets/models/<類別>/`（相對路徑，適合 GitHub Pages），
> 對應原要求嘅 `public/assets/models/<類別>/`。

## Units 單位

| 原始檔名 | 新檔名 | 路徑 | 對應遊戲單位 | 已載入 | 備註 |
|---|---|---|---|---|---|
| Meshy_AI_戰象.glb | war_elephant.glb | assets/models/units/ | 戰象 | ✅ 已接入 | rigged + 1 條 walk 動畫；灰色象皮上色，隊色披布/戰塔/旗由程式加 |
| Meshy_AI_Character_民兵.glb | militia.glb | assets/models/units/ | 民兵 | ✅ 已接入 | 無動畫、無材質 → fake 動畫（移動浮動/攻擊前撲/受傷閃白）+ 按高度/半徑近似上色 |
| Meshy_AI_盾劍兵.glb | swordsman.glb | assets/models/units/ | 長劍士 | ✅ 已接入 | 同上 |
| Meshy_AI_長槍兵.glb | pikeman.glb | assets/models/units/ | 長槍兵 | ✅ 已接入 | 同上 |
| Meshy_AI_弓兵.glb | archer.glb | assets/models/units/ | 弓箭手 | ✅ 已接入 | 同上 |
| Meshy_AI_火槍.glb | musketeer.glb | assets/models/units/ | 火槍兵 | ✅ 已接入 | 同上 |
| Meshy_AI_騎兵.glb | cavalry.glb | assets/models/units/ | 騎士 | ✅ 已接入 | 取代原本 Quaternius 真馬+rigged 騎手（動畫由真實 gallop 變 fake bob，換嚟一致嘅玩家素材） |

## Buildings 建築

| 原始檔名 | 新檔名 | 路徑 | 對應 | 已載入 | 備註 |
|---|---|---|---|---|---|
| Meshy_AI_主塔.glb | main_base.glb | assets/models/buildings/ | 王塔 | ✅ 已接入 | 石色＋輕微隊色 tint，程式加隊旗 |
| Meshy_AI_副塔.glb | side_tower.glb | assets/models/buildings/ | 公主塔 ×2 | ✅ 已接入 | 同上 |
| Meshy_AI_哨兵塔.glb | watchtower.glb | assets/models/buildings/ | 哨塔（卡牌建築） | ✅ 已接入 | 原檔冇 normals，載入時自動補算 |
| Meshy_AI_破塔.glb | tower_rubble.glb | assets/models/buildings/ | 塔被摧毀後嘅瓦礫 | ✅ 已接入 | 取代原本程序化石堆 |

## Siege 攻城器械

| 原始檔名 | 新檔名 | 路徑 | 對應 | 已載入 | 備註 |
|---|---|---|---|---|---|
| Meshy_AI_攻城槌.glb | siege_ram.glb | assets/models/siege/ | 攻城槌 | ✅ 已接入 | 無動畫 → fake animation（移動 bob＋攻擊 forward pulse） |
| Meshy_AI_投石車.glb | catapult.glb | assets/models/siege/ | 投石車 | ✅ 已接入 | 無動畫 → fake 後座力；投石照用引擎 projectile |

## Environment 場景件（全部 static props）

| 原始檔名 | 新檔名 | 路徑 | 用途 | 已載入 | 備註 |
|---|---|---|---|---|---|
| Meshy_AI_旗.glb | team_banner.glb | assets/models/environment/ | 兩邊橋頭隊色軍旗 ×4 | ✅ 已接入 | |
| Meshy_AI_橋頭石.glb | bridge_stones.glb | assets/models/environment/ | 橋頭河岸散石 ×4 | ✅ 已接入 | |
| Meshy_AI_雜物.glb | props_pack.glb | assets/models/environment/ | 王塔側雜物堆 ×2 | ✅ 已接入 | |
| Meshy_AI_燒焦木材.glb | burnt_debris.glb | assets/models/environment/ | 戰場戰痕 ×3 | ✅ 已接入 | |
| Meshy_AI_橋.glb | bridge.glb | assets/models/environment/ | 過河木橋 | ⏸ optional | 比例似長凳，同現有拱橋形狀差異大（規則 8：唔強行替換） |
| Meshy_AI_樹.glb | tree_pack.glb | assets/models/environment/ | 樹木 | ⏸ optional | 成塊連地台嘅樹林 tile，散放會露出方形地台 |
| Meshy_AI_圍欄.glb | fence_segment.glb | assets/models/environment/ | 圍欄 | ⏸ optional | 現有 InstancedMesh 木柵欄圍全場更慳資源；留作日後裝飾 |

## Projectiles 投射物

| 原始檔名 | 新檔名 | 路徑 | 用途 | 已載入 | 備註 |
|---|---|---|---|---|---|
| Meshy_AI_箭.glb | arrow_projectile.glb | assets/models/projectiles/ | 弓箭手/塔/哨塔箭矢 | ✅ 已接入 | 自動按最長軸轉向 +z |
| Meshy_AI_投石彈.glb | stone_projectile.glb | assets/models/projectiles/ | 投石車石彈 | ✅ 已接入 | |

## Effects 特效

| 原始檔名 | 新檔名 | 路徑 | 用途 | 已載入 | 備註 |
|---|---|---|---|---|---|
| Meshy_AI_出兵點.glb | spawn_marker.glb | assets/models/effects/ | 出兵時地面圓盤標記（隊色，1.1 秒淡出） | ✅ 已接入 | |

## 載入方式

- 全部經 `src/assets.js` 嘅 `loadAssets()` **開場 preload 一次**，出兵時用 `instantiate()`（clone），唔會重複 load。
- 路徑全部相對（`assets/models/...`），適合 GitHub Pages。
- 素模冇 material → 用 `meshyTint()` 程式上色；冇 normals → 載入時 `computeVertexNormals()` 補返。

## 六個人形兵種點樣冧位／上色（`paintSoldier` 啟發式）

呢 6 個 Meshy 素模冇材質、冇 vertex color、冇骨架動畫 clip（雖然有 skin/joints 但冇 animation
data）。用同 `paintCastle`（塔）同一套手法：逐頂點按世界座標高度／離中軸半徑分類上色 ——
頭頂 15% 高度 → 膚色；底部 10% → 靴色；離軀幹中軸較遠（武器/披風/伸出嘅手臂）→ 皮革木色；
其餘（軀幹主體）→ 隊色。無動畫就用 fake animator：移動時輕微浮動、攻擊時前撲、受傷時
emissive 閃白（0.16 秒），死亡沿用全遊戲統一嘅下沉+傾側動畫。

## Optional assets 未接入原因

橋（`environment/bridge.glb`，比例似長凳）、樹（`tree_pack.glb`，連正方形地台）、
圍欄（`fence_segment.glb`，現有 InstancedMesh 柵欄已圍晒全場）暫不接入 — 換咗會令
場景一致性變差，屬於「形狀本身唔啱用」而非「未處理」，留返日後可選。
