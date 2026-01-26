/**
 * Gomoku Online Mode - DB-Driven V2
 * 
 * 核心修正：
 * 1. 統一用 core.js 嘅 board（透過 setBoard/board）
 * 2. 自己落子也經 Realtime pipeline（避免各玩各）
 * 3. Heartbeat + Stale 清理（避免幽靈玩家）
 * 4. 詳細 console log
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
    timerInterval: null,
    heartbeatInterval: null,
    appliedMoveIds: new Set(),  // 已應用嘅 move IDs（避免重複）
    currentRoundId: null,  // 追蹤 round_id 偵測新局
    hasSeat: false  // 只有成功入座後才為 true（避免 KICKED 誤判）
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

    // 頁面關閉時嘗試退出
    window.addEventListener('beforeunload', () => {
        if (OnlineState.roomUuid) exitFixedRoom();
    });

    fetchLobbyRooms();
}

// === Lobby ===

async function fetchLobbyRooms() {
    if (!OnlineState.sbClient) return;

    // 呼叫 RPC 清理過期房間（server-side）
    await cleanStaleRoomsRPC();

    const { data: rooms, error } = await OnlineState.sbClient
        .from('gomoku_rooms')
        .select('room_code, black_player_id, white_player_id, status, last_activity_at, waiting_since, both_present_since, black_ready, white_ready')
        .in('room_code', FIXED_ROOMS);

    if (error) {
        console.error('[Lobby] Error:', error);
        return;
    }

    // Debug log：顯示超時計時欄位
    console.log('[Lobby] Rooms:', rooms?.map(r => ({
        code: r.room_code,
        status: r.status,
        black: r.black_player_id ? '有' : '空',
        white: r.white_player_id ? '有' : '空',
        black_ready: r.black_ready,
        white_ready: r.white_ready,
        waiting_since: r.waiting_since,
        both_present_since: r.both_present_since
    })));

    FIXED_ROOMS.forEach(key => {
        const room = rooms?.find(r => r.room_code === key);
        updateRoomCardUI(key, room);
    });
}

// 呼叫 server-side RPC 清理過期房間
async function cleanStaleRoomsRPC() {
    if (!OnlineState.sbClient) return;

    try {
        const { data, error } = await OnlineState.sbClient.rpc('clean_stale_gomoku_rooms');
        if (data?.cleaned > 0) {
            console.log('[Stale] RPC cleaned', data.cleaned, 'rooms');
        }
    } catch (e) {
        console.log('[Stale] RPC error (non-fatal):', e.message);
    }
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

// === 加入房間 ===

async function joinFixedRoom(roomKey) {
    if (!OnlineState.sbClient) return;
    console.log('[Join] Joining:', roomKey);

    // 0. 先清理過期房間
    await cleanStaleRoomsRPC();

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

    // 2. 決定角色 + 設置超時計時欄位
    let role = null;
    let updateData = { last_activity_at: new Date().toISOString() };
    const now = new Date().toISOString();
    const hasBlack = room.black_player_id != null;
    const hasWhite = room.white_player_id != null;
    let conditionField = null;  // 用於條件 update

    if (room.black_player_id === OnlineState.clientId) {
        // Rejoin：已經係黑方
        role = 'black';
        // 補寫 timestamp（如果係 null）
        if (hasWhite && !room.both_present_since) {
            updateData.both_present_since = now;
            updateData.waiting_since = null;
        } else if (!hasWhite && !room.waiting_since) {
            updateData.waiting_since = now;
        }
    } else if (room.white_player_id === OnlineState.clientId) {
        // Rejoin：已經係白方
        role = 'white';
        // 補寫 timestamp（如果係 null）
        if (hasBlack && !room.both_present_since) {
            updateData.both_present_since = now;
            updateData.waiting_since = null;
        } else if (!hasBlack && !room.waiting_since) {
            updateData.waiting_since = now;
        }
    } else if (!room.black_player_id) {
        role = 'black';
        updateData.black_player_id = OnlineState.clientId;
        conditionField = 'black_player_id';  // 條件 update：確保仍然係 null
        // 第一個人入房：設置 waiting_since
        if (!room.white_player_id) {
            updateData.waiting_since = now;
        } else {
            // 第二個人入房：設置 both_present_since，清空 waiting_since
            updateData.both_present_since = now;
            updateData.waiting_since = null;
        }
    } else if (!room.white_player_id) {
        role = 'white';
        updateData.white_player_id = OnlineState.clientId;
        conditionField = 'white_player_id';  // 條件 update：確保仍然係 null
        // 第二個人入房：設置 both_present_since，清空 waiting_since
        updateData.both_present_since = now;
        updateData.waiting_since = null;
    } else {
        alert('房間已滿');
        return;
    }

    // 3. 寫入 DB（永遠 update，確保 last_activity_at 同 timestamp 正確）
    let query = OnlineState.sbClient
        .from('gomoku_rooms')
        .update(updateData)
        .eq('id', room.id);

    // 條件 update：如果係新入座，確保該位置仍然係 null
    if (conditionField) {
        query = query.is(conditionField, null);
    }

    const { data: updatedRows, error: updateErr } = await query.select();

    if (updateErr) {
        alert('加入失敗：' + updateErr.message);
        return;
    }

    // 檢查條件 update 是否成功（如果冇 row 返回，代表被搶咗）
    if (!updatedRows || updatedRows.length === 0) {
        alert('位置剛被搶走，請重新選擇');
        fetchLobbyRooms();
        return;
    }

    Object.assign(room, updatedRows[0]);
    OnlineState.hasSeat = true;  // 成功入座
    // 4. 設置狀態
    OnlineState.roomKey = roomKey;
    OnlineState.roomUuid = room.id;
    OnlineState.playerRole = role;
    OnlineState.appliedMoveIds.clear();
    OnlineState.currentRoundId = room.round_id || 0;  // 初始化 round_id
    console.log('[Join] Joined as:', role, 'UUID:', room.id, 'round_id:', OnlineState.currentRoundId);

    // 5. 進入房間 UI
    enterRoomView(room);

    // 6. 訂閱 Realtime（先訂閱，再 fetch）
    subscribeToRoom();
    subscribeToMoves();

    // 7. 如果已在 playing，拉取現有棋子
    if (room.status === 'playing') {
        await fetchAndApplyMoves();
    }

    // 8. 啟動 heartbeat
    startHeartbeat();
}

function enterRoomView(room) {
    setMode('online');
    setIsVsAI(false);
    showView('online-room');

    // 重置棋盤（用 core.js 嘅 resetGameState）
    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));
    renderRoomState(room);
}

// === 硬重置棋盤（round_id 變化時觸發）===

function hardResetBoard() {
    console.log('[Board] === HARD RESET ===');

    // 清空已應用嘅 move IDs
    OnlineState.appliedMoveIds.clear();

    // 重置棋盤狀態
    resetGameState();
    createBoardUI((r, c) => handleCellClick(r, c));
    setGameOver(false);

    console.log('[Board] Hard reset complete');
}

// === Heartbeat（每 10 秒更新 last_activity_at）===

function startHeartbeat() {
    stopHeartbeat();
    OnlineState.heartbeatInterval = setInterval(async () => {
        if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

        await OnlineState.sbClient
            .from('gomoku_rooms')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('id', OnlineState.roomUuid);

        console.log('[Heartbeat] Updated');
    }, 10000);
}

function stopHeartbeat() {
    if (OnlineState.heartbeatInterval) {
        clearInterval(OnlineState.heartbeatInterval);
        OnlineState.heartbeatInterval = null;
    }
}

// === 渲染房間狀態 ===

function renderRoomState(room) {
    if (!room) return;

    console.log('[Render]', { status: room.status, current: room.current_player, round_id: room.round_id, br: room.black_ready, wr: room.white_ready });

    // 1. 偵測被踢 / 席位被清空（只在成功入座後才檢測）
    if (OnlineState.hasSeat && OnlineState.playerRole && OnlineState.roomUuid) {
        const myIdInRoom = OnlineState.playerRole === 'black' ? room.black_player_id : room.white_player_id;
        if (myIdInRoom !== OnlineState.clientId) {
            console.log('[Render] ⚠️ KICKED: my seat is no longer mine!');
            alert('你已被系統移出房間');
            cleanupAndReturnToLobby();
            return;
        }
    }

    // 2. 偵測 round_id 變化 = 新局開始，需要清棋盤
    const newRoundId = room.round_id || 0;
    if (OnlineState.currentRoundId !== null && newRoundId !== OnlineState.currentRoundId) {
        console.log('[Render] ★ NEW ROUND DETECTED ★', OnlineState.currentRoundId, '->', newRoundId);
        hardResetBoard();
    }
    OnlineState.currentRoundId = newRoundId;

    window.currentRoom = room;
    window.isGameReady = room.status === 'playing';

    const roomIdEl = document.getElementById('current-room-id');
    const roleEl = document.getElementById('my-role');
    if (roomIdEl) roomIdEl.textContent = OnlineState.roomKey;
    if (roleEl) roleEl.textContent = OnlineState.playerRole === 'black' ? '⚫黑' : '⚪白';

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

    const canvas = document.getElementById('gomoku-board');
    if (canvas) canvas.style.pointerEvents = room.status === 'playing' ? 'auto' : 'none';

    const controls = document.getElementById('online-controls');
    if (controls) controls.classList.toggle('hidden', room.status !== 'playing');

    const gameOverActions = document.getElementById('game-over-actions');
    if (gameOverActions) gameOverActions.classList.toggle('hidden', room.status !== 'finished');

    if (room.status === 'playing') {
        setCurrentPlayer(room.current_player || 'black');
        updateStatusUI(room.current_player);
        startClientTimer(room);
    } else if (room.status === 'finished') {
        stopClientTimer();
        if (room.winner_color) updateStatusUI(null, `${room.winner_color === 'black' ? '⚫黑' : '⚪白'} 獲勝！`);
    }
}

// === Ready ===

async function toggleReady() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;
    console.log('[Ready] Toggle ready');

    const { data: room } = await OnlineState.sbClient
        .from('gomoku_rooms')
        .select('*')
        .eq('id', OnlineState.roomUuid)
        .single();

    if (!room || !room.black_player_id || !room.white_player_id) {
        alert('請等待對手加入');
        return;
    }

    const myReadyField = OnlineState.playerRole === 'black' ? 'black_ready' : 'white_ready';
    const newReady = !room[myReadyField];

    console.log('[Ready] Setting', myReadyField, '=', newReady);

    const { error } = await OnlineState.sbClient
        .from('gomoku_rooms')
        .update({ [myReadyField]: newReady })
        .eq('id', OnlineState.roomUuid);
    // 注意：唔清 both_present_since，由 RPC 用 ready/status 判斷是否踢人

    if (error) {
        console.error('[Ready] Error:', error);
        alert('更新失敗');
    }
}

// === 落子（只 INSERT moves，唔直接畫棋）===

async function handleOnlineMove(row, col) {
    // 注意：移除咗 isWin/winner 參數，勝負由 server 判定
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    const room = window.currentRoom;
    if (!room || room.status !== 'playing') {
        console.log('[Move] Not in playing state');
        return;
    }

    if (room.current_player !== OnlineState.playerRole) {
        console.log('[Move] Not my turn');
        alert('唔係你嘅回合！');
        return;
    }

    console.log('[Move] INSERT:', row, col, OnlineState.playerRole);

    // 只 INSERT moves，DB trigger 會自動生成 move_no 同切換回合
    // UI 更新由 Realtime 推動（包括自己嘅棋）
    // 勝負由 applyMoveToBoard 收到 realtime 後 checkWin
    const { data, error } = await OnlineState.sbClient
        .from('moves')
        .insert([{
            room_id: OnlineState.roomUuid,
            x: row,
            y: col,
            color: OnlineState.playerRole
            // 唔傳 move_no，由 DB trigger 自動生成
        }])
        .select()
        .single();

    if (error) {
        console.error('[Move] Error:', error);
        if (error.message.includes('Not your turn')) {
            alert('唔係你嘅回合！');
        } else {
            alert('落子失敗：' + error.message);
        }
        return;
    }

    console.log('[Move] Inserted successfully, move_id:', data?.id);
    // 注意：唔再喺呢度 update rooms finished，勝負由 applyMoveToBoard 處理
}

// === Realtime 訂閱 ===

function subscribeToRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    if (OnlineState.roomChannel) {
        OnlineState.sbClient.removeChannel(OnlineState.roomChannel);
    }

    const channelName = `room-${OnlineState.roomUuid}`;
    console.log('[RT-ROOM] Subscribing:', channelName);

    OnlineState.roomChannel = OnlineState.sbClient
        .channel(channelName)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'gomoku_rooms',
            filter: `id=eq.${OnlineState.roomUuid}`
        }, (payload) => {
            console.log('[RT-ROOM] Event:', payload.eventType, JSON.stringify({
                status: payload.new?.status,
                current: payload.new?.current_player,
                br: payload.new?.black_ready,
                wr: payload.new?.white_ready
            }));
            if (payload.new) renderRoomState(payload.new);
        })
        .subscribe((status, err) => {
            console.log('[RT-ROOM] Status:', status);
            if (err) console.error('[RT-ROOM] Error:', err);
            if (status === 'SUBSCRIBED') {
                console.log('[RT-ROOM] ✓ Subscribed');
            }
        });
}

function subscribeToMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    if (OnlineState.movesChannel) {
        OnlineState.sbClient.removeChannel(OnlineState.movesChannel);
    }

    const channelName = `moves-${OnlineState.roomUuid}`;
    console.log('[RT-MOVES] Subscribing:', channelName);

    OnlineState.movesChannel = OnlineState.sbClient
        .channel(channelName)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'moves',
            filter: `room_id=eq.${OnlineState.roomUuid}`
        }, (payload) => {
            const move = payload.new;
            console.log('[RT-MOVES] Event:', JSON.stringify({ id: move?.id, x: move?.x, y: move?.y, color: move?.color, move_no: move?.move_no }));

            if (move && move.id) {
                // 用 move.id 去重，避免重複落子
                if (!OnlineState.appliedMoveIds.has(move.id)) {
                    console.log('[RT-MOVES] Applying move:', move.x, move.y, move.color);
                    applyMoveToBoard(move.x, move.y, move.color, move.id);
                } else {
                    console.log('[RT-MOVES] Skipping duplicate:', move.id);
                }
            }
        })
        .subscribe((status, err) => {
            console.log('[RT-MOVES] Status:', status);
            if (err) console.error('[RT-MOVES] Error:', err);
            if (status === 'SUBSCRIBED') {
                console.log('[RT-MOVES] ✓ Subscribed');
            }
        });
}

// === 應用落子到棋盤（統一入口）===

function applyMoveToBoard(row, col, color, moveId) {
    // 記錄已應用嘅 move
    if (moveId) {
        OnlineState.appliedMoveIds.add(moveId);
    }

    // 確保 board 已初始化（用 core.js 嘅 board）
    // resetGameState() 會初始化 board
    if (!board || board.length === 0) {
        console.warn('[Board] Board not initialized, initializing...');
        resetGameState();
    }

    // 檢查格子是否為空
    const currentValue = board[row]?.[col];
    console.log('[Board] Cell [', row, ',', col, '] current:', currentValue, 'placing:', color);

    if (currentValue == null) {
        board[row][col] = color;
        placeStoneUI(row, col, color);
        console.log('[Board] ✓ Placed:', row, col, color);

        if (checkWin(row, col, color)) {
            console.log('[Board] Winner:', color);
            setGameOver(true);
            updateWinUI(color);

            // 兩邊 client 都會 checkWin，但只有第一個成功 update
            // 使用條件 update eq('status', 'playing') 避免重複
            if (OnlineState.sbClient && OnlineState.roomUuid) {
                OnlineState.sbClient
                    .from('gomoku_rooms')
                    .update({
                        status: 'finished',
                        winner_color: color,
                        finished_reason: 'win',
                        finished_at: new Date().toISOString()
                    })
                    .eq('id', OnlineState.roomUuid)
                    .eq('status', 'playing')  // 條件 update：只有 playing 時才更新
                    .then(({ error }) => {
                        if (error) console.log('[Board] Win update skipped (already finished)');
                        else console.log('[Board] Win updated to DB');
                    });
            }
        }
    } else {
        console.log('[Board] ✗ Cell not empty, skipping');
    }
}

// === 入房時拉取現有棋子 ===

async function fetchAndApplyMoves() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    const { data: moves, error } = await OnlineState.sbClient
        .from('moves')
        .select('*')
        .eq('room_id', OnlineState.roomUuid)
        .order('move_no', { ascending: true });

    console.log('[Fetch] Moves count:', moves?.length || 0);

    if (error) {
        console.error('[Fetch] Error:', error);
        return;
    }

    if (moves) {
        for (const m of moves) {
            if (!OnlineState.appliedMoveIds.has(m.id)) {
                console.log('[Fetch] Applying:', m.x, m.y, m.color, 'id:', m.id);
                applyMoveToBoard(m.x, m.y, m.color, m.id);
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

    console.log('[Leave] Exiting...');
    stopHeartbeat();

    const updateData = { last_activity_at: new Date().toISOString() };
    if (OnlineState.playerRole === 'black') {
        updateData.black_player_id = null;
        updateData.black_ready = false;
    } else {
        updateData.white_player_id = null;
        updateData.white_ready = false;
    }

    const room = window.currentRoom;
    if (room?.status === 'playing') {
        // 對局中離開 = 認輸
        updateData.status = 'finished';
        updateData.winner_color = OnlineState.playerRole === 'black' ? 'white' : 'black';
        updateData.finished_reason = 'opponent_left';
        updateData.finished_at = new Date().toISOString();
        updateData.waiting_since = null;
        updateData.both_present_since = null;
    } else if (room?.status === 'waiting') {
        // waiting 狀態離開 → 確保復位
        updateData.current_player = null;
        updateData.both_present_since = null;
        // 如果另一邊仲有人，重新設置 waiting_since
        const otherStillHere = (OnlineState.playerRole === 'black' && room.white_player_id) ||
            (OnlineState.playerRole === 'white' && room.black_player_id);
        if (otherStillHere) {
            updateData.waiting_since = new Date().toISOString();
        } else {
            updateData.waiting_since = null;
        }
    }

    await OnlineState.sbClient
        .from('gomoku_rooms')
        .update(updateData)
        .eq('id', OnlineState.roomUuid);

    cleanupAndReturnToLobby();
}

function cleanupAndReturnToLobby() {
    stopHeartbeat();
    stopClientTimer();

    if (OnlineState.roomChannel) OnlineState.sbClient?.removeChannel(OnlineState.roomChannel);
    if (OnlineState.movesChannel) OnlineState.sbClient?.removeChannel(OnlineState.movesChannel);

    OnlineState.roomKey = null;
    OnlineState.roomUuid = null;
    OnlineState.playerRole = null;
    OnlineState.roomChannel = null;
    OnlineState.movesChannel = null;
    OnlineState.appliedMoveIds.clear();
    OnlineState.hasSeat = false;  // 重置入座 flag
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
    if (room.current_player === OnlineState.playerRole) return;

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

    // 清空 moves
    await OnlineState.sbClient
        .from('moves')
        .delete()
        .eq('room_id', OnlineState.roomUuid);

    // 更新房間狀態 + round_id+1（會觸發兩邊 hardResetBoard）
    const newRoundId = (window.currentRoom?.round_id || 0) + 1;
    console.log('[Rematch] New round_id:', newRoundId);

    await OnlineState.sbClient
        .from('gomoku_rooms')
        .update({
            status: 'waiting',
            black_ready: false,
            white_ready: false,
            current_player: null,
            turn_deadline_at: null,
            winner_color: null,
            finished_reason: null,
            finished_at: null,
            round_id: newRoundId,
            waiting_since: null,
            both_present_since: null
        })
        .eq('id', OnlineState.roomUuid);

    // 本地會由 Realtime 收到 round_id 變更後自動 hardResetBoard
    console.log('[Rematch] Waiting for Realtime to trigger hardResetBoard');
}

async function resetFixedRoom() {
    if (!OnlineState.sbClient || !OnlineState.roomUuid) return;

    // 防止連續狂點
    const resetBtn = document.getElementById('reset-room-btn');
    if (resetBtn) {
        if (resetBtn.disabled) return;
        resetBtn.disabled = true;
        resetBtn.textContent = '重置中…';
    }

    console.log('[Reset] Resetting room...');

    try {
        await OnlineState.sbClient
            .from('moves')
            .delete()
            .eq('room_id', OnlineState.roomUuid);

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
                finished_reason: null,
                finished_at: null,
                round_id: (window.currentRoom?.round_id || 0) + 1,
                waiting_since: null,
                both_present_since: null
            })
            .eq('id', OnlineState.roomUuid);

        console.log('[Reset] Room reset complete');
        cleanupAndReturnToLobby();
    } catch (err) {
        console.error('[Reset] Error:', err);
        if (resetBtn) {
            resetBtn.disabled = false;
            resetBtn.textContent = '重置房間';
        }
    }
}

// === Expose ===
Object.defineProperty(window, 'roomId', { get: () => OnlineState.roomKey });
Object.defineProperty(window, 'playerRole', { get: () => OnlineState.playerRole });
Object.defineProperty(window, 'roomRecordId', { get: () => OnlineState.roomUuid });
