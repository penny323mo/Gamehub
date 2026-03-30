/**
 * Snooker Online Mode – Supabase Realtime
 * Shared by 2D (app.js) and 3D (main.js).
 *
 * External API consumed by the game:
 *   window.snookerOnlineRoomUpdate({ status, players, myRole })
 *   window.snookerApplyRemoteShot(shot)
 *   window.snookerApplyRemoteStateSnapshot(snapshot, meta)
 *
 * API exposed to the game:
 *   window.snookerJoinRoom(roomKey)
 *   window.snookerExitRoom()
 *   window.snookerToggleReady()
 *   window.snookerSendShot(payload)
 *   window.snookerSendStateSnapshot(snapshot)
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
const SHOT_POLL_MS = 1500;
const ROOM_POLL_MS = 1000;
const MAX_APPLIED_EVENT_IDS = 500;

const SnookerOnline = {
    sbClient:        null,
    roomKey:         null,
    roomUuid:        null,
    playerRole:      null,   // 'player1' | 'player2'
    roomChannel:     null,
    shotsChannel:    null,
    clientId:        null,
    fallbackInsertWarned: false,
    heartbeatInterval: null,
    lobbyInterval:   null,   // tracked so repeated initSnookerOnline() calls don't leak
    roomPollInterval: null,  // polls room state while waiting (realtime is unreliable)
    shotPollInterval: null,  // polls shots during gameplay (realtime can drop messages)
    gameStartedAt:   null,
    appliedShotIds:  new Set(),
    currentRoundId:  null,
    hasSeat:         false,
    gameMode:        '2d',
};

function buildShotEnvelope(kind, payload) {
    return {
        ...(payload || {}),
        kind,
        round_id: SnookerOnline.currentRoundId || 0,
        event_id: crypto.randomUUID(),
        sender_role: SnookerOnline.playerRole,
        sent_at: new Date().toISOString(),
    };
}

function trimAppliedEventIds() {
    if (SnookerOnline.appliedShotIds.size <= MAX_APPLIED_EVENT_IDS) return;
    const ids = [...SnookerOnline.appliedShotIds];
    SnookerOnline.appliedShotIds = new Set(ids.slice(-Math.floor(MAX_APPLIED_EVENT_IDS / 2)));
}

function isShotPayloadForCurrentRound(payload) {
    const payloadRoundId = payload?.round_id;
    if (payloadRoundId == null) {
        return (SnookerOnline.currentRoundId || 0) === 0;
    }
    return payloadRoundId === (SnookerOnline.currentRoundId || 0);
}

function getShotPayload(rawShot) {
    return rawShot?.payload || rawShot || null;
}

function applyIncomingShotEvent(rawShot) {
    if (!rawShot?.id || rawShot.player_role === SnookerOnline.playerRole) return;

    const payload = getShotPayload(rawShot);
    if (!payload || !isShotPayloadForCurrentRound(payload)) return;
    if (SnookerOnline.appliedShotIds.has(rawShot.id)) return;

    trimAppliedEventIds();
    SnookerOnline.appliedShotIds.add(rawShot.id);

    if (payload.kind === 'state_sync') {
        console.log('[SnookerShot] Remote snapshot received:', payload.snapshot?.format || 'unknown');
        if (window.snookerApplyRemoteStateSnapshot) {
            window.snookerApplyRemoteStateSnapshot(payload.snapshot || null, payload);
        }
        return;
    }

    console.log('[SnookerShot] Remote shot received:', payload);
    if (window.snookerApplyRemoteShot) {
        window.snookerApplyRemoteShot(payload);
    }
}

async function fetchMissingShotsOnce() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
    const { data: shots, error } = await SnookerOnline.sbClient
        .from('snooker_shots')
        .select('*')
        .eq('room_id', SnookerOnline.roomUuid)
        .neq('player_role', SnookerOnline.playerRole)
        .order('shot_no', { ascending: true });
    if (error) {
        console.error('[ShotPoll] Fetch error:', error);
        return;
    }
    for (const shot of shots || []) {
        applyIncomingShotEvent(shot);
    }
}

async function persistShotPayload(payload, { label = 'SnookerShot', strictPlaying = false } = {}) {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) {
        return { ok: false, reason: 'not_connected' };
    }

    const { data, error } = await SnookerOnline.sbClient.rpc('submit_snooker_shot', {
        p_room_id:     SnookerOnline.roomUuid,
        p_client_id:   SnookerOnline.clientId,
        p_player_role: SnookerOnline.playerRole,
        p_payload:     payload,
    });
    if (!error && !data?.error) {
        console.log(`[${label}] Sent via RPC:`, payload);
        return { ok: true, transport: 'rpc' };
    }
    if (data?.error) {
        console.warn(`[${label}] Rejected:`, data.error);
        if (strictPlaying || data.error !== 'game_not_playing') {
            showOnlineToast(`同步被拒絕: ${data.error}`, 'warn');
        }
        return { ok: false, reason: data.error };
    }

    const rpcMissing = error?.code === 'PGRST202' || error?.message?.includes('Could not find');
    if (!rpcMissing) {
        console.error(`[${label}] RPC error:`, error);
        showOnlineToast('同步失敗，請重新整理後再試', 'error');
        return { ok: false, reason: error?.message || 'rpc_error' };
    }

    if (!SnookerOnline.fallbackInsertWarned) {
        SnookerOnline.fallbackInsertWarned = true;
        console.warn(`[${label}] submit_snooker_shot RPC missing; falling back to direct insert`);
    }

    const { error: insertError } = await SnookerOnline.sbClient.from('snooker_shots')
        .insert({ room_id: SnookerOnline.roomUuid, player_role: SnookerOnline.playerRole, payload });
    if (insertError) {
        console.error(`[${label}] Direct insert error:`, insertError);
        showOnlineToast('同步失敗，請檢查 Supabase migration', 'error');
        return { ok: false, reason: insertError?.message || 'insert_error' };
    }

    console.log(`[${label}] Sent via direct insert:`, payload);
    return { ok: true, transport: 'direct_insert' };
}

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
    window.snookerSendStateSnapshot = sendStateSnapshot;

    // Register the unload guard only once, even if initSnookerOnline()
    // is called multiple times (e.g. switching 2D ↔ 3D in the hub).
    // Use fetch({keepalive:true}) to survive page unload — the async
    // exitFixedRoom() would be killed before completing.
    if (!SnookerOnline._unloadRegistered) {
        SnookerOnline._unloadRegistered = true;
        window.addEventListener('beforeunload', () => {
            // Skip cleanup during intentional redirects (lobby → game page).
            // Check both in-memory flag AND sessionStorage handoff signal for
            // maximum reliability — the in-memory flag alone can fail if the
            // JS engine doesn't propagate it in time.
            if (SnookerOnline._intentionalRedirect) return;
            // Only honour the handoff flag within a short window (10 s).
            // If the game page never loaded or crashed, this prevents the
            // flag from permanently suppressing seat cleanup in this tab.
            const pendingTs = parseInt(sessionStorage.getItem('snooker_pending_ts') || '0', 10);
            if (sessionStorage.getItem('snooker_pending_room') && (Date.now() - pendingTs) < 10000) return;
            if (!SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
            // BUG FIX (P0 Lifecycle): If the room is playing, don't clear the seat so the player can rejoin
            if (window.snookerCurrentRoom?.status === 'playing') return;

            const body = JSON.stringify({
                p_room_id: SnookerOnline.roomUuid,
                p_client_id: SnookerOnline.clientId
            });
            try {
                fetch(`${SUPABASE_URL}/rest/v1/rpc/exit_snooker_room`, {
                    method: 'POST', keepalive: true,
                    headers: {
                        'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json', 'Prefer': 'return=minimal',
                    },
                    body,
                });
            } catch (_) { /* best effort */ }
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

