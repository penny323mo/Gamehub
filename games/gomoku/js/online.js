/**
 * Gomoku Online Mode - 修正版
 * 
 * 核心原則：
 * 1. DB 做唯一真相 (rooms + moves)
 * 2. 落子先寫 DB，成功後由 Realtime 推動 UI 更新
 * 3. Turn Lock 必須用 DB state，唔係本地變數
 */

// === Supabase Config ===
const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

// === 固定房間列表 ===
const FIXED_ROOMS = ["ROOM01", "ROOM02", "ROOM03"];

// === 狀態管理 ===
const OnlineState = {
    sbClient: null,
    roomKey: null,
    roomUuid: null,
    playerRole: null,
    roundNo: null,
    roomChannel: null,
    movesChannel: null,
    clientId: null,
    timerInterval: null,
    timeoutClaimInProgress: false,
    moveInProgress: false  // 防止重複落子
};

// === 初始化 ===

function initOnlineMode() {
    OnlineState.clientId = localStorage.getItem('gomoku_clientId');
    if (!OnlineState.clientId) {
        OnlineState.clientId = crypto.randomUUID();
        localStorage.setItem('gomoku_clientId', OnlineState.clientId);
    }
    console.log('[Online] ClientId:', OnlineState.clientId);

    if (window.supabase) {
        try {
            OnlineState.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
                auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
            });
            console.log('[Online] Supabase client initialized');
        } catch (err) {
            console.error('[Online] Supabase init error:', err);
        }
    } else {
        console.error('[Online] Supabase SDK not loaded');
    }

    // Expose globals
    window.joinFixedRoom = joinFixedRoom;
    window.exitFixedRoom = exitFixedRoom;
    window.toggleReady = toggleReady;
    window.rematchGame = rematchGame;
    window.resetFixedRoom = resetFixedRoom;
    window.initOnlineMode = initOnlineMode;
    window.handleOnlineMove = handleOnlineMove;

    fetchLobbyRooms();
}

// === Lobby ===

async function fetchLobbyRooms() {
    if (!OnlineState.sbClient) return;
    console.log('[Online] Fetching lobby rooms...');

    const { data: rooms, error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .select('room_code, black_player_id, white_player_id, status, black_ready, white_ready')
        .in('room_code', FIXED_ROOMS);

    if (error) {
        console.error('[Online] fetchLobbyRooms error:', error);
        return;
    }

    FIXED_ROOMS.forEach(roomKey => {
        const room = rooms?.find(r => r.room_code === roomKey);
        updateRoomCardUI(roomKey, room);
    });
}

function updateRoomCardUI(roomKey, room) {
    const statusEl = document.getElementById(`room-status-${roomKey}`);
    const playersEl = document.getElementById(`room-players-${roomKey}`);
    const joinBtn = document.getElementById(`room-join-${roomKey}`);
    if (!statusEl || !playersEl || !joinBtn) return;

    if (!room) {
        statusEl.textContent = '房間唔存在';
        playersEl.textContent = '⚫ - / ⚪ -';
        joinBtn.disabled = true;
        joinBtn.textContent = '無法加入';
        return;
    }

    const statusMap = { 'waiting': '等待中', 'playing': '對戰中', 'finished': '已結束' };
    statusEl.textContent = statusMap[room.status] || room.status;
    playersEl.textContent = `${room.black_player_id ? '⚫ 有人' : '⚫ 空'} / ${room.white_player_id ? '⚪ 有人' : '⚪ 空'}`;

    const isFull = room.black_player_id && room.white_player_id;
    const amIInRoom = (room.black_player_id === OnlineState.clientId || room.white_player_id === OnlineState.clientId);

    if (amIInRoom) {
        joinBtn.disabled = false;
        joinBtn.textContent = '返回房間';
    } else if (isFull) {
        joinBtn.disabled = true;
        joinBtn.textContent = '已滿';
    } else {
        joinBtn.disabled = false;
        joinBtn.textContent = '加入';
    }
}

// === 加入房間 ===

async function joinFixedRoom(roomKey) {
    if (!OnlineState.sbClient) {
        alert('無法連接伺服器');
        return;
    }
    console.log('[Online] Joining room:', roomKey);

    const { data: room, error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !room) {
        console.error('[Online] Room not found:', error);
        alert('找不到房間：' + roomKey);
        return;
    }

    let role = null;
    let updates = {};

    if (room.black_player_id === OnlineState.clientId) {
        role = 'black';
    } else if (room.white_player_id === OnlineState.clientId) {
        role = 'white';
    } else if (!room.black_player_id) {
        role = 'black';
        updates.black_player_id = OnlineState.clientId;
    } else if (!room.white_player_id) {
        role = 'white';
        updates.white_player_id = OnlineState.clientId;
    } else {
        alert('房間已滿');
        return;
    }

    if (Object.keys(updates).length > 0) {
        updates.last_activity_at = new Date().toISOString();
        const { data: updatedRoom, error: updateError } = await OnlineState.sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', room.id)
            .select()
            .single();

        if (updateError) {
            console.error('[Online] Failed to join:', updateError);
            alert('加入失敗：' + updateError.message);
            return;
        }
        Object.assign(room, updatedRoom);
    }

    OnlineState.roomKey = roomKey;
    OnlineState.roomUuid = room.id;
    OnlineState.playerRole = role;
    OnlineState.roundNo = room.round_id || 1;
    console.log('[Online] Joined', roomKey, 'as', role);

    localStorage.setItem('gomoku_room_key', roomKey);
    localStorage.setItem('gomoku_player_role', role);

    // 先訂閱 Realtime
    subscribeToRoom();
    subscribeToMoves();

    enterRoomView(room);

    if (room.status === 'playing') {
        await fetchAndApplyMoves();
    }
}

// === 進入房間視圖 ===

function enterRoomView(room) {
    setMode('online');
    setIsVsAI(false);
    showView('online-room');

    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));

    renderRoomState(room);
}

