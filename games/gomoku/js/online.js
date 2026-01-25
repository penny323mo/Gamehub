
// --- Supabase Config ---
const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

// Global client instance
let sbClient = null;

let roomId = null;
let roomRecordId = null;
let playerRole = null;
let roomChannel = null;
let clientId = localStorage.getItem('gomoku_clientId');

if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('gomoku_clientId', clientId);
}

// Initialize Supabase
try {
    if (window.supabase) {
        // Safety: Trim key
        const safeKey = SUPABASE_ANON_KEY.trim();
        // Debug
        console.log("Supabase Key Check:", JSON.stringify(safeKey).slice(-20));

        // Note: User specified this is a PUBLISHABLE key, not a JWT. 
        // We must avoid sending it as "Bearer <key>" in Authorization header if possible,
        // or accept that Auth service will reject it.
        sbClient = window.supabase.createClient(SUPABASE_URL, safeKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            },
            // Attempt to override default headers to avoid "Invalid API Key" (401) from Auth layer
            // when it sees a non-JWT in Bearer. 
            // However, supabase-js might force it.
            // We rely on 'apikey' header being sufficient for REST if RLS allows.
        });
        window.sbClient = sbClient;
        console.log("Supabase Client Initialized");

        // Try Anonymous Auth - usually fails with non-JWT key, but worth a shot for RLS
        initAuth();

        updateDebugPanel(safeKey);
    } else {
        console.error("Supabase SDK not loaded on window.supabase");
        updateDebugPanel("N/A");
    }
} catch (err) {
    console.error("Supabase Init Error:", err);
    updateDebugPanel("Error: " + err.message);
}

async function initAuth() {
    if (!sbClient) return;
    // This will likely 401 if key is not JWT. That is expected.
    const { data, error } = await sbClient.auth.signInAnonymously();
    if (error) {
        console.warn("Auth (Anon) Skipped/Failed (Expected for Publishable Key):", error.message);
    } else {
        console.log("Auth Success:", data.user?.id);
        updateDebugPanel(SUPABASE_ANON_KEY.trim());
    }
}

// --- Debugging ---
function updateDebugPanel(key) {
    const safeKey = typeof key === 'string' ? key : 'Invalid';
    const el = (id) => document.getElementById(id);
    if (!el('dbg-url')) return;

    el('dbg-url').innerText = SUPABASE_URL;
    el('dbg-key-pre').innerText = safeKey.substring(0, 14) + '...';
    el('dbg-key-len').innerText = safeKey.length;
    el('dbg-key-tail').innerText = JSON.stringify(safeKey).slice(-10);
    el('dbg-win-sup').innerText = !!window.supabase;
    el('dbg-client').innerText = !!sbClient;

    // Auth Info
    sbClient?.auth.getUser().then(({ data }) => {
        const uid = data?.user?.id || 'None';
        // Hacky insert into panel if not exists
        if (!document.getElementById('dbg-auth')) {
            const div = document.createElement('div');
            div.innerHTML = `Auth User: <span id="dbg-auth">${uid}</span>`;
            el('dbg-client').parentNode.insertBefore(div, el('dbg-client').nextSibling);
        } else {
            document.getElementById('dbg-auth').innerText = uid;
        }
    });
}

window.pingSupabase = async function () {
    const el = document.getElementById('dbg-ping-log');
    if (!el) return;
    el.innerText = "Pinging...";

    const key = SUPABASE_ANON_KEY.trim();
    try {
        // PER USER REQUEST: Do NOT send Key in Authorization: Bearer.
        // Publishable keys are not JWTs.
        const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': key
                // Explicitly NO Authorization header
            }
        });
        const text = await res.text();
        el.innerText = `Status: ${res.status}\nRes: ${text.substring(0, 100)}`;
    } catch (e) {
        el.innerText = `Error: ${e.message}`;
    }
}

async function testSupabaseConnection() {
    // Deprecated in favor of Ping button, but kept for init check
    if (!sbClient) return;
    const { error } = await sbClient.from("Gomoku's rooms").select('count', { count: 'exact', head: true });
    if (error) console.error("Connection Test:", error);
}

// --- Room Logic ---

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function createRoom() {
    if (!sbClient) return alert("無法連接伺服器 (SDK Unloaded)");

    const code = generateRoomCode();
    console.log("Creating room:", code);

    // Create room in DB (Removed board_state to match schema)
    const { data, error } = await sbClient
        .from("Gomoku's rooms")
        .insert([{
            room_code: code,
            black_player_id: clientId,
            white_player_id: null,
            status: 'waiting',
            last_activity_at: new Date(),
            expires_at: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
            current_player: 'black'
        }])
        .select()
        .single();

    if (error) {
        console.error("Create Room Error:", error);
        // Improved Error Message
        logError(error);
        alert(`創建房間失敗\nCode: ${error.code}\nMsg: ${error.message}\nHint: ${error.hint || 'Check RLS policies'}`);
        return;
    }

    console.log("Room Created:", data);
    enterRoom(data, 'black');
}

function logError(error) {
    if (!error) return;
    console.error("[SupabaseError]", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
    });
}

