/**
 * Big2 Online Mode - DB-Driven via Supabase Realtime
 */

const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";
const FIXED_ROOMS = ["ROOM01", "ROOM02", "ROOM03"];

const OnlineState = {
    sbClient: null,
    roomKey: null,
    roomUuid: null,
    playerIndex: null, // 0, 1, 2, or 3
    roomChannel: null,
    actionsChannel: null,
    clientId: null,
    heartbeatInterval: null,
    lobbyInterval: null,      // tracked to prevent accumulation on re-init
    roomPollInterval: null,   // polls room state while waiting (realtime is unreliable)
    appliedActionIds: new Set(),
    actionQueue: [], // For sorting actions
    isProcessingActions: false,
    hasSeat: false,
    isStartingGame: false,
    lastKnownRoom: null, // Keep track of latest room state
    hostIndex: 0, // Dynamic host
};

function initOnlineMode() {
    OnlineState.clientId = localStorage.getItem('big2_clientId');
    if (!OnlineState.clientId) {
        OnlineState.clientId = crypto.randomUUID();
        localStorage.setItem('big2_clientId', OnlineState.clientId);
    }
    console.log('[Online] ClientId:', OnlineState.clientId);

    // Only create client once; on re-entry reuse the existing instance
    if (OnlineState.sbClient) {
        console.log('[Online] Supabase already initialized, reusing client');
    } else if (window.supabase && window.supabase.createClient) {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
        });
        OnlineState.sbClient = client;
        window.supabase = client; // allow app.js to use window.supabase.from
        console.log('[Online] Supabase initialized');
    } else if (window.supabase && window.supabase.from) {
        // window.supabase was already replaced with the client instance
        OnlineState.sbClient = window.supabase;
        console.log('[Online] Supabase client recovered from window.supabase');
    } else {
        console.error('[Online] Supabase SDK not loaded');
        return;
    }

    // Expose globals
    window.joinFixedRoom = joinFixedRoom;
    window.exitFixedRoom = exitFixedRoom;
    window.toggleReady = toggleReady;
    window.handleOnlineAction = handleOnlineAction;

    // Guard: register the unload handler only once even on re-init.
    // Use fetch({keepalive:true}) to survive page unload — the async
    // exitFixedRoom() would be killed before completing.
    if (!OnlineState._unloadRegistered) {
        OnlineState._unloadRegistered = true;
        window.addEventListener('beforeunload', () => {
            if (!OnlineState.roomUuid || OnlineState.playerIndex === null) return;
            const idx = OnlineState.playerIndex;
            const body = JSON.stringify({
                [`player${idx}_id`]: null,
                [`player${idx}_ready`]: false,
                last_activity_at: new Date().toISOString(),
            });
            try {
                fetch(`${SUPABASE_URL}/rest/v1/big2_rooms?id=eq.${OnlineState.roomUuid}`, {
                    method: 'PATCH', keepalive: true,
                    headers: {
                        'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json', 'Prefer': 'return=minimal',
                    },
                    body,
                });
            } catch (_) { /* best effort */ }
        });
    }

    // Override isOnlineHost in app.js
    window.isOnlineHost = function() {
        if (window.gameMode !== 'online') return true;
        return window.onlinePlayerIndex === OnlineState.hostIndex;
    };

    fetchLobbyRooms();

    // Auto refresh lobby — clear any previous interval to prevent accumulation
    if (OnlineState.lobbyInterval) clearInterval(OnlineState.lobbyInterval);
    OnlineState.lobbyInterval = setInterval(() => {
        const lobbyEl = document.getElementById('online-lobby');
        if (lobbyEl && !lobbyEl.classList.contains('hidden')) {
            fetchLobbyRooms();
        }
    }, 3000);
}

async function fetchLobbyRooms() {
    if (!OnlineState.sbClient) return;

    const { data: rooms, error } = await OnlineState.sbClient
        .from('big2_rooms')
        .select('*')
        .in('room_code', FIXED_ROOMS);

    if (error) {
        console.error('[Lobby] Error:', error);
        return;
    }

    FIXED_ROOMS.forEach(key => {
        const room = rooms?.find(r => r.room_code === key);
        updateRoomCardUI(key, room);
    });
}

