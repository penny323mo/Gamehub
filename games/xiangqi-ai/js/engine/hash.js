/* hash.js — Zobrist hashing for transposition table */
'use strict';

import { BOARD_SIZE, RED, BLACK, KING, PAWN, mkPiece } from './types.js';

/* ── 64-bit random BigInt via xorshift128+ ── */
let s0 = 0x12345678_9ABCDEF0n;
let s1 = 0xFEDCBA98_76543210n;
const MASK64 = 0xFFFFFFFF_FFFFFFFFn;

function nextRand64() {
  let a = s0, b = s1;
  s0 = b;
  a ^= (a << 23n) & MASK64;
  a ^= a >> 17n;
  a ^= b;
  a ^= b >> 26n;
  s1 = a;
  return (a + b) & MASK64;
}

/* ── Zobrist table: piece code (11..17, 21..27) × square (0..89) ── */
const zobTable = new Map();
let zobSideToMove = 0n;

export function initZobrist() {
  s0 = 0x12345678_9ABCDEF0n;
  s1 = 0xFEDCBA98_76543210n;

  for (const side of [RED, BLACK]) {
    for (let type = KING; type <= PAWN; type++) {
      const pc = mkPiece(side, type);
      const arr = new Array(BOARD_SIZE);
      for (let sq = 0; sq < BOARD_SIZE; sq++) {
        arr[sq] = nextRand64();
      }
      zobTable.set(pc, arr);
    }
  }
  zobSideToMove = nextRand64();
}

export function computeHash(board, side) {
  let h = 0n;
  for (let i = 0; i < BOARD_SIZE; i++) {
    const p = board[i];
    if (p) {
      const arr = zobTable.get(p);
      if (arr) h ^= arr[i];
    }
  }
  if (side === BLACK) h ^= zobSideToMove;
  return h;
}

export function updateHashMove(hash, from, to, piece, captured) {
  const arr = zobTable.get(piece);
  hash ^= arr[from];
  hash ^= arr[to];
  if (captured) {
    const capArr = zobTable.get(captured);
    if (capArr) hash ^= capArr[to];
  }
  hash ^= zobSideToMove;
  return hash;
}

initZobrist();
