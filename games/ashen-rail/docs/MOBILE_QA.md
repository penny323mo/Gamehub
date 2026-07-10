# 手機 QA 清單

## iPhone Safari 橫向

- [ ] 實機：主畫面、開始、射擊、閃避、暫停、重新開始
- [x] CSS：`viewport-fit=cover` 及四邊 `env(safe-area-inset-*)`
- [x] 直向顯示「請將手機轉為橫向遊玩」
- [x] Fullscreen／orientation lock 拒絕後正常繼續
- [x] 首次點擊後先建立／恢復 AudioContext

## Android Chrome 橫向

- [ ] 實機：Fullscreen、雙拇指同時輸入、返回前景
- [x] Pointer Events 同時支援 joystick、fire、dodge
- [x] 844×390 browser QA：右半屏拖動會同步旋轉鏡頭、準星瞄向及角色朝向
- [x] 所有主操作按鈕不少於 48 CSS px

## 通用

- [x] 頁面不可捲動／選字／雙指縮放
- [x] Home Indicator／瀏海安全區 CSS
- [x] 失焦時清除移動及連續射擊輸入
- [x] 頁面切到背景自動暫停
- [x] Performance／Standard／High 配置
- [x] DPR 上限 1.5，持續低 FPS 自動降低 Render Scale
- [ ] 中階實機連續玩完整 3 波並記錄 30 FPS 穩定度及發熱
- [ ] iOS Low Power Mode 實機測試
- [ ] Android Battery Saver 實機測試

> 桌面 browser smoke test 只覆蓋載入、UI、console 同基本互動；上面標示「實機」嘅項目仍需要真實裝置。
