// 車輛動力學：單軌（bicycle）模型 + 輪胎滑移角 + 摩擦圓。
//
// 點解唔用返之前嗰個「速度 + 側向抓地」簡化版：嗰種模型冇「車頭指向」同
// 「行進方向」嘅分別，所以根本做唔到漂移——冇滑移角就冇反打（countersteer），
// 玩家想控制車尾都無從入手。漂移遊戲嘅核心就係三樣嘢：
//
//   1. 車有偏航角速度（yaw rate），車頭可以同行進方向唔一致
//   2. 每條軸各自計滑移角 α，輪胎側向力係 α 嘅非線性函數，有峰值亦有上限
//   3. 抓地力有總量上限（摩擦圓）：踩油搶咗縱向嘅份額，側向就剩得少
//
// 有咗呢三樣，入彎甩尾、反打救車、油門控制角度全部自然發生，唔使特別寫。

import * as THREE from 'three';

export const CFG = {
    mass: 1180,          // kg
    inertia: 1900,       // 偏航轉動慣量 kg·m²（愈細愈靈活／愈易打圈）
    wheelBaseF: 1.35,    // 前軸距重心
    wheelBaseR: 1.45,    // 後軸距重心（後軸長少少＝直路穩定啲）

    // 低速額外扭力改善起步／慢彎出彎；速度上升後漸變返原本穩定輸出，
    // 避免高速巡航同反打因全段加力而失控。traction clamp 仍限制落地力量。
    // 由普通巡航調到「街機跑車」：起步要有推背感，中高速仍要有持續推進，
    // 但上限仍由輪胎摩擦圓、空氣阻力同賽道路線共同決定，唔做無限加速。
    launchForce: 12800,
    engineForce: 10000,
    brakeForce: 20000,   // 制動「需求」，唔係實際落地力——落地幾多由摩擦圓決定
    reverseForce: 6000,

    // 制動前後分配。真車典型 60–70% 落前軸（煞車時載荷轉去前面，前輪
    // 先食得起）。之前呢個模型完全冇分配：制動力全部記帳落後軸嘅摩擦圓，
    // 而前軸嘅側向抓地一分錢都冇扣——即係「前輪滿抓、後輪冇抓」，
    // 直線踩煞都會打圈（實測同一擾動：滑行偏 4°，煞車轉 229°）。
    brakeSplitF: 0.62,
    // ABS 唔係「用盡抓地」——真 ABS 係鎖定喺約 10–15% 滑移率，即係峰值
    // 之下，特登留返側向抓地畀你轉軚。用 0.95 就等於一腳踩死：兩條軸都
    // 淨返三成側向力，架車照直衝兼一有擾動就轉。0.65 換返嚟：減速度約
    // 1.0 g（真車水準），而側向仲有 sqrt(1-0.65²) ≈ 76% 用。
    absCap: 0.9,
    absSteerReserve: 0.55, // 打緊軚就大幅讓返畀側向——即係「減速入彎」揸得順
    // 制動偏前。真車嘅比例閥／EBD 特登畀前軸多過「理想分配」，因為後輪
    // 一鎖就即刻轉圈，前輪鎖只係推頭——安全好多。呢度做同一件事：後軸
    // 最多只用自己摩擦圓嘅 55%，側向仲有 sqrt(1-0.36²) ≈ 93% 用得。
    // 冇呢樣嘅話，煞車時前輪最大側向力係後輪 2.4 倍（載荷差），
    // 隨便一個轉向擾動都會滾成打圈。
    absRearBias: 0.35,
    brakeFrontShare: 0.86, // 前軸食幾多制動需求（餘數先落後軸）
    lockLong: 0.85,      // 鎖死之後係滑動摩擦，比峰值低
    lockLateral: 0.12,   // 鎖死嘅輪幾乎produce唔到側向力，所以會直衝／甩尾
    maxSpeed: 68,        // m/s 上限（約 245 km/h，留返極速餘量）
    dragCoef: 2.4,       // 空氣阻力；配合新引擎輸出，直路約 210 km/h
    rollResist: 220,     // 滾動阻力

    steerMax: 0.62,      // 最大前輪轉角（弧度，約 35°）——低速泊車先用得晒
    // 高速收窄轉角嘅程度。呢個數要夠大：實測 33 m/s 打 2.2° 前輪角就已經
    // 食到 1g（定圓半徑 111 米）。舊值 0.55 喺同一速度容許 22°，即係玩家
    // 隨手一撳就過咗輪胎峰值——車頭反而冇力，跟住車尾自己盪出去打圈。
    // 試過由 2.4 收到 1.5（半軚 t45 快 0.2–0.3 秒），但同一個改動將 35° 起手
    // 嘅過衝由 68° 推到 71–75°，衝爆 70° 個 gate。呢個數留返 2.4，轉向幅度
    // 交返畀入彎輔助（見 turnInBoost）——嗰個唔會餵大甩尾。
    steerSpeedDrop: 2.4,
    // 軚盤打得幾快（每秒）。5.5 即係約 0.18 秒先到位——喺手機上「快撳
    // 一下手煞 + 打軚」根本未打到軚就已經放咗手，實測 0.33 秒嘅快撳
    // 得 6° 起手。7.6 之後半秒起手由 18° 升到 20°，而純打軚極限維持 11°
    // （即係唔會因為軚快咗而變得易打圈）。
    steerRate: 7.6,
    assistCountersteer: 0.9, // 放開手煞後輕推反打，降低手機細軚輸入嘅救車門檻
    assistMaxSteer: 0.38,
    assistYawDamp: 2.2,  // 大角度開始時穩住偏航，唔會細失誤即刻打圈
    assistTractionCut: 0.22,
    assistDampFloor: 0.62,   // 反打期間仍然保留幾多偏航阻尼（見上面註解）

    // 輪胎（Pacejka 簡化）：F = D·sin(C·atan(B·α))
    //
    // B 決定峰值出喺幾多滑移角（α ≈ 1.6/B）。8.2 即係 11° 就到頂，之後
    // 一路跌——所以 30–40° 嗰段冇力扶返架車，一甩就衝到 78° 再一下彈返 0：
    // 雙穩態，中間冇平衡點，即係點揸都維持唔到一個中角度漂移。
    // 5.0 將峰值推到約 18°（真漂移胎就係呢種闊峰值）。實測：甩尾過衝由
    // 78° 收到 56°，唔再彈返 0 而係停喺一個淺角度；純打軚極限由 6.7° 升到
    // 約 11°（車肯轉頭啲，玩落生動啲）；AI 圈速幾乎唔變（30.9 → 31.1 秒）。
    tyreB: 5.0,
    tyreC: 1.55,
    gripFront: 1.45,     // 摩擦係數
    gripRear: 1.7,       // 後 > 前 ＝ 直路穩定；甩尾靠手煞同摩擦圓，唔係靠後輪本身鬆
    handbrakeGrip: 0.35, // 手煞期間後輪抓地剩返幾多（太低會一拉就打圈、救唔返）
    yawDamp: 2.6,        // 偏航阻尼：控制「甩到幾盡」。太細直接打圈，太大就甩唔郁

    // 加減速嘅前後載荷轉移比例＝重心高 ÷ 軸距。0.19 對應重心高約 0.53 米，
    // 係一部貼地跑車嘅真實數字。
    //
    // 之前用 0.28（即係當重心成 0.78 米高）。喺舊模型度佢做到「肯轉頭」嘅
    // 手感，但代價係煞車時後軸負荷跌到 476 N——即係後輪離緊地。後輪冇負荷
    // 就冇側向力（實測 -250 N 對前輪 -5000 N），前輪一有側力就直接將架車
    // 扭埋去：Penny 報嘅「直線踩煞都會打橫」就係咁嚟。
    loadTransfer: 0.19,
    // 漂移推進：呢個係明確嘅街機層，唔係物理層。
    //
    // 物理上，橫住滑就係會刮走速度：實測踩住全油漂移，車身推力有成
    // 11,500 N，但車頭同行進方向差 50–87°，force 全部用咗嚟轉向，速度
    // 由 118 跌到 40 km/h。真實，但令「漂移」喺一隻漂移計分遊戲入面
    // 變成純粹嘅懲罰——冇人會想用。
    //
    // 所以喺輔助層補返一部分：踩住油、真係喺漂移角度先有，落草冇，
    // 手煞起手嗰陣冇（唔可以用嚟無限加速）。方向係沿住「行進方向」，
    // 唔係車頭——即係佢淨係抵消側滑損失，唔會變成一個加速外掛。
    // 用「退返幾多成刮走嘅速度」而唔係固定推力。固定推力有個致命問題：
    // 佢同實際損失冇關係，實測維持 50° 漂移最後去到 148 km/h，快過直路
    // 巡航 122——漂移變咗加速外掛，成隻遊戲反轉。退款制自我封頂：
    // 冇刮走就冇得退，所以漂移永遠唔會快過直路，但唔會再係純懲罰。
    driftRefund: 0.7,
    driftPushMinSlip: 0.3,   // 約 17°，即係真係甩緊尾先計

    // 動力過彎（power oversteer）：踩住油喺漂移角度，後軸再鬆一截。
    // 呢個係維持漂移嘅唯一來源——實測未加之前，放咗手煞之後就算踩住全油，
    // 26° 嘅漂移 0.8 秒就自己收返，而且玩家點反打都改變唔到（反打 gain 由
    // 0.4 掃到 2.0，維持時間全部 0.80–0.81 秒）。
    //
    // 0.38 配 27°–46° 收窗。之前用 0.30 係因為舊嗰條速度規矩：漂移速度要
    // 保住「直路開足 12 秒嘅極速」七成。嗰個比較本身係錯嘅——冇人會用極速
    // 過彎。改成同「一樣行車半徑、用抓地過彎」比之後，兩組數完全掉轉：
    //   0.30：維持 1.7 秒、半徑 147 米、106 km/h，同半徑抓地速度 153，得 69%
    //   0.38：維持 13.8 秒、半徑 52 米、85 km/h，同半徑抓地速度 91，有 94%
    // 即係放鬆版唔單止甩得耐，仲係一條窄三倍、而且幾乎唔蝕速度嘅過彎線
    // ——真正嘅「漂移過彎」。詳見 ADR-085。
    driftPowerLo: 0.26,      // 15°：同 drifting 門檻一樣，計分開始嗰刻先計
    driftPower: 0.38,        // 後軸抓地鬆幾多
    driftPowerHi: 0.48,      // 27°：過咗呢度開始收
    driftPowerOut: 0.80,     // 46°：完全收晒，唔畀漂移自己推到打圈
    driftPowerThrottle: 0.5, // 要踩過呢個油門先計

    // 入彎輔助（見 update 入面 frontGrip）。
    // 0.7 配一個窄窗（8°）：實測 t45（打軚到車頭轉 45° 要幾秒）半軚
    // 14/22/30 m/s 由 1.91/2.02/2.17 收到 1.25/1.38/1.70，全軚 30 由 1.66
    // 到 1.49。同時 35° 起手嘅過衝維持 68°（上限 70）、漂移速度維持直路嘅
    // 76%（下限 70%）、快撳手煞入彎維持 34° —— 三個都同加之前一模一樣。
    // 窄窗係關鍵：8° 已經收晒，所以佢淨係幫「貼住路面轉頭」，一開始滑就
    // 完全冇聲音，餵唔到甩尾。試過闊窗（15°）配 0.3，轉頭冇咁快而漂移
    // 速度反而跌到 72%。
    turnInBoost: 0.7,        // 前軸抓地最多加幾多
    turnInSteer: 0.75,       // 打到幾大軚就出足
    turnInMaxSlip: 0.14,     // 8°：一開始滑就收晒，唔會加劇失控
    offroadGrip: 0.45,   // 落草抓地
    offroadDrag: 2600,
    wallBounce: 0.4,
    wallScrape: 0.97,    // 刮牆時沿牆方向剩幾多速度（每個接觸幀）
    wallAlign: 0.25,     // 接觸嗰陣車頭拉向沿牆方向幾多（0 = 唔拉）
    // 打完圈救返車（見 Car.unspin）。AI 有救車狀態機（ADR-065），玩家一直
    // 冇——實測打橫 150° 之後，一個簡易模式玩家淨係識打軚，25 秒都扭唔返，
    // 最後變成倒住沿賽道行 -20 km/h。
    unspinSpeed: 5,      // m/s：慢過呢個先會幫
    unspinAngle: 1.4,    // 80°：指錯咁多先算打圈，正常揸車撞唔到
    unspinExit: 0.44,    // 25°：扭到呢度先交返玩家（同 ADR-065 一樣要滯後）
    unspinRate: 1.5,     // rad/s：扭返個方向嘅速度上限
    wallDriftCooldown: 1.2,  // 撞完欄幾耐之內唔出動力過彎（秒）
    bodyPitchLimit: 0.028,    // 全車一體模型只容許約 1.6° 前後俯仰
    bodyPitchRate: 8.5,       // 懸掛回正速度；唔追住每一幀震
    bodyPitchLift: 3.4,       // 俯仰時抬高 render root，補回 rigid 車模嘅接地包絡
};

