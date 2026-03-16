/**
 * Snooker Online Mode - Supabase Realtime
 *
 * Supports both 2D and 3D modes via initSnookerOnline(gameMode).
 * gameMode: '2d' | '3d'
 *
 * Game interface (set by the game, consumed by online.js):
 *   window.snookerOnlineMode       = false by default; set to true on join
 *   window.snookerMyPlayer         = 0 (P1) or 1 (P2)
 *   window._snookerApplyingNetwork = true while applying a network snapshot
 *   window._snookerTransmit        = function(snapshot) — set by online.js
 *   window.applyNetworkSnookerShot = function(snapshot) — set by game to apply incoming shot
 */

// === Supabase Config ===
const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

// === State ===
const SNK = {
    sbClient: null,
    gameMode: null,       // '2d' | '3d'
    fixedRooms: [],
    roomKey: null,
    roomUuid: null,
    playerNo: null,       // 0 | 1
    clientId: null,
    roomChannel: null,
    shotsChannel: null,
    heartbeatInterval: null,
    appliedShotIds: new Set(),
    hasSeat: false,
    currentRoundId: null,
};

// === Init ===

function initSnookerOnline(gameMode) {
    SNK.gameMode = gameMode;
    SNK.fixedRooms = gameMode === '2d'
        ? ['S2D_01', 'S2D_02', 'S2D_03']
        : ['S3D_01', 'S3D_02', 'S3D_03'];

    const storageKey = `snooker_${gameMode}_clientId`;
    SNK.clientId = localStorage.getItem(storageKey);
    if (!SNK.clientId) {
        SNK.clientId = crypto.randomUUID();
        localStorage.setItem(storageKey, SNK.clientId);
    }
    console.log('[SNK] clientId:', SNK.clientId, 'mode:', gameMode);

    if (SNK.sbClient) {
        console.log('[SNK] Reusing existing Supabase client');
    } else if (window.supabase && window.supabase.createClient) {
        SNK.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
        });
        console.log('[SNK] Supabase initialized');
    } else if (window.supabase && window.supabase.from) {
        SNK.sbClient = window.supabase;
        console.log('[SNK] Supabase recovered from window.supabase');
    } else {
        console.error('[SNK] Supabase SDK not loaded');
        return;
    }

    // Expose transmit function so game can call it
    window._snookerTransmit = transmitShot;

    window.addEventListener('beforeunload', () => {
        if (SNK.roomUuid) exitRoom();
    });

    fetchLobbyRooms();
}

// === Lobby ===

let _lastRpcCleanAt = 0;
async function cleanStaleRoomsRPC() {
    if (!SNK.sbClient) return;
    const now = Date.now();
    if (now - _lastRpcCleanAt <= 30000) return;
    _lastRpcCleanAt = now;
    try {
        const { data } = await SNK.sbClient.rpc('clean_stale_snooker_rooms');
        if (data?.cleaned > 0) console.log('[SNK] RPC cleaned', data.cleaned, 'rooms');
    } catch (e) {
        console.log('[SNK] RPC clean error (non-fatal):', e.message);
    }
}

async function fetchLobbyRooms() {
    if (!SNK.sbClient) return;
    await cleanStaleRoomsRPC();

    const { data: rooms, error } = await SNK.sbClient
        .from('snooker_rooms')
        .select('room_code, player0_id, player1_id, status, player0_ready, player1_ready, game_mode')
        .in('room_code', SNK.fixedRooms);

    if (error) { console.error('[SNK Lobby] Error:', error); return; }

    SNK.fixedRooms.forEach(key => {
        const room = rooms?.find(r => r.room_code === key);
        updateRoomCardUI(key, room);
    });
}

