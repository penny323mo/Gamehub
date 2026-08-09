/**
 * GameHub – Shared Online Utilities
 *
 * Provides a unified, non-blocking toast notification system to replace
 * native browser alert() calls across all multiplayer games.
 *
 * Usage:
 *   showOnlineToast('房間已滿', 'warn');
 *   showOnlineToast('網絡錯誤，請重試', 'error');
 *   showOnlineToast('已成功加入房間', 'success');
 *   showOnlineToast('等待對手加入…', 'info');
 *
 * Types: 'error' | 'warn' | 'info' | 'success'
 * Default type: 'error'
 * Default duration: 3500 ms
 */

(function () {
    if (window.showOnlineToast) return; // already loaded

    const CSS_ID = 'gh-online-toast-styles';
    const CONTAINER_ID = 'gh-toast-container';

    const STYLES = `
        #${CONTAINER_ID} {
            position: fixed;
            bottom: 28px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 99999;
            display: flex;
            flex-direction: column-reverse;
            gap: 8px;
            align-items: center;
            pointer-events: none;
        }
        .gh-toast {
            padding: 10px 22px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            font-family: system-ui, -apple-system, sans-serif;
            color: #fff;
            opacity: 0;
            transform: translateY(12px);
            transition: opacity 0.25s ease, transform 0.25s ease;
            pointer-events: none;
            max-width: 380px;
            text-align: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
            line-height: 1.4;
        }
        .gh-toast.gh-show {
            opacity: 1;
            transform: translateY(0);
        }
        .gh-toast.error   { background: #c0392b; }
        .gh-toast.warn    { background: #d35400; }
        .gh-toast.info    { background: #2471a3; }
        .gh-toast.success { background: #1e8449; }
    `;

    const MAX_TOASTS = 5;

    function ensureContainer() {
        const existing = document.getElementById(CONTAINER_ID);
        if (existing) return existing;

        if (!document.getElementById(CSS_ID)) {
            const s = document.createElement('style');
            s.id = CSS_ID;
            s.textContent = STYLES;
            document.head.appendChild(s);
        }

        const c = document.createElement('div');
        c.id = CONTAINER_ID;
        document.body.appendChild(c);
        return c;
    }

    /**
     * @param {string} msg      - Message to display
     * @param {'error'|'warn'|'info'|'success'} [type='error'] - Toast type
     * @param {number} [duration=3500] - Auto-dismiss delay in ms
     */
    window.showOnlineToast = function (msg, type, duration) {
        type = type ?? 'error';
        duration = duration ?? 3500;

        const container = ensureContainer();
        // Evict the oldest toast if we've hit the cap
        if (container.childElementCount >= MAX_TOASTS) container.firstElementChild.remove();
        const toast = document.createElement('div');
        toast.className = 'gh-toast ' + type;
        toast.textContent = msg;
        container.appendChild(toast);

        // Trigger enter animation
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                toast.classList.add('gh-show');
            });
        });

        // Auto-dismiss
        setTimeout(function () {
            toast.classList.remove('gh-show');
            setTimeout(function () { toast.remove(); }, 300);
        }, duration);
    };

    /* ===================================================================
     * Supabase SDK：用到先攞
     * ===================================================================
     *
     * 之前每隻連線遊戲都喺 HTML 度寫住
     *
     *     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     *
     * 冇 defer 冇 async，即係**塞住 parser**：呢句未行完，跟住嗰啲本地遊戲碼
     * 一行都行唔到。實測（第三方 origin 吊 8 秒）：Gomoku／Big Two／Dou Dizhu／
     * Snooker／Xiangqi 嘅 DOMContentLoaded 由 0.04–0.49 秒變成 8.0–8.4 秒，
     * 吊幾多秒就遲幾多秒，一比一。而 FCP 照樣係 0.08 秒——**畫面畫咗一半就唔郁**,
     * 睇落好似 ready 咗，但撳乜都冇反應。
     *
     * 而個 SDK 淨係「真人對戰」先用得着。單機／人機嗰啲玩家一世都唔會用到佢,
     * 但一樣要等。Empire Royale 早就冇呢個病（`royale/src/net.js` 揀咗玩家真係撳
     * 落去先至攞），呢度做嘅係將同一個做法搬上 shared 層畀其餘幾隻用。
     *
     * `loadSupabaseSdk()` 可以叫幾多次都得——同一個 promise。逾時或者失敗會
     * reject，唔會靜靜雞吊死。
     */
    var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    var SDK_TIMEOUT = 8000;
    var sdkPromise = null;

    window.loadSupabaseSdk = function () {
        if (window.supabase) return Promise.resolve();
        if (sdkPromise) return sdkPromise;
        sdkPromise = new Promise(function (resolve, reject) {
            var t = setTimeout(function () {
                sdkPromise = null;   // 畀下次再試
                reject(new Error('連線服務逾時'));
            }, SDK_TIMEOUT);
            var s = document.createElement('script');
            s.src = SDK_URL;
            s.onload = function () { clearTimeout(t); resolve(); };
            s.onerror = function () { clearTimeout(t); sdkPromise = null; reject(new Error('連線服務載入失敗')); };
            document.head.appendChild(s);
        });
        return sdkPromise;
    };

    /*
     * 由「開頁就攞」改成「用到先攞」，會開咗一個窿：
     * SDK 未到嗰陣撳落去，係**乜都唔會發生**——連錯都唔報。
     * （其實呢個窿本來就有：SDK 攞唔到嗰陣，`joinFixedRoom` 見到冇 client
     * 就靜靜雞 return。以前撞唔到係因為成版嘢都未郁，玩家根本撳唔到。）
     * 「撳咗冇反應」比「等耐咗」更難頂，所以攞緊 SDK 嗰段時間擺個佔位守住：
     * 撳到就話「連線中…」，SDK 到咗幫你叫返真嗰個，到唔到就照實話畀你聽。
     *
     * 注意：唔可以寫成「`window[n]` 已經係 function 就唔踩」。呢幾隻遊戲嘅
     * `online.js` 係 classic script，`async function joinFixedRoom() {}` 一 parse
     * 就已經係 `window.joinFixedRoom`——即係「已經有真嘢」永遠成立，個佔位
     * 一世擺唔落去。而嗰個「真嘢」喺未有 client 之前係**靜靜雞 return**，
     * 撳落去乜都唔會發生。所以呢度照踩，記住原本嗰個，等 SDK 到咗先叫返佢。
     */
    window.holdOnlineEntries = function (names, ready) {
        names.forEach(function (n) {
            var 原本 = window[n];
            var 佔位 = function () {
                var args = Array.prototype.slice.call(arguments);
                window.showOnlineToast('連線服務載入中…', 'info', 2000);
                return ready.then(function () {
                    // init 行完會將真嘢掛返上去，即係 `window[n]` 唔再係佔位。
                    // 仲係佔位嘅話就用返原本嗰個（classic script 嘅全域函數）。
                    var f = (window[n] === 佔位) ? 原本 : window[n];
                    if (typeof f !== 'function') {
                        window.showOnlineToast('連線服務載入失敗，請檢查網絡', 'error');
                        return;
                    }
                    return f.apply(window, args);
                }).catch(function () {
                    window.showOnlineToast('連線服務載入失敗，請檢查網絡', 'error');
                });
            };
            // 畀把尺分得出「掛咗真嘢返去」定「仲係佔位」——兩者都係 function，
            // 淨係睇 typeof 係分唔開嘅。
            佔位.__holdingForSdk = true;
            window[n] = 佔位;

            /*
             * SDK 到咗就即刻拆返個佔位，唔使等人撳。
             *
             * 呢步唔係為咗靚：classic script 入面，頂層 `function joinFixedRoom() {}`
             * 同 `window.joinFixedRoom` **係同一個綁定**。所以上面 `window[n] = 佔位`
             * 之後，`online.js` 嗰句 `window.joinFixedRoom = joinFixedRoom;`
             * 其實係將佔位指返自己——真嘢永遠掛唔返上去，之後每一次撳都要行多
             * 一轉佔位、每次都彈一句「連線服務載入中…」。（Snooker 冇呢個病，
             * 因為佢個全域名 `snookerJoinRoom` 同函數名唔同；Xiangqi 冇，因為佢係
             * module。同一句碼喺三種載入方式下面行為唔同。）
             *
             * 攞唔到 SDK 就唔拆——留住個佔位，起碼撳落去有嘢話你知。
             */
            ready.then(function () {
                var 真 = (window[n] === 佔位) ? 原本 : window[n];
                if (typeof 真 === 'function' && !真.__holdingForSdk) window[n] = 真;
            }, function () { /* 攞唔到就留住佔位 */ });
        });
    };
}());
