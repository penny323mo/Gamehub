/* eval.js — Static position evaluation */
'use strict';

import {
  BOARD_SIZE, RED, BLACK, EMPTY,
  KING, ADVISOR, ELEPHANT, HORSE, ROOK, CANNON, PAWN,
  pSide, pType, rowOf, colOf, findKing, opponent
} from './types.js';
import { inCheck } from './gen.js';

/* ── Material values ── */

const MAT = new Int16Array(8);
MAT[KING]     = 10000;
MAT[ADVISOR]  = 120;
MAT[ELEPHANT] = 120;
MAT[HORSE]    = 270;
MAT[ROOK]     = 600;
MAT[CANNON]   = 285;
MAT[PAWN]     = 30;

export { MAT as MATERIAL };

/* ── Piece-Square Tables (10 rows × 9 cols, from RED's perspective, row 0 = opponent back rank)
   Values are centipawn bonuses added to material.
   BLACK mirrors vertically (row → 9 - row). ── */

// Pawn: huge bonus for advanced pawns, especially central
const PST_PAWN = new Int16Array([
   0,  0,  0,  0,  0,  0,  0,  0,  0,
   0,  0,  0,  0,  0,  0,  0,  0,  0,
   0,  0,  0,  0,  0,  0,  0,  0,  0,
  10, 20, 30, 40, 45, 40, 30, 20, 10,
  20, 40, 60, 70, 80, 70, 60, 40, 20,
  10, 30, 50, 60, 70, 60, 50, 30, 10,
   0,  0, 20, 30, 40, 30, 20,  0,  0,
   0,  0,  0,  0,  0,  0,  0,  0,  0,
   0,  0,  0,  0,  0,  0,  0,  0,  0,
   0,  0,  0,  0,  0,  0,  0,  0,  0,
]);

// Horse: prefer center, avoid edges
const PST_HORSE = new Int16Array([
  -10,  0,  5, 10, 10, 10,  5,  0,-10,
   -5,  0, 10, 15, 15, 15, 10,  0, -5,
    0, 10, 15, 20, 20, 20, 15, 10,  0,
    0, 10, 20, 25, 25, 25, 20, 10,  0,
    0, 10, 20, 25, 30, 25, 20, 10,  0,
    0, 10, 20, 25, 25, 25, 20, 10,  0,
    0, 10, 15, 20, 20, 20, 15, 10,  0,
   -5,  0, 10, 15, 15, 15, 10,  0, -5,
  -10,  0,  5, 10, 10, 10,  5,  0,-10,
  -15, -5,  0,  5,  5,  5,  0, -5,-15,
]);

// Cannon: prefer back ranks and central files
const PST_CANNON = new Int16Array([
    0,  0, 10, 15, 15, 15, 10,  0,  0,
    0,  0,  5, 10, 10, 10,  5,  0,  0,
    0,  5, 10, 15, 15, 15, 10,  5,  0,
    0,  5, 10, 12, 12, 12, 10,  5,  0,
    0,  0,  5,  8,  8,  8,  5,  0,  0,
    0,  0,  5,  8,  8,  8,  5,  0,  0,
    0,  5, 10, 12, 12, 12, 10,  5,  0,
    5, 10, 15, 20, 20, 20, 15, 10,  5,
    5, 10, 15, 20, 25, 20, 15, 10,  5,
    0,  5, 10, 15, 15, 15, 10,  5,  0,
]);

// Rook: prefer open files, 7th rank
const PST_ROOK = new Int16Array([
    5, 10, 10, 15, 15, 15, 10, 10,  5,
    5, 10, 15, 20, 20, 20, 15, 10,  5,
    5, 10, 15, 20, 20, 20, 15, 10,  5,
   10, 15, 20, 25, 25, 25, 20, 15, 10,
   10, 15, 20, 25, 25, 25, 20, 15, 10,
   10, 15, 20, 25, 25, 25, 20, 15, 10,
    5, 10, 15, 20, 20, 20, 15, 10,  5,
    0,  5, 10, 15, 15, 15, 10,  5,  0,
    0,  5, 10, 15, 15, 15, 10,  5,  0,
    0,  0,  5, 10, 10, 10,  5,  0,  0,
]);

const PST = {};
PST[PAWN]   = PST_PAWN;
PST[HORSE]  = PST_HORSE;
PST[CANNON] = PST_CANNON;
PST[ROOK]   = PST_ROOK;

function pstBonus(type, row, col) {
  const tbl = PST[type];
  if (!tbl) return 0;
  return tbl[row * 9 + col];
}

/* ── Evaluation (positive = RED advantage) ── */

export const INF = 99999;
export const CHECKMATE = 90000;

export function evaluate(board, side) {
  let score = 0;

  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = board[i];
    if (!p) continue;
    const s = pSide(p), t = pType(p);
    const r = rowOf(i), c = colOf(i);

    // Material
    let val = MAT[t];

    // PST bonus (mirror for BLACK)
    if (s === RED) {
      val += pstBonus(t, r, c);
    } else {
      val += pstBonus(t, 9 - r, c);
    }

    score += (s === RED) ? val : -val;
  }

  // Check penalty: if the side to move is in check, penalise
  if (inCheck(board, RED))   score -= 80;
  if (inCheck(board, BLACK)) score += 80;

  // King safety: penalise king on exposed column (no own rook/cannon on same file)
  for (const ks of [RED, BLACK]) {
    const ki = findKing(board, ks);
    if (ki < 0) {
      score += ks === RED ? -CHECKMATE : CHECKMATE;
      continue;
    }
    const kc = colOf(ki);
    let hasDefender = false;
    for (let r = 0; r < 10; r++) {
      const pp = board[r * 9 + kc];
      if (pp && pSide(pp) === ks && (pType(pp) === ROOK || pType(pp) === CANNON)) {
        hasDefender = true; break;
      }
    }
    if (!hasDefender) {
      score += ks === RED ? -15 : 15;
    }
  }

  // Return from perspective of `side`
  return side === RED ? score : -score;
}