function updateRoomCardUI(roomKey, room) {
    const statusEl = document.getElementById(`snk-room-status-${roomKey}`);
    const playersEl = document.getElementById(`snk-room-players-${roomKey}`);
    const joinBtn = document.getElementById(`snk-room-join-${roomKey}`);
    if (!statusEl) return;

    if (!room) {
        statusEl.textContent = '房間不存在';
        if (joinBtn) joinBtn.disabled = true;
        return;
    }

    const statusMap = { waiting: '等待中', playing: '對戰中', finished: '已結束' };
    statusEl.textContent = statusMap[room.status] || room.status;
    if (playersEl) playersEl.textContent = `P1:${room.player0_id ? '有' : '空'} / P2:${room.player1_id ? '有' : '空'}`;

    const isFull = room.player0_id && room.player1_id;
    const amIIn = room.player0_id === SNK.clientId || room.player1_id === SNK.clientId;
    if (joinBtn) {
        joinBtn.disabled = isFull && !amIIn;
        joinBtn.textContent = amIIn ? '返回' : isFull ? '已滿' : '加入';
    }
}

// === Join Room ===

async function joinRoom(roomKey) {
    if (!SNK.sbClient) return;
    console.log('[SNK] Joining:', roomKey);

    await cleanStaleRoomsRPC();

    const { data: room, error } = await SNK.sbClient
        .from('snooker_rooms')
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !room) { alert('房間不存在'); return; }

    let playerNo = null;
    let updateData = { last_activity_at: new Date().toISOString() };
    const now = new Date().toISOString();
    let conditionField = null;

    if (room.player0_id === SNK.clientId) {
        playerNo = 0;
        updateData.p0_last_seen_at = now;
    } else if (room.player1_id === SNK.clientId) {
        playerNo = 1;
        updateData.p1_last_seen_at = now;
    } else if (!room.player0_id) {
        playerNo = 0;
        updateData.player0_id = SNK.clientId;
        updateData.p0_last_seen_at = now;
        conditionField = 'player0_id';
    } else if (!room.player1_id) {
        playerNo = 1;
        updateData.player1_id = SNK.clientId;
        updateData.p1_last_seen_at = now;
        conditionField = 'player1_id';
    } else {
        alert('房間已滿'); return;
    }

    let query = SNK.sbClient.from('snooker_rooms').update(updateData).eq('id', room.id);
    if (conditionField) query = query.is(conditionField, null);

    const { data: updatedRows, error: updateErr } = await query.select();
    if (updateErr) { alert('加入失敗：' + updateErr.message); return; }
    if (!updatedRows || updatedRows.length === 0) {
        alert('位置剛被搶走，請重新選擇');
        fetchLobbyRooms();
        return;
    }

    SNK.hasSeat = true;
    SNK.roomKey = roomKey;
    SNK.roomUuid = room.id;
    SNK.playerNo = playerNo;
    SNK.appliedShotIds.clear();
    SNK.currentRoundId = room.round_id || 0;
    console.log('[SNK] Joined as P' + playerNo, 'UUID:', room.id);

    window.snookerOnlineMode = true;
    window.snookerMyPlayer = playerNo;
    window._snookerApplyingNetwork = false;

    enterRoomView(Object.assign(room, updatedRows[0]));
    subscribeToRoom();
    subscribeToShots();

    // Fetch existing shots if game is in progress
    if (room.status === 'playing') await fetchAndApplyShots();

    startHeartbeat();
}

// === Room View ===

function enterRoomView(room) {
    document.getElementById('snk-online-lobby')?.classList.add('hidden');
    document.getElementById('snk-online-room')?.classList.remove('hidden');
    renderRoomState(room);
}

