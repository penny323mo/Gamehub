// 玩家設定。全部存 localStorage，開遊戲即刻讀返——一個要你每次入嚟
// 重新撳靜音嘅網頁遊戲，唔算做完。
//
// 讀寫都包住 try：私隱模式／第三方 cookie 封鎖之下 localStorage 會拋錯，
// 唔可以因為記唔到設定就令成隻遊戲開唔到。

const KEY = 'moba-settings';
const DEFAULTS = {
    sfx: true,
    music: true,
    quality: null,        // null = 按裝置自動揀
    champion: null,       // 上次揀嘅英雄
};

function load() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { ...DEFAULTS };
        return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
        return { ...DEFAULTS };
    }
}

const state = load();

export const settings = {
    get(key) { return state[key]; },
    set(key, value) {
        state[key] = value;
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 記唔到就算 */ }
        return value;
    },
    all() { return { ...state }; },
};
