/**
 * Snooker Online Mode – Supabase Realtime
 * Shared by 2D (app.js) and 3D (main.js).
 *
 * External API consumed by the game:
 *   window.snookerOnlineRoomUpdate({ status, players, myRole })
 *   window.snookerApplyRemoteShot(shot)
 *
 * API exposed to the game:
 *   window.snookerJoinRoom(roomKey)
 *   window.snookerExitRoom()
 *   window.snookerToggleReady()
 *   window.snookerSendShot(payload)
 *   window.snookerRematch()
 *   window.initSnookerOnline()
 */

const SUPABASE_URL     = 'https://djbhipofzbonxfqriovi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld';
const FIXED_ROOMS_MAP = {
    '2d': ['ROOM01', 'ROOM02', 'ROOM03'],
    '3d': ['3D-ROOM01', '3D-ROOM02', '3D-ROOM03'],
};
let FIXED_ROOMS = FIXED_ROOMS_MAP['2d'];

const SnookerOnline = {
    sbClient:        null,
    roomKey:         null,
    roomUuid:        null,
    playerRole:      null,   // 'player1' | 'player2'
    roomChannel:     null,
    shotsChannel:    null,
    clientId:        null,
    heartbeatInterval: null,
    lobbyInterval:   null,   // tracked so repeated initSnookerOnline() calls don't leak
    appliedShotIds:  new Set(),
    currentRoundId:  null,
    hasSeat:         false,
    gameMode:        '2d',
};

// ─── Init ────────────────────────────────────────────────────────────────────

function initSnookerOnline({ gameMode = '2d' } = {}) {
    SnookerOnline.gameMode = gameMode;
    FIXED_ROOMS = FIXED_ROOMS_MAP[gameMode] ?? FIXED_ROOMS_MAP['2d'];
    // Use sessionStorage so each browser tab gets its own ID,
    // allowing two tabs on the same device to be different players.
    SnookerOnline.clientId = sessionStorage.getItem('snooker_clientId');
    if (!SnookerOnline.clientId) {
        SnookerOnline.clientId = crypto.randomUUID();
        sessionStorage.setItem('snooker_clientId', SnookerOnline.clientId);
    }
    console.log('[SnookerOnline] clientId:', SnookerOnline.clientId);

    if (SnookerOnline.sbClient) {
        console.log('[SnookerOnline] reusing existing client');
    } else if (window.supabase && window.supabase.createClient) {
        SnookerOnline.sbClient = window.supabase.createClient(
            SUPABASE_URL, SUPABASE_ANON_KEY.trim(),
            { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } }
        );
        console.log('[SnookerOnline] Supabase initialized');
    } else if (window.supabase && window.supabase.from) {
        SnookerOnline.sbClient = window.supabase;
        console.log('[SnookerOnline] recovered from window.supabase');
    } else {
        console.error('[SnookerOnline] Supabase SDK not loaded');
        return;
    }

    window.snookerJoinRoom    = joinFixedRoom;
    window.snookerExitRoom    = exitFixedRoom;
    window.snookerToggleReady = toggleReady;
    window.snookerSendShot    = sendShot;

    // Register the unload guard only once, even if initSnookerOnline()
    // is called multiple times (e.g. switching 2D ↔ 3D in the hub).
    if (!SnookerOnline._unloadRegistered) {
        SnookerOnline._unloadRegistered = true;
        window.addEventListener('beforeunload', () => {
            if (SnookerOnline.roomUuid) exitFixedRoom();
        });
    }

    fetchLobbyRooms();

    // Auto-refresh lobby every 5 s while lobby is visible.
    // Clear any previous interval so repeated calls to initSnookerOnline()
    // (e.g. switching between 2D / 3D in the hub) do not accumulate timers.
    if (SnookerOnline.lobbyInterval) clearInterval(SnookerOnline.lobbyInterval);
    SnookerOnline.lobbyInterval = setInterval(() => {
        if (document.getElementById('snooker-online-lobby')?.offsetParent !== null) {
            fetchLobbyRooms();
        }
    }, 5000);
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

let _lastRpcCleanAt = 0;

