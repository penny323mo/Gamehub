# 自己託管嘅字體

全部都係 Google Fonts 嘅 latin 子集，全部 SIL Open Font License 1.1，
授權全文喺同一個資料夾入面逐個字體一份。

| 檔 | 字體 | 出處 |
| --- | --- | --- |
| `outfit-latin.woff2` | Outfit 300–800 | `fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtq.woff2` |
| `orbitron-latin.woff2` | Orbitron 400–900 | `fonts.gstatic.com/s/orbitron/v35/yMJRMIlzdpvBhQQL_Qq7dy0.woff2` |
| `rajdhani-400-latin.woff2` | Rajdhani 400 | `fonts.gstatic.com/s/rajdhani/v17/LDIxapCSOBg7S-QT7p4HM-Y.woff2` |
| `rajdhani-600-latin.woff2` | Rajdhani 600 | `fonts.gstatic.com/s/rajdhani/v17/LDI2apCSOBg7S-QT7pbYF_Oreec.woff2` |
| `rajdhani-700-latin.woff2` | Rajdhani 700 | `fonts.gstatic.com/s/rajdhani/v17/LDI2apCSOBg7S-QT7pa8FvOreec.woff2` |

## 點解要自己託管

之前每一頁都用 `@import url('https://fonts.googleapis.com/...')`。噉樣做每次
開頁都要等兩個跨網域來回：先攞 CSS，再由 CSS 入面攞 woff2，而兩個都係擋住
渲染嘅。網絡差嘅手機上面，呢兩個來回就係「打開個網頁乜都未見到」嗰段時間。
喺完全冇網嘅環境（例如我哋自己嘅測試沙盒）更加係直接攞唔到，整頁字體
跌返做系統字。

Outfit 同 Orbitron 兩個，Google 個 CSS 對所有字重派嘅都係同一條 URL，
所以一個檔已經覆蓋晒；Rajdhani 就真係逐個字重一個檔。

## 用法

唔好再喺任何 CSS 度 `@import` 去 Google。直接寫 `@font-face`，`src` 指返
呢個檔嘅相對路徑（各頁深度唔同，所以逐頁寫，唔共用一個 CSS——共用就等於
換返一個來回）。

## 仲未搬嘅

`games/tower`（Inter、Oxanium）。佢個 @import 俾 build 打包咗入
`dist/assets/index-*.js` 入面，要搬就要連個 build 一齊跑，所以另計。
