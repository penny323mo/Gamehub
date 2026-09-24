if (!globalThis.GameCatalog) {
    throw new Error('GameCatalog 未載入；請先執行 node scripts/build-game-catalog.mjs');
}

/*
 * Hub launcher：一個現代遊戲平台式首頁（ADR-314）。
 *
 * 上一代係 4/4/4/1 carousel ＋ 三套 theme（ADR-312/313）。問題唔係 CSS：
 *   - 首屏只見到 13 隻入面 4 隻，其餘 9 隻要逐版揭；尾版得孤零零一隻。
 *   - 媒介得一粒 emoji／細 logo，封面九成係黑色空位。（一度試過手繪 SVG，Penny
 *     判「低端」——封面一定要係真實遊玩畫面。）
 *   - 三套 theme 攤薄咗火力，冇一套做得完整。
 *
 * 而家：
 *   頂欄（品牌）→ 精選 hero（上次玩過嗰隻，冇就每日輪替）→ 類型篩選 ＋
 *   一頁見晒 13 隻嘅 responsive grid。每隻遊戲一張真實遊玩截圖做封面。
 *
 * 穩定契約（把尺查嘅就係呢幾樣）：
 *   - 13 個 `a[data-game-id]`，manifest 次序、真 href，每隻只出現一次；
 *   - hero 係另一個 anchor，用 `data-hero-game-id`，唔計入上面 13 個；
 *   - 篩選掣 `[data-filter]`，`aria-pressed` 反映狀態；
 *   - storage（上次玩過）壞咗都唔可以影響 render。
 */

const catalog = globalThis.GameCatalog;
const games = catalog.launcherEntries();
const byId = new Map(catalog.list().map((game) => [game.id, game]));

const RECENT_KEY = 'gamehub-recent-v1';

/*
 * 篩選分組。manifest 嘅 `category` 有十一種，逐種開一粒掣太碎；
 * 呢度併做四組，每組 3–4 隻，冇一粒掣撳落去得一隻。
 */
const GROUPS = Object.freeze([
    { id: 'all', label: '全部', match: () => true },
    { id: 'board', label: '棋牌', match: (c) => ['棋類', '卡牌'].includes(c) },
    { id: 'casual', label: '休閒', match: (c) => ['益智', '街機', '運動'].includes(c) },
    { id: 'strategy', label: '策略', match: (c) => ['策略', '即時戰略', 'MOBA'].includes(c) },
    { id: 'action', label: '動作', match: (c) => ['競速', '動作射擊', '動作 RPG'].includes(c) },
]);

let currentFilter = 'all';

// ---------- 小工具 ----------

const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
};

// 一個封咗 localStorage 嘅 getter 同封咗 setItem 一樣常見（無痕／企業 policy）。
// 「上次玩過」由頭到尾都係加分項：讀唔到、寫唔到都唔可以令首頁 render 唔到。
function withStorage(operation) {
    try {
        return operation(globalThis.localStorage);
    } catch {
        return undefined;
    }
}

const readRecent = () => {
    const id = withStorage((storage) => storage?.getItem(RECENT_KEY));
    return games.some((game) => game.id === id && game.playable) ? id : null;
};

const rememberRecent = (id) => withStorage((storage) => storage?.setItem(RECENT_KEY, id));

// manifest 啲副標題有 emoji 前綴（「⚔️ 塔防！」）。插畫已經講咗主題，emoji 再講一次係雜訊。
const cleanSubtitle = (text = '') => text.replace(/^[^\p{L}\p{N}]+/u, '').trim();

const isThreeD = (record) => /three|babylon/.test(record?.runtime?.engine ?? '');

function badgesOf(game) {
    const record = byId.get(game.id);
    const caps = record?.capabilities ?? {};
    const out = [];
    if (isThreeD(record)) out.push('3D');
    if (caps.online) out.push('線上對戰');
    if (caps.continue) out.push('可續局');
    return out;
}

/*
 * 封面：每隻遊戲一張真實遊玩截圖（`assets/hub/covers` 480×300 俾卡用、
 * `assets/hub/hero` 960×600 俾 hero 用）。分兩個尺寸係因為 hub-load 守住
 * 「原圖唔可以大過最大顯示尺寸 3 倍」：卡最大約 290px 闊，hero 可以去到 750。
 * 截圖流程同來源見 `assets/hub/README.md`。
 */
