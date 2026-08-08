// 塔防第三把尺：**塔真係打幾多**。
//
// 前兩把尺（smoke／balance）量嘅係「載唔載得入」同「難度曲線崩唔崩」——兩樣都
// 冇掂過戰鬥。而戰鬥係呢隻遊戲嘅全部：塔資訊版寫住 `DOT: 18 dmg/s (5s)`，敵人表
// 寫住 boss「抗毒、12 甲」，`towers.json` 每一格都寫住 damage 同 cooldown。呢啲
// 全部都係**可以量嘅承諾**，而之前一條都冇量過。
//
// 呢度唔喺測試度抄公式：經 `window.__TD` 行真嘅 tickEnemies／tickTowers／
// tickCombat。抄一次就變成「同一件事寫兩次」，兩邊一齊錯嗰陣把尺會綠。
//
// 跑法：node games/tower/tests/combat.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) { console.log('搵唔到 playwright'); process.exit(1); }
if (!fs.existsSync(path.join(HERE, '..', 'dist', 'index.html'))) {
    console.log('搵唔到 dist：喺 games/tower 行 npm ci && npm run build 先'); process.exit(1);
}
const { chromium } = await import(pathToFileURL(PW).href);
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp',
  '.svg':'image/svg+xml', '.glb':'model/gltf-binary', '.woff2':'font/woff2', '.m4a':'audio/mp4', '.mp3':'audio/mpeg' };
