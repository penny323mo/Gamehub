/* search.js — Alpha-Beta with Iterative Deepening + TT + PV extraction */
'use strict';

import {
  BOARD_SIZE, RED, BLACK, EMPTY, KING,
  pSide, pType, cloneBoard, opponent
} from './types.js';
import { generateLegalMoves, applyMove, undoMove, inCheck } from './gen.js';
import { evaluate, INF, CHECKMATE, MATERIAL } from './eval.js';
import { computeHash, updateHashMove } from './hash.js';

/* ── Timer ── */
const now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
  ? performance.now.bind(performance)
  : Date.now;

/* ── Transposition Table with Generation Aging ── */
const EXACT = 0, LOWERBOUND = 1, UPPERBOUND = 2;
let tt = new Map();
const TT_MAX = 1 << 20;
const TT_AGE_LIMIT = 4;
let currentGen = 0;

function ttProbe(hash, depth, alpha, beta) {
  const entry = tt.get(hash);
  if (!entry) return null;
  entry.gen = currentGen; // touch: extend lifetime
  if (entry.depth >= depth) {
    if (entry.flag === EXACT) return { score: entry.score, bestMove: entry.bestMove };
    if (entry.flag === LOWERBOUND && entry.score >= beta) return { score: entry.score, bestMove: entry.bestMove };
    if (entry.flag === UPPERBOUND && entry.score <= alpha) return { score: entry.score, bestMove: entry.bestMove };
  }
  return { score: null, bestMove: entry.bestMove };
}

function ttStore(hash, depth, score, flag, bestMove) {
  const existing = tt.get(hash);
  if (existing && existing.depth > depth) {
    existing.gen = currentGen;
    return;
  }
  tt.set(hash, { depth, score, flag, bestMove, gen: currentGen });
  if (tt.size > TT_MAX) {
    for (const [key, entry] of tt) {
      if (currentGen - entry.gen > TT_AGE_LIMIT) {
        tt.delete(key);
      }
    }
  }
}

/* ── Move ordering ── */

function scoreMoveForOrdering(board, m, ttBestMove, depth) {
  let s = 0;
  if (ttBestMove && m === ttBestMove) s += 100000;
  if (killerMoves[depth] && killerMoves[depth] === m) s += 90000;
  const cap = m & 0xFF;
  if (cap) {
    s += MATERIAL[pType(cap)] * 10 - MATERIAL[pType(board[m >>> 15])];
  }
  const hist = historyTable.get(m);
  if (hist) s += hist;
  return s;
}

