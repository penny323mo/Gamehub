// 本機玩家存檔槽。名稱 + code 只用作同一個瀏覽器內分隔進度，唔係雲端認證。
const DIRECTORY_KEY = 'royale-profiles-v1';
const ACTIVE_KEY = 'royale-active-profile-v1';
const SAVE_KEY = 'royale-save-v1';
const PLAYER_ID_KEY = 'royale_playerId';
const PLAYER_NAME_KEY = 'royale_playerName';
const NAME_MAX = 12;
const CODE_MIN = 4;
const CODE_MAX = 12;

function cleanName(value) {
    return String(value ?? '').replace(/[<>\x00-\x1f]/g, '').trim().slice(0, NAME_MAX);
}

function cleanCode(value) {
    return String(value ?? '').trim();
}

function loadDirectory() {
    try {
        const parsed = JSON.parse(localStorage.getItem(DIRECTORY_KEY) || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string'
            && typeof p.salt === 'string' && typeof p.codeHash === 'string');
    } catch {
        return [];
    }
}

function saveDirectory(profiles) {
    localStorage.setItem(DIRECTORY_KEY, JSON.stringify(profiles));
}

function profileNameKey(name) {
    return name.toLocaleLowerCase();
}

function randomHex(bytes = 16) {
    const data = crypto.getRandomValues(new Uint8Array(bytes));
    return [...data].map(n => n.toString(16).padStart(2, '0')).join('');
}

async function hashCode(code, salt) {
    const bytes = new TextEncoder().encode(`${salt}:${code}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('');
}

function validate(nameValue, codeValue) {
    const name = cleanName(nameValue);
    const code = cleanCode(codeValue);
    if (!name) throw new Error('請輸入玩家名稱');
    if (code.length < CODE_MIN || code.length > CODE_MAX) {
        throw new Error(`code 要有 ${CODE_MIN}–${CODE_MAX} 個字`);
    }
    return { name, code };
}

export function listProfiles() {
    return loadDirectory().map(({ id, name }) => ({ id, name }));
}

export function getActiveProfileId() {
    try {
        const id = localStorage.getItem(ACTIVE_KEY);
        return loadDirectory().some(p => p.id === id) ? id : null;
    } catch {
        return null;
    }
}

export function getActiveProfile() {
    const id = getActiveProfileId();
    const profile = loadDirectory().find(p => p.id === id);
    return profile ? { id: profile.id, name: profile.name } : null;
}

export function getProfileSaveKey(baseKey = SAVE_KEY) {
    const id = getActiveProfileId();
    return id ? `${baseKey}:${id}` : baseKey;
}

export function getProfileScopedKey(baseKey) {
    const id = getActiveProfileId();
    return id ? `${baseKey}:${id}` : baseKey;
}

export async function createProfile(nameValue, codeValue) {
    const { name, code } = validate(nameValue, codeValue);
    const profiles = loadDirectory();
    if (profiles.some(p => profileNameKey(p.name) === profileNameKey(name))) {
        throw new Error('呢個玩家名稱已存在；請用「登入玩家」');
    }

    const id = crypto.randomUUID();
    const salt = randomHex();
    const profile = { id, name, salt, codeHash: await hashCode(code, salt) };
    const claimedLegacy = profiles.length === 0 && localStorage.getItem(SAVE_KEY) !== null;

    // 第一個玩家會複製（唔刪除）舊版共用存檔，確保升級後原有進度可回復。
    if (claimedLegacy) localStorage.setItem(`${SAVE_KEY}:${id}`, localStorage.getItem(SAVE_KEY));
    const legacyPlayerId = localStorage.getItem(PLAYER_ID_KEY);
    if (profiles.length === 0 && legacyPlayerId) {
        localStorage.setItem(`${PLAYER_ID_KEY}:${id}`, legacyPlayerId);
    }
    localStorage.setItem(`${PLAYER_NAME_KEY}:${id}`, name);
    saveDirectory([...profiles, profile]);
    localStorage.setItem(ACTIVE_KEY, id);
    return { id, name, claimedLegacy };
}

export async function loginProfile(nameValue, codeValue) {
    const { name, code } = validate(nameValue, codeValue);
    const profile = loadDirectory().find(p => profileNameKey(p.name) === profileNameKey(name));
    if (!profile) throw new Error('搵唔到呢個玩家；如係新玩家請撳「新增玩家」');
    if (await hashCode(code, profile.salt) !== profile.codeHash) throw new Error('code 唔正確');
    localStorage.setItem(ACTIVE_KEY, profile.id);
    return { id: profile.id, name: profile.name, claimedLegacy: false };
}
