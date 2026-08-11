/* main.js — Game controller */
import {
  RED, BLACK, EMPTY,
  initBoard, cloneBoard, pSide, rowOf, colOf,
  unpackFrom, unpackTo, unpackCaptured, pieceName
} from './engine/types.js';
import { generateLegalMoves, inCheck } from './engine/gen.js';
import { Render } from './render.js';
window.Render = Render;

/* ── State ── */
let board = initBoard();
let turn = RED;
let selectedIdx = -1;
let legalFromSel = [];
let aiWorker = null;
let aiThinking = false;
let aiCommitPending = false;
let aiCommitToken = 0;
let gameOver = false;
let moveLock = false;
let clutchMode = false;
let bossMode = false;
let killShotActive = false;
let difficulty = 'normal';
let aiStartTs = 0;
let prevAIScore = 0;
// Online Mode specific globals
window.isVsAI = true;
window.mode = 'ai'; // 'ai' or 'online'
window.setMode = (m) => { window.mode = m; };
window.setIsVsAI = (v) => { window.isVsAI = v; };
let momentumTimer = null;
const AI_MIN_THINK_MS = 150;
const AI_MOVE_ANIM_MS = 120;

// AI anti-race
let aiActiveToken = 0;
let aiRequestToken = 0;
let aiCommitTimer = null;

// SFX
let sfxEnabled = true;
let audioCtx = null;

const TAP_MOVE_THRESHOLD = 8;
const TAP_MAX_AGE_MS = 350;
let pointerState = { down: false, sx: 0, sy: 0, drag: false, tap: false, ux: 0, uy: 0, ts: 0 };

/* ── History (for undo) ── */
let history = [];

/* ── Move log ── */
let moveNumber = 1;

function recomputeMoveNumber() {
  const count = movelogEl.childElementCount;
  moveNumber = Math.floor(count / 2) + 1;
}

const statusEl = document.getElementById('status');
const aiInfoEl = document.getElementById('ai-info');
const aiTimeEl = document.getElementById('ai-time');
const diffEl = document.getElementById('difficulty');
const restartBtn = document.getElementById('btn-restart');
const sfxBtn = document.getElementById('btn-sfx');
const undoBtn = document.getElementById('btn-undo');
const movelogEl = document.getElementById('movelog');
const canvas = document.getElementById('board');
const evalFill = document.getElementById('eval-fill');

/* ── Renderer ── */
Render.init(canvas);
Render.resize();
window.addEventListener('resize', () => { Render.resize(); redraw(); });

/* ── AI Worker ── */
function initWorker() {
  aiWorker = new Worker(
    new URL('./engine/worker.js', import.meta.url),
    { type: 'module' }
  );
  aiWorker.onmessage = onAIResult;
}
initWorker();

/* ── Audio ── */
function getAudioCtx() {
  if (!sfxEnabled) return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', gain = 0.05) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}


function playTick() {
  playTone(520, 0.05, 'triangle', 0.03);
}

/* ── Drawing ── */
function redraw() {
  Render.setCheck(inCheck(board, turn) ? turn : 0);
  Render.draw(board);
  syncStatusAndControls();
}

function setStatus(text, cls) {
  statusEl.textContent = text;
  statusEl.className = cls || '';
}

function updateTurnStatus() {
  if (gameOver) return;
  if (window.mode === 'online') {
    const myRole = window.onlinePlayerRole;
    const currentTurnColor = turn === RED ? 'red' : 'black';
    if (currentTurnColor === myRole) {
      setStatus('輪到你走棋', '');
    } else {
      setStatus('等待對手走棋…', 'thinking');
    }
    return;
  }
  if (turn === RED) {
    setStatus('紅方走棋', '');
  } else {
    if (window.isVsAI) {
      setStatus('AI 思考中…', 'thinking');
    } else {
      setStatus('黑方走棋', '');
    }
  }
}


function syncStatusAndControls() {
  if (!gameOver) {
    updateTurnStatus();
  }
  updateUndoBtn();
  const isOnline = window.mode === 'online';
  if (diffEl) diffEl.disabled = !!(aiThinking || aiCommitPending || moveLock || isOnline);
  // Hide AI-only controls in online mode, show online controls
  if (restartBtn) restartBtn.classList.toggle('hidden', isOnline);
  if (undoBtn) undoBtn.classList.toggle('hidden', isOnline);
  const aiControlsEl = document.getElementById('ai-controls');
  if (aiControlsEl) aiControlsEl.classList.toggle('hidden', isOnline);
  const surrenderBtn = document.getElementById('btn-surrender');
  if (surrenderBtn) surrenderBtn.classList.toggle('hidden', !isOnline || gameOver);
}

function updateUndoBtn() {
  undoBtn.disabled = aiThinking || aiCommitPending || moveLock || history.length === 0;
}


function syncSfxButton() {
  if (!sfxBtn) return;
  sfxBtn.textContent = sfxEnabled ? '音效：開' : '音效：關';
}

if (sfxBtn) {
  sfxBtn.addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    syncSfxButton();
  });
}