function updateRoomCardUI(roomKey, room) {
    const statusEl = document.getElementById(`room-status-${roomKey}`);
    const playersEl = document.getElementById(`room-players-${roomKey}`);
    const joinBtn = document.getElementById(`room-join-${roomKey}`);
    if (!statusEl) return;

    if (!room) {
        statusEl.textContent = 'Room Not Found';
        joinBtn.disabled = true;
        return;
    }

    const statusMap = { 'waiting': 'Waiting', 'playing': 'Playing', 'finished': 'Finished' };
    statusEl.textContent = statusMap[room.status] || room.status;

    let count = 0;
    if (room.player0_id) count++;
    if (room.player1_id) count++;
    if (room.player2_id) count++;
    if (room.player3_id) count++;

    playersEl.textContent = `${count} / 4 Players`;

    const isFull = count === 4;
    const amIIn = room.player0_id === OnlineState.clientId ||
        room.player1_id === OnlineState.clientId ||
        room.player2_id === OnlineState.clientId ||
        room.player3_id === OnlineState.clientId;

    joinBtn.disabled = isFull && !amIIn;
    joinBtn.textContent = amIIn ? 'Return' : isFull ? 'Full' : 'Join';
}

async function joinFixedRoom(roomKey) {
    if (!OnlineState.sbClient) return;

    const { data: room, error } = await OnlineState.sbClient
        .from('big2_rooms')
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !room) {
        showOnlineToast('Room not found', 'error');
        return;
    }

    let seatIndex = -1;
    let updateData = { last_activity_at: new Date().toISOString() };
    const now = new Date().toISOString();
    let conditionField = null;

    // Check if rejoining
    if (room.player0_id === OnlineState.clientId) seatIndex = 0;
    else if (room.player1_id === OnlineState.clientId) seatIndex = 1;
    else if (room.player2_id === OnlineState.clientId) seatIndex = 2;
    else if (room.player3_id === OnlineState.clientId) seatIndex = 3;

    if (seatIndex !== -1) {
        // Rejoining
        updateData[`p${seatIndex}_last_seen_at`] = now;
    } else {
        // Find empty seat
        if (!room.player0_id) seatIndex = 0;
        else if (!room.player1_id) seatIndex = 1;
        else if (!room.player2_id) seatIndex = 2;
        else if (!room.player3_id) seatIndex = 3;

        if (seatIndex === -1) {
            showOnlineToast('Room is full', 'warn');
            return;
        }

        updateData[`player${seatIndex}_id`] = OnlineState.clientId;
        updateData[`p${seatIndex}_last_seen_at`] = now;
        conditionField = `player${seatIndex}_id`;
    }

    let query = OnlineState.sbClient.from('big2_rooms').update(updateData).eq('id', room.id);
    if (conditionField) query = query.is(conditionField, null);

    const { data: updatedRows, error: updateErr } = await query.select();

    if (updateErr || !updatedRows || updatedRows.length === 0) {
        showOnlineToast('Failed to join — seat may have been taken', 'warn');
        fetchLobbyRooms();
        return;
    }

    Object.assign(room, updatedRows[0]);

    // If we claimed a NEW slot in a stuck non-waiting room (e.g. both players
    // left without proper cleanup), reset it to waiting so we don't inherit
    // stale 'playing'/'finished' state.
    if (conditionField && room.status !== 'waiting') {
        const resetData = {
            status: 'waiting',
            initial_deck: null,
            current_player_index: null,
            finished_reason: null,
        };
        for (let i = 0; i < 4; i++) {
            resetData[`player${i}_ready`] = false;
        }
        await OnlineState.sbClient.from('big2_rooms').update(resetData).eq('id', room.id);
        // Also clear stale actions
        await OnlineState.sbClient.rpc('cleanup_big2_actions', { p_room_id: room.id, p_client_id: OnlineState.clientId });
        // Re-fetch fresh state
        const { data: freshRoom } = await OnlineState.sbClient.from('big2_rooms').select('*').eq('id', room.id).single();
        if (freshRoom) Object.assign(room, freshRoom);
    }

    OnlineState.hasSeat = true;
    OnlineState.roomKey = roomKey;
    OnlineState.roomUuid = room.id;
    OnlineState.playerIndex = seatIndex;
    window.onlinePlayerIndex = seatIndex;

    enterRoomView(room);
    subscribeToRoom();
    subscribeToActions();

    startHeartbeat();
    startRoomPoll();
}

