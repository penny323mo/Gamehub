// Hub-wide「玩完之後，你嘅成果有冇留低」契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-progress.mjs
//
// 上一次用 generic 掃法（開場撳幾下再睇 `localStorage`）掃到九隻「玩完一個字
// 都冇寫低」，差啲當咗係九個病。查落 Neon Snake 其實有成套 profile／高分系統,
// 淨係喺 game over 先寫——**掃唔夠，唔係佢冇記**。
//
// 所以呢把尺逐隻寫 driver，而且每隻都要**先證明去到「有嘢值得記」嗰一刻**
// （開咗波／死咗／入咗場），先至去睇有冇留低。冇呢個對照，一隻根本未開始
// 玩嘅遊戲會扮到「冇嘢好記」，而條 check 會綠得好安詳。
//
// ── 覆蓋範圍：四隻，唔係五隻 ─────────────────────────────────
// **Racing Car 3D 冇喺呢度**，唔係因為佢冇記（佢有：`racer-ghost:<track>` 存住
// 最佳圈速同幽靈軌跡），而係因為佢「值得記」嗰一刻要**跑完一圈**——一個測試
// 揸唔到一圈，而 `window.__racer` 冇一條「當我跑完咗」嘅路。
// 實測玩 12 秒之後係「乜都冇留低」——**嗰個係我夠唔到，唔係一個發現**。
// 寫喺度係為咗個缺口見得到，唔係靜靜雞跳過。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = await import('playwright').catch(async () => {
  const HERE0 = path.dirname(fileURLToPath(import.meta.url));
  const 後備 = pathToFileURL(path.resolve(HERE0, '../games/tower/node_modules/playwright/index.mjs')).href;
  return import(後備).catch(() => {
    console.error('搵唔到 playwright。喺 games/tower 度行一次 `npm ci` 就有：');
    console.error('  (cd games/tower && npm ci)');
    process.exit(2);
  });
});

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json', '.bin':'application/octet-stream',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp',
  '.hdr':'image/vnd.radiance', '.wasm':'application/wasm', '.m4a':'audio/mp4', '.mp3':'audio/mpeg',
  '.ogg':'audio/ogg', '.wav':'audio/wav', '.woff2':'font/woff2' };
const 可壓 = new Set(['.js', '.mjs', '.css', '.html', '.json', '.svg']);
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
  const ext = path.extname(f);
  let body = fs.readFileSync(f);
  const h = { 'content-type': MIME[ext] ?? 'application/octet-stream' };
  if (可壓.has(ext) && (req.headers['accept-encoding'] ?? '').includes('gzip')) {
    body = zlib.gzipSync(body); h['content-encoding'] = 'gzip';
  }
  h['content-length'] = body.length;
  res.writeHead(200, h); res.end(body);
});
const port = await new Promise((r) => server.listen(0, () => r(server.address().port)));
const browser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});

let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};

