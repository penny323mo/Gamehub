// UI + render (no-module build)
(() => {
  const DDZ = window.DDZ = window.DDZ || {};
  const { cardAssetFile, cardId, cardToText } = DDZ;
  const { evalHand, canBeat, TYPE } = DDZ;
  const { getLegalMoves } = DDZ;
  const { cpuBidDecision } = DDZ;

  function seatPassText(state, i){
    return state.passes?.[i] ? '· Pass' : '';
  }

  function rankCounts(cards){
    const m = new Map();
    for (const c of cards){
      m.set(c.rank, (m.get(c.rank) || 0) + 1);
    }
    return m;
  }

  function countSingles(cards){
    const cnt = rankCounts(cards);
    let singles = 0;
    for (const n of cnt.values()) if (n === 1) singles++;
    return singles;
  }

  function scoreHintMove(hand, move, lastPlay){
    const rm = new Set(move.cards.map(cardId));
    const remaining = hand.filter(c => !rm.has(cardId(c)));
    const singles = countSingles(remaining);
    const typePenalty = (move.ev.type === TYPE.BOMB || move.ev.type === TYPE.ROCKET) ? 50 : 0;
    const followPenalty = lastPlay ? 0 : 0;
    return remaining.length * 10 + singles * 2 + typePenalty + followPenalty;
  }

  function bindUI(game){
    const { state, actions } = game;

    const els = {
      status: document.getElementById('status'),
      tableInfo: document.getElementById('tableInfo'),
      lastPlay: document.getElementById('lastPlay'),
      bottom: document.getElementById('bottom'),
      hand: document.getElementById('hand'),

      playBtn: document.getElementById('playBtn'),
      passBtn: document.getElementById('passBtn'),
      hintBtn: document.getElementById('hintBtn'),
      cancelBtn: document.getElementById('cancelBtn'),

      bidCallBtn: document.getElementById('bidCallBtn'),
      bidRobBtn: document.getElementById('bidRobBtn'),
      bidPassBtn: document.getElementById('bidPassBtn'),

      restartBtn: document.getElementById('restartBtn'),
      hint: document.getElementById('hint'),
      log: document.getElementById('log'),

      seats: [
        { name: document.getElementById('p0Name'), meta: document.getElementById('p0Meta'), body: document.getElementById('p0Body'), wrap: document.getElementById('seat0') },
        { name: document.getElementById('p1Name'), meta: document.getElementById('p1Meta'), body: document.getElementById('p1Body'), wrap: document.getElementById('seat1') },
        { name: document.getElementById('p2Name'), meta: document.getElementById('p2Meta'), body: document.getElementById('p2Body'), wrap: document.getElementById('seat2') },
      ],
    };

    function setHint(text, isError=false){
      els.hint.textContent = text || '';
      els.hint.style.color = isError ? 'var(--danger)' : 'var(--muted)';
    }

    // Hand click delegation
    els.hand.addEventListener('click', (e) => {
      const btn = e.target.closest('button.cardBtn');
      if (!btn) return;
      if (state.phase !== 'play') return;
      if (state.current !== 0) return;

      const id = btn.dataset.id;
      if (state.ui.selected.has(id)) state.ui.selected.delete(id);
      else state.ui.selected.add(id);
      render(game);
    });

    els.restartBtn.addEventListener('click', () => {
      actions.restart();
      render(game);
      bidCpuLoop();
      if (state.phase === 'play' && state.current !== 0) playCpuLoop();
    });

    function bidCpuLoop(){
      const step = () => {
        if (state.phase !== 'bid') { render(game); return; }
        if (state.current === 0) { render(game); return; }

        const decision = cpuBidDecision(state.players[state.current].hand, state.bid);
        if (decision === 'call') actions.bidCall();
        else if (decision === 'rob') actions.bidRob();
        else actions.bidPass();

        render(game);

        if (state.phase === 'play' && state.current !== 0){
          playCpuLoop();
          return;
        }

        setTimeout(step, 450);
      };
      setTimeout(step, 450);
    }

    els.bidCallBtn.addEventListener('click', () => {
      actions.bidCall();
      render(game);
      bidCpuLoop();
      if (state.phase === 'play' && state.current !== 0) playCpuLoop();
    });
    els.bidRobBtn.addEventListener('click', () => {
      actions.bidRob();
      render(game);
      bidCpuLoop();
      if (state.phase === 'play' && state.current !== 0) playCpuLoop();
    });
    els.bidPassBtn.addEventListener('click', () => {
      actions.bidPass();
      render(game);
      bidCpuLoop();
      if (state.phase === 'play' && state.current !== 0) playCpuLoop();
    });

    function playCpuLoop(){
      const step = () => {
        if (state.phase !== 'play') { render(game); return; }
        if (state.current === 0) { render(game); return; }
        actions.cpuStep();
        render(game);
        setTimeout(step, 450);
      };
      setTimeout(step, 450);
    }

    // Play
    els.playBtn.addEventListener('click', () => {
      actions.playSelected();
      render(game);
      playCpuLoop();
    });
    els.passBtn.addEventListener('click', () => {
      actions.pass();
      render(game);
      playCpuLoop();
    });

    els.cancelBtn.addEventListener('click', () => {
      state.ui.selected.clear();
      render(game);
    });

    // Hint
    els.hintBtn.addEventListener('click', () => {
      if (state.phase !== 'play' || state.current !== 0){
        setHint('未輪到你出牌。', true);
        return;
      }

      const hand = state.players[0].hand;
      const last = state.lastPlay;
      const ctx = `${hand.map(cardId).sort().join(',')}|${last ? last.cards.map(cardId).sort().join(',') : 'LEAD'}`;

      if (state.ui.hintContext !== ctx){
        state.ui.hintContext = ctx;
        const legal = getLegalMoves(hand, last);
        const sorted = legal.slice().sort((a,b) => scoreHintMove(hand, a, last) - scoreHintMove(hand, b, last));
        state.ui.hintList = sorted;
        state.ui.hintIndex = 0;
      }

      const list = state.ui.hintList || [];
      if (!list.length){
        setHint(last ? '無牌可跟，請 Pass。' : '無可出牌（理論上唔會出現）。', true);
        return;
      }

      const idx = state.ui.hintIndex % list.length;
      const move = list[idx];
      state.ui.hintIndex = idx + 1;

      state.ui.selected = new Set(move.cards.map(cardId));
      const label = idx === 0 ? '建議' : `提示 ${idx+1}/${list.length}`;
      setHint(`${label}：${move.ev.text}`);
      render(game);
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      const inPlay = state.phase === 'play';
      const isHumanTurn = state.current === 0;

      if (key === 'h'){
        els.hintBtn.click();
      } else if (key === 'c'){
        els.cancelBtn.click();
      } else if (key === ' '){
        if (inPlay && isHumanTurn && !els.passBtn.disabled) els.passBtn.click();
      } else if (key === 'enter'){
        if (inPlay && isHumanTurn && !els.playBtn.disabled) els.playBtn.click();
      }
    });

    game._ui = { els, setHint };
  }

  function render(game){
    const { state } = game;
    const { els, setHint } = game._ui || {};
    if (!els) return;

    // seats
    for (let i=0;i<3;i++){
      const p = state.players[i];
      els.seats[i].name.textContent = p.name;
      const role = p.role ? (p.role === 'landlord' ? '地主' : '農民') : '';
      const pass = seatPassText(state, i);
      els.seats[i].meta.textContent = `${p.hand.length} cards ${role ? '· ' + role : ''} ${pass}`.trim();

      els.seats[i].wrap.classList.toggle('seat--turn', i === state.current);
      els.seats[i].body.innerHTML = '';

      if (i !== 0){
        const count = state.players[i].hand.length;
        const wrap = document.createElement('div');
        wrap.className = 'stack';
        for (let k=0;k<count;k++){
          const back = document.createElement('div');
          back.className = 'cardBack stackItem';
          wrap.appendChild(back);
        }
        els.seats[i].body.appendChild(wrap);
      }
    }

    // center
    els.lastPlay.innerHTML = '';
    if (!state.lastPlay){
      const mult = state.bid?.robCount ? `｜倍數 x${Math.max(1, state.bid.robCount+1)}` : '';
      els.tableInfo.textContent = `Table empty — lead any valid hand. ${mult}`.trim();
    } else {
      const mult = state.bid?.robCount ? `｜倍數 x${Math.max(1, state.bid.robCount+1)}` : '';
      els.tableInfo.textContent = `To beat: ${state.lastPlay.eval?.text || state.lastPlay.eval?.type || '(unknown)'} (${state.players[state.lastPlay.by].name}) ${mult}`.trim();
      const wrap = document.createElement('div');
      wrap.className = 'stack stack--table';
      for (const c of state.lastPlay.cards){
        const img = document.createElement('img');
        img.className = 'cardImg cardImg--table stackItem';
        img.src = cardAssetFile(c);
        img.alt = cardToText(c);
        img.loading = 'lazy';
        wrap.appendChild(img);
      }
      els.lastPlay.appendChild(wrap);
    }

    // bottom cards
    els.bottom.innerHTML = '';
    const showBottom = state.phase !== 'bid';
    if (showBottom){
      const wrap = document.createElement('div');
      wrap.className = 'stack stack--table';
      for (const c of state.bottom){
        const img = document.createElement('img');
        img.className = 'cardImg cardImg--table stackItem';
        img.src = cardAssetFile(c);
        img.alt = cardToText(c);
        img.loading = 'lazy';
        wrap.appendChild(img);
      }
      els.bottom.appendChild(wrap);
    }

    // status
    if (state.phase === 'bid'){
      const who = state.players[state.current].name;
      const called = state.bid?.calledBy != null ? `｜目前叫地主：${state.players[state.bid.calledBy].name}` : '';
      els.status.textContent = `Bid phase — Turn: ${who} (You first). If all pass, redeal. ${called}`.trim();
    } else if (state.phase === 'play'){
      const who = state.players[state.current].name;
      const landlord = state.landlord != null ? `｜地主：${state.players[state.landlord].name}` : '';
      els.status.textContent = `Play phase — Turn: ${who} ${landlord}`.trim();
    } else if (state.phase === 'over'){
      const winner = state.players[state.current].name;
      const role = state.players[state.current].role === 'landlord' ? '地主勝' : '農民勝';
      els.status.textContent = `Game Over — Winner: ${winner} (${role})`;
    } else {
      els.status.textContent = 'Loading…';
    }

    // hand
    els.hand.innerHTML = '';
    const human = state.players[0];
    let idx = 0;
    for (const c of human.hand){
      const btn = document.createElement('button');
      btn.type = 'button';
      const selected = state.ui.selected.has(cardId(c));
      btn.className = 'cardBtn' + (selected ? ' cardBtn--selected' : '');
      btn.dataset.id = cardId(c);
      // keep right-side cards always on top; selection only lifts vertically
      btn.style.zIndex = idx;

      const img = document.createElement('img');
      img.className = 'cardImg cardImg--hand';
      img.src = cardAssetFile(c);
      img.alt = cardToText(c);
      img.loading = 'lazy';

      btn.appendChild(img);
      els.hand.appendChild(btn);
      idx++;
    }

    // log
    els.log.innerHTML = '';
    if (state.log?.length){
      for (const line of state.log){
        const div = document.createElement('div');
        div.textContent = line;
        els.log.appendChild(div);
      }
    } else {
      els.log.textContent = '—';
    }

    // controls
    const isHumanTurn = state.current === 0;
    const inBid = state.phase === 'bid';
    const inPlay = state.phase === 'play';

    els.bidCallBtn.disabled = !(inBid && isHumanTurn);
    const canRob = inBid && isHumanTurn && state.bid?.calledBy != null && state.bid?.calledBy !== 0;
    els.bidRobBtn.disabled = !canRob;
    els.bidPassBtn.disabled = !(inBid && isHumanTurn);

    let canPlay = false;
    let selEval = null;
    if (inPlay && isHumanTurn){
      const sel = state.players[0].hand.filter(c => state.ui.selected.has(cardId(c)));
      if (sel.length){
        selEval = evalHand(sel);
        if (selEval){
          canPlay = !state.lastPlay || canBeat(selEval, state.lastPlay.eval);
        }
      }
    }

    els.playBtn.disabled = !(inPlay && isHumanTurn && canPlay);
    els.passBtn.disabled = !(inPlay && isHumanTurn && !!state.lastPlay);

    if (state.phase === 'over'){
      setHint('遊戲結束，按 Restart 重新開始。');
    } else if (!inPlay){
      setHint('');
    } else if (inPlay && isHumanTurn){
      if (!state.ui.selected.size){
        setHint(state.lastPlay ? '揀牌去跟（或 Pass）。' : '你先出牌：揀一手合法牌型。');
      } else if (!selEval){
        setHint('揀嘅牌唔係合法牌型。', true);
      } else if (state.lastPlay && !canPlay){
        setHint(`唔夠大：${selEval.text}`, true);
      } else {
        setHint(`可出：${selEval.text}`);
      }
    }
  }

  DDZ.bindUI = bindUI;
  DDZ.render = render;
})();
