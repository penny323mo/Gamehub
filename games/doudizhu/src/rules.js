// 牌型判定 + 比較（v0.1）
// 目標：支援常見香港/主流鬥地主牌型 + 炸彈/火箭 + 四帶二。
(() => {
  const DDZ = window.DDZ = window.DDZ || {};
  const { RANK_INDEX, RANKS, sortCards, cardToText } = DDZ;

  const TYPE = {
    SINGLE: 'single',
    PAIR: 'pair',
    TRIPS: 'trips',
    TRIPS_1: 'trips_with_single',
    TRIPS_2: 'trips_with_pair',
    STRAIGHT: 'straight',
    PAIR_STRAIGHT: 'pair_straight',
    PLANE: 'plane',
    PLANE_W1: 'plane_with_singles',
    PLANE_W2: 'plane_with_pairs',
    FOUR_2S: 'four_with_two_singles',
    FOUR_2P: 'four_with_two_pairs',
    BOMB: 'bomb',
    ROCKET: 'rocket',
  };

  const STRAIGHT_BANNED = new Set(['2','BJ','RJ']);

  function rankCounts(cs){
    const m = new Map();
    for (const c of cs) m.set(c.rank, (m.get(c.rank) || 0) + 1);
    return m;
  }

  function groupsByCount(countMap){
    const by = new Map();
    for (const [r, n] of countMap.entries()){
      if (!by.has(n)) by.set(n, []);
      by.get(n).push(r);
    }
    for (const [n, arr] of by.entries()){
      arr.sort((a,b) => RANK_INDEX[a] - RANK_INDEX[b]);
    }
    return by;
  }

  function isConsecutiveRanks(ranks){
    if (!ranks.length) return false;
    const idx = ranks.map(r => RANK_INDEX[r]).sort((a,b)=>a-b);
    for (let i=1;i<idx.length;i++) if (idx[i] !== idx[i-1] + 1) return false;
    return true;
  }

  function rankByIndex(i){
    return RANKS?.[i] || Object.keys(RANK_INDEX).find(k => RANK_INDEX[k] === i);
  }

  function maxRank(ranks){
    return ranks.reduce((best, r) => (RANK_INDEX[r] > RANK_INDEX[best] ? r : best), ranks[0]);
  }

  function mk(type, cs, keyRank, extra = {}){
    return {
      type,
      n: cs.length,
      keyRank,
      text: extra.text || type,
      cardsSorted: cs,
      ...extra,
    };
  }

  function evalHand(cards){
    const n = cards.length;
    if (!n) return null;

    const cs = sortCards(cards);
    const cnt = rankCounts(cs);
    const by = groupsByCount(cnt);

    // Rocket: BJ + RJ
    if (n === 2 && cnt.size === 2 && cnt.get('BJ') === 1 && cnt.get('RJ') === 1){
      return mk(TYPE.ROCKET, cs, 'RJ', { text: '火箭 (大小王)' });
    }

    // Bomb: 4 of a kind
    if (n === 4 && cnt.size === 1){
      const r = cs[0].rank;
      return mk(TYPE.BOMB, cs, r, { text: `炸彈 ${r}` });
    }

    // Single
    if (n === 1){
      const r = cs[0].rank;
      return mk(TYPE.SINGLE, cs, r, { text: `單牌 ${cardToText(cs[0])}` });
    }

    // Pair
    if (n === 2 && cnt.size === 1){
      const r = cs[0].rank;
      return mk(TYPE.PAIR, cs, r, { text: `對子 ${r}` });
    }

    // Trips
    if (n === 3 && cnt.size === 1){
      const r = cs[0].rank;
      return mk(TYPE.TRIPS, cs, r, { text: `三張 ${r}` });
    }

    // Trips with single (3+1)
    if (n === 4 && cnt.size === 2 && by.get(3)?.length === 1 && by.get(1)?.length === 1){
      const trip = by.get(3)[0];
      return mk(TYPE.TRIPS_1, cs, trip, { text: `三帶一 ${trip}` });
    }

    // Trips with pair (3+2)
    if (n === 5 && cnt.size === 2 && by.get(3)?.length === 1 && by.get(2)?.length === 1){
      const trip = by.get(3)[0];
      return mk(TYPE.TRIPS_2, cs, trip, { text: `三帶二 ${trip}` });
    }

    // Straight: >=5, all singles, consecutive, no 2/BJ/RJ
    if (n >= 5 && cnt.size === n){
      const ranks = [...cnt.keys()];
      if (ranks.some(r => STRAIGHT_BANNED.has(r))) return null;
      if (isConsecutiveRanks(ranks)){
        const top = maxRank(ranks);
        return mk(TYPE.STRAIGHT, cs, top, { text: `順子 (${top}高)` , len: n});
      }
    }

    // Pair straight: >=6 and even, all pairs, consecutive by rank, no 2/BJ/RJ
    if (n >= 6 && n % 2 === 0 && cnt.size === n/2){
      const ranks = [...cnt.keys()];
      if (ranks.some(r => STRAIGHT_BANNED.has(r))) return null;
      if (ranks.every(r => cnt.get(r) === 2) && isConsecutiveRanks(ranks)){
        const top = maxRank(ranks);
        return mk(TYPE.PAIR_STRAIGHT, cs, top, { text: `連對 (${top}高)`, pairs: n/2 });
      }
    }

    // Plane (trips straight) / plane with wings
    // Identify trip ranks
    const tripRanks = by.get(3) ? [...by.get(3)] : [];
    if (tripRanks.length >= 2){
      // Try all possible consecutive sequences of trip ranks within this hand.
      const idxs = tripRanks.map(r => RANK_INDEX[r]).sort((a,b)=>a-b);
      // Build contiguous blocks
      const blocks = [];
      let cur = [idxs[0]];
      for (let i=1;i<idxs.length;i++){
        if (idxs[i] === idxs[i-1] + 1) cur.push(idxs[i]);
        else { blocks.push(cur); cur = [idxs[i]]; }
      }
      blocks.push(cur);

      // For each block and each length>=2, check if the whole hand matches plane patterns.
      for (const block of blocks){
        for (let len=2; len<=block.length; len++){
          for (let start=0; start+len<=block.length; start++){
            const seqIdx = block.slice(start, start+len);
            const seqRanks = seqIdx.map(i => rankByIndex(i));
            // filter out 2/BJ/RJ for plane sequence (standard)
            if (seqRanks.some(r => STRAIGHT_BANNED.has(r))) continue;

            const top = rankByIndex(seqIdx[seqIdx.length-1]);
            const coreCards = len * 3;

            if (n === coreCards){
              // pure plane
              // Ensure no other ranks beyond these trips
              if (cnt.size === len && seqRanks.every(r => cnt.get(r) === 3)){
                return mk(TYPE.PLANE, cs, top, { text: `飛機(${top}高)`, tripLen: len });
              }
            }

            // plane with single wings: n == core + len
            if (n === coreCards + len){
              // Wings must be singles (any ranks) but cannot reuse trip ranks.
              let ok = true;
              for (const r of seqRanks){ if (cnt.get(r) !== 3) ok = false; }
              if (!ok) continue;

              // Remaining ranks are singles
              const others = [...cnt.keys()].filter(r => !seqRanks.includes(r));
              if (others.length !== len) continue;
              if (!others.every(r => cnt.get(r) === 1)) continue;

              return mk(TYPE.PLANE_W1, cs, top, { text: `飛機帶單(${top}高)`, tripLen: len });
            }

            // plane with pair wings: n == core + len*2
            if (n === coreCards + len*2){
              let ok = true;
              for (const r of seqRanks){ if (cnt.get(r) !== 3) ok = false; }
              if (!ok) continue;

              const others = [...cnt.keys()].filter(r => !seqRanks.includes(r));
              if (others.length !== len) continue;
              if (!others.every(r => cnt.get(r) === 2)) continue;

              return mk(TYPE.PLANE_W2, cs, top, { text: `飛機帶對(${top}高)`, tripLen: len });
            }
          }
        }
      }
    }

    // Four with two singles (4 + 1 + 1)
    if (n === 6 && by.get(4)?.length === 1 && by.get(1)?.length === 2){
      const quad = by.get(4)[0];
      return mk(TYPE.FOUR_2S, cs, quad, { text: `四帶兩單 ${quad}` });
    }

    // Four with two pairs (4 + 2 + 2)
    if (n === 8 && by.get(4)?.length === 1 && by.get(2)?.length === 2){
      const quad = by.get(4)[0];
      return mk(TYPE.FOUR_2P, cs, quad, { text: `四帶兩對 ${quad}` });
    }

    return null;
  }

  function canBeat(a, b){
    if (!b) return true;
    if (!a) return false;

    // Rocket beats everything
    if (a.type === TYPE.ROCKET) return true;
    if (b.type === TYPE.ROCKET) return false;

    // Bomb beats everything except rocket; bombs compare by rank
    if (a.type === TYPE.BOMB && b.type !== TYPE.BOMB) return true;
    if (a.type !== TYPE.BOMB && b.type === TYPE.BOMB) return false;

    if (a.type !== b.type) return false;
    if (a.n !== b.n) return false;

    return RANK_INDEX[a.keyRank] > RANK_INDEX[b.keyRank];
  }

  DDZ.TYPE = TYPE;
  DDZ.evalHand = evalHand;
  DDZ.canBeat = canBeat;
})();