function updateEvalBar(score) {
  if (!evalFill) return;
  const clamp = Math.max(-2000, Math.min(2000, score || 0));
  const percent = 50 + (clamp / 2000) * 50;
  evalFill.style.height = percent + '%';
}

function getDifficulty() {
  const v = diffEl?.value;
  if (v === 'easy' || v === 'normal' || v === 'hard' || v === 'extreme') return v;
  return 'normal';
}


/* ── Move log helpers ── */
function logMove(packedMove, side) {
  const from = unpackFrom(packedMove);
  const to = unpackTo(packedMove);
  const cap = unpackCaptured(packedMove);
  const piece = board[from];
  const name = pieceName(piece);
  const capStr = cap ? ` x${pieceName(cap)}` : '';
  const prefix = side === RED
    ? `${moveNumber}. 紅：`
    : `${moveNumber}... 黑：`;
  const line = `${prefix}${name}(${rowOf(from)},${colOf(from)})→(${rowOf(to)},${colOf(to)})${capStr}`;

  const div = document.createElement('div');
  div.textContent = line;
  movelogEl.appendChild(div);
  movelogEl.parentElement.scrollTop = movelogEl.parentElement.scrollHeight;

  recomputeMoveNumber();
}

function removeLastLogEntry() {
  if (movelogEl.lastChild) movelogEl.removeChild(movelogEl.lastChild);
  recomputeMoveNumber();
}

/* ── Input consistency (tap vs drag) ── */
function handleTap(clientX, clientY) {
  const isMyTurn = window.mode === 'online'
    ? (window.onlinePlayerRole === (turn === RED ? 'red' : 'black'))
    : (turn === RED);

  if (aiThinking || aiCommitPending || gameOver || !isMyTurn || moveLock) return;

  const i = Render.hitTest(clientX, clientY);
  if (i < 0) return;

  if (selectedIdx >= 0) {
    const mv = legalFromSel.find(m => unpackTo(m) === i);
    if (mv !== undefined) {
      if (window.isVsAI && window.mode !== 'online') {
        doMove(mv);
      } else {
        // Online Mode: attempt to send move via window.handleOnlineMove
        if (window.handleOnlineMove) {
          window.handleOnlineMove(unpackFrom(mv), unpackTo(mv), mv, turn === RED ? 'red' : 'black')
            .then(success => {
              if (success) {
                clearSelection();
                // Local apply handled by Realtime event in online.js
              }
            });
        }
      }
      return;
    }
  }

  if (board[i] && pSide(board[i]) === turn) {
    selectedIdx = i;
    legalFromSel = generateLegalMoves(board, turn).filter(m => unpackFrom(m) === i);
    Render.setSelected(i, legalFromSel.map(m => unpackTo(m)));
    redraw();
    return;
  }

  clearSelection();
  redraw();
}

canvas.addEventListener('pointerdown', (e) => {
  pointerState.down = true;
  pointerState.sx = e.clientX;
  pointerState.sy = e.clientY;
  pointerState.drag = false;
  pointerState.tap = false;
});

