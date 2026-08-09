/**
 * 儲存唔到嗰陣，唔好連遊戲都開唔到。
 *
 * 三種真實情況會令 `localStorage` 唔用得：
 *   - Safari 無痕：`getItem` 用得，但 `setItem` 掟 QuotaExceededError；
 *   - 封咗 cookie／第三方 storage：連 `window.localStorage` 呢個 getter
 *     都會掟 SecurityError，即係「摸都摸唔到」；
 *   - 儲存空間滿：`setItem` 掟 QuotaExceededError。
 *
 * 實測（把 `localStorage` 同 `sessionStorage` 都換成會掟嘢嘅版本，
 * 十二個介面逐個開）：**六個報錯，其中兩個完全開唔到**——
 *
 *     Racing Car 3D   見得到嘅控制 51 → 0
 *     Neon Snake                   1 → 0
 *     Gomoku／Snooker／Empire Royale／Xiangqi AI   仲開得，但各掟一個錯
 *
 * 呢個 repo 有三十幾處 `setItem`，散落六個唔同嘅 codebase（TS／ES module／
 * classic script 都有）。逐個位包 try 係改三十幾次、而且下次加新碼又會漏。
 * **要改嘅係枱面，唔係每一次落枱。**
 *
 * 所以呢個檔要喺**任何遊戲碼之前**行一次：摸得到又寫得到就乜都唔郁；
 * 摸唔到或者寫唔到就換一個記憶體版落去。記憶體版留唔到嘢過下一次開頁
 * ——但本來都留唔到，分別係「玩得到」同「開唔到」。
 *
 * 讀嗰邊做 read-through：記憶體冇先問真嗰個。無痕模式下舊存檔仲讀得返,
 * 唔應該因為寫唔到就連讀都放棄。
 */
(function () {
    if (window.__ghSafeStorage) return;   // 兩張 script tag 都引到都唔會裝兩次
    window.__ghSafeStorage = true;

    function 記憶體版(真) {
        var m = Object.create(null);
        return {
            getItem: function (k) {
                k = String(k);
                if (k in m) return m[k];
                // read-through：寫唔到唔代表讀唔到
                try { return 真 ? 真.getItem(k) : null; } catch (e) { return null; }
            },
            setItem: function (k, v) {
                k = String(k); v = String(v);
                m[k] = v;
                try { if (真) 真.setItem(k, v); } catch (e) { /* 寫唔到就算，記憶體嗰份頂住 */ }
            },
            removeItem: function (k) {
                k = String(k);
                delete m[k];
                try { if (真) 真.removeItem(k); } catch (e) { /* 同上 */ }
            },
            clear: function () {
                m = Object.create(null);
                try { if (真) 真.clear(); } catch (e) { /* 同上 */ }
            },
            key: function (i) { var ks = Object.keys(m); return i >= 0 && i < ks.length ? ks[i] : null; },
            get length() { return Object.keys(m).length; },
        };
    }

    // 一定要真係寫一次先算數：摸得到唔等於寫得到——無痕模式下
    // `window.localStorage` 拎得到，但 `setItem` 先至掟嘢。
    function 試(名) {
        try {
            var 真 = window[名];
            var t = '__gh_probe__';
            真.setItem(t, '1');
            真.removeItem(t);
            return { 好: true, 真: 真 };
        } catch (e) {
            var 摸到 = null;
            try { 摸到 = window[名]; } catch (e2) { 摸到 = null; }
            return { 好: false, 真: 摸到 };
        }
    }

    ['localStorage', 'sessionStorage'].forEach(function (名) {
        var r = 試(名);
        if (r.好) return;                       // 冇事就唔好郁佢
        var 頂替 = 記憶體版(r.真);
        try {
            Object.defineProperty(window, 名, { get: function () { return 頂替; }, configurable: true });
        } catch (e) {
            // 換唔到就唔好扮換到——落面嘅遊戲碼一樣會掟，但起碼唔會靜靜雞
            // 以為自己有個安全嘅 storage。
        }
    });
}());