async function joinRoom(codeInput) {
    if (!sbClient) return alert("無法連接伺服器");
    if (!codeInput) return alert("請輸入房號");

    const code = codeInput.toUpperCase().trim();

    // 1. Fetch Room
    let { data: room, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_code', code)
        .single();

    if (error || !room) {
        alert("找不到房間：" + code);
        return;
    }

    if (room.status === 'finished') {
        const confirmView = confirm("該房間對局已結束，是否仍要加入觀戰？");
        if (!confirmView) return;
    }

    // 2. Determine Role
    let role = 'spectator';
    let needsUpdate = false;
    let updates = {};

    if (room.black_player_id === clientId) {
        role = 'black';
    } else if (room.white_player_id === clientId) {
        role = 'white';
    } else if (!room.black_player_id) {
        role = 'black';
        updates.black_player_id = clientId;
        if (room.white_player_id) updates.status = 'playing';
        needsUpdate = true;
    } else if (!room.white_player_id) {
        role = 'white';
        updates.white_player_id = clientId;
        updates.status = 'playing';
        updates.current_player = 'black'; // Explicitly set starting player
        updates.turn_deadline_at = new Date(Date.now() + 30 * 1000); // 30s deadline
        needsUpdate = true;
    }

    // 3. Update DB if taking a seat
    if (needsUpdate) {
        const { error: updateError } = await sbClient
            .from("Gomoku's rooms")
            .update({ ...updates, last_activity_at: new Date() })
            .eq('id', room.id);

        if (updateError) {
            logError(updateError);
            alert("加入失敗");
            return;
        }
        Object.assign(room, updates);
    }

    // Crucial: We rely on subscription to transition to 'playing' state to keep flow consistent.
    // However, for Guest, we just updated it. 
    // We enter room now. If status is playing, enterRoom->renderRoomState should handle it.
    enterRoom(room, role);
}

function enterRoom(room, role) {
    // === STEP 1: Guard - 確保 room.id 存在（Critical for moves FK） ===
    if (!room || !room.id) {
        console.error('[enterRoom] CRITICAL: room.id is undefined!', room);
        alert('❌ 入房失敗：房間 ID 無效\n\n請刷新頁面重試或聯繫管理員');
        return;
    }

    if (!room.room_code) {
        console.error('[enterRoom] CRITICAL: room.room_code is undefined!', room);
        alert('❌ 入房失敗：房間號無效');
        return;
    }

    // === STEP 2: Set Global Variables ===
    roomId = room.room_code;           // e.g. "ROOM01"
    roomRecordId = room.id;             // UUID for FK
    playerRole = role;

    console.log('[enterRoom] ✅ Set variables:', {
        roomId,
        roomRecordId,
        playerRole,
        roomStatus: room.status
    });

    // Save Session for Reload
    localStorage.setItem('gomoku_room_id', roomId);
    localStorage.setItem('gomoku_player_role', role);

    setMode('online');
    setIsVsAI(false);

    // === CRITICAL: 初始化 board 避免 renderer crash ===
    if (!window.board) {
        window.board = createEmptyBoard();
        console.log('[enterRoom] Initialized empty board');
    }

    // Hotfix 1: Immediately lock board preventively
    setBoardInteractivity(true);

    // CRITICAL: Apply state BEFORE render to update gameStatus global
    applyRoomState(room);

    // Initial Render
    renderRoomState(room);

    // If already playing, ensure full game setup (Timer, board input, etc)
    if (room.status === 'playing' || room.status === 'paused') {
        console.log('[enterRoom] Game already active, calling ensureGameStarted');
        ensureGameStarted(room);

        // === CRITICAL: Fetch moves from DB to rebuild board (for Joiner sync) ===
        fetchAndApplyMoves(roomRecordId);
    }

    // Subscribe for updates
    subscribeToRoom();
}

// --- Game Logic ---

// --- Game State Machine & Timer ---

const GAME_STATUS = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    PAUSED: 'paused',
    FINISHED: 'finished'
};

let gameStatus = GAME_STATUS.WAITING;
let boardLocked = true;
let timerInterval = null;
window.currentRoom = null; // Ensure this is global

function setBoardInteractivity(locked) {
    const canvas = document.getElementById('gomoku-board');
    console.log('[BoardLock] setBoardInteractivity called:', locked, 'canvas:', !!canvas);
    if (canvas) {
        canvas.style.pointerEvents = locked ? 'none' : 'auto';
        console.log('[BoardLock] Canvas pointer-events set to:', canvas.style.pointerEvents);
    }
}

// Helper to calculate room readiness
function computeReady(room) {
    // Ready if we have a black player and a status that isn't 'waiting' (could be playing or paused)
    // Actually, 'waiting' status means not ready. 
    // And we need 2 players (implied if status is playing/paused usually, but check just in case)
    const hasBlack = !!room.black_player_id;
    const hasWhite = !!room.white_player_id;
    return hasBlack && hasWhite && (room.status !== 'waiting');
}

function applyRoomState(room) {
    if (!room) return;
    window.currentRoom = room;

    const ready = computeReady(room);

    // Determine Status
    // Map DB status to local Enum if needed, or just use DB status string directly if it matches.
    // DB: 'waiting', 'playing', 'paused', 'finished'
    gameStatus = room.status;

    // Determine Lock
    // Locked if: Not playing (e.g. waiting, paused, finished)
    boardLocked = (gameStatus !== GAME_STATUS.PLAYING);

    // CRITICAL: Unlock board when playing
    console.log('[ApplyRoomState] gameStatus:', gameStatus, 'boardLocked:', boardLocked);
    setBoardInteractivity(boardLocked);

    // UI: Board Lock Overlay
    const lockEl = document.getElementById('boardLock');
    if (lockEl) {
        lockEl.style.display = boardLocked ? 'block' : 'none';
        // Add specific visual cues for Pause
        if (gameStatus === GAME_STATUS.PAUSED) {
            lockEl.innerText = "GAME PAUSED";
            lockEl.style.display = 'flex';
            lockEl.style.justifyContent = 'center';
            lockEl.style.alignItems = 'center';
            lockEl.style.color = 'white';
            lockEl.style.fontSize = '2rem';
            lockEl.style.background = 'rgba(0,0,0,0.7)';
        } else {
            lockEl.innerText = "";
            lockEl.style.background = 'rgba(0,0,0,0.1)';
        }
    }

    // UI: Pause Button Text
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        pauseBtn.innerText = (gameStatus === GAME_STATUS.PAUSED) ? "繼續" : "暫停";
        // Disable pause button if game ended or waiting
        pauseBtn.disabled = (gameStatus === GAME_STATUS.WAITING || gameStatus === GAME_STATUS.FINISHED);
    }

    // UI: Waiting Message
    const waitMsg = document.getElementById('waiting-msg');
    if (waitMsg) {
        if (!ready && gameStatus !== GAME_STATUS.FINISHED) waitMsg.classList.remove('hidden');
        else waitMsg.classList.add('hidden');
    }

    // Timer Logic
    if (timerInterval) clearInterval(timerInterval);
    if (gameStatus === GAME_STATUS.PLAYING || gameStatus === GAME_STATUS.PAUSED) {
        startTimerWatchdog(); // No argument - uses window.currentRoom
    } else {
        updateTimerUI("--");
    }

    // Sync input.js global
    window.isGameReady = ready;
}


// --- Timer (Visual Only) ---
// FIXED: Use window.currentRoom for LIVE state, not a captured variable.

