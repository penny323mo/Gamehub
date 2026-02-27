/* worker.js — AI Web Worker (type: module) */
import { BLACK, BOARD_SIZE, initBoard, idx } from './types.js';
import { generateLegalMoves } from './gen.js';
import { search } from './search.js';

function simpleHash(board) {
  return Array.from(board).join(',');
}

function packMoveFromCoords(fr, fc, tr, tc) {
  const from = fr * 9 + fc;
  const to = tr * 9 + tc;
  return { from, to };
}

function matchMoveByFromTo(moves, from, to) {
  for (const m of moves) {
    const f = m >>> 15;
    const t = (m >>> 8) & 0x7F;
    if (f === from && t === to) return m;
  }
  return null;
}

const BOOK = {};

// Opening Book v3 (position-based + human-readable coords)
(function initBook() {
  // Position: after Red first move 炮二平五 (7,1 -> 7,4)
  const b = initBoard();
  b[idx(7, 4)] = b[idx(7, 1)];
  b[idx(7, 1)] = 0;
  const h = simpleHash(b);

  // Example Black replies in [fr,fc,tr,tc]
  BOOK[h] = [
    [0, 1, 2, 2], // 馬8進7
    [0, 7, 2, 6]  // 馬2進3
  ];
})();

function normalizeDifficulty(difficulty) {
  return (difficulty === 'easy' || difficulty === 'normal' || difficulty === 'hard' || difficulty === 'extreme') ? difficulty : 'normal';
}

function bookBudgetByDifficulty(difficulty) {
  if (difficulty === 'easy') return { BOOK_PLIES: 4, randomness: 0.45 };
  if (difficulty === 'hard') return { BOOK_PLIES: 12, randomness: 0.08 };
  if (difficulty === 'extreme') return { BOOK_PLIES: 16, randomness: 0.02 };
  return { BOOK_PLIES: 8, randomness: 0.2 };
}

function calcTotalPlies(board) {
  let nonEmpty = 0;
  for (let i = 0; i < board.length; i++) if (board[i] !== 0) nonEmpty++;
  return 32 - nonEmpty;
}

function tryOpeningBook(board, side, difficulty) {
  if (side !== BLACK) return null;

  const { BOOK_PLIES, randomness } = bookBudgetByDifficulty(difficulty);
  const totalPlies = calcTotalPlies(board);
  if (totalPlies > BOOK_PLIES) return null;

  const h = simpleHash(board);
  const lines = BOOK[h];
  if (!lines || !lines.length) return null;

  const moves = generateLegalMoves(board, BLACK);
  const candidates = [];

  for (const line of lines) {
    const [fr, fc, tr, tc] = line;
    const { from, to } = packMoveFromCoords(fr, fc, tr, tc);
    const mv = matchMoveByFromTo(moves, from, to);
    if (mv !== null) candidates.push(mv);
  }

  if (!candidates.length) return null;
  if (Math.random() > randomness) return candidates[0];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

self.onmessage = function (e) {
  const { board: boardArr, side, timeLimitMs, difficulty: rawDifficulty } = e.data;
  const difficulty = normalizeDifficulty(rawDifficulty);

  // Reconstruct Int8Array from transferred data
  const board = new Int8Array(BOARD_SIZE);
  for (let i = 0; i < BOARD_SIZE; i++) board[i] = boardArr[i];

  const bookMove = tryOpeningBook(board, side, difficulty);
  if (bookMove) {
    self.postMessage({
      move: bookMove,
      score: 0,
      depth: 0,
      nodes: 0,
      timeMs: 0,
      pv: [bookMove]
    });
    return;
  }

  let budgetMs = timeLimitMs;
  if (difficulty === 'easy') budgetMs = Math.max(120, Math.floor(timeLimitMs * 0.35));
  else if (difficulty === 'normal') budgetMs = Math.max(120, Math.floor(timeLimitMs * 0.6));
  else if (difficulty === 'hard') budgetMs = timeLimitMs;
  else if (difficulty === 'extreme') budgetMs = Math.min(5000, Math.floor(timeLimitMs * 1.8));

  const result = search(board, side, budgetMs);

  self.postMessage({
    move: result.move,
    score: result.score,
    depth: result.depth,
    nodes: result.nodes,
    timeMs: result.timeMs,
    pv: result.pv || []
  });
};
