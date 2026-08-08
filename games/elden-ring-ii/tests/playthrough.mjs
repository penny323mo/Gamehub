// 用一個會打會行嘅 bot 真係玩落去，睇隻遊戲推唔推得郁。
//
// 跑法：node games/elden-ring-ii/tests/playthrough.mjs [幾多步]
//
// **唔屬於快速套件**，而且**唔會因為 bot 死咗就當肥咗**。
//
// 兩個理由：
//   一、呢度冇 GPU。軟件光柵化得三幀，而 `delta` 夾住 0.05 秒（ADR-150），
//       即係遊戲時間得真實時間嘅一成七左右。行一步真係要等。
//   二、一個 bot 死咗，唔證明隻遊戲通唔到。實測：淨係識埋身斬嘅 bot 廿八
//       秒清到第一波（兩隻），跟住喺第二波（三隻）死。人識走位識碌，bot
//       唔識。**呢個數係一條難度嘅參考線，唔係一條合格線。**
//
// 所以佢印數，唔判斷。要判斷「通唔通得到」，要人落手玩。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const STEPS = Number(process.argv[2] ?? 900);
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) {
    console.log('搵唔到 playwright：喺 games/Racing Car/tests 行一次 npm install 先');
    process.exit(1);
}
const { chromium } = await import(pathToFileURL(PW).href);

const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json', '.bin': 'application/octet-stream', '.json': 'application/json',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css', '.woff2': 'font/woff2',
    '.m4a': 'audio/mp4', '.ico': 'image/x-icon', '.txt': 'text/plain', '.svg': 'image/svg+xml',
};
const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = path.join(ROOT, u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        res.writeHead(404); return res.end('404');
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
});
const port = await new Promise(r => server.listen(0, () => r(server.address().port)));