function renderRoomState(room) {
    if (!room) return;

    // Kicked detection
    if (SNK.hasSeat && SNK.playerNo !== null && SNK.roomUuid) {
        const myId = SNK.playerNo === 0 ? room.player0_id : room.player1_id;
        if (myId !== SNK.clientId) {
            console.log('[SNK] KICKED');
            alert('你已被系統移出房間');
            cleanupAndReturnToLobby();
            return;
        }
    }

    // New round detection
    const newRoundId = room.round_id || 0;
    if (SNK.currentRoundId !== null && newRoundId !== SNK.currentRoundId) {
        console.log('[SNK] New round detected:', SNK.currentRoundId, '->', newRoundId);
        if (typeof window.snookerOnlineResetGame === 'function') window.snookerOnlineResetGame();
    }
    SNK.currentRoundId = newRoundId;

    window.currentSnookerRoom = room;

    // Update room UI
    const roomIdEl = document.getElementById('snk-current-room-id');
    const roleEl = document.getElementById('snk-my-role');
    if (roomIdEl) roomIdEl.textContent = SNK.roomKey;
    if (roleEl) roleEl.textContent = `P${SNK.playerNo + 1}`;

    const hasOpponent = room.player0_id && room.player1_id;
    const waitEl = document.getElementById('snk-waiting-msg');
    if (waitEl) {
        waitEl.style.display = hasOpponent ? 'none' : 'block';
        waitEl.textContent = hasOpponent ? '' : '等待對手加入…';
    }

    const readyArea = document.getElementById('snk-ready-area');
    const p0ReadyEl = document.getElementById('snk-p0-ready');
    const p1ReadyEl = document.getElementById('snk-p1-ready');
    const readyBtn = document.getElementById('snk-ready-btn');

    if (room.status === 'waiting') {
        if (readyArea) readyArea.classList.remove('hidden');
        if (p0ReadyEl) p0ReadyEl.textContent = `P1：${room.player0_id ? (room.player0_ready ? '已準備' : '未準備') : '空位'}`;
        if (p1ReadyEl) p1ReadyEl.textContent = `P2：${room.player1_id ? (room.player1_ready ? '已準備' : '未準備') : '空位'}`;
        if (readyBtn) {
            const myReady = SNK.playerNo === 0 ? room.player0_ready : room.player1_ready;
            readyBtn.textContent = myReady ? '取消準備' : '準備';
            readyBtn.disabled = !hasOpponent;
        }
    } else {
        if (readyArea) readyArea.classList.add('hidden');
    }

    const statusBadge = document.getElementById('snk-game-status');
    if (statusBadge) {
        if (room.status === 'playing') {
            statusBadge.textContent = room.current_player !== null
                ? `輪到 P${room.current_player + 1}`
                : '對戰中';
        } else if (room.status === 'finished') {
            statusBadge.textContent = room.winner !== null
                ? `P${room.winner + 1} 勝出！`
                : '已結束';
        } else {
            statusBadge.textContent = '等待中';
        }
    }

    const gameOverActions = document.getElementById('snk-game-over-actions');
    if (gameOverActions) gameOverActions.classList.toggle('hidden', room.status !== 'finished');

    // Notify game of new room state
    if (typeof window.snookerOnlineRoomUpdate === 'function') window.snookerOnlineRoomUpdate(room);
}

// === Ready ===

async function toggleReady() {
    if (!SNK.sbClient || !SNK.roomUuid) return;

    const { data: room } = await SNK.sbClient
        .from('snooker_rooms').select('*').eq('id', SNK.roomUuid).single();
    if (!room || !room.player0_id || !room.player1_id) { alert('請等待對手加入'); return; }

    const field = SNK.playerNo === 0 ? 'player0_ready' : 'player1_ready';
    await SNK.sbClient.from('snooker_rooms')
        .update({ [field]: !room[field] })
        .eq('id', SNK.roomUuid);
}

// === Shot Transmission ===

