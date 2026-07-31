# 深淵之橋 — 資產出處

## 3D 模型

全部由 [KayKit](https://kaylousberg.itch.io/)（Kay Lousberg）製作，授權
**CC0 1.0 Universal（公有領域）**，可自由用於個人及商業用途、毋須署名。
本檔案係自願標示，唔係授權要求。原始授權文本見 `assets/LICENSE-kaykit-*.txt`。

| 來源 pack | GitHub | 本遊戲入面用嚟做 |
| --- | --- | --- |
| Character Pack: Adventurers 1.0 | `KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0` | 五個英雄（騎士／蠻族／法師／盜賊／遊俠）、武器 |
| Character Pack: Skeletons 1.0 | `KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0` | 小兵三種、第六個英雄（骨法師）、共用動畫庫 |
| Medieval Hexagon Pack 1.0 | `KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0` | 塔／城堡／兵營／城牆／廢墟、hex 地形、山樹石雲 |

### 我哋改咗啲乜

原檔係 `.gltf` + 外部 `.bin` + 共用 PNG 圖集，九個角色檔合共 35MB。打包步驟：

1. **抽走動畫做共用庫**——九個角色用同一副 41 條骨、骨名逐個對得上，而骷髏
   嗰 95 個動畫係冒險者嗰 76 個嘅超集。three.js 嘅 `AnimationClip` 靠節點名
   綁定，所以一份 `anims.glb` 播得郁全部九個模型。留低 23 個真係用到嘅 clip。
2. **角色檔只留 mesh + skin**，再過 Draco 壓縮：每個 3.4MB → 約 90KB。
3. **場景資產併埋一個 `arena.glb`**：35 件共用同一張 1024 圖集，dedup 之後
   淨返一個材質、一張貼圖，載入一次、批次繪製。

結果：**35MB → 1.97MB**。

## 音效同音樂

冇用任何外來錄音。全部由 `tools/make-audio.mjs` 程序化合成再離線 render 成
WAV——所以連授權問題都唔存在，聲音本身就係呢個 repo 嘅原創內容。