// === 渲染房間狀態 (核心 UI 更新) ===

function renderRoomState(room) {
    if (!room) return;

    console.log('[Online] renderRoomState:', {
        status: room.status,
        current_player: room.current_player,
        black_ready: room.black_ready,
        white_ready: room.white_ready,
        myRole: OnlineState.playerRole
    });

    // 儲存到 window - 這是 input.js 用來做 turn check 的唯一來源
    window.currentRoom = room;
    window.isGameReady = (room.status === 'playing');

    // 房間號 + 身份
    const roomIdEl = document.getElementById('current-room-id');
    const roleEl = document.getElementById('my-role');
    if (roomIdEl) roomIdEl.textContent = OnlineState.roomKey || '???';
    if (roleEl) roleEl.textContent = OnlineState.playerRole === 'black' ? '⚫ 黑' : OnlineState.playerRole === 'white' ? '⚪ 白' : '觀眾';

    // 等待對手
    const waitingEl = document.getElementById('waiting-msg');
    const hasOpponent = room.black_player_id && room.white_player_id;
    if (waitingEl) {
        waitingEl.textContent = hasOpponent ? '' : '等待對手加入...';
        waitingEl.style.display = hasOpponent ? 'none' : 'block';
    }

    // Ready 區域
    const readyStatusEl = document.getElementById('ready-status');
    const blackReadyEl = document.getElementById('black-ready-status');
    const whiteReadyEl = document.getElementById('white-ready-status');
    const readyBtn = document.getElementById('toggle-ready-btn');

    if (room.status === 'waiting') {
        if (readyStatusEl) readyStatusEl.classList.remove('hidden');
        if (blackReadyEl) blackReadyEl.textContent = `⚫ 黑：${room.black_player_id ? (room.black_ready ? '已準備' : '未準備') : '空位'}`;
        if (whiteReadyEl) whiteReadyEl.textContent = `⚪ 白：${room.white_player_id ? (room.white_ready ? '已準備' : '未準備') : '空位'}`;

        if (readyBtn) {
            const myReady = OnlineState.playerRole === 'black' ? room.black_ready : room.white_ready;
            readyBtn.textContent = myReady ? '取消準備' : '準備';
            readyBtn.disabled = !hasOpponent;
            if (!hasOpponent) readyBtn.textContent = '等待對手...';
        }
    } else {
        if (readyStatusEl) readyStatusEl.classList.add('hidden');
    }

    // 棋盤 Lock
    setBoardLock(room.status !== 'playing');

    // Game controls
    const onlineControlsEl = document.getElementById('online-controls');
    if (onlineControlsEl) onlineControlsEl.classList.toggle('hidden', room.status !== 'playing');

    const gameOverActionsEl = document.getElementById('game-over-actions');
    if (gameOverActionsEl) gameOverActionsEl.classList.toggle('hidden', room.status !== 'finished');

    // 更新回合顯示
    if (room.status === 'playing') {
        const turnPlayer = room.current_player || 'black';
        setCurrentPlayer(turnPlayer);
        updateStatusUI(turnPlayer);
        startClientTimer(room);
    } else if (room.status === 'finished') {
        const winner = room.winner || room.winner_color;
        if (winner) updateStatusUI(null, `${getPlayerName(winner)} 獲勝！`);
        stopClientTimer();
    }
}

