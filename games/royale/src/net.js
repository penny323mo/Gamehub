// PvP 網絡層 — Supabase 配對／房號 + Realtime Broadcast 傳輸戰場快照
// 架構：Host-Relay（一方做「主機」跑晒成個 Game 模擬，另一方淨係接收快照渲染 + 送出叫牌指令）
// 房間表（royale_rooms）淨係用嚟配對／記錄結果，低頻寫入；真正戰場狀態靠 Realtime
// Broadcast（唔入 DB，純 pub/sub）每秒推幾次，避免高頻寫爆資料庫。
const SUPABASE_URL = 'https://djbhipofzbonxfqriovi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld';
const ROOM_TABLE = 'royale_rooms';
const STALE_MS = 20000; // 配對揀房時，只考慮 20 秒內有活動嘅房

export const NetState = {
    client: null,
    clientId: null,
    roomId: null,
    roomCode: null,
    role: null, // 'host' | 'guest'
    channel: null,
    heartbeatT: null,
    handlers: {},
};

const SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const SDK_LOAD_TIMEOUT = 8000;
let sdkLoadPromise = null;

// PvP 淨係喺玩家真係揀「真人對戰」先至去攞 Supabase SDK ——
// 唔喺開頁嗰陣就攞，避免呢個外部 CDN 資源累到單機/連勝挑戰玩家（尤其網絡差嗰陣）
function loadSdk() {
    if (window.supabase) return Promise.resolve();
    if (sdkLoadPromise) return sdkLoadPromise;
    sdkLoadPromise = new Promise((resolve, reject) => {
        const t = setTimeout(() => {
            sdkLoadPromise = null;
            reject(new Error('連線服務逾時，請檢查網絡'));
        }, SDK_LOAD_TIMEOUT);
        const s = document.createElement('script');
        s.src = SDK_URL;
        s.onload = () => { clearTimeout(t); resolve(); };
        s.onerror = () => { clearTimeout(t); sdkLoadPromise = null; reject(new Error('連線服務載入失敗')); };
        document.head.appendChild(s);
    });
    return sdkLoadPromise;
}

async function ensureClient() {
    if (NetState.client) return NetState.client;
    NetState.clientId = sessionStorage.getItem('royale_clientId');
    if (!NetState.clientId) {
        NetState.clientId = crypto.randomUUID();
        sessionStorage.setItem('royale_clientId', NetState.clientId);
    }
    await loadSdk();
    if (!window.supabase) throw new Error('Supabase SDK 未載入');
    NetState.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    return NetState.client;
}

// 畀排行榜等其他模組共用同一個 Supabase client（照舊 lazy-load SDK）
export function getClient() {
    return ensureClient();
}

function randomRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

// on(event, cb): 'state' | 'input' | 'matchStats' | 'opponentLeft' | 'roomUpdate'
export function on(event, cb) {
    NetState.handlers[event] = cb;
}

async function enterRoom(room, role) {
    NetState.roomId = room.id;
    NetState.roomCode = room.room_code;
    NetState.role = role;
    // 重連提示：正常離場（teardown）會清走；refresh 唔會行 teardown，
    // 所以重新開頁嗰陣呢個 hint 仲喺度 → 開始畫面就知有得重連
    sessionStorage.setItem('royale_active_room', room.id);
    subscribeChannel();
    startHeartbeat();
    return room;
}

// ---------- 斷線重連 ----------
const RECONNECT_WINDOW_MS = 45000; // 快照要夠新鮮先當「場波仲救得返」

// Host 定期將戰場快照持久化落房（低頻，斷線恢復用；正常同步照行 Broadcast）
export function saveSnapshot(snap) {
    if (!NetState.client || !NetState.roomId || NetState.role !== 'host') return;
    NetState.client.from(ROOM_TABLE)
        .update({ last_snapshot: snap, snapshot_at: new Date().toISOString(), last_activity_at: new Date().toISOString() })
        .eq('id', NetState.roomId).eq('status', 'playing')
        .then(() => {}, () => {});
}

// 開始畫面用：搵返「我仲係成員、狀態 playing、快照新鮮」嘅房
export async function findMyActiveRoom() {
    const hint = sessionStorage.getItem('royale_active_room');
    if (!hint) return null;
    try {
        const c = await ensureClient();
        const { data: room } = await c.from(ROOM_TABLE).select('*').eq('id', hint).maybeSingle();
        const me = NetState.clientId;
        const role = room && (room.host_id === me ? 'host' : room.guest_id === me ? 'guest' : null);
        const fresh = room?.snapshot_at && (Date.now() - new Date(room.snapshot_at).getTime() <= RECONNECT_WINDOW_MS);
        if (!room || room.status !== 'playing' || !role || !fresh || !room.last_snapshot) {
            sessionStorage.removeItem('royale_active_room');
            return null;
        }
        return { room, role };
    } catch {
        return null; // 網絡問題唔好阻住開始畫面
    }
}

