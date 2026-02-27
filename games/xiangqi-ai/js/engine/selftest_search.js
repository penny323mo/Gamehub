/* selftest_search.js — Search sanity: must find an obvious winning move */
import {
  BOARD_SIZE, RED, BLACK, EMPTY, KING, ROOK,
  mkPiece, idx, unpackFrom, unpackTo, unpackCaptured, rowOf, colOf
} from './types.js';
import { generateLegalMoves } from './gen.js';
import { search } from './search.js';

function emptyBoard() { return new Int8Array(BOARD_SIZE); }

function testSearchFindsCapture() {
  const b = emptyBoard();
  b[idx(0, 4)] = mkPiece(BLACK, KING);
  b[idx(9, 3)] = mkPiece(RED, KING);
  b[idx(5, 0)] = mkPiece(BLACK, ROOK);
  b[idx(5, 8)] = mkPiece(RED, ROOK);

  const result = search(b, RED, 200);

  console.log(`Search result: depth=${result.depth} nodes=${result.nodes} ` +
              `time=${result.timeMs}ms score=${result.score}`);

  console.assert(result.move !== 0, 'FAIL: search returned no move');

  const legal = generateLegalMoves(b, RED);
  const found = legal.find(m => m === result.move);
  console.assert(found !== undefined, 'FAIL: search returned an illegal move');

  const from = unpackFrom(result.move);
  const to = unpackTo(result.move);
  const cap = unpackCaptured(result.move);

  console.log(`Best move: (${rowOf(from)},${colOf(from)}) → (${rowOf(to)},${colOf(to)}) capture=${cap}`);

  console.assert(cap === mkPiece(BLACK, ROOK),
    `FAIL: expected capture of black rook (25), got ${cap}`);
  console.assert(from === idx(5, 8), `FAIL: expected from (5,8)`);
  console.assert(to === idx(5, 0), `FAIL: expected to (5,0)`);

  console.log('✅ Search test passed: found obvious rook capture');
}

testSearchFindsCapture();
console.log('✅ All search tests passed');