function setBoardLock(locked) {
    const canvas = document.getElementById('gomoku-board');
    if (canvas) canvas.style.pointerEvents = locked ? 'none' : 'auto';

    const lockOverlay = document.getElementById('boardLock');
    if (lockOverlay) lockOverlay.style.display = locked ? 'block' : 'none';
}

// === Ready 機制 ===

async function toggleReady() {
    console.log('[Online] toggleReady clicked');

    if (!OnlineState.sbClient || !OnlineState.roomUuid || !OnlineState.playerRole) {
        console.warn('[Online] Cannot toggle ready - not in room');
        return;
    }

    const { data: room, error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('id', OnlineState.roomUuid)
        .single();

    if (error || !room) {
        console.error('[Online] toggleReady fetch error:', error);
        alert('讀取房間狀態失敗');
        return;
    }

    if (!room.black_player_id || !room.white_player_id) {
        alert('請等待對手加入');
        return;
    }

    const myReadyField = OnlineState.playerRole === 'black' ? 'black_ready' : 'white_ready';
    const newReady = !(room[myReadyField] || false);

    console.log('[Online] Toggle ready:', myReadyField, '->', newReady);

    const updates = {
        [myReadyField]: newReady,
        last_activity_at: new Date().toISOString()
    };

    // 檢查兩邊都 ready → 開局
    const opponentReadyField = OnlineState.playerRole === 'black' ? 'white_ready' : 'black_ready';
    const opponentReady = room[opponentReadyField] || false;

    if (newReady && opponentReady && room.status === 'waiting') {
        updates.status = 'playing';
        updates.current_player = 'black';
        updates.turn_deadline_at = new Date(Date.now() + 30 * 1000).toISOString();
        updates.round_id = (room.round_id || 0) + 1;
        console.log('[Online] Both ready! Starting game...');
    }

    const { data: updatedRoom, error: updateError } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update(updates)
        .eq('id', OnlineState.roomUuid)
        .select()
        .single();

    if (updateError) {
        console.error('[Online] toggleReady update error:', updateError);
        alert('更新失敗：' + updateError.message);
        return;
    }

    console.log('[Online] Ready updated successfully');
    // 立即更新本地 UI (唔等 Realtime)
    renderRoomState(updatedRoom);
}

// === 落子處理 ===

async function handleOnlineMove(row, col, isWin, winner) {
    // 防止重複 call
    if (OnlineState.moveInProgress) {
        console.warn('[Online] Move already in progress, skipping');
        return;
    }
    OnlineState.moveInProgress = true;

    try {
        if (!OnlineState.sbClient || !OnlineState.roomUuid) {
            console.error('[Online] handleOnlineMove: not in room');
            return;
        }

        const moveNo = getMoveCount();
        const color = OnlineState.playerRole;

        console.log('[Online] handleOnlineMove:', { row, col, moveNo, color, isWin });

        // 1. INSERT into moves table
        const { error: moveError } = await OnlineState.sbClient
            .from('moves')
            .insert([{
                room_id: OnlineState.roomUuid,
                move_no: moveNo,
                x: row,
                y: col,
                color: color
            }]);

        if (moveError) {
            console.error('[Online] Move insert error:', moveError);
            if (moveError.code === '23505') {
                alert('❌ 該格已有棋子！');
            } else {
                alert('落子失敗：' + moveError.message);
            }
            return;
        }

        console.log('[Online] Move inserted to DB');

        // 2. UPDATE rooms table
        const nextPlayer = color === 'black' ? 'white' : 'black';
        const updates = {
            current_player: nextPlayer,
            turn_deadline_at: new Date(Date.now() + 30 * 1000).toISOString(),
            last_activity_at: new Date().toISOString()
        };

        if (isWin) {
            updates.status = 'finished';
            updates.winner = winner;
            updates.winner_color = winner;
            updates.finished_reason = 'win';
            updates.finished_at = new Date().toISOString();
        }

        const { data: updatedRoom, error: roomError } = await OnlineState.sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', OnlineState.roomUuid)
            .select()
            .single();

        if (roomError) {
            console.error('[Online] Room update error:', roomError);
        } else {
            console.log('[Online] Room updated, next turn:', nextPlayer);
            // 立即更新本地 currentRoom (唔等 Realtime)
            window.currentRoom = updatedRoom;
            setCurrentPlayer(nextPlayer);
        }

    } finally {
        OnlineState.moveInProgress = false;
    }
}

function getMoveCount() {
    if (!window.board) return 0;
    let count = 0;
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (window.board[r][c]) count++;
        }
    }
    return count;
}

