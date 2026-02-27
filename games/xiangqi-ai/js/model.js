/* model.js — Board representation & constants */
'use strict';

const COLS = 9, ROWS = 10;
const RED = 1, BLACK = 2;
const EMPTY = 0;

// Piece types
const KING = 1, ADVISOR = 2, ELEPHANT = 3, HORSE = 4, ROOK = 5, CANNON = 6, PAWN = 7;

// Piece encoding: side * 10 + type  (e.g. RED KING = 11, BLACK ROOK = 25)
function pSide(p) { return p ? Math.floor(p / 10) : 0; }
function pType(p) { return p ? p % 10 : 0; }
function makePiece(side, type) { return side * 10 + type; }

const PIECE_NAMES = { 1:'帥', 2:'仕', 3:'相', 4:'馬', 5:'車', 6:'炮', 7:'兵' };
const PIECE_NAMES_BLACK = { 1:'將', 2:'士', 3:'象', 4:'馬', 5:'車', 6:'砲', 7:'卒' };

function pieceName(p) {
  if (!p) return '';
  const s = pSide(p), t = pType(p);
  return s === RED ? (PIECE_NAMES[t]||'?') : (PIECE_NAMES_BLACK[t]||'?');
}

// Board is a flat array [row * 9 + col], row 0 = top (black side), row 9 = bottom (red side)
function idx(r, c) { return r * COLS + c; }
function rowOf(i) { return Math.floor(i / COLS); }
function colOf(i) { return i % COLS; }
function inBoard(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

// Initial board setup
function initBoard() {
  const b = new Array(COLS * ROWS).fill(EMPTY);
  // Black pieces (top, rows 0-4)
  const backRow = [ROOK, HORSE, ELEPHANT, ADVISOR, KING, ADVISOR, ELEPHANT, HORSE, ROOK];
  for (let c = 0; c < 9; c++) b[idx(0, c)] = makePiece(BLACK, backRow[c]);
  b[idx(2, 1)] = makePiece(BLACK, CANNON);
  b[idx(2, 7)] = makePiece(BLACK, CANNON);
  for (let c = 0; c < 9; c += 2) b[idx(3, c)] = makePiece(BLACK, PAWN);

  // Red pieces (bottom, rows 5-9)
  for (let c = 0; c < 9; c++) b[idx(9, c)] = makePiece(RED, backRow[c]);
  b[idx(7, 1)] = makePiece(RED, CANNON);
  b[idx(7, 7)] = makePiece(RED, CANNON);
  for (let c = 0; c < 9; c += 2) b[idx(6, c)] = makePiece(RED, PAWN);

  return b;
}

function cloneBoard(b) { return b.slice(); }

function opponent(side) { return side === RED ? BLACK : RED; }