function startTimerWatchdog() {
    // Clear old
    if (timerInterval) clearInterval(timerInterval);

    console.log('[Timer] Starting watchdog (uses window.currentRoom)...');

    // VISUAL TICKER ONLY. Does NOT change state.
    timerInterval = setInterval(() => {
        const room = window.currentRoom; // LIVE state

        if (!room || !room.turn_deadline_at) {
            updateTimerUI("--");
            return;
        }

        // Don't tick if game ended
        if (room.status === 'finished') {
            updateTimerUI("--");
            clearInterval(timerInterval);
            return;
        }

        const deadline = new Date(room.turn_deadline_at).getTime();
        const now = Date.now();
        const diff = Math.ceil((deadline - now) / 1000);
        const remaining = diff > 0 ? diff : 0;

        updateTimerUI(remaining);

        // Check timeout every second (when remaining <= 0)
        if (remaining <= 0 && room.status === 'playing') {
            checkTimeout(room);
        }

    }, 100); // UI updates fast (100ms)
}

function isGamePlaying(room) {
    return room && room.status === 'playing' && window.isGameReady;
}

function updateTimerUI(seconds) {
    const el = document.getElementById('game-timer');
    if (!el) return;
    el.innerText = seconds;
    if (typeof seconds === 'number' && seconds <= 10) el.classList.add('timer-warning');
    else el.classList.remove('timer-warning');
}

// --- DB-Driven Logic ---

// Debounce flag to prevent multiple timeout claims
let timeoutClaimInProgress = false;

async function checkTimeout(room) {
    if (!room || room.status !== 'playing') return;
    if (timeoutClaimInProgress) return; // Already claiming

    // 1. Check Deadline
    if (!room.turn_deadline_at) return;
    const deadline = new Date(room.turn_deadline_at).getTime();
    const now = Date.now();

    // === GRACE PERIOD: Prevent immediate timeout on game start ===
    // If deadline was set less than 5 seconds ago, don't claim timeout yet
    // This protects against Realtime sync delays
    const deadlineSetAt = deadline - 30 * 1000; // Assume 30s timer was set
    const timeSinceDeadlineSet = now - deadlineSetAt;
    if (timeSinceDeadlineSet < 5000) {
        console.log('[checkTimeout] GRACE PERIOD: Only', Math.round(timeSinceDeadlineSet / 1000), 's since timer set. Skipping timeout check.');
        return;
    }

    if (now > deadline) {
        // Timeout!
        // Rule: The player waiting for move claims the win.
        const amIWaiting = (room.current_player !== playerRole);

        if (amIWaiting) {
            console.log('[Timeout] Deadline passed. Claiming win...');
            timeoutClaimInProgress = true;
            await claimTimeout(room);
            timeoutClaimInProgress = false;
        } else {
            // I timed out. Wait for opponent to claim, or fallback.
            console.log('[Timeout] Deadline passed but it was MY turn. Waiting for opponent to claim...');
            // Safety: If after 2s no one claims, I will claim as a fallback.
            setTimeout(async () => {
                const freshRoom = window.currentRoom;
                if (freshRoom && freshRoom.status === 'playing' && !timeoutClaimInProgress) {
                    console.log('[Timeout Fallback] Still playing after 2s. Force claiming...');
                    timeoutClaimInProgress = true;
                    await claimTimeout(freshRoom);
                    timeoutClaimInProgress = false;
                }
            }, 2000);
        }
    }
}

async function claimTimeout(room) {
    if (room.status !== 'playing') return;

    // Winner is the opponent of the current player.
    const winner = (room.current_player === 'black') ? 'white' : 'black';

    console.log('[claimTimeout] Attempting to write to DB: winner=' + winner);

    try {
        const { error } = await sbClient
            .from("Gomoku's rooms")
            .update({
                status: 'finished',
                ended_reason: 'timeout',
                last_result: winner + '_win',
                winner: winner,
                winner_color: winner,
                finished_reason: 'timeout',
                finished_at: new Date(),
                last_activity_at: new Date()
            })
            .eq('id', room.id)
            .eq('status', 'playing'); // Optimistic lock

        if (error) {
            throw error;
        }

        console.log('[claimTimeout] DB update success. Stopping timer...');

        // IMMEDIATELY update local state to prevent re-claims
        if (window.currentRoom) {
            window.currentRoom.status = 'finished';
            window.currentRoom.winner = winner;
        }

        // Stop timer
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        // Force UI sync
        renderRoomState(window.currentRoom);

    } catch (err) {
        logError(err);
        // Show error to user ALWAYS (per user request: no silent failures)
        alert('寫入超時結果失敗: ' + (err.message || err));
    }
}

async function togglePause() {
    if (!window.currentRoom) return;
    const room = window.currentRoom;
    const isPaused = (room.status === 'paused');

    if (isPaused) {
        // Resume
        const remaining = room.paused_remaining_s || 30;
        const newDeadline = new Date(Date.now() + remaining * 1000);

        await sbClient.from("Gomoku's rooms").update({
            status: 'playing',
            paused_at: null,
            paused_remaining_s: null,
            turn_deadline_at: newDeadline,
            last_activity_at: new Date()
        }).eq('id', room.id);
    } else {
        // Pause
        // Calc remaining
        const deadline = new Date(room.turn_deadline_at).getTime();
        const now = Date.now();
        const remain = Math.max(0, Math.ceil((deadline - now) / 1000));

        await sbClient.from("Gomoku's rooms").update({
            status: 'paused',
            paused_at: new Date(),
            paused_remaining_s: remain,
            last_activity_at: new Date()
        }).eq('id', room.id);
    }
}
window.togglePause = togglePause; // Expose

// --- Game Logic ---

function createEmptyBoard() {
    const b = [];
    for (let i = 0; i < 15; i++) {
        b.push(new Array(15).fill(null));
    }
    return b;
}

// --- DB Moves Sync (NEW) ---

// Get current move count from local board
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

// Insert a move into the moves table
async function insertMove(roomId, moveNo, x, y, color) {
    if (!sbClient || !roomId) return { error: { message: 'No client or roomId' } };

    console.log('[insertMove] Writing to moves table:', { roomId, moveNo, x, y, color });

    const { data, error, status } = await sbClient
        .from('moves')
        .insert([{
            room_id: roomId,
            move_no: moveNo,
            x: x,
            y: y,
            color: color
        }])
        .select();

    console.log('[insertMove] Response:', { status, error, dataLength: data?.length });
    return { data, error, status };
}