// === Realtime 訂閱 ===

function subscribeToRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    if (OnlineState.roomChannel) {
        OnlineState.sbClient.removeChannel(OnlineState.roomChannel);
    }

    const channelName = `gomoku-room-${OnlineState.roomUuid}`;
    console.log('[Online] Subscribing to room:', channelName);

    OnlineState.roomChannel = OnlineState.sbClient
        .channel(channelName)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: "Gomoku's rooms"
            },
            (payload) => {
                console.log('[Online] Realtime room event:', payload.eventType);
                const newRoom = payload.new;
                if (newRoom && newRoom.id === OnlineState.roomUuid) {
                    console.log('[Online] Room update from Realtime:', newRoom.status, newRoom.current_player);
                    renderRoomState(newRoom);
                }
            }
        )
        .subscribe((status) => {
            console.log('[Online] Room subscription:', status);
        });
}

function subscribeToMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    if (OnlineState.movesChannel) {
        OnlineState.sbClient.removeChannel(OnlineState.movesChannel);
    }

    const channelName = `gomoku-moves-${OnlineState.roomUuid}`;
    console.log('[Online] Subscribing to moves:', channelName);

    OnlineState.movesChannel = OnlineState.sbClient
        .channel(channelName)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'moves'
            },
            (payload) => {
                const move = payload.new;
                console.log('[Online] Realtime move:', move);

                // 只處理我房間嘅 + 對手嘅落子
                if (move && move.room_id === OnlineState.roomUuid && move.color !== OnlineState.playerRole) {
                    console.log('[Online] Applying opponent move:', move.x, move.y, move.color);
                    applyMoveToBoard(move.x, move.y, move.color);
                }
            }
        )
        .subscribe((status) => {
            console.log('[Online] Moves subscription:', status);
        });
}

// === 應用落子到棋盤 ===

function applyMoveToBoard(row, col, color) {
    if (!window.board) {
        window.board = [];
        for (let i = 0; i < 15; i++) {
            window.board.push(new Array(15).fill(null));
        }
    }

    if (window.board[row][col] === null) {
        window.board[row][col] = color;
        placeStoneUI(row, col, color);
        console.log('[Online] Applied move to board:', row, col, color);

        const win = checkWin(row, col, color);
        if (win) {
            setGameOver(true);
            updateWinUI(color);
        }
    }
}

// === 入房時拉取現有棋子 ===

async function fetchAndApplyMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    console.log('[Online] Fetching existing moves...');

    const { data: moves, error } = await OnlineState.sbClient
        .from('moves')
        .select('*')
        .eq('room_id', OnlineState.roomUuid)
        .order('move_no', { ascending: true });

    if (error) {
        console.error('[Online] fetchAndApplyMoves error:', error);
        return;
    }

    console.log('[Online] Found', moves?.length || 0, 'moves');

    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));

    if (moves && moves.length > 0) {
        for (const move of moves) {
            if (window.board[move.x][move.y] === null) {
                window.board[move.x][move.y] = move.color;
                placeStoneUI(move.x, move.y, move.color);
            }
        }
    }
}

// === 退出房間 ===

async function exitFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) {
        cleanupAndReturnToLobby();
        return;
    }

    console.log('[Online] Exiting room...');

    const updates = { last_activity_at: new Date().toISOString() };

    if (OnlineState.playerRole === 'black') {
        updates.black_player_id = null;
        updates.black_ready = false;
    } else if (OnlineState.playerRole === 'white') {
        updates.white_player_id = null;
        updates.white_ready = false;
    }

    const room = window.currentRoom;
    if (room && room.status === 'playing') {
        const winner = OnlineState.playerRole === 'black' ? 'white' : 'black';
        updates.status = 'finished';
        updates.winner = winner;
        updates.winner_color = winner;
        updates.finished_reason = 'opponent_left';
        updates.finished_at = new Date().toISOString();
    }

    await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update(updates)
        .eq('id', OnlineState.roomUuid);

    cleanupAndReturnToLobby();
}

