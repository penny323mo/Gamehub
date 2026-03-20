/**
 * Xiangqi Online Mode - DB-Driven via Supabase Realtime
 */

const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";
const FIXED_ROOMS = ["ROOM01", "ROOM02", "ROOM03"];

const OnlineState = {
    sbClient: null,
    roomKey: null,
    roomUuid: null,
    playerRole: null, // 'red' or 'black'
    roomChannel: null,
    movesChannel: null,
    clientId: null,
    heartbeatInterval: null,
    appliedMoveIds: new Set(),
    currentRoundId: null,
    hasSeat: false,
    turnTimerInterval: null,
    gameOverHandled: false
};

const TURN_TIME_LIMIT_S = 60;

function initOnlineMode() {
    OnlineState.clientId = localStorage.getItem('xiangqi_clientId');
    if (!OnlineState.clientId) {
        OnlineState.clientId = crypto.randomUUID();
        localStorage.setItem('xiangqi_clientId', OnlineState.clientId);
    }
    console.log('[Online] ClientId:', OnlineState.clientId);

    // Fix X6: Reuse existing Supabase client to avoid connection leaks
    if (OnlineState.sbClient) {
        console.log('[Online] Supabase already initialized, reusing client');
    } else if (window.supabase && window.supabase.createClient) {
        OnlineState.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
        });
        console.log('[Online] Supabase initialized');
    } else if (window.supabase && window.supabase.from) {
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
    window.rematchGame = rematchGame;
    window.handleOnlineMove = handleOnlineMove;
    window.surrenderGame = surrenderGame;
    window.notifyOnlineGameOver = notifyOnlineGameOver;

    // Register the unload guard only once; re-calling initOnlineMode must not stack listeners.
    // Use fetch({keepalive:true}) to survive page unload — the async
    // exitFixedRoom() would be killed before completing.
    if (!OnlineState._unloadRegistered) {
        OnlineState._unloadRegistered = true;
        window.addEventListener('beforeunload', () => {
            if (!OnlineState.roomUuid || !OnlineState.playerRole) return;
            const field = OnlineState.playerRole === 'red' ? 'red_player_id' : 'black_player_id';
            const readyField = OnlineState.playerRole === 'red' ? 'red_ready' : 'black_ready';
            const body = JSON.stringify({
                [field]: null, [readyField]: false,
                last_activity_at: new Date().toISOString(),
            });
            try {
                fetch(`${SUPABASE_URL}/rest/v1/xiangqi_rooms?id=eq.${OnlineState.roomUuid}`, {
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

    fetchLobbyRooms();

    // Clear any previous lobby-poll interval before starting a new one so
    // repeated initOnlineMode() calls (e.g. switching views) don't leak timers.
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
        .from('xiangqi_rooms')
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
        statusEl.textContent = '房間唔存在';
        joinBtn.disabled = true;
        return;
    }

    const statusMap = { 'waiting': '等待中', 'playing': '對局中', 'finished': '已結束' };
    statusEl.textContent = statusMap[room.status] || room.status;
    playersEl.textContent = `${room.red_player_id ? '🔴有人' : '🔴空'} / ${room.black_player_id ? '⚫有人' : '⚫空'}`;

    const isFull = room.red_player_id && room.black_player_id;
    const amIIn = room.red_player_id === OnlineState.clientId || room.black_player_id === OnlineState.clientId;

    joinBtn.disabled = isFull && !amIIn;
    joinBtn.textContent = amIIn ? '返回' : isFull ? '已滿' : '加入';
}

async function joinFixedRoom(roomKey) {
    if (!OnlineState.sbClient) return;
    console.log('[Join] Joining:', roomKey);

    const { data: room, error } = await OnlineState.sbClient
        .from('xiangqi_rooms')
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !room) {
        showOnlineToast('房間唔存在', 'error');
        return;
    }

    let role = null;
    let updateData = { last_activity_at: new Date().toISOString() };
    const now = new Date().toISOString();
    let conditionField = null;

    if (room.red_player_id === OnlineState.clientId) {
        role = 'red';
        updateData.red_last_seen_at = now;
    } else if (room.black_player_id === OnlineState.clientId) {
        role = 'black';
        updateData.black_last_seen_at = now;
    } else if (!room.red_player_id) {
        role = 'red';
        updateData.red_player_id = OnlineState.clientId;
        updateData.red_last_seen_at = now;
        conditionField = 'red_player_id';
    } else if (!room.black_player_id) {
        role = 'black';
        updateData.black_player_id = OnlineState.clientId;
        updateData.black_last_seen_at = now;
        conditionField = 'black_player_id';
    } else {
        showOnlineToast('房間已滿', 'warn');
        return;
    }

    let query = OnlineState.sbClient.from('xiangqi_rooms').update(updateData).eq('id', room.id);
    if (conditionField) query = query.is(conditionField, null);

    const { data: updatedRows, error: updateErr } = await query.select();

    if (updateErr || !updatedRows || updatedRows.length === 0) {
        showOnlineToast('加入失敗或位置剛被搶走', 'warn');
        fetchLobbyRooms();
        return;
    }

    Object.assign(room, updatedRows[0]);
    OnlineState.hasSeat = true;
    OnlineState.roomKey = roomKey;
    OnlineState.roomUuid = room.id;
    OnlineState.playerRole = role;
    window.onlinePlayerRole = role; // Expose to main.js for turn checking
    OnlineState.appliedMoveIds.clear();
    OnlineState.currentRoundId = room.round_id || 0;
    OnlineState.gameOverHandled = false;

    enterRoomView(room);
    subscribeToRoom();
    subscribeToMoves();

    if (room.status === 'playing') {
        await fetchAndApplyMoves();
    }
    startHeartbeat();
}

function enterRoomView(room) {
    if (window.setMode) window.setMode('online');
    if (window.setIsVsAI) window.setIsVsAI(false);
    showView('online-room');
    if (window.resetGameParams) window.resetGameParams(); // Reset the board logic physically
    renderRoomState(room);
    if (window.Render && window.Render.setCameraView) {
        window.Render.setCameraView(OnlineState.playerRole);
    }
}

function startHeartbeat() {
    stopHeartbeat();
    OnlineState.heartbeatInterval = setInterval(async () => {
        if (!OnlineState.sbClient || !OnlineState.roomUuid || !OnlineState.playerRole) return;
        const updateField = OnlineState.playerRole === 'red' ? 'red_last_seen_at' : 'black_last_seen_at';
        await OnlineState.sbClient.from('xiangqi_rooms')
            .update({ [updateField]: new Date().toISOString() })
            .eq('id', OnlineState.roomUuid);
    }, 15000);
}

function stopHeartbeat() {
    if (OnlineState.heartbeatInterval) clearInterval(OnlineState.heartbeatInterval);
    OnlineState.heartbeatInterval = null;
}

function renderRoomState(room) {
    if (!room) return;

    if (OnlineState.hasSeat && OnlineState.playerRole && OnlineState.roomUuid) {
        const myIdInRoom = OnlineState.playerRole === 'red' ? room.red_player_id : room.black_player_id;
        if (myIdInRoom !== OnlineState.clientId) {
            showOnlineToast('你已被系統移出房間', 'warn');
            cleanupAndReturnToLobby();
            return;
        }
    }

    const newRoundId = room.round_id || 0;
    if (OnlineState.currentRoundId !== null && newRoundId !== OnlineState.currentRoundId) {
        OnlineState.appliedMoveIds.clear();
        if (window.resetGameParams) window.resetGameParams();
    }
    OnlineState.currentRoundId = newRoundId;
    window.currentRoom = room;

    const roomIdEl = document.getElementById('current-room-id');
    const roleEl = document.getElementById('my-role');
    if (roomIdEl) roomIdEl.textContent = OnlineState.roomKey;
    if (roleEl) roleEl.textContent = OnlineState.playerRole === 'red' ? '🔴紅方' : '⚫黑方';

    const waitingEl = document.getElementById('waiting-msg');
    const hasOpponent = room.red_player_id && room.black_player_id;
    if (waitingEl) {
        waitingEl.style.display = hasOpponent ? 'none' : 'block';
        waitingEl.textContent = hasOpponent ? '' : '等待對手加入...';
    }

    const readyArea = document.getElementById('ready-status');
    const redReadyEl = document.getElementById('red-ready-status');
    const blackReadyEl = document.getElementById('black-ready-status');
    const readyBtn = document.getElementById('toggle-ready-btn');

    if (room.status === 'waiting') {
        if (readyArea) readyArea.classList.remove('hidden');
        if (redReadyEl) redReadyEl.textContent = `🔴紅方：${room.red_player_id ? (room.red_ready ? '已準備' : '未準備') : '空位'}`;
        if (blackReadyEl) blackReadyEl.textContent = `⚫黑方：${room.black_player_id ? (room.black_ready ? '已準備' : '未準備') : '空位'}`;
        if (readyBtn) {
            const myReady = OnlineState.playerRole === 'red' ? room.red_ready : room.black_ready;
            readyBtn.textContent = myReady ? '取消準備' : '準備';
            readyBtn.disabled = false;
        }
    } else {
        if (readyArea) readyArea.classList.add('hidden');
    }

    const gameContainer = document.getElementById('game-container');
    const boardArea = document.getElementById('game-board-area');
    const onlineRoom = document.getElementById('online-room');
    if (gameContainer && boardArea) {
        if (room.status === 'playing' || room.status === 'finished') {
            gameContainer.classList.remove('hidden');
            boardArea.classList.remove('hidden');
            if (onlineRoom) onlineRoom.classList.add('hidden');
            boardArea.style.pointerEvents = room.status === 'playing' ? 'auto' : 'none';
            boardArea.style.opacity = room.status === 'playing' ? '1' : '0.5';
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
        } else {
            gameContainer.classList.add('hidden');
            boardArea.classList.add('hidden');
            if (onlineRoom) onlineRoom.classList.remove('hidden');
        }
    }

    const gameOverActions = document.getElementById('game-over-actions');
    if (gameOverActions) gameOverActions.classList.toggle('hidden', room.status !== 'finished');

    // Game result display
    if (room.status === 'finished' && !OnlineState.gameOverHandled) {
        const resultEl = document.getElementById('game-result');
        if (resultEl) {
            const reasonMap = {
                'checkmate': room.winner_color === OnlineState.playerRole ? '🎉 將殺！你勝出！' : '💀 被將殺！你輸了！',
                'stalemate': '🤝 和棋！',
                'surrender': room.winner_color === OnlineState.playerRole ? '🎉 對手投降！你勝出！' : '🏳️ 你已投降',
                'opponent_left': '🎉 對手已離開，你獲勝！',
                'opponent_timeout': '🎉 對手超時，你獲勝！',
                'timeout': room.winner_color === OnlineState.playerRole ? '🎉 對手超時！你勝出！' : '⏰ 超時判負！'
            };
            resultEl.textContent = reasonMap[room.finished_reason] || '對局結束';
        }
        stopTurnTimer();
        // Show online-room for game-over actions
        const onlineRoom = document.getElementById('online-room');
        if (onlineRoom) onlineRoom.classList.remove('hidden');
    }

    if (window.updateStatusUI) {
        window.updateStatusUI(room.current_player);
    }

    // Handle opponent leaving mid-game: alert + auto-return to lobby
    if (room.status === 'finished' && !OnlineState.gameOverHandled
        && (room.finished_reason === 'opponent_left' || room.finished_reason === 'opponent_timeout')) {
        const opponentGone = (OnlineState.playerRole === 'red' && !room.black_player_id)
            || (OnlineState.playerRole === 'black' && !room.red_player_id);
        if (opponentGone) {
            OnlineState.gameOverHandled = true;
            // Don't auto-return, let them see the result and choose
            return;
        }
    }

    // Start/update turn timer when playing
    if (room.status === 'playing' && room.turn_deadline_at) {
        startTurnTimer(room.turn_deadline_at, room.current_player);
    } else {
        stopTurnTimer();
    }
}

async function toggleReady() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    const { data: room } = await OnlineState.sbClient.from('xiangqi_rooms').select('*').eq('id', OnlineState.roomUuid).single();
    if (!room) return;
    const myReadyField = OnlineState.playerRole === 'red' ? 'red_ready' : 'black_ready';
    const newReady = !room[myReadyField];

    let updateData = { [myReadyField]: newReady };
    const otherReadyField = OnlineState.playerRole === 'red' ? 'black_ready' : 'red_ready';

    // 如果雙方都準備好，自動進入 playing 狀態
    // Fix X3: Add condition to prevent double-setting playing when both toggle simultaneously
    if (newReady && room[otherReadyField] && room.status === 'waiting') {
        updateData.status = 'playing';
        updateData.current_player = 'red';
        updateData.turn_deadline_at = new Date(Date.now() + TURN_TIME_LIMIT_S * 1000).toISOString();
        if (window.resetGameParams) window.resetGameParams();
        // Fix X3: condition update to prevent race when both toggle simultaneously
        await OnlineState.sbClient.from('xiangqi_rooms').update(updateData)
            .eq('id', OnlineState.roomUuid)
            .eq('status', 'waiting');
    } else {
        await OnlineState.sbClient.from('xiangqi_rooms').update(updateData)
            .eq('id', OnlineState.roomUuid);
    }
}

async function handleOnlineMove(from_idx, to_idx, packedMove, moveColor) {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    const room = window.currentRoom;
    if (!room || room.status !== 'playing') {
        showOnlineToast('遊戲尚未開始或已結束', 'warn');
        return false;
    }
    if (room.current_player !== OnlineState.playerRole) {
        showOnlineToast('未到你行棋！', 'warn');
        return false;
    }
    // Route through server-validated RPC (seat + turn check).
    // The RPC also flips current_player and sets turn_deadline_at atomically.
    const { data, error } = await OnlineState.sbClient.rpc('submit_xiangqi_move', {
        p_room_id:     OnlineState.roomUuid,
        p_client_id:   OnlineState.clientId,
        p_color:       OnlineState.playerRole,
        p_from_idx:    from_idx,
        p_to_idx:      to_idx,
        p_packed_move: packedMove,
    });

    if (error) {
        showOnlineToast('落子失敗：' + (error.message || 'unknown error'), 'error');
        return false;
    }
    if (data?.error) {
        console.warn('[Move] Rejected:', data.error);
        if (data.error === 'not_your_turn') showOnlineToast('未到你行棋！', 'warn');
        else showOnlineToast('落子失敗：' + data.error, 'warn');
        return false;
    }

    return true; // Wait for Realtime to apply it locally to ensure 100% sync
}

function subscribeToRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    if (OnlineState.roomChannel) OnlineState.sbClient.removeChannel(OnlineState.roomChannel);

    OnlineState.roomChannel = OnlineState.sbClient.channel(`room-${OnlineState.roomUuid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'xiangqi_rooms', filter: `id=eq.${OnlineState.roomUuid}` }, (payload) => {
            if (payload.new) renderRoomState(payload.new);
        }).subscribe();
}

function subscribeToMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    if (OnlineState.movesChannel) OnlineState.sbClient.removeChannel(OnlineState.movesChannel);

    OnlineState.movesChannel = OnlineState.sbClient.channel(`moves-${OnlineState.roomUuid}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'xiangqi_moves', filter: `room_id=eq.${OnlineState.roomUuid}` }, (payload) => {
            const move = payload.new;
            if (move && move.id && !OnlineState.appliedMoveIds.has(move.id)) {
                // Bound the set to prevent unbounded growth in long sessions
                if (OnlineState.appliedMoveIds.size > 500) OnlineState.appliedMoveIds.clear();
                OnlineState.appliedMoveIds.add(move.id);
                // Fix X7: Queue moves by move_no to ensure ordering
                queueAndApplyMove(move);
            }
        }).subscribe();
}

// Fix X7: Move queue to ensure ordering
const _moveQueue = [];
let _processingMoves = false;

function queueAndApplyMove(move) {
    const no = move.move_no || 0;
    let i = _moveQueue.length;
    while (i > 0 && (_moveQueue[i - 1].move_no || 0) > no) { i--; }
    _moveQueue.splice(i, 0, move);
    processMovesQueue();
}

async function processMovesQueue() {
    if (_processingMoves) return;
    _processingMoves = true;
    while (_moveQueue.length > 0) {
        const m = _moveQueue.shift();
        if (window.applyNetworkMove) {
            window.applyNetworkMove(m.packed_move, m.color);
        }
        await new Promise(r => setTimeout(r, 30));
    }
    _processingMoves = false;
}

async function fetchAndApplyMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    const { data: moves, error } = await OnlineState.sbClient.from('xiangqi_moves').select('*').eq('room_id', OnlineState.roomUuid).order('move_no', { ascending: true });
    if (moves) {
        for (const m of moves) {
            if (!OnlineState.appliedMoveIds.has(m.id)) {
                OnlineState.appliedMoveIds.add(m.id);
                if (window.applyNetworkMove) window.applyNetworkMove(m.packed_move, m.color, true); // true = silent/fast apply
            }
        }
    }
}

