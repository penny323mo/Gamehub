// Hub-wide 睇唔睇得清契約。
// 跑法：PW_CHROMIUM=/opt/pw-browsers/chromium node tests/hub-read.mjs
//
// 已經有「掂得到」（`hub-touch`，44×44）同「去得到」（`hub-keyboard`，Tab ＋ focus
// 提示）。冇一條問過**睇唔睇得清**——字色同底色夠唔夠分得開。
//
// 條線用 WCAG AA：一般字 4.5:1，大字（≥24px，或者 ≥18.66px 粗體）3:1。
// 揀 WCAG 唔係因為佢神聖，係因為佢係**唔使我逐個位拍腦袋**嘅一條線。
//
// 呢把尺量咗四個版先啱，四次都係量錯：
//
//   1. **靠 computed style 向上搵底色，凡有 `background-image` 就跳過。**
//      body 有個 gradient 就已經觸發——十二個介面入面九個係 100% 跳過，
//      然後報「零問題」。**一個量咗零樣嘢得出嚟嘅綠。**
//   2. 改成量真像素，但攞「框入面嘅眾數」做底色。細細個框（例如一個「400」）
//      入面**字本身先係眾數**，於是算出「對比 1.02」——即係睇唔到，
//      但佢明明睇得好清楚。
//   3. 改成「字色由 computed `color` 攞、底色喺剔走近似字色嘅像素之後再攞眾數」。
//      啱咗，但**純 emoji 仲係假紅**：emoji 係多色字形，佢嘅顏色唔係 `color`。
//   4. 仲有「喺 layout 入面唔等於畫得出嚟」：Tower 個 `80g` 有 box、冇
//      `display:none`、又喺 viewport 入面，但畀 overflow 剪走咗，影出嚟一片黑。
//
// 字體大細**只報唔守**：冇一條標準寫死手機最細幾多 px，而 9–11px 喺一個密集嘅
// 遊戲 HUD 度可以係諗過先咁做嘅。**一條會將深思熟慮嘅決定叫做 bug 嘅 gate 係壞 gate。**
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { catalogTargets } from './lib/catalog-targets.mjs';
const { chromium } = await import('playwright').catch(async () => {
  const HERE0 = path.dirname(fileURLToPath(import.meta.url));
  const 後備 = pathToFileURL(path.resolve(HERE0, '../games/tower/node_modules/playwright/index.mjs')).href;
  return import(後備).catch(() => {
    console.error('搵唔到 playwright。喺 games/tower 度行一次 `npm ci` 就有：');
    console.error('  (cd games/tower && npm ci)');
    process.exit(2);
  });
});
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json',
 '.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp',
 '.wasm':'application/wasm','.woff2':'font/woff2','.m4a':'audio/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.hdr':'image/vnd.radiance'};
const 可壓=new Set(['.js','.mjs','.css','.html','.json','.svg']);
const server=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);const f=path.join(ROOT,u);
 if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('404');}
 const ext=path.extname(f); let body=fs.readFileSync(f);
 const h={'content-type':MIME[ext]??'application/octet-stream'};
 if(可壓.has(ext)&&(req.headers['accept-encoding']??'').includes('gzip')){body=zlib.gzipSync(body);h['content-encoding']='gzip';}
 h['content-length']=body.length; res.writeHead(200,h); res.end(body);});
