/* main.js — Game controller */
import {
  RED, BLACK, EMPTY,
  initBoard, cloneBoard, pSide, rowOf, colOf,
  unpackFrom, unpackTo, unpackCaptured, pieceName
} from './engine/types.js';
import { generateLegalMoves, inCheck } from './engine/gen.js';
import { Render } from './render.js';

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
let pointerState = { down:false, sx:0, sy:0, drag:false, tap:false, ux:0, uy:0, ts:0 };

/* ── History (for undo) ── */
let history = [];

/* ── Move log ── */
let moveNumber = 1;

function recomputeMoveNumber() {
  const count = movelogEl.childElementCount;
  moveNumber = Math.floor(count / 2) + 1;
}

const statusEl   = document.getElementById('status');
const aiInfoEl   = document.getElementById('ai-info');
const aiTimeEl   = document.getElementById('ai-time');
const diffEl     = document.getElementById('difficulty');
const restartBtn = document.getElementById('btn-restart');
const sfxBtn     = document.getElementById('btn-sfx');
const undoBtn    = document.getElementById('btn-undo');
const movelogEl  = document.getElementById('movelog');
const canvas     = document.getElementById('board');
const evalFill   = document.getElementById('eval-fill');

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
  if (turn === RED) {
    setStatus('紅方走棋', '');
  } else {
    setStatus('AI 思考中…', 'thinking');
  }
}


function syncStatusAndControls() {
  if (!gameOver) {
    updateTurnStatus();
  }
  updateUndoBtn();
  if (diffEl) diffEl.disabled = !!(aiThinking || aiCommitPending || moveLock);
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
  const to   = unpackTo(packedMove);
  const cap  = unpackCaptured(packedMove);
  const piece = board[from];
  const name  = pieceName(piece);
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
  if (aiThinking || aiCommitPending || gameOver || turn !== RED || moveLock) return;

  const i = Render.hitTest(clientX, clientY);
  if (i < 0) return;

  if (selectedIdx >= 0) {
    const mv = legalFromSel.find(m => unpackTo(m) === i);
    if (mv !== undefined) {
      doMove(mv);
      return;
    }
  }

  if (board[i] && pSide(board[i]) === RED) {
    selectedIdx = i;
    legalFromSel = generateLegalMoves(board, RED).filter(m => unpackFrom(m) === i);
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
    } else {
      setStatus('和棋', '');
    }
    redraw();
    moveLock = false;
    return;
  }

  if (inCheck(board, turn)) {
    setStatus(turn === RED ? '紅方被將軍！' : '黑方被將軍！', 'check');
    playTone(660, 0.08, 'sawtooth', 0.06);
    vibrate(30);
  } else {
    updateTurnStatus();
  }

  redraw();

  if (turn === BLACK && !gameOver) {
    startAI();
  }

  moveLock = false;
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
  if (moveLock) return;
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

  if (sideBefore === RED) {
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
});

/* ── Restart ── */
restartBtn.addEventListener('click', () => {
  cancelPendingAI();

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
});




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
