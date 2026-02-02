// 合法出牌生成（v0.1）
// 生成所有可出牌（含炸彈/火箭/四帶二/飛機等），並依 lastPlay 過濾。
(() => {
  const DDZ = window.DDZ = window.DDZ || {};
  const { cardId, sortCards } = DDZ;
  const { evalHand, canBeat, TYPE } = DDZ;

  const cache = new Map();

  function handSig(hand){
    return hand.map(cardId).sort().join(',');
  }

  function lastSig(last){
    if (!last) return 'LEAD';
    return `${last.eval?.type}|${last.by}|${last.cards.map(cardId).sort().join(',')}`;
  }

  function groupCardsByRank(hand){
    const m = new Map();
    for (const c of hand){
      if (!m.has(c.rank)) m.set(c.rank, []);
      m.get(c.rank).push(c);
    }
    for (const arr of m.values()) arr.sort((a,b)=>cardId(a).localeCompare(cardId(b)));
    return m;
  }

  function pickN(rankMap, r, n){
    const arr = rankMap.get(r) || [];
    return arr.slice(0, n);
  }

  function combinations(arr, k){
    const res = [];
    const n = arr.length;
    if (k === 0) return [[]];
    if (k > n) return [];
    const idx = Array.from({length:k}, (_,i)=>i);
    const push = () => res.push(idx.map(i=>arr[i]));
    const next = () => {
      let i = k-1;
      while (i>=0 && idx[i] === n-k+i) i--;
      if (i<0) return false;
      idx[i]++;
      for (let j=i+1;j<k;j++) idx[j] = idx[j-1] + 1;
      return true;
    };
    push();
    while (next()) push();
    return res;
  }

  function addMove(out, cards){
    const ev = evalHand(cards);
    if (!ev) return;
    out.push({ cards: sortCards(cards), ev });
  }

  function uniqueMoves(moves){
    const seen = new Set();
    const out = [];
    for (const m of moves){
      const key = m.cards.map(cardId).sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(m);
    }
    return out;
  }

  function scoreKey(ev){
    // lower = weaker, for picking minimal winning
    // bombs/rocket go last
    const typeOrder = {
      [TYPE.SINGLE]: 1,
      [TYPE.PAIR]: 2,
      [TYPE.TRIPS]: 3,
      [TYPE.TRIPS_1]: 4,
      [TYPE.TRIPS_2]: 5,
      [TYPE.STRAIGHT]: 6,
      [TYPE.PAIR_STRAIGHT]: 7,
      [TYPE.PLANE]: 8,
      [TYPE.PLANE_W1]: 9,
      [TYPE.PLANE_W2]: 10,
      [TYPE.FOUR_2S]: 11,
      [TYPE.FOUR_2P]: 12,
      [TYPE.BOMB]: 98,
      [TYPE.ROCKET]: 99,
    };
    return [typeOrder[ev.type] ?? 50, ev.n, (DDZ.RANK_INDEX?.[ev.keyRank] ?? 0)];
  }

  function cmpScore(a,b){
    const A = scoreKey(a.ev);
    const B = scoreKey(b.ev);
    for (let i=0;i<Math.max(A.length,B.length);i++){
      const av = A[i] ?? 0;
      const bv = B[i] ?? 0;
      if (av === bv) continue;
      return av - bv;
    }
    return 0;
  }

  function getLegalMoves(hand, lastPlay){
    const key = `${lastSig(lastPlay)}|${handSig(hand)}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const rankMap = groupCardsByRank(hand);
    const ranks = [...rankMap.keys()];

    const moves = [];

    // --- basic groups ---
    for (const r of ranks){
      addMove(moves, pickN(rankMap, r, 1));
      if ((rankMap.get(r)?.length || 0) >= 2) addMove(moves, pickN(rankMap, r, 2));
      if ((rankMap.get(r)?.length || 0) >= 3) addMove(moves, pickN(rankMap, r, 3));
      if ((rankMap.get(r)?.length || 0) >= 4) addMove(moves, pickN(rankMap, r, 4));
    }

    // rocket
    if (rankMap.has('BJ') && rankMap.has('RJ')) addMove(moves, [pickN(rankMap,'BJ',1)[0], pickN(rankMap,'RJ',1)[0]]);

    // trips with single / pair
    const tripRanks = ranks.filter(r => (rankMap.get(r)?.length || 0) >= 3);
    const pairRanks = ranks.filter(r => (rankMap.get(r)?.length || 0) >= 2);
    const singleRanks = ranks;

    for (const tr of tripRanks){
      const trip = pickN(rankMap, tr, 3);
      // with single
      for (const sr of singleRanks){
        if (sr === tr) continue;
        addMove(moves, trip.concat(pickN(rankMap, sr, 1)));
      }
      // with pair
      for (const pr of pairRanks){
        if (pr === tr) continue;
        addMove(moves, trip.concat(pickN(rankMap, pr, 2)));
      }
    }

    // four with two singles / two pairs
    const quadRanks = ranks.filter(r => (rankMap.get(r)?.length || 0) >= 4);
    for (const qr of quadRanks){
      const quad = pickN(rankMap, qr, 4);

      // two singles
      const othersForSingles = ranks.filter(r => r !== qr);
      for (const [a,b] of combinations(othersForSingles, 2)){
        addMove(moves, quad.concat(pickN(rankMap,a,1), pickN(rankMap,b,1)));
      }

      // two pairs
      const otherPairs = pairRanks.filter(r => r !== qr);
      for (const [a,b] of combinations(otherPairs, 2)){
        addMove(moves, quad.concat(pickN(rankMap,a,2), pickN(rankMap,b,2)));
      }
    }

    // straights (>=5)
    const straightable = ranks.filter(r => !['2','BJ','RJ'].includes(r));
    const ORDER = ['3','4','5','6','7','8','9','10','J','Q','K','A'];
    const have = new Set(straightable);

    for (let i=0;i<ORDER.length;i++){
      for (let j=i+4;j<ORDER.length;j++){
        const seq = ORDER.slice(i, j+1);
        if (!seq.every(r => have.has(r))) continue;
        const cards = seq.flatMap(r => pickN(rankMap, r, 1));
        addMove(moves, cards);
      }
    }

    // pair straights (>=3 pairs)
    const havePair = new Set(pairRanks.filter(r => !['2','BJ','RJ'].includes(r)));
    for (let i=0;i<ORDER.length;i++){
      for (let j=i+2;j<ORDER.length;j++){
        const seq = ORDER.slice(i, j+1);
        if (!seq.every(r => havePair.has(r))) continue;
        const cards = seq.flatMap(r => pickN(rankMap, r, 2));
        addMove(moves, cards);
      }
    }

    // plane + wings
    const haveTrips = new Set(tripRanks.filter(r => !['2','BJ','RJ'].includes(r)));
    const tripOrder = ORDER.slice();

    for (let i=0;i<tripOrder.length;i++){
      for (let j=i+1;j<tripOrder.length;j++){
        const seq = tripOrder.slice(i, j+1);
        if (seq.length < 2) continue;
        if (!seq.every(r => haveTrips.has(r))) continue;

        const core = seq.flatMap(r => pickN(rankMap, r, 3));
        addMove(moves, core); // plane without wings

        const wingSingleRanks = ranks.filter(r => !seq.includes(r));
        const wingPairRanks = pairRanks.filter(r => !seq.includes(r));

        for (const wingRanks of combinations(wingSingleRanks, seq.length)){
          const cards = core.concat(wingRanks.flatMap(r => pickN(rankMap, r, 1)));
          addMove(moves, cards);
        }

        for (const wingRanks of combinations(wingPairRanks, seq.length)){
          const cards = core.concat(wingRanks.flatMap(r => pickN(rankMap, r, 2)));
          addMove(moves, cards);
        }
      }
    }

    const uniq = uniqueMoves(moves);

    const filtered = uniq.filter(m => {
      if (!lastPlay) return true;
      return canBeat(m.ev, lastPlay.eval);
    });

    filtered.sort(cmpScore);

    cache.set(key, filtered);
    return filtered;
  }

  function clearMovesCache(){
    cache.clear();
  }

  DDZ.getLegalMoves = getLegalMoves;
  DDZ.clearMovesCache = clearMovesCache;
})();