const COVER_VERSION = 'covers-2';
const ACCENT = Object.freeze({
    gomoku: '#f5b04c', xiangqi: '#ef4444', big2: '#34d399', doudizhu: '#fbbf24',
    pennycrush: '#f472b6', snooker: '#22c55e', tower: '#a78bfa', snake: '#4ade80',
    royale: '#60a5fa', moba: '#c084fc', racer: '#fb7185', ashenrail: '#fb923c',
    'elden-ring-ii': '#fcd34d',
});

function coverNode(game, className, { hero = false, eager = false } = {}) {
    const wrap = el('span', className);
    wrap.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.src = `assets/hub/${hero ? 'hero' : 'covers'}/${game.id}.webp?v=${COVER_VERSION}`;
    img.alt = '';
    img.width = hero ? 960 : 480;
    img.height = hero ? 600 : 300;
    img.decoding = 'async';
    img.loading = eager ? 'eager' : 'lazy';
    if (hero) img.fetchPriority = 'high';
    // 新加一隻遊戲未影截圖：用 manifest icon 頂住，唔好留一格爛圖。
    img.addEventListener('error', () => {
        img.remove();
        wrap.classList.add('is-fallback');
        wrap.append(el('span', 'art-fallback', game.isImage ? '🎮' : game.icon));
    }, { once: true });
    wrap.append(img);
    return wrap;
}

const accentOf = (game) => ACCENT[game.id] ?? '#8b9cff';

function launchAnchor(game, className) {
    const a = el('a', className);
    a.href = game.playable ? game.link : '#';
    a.style.setProperty('--accent', accentOf(game));
    if (!game.playable) {
        a.classList.add('is-locked');
        a.setAttribute('aria-disabled', 'true');
        a.tabIndex = -1;
    } else {
        a.addEventListener('click', () => rememberRecent(game.id));
    }
    return a;
}

// ---------- 組件 ----------

function brandMark() {
    const mark = el('span', 'brand-mark');
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<svg viewBox="0 0 32 32" focusable="false"><rect x="3" y="9" width="26" height="15" rx="7.5" fill="currentColor"/><g fill="#0b0e17"><rect x="8.5" y="15" width="7" height="2.4" rx="1.2"/><rect x="10.8" y="12.7" width="2.4" height="7" rx="1.2"/><circle cx="21.5" cy="14.8" r="1.7"/><circle cx="24.5" cy="18.2" r="1.7"/></g></svg>';
    return mark;
}

function topBar() {
    const bar = el('header', 'hub-top');
    const inner = el('div', 'hub-top-inner');
    const brand = el('div', 'brand');
    const words = el('div', 'brand-words');
    words.append(el('h1', 'brand-name', 'Game Hub'), el('p', 'brand-tag', 'vibe coding by penny323'));
    brand.append(brandMark(), words);
    const count = el('p', 'hub-count');
    count.append(el('b', null, String(games.length)), document.createTextNode(' 款遊戲'));
    inner.append(brand, count);
    bar.append(inner);
    return bar;
}

/** 精選：上次玩過嗰隻；冇紀錄就按日子輪替，令首頁每日都有啲唔同。 */
function pickFeatured() {
    const recent = readRecent();
    if (recent) return { game: games.find((game) => game.id === recent), recent: true };
    const playable = games.filter((game) => game.playable);
    const day = Math.floor(Date.now() / 86_400_000);
    return { game: playable[day % playable.length], recent: false };
}

function hero() {
    const { game, recent } = pickFeatured();
    const section = el('section', 'hub-hero');
    section.setAttribute('aria-label', recent ? '繼續玩' : '今日精選');
    const a = launchAnchor(game, 'hero-link');
    a.dataset.heroGameId = game.id;
    const copy = el('span', 'hero-copy');
    copy.append(
        el('span', 'hero-eyebrow', recent ? '繼續玩' : '今日精選'),
        el('span', 'hero-title', game.title),
        el('span', 'hero-sub', cleanSubtitle(game.subtitle)),
    );
    const meta = el('span', 'hero-meta');
    [game.category, ...badgesOf(game)].forEach((text) => meta.append(el('span', 'tag', text)));
    copy.append(meta, el('span', 'hero-cta', game.playable ? '開始遊戲' : '暫停開放'));
    a.append(coverNode(game, 'hero-art', { hero: true, eager: true }), el('span', 'hero-shade'), copy);
    section.append(a);
    return section;
}