async function fetchLobbyRooms() {
    if (!SnookerOnline.sbClient) return;

    // Evict seats that haven't sent a heartbeat in 90 s (waiting rooms only).
    const stale = new Date(Date.now() - 90_000).toISOString();
    await Promise.all([
        SnookerOnline.sbClient.from('snooker_rooms')
            .update({ player1_id: null, player1_ready: false, p1_last_seen_at: null })
            .in('room_code', FIXED_ROOMS).eq('status', 'waiting')
            .lt('p1_last_seen_at', stale).not('player1_id', 'is', null),
        SnookerOnline.sbClient.from('snooker_rooms')
            .update({ player2_id: null, player2_ready: false, p2_last_seen_at: null })
            .in('room_code', FIXED_ROOMS).eq('status', 'waiting')
            .lt('p2_last_seen_at', stale).not('player2_id', 'is', null),
    ]);

    const { data: rooms, error } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('room_code, player1_id, player2_id, status, player1_ready, player2_ready, p1_last_seen_at, p2_last_seen_at')
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

    // Show each seat's state; mark as disconnected if heartbeat is stale (>90s)
    const staleMs = 90_000;
    const now = Date.now();
    const p1Stale = room.player1_id && room.status === 'waiting' &&
                    room.p1_last_seen_at &&
                    (now - new Date(room.p1_last_seen_at).getTime()) > staleMs;
    const p2Stale = room.player2_id && room.status === 'waiting' &&
                    room.p2_last_seen_at &&
                    (now - new Date(room.p2_last_seen_at).getTime()) > staleMs;
    const p1Label = !room.player1_id ? 'P1:空' : p1Stale ? 'P1:離' : 'P1:有';
    const p2Label = !room.player2_id ? 'P2:空' : p2Stale ? 'P2:離' : 'P2:有';
    playersEl.textContent = `${p1Label} / ${p2Label}`;

    const isFull = (room.player1_id && !p1Stale) && (room.player2_id && !p2Stale);
    const amIIn  = room.player1_id === SnookerOnline.clientId ||
                   room.player2_id === SnookerOnline.clientId;

    joinBtn.disabled    = isFull && !amIIn;
    joinBtn.textContent = amIIn ? '返回' : isFull ? '已滿' : '加入';
}