export async function rejoinRoom(room, role) {
    await ensureClient();
    return enterRoom(room, role);
}

// ---------- 配對 ----------
export async function quickMatch(deck) {
    const c = await ensureClient();
    const since = new Date(Date.now() - STALE_MS).toISOString();
    const { data: candidates } = await c.from(ROOM_TABLE).select('*')
        .eq('status', 'waiting').is('guest_id', null)
        .gt('last_activity_at', since).neq('host_id', NetState.clientId ?? '')
        .order('created_at', { ascending: true }).limit(5);

    for (const room of candidates ?? []) {
        const { data, error } = await c.from(ROOM_TABLE)
            .update({ guest_id: NetState.clientId, guest_deck: deck, last_activity_at: new Date().toISOString() })
            .eq('id', room.id).is('guest_id', null).select();
        if (!error && data && data.length) {
            return enterRoom(data[0], 'guest');
        }
    }
    return createRoom(deck);
}

export async function createRoom(deck, code = null) {
    const c = await ensureClient();
    const room_code = code || randomRoomCode();
    const { data, error } = await c.from(ROOM_TABLE).insert({
        room_code, host_id: NetState.clientId, host_deck: deck, status: 'waiting',
        last_activity_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return enterRoom(data, 'host');
}

export async function joinRoomByCode(code, deck) {
    const c = await ensureClient();
    const upper = code.trim().toUpperCase();
    const { data: room, error } = await c.from(ROOM_TABLE).select('*').eq('room_code', upper).single();
    if (error || !room) throw new Error('房間唔存在');
    if (room.guest_id && room.guest_id !== NetState.clientId) throw new Error('房間已滿');
    if (room.status !== 'waiting') throw new Error('房間已經開波');
    // 房主閂咗 tab 嘅殘留房：heartbeat 停咗超過閾值就唔好入，
    // 唔係入到去對面永遠冇 presence join，會齋等到天荒地老
    if (new Date(room.last_activity_at).getTime() < Date.now() - STALE_MS) throw new Error('房間已經失效，請對方重開');
    const { data, error: e2 } = await c.from(ROOM_TABLE)
        .update({ guest_id: NetState.clientId, guest_deck: deck, last_activity_at: new Date().toISOString() })
        .eq('id', room.id).is('guest_id', null).select();
    if (e2 || !data || !data.length) throw new Error('加入失敗（可能啱啱被搶咗）');
    return enterRoom(data[0], 'guest');
}

export async function cancelWaiting() {
    if (!NetState.roomId || !NetState.client) return;
    const roomId = NetState.roomId; // 記住緊揀，等 delete 完返嚟先唔會拆錯（可能中途開咗新一局）
    if (NetState.role === 'guest') {
        // Guest 取消：撤銷自己個 claim 讓返個房出嚟（只限仲未開波）
        await NetState.client.from(ROOM_TABLE)
            .update({ guest_id: null, guest_deck: null })
            .eq('id', roomId).eq('status', 'waiting').eq('guest_id', NetState.clientId);
    } else {
        // Host 取消：刪房，但如果啱啱有 guest 入咗座就刪唔到（delete 條件唔中）——
        // 嗰陣要主動將房標成 finished（guest 判勝），唔可以齋 teardown 留低一間
        // status='waiting' 但有 guest 嘅殭屍房，令對面一直等到 stale
        const { data } = await NetState.client.from(ROOM_TABLE).delete()
            .eq('id', roomId).eq('status', 'waiting').is('guest_id', null).select();
        if (!data || !data.length) {
            await NetState.client.from(ROOM_TABLE)
                .update({ status: 'finished', winner: 'guest', finished_reason: 'host_cancelled' })
                .eq('id', roomId).neq('status', 'finished');
        }
    }
    if (NetState.roomId === roomId) teardown();
}

// 等對手入座（host 用嚟 poll，配合 postgres_changes 訂閱做保險）
export async function pollRoom() {
    if (!NetState.client || !NetState.roomId) return null;
    const { data } = await NetState.client.from(ROOM_TABLE).select('*').eq('id', NetState.roomId).single();
    return data;
}

export async function markPlaying() {
    if (!NetState.client || !NetState.roomId) return;
    await NetState.client.from(ROOM_TABLE).update({ status: 'playing', last_activity_at: new Date().toISOString() }).eq('id', NetState.roomId);
}

export async function reportResult(winner, reason) {
    if (!NetState.client || !NetState.roomId) return;
    // 唔淨係 filter status='playing' —— 如果 markPlaying() 之前寫失敗咗、房間仲停喺
    // 'waiting'，都要照寫得入結果；淨係防止蓋走一個已經 finished 嘅紀錄。
    await NetState.client.from(ROOM_TABLE)
        .update({ status: 'finished', winner, finished_reason: reason, last_activity_at: new Date().toISOString() })
        .eq('id', NetState.roomId).neq('status', 'finished');
}

// ---------- Realtime：房間變化 + broadcast 快照/輸入 + presence 斷線偵測 ----------
function subscribeChannel() {
    if (NetState.channel) NetState.client.removeChannel(NetState.channel);
    NetState.channel = NetState.client
        .channel(`royale-room-${NetState.roomId}`, { config: { presence: { key: NetState.role } } })
        .on('postgres_changes', {
            event: 'UPDATE', schema: 'public', table: ROOM_TABLE, filter: `id=eq.${NetState.roomId}`,
        }, (payload) => { NetState.handlers.roomUpdate?.(payload.new); })
        .on('broadcast', { event: 'state' }, ({ payload }) => { NetState.handlers.state?.(payload); })
        .on('broadcast', { event: 'input' }, ({ payload }) => { NetState.handlers.input?.(payload); })
        .on('broadcast', { event: 'matchStats' }, ({ payload }) => { NetState.handlers.matchStats?.(payload); })
        .on('presence', { event: 'leave' }, ({ key }) => {
            const otherRole = NetState.role === 'host' ? 'guest' : 'host';
            if (key === otherRole) NetState.handlers.opponentLeft?.();
        })
        .on('presence', { event: 'join' }, ({ key }) => {
            // 對手（可能係重連）返咗嚟——畀 main.js 取消判負倒數
            const otherRole = NetState.role === 'host' ? 'guest' : 'host';
            if (key === otherRole) NetState.handlers.opponentJoined?.();
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // 訂閱 ack 係 async：呢一刻用戶可能已經㩒咗取消令 teardown() 清咗 channel，
                // 或者已經換咗第二個 channel —— 淨係 track 返「仲係現任」嗰個
                if (NetState.channel !== ch) return;
                await ch.track({ role: NetState.role, at: Date.now() });
            }
        });
    const ch = NetState.channel;
}

export function sendState(snapshot) {
    NetState.channel?.send({ type: 'broadcast', event: 'state', payload: snapshot });
}

export function sendInput(cmd) {
    NetState.channel?.send({ type: 'broadcast', event: 'input', payload: cmd });
}

// Host 場終果陣送一次自己統計到嘅「對手表現」畀 guest，等佢每日挑戰唔會永遠得 0
export function sendMatchStats(stats) {
    NetState.channel?.send({ type: 'broadcast', event: 'matchStats', payload: stats });
}

function startHeartbeat() {
    stopHeartbeat();
    NetState.heartbeatT = setInterval(() => {
        if (!NetState.client || !NetState.roomId) return;
        NetState.client.from(ROOM_TABLE).update({ last_activity_at: new Date().toISOString() }).eq('id', NetState.roomId);
    }, 8000);
}

function stopHeartbeat() {
    if (NetState.heartbeatT) clearInterval(NetState.heartbeatT);
    NetState.heartbeatT = null;
}

export function teardown() {
    sessionStorage.removeItem('royale_active_room'); // 正常離場：以後唔使再提重連
    stopHeartbeat();
    if (NetState.channel) {
        NetState.client?.removeChannel(NetState.channel);
        NetState.channel = null;
    }
    NetState.roomId = null;
    NetState.roomCode = null;
    NetState.role = null;
    NetState.handlers = {}; // 清哂舊 handler，唔好留低指住已完場 game 嘅 closure
}

// 主動離開 = 判自己輸（配合 stop hook：關頁時盡量發一次 keepalive 請求）
export function leaveAsLoser() {
    if (!NetState.client || !NetState.roomId) return;
    const winner = NetState.role === 'host' ? 'guest' : 'host';
    try {
        // neq.finished 而唔係 eq.playing：guest 早退時 host 可能仲未 markPlaying()（房仲係 waiting），
        // 用 eq.playing 會一行都 match 唔到，成場結果就冇人寫低
        fetch(`${SUPABASE_URL}/rest/v1/${ROOM_TABLE}?id=eq.${NetState.roomId}&status=neq.finished`, {
            method: 'PATCH', keepalive: true,
            headers: {
                apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json', Prefer: 'return=minimal',
            },
            body: JSON.stringify({ status: 'finished', winner, finished_reason: 'opponent_left' }),
        });
    } catch { /* best effort */ }
}
