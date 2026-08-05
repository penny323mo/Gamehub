// 地圖係數據，唔係一串 `addStaticBox`。
//
// 呢個檔淨係講**個場係咩形狀**：一堆常數，加一個由常數生出所有靜態障礙嘅
// 函數。佢**唔 import three.js 亦唔 import cannon-es**——擺盒嗰個動作由外面
// 傳入嚟。遊戲傳入嘅係「開一個 CANNON body」，而測試傳入嘅可以係「淨係記低
// 呢個盒」，即係喺 Node 度就砌得返成個碰撞世界。
//
// 點解要拆出嚟：喺瀏覽器度量物理一直太貴（軟件光柵化三幀，角色一秒行半米），
// 所以「敵人追唔追得到你」呢類問題一直答唔到——量到嘅係機械人蠢定係地圖爛，
// 分唔開。個場一日喺 React effect 入面，就一日淨係跑得起瀏覽器。
//
// 出面唔可以再寫多一次呢啲數。ADR-165／166 兩輪嘅缺陷全部係同一句話：
// 同一件事寫咗兩次。

export type AddBox = (
  position: [number, number, number],
  halfExtents: [number, number, number],
  rotationY?: number,
  tag?: string,
) => void;

export const ARENA_RADIUS = 22.35;
export const BOSS_SPAWN_Z = -48;

// 玩家出生點。
//
// 本來寫死 `z = 17`，即係離南面環牆得 5.35 米——而鏡頭要企喺玩家後面 8.3 米，
// 加埋牆嘅 0.42 半厚同 1.35 遮擋 pad 就係 10.07 米。結果鏡頭一開波就撞牆，
// 被夾到遮擋邏輯嘅 2.4 米下限：**實測四個尺寸入場第一眼都係 2.73–2.84 米，
// 設計距離嘅三分一**（Penny 落手玩第一句就係「一入去視覺咁近」）。
//
// 所以呢個數唔應該係手寫嘅：佢係「場邊減鏡頭要嘅位」。
export const CAMERA_BACK = 8.3;
export const CAMERA_CLEARANCE = CAMERA_BACK + 0.42 + 1.35;
export const PLAYER_SPAWN_Z = Math.round((ARENA_RADIUS - CAMERA_CLEARANCE) * 10) / 10;

// 霧門：清晒三關之前攔住 boss 場嘅暫時牆。
export const FOG_GATE = {
  pos: [0, 2.5, -ARENA_RADIUS + 0.6] as [number, number, number],
  half: [5.6, 2.5, 0.36] as [number, number, number],
};

