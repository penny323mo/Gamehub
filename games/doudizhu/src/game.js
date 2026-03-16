// Game state + actions (no-module build)
(() => {
  const DDZ = window.DDZ = window.DDZ || {};
  
  function getMyIndex() {
    return window.gameMode === 'online' ? window.onlinePlayerIndex : 0;
  }
  
  function isMyTurn(state) {
    return state.current === getMyIndex();
  }

  const { makeDeck, shuffle, sortCards, cardId, cardToText } = DDZ;
  const { evalHand, canBeat } = DDZ;
  const { clearMovesCache } = DDZ;
  const { cpuChooseMove } = DDZ;

  function makeGame(){
    const state = {
      phase: 'idle', // 'bid' | 'play' | 'over'
      players: [
        { name: 'You', isHuman: true, role: null, hand: [] },
        { name: 'CPU 1', isHuman: false, role: null, hand: [] },
        { name: 'CPU 2', isHuman: false, role: null, hand: [] },
      ],
      bottom: [],
      current: 0,
      landlord: null,
      lastPlay: null, // { by, cards, eval }
      passes: [false,false,false],

      // bidding
      bid: {
        start: 0, // you first (per your choice)
        cursor: 0,
        calledBy: null,
        robCount: 0,
        passed: [false,false,false],
      },

      ui: {
        selected: new Set(),
        hintList: [],
        hintIndex: 0,
        hintContext: '',
      },

      log: [],
    };

    function resetForNewRound(){
      clearMovesCache();
      state.lastPlay = null;
      state.passes = [false,false,false];
      state.ui.selected.clear();
      state.ui.hintList = [];
      state.ui.hintIndex = 0;
      state.ui.hintContext = '';
    }

    function pushLog(text){
      if (!text) return;
      state.log.push(text);
      if (state.log.length > 6) state.log.shift();
    }

    function cardsText(cards){
      return cards.map(cardToText).join(' ');
    }

    function deal(){
      resetForNewRound();

      const deck = shuffle(makeDeck());
      state.players.forEach(p => { p.hand = []; p.role = null; });

      // 51 cards to players, 3 bottom
      for (let i=0;i<51;i++) state.players[i%3].hand.push(deck[i]);
      state.bottom = deck.slice(51);
      for (const p of state.players) p.hand = sortCards(p.hand);

      // bidding init
      state.phase = 'bid';
      state.bid.start = 0; // you first
      state.bid.cursor = state.bid.start;
      state.bid.calledBy = null;
      state.bid.robCount = 0;
      state.bid.passed = [false,false,false];

      state.current = state.bid.cursor;
      state.log = [];
      pushLog('發牌完成，開始叫地主。');
    }

    function allBidPassed(){
      return state.bid.passed.every(Boolean);
    }

    function applyLandlord(landlordIdx){
      state.landlord = landlordIdx;
      state.players[landlordIdx].role = 'landlord';
      for (let i=0;i<3;i++) if (i !== landlordIdx) state.players[i].role = 'farmer';

      // landlord takes bottom cards (becomes 20)
      state.players[landlordIdx].hand = sortCards(state.players[landlordIdx].hand.concat(state.bottom));

      state.phase = 'play';
      state.current = landlordIdx;
      state.lastPlay = null;
      state.passes = [false,false,false];
      pushLog(`地主：${state.players[landlordIdx].name}（收底牌）`);
    }

    function bidCall(){
      const idx = state.current;
      state.bid.calledBy = idx;
      pushLog(`${state.players[idx].name} 叫地主`);
      advanceBid();
    }

    function bidPass(){
      const idx = state.current;
      state.bid.passed[idx] = true;
      pushLog(`${state.players[idx].name} Pass`);
      advanceBid();
    }

    function bidRob(){
      const idx = state.current;
      state.bid.robCount++;
      state.bid.calledBy = idx;
      pushLog(`${state.players[idx].name} 搶地主 (倍數 x${Math.max(1, state.bid.robCount+1)})`);
      advanceBid();
    }

    function advanceBid(){
      if (!state.bid.calledBy && allBidPassed()){
        pushLog('全部人 Pass，重新發牌。');
        deal();
        return;
      }

      const start = state.bid.start;
      state.bid.cursor = (state.bid.cursor + 1) % 3;
      state.current = state.bid.cursor;

      if (state.bid.cursor === start && state.bid.calledBy !== null){
        applyLandlord(state.bid.calledBy);
      }
    }

    function getSelectedCards(){
      const hand = state.players[0].hand;
      const ids = state.ui.selected;
      return hand.filter(c => ids.has(cardId(c)));
    }

    function removeFromHand(hand, cards){
      const rm = new Set(cards.map(cardId));
      return hand.filter(c => !rm.has(cardId(c)));
    }

    function applyPlay(playerIndex, cards){
      const ev = evalHand(cards);
      if (!ev) throw new Error('Invalid hand');

      state.players[playerIndex].hand = removeFromHand(state.players[playerIndex].hand, cards);
      state.lastPlay = { by: playerIndex, cards: sortCards(cards), eval: ev };
      state.passes = [false,false,false];
      pushLog(`${state.players[playerIndex].name} 出牌：${ev.text}（${cardsText(cards)}）`);

      if (state.players[playerIndex].hand.length === 0){
        state.phase = 'over';
        state.current = playerIndex;
        const role = state.players[playerIndex].role === 'landlord' ? '地主勝' : '農民勝';
        pushLog(`完局：${state.players[playerIndex].name} 勝出（${role}）`);
        return;
      }

      state.current = (state.current + 1) % 3;
    }

    function applyPass(playerIndex){
      state.passes[playerIndex] = true;
      pushLog(`${state.players[playerIndex].name} Pass`);

      const leader = state.lastPlay?.by;
      if (leader !== null && leader !== undefined){
        const passCount = state.passes.filter(Boolean).length;
        if (passCount >= 2){
          state.lastPlay = null;
          state.passes = [false,false,false];
          state.current = leader;
          pushLog('兩人 Pass，輪回出牌權。');
          return;
        }
      }

      state.current = (state.current + 1) % 3;
    }

    function cpuStep(){
      if (state.phase !== 'play') return;
      if (window.gameMode === 'online') {
        // If it's a CPU turn in an online room without a real player, 
        // the host handles the CPU. If there's a player, wait for them.
        const currentId = window.currentRoom ? window.currentRoom[`player${state.current}_id`] : null;
        if (currentId) return; // Wait for real player
        if (!window.isOnlineHost()) return; // Only host drives CPU
      } else {
        if (state.current === 0) return;
      }

      const idx = state.current;
      const hand = state.players[idx].hand;
      
      const context = {
        idx,
        role: state.players[idx].role,
        landlordIdx: state.landlord,
        landlordHandSize: state.players[state.landlord].hand.length,
        nextPlayerHandSize: state.players[(idx + 1) % 3].hand.length,
      };

      const move = cpuChooseMove(hand, state.lastPlay, context);

      if (!move){
        if (state.lastPlay) {
          if (window.gameMode === 'online') window.handleOnlineAction('pass_turn', {}, idx);
          else applyPass(idx);
        }
        else {
          if (window.gameMode === 'online') window.handleOnlineAction('play_cards', { cards: [hand[0]] }, idx);
          else applyPlay(idx, [hand[0]]);
        }
      } else {
        if (window.gameMode === 'online') window.handleOnlineAction('play_cards', { cards: move.cards }, idx);
        else applyPlay(idx, move.cards);
      }
    }
    
    // --- Online Hooks ---
    window.handleRoomSync = function(room) {
      if (room.status !== 'playing' || !room.initial_deck) return;

      if (state.phase === 'idle' || state.phase === 'over') {
        resetForNewRound();
        
        const deck = room.initial_deck;
        state.players.forEach(p => { p.hand = []; p.role = null; });

        for (let i=0;i<51;i++) state.players[i%3].hand.push(deck[i]);
        state.bottom = deck.slice(51);
        for (const p of state.players) p.hand = sortCards(p.hand);

        // Map names
        for (let i = 0; i < 3; i++) {
          if (room[`player${i}_id`]) {
            state.players[i].name = `Player ${i + 1}`;
            if (i === window.onlinePlayerIndex) state.players[i].name += ' (You)';
          } else {
            state.players[i].name = `CPU ${i + 1}`;
          }
        }

        state.phase = 'bid';
        state.bid.start = 0; 
        state.bid.cursor = state.bid.start;
        state.bid.calledBy = null;
        state.bid.robCount = 0;
        state.bid.passed = [false,false,false];

        state.current = state.bid.cursor;
        state.log = [];
        pushLog('線上對局開始，開始叫地主。');
        
        if (window.DDZ.render) window.DDZ.render(window.__ddz);
        
        // Host trigger first bid if it is CPU
        if (window.isOnlineHost() && !room[`player${state.current}_id`]) {
           setTimeout(() => { if (window.__ddz.actions.cpuBidStep) window.__ddz.actions.cpuBidStep(); }, 1500);
        }
      }
    };
    
    window.applyNetworkAction = function(action) {
      const { player_index, action_type, payload } = action;
      if (state.current !== player_index) {
        console.warn('[NetAction] Turn mismatch: local P' + state.current + ' vs network P' + player_index + '. Resyncing.');
        state.current = player_index;
      }
      
      if (action_type === 'bid_call') bidCall();
      else if (action_type === 'bid_rob') bidRob();
      else if (action_type === 'bid_pass') bidPass();
      else if (action_type === 'play_cards') applyPlay(player_index, payload.cards);
      else if (action_type === 'pass_turn') applyPass(player_index);
      
      if (window.DDZ.render) window.DDZ.render(window.__ddz);
      
      // Auto CPU trigger for next turn if we are host and it is a CPU turn
      if (window.gameMode === 'online' && window.isOnlineHost()) {
         const nextId = window.currentRoom ? window.currentRoom[`player${state.current}_id`] : null;
         if (!nextId) {
            if (state.phase === 'bid') setTimeout(() => { if (window.__ddz.actions.cpuBidStep) window.__ddz.actions.cpuBidStep(); }, 1500);
            else if (state.phase === 'play') setTimeout(() => { cpuStep(); }, 1500);
         }
      }
    };

    return {
      state,
      actions: {
        restart(){ deal(); },
        async bidCall(){ 
          if (window.gameMode === 'online') await window.handleOnlineAction('bid_call', {}); 
          else bidCall(); 
        },
        async bidPass(){ 
          if (window.gameMode === 'online') await window.handleOnlineAction('bid_pass', {}); 
          else bidPass(); 
        },
        async bidRob(){ 
          if (window.gameMode === 'online') await window.handleOnlineAction('bid_rob', {}); 
          else bidRob(); 
        },
        async playSelected(){
          if (state.phase !== 'play') return;
          if (!isMyTurn(state)) return;
          const cards = getSelectedCards();
          if (!cards.length) return;

          const ev = evalHand(cards);
          if (!ev) return;
          if (state.lastPlay && !canBeat(ev, state.lastPlay.eval)) return;

          if (window.gameMode === 'online') {
            const ok = await window.handleOnlineAction('play_cards', { cards });
            if (ok) state.ui.selected.clear();
          } else {
            try {
              applyPlay(0, cards);
              state.ui.selected.clear();
            } catch (e){
              console.warn('Invalid play:', e);
            }
          }
        },
        async pass(){
          if (state.phase !== 'play') return;
          if (!isMyTurn(state)) return;
          if (!state.lastPlay) return;
          state.ui.selected.clear();
          
          if (window.gameMode === 'online') {
            await window.handleOnlineAction('pass_turn', {});
          } else {
            applyPass(0);
          }
        },
        cpuStep,
        cpuBidStep() {
            if (state.phase !== 'bid') return;
            const idx = state.current;
            const currentId = window.currentRoom ? window.currentRoom[`player${idx}_id`] : null;
            if (currentId) return; // Wait for real player
            if (!window.isOnlineHost()) return;
            
            const hand = state.players[idx].hand;
            const decision = cpuBidDecision(hand, state.bid);
            if (decision === 'call') window.handleOnlineAction('bid_call', {}, idx);
            else if (decision === 'rob') window.handleOnlineAction('bid_rob', {}, idx);
            else window.handleOnlineAction('bid_pass', {}, idx);
        }
      }
    };
  }

  DDZ.makeGame = makeGame;
})();