function enterRoomView(room) {
    if (window.setMode) window.setMode('online');

    // Hide lobby, show room
    document.getElementById('landing-page')?.classList.add('hidden');
    document.getElementById('online-lobby')?.classList.add('hidden');
    document.getElementById('online-room')?.classList.remove('hidden');
    document.getElementById('game-container')?.classList.remove('hidden');

    renderRoomState(room);
}

function startHeartbeat() {
    stopHeartbeat();
    OnlineState.heartbeatInterval = setInterval(async () => {
        if (!OnlineState.sbClient || !OnlineState.roomUuid || OnlineState.playerIndex === null) return;
        const updateField = `p${OnlineState.playerIndex}_last_seen_at`;
        await OnlineState.sbClient.from('big2_rooms')
            .update({ [updateField]: new Date().toISOString() })
            .eq('id', OnlineState.roomUuid);
    }, 15000);
}

function stopHeartbeat() {
    if (OnlineState.heartbeatInterval) clearInterval(OnlineState.heartbeatInterval);
    OnlineState.heartbeatInterval = null;
}

// ── Room-view poll (backup for unreliable realtime) ─────────────────────────
// While players are in the waiting room, realtime delivery may be dropped.
// Polling every 3s ensures all clients see join/ready state updates and the
// Start Game button becomes clickable.

function startRoomPoll() {
    stopRoomPoll();
    OnlineState.roomPollInterval = setInterval(async () => {
        if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
        const { data: room } = await OnlineState.sbClient
            .from('big2_rooms').select('*').eq('id', OnlineState.roomUuid).single();
        if (!room) return;
        if (room.status === 'waiting') {
            renderRoomState(room);
        } else {
            // Room transitioned away from waiting (e.g. to playing).
            // Render once so clients that missed the realtime event can
            // pick up the transition, then stop polling.
            renderRoomState(room);
            stopRoomPoll();
        }
    }, 3000);
}

function stopRoomPoll() {
    clearInterval(OnlineState.roomPollInterval);
    OnlineState.roomPollInterval = null;
}

function renderRoomState(room) {
    if (!room) return;
    window.currentRoom = room;
    OnlineState.lastKnownRoom = room;

    // Sticky host: keep the current host unless they are stale or gone,
    // then fall back to the lowest-index active player. This prevents
    // host flapping when heartbeats are slightly delayed.
    const now = Date.now();
    const currentHost = OnlineState.hostIndex;
    let currentHostOk = false;
    if (currentHost !== null && currentHost >= 0 && room[`player${currentHost}_id`]) {
        const seenStr = room[`p${currentHost}_last_seen_at`];
        currentHostOk = seenStr ? (now - new Date(seenStr).getTime() <= 25000) : false;
    }
    if (!currentHostOk) {
        let bestHost = -1;
        for (let i = 0; i < 4; i++) {
            if (room[`player${i}_id`]) {
                const seenStr = room[`p${i}_last_seen_at`];
                const isStale = seenStr ? (now - new Date(seenStr).getTime() > 25000) : true;
                if (!isStale) { bestHost = i; break; }
            }
        }
        if (bestHost === -1 && OnlineState.playerIndex !== null) {
            bestHost = OnlineState.playerIndex;
        }
        OnlineState.hostIndex = bestHost;
    }

    const roomIdEl = document.getElementById('current-room-id');
    const roleEl = document.getElementById('my-role');
    if (roomIdEl) roomIdEl.textContent = OnlineState.roomKey;
    if (roleEl) {
        let roleText = `Seat ${OnlineState.playerIndex + 1}`;
        if (window.isOnlineHost()) roleText += ' (HOST)';
        roleEl.textContent = roleText;
    }

    const statuses = [
        room.player0_id ? (room.player0_ready ? 'Ready' : 'Not Ready') : 'Empty',
        room.player1_id ? (room.player1_ready ? 'Ready' : 'Not Ready') : 'Empty',
        room.player2_id ? (room.player2_ready ? 'Ready' : 'Not Ready') : 'Empty',
        room.player3_id ? (room.player3_ready ? 'Ready' : 'Not Ready') : 'Empty'
    ];

    for (let i = 0; i < 4; i++) {
        const el = document.getElementById(`p${i}-ready-status`);
        if (el) el.textContent = `P${i + 1}: ${statuses[i]}`;
    }

    const readyBtn = document.getElementById('toggle-ready-btn');
    if (readyBtn) {
        const myReady = room[`player${OnlineState.playerIndex}_ready`];
        readyBtn.textContent = myReady ? 'Cancel Ready' : 'Ready';

        const occupiedStatuses = statuses.filter(s => s !== 'Empty');
        // Big2 requires exactly 4 players
        const allReady = occupiedStatuses.length === 4 && occupiedStatuses.every(s => s === 'Ready');

        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            if (room.status === 'waiting' && allReady && window.isOnlineHost()) {
                startBtn.classList.remove('hidden');
            } else {
                startBtn.classList.add('hidden');
            }
        }
    }

    // Show rematch button when game is finished
    const rematchBtn = document.getElementById('rematch-btn');
    if (rematchBtn) rematchBtn.classList.toggle('hidden', room.status !== 'finished');

    if (room.status === 'playing') {
        document.getElementById('ready-status')?.classList.add('hidden');
        if (window.handleRoomSync) window.handleRoomSync(room);
    } else {
        document.getElementById('ready-status')?.classList.remove('hidden');
    }
}