async function exitFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) { cleanupAndReturnToLobby(); return; }

    // Fix X5: Confirm before leaving a playing game
    const room = window.currentRoom;
    if (room && room.status === 'playing') {
        if (!confirm('退出將會判負，確定要退出嗎？')) return;
    }

    stopHeartbeat();

    const updateData = { last_activity_at: new Date().toISOString() };
    if (OnlineState.playerRole === 'red') {
        updateData.red_player_id = null; updateData.red_ready = false;
    } else {
        updateData.black_player_id = null; updateData.black_ready = false;
    }

    if (room?.status === 'playing') {
        updateData.status = 'finished';
        updateData.winner_color = OnlineState.playerRole === 'red' ? 'black' : 'red';
        updateData.finished_reason = 'opponent_left';
    } else if (room?.status === 'waiting') {
        updateData.current_player = null;
    }

    await OnlineState.sbClient.from('xiangqi_rooms').update(updateData).eq('id', OnlineState.roomUuid);
    cleanupAndReturnToLobby();
}

function cleanupAndReturnToLobby() {
    stopHeartbeat();
    if (OnlineState.roomChannel) OnlineState.sbClient?.removeChannel(OnlineState.roomChannel);
    if (OnlineState.movesChannel) OnlineState.sbClient?.removeChannel(OnlineState.movesChannel);

    OnlineState.roomKey = null; OnlineState.roomUuid = null;
    OnlineState.playerRole = null; OnlineState.roomChannel = null;
    OnlineState.movesChannel = null; OnlineState.appliedMoveIds.clear();
    OnlineState.hasSeat = false; window.currentRoom = null;
    OnlineState.gameOverHandled = false;
    window.onlinePlayerRole = null;
    _moveQueue.length = 0;
    _processingMoves = false;
    stopTurnTimer();

    showView('online-lobby');
    fetchLobbyRooms();
}