const port=await new Promise(r=>server.listen(0,()=>r(server.address().port)));
const b = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
});
let pass = 0, fail = 0; const failed = [];
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log(`PASS  ${name}`, detail === undefined ? '' : JSON.stringify(detail)); }
  else { fail++; failed.push(name); console.log(`FAIL  ${name}`, JSON.stringify(detail)); }
};
const 全部 = {};
const 遊戲 = catalogTargets({ includeHub: true });
const 分析 = (b64, dpr) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0);
    const 亮 = (r,g,bl) => { const f=(v)=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);};
      return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bl); };
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length) continue;
      const t = (el.textContent || '').trim(); if (!t) continue;
      /*
       * 純 emoji 唔量對比：emoji 係**多色字形**，佢嘅顏色唔係 `color`,
       * 所以用 computed `color` 做前景根本量錯對象。第二版就係咁樣報咗
       * Royale／Racing Car 個 🏠「對比 3.2」——但個掣本身係清清楚楚嘅。
       */
      const 冇emoji = t.replace(/[\p{Extended_Pictographic}\uFE0F\u200D\s]/gu, '');
      if (!冇emoji) continue;
      const cs = getComputedStyle(el);
      if (cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0) continue;
      const r = el.getBoundingClientRect();
      if (r.width<3||r.height<3||r.top>innerHeight||r.bottom<0||r.left>innerWidth||r.right<0) continue;
      /*
       * 有 box 同喺 viewport 入面，唔代表玩家真係見到佢。Tower 開場 modal
       * 蓋住 build menu 時，menu 個 `.build-name` 仍然符合上面所有 layout
       * 條件；如果照影佢個矩形，會用 modal 後面嘅像素報假紅。用中心點
       * 確認最上層 hit target，先將「畫得出嚟」當成有證據。
       */
      const cx0 = Math.max(0, Math.min(innerWidth - 1, (r.left + r.right) / 2));
      const cy0 = Math.max(0, Math.min(innerHeight - 1, (r.top + r.bottom) / 2));
      const top = document.elementFromPoint(cx0, cy0);
      let uncovered = false;
      for (let n = top; n; n = n.parentElement) {
        if (n === el) { uncovered = true; break; }
      }
      if (!uncovered) continue;
      const x=Math.max(0,Math.round(r.left*dpr)), y=Math.max(0,Math.round(r.top*dpr));
      const w=Math.min(cv.width-x,Math.round(r.width*dpr)), h=Math.min(cv.height-y,Math.round(r.height*dpr));
      if (w<3||h<3) continue;
      const d = cx.getImageData(x,y,w,h).data;
      /*
       * 字色由 computed `color` 攞——佢係準確嘅，而且唔受 antialias 影響。
       * 底色**唔可以**攞成個框嘅眾數：細細個框（例如一個「400」）入面
       * **字本身先係眾數**，咁樣算出嚟嘅對比會係 1.09，即係「睇唔到」——
       * 但佢明明睇得好清楚。呢個係我第二版把尺報出嚟嘅假紅。
       *
       * 改成：先剔走同字色相近嘅像素（連 antialias 邊緣），淨低嗰啲先攞眾數。
       */
      const m = String(cs.color).match(/rgba?\(([^)]+)\)/);
      if (!m) continue;
      const fg = m[1].split(',').map(Number);
      const 遠 = (i) => Math.abs(d[i]-fg[0]) + Math.abs(d[i+1]-fg[1]) + Math.abs(d[i+2]-fg[2]);
      const bins = new Map();
      let 非字 = 0, 字數 = 0;
      for (let i=0;i<d.length;i+=4){
        if (遠(i) < 120) { 字數++; continue; }            // 字同佢嘅邊緣
        非字++;
        const k = (d[i]>>3<<10) | (d[i+1]>>3<<5) | (d[i+2]>>3);   // 每軸 5 bit
        bins.set(k, (bins.get(k)??0)+1);
      }
      /*
       * **喺 layout 入面唔等於畫得出嚟。** Tower 個 `80g` 有 box、冇 `display:none`、
       * 又喺 viewport 入面，但實際畀 overflow 剪走咗——影出嚟一片黑。第三版
       * 就係咁樣報咗三個「對比 1.02」。框入面搵唔到接近字色嘅像素，
       * 即係呢段字根本冇畫喺呢度，唔當佢係證據。
       */
      if (字數 < 4) continue;
      if (非字 < 8) continue;                            // 底色樣本太少，唔當證據
      let bk=null, bn=-1; for (const [k,n] of bins) if (n>bn) { bn=n; bk=k; }
      const bg = [ (bk>>10&31)<<3, (bk>>5&31)<<3, (bk&31)<<3 ];
      const L1 = 亮(fg[0],fg[1],fg[2]), L2 = 亮(bg[0],bg[1],bg[2]);
      const best = (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
      const px = parseFloat(cs.fontSize)||0;
      const 粗 = (parseInt(cs.fontWeight,10)||400) >= 700;
      out.push({ 字: t.slice(0,14), px:+px.toFixed(1), 粗, 比:+best.toFixed(2),
        大字: px>=24 || (粗 && px>=18.66), 面積: Math.round(r.width*r.height) });
    }
    resolve(out);
  };
  img.src = 'data:image/png;base64,' + b64;
});
for (const [名,url] of 遊戲) {
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const page=await ctx.newPage();
  try{
    await page.goto(`http://localhost:${port}${encodeURI(url)}`,{waitUntil:'load',timeout:60000});
    await page.waitForTimeout(3200);
    const shot = (await page.screenshot({ type:'png' })).toString('base64');
    const rows = await page.evaluate(([b64,fn,dpr]) => new Function('b64','dpr','return ('+fn+')(b64,dpr)')(b64,dpr),
      [shot, 分析.toString(), 2]);
    const 低 = rows.filter(r => r.比 < (r.大字 ? 3 : 4.5))
      .map(r => ({ 字: r.字, px: r.px, 粗: r.粗, 比: r.比 }));
    全部[名] = { 量到: rows.length, 細過12px: rows.filter(r => r.px < 12).length, 低對比: 低 };
  } catch (e) {
    // **量唔到唔可以當冇事。** 一個開唔到嘅頁報綠，等於冇守過。
    全部[名] = { 掛咗: String(e).split('\n')[0].slice(0, 90) };
  }
  await ctx.close();
}

const 掛 = Object.entries(全部).filter(([, v]) => v.掛咗);
check('十二個開場畫面都量得到', 掛.length === 0,
  掛.length ? Object.fromEntries(掛) : { 介面: Object.keys(全部).length });

// 量到零段字＝把尺喺嗰度失效，唔係嗰個介面冇字。**報綠之前要先證明量到嘢。**
const 量唔到 = Object.entries(全部).filter(([, v]) => !v.掛咗 && v.量到 === 0);
check('每個介面都真係量到字（唔可以零樣本報綠）', 量唔到.length === 0,
  量唔到.length ? Object.fromEntries(量唔到) : Object.fromEntries(
    Object.entries(全部).map(([k, v]) => [k, v.量到])));

const 未達 = Object.entries(全部).filter(([, v]) => (v.低對比 ?? []).length > 0);
check('畫得出嚟嘅字都夠對比（WCAG AA：一般 4.5:1、大字 3:1）', 未達.length === 0,
  未達.length ? Object.fromEntries(未達.map(([k, v]) => [k, v.低對比])) : { 上限: 'AA' });

console.log('\n各介面（字體大細只報唔守）：');
for (const [名, v] of Object.entries(全部)) {
  if (v.掛咗) { console.log(`  ${名.padEnd(15)} 掛咗 ${v.掛咗}`); continue; }
  console.log(`  ${名.padEnd(15)} 量到 ${String(v.量到).padStart(3)} 段字　<12px ${String(v.細過12px).padStart(2)}　對比不足 ${v.低對比.length}`);
}
console.log(`\nhub 睇得清: ${pass}/${pass + fail} 通過`);
if (failed.length) console.log('未過:', failed.join('; '));
await b.close();
server.close();
process.exit(fail === 0 ? 0 : 1);