async function fetchLobbyRooms() {
    if (!SnookerOnline.sbClient) return;

    const now = Date.now();
    if (now - _lastRpcCleanAt > 30000) {
        _lastRpcCleanAt = now;
        try { await SnookerOnline.sbClient.rpc('clean_stale_snooker_rooms'); } catch (_) {}
    }

    const { data: rooms, error } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('room_code, player1_id, player2_id, status, player1_ready, player2_ready')
        .in('room_code', FIXED_ROOMS);

    if (error) { console.error('[SnookerLobby]', error); return; }

    FIXED_ROOMS.forEach(key => updateRoomCardUI(key, rooms?.find(r => r.room_code === key)));
}

function updateRoomCardUI(roomKey, room) {
    const statusEl  = document.getElementById(`snooker-room-status-${roomKey}`);
    const playersEl = document.getElementById(`snooker-room-players-${roomKey}`);
    const joinBtn   = document.getElementById(`snooker-room-join-${roomKey}`);
    if (!statusEl) return;

    if (!room) {
        statusEl.textContent  = '房間不存在';
        joinBtn.disabled      = true;
        return;
    }

    const map = { waiting: '等待中', playing: '對戰中', finished: '已結束' };
    statusEl.textContent  = map[room.status] || room.status;
    playersEl.textContent = `${room.player1_id ? 'P1:有' : 'P1:空'} / ${room.player2_id ? 'P2:有' : 'P2:空'}`;

    const isFull = room.player1_id && room.player2_id;
    const amIIn  = room.player1_id === SnookerOnline.clientId ||
                   room.player2_id === SnookerOnline.clientId;

    joinBtn.disabled    = isFull && !amIIn;
    joinBtn.textContent = amIIn ? '返回' : isFull ? '已滿' : '加入';
}

// ─── Join ────────────────────────────────────────────────────────────────────

async function joinFixedRoom(roomKey) {
    if (!SnookerOnline.sbClient) return;

    try { await SnookerOnline.sbClient.rpc('clean_stale_snooker_rooms'); } catch (_) {}

    const { data: room, error } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !room) { alert('房間不存在'); return; }

    let role = null;
    const now = new Date().toISOString();
    const updateData = { last_activity_at: now };
    let conditionField = null;

    if (room.player1_id === SnookerOnline.clientId) {
        role = 'player1';
        updateData.p1_last_seen_at = now;
    } else if (room.player2_id === SnookerOnline.clientId) {
        role = 'player2';
        updateData.p2_last_seen_at = now;
    } else if (!room.player1_id) {
        role = 'player1';
        updateData.player1_id      = SnookerOnline.clientId;
        updateData.p1_last_seen_at = now;
        conditionField             = 'player1_id';
    } else if (!room.player2_id) {
        role = 'player2';
        updateData.player2_id      = SnookerOnline.clientId;
        updateData.p2_last_seen_at = now;
        conditionField             = 'player2_id';
    } else {
        alert('房間已滿'); return;
    }

    let query = SnookerOnline.sbClient.from('snooker_rooms').update(updateData).eq('id', room.id);
    if (conditionField) query = query.is(conditionField, null);

    const { error: updateErr } = await query;
    if (updateErr) {
        console.error('[SnookerOnline] join update error:', updateErr);
        alert('加入失敗: ' + (updateErr.message || '未知錯誤'));
        fetchLobbyRooms();
        return;
    }

    // Verify we actually got the slot (re-fetch is more reliable than checking updatedRows)
    const { data: freshRoom, error: fetchErr } = await SnookerOnline.sbClient
        .from('snooker_rooms').select('*').eq('id', room.id).single();

    if (fetchErr || !freshRoom) {
        alert('加入失敗，讀取房間出錯');
        fetchLobbyRooms();
        return;
    }

    // If we tried to claim a slot, verify we actually got it
    if (conditionField && freshRoom[conditionField] !== SnookerOnline.clientId) {
        alert('加入失敗，位置可能被搶走');
        fetchLobbyRooms();
        return;
    }

    Object.assign(room, freshRoom);
    SnookerOnline.hasSeat       = true;
    SnookerOnline.roomKey       = roomKey;
    SnookerOnline.roomUuid      = room.id;
    SnookerOnline.playerRole    = role;
    SnookerOnline.currentRoundId = room.round_id || 0;
    SnookerOnline.appliedShotIds.clear();

    console.log('[SnookerOnline] Joined as', role, 'in room', roomKey);

    enterRoomView(room);
    subscribeToRoom();
    subscribeToShots();
    startHeartbeat();
}

