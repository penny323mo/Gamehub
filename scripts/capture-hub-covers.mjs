// 重影 Hub 封面：逐隻遊戲開出嚟、行到真正遊玩畫面、截圖，再壓成兩個 WebP 尺寸。
//
//   node scripts/capture-hub-covers.mjs [gameId,gameId...]
//
// 輸出：assets/hub/covers/<id>.webp（480×300，卡用）同 assets/hub/hero/<id>.webp
// （960×600，hero 用），每張 ≤115KB。WebGL 遊戲用 SwiftShader 渲染，所以要喺
// 有 Chromium 嘅環境跑（PW_CHROMIUM 可以指定路徑）。每隻遊戲點樣行到遊玩畫面
// 寫喺下面 STEPS；新加遊戲要補一條，唔係就只會影到佢嘅開場選單。
// 影完一定要人手睇一次——截圖好唔好睇係人嘅判斷，唔係呢個 script 嘅。
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = [
    path.join(ROOT, 'games', 'tower', 'node_modules', 'playwright', 'index.mjs'),
    '/opt/node22/lib/node_modules/playwright/index.mjs',
].find(fs.existsSync);
if (!PW) { console.error('搵唔到 playwright：喺 games/tower 行一次 npm ci 先'); process.exit(2); }
const { chromium } = await import(pathToFileURL(PW).href);
const executablePath = [process.env.PW_CHROMIUM, '/opt/pw-browsers/chromium'].find(p => p && fs.existsSync(p));
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'hub-covers-'));

const c=(p,s,t=8000)=>p.locator(s).first().click({timeout:t});
const T=(p,ms)=>p.waitForTimeout(ms);
const hold=async(p,key,ms)=>{await p.keyboard.down(key);await T(p,ms);await p.keyboard.up(key);};
const STEPS = {
 gomoku: async p=>{await c(p,'#gomoku-ai-btn');await T(p,1500);
   const bb=await p.locator('#gomoku-board').boundingBox(); const n=15, cell=bb.width/n;
   const mv=[[7,7],[8,8],[6,8],[8,6],[7,9],[9,7],[6,6]];
   for(const [x,y] of mv){await p.mouse.click(bb.x+cell*(x+0.5),bb.y+cell*(y+0.5));await T(p,1800);}
   return {clip:'#gomoku-board',pad:0,inside:true};},
 xiangqi: async p=>{await c(p,'#xiangqi-ai-btn');await T(p,7000);return {clip:'canvas',pad:0,inside:true,dy:10};},
 big2: async p=>{await c(p,'#btn-local-ai');await T(p,1500);await c(p,'#startGameBtn');await T(p,5000);return {vp:{width:768,height:480}};},
 doudizhu: async p=>{await p.setViewportSize({width:768,height:1000});await c(p,'#btn-local-ai');await T(p,1500);await c(p,'#startGameBtn');await T(p,3000);await c(p,'#bidCallBtn').catch(()=>{});await T(p,4000);await c(p,'#hintBtn').catch(()=>{});await T(p,600);await c(p,'#playBtn').catch(()=>{});await T(p,5000);await c(p,'#hintBtn').catch(()=>{});await T(p,800);return {clip:['#seat1','#hand'],pad:10};},
 pennycrush: async p=>{await p.getByText('8x8 (Normal)').click();await T(p,2000);return {clip:'#pc-grid',pad:10,inside:false};},
 snooker: async p=>{await p.getByText('單人模式').click();await T(p,1500);await p.getByText('3D 立體版').click();await T(p,10000);},
 tower: async p=>{await p.getByText('Normal').first().click();await c(p,'#start-btn');await T(p,3000);await c(p,'#skip-prep-btn').catch(()=>{});await T(p,14000);},
 snake: async p=>{await p.fill('input','Penny').catch(()=>{});await p.getByRole('button',{name:/開始遊戲/}).click();await T(p,1500);await p.getByRole('button',{name:/開始遊戲/}).last().click();await T(p,1200);
   for(const k of ['ArrowUp','ArrowLeft','ArrowDown','ArrowRight','ArrowUp','ArrowLeft']){await p.keyboard.press(k);await T(p,650);}
   const rect=await p.evaluate(()=>{let best=null;for(const e of document.querySelectorAll('div,canvas')){const r=e.getBoundingClientRect();if(r.width>200&&Math.abs(r.width-r.height)<30&&(!best||r.width>best.width))best={x:r.x,y:r.y,width:r.width,height:r.height};}return best;});
   return {rect,pad:0,inside:true};},
 royale: async p=>{await c(p,'#start-btn');await T(p,3000);await c(p,'#tutorial-skip').catch(()=>{});await T(p,25000);},
 moba: async p=>{await c(p,'#pick-go');await T(p,25000);},
 racer: async p=>{await c(p,'#start-btn');await T(p,6000);await hold(p,'ArrowUp',6000);},
 ashenrail: async p=>{await c(p,'#start-button');await T(p,14000);},
 'elden-ring-ii': async p=>{await p.getByText('ENTER THE VEIL').click();await T(p,10000);await hold(p,'w',2500);},
};

