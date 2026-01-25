/**
 * Gomoku Online Mode - 從零重寫
 * 
 * 核心原則：
 * 1. 所有狀態收納喺 OnlineState object
 * 2. 禁止 setInterval 寫 DB - 只喺事件時寫入
 * 3. DB 做唯一真相 (角色分配、回合、結果)
 */

// === Supabase Config ===
const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

// === 固定房間列表 ===
const FIXED_ROOMS = ["ROOM01", "ROOM02", "ROOM03"];

// === 狀態管理 (單一 object，唔用全域變數亂飛) ===
const OnlineState = {
    sbClient: null,
    roomKey: null,           // "ROOM01" / "ROOM02" / "ROOM03"
    roomUuid: null,          // DB id (UUID) for FK
    playerRole: null,        // "black" / "white" / null
    roundNo: null,           // 當前局號
    roomChannel: null,       // Realtime subscription for room
    movesChannel: null,      // Realtime subscription for moves
    clientId: null,          // 玩家識別碼 (localStorage)
    timerInterval: null,     // Client-side timer (no DB writes)
    timeoutClaimInProgress: false
};

// === 初始化 ===

function initOnlineMode() {
    // 1. 生成/讀取 clientId
    OnlineState.clientId = localStorage.getItem('gomoku_clientId');
    if (!OnlineState.clientId) {
        OnlineState.clientId = crypto.randomUUID();
        localStorage.setItem('gomoku_clientId', OnlineState.clientId);
    }
    console.log('[Online] ClientId:', OnlineState.clientId);

    // 2. 初始化 Supabase
    if (window.supabase) {
        try {
            OnlineState.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                    detectSessionInUrl: false
                }
            });
            console.log('[Online] Supabase client initialized');
        } catch (err) {
            console.error('[Online] Supabase init error:', err);
        }
    } else {
        console.error('[Online] Supabase SDK not loaded');
    }

    // 3. Expose globals for HTML onclick
    window.joinFixedRoom = joinFixedRoom;
    window.exitFixedRoom = exitFixedRoom;
    window.toggleReady = toggleReady;
    window.togglePause = togglePause;
    window.rematchGame = rematchGame;
    window.resetFixedRoom = resetFixedRoom;
    window.initOnlineMode = initOnlineMode;

    // 4. 如果喺 online lobby，fetch 房間狀態
    fetchLobbyRooms();
}

// === Lobby: 讀取三房狀態 ===

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

    // 確保三房都存在，冇就顯示 "房間唔存在"
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

    // 狀態
    const statusMap = {
        'waiting': '等待中',
        'playing': '對戰中',
        'finished': '已結束'
    };
    statusEl.textContent = statusMap[room.status] || room.status;

    // 玩家
    const blackText = room.black_player_id ? '⚫ 有人' : '⚫ 空';
    const whiteText = room.white_player_id ? '⚪ 有人' : '⚪ 空';
    playersEl.textContent = `${blackText} / ${whiteText}`;

    // 按鈕
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

    // 1. 讀取房間
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

    // 2. 角色分配 (DB 做唯一真相)
    let role = null;
    let updates = {};

    if (room.black_player_id === OnlineState.clientId) {
        // 已經係黑
        role = 'black';
    } else if (room.white_player_id === OnlineState.clientId) {
        // 已經係白
        role = 'white';
    } else if (!room.black_player_id) {
        // 黑位空 → assign 黑
        role = 'black';
        updates.black_player_id = OnlineState.clientId;
    } else if (!room.white_player_id) {
        // 白位空 → assign 白
        role = 'white';
        updates.white_player_id = OnlineState.clientId;
    } else {
        // 房滿
        alert('房間已滿');
        return;
    }

    // 3. 如果要更新座位
    if (Object.keys(updates).length > 0) {
        updates.last_activity_at = new Date().toISOString();

        const { error: updateError } = await OnlineState.sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', room.id);

        if (updateError) {
            console.error('[Online] Failed to join:', updateError);
            alert('加入失敗：' + updateError.message);
            return;
        }

        // 合併更新到 room object
        Object.assign(room, updates);
    }

    // 4. 設置狀態
    OnlineState.roomKey = roomKey;
    OnlineState.roomUuid = room.id;
    OnlineState.playerRole = role;
    OnlineState.roundNo = room.round_id || 1;

    console.log('[Online] Joined', roomKey, 'as', role, '| roomUuid:', room.id);

    // 5. 保存 session (for reload)
    localStorage.setItem('gomoku_room_key', roomKey);
    localStorage.setItem('gomoku_player_role', role);

    // 6. 切換到房間 UI
    enterRoomView(room);

    // 7. 訂閱 Realtime
    subscribeToRoom();
    subscribeToMoves();

    // 8. 如果已經喺 playing，拉取現有棋子
    if (room.status === 'playing') {
        await fetchAndApplyMoves();
    }
}