// ─── Join ────────────────────────────────────────────────────────────────────

/** Resolve the local player's display name for DB storage. Priority:
 *  1. The #snooker-player-name input (2D lobby),
 *  2. The #player1-name input (3D game page),
 *  3. localStorage 'snooker_player_name',
 *  4. Fallback 'Player'. */
function resolveDisplayName() {
    const lobbyInput  = document.getElementById('snooker-player-name');
    const gameInput   = document.getElementById('player1-name');
    const fromInput   = (lobbyInput?.value || gameInput?.value || '').trim();
    if (fromInput) return fromInput;
    const fromStore   = (localStorage.getItem('snooker_player_name') || '').trim();
    if (fromStore)  return fromStore;
    return 'Player';
}

async function joinFixedRoom(roomKey) {
    if (!SnookerOnline.sbClient) return;

    const { data: room, error } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !room) { showOnlineToast('房間不存在', 'error'); return; }

    const playerName = resolveDisplayName();
    const { data, error: rpcErr } = await SnookerOnline.sbClient.rpc('join_snooker_room', {
        p_room_id: room.id,
        p_client_id: SnookerOnline.clientId,
        p_client_name: playerName
    });

    if (rpcErr || !data || data.error) {
        const errMsg = (rpcErr && rpcErr.message) || (data && data.error);
        console.error('[SnookerOnline] join RPC error:', errMsg);
        if (errMsg === 'room_full') {
            showOnlineToast('房間已滿', 'warn');
        } else {
            showOnlineToast('加入失敗: ' + errMsg, 'error');
        }
        fetchLobbyRooms();
        return;
    }

    const { role, room: freshRoom } = data;
    Object.assign(room, freshRoom);
    SnookerOnline.hasSeat       = true;
    SnookerOnline.roomKey       = roomKey;
    SnookerOnline.roomUuid      = room.id;
    SnookerOnline.playerRole    = role;
    SnookerOnline.currentRoundId = room.round_id || 0;
    SnookerOnline.appliedShotIds.clear();
    SnookerOnline.gameStartedAt = null;

    console.log('[SnookerOnline] Joined as', role, 'in room', roomKey);

    enterRoomView(room);
    subscribeToRoom();
    subscribeToShots();
    startHeartbeat();
    startRoomPoll();
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
    if (roleEl)   roleEl.textContent   = SnookerOnline.playerRole === 'player1' ? 'P1'
                                       : SnookerOnline.playerRole === 'player2' ? 'P2' : '-';

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
        const myReady = SnookerOnline.playerRole === 'player1' ? room.player1_ready
                      : SnookerOnline.playerRole === 'player2' ? room.player2_ready : false;
        readyBtn.textContent = myReady ? '取消準備' : '準備';
        // UX FIX: allow pre-readying even before opponent joins.
        // The game-start check still requires BOTH players ready, so this is safe.
        readyBtn.disabled = !SnookerOnline.playerRole;
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
        // Restart room poll for the new waiting phase — it was stopped when
        // the previous game transitioned away from waiting.
        if (!SnookerOnline.roomPollInterval) startRoomPoll();
    }

    // ── Both players ready → transition to 'playing' ──────────────────────────
    // Either player can trigger this; eq('status','waiting') makes it race-safe
    // so only the first UPDATE wins (the second is a silent no-op).
    // IMPORTANT: we also call snookerOnlineRoomUpdate('playing') directly from
    // the UPDATE callback so the game starts immediately without waiting for a
    // Supabase realtime delivery that may be slow or dropped.
    if (room.status === 'waiting' && room.player1_ready && room.player2_ready &&
        SnookerOnline.roomUuid && SnookerOnline.sbClient) {
        const p1Name = room.player1_name || 'P1';
        const p2Name = room.player2_name || 'P2';
        const myRole = SnookerOnline.playerRole;
        const applyStart = () => {
            SnookerOnline.gameStartedAt = new Date().toISOString();
            sessionStorage.setItem('snooker_active_room', SnookerOnline.roomKey); // Persist for auto-rejoin
            startShotPoll();
            fetchMissingShotsOnce();
            if (window.snookerOnlineRoomUpdate) {
                window.snookerOnlineRoomUpdate({
                    status: 'playing',
                    players: [{ name: p1Name, role: 'player1' }, { name: p2Name, role: 'player2' }],
                    myRole,
                    room
                });
            }
        };
        // Use server-validated RPC, fall back to direct UPDATE if not deployed
        SnookerOnline.sbClient.rpc('start_snooker_game', {
            p_room_id: SnookerOnline.roomUuid, p_client_id: SnookerOnline.clientId,
        }).then(({ data, error }) => {
            if (!error && data?.ok) { applyStart(); return; }
            if (data?.skipped) return;
            // Fallback if RPC not deployed
            if (error?.code === 'PGRST202' || error?.message?.includes('Could not find')) {
                SnookerOnline.sbClient.from('snooker_rooms')
                    .update({ status: 'playing', current_turn: 'player1' })
                    .eq('id', SnookerOnline.roomUuid).eq('status', 'waiting')
                    .then(({ error: e2 }) => { if (!e2) applyStart(); });
            }
        });
        return; // skip the generic notify below; we'll notify via the async callback
    }

    // Start shot recovery polling when we see the playing state
    // (covers the non-trigger player who receives it via realtime/poll)
    if (room.status === 'playing' && !SnookerOnline.shotPollInterval) {
        if (!SnookerOnline.gameStartedAt) SnookerOnline.gameStartedAt = new Date().toISOString();
        startShotPoll();
        fetchMissingShotsOnce();
    }
    // Stop shot polling when game is no longer playing
    if (room.status !== 'playing' && SnookerOnline.shotPollInterval) {
        stopShotPoll();
    }

    // Notify the game for all non-start state changes
    if (window.snookerOnlineRoomUpdate) {
        const p1Name = room.player1_name || 'P1';
        const p2Name = room.player2_name || 'P2';
        window.snookerOnlineRoomUpdate({
            status:  room.status,
            players: [{ name: p1Name, role: 'player1' }, { name: p2Name, role: 'player2' }],
            myRole:  SnookerOnline.playerRole,
            room:    room
        });
    }
}

