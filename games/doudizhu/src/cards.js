// 斗地主 card model + ordering (no-module build)
(() => {
  const DDZ = window.DDZ = window.DDZ || {};

  const RANKS = ['3','4','5','6','7','8','9','10','J','Q','K','A','2','BJ','RJ'];
  const RANK_INDEX = Object.fromEntries(RANKS.map((r,i)=>[r,i]));

  const SUITS = [
    { key:'D', name:'♦' },
    { key:'C', name:'♣' },
    { key:'H', name:'♥' },
    { key:'S', name:'♠' },
  ];

  function cardId(c){
    // Jokers: BJ / RJ
    return c.suit ? `${c.rank}${c.suit}` : c.rank;
  }

  function cardToText(c){
    if (!c.suit) return c.rank === 'BJ' ? '小王' : '大王';
    const suit = SUITS.find(s=>s.key===c.suit)?.name || c.suit;
    return `${c.rank}${suit}`;
  }

  function cardAssetFile(c){
    // assets/cards/<rank><suit>.svg; jokers: BJ.svg / RJ.svg
    if (!c.suit) return `./assets/cards/${c.rank}.svg`;
    return `./assets/cards/${c.rank}${c.suit}.svg`;
  }

  function compareCard(a,b){
    // 斗地主：主要按 rank 比（花色一般不參與勝負），但為穩定排序加 suit。
    const ra = RANK_INDEX[a.rank];
    const rb = RANK_INDEX[b.rank];
    if (ra !== rb) return ra - rb;
    return (a.suit || '').localeCompare(b.suit || '');
  }

  function sortCards(cards){
    return [...cards].sort(compareCard);
  }

  function makeDeck(){
    const deck = [];
    for (const r of RANKS){
      if (r === 'BJ' || r === 'RJ') continue;
      for (const s of SUITS){
        deck.push({ rank: r, suit: s.key });
      }
    }
    deck.push({ rank:'BJ', suit: null });
    deck.push({ rank:'RJ', suit: null });
    return deck;
  }

  function shuffle(arr){
    for (let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  DDZ.RANKS = RANKS;
  DDZ.RANK_INDEX = RANK_INDEX;
  DDZ.SUITS = SUITS;
  DDZ.cardId = cardId;
  DDZ.cardToText = cardToText;
  DDZ.cardAssetFile = cardAssetFile;
  DDZ.compareCard = compareCard;
  DDZ.sortCards = sortCards;
  DDZ.makeDeck = makeDeck;
  DDZ.shuffle = shuffle;
})();