function filterBar() {
    const bar = el('div', 'filters');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', '按類型篩選');
    GROUPS.forEach((group) => {
        const n = games.filter((game) => group.match(game.category)).length;
        const button = el('button', 'chip');
        button.type = 'button';
        button.dataset.filter = group.id;
        button.setAttribute('aria-pressed', String(group.id === currentFilter));
        button.append(el('span', 'chip-label', group.label), el('span', 'chip-count', String(n)));
        button.addEventListener('click', () => setFilter(group.id));
        bar.append(button);
    });
    return bar;
}

function card(game, index) {
    const li = el('li', 'grid-cell');
    li.dataset.category = game.category;
    const a = launchAnchor(game, 'game-card');
    a.dataset.gameId = game.id;
    a.style.setProperty('--i', String(index));
    /*
     * 遊戲名疊喺封面上。封面係遊玩中段截圖，本身冇 logo／標題畫面——
     * 淨係睇圖唔知係咩遊戲（Penny review）。所以好似商店封面咁，圖底加深色
     * 漸層，大字寫名＋類型；卡身淨返簡介同 badge，唔再重複個名。
     * 名唔可以擺入 `coverNode`（佢係 aria-hidden），否則讀屏聽唔到。
     */
    const media = el('span', 'card-media');
    const label = el('span', 'card-label');
    label.append(el('span', 'card-cat', game.category), el('span', 'card-title', game.title));
    media.append(coverNode(game, 'card-art', { eager: index < 4 }), label, el('span', 'card-play', '▶'));
    const body = el('span', 'card-body');
    body.append(el('span', 'card-sub', cleanSubtitle(game.subtitle)));
    const badges = badgesOf(game);
    if (badges.length) {
        const row = el('span', 'card-badges');
        badges.forEach((text) => row.append(el('span', 'badge', text)));
        body.append(row);
    }
    a.append(media, body);
    li.append(a);
    return li;
}

function library() {
    const section = el('section', 'hub-library');
    section.setAttribute('aria-labelledby', 'library-title');
    const head = el('div', 'library-head');
    const title = el('h2', 'library-title', '遊戲庫');
    title.id = 'library-title';
    const status = el('p', 'library-status');
    status.id = 'library-status';
    status.setAttribute('aria-live', 'polite');
    const titleRow = el('div', 'library-title-row');
    titleRow.append(title, status);
    head.append(titleRow, filterBar());
    const grid = el('ul', 'game-grid');
    grid.id = 'game-grid';
    games.forEach((game, index) => grid.append(card(game, index)));
    section.append(head, grid);
    return section;
}

function footer() {
    const foot = el('footer', 'hub-foot');
    foot.append(el('p', null, `Game Hub · ${games.length} 款瀏覽器遊戲 · 全部免安裝`));
    return foot;
}

// ---------- 行為 ----------

function setFilter(id) {
    const group = GROUPS.find((item) => item.id === id) ?? GROUPS[0];
    currentFilter = group.id;
    let shown = 0;
    document.querySelectorAll('#game-grid .grid-cell').forEach((cell) => {
        const match = group.match(cell.dataset.category);
        cell.hidden = !match;
        if (match) shown += 1;
    });
    document.querySelectorAll('[data-filter]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter));
    });
    const status = document.getElementById('library-status');
    if (status) status.textContent = group.id === 'all' ? `共 ${shown} 款` : `${group.label} · ${shown} 款`;
    const root = document.getElementById('app-hub');
    if (root) root.dataset.activeFilter = currentFilter;
}

function renderHub() {
    const root = document.getElementById('app-hub');
    if (!root) return;
    root.textContent = '';
    const main = el('main', 'hub-main');
    main.append(hero(), library());
    root.append(topBar(), main, footer());
    setFilter(currentFilter);
}

// 唔等外置字型 load 完先出遊戲卡；慢網絡之下主頁都要即刻可用。
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHub, { once: true });
} else {
    renderHub();
}