// ─── Ready ───────────────────────────────────────────────────────────────────

let _readyDebouncing = false;
async function toggleReady() {
    if (_readyDebouncing) return;
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
    _readyDebouncing = true;

    const { error } = await SnookerOnline.sbClient.rpc('toggle_snooker_ready', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId
    });

    if (error) { console.error('[SnookerOnline] toggleReady error:', error); _readyDebouncing = false; return; }

    // Re-fetch and run renderRoomState immediately so that whichever player
    // clicks ready last can trigger the transition without waiting for a
    // Supabase realtime delivery that may be slow or dropped.
    const { data: fresh } = await SnookerOnline.sbClient
        .from('snooker_rooms').select('*').eq('id', SnookerOnline.roomUuid).single();
    if (fresh) renderRoomState(fresh);

    setTimeout(() => { _readyDebouncing = false; }, 1000);
}

// ─── Heartbeat ───────────────────────────────────────────────────────────────

// ─── Room-view poll (backup for unreliable realtime) ─────────────────────────
// While both players are in the waiting room but haven't started yet, realtime
// delivery may be dropped.  Polling every 1 s ensures P1 sees P2's join/ready
// state and the Ready button becomes clickable.

function startRoomPoll() {
    stopRoomPoll();
    SnookerOnline.roomPollInterval = setInterval(async () => {
        if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;
        const { data: room } = await SnookerOnline.sbClient
            .from('snooker_rooms').select('*').eq('id', SnookerOnline.roomUuid).single();
        if (!room) return;
        if (room.status === 'waiting') {
            renderRoomState(room);
        } else {
            // Render once so clients that missed the realtime event pick up the transition
            renderRoomState(room);
            stopRoomPoll();
        }
    }, ROOM_POLL_MS);
}