const G = 9.81;

export class Car {
    constructor(model) {
        this.root = new THREE.Group();
        this.root.add(model);
        this.model = model;

        this.pos = new THREE.Vector3();
        this.vel = new THREE.Vector3();   // 世界座標速度
        this.yaw = 0;                     // 車頭方向（弧度，0 = +z）
        this.yawRate = 0;                 // 偏航角速度
        this.steer = 0;                   // 實際前輪角（平滑過渡）

        this.slipAngle = 0;               // 車身滑移角（行進方向 vs 車頭）
        this.drifting = false;
        this.offroad = false;
        this.wallHit = false;
        this.wallImpact = 0;
        this.bodyRoll = 0;
        this.bodyPitch = 0;
        this.longAccel = 0;             // m/s²，畀 render layer 做載荷／推背感回饋
        this.lateralAccel = 0;
        this.lockFront = false;
        this.lockRear = false;
        this.unspinning = false;
        this.wallCooldown = 0;
        // update() 每幀都要試探下一個位置。重用 scratch vector，避免一場
        // 比賽累積大量短命 Vector3，令手機 GC 喺高速駕駛時插入長幀。
        this._nextPos = new THREE.Vector3();
        // 預設定位係爽快街機，而唔係硬核模擬。保留成員方便物理因果測試，
        // 遊戲 UI 唔要求玩家先理解一堆電子輔助設定先可以揸得順。
        this.arcadeAssist = true;
        // ABS：預設開。關咗就會出現真實嘅鎖死行為（前輪鎖推頭、後輪鎖甩尾）。
        this.abs = true;
    }

