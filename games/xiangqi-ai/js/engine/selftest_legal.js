/* selftest_legal.js — Legality tests: flying general + self-check prohibition */
import {
  BOARD_SIZE, RED, BLACK, EMPTY, KING, ROOK, CANNON,
  mkPiece, idx, rowOf, colOf, unpackFrom, unpackTo
} from './types.js';
import { generateLegalMoves, kingsFacing, inCheck } from './gen.js';

function emptyBoard() { return new Int8Array(BOARD_SIZE); }

/* Test A: Flying general prohibition
   Red 帥 at (9,4), Black 將 at (0,4), same column, nothing between.
   Kings are facing. Any Red move that keeps kings on same col with
   nothing between must be filtered out. Only lateral moves (col 3 or 5) are legal. */
function testFlyingGeneral() {
  const b = emptyBoard();
  b[idx(9, 4)] = mkPiece(RED, KING);
  b[idx(0, 4)] = mkPiece(BLACK, KING);

  console.assert(kingsFacing(b) === true, 'FAIL: kings should be facing');

  const moves = generateLegalMoves(b, RED);

  for (const m of moves) {
    const to = unpackTo(m);
    const toCol = colOf(to);
    console.assert(toCol !== 4,
      `FAIL: flying general not filtered — move to row=${rowOf(to)} col=${toCol}`);
  }

  console.assert(moves.length === 2,
    `FAIL: expected 2 legal moves, got ${moves.length}`);

  console.log('✅ Test A passed: flying general moves correctly filtered');
}

/* Test B: Self-check prohibition
   Red 帥 at (9,4), Red 車 at (8,4) blocking Black 車 at (1,4).
   Black 將 at (0,4). Moving Red 車 off col 4 would expose 帥 to Black 車. */
function testSelfCheck() {
  const b = emptyBoard();
  b[idx(9, 4)] = mkPiece(RED, KING);
  b[idx(0, 4)] = mkPiece(BLACK, KING);
  b[idx(8, 4)] = mkPiece(RED, ROOK);
  b[idx(1, 4)] = mkPiece(BLACK, ROOK);

  console.assert(inCheck(b, RED) === false, 'FAIL: Red should not be in check');

  const moves = generateLegalMoves(b, RED);

  const rookFrom = idx(8, 4);
  const rookMoves = moves.filter(m => unpackFrom(m) === rookFrom);

  for (const m of rookMoves) {
    const to = unpackTo(m);
    const toCol = colOf(to);
    console.assert(toCol === 4,
      `FAIL: self-check not filtered — rook moves to row=${rowOf(to)} col=${toCol}`);
  }

  console.assert(rookMoves.length >= 1,
    `FAIL: expected rook to have legal moves on col 4, got ${rookMoves.length}`);

  for (const m of rookMoves) {
    const nb = new Int8Array(b);
    nb[unpackTo(m)] = nb[unpackFrom(m)];
    nb[unpackFrom(m)] = EMPTY;
    console.assert(inCheck(nb, RED) === false,
      'FAIL: a legal rook move still leaves Red in check');
  }

  console.log('✅ Test B passed: self-check moves correctly filtered');
}

testFlyingGeneral();
testSelfCheck();
console.log('✅ All legality tests passed');
