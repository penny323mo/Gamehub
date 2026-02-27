/* rules.js — Move generation & validation */
'use strict';

// Find king position for a side
function findKing(board, side) {
  const k = makePiece(side, KING);
  for (let i = 0; i < 90; i++) if (board[i] === k) return i;
  return -1;
}

// Are the two kings facing each other (flying general)?
function kingsFacing(board) {
  const rk = findKing(board, RED), bk = findKing(board, BLACK);
  if (rk < 0 || bk < 0) return false;
  const rc = colOf(rk), bc = colOf(bk);
  if (rc !== bc) return false;
  for (let r = rowOf(bk) + 1; r < rowOf(rk); r++) {
    if (board[idx(r, rc)] !== EMPTY) return false;
  }
  return true;
}

// Is `side` in check?
function inCheck(board, side) {
  const ki = findKing(board, side);
  if (ki < 0) return true; // king captured = in check
  const opp = opponent(side);
  // Check if any opponent piece attacks the king
  const kr = rowOf(ki), kc = colOf(ki);

  for (let i = 0; i < 90; i++) {
    const p = board[i];
    if (!p || pSide(p) !== opp) continue;
    const pr = rowOf(i), pc = colOf(i);
    const t = pType(p);

    if (t === ROOK) {
      if (canRookAttack(board, pr, pc, kr, kc)) return true;
    } else if (t === CANNON) {
      if (canCannonAttack(board, pr, pc, kr, kc)) return true;
    } else if (t === HORSE) {
      if (canHorseAttack(board, pr, pc, kr, kc)) return true;
    } else if (t === PAWN) {
      if (canPawnAttack(pr, pc, kr, kc, opp)) return true;
    } else if (t === KING) {
      // flying general
      if (pc === kc) {
        let blocked = false;
        const minR = Math.min(pr, kr), maxR = Math.max(pr, kr);
        for (let r = minR + 1; r < maxR; r++) {
          if (board[idx(r, pc)] !== EMPTY) { blocked = true; break; }
        }
        if (!blocked) return true;
      }
    }
    // advisors and elephants cannot attack the king from distance
  }
  return false;
}

function canRookAttack(board, r1, c1, r2, c2) {
  if (r1 !== r2 && c1 !== c2) return false;
  if (r1 === r2) {
    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
    for (let c = minC + 1; c < maxC; c++) if (board[idx(r1, c)] !== EMPTY) return false;
  } else {
    const minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
    for (let r = minR + 1; r < maxR; r++) if (board[idx(r, c1)] !== EMPTY) return false;
  }
  return true;
}

function canCannonAttack(board, r1, c1, r2, c2) {
  if (r1 !== r2 && c1 !== c2) return false;
  let count = 0;
  if (r1 === r2) {
    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
    for (let c = minC + 1; c < maxC; c++) if (board[idx(r1, c)] !== EMPTY) count++;
  } else {
    const minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
    for (let r = minR + 1; r < maxR; r++) if (board[idx(r, c1)] !== EMPTY) count++;
  }
  return count === 1;
}

function canHorseAttack(board, hr, hc, tr, tc) {
  // Horse attacks: check all 8 possible horse moves from (hr,hc)
  const moves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const legs  = [[-1,0],[-1,0],[0,-1],[0,1],[0,-1],[0,1],[1,0],[1,0]];
  for (let m = 0; m < 8; m++) {
    if (hr + moves[m][0] === tr && hc + moves[m][1] === tc) {
      const lr = hr + legs[m][0], lc = hc + legs[m][1];
      if (board[idx(lr, lc)] === EMPTY) return true;
    }
  }
  return false;
}

function canPawnAttack(pr, pc, tr, tc, pawnSide) {
  // Pawn attacks one square forward, or sideways if crossed river
  if (pawnSide === RED) {
    if (pr - 1 === tr && pc === tc) return true; // forward
    if (pr <= 4 && pr === tr && Math.abs(pc - tc) === 1) return true; // sideways after crossing
  } else {
    if (pr + 1 === tr && pc === tc) return true;
    if (pr >= 5 && pr === tr && Math.abs(pc - tc) === 1) return true;
  }
  return false;
}

// Generate all pseudo-legal moves for `side`, then filter for legality
function generateMoves(board, side) {
  const moves = [];
  for (let i = 0; i < 90; i++) {
    const p = board[i];
    if (!p || pSide(p) !== side) continue;
    const r = rowOf(i), c = colOf(i);
    const t = pType(p);

    switch (t) {
      case KING: genKing(board, side, r, c, moves); break;
      case ADVISOR: genAdvisor(board, side, r, c, moves); break;
      case ELEPHANT: genElephant(board, side, r, c, moves); break;
      case HORSE: genHorse(board, side, r, c, moves); break;
      case ROOK: genRook(board, side, r, c, moves); break;
      case CANNON: genCannon(board, side, r, c, moves); break;
      case PAWN: genPawn(board, side, r, c, moves); break;
    }
  }
  return moves;
}