// Fetch all moves for a room and rebuild board
async function fetchAndApplyMoves(roomUuid) {
    if (!sbClient || !roomUuid) {
        console.warn('[fetchAndApplyMoves] No client or roomUuid');
        return;
    }

    console.log('[fetchAndApplyMoves] Fetching moves for room:', roomUuid);

    const { data: moves, error } = await sbClient
        .from('moves')
        .select('*')
        .eq('room_id', roomUuid)
        .order('move_no', { ascending: true });

    if (error) {
        console.error('[fetchAndApplyMoves] Error:', error);
        return;
    }

    console.log('[fetchAndApplyMoves] Found', moves?.length || 0, 'moves');

    if (!moves || moves.length === 0) return;

    // Ensure board exists
    if (!window.board) {
        window.board = createEmptyBoard();
        createBoardUI(handleCellClick);
    }

    // Apply each move
    for (const move of moves) {
        const { x, y, color } = move;
        // x = row, y = col in our convention
        if (window.board[x][y] === null) {
            window.board[x][y] = color;
            placeStoneUI(x, y, color);
            console.log('[fetchAndApplyMoves] Applied move:', x, y, color);
        }
    }

    // Set current player based on move count
    const nextPlayer = (moves.length % 2 === 0) ? 'black' : 'white';
    setCurrentPlayer(nextPlayer);
    updateStatusUI();

    console.log('[fetchAndApplyMoves] Board rebuilt. Next player:', nextPlayer);
}

// Called by input.js
async function handleOnlineMove(row, col, isWin, winner) {
    // === GUARD: 確保 roomRecordId 已設置 ===
    if (!roomRecordId) {
        console.error('[handleOnlineMove] ❌ BLOCKED: roomRecordId is undefined!');
        console.error('[handleOnlineMove] Current state:', {
            roomId,
            roomRecordId,
            playerRole,
            'window.currentRoom': window.currentRoom
        });
        alert('❌ 落子失敗：房間狀態未就緒\n\n請離開房間重新加入');
        // Lock board to prevent further attempts
        setBoardInteractivity(true);
        return;
    }

    const nextPlayer = (playerRole === 'black') ? 'white' : 'black';
    const moveNo = getMoveCount(); // Current move number (0-indexed becomes 1-indexed after this move)

    // === DEBUG: Pre-write log ===
    console.log('[handleOnlineMove] START', {
        row, col,
        isWin, winner,
        playerRole,
        roomRecordId,
        nextPlayer,
        moveNo
    });

    // === STEP 1: INSERT into moves table (DB 權威) ===
    const { error: moveError, status: moveStatus } = await insertMove(
        roomRecordId,
        moveNo + 1, // 1-indexed
        row,
        col,
        playerRole
    );

    if (moveError) {
        console.error('[handleOnlineMove] INSERT moves FAILED:', moveError);
        alert('❌ 落子記錄失敗！\n錯誤: ' + moveError.message);
        return;
    }
    console.log('[handleOnlineMove] INSERT moves SUCCESS. Status:', moveStatus);

    // === STEP 2: Broadcast Move (Visual Immediate for opponent) ===
    if (roomChannel) {
        roomChannel.send({
            type: 'broadcast',
            event: 'move',
            payload: { row, col, player: playerRole }
        });
        console.log('[handleOnlineMove] Broadcast sent');
    }

    // === STEP 3: PATCH rooms table (turn + timer) ===
    const newDeadline = new Date(Date.now() + 30 * 1000);
    const updates = {
        current_player: nextPlayer,
        last_move_at: new Date(),
        last_activity_at: new Date(),
        turn_deadline_at: newDeadline
    };

    if (isWin) {
        updates.status = 'finished';
        updates.last_result = winner + '_win';
        updates.winner = winner;
        updates.winner_color = winner;
        updates.ended_reason = 'win';
        updates.finished_reason = 'win';
        updates.finished_at = new Date();
        updates.turn_deadline_at = null;
    }

    console.log('[handleOnlineMove] PRE-WRITE rooms payload:', JSON.stringify(updates, null, 2));

    const { data, error, status, statusText } = await sbClient
        .from("Gomoku's rooms")
        .update(updates)
        .eq('id', roomRecordId)
        .select();

    console.log('[handleOnlineMove] POST-WRITE rooms response:', { status, statusText, error, dataLength: data?.length });

    if (error) {
        console.error('[handleOnlineMove] PATCH rooms FAILED:', error);
        alert('❌ 房間更新失敗！\n錯誤: ' + error.message + '\nCode: ' + error.code);
        return;
    }

    // === STEP 4: FORCED DB Readback (確保 Timer 用 DB 權威值) ===
    const { data: readback, error: readbackError } = await sbClient
        .from("Gomoku's rooms")
        .select('id, room_code, current_player, turn_deadline_at, status, last_move_at')
        .eq('id', roomRecordId)
        .single();

    if (readbackError) {
        console.error('[handleOnlineMove] READBACK FAILED:', readbackError);
    } else {
        console.log('[handleOnlineMove] READBACK SUCCESS:', JSON.stringify(readback, null, 2));

        // === CRITICAL: Sync local state with DB to ensure Timer uses DB authority ===
        if (window.currentRoom && readback) {
            const oldDeadline = window.currentRoom.turn_deadline_at;

            window.currentRoom.current_player = readback.current_player;
            window.currentRoom.turn_deadline_at = readback.turn_deadline_at;
            window.currentRoom.status = readback.status;
            window.currentRoom.last_move_at = readback.last_move_at;

            console.log('[handleOnlineMove] Local state synced. Old deadline:', oldDeadline, 'New:', readback.turn_deadline_at);

            // === RESTART TIMER with new deadline ===
            if (oldDeadline !== readback.turn_deadline_at) {
                console.log('[handleOnlineMove] Deadline changed, restarting timer watchdog');
                startTimerWatchdog();
            }
        }
    }

    console.log('[handleOnlineMove] COMPLETE (moves + rooms updated)');
}

async function requestRestart() {
    if (!roomRecordId) return;

    // CRITICAL: Clear old timer BEFORE starting new round
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (window.roomPollId) {
        clearInterval(window.roomPollId);
        window.roomPollId = null;
    }
    timeoutClaimInProgress = false;

    // Broadcast visual reset
    if (roomChannel) {
        roomChannel.send({
            type: 'broadcast',
            event: 'restart',
            payload: {}
        });
    }

    const nextRound = (window.currentRoom?.round_id || 1) + 1;
    console.log('[Rematch] Starting new round:', nextRound);

    const { error } = await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'playing',
            last_result: null,
            ended_reason: null,
            winner: null,
            winner_color: null,
            finished_reason: null,
            finished_at: null,
            paused_at: null,
            paused_remaining_s: null,
            current_player: 'black',
            round_id: nextRound,
            last_activity_at: new Date(),
            turn_deadline_at: new Date(Date.now() + 30 * 1000)
        })
        .eq('id', roomRecordId);

    if (error) {
        console.error('[Rematch] DB Error:', error);
        alert('再戰失敗: ' + error.message);
    }
}

