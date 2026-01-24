
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
            current_player: 'black'
        }])
        .select()
        .single();

    if (error) {
        console.error("Create Room Error:", error);
        // Improved Error Message
        alert(`創建房間失敗\nCode: ${error.code}\nMsg: ${error.message}\nHint: ${error.hint || 'Check RLS policies'}`);
        return;
    }

    console.log("Room Created:", data);
    enterRoom(data, 'black');
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
            console.error(updateError);
            alert("加入失敗");
            return;
        }
        Object.assign(room, updates);
    }

    enterRoom(room, role);
}

function enterRoom(room, role) {
    roomId = room.room_code;
    roomRecordId = room.id;
    playerRole = role;

    // Save Session for Reload
    localStorage.setItem('gomoku_room_id', roomId);
    localStorage.setItem('gomoku_player_role', role);

    setMode('online');
    setIsVsAI(false);

    // Hotfix 1: Immediately lock board preventively
    setBoardInteractivity(true);

    // Initial Render
    renderRoomState(room);

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
    if (canvas) {
        canvas.style.pointerEvents = locked ? 'none' : 'auto';
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
    // Locked if: Not playing (e.g. waiting, paused, finished) OR Not my turn?
    // The "boardLocked" flag specifically represents "Is the board interactive logically?"
    // Input.js will also check turn. Here we check "Global Game State".
    boardLocked = (gameStatus !== GAME_STATUS.PLAYING);

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
        startTimerWatchdog(room);
    } else {
        updateTimerUI("--");
    }

    // Sync input.js global
    window.isGameReady = ready;
}

function startTimerWatchdog(room) {
    const timerDisplay = document.getElementById('game-timer');

    timerInterval = setInterval(() => {
        let remaining = 0;

        if (room.status === 'paused') {
            remaining = room.paused_remaining_s || 30;
        } else if (room.status === 'playing' && room.turn_deadline_at) {
            const deadline = new Date(room.turn_deadline_at).getTime();
            const now = Date.now(); // Use Client time approximation, but DB is source
            // Note: Client time drift is a risk. Ideally use server time offset. 
            // For now, assume synced clock or close enough.
            const diff = Math.ceil((deadline - now) / 1000);
            remaining = diff > 0 ? diff : 0;

            // Timeout Claim (Double Guard)
            if (diff <= 0) {
                claimTimeout(room);
                clearInterval(timerInterval);
                remaining = 0;
            }
        }

        updateTimerUI(remaining);
    }, 500);
}

function updateTimerUI(seconds) {
    const el = document.getElementById('game-timer');
    if (!el) return;
    el.innerText = seconds;
    if (typeof seconds === 'number' && seconds <= 10) el.classList.add('timer-warning');
    else el.classList.remove('timer-warning');
}

async function claimTimeout(room) {
    // Only claim if I am the one waiting for the OTHER to move? 
    // Or just ANYONE claims it. 
    // To avoid double writes, let the "Next Player" claim the win? 
    // OR: Current player claims "I timed out"? No.
    // Rule: The opponent of the current_turn player claims the win.
    const myTurn = (room.current_player === playerRole);
    if (myTurn) return; // I timed out, let opponent claim (or I could resign, but let's stick to opponent claim)

    if (room.status !== 'playing') return;

    console.log("Claiming Timeout via Client...");
    // Strict DB Update with RPC-like conditions
    const winner = (room.current_player === 'black') ? 'white' : 'black';

    await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'finished',
            ended_reason: 'timeout',
            last_result: winner + '_win',
            winner: winner,
            last_activity_at: new Date()
        })
        .eq('id', room.id)
        .eq('status', 'playing')
        .lt('turn_deadline_at', new Date().toISOString()); // Only if server time agrees (roughly)
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

