(() => {
  const canvas = document.getElementById('table');
  const ctx = canvas.getContext('2d');
  const scoreLeftEl = document.getElementById('score-left');
  const statusMsgEl = document.getElementById('status-msg');
  const scoreRightEl = document.getElementById('score-right');
  const modeSelect = document.getElementById('modeSelect');
  const aimBtn = document.getElementById('aimBtn');
  const startBtn = document.getElementById('startBtn');
  const restartBtn2 = document.getElementById('restartBtn2');
  const spinControl = document.getElementById('spinControl');
  const spinMarker = document.getElementById('spinMarker');
  const resetSpinBtn = document.getElementById('resetSpinBtn');
  const W = canvas.width;
  const H = canvas.height;
  const R = 10; // ball radius
  const BALL_MASS = (4/3) * Math.PI * Math.pow(R,3); // volume-based mass

  const POCKET_INSET = 6;
  const HOLE_R = 15.4;
  const HOLE_R_CORNER = 19.8;
  const pockets = [
    {x:POCKET_INSET,y:POCKET_INSET,r:HOLE_R_CORNER},{x:W/2,y:POCKET_INSET - 4,r:HOLE_R},{x:W-POCKET_INSET,y:POCKET_INSET,r:HOLE_R_CORNER},
    {x:POCKET_INSET,y:H-POCKET_INSET,r:HOLE_R_CORNER},{x:W/2,y:H-POCKET_INSET + 4,r:HOLE_R},{x:W-POCKET_INSET,y:H-POCKET_INSET,r:HOLE_R_CORNER}
  ];

  const foulValue = { red:1, color:4, yellow:2, green:3, brown:4, blue:5, pink:6, black:7 };
  const colorOrder = ['yellow','green','brown','blue','pink','black'];
  const colorValues = { yellow:2, green:3, brown:4, blue:5, pink:6, black:7 };

  const state = {
    mode: 'practice',
    turn: 'player',
    difficulty: 'normal',
    aiThinking: false,
    balls: [],
    cue: null,
    aiming: true,
    aimAngle: -Math.PI/6,
    dragging: false,
    placingDrag: false,
    scores: { player: 0, ai: 0 },
    target: 'red',
    pullStart: null,
    pullPower: 0,
    placingCue: true,
    positionsConfirmed: false,
    phase: 'place', // place -> aim -> shot -> resolve
    inputState: 'idle', // idle | aiming | powering
    lastTime: null,
    gamePhase: 'RED', // RED | COLOUR | CLEAR_YELLOW..CLEAR_BLACK
    shotPots: [],
    cuePotted: false,
    cueInHand: false,
    respotQueue: [],
    respotTimer: null,
    spin: { x: 0, y: 0 },
    firstContact: null,
    redRemaining: 15,
    clearanceIndex: 0,
    isComplete: false,
    aiTimer: null,
    shotTimer: null,
  };

  // config removed

  function getMaxScore(){
    if (state.redRemaining > 0){
      return state.redRemaining * 8 + 27;
    }
    if (state.gamePhase === 'COLOUR'){
      return 27;
    }
    if (state.gamePhase.startsWith('CLEAR_')){
      const remaining = colorOrder.slice(state.clearanceIndex);
      return remaining.reduce((sum, c) => sum + colorValues[c], 0);
    }
    return 27;
  }

  function getTargetLabel(){
    if (state.target === 'red') return '紅球';
    if (state.target === 'color') return '彩球';
    return state.target;
  }

  function updateStatus(note){
    const maxScore = getMaxScore();
    let msg = note;
    if (!msg){
      if (state.isComplete){
        msg = '清枱完成';
      } else if (state.placingCue){
        msg = '擺放白球';
      } else if (state.aiming){
        msg = '瞄準中';
      } else {
        msg = '擊球中';
      }
    }

    // Highlight active turn
    scoreLeftEl.classList.remove('active-turn');
    scoreRightEl.classList.remove('active-turn');
    if (!state.isComplete) {
      if (state.turn === 'player') scoreLeftEl.classList.add('active-turn');
      else if (state.turn === 'ai') scoreRightEl.classList.add('active-turn');
    }

    if (state.mode === 'practice') {
      scoreLeftEl.textContent = `Score: ${state.scores.player}`;
      scoreRightEl.style.visibility = 'hidden';
      
      if (state.isComplete) {
         statusMsgEl.textContent = `練習結束\n最終得分: ${state.scores.player}`;
      } else {
         statusMsgEl.textContent = `${msg}\n目標: ${getTargetLabel()} | 紅球: ${state.redRemaining}`;
      }
    } else {
      scoreLeftEl.textContent = `P1: ${state.scores.player}`;
      scoreRightEl.textContent = `AI: ${state.scores.ai}`;
      scoreRightEl.style.visibility = 'visible';

      if (state.isComplete) {
        let result = '';
        if (state.scores.player > state.scores.ai) result = '玩家獲勝!';
        else if (state.scores.ai > state.scores.player) result = 'AI獲勝!';
        else result = '平局!';
        statusMsgEl.textContent = `${result}\n最終比分 ${state.scores.player} - ${state.scores.ai}`;
      } else {
        const turnLabel = state.turn === 'player' ? '玩家' : 'AI';
        statusMsgEl.textContent = `${msg} (輪次: ${turnLabel})\n目標: ${getTargetLabel()} | 紅球: ${state.redRemaining} | 剩餘: ${maxScore}`;
      }
    }
  }

  function reset(){
    if (state.aiTimer) { clearTimeout(state.aiTimer); state.aiTimer = null; }
    if (state.shotTimer) { clearTimeout(state.shotTimer); state.shotTimer = null; }
    const m = modeSelect.value;
    state.mode = m === 'practice' ? 'practice' : 'ai';
    state.difficulty = m === 'practice' ? 'normal' : m;
    state.turn = 'player';
    state.aiThinking = false;

    state.balls = [];
    state.scores = { player: 0, ai: 0 };
    state.target = 'red';
    state.redRemaining = 15;
    state.clearanceIndex = 0;
    state.isComplete = false;

    // cue ball (baulk/D area start)
    state.cue = {x: W*0.2, y: H*0.5, vx:0, vy:0, color:'#fff', alive:true, isCue:true, mass: BALL_MASS};
    state.balls.push(state.cue);
    state.placingCue = true;
    state.positionsConfirmed = false;
    state.phase = 'place';
    state.inputState = 'idle';
    state.gamePhase = 'RED';
    state.shotPots = [];
    state.cuePotted = false;
    state.cueInHand = false;
    state.respotQueue = [];
    if (state.respotTimer) { clearTimeout(state.respotTimer); state.respotTimer = null; }
    // colors (standard-ish spots)
    const baulkX = W*0.22; // baulk line
    const dR = H*0.13;
    const colors = [
      {x: baulkX, y: H*0.5 + dR, color:'#d4b000', value:2, type:'yellow'}, // yellow (right on screen)
      {x: baulkX, y: H*0.5 - dR, color:'#2bc44a', value:3, type:'green'}, // green (left on screen)
      {x: baulkX, y: H*0.5, color:'#8b4a2f', value:4, type:'brown'}, // brown (center)
      {x: W*0.5, y: H*0.5, color:'#2e7bff', value:5, type:'blue'}, // blue (center)
      {x: W*0.67, y: H*0.5, color:'#ff6aa6', value:6, type:'pink'}, // pink
      {x: W*0.86, y: H*0.5, color:'#111', value:7, type:'black'}, // black
    ];
    const pinkSpot = {x: W*0.67, y: H*0.5};

    // 15 red balls (triangle), apex just in front of pink toward black
    const triStartX = pinkSpot.x + 1.75*R;
    const triStartY = H*0.5;
    let row = 1;
    let placed = 0;
    while (placed < 15){
      for (let i=0;i<row;i++){
        if (placed >= 15) break;
        const x = triStartX + (row-1)*2.05*R;
        const rowHeight = (row-1)*2.05*R;
        const y = triStartY + i*2.05*R - rowHeight/2;
        state.balls.push({x, y, vx:0, vy:0, color:'#d33', alive:true, type:'red', value:1, mass: BALL_MASS});
        placed++;
      }
      row++;
    }
    for (const c of colors){
      state.balls.push({x:c.x,y:c.y,vx:0,vy:0,color:c.color,alive:true,type:c.type,value:c.value,spot:{x:c.x,y:c.y}, mass: BALL_MASS});
    }
    state.aiming = true;
    state.aimAngle = -Math.PI/6;
    updateTarget();
    updateStatus('準備開始');
  }

  function drawTable(){
    ctx.clearRect(0,0,W,H);
    // cloth gradient (3D feel)
    const g = ctx.createRadialGradient(W*0.35, H*0.3, 40, W*0.5, H*0.5, W*0.9);
    g.addColorStop(0, '#167a44');
    g.addColorStop(1, '#0a4d2a');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // inner shadow (cushion depth)
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,.35)';
    ctx.lineWidth = 10;
    ctx.strokeRect(5,5,W-10,H-10);
    ctx.restore();

    // baulk line + D area
    const baulkX = W*0.22;
    const dR = H*0.125;
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(baulkX, 0); ctx.lineTo(baulkX, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(baulkX, H*0.5, dR, Math.PI/2, Math.PI*1.5);
    ctx.stroke();

    // subtle vignette
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0,0,W,H);

    // pockets (integrated into rails)
    for (const p of pockets){
      const r = p.r || HOLE_R;
      const pg = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, r + 2);
      pg.addColorStop(0, '#000');
      pg.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  function drawBalls(){
    for (const b of state.balls){
      if (!b.alive) continue;
      // ball shading
      const bg = ctx.createRadialGradient(b.x - 3, b.y - 3, 2, b.x, b.y, R+2);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.2, b.color);
      bg.addColorStop(1, '#111');
      ctx.beginPath();
      ctx.fillStyle = bg;
      ctx.arc(b.x, b.y, R, 0, Math.PI*2);
      ctx.fill();
      if (b.isCue){
        ctx.strokeStyle = 'rgba(255,255,255,.6)';
        ctx.stroke();

        // show cue ball hit point (red dot)
        const dotX = b.x;
        const dotY = b.y;
        ctx.fillStyle = '#d33';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.8, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  function getFirstCollision(cx, cy, angle, maxLen){
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let bestT = Infinity;
    let best = null;

    // rail intersections
    const candidates = [];
    if (dx !== 0){
      const t1 = (R - cx) / dx;
      const y1 = cy + dy * t1;
      if (t1 > 0 && y1 >= R && y1 <= H - R) candidates.push({t:t1, x:R, y:y1, type:'rail'});
      const t2 = (W - R - cx) / dx;
      const y2 = cy + dy * t2;
      if (t2 > 0 && y2 >= R && y2 <= H - R) candidates.push({t:t2, x:W - R, y:y2, type:'rail'});
    }
    if (dy !== 0){
      const t3 = (R - cy) / dy;
      const x3 = cx + dx * t3;
      if (t3 > 0 && x3 >= R && x3 <= W - R) candidates.push({t:t3, x:x3, y:R, type:'rail'});
      const t4 = (H - R - cy) / dy;
      const x4 = cx + dx * t4;
      if (t4 > 0 && x4 >= R && x4 <= W - R) candidates.push({t:t4, x:x4, y:H - R, type:'rail'});
    }
    for (const c of candidates){
      if (c.t < bestT && c.t <= maxLen){ bestT = c.t; best = c; }
    }

    // ball intersections
    for (const b of state.balls){
      if (!b.alive || b.isCue) continue;
      const rx = b.x - cx;
      const ry = b.y - cy;
      const proj = rx * dx + ry * dy;
      if (proj < 0) continue;
      const closestSq = rx*rx + ry*ry - proj*proj;
      const radius = 2*R;
      if (closestSq > radius*radius) continue;
      const thc = Math.sqrt(Math.max(0, radius*radius - closestSq));
      const t = proj - thc;
      if (t > 0 && t < bestT && t <= maxLen){
        bestT = t;
        best = {x: cx + dx*t, y: cy + dy*t, type:'ball'};
      }
    }
    return best;
  }

  function drawAim(){
    if (!state.aiming) return;
    const len = 120 + Math.min(80, state.pullPower);
    ctx.strokeStyle = 'rgba(255,255,255,.6)';
    ctx.setLineDash([6,6]);
    ctx.beginPath();
    ctx.moveTo(state.cue.x, state.cue.y);
    ctx.lineTo(state.cue.x + Math.cos(state.aimAngle)*len, state.cue.y + Math.sin(state.aimAngle)*len);
    ctx.stroke();
    ctx.setLineDash([]);

    // arrow head
    const ax = state.cue.x + Math.cos(state.aimAngle)*len;
    const ay = state.cue.y + Math.sin(state.aimAngle)*len;
    const ah = 8;
    ctx.strokeStyle = 'rgba(255,255,255,.7)';
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - Math.cos(state.aimAngle - 0.4)*ah, ay - Math.sin(state.aimAngle - 0.4)*ah);
    ctx.lineTo(ax - Math.cos(state.aimAngle + 0.4)*ah, ay - Math.sin(state.aimAngle + 0.4)*ah);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // ghost collision line (approx)
    const hit = getFirstCollision(state.cue.x, state.cue.y, state.aimAngle, len);
    if (hit){
      ctx.strokeStyle = 'rgba(106,166,255,.45)';
      ctx.setLineDash([4,6]);
      ctx.beginPath();
      ctx.moveTo(hit.x, hit.y);
      const reflLen = 60;
      if (hit.type === 'rail'){
        const nx = hit.x <= R ? 1 : hit.x >= W-R ? -1 : 0;
        const ny = hit.y <= R ? 1 : hit.y >= H-R ? -1 : 0;
        const inx = Math.cos(state.aimAngle), iny = Math.sin(state.aimAngle);
        const rx = inx - 2*(inx*nx)*nx;
        const ry = iny - 2*(iny*ny)*ny;
        ctx.lineTo(hit.x + rx*reflLen, hit.y + ry*reflLen);
      } else {
        ctx.lineTo(hit.x + Math.cos(state.aimAngle)*reflLen, hit.y + Math.sin(state.aimAngle)*reflLen);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // ghost ball at first contact (visual aid)
      if (hit.type === 'ball'){
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.7)';
        ctx.setLineDash([3,4]);
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, R, 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();

        // predicted object ball path (approx)
        const objLen = 80;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,.35)';
        ctx.setLineDash([2,6]);
        ctx.beginPath();
        ctx.moveTo(hit.x, hit.y);
        ctx.lineTo(hit.x + Math.cos(state.aimAngle)*objLen, hit.y + Math.sin(state.aimAngle)*objLen);
        ctx.stroke();
        ctx.restore();
      }
    }

    // pocket highlight if straight line is clear
    if (!hit){
      const vx = Math.cos(state.aimAngle), vy = Math.sin(state.aimAngle);
      let best = null;
      for (const p of pockets){
        const dx = p.x - state.cue.x, dy = p.y - state.cue.y;
        const t = dx*vx + dy*vy;
        if (t <= 0) continue;
        const px = state.cue.x + vx*t;
        const py = state.cue.y + vy*t;
        const dist = Math.hypot(p.x - px, p.y - py);
        if (dist < 18){
          if (!best || t < best.t) best = {p, t};
        }
      }
      if (best){
        ctx.save();
        ctx.strokeStyle = 'rgba(255,214,106,.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(best.p.x, best.p.y, 18, 0, Math.PI*2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // cue stick (pull back animation)
    const pullOffset = Math.min(60, state.pullPower * 0.7);
    const stickLen = 90;
    const sx = state.cue.x - Math.cos(state.aimAngle) * (8 + pullOffset);
    const sy = state.cue.y - Math.sin(state.aimAngle) * (8 + pullOffset);
    const ex = sx - Math.cos(state.aimAngle) * stickLen;
    const ey = sy - Math.sin(state.aimAngle) * stickLen;
    ctx.strokeStyle = 'rgba(220,180,120,.9)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.lineWidth = 1;

    // cue pull indicator
    if (state.pullPower > 0){
      const back = Math.min(60, state.pullPower);
      ctx.strokeStyle = 'rgba(255,214,106,.8)';
      ctx.beginPath();
      ctx.moveTo(state.cue.x, state.cue.y);
      ctx.lineTo(state.cue.x - Math.cos(state.aimAngle)*back, state.cue.y - Math.sin(state.aimAngle)*back);
      ctx.stroke();

      // power bar
      const barW = 120, barH = 6;
      const px = 16, py = 16;
      ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.fillRect(px, py, barW, barH);
      const ratio = Math.min(1, state.pullPower/60);
      ctx.fillStyle = ratio > 0.7 ? '#ff6a6a' : ratio > 0.4 ? '#ffd66a' : '#6affb3';
      ctx.fillRect(px, py, barW*ratio, barH);
    }
  }

  const RESTITUTION = 0.95;
  const CUSHION_RESTITUTION = 0.90;
  const CUSHION_MU = 0.05;
  const POS_CORRECT = 0.8;
  const ITERATIONS = 10;
  const MAX_STEP = 1/180;
  const FRICTION_K = 0.9;
  const STOP_EPS = 0.4;

  function updateTarget(){
    if (state.gamePhase === 'RED') state.target = 'red';
    else if (state.gamePhase === 'COLOUR') state.target = 'color';
    else {
      const map = {
        'CLEAR_YELLOW':'yellow','CLEAR_GREEN':'green','CLEAR_BROWN':'brown',
        'CLEAR_BLUE':'blue','CLEAR_PINK':'pink','CLEAR_BLACK':'black'
      };
      state.target = map[state.gamePhase] || 'color';
    }
  }

  function resolvePair(a,b){
    const dx = b.x - a.x, dy = b.y - a.y;
    let dist = Math.hypot(dx,dy);
    if (dist === 0) dist = 0.0001;
    const nx = dx/dist, ny = dy/dist;

    if (!state.firstContact && (a.isCue || b.isCue)){
      const other = a.isCue ? b : a;
      state.firstContact = other.type || 'none';
    }

    const rvx = b.vx - a.vx;
    const rvy = b.vy - a.vy;
    const vn = rvx*nx + rvy*ny;
    if (vn > 0) return;

    const m1 = a.mass || BALL_MASS;
    const m2 = b.mass || BALL_MASS;
    const inv1 = 1/m1, inv2 = 1/m2;

    // positional correction first
    const penetration = 2*R - dist;
    if (penetration > 0){
      const corr = penetration * POS_CORRECT / (inv1 + inv2);
      a.x -= corr*inv1*nx; a.y -= corr*inv1*ny;
      b.x += corr*inv2*nx; b.y += corr*inv2*ny;
    }

    // impulse
    const j = -(1 + RESTITUTION) * vn / (inv1 + inv2);
    a.vx -= j*inv1*nx; a.vy -= j*inv1*ny;
    b.vx += j*inv2*nx; b.vy += j*inv2*ny;

    // Spin Force (Screw/Follow)
    if (a.isCue || b.isCue) {
       const cue = a.isCue ? a : b;
       // Direction from Cue to Object
       const dirX = a.isCue ? nx : -nx;
       const dirY = a.isCue ? ny : -ny;
       
       const spinMag = Math.abs(state.spin.y);
       if (spinMag > 0.05) {
          // spin.y < 0 (Top) -> Follow -> Add velocity towards object
          // spin.y > 0 (Back) -> Screw -> Add velocity away from object
          const force = -state.spin.y * Math.abs(vn) * 0.5; 
          cue.vx += dirX * force;
          cue.vy += dirY * force;
       }
    }
  }

  function resolveCushion(b){
    const spinX = (b.isCue && Math.abs(state.spin.x) > 0.05) ? state.spin.x : 0;
    const spinF = 0.35; // Side spin strength

    if (b.x < R){
      b.x = R;
      const vn = b.vx;
      b.vx = -vn * CUSHION_RESTITUTION;
      b.vy *= (1 - CUSHION_MU);
      // Left Cushion: Normal (1,0). Right Spin (CCW) -> Surface moves Down -> Friction Up (-y)
      if (spinX) b.vy -= spinX * Math.abs(vn) * spinF;
    }
    if (b.x > W-R){
      b.x = W-R;
      const vn = b.vx;
      b.vx = -vn * CUSHION_RESTITUTION;
      b.vy *= (1 - CUSHION_MU);
      // Right Cushion: Normal (-1,0). Right Spin (CCW) -> Surface moves Up -> Friction Down (+y)
      if (spinX) b.vy += spinX * Math.abs(vn) * spinF;
    }
    if (b.y < R){
      b.y = R;
      const vn = b.vy;
      b.vy = -vn * CUSHION_RESTITUTION;
      b.vx *= (1 - CUSHION_MU);
      // Top Cushion: Normal (0,1). Inverted Logic Fix
      if (spinX) b.vx += spinX * Math.abs(vn) * spinF;
    }
    if (b.y > H-R){
      b.y = H-R;
      const vn = b.vy;
      b.vy = -vn * CUSHION_RESTITUTION;
      b.vx *= (1 - CUSHION_MU);
      // Bottom Cushion: Normal (0,-1). Inverted Logic Fix
      if (spinX) b.vx -= spinX * Math.abs(vn) * spinF;
    }
  }

  function pocketCheck(b){
    for (const p of pockets){
      const dx = b.x - p.x, dy = b.y - p.y;
      const r = p.r || HOLE_R;
      if (dx*dx + dy*dy < (r - R*0.55)**2){
        if (b.isCue){
          state.cuePotted = true;
          state.cueInHand = true;
          state.placingCue = true;
          state.positionsConfirmed = false;
          b.x = W*0.2; b.y = H*0.5; b.vx=0; b.vy=0;
          updateStatus('白球入袋');
        } else {
          if (!b.alive) return;
          b.alive = false;
          state.shotPots.push(b);
        }
        return;
      }
    }
  }

  function isSpotOccupied(x, y) {
    for (const b of state.balls) {
      if (!b.alive) continue;
      const dx = b.x - x;
      const dy = b.y - y;
      if (dx * dx + dy * dy < 4 * R * R) return true;
    }
    return false;
  }

  function getStandardSpot(type) {
    const baulkX = W*0.22;
    const dR = H*0.13;
    const midY = H*0.5;
    if (type === 'black') return {x: W*0.86, y: midY};
    if (type === 'pink') return {x: W*0.67, y: midY};
    if (type === 'blue') return {x: W*0.5, y: midY};
    if (type === 'brown') return {x: baulkX, y: midY};
    if (type === 'green') return {x: baulkX, y: midY - dR};
    if (type === 'yellow') return {x: baulkX, y: midY + dR};
    return null;
  }

  function getSafeRespotPosition(ball) {
    const spot = ball.spot;
    // 1. Check Original Spot
    if (!isSpotOccupied(spot.x, spot.y)) return { x: spot.x, y: spot.y };

    // 2. Check Highest Value Spot Available
    const order = ['black','pink','blue','brown','green','yellow'];
    for (const type of order) {
      const s = getStandardSpot(type);
      if (s && !isSpotOccupied(s.x, s.y)) return { x: s.x, y: s.y };
    }

    // 3. Linear Search from Original towards Top Cushion (y decreases)
    for (let i = 1; i <= 200; i++) {
      const ty = spot.y - i * 2;
      if (ty < R + POCKET_INSET) break;
      if (!isSpotOccupied(spot.x, ty)) return { x: spot.x, y: ty };
    }
    // Search towards bottom (y increases) if top direction is full
    for (let i = 1; i <= 200; i++) {
      const ty = spot.y + i * 2;
      if (ty > H - R - POCKET_INSET) break;
      if (!isSpotOccupied(spot.x, ty)) return { x: spot.x, y: ty };
    }
    // Fallback
    return { x: spot.x + (Math.random()-0.5)*4, y: spot.y + (Math.random()-0.5)*4 };
  }

  function resolveTurn(){
    const clearPhases = ['CLEAR_YELLOW','CLEAR_GREEN','CLEAR_BROWN','CLEAR_BLUE','CLEAR_PINK','CLEAR_BLACK'];
    const targetMap = {
      'CLEAR_YELLOW':'yellow','CLEAR_GREEN':'green','CLEAR_BROWN':'brown',
      'CLEAR_BLUE':'blue','CLEAR_PINK':'pink','CLEAR_BLACK':'black'
    };

    const firstVal = foulValue[state.firstContact] || 4;
    const potVals = state.shotPots.map(b => b.value || foulValue[b.type] || 1);
    let foul = false;
    let foulVal = Math.max(4, firstVal, ...potVals, 4);

    const redPots = state.shotPots.filter(b => b.type === 'red');
    const colorPots = state.shotPots.filter(b => b.type !== 'red');

    const requiredClear = targetMap[state.gamePhase];

    const isValidFirst = () => {
      if (!state.firstContact) return false;
      if (state.gamePhase === 'RED') return state.firstContact === 'red';
      if (state.gamePhase === 'COLOUR') return state.firstContact !== 'red' && state.firstContact !== 'none';
      if (requiredClear) return state.firstContact === requiredClear;
      return false;
    };

    if (state.cuePotted) foul = true;

    if (!isValidFirst()) foul = true;

    if (state.gamePhase === 'RED'){
      // no red pot is NOT foul; any color pot is foul
      if (colorPots.length > 0) foul = true;
    } else if (state.gamePhase === 'COLOUR'){
      // multiple color pots or red pots are fouls; no pot is allowed
      if (colorPots.length > 1) foul = true;
      if (redPots.length > 0) foul = true;
    } else if (requiredClear){
      // clear phase requires pot
      if (colorPots.filter(b=>b.type===requiredClear).length !== 1) foul = true;
      if (redPots.length > 0) foul = true;
      if (colorPots.length > 1) foul = true;
      if (colorPots.length===1 && colorPots[0].type!==requiredClear) foul = true;
    }

    const currentScorer = state.turn;
    const opponent = currentScorer === 'player' ? 'ai' : 'player';

    if (foul){
      if (state.mode === 'ai') {
        state.scores[opponent] += foulVal;
      } else {
        // Practice mode: negative score for player
        state.scores.player -= foulVal; 
      }
    } else {
      let points = 0;
      if (state.gamePhase === 'RED'){
        if (redPots.length > 0){
          points = redPots.length * 1;
          state.redRemaining = Math.max(0, state.redRemaining - redPots.length);
          state.gamePhase = 'COLOUR';
        }
      } else if (state.gamePhase === 'COLOUR'){
        if (colorPots.length === 1){
          points = colorPots[0].value;
          state.gamePhase = (state.redRemaining === 0) ? clearPhases[0] : 'RED';
        } else {
          state.gamePhase = 'COLOUR';
        }
      } else if (requiredClear){
        points = colorPots[0].value;
        state.clearanceIndex++;
        if (state.clearanceIndex >= clearPhases.length){
          state.isComplete = true;
        } else {
          state.gamePhase = clearPhases[state.clearanceIndex];
        }
      }
      state.scores[currentScorer] += points;
    }

    if (state.gamePhase === 'COLOUR' && state.redRemaining > 0) {
      if (foul || state.shotPots.length === 0) {
        state.gamePhase = 'RED';
      }
    }

    // respot colors when needed (after balls fully stop)
    state.respotQueue = [];
    for (const b of colorPots){
      const inClear = requiredClear != null;
      const legalClearPot = inClear && !foul && b.type === requiredClear;
      if (!legalClearPot) state.respotQueue.push(b);
    }
    if (state.respotQueue.length){
      if (state.respotTimer) clearTimeout(state.respotTimer);
      state.respotTimer = setTimeout(() => {
        for (const b of state.respotQueue){
          const pos = getSafeRespotPosition(b);
          b.alive = true; b.x = pos.x; b.y = pos.y; b.vx=0; b.vy=0;
        }
        state.respotQueue = [];
        state.respotTimer = null;
      }, 180);
    }

    updateTarget();
    if (state.mode === 'ai' && !state.isComplete) {
      const validPot = !foul && state.shotPots.length > 0;
      if (!validPot) {
        state.turn = state.turn === 'player' ? 'ai' : 'player';
      }
    }

    if (state.isComplete){
      updateStatus('清枱完成');
    } else if (foul){
      updateStatus(`犯規 -${foulVal}`);
    } else {
      updateStatus();
    }

    state.firstContact = null;
    state.shotPots = [];
    state.cuePotted = false;

    if (state.turn === 'ai' && !state.isComplete) {
      state.aiming = true;
      state.phase = 'aim';
      state.inputState = 'ai_thinking';
      state.aiThinking = true;
      state.aiTimer = setTimeout(aiDecide, 1500);
    } else {
      state.aiming = true;
      state.phase = 'aim';
      state.inputState = 'aiming';
      state.aiThinking = false;
    }
  }

  function step(dt){
    let moving = false;
    const steps = Math.max(1, Math.ceil(dt / MAX_STEP));
    const subDt = dt / steps;

    for (let s=0; s<steps; s++){
      for (const b of state.balls){
        if (!b.alive) continue;
        b.x += b.vx * subDt; b.y += b.vy * subDt;
      }

      const buildPairs = () => {
        const pairs = [];
        for (let i=0;i<state.balls.length;i++){
          const a = state.balls[i];
          if (!a.alive) continue;
          for (let j=i+1;j<state.balls.length;j++){
            const b = state.balls[j];
            if (!b.alive) continue;
            const dx = b.x - a.x, dy = b.y - a.y;
            if (dx*dx + dy*dy < (2*R)*(2*R)) { pairs.push([a,b]); }
          }
        }
        return pairs;
      };

      let pairs = buildPairs();
      const iters = Math.min(ITERATIONS, 6); // cap iterations to prevent hanging

      // iterative solver (rebuild every 2 iters)
      for (let it=0; it<iters; it++){
        if (it % 2 === 0) pairs = buildPairs();
        for (const pair of pairs){
          resolvePair(pair[0], pair[1]);
        }
      }

      for (const b of state.balls){
        if (!b.alive) continue;
        resolveCushion(b);
        pocketCheck(b);
        b.vx *= Math.exp(-FRICTION_K * subDt);
        b.vy *= Math.exp(-FRICTION_K * subDt);
        if (Math.abs(b.vx) < STOP_EPS) b.vx = 0;
        if (Math.abs(b.vy) < STOP_EPS) b.vy = 0;
        if (b.vx || b.vy) moving = true;
      }
    }

    if (!moving && !state.isComplete){
      state.phase = 'resolve';
      resolveTurn();
    }
  }

  function render(){
    drawTable();
    drawBalls();
    drawAim();
  }

  function tick(t){
    if (state.lastTime == null) state.lastTime = t;
    const dt = Math.min(0.05, (t - state.lastTime) / 1000);
    state.lastTime = t;
    if (!state.aiming) step(dt);
    render();
    requestAnimationFrame(tick);
  }

  function shoot(power){
    if (!state.aiming) return;
    state.phase = 'shot';
    state.firstContact = null;
    state.shotPots = [];
    state.cuePotted = false;
    // scale to px/s since physics now uses dt
    state.cue.vx = Math.cos(state.aimAngle) * power * 24;
    state.cue.vy = Math.sin(state.aimAngle) * power * 24;

    state.aiming = false;
  }

  function setAimFromPointer(x,y){
    state.aimAngle = Math.atan2(y - state.cue.y, x - state.cue.x);
  }

  function confirmPlacement(){
    state.placingCue = false;
    state.positionsConfirmed = true;
    state.phase = 'aim';
    state.inputState = 'aiming';
    state.cueInHand = false;
    state.aiming = true;
    updateStatus('位置已確認');
  }

  function isPathClear(from, to, ignore=[]) {
    const dx = to.x - from.x, dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.1) return true;
    const ux = dx/dist, uy = dy/dist;
    for (const b of state.balls) {
       if (!b.alive || b.isCue) continue;
       if (ignore.includes(b)) continue;
       // Check point-line distance
       const vx = b.x - from.x, vy = b.y - from.y;
       const proj = vx*ux + vy*uy;
       if (proj <= 2 || proj >= dist - 2) continue; // allow slight overlap at ends
       const cx = from.x + proj*ux, cy = from.y + proj*uy;
       const dSq = (b.x-cx)**2 + (b.y-cy)**2;
       if (dSq < (2*R - 1)**2) return false; // slightly forgiving
    }
    return true;
  }

  function getBestShotForState() {
    // Identify valid targets
    const targets = state.balls.filter(b => {
      if (!b.alive || b.isCue) return false;
      if (state.gamePhase === 'RED') return b.type === 'red';
      if (state.gamePhase === 'COLOUR') return b.type !== 'red';
      const map = {'CLEAR_YELLOW':'yellow','CLEAR_GREEN':'green','CLEAR_BROWN':'brown',
        'CLEAR_BLUE':'blue','CLEAR_PINK':'pink','CLEAR_BLACK':'black'};
      const req = map[state.gamePhase];
      return req ? b.type === req : (b.type !== 'red');
    });

    const candidates = [];
    // Evaluate shots
    for (const t of targets) {
      for (const p of pockets) {
         const dx = p.x - t.x, dy = p.y - t.y;
         const dTP = Math.hypot(dx, dy);
         const nx = dx/dTP, ny = dy/dTP;
         const gx = t.x - nx * 2 * R, gy = t.y - ny * 2 * R;
         const cdx = gx - state.cue.x, cdy = gy - state.cue.y;
         const dCG = Math.hypot(cdx, cdy);
         const angle = Math.atan2(cdy, cdx);
         
         if (!isPathClear(t, p, [state.cue])) continue;
         if (!isPathClear(state.cue, {x:gx, y:gy}, [t])) continue;
         
         const dot = (cdx/dCG)*nx + (cdy/dCG)*ny;
         if (dot < 0.2) continue;
         
         const score = dot * 60 - (dCG + dTP) * 0.03;
         candidates.push({angle, dist:dCG, score});
      }
    }
    
    if (candidates.length) {
      candidates.sort((a,b) => b.score - a.score);
      return candidates[0];
    }
    
    if (targets.length) {
       const t = targets[Math.floor(Math.random()*targets.length)];
       return { angle: Math.atan2(t.y-state.cue.y, t.x-state.cue.x), dist: 100, score: -50 };
    }
    
    return { angle: Math.random()*Math.PI*2, dist: 50, score: -100 };
  }

  function aiDecide() {
    if (state.turn !== 'ai') return;
    
    if (state.placingCue) {
       // Smart Placement Logic
       const baulkX = W * 0.22;
       const dR = H * 0.125; 
       const midY = H * 0.5;
       
       const candidates = [
         {x: baulkX - 5, y: midY},
         {x: baulkX - dR + R + 2, y: midY},
         {x: baulkX - 5, y: midY - dR/2},
         {x: baulkX - 5, y: midY + dR/2},
         {x: baulkX - dR*0.6, y: midY - dR*0.6},
         {x: baulkX - dR*0.6, y: midY + dR*0.6},
         {x: baulkX - 2, y: midY - dR + 5},
         {x: baulkX - 2, y: midY + dR - 5}
       ];

       let bestPlace = null;
       let maxScore = -Infinity;
       const originalPos = {x:state.cue.x, y:state.cue.y};

       for (const pos of candidates) {
          let blocked = false;
          for (const b of state.balls) {
             if (!b.alive || b.isCue) continue;
             const dx = b.x - pos.x, dy = b.y - pos.y;
             if (dx*dx + dy*dy < 4*R*R) { blocked = true; break; }
          }
          if (blocked) continue;

          state.cue.x = pos.x; state.cue.y = pos.y;
          const shot = getBestShotForState();
          if (shot.score > maxScore) {
             maxScore = shot.score;
             bestPlace = pos;
          }
       }

       if (bestPlace) {
          state.cue.x = bestPlace.x; state.cue.y = bestPlace.y;
       } else {
          state.cue.x = originalPos.x; state.cue.y = originalPos.y;
       }
       
       state.placingCue = false;
       state.positionsConfirmed = true;
    }

    const best = getBestShotForState();

    const jitters = { 'easy': 0.08, 'normal': 0.025, 'hard': 0.005 };
    const jitter = jitters[state.difficulty] || 0.025;
    state.aimAngle = best.angle + (Math.random()-0.5) * 2 * jitter;
    
    let power = 35 + best.dist * 0.16;
    power = Math.min(90, Math.max(25, power));
    state.pullPower = power;
    
    state.shotTimer = setTimeout(() => {
       if (state.turn === 'ai') {
         shoot(power);
         state.pullPower = 0;
         state.aiThinking = false;
         state.shotTimer = null;
       }
    }, 1200 + Math.random()*600);
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (state.turn === 'ai' || state.aiThinking) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);

    // placing cue in D area (or anywhere if cue in hand)
    if (state.placingCue){
      // drag to place cue within D (or anywhere if in hand)
      const inBounds = (x >= R && x <= W-R && y >= R && y <= H-R);
      if (state.cueInHand && inBounds){
        state.cue.x = x; state.cue.y = y;
        state.placingDrag = true;
        return;
      }
      const baulkX = W*0.25;
      const dR = H*0.125;
      const dx = x - baulkX;
      const dy = y - H*0.5;
      if (dx*dx + dy*dy <= dR*dR && x >= baulkX - dR){
        state.cue.x = x; state.cue.y = y;
        state.placingDrag = true;
      }
      return;
    }

    if (state.inputState !== 'aiming') return;

    // first pull confirms placement
    if (!state.positionsConfirmed){
      confirmPlacement();
    }

    // enter powering (direction locked)
    state.inputState = 'powering';
    state.dragging = true;
    state.pullStart = {x,y};
    state.pullPower = 0;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (state.turn === 'ai' || state.aiThinking) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);

    if (state.placingCue && state.placingDrag){
      if (state.cueInHand){
        if (x >= R && x <= W-R && y >= R && y <= H-R){
          state.cue.x = x; state.cue.y = y;
        }
      } else {
        const baulkX = W*0.25;
        const dR = H*0.125;
        const dx = x - baulkX;
        const dy = y - H*0.5;
        if (dx*dx + dy*dy <= dR*dR && x >= baulkX - dR){
          state.cue.x = x; state.cue.y = y;
        }
      }
      return;
    }

    if (state.inputState === 'aiming'){
      setAimFromPointer(x,y);
      return;
    }

    if (state.inputState !== 'powering' || !state.dragging) {
      if (state.inputState === 'powering') state.inputState = 'aiming';
      return;
    }

    // pull back to build power (direction locked)
    const dx = x - state.pullStart.x;
    const dy = y - state.pullStart.y;
    const proj = -(dx * Math.cos(state.aimAngle) + dy * Math.sin(state.aimAngle));
    state.pullPower = Math.min(90, Math.max(0, proj) * 1.4);
  });
  window.addEventListener('pointerup', () => {
    if (state.turn === 'ai' || state.aiThinking) return;
    if (state.placingDrag){
      state.placingDrag = false;
    }
    if (!state.dragging) return;
    state.dragging = false;
    if (!state.positionsConfirmed || state.inputState !== 'powering'){
      state.pullPower = 0;
      return;
    }
    if (state.pullPower > 2){
      state.placingCue = false;
      shoot(state.pullPower);
      state.inputState = 'idle';
    } else {
      state.aiming = true;
      state.inputState = 'aiming';
      state.phase = 'aim';
    }
    state.pullPower = 0;
  });


  aimBtn.addEventListener('click', () => {
    if (state.placingCue){
      confirmPlacement();
    }
    state.aiming = true;
  });
  startBtn.addEventListener('click', () => {
    reset();
    state.aiming = true;
  });
  restartBtn2.addEventListener('click', () => {
    reset();
    state.aiming = true;
  });

  // Spin Control
  function updateSpinMarker(){
    const mx = (state.spin.x + 1) * 50;
    const my = (state.spin.y + 1) * 50;
    spinMarker.style.left = `${mx}%`;
    spinMarker.style.top = `${my}%`;
  }

  let spinDragging = false;
  function setSpinFromPointer(e){
    const rect = spinControl.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    let y = (e.clientY - rect.top) / rect.height;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    state.spin.x = (x - 0.5) * 2;
    state.spin.y = (y - 0.5) * 2;
    const d = Math.hypot(state.spin.x, state.spin.y);
    if (d > 1){
      state.spin.x /= d;
      state.spin.y /= d;
    }
    updateSpinMarker();
  }

  spinControl.addEventListener('pointerdown', (e) => {
    spinDragging = true;
    spinControl.setPointerCapture(e.pointerId);
    setSpinFromPointer(e);
  });
  spinControl.addEventListener('pointermove', (e) => {
    if (!spinDragging) return;
    setSpinFromPointer(e);
  });
  spinControl.addEventListener('pointerup', (e) => {
    spinDragging = false;
  });
  
  resetSpinBtn.addEventListener('click', () => {
    state.spin.x = 0;
    state.spin.y = 0;
    updateSpinMarker();
  });


  reset();
  tick();
})();