// --- Helper Functions for Sync ---

async function fetchRoom(code) {
    if (!sbClient) return null;
    const { data, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_code', code)
        .single();
    if (error) {
        console.warn("fetchRoom Error:", error);
        return null;
    }
    return data;
}

function shouldStart(room) {
    if (!room) return false;

    // 1. Standard Start
    if (room.status === 'playing' || room.status === 'paused' || room.status === 'finished') return true;

    // 2. Auto-Promote Safety Net (Host Only)
    // If waiting but White is here, Host MUST promote state to 'playing'
    if (room.status === 'waiting' && room.white_player_id) {
        if (playerRole === 'black') {
            console.log("[AutoPromote] Host detected waiting room with opponent. Promoting to playing...");
            sbClient.from("Gomoku's rooms")
                .update({
                    status: 'playing',
                    started_at: new Date(),
                    turn_deadline_at: new Date(Date.now() + 30 * 1000),
                    current_player: 'black',
                    last_activity_at: new Date()
                })
                .eq('id', room.id)
                .then(({ error }) => {
                    if (error) logError(error);
                    else console.log("[AutoPromote] Success");
                });
            // Return true to allow local start (optimistic)
            return true;
        }
    }

    return false;
}

function startGameFromRoom(room) {
    console.log("startGameFromRoom Triggered:", room.status, room.white_player_id);
    ensureGameStarted(room);
}

function ensureGameStarted(room) {
    console.log("[Start] ensureGameStarted", {
        roomCode: room.room_code,
        status: room.status,
        myRole: playerRole,
        currentTurn: room.current_player,
        isGameReady: window.isGameReady
    });

    // 1. apply state
    applyRoomState(room);

    // 2. Render Basic UI
    renderRoomState(room);

    // 3. Force Unlock if Playing
    if (room.status === 'playing') {
        window.isGameReady = true;
        boardLocked = false;
        setBoardInteractivity(true); // Helper acts as 'set locked', so true means locked? 
        // Wait, setBoardInteractivity(locked) implicates pointerEvents = locked ? 'none' : 'auto';
        // So we want unlocked -> false
        setBoardInteractivity(false);

        // 4. Ensure Board & Input exist
        if (!window.board) {
            createEmptyBoard();
            createBoardUI(handleCellClick);
        } else {
            // Ensure click listener is bound (idempotent inside createBoardUI usually, but let's be safe if it was null)
            // actually createBoardUI resets listeners. code is fine.
            // maybe just ensure global onCellClick is set?
            if (!onCellClick) createBoardUI(handleCellClick);
        }

        // 5. Sync Turn
        if (room.current_player) {
            setCurrentPlayer(room.current_player);
            updateStatusUI();
        }

        // 6. CRITICAL: Force Timer Visibility with INLINE STYLE override
        const forceShowTimer = () => {
            const onlineControls = document.getElementById('online-controls');
            if (onlineControls) {
                onlineControls.classList.remove('hidden');
                onlineControls.style.display = 'flex'; // Override CSS !important
                console.log('[ensureGameStarted] Timer FORCE SHOWN. Classes:', onlineControls.className, 'Style:', onlineControls.style.display);
            }
        };
        forceShowTimer();
        // Delayed retry in case DOM not ready
        setTimeout(forceShowTimer, 100);
        setTimeout(forceShowTimer, 500);

        // 7. Start Timer
        startTimerWatchdog(); // No argument - uses window.currentRoom
    }
}

// --- Subscription ---

function subscribeToRoom() {
    // === GUARD: Ensure roomId and roomRecordId are set before subscribing ===
    if (!roomId || !roomRecordId) {
        console.error('[Subscribe] BLOCKED: roomId or roomRecordId is undefined!', { roomId, roomRecordId });
        return;
    }

    if (roomChannel) sbClient.removeChannel(roomChannel);

    const waitEl = document.getElementById('waiting-msg');
    if (waitEl && !document.getElementById('sub-status')) {
        waitEl.innerHTML += '<br><small id="sub-status">Connecting...</small>';
    }

    // Filter string MUST match the detailed row. Using Primary Key (id) is best.
    const filterStr = `id=eq.${roomRecordId}`;
    const channelName = `gomoku-${roomId}`;

    // === DEBUG: Subscription setup ===
    console.log('[Subscribe] === SUBSCRIPTION DEBUG ===');
    console.log('[Subscribe] Channel Name:', channelName);
    console.log('[Subscribe] Filter:', filterStr);
    console.log('[Subscribe] roomRecordId:', roomRecordId);
    console.log('[Subscribe] roomId:', roomId);
    console.log('[Subscribe] playerRole:', playerRole);

    // Event counter for debugging
    window.realtimeEventCount = 0;
    window.broadcastMoveCount = 0;

    roomChannel = sbClient.channel(channelName)
        .on("postgres_changes",
            { event: "*", schema: "public", table: "Gomoku's rooms", filter: filterStr },
            async (payload) => {
                window.realtimeEventCount++;
                console.log(`[Realtime] EVENT #${window.realtimeEventCount}: ${payload.eventType} received`);
                console.log('[Realtime] Payload:', JSON.stringify(payload.new, null, 2));

                // ALWAYS fetch fresh state
                const freshRoom = await fetchRoom(roomId);
                if (freshRoom) {
                    // === CRITICAL: Apply room state to sync Joiner ===
                    applyRoomState(freshRoom);
                    renderRoomState(freshRoom);

                    if (shouldStart(freshRoom)) {
                        startGameFromRoom(freshRoom);
                    } else {
                        handleRoomUpdate(freshRoom);
                    }
                }
            }
        )
        .on("broadcast", { event: "move" }, (payload) => {
            window.broadcastMoveCount++;
            console.log(`[Broadcast] MOVE #${window.broadcastMoveCount}:`, payload);
            const { row, col, player } = payload.payload;
            handleRemoteMove(row, col, player);
        })
        .on("broadcast", { event: "restart" }, (payload) => {
            console.log('[Broadcast] RESTART received');
            handleRemoteRestart();
        })
        .subscribe(async (status, error) => {
            console.log('[Subscribe] STATUS:', status, error ? 'Error: ' + error.message : '');
            const subEl = document.getElementById('sub-status');
            if (subEl) subEl.innerText = `Status: ${status} ${error ? error.message : ''}`;

            if (status === 'SUBSCRIBED') {
                console.log('[Subscribe] SUCCESS! Channel subscribed.');

                // === CRITICAL: Fetch moves from DB to rebuild board (DB 權威同步) ===
                await fetchAndApplyMoves(roomRecordId);

                // 1. Immediate Check
                checkAndStart();

                // 2. High-Frequency Polling Fallback (1s interval)
                // This catches BOTH pre-game wait AND in-game missed moves
                let pollAttempts = 0;
                if (window.roomPollId) clearInterval(window.roomPollId);

                window.roomPollId = setInterval(async () => {
                    pollAttempts++;

                    // === IN-GAME POLLING: Always sync if playing ===
                    if (window.currentRoom && window.currentRoom.status === 'playing') {
                        // Only log every 5th poll to reduce spam
                        if (pollAttempts % 5 === 0) {
                            console.log(`[Poll] Tick ${pollAttempts}. Syncing room state...`);
                        }
                        const freshRoom = await fetchRoom(roomId);
                        if (freshRoom) {
                            // Detect if state changed
                            const oldPlayer = window.currentRoom.current_player;
                            const oldDeadline = window.currentRoom.turn_deadline_at;

                            applyRoomState(freshRoom);

                            if (oldPlayer !== freshRoom.current_player || oldDeadline !== freshRoom.turn_deadline_at) {
                                console.log('[Poll] State change detected! Refreshing UI...');
                                renderRoomState(freshRoom);
                            }
                        }
                    }

                    // Stop after 5 minutes (300 polls at 1s each)
                    if (pollAttempts > 300) {
                        console.log('[Poll] Max attempts reached. Stopping poll.');
                        clearInterval(window.roomPollId);
                        return;
                    }

                    // Pre-game: check if should start
                    if (!window.isGameReady) {
                        await checkAndStart();
                    }
                }, 1000);
            } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
                console.error('[Subscribe] FAILED! Status:', status, 'Error:', error);
            }
        });

    async function checkAndStart() {
        const room = await fetchRoom(roomId);
        if (room) {
            // Apply State immediately so UI updates (e.g. White joined but waiting)
            applyRoomState(room);

            if (shouldStart(room)) {
                startGameFromRoom(room);
            } else {
                renderRoomState(room);
            }
        }
    }
}