function addMove(board, side, fr, fc, tr, tc, moves) {
  if (!inBoard(tr, tc)) return;
  const target = board[idx(tr, tc)];
  if (target && pSide(target) === side) return; // can't capture own piece
  moves.push({ from: idx(fr, fc), to: idx(tr, tc), captured: target });
}

function genKing(board, side, r, c, moves) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (side === RED) { if (nr < 7 || nr > 9 || nc < 3 || nc > 5) continue; }
    else { if (nr < 0 || nr > 2 || nc < 3 || nc > 5) continue; }
    addMove(board, side, r, c, nr, nc, moves);
  }
}

function genAdvisor(board, side, r, c, moves) {
  const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (side === RED) { if (nr < 7 || nr > 9 || nc < 3 || nc > 5) continue; }
    else { if (nr < 0 || nr > 2 || nc < 3 || nc > 5) continue; }
    addMove(board, side, r, c, nr, nc, moves);
  }
}

function genElephant(board, side, r, c, moves) {
  const dirs = [[-2,-2],[-2,2],[2,-2],[2,2]];
  const eyes = [[-1,-1],[-1,1],[1,-1],[1,1]];
  for (let m = 0; m < 4; m++) {
    const nr = r + dirs[m][0], nc = c + dirs[m][1];
    if (!inBoard(nr, nc)) continue;
    // Elephant cannot cross river
    if (side === RED && nr < 5) continue;
    if (side === BLACK && nr > 4) continue;
    // Check elephant eye
    const er = r + eyes[m][0], ec = c + eyes[m][1];
    if (board[idx(er, ec)] !== EMPTY) continue;
    addMove(board, side, r, c, nr, nc, moves);
  }
}

function genHorse(board, side, r, c, moves) {
  const ms = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const legs = [[-1,0],[-1,0],[0,-1],[0,1],[0,-1],[0,1],[1,0],[1,0]];
  for (let m = 0; m < 8; m++) {
    const nr = r + ms[m][0], nc = c + ms[m][1];
    if (!inBoard(nr, nc)) continue;
    const lr = r + legs[m][0], lc = c + legs[m][1];
    if (board[idx(lr, lc)] !== EMPTY) continue; // blocked leg
    addMove(board, side, r, c, nr, nc, moves);
  }
}

function genRook(board, side, r, c, moves) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    for (let step = 1; step < 10; step++) {
      const nr = r + dr * step, nc = c + dc * step;
      if (!inBoard(nr, nc)) break;
      const t = board[idx(nr, nc)];
      if (t) {
        if (pSide(t) !== side) addMove(board, side, r, c, nr, nc, moves);
        break;
      }
      addMove(board, side, r, c, nr, nc, moves);
    }
  }
}

function genCannon(board, side, r, c, moves) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    let jumped = false;
    for (let step = 1; step < 10; step++) {
      const nr = r + dr * step, nc = c + dc * step;
      if (!inBoard(nr, nc)) break;
      const t = board[idx(nr, nc)];
      if (!jumped) {
        if (t) { jumped = true; continue; }
        addMove(board, side, r, c, nr, nc, moves); // move without jumping
      } else {
        if (t) {
          if (pSide(t) !== side) addMove(board, side, r, c, nr, nc, moves);
          break;
        }
      }
    }
  }
}

function genPawn(board, side, r, c, moves) {
  if (side === RED) {
    addMove(board, side, r, c, r - 1, c, moves); // forward
    if (r <= 4) { // crossed river
      addMove(board, side, r, c, r, c - 1, moves);
      addMove(board, side, r, c, r, c + 1, moves);
    }
  } else {
    addMove(board, side, r, c, r + 1, c, moves);
    if (r >= 5) {
      addMove(board, side, r, c, r, c - 1, moves);
      addMove(board, side, r, c, r, c + 1, moves);
    }
  }
}

// Generate legal moves (filter out moves that leave own king in check or cause kings facing)
function legalMoves(board, side) {
  const pseudo = generateMoves(board, side);
  const legal = [];
  for (const mv of pseudo) {
    const nb = cloneBoard(board);
    nb[mv.to] = nb[mv.from];
    nb[mv.from] = EMPTY;
    if (inCheck(nb, side)) continue;
    if (kingsFacing(nb)) continue;
    legal.push(mv);
  }
  return legal;
}

// Get legal moves from a specific square
function legalMovesFrom(board, side, fromIdx) {
  return legalMoves(board, side).filter(m => m.from === fromIdx);
}

// Apply move (mutates board)
function applyMove(board, mv) {
  board[mv.to] = board[mv.from];
  board[mv.from] = EMPTY;
}
