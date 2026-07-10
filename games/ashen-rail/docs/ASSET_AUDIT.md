# 3D 素材審計

> 由 `npm run assets:inspect` 產生。原始檔永不覆蓋；runtime 版本位於 `public/assets/models/runtime/`。

| 資產 | 原始檔案 | 格式 | 大小 | 動畫 | 骨架 | 問題 | 處理方式 |
|---|---|---|---:|---|---|---|---|
| 無人機 | futuristic combat drone 3d model.glb | GLB | 3.85 MB | 無 | 無 | 無動畫 | 保留原檔並複製至 runtime；比例／旋轉由中央配置控制。 |
| 列車 | military locomotive 3d model.glb | GLB | 4.41 MB | 無 | 無 | 無動畫 | 保留原檔並複製至 runtime；比例／旋轉由中央配置控制。 |
| 手炮 | revolver 3d model.glb | GLB | 4.64 MB | 無 | 無 | 無動畫 | 保留原檔並複製至 runtime；比例／旋轉由中央配置控制。 |
| 玩家 | tactical soldier 3d model.glb | GLB | 5.39 MB | 無 | 1 | 無動畫 | 保留原檔並複製至 runtime；比例／旋轉由中央配置控制。 |

## 無人機

- 原始檔名：`futuristic combat drone 3d model.glb`
- 產生器：Tripo
- Scene / Node / Mesh / Primitive：1 / 1 / 1 / 1
- Material / Texture：1 / 1（貼圖內嵌）
- Animation Clips：無
- Skeleton：0；Bones：無
- Bounding Box：min [-0.999845027923584,-0.9998760223388672,-1]；max [0.9999690055847168,0.999845027923584,0.9999690055847168]；size [1.9998140335083008,1.9997210502624512,1.9999690055847168]
- 軸向／前方：glTF Y-up / right-handed；模型視覺前方需在 Asset Viewer 人手覆核；runtime config 以 +Z 為遊戲前方
- 透明材質：無
- 負 Scale：無
- 異常超大尺寸：否（Tripo 模型已正規化約 2 單位）
- 處理方式：保留原檔並複製至 runtime；比例／旋轉由中央配置控制。

## 列車

- 原始檔名：`military locomotive 3d model.glb`
- 產生器：Tripo
- Scene / Node / Mesh / Primitive：1 / 1 / 1 / 1
- Material / Texture：1 / 1（貼圖內嵌）
- Animation Clips：無
- Skeleton：0；Bones：無
- Bounding Box：min [-1,-1,-1]；max [1,1,1]；size [2,2,2]
- 軸向／前方：glTF Y-up / right-handed；模型視覺前方需在 Asset Viewer 人手覆核；runtime config 以 +Z 為遊戲前方
- 透明材質：無
- 負 Scale：無
- 異常超大尺寸：否（Tripo 模型已正規化約 2 單位）
- 處理方式：保留原檔並複製至 runtime；比例／旋轉由中央配置控制。

## 手炮

- 原始檔名：`revolver 3d model.glb`
- 產生器：Tripo
- Scene / Node / Mesh / Primitive：1 / 1 / 1 / 1
- Material / Texture：1 / 1（貼圖內嵌）
- Animation Clips：無
- Skeleton：0；Bones：無
- Bounding Box：min [-0.9998760223388672,-1,-1]；max [0.9999380111694336,1,1]；size [1.9998140335083008,2,2]
- 軸向／前方：glTF Y-up / right-handed；模型視覺前方需在 Asset Viewer 人手覆核；runtime config 以 +Z 為遊戲前方
- 透明材質：無
- 負 Scale：無
- 異常超大尺寸：否（Tripo 模型已正規化約 2 單位）
- 處理方式：保留原檔並複製至 runtime；比例／旋轉由中央配置控制。

## 玩家

- 原始檔名：`tactical soldier 3d model.glb`
- 產生器：Tripo
- Scene / Node / Mesh / Primitive：1 / 43 / 1 / 1
- Material / Texture：1 / 1（貼圖內嵌）
- Animation Clips：無
- Skeleton：1；Bones：Root, Hip, Pelvis, L_Thigh, L_Foot, L_ToeBase, L_CalfTwist01, L_CalfTwist02, L_ThighTwist01, L_ThighTwist02, R_ThighTwist01, R_ThighTwist02, R_Foot, R_ToeBase, R_CalfTwist01, R_CalfTwist02, Waist, Spine01, Spine02, NeckTwist01, NeckTwist02, Head, L_Clavicle, L_ForearmTwist01, L_ForearmTwist02, L_Hand, L_UpperarmTwist01, L_UpperarmTwist02, R_Clavicle, R_UpperarmTwist01, R_UpperarmTwist02, R_ForearmTwist01, R_ForearmTwist02, R_Hand
- Bounding Box：min [-1,-0.9998760223388672,-0.9999690055847168]；max [1,1.00537109375,0.9999690055847168]；size [2,2.005247116088867,1.9999380111694336]
- 軸向／前方：glTF Y-up / right-handed；模型視覺前方需在 Asset Viewer 人手覆核；runtime config 以 +Z 為遊戲前方
- 透明材質：無
- 負 Scale：無
- 異常超大尺寸：否（Tripo 模型已正規化約 2 單位）
- 處理方式：保留原檔並複製至 runtime；比例／旋轉由中央配置控制。

## 結論

四個 GLB 均為有效 Tripo glTF 2.0 binary，而且貼圖內嵌。士兵有一套 skeleton 但沒有 animation clip；其餘三件沒有骨架或動畫。動畫缺失由程序化後備處理，原始骨架及素材不會被修改。