canvas.addEventListener('pointermove', (e) => {
  if (!pointerState.down) return;
  const dx = e.clientX - pointerState.sx;
  const dy = e.clientY - pointerState.sy;
  if (dx * dx + dy * dy > TAP_MOVE_THRESHOLD * TAP_MOVE_THRESHOLD) {
    pointerState.drag = true;
  }
});

canvas.addEventListener('pointerup', (e) => {
  pointerState.down = false;
  pointerState.ux = e.clientX;
  pointerState.uy = e.clientY;
  pointerState.ts = performance.now();
  pointerState.tap = !pointerState.drag;
});

canvas.addEventListener('click', (e) => {
  const age = performance.now() - pointerState.ts;
  const dx = e.clientX - pointerState.ux;
  const dy = e.clientY - pointerState.uy;
  const near = (dx * dx + dy * dy) <= TAP_MOVE_THRESHOLD * TAP_MOVE_THRESHOLD;
  if (!pointerState.tap || age > TAP_MAX_AGE_MS || !near) return;
  pointerState.tap = false;
  handleTap(e.clientX, e.clientY);
});

function clearSelection() {
  selectedIdx = -1;
  legalFromSel = [];
  Render.setSelected(-1, []);
}

function afterMoveFlow() {
  // Once it's player's turn, AI is definitely no longer pending.
  if (turn === RED) {
    aiThinking = false;
    aiCommitPending = false;
  }

  const legal = generateLegalMoves(board, turn);
  if (legal.length === 0) {
    gameOver = true;
    if (inCheck(board, turn)) {
      setStatus(turn === RED ? '黑方勝！' : '紅方勝！', 'check');
      // Online mode: notify DB of checkmate
      if (window.mode === 'online' && window.notifyOnlineGameOver) {
        const winnerColor = turn === RED ? 'black' : 'red';
        window.notifyOnlineGameOver(winnerColor, 'checkmate');
      }
    } else {
      setStatus('和棋', '');
      if (window.mode === 'online' && window.notifyOnlineGameOver) {
        window.notifyOnlineGameOver(null, 'stalemate');
      }
    }
    清局();   // 收咗場就唔好留住一局已經完咗嘅棋扮「未打完」
    moveLock = false;
    redraw();
    return;
  }

  if (inCheck(board, turn)) {
    setStatus(turn === RED ? '紅方被將軍！' : '黑方被將軍！', 'check');
    playTone(660, 0.08, 'sawtooth', 0.06);
    vibrate(30);
  } else {
    updateTurnStatus();
  }

  // Commit animation has finished at this point. Clear the lock before the
  // redraw so the controls (especially 悔棋) reflect the new state instead of
  // staying disabled until some unrelated UI event happens.
  moveLock = false;
  redraw();
  存局();   // 行完即刻存——玩家可能行完就切走 app

  if (turn === BLACK && !gameOver && window.isVsAI === true && window.mode !== 'online') {
    startAI();
  }

}

function animateMove(packedMove, movingPiece, durationMs, turnAfter, onDone) {
  const from = unpackFrom(packedMove);
  const to = unpackTo(packedMove);
  const tempBoard = cloneBoard(board);
  tempBoard[from] = EMPTY;
  tempBoard[to] = EMPTY;

  const start = performance.now();

  function frame(now) {
    const raw = Math.min(1, (now - start) / durationMs);
    const ease = 1 - Math.pow(1 - raw, 3);

    tempBoard[from] = EMPTY;
    tempBoard[to] = EMPTY;
    Render.setGhostMove(movingPiece, from, to, ease, pSide(movingPiece), pieceName(movingPiece));
    Render.setCheck(inCheck(tempBoard, turnAfter) ? turnAfter : 0);
    Render.draw(tempBoard);

    if (raw < 1) {
      requestAnimationFrame(frame);
    } else {
      Render.clearGhost();
      const boardEl = document.getElementById('board');
      if (boardEl) {
        boardEl.style.filter = '';
        boardEl.style.transition = '';
        boardEl.style.transform = '';
      }
      statusEl.classList.remove('clutch', 'boss', 'momentum');
      onDone();
    }
  }

  requestAnimationFrame(frame);
}