// === 進入房間視圖 ===

function enterRoomView(room) {
    // 設置 mode
    setMode('online');
    setIsVsAI(false);

    // 顯示房間 UI
    showView('online-room');

    // 初始化空棋盤
    if (!window.board || window.board.length === 0) {
        resetGameState();
        createBoardUI((r, c) => handleCellClick(r, c));
    }

    // 更新 UI
    renderRoomState(room);
}

// === 渲染房間狀態 ===

function renderRoomState(room) {
    if (!room) return;

    // 儲存到 window 供 input.js 使用
    window.currentRoom = room;

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

    if (readyStatusEl && hasOpponent && room.status === 'waiting') {
        readyStatusEl.classList.remove('hidden');
        if (blackReadyEl) blackReadyEl.textContent = `⚫ 黑：${room.black_ready ? '已準備' : '未準備'}`;
        if (whiteReadyEl) whiteReadyEl.textContent = `⚪ 白：${room.white_ready ? '已準備' : '未準備'}`;

        // 我嘅 ready 狀態
        const myReady = OnlineState.playerRole === 'black' ? room.black_ready : room.white_ready;
        if (readyBtn) readyBtn.textContent = myReady ? '取消準備' : '準備';
    } else if (readyStatusEl) {
        readyStatusEl.classList.add('hidden');
    }

    // 棋盤 Lock
    const boardLocked = (room.status !== 'playing');
    setBoardLock(boardLocked);

    // isGameReady for input.js
    window.isGameReady = (room.status === 'playing');

    // 如果 playing，顯示 online controls
    const onlineControlsEl = document.getElementById('online-controls');
    if (onlineControlsEl) {
        onlineControlsEl.classList.toggle('hidden', room.status !== 'playing');
    }

    // Game Over Actions
    const gameOverActionsEl = document.getElementById('game-over-actions');
    if (gameOverActionsEl) {
        gameOverActionsEl.classList.toggle('hidden', room.status !== 'finished');
    }

    // 更新回合顯示
    if (room.status === 'playing') {
        const turnPlayer = room.current_player || 'black';
        setCurrentPlayer(turnPlayer);
        updateStatusUI(turnPlayer);

        // 開始 Timer (client-side only)
        startClientTimer(room);
    } else if (room.status === 'finished') {
        const winner = room.winner || room.winner_color;
        if (winner) {
            updateStatusUI(null, `${getPlayerName(winner)} 獲勝！`);
        }
        stopClientTimer();
    }
}

// === 棋盤鎖定 ===

function setBoardLock(locked) {
    const canvas = document.getElementById('gomoku-board');
    if (canvas) {
        canvas.style.pointerEvents = locked ? 'none' : 'auto';
    }

    const lockOverlay = document.getElementById('boardLock');
    if (lockOverlay) {
        lockOverlay.style.display = locked ? 'block' : 'none';
    }
}

// === Ready 機制 ===

async function toggleReady() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid || !OnlineState.playerRole) {
        console.warn('[Online] Cannot toggle ready - not in room');
        return;
    }

    // 讀取當前狀態
    const { data: room, error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .select('black_ready, white_ready, status, black_player_id, white_player_id')
        .eq('id', OnlineState.roomUuid)
        .single();

    if (error || !room) {
        console.error('[Online] toggleReady fetch error:', error);
        return;
    }

    // 確定我嘅 ready field
    const myReadyField = OnlineState.playerRole === 'black' ? 'black_ready' : 'white_ready';
    const currentReady = room[myReadyField];
    const newReady = !currentReady;

    console.log('[Online] Toggle ready:', myReadyField, currentReady, '->', newReady);

    // 更新 DB
    const updates = {
        [myReadyField]: newReady,
        last_activity_at: new Date().toISOString()
    };

    // 檢查係咪兩邊都 ready → 開局
    const opponentReadyField = OnlineState.playerRole === 'black' ? 'white_ready' : 'black_ready';
    const opponentReady = room[opponentReadyField];

    if (newReady && opponentReady && room.status === 'waiting') {
        // 兩邊都 ready → 開局
        updates.status = 'playing';
        updates.current_player = 'black';
        updates.turn_deadline_at = new Date(Date.now() + 30 * 1000).toISOString();
        updates.round_id = (room.round_id || 0) + 1;
        console.log('[Online] Both ready! Starting game...');
    }

    const { error: updateError } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update(updates)
        .eq('id', OnlineState.roomUuid);

    if (updateError) {
        console.error('[Online] toggleReady update error:', updateError);
        alert('更新失敗：' + updateError.message);
    }
}

