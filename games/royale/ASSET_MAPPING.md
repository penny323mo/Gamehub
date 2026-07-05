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
| Meshy_AI_Character_民兵.glb | militia.glb | assets/models/units/ | 民兵 | ⏸ optional | 3.0MB 高面數素模、無動畫、無材質 — 建議 Meshy re-export（見下） |
| Meshy_AI_盾劍兵.glb | swordsman.glb | assets/models/units/ | 長劍士 | ⏸ optional | 3.0MB，同上 |
| Meshy_AI_長槍兵.glb | pikeman.glb | assets/models/units/ | 長槍兵 | ⏸ optional | 3.1MB，同上 |
| Meshy_AI_弓兵.glb | archer.glb | assets/models/units/ | 弓箭手 | ⏸ optional | 2.8MB，有骨架但無動畫 clip |
| Meshy_AI_火槍.glb | musketeer.glb | assets/models/units/ | 火槍兵 | ⏸ optional | 3.5MB，同上 |
| Meshy_AI_騎兵.glb | cavalry.glb | assets/models/units/ | 騎士 | ⏸ optional | 3.8MB，同上 |

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

## Optional assets 未接入原因＋建議

6 個人形兵種（militia/swordsman/pikeman/archer/musketeer/cavalry）合共 **~19MB**、
每個 3MB 級高面數、**無動畫**、無材質。直接換入會：

1. 開場載入由 ~10MB 變 ~29MB（手機好慢）
2. 兵種由「有骨骼行走／攻擊動畫」變「定格滑行」
3. 全灰色，兩隊難分

**建議**：喺 Meshy 對呢 6 個角色 re-export —
① 開埋 texture（有色版）② 用 Meshy 嘅 rig + animation（行路/攻擊）③ 揀低 poly 輸出。
再upload 我即刻替換。橋／樹／圍欄同理，textured 版就可以直接用。