async function rematchGame() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    await OnlineState.sbClient.rpc('cleanup_xiangqi_moves', { p_room_id: OnlineState.roomUuid, p_client_id: OnlineState.clientId });
    const newRoundId = (window.currentRoom?.round_id || 0) + 1;
    const deadline = new Date(Date.now() + TURN_TIME_LIMIT_S * 1000).toISOString();
    await OnlineState.sbClient.from('xiangqi_rooms').update({
        status: 'waiting', red_ready: false, black_ready: false, current_player: null,
        winner_color: null, finished_reason: null, round_id: newRoundId,
        turn_deadline_at: null
    }).eq('id', OnlineState.roomUuid);
    OnlineState.gameOverHandled = false;
    const resultEl = document.getElementById('game-result');
    if (resultEl) resultEl.textContent = '';
    stopTurnTimer();
}

async function surrenderGame() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    const room = window.currentRoom;
    if (!room || room.status !== 'playing') return;
    if (!confirm('確定投降？')) return;
    const winnerColor = OnlineState.playerRole === 'red' ? 'black' : 'red';
    await OnlineState.sbClient.from('xiangqi_rooms').update({
        status: 'finished',
        winner_color: winnerColor,
        finished_reason: 'surrender',
        turn_deadline_at: null
    }).eq('id', OnlineState.roomUuid);
}