// --- UI Sync ---

function handleRoomUpdate(room) {
    if (!room) return;
    console.log("Handle Room Update:", room);

    // If Playing, force ensureGameStarted to fix missing inputs/timer
    if (shouldStart(room)) {
        ensureGameStarted(room);
    } else {
        applyRoomState(room); // Updates state vars
        renderRoomState(room); // Updates DOM
    }
}

function handleRemoteMove(row, col, player) {
    // 1. Apply Move
    const result = tryPlaceStone(row, col, player);

    // 2. Update UI
    if (result.success) {
        placeStoneUI(row, col, player);
        // Turn switch logic handled by local input or DB sync usually, 
        // but for smooth realtime we should switch locally too if it wasn't us.
        if (!result.win) {
            // If I am black, and received white move, it becomes black turn.
            // switchTurn() toggles currentPlayer.
            // Verify it matches expected next player
            const next = player === 'black' ? 'white' : 'black';
            if (currentPlayer === player) {
                setCurrentPlayer(next);
                updateStatusUI();
            }
        }
    }

    // 3. Check Win (Remote Win)
    if (result.win) {
        setGameOver(true);
        updateWinUI(player);
        showRestartButton(true);
    }
}

function handleRemoteRestart() {
    console.log('[Rematch] handleRemoteRestart triggered');

    // CRITICAL: Clear old intervals to avoid stale countdowns
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timeoutClaimInProgress = false;

    // Reset local game state
    resetGameState();
    resetBoardUI();
    setGameOver(false);
    showRestartButton(false);
    setCurrentPlayer('black');

    // Ensure input is active
    createBoardUI((r, c) => handleCellClick(r, c, 'hard'));
    updateStatusUI('black');
}

// --- UI Helpers ---

function updateRoomUI_Header() {
    const idEl = document.getElementById('current-room-id');
    const roleEl = document.getElementById('my-role');
    if (idEl) idEl.innerText = roomId;
    if (roleEl) roleEl.innerText = (playerRole === 'black' ? '黑子 (先手)' : (playerRole === 'white' ? '白子' : '觀眾'));

    const lobby = document.getElementById('online-lobby');
    const room = document.getElementById('online-room');
    lobby.classList.add('hidden');
    room.classList.remove('hidden');

    // If joining an existing game in progress, ensure board is visible
    document.getElementById('game-board-area').classList.remove('hidden');
}

function showRestartButton(show) {
    const btn = document.getElementById('online-restart-btn');
    if (btn) {
        if (show) btn.classList.remove('hidden');
        else btn.classList.add('hidden');
    }
}

// Expose to window for HTML access
// --- New Core Logic (Safe Append) ---