// === 落子處理 (called by input.js) ===

async function handleOnlineMove(row, col, isWin, winner) {
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
        // 可能係 unique constraint violation (重疊落同一格)
        if (moveError.code === '23505') {
            alert('❌ 該格已有棋子！');
        } else {
            alert('落子失敗：' + moveError.message);
        }
        return;
    }

    // 2. UPDATE rooms table (turn + timer)
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

    const { error: roomError } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update(updates)
        .eq('id', OnlineState.roomUuid);

    if (roomError) {
        console.error('[Online] Room update error:', roomError);
    }

    console.log('[Online] Move recorded successfully');
}

// === 輔助函數 ===

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

// === Realtime: 訂閱房間變化 ===

function subscribeToRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    // 清理舊 subscription
    if (OnlineState.roomChannel) {
        OnlineState.sbClient.removeChannel(OnlineState.roomChannel);
    }

    const channelName = `room-${OnlineState.roomUuid}`;
    console.log('[Online] Subscribing to room:', channelName);

    OnlineState.roomChannel = OnlineState.sbClient
        .channel(channelName)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: "Gomoku's rooms",
                filter: `id=eq.${OnlineState.roomUuid}`
            },
            (payload) => {
                console.log('[Online] Room update received:', payload.new);
                renderRoomState(payload.new);
            }
        )
        .subscribe((status) => {
            console.log('[Online] Room subscription status:', status);
        });
}

// === Realtime: 訂閱落子 ===

function subscribeToMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    // 清理舊 subscription
    if (OnlineState.movesChannel) {
        OnlineState.sbClient.removeChannel(OnlineState.movesChannel);
    }

    const channelName = `moves-${OnlineState.roomUuid}`;
    console.log('[Online] Subscribing to moves:', channelName);

    OnlineState.movesChannel = OnlineState.sbClient
        .channel(channelName)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'moves',
                filter: `room_id=eq.${OnlineState.roomUuid}`
            },
            (payload) => {
                const move = payload.new;
                console.log('[Online] Move received:', move);

                // 只處理對手嘅落子 (自己嘅已經喺 input.js 處理咗)
                if (move.color !== OnlineState.playerRole) {
                    applyMoveToBoard(move.x, move.y, move.color);
                }
            }
        )
        .subscribe((status) => {
            console.log('[Online] Moves subscription status:', status);
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
        console.log('[Online] Applied move:', row, col, color);

        // 檢查贏
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

    // 清空棋盤
    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));

    // 應用每一步
    if (moves && moves.length > 0) {
        for (const move of moves) {
            applyMoveToBoard(move.x, move.y, move.color);
        }

        // 設置當前回合
        const nextPlayer = (moves.length % 2 === 0) ? 'black' : 'white';
        setCurrentPlayer(nextPlayer);
        updateStatusUI(nextPlayer);
    }
}

// === 退出房間 ===

async function exitFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) {
        cleanupAndReturnToLobby();
        return;
    }

    console.log('[Online] Exiting room...');

    // 清空我嘅座位
    const updates = {
        last_activity_at: new Date().toISOString()
    };

    if (OnlineState.playerRole === 'black') {
        updates.black_player_id = null;
        updates.black_ready = false;
    } else if (OnlineState.playerRole === 'white') {
        updates.white_player_id = null;
        updates.white_ready = false;
    }

    // 如果遊戲進行中，對手自動勝出
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
    // 清理 subscriptions
    if (OnlineState.roomChannel) {
        OnlineState.sbClient?.removeChannel(OnlineState.roomChannel);
        OnlineState.roomChannel = null;
    }
    if (OnlineState.movesChannel) {
        OnlineState.sbClient?.removeChannel(OnlineState.movesChannel);
        OnlineState.movesChannel = null;
    }

    // 清理 timer
    stopClientTimer();

    // 清理狀態
    OnlineState.roomKey = null;
    OnlineState.roomUuid = null;
    OnlineState.playerRole = null;
    OnlineState.roundNo = null;
    window.currentRoom = null;
    window.isGameReady = false;

    // 清理 localStorage
    localStorage.removeItem('gomoku_room_key');
    localStorage.removeItem('gomoku_player_role');

    // 返回 Lobby
    showView('online-lobby');
    fetchLobbyRooms();
}