async function notifyOnlineGameOver(winnerColor, reason) {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    // Fix X1: Add condition update to prevent double-write race
    await OnlineState.sbClient.from('xiangqi_rooms').update({
        status: 'finished',
        winner_color: winnerColor,
        finished_reason: reason,
        turn_deadline_at: null
    }).eq('id', OnlineState.roomUuid)
      .eq('status', 'playing');  // Only update if still playing
}

function startTurnTimer(deadlineIso, currentPlayer) {
    stopTurnTimer();
    const timerEl = document.getElementById('turn-timer');
    if (!timerEl) return;
    timerEl.classList.remove('hidden');

    function tick() {
        const remaining = Math.max(0, Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000));
        const isMyTurn = currentPlayer === OnlineState.playerRole;
        timerEl.textContent = `⏱ ${isMyTurn ? '你的' : '對手'}回合：${remaining}s`;
        timerEl.style.color = remaining <= 10 ? '#ff5252' : '#ffd54f';

        if (remaining <= 0) {
            stopTurnTimer();
            // Fix X2: Timeout should be triggered by the OPPONENT, not the timed-out player
            // This prevents malicious players from avoiding timeout
            if (!isMyTurn && OnlineState.sbClient && OnlineState.roomUuid) {
                // I'm the opponent of the timed-out player, so I win
                OnlineState.sbClient.from('xiangqi_rooms').update({
                    status: 'finished',
                    winner_color: OnlineState.playerRole,
                    finished_reason: 'timeout',
                    turn_deadline_at: null
                }).eq('id', OnlineState.roomUuid)
                  .eq('status', 'playing');  // Condition update
            }
        }
    }

    tick();
    OnlineState.turnTimerInterval = setInterval(tick, 1000);
}

function stopTurnTimer() {
    if (OnlineState.turnTimerInterval) {
        clearInterval(OnlineState.turnTimerInterval);
        OnlineState.turnTimerInterval = null;
    }
    const timerEl = document.getElementById('turn-timer');
    if (timerEl) timerEl.classList.add('hidden');
}

// Expose online initialization
window.initOnlineMode = initOnlineMode;