function cleanupAndReturnToLobby() {
    if (OnlineState.roomChannel) {
        OnlineState.sbClient?.removeChannel(OnlineState.roomChannel);
        OnlineState.roomChannel = null;
    }
    if (OnlineState.movesChannel) {
        OnlineState.sbClient?.removeChannel(OnlineState.movesChannel);
        OnlineState.movesChannel = null;
    }

    stopClientTimer();

    OnlineState.roomKey = null;
    OnlineState.roomUuid = null;
    OnlineState.playerRole = null;
    OnlineState.roundNo = null;
    OnlineState.moveInProgress = false;
    window.currentRoom = null;
    window.isGameReady = false;

    localStorage.removeItem('gomoku_room_key');
    localStorage.removeItem('gomoku_player_role');

    showView('online-lobby');
    fetchLobbyRooms();
}

// === Timer ===

function startClientTimer(room) {
    stopClientTimer();
    if (!room.turn_deadline_at) return;

    OnlineState.timerInterval = setInterval(() => {
        const currentRoom = window.currentRoom;
        if (!currentRoom || !currentRoom.turn_deadline_at || currentRoom.status !== 'playing') {
            updateTimerUI('--');
            return;
        }

        const deadline = new Date(currentRoom.turn_deadline_at).getTime();
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        updateTimerUI(remaining);

        if (remaining <= 0) handleTimeout();
    }, 200);
}

function stopClientTimer() {
    if (OnlineState.timerInterval) {
        clearInterval(OnlineState.timerInterval);
        OnlineState.timerInterval = null;
    }
    updateTimerUI('--');
}

function updateTimerUI(seconds) {
    const el = document.getElementById('game-timer');
    if (!el) return;
    el.textContent = seconds;
    el.classList.toggle('timer-warning', typeof seconds === 'number' && seconds <= 10);
}

async function handleTimeout() {
    if (OnlineState.timeoutClaimInProgress) return;
    const room = window.currentRoom;
    if (!room || room.status !== 'playing') return;

    if (room.current_player === OnlineState.playerRole) {
        console.log('[Online] I timed out');
        return;
    }

    OnlineState.timeoutClaimInProgress = true;
    console.log('[Online] Claiming timeout win...');

    await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'finished',
            winner: OnlineState.playerRole,
            winner_color: OnlineState.playerRole,
            finished_reason: 'timeout',
            finished_at: new Date().toISOString()
        })
        .eq('id', OnlineState.roomUuid)
        .eq('status', 'playing');

    OnlineState.timeoutClaimInProgress = false;
}

// === Rematch ===

async function rematchGame() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    console.log('[Online] Rematch...');

    const { data: updatedRoom, error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            black_ready: false,
            white_ready: false,
            current_player: null,
            turn_deadline_at: null,
            winner: null,
            winner_color: null,
            finished_reason: null,
            finished_at: null
        })
        .eq('id', OnlineState.roomUuid)
        .select()
        .single();

    if (error) {
        alert('重置失敗：' + error.message);
        return;
    }

    await OnlineState.sbClient
        .from('moves')
        .delete()
        .eq('room_id', OnlineState.roomUuid);

    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));
    setGameOver(false);
    renderRoomState(updatedRoom);
}

async function resetFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    if (!confirm('確定要重置房間？')) return;

    await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            black_player_id: null,
            white_player_id: null,
            black_ready: false,
            white_ready: false,
            current_player: null,
            turn_deadline_at: null,
            winner: null,
            winner_color: null,
            finished_reason: null,
            finished_at: null
        })
        .eq('id', OnlineState.roomUuid);

    await OnlineState.sbClient
        .from('moves')
        .delete()
        .eq('room_id', OnlineState.roomUuid);

    cleanupAndReturnToLobby();
}

// === Expose for input.js ===
Object.defineProperty(window, 'roomId', { get: () => OnlineState.roomKey });
Object.defineProperty(window, 'playerRole', { get: () => OnlineState.playerRole });
Object.defineProperty(window, 'roomRecordId', { get: () => OnlineState.roomUuid });