async function transmitShot(snapshot) {
    if (!SNK.sbClient || !SNK.roomUuid) return;

    const room = window.currentSnookerRoom;
    if (!room || room.status !== 'playing') return;

    const shotNo = (room.shot_count || 0) + 1;

    console.log('[SNK] Transmitting shot #' + shotNo, 'player:', SNK.playerNo);

    const { data, error } = await SNK.sbClient
        .from('snooker_shots')
        .insert([{
            room_id: SNK.roomUuid,
            shot_no: shotNo,
            player_no: SNK.playerNo,
            game_mode: SNK.gameMode,
            result: snapshot
        }])
        .select('id')
        .single();

    if (error) {
        console.error('[SNK] Transmit error:', error);
        return;
    }

    console.log('[SNK] Shot transmitted, id:', data?.id);

    // Update shot_count + current_player on room
    const nextPlayer = snapshot.currentPlayer !== undefined
        ? snapshot.currentPlayer
        : (1 - SNK.playerNo);

    await SNK.sbClient.from('snooker_rooms')
        .update({
            shot_count: shotNo,
            current_player: nextPlayer,
            last_activity_at: new Date().toISOString(),
        })
        .eq('id', SNK.roomUuid);
}

// === Realtime Subscriptions ===

function subscribeToRoom() {
    if (!SNK.sbClient || !SNK.roomUuid) return;
    if (SNK.roomChannel) SNK.sbClient.removeChannel(SNK.roomChannel);

    SNK.roomChannel = SNK.sbClient
        .channel(`snk-room-${SNK.roomUuid}`)
        .on('postgres_changes', {
            event: '*', schema: 'public', table: 'snooker_rooms',
            filter: `id=eq.${SNK.roomUuid}`
        }, (payload) => {
            if (payload.new) renderRoomState(payload.new);
        })
        .subscribe((status) => console.log('[SNK RT-ROOM]', status));
}

function subscribeToShots() {
    if (!SNK.sbClient || !SNK.roomUuid) return;
    if (SNK.shotsChannel) SNK.sbClient.removeChannel(SNK.shotsChannel);

    SNK.shotsChannel = SNK.sbClient
        .channel(`snk-shots-${SNK.roomUuid}`)
        .on('postgres_changes', {
            event: 'INSERT', schema: 'public', table: 'snooker_shots',
            filter: `room_id=eq.${SNK.roomUuid}`
        }, (payload) => {
            const shot = payload.new;
            if (!shot || !shot.id) return;
            if (SNK.appliedShotIds.has(shot.id)) {
                console.log('[SNK RT-SHOTS] Skipping duplicate:', shot.id);
                return;
            }
            // Only apply if it's from the opponent
            if (shot.player_no !== SNK.playerNo) {
                console.log('[SNK RT-SHOTS] Applying opponent shot #' + shot.shot_no);
                applyIncomingShot(shot);
            } else {
                console.log('[SNK RT-SHOTS] Own shot echo, marking applied:', shot.id);
                SNK.appliedShotIds.add(shot.id);
            }
        })
        .subscribe((status) => console.log('[SNK RT-SHOTS]', status));
}

function applyIncomingShot(shot) {
    SNK.appliedShotIds.add(shot.id);
    const snapshot = shot.result;
    if (!snapshot) return;

    console.log('[SNK] applyIncomingShot, snapshot currentPlayer:', snapshot.currentPlayer);

    if (typeof window.applyNetworkSnookerShot !== 'function') {
        console.warn('[SNK] applyNetworkSnookerShot not defined by game');
        return;
    }

    window._snookerApplyingNetwork = true;
    try {
        window.applyNetworkSnookerShot(snapshot);
    } finally {
        window._snookerApplyingNetwork = false;
    }
}

async function fetchAndApplyShots() {
    if (!SNK.sbClient || !SNK.roomUuid) return;

    const { data: shots, error } = await SNK.sbClient
        .from('snooker_shots')
        .select('*')
        .eq('room_id', SNK.roomUuid)
        .order('shot_no', { ascending: true });

    if (error) { console.error('[SNK Fetch] Error:', error); return; }
    console.log('[SNK Fetch] Shots count:', shots?.length || 0);

    if (shots && shots.length > 0) {
        // Apply the latest snapshot (it's the authoritative current state)
        const latest = shots[shots.length - 1];
        if (!SNK.appliedShotIds.has(latest.id)) {
            applyIncomingShot(latest);
        }
    }
}

