/**
 * Gomoku Online Mode - DB-Driven 架構
 * 
 * 核心原則：
 * 1. Client 只做輸入器：join/leave/ready/move
 * 2. Client 禁止 UPDATE game 狀態 (current_player/status/deadline)
 * 3. DB Trigger 處理所有狀態轉換
 * 4. UI 完全由 Realtime payload 驅動
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
    roomChannel: null,
    movesChannel: null,
    clientId: null,
    timerInterval: null
};

// === 初始化 ===

function initOnlineMode() {
    // 生成/讀取 clientId
    OnlineState.clientId = localStorage.getItem('gomoku_clientId');
    if (!OnlineState.clientId) {
        OnlineState.clientId = crypto.randomUUID();
        localStorage.setItem('gomoku_clientId', OnlineState.clientId);
    }
    console.log('[Online] ClientId:', OnlineState.clientId);

    // 初始化 Supabase
    if (window.supabase) {
        OnlineState.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY.trim(), {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
        });
        console.log('[Online] Supabase initialized');
    } else {
        console.error('[Online] Supabase SDK not loaded');
        return;
    }

    // Expose globals
    window.joinFixedRoom = joinFixedRoom;
    window.exitFixedRoom = exitFixedRoom;
    window.toggleReady = toggleReady;
    window.rematchGame = rematchGame;
    window.resetFixedRoom = resetFixedRoom;
    window.handleOnlineMove = handleOnlineMove;

    fetchLobbyRooms();
}

// === Lobby: 讀取房間狀態 ===

async function fetchLobbyRooms() {
    if (!OnlineState.sbClient) return;

    const { data: rooms, error } = await OnlineState.sbClient
        .from('gomoku_rooms')
        .select('room_code, black_player_id, white_player_id, status')
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

    const statusMap = { 'waiting': '等待中', 'playing': '對戰中', 'finished': '已結束' };
    statusEl.textContent = statusMap[room.status] || room.status;
    playersEl.textContent = `${room.black_player_id ? '⚫有人' : '⚫空'} / ${room.white_player_id ? '⚪有人' : '⚪空'}`;

    const isFull = room.black_player_id && room.white_player_id;
    const amIIn = room.black_player_id === OnlineState.clientId || room.white_player_id === OnlineState.clientId;

    joinBtn.disabled = isFull && !amIIn;
    joinBtn.textContent = amIIn ? '返回' : isFull ? '已滿' : '加入';
}

// === 加入房間 (只 UPDATE player_id) ===

async function joinFixedRoom(roomKey) {
    if (!OnlineState.sbClient) return;
    console.log('[Join] Joining:', roomKey);

    // 1. 讀取房間
    const { data: room, error } = await OnlineState.sbClient
        .from('gomoku_rooms')
        .select('*')
        .eq('room_code', roomKey)
        .single();

    if (error || !room) {
        alert('房間唔存在');
        return;
    }

    // 2. 決定角色 + UPDATE player_id (只更新座位，唔更新其他狀態)
    let role = null;
    let updateData = { last_activity_at: new Date().toISOString() };

    if (room.black_player_id === OnlineState.clientId) {
        role = 'black';
    } else if (room.white_player_id === OnlineState.clientId) {
        role = 'white';
    } else if (!room.black_player_id) {
        role = 'black';
        updateData.black_player_id = OnlineState.clientId;
    } else if (!room.white_player_id) {
        role = 'white';
        updateData.white_player_id = OnlineState.clientId;
    } else {
        alert('房間已滿');
        return;
    }

    // 3. 寫入 DB (只更新 player_id)
    if (updateData.black_player_id || updateData.white_player_id) {
        const { data: updated, error: updateErr } = await OnlineState.sbClient
            .from('gomoku_rooms')
            .update(updateData)
            .eq('id', room.id)
            .select()
            .single();

        if (updateErr) {
            alert('加入失敗：' + updateErr.message);
            return;
        }
        Object.assign(room, updated);
    }

    // 4. 設置本地狀態
    OnlineState.roomKey = roomKey;
    OnlineState.roomUuid = room.id;
    OnlineState.playerRole = role;
    console.log('[Join] Joined as:', role, 'UUID:', room.id);

    // 5. 訂閱 Realtime
    subscribeToRoom();
    subscribeToMoves();

    // 6. 進入房間 UI
    enterRoomView(room);

    // 7. 如果已在 playing，拉取現有棋子
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

// === 渲染房間狀態 (由 Realtime 驅動) ===

function renderRoomState(room) {
    if (!room) return;

    console.log('[Render]', { status: room.status, current: room.current_player, br: room.black_ready, wr: room.white_ready });
    window.currentRoom = room;
    window.isGameReady = room.status === 'playing';

    // 房間號 + 身份
    const roomIdEl = document.getElementById('current-room-id');
    const roleEl = document.getElementById('my-role');
    if (roomIdEl) roomIdEl.textContent = OnlineState.roomKey;
    if (roleEl) roleEl.textContent = OnlineState.playerRole === 'black' ? '⚫黑' : '⚪白';

    // 等待對手
    const waitingEl = document.getElementById('waiting-msg');
    const hasOpponent = room.black_player_id && room.white_player_id;
    if (waitingEl) {
        waitingEl.style.display = hasOpponent ? 'none' : 'block';
        waitingEl.textContent = hasOpponent ? '' : '等待對手加入...';
    }

    // Ready 區域
    const readyArea = document.getElementById('ready-status');
    const blackReadyEl = document.getElementById('black-ready-status');
    const whiteReadyEl = document.getElementById('white-ready-status');
    const readyBtn = document.getElementById('toggle-ready-btn');

    if (room.status === 'waiting') {
        if (readyArea) readyArea.classList.remove('hidden');
        if (blackReadyEl) blackReadyEl.textContent = `⚫黑：${room.black_player_id ? (room.black_ready ? '已準備' : '未準備') : '空位'}`;
        if (whiteReadyEl) whiteReadyEl.textContent = `⚪白：${room.white_player_id ? (room.white_ready ? '已準備' : '未準備') : '空位'}`;

        if (readyBtn) {
            const myReady = OnlineState.playerRole === 'black' ? room.black_ready : room.white_ready;
            readyBtn.textContent = myReady ? '取消準備' : '準備';
            readyBtn.disabled = !hasOpponent;
        }
    } else {
        if (readyArea) readyArea.classList.add('hidden');
    }

    // 棋盤鎖定
    const canvas = document.getElementById('gomoku-board');
    if (canvas) canvas.style.pointerEvents = room.status === 'playing' ? 'auto' : 'none';

    // 控制區
    const controls = document.getElementById('online-controls');
    if (controls) controls.classList.toggle('hidden', room.status !== 'playing');

    const gameOverActions = document.getElementById('game-over-actions');
    if (gameOverActions) gameOverActions.classList.toggle('hidden', room.status !== 'finished');

    // 回合顯示
    if (room.status === 'playing') {
        setCurrentPlayer(room.current_player || 'black');
        updateStatusUI(room.current_player);
        startClientTimer(room);
    } else if (room.status === 'finished') {
        stopClientTimer();
        if (room.winner_color) updateStatusUI(null, `${room.winner_color === 'black' ? '⚫黑' : '⚪白'} 獲勝！`);
    }
}

// === Ready (只 UPDATE ready flag，DB trigger 處理開始) ===

async function toggleReady() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    console.log('[Ready] Toggle ready');

    // 1. 讀取 current state
    const { data: room } = await OnlineState.sbClient
        .from('gomoku_rooms')
        .select('*')
        .eq('id', OnlineState.roomUuid)
        .single();

    if (!room || !room.black_player_id || !room.white_player_id) {
        alert('請等待對手加入');
        return;
    }

    // 2. 只 UPDATE ready flag (DB trigger 會處理開始)
    const myReadyField = OnlineState.playerRole === 'black' ? 'black_ready' : 'white_ready';
    const newReady = !room[myReadyField];

    console.log('[Ready] Setting', myReadyField, '=', newReady);

    const { error } = await OnlineState.sbClient
        .from('gomoku_rooms')
        .update({ [myReadyField]: newReady })
        .eq('id', OnlineState.roomUuid);

    if (error) {
        console.error('[Ready] Error:', error);
        alert('更新失敗');
    }
    // 唔再本地更新 UI，等 Realtime 推
}

// === 落子 (只 INSERT moves，DB trigger 處理回合切換) ===

async function handleOnlineMove(row, col, isWin, winner) {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    console.log('[Move] Insert:', row, col, OnlineState.playerRole);

    // 只 INSERT moves，DB trigger 會處理 current_player 切換
    const { error } = await OnlineState.sbClient
        .from('moves')
        .insert([{
            room_id: OnlineState.roomUuid,
            x: row,
            y: col,
            color: OnlineState.playerRole,
            move_no: getMoveCount()
        }]);

    if (error) {
        console.error('[Move] Error:', error);
        if (error.message.includes('Not your turn')) {
            alert('唔係你嘅回合！');
        } else {
            alert('落子失敗：' + error.message);
        }
        return;
    }

    // 如果贏咗，UPDATE status=finished (這個由前端判斷)
    if (isWin) {
        await OnlineState.sbClient
            .from('gomoku_rooms')
            .update({
                status: 'finished',
                winner_color: winner,
                finished_reason: 'win',
                finished_at: new Date().toISOString()
            })
            .eq('id', OnlineState.roomUuid);
    }
}

function getMoveCount() {
    if (!window.board) return 0;
    let count = 0;
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (window.board[r]?.[c]) count++;
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

    const channelName = `room-${OnlineState.roomUuid}`;
    console.log('[RT] Subscribing room:', channelName);

    OnlineState.roomChannel = OnlineState.sbClient
        .channel(channelName)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'gomoku_rooms',
            filter: `id=eq.${OnlineState.roomUuid}`
        }, (payload) => {
            console.log('[RT] Room event:', payload.eventType, payload.new?.status);
            if (payload.new) renderRoomState(payload.new);
        })
        .subscribe((status, err) => {
            console.log('[RT] Room subscription:', status);
            if (err) console.error('[RT] Error:', err);
        });
}

function subscribeToMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    if (OnlineState.movesChannel) {
        OnlineState.sbClient.removeChannel(OnlineState.movesChannel);
    }

    const channelName = `moves-${OnlineState.roomUuid}`;
    console.log('[RT] Subscribing moves:', channelName);

    OnlineState.movesChannel = OnlineState.sbClient
        .channel(channelName)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'moves',
            filter: `room_id=eq.${OnlineState.roomUuid}`
        }, (payload) => {
            const move = payload.new;
            console.log('[RT] Move:', move?.x, move?.y, move?.color);
            if (move && move.color !== OnlineState.playerRole) {
                applyMoveToBoard(move.x, move.y, move.color);
            }
        })
        .subscribe((status, err) => {
            console.log('[RT] Moves subscription:', status);
            if (err) console.error('[RT] Error:', err);
        });
}

// === 應用落子到棋盤 ===

function applyMoveToBoard(row, col, color) {
    if (!window.board) {
        window.board = [];
        for (let i = 0; i < 15; i++) window.board.push(new Array(15).fill(null));
    }

    if (window.board[row]?.[col] == null) {
        window.board[row][col] = color;
        placeStoneUI(row, col, color);
        console.log('[Board] Applied:', row, col, color);

        if (checkWin(row, col, color)) {
            setGameOver(true);
            updateWinUI(color);
        }
    }
}

// === 入房時拉取現有棋子 ===

async function fetchAndApplyMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    const { data: moves } = await OnlineState.sbClient
        .from('moves')
        .select('*')
        .eq('room_id', OnlineState.roomUuid)
        .order('move_no', { ascending: true });

    console.log('[Fetch] Moves:', moves?.length || 0);

    if (moves) {
        for (const m of moves) {
            if (window.board[m.x]?.[m.y] == null) {
                window.board[m.x][m.y] = m.color;
                placeStoneUI(m.x, m.y, m.color);
            }
        }
    }
}

// === 退出房間 (只 UPDATE player_id = null) ===

async function exitFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) {
        cleanupAndReturnToLobby();
        return;
    }

    console.log('[Leave] Exiting...');

    // 只清除自己嘅 player_id
    const updateData = { last_activity_at: new Date().toISOString() };
    if (OnlineState.playerRole === 'black') {
        updateData.black_player_id = null;
        updateData.black_ready = false;
    } else {
        updateData.white_player_id = null;
        updateData.white_ready = false;
    }

    // 如果喺 playing，對手獲勝
    const room = window.currentRoom;
    if (room?.status === 'playing') {
        updateData.status = 'finished';
        updateData.winner_color = OnlineState.playerRole === 'black' ? 'white' : 'black';
        updateData.finished_reason = 'opponent_left';
    }

    await OnlineState.sbClient
        .from('gomoku_rooms')
        .update(updateData)
        .eq('id', OnlineState.roomUuid);

    cleanupAndReturnToLobby();
}

function cleanupAndReturnToLobby() {
    if (OnlineState.roomChannel) OnlineState.sbClient?.removeChannel(OnlineState.roomChannel);
    if (OnlineState.movesChannel) OnlineState.sbClient?.removeChannel(OnlineState.movesChannel);

    stopClientTimer();
    OnlineState.roomKey = null;
    OnlineState.roomUuid = null;
    OnlineState.playerRole = null;
    OnlineState.roomChannel = null;
    OnlineState.movesChannel = null;
    window.currentRoom = null;
    window.isGameReady = false;

    showView('online-lobby');
    fetchLobbyRooms();
}

// === Timer ===

function startClientTimer(room) {
    stopClientTimer();
    if (!room.turn_deadline_at) return;

    OnlineState.timerInterval = setInterval(() => {
        const cr = window.currentRoom;
        if (!cr?.turn_deadline_at || cr.status !== 'playing') {
            updateTimerUI('--');
            return;
        }
        const remaining = Math.max(0, Math.ceil((new Date(cr.turn_deadline_at) - Date.now()) / 1000));
        updateTimerUI(remaining);
        if (remaining <= 0) handleTimeout();
    }, 200);
}

function stopClientTimer() {
    if (OnlineState.timerInterval) clearInterval(OnlineState.timerInterval);
    OnlineState.timerInterval = null;
    updateTimerUI('--');
}

function updateTimerUI(sec) {
    const el = document.getElementById('game-timer');
    if (el) {
        el.textContent = sec;
        el.classList.toggle('timer-warning', typeof sec === 'number' && sec <= 10);
    }
}

async function handleTimeout() {
    const room = window.currentRoom;
    if (!room || room.status !== 'playing') return;
    if (room.current_player === OnlineState.playerRole) return; // 我超時，唔做野

    // 對手超時，我獲勝
    await OnlineState.sbClient
        .from('gomoku_rooms')
        .update({
            status: 'finished',
            winner_color: OnlineState.playerRole,
            finished_reason: 'timeout'
        })
        .eq('id', OnlineState.roomUuid)
        .eq('status', 'playing');
}

// === Rematch ===

async function rematchGame() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    await OnlineState.sbClient
        .from('gomoku_rooms')
        .update({
            status: 'waiting',
            black_ready: false,
            white_ready: false,
            current_player: null,
            turn_deadline_at: null,
            winner_color: null,
            finished_reason: null
        })
        .eq('id', OnlineState.roomUuid);

    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));
    setGameOver(false);
}

async function resetFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    if (!confirm('確定重置房間？')) return;

    await OnlineState.sbClient
        .from('gomoku_rooms')
        .update({
            status: 'waiting',
            black_player_id: null,
            white_player_id: null,
            black_ready: false,
            white_ready: false,
            current_player: null,
            turn_deadline_at: null,
            winner_color: null,
            finished_reason: null
        })
        .eq('id', OnlineState.roomUuid);

    await OnlineState.sbClient
        .from('moves')
        .delete()
        .eq('room_id', OnlineState.roomUuid);

    cleanupAndReturnToLobby();
}

// === Expose ===
Object.defineProperty(window, 'roomId', { get: () => OnlineState.roomKey });
Object.defineProperty(window, 'playerRole', { get: () => OnlineState.playerRole });
Object.defineProperty(window, 'roomRecordId', { get: () => OnlineState.roomUuid });