const MIME={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.glb':'model/gltf-binary','.wasm':'application/wasm','.hdr':'image/vnd.radiance','.mp3':'audio/mpeg','.m4a':'audio/mp4','.ogg':'audio/ogg','.wav':'audio/wav','.bin':'application/octet-stream','.gltf':'model/gltf+json'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)){r.writeHead(403);r.end();return;}fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});r.end(d);});}).listen(0);
const port=srv.address().port;
const m=JSON.parse(fs.readFileSync(ROOT+'/games/manifest.json'));
const only=process.argv[2]?process.argv[2].split(','):null;
const b=await chromium.launch({executablePath,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const g of m.games){ if(only&&!only.includes(g.id))continue;
 const ctx=await b.newContext({viewport:{width:1280,height:800},deviceScaleFactor:2});const p=await ctx.newPage();
 try{await p.goto(`http://127.0.0.1:${port}/${encodeURI(decodeURI(g.entry))}`,{waitUntil:'load',timeout:90000});await p.waitForTimeout(4000);
 let r=null; if(STEPS[g.id]) r=await STEPS[g.id](p).catch(e=>{console.log(g.id,'step err',e.message.slice(0,160));return null;});
 if(r?.vp){await p.setViewportSize(r.vp);await p.waitForTimeout(1500);}
 let clip; if(r?.clip||r?.rect){let bb=r.rect??null; if(r.clip) for(const sel of [].concat(r.clip)){const q=await p.locator(sel).first().boundingBox().catch(()=>null); if(!q)continue;
   bb=bb?{x:Math.min(bb.x,q.x),y:Math.min(bb.y,q.y),width:Math.max(bb.x+bb.width,q.x+q.width)-Math.min(bb.x,q.x),height:Math.max(bb.y+bb.height,q.y+q.height)-Math.min(bb.y,q.y)}:q;} if(bb){
   const pad=r.pad??12; let w=bb.width+pad*2, h=bb.height+pad*2; if(r.inside){ if(w/h>1.6) w=h*1.6; else h=w/1.6; } else if(w/h<1.6) w=h*1.6; else h=w/1.6;
   const V=p.viewportSize(); w=Math.min(w,V.width); h=Math.min(h,V.height); let x=bb.x+bb.width/2-w/2, y=bb.y+bb.height/2-h/2+(r.dy??0);
   x=Math.max(0,Math.min(x,V.width-w)); y=Math.max(0,Math.min(y,V.height-h)); clip={x,y,width:w,height:h};}}
 await p.screenshot({path:`${OUT}/${g.id}.png`,clip});
 console.log(g.id,'captured');}catch(e){console.log(g.id,'ERR',e.message.slice(0,100))}
 await ctx.close();}


const p=await b.newPage();
for (const [dir,W,H] of [['covers',480,300],['hero',960,600]]) {
  const out=path.join(ROOT,'assets','hub',dir); fs.mkdirSync(out,{recursive:true});
  const dirIn=OUT;

for(const f of fs.readdirSync(dirIn).filter(f=>f.endsWith('.png'))){
  const src='data:image/png;base64,'+fs.readFileSync(dirIn+'/'+f).toString('base64');
  let q=0.82, data;
  for(;;){ data=await p.evaluate(async([src,q,W,H])=>{const im=new Image();im.src=src;await im.decode();
    const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
    const s=Math.max(W/im.width,H/im.height),w=im.width*s,h=im.height*s;x.imageSmoothingQuality='high';
    x.drawImage(im,(W-w)/2,(H-h)/2,w,h);return c.toDataURL('image/webp',q);},[src,q,W,H]);
    const buf=Buffer.from(data.split(',')[1],'base64'); if(buf.length<=115*1024||q<0.5){fs.writeFileSync(`${out}/${f.replace('.png','.webp')}`,buf);console.log(f,Math.round(buf.length/1024)+'KB q'+q);break;} q-=0.08;}
}


}
await b.close(); srv.close();