    reset(pos, dir) {
        this.pos.copy(pos); this.pos.y = 0;
        this.vel.set(0, 0, 0);
        this.yaw = Math.atan2(dir.x, dir.z);
        this.yawRate = 0;
        this.steer = 0;
        this.slipAngle = 0;
        this.drifting = false;
        this.wallHit = false;
        this.wallImpact = 0;
        this.wallCooldown = 0;
        this.bodyPitch = 0;
        this.longAccel = 0;
        this.lateralAccel = 0;
        this.#sync();
    }

    get speed() { return this.vel.length(); }
    get kmh() { return Math.round(this.speed * 3.6); }
    get forwardSpeed() {
        return this.vel.x * Math.sin(this.yaw) + this.vel.z * Math.cos(this.yaw);
    }

    // input: { throttle: -1..1, steer: -1..1, handbrake: bool }
    update(dt, input, track) {
        const fwdX = Math.sin(this.yaw), fwdZ = Math.cos(this.yaw);
        // 側向軸 = 車身 local +x。喺 three.js 右手座標入面，一架向住 +z 嘅車，
        // 佢嘅 local +x 係指住畫面「左」邊（鏡頭喺車後望 +z，畫面右 = 世界 -x）。
        // 成套輪胎／力矩數學就用呢條軸，所以正力＝推向畫面左。
        const latX = fwdZ, latZ = -fwdX;

        // 車身座標速度
        const vLong = this.vel.x * fwdX + this.vel.z * fwdZ;
        const vLat = this.vel.x * latX + this.vel.z * latZ;
        const speed = Math.hypot(vLong, vLat);
        const assists = this.arcadeAssist && input.assist !== false;
        this.wallCooldown = Math.max(0, this.wallCooldown - dt);

        // ---- 轉向：目標角度隨速度收窄，再平滑過渡（軚盤唔會瞬間到底）----
        const speedFactor = 1 / (1 + Math.max(0, speed) * CFG.steerSpeedDrop / 30);
        // input.steer > 0 = 玩家想向畫面右邊；畫面右 = local -x，所以要負號。
        // 唔加呢個負號嘅話，撳右會向左行——同 Penny 早前報嘅「轉向反方向」
        // 係同一個病，只不過嗰次係模型掉轉，今次係物理側向軸嘅符號。
        // 玩家拉手煞時完全唔干預，等佢主動拋車尾；一放手就按上一幀滑移角
        // 輕量反打。輔助量有上限，玩家仍然決定路線，唔會變成自動駕駛。
        let steerCommand = input.steer;
        const assistSlip = Math.abs(this.slipAngle);
        // 玩家已經喺度反打＝佢係特登甩尾，唔係失手。呢個時候輔助要讓路，
        // 否則就變成「機器同玩家爭軚」：實測輔助開嘅時候一個 40° 起手嘅
        // 漂移 1.6 秒就被拉返直，玩家做乜都維持唔到——一隻漂移計分遊戲
        // 唔可以係咁。反打得愈實，輔助愈細；完全冇反打就照救足。
        const counterInput = this.slipAngle === 0 ? 0
            : Math.max(0, Math.min(1, -input.steer * Math.sign(this.slipAngle)));
        const assistScale = 1 - counterInput;
        if (assists && assistScale > 0.02 && !input.handbrake && speed > 8 && assistSlip > 0.08) {
            const counter = Math.min(
                CFG.assistMaxSteer,
                (assistSlip - 0.08) * CFG.assistCountersteer,
            ) * assistScale;
            steerCommand -= Math.sign(this.slipAngle) * counter;
        }
        steerCommand = Math.max(-1, Math.min(1, steerCommand));
        const target = -steerCommand * CFG.steerMax * speedFactor;
        this.steer += (target - this.steer) * Math.min(1, dt * CFG.steerRate);

        this.offroad = !track.isDrivable(this.pos.x, this.pos.z);
        const surface = this.offroad ? CFG.offroadGrip : 1;
        // 入彎輔助：打得夠大軚、車身仲係貼住（未漂移）、又冇踩煞嗰陣，
        // 前軸抓地加一截。純粹提升「肯唔肯轉頭」，唔會碰到摩擦極限本身
        // 嗰兩個危險場景——減速入彎同漂移中——所以唔會令架車變易失控。
        // （試過直接將 gripFront 由 1.45 升到 1.72：轉頭快好多，但煞車入彎
        // 由 19° 變 61°、手煞起手滑到 87°、AI 撞欄 493 幀。條件式先安全。）
        let frontGrip = CFG.gripFront * surface;
        if (assists && input.throttle >= 0 && !input.handbrake
            && assistSlip < CFG.turnInMaxSlip) {
            const want = Math.min(1, Math.abs(steerCommand) / CFG.turnInSteer);
            const fade = 1 - assistSlip / CFG.turnInMaxSlip;
            frontGrip *= 1 + CFG.turnInBoost * want * fade;
        }
        let rearGrip = CFG.gripRear * surface * (input.handbrake ? CFG.handbrakeGrip : 1);
        // 動力過彎（power oversteer）。摩擦圓本身已經有呢個效果，但實測唔夠:
        // 放咗手煞之後，就算踩住全油，一個 26° 嘅漂移 0.8 秒就自己收返；
        // 連偏航阻尼一齊熄埋都只係捱到 1.5 秒，而且玩家點反打都改變唔到
        // （反打 gain 由 0.4 掃到 2.0，維持時間全部一樣）。
        // 呢度明確加多一層街機效果：已經喺漂移角度、又踩住油，後軸就再鬆
        // 一截。條件同 driftRefund 一樣（要踩油、要真係甩緊、落草冇、拉緊
        // 手煞冇），所以佢係「油門控制角度」嘅來源，唔係一個免費加速。
        // 撞完欄嗰陣唔會出。動力過彎係「你揀咗去漂移」嘅輔助，撞欄唔係你揀
        // 嘅——實測放鬆咗之後，25° 撞欄嘅車尾一直鬆住，三秒後只追返 44 km/h
        // （原本 87）。呢個窗一收，撞完就即刻攞返抓地走人。
        if (assists && !input.handbrake && !this.offroad && this.wallCooldown <= 0
            && input.throttle > CFG.driftPowerThrottle && assistSlip > CFG.driftPowerLo) {
            // 角度窗：由 15° 升上嚟，過咗 driftPowerHi 就一路收返到零。
            // 冇呢個上限嘅話佢會自己推到 89°——即係漂移變咗一條單程路，
            // 唔再係玩家揸得住嘅嘢（committed gate 就係咁樣捉到）。
            const rise = Math.min(1, (assistSlip - CFG.driftPowerLo) / 0.2);
            const fall = Math.min(1, Math.max(0,
                (CFG.driftPowerOut - assistSlip) / (CFG.driftPowerOut - CFG.driftPowerHi)));
            const angle = rise * fall;
            const gas = (input.throttle - CFG.driftPowerThrottle) / (1 - CFG.driftPowerThrottle);
            rearGrip *= 1 - CFG.driftPower * angle * gas;
        }

        // ---- 縱向需求：引擎／煞車／阻力 ----
        // 煞車只係「需求」，真正落地幾多，下面按軸同摩擦圓計。
        let driveF = 0, brakeDemand = 0;
        if (input.throttle > 0) {
            const torqueFade = Math.min(1, Math.abs(vLong) / 25);
            const available = CFG.launchForce + (CFG.engineForce - CFG.launchForce) * torqueFade;
            driveF = available * input.throttle;
            // 車尾已經開始滑時略收動力，模擬循跡控制；直路起步同玩家拉手煞
            // 漂移都唔會被削，出彎就少啲「再踩一下即打圈」。
            if (assists && !input.handbrake && assistSlip > 0.12) {
                const cut = Math.min(CFG.assistTractionCut, (assistSlip - 0.12) * 0.7) * assistScale;
                driveF *= 1 - cut;
            }
        }
        else if (input.throttle < 0) {
            if (vLong > 0.6) brakeDemand = CFG.brakeForce * Math.min(1, -input.throttle);
            else driveF = CFG.reverseForce * input.throttle;
        }
        if (speed > CFG.maxSpeed) driveF = Math.min(driveF, 0);
        const dragF = -CFG.dragCoef * vLong * Math.abs(vLong)
            - Math.sign(vLong) * (CFG.rollResist + (this.offroad ? CFG.offroadDrag : 0));

        // ---- 載荷轉移同制動分配：兩者互為因果，所以行兩趟 ----
        // 載荷靠縱向加速度，而縱向加速度又靠「輪胎傳得到幾多」，即係靠載荷。
        // 之前用未夾過嘅制動需求（20000 N ＝ 1.84 g，超出任何輪胎）去估，
        // 估出嚟嘅後軸負荷直接跌到地板。兩趟迭代就解到：第一趟用靜態負荷
        // 算出真實得到嘅制動力，第二趟先用嗰個加速度去轉移載荷。
        const wb = CFG.wheelBaseF + CFG.wheelBaseR;
        const staticF = CFG.mass * G * CFG.wheelBaseR / wb;
        const staticR = CFG.mass * G * CFG.wheelBaseF / wb;
        const applyBrakes = (lf, lr) => {
            const cF = Math.max(1, frontGrip * lf);
            const cR = Math.max(1, rearGrip * lr);
            if (brakeDemand <= 0) return { capF: cF, capR: cR, brakeF: 0, brakeR: 0, lockF: false, lockR: false };
            if (this.abs) {
                // ABS + EBD：按「當刻軸荷」分配，唔用固定比例。煞車時載荷
                // 轉去前軸，固定 62/38 就等於過度制動已經冇乜負荷嘅後軸。
                // 按 μ·N 分配，兩軸用到同一比例嘅摩擦圓，偏航保持中性。
                const steerUse = Math.min(1, Math.abs(this.steer) / CFG.steerMax);
                const room = CFG.absCap * (1 - CFG.absSteerReserve * steerUse);
                // 前軸做主力：佢載荷大，制動時用自己個圈嘅大部分。咁樣前輪
                // 側向抓地跌得多過後輪，車就變成推頭傾向——安全，亦係真車
                // 嘅設定。平均分配反而令前輪保住太多側向，邊煞邊轉會被前輪
                // 扭入去變打圈（實測輕輕轉 0.2 都甩到 66°）。
                const bF = Math.min(brakeDemand * CFG.brakeFrontShare, cF * room);
                const bR = Math.min(brakeDemand - bF, cR * room * CFG.absRearBias);
                return { capF: cF, capR: cR, lockF: false, lockR: false, brakeF: bF, brakeR: bR };
            }
            // 冇 ABS：固定液壓比例，超出上限就鎖死（滑動摩擦 + 冇側向力）
            const dF = brakeDemand * CFG.brakeSplitF;
            const dR = brakeDemand * (1 - CFG.brakeSplitF);
            const lockF = dF > cF, lockR = dR > cR;
            return {
                capF: cF, capR: cR, lockF, lockR,
                brakeF: lockF ? cF * CFG.lockLong : dF,
                brakeR: lockR ? cR * CFG.lockLong : dR,
            };
        };
        const pass1 = applyBrakes(staticF, staticR);
        const accelLong = (driveF + dragF - pass1.brakeF - pass1.brakeR) / CFG.mass;
        const shift = CFG.mass * accelLong * CFG.loadTransfer;
        const loadF = Math.max(500, staticF - shift);
        const loadR = Math.max(500, staticR + shift);

        // ---- 滑移角：輪胎指向 vs 該軸實際行進方向 ----
        const vRef = Math.max(2.5, Math.abs(vLong));   // 低速唔好除到爆
        const dir = Math.sign(vLong) || 1;
        const slipF = Math.atan2(vLat + this.yawRate * CFG.wheelBaseF, vRef) - this.steer * dir;
        const slipR = Math.atan2(vLat - this.yawRate * CFG.wheelBaseR, vRef);

        // ---- 第二趟：用真實載荷再計一次制動同抓地上限 ----
        const solved = applyBrakes(loadF, loadR);
        const { capF, capR, brakeF, lockF } = solved;
        let { brakeR, lockR } = solved;

        // 手煞＝鎖死後軸。之前個模型淨係將後輪抓地打個折，唔夠力：實測
        // 輕撳 0.33 秒得 5° 起手，喺手機上根本入唔到漂移（冇人會長撳）。
        // 而家行返 ADR-068 嗰套——後輪鎖死，縱向食晒自己個摩擦圓，側向
        // 就跌到剩 lockLateral，車尾即刻拋得出去。呢個亦係真手煞嘅原理。
        if (input.handbrake && vLong > 0.6) {
            brakeR = Math.max(brakeR, capR * CFG.lockLong);
            lockR = true;
        }
        this.lockFront = lockF;
        this.lockRear = lockR;

        // 後輪最多傳到 μ·N 咁多力，多出嘅只係空轉。
        if (driveF > 0) driveF = Math.min(driveF, capR);
        const longForce = driveF + dragF - brakeF - brakeR;

        // 摩擦圓：每條軸用咗幾多縱向，側向就剩返幾多。之前淨係後軸有呢個
        // 帳，而且連制動都記落後軸——所以踩煞等於單方面攞走後輪嘅側向力。
        const useF = Math.min(0.98, brakeF / capF);
        const useR = Math.min(0.98, (Math.abs(driveF) + brakeR) / capR);
        const frontCircle = lockF ? CFG.lockLateral : Math.sqrt(1 - useF * useF);
        const rearCircle = lockR ? CFG.lockLateral : Math.sqrt(1 - useR * useR);

        const tyre = (slip, grip, load) =>
            -grip * load * Math.sin(CFG.tyreC * Math.atan(CFG.tyreB * slip));

        const latF = tyre(slipF, frontGrip * frontCircle, loadF);
        let latR = tyre(slipR, rearGrip * rearCircle, loadR);
        // 偏航阻尼：模擬輪胎鬆弛同懸掛，防止細小擾動滾成原地打圈。
        // 後軸力矩係 -wheelBaseR·latR，所以要「加」先至同 yawRate 反方向；
        // 減嘅話變咗正回授——轉彎轉到一半自己愈轉愈急，最後打圈。
        latR += this.yawRate * CFG.yawDamp * loadR * 0.02;

        // ---- 合力 → 加速度 ----
        const fx = longForce - latF * Math.sin(this.steer);
        const fy = latF * Math.cos(this.steer) + latR;
        const aLong = fx / CFG.mass;
        const aLat = fy / CFG.mass;
        this.longAccel = aLong;
        this.lateralAccel = aLat;

        // 偏航力矩：前軸推頭、後軸擺尾
        const torque = CFG.wheelBaseF * latF * Math.cos(this.steer) - CFG.wheelBaseR * latR;
        this.yawRate += (torque / CFG.inertia) * dt;
        // 偏航阻尼唔同反打輔助：佢唔會搶你揀嘅角度，只係壓住「角度變化
        // 幾快」。反打緊嘅時候完全讓路（上一版）會令架車變雙穩態——實測
        // 42° 起手一下衝到 79°，跟住彈返 0，中間冇平衡點，即係點揸都
        // 維持唔到一個中角度漂移。所以反打嗰陣阻尼保底 45%：軚仲係你話事，
        // 但擺動收窄咗，就有得「揸住」個角度。
        //
        // 試過喺呢度開一個「漂移窗」（15°–46° 之間淡出阻尼），量完之後拆走：
        // 佢完全冇延長到漂移（有窗冇窗都係 0.8–0.9 秒），但就將 35° 起手嘅
        // 過衝由 68° 推到 75°。維持漂移嘅係後軸動力（見上面 driftPower），
        // 唔係阻尼。呢度照舊壓「角度變化幾快」。
        if (assists && !input.handbrake && assistSlip > 0.12) {
            const dampScale = Math.max(CFG.assistDampFloor, assistScale);
            const damp = Math.min(CFG.assistYawDamp, (assistSlip - 0.12) * 7) * dampScale;
            this.yawRate *= Math.max(0, 1 - damp * dt);
        }
        if (speed < 1.2) this.yawRate *= Math.max(0, 1 - dt * 6);   // 停定唔好殘餘自轉
        this.yaw += this.yawRate * dt;

        // 車身座標加速度 → 世界座標。
        // 注意：一定要用「呢一幀開頭嗰對車身軸」（fwd／lat）還原，唔可以用轉完
        // 之後嘅新軸。用新軸嘅話速度向量會硬跟住車頭一齊轉，車頭同行進方向
        // 永遠對齊——滑移角起唔到過 aLat·dt，即係根本冇得漂移。呢個就係
        // 「喺柏油路點打軚都得 6°、落草反而甩到 70°」嗰個病嘅根源。
        const newVLong = vLong + aLong * dt;
        const newVLat = vLat + aLat * dt;
        this.vel.set(
            fwdX * newVLong + latX * newVLat,
            0,
            fwdZ * newVLong + latZ * newVLat,
        );

        // ---- 漂移退款（街機層）----
        // 橫住滑會刮走速度，呢個係真物理；但喺一隻靠漂移計分嘅遊戲入面，
        // 「用得愈多、跑得愈慢」等於叫玩家唔好用。所以退返嗰筆嘅一部分。
        // 退款上限就係今幀實際刮走咗嘅量——即係漂移永遠唔會快過直路。
        if (assists && !this.offroad && !input.handbrake && input.throttle > 0.3) {
            const slipNow = Math.abs(this.slipAngle);
            const amount = Math.min(1, (slipNow - CFG.driftPushMinSlip) / 0.45);
            const vMag = Math.hypot(this.vel.x, this.vel.z);
            const scrub = speed - vMag;                  // 今幀真係跌咗幾多
            if (amount > 0 && scrub > 0 && vMag > 4) {
                const refund = scrub * CFG.driftRefund * amount * input.throttle;
                this.vel.x += this.vel.x / vMag * refund;
                this.vel.z += this.vel.z / vMag * refund;
            }
        }

        // ---- 位置 + 撞欄 ----
        const next = this._nextPos.copy(this.pos).addScaledVector(this.vel, dt);
        this.wallHit = false;
        this.wallImpact = 0;
        this.#collide(next, track);
        this.pos.copy(next);

        // ---- 漂移狀態 ----
        // 滑移角要用「轉完之後」嘅車頭方向同新速度量，先反映到車尾甩咗幾多
        const nFwdX = Math.sin(this.yaw), nFwdZ = Math.cos(this.yaw);
        const sLong = this.vel.x * nFwdX + this.vel.z * nFwdZ;
        const sLat = this.vel.x * nFwdZ - this.vel.z * nFwdX;
        this.slipAngle = Math.abs(sLong) < 0.5 ? 0 : Math.atan2(sLat, Math.abs(sLong));
        // 門檻跟住輪胎峰值一齊搬：峰值 18° 之後，全力過彎本身就有 11° 左右
        // 車身角，用返舊嘅 11° 門檻就變成「正常過彎都當漂移」，分數會自己流。
        this.drifting = Math.abs(this.slipAngle) > 0.26 && this.speed > 7;   // 約 15°

        // 車身側傾：跟離心力，唔係跟軚盤——甩緊尾嗰陣兩者方向唔同。
        // 車身要向彎外側傾（右轉＝左邊沉），唔係好似電單車咁向內壓。
        // 之前符號掉轉，成場都係向內壓，望落成架車轉緊嘅方向都似係反嘅。
        // 車身 local +x 係畫面左，繞 local +z 正轉會抬起左邊，所以右轉
        //（aLat < 0）要負 roll ⇒ roll 同 aLat 同號。
        //
        // 幅度要細。之前用 0.16 rad（9.2°）：真車嘅極限側傾都只係 3° 左右，
        // 而我哋個模型係一整件硬嘢（車身連輪胎），一 roll 就一邊輪胎離地、
        // 另一邊插落路面（實測最低點 −0.27 米）。Penny 喺實機一眼睇出——
        // 「架車好似浮起、轉左轉右好似飛機咁」，講嘅就係呢個。
        const targetRoll = THREE.MathUtils.clamp(aLat / 105, -0.052, 0.052);
        this.bodyRoll += (targetRoll - this.bodyRoll) * Math.min(1, dt * 7);
        // 載荷轉移嘅視覺回饋：加速車頭微微抬起、煞車車頭微微沉低。
        // 只郁整件車身，幅度受限於單一 rigid mesh，唔會再出現輪胎插地／浮起。
        const targetPitch = THREE.MathUtils.clamp(
            -aLong * 0.0055,
            -CFG.bodyPitchLimit,
            CFG.bodyPitchLimit,
        );
        this.bodyPitch += (targetPitch - this.bodyPitch) * Math.min(1, dt * CFG.bodyPitchRate);
        this.#sync();
    }

