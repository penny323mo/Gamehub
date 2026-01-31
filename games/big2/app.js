/* Big Two (鋤大D) — v0.3
   - Pure frontend, offline.
   - Rules implemented (simplified but playable):
     * 4 players, 13 cards each, 3♦ starts.
     * Valid hands: single/pair/trips, 5-card: straight/flush/full house/four/straight flush.
     * Must follow card count; for 5-card, any 5-card hand may be played if it beats table's 5-card hand.
     * First trick must include 3♦.
     * Passing: if 3 players pass after a play, trick clears and last player leads.
*/

(() => {
  // ---------- Card model ----------
  // rankIndex: 0..12 where 0=3, 1=4, ..., 8=J, 9=Q, 10=K, 11=A, 12=2
  const RANKS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  const SUITS = [
    { key: 'D', name: '♦', order: 0 }, // Diamonds lowest
    { key: 'C', name: '♣', order: 1 },
    { key: 'H', name: '♥', order: 2 },
    { key: 'S', name: '♠', order: 3 }, // Spades highest
  ];
  const SUIT_BY_KEY = Object.fromEntries(SUITS.map(s => [s.key, s]));

  function cardToText(c) {
    return `${RANKS[c.r]}${SUIT_BY_KEY[c.s].name}`;
  }

  function cardAssetFile(c) {
    // assets/cards/<rank><suit>.svg where rank is A,2,3..10,J,Q,K and suit is D/C/H/S
    // Our internal rank order is Big Two (3..2), but the filename uses the face label.
    const rank = RANKS[c.r];
    return `./assets/cards/${rank}${c.s}.svg`;
  }
  function cardId(c) {
    return `${c.r}${c.s}`;
  }

  function compareCard(a, b) {
    // Big Two: compare by rank (3 low, 2 high) then suit.
    if (a.r !== b.r) return a.r - b.r;
    return SUIT_BY_KEY[a.s].order - SUIT_BY_KEY[b.s].order;
  }

  function sortCards(cards) {
    return [...cards].sort(compareCard);
  }

  // ---------- Hand evaluation ----------
  // Returns null if invalid.
  // Otherwise returns an object used for comparison:
  // { n, type, cat, key, cardsSorted, text }
  // cat: numeric strength category; higher beats lower (for n==5).
  // key: array of numbers for tie-break lexicographic comparison.

  const CAT = {
    SINGLE: 1,
    PAIR: 2,
    TRIPS: 3,
    STRAIGHT: 4,
    FLUSH: 5,
    FULL_HOUSE: 6,
    FOUR: 7,
    STRAIGHT_FLUSH: 8,
  };

  function lexCompare(aKey, bKey) {
    const n = Math.max(aKey.length, bKey.length);
    for (let i = 0; i < n; i++) {
      const av = aKey[i] ?? 0;
      const bv = bKey[i] ?? 0;
      if (av !== bv) return av - bv;
    }
    return 0;
  }

  function highSuitOrder(cards) {
    return Math.max(...cards.map(c => SUIT_BY_KEY[c.s].order));
  }

  function evalHand(cards) {
    const n = cards.length;
    if (![1, 2, 3, 5].includes(n)) return null;
    const cs = sortCards(cards);

    if (n === 1) {
      const c = cs[0];
      return {
        n,
        type: 'single',
        cat: CAT.SINGLE,
        key: [c.r, SUIT_BY_KEY[c.s].order],
        cardsSorted: cs,
        text: `${cardToText(c)}`,
      };
    }

    if (n === 2) {
      if (cs[0].r !== cs[1].r) return null;
      const r = cs[0].r;
      return {
        n,
        type: 'pair',
        cat: CAT.PAIR,
        key: [r, highSuitOrder(cs)],
        cardsSorted: cs,
        text: `Pair of ${RANKS[r]}s`,
      };
    }

    if (n === 3) {
      if (!(cs[0].r === cs[1].r && cs[1].r === cs[2].r)) return null;
      const r = cs[0].r;
      return {
        n,
        type: 'trips',
        cat: CAT.TRIPS,
        key: [r, highSuitOrder(cs)],
        cardsSorted: cs,
        text: `Trips of ${RANKS[r]}s`,
      };
    }

    // n === 5
    const ranks = cs.map(c => c.r);
    const suits = cs.map(c => c.s);

    // count ranks
    const countMap = new Map();
    for (const r of ranks) countMap.set(r, (countMap.get(r) || 0) + 1);
    const counts = [...countMap.entries()].sort((a, b) => {
      // sort by count desc then rank desc
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0] - a[0];
    });

    const isFlush = suits.every(s => s === suits[0]);

    // v0.3 straight rules (FINAL spec):
    // - A2345 is valid and is the MAX straight.
    // - Valid normal straights: 23456, 34567, ..., 10JQKA.
    // - Invalid: any straight that wraps and uses 2 as the top card (e.g., JQKA2, 10JQKA2).
    // Comparison (straight / straight flush):
    // - A2345 always beats everything.
    // - Otherwise compare by the maximum rank contained (Big Two order 3..2).
    // - Tie-break by suit of that max-rank card (♦<♣<♥<♠).
    function straightEval(cs5) {
      const rs = cs5.map(c => c.r);
      const uniq = [...new Set(rs)];
      if (uniq.length !== 5) return null;

      // Allowed sequences in terms of rankIndex (0..12 where 11=A, 12=2)
      const allowed = [
        [11, 12, 0, 1, 2],      // A 2 3 4 5 (special: MAX straight)
        [12, 0, 1, 2, 3],       // 2 3 4 5 6
        [0, 1, 2, 3, 4],        // 3 4 5 6 7
        [1, 2, 3, 4, 5],        // 4 5 6 7 8
        [2, 3, 4, 5, 6],        // 5 6 7 8 9
        [3, 4, 5, 6, 7],        // 6 7 8 9 10
        [4, 5, 6, 7, 8],        // 7 8 9 10 J
        [5, 6, 7, 8, 9],        // 8 9 10 J Q
        [6, 7, 8, 9, 10],       // 9 10 J Q K
        [7, 8, 9, 10, 11],      // 10 J Q K A
      ];

      const setEq = (a, b) => {
        if (a.length !== b.length) return false;
        const as = [...a].sort((x, y) => x - y);
        const bs = [...b].sort((x, y) => x - y);
        for (let i = 0; i < as.length; i++) if (as[i] !== bs[i]) return false;
        return true;
      };

      let seq = null;
      for (const s of allowed) {
        if (setEq(uniq, s)) { seq = s; break; }
      }
      if (!seq) return null;

      const isWheel = (seq[0] === 11 && seq[1] === 12);

      // Max rank contained by Big Two ordering (rankIndex itself already is Big Two order).
      // For A2345, we still tie-break using the max-rank card (2), but it always beats any non-wheel.
      const maxRank = Math.max(...uniq);
      // Tie-break uses the suit of the max-rank card (♦<♣<♥<♠).
      // (For a valid straight there is only one card of maxRank, but we keep this robust.)
      const maxCard = cs5
        .filter(c => c.r === maxRank)
        .sort((a, b) => SUIT_BY_KEY[b.s].order - SUIT_BY_KEY[a.s].order)[0];
      const maxSuit = SUIT_BY_KEY[maxCard.s].order;

      // key: [wheelFlag, maxRank, maxSuit]
      // where wheelFlag makes A2345 always beat everything else.
      const key = [isWheel ? 1 : 0, maxRank, maxSuit];

      return { key, topCard: maxCard };
    }

    const straight = straightEval(cs);
    const isStraight = !!straight;

    if (isStraight && isFlush) {
      return {
        n,
        type: 'straight_flush',
        cat: CAT.STRAIGHT_FLUSH,
        key: straight.key,
        cardsSorted: cs,
        text: `Straight Flush (${cardToText(straight.topCard)} high)`,
      };
    }

    // four of a kind: counts like [rank,4] + kicker
    if (counts[0][1] === 4) {
      const quadR = counts[0][0];
      const kickerR = counts[1][0];
      return {
        n,
        type: 'four',
        cat: CAT.FOUR,
        key: [quadR, kickerR],
        cardsSorted: cs,
        text: `Four of a Kind (${RANKS[quadR]})`,
      };
    }

    // full house: 3+2
    if (counts[0][1] === 3 && counts[1][1] === 2) {
      const tripR = counts[0][0];
      const pairR = counts[1][0];
      return {
        n,
        type: 'full_house',
        cat: CAT.FULL_HOUSE,
        key: [tripR, pairR],
        cardsSorted: cs,
        text: `Full House (${RANKS[tripR]} over ${RANKS[pairR]})`,
      };
    }

    if (isFlush) {
      // Flush tie-break: compare sorted ranks high-to-low then suit.
      // Key: ranks desc then suit order
      const desc = [...cs].sort((a, b) => compareCard(b, a));
      const key = desc.map(c => c.r).concat([SUIT_BY_KEY[desc[0].s].order]);
      return {
        n,
        type: 'flush',
        cat: CAT.FLUSH,
        key,
        cardsSorted: cs,
        text: `Flush (${SUIT_BY_KEY[cs[0].s].name})`,
      };
    }

    if (isStraight) {
      return {
        n,
        type: 'straight',
        cat: CAT.STRAIGHT,
        key: straight.key,
        cardsSorted: cs,
        text: `Straight (${cardToText(straight.topCard)} high)`,
      };
    }

    return null;
  }

  function canBeat(evalA, evalB) {
    // true if A > B
    if (!evalB) return true;
    if (evalA.n !== evalB.n) return false;

    if (evalA.n === 5) {
      if (evalA.cat !== evalB.cat) return evalA.cat > evalB.cat;
      return lexCompare(evalA.key, evalB.key) > 0;
    }

    // 1/2/3: must be same type already by evalHand (n implies type)
    return lexCompare(evalA.key, evalB.key) > 0;
  }

  // ---------- Game state ----------
  const state = {
    players: [], // {name, isHuman, hand: Card[]}
    currentPlayer: 0,
    table: null, // {cards: Card[], eval: EvalHand, by: playerIndex}
    lastPlayPlayer: null,
    passed: [false, false, false, false],
    seat: [
      { cards: null, pass: false },
      { cards: null, pass: false },
      { cards: null, pass: false },
      { cards: null, pass: false },
    ],
    mustInclude3D: true,
    gameOver: false,
  };

  function makeDeck() {
    const deck = [];
    for (let r = 0; r < 13; r++) {
      for (const s of SUITS) {
        deck.push({ r, s: s.key });
      }
    }
    return deck;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function find3D(player) {
    return player.hand.findIndex(c => c.r === 0 && c.s === 'D');
  }

  function dealNewGame() {
    // New game => invalidate cached move generation.
    legalPlaysCache.clear();
    const deck = shuffle(makeDeck());
    state.players = [
      { name: 'You', isHuman: true, hand: [] },
      { name: 'CPU 1', isHuman: false, hand: [] },
      { name: 'CPU 2', isHuman: false, hand: [] },
      { name: 'CPU 3', isHuman: false, hand: [] },
    ];
    for (let i = 0; i < 52; i++) {
      state.players[i % 4].hand.push(deck[i]);
    }
    for (const p of state.players) p.hand = sortCards(p.hand);

    // starting player = holder of 3♦
    let starter = 0;
    for (let i = 0; i < 4; i++) {
      if (find3D(state.players[i]) !== -1) { starter = i; break; }
    }
    state.currentPlayer = starter;
    state.table = null;
    state.lastPlayPlayer = null;
    state.passed = [false, false, false, false];
    state.seat = [
      { cards: null, pass: false },
      { cards: null, pass: false },
      { cards: null, pass: false },
      { cards: null, pass: false },
    ];
    state.mustInclude3D = true;
    state.gameOver = false;
  }

  // ---------- Move generation (AI + validation helpers) ----------
  function combosOfSize(hand, k) {
    const res = [];
    const n = hand.length;
    const idx = Array.from({ length: k }, (_, i) => i);

    function pushCombo() {
      res.push(idx.map(i => hand[i]));
    }

    function next() {
      let i = k - 1;
      while (i >= 0 && idx[i] === n - k + i) i--;
      if (i < 0) return false;
      idx[i]++;
      for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
      return true;
    }

    pushCombo();
    while (next()) pushCombo();
    return res;
  }

  function getLegalPlays(playerIndex) {
    const player = state.players[playerIndex];
    const hand = player.hand;

    // Cache key: current player+table+hand+rule flags
    const tableSig = state.table ? state.table.cards.map(cardId).join(',') : 'LEAD';
    const handSig = hand.map(cardId).join(',');
    const requiredN = state.table ? state.table.cards.length : null;
    const cacheKey = `${playerIndex}|${requiredN ?? 'any'}|${state.mustInclude3D ? 1 : 0}|${tableSig}|${handSig}`;

    const cached = legalPlaysCache.get(cacheKey);
    if (cached) return cached;

    const plays = [];
    const consider = (cards) => {
      const ev = evalHand(cards);
      if (!ev) return;

      // first trick must include 3♦ for starting hand, until first valid play is made.
      if (state.mustInclude3D) {
        const has3D = cards.some(c => c.r === 0 && c.s === 'D');
        if (!has3D) return;
      }

      if (requiredN !== null && cards.length !== requiredN) return;
      if (state.table) {
        if (!canBeat(ev, state.table.eval)) return;
      }
      plays.push({ cards, ev });
    };

    if (requiredN === null) {
      // lead: any valid n in {1,2,3,5}
      for (const c of hand) consider([c]);
      // pairs
      for (let i = 0; i < hand.length; i++) {
        for (let j = i + 1; j < hand.length; j++) {
          if (hand[i].r === hand[j].r) consider([hand[i], hand[j]]);
        }
      }
      // trips
      for (let i = 0; i < hand.length; i++) {
        for (let j = i + 1; j < hand.length; j++) {
          for (let k = j + 1; k < hand.length; k++) {
            if (hand[i].r === hand[j].r && hand[j].r === hand[k].r) consider([hand[i], hand[j], hand[k]]);
          }
        }
      }
      // 5 cards
      if (hand.length >= 5) {
        for (const combo of combosOfSize(hand, 5)) consider(combo);
      }
    } else {
      if (requiredN === 1) {
        for (const c of hand) consider([c]);
      } else if (requiredN === 2) {
        for (let i = 0; i < hand.length; i++) {
          for (let j = i + 1; j < hand.length; j++) {
            if (hand[i].r === hand[j].r) consider([hand[i], hand[j]]);
          }
        }
      } else if (requiredN === 3) {
        for (let i = 0; i < hand.length; i++) {
          for (let j = i + 1; j < hand.length; j++) {
            for (let k = j + 1; k < hand.length; k++) {
              if (hand[i].r === hand[j].r && hand[j].r === hand[k].r) consider([hand[i], hand[j], hand[k]]);
            }
          }
        }
      } else if (requiredN === 5) {
        if (hand.length >= 5) {
          for (const combo of combosOfSize(hand, 5)) consider(combo);
        }
      }
    }

    // sort plays by weakness (lowest first) for simple AI selection
    plays.sort((a, b) => {
      if (a.ev.n !== b.ev.n) return a.ev.n - b.ev.n;
      if (a.ev.n === 5) {
        if (a.ev.cat !== b.ev.cat) return a.ev.cat - b.ev.cat;
      }
      return lexCompare(a.ev.key, b.ev.key);
    });

    legalPlaysCache.set(cacheKey, plays);
    return plays;
  }

  function removeCardsFromHand(hand, cards) {
    const removeIds = new Set(cards.map(cardId));
    return hand.filter(c => !removeIds.has(cardId(c)));
  }

  function clearTrickToLeader() {
    state.table = null;
    state.passed = [false, false, false, false];
    state.seat = [
      { cards: null, pass: false },
      { cards: null, pass: false },
      { cards: null, pass: false },
      { cards: null, pass: false },
    ];
    state.currentPlayer = state.lastPlayPlayer;
  }

  function advanceTurn() {
    state.currentPlayer = (state.currentPlayer + 1) % 4;
  }

  function checkWin() {
    for (let i = 0; i < 4; i++) {
      if (state.players[i].hand.length === 0) {
        state.gameOver = true;
        return i;
      }
    }
    return null;
  }

  // ---------- UI ----------
  const legalPlaysCache = new Map(); // key -> plays[]

  const els = {
    status: document.getElementById('status'),
    tableInfo: document.getElementById('tableInfo'),
    hand: document.getElementById('hand'),
    playBtn: document.getElementById('playBtn'),
    suggestBtn: document.getElementById('suggestBtn'),
    cancelSuggestBtn: document.getElementById('cancelSuggestBtn'),
    passBtn: document.getElementById('passBtn'),
    restartBtn: document.getElementById('restartBtn'),
    hint: document.getElementById('hint'),
    seats: [
      {
        wrap: document.getElementById('seat0'),
        name: document.getElementById('p0Name'),
        meta: document.getElementById('p0Meta'),
        body: document.getElementById('p0Body'),
      },
      {
        wrap: document.getElementById('seat1'),
        name: document.getElementById('p1Name'),
        meta: document.getElementById('p1Meta'),
        body: document.getElementById('p1Body'),
      },
      {
        wrap: document.getElementById('seat2'),
        name: document.getElementById('p2Name'),
        meta: document.getElementById('p2Meta'),
        body: document.getElementById('p2Body'),
      },
      {
        wrap: document.getElementById('seat3'),
        name: document.getElementById('p3Name'),
        meta: document.getElementById('p3Meta'),
        body: document.getElementById('p3Body'),
      },
    ],
  };

  const ui = {
    selected: new Set(), // card ids
    suggestActive: false,
    suggestList: [],
    suggestIndex: 0,
    suggestContext: '',
  };

  function setHint(text, isError = false) {
    els.hint.textContent = text || '';
    els.hint.style.color = isError ? 'var(--danger)' : 'var(--muted)';
  }

  // Event delegation: avoid re-binding card click handlers every render.
  els.hand.addEventListener('click', (e) => {
    const btn = e.target.closest('button.cardBtn');
    if (!btn) return;
    if (state.gameOver) return;
    if (state.currentPlayer !== 0) return;

    // Manual selection cancels cycling suggestions
    clearSuggest();

    const id = btn.dataset.id;
    if (ui.selected.has(id)) ui.selected.delete(id);
    else ui.selected.add(id);

    render();
  });

  function render() {
    // seats (fixed positions)
    for (let i = 0; i < 4; i++) {
      const p = state.players[i];
      const seatEl = els.seats[i];
      seatEl.name.textContent = p.name;

      // Meta area: CPU shows a stacked card-back + count badge; You shows plain text.
      seatEl.meta.innerHTML = '';
      if (i === 0) {
        seatEl.meta.textContent = `${p.hand.length} cards`;
      } else {
        const stack = document.createElement('div');
        stack.className = 'deckStack';
        for (let k = 1; k <= 3; k++) {
          const back = document.createElement('img');
          back.className = `cardBack cardBack--${k}`;
          back.src = './assets/card-back.svg';
          back.alt = '';
          back.setAttribute('aria-hidden', 'true');
          stack.appendChild(back);
        }
        const pill = document.createElement('div');
        pill.className = 'countPill';
        pill.textContent = String(p.hand.length);
        stack.appendChild(pill);
        seatEl.meta.appendChild(stack);
      }

      seatEl.wrap.classList.toggle('seat--turn', i === state.currentPlayer);

      // PASS display mode B: show PASS only; do not keep showing old cards.
      seatEl.body.innerHTML = '';
      const seatState = state.seat[i];

      if (seatState.pass) {
        const pass = document.createElement('div');
        pass.className = 'seat__pass';
        pass.textContent = 'PASS';
        seatEl.body.appendChild(pass);
      } else if (seatState.cards && seatState.cards.length) {
        for (const c of seatState.cards) {
          const img = document.createElement('img');
          img.className = 'cardImg cardImg--table';
          img.src = cardAssetFile(c);
          img.alt = cardToText(c);
          img.loading = 'lazy';
          seatEl.body.appendChild(img);
        }
      }
    }

    // center info (table state)
    if (!state.table) {
      els.tableInfo.textContent = 'Table empty — lead any valid hand.';
    } else {
      els.tableInfo.textContent = `To beat: ${state.table.eval.text} (${state.players[state.table.by].name})`;
    }

    // status
    if (state.gameOver) {
      const winner = state.players.findIndex(p => p.hand.length === 0);
      els.status.textContent = `Game Over — ${state.players[winner].name} wins.`;
    } else {
      const p = state.players[state.currentPlayer];
      let extra = '';
      if (state.mustInclude3D) extra = ' (first play must include 3♦)';
      els.status.textContent = `Turn: ${p.name}${extra}`;
    }

    // hand (human)
    const human = state.players[0];
    els.hand.innerHTML = '';
    for (const c of human.hand) {
      const btn = document.createElement('button');
      btn.className = 'cardBtn' + (ui.selected.has(cardId(c)) ? ' cardBtn--selected' : '');
      btn.type = 'button';
      btn.dataset.id = cardId(c);

      const img = document.createElement('img');
      img.className = 'cardImg cardImg--hand';
      img.src = cardAssetFile(c);
      img.alt = cardToText(c);
      img.loading = 'lazy';
      btn.appendChild(img);

      els.hand.appendChild(btn);
    }

    // buttons enable/disable
    const isHumanTurn = state.currentPlayer === 0 && !state.gameOver;
    els.playBtn.disabled = !isHumanTurn;

    // Pass is only valid when following an existing table.
    els.passBtn.disabled = !isHumanTurn || !state.table;

    if (!isHumanTurn) {
      setHint('');
    } else {
      const sel = getSelectedCards();
      if (sel.length === 0) {
        setHint(state.table ? 'Select cards to beat the table, or Pass.' : 'Select cards to lead.');
      } else {
        const ev = evalHand(sel);
        if (!ev) {
          setHint('Selected cards do not form a valid hand (1/2/3/5 only).', true);
        } else {
          if (state.mustInclude3D) {
            const has3D = sel.some(c => c.r === 0 && c.s === 'D');
            if (!has3D) setHint('First play must include 3♦.', true);
            else setHint(`Selected: ${ev.text}`);
          } else if (state.table) {
            if (sel.length !== state.table.cards.length) setHint(`Must play ${state.table.cards.length} cards.`, true);
            else if (!canBeat(ev, state.table.eval)) setHint('Does not beat the table.', true);
            else setHint(`Will play: ${ev.text}`);
          } else {
            setHint(`Will lead: ${ev.text}`);
          }
        }
      }
    }
  }

  function getSelectedCards() {
    const human = state.players[0];
    const ids = ui.selected;
    return human.hand.filter(c => ids.has(cardId(c)));
  }

  // ---------- Turn execution ----------
  function applyPlay(playerIndex, cards) {
    const player = state.players[playerIndex];
    const ev = evalHand(cards);
    if (!ev) throw new Error('applyPlay got invalid hand');

    const sorted = sortCards(cards);
    player.hand = removeCardsFromHand(player.hand, cards);
    state.table = { cards: sorted, eval: ev, by: playerIndex };
    state.lastPlayPlayer = playerIndex;

    // New play resets pass flags for the trick.
    state.passed = [false, false, false, false];
    for (let i = 0; i < 4; i++) state.seat[i].pass = false;

    // Seat state: store last played cards for this trick.
    state.seat[playerIndex].cards = sorted;
    state.seat[playerIndex].pass = false;

    // first play satisfied
    state.mustInclude3D = false;

    const winner = checkWin();
    if (winner !== null) return;

    advanceTurn();
  }

  function applyPass(playerIndex) {
    state.passed[playerIndex] = true;

    // PASS display mode B: clear that seat's cards and show PASS.
    state.seat[playerIndex].cards = null;
    state.seat[playerIndex].pass = true;

    // if everyone except lastPlayPlayer passed, clear trick
    const active = state.lastPlayPlayer;
    let passCount = 0;
    for (let i = 0; i < 4; i++) {
      if (i === active) continue;
      if (state.passed[i]) passCount++;
    }
    if (passCount >= 3) {
      clearTrickToLeader();
    } else {
      advanceTurn();
    }
  }

  function tryHumanPlay() {
    if (state.gameOver) return;
    if (state.currentPlayer !== 0) return;

    const cards = getSelectedCards();
    if (cards.length === 0) {
      setHint('Select cards to play.', true);
      return;
    }
    const ev = evalHand(cards);
    if (!ev) {
      setHint('Invalid hand selection.', true);
      return;
    }

    if (state.mustInclude3D) {
      const has3D = cards.some(c => c.r === 0 && c.s === 'D');
      if (!has3D) {
        setHint('First play must include 3♦.', true);
        return;
      }
    }

    if (state.table) {
      if (cards.length !== state.table.cards.length) {
        setHint(`Must play ${state.table.cards.length} cards.`, true);
        return;
      }
      if (!canBeat(ev, state.table.eval)) {
        setHint('Your play does not beat the table.', true);
        return;
      }
    }

    ui.selected.clear();
    clearSuggest();
    applyPlay(0, cards);
    render();
    queueCpuTurns();
  }

  function tryHumanPass() {
    if (state.gameOver) return;
    if (state.currentPlayer !== 0) return;
    if (!state.table) {
      setHint('You cannot pass when you are leading.', true);
      return;
    }
    ui.selected.clear();
    clearSuggest();
    applyPass(0);
    render();
    queueCpuTurns();
  }

  function rankCounts(hand) {
    const m = new Map();
    for (const c of hand) m.set(c.r, (m.get(c.r) || 0) + 1);
    return m;
  }

  function breakCostForMove(hand, moveCards) {
    // Penalize moves that split pairs/trips/quads unnecessarily.
    const handCounts = rankCounts(hand);
    const usedCounts = rankCounts(moveCards);

    let cost = 0;
    for (const [r, used] of usedCounts.entries()) {
      const total = handCounts.get(r) || 0;
      if (used === 1 && total >= 2) cost += 10;      // breaking pair/trips/quad for a single
      if (used === 2 && total === 3) cost += 8;       // breaking trips for a pair
      if (used === 3 && total === 4) cost += 12;      // breaking quad for trips (rare)
    }
    return cost;
  }

  function containsRank(cards, r) {
    return cards.some(c => c.r === r);
  }

  function scoreMove(hand, move, isLead) {
    // Lower score is better.
    const ev = move.ev;
    const breakCost = breakCostForMove(hand, move.cards);

    // Avoid spending 2s early when leading.
    const usesTwoPenalty = (isLead && containsRank(move.cards, 12)) ? 40 : 0;

    // Prefer true singles for single plays.
    const handCounts = rankCounts(hand);
    let reservedPenalty = 0;
    if (ev.n === 1) {
      const r = move.cards[0].r;
      if ((handCounts.get(r) || 0) >= 2) reservedPenalty += 15;
    }

    // Lead preference: 5-card > trips > pairs > singles.
    let leadPref = 0;
    if (isLead) {
      if (ev.n === 5) leadPref = 0;
      else if (ev.n === 3) leadPref = 1;
      else if (ev.n === 2) leadPref = 2;
      else leadPref = 3;
    }

    // Base strength (lower is weaker).
    const base = (ev.n === 5)
      ? [ev.cat, ...ev.key]
      : [...ev.key];

    return [leadPref, breakCost + reservedPenalty + usesTwoPenalty, ev.n, ...base];
  }

  function cmpScore(a, b) {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      const av = a[i] ?? 0;
      const bv = b[i] ?? 0;
      if (av !== bv) return av - bv;
    }
    return 0;
  }

  function cpuChoosePlay(playerIndex) {
    const player = state.players[playerIndex];
    const legal = getLegalPlays(playerIndex);
    if (legal.length === 0) return null;

    const isLead = !state.table;

    let candidates = legal;

    // Follow strategy for 5-card hands: try to match category (hand type) first.
    if (!isLead && state.table && state.table.cards.length === 5) {
      const targetCat = state.table.eval.cat;
      const sameCat = legal.filter(m => m.ev.n === 5 && m.ev.cat === targetCat);
      if (sameCat.length) candidates = sameCat;
    }

    // Follow strategy: prefer moves that don't break stronger groups.
    if (!isLead) {
      const noBreak = candidates.filter(m => breakCostForMove(player.hand, m.cards) === 0);
      if (noBreak.length) candidates = noBreak;
      else return null; // otherwise pass
    }

    // Choose best by score (lowest) among candidates.
    let best = candidates[0];
    let bestScore = scoreMove(player.hand, best, isLead);
    for (let i = 1; i < candidates.length; i++) {
      const sc = scoreMove(player.hand, candidates[i], isLead);
      if (cmpScore(sc, bestScore) < 0) {
        best = candidates[i];
        bestScore = sc;
      }
    }

    return best;
  }

  function clearSuggest() {
    ui.suggestActive = false;
    ui.suggestList = [];
    ui.suggestIndex = 0;
    ui.suggestContext = '';
  }

  function makeSuggestContext() {
    const human = state.players[0];
    const handSig = human.hand.map(cardId).join(',');
    const tableSig = state.table ? state.table.cards.map(cardId).join(',') : 'LEAD';
    return `${state.currentPlayer}|${tableSig}|${handSig}`;
  }

  function uniqueMoves(moves) {
    const seen = new Set();
    const out = [];
    for (const m of moves) {
      const key = m.cards.map(cardId).sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(m);
    }
    return out;
  }

  function buildSuggestionList() {
    const human = state.players[0];
    const legal = getLegalPlays(0);
    if (!legal.length) return [];

    const isLead = !state.table;
    let candidates = legal;

    if (!isLead && state.table && state.table.cards.length === 5) {
      const targetCat = state.table.eval.cat;
      const sameCat = legal.filter(m => m.ev.n === 5 && m.ev.cat === targetCat);
      if (sameCat.length) candidates = sameCat;
    }

    candidates = uniqueMoves(candidates);

    // Sort by score (lowest first)
    candidates.sort((a, b) => cmpScore(
      scoreMove(human.hand, a, isLead),
      scoreMove(human.hand, b, isLead)
    ));

    // Cap list to avoid cycling forever
    return candidates.slice(0, 8);
  }

  function applySuggestionAt(idx) {
    const m = ui.suggestList[idx];
    if (!m) return;
    ui.selected = new Set(m.cards.map(cardId));
    ui.suggestActive = true;

    // Hint with position
    const total = ui.suggestList.length;
    setHint(`Suggest ${idx + 1}/${total}: ${m.ev.text}`);
  }

  function suggestHumanSelection() {
    if (state.gameOver) return;
    if (state.currentPlayer !== 0) return;

    const ctx = makeSuggestContext();
    if (ctx !== ui.suggestContext || !ui.suggestList.length) {
      clearSuggest();
      ui.suggestContext = ctx;
      ui.suggestList = buildSuggestionList();
      ui.suggestIndex = 0;

      if (!ui.suggestList.length) {
        setHint(state.table ? 'No winning move — consider Pass.' : 'No valid plays found.', true);
        render();
        return;
      }
    } else {
      // cycle to next
      ui.suggestIndex = (ui.suggestIndex + 1) % ui.suggestList.length;
    }

    applySuggestionAt(ui.suggestIndex);
    render();
  }

  function queueCpuTurns() {
    // Execute CPU turns with small delays for readability.
    const step = () => {
      if (state.gameOver) { render(); return; }
      if (state.currentPlayer === 0) { render(); return; }

      const idx = state.currentPlayer;
      const move = cpuChoosePlay(idx);

      // If following and no moves exist, pass; if leading and no moves exist (shouldn't happen), pass.
      if (!move) {
        if (state.table) {
          applyPass(idx);
        } else {
          // fallback (should not happen): play lowest single
          const c = state.players[idx].hand[0];
          applyPlay(idx, [c]);
        }
      } else {
        applyPlay(idx, move.cards);
      }

      render();
      // Continue with next CPU / back to human
      setTimeout(step, 450);
    };

    setTimeout(step, 450);
  }

  // ---------- Wire up ----------
  els.playBtn.addEventListener('click', tryHumanPlay);
  els.suggestBtn.addEventListener('click', suggestHumanSelection);
  els.cancelSuggestBtn.addEventListener('click', () => {
    if (state.currentPlayer !== 0) return;
    ui.selected.clear();
    clearSuggest();
    render();
  });
  els.passBtn.addEventListener('click', tryHumanPass);
  els.restartBtn.addEventListener('click', restartGame);

  // Additional restart button (bottom controls)
  const restartBtn2 = document.getElementById('restartBtn2');
  if (restartBtn2) restartBtn2.addEventListener('click', restartGame);

  // Start game button (bottom controls)
  const startGameBtn = document.getElementById('startGameBtn');
  if (startGameBtn) startGameBtn.addEventListener('click', startGame);

  // Start screen button
  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.addEventListener('click', startGame);

  function restartGame() {
    ui.selected.clear();
    clearSuggest();
    dealNewGame();
    render();
    if (state.currentPlayer !== 0) queueCpuTurns();
  }

  function startGame() {
    const startScreen = document.getElementById('startScreen');
    if (startScreen) startScreen.classList.add('startScreen--hidden');

    // Hide start button, show restart button
    if (startGameBtn) startGameBtn.style.display = 'none';
    if (restartBtn2) restartBtn2.style.display = '';

    ui.selected.clear();
    clearSuggest();
    dealNewGame();
    render();

    // CRITICAL: trigger CPU turns if it's not human's turn
    console.log('Game started, currentPlayer:', state.currentPlayer);
    if (state.currentPlayer !== 0) {
      console.log('Triggering CPU turns...');
      queueCpuTurns();
    }
  }

  // ---------- Boot ----------
  // DON'T start game automatically - wait for user to click start
  // Just show the start screen
  els.status.textContent = '按「開始遊戲」開始';

  // Initially hide restart button, show start button
  if (startGameBtn) startGameBtn.style.display = '';
  if (restartBtn2) restartBtn2.style.display = 'none';
})();