function stopRoomPoll() {
    clearInterval(SnookerOnline.roomPollInterval);
    SnookerOnline.roomPollInterval = null;
}

function startHeartbeat() {
    stopHeartbeat();
    SnookerOnline.heartbeatInterval = setInterval(async () => {
        if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) return;
        await SnookerOnline.sbClient.rpc('ping_snooker_room', {
            p_room_id: SnookerOnline.roomUuid,
            p_client_id: SnookerOnline.clientId
        });
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
    await persistShotPayload(buildShotEnvelope('shot', payload), { label: 'SnookerShot', strictPlaying: true });
}

async function sendStateSnapshot(snapshot) {
    if (!snapshot) return;
    await persistShotPayload(buildShotEnvelope('state_sync', { snapshot }), {
        label: 'SnookerStateSync',
        strictPlaying: false,
    });
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
            // Refetch after subscription to catch state changes that happened
            // between joining and subscription becoming active
            if (status === 'SUBSCRIBED') {
                SnookerOnline.sbClient.from('snooker_rooms').select('*')
                    .eq('id', SnookerOnline.roomUuid).single()
                    .then(({ data }) => { if (data) renderRoomState(data); });
            }
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
            applyIncomingShotEvent(shot);
        })
        .subscribe((status, err) => {
            console.log('[SnookerRT-SHOTS] subscribe status:', status);
            if (err) console.error('[SnookerRT-SHOTS] error:', err);
            if (status === 'SUBSCRIBED') {
                fetchMissingShotsOnce();
            }
        });
}

// ─── Shot Poll (backup for unreliable realtime during gameplay) ──────────────
// If the realtime channel drops a shot, the two clients permanently diverge.
// Polling every 1.5s for remote shots we haven't applied yet provides recovery.

function startShotPoll() {
    stopShotPoll();
    SnookerOnline.shotPollInterval = setInterval(async () => {
        await fetchMissingShotsOnce();
    }, SHOT_POLL_MS);
}

function stopShotPoll() {
    clearInterval(SnookerOnline.shotPollInterval);
    SnookerOnline.shotPollInterval = null;
}

// ─── Exit ────────────────────────────────────────────────────────────────────

