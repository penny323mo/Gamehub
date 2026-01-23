
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

    setMode('online');
    setIsVsAI(false);

    document.getElementById('online-lobby').classList.add('hidden');
    document.getElementById('online-room').classList.remove('hidden');
    document.getElementById('game-board-area').classList.remove('hidden');

    updateRoomUI_Header();

    // Subscribe
    subscribeToRoom();

    // Init Board (Local Reset, no persistence from DB)
    resetGameState();
    resetBoardUI();

    setCurrentPlayer(room.current_player || 'black');
    updateStatusUI();

    if (room.status === 'finished' && room.last_result) {
        setGameOver(true);
        updateWinUI(room.last_result.replace('_win', ''));
        showRestartButton(true);
    } else {
        setGameOver(false);
        showRestartButton(false);
    }

    // Set Ready State
    updateGameReadyState(room.status);
}

// --- Game Logic ---

let isGameReady = false;
window.isGameReady = false; // Exposed for input.js

function updateGameReadyState(status) {
    // We are ready if status is playing. 
    // If finished, we are also technically "active" (viewing board), 
    // but input is blocked by gameOver check in input.js anyway.
    // Explicitly:
    isGameReady = (status === 'playing');
    window.isGameReady = isGameReady;

    // Update UI message
    const waitMsg = document.getElementById('waiting-msg');
    if (waitMsg) {
        if (status === 'waiting') waitMsg.classList.remove('hidden');
        else waitMsg.classList.add('hidden');
    }
}

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

    // Update DB (Status Only)
    const updates = {
        current_player: nextPlayer,
        last_activity_at: new Date()
    };

    if (isWin) {
        updates.status = 'finished';
        updates.last_result = winner + '_win';
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
            current_player: 'black',
            last_activity_at: new Date()
        })
        .eq('id', roomRecordId);
}

// --- Subscription ---

function subscribeToRoom() {
    if (roomChannel) sbClient.removeChannel(roomChannel);

    const waitEl = document.getElementById('waiting-msg');
    if (waitEl) waitEl.innerHTML += '<br><small id="sub-status">Connecting...</small>';

    // Note: Table name has spaces/apostrophes. We explicitly quote it for Realtime.
    roomChannel = sbClient.channel(`gomoku-${roomId}`)
        .on("postgres_changes",
            { event: "UPDATE", schema: "public", table: '"Gomoku\'s rooms"' },
            (payload) => {
                console.log("Room Update Payload:", payload);
                if (payload.new.id !== roomRecordId) return;
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
        });
}

function handleRoomUpdate(room) {
    // 0. Update Ready State
    updateGameReadyState(room.status);

    // 1. Handle Game Start (Waiting -> Playing)
    // Note: status change handled by updateGameReadyState UI update, 
    // but we might want a toast or console log.
    if (room.status === 'playing' && !window.hasStarted) {
        // Prevent double init if we already knew? 
        // Actually, if we just transitioned, maybe reset?
        // For now, simple transition is handled by EnterRoom or realtime update.
        // Let's ensure we don't reset mid-game if we just reconnected.
        // Logic mainly relies on syncing the board if needed, but we rely on optimistic moves + init.
    }

    // 2. Sync Turn (if drifted)
    if (room.current_player && room.current_player !== currentPlayer) {
        setCurrentPlayer(room.current_player);
        updateStatusUI();
    }

    // 3. Handle Game Over from DB (e.g. if broadcast missed)
    if (room.status === 'finished' && room.last_result) {
        if (!gameOver) {
            setGameOver(true);
            const winner = room.last_result.replace('_win', '');
            updateWinUI(winner);
            showRestartButton(true);
        }
    } else if (room.status === 'playing' && gameOver) {
        // Restart occurred
        handleRemoteRestart();
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
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.requestRestart = requestRestart;
