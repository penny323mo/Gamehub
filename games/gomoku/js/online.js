
import { resetGameState, setBoard, setCurrentPlayer, setGameOver, setDifficulty, getPlayerName } from './core.js';
import { resetBoardUI, updateStatusUI } from './renderer.js';
import { board } from './core.js';
import { BOARD_SIZE } from './core.js';

// --- Supabase Config ---
const SUPABASE_URL = "https://djbhipofzbonxfqriovi.supabase.co";
const SUPABASE_ANON_KEY = "sb-publishable-DX7aNwHHI7tb6RUiWWe0qg_qPzuLcld";

export let supabase = null;
export let mode = 'ai'; // 'ai' or 'online'
export let roomId = null;
export let roomRecordId = null;
export let playerRole = null;
export let roomChannel = null;
export let clientId = localStorage.getItem('gomoku_clientId');

if (!clientId) {
    clientId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('gomoku_clientId', clientId);
}

// Initialize Supabase
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error("Supabase Init Failed:", e);
}

export function setMode(newMode) {
    mode = newMode;
}

export async function joinRoom(code) {
    if (!code) { alert("請輸入房間代碼！"); return; }
    roomId = code;

    if (!supabase) { alert("Online services unavailable."); return; }

    // 1. Fetch Room
    let { data: room, error } = await supabase
        .from("Gomoku's rooms")
        .select('*')
        .eq('room_code', roomId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error(error);
        alert("無法連接房間");
        return;
    }

    // 2. Create if new
    if (!room) {
        const { data: newRoom, error: createError } = await supabase
            .from("Gomoku's rooms")
            .insert([{
                room_code: roomId,
                black_player_id: clientId,
                status: 'waiting',
                last_activity_at: new Date()
            }])
            .select()
            .single();

        if (createError) {
            console.error(createError);
            alert("創建房間失敗");
            return;
        }
        room = newRoom;
        playerRole = 'black';
    } else {
        // 3. Assign Role
        if (room.black_player_id === clientId) playerRole = 'black';
        else if (room.white_player_id === clientId) playerRole = 'white';
        else if (!room.black_player_id) {
            await safeUpdateRoomDB(room.id, { black_player_id: clientId, status: 'playing' });
            playerRole = 'black';
        } else if (!room.white_player_id) {
            await safeUpdateRoomDB(room.id, { white_player_id: clientId, status: 'playing' });
            playerRole = 'white';
        } else {
            playerRole = 'spectator';
        }
    }

    roomRecordId = room.id;
    updateRoleUI();

    // Reset local
    resetGameState();
    resetBoardUI();

    subscribeToRoom();

    // Show room UI (handled by App router usually, but we expose event or callback?)
    // For now we assume App will check 'mode' and 'roomId'
    document.getElementById('online-lobby').classList.add('hidden');
    document.getElementById('online-room').classList.remove('hidden');
    document.getElementById('game-board-area').classList.remove('hidden');

    document.getElementById('current-room-id').innerText = roomId;
    updateStatusUI(null, `加入成功！身份: ${getRoleName(playerRole)}`);
}

export async function safeUpdateRoomDB(id, updates) {
    await supabase.from("Gomoku's rooms").update({
        ...updates,
        last_activity_at: new Date()
    }).eq('id', id);
}

function getRoleName(role) {
    if (role === 'black') return '黑子';
    if (role === 'white') return '白子';
    return '觀眾';
}

function subscribeToRoom() {
    if (roomChannel) supabase.removeChannel(roomChannel);

    roomChannel = supabase.channel(`room-${roomId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "Gomoku's rooms", filter: `room_code=eq.${roomId}` },
            (payload) => { if (payload.new) handleRoomUpdate(payload.new); })
        .subscribe();
}

function handleRoomUpdate(room) {
    // Role check
    if (playerRole === 'black' && room.black_player_id !== clientId) {
        playerRole = 'spectator';
        alert("你已被移除黑子位置");
    } else if (playerRole === 'white' && room.white_player_id !== clientId) {
        playerRole = 'spectator';
        alert("你已被移除白子位置");
    }
    updateRoleUI();

    // Board Sync
    if (room.board_state) {
        try {
            const remoteBoard = JSON.parse(room.board_state);
            // Diff logic? Or just overwrite?
            // Overwriting is safer for sync
            if (JSON.stringify(remoteBoard) !== JSON.stringify(board)) {
                setBoard(remoteBoard);
                // Re-render whole board (expensive but safe)
                const stones = document.querySelectorAll('.stone');
                stones.forEach(s => s.remove());
                for (let r = 0; r < BOARD_SIZE; r++) {
                    for (let c = 0; c < BOARD_SIZE; c++) {
                        if (remoteBoard[r][c]) {
                            const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
                            if (cell) {
                                const s = document.createElement('div');
                                s.classList.add('stone', remoteBoard[r][c]);
                                cell.appendChild(s);
                            }
                        }
                    }
                }
            }
        } catch (e) { console.error(e); }
    }

    // Turn Logic (simple inference from stone count)
    let bCount = 0, wCount = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 'black') bCount++;
            if (board[r][c] === 'white') wCount++;
        }
    }
    const derivedPlayer = (bCount === wCount) ? 'black' : 'white';
    setCurrentPlayer(derivedPlayer);

    if (room.last_result) {
        setGameOver(true);
        if (room.last_result === 'black_win') updateStatusUI(null, "黑子獲勝！");
        else if (room.last_result === 'white_win') updateStatusUI(null, "白子獲勝！");
    } else {
        setGameOver(false);
        updateStatusUI();
    }
}

export function updateRoleUI() {
    const roleSpan = document.getElementById('my-role');
    const startBtn = document.getElementById('online-start-btn');
    if (roleSpan) roleSpan.innerText = getRoleName(playerRole);

    const resetBtn = document.getElementById('reset-btn');
    if (playerRole === 'black' || playerRole === 'white') {
        if (startBtn) startBtn.classList.remove('hidden');
        if (resetBtn) resetBtn.style.display = 'inline-block';
    } else {
        if (startBtn) startBtn.classList.add('hidden');
        if (resetBtn) resetBtn.style.display = 'none';
    }
}

export async function leaveRoom() {
    if (roomRecordId && playerRole && playerRole !== 'spectator') {
        const updates = {};
        if (playerRole === 'black') updates.black_player_id = null;
        if (playerRole === 'white') updates.white_player_id = null;
        await safeUpdateRoomDB(roomRecordId, updates);
    }
    if (roomChannel) supabase.removeChannel(roomChannel);

    roomId = null;
    roomRecordId = null;
    playerRole = null;

    document.getElementById('online-room').classList.add('hidden');
    document.getElementById('online-lobby').classList.remove('hidden');
    document.getElementById('game-board-area').classList.add('hidden');
}

export async function broadcastMove(row, col, player) {
    if (roomChannel) {
        // We write the FULL board
        await safeUpdateRoomDB(roomRecordId, {
            board_state: JSON.stringify(board)
        });
    }
}

export async function startOnlineGame() {
    if (playerRole !== 'black' && playerRole !== 'white') return;

    // Reset DB
    const empty = [];
    for (let i = 0; i < 15; i++) {
        const row = [];
        for (let j = 0; j < 15; j++) row.push(null);
        empty.push(row);
    }

    await safeUpdateRoomDB(roomRecordId, {
        status: 'playing',
        last_result: null,
        board_state: JSON.stringify(empty)
    });
}