// ─── Room View ───────────────────────────────────────────────────────────────

function enterRoomView(room) {
    document.getElementById('snooker-online-lobby')?.classList.add('hidden');
    document.getElementById('snooker-online-room')?.classList.remove('hidden');
    renderRoomState(room);
}

function renderRoomState(room) {
    if (!room) return;
    window.snookerCurrentRoom = room;

    // Detect round change → clear applied shots
    const newRoundId = room.round_id || 0;
    if (SnookerOnline.currentRoundId !== null && newRoundId !== SnookerOnline.currentRoundId) {
        console.log('[SnookerOnline] New round detected:', SnookerOnline.currentRoundId, '->', newRoundId);
        SnookerOnline.appliedShotIds.clear();
    }
    SnookerOnline.currentRoundId = newRoundId;

    // Room header
    const roomIdEl = document.getElementById('snooker-room-id');
    const roleEl   = document.getElementById('snooker-my-role');
    if (roomIdEl) roomIdEl.textContent = SnookerOnline.roomKey;
    if (roleEl)   roleEl.textContent   = SnookerOnline.playerRole === 'player1' ? 'P1' : 'P2';

    // Waiting message
    const hasOpponent = room.player1_id && room.player2_id;
    const waitEl = document.getElementById('snooker-waiting-msg');
    if (waitEl) {
        waitEl.textContent    = hasOpponent ? '' : '等待對手加入...';
        waitEl.style.display  = hasOpponent ? 'none' : 'block';
    }

    // Ready status
    const p1ReadyEl = document.getElementById('snooker-p1-ready');
    const p2ReadyEl = document.getElementById('snooker-p2-ready');
    if (p1ReadyEl) p1ReadyEl.textContent = `P1: ${room.player1_id ? (room.player1_ready ? '✓ 已準備' : '等待準備') : '空位'}`;
    if (p2ReadyEl) p2ReadyEl.textContent = `P2: ${room.player2_id ? (room.player2_ready ? '✓ 已準備' : '等待準備') : '空位'}`;

    const readyBtn = document.getElementById('snooker-ready-btn');
    if (readyBtn) {
        const myReady = SnookerOnline.playerRole === 'player1' ? room.player1_ready : room.player2_ready;
        readyBtn.textContent = myReady ? '取消準備' : '準備';
        readyBtn.disabled    = !hasOpponent;
    }

    const readyArea = document.getElementById('snooker-ready-area');
    if (readyArea) readyArea.classList.toggle('hidden', room.status !== 'waiting');

    const rematchBtn = document.getElementById('snooker-rematch-btn');
    if (rematchBtn) rematchBtn.classList.toggle('hidden', room.status !== 'finished');

    // ── Rematch: when status returns to 'waiting' after a completed game
    // (round_id > 0), bring the room panel back into view so both players
    // can click Ready again.  The overlay IDs differ between 2D and 3D pages
    // but the inner room / lobby panel IDs are normalised by each page.
    if (room.status === 'waiting' && newRoundId > 0) {
        const overlayId = SnookerOnline.gameMode === '3d'
            ? 'snooker3d-online-overlay'
            : 'snooker-online-overlay';
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            overlay.classList.remove('hidden');
            document.getElementById('snooker-online-lobby')?.classList.add('hidden');
            document.getElementById('snooker-online-room')?.classList.remove('hidden');
        }
    }

    // ── Both players ready → transition to 'playing' (player1 initiates, race-safe) ──
    if (room.status === 'waiting' && room.player1_ready && room.player2_ready &&
        SnookerOnline.playerRole === 'player1' && SnookerOnline.sbClient) {
        SnookerOnline.sbClient
            .from('snooker_rooms')
            .update({ status: 'playing', current_turn: 'player1' })
            .eq('id', SnookerOnline.roomUuid)
            .eq('status', 'waiting')   // condition: only apply if still waiting
            .then(({ error }) => { if (error) console.log('[SnookerOnline] start-game skipped:', error.message); });
    }

    // Notify the game
    if (window.snookerOnlineRoomUpdate) {
        const p1Name = room.player1_name || 'P1';
        const p2Name = room.player2_name || 'P2';
        window.snookerOnlineRoomUpdate({
            status:  room.status,
            players: [{ name: p1Name, role: 'player1' }, { name: p2Name, role: 'player2' }],
            myRole:  SnookerOnline.playerRole,
        });
    }
}