// === Heartbeat ===

function startHeartbeat() {
    stopHeartbeat();
    SNK.heartbeatInterval = setInterval(async () => {
        if (!SNK.sbClient || !SNK.roomUuid) return;
        const field = SNK.playerNo === 0 ? 'p0_last_seen_at' : 'p1_last_seen_at';
        await SNK.sbClient.from('snooker_rooms')
            .update({ [field]: new Date().toISOString() })
            .eq('id', SNK.roomUuid);
    }, 15000);
}

function stopHeartbeat() {
    if (SNK.heartbeatInterval) clearInterval(SNK.heartbeatInterval);
    SNK.heartbeatInterval = null;
}

// === Exit Room ===

async function exitRoom() {
    if (!SNK.sbClient || !SNK.roomUuid) { cleanupAndReturnToLobby(); return; }

    const room = window.currentSnookerRoom;
    if (room && room.status === 'playing') {
        if (!confirm('退出將會判負，確定要退出嗎？')) return;
    }

    stopHeartbeat();

    const updateData = { last_activity_at: new Date().toISOString() };
    if (SNK.playerNo === 0) {
        updateData.player0_id = null;
        updateData.player0_ready = false;
    } else {
        updateData.player1_id = null;
        updateData.player1_ready = false;
    }

    if (room?.status === 'playing') {
        updateData.status = 'finished';
        updateData.winner = 1 - SNK.playerNo;
        updateData.finished_reason = 'opponent_left';
    }

    await SNK.sbClient.from('snooker_rooms').update(updateData).eq('id', SNK.roomUuid);
    cleanupAndReturnToLobby();
}

function cleanupAndReturnToLobby() {
    stopHeartbeat();
    if (SNK.roomChannel) SNK.sbClient?.removeChannel(SNK.roomChannel);
    if (SNK.shotsChannel) SNK.sbClient?.removeChannel(SNK.shotsChannel);

    SNK.roomKey = null;
    SNK.roomUuid = null;
    SNK.playerNo = null;
    SNK.roomChannel = null;
    SNK.shotsChannel = null;
    SNK.appliedShotIds.clear();
    SNK.hasSeat = false;
    window.currentSnookerRoom = null;
    window.snookerOnlineMode = false;
    window.snookerMyPlayer = null;

    document.getElementById('snk-online-room')?.classList.add('hidden');
    document.getElementById('snk-online-lobby')?.classList.remove('hidden');
    fetchLobbyRooms();
}

// === Rematch ===

async function snookerRematch() {
    if (!SNK.sbClient || !SNK.roomUuid) return;

    const newRoundId = (window.currentSnookerRoom?.round_id || 0) + 1;

    await SNK.sbClient.from('snooker_shots').delete().eq('room_id', SNK.roomUuid);
    await SNK.sbClient.from('snooker_rooms').update({
        status: 'waiting',
        player0_ready: false,
        player1_ready: false,
        current_player: null,
        shot_count: 0,
        winner: null,
        finished_reason: null,
        round_id: newRoundId,
    }).eq('id', SNK.roomUuid);
}

// === Expose Globals ===

window.initSnookerOnline = initSnookerOnline;
window.snookerJoinRoom = joinRoom;
window.snookerExitRoom = exitRoom;
window.snookerToggleReady = toggleReady;
window.snookerRematch = snookerRematch;
window.fetchSnookerLobby = fetchLobbyRooms;

// Lobby auto-refresh every 5 seconds when lobby is visible
setInterval(() => {
    if (document.getElementById('snk-online-lobby') &&
        !document.getElementById('snk-online-lobby').classList.contains('hidden') &&
        !SNK.roomUuid) {
        fetchLobbyRooms();
    }
}, 5000);
