# 自己託管嘅字體

`outfit-latin.woff2` —— Outfit，Google Fonts 嘅 latin 子集（v15），
由 `https://fonts.gstatic.com/s/outfit/v15/QGYvz_MVcBeNP4NJtEtq.woff2` 取得。
授權係 SIL Open Font License 1.1，全文喺同一個資料夾嘅 `OFL.txt`。

## 點解要自己託管

之前每一頁都用 `@import url('https://fonts.googleapis.com/...')`。噉樣做每次
開頁都要等兩個跨網域來回：先攞 CSS，再由 CSS 入面攞 woff2，而兩個都係擋住
渲染嘅。網絡差嘅手機上面，呢兩個來回就係「打開個網頁乜都未見到」嗰段時間。
喺完全冇網嘅環境（例如我哋自己嘅測試沙盒）更加係直接攞唔到，整頁字體
跌返做系統字。

Google 個 CSS 對 300 到 800 五個字重派嘅係同一條 URL，所以呢度一個 woff2
已經覆蓋晒，唔會少咗嘢。

## 用法

唔好再喺任何 CSS 度 `@import` 去 Google。直接寫 `@font-face`，`src` 指返
呢個檔嘅相對路徑（各頁深度唔同，所以逐頁寫，唔共用一個 CSS——共用就等於
換返一個來回）。

## 仲未搬嘅

`games/tower`（Inter、Oxanium）同 `games/snake-game`（Orbitron、Rajdhani）
仍然向 Google 攞字體。兩隻都有 build step，要搬就要連 build 一齊處理。