// ─── Ready ───────────────────────────────────────────────────────────────────

async function toggleReady() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;

    const { data: room } = await SnookerOnline.sbClient
        .from('snooker_rooms').select('*').eq('id', SnookerOnline.roomUuid).single();

    if (!room?.player1_id || !room?.player2_id) { alert('請等待對手加入'); return; }

    const field    = SnookerOnline.playerRole === 'player1' ? 'player1_ready' : 'player2_ready';
    const newReady = !room[field];

    const { error } = await SnookerOnline.sbClient
        .from('snooker_rooms').update({ [field]: newReady }).eq('id', SnookerOnline.roomUuid);

    if (error) console.error('[SnookerOnline] toggleReady error:', error);
}

// ─── Heartbeat ───────────────────────────────────────────────────────────────

function startHeartbeat() {
    stopHeartbeat();
    SnookerOnline.heartbeatInterval = setInterval(async () => {
        if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;
        const field = SnookerOnline.playerRole === 'player1' ? 'p1_last_seen_at' : 'p2_last_seen_at';
        await SnookerOnline.sbClient
            .from('snooker_rooms').update({ [field]: new Date().toISOString() })
            .eq('id', SnookerOnline.roomUuid);
    }, 15000);
}

function stopHeartbeat() {
    clearInterval(SnookerOnline.heartbeatInterval);
    SnookerOnline.heartbeatInterval = null;
}

// ─── Shot Sync ───────────────────────────────────────────────────────────────

/**
 * Send a shot to the opponent.
 * payload for 2D: { angle, power, spin_x, spin_y, cue_x, cue_y }
 * payload for 3D: { aim_dx, aim_dz, power, spin_x, spin_y, cue_x, cue_z }
 */
async function sendShot(payload) {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;
    // Route through server-validated RPC (seat ownership check + current_turn flip).
    const { data, error } = await SnookerOnline.sbClient.rpc('submit_snooker_shot', {
        p_room_id:     SnookerOnline.roomUuid,
        p_client_id:   SnookerOnline.clientId,
        p_player_role: SnookerOnline.playerRole,
        p_payload:     payload,
    });
    if (error) {
        console.error('[SnookerShot] RPC error:', error);
    } else if (data?.error) {
        console.warn('[SnookerShot] Rejected:', data.error);
    } else {
        console.log('[SnookerShot] Sent via RPC:', payload);
    }
}

// ─── Realtime ────────────────────────────────────────────────────────────────

function subscribeToRoom() {
    if (SnookerOnline.roomChannel) SnookerOnline.sbClient.removeChannel(SnookerOnline.roomChannel);

    SnookerOnline.roomChannel = SnookerOnline.sbClient
        .channel(`snooker-room-${SnookerOnline.roomUuid}`)
        .on('postgres_changes', {
            event: '*', schema: 'public', table: 'snooker_rooms',
            filter: `id=eq.${SnookerOnline.roomUuid}`,
        }, (payload) => {
            console.log('[SnookerRT-ROOM]', payload.eventType, payload.new?.status);
            if (payload.new) renderRoomState(payload.new);
        })
        .subscribe((status, err) => {
            console.log('[SnookerRT-ROOM] subscribe status:', status);
            if (err) console.error('[SnookerRT-ROOM] error:', err);
        });
}