function renderRoomState(room) {
    if (!room) return;
    // ensure state variables are fresh if called directly
    applyRoomState(room);

    const lobby = document.getElementById('online-lobby');
    const roomUI = document.getElementById('online-room');
    const boardArea = document.getElementById('game-board-area');

    // 1. Show Room UI
    if (lobby) lobby.classList.add('hidden');
    if (roomUI) roomUI.classList.remove('hidden');

    // 2. Info Update
    const idEl = document.getElementById('current-room-id');
    const roleEl = document.getElementById('my-role');
    if (idEl) idEl.innerText = room.room_code;

    let roleText = 'Spectator';
    if (room.black_player_id === clientId) roleText = 'Black (First)';
    else if (room.white_player_id === clientId) roleText = 'White (Second)';

    if (roleEl) roleEl.innerText = roleText;

    // 3. Status handling using Global State (computed in applyRoomState)
    if (gameStatus === GAME_STATUS.PLAYING || gameStatus === GAME_STATUS.FINISHED || gameStatus === GAME_STATUS.PAUSED) {
        if (boardArea) boardArea.classList.remove('hidden');

        if (!window.board) {
            createEmptyBoard();
            createBoardUI(handleCellClick);
        }

        if (room.current_player) {
            setCurrentPlayer(room.current_player);
        }

        updateStatusUI();
    } else {
        // Waiting
        if (boardArea) boardArea.classList.add('hidden');
    }

    // 4. Timer & Controls Visibility handled by applyRoomState's watchdog & ID checks
    const onlineControls = document.getElementById('online-controls');
    if (onlineControls) {
        console.log('[renderRoomState] Before remove hidden, classes:', onlineControls.className);
        onlineControls.classList.remove('hidden');
        console.log('[renderRoomState] After remove hidden, classes:', onlineControls.className);
        console.log('[renderRoomState] Computed display:', getComputedStyle(onlineControls).display);
    } else {
        console.warn('[renderRoomState] onlineControls element NOT FOUND!');
    }

    // 5. Game Over
    if (gameStatus === GAME_STATUS.FINISHED) {
        if (!gameOver) {
            setGameOver(true);
            // Try to find winner from various fields
            const winner = room.winner_color || room.winner || (room.last_result ? room.last_result.replace('_win', '') : 'black');
            const reason = room.finished_reason || room.ended_reason;
            let method = (reason === 'timeout') ? '超時' : '';

            updateWinUI(winner);

            if (method) {
                const wName = (winner === 'black') ? "黑子" : "白子";
                document.getElementById('status').innerHTML = `<span style="color:var(--neon-red)">${method}結束：${wName}勝</span>`;
                // Alert for User Awareness
                setTimeout(() => alert(`${method}！${wName}獲勝！`), 50);
            } else {
                const wName = (winner === 'black') ? "黑子" : "白子";
                setTimeout(() => alert(`${wName}獲勝！`), 50);
            }
        }
        showRestartButton(true);
    }
    // Resume local game state if valid
    else if (gameStatus === GAME_STATUS.PLAYING && gameOver && !room.last_result) {
        // Room says playing, local says gameOver? Reset.
        handleRemoteRestart();
    }
}

async function initOnlineMode() {
    const savedRoomId = localStorage.getItem('gomoku_room_id');

    if (savedRoomId) {
        console.log("Restoring session for room:", savedRoomId);
        const { data, error } = await sbClient
            .from("Gomoku's rooms")
            .select("*")
            .eq('room_code', savedRoomId)
            .single();

        if (data) {
            roomId = savedRoomId;
            roomRecordId = data.id;

            if (data.black_player_id === clientId) playerRole = 'black';
            else if (data.white_player_id === clientId) playerRole = 'white';
            else playerRole = 'spectator';

            subscribeToRoom();
            renderRoomState(data);
        } else {
            console.log("Saved room not found, clearing session.");
            exitRoom();
        }
    }
}

function exitRoom() {
    if (roomChannel) sbClient.removeChannel(roomChannel);
    localStorage.removeItem('gomoku_room_id');
    localStorage.removeItem('gomoku_player_role');

    roomId = null;
    roomRecordId = null;
    playerRole = null;
    isGameReady = false;
    window.isGameReady = false;
    window.currentRoom = null;

    const lobby = document.getElementById('online-lobby');
    const roomUI = document.getElementById('online-room');
    if (lobby) lobby.classList.remove('hidden');
    if (roomUI) roomUI.classList.add('hidden');

    // Close board if open
    document.getElementById('game-board-area').classList.add('hidden');
    resetGameState();
}

// =====================================================
// === DEBUG MODE: Fixed Rooms + Heartbeat + Cleanup ===
// =====================================================

window.DEBUG_MODE = false;
let heartbeatInterval = null;
const HEARTBEAT_INTERVAL_MS = 10000;  // 10 seconds
const TIMEOUT_THRESHOLD_MS = 25000;   // 25 seconds

// --- Join Debug Room (Fixed room1/2/3) ---
async function joinDebugRoom(roomKey) {
    if (!sbClient) return alert("無法連接伺服器 (SDK Unloaded)");

    window.DEBUG_MODE = true;
    console.log('[Debug] Joining fixed room:', roomKey);

    // 1. Fetch room by room_key
    let { data: room, error } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_key', roomKey)
        .single();

    if (error || !room) {
        console.error('[Debug] Room not found:', roomKey, error);
        alert('找不到 Debug 房間: ' + roomKey + '\n請確認已執行 DB migration');
        return;
    }

    console.log('[Debug] Room fetched:', room);

    // 2. Cleanup timeout players BEFORE joining
    room = await cleanupTimeoutPlayers(room);

    // 3. Determine slot and join
    let role = 'spectator';
    let updates = { last_activity_at: new Date() };

    if (room.black_client_id === clientId) {
        role = 'black';
        updates.black_last_seen_at = new Date();
    } else if (room.white_client_id === clientId) {
        role = 'white';
        updates.white_last_seen_at = new Date();
    } else if (!room.black_client_id) {
        role = 'black';
        updates.black_client_id = clientId;
        updates.black_player_id = clientId;
        updates.black_last_seen_at = new Date();
        if (room.white_client_id) {
            updates.status = 'playing';
            updates.current_player = 'black';
            updates.turn_deadline_at = new Date(Date.now() + 30000);
        }
    } else if (!room.white_client_id) {
        role = 'white';
        updates.white_client_id = clientId;
        updates.white_player_id = clientId;
        updates.white_last_seen_at = new Date();
        updates.status = 'playing';
        updates.current_player = 'black';
        updates.turn_deadline_at = new Date(Date.now() + 30000);
    }

    console.log('[Debug] Taking role:', role, 'Updates:', updates);

    // 4. Update DB
    const { error: updateError } = await sbClient
        .from("Gomoku's rooms")
        .update(updates)
        .eq('id', room.id);

    if (updateError) {
        console.error('[Debug] Join update failed:', updateError);
        alert('加入失敗: ' + updateError.message);
        return;
    }

    // 5. Re-fetch and enter
    const { data: freshRoom } = await sbClient
        .from("Gomoku's rooms")
        .select('*')
        .eq('id', room.id)
        .single();

    roomId = freshRoom.room_code;
    roomRecordId = freshRoom.id;
    playerRole = role;

    // Save Session
    localStorage.setItem('gomoku_room_id', roomId);
    localStorage.setItem('gomoku_player_role', role);
    localStorage.setItem('gomoku_debug_room_key', roomKey);

    setMode('online');
    setIsVsAI(false);

    // 6. Apply + Render
    applyRoomState(freshRoom);
    renderRoomState(freshRoom);

    // 7. Show Reset Room button (Debug only)
    const resetBtn = document.getElementById('reset-room-btn');
    if (resetBtn) resetBtn.classList.remove('hidden');

    // 8. Fetch moves + Subscribe
    await fetchAndApplyMoves(roomRecordId);
    subscribeToRoom();

    // 9. Start Heartbeat
    startHeartbeat();

    // 10. If playing, start game
    if (freshRoom.status === 'playing' || freshRoom.status === 'paused') {
        ensureGameStarted(freshRoom);
    }

    console.log('[Debug] Joined as', role, 'in room', roomKey);
}

