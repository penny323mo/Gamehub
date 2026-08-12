import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)); const ROOT=path.resolve(HERE,'../../..');
// Keep the long-running witness portable across Codex, Claude and local Macs.
// The old cloud-only scratchpad path made the game test fail before Chromium
// even opened when that directory was not mounted.
const OUT=process.env.ER2_PLAYTHROUGH_OUT ?? path.join('/tmp','gamehub-elden-ring-ii-playthrough-full.txt');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const 記=(t)=>fs.appendFileSync(OUT, t+'\n');
const { chromium }=await import(pathToFileURL(path.join(ROOT,'games','Racing Car','tests','node_modules','playwright','index.mjs')).href);
const MIME={'.html':'text/html','.js':'text/javascript','.glb':'model/gltf-binary','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.css':'text/css','.woff2':'font/woff2','.m4a':'audio/mp4','.mp3':'audio/mpeg','.svg':'image/svg+xml','.bin':'application/octet-stream'};
const server=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}
  r.writeHead(200,{'content-type':MIME[path.extname(f)]??'application/octet-stream'});fs.createReadStream(f).pipe(r);});
const port=await new Promise(r=>server.listen(0,()=>r(server.address().port)));
記('開機');
const browser=await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium',
  args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],
});
const p=await browser.newPage({viewport:{width:320,height:190}});
p.on('pageerror',e=>記('PAGEERROR '+e.message.slice(0,140)));
await p.goto(`http://localhost:${port}/games/elden-ring-ii/dist/index.html`,{waitUntil:'load'});
await p.waitForTimeout(1500);
const 撳=(t)=>p.evaluate((x)=>{const b=[...document.querySelectorAll('button')].find(e=>(e.innerText||'').includes(x));if(b)b.click();},t);
await 撳('OATHBOUND'); await p.waitForSelector('.enter-button:not([disabled])',{timeout:60000});
await 撳('ENTER THE VEIL'); await p.waitForTimeout(4000);
記('入場');
await p.evaluate(() => {
  const api = window.__ER2;
  const 按 = new Set();
  const 落=(c)=>{ if(按.has(c))return; 按.add(c); window.dispatchEvent(new KeyboardEvent('keydown',{code:c,bubbles:true})); };
  const 起=(c)=>{ if(!按.has(c))return; 按.delete(c); window.dispatchEvent(new KeyboardEvent('keyup',{code:c,bubbles:true})); };
  const 一下=(c)=>{ 落(c); setTimeout(()=>起(c),40); };
  const 全起=()=>[...按].forEach(起);
  const 翻滾離開=(g, threat)=>{
    全起();
    const dx = g.我[0] - threat.x, dz = g.我[1] - threat.z;
    const n = Math.hypot(dx, dz) || 1;
    const awayX = dx / n, awayZ = dz / n;
    const yaw = +document.querySelector('[data-camera-yaw]').dataset.cameraYaw;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
    const fwd = awayX * fx + awayZ * fz, sid = awayX * rx + awayZ * rz;
    const keysForRoll = [];
    if (fwd > 0.25) keysForRoll.push('KeyW');
    if (fwd < -0.25) keysForRoll.push('KeyS');
    if (sid > 0.25) keysForRoll.push('KeyD');
    if (sid < -0.25) keysForRoll.push('KeyA');
    keysForRoll.forEach(落);
    一下('Space');
    setTimeout(() => keysForRoll.forEach(起), 300);
  };
  const B = { 記錄: [], 停: false, err: null, tick: 0 };
  window.__BOT = B;
  let 上關=-1, 上飲=-9;
  // 卡住脫困：呢個 bot 冇尋路，直線行去 boss 會撞住走廊嘅牆——實測喺 boss 場
  // 外面卡咗 200 郁動秒、boss 100 血一滴都冇跌。距離一段時間冇縮短就打橫行。
  let 上距=Infinity, 上進=-9, 打橫=-1, 橫向=1;
  // Boss 預警圈係玩家真正睇得到嘅 telegraph。用狀態嘅開始時間等到落點前
  // 先側向翻滾；唔讀任何未渲染資料，亦唔直接改遊戲 state。
  let boss招式='', boss預警開始=-9, boss已閃=false, 閃邊=1;
  B.h = setInterval(() => {
    if (B.停) return;
    try {
      B.tick += 1;
      const g = api.局面(); const t = api.clock().motion;
      if (g.關 !== 上關) { 上關 = g.關; B.記錄.push(`[${t.toFixed(0)}s] 關${g.關} 血${g.血} 體${g.體} 藥${g.藥}`); }
      if (g.狀態 !== 'playing') { B.記錄.push(`[${t.toFixed(0)}s] 結果=${g.狀態} 關${g.關} 血${g.血} 藥${g.藥}`); B.停=true; 全起(); return; }
      const 敵=[...g.兵,...(g.boss?[g.boss]:[])];
      if (!敵.length) { 全起(); return; }
      const 距=(m)=>Math.hypot(m.x-g.我[0],m.z-g.我[1]);
      const 目=g.boss??g.兵.slice().sort((a,b)=>距(a)-距(b))[0];
      const d=距(目);
      if (g.boss?.態 === 'windup' && g.boss.快出手) {
        if (boss招式 !== g.boss.招) {
          boss招式 = g.boss.招;
          boss預警開始 = t;
          boss已閃 = false;
        }
        // 一見到圈就翻滾：輪詢本身最多隔 90ms，若再等到前搖尾段，第二階段
        // 0.52s punch 已經可能落點。遠離畫面上 boss／落點嘅方向，唔靠固定
        // 左右，確保翻滾真正離開 3D telegraph 圓心。
        const phase2 = g.boss.血 <= 50;
        const 等候 = g.boss.招 === 'leap' ? 0.12 : phase2 ? 0.08 : 0.1;
        if (!boss已閃 && t - boss預警開始 >= 等候) {
          翻滾離開(g, g.boss);
          boss已閃 = true;
          return;
        }
      } else if (g.boss?.態 !== 'windup') {
        boss招式 = '';
        boss已閃 = false;
      }
      const minionThreat = g.兵.filter((m)=>m.快出手 && 距(m)<3.2)
        .sort((a,b)=>距(a)-距(b))[0];
      if (minionThreat && g.體>=24) { 翻滾離開(g, minionThreat); return; }
      if (g.血<58 && g.藥>0 && t-上飲>1.6) { 上飲=t; 全起(); 一下('KeyE'); return; }
      const 就快死 = g.boss ? g.boss.血 <= 25 : false;
      if (!就快死 && g.血<40 && g.體>=24 && 敵.some(m=>m.快出手 && 距(m)<3.2)) { 全起(); 一下('Space'); return; }
      const yaw=+document.querySelector('[data-camera-yaw]').dataset.cameraYaw;
      const fx=-Math.sin(yaw), fz=-Math.cos(yaw), rx=Math.cos(yaw), rz=-Math.sin(yaw);
      const n=Math.hypot(目.x-g.我[0],目.z-g.我[1])||1;
      const ux=(目.x-g.我[0])/n, uz=(目.z-g.我[1])/n;
      const fwd=ux*fx+uz*fz, sid=ux*rx+uz*rz;
      const 射=g.boss?3.6:4.2;
      if (d < 上距 - 0.4) { 上距 = d; 上進 = t; }
      if (t - 上進 > 3 && d > 射) { 打橫 = t + 2.5; 橫向 = -橫向; 上進 = t; 上距 = d; }
      if (d > 射*0.9) {
        if (t < 打橫) {
          const px = -uz * 橫向, pz = ux * 橫向;
          const pf = px*fx + pz*fz, ps = px*rx + pz*rz;
          pf>0.3?落('KeyW'):起('KeyW'); pf<-0.3?落('KeyS'):起('KeyS');
          ps>0.3?落('KeyD'):起('KeyD'); ps<-0.3?落('KeyA'):起('KeyA');
          return;
        }
        fwd>0.3?落('KeyW'):起('KeyW'); fwd<-0.3?落('KeyS'):起('KeyS');
        sid>0.3?落('KeyD'):起('KeyD'); sid<-0.3?落('KeyA'):起('KeyA');
      } else { 全起(); 一下('KeyF'); }
    } catch (e) { B.err = String(e).slice(0,160); B.停 = true; }
  }, 90);
});
記('bot 開咗');
let seen = 0;
for (let i = 0; i < 400; i++) {
  await p.waitForTimeout(5000);
  const st = await p.evaluate(() => ({ 停: window.__BOT.停, err: window.__BOT.err, tick: window.__BOT.tick,
    rec: window.__BOT.記錄, t: window.__ER2.clock().motion, g: window.__ER2.局面() }));
  st.rec.slice(seen).forEach(記); seen = st.rec.length;
  if (i % 6 === 0) 記(`  ‥心跳 郁動${st.t.toFixed(0)}s tick${st.tick} 關${st.g.關} 血${st.g.血} 藥${st.g.藥} 敵${st.g.兵.length}${st.g.boss?' boss'+st.g.boss.血:''}`);
  if (st.err) { 記('BOTERR '+st.err); break; }
  if (st.停) break;
  if (st.t > 500) { 記('超時'); break; }
}
const f = await p.evaluate(()=>({g:window.__ER2.局面(), a:window.__ER2.瞄準(), t:window.__ER2.clock().motion}));
記(`收場：關${f.g.關} ${f.g.狀態} 血${f.g.血} 藥${f.g.藥} boss${f.g.boss?f.g.boss.血:'-'} 出手${f.a.發招} 傷害${f.a.打出傷害} 郁動${f.t.toFixed(0)}s`);
const fullClear = f.g.狀態 === 'victory' && f.g.關 === 3 && !f.g.boss;
記(`PLAYTHROUGH=${fullClear ? 'PASS' : 'FAIL'}`);
await browser.close(); await new Promise(r=>server.close(r));
if (!fullClear) {
  console.error(`Elden Ring II full witness failed: status=${f.g.狀態} chapter=${f.g.關} boss=${f.g.boss?.血 ?? '-'} motion=${f.t.toFixed(0)}s`);
  process.exitCode = 1;
}