const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
// 320×190：軟件光柵化之下解析度就係幀率，而幀率就係遊戲時間（ADR-186 實測
// 640×380 得 1.7 fps、320×190 4.2）。呢個 bot 一條嘢都唔關解析度事。
const page = await browser.newPage({ viewport: { width: 320, height: 190 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message.split('\n')[0]));

await page.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.getByText('OATHBOUND', { exact: false }).first().click();
await page.getByText('ENTER THE VEIL').first().click();
await page.waitForTimeout(4000);

const 讀 = () => page.evaluate(() => window.__ER2.局面());

// 一個「識玩」嘅 bot。
//
// 上一版由頭到尾冇碌過，所以佢死喺第二波乜都證明唔到——量到嘅係 bot 蠢，唔係
// 遊戲難。而「隻遊戲通唔通到關」係產品級嘅第一條問題，冇一個識玩嘅 bot 就答
// 唔到。呢個政策簡單到一個新手都做得到：
//   1. 有嘢**就快落到你身上**（雜兵出緊手、boss 前搖）→ 碌走。
//   2. 入到射程 → 斬。
//   3. 血少過三成 → 行去賜福回氣（`__ER2.graces()`）。
//   4. 其餘時間 → 行埋去。
// 佢冇任何真人冇嘅資訊：以上每一樣都喺畫面上面睇得到。
const 射程 = 4.2, BOSS射程 = 3.6;
const t0 = Date.now();
const 秒 = () => ((Date.now() - t0) / 1000).toFixed(0);
let 上關 = -1;
// 拉唔拉得開？想飲藥試過幾多次、真係開到 7 米幾多次。
let 想拉開 = 0, 拉開到 = 0, 飲咗 = 0;
const 斬記 = [];
const 賜福 = await page.evaluate(() => window.__ER2.graces());

// 個 bot 落指令要用**遊戲時間**，唔係真實時間。
//
// 呢個環境一秒得三四幀而 `delta` 封喺 0.05，所以 1.2 真實秒 ＝ **0.2 秒遊戲
// 時間**——一次「衝刺撤退」實際上只行到 0.7 米，跟住就重新諗過。實測：想拉開
// 21 次、成功 **0** 次。而條真實嘅問題係「隻遊戲畀唔畀你拉開」，唔係「個 bot
// 嘅 setTimeout 有幾長」。所以全部等待都改成等郁動秒。
const 等郁 = async (秒) => {
    const t0 = (await page.evaluate(() => window.__ER2.clock())).motion;
    for (let i = 0; i < 60; i += 1) {
        await page.waitForTimeout(160);
        const t = (await page.evaluate(() => window.__ER2.clock())).motion;
        if (t - t0 >= 秒) return;
    }
};

// WASD 係**鏡頭相對**嘅：遊戲入面 `forward = (−sin(yaw), −cos(yaw))`、
// `right = (cos(yaw), −sin(yaw))`。個 bot 一直當佢係世界座標軸——鎖定之下鏡頭
// 跟住目標轉，所以「向 −z 行」撳出嚟嘅鍵實際上行緊第二個方向。撤退因此永遠
// 賺唔到距離（實測想拉開 21 次、成功 0 次）。要將世界方向投影返落鏡頭基底。
const 行 = async (wx, wz, 郁秒, 衝 = false) => {
    const yaw = +(await page.evaluate(() =>
        document.querySelector('[data-camera-yaw]').dataset.cameraYaw));
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    const rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const n = Math.hypot(wx, wz) || 1;
    const dz = (wx / n) * fx + (wz / n) * fz;      // 前後
    const dx = (wx / n) * rx + (wz / n) * rz;      // 左右
    const keys = [];
    if (dx < -0.35) keys.push('KeyA'); else if (dx > 0.35) keys.push('KeyD');
    if (dz > 0.35) keys.push('KeyW'); else if (dz < -0.35) keys.push('KeyS');
    if (!keys.length) { await 等郁(郁秒); return; }
    if (衝) keys.push('ShiftLeft');
    for (const k of keys) await page.keyboard.down(k);
    await 等郁(郁秒);
    for (const k of keys) await page.keyboard.up(k);
};

// 遊戲設計嘅循環係「打幾下 → 退開回氣 → 再打」：出手 17 體力、回氣 28/秒，
// 而**行路唔封鎖回氣、衝刺就封鎖**。ADR-188 之後行路真係拉得開（每秒賺 0.7–
// 1.2 米），所以退開用行嘅，唔用衝——衝係留返畀「要即刻甩身」。
// 政策由「走位為主」改成「對砍為主」。
//
// ADR-190 條交換量度講咗答案：**淨係撳攻擊，13 郁動秒清咗第一波，交換 133
// 對 100**。而之前個 bot 要 44 秒——因為佢大部分時間喺度行、喺度轉、喺度退，
// 每個決定約 0.9 郁動秒嘅開銷。而家回氣喺收招期已經返，企定斬係撐得住嘅，
// 所以斷開嘅唯一理由係飲藥。
const 出手費 = 17;
for (let i = 0; i < STEPS; i++) {
    const s = await 讀();
    if (s.關 !== 上關) {
        上關 = s.關;
        console.log(`[${秒()}s] ${s.關 === 3 ? 'boss' : `wave-${s.關 + 1}`}　血 ${s.血}　體 ${s.體}　藥 ${s.藥}`);
    }
    if (s.狀態 !== 'playing') {
        const a = await page.evaluate(() => window.__ER2.瞄準());
        const c = await page.evaluate(() => window.__ER2.clock());
        console.log(`[${秒()}s] 結果 = ${s.狀態}　血 ${s.血} 藥 ${s.藥}`);
        console.log(`  出手 ${a.發招}、落點 ${a.落點}、傷害 ${a.打出傷害}、郁動 ${c.motion.toFixed(0)}s`);
        break;
    }

    const 敵 = [...s.兵, ...(s.boss ? [s.boss] : [])];
    if (!敵.length) { await 等郁(0.4); continue; }
    const 距 = (m) => Math.hypot(m.x - s.我[0], m.z - s.我[1]);
    const 目標 = s.boss ?? s.兵.slice().sort((a, b) => 距(a) - 距(b))[0];
    const d = 距(目標);
    const 最近 = Math.min(...敵.map(距));

    // 1. 血低就飲——飲嘅 0.95 秒會捱多一兩下，但總好過捱住捱住咁死。
    if (s.血 < 55 && s.藥 > 0) {
        飲咗 += 1;
        await page.keyboard.press('KeyE');
        await 等郁(1.2);
        continue;
    }
    // 2. 冇藥又見血就先碌走一次，起碼買返個回氣窗口。
    if (s.血 < 32 && s.藥 === 0 && s.體 >= 24 && 最近 < 3.2) {
        await page.keyboard.press('Space');
        await 等郁(0.6);
        continue;
    }
    // 3. 面向唔啱就行埋去（行路轉身 9，快過出手中嗰個 4.5）。
    const 朝差 = Math.abs(Math.atan2(
        Math.sin(Math.atan2(目標.x - s.我[0], 目標.z - s.我[1]) - s.朝),
        Math.cos(Math.atan2(目標.x - s.我[0], 目標.z - s.我[1]) - s.朝)));
    if (朝差 > 1.0 && d <= 6) { await 行(目標.x - s.我[0], 目標.z - s.我[1], 0.3); continue; }
    // 4. 入到射程就斬。
    if (d <= (s.boss ? 3.6 : 4.2) && s.體 >= 出手費) {
        // **連撳，唔係撳一下等一個決定周期。** 每個決定要一次 browser
        // round-trip（約 0.3–0.5 郁動秒），加埋 `等郁(0.7)` 令實際節奏變成
        // 一下／2.2 秒，而遊戲容許 0.87 秒——實測 13 下出手用咗 29 郁動秒。
        // 遊戲喺出手期間本身會忽略攻擊輸入，所以連撳係安全嘅，亦係人手做
        // 緊嘅嘢。
        for (let n = 0; n < 4; n += 1) {
            await page.keyboard.press('KeyF');
            await page.waitForTimeout(340);
        }
        continue;
    }
    // 5. 行埋去。
    await 行(目標.x - s.我[0], 目標.z - s.我[1], d > 10 ? 1.4 : 0.8);
}

console.log(`飲咗 ${飲咗} 支`);
console.log('最後：', JSON.stringify(await 讀()).slice(0, 260));
console.log('錯誤：', errors.length ? errors.slice(0, 3) : '冇');
await browser.close();
await new Promise(r => server.close(r));