function animateHumanMove(packedMove, movingPiece, onDone) {
  animateMove(packedMove, movingPiece, 120, BLACK, onDone);
}

function animateAIMove(packedMove, movingPiece, onDone) {
  const from = unpackFrom(packedMove);
  const to = unpackTo(packedMove);
  const tempBoard = cloneBoard(board);
  tempBoard[from] = EMPTY;
  tempBoard[to] = EMPTY;

  const isKillShot = killShotActive;
  const duration = isKillShot ? AI_MOVE_ANIM_MS * 2 : AI_MOVE_ANIM_MS;

  const bar = document.getElementById('eval-bar');
  if (isKillShot) {
    playTone(120, 0.18, 'sawtooth', 0.09);
    if (bar) {
      bar.style.transition = 'all 0.3s';
      bar.style.transform = 'scale(1.1)';
      bar.style.boxShadow = '0 0 18px rgba(255,0,0,0.9)';
    }
  }

  const start = performance.now();

  function frame(now) {
    const raw = Math.min(1, (now - start) / duration);
    const ease = 1 - Math.pow(1 - raw, 3);

    tempBoard[from] = EMPTY;
    tempBoard[to] = EMPTY;
    Render.setGhostMove(movingPiece, from, to, ease, pSide(movingPiece), pieceName(movingPiece));
    Render.setCheck(inCheck(tempBoard, RED) ? RED : 0);
    Render.draw(tempBoard);

    if (raw < 1) {
      requestAnimationFrame(frame);
    } else {
      Render.clearGhost();
      playTick();
      if (bar) {
        bar.style.transform = '';
        bar.style.boxShadow = '';
      }
      killShotActive = false;
      onDone();
    }
  }

  requestAnimationFrame(frame);
}

/* ── Execute move ── */
function doMove(packedMove) {
  if (moveLock) return false;
  moveLock = true;

  const sideBefore = turn;
  const from = unpackFrom(packedMove);
  const to = unpackTo(packedMove);
  const movingPiece = board[from];
  const captured = unpackCaptured(packedMove);

  logMove(packedMove, sideBefore);
  history.push({ board: cloneBoard(board), turn: sideBefore, packedMove });

  Render.setLastMove({ from, to });
  clearSelection();

  let committed = false;
  const commitBoard = () => {
    if (committed) return;
    committed = true;
    board[to] = movingPiece;
    board[from] = EMPTY;
    if (captured) {
      playTone(180, 0.12, 'square', 0.08);
      vibrate(20);
    } else {
      playTone(420, 0.06, 'triangle', 0.04);
    }
    turn = sideBefore === RED ? BLACK : RED;
    if (sideBefore === BLACK) {
      aiThinking = false;
      aiCommitPending = false;
    }
    afterMoveFlow();
  };

  if (window.mode === 'online' || sideBefore === RED) {
    animateHumanMove(packedMove, movingPiece, commitBoard);
  } else {
    animateAIMove(packedMove, movingPiece, commitBoard);
  }
}

function cancelPendingAI() {
  aiActiveToken++;
  aiCommitPending = false;
  aiThinking = false;
  if (aiCommitTimer) {
    clearTimeout(aiCommitTimer);
    aiCommitTimer = null;
  }
}

/* ── AI ── */
function startAI() {
  const token = ++aiActiveToken;
  aiRequestToken = token;
  aiThinking = true;
  aiCommitPending = false;
  aiStartTs = performance.now();
  aiCommitToken++;
  const myToken = aiCommitToken;
  aiInfoEl.textContent = 'AI：thinking…';
  syncStatusAndControls();

  difficulty = getDifficulty();
  const baseMs = parseInt(aiTimeEl?.value, 10) || 500;
  const timeLimitMs = baseMs;

  aiWorker.postMessage({
    board: Array.from(board),
    side: BLACK,
    timeLimitMs,
    difficulty
  });
}

