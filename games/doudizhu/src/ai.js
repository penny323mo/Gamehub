// AI（no-module build）
(() => {
  const DDZ = window.DDZ = window.DDZ || {};
  const { getLegalMoves, TYPE } = DDZ;
  const { RANK_INDEX } = DDZ;

  function scoreLead(ev){
    const typeOrder = {
      [TYPE.PLANE_W2]: 1,
      [TYPE.PLANE_W1]: 2,
      [TYPE.PLANE]: 3,
      [TYPE.PAIR_STRAIGHT]: 4,
      [TYPE.STRAIGHT]: 5,
      [TYPE.TRIPS_2]: 6,
      [TYPE.TRIPS_1]: 7,
      [TYPE.TRIPS]: 8,
      [TYPE.FOUR_2S]: 9,
      [TYPE.FOUR_2P]: 10,
      [TYPE.PAIR]: 11,
      [TYPE.SINGLE]: 12,
      [TYPE.BOMB]: 98,
      [TYPE.ROCKET]: 99,
    };
    return [typeOrder[ev.type] ?? 50, -ev.n, RANK_INDEX[ev.keyRank] ?? 0];
  }

  function cmpScore(a, b){
    for (let i=0;i<Math.max(a.length,b.length);i++){
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (av === bv) continue;
      return av - bv;
    }
    return 0;
  }

  function countByRank(hand){
    const m = new Map();
    for (const c of hand){
      m.set(c.rank, (m.get(c.rank) || 0) + 1);
    }
    return m;
  }

  function handStrength(hand){
    const cnt = countByRank(hand);
    let score = 0;
    if (cnt.get('BJ') === 1 && cnt.get('RJ') === 1) score += 6;
    for (const [r,n] of cnt.entries()) if (n === 4) score += 4;
    for (const [r,n] of cnt.entries()) if (n === 3) score += 2;
    score += (cnt.get('2') || 0) * 1;
    score += (cnt.get('BJ') || 0) * 1;
    score += (cnt.get('RJ') || 0) * 1;
    return score;
  }

  function cpuBidDecision(hand, bid){
    const score = handStrength(hand);
    const calledBy = bid?.calledBy;
    const r = Math.random();

    if (calledBy == null){
      if (score >= 6) return 'call';
      if (score >= 4 && r < 0.35) return 'call';
      return 'pass';
    }

    if (score >= 8) return 'rob';
    if (score >= 6 && r < 0.4) return 'rob';
    return 'pass';
  }

  function cpuChooseMove(hand, lastPlay){
    const legal = getLegalMoves(hand, lastPlay);
    if (!legal.length) return null;

    if (lastPlay){
      const nonBomb = legal.filter(m => m.ev.type !== TYPE.BOMB && m.ev.type !== TYPE.ROCKET);
      return nonBomb.length ? nonBomb[0] : legal[0];
    }

    const nonBomb = legal.filter(m => m.ev.type !== TYPE.BOMB && m.ev.type !== TYPE.ROCKET);
    const pool = nonBomb.length ? nonBomb : legal;
    pool.sort((a,b) => cmpScore(scoreLead(a.ev), scoreLead(b.ev)));
    return pool[0];
  }

  DDZ.cpuBidDecision = cpuBidDecision;
  DDZ.cpuChooseMove = cpuChooseMove;
})();