function subscribeToShots() {
    if (SnookerOnline.shotsChannel) SnookerOnline.sbClient.removeChannel(SnookerOnline.shotsChannel);

    SnookerOnline.shotsChannel = SnookerOnline.sbClient
        .channel(`snooker-shots-${SnookerOnline.roomUuid}`)
        .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'snooker_shots',
            filter: `room_id=eq.${SnookerOnline.roomUuid}`,
        }, (payload) => {
            const shot = payload.new;
            if (!shot?.id) return;
            // Ignore own shots
            if (shot.player_role === SnookerOnline.playerRole) return;
            // Deduplicate; cap size to avoid unbounded growth in long sessions
            if (SnookerOnline.appliedShotIds.has(shot.id)) return;
            if (SnookerOnline.appliedShotIds.size > 500) SnookerOnline.appliedShotIds.clear();
            SnookerOnline.appliedShotIds.add(shot.id);
            console.log('[SnookerShot] Remote shot received:', shot.payload);
            if (window.snookerApplyRemoteShot) window.snookerApplyRemoteShot(shot.payload || shot);
        })
        .subscribe((status, err) => {
            console.log('[SnookerRT-SHOTS] subscribe status:', status);
            if (err) console.error('[SnookerRT-SHOTS] error:', err);
        });
}

// ─── Exit ────────────────────────────────────────────────────────────────────

async function exitFixedRoom() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) {
        cleanupAndLobby(); return;
    }

    const room = window.snookerCurrentRoom;
    if (room?.status === 'playing') {
        if (!confirm('退出將判負，確定要離開？')) return;
    }

    stopHeartbeat();

    const now = new Date().toISOString();
    const updateData = { last_activity_at: now };

    if (SnookerOnline.playerRole === 'player1') {
        updateData.player1_id    = null;
        updateData.player1_ready = false;
    } else {
        updateData.player2_id    = null;
        updateData.player2_ready = false;
    }

    // Check whether the opponent still occupies the other seat.
    const otherIdField  = SnookerOnline.playerRole === 'player1' ? 'player2_id' : 'player1_id';
    const otherPlayerId = room?.[otherIdField];

    if (room?.status === 'playing') {
        // Forfeit: leaving mid-game hands the win to the opponent.
        updateData.status          = 'finished';
        updateData.winner          = SnookerOnline.playerRole === 'player1' ? 'player2' : 'player1';
        updateData.finished_reason = 'opponent_left';
        updateData.finished_at     = now;
    } else if (!otherPlayerId) {
        // Last player to leave a non-playing room: reset the room completely
        // so the next visitors find it in a clean, joinable state.
        // (Without this, 'finished' rooms with no players are permanently stuck.)
        updateData.status          = 'waiting';
        updateData.player1_ready   = false;
        updateData.player2_ready   = false;
        updateData.current_turn    = null;
        updateData.winner          = null;
        updateData.finished_reason = null;
        updateData.finished_at     = null;
    }

    await SnookerOnline.sbClient.from('snooker_rooms').update(updateData).eq('id', SnookerOnline.roomUuid);
    cleanupAndLobby();
}

function cleanupAndLobby() {
    stopHeartbeat();
    SnookerOnline.sbClient?.removeChannel(SnookerOnline.roomChannel);
    SnookerOnline.sbClient?.removeChannel(SnookerOnline.shotsChannel);

    SnookerOnline.roomKey       = null;
    SnookerOnline.roomUuid      = null;
    SnookerOnline.playerRole    = null;
    SnookerOnline.roomChannel   = null;
    SnookerOnline.shotsChannel  = null;
    SnookerOnline.hasSeat       = false;
    SnookerOnline.appliedShotIds.clear();
    window.snookerCurrentRoom   = null;

    if (window.snookerOnlineRoomUpdate) {
        window.snookerOnlineRoomUpdate({ status: 'left' });
    }

    document.getElementById('snooker-online-room')?.classList.add('hidden');
    document.getElementById('snooker-online-lobby')?.classList.remove('hidden');
    fetchLobbyRooms();
}

// ─── Rematch ─────────────────────────────────────────────────────────────────

async function snookerRematch() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;

    await SnookerOnline.sbClient.from('snooker_shots').delete().eq('room_id', SnookerOnline.roomUuid);

    // Guard: only reset if the room is genuinely finished.
    // Prevents a stale rematch click from resetting a game already in progress.
    await SnookerOnline.sbClient.from('snooker_rooms').update({
        status:          'waiting',
        player1_ready:   false,
        player2_ready:   false,
        current_turn:    null,
        winner:          null,
        finished_reason: null,
        finished_at:     null,
        round_id:        (window.snookerCurrentRoom?.round_id || 0) + 1,
    }).eq('id', SnookerOnline.roomUuid).eq('status', 'finished');
}