function onAIResult(e) {
  if (aiRequestToken !== aiActiveToken) return;
  const tokenAtReceive = aiCommitToken;

  const { move, score, depth, nodes, timeMs, pv } = e.data;

  let pvStr = '';
  if (pv && pv.length) {
    pvStr = pv.map(m => {
      const f = m >>> 15, t = (m >>> 8) & 0x7F;
      return `(${rowOf(f)},${colOf(f)})→(${rowOf(t)},${colOf(t)})`;
    }).join(' ');
  }

  aiInfoEl.textContent = `AI：depth=${depth}  nodes=${nodes}  time=${timeMs}ms  score=${score}`;
  if (pvStr) aiInfoEl.textContent += `\nPV: ${pvStr}`;
  updateEvalBar(score);

  if (!clutchMode && Math.abs(score) >= 1200) {
    enterClutchMode();
  }
  if (clutchMode && Math.abs(score) < 900) {
    exitClutchMode();
  }

  if (!bossMode && Math.abs(score) >= 2000) {
    enterBossMode();
  }
  if (bossMode && Math.abs(score) < 1500) {
    exitBossMode();
  }

  if (tokenAtReceive !== aiCommitToken) return;

  if (!move) {
    cancelPendingAI();
    gameOver = true;
    setStatus('紅方勝！', 'check');
    redraw();
    return;
  }

  const token = aiActiveToken;
  killShotActive = Math.abs(score) >= 4000;
  const elapsed = performance.now() - aiStartTs;
  const delay = Math.max(0, AI_MIN_THINK_MS - elapsed);

  aiCommitPending = true;
  syncStatusAndControls();

  aiCommitTimer = setTimeout(() => {
    aiCommitTimer = null;
    if (token !== aiActiveToken) return;

    aiThinking = false;
    syncStatusAndControls();

    doMove(move);
  }, delay);
}

/* ── Undo ── */
undoBtn.addEventListener('click', () => {
  if (aiThinking || aiCommitPending || moveLock || history.length === 0) return;

  cancelPendingAI();

  const last = history[history.length - 1];

  if (last.turn === BLACK && history.length >= 2) {
    history.pop();
    removeLastLogEntry();

    const playerSnap = history.pop();
    removeLastLogEntry();

    board = cloneBoard(playerSnap.board);
    turn = playerSnap.turn;
  } else {
    const snap = history.pop();
    removeLastLogEntry();

    board = cloneBoard(snap.board);
    turn = snap.turn;
  }

  gameOver = false;
  moveLock = false;
  clutchMode = false;
  bossMode = false;
  killShotActive = false;
  Render.clearGhost();
  resetVisualState();

  if (history.length > 0) {
    const prev = history[history.length - 1];
    Render.setLastMove({
      from: unpackFrom(prev.packedMove),
      to: unpackTo(prev.packedMove)
    });
  } else {
    Render.setLastMove(null);
  }

  clearSelection();

  if (inCheck(board, turn)) {
    setStatus(turn === RED ? '紅方被將軍！' : '黑方被將軍！', 'check');
    playTone(660, 0.08, 'sawtooth', 0.06);
    vibrate(30);
  } else {
    updateTurnStatus();
  }

  aiInfoEl.textContent = '';
  if (diffEl) diffEl.value = 'normal';
  difficulty = 'normal';
  aiCommitToken++;
  redraw();
  updateTurnStatus();
  updateEvalBar(0);
  syncStatusAndControls();
  // Undo changes the actual resumable position. Do not leave a post-undo
  // snapshot behind, otherwise refresh/Continue resurrects the move the
  // player just explicitly reverted.
  if (history.length > 0) 存局();
  else 清局();
});

/* ── Restart ── */
restartBtn.addEventListener('click', () => {
  if (window.mode === 'online') return; // Online mode uses rematch flow
  resetGameParams();
});

window.resetGameParams = resetGameParams;
window.resetGame = resetGameParams;

