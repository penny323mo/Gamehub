/* gen.js — Move generation (pseudo-legal + legality filter) */
'use strict';

import {
  COLS, ROWS, BOARD_SIZE, RED, BLACK, EMPTY,
  KING, ADVISOR, ELEPHANT, HORSE, ROOK, CANNON, PAWN,
  pSide, pType, idx, rowOf, colOf, inBoard,
  packMove, cloneBoard, findKing, opponent
} from './types.js';

/* ── Attack helpers (used by inCheck) ── */

function rookAttacks(board, r1, c1, r2, c2) {
  if (r1 !== r2 && c1 !== c2) return false;
  if (r1 === r2) {
    const lo = Math.min(c1, c2), hi = Math.max(c1, c2);
    for (let c = lo + 1; c < hi; c++) if (board[idx(r1, c)]) return false;
  } else {
    const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    for (let r = lo + 1; r < hi; r++) if (board[idx(r, c1)]) return false;
  }
  return true;
}

function cannonAttacks(board, r1, c1, r2, c2) {
  if (r1 !== r2 && c1 !== c2) return false;
  let cnt = 0;
  if (r1 === r2) {
    const lo = Math.min(c1, c2), hi = Math.max(c1, c2);
    for (let c = lo + 1; c < hi; c++) if (board[idx(r1, c)]) cnt++;
  } else {
    const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    for (let r = lo + 1; r < hi; r++) if (board[idx(r, c1)]) cnt++;
  }
  return cnt === 1;
}

const H_OFFSETS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const H_LEGS    = [[-1,0],[-1,0],[0,-1],[0,1],[0,-1],[0,1],[1,0],[1,0]];

function horseAttacks(board, hr, hc, tr, tc) {
  for (let m = 0; m < 8; m++) {
    if (hr + H_OFFSETS[m][0] === tr && hc + H_OFFSETS[m][1] === tc) {
      if (board[idx(hr + H_LEGS[m][0], hc + H_LEGS[m][1])] === EMPTY) return true;
    }
  }
  return false;
}

function pawnAttacks(pr, pc, tr, tc, pawnSide) {
  if (pawnSide === RED) {
    if (pr - 1 === tr && pc === tc) return true;
    if (pr <= 4 && pr === tr && Math.abs(pc - tc) === 1) return true;
  } else {
    if (pr + 1 === tr && pc === tc) return true;
    if (pr >= 5 && pr === tr && Math.abs(pc - tc) === 1) return true;
  }
  return false;
}

/* ── Kings facing (flying general) ── */

export function kingsFacing(board) {
  const rk = findKing(board, RED), bk = findKing(board, BLACK);
  if (rk < 0 || bk < 0) return false;
  const rc = colOf(rk), bc = colOf(bk);
  if (rc !== bc) return false;
  for (let r = rowOf(bk) + 1; r < rowOf(rk); r++) {
    if (board[idx(r, rc)]) return false;
  }
  return true;
}

/* ── In-check detection ── */

export function inCheck(board, side) {
  const ki = findKing(board, side);
  if (ki < 0) return true;
  const kr = rowOf(ki), kc = colOf(ki);
  const opp = opponent(side);

  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = board[i];
    if (!p || pSide(p) !== opp) continue;
    const pr = rowOf(i), pc = colOf(i), t = pType(p);

    if (t === ROOK   && rookAttacks(board, pr, pc, kr, kc)) return true;
    if (t === CANNON  && cannonAttacks(board, pr, pc, kr, kc)) return true;
    if (t === HORSE   && horseAttacks(board, pr, pc, kr, kc)) return true;
    if (t === PAWN    && pawnAttacks(pr, pc, kr, kc, opp)) return true;
    if (t === KING && pc === kc) {
      let blocked = false;
      const lo = Math.min(pr, kr), hi = Math.max(pr, kr);
      for (let r = lo + 1; r < hi; r++) if (board[idx(r, pc)]) { blocked = true; break; }
      if (!blocked) return true;
    }
  }
  return false;
}

/* ── Pseudo-legal move generation ── */

function addMv(board, side, fr, fc, tr, tc, moves) {
  if (!inBoard(tr, tc)) return;
  const ti = idx(tr, tc), target = board[ti];
  if (target && pSide(target) === side) return;
  moves.push(packMove(idx(fr, fc), ti, target));
}

function genKing(board, side, r, c, mv) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  const rMin = side === RED ? 7 : 0, rMax = side === RED ? 9 : 2;
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr < rMin || nr > rMax || nc < 3 || nc > 5) continue;
    addMv(board, side, r, c, nr, nc, mv);
  }
}