let _readyDebouncing = false;
async function toggleReady() {
    if (_readyDebouncing) return;
    if (!OnlineState.sbClient || !OnlineState.roomUuid || OnlineState.playerIndex === null) return;
    _readyDebouncing = true;

    const { data: room } = await OnlineState.sbClient.from('big2_rooms').select('*').eq('id', OnlineState.roomUuid).single();
    if (!room) { _readyDebouncing = false; return; }

    const myReadyField = `player${OnlineState.playerIndex}_ready`;
    const newReady = !room[myReadyField];

    const { error } = await OnlineState.sbClient.from('big2_rooms').update({ [myReadyField]: newReady }).eq('id', OnlineState.roomUuid);
    if (error) { console.error('[Online] toggleReady error:', error); _readyDebouncing = false; return; }

    // Don't rely solely on realtime to drive the Start Game button.
    // Re-fetch and run renderRoomState immediately so the last player
    // to click Ready can see the Start Game button without waiting for
    // a Supabase realtime delivery that may be slow or dropped.
    const { data: fresh } = await OnlineState.sbClient.from('big2_rooms').select('*').eq('id', OnlineState.roomUuid).single();
    if (fresh) renderRoomState(fresh);

    setTimeout(() => { _readyDebouncing = false; }, 1000);
}

async function forceStartGame() {
    if (!OnlineState.isStartingGame) {
        OnlineState.isStartingGame = true;
        await startGameFromHost();
        setTimeout(() => OnlineState.isStartingGame = false, 3000);
    }
}

// Logic triggered by Host (P0 or whoever is making everyone ready)
async function startGameFromHost() {
    // Deck is now generated server-side in start_big2_game RPC — no client shuffle needed.
    const { data, error } = await OnlineState.sbClient.rpc('start_big2_game', {
        p_room_id:   OnlineState.roomUuid,
        p_client_id: OnlineState.clientId,
    });
    if (error) { console.error('[Online] startGame RPC error:', error); return; }
    if (data?.skipped) { console.log('[Online] startGame skipped – already started'); return; }

    // Clean up old actions only after the RPC succeeds, so we don't destroy
    // previous game history if the start fails.
    await OnlineState.sbClient.rpc('cleanup_big2_actions', { p_room_id: OnlineState.roomUuid, p_client_id: OnlineState.clientId });
    OnlineState.appliedActionIds.clear();
    OnlineState.actionQueue = [];
}

function subscribeToRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    if (OnlineState.roomChannel) OnlineState.sbClient.removeChannel(OnlineState.roomChannel);

    OnlineState.roomChannel = OnlineState.sbClient.channel(`room-${OnlineState.roomUuid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'big2_rooms', filter: `id=eq.${OnlineState.roomUuid}` }, async (payload) => {
            if (payload.new) {
                // If transitioning to playing, fetch missing history first (#2, #3)
                const isNewlyPlaying = payload.new.status === 'playing' && OnlineState.lastKnownRoom?.status !== 'playing';
                OnlineState.lastKnownRoom = payload.new;
                
                if (isNewlyPlaying) {
                    await syncHistoricalActions();
                }
                
                renderRoomState(payload.new);
            }
        }).subscribe();
}

async function syncHistoricalActions() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    // Clear local tracking before syncing to avoid stale dedup entries
    OnlineState.appliedActionIds.clear();
    OnlineState.actionQueue = [];

    const { data: actions, error } = await OnlineState.sbClient
        .from('big2_actions')
        .select('*')
        .eq('room_id', OnlineState.roomUuid)
        .order('action_no', { ascending: true });

    if (!error && actions) {
        for (const act of actions) {
            queueAction(act);
        }
        await processActionQueue();
    }
}

function queueAction(action) {
    if (!action || !action.id || OnlineState.appliedActionIds.has(action.id)) return;
    // Evict oldest entries to prevent unbounded memory growth, keeping recent 250
    if (OnlineState.appliedActionIds.size > 500) {
        const ids = [...OnlineState.appliedActionIds];
        OnlineState.appliedActionIds = new Set(ids.slice(-250));
    }
    OnlineState.appliedActionIds.add(action.id);
    
    // Insert in sorted position by action_no (O(n) vs sort's O(n log n))
    const queue = OnlineState.actionQueue;
    const no = action.action_no;
    let i = queue.length;
    while (i > 0 && queue[i - 1].action_no > no) { i--; }
    queue.splice(i, 0, action);
}

async function processActionQueue() {
    if (OnlineState.isProcessingActions) return;
    OnlineState.isProcessingActions = true;

    try {
        while (OnlineState.actionQueue.length > 0) {
            const action = OnlineState.actionQueue.shift();
            if (window.applyNetworkAction) {
                window.applyNetworkAction(action);
            }
            // Small delay to let UI render if there are many queued actions
            await new Promise(r => setTimeout(r, 50));
        }
    } catch (e) {
        console.error('[Online] processActionQueue error:', e);
    } finally {
        OnlineState.isProcessingActions = false;
    }
}

window.cleanupBig2Actions = async function() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    await OnlineState.sbClient.rpc('cleanup_big2_actions', { p_room_id: OnlineState.roomUuid, p_client_id: OnlineState.clientId });
};

window.clearAppliedActions = function() {
    OnlineState.appliedActionIds.clear();
    OnlineState.actionQueue = [];
};

function subscribeToActions() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    if (OnlineState.actionsChannel) OnlineState.sbClient.removeChannel(OnlineState.actionsChannel);

    OnlineState.actionsChannel = OnlineState.sbClient.channel(`actions-${OnlineState.roomUuid}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'big2_actions', filter: `room_id=eq.${OnlineState.roomUuid}` }, (payload) => {
            const action = payload.new;
            if (action) {
                queueAction(action);
                processActionQueue();
            }
        }).subscribe();
}

async function handleOnlineAction(actionType, payloadObj, actPlayerIndex = null) {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return false;
    const room = window.currentRoom;
    if (!room || room.status !== 'playing') {
        console.warn('[Online] Game is not playing, ignoring action');
        return false;
    }

    const pIndex = actPlayerIndex !== null ? actPlayerIndex : OnlineState.playerIndex;

    // Route through server-validated RPC (seat ownership + turn check)
    const { data, error } = await OnlineState.sbClient.rpc('submit_big2_action', {
        p_room_id:      OnlineState.roomUuid,
        p_client_id:    OnlineState.clientId,
        p_player_index: pIndex,
        p_action_type:  actionType,
        p_payload:      payloadObj ?? {},
    });

    if (error) {
        console.error('[Online] Action RPC error:', error);
        showOnlineToast('Action failed: ' + (error.message || 'unknown error'), 'error');
        return false;
    }
    if (data?.error) {
        console.warn('[Online] Action rejected:', data.error);
        if (data.error === 'not_your_turn') showOnlineToast('唔係你嘅回合！', 'warn');
        else showOnlineToast('Action failed: ' + data.error, 'warn');
        return false;
    }

    return true;
}