// === Client-side Timer (唔寫 DB，只喺 timeout 時寫一次) ===

function startClientTimer(room) {
    stopClientTimer();

    if (!room.turn_deadline_at) return;

    OnlineState.timerInterval = setInterval(() => {
        // 用最新嘅 room state
        const currentRoom = window.currentRoom;
        if (!currentRoom || !currentRoom.turn_deadline_at) {
            updateTimerUI('--');
            return;
        }

        const deadline = new Date(currentRoom.turn_deadline_at).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));

        updateTimerUI(remaining);

        // Timeout 處理
        if (remaining <= 0 && window.currentRoom?.status === 'playing') {
            handleTimeout();
        }
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
    if (typeof seconds === 'number' && seconds <= 10) {
        el.classList.add('timer-warning');
    } else {
        el.classList.remove('timer-warning');
    }
}

async function handleTimeout() {
    if (OnlineState.timeoutClaimInProgress) return;
    if (!window.currentRoom || window.currentRoom.status !== 'playing') return;

    const room = window.currentRoom;
    const currentTurn = room.current_player;

    // 只有等緊對方落子嘅玩家先 claim timeout
    if (currentTurn === OnlineState.playerRole) {
        // 係我 timeout，等對方 claim
        console.log('[Online] I timed out, waiting for opponent to claim...');
        return;
    }

    OnlineState.timeoutClaimInProgress = true;
    console.log('[Online] Claiming timeout win...');

    const winner = OnlineState.playerRole;

    const { error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'finished',
            winner: winner,
            winner_color: winner,
            finished_reason: 'timeout',
            finished_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
        })
        .eq('id', OnlineState.roomUuid)
        .eq('status', 'playing'); // Optimistic lock

    if (error) {
        console.error('[Online] Timeout claim error:', error);
    } else {
        console.log('[Online] Timeout claimed successfully');
    }

    OnlineState.timeoutClaimInProgress = false;
}

// === 暫停 (簡化版，暫時唔實現) ===

function togglePause() {
    console.log('[Online] togglePause - not implemented in MVP');
}

// === 再戰一局 ===

async function rematchGame() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    console.log('[Online] Rematch requested...');

    // 重置房間狀態
    const { error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            black_ready: false,
            white_ready: false,
            current_player: null,
            turn_started_at: null,
            winner: null,
            winner_color: null,
            finished_reason: null,
            finished_at: null,
            last_activity_at: new Date().toISOString()
        })
        .eq('id', OnlineState.roomUuid);

    if (error) {
        console.error('[Online] Rematch error:', error);
        alert('重置失敗：' + error.message);
        return;
    }

    // 刪除所有舊嘅 moves
    await OnlineState.sbClient
        .from('moves')
        .delete()
        .eq('room_id', OnlineState.roomUuid);

    // 重置本地棋盤
    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));
    setGameOver(false);
}

// === 重置房間 (踢走所有人) ===

async function resetFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    if (!confirm('確定要重置房間？所有人都會被踢走。')) return;

    console.log('[Online] Resetting room...');

    // 完全重置
    const { error } = await OnlineState.sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            black_player_id: null,
            white_player_id: null,
            black_ready: false,
            white_ready: false,
            current_player: null,
            turn_started_at: null,
            winner: null,
            winner_color: null,
            finished_reason: null,
            finished_at: null,
            last_activity_at: new Date().toISOString()
        })
        .eq('id', OnlineState.roomUuid);

    if (error) {
        console.error('[Online] Reset room error:', error);
        alert('重置失敗：' + error.message);
        return;
    }

    // 刪除所有 moves
    await OnlineState.sbClient
        .from('moves')
        .delete()
        .eq('room_id', OnlineState.roomUuid);

    // 返回 Lobby
    cleanupAndReturnToLobby();
}

// === Expose for input.js ===
// input.js 會 call handleOnlineMove，需要 expose
window.handleOnlineMove = handleOnlineMove;

// 同時 expose 啲變數畀 input.js 讀取
Object.defineProperty(window, 'roomId', {
    get: () => OnlineState.roomKey
});
Object.defineProperty(window, 'playerRole', {
    get: () => OnlineState.playerRole
});
Object.defineProperty(window, 'roomRecordId', {
    get: () => OnlineState.roomUuid
});
