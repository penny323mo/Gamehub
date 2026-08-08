// 塔防嘅通關支尺：**一個貪心玩家推得到幾遠**。
//
// 呢個唔入快套件（同 ER2 嘅 playthrough-full.mjs 一樣）：佢跑一次要一兩分鐘，
// 而且佢答嘅唔係「有冇壞」，係「呢隻遊戲對得住玩家未」。政策好簡單，簡單到
// 一個第一次玩嘅人都做得到：貼住條路起塔、有錢就升級、升唔到就再起一座。
// 如果連呢個政策都推得到尾而且一條命都唔跌，咁「難度」呢兩個字就係空嘅。
//
// 跑法：node games/tower/tests/playthrough.mjs [最多波數]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const 最多波 = Number(process.argv[2] ?? 40);
// 塔數上限：「隻遊戲畀嘅資源，比實際需要多幾多倍」淨係封住個上限先量得到。
const 塔上限 = Number(process.argv[3] ?? 999);
// 血量曲線嘅二次項：掃緊個數嗰陣由呢度餵入去，唔使每試一個值就 rebuild。
const 線性 = process.argv[4] !== undefined ? Number(process.argv[4]) : null;
const 曲率 = Number(process.argv[5] ?? 0);
const PW = path.join(ROOT, 'games', 'Racing Car', 'tests', 'node_modules', 'playwright', 'index.mjs');
if (!fs.existsSync(PW)) { console.log('搵唔到 playwright'); process.exit(1); }
const { chromium } = await import(pathToFileURL(PW).href);
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
  '.png':'image/png', '.svg':'image/svg+xml', '.glb':'model/gltf-binary', '.m4a':'audio/mp4', '.woff2':'font/woff2' };
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
await page.click('#start-btn');
await page.waitForTimeout(1500);
if (線性 !== null) await page.evaluate((v) => { window.__TD.設曲率(v[0], v[1]); }, [線性, 曲率]);
// 條路同塔嘅設定由頁面攞，唔好喺呢度再寫一次。
await page.evaluate(async () => {
  window.__TD.路 = (await (await fetch('../configs/map.json')).json()).path;
  window.__TD.塔設定 = await (await fetch('../configs/towers.json')).json();
});

const 結果 = await page.evaluate(({ 最多波, 塔上限 }) => {
  const T = window.__TD, S = () => T.state;
  const 記 = [];
  const 建過 = new Set();
  const 起一座 = (type) => {
    for (let pi = 3; pi < T.路.length - 2; pi += 1) {
      const [pc, pr] = T.路[pi];
      for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
        const key = `${pc + dc},${pr + dr}`;
        if (建過.has(key)) continue;
        const t = T.build(type, pc + dc, pr + dr);
        if (t) { 建過.add(key); return t; }
      }
    }
    return null;
  };
  // 有錢就洗，洗到洗唔郁為止：升級行先，然後進化，再唔係就多起一座。
  // 進化一定要試——唔試就會分唔清「隻遊戲冇嘢畀你買」同「我個 bot 唔識買」。
  const 進化過 = new Set();
  const 花錢 = () => {
    for (let 守 = 0; 守 < 500; 守 += 1) {
      let 郁過 = false;
      for (const t of S().towers.filter(t => t.level < 3).sort((a, b) => a.level - b.level)) {
        if (T.upgrade(t.id)) { 郁過 = true; break; }
      }
      if (郁過) continue;
      for (const t of S().towers) {
        if (進化過.has(t.id)) continue;
        const evo = T.塔設定[t.type]?.evolutions ?? [];
        if (!evo.length) { 進化過.add(t.id); continue; }
        if (T.進化(t.id, evo[0].type)) { 進化過.add(t.id); 郁過 = true; break; }
      }
      if (郁過) continue;
      if (S().towers.length >= 塔上限) return;
      if (!起一座(S().towers.length % 4 === 3 ? 'sniper' : 'arrow')) return;
    }
  };
  // 「呢一波夠唔夠驚險」量法：**成波敵人最深行到條路嘅第幾成**。
  // 打得晒唔代表打得辛苦——如果每一波都喺頭三成就清乾淨，即係防守多咗幾倍，
  // 而條命數永遠唔郁就係咁嚟嘅。呢個數睇得出「差幾遠先至輸」。
  const 路長 = T.路.length - 1;
  let 上次波 = -1, 守 = 0, 今波最深 = 0;
  while (S().phase !== 'lost' && S().phase !== 'won' && S().currentWave < 最多波 && 守 < 600000) {
    if (S().phase === 'prep') 花錢();
    for (let i = 0; i < 20; i += 1) {
      T.tick(1);
      for (const e of S().enemies) {
        if (e.alive && !e.reached) 今波最深 = Math.max(今波最深, e.pathIndex / 路長);
      }
    }
    守 += 20;
    if (S().currentWave !== 上次波) {
      if (上次波 >= 0) 記[記.length - 1].最深 = +今波最深.toFixed(2);
      今波最深 = 0;
      上次波 = S().currentWave;
      記.push({ 波: 上次波 + 1, 命: S().lives, 金: S().gold, 塔: S().towers.length, 最深: 0 });
    }
  }
  if (記.length) 記[記.length - 1].最深 = +今波最深.toFixed(2);
  return {
    終: S().phase, 到波: S().currentWave + 1, 命: S().lives, 開局命: 20,
    塔: S().towers.length, 剩金: S().gold, 最高剩金: Math.max(...記.map(r => r.金)),
    進化咗: S().towers.filter(t => t.type.includes('_')).length,
    收入: S().stats.goldEarned, 洗咗: S().stats.goldSpent,
    跌過命嘅波: 記.filter((r, i) => i > 0 && r.命 < 記[i - 1].命).map(r => r.波),
    記,
  };
}, { 最多波, 塔上限 });

console.log(`終局: ${結果.終}　到波: ${結果.到波}　命: ${結果.命}/${結果.開局命}　塔: ${結果.塔}（進化咗 ${結果.進化咗}）　剩金: ${結果.剩金}`);
console.log(`跌過命嘅波: ${結果.跌過命嘅波.length ? 結果.跌過命嘅波.join('、') : '一個都冇'}`);
console.log(`最高剩金: ${結果.最高剩金}（洗到洗唔郁之後仲有咁多，即係買唔到嘢）`);
console.log(`成場收入: ${結果.收入}　洗咗: ${結果.洗咗}　→ 收入係開支嘅 ${(結果.收入 / Math.max(1, 結果.洗咗)).toFixed(2)} 倍`);
const 深 = 結果.記.map(r => r.最深);
console.log(`成場最深滲透: ${Math.max(...深).toFixed(2)}（1.00 就係走到終點）　中位數 ${深.slice().sort((a, b) => a - b)[深.length >> 1].toFixed(2)}`);
for (const r of 結果.記.filter((_, i) => i % 5 === 0 || i === 結果.記.length - 1)) {
  console.log(`  wave ${String(r.波).padStart(3)}　命 ${String(r.命).padStart(3)}　金 ${String(r.金).padStart(6)}　塔 ${String(r.塔).padStart(3)}　最深 ${r.最深.toFixed(2)}`);
}
if (errors.length) console.log('browser error: ' + errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