const 遊戲 = [
  {
    名: 'Tower Defense', url: '/games/tower/dist/index.html',
    玩: async (p) => {
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__TD?.開波次數?.() > 0, null, { timeout: 240000 });
      await p.waitForTimeout(12000);
    },
    // 對照：真係開咗波（唔係停喺開場畫面）
    到咗: () => (window.__TD?.開波次數?.() ?? 0) > 0,
    // 憑據：波與波之間嘅 checkpoint
    憑據: () => {
      const raw = localStorage.getItem('tower-defense-run-v1');
      if (!raw) return null;
      try { const j = JSON.parse(raw); return { wave: j.wave ?? j.波 ?? null, 長度: raw.length }; }
      catch { return { 長度: raw.length }; }
    },
  },
  {
    名: 'Neon Snake', url: '/games/snake-game/dist/index.html',
    玩: async (p) => {
      // 要先入名（form submit）先入到選單。`fill()` ＋ 撳掣入唔到。
      await p.locator('input').first().click({ timeout: 60000 });
      await p.keyboard.type('尺仔');
      await p.keyboard.press('Enter');
      await p.waitForTimeout(3000);
      await p.getByText(/經典模式/).first().click({ timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(2000);
      await p.keyboard.press('ArrowRight');
      // `saveScore` 係喺 game over 度叫嘅，所以要真係死一次
      await p.waitForFunction(() => document.body.innerText.includes('重新開始'),
        null, { timeout: 120000 });
      await p.waitForTimeout(2000);
    },
    到咗: () => document.body.innerText.includes('重新開始'),
    憑據: () => {
      try {
        const u = JSON.parse(localStorage.getItem('snake-game-users') || '{}');
        const k = Object.keys(u)[0];
        if (!k) return null;
        const st = u[k]?.stats ?? {};
        return (st.gamesPlayed ?? 0) >= 1
          ? { 用戶: k, 打過幾多局: st.gamesPlayed, 分數紀錄: (u[k]?.scores ?? []).length }
          : null;
      } catch { return null; }
    },
  },
  {
    名: '深淵之橋 MOBA', url: '/games/moba/index.html',
    玩: async (p) => {
      await p.waitForSelector('#pick-grid .pick-card', { timeout: 240000 });
      await p.click('#pick-grid .pick-card');
      await p.click('#pick-go', { timeout: 60000 });
      await p.waitForFunction(() => window.__mobaReady === true, null, { timeout: 180000 });
      await p.waitForTimeout(5000);
    },
    到咗: () => window.__mobaReady === true,
    // MOBA 唔存戰績（一場對 AI 嘅波打完就完），但佢記得你揀邊個英雄
    // ——即係下次入嚟唔使由頭揀過。呢個就係佢嗰種「留低」。
    憑據: () => {
      const raw = localStorage.getItem('moba-settings');
      if (!raw) return null;
      try { const j = JSON.parse(raw); return j.champion ? { champion: j.champion } : null; }
      catch { return null; }
    },
  },
  {
    名: 'Empire Royale', url: '/games/royale/index.html',
    玩: async (p) => {
      // 教學遮罩開住嗰陣模擬係**凍結**嘅（`if (!ui?.tutorialOpen)`）——唔標記睇過
      // 就算擺咗張火球落去都永遠唔會爆，`phase` 永遠唔會變 `ended`。
      await p.waitForSelector('#loading', { state: 'detached', timeout: 120000 });
      await p.evaluate(async () => { const st = await import('./src/storage.js'); st.markTutorialSeen(); });
      await p.getByText(/⚔️ 對戰/).first().click({ timeout: 60000 });
      await p.waitForTimeout(600);
      await p.click('#start-btn', { timeout: 60000 });
      await p.waitForFunction(() => window.__royale?.game, null, { timeout: 180000 });
      await p.waitForTimeout(1500);
      /*
       * 用返 repo 自己 `royale/tests/match.mjs` 嗰條收場食譜。
       *
       * 兩條行唔通嘅路都試過，寫低省得下一個再試：
       *   · 淨係快進（`g.update(1/60)` 行足 300 秒模擬）→ 冇人出牌就拖到
       *     `overtime` 僵住，`phase` 永遠唔係 `ended`；
       *   · 直接寫 `king.hp = 0` → 唔會收場，因為 `#kill` 淨係喺 `#damage`
       *     入面叫，唔經傷害就唔會觸發。
       */
      await p.evaluate(() => {
        const g = window.__royale.game;
        g.players[0].hand[0] = 'fireball';
        g.players[0].elixir = 12;
        g.towers[1].king.hp = 1;
        g.playCard(0, 0, g.towers[1].king.x, g.towers[1].king.z);
      });
      await p.waitForFunction(() => window.__royale.game.phase === 'ended', null, { timeout: 60000 });
      await p.waitForTimeout(3500);   // 等結算入存檔
    },
    到咗: () => window.__royale?.game?.phase === 'ended',
    憑據: () => {
      const raw = localStorage.getItem('royale-save-v1');
      if (!raw) return null;
      try {
        const j = JSON.parse(raw);
        return (j.trophies ?? 0) > 0 ? { trophies: j.trophies } : null;
      } catch { return null; }
    },
  },
];

const 量 = {};
for (const g of 遊戲) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  try {
    await page.goto(`http://localhost:${port}${encodeURI(g.url)}`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(3000);
    await g.玩(page);
    const 到咗 = await page.evaluate(g.到咗).catch(() => false);
    const 玩完 = await page.evaluate(g.憑據).catch(() => null);
    // reload：真係留低咗，唔係得個記憶體副本
    await page.reload({ waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(3500);
    const 返嚟 = await page.evaluate(g.憑據).catch(() => null);
    量[g.名] = { 到咗, 玩完: 玩完 ?? '（冇）', 返嚟: 返嚟 ?? '（冇）' };
  } catch (e) {
    量[g.名] = { 掛咗: String(e).split('\n')[0].slice(0, 110) };
  }
  await ctx.close();
}

// **「真係去到有嘢值得記嗰一刻」係一個對照。** 冇佢嘅話，一隻根本未開始玩嘅
// 遊戲會扮到「冇嘢好記」，而下面條 check 會綠得好安詳。
const 未到 = Object.entries(量).filter(([, v]) => v.掛咗 || v.到咗 !== true);
check('每隻都真係玩到「有嘢值得記」嗰一刻（開咗波／死咗／入咗場）',
  未到.length === 0, 未到.length ? Object.fromEntries(未到) : { 驗過: Object.keys(量) });

const 冇留低 = Object.entries(量).filter(([, v]) => v.掛咗 || v.返嚟 === '（冇）');
check('玩完之後成果要留得住（reload 返嚟仲喺度）', 冇留低.length === 0,
  冇留低.length ? Object.fromEntries(冇留低) : Object.fromEntries(
    Object.entries(量).map(([k, v]) => [k, v.返嚟])));

console.log('\n各遊戲：');
for (const [名, v] of Object.entries(量)) {
  console.log(`  ${名.padEnd(16)} ${v.掛咗 ?? `到咗 ${v.到咗}　玩完 ${JSON.stringify(v.玩完)}　reload 後 ${JSON.stringify(v.返嚟)}`}`);
}
console.log(`\nhub 進度記憶: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await browser.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