export const buildMap = (addStaticBox: AddBox) => {
  // ---------- 地圖形狀 ----------
  //
  // 本來成隻遊戲得一個半徑 22.35 嘅圓場，而所有嘢都排喺 z = +17 行到
  // z = -15 嗰條走廊入面（出生、兩波雜兵、boss 全部喺 x ≈ 0 附近）。
  // 即係一個 1569 平方米嘅場，真正用到嘅大約係 12 米闊嗰條，四分三嘅
  // 地你行得到但永遠冇理由去。
  //
  // 所以擴張唔係「將個圓車大啲」——空地唔係地圖。西面開一道門，過條橋
  // 去到第二個庭院，嗰度有自己嘅目標。橋同門同塔用嘅係倉入面已經有、
  // 但由頭到尾冇擺出嚟過嘅三個模型（bridge-straight-pillar、gate、
  // tower-square-top-roof-high-windows）——佢哋一直都有 ship 畀玩家落載，
  // 只係一格都冇出現過。
  //
  // 個形狀寫成數據，唔係一堆 addStaticBox。牆係由呢幾個數生出嚟嘅，
  // 所以「牆喺邊」同「地圖係點」永遠唔會各講各嘅。
  const ARENA = { r: ARENA_RADIUS };
  const GATE = { angle: Math.PI, halfWidth: 0.25 };   // 西面開口（弧度）
  // 走廊闊度：鏡頭喺玩家後面八米，走廊太窄成半幅畫面都係牆（實測 3.2 米
  // 半闊嗰陣就係咁）。5.6 米半闊 = 11.2 米通道，鏡頭有位退。
  // 同 `HALL` 一樣：條橋由圓場西門去到**庭院東門**，唔係去到庭院入面。
  // `x0` 本來寫死 -47，而庭院東邊喺 `COURT.cx + COURT.r = -43`——即係兩條欄
  // 杆插咗入庭院四米。捉到佢嘅唔係我，係「場入面唔應該有唔屬於佢自己嗰道環
  // 牆嘅牆」嗰條不變量，寫嚟守北面嗰單，一跑就順手捉埋西面。
  const COURT = { cx: -60, cz: 0, r: 17 };
  const BRIDGE = { x0: COURT.cx + COURT.r, x1: -ARENA.r, halfWidth: 5.6 };
  // 北面聖所：boss 自己嘅場。本來 boss 企喺 z = -15，即係同兩波雜兵**同
  // 一個圓場**入面，霧門只係喺 z = -9 攔住個北邊三分一——深度得十三米，
  // 而 boss 一撲就六米幾。霧門開咗之後通去嘅唔係一個新地方，係同一塊地。
  const NORTH = { cz: BOSS_SPAWN_Z, r: 20 };
  // 條通道由圓場北門去到聖所南門，**唔係去到 boss 腳下**。
  //
  // 本來 `z0` 借咗 `BOSS_SPAWN_Z` 嚟用——一個數兼兩份工，而嗰兩份工冇關係：
  // boss 企喺聖所正中 (0, -48)，而聖所南門喺 `NORTH.cz + NORTH.r = -28`。
  // 結果兩幅走廊牆由 -28 一路插入場中二十米，**將 boss 場南半邊界開兩份**。
  // 實測：boss 第二階段嘅撲擊組合入面 **56.6% 中間有嘢擋住**，而例子全部係
  // 由場東邊撲向中線嗰啲——擋住佢哋嘅就係呢兩幅唔應該喺度嘅牆。
  const HALL = { z0: NORTH.cz + NORTH.r, z1: -ARENA.r, halfWidth: 5.6 };
  // 牆高同 `wall.glb` 一樣 5.2 米：collider 同裝飾模型唔應該一高一矮。
  const WALL_Y = 2.6, WALL_H = 2.6, WALL_T = 0.42;

  // 圓形牆，但要留返個門口。留門嗰段唔可以靠「跳過一格」——一格嘅闊度
  // 係跟分段數走嘅，改分段數個門口就會自己變大變細。所以用角度界定。
  const ringWall = (cx: number, cz: number, radius: number, segments: number,
                    skips: Array<{ angle: number; halfWidth: number }> = []) => {
    const half = radius * Math.tan(Math.PI / segments) + 0.18;
    for (let index = 0; index < segments; index += 1) {
      const angle = (index / segments) * Math.PI * 2;
      let skipped = false;
      for (const skip of skips) {
        let d = Math.abs(angle - skip.angle) % (Math.PI * 2);
        if (d > Math.PI) d = Math.PI * 2 - d;
        if (d < skip.halfWidth) { skipped = true; break; }
      }
      if (skipped) continue;
      addStaticBox(
        [cx + Math.cos(angle) * radius, WALL_Y, cz + Math.sin(angle) * radius],
        [half, WALL_H, WALL_T],
        Math.PI / 2 - angle,
        "wall",
      );
    }
  };
  // 圓場有兩個開口：西面去走廊，北面去聖所。
  // 庭院同聖所各自再開一個口，畀一條 L 形捷徑接埋——**唔想個地圖係一棵
  // 樹**。本來西面庭院係死路：打完第三關要原路行返六十米出返圓場，再向北
  // 行四十八米先入到 boss 場，即係成一百二十米純粹重行。接埋之後成個地圖
  // 係一個環，行過嘅路唔使再行第二次。
  const NORTH_GATE = { angle: -Math.PI / 2, halfWidth: 0.25 };
  const COURT_NORTH = { angle: -Math.PI / 2, halfWidth: 0.24 };   // 庭院北口
  const NORTH_WEST = { angle: Math.PI, halfWidth: 0.24 };         // 聖所西口
  ringWall(0, 0, ARENA.r, 32, [GATE, NORTH_GATE]);
  ringWall(COURT.cx, COURT.cz, COURT.r, 28, [{ angle: 0, halfWidth: 0.19 }, COURT_NORTH]);
  ringWall(0, NORTH.cz, NORTH.r, 30, [{ angle: Math.PI / 2, halfWidth: 0.22 }, NORTH_WEST]);

  // L 形捷徑：由庭院北口向北去到 z = -48，再向東入聖所西口。
  // 闊度同其他通道共用同一個數，唔另外寫。
  const LINK = { halfWidth: BRIDGE.halfWidth, x: COURT.cx, z: NORTH.cz };
  // 四段牆嘅起訖點。擺 collider 同鋪裝飾模型用同一組數——`鋪一排()` 喺下面
  // 讀返呢啲，所以「牆喺邊」同「牆望落喺邊」冇可能各講各嘅。
  const LINK_RUN = {
    西: LINK.x - LINK.halfWidth, 東: LINK.x + LINK.halfWidth,
    北: LINK.z + LINK.halfWidth, 南: LINK.z - LINK.halfWidth,
    起: COURT.cz - COURT.r + 1,                       // 由庭院北口開始
    尾: -NORTH.r,                                     // 到聖所西口
  };
  {
    // 一段軸對齊嘅牆，由 (x0,z0) 去到 (x1,z1)。用明確嘅起訖點，唔用
    // 「中心加半長」——第一版用對稱寫法，結果**兩段牆各自穿過對方條
    // 走廊**（橫嗰段嘅北牆由 x=-60 一路行到 -20，啱好封死咗直嗰段個口；
    // 直嗰段嘅東牆由 z=-11 行到 -54，啱好封死咗橫嗰段）。L 形拐角要
    // 兩邊都喺角位收口，唔可以行過龍。
    const 牆 = (x0: number, z0: number, x1: number, z1: number) =>
      addStaticBox(
        [(x0 + x1) / 2, WALL_Y, (z0 + z1) / 2],
        [Math.abs(x1 - x0) / 2 + WALL_T, WALL_H, Math.abs(z1 - z0) / 2 + WALL_T],
        0,
        "wall",
      );
    const { 西, 東, 北, 南, 起, 尾 } = LINK_RUN;
    牆(西, 起, 西, 南);            // 直段西牆，去到拐角外側
    牆(東, 起, 東, 北);            // 直段東牆，喺拐角內側收口
    牆(西, 南, 尾, 南);            // 橫段南牆，由拐角外側向東
    牆(東, 北, 尾, 北);            // 橫段北牆，由拐角內側向東
  }

  // 橋兩邊嘅欄杆。冇欄杆嘅話玩家會由橋邊行出去，然後企喺半空——
  // 呢度冇「跌落去」呢回事，地板係一塊無限平面。
  const bridgeLength = BRIDGE.x1 - BRIDGE.x0;
  const bridgeMidX = (BRIDGE.x0 + BRIDGE.x1) / 2;
  for (const side of [-1, 1]) {
    addStaticBox(
      [bridgeMidX, WALL_Y, side * BRIDGE.halfWidth],
      [bridgeLength / 2, WALL_H, WALL_T],
      0,
      "wall",
    );
  }
  // 北面通道嘅兩邊。同走廊一樣，闊度由同一個數出。
  const hallLength = HALL.z1 - HALL.z0;
  const hallMidZ = (HALL.z0 + HALL.z1) / 2;
  for (const side of [-1, 1]) {
    addStaticBox(
      [side * HALL.halfWidth, WALL_Y, hallMidZ],
      [WALL_T, WALL_H, hallLength / 2],
      0,
      "wall",
    );
  }


  return { ARENA, GATE, BRIDGE, COURT, NORTH, HALL, LINK, LINK_RUN, WALL_Y, WALL_H, WALL_T };
};