// --- Heartbeat (every 10 seconds) ---
function startHeartbeat() {
    stopHeartbeat();
    console.log('[Heartbeat] Starting (interval=' + HEARTBEAT_INTERVAL_MS + 'ms)...');

    heartbeatInterval = setInterval(async () => {
        if (!roomRecordId || !playerRole || playerRole === 'spectator') return;

        const updates = { last_activity_at: new Date() };
        if (playerRole === 'black') {
            updates.black_last_seen_at = new Date();
        } else if (playerRole === 'white') {
            updates.white_last_seen_at = new Date();
        }

        const { error } = await sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', roomRecordId);

        if (error) {
            console.warn('[Heartbeat] Update failed:', error.message);
        } else {
            console.log('[Heartbeat] Sent:', playerRole);
        }
    }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
        console.log('[Heartbeat] Stopped');
    }
}

// --- Cleanup Timeout Players (threshold: 25s) ---
async function cleanupTimeoutPlayers(room) {
    if (!room) return room;

    const now = Date.now();
    const updates = {};
    let needsReset = false;

    // Check black player timeout
    if (room.black_client_id && room.black_last_seen_at) {
        const elapsed = now - new Date(room.black_last_seen_at).getTime();
        if (elapsed > TIMEOUT_THRESHOLD_MS) {
            console.log('[Cleanup] Black player timeout (' + Math.round(elapsed / 1000) + 's). Clearing...');
            updates.black_client_id = null;
            updates.black_player_id = null;
            updates.black_last_seen_at = null;
        }
    }

    // Check white player timeout
    if (room.white_client_id && room.white_last_seen_at) {
        const elapsed = now - new Date(room.white_last_seen_at).getTime();
        if (elapsed > TIMEOUT_THRESHOLD_MS) {
            console.log('[Cleanup] White player timeout (' + Math.round(elapsed / 1000) + 's). Clearing...');
            updates.white_client_id = null;
            updates.white_player_id = null;
            updates.white_last_seen_at = null;
        }
    }

    // Check if room needs reset
    const blackWillBeEmpty = updates.black_client_id === null || (!room.black_client_id && updates.black_client_id === undefined);
    const whiteWillBeEmpty = updates.white_client_id === null || (!room.white_client_id && updates.white_client_id === undefined);

    // After applying updates, will both be empty?
    const blackEmpty = updates.hasOwnProperty('black_client_id') ? updates.black_client_id === null : !room.black_client_id;
    const whiteEmpty = updates.hasOwnProperty('white_client_id') ? updates.white_client_id === null : !room.white_client_id;

    if (blackEmpty && whiteEmpty) {
        console.log('[Cleanup] Both players gone. Resetting room...');
        updates.status = 'waiting';
        updates.current_player = 'black';
        updates.turn_deadline_at = null;
        updates.last_result = null;
        updates.winner = null;
        updates.winner_color = null;
        updates.finished_reason = null;
        updates.ended_reason = null;
        needsReset = true;
    } else if (room.status === 'playing' && (updates.black_client_id === null || updates.white_client_id === null)) {
        // One player left mid-game
        console.log('[Cleanup] One player left during game. Resetting...');
        updates.status = 'waiting';
        updates.current_player = 'black';
        updates.turn_deadline_at = null;
        updates.last_result = null;
        updates.winner = null;
        needsReset = true;
    }

    // Apply cleanup updates
    if (Object.keys(updates).length > 0) {
        updates.last_activity_at = new Date();

        const { error } = await sbClient
            .from("Gomoku's rooms")
            .update(updates)
            .eq('id', room.id);

        if (error) {
            console.error('[Cleanup] Update failed:', error);
        } else {
            console.log('[Cleanup] Applied updates:', updates);
        }

        // Clear moves if resetting
        if (needsReset) {
            await sbClient.from('moves').delete().eq('room_id', room.id);
            console.log('[Cleanup] Moves cleared');
        }

        // Re-fetch fresh room
        const { data: freshRoom } = await sbClient
            .from("Gomoku's rooms")
            .select('*')
            .eq('id', room.id)
            .single();

        return freshRoom || room;
    }

    return room;
}

// --- Reset Debug Room (Button handler) ---
async function resetDebugRoom() {
    if (!roomRecordId) {
        alert('無房間可 Reset');
        return;
    }

    const confirmReset = confirm('確定要重置此房間？所有對局資料將被清空。');
    if (!confirmReset) return;

    console.log('[Reset] Resetting room:', roomRecordId);

    // 1. Clear moves
    await sbClient.from('moves').delete().eq('room_id', roomRecordId);

    // 2. Reset room state
    const { error } = await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'waiting',
            current_player: 'black',
            turn_deadline_at: null,
            black_client_id: null,
            white_client_id: null,
            black_player_id: null,
            white_player_id: null,
            black_last_seen_at: null,
            white_last_seen_at: null,
            last_result: null,
            winner: null,
            winner_color: null,
            finished_reason: null,
            ended_reason: null,
            finished_at: null,
            paused_at: null,
            paused_remaining_s: null,
            last_activity_at: new Date()
        })
        .eq('id', roomRecordId);

    if (error) {
        console.error('[Reset] Failed:', error);
        alert('Reset 失敗: ' + error.message);
        return;
    }

    console.log('[Reset] Room reset complete');

    // 3. Stop heartbeat
    stopHeartbeat();

    // 4. Clear local state
    resetGameState();
    resetBoardUI();

    // 5. Exit to debug lobby
    exitRoom();
    selectMode('debug');
}

// --- Override exitRoom for Debug Mode ---
const originalExitRoom = exitRoom;
exitRoom = function () {
    stopHeartbeat();
    localStorage.removeItem('gomoku_debug_room_key');
    window.DEBUG_MODE = false;

    // Hide reset button
    const resetBtn = document.getElementById('reset-room-btn');
    if (resetBtn) resetBtn.classList.add('hidden');

    originalExitRoom();
};

// Expose to window for HTML access
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.joinDebugRoom = joinDebugRoom;
window.resetDebugRoom = resetDebugRoom;
window.requestRestart = requestRestart;
window.exitRoom = exitRoom;
window.initOnlineMode = initOnlineMode;