function sortMoves(board, moves, ttBestMove, depth) {
  const scored = moves.map(m => ({ m, s: scoreMoveForOrdering(board, m, ttBestMove, depth || 0) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.map(x => x.m);
}

/* ── Search state ── */

let nodesSearched = 0;
let timeLimit = 0;
let startTime = 0;
let timeUp = false;

// Killer moves: one per depth
let killerMoves = [];
// History table: key = move, value = score
let historyTable = new Map();

/* ── Alpha-Beta ── */

function alphaBeta(board, side, depth, alpha, beta, hash) {
  if ((++nodesSearched & 4095) === 0) {
    if (now() - startTime >= timeLimit) {
      timeUp = true;
      return 0;
    }
  }

  let ttBestMove = 0;
  const probe = ttProbe(hash, depth, alpha, beta);
  if (probe) {
    if (probe.score !== null) return probe.score;
    ttBestMove = probe.bestMove || 0;
  }

  if (depth <= 0) {
    return quiesce(board, side, alpha, beta, 4);
  }

  const moves = generateLegalMoves(board, side);

  if (moves.length === 0) {
    if (inCheck(board, side)) return -CHECKMATE + (100 - depth);
    return 0;
  }

  const sorted = sortMoves(board, moves, ttBestMove, depth);
  let bestScore = -INF;
  let bestMove = sorted[0];
  const origAlpha = alpha;

  for (const m of sorted) {
    const from = m >>> 15, to = (m >>> 8) & 0x7F;
    const piece = board[from];
    const captured = board[to];
    const newHash = updateHashMove(hash, from, to, piece, captured);

    applyMove(board, m);
    const score = -alphaBeta(board, opponent(side), depth - 1, -beta, -alpha, newHash);
    undoMove(board, m);

    if (timeUp) return alpha;

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
    if (score > alpha) alpha = score;
    if (alpha >= beta) {
      if ((m & 0xFF) === 0) {
        killerMoves[depth] = m;
        historyTable.set(m, (historyTable.get(m) || 0) + depth * depth);
      }
      ttStore(hash, depth, bestScore, LOWERBOUND, bestMove);
      return bestScore;
    }
  }

  const flag = bestScore <= origAlpha ? UPPERBOUND : EXACT;
  ttStore(hash, depth, bestScore, flag, bestMove);

  return bestScore;
}

/* ── Quiescence ── */

function quiesce(board, side, alpha, beta, maxDepth) {
  const stand = evaluate(board, side);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (maxDepth <= 0) return alpha;

  const moves = generateLegalMoves(board, side);
  const captures = moves.filter(m => (m & 0xFF) !== 0);
  const sorted = sortMoves(board, captures, 0);

  for (const m of sorted) {
    applyMove(board, m);
    const score = -quiesce(board, opponent(side), -beta, -alpha, maxDepth - 1);
    undoMove(board, m);

    if (timeUp) return 0;
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

/* ── Extract PV from TT ── */

function extractPV(board, side, hash, maxLen) {
  const pv = [];
  const seen = new Set();
  let s = side;
  let h = hash;

  for (let i = 0; i < maxLen; i++) {
    if (seen.has(h)) break;
    seen.add(h);

    const entry = tt.get(h);
    if (!entry) break;
    if (entry.flag !== EXACT) break;
    if (!entry.bestMove) break;

    const m = entry.bestMove;
    const from = m >>> 15;
    const piece = board[from];
    if (!piece || pSide(piece) !== s) break;

    pv.push(m);
    applyMove(board, m);
    s = opponent(s);
    h = computeHash(board, s);
  }

  for (let i = pv.length - 1; i >= 0; i--) {
    undoMove(board, pv[i]);
  }

  return pv;
}

/* ── Iterative Deepening with Aspiration Window ── */

const ASPIRATION_DELTA = 50;
const ASPIRATION_MAX_RETRIES = 2;

function rootSortWithPVFirst(board, moves, pvMove, ttBestMove) {
  const sorted = sortMoves(board, moves, ttBestMove || pvMove);
  const pin = pvMove || ttBestMove;
  if (pin) {
    const idx = sorted.indexOf(pin);
    if (idx > 0) sorted.splice(idx, 1);
    if (idx !== 0) sorted.unshift(pin);
  }
  return sorted;
}

export function search(board, side, timeLimitMs) {
  startTime = now();
  timeLimit = timeLimitMs;
  timeUp = false;
  nodesSearched = 0;
  currentGen++;          // age TT instead of clearing
  killerMoves = [];
  historyTable.clear();

  let bestMove = 0;
  let bestScore = -INF;
  let depthReached = 0;

  const rootHash = computeHash(board, side);

  for (let depth = 1; depth <= 40; depth++) {
    const moves = generateLegalMoves(board, side);
    if (moves.length === 0) break;
    if (moves.length === 1) { bestMove = moves[0]; depthReached = 1; break; }

    const probe = ttProbe(rootHash, 0, -INF, INF);
    const ttBest = probe ? probe.bestMove : 0;
    const sorted = rootSortWithPVFirst(board, moves, bestMove, ttBest);

    let alpha, beta;
    if (depth >= 3 && bestScore > -CHECKMATE + 200 && bestScore < CHECKMATE - 200) {
      alpha = bestScore - ASPIRATION_DELTA;
      beta  = bestScore + ASPIRATION_DELTA;
    } else {
      alpha = -INF;
      beta  = INF;
    }

    let retries = 0;
    let iterBest = 0;
    let iterScore = -INF;
    let failed = true;

    while (true) {
      iterBest = 0;
      iterScore = -INF;
      let a = alpha;

      for (const m of sorted) {
        const from = m >>> 15, to = (m >>> 8) & 0x7F;
        const piece = board[from];
        const captured = board[to];
        const newHash = updateHashMove(rootHash, from, to, piece, captured);

        applyMove(board, m);
        const score = -alphaBeta(board, opponent(side), depth - 1, -beta, -a, newHash);
        undoMove(board, m);

        if (timeUp) break;

        if (score > iterScore) {
          iterScore = score;
          iterBest = m;
        }
        if (score > a) a = score;
      }

      if (timeUp) { failed = true; break; }

      if (iterScore <= alpha) {
        alpha = -INF;
        retries++;
      } else if (iterScore >= beta) {
        beta = INF;
        retries++;
      } else {
        failed = false;
        break;
      }

      if (retries > ASPIRATION_MAX_RETRIES) {
        alpha = -INF;
        beta = INF;
      }

      if (timeUp) { failed = true; break; }
    }

    if (timeUp) break;
    if (failed) break;

    bestMove = iterBest;
    bestScore = iterScore;
    depthReached = depth;

    if (bestScore >= CHECKMATE - 100) break;
  }

  const rootEntry = tt.get(rootHash);
  if (rootEntry && rootEntry.depth < depthReached) {
    depthReached = rootEntry.depth;
  }

  const pv = extractPV(board, side, rootHash, depthReached);

  return {
    move: bestMove,
    score: bestScore,
    depth: depthReached,
    nodes: nodesSearched,
    timeMs: Math.round(now() - startTime),
    pv
  };
}
