var C0=Object.defineProperty;var R0=(Pn,qt,ui)=>qt in Pn?C0(Pn,qt,{enumerable:!0,configurable:!0,writable:!0,value:ui}):Pn[qt]=ui;var Ae=(Pn,qt,ui)=>R0(Pn,typeof qt!="symbol"?qt+"":qt,ui);(function(){"use strict";var Pn=document.createElement("style");Pn.textContent=`@import"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap";*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;font-family:Inter,sans-serif;background:#111;color:#eee;user-select:none;-webkit-user-select:none}#game-canvas{position:fixed;top:0;left:0;width:100%;height:100%;display:block}#hud{position:fixed;top:12px;left:12px;right:12px;display:flex;gap:12px;align-items:center;pointer-events:none;z-index:10}#hud>div,#hud>button{pointer-events:auto;background:#000000a6;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:8px 14px;font-size:15px;font-weight:600;color:#fff;white-space:nowrap}#hud-gold{color:gold}#hud-lives{color:#ff6b6b}#hud-wave{color:#8cf}#hud-kills{color:#c8f}#skip-prep-btn{pointer-events:auto;background:#ffc80033;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,200,0,.4);border-radius:10px;padding:8px 14px;font-size:14px;font-weight:700;color:gold;cursor:pointer;transition:all .2s}#skip-prep-btn:hover{background:#ffc80059}#pause-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#pause-btn:hover{background:#ffffff26}#pause-btn.active{background:#ffb40040;border-color:#fc4;color:#fc4}#speed-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 16px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#speed-btn:hover{background:#ffffff26}#speed-btn.active{background:#64c8ff4d;border-color:#8cf;color:#8cf}#wave-banner{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:20;pointer-events:none}#wave-banner-text{font-size:42px;font-weight:900;color:#fff;text-shadow:0 0 20px rgba(100,200,255,.6),0 2px 8px rgba(0,0,0,.8);animation:bannerPulse .6s ease-out}@keyframes bannerPulse{0%{transform:scale(.5);opacity:0}50%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}#build-menu{position:fixed;bottom:16px;left:50%;transform:translate(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;z-index:10;padding:10px 14px;background:#000000b3;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.1);border-radius:16px;max-width:95vw}.build-title{font-size:11px;font-weight:700;color:#fff6;letter-spacing:2px;text-transform:uppercase}.build-grid{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.build-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;background:#ffffff14;border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#fff;cursor:pointer;transition:all .2s;min-width:60px;position:relative}.build-key{position:absolute;top:-6px;left:-6px;background:#3b82f6;color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:4px;box-shadow:0 2px 4px #00000080;border:1px solid #60a5fa;pointer-events:none}.build-btn:hover{background:#ffffff29;border-color:#ffffff4d}.build-btn.selected{background:#64c8ff33;border-color:#8cf;box-shadow:0 0 12px #64c8ff4d}.build-btn.disabled{opacity:.35;cursor:not-allowed}.build-icon{font-size:20px}.build-name{font-size:10px;font-weight:600}.build-cost{font-size:9px;color:gold;font-weight:600}.cancel-btn{background:#ff3c3c26;border-color:#ff3c3c4d}.cancel-btn:hover{background:#ff3c3c4d}#tower-panel{position:fixed;right:16px;bottom:130px;width:220px;background:#000c;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:14px;z-index:15}.panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.panel-header span{font-weight:700;font-size:15px}#panel-tower-level{color:#8cf;font-size:13px}#panel-close-btn{background:none;border:none;color:#ffffff80;font-size:16px;cursor:pointer;padding:2px 6px}#panel-close-btn:hover{color:#fff}.panel-stats{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:13px;color:#ffffffbf;margin-bottom:12px}#panel-special-row{grid-column:1 / -1}.panel-targeting{margin-bottom:10px}.targeting-label{font-size:11px;color:#ffffff80;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}.targeting-btns{display:flex;gap:4px}.target-btn{flex:1;padding:5px 2px;border:1px solid rgba(255,255,255,.15);border-radius:6px;background:#ffffff0d;color:#fff9;font-size:11px;cursor:pointer;transition:all .15s}.target-btn:hover{background:#ffffff1f;color:#fff}.target-btn.active{background:#64c8ff40;border-color:#8cf;color:#8cf;font-weight:700}.panel-actions{display:flex;gap:8px}.action-btn{flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;color:#fff}.action-btn.upgrade{background:linear-gradient(135deg,#26a,#38c)}.action-btn.upgrade:hover{background:linear-gradient(135deg,#37b,#4ae)}.action-btn.upgrade:disabled{opacity:.4;cursor:not-allowed}#evolve-container{display:flex;flex-direction:column;gap:6px;flex:2}.action-btn.evolve{background:linear-gradient(135deg,#c8f,#93f);font-size:11px;padding:6px}.action-btn.evolve:hover{background:linear-gradient(135deg,#eeaafe,#a4f)}.action-btn.evolve:disabled{opacity:.4;cursor:not-allowed}.action-btn.sell{background:linear-gradient(135deg,#842,#a53)}.action-btn.sell:hover{background:linear-gradient(135deg,#953,#c64)}#start-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:linear-gradient(135deg,#0a1a0a,#1a2a1a,#0a1a0a);display:flex;justify-content:center;align-items:center;z-index:100}.start-content{text-align:center}.game-title{font-size:56px;font-weight:900;background:linear-gradient(135deg,gold,#fa0,#f80);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;text-shadow:none}.game-subtitle{font-size:16px;color:#ffffff80;margin-bottom:32px}.big-btn{padding:14px 40px;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#26a,#4ad);transition:all .25s;box-shadow:0 4px 20px #44aadd4d;margin:6px}.big-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px #44aadd80}.big-btn.secondary{background:linear-gradient(135deg,#555,#777);box-shadow:0 4px 12px #0000004d}#end-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:#000000d9;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:flex;justify-content:center;align-items:center;z-index:100}.end-content{text-align:center}#end-title{font-size:48px;font-weight:900;margin-bottom:16px}#end-score{font-size:22px;color:#ffffffb3;margin-bottom:12px}.rank{display:inline-block;font-size:64px;font-weight:900;width:90px;height:90px;line-height:90px;border-radius:50%;margin-bottom:24px}.rank-S{background:linear-gradient(135deg,gold,#f80);color:#222}.rank-A{background:linear-gradient(135deg,#4ad,#26a);color:#fff}.rank-B{background:linear-gradient(135deg,#4c8,#285);color:#fff}.rank-C{background:linear-gradient(135deg,#888,#555);color:#fff}.end-actions{display:flex;gap:12px;justify-content:center}#milestone-banner{position:fixed;top:30%;left:50%;transform:translate(-50%,-50%);z-index:22;pointer-events:none;text-align:center}#milestone-banner-text{font-size:36px;font-weight:900;color:gold;text-shadow:0 0 30px rgba(255,200,0,.8),0 2px 8px rgba(0,0,0,.9);animation:milestoneAnim .7s ease-out;padding:12px 24px;background:#00000080;border:2px solid rgba(255,200,0,.5);border-radius:16px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}@keyframes milestoneAnim{0%{transform:scale(.4) translateY(20px);opacity:0}60%{transform:scale(1.1) translateY(-4px)}to{transform:scale(1) translateY(0);opacity:1}}#streak-banner{position:fixed;top:22%;left:50%;transform:translate(-50%,-50%);z-index:21;pointer-events:none;font-size:30px;font-weight:900;padding:10px 22px;border-radius:14px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:streakPop .5s ease-out}#streak-banner.streak-normal{color:#f80;text-shadow:0 0 20px rgba(255,130,0,.8),0 2px 6px rgba(0,0,0,.9);background:#00000080;border:1px solid rgba(255,130,0,.4)}#streak-banner.streak-mega{color:#fe0;text-shadow:0 0 25px rgba(255,230,0,.9),0 2px 8px rgba(0,0,0,.9);background:#0009;border:2px solid rgba(255,220,0,.6);box-shadow:0 0 30px #ffdc004d}@keyframes streakPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}60%{transform:translate(-50%,-50%) scale(1.12)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}#floating-text-layer{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:18;overflow:hidden}.floating-text{position:absolute;font-size:14px;font-weight:800;text-shadow:0 1px 4px rgba(0,0,0,.9);pointer-events:none;white-space:nowrap;animation:floatUp 1s ease-out forwards;transform:translate(-50%)}@keyframes floatUp{0%{opacity:1;transform:translate(-50%) translateY(0)}to{opacity:0;transform:translate(-50%) translateY(-40px)}}#help-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:15px;font-weight:700;color:#ffffffb3;cursor:pointer;transition:all .2s}#help-btn:hover{color:#fff;background:#ffffff1f}#help-overlay{position:fixed;top:0;right:0;bottom:0;left:0;background:#000000b3;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:center;z-index:80}#help-content{background:#141923f2;border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:28px 36px;min-width:300px;text-align:center}.help-title{font-size:20px;font-weight:900;color:#fff;margin-bottom:20px}.help-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);gap:16px}.help-row:last-of-type{border-bottom:none}.help-key{font-size:13px;font-weight:700;color:gold;background:#ffc8001f;border:1px solid rgba(255,200,0,.3);border-radius:6px;padding:3px 10px;white-space:nowrap}.help-desc{font-size:13px;color:#ffffffbf;text-align:right}#help-close-btn{margin-top:20px;padding:10px 28px;background:linear-gradient(135deg,#26a,#4ad);border:none;border-radius:10px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#help-close-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px #4ad6}.hidden{display:none!important}#tower-tooltip{position:fixed;z-index:1000;background:#0a0f1ef2;border:1px solid #4ade80;border-radius:8px;padding:10px;color:#fff;pointer-events:none;box-shadow:0 4px 12px #00000080;font-size:14px;min-width:150px}#tower-tooltip .tooltip-name{font-weight:700;font-size:16px;color:#4ade80;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#tower-tooltip .tooltip-type{color:#aaa;font-size:12px;margin-bottom:6px;text-transform:capitalize}#tower-tooltip .tooltip-stats div{display:flex;justify-content:space-between;margin-top:2px}#tower-tooltip .tooltip-special{margin-top:6px;color:#fbbf24;font-size:12px;font-style:italic}#enemy-panel{position:absolute;top:60px;right:10px;background:#140a0ad9;border:1px solid #ff4444;border-radius:8px;padding:10px;color:#fff;pointer-events:none;box-shadow:0 4px 12px #ff00004d;font-size:14px;min-width:140px;text-transform:capitalize}#enemy-panel .panel-header{font-weight:700;font-size:16px;color:#f44;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#enemy-panel .panel-stats div{display:flex;justify-content:space-between;margin-top:2px}@media(max-width:600px){.game-title{font-size:36px}.build-btn{padding:6px 7px;min-width:48px}.build-icon{font-size:16px}.build-name{font-size:9px}.build-cost{font-size:8px}#tower-panel{width:180px;right:8px;bottom:120px}#wave-banner-text{font-size:28px}#build-menu{padding:8px 10px}}
/*$vite$:1*/`,document.head.appendChild(Pn);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const qt="170",ui=0,Ra=1,vu=2,ws=1,_u=2,hn=3,Ln=0,Pt=1,Lt=2,dn=0,hi=1,Er=2,Pa=3,La=4,xu=5,$n=100,Su=101,yu=102,Mu=103,wu=104,Eu=200,bu=201,Tu=202,Au=203,Es=204,bs=205,Cu=206,Ru=207,Pu=208,Lu=209,Iu=210,Du=211,Uu=212,Nu=213,Fu=214,Ts=0,As=1,Cs=2,di=3,Rs=4,Ps=5,Ls=6,Is=7,Ds=0,Ou=1,Bu=2,In=0,zu=1,ku=2,Hu=3,Ia=4,Gu=5,Vu=6,Wu=7,Da=300,fi=301,pi=302,Us=303,Ns=304,br=306,Fs=1e3,Zn=1001,Os=1002,Ut=1003,Xu=1004,Tr=1005,rn=1006,Bs=1007,Kn=1008,fn=1009,Ua=1010,Na=1011,$i=1012,zs=1013,jn=1014,sn=1015,pn=1016,ks=1017,Hs=1018,mi=1020,Fa=35902,Oa=1021,Ba=1022,Yt=1023,za=1024,ka=1025,gi=1026,vi=1027,Gs=1028,Vs=1029,Ha=1030,Ws=1031,Xs=1033,Ar=33776,Cr=33777,Rr=33778,Pr=33779,qs=35840,Ys=35841,$s=35842,Zs=35843,Ks=36196,js=37492,Js=37496,Qs=37808,eo=37809,to=37810,no=37811,io=37812,ro=37813,so=37814,oo=37815,ao=37816,lo=37817,co=37818,uo=37819,ho=37820,fo=37821,Lr=36492,po=36494,mo=36495,Ga=36283,go=36284,vo=36285,_o=36286,qu=3200,Yu=3201,xo=0,$u=1,Dn="",kt="srgb",_i="srgb-linear",Ir="linear",Je="srgb",xi=7680,Va=519,Zu=512,Ku=513,ju=514,Wa=515,Ju=516,Qu=517,eh=518,th=519,Xa=35044,qa="300 es",mn=2e3,Dr=2001;class Si{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const yt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],So=Math.PI/180,yo=180/Math.PI;function Zi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(yt[i&255]+yt[i>>8&255]+yt[i>>16&255]+yt[i>>24&255]+"-"+yt[e&255]+yt[e>>8&255]+"-"+yt[e>>16&15|64]+yt[e>>24&255]+"-"+yt[t&63|128]+yt[t>>8&255]+"-"+yt[t>>16&255]+yt[t>>24&255]+yt[n&255]+yt[n>>8&255]+yt[n>>16&255]+yt[n>>24&255]).toLowerCase()}function mt(i,e,t){return Math.max(e,Math.min(t,i))}function nh(i,e){return(i%e+e)%e}function Mo(i,e,t){return(1-t)*i+t*e}function Ki(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function It(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class Q{constructor(e=0,t=0){Q.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class De{constructor(e,t,n,r,s,o,a,l,c){De.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],d=n[7],p=n[2],f=n[5],g=n[8],_=r[0],m=r[3],h=r[6],y=r[1],M=r[4],v=r[7],R=r[2],b=r[5],A=r[8];return s[0]=o*_+a*y+l*R,s[3]=o*m+a*M+l*b,s[6]=o*h+a*v+l*A,s[1]=c*_+u*y+d*R,s[4]=c*m+u*M+d*b,s[7]=c*h+u*v+d*A,s[2]=p*_+f*y+g*R,s[5]=p*m+f*M+g*b,s[8]=p*h+f*v+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=u*o-a*c,p=a*l-u*s,f=c*s-o*l,g=t*d+n*p+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=d*_,e[1]=(r*c-u*n)*_,e[2]=(a*n-r*o)*_,e[3]=p*_,e[4]=(u*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(wo.makeScale(e,t)),this}rotate(e){return this.premultiply(wo.makeRotation(-e)),this}translate(e,t){return this.premultiply(wo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const wo=new De;function Ya(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ur(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ih(){const i=Ur("canvas");return i.style.display="block",i}const $a={};function ji(i){i in $a||($a[i]=!0,console.warn(i))}function rh(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function sh(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function oh(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Ve={enabled:!0,workingColorSpace:_i,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===Je&&(i.r=gn(i.r),i.g=gn(i.g),i.b=gn(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===Je&&(i.r=yi(i.r),i.g=yi(i.g),i.b=yi(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Dn?Ir:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function gn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function yi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Za=[.64,.33,.3,.6,.15,.06],Ka=[.2126,.7152,.0722],ja=[.3127,.329],Ja=new De().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Qa=new De().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ve.define({[_i]:{primaries:Za,whitePoint:ja,transfer:Ir,toXYZ:Ja,fromXYZ:Qa,luminanceCoefficients:Ka,workingColorSpaceConfig:{unpackColorSpace:kt},outputColorSpaceConfig:{drawingBufferColorSpace:kt}},[kt]:{primaries:Za,whitePoint:ja,transfer:Je,toXYZ:Ja,fromXYZ:Qa,luminanceCoefficients:Ka,outputColorSpaceConfig:{drawingBufferColorSpace:kt}}});let Mi;class ah{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Mi===void 0&&(Mi=Ur("canvas")),Mi.width=e.width,Mi.height=e.height;const n=Mi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Mi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ur("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=gn(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(gn(t[n]/255)*255):t[n]=gn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let lh=0;class el{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:lh++}),this.uuid=Zi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Eo(r[o].image)):s.push(Eo(r[o]))}else s=Eo(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function Eo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ah.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let ch=0;class Tt extends Si{constructor(e=Tt.DEFAULT_IMAGE,t=Tt.DEFAULT_MAPPING,n=Zn,r=Zn,s=rn,o=Kn,a=Yt,l=fn,c=Tt.DEFAULT_ANISOTROPY,u=Dn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ch++}),this.uuid=Zi(),this.name="",this.source=new el(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Q(0,0),this.repeat=new Q(1,1),this.center=new Q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new De,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Da)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Fs:e.x=e.x-Math.floor(e.x);break;case Zn:e.x=e.x<0?0:1;break;case Os:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Fs:e.y=e.y-Math.floor(e.y);break;case Zn:e.y=e.y<0?0:1;break;case Os:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Tt.DEFAULT_IMAGE=null,Tt.DEFAULT_MAPPING=Da,Tt.DEFAULT_ANISOTROPY=1;class Qe{constructor(e=0,t=0,n=0,r=1){Qe.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],u=l[4],d=l[8],p=l[1],f=l[5],g=l[9],_=l[2],m=l[6],h=l[10];if(Math.abs(u-p)<.01&&Math.abs(d-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+p)<.1&&Math.abs(d+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+h-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(c+1)/2,v=(f+1)/2,R=(h+1)/2,b=(u+p)/4,A=(d+_)/4,L=(g+m)/4;return M>v&&M>R?M<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(M),r=b/n,s=A/n):v>R?v<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),n=b/r,s=L/r):R<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(R),n=A/s,r=L/s),this.set(n,r,s,t),this}let y=Math.sqrt((m-g)*(m-g)+(d-_)*(d-_)+(p-u)*(p-u));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(d-_)/y,this.z=(p-u)/y,this.w=Math.acos((c+f+h-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class uh extends Si{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Qe(0,0,e,t),this.scissorTest=!1,this.viewport=new Qe(0,0,e,t);const r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:rn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Tt(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,r=e.textures.length;n<r;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new el(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class $t extends uh{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class tl extends Tt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class hh extends Tt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Ut,this.minFilter=Ut,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ji{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],d=n[r+3];const p=s[o+0],f=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d;return}if(a===1){e[t+0]=p,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(d!==_||l!==p||c!==f||u!==g){let m=1-a;const h=l*p+c*f+u*g+d*_,y=h>=0?1:-1,M=1-h*h;if(M>Number.EPSILON){const R=Math.sqrt(M),b=Math.atan2(R,h*y);m=Math.sin(m*b)/R,a=Math.sin(a*b)/R}const v=a*y;if(l=l*m+p*v,c=c*m+f*v,u=u*m+g*v,d=d*m+_*v,m===1-a){const R=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=R,c*=R,u*=R,d*=R}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],d=s[o],p=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+u*d+l*f-c*p,e[t+1]=l*g+u*p+c*d-a*f,e[t+2]=c*g+u*f+a*p-l*d,e[t+3]=u*g-a*d-l*p-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),d=a(s/2),p=l(n/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=p*u*d+c*f*g,this._y=c*f*d-p*u*g,this._z=c*u*g+p*f*d,this._w=c*u*d-p*f*g;break;case"YXZ":this._x=p*u*d+c*f*g,this._y=c*f*d-p*u*g,this._z=c*u*g-p*f*d,this._w=c*u*d+p*f*g;break;case"ZXY":this._x=p*u*d-c*f*g,this._y=c*f*d+p*u*g,this._z=c*u*g+p*f*d,this._w=c*u*d-p*f*g;break;case"ZYX":this._x=p*u*d-c*f*g,this._y=c*f*d+p*u*g,this._z=c*u*g-p*f*d,this._w=c*u*d+p*f*g;break;case"YZX":this._x=p*u*d+c*f*g,this._y=c*f*d+p*u*g,this._z=c*u*g-p*f*d,this._w=c*u*d-p*f*g;break;case"XZY":this._x=p*u*d-c*f*g,this._y=c*f*d-p*u*g,this._z=c*u*g+p*f*d,this._w=c*u*d+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],d=t[10],p=n+a+d;if(p>0){const f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(n>a&&n>d){const f=2*Math.sqrt(1+n-a-d);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>d){const f=2*Math.sqrt(1+a-n-d);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+d-n-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(mt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),d=Math.sin((1-t)*u)/c,p=Math.sin(t*u)/c;return this._w=o*d+this._w*p,this._x=n*d+this._x*p,this._y=r*d+this._y*p,this._z=s*d+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class C{constructor(e=0,t=0,n=0){C.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(nl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(nl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),d=2*(s*n-o*t);return this.x=t+l*c+o*d-a*u,this.y=n+l*u+a*c-s*d,this.z=r+l*d+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return bo.copy(this).projectOnVector(e),this.sub(bo)}reflect(e){return this.sub(bo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const bo=new C,nl=new Ji;class Jn{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Zt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Zt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Zt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Zt):Zt.fromBufferAttribute(s,o),Zt.applyMatrix4(e.matrixWorld),this.expandByPoint(Zt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Nr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Nr.copy(n.boundingBox)),Nr.applyMatrix4(e.matrixWorld),this.union(Nr)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zt),Zt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Qi),Fr.subVectors(this.max,Qi),wi.subVectors(e.a,Qi),Ei.subVectors(e.b,Qi),bi.subVectors(e.c,Qi),Un.subVectors(Ei,wi),Nn.subVectors(bi,Ei),Qn.subVectors(wi,bi);let t=[0,-Un.z,Un.y,0,-Nn.z,Nn.y,0,-Qn.z,Qn.y,Un.z,0,-Un.x,Nn.z,0,-Nn.x,Qn.z,0,-Qn.x,-Un.y,Un.x,0,-Nn.y,Nn.x,0,-Qn.y,Qn.x,0];return!To(t,wi,Ei,bi,Fr)||(t=[1,0,0,0,1,0,0,0,1],!To(t,wi,Ei,bi,Fr))?!1:(Or.crossVectors(Un,Nn),t=[Or.x,Or.y,Or.z],To(t,wi,Ei,bi,Fr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(vn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const vn=[new C,new C,new C,new C,new C,new C,new C,new C],Zt=new C,Nr=new Jn,wi=new C,Ei=new C,bi=new C,Un=new C,Nn=new C,Qn=new C,Qi=new C,Fr=new C,Or=new C,ei=new C;function To(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){ei.fromArray(i,s);const a=r.x*Math.abs(ei.x)+r.y*Math.abs(ei.y)+r.z*Math.abs(ei.z),l=e.dot(ei),c=t.dot(ei),u=n.dot(ei);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const dh=new Jn,er=new C,Ao=new C;class Ti{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):dh.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;er.subVectors(e,this.center);const t=er.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(er,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ao.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(er.copy(e.center).add(Ao)),this.expandByPoint(er.copy(e.center).sub(Ao))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const _n=new C,Co=new C,Br=new C,Fn=new C,Ro=new C,zr=new C,Po=new C;class Lo{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,_n)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=_n.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(_n.copy(this.origin).addScaledVector(this.direction,t),_n.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Co.copy(e).add(t).multiplyScalar(.5),Br.copy(t).sub(e).normalize(),Fn.copy(this.origin).sub(Co);const s=e.distanceTo(t)*.5,o=-this.direction.dot(Br),a=Fn.dot(this.direction),l=-Fn.dot(Br),c=Fn.lengthSq(),u=Math.abs(1-o*o);let d,p,f,g;if(u>0)if(d=o*l-a,p=o*a-l,g=s*u,d>=0)if(p>=-g)if(p<=g){const _=1/u;d*=_,p*=_,f=d*(d+o*p+2*a)+p*(o*d+p+2*l)+c}else p=s,d=Math.max(0,-(o*p+a)),f=-d*d+p*(p+2*l)+c;else p=-s,d=Math.max(0,-(o*p+a)),f=-d*d+p*(p+2*l)+c;else p<=-g?(d=Math.max(0,-(-o*s+a)),p=d>0?-s:Math.min(Math.max(-s,-l),s),f=-d*d+p*(p+2*l)+c):p<=g?(d=0,p=Math.min(Math.max(-s,-l),s),f=p*(p+2*l)+c):(d=Math.max(0,-(o*s+a)),p=d>0?s:Math.min(Math.max(-s,-l),s),f=-d*d+p*(p+2*l)+c);else p=o>0?-s:s,d=Math.max(0,-(o*p+a)),f=-d*d+p*(p+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(Co).addScaledVector(Br,p),f}intersectSphere(e,t){_n.subVectors(e.center,this.origin);const n=_n.dot(this.direction),r=_n.dot(_n)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,p=this.origin;return c>=0?(n=(e.min.x-p.x)*c,r=(e.max.x-p.x)*c):(n=(e.max.x-p.x)*c,r=(e.min.x-p.x)*c),u>=0?(s=(e.min.y-p.y)*u,o=(e.max.y-p.y)*u):(s=(e.max.y-p.y)*u,o=(e.min.y-p.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),d>=0?(a=(e.min.z-p.z)*d,l=(e.max.z-p.z)*d):(a=(e.max.z-p.z)*d,l=(e.min.z-p.z)*d),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,_n)!==null}intersectTriangle(e,t,n,r,s){Ro.subVectors(t,e),zr.subVectors(n,e),Po.crossVectors(Ro,zr);let o=this.direction.dot(Po),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Fn.subVectors(this.origin,e);const l=a*this.direction.dot(zr.crossVectors(Fn,zr));if(l<0)return null;const c=a*this.direction.dot(Ro.cross(Fn));if(c<0||l+c>o)return null;const u=-a*Fn.dot(Po);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ke{constructor(e,t,n,r,s,o,a,l,c,u,d,p,f,g,_,m){Ke.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,d,p,f,g,_,m)}set(e,t,n,r,s,o,a,l,c,u,d,p,f,g,_,m){const h=this.elements;return h[0]=e,h[4]=t,h[8]=n,h[12]=r,h[1]=s,h[5]=o,h[9]=a,h[13]=l,h[2]=c,h[6]=u,h[10]=d,h[14]=p,h[3]=f,h[7]=g,h[11]=_,h[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ke().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/Ai.setFromMatrixColumn(e,0).length(),s=1/Ai.setFromMatrixColumn(e,1).length(),o=1/Ai.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){const p=o*u,f=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=p-_*c,t[9]=-a*l,t[2]=_-p*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*u,f=l*d,g=c*u,_=c*d;t[0]=p+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=_+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*u,f=l*d,g=c*u,_=c*d;t[0]=p-_*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=_-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*u,f=o*d,g=a*u,_=a*d;t[0]=l*u,t[4]=g*c-f,t[8]=p*c+_,t[1]=l*d,t[5]=_*c+p,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=_-p*d,t[8]=g*d+f,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*d+g,t[10]=p-_*d}else if(e.order==="XZY"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=p*d+_,t[5]=o*u,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*u,t[10]=_*d+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(fh,e,ph)}lookAt(e,t,n){const r=this.elements;return Nt.subVectors(e,t),Nt.lengthSq()===0&&(Nt.z=1),Nt.normalize(),On.crossVectors(n,Nt),On.lengthSq()===0&&(Math.abs(n.z)===1?Nt.x+=1e-4:Nt.z+=1e-4,Nt.normalize(),On.crossVectors(n,Nt)),On.normalize(),kr.crossVectors(Nt,On),r[0]=On.x,r[4]=kr.x,r[8]=Nt.x,r[1]=On.y,r[5]=kr.y,r[9]=Nt.y,r[2]=On.z,r[6]=kr.z,r[10]=Nt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],d=n[5],p=n[9],f=n[13],g=n[2],_=n[6],m=n[10],h=n[14],y=n[3],M=n[7],v=n[11],R=n[15],b=r[0],A=r[4],L=r[8],E=r[12],S=r[1],P=r[5],k=r[9],O=r[13],G=r[2],K=r[6],W=r[10],te=r[14],V=r[3],se=r[7],he=r[11],Me=r[15];return s[0]=o*b+a*S+l*G+c*V,s[4]=o*A+a*P+l*K+c*se,s[8]=o*L+a*k+l*W+c*he,s[12]=o*E+a*O+l*te+c*Me,s[1]=u*b+d*S+p*G+f*V,s[5]=u*A+d*P+p*K+f*se,s[9]=u*L+d*k+p*W+f*he,s[13]=u*E+d*O+p*te+f*Me,s[2]=g*b+_*S+m*G+h*V,s[6]=g*A+_*P+m*K+h*se,s[10]=g*L+_*k+m*W+h*he,s[14]=g*E+_*O+m*te+h*Me,s[3]=y*b+M*S+v*G+R*V,s[7]=y*A+M*P+v*K+R*se,s[11]=y*L+M*k+v*W+R*he,s[15]=y*E+M*O+v*te+R*Me,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],d=e[6],p=e[10],f=e[14],g=e[3],_=e[7],m=e[11],h=e[15];return g*(+s*l*d-r*c*d-s*a*p+n*c*p+r*a*f-n*l*f)+_*(+t*l*f-t*c*p+s*o*p-r*o*f+r*c*u-s*l*u)+m*(+t*c*d-t*a*f-s*o*d+n*o*f+s*a*u-n*c*u)+h*(-r*a*u-t*l*d+t*a*p+r*o*d-n*o*p+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=e[9],p=e[10],f=e[11],g=e[12],_=e[13],m=e[14],h=e[15],y=d*m*c-_*p*c+_*l*f-a*m*f-d*l*h+a*p*h,M=g*p*c-u*m*c-g*l*f+o*m*f+u*l*h-o*p*h,v=u*_*c-g*d*c+g*a*f-o*_*f-u*a*h+o*d*h,R=g*d*l-u*_*l-g*a*p+o*_*p+u*a*m-o*d*m,b=t*y+n*M+r*v+s*R;if(b===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/b;return e[0]=y*A,e[1]=(_*p*s-d*m*s-_*r*f+n*m*f+d*r*h-n*p*h)*A,e[2]=(a*m*s-_*l*s+_*r*c-n*m*c-a*r*h+n*l*h)*A,e[3]=(d*l*s-a*p*s-d*r*c+n*p*c+a*r*f-n*l*f)*A,e[4]=M*A,e[5]=(u*m*s-g*p*s+g*r*f-t*m*f-u*r*h+t*p*h)*A,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*h-t*l*h)*A,e[7]=(o*p*s-u*l*s+u*r*c-t*p*c-o*r*f+t*l*f)*A,e[8]=v*A,e[9]=(g*d*s-u*_*s-g*n*f+t*_*f+u*n*h-t*d*h)*A,e[10]=(o*_*s-g*a*s+g*n*c-t*_*c-o*n*h+t*a*h)*A,e[11]=(u*a*s-o*d*s-u*n*c+t*d*c+o*n*f-t*a*f)*A,e[12]=R*A,e[13]=(u*_*r-g*d*r+g*n*p-t*_*p-u*n*m+t*d*m)*A,e[14]=(g*a*r-o*_*r-g*n*l+t*_*l+o*n*m-t*a*m)*A,e[15]=(o*d*r-u*a*r+u*n*l-t*d*l-o*n*p+t*a*p)*A,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,d=a+a,p=s*c,f=s*u,g=s*d,_=o*u,m=o*d,h=a*d,y=l*c,M=l*u,v=l*d,R=n.x,b=n.y,A=n.z;return r[0]=(1-(_+h))*R,r[1]=(f+v)*R,r[2]=(g-M)*R,r[3]=0,r[4]=(f-v)*b,r[5]=(1-(p+h))*b,r[6]=(m+y)*b,r[7]=0,r[8]=(g+M)*A,r[9]=(m-y)*A,r[10]=(1-(p+_))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=Ai.set(r[0],r[1],r[2]).length();const o=Ai.set(r[4],r[5],r[6]).length(),a=Ai.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Kt.copy(this);const c=1/s,u=1/o,d=1/a;return Kt.elements[0]*=c,Kt.elements[1]*=c,Kt.elements[2]*=c,Kt.elements[4]*=u,Kt.elements[5]*=u,Kt.elements[6]*=u,Kt.elements[8]*=d,Kt.elements[9]*=d,Kt.elements[10]*=d,t.setFromRotationMatrix(Kt),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=mn){const l=this.elements,c=2*s/(t-e),u=2*s/(n-r),d=(t+e)/(t-e),p=(n+r)/(n-r);let f,g;if(a===mn)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===Dr)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=mn){const l=this.elements,c=1/(t-e),u=1/(n-r),d=1/(o-s),p=(t+e)*c,f=(n+r)*u;let g,_;if(a===mn)g=(o+s)*d,_=-2*d;else if(a===Dr)g=s*d,_=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Ai=new C,Kt=new Ke,fh=new C(0,0,0),ph=new C(1,1,1),On=new C,kr=new C,Nt=new C,il=new Ke,rl=new Ji;class gt{constructor(e=0,t=0,n=0,r=gt.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],d=r[2],p=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(mt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-mt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(mt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-mt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(mt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-mt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return il.makeRotationFromQuaternion(e),this.setFromRotationMatrix(il,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return rl.setFromEuler(this),this.setFromQuaternion(rl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}gt.DEFAULT_ORDER="XYZ";class Io{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let mh=0;const sl=new C,Ci=new Ji,xn=new Ke,Hr=new C,tr=new C,gh=new C,vh=new Ji,ol=new C(1,0,0),al=new C(0,1,0),ll=new C(0,0,1),cl={type:"added"},_h={type:"removed"},Ri={type:"childadded",child:null},Do={type:"childremoved",child:null};class ht extends Si{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mh++}),this.uuid=Zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ht.DEFAULT_UP.clone();const e=new C,t=new gt,n=new Ji,r=new C(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ke},normalMatrix:{value:new De}}),this.matrix=new Ke,this.matrixWorld=new Ke,this.matrixAutoUpdate=ht.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ht.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Io,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ci.setFromAxisAngle(e,t),this.quaternion.multiply(Ci),this}rotateOnWorldAxis(e,t){return Ci.setFromAxisAngle(e,t),this.quaternion.premultiply(Ci),this}rotateX(e){return this.rotateOnAxis(ol,e)}rotateY(e){return this.rotateOnAxis(al,e)}rotateZ(e){return this.rotateOnAxis(ll,e)}translateOnAxis(e,t){return sl.copy(e).applyQuaternion(this.quaternion),this.position.add(sl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ol,e)}translateY(e){return this.translateOnAxis(al,e)}translateZ(e){return this.translateOnAxis(ll,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(xn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Hr.copy(e):Hr.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),tr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?xn.lookAt(tr,Hr,this.up):xn.lookAt(Hr,tr,this.up),this.quaternion.setFromRotationMatrix(xn),r&&(xn.extractRotation(r.matrixWorld),Ci.setFromRotationMatrix(xn),this.quaternion.premultiply(Ci.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(cl),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(_h),Do.child=e,this.dispatchEvent(Do),Do.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),xn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),xn.multiply(e.parent.matrixWorld)),e.applyMatrix4(xn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(cl),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,e,gh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tr,vh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),d=o(e.shapes),p=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),p.length>0&&(n.skeletons=p),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}ht.DEFAULT_UP=new C(0,1,0),ht.DEFAULT_MATRIX_AUTO_UPDATE=!0,ht.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const jt=new C,Sn=new C,Uo=new C,yn=new C,Pi=new C,Li=new C,ul=new C,No=new C,Fo=new C,Oo=new C,Bo=new Qe,zo=new Qe,ko=new Qe;class Jt{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),jt.subVectors(e,t),r.cross(jt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){jt.subVectors(r,t),Sn.subVectors(n,t),Uo.subVectors(e,t);const o=jt.dot(jt),a=jt.dot(Sn),l=jt.dot(Uo),c=Sn.dot(Sn),u=Sn.dot(Uo),d=o*c-a*a;if(d===0)return s.set(0,0,0),null;const p=1/d,f=(c*l-a*u)*p,g=(o*u-a*l)*p;return s.set(1-f-g,g,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,yn)===null?!1:yn.x>=0&&yn.y>=0&&yn.x+yn.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,yn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,yn.x),l.addScaledVector(o,yn.y),l.addScaledVector(a,yn.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return Bo.setScalar(0),zo.setScalar(0),ko.setScalar(0),Bo.fromBufferAttribute(e,t),zo.fromBufferAttribute(e,n),ko.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Bo,s.x),o.addScaledVector(zo,s.y),o.addScaledVector(ko,s.z),o}static isFrontFacing(e,t,n,r){return jt.subVectors(n,t),Sn.subVectors(e,t),jt.cross(Sn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return jt.subVectors(this.c,this.b),Sn.subVectors(this.a,this.b),jt.cross(Sn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Jt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Jt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return Jt.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return Jt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Jt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;Pi.subVectors(r,n),Li.subVectors(s,n),No.subVectors(e,n);const l=Pi.dot(No),c=Li.dot(No);if(l<=0&&c<=0)return t.copy(n);Fo.subVectors(e,r);const u=Pi.dot(Fo),d=Li.dot(Fo);if(u>=0&&d<=u)return t.copy(r);const p=l*d-u*c;if(p<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(Pi,o);Oo.subVectors(e,s);const f=Pi.dot(Oo),g=Li.dot(Oo);if(g>=0&&f<=g)return t.copy(s);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Li,a);const m=u*g-f*d;if(m<=0&&d-u>=0&&f-g>=0)return ul.subVectors(s,r),a=(d-u)/(d-u+(f-g)),t.copy(r).addScaledVector(ul,a);const h=1/(m+_+p);return o=_*h,a=p*h,t.copy(n).addScaledVector(Pi,o).addScaledVector(Li,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const hl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Bn={h:0,s:0,l:0},Gr={h:0,s:0,l:0};function Ho(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class we{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=kt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ve.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=Ve.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ve.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=Ve.workingColorSpace){if(e=nh(e,1),t=mt(t,0,1),n=mt(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=Ho(o,s,e+1/3),this.g=Ho(o,s,e),this.b=Ho(o,s,e-1/3)}return Ve.toWorkingColorSpace(this,r),this}setStyle(e,t=kt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=kt){const n=hl[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=gn(e.r),this.g=gn(e.g),this.b=gn(e.b),this}copyLinearToSRGB(e){return this.r=yi(e.r),this.g=yi(e.g),this.b=yi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=kt){return Ve.fromWorkingColorSpace(Mt.copy(this),e),Math.round(mt(Mt.r*255,0,255))*65536+Math.round(mt(Mt.g*255,0,255))*256+Math.round(mt(Mt.b*255,0,255))}getHexString(e=kt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ve.workingColorSpace){Ve.fromWorkingColorSpace(Mt.copy(this),t);const n=Mt.r,r=Mt.g,s=Mt.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=u<=.5?d/(o+a):d/(2-o-a),o){case n:l=(r-s)/d+(r<s?6:0);break;case r:l=(s-n)/d+2;break;case s:l=(n-r)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ve.workingColorSpace){return Ve.fromWorkingColorSpace(Mt.copy(this),t),e.r=Mt.r,e.g=Mt.g,e.b=Mt.b,e}getStyle(e=kt){Ve.fromWorkingColorSpace(Mt.copy(this),e);const t=Mt.r,n=Mt.g,r=Mt.b;return e!==kt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Bn),this.setHSL(Bn.h+e,Bn.s+t,Bn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Bn),e.getHSL(Gr);const n=Mo(Bn.h,Gr.h,t),r=Mo(Bn.s,Gr.s,t),s=Mo(Bn.l,Gr.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Mt=new we;we.NAMES=hl;let xh=0;class ti extends Si{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:xh++}),this.uuid=Zi(),this.name="",this.blending=hi,this.side=Ln,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Es,this.blendDst=bs,this.blendEquation=$n,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new we(0,0,0),this.blendAlpha=0,this.depthFunc=di,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Va,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=xi,this.stencilZFail=xi,this.stencilZPass=xi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==hi&&(n.blending=this.blending),this.side!==Ln&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Es&&(n.blendSrc=this.blendSrc),this.blendDst!==bs&&(n.blendDst=this.blendDst),this.blendEquation!==$n&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==di&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Va&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==xi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==xi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==xi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Ft extends ti{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new we(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gt,this.combine=Ds,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const dt=new C,Vr=new Q;class At{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Xa,this.updateRanges=[],this.gpuType=sn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Vr.fromBufferAttribute(this,t),Vr.applyMatrix3(e),this.setXY(t,Vr.x,Vr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)dt.fromBufferAttribute(this,t),dt.applyMatrix3(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)dt.fromBufferAttribute(this,t),dt.applyMatrix4(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)dt.fromBufferAttribute(this,t),dt.applyNormalMatrix(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)dt.fromBufferAttribute(this,t),dt.transformDirection(e),this.setXYZ(t,dt.x,dt.y,dt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ki(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=It(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ki(t,this.array)),t}setX(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ki(t,this.array)),t}setY(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ki(t,this.array)),t}setZ(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ki(t,this.array)),t}setW(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),r=It(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),r=It(r,this.array),s=It(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Xa&&(e.usage=this.usage),e}}class dl extends At{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class fl extends At{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class et extends At{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Sh=0;const Ht=new Ke,Go=new ht,Ii=new C,Ot=new Jn,nr=new Jn,vt=new C;class wt extends Si{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Sh++}),this.uuid=Zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ya(e)?fl:dl)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new De().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Ht.makeRotationFromQuaternion(e),this.applyMatrix4(Ht),this}rotateX(e){return Ht.makeRotationX(e),this.applyMatrix4(Ht),this}rotateY(e){return Ht.makeRotationY(e),this.applyMatrix4(Ht),this}rotateZ(e){return Ht.makeRotationZ(e),this.applyMatrix4(Ht),this}translate(e,t,n){return Ht.makeTranslation(e,t,n),this.applyMatrix4(Ht),this}scale(e,t,n){return Ht.makeScale(e,t,n),this.applyMatrix4(Ht),this}lookAt(e){return Go.lookAt(e),Go.updateMatrix(),this.applyMatrix4(Go.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ii).negate(),this.translate(Ii.x,Ii.y,Ii.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new et(n,3))}else{for(let n=0,r=t.count;n<r;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Jn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];Ot.setFromBufferAttribute(s),this.morphTargetsRelative?(vt.addVectors(this.boundingBox.min,Ot.min),this.boundingBox.expandByPoint(vt),vt.addVectors(this.boundingBox.max,Ot.max),this.boundingBox.expandByPoint(vt)):(this.boundingBox.expandByPoint(Ot.min),this.boundingBox.expandByPoint(Ot.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ti);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){const n=this.boundingSphere.center;if(Ot.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];nr.setFromBufferAttribute(a),this.morphTargetsRelative?(vt.addVectors(Ot.min,nr.min),Ot.expandByPoint(vt),vt.addVectors(Ot.max,nr.max),Ot.expandByPoint(vt)):(Ot.expandByPoint(nr.min),Ot.expandByPoint(nr.max))}Ot.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)vt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(vt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)vt.fromBufferAttribute(a,c),l&&(Ii.fromBufferAttribute(e,c),vt.add(Ii)),r=Math.max(r,n.distanceToSquared(vt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new At(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let L=0;L<n.count;L++)a[L]=new C,l[L]=new C;const c=new C,u=new C,d=new C,p=new Q,f=new Q,g=new Q,_=new C,m=new C;function h(L,E,S){c.fromBufferAttribute(n,L),u.fromBufferAttribute(n,E),d.fromBufferAttribute(n,S),p.fromBufferAttribute(s,L),f.fromBufferAttribute(s,E),g.fromBufferAttribute(s,S),u.sub(c),d.sub(c),f.sub(p),g.sub(p);const P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(P),m.copy(d).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(P),a[L].add(_),a[E].add(_),a[S].add(_),l[L].add(m),l[E].add(m),l[S].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let L=0,E=y.length;L<E;++L){const S=y[L],P=S.start,k=S.count;for(let O=P,G=P+k;O<G;O+=3)h(e.getX(O+0),e.getX(O+1),e.getX(O+2))}const M=new C,v=new C,R=new C,b=new C;function A(L){R.fromBufferAttribute(r,L),b.copy(R);const E=a[L];M.copy(E),M.sub(R.multiplyScalar(R.dot(E))).normalize(),v.crossVectors(b,E);const P=v.dot(l[L])<0?-1:1;o.setXYZW(L,M.x,M.y,M.z,P)}for(let L=0,E=y.length;L<E;++L){const S=y[L],P=S.start,k=S.count;for(let O=P,G=P+k;O<G;O+=3)A(e.getX(O+0)),A(e.getX(O+1)),A(e.getX(O+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new At(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let p=0,f=n.count;p<f;p++)n.setXYZ(p,0,0,0);const r=new C,s=new C,o=new C,a=new C,l=new C,c=new C,u=new C,d=new C;if(e)for(let p=0,f=e.count;p<f;p+=3){const g=e.getX(p+0),_=e.getX(p+1),m=e.getX(p+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,f=t.count;p<f;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),n.setXYZ(p+0,u.x,u.y,u.z),n.setXYZ(p+1,u.x,u.y,u.z),n.setXYZ(p+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)vt.fromBufferAttribute(e,t),vt.normalize(),e.setXYZ(t,vt.x,vt.y,vt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,d=a.normalized,p=new c.constructor(l.length*u);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let h=0;h<u;h++)p[g++]=c[f++]}return new At(p,u,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new wt,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let u=0,d=c.length;u<d;u++){const p=c[u],f=e(p,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,p=c.length;d<p;d++){const f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],d=s[c];for(let p=0,f=d.length;p<f;p++)u.push(d[p].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const pl=new Ke,ni=new Lo,Wr=new Ti,ml=new C,Xr=new C,qr=new C,Yr=new C,Vo=new C,$r=new C,gl=new C,Zr=new C;class xe extends ht{constructor(e=new wt,t=new Ft){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){$r.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=a[l],d=s[l];u!==0&&(Vo.fromBufferAttribute(d,e),o?$r.addScaledVector(Vo,u):$r.addScaledVector(Vo.sub(t),u))}t.add($r)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Wr.copy(n.boundingSphere),Wr.applyMatrix4(s),ni.copy(e.ray).recast(e.near),!(Wr.containsPoint(ni.origin)===!1&&(ni.intersectSphere(Wr,ml)===null||ni.origin.distanceToSquared(ml)>(e.far-e.near)**2))&&(pl.copy(s).invert(),ni.copy(e.ray).applyMatrix4(pl),!(n.boundingBox!==null&&ni.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ni)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,d=s.attributes.normal,p=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],h=o[m.materialIndex],y=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,R=M;v<R;v+=3){const b=a.getX(v),A=a.getX(v+1),L=a.getX(v+2);r=Kr(this,h,e,n,c,u,d,b,A,L),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,h=_;m<h;m+=3){const y=a.getX(m),M=a.getX(m+1),v=a.getX(m+2);r=Kr(this,o,e,n,c,u,d,y,M,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],h=o[m.materialIndex],y=Math.max(m.start,f.start),M=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,R=M;v<R;v+=3){const b=v,A=v+1,L=v+2;r=Kr(this,h,e,n,c,u,d,b,A,L),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,h=_;m<h;m+=3){const y=m,M=m+1,v=m+2;r=Kr(this,o,e,n,c,u,d,y,M,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function yh(i,e,t,n,r,s,o,a){let l;if(e.side===Pt?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===Ln,a),l===null)return null;Zr.copy(a),Zr.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Zr);return c<t.near||c>t.far?null:{distance:c,point:Zr.clone(),object:i}}function Kr(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,Xr),i.getVertexPosition(l,qr),i.getVertexPosition(c,Yr);const u=yh(i,e,t,n,Xr,qr,Yr,gl);if(u){const d=new C;Jt.getBarycoord(gl,Xr,qr,Yr,d),r&&(u.uv=Jt.getInterpolatedAttribute(r,a,l,c,d,new Q)),s&&(u.uv1=Jt.getInterpolatedAttribute(s,a,l,c,d,new Q)),o&&(u.normal=Jt.getInterpolatedAttribute(o,a,l,c,d,new C),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new C,materialIndex:0};Jt.getNormal(Xr,qr,Yr,p.normal),u.face=p,u.barycoord=d}return u}class Bt extends wt{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],u=[],d=[];let p=0,f=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new et(c,3)),this.setAttribute("normal",new et(u,3)),this.setAttribute("uv",new et(d,2));function g(_,m,h,y,M,v,R,b,A,L,E){const S=v/A,P=R/L,k=v/2,O=R/2,G=b/2,K=A+1,W=L+1;let te=0,V=0;const se=new C;for(let he=0;he<W;he++){const Me=he*P-O;for(let Be=0;Be<K;Be++){const tt=Be*S-k;se[_]=tt*y,se[m]=Me*M,se[h]=G,c.push(se.x,se.y,se.z),se[_]=0,se[m]=0,se[h]=b>0?1:-1,u.push(se.x,se.y,se.z),d.push(Be/A),d.push(1-he/L),te+=1}}for(let he=0;he<L;he++)for(let Me=0;Me<A;Me++){const Be=p+Me+K*he,tt=p+Me+K*(he+1),q=p+(Me+1)+K*(he+1),ne=p+(Me+1)+K*he;l.push(Be,tt,ne),l.push(tt,q,ne),V+=6}a.addGroup(f,V,E),f+=V,p+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Bt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Di(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Ct(i){const e={};for(let t=0;t<i.length;t++){const n=Di(i[t]);for(const r in n)e[r]=n[r]}return e}function Mh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function vl(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ve.workingColorSpace}const jr={clone:Di,merge:Ct};var wh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Eh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Rt extends ti{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=wh,this.fragmentShader=Eh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Di(e.uniforms),this.uniformsGroups=Mh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class _l extends ht{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ke,this.projectionMatrix=new Ke,this.projectionMatrixInverse=new Ke,this.coordinateSystem=mn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const zn=new C,xl=new Q,Sl=new Q;class Gt extends _l{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=yo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(So*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return yo*2*Math.atan(Math.tan(So*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){zn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(zn.x,zn.y).multiplyScalar(-e/zn.z),zn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(zn.x,zn.y).multiplyScalar(-e/zn.z)}getViewSize(e,t){return this.getViewBounds(e,xl,Sl),t.subVectors(Sl,xl)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(So*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ui=-90,Ni=1;class bh extends ht{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Gt(Ui,Ni,e,t);r.layers=this.layers,this.add(r);const s=new Gt(Ui,Ni,e,t);s.layers=this.layers,this.add(s);const o=new Gt(Ui,Ni,e,t);o.layers=this.layers,this.add(o);const a=new Gt(Ui,Ni,e,t);a.layers=this.layers,this.add(a);const l=new Gt(Ui,Ni,e,t);l.layers=this.layers,this.add(l);const c=new Gt(Ui,Ni,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Dr)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,u]=this.children,d=e.getRenderTarget(),p=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(d,p,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class yl extends Tt{constructor(e,t,n,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:fi,super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Th extends $t{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new yl(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:rn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Bt(5,5,5),s=new Rt({name:"CubemapFromEquirect",uniforms:Di(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Pt,blending:dn});s.uniforms.tEquirect.value=t;const o=new xe(r,s),a=t.minFilter;return t.minFilter===Kn&&(t.minFilter=rn),new bh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}const Wo=new C,Ah=new C,Ch=new De;class kn{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=Wo.subVectors(n,t).cross(Ah.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Wo),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Ch.getNormalMatrix(e),r=this.coplanarPoint(Wo).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ii=new Ti,Jr=new C;class Xo{constructor(e=new kn,t=new kn,n=new kn,r=new kn,s=new kn,o=new kn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn){const n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],d=r[6],p=r[7],f=r[8],g=r[9],_=r[10],m=r[11],h=r[12],y=r[13],M=r[14],v=r[15];if(n[0].setComponents(l-s,p-c,m-f,v-h).normalize(),n[1].setComponents(l+s,p+c,m+f,v+h).normalize(),n[2].setComponents(l+o,p+u,m+g,v+y).normalize(),n[3].setComponents(l-o,p-u,m-g,v-y).normalize(),n[4].setComponents(l-a,p-d,m-_,v-M).normalize(),t===mn)n[5].setComponents(l+a,p+d,m+_,v+M).normalize();else if(t===Dr)n[5].setComponents(a,d,_,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ii.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ii.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ii)}intersectsSprite(e){return ii.center.set(0,0,0),ii.radius=.7071067811865476,ii.applyMatrix4(e.matrixWorld),this.intersectsSphere(ii)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(Jr.x=r.normal.x>0?e.max.x:e.min.x,Jr.y=r.normal.y>0?e.max.y:e.min.y,Jr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Jr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Ml(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Rh(i){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,d=c.byteLength,p=i.createBuffer();i.bindBuffer(l,p),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){const u=l.array,d=l.updateRanges;if(i.bindBuffer(c,a),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<d.length;f++){const g=d[p],_=d[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++p,d[p]=_)}d.length=p+1;for(let f=0,g=d.length;f<g;f++){const _=d[f];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class ri extends wt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,d=e/a,p=t/l,f=[],g=[],_=[],m=[];for(let h=0;h<u;h++){const y=h*p-o;for(let M=0;M<c;M++){const v=M*d-s;g.push(v,-y,0),_.push(0,0,1),m.push(M/a),m.push(1-h/l)}}for(let h=0;h<l;h++)for(let y=0;y<a;y++){const M=y+c*h,v=y+c*(h+1),R=y+1+c*(h+1),b=y+1+c*h;f.push(M,v,b),f.push(v,R,b)}this.setIndex(f),this.setAttribute("position",new et(g,3)),this.setAttribute("normal",new et(_,3)),this.setAttribute("uv",new et(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ri(e.width,e.height,e.widthSegments,e.heightSegments)}}var Ph=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Lh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ih=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Dh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Uh=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Nh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Fh=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Oh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Bh=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,zh=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,kh=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Hh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Gh=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Vh=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Wh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Xh=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,qh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Yh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$h=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Zh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Kh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,jh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Jh=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Qh=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ed=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,td=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,nd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,id=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,rd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,sd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,od="gl_FragColor = linearToOutputTexel( gl_FragColor );",ad=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ld=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,cd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ud=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,hd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,dd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,pd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,md=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,gd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,vd=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,_d=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,xd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Sd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,yd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Md=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,wd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ed=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Td=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ad=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Cd=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Rd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Pd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ld=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Id=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Dd=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ud=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Nd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Fd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Od=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Bd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,zd=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,kd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Gd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Vd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Wd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xd=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,qd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Yd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$d=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Zd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Kd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Jd=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Qd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ef=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,tf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,nf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,rf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,sf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,of=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,af=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,lf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,cf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,uf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,df=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,ff=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,pf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,mf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,gf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,vf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,_f=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,xf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Sf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,yf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Mf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,wf=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Ef=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,bf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Tf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Af=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Cf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Rf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Fe={alphahash_fragment:Ph,alphahash_pars_fragment:Lh,alphamap_fragment:Ih,alphamap_pars_fragment:Dh,alphatest_fragment:Uh,alphatest_pars_fragment:Nh,aomap_fragment:Fh,aomap_pars_fragment:Oh,batching_pars_vertex:Bh,batching_vertex:zh,begin_vertex:kh,beginnormal_vertex:Hh,bsdfs:Gh,iridescence_fragment:Vh,bumpmap_pars_fragment:Wh,clipping_planes_fragment:Xh,clipping_planes_pars_fragment:qh,clipping_planes_pars_vertex:Yh,clipping_planes_vertex:$h,color_fragment:Zh,color_pars_fragment:Kh,color_pars_vertex:jh,color_vertex:Jh,common:Qh,cube_uv_reflection_fragment:ed,defaultnormal_vertex:td,displacementmap_pars_vertex:nd,displacementmap_vertex:id,emissivemap_fragment:rd,emissivemap_pars_fragment:sd,colorspace_fragment:od,colorspace_pars_fragment:ad,envmap_fragment:ld,envmap_common_pars_fragment:cd,envmap_pars_fragment:ud,envmap_pars_vertex:hd,envmap_physical_pars_fragment:Md,envmap_vertex:dd,fog_vertex:fd,fog_pars_vertex:pd,fog_fragment:md,fog_pars_fragment:gd,gradientmap_pars_fragment:vd,lightmap_pars_fragment:_d,lights_lambert_fragment:xd,lights_lambert_pars_fragment:Sd,lights_pars_begin:yd,lights_toon_fragment:wd,lights_toon_pars_fragment:Ed,lights_phong_fragment:bd,lights_phong_pars_fragment:Td,lights_physical_fragment:Ad,lights_physical_pars_fragment:Cd,lights_fragment_begin:Rd,lights_fragment_maps:Pd,lights_fragment_end:Ld,logdepthbuf_fragment:Id,logdepthbuf_pars_fragment:Dd,logdepthbuf_pars_vertex:Ud,logdepthbuf_vertex:Nd,map_fragment:Fd,map_pars_fragment:Od,map_particle_fragment:Bd,map_particle_pars_fragment:zd,metalnessmap_fragment:kd,metalnessmap_pars_fragment:Hd,morphinstance_vertex:Gd,morphcolor_vertex:Vd,morphnormal_vertex:Wd,morphtarget_pars_vertex:Xd,morphtarget_vertex:qd,normal_fragment_begin:Yd,normal_fragment_maps:$d,normal_pars_fragment:Zd,normal_pars_vertex:Kd,normal_vertex:jd,normalmap_pars_fragment:Jd,clearcoat_normal_fragment_begin:Qd,clearcoat_normal_fragment_maps:ef,clearcoat_pars_fragment:tf,iridescence_pars_fragment:nf,opaque_fragment:rf,packing:sf,premultiplied_alpha_fragment:of,project_vertex:af,dithering_fragment:lf,dithering_pars_fragment:cf,roughnessmap_fragment:uf,roughnessmap_pars_fragment:hf,shadowmap_pars_fragment:df,shadowmap_pars_vertex:ff,shadowmap_vertex:pf,shadowmask_pars_fragment:mf,skinbase_vertex:gf,skinning_pars_vertex:vf,skinning_vertex:_f,skinnormal_vertex:xf,specularmap_fragment:Sf,specularmap_pars_fragment:yf,tonemapping_fragment:Mf,tonemapping_pars_fragment:wf,transmission_fragment:Ef,transmission_pars_fragment:bf,uv_pars_fragment:Tf,uv_pars_vertex:Af,uv_vertex:Cf,worldpos_vertex:Rf,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distanceRGBA_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},ie={common:{diffuse:{value:new we(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new De}},envmap:{envMap:{value:null},envMapRotation:{value:new De},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new De}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new De}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new De},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new De},normalScale:{value:new Q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new De},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new De}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new De}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new De}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new we(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new we(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0},uvTransform:{value:new De}},sprite:{diffuse:{value:new we(16777215)},opacity:{value:1},center:{value:new Q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}}},on={basic:{uniforms:Ct([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.fog]),vertexShader:Fe.meshbasic_vert,fragmentShader:Fe.meshbasic_frag},lambert:{uniforms:Ct([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new we(0)}}]),vertexShader:Fe.meshlambert_vert,fragmentShader:Fe.meshlambert_frag},phong:{uniforms:Ct([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new we(0)},specular:{value:new we(1118481)},shininess:{value:30}}]),vertexShader:Fe.meshphong_vert,fragmentShader:Fe.meshphong_frag},standard:{uniforms:Ct([ie.common,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.roughnessmap,ie.metalnessmap,ie.fog,ie.lights,{emissive:{value:new we(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag},toon:{uniforms:Ct([ie.common,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.gradientmap,ie.fog,ie.lights,{emissive:{value:new we(0)}}]),vertexShader:Fe.meshtoon_vert,fragmentShader:Fe.meshtoon_frag},matcap:{uniforms:Ct([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,{matcap:{value:null}}]),vertexShader:Fe.meshmatcap_vert,fragmentShader:Fe.meshmatcap_frag},points:{uniforms:Ct([ie.points,ie.fog]),vertexShader:Fe.points_vert,fragmentShader:Fe.points_frag},dashed:{uniforms:Ct([ie.common,ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Fe.linedashed_vert,fragmentShader:Fe.linedashed_frag},depth:{uniforms:Ct([ie.common,ie.displacementmap]),vertexShader:Fe.depth_vert,fragmentShader:Fe.depth_frag},normal:{uniforms:Ct([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,{opacity:{value:1}}]),vertexShader:Fe.meshnormal_vert,fragmentShader:Fe.meshnormal_frag},sprite:{uniforms:Ct([ie.sprite,ie.fog]),vertexShader:Fe.sprite_vert,fragmentShader:Fe.sprite_frag},background:{uniforms:{uvTransform:{value:new De},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Fe.background_vert,fragmentShader:Fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new De}},vertexShader:Fe.backgroundCube_vert,fragmentShader:Fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Fe.cube_vert,fragmentShader:Fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Fe.equirect_vert,fragmentShader:Fe.equirect_frag},distanceRGBA:{uniforms:Ct([ie.common,ie.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Fe.distanceRGBA_vert,fragmentShader:Fe.distanceRGBA_frag},shadow:{uniforms:Ct([ie.lights,ie.fog,{color:{value:new we(0)},opacity:{value:1}}]),vertexShader:Fe.shadow_vert,fragmentShader:Fe.shadow_frag}};on.physical={uniforms:Ct([on.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new De},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new De},clearcoatNormalScale:{value:new Q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new De},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new De},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new De},sheen:{value:0},sheenColor:{value:new we(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new De},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new De},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new De},transmissionSamplerSize:{value:new Q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new De},attenuationDistance:{value:0},attenuationColor:{value:new we(0)},specularColor:{value:new we(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new De},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new De},anisotropyVector:{value:new Q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new De}}]),vertexShader:Fe.meshphysical_vert,fragmentShader:Fe.meshphysical_frag};const Qr={r:0,b:0,g:0},si=new gt,Pf=new Ke;function Lf(i,e,t,n,r,s,o){const a=new we(0);let l=s===!0?0:1,c,u,d=null,p=0,f=null;function g(y){let M=y.isScene===!0?y.background:null;return M&&M.isTexture&&(M=(y.backgroundBlurriness>0?t:e).get(M)),M}function _(y){let M=!1;const v=g(y);v===null?h(a,l):v&&v.isColor&&(h(v,1),M=!0);const R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(y,M){const v=g(M);v&&(v.isCubeTexture||v.mapping===br)?(u===void 0&&(u=new xe(new Bt(1,1,1),new Rt({name:"BackgroundCubeMaterial",uniforms:Di(on.backgroundCube.uniforms),vertexShader:on.backgroundCube.vertexShader,fragmentShader:on.backgroundCube.fragmentShader,side:Pt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,b,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),si.copy(M.backgroundRotation),si.x*=-1,si.y*=-1,si.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(si.y*=-1,si.z*=-1),u.material.uniforms.envMap.value=v,u.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Pf.makeRotationFromEuler(si)),u.material.toneMapped=Ve.getTransfer(v.colorSpace)!==Je,(d!==v||p!==v.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,d=v,p=v.version,f=i.toneMapping),u.layers.enableAll(),y.unshift(u,u.geometry,u.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new xe(new ri(2,2),new Rt({name:"BackgroundMaterial",uniforms:Di(on.background.uniforms),vertexShader:on.background.vertexShader,fragmentShader:on.background.fragmentShader,side:Ln,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=Ve.getTransfer(v.colorSpace)!==Je,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(d!==v||p!==v.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,d=v,p=v.version,f=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function h(y,M){y.getRGB(Qr,vl(i)),n.buffers.color.setClear(Qr.r,Qr.g,Qr.b,M,o)}return{getClearColor:function(){return a},setClearColor:function(y,M=1){a.set(y),l=M,h(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,h(a,l)},render:_,addToRenderList:m}}function If(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=p(null);let s=r,o=!1;function a(S,P,k,O,G){let K=!1;const W=d(O,k,P);s!==W&&(s=W,c(s.object)),K=f(S,O,k,G),K&&g(S,O,k,G),G!==null&&e.update(G,i.ELEMENT_ARRAY_BUFFER),(K||o)&&(o=!1,v(S,P,k,O),G!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(G).buffer))}function l(){return i.createVertexArray()}function c(S){return i.bindVertexArray(S)}function u(S){return i.deleteVertexArray(S)}function d(S,P,k){const O=k.wireframe===!0;let G=n[S.id];G===void 0&&(G={},n[S.id]=G);let K=G[P.id];K===void 0&&(K={},G[P.id]=K);let W=K[O];return W===void 0&&(W=p(l()),K[O]=W),W}function p(S){const P=[],k=[],O=[];for(let G=0;G<t;G++)P[G]=0,k[G]=0,O[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:k,attributeDivisors:O,object:S,attributes:{},index:null}}function f(S,P,k,O){const G=s.attributes,K=P.attributes;let W=0;const te=k.getAttributes();for(const V in te)if(te[V].location>=0){const he=G[V];let Me=K[V];if(Me===void 0&&(V==="instanceMatrix"&&S.instanceMatrix&&(Me=S.instanceMatrix),V==="instanceColor"&&S.instanceColor&&(Me=S.instanceColor)),he===void 0||he.attribute!==Me||Me&&he.data!==Me.data)return!0;W++}return s.attributesNum!==W||s.index!==O}function g(S,P,k,O){const G={},K=P.attributes;let W=0;const te=k.getAttributes();for(const V in te)if(te[V].location>=0){let he=K[V];he===void 0&&(V==="instanceMatrix"&&S.instanceMatrix&&(he=S.instanceMatrix),V==="instanceColor"&&S.instanceColor&&(he=S.instanceColor));const Me={};Me.attribute=he,he&&he.data&&(Me.data=he.data),G[V]=Me,W++}s.attributes=G,s.attributesNum=W,s.index=O}function _(){const S=s.newAttributes;for(let P=0,k=S.length;P<k;P++)S[P]=0}function m(S){h(S,0)}function h(S,P){const k=s.newAttributes,O=s.enabledAttributes,G=s.attributeDivisors;k[S]=1,O[S]===0&&(i.enableVertexAttribArray(S),O[S]=1),G[S]!==P&&(i.vertexAttribDivisor(S,P),G[S]=P)}function y(){const S=s.newAttributes,P=s.enabledAttributes;for(let k=0,O=P.length;k<O;k++)P[k]!==S[k]&&(i.disableVertexAttribArray(k),P[k]=0)}function M(S,P,k,O,G,K,W){W===!0?i.vertexAttribIPointer(S,P,k,G,K):i.vertexAttribPointer(S,P,k,O,G,K)}function v(S,P,k,O){_();const G=O.attributes,K=k.getAttributes(),W=P.defaultAttributeValues;for(const te in K){const V=K[te];if(V.location>=0){let se=G[te];if(se===void 0&&(te==="instanceMatrix"&&S.instanceMatrix&&(se=S.instanceMatrix),te==="instanceColor"&&S.instanceColor&&(se=S.instanceColor)),se!==void 0){const he=se.normalized,Me=se.itemSize,Be=e.get(se);if(Be===void 0)continue;const tt=Be.buffer,q=Be.type,ne=Be.bytesPerElement,_e=q===i.INT||q===i.UNSIGNED_INT||se.gpuType===zs;if(se.isInterleavedBufferAttribute){const oe=se.data,Re=oe.stride,Ie=se.offset;if(oe.isInstancedInterleavedBuffer){for(let ze=0;ze<V.locationSize;ze++)h(V.location+ze,oe.meshPerAttribute);S.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let ze=0;ze<V.locationSize;ze++)m(V.location+ze);i.bindBuffer(i.ARRAY_BUFFER,tt);for(let ze=0;ze<V.locationSize;ze++)M(V.location+ze,Me/V.locationSize,q,he,Re*ne,(Ie+Me/V.locationSize*ze)*ne,_e)}else{if(se.isInstancedBufferAttribute){for(let oe=0;oe<V.locationSize;oe++)h(V.location+oe,se.meshPerAttribute);S.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=se.meshPerAttribute*se.count)}else for(let oe=0;oe<V.locationSize;oe++)m(V.location+oe);i.bindBuffer(i.ARRAY_BUFFER,tt);for(let oe=0;oe<V.locationSize;oe++)M(V.location+oe,Me/V.locationSize,q,he,Me*ne,Me/V.locationSize*oe*ne,_e)}}else if(W!==void 0){const he=W[te];if(he!==void 0)switch(he.length){case 2:i.vertexAttrib2fv(V.location,he);break;case 3:i.vertexAttrib3fv(V.location,he);break;case 4:i.vertexAttrib4fv(V.location,he);break;default:i.vertexAttrib1fv(V.location,he)}}}}y()}function R(){L();for(const S in n){const P=n[S];for(const k in P){const O=P[k];for(const G in O)u(O[G].object),delete O[G];delete P[k]}delete n[S]}}function b(S){if(n[S.id]===void 0)return;const P=n[S.id];for(const k in P){const O=P[k];for(const G in O)u(O[G].object),delete O[G];delete P[k]}delete n[S.id]}function A(S){for(const P in n){const k=n[P];if(k[S.id]===void 0)continue;const O=k[S.id];for(const G in O)u(O[G].object),delete O[G];delete k[S.id]}}function L(){E(),o=!0,s!==r&&(s=r,c(s.object))}function E(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:L,resetDefaultState:E,dispose:R,releaseStatesOfGeometry:b,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function Df(i,e,t){let n;function r(c){n=c}function s(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function o(c,u,d){d!==0&&(i.drawArraysInstanced(n,c,u,d),t.update(u,n,d))}function a(c,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,d);let f=0;for(let g=0;g<d;g++)f+=u[g];t.update(f,n,1)}function l(c,u,d,p){if(d===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,p,0,d);let g=0;for(let _=0;_<d;_++)g+=u[_]*p[_];t.update(g,n,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Uf(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(A){return!(A!==Yt&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const L=A===pn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==fn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==sn&&!L)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),h=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,b=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reverseDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:h,maxVertexUniforms:y,maxVaryings:M,maxFragmentUniforms:v,vertexTextures:R,maxSamples:b}}function Nf(i){const e=this;let t=null,n=0,r=!1,s=!1;const o=new kn,a=new De,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,p){const f=d.length!==0||p||n!==0||r;return r=p,n=d.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,p){t=u(d,p,0)},this.setState=function(d,p,f){const g=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,h=i.get(d);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{const y=s?0:n,M=y*4;let v=h.clippingState||null;l.value=v,v=u(g,p,M,f);for(let R=0;R!==M;++R)v[R]=t[R];h.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,p,f,g){const _=d!==null?d.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const h=f+_*4,y=p.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<h)&&(m=new Float32Array(h));for(let M=0,v=f;M!==_;++M,v+=4)o.copy(d[M]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Ff(i){let e=new WeakMap;function t(o,a){return a===Us?o.mapping=fi:a===Ns&&(o.mapping=pi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Us||a===Ns)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Th(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class es extends _l{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Fi=4,wl=[.125,.215,.35,.446,.526,.582],oi=20,qo=new es,El=new we;let Yo=null,$o=0,Zo=0,Ko=!1;const ai=(1+Math.sqrt(5))/2,Oi=1/ai,bl=[new C(-ai,Oi,0),new C(ai,Oi,0),new C(-Oi,0,ai),new C(Oi,0,ai),new C(0,ai,-Oi),new C(0,ai,Oi),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)];class Tl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Yo=this._renderer.getRenderTarget(),$o=this._renderer.getActiveCubeFace(),Zo=this._renderer.getActiveMipmapLevel(),Ko=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Rl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Cl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Yo,$o,Zo),this._renderer.xr.enabled=Ko,e.scissorTest=!1,ts(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===fi||e.mapping===pi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Yo=this._renderer.getRenderTarget(),$o=this._renderer.getActiveCubeFace(),Zo=this._renderer.getActiveMipmapLevel(),Ko=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:rn,minFilter:rn,generateMipmaps:!1,type:pn,format:Yt,colorSpace:_i,depthBuffer:!1},r=Al(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Al(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Of(s)),this._blurMaterial=Bf(s,e,t)}return r}_compileMaterial(e){const t=new xe(this._lodPlanes[0],e);this._renderer.compile(t,qo)}_sceneToCubeUV(e,t,n,r){const a=new Gt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,p=u.toneMapping;u.getClearColor(El),u.toneMapping=In,u.autoClear=!1;const f=new Ft({name:"PMREM.Background",side:Pt,depthWrite:!1,depthTest:!1}),g=new xe(new Bt,f);let _=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(El),_=!0);for(let h=0;h<6;h++){const y=h%3;y===0?(a.up.set(0,l[h],0),a.lookAt(c[h],0,0)):y===1?(a.up.set(0,0,l[h]),a.lookAt(0,c[h],0)):(a.up.set(0,l[h],0),a.lookAt(0,0,c[h]));const M=this._cubeSize;ts(r,y*M,h>2?M:0,M,M),u.setRenderTarget(r),_&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=p,u.autoClear=d,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===fi||e.mapping===pi;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Rl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Cl());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new xe(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;ts(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,qo)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=bl[(r-s-1)%bl.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,d=new xe(this._lodPlanes[r],c),p=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*oi-1),_=s/g,m=isFinite(s)?1+Math.floor(u*_):oi;m>oi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${oi}`);const h=[];let y=0;for(let A=0;A<oi;++A){const L=A/_,E=Math.exp(-L*L/2);h.push(E),A===0?y+=E:A<m&&(y+=2*E)}for(let A=0;A<h.length;A++)h[A]=h[A]/y;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=h,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:M}=this;p.dTheta.value=g,p.mipInt.value=M-n;const v=this._sizeLods[r],R=3*v*(r>M-Fi?r-M+Fi:0),b=4*(this._cubeSize-v);ts(t,R,b,3*v,2*v),l.setRenderTarget(t),l.render(d,qo)}}function Of(i){const e=[],t=[],n=[];let r=i;const s=i-Fi+1+wl.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>i-Fi?l=wl[o-i+Fi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,d=1+c,p=[u,u,d,u,d,d,u,u,d,d,u,d],f=6,g=6,_=3,m=2,h=1,y=new Float32Array(_*g*f),M=new Float32Array(m*g*f),v=new Float32Array(h*g*f);for(let b=0;b<f;b++){const A=b%3*2/3-1,L=b>2?0:-1,E=[A,L,0,A+2/3,L,0,A+2/3,L+1,0,A,L,0,A+2/3,L+1,0,A,L+1,0];y.set(E,_*g*b),M.set(p,m*g*b);const S=[b,b,b,b,b,b];v.set(S,h*g*b)}const R=new wt;R.setAttribute("position",new At(y,_)),R.setAttribute("uv",new At(M,m)),R.setAttribute("faceIndex",new At(v,h)),e.push(R),r>Fi&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Al(i,e,t){const n=new $t(i,e,t);return n.texture.mapping=br,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ts(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Bf(i,e,t){const n=new Float32Array(oi),r=new C(0,1,0);return new Rt({name:"SphericalGaussianBlur",defines:{n:oi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:dn,depthTest:!1,depthWrite:!1})}function Cl(){return new Rt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:dn,depthTest:!1,depthWrite:!1})}function Rl(){return new Rt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:dn,depthTest:!1,depthWrite:!1})}function jo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function zf(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Us||l===Ns,u=l===fi||l===pi;if(c||u){let d=e.get(a);const p=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new Tl(i)),d=c?t.fromEquirectangular(a,d):t.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),d.texture;if(d!==void 0)return d.texture;{const f=a.image;return c&&f&&f.height>0||u&&f&&r(f)?(t===null&&(t=new Tl(i)),d=c?t.fromEquirectangular(a):t.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),a.addEventListener("dispose",s),d.texture):null}}}return a}function r(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function kf(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&ji("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function Hf(i,e,t,n){const r={},s=new WeakMap;function o(d){const p=d.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const _=p.morphAttributes[g];for(let m=0,h=_.length;m<h;m++)e.remove(_[m])}p.removeEventListener("dispose",o),delete r[p.id];const f=s.get(p);f&&(e.remove(f),s.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(d,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,t.memory.geometries++),p}function l(d){const p=d.attributes;for(const g in p)e.update(p[g],i.ARRAY_BUFFER);const f=d.morphAttributes;for(const g in f){const _=f[g];for(let m=0,h=_.length;m<h;m++)e.update(_[m],i.ARRAY_BUFFER)}}function c(d){const p=[],f=d.index,g=d.attributes.position;let _=0;if(f!==null){const y=f.array;_=f.version;for(let M=0,v=y.length;M<v;M+=3){const R=y[M+0],b=y[M+1],A=y[M+2];p.push(R,b,b,A,A,R)}}else if(g!==void 0){const y=g.array;_=g.version;for(let M=0,v=y.length/3-1;M<v;M+=3){const R=M+0,b=M+1,A=M+2;p.push(R,b,b,A,A,R)}}else return;const m=new(Ya(p)?fl:dl)(p,1);m.version=_;const h=s.get(d);h&&e.remove(h),s.set(d,m)}function u(d){const p=s.get(d);if(p){const f=d.index;f!==null&&p.version<f.version&&c(d)}else c(d);return s.get(d)}return{get:a,update:l,getWireframeAttribute:u}}function Gf(i,e,t){let n;function r(p){n=p}let s,o;function a(p){s=p.type,o=p.bytesPerElement}function l(p,f){i.drawElements(n,f,s,p*o),t.update(f,n,1)}function c(p,f,g){g!==0&&(i.drawElementsInstanced(n,f,s,p*o,g),t.update(f,n,g))}function u(p,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,p,0,g);let m=0;for(let h=0;h<g;h++)m+=f[h];t.update(m,n,1)}function d(p,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let h=0;h<p.length;h++)c(p[h]/o,f[h],_[h]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,s,p,0,_,0,g);let h=0;for(let y=0;y<g;y++)h+=f[y]*_[y];t.update(h,n,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Vf(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Wf(i,e,t){const n=new WeakMap,r=new Qe;function s(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0;let p=n.get(a);if(p===void 0||p.count!==d){let E=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",E)};p!==void 0&&p.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],h=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let M=0;f===!0&&(M=1),g===!0&&(M=2),_===!0&&(M=3);let v=a.attributes.position.count*M,R=1;v>e.maxTextureSize&&(R=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);const b=new Float32Array(v*R*4*d),A=new tl(b,v,R,d);A.type=sn,A.needsUpdate=!0;const L=M*4;for(let S=0;S<d;S++){const P=m[S],k=h[S],O=y[S],G=v*R*4*S;for(let K=0;K<P.count;K++){const W=K*L;f===!0&&(r.fromBufferAttribute(P,K),b[G+W+0]=r.x,b[G+W+1]=r.y,b[G+W+2]=r.z,b[G+W+3]=0),g===!0&&(r.fromBufferAttribute(k,K),b[G+W+4]=r.x,b[G+W+5]=r.y,b[G+W+6]=r.z,b[G+W+7]=0),_===!0&&(r.fromBufferAttribute(O,K),b[G+W+8]=r.x,b[G+W+9]=r.y,b[G+W+10]=r.z,b[G+W+11]=O.itemSize===4?r.w:1)}}p={count:d,texture:A,size:new Q(v,R)},n.set(a,p),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",p.size)}return{update:s}}function Xf(i,e,t,n){let r=new WeakMap;function s(l){const c=n.render.frame,u=l.geometry,d=e.get(l,u);if(r.get(d)!==c&&(e.update(d),r.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==c&&(p.update(),r.set(p,c))}return d}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class Pl extends Tt{constructor(e,t,n,r,s,o,a,l,c,u=gi){if(u!==gi&&u!==vi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===gi&&(n=jn),n===void 0&&u===vi&&(n=mi),super(null,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Ut,this.minFilter=l!==void 0?l:Ut,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Ll=new Tt,Il=new Pl(1,1),Dl=new tl,Ul=new hh,Nl=new yl,Fl=[],Ol=[],Bl=new Float32Array(16),zl=new Float32Array(9),kl=new Float32Array(4);function Bi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=Fl[r];if(s===void 0&&(s=new Float32Array(r),Fl[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function ft(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function pt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function ns(i,e){let t=Ol[e];t===void 0&&(t=new Int32Array(e),Ol[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function qf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Yf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;i.uniform2fv(this.addr,e),pt(t,e)}}function $f(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(ft(t,e))return;i.uniform3fv(this.addr,e),pt(t,e)}}function Zf(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;i.uniform4fv(this.addr,e),pt(t,e)}}function Kf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ft(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,n))return;kl.set(n),i.uniformMatrix2fv(this.addr,!1,kl),pt(t,n)}}function jf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ft(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,n))return;zl.set(n),i.uniformMatrix3fv(this.addr,!1,zl),pt(t,n)}}function Jf(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(ft(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),pt(t,e)}else{if(ft(t,n))return;Bl.set(n),i.uniformMatrix4fv(this.addr,!1,Bl),pt(t,n)}}function Qf(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function ep(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;i.uniform2iv(this.addr,e),pt(t,e)}}function tp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;i.uniform3iv(this.addr,e),pt(t,e)}}function np(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;i.uniform4iv(this.addr,e),pt(t,e)}}function ip(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function rp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(ft(t,e))return;i.uniform2uiv(this.addr,e),pt(t,e)}}function sp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(ft(t,e))return;i.uniform3uiv(this.addr,e),pt(t,e)}}function op(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(ft(t,e))return;i.uniform4uiv(this.addr,e),pt(t,e)}}function ap(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(Il.compareFunction=Wa,s=Il):s=Ll,t.setTexture2D(e||s,r)}function lp(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Ul,r)}function cp(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Nl,r)}function up(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||Dl,r)}function hp(i){switch(i){case 5126:return qf;case 35664:return Yf;case 35665:return $f;case 35666:return Zf;case 35674:return Kf;case 35675:return jf;case 35676:return Jf;case 5124:case 35670:return Qf;case 35667:case 35671:return ep;case 35668:case 35672:return tp;case 35669:case 35673:return np;case 5125:return ip;case 36294:return rp;case 36295:return sp;case 36296:return op;case 35678:case 36198:case 36298:case 36306:case 35682:return ap;case 35679:case 36299:case 36307:return lp;case 35680:case 36300:case 36308:case 36293:return cp;case 36289:case 36303:case 36311:case 36292:return up}}function dp(i,e){i.uniform1fv(this.addr,e)}function fp(i,e){const t=Bi(e,this.size,2);i.uniform2fv(this.addr,t)}function pp(i,e){const t=Bi(e,this.size,3);i.uniform3fv(this.addr,t)}function mp(i,e){const t=Bi(e,this.size,4);i.uniform4fv(this.addr,t)}function gp(i,e){const t=Bi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function vp(i,e){const t=Bi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function _p(i,e){const t=Bi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function xp(i,e){i.uniform1iv(this.addr,e)}function Sp(i,e){i.uniform2iv(this.addr,e)}function yp(i,e){i.uniform3iv(this.addr,e)}function Mp(i,e){i.uniform4iv(this.addr,e)}function wp(i,e){i.uniform1uiv(this.addr,e)}function Ep(i,e){i.uniform2uiv(this.addr,e)}function bp(i,e){i.uniform3uiv(this.addr,e)}function Tp(i,e){i.uniform4uiv(this.addr,e)}function Ap(i,e,t){const n=this.cache,r=e.length,s=ns(t,r);ft(n,s)||(i.uniform1iv(this.addr,s),pt(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||Ll,s[o])}function Cp(i,e,t){const n=this.cache,r=e.length,s=ns(t,r);ft(n,s)||(i.uniform1iv(this.addr,s),pt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Ul,s[o])}function Rp(i,e,t){const n=this.cache,r=e.length,s=ns(t,r);ft(n,s)||(i.uniform1iv(this.addr,s),pt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Nl,s[o])}function Pp(i,e,t){const n=this.cache,r=e.length,s=ns(t,r);ft(n,s)||(i.uniform1iv(this.addr,s),pt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Dl,s[o])}function Lp(i){switch(i){case 5126:return dp;case 35664:return fp;case 35665:return pp;case 35666:return mp;case 35674:return gp;case 35675:return vp;case 35676:return _p;case 5124:case 35670:return xp;case 35667:case 35671:return Sp;case 35668:case 35672:return yp;case 35669:case 35673:return Mp;case 5125:return wp;case 36294:return Ep;case 36295:return bp;case 36296:return Tp;case 35678:case 36198:case 36298:case 36306:case 35682:return Ap;case 35679:case 36299:case 36307:return Cp;case 35680:case 36300:case 36308:case 36293:return Rp;case 36289:case 36303:case 36311:case 36292:return Pp}}class Ip{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=hp(t.type)}}class Dp{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Lp(t.type)}}class Up{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],n)}}}const Jo=/(\w+)(\])?(\[|\.)?/g;function Hl(i,e){i.seq.push(e),i.map[e.id]=e}function Np(i,e,t){const n=i.name,r=n.length;for(Jo.lastIndex=0;;){const s=Jo.exec(n),o=Jo.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Hl(t,c===void 0?new Ip(a,i,e):new Dp(a,i,e));break}else{let d=t.map[a];d===void 0&&(d=new Up(a),Hl(t,d)),t=d}}}class is{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Np(s,o,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&n.push(o)}return n}}function Gl(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Fp=37297;let Op=0;function Bp(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const Vl=new De;function zp(i){Ve._getMatrix(Vl,Ve.workingColorSpace,i);const e=`mat3( ${Vl.elements.map(t=>t.toFixed(4))} )`;switch(Ve.getTransfer(i)){case Ir:return[e,"LinearTransferOETF"];case Je:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Wl(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+Bp(i.getShaderSource(e),o)}else return r}function kp(i,e){const t=zp(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Hp(i,e){let t;switch(e){case zu:t="Linear";break;case ku:t="Reinhard";break;case Hu:t="Cineon";break;case Ia:t="ACESFilmic";break;case Vu:t="AgX";break;case Wu:t="Neutral";break;case Gu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const rs=new C;function Gp(){Ve.getLuminanceCoefficients(rs);const i=rs.x.toFixed(4),e=rs.y.toFixed(4),t=rs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Vp(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ir).join(`
`)}function Wp(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Xp(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function ir(i){return i!==""}function Xl(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ql(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const qp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qo(i){return i.replace(qp,$p)}const Yp=new Map;function $p(i,e){let t=Fe[e];if(t===void 0){const n=Yp.get(e);if(n!==void 0)t=Fe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Qo(t)}const Zp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Yl(i){return i.replace(Zp,Kp)}function Kp(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function $l(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function jp(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ws?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===_u?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===hn&&(e="SHADOWMAP_TYPE_VSM"),e}function Jp(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case fi:case pi:e="ENVMAP_TYPE_CUBE";break;case br:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Qp(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case pi:e="ENVMAP_MODE_REFRACTION";break}return e}function em(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Ds:e="ENVMAP_BLENDING_MULTIPLY";break;case Ou:e="ENVMAP_BLENDING_MIX";break;case Bu:e="ENVMAP_BLENDING_ADD";break}return e}function tm(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function nm(i,e,t,n){const r=i.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=jp(t),c=Jp(t),u=Qp(t),d=em(t),p=tm(t),f=Vp(t),g=Wp(s),_=r.createProgram();let m,h,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ir).join(`
`),m.length>0&&(m+=`
`),h=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ir).join(`
`),h.length>0&&(h+=`
`)):(m=[$l(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ir).join(`
`),h=[$l(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==In?"#define TONE_MAPPING":"",t.toneMapping!==In?Fe.tonemapping_pars_fragment:"",t.toneMapping!==In?Hp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Fe.colorspace_pars_fragment,kp("linearToOutputTexel",t.outputColorSpace),Gp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ir).join(`
`)),o=Qo(o),o=Xl(o,t),o=ql(o,t),a=Qo(a),a=Xl(a,t),a=ql(a,t),o=Yl(o),a=Yl(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,h=["#define varying in",t.glslVersion===qa?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===qa?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+h);const M=y+m+o,v=y+h+a,R=Gl(r,r.VERTEX_SHADER,M),b=Gl(r,r.FRAGMENT_SHADER,v);r.attachShader(_,R),r.attachShader(_,b),t.index0AttributeName!==void 0?r.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function A(P){if(i.debug.checkShaderErrors){const k=r.getProgramInfoLog(_).trim(),O=r.getShaderInfoLog(R).trim(),G=r.getShaderInfoLog(b).trim();let K=!0,W=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(K=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,_,R,b);else{const te=Wl(r,R,"vertex"),V=Wl(r,b,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+k+`
`+te+`
`+V)}else k!==""?console.warn("THREE.WebGLProgram: Program Info Log:",k):(O===""||G==="")&&(W=!1);W&&(P.diagnostics={runnable:K,programLog:k,vertexShader:{log:O,prefix:m},fragmentShader:{log:G,prefix:h}})}r.deleteShader(R),r.deleteShader(b),L=new is(r,_),E=Xp(r,_)}let L;this.getUniforms=function(){return L===void 0&&A(this),L};let E;this.getAttributes=function(){return E===void 0&&A(this),E};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=r.getProgramParameter(_,Fp)),S},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Op++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=R,this.fragmentShader=b,this}let im=0;class rm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new sm(e),t.set(e,n)),n}}class sm{constructor(e){this.id=im++,this.code=e,this.usedTimes=0}}function om(i,e,t,n,r,s,o){const a=new Io,l=new rm,c=new Set,u=[],d=r.logarithmicDepthBuffer,p=r.vertexTextures;let f=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(E){return c.add(E),E===0?"uv":`uv${E}`}function m(E,S,P,k,O){const G=k.fog,K=O.geometry,W=E.isMeshStandardMaterial?k.environment:null,te=(E.isMeshStandardMaterial?t:e).get(E.envMap||W),V=te&&te.mapping===br?te.image.height:null,se=g[E.type];E.precision!==null&&(f=r.getMaxPrecision(E.precision),f!==E.precision&&console.warn("THREE.WebGLProgram.getParameters:",E.precision,"not supported, using",f,"instead."));const he=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Me=he!==void 0?he.length:0;let Be=0;K.morphAttributes.position!==void 0&&(Be=1),K.morphAttributes.normal!==void 0&&(Be=2),K.morphAttributes.color!==void 0&&(Be=3);let tt,q,ne,_e;if(se){const je=on[se];tt=je.vertexShader,q=je.fragmentShader}else tt=E.vertexShader,q=E.fragmentShader,l.update(E),ne=l.getVertexShaderID(E),_e=l.getFragmentShaderID(E);const oe=i.getRenderTarget(),Re=i.state.buffers.depth.getReversed(),Ie=O.isInstancedMesh===!0,ze=O.isBatchedMesh===!0,lt=!!E.map,We=!!E.matcap,ut=!!te,N=!!E.aoMap,Wt=!!E.lightMap,ke=!!E.bumpMap,He=!!E.normalMap,Te=!!E.displacementMap,st=!!E.emissiveMap,Ee=!!E.metalnessMap,T=!!E.roughnessMap,x=E.anisotropy>0,F=E.clearcoat>0,$=E.dispersion>0,j=E.iridescence>0,X=E.sheen>0,Se=E.transmission>0,ae=x&&!!E.anisotropyMap,de=F&&!!E.clearcoatMap,Xe=F&&!!E.clearcoatNormalMap,J=F&&!!E.clearcoatRoughnessMap,fe=j&&!!E.iridescenceMap,Ce=j&&!!E.iridescenceThicknessMap,Pe=X&&!!E.sheenColorMap,pe=X&&!!E.sheenRoughnessMap,Ge=!!E.specularMap,Oe=!!E.specularColorMap,nt=!!E.specularIntensityMap,I=Se&&!!E.transmissionMap,re=Se&&!!E.thicknessMap,H=!!E.gradientMap,Z=!!E.alphaMap,ue=E.alphaTest>0,le=!!E.alphaHash,Ue=!!E.extensions;let ct=In;E.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(ct=i.toneMapping);const bt={shaderID:se,shaderType:E.type,shaderName:E.name,vertexShader:tt,fragmentShader:q,defines:E.defines,customVertexShaderID:ne,customFragmentShaderID:_e,isRawShaderMaterial:E.isRawShaderMaterial===!0,glslVersion:E.glslVersion,precision:f,batching:ze,batchingColor:ze&&O._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&O.instanceColor!==null,instancingMorph:Ie&&O.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:oe===null?i.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:_i,alphaToCoverage:!!E.alphaToCoverage,map:lt,matcap:We,envMap:ut,envMapMode:ut&&te.mapping,envMapCubeUVHeight:V,aoMap:N,lightMap:Wt,bumpMap:ke,normalMap:He,displacementMap:p&&Te,emissiveMap:st,normalMapObjectSpace:He&&E.normalMapType===$u,normalMapTangentSpace:He&&E.normalMapType===xo,metalnessMap:Ee,roughnessMap:T,anisotropy:x,anisotropyMap:ae,clearcoat:F,clearcoatMap:de,clearcoatNormalMap:Xe,clearcoatRoughnessMap:J,dispersion:$,iridescence:j,iridescenceMap:fe,iridescenceThicknessMap:Ce,sheen:X,sheenColorMap:Pe,sheenRoughnessMap:pe,specularMap:Ge,specularColorMap:Oe,specularIntensityMap:nt,transmission:Se,transmissionMap:I,thicknessMap:re,gradientMap:H,opaque:E.transparent===!1&&E.blending===hi&&E.alphaToCoverage===!1,alphaMap:Z,alphaTest:ue,alphaHash:le,combine:E.combine,mapUv:lt&&_(E.map.channel),aoMapUv:N&&_(E.aoMap.channel),lightMapUv:Wt&&_(E.lightMap.channel),bumpMapUv:ke&&_(E.bumpMap.channel),normalMapUv:He&&_(E.normalMap.channel),displacementMapUv:Te&&_(E.displacementMap.channel),emissiveMapUv:st&&_(E.emissiveMap.channel),metalnessMapUv:Ee&&_(E.metalnessMap.channel),roughnessMapUv:T&&_(E.roughnessMap.channel),anisotropyMapUv:ae&&_(E.anisotropyMap.channel),clearcoatMapUv:de&&_(E.clearcoatMap.channel),clearcoatNormalMapUv:Xe&&_(E.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:J&&_(E.clearcoatRoughnessMap.channel),iridescenceMapUv:fe&&_(E.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&_(E.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&_(E.sheenColorMap.channel),sheenRoughnessMapUv:pe&&_(E.sheenRoughnessMap.channel),specularMapUv:Ge&&_(E.specularMap.channel),specularColorMapUv:Oe&&_(E.specularColorMap.channel),specularIntensityMapUv:nt&&_(E.specularIntensityMap.channel),transmissionMapUv:I&&_(E.transmissionMap.channel),thicknessMapUv:re&&_(E.thicknessMap.channel),alphaMapUv:Z&&_(E.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(He||x),vertexColors:E.vertexColors,vertexAlphas:E.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:O.isPoints===!0&&!!K.attributes.uv&&(lt||Z),fog:!!G,useFog:E.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:E.flatShading===!0,sizeAttenuation:E.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:Re,skinning:O.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:Me,morphTextureStride:Be,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:E.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:ct,decodeVideoTexture:lt&&E.map.isVideoTexture===!0&&Ve.getTransfer(E.map.colorSpace)===Je,decodeVideoTextureEmissive:st&&E.emissiveMap.isVideoTexture===!0&&Ve.getTransfer(E.emissiveMap.colorSpace)===Je,premultipliedAlpha:E.premultipliedAlpha,doubleSided:E.side===Lt,flipSided:E.side===Pt,useDepthPacking:E.depthPacking>=0,depthPacking:E.depthPacking||0,index0AttributeName:E.index0AttributeName,extensionClipCullDistance:Ue&&E.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ue&&E.extensions.multiDraw===!0||ze)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:E.customProgramCacheKey()};return bt.vertexUv1s=c.has(1),bt.vertexUv2s=c.has(2),bt.vertexUv3s=c.has(3),c.clear(),bt}function h(E){const S=[];if(E.shaderID?S.push(E.shaderID):(S.push(E.customVertexShaderID),S.push(E.customFragmentShaderID)),E.defines!==void 0)for(const P in E.defines)S.push(P),S.push(E.defines[P]);return E.isRawShaderMaterial===!1&&(y(S,E),M(S,E),S.push(i.outputColorSpace)),S.push(E.customProgramCacheKey),S.join()}function y(E,S){E.push(S.precision),E.push(S.outputColorSpace),E.push(S.envMapMode),E.push(S.envMapCubeUVHeight),E.push(S.mapUv),E.push(S.alphaMapUv),E.push(S.lightMapUv),E.push(S.aoMapUv),E.push(S.bumpMapUv),E.push(S.normalMapUv),E.push(S.displacementMapUv),E.push(S.emissiveMapUv),E.push(S.metalnessMapUv),E.push(S.roughnessMapUv),E.push(S.anisotropyMapUv),E.push(S.clearcoatMapUv),E.push(S.clearcoatNormalMapUv),E.push(S.clearcoatRoughnessMapUv),E.push(S.iridescenceMapUv),E.push(S.iridescenceThicknessMapUv),E.push(S.sheenColorMapUv),E.push(S.sheenRoughnessMapUv),E.push(S.specularMapUv),E.push(S.specularColorMapUv),E.push(S.specularIntensityMapUv),E.push(S.transmissionMapUv),E.push(S.thicknessMapUv),E.push(S.combine),E.push(S.fogExp2),E.push(S.sizeAttenuation),E.push(S.morphTargetsCount),E.push(S.morphAttributeCount),E.push(S.numDirLights),E.push(S.numPointLights),E.push(S.numSpotLights),E.push(S.numSpotLightMaps),E.push(S.numHemiLights),E.push(S.numRectAreaLights),E.push(S.numDirLightShadows),E.push(S.numPointLightShadows),E.push(S.numSpotLightShadows),E.push(S.numSpotLightShadowsWithMaps),E.push(S.numLightProbes),E.push(S.shadowMapType),E.push(S.toneMapping),E.push(S.numClippingPlanes),E.push(S.numClipIntersection),E.push(S.depthPacking)}function M(E,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),E.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),E.push(a.mask)}function v(E){const S=g[E.type];let P;if(S){const k=on[S];P=jr.clone(k.uniforms)}else P=E.uniforms;return P}function R(E,S){let P;for(let k=0,O=u.length;k<O;k++){const G=u[k];if(G.cacheKey===S){P=G,++P.usedTimes;break}}return P===void 0&&(P=new nm(i,S,E,s),u.push(P)),P}function b(E){if(--E.usedTimes===0){const S=u.indexOf(E);u[S]=u[u.length-1],u.pop(),E.destroy()}}function A(E){l.remove(E)}function L(){l.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:R,releaseProgram:b,releaseShaderCache:A,programs:u,dispose:L}}function am(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function lm(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Zl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Kl(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(d,p,f,g,_,m){let h=i[e];return h===void 0?(h={id:d.id,object:d,geometry:p,material:f,groupOrder:g,renderOrder:d.renderOrder,z:_,group:m},i[e]=h):(h.id=d.id,h.object=d,h.geometry=p,h.material=f,h.groupOrder=g,h.renderOrder=d.renderOrder,h.z=_,h.group=m),e++,h}function a(d,p,f,g,_,m){const h=o(d,p,f,g,_,m);f.transmission>0?n.push(h):f.transparent===!0?r.push(h):t.push(h)}function l(d,p,f,g,_,m){const h=o(d,p,f,g,_,m);f.transmission>0?n.unshift(h):f.transparent===!0?r.unshift(h):t.unshift(h)}function c(d,p){t.length>1&&t.sort(d||lm),n.length>1&&n.sort(p||Zl),r.length>1&&r.sort(p||Zl)}function u(){for(let d=e,p=i.length;d<p;d++){const f=i[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function cm(){let i=new WeakMap;function e(n,r){const s=i.get(n);let o;return s===void 0?(o=new Kl,i.set(n,[o])):r>=s.length?(o=new Kl,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function um(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new we};break;case"SpotLight":t={position:new C,direction:new C,color:new we,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new we,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new we,groundColor:new we};break;case"RectAreaLight":t={color:new we,position:new C,halfWidth:new C,halfHeight:new C};break}return i[e.id]=t,t}}}function hm(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let dm=0;function fm(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function pm(i){const e=new um,t=hm(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);const r=new C,s=new Ke,o=new Ke;function a(c){let u=0,d=0,p=0;for(let E=0;E<9;E++)n.probe[E].set(0,0,0);let f=0,g=0,_=0,m=0,h=0,y=0,M=0,v=0,R=0,b=0,A=0;c.sort(fm);for(let E=0,S=c.length;E<S;E++){const P=c[E],k=P.color,O=P.intensity,G=P.distance,K=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=k.r*O,d+=k.g*O,p+=k.b*O;else if(P.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(P.sh.coefficients[W],O);A++}else if(P.isDirectionalLight){const W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const te=P.shadow,V=t.get(P);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=K,n.directionalShadowMatrix[f]=P.shadow.matrix,y++}n.directional[f]=W,f++}else if(P.isSpotLight){const W=e.get(P);W.position.setFromMatrixPosition(P.matrixWorld),W.color.copy(k).multiplyScalar(O),W.distance=G,W.coneCos=Math.cos(P.angle),W.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),W.decay=P.decay,n.spot[_]=W;const te=P.shadow;if(P.map&&(n.spotLightMap[R]=P.map,R++,te.updateMatrices(P),P.castShadow&&b++),n.spotLightMatrix[_]=te.matrix,P.castShadow){const V=t.get(P);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,n.spotShadow[_]=V,n.spotShadowMap[_]=K,v++}_++}else if(P.isRectAreaLight){const W=e.get(P);W.color.copy(k).multiplyScalar(O),W.halfWidth.set(P.width*.5,0,0),W.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=W,m++}else if(P.isPointLight){const W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),W.distance=P.distance,W.decay=P.decay,P.castShadow){const te=P.shadow,V=t.get(P);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,V.shadowCameraNear=te.camera.near,V.shadowCameraFar=te.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=K,n.pointShadowMatrix[g]=P.shadow.matrix,M++}n.point[g]=W,g++}else if(P.isHemisphereLight){const W=e.get(P);W.skyColor.copy(P.color).multiplyScalar(O),W.groundColor.copy(P.groundColor).multiplyScalar(O),n.hemi[h]=W,h++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ie.LTC_FLOAT_1,n.rectAreaLTC2=ie.LTC_FLOAT_2):(n.rectAreaLTC1=ie.LTC_HALF_1,n.rectAreaLTC2=ie.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=p;const L=n.hash;(L.directionalLength!==f||L.pointLength!==g||L.spotLength!==_||L.rectAreaLength!==m||L.hemiLength!==h||L.numDirectionalShadows!==y||L.numPointShadows!==M||L.numSpotShadows!==v||L.numSpotMaps!==R||L.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=h,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=v+R-b,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=b,n.numLightProbes=A,L.directionalLength=f,L.pointLength=g,L.spotLength=_,L.rectAreaLength=m,L.hemiLength=h,L.numDirectionalShadows=y,L.numPointShadows=M,L.numSpotShadows=v,L.numSpotMaps=R,L.numLightProbes=A,n.version=dm++)}function l(c,u){let d=0,p=0,f=0,g=0,_=0;const m=u.matrixWorldInverse;for(let h=0,y=c.length;h<y;h++){const M=c[h];if(M.isDirectionalLight){const v=n.directional[d];v.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),d++}else if(M.isSpotLight){const v=n.spot[f];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),f++}else if(M.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),o.identity(),s.copy(M.matrixWorld),s.premultiply(m),o.extractRotation(s),v.halfWidth.set(M.width*.5,0,0),v.halfHeight.set(0,M.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){const v=n.point[p];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),p++}else if(M.isHemisphereLight){const v=n.hemi[_];v.direction.setFromMatrixPosition(M.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function jl(i){const e=new pm(i),t=[],n=[];function r(u){c.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function mm(i){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new jl(i),e.set(r,[a])):s>=o.length?(a=new jl(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class gm extends ti{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=qu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class vm extends ti{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const _m=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xm=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Sm(i,e,t){let n=new Xo;const r=new Q,s=new Q,o=new Qe,a=new gm({depthPacking:Yu}),l=new vm,c={},u=t.maxTextureSize,d={[Ln]:Pt,[Pt]:Ln,[Lt]:Lt},p=new Rt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q},radius:{value:4}},vertexShader:_m,fragmentShader:xm}),f=p.clone();f.defines.HORIZONTAL_PASS=1;const g=new wt;g.setAttribute("position",new At(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new xe(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ws;let h=this.type;this.render=function(b,A,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||b.length===0)return;const E=i.getRenderTarget(),S=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),k=i.state;k.setBlending(dn),k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const O=h!==hn&&this.type===hn,G=h===hn&&this.type!==hn;for(let K=0,W=b.length;K<W;K++){const te=b[K],V=te.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",te,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;r.copy(V.mapSize);const se=V.getFrameExtents();if(r.multiply(se),s.copy(V.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/se.x),r.x=s.x*se.x,V.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/se.y),r.y=s.y*se.y,V.mapSize.y=s.y)),V.map===null||O===!0||G===!0){const Me=this.type!==hn?{minFilter:Ut,magFilter:Ut}:{};V.map!==null&&V.map.dispose(),V.map=new $t(r.x,r.y,Me),V.map.texture.name=te.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const he=V.getViewportCount();for(let Me=0;Me<he;Me++){const Be=V.getViewport(Me);o.set(s.x*Be.x,s.y*Be.y,s.x*Be.z,s.y*Be.w),k.viewport(o),V.updateMatrices(te,Me),n=V.getFrustum(),v(A,L,V.camera,te,this.type)}V.isPointLightShadow!==!0&&this.type===hn&&y(V,L),V.needsUpdate=!1}h=this.type,m.needsUpdate=!1,i.setRenderTarget(E,S,P)};function y(b,A){const L=e.update(_);p.defines.VSM_SAMPLES!==b.blurSamples&&(p.defines.VSM_SAMPLES=b.blurSamples,f.defines.VSM_SAMPLES=b.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),b.mapPass===null&&(b.mapPass=new $t(r.x,r.y)),p.uniforms.shadow_pass.value=b.map.texture,p.uniforms.resolution.value=b.mapSize,p.uniforms.radius.value=b.radius,i.setRenderTarget(b.mapPass),i.clear(),i.renderBufferDirect(A,null,L,p,_,null),f.uniforms.shadow_pass.value=b.mapPass.texture,f.uniforms.resolution.value=b.mapSize,f.uniforms.radius.value=b.radius,i.setRenderTarget(b.map),i.clear(),i.renderBufferDirect(A,null,L,f,_,null)}function M(b,A,L,E){let S=null;const P=L.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(P!==void 0)S=P;else if(S=L.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const k=S.uuid,O=A.uuid;let G=c[k];G===void 0&&(G={},c[k]=G);let K=G[O];K===void 0&&(K=S.clone(),G[O]=K,A.addEventListener("dispose",R)),S=K}if(S.visible=A.visible,S.wireframe=A.wireframe,E===hn?S.side=A.shadowSide!==null?A.shadowSide:A.side:S.side=A.shadowSide!==null?A.shadowSide:d[A.side],S.alphaMap=A.alphaMap,S.alphaTest=A.alphaTest,S.map=A.map,S.clipShadows=A.clipShadows,S.clippingPlanes=A.clippingPlanes,S.clipIntersection=A.clipIntersection,S.displacementMap=A.displacementMap,S.displacementScale=A.displacementScale,S.displacementBias=A.displacementBias,S.wireframeLinewidth=A.wireframeLinewidth,S.linewidth=A.linewidth,L.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const k=i.properties.get(S);k.light=L}return S}function v(b,A,L,E,S){if(b.visible===!1)return;if(b.layers.test(A.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&S===hn)&&(!b.frustumCulled||n.intersectsObject(b))){b.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,b.matrixWorld);const O=e.update(b),G=b.material;if(Array.isArray(G)){const K=O.groups;for(let W=0,te=K.length;W<te;W++){const V=K[W],se=G[V.materialIndex];if(se&&se.visible){const he=M(b,se,E,S);b.onBeforeShadow(i,b,A,L,O,he,V),i.renderBufferDirect(L,null,O,he,b,V),b.onAfterShadow(i,b,A,L,O,he,V)}}}else if(G.visible){const K=M(b,G,E,S);b.onBeforeShadow(i,b,A,L,O,K,null),i.renderBufferDirect(L,null,O,K,b,null),b.onAfterShadow(i,b,A,L,O,K,null)}}const k=b.children;for(let O=0,G=k.length;O<G;O++)v(k[O],A,L,E,S)}function R(b){b.target.removeEventListener("dispose",R);for(const L in c){const E=c[L],S=b.target.uuid;S in E&&(E[S].dispose(),delete E[S])}}}const ym={[Ts]:As,[Cs]:Ls,[Rs]:Is,[di]:Ps,[As]:Ts,[Ls]:Cs,[Is]:Rs,[Ps]:di};function Mm(i,e){function t(){let I=!1;const re=new Qe;let H=null;const Z=new Qe(0,0,0,0);return{setMask:function(ue){H!==ue&&!I&&(i.colorMask(ue,ue,ue,ue),H=ue)},setLocked:function(ue){I=ue},setClear:function(ue,le,Ue,ct,bt){bt===!0&&(ue*=ct,le*=ct,Ue*=ct),re.set(ue,le,Ue,ct),Z.equals(re)===!1&&(i.clearColor(ue,le,Ue,ct),Z.copy(re))},reset:function(){I=!1,H=null,Z.set(-1,0,0,0)}}}function n(){let I=!1,re=!1,H=null,Z=null,ue=null;return{setReversed:function(le){if(re!==le){const Ue=e.get("EXT_clip_control");re?Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.ZERO_TO_ONE_EXT):Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.NEGATIVE_ONE_TO_ONE_EXT);const ct=ue;ue=null,this.setClear(ct)}re=le},getReversed:function(){return re},setTest:function(le){le?oe(i.DEPTH_TEST):Re(i.DEPTH_TEST)},setMask:function(le){H!==le&&!I&&(i.depthMask(le),H=le)},setFunc:function(le){if(re&&(le=ym[le]),Z!==le){switch(le){case Ts:i.depthFunc(i.NEVER);break;case As:i.depthFunc(i.ALWAYS);break;case Cs:i.depthFunc(i.LESS);break;case di:i.depthFunc(i.LEQUAL);break;case Rs:i.depthFunc(i.EQUAL);break;case Ps:i.depthFunc(i.GEQUAL);break;case Ls:i.depthFunc(i.GREATER);break;case Is:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Z=le}},setLocked:function(le){I=le},setClear:function(le){ue!==le&&(re&&(le=1-le),i.clearDepth(le),ue=le)},reset:function(){I=!1,H=null,Z=null,ue=null,re=!1}}}function r(){let I=!1,re=null,H=null,Z=null,ue=null,le=null,Ue=null,ct=null,bt=null;return{setTest:function(je){I||(je?oe(i.STENCIL_TEST):Re(i.STENCIL_TEST))},setMask:function(je){re!==je&&!I&&(i.stencilMask(je),re=je)},setFunc:function(je,tn,Cn){(H!==je||Z!==tn||ue!==Cn)&&(i.stencilFunc(je,tn,Cn),H=je,Z=tn,ue=Cn)},setOp:function(je,tn,Cn){(le!==je||Ue!==tn||ct!==Cn)&&(i.stencilOp(je,tn,Cn),le=je,Ue=tn,ct=Cn)},setLocked:function(je){I=je},setClear:function(je){bt!==je&&(i.clearStencil(je),bt=je)},reset:function(){I=!1,re=null,H=null,Z=null,ue=null,le=null,Ue=null,ct=null,bt=null}}}const s=new t,o=new n,a=new r,l=new WeakMap,c=new WeakMap;let u={},d={},p=new WeakMap,f=[],g=null,_=!1,m=null,h=null,y=null,M=null,v=null,R=null,b=null,A=new we(0,0,0),L=0,E=!1,S=null,P=null,k=null,O=null,G=null;const K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let W=!1,te=0;const V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(V)[1]),W=te>=1):V.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),W=te>=2);let se=null,he={};const Me=i.getParameter(i.SCISSOR_BOX),Be=i.getParameter(i.VIEWPORT),tt=new Qe().fromArray(Me),q=new Qe().fromArray(Be);function ne(I,re,H,Z){const ue=new Uint8Array(4),le=i.createTexture();i.bindTexture(I,le),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ue=0;Ue<H;Ue++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(re,0,i.RGBA,1,1,Z,0,i.RGBA,i.UNSIGNED_BYTE,ue):i.texImage2D(re+Ue,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ue);return le}const _e={};_e[i.TEXTURE_2D]=ne(i.TEXTURE_2D,i.TEXTURE_2D,1),_e[i.TEXTURE_CUBE_MAP]=ne(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),_e[i.TEXTURE_2D_ARRAY]=ne(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),_e[i.TEXTURE_3D]=ne(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),oe(i.DEPTH_TEST),o.setFunc(di),ke(!1),He(Ra),oe(i.CULL_FACE),N(dn);function oe(I){u[I]!==!0&&(i.enable(I),u[I]=!0)}function Re(I){u[I]!==!1&&(i.disable(I),u[I]=!1)}function Ie(I,re){return d[I]!==re?(i.bindFramebuffer(I,re),d[I]=re,I===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=re),I===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=re),!0):!1}function ze(I,re){let H=f,Z=!1;if(I){H=p.get(re),H===void 0&&(H=[],p.set(re,H));const ue=I.textures;if(H.length!==ue.length||H[0]!==i.COLOR_ATTACHMENT0){for(let le=0,Ue=ue.length;le<Ue;le++)H[le]=i.COLOR_ATTACHMENT0+le;H.length=ue.length,Z=!0}}else H[0]!==i.BACK&&(H[0]=i.BACK,Z=!0);Z&&i.drawBuffers(H)}function lt(I){return g!==I?(i.useProgram(I),g=I,!0):!1}const We={[$n]:i.FUNC_ADD,[Su]:i.FUNC_SUBTRACT,[yu]:i.FUNC_REVERSE_SUBTRACT};We[Mu]=i.MIN,We[wu]=i.MAX;const ut={[Eu]:i.ZERO,[bu]:i.ONE,[Tu]:i.SRC_COLOR,[Es]:i.SRC_ALPHA,[Iu]:i.SRC_ALPHA_SATURATE,[Pu]:i.DST_COLOR,[Cu]:i.DST_ALPHA,[Au]:i.ONE_MINUS_SRC_COLOR,[bs]:i.ONE_MINUS_SRC_ALPHA,[Lu]:i.ONE_MINUS_DST_COLOR,[Ru]:i.ONE_MINUS_DST_ALPHA,[Du]:i.CONSTANT_COLOR,[Uu]:i.ONE_MINUS_CONSTANT_COLOR,[Nu]:i.CONSTANT_ALPHA,[Fu]:i.ONE_MINUS_CONSTANT_ALPHA};function N(I,re,H,Z,ue,le,Ue,ct,bt,je){if(I===dn){_===!0&&(Re(i.BLEND),_=!1);return}if(_===!1&&(oe(i.BLEND),_=!0),I!==xu){if(I!==m||je!==E){if((h!==$n||v!==$n)&&(i.blendEquation(i.FUNC_ADD),h=$n,v=$n),je)switch(I){case hi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Er:i.blendFunc(i.ONE,i.ONE);break;case Pa:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case La:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case hi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Er:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Pa:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case La:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}y=null,M=null,R=null,b=null,A.set(0,0,0),L=0,m=I,E=je}return}ue=ue||re,le=le||H,Ue=Ue||Z,(re!==h||ue!==v)&&(i.blendEquationSeparate(We[re],We[ue]),h=re,v=ue),(H!==y||Z!==M||le!==R||Ue!==b)&&(i.blendFuncSeparate(ut[H],ut[Z],ut[le],ut[Ue]),y=H,M=Z,R=le,b=Ue),(ct.equals(A)===!1||bt!==L)&&(i.blendColor(ct.r,ct.g,ct.b,bt),A.copy(ct),L=bt),m=I,E=!1}function Wt(I,re){I.side===Lt?Re(i.CULL_FACE):oe(i.CULL_FACE);let H=I.side===Pt;re&&(H=!H),ke(H),I.blending===hi&&I.transparent===!1?N(dn):N(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),s.setMask(I.colorWrite);const Z=I.stencilWrite;a.setTest(Z),Z&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),st(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?oe(i.SAMPLE_ALPHA_TO_COVERAGE):Re(i.SAMPLE_ALPHA_TO_COVERAGE)}function ke(I){S!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),S=I)}function He(I){I!==ui?(oe(i.CULL_FACE),I!==P&&(I===Ra?i.cullFace(i.BACK):I===vu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Re(i.CULL_FACE),P=I}function Te(I){I!==k&&(W&&i.lineWidth(I),k=I)}function st(I,re,H){I?(oe(i.POLYGON_OFFSET_FILL),(O!==re||G!==H)&&(i.polygonOffset(re,H),O=re,G=H)):Re(i.POLYGON_OFFSET_FILL)}function Ee(I){I?oe(i.SCISSOR_TEST):Re(i.SCISSOR_TEST)}function T(I){I===void 0&&(I=i.TEXTURE0+K-1),se!==I&&(i.activeTexture(I),se=I)}function x(I,re,H){H===void 0&&(se===null?H=i.TEXTURE0+K-1:H=se);let Z=he[H];Z===void 0&&(Z={type:void 0,texture:void 0},he[H]=Z),(Z.type!==I||Z.texture!==re)&&(se!==H&&(i.activeTexture(H),se=H),i.bindTexture(I,re||_e[I]),Z.type=I,Z.texture=re)}function F(){const I=he[se];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function $(){try{i.compressedTexImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function j(){try{i.compressedTexImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function X(){try{i.texSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Se(){try{i.texSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ae(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function de(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Xe(){try{i.texStorage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{i.texStorage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function fe(){try{i.texImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ce(){try{i.texImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Pe(I){tt.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),tt.copy(I))}function pe(I){q.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),q.copy(I))}function Ge(I,re){let H=c.get(re);H===void 0&&(H=new WeakMap,c.set(re,H));let Z=H.get(I);Z===void 0&&(Z=i.getUniformBlockIndex(re,I.name),H.set(I,Z))}function Oe(I,re){const Z=c.get(re).get(I);l.get(re)!==Z&&(i.uniformBlockBinding(re,Z,I.__bindingPointIndex),l.set(re,Z))}function nt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},se=null,he={},d={},p=new WeakMap,f=[],g=null,_=!1,m=null,h=null,y=null,M=null,v=null,R=null,b=null,A=new we(0,0,0),L=0,E=!1,S=null,P=null,k=null,O=null,G=null,tt.set(0,0,i.canvas.width,i.canvas.height),q.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:oe,disable:Re,bindFramebuffer:Ie,drawBuffers:ze,useProgram:lt,setBlending:N,setMaterial:Wt,setFlipSided:ke,setCullFace:He,setLineWidth:Te,setPolygonOffset:st,setScissorTest:Ee,activeTexture:T,bindTexture:x,unbindTexture:F,compressedTexImage2D:$,compressedTexImage3D:j,texImage2D:fe,texImage3D:Ce,updateUBOMapping:Ge,uniformBlockBinding:Oe,texStorage2D:Xe,texStorage3D:J,texSubImage2D:X,texSubImage3D:Se,compressedTexSubImage2D:ae,compressedTexSubImage3D:de,scissor:Pe,viewport:pe,reset:nt}}function Jl(i,e,t,n){const r=wm(n);switch(t){case Oa:return i*e;case za:return i*e;case ka:return i*e*2;case Gs:return i*e/r.components*r.byteLength;case Vs:return i*e/r.components*r.byteLength;case Ha:return i*e*2/r.components*r.byteLength;case Ws:return i*e*2/r.components*r.byteLength;case Ba:return i*e*3/r.components*r.byteLength;case Yt:return i*e*4/r.components*r.byteLength;case Xs:return i*e*4/r.components*r.byteLength;case Ar:case Cr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Rr:case Pr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ys:case Zs:return Math.max(i,16)*Math.max(e,8)/4;case qs:case $s:return Math.max(i,8)*Math.max(e,8)/2;case Ks:case js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Js:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Qs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case eo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case to:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case no:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case io:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ro:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case so:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case oo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ao:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case lo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case co:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case uo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ho:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case fo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Lr:case po:case mo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ga:case go:return Math.ceil(i/4)*Math.ceil(e/4)*8;case vo:case _o:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function wm(i){switch(i){case fn:case Ua:return{byteLength:1,components:1};case $i:case Na:case pn:return{byteLength:2,components:1};case ks:case Hs:return{byteLength:2,components:4};case jn:case zs:case sn:return{byteLength:4,components:1};case Fa:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Em(i,e,t,n,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Q,u=new WeakMap;let d;const p=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,x){return f?new OffscreenCanvas(T,x):Ur("canvas")}function _(T,x,F){let $=1;const j=Ee(T);if((j.width>F||j.height>F)&&($=F/Math.max(j.width,j.height)),$<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const X=Math.floor($*j.width),Se=Math.floor($*j.height);d===void 0&&(d=g(X,Se));const ae=x?g(X,Se):d;return ae.width=X,ae.height=Se,ae.getContext("2d").drawImage(T,0,0,X,Se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+X+"x"+Se+")."),ae}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),T;return T}function m(T){return T.generateMipmaps}function h(T){i.generateMipmap(T)}function y(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(T,x,F,$,j=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let X=x;if(x===i.RED&&(F===i.FLOAT&&(X=i.R32F),F===i.HALF_FLOAT&&(X=i.R16F),F===i.UNSIGNED_BYTE&&(X=i.R8)),x===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.R8UI),F===i.UNSIGNED_SHORT&&(X=i.R16UI),F===i.UNSIGNED_INT&&(X=i.R32UI),F===i.BYTE&&(X=i.R8I),F===i.SHORT&&(X=i.R16I),F===i.INT&&(X=i.R32I)),x===i.RG&&(F===i.FLOAT&&(X=i.RG32F),F===i.HALF_FLOAT&&(X=i.RG16F),F===i.UNSIGNED_BYTE&&(X=i.RG8)),x===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RG8UI),F===i.UNSIGNED_SHORT&&(X=i.RG16UI),F===i.UNSIGNED_INT&&(X=i.RG32UI),F===i.BYTE&&(X=i.RG8I),F===i.SHORT&&(X=i.RG16I),F===i.INT&&(X=i.RG32I)),x===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RGB8UI),F===i.UNSIGNED_SHORT&&(X=i.RGB16UI),F===i.UNSIGNED_INT&&(X=i.RGB32UI),F===i.BYTE&&(X=i.RGB8I),F===i.SHORT&&(X=i.RGB16I),F===i.INT&&(X=i.RGB32I)),x===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(X=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(X=i.RGBA16UI),F===i.UNSIGNED_INT&&(X=i.RGBA32UI),F===i.BYTE&&(X=i.RGBA8I),F===i.SHORT&&(X=i.RGBA16I),F===i.INT&&(X=i.RGBA32I)),x===i.RGB&&F===i.UNSIGNED_INT_5_9_9_9_REV&&(X=i.RGB9_E5),x===i.RGBA){const Se=j?Ir:Ve.getTransfer($);F===i.FLOAT&&(X=i.RGBA32F),F===i.HALF_FLOAT&&(X=i.RGBA16F),F===i.UNSIGNED_BYTE&&(X=Se===Je?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(X=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(X=i.RGB5_A1)}return(X===i.R16F||X===i.R32F||X===i.RG16F||X===i.RG32F||X===i.RGBA16F||X===i.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function v(T,x){let F;return T?x===null||x===jn||x===mi?F=i.DEPTH24_STENCIL8:x===sn?F=i.DEPTH32F_STENCIL8:x===$i&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===jn||x===mi?F=i.DEPTH_COMPONENT24:x===sn?F=i.DEPTH_COMPONENT32F:x===$i&&(F=i.DEPTH_COMPONENT16),F}function R(T,x){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==Ut&&T.minFilter!==rn?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function b(T){const x=T.target;x.removeEventListener("dispose",b),L(x),x.isVideoTexture&&u.delete(x)}function A(T){const x=T.target;x.removeEventListener("dispose",A),S(x)}function L(T){const x=n.get(T);if(x.__webglInit===void 0)return;const F=T.source,$=p.get(F);if($){const j=$[x.__cacheKey];j.usedTimes--,j.usedTimes===0&&E(T),Object.keys($).length===0&&p.delete(F)}n.remove(T)}function E(T){const x=n.get(T);i.deleteTexture(x.__webglTexture);const F=T.source,$=p.get(F);delete $[x.__cacheKey],o.memory.textures--}function S(T){const x=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(x.__webglFramebuffer[$]))for(let j=0;j<x.__webglFramebuffer[$].length;j++)i.deleteFramebuffer(x.__webglFramebuffer[$][j]);else i.deleteFramebuffer(x.__webglFramebuffer[$]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[$])}else{if(Array.isArray(x.__webglFramebuffer))for(let $=0;$<x.__webglFramebuffer.length;$++)i.deleteFramebuffer(x.__webglFramebuffer[$]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let $=0;$<x.__webglColorRenderbuffer.length;$++)x.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[$]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const F=T.textures;for(let $=0,j=F.length;$<j;$++){const X=n.get(F[$]);X.__webglTexture&&(i.deleteTexture(X.__webglTexture),o.memory.textures--),n.remove(F[$])}n.remove(T)}let P=0;function k(){P=0}function O(){const T=P;return T>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+r.maxTextures),P+=1,T}function G(T){const x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function K(T,x){const F=n.get(T);if(T.isVideoTexture&&Te(T),T.isRenderTargetTexture===!1&&T.version>0&&F.__version!==T.version){const $=T.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(F,T,x);return}}t.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+x)}function W(T,x){const F=n.get(T);if(T.version>0&&F.__version!==T.version){q(F,T,x);return}t.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+x)}function te(T,x){const F=n.get(T);if(T.version>0&&F.__version!==T.version){q(F,T,x);return}t.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+x)}function V(T,x){const F=n.get(T);if(T.version>0&&F.__version!==T.version){ne(F,T,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+x)}const se={[Fs]:i.REPEAT,[Zn]:i.CLAMP_TO_EDGE,[Os]:i.MIRRORED_REPEAT},he={[Ut]:i.NEAREST,[Xu]:i.NEAREST_MIPMAP_NEAREST,[Tr]:i.NEAREST_MIPMAP_LINEAR,[rn]:i.LINEAR,[Bs]:i.LINEAR_MIPMAP_NEAREST,[Kn]:i.LINEAR_MIPMAP_LINEAR},Me={[Zu]:i.NEVER,[th]:i.ALWAYS,[Ku]:i.LESS,[Wa]:i.LEQUAL,[ju]:i.EQUAL,[eh]:i.GEQUAL,[Ju]:i.GREATER,[Qu]:i.NOTEQUAL};function Be(T,x){if(x.type===sn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===rn||x.magFilter===Bs||x.magFilter===Tr||x.magFilter===Kn||x.minFilter===rn||x.minFilter===Bs||x.minFilter===Tr||x.minFilter===Kn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,se[x.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,se[x.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,se[x.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,he[x.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,he[x.minFilter]),x.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Me[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Ut||x.minFilter!==Tr&&x.minFilter!==Kn||x.type===sn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const F=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function tt(T,x){let F=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",b));const $=x.source;let j=p.get($);j===void 0&&(j={},p.set($,j));const X=G(x);if(X!==T.__cacheKey){j[X]===void 0&&(j[X]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),j[X].usedTimes++;const Se=j[T.__cacheKey];Se!==void 0&&(j[T.__cacheKey].usedTimes--,Se.usedTimes===0&&E(x)),T.__cacheKey=X,T.__webglTexture=j[X].texture}return F}function q(T,x,F){let $=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&($=i.TEXTURE_3D);const j=tt(T,x),X=x.source;t.bindTexture($,T.__webglTexture,i.TEXTURE0+F);const Se=n.get(X);if(X.version!==Se.__version||j===!0){t.activeTexture(i.TEXTURE0+F);const ae=Ve.getPrimaries(Ve.workingColorSpace),de=x.colorSpace===Dn?null:Ve.getPrimaries(x.colorSpace),Xe=x.colorSpace===Dn||ae===de?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Xe);let J=_(x.image,!1,r.maxTextureSize);J=st(x,J);const fe=s.convert(x.format,x.colorSpace),Ce=s.convert(x.type);let Pe=M(x.internalFormat,fe,Ce,x.colorSpace,x.isVideoTexture);Be($,x);let pe;const Ge=x.mipmaps,Oe=x.isVideoTexture!==!0,nt=Se.__version===void 0||j===!0,I=X.dataReady,re=R(x,J);if(x.isDepthTexture)Pe=v(x.format===vi,x.type),nt&&(Oe?t.texStorage2D(i.TEXTURE_2D,1,Pe,J.width,J.height):t.texImage2D(i.TEXTURE_2D,0,Pe,J.width,J.height,0,fe,Ce,null));else if(x.isDataTexture)if(Ge.length>0){Oe&&nt&&t.texStorage2D(i.TEXTURE_2D,re,Pe,Ge[0].width,Ge[0].height);for(let H=0,Z=Ge.length;H<Z;H++)pe=Ge[H],Oe?I&&t.texSubImage2D(i.TEXTURE_2D,H,0,0,pe.width,pe.height,fe,Ce,pe.data):t.texImage2D(i.TEXTURE_2D,H,Pe,pe.width,pe.height,0,fe,Ce,pe.data);x.generateMipmaps=!1}else Oe?(nt&&t.texStorage2D(i.TEXTURE_2D,re,Pe,J.width,J.height),I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,J.width,J.height,fe,Ce,J.data)):t.texImage2D(i.TEXTURE_2D,0,Pe,J.width,J.height,0,fe,Ce,J.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Oe&&nt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,Pe,Ge[0].width,Ge[0].height,J.depth);for(let H=0,Z=Ge.length;H<Z;H++)if(pe=Ge[H],x.format!==Yt)if(fe!==null)if(Oe){if(I)if(x.layerUpdates.size>0){const ue=Jl(pe.width,pe.height,x.format,x.type);for(const le of x.layerUpdates){const Ue=pe.data.subarray(le*ue/pe.data.BYTES_PER_ELEMENT,(le+1)*ue/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,H,0,0,le,pe.width,pe.height,1,fe,Ue)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,H,0,0,0,pe.width,pe.height,J.depth,fe,pe.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,H,Pe,pe.width,pe.height,J.depth,0,pe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Oe?I&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,H,0,0,0,pe.width,pe.height,J.depth,fe,Ce,pe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,H,Pe,pe.width,pe.height,J.depth,0,fe,Ce,pe.data)}else{Oe&&nt&&t.texStorage2D(i.TEXTURE_2D,re,Pe,Ge[0].width,Ge[0].height);for(let H=0,Z=Ge.length;H<Z;H++)pe=Ge[H],x.format!==Yt?fe!==null?Oe?I&&t.compressedTexSubImage2D(i.TEXTURE_2D,H,0,0,pe.width,pe.height,fe,pe.data):t.compressedTexImage2D(i.TEXTURE_2D,H,Pe,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Oe?I&&t.texSubImage2D(i.TEXTURE_2D,H,0,0,pe.width,pe.height,fe,Ce,pe.data):t.texImage2D(i.TEXTURE_2D,H,Pe,pe.width,pe.height,0,fe,Ce,pe.data)}else if(x.isDataArrayTexture)if(Oe){if(nt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,re,Pe,J.width,J.height,J.depth),I)if(x.layerUpdates.size>0){const H=Jl(J.width,J.height,x.format,x.type);for(const Z of x.layerUpdates){const ue=J.data.subarray(Z*H/J.data.BYTES_PER_ELEMENT,(Z+1)*H/J.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,J.width,J.height,1,fe,Ce,ue)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,fe,Ce,J.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Pe,J.width,J.height,J.depth,0,fe,Ce,J.data);else if(x.isData3DTexture)Oe?(nt&&t.texStorage3D(i.TEXTURE_3D,re,Pe,J.width,J.height,J.depth),I&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,fe,Ce,J.data)):t.texImage3D(i.TEXTURE_3D,0,Pe,J.width,J.height,J.depth,0,fe,Ce,J.data);else if(x.isFramebufferTexture){if(nt)if(Oe)t.texStorage2D(i.TEXTURE_2D,re,Pe,J.width,J.height);else{let H=J.width,Z=J.height;for(let ue=0;ue<re;ue++)t.texImage2D(i.TEXTURE_2D,ue,Pe,H,Z,0,fe,Ce,null),H>>=1,Z>>=1}}else if(Ge.length>0){if(Oe&&nt){const H=Ee(Ge[0]);t.texStorage2D(i.TEXTURE_2D,re,Pe,H.width,H.height)}for(let H=0,Z=Ge.length;H<Z;H++)pe=Ge[H],Oe?I&&t.texSubImage2D(i.TEXTURE_2D,H,0,0,fe,Ce,pe):t.texImage2D(i.TEXTURE_2D,H,Pe,fe,Ce,pe);x.generateMipmaps=!1}else if(Oe){if(nt){const H=Ee(J);t.texStorage2D(i.TEXTURE_2D,re,Pe,H.width,H.height)}I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,Ce,J)}else t.texImage2D(i.TEXTURE_2D,0,Pe,fe,Ce,J);m(x)&&h($),Se.__version=X.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function ne(T,x,F){if(x.image.length!==6)return;const $=tt(T,x),j=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+F);const X=n.get(j);if(j.version!==X.__version||$===!0){t.activeTexture(i.TEXTURE0+F);const Se=Ve.getPrimaries(Ve.workingColorSpace),ae=x.colorSpace===Dn?null:Ve.getPrimaries(x.colorSpace),de=x.colorSpace===Dn||Se===ae?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,de);const Xe=x.isCompressedTexture||x.image[0].isCompressedTexture,J=x.image[0]&&x.image[0].isDataTexture,fe=[];for(let Z=0;Z<6;Z++)!Xe&&!J?fe[Z]=_(x.image[Z],!0,r.maxCubemapSize):fe[Z]=J?x.image[Z].image:x.image[Z],fe[Z]=st(x,fe[Z]);const Ce=fe[0],Pe=s.convert(x.format,x.colorSpace),pe=s.convert(x.type),Ge=M(x.internalFormat,Pe,pe,x.colorSpace),Oe=x.isVideoTexture!==!0,nt=X.__version===void 0||$===!0,I=j.dataReady;let re=R(x,Ce);Be(i.TEXTURE_CUBE_MAP,x);let H;if(Xe){Oe&&nt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,re,Ge,Ce.width,Ce.height);for(let Z=0;Z<6;Z++){H=fe[Z].mipmaps;for(let ue=0;ue<H.length;ue++){const le=H[ue];x.format!==Yt?Pe!==null?Oe?I&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue,0,0,le.width,le.height,Pe,le.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue,Ge,le.width,le.height,0,le.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Oe?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue,0,0,le.width,le.height,Pe,pe,le.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue,Ge,le.width,le.height,0,Pe,pe,le.data)}}}else{if(H=x.mipmaps,Oe&&nt){H.length>0&&re++;const Z=Ee(fe[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,re,Ge,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(J){Oe?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,fe[Z].width,fe[Z].height,Pe,pe,fe[Z].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Ge,fe[Z].width,fe[Z].height,0,Pe,pe,fe[Z].data);for(let ue=0;ue<H.length;ue++){const Ue=H[ue].image[Z].image;Oe?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue+1,0,0,Ue.width,Ue.height,Pe,pe,Ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue+1,Ge,Ue.width,Ue.height,0,Pe,pe,Ue.data)}}else{Oe?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Pe,pe,fe[Z]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Ge,Pe,pe,fe[Z]);for(let ue=0;ue<H.length;ue++){const le=H[ue];Oe?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue+1,0,0,Pe,pe,le.image[Z]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ue+1,Ge,Pe,pe,le.image[Z])}}}m(x)&&h(i.TEXTURE_CUBE_MAP),X.__version=j.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function _e(T,x,F,$,j,X){const Se=s.convert(F.format,F.colorSpace),ae=s.convert(F.type),de=M(F.internalFormat,Se,ae,F.colorSpace),Xe=n.get(x),J=n.get(F);if(J.__renderTarget=x,!Xe.__hasExternalTextures){const fe=Math.max(1,x.width>>X),Ce=Math.max(1,x.height>>X);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,X,de,fe,Ce,x.depth,0,Se,ae,null):t.texImage2D(j,X,de,fe,Ce,0,Se,ae,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),He(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,j,J.__webglTexture,0,ke(x)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,j,J.__webglTexture,X),t.bindFramebuffer(i.FRAMEBUFFER,null)}function oe(T,x,F){if(i.bindRenderbuffer(i.RENDERBUFFER,T),x.depthBuffer){const $=x.depthTexture,j=$&&$.isDepthTexture?$.type:null,X=v(x.stencilBuffer,j),Se=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ae=ke(x);He(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ae,X,x.width,x.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,ae,X,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,X,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Se,i.RENDERBUFFER,T)}else{const $=x.textures;for(let j=0;j<$.length;j++){const X=$[j],Se=s.convert(X.format,X.colorSpace),ae=s.convert(X.type),de=M(X.internalFormat,Se,ae,X.colorSpace),Xe=ke(x);F&&He(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Xe,de,x.width,x.height):He(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Xe,de,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,de,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Re(T,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const $=n.get(x.depthTexture);$.__renderTarget=x,(!$.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),K(x.depthTexture,0);const j=$.__webglTexture,X=ke(x);if(x.depthTexture.format===gi)He(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,X):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(x.depthTexture.format===vi)He(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,X):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Ie(T){const x=n.get(T),F=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){const $=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),$){const j=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,$.removeEventListener("dispose",j)};$.addEventListener("dispose",j),x.__depthDisposeCallback=j}x.__boundDepthTexture=$}if(T.depthTexture&&!x.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");Re(x.__webglFramebuffer,T)}else if(F){x.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[$]),x.__webglDepthbuffer[$]===void 0)x.__webglDepthbuffer[$]=i.createRenderbuffer(),oe(x.__webglDepthbuffer[$],T,!1);else{const j=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,X=x.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,X),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,X)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),oe(x.__webglDepthbuffer,T,!1);else{const $=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,j)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ze(T,x,F){const $=n.get(T);x!==void 0&&_e($.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Ie(T)}function lt(T){const x=T.texture,F=n.get(T),$=n.get(x);T.addEventListener("dispose",A);const j=T.textures,X=T.isWebGLCubeRenderTarget===!0,Se=j.length>1;if(Se||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=x.version,o.memory.textures++),X){F.__webglFramebuffer=[];for(let ae=0;ae<6;ae++)if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer[ae]=[];for(let de=0;de<x.mipmaps.length;de++)F.__webglFramebuffer[ae][de]=i.createFramebuffer()}else F.__webglFramebuffer[ae]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){F.__webglFramebuffer=[];for(let ae=0;ae<x.mipmaps.length;ae++)F.__webglFramebuffer[ae]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(Se)for(let ae=0,de=j.length;ae<de;ae++){const Xe=n.get(j[ae]);Xe.__webglTexture===void 0&&(Xe.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&He(T)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let ae=0;ae<j.length;ae++){const de=j[ae];F.__webglColorRenderbuffer[ae]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[ae]);const Xe=s.convert(de.format,de.colorSpace),J=s.convert(de.type),fe=M(de.internalFormat,Xe,J,de.colorSpace,T.isXRRenderTarget===!0),Ce=ke(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ce,fe,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ae,i.RENDERBUFFER,F.__webglColorRenderbuffer[ae])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),oe(F.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(X){t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),Be(i.TEXTURE_CUBE_MAP,x);for(let ae=0;ae<6;ae++)if(x.mipmaps&&x.mipmaps.length>0)for(let de=0;de<x.mipmaps.length;de++)_e(F.__webglFramebuffer[ae][de],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,de);else _e(F.__webglFramebuffer[ae],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0);m(x)&&h(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Se){for(let ae=0,de=j.length;ae<de;ae++){const Xe=j[ae],J=n.get(Xe);t.bindTexture(i.TEXTURE_2D,J.__webglTexture),Be(i.TEXTURE_2D,Xe),_e(F.__webglFramebuffer,T,Xe,i.COLOR_ATTACHMENT0+ae,i.TEXTURE_2D,0),m(Xe)&&h(i.TEXTURE_2D)}t.unbindTexture()}else{let ae=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ae=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ae,$.__webglTexture),Be(ae,x),x.mipmaps&&x.mipmaps.length>0)for(let de=0;de<x.mipmaps.length;de++)_e(F.__webglFramebuffer[de],T,x,i.COLOR_ATTACHMENT0,ae,de);else _e(F.__webglFramebuffer,T,x,i.COLOR_ATTACHMENT0,ae,0);m(x)&&h(ae),t.unbindTexture()}T.depthBuffer&&Ie(T)}function We(T){const x=T.textures;for(let F=0,$=x.length;F<$;F++){const j=x[F];if(m(j)){const X=y(T),Se=n.get(j).__webglTexture;t.bindTexture(X,Se),h(X),t.unbindTexture()}}}const ut=[],N=[];function Wt(T){if(T.samples>0){if(He(T)===!1){const x=T.textures,F=T.width,$=T.height;let j=i.COLOR_BUFFER_BIT;const X=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=n.get(T),ae=x.length>1;if(ae)for(let de=0;de<x.length;de++)t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let de=0;de<x.length;de++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),ae){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Se.__webglColorRenderbuffer[de]);const Xe=n.get(x[de]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Xe,0)}i.blitFramebuffer(0,0,F,$,0,0,F,$,j,i.NEAREST),l===!0&&(ut.length=0,N.length=0,ut.push(i.COLOR_ATTACHMENT0+de),T.depthBuffer&&T.resolveDepthBuffer===!1&&(ut.push(X),N.push(X),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,N)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ut))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ae)for(let de=0;de<x.length;de++){t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,Se.__webglColorRenderbuffer[de]);const Xe=n.get(x[de]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,Xe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const x=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function ke(T){return Math.min(r.maxSamples,T.samples)}function He(T){const x=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Te(T){const x=o.render.frame;u.get(T)!==x&&(u.set(T,x),T.update())}function st(T,x){const F=T.colorSpace,$=T.format,j=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||F!==_i&&F!==Dn&&(Ve.getTransfer(F)===Je?($!==Yt||j!==fn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),x}function Ee(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=k,this.setTexture2D=K,this.setTexture2DArray=W,this.setTexture3D=te,this.setTextureCube=V,this.rebindTextures=ze,this.setupRenderTarget=lt,this.updateRenderTargetMipmap=We,this.updateMultisampleRenderTarget=Wt,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=_e,this.useMultisampledRTT=He}function bm(i,e){function t(n,r=Dn){let s;const o=Ve.getTransfer(r);if(n===fn)return i.UNSIGNED_BYTE;if(n===ks)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Hs)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Fa)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Ua)return i.BYTE;if(n===Na)return i.SHORT;if(n===$i)return i.UNSIGNED_SHORT;if(n===zs)return i.INT;if(n===jn)return i.UNSIGNED_INT;if(n===sn)return i.FLOAT;if(n===pn)return i.HALF_FLOAT;if(n===Oa)return i.ALPHA;if(n===Ba)return i.RGB;if(n===Yt)return i.RGBA;if(n===za)return i.LUMINANCE;if(n===ka)return i.LUMINANCE_ALPHA;if(n===gi)return i.DEPTH_COMPONENT;if(n===vi)return i.DEPTH_STENCIL;if(n===Gs)return i.RED;if(n===Vs)return i.RED_INTEGER;if(n===Ha)return i.RG;if(n===Ws)return i.RG_INTEGER;if(n===Xs)return i.RGBA_INTEGER;if(n===Ar||n===Cr||n===Rr||n===Pr)if(o===Je)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Ar)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Cr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Rr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Pr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Ar)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Cr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Rr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Pr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===qs||n===Ys||n===$s||n===Zs)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===qs)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ys)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===$s)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Zs)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ks||n===js||n===Js)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Ks||n===js)return o===Je?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Js)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Qs||n===eo||n===to||n===no||n===io||n===ro||n===so||n===oo||n===ao||n===lo||n===co||n===uo||n===ho||n===fo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Qs)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===eo)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===to)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===no)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===io)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ro)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===so)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===oo)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ao)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===lo)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===co)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===uo)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ho)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===fo)return o===Je?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Lr||n===po||n===mo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Lr)return o===Je?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===po)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===mo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ga||n===go||n===vo||n===_o)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Lr)return s.COMPRESSED_RED_RGTC1_EXT;if(n===go)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===vo)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===_o)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===mi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class Tm extends Gt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Mn extends ht{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Am={type:"move"};class ea{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Mn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Mn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Mn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),h=this._getHandJoint(c,_);m!==null&&(h.matrix.fromArray(m.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,h.jointRadius=m.radius),h.visible=m!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],p=u.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&p>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Am)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Mn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Cm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Rm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Pm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const r=new Tt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Rt({vertexShader:Cm,fragmentShader:Rm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new xe(new ri(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Lm extends Si{constructor(e,t){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,d=null,p=null,f=null,g=null;const _=new Pm,m=t.getContextAttributes();let h=null,y=null;const M=[],v=[],R=new Q;let b=null;const A=new Gt;A.viewport=new Qe;const L=new Gt;L.viewport=new Qe;const E=[A,L],S=new Tm;let P=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let ne=M[q];return ne===void 0&&(ne=new ea,M[q]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(q){let ne=M[q];return ne===void 0&&(ne=new ea,M[q]=ne),ne.getGripSpace()},this.getHand=function(q){let ne=M[q];return ne===void 0&&(ne=new ea,M[q]=ne),ne.getHandSpace()};function O(q){const ne=v.indexOf(q.inputSource);if(ne===-1)return;const _e=M[ne];_e!==void 0&&(_e.update(q.inputSource,q.frame,c||o),_e.dispatchEvent({type:q.type,data:q.inputSource}))}function G(){r.removeEventListener("select",O),r.removeEventListener("selectstart",O),r.removeEventListener("selectend",O),r.removeEventListener("squeeze",O),r.removeEventListener("squeezestart",O),r.removeEventListener("squeezeend",O),r.removeEventListener("end",G),r.removeEventListener("inputsourceschange",K);for(let q=0;q<M.length;q++){const ne=v[q];ne!==null&&(v[q]=null,M[q].disconnect(ne))}P=null,k=null,_.reset(),e.setRenderTarget(h),f=null,p=null,d=null,r=null,y=null,tt.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return d},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(q){if(r=q,r!==null){if(h=e.getRenderTarget(),r.addEventListener("select",O),r.addEventListener("selectstart",O),r.addEventListener("selectend",O),r.addEventListener("squeeze",O),r.addEventListener("squeezestart",O),r.addEventListener("squeezeend",O),r.addEventListener("end",G),r.addEventListener("inputsourceschange",K),m.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(R),r.renderState.layers===void 0){const ne={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,ne),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new $t(f.framebufferWidth,f.framebufferHeight,{format:Yt,type:fn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ne=null,_e=null,oe=null;m.depth&&(oe=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=m.stencil?vi:gi,_e=m.stencil?mi:jn);const Re={colorFormat:t.RGBA8,depthFormat:oe,scaleFactor:s};d=new XRWebGLBinding(r,t),p=d.createProjectionLayer(Re),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),y=new $t(p.textureWidth,p.textureHeight,{format:Yt,type:fn,depthTexture:new Pl(p.textureWidth,p.textureHeight,_e,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),tt.setContext(r),tt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function K(q){for(let ne=0;ne<q.removed.length;ne++){const _e=q.removed[ne],oe=v.indexOf(_e);oe>=0&&(v[oe]=null,M[oe].disconnect(_e))}for(let ne=0;ne<q.added.length;ne++){const _e=q.added[ne];let oe=v.indexOf(_e);if(oe===-1){for(let Ie=0;Ie<M.length;Ie++)if(Ie>=v.length){v.push(_e),oe=Ie;break}else if(v[Ie]===null){v[Ie]=_e,oe=Ie;break}if(oe===-1)break}const Re=M[oe];Re&&Re.connect(_e)}}const W=new C,te=new C;function V(q,ne,_e){W.setFromMatrixPosition(ne.matrixWorld),te.setFromMatrixPosition(_e.matrixWorld);const oe=W.distanceTo(te),Re=ne.projectionMatrix.elements,Ie=_e.projectionMatrix.elements,ze=Re[14]/(Re[10]-1),lt=Re[14]/(Re[10]+1),We=(Re[9]+1)/Re[5],ut=(Re[9]-1)/Re[5],N=(Re[8]-1)/Re[0],Wt=(Ie[8]+1)/Ie[0],ke=ze*N,He=ze*Wt,Te=oe/(-N+Wt),st=Te*-N;if(ne.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(st),q.translateZ(Te),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Re[10]===-1)q.projectionMatrix.copy(ne.projectionMatrix),q.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{const Ee=ze+Te,T=lt+Te,x=ke-st,F=He+(oe-st),$=We*lt/T*Ee,j=ut*lt/T*Ee;q.projectionMatrix.makePerspective(x,F,$,j,Ee,T),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function se(q,ne){ne===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(ne.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let ne=q.near,_e=q.far;_.texture!==null&&(_.depthNear>0&&(ne=_.depthNear),_.depthFar>0&&(_e=_.depthFar)),S.near=L.near=A.near=ne,S.far=L.far=A.far=_e,(P!==S.near||k!==S.far)&&(r.updateRenderState({depthNear:S.near,depthFar:S.far}),P=S.near,k=S.far),A.layers.mask=q.layers.mask|2,L.layers.mask=q.layers.mask|4,S.layers.mask=A.layers.mask|L.layers.mask;const oe=q.parent,Re=S.cameras;se(S,oe);for(let Ie=0;Ie<Re.length;Ie++)se(Re[Ie],oe);Re.length===2?V(S,A,L):S.projectionMatrix.copy(A.projectionMatrix),he(q,S,oe)};function he(q,ne,_e){_e===null?q.matrix.copy(ne.matrixWorld):(q.matrix.copy(_e.matrixWorld),q.matrix.invert(),q.matrix.multiply(ne.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(ne.projectionMatrix),q.projectionMatrixInverse.copy(ne.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=yo*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(p===null&&f===null))return l},this.setFoveation=function(q){l=q,p!==null&&(p.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(S)};let Me=null;function Be(q,ne){if(u=ne.getViewerPose(c||o),g=ne,u!==null){const _e=u.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let oe=!1;_e.length!==S.cameras.length&&(S.cameras.length=0,oe=!0);for(let Ie=0;Ie<_e.length;Ie++){const ze=_e[Ie];let lt=null;if(f!==null)lt=f.getViewport(ze);else{const ut=d.getViewSubImage(p,ze);lt=ut.viewport,Ie===0&&(e.setRenderTargetTextures(y,ut.colorTexture,p.ignoreDepthValues?void 0:ut.depthStencilTexture),e.setRenderTarget(y))}let We=E[Ie];We===void 0&&(We=new Gt,We.layers.enable(Ie),We.viewport=new Qe,E[Ie]=We),We.matrix.fromArray(ze.transform.matrix),We.matrix.decompose(We.position,We.quaternion,We.scale),We.projectionMatrix.fromArray(ze.projectionMatrix),We.projectionMatrixInverse.copy(We.projectionMatrix).invert(),We.viewport.set(lt.x,lt.y,lt.width,lt.height),Ie===0&&(S.matrix.copy(We.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),oe===!0&&S.cameras.push(We)}const Re=r.enabledFeatures;if(Re&&Re.includes("depth-sensing")){const Ie=d.getDepthInformation(_e[0]);Ie&&Ie.isValid&&Ie.texture&&_.init(e,Ie,r.renderState)}}for(let _e=0;_e<M.length;_e++){const oe=v[_e],Re=M[_e];oe!==null&&Re!==void 0&&Re.update(oe,ne,c||o)}Me&&Me(q,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),g=null}const tt=new Ml;tt.setAnimationLoop(Be),this.setAnimationLoop=function(q){Me=q},this.dispose=function(){}}}const li=new gt,Im=new Ke;function Dm(i,e){function t(m,h){m.matrixAutoUpdate===!0&&m.updateMatrix(),h.value.copy(m.matrix)}function n(m,h){h.color.getRGB(m.fogColor.value,vl(i)),h.isFog?(m.fogNear.value=h.near,m.fogFar.value=h.far):h.isFogExp2&&(m.fogDensity.value=h.density)}function r(m,h,y,M,v){h.isMeshBasicMaterial||h.isMeshLambertMaterial?s(m,h):h.isMeshToonMaterial?(s(m,h),d(m,h)):h.isMeshPhongMaterial?(s(m,h),u(m,h)):h.isMeshStandardMaterial?(s(m,h),p(m,h),h.isMeshPhysicalMaterial&&f(m,h,v)):h.isMeshMatcapMaterial?(s(m,h),g(m,h)):h.isMeshDepthMaterial?s(m,h):h.isMeshDistanceMaterial?(s(m,h),_(m,h)):h.isMeshNormalMaterial?s(m,h):h.isLineBasicMaterial?(o(m,h),h.isLineDashedMaterial&&a(m,h)):h.isPointsMaterial?l(m,h,y,M):h.isSpriteMaterial?c(m,h):h.isShadowMaterial?(m.color.value.copy(h.color),m.opacity.value=h.opacity):h.isShaderMaterial&&(h.uniformsNeedUpdate=!1)}function s(m,h){m.opacity.value=h.opacity,h.color&&m.diffuse.value.copy(h.color),h.emissive&&m.emissive.value.copy(h.emissive).multiplyScalar(h.emissiveIntensity),h.map&&(m.map.value=h.map,t(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.bumpMap&&(m.bumpMap.value=h.bumpMap,t(h.bumpMap,m.bumpMapTransform),m.bumpScale.value=h.bumpScale,h.side===Pt&&(m.bumpScale.value*=-1)),h.normalMap&&(m.normalMap.value=h.normalMap,t(h.normalMap,m.normalMapTransform),m.normalScale.value.copy(h.normalScale),h.side===Pt&&m.normalScale.value.negate()),h.displacementMap&&(m.displacementMap.value=h.displacementMap,t(h.displacementMap,m.displacementMapTransform),m.displacementScale.value=h.displacementScale,m.displacementBias.value=h.displacementBias),h.emissiveMap&&(m.emissiveMap.value=h.emissiveMap,t(h.emissiveMap,m.emissiveMapTransform)),h.specularMap&&(m.specularMap.value=h.specularMap,t(h.specularMap,m.specularMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest);const y=e.get(h),M=y.envMap,v=y.envMapRotation;M&&(m.envMap.value=M,li.copy(v),li.x*=-1,li.y*=-1,li.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(li.y*=-1,li.z*=-1),m.envMapRotation.value.setFromMatrix4(Im.makeRotationFromEuler(li)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=h.reflectivity,m.ior.value=h.ior,m.refractionRatio.value=h.refractionRatio),h.lightMap&&(m.lightMap.value=h.lightMap,m.lightMapIntensity.value=h.lightMapIntensity,t(h.lightMap,m.lightMapTransform)),h.aoMap&&(m.aoMap.value=h.aoMap,m.aoMapIntensity.value=h.aoMapIntensity,t(h.aoMap,m.aoMapTransform))}function o(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,h.map&&(m.map.value=h.map,t(h.map,m.mapTransform))}function a(m,h){m.dashSize.value=h.dashSize,m.totalSize.value=h.dashSize+h.gapSize,m.scale.value=h.scale}function l(m,h,y,M){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.size.value=h.size*y,m.scale.value=M*.5,h.map&&(m.map.value=h.map,t(h.map,m.uvTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function c(m,h){m.diffuse.value.copy(h.color),m.opacity.value=h.opacity,m.rotation.value=h.rotation,h.map&&(m.map.value=h.map,t(h.map,m.mapTransform)),h.alphaMap&&(m.alphaMap.value=h.alphaMap,t(h.alphaMap,m.alphaMapTransform)),h.alphaTest>0&&(m.alphaTest.value=h.alphaTest)}function u(m,h){m.specular.value.copy(h.specular),m.shininess.value=Math.max(h.shininess,1e-4)}function d(m,h){h.gradientMap&&(m.gradientMap.value=h.gradientMap)}function p(m,h){m.metalness.value=h.metalness,h.metalnessMap&&(m.metalnessMap.value=h.metalnessMap,t(h.metalnessMap,m.metalnessMapTransform)),m.roughness.value=h.roughness,h.roughnessMap&&(m.roughnessMap.value=h.roughnessMap,t(h.roughnessMap,m.roughnessMapTransform)),h.envMap&&(m.envMapIntensity.value=h.envMapIntensity)}function f(m,h,y){m.ior.value=h.ior,h.sheen>0&&(m.sheenColor.value.copy(h.sheenColor).multiplyScalar(h.sheen),m.sheenRoughness.value=h.sheenRoughness,h.sheenColorMap&&(m.sheenColorMap.value=h.sheenColorMap,t(h.sheenColorMap,m.sheenColorMapTransform)),h.sheenRoughnessMap&&(m.sheenRoughnessMap.value=h.sheenRoughnessMap,t(h.sheenRoughnessMap,m.sheenRoughnessMapTransform))),h.clearcoat>0&&(m.clearcoat.value=h.clearcoat,m.clearcoatRoughness.value=h.clearcoatRoughness,h.clearcoatMap&&(m.clearcoatMap.value=h.clearcoatMap,t(h.clearcoatMap,m.clearcoatMapTransform)),h.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=h.clearcoatRoughnessMap,t(h.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),h.clearcoatNormalMap&&(m.clearcoatNormalMap.value=h.clearcoatNormalMap,t(h.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(h.clearcoatNormalScale),h.side===Pt&&m.clearcoatNormalScale.value.negate())),h.dispersion>0&&(m.dispersion.value=h.dispersion),h.iridescence>0&&(m.iridescence.value=h.iridescence,m.iridescenceIOR.value=h.iridescenceIOR,m.iridescenceThicknessMinimum.value=h.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=h.iridescenceThicknessRange[1],h.iridescenceMap&&(m.iridescenceMap.value=h.iridescenceMap,t(h.iridescenceMap,m.iridescenceMapTransform)),h.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=h.iridescenceThicknessMap,t(h.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),h.transmission>0&&(m.transmission.value=h.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),h.transmissionMap&&(m.transmissionMap.value=h.transmissionMap,t(h.transmissionMap,m.transmissionMapTransform)),m.thickness.value=h.thickness,h.thicknessMap&&(m.thicknessMap.value=h.thicknessMap,t(h.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=h.attenuationDistance,m.attenuationColor.value.copy(h.attenuationColor)),h.anisotropy>0&&(m.anisotropyVector.value.set(h.anisotropy*Math.cos(h.anisotropyRotation),h.anisotropy*Math.sin(h.anisotropyRotation)),h.anisotropyMap&&(m.anisotropyMap.value=h.anisotropyMap,t(h.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=h.specularIntensity,m.specularColor.value.copy(h.specularColor),h.specularColorMap&&(m.specularColorMap.value=h.specularColorMap,t(h.specularColorMap,m.specularColorMapTransform)),h.specularIntensityMap&&(m.specularIntensityMap.value=h.specularIntensityMap,t(h.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,h){h.matcap&&(m.matcap.value=h.matcap)}function _(m,h){const y=e.get(h).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Um(i,e,t,n){let r={},s={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,M){const v=M.program;n.uniformBlockBinding(y,v)}function c(y,M){let v=r[y.id];v===void 0&&(g(y),v=u(y),r[y.id]=v,y.addEventListener("dispose",m));const R=M.program;n.updateUBOMapping(y,R);const b=e.render.frame;s[y.id]!==b&&(p(y),s[y.id]=b)}function u(y){const M=d();y.__bindingPointIndex=M;const v=i.createBuffer(),R=y.__size,b=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,R,b),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,v),v}function d(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(y){const M=r[y.id],v=y.uniforms,R=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let b=0,A=v.length;b<A;b++){const L=Array.isArray(v[b])?v[b]:[v[b]];for(let E=0,S=L.length;E<S;E++){const P=L[E];if(f(P,b,E,R)===!0){const k=P.__offset,O=Array.isArray(P.value)?P.value:[P.value];let G=0;for(let K=0;K<O.length;K++){const W=O[K],te=_(W);typeof W=="number"||typeof W=="boolean"?(P.__data[0]=W,i.bufferSubData(i.UNIFORM_BUFFER,k+G,P.__data)):W.isMatrix3?(P.__data[0]=W.elements[0],P.__data[1]=W.elements[1],P.__data[2]=W.elements[2],P.__data[3]=0,P.__data[4]=W.elements[3],P.__data[5]=W.elements[4],P.__data[6]=W.elements[5],P.__data[7]=0,P.__data[8]=W.elements[6],P.__data[9]=W.elements[7],P.__data[10]=W.elements[8],P.__data[11]=0):(W.toArray(P.__data,G),G+=te.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,k,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(y,M,v,R){const b=y.value,A=M+"_"+v;if(R[A]===void 0)return typeof b=="number"||typeof b=="boolean"?R[A]=b:R[A]=b.clone(),!0;{const L=R[A];if(typeof b=="number"||typeof b=="boolean"){if(L!==b)return R[A]=b,!0}else if(L.equals(b)===!1)return L.copy(b),!0}return!1}function g(y){const M=y.uniforms;let v=0;const R=16;for(let A=0,L=M.length;A<L;A++){const E=Array.isArray(M[A])?M[A]:[M[A]];for(let S=0,P=E.length;S<P;S++){const k=E[S],O=Array.isArray(k.value)?k.value:[k.value];for(let G=0,K=O.length;G<K;G++){const W=O[G],te=_(W),V=v%R,se=V%te.boundary,he=V+se;v+=se,he!==0&&R-he<te.storage&&(v+=R-he),k.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=v,v+=te.storage}}}const b=v%R;return b>0&&(v+=R-b),y.__size=v,y.__cache={},this}function _(y){const M={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=48,M.storage=48):y.isMatrix4?(M.boundary=64,M.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),M}function m(y){const M=y.target;M.removeEventListener("dispose",m);const v=o.indexOf(M.__bindingPointIndex);o.splice(v,1),i.deleteBuffer(r[M.id]),delete r[M.id],delete s[M.id]}function h(){for(const y in r)i.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:h}}class Nm{constructor(e={}){const{canvas:t=ih(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,h=null;const y=[],M=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=kt,this.toneMapping=In,this.toneMappingExposure=1;const v=this;let R=!1,b=0,A=0,L=null,E=-1,S=null;const P=new Qe,k=new Qe;let O=null;const G=new we(0);let K=0,W=t.width,te=t.height,V=1,se=null,he=null;const Me=new Qe(0,0,W,te),Be=new Qe(0,0,W,te);let tt=!1;const q=new Xo;let ne=!1,_e=!1;const oe=new Ke,Re=new Ke,Ie=new C,ze=new Qe,lt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let We=!1;function ut(){return L===null?V:1}let N=n;function Wt(w,D){return t.getContext(w,D)}try{const w={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${qt}`),t.addEventListener("webglcontextlost",Z,!1),t.addEventListener("webglcontextrestored",ue,!1),t.addEventListener("webglcontextcreationerror",le,!1),N===null){const D="webgl2";if(N=Wt(D,w),N===null)throw Wt(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(w){throw console.error("THREE.WebGLRenderer: "+w.message),w}let ke,He,Te,st,Ee,T,x,F,$,j,X,Se,ae,de,Xe,J,fe,Ce,Pe,pe,Ge,Oe,nt,I;function re(){ke=new kf(N),ke.init(),Oe=new bm(N,ke),He=new Uf(N,ke,e,Oe),Te=new Mm(N,ke),He.reverseDepthBuffer&&p&&Te.buffers.depth.setReversed(!0),st=new Vf(N),Ee=new am,T=new Em(N,ke,Te,Ee,He,Oe,st),x=new Ff(v),F=new zf(v),$=new Rh(N),nt=new If(N,$),j=new Hf(N,$,st,nt),X=new Xf(N,j,$,st),Pe=new Wf(N,He,T),J=new Nf(Ee),Se=new om(v,x,F,ke,He,nt,J),ae=new Dm(v,Ee),de=new cm,Xe=new mm(ke),Ce=new Lf(v,x,F,Te,X,f,l),fe=new Sm(v,X,He),I=new Um(N,st,He,Te),pe=new Df(N,ke,st),Ge=new Gf(N,ke,st),st.programs=Se.programs,v.capabilities=He,v.extensions=ke,v.properties=Ee,v.renderLists=de,v.shadowMap=fe,v.state=Te,v.info=st}re();const H=new Lm(v,N);this.xr=H,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const w=ke.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){const w=ke.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(w){w!==void 0&&(V=w,this.setSize(W,te,!1))},this.getSize=function(w){return w.set(W,te)},this.setSize=function(w,D,B=!0){if(H.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=w,te=D,t.width=Math.floor(w*V),t.height=Math.floor(D*V),B===!0&&(t.style.width=w+"px",t.style.height=D+"px"),this.setViewport(0,0,w,D)},this.getDrawingBufferSize=function(w){return w.set(W*V,te*V).floor()},this.setDrawingBufferSize=function(w,D,B){W=w,te=D,V=B,t.width=Math.floor(w*B),t.height=Math.floor(D*B),this.setViewport(0,0,w,D)},this.getCurrentViewport=function(w){return w.copy(P)},this.getViewport=function(w){return w.copy(Me)},this.setViewport=function(w,D,B,z){w.isVector4?Me.set(w.x,w.y,w.z,w.w):Me.set(w,D,B,z),Te.viewport(P.copy(Me).multiplyScalar(V).round())},this.getScissor=function(w){return w.copy(Be)},this.setScissor=function(w,D,B,z){w.isVector4?Be.set(w.x,w.y,w.z,w.w):Be.set(w,D,B,z),Te.scissor(k.copy(Be).multiplyScalar(V).round())},this.getScissorTest=function(){return tt},this.setScissorTest=function(w){Te.setScissorTest(tt=w)},this.setOpaqueSort=function(w){se=w},this.setTransparentSort=function(w){he=w},this.getClearColor=function(w){return w.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor.apply(Ce,arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha.apply(Ce,arguments)},this.clear=function(w=!0,D=!0,B=!0){let z=0;if(w){let U=!1;if(L!==null){const ee=L.texture.format;U=ee===Xs||ee===Ws||ee===Vs}if(U){const ee=L.texture.type,ce=ee===fn||ee===jn||ee===$i||ee===mi||ee===ks||ee===Hs,me=Ce.getClearColor(),ge=Ce.getClearAlpha(),Le=me.r,Ne=me.g,ve=me.b;ce?(g[0]=Le,g[1]=Ne,g[2]=ve,g[3]=ge,N.clearBufferuiv(N.COLOR,0,g)):(_[0]=Le,_[1]=Ne,_[2]=ve,_[3]=ge,N.clearBufferiv(N.COLOR,0,_))}else z|=N.COLOR_BUFFER_BIT}D&&(z|=N.DEPTH_BUFFER_BIT),B&&(z|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Z,!1),t.removeEventListener("webglcontextrestored",ue,!1),t.removeEventListener("webglcontextcreationerror",le,!1),de.dispose(),Xe.dispose(),Ee.dispose(),x.dispose(),F.dispose(),X.dispose(),nt.dispose(),I.dispose(),Se.dispose(),H.dispose(),H.removeEventListener("sessionstart",cu),H.removeEventListener("sessionend",uu),ci.stop()};function Z(w){w.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function ue(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;const w=st.autoReset,D=fe.enabled,B=fe.autoUpdate,z=fe.needsUpdate,U=fe.type;re(),st.autoReset=w,fe.enabled=D,fe.autoUpdate=B,fe.needsUpdate=z,fe.type=U}function le(w){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function Ue(w){const D=w.target;D.removeEventListener("dispose",Ue),ct(D)}function ct(w){bt(w),Ee.remove(w)}function bt(w){const D=Ee.get(w).programs;D!==void 0&&(D.forEach(function(B){Se.releaseProgram(B)}),w.isShaderMaterial&&Se.releaseShaderCache(w))}this.renderBufferDirect=function(w,D,B,z,U,ee){D===null&&(D=lt);const ce=U.isMesh&&U.matrixWorld.determinant()<0,me=b0(w,D,B,z,U);Te.setMaterial(z,ce);let ge=B.index,Le=1;if(z.wireframe===!0){if(ge=j.getWireframeAttribute(B),ge===void 0)return;Le=2}const Ne=B.drawRange,ve=B.attributes.position;let qe=Ne.start*Le,it=(Ne.start+Ne.count)*Le;ee!==null&&(qe=Math.max(qe,ee.start*Le),it=Math.min(it,(ee.start+ee.count)*Le)),ge!==null?(qe=Math.max(qe,0),it=Math.min(it,ge.count)):ve!=null&&(qe=Math.max(qe,0),it=Math.min(it,ve.count));const ot=it-qe;if(ot<0||ot===1/0)return;nt.setup(U,z,me,B,ge);let Dt,$e=pe;if(ge!==null&&(Dt=$.get(ge),$e=Ge,$e.setIndex(Dt)),U.isMesh)z.wireframe===!0?(Te.setLineWidth(z.wireframeLinewidth*ut()),$e.setMode(N.LINES)):$e.setMode(N.TRIANGLES);else if(U.isLine){let ye=z.linewidth;ye===void 0&&(ye=1),Te.setLineWidth(ye*ut()),U.isLineSegments?$e.setMode(N.LINES):U.isLineLoop?$e.setMode(N.LINE_LOOP):$e.setMode(N.LINE_STRIP)}else U.isPoints?$e.setMode(N.POINTS):U.isSprite&&$e.setMode(N.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)$e.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(ke.get("WEBGL_multi_draw"))$e.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const ye=U._multiDrawStarts,Rn=U._multiDrawCounts,Ze=U._multiDrawCount,nn=ge?$.get(ge).bytesPerElement:1,Yi=Ee.get(z).currentProgram.getUniforms();for(let zt=0;zt<Ze;zt++)Yi.setValue(N,"_gl_DrawID",zt),$e.render(ye[zt]/nn,Rn[zt])}else if(U.isInstancedMesh)$e.renderInstances(qe,ot,U.count);else if(B.isInstancedBufferGeometry){const ye=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,Rn=Math.min(B.instanceCount,ye);$e.renderInstances(qe,ot,Rn)}else $e.render(qe,ot)};function je(w,D,B){w.transparent===!0&&w.side===Lt&&w.forceSinglePass===!1?(w.side=Pt,w.needsUpdate=!0,Ms(w,D,B),w.side=Ln,w.needsUpdate=!0,Ms(w,D,B),w.side=Lt):Ms(w,D,B)}this.compile=function(w,D,B=null){B===null&&(B=w),h=Xe.get(B),h.init(D),M.push(h),B.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(h.pushLight(U),U.castShadow&&h.pushShadow(U))}),w!==B&&w.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(h.pushLight(U),U.castShadow&&h.pushShadow(U))}),h.setupLights();const z=new Set;return w.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const ee=U.material;if(ee)if(Array.isArray(ee))for(let ce=0;ce<ee.length;ce++){const me=ee[ce];je(me,B,U),z.add(me)}else je(ee,B,U),z.add(ee)}),M.pop(),h=null,z},this.compileAsync=function(w,D,B=null){const z=this.compile(w,D,B);return new Promise(U=>{function ee(){if(z.forEach(function(ce){Ee.get(ce).currentProgram.isReady()&&z.delete(ce)}),z.size===0){U(w);return}setTimeout(ee,10)}ke.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let tn=null;function Cn(w){tn&&tn(w)}function cu(){ci.stop()}function uu(){ci.start()}const ci=new Ml;ci.setAnimationLoop(Cn),typeof self<"u"&&ci.setContext(self),this.setAnimationLoop=function(w){tn=w,H.setAnimationLoop(w),w===null?ci.stop():ci.start()},H.addEventListener("sessionstart",cu),H.addEventListener("sessionend",uu),this.render=function(w,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),H.enabled===!0&&H.isPresenting===!0&&(H.cameraAutoUpdate===!0&&H.updateCamera(D),D=H.getCamera()),w.isScene===!0&&w.onBeforeRender(v,w,D,L),h=Xe.get(w,M.length),h.init(D),M.push(h),Re.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),q.setFromProjectionMatrix(Re),_e=this.localClippingEnabled,ne=J.init(this.clippingPlanes,_e),m=de.get(w,y.length),m.init(),y.push(m),H.enabled===!0&&H.isPresenting===!0){const ee=v.xr.getDepthSensingMesh();ee!==null&&Ca(ee,D,-1/0,v.sortObjects)}Ca(w,D,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(se,he),We=H.enabled===!1||H.isPresenting===!1||H.hasDepthSensing()===!1,We&&Ce.addToRenderList(m,w),this.info.render.frame++,ne===!0&&J.beginShadows();const B=h.state.shadowsArray;fe.render(B,w,D),ne===!0&&J.endShadows(),this.info.autoReset===!0&&this.info.reset();const z=m.opaque,U=m.transmissive;if(h.setupLights(),D.isArrayCamera){const ee=D.cameras;if(U.length>0)for(let ce=0,me=ee.length;ce<me;ce++){const ge=ee[ce];du(z,U,w,ge)}We&&Ce.render(w);for(let ce=0,me=ee.length;ce<me;ce++){const ge=ee[ce];hu(m,w,ge,ge.viewport)}}else U.length>0&&du(z,U,w,D),We&&Ce.render(w),hu(m,w,D);L!==null&&(T.updateMultisampleRenderTarget(L),T.updateRenderTargetMipmap(L)),w.isScene===!0&&w.onAfterRender(v,w,D),nt.resetDefaultState(),E=-1,S=null,M.pop(),M.length>0?(h=M[M.length-1],ne===!0&&J.setGlobalState(v.clippingPlanes,h.state.camera)):h=null,y.pop(),y.length>0?m=y[y.length-1]:m=null};function Ca(w,D,B,z){if(w.visible===!1)return;if(w.layers.test(D.layers)){if(w.isGroup)B=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(D);else if(w.isLight)h.pushLight(w),w.castShadow&&h.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||q.intersectsSprite(w)){z&&ze.setFromMatrixPosition(w.matrixWorld).applyMatrix4(Re);const ce=X.update(w),me=w.material;me.visible&&m.push(w,ce,me,B,ze.z,null)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||q.intersectsObject(w))){const ce=X.update(w),me=w.material;if(z&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),ze.copy(w.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),ze.copy(ce.boundingSphere.center)),ze.applyMatrix4(w.matrixWorld).applyMatrix4(Re)),Array.isArray(me)){const ge=ce.groups;for(let Le=0,Ne=ge.length;Le<Ne;Le++){const ve=ge[Le],qe=me[ve.materialIndex];qe&&qe.visible&&m.push(w,ce,qe,B,ze.z,ve)}}else me.visible&&m.push(w,ce,me,B,ze.z,null)}}const ee=w.children;for(let ce=0,me=ee.length;ce<me;ce++)Ca(ee[ce],D,B,z)}function hu(w,D,B,z){const U=w.opaque,ee=w.transmissive,ce=w.transparent;h.setupLightsView(B),ne===!0&&J.setGlobalState(v.clippingPlanes,B),z&&Te.viewport(P.copy(z)),U.length>0&&ys(U,D,B),ee.length>0&&ys(ee,D,B),ce.length>0&&ys(ce,D,B),Te.buffers.depth.setTest(!0),Te.buffers.depth.setMask(!0),Te.buffers.color.setMask(!0),Te.setPolygonOffset(!1)}function du(w,D,B,z){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;h.state.transmissionRenderTarget[z.id]===void 0&&(h.state.transmissionRenderTarget[z.id]=new $t(1,1,{generateMipmaps:!0,type:ke.has("EXT_color_buffer_half_float")||ke.has("EXT_color_buffer_float")?pn:fn,minFilter:Kn,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ve.workingColorSpace}));const ee=h.state.transmissionRenderTarget[z.id],ce=z.viewport||P;ee.setSize(ce.z,ce.w);const me=v.getRenderTarget();v.setRenderTarget(ee),v.getClearColor(G),K=v.getClearAlpha(),K<1&&v.setClearColor(16777215,.5),v.clear(),We&&Ce.render(B);const ge=v.toneMapping;v.toneMapping=In;const Le=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),h.setupLightsView(z),ne===!0&&J.setGlobalState(v.clippingPlanes,z),ys(w,B,z),T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee),ke.has("WEBGL_multisampled_render_to_texture")===!1){let Ne=!1;for(let ve=0,qe=D.length;ve<qe;ve++){const it=D[ve],ot=it.object,Dt=it.geometry,$e=it.material,ye=it.group;if($e.side===Lt&&ot.layers.test(z.layers)){const Rn=$e.side;$e.side=Pt,$e.needsUpdate=!0,fu(ot,B,z,Dt,$e,ye),$e.side=Rn,$e.needsUpdate=!0,Ne=!0}}Ne===!0&&(T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee))}v.setRenderTarget(me),v.setClearColor(G,K),Le!==void 0&&(z.viewport=Le),v.toneMapping=ge}function ys(w,D,B){const z=D.isScene===!0?D.overrideMaterial:null;for(let U=0,ee=w.length;U<ee;U++){const ce=w[U],me=ce.object,ge=ce.geometry,Le=z===null?ce.material:z,Ne=ce.group;me.layers.test(B.layers)&&fu(me,D,B,ge,Le,Ne)}}function fu(w,D,B,z,U,ee){w.onBeforeRender(v,D,B,z,U,ee),w.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),U.onBeforeRender(v,D,B,z,w,ee),U.transparent===!0&&U.side===Lt&&U.forceSinglePass===!1?(U.side=Pt,U.needsUpdate=!0,v.renderBufferDirect(B,D,z,U,w,ee),U.side=Ln,U.needsUpdate=!0,v.renderBufferDirect(B,D,z,U,w,ee),U.side=Lt):v.renderBufferDirect(B,D,z,U,w,ee),w.onAfterRender(v,D,B,z,U,ee)}function Ms(w,D,B){D.isScene!==!0&&(D=lt);const z=Ee.get(w),U=h.state.lights,ee=h.state.shadowsArray,ce=U.state.version,me=Se.getParameters(w,U.state,ee,D,B),ge=Se.getProgramCacheKey(me);let Le=z.programs;z.environment=w.isMeshStandardMaterial?D.environment:null,z.fog=D.fog,z.envMap=(w.isMeshStandardMaterial?F:x).get(w.envMap||z.environment),z.envMapRotation=z.environment!==null&&w.envMap===null?D.environmentRotation:w.envMapRotation,Le===void 0&&(w.addEventListener("dispose",Ue),Le=new Map,z.programs=Le);let Ne=Le.get(ge);if(Ne!==void 0){if(z.currentProgram===Ne&&z.lightsStateVersion===ce)return mu(w,me),Ne}else me.uniforms=Se.getUniforms(w),w.onBeforeCompile(me,v),Ne=Se.acquireProgram(me,ge),Le.set(ge,Ne),z.uniforms=me.uniforms;const ve=z.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(ve.clippingPlanes=J.uniform),mu(w,me),z.needsLights=A0(w),z.lightsStateVersion=ce,z.needsLights&&(ve.ambientLightColor.value=U.state.ambient,ve.lightProbe.value=U.state.probe,ve.directionalLights.value=U.state.directional,ve.directionalLightShadows.value=U.state.directionalShadow,ve.spotLights.value=U.state.spot,ve.spotLightShadows.value=U.state.spotShadow,ve.rectAreaLights.value=U.state.rectArea,ve.ltc_1.value=U.state.rectAreaLTC1,ve.ltc_2.value=U.state.rectAreaLTC2,ve.pointLights.value=U.state.point,ve.pointLightShadows.value=U.state.pointShadow,ve.hemisphereLights.value=U.state.hemi,ve.directionalShadowMap.value=U.state.directionalShadowMap,ve.directionalShadowMatrix.value=U.state.directionalShadowMatrix,ve.spotShadowMap.value=U.state.spotShadowMap,ve.spotLightMatrix.value=U.state.spotLightMatrix,ve.spotLightMap.value=U.state.spotLightMap,ve.pointShadowMap.value=U.state.pointShadowMap,ve.pointShadowMatrix.value=U.state.pointShadowMatrix),z.currentProgram=Ne,z.uniformsList=null,Ne}function pu(w){if(w.uniformsList===null){const D=w.currentProgram.getUniforms();w.uniformsList=is.seqWithValue(D.seq,w.uniforms)}return w.uniformsList}function mu(w,D){const B=Ee.get(w);B.outputColorSpace=D.outputColorSpace,B.batching=D.batching,B.batchingColor=D.batchingColor,B.instancing=D.instancing,B.instancingColor=D.instancingColor,B.instancingMorph=D.instancingMorph,B.skinning=D.skinning,B.morphTargets=D.morphTargets,B.morphNormals=D.morphNormals,B.morphColors=D.morphColors,B.morphTargetsCount=D.morphTargetsCount,B.numClippingPlanes=D.numClippingPlanes,B.numIntersection=D.numClipIntersection,B.vertexAlphas=D.vertexAlphas,B.vertexTangents=D.vertexTangents,B.toneMapping=D.toneMapping}function b0(w,D,B,z,U){D.isScene!==!0&&(D=lt),T.resetTextureUnits();const ee=D.fog,ce=z.isMeshStandardMaterial?D.environment:null,me=L===null?v.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:_i,ge=(z.isMeshStandardMaterial?F:x).get(z.envMap||ce),Le=z.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Ne=!!B.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),ve=!!B.morphAttributes.position,qe=!!B.morphAttributes.normal,it=!!B.morphAttributes.color;let ot=In;z.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(ot=v.toneMapping);const Dt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,$e=Dt!==void 0?Dt.length:0,ye=Ee.get(z),Rn=h.state.lights;if(ne===!0&&(_e===!0||w!==S)){const Xt=w===S&&z.id===E;J.setState(z,w,Xt)}let Ze=!1;z.version===ye.__version?(ye.needsLights&&ye.lightsStateVersion!==Rn.state.version||ye.outputColorSpace!==me||U.isBatchedMesh&&ye.batching===!1||!U.isBatchedMesh&&ye.batching===!0||U.isBatchedMesh&&ye.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&ye.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&ye.instancing===!1||!U.isInstancedMesh&&ye.instancing===!0||U.isSkinnedMesh&&ye.skinning===!1||!U.isSkinnedMesh&&ye.skinning===!0||U.isInstancedMesh&&ye.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&ye.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&ye.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&ye.instancingMorph===!1&&U.morphTexture!==null||ye.envMap!==ge||z.fog===!0&&ye.fog!==ee||ye.numClippingPlanes!==void 0&&(ye.numClippingPlanes!==J.numPlanes||ye.numIntersection!==J.numIntersection)||ye.vertexAlphas!==Le||ye.vertexTangents!==Ne||ye.morphTargets!==ve||ye.morphNormals!==qe||ye.morphColors!==it||ye.toneMapping!==ot||ye.morphTargetsCount!==$e)&&(Ze=!0):(Ze=!0,ye.__version=z.version);let nn=ye.currentProgram;Ze===!0&&(nn=Ms(z,D,U));let Yi=!1,zt=!1,Mr=!1;const at=nn.getUniforms(),un=ye.uniforms;if(Te.useProgram(nn.program)&&(Yi=!0,zt=!0,Mr=!0),z.id!==E&&(E=z.id,zt=!0),Yi||S!==w){Te.buffers.depth.getReversed()?(oe.copy(w.projectionMatrix),sh(oe),oh(oe),at.setValue(N,"projectionMatrix",oe)):at.setValue(N,"projectionMatrix",w.projectionMatrix),at.setValue(N,"viewMatrix",w.matrixWorldInverse);const qn=at.map.cameraPosition;qn!==void 0&&qn.setValue(N,Ie.setFromMatrixPosition(w.matrixWorld)),He.logarithmicDepthBuffer&&at.setValue(N,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&at.setValue(N,"isOrthographic",w.isOrthographicCamera===!0),S!==w&&(S=w,zt=!0,Mr=!0)}if(U.isSkinnedMesh){at.setOptional(N,U,"bindMatrix"),at.setOptional(N,U,"bindMatrixInverse");const Xt=U.skeleton;Xt&&(Xt.boneTexture===null&&Xt.computeBoneTexture(),at.setValue(N,"boneTexture",Xt.boneTexture,T))}U.isBatchedMesh&&(at.setOptional(N,U,"batchingTexture"),at.setValue(N,"batchingTexture",U._matricesTexture,T),at.setOptional(N,U,"batchingIdTexture"),at.setValue(N,"batchingIdTexture",U._indirectTexture,T),at.setOptional(N,U,"batchingColorTexture"),U._colorsTexture!==null&&at.setValue(N,"batchingColorTexture",U._colorsTexture,T));const wr=B.morphAttributes;if((wr.position!==void 0||wr.normal!==void 0||wr.color!==void 0)&&Pe.update(U,B,nn),(zt||ye.receiveShadow!==U.receiveShadow)&&(ye.receiveShadow=U.receiveShadow,at.setValue(N,"receiveShadow",U.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(un.envMap.value=ge,un.flipEnvMap.value=ge.isCubeTexture&&ge.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&D.environment!==null&&(un.envMapIntensity.value=D.environmentIntensity),zt&&(at.setValue(N,"toneMappingExposure",v.toneMappingExposure),ye.needsLights&&T0(un,Mr),ee&&z.fog===!0&&ae.refreshFogUniforms(un,ee),ae.refreshMaterialUniforms(un,z,V,te,h.state.transmissionRenderTarget[w.id]),is.upload(N,pu(ye),un,T)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(is.upload(N,pu(ye),un,T),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&at.setValue(N,"center",U.center),at.setValue(N,"modelViewMatrix",U.modelViewMatrix),at.setValue(N,"normalMatrix",U.normalMatrix),at.setValue(N,"modelMatrix",U.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){const Xt=z.uniformsGroups;for(let qn=0,Yn=Xt.length;qn<Yn;qn++){const gu=Xt[qn];I.update(gu,nn),I.bind(gu,nn)}}return nn}function T0(w,D){w.ambientLightColor.needsUpdate=D,w.lightProbe.needsUpdate=D,w.directionalLights.needsUpdate=D,w.directionalLightShadows.needsUpdate=D,w.pointLights.needsUpdate=D,w.pointLightShadows.needsUpdate=D,w.spotLights.needsUpdate=D,w.spotLightShadows.needsUpdate=D,w.rectAreaLights.needsUpdate=D,w.hemisphereLights.needsUpdate=D}function A0(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return b},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(w,D,B){Ee.get(w.texture).__webglTexture=D,Ee.get(w.depthTexture).__webglTexture=B;const z=Ee.get(w);z.__hasExternalTextures=!0,z.__autoAllocateDepthBuffer=B===void 0,z.__autoAllocateDepthBuffer||ke.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),z.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(w,D){const B=Ee.get(w);B.__webglFramebuffer=D,B.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(w,D=0,B=0){L=w,b=D,A=B;let z=!0,U=null,ee=!1,ce=!1;if(w){const ge=Ee.get(w);if(ge.__useDefaultFramebuffer!==void 0)Te.bindFramebuffer(N.FRAMEBUFFER,null),z=!1;else if(ge.__webglFramebuffer===void 0)T.setupRenderTarget(w);else if(ge.__hasExternalTextures)T.rebindTextures(w,Ee.get(w.texture).__webglTexture,Ee.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){const ve=w.depthTexture;if(ge.__boundDepthTexture!==ve){if(ve!==null&&Ee.has(ve)&&(w.width!==ve.image.width||w.height!==ve.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(w)}}const Le=w.texture;(Le.isData3DTexture||Le.isDataArrayTexture||Le.isCompressedArrayTexture)&&(ce=!0);const Ne=Ee.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Ne[D])?U=Ne[D][B]:U=Ne[D],ee=!0):w.samples>0&&T.useMultisampledRTT(w)===!1?U=Ee.get(w).__webglMultisampledFramebuffer:Array.isArray(Ne)?U=Ne[B]:U=Ne,P.copy(w.viewport),k.copy(w.scissor),O=w.scissorTest}else P.copy(Me).multiplyScalar(V).floor(),k.copy(Be).multiplyScalar(V).floor(),O=tt;if(Te.bindFramebuffer(N.FRAMEBUFFER,U)&&z&&Te.drawBuffers(w,U),Te.viewport(P),Te.scissor(k),Te.setScissorTest(O),ee){const ge=Ee.get(w.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+D,ge.__webglTexture,B)}else if(ce){const ge=Ee.get(w.texture),Le=D||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,ge.__webglTexture,B||0,Le)}E=-1},this.readRenderTargetPixels=function(w,D,B,z,U,ee,ce){if(!(w&&w.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let me=Ee.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ce!==void 0&&(me=me[ce]),me){Te.bindFramebuffer(N.FRAMEBUFFER,me);try{const ge=w.texture,Le=ge.format,Ne=ge.type;if(!He.textureFormatReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!He.textureTypeReadable(Ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=w.width-z&&B>=0&&B<=w.height-U&&N.readPixels(D,B,z,U,Oe.convert(Le),Oe.convert(Ne),ee)}finally{const ge=L!==null?Ee.get(L).__webglFramebuffer:null;Te.bindFramebuffer(N.FRAMEBUFFER,ge)}}},this.readRenderTargetPixelsAsync=async function(w,D,B,z,U,ee,ce){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let me=Ee.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&ce!==void 0&&(me=me[ce]),me){const ge=w.texture,Le=ge.format,Ne=ge.type;if(!He.textureFormatReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!He.textureTypeReadable(Ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=w.width-z&&B>=0&&B<=w.height-U){Te.bindFramebuffer(N.FRAMEBUFFER,me);const ve=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,ve),N.bufferData(N.PIXEL_PACK_BUFFER,ee.byteLength,N.STREAM_READ),N.readPixels(D,B,z,U,Oe.convert(Le),Oe.convert(Ne),0);const qe=L!==null?Ee.get(L).__webglFramebuffer:null;Te.bindFramebuffer(N.FRAMEBUFFER,qe);const it=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await rh(N,it,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,ve),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,ee),N.deleteBuffer(ve),N.deleteSync(it),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(w,D=null,B=0){w.isTexture!==!0&&(ji("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,w=arguments[1]);const z=Math.pow(2,-B),U=Math.floor(w.image.width*z),ee=Math.floor(w.image.height*z),ce=D!==null?D.x:0,me=D!==null?D.y:0;T.setTexture2D(w,0),N.copyTexSubImage2D(N.TEXTURE_2D,B,0,0,ce,me,U,ee),Te.unbindTexture()},this.copyTextureToTexture=function(w,D,B=null,z=null,U=0){w.isTexture!==!0&&(ji("WebGLRenderer: copyTextureToTexture function signature has changed."),z=arguments[0]||null,w=arguments[1],D=arguments[2],U=arguments[3]||0,B=null);let ee,ce,me,ge,Le,Ne,ve,qe,it;const ot=w.isCompressedTexture?w.mipmaps[U]:w.image;B!==null?(ee=B.max.x-B.min.x,ce=B.max.y-B.min.y,me=B.isBox3?B.max.z-B.min.z:1,ge=B.min.x,Le=B.min.y,Ne=B.isBox3?B.min.z:0):(ee=ot.width,ce=ot.height,me=ot.depth||1,ge=0,Le=0,Ne=0),z!==null?(ve=z.x,qe=z.y,it=z.z):(ve=0,qe=0,it=0);const Dt=Oe.convert(D.format),$e=Oe.convert(D.type);let ye;D.isData3DTexture?(T.setTexture3D(D,0),ye=N.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(T.setTexture2DArray(D,0),ye=N.TEXTURE_2D_ARRAY):(T.setTexture2D(D,0),ye=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,D.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,D.unpackAlignment);const Rn=N.getParameter(N.UNPACK_ROW_LENGTH),Ze=N.getParameter(N.UNPACK_IMAGE_HEIGHT),nn=N.getParameter(N.UNPACK_SKIP_PIXELS),Yi=N.getParameter(N.UNPACK_SKIP_ROWS),zt=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,ot.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ot.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,ge),N.pixelStorei(N.UNPACK_SKIP_ROWS,Le),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Ne);const Mr=w.isDataArrayTexture||w.isData3DTexture,at=D.isDataArrayTexture||D.isData3DTexture;if(w.isRenderTargetTexture||w.isDepthTexture){const un=Ee.get(w),wr=Ee.get(D),Xt=Ee.get(un.__renderTarget),qn=Ee.get(wr.__renderTarget);Te.bindFramebuffer(N.READ_FRAMEBUFFER,Xt.__webglFramebuffer),Te.bindFramebuffer(N.DRAW_FRAMEBUFFER,qn.__webglFramebuffer);for(let Yn=0;Yn<me;Yn++)Mr&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ee.get(w).__webglTexture,U,Ne+Yn),w.isDepthTexture?(at&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ee.get(D).__webglTexture,U,it+Yn),N.blitFramebuffer(ge,Le,ee,ce,ve,qe,ee,ce,N.DEPTH_BUFFER_BIT,N.NEAREST)):at?N.copyTexSubImage3D(ye,U,ve,qe,it+Yn,ge,Le,ee,ce):N.copyTexSubImage2D(ye,U,ve,qe,it+Yn,ge,Le,ee,ce);Te.bindFramebuffer(N.READ_FRAMEBUFFER,null),Te.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else at?w.isDataTexture||w.isData3DTexture?N.texSubImage3D(ye,U,ve,qe,it,ee,ce,me,Dt,$e,ot.data):D.isCompressedArrayTexture?N.compressedTexSubImage3D(ye,U,ve,qe,it,ee,ce,me,Dt,ot.data):N.texSubImage3D(ye,U,ve,qe,it,ee,ce,me,Dt,$e,ot):w.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,U,ve,qe,ee,ce,Dt,$e,ot.data):w.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,U,ve,qe,ot.width,ot.height,Dt,ot.data):N.texSubImage2D(N.TEXTURE_2D,U,ve,qe,ee,ce,Dt,$e,ot);N.pixelStorei(N.UNPACK_ROW_LENGTH,Rn),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Ze),N.pixelStorei(N.UNPACK_SKIP_PIXELS,nn),N.pixelStorei(N.UNPACK_SKIP_ROWS,Yi),N.pixelStorei(N.UNPACK_SKIP_IMAGES,zt),U===0&&D.generateMipmaps&&N.generateMipmap(ye),Te.unbindTexture()},this.copyTextureToTexture3D=function(w,D,B=null,z=null,U=0){return w.isTexture!==!0&&(ji("WebGLRenderer: copyTextureToTexture3D function signature has changed."),B=arguments[0]||null,z=arguments[1]||null,w=arguments[2],D=arguments[3],U=arguments[4]||0),ji('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(w,D,B,z,U)},this.initRenderTarget=function(w){Ee.get(w).__webglFramebuffer===void 0&&T.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?T.setTextureCube(w,0):w.isData3DTexture?T.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?T.setTexture2DArray(w,0):T.setTexture2D(w,0),Te.unbindTexture()},this.resetState=function(){b=0,A=0,L=null,Te.reset(),nt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Ve._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ve._getUnpackColorSpace()}}class ta{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new we(e),this.density=t}clone(){return new ta(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Fm extends ht{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new gt,this.environmentIntensity=1,this.environmentRotation=new gt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Om extends Tt{constructor(e=null,t=1,n=1,r,s,o,a,l,c=Ut,u=Ut,d,p){super(null,o,a,l,c,u,r,s,d,p),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ql extends At{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const zi=new Ke,ec=new Ke,ss=[],tc=new Jn,Bm=new Ke,rr=new xe,sr=new Ti;class na extends xe{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ql(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Bm)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Jn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,zi),tc.copy(e.boundingBox).applyMatrix4(zi),this.boundingBox.union(tc)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ti),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,zi),sr.copy(e.boundingSphere).applyMatrix4(zi),this.boundingSphere.union(sr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,o=e*s+1;for(let a=0;a<n.length;a++)n[a]=r[o+a]}raycast(e,t){const n=this.matrixWorld,r=this.count;if(rr.geometry=this.geometry,rr.material=this.material,rr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),sr.copy(this.boundingSphere),sr.applyMatrix4(n),e.ray.intersectsSphere(sr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,zi),ec.multiplyMatrices(n,zi),rr.matrixWorld=ec,rr.raycast(e,ss);for(let o=0,a=ss.length;o<a;o++){const l=ss[o];l.instanceId=s,l.object=this,t.push(l)}ss.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Ql(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Om(new Float32Array(r*this.count),r,this.count,Gs,sn));const s=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class zm extends ti{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new we(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const nc=new Ke,ia=new Lo,os=new Ti,as=new C;class km extends ht{constructor(e=new wt,t=new zm){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),os.copy(n.boundingSphere),os.applyMatrix4(r),os.radius+=s,e.ray.intersectsSphere(os)===!1)return;nc.copy(r).invert(),ia.copy(e.ray).applyMatrix4(nc);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,d=n.attributes.position;if(c!==null){const p=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=p,_=f;g<_;g++){const m=c.getX(g);as.fromBufferAttribute(d,m),ic(as,m,l,r,e,t,this)}}else{const p=Math.max(0,o.start),f=Math.min(d.count,o.start+o.count);for(let g=p,_=f;g<_;g++)as.fromBufferAttribute(d,g),ic(as,g,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function ic(i,e,t,n,r,s,o){const a=ia.distanceSqToPoint(i);if(a<t){const l=new C;ia.closestPointToPoint(i,l),l.applyMatrix4(n);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class an{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let r=0;const s=n.length;let o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);const u=n[r],p=n[r+1]-u,f=(o-u)/p;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new Q:new C);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new C,r=[],s=[],o=[],a=new C,l=new Ke;for(let f=0;f<=e;f++){const g=f/e;r[f]=this.getTangentAt(g,new C)}s[0]=new C,o[0]=new C;let c=Number.MAX_VALUE;const u=Math.abs(r[0].x),d=Math.abs(r[0].y),p=Math.abs(r[0].z);u<=c&&(c=u,n.set(1,0,0)),d<=c&&(c=d,n.set(0,1,0)),p<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(mt(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(mt(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class ra extends an{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new Q){const n=t,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);const a=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),p=l-this.aX,f=c-this.aY;l=p*u-f*d+this.aX,c=p*d+f*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Hm extends ra{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function sa(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,d){let p=(o-s)/c-(a-s)/(c+u)+(a-o)/u,f=(a-o)/u-(l-o)/(u+d)+(l-a)/d;p*=u,f*=u,r(o,a,p,f)},calc:function(s){const o=s*s,a=o*s;return i+e*s+t*o+n*a}}}const ls=new C,oa=new sa,aa=new sa,la=new sa;class Gm extends an{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new C){const n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(ls.subVectors(r[0],r[1]).add(r[0]),c=ls);const d=r[a%s],p=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(ls.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=ls),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(d),f),_=Math.pow(d.distanceToSquared(p),f),m=Math.pow(p.distanceToSquared(u),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),oa.initNonuniformCatmullRom(c.x,d.x,p.x,u.x,g,_,m),aa.initNonuniformCatmullRom(c.y,d.y,p.y,u.y,g,_,m),la.initNonuniformCatmullRom(c.z,d.z,p.z,u.z,g,_,m)}else this.curveType==="catmullrom"&&(oa.initCatmullRom(c.x,d.x,p.x,u.x,this.tension),aa.initCatmullRom(c.y,d.y,p.y,u.y,this.tension),la.initCatmullRom(c.z,d.z,p.z,u.z,this.tension));return n.set(oa.calc(l),aa.calc(l),la.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new C().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function rc(i,e,t,n,r){const s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function Vm(i,e){const t=1-i;return t*t*e}function Wm(i,e){return 2*(1-i)*i*e}function Xm(i,e){return i*i*e}function or(i,e,t,n){return Vm(i,e)+Wm(i,t)+Xm(i,n)}function qm(i,e){const t=1-i;return t*t*t*e}function Ym(i,e){const t=1-i;return 3*t*t*i*e}function $m(i,e){return 3*(1-i)*i*i*e}function Zm(i,e){return i*i*i*e}function ar(i,e,t,n,r){return qm(i,e)+Ym(i,t)+$m(i,n)+Zm(i,r)}class sc extends an{constructor(e=new Q,t=new Q,n=new Q,r=new Q){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new Q){const n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(ar(e,r.x,s.x,o.x,a.x),ar(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Km extends an{constructor(e=new C,t=new C,n=new C,r=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new C){const n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(ar(e,r.x,s.x,o.x,a.x),ar(e,r.y,s.y,o.y,a.y),ar(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class oc extends an{constructor(e=new Q,t=new Q){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Q){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Q){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class jm extends an{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ac extends an{constructor(e=new Q,t=new Q,n=new Q){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Q){const n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(or(e,r.x,s.x,o.x),or(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Jm extends an{constructor(e=new C,t=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new C){const n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(or(e,r.x,s.x,o.x),or(e,r.y,s.y,o.y),or(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class lc extends an{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Q){const n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],d=r[o>r.length-3?r.length-1:o+2];return n.set(rc(a,l.x,c.x,u.x,d.x),rc(a,l.y,c.y,u.y,d.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new Q().fromArray(r))}return this}}var cc=Object.freeze({__proto__:null,ArcCurve:Hm,CatmullRomCurve3:Gm,CubicBezierCurve:sc,CubicBezierCurve3:Km,EllipseCurve:ra,LineCurve:oc,LineCurve3:jm,QuadraticBezierCurve:ac,QuadraticBezierCurve3:Jm,SplineCurve:lc});class Qm extends an{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new cc[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=n){const o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let r=0,s=this.curves;r<s.length;r++){const o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(new cc[r.type]().fromJSON(r))}return this}}class eg extends Qm{constructor(e){super(),this.type="Path",this.currentPoint=new Q,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new oc(this.currentPoint.clone(),new Q(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){const s=new ac(this.currentPoint.clone(),new Q(e,t),new Q(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){const a=new sc(this.currentPoint.clone(),new Q(e,t),new Q(n,r),new Q(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new lc(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){const c=new ra(e,t,n,r,s,o,a,l);if(this.curves.length>0){const d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class lr extends wt{constructor(e=[new Q(0,-.5),new Q(.5,0),new Q(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=mt(r,0,Math.PI*2);const s=[],o=[],a=[],l=[],c=[],u=1/t,d=new C,p=new Q,f=new C,g=new C,_=new C;let m=0,h=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:m=e[y+1].x-e[y].x,h=e[y+1].y-e[y].y,f.x=h*1,f.y=-m,f.z=h*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[y+1].x-e[y].x,h=e[y+1].y-e[y].y,f.x=h*1,f.y=-m,f.z=h*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let y=0;y<=t;y++){const M=n+y*u*r,v=Math.sin(M),R=Math.cos(M);for(let b=0;b<=e.length-1;b++){d.x=e[b].x*v,d.y=e[b].y,d.z=e[b].x*R,o.push(d.x,d.y,d.z),p.x=y/t,p.y=b/(e.length-1),a.push(p.x,p.y);const A=l[3*b+0]*v,L=l[3*b+1],E=l[3*b+0]*R;c.push(A,L,E)}}for(let y=0;y<t;y++)for(let M=0;M<e.length-1;M++){const v=M+y*e.length,R=v,b=v+e.length,A=v+e.length+1,L=v+1;s.push(R,b,L),s.push(A,L,b)}this.setIndex(s),this.setAttribute("position",new et(o,3)),this.setAttribute("uv",new et(a,2)),this.setAttribute("normal",new et(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new lr(e.points,e.segments,e.phiStart,e.phiLength)}}class cr extends lr{constructor(e=1,t=1,n=4,r=8){const s=new eg;s.absarc(0,-t/2,e,Math.PI*1.5,0),s.absarc(0,t/2,e,0,Math.PI*.5),super(s.getPoints(n),r),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:n,radialSegments:r}}static fromJSON(e){return new cr(e.radius,e.length,e.capSegments,e.radialSegments)}}class _t extends wt{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],d=[],p=[],f=[];let g=0;const _=[],m=n/2;let h=0;y(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(u),this.setAttribute("position",new et(d,3)),this.setAttribute("normal",new et(p,3)),this.setAttribute("uv",new et(f,2));function y(){const v=new C,R=new C;let b=0;const A=(t-e)/n;for(let L=0;L<=s;L++){const E=[],S=L/s,P=S*(t-e)+e;for(let k=0;k<=r;k++){const O=k/r,G=O*l+a,K=Math.sin(G),W=Math.cos(G);R.x=P*K,R.y=-S*n+m,R.z=P*W,d.push(R.x,R.y,R.z),v.set(K,A,W).normalize(),p.push(v.x,v.y,v.z),f.push(O,1-S),E.push(g++)}_.push(E)}for(let L=0;L<r;L++)for(let E=0;E<s;E++){const S=_[E][L],P=_[E+1][L],k=_[E+1][L+1],O=_[E][L+1];(e>0||E!==0)&&(u.push(S,P,O),b+=3),(t>0||E!==s-1)&&(u.push(P,k,O),b+=3)}c.addGroup(h,b,0),h+=b}function M(v){const R=g,b=new Q,A=new C;let L=0;const E=v===!0?e:t,S=v===!0?1:-1;for(let k=1;k<=r;k++)d.push(0,m*S,0),p.push(0,S,0),f.push(.5,.5),g++;const P=g;for(let k=0;k<=r;k++){const G=k/r*l+a,K=Math.cos(G),W=Math.sin(G);A.x=E*W,A.y=m*S,A.z=E*K,d.push(A.x,A.y,A.z),p.push(0,S,0),b.x=K*.5+.5,b.y=W*.5*S+.5,f.push(b.x,b.y),g++}for(let k=0;k<r;k++){const O=R+k,G=P+k;v===!0?u.push(G,G+1,O):u.push(G+1,G,O),L+=3}c.addGroup(h,L,v===!0?1:2),h+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new _t(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ln extends _t{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new ln(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ur extends wt{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};const s=[],o=[];a(r),c(n),u(),this.setAttribute("position",new et(s,3)),this.setAttribute("normal",new et(s.slice(),3)),this.setAttribute("uv",new et(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){const M=new C,v=new C,R=new C;for(let b=0;b<t.length;b+=3)f(t[b+0],M),f(t[b+1],v),f(t[b+2],R),l(M,v,R,y)}function l(y,M,v,R){const b=R+1,A=[];for(let L=0;L<=b;L++){A[L]=[];const E=y.clone().lerp(v,L/b),S=M.clone().lerp(v,L/b),P=b-L;for(let k=0;k<=P;k++)k===0&&L===b?A[L][k]=E:A[L][k]=E.clone().lerp(S,k/P)}for(let L=0;L<b;L++)for(let E=0;E<2*(b-L)-1;E++){const S=Math.floor(E/2);E%2===0?(p(A[L][S+1]),p(A[L+1][S]),p(A[L][S])):(p(A[L][S+1]),p(A[L+1][S+1]),p(A[L+1][S]))}}function c(y){const M=new C;for(let v=0;v<s.length;v+=3)M.x=s[v+0],M.y=s[v+1],M.z=s[v+2],M.normalize().multiplyScalar(y),s[v+0]=M.x,s[v+1]=M.y,s[v+2]=M.z}function u(){const y=new C;for(let M=0;M<s.length;M+=3){y.x=s[M+0],y.y=s[M+1],y.z=s[M+2];const v=m(y)/2/Math.PI+.5,R=h(y)/Math.PI+.5;o.push(v,1-R)}g(),d()}function d(){for(let y=0;y<o.length;y+=6){const M=o[y+0],v=o[y+2],R=o[y+4],b=Math.max(M,v,R),A=Math.min(M,v,R);b>.9&&A<.1&&(M<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),R<.2&&(o[y+4]+=1))}}function p(y){s.push(y.x,y.y,y.z)}function f(y,M){const v=y*3;M.x=e[v+0],M.y=e[v+1],M.z=e[v+2]}function g(){const y=new C,M=new C,v=new C,R=new C,b=new Q,A=new Q,L=new Q;for(let E=0,S=0;E<s.length;E+=9,S+=6){y.set(s[E+0],s[E+1],s[E+2]),M.set(s[E+3],s[E+4],s[E+5]),v.set(s[E+6],s[E+7],s[E+8]),b.set(o[S+0],o[S+1]),A.set(o[S+2],o[S+3]),L.set(o[S+4],o[S+5]),R.copy(y).add(M).add(v).divideScalar(3);const P=m(R);_(b,S+0,y,P),_(A,S+2,M,P),_(L,S+4,v,P)}}function _(y,M,v,R){R<0&&y.x===1&&(o[M]=y.x-1),v.x===0&&v.z===0&&(o[M]=R/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function h(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ur(e.vertices,e.indices,e.radius,e.details)}}class ca extends ur{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,r=1/n,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ca(e.radius,e.detail)}}class cs extends ur{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new cs(e.radius,e.detail)}}class us extends ur{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,r,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new us(e.radius,e.detail)}}class hs extends wt{constructor(e=.5,t=1,n=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);const a=[],l=[],c=[],u=[];let d=e;const p=(t-e)/r,f=new C,g=new Q;for(let _=0;_<=r;_++){for(let m=0;m<=n;m++){const h=s+m/n*o;f.x=d*Math.cos(h),f.y=d*Math.sin(h),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}d+=p}for(let _=0;_<r;_++){const m=_*(n+1);for(let h=0;h<n;h++){const y=h+m,M=y,v=y+n+1,R=y+n+2,b=y+1;a.push(M,v,b),a.push(v,R,b)}}this.setIndex(a),this.setAttribute("position",new et(l,3)),this.setAttribute("normal",new et(c,3)),this.setAttribute("uv",new et(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new hs(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Qt extends wt{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],d=new C,p=new C,f=[],g=[],_=[],m=[];for(let h=0;h<=n;h++){const y=[],M=h/n;let v=0;h===0&&o===0?v=.5/t:h===n&&l===Math.PI&&(v=-.5/t);for(let R=0;R<=t;R++){const b=R/t;d.x=-e*Math.cos(r+b*s)*Math.sin(o+M*a),d.y=e*Math.cos(o+M*a),d.z=e*Math.sin(r+b*s)*Math.sin(o+M*a),g.push(d.x,d.y,d.z),p.copy(d).normalize(),_.push(p.x,p.y,p.z),m.push(b+v,1-M),y.push(c++)}u.push(y)}for(let h=0;h<n;h++)for(let y=0;y<t;y++){const M=u[h][y+1],v=u[h][y],R=u[h+1][y],b=u[h+1][y+1];(h!==0||o>0)&&f.push(M,v,b),(h!==n-1||l<Math.PI)&&f.push(v,R,b)}this.setIndex(f),this.setAttribute("position",new et(g,3)),this.setAttribute("normal",new et(_,3)),this.setAttribute("uv",new et(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class ki extends wt{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s},n=Math.floor(n),r=Math.floor(r);const o=[],a=[],l=[],c=[],u=new C,d=new C,p=new C;for(let f=0;f<=n;f++)for(let g=0;g<=r;g++){const _=g/r*s,m=f/n*Math.PI*2;d.x=(e+t*Math.cos(m))*Math.cos(_),d.y=(e+t*Math.cos(m))*Math.sin(_),d.z=t*Math.sin(m),a.push(d.x,d.y,d.z),u.x=e*Math.cos(_),u.y=e*Math.sin(_),p.subVectors(d,u).normalize(),l.push(p.x,p.y,p.z),c.push(g/r),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=r;g++){const _=(r+1)*f+g-1,m=(r+1)*(f-1)+g-1,h=(r+1)*(f-1)+g,y=(r+1)*f+g;o.push(_,m,y),o.push(m,h,y)}this.setIndex(o),this.setAttribute("position",new et(a,3)),this.setAttribute("normal",new et(l,3)),this.setAttribute("uv",new et(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ki(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Ye extends ti{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new we(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new we(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xo,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gt,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class uc extends Ye{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Q(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return mt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new we(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new we(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new we(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Hi extends ti{static get type(){return"MeshLambertMaterial"}constructor(e){super(),this.isMeshLambertMaterial=!0,this.color=new we(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new we(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=xo,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gt,this.combine=Ds,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class ds extends ht{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new we(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class tg extends ds{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.groundColor=new we(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const ua=new Ke,hc=new C,dc=new C;class fc{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q(512,512),this.map=null,this.mapPass=null,this.matrix=new Ke,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Xo,this._frameExtents=new Q(1,1),this._viewportCount=1,this._viewports=[new Qe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;hc.setFromMatrixPosition(e.matrixWorld),t.position.copy(hc),dc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(dc),t.updateMatrixWorld(),ua.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ua),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ua)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const pc=new Ke,hr=new C,ha=new C;class ng extends fc{constructor(){super(new Gt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Q(4,2),this._viewportCount=6,this._viewports=[new Qe(2,1,1,1),new Qe(0,1,1,1),new Qe(3,1,1,1),new Qe(1,1,1,1),new Qe(3,0,1,1),new Qe(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),hr.setFromMatrixPosition(e.matrixWorld),n.position.copy(hr),ha.copy(n.position),ha.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ha),n.updateMatrixWorld(),r.makeTranslation(-hr.x,-hr.y,-hr.z),pc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(pc)}}class mc extends ds{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new ng}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class ig extends fc{constructor(){super(new es(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class gc extends ds{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ht.DEFAULT_UP),this.updateMatrix(),this.target=new ht,this.shadow=new ig}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class rg extends ds{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class sg{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=vc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=vc();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function vc(){return performance.now()}const _c=new Ke;class og{constructor(e,t,n=0,r=1/0){this.ray=new Lo(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Io,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return _c.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(_c),this}intersectObject(e,t=!0,n=[]){return da(e,this,n,t),n.sort(xc),n}intersectObjects(e,t=!0,n=[]){for(let r=0,s=e.length;r<s;r++)da(e[r],this,n,t);return n.sort(xc),n}}function xc(i,e){return i.distance-e.distance}function da(i,e,t,n){let r=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(r=!1),r===!0&&n===!0){const s=i.children;for(let o=0,a=s.length;o<a;o++)da(s[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:qt}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=qt);const Sc={easy:{label:"Easy",emoji:"🟢",startGold:600,startLives:30,enemyHpMult:.75,enemySpeedMult:.9,goldMult:1.2},normal:{label:"Normal",emoji:"🟡",startGold:400,startLives:20,enemyHpMult:1,enemySpeedMult:1,goldMult:1},hard:{label:"Hard",emoji:"🔴",startGold:250,startLives:10,enemyHpMult:1.4,enemySpeedMult:1.15,goldMult:.8}};function fa(i,e){return`${i},${e}`}const ag={cols:20,rows:12,cellSize:1,origin:{x:-10,z:-6},path:[[0,5],[1,5],[2,5],[3,5],[3,6],[3,7],[4,7],[5,7],[6,7],[7,7],[7,6],[7,5],[7,4],[8,4],[9,4],[10,4],[11,4],[11,5],[11,6],[11,7],[12,7],[13,7],[14,7],[15,7],[15,6],[15,5],[15,4],[16,4],[17,4],[18,4],[19,4]],spawnCell:[0,5],goalCell:[19,4]},lg={arrow:{name:"Arrow",damageType:"physical",levels:[{buildCost:80,upgradeCost:0,damage:18,cooldownSec:.6,range:3.5,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:30,cooldownSec:.5,range:4,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:50,cooldownSec:.4,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"arrow_rapid",name:"Rapid Arrow",cost:250,desc:"Insane ATK SPD"},{type:"arrow_pierce",name:"Piercing Arrow",cost:250,desc:"Chain ×4"}]},cannon:{name:"Cannon",damageType:"physical",levels:[{buildCost:120,upgradeCost:0,damage:40,cooldownSec:2,range:3,slow:null,aoeRadius:1.2,dot:null,chain:null},{buildCost:0,upgradeCost:100,damage:65,cooldownSec:1.8,range:3.5,slow:null,aoeRadius:1.5,dot:null,chain:null},{buildCost:0,upgradeCost:180,damage:100,cooldownSec:1.5,range:4,slow:null,aoeRadius:1.8,dot:null,chain:null}]},ice:{name:"Ice",damageType:"ice",levels:[{buildCost:80,upgradeCost:0,damage:8,cooldownSec:1.2,range:3,slow:{pct:.3,durationSec:2},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:14,cooldownSec:1,range:3.5,slow:{pct:.4,durationSec:2.5},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:22,cooldownSec:.8,range:4,slow:{pct:.5,durationSec:3},aoeRadius:0,dot:null,chain:null}]},fire:{name:"Fire",damageType:"fire",levels:[{buildCost:100,upgradeCost:0,damage:12,cooldownSec:1,range:3,slow:null,aoeRadius:0,dot:{dps:10,durationSec:3},chain:null},{buildCost:0,upgradeCost:90,damage:20,cooldownSec:.9,range:3.5,slow:null,aoeRadius:0,dot:{dps:16,durationSec:3},chain:null},{buildCost:0,upgradeCost:160,damage:32,cooldownSec:.8,range:4,slow:null,aoeRadius:0,dot:{dps:24,durationSec:3.5},chain:null}]},lightning:{name:"Lightning",damageType:"lightning",levels:[{buildCost:110,upgradeCost:0,damage:15,cooldownSec:1.2,range:3.5,slow:null,aoeRadius:0,dot:null,chain:{targets:2,rangeFalloff:2}},{buildCost:0,upgradeCost:100,damage:25,cooldownSec:1,range:4,slow:null,aoeRadius:0,dot:null,chain:{targets:3,rangeFalloff:2.5}},{buildCost:0,upgradeCost:170,damage:40,cooldownSec:.8,range:4.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}}]},poison:{name:"Poison",damageType:"poison",levels:[{buildCost:100,upgradeCost:0,damage:5,cooldownSec:1.5,range:3,slow:null,aoeRadius:1.5,dot:{dps:8,durationSec:4},chain:null},{buildCost:0,upgradeCost:90,damage:8,cooldownSec:1.3,range:3.5,slow:null,aoeRadius:1.8,dot:{dps:12,durationSec:4},chain:null},{buildCost:0,upgradeCost:160,damage:14,cooldownSec:1,range:4,slow:null,aoeRadius:2,dot:{dps:18,durationSec:5},chain:null}]},sniper:{name:"Sniper",damageType:"sniper",levels:[{buildCost:150,upgradeCost:0,damage:100,cooldownSec:2.8,range:7,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:175,cooldownSec:2.3,range:8,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:220,damage:280,cooldownSec:1.8,range:9,slow:null,aoeRadius:0,dot:null,chain:null}]},arrow_rapid:{name:"Rapid Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:35,cooldownSec:.15,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null}]},arrow_pierce:{name:"Piercing Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:90,cooldownSec:.5,range:5.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}}]}},cg={grunt:{name:"Grunt",hp:60,speed:1,bounty:8,weakness:["physical"],resistance:[],armor:0,shield:0,special:"none"},tank:{name:"Tank",hp:280,speed:.5,bounty:18,weakness:["fire"],resistance:["physical"],armor:8,shield:0,special:"none"},runner:{name:"Runner",hp:80,speed:1.6,bounty:10,weakness:["ice"],resistance:["physical"],armor:0,shield:0,special:"none"},swarm:{name:"Swarm",hp:25,speed:1.2,bounty:3,weakness:["lightning"],resistance:["sniper"],armor:0,shield:0,special:"none"},shield:{name:"Shield",hp:100,speed:.8,bounty:14,weakness:["fire"],resistance:["ice"],armor:0,shield:80,special:"none"},healer:{name:"Healer",hp:90,speed:.7,bounty:16,weakness:["poison"],resistance:[],armor:0,shield:0,special:"heal",healRadius:2.5,healAmount:15,healIntervalSec:2},boss:{name:"Boss",hp:1200,speed:.4,bounty:120,weakness:["sniper"],resistance:["physical","ice","poison"],armor:12,shield:0,special:"none"}},ug={prepSec:8,waves:JSON.parse('[{"groups":[{"type":"grunt","count":13,"intervalSec":0.8},{"type":"runner","count":6,"intervalSec":0.8}]},{"groups":[{"type":"runner","count":11,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"grunt","count":20,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"runner","count":10,"intervalSec":0.78}]},{"groups":[{"type":"runner","count":15,"intervalSec":0.78},{"type":"runner","count":6,"intervalSec":0.78},{"type":"runner","count":11,"intervalSec":0.78}]},{"groups":[{"type":"grunt","count":24,"intervalSec":0.77},{"type":"runner","count":16,"intervalSec":0.77},{"type":"grunt","count":10,"intervalSec":0.77}]},{"groups":[{"type":"runner","count":10,"intervalSec":0.77}]},{"groups":[{"type":"grunt","count":14,"intervalSec":0.76},{"type":"grunt","count":26,"intervalSec":0.76},{"type":"grunt","count":13,"intervalSec":0.76}]},{"groups":[{"type":"grunt","count":17,"intervalSec":0.76}]},{"groups":[{"type":"boss","count":1,"intervalSec":1},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":38,"intervalSec":0.38},{"type":"runner","count":9,"intervalSec":0.74},{"type":"runner","count":17,"intervalSec":0.74}]},{"groups":[{"type":"swarm","count":30,"intervalSec":0.38}]},{"groups":[{"type":"grunt","count":16,"intervalSec":0.74},{"type":"tank","count":3,"intervalSec":1.87}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.37},{"type":"runner","count":10,"intervalSec":0.73},{"type":"grunt","count":18,"intervalSec":0.73}]},{"groups":[{"type":"runner","count":15,"intervalSec":0.73}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.84},{"type":"swarm","count":40,"intervalSec":0.37},{"type":"tank","count":4,"intervalSec":1.84}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.72},{"type":"swarm","count":39,"intervalSec":0.37},{"type":"swarm","count":45,"intervalSec":0.37}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.71},{"type":"grunt","count":22,"intervalSec":0.71},{"type":"grunt","count":26,"intervalSec":0.71}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.81},{"type":"swarm","count":37,"intervalSec":0.36},{"type":"swarm","count":35,"intervalSec":0.36}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5}]},{"groups":[{"type":"grunt","count":21,"intervalSec":0.7},{"type":"runner","count":11,"intervalSec":0.7}]},{"groups":[{"type":"shield","count":5,"intervalSec":1.58},{"type":"runner","count":11,"intervalSec":0.69}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.77},{"type":"runner","count":19,"intervalSec":0.69},{"type":"grunt","count":24,"intervalSec":0.69}]},{"groups":[{"type":"grunt","count":31,"intervalSec":0.68}]},{"groups":[{"type":"swarm","count":44,"intervalSec":0.35},{"type":"swarm","count":35,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.68}]},{"groups":[{"type":"tank","count":10,"intervalSec":1.74},{"type":"grunt","count":19,"intervalSec":0.67}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.67},{"type":"tank","count":8,"intervalSec":1.73}]},{"groups":[{"type":"shield","count":10,"intervalSec":1.52},{"type":"swarm","count":35,"intervalSec":0.34},{"type":"shield","count":4,"intervalSec":1.52}]},{"groups":[{"type":"shield","count":10,"intervalSec":1.51},{"type":"swarm","count":43,"intervalSec":0.34}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5}]},{"groups":[{"type":"tank","count":6,"intervalSec":1.69}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.64},{"type":"healer","count":3,"intervalSec":3.36}]},{"groups":[{"type":"tank","count":7,"intervalSec":1.67},{"type":"swarm","count":37,"intervalSec":0.33},{"type":"grunt","count":23,"intervalSec":0.64}]},{"groups":[{"type":"shield","count":5,"intervalSec":1.46}]},{"groups":[{"type":"swarm","count":32,"intervalSec":0.33},{"type":"runner","count":15,"intervalSec":0.62}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.62},{"type":"shield","count":8,"intervalSec":1.44},{"type":"swarm","count":39,"intervalSec":0.33}]},{"groups":[{"type":"healer","count":5,"intervalSec":3.26},{"type":"grunt","count":32,"intervalSec":0.61}]},{"groups":[{"type":"healer","count":2,"intervalSec":3.24}]},{"groups":[{"type":"tank","count":6,"intervalSec":1.61},{"type":"runner","count":12,"intervalSec":0.6}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":6,"intervalSec":3.18},{"type":"healer","count":3,"intervalSec":3.18},{"type":"healer","count":6,"intervalSec":3.18}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.58},{"type":"shield","count":7,"intervalSec":1.38},{"type":"runner","count":23,"intervalSec":0.59}]},{"groups":[{"type":"runner","count":17,"intervalSec":0.59},{"type":"shield","count":11,"intervalSec":1.37},{"type":"tank","count":7,"intervalSec":1.57},{"type":"healer","count":5,"intervalSec":3.14}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.58},{"type":"swarm","count":55,"intervalSec":0.31}]},{"groups":[{"type":"healer","count":4,"intervalSec":3.1},{"type":"runner","count":23,"intervalSec":0.58},{"type":"runner","count":21,"intervalSec":0.58}]},{"groups":[{"type":"runner","count":16,"intervalSec":0.57},{"type":"runner","count":20,"intervalSec":0.57}]},{"groups":[{"type":"healer","count":6,"intervalSec":3.06},{"type":"tank","count":9,"intervalSec":1.53}]},{"groups":[{"type":"healer","count":3,"intervalSec":3.04},{"type":"shield","count":9,"intervalSec":1.32},{"type":"swarm","count":52,"intervalSec":0.3},{"type":"shield","count":12,"intervalSec":1.32}]},{"groups":[{"type":"shield","count":11,"intervalSec":1.31},{"type":"swarm","count":43,"intervalSec":0.3},{"type":"grunt","count":25,"intervalSec":0.56}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.49},{"type":"shield","count":13,"intervalSec":1.29},{"type":"swarm","count":64,"intervalSec":0.3}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.3},{"type":"runner","count":22,"intervalSec":0.54},{"type":"tank","count":7,"intervalSec":1.48}]},{"groups":[{"type":"grunt","count":35,"intervalSec":0.54},{"type":"swarm","count":65,"intervalSec":0.29}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"swarm","count":66,"intervalSec":0.29},{"type":"grunt","count":27,"intervalSec":0.53}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"tank","count":10,"intervalSec":1.45}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.44},{"type":"swarm","count":56,"intervalSec":0.29}]},{"groups":[{"type":"grunt","count":27,"intervalSec":0.52},{"type":"swarm","count":62,"intervalSec":0.29},{"type":"tank","count":8,"intervalSec":1.43}]},{"groups":[{"type":"runner","count":20,"intervalSec":0.51},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"grunt","count":36,"intervalSec":0.51}]},{"groups":[{"type":"runner","count":26,"intervalSec":0.51},{"type":"healer","count":3,"intervalSec":2.82},{"type":"runner","count":25,"intervalSec":0.51}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":4,"intervalSec":2.78},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"shield","count":8,"intervalSec":1.19},{"type":"shield","count":14,"intervalSec":1.19}]},{"groups":[{"type":"healer","count":4,"intervalSec":2.76},{"type":"healer","count":6,"intervalSec":2.76},{"type":"swarm","count":61,"intervalSec":0.28}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.37},{"type":"shield","count":13,"intervalSec":1.17}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.36},{"type":"swarm","count":59,"intervalSec":0.27},{"type":"shield","count":10,"intervalSec":1.16},{"type":"grunt","count":33,"intervalSec":0.48}]},{"groups":[{"type":"grunt","count":37,"intervalSec":0.48},{"type":"tank","count":9,"intervalSec":1.35}]},{"groups":[{"type":"grunt","count":44,"intervalSec":0.47},{"type":"swarm","count":69,"intervalSec":0.27},{"type":"healer","count":7,"intervalSec":2.68},{"type":"shield","count":14,"intervalSec":1.14}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.33},{"type":"shield","count":13,"intervalSec":1.13},{"type":"grunt","count":38,"intervalSec":0.47}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.46},{"type":"shield","count":13,"intervalSec":1.12},{"type":"shield","count":12,"intervalSec":1.12},{"type":"healer","count":7,"intervalSec":2.64}]},{"groups":[{"type":"healer","count":5,"intervalSec":2.62},{"type":"tank","count":9,"intervalSec":1.31}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":5,"intervalSec":2.58},{"type":"healer","count":4,"intervalSec":2.58},{"type":"healer","count":6,"intervalSec":2.58}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.28},{"type":"shield","count":14,"intervalSec":1.08},{"type":"grunt","count":42,"intervalSec":0.44}]},{"groups":[{"type":"shield","count":14,"intervalSec":1.07},{"type":"grunt","count":42,"intervalSec":0.44},{"type":"shield","count":12,"intervalSec":1.07}]},{"groups":[{"type":"swarm","count":70,"intervalSec":0.25},{"type":"grunt","count":36,"intervalSec":0.43},{"type":"tank","count":9,"intervalSec":1.26},{"type":"runner","count":22,"intervalSec":0.43},{"type":"shield","count":11,"intervalSec":1.06}]},{"groups":[{"type":"swarm","count":52,"intervalSec":0.25},{"type":"runner","count":25,"intervalSec":0.43},{"type":"runner","count":20,"intervalSec":0.43}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.42},{"type":"shield","count":14,"intervalSec":1.04},{"type":"shield","count":9,"intervalSec":1.04},{"type":"shield","count":14,"intervalSec":1.04}]},{"groups":[{"type":"runner","count":21,"intervalSec":0.42},{"type":"tank","count":15,"intervalSec":1.23},{"type":"shield","count":13,"intervalSec":1.03},{"type":"grunt","count":34,"intervalSec":0.42}]},{"groups":[{"type":"shield","count":15,"intervalSec":1.02},{"type":"healer","count":7,"intervalSec":2.44},{"type":"runner","count":20,"intervalSec":0.41},{"type":"shield","count":15,"intervalSec":1.02},{"type":"grunt","count":40,"intervalSec":0.41}]},{"groups":[{"type":"grunt","count":39,"intervalSec":0.41},{"type":"runner","count":20,"intervalSec":0.41},{"type":"grunt","count":33,"intervalSec":0.41}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.24},{"type":"runner","count":28,"intervalSec":0.4},{"type":"grunt","count":43,"intervalSec":0.4},{"type":"shield","count":16,"intervalSec":1}]},{"groups":[{"type":"swarm","count":72,"intervalSec":0.24},{"type":"tank","count":13,"intervalSec":1.18},{"type":"runner","count":25,"intervalSec":0.4},{"type":"shield","count":13,"intervalSec":1},{"type":"shield","count":14,"intervalSec":1}]},{"groups":[{"type":"swarm","count":74,"intervalSec":0.23},{"type":"swarm","count":70,"intervalSec":0.23},{"type":"swarm","count":62,"intervalSec":0.23},{"type":"runner","count":23,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":79,"intervalSec":0.23},{"type":"swarm","count":67,"intervalSec":0.23},{"type":"runner","count":30,"intervalSec":0.4},{"type":"grunt","count":49,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":82,"intervalSec":0.23},{"type":"swarm","count":73,"intervalSec":0.23},{"type":"healer","count":6,"intervalSec":2.3}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.23},{"type":"runner","count":27,"intervalSec":0.4},{"type":"healer","count":7,"intervalSec":2.28},{"type":"runner","count":28,"intervalSec":0.4}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.4},{"type":"runner","count":22,"intervalSec":0.4},{"type":"swarm","count":64,"intervalSec":0.23},{"type":"grunt","count":47,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.26}]},{"groups":[{"type":"shield","count":15,"intervalSec":1},{"type":"tank","count":10,"intervalSec":1.12},{"type":"healer","count":6,"intervalSec":2.24},{"type":"shield","count":13,"intervalSec":1}]},{"groups":[{"type":"healer","count":7,"intervalSec":2.22},{"type":"swarm","count":75,"intervalSec":0.22},{"type":"healer","count":7,"intervalSec":2.22},{"type":"runner","count":25,"intervalSec":0.4}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.22},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"shield","count":17,"intervalSec":1},{"type":"grunt","count":45,"intervalSec":0.4}]},{"groups":[{"type":"tank","count":17,"intervalSec":1.08},{"type":"runner","count":27,"intervalSec":0.4},{"type":"tank","count":12,"intervalSec":1.08}]},{"groups":[{"type":"swarm","count":64,"intervalSec":0.21},{"type":"tank","count":17,"intervalSec":1.07},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":73,"intervalSec":0.21}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.12},{"type":"healer","count":8,"intervalSec":2.12},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"swarm","count":83,"intervalSec":0.21},{"type":"tank","count":16,"intervalSec":1.06}]},{"groups":[{"type":"runner","count":32,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.1},{"type":"swarm","count":84,"intervalSec":0.21},{"type":"runner","count":26,"intervalSec":0.4},{"type":"shield","count":11,"intervalSec":1}]},{"groups":[{"type":"grunt","count":39,"intervalSec":0.4},{"type":"runner","count":29,"intervalSec":0.4},{"type":"shield","count":16,"intervalSec":1}]},{"groups":[{"type":"swarm","count":86,"intervalSec":0.21},{"type":"healer","count":5,"intervalSec":2.06},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":69,"intervalSec":0.21},{"type":"grunt","count":42,"intervalSec":0.4}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.04},{"type":"grunt","count":44,"intervalSec":0.4},{"type":"tank","count":14,"intervalSec":1.02},{"type":"runner","count":31,"intervalSec":0.4},{"type":"swarm","count":86,"intervalSec":0.2}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5}]}]')},hg={ranks:[{name:"S",min:18e3},{name:"A",min:12e3},{name:"B",min:6e3},{name:"C",min:0}]},be=ag,Vt=lg,dr=cg,Hn=ug,dg=hg,Gn=1/20,yc=.7,fr=12,pr=()=>typeof window>"u"?!1:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<768,rt={isMobile:pr(),maxParticles:pr()?200:800,enablePostProcessing:!pr(),enableShadows:!pr(),pixelRatio:pr()?1:Math.min(window.devicePixelRatio,2)};function wn(i,e){return{x:be.origin.x+(i+.5)*be.cellSize,z:be.origin.z+(e+.5)*be.cellSize}}function fg(){return be.path.map(([i,e])=>wn(i,e))}function pg(i,e){const t=i.x-e.x,n=i.z-e.z;return Math.sqrt(t*t+n*n)}function mg(){return[{name:"Airstrike",emoji:"✈️",cooldown:60,remaining:0,description:"All enemies take 200 AOE damage"},{name:"Freeze",emoji:"🧊",cooldown:45,remaining:0,description:"Freeze all enemies for 5s"},{name:"Repair",emoji:"💖",cooldown:90,remaining:0,description:"Restore 5 lives"}]}function gg(){return{totalDamageDealt:0,damageByType:{},killsByTower:{},longestStreak:0,towersBuilt:0,towersSold:0,goldEarned:0,goldSpent:0}}function pa(i="normal"){const e=fg(),t=new Set;for(const[r,s]of be.path)t.add(fa(r,s));const n=Sc[i];return{phase:"idle",gold:n.startGold,lives:n.startLives,maxLives:n.startLives,currentWave:0,score:0,perfectWaves:0,speedMultiplier:1,paused:!1,totalKills:0,difficulty:i,towers:[],enemies:[],projectiles:[],prepTimer:0,spawnTimers:[],spawnCounts:[],waveEnemiesSpawned:0,waveEnemiesTotal:0,waveLivesLostThisWave:0,lastWaveClearGold:0,milestoneReached:0,nextId:1,killStreak:0,killStreakTimer:0,floatingTexts:[],skills:mg(),stats:gg(),pathWorld:e,occupiedCells:new Set,pathCells:t}}function Mc(i){i.occupiedCells.clear();for(const e of i.towers)i.occupiedCells.add(fa(e.col,e.row))}class vg{constructor(){Ae(this,"listeners",new Map)}on(e,t){this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t)}off(e,t){const n=this.listeners.get(e);if(!n)return;const r=n.indexOf(t);r>=0&&n.splice(r,1)}emit(e){const t=this.listeners.get(e.type);if(t)for(const n of t)n(e)}clear(){this.listeners.clear()}}const St=new vg;function fs(i){if(i.currentWave>=Hn.waves.length)return;i.phase="prep",i.prepTimer=Hn.prepSec,i.waveLivesLostThisWave=0;const e=Hn.waves[i.currentWave];i.spawnTimers=e.groups.map(()=>0),i.spawnCounts=e.groups.map(()=>0),i.waveEnemiesSpawned=0,i.waveEnemiesTotal=e.groups.reduce((t,n)=>t+n.count,0)}function wc(i,e){if(i.phase==="prep"){if(i.prepTimer-=e,i.prepTimer<=0){const s=Math.min(150,Math.max(10,Math.floor(i.gold*.01)));i.gold+=s,i.floatingTexts.push({id:i.nextId++,worldX:0,worldZ:0,value:`+${s}g 利息`,color:"#aaff55",life:2,maxLife:2}),i.phase="wave"}i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));return}if(i.phase!=="wave")return;i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));const t=Hn.waves[i.currentWave];if(!t)return;for(let s=0;s<t.groups.length;s++){const o=t.groups[s];i.spawnCounts[s]>=o.count||(i.spawnTimers[s]-=e,i.spawnTimers[s]<=0&&(_g(i,o.type),i.spawnCounts[s]++,i.waveEnemiesSpawned++,i.spawnTimers[s]=o.intervalSec))}const n=i.waveEnemiesSpawned>=i.waveEnemiesTotal,r=i.enemies.every(s=>!s.alive||s.reached);if(n&&r){i.score+=i.currentWave<Hn.waves.length?100:0,i.waveLivesLostThisWave===0&&(i.score+=150,i.perfectWaves++);const s=i.currentWave+1;let o=100;s>60?o=250:s>30?o=200:s>10?o=150:o=120,i.gold+=o,i.lastWaveClearGold=o;const a=i.waveLivesLostThisWave===0;St.emit({type:"waveCleared",wave:s,goldBonus:o,perfect:a}),[25,50,75,99].includes(s)?(i.gold+=500,i.milestoneReached=s,St.emit({type:"milestone",wave:s})):i.milestoneReached=0,i.currentWave++,i.enemies=i.enemies.filter(c=>c.alive&&!c.reached),i.projectiles=i.projectiles.filter(c=>c.alive),i.currentWave>=Hn.waves.length?(i.score+=i.lives*25,i.phase="won",St.emit({type:"gameOver",won:!0,score:i.score})):fs(i)}}function _g(i,e){const t=dr[e],n=wn(be.path[0][0],be.path[0][1]),r=Sc[i.difficulty],s=1+i.currentWave*.04,o=s*r.enemyHpMult,a=r.enemySpeedMult,l=Math.pow(s,.5)*r.goldMult,c={id:i.nextId++,type:e,hp:Math.ceil(t.hp*o),maxHp:Math.ceil(t.hp*o),speed:t.speed*a,bounty:Math.ceil(t.bounty*l),pathIndex:0,pathProgress:0,worldX:n.x,worldZ:n.z,prevWorldX:n.x,prevWorldZ:n.z,alive:!0,reached:!1,slow:null,dots:[],shield:t.shield?Math.ceil(t.shield*o):0,maxShield:t.shield?Math.ceil(t.shield*o):0,armor:t.armor??0,special:t.special??"none",healCooldown:0};i.enemies.push(c)}function ma(i,e){e.hp=0,e.alive=!1,i.gold+=e.bounty,i.totalKills++,i.killStreak++,i.killStreakTimer=3,i.killStreak%10===0&&(i.gold+=50,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`⚡ x${i.killStreak} COMBO! +50g`,color:"#ffee00",life:2,maxLife:2}),St.emit({type:"streakBonus",streak:i.killStreak,gold:50})),i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`+${e.bounty}g`,color:"#ffd700",life:1.2,maxLife:1.2}),St.emit({type:"enemyKilled",enemyId:e.id,worldX:e.worldX,worldZ:e.worldZ,bounty:e.bounty,killStreak:i.killStreak})}const Ec=4,xg=20,Sg=50,yg=80;function bc(i,e){const t=i.pathWorld;if(t.length<2)return;let n=1;i.currentWave>=yg?n=1.3:i.currentWave>=Sg&&(n=1.15);for(const r of i.enemies){if(!r.alive||r.reached)continue;r.prevWorldX=r.worldX,r.prevWorldZ=r.worldZ;for(let a=r.dots.length-1;a>=0;a--){const l=r.dots[a],c=l.dps*e;if(Mg(i,r,c,l.damageType),l.remaining-=e,l.remaining<=0&&r.dots.splice(a,1),!r.alive)break}if(!r.alive)continue;let s=r.speed*n;if(r.slow&&(s*=1-r.slow.pct,r.slow.remaining-=e,r.slow.remaining<=0&&(r.slow=null)),r.special==="heal"){const a=dr[r.type];if(r.healCooldown-=e,r.healCooldown<=0){const l=a.healRadius??2.5,c=a.healAmount??15;for(const u of i.enemies){if(!u.alive||u.reached||u.id===r.id)continue;const d=u.worldX-r.worldX,p=u.worldZ-r.worldZ;Math.sqrt(d*d+p*p)<=l&&(u.hp=Math.min(u.maxHp,u.hp+c))}r.healCooldown=a.healIntervalSec??2}}r.maxShield>0&&r.shield<r.maxShield&&(r.special==="none"&&r.dots.length===0?(r.healCooldown-=e,r.healCooldown<=0&&(r.shield=Math.min(r.maxShield,r.shield+xg*e))):r.healCooldown=Ec);let o=s*e;for(;o>0&&r.pathIndex<t.length-1;){const a=t[r.pathIndex],l=t[r.pathIndex+1],c=pg(a,l);if(c<=0){r.pathIndex++;continue}const u=r.pathProgress*c,p=u+o;p>=c?(o-=c-u,r.pathIndex++,r.pathProgress=0):(r.pathProgress=p/c,o=0)}if(r.pathIndex>=t.length-1){r.reached=!0,r.alive=!1,i.lives--,i.waveLivesLostThisWave++,i.lives<=0&&(i.lives=0,i.phase="lost");const a=t[t.length-1];r.worldX=a.x,r.worldZ=a.z}else{const a=t[r.pathIndex],l=t[r.pathIndex+1];r.worldX=a.x+(l.x-a.x)*r.pathProgress,r.worldZ=a.z+(l.z-a.z)*r.pathProgress}}}function Mg(i,e,t,n){var o,a;const r=dr[e.type];let s=t;(o=r.weakness)!=null&&o.includes(n)&&(s*=1.5),(a=r.resistance)!=null&&a.includes(n)&&(s*=.5),s=Math.max(1,s-e.armor),e.maxShield>0&&e.special==="none"&&(e.healCooldown=Ec),s>=2&&i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(s)}`,color:"#66ee44",life:.8,maxLife:.8}),e.hp-=s,e.hp<=0&&ma(i,e)}function Tc(i,e){for(const t of i.towers){t.cooldownRemaining-=e;const n=Vt[t.type],r=n.levels[t.level],s=r.range;let o=null,a=t.targetingMode==="last"?1/0:-1/0;for(const l of i.enemies){if(!l.alive||l.reached)continue;const c=l.worldX-t.worldX,u=l.worldZ-t.worldZ;if(Math.sqrt(c*c+u*u)<=s){const p=l.pathIndex+l.pathProgress;let f;switch(t.targetingMode){case"first":f=p,f>a&&(a=f,o=l);break;case"last":f=p,f<a&&(a=f,o=l);break;case"strongest":f=l.hp+l.shield,f>a&&(a=f,o=l);break;case"weakest":f=-(l.hp+l.shield),f>a&&(a=f,o=l);break}}}if(t.targetId=o?o.id:null,!(t.cooldownRemaining>0)&&o){let l=0,c=fr;t.type==="cannon"||t.type==="poison"?(l=1.5,c=fr*.8):t.type==="lightning"?c=fr*8:t.type==="sniper"?c=fr*4:t.type==="fire"&&(c=fr*.6);const u={id:i.nextId++,fromTowerId:t.id,targetEnemyId:o.id,towerType:t.type,damageType:n.damageType,damage:r.damage,aoeRadius:r.aoeRadius,slow:r.slow,dot:r.dot,chain:r.chain,x:t.worldX,y:.8,z:t.worldZ,startX:t.worldX,startY:.8,startZ:t.worldZ,targetX:o.worldX,targetY:.3,targetZ:o.worldZ,speed:c,progress:0,arcHeight:l,alive:!0};i.projectiles.push(u),t.cooldownRemaining=r.cooldownSec,t.aimAngle=Math.atan2(o.worldX-t.worldX,o.worldZ-t.worldZ)}}}function Ac(i,e){for(const t of i.projectiles){if(!t.alive)continue;const n=i.enemies.find(c=>c.id===t.targetEnemyId);n&&n.alive&&!n.reached&&(t.targetX=n.worldX,t.targetZ=n.worldZ);const r=t.targetX-t.x,s=t.targetY-t.y,o=t.targetZ-t.z,a=Math.sqrt(r*r+s*s+o*o),l=t.speed*e;if(a<=l||a<.1){if(t.alive=!1,t.aoeRadius>0)for(const m of i.enemies){if(!m.alive||m.reached)continue;const h=m.worldX-t.targetX,y=m.worldZ-t.targetZ;Math.sqrt(h*h+y*y)<=t.aoeRadius&&(ps(i,m,t.damage,t.damageType),t.slow&&(m.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&m.dots.push({dps:t.dot.dps,remaining:t.dot.durationSec,damageType:t.damageType}))}else if(t.chain&&t.chain.targets>0){const m=[];n&&n.alive&&!n.reached&&(ps(i,n,t.damage,t.damageType),m.push(n),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}));let h=n;for(let y=0;y<t.chain.targets&&h;y++){let M=null,v=t.chain.rangeFalloff;for(const R of i.enemies){if(!R.alive||R.reached||m.includes(R))continue;const b=R.worldX-h.worldX,A=R.worldZ-h.worldZ,L=Math.sqrt(b*b+A*A);L<v&&(v=L,M=R)}if(M)ps(i,M,t.damage*.7,t.damageType),m.push(M),h=M;else break}}else n&&n.alive&&!n.reached&&(ps(i,n,t.damage,t.damageType),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&n.dots.push({dps:t.dot.dps,remaining:t.dot.durationSec,damageType:t.damageType}));t.x+=r/a*l,t.z+=o/a*l;const c=t.targetX-t.startX,u=t.targetZ-t.startZ,d=Math.max(.1,Math.sqrt(c*c+u*u)),p=t.x-t.startX,f=t.z-t.startZ,g=Math.sqrt(p*p+f*f);t.progress=Math.min(1,g/d);const _=t.startY+(t.targetY-t.startY)*t.progress;t.arcHeight>0?t.y=_+Math.sin(t.progress*Math.PI)*t.arcHeight:t.y=_}}i.projectiles=i.projectiles.filter(t=>t.alive)}function ps(i,e,t,n){var a,l,c;const r=dr[e.type];let s=t;if((a=r.weakness)!=null&&a.includes(n)&&(s*=1.5),(l=r.resistance)!=null&&l.includes(n)&&(s*=.5),s=Math.max(1,s-e.armor),e.shield>0)if(s<=e.shield){i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(s)}🛡`,color:"#88ddff",life:1,maxLife:1}),e.shield-=s;return}else{const u=e.shield;s-=e.shield,e.shield=0,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(u)}🛡`,color:"#88ddff",life:1,maxLife:1})}const o=(c=r.weakness)==null?void 0:c.includes(n);i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(s)}`,color:o?"#ffdd44":"#ff6655",life:1,maxLife:1}),e.hp-=s,e.hp<=0&&ma(i,e)}function Cc(i,e,t){if(e<0||e>=be.cols||t<0||t>=be.rows)return!1;const n=fa(e,t);return!(i.pathCells.has(n)||i.occupiedCells.has(n))}function wg(i,e,t,n){const r=Vt[e].levels[0];if(i.gold<r.buildCost||!Cc(i,t,n))return null;const s=wn(t,n),o={id:i.nextId++,type:e,level:0,col:t,row:n,worldX:s.x,worldZ:s.z,cooldownRemaining:0,totalInvested:r.buildCost,targetingMode:"first"};return i.gold-=r.buildCost,i.towers.push(o),Mc(i),St.emit({type:"towerBuilt",towerId:o.id,towerType:o.type,col:o.col,row:o.row}),o}function Eg(i,e){const t=i.towers.find(s=>s.id===e);if(!t)return!1;const n=Vt[t.type].levels;if(t.level>=n.length-1)return!1;const r=n[t.level+1];return i.gold<r.upgradeCost?!1:(i.gold-=r.upgradeCost,t.totalInvested+=r.upgradeCost,t.level++,St.emit({type:"towerUpgraded",towerId:t.id,newLevel:t.level}),!0)}function bg(i,e){const t=i.towers.findIndex(s=>s.id===e);if(t===-1)return 0;const n=i.towers[t],r=Math.floor(n.totalInvested*yc);return i.gold+=r,i.towers.splice(t,1),Mc(i),St.emit({type:"towerSold",towerId:n.id,refund:r,worldX:n.worldX,worldZ:n.worldZ}),r}function Rc(i){return Math.floor(i.totalInvested*yc)}function Tg(i,e){const t=Vt[e.type].levels;return e.level>=t.length-1?!1:i.gold>=t[e.level+1].upgradeCost}function Ag(i,e,t){const n=i.towers.find(o=>o.id===e);if(!n)return!1;const r=Vt[n.type];if(!r.evolutions)return!1;const s=r.evolutions.find(o=>o.type===t);return!s||i.gold<s.cost?!1:(i.gold-=s.cost,n.totalInvested+=s.cost,n.type=t,n.level=0,St.emit({type:"towerUpgraded",towerId:n.id,newLevel:0}),!0)}const Pc=4881497,Cg=13216110,Lc=3828297,Ic=5609983,Dc=16733525;class Rg{constructor(){Ae(this,"scene");Ae(this,"groundMeshes",[]);this.scene=new Fm,this.scene.background=new we(1714714)}buildGround(){const{cols:e,rows:t,cellSize:n,origin:r}=be,s=new Set;for(const[p,f]of be.path)s.add(`${p},${f}`);const o=`${be.spawnCell[0]},${be.spawnCell[1]}`,a=`${be.goalCell[0]},${be.goalCell[1]}`,l=new Bt(n*.96,.15,n*.96);for(let p=0;p<e;p++)for(let f=0;f<t;f++){const g=`${p},${f}`;let _=Pc,m=0,h=0;g===o?(_=Ic,m=Ic,h=.4):g===a?(_=Dc,m=Dc,h=.4):s.has(g)&&(_=Cg,m=5588002,h=.15);const y={color:_,emissive:m};h>0&&(y.emissiveIntensity=h);let M;rt.isMobile?M=new Hi(y):(y.roughness=.8,y.metalness=.1,M=new Ye(y)),_===Pc&&!rt.isMobile&&(M.onBeforeCompile=b=>{b.vertexShader=b.vertexShader.replace("#include <common>",`#include <common>
                            // Simple 2D noise
                            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
                            float snoise(vec2 v) {
                              const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                              vec2 i  = floor(v + dot(v, C.yy) );
                              vec2 x0 = v -   i + dot(i, C.xx);
                              vec2 i1;
                              i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                              vec4 x12 = x0.xyxy + C.xxzz;
                              x12.xy -= i1;
                              i = mod289(i);
                              vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                              vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                              m = m*m;
                              m = m*m;
                              vec3 x = 2.0 * fract(p * C.www) - 1.0;
                              vec3 h = abs(x) - 0.5;
                              vec3 ox = floor(x + 0.5);
                              vec3 a0 = x - ox;
                              m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                              vec3 g;
                              g.x  = a0.x  * x0.x  + h.x  * x0.y;
                              g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                              return 130.0 * dot(m, g);
                            }
                            `),b.vertexShader=b.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
                             // Add slight height variation based on world position
                             vec4 worldPositionForNoise = modelMatrix * vec4(transformed, 1.0);
                             float noiseVal = snoise(worldPositionForNoise.xz * 2.0) * 0.05;
                             // Only perturb top face
                             if (normal.y > 0.5) {
                                transformed.y += noiseVal;
                             }
                            `),b.fragmentShader=b.fragmentShader.replace("#include <common>",`#include <common>
                            // Pass noise to fragment if wanted
                            `),b.fragmentShader=b.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
                            // Slightly vary color
                            `)});const v=new xe(l,M),R=wn(p,f);v.position.set(R.x,-.075,R.z),v.receiveShadow=!0,v.userData={col:p,row:f,type:"ground"},this.scene.add(v),this.groundMeshes.push(v)}const c=new ri(e*n+1,t*n+1);let u;rt.isMobile?u=new Ft({color:Lc}):u=new Ye({color:Lc,roughness:.9,metalness:0});const d=new xe(c,u);d.rotation.x=-Math.PI/2,d.position.set(r.x+e*n/2,-.2,r.z+t*n/2),d.receiveShadow=!0,this.scene.add(d),this.buildScenery()}buildScenery(){const{cols:e,rows:t,cellSize:n}=be,r=new _t(.05,.08,.3,5),s=new ln(.3,.8,6),o=new Hi({color:4864812}),a=new Hi({color:2968606}),l=400,c=new na(r,o,l),u=new na(s,a,l);rt.enableShadows&&(c.castShadow=!0,u.castShadow=!0);const d=new ht;let p=0;const f=8;for(let g=-f;g<e+f;g++)for(let _=-f;_<t+f;_++)if(!(g>=-1&&g<=e&&_>=-1&&_<=t)&&Math.random()<.4&&p<l){const m=wn(g,_),h=(Math.random()-.5)*n,y=(Math.random()-.5)*n,M=.8+Math.random()*.6;d.position.set(m.x+h,.15*M,m.z+y),d.scale.set(M,M,M),d.rotation.set(0,Math.random()*Math.PI,0),d.updateMatrix(),c.setMatrixAt(p,d.matrix),d.position.set(m.x+h,.6*M,m.z+y),d.updateMatrix(),u.setMatrixAt(p,d.matrix),p++}c.count=p,u.count=p,this.scene.add(c),this.scene.add(u)}}const Pg=10,Uc=4,Nc=22,Lg=40,Ig=35,ga=20;class Dg{constructor(){Ae(this,"cam");Ae(this,"frustum",Pg);Ae(this,"tilt",Lg*Math.PI/180);Ae(this,"yaw",Ig*Math.PI/180);Ae(this,"cx");Ae(this,"cz");Ae(this,"lastPinchDist",0);Ae(this,"lastRotAngle",0);Ae(this,"isTwoFinger",!1);Ae(this,"onTouchStart",e=>{e.touches.length===2&&(this.isTwoFinger=!0,this.lastPinchDist=Oc(e),this.lastRotAngle=Bc(e))});Ae(this,"onTouchMove",e=>{if(e.touches.length!==2)return;e.preventDefault(),this.isTwoFinger=!0;const t=Oc(e);if(this.lastPinchDist>0){const r=this.lastPinchDist/t;this.frustum=Fc(this.frustum*r,Uc,Nc),this.rebuildProjection()}this.lastPinchDist=t;const n=Bc(e);if(this.lastRotAngle!==0){const r=n-this.lastRotAngle;this.yaw+=r}this.lastRotAngle=n,this.applyTransform()});Ae(this,"onTouchEnd",e=>{e.touches.length<2&&(this.lastPinchDist=0,this.lastRotAngle=0,setTimeout(()=>{this.isTwoFinger=!1},100))});const e=window.innerWidth/window.innerHeight;this.cam=new es(-this.frustum*e,this.frustum*e,this.frustum,-this.frustum,.1,100),this.cx=be.origin.x+be.cols*be.cellSize/2,this.cz=be.origin.z+be.rows*be.cellSize/2,this.applyTransform()}get twoFingerActive(){return this.isTwoFinger}zoom(e){this.frustum=Fc(this.frustum+e*.01,Uc,Nc),this.rebuildProjection(),this.applyTransform()}resize(e){this.rebuildProjection(),e.setSize(window.innerWidth,window.innerHeight)}rebuildProjection(){const e=window.innerWidth/window.innerHeight;this.cam.left=-this.frustum*e,this.cam.right=this.frustum*e,this.cam.top=this.frustum,this.cam.bottom=-this.frustum,this.cam.updateProjectionMatrix()}applyTransform(){this.cam.position.set(this.cx+ga*Math.sin(this.yaw)*Math.cos(this.tilt),ga*Math.sin(this.tilt),this.cz+ga*Math.cos(this.yaw)*Math.cos(this.tilt)),this.cam.lookAt(this.cx,0,this.cz)}}function Fc(i,e,t){return Math.max(e,Math.min(t,i))}function Oc(i){const e=i.touches[0],t=i.touches[1],n=e.clientX-t.clientX,r=e.clientY-t.clientY;return Math.sqrt(n*n+r*r)}function Bc(i){const e=i.touches[0],t=i.touches[1];return Math.atan2(t.clientY-e.clientY,t.clientX-e.clientX)}function Ug(i){const e=be.origin.x+be.cols*be.cellSize/2,t=be.origin.z+be.rows*be.cellSize/2;i.fog=new ta(1714714,.022);const n=new tg(16772829,2241297,.7);i.add(n);const r=new gc(16774630,1.2);r.position.set(e+8,15,t-5),r.target.position.set(e,0,t),r.castShadow=!0,r.shadow.mapSize.width=2048,r.shadow.mapSize.height=2048,r.shadow.camera.near=.5,r.shadow.camera.far=50,r.shadow.camera.left=-15,r.shadow.camera.right=15,r.shadow.camera.top=15,r.shadow.camera.bottom=-15,r.shadow.bias=-.001,i.add(r),i.add(r.target);const s=new gc(8952268,.3);s.position.set(e-10,8,t+8),s.target.position.set(e,0,t),i.add(s),i.add(s.target);const o=new mc(5609983,2,8,1.5),a=be.spawnCell;o.position.set(be.origin.x+a[0]*be.cellSize+be.cellSize/2,1.5,be.origin.z+a[1]*be.cellSize+be.cellSize/2),i.add(o);const l=new mc(16733525,2,8,1.5),c=be.goalCell;l.position.set(be.origin.x+c[0]*be.cellSize+be.cellSize/2,1.5,be.origin.z+c[1]*be.cellSize+be.cellSize/2),i.add(l);const u=new rg(3359829,.15);i.add(u)}const Ng={arrow:9136404,arrow_rapid:11044146,arrow_pierce:7229967,cannon:5592405,ice:6737151,fire:16733440,lightning:16772608,poison:6750003,sniper:3355545},Fg={arrow:14527027,arrow_rapid:16763989,arrow_pierce:12290082,cannon:8947848,ice:11202303,fire:16746564,lightning:16777130,poison:11206519,sniper:6710988};class Og{constructor(e){Ae(this,"scene");Ae(this,"meshes",new Map);Ae(this,"sellingTowers",new Set);Ae(this,"rangeRing",null);Ae(this,"time",0);this.scene=e}sync(e){new Set(e.towers.map(t=>t.id));for(const t of e.towers)if(!this.meshes.has(t.id)){const n=this.createTowerMesh(t);n.scale.set(0,0,0),n.userData.buildProgress=0,this.scene.add(n),this.meshes.set(t.id,n)}}removeTower(e){const t=this.meshes.get(e);t&&(this.sellingTowers.add({group:t,timer:.25,maxTimer:.25}),this.meshes.delete(e))}animate(e,t){this.time+=e;for(const n of this.sellingTowers)if(n.timer-=e,n.timer<=0)this.scene.remove(n.group),this.sellingTowers.delete(n);else{const r=n.timer/n.maxTimer,s=r*r*r;n.group.scale.set(s,s,s),n.group.rotation.y+=e*10}for(const n of t.towers){const r=this.meshes.get(n.id);if(!r)continue;const s=r.userData;if(s.buildProgress<1){s.buildProgress=Math.min(1,s.buildProgress+e*3);const a=s.buildProgress,l=2*Math.PI/3,c=a===1?1:Math.pow(2,-10*a)*Math.sin((a*10-.75)*l)+1;r.scale.set(c,c,c)}if(n.cooldownRemaining>s.lastCooldown&&(s.attackTimer=.15),s.lastCooldown=n.cooldownRemaining,s.buildProgress>=1)if(s.attackTimer>0){s.attackTimer-=e;const l=1+Math.max(0,s.attackTimer/.15)*.15;s.turretGroup?s.turretGroup.scale.set(l,l,l):r.scale.set(l,l,l)}else s.turretGroup&&s.turretGroup.scale.set(1,1,1),r.scale.set(1,1,1);let o=null;if(n.targetId!==null&&n.targetId!==void 0){const a=t.enemies.find(l=>l.id===n.targetId);if(a){const l=a.worldX-n.worldX,c=a.worldZ-n.worldZ;(l!==0||c!==0)&&(o=Math.atan2(l,c))}}if(o===null&&n.aimAngle!==void 0&&(o=n.aimAngle),o!==null&&s.turretGroup){let a=o-s.turretGroup.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a)),s.turretGroup.rotation.y+=a*10*e}switch(n.type){case"ice":s.crystal&&(s.crystal.rotation.y+=e*.8);break;case"lightning":s.top&&(s.top.rotation.y+=e*2,s.top.position.y=.65+Math.sin(this.time*5)*.05);break;case"fire":if(s.cone1&&s.cone2){s.cone1.rotation.y+=e*1.5,s.cone2.rotation.y-=e*2;const a=1+Math.sin(this.time*8)*.05;s.cone1.scale.set(a,1,a)}break;case"poison":if(s.sphere){const a=1+Math.sin(this.time*3)*.1;s.sphere.scale.set(a,a,a)}break;case"sniper":s.scope&&(s.scope.position.y=1+Math.sin(this.time*2)*.02);break}}}showRange(e,t){if(!this.rangeRing){const n=new hs(.95,1,48),r=new Ft({color:16777215,transparent:!0,opacity:.2,side:Lt,depthWrite:!1});this.rangeRing=new xe(n,r),this.rangeRing.rotation.x=-Math.PI/2,this.scene.add(this.rangeRing)}this.rangeRing.scale.set(t,t,1),this.rangeRing.position.set(e.worldX,.02,e.worldZ),this.rangeRing.visible=!0}hideRange(){this.rangeRing&&(this.rangeRing.visible=!1)}createTowerMesh(e){const t=new Mn,n=wn(e.col,e.row);t.position.set(n.x,0,n.z);const r=Ng[e.type],s=Fg[e.type],o=1+e.level*.15,a=new Mn,l=new _t(.3*o,.38*o,.2,8),c=new Ye({color:r,roughness:.7}),u=new xe(l,c);u.position.y=.1,rt.enableShadows&&(u.castShadow=!0),a.add(u);const d=new _t(.32*o,.32*o,.05,8),p=new Ye({color:3355443,roughness:.9,metalness:.5}),f=new xe(d,p);f.position.y=.225,rt.enableShadows&&(f.castShadow=!0),a.add(f),t.add(a);const g=new Mn;t.add(g),t.userData.turretGroup=g;const _=t.add.bind(t);switch(t.add=(...m)=>g.add(...m),e.type){case"arrow":case"arrow_rapid":case"arrow_pierce":{const m=new _t(.12*o,.2*o,.5,6),h=new xe(m,new Ye({color:s}));h.position.y=.5,rt.enableShadows&&(h.castShadow=!0),t.add(h);const y=new Bt(.6*o,.04*o,.08*o),M=new xe(y,new Ye({color:6045747}));M.position.y=.75,M.position.z=.1,rt.enableShadows&&(M.castShadow=!0),t.add(M);const v=new _t(.015,.015,.4,4),R=new ln(.04,.1,4);let b=13421772;e.type==="arrow_rapid"&&(b=16777215),e.type==="arrow_pierce"&&(b=8947967);const A=new Ye({color:b}),L=new xe(v,A);L.rotation.x=Math.PI/2,L.position.set(0,.8,0);const E=new xe(R,A);if(E.rotation.x=Math.PI/2,E.position.set(0,.8,.25),t.add(L),t.add(E),e.type==="arrow_rapid"){const S=new xe(y,new Ye({color:4862503}));S.position.y=.65,S.position.z=.1,t.add(S)}else if(e.type==="arrow_pierce"){const S=new Bt(.25*o,.15*o,.5*o),P=new xe(S,new Ye({color:s}));P.position.y=.5,t.add(P)}break}case"cannon":{const m=new Qt(.25*o,12,12,0,Math.PI*2,0,Math.PI/2),h=new xe(m,new Ye({color:s,metalness:.6,roughness:.4}));h.position.y=.25,rt.enableShadows&&(h.castShadow=!0),t.add(h);const y=new _t(.08*o,.12*o,.6*o,8),M=new xe(y,new Ye({color:3355443,metalness:.8,roughness:.3}));M.position.set(0,.45,.25),M.rotation.x=Math.PI/4,rt.enableShadows&&(M.castShadow=!0),t.add(M);const v=new ki(.1*o,.03*o,6,12),R=new xe(v,new Ye({color:1118481,metalness:.9}));R.position.set(0,.65,.45),R.rotation.x=Math.PI/4,t.add(R);break}case"ice":{const m=new uc({color:s,transmission:.9,opacity:1,metalness:0,roughness:.1,ior:1.5,thickness:.5}),h=new us(.25*o),y=new xe(h,m);y.position.y=.7,rt.enableShadows&&(y.castShadow=!0);const M=new us(.12*o),v=new xe(M,new Ye({color:16777215,emissive:8965375}));y.add(v),t.add(y),t.userData.crystal=y;break}case"fire":{const m=[];for(let A=0;A<5;A++)m.push(new Q(.25*o+Math.sin(A*.5)*.05,A*.1));const h=new lr(m,8),y=new xe(h,new Ye({color:3346688,roughness:.9}));y.position.y=.25,rt.enableShadows&&(y.castShadow=!0),t.add(y);const M=new ln(.2*o,.6,6),v=new xe(M,new Ye({color:16724736,emissive:16720384,emissiveIntensity:.5,transparent:!0,opacity:.9}));v.position.y=.65,rt.enableShadows&&(v.castShadow=!0),t.add(v);const R=new ln(.1*o,.4,6),b=new xe(R,new Ye({color:16755200,emissive:16768256,emissiveIntensity:.8}));b.position.y=.6,t.add(b),t.userData.cone1=v,t.userData.cone2=b;break}case"lightning":{const m=new _t(.08*o,.15*o,.5*o,8),h=new xe(m,new Ye({color:2236979,metalness:.8}));h.position.y=.5,t.add(h);for(let R=0;R<3;R++){const b=new xe(new ki(.15*o,.02*o,4,12),new Ye({color:11184810,metalness:.9}));b.position.y=.4+R*.15,b.rotation.x=Math.PI/2,t.add(b)}const y=new cs(.2*o),M=new xe(y,new Ye({color:s,emissive:16772608,emissiveIntensity:.6,wireframe:!0}));M.position.y=.85,t.add(M);const v=new xe(new cs(.1*o),new Ye({color:16777215,emissive:16777215,emissiveIntensity:1}));M.add(v),t.userData.top=M;break}case"poison":{const m=[new Q(.15*o,0),new Q(.25*o,.2*o),new Q(.25*o,.4*o),new Q(.1*o,.6*o),new Q(.1*o,.8*o),new Q(.15*o,.85*o)],h=new lr(m,12),y=new uc({color:16777215,transmission:.8,opacity:1,roughness:.1,ior:1.5,side:Lt}),M=new xe(h,y);M.position.y=.25,t.add(M);const v=new _t(.2*o,.22*o,.4*o,12),R=new xe(v,new Ye({color:3394577,transparent:!0,opacity:.85,emissive:2271744,emissiveIntensity:.3}));R.position.y=.45,t.add(R),t.userData.sphere=R;break}case"sniper":{const m=new Mn;for(let A=0;A<3;A++){const L=new _t(.02*o,.02*o,.6*o,4),E=new xe(L,new Ye({color:5592405}));E.position.set(Math.cos(A*Math.PI*2/3)*.15,.3,Math.sin(A*Math.PI*2/3)*.15),E.rotation.x=-Math.sin(A*Math.PI*2/3)*.3,E.rotation.z=Math.cos(A*Math.PI*2/3)*.3,m.add(E)}m.position.y=.25,_(m);const h=new Bt(.1*o,.15*o,.4*o),y=new xe(h,new Ye({color:s,metalness:.7}));y.position.set(0,.7,0),t.add(y);const M=new _t(.03*o,.04*o,.8*o,6),v=new xe(M,new Ye({color:2236962}));v.rotation.x=Math.PI/2,v.position.set(0,.7,.4),t.add(v);const R=new _t(.04*o,.04*o,.3*o,8),b=new xe(R,new Ye({color:1118481}));b.rotation.x=Math.PI/2,b.position.set(.08*o,.8,.1),t.add(b),t.userData.scope=b;break}}t.add=_,t.userData.lastCooldown=e.cooldownRemaining,t.userData.attackTimer=0;for(let m=0;m<=e.level;m++){const h=new Qt(.04,4,4),y=new xe(h,new Ft({color:16777215}));y.position.set(-.15+m*.15,.32,.35),t.add(y)}return t}}function Bg(){const i={},e=rt.isMobile?Hi:Ye,t=new cr(.12,.2,4,8),n=new Qt(.14,8,8),r=new e({color:15632435,...rt.isMobile?{}:{roughness:.8}}),s=new e({color:16755285,...rt.isMobile?{}:{roughness:.6}});i.grunt=[{geo:t,mat:r,offset:new C(0,.2,0)},{geo:n,mat:s,offset:new C(0,.45,.05)}];const o=new Qt(.3,12,12,0,Math.PI*2,0,Math.PI/2),a=new e({color:10044620,...rt.isMobile?{}:{roughness:.9,metalness:.2}}),l=new e({color:7807658}),c=new Qt(.15,8,8);i.tank=[{geo:o,mat:a,offset:new C(0,.2,0),scale:new C(1,.6,1.2)},{geo:c,mat:l,offset:new C(0,.2,.35)}];const u=new ln(.15,.4,6),d=new e({color:3394645,...rt.isMobile?{}:{roughness:.5}});i.runner=[{geo:u,mat:d,offset:new C(0,.2,0),rotation:new gt(Math.PI/2,0,0)}];const p=new cr(.06,.15,4,6),f=new ri(.3,.15),g=new e({color:10053171}),_=new e({color:14540253,transparent:!0,opacity:.6,side:Lt});i.swarm=[{geo:p,mat:g,offset:new C(0,.3,0),rotation:new gt(Math.PI/2,0,0)},{geo:f,mat:_,offset:new C(0,.35,0),rotation:new gt(Math.PI/2,0,0)}];const m=new ca(.15),h=new ki(.25,.05,6,12),y=new e({color:1136076}),M=new e({color:3377407,transparent:!0,opacity:.7,emissive:1131656});i.shield=[{geo:m,mat:y,offset:new C(0,.3,0)},{geo:h,mat:M,offset:new C(0,.3,0),rotation:new gt(Math.PI/2,0,0)}];const v=new Bt(.1,.3,.1),R=new Bt(.3,.1,.1),b=new ki(.2,.03,6,12),A=new e({color:16742314}),L=new e({color:16777198,emissive:16755370});i.healer=[{geo:v,mat:A,offset:new C(0,.3,0)},{geo:R,mat:A,offset:new C(0,.3,0)},{geo:b,mat:L,offset:new C(0,.5,0),rotation:new gt(Math.PI/2,0,0)}];const E=new cr(.3,.5,6,12),S=new e({color:11145489,...rt.isMobile?{}:{metalness:.5,roughness:.6}}),P=new Bt(.3,.08,.1),k=new e({color:2236962,emissive:16755200,...rt.isMobile?{}:{emissiveIntensity:1}}),O=new ln(.08,.3,4),G=new e({color:15658734});return i.boss=[{geo:E,mat:S,offset:new C(0,.5,0)},{geo:P,mat:k,offset:new C(0,.65,.3)},{geo:O,mat:G,offset:new C(.15,.85,.15),rotation:new gt(Math.PI/4,0,-Math.PI/6)},{geo:O,mat:G,offset:new C(-.15,.85,.15),rotation:new gt(Math.PI/4,0,Math.PI/6)}],i}const zc=Bg(),zg=100,ms=.5;class kg{constructor(e){Ae(this,"scene");Ae(this,"instancedMeshGroups",new Map);Ae(this,"hpBars",[]);Ae(this,"shieldBars",[]);Ae(this,"hpBarBg",[]);Ae(this,"dummy",new ht);this.scene=e}getOrCreate(e){let t=this.instancedMeshGroups.get(e);if(!t){t=[];const n=zc[e];for(const r of n){const s=new na(r.geo,r.mat,zg);s.count=0,rt.enableShadows&&(s.castShadow=!0,s.receiveShadow=!0),this.scene.add(s),t.push(s)}this.instancedMeshGroups.set(e,t)}return t}sync(e,t,n){const r=new Map;for(const o of e.enemies){if(!o.alive||o.reached)continue;let a=r.get(o.type);a||(a=[],r.set(o.type,a)),a.push(o)}for(const o of this.hpBars)this.scene.remove(o);for(const o of this.shieldBars)this.scene.remove(o);for(const o of this.hpBarBg)this.scene.remove(o);this.hpBars=[],this.shieldBars=[],this.hpBarBg=[];const s=["grunt","tank","runner","swarm","shield","healer","boss"];for(const o of s){const a=this.getOrCreate(o),l=r.get(o)||[];for(const u of a)u.count=l.length;const c=zc[o];for(let u=0;u<l.length;u++){const d=l[u],p=d.worldX-d.prevWorldX,f=d.worldZ-d.prevWorldZ;let g=0;Math.abs(p)>.001||Math.abs(f)>.001?(g=Math.atan2(p,f),d.displayRot=g):d.displayRot!==void 0&&(g=d.displayRot);for(let R=0;R<c.length;R++){const b=c[R];if(this.dummy.position.set(d.worldX,0,d.worldZ),this.dummy.position.add(b.offset),this.dummy.rotation.set(0,g,0),b.rotation&&(this.dummy.rotation.x+=b.rotation.x,this.dummy.rotation.y+=b.rotation.y,this.dummy.rotation.z+=b.rotation.z),o==="swarm"&&R===1){const A=performance.now()*.001;this.dummy.rotation.z+=Math.sin(A*30+d.id)*.5}b.scale?this.dummy.scale.copy(b.scale):this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),a[R].setMatrixAt(u,this.dummy.matrix)}const _=(R,b,A,L)=>{const E=new ri(b,L),S=new Ft({color:A,side:Lt,depthWrite:!1}),P=new xe(E,S);return P.position.set(d.worldX-(ms-b)/2,R,d.worldZ),n?P.lookAt(n.position):P.rotation.x=-Math.PI/4,P},m=_(.9,ms,3355443,.06);m.position.set(d.worldX,.9,d.worldZ),n?m.lookAt(n.position):m.rotation.x=-Math.PI/4,this.scene.add(m),this.hpBarBg.push(m);const h=Math.max(0,d.hp/d.maxHp),y=ms*h,M=h>.5?4521796:h>.25?16755200:16724787,v=_(.9,y,M,.06);if(this.scene.add(v),this.hpBars.push(v),d.maxShield>0&&d.shield>0){const R=d.shield/d.maxShield,b=ms*R,A=_(.97,b,4491519,.04);this.scene.add(A),this.shieldBars.push(A)}}for(const u of a)u.instanceMatrix.needsUpdate=!0}}}const kc={arrow:16768324,cannon:16737843,ice:8969727,fire:16729088,lightning:16776960,poison:6750003,sniper:11184895},cn=rt.maxParticles;class Hg{constructor(e){Ae(this,"scene");Ae(this,"particles",[]);Ae(this,"particleGeo");Ae(this,"particlePositions");Ae(this,"particleColors");Ae(this,"particleSizes");Ae(this,"particleAlphas");Ae(this,"particlePoints");this.scene=e,this.particlePositions=new Float32Array(cn*3),this.particleColors=new Float32Array(cn*3),this.particleSizes=new Float32Array(cn),this.particleAlphas=new Float32Array(cn),this.particleGeo=new wt,this.particleGeo.setAttribute("position",new At(this.particlePositions,3)),this.particleGeo.setAttribute("aColor",new At(this.particleColors,3)),this.particleGeo.setAttribute("aSize",new At(this.particleSizes,1)),this.particleGeo.setAttribute("aAlpha",new At(this.particleAlphas,1));const t=new Rt({vertexShader:`
                attribute vec3 aColor;
                attribute float aSize;
                attribute float aAlpha;
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vColor = aColor;
                    vAlpha = aAlpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = max(5.0, aSize * (800.0 / -mvPosition.z));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,fragmentShader:`
                varying vec3 vColor;
                varying float vAlpha;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));
                    gl_FragColor = vec4(vColor * 1.5, alpha);
                }
            `,transparent:!0,blending:Er,depthWrite:!1});this.particlePoints=new km(this.particleGeo,t),this.particlePoints.frustumCulled=!1,e.add(this.particlePoints)}sync(e,t){for(const r of e.projectiles)r.alive&&(r.towerType==="fire"||Math.random()<.3)&&(r.towerType==="fire"||r.towerType==="poison"||r.towerType==="ice")&&this.addTrailParticle(r.x,r.y!==void 0?r.y:.8,r.z,kc[r.towerType]);let n=0;for(let r=this.particles.length-1;r>=0;r--){const s=this.particles[r];if(s.life-=t,s.life<=0){this.particles.splice(r,1);continue}s.position.add(s.velocity.clone().multiplyScalar(t)),s.velocity.y-=2.5*t,s.velocity.multiplyScalar(.97);const o=s.life/s.maxLife,a=n*3;this.particlePositions[a]=s.position.x,this.particlePositions[a+1]=Math.max(.05,s.position.y),this.particlePositions[a+2]=s.position.z,this.particleColors[a]=s.color.r,this.particleColors[a+1]=s.color.g,this.particleColors[a+2]=s.color.b,this.particleSizes[n]=s.size*o,this.particleAlphas[n]=o,n++}this.particleGeo.setDrawRange(0,n),this.particleGeo.attributes.position.needsUpdate=!0,this.particleGeo.attributes.aColor.needsUpdate=!0,this.particleGeo.attributes.aSize.needsUpdate=!0,this.particleGeo.attributes.aAlpha.needsUpdate=!0}addExplosion(e,t,n){const r=new we(kc[n]),s=12+Math.floor(Math.random()*8);for(let o=0;o<s&&this.particles.length<cn;o++){const a=Math.random()*Math.PI*2,l=1.5+Math.random()*3,c=1+Math.random()*2.5;this.particles.push({position:new C(e,.3,t),velocity:new C(Math.cos(a)*l,c,Math.sin(a)*l),life:.4+Math.random()*.3,maxLife:.7,color:r.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.15+Math.random()*.15})}}addDeathEffect(e,t,n){const r=new we(n),s=18+Math.floor(Math.random()*8);for(let o=0;o<s&&this.particles.length<cn;o++){const a=Math.random()*Math.PI*2,l=2+Math.random()*4,c=1.5+Math.random()*3;this.particles.push({position:new C(e,.4,t),velocity:new C(Math.cos(a)*l,c,Math.sin(a)*l),life:.5+Math.random()*.4,maxLife:.9,color:r.clone().offsetHSL(Math.random()*.15-.075,0,Math.random()*.3-.1),size:.18+Math.random()*.2})}for(let o=0;o<5&&this.particles.length<cn;o++)this.particles.push({position:new C(e,.5,t),velocity:new C((Math.random()-.5)*.5,2+Math.random(),(Math.random()-.5)*.5),life:.3,maxLife:.3,color:new we(16777215),size:.3+Math.random()*.2})}addTrailParticle(e,t,n,r){if(this.particles.length>=cn)return;const s=new we(r);this.particles.push({position:new C(e+(Math.random()-.5)*.1,t+(Math.random()-.5)*.1,n+(Math.random()-.5)*.1),velocity:new C(0,Math.random()*.5,0),life:.2+Math.random()*.2,maxLife:.4,color:s.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.1+Math.random()*.1})}addBuildEffect(e,t){const r=new we(4906624);for(let s=0;s<15&&!(this.particles.length>=cn);s++){const o=s/15*Math.PI*2,a=1+Math.random()*1.5;this.particles.push({position:new C(e,.2,t),velocity:new C(Math.cos(o)*a,.5+Math.random(),Math.sin(o)*a),life:.4+Math.random()*.2,maxLife:.6,color:r.clone().offsetHSL(0,0,Math.random()*.2),size:.15+Math.random()*.1})}}addSellEffect(e,t){const r=new we(16498468);for(let s=0;s<15&&!(this.particles.length>=cn);s++){const o=s/15*Math.PI*2,a=1.5+Math.random()*2;this.particles.push({position:new C(e,.5,t),velocity:new C(Math.cos(o)*a,1.5+Math.random()*2,Math.sin(o)*a),life:.3+Math.random()*.2,maxLife:.5,color:r.clone().offsetHSL(.05*Math.random(),0,Math.random()*.2),size:.15+Math.random()*.15})}}}class Gg{constructor(e){Ae(this,"scene");Ae(this,"projMeshes",new Map);this.scene=e}sync(e,t){const n=new Set;for(const r of e.projectiles){if(!r.alive)continue;n.add(r.id);let s=this.projMeshes.get(r.id);if(s||(s=this.createProjectileMesh(r.towerType),this.scene.add(s),this.projMeshes.set(r.id,s)),s.position.set(r.x,r.y!==void 0?r.y:.8,r.z),r.towerType!=="cannon"&&r.towerType!=="fire"&&r.towerType!=="poison"){const o=r.targetX-r.startX,a=r.targetZ-r.startZ,l=Math.min(1,r.progress+.05),c=r.startX+o*l,u=r.startZ+a*l;let p=r.startY+(r.targetY-r.startY)*l;r.arcHeight>0&&(p+=Math.sin(l*Math.PI)*r.arcHeight),l>r.progress&&s.lookAt(c,p,u)}else(r.towerType==="poison"||r.towerType==="cannon")&&(s.rotation.x+=t*5,s.rotation.z+=t*3)}for(const[r,s]of this.projMeshes.entries())n.has(r)||(this.scene.remove(s),this.projMeshes.delete(r))}createProjectileMesh(e){const t=new Mn;switch(e){case"arrow":{const n=new _t(.02,.02,.6,6);n.rotateX(Math.PI/2),n.rotateX(Math.PI/2);const r=new Hi({color:9132587}),s=new xe(n,r),o=new ln(.06,.2,4);o.rotateX(-Math.PI/2),o.translate(0,0,-.3);const a=new Ye({color:13421772,metalness:.8,roughness:.2}),l=new xe(o,a),c=new Bt(.15,.15,.1);c.translate(0,0,.3);const u=new Hi({color:14492194}),d=new xe(c,u);t.add(s,l,d);break}case"cannon":{const n=new Ye({color:2236962,roughness:.8,metalness:.4}),r=new Qt(.2,12,12),s=new xe(r,n);t.add(s);break}case"fire":{const n=new Ft({color:16755200}),r=new Qt(.15,8,8),s=new xe(r,n);t.add(s);const o=new Ft({color:16729088,transparent:!0,opacity:.6}),a=new Qt(.25,8,8),l=new xe(a,o);t.add(l);break}case"poison":{const n=new Ye({color:4521762,roughness:.2,transparent:!0,opacity:.8}),r=new Qt(.18,12,12),s=new xe(r,n);s.scale.set(1,.7,1),t.add(s);break}case"ice":{const n=new Ye({color:11197951,roughness:.1,transparent:!0,opacity:.8}),r=new ln(.1,.6,6);r.rotateX(-Math.PI/2);const s=new xe(r,n);t.add(s);break}case"sniper":{const n=new Ft({color:5605631}),r=new _t(.03,.03,1.2,6);r.rotateX(Math.PI/2);const s=new xe(r,n);t.add(s);break}case"lightning":{const n=new Ft({color:16777215}),r=new _t(.015,.015,.8,4);r.rotateX(Math.PI/2);const s=new xe(r,n);t.add(s);break}}return t.traverse(n=>{n instanceof xe&&(e==="arrow"||e==="cannon")&&(n.castShadow=!0)}),t}}const Hc={valid:4521796,invalid:16729156};class Vg{constructor(e){Ae(this,"raycaster",new og);Ae(this,"mouse",new Q);Ae(this,"groundPlane",new kn(new C(0,1,0),0));Ae(this,"ghostMesh",null);Ae(this,"rangeRing",null);Ae(this,"scene");Ae(this,"hoveredCol",-1);Ae(this,"hoveredRow",-1);this.scene=e}updateMouse(e,t){let n,r;if("touches"in e){if(e.touches.length===0)return;n=e.touches[0].clientX,r=e.touches[0].clientY}else n=e.clientX,r=e.clientY;this.mouse.x=n/window.innerWidth*2-1,this.mouse.y=-(r/window.innerHeight)*2+1,this.raycaster.setFromCamera(this.mouse,t);const s=new C;if(this.raycaster.ray.intersectPlane(this.groundPlane,s),s){const o=Math.floor((s.x-be.origin.x)/be.cellSize),a=Math.floor((s.z-be.origin.z)/be.cellSize);o>=0&&o<be.cols&&a>=0&&a<be.rows?(this.hoveredCol=o,this.hoveredRow=a):(this.hoveredCol=-1,this.hoveredRow=-1)}}showGhost(e,t,n,r,s){if(!this.ghostMesh){const a=new _t(.35,.4,.5,8),l=new Ft({transparent:!0,opacity:.4,depthWrite:!1});this.ghostMesh=new xe(a,l),this.scene.add(this.ghostMesh)}const o=wn(e,t);if(this.ghostMesh.position.set(o.x,.25,o.z),this.ghostMesh.visible=!0,this.ghostMesh.material.color.setHex(n?Hc.valid:Hc.invalid),s&&s>0){if(!this.rangeRing){const a=new hs(.95,1,48),l=new Ft({color:4521864,transparent:!0,opacity:.2,side:Lt,depthWrite:!1});this.rangeRing=new xe(a,l),this.rangeRing.rotation.x=-Math.PI/2,this.scene.add(this.rangeRing)}this.rangeRing.scale.set(s,s,1),this.rangeRing.position.set(o.x,.02,o.z),this.rangeRing.visible=!0,this.rangeRing.material.color.setHex(n?4521864:16737860)}else this.rangeRing&&(this.rangeRing.visible=!1)}hideGhost(){this.ghostMesh&&(this.ghostMesh.visible=!1),this.rangeRing&&(this.rangeRing.visible=!1)}}const Gc={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class mr{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Wg=new es(-1,1,1,-1,0,1);class Xg extends wt{constructor(){super(),this.setAttribute("position",new et([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new et([0,2,0,0,2,0],2))}}const qg=new Xg;class Vc{constructor(e){this._mesh=new xe(qg,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Wg)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Yg extends mr{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Rt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=jr.clone(e.uniforms),this.material=new Rt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new Vc(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Wc extends mr{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const r=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),s.buffers.stencil.setFunc(r.ALWAYS,o,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(r.EQUAL,1,4294967295),s.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),s.buffers.stencil.setLocked(!0)}}class $g extends mr{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Zg{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new Q);this._width=n.width,this._height=n.height,t=new $t(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:pn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Yg(Gc),this.copyPass.material.blending=dn,this.clock=new sg}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let r=0,s=this.passes.length;r<s;r++){const o=this.passes[r];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Wc!==void 0&&(o instanceof Wc?n=!0:o instanceof $g&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new Q);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class Kg extends mr{constructor(e,t,n=null,r=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new we}render(e,t,n){const r=e.autoClear;e.autoClear=!1;let s,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=r}}const jg={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new we(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class Gi extends mr{constructor(e,t,n,r){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=r,this.resolution=e!==void 0?new Q(e.x,e.y):new Q(256,256),this.clearColor=new we(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new $t(s,o,{type:pn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let d=0;d<this.nMips;d++){const p=new $t(s,o,{type:pn});p.texture.name="UnrealBloomPass.h"+d,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);const f=new $t(s,o,{type:pn});f.texture.name="UnrealBloomPass.v"+d,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),s=Math.round(s/2),o=Math.round(o/2)}const a=jg;this.highPassUniforms=jr.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Rt({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let d=0;d<this.nMips;d++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[d])),this.separableBlurMaterials[d].uniforms.invSize.value=new Q(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const u=Gc;this.copyUniforms=jr.clone(u.uniforms),this.blendMaterial=new Rt({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:Er,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new we,this.oldClearAlpha=1,this.basic=new Ft,this.fsQuad=new Vc(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,r),this.renderTargetsVertical[s].setSize(n,r),this.separableBlurMaterials[s].uniforms.invSize.value=new Q(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,t,n,r,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=Gi.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Gi.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=o}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Rt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new Q(.5,.5)},direction:{value:new Q(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new Rt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}Gi.BlurDirectionX=new Q(1,0),Gi.BlurDirectionY=new Q(0,1);class Jg{constructor(e,t,n){Ae(this,"composer");Ae(this,"bloomPass");this.composer=new Zg(e);const r=new Kg(t,n);this.composer.addPass(r),this.bloomPass=new Gi(new Q(window.innerWidth,window.innerHeight),.55,.4,.85),this.composer.addPass(this.bloomPass)}render(){this.composer.render()}resize(e,t){this.composer.setSize(e,t)}}class Qg{constructor(){Ae(this,"ctx",null);Ae(this,"enabled",!0)}init(){this.ctx||(this.ctx=new(window.AudioContext||window.webkitAudioContext)),this.ctx.state==="suspended"&&this.ctx.resume()}toggle(){return this.enabled=!this.enabled,this.enabled}playTone(e,t,n,r){if(!this.enabled||!this.ctx)return;const s=this.ctx.createOscillator(),o=this.ctx.createGain();s.type=t,s.frequency.setValueAtTime(e,this.ctx.currentTime),s.connect(o),o.connect(this.ctx.destination),o.gain.setValueAtTime(r,this.ctx.currentTime),o.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+n),s.start(),s.stop(this.ctx.currentTime+n)}playShoot(){this.playTone(400,"square",.1,.05)}playHit(){this.playTone(150,"sawtooth",.15,.05)}playBuild(){this.playTone(600,"sine",.2,.1),setTimeout(()=>this.playTone(800,"sine",.2,.1),100)}playSell(){this.playTone(500,"triangle",.2,.1),setTimeout(()=>this.playTone(300,"triangle",.3,.1),100)}playError(){this.playTone(100,"sawtooth",.2,.1)}}const gr=new Qg;let Y,en=null,xt=null,vr="normal";const Vn=document.getElementById("game-canvas"),En=new Nm({canvas:Vn,antialias:!0,powerPreference:"high-performance"});En.setPixelRatio(rt.pixelRatio),En.setSize(window.innerWidth,window.innerHeight),rt.enableShadows&&(En.shadowMap.enabled=!0,En.shadowMap.type=ws),En.toneMapping=Ia,En.toneMappingExposure=1.1;const bn=new Rg,Wn=new Dg,Vi=Wn.cam;Ug(bn.scene),bn.buildGround();const Tn=new Og(bn.scene),e0=new kg(bn.scene),va=new Hg(bn.scene),t0=new Gg(bn.scene),Et=new Vg(bn.scene);let _r=null;rt.enablePostProcessing&&(_r=new Jg(En,bn.scene,Vi)),Y=pa(vr),St.on("streakBonus",i=>x0(i.streak)),St.on("milestone",i=>S0(i.wave)),St.on("towerBuilt",i=>{const e=wn(i.col,i.row);va.addBuildEffect(e.x,e.z),Tn.sync(Y),Xn()}),St.on("towerUpgraded",i=>{Tn.removeTower(i.towerId),Tn.sync(Y),Xn(),xt&&xt.id===i.towerId&&Qc(xt)}),St.on("towerSold",i=>{va.addSellEffect(i.worldX,i.worldZ),Y.floatingTexts.push({id:Y.nextId++,worldX:i.worldX,worldZ:i.worldZ,value:`+${i.refund}g`,color:"#ffd700",life:1.5,maxLife:1.5}),Tn.removeTower(i.towerId),Tn.sync(Y),Xn(),xt&&xt.id===i.towerId&&qi()});const n0=document.getElementById("gold-val"),i0=document.getElementById("lives-val"),r0=document.getElementById("wave-val"),s0=document.getElementById("kills-val"),_a=document.getElementById("skip-prep-btn"),xa=document.getElementById("pause-btn"),Xc=document.getElementById("speed-btn"),Sa=document.getElementById("sound-btn"),qc=document.getElementById("enemy-panel"),o0=document.getElementById("enemy-name"),a0=document.getElementById("enemy-hp"),l0=document.getElementById("enemy-spd"),c0=document.getElementById("enemy-armor"),ya=document.getElementById("wave-banner"),Yc=document.getElementById("wave-banner-text"),$c=document.getElementById("milestone-banner"),gs=document.getElementById("milestone-banner-text");St.on("towerBuilt",()=>gr.playBuild()),St.on("towerSold",()=>gr.playSell()),St.on("enemyKilled",()=>gr.playHit());const Zc=document.getElementById("floating-text-layer"),u0=document.getElementById("help-btn"),Wi=document.getElementById("help-overlay"),h0=document.getElementById("help-close-btn"),d0=document.getElementById("start-screen"),Ma=document.getElementById("end-screen"),Kc=document.getElementById("end-title"),f0=document.getElementById("end-score"),jc=document.getElementById("end-rank"),Jc=document.getElementById("tower-panel"),xr=document.getElementById("cancel-build-btn"),Xi=document.querySelectorAll(".build-btn[data-tower]"),vs=document.getElementById("streak-banner"),An=document.getElementById("tower-tooltip"),p0=An.querySelector(".tooltip-name"),m0=An.querySelector(".tooltip-type"),g0=An.querySelector(".tooltip-stats"),v0=An.querySelector(".tooltip-special"),wa=Hn.waves.length,_0={grunt:"🧟",tank:"🐢",runner:"💨",swarm:"🐝",shield:"🛡",healer:"💚",boss:"💀"};function Xn(){n0.textContent=String(Y.gold),i0.textContent=String(Y.lives),r0.textContent=`${Math.min(Y.currentWave+1,wa)}/${wa}`,s0.textContent=String(Y.totalKills),_a.classList.toggle("hidden",Y.phase!=="prep"),Xi.forEach(e=>{const t=e.getAttribute("data-tower"),n=Vt[t].levels[0].buildCost,r=Y.gold>=n;e.classList.toggle("disabled",!r)});let i=null;if(Et.hoveredCol>=0&&Y.phase==="wave"){const e=wn(Et.hoveredCol,Et.hoveredRow);let t=1;for(const n of Y.enemies){if(!n.alive)continue;const r=n.worldX-e.x,s=n.worldZ-e.z,o=r*r+s*s;o<t&&(t=o,i=n)}}if(i){const e=dr[i.type];o0.textContent=e.name,a0.textContent=`${Math.ceil(i.hp)}/${e.hp}`,l0.textContent=e.speed.toFixed(1),c0.textContent=String(e.armor),qc.classList.remove("hidden")}else qc.classList.add("hidden")}let Ea=null;function _s(i){Yc.textContent=i,ya.classList.remove("hidden"),Ea&&clearTimeout(Ea),Ea=window.setTimeout(()=>{ya.classList.add("hidden")},2e3)}let ba=null;function x0(i){const e=i>=10;vs.textContent=e?`⚡ x${i} MEGA COMBO!`:`🔥 x${i} Kill Streak!`,vs.className=e?"streak-mega":"streak-normal",vs.classList.remove("hidden"),ba&&clearTimeout(ba),ba=window.setTimeout(()=>{vs.classList.add("hidden")},1800)}let Ta=null;function S0(i){gs.textContent=`🏆 Milestone Wave ${i}! +500g!`,$c.classList.remove("hidden"),gs.style.animation="none",gs.offsetWidth,gs.style.animation="",Ta&&clearTimeout(Ta),Ta=window.setTimeout(()=>{$c.classList.add("hidden")},3500)}function y0(i,e){const t=new C(i,.6,e);return t.project(Vi),{x:(t.x*.5+.5)*window.innerWidth,y:(-t.y*.5+.5)*window.innerHeight}}const Sr=new Map;function M0(i){for(let e=Y.floatingTexts.length-1;e>=0;e--){const t=Y.floatingTexts[e];if(t.life-=i,t.life<=0){const s=Sr.get(t.id);s&&(Zc.removeChild(s),Sr.delete(t.id)),Y.floatingTexts.splice(e,1);continue}if(!Sr.has(t.id)){const s=document.createElement("div");s.className="floating-text",s.textContent=t.value,s.style.color=t.color,s.style.animationDuration=`${t.maxLife}s`,Zc.appendChild(s),Sr.set(t.id,s)}const n=Sr.get(t.id),r=y0(t.worldX,t.worldZ);n.style.left=`${r.x}px`,n.style.top=`${r.y}px`}}function Qc(i){xt=i;const e=Vt[i.type],t=e.levels[i.level];document.getElementById("panel-tower-name").textContent=e.name,document.getElementById("panel-tower-level").textContent=`Lv.${i.level+1}`,document.getElementById("panel-dmg").textContent=String(t.damage),document.getElementById("panel-spd").textContent=`${t.cooldownSec}s`,document.getElementById("panel-rng").textContent=String(t.range);const n=document.getElementById("panel-special"),r=[];t.aoeRadius>0&&r.push(`AOE ${t.aoeRadius}`),t.slow&&r.push(`Slow ${Math.round(t.slow.pct*100)}%`),t.dot&&r.push(`DOT ${t.dot.dps}/s ${t.dot.durationSec}s`),t.chain&&r.push(`Chain ×${t.chain.targets}`),n.textContent=r.length>0?r.join(" | "):"—",document.querySelectorAll(".target-btn").forEach(c=>{const u=c.getAttribute("data-mode");c.classList.toggle("active",i.targetingMode===u),c.onclick=()=>{i.targetingMode=u,document.querySelectorAll(".target-btn").forEach(d=>d.classList.toggle("active",d.getAttribute("data-mode")===u))}});const s=document.getElementById("upgrade-btn"),o=document.getElementById("evolve-container"),a=document.getElementById("sell-btn"),l=e.levels;if(o.classList.add("hidden"),o.innerHTML="",s.style.display="block",i.level>=l.length-1)if(e.evolutions&&e.evolutions.length>0){s.style.display="none",o.classList.remove("hidden");for(const c of e.evolutions){const u=document.createElement("button");u.className="action-btn evolve",u.innerHTML=`⭐ ${c.name} (<span class="evolve-cost">${c.cost}</span>g)<div style="font-size: 0.8em; margin-top: 2px;">${c.desc}</div>`,u.disabled=Y.gold<c.cost,u.onclick=()=>{xt&&Ag(Y,xt.id,c.type)},o.appendChild(u)}}else s.disabled=!0,s.textContent="⬆ MAX";else{const c=l[i.level+1].upgradeCost;s.disabled=!Tg(Y,i),s.innerHTML=`⬆ Upgrade (<span id="upgrade-cost">${c}</span>g)`}document.getElementById("sell-value").textContent=String(Rc(i)),a.innerHTML=`💰 Sell (<span id="sell-value">${Rc(i)}</span>g)`,Jc.classList.remove("hidden"),Tn.showRange(i,t.range)}function qi(){xt=null,Jc.classList.add("hidden"),Tn.hideRange()}function eu(){const i=Y.phase==="won";Kc.textContent=i?"🎉 Victory!":"💀 Defeat",Kc.style.color=i?"#ffd700":"#ff5555",f0.textContent=`Score: ${Y.score}`;let e="C";for(const t of dg.ranks)if(Y.score>=t.min){e=t.name;break}jc.textContent=e,jc.className=`rank rank-${e}`,document.getElementById("stat-kills").textContent=Y.totalKills.toString(),document.getElementById("stat-streak").textContent=Y.stats.longestStreak.toString(),document.getElementById("stat-perfect").textContent=Y.perfectWaves.toString(),document.getElementById("stat-built").textContent=Y.stats.towersBuilt.toString(),document.getElementById("stat-gold").textContent=Y.stats.goldEarned.toString(),document.getElementById("stat-dmg").textContent=Math.round(Y.stats.totalDamageDealt).toString(),Ma.classList.remove("hidden")}Xi.forEach(i=>{i.addEventListener("click",e=>{e.stopPropagation();const t=i.getAttribute("data-tower");Y.gold<Vt[t].levels[0].buildCost||(en===t?(en=null,i.classList.remove("selected"),xr.style.display="none",Et.hideGhost()):(Xi.forEach(n=>n.classList.remove("selected")),en=t,i.classList.add("selected"),xr.style.display="",qi()))}),i.addEventListener("mouseenter",()=>{const e=i.getAttribute("data-tower");if(!e||!Vt[e])return;const t=Vt[e],n=t.levels[0];p0.textContent=t.name+" Tower",m0.textContent="Type: "+t.damageType,g0.innerHTML=`
            <div><span>Damage:</span> <span>${n.damage}</span></div>
            <div><span>Speed:</span> <span>${n.cooldownSec}s</span></div>
            <div><span>Range:</span> <span>${n.range}</span></div>
            <div><span>DPS:</span> <span>${(n.damage/n.cooldownSec).toFixed(1)}</span></div>
        `;let r="";n.slow?r=`Slows by ${Math.round(n.slow.pct*100)}% for ${n.slow.durationSec}s`:n.dot?r=`DOT: ${n.dot.dps} dmg/s (${n.dot.durationSec}s)`:n.chain?r=`Chains to ${n.chain.targets} targets`:n.aoeRadius>0&&(r=`AOE Radius: ${n.aoeRadius}`),v0.textContent=r;const s=i.getBoundingClientRect();An.style.left=`${s.left+s.width/2}px`,An.style.transform="translate(-50%, calc(-100% - 10px))",An.style.top=`${s.top}px`,An.classList.remove("hidden")}),i.addEventListener("mouseleave",()=>{An.classList.add("hidden")})}),xr.addEventListener("click",i=>{i.stopPropagation(),en=null,Xi.forEach(e=>e.classList.remove("selected")),xr.style.display="none",Et.hideGhost()}),Xc.addEventListener("click",()=>{Y.speedMultiplier=Y.speedMultiplier===1?2:Y.speedMultiplier===2?4:1,Xc.textContent=Y.speedMultiplier+"×"}),Sa.addEventListener("click",()=>{gr.init();const i=gr.toggle();Sa.textContent=i?"🔊":"🔇",Sa.style.opacity=i?"1":"0.5"}),xa.addEventListener("click",tu);function tu(){Y.paused=!Y.paused,xa.textContent=Y.paused?"▶":"⏸",xa.classList.toggle("active",Y.paused)}window.addEventListener("keydown",i=>{if(Y.phase==="idle"||Y.phase==="won"||Y.phase==="lost")return;const e=i.key.toLowerCase();if(e==="p"){(Y.phase==="wave"||Y.phase==="prep")&&tu();return}if(Wi.classList.contains("hidden")){if(e>="1"&&e<="7"){const t=Number(e)-1;t>=0&&t<Xi.length&&Xi[t].click()}e==="u"&&xt&&document.getElementById("upgrade-btn").click(),e==="s"&&xt&&document.getElementById("sell-btn").click(),e==="q"&&xs(0),e==="w"&&xs(1),e==="e"&&xs(2),i.key==="Escape"&&(en?xr.click():xt&&document.getElementById("panel-close-btn").click())}});const nu=document.querySelectorAll(".skill-btn");nu.forEach(i=>{i.addEventListener("click",()=>{const e=parseInt(i.getAttribute("data-skill")||"0",10);xs(e)})});function xs(i){if(Y.phase!=="wave"&&Y.phase!=="prep")return;const e=Y.skills[i];if(!(!e||e.remaining>0)){if(i===0)for(const t of Y.enemies)t.alive&&(t.hp-=200,t.hp<=0?ma(Y,t):Y.floatingTexts.push({id:Y.nextId++,worldX:t.worldX,worldZ:t.worldZ,value:"-200",color:"#ff4444",life:1,maxLife:1}));else if(i===1)for(const t of Y.enemies)t.alive&&(t.slow={pct:1,remaining:5});else i===2&&(Y.lives=Math.min(Y.maxLives,Y.lives+5),Xn());e.remaining=e.cooldown,Aa()}}function Aa(){nu.forEach(i=>{const e=parseInt(i.getAttribute("data-skill")||"0",10),t=Y.skills[e],n=i.querySelector(".skill-cd");t&&t.remaining>0?(i.classList.add("on-cooldown"),n.classList.remove("hidden"),n.textContent=Math.ceil(t.remaining)+"s"):(i.classList.remove("on-cooldown"),n.classList.add("hidden"))})}_a.addEventListener("click",()=>{Y.phase==="prep"&&(Y.gold+=50,Y.prepTimer=0,_a.classList.add("hidden"),Xn())}),document.getElementById("upgrade-btn").addEventListener("click",()=>{xt&&Eg(Y,xt.id)}),document.getElementById("sell-btn").addEventListener("click",()=>{xt&&bg(Y,xt.id)}),document.getElementById("panel-close-btn").addEventListener("click",()=>{qi()}),document.getElementById("start-btn").addEventListener("click",()=>{d0.classList.add("hidden"),fs(Y),_s("Wave 1")});const iu=document.querySelectorAll(".diff-btn"),w0=document.getElementById("diff-desc"),E0={easy:"Easy difficulty — 600g, 30 lives, 25% weaker enemies",normal:"Standard difficulty — 400g, 20 lives",hard:"Hard difficulty — 250g, 10 lives, 40% tougher enemies & slightly faster"};iu.forEach(i=>{i.addEventListener("click",()=>{iu.forEach(e=>e.classList.remove("active")),i.classList.add("active"),vr=i.getAttribute("data-diff"),w0.textContent=E0[vr],Y=pa(vr),Xn()})}),u0.addEventListener("click",()=>{Wi.classList.remove("hidden")}),h0.addEventListener("click",()=>{Wi.classList.add("hidden")}),Wi.addEventListener("click",i=>{i.target===Wi&&Wi.classList.add("hidden")}),document.getElementById("restart-btn").addEventListener("click",()=>{Ma.classList.add("hidden"),Y=pa(vr),Tn.sync(Y),Xn(),Aa(),qi(),fs(Y),_s("Wave 1")}),document.getElementById("home-btn").addEventListener("click",()=>{window.location.href="../../../index.html"}),Vn.addEventListener("click",()=>{if(Wn.twoFingerActive||Y.phase==="idle"||Y.phase==="won"||Y.phase==="lost")return;const i=Et.hoveredCol,e=Et.hoveredRow;if(!(i<0||e<0))if(en)wg(Y,en,i,e);else{const t=Y.towers.find(n=>n.col===i&&n.row===e);t?Qc(t):qi()}}),Vn.addEventListener("mousemove",i=>{Et.updateMouse(i,Vi),ru()}),Vn.addEventListener("touchmove",i=>{i.touches.length===1&&!Wn.twoFingerActive&&(Et.updateMouse(i,Vi),ru())},{passive:!0});function ru(){if(!en||Et.hoveredCol<0){Et.hideGhost();return}const i=Cc(Y,Et.hoveredCol,Et.hoveredRow)&&Y.gold>=Vt[en].levels[0].buildCost,e=Vt[en].levels[0].range;Et.showGhost(Et.hoveredCol,Et.hoveredRow,i,en,e)}Vn.addEventListener("wheel",i=>{i.preventDefault(),Wn.zoom(i.deltaY)},{passive:!1}),Vn.addEventListener("touchstart",Wn.onTouchStart,{passive:!0}),Vn.addEventListener("touchmove",Wn.onTouchMove,{passive:!1}),Vn.addEventListener("touchend",Wn.onTouchEnd,{passive:!0}),window.addEventListener("resize",()=>{Wn.resize(En),_r&&_r.resize(window.innerWidth,window.innerHeight)});let su=0,yr=0,ou=-1,au=new Set;function Ss(){_r?_r.render():En.render(bn.scene,Vi)}function lu(i){var r,s;requestAnimationFrame(lu);const e=Math.min((i-su)/1e3,.1);if(su=i,Y.phase==="idle"){Ss();return}if(Y.phase==="won"||Y.phase==="lost"){Ma.classList.contains("hidden")&&eu(),Ss();return}if(Y.paused){Ss();return}const t=e*Y.speedMultiplier;yr+=t;const n=5;for(yr>Gn*n&&(yr=Gn*n);yr>=Gn;){new Set(Y.projectiles.map(a=>a.id)),wc(Y,Gn),bc(Y,Gn),Tc(Y,Gn),Ac(Y,Gn);for(const a of au)Y.projectiles.find(l=>l.id===a);au=new Set(Y.projectiles.map(a=>a.id)),yr-=Gn;const o=Y.phase;if(o==="won"||o==="lost"){eu();break}}if(Y.phase==="prep"&&(Y.prepTimer-=t,Y.prepTimer<=0&&(fs(Y),_s(`Wave ${Y.currentWave+1}`))),Y.phase==="wave"){wc(Y,t),bc(Y,t),Tc(Y,t),Ac(Y,t);for(const o of Y.skills)o.remaining>0&&(o.remaining=Math.max(0,o.remaining-t));Aa()}if(Y.currentWave!==ou&&Y.phase==="wave"&&(ou=Y.currentWave,_s(`Wave ${Y.currentWave+1}`)),Y.phase==="prep"){const o=Math.ceil(Y.prepTimer),a=Math.min(Y.currentWave+1,wa-1),l=Hn.waves[a],c=((r=l==null?void 0:l.groups)==null?void 0:r.reduce((d,p)=>d+p.count,0))??"?",u=((s=l==null?void 0:l.groups)==null?void 0:s.map(d=>`${_0[d.type]??"?"}×${d.count}`).join(" "))??"";Yc.textContent=`Wave ${a+1} — ${c} enemies | ${u} | Next in ${o}s`,ya.classList.remove("hidden")}Tn.animate(e,Y),e0.sync(Y,0,Vi),va.sync(Y,t),t0.sync(Y,t),M0(e),Xn(),xt&&(Y.towers.find(a=>a.id===xt.id)||qi()),Ss()}requestAnimationFrame(lu)})();