// ─── SQL Schema (for reference / first-time setup) ───────────────────────────
// Run once in Supabase SQL editor:
//
// CREATE TABLE IF NOT EXISTS snooker_rooms (
//   id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   room_code        text NOT NULL UNIQUE,
//   game_mode        text NOT NULL CHECK (game_mode IN ('2d','3d')),
//   player1_id       text,
//   player2_id       text,
//   player1_name     text,
//   player2_name     text,
//   p1_last_seen_at  timestamptz,
//   p2_last_seen_at  timestamptz,
//   player1_ready    boolean DEFAULT false,
//   player2_ready    boolean DEFAULT false,
//   status           text    DEFAULT 'waiting',
//   current_turn     text,
//   round_id         integer DEFAULT 0,
//   winner           text,
//   finished_reason  text,
//   finished_at      timestamptz,
//   last_activity_at timestamptz DEFAULT now()
// );
//
// ALTER TABLE snooker_rooms ENABLE ROW LEVEL SECURITY;
// DROP POLICY IF EXISTS "allow all" ON snooker_rooms;
// CREATE POLICY "allow all" ON snooker_rooms FOR ALL USING (true) WITH CHECK (true);
//
// -- Insert the 6 fixed rooms – 3 per variant (safe to re-run):
// INSERT INTO snooker_rooms (room_code, game_mode) VALUES
//   ('ROOM01','2d'), ('ROOM02','2d'), ('ROOM03','2d'),
//   ('3D-ROOM01','3d'), ('3D-ROOM02','3d'), ('3D-ROOM03','3d')
// ON CONFLICT (room_code) DO NOTHING;
//
// CREATE TABLE IF NOT EXISTS snooker_shots (
//   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   room_id     uuid REFERENCES snooker_rooms(id) ON DELETE CASCADE,
//   shot_no     integer,
//   player_role text,
//   payload     jsonb,
//   created_at  timestamptz DEFAULT now()
// );
//
// ALTER TABLE snooker_shots ENABLE ROW LEVEL SECURITY;
// DROP POLICY IF EXISTS "allow all" ON snooker_shots;
// CREATE POLICY "allow all" ON snooker_shots FOR ALL USING (true) WITH CHECK (true);
//
// -- Auto shot_no trigger (safe to re-run):
// CREATE OR REPLACE FUNCTION set_snooker_shot_no() RETURNS trigger LANGUAGE plpgsql AS $$
// BEGIN
//   SELECT COALESCE(MAX(shot_no),0)+1 INTO NEW.shot_no FROM snooker_shots WHERE room_id = NEW.room_id;
//   RETURN NEW;
// END; $$;
// DROP TRIGGER IF EXISTS trg_snooker_shot_no ON snooker_shots;
// CREATE TRIGGER trg_snooker_shot_no BEFORE INSERT ON snooker_shots
//   FOR EACH ROW EXECUTE FUNCTION set_snooker_shot_no();
//
// -- Stale cleanup RPC (optional, called every 30 s from client)
// CREATE OR REPLACE FUNCTION clean_stale_snooker_rooms() RETURNS void LANGUAGE plpgsql AS $$
// BEGIN
//   UPDATE snooker_rooms SET
//     player1_id=null, player1_ready=false, p1_last_seen_at=null
//   WHERE player1_id IS NOT NULL
//     AND p1_last_seen_at < now() - interval '45 seconds'
//     AND status = 'waiting';
//   UPDATE snooker_rooms SET
//     player2_id=null, player2_ready=false, p2_last_seen_at=null
//   WHERE player2_id IS NOT NULL
//     AND p2_last_seen_at < now() - interval '45 seconds'
//     AND status = 'waiting';
// END; $$;

// ─── Expose ──────────────────────────────────────────────────────────────────

window.initSnookerOnline  = initSnookerOnline;
window.snookerRematch     = snookerRematch;
Object.defineProperty(window, 'snookerPlayerRole', { get: () => SnookerOnline.playerRole });