async function exitFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) { cleanupAndReturnToLobby(); return; }

    // Confirm if game is in progress
    const room = window.currentRoom;
    if (room && room.status === 'playing') {
        if (!confirm('退出將會結束遊戲，確定要退出嗎？')) return;
    }

    stopHeartbeat();

    const { data: currentRoom } = await OnlineState.sbClient.from('big2_rooms').select('*').eq('id', OnlineState.roomUuid).single();

    const updateData = { last_activity_at: new Date().toISOString() };
    if (OnlineState.playerIndex !== null) {
        updateData[`player${OnlineState.playerIndex}_id`] = null;
        updateData[`player${OnlineState.playerIndex}_ready`] = false;
    }

    if (currentRoom) {
        let otherPlayers = 0;
        for (let i = 0; i < 4; i++) {
            if (i !== OnlineState.playerIndex && currentRoom[`player${i}_id`]) {
                otherPlayers++;
            }
        }

        if (otherPlayers === 0) {
            updateData.status = 'waiting';
            updateData.initial_deck = null;
            updateData.finished_reason = null;
            updateData.current_player_index = null;
        } else if (currentRoom.status === 'playing') {
            updateData.status = 'finished';
            updateData.finished_reason = 'opponent_left';
        }
        // Fix #9: If room is already waiting or finished, do NOT change it to finished!
        // We just leave it as waiting so others can still join.
    }

    await OnlineState.sbClient.from('big2_rooms').update(updateData).eq('id', OnlineState.roomUuid);
    cleanupAndReturnToLobby();
}

function cleanupAndReturnToLobby() {
    stopHeartbeat();
    stopRoomPoll();
    if (OnlineState.roomChannel) OnlineState.sbClient?.removeChannel(OnlineState.roomChannel);
    if (OnlineState.actionsChannel) OnlineState.sbClient?.removeChannel(OnlineState.actionsChannel);

    OnlineState.roomKey = null;
    OnlineState.roomUuid = null;
    OnlineState.playerIndex = null;
    OnlineState.roomChannel = null;
    OnlineState.actionsChannel = null;
    OnlineState.appliedActionIds.clear();
    OnlineState.actionQueue = [];
    OnlineState.lastKnownRoom = null;
    OnlineState.isStartingGame = false;
    OnlineState.isProcessingActions = false;
    OnlineState.hasSeat = false;
    window.currentRoom = null;
    window.onlinePlayerIndex = null;

    if (window.setMode) window.setMode('online-lobby');
    fetchLobbyRooms();
}

// ─── Rematch ─────────────────────────────────────────────────────────────────
// Reset the room back to waiting so players can Ready up again.

async function rematchGame() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    // Clean up old actions
    await OnlineState.sbClient.rpc('cleanup_big2_actions', { p_room_id: OnlineState.roomUuid, p_client_id: OnlineState.clientId });
    OnlineState.appliedActionIds.clear();
    OnlineState.actionQueue = [];

    // Reset room to waiting — only if it's genuinely finished (race-safe)
    const { error } = await OnlineState.sbClient.from('big2_rooms').update({
        status: 'waiting',
        player0_ready: false,
        player1_ready: false,
        player2_ready: false,
        player3_ready: false,
        initial_deck: null,
        current_player_index: null,
        finished_reason: null,
    }).eq('id', OnlineState.roomUuid).eq('status', 'finished');

    if (error) { console.error('[Online] rematch error:', error); return; }

    // Restart room polling for the new waiting phase
    startRoomPoll();

    // Re-fetch to update UI immediately
    const { data: fresh } = await OnlineState.sbClient.from('big2_rooms').select('*').eq('id', OnlineState.roomUuid).single();
    if (fresh) renderRoomState(fresh);
}

// Expose
window.initOnlineMode = initOnlineMode;
window.forceStartGame = forceStartGame;
window.rematchGame = rematchGame;
