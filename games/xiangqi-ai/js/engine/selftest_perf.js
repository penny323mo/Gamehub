/* selftest_perf.js — Performance benchmark on initial position */
import { RED, initBoard } from './types.js';
import { search } from './search.js';

const board = initBoard();
const result = search(board, RED, 500);

console.log(`Perf: depth=${result.depth} nodes=${result.nodes} time=${result.timeMs}ms`);
console.log(`Score: ${result.score}`);

console.assert(result.timeMs <= 650,
  `FAIL: search took ${result.timeMs}ms, expected ≤650ms`);
console.assert(result.depth >= 1,
  `FAIL: search only reached depth ${result.depth}`);
console.assert(result.nodes > 0,
  'FAIL: zero nodes searched');
console.assert(result.move !== 0,
  'FAIL: no move returned');

console.log('✅ Perf test passed');