    // 撞欄：四邊試探砌出一條牆法線，然後淨係抵消「撞入去」嗰個分量。
    // 舊版係逐條軸直接 next.x = pos.x，等於連沿住欄杆滑行嗰個分量都殺埋——
    // 車頭一頂到欄就原地釘死，踩爆油都郁唔到（自動駕駛實測撞完 v=0 到收場）。
    #collide(next, track) {
        const r = 1.2;   // 車身半闊（世界單位）——唔可以跟 BLOCK 縮，否則細格會鑽穿欄杆
        let nx = 0, nz = 0;
        if (track.isWall(next.x + r, next.z)) nx -= 1;
        if (track.isWall(next.x - r, next.z)) nx += 1;
        if (track.isWall(next.x, next.z + r)) nz -= 1;
        if (track.isWall(next.x, next.z - r)) nz += 1;
        if (nx === 0 && nz === 0) return;
        this.wallHit = true;
        this.wallCooldown = CFG.wallDriftCooldown;
        const len = Math.hypot(nx, nz);
        nx /= len; nz /= len;                       // 法線：由牆指返出空地
        // 位置：抵消呢一步入牆嘅部分，沿牆方向照行
        const push = (next.x - this.pos.x) * nx + (next.z - this.pos.z) * nz;
        if (push < 0) { next.x -= nx * push; next.z -= nz * push; }
        // 速度：入牆分量反彈，切向分量保留（再食少少摩擦）
        const into = this.vel.x * nx + this.vel.z * nz;
        if (into < 0) {
            this.wallImpact = -into;
            this.vel.x -= nx * into * (1 + CFG.wallBounce);
            this.vel.z -= nz * into * (1 + CFG.wallBounce);
        }
        // 舊寫法喺每一幀接觸都將「成個」速度乘 0.86。淺角度刮牆會連續接觸
        // 幾幀，於是連沿牆方向嘅速度都一齊磨完：實測 10° 刮牆由 108 km/h
        // 跌到 0，三秒後仲係 1 km/h——即係輕輕擦一下就報廢，比 25° 撞埋去
        // （剩 42 km/h）仲慘。呢個唔係難度，係一個罰錯人嘅 bug。
        // 而家只罰沿牆方向少少（3%），入牆方向照舊由上面嘅反彈處理。
        const tangential = CFG.wallScrape;
        const vn = this.vel.x * nx + this.vel.z * nz;
        this.vel.x = (this.vel.x - nx * vn) * tangential + nx * vn;
        this.vel.z = (this.vel.z - nz * vn) * tangential + nz * vn;
        this.yawRate *= 0.5;
        // 貼牆矯正。擦一下之後車頭同新嘅行進方向會差一大截，輪胎就會用接近
        // 90° 嘅滑移角狂刮——實測 10° 擦一下由 108 km/h 跌到 0，而玩家（唔
        // 似 AI）冇救車狀態機，即係「掂一下欄就等於報廢」。所以接觸嗰陣將
        // 車頭拉少少向沿牆方向，變成「貼住牆滑過去」。
        const tangX = -nz, tangZ = nx;
        const along = this.vel.x * tangX + this.vel.z * tangZ;
        const dir = along < 0 ? -1 : 1;
        let d = Math.atan2(tangX * dir, tangZ * dir) - this.yaw;
        while (d > Math.PI) d -= 2 * Math.PI;
        while (d < -Math.PI) d += 2 * Math.PI;
        this.yaw += d * CFG.wallAlign;
    }

    // 打完圈救返車。玩家（唔似 AI）冇救車狀態機，所以喺「差不多停定 + 車頭
    // 指錯超過 unspinAngle」嗰個明確狀態下，幫佢慢慢扭返向賽道方向。
    // 條件夠窄，正常揸車（包括漂移，因為漂移一定夠快）永遠踩唔中。
    // 傳入嘅係賽道喺呢個位嘅前進方向。回傳有冇出手，方便測試同 HUD。
    // 入場同離場門檻要唔同（同 ADR-065 嘅救車一樣）。只扭到入場門檻就收手
    // 嘅話，架車會停喺 80° 側住——自動油門一踩就橫住衝出草地。實測要扭到
    // 25° 以內先交返玩家。
    unspin(dirX, dirZ, dt) {
        if (!this.arcadeAssist) { this.unspinning = false; return false; }
        if (this.speed > CFG.unspinSpeed) { this.unspinning = false; return false; }
        const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw);
        const err = Math.atan2(fx * dirZ - fz * dirX, fx * dirX + fz * dirZ);
        if (!this.unspinning && Math.abs(err) > CFG.unspinAngle) this.unspinning = true;
        if (!this.unspinning) return false;
        if (Math.abs(err) < CFG.unspinExit) { this.unspinning = false; return false; }
        const step = Math.min(Math.abs(err), CFG.unspinRate * dt) * (err < 0 ? 1 : -1);
        this.yaw += step;
        // 車頭一轉，殘餘嘅偏航速度就冇意義，仲會即刻扭返轉頭
        this.yawRate *= 0.6;
        this.#sync();
        return true;
    }

    #sync() {
        // 車模係一件 rigid mesh，繞原點俯仰會令車底一邊落低。用模型量過嘅
        // 包絡補一個極細 render-only lift，保持輪胎貼地；物理位置仍然係 y=0。
        const pitchLift = Math.abs(this.bodyPitch) * CFG.bodyPitchLift;
        this.root.position.set(this.pos.x, pitchLift, this.pos.z);
        this.root.rotation.set(this.bodyPitch, this.yaw, this.bodyRoll, 'YZX');
    }
}
