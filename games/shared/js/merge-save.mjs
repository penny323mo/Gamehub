/**
 * 寫存檔之前先讀返存檔。
 *
 * 點解要有呢個：`localStorage` 係**成個 origin 共用**嘅——兩個 tab 唔係兩部機。
 * 而大部分遊戲係「開場讀一次成份存檔入記憶體，收場寫返成份出去」。兩個 tab
 * 都喺開場讀過，之後各自寫返自己嗰份——**後寫嗰個食咗前一個嘅成果**。
 *
 * 實測（`tests/hub-tabs.mjs`，兩個 tab 同時開住、各打完一局）：
 *
 *     Neon Snake     `gamesPlayed`  打咗兩局，個數仲係 **1**
 *     Empire Royale  `trophies`     贏咗兩場，獎盃仲係 **30**（一場 = 30）
 *
 * 兩局變一局。呢個係 last-write-wins 嘅預設行為，要特登避先避得到。
 *
 * 避法唔係加鎖，係**唔好信記憶體嗰份**：改嘅時候即刻讀返 storage 現時嘅值,
 * 喺嗰個之上改，再寫返去。兩個 tab 一先一後咁寫，第二個就會見到第一個嘅成果。
 *
 * （真正同時、同一毫秒嘅兩個寫入仍然可以撞——`localStorage` 冇原子
 *   read-modify-write。但玩家嘅兩個 tab 唔會喺同一毫秒收場；呢度避嘅係
 *   「隔咗成分鐘」嗰種，即係實際會發生嗰種。）
 */
export function 改存檔(key, 改, 預設) {
    let 現時 = 預設;
    try {
        const raw = localStorage.getItem(key);
        if (raw) 現時 = JSON.parse(raw);
    } catch {
        // 壞咗嘅存檔唔應該令你玩唔到——當佢係預設值，跟住寫返一份好嘅落去
        現時 = 預設;
    }
    const 新 = 改(現時);
    try {
        localStorage.setItem(key, JSON.stringify(新));
    } catch {
        // 無痕模式／空間滿都照玩（同 `safe-storage.js` 同一個立場）
    }
    return 新;
}