function resetGameParams() {
  cancelPendingAI();
  清局();   // 開新局＝放棄上一局

  board = initBoard();
  turn = RED;
  selectedIdx = -1;
  legalFromSel = [];
  gameOver = false;
  moveLock = false;
  clutchMode = false;
  bossMode = false;
  killShotActive = false;
  history = [];
  moveNumber = 1;
  Render.setSelected(-1, []);
  Render.setLastMove(null);
  Render.setCheck(0);
  Render.clearGhost();
  resetVisualState();
  setStatus('紅方先行', '');
  aiInfoEl.textContent = '';
  if (diffEl) diffEl.value = 'normal';
  difficulty = 'normal';
  aiCommitToken++;
  movelogEl.innerHTML = '';
  redraw();
  updateTurnStatus();
  updateEvalBar(0);
  syncStatusAndControls();
}




function resetVisualState() {
  const boardEl = document.getElementById('board');
  if (boardEl) {
    boardEl.style.filter = '';
    boardEl.style.transition = '';
    boardEl.style.transform = '';
  }
  const bar = document.getElementById('eval-bar');
  if (bar) {
    bar.style.transform = '';
    bar.style.boxShadow = '';
  }
  statusEl.classList.remove('clutch', 'boss', 'momentum');
}

function shakeBoard() {
  const el = document.getElementById('board');
  if (!el) return;
  el.style.transform = 'translateX(3px)';
  setTimeout(() => {
    el.style.transform = 'translateX(-3px)';
    setTimeout(() => { el.style.transform = ''; }, 40);
  }, 40);
}

function flashEvalBar() {
  const bar = document.getElementById('eval-bar');
  if (!bar) return;
  bar.style.transition = 'transform 0.2s, box-shadow 0.2s';
  bar.style.transform = 'scale(1.05)';
  bar.style.boxShadow = '0 0 12px rgba(255,255,0,0.7)';
  setTimeout(() => {
    bar.style.transform = '';
    bar.style.boxShadow = '';
  }, 300);
}

function showMomentumAlert(delta) {
  if (navigator.vibrate) navigator.vibrate(40);
  shakeBoard();
  flashEvalBar();
  playTone(880, 0.08, 'sawtooth', 0.07);
  if (momentumTimer) clearTimeout(momentumTimer);
  statusEl.classList.add('momentum');
  momentumTimer = setTimeout(() => {
    statusEl.classList.remove('momentum');
  }, 800);
}

function enterClutchMode() {
  clutchMode = true;
  const boardEl = document.getElementById('board');
  if (boardEl) {
    boardEl.style.transition = 'filter 0.3s';
    boardEl.style.filter = 'brightness(0.9)';
  }
  statusEl.classList.add('clutch');
}

function exitClutchMode() {
  clutchMode = false;
  const boardEl = document.getElementById('board');
  if (boardEl) boardEl.style.filter = '';
  statusEl.classList.remove('clutch');
}

function enterBossMode() {
  bossMode = true;
  const boardEl = document.getElementById('board');
  if (boardEl) {
    boardEl.style.transition = 'filter 0.3s';
    boardEl.style.filter = 'brightness(0.8) contrast(1.1)';
  }
  statusEl.classList.add('boss');
}

function exitBossMode() {
  bossMode = false;
  const boardEl = document.getElementById('board');
  if (boardEl) boardEl.style.filter = '';
  statusEl.classList.remove('boss');
}

/* ── Init ── */
redraw();
updateEvalBar(0);

// Expose API for Online Mode
window.applyNetworkMove = (packedMove, color, isSilent = false) => {
  if (isSilent) {
    // Apply without animation/sound
    const from = unpackFrom(packedMove);
    const to = unpackTo(packedMove);
    const movingPiece = board[from];
    logMove(packedMove, turn);
    history.push({ board: cloneBoard(board), turn: turn, packedMove });
    board[to] = movingPiece;
    board[from] = EMPTY;
    turn = color === 'red' ? BLACK : RED;
    afterMoveFlow();
  } else {
    // doMove 動畫期間 moveLock 會靜默拒絕，要回報 false 畀網絡隊列重試
    if (doMove(packedMove) === false) return false;
  }
  return true;
};