// Called by input.js
async function handleOnlineMove(row, col, isWin, winner) {
    if (!roomRecordId) return;

    const nextPlayer = (playerRole === 'black') ? 'white' : 'black';

    // Broadcast Move
    if (roomChannel) {
        roomChannel.send({
            type: 'broadcast',
            event: 'move',
            payload: { row, col, player: playerRole }
        });
    }

    // Update DB
    const updates = {
        current_player: nextPlayer,
        last_activity_at: new Date(),
        // New Deadline: 30 seconds from now
        turn_deadline_at: new Date(Date.now() + 30 * 1000)
    };

    if (isWin) {
        updates.status = 'finished';
        updates.last_result = winner + '_win';
        updates.winner = winner;
        updates.ended_reason = 'win';
        updates.turn_deadline_at = null; // Clear deadline
    }

    await sbClient
        .from("Gomoku's rooms")
        .update(updates)
        .eq('id', roomRecordId);
}

async function requestRestart() {
    if (!roomRecordId) return;

    if (roomChannel) {
        roomChannel.send({
            type: 'broadcast',
            event: 'restart',
            payload: {}
        });
    }

    await sbClient
        .from("Gomoku's rooms")
        .update({
            status: 'playing',
            last_result: null,
            ended_reason: null,
            winner: null,
            paused_at: null,
            paused_remaining_s: null,
            current_player: 'black',
            last_activity_at: new Date(),
            turn_deadline_at: new Date(Date.now() + 30 * 1000)
        })
        .eq('id', roomRecordId);
}

// --- Subscription ---

function subscribeToRoom() {
    if (roomChannel) sbClient.removeChannel(roomChannel);

    const waitEl = document.getElementById('waiting-msg');
    if (waitEl && !document.getElementById('sub-status')) {
        waitEl.innerHTML += '<br><small id="sub-status">Connecting...</small>';
    }

    roomChannel = sbClient.channel(`gomoku-${roomId}`)
        .on("postgres_changes",
            { event: "UPDATE", schema: "public", table: '"Gomoku\'s rooms"' },
            (payload) => {
                // Client-side filter
                if (payload.new.id !== roomRecordId) return;
                console.log("Room Update Payload:", payload);
                handleRoomUpdate(payload.new);
            }
        )
        .on("broadcast", { event: "move" }, (payload) => {
            console.log("Broadcast Move:", payload);
            const { row, col, player } = payload.payload;
            handleRemoteMove(row, col, player);
        })
        .on("broadcast", { event: "restart" }, (payload) => {
            handleRemoteRestart();
        })
        .subscribe((status, error) => {
            console.log("Subscription Status:", status, error);
            const subEl = document.getElementById('sub-status');
            if (subEl) subEl.innerText = `Status: ${status} ${error ? error.message : ''}`;

            // Initial Fetch to ensure state is fresh
            if (status === 'SUBSCRIBED') {
                sbClient.from("Gomoku's rooms").select("*").eq('id', roomRecordId).single()
                    .then(({ data }) => {
                        if (data) renderRoomState(data);
                    });
            }
        });
}

// --- UI Sync ---

function handleRoomUpdate(room) {
    if (!room) return;
    console.log("Handle Room Update:", room);
    applyRoomState(room); // Updates state vars
    renderRoomState(room); // Updates DOM
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
    resetGameState();
    resetBoardUI();
    setGameOver(false);
    showRestartButton(false);
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
        onlineControls.classList.remove('hidden');
    }

    // 5. Game Over
    if (gameStatus === GAME_STATUS.FINISHED) {
        if (!gameOver) {
            setGameOver(true);
            const winner = room.winner || (room.last_result ? room.last_result.replace('_win', '') : 'black');
            let method = room.ended_reason === 'timeout' ? '超時' : '';

            // Custom UI update for timeout? "White Win (Timeout)"
            // updateWinUI only accepts "black" or "white". We might need to hack the alert or status.
            updateWinUI(winner);

            if (method) {
                // Determine who won name
                const wName = winner === 'black' ? "黑子" : "白子";
                document.getElementById('status').innerHTML = `<span style="color:var(--neon-red)">${method}結束：${wName}勝</span>`;
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

// Expose to window for HTML access
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.requestRestart = requestRestart;
window.exitRoom = exitRoom;
window.initOnlineMode = initOnlineMode;
