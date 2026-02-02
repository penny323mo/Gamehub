// AI（no-module build）
(() => {
  const DDZ = window.DDZ = window.DDZ || {};
  const { getLegalMoves, TYPE, cardId } = DDZ;
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

  const ORDER = ['3','4','5','6','7','8','9','10','J','Q','K','A'];

  function maxSeqLen(ranks, minLen){
    const set = new Set(ranks);
    let best = 0;
    let cur = 0;
    for (const r of ORDER){
      if (set.has(r)){
        cur++;
        best = Math.max(best, cur);
      } else {
        cur = 0;
      }
    }
    return best >= minLen ? best : 0;
  }

  function straightPotential(cards){
    const cnt = countByRank(cards);
    const singles = [...cnt.keys()].filter(r => !['2','BJ','RJ'].includes(r));
    return maxSeqLen(singles, 5);
  }

  function pairStraightPotential(cards){
    const cnt = countByRank(cards);
    const pairs = [...cnt.keys()].filter(r => (cnt.get(r) || 0) >= 2 && !['2','BJ','RJ'].includes(r));
    return maxSeqLen(pairs, 3);
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

    const singleRanks = [...cnt.keys()].filter(r => !['2','BJ','RJ'].includes(r));
    const pairRanks = [...cnt.keys()].filter(r => (cnt.get(r) || 0) >= 2 && !['2','BJ','RJ'].includes(r));
    const tripRanks = [...cnt.keys()].filter(r => (cnt.get(r) || 0) >= 3 && !['2','BJ','RJ'].includes(r));

    const straightLen = maxSeqLen(singleRanks, 5);
    const pairStraightLen = maxSeqLen(pairRanks, 3);
    const planeLen = maxSeqLen(tripRanks, 2);

    if (straightLen) score += Math.floor(straightLen / 2);
    if (pairStraightLen) score += Math.floor(pairStraightLen / 2);
    if (planeLen) score += planeLen * 2;

    return score;
  }

  function cpuBidDecision(hand, bid){
    const score = handStrength(hand);
    const calledBy = bid?.calledBy;
    const r = Math.random();

    if (calledBy == null){
      if (score >= 7) return 'call';
      if (score >= 5 && r < 0.35) return 'call';
      return 'pass';
    }

    if (score >= 9) return 'rob';
    if (score >= 7 && r < 0.4) return 'rob';
    return 'pass';
  }

  function countSingles(cards){
    const cnt = countByRank(cards);
    let singles = 0;
    for (const n of cnt.values()) if (n === 1) singles++;
    return singles;
  }

  function groupStats(cards){
    const cnt = countByRank(cards);
    let singles = 0, pairs = 0, trips = 0, quads = 0;
    for (const n of cnt.values()){
      if (n === 1) singles++;
      else if (n === 2) pairs++;
      else if (n === 3) trips++;
      else if (n >= 4) quads++;
    }
    return { singles, pairs, trips, quads };
  }

  function scoreResponse(hand, move){
    const rm = new Set(move.cards.map(cardId));
    const remaining = hand.filter(c => !rm.has(cardId(c)));
    const before = groupStats(hand);
    const after = groupStats(remaining);

    const singlePenalty = Math.max(0, after.singles - before.singles) * 3;
    const breakPairPenalty = Math.max(0, before.pairs - after.pairs) * 4;
    const breakTripPenalty = Math.max(0, before.trips - after.trips) * 6;
    const bombPenalty = (move.ev.type === TYPE.BOMB || move.ev.type === TYPE.ROCKET) ? 50 : 0;

    const straightBefore = straightPotential(hand);
    const straightAfter = straightPotential(remaining);
    const breakStraightPenalty = (straightBefore >= 5 && straightAfter < straightBefore) ? 6 : 0;

    const pairStraightBefore = pairStraightPotential(hand);
    const pairStraightAfter = pairStraightPotential(remaining);
    const breakPairStraightPenalty = (pairStraightBefore >= 3 && pairStraightAfter < pairStraightBefore) ? 6 : 0;

    return remaining.length * 10 + singlePenalty + breakPairPenalty + breakTripPenalty + bombPenalty + breakStraightPenalty + breakPairStraightPenalty;
  }

  function cpuChooseMove(hand, lastPlay, context){
    const legal = getLegalMoves(hand, lastPlay);
    if (!legal.length) return null;

    const isFarmer = context?.role === 'farmer';
    const landlordNearWin = context?.landlordHandSize <= 2;
    const lastPlayFromLandlord = lastPlay && lastPlay.by === context?.landlordIdx;

    if (lastPlay){
      const nonBomb = legal.filter(m => m.ev.type !== TYPE.BOMB && m.ev.type !== TYPE.ROCKET);
      const pool = nonBomb.length ? nonBomb : legal;

      const lastPlayFromFarmerMate = isFarmer && lastPlay.by !== context?.landlordIdx && lastPlay.by !== context?.idx;
      // 特殊邏輯：同伴（農民）出牌時，非危急情況讓牌
      if (lastPlayFromFarmerMate && !landlordNearWin){
        return null; // pass to let teammate keep lead
      }
      
      // 特殊邏輯：地主快贏時，農民要頂大牌
      if (isFarmer && landlordNearWin && lastPlayFromLandlord) {
        // 找最大的合法牌跟
        pool.sort((a, b) => (RANK_INDEX[b.ev.keyRank] ?? 0) - (RANK_INDEX[a.ev.keyRank] ?? 0));
        return pool[0];
      }

      pool.sort((a,b) => scoreResponse(hand, a) - scoreResponse(hand, b));
      return pool[0];
    }

    const nonBomb = legal.filter(m => m.ev.type !== TYPE.BOMB && m.ev.type !== TYPE.ROCKET);
    const pool = nonBomb.length ? nonBomb : legal;

    // 特殊邏輯：地主快贏時，農民領出要放重砲（大單／大對）
    if (isFarmer && landlordNearWin) {
      pool.sort((a, b) => (RANK_INDEX[b.ev.keyRank] ?? 0) - (RANK_INDEX[a.ev.keyRank] ?? 0));
      return pool[0];
    }

    pool.sort((a,b) => cmpScore(scoreLead(a.ev), scoreLead(b.ev)));
    return pool[0];
  }

  DDZ.cpuBidDecision = cpuBidDecision;
  DDZ.cpuChooseMove = cpuChooseMove;
})();