window.updateStatusUI = (currentPlayerColor) => {
  if (gameOver) return;
  if (currentPlayerColor === 'red') {
    setStatus('紅方走棋', '');
  } else if (currentPlayerColor === 'black') {
    setStatus('黑方走棋', '');
  } else {
    setStatus('等待對局...', '');
  }
};

/* ------------------------------------------------------------------
 * 打到一半走咗，返嚟仲喺度（同 ADR-234 Gomoku 同一個做法）
 * ------------------------------------------------------------------
 *
 * 實測：單機模式行幾步之後 refresh，**直接返咗選單，成盤棋冇晒**——存低咗
 * 嘅嘢得一個 `xiangqi_clientId`（線上身分），同局棋冇關。手機切走 app 之後
 * 個 tab 畀系統回收，效果一樣：**唔係你自己揀走**。
 *
 * 存乜：成個盤（`Int8Array` 攤做普通 array）、輪到邊個、難度、第幾手。
 * 引擎冇跨局狀態，所以呢幾樣就夠砌返個局面。
 *
 * 覆蓋式（唔用 `改存檔()`）：呢個係「呢部機呢一局」嘅進度，後面嗰個就係最新
 * ——同 Tower checkpoint、Gomoku 一樣，喺 ADR-232 個「特登 last-write-wins」名單。
 */
const 局存KEY = 'xiangqi_ai_run_v1';

function 存局() {
  try {
    if (gameOver || window.mode === 'online') return;
    localStorage.setItem(局存KEY, JSON.stringify({
      v: 1, board: Array.from(board), turn, difficulty, moveNumber, 時: Date.now(),
    }));
  } catch (e) { /* 記唔住就算，唔好因為咁玩唔到 */ }
}

function 清局() {
  try { localStorage.removeItem(局存KEY); } catch (e) { /* 同上 */ }
}

/**
 * **壞存檔要當冇。** 逐項驗：長度啱、每格係 -128..127 嘅整數、輪到嘅人合法、
 * 而且**唔可以係開局盤**（開局盤即係「未行過」，冇嘢好續）。
 */
function 讀局() {
  try {
    const raw = localStorage.getItem(局存KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (!j || j.v !== 1 || !Array.isArray(j.board)) return null;
    const 開局 = initBoard();
    if (j.board.length !== 開局.length) return null;
    let 同開局 = true;
    for (const v of j.board) if (!Number.isInteger(v) || v < -128 || v > 127) return null;
    for (let i = 0; i < 開局.length; i++) if (j.board[i] !== 開局[i]) { 同開局 = false; break; }
    if (同開局 && j.turn === RED) return null;
    if (j.turn !== RED && j.turn !== BLACK) return null;
    return j;
  } catch (e) { return null; }
}

function 續局() {
  const j = 讀局();
  if (!j) return null;
  cancelPendingAI();
  board = Int8Array.from(j.board);
  turn = j.turn;
  selectedIdx = -1;
  legalFromSel = [];
  gameOver = false;
  moveLock = false;
  history = [];                 // 悔棋唔跨 session：冇存返 history 就唔好扮有
  moveNumber = j.moveNumber || 1;
  if (j.difficulty) {
    difficulty = j.difficulty;
    if (diffEl) diffEl.value = j.difficulty;
  }
  Render.setSelected(-1, []);
  Render.setLastMove(null);
  Render.clearGhost();
  Render.setCheck(inCheck(board, turn) ? turn : 0);
  if (movelogEl) movelogEl.innerHTML = '';
  redraw();
  updateTurnStatus();
  // 存嗰陣可能啱啱輪到 AI——唔叫佢行，個盤就會永遠等你行一步唔到你行嘅棋
  if (turn === BLACK && window.isVsAI === true && window.mode !== 'online') startAI();
  return j;
}

window.__xiangqiRun = {
  有得繼續: () => 讀局() !== null, 續局, 清局, 存局,
  // 畀測試分得清「storage 有嘢」同「局真係開返咗」——後者要睇遊戲自己個盤
  現盤: () => Array.from(board), 現輪到: () => turn,
};