let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
const port = await new Promise(r => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message.split('\n')[0].slice(0, 140)));
await page.goto(`http://localhost:${port}/games/tower/dist/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.__TD, null, { timeout: 30000 });

// 頁面入面嘅共用夾具：搵一格路、搵一格喺佢隔籬起得塔嘅位、擺低一隻唔郁嘅敵人。
await page.evaluate(() => {
  const T = window.__TD;
  T.夾具 = {
    // 敵人企定唔郁先量得準：每格都推返佢返原位。
    釘住(id) {
      const e = T.state.enemies.find(x => x.id === id);
      T.釘 = { id, pathIndex: e.pathIndex, x: e.worldX, z: e.worldZ };
      return T.釘;
    },
    走(格, dt) {
      for (let i = 0; i < 格; i += 1) {
        T.tick(1, dt);
        if (T.釘) {
          const e = T.state.enemies.find(x => x.id === T.釘.id);
          if (e) { e.pathIndex = T.釘.pathIndex; e.pathProgress = 0; e.worldX = T.釘.x; e.worldZ = T.釘.z; }
        }
      }
    },
    // 喺路嘅第 pathIndex 格隔籬搵一格起得塔嘅位（由近到遠，射程一定夠）。
    起塔(type, pathIndex) {
      const MAP = T.state.mapRef ?? null;
      const path = T.路;
      const [pc, pr] = path[pathIndex];
      for (let d = 1; d <= 3; d += 1) {
        for (let dc = -d; dc <= d; dc += 1) for (let dr = -d; dr <= d; dr += 1) {
          if (Math.max(Math.abs(dc), Math.abs(dr)) !== d) continue;
          const t = T.build(type, pc + dc, pr + dr);
          if (t) return t;
        }
      }
      void MAP;
      return null;
    },
  };
});
// 路要由頁面攞（唔好喺測試度再寫一次張地圖）。
await page.evaluate(async () => {
  const r = await fetch('../configs/map.json');
  window.__TD.路 = (await r.json()).path;
});

const CFG = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'configs', 'towers.json'), 'utf8'));
const 敵CFG = JSON.parse(fs.readFileSync(path.join(HERE, '..', 'configs', 'enemies.json'), 'utf8'));

// ── 1. 每座塔實際打嘅 dps，對唔對得住塔資訊版寫嗰個數 ──
// 塔嗰版寫 `DPS: damage / cooldown`，有 DoT 嗰啲仲寫多句 `DOT: n dmg/s`。
// 兩句加埋就係佢對玩家嘅承諾。攞一隻冇甲冇弱點嘅雜兵（grunt 對 physical 係弱點，
// 所以 physical 嗰啲用 shield 呢隻——佢對 physical 冇加冇減）量返出嚟。
// 窗口要夠長，而且要跳過熱身：開場第一發係白送嘅（冷卻由零計），
// 十二秒窗口入面狙擊塔（2.8 秒一發）就白賺一發，量到 41.7 對承諾 35.7——
// **嗰個係我支尺嘅邊界效應，唔係隻遊戲快咗**。跳過熱身再量一分鐘就散。
const dps量 = await page.evaluate(({ 熱身, 秒 }) => {
  const T = window.__TD, 出 = {};
  for (const type of ['arrow', 'cannon', 'ice', 'fire', 'lightning', 'poison', 'sniper']) {
    T.擂台();
    const t = T.夾具.起塔(type, 6);
    if (!t) { 出[type] = { 起唔到塔: true }; continue; }
    const e = T.spawn('grunt', 6);
    const live = T.state.enemies.find(x => x.id === e.id);
    live.hp = 1e9; live.maxHp = 1e9; live.armor = 0; live.shield = 0; live.maxShield = 0;
    T.夾具.釘住(e.id);
    T.夾具.走(Math.round(熱身 / T.LOGIC_DT), T.LOGIC_DT);
    const 開 = live.hp;
    T.夾具.走(Math.round(秒 / T.LOGIC_DT), T.LOGIC_DT);
    出[type] = { 量到: +((開 - live.hp) / 秒).toFixed(2) };
  }
  T.釘 = null;
  return 出;
}, { 熱身: 6, 秒: 60 });

// grunt 弱 physical（×1.5）、抗 sniper 嘅係 swarm，唔關事；lightning／ice／fire／poison
// 對 grunt 冇加冇減。所以只有 arrow／cannon／arrow 系要除返 1.5。
const 弱倍 = (t) => (敵CFG.grunt.weakness.includes(CFG[t].damageType) ? 1.5 : 1);
const dps對照 = {};
for (const [t, v] of Object.entries(dps量)) {
  const L = CFG[t].levels[0];
  const 承諾 = (L.damage / L.cooldownSec + (L.dot ? L.dot.dps : 0)) * 弱倍(t);
  dps對照[t] = { 承諾: +承諾.toFixed(1), 量到: v.量到, 比: +(v.量到 / 承諾).toFixed(2) };
}
// 鏈電同範圍炮打一隻敵人冇得分身，所以只會少過或者等於承諾；上限先係硬線。
check('冇一座塔打得多過佢自己塔資訊版寫嗰個數（DoT 唔可以自己疊自己）',
  Object.values(dps對照).every(v => v.比 <= 1.08), dps對照);
check('每座塔都打得出至少八成佢寫嘅數（單體塔冇缺斤兩）',
  ['arrow', 'ice', 'fire', 'poison', 'sniper'].every(t => dps對照[t].比 >= 0.8),
  Object.fromEntries(['arrow', 'ice', 'fire', 'poison', 'sniper'].map(t => [t, dps對照[t].比])));

// ── 2. DoT 唔可以跟住 tick 率行 ──
// 呢條就係原本嗰個缺陷嘅心臟：地板 `Math.max(1, dmg - armor)` 本來係寫畀**一次
// 命中**嘅，擺咗喺**每格行一次**嘅 DoT 上面，就變成「每格最少一點」＝每秒最少
// 1 / LOGIC_DT ＝ 20 點。同一條燒傷用兩個唔同嘅 dt 行足十秒，總數要一樣。
const 步長 = await page.evaluate(() => {
  const T = window.__TD;
  const 燒 = (dt, 秒) => {
    T.擂台();
    const e = T.spawn('grunt', 6);
    const live = T.state.enemies.find(x => x.id === e.id);
    live.hp = 1e9; live.maxHp = 1e9;
    live.dots.push({ dps: 8, remaining: 秒, damageType: 'poison' });
    const 開 = live.hp;
    T.夾具.釘住(e.id);
    T.夾具.走(Math.round(秒 / dt), dt);
    T.釘 = null;
    return +(開 - live.hp).toFixed(2);
  };
  return { 慢格: 燒(0.1, 10), 正常: 燒(0.05, 10), 快格: 燒(0.0125, 10), 應該: 80 };
});
const 步差 = Math.max(步長.慢格, 步長.正常, 步長.快格) / Math.max(1e-9, Math.min(步長.慢格, 步長.正常, 步長.快格));
check('一條燒傷燒足十秒，行幾多格都係同一個總數（唔跟 tick 率）',
  步差 <= 1.02 && Math.abs(步長.正常 - 步長.應該) / 步長.應該 <= 0.05, 步長);

// ── 3. 甲、抗性、弱點喺 DoT 上面要真係郁到條數 ──
// 之前三樣都畀個地板食晒：tank 有 8 甲兼**弱火**，24 dps 打出 20；boss 抗毒兼
// 12 甲，一樣係 20。即係「弱火」令 tank 食少過一隻冇弱點嘅雜兵。
const 剋制 = await page.evaluate(() => {
  const T = window.__TD;
  const 燒 = (敵, dps, 類型, 秒 = 5) => {
    T.擂台();
    const e = T.spawn(敵, 6);
    const live = T.state.enemies.find(x => x.id === e.id);
    live.hp = 1e9; live.maxHp = 1e9; live.shield = 0; live.maxShield = 0;
    live.dots.push({ dps, remaining: 秒, damageType: 類型 });
    const 開 = live.hp;
    T.夾具.釘住(e.id);
    T.夾具.走(Math.round(秒 / T.LOGIC_DT), T.LOGIC_DT);
    T.釘 = null;
    return +((開 - live.hp) / 秒).toFixed(2);
  };
  return {
    雜兵食火: 燒('grunt', 24, 'fire'),          // 冇加冇減：24
    坦克食火: 燒('tank', 24, 'fire'),           // 弱火 ×1.5 － 8 甲 ＝ 28
    雜兵食毒: 燒('grunt', 18, 'poison'),        // 18
    boss食毒: 燒('boss', 18, 'poison'),         // 抗毒 ×0.5 － 12 甲 ＝ 地板
    boss食火: 燒('boss', 18, 'fire'),           // 冇加冇減 － 12 甲 ＝ 6
  };
});
check('弱點令佢食多啲、抗性同甲令佢食少啲——DoT 上面一樣算數',
  剋制.坦克食火 > 剋制.雜兵食火 && 剋制.boss食毒 < 剋制.雜兵食毒 && 剋制.boss食火 < 剋制.雜兵食毒,
  剋制);
// 唔可以剋制到零：一條燒傷再點畀甲食都仲有得燒（但係一點，唔係二十點）。
check('甲食到盡都仲有得燒，但係一點唔係二十點（地板擺喺每秒，唔係擺喺每格）',
  剋制.boss食毒 >= 0.5 && 剋制.boss食毒 <= 2, { boss食毒: 剋制.boss食毒 });

// ── 4. 同一座塔唔會自己疊自己 ──
// 毒 L1 一點五秒射一次、燒足四秒，本來一座塔自己就疊到三條。
const 疊 = await page.evaluate(() => {
  const T = window.__TD;
  T.擂台();
  const t = T.夾具.起塔('poison', 6);
  const e = T.spawn('grunt', 6);
  const live = T.state.enemies.find(x => x.id === e.id);
  live.hp = 1e9; live.maxHp = 1e9;
  T.夾具.釘住(e.id);
  T.夾具.走(Math.round(12 / T.LOGIC_DT), T.LOGIC_DT);
  const n = live.dots.length;
  T.釘 = null;
  return { 塔: !!t, 燒住幾多條: n, 類型: live.dots.map(d => d.damageType) };
});
check('一座塔燒同一隻敵人十二秒，身上都只係一條燒傷（唔會疊)', 疊.燒住幾多條 <= 1, 疊);

// ── 5. 兩種唔同類型嘅燒傷可以同時燒 ──
const 兩種 = await page.evaluate(() => {
  const T = window.__TD;
  T.擂台();
  const f = T.夾具.起塔('fire', 6);
  const p = T.夾具.起塔('poison', 6);
  const e = T.spawn('grunt', 6);
  const live = T.state.enemies.find(x => x.id === e.id);
  live.hp = 1e9; live.maxHp = 1e9;
  T.夾具.釘住(e.id);
  T.夾具.走(Math.round(10 / T.LOGIC_DT), T.LOGIC_DT);
  const out = { 火塔: !!f, 毒塔: !!p, 條數: live.dots.length, 類型: live.dots.map(d => d.damageType).sort() };
  T.釘 = null;
  return out;
});
check('火同毒係兩件事，可以同時燒（刷新只係同類型之間嘅事）',
  兩種.條數 === 2 && 兩種.類型.join(',') === 'fire,poison', 兩種);

check('量度期間零 browser error', errors.length === 0, errors.slice(0, 3));

console.log(`\ntower 戰鬥: ${pass}/${pass + fail} 通過`);
if (fail) console.log('失敗項目: ' + failed.join('、'));
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
