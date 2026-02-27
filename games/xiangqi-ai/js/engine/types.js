/* types.js — Constants, piece encoding, board representation */
'use strict';

export const COLS = 9, ROWS = 10, BOARD_SIZE = 90;
export const RED = 1, BLACK = 2, EMPTY = 0;

// Piece types
export const KING = 1, ADVISOR = 2, ELEPHANT = 3, HORSE = 4,
             ROOK = 5, CANNON = 6, PAWN = 7;

// Piece encoding: side * 10 + type
export function pSide(p)  { return p ? (p / 10 | 0) : 0; }
export function pType(p)  { return p ? p % 10 : 0; }
export function mkPiece(side, type) { return side * 10 + type; }
export function opponent(side) { return side === RED ? BLACK : RED; }

// Index helpers
export function idx(r, c)   { return r * COLS + c; }
export function rowOf(i)    { return i / COLS | 0; }
export function colOf(i)    { return i % COLS; }
export function inBoard(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

// Piece display names
const R_NAMES = { 1:'帥',2:'仕',3:'相',4:'馬',5:'車',6:'炮',7:'兵' };
const B_NAMES = { 1:'將',2:'士',3:'象',4:'馬',5:'車',6:'砲',7:'卒' };
export function pieceName(p) {
  if (!p) return '';
  return (pSide(p) === RED ? R_NAMES : B_NAMES)[pType(p)] || '?';
}

// Initial board (row 0 = black top, row 9 = red bottom)
export function initBoard() {
  const b = new Int8Array(BOARD_SIZE);
  const back = [ROOK,HORSE,ELEPHANT,ADVISOR,KING,ADVISOR,ELEPHANT,HORSE,ROOK];
  for (let c = 0; c < 9; c++) {
    b[idx(0, c)] = mkPiece(BLACK, back[c]);
    b[idx(9, c)] = mkPiece(RED,   back[c]);
  }
  b[idx(2,1)] = mkPiece(BLACK,CANNON); b[idx(2,7)] = mkPiece(BLACK,CANNON);
  b[idx(7,1)] = mkPiece(RED,CANNON);   b[idx(7,7)] = mkPiece(RED,CANNON);
  for (let c = 0; c < 9; c += 2) {
    b[idx(3,c)] = mkPiece(BLACK,PAWN);
    b[idx(6,c)] = mkPiece(RED,PAWN);
  }
  return b;
}

export function cloneBoard(b) {
  const c = new Int8Array(BOARD_SIZE);
  c.set(b);
  return c;
}

// Move object: packed as 32-bit int  from(7) | to(7) | captured(8)
// Max index = 89 fits in 7 bits; captured piece value fits in 8 bits
export function packMove(from, to, captured) {
  return (from << 15) | (to << 8) | (captured & 0xFF);
}
export function unpackFrom(m)     { return m >>> 15; }
export function unpackTo(m)       { return (m >>> 8) & 0x7F; }
export function unpackCaptured(m) { return m & 0xFF; }

// Find king position
export function findKing(board, side) {
  const k = mkPiece(side, KING);
  for (let i = 0; i < BOARD_SIZE; i++) if (board[i] === k) return i;
  return -1;
}