async function exitFixedRoom() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid || !SnookerOnline.playerRole) {
        cleanupAndLobby(); return;
    }

    // Always re-fetch fresh room state; window.snookerCurrentRoom can be stale,
    // especially when both players exit near-simultaneously (otherPlayerId would
    // be wrong and the room would get stuck in 'finished' with empty slots).
    const { data: freshRoom } = await SnookerOnline.sbClient
        .from('snooker_rooms')
        .select('player1_id, player2_id, status')
        .eq('id', SnookerOnline.roomUuid)
        .single();
    const room = freshRoom || window.snookerCurrentRoom;

    if (room?.status === 'playing') {
        if (!confirm('退出將判負，確定要離開？')) return;
        // Re-fetch after the dialog: the opponent may have exited during it,
        // changing the room status. Use the freshest state for the winner write.
        const { data: recheck } = await SnookerOnline.sbClient
            .from('snooker_rooms')
            .select('player1_id, player2_id, status')
            .eq('id', SnookerOnline.roomUuid)
            .single();
        if (recheck) Object.assign(room, recheck);
    }

    stopHeartbeat();

    await SnookerOnline.sbClient.rpc('exit_snooker_room', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId
    });
    
    // Also remove the active room from session storage so auto-rejoin doesn't fire
    sessionStorage.removeItem('snooker_active_room');

    cleanupAndLobby();
}

function cleanupAndLobby() {
    stopHeartbeat();
    stopShotPoll();
    stopRoomPoll();
    SnookerOnline.sbClient?.removeChannel(SnookerOnline.roomChannel);
    SnookerOnline.sbClient?.removeChannel(SnookerOnline.shotsChannel);

    SnookerOnline.roomKey       = null;
    SnookerOnline.roomUuid      = null;
    SnookerOnline.playerRole    = null;
    SnookerOnline.roomChannel   = null;
    SnookerOnline.shotsChannel  = null;
    SnookerOnline.hasSeat       = false;
    SnookerOnline.appliedShotIds.clear();
    SnookerOnline.gameStartedAt = null;
    window.snookerCurrentRoom   = null;

    if (window.snookerOnlineRoomUpdate) {
        window.snookerOnlineRoomUpdate({ status: 'left' });
    }

    document.getElementById('snooker-online-room')?.classList.add('hidden');
    document.getElementById('snooker-online-lobby')?.classList.remove('hidden');
    fetchLobbyRooms();
}

// ─── Game Over (natural completion) ──────────────────────────────────────────

// Called by the game engine when the game ends naturally (all balls potted).
// winner: 1 = player1, 2 = player2, 0 = draw
window.snookerSignalGameOver = async function({ winner = 0, scores = [] } = {}) {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;
    const winnerRole = winner === 1 ? 'player1' : winner === 2 ? 'player2' : null;
    const { error } = await SnookerOnline.sbClient.rpc('signal_snooker_game_over', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId,
        p_winner_role: winnerRole
    });
    if (error) console.error('[SnookerOnline] signalGameOver error:', error);
};

// ─── Rematch ─────────────────────────────────────────────────────────────────

async function snookerRematch() {
    if (!SnookerOnline.sbClient || !SnookerOnline.roomUuid) return;

    // Try the RPC first; ignore failures (it's a convenience cleanup).
    await SnookerOnline.sbClient.rpc('cleanup_snooker_shots', {
        p_room_id: SnookerOnline.roomUuid, p_client_id: SnookerOnline.clientId,
    });
    // Direct delete as fallback so old shots are definitely gone
    // even when the RPC is not deployed.  The round_id filter in
    // applyIncomingShotEvent would also block them, but cleaning up is neat.
    await SnookerOnline.sbClient.from('snooker_shots').delete().eq('room_id', SnookerOnline.roomUuid);

    SnookerOnline.gameStartedAt = null;

    await SnookerOnline.sbClient.rpc('reset_snooker_room', {
        p_room_id: SnookerOnline.roomUuid,
        p_client_id: SnookerOnline.clientId
    });
    // currentRoundId will be updated by the next renderRoomState()
    // when the roomPoll detects the new round_id from the DB.
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
// BUG FIX: expose SnookerOnline object so lobby inline scripts can set
// _intentionalRedirect = true before redirecting (const is not on window).
window.SnookerOnline      = SnookerOnline;
Object.defineProperty(window, 'snookerPlayerRole', { get: () => SnookerOnline.playerRole });
