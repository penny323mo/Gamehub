
// --- Supabase Config ---
const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb-publishable-DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

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
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Expose for debugging
        window.sbClient = sbClient;
        console.log("Supabase Client Initialized");
    } else {
        console.error("Supabase SDK not loaded on window.supabase");
    }
} catch (err) {
    console.error("Supabase Init Error:", err);
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

    // Create room in DB
    const { data, error } = await sbClient
        .from("Gomoku's rooms")
        .insert([{
            room_code: code,
            black_player_id: clientId,
            white_player_id: null,
            status: 'waiting',
            last_activity_at: new Date(),
            current_player: 'black',
            board_state: JSON.stringify(createEmptyBoard())
        }])
        .select()
        .single();

    if (error) {
        console.error("Create Room Error:", error);
        alert("創建房間失敗: " + error.message);
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

    subscribeToRoom();

    if (room.board_state) {
        try {
            const remoteBoard = JSON.parse(room.board_state);
            setBoard(remoteBoard);
            drawBoard();
        } catch (e) {
            console.error("Board parse error", e);
            resetBoardUI();
        }
    } else {
        resetGameState();
        resetBoardUI();
    }

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

    const updates = {
        board_state: JSON.stringify(board),
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

    await sbClient
        .from("Gomoku's rooms")
        .update({
            board_state: JSON.stringify(createEmptyBoard()),
            status: 'playing',
            last_result: null,
            current_player: 'black',  // Reset to black first
            last_activity_at: new Date()
        })
        .eq('id', roomRecordId);
}

// --- Subscription ---

function subscribeToRoom() {
    if (roomChannel) sbClient.removeChannel(roomChannel);

    roomChannel = sbClient.channel(`room-${roomId}`)
        .on("postgres_changes",
            { event: "UPDATE", schema: "public", table: "Gomoku's rooms", filter: `id=eq.${roomRecordId}` },
            (payload) => {
                handleRoomUpdate(payload.new);
            }
        )
        .subscribe();
}

function handleRoomUpdate(room) {
    if (room.board_state) {
        const remoteBoard = JSON.parse(room.board_state);
        if (JSON.stringify(remoteBoard) !== JSON.stringify(board)) {
            setBoard(remoteBoard);
            drawBoard();
        }
    }

    if (room.current_player && room.current_player !== currentPlayer) {
        setCurrentPlayer(room.current_player);
        updateStatusUI();
    }

    if (room.status === 'finished' && room.last_result) {
        setGameOver(true);
        const winner = room.last_result.replace('_win', '');
        updateWinUI(winner);
        showRestartButton(true);
    } else if (room.status === 'playing' && gameOver) {
        setGameOver(false);
        showRestartButton(false);
        updateStatusUI();
    }

    if (room.status === 'playing' && document.getElementById('waiting-msg')) {
        document.getElementById('waiting-msg').classList.add('hidden');
    }
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