function genAdvisor(board, side, r, c, mv) {
  const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
  const rMin = side === RED ? 7 : 0, rMax = side === RED ? 9 : 2;
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr < rMin || nr > rMax || nc < 3 || nc > 5) continue;
    addMv(board, side, r, c, nr, nc, mv);
  }
}

function genElephant(board, side, r, c, mv) {
  const dirs = [[-2,-2],[-2,2],[2,-2],[2,2]];
  const eyes = [[-1,-1],[-1,1],[1,-1],[1,1]];
  for (let m = 0; m < 4; m++) {
    const nr = r + dirs[m][0], nc = c + dirs[m][1];
    if (!inBoard(nr, nc)) continue;
    if (side === RED && nr < 5) continue;
    if (side === BLACK && nr > 4) continue;
    if (board[idx(r + eyes[m][0], c + eyes[m][1])]) continue;
    addMv(board, side, r, c, nr, nc, mv);
  }
}

function genHorse(board, side, r, c, mv) {
  for (let m = 0; m < 8; m++) {
    const nr = r + H_OFFSETS[m][0], nc = c + H_OFFSETS[m][1];
    if (!inBoard(nr, nc)) continue;
    if (board[idx(r + H_LEGS[m][0], c + H_LEGS[m][1])]) continue;
    addMv(board, side, r, c, nr, nc, mv);
  }
}

function genRook(board, side, r, c, mv) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    for (let s = 1; s < 10; s++) {
      const nr = r + dr * s, nc = c + dc * s;
      if (!inBoard(nr, nc)) break;
      const t = board[idx(nr, nc)];
      if (t) { if (pSide(t) !== side) addMv(board, side, r, c, nr, nc, mv); break; }
      addMv(board, side, r, c, nr, nc, mv);
    }
  }
}

function genCannon(board, side, r, c, mv) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    let jumped = false;
    for (let s = 1; s < 10; s++) {
      const nr = r + dr * s, nc = c + dc * s;
      if (!inBoard(nr, nc)) break;
      const t = board[idx(nr, nc)];
      if (!jumped) {
        if (t) { jumped = true; continue; }
        addMv(board, side, r, c, nr, nc, mv);
      } else {
        if (t) { if (pSide(t) !== side) addMv(board, side, r, c, nr, nc, mv); break; }
      }
    }
  }
}

function genPawn(board, side, r, c, mv) {
  if (side === RED) {
    addMv(board, side, r, c, r - 1, c, mv);
    if (r <= 4) { addMv(board, side, r, c, r, c - 1, mv); addMv(board, side, r, c, r, c + 1, mv); }
  } else {
    addMv(board, side, r, c, r + 1, c, mv);
    if (r >= 5) { addMv(board, side, r, c, r, c - 1, mv); addMv(board, side, r, c, r, c + 1, mv); }
  }
}

/* ── Public: generate all pseudo-legal moves ── */

export function generatePseudoMoves(board, side) {
  const mv = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = board[i];
    if (!p || pSide(p) !== side) continue;
    const r = rowOf(i), c = colOf(i), t = pType(p);
    switch (t) {
      case KING:     genKing(board, side, r, c, mv); break;
      case ADVISOR:  genAdvisor(board, side, r, c, mv); break;
      case ELEPHANT: genElephant(board, side, r, c, mv); break;
      case HORSE:    genHorse(board, side, r, c, mv); break;
      case ROOK:     genRook(board, side, r, c, mv); break;
      case CANNON:   genCannon(board, side, r, c, mv); break;
      case PAWN:     genPawn(board, side, r, c, mv); break;
    }
  }
  return mv;
}

/* ── Public: generate legal moves (filters self-check & kings facing) ── */

export function generateLegalMoves(board, side) {
  const pseudo = generatePseudoMoves(board, side);
  const legal = [];
  for (const m of pseudo) {
    const from = m >>> 15, to = (m >>> 8) & 0x7F;
    const saved = board[to];
    board[to] = board[from];
    board[from] = EMPTY;
    const ok = !inCheck(board, side) && !kingsFacing(board);
    board[from] = board[to];
    board[to] = saved;
    if (ok) legal.push(m);
  }
  return legal;
}

/* ── Apply / undo move (mutates board) ── */

export function applyMove(board, m) {
  const from = m >>> 15, to = (m >>> 8) & 0x7F;
  board[to] = board[from];
  board[from] = EMPTY;
}

export function undoMove(board, m) {
  const from = m >>> 15, to = (m >>> 8) & 0x7F, cap = m & 0xFF;
  board[from] = board[to];
  board[to] = cap;
}
