var rx=Object.defineProperty;var sx=(On,tn,Ei)=>tn in On?rx(On,tn,{enumerable:!0,configurable:!0,writable:!0,value:Ei}):On[tn]=Ei;var fe=(On,tn,Ei)=>sx(On,typeof tn!="symbol"?tn+"":tn,Ei);(function(){"use strict";var On=document.createElement("style");On.textContent=`@import"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Oxanium:wght@500;600;700;800&display=swap";*{margin:0;padding:0;box-sizing:border-box}:root{--bg-deep: rgba(7, 15, 11, .82);--glass: rgba(14, 28, 21, .72);--glass-strong: rgba(10, 22, 17, .88);--panel-stroke: rgba(198, 237, 198, .12);--panel-highlight: rgba(255, 255, 255, .06);--text-main: #eff7ef;--text-muted: rgba(233, 244, 233, .68);--gold: #f6d67b;--danger: #ff8570;--info: #8fd7ff;--energy: #d0a4ff;--action: #71d9ff;--action-strong: #0e91d0;--shadow-lg: 0 20px 48px rgba(0, 0, 0, .35)}html,body{width:100%;height:100%;overflow:hidden;font-family:Inter,sans-serif;background:radial-gradient(circle at top,rgba(48,112,74,.28),transparent 38%),radial-gradient(circle at bottom,rgba(22,44,31,.22),transparent 42%),#08110c;color:var(--text-main);user-select:none;-webkit-user-select:none}#game-canvas{position:fixed;top:0;left:0;width:100%;height:100%;display:block}#hud{position:fixed;top:14px;left:12px;right:12px;display:flex;gap:10px;align-items:center;pointer-events:none;z-index:10;flex-wrap:wrap}#hud>div,#hud>button{pointer-events:auto;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),var(--glass);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--panel-stroke);border-radius:14px;box-shadow:inset 0 1px 0 var(--panel-highlight),0 12px 28px #0003;padding:9px 14px;font-size:14px;font-weight:600;color:var(--text-main);white-space:nowrap}#hud-gold{color:var(--gold)}#hud-lives{color:var(--danger)}#hud-wave{color:var(--info);display:flex;flex-direction:column;gap:5px;min-width:158px;padding:7px 12px 8px!important}#hud-wave .wave-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px}#hud-wave .wave-label{color:var(--info);font-weight:700;letter-spacing:.02em}#hud-wave .wave-remain{font-family:Oxanium,sans-serif;font-size:11px;font-weight:700;color:#e8f5f7ad;letter-spacing:.06em}#hud-wave .wave-progress-track{position:relative;width:100%;height:5px;border-radius:999px;overflow:hidden;background:#8fd7ff1f;box-shadow:inset 0 0 0 1px #8fd7ff1f}#hud-wave .wave-progress-fill{position:absolute;top:0;right:0;bottom:0;left:0;width:0%;background:linear-gradient(90deg,#8fd7ff,#7ef5c3);border-radius:inherit;box-shadow:0 0 10px #8fd7ff8c;transition:width .25s ease-out}#hud-wave.prep .wave-progress-fill{background:linear-gradient(90deg,#f7d36e,#ff9a4d);box-shadow:0 0 10px #f7c46b8c}#hud-kills{color:var(--energy)}#skip-prep-btn{pointer-events:auto;background:linear-gradient(135deg,#f5c45947,#bd791633);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,208,105,.34);border-radius:12px;padding:8px 14px;font-size:14px;font-weight:700;color:var(--gold);cursor:pointer;transition:all .2s}#skip-prep-btn:hover{background:#ffc80059}#pause-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#pause-btn:hover{background:#ffffff26}#pause-btn.active{background:#ffb40040;border-color:#fc4;color:#fc4}#speed-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 16px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#speed-btn:hover{background:#ffffff26}#speed-btn.active{background:#64c8ff4d;border-color:#8cf;color:#8cf}#wave-banner{position:fixed;top:88px;left:50%;transform:translate(-50%,-50%);z-index:20;pointer-events:none;width:min(720px,calc(100vw - 40px));text-align:center}#wave-banner-text{display:inline-block;font-family:Oxanium,sans-serif;font-size:28px;font-weight:800;color:#f7fbf7;letter-spacing:.02em;text-shadow:0 0 18px rgba(111,207,255,.22);padding:12px 22px;border-radius:18px;border:1px solid rgba(190,239,199,.14);background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#0a1611bd;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:var(--shadow-lg);animation:bannerPulse .6s ease-out}@keyframes bannerPulse{0%{transform:scale(.5);opacity:0}50%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}#build-menu{position:fixed;bottom:16px;left:50%;transform:translate(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;z-index:10;padding:12px 16px 14px;background:radial-gradient(circle at top,rgba(92,169,126,.14),transparent 42%),linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),var(--glass-strong);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--panel-stroke);border-radius:20px;box-shadow:var(--shadow-lg);max-width:95vw}#skill-bar{position:fixed;left:18px;bottom:22px;z-index:12;display:flex;gap:10px;padding:10px 12px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130fd1;border:1px solid var(--panel-stroke);box-shadow:var(--shadow-lg);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.skill-btn{position:relative;width:56px;height:56px;display:grid;place-items:center;border-radius:16px;border:1px solid rgba(177,225,191,.12);background:linear-gradient(180deg,rgba(255,255,255,.06),transparent 58%),#ffffff0d;color:var(--text-main);cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}.skill-btn:hover{transform:translateY(-2px);border-color:#6fd9ff5c;background:#ffffff1c}.skill-emoji{font-size:24px}.skill-key,.skill-cd{position:absolute;font-family:Oxanium,sans-serif;font-size:11px;font-weight:700;border-radius:999px;padding:2px 6px}.skill-key{bottom:6px;right:6px;background:#0f91d03d;color:#d8f6ff}.skill-cd{top:6px;left:6px;background:#ff8c7038;color:#ffd8d1}.skill-btn.on-cooldown{opacity:.72}.build-title{font-family:Oxanium,sans-serif;font-size:12px;font-weight:700;color:#e1f3e38f;letter-spacing:3px;text-transform:uppercase}.build-subtitle{font-size:11px;color:var(--text-muted);margin-top:-2px}.build-grid{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.build-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 60%),#ffffff12;border:1px solid rgba(214,245,219,.12);border-radius:12px;color:var(--text-main);cursor:pointer;transition:all .2s;min-width:60px;position:relative;box-shadow:inset 0 1px #ffffff0a}.build-key{position:absolute;top:-6px;left:-6px;background:#3b82f6;color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:4px;box-shadow:0 2px 4px #00000080;border:1px solid #60a5fa;pointer-events:none}.build-btn:hover{background:#ffffff29;border-color:#97dfba4d;transform:translateY(-2px)}.build-btn.selected{background:#64c8ff2e;border-color:#77d6ff8c;box-shadow:0 0 18px #64c8ff38}.build-btn.disabled{opacity:.35;cursor:not-allowed}.build-icon{font-size:20px}.build-name{font-size:10px;font-weight:600}.build-cost{font-size:9px;color:gold;font-weight:600}.cancel-btn{background:#ff3c3c26;border-color:#ff3c3c4d}.cancel-btn:hover{background:#ff3c3c4d}#tower-panel{position:fixed;right:16px;bottom:130px;width:246px;background:radial-gradient(circle at top,rgba(103,177,133,.16),transparent 44%),linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130fdb;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-stroke);border-radius:18px;box-shadow:var(--shadow-lg);padding:16px;z-index:15}.panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.panel-header span{font-weight:700;font-size:15px}#panel-tower-level{color:#8cf;font-size:13px}#panel-close-btn{background:none;border:none;color:#ffffff80;font-size:16px;cursor:pointer;padding:2px 6px}#panel-close-btn:hover{color:#fff}.panel-stats{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:13px;color:#ffffffbf;margin-bottom:12px}#panel-special-row{grid-column:1 / -1}.panel-targeting{margin-bottom:10px}.targeting-label{font-size:11px;color:#ffffff80;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}.targeting-btns{display:flex;gap:4px}.target-btn{flex:1;padding:5px 2px;border:1px solid rgba(255,255,255,.15);border-radius:6px;background:#ffffff0d;color:#fff9;font-size:11px;cursor:pointer;transition:all .15s}.target-btn:hover{background:#ffffff1f;color:#fff}.target-btn.active{background:#64c8ff40;border-color:#8cf;color:#8cf;font-weight:700}.panel-actions{display:flex;gap:8px}.action-btn{flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;color:#fff}.action-btn.upgrade{background:linear-gradient(135deg,#26a,#38c)}.action-btn.upgrade:hover{background:linear-gradient(135deg,#37b,#4ae)}.action-btn.upgrade:disabled{opacity:.4;cursor:not-allowed}#evolve-container{display:flex;flex-direction:column;gap:6px;flex:2}.action-btn.evolve{background:linear-gradient(135deg,#c8f,#93f);font-size:11px;padding:6px}.action-btn.evolve:hover{background:linear-gradient(135deg,#eeaafe,#a4f)}.action-btn.evolve:disabled{opacity:.4;cursor:not-allowed}.action-btn.sell{background:linear-gradient(135deg,#842,#a53)}.action-btn.sell:hover{background:linear-gradient(135deg,#953,#c64)}#start-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 20% 18%,rgba(93,180,134,.22),transparent 28%),radial-gradient(circle at 78% 22%,rgba(115,209,255,.14),transparent 22%),radial-gradient(circle at 50% 100%,rgba(177,126,52,.18),transparent 38%),linear-gradient(145deg,#05100af5,#0a1711f0);display:flex;justify-content:center;align-items:center;z-index:100;overflow:hidden}.start-aurora{position:absolute;top:-20%;right:-20%;bottom:-20%;left:-20%;pointer-events:none;background:radial-gradient(ellipse 45% 35% at 30% 35%,rgba(111,217,255,.18),transparent 60%),radial-gradient(ellipse 40% 30% at 70% 60%,rgba(245,196,107,.14),transparent 60%),radial-gradient(ellipse 50% 40% at 55% 80%,rgba(93,180,134,.14),transparent 65%);filter:blur(6px);animation:auroraDrift 26s ease-in-out infinite alternate}@keyframes auroraDrift{0%{transform:translate3d(-4%,-3%,0) rotate(0);opacity:.8}50%{transform:translate3d(3%,2%,0) rotate(6deg);opacity:1}to{transform:translate3d(2%,-4%,0) rotate(-5deg);opacity:.85}}.start-embers{position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none;overflow:hidden}.ember{position:absolute;bottom:-20px;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle,rgba(255,225,160,.95),rgba(255,170,80,.55) 55%,transparent 75%);box-shadow:0 0 10px #ffcd8299;opacity:0;animation:emberRise 9s linear infinite}.ember.e1{left:8%;animation-duration:11s;animation-delay:0s}.ember.e2{left:18%;animation-duration:14s;animation-delay:2s;width:4px;height:4px}.ember.e3{left:28%;animation-duration:9s;animation-delay:4s}.ember.e4{left:40%;animation-duration:12s;animation-delay:1s;width:8px;height:8px}.ember.e5{left:52%;animation-duration:16s;animation-delay:3s}.ember.e6{left:62%;animation-duration:10s;animation-delay:5s;width:5px;height:5px;background:radial-gradient(circle,rgba(180,235,255,.95),rgba(100,190,255,.45) 55%,transparent 75%);box-shadow:0 0 10px #96d7ff8c}.ember.e7{left:72%;animation-duration:13s;animation-delay:6s}.ember.e8{left:82%;animation-duration:11s;animation-delay:2.5s;width:4px;height:4px}.ember.e9{left:90%;animation-duration:15s;animation-delay:7s;width:6px;height:6px;background:radial-gradient(circle,rgba(175,255,210,.9),rgba(120,210,150,.4) 55%,transparent 75%);box-shadow:0 0 10px #96ebb480}.ember.e10{left:46%;animation-duration:17s;animation-delay:8s;width:3px;height:3px}@keyframes emberRise{0%{transform:translateZ(0) scale(.8);opacity:0}12%{opacity:.9}55%{transform:translate3d(20px,-60vh,0) scale(1.1);opacity:.95}90%{opacity:.4}to{transform:translate3d(-15px,-112vh,0) scale(.6);opacity:0}}.start-content{position:relative;z-index:2;text-align:center;width:min(620px,calc(100vw - 40px));padding:34px 30px;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#08120ebd;border:1px solid rgba(214,245,219,.12);box-shadow:var(--shadow-lg);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);animation:startPanelIn .6s cubic-bezier(.22,1,.36,1) both}@keyframes startPanelIn{0%{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}.intro-kicker{font-family:Oxanium,sans-serif;font-size:13px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#d2edd385;margin-bottom:14px}.game-title{font-family:Oxanium,sans-serif;font-size:60px;font-weight:800;letter-spacing:.02em;background:linear-gradient(135deg,#f8eb98,#f4ba58,#f69a4f);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;text-shadow:none;filter:drop-shadow(0 0 18px rgba(247,182,90,.25));animation:titleGlow 4.5s ease-in-out infinite}@keyframes titleGlow{0%,to{filter:drop-shadow(0 0 12px rgba(247,182,90,.2));transform:translateY(0)}50%{filter:drop-shadow(0 0 22px rgba(247,182,90,.45));transform:translateY(-2px)}}.game-subtitle{font-size:16px;color:var(--text-muted);margin-bottom:22px}.start-chip-row{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:24px}.start-chip{min-width:110px;padding:12px 16px;border-radius:16px;border:1px solid rgba(214,245,219,.1);background:#ffffff0d;display:flex;flex-direction:column;gap:2px}.start-chip strong{font-family:Oxanium,sans-serif;font-size:20px;color:#f8fbf8}.start-chip span{font-size:11px;color:var(--text-muted);letter-spacing:.08em;text-transform:uppercase}.difficulty-selector{margin:0 auto 22px;padding:16px;width:min(360px,100%);border-radius:20px;background:#ffffff0d;border:1px solid rgba(214,245,219,.1)}.difficulty-label{font-family:Oxanium,sans-serif;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#d2edd385;margin-bottom:12px}.difficulty-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}.diff-btn{padding:10px 14px;border-radius:999px;border:1px solid rgba(214,245,219,.12);background:#ffffff0f;color:var(--text-main);font-weight:700;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}.diff-btn:hover{transform:translateY(-1px);background:#ffffff1a}.diff-btn.active{border-color:#6fd9ff66;background:#6fd9ff24;box-shadow:0 0 18px #6fd9ff24}.difficulty-desc{font-size:13px;color:var(--text-muted)}.big-btn{padding:14px 40px;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;color:#fff;background:linear-gradient(135deg,var(--action-strong),var(--action));transition:all .25s;box-shadow:0 10px 28px #2e99d057;margin:6px}.big-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px #44aadd80}.big-btn.secondary{background:linear-gradient(135deg,#555,#777);box-shadow:0 4px 12px #0000004d}#end-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:#030806d1;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);display:flex;justify-content:center;align-items:center;z-index:100}.end-content{text-align:center;width:min(560px,calc(100vw - 40px));padding:30px 28px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#08130fd6;border:1px solid var(--panel-stroke);box-shadow:var(--shadow-lg)}.end-kicker{font-family:Oxanium,sans-serif;font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:#d2edd37a;margin-bottom:12px}#end-title{font-size:48px;font-weight:900;margin-bottom:16px}#end-score{font-size:22px;color:#ffffffb3;margin-bottom:12px}.rank{position:relative;display:inline-block;font-size:64px;font-weight:900;width:110px;height:110px;line-height:110px;border-radius:50%;margin-bottom:28px;animation:rankPop .85s cubic-bezier(.175,.885,.32,1.4) both,rankPulseRing 2.2s ease-out .8s infinite;box-shadow:0 0 0 4px #ffffff0d,0 12px 38px #0006}.rank:before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,rgba(255,255,255,.28) 40deg,transparent 80deg);animation:rankShine 2.6s linear infinite;pointer-events:none;mix-blend-mode:overlay}@keyframes rankPop{0%{opacity:0;transform:scale(.4) rotate(-20deg)}60%{opacity:1;transform:scale(1.12) rotate(4deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes rankShine{to{transform:rotate(360deg)}}@keyframes rankPulseRing{0%{box-shadow:0 0 #ffffff47,0 12px 38px #0006}70%{box-shadow:0 0 0 22px #fff0,0 12px 38px #0006}to{box-shadow:0 0 #fff0,0 12px 38px #0006}}.rank-S{background:linear-gradient(135deg,gold,#f80);color:#222}.rank-A{background:linear-gradient(135deg,#4ad,#26a);color:#fff}.rank-B{background:linear-gradient(135deg,#4c8,#285);color:#fff}.rank-C{background:linear-gradient(135deg,#888,#555);color:#fff}.end-actions{display:flex;gap:12px;justify-content:center}.end-stats{margin:22px 0 24px;padding:16px;border-radius:20px;background:#ffffff0d;border:1px solid rgba(214,245,219,.1);text-align:left}.stat-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)}.stat-row:last-child{border-bottom:none}.stat-label{color:var(--text-muted)}.stat-val{font-family:Oxanium,sans-serif;font-weight:700;color:var(--text-main)}#milestone-banner{position:fixed;top:24%;left:50%;transform:translate(-50%,-50%);z-index:22;pointer-events:none;text-align:center}#milestone-banner-text{font-size:36px;font-weight:900;color:gold;text-shadow:0 0 30px rgba(255,200,0,.8),0 2px 8px rgba(0,0,0,.9);animation:milestoneAnim .7s ease-out;padding:12px 24px;background:#00000080;border:2px solid rgba(255,200,0,.5);border-radius:16px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}@keyframes milestoneAnim{0%{transform:scale(.4) translateY(20px);opacity:0}60%{transform:scale(1.1) translateY(-4px)}to{transform:scale(1) translateY(0);opacity:1}}#streak-banner{position:fixed;top:18%;left:50%;transform:translate(-50%,-50%);z-index:21;pointer-events:none;font-size:30px;font-weight:900;padding:10px 22px;border-radius:14px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:streakPop .5s ease-out}#streak-banner.streak-normal{color:#f80;text-shadow:0 0 20px rgba(255,130,0,.8),0 2px 6px rgba(0,0,0,.9);background:#00000080;border:1px solid rgba(255,130,0,.4)}#streak-banner.streak-mega{color:#fe0;text-shadow:0 0 25px rgba(255,230,0,.9),0 2px 8px rgba(0,0,0,.9);background:#0009;border:2px solid rgba(255,220,0,.6);box-shadow:0 0 30px #ffdc004d}@keyframes streakPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}60%{transform:translate(-50%,-50%) scale(1.12)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}#floating-text-layer{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:18;overflow:hidden}.floating-text{position:absolute;font-size:14px;font-weight:800;text-shadow:0 1px 4px rgba(0,0,0,.9);pointer-events:none;white-space:nowrap;animation:floatUp 1s ease-out forwards;transform:translate(-50%)}@keyframes floatUp{0%{opacity:1;transform:translate(-50%) translateY(0)}to{opacity:0;transform:translate(-50%) translateY(-40px)}}#help-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:15px;font-weight:700;color:#ffffffb3;cursor:pointer;transition:all .2s}#help-btn:hover{color:#fff;background:#ffffff1f}#help-overlay{position:fixed;top:0;right:0;bottom:0;left:0;background:#000000b3;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:center;z-index:80}#help-content{background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130ff0;border:1px solid var(--panel-stroke);border-radius:22px;box-shadow:var(--shadow-lg);padding:28px 36px;min-width:300px;text-align:center}.help-title{font-size:20px;font-weight:900;color:#fff;margin-bottom:20px}.help-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);gap:16px}.help-row:last-of-type{border-bottom:none}.help-key{font-size:13px;font-weight:700;color:gold;background:#ffc8001f;border:1px solid rgba(255,200,0,.3);border-radius:6px;padding:3px 10px;white-space:nowrap}.help-desc{font-size:13px;color:#ffffffbf;text-align:right}#help-close-btn{margin-top:20px;padding:10px 28px;background:linear-gradient(135deg,#26a,#4ad);border:none;border-radius:10px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#help-close-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px #4ad6}.hidden{display:none!important}#tower-tooltip{position:fixed;z-index:1000;background:#0a0f1ef2;border:1px solid #4ade80;border-radius:8px;padding:10px;color:#fff;pointer-events:none;box-shadow:0 4px 12px #00000080;font-size:14px;min-width:150px}#tower-tooltip .tooltip-name{font-weight:700;font-size:16px;color:#4ade80;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#tower-tooltip .tooltip-type{color:#aaa;font-size:12px;margin-bottom:6px;text-transform:capitalize}#tower-tooltip .tooltip-stats div{display:flex;justify-content:space-between;margin-top:2px}#tower-tooltip .tooltip-special{margin-top:6px;color:#fbbf24;font-size:12px;font-style:italic}#enemy-panel{position:absolute;top:60px;right:10px;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),#210e0ce0;border:1px solid rgba(255,116,99,.4);border-radius:14px;padding:12px;color:#fff;pointer-events:none;box-shadow:var(--shadow-lg);font-size:14px;min-width:168px;text-transform:capitalize}#enemy-panel .panel-header{font-weight:700;font-size:16px;color:#f44;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#enemy-panel .panel-stats div{display:flex;justify-content:space-between;margin-top:2px}@media(max-width:600px){.game-title{font-size:38px}.start-content{padding:26px 18px}.build-btn{padding:6px 7px;min-width:48px}.build-icon{font-size:16px}.build-name{font-size:9px}.build-cost{font-size:8px}#tower-panel{width:180px;right:8px;bottom:120px}#wave-banner-text{font-size:18px;padding:10px 14px}#build-menu{padding:8px 10px}#skill-bar{left:12px;bottom:120px;gap:8px;padding:8px 10px}.skill-btn{width:48px;height:48px}}#wave-modifier{position:fixed;top:82px;right:12px;z-index:16;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:linear-gradient(90deg,#ff5a3c40,#ffb43c33);border:1px solid rgba(255,160,90,.4);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 0 20px #ff783c59,var(--shadow-lg);color:#fff2e0;font-family:Oxanium,sans-serif;font-weight:700;letter-spacing:.08em;animation:modBadgeIn .5s cubic-bezier(.2,.9,.3,1),modBadgePulse 2.2s ease-in-out infinite .6s}#wave-modifier.hidden{display:none}#wave-modifier .mod-emoji{font-size:18px}#wave-modifier .mod-label{font-size:14px;text-shadow:0 0 10px rgba(255,120,60,.8)}#wave-modifier .mod-desc{font-size:11px;opacity:.82;font-weight:500;letter-spacing:.04em}@keyframes modBadgeIn{0%{transform:translate(40px) scale(.6);opacity:0}60%{transform:translate(-6px) scale(1.08);opacity:1}to{transform:translate(0) scale(1);opacity:1}}@keyframes modBadgePulse{0%,to{box-shadow:0 0 20px #ff783c59,var(--shadow-lg)}50%{box-shadow:0 0 32px #ffa05ab3,var(--shadow-lg)}}@media(max-width:600px){#wave-modifier{top:68px;right:8px;padding:5px 10px;gap:5px}#wave-modifier .mod-desc{display:none}#wave-modifier .mod-label{font-size:12px}}#next-wave-preview{position:fixed;right:12px;bottom:120px;z-index:15;padding:10px 14px;border-radius:12px;background:#0a1611bd;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(190,239,199,.12);box-shadow:var(--shadow-lg);color:#f7fbf7;font-family:Oxanium,sans-serif;animation:previewIn .35s ease-out}#next-wave-preview.hidden{display:none}#next-wave-preview .preview-label{font-size:11px;font-weight:600;letter-spacing:.18em;color:#9ed4ad;text-transform:uppercase;margin-bottom:6px;text-align:center}#next-wave-preview .preview-icons{display:flex;gap:8px;align-items:center;justify-content:center}#next-wave-preview .preview-chip{display:inline-flex;align-items:center;gap:3px;padding:4px 8px;border-radius:8px;background:#ffffff0f;font-size:14px;font-weight:700}#next-wave-preview .preview-chip .ico{font-size:16px}#next-wave-preview .preview-chip .cnt{color:#cfe6d6;font-size:12px}@keyframes previewIn{0%{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@media(max-width:600px){#next-wave-preview{right:8px;bottom:180px;padding:6px 10px;font-size:12px}#next-wave-preview .preview-chip{padding:3px 6px;font-size:12px}}#boss-cinematic{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:90;animation:bossCinematicFade 2.4s ease-out forwards}#boss-cinematic.hidden{display:none}#boss-cinematic .boss-vignette{position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(ellipse at center,#ff1e1e00 30%,#b40a0a8c 90%,#3c0000d9);mix-blend-mode:multiply;animation:bossVignettePulse 2.4s ease-out forwards}#boss-cinematic .boss-banner{position:absolute;top:38%;left:50%;transform:translate(-50%,-50%) scale(.4);text-align:center;font-family:Oxanium,sans-serif;color:#ffe1d0;text-shadow:0 0 18px rgba(255,60,40,.9),0 0 42px rgba(255,20,20,.55);animation:bossBannerIn 2.4s cubic-bezier(.2,.9,.3,1) forwards}#boss-cinematic .boss-sub{font-size:22px;font-weight:600;letter-spacing:.4em;color:#ffb080;margin-bottom:6px;opacity:.9}#boss-cinematic .boss-title{font-size:56px;font-weight:900;letter-spacing:.18em}@keyframes bossCinematicFade{0%{opacity:0}12%{opacity:1}75%{opacity:1}to{opacity:0}}@keyframes bossVignettePulse{0%{opacity:0}20%{opacity:1}50%{opacity:.85}80%{opacity:.7}to{opacity:0}}@keyframes bossBannerIn{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}18%{transform:translate(-50%,-50%) scale(1.12);opacity:1}28%{transform:translate(-50%,-50%) scale(1);opacity:1}80%{transform:translate(-50%,-50%) scale(1.02);opacity:1}to{transform:translate(-50%,-50%) scale(1.1);opacity:0}}@media(max-width:600px){#boss-cinematic .boss-title{font-size:36px;letter-spacing:.12em}#boss-cinematic .boss-sub{font-size:16px}}#buff-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:200;display:flex;align-items:center;justify-content:center;animation:buffFadeIn .35s ease both}#buff-modal.hidden{display:none}#buff-modal .buff-backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 50% 40%,#1e1432b3,#05050ceb);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}#buff-modal .buff-dialog{position:relative;min-width:520px;max-width:92vw;padding:28px 30px 32px;background:linear-gradient(145deg,#241c3af5,#120e20f5);border:1px solid rgba(255,210,110,.4);border-radius:18px;box-shadow:0 20px 60px #0000008c,0 0 80px #ffbe5026;text-align:center;animation:buffDialogIn .45s cubic-bezier(.34,1.56,.64,1) both}#buff-modal .buff-kicker{font-size:11px;letter-spacing:.24em;color:#ffd486;text-transform:uppercase;opacity:.85}#buff-modal .buff-title{font-size:30px;font-weight:800;letter-spacing:.04em;margin-top:4px;color:#fff3d9;text-shadow:0 0 22px rgba(255,200,100,.55)}#buff-modal .buff-sub{margin-top:6px;font-size:13px;color:#ffffffb3}#buff-modal .buff-cards{margin-top:22px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.buff-card{padding:18px 12px 16px;background:linear-gradient(160deg,#44346499,#20163899);border:1px solid rgba(255,255,255,.1);border-radius:14px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease;display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-family:inherit}.buff-card:hover{transform:translateY(-4px) scale(1.02);border-color:#ffdc78b3;background:linear-gradient(160deg,#604a8cb3,#302050b3);box-shadow:0 14px 28px #00000080,0 0 26px #ffc86440}.buff-card .card-emoji{font-size:36px;line-height:1;margin-bottom:4px}.buff-card .card-name{font-size:15px;font-weight:700;letter-spacing:.03em}.buff-card .card-desc{font-size:12px;opacity:.82;line-height:1.4}@keyframes buffFadeIn{0%{opacity:0}to{opacity:1}}@keyframes buffDialogIn{0%{transform:translateY(16px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}@media(max-width:600px){#buff-modal .buff-dialog{min-width:0;width:94vw;padding:22px 18px 24px}#buff-modal .buff-title{font-size:24px}#buff-modal .buff-cards{grid-template-columns:1fr;gap:10px}.buff-card .card-emoji{font-size:30px}}#achievement-toasts{position:fixed;top:90px;right:18px;z-index:220;display:flex;flex-direction:column;gap:10px;pointer-events:none}.ach-toast{min-width:240px;max-width:320px;padding:12px 14px;display:flex;gap:12px;align-items:center;background:linear-gradient(135deg,#36245af5,#1c1630f5);border:1px solid rgba(255,220,120,.55);border-radius:12px;box-shadow:0 10px 28px #00000073,0 0 26px #ffc86433;color:#fff3d9;font-family:inherit;animation:achIn .45s cubic-bezier(.34,1.56,.64,1) both,achOut .5s ease 3.6s forwards}.ach-toast .ach-emoji{font-size:32px;line-height:1;flex-shrink:0}.ach-toast .ach-body{display:flex;flex-direction:column;gap:2px;min-width:0}.ach-toast .ach-kicker{font-size:9px;letter-spacing:.22em;color:#ffd486;text-transform:uppercase;opacity:.9}.ach-toast .ach-name{font-size:14px;font-weight:700;letter-spacing:.03em}.ach-toast .ach-desc{font-size:11px;opacity:.82;line-height:1.35}@keyframes achIn{0%{transform:translate(120%);opacity:0}to{transform:translate(0);opacity:1}}@keyframes achOut{to{transform:translate(120%);opacity:0}}.high-score-row{margin-top:14px;padding:10px 16px;background:#ffffff0a;border:1px solid rgba(255,220,120,.22);border-radius:10px;display:inline-flex;gap:10px;align-items:baseline;font-size:13px;color:#ffffffd9}.high-score-row .hs-label{color:#ffd486;letter-spacing:.1em;text-transform:uppercase;font-size:10px}.high-score-row .hs-val{font-weight:800;font-size:18px;color:#fff3d9;text-shadow:0 0 12px rgba(255,200,100,.45)}.high-score-row .hs-sub{font-size:11px;opacity:.7}#end-best-badge{margin:6px auto 4px;display:inline-block;padding:4px 14px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;color:#0c0a1a;background:linear-gradient(135deg,#ffe18a,#ffc34a);border-radius:999px;box-shadow:0 0 22px #ffc85a99;animation:bestPulse 1.4s ease-in-out infinite}#end-best-badge.hidden{display:none}@keyframes bestPulse{0%,to{transform:scale(1);box-shadow:0 0 22px #ffc85a99}50%{transform:scale(1.06);box-shadow:0 0 34px #ffdc78e6}}@media(max-width:600px){#achievement-toasts{top:70px;right:10px}.ach-toast{min-width:0;max-width:78vw}}.endless-toggle{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:10px;align-items:center;margin:14px auto 0;padding:10px 16px;max-width:360px;background:#ffffff0a;border:1px solid rgba(140,200,255,.22);border-radius:10px;cursor:pointer;color:#ffffffd9;transition:background .18s,border-color .18s}.endless-toggle:hover{background:#8cc8ff14;border-color:#8cc8ff80}.endless-toggle input{position:absolute;opacity:0;pointer-events:none}.endless-toggle .endless-box{grid-row:1 / span 2;width:20px;height:20px;border:2px solid rgba(160,200,255,.6);border-radius:5px;display:inline-block;position:relative;transition:background .18s,border-color .18s}.endless-toggle input:checked~.endless-box{background:linear-gradient(135deg,#6dd1ff,#3a8bff);border-color:#9de1ff;box-shadow:0 0 10px #64b4ff8c}.endless-toggle input:checked~.endless-box:after{content:"✓";position:absolute;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;color:#0c1528;font-weight:900;font-size:14px}.endless-toggle .endless-text{font-size:14px;font-weight:700;letter-spacing:.04em;color:#d7ecff}.endless-toggle .endless-sub{grid-column:2;font-size:10px;opacity:.7;line-height:1.3}.link-btn{margin-top:12px;background:transparent;border:1px solid rgba(255,220,120,.35);color:#ffd486;padding:8px 16px;border-radius:8px;font-size:12px;letter-spacing:.08em;cursor:pointer;font-family:inherit;transition:background .18s,border-color .18s,color .18s}.link-btn:hover{background:#ffdc781a;border-color:#ffdc78b3;color:#fff3d9}#achievements-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:210;display:flex;align-items:center;justify-content:center;animation:buffFadeIn .3s ease both}#achievements-modal.hidden{display:none}#achievements-modal .ach-backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:#06060ecc;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}#achievements-modal .ach-dialog{position:relative;width:min(640px,92vw);max-height:80vh;overflow-y:auto;padding:22px 24px 24px;background:linear-gradient(145deg,#221c38f7,#120e20f7);border:1px solid rgba(255,220,120,.35);border-radius:16px;box-shadow:0 20px 60px #0000008c;color:#fff;animation:buffDialogIn .4s cubic-bezier(.34,1.56,.64,1) both}#achievements-modal .ach-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}#achievements-modal .ach-kick{font-size:10px;letter-spacing:.22em;color:#ffd486;text-transform:uppercase;opacity:.9}#achievements-modal .ach-ttl{font-size:22px;font-weight:800;letter-spacing:.03em}#achievements-modal #ach-count{font-size:13px;color:#ffdc78cc;margin-left:8px;font-weight:600}#achievements-modal #ach-close-btn{background:transparent;border:none;color:#fff9;font-size:18px;cursor:pointer;padding:4px 10px;border-radius:6px;transition:background .18s,color .18s}#achievements-modal #ach-close-btn:hover{background:#ffffff14;color:#fff}#achievements-modal .ach-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ach-row{display:flex;gap:12px;align-items:center;padding:12px 14px;background:#ffffff0a;border:1px solid rgba(255,255,255,.08);border-radius:10px;transition:background .18s,border-color .18s,filter .18s}.ach-row.locked{filter:grayscale(1) brightness(.7)}.ach-row.unlocked{background:linear-gradient(135deg,#785ab440,#3c327840);border-color:#ffdc7866}.ach-row .row-emoji{font-size:28px;line-height:1;flex-shrink:0}.ach-row .row-body{display:flex;flex-direction:column;gap:2px;min-width:0}.ach-row .row-name{font-size:13px;font-weight:700;letter-spacing:.03em}.ach-row .row-desc{font-size:11px;opacity:.75;line-height:1.35}@media(max-width:600px){#achievements-modal .ach-grid{grid-template-columns:1fr}}.lifetime-row{margin-top:10px;display:inline-flex;gap:8px;flex-wrap:wrap;justify-content:center}.lifetime-row .lt-chip{display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:6px 12px;background:#ffffff0a;border:1px solid rgba(255,255,255,.08);border-radius:8px;min-width:74px}.lifetime-row .lt-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#ffffff8c}.lifetime-row .lt-val{font-size:15px;font-weight:700;color:#fff3d9}#ach-reset-btn.reset-btn{margin-top:18px;width:100%;padding:10px 14px;background:transparent;border:1px solid rgba(255,100,100,.35);border-radius:8px;color:#ff9a9a;font-family:inherit;font-size:12px;letter-spacing:.08em;cursor:pointer;transition:background .18s,border-color .18s,color .18s}#ach-reset-btn.reset-btn:hover{background:#ff64641f;border-color:#ff6464b3;color:#ffc8c8}#ach-reset-btn.reset-btn.confirming{background:#ff646433;border-color:#ff8a8a;color:#fff}
/*$vite$:1*/`,document.head.appendChild(On);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const tn="170",Ei=0,fl=1,rh=2,eo=1,sh=2,Sn=3,kn=0,Dt=1,gt=2,Mn=0,Ti=1,gr=2,pl=3,ml=4,oh=5,ni=100,ah=101,lh=102,ch=103,uh=104,hh=200,dh=201,fh=202,ph=203,to=204,no=205,mh=206,gh=207,vh=208,xh=209,_h=210,yh=211,Sh=212,Mh=213,wh=214,io=0,ro=1,so=2,Ai=3,oo=4,ao=5,lo=6,co=7,uo=0,bh=1,Eh=2,Bn=0,Th=1,Ah=2,Ch=3,gl=4,Rh=5,Ph=6,Lh=7,vl=300,Ci=301,Ri=302,ho=303,fo=304,Kr=306,po=1e3,ii=1001,mo=1002,Gt=1003,Ih=1004,Jr=1005,mn=1006,go=1007,ri=1008,wn=1009,xl=1010,_l=1011,vr=1012,vo=1013,si=1014,gn=1015,bn=1016,xo=1017,_o=1018,Pi=1020,yl=35902,Sl=1021,Ml=1022,nn=1023,wl=1024,bl=1025,Li=1026,Ii=1027,yo=1028,So=1029,El=1030,Mo=1031,wo=1033,Qr=33776,es=33777,ts=33778,ns=33779,bo=35840,Eo=35841,To=35842,Ao=35843,Co=36196,Ro=37492,Po=37496,Lo=37808,Io=37809,Do=37810,Uo=37811,No=37812,Fo=37813,Oo=37814,ko=37815,Bo=37816,zo=37817,Go=37818,Ho=37819,Vo=37820,Wo=37821,is=36492,Xo=36494,qo=36495,Tl=36283,Yo=36284,$o=36285,Zo=36286,Dh=3200,Uh=3201,jo=0,Nh=1,zn="",Yt="srgb",Di="srgb-linear",rs="linear",tt="srgb",Ui=7680,Al=519,Fh=512,Oh=513,kh=514,Cl=515,Bh=516,zh=517,Gh=518,Hh=519,Rl=35044,Pl="300 es",En=2e3,ss=2001;class Ni{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const At=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Ll=1234567;const xr=Math.PI/180,_r=180/Math.PI;function Fi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(At[i&255]+At[i>>8&255]+At[i>>16&255]+At[i>>24&255]+"-"+At[e&255]+At[e>>8&255]+"-"+At[e>>16&15|64]+At[e>>24&255]+"-"+At[t&63|128]+At[t>>8&255]+"-"+At[t>>16&255]+At[t>>24&255]+At[n&255]+At[n>>8&255]+At[n>>16&255]+At[n>>24&255]).toLowerCase()}function vt(i,e,t){return Math.max(e,Math.min(t,i))}function Ko(i,e){return(i%e+e)%e}function Vh(i,e,t,n,r){return n+(i-e)*(r-n)/(t-e)}function Wh(i,e,t){return i!==e?(t-i)/(e-i):0}function yr(i,e,t){return(1-t)*i+t*e}function Xh(i,e,t,n){return yr(i,e,1-Math.exp(-t*n))}function qh(i,e=1){return e-Math.abs(Ko(i,e*2)-e)}function Yh(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function $h(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Zh(i,e){return i+Math.floor(Math.random()*(e-i+1))}function jh(i,e){return i+Math.random()*(e-i)}function Kh(i){return i*(.5-Math.random())}function Jh(i){i!==void 0&&(Ll=i);let e=Ll+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Qh(i){return i*xr}function ed(i){return i*_r}function td(i){return(i&i-1)===0&&i!==0}function nd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function id(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function rd(i,e,t,n,r){const s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+n)/2),u=o((e+n)/2),h=s((e-n)/2),d=o((e-n)/2),p=s((n-e)/2),g=o((n-e)/2);switch(r){case"XYX":i.set(a*u,l*h,l*d,a*c);break;case"YZY":i.set(l*d,a*u,l*h,a*c);break;case"ZXZ":i.set(l*h,l*d,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*p,a*c);break;case"YXY":i.set(l*p,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*p,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Oi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ut(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Il={DEG2RAD:xr,RAD2DEG:_r,generateUUID:Fi,clamp:vt,euclideanModulo:Ko,mapLinear:Vh,inverseLerp:Wh,lerp:yr,damp:Xh,pingpong:qh,smoothstep:Yh,smootherstep:$h,randInt:Zh,randFloat:jh,randFloatSpread:Kh,seededRandom:Jh,degToRad:Qh,radToDeg:ed,isPowerOfTwo:td,ceilPowerOfTwo:nd,floorPowerOfTwo:id,setQuaternionFromProperEuler:rd,normalize:Ut,denormalize:Oi};class J{constructor(e=0,t=0){J.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(vt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class De{constructor(e,t,n,r,s,o,a,l,c){De.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],p=n[5],g=n[8],x=r[0],m=r[3],f=r[6],b=r[1],w=r[4],v=r[7],L=r[2],E=r[5],A=r[8];return s[0]=o*x+a*b+l*L,s[3]=o*m+a*w+l*E,s[6]=o*f+a*v+l*A,s[1]=c*x+u*b+h*L,s[4]=c*m+u*w+h*E,s[7]=c*f+u*v+h*A,s[2]=d*x+p*b+g*L,s[5]=d*m+p*w+g*E,s[8]=d*f+p*v+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=u*o-a*c,d=a*l-u*s,p=c*s-o*l,g=t*h+n*d+r*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=h*x,e[1]=(r*c-u*n)*x,e[2]=(a*n-r*o)*x,e[3]=d*x,e[4]=(u*t-r*l)*x,e[5]=(r*s-a*t)*x,e[6]=p*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*s)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Jo.makeScale(e,t)),this}rotate(e){return this.premultiply(Jo.makeRotation(-e)),this}translate(e,t){return this.premultiply(Jo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Jo=new De;function Dl(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function os(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function sd(){const i=os("canvas");return i.style.display="block",i}const Ul={};function Sr(i){i in Ul||(Ul[i]=!0,console.warn(i))}function od(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function ad(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function ld(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Xe={enabled:!0,workingColorSpace:Di,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===tt&&(i.r=Tn(i.r),i.g=Tn(i.g),i.b=Tn(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===tt&&(i.r=ki(i.r),i.g=ki(i.g),i.b=ki(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===zn?rs:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Tn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ki(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Nl=[.64,.33,.3,.6,.15,.06],Fl=[.2126,.7152,.0722],Ol=[.3127,.329],kl=new De().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Bl=new De().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Xe.define({[Di]:{primaries:Nl,whitePoint:Ol,transfer:rs,toXYZ:kl,fromXYZ:Bl,luminanceCoefficients:Fl,workingColorSpaceConfig:{unpackColorSpace:Yt},outputColorSpaceConfig:{drawingBufferColorSpace:Yt}},[Yt]:{primaries:Nl,whitePoint:Ol,transfer:tt,toXYZ:kl,fromXYZ:Bl,luminanceCoefficients:Fl,outputColorSpaceConfig:{drawingBufferColorSpace:Yt}}});let Bi;class cd{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Bi===void 0&&(Bi=os("canvas")),Bi.width=e.width,Bi.height=e.height;const n=Bi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Bi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=os("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Tn(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Tn(t[n]/255)*255):t[n]=Tn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let ud=0;class zl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ud++}),this.uuid=Fi(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Qo(r[o].image)):s.push(Qo(r[o]))}else s=Qo(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function Qo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?cd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let hd=0;class Nt extends Ni{constructor(e=Nt.DEFAULT_IMAGE,t=Nt.DEFAULT_MAPPING,n=ii,r=ii,s=mn,o=ri,a=nn,l=wn,c=Nt.DEFAULT_ANISOTROPY,u=zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:hd++}),this.uuid=Fi(),this.name="",this.source=new zl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new J(0,0),this.repeat=new J(1,1),this.center=new J(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new De,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==vl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case po:e.x=e.x-Math.floor(e.x);break;case ii:e.x=e.x<0?0:1;break;case mo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case po:e.y=e.y-Math.floor(e.y);break;case ii:e.y=e.y<0?0:1;break;case mo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Nt.DEFAULT_IMAGE=null,Nt.DEFAULT_MAPPING=vl,Nt.DEFAULT_ANISOTROPY=1;class nt{constructor(e=0,t=0,n=0,r=1){nt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],u=l[4],h=l[8],d=l[1],p=l[5],g=l[9],x=l[2],m=l[6],f=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const w=(c+1)/2,v=(p+1)/2,L=(f+1)/2,E=(u+d)/4,A=(h+x)/4,R=(g+m)/4;return w>v&&w>L?w<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(w),r=E/n,s=A/n):v>L?v<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(v),n=E/r,s=R/r):L<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(L),n=A/s,r=R/s),this.set(n,r,s,t),this}let b=Math.sqrt((m-g)*(m-g)+(h-x)*(h-x)+(d-u)*(d-u));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(h-x)/b,this.z=(d-u)/b,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class dd extends Ni{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new nt(0,0,e,t),this.scissorTest=!1,this.viewport=new nt(0,0,e,t);const r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Nt(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,r=e.textures.length;n<r;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new zl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class rn extends dd{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Gl extends Nt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class fd extends Nt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Mr{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],h=n[r+3];const d=s[o+0],p=s[o+1],g=s[o+2],x=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h;return}if(a===1){e[t+0]=d,e[t+1]=p,e[t+2]=g,e[t+3]=x;return}if(h!==x||l!==d||c!==p||u!==g){let m=1-a;const f=l*d+c*p+u*g+h*x,b=f>=0?1:-1,w=1-f*f;if(w>Number.EPSILON){const L=Math.sqrt(w),E=Math.atan2(L,f*b);m=Math.sin(m*E)/L,a=Math.sin(a*E)/L}const v=a*b;if(l=l*m+d*v,c=c*m+p*v,u=u*m+g*v,h=h*m+x*v,m===1-a){const L=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=L,c*=L,u*=L,h*=L}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=h}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],h=s[o],d=s[o+1],p=s[o+2],g=s[o+3];return e[t]=a*g+u*h+l*p-c*d,e[t+1]=l*g+u*d+c*h-a*p,e[t+2]=c*g+u*p+a*d-l*h,e[t+3]=u*g-a*h-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),h=a(s/2),d=l(n/2),p=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=d*u*h+c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h-d*p*g;break;case"YXZ":this._x=d*u*h+c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h+d*p*g;break;case"ZXY":this._x=d*u*h-c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h-d*p*g;break;case"ZYX":this._x=d*u*h-c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h+d*p*g;break;case"YZX":this._x=d*u*h+c*p*g,this._y=c*p*h+d*u*g,this._z=c*u*g-d*p*h,this._w=c*u*h-d*p*g;break;case"XZY":this._x=d*u*h-c*p*g,this._y=c*p*h-d*u*g,this._z=c*u*g+d*p*h,this._w=c*u*h+d*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],h=t[10],d=n+a+h;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(u-l)*p,this._y=(s-c)*p,this._z=(o-r)*p}else if(n>a&&n>h){const p=2*Math.sqrt(1+n-a-h);this._w=(u-l)/p,this._x=.25*p,this._y=(r+o)/p,this._z=(s+c)/p}else if(a>h){const p=2*Math.sqrt(1+a-n-h);this._w=(s-c)/p,this._x=(r+o)/p,this._y=.25*p,this._z=(l+u)/p}else{const p=2*Math.sqrt(1+h-n-a);this._w=(o-r)/p,this._x=(s+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(vt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-t)*u)/c,d=Math.sin(t*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=r*h+this._y*d,this._z=s*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class C{constructor(e=0,t=0,n=0){C.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Hl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Hl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),h=2*(s*n-o*t);return this.x=t+l*c+o*h-a*u,this.y=n+l*u+a*c-s*h,this.z=r+l*h+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ea.copy(this).projectOnVector(e),this.sub(ea)}reflect(e){return this.sub(ea.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(vt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ea=new C,Hl=new Mr;class oi{constructor(e=new C(1/0,1/0,1/0),t=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(sn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(sn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=sn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,sn):sn.fromBufferAttribute(s,o),sn.applyMatrix4(e.matrixWorld),this.expandByPoint(sn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),as.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),as.copy(n.boundingBox)),as.applyMatrix4(e.matrixWorld),this.union(as)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,sn),sn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(wr),ls.subVectors(this.max,wr),zi.subVectors(e.a,wr),Gi.subVectors(e.b,wr),Hi.subVectors(e.c,wr),Gn.subVectors(Gi,zi),Hn.subVectors(Hi,Gi),ai.subVectors(zi,Hi);let t=[0,-Gn.z,Gn.y,0,-Hn.z,Hn.y,0,-ai.z,ai.y,Gn.z,0,-Gn.x,Hn.z,0,-Hn.x,ai.z,0,-ai.x,-Gn.y,Gn.x,0,-Hn.y,Hn.x,0,-ai.y,ai.x,0];return!ta(t,zi,Gi,Hi,ls)||(t=[1,0,0,0,1,0,0,0,1],!ta(t,zi,Gi,Hi,ls))?!1:(cs.crossVectors(Gn,Hn),t=[cs.x,cs.y,cs.z],ta(t,zi,Gi,Hi,ls))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,sn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(sn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(An[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),An[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),An[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),An[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),An[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),An[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),An[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),An[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(An),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const An=[new C,new C,new C,new C,new C,new C,new C,new C],sn=new C,as=new oi,zi=new C,Gi=new C,Hi=new C,Gn=new C,Hn=new C,ai=new C,wr=new C,ls=new C,cs=new C,li=new C;function ta(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){li.fromArray(i,s);const a=r.x*Math.abs(li.x)+r.y*Math.abs(li.y)+r.z*Math.abs(li.z),l=e.dot(li),c=t.dot(li),u=n.dot(li);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const pd=new oi,br=new C,na=new C;class Vi{constructor(e=new C,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):pd.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;br.subVectors(e,this.center);const t=br.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(br,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(na.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(br.copy(e.center).add(na)),this.expandByPoint(br.copy(e.center).sub(na))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Cn=new C,ia=new C,us=new C,Vn=new C,ra=new C,hs=new C,sa=new C;class oa{constructor(e=new C,t=new C(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Cn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Cn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Cn.copy(this.origin).addScaledVector(this.direction,t),Cn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ia.copy(e).add(t).multiplyScalar(.5),us.copy(t).sub(e).normalize(),Vn.copy(this.origin).sub(ia);const s=e.distanceTo(t)*.5,o=-this.direction.dot(us),a=Vn.dot(this.direction),l=-Vn.dot(us),c=Vn.lengthSq(),u=Math.abs(1-o*o);let h,d,p,g;if(u>0)if(h=o*l-a,d=o*a-l,g=s*u,h>=0)if(d>=-g)if(d<=g){const x=1/u;h*=x,d*=x,p=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d=-s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*s+a)),d=h>0?-s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-s,-l),s),p=d*(d+2*l)+c):(h=Math.max(0,-(o*s+a)),d=h>0?s:Math.min(Math.max(-s,-l),s),p=-h*h+d*(d+2*l)+c);else d=o>0?-s:s,h=Math.max(0,-(o*d+a)),p=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(ia).addScaledVector(us,d),p}intersectSphere(e,t){Cn.subVectors(e.center,this.origin);const n=Cn.dot(this.direction),r=Cn.dot(Cn)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),u>=0?(s=(e.min.y-d.y)*u,o=(e.max.y-d.y)*u):(s=(e.max.y-d.y)*u,o=(e.min.y-d.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),h>=0?(a=(e.min.z-d.z)*h,l=(e.max.z-d.z)*h):(a=(e.max.z-d.z)*h,l=(e.min.z-d.z)*h),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Cn)!==null}intersectTriangle(e,t,n,r,s){ra.subVectors(t,e),hs.subVectors(n,e),sa.crossVectors(ra,hs);let o=this.direction.dot(sa),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Vn.subVectors(this.origin,e);const l=a*this.direction.dot(hs.crossVectors(Vn,hs));if(l<0)return null;const c=a*this.direction.dot(ra.cross(Vn));if(c<0||l+c>o)return null;const u=-a*Vn.dot(sa);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Qe{constructor(e,t,n,r,s,o,a,l,c,u,h,d,p,g,x,m){Qe.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,h,d,p,g,x,m)}set(e,t,n,r,s,o,a,l,c,u,h,d,p,g,x,m){const f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=r,f[1]=s,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=u,f[10]=h,f[14]=d,f[3]=p,f[7]=g,f[11]=x,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Qe().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/Wi.setFromMatrixColumn(e,0).length(),s=1/Wi.setFromMatrixColumn(e,1).length(),o=1/Wi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const d=o*u,p=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=-l*h,t[8]=c,t[1]=p+g*c,t[5]=d-x*c,t[9]=-a*l,t[2]=x-d*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*u,p=l*h,g=c*u,x=c*h;t[0]=d+x*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*h,t[5]=o*u,t[9]=-a,t[2]=p*a-g,t[6]=x+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*u,p=l*h,g=c*u,x=c*h;t[0]=d-x*a,t[4]=-o*h,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*u,t[9]=x-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*u,p=o*h,g=a*u,x=a*h;t[0]=l*u,t[4]=g*c-p,t[8]=d*c+x,t[1]=l*h,t[5]=x*c+d,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,p=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=x-d*h,t[8]=g*h+p,t[1]=h,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=p*h+g,t[10]=d-x*h}else if(e.order==="XZY"){const d=o*l,p=o*c,g=a*l,x=a*c;t[0]=l*u,t[4]=-h,t[8]=c*u,t[1]=d*h+x,t[5]=o*u,t[9]=p*h-g,t[2]=g*h-p,t[6]=a*u,t[10]=x*h+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(md,e,gd)}lookAt(e,t,n){const r=this.elements;return Ht.subVectors(e,t),Ht.lengthSq()===0&&(Ht.z=1),Ht.normalize(),Wn.crossVectors(n,Ht),Wn.lengthSq()===0&&(Math.abs(n.z)===1?Ht.x+=1e-4:Ht.z+=1e-4,Ht.normalize(),Wn.crossVectors(n,Ht)),Wn.normalize(),ds.crossVectors(Ht,Wn),r[0]=Wn.x,r[4]=ds.x,r[8]=Ht.x,r[1]=Wn.y,r[5]=ds.y,r[9]=Ht.y,r[2]=Wn.z,r[6]=ds.z,r[10]=Ht.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],p=n[13],g=n[2],x=n[6],m=n[10],f=n[14],b=n[3],w=n[7],v=n[11],L=n[15],E=r[0],A=r[4],R=r[8],S=r[12],_=r[1],P=r[5],F=r[9],k=r[13],H=r[2],j=r[6],X=r[10],te=r[14],W=r[3],oe=r[7],pe=r[11],Ee=r[15];return s[0]=o*E+a*_+l*H+c*W,s[4]=o*A+a*P+l*j+c*oe,s[8]=o*R+a*F+l*X+c*pe,s[12]=o*S+a*k+l*te+c*Ee,s[1]=u*E+h*_+d*H+p*W,s[5]=u*A+h*P+d*j+p*oe,s[9]=u*R+h*F+d*X+p*pe,s[13]=u*S+h*k+d*te+p*Ee,s[2]=g*E+x*_+m*H+f*W,s[6]=g*A+x*P+m*j+f*oe,s[10]=g*R+x*F+m*X+f*pe,s[14]=g*S+x*k+m*te+f*Ee,s[3]=b*E+w*_+v*H+L*W,s[7]=b*A+w*P+v*j+L*oe,s[11]=b*R+w*F+v*X+L*pe,s[15]=b*S+w*k+v*te+L*Ee,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],h=e[6],d=e[10],p=e[14],g=e[3],x=e[7],m=e[11],f=e[15];return g*(+s*l*h-r*c*h-s*a*d+n*c*d+r*a*p-n*l*p)+x*(+t*l*p-t*c*d+s*o*d-r*o*p+r*c*u-s*l*u)+m*(+t*c*h-t*a*p-s*o*h+n*o*p+s*a*u-n*c*u)+f*(-r*a*u-t*l*h+t*a*d+r*o*h-n*o*d+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],h=e[9],d=e[10],p=e[11],g=e[12],x=e[13],m=e[14],f=e[15],b=h*m*c-x*d*c+x*l*p-a*m*p-h*l*f+a*d*f,w=g*d*c-u*m*c-g*l*p+o*m*p+u*l*f-o*d*f,v=u*x*c-g*h*c+g*a*p-o*x*p-u*a*f+o*h*f,L=g*h*l-u*x*l-g*a*d+o*x*d+u*a*m-o*h*m,E=t*b+n*w+r*v+s*L;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return e[0]=b*A,e[1]=(x*d*s-h*m*s-x*r*p+n*m*p+h*r*f-n*d*f)*A,e[2]=(a*m*s-x*l*s+x*r*c-n*m*c-a*r*f+n*l*f)*A,e[3]=(h*l*s-a*d*s-h*r*c+n*d*c+a*r*p-n*l*p)*A,e[4]=w*A,e[5]=(u*m*s-g*d*s+g*r*p-t*m*p-u*r*f+t*d*f)*A,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*f-t*l*f)*A,e[7]=(o*d*s-u*l*s+u*r*c-t*d*c-o*r*p+t*l*p)*A,e[8]=v*A,e[9]=(g*h*s-u*x*s-g*n*p+t*x*p+u*n*f-t*h*f)*A,e[10]=(o*x*s-g*a*s+g*n*c-t*x*c-o*n*f+t*a*f)*A,e[11]=(u*a*s-o*h*s-u*n*c+t*h*c+o*n*p-t*a*p)*A,e[12]=L*A,e[13]=(u*x*r-g*h*r+g*n*d-t*x*d-u*n*m+t*h*m)*A,e[14]=(g*a*r-o*x*r-g*n*l+t*x*l+o*n*m-t*a*m)*A,e[15]=(o*h*r-u*a*r+u*n*l-t*h*l-o*n*d+t*a*d)*A,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,h=a+a,d=s*c,p=s*u,g=s*h,x=o*u,m=o*h,f=a*h,b=l*c,w=l*u,v=l*h,L=n.x,E=n.y,A=n.z;return r[0]=(1-(x+f))*L,r[1]=(p+v)*L,r[2]=(g-w)*L,r[3]=0,r[4]=(p-v)*E,r[5]=(1-(d+f))*E,r[6]=(m+b)*E,r[7]=0,r[8]=(g+w)*A,r[9]=(m-b)*A,r[10]=(1-(d+x))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=Wi.set(r[0],r[1],r[2]).length();const o=Wi.set(r[4],r[5],r[6]).length(),a=Wi.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],on.copy(this);const c=1/s,u=1/o,h=1/a;return on.elements[0]*=c,on.elements[1]*=c,on.elements[2]*=c,on.elements[4]*=u,on.elements[5]*=u,on.elements[6]*=u,on.elements[8]*=h,on.elements[9]*=h,on.elements[10]*=h,t.setFromRotationMatrix(on),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=En){const l=this.elements,c=2*s/(t-e),u=2*s/(n-r),h=(t+e)/(t-e),d=(n+r)/(n-r);let p,g;if(a===En)p=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===ss)p=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=En){const l=this.elements,c=1/(t-e),u=1/(n-r),h=1/(o-s),d=(t+e)*c,p=(n+r)*u;let g,x;if(a===En)g=(o+s)*h,x=-2*h;else if(a===ss)g=s*h,x=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-d,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Wi=new C,on=new Qe,md=new C(0,0,0),gd=new C(1,1,1),Wn=new C,ds=new C,Ht=new C,Vl=new Qe,Wl=new Mr;class St{constructor(e=0,t=0,n=0,r=St.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],h=r[2],d=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(vt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-vt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(vt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-vt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(vt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-vt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Vl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Vl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Wl.setFromEuler(this),this.setFromQuaternion(Wl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}St.DEFAULT_ORDER="XYZ";class aa{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let vd=0;const Xl=new C,Xi=new Mr,Rn=new Qe,fs=new C,Er=new C,xd=new C,_d=new Mr,ql=new C(1,0,0),Yl=new C(0,1,0),$l=new C(0,0,1),Zl={type:"added"},yd={type:"removed"},qi={type:"childadded",child:null},la={type:"childremoved",child:null};class xt extends Ni{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:vd++}),this.uuid=Fi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=xt.DEFAULT_UP.clone();const e=new C,t=new St,n=new Mr,r=new C(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Qe},normalMatrix:{value:new De}}),this.matrix=new Qe,this.matrixWorld=new Qe,this.matrixAutoUpdate=xt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new aa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Xi.setFromAxisAngle(e,t),this.quaternion.multiply(Xi),this}rotateOnWorldAxis(e,t){return Xi.setFromAxisAngle(e,t),this.quaternion.premultiply(Xi),this}rotateX(e){return this.rotateOnAxis(ql,e)}rotateY(e){return this.rotateOnAxis(Yl,e)}rotateZ(e){return this.rotateOnAxis($l,e)}translateOnAxis(e,t){return Xl.copy(e).applyQuaternion(this.quaternion),this.position.add(Xl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ql,e)}translateY(e){return this.translateOnAxis(Yl,e)}translateZ(e){return this.translateOnAxis($l,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Rn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?fs.copy(e):fs.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Er.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Rn.lookAt(Er,fs,this.up):Rn.lookAt(fs,Er,this.up),this.quaternion.setFromRotationMatrix(Rn),r&&(Rn.extractRotation(r.matrixWorld),Xi.setFromRotationMatrix(Rn),this.quaternion.premultiply(Xi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Zl),qi.child=e,this.dispatchEvent(qi),qi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(yd),la.child=e,this.dispatchEvent(la),la.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Rn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Rn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Rn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Zl),qi.child=e,this.dispatchEvent(qi),qi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,e,xd),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Er,_d,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),h=o(e.shapes),d=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}xt.DEFAULT_UP=new C(0,1,0),xt.DEFAULT_MATRIX_AUTO_UPDATE=!0,xt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const an=new C,Pn=new C,ca=new C,Ln=new C,Yi=new C,$i=new C,jl=new C,ua=new C,ha=new C,da=new C,fa=new nt,pa=new nt,ma=new nt;class ln{constructor(e=new C,t=new C,n=new C){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),an.subVectors(e,t),r.cross(an);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){an.subVectors(r,t),Pn.subVectors(n,t),ca.subVectors(e,t);const o=an.dot(an),a=an.dot(Pn),l=an.dot(ca),c=Pn.dot(Pn),u=Pn.dot(ca),h=o*c-a*a;if(h===0)return s.set(0,0,0),null;const d=1/h,p=(c*l-a*u)*d,g=(o*u-a*l)*d;return s.set(1-p-g,g,p)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Ln)===null?!1:Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Ln)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Ln.x),l.addScaledVector(o,Ln.y),l.addScaledVector(a,Ln.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return fa.setScalar(0),pa.setScalar(0),ma.setScalar(0),fa.fromBufferAttribute(e,t),pa.fromBufferAttribute(e,n),ma.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(fa,s.x),o.addScaledVector(pa,s.y),o.addScaledVector(ma,s.z),o}static isFrontFacing(e,t,n,r){return an.subVectors(n,t),Pn.subVectors(e,t),an.cross(Pn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return an.subVectors(this.c,this.b),Pn.subVectors(this.a,this.b),an.cross(Pn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return ln.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return ln.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return ln.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return ln.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return ln.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;Yi.subVectors(r,n),$i.subVectors(s,n),ua.subVectors(e,n);const l=Yi.dot(ua),c=$i.dot(ua);if(l<=0&&c<=0)return t.copy(n);ha.subVectors(e,r);const u=Yi.dot(ha),h=$i.dot(ha);if(u>=0&&h<=u)return t.copy(r);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(Yi,o);da.subVectors(e,s);const p=Yi.dot(da),g=$i.dot(da);if(g>=0&&p<=g)return t.copy(s);const x=p*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector($i,a);const m=u*g-p*h;if(m<=0&&h-u>=0&&p-g>=0)return jl.subVectors(s,r),a=(h-u)/(h-u+(p-g)),t.copy(r).addScaledVector(jl,a);const f=1/(m+x+d);return o=x*f,a=d*f,t.copy(n).addScaledVector(Yi,o).addScaledVector($i,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Kl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Xn={h:0,s:0,l:0},ps={h:0,s:0,l:0};function ga(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class xe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Yt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=Xe.workingColorSpace){if(e=Ko(e,1),t=vt(t,0,1),n=vt(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=ga(o,s,e+1/3),this.g=ga(o,s,e),this.b=ga(o,s,e-1/3)}return Xe.toWorkingColorSpace(this,r),this}setStyle(e,t=Yt){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Yt){const n=Kl[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Tn(e.r),this.g=Tn(e.g),this.b=Tn(e.b),this}copyLinearToSRGB(e){return this.r=ki(e.r),this.g=ki(e.g),this.b=ki(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Yt){return Xe.fromWorkingColorSpace(Ct.copy(this),e),Math.round(vt(Ct.r*255,0,255))*65536+Math.round(vt(Ct.g*255,0,255))*256+Math.round(vt(Ct.b*255,0,255))}getHexString(e=Yt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.fromWorkingColorSpace(Ct.copy(this),t);const n=Ct.r,r=Ct.g,s=Ct.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-n)/h+2;break;case s:l=(n-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Xe.workingColorSpace){return Xe.fromWorkingColorSpace(Ct.copy(this),t),e.r=Ct.r,e.g=Ct.g,e.b=Ct.b,e}getStyle(e=Yt){Xe.fromWorkingColorSpace(Ct.copy(this),e);const t=Ct.r,n=Ct.g,r=Ct.b;return e!==Yt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Xn),this.setHSL(Xn.h+e,Xn.s+t,Xn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Xn),e.getHSL(ps);const n=yr(Xn.h,ps.h,t),r=yr(Xn.s,ps.s,t),s=yr(Xn.l,ps.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ct=new xe;xe.NAMES=Kl;let Sd=0;class ci extends Ni{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Sd++}),this.uuid=Fi(),this.name="",this.blending=Ti,this.side=kn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=to,this.blendDst=no,this.blendEquation=ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new xe(0,0,0),this.blendAlpha=0,this.depthFunc=Ai,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Al,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ui,this.stencilZFail=Ui,this.stencilZPass=Ui,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ti&&(n.blending=this.blending),this.side!==kn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==to&&(n.blendSrc=this.blendSrc),this.blendDst!==no&&(n.blendDst=this.blendDst),this.blendEquation!==ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ai&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Al&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ui&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ui&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ui&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class ht extends ci{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new St,this.combine=uo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const mt=new C,ms=new J;class Mt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Rl,this.updateRanges=[],this.gpuType=gn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ms.fromBufferAttribute(this,t),ms.applyMatrix3(e),this.setXY(t,ms.x,ms.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.applyMatrix3(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.applyMatrix4(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.applyNormalMatrix(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)mt.fromBufferAttribute(this,t),mt.transformDirection(e),this.setXYZ(t,mt.x,mt.y,mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Oi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ut(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Oi(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Oi(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Oi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Oi(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ut(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),n=Ut(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),n=Ut(n,this.array),r=Ut(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=Ut(t,this.array),n=Ut(n,this.array),r=Ut(r,this.array),s=Ut(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Rl&&(e.usage=this.usage),e}}class Jl extends Mt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Ql extends Mt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class je extends Mt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let Md=0;const $t=new Qe,va=new xt,Zi=new C,Vt=new oi,Tr=new oi,wt=new C;class bt extends Ni{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Md++}),this.uuid=Fi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Dl(e)?Ql:Jl)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new De().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return $t.makeRotationFromQuaternion(e),this.applyMatrix4($t),this}rotateX(e){return $t.makeRotationX(e),this.applyMatrix4($t),this}rotateY(e){return $t.makeRotationY(e),this.applyMatrix4($t),this}rotateZ(e){return $t.makeRotationZ(e),this.applyMatrix4($t),this}translate(e,t,n){return $t.makeTranslation(e,t,n),this.applyMatrix4($t),this}scale(e,t,n){return $t.makeScale(e,t,n),this.applyMatrix4($t),this}lookAt(e){return va.lookAt(e),va.updateMatrix(),this.applyMatrix4(va.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Zi).negate(),this.translate(Zi.x,Zi.y,Zi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new je(n,3))}else{for(let n=0,r=t.count;n<r;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];Vt.setFromBufferAttribute(s),this.morphTargetsRelative?(wt.addVectors(this.boundingBox.min,Vt.min),this.boundingBox.expandByPoint(wt),wt.addVectors(this.boundingBox.max,Vt.max),this.boundingBox.expandByPoint(wt)):(this.boundingBox.expandByPoint(Vt.min),this.boundingBox.expandByPoint(Vt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(e){const n=this.boundingSphere.center;if(Vt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Tr.setFromBufferAttribute(a),this.morphTargetsRelative?(wt.addVectors(Vt.min,Tr.min),Vt.expandByPoint(wt),wt.addVectors(Vt.max,Tr.max),Vt.expandByPoint(wt)):(Vt.expandByPoint(Tr.min),Vt.expandByPoint(Tr.max))}Vt.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)wt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(wt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)wt.fromBufferAttribute(a,c),l&&(Zi.fromBufferAttribute(e,c),wt.add(Zi)),r=Math.max(r,n.distanceToSquared(wt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Mt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let R=0;R<n.count;R++)a[R]=new C,l[R]=new C;const c=new C,u=new C,h=new C,d=new J,p=new J,g=new J,x=new C,m=new C;function f(R,S,_){c.fromBufferAttribute(n,R),u.fromBufferAttribute(n,S),h.fromBufferAttribute(n,_),d.fromBufferAttribute(s,R),p.fromBufferAttribute(s,S),g.fromBufferAttribute(s,_),u.sub(c),h.sub(c),p.sub(d),g.sub(d);const P=1/(p.x*g.y-g.x*p.y);isFinite(P)&&(x.copy(u).multiplyScalar(g.y).addScaledVector(h,-p.y).multiplyScalar(P),m.copy(h).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(P),a[R].add(x),a[S].add(x),a[_].add(x),l[R].add(m),l[S].add(m),l[_].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let R=0,S=b.length;R<S;++R){const _=b[R],P=_.start,F=_.count;for(let k=P,H=P+F;k<H;k+=3)f(e.getX(k+0),e.getX(k+1),e.getX(k+2))}const w=new C,v=new C,L=new C,E=new C;function A(R){L.fromBufferAttribute(r,R),E.copy(L);const S=a[R];w.copy(S),w.sub(L.multiplyScalar(L.dot(S))).normalize(),v.crossVectors(E,S);const P=v.dot(l[R])<0?-1:1;o.setXYZW(R,w.x,w.y,w.z,P)}for(let R=0,S=b.length;R<S;++R){const _=b[R],P=_.start,F=_.count;for(let k=P,H=P+F;k<H;k+=3)A(e.getX(k+0)),A(e.getX(k+1)),A(e.getX(k+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Mt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const r=new C,s=new C,o=new C,a=new C,l=new C,c=new C,u=new C,h=new C;if(e)for(let d=0,p=e.count;d<p;d+=3){const g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)r.fromBufferAttribute(t,d+0),s.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),u.subVectors(o,s),h.subVectors(r,s),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)wt.fromBufferAttribute(e,t),wt.normalize(),e.setXYZ(t,wt.x,wt.y,wt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u);let p=0,g=0;for(let x=0,m=l.length;x<m;x++){a.isInterleavedBufferAttribute?p=l[x]*a.data.stride+a.offset:p=l[x]*u;for(let f=0;f<u;f++)d[g++]=c[p++]}return new Mt(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new bt,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let u=0,h=c.length;u<h;u++){const d=c[u],p=e(d,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const p=c[h];u.push(p.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],h=s[c];for(let d=0,p=h.length;d<p;d++)u.push(h[d].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ec=new Qe,ui=new oa,gs=new Vi,tc=new C,vs=new C,xs=new C,_s=new C,xa=new C,ys=new C,nc=new C,Ss=new C;class ie extends xt{constructor(e=new bt,t=new ht){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){ys.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=a[l],h=s[l];u!==0&&(xa.fromBufferAttribute(h,e),o?ys.addScaledVector(xa,u):ys.addScaledVector(xa.sub(t),u))}t.add(ys)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),gs.copy(n.boundingSphere),gs.applyMatrix4(s),ui.copy(e.ray).recast(e.near),!(gs.containsPoint(ui.origin)===!1&&(ui.intersectSphere(gs,tc)===null||ui.origin.distanceToSquared(tc)>(e.far-e.near)**2))&&(ec.copy(s).invert(),ui.copy(e.ray).applyMatrix4(ec),!(n.boundingBox!==null&&ui.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ui)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,d=s.groups,p=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){const m=d[g],f=o[m.materialIndex],b=Math.max(m.start,p.start),w=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let v=b,L=w;v<L;v+=3){const E=a.getX(v),A=a.getX(v+1),R=a.getX(v+2);r=Ms(this,f,e,n,c,u,h,E,A,R),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,p.start),x=Math.min(a.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){const b=a.getX(m),w=a.getX(m+1),v=a.getX(m+2);r=Ms(this,o,e,n,c,u,h,b,w,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){const m=d[g],f=o[m.materialIndex],b=Math.max(m.start,p.start),w=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=b,L=w;v<L;v+=3){const E=v,A=v+1,R=v+2;r=Ms(this,f,e,n,c,u,h,E,A,R),r&&(r.faceIndex=Math.floor(v/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,p.start),x=Math.min(l.count,p.start+p.count);for(let m=g,f=x;m<f;m+=3){const b=m,w=m+1,v=m+2;r=Ms(this,o,e,n,c,u,h,b,w,v),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function wd(i,e,t,n,r,s,o,a){let l;if(e.side===Dt?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===kn,a),l===null)return null;Ss.copy(a),Ss.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Ss);return c<t.near||c>t.far?null:{distance:c,point:Ss.clone(),object:i}}function Ms(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,vs),i.getVertexPosition(l,xs),i.getVertexPosition(c,_s);const u=wd(i,e,t,n,vs,xs,_s,nc);if(u){const h=new C;ln.getBarycoord(nc,vs,xs,_s,h),r&&(u.uv=ln.getInterpolatedAttribute(r,a,l,c,h,new J)),s&&(u.uv1=ln.getInterpolatedAttribute(s,a,l,c,h,new J)),o&&(u.normal=ln.getInterpolatedAttribute(o,a,l,c,h,new C),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new C,materialIndex:0};ln.getNormal(vs,xs,_s,d.normal),u.face=d,u.barycoord=h}return u}class Rt extends bt{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],u=[],h=[];let d=0,p=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new je(c,3)),this.setAttribute("normal",new je(u,3)),this.setAttribute("uv",new je(h,2));function g(x,m,f,b,w,v,L,E,A,R,S){const _=v/A,P=L/R,F=v/2,k=L/2,H=E/2,j=A+1,X=R+1;let te=0,W=0;const oe=new C;for(let pe=0;pe<X;pe++){const Ee=pe*P-k;for(let ze=0;ze<j;ze++){const it=ze*_-F;oe[x]=it*b,oe[m]=Ee*w,oe[f]=H,c.push(oe.x,oe.y,oe.z),oe[x]=0,oe[m]=0,oe[f]=E>0?1:-1,u.push(oe.x,oe.y,oe.z),h.push(ze/A),h.push(1-pe/R),te+=1}}for(let pe=0;pe<R;pe++)for(let Ee=0;Ee<A;Ee++){const ze=d+Ee+j*pe,it=d+Ee+j*(pe+1),Y=d+(Ee+1)+j*(pe+1),ne=d+(Ee+1)+j*pe;l.push(ze,it,ne),l.push(it,Y,ne),W+=6}a.addGroup(p,W,S),p+=W,d+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ji(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Ft(i){const e={};for(let t=0;t<i.length;t++){const n=ji(i[t]);for(const r in n)e[r]=n[r]}return e}function bd(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ic(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const ws={clone:ji,merge:Ft};var Ed=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Td=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Et extends ci{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ed,this.fragmentShader=Td,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ji(e.uniforms),this.uniformsGroups=bd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class rc extends xt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qe,this.projectionMatrix=new Qe,this.projectionMatrixInverse=new Qe,this.coordinateSystem=En}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const qn=new C,sc=new J,oc=new J;class Zt extends rc{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=_r*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(xr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return _r*2*Math.atan(Math.tan(xr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(qn.x,qn.y).multiplyScalar(-e/qn.z),qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qn.x,qn.y).multiplyScalar(-e/qn.z)}getViewSize(e,t){return this.getViewBounds(e,sc,oc),t.subVectors(oc,sc)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(xr*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ki=-90,Ji=1;class Ad extends xt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Zt(Ki,Ji,e,t);r.layers=this.layers,this.add(r);const s=new Zt(Ki,Ji,e,t);s.layers=this.layers,this.add(s);const o=new Zt(Ki,Ji,e,t);o.layers=this.layers,this.add(o);const a=new Zt(Ki,Ji,e,t);a.layers=this.layers,this.add(a);const l=new Zt(Ki,Ji,e,t);l.layers=this.layers,this.add(l);const c=new Zt(Ki,Ji,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===En)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ss)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,u]=this.children,h=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(h,d,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class ac extends Nt{constructor(e,t,n,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Ci,super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Cd extends rn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ac(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:mn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Rt(5,5,5),s=new Et({name:"CubemapFromEquirect",uniforms:ji(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Dt,blending:Mn});s.uniforms.tEquirect.value=t;const o=new ie(r,s),a=t.minFilter;return t.minFilter===ri&&(t.minFilter=mn),new Ad(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}const _a=new C,Rd=new C,Pd=new De;class Yn{constructor(e=new C(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=_a.subVectors(n,t).cross(Rd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(_a),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Pd.getNormalMatrix(e),r=this.coplanarPoint(_a).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const hi=new Vi,bs=new C;class ya{constructor(e=new Yn,t=new Yn,n=new Yn,r=new Yn,s=new Yn,o=new Yn){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=En){const n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],h=r[6],d=r[7],p=r[8],g=r[9],x=r[10],m=r[11],f=r[12],b=r[13],w=r[14],v=r[15];if(n[0].setComponents(l-s,d-c,m-p,v-f).normalize(),n[1].setComponents(l+s,d+c,m+p,v+f).normalize(),n[2].setComponents(l+o,d+u,m+g,v+b).normalize(),n[3].setComponents(l-o,d-u,m-g,v-b).normalize(),n[4].setComponents(l-a,d-h,m-x,v-w).normalize(),t===En)n[5].setComponents(l+a,d+h,m+x,v+w).normalize();else if(t===ss)n[5].setComponents(a,h,x,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),hi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),hi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(hi)}intersectsSprite(e){return hi.center.set(0,0,0),hi.radius=.7071067811865476,hi.applyMatrix4(e.matrixWorld),this.intersectsSphere(hi)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(bs.x=r.normal.x>0?e.max.x:e.min.x,bs.y=r.normal.y>0?e.max.y:e.min.y,bs.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(bs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function lc(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Ld(i){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){const u=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,u);else{h.sort((p,g)=>p.start-g.start);let d=0;for(let p=1;p<h.length;p++){const g=h[d],x=h[p];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,h[d]=x)}h.length=d+1;for(let p=0,g=h.length;p<g;p++){const x=h[p];i.bufferSubData(c,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class di extends bt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,h=e/a,d=t/l,p=[],g=[],x=[],m=[];for(let f=0;f<u;f++){const b=f*d-o;for(let w=0;w<c;w++){const v=w*h-s;g.push(v,-b,0),x.push(0,0,1),m.push(w/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let b=0;b<a;b++){const w=b+c*f,v=b+c*(f+1),L=b+1+c*(f+1),E=b+1+c*f;p.push(w,v,E),p.push(v,L,E)}this.setIndex(p),this.setAttribute("position",new je(g,3)),this.setAttribute("normal",new je(x,3)),this.setAttribute("uv",new je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new di(e.width,e.height,e.widthSegments,e.heightSegments)}}var Id=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Dd=`#ifdef USE_ALPHAHASH
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
#endif`,Ud=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Nd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Fd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Od=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,kd=`#ifdef USE_AOMAP
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
#endif`,Bd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,zd=`#ifdef USE_BATCHING
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
#endif`,Gd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Hd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Vd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Wd=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Xd=`#ifdef USE_IRIDESCENCE
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
#endif`,qd=`#ifdef USE_BUMPMAP
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
#endif`,Yd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,$d=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Zd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,jd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Kd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Jd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Qd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,ef=`#if defined( USE_COLOR_ALPHA )
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
#endif`,tf=`#define PI 3.141592653589793
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
} // validated`,nf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,rf=`vec3 transformedNormal = objectNormal;
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
#endif`,sf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,of=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,af=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,lf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,cf="gl_FragColor = linearToOutputTexel( gl_FragColor );",uf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,hf=`#ifdef USE_ENVMAP
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
#endif`,df=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ff=`#ifdef USE_ENVMAP
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
#endif`,pf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,mf=`#ifdef USE_ENVMAP
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
#endif`,gf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,vf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,xf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,_f=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,yf=`#ifdef USE_GRADIENTMAP
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
}`,Sf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Mf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,wf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,bf=`uniform bool receiveShadow;
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
#endif`,Ef=`#ifdef USE_ENVMAP
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
#endif`,Tf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Af=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Rf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Pf=`PhysicalMaterial material;
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
#endif`,Lf=`struct PhysicalMaterial {
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
}`,If=`
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
#endif`,Df=`#if defined( RE_IndirectDiffuse )
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
#endif`,Uf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Nf=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ff=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Of=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,kf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Bf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,zf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Gf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Hf=`#if defined( USE_POINTS_UV )
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
#endif`,Vf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Wf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Xf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,qf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Yf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$f=`#ifdef USE_MORPHTARGETS
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
#endif`,Zf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,jf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Kf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Jf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ep=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,tp=`#ifdef USE_NORMALMAP
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
#endif`,np=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ip=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,rp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,sp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,op=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ap=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,lp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,cp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,up=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,hp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,dp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,fp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,pp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,mp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,gp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,vp=`float getShadowMask() {
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
}`,xp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,_p=`#ifdef USE_SKINNING
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
#endif`,yp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Sp=`#ifdef USE_SKINNING
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
#endif`,Mp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,wp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,bp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ep=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Tp=`#ifdef USE_TRANSMISSION
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
#endif`,Ap=`#ifdef USE_TRANSMISSION
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
#endif`,Cp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Rp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Pp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Lp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Oe={alphahash_fragment:Id,alphahash_pars_fragment:Dd,alphamap_fragment:Ud,alphamap_pars_fragment:Nd,alphatest_fragment:Fd,alphatest_pars_fragment:Od,aomap_fragment:kd,aomap_pars_fragment:Bd,batching_pars_vertex:zd,batching_vertex:Gd,begin_vertex:Hd,beginnormal_vertex:Vd,bsdfs:Wd,iridescence_fragment:Xd,bumpmap_pars_fragment:qd,clipping_planes_fragment:Yd,clipping_planes_pars_fragment:$d,clipping_planes_pars_vertex:Zd,clipping_planes_vertex:jd,color_fragment:Kd,color_pars_fragment:Jd,color_pars_vertex:Qd,color_vertex:ef,common:tf,cube_uv_reflection_fragment:nf,defaultnormal_vertex:rf,displacementmap_pars_vertex:sf,displacementmap_vertex:of,emissivemap_fragment:af,emissivemap_pars_fragment:lf,colorspace_fragment:cf,colorspace_pars_fragment:uf,envmap_fragment:hf,envmap_common_pars_fragment:df,envmap_pars_fragment:ff,envmap_pars_vertex:pf,envmap_physical_pars_fragment:Ef,envmap_vertex:mf,fog_vertex:gf,fog_pars_vertex:vf,fog_fragment:xf,fog_pars_fragment:_f,gradientmap_pars_fragment:yf,lightmap_pars_fragment:Sf,lights_lambert_fragment:Mf,lights_lambert_pars_fragment:wf,lights_pars_begin:bf,lights_toon_fragment:Tf,lights_toon_pars_fragment:Af,lights_phong_fragment:Cf,lights_phong_pars_fragment:Rf,lights_physical_fragment:Pf,lights_physical_pars_fragment:Lf,lights_fragment_begin:If,lights_fragment_maps:Df,lights_fragment_end:Uf,logdepthbuf_fragment:Nf,logdepthbuf_pars_fragment:Ff,logdepthbuf_pars_vertex:Of,logdepthbuf_vertex:kf,map_fragment:Bf,map_pars_fragment:zf,map_particle_fragment:Gf,map_particle_pars_fragment:Hf,metalnessmap_fragment:Vf,metalnessmap_pars_fragment:Wf,morphinstance_vertex:Xf,morphcolor_vertex:qf,morphnormal_vertex:Yf,morphtarget_pars_vertex:$f,morphtarget_vertex:Zf,normal_fragment_begin:jf,normal_fragment_maps:Kf,normal_pars_fragment:Jf,normal_pars_vertex:Qf,normal_vertex:ep,normalmap_pars_fragment:tp,clearcoat_normal_fragment_begin:np,clearcoat_normal_fragment_maps:ip,clearcoat_pars_fragment:rp,iridescence_pars_fragment:sp,opaque_fragment:op,packing:ap,premultiplied_alpha_fragment:lp,project_vertex:cp,dithering_fragment:up,dithering_pars_fragment:hp,roughnessmap_fragment:dp,roughnessmap_pars_fragment:fp,shadowmap_pars_fragment:pp,shadowmap_pars_vertex:mp,shadowmap_vertex:gp,shadowmask_pars_fragment:vp,skinbase_vertex:xp,skinning_pars_vertex:_p,skinning_vertex:yp,skinnormal_vertex:Sp,specularmap_fragment:Mp,specularmap_pars_fragment:wp,tonemapping_fragment:bp,tonemapping_pars_fragment:Ep,transmission_fragment:Tp,transmission_pars_fragment:Ap,uv_pars_fragment:Cp,uv_pars_vertex:Rp,uv_vertex:Pp,worldpos_vertex:Lp,background_vert:`varying vec2 vUv;
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
}`},re={common:{diffuse:{value:new xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new De}},envmap:{envMap:{value:null},envMapRotation:{value:new De},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new De}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new De}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new De},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new De},normalScale:{value:new J(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new De},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new De}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new De}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new De}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0},uvTransform:{value:new De}},sprite:{diffuse:{value:new xe(16777215)},opacity:{value:1},center:{value:new J(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}}},vn={basic:{uniforms:Ft([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:Oe.meshbasic_vert,fragmentShader:Oe.meshbasic_frag},lambert:{uniforms:Ft([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new xe(0)}}]),vertexShader:Oe.meshlambert_vert,fragmentShader:Oe.meshlambert_frag},phong:{uniforms:Ft([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new xe(0)},specular:{value:new xe(1118481)},shininess:{value:30}}]),vertexShader:Oe.meshphong_vert,fragmentShader:Oe.meshphong_frag},standard:{uniforms:Ft([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag},toon:{uniforms:Ft([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new xe(0)}}]),vertexShader:Oe.meshtoon_vert,fragmentShader:Oe.meshtoon_frag},matcap:{uniforms:Ft([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:Oe.meshmatcap_vert,fragmentShader:Oe.meshmatcap_frag},points:{uniforms:Ft([re.points,re.fog]),vertexShader:Oe.points_vert,fragmentShader:Oe.points_frag},dashed:{uniforms:Ft([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Oe.linedashed_vert,fragmentShader:Oe.linedashed_frag},depth:{uniforms:Ft([re.common,re.displacementmap]),vertexShader:Oe.depth_vert,fragmentShader:Oe.depth_frag},normal:{uniforms:Ft([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:Oe.meshnormal_vert,fragmentShader:Oe.meshnormal_frag},sprite:{uniforms:Ft([re.sprite,re.fog]),vertexShader:Oe.sprite_vert,fragmentShader:Oe.sprite_frag},background:{uniforms:{uvTransform:{value:new De},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Oe.background_vert,fragmentShader:Oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new De}},vertexShader:Oe.backgroundCube_vert,fragmentShader:Oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Oe.cube_vert,fragmentShader:Oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Oe.equirect_vert,fragmentShader:Oe.equirect_frag},distanceRGBA:{uniforms:Ft([re.common,re.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Oe.distanceRGBA_vert,fragmentShader:Oe.distanceRGBA_frag},shadow:{uniforms:Ft([re.lights,re.fog,{color:{value:new xe(0)},opacity:{value:1}}]),vertexShader:Oe.shadow_vert,fragmentShader:Oe.shadow_frag}};vn.physical={uniforms:Ft([vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new De},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new De},clearcoatNormalScale:{value:new J(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new De},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new De},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new De},sheen:{value:0},sheenColor:{value:new xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new De},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new De},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new De},transmissionSamplerSize:{value:new J},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new De},attenuationDistance:{value:0},attenuationColor:{value:new xe(0)},specularColor:{value:new xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new De},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new De},anisotropyVector:{value:new J},anisotropyMap:{value:null},anisotropyMapTransform:{value:new De}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag};const Es={r:0,b:0,g:0},fi=new St,Ip=new Qe;function Dp(i,e,t,n,r,s,o){const a=new xe(0);let l=s===!0?0:1,c,u,h=null,d=0,p=null;function g(b){let w=b.isScene===!0?b.background:null;return w&&w.isTexture&&(w=(b.backgroundBlurriness>0?t:e).get(w)),w}function x(b){let w=!1;const v=g(b);v===null?f(a,l):v&&v.isColor&&(f(v,1),w=!0);const L=i.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,o):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||w)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(b,w){const v=g(w);v&&(v.isCubeTexture||v.mapping===Kr)?(u===void 0&&(u=new ie(new Rt(1,1,1),new Et({name:"BackgroundCubeMaterial",uniforms:ji(vn.backgroundCube.uniforms),vertexShader:vn.backgroundCube.vertexShader,fragmentShader:vn.backgroundCube.fragmentShader,side:Dt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(L,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),fi.copy(w.backgroundRotation),fi.x*=-1,fi.y*=-1,fi.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(fi.y*=-1,fi.z*=-1),u.material.uniforms.envMap.value=v,u.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Ip.makeRotationFromEuler(fi)),u.material.toneMapped=Xe.getTransfer(v.colorSpace)!==tt,(h!==v||d!==v.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,h=v,d=v.version,p=i.toneMapping),u.layers.enableAll(),b.unshift(u,u.geometry,u.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new ie(new di(2,2),new Et({name:"BackgroundMaterial",uniforms:ji(vn.background.uniforms),vertexShader:vn.background.vertexShader,fragmentShader:vn.background.fragmentShader,side:kn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(v.colorSpace)!==tt,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||d!==v.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,h=v,d=v.version,p=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function f(b,w){b.getRGB(Es,ic(i)),n.buffers.color.setClear(Es.r,Es.g,Es.b,w,o)}return{getClearColor:function(){return a},setClearColor:function(b,w=1){a.set(b),l=w,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,f(a,l)},render:x,addToRenderList:m}}function Up(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=d(null);let s=r,o=!1;function a(_,P,F,k,H){let j=!1;const X=h(k,F,P);s!==X&&(s=X,c(s.object)),j=p(_,k,F,H),j&&g(_,k,F,H),H!==null&&e.update(H,i.ELEMENT_ARRAY_BUFFER),(j||o)&&(o=!1,v(_,P,F,k),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return i.createVertexArray()}function c(_){return i.bindVertexArray(_)}function u(_){return i.deleteVertexArray(_)}function h(_,P,F){const k=F.wireframe===!0;let H=n[_.id];H===void 0&&(H={},n[_.id]=H);let j=H[P.id];j===void 0&&(j={},H[P.id]=j);let X=j[k];return X===void 0&&(X=d(l()),j[k]=X),X}function d(_){const P=[],F=[],k=[];for(let H=0;H<t;H++)P[H]=0,F[H]=0,k[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:F,attributeDivisors:k,object:_,attributes:{},index:null}}function p(_,P,F,k){const H=s.attributes,j=P.attributes;let X=0;const te=F.getAttributes();for(const W in te)if(te[W].location>=0){const pe=H[W];let Ee=j[W];if(Ee===void 0&&(W==="instanceMatrix"&&_.instanceMatrix&&(Ee=_.instanceMatrix),W==="instanceColor"&&_.instanceColor&&(Ee=_.instanceColor)),pe===void 0||pe.attribute!==Ee||Ee&&pe.data!==Ee.data)return!0;X++}return s.attributesNum!==X||s.index!==k}function g(_,P,F,k){const H={},j=P.attributes;let X=0;const te=F.getAttributes();for(const W in te)if(te[W].location>=0){let pe=j[W];pe===void 0&&(W==="instanceMatrix"&&_.instanceMatrix&&(pe=_.instanceMatrix),W==="instanceColor"&&_.instanceColor&&(pe=_.instanceColor));const Ee={};Ee.attribute=pe,pe&&pe.data&&(Ee.data=pe.data),H[W]=Ee,X++}s.attributes=H,s.attributesNum=X,s.index=k}function x(){const _=s.newAttributes;for(let P=0,F=_.length;P<F;P++)_[P]=0}function m(_){f(_,0)}function f(_,P){const F=s.newAttributes,k=s.enabledAttributes,H=s.attributeDivisors;F[_]=1,k[_]===0&&(i.enableVertexAttribArray(_),k[_]=1),H[_]!==P&&(i.vertexAttribDivisor(_,P),H[_]=P)}function b(){const _=s.newAttributes,P=s.enabledAttributes;for(let F=0,k=P.length;F<k;F++)P[F]!==_[F]&&(i.disableVertexAttribArray(F),P[F]=0)}function w(_,P,F,k,H,j,X){X===!0?i.vertexAttribIPointer(_,P,F,H,j):i.vertexAttribPointer(_,P,F,k,H,j)}function v(_,P,F,k){x();const H=k.attributes,j=F.getAttributes(),X=P.defaultAttributeValues;for(const te in j){const W=j[te];if(W.location>=0){let oe=H[te];if(oe===void 0&&(te==="instanceMatrix"&&_.instanceMatrix&&(oe=_.instanceMatrix),te==="instanceColor"&&_.instanceColor&&(oe=_.instanceColor)),oe!==void 0){const pe=oe.normalized,Ee=oe.itemSize,ze=e.get(oe);if(ze===void 0)continue;const it=ze.buffer,Y=ze.type,ne=ze.bytesPerElement,Me=Y===i.INT||Y===i.UNSIGNED_INT||oe.gpuType===vo;if(oe.isInterleavedBufferAttribute){const ae=oe.data,Re=ae.stride,Ie=oe.offset;if(ae.isInstancedInterleavedBuffer){for(let Ge=0;Ge<W.locationSize;Ge++)f(W.location+Ge,ae.meshPerAttribute);_.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let Ge=0;Ge<W.locationSize;Ge++)m(W.location+Ge);i.bindBuffer(i.ARRAY_BUFFER,it);for(let Ge=0;Ge<W.locationSize;Ge++)w(W.location+Ge,Ee/W.locationSize,Y,pe,Re*ne,(Ie+Ee/W.locationSize*Ge)*ne,Me)}else{if(oe.isInstancedBufferAttribute){for(let ae=0;ae<W.locationSize;ae++)f(W.location+ae,oe.meshPerAttribute);_.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let ae=0;ae<W.locationSize;ae++)m(W.location+ae);i.bindBuffer(i.ARRAY_BUFFER,it);for(let ae=0;ae<W.locationSize;ae++)w(W.location+ae,Ee/W.locationSize,Y,pe,Ee*ne,Ee/W.locationSize*ae*ne,Me)}}else if(X!==void 0){const pe=X[te];if(pe!==void 0)switch(pe.length){case 2:i.vertexAttrib2fv(W.location,pe);break;case 3:i.vertexAttrib3fv(W.location,pe);break;case 4:i.vertexAttrib4fv(W.location,pe);break;default:i.vertexAttrib1fv(W.location,pe)}}}}b()}function L(){R();for(const _ in n){const P=n[_];for(const F in P){const k=P[F];for(const H in k)u(k[H].object),delete k[H];delete P[F]}delete n[_]}}function E(_){if(n[_.id]===void 0)return;const P=n[_.id];for(const F in P){const k=P[F];for(const H in k)u(k[H].object),delete k[H];delete P[F]}delete n[_.id]}function A(_){for(const P in n){const F=n[P];if(F[_.id]===void 0)continue;const k=F[_.id];for(const H in k)u(k[H].object),delete k[H];delete F[_.id]}}function R(){S(),o=!0,s!==r&&(s=r,c(s.object))}function S(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:R,resetDefaultState:S,dispose:L,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:x,enableAttribute:m,disableUnusedAttributes:b}}function Np(i,e,t){let n;function r(c){n=c}function s(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),t.update(u,n,h))}function a(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let p=0;for(let g=0;g<h;g++)p+=u[g];t.update(p,n,1)}function l(c,u,h,d){if(h===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let x=0;x<h;x++)g+=u[x]*d[x];t.update(g,n,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Fp(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(A){return!(A!==nn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const R=A===bn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==wn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==gn&&!R)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=t.logarithmicDepthBuffer===!0,d=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),L=g>0,E=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:d,maxTextures:p,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:b,maxVaryings:w,maxFragmentUniforms:v,vertexTextures:L,maxSamples:E}}function Op(i){const e=this;let t=null,n=0,r=!1,s=!1;const o=new Yn,a=new De,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const p=h.length!==0||d||n!==0||r;return r=d,n=h.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,d){t=u(h,d,0)},this.setState=function(h,d,p){const g=h.clippingPlanes,x=h.clipIntersection,m=h.clipShadows,f=i.get(h);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{const b=s?0:n,w=b*4;let v=f.clippingState||null;l.value=v,v=u(g,d,w,p);for(let L=0;L!==w;++L)v[L]=t[L];f.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(h,d,p,g){const x=h!==null?h.length:0;let m=null;if(x!==0){if(m=l.value,g!==!0||m===null){const f=p+x*4,b=d.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<f)&&(m=new Float32Array(f));for(let w=0,v=p;w!==x;++w,v+=4)o.copy(h[w]).applyMatrix4(b,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function kp(i){let e=new WeakMap;function t(o,a){return a===ho?o.mapping=Ci:a===fo&&(o.mapping=Ri),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===ho||a===fo)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Cd(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class Ts extends rc{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Qi=4,cc=[.125,.215,.35,.446,.526,.582],pi=20,Sa=new Ts,uc=new xe;let Ma=null,wa=0,ba=0,Ea=!1;const mi=(1+Math.sqrt(5))/2,er=1/mi,hc=[new C(-mi,er,0),new C(mi,er,0),new C(-er,0,mi),new C(er,0,mi),new C(0,mi,-er),new C(0,mi,er),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)];class dc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Ma=this._renderer.getRenderTarget(),wa=this._renderer.getActiveCubeFace(),ba=this._renderer.getActiveMipmapLevel(),Ea=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=mc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ma,wa,ba),this._renderer.xr.enabled=Ea,e.scissorTest=!1,As(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ci||e.mapping===Ri?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ma=this._renderer.getRenderTarget(),wa=this._renderer.getActiveCubeFace(),ba=this._renderer.getActiveMipmapLevel(),Ea=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:mn,minFilter:mn,generateMipmaps:!1,type:bn,format:nn,colorSpace:Di,depthBuffer:!1},r=fc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=fc(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Bp(s)),this._blurMaterial=zp(s,e,t)}return r}_compileMaterial(e){const t=new ie(this._lodPlanes[0],e);this._renderer.compile(t,Sa)}_sceneToCubeUV(e,t,n,r){const a=new Zt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,d=u.toneMapping;u.getClearColor(uc),u.toneMapping=Bn,u.autoClear=!1;const p=new ht({name:"PMREM.Background",side:Dt,depthWrite:!1,depthTest:!1}),g=new ie(new Rt,p);let x=!1;const m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,x=!0):(p.color.copy(uc),x=!0);for(let f=0;f<6;f++){const b=f%3;b===0?(a.up.set(0,l[f],0),a.lookAt(c[f],0,0)):b===1?(a.up.set(0,0,l[f]),a.lookAt(0,c[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,c[f]));const w=this._cubeSize;As(r,b*w,f>2?w:0,w,w),u.setRenderTarget(r),x&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=d,u.autoClear=h,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===Ci||e.mapping===Ri;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=mc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pc());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new ie(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;As(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Sa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=hc[(r-s-1)%hc.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new ie(this._lodPlanes[r],c),d=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*pi-1),x=s/g,m=isFinite(s)?1+Math.floor(u*x):pi;m>pi&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${pi}`);const f=[];let b=0;for(let A=0;A<pi;++A){const R=A/x,S=Math.exp(-R*R/2);f.push(S),A===0?b+=S:A<m&&(b+=2*S)}for(let A=0;A<f.length;A++)f[A]=f[A]/b;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=f,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:w}=this;d.dTheta.value=g,d.mipInt.value=w-n;const v=this._sizeLods[r],L=3*v*(r>w-Qi?r-w+Qi:0),E=4*(this._cubeSize-v);As(t,L,E,3*v,2*v),l.setRenderTarget(t),l.render(h,Sa)}}function Bp(i){const e=[],t=[],n=[];let r=i;const s=i-Qi+1+cc.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>i-Qi?l=cc[o-i+Qi-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,g=6,x=3,m=2,f=1,b=new Float32Array(x*g*p),w=new Float32Array(m*g*p),v=new Float32Array(f*g*p);for(let E=0;E<p;E++){const A=E%3*2/3-1,R=E>2?0:-1,S=[A,R,0,A+2/3,R,0,A+2/3,R+1,0,A,R,0,A+2/3,R+1,0,A,R+1,0];b.set(S,x*g*E),w.set(d,m*g*E);const _=[E,E,E,E,E,E];v.set(_,f*g*E)}const L=new bt;L.setAttribute("position",new Mt(b,x)),L.setAttribute("uv",new Mt(w,m)),L.setAttribute("faceIndex",new Mt(v,f)),e.push(L),r>Qi&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function fc(i,e,t){const n=new rn(i,e,t);return n.texture.mapping=Kr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function As(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function zp(i,e,t){const n=new Float32Array(pi),r=new C(0,1,0);return new Et({name:"SphericalGaussianBlur",defines:{n:pi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Ta(),fragmentShader:`

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
		`,blending:Mn,depthTest:!1,depthWrite:!1})}function pc(){return new Et({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ta(),fragmentShader:`

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
		`,blending:Mn,depthTest:!1,depthWrite:!1})}function mc(){return new Et({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ta(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Mn,depthTest:!1,depthWrite:!1})}function Ta(){return`

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
	`}function Gp(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===ho||l===fo,u=l===Ci||l===Ri;if(c||u){let h=e.get(a);const d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new dc(i)),h=c?t.fromEquirectangular(a,h):t.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),h.texture;if(h!==void 0)return h.texture;{const p=a.image;return c&&p&&p.height>0||u&&p&&r(p)?(t===null&&(t=new dc(i)),h=c?t.fromEquirectangular(a):t.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,e.set(a,h),a.addEventListener("dispose",s),h.texture):null}}}return a}function r(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Hp(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&Sr("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function Vp(i,e,t,n){const r={},s=new WeakMap;function o(h){const d=h.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);for(const g in d.morphAttributes){const x=d.morphAttributes[g];for(let m=0,f=x.length;m<f;m++)e.remove(x[m])}d.removeEventListener("dispose",o),delete r[d.id];const p=s.get(d);p&&(e.remove(p),s.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(h,d){return r[d.id]===!0||(d.addEventListener("dispose",o),r[d.id]=!0,t.memory.geometries++),d}function l(h){const d=h.attributes;for(const g in d)e.update(d[g],i.ARRAY_BUFFER);const p=h.morphAttributes;for(const g in p){const x=p[g];for(let m=0,f=x.length;m<f;m++)e.update(x[m],i.ARRAY_BUFFER)}}function c(h){const d=[],p=h.index,g=h.attributes.position;let x=0;if(p!==null){const b=p.array;x=p.version;for(let w=0,v=b.length;w<v;w+=3){const L=b[w+0],E=b[w+1],A=b[w+2];d.push(L,E,E,A,A,L)}}else if(g!==void 0){const b=g.array;x=g.version;for(let w=0,v=b.length/3-1;w<v;w+=3){const L=w+0,E=w+1,A=w+2;d.push(L,E,E,A,A,L)}}else return;const m=new(Dl(d)?Ql:Jl)(d,1);m.version=x;const f=s.get(h);f&&e.remove(f),s.set(h,m)}function u(h){const d=s.get(h);if(d){const p=h.index;p!==null&&d.version<p.version&&c(h)}else c(h);return s.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function Wp(i,e,t){let n;function r(d){n=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function l(d,p){i.drawElements(n,p,s,d*o),t.update(p,n,1)}function c(d,p,g){g!==0&&(i.drawElementsInstanced(n,p,s,d*o,g),t.update(p,n,g))}function u(d,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,s,d,0,g);let m=0;for(let f=0;f<g;f++)m+=p[f];t.update(m,n,1)}function h(d,p,g,x){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<d.length;f++)c(d[f]/o,p[f],x[f]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,s,d,0,x,0,g);let f=0;for(let b=0;b<g;b++)f+=p[b]*x[b];t.update(f,n,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function Xp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function qp(i,e,t){const n=new WeakMap,r=new nt;function s(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(a);if(d===void 0||d.count!==h){let S=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",S)};d!==void 0&&d.texture.dispose();const p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],b=a.morphAttributes.color||[];let w=0;p===!0&&(w=1),g===!0&&(w=2),x===!0&&(w=3);let v=a.attributes.position.count*w,L=1;v>e.maxTextureSize&&(L=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);const E=new Float32Array(v*L*4*h),A=new Gl(E,v,L,h);A.type=gn,A.needsUpdate=!0;const R=w*4;for(let _=0;_<h;_++){const P=m[_],F=f[_],k=b[_],H=v*L*4*_;for(let j=0;j<P.count;j++){const X=j*R;p===!0&&(r.fromBufferAttribute(P,j),E[H+X+0]=r.x,E[H+X+1]=r.y,E[H+X+2]=r.z,E[H+X+3]=0),g===!0&&(r.fromBufferAttribute(F,j),E[H+X+4]=r.x,E[H+X+5]=r.y,E[H+X+6]=r.z,E[H+X+7]=0),x===!0&&(r.fromBufferAttribute(k,j),E[H+X+8]=r.x,E[H+X+9]=r.y,E[H+X+10]=r.z,E[H+X+11]=k.itemSize===4?r.w:1)}}d={count:h,texture:A,size:new J(v,L)},n.set(a,d),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let x=0;x<c.length;x++)p+=c[x];const g=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:s}}function Yp(i,e,t,n){let r=new WeakMap;function s(l){const c=n.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;r.get(d)!==c&&(d.update(),r.set(d,c))}return h}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class gc extends Nt{constructor(e,t,n,r,s,o,a,l,c,u=Li){if(u!==Li&&u!==Ii)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===Li&&(n=si),n===void 0&&u===Ii&&(n=Pi),super(null,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Gt,this.minFilter=l!==void 0?l:Gt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const vc=new Nt,xc=new gc(1,1),_c=new Gl,yc=new fd,Sc=new ac,Mc=[],wc=[],bc=new Float32Array(16),Ec=new Float32Array(9),Tc=new Float32Array(4);function tr(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=Mc[r];if(s===void 0&&(s=new Float32Array(r),Mc[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function _t(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function yt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Cs(i,e){let t=wc[e];t===void 0&&(t=new Int32Array(e),wc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function $p(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Zp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(_t(t,e))return;i.uniform2fv(this.addr,e),yt(t,e)}}function jp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(_t(t,e))return;i.uniform3fv(this.addr,e),yt(t,e)}}function Kp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(_t(t,e))return;i.uniform4fv(this.addr,e),yt(t,e)}}function Jp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(_t(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),yt(t,e)}else{if(_t(t,n))return;Tc.set(n),i.uniformMatrix2fv(this.addr,!1,Tc),yt(t,n)}}function Qp(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(_t(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),yt(t,e)}else{if(_t(t,n))return;Ec.set(n),i.uniformMatrix3fv(this.addr,!1,Ec),yt(t,n)}}function em(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(_t(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),yt(t,e)}else{if(_t(t,n))return;bc.set(n),i.uniformMatrix4fv(this.addr,!1,bc),yt(t,n)}}function tm(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function nm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(_t(t,e))return;i.uniform2iv(this.addr,e),yt(t,e)}}function im(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(_t(t,e))return;i.uniform3iv(this.addr,e),yt(t,e)}}function rm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(_t(t,e))return;i.uniform4iv(this.addr,e),yt(t,e)}}function sm(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function om(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(_t(t,e))return;i.uniform2uiv(this.addr,e),yt(t,e)}}function am(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(_t(t,e))return;i.uniform3uiv(this.addr,e),yt(t,e)}}function lm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(_t(t,e))return;i.uniform4uiv(this.addr,e),yt(t,e)}}function cm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(xc.compareFunction=Cl,s=xc):s=vc,t.setTexture2D(e||s,r)}function um(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||yc,r)}function hm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Sc,r)}function dm(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||_c,r)}function fm(i){switch(i){case 5126:return $p;case 35664:return Zp;case 35665:return jp;case 35666:return Kp;case 35674:return Jp;case 35675:return Qp;case 35676:return em;case 5124:case 35670:return tm;case 35667:case 35671:return nm;case 35668:case 35672:return im;case 35669:case 35673:return rm;case 5125:return sm;case 36294:return om;case 36295:return am;case 36296:return lm;case 35678:case 36198:case 36298:case 36306:case 35682:return cm;case 35679:case 36299:case 36307:return um;case 35680:case 36300:case 36308:case 36293:return hm;case 36289:case 36303:case 36311:case 36292:return dm}}function pm(i,e){i.uniform1fv(this.addr,e)}function mm(i,e){const t=tr(e,this.size,2);i.uniform2fv(this.addr,t)}function gm(i,e){const t=tr(e,this.size,3);i.uniform3fv(this.addr,t)}function vm(i,e){const t=tr(e,this.size,4);i.uniform4fv(this.addr,t)}function xm(i,e){const t=tr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function _m(i,e){const t=tr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function ym(i,e){const t=tr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Sm(i,e){i.uniform1iv(this.addr,e)}function Mm(i,e){i.uniform2iv(this.addr,e)}function wm(i,e){i.uniform3iv(this.addr,e)}function bm(i,e){i.uniform4iv(this.addr,e)}function Em(i,e){i.uniform1uiv(this.addr,e)}function Tm(i,e){i.uniform2uiv(this.addr,e)}function Am(i,e){i.uniform3uiv(this.addr,e)}function Cm(i,e){i.uniform4uiv(this.addr,e)}function Rm(i,e,t){const n=this.cache,r=e.length,s=Cs(t,r);_t(n,s)||(i.uniform1iv(this.addr,s),yt(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||vc,s[o])}function Pm(i,e,t){const n=this.cache,r=e.length,s=Cs(t,r);_t(n,s)||(i.uniform1iv(this.addr,s),yt(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||yc,s[o])}function Lm(i,e,t){const n=this.cache,r=e.length,s=Cs(t,r);_t(n,s)||(i.uniform1iv(this.addr,s),yt(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Sc,s[o])}function Im(i,e,t){const n=this.cache,r=e.length,s=Cs(t,r);_t(n,s)||(i.uniform1iv(this.addr,s),yt(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||_c,s[o])}function Dm(i){switch(i){case 5126:return pm;case 35664:return mm;case 35665:return gm;case 35666:return vm;case 35674:return xm;case 35675:return _m;case 35676:return ym;case 5124:case 35670:return Sm;case 35667:case 35671:return Mm;case 35668:case 35672:return wm;case 35669:case 35673:return bm;case 5125:return Em;case 36294:return Tm;case 36295:return Am;case 36296:return Cm;case 35678:case 36198:case 36298:case 36306:case 35682:return Rm;case 35679:case 36299:case 36307:return Pm;case 35680:case 36300:case 36308:case 36293:return Lm;case 36289:case 36303:case 36311:case 36292:return Im}}class Um{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=fm(t.type)}}class Nm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Dm(t.type)}}class Fm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],n)}}}const Aa=/(\w+)(\])?(\[|\.)?/g;function Ac(i,e){i.seq.push(e),i.map[e.id]=e}function Om(i,e,t){const n=i.name,r=n.length;for(Aa.lastIndex=0;;){const s=Aa.exec(n),o=Aa.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Ac(t,c===void 0?new Um(a,i,e):new Nm(a,i,e));break}else{let h=t.map[a];h===void 0&&(h=new Fm(a),Ac(t,h)),t=h}}}class Rs{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Om(s,o,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&n.push(o)}return n}}function Cc(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const km=37297;let Bm=0;function zm(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const Rc=new De;function Gm(i){Xe._getMatrix(Rc,Xe.workingColorSpace,i);const e=`mat3( ${Rc.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(i)){case rs:return[e,"LinearTransferOETF"];case tt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Pc(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+zm(i.getShaderSource(e),o)}else return r}function Hm(i,e){const t=Gm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Vm(i,e){let t;switch(e){case Th:t="Linear";break;case Ah:t="Reinhard";break;case Ch:t="Cineon";break;case gl:t="ACESFilmic";break;case Ph:t="AgX";break;case Lh:t="Neutral";break;case Rh:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ps=new C;function Wm(){Xe.getLuminanceCoefficients(Ps);const i=Ps.x.toFixed(4),e=Ps.y.toFixed(4),t=Ps.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Xm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ar).join(`
`)}function qm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Ym(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Ar(i){return i!==""}function Lc(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ic(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const $m=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ca(i){return i.replace($m,jm)}const Zm=new Map;function jm(i,e){let t=Oe[e];if(t===void 0){const n=Zm.get(e);if(n!==void 0)t=Oe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ca(t)}const Km=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Dc(i){return i.replace(Km,Jm)}function Jm(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Uc(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function Qm(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===eo?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===sh?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Sn&&(e="SHADOWMAP_TYPE_VSM"),e}function eg(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ci:case Ri:e="ENVMAP_TYPE_CUBE";break;case Kr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function tg(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ri:e="ENVMAP_MODE_REFRACTION";break}return e}function ng(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case uo:e="ENVMAP_BLENDING_MULTIPLY";break;case bh:e="ENVMAP_BLENDING_MIX";break;case Eh:e="ENVMAP_BLENDING_ADD";break}return e}function ig(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function rg(i,e,t,n){const r=i.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Qm(t),c=eg(t),u=tg(t),h=ng(t),d=ig(t),p=Xm(t),g=qm(s),x=r.createProgram();let m,f,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ar).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ar).join(`
`),f.length>0&&(f+=`
`)):(m=[Uc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ar).join(`
`),f=[Uc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Bn?"#define TONE_MAPPING":"",t.toneMapping!==Bn?Oe.tonemapping_pars_fragment:"",t.toneMapping!==Bn?Vm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Oe.colorspace_pars_fragment,Hm("linearToOutputTexel",t.outputColorSpace),Wm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ar).join(`
`)),o=Ca(o),o=Lc(o,t),o=Ic(o,t),a=Ca(a),a=Lc(a,t),a=Ic(a,t),o=Dc(o),a=Dc(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Pl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Pl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const w=b+m+o,v=b+f+a,L=Cc(r,r.VERTEX_SHADER,w),E=Cc(r,r.FRAGMENT_SHADER,v);r.attachShader(x,L),r.attachShader(x,E),t.index0AttributeName!==void 0?r.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(x,0,"position"),r.linkProgram(x);function A(P){if(i.debug.checkShaderErrors){const F=r.getProgramInfoLog(x).trim(),k=r.getShaderInfoLog(L).trim(),H=r.getShaderInfoLog(E).trim();let j=!0,X=!0;if(r.getProgramParameter(x,r.LINK_STATUS)===!1)if(j=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,x,L,E);else{const te=Pc(r,L,"vertex"),W=Pc(r,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(x,r.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+F+`
`+te+`
`+W)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(k===""||H==="")&&(X=!1);X&&(P.diagnostics={runnable:j,programLog:F,vertexShader:{log:k,prefix:m},fragmentShader:{log:H,prefix:f}})}r.deleteShader(L),r.deleteShader(E),R=new Rs(r,x),S=Ym(r,x)}let R;this.getUniforms=function(){return R===void 0&&A(this),R};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=r.getProgramParameter(x,km)),_},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Bm++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=L,this.fragmentShader=E,this}let sg=0;class og{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new ag(e),t.set(e,n)),n}}class ag{constructor(e){this.id=sg++,this.code=e,this.usedTimes=0}}function lg(i,e,t,n,r,s,o){const a=new aa,l=new og,c=new Set,u=[],h=r.logarithmicDepthBuffer,d=r.vertexTextures;let p=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,_,P,F,k){const H=F.fog,j=k.geometry,X=S.isMeshStandardMaterial?F.environment:null,te=(S.isMeshStandardMaterial?t:e).get(S.envMap||X),W=te&&te.mapping===Kr?te.image.height:null,oe=g[S.type];S.precision!==null&&(p=r.getMaxPrecision(S.precision),p!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",p,"instead."));const pe=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Ee=pe!==void 0?pe.length:0;let ze=0;j.morphAttributes.position!==void 0&&(ze=1),j.morphAttributes.normal!==void 0&&(ze=2),j.morphAttributes.color!==void 0&&(ze=3);let it,Y,ne,Me;if(oe){const et=vn[oe];it=et.vertexShader,Y=et.fragmentShader}else it=S.vertexShader,Y=S.fragmentShader,l.update(S),ne=l.getVertexShaderID(S),Me=l.getFragmentShaderID(S);const ae=i.getRenderTarget(),Re=i.state.buffers.depth.getReversed(),Ie=k.isInstancedMesh===!0,Ge=k.isBatchedMesh===!0,ut=!!S.map,Ye=!!S.matcap,pt=!!te,N=!!S.aoMap,Qt=!!S.lightMap,He=!!S.bumpMap,Ve=!!S.normalMap,Ae=!!S.displacementMap,at=!!S.emissiveMap,Te=!!S.metalnessMap,T=!!S.roughnessMap,y=S.anisotropy>0,B=S.clearcoat>0,$=S.dispersion>0,K=S.iridescence>0,q=S.sheen>0,we=S.transmission>0,le=y&&!!S.anisotropyMap,me=B&&!!S.clearcoatMap,$e=B&&!!S.clearcoatNormalMap,Q=B&&!!S.clearcoatRoughnessMap,ge=K&&!!S.iridescenceMap,Ce=K&&!!S.iridescenceThicknessMap,Pe=q&&!!S.sheenColorMap,ve=q&&!!S.sheenRoughnessMap,We=!!S.specularMap,ke=!!S.specularColorMap,st=!!S.specularIntensityMap,I=we&&!!S.transmissionMap,se=we&&!!S.thicknessMap,V=!!S.gradientMap,Z=!!S.alphaMap,de=S.alphaTest>0,ue=!!S.alphaHash,Ne=!!S.extensions;let ft=Bn;S.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(ft=i.toneMapping);const It={shaderID:oe,shaderType:S.type,shaderName:S.name,vertexShader:it,fragmentShader:Y,defines:S.defines,customVertexShaderID:ne,customFragmentShaderID:Me,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:p,batching:Ge,batchingColor:Ge&&k._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&k.instanceColor!==null,instancingMorph:Ie&&k.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ae===null?i.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:Di,alphaToCoverage:!!S.alphaToCoverage,map:ut,matcap:Ye,envMap:pt,envMapMode:pt&&te.mapping,envMapCubeUVHeight:W,aoMap:N,lightMap:Qt,bumpMap:He,normalMap:Ve,displacementMap:d&&Ae,emissiveMap:at,normalMapObjectSpace:Ve&&S.normalMapType===Nh,normalMapTangentSpace:Ve&&S.normalMapType===jo,metalnessMap:Te,roughnessMap:T,anisotropy:y,anisotropyMap:le,clearcoat:B,clearcoatMap:me,clearcoatNormalMap:$e,clearcoatRoughnessMap:Q,dispersion:$,iridescence:K,iridescenceMap:ge,iridescenceThicknessMap:Ce,sheen:q,sheenColorMap:Pe,sheenRoughnessMap:ve,specularMap:We,specularColorMap:ke,specularIntensityMap:st,transmission:we,transmissionMap:I,thicknessMap:se,gradientMap:V,opaque:S.transparent===!1&&S.blending===Ti&&S.alphaToCoverage===!1,alphaMap:Z,alphaTest:de,alphaHash:ue,combine:S.combine,mapUv:ut&&x(S.map.channel),aoMapUv:N&&x(S.aoMap.channel),lightMapUv:Qt&&x(S.lightMap.channel),bumpMapUv:He&&x(S.bumpMap.channel),normalMapUv:Ve&&x(S.normalMap.channel),displacementMapUv:Ae&&x(S.displacementMap.channel),emissiveMapUv:at&&x(S.emissiveMap.channel),metalnessMapUv:Te&&x(S.metalnessMap.channel),roughnessMapUv:T&&x(S.roughnessMap.channel),anisotropyMapUv:le&&x(S.anisotropyMap.channel),clearcoatMapUv:me&&x(S.clearcoatMap.channel),clearcoatNormalMapUv:$e&&x(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&x(S.clearcoatRoughnessMap.channel),iridescenceMapUv:ge&&x(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&x(S.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&x(S.sheenColorMap.channel),sheenRoughnessMapUv:ve&&x(S.sheenRoughnessMap.channel),specularMapUv:We&&x(S.specularMap.channel),specularColorMapUv:ke&&x(S.specularColorMap.channel),specularIntensityMapUv:st&&x(S.specularIntensityMap.channel),transmissionMapUv:I&&x(S.transmissionMap.channel),thicknessMapUv:se&&x(S.thicknessMap.channel),alphaMapUv:Z&&x(S.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(Ve||y),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!j.attributes.uv&&(ut||Z),fog:!!H,useFog:S.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:Re,skinning:k.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:Ee,morphTextureStride:ze,numDirLights:_.directional.length,numPointLights:_.point.length,numSpotLights:_.spot.length,numSpotLightMaps:_.spotLightMap.length,numRectAreaLights:_.rectArea.length,numHemiLights:_.hemi.length,numDirLightShadows:_.directionalShadowMap.length,numPointLightShadows:_.pointShadowMap.length,numSpotLightShadows:_.spotShadowMap.length,numSpotLightShadowsWithMaps:_.numSpotLightShadowsWithMaps,numLightProbes:_.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:ft,decodeVideoTexture:ut&&S.map.isVideoTexture===!0&&Xe.getTransfer(S.map.colorSpace)===tt,decodeVideoTextureEmissive:at&&S.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(S.emissiveMap.colorSpace)===tt,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===gt,flipSided:S.side===Dt,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ne&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ne&&S.extensions.multiDraw===!0||Ge)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return It.vertexUv1s=c.has(1),It.vertexUv2s=c.has(2),It.vertexUv3s=c.has(3),c.clear(),It}function f(S){const _=[];if(S.shaderID?_.push(S.shaderID):(_.push(S.customVertexShaderID),_.push(S.customFragmentShaderID)),S.defines!==void 0)for(const P in S.defines)_.push(P),_.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(b(_,S),w(_,S),_.push(i.outputColorSpace)),_.push(S.customProgramCacheKey),_.join()}function b(S,_){S.push(_.precision),S.push(_.outputColorSpace),S.push(_.envMapMode),S.push(_.envMapCubeUVHeight),S.push(_.mapUv),S.push(_.alphaMapUv),S.push(_.lightMapUv),S.push(_.aoMapUv),S.push(_.bumpMapUv),S.push(_.normalMapUv),S.push(_.displacementMapUv),S.push(_.emissiveMapUv),S.push(_.metalnessMapUv),S.push(_.roughnessMapUv),S.push(_.anisotropyMapUv),S.push(_.clearcoatMapUv),S.push(_.clearcoatNormalMapUv),S.push(_.clearcoatRoughnessMapUv),S.push(_.iridescenceMapUv),S.push(_.iridescenceThicknessMapUv),S.push(_.sheenColorMapUv),S.push(_.sheenRoughnessMapUv),S.push(_.specularMapUv),S.push(_.specularColorMapUv),S.push(_.specularIntensityMapUv),S.push(_.transmissionMapUv),S.push(_.thicknessMapUv),S.push(_.combine),S.push(_.fogExp2),S.push(_.sizeAttenuation),S.push(_.morphTargetsCount),S.push(_.morphAttributeCount),S.push(_.numDirLights),S.push(_.numPointLights),S.push(_.numSpotLights),S.push(_.numSpotLightMaps),S.push(_.numHemiLights),S.push(_.numRectAreaLights),S.push(_.numDirLightShadows),S.push(_.numPointLightShadows),S.push(_.numSpotLightShadows),S.push(_.numSpotLightShadowsWithMaps),S.push(_.numLightProbes),S.push(_.shadowMapType),S.push(_.toneMapping),S.push(_.numClippingPlanes),S.push(_.numClipIntersection),S.push(_.depthPacking)}function w(S,_){a.disableAll(),_.supportsVertexTextures&&a.enable(0),_.instancing&&a.enable(1),_.instancingColor&&a.enable(2),_.instancingMorph&&a.enable(3),_.matcap&&a.enable(4),_.envMap&&a.enable(5),_.normalMapObjectSpace&&a.enable(6),_.normalMapTangentSpace&&a.enable(7),_.clearcoat&&a.enable(8),_.iridescence&&a.enable(9),_.alphaTest&&a.enable(10),_.vertexColors&&a.enable(11),_.vertexAlphas&&a.enable(12),_.vertexUv1s&&a.enable(13),_.vertexUv2s&&a.enable(14),_.vertexUv3s&&a.enable(15),_.vertexTangents&&a.enable(16),_.anisotropy&&a.enable(17),_.alphaHash&&a.enable(18),_.batching&&a.enable(19),_.dispersion&&a.enable(20),_.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),_.fog&&a.enable(0),_.useFog&&a.enable(1),_.flatShading&&a.enable(2),_.logarithmicDepthBuffer&&a.enable(3),_.reverseDepthBuffer&&a.enable(4),_.skinning&&a.enable(5),_.morphTargets&&a.enable(6),_.morphNormals&&a.enable(7),_.morphColors&&a.enable(8),_.premultipliedAlpha&&a.enable(9),_.shadowMapEnabled&&a.enable(10),_.doubleSided&&a.enable(11),_.flipSided&&a.enable(12),_.useDepthPacking&&a.enable(13),_.dithering&&a.enable(14),_.transmission&&a.enable(15),_.sheen&&a.enable(16),_.opaque&&a.enable(17),_.pointsUvs&&a.enable(18),_.decodeVideoTexture&&a.enable(19),_.decodeVideoTextureEmissive&&a.enable(20),_.alphaToCoverage&&a.enable(21),S.push(a.mask)}function v(S){const _=g[S.type];let P;if(_){const F=vn[_];P=ws.clone(F.uniforms)}else P=S.uniforms;return P}function L(S,_){let P;for(let F=0,k=u.length;F<k;F++){const H=u[F];if(H.cacheKey===_){P=H,++P.usedTimes;break}}return P===void 0&&(P=new rg(i,_,S,s),u.push(P)),P}function E(S){if(--S.usedTimes===0){const _=u.indexOf(S);u[_]=u[u.length-1],u.pop(),S.destroy()}}function A(S){l.remove(S)}function R(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:v,acquireProgram:L,releaseProgram:E,releaseShaderCache:A,programs:u,dispose:R}}function cg(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function ug(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Nc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Fc(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(h,d,p,g,x,m){let f=i[e];return f===void 0?(f={id:h.id,object:h,geometry:d,material:p,groupOrder:g,renderOrder:h.renderOrder,z:x,group:m},i[e]=f):(f.id=h.id,f.object=h,f.geometry=d,f.material=p,f.groupOrder=g,f.renderOrder=h.renderOrder,f.z=x,f.group=m),e++,f}function a(h,d,p,g,x,m){const f=o(h,d,p,g,x,m);p.transmission>0?n.push(f):p.transparent===!0?r.push(f):t.push(f)}function l(h,d,p,g,x,m){const f=o(h,d,p,g,x,m);p.transmission>0?n.unshift(f):p.transparent===!0?r.unshift(f):t.unshift(f)}function c(h,d){t.length>1&&t.sort(h||ug),n.length>1&&n.sort(d||Nc),r.length>1&&r.sort(d||Nc)}function u(){for(let h=e,d=i.length;h<d;h++){const p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function hg(){let i=new WeakMap;function e(n,r){const s=i.get(n);let o;return s===void 0?(o=new Fc,i.set(n,[o])):r>=s.length?(o=new Fc,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function dg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new C,color:new xe};break;case"SpotLight":t={position:new C,direction:new C,color:new xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new C,color:new xe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new C,skyColor:new xe,groundColor:new xe};break;case"RectAreaLight":t={color:new xe,position:new C,halfWidth:new C,halfHeight:new C};break}return i[e.id]=t,t}}}function fg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new J,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let pg=0;function mg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function gg(i){const e=new dg,t=fg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new C);const r=new C,s=new Qe,o=new Qe;function a(c){let u=0,h=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let p=0,g=0,x=0,m=0,f=0,b=0,w=0,v=0,L=0,E=0,A=0;c.sort(mg);for(let S=0,_=c.length;S<_;S++){const P=c[S],F=P.color,k=P.intensity,H=P.distance,j=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=F.r*k,h+=F.g*k,d+=F.b*k;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],k);A++}else if(P.isDirectionalLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const te=P.shadow,W=t.get(P);W.shadowIntensity=te.intensity,W.shadowBias=te.bias,W.shadowNormalBias=te.normalBias,W.shadowRadius=te.radius,W.shadowMapSize=te.mapSize,n.directionalShadow[p]=W,n.directionalShadowMap[p]=j,n.directionalShadowMatrix[p]=P.shadow.matrix,b++}n.directional[p]=X,p++}else if(P.isSpotLight){const X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(F).multiplyScalar(k),X.distance=H,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[x]=X;const te=P.shadow;if(P.map&&(n.spotLightMap[L]=P.map,L++,te.updateMatrices(P),P.castShadow&&E++),n.spotLightMatrix[x]=te.matrix,P.castShadow){const W=t.get(P);W.shadowIntensity=te.intensity,W.shadowBias=te.bias,W.shadowNormalBias=te.normalBias,W.shadowRadius=te.radius,W.shadowMapSize=te.mapSize,n.spotShadow[x]=W,n.spotShadowMap[x]=j,v++}x++}else if(P.isRectAreaLight){const X=e.get(P);X.color.copy(F).multiplyScalar(k),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=X,m++}else if(P.isPointLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){const te=P.shadow,W=t.get(P);W.shadowIntensity=te.intensity,W.shadowBias=te.bias,W.shadowNormalBias=te.normalBias,W.shadowRadius=te.radius,W.shadowMapSize=te.mapSize,W.shadowCameraNear=te.camera.near,W.shadowCameraFar=te.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=j,n.pointShadowMatrix[g]=P.shadow.matrix,w++}n.point[g]=X,g++}else if(P.isHemisphereLight){const X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(k),X.groundColor.copy(P.groundColor).multiplyScalar(k),n.hemi[f]=X,f++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=re.LTC_FLOAT_1,n.rectAreaLTC2=re.LTC_FLOAT_2):(n.rectAreaLTC1=re.LTC_HALF_1,n.rectAreaLTC2=re.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const R=n.hash;(R.directionalLength!==p||R.pointLength!==g||R.spotLength!==x||R.rectAreaLength!==m||R.hemiLength!==f||R.numDirectionalShadows!==b||R.numPointShadows!==w||R.numSpotShadows!==v||R.numSpotMaps!==L||R.numLightProbes!==A)&&(n.directional.length=p,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=f,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=v+L-E,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=A,R.directionalLength=p,R.pointLength=g,R.spotLength=x,R.rectAreaLength=m,R.hemiLength=f,R.numDirectionalShadows=b,R.numPointShadows=w,R.numSpotShadows=v,R.numSpotMaps=L,R.numLightProbes=A,n.version=pg++)}function l(c,u){let h=0,d=0,p=0,g=0,x=0;const m=u.matrixWorldInverse;for(let f=0,b=c.length;f<b;f++){const w=c[f];if(w.isDirectionalLight){const v=n.directional[h];v.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),h++}else if(w.isSpotLight){const v=n.spot[p];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),v.direction.sub(r),v.direction.transformDirection(m),p++}else if(w.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),o.identity(),s.copy(w.matrixWorld),s.premultiply(m),o.extractRotation(s),v.halfWidth.set(w.width*.5,0,0),v.halfHeight.set(0,w.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(w.isPointLight){const v=n.point[d];v.position.setFromMatrixPosition(w.matrixWorld),v.position.applyMatrix4(m),d++}else if(w.isHemisphereLight){const v=n.hemi[x];v.direction.setFromMatrixPosition(w.matrixWorld),v.direction.transformDirection(m),x++}}}return{setup:a,setupView:l,state:n}}function Oc(i){const e=new gg(i),t=[],n=[];function r(u){c.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function vg(i){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new Oc(i),e.set(r,[a])):s>=o.length?(a=new Oc(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class xg extends ci{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Dh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class _g extends ci{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const yg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Sg=`uniform sampler2D shadow_pass;
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
}`;function Mg(i,e,t){let n=new ya;const r=new J,s=new J,o=new nt,a=new xg({depthPacking:Uh}),l=new _g,c={},u=t.maxTextureSize,h={[kn]:Dt,[Dt]:kn,[gt]:gt},d=new Et({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new J},radius:{value:4}},vertexShader:yg,fragmentShader:Sg}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const g=new bt;g.setAttribute("position",new Mt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new ie(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=eo;let f=this.type;this.render=function(E,A,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;const S=i.getRenderTarget(),_=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),F=i.state;F.setBlending(Mn),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const k=f!==Sn&&this.type===Sn,H=f===Sn&&this.type!==Sn;for(let j=0,X=E.length;j<X;j++){const te=E[j],W=te.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",te,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;r.copy(W.mapSize);const oe=W.getFrameExtents();if(r.multiply(oe),s.copy(W.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/oe.x),r.x=s.x*oe.x,W.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/oe.y),r.y=s.y*oe.y,W.mapSize.y=s.y)),W.map===null||k===!0||H===!0){const Ee=this.type!==Sn?{minFilter:Gt,magFilter:Gt}:{};W.map!==null&&W.map.dispose(),W.map=new rn(r.x,r.y,Ee),W.map.texture.name=te.name+".shadowMap",W.camera.updateProjectionMatrix()}i.setRenderTarget(W.map),i.clear();const pe=W.getViewportCount();for(let Ee=0;Ee<pe;Ee++){const ze=W.getViewport(Ee);o.set(s.x*ze.x,s.y*ze.y,s.x*ze.z,s.y*ze.w),F.viewport(o),W.updateMatrices(te,Ee),n=W.getFrustum(),v(A,R,W.camera,te,this.type)}W.isPointLightShadow!==!0&&this.type===Sn&&b(W,R),W.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(S,_,P)};function b(E,A){const R=e.update(x);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,p.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new rn(r.x,r.y)),d.uniforms.shadow_pass.value=E.map.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(A,null,R,d,x,null),p.uniforms.shadow_pass.value=E.mapPass.texture,p.uniforms.resolution.value=E.mapSize,p.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(A,null,R,p,x,null)}function w(E,A,R,S){let _=null;const P=R.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(P!==void 0)_=P;else if(_=R.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const F=_.uuid,k=A.uuid;let H=c[F];H===void 0&&(H={},c[F]=H);let j=H[k];j===void 0&&(j=_.clone(),H[k]=j,A.addEventListener("dispose",L)),_=j}if(_.visible=A.visible,_.wireframe=A.wireframe,S===Sn?_.side=A.shadowSide!==null?A.shadowSide:A.side:_.side=A.shadowSide!==null?A.shadowSide:h[A.side],_.alphaMap=A.alphaMap,_.alphaTest=A.alphaTest,_.map=A.map,_.clipShadows=A.clipShadows,_.clippingPlanes=A.clippingPlanes,_.clipIntersection=A.clipIntersection,_.displacementMap=A.displacementMap,_.displacementScale=A.displacementScale,_.displacementBias=A.displacementBias,_.wireframeLinewidth=A.wireframeLinewidth,_.linewidth=A.linewidth,R.isPointLight===!0&&_.isMeshDistanceMaterial===!0){const F=i.properties.get(_);F.light=R}return _}function v(E,A,R,S,_){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&_===Sn)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,E.matrixWorld);const k=e.update(E),H=E.material;if(Array.isArray(H)){const j=k.groups;for(let X=0,te=j.length;X<te;X++){const W=j[X],oe=H[W.materialIndex];if(oe&&oe.visible){const pe=w(E,oe,S,_);E.onBeforeShadow(i,E,A,R,k,pe,W),i.renderBufferDirect(R,null,k,pe,E,W),E.onAfterShadow(i,E,A,R,k,pe,W)}}}else if(H.visible){const j=w(E,H,S,_);E.onBeforeShadow(i,E,A,R,k,j,null),i.renderBufferDirect(R,null,k,j,E,null),E.onAfterShadow(i,E,A,R,k,j,null)}}const F=E.children;for(let k=0,H=F.length;k<H;k++)v(F[k],A,R,S,_)}function L(E){E.target.removeEventListener("dispose",L);for(const R in c){const S=c[R],_=E.target.uuid;_ in S&&(S[_].dispose(),delete S[_])}}}const wg={[io]:ro,[so]:lo,[oo]:co,[Ai]:ao,[ro]:io,[lo]:so,[co]:oo,[ao]:Ai};function bg(i,e){function t(){let I=!1;const se=new nt;let V=null;const Z=new nt(0,0,0,0);return{setMask:function(de){V!==de&&!I&&(i.colorMask(de,de,de,de),V=de)},setLocked:function(de){I=de},setClear:function(de,ue,Ne,ft,It){It===!0&&(de*=ft,ue*=ft,Ne*=ft),se.set(de,ue,Ne,ft),Z.equals(se)===!1&&(i.clearColor(de,ue,Ne,ft),Z.copy(se))},reset:function(){I=!1,V=null,Z.set(-1,0,0,0)}}}function n(){let I=!1,se=!1,V=null,Z=null,de=null;return{setReversed:function(ue){if(se!==ue){const Ne=e.get("EXT_clip_control");se?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT);const ft=de;de=null,this.setClear(ft)}se=ue},getReversed:function(){return se},setTest:function(ue){ue?ae(i.DEPTH_TEST):Re(i.DEPTH_TEST)},setMask:function(ue){V!==ue&&!I&&(i.depthMask(ue),V=ue)},setFunc:function(ue){if(se&&(ue=wg[ue]),Z!==ue){switch(ue){case io:i.depthFunc(i.NEVER);break;case ro:i.depthFunc(i.ALWAYS);break;case so:i.depthFunc(i.LESS);break;case Ai:i.depthFunc(i.LEQUAL);break;case oo:i.depthFunc(i.EQUAL);break;case ao:i.depthFunc(i.GEQUAL);break;case lo:i.depthFunc(i.GREATER);break;case co:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Z=ue}},setLocked:function(ue){I=ue},setClear:function(ue){de!==ue&&(se&&(ue=1-ue),i.clearDepth(ue),de=ue)},reset:function(){I=!1,V=null,Z=null,de=null,se=!1}}}function r(){let I=!1,se=null,V=null,Z=null,de=null,ue=null,Ne=null,ft=null,It=null;return{setTest:function(et){I||(et?ae(i.STENCIL_TEST):Re(i.STENCIL_TEST))},setMask:function(et){se!==et&&!I&&(i.stencilMask(et),se=et)},setFunc:function(et,fn,Nn){(V!==et||Z!==fn||de!==Nn)&&(i.stencilFunc(et,fn,Nn),V=et,Z=fn,de=Nn)},setOp:function(et,fn,Nn){(ue!==et||Ne!==fn||ft!==Nn)&&(i.stencilOp(et,fn,Nn),ue=et,Ne=fn,ft=Nn)},setLocked:function(et){I=et},setClear:function(et){It!==et&&(i.clearStencil(et),It=et)},reset:function(){I=!1,se=null,V=null,Z=null,de=null,ue=null,Ne=null,ft=null,It=null}}}const s=new t,o=new n,a=new r,l=new WeakMap,c=new WeakMap;let u={},h={},d=new WeakMap,p=[],g=null,x=!1,m=null,f=null,b=null,w=null,v=null,L=null,E=null,A=new xe(0,0,0),R=0,S=!1,_=null,P=null,F=null,k=null,H=null;const j=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,te=0;const W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(W)[1]),X=te>=1):W.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),X=te>=2);let oe=null,pe={};const Ee=i.getParameter(i.SCISSOR_BOX),ze=i.getParameter(i.VIEWPORT),it=new nt().fromArray(Ee),Y=new nt().fromArray(ze);function ne(I,se,V,Z){const de=new Uint8Array(4),ue=i.createTexture();i.bindTexture(I,ue),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<V;Ne++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(se,0,i.RGBA,1,1,Z,0,i.RGBA,i.UNSIGNED_BYTE,de):i.texImage2D(se+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,de);return ue}const Me={};Me[i.TEXTURE_2D]=ne(i.TEXTURE_2D,i.TEXTURE_2D,1),Me[i.TEXTURE_CUBE_MAP]=ne(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Me[i.TEXTURE_2D_ARRAY]=ne(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Me[i.TEXTURE_3D]=ne(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ae(i.DEPTH_TEST),o.setFunc(Ai),He(!1),Ve(fl),ae(i.CULL_FACE),N(Mn);function ae(I){u[I]!==!0&&(i.enable(I),u[I]=!0)}function Re(I){u[I]!==!1&&(i.disable(I),u[I]=!1)}function Ie(I,se){return h[I]!==se?(i.bindFramebuffer(I,se),h[I]=se,I===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=se),I===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=se),!0):!1}function Ge(I,se){let V=p,Z=!1;if(I){V=d.get(se),V===void 0&&(V=[],d.set(se,V));const de=I.textures;if(V.length!==de.length||V[0]!==i.COLOR_ATTACHMENT0){for(let ue=0,Ne=de.length;ue<Ne;ue++)V[ue]=i.COLOR_ATTACHMENT0+ue;V.length=de.length,Z=!0}}else V[0]!==i.BACK&&(V[0]=i.BACK,Z=!0);Z&&i.drawBuffers(V)}function ut(I){return g!==I?(i.useProgram(I),g=I,!0):!1}const Ye={[ni]:i.FUNC_ADD,[ah]:i.FUNC_SUBTRACT,[lh]:i.FUNC_REVERSE_SUBTRACT};Ye[ch]=i.MIN,Ye[uh]=i.MAX;const pt={[hh]:i.ZERO,[dh]:i.ONE,[fh]:i.SRC_COLOR,[to]:i.SRC_ALPHA,[_h]:i.SRC_ALPHA_SATURATE,[vh]:i.DST_COLOR,[mh]:i.DST_ALPHA,[ph]:i.ONE_MINUS_SRC_COLOR,[no]:i.ONE_MINUS_SRC_ALPHA,[xh]:i.ONE_MINUS_DST_COLOR,[gh]:i.ONE_MINUS_DST_ALPHA,[yh]:i.CONSTANT_COLOR,[Sh]:i.ONE_MINUS_CONSTANT_COLOR,[Mh]:i.CONSTANT_ALPHA,[wh]:i.ONE_MINUS_CONSTANT_ALPHA};function N(I,se,V,Z,de,ue,Ne,ft,It,et){if(I===Mn){x===!0&&(Re(i.BLEND),x=!1);return}if(x===!1&&(ae(i.BLEND),x=!0),I!==oh){if(I!==m||et!==S){if((f!==ni||v!==ni)&&(i.blendEquation(i.FUNC_ADD),f=ni,v=ni),et)switch(I){case Ti:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case gr:i.blendFunc(i.ONE,i.ONE);break;case pl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ml:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Ti:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case gr:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case pl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ml:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}b=null,w=null,L=null,E=null,A.set(0,0,0),R=0,m=I,S=et}return}de=de||se,ue=ue||V,Ne=Ne||Z,(se!==f||de!==v)&&(i.blendEquationSeparate(Ye[se],Ye[de]),f=se,v=de),(V!==b||Z!==w||ue!==L||Ne!==E)&&(i.blendFuncSeparate(pt[V],pt[Z],pt[ue],pt[Ne]),b=V,w=Z,L=ue,E=Ne),(ft.equals(A)===!1||It!==R)&&(i.blendColor(ft.r,ft.g,ft.b,It),A.copy(ft),R=It),m=I,S=!1}function Qt(I,se){I.side===gt?Re(i.CULL_FACE):ae(i.CULL_FACE);let V=I.side===Dt;se&&(V=!V),He(V),I.blending===Ti&&I.transparent===!1?N(Mn):N(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),s.setMask(I.colorWrite);const Z=I.stencilWrite;a.setTest(Z),Z&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),at(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?ae(i.SAMPLE_ALPHA_TO_COVERAGE):Re(i.SAMPLE_ALPHA_TO_COVERAGE)}function He(I){_!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),_=I)}function Ve(I){I!==Ei?(ae(i.CULL_FACE),I!==P&&(I===fl?i.cullFace(i.BACK):I===rh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Re(i.CULL_FACE),P=I}function Ae(I){I!==F&&(X&&i.lineWidth(I),F=I)}function at(I,se,V){I?(ae(i.POLYGON_OFFSET_FILL),(k!==se||H!==V)&&(i.polygonOffset(se,V),k=se,H=V)):Re(i.POLYGON_OFFSET_FILL)}function Te(I){I?ae(i.SCISSOR_TEST):Re(i.SCISSOR_TEST)}function T(I){I===void 0&&(I=i.TEXTURE0+j-1),oe!==I&&(i.activeTexture(I),oe=I)}function y(I,se,V){V===void 0&&(oe===null?V=i.TEXTURE0+j-1:V=oe);let Z=pe[V];Z===void 0&&(Z={type:void 0,texture:void 0},pe[V]=Z),(Z.type!==I||Z.texture!==se)&&(oe!==V&&(i.activeTexture(V),oe=V),i.bindTexture(I,se||Me[I]),Z.type=I,Z.texture=se)}function B(){const I=pe[oe];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function $(){try{i.compressedTexImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{i.compressedTexImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function q(){try{i.texSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function we(){try{i.texSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function le(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function me(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function $e(){try{i.texStorage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Q(){try{i.texStorage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ge(){try{i.texImage2D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ce(){try{i.texImage3D.apply(i,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Pe(I){it.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),it.copy(I))}function ve(I){Y.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),Y.copy(I))}function We(I,se){let V=c.get(se);V===void 0&&(V=new WeakMap,c.set(se,V));let Z=V.get(I);Z===void 0&&(Z=i.getUniformBlockIndex(se,I.name),V.set(I,Z))}function ke(I,se){const Z=c.get(se).get(I);l.get(se)!==Z&&(i.uniformBlockBinding(se,Z,I.__bindingPointIndex),l.set(se,Z))}function st(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},oe=null,pe={},h={},d=new WeakMap,p=[],g=null,x=!1,m=null,f=null,b=null,w=null,v=null,L=null,E=null,A=new xe(0,0,0),R=0,S=!1,_=null,P=null,F=null,k=null,H=null,it.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ae,disable:Re,bindFramebuffer:Ie,drawBuffers:Ge,useProgram:ut,setBlending:N,setMaterial:Qt,setFlipSided:He,setCullFace:Ve,setLineWidth:Ae,setPolygonOffset:at,setScissorTest:Te,activeTexture:T,bindTexture:y,unbindTexture:B,compressedTexImage2D:$,compressedTexImage3D:K,texImage2D:ge,texImage3D:Ce,updateUBOMapping:We,uniformBlockBinding:ke,texStorage2D:$e,texStorage3D:Q,texSubImage2D:q,texSubImage3D:we,compressedTexSubImage2D:le,compressedTexSubImage3D:me,scissor:Pe,viewport:ve,reset:st}}function kc(i,e,t,n){const r=Eg(n);switch(t){case Sl:return i*e;case wl:return i*e;case bl:return i*e*2;case yo:return i*e/r.components*r.byteLength;case So:return i*e/r.components*r.byteLength;case El:return i*e*2/r.components*r.byteLength;case Mo:return i*e*2/r.components*r.byteLength;case Ml:return i*e*3/r.components*r.byteLength;case nn:return i*e*4/r.components*r.byteLength;case wo:return i*e*4/r.components*r.byteLength;case Qr:case es:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ts:case ns:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Eo:case Ao:return Math.max(i,16)*Math.max(e,8)/4;case bo:case To:return Math.max(i,8)*Math.max(e,8)/2;case Co:case Ro:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Po:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Lo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Io:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Do:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Uo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case No:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Fo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Oo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case ko:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Bo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case zo:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Go:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ho:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Vo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Wo:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case is:case Xo:case qo:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Tl:case Yo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case $o:case Zo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Eg(i){switch(i){case wn:case xl:return{byteLength:1,components:1};case vr:case _l:case bn:return{byteLength:2,components:1};case xo:case _o:return{byteLength:2,components:4};case si:case vo:case gn:return{byteLength:4,components:1};case yl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function Tg(i,e,t,n,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new J,u=new WeakMap;let h;const d=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,y){return p?new OffscreenCanvas(T,y):os("canvas")}function x(T,y,B){let $=1;const K=Te(T);if((K.width>B||K.height>B)&&($=B/Math.max(K.width,K.height)),$<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const q=Math.floor($*K.width),we=Math.floor($*K.height);h===void 0&&(h=g(q,we));const le=y?g(q,we):h;return le.width=q,le.height=we,le.getContext("2d").drawImage(T,0,0,q,we),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+q+"x"+we+")."),le}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),T;return T}function m(T){return T.generateMipmaps}function f(T){i.generateMipmap(T)}function b(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(T,y,B,$,K=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let q=y;if(y===i.RED&&(B===i.FLOAT&&(q=i.R32F),B===i.HALF_FLOAT&&(q=i.R16F),B===i.UNSIGNED_BYTE&&(q=i.R8)),y===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.R8UI),B===i.UNSIGNED_SHORT&&(q=i.R16UI),B===i.UNSIGNED_INT&&(q=i.R32UI),B===i.BYTE&&(q=i.R8I),B===i.SHORT&&(q=i.R16I),B===i.INT&&(q=i.R32I)),y===i.RG&&(B===i.FLOAT&&(q=i.RG32F),B===i.HALF_FLOAT&&(q=i.RG16F),B===i.UNSIGNED_BYTE&&(q=i.RG8)),y===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RG8UI),B===i.UNSIGNED_SHORT&&(q=i.RG16UI),B===i.UNSIGNED_INT&&(q=i.RG32UI),B===i.BYTE&&(q=i.RG8I),B===i.SHORT&&(q=i.RG16I),B===i.INT&&(q=i.RG32I)),y===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RGB8UI),B===i.UNSIGNED_SHORT&&(q=i.RGB16UI),B===i.UNSIGNED_INT&&(q=i.RGB32UI),B===i.BYTE&&(q=i.RGB8I),B===i.SHORT&&(q=i.RGB16I),B===i.INT&&(q=i.RGB32I)),y===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(q=i.RGBA16UI),B===i.UNSIGNED_INT&&(q=i.RGBA32UI),B===i.BYTE&&(q=i.RGBA8I),B===i.SHORT&&(q=i.RGBA16I),B===i.INT&&(q=i.RGBA32I)),y===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),y===i.RGBA){const we=K?rs:Xe.getTransfer($);B===i.FLOAT&&(q=i.RGBA32F),B===i.HALF_FLOAT&&(q=i.RGBA16F),B===i.UNSIGNED_BYTE&&(q=we===tt?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function v(T,y){let B;return T?y===null||y===si||y===Pi?B=i.DEPTH24_STENCIL8:y===gn?B=i.DEPTH32F_STENCIL8:y===vr&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===si||y===Pi?B=i.DEPTH_COMPONENT24:y===gn?B=i.DEPTH_COMPONENT32F:y===vr&&(B=i.DEPTH_COMPONENT16),B}function L(T,y){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==Gt&&T.minFilter!==mn?Math.log2(Math.max(y.width,y.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?y.mipmaps.length:1}function E(T){const y=T.target;y.removeEventListener("dispose",E),R(y),y.isVideoTexture&&u.delete(y)}function A(T){const y=T.target;y.removeEventListener("dispose",A),_(y)}function R(T){const y=n.get(T);if(y.__webglInit===void 0)return;const B=T.source,$=d.get(B);if($){const K=$[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&S(T),Object.keys($).length===0&&d.delete(B)}n.remove(T)}function S(T){const y=n.get(T);i.deleteTexture(y.__webglTexture);const B=T.source,$=d.get(B);delete $[y.__cacheKey],o.memory.textures--}function _(T){const y=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(y.__webglFramebuffer[$]))for(let K=0;K<y.__webglFramebuffer[$].length;K++)i.deleteFramebuffer(y.__webglFramebuffer[$][K]);else i.deleteFramebuffer(y.__webglFramebuffer[$]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[$])}else{if(Array.isArray(y.__webglFramebuffer))for(let $=0;$<y.__webglFramebuffer.length;$++)i.deleteFramebuffer(y.__webglFramebuffer[$]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let $=0;$<y.__webglColorRenderbuffer.length;$++)y.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[$]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}const B=T.textures;for(let $=0,K=B.length;$<K;$++){const q=n.get(B[$]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),o.memory.textures--),n.remove(B[$])}n.remove(T)}let P=0;function F(){P=0}function k(){const T=P;return T>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+r.maxTextures),P+=1,T}function H(T){const y=[];return y.push(T.wrapS),y.push(T.wrapT),y.push(T.wrapR||0),y.push(T.magFilter),y.push(T.minFilter),y.push(T.anisotropy),y.push(T.internalFormat),y.push(T.format),y.push(T.type),y.push(T.generateMipmaps),y.push(T.premultiplyAlpha),y.push(T.flipY),y.push(T.unpackAlignment),y.push(T.colorSpace),y.join()}function j(T,y){const B=n.get(T);if(T.isVideoTexture&&Ae(T),T.isRenderTargetTexture===!1&&T.version>0&&B.__version!==T.version){const $=T.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(B,T,y);return}}t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+y)}function X(T,y){const B=n.get(T);if(T.version>0&&B.__version!==T.version){Y(B,T,y);return}t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+y)}function te(T,y){const B=n.get(T);if(T.version>0&&B.__version!==T.version){Y(B,T,y);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+y)}function W(T,y){const B=n.get(T);if(T.version>0&&B.__version!==T.version){ne(B,T,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+y)}const oe={[po]:i.REPEAT,[ii]:i.CLAMP_TO_EDGE,[mo]:i.MIRRORED_REPEAT},pe={[Gt]:i.NEAREST,[Ih]:i.NEAREST_MIPMAP_NEAREST,[Jr]:i.NEAREST_MIPMAP_LINEAR,[mn]:i.LINEAR,[go]:i.LINEAR_MIPMAP_NEAREST,[ri]:i.LINEAR_MIPMAP_LINEAR},Ee={[Fh]:i.NEVER,[Hh]:i.ALWAYS,[Oh]:i.LESS,[Cl]:i.LEQUAL,[kh]:i.EQUAL,[Gh]:i.GEQUAL,[Bh]:i.GREATER,[zh]:i.NOTEQUAL};function ze(T,y){if(y.type===gn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===mn||y.magFilter===go||y.magFilter===Jr||y.magFilter===ri||y.minFilter===mn||y.minFilter===go||y.minFilter===Jr||y.minFilter===ri)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,oe[y.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,oe[y.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,oe[y.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,pe[y.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,pe[y.minFilter]),y.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Ee[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Gt||y.minFilter!==Jr&&y.minFilter!==ri||y.type===gn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,r.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function it(T,y){let B=!1;T.__webglInit===void 0&&(T.__webglInit=!0,y.addEventListener("dispose",E));const $=y.source;let K=d.get($);K===void 0&&(K={},d.set($,K));const q=H(y);if(q!==T.__cacheKey){K[q]===void 0&&(K[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),K[q].usedTimes++;const we=K[T.__cacheKey];we!==void 0&&(K[T.__cacheKey].usedTimes--,we.usedTimes===0&&S(y)),T.__cacheKey=q,T.__webglTexture=K[q].texture}return B}function Y(T,y,B){let $=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&($=i.TEXTURE_3D);const K=it(T,y),q=y.source;t.bindTexture($,T.__webglTexture,i.TEXTURE0+B);const we=n.get(q);if(q.version!==we.__version||K===!0){t.activeTexture(i.TEXTURE0+B);const le=Xe.getPrimaries(Xe.workingColorSpace),me=y.colorSpace===zn?null:Xe.getPrimaries(y.colorSpace),$e=y.colorSpace===zn||le===me?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,$e);let Q=x(y.image,!1,r.maxTextureSize);Q=at(y,Q);const ge=s.convert(y.format,y.colorSpace),Ce=s.convert(y.type);let Pe=w(y.internalFormat,ge,Ce,y.colorSpace,y.isVideoTexture);ze($,y);let ve;const We=y.mipmaps,ke=y.isVideoTexture!==!0,st=we.__version===void 0||K===!0,I=q.dataReady,se=L(y,Q);if(y.isDepthTexture)Pe=v(y.format===Ii,y.type),st&&(ke?t.texStorage2D(i.TEXTURE_2D,1,Pe,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,Pe,Q.width,Q.height,0,ge,Ce,null));else if(y.isDataTexture)if(We.length>0){ke&&st&&t.texStorage2D(i.TEXTURE_2D,se,Pe,We[0].width,We[0].height);for(let V=0,Z=We.length;V<Z;V++)ve=We[V],ke?I&&t.texSubImage2D(i.TEXTURE_2D,V,0,0,ve.width,ve.height,ge,Ce,ve.data):t.texImage2D(i.TEXTURE_2D,V,Pe,ve.width,ve.height,0,ge,Ce,ve.data);y.generateMipmaps=!1}else ke?(st&&t.texStorage2D(i.TEXTURE_2D,se,Pe,Q.width,Q.height),I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Q.width,Q.height,ge,Ce,Q.data)):t.texImage2D(i.TEXTURE_2D,0,Pe,Q.width,Q.height,0,ge,Ce,Q.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){ke&&st&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Pe,We[0].width,We[0].height,Q.depth);for(let V=0,Z=We.length;V<Z;V++)if(ve=We[V],y.format!==nn)if(ge!==null)if(ke){if(I)if(y.layerUpdates.size>0){const de=kc(ve.width,ve.height,y.format,y.type);for(const ue of y.layerUpdates){const Ne=ve.data.subarray(ue*de/ve.data.BYTES_PER_ELEMENT,(ue+1)*de/ve.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,ue,ve.width,ve.height,1,ge,Ne)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,0,ve.width,ve.height,Q.depth,ge,ve.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,V,Pe,ve.width,ve.height,Q.depth,0,ve.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ke?I&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,V,0,0,0,ve.width,ve.height,Q.depth,ge,Ce,ve.data):t.texImage3D(i.TEXTURE_2D_ARRAY,V,Pe,ve.width,ve.height,Q.depth,0,ge,Ce,ve.data)}else{ke&&st&&t.texStorage2D(i.TEXTURE_2D,se,Pe,We[0].width,We[0].height);for(let V=0,Z=We.length;V<Z;V++)ve=We[V],y.format!==nn?ge!==null?ke?I&&t.compressedTexSubImage2D(i.TEXTURE_2D,V,0,0,ve.width,ve.height,ge,ve.data):t.compressedTexImage2D(i.TEXTURE_2D,V,Pe,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ke?I&&t.texSubImage2D(i.TEXTURE_2D,V,0,0,ve.width,ve.height,ge,Ce,ve.data):t.texImage2D(i.TEXTURE_2D,V,Pe,ve.width,ve.height,0,ge,Ce,ve.data)}else if(y.isDataArrayTexture)if(ke){if(st&&t.texStorage3D(i.TEXTURE_2D_ARRAY,se,Pe,Q.width,Q.height,Q.depth),I)if(y.layerUpdates.size>0){const V=kc(Q.width,Q.height,y.format,y.type);for(const Z of y.layerUpdates){const de=Q.data.subarray(Z*V/Q.data.BYTES_PER_ELEMENT,(Z+1)*V/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,Q.width,Q.height,1,ge,Ce,de)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,ge,Ce,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Pe,Q.width,Q.height,Q.depth,0,ge,Ce,Q.data);else if(y.isData3DTexture)ke?(st&&t.texStorage3D(i.TEXTURE_3D,se,Pe,Q.width,Q.height,Q.depth),I&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,ge,Ce,Q.data)):t.texImage3D(i.TEXTURE_3D,0,Pe,Q.width,Q.height,Q.depth,0,ge,Ce,Q.data);else if(y.isFramebufferTexture){if(st)if(ke)t.texStorage2D(i.TEXTURE_2D,se,Pe,Q.width,Q.height);else{let V=Q.width,Z=Q.height;for(let de=0;de<se;de++)t.texImage2D(i.TEXTURE_2D,de,Pe,V,Z,0,ge,Ce,null),V>>=1,Z>>=1}}else if(We.length>0){if(ke&&st){const V=Te(We[0]);t.texStorage2D(i.TEXTURE_2D,se,Pe,V.width,V.height)}for(let V=0,Z=We.length;V<Z;V++)ve=We[V],ke?I&&t.texSubImage2D(i.TEXTURE_2D,V,0,0,ge,Ce,ve):t.texImage2D(i.TEXTURE_2D,V,Pe,ge,Ce,ve);y.generateMipmaps=!1}else if(ke){if(st){const V=Te(Q);t.texStorage2D(i.TEXTURE_2D,se,Pe,V.width,V.height)}I&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ge,Ce,Q)}else t.texImage2D(i.TEXTURE_2D,0,Pe,ge,Ce,Q);m(y)&&f($),we.__version=q.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function ne(T,y,B){if(y.image.length!==6)return;const $=it(T,y),K=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+B);const q=n.get(K);if(K.version!==q.__version||$===!0){t.activeTexture(i.TEXTURE0+B);const we=Xe.getPrimaries(Xe.workingColorSpace),le=y.colorSpace===zn?null:Xe.getPrimaries(y.colorSpace),me=y.colorSpace===zn||we===le?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);const $e=y.isCompressedTexture||y.image[0].isCompressedTexture,Q=y.image[0]&&y.image[0].isDataTexture,ge=[];for(let Z=0;Z<6;Z++)!$e&&!Q?ge[Z]=x(y.image[Z],!0,r.maxCubemapSize):ge[Z]=Q?y.image[Z].image:y.image[Z],ge[Z]=at(y,ge[Z]);const Ce=ge[0],Pe=s.convert(y.format,y.colorSpace),ve=s.convert(y.type),We=w(y.internalFormat,Pe,ve,y.colorSpace),ke=y.isVideoTexture!==!0,st=q.__version===void 0||$===!0,I=K.dataReady;let se=L(y,Ce);ze(i.TEXTURE_CUBE_MAP,y);let V;if($e){ke&&st&&t.texStorage2D(i.TEXTURE_CUBE_MAP,se,We,Ce.width,Ce.height);for(let Z=0;Z<6;Z++){V=ge[Z].mipmaps;for(let de=0;de<V.length;de++){const ue=V[de];y.format!==nn?Pe!==null?ke?I&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de,0,0,ue.width,ue.height,Pe,ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de,We,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de,0,0,ue.width,ue.height,Pe,ve,ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de,We,ue.width,ue.height,0,Pe,ve,ue.data)}}}else{if(V=y.mipmaps,ke&&st){V.length>0&&se++;const Z=Te(ge[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,se,We,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(Q){ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,ge[Z].width,ge[Z].height,Pe,ve,ge[Z].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,We,ge[Z].width,ge[Z].height,0,Pe,ve,ge[Z].data);for(let de=0;de<V.length;de++){const Ne=V[de].image[Z].image;ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de+1,0,0,Ne.width,Ne.height,Pe,ve,Ne.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de+1,We,Ne.width,Ne.height,0,Pe,ve,Ne.data)}}else{ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Pe,ve,ge[Z]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,We,Pe,ve,ge[Z]);for(let de=0;de<V.length;de++){const ue=V[de];ke?I&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de+1,0,0,Pe,ve,ue.image[Z]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,de+1,We,Pe,ve,ue.image[Z])}}}m(y)&&f(i.TEXTURE_CUBE_MAP),q.__version=K.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function Me(T,y,B,$,K,q){const we=s.convert(B.format,B.colorSpace),le=s.convert(B.type),me=w(B.internalFormat,we,le,B.colorSpace),$e=n.get(y),Q=n.get(B);if(Q.__renderTarget=y,!$e.__hasExternalTextures){const ge=Math.max(1,y.width>>q),Ce=Math.max(1,y.height>>q);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?t.texImage3D(K,q,me,ge,Ce,y.depth,0,we,le,null):t.texImage2D(K,q,me,ge,Ce,0,we,le,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),Ve(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,K,Q.__webglTexture,0,He(y)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,K,Q.__webglTexture,q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function ae(T,y,B){if(i.bindRenderbuffer(i.RENDERBUFFER,T),y.depthBuffer){const $=y.depthTexture,K=$&&$.isDepthTexture?$.type:null,q=v(y.stencilBuffer,K),we=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,le=He(y);Ve(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,le,q,y.width,y.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,le,q,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,q,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,we,i.RENDERBUFFER,T)}else{const $=y.textures;for(let K=0;K<$.length;K++){const q=$[K],we=s.convert(q.format,q.colorSpace),le=s.convert(q.type),me=w(q.internalFormat,we,le,q.colorSpace),$e=He(y);B&&Ve(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,$e,me,y.width,y.height):Ve(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,$e,me,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,me,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Re(T,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const $=n.get(y.depthTexture);$.__renderTarget=y,(!$.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),j(y.depthTexture,0);const K=$.__webglTexture,q=He(y);if(y.depthTexture.format===Li)Ve(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0);else if(y.depthTexture.format===Ii)Ve(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function Ie(T){const y=n.get(T),B=T.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==T.depthTexture){const $=T.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),$){const K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,$.removeEventListener("dispose",K)};$.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=$}if(T.depthTexture&&!y.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");Re(y.__webglFramebuffer,T)}else if(B){y.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[$]),y.__webglDepthbuffer[$]===void 0)y.__webglDepthbuffer[$]=i.createRenderbuffer(),ae(y.__webglDepthbuffer[$],T,!1);else{const K=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=y.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,q)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),ae(y.__webglDepthbuffer,T,!1);else{const $=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,K=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,K),i.framebufferRenderbuffer(i.FRAMEBUFFER,$,i.RENDERBUFFER,K)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ge(T,y,B){const $=n.get(T);y!==void 0&&Me($.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&Ie(T)}function ut(T){const y=T.texture,B=n.get(T),$=n.get(y);T.addEventListener("dispose",A);const K=T.textures,q=T.isWebGLCubeRenderTarget===!0,we=K.length>1;if(we||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=y.version,o.memory.textures++),q){B.__webglFramebuffer=[];for(let le=0;le<6;le++)if(y.mipmaps&&y.mipmaps.length>0){B.__webglFramebuffer[le]=[];for(let me=0;me<y.mipmaps.length;me++)B.__webglFramebuffer[le][me]=i.createFramebuffer()}else B.__webglFramebuffer[le]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){B.__webglFramebuffer=[];for(let le=0;le<y.mipmaps.length;le++)B.__webglFramebuffer[le]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(we)for(let le=0,me=K.length;le<me;le++){const $e=n.get(K[le]);$e.__webglTexture===void 0&&($e.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&Ve(T)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let le=0;le<K.length;le++){const me=K[le];B.__webglColorRenderbuffer[le]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[le]);const $e=s.convert(me.format,me.colorSpace),Q=s.convert(me.type),ge=w(me.internalFormat,$e,Q,me.colorSpace,T.isXRRenderTarget===!0),Ce=He(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ce,ge,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,B.__webglColorRenderbuffer[le])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),ae(B.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),ze(i.TEXTURE_CUBE_MAP,y);for(let le=0;le<6;le++)if(y.mipmaps&&y.mipmaps.length>0)for(let me=0;me<y.mipmaps.length;me++)Me(B.__webglFramebuffer[le][me],T,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+le,me);else Me(B.__webglFramebuffer[le],T,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);m(y)&&f(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(we){for(let le=0,me=K.length;le<me;le++){const $e=K[le],Q=n.get($e);t.bindTexture(i.TEXTURE_2D,Q.__webglTexture),ze(i.TEXTURE_2D,$e),Me(B.__webglFramebuffer,T,$e,i.COLOR_ATTACHMENT0+le,i.TEXTURE_2D,0),m($e)&&f(i.TEXTURE_2D)}t.unbindTexture()}else{let le=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(le=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(le,$.__webglTexture),ze(le,y),y.mipmaps&&y.mipmaps.length>0)for(let me=0;me<y.mipmaps.length;me++)Me(B.__webglFramebuffer[me],T,y,i.COLOR_ATTACHMENT0,le,me);else Me(B.__webglFramebuffer,T,y,i.COLOR_ATTACHMENT0,le,0);m(y)&&f(le),t.unbindTexture()}T.depthBuffer&&Ie(T)}function Ye(T){const y=T.textures;for(let B=0,$=y.length;B<$;B++){const K=y[B];if(m(K)){const q=b(T),we=n.get(K).__webglTexture;t.bindTexture(q,we),f(q),t.unbindTexture()}}}const pt=[],N=[];function Qt(T){if(T.samples>0){if(Ve(T)===!1){const y=T.textures,B=T.width,$=T.height;let K=i.COLOR_BUFFER_BIT;const q=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,we=n.get(T),le=y.length>1;if(le)for(let me=0;me<y.length;me++)t.bindFramebuffer(i.FRAMEBUFFER,we.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,we.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,we.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglFramebuffer);for(let me=0;me<y.length;me++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),le){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,we.__webglColorRenderbuffer[me]);const $e=n.get(y[me]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,$e,0)}i.blitFramebuffer(0,0,B,$,0,0,B,$,K,i.NEAREST),l===!0&&(pt.length=0,N.length=0,pt.push(i.COLOR_ATTACHMENT0+me),T.depthBuffer&&T.resolveDepthBuffer===!1&&(pt.push(q),N.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,N)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,pt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),le)for(let me=0;me<y.length;me++){t.bindFramebuffer(i.FRAMEBUFFER,we.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.RENDERBUFFER,we.__webglColorRenderbuffer[me]);const $e=n.get(y[me]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,we.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+me,i.TEXTURE_2D,$e,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const y=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function He(T){return Math.min(r.maxSamples,T.samples)}function Ve(T){const y=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Ae(T){const y=o.render.frame;u.get(T)!==y&&(u.set(T,y),T.update())}function at(T,y){const B=T.colorSpace,$=T.format,K=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||B!==Di&&B!==zn&&(Xe.getTransfer(B)===tt?($!==nn||K!==wn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),y}function Te(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=k,this.resetTextureUnits=F,this.setTexture2D=j,this.setTexture2DArray=X,this.setTexture3D=te,this.setTextureCube=W,this.rebindTextures=Ge,this.setupRenderTarget=ut,this.updateRenderTargetMipmap=Ye,this.updateMultisampleRenderTarget=Qt,this.setupDepthRenderbuffer=Ie,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=Ve}function Ag(i,e){function t(n,r=zn){let s;const o=Xe.getTransfer(r);if(n===wn)return i.UNSIGNED_BYTE;if(n===xo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===_o)return i.UNSIGNED_SHORT_5_5_5_1;if(n===yl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===xl)return i.BYTE;if(n===_l)return i.SHORT;if(n===vr)return i.UNSIGNED_SHORT;if(n===vo)return i.INT;if(n===si)return i.UNSIGNED_INT;if(n===gn)return i.FLOAT;if(n===bn)return i.HALF_FLOAT;if(n===Sl)return i.ALPHA;if(n===Ml)return i.RGB;if(n===nn)return i.RGBA;if(n===wl)return i.LUMINANCE;if(n===bl)return i.LUMINANCE_ALPHA;if(n===Li)return i.DEPTH_COMPONENT;if(n===Ii)return i.DEPTH_STENCIL;if(n===yo)return i.RED;if(n===So)return i.RED_INTEGER;if(n===El)return i.RG;if(n===Mo)return i.RG_INTEGER;if(n===wo)return i.RGBA_INTEGER;if(n===Qr||n===es||n===ts||n===ns)if(o===tt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Qr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===es)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ts)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ns)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Qr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===es)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ts)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ns)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===bo||n===Eo||n===To||n===Ao)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===bo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Eo)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===To)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ao)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Co||n===Ro||n===Po)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Co||n===Ro)return o===tt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Po)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Lo||n===Io||n===Do||n===Uo||n===No||n===Fo||n===Oo||n===ko||n===Bo||n===zo||n===Go||n===Ho||n===Vo||n===Wo)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===Lo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Io)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Do)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Uo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===No)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Fo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Oo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ko)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Bo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===zo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Go)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ho)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Vo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Wo)return o===tt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===is||n===Xo||n===qo)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===is)return o===tt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Xo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===qo)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Tl||n===Yo||n===$o||n===Zo)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===is)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Yo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===$o)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Zo)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Pi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class Cg extends Zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class cn extends xt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Rg={type:"move"};class Ra{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new cn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new cn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new cn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const x of e.hand.values()){const m=t.getJointPose(x,n),f=this._getHandJoint(c,x);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),p=.02,g=.005;c.inputState.pinching&&d>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Rg)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new cn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Pg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Lg=`
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

}`;class Ig{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const r=new Nt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Et({vertexShader:Pg,fragmentShader:Lg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ie(new di(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Dg extends Ni{constructor(e,t){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,p=null,g=null;const x=new Ig,m=t.getContextAttributes();let f=null,b=null;const w=[],v=[],L=new J;let E=null;const A=new Zt;A.viewport=new nt;const R=new Zt;R.viewport=new nt;const S=[A,R],_=new Cg;let P=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ne=w[Y];return ne===void 0&&(ne=new Ra,w[Y]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(Y){let ne=w[Y];return ne===void 0&&(ne=new Ra,w[Y]=ne),ne.getGripSpace()},this.getHand=function(Y){let ne=w[Y];return ne===void 0&&(ne=new Ra,w[Y]=ne),ne.getHandSpace()};function k(Y){const ne=v.indexOf(Y.inputSource);if(ne===-1)return;const Me=w[ne];Me!==void 0&&(Me.update(Y.inputSource,Y.frame,c||o),Me.dispatchEvent({type:Y.type,data:Y.inputSource}))}function H(){r.removeEventListener("select",k),r.removeEventListener("selectstart",k),r.removeEventListener("selectend",k),r.removeEventListener("squeeze",k),r.removeEventListener("squeezestart",k),r.removeEventListener("squeezeend",k),r.removeEventListener("end",H),r.removeEventListener("inputsourceschange",j);for(let Y=0;Y<w.length;Y++){const ne=v[Y];ne!==null&&(v[Y]=null,w[Y].disconnect(ne))}P=null,F=null,x.reset(),e.setRenderTarget(f),p=null,d=null,h=null,r=null,b=null,it.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){s=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Y){if(r=Y,r!==null){if(f=e.getRenderTarget(),r.addEventListener("select",k),r.addEventListener("selectstart",k),r.addEventListener("selectend",k),r.addEventListener("squeeze",k),r.addEventListener("squeezestart",k),r.addEventListener("squeezeend",k),r.addEventListener("end",H),r.addEventListener("inputsourceschange",j),m.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(L),r.renderState.layers===void 0){const ne={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,ne),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),b=new rn(p.framebufferWidth,p.framebufferHeight,{format:nn,type:wn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ne=null,Me=null,ae=null;m.depth&&(ae=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=m.stencil?Ii:Li,Me=m.stencil?Pi:si);const Re={colorFormat:t.RGBA8,depthFormat:ae,scaleFactor:s};h=new XRWebGLBinding(r,t),d=h.createProjectionLayer(Re),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),b=new rn(d.textureWidth,d.textureHeight,{format:nn,type:wn,depthTexture:new gc(d.textureWidth,d.textureHeight,Me,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),it.setContext(r),it.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function j(Y){for(let ne=0;ne<Y.removed.length;ne++){const Me=Y.removed[ne],ae=v.indexOf(Me);ae>=0&&(v[ae]=null,w[ae].disconnect(Me))}for(let ne=0;ne<Y.added.length;ne++){const Me=Y.added[ne];let ae=v.indexOf(Me);if(ae===-1){for(let Ie=0;Ie<w.length;Ie++)if(Ie>=v.length){v.push(Me),ae=Ie;break}else if(v[Ie]===null){v[Ie]=Me,ae=Ie;break}if(ae===-1)break}const Re=w[ae];Re&&Re.connect(Me)}}const X=new C,te=new C;function W(Y,ne,Me){X.setFromMatrixPosition(ne.matrixWorld),te.setFromMatrixPosition(Me.matrixWorld);const ae=X.distanceTo(te),Re=ne.projectionMatrix.elements,Ie=Me.projectionMatrix.elements,Ge=Re[14]/(Re[10]-1),ut=Re[14]/(Re[10]+1),Ye=(Re[9]+1)/Re[5],pt=(Re[9]-1)/Re[5],N=(Re[8]-1)/Re[0],Qt=(Ie[8]+1)/Ie[0],He=Ge*N,Ve=Ge*Qt,Ae=ae/(-N+Qt),at=Ae*-N;if(ne.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(at),Y.translateZ(Ae),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Re[10]===-1)Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{const Te=Ge+Ae,T=ut+Ae,y=He-at,B=Ve+(ae-at),$=Ye*ut/T*Te,K=pt*ut/T*Te;Y.projectionMatrix.makePerspective(y,B,$,K,Te,T),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function oe(Y,ne){ne===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ne.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(r===null)return;let ne=Y.near,Me=Y.far;x.texture!==null&&(x.depthNear>0&&(ne=x.depthNear),x.depthFar>0&&(Me=x.depthFar)),_.near=R.near=A.near=ne,_.far=R.far=A.far=Me,(P!==_.near||F!==_.far)&&(r.updateRenderState({depthNear:_.near,depthFar:_.far}),P=_.near,F=_.far),A.layers.mask=Y.layers.mask|2,R.layers.mask=Y.layers.mask|4,_.layers.mask=A.layers.mask|R.layers.mask;const ae=Y.parent,Re=_.cameras;oe(_,ae);for(let Ie=0;Ie<Re.length;Ie++)oe(Re[Ie],ae);Re.length===2?W(_,A,R):_.projectionMatrix.copy(A.projectionMatrix),pe(Y,_,ae)};function pe(Y,ne,Me){Me===null?Y.matrix.copy(ne.matrixWorld):(Y.matrix.copy(Me.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ne.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=_r*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(Y){l=Y,d!==null&&(d.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(_)};let Ee=null;function ze(Y,ne){if(u=ne.getViewerPose(c||o),g=ne,u!==null){const Me=u.views;p!==null&&(e.setRenderTargetFramebuffer(b,p.framebuffer),e.setRenderTarget(b));let ae=!1;Me.length!==_.cameras.length&&(_.cameras.length=0,ae=!0);for(let Ie=0;Ie<Me.length;Ie++){const Ge=Me[Ie];let ut=null;if(p!==null)ut=p.getViewport(Ge);else{const pt=h.getViewSubImage(d,Ge);ut=pt.viewport,Ie===0&&(e.setRenderTargetTextures(b,pt.colorTexture,d.ignoreDepthValues?void 0:pt.depthStencilTexture),e.setRenderTarget(b))}let Ye=S[Ie];Ye===void 0&&(Ye=new Zt,Ye.layers.enable(Ie),Ye.viewport=new nt,S[Ie]=Ye),Ye.matrix.fromArray(Ge.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Ge.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(ut.x,ut.y,ut.width,ut.height),Ie===0&&(_.matrix.copy(Ye.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),ae===!0&&_.cameras.push(Ye)}const Re=r.enabledFeatures;if(Re&&Re.includes("depth-sensing")){const Ie=h.getDepthInformation(Me[0]);Ie&&Ie.isValid&&Ie.texture&&x.init(e,Ie,r.renderState)}}for(let Me=0;Me<w.length;Me++){const ae=v[Me],Re=w[Me];ae!==null&&Re!==void 0&&Re.update(ae,ne,c||o)}Ee&&Ee(Y,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),g=null}const it=new lc;it.setAnimationLoop(ze),this.setAnimationLoop=function(Y){Ee=Y},this.dispose=function(){}}}const gi=new St,Ug=new Qe;function Ng(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,ic(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function r(m,f,b,w,v){f.isMeshBasicMaterial||f.isMeshLambertMaterial?s(m,f):f.isMeshToonMaterial?(s(m,f),h(m,f)):f.isMeshPhongMaterial?(s(m,f),u(m,f)):f.isMeshStandardMaterial?(s(m,f),d(m,f),f.isMeshPhysicalMaterial&&p(m,f,v)):f.isMeshMatcapMaterial?(s(m,f),g(m,f)):f.isMeshDepthMaterial?s(m,f):f.isMeshDistanceMaterial?(s(m,f),x(m,f)):f.isMeshNormalMaterial?s(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,b,w):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function s(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Dt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Dt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);const b=e.get(f),w=b.envMap,v=b.envMapRotation;w&&(m.envMap.value=w,gi.copy(v),gi.x*=-1,gi.y*=-1,gi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(gi.y*=-1,gi.z*=-1),m.envMapRotation.value.setFromMatrix4(Ug.makeRotationFromEuler(gi)),m.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,b,w){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*b,m.scale.value=w*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function h(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function d(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,b){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Dt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function x(m,f){const b=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Fg(i,e,t,n){let r={},s={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,w){const v=w.program;n.uniformBlockBinding(b,v)}function c(b,w){let v=r[b.id];v===void 0&&(g(b),v=u(b),r[b.id]=v,b.addEventListener("dispose",m));const L=w.program;n.updateUBOMapping(b,L);const E=e.render.frame;s[b.id]!==E&&(d(b),s[b.id]=E)}function u(b){const w=h();b.__bindingPointIndex=w;const v=i.createBuffer(),L=b.__size,E=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,L,E),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,v),v}function h(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(b){const w=r[b.id],v=b.uniforms,L=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let E=0,A=v.length;E<A;E++){const R=Array.isArray(v[E])?v[E]:[v[E]];for(let S=0,_=R.length;S<_;S++){const P=R[S];if(p(P,E,S,L)===!0){const F=P.__offset,k=Array.isArray(P.value)?P.value:[P.value];let H=0;for(let j=0;j<k.length;j++){const X=k[j],te=x(X);typeof X=="number"||typeof X=="boolean"?(P.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,F+H,P.__data)):X.isMatrix3?(P.__data[0]=X.elements[0],P.__data[1]=X.elements[1],P.__data[2]=X.elements[2],P.__data[3]=0,P.__data[4]=X.elements[3],P.__data[5]=X.elements[4],P.__data[6]=X.elements[5],P.__data[7]=0,P.__data[8]=X.elements[6],P.__data[9]=X.elements[7],P.__data[10]=X.elements[8],P.__data[11]=0):(X.toArray(P.__data,H),H+=te.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,F,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(b,w,v,L){const E=b.value,A=w+"_"+v;if(L[A]===void 0)return typeof E=="number"||typeof E=="boolean"?L[A]=E:L[A]=E.clone(),!0;{const R=L[A];if(typeof E=="number"||typeof E=="boolean"){if(R!==E)return L[A]=E,!0}else if(R.equals(E)===!1)return R.copy(E),!0}return!1}function g(b){const w=b.uniforms;let v=0;const L=16;for(let A=0,R=w.length;A<R;A++){const S=Array.isArray(w[A])?w[A]:[w[A]];for(let _=0,P=S.length;_<P;_++){const F=S[_],k=Array.isArray(F.value)?F.value:[F.value];for(let H=0,j=k.length;H<j;H++){const X=k[H],te=x(X),W=v%L,oe=W%te.boundary,pe=W+oe;v+=oe,pe!==0&&L-pe<te.storage&&(v+=L-pe),F.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=v,v+=te.storage}}}const E=v%L;return E>0&&(v+=L-E),b.__size=v,b.__cache={},this}function x(b){const w={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(w.boundary=4,w.storage=4):b.isVector2?(w.boundary=8,w.storage=8):b.isVector3||b.isColor?(w.boundary=16,w.storage=12):b.isVector4?(w.boundary=16,w.storage=16):b.isMatrix3?(w.boundary=48,w.storage=48):b.isMatrix4?(w.boundary=64,w.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),w}function m(b){const w=b.target;w.removeEventListener("dispose",m);const v=o.indexOf(w.__bindingPointIndex);o.splice(v,1),i.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function f(){for(const b in r)i.deleteBuffer(r[b]);o=[],r={},s={}}return{bind:l,update:c,dispose:f}}class Og{constructor(e={}){const{canvas:t=sd(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reverseDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const g=new Uint32Array(4),x=new Int32Array(4);let m=null,f=null;const b=[],w=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Yt,this.toneMapping=Bn,this.toneMappingExposure=1;const v=this;let L=!1,E=0,A=0,R=null,S=-1,_=null;const P=new nt,F=new nt;let k=null;const H=new xe(0);let j=0,X=t.width,te=t.height,W=1,oe=null,pe=null;const Ee=new nt(0,0,X,te),ze=new nt(0,0,X,te);let it=!1;const Y=new ya;let ne=!1,Me=!1;const ae=new Qe,Re=new Qe,Ie=new C,Ge=new nt,ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ye=!1;function pt(){return R===null?W:1}let N=n;function Qt(M,D){return t.getContext(M,D)}try{const M={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${tn}`),t.addEventListener("webglcontextlost",Z,!1),t.addEventListener("webglcontextrestored",de,!1),t.addEventListener("webglcontextcreationerror",ue,!1),N===null){const D="webgl2";if(N=Qt(D,M),N===null)throw Qt(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let He,Ve,Ae,at,Te,T,y,B,$,K,q,we,le,me,$e,Q,ge,Ce,Pe,ve,We,ke,st,I;function se(){He=new Hp(N),He.init(),ke=new Ag(N,He),Ve=new Fp(N,He,e,ke),Ae=new bg(N,He),Ve.reverseDepthBuffer&&d&&Ae.buffers.depth.setReversed(!0),at=new Xp(N),Te=new cg,T=new Tg(N,He,Ae,Te,Ve,ke,at),y=new kp(v),B=new Gp(v),$=new Ld(N),st=new Up(N,$),K=new Vp(N,$,at,st),q=new Yp(N,K,$,at),Pe=new qp(N,Ve,T),Q=new Op(Te),we=new lg(v,y,B,He,Ve,st,Q),le=new Ng(v,Te),me=new hg,$e=new vg(He),Ce=new Dp(v,y,B,Ae,q,p,l),ge=new Mg(v,q,Ve),I=new Fg(N,at,Ve,Ae),ve=new Np(N,He,at),We=new Wp(N,He,at),at.programs=we.programs,v.capabilities=Ve,v.extensions=He,v.properties=Te,v.renderLists=me,v.shadowMap=ge,v.state=Ae,v.info=at}se();const V=new Dg(v,N);this.xr=V,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){const M=He.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=He.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(M){M!==void 0&&(W=M,this.setSize(X,te,!1))},this.getSize=function(M){return M.set(X,te)},this.setSize=function(M,D,z=!0){if(V.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=M,te=D,t.width=Math.floor(M*W),t.height=Math.floor(D*W),z===!0&&(t.style.width=M+"px",t.style.height=D+"px"),this.setViewport(0,0,M,D)},this.getDrawingBufferSize=function(M){return M.set(X*W,te*W).floor()},this.setDrawingBufferSize=function(M,D,z){X=M,te=D,W=z,t.width=Math.floor(M*z),t.height=Math.floor(D*z),this.setViewport(0,0,M,D)},this.getCurrentViewport=function(M){return M.copy(P)},this.getViewport=function(M){return M.copy(Ee)},this.setViewport=function(M,D,z,G){M.isVector4?Ee.set(M.x,M.y,M.z,M.w):Ee.set(M,D,z,G),Ae.viewport(P.copy(Ee).multiplyScalar(W).round())},this.getScissor=function(M){return M.copy(ze)},this.setScissor=function(M,D,z,G){M.isVector4?ze.set(M.x,M.y,M.z,M.w):ze.set(M,D,z,G),Ae.scissor(F.copy(ze).multiplyScalar(W).round())},this.getScissorTest=function(){return it},this.setScissorTest=function(M){Ae.setScissorTest(it=M)},this.setOpaqueSort=function(M){oe=M},this.setTransparentSort=function(M){pe=M},this.getClearColor=function(M){return M.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor.apply(Ce,arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha.apply(Ce,arguments)},this.clear=function(M=!0,D=!0,z=!0){let G=0;if(M){let U=!1;if(R!==null){const ee=R.texture.format;U=ee===wo||ee===Mo||ee===So}if(U){const ee=R.texture.type,he=ee===wn||ee===si||ee===vr||ee===Pi||ee===xo||ee===_o,_e=Ce.getClearColor(),ye=Ce.getClearAlpha(),Le=_e.r,Fe=_e.g,Se=_e.b;he?(g[0]=Le,g[1]=Fe,g[2]=Se,g[3]=ye,N.clearBufferuiv(N.COLOR,0,g)):(x[0]=Le,x[1]=Fe,x[2]=Se,x[3]=ye,N.clearBufferiv(N.COLOR,0,x))}else G|=N.COLOR_BUFFER_BIT}D&&(G|=N.DEPTH_BUFFER_BIT),z&&(G|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),N.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Z,!1),t.removeEventListener("webglcontextrestored",de,!1),t.removeEventListener("webglcontextcreationerror",ue,!1),me.dispose(),$e.dispose(),Te.dispose(),y.dispose(),B.dispose(),q.dispose(),st.dispose(),I.dispose(),we.dispose(),V.dispose(),V.removeEventListener("sessionstart",ju),V.removeEventListener("sessionend",Ku),bi.stop()};function Z(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),L=!0}function de(){console.log("THREE.WebGLRenderer: Context Restored."),L=!1;const M=at.autoReset,D=ge.enabled,z=ge.autoUpdate,G=ge.needsUpdate,U=ge.type;se(),at.autoReset=M,ge.enabled=D,ge.autoUpdate=z,ge.needsUpdate=G,ge.type=U}function ue(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ne(M){const D=M.target;D.removeEventListener("dispose",Ne),ft(D)}function ft(M){It(M),Te.remove(M)}function It(M){const D=Te.get(M).programs;D!==void 0&&(D.forEach(function(z){we.releaseProgram(z)}),M.isShaderMaterial&&we.releaseShaderCache(M))}this.renderBufferDirect=function(M,D,z,G,U,ee){D===null&&(D=ut);const he=U.isMesh&&U.matrixWorld.determinant()<0,_e=tx(M,D,z,G,U);Ae.setMaterial(G,he);let ye=z.index,Le=1;if(G.wireframe===!0){if(ye=K.getWireframeAttribute(z),ye===void 0)return;Le=2}const Fe=z.drawRange,Se=z.attributes.position;let Ze=Fe.start*Le,ot=(Fe.start+Fe.count)*Le;ee!==null&&(Ze=Math.max(Ze,ee.start*Le),ot=Math.min(ot,(ee.start+ee.count)*Le)),ye!==null?(Ze=Math.max(Ze,0),ot=Math.min(ot,ye.count)):Se!=null&&(Ze=Math.max(Ze,0),ot=Math.min(ot,Se.count));const lt=ot-Ze;if(lt<0||lt===1/0)return;st.setup(U,G,_e,z,ye);let zt,Ke=ve;if(ye!==null&&(zt=$.get(ye),Ke=We,Ke.setIndex(zt)),U.isMesh)G.wireframe===!0?(Ae.setLineWidth(G.wireframeLinewidth*pt()),Ke.setMode(N.LINES)):Ke.setMode(N.TRIANGLES);else if(U.isLine){let be=G.linewidth;be===void 0&&(be=1),Ae.setLineWidth(be*pt()),U.isLineSegments?Ke.setMode(N.LINES):U.isLineLoop?Ke.setMode(N.LINE_LOOP):Ke.setMode(N.LINE_STRIP)}else U.isPoints?Ke.setMode(N.POINTS):U.isSprite&&Ke.setMode(N.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Ke.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(He.get("WEBGL_multi_draw"))Ke.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const be=U._multiDrawStarts,Fn=U._multiDrawCounts,Je=U._multiDrawCount,pn=ye?$.get(ye).bytesPerElement:1,mr=Te.get(G).currentProgram.getUniforms();for(let qt=0;qt<Je;qt++)mr.setValue(N,"_gl_DrawID",qt),Ke.render(be[qt]/pn,Fn[qt])}else if(U.isInstancedMesh)Ke.renderInstances(Ze,lt,U.count);else if(z.isInstancedBufferGeometry){const be=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,Fn=Math.min(z.instanceCount,be);Ke.renderInstances(Ze,lt,Fn)}else Ke.render(Ze,lt)};function et(M,D,z){M.transparent===!0&&M.side===gt&&M.forceSinglePass===!1?(M.side=Dt,M.needsUpdate=!0,Qs(M,D,z),M.side=kn,M.needsUpdate=!0,Qs(M,D,z),M.side=gt):Qs(M,D,z)}this.compile=function(M,D,z=null){z===null&&(z=M),f=$e.get(z),f.init(D),w.push(f),z.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),M!==z&&M.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(f.pushLight(U),U.castShadow&&f.pushShadow(U))}),f.setupLights();const G=new Set;return M.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const ee=U.material;if(ee)if(Array.isArray(ee))for(let he=0;he<ee.length;he++){const _e=ee[he];et(_e,z,U),G.add(_e)}else et(ee,z,U),G.add(ee)}),w.pop(),f=null,G},this.compileAsync=function(M,D,z=null){const G=this.compile(M,D,z);return new Promise(U=>{function ee(){if(G.forEach(function(he){Te.get(he).currentProgram.isReady()&&G.delete(he)}),G.size===0){U(M);return}setTimeout(ee,10)}He.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let fn=null;function Nn(M){fn&&fn(M)}function ju(){bi.stop()}function Ku(){bi.start()}const bi=new lc;bi.setAnimationLoop(Nn),typeof self<"u"&&bi.setContext(self),this.setAnimationLoop=function(M){fn=M,V.setAnimationLoop(M),M===null?bi.stop():bi.start()},V.addEventListener("sessionstart",ju),V.addEventListener("sessionend",Ku),this.render=function(M,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),V.enabled===!0&&V.isPresenting===!0&&(V.cameraAutoUpdate===!0&&V.updateCamera(D),D=V.getCamera()),M.isScene===!0&&M.onBeforeRender(v,M,D,R),f=$e.get(M,w.length),f.init(D),w.push(f),Re.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Y.setFromProjectionMatrix(Re),Me=this.localClippingEnabled,ne=Q.init(this.clippingPlanes,Me),m=me.get(M,b.length),m.init(),b.push(m),V.enabled===!0&&V.isPresenting===!0){const ee=v.xr.getDepthSensingMesh();ee!==null&&dl(ee,D,-1/0,v.sortObjects)}dl(M,D,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(oe,pe),Ye=V.enabled===!1||V.isPresenting===!1||V.hasDepthSensing()===!1,Ye&&Ce.addToRenderList(m,M),this.info.render.frame++,ne===!0&&Q.beginShadows();const z=f.state.shadowsArray;ge.render(z,M,D),ne===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=m.opaque,U=m.transmissive;if(f.setupLights(),D.isArrayCamera){const ee=D.cameras;if(U.length>0)for(let he=0,_e=ee.length;he<_e;he++){const ye=ee[he];Qu(G,U,M,ye)}Ye&&Ce.render(M);for(let he=0,_e=ee.length;he<_e;he++){const ye=ee[he];Ju(m,M,ye,ye.viewport)}}else U.length>0&&Qu(G,U,M,D),Ye&&Ce.render(M),Ju(m,M,D);R!==null&&(T.updateMultisampleRenderTarget(R),T.updateRenderTargetMipmap(R)),M.isScene===!0&&M.onAfterRender(v,M,D),st.resetDefaultState(),S=-1,_=null,w.pop(),w.length>0?(f=w[w.length-1],ne===!0&&Q.setGlobalState(v.clippingPlanes,f.state.camera)):f=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function dl(M,D,z,G){if(M.visible===!1)return;if(M.layers.test(D.layers)){if(M.isGroup)z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(D);else if(M.isLight)f.pushLight(M),M.castShadow&&f.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Y.intersectsSprite(M)){G&&Ge.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Re);const he=q.update(M),_e=M.material;_e.visible&&m.push(M,he,_e,z,Ge.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Y.intersectsObject(M))){const he=q.update(M),_e=M.material;if(G&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ge.copy(M.boundingSphere.center)):(he.boundingSphere===null&&he.computeBoundingSphere(),Ge.copy(he.boundingSphere.center)),Ge.applyMatrix4(M.matrixWorld).applyMatrix4(Re)),Array.isArray(_e)){const ye=he.groups;for(let Le=0,Fe=ye.length;Le<Fe;Le++){const Se=ye[Le],Ze=_e[Se.materialIndex];Ze&&Ze.visible&&m.push(M,he,Ze,z,Ge.z,Se)}}else _e.visible&&m.push(M,he,_e,z,Ge.z,null)}}const ee=M.children;for(let he=0,_e=ee.length;he<_e;he++)dl(ee[he],D,z,G)}function Ju(M,D,z,G){const U=M.opaque,ee=M.transmissive,he=M.transparent;f.setupLightsView(z),ne===!0&&Q.setGlobalState(v.clippingPlanes,z),G&&Ae.viewport(P.copy(G)),U.length>0&&Js(U,D,z),ee.length>0&&Js(ee,D,z),he.length>0&&Js(he,D,z),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function Qu(M,D,z,G){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[G.id]===void 0&&(f.state.transmissionRenderTarget[G.id]=new rn(1,1,{generateMipmaps:!0,type:He.has("EXT_color_buffer_half_float")||He.has("EXT_color_buffer_float")?bn:wn,minFilter:ri,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace}));const ee=f.state.transmissionRenderTarget[G.id],he=G.viewport||P;ee.setSize(he.z,he.w);const _e=v.getRenderTarget();v.setRenderTarget(ee),v.getClearColor(H),j=v.getClearAlpha(),j<1&&v.setClearColor(16777215,.5),v.clear(),Ye&&Ce.render(z);const ye=v.toneMapping;v.toneMapping=Bn;const Le=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),f.setupLightsView(G),ne===!0&&Q.setGlobalState(v.clippingPlanes,G),Js(M,z,G),T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee),He.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let Se=0,Ze=D.length;Se<Ze;Se++){const ot=D[Se],lt=ot.object,zt=ot.geometry,Ke=ot.material,be=ot.group;if(Ke.side===gt&&lt.layers.test(G.layers)){const Fn=Ke.side;Ke.side=Dt,Ke.needsUpdate=!0,eh(lt,z,G,zt,Ke,be),Ke.side=Fn,Ke.needsUpdate=!0,Fe=!0}}Fe===!0&&(T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee))}v.setRenderTarget(_e),v.setClearColor(H,j),Le!==void 0&&(G.viewport=Le),v.toneMapping=ye}function Js(M,D,z){const G=D.isScene===!0?D.overrideMaterial:null;for(let U=0,ee=M.length;U<ee;U++){const he=M[U],_e=he.object,ye=he.geometry,Le=G===null?he.material:G,Fe=he.group;_e.layers.test(z.layers)&&eh(_e,D,z,ye,Le,Fe)}}function eh(M,D,z,G,U,ee){M.onBeforeRender(v,D,z,G,U,ee),M.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),U.onBeforeRender(v,D,z,G,M,ee),U.transparent===!0&&U.side===gt&&U.forceSinglePass===!1?(U.side=Dt,U.needsUpdate=!0,v.renderBufferDirect(z,D,G,U,M,ee),U.side=kn,U.needsUpdate=!0,v.renderBufferDirect(z,D,G,U,M,ee),U.side=gt):v.renderBufferDirect(z,D,G,U,M,ee),M.onAfterRender(v,D,z,G,U,ee)}function Qs(M,D,z){D.isScene!==!0&&(D=ut);const G=Te.get(M),U=f.state.lights,ee=f.state.shadowsArray,he=U.state.version,_e=we.getParameters(M,U.state,ee,D,z),ye=we.getProgramCacheKey(_e);let Le=G.programs;G.environment=M.isMeshStandardMaterial?D.environment:null,G.fog=D.fog,G.envMap=(M.isMeshStandardMaterial?B:y).get(M.envMap||G.environment),G.envMapRotation=G.environment!==null&&M.envMap===null?D.environmentRotation:M.envMapRotation,Le===void 0&&(M.addEventListener("dispose",Ne),Le=new Map,G.programs=Le);let Fe=Le.get(ye);if(Fe!==void 0){if(G.currentProgram===Fe&&G.lightsStateVersion===he)return nh(M,_e),Fe}else _e.uniforms=we.getUniforms(M),M.onBeforeCompile(_e,v),Fe=we.acquireProgram(_e,ye),Le.set(ye,Fe),G.uniforms=_e.uniforms;const Se=G.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Se.clippingPlanes=Q.uniform),nh(M,_e),G.needsLights=ix(M),G.lightsStateVersion=he,G.needsLights&&(Se.ambientLightColor.value=U.state.ambient,Se.lightProbe.value=U.state.probe,Se.directionalLights.value=U.state.directional,Se.directionalLightShadows.value=U.state.directionalShadow,Se.spotLights.value=U.state.spot,Se.spotLightShadows.value=U.state.spotShadow,Se.rectAreaLights.value=U.state.rectArea,Se.ltc_1.value=U.state.rectAreaLTC1,Se.ltc_2.value=U.state.rectAreaLTC2,Se.pointLights.value=U.state.point,Se.pointLightShadows.value=U.state.pointShadow,Se.hemisphereLights.value=U.state.hemi,Se.directionalShadowMap.value=U.state.directionalShadowMap,Se.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Se.spotShadowMap.value=U.state.spotShadowMap,Se.spotLightMatrix.value=U.state.spotLightMatrix,Se.spotLightMap.value=U.state.spotLightMap,Se.pointShadowMap.value=U.state.pointShadowMap,Se.pointShadowMatrix.value=U.state.pointShadowMatrix),G.currentProgram=Fe,G.uniformsList=null,Fe}function th(M){if(M.uniformsList===null){const D=M.currentProgram.getUniforms();M.uniformsList=Rs.seqWithValue(D.seq,M.uniforms)}return M.uniformsList}function nh(M,D){const z=Te.get(M);z.outputColorSpace=D.outputColorSpace,z.batching=D.batching,z.batchingColor=D.batchingColor,z.instancing=D.instancing,z.instancingColor=D.instancingColor,z.instancingMorph=D.instancingMorph,z.skinning=D.skinning,z.morphTargets=D.morphTargets,z.morphNormals=D.morphNormals,z.morphColors=D.morphColors,z.morphTargetsCount=D.morphTargetsCount,z.numClippingPlanes=D.numClippingPlanes,z.numIntersection=D.numClipIntersection,z.vertexAlphas=D.vertexAlphas,z.vertexTangents=D.vertexTangents,z.toneMapping=D.toneMapping}function tx(M,D,z,G,U){D.isScene!==!0&&(D=ut),T.resetTextureUnits();const ee=D.fog,he=G.isMeshStandardMaterial?D.environment:null,_e=R===null?v.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:Di,ye=(G.isMeshStandardMaterial?B:y).get(G.envMap||he),Le=G.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Fe=!!z.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Se=!!z.morphAttributes.position,Ze=!!z.morphAttributes.normal,ot=!!z.morphAttributes.color;let lt=Bn;G.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(lt=v.toneMapping);const zt=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Ke=zt!==void 0?zt.length:0,be=Te.get(G),Fn=f.state.lights;if(ne===!0&&(Me===!0||M!==_)){const en=M===_&&G.id===S;Q.setState(G,M,en)}let Je=!1;G.version===be.__version?(be.needsLights&&be.lightsStateVersion!==Fn.state.version||be.outputColorSpace!==_e||U.isBatchedMesh&&be.batching===!1||!U.isBatchedMesh&&be.batching===!0||U.isBatchedMesh&&be.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&be.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&be.instancing===!1||!U.isInstancedMesh&&be.instancing===!0||U.isSkinnedMesh&&be.skinning===!1||!U.isSkinnedMesh&&be.skinning===!0||U.isInstancedMesh&&be.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&be.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&be.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&be.instancingMorph===!1&&U.morphTexture!==null||be.envMap!==ye||G.fog===!0&&be.fog!==ee||be.numClippingPlanes!==void 0&&(be.numClippingPlanes!==Q.numPlanes||be.numIntersection!==Q.numIntersection)||be.vertexAlphas!==Le||be.vertexTangents!==Fe||be.morphTargets!==Se||be.morphNormals!==Ze||be.morphColors!==ot||be.toneMapping!==lt||be.morphTargetsCount!==Ke)&&(Je=!0):(Je=!0,be.__version=G.version);let pn=be.currentProgram;Je===!0&&(pn=Qs(G,D,U));let mr=!1,qt=!1,Zr=!1;const ct=pn.getUniforms(),yn=be.uniforms;if(Ae.useProgram(pn.program)&&(mr=!0,qt=!0,Zr=!0),G.id!==S&&(S=G.id,qt=!0),mr||_!==M){Ae.buffers.depth.getReversed()?(ae.copy(M.projectionMatrix),ad(ae),ld(ae),ct.setValue(N,"projectionMatrix",ae)):ct.setValue(N,"projectionMatrix",M.projectionMatrix),ct.setValue(N,"viewMatrix",M.matrixWorldInverse);const ei=ct.map.cameraPosition;ei!==void 0&&ei.setValue(N,Ie.setFromMatrixPosition(M.matrixWorld)),Ve.logarithmicDepthBuffer&&ct.setValue(N,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ct.setValue(N,"isOrthographic",M.isOrthographicCamera===!0),_!==M&&(_=M,qt=!0,Zr=!0)}if(U.isSkinnedMesh){ct.setOptional(N,U,"bindMatrix"),ct.setOptional(N,U,"bindMatrixInverse");const en=U.skeleton;en&&(en.boneTexture===null&&en.computeBoneTexture(),ct.setValue(N,"boneTexture",en.boneTexture,T))}U.isBatchedMesh&&(ct.setOptional(N,U,"batchingTexture"),ct.setValue(N,"batchingTexture",U._matricesTexture,T),ct.setOptional(N,U,"batchingIdTexture"),ct.setValue(N,"batchingIdTexture",U._indirectTexture,T),ct.setOptional(N,U,"batchingColorTexture"),U._colorsTexture!==null&&ct.setValue(N,"batchingColorTexture",U._colorsTexture,T));const jr=z.morphAttributes;if((jr.position!==void 0||jr.normal!==void 0||jr.color!==void 0)&&Pe.update(U,z,pn),(qt||be.receiveShadow!==U.receiveShadow)&&(be.receiveShadow=U.receiveShadow,ct.setValue(N,"receiveShadow",U.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(yn.envMap.value=ye,yn.flipEnvMap.value=ye.isCubeTexture&&ye.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&D.environment!==null&&(yn.envMapIntensity.value=D.environmentIntensity),qt&&(ct.setValue(N,"toneMappingExposure",v.toneMappingExposure),be.needsLights&&nx(yn,Zr),ee&&G.fog===!0&&le.refreshFogUniforms(yn,ee),le.refreshMaterialUniforms(yn,G,W,te,f.state.transmissionRenderTarget[M.id]),Rs.upload(N,th(be),yn,T)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Rs.upload(N,th(be),yn,T),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ct.setValue(N,"center",U.center),ct.setValue(N,"modelViewMatrix",U.modelViewMatrix),ct.setValue(N,"normalMatrix",U.normalMatrix),ct.setValue(N,"modelMatrix",U.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const en=G.uniformsGroups;for(let ei=0,ti=en.length;ei<ti;ei++){const ih=en[ei];I.update(ih,pn),I.bind(ih,pn)}}return pn}function nx(M,D){M.ambientLightColor.needsUpdate=D,M.lightProbe.needsUpdate=D,M.directionalLights.needsUpdate=D,M.directionalLightShadows.needsUpdate=D,M.pointLights.needsUpdate=D,M.pointLightShadows.needsUpdate=D,M.spotLights.needsUpdate=D,M.spotLightShadows.needsUpdate=D,M.rectAreaLights.needsUpdate=D,M.hemisphereLights.needsUpdate=D}function ix(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(M,D,z){Te.get(M.texture).__webglTexture=D,Te.get(M.depthTexture).__webglTexture=z;const G=Te.get(M);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=z===void 0,G.__autoAllocateDepthBuffer||He.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,D){const z=Te.get(M);z.__webglFramebuffer=D,z.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(M,D=0,z=0){R=M,E=D,A=z;let G=!0,U=null,ee=!1,he=!1;if(M){const ye=Te.get(M);if(ye.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(N.FRAMEBUFFER,null),G=!1;else if(ye.__webglFramebuffer===void 0)T.setupRenderTarget(M);else if(ye.__hasExternalTextures)T.rebindTextures(M,Te.get(M.texture).__webglTexture,Te.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Se=M.depthTexture;if(ye.__boundDepthTexture!==Se){if(Se!==null&&Te.has(Se)&&(M.width!==Se.image.width||M.height!==Se.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(M)}}const Le=M.texture;(Le.isData3DTexture||Le.isDataArrayTexture||Le.isCompressedArrayTexture)&&(he=!0);const Fe=Te.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Fe[D])?U=Fe[D][z]:U=Fe[D],ee=!0):M.samples>0&&T.useMultisampledRTT(M)===!1?U=Te.get(M).__webglMultisampledFramebuffer:Array.isArray(Fe)?U=Fe[z]:U=Fe,P.copy(M.viewport),F.copy(M.scissor),k=M.scissorTest}else P.copy(Ee).multiplyScalar(W).floor(),F.copy(ze).multiplyScalar(W).floor(),k=it;if(Ae.bindFramebuffer(N.FRAMEBUFFER,U)&&G&&Ae.drawBuffers(M,U),Ae.viewport(P),Ae.scissor(F),Ae.setScissorTest(k),ee){const ye=Te.get(M.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+D,ye.__webglTexture,z)}else if(he){const ye=Te.get(M.texture),Le=D||0;N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,ye.__webglTexture,z||0,Le)}S=-1},this.readRenderTargetPixels=function(M,D,z,G,U,ee,he){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _e=Te.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&he!==void 0&&(_e=_e[he]),_e){Ae.bindFramebuffer(N.FRAMEBUFFER,_e);try{const ye=M.texture,Le=ye.format,Fe=ye.type;if(!Ve.textureFormatReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ve.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=M.width-G&&z>=0&&z<=M.height-U&&N.readPixels(D,z,G,U,ke.convert(Le),ke.convert(Fe),ee)}finally{const ye=R!==null?Te.get(R).__webglFramebuffer:null;Ae.bindFramebuffer(N.FRAMEBUFFER,ye)}}},this.readRenderTargetPixelsAsync=async function(M,D,z,G,U,ee,he){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _e=Te.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&he!==void 0&&(_e=_e[he]),_e){const ye=M.texture,Le=ye.format,Fe=ye.type;if(!Ve.textureFormatReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ve.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=M.width-G&&z>=0&&z<=M.height-U){Ae.bindFramebuffer(N.FRAMEBUFFER,_e);const Se=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,Se),N.bufferData(N.PIXEL_PACK_BUFFER,ee.byteLength,N.STREAM_READ),N.readPixels(D,z,G,U,ke.convert(Le),ke.convert(Fe),0);const Ze=R!==null?Te.get(R).__webglFramebuffer:null;Ae.bindFramebuffer(N.FRAMEBUFFER,Ze);const ot=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await od(N,ot,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,Se),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,ee),N.deleteBuffer(Se),N.deleteSync(ot),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,D=null,z=0){M.isTexture!==!0&&(Sr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,M=arguments[1]);const G=Math.pow(2,-z),U=Math.floor(M.image.width*G),ee=Math.floor(M.image.height*G),he=D!==null?D.x:0,_e=D!==null?D.y:0;T.setTexture2D(M,0),N.copyTexSubImage2D(N.TEXTURE_2D,z,0,0,he,_e,U,ee),Ae.unbindTexture()},this.copyTextureToTexture=function(M,D,z=null,G=null,U=0){M.isTexture!==!0&&(Sr("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,M=arguments[1],D=arguments[2],U=arguments[3]||0,z=null);let ee,he,_e,ye,Le,Fe,Se,Ze,ot;const lt=M.isCompressedTexture?M.mipmaps[U]:M.image;z!==null?(ee=z.max.x-z.min.x,he=z.max.y-z.min.y,_e=z.isBox3?z.max.z-z.min.z:1,ye=z.min.x,Le=z.min.y,Fe=z.isBox3?z.min.z:0):(ee=lt.width,he=lt.height,_e=lt.depth||1,ye=0,Le=0,Fe=0),G!==null?(Se=G.x,Ze=G.y,ot=G.z):(Se=0,Ze=0,ot=0);const zt=ke.convert(D.format),Ke=ke.convert(D.type);let be;D.isData3DTexture?(T.setTexture3D(D,0),be=N.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(T.setTexture2DArray(D,0),be=N.TEXTURE_2D_ARRAY):(T.setTexture2D(D,0),be=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,D.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,D.unpackAlignment);const Fn=N.getParameter(N.UNPACK_ROW_LENGTH),Je=N.getParameter(N.UNPACK_IMAGE_HEIGHT),pn=N.getParameter(N.UNPACK_SKIP_PIXELS),mr=N.getParameter(N.UNPACK_SKIP_ROWS),qt=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,lt.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,lt.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,ye),N.pixelStorei(N.UNPACK_SKIP_ROWS,Le),N.pixelStorei(N.UNPACK_SKIP_IMAGES,Fe);const Zr=M.isDataArrayTexture||M.isData3DTexture,ct=D.isDataArrayTexture||D.isData3DTexture;if(M.isRenderTargetTexture||M.isDepthTexture){const yn=Te.get(M),jr=Te.get(D),en=Te.get(yn.__renderTarget),ei=Te.get(jr.__renderTarget);Ae.bindFramebuffer(N.READ_FRAMEBUFFER,en.__webglFramebuffer),Ae.bindFramebuffer(N.DRAW_FRAMEBUFFER,ei.__webglFramebuffer);for(let ti=0;ti<_e;ti++)Zr&&N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Te.get(M).__webglTexture,U,Fe+ti),M.isDepthTexture?(ct&&N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Te.get(D).__webglTexture,U,ot+ti),N.blitFramebuffer(ye,Le,ee,he,Se,Ze,ee,he,N.DEPTH_BUFFER_BIT,N.NEAREST)):ct?N.copyTexSubImage3D(be,U,Se,Ze,ot+ti,ye,Le,ee,he):N.copyTexSubImage2D(be,U,Se,Ze,ot+ti,ye,Le,ee,he);Ae.bindFramebuffer(N.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else ct?M.isDataTexture||M.isData3DTexture?N.texSubImage3D(be,U,Se,Ze,ot,ee,he,_e,zt,Ke,lt.data):D.isCompressedArrayTexture?N.compressedTexSubImage3D(be,U,Se,Ze,ot,ee,he,_e,zt,lt.data):N.texSubImage3D(be,U,Se,Ze,ot,ee,he,_e,zt,Ke,lt):M.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,U,Se,Ze,ee,he,zt,Ke,lt.data):M.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,U,Se,Ze,lt.width,lt.height,zt,lt.data):N.texSubImage2D(N.TEXTURE_2D,U,Se,Ze,ee,he,zt,Ke,lt);N.pixelStorei(N.UNPACK_ROW_LENGTH,Fn),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Je),N.pixelStorei(N.UNPACK_SKIP_PIXELS,pn),N.pixelStorei(N.UNPACK_SKIP_ROWS,mr),N.pixelStorei(N.UNPACK_SKIP_IMAGES,qt),U===0&&D.generateMipmaps&&N.generateMipmap(be),Ae.unbindTexture()},this.copyTextureToTexture3D=function(M,D,z=null,G=null,U=0){return M.isTexture!==!0&&(Sr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),z=arguments[0]||null,G=arguments[1]||null,M=arguments[2],D=arguments[3],U=arguments[4]||0),Sr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,D,z,G,U)},this.initRenderTarget=function(M){Te.get(M).__webglFramebuffer===void 0&&T.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?T.setTextureCube(M,0):M.isData3DTexture?T.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?T.setTexture2DArray(M,0):T.setTexture2D(M,0),Ae.unbindTexture()},this.resetState=function(){E=0,A=0,R=null,Ae.reset(),st.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return En}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}class Pa{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new xe(e),this.density=t}clone(){return new Pa(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class kg extends xt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new St,this.environmentIntensity=1,this.environmentRotation=new St,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Bg extends Nt{constructor(e=null,t=1,n=1,r,s,o,a,l,c=Gt,u=Gt,h,d){super(null,o,a,l,c,u,r,s,h,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Bc extends Mt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const nr=new Qe,zc=new Qe,Ls=[],Gc=new oi,zg=new Qe,Cr=new ie,Rr=new Vi;class Gg extends ie{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Bc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,zg)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new oi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,nr),Gc.copy(e.boundingBox).applyMatrix4(nr),this.boundingBox.union(Gc)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,nr),Rr.copy(e.boundingSphere).applyMatrix4(nr),this.boundingSphere.union(Rr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,o=e*s+1;for(let a=0;a<n.length;a++)n[a]=r[o+a]}raycast(e,t){const n=this.matrixWorld,r=this.count;if(Cr.geometry=this.geometry,Cr.material=this.material,Cr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Rr.copy(this.boundingSphere),Rr.applyMatrix4(n),e.ray.intersectsSphere(Rr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,nr),zc.multiplyMatrices(n,nr),Cr.matrixWorld=zc,Cr.raycast(e,Ls);for(let o=0,a=Ls.length;o<a;o++){const l=Ls[o];l.instanceId=s,l.object=this,t.push(l)}Ls.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Bc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Bg(new Float32Array(r*this.count),r,this.count,yo,gn));const s=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Hg extends ci{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new xe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Hc=new Qe,La=new oa,Is=new Vi,Ds=new C;class Vc extends xt{constructor(e=new bt,t=new Hg){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Is.copy(n.boundingSphere),Is.applyMatrix4(r),Is.radius+=s,e.ray.intersectsSphere(Is)===!1)return;Hc.copy(r).invert(),La.copy(e.ray).applyMatrix4(Hc);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let g=d,x=p;g<x;g++){const m=c.getX(g);Ds.fromBufferAttribute(h,m),Wc(Ds,m,l,r,e,t,this)}}else{const d=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let g=d,x=p;g<x;g++)Ds.fromBufferAttribute(h,g),Wc(Ds,g,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Wc(i,e,t,n,r,s,o){const a=La.distanceSqToPoint(i);if(a<t){const l=new C;La.closestPointToPoint(i,l),l.applyMatrix4(n);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class xn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),s+=n.distanceTo(r),t.push(s),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const n=this.getLengths();let r=0;const s=n.length;let o;t?o=t:o=e*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);const u=n[r],d=n[r+1]-u,p=(o-u)/d;return(r+p)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new J:new C);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t){const n=new C,r=[],s=[],o=[],a=new C,l=new Qe;for(let p=0;p<=e;p++){const g=p/e;r[p]=this.getTangentAt(g,new C)}s[0]=new C,o[0]=new C;let c=Number.MAX_VALUE;const u=Math.abs(r[0].x),h=Math.abs(r[0].y),d=Math.abs(r[0].z);u<=c&&(c=u,n.set(1,0,0)),h<=c&&(c=h,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let p=1;p<=e;p++){if(s[p]=s[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(r[p-1],r[p]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(vt(r[p-1].dot(r[p]),-1,1));s[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(r[p],s[p])}if(t===!0){let p=Math.acos(vt(s[0].dot(s[e]),-1,1));p/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(p=-p);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],p*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Ia extends xn{constructor(e=0,t=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new J){const n=t,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);const a=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const u=Math.cos(this.aRotation),h=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*u-p*h+this.aX,c=d*h+p*u+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Vg extends Ia{constructor(e,t,n,r,s,o){super(e,t,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Da(){let i=0,e=0,t=0,n=0;function r(s,o,a,l){i=s,e=a,t=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,u,h){let d=(o-s)/c-(a-s)/(c+u)+(a-o)/u,p=(a-o)/u-(l-o)/(u+h)+(l-a)/h;d*=u,p*=u,r(o,a,d,p)},calc:function(s){const o=s*s,a=o*s;return i+e*s+t*o+n*a}}}const Us=new C,Ua=new Da,Na=new Da,Fa=new Da;class Wg extends xn{constructor(e=[],t=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new C){const n=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,u;this.closed||a>0?c=r[(a-1)%s]:(Us.subVectors(r[0],r[1]).add(r[0]),c=Us);const h=r[a%s],d=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(Us.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=Us),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(h),p),x=Math.pow(h.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(u),p);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),Ua.initNonuniformCatmullRom(c.x,h.x,d.x,u.x,g,x,m),Na.initNonuniformCatmullRom(c.y,h.y,d.y,u.y,g,x,m),Fa.initNonuniformCatmullRom(c.z,h.z,d.z,u.z,g,x,m)}else this.curveType==="catmullrom"&&(Ua.initCatmullRom(c.x,h.x,d.x,u.x,this.tension),Na.initCatmullRom(c.y,h.y,d.y,u.y,this.tension),Fa.initCatmullRom(c.z,h.z,d.z,u.z,this.tension));return n.set(Ua.calc(l),Na.calc(l),Fa.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new C().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Xc(i,e,t,n,r){const s=(n-e)*.5,o=(r-t)*.5,a=i*i,l=i*a;return(2*t-2*n+s+o)*l+(-3*t+3*n-2*s-o)*a+s*i+t}function Xg(i,e){const t=1-i;return t*t*e}function qg(i,e){return 2*(1-i)*i*e}function Yg(i,e){return i*i*e}function Pr(i,e,t,n){return Xg(i,e)+qg(i,t)+Yg(i,n)}function $g(i,e){const t=1-i;return t*t*t*e}function Zg(i,e){const t=1-i;return 3*t*t*i*e}function jg(i,e){return 3*(1-i)*i*i*e}function Kg(i,e){return i*i*i*e}function Lr(i,e,t,n,r){return $g(i,e)+Zg(i,t)+jg(i,n)+Kg(i,r)}class qc extends xn{constructor(e=new J,t=new J,n=new J,r=new J){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new J){const n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Lr(e,r.x,s.x,o.x,a.x),Lr(e,r.y,s.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Jg extends xn{constructor(e=new C,t=new C,n=new C,r=new C){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new C){const n=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(Lr(e,r.x,s.x,o.x,a.x),Lr(e,r.y,s.y,o.y,a.y),Lr(e,r.z,s.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Yc extends xn{constructor(e=new J,t=new J){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new J){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new J){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Qg extends xn{constructor(e=new C,t=new C){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new C){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new C){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class $c extends xn{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){const n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Pr(e,r.x,s.x,o.x),Pr(e,r.y,s.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class e0 extends xn{constructor(e=new C,t=new C,n=new C){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new C){const n=t,r=this.v0,s=this.v1,o=this.v2;return n.set(Pr(e,r.x,s.x,o.x),Pr(e,r.y,s.y,o.y),Pr(e,r.z,s.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Zc extends xn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new J){const n=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],u=r[o>r.length-2?r.length-1:o+1],h=r[o>r.length-3?r.length-1:o+2];return n.set(Xc(a,l.x,c.x,u.x,h.x),Xc(a,l.y,c.y,u.y,h.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const r=e.points[t];this.points.push(new J().fromArray(r))}return this}}var jc=Object.freeze({__proto__:null,ArcCurve:Vg,CatmullRomCurve3:Wg,CubicBezierCurve:qc,CubicBezierCurve3:Jg,EllipseCurve:Ia,LineCurve:Yc,LineCurve3:Qg,QuadraticBezierCurve:$c,QuadraticBezierCurve3:e0,SplineCurve:Zc});class t0 extends xn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new jc[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=n){const o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let r=0,s=this.curves;r<s.length;r++){const o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const u=l[c];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const r=e.curves[t];this.curves.push(new jc[r.type]().fromJSON(r))}return this}}class n0 extends t0{constructor(e){super(),this.type="Path",this.currentPoint=new J,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Yc(this.currentPoint.clone(),new J(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){const s=new $c(this.currentPoint.clone(),new J(e,t),new J(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,s,o){const a=new qc(this.currentPoint.clone(),new J(e,t),new J(n,r),new J(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new Zc(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,s,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,r,s,o),this}absarc(e,t,n,r,s,o){return this.absellipse(e,t,n,n,r,s,o),this}ellipse(e,t,n,r,s,o,a,l){const c=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+c,t+u,n,r,s,o,a,l),this}absellipse(e,t,n,r,s,o,a,l){const c=new Ia(e,t,n,r,s,o,a,l);if(this.curves.length>0){const h=c.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(c);const u=c.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ir extends bt{constructor(e=[new J(0,-.5),new J(.5,0),new J(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=vt(r,0,Math.PI*2);const s=[],o=[],a=[],l=[],c=[],u=1/t,h=new C,d=new J,p=new C,g=new C,x=new C;let m=0,f=0;for(let b=0;b<=e.length-1;b++)switch(b){case 0:m=e[b+1].x-e[b].x,f=e[b+1].y-e[b].y,p.x=f*1,p.y=-m,p.z=f*0,x.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(x.x,x.y,x.z);break;default:m=e[b+1].x-e[b].x,f=e[b+1].y-e[b].y,p.x=f*1,p.y=-m,p.z=f*0,g.copy(p),p.x+=x.x,p.y+=x.y,p.z+=x.z,p.normalize(),l.push(p.x,p.y,p.z),x.copy(g)}for(let b=0;b<=t;b++){const w=n+b*u*r,v=Math.sin(w),L=Math.cos(w);for(let E=0;E<=e.length-1;E++){h.x=e[E].x*v,h.y=e[E].y,h.z=e[E].x*L,o.push(h.x,h.y,h.z),d.x=b/t,d.y=E/(e.length-1),a.push(d.x,d.y);const A=l[3*E+0]*v,R=l[3*E+1],S=l[3*E+0]*L;c.push(A,R,S)}}for(let b=0;b<t;b++)for(let w=0;w<e.length-1;w++){const v=w+b*e.length,L=v,E=v+e.length,A=v+e.length+1,R=v+1;s.push(L,E,R),s.push(A,R,E)}this.setIndex(s),this.setAttribute("position",new je(o,3)),this.setAttribute("uv",new je(a,2)),this.setAttribute("normal",new je(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ir(e.points,e.segments,e.phiStart,e.phiLength)}}class Dr extends Ir{constructor(e=1,t=1,n=4,r=8){const s=new n0;s.absarc(0,-t/2,e,Math.PI*1.5,0),s.absarc(0,t/2,e,0,Math.PI*.5),super(s.getPoints(n),r),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:n,radialSegments:r}}static fromJSON(e){return new Dr(e.radius,e.length,e.capSegments,e.radialSegments)}}class Ur extends bt{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);const s=[],o=[],a=[],l=[],c=new C,u=new J;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,d=3;h<=t;h++,d+=3){const p=n+h/t*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[d]/e+1)/2,u.y=(o[d+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=t;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new je(o,3)),this.setAttribute("normal",new je(a,3)),this.setAttribute("uv",new je(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ur(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class dt extends bt{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],d=[],p=[];let g=0;const x=[],m=n/2;let f=0;b(),o===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(u),this.setAttribute("position",new je(h,3)),this.setAttribute("normal",new je(d,3)),this.setAttribute("uv",new je(p,2));function b(){const v=new C,L=new C;let E=0;const A=(t-e)/n;for(let R=0;R<=s;R++){const S=[],_=R/s,P=_*(t-e)+e;for(let F=0;F<=r;F++){const k=F/r,H=k*l+a,j=Math.sin(H),X=Math.cos(H);L.x=P*j,L.y=-_*n+m,L.z=P*X,h.push(L.x,L.y,L.z),v.set(j,A,X).normalize(),d.push(v.x,v.y,v.z),p.push(k,1-_),S.push(g++)}x.push(S)}for(let R=0;R<r;R++)for(let S=0;S<s;S++){const _=x[S][R],P=x[S+1][R],F=x[S+1][R+1],k=x[S][R+1];(e>0||S!==0)&&(u.push(_,P,k),E+=3),(t>0||S!==s-1)&&(u.push(P,F,k),E+=3)}c.addGroup(f,E,0),f+=E}function w(v){const L=g,E=new J,A=new C;let R=0;const S=v===!0?e:t,_=v===!0?1:-1;for(let F=1;F<=r;F++)h.push(0,m*_,0),d.push(0,_,0),p.push(.5,.5),g++;const P=g;for(let F=0;F<=r;F++){const H=F/r*l+a,j=Math.cos(H),X=Math.sin(H);A.x=S*X,A.y=m*_,A.z=S*j,h.push(A.x,A.y,A.z),d.push(0,_,0),E.x=j*.5+.5,E.y=X*.5*_+.5,p.push(E.x,E.y),g++}for(let F=0;F<r;F++){const k=L+F,H=P+F;v===!0?u.push(H,H+1,k):u.push(H+1,H,k),R+=3}c.addGroup(f,R,v===!0?1:2),f+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new dt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class un extends dt{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new un(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Nr extends bt{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};const s=[],o=[];a(r),c(n),u(),this.setAttribute("position",new je(s,3)),this.setAttribute("normal",new je(s.slice(),3)),this.setAttribute("uv",new je(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(b){const w=new C,v=new C,L=new C;for(let E=0;E<t.length;E+=3)p(t[E+0],w),p(t[E+1],v),p(t[E+2],L),l(w,v,L,b)}function l(b,w,v,L){const E=L+1,A=[];for(let R=0;R<=E;R++){A[R]=[];const S=b.clone().lerp(v,R/E),_=w.clone().lerp(v,R/E),P=E-R;for(let F=0;F<=P;F++)F===0&&R===E?A[R][F]=S:A[R][F]=S.clone().lerp(_,F/P)}for(let R=0;R<E;R++)for(let S=0;S<2*(E-R)-1;S++){const _=Math.floor(S/2);S%2===0?(d(A[R][_+1]),d(A[R+1][_]),d(A[R][_])):(d(A[R][_+1]),d(A[R+1][_+1]),d(A[R+1][_]))}}function c(b){const w=new C;for(let v=0;v<s.length;v+=3)w.x=s[v+0],w.y=s[v+1],w.z=s[v+2],w.normalize().multiplyScalar(b),s[v+0]=w.x,s[v+1]=w.y,s[v+2]=w.z}function u(){const b=new C;for(let w=0;w<s.length;w+=3){b.x=s[w+0],b.y=s[w+1],b.z=s[w+2];const v=m(b)/2/Math.PI+.5,L=f(b)/Math.PI+.5;o.push(v,1-L)}g(),h()}function h(){for(let b=0;b<o.length;b+=6){const w=o[b+0],v=o[b+2],L=o[b+4],E=Math.max(w,v,L),A=Math.min(w,v,L);E>.9&&A<.1&&(w<.2&&(o[b+0]+=1),v<.2&&(o[b+2]+=1),L<.2&&(o[b+4]+=1))}}function d(b){s.push(b.x,b.y,b.z)}function p(b,w){const v=b*3;w.x=e[v+0],w.y=e[v+1],w.z=e[v+2]}function g(){const b=new C,w=new C,v=new C,L=new C,E=new J,A=new J,R=new J;for(let S=0,_=0;S<s.length;S+=9,_+=6){b.set(s[S+0],s[S+1],s[S+2]),w.set(s[S+3],s[S+4],s[S+5]),v.set(s[S+6],s[S+7],s[S+8]),E.set(o[_+0],o[_+1]),A.set(o[_+2],o[_+3]),R.set(o[_+4],o[_+5]),L.copy(b).add(w).add(v).divideScalar(3);const P=m(L);x(E,_+0,b,P),x(A,_+2,w,P),x(R,_+4,v,P)}}function x(b,w,v,L){L<0&&b.x===1&&(o[w]=b.x-1),v.x===0&&v.z===0&&(o[w]=L/2/Math.PI+.5)}function m(b){return Math.atan2(b.z,-b.x)}function f(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Nr(e.vertices,e.indices,e.radius,e.details)}}class Ns extends Nr{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,r=1/n,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-r,-n,0,-r,n,0,r,-n,0,r,n,-r,-n,0,-r,n,0,r,-n,0,r,n,0,-n,0,-r,n,0,-r,-n,0,r,n,0,r],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ns(e.radius,e.detail)}}class Fs extends Nr{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Fs(e.radius,e.detail)}}class Os extends Nr{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,r,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Os(e.radius,e.detail)}}class ir extends bt{constructor(e=.5,t=1,n=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);const a=[],l=[],c=[],u=[];let h=e;const d=(t-e)/r,p=new C,g=new J;for(let x=0;x<=r;x++){for(let m=0;m<=n;m++){const f=s+m/n*o;p.x=h*Math.cos(f),p.y=h*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,u.push(g.x,g.y)}h+=d}for(let x=0;x<r;x++){const m=x*(n+1);for(let f=0;f<n;f++){const b=f+m,w=b,v=b+n+1,L=b+n+2,E=b+1;a.push(w,v,E),a.push(v,L,E)}}this.setIndex(a),this.setAttribute("position",new je(l,3)),this.setAttribute("normal",new je(c,3)),this.setAttribute("uv",new je(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ir(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Ot extends bt{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],h=new C,d=new C,p=[],g=[],x=[],m=[];for(let f=0;f<=n;f++){const b=[],w=f/n;let v=0;f===0&&o===0?v=.5/t:f===n&&l===Math.PI&&(v=-.5/t);for(let L=0;L<=t;L++){const E=L/t;h.x=-e*Math.cos(r+E*s)*Math.sin(o+w*a),h.y=e*Math.cos(o+w*a),h.z=e*Math.sin(r+E*s)*Math.sin(o+w*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),x.push(d.x,d.y,d.z),m.push(E+v,1-w),b.push(c++)}u.push(b)}for(let f=0;f<n;f++)for(let b=0;b<t;b++){const w=u[f][b+1],v=u[f][b],L=u[f+1][b],E=u[f+1][b+1];(f!==0||o>0)&&p.push(w,v,E),(f!==n-1||l<Math.PI)&&p.push(v,L,E)}this.setIndex(p),this.setAttribute("position",new je(g,3)),this.setAttribute("normal",new je(x,3)),this.setAttribute("uv",new je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ot(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class vi extends bt{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s},n=Math.floor(n),r=Math.floor(r);const o=[],a=[],l=[],c=[],u=new C,h=new C,d=new C;for(let p=0;p<=n;p++)for(let g=0;g<=r;g++){const x=g/r*s,m=p/n*Math.PI*2;h.x=(e+t*Math.cos(m))*Math.cos(x),h.y=(e+t*Math.cos(m))*Math.sin(x),h.z=t*Math.sin(m),a.push(h.x,h.y,h.z),u.x=e*Math.cos(x),u.y=e*Math.sin(x),d.subVectors(h,u).normalize(),l.push(d.x,d.y,d.z),c.push(g/r),c.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=r;g++){const x=(r+1)*p+g-1,m=(r+1)*(p-1)+g-1,f=(r+1)*(p-1)+g,b=(r+1)*p+g;o.push(x,m,b),o.push(m,f,b)}this.setIndex(o),this.setAttribute("position",new je(a,3)),this.setAttribute("normal",new je(l,3)),this.setAttribute("uv",new je(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vi(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Be extends ci{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jo,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new St,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Kc extends Be{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new J(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return vt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new xe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new xe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new xe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class xi extends ci{static get type(){return"MeshLambertMaterial"}constructor(e){super(),this.isMeshLambertMaterial=!0,this.color=new xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jo,this.normalScale=new J(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new St,this.combine=uo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class ks extends xt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new xe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class i0 extends ks{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(xt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new xe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Oa=new Qe,Jc=new C,Qc=new C;class eu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new J(512,512),this.map=null,this.mapPass=null,this.matrix=new Qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ya,this._frameExtents=new J(1,1),this._viewportCount=1,this._viewports=[new nt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Jc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Jc),Qc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Qc),t.updateMatrixWorld(),Oa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Oa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Oa)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const tu=new Qe,Fr=new C,ka=new C;class r0 extends eu{constructor(){super(new Zt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new J(4,2),this._viewportCount=6,this._viewports=[new nt(2,1,1,1),new nt(0,1,1,1),new nt(3,1,1,1),new nt(1,1,1,1),new nt(3,0,1,1),new nt(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),Fr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Fr),ka.copy(n.position),ka.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(ka),n.updateMatrixWorld(),r.makeTranslation(-Fr.x,-Fr.y,-Fr.z),tu.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(tu)}}class nu extends ks{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new r0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class s0 extends eu{constructor(){super(new Ts(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ba extends ks{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(xt.DEFAULT_UP),this.updateMatrix(),this.target=new xt,this.shadow=new s0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class o0 extends ks{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class a0{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=iu(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=iu();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function iu(){return performance.now()}const ru=new Qe;class l0{constructor(e,t,n=0,r=1/0){this.ray=new oa(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new aa,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return ru.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ru),this}intersectObject(e,t=!0,n=[]){return za(e,this,n,t),n.sort(su),n}intersectObjects(e,t=!0,n=[]){for(let r=0,s=e.length;r<s;r++)za(e[r],this,n,t);return n.sort(su),n}}function su(i,e){return i.distance-e.distance}function za(i,e,t,n){let r=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(r=!1),r===!0&&n===!0){const s=i.children;for(let o=0,a=s.length;o<a;o++)za(s[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:tn}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=tn);const ou={easy:{label:"Easy",emoji:"🟢",startGold:600,startLives:30,enemyHpMult:.75,enemySpeedMult:.9,goldMult:1.2},normal:{label:"Normal",emoji:"🟡",startGold:400,startLives:20,enemyHpMult:1,enemySpeedMult:1,goldMult:1},hard:{label:"Hard",emoji:"🔴",startGold:250,startLives:10,enemyHpMult:1.4,enemySpeedMult:1.15,goldMult:.8}};function Ga(i,e){return`${i},${e}`}const c0={cols:20,rows:12,cellSize:1,origin:{x:-10,z:-6},path:[[0,5],[1,5],[2,5],[3,5],[3,6],[3,7],[4,7],[5,7],[6,7],[7,7],[7,6],[7,5],[7,4],[8,4],[9,4],[10,4],[11,4],[11,5],[11,6],[11,7],[12,7],[13,7],[14,7],[15,7],[15,6],[15,5],[15,4],[16,4],[17,4],[18,4],[19,4]],spawnCell:[0,5],goalCell:[19,4]},u0={arrow:{name:"Arrow",damageType:"physical",levels:[{buildCost:80,upgradeCost:0,damage:18,cooldownSec:.6,range:3.5,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:30,cooldownSec:.5,range:4,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:50,cooldownSec:.4,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"arrow_rapid",name:"Rapid Arrow",cost:250,desc:"Insane ATK SPD"},{type:"arrow_pierce",name:"Piercing Arrow",cost:250,desc:"Chain ×4"}]},cannon:{name:"Cannon",damageType:"physical",levels:[{buildCost:120,upgradeCost:0,damage:40,cooldownSec:2,range:3,slow:null,aoeRadius:1.2,dot:null,chain:null},{buildCost:0,upgradeCost:100,damage:65,cooldownSec:1.8,range:3.5,slow:null,aoeRadius:1.5,dot:null,chain:null},{buildCost:0,upgradeCost:180,damage:100,cooldownSec:1.5,range:4,slow:null,aoeRadius:1.8,dot:null,chain:null}]},ice:{name:"Ice",damageType:"ice",levels:[{buildCost:80,upgradeCost:0,damage:8,cooldownSec:1.2,range:3,slow:{pct:.3,durationSec:2},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:14,cooldownSec:1,range:3.5,slow:{pct:.4,durationSec:2.5},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:22,cooldownSec:.8,range:4,slow:{pct:.5,durationSec:3},aoeRadius:0,dot:null,chain:null}]},fire:{name:"Fire",damageType:"fire",levels:[{buildCost:100,upgradeCost:0,damage:12,cooldownSec:1,range:3,slow:null,aoeRadius:0,dot:{dps:10,durationSec:3},chain:null},{buildCost:0,upgradeCost:90,damage:20,cooldownSec:.9,range:3.5,slow:null,aoeRadius:0,dot:{dps:16,durationSec:3},chain:null},{buildCost:0,upgradeCost:160,damage:32,cooldownSec:.8,range:4,slow:null,aoeRadius:0,dot:{dps:24,durationSec:3.5},chain:null}]},lightning:{name:"Lightning",damageType:"lightning",levels:[{buildCost:110,upgradeCost:0,damage:15,cooldownSec:1.2,range:3.5,slow:null,aoeRadius:0,dot:null,chain:{targets:2,rangeFalloff:2}},{buildCost:0,upgradeCost:100,damage:25,cooldownSec:1,range:4,slow:null,aoeRadius:0,dot:null,chain:{targets:3,rangeFalloff:2.5}},{buildCost:0,upgradeCost:170,damage:40,cooldownSec:.8,range:4.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}}]},poison:{name:"Poison",damageType:"poison",levels:[{buildCost:100,upgradeCost:0,damage:5,cooldownSec:1.5,range:3,slow:null,aoeRadius:1.5,dot:{dps:8,durationSec:4},chain:null},{buildCost:0,upgradeCost:90,damage:8,cooldownSec:1.3,range:3.5,slow:null,aoeRadius:1.8,dot:{dps:12,durationSec:4},chain:null},{buildCost:0,upgradeCost:160,damage:14,cooldownSec:1,range:4,slow:null,aoeRadius:2,dot:{dps:18,durationSec:5},chain:null}]},sniper:{name:"Sniper",damageType:"sniper",levels:[{buildCost:150,upgradeCost:0,damage:100,cooldownSec:2.8,range:7,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:175,cooldownSec:2.3,range:8,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:220,damage:280,cooldownSec:1.8,range:9,slow:null,aoeRadius:0,dot:null,chain:null}]},arrow_rapid:{name:"Rapid Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:35,cooldownSec:.15,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null}]},arrow_pierce:{name:"Piercing Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:90,cooldownSec:.5,range:5.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}}]}},h0={grunt:{name:"Grunt",hp:60,speed:1,bounty:8,weakness:["physical"],resistance:[],armor:0,shield:0,special:"none"},tank:{name:"Tank",hp:280,speed:.5,bounty:18,weakness:["fire"],resistance:["physical"],armor:8,shield:0,special:"none"},runner:{name:"Runner",hp:80,speed:1.6,bounty:10,weakness:["ice"],resistance:["physical"],armor:0,shield:0,special:"none"},swarm:{name:"Swarm",hp:25,speed:1.2,bounty:3,weakness:["lightning"],resistance:["sniper"],armor:0,shield:0,special:"none"},shield:{name:"Shield",hp:100,speed:.8,bounty:14,weakness:["fire"],resistance:["ice"],armor:0,shield:80,special:"none"},healer:{name:"Healer",hp:90,speed:.7,bounty:16,weakness:["poison"],resistance:[],armor:0,shield:0,special:"heal",healRadius:2.5,healAmount:15,healIntervalSec:2},boss:{name:"Boss",hp:1200,speed:.4,bounty:120,weakness:["sniper"],resistance:["physical","ice","poison"],armor:12,shield:0,special:"none"}},d0={prepSec:8,waves:JSON.parse('[{"groups":[{"type":"grunt","count":13,"intervalSec":0.8},{"type":"runner","count":6,"intervalSec":0.8}]},{"groups":[{"type":"runner","count":11,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"grunt","count":20,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"runner","count":10,"intervalSec":0.78}]},{"groups":[{"type":"runner","count":15,"intervalSec":0.78},{"type":"runner","count":6,"intervalSec":0.78},{"type":"runner","count":11,"intervalSec":0.78}]},{"groups":[{"type":"grunt","count":24,"intervalSec":0.77},{"type":"runner","count":16,"intervalSec":0.77},{"type":"grunt","count":10,"intervalSec":0.77}]},{"groups":[{"type":"runner","count":10,"intervalSec":0.77}]},{"groups":[{"type":"grunt","count":14,"intervalSec":0.76},{"type":"grunt","count":26,"intervalSec":0.76},{"type":"grunt","count":13,"intervalSec":0.76}]},{"groups":[{"type":"grunt","count":17,"intervalSec":0.76}]},{"groups":[{"type":"boss","count":1,"intervalSec":1},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":38,"intervalSec":0.38},{"type":"runner","count":9,"intervalSec":0.74},{"type":"runner","count":17,"intervalSec":0.74}]},{"groups":[{"type":"swarm","count":30,"intervalSec":0.38}]},{"groups":[{"type":"grunt","count":16,"intervalSec":0.74},{"type":"tank","count":3,"intervalSec":1.87}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.37},{"type":"runner","count":10,"intervalSec":0.73},{"type":"grunt","count":18,"intervalSec":0.73}]},{"groups":[{"type":"runner","count":15,"intervalSec":0.73}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.84},{"type":"swarm","count":40,"intervalSec":0.37},{"type":"tank","count":4,"intervalSec":1.84}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.72},{"type":"swarm","count":39,"intervalSec":0.37},{"type":"swarm","count":45,"intervalSec":0.37}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.71},{"type":"grunt","count":22,"intervalSec":0.71},{"type":"grunt","count":26,"intervalSec":0.71}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.81},{"type":"swarm","count":37,"intervalSec":0.36},{"type":"swarm","count":35,"intervalSec":0.36}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5}]},{"groups":[{"type":"grunt","count":21,"intervalSec":0.7},{"type":"runner","count":11,"intervalSec":0.7}]},{"groups":[{"type":"shield","count":5,"intervalSec":1.58},{"type":"runner","count":11,"intervalSec":0.69}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.77},{"type":"runner","count":19,"intervalSec":0.69},{"type":"grunt","count":24,"intervalSec":0.69}]},{"groups":[{"type":"grunt","count":31,"intervalSec":0.68}]},{"groups":[{"type":"swarm","count":44,"intervalSec":0.35},{"type":"swarm","count":35,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.68}]},{"groups":[{"type":"tank","count":10,"intervalSec":1.74},{"type":"grunt","count":19,"intervalSec":0.67}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.67},{"type":"tank","count":8,"intervalSec":1.73}]},{"groups":[{"type":"shield","count":10,"intervalSec":1.52},{"type":"swarm","count":35,"intervalSec":0.34},{"type":"shield","count":4,"intervalSec":1.52}]},{"groups":[{"type":"shield","count":10,"intervalSec":1.51},{"type":"swarm","count":43,"intervalSec":0.34}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5}]},{"groups":[{"type":"tank","count":6,"intervalSec":1.69}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.64},{"type":"healer","count":3,"intervalSec":3.36}]},{"groups":[{"type":"tank","count":7,"intervalSec":1.67},{"type":"swarm","count":37,"intervalSec":0.33},{"type":"grunt","count":23,"intervalSec":0.64}]},{"groups":[{"type":"shield","count":5,"intervalSec":1.46}]},{"groups":[{"type":"swarm","count":32,"intervalSec":0.33},{"type":"runner","count":15,"intervalSec":0.62}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.62},{"type":"shield","count":8,"intervalSec":1.44},{"type":"swarm","count":39,"intervalSec":0.33}]},{"groups":[{"type":"healer","count":5,"intervalSec":3.26},{"type":"grunt","count":32,"intervalSec":0.61}]},{"groups":[{"type":"healer","count":2,"intervalSec":3.24}]},{"groups":[{"type":"tank","count":6,"intervalSec":1.61},{"type":"runner","count":12,"intervalSec":0.6}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":6,"intervalSec":3.18},{"type":"healer","count":3,"intervalSec":3.18},{"type":"healer","count":6,"intervalSec":3.18}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.58},{"type":"shield","count":7,"intervalSec":1.38},{"type":"runner","count":23,"intervalSec":0.59}]},{"groups":[{"type":"runner","count":17,"intervalSec":0.59},{"type":"shield","count":11,"intervalSec":1.37},{"type":"tank","count":7,"intervalSec":1.57},{"type":"healer","count":5,"intervalSec":3.14}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.58},{"type":"swarm","count":55,"intervalSec":0.31}]},{"groups":[{"type":"healer","count":4,"intervalSec":3.1},{"type":"runner","count":23,"intervalSec":0.58},{"type":"runner","count":21,"intervalSec":0.58}]},{"groups":[{"type":"runner","count":16,"intervalSec":0.57},{"type":"runner","count":20,"intervalSec":0.57}]},{"groups":[{"type":"healer","count":6,"intervalSec":3.06},{"type":"tank","count":9,"intervalSec":1.53}]},{"groups":[{"type":"healer","count":3,"intervalSec":3.04},{"type":"shield","count":9,"intervalSec":1.32},{"type":"swarm","count":52,"intervalSec":0.3},{"type":"shield","count":12,"intervalSec":1.32}]},{"groups":[{"type":"shield","count":11,"intervalSec":1.31},{"type":"swarm","count":43,"intervalSec":0.3},{"type":"grunt","count":25,"intervalSec":0.56}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.49},{"type":"shield","count":13,"intervalSec":1.29},{"type":"swarm","count":64,"intervalSec":0.3}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.3},{"type":"runner","count":22,"intervalSec":0.54},{"type":"tank","count":7,"intervalSec":1.48}]},{"groups":[{"type":"grunt","count":35,"intervalSec":0.54},{"type":"swarm","count":65,"intervalSec":0.29}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"swarm","count":66,"intervalSec":0.29},{"type":"grunt","count":27,"intervalSec":0.53}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"tank","count":10,"intervalSec":1.45}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.44},{"type":"swarm","count":56,"intervalSec":0.29}]},{"groups":[{"type":"grunt","count":27,"intervalSec":0.52},{"type":"swarm","count":62,"intervalSec":0.29},{"type":"tank","count":8,"intervalSec":1.43}]},{"groups":[{"type":"runner","count":20,"intervalSec":0.51},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"grunt","count":36,"intervalSec":0.51}]},{"groups":[{"type":"runner","count":26,"intervalSec":0.51},{"type":"healer","count":3,"intervalSec":2.82},{"type":"runner","count":25,"intervalSec":0.51}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":4,"intervalSec":2.78},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"shield","count":8,"intervalSec":1.19},{"type":"shield","count":14,"intervalSec":1.19}]},{"groups":[{"type":"healer","count":4,"intervalSec":2.76},{"type":"healer","count":6,"intervalSec":2.76},{"type":"swarm","count":61,"intervalSec":0.28}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.37},{"type":"shield","count":13,"intervalSec":1.17}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.36},{"type":"swarm","count":59,"intervalSec":0.27},{"type":"shield","count":10,"intervalSec":1.16},{"type":"grunt","count":33,"intervalSec":0.48}]},{"groups":[{"type":"grunt","count":37,"intervalSec":0.48},{"type":"tank","count":9,"intervalSec":1.35}]},{"groups":[{"type":"grunt","count":44,"intervalSec":0.47},{"type":"swarm","count":69,"intervalSec":0.27},{"type":"healer","count":7,"intervalSec":2.68},{"type":"shield","count":14,"intervalSec":1.14}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.33},{"type":"shield","count":13,"intervalSec":1.13},{"type":"grunt","count":38,"intervalSec":0.47}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.46},{"type":"shield","count":13,"intervalSec":1.12},{"type":"shield","count":12,"intervalSec":1.12},{"type":"healer","count":7,"intervalSec":2.64}]},{"groups":[{"type":"healer","count":5,"intervalSec":2.62},{"type":"tank","count":9,"intervalSec":1.31}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":5,"intervalSec":2.58},{"type":"healer","count":4,"intervalSec":2.58},{"type":"healer","count":6,"intervalSec":2.58}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.28},{"type":"shield","count":14,"intervalSec":1.08},{"type":"grunt","count":42,"intervalSec":0.44}]},{"groups":[{"type":"shield","count":14,"intervalSec":1.07},{"type":"grunt","count":42,"intervalSec":0.44},{"type":"shield","count":12,"intervalSec":1.07}]},{"groups":[{"type":"swarm","count":70,"intervalSec":0.25},{"type":"grunt","count":36,"intervalSec":0.43},{"type":"tank","count":9,"intervalSec":1.26},{"type":"runner","count":22,"intervalSec":0.43},{"type":"shield","count":11,"intervalSec":1.06}]},{"groups":[{"type":"swarm","count":52,"intervalSec":0.25},{"type":"runner","count":25,"intervalSec":0.43},{"type":"runner","count":20,"intervalSec":0.43}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.42},{"type":"shield","count":14,"intervalSec":1.04},{"type":"shield","count":9,"intervalSec":1.04},{"type":"shield","count":14,"intervalSec":1.04}]},{"groups":[{"type":"runner","count":21,"intervalSec":0.42},{"type":"tank","count":15,"intervalSec":1.23},{"type":"shield","count":13,"intervalSec":1.03},{"type":"grunt","count":34,"intervalSec":0.42}]},{"groups":[{"type":"shield","count":15,"intervalSec":1.02},{"type":"healer","count":7,"intervalSec":2.44},{"type":"runner","count":20,"intervalSec":0.41},{"type":"shield","count":15,"intervalSec":1.02},{"type":"grunt","count":40,"intervalSec":0.41}]},{"groups":[{"type":"grunt","count":39,"intervalSec":0.41},{"type":"runner","count":20,"intervalSec":0.41},{"type":"grunt","count":33,"intervalSec":0.41}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.24},{"type":"runner","count":28,"intervalSec":0.4},{"type":"grunt","count":43,"intervalSec":0.4},{"type":"shield","count":16,"intervalSec":1}]},{"groups":[{"type":"swarm","count":72,"intervalSec":0.24},{"type":"tank","count":13,"intervalSec":1.18},{"type":"runner","count":25,"intervalSec":0.4},{"type":"shield","count":13,"intervalSec":1},{"type":"shield","count":14,"intervalSec":1}]},{"groups":[{"type":"swarm","count":74,"intervalSec":0.23},{"type":"swarm","count":70,"intervalSec":0.23},{"type":"swarm","count":62,"intervalSec":0.23},{"type":"runner","count":23,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":79,"intervalSec":0.23},{"type":"swarm","count":67,"intervalSec":0.23},{"type":"runner","count":30,"intervalSec":0.4},{"type":"grunt","count":49,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":82,"intervalSec":0.23},{"type":"swarm","count":73,"intervalSec":0.23},{"type":"healer","count":6,"intervalSec":2.3}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.23},{"type":"runner","count":27,"intervalSec":0.4},{"type":"healer","count":7,"intervalSec":2.28},{"type":"runner","count":28,"intervalSec":0.4}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.4},{"type":"runner","count":22,"intervalSec":0.4},{"type":"swarm","count":64,"intervalSec":0.23},{"type":"grunt","count":47,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.26}]},{"groups":[{"type":"shield","count":15,"intervalSec":1},{"type":"tank","count":10,"intervalSec":1.12},{"type":"healer","count":6,"intervalSec":2.24},{"type":"shield","count":13,"intervalSec":1}]},{"groups":[{"type":"healer","count":7,"intervalSec":2.22},{"type":"swarm","count":75,"intervalSec":0.22},{"type":"healer","count":7,"intervalSec":2.22},{"type":"runner","count":25,"intervalSec":0.4}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.22},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"shield","count":17,"intervalSec":1},{"type":"grunt","count":45,"intervalSec":0.4}]},{"groups":[{"type":"tank","count":17,"intervalSec":1.08},{"type":"runner","count":27,"intervalSec":0.4},{"type":"tank","count":12,"intervalSec":1.08}]},{"groups":[{"type":"swarm","count":64,"intervalSec":0.21},{"type":"tank","count":17,"intervalSec":1.07},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":73,"intervalSec":0.21}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.12},{"type":"healer","count":8,"intervalSec":2.12},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"swarm","count":83,"intervalSec":0.21},{"type":"tank","count":16,"intervalSec":1.06}]},{"groups":[{"type":"runner","count":32,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.1},{"type":"swarm","count":84,"intervalSec":0.21},{"type":"runner","count":26,"intervalSec":0.4},{"type":"shield","count":11,"intervalSec":1}]},{"groups":[{"type":"grunt","count":39,"intervalSec":0.4},{"type":"runner","count":29,"intervalSec":0.4},{"type":"shield","count":16,"intervalSec":1}]},{"groups":[{"type":"swarm","count":86,"intervalSec":0.21},{"type":"healer","count":5,"intervalSec":2.06},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":69,"intervalSec":0.21},{"type":"grunt","count":42,"intervalSec":0.4}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.04},{"type":"grunt","count":44,"intervalSec":0.4},{"type":"tank","count":14,"intervalSec":1.02},{"type":"runner","count":31,"intervalSec":0.4},{"type":"swarm","count":86,"intervalSec":0.2}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5}]}]')},f0={ranks:[{name:"S",min:18e3},{name:"A",min:12e3},{name:"B",min:6e3},{name:"C",min:0}]},ce=c0,jt=u0,Or=h0,kt=d0,p0=f0,$n=1/20,au=.7,kr=12,Wt=()=>typeof window>"u"?!1:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<768,Ue={isMobile:Wt(),maxParticles:Wt()?200:800,enablePostProcessing:!Wt(),enableShadows:!Wt(),pixelRatio:Wt()?1:Math.min(window.devicePixelRatio,2),terrain:{underlayPadding:Wt()?12:18,underlaySegments:Wt()?36:72},atmosphere:{fogColor:1057815,fogDensity:Wt()?.011:.014,spawnPulseSpeed:2.4,goalPulseSpeed:1.7,bloomStrength:Wt()?.38:.62,bloomRadius:Wt()?.28:.45,bloomThreshold:Wt()?.9:.82,vignetteStrength:Wt()?.1:.16,grainAmount:Wt()?0:.018}};function _n(i,e){return{x:ce.origin.x+(i+.5)*ce.cellSize,z:ce.origin.z+(e+.5)*ce.cellSize}}function m0(){return ce.path.map(([i,e])=>_n(i,e))}function g0(i,e){const t=i.x-e.x,n=i.z-e.z;return Math.sqrt(t*t+n*n)}function v0(){return[{name:"Airstrike",emoji:"✈️",cooldown:60,remaining:0,description:"All enemies take 200 AOE damage"},{name:"Freeze",emoji:"🧊",cooldown:45,remaining:0,description:"Freeze all enemies for 5s"},{name:"Repair",emoji:"💖",cooldown:90,remaining:0,description:"Restore 5 lives"}]}function x0(){return{totalDamageDealt:0,damageByType:{},killsByTower:{},longestStreak:0,towersBuilt:0,towersSold:0,goldEarned:0,goldSpent:0}}function Ha(i="normal"){const e=m0(),t=new Set;for(const[r,s]of ce.path)t.add(Ga(r,s));const n=ou[i];return{phase:"idle",gold:n.startGold,lives:n.startLives,maxLives:n.startLives,currentWave:0,score:0,perfectWaves:0,speedMultiplier:1,paused:!1,totalKills:0,difficulty:i,towers:[],enemies:[],projectiles:[],prepTimer:0,spawnTimers:[],spawnCounts:[],waveEnemiesSpawned:0,waveEnemiesTotal:0,waveLivesLostThisWave:0,lastWaveClearGold:0,milestoneReached:0,waveModifier:null,buffGoldMult:1,buffDamageMult:1,buffRangeMult:1,buffChoicePending:!1,endlessMode:!1,nextId:1,killStreak:0,killStreakTimer:0,floatingTexts:[],skills:v0(),stats:x0(),pathWorld:e,occupiedCells:new Set,pathCells:t}}function lu(i){i.occupiedCells.clear();for(const e of i.towers)i.occupiedCells.add(Ga(e.col,e.row))}class _0{constructor(){fe(this,"listeners",new Map)}on(e,t){this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t)}off(e,t){const n=this.listeners.get(e);if(!n)return;const r=n.indexOf(t);r>=0&&n.splice(r,1)}emit(e){const t=this.listeners.get(e.type);if(t)for(const n of t)n(e)}clear(){this.listeners.clear()}}const qe=new _0,Bs={BLITZ:{key:"BLITZ",label:"BLITZ",emoji:"⚡",desc:"+25% SPD, +30% gold",spdMult:1.25,hpMult:1,armorBonus:0,bountyMult:1.3},ARMORED:{key:"ARMORED",label:"ARMORED",emoji:"🛡",desc:"+3 armor, +20% gold",spdMult:1,hpMult:1,armorBonus:3,bountyMult:1.2},FRENZY:{key:"FRENZY",label:"FRENZY",emoji:"🔥",desc:"+15% HP, +15% SPD, +25% gold",spdMult:1.15,hpMult:1.15,armorBonus:0,bountyMult:1.25}},cu=Object.keys(Bs);function y0(i){return i%5!==0||i===25||i===50||i===75||i===99?null:cu[Math.floor(Math.random()*cu.length)]}function uu(i){if(i.currentWave<kt.waves.length)return i.currentWave;const e=Math.max(1,kt.waves.length-40);return 40+(i.currentWave-kt.waves.length)%e}function Va(i){if(i.currentWave>=kt.waves.length&&!i.endlessMode)return;i.phase="prep",i.prepTimer=kt.prepSec,i.waveLivesLostThisWave=0;const e=kt.waves[uu(i)];i.spawnTimers=e.groups.map(()=>0),i.spawnCounts=e.groups.map(()=>0),i.waveEnemiesSpawned=0,i.waveEnemiesTotal=e.groups.reduce((t,n)=>t+n.count,0),i.waveModifier=y0(i.currentWave+1)}function S0(i,e){if(i.phase==="prep"){if(i.prepTimer-=e,i.prepTimer<=0){const s=Math.min(150,Math.max(10,Math.floor(i.gold*.01)));i.gold+=s,i.floatingTexts.push({id:i.nextId++,worldX:0,worldZ:0,value:`+${s}g 利息`,color:"#aaff55",life:2,maxLife:2}),i.phase="wave"}i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));return}if(i.phase!=="wave")return;i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));const t=kt.waves[uu(i)];if(!t)return;for(let s=0;s<t.groups.length;s++){const o=t.groups[s];i.spawnCounts[s]>=o.count||(i.spawnTimers[s]-=e,i.spawnTimers[s]<=0&&(M0(i,o.type),i.spawnCounts[s]++,i.waveEnemiesSpawned++,i.spawnTimers[s]=o.intervalSec))}const n=i.waveEnemiesSpawned>=i.waveEnemiesTotal,r=i.enemies.every(s=>!s.alive||s.reached);if(n&&r){i.score+=i.currentWave<kt.waves.length?100:0,i.waveLivesLostThisWave===0&&(i.score+=150,i.perfectWaves++);const s=i.currentWave+1;let o=100;s>60?o=250:s>30?o=200:s>10?o=150:o=120,i.gold+=o,i.lastWaveClearGold=o;const a=i.waveLivesLostThisWave===0;qe.emit({type:"waveCleared",wave:s,goldBonus:o,perfect:a}),s===99||s>0&&s%25===0?(i.gold+=500,i.milestoneReached=s,qe.emit({type:"milestone",wave:s})):i.milestoneReached=0,i.currentWave++,i.enemies=i.enemies.filter(c=>c.alive&&!c.reached),i.projectiles=i.projectiles.filter(c=>c.alive),i.currentWave>=kt.waves.length&&!i.endlessMode?(i.score+=i.lives*25,i.phase="won",qe.emit({type:"gameOver",won:!0,score:i.score})):Va(i)}}function M0(i,e){const t=Or[e],n=_n(ce.path[0][0],ce.path[0][1]),r=ou[i.difficulty],s=1+i.currentWave*.04,o=i.waveModifier?Bs[i.waveModifier]:null,a=s*r.enemyHpMult*((o==null?void 0:o.hpMult)??1),l=r.enemySpeedMult*((o==null?void 0:o.spdMult)??1),c=Math.pow(s,.5)*r.goldMult*((o==null?void 0:o.bountyMult)??1),u=(o==null?void 0:o.armorBonus)??0,h={id:i.nextId++,type:e,hp:Math.ceil(t.hp*a),maxHp:Math.ceil(t.hp*a),speed:t.speed*l,bounty:Math.ceil(t.bounty*c),pathIndex:0,pathProgress:0,worldX:n.x,worldZ:n.z,prevWorldX:n.x,prevWorldZ:n.z,alive:!0,reached:!1,slow:null,dots:[],shield:t.shield?Math.ceil(t.shield*a):0,maxShield:t.shield?Math.ceil(t.shield*a):0,armor:(t.armor??0)+u,special:t.special??"none",healCooldown:0};i.enemies.push(h),e==="boss"&&qe.emit({type:"bossSpawned",enemyId:h.id,worldX:h.worldX,worldZ:h.worldZ})}function Wa(i,e){e.hp=0,e.alive=!1;const t=Math.ceil(e.bounty*i.buffGoldMult);i.gold+=t,i.totalKills++,i.killStreak++,i.killStreakTimer=3,i.killStreak%10===0&&(i.gold+=50,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`⚡ x${i.killStreak} COMBO! +50g`,color:"#ffee00",life:2,maxLife:2}),qe.emit({type:"streakBonus",streak:i.killStreak,gold:50})),i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`+${t}g`,color:"#ffd700",life:1.2,maxLife:1.2}),qe.emit({type:"enemyKilled",enemyId:e.id,worldX:e.worldX,worldZ:e.worldZ,bounty:e.bounty,killStreak:i.killStreak})}const hu=4,w0=20,b0=50,E0=80;function T0(i,e){const t=i.pathWorld;if(t.length<2)return;let n=1;i.currentWave>=E0?n=1.3:i.currentWave>=b0&&(n=1.15);for(const r of i.enemies){if(!r.alive||r.reached)continue;r.prevWorldX=r.worldX,r.prevWorldZ=r.worldZ;for(let a=r.dots.length-1;a>=0;a--){const l=r.dots[a],c=l.dps*e;if(A0(i,r,c,l.damageType),l.remaining-=e,l.remaining<=0&&r.dots.splice(a,1),!r.alive)break}if(!r.alive)continue;let s=r.speed*n;if(r.slow&&(s*=1-r.slow.pct,r.slow.remaining-=e,r.slow.remaining<=0&&(r.slow=null)),r.special==="heal"){const a=Or[r.type];if(r.healCooldown-=e,r.healCooldown<=0){const l=a.healRadius??2.5,c=a.healAmount??15;for(const u of i.enemies){if(!u.alive||u.reached||u.id===r.id)continue;const h=u.worldX-r.worldX,d=u.worldZ-r.worldZ;Math.sqrt(h*h+d*d)<=l&&(u.hp=Math.min(u.maxHp,u.hp+c))}r.healCooldown=a.healIntervalSec??2}}r.maxShield>0&&r.shield<r.maxShield&&(r.special==="none"&&r.dots.length===0?(r.healCooldown-=e,r.healCooldown<=0&&(r.shield=Math.min(r.maxShield,r.shield+w0*e))):r.healCooldown=hu);let o=s*e;for(;o>0&&r.pathIndex<t.length-1;){const a=t[r.pathIndex],l=t[r.pathIndex+1],c=g0(a,l);if(c<=0){r.pathIndex++;continue}const u=r.pathProgress*c,d=u+o;d>=c?(o-=c-u,r.pathIndex++,r.pathProgress=0):(r.pathProgress=d/c,o=0)}if(r.pathIndex>=t.length-1){r.reached=!0,r.alive=!1,i.lives--,i.waveLivesLostThisWave++,i.lives<=0&&(i.lives=0,i.phase="lost");const a=t[t.length-1];r.worldX=a.x,r.worldZ=a.z}else{const a=t[r.pathIndex],l=t[r.pathIndex+1];r.worldX=a.x+(l.x-a.x)*r.pathProgress,r.worldZ=a.z+(l.z-a.z)*r.pathProgress}}}function A0(i,e,t,n){var o,a;const r=Or[e.type];let s=t;(o=r.weakness)!=null&&o.includes(n)&&(s*=1.5),(a=r.resistance)!=null&&a.includes(n)&&(s*=.5),s=Math.max(1,s-e.armor),e.maxShield>0&&e.special==="none"&&(e.healCooldown=hu),s>=2&&i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(s)}`,color:"#66ee44",life:.8,maxLife:.8}),e.hp-=s,e.hp<=0&&Wa(i,e)}function C0(i,e){for(const t of i.towers){t.cooldownRemaining-=e;const n=jt[t.type],r=n.levels[t.level],s=r.range*i.buffRangeMult;let o=null,a=t.targetingMode==="last"?1/0:-1/0;for(const l of i.enemies){if(!l.alive||l.reached)continue;const c=l.worldX-t.worldX,u=l.worldZ-t.worldZ;if(Math.sqrt(c*c+u*u)<=s){const d=l.pathIndex+l.pathProgress;let p;switch(t.targetingMode){case"first":p=d,p>a&&(a=p,o=l);break;case"last":p=d,p<a&&(a=p,o=l);break;case"strongest":p=l.hp+l.shield,p>a&&(a=p,o=l);break;case"weakest":p=-(l.hp+l.shield),p>a&&(a=p,o=l);break}}}if(t.targetId=o?o.id:null,!(t.cooldownRemaining>0)&&o){let l=0,c=kr;t.type==="cannon"||t.type==="poison"?(l=1.5,c=kr*.8):t.type==="lightning"?c=kr*8:t.type==="sniper"?c=kr*4:t.type==="fire"&&(c=kr*.6);const u={id:i.nextId++,fromTowerId:t.id,targetEnemyId:o.id,towerType:t.type,damageType:n.damageType,damage:r.damage*i.buffDamageMult,aoeRadius:r.aoeRadius,slow:r.slow,dot:r.dot,chain:r.chain,x:t.worldX,y:.8,z:t.worldZ,startX:t.worldX,startY:.8,startZ:t.worldZ,targetX:o.worldX,targetY:.3,targetZ:o.worldZ,speed:c,progress:0,arcHeight:l,alive:!0};i.projectiles.push(u),t.cooldownRemaining=r.cooldownSec,t.aimAngle=Math.atan2(o.worldX-t.worldX,o.worldZ-t.worldZ),qe.emit({type:"towerFired",towerId:t.id,towerType:t.type,worldX:t.worldX,worldZ:t.worldZ,aimAngle:t.aimAngle})}}}function R0(i,e){for(const t of i.projectiles){if(!t.alive)continue;const n=i.enemies.find(c=>c.id===t.targetEnemyId);n&&n.alive&&!n.reached&&(t.targetX=n.worldX,t.targetZ=n.worldZ);const r=t.targetX-t.x,s=t.targetY-t.y,o=t.targetZ-t.z,a=Math.sqrt(r*r+s*s+o*o),l=t.speed*e;if(a<=l||a<.1)if(t.alive=!1,t.aoeRadius>0){qe.emit({type:"aoeImpact",worldX:t.targetX,worldZ:t.targetZ,radius:t.aoeRadius,towerType:t.towerType});for(const c of i.enemies){if(!c.alive||c.reached)continue;const u=c.worldX-t.targetX,h=c.worldZ-t.targetZ;Math.sqrt(u*u+h*h)<=t.aoeRadius&&(zs(i,c,t.damage,t.damageType,t.fromTowerId),t.slow&&(c.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&c.dots.push({dps:t.dot.dps,remaining:t.dot.durationSec,damageType:t.damageType}))}}else if(t.chain&&t.chain.targets>0){const c=[];n&&n.alive&&!n.reached&&(zs(i,n,t.damage,t.damageType,t.fromTowerId),c.push(n),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}));let u=n;for(let h=0;h<t.chain.targets&&u;h++){let d=null,p=t.chain.rangeFalloff;for(const g of i.enemies){if(!g.alive||g.reached||c.includes(g))continue;const x=g.worldX-u.worldX,m=g.worldZ-u.worldZ,f=Math.sqrt(x*x+m*m);f<p&&(p=f,d=g)}if(d)zs(i,d,t.damage*.7,t.damageType,t.fromTowerId),c.push(d),u=d;else break}}else n&&n.alive&&!n.reached&&(zs(i,n,t.damage,t.damageType,t.fromTowerId),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&n.dots.push({dps:t.dot.dps,remaining:t.dot.durationSec,damageType:t.damageType}));else{const c=1/a;t.x+=r*c*l,t.z+=o*c*l;const u=t.targetX-t.startX,h=t.targetZ-t.startZ,d=Math.max(.1,Math.sqrt(u*u+h*h)),p=t.x-t.startX,g=t.z-t.startZ,x=Math.sqrt(p*p+g*g);t.progress=Math.min(1,x/d);const m=t.startY+(t.targetY-t.startY)*t.progress;t.arcHeight>0?t.y=m+Math.sin(t.progress*Math.PI)*t.arcHeight:t.y=m}}i.projectiles=i.projectiles.filter(t=>t.alive)}function zs(i,e,t,n,r){var l,c,u;const s=Or[e.type];let o=t;if((l=s.weakness)!=null&&l.includes(n)&&(o*=1.5),(c=s.resistance)!=null&&c.includes(n)&&(o*=.5),o=Math.max(1,o-e.armor),e.shield>0)if(o<=e.shield){i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}🛡`,color:"#88ddff",life:1,maxLife:1}),e.shield-=o;return}else{const h=e.shield;o-=e.shield,e.shield=0,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(h)}🛡`,color:"#88ddff",life:1,maxLife:1})}const a=(u=s.weakness)==null?void 0:u.includes(n);if(i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}`,color:a?"#ffdd44":"#ff6655",life:1,maxLife:1}),e.hp-=o,e.hp<=0){if(r!==void 0){const h=i.towers.find(d=>d.id===r);h&&h.kills++}Wa(i,e)}}function du(i,e,t){if(e<0||e>=ce.cols||t<0||t>=ce.rows)return!1;const n=Ga(e,t);return!(i.pathCells.has(n)||i.occupiedCells.has(n))}function P0(i,e,t,n){const r=jt[e].levels[0];if(i.gold<r.buildCost||!du(i,t,n))return null;const s=_n(t,n),o={id:i.nextId++,type:e,level:0,col:t,row:n,worldX:s.x,worldZ:s.z,cooldownRemaining:0,totalInvested:r.buildCost,targetingMode:"first",kills:0};return i.gold-=r.buildCost,i.towers.push(o),lu(i),qe.emit({type:"towerBuilt",towerId:o.id,towerType:o.type,col:o.col,row:o.row}),o}function L0(i,e){const t=i.towers.find(s=>s.id===e);if(!t)return!1;const n=jt[t.type].levels;if(t.level>=n.length-1)return!1;const r=n[t.level+1];return i.gold<r.upgradeCost?!1:(i.gold-=r.upgradeCost,t.totalInvested+=r.upgradeCost,t.level++,qe.emit({type:"towerUpgraded",towerId:t.id,newLevel:t.level}),!0)}function I0(i,e){const t=i.towers.findIndex(s=>s.id===e);if(t===-1)return 0;const n=i.towers[t],r=Math.floor(n.totalInvested*au);return i.gold+=r,i.towers.splice(t,1),lu(i),qe.emit({type:"towerSold",towerId:n.id,refund:r,worldX:n.worldX,worldZ:n.worldZ}),r}function fu(i){return Math.floor(i.totalInvested*au)}function D0(i,e){const t=jt[e.type].levels;return e.level>=t.length-1?!1:i.gold>=t[e.level+1].upgradeCost}function U0(i,e,t){const n=i.towers.find(o=>o.id===e);if(!n)return!1;const r=jt[n.type];if(!r.evolutions)return!1;const s=r.evolutions.find(o=>o.type===t);return!s||i.gold<s.cost?!1:(i.gold-=s.cost,n.totalInvested+=s.cost,n.type=t,n.level=0,qe.emit({type:"towerUpgraded",towerId:n.id,newLevel:0}),!0)}const N0=4421450,F0=11962454,O0=6539519,k0=16739926;class B0{constructor(){fe(this,"scene");fe(this,"groundMeshes",[]);this.scene=new kg,this.scene.background=new xe(1192226)}buildGround(){const{cols:e,rows:t,cellSize:n,origin:r}=ce,s=new Set(ce.path.map(([d,p])=>`${d},${p}`)),o=`${ce.spawnCell[0]},${ce.spawnCell[1]}`,a=`${ce.goalCell[0]},${ce.goalCell[1]}`;this.buildSkyDome(),this.buildTerrainUnderlay();const l=new Rt(n*.96,.16,n*.96);for(let d=0;d<e;d++)for(let p=0;p<t;p++){const g=`${d},${p}`;let x=N0,m=0,f=0,b=.9,w=.04;g===o?(x=O0,m=3117511,f=.5,b=.45):g===a?(x=k0,m=11091251,f=.45,b=.45):s.has(g)&&(x=F0,m=6177827,f=.24,b=.68);const v=Ue.isMobile?new xi({color:x,emissive:m}):new Be({color:x,emissive:m,emissiveIntensity:f,roughness:b,metalness:w}),L=new ie(l,v),E=_n(d,p);L.position.set(E.x,-.08,E.z),L.receiveShadow=!0,L.userData={col:d,row:p,type:"ground"},this.scene.add(L),this.groundMeshes.push(L)}const c=new Rt(e*n+.9,.34,t*n+.9),u=Ue.isMobile?new ht({color:1519901}):new Be({color:1519901,roughness:.95,metalness:.02}),h=new ie(c,u);h.position.set(r.x+e*n/2,-.25,r.z+t*n/2),h.receiveShadow=!0,this.scene.add(h),this.buildBoardFrame(h.position),this.buildPathRibbon(),this.buildScenery(),this.buildDistantSilhouettes()}buildSkyDome(){const e=new Ot(80,24,24),t=new Et({side:Dt,depthWrite:!1,uniforms:{topColor:{value:new xe(1985077)},midColor:{value:new xe(2447938)},bottomColor:{value:new xe(4481592)}},vertexShader:`
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,fragmentShader:`
                uniform vec3 topColor;
                uniform vec3 midColor;
                uniform vec3 bottomColor;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition).y * 0.5 + 0.5;
                    vec3 color = mix(bottomColor, midColor, smoothstep(0.05, 0.45, h));
                    color = mix(color, topColor, smoothstep(0.5, 1.0, h));
                    gl_FragColor = vec4(color, 1.0);
                }
            `});this.scene.add(new ie(e,t))}buildTerrainUnderlay(){const e=ce.cols+Ue.terrain.underlayPadding*2,t=ce.rows+Ue.terrain.underlayPadding*2,n=Ue.terrain.underlaySegments,r=new di(e,t,n,n);r.rotateX(-Math.PI/2);const s=r.attributes.position,o=new Float32Array(s.count*3),a=ce.origin.x+ce.cols*ce.cellSize/2,l=ce.origin.z+ce.rows*ce.cellSize/2;for(let h=0;h<s.count;h++){const d=s.getX(h)+a,p=s.getZ(h)+l,g=Math.max(0,Math.abs(d-a)-ce.cols*.52),x=Math.max(0,Math.abs(p-l)-ce.rows*.52),m=Math.sqrt(g*g+x*x),f=Il.smoothstep(m,.25,Ue.terrain.underlayPadding),b=Math.sin(d*.22)*Math.cos(p*.18)*.16,w=Math.sin((d+p)*.11)*.12,v=(b+w)*f-.58;s.setY(h,v);const L=Il.clamp(.42+f*.22+v*.12,0,1),E=new xe(1782560),A=new xe(5207876),R=E.lerp(A,L);o[h*3]=R.r,o[h*3+1]=R.g,o[h*3+2]=R.b}r.setAttribute("color",new Mt(o,3)),r.computeVertexNormals();const c=Ue.isMobile?new xi({vertexColors:!0}):new Be({vertexColors:!0,roughness:.98,metalness:.01}),u=new ie(r,c);u.receiveShadow=!0,this.scene.add(u)}buildBoardFrame(e){const t=new Rt(ce.cols+1.35,.2,ce.rows+1.35),n=new ie(t,new Be({color:858897,roughness:.75,metalness:.18}));n.position.copy(e),n.position.y=-.34,n.receiveShadow=!0,this.scene.add(n)}buildPathRibbon(){const e=ce.path.map(([s,o])=>{const a=_n(s,o);return new C(a.x,.01,a.z)}),t=new Be({color:5849642,roughness:.95,metalness:.02}),n=new Be({color:12028758,roughness:.88,metalness:.02}),r=new Be({color:14860426,roughness:.7,metalness:.04,emissive:4535064,emissiveIntensity:.06});for(let s=0;s<e.length-1;s++){const o=e[s],a=e[s+1],l=a.x-o.x,c=a.z-o.z,u=Math.sqrt(l*l+c*c)+.12,h=Math.atan2(l,c),d=new C().addVectors(o,a).multiplyScalar(.5);this.addRoadSegment(d,u,.86,.05,-.005,h,t),this.addRoadSegment(d,u,.64,.04,.015,h,n),this.addRoadSegment(d,u*.88,.12,.02,.04,h,r)}for(const s of e){const o=new ie(new dt(.43,.43,.05,18),t);o.position.copy(s),o.position.y=-.005,o.receiveShadow=!0,this.scene.add(o);const a=new ie(new dt(.32,.32,.04,18),n);a.position.copy(s),a.position.y=.015,a.receiveShadow=!0,this.scene.add(a)}}addRoadSegment(e,t,n,r,s,o,a){const l=new ie(new Rt(n,r,t),a);l.position.copy(e),l.position.y=s,l.rotation.y=o,l.receiveShadow=!0,this.scene.add(l)}buildScenery(){const{cols:e,rows:t,cellSize:n}=ce,r=new dt(.05,.08,.36,6),s=new un(.32,.9,7),o=new Ns(.18,0),a=new xi({color:4666405}),l=[2575655,1981985,3562548,2114599],c=[4148027,4937286,3161137],u=9;for(let h=-u;h<e+u;h++)for(let d=-u;d<t+u;d++){if(h>=-1&&h<=e&&d>=-1&&d<=t)continue;const p=_n(h,d),g=(Math.random()-.5)*n*.9,x=(Math.random()-.5)*n*.9;if(Math.random()<.34){const m=.75+Math.random()*.8,f=new cn,b=new ie(r,a),w=new ie(s,new xi({color:l[(h+d+16)%l.length]}));b.position.y=.18*m,w.position.y=.75*m,b.scale.setScalar(m),w.scale.setScalar(m),f.add(b),f.add(w),f.position.set(p.x+g,0,p.z+x),f.rotation.y=Math.random()*Math.PI*2,f.traverse(v=>{v instanceof ie&&Ue.enableShadows&&(v.castShadow=!0,v.receiveShadow=!0)}),this.scene.add(f)}else if(Math.random()<.12){const m=new ie(o,new Be({color:c[(h*3+d+9)%c.length],roughness:.96,metalness:.03}));m.scale.setScalar(.8+Math.random()*1.4),m.position.set(p.x+g,-.15,p.z+x),m.rotation.set(Math.random(),Math.random()*Math.PI*2,Math.random()),m.castShadow=Ue.enableShadows,m.receiveShadow=!0,this.scene.add(m)}}}buildDistantSilhouettes(){const e=new un(2.8,6.5,4),t=new Be({color:1057560,roughness:.95,metalness:.01}),n=ce.cols*.75,r=ce.rows*.95,s=ce.origin.x+ce.cols*ce.cellSize/2,o=ce.origin.z+ce.rows*ce.cellSize/2;for(let a=0;a<18;a++){const l=a/18*Math.PI*2,c=new ie(e,t);c.position.set(s+Math.cos(l)*(n+10+Math.random()*5),1.8+Math.random()*.9,o+Math.sin(l)*(r+10+Math.random()*5)),c.scale.setScalar(.8+Math.random()*1.2),c.rotation.y=Math.random()*Math.PI*2,c.castShadow=!1,c.receiveShadow=!0,this.scene.add(c)}}}const z0=10,pu=4,mu=22,G0=40,H0=35,Xa=20;class V0{constructor(){fe(this,"cam");fe(this,"frustum",z0);fe(this,"tilt",G0*Math.PI/180);fe(this,"yaw",H0*Math.PI/180);fe(this,"cx");fe(this,"cz");fe(this,"lastPinchDist",0);fe(this,"lastRotAngle",0);fe(this,"isTwoFinger",!1);fe(this,"shakeAmount",0);fe(this,"shakeOffset",{x:0,y:0,z:0});fe(this,"onTouchStart",e=>{e.touches.length===2&&(this.isTwoFinger=!0,this.lastPinchDist=vu(e),this.lastRotAngle=xu(e))});fe(this,"onTouchMove",e=>{if(e.touches.length!==2)return;e.preventDefault(),this.isTwoFinger=!0;const t=vu(e);if(this.lastPinchDist>0){const r=this.lastPinchDist/t;this.frustum=gu(this.frustum*r,pu,mu),this.rebuildProjection()}this.lastPinchDist=t;const n=xu(e);if(this.lastRotAngle!==0){const r=n-this.lastRotAngle;this.yaw+=r}this.lastRotAngle=n,this.applyTransform()});fe(this,"onTouchEnd",e=>{e.touches.length<2&&(this.lastPinchDist=0,this.lastRotAngle=0,setTimeout(()=>{this.isTwoFinger=!1},100))});const e=window.innerWidth/window.innerHeight;this.cam=new Ts(-this.frustum*e,this.frustum*e,this.frustum,-this.frustum,.1,100),this.cx=ce.origin.x+ce.cols*ce.cellSize/2,this.cz=ce.origin.z+ce.rows*ce.cellSize/2,this.applyTransform()}get twoFingerActive(){return this.isTwoFinger}zoom(e){this.frustum=gu(this.frustum+e*.01,pu,mu),this.rebuildProjection(),this.applyTransform()}resize(e){this.rebuildProjection(),e.setSize(window.innerWidth,window.innerHeight)}shake(e){this.shakeAmount=Math.max(this.shakeAmount,e)}tickShake(e){if(this.shakeAmount<=.001){(this.shakeOffset.x!==0||this.shakeOffset.y!==0||this.shakeOffset.z!==0)&&(this.shakeOffset.x=0,this.shakeOffset.y=0,this.shakeOffset.z=0,this.applyTransform()),this.shakeAmount=0;return}const t=this.shakeAmount;this.shakeOffset.x=(Math.random()-.5)*t,this.shakeOffset.y=(Math.random()-.5)*t*.45,this.shakeOffset.z=(Math.random()-.5)*t,this.applyTransform(),this.shakeAmount=Math.max(0,this.shakeAmount-e*2.2*(.2+this.shakeAmount))}rebuildProjection(){const e=window.innerWidth/window.innerHeight;this.cam.left=-this.frustum*e,this.cam.right=this.frustum*e,this.cam.top=this.frustum,this.cam.bottom=-this.frustum,this.cam.updateProjectionMatrix()}applyTransform(){this.cam.position.set(this.cx+Xa*Math.sin(this.yaw)*Math.cos(this.tilt)+this.shakeOffset.x,Xa*Math.sin(this.tilt)+this.shakeOffset.y,this.cz+Xa*Math.cos(this.yaw)*Math.cos(this.tilt)+this.shakeOffset.z),this.cam.lookAt(this.cx+this.shakeOffset.x*.3,0,this.cz+this.shakeOffset.z*.3)}}function gu(i,e,t){return Math.max(e,Math.min(t,i))}function vu(i){const e=i.touches[0],t=i.touches[1],n=e.clientX-t.clientX,r=e.clientY-t.clientY;return Math.sqrt(n*n+r*r)}function xu(i){const e=i.touches[0],t=i.touches[1];return Math.atan2(t.clientY-e.clientY,t.clientX-e.clientX)}function W0(i){const e=ce.origin.x+ce.cols*ce.cellSize/2,t=ce.origin.z+ce.rows*ce.cellSize/2;i.fog=new Pa(Ue.atmosphere.fogColor,Ue.atmosphere.fogDensity);const n=new i0(14742992,1057815,1);i.add(n);const r=new o0(2376499,.36);i.add(r);const s=new Ba(16773580,1.75);s.position.set(e+10,16,t-7),s.target.position.set(e,0,t),s.castShadow=Ue.enableShadows,s.shadow.mapSize.width=2048,s.shadow.mapSize.height=2048,s.shadow.camera.near=.5,s.shadow.camera.far=52,s.shadow.camera.left=-18,s.shadow.camera.right=18,s.shadow.camera.top=16,s.shadow.camera.bottom=-16,s.shadow.bias=-7e-4,s.shadow.normalBias=.02,s.shadow.radius=4,i.add(s),i.add(s.target);const o=new Ba(9616848,.58);o.position.set(e-13,10,t+9),o.target.position.set(e,0,t),i.add(o),i.add(o.target);const a=new Ba(10417103,.36);a.position.set(e,6,t+18),a.target.position.set(e,.4,t),i.add(a),i.add(a.target);const l=ce.spawnCell,c=new nu(6870527,2.4,9,1.6);c.position.set(ce.origin.x+l[0]*ce.cellSize+ce.cellSize/2,1.6,ce.origin.z+l[1]*ce.cellSize+ce.cellSize/2),i.add(c);const u=ce.goalCell,h=new nu(16744284,2.1,9,1.7);return h.position.set(ce.origin.x+u[0]*ce.cellSize+ce.cellSize/2,1.6,ce.origin.z+u[1]*ce.cellSize+ce.cellSize/2),i.add(h),{update(d){const p=1.9+Math.sin(d*Ue.atmosphere.spawnPulseSpeed)*.55,g=1.7+Math.sin(d*Ue.atmosphere.goalPulseSpeed+1.2)*.45;c.intensity=p,h.intensity=g,c.position.y=1.55+Math.sin(d*1.7)*.08,h.position.y=1.55+Math.sin(d*1.35+.8)*.08,s.intensity=1.42+Math.sin(d*.35)*.05,o.intensity=.43+Math.sin(d*.27+1.5)*.03,a.intensity=.28+Math.sin(d*.41+.3)*.02}}}const X0={arrow:9136404,arrow_rapid:11044146,arrow_pierce:7229967,cannon:5592405,ice:6737151,fire:16733440,lightning:16772608,poison:6750003,sniper:3355545},_u={arrow:14527027,arrow_rapid:16763989,arrow_pierce:12290082,cannon:8947848,ice:11202303,fire:16746564,lightning:16777130,poison:11206519,sniper:6710988};class q0{constructor(e){fe(this,"scene");fe(this,"meshes",new Map);fe(this,"sellingTowers",new Set);fe(this,"rangeRing",null);fe(this,"time",0);this.scene=e}sync(e){new Set(e.towers.map(t=>t.id));for(const t of e.towers)if(!this.meshes.has(t.id)){const n=this.createTowerMesh(t);n.scale.set(0,0,0),n.userData.buildProgress=0,this.scene.add(n),this.meshes.set(t.id,n)}}removeTower(e){const t=this.meshes.get(e);t&&(this.sellingTowers.add({group:t,timer:.25,maxTimer:.25}),this.meshes.delete(e))}animate(e,t){this.time+=e;for(const n of this.sellingTowers)if(n.timer-=e,n.timer<=0)this.scene.remove(n.group),this.sellingTowers.delete(n);else{const r=n.timer/n.maxTimer,s=r*r*r;n.group.scale.set(s,s,s),n.group.rotation.y+=e*10}for(const n of t.towers){const r=this.meshes.get(n.id);if(!r)continue;const s=r.userData;if(s.buildProgress<1){s.buildProgress=Math.min(1,s.buildProgress+e*3);const a=s.buildProgress,l=2*Math.PI/3,c=a===1?1:Math.pow(2,-10*a)*Math.sin((a*10-.75)*l)+1;r.scale.set(c,c,c)}if(n.cooldownRemaining>s.lastCooldown&&(s.attackTimer=.15),s.lastCooldown=n.cooldownRemaining,s.buildProgress>=1)if(s.attackTimer>0){s.attackTimer-=e;const a=Math.max(0,s.attackTimer/.15),l=1+a*.15;s.turretGroup?(s.turretGroup.scale.set(l,l,l),s.turretGroup.position.z=-.09*a):r.scale.set(l,l,l),s.energyRingMaterial&&(s.energyRingMaterial.emissiveIntensity=.3+a*.65)}else s.turretGroup&&(s.turretGroup.scale.set(1,1,1),s.turretGroup.position.z=0),r.scale.set(1,1,1),s.energyRingMaterial&&(s.energyRingMaterial.emissiveIntensity=.22+Math.sin(this.time*2.5)*.08);let o=null;if(n.targetId!==null&&n.targetId!==void 0){const a=t.enemies.find(l=>l.id===n.targetId);if(a){const l=a.worldX-n.worldX,c=a.worldZ-n.worldZ;(l!==0||c!==0)&&(o=Math.atan2(l,c))}}if(o===null&&n.aimAngle!==void 0&&(o=n.aimAngle),o!==null&&s.turretGroup){let a=o-s.turretGroup.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a)),s.turretGroup.rotation.y+=a*10*e}switch(n.type){case"ice":s.crystal&&(s.crystal.rotation.y+=e*.8);break;case"lightning":s.top&&(s.top.rotation.y+=e*2,s.top.position.y=.65+Math.sin(this.time*5)*.05);break;case"fire":if(s.cone1&&s.cone2){s.cone1.rotation.y+=e*1.5,s.cone2.rotation.y-=e*2;const a=1+Math.sin(this.time*8)*.05;s.cone1.scale.set(a,1,a)}break;case"poison":if(s.sphere){const a=1+Math.sin(this.time*3)*.1;s.sphere.scale.set(a,a,a)}break;case"sniper":s.scope&&(s.scope.position.y=1+Math.sin(this.time*2)*.02);break}}}showRange(e,t){if(!this.rangeRing){this.rangeRing=new cn;const o=new ie(new ir(.92,1,64),new ht({color:16777215,transparent:!0,opacity:.16,side:gt,depthWrite:!1}));o.rotation.x=-Math.PI/2;const a=new ie(new ir(.6,.66,64),new ht({color:16777215,transparent:!0,opacity:.08,side:gt,depthWrite:!1}));a.rotation.x=-Math.PI/2;const l=new ie(new Ur(.98,48),new ht({color:16777215,transparent:!0,opacity:.04,side:gt,depthWrite:!1}));l.rotation.x=-Math.PI/2,l.position.y=-.002,this.rangeRing.add(o,a,l),this.rangeRing.userData={outer:o,inner:a,pulse:l},this.scene.add(this.rangeRing)}const n=_u[e.type]??16777215,r=this.rangeRing.userData;r.outer.material.color.setHex(n),r.inner.material.color.setHex(n),r.pulse.material.color.setHex(n);const s=1+Math.sin(this.time*3.2)*.06;r.pulse.scale.setScalar(s),r.pulse.position.y=.002,this.rangeRing.scale.set(t,t,1),this.rangeRing.position.set(e.worldX,.03,e.worldZ),this.rangeRing.visible=!0}hideRange(){this.rangeRing&&(this.rangeRing.visible=!1)}createTowerMesh(e){const t=new cn,n=_n(e.col,e.row);t.position.set(n.x,0,n.z);const r=X0[e.type],s=_u[e.type],o=1+e.level*.15,a=new ie(new Ur(.46*o,24),new ht({color:0,transparent:!0,opacity:.18,side:gt,depthWrite:!1}));a.rotation.x=-Math.PI/2,a.position.y=.008,t.add(a);const l=new cn,c=new dt(.3*o,.38*o,.2,8),u=new Be({color:r,roughness:.7}),h=new ie(c,u);h.position.y=.1,Ue.enableShadows&&(h.castShadow=!0),l.add(h);const d=new dt(.32*o,.32*o,.05,8),p=new Be({color:3355443,roughness:.9,metalness:.5}),g=new ie(d,p);g.position.y=.225,Ue.enableShadows&&(g.castShadow=!0),l.add(g);const x=new Be({color:s,emissive:s,emissiveIntensity:.22,transparent:!0,opacity:.9,roughness:.35,metalness:.2}),m=new ie(new vi(.29*o,.03*o,8,24),x);m.rotation.x=Math.PI/2,m.position.y=.24,l.add(m),t.userData.energyRingMaterial=x,t.add(l);const f=new cn;t.add(f),t.userData.turretGroup=f;const b=t.add.bind(t);switch(t.add=(...w)=>f.add(...w),e.type){case"arrow":case"arrow_rapid":case"arrow_pierce":{const w=new dt(.12*o,.2*o,.5,6),v=new ie(w,new Be({color:s}));v.position.y=.5,Ue.enableShadows&&(v.castShadow=!0),t.add(v);const L=new Rt(.6*o,.04*o,.08*o),E=new ie(L,new Be({color:6045747}));E.position.y=.75,E.position.z=.1,Ue.enableShadows&&(E.castShadow=!0),t.add(E);const A=new dt(.015,.015,.4,4),R=new un(.04,.1,4);let S=13421772;e.type==="arrow_rapid"&&(S=16777215),e.type==="arrow_pierce"&&(S=8947967);const _=new Be({color:S}),P=new ie(A,_);P.rotation.x=Math.PI/2,P.position.set(0,.8,0);const F=new ie(R,_);if(F.rotation.x=Math.PI/2,F.position.set(0,.8,.25),t.add(P),t.add(F),e.type==="arrow_rapid"){const k=new ie(L,new Be({color:4862503}));k.position.y=.65,k.position.z=.1,t.add(k)}else if(e.type==="arrow_pierce"){const k=new Rt(.25*o,.15*o,.5*o),H=new ie(k,new Be({color:s}));H.position.y=.5,t.add(H)}break}case"cannon":{const w=new Ot(.25*o,12,12,0,Math.PI*2,0,Math.PI/2),v=new ie(w,new Be({color:s,metalness:.6,roughness:.4}));v.position.y=.25,Ue.enableShadows&&(v.castShadow=!0),t.add(v);const L=new dt(.08*o,.12*o,.6*o,8),E=new ie(L,new Be({color:3355443,metalness:.8,roughness:.3}));E.position.set(0,.45,.25),E.rotation.x=Math.PI/4,Ue.enableShadows&&(E.castShadow=!0),t.add(E);const A=new vi(.1*o,.03*o,6,12),R=new ie(A,new Be({color:1118481,metalness:.9}));R.position.set(0,.65,.45),R.rotation.x=Math.PI/4,t.add(R);break}case"ice":{const w=new Kc({color:s,transmission:.9,opacity:1,metalness:0,roughness:.1,ior:1.5,thickness:.5}),v=new Os(.25*o),L=new ie(v,w);L.position.y=.7,Ue.enableShadows&&(L.castShadow=!0);const E=new Os(.12*o),A=new ie(E,new Be({color:16777215,emissive:8965375}));L.add(A),t.add(L),t.userData.crystal=L;break}case"fire":{const w=[];for(let _=0;_<5;_++)w.push(new J(.25*o+Math.sin(_*.5)*.05,_*.1));const v=new Ir(w,8),L=new ie(v,new Be({color:3346688,roughness:.9}));L.position.y=.25,Ue.enableShadows&&(L.castShadow=!0),t.add(L);const E=new un(.2*o,.6,6),A=new ie(E,new Be({color:16724736,emissive:16720384,emissiveIntensity:.5,transparent:!0,opacity:.9}));A.position.y=.65,Ue.enableShadows&&(A.castShadow=!0),t.add(A);const R=new un(.1*o,.4,6),S=new ie(R,new Be({color:16755200,emissive:16768256,emissiveIntensity:.8}));S.position.y=.6,t.add(S),t.userData.cone1=A,t.userData.cone2=S;break}case"lightning":{const w=new dt(.08*o,.15*o,.5*o,8),v=new ie(w,new Be({color:2236979,metalness:.8}));v.position.y=.5,t.add(v);for(let R=0;R<3;R++){const S=new ie(new vi(.15*o,.02*o,4,12),new Be({color:11184810,metalness:.9}));S.position.y=.4+R*.15,S.rotation.x=Math.PI/2,t.add(S)}const L=new Fs(.2*o),E=new ie(L,new Be({color:s,emissive:16772608,emissiveIntensity:.6,wireframe:!0}));E.position.y=.85,t.add(E);const A=new ie(new Fs(.1*o),new Be({color:16777215,emissive:16777215,emissiveIntensity:1}));E.add(A),t.userData.top=E;break}case"poison":{const w=[new J(.15*o,0),new J(.25*o,.2*o),new J(.25*o,.4*o),new J(.1*o,.6*o),new J(.1*o,.8*o),new J(.15*o,.85*o)],v=new Ir(w,12),L=new Kc({color:16777215,transmission:.8,opacity:1,roughness:.1,ior:1.5,side:gt}),E=new ie(v,L);E.position.y=.25,t.add(E);const A=new dt(.2*o,.22*o,.4*o,12),R=new ie(A,new Be({color:3394577,transparent:!0,opacity:.85,emissive:2271744,emissiveIntensity:.3}));R.position.y=.45,t.add(R),t.userData.sphere=R;break}case"sniper":{const w=new cn;for(let _=0;_<3;_++){const P=new dt(.02*o,.02*o,.6*o,4),F=new ie(P,new Be({color:5592405}));F.position.set(Math.cos(_*Math.PI*2/3)*.15,.3,Math.sin(_*Math.PI*2/3)*.15),F.rotation.x=-Math.sin(_*Math.PI*2/3)*.3,F.rotation.z=Math.cos(_*Math.PI*2/3)*.3,w.add(F)}w.position.y=.25,b(w);const v=new Rt(.1*o,.15*o,.4*o),L=new ie(v,new Be({color:s,metalness:.7}));L.position.set(0,.7,0),t.add(L);const E=new dt(.03*o,.04*o,.8*o,6),A=new ie(E,new Be({color:2236962}));A.rotation.x=Math.PI/2,A.position.set(0,.7,.4),t.add(A);const R=new dt(.04*o,.04*o,.3*o,8),S=new ie(R,new Be({color:1118481}));S.rotation.x=Math.PI/2,S.position.set(.08*o,.8,.1),t.add(S),t.userData.scope=S;break}}t.add=b,t.userData.lastCooldown=e.cooldownRemaining,t.userData.attackTimer=0;for(let w=0;w<=e.level;w++){const v=new Ot(.04,4,4),L=new ie(v,new ht({color:16777215}));L.position.set(-.15+w*.15,.32,.35),t.add(L)}return t}}function Y0(){const i={},e=Ue.isMobile?xi:Be,t=new Dr(.12,.2,4,8),n=new Ot(.14,8,8),r=new e({color:15632435,...Ue.isMobile?{}:{roughness:.8}}),s=new e({color:16755285,...Ue.isMobile?{}:{roughness:.6}});i.grunt=[{geo:t,mat:r,offset:new C(0,.2,0)},{geo:n,mat:s,offset:new C(0,.45,.05)}];const o=new Ot(.3,12,12,0,Math.PI*2,0,Math.PI/2),a=new e({color:10044620,...Ue.isMobile?{}:{roughness:.9,metalness:.2}}),l=new e({color:7807658}),c=new Ot(.15,8,8);i.tank=[{geo:o,mat:a,offset:new C(0,.2,0),scale:new C(1,.6,1.2)},{geo:c,mat:l,offset:new C(0,.2,.35)}];const u=new un(.15,.4,6),h=new e({color:3394645,...Ue.isMobile?{}:{roughness:.5}});i.runner=[{geo:u,mat:h,offset:new C(0,.2,0),rotation:new St(Math.PI/2,0,0)}];const d=new Dr(.06,.15,4,6),p=new di(.3,.15),g=new e({color:10053171}),x=new e({color:14540253,transparent:!0,opacity:.6,side:gt});i.swarm=[{geo:d,mat:g,offset:new C(0,.3,0),rotation:new St(Math.PI/2,0,0)},{geo:p,mat:x,offset:new C(0,.35,0),rotation:new St(Math.PI/2,0,0)}];const m=new Ns(.15),f=new vi(.25,.05,6,12),b=new e({color:1136076}),w=new e({color:3377407,transparent:!0,opacity:.7,emissive:1131656});i.shield=[{geo:m,mat:b,offset:new C(0,.3,0)},{geo:f,mat:w,offset:new C(0,.3,0),rotation:new St(Math.PI/2,0,0)}];const v=new Rt(.1,.3,.1),L=new Rt(.3,.1,.1),E=new vi(.2,.03,6,12),A=new e({color:16742314}),R=new e({color:16777198,emissive:16755370});i.healer=[{geo:v,mat:A,offset:new C(0,.3,0)},{geo:L,mat:A,offset:new C(0,.3,0)},{geo:E,mat:R,offset:new C(0,.5,0),rotation:new St(Math.PI/2,0,0)}];const S=new Dr(.3,.5,6,12),_=new e({color:11145489,...Ue.isMobile?{}:{metalness:.5,roughness:.6}}),P=new Rt(.3,.08,.1),F=new e({color:2236962,emissive:16755200,...Ue.isMobile?{}:{emissiveIntensity:1}}),k=new un(.08,.3,4),H=new e({color:15658734});return i.boss=[{geo:S,mat:_,offset:new C(0,.5,0)},{geo:P,mat:F,offset:new C(0,.65,.3)},{geo:k,mat:H,offset:new C(.15,.85,.15),rotation:new St(Math.PI/4,0,-Math.PI/6)},{geo:k,mat:H,offset:new C(-.15,.85,.15),rotation:new St(Math.PI/4,0,Math.PI/6)}],i}const yu=Y0(),$0=100,Gs=.5;class Z0{constructor(e){fe(this,"scene");fe(this,"instancedMeshGroups",new Map);fe(this,"hpBars",[]);fe(this,"shieldBars",[]);fe(this,"hpBarBg",[]);fe(this,"contactShadows",[]);fe(this,"statusHalos",[]);fe(this,"dummy",new xt);this.scene=e}getOrCreate(e){let t=this.instancedMeshGroups.get(e);if(!t){t=[];const n=yu[e];for(const r of n){const s=new Gg(r.geo,r.mat,$0);s.count=0,Ue.enableShadows&&(s.castShadow=!0,s.receiveShadow=!0),this.scene.add(s),t.push(s)}this.instancedMeshGroups.set(e,t)}return t}sync(e,t,n){const r=new Map;for(const o of e.enemies){if(!o.alive||o.reached)continue;let a=r.get(o.type);a||(a=[],r.set(o.type,a)),a.push(o)}for(const o of this.hpBars)this.scene.remove(o);for(const o of this.shieldBars)this.scene.remove(o);for(const o of this.hpBarBg)this.scene.remove(o);for(const o of this.contactShadows)this.scene.remove(o);for(const o of this.statusHalos)this.scene.remove(o);this.hpBars=[],this.shieldBars=[],this.hpBarBg=[],this.contactShadows=[],this.statusHalos=[];const s=["grunt","tank","runner","swarm","shield","healer","boss"];for(const o of s){const a=this.getOrCreate(o),l=r.get(o)||[];for(const u of a)u.count=l.length;const c=yu[o];for(let u=0;u<l.length;u++){const h=l[u],d=h.worldX-h.prevWorldX,p=h.worldZ-h.prevWorldZ;let g=0;Math.abs(d)>.001||Math.abs(p)>.001?(g=Math.atan2(d,p),h.displayRot=g):h.displayRot!==void 0&&(g=h.displayRot);for(let E=0;E<c.length;E++){const A=c[E],R=o==="swarm"?Math.sin(performance.now()*.01+h.id)*.08:o==="healer"?Math.sin(performance.now()*.004+h.id)*.03:0;if(this.dummy.position.set(h.worldX,0,h.worldZ),this.dummy.position.add(A.offset),this.dummy.position.y+=R,this.dummy.rotation.set(0,g,0),A.rotation&&(this.dummy.rotation.x+=A.rotation.x,this.dummy.rotation.y+=A.rotation.y,this.dummy.rotation.z+=A.rotation.z),o==="swarm"&&E===1){const S=performance.now()*.001;this.dummy.rotation.z+=Math.sin(S*30+h.id)*.5}A.scale?this.dummy.scale.copy(A.scale):this.dummy.scale.set(1,1,1),this.dummy.updateMatrix(),a[E].setMatrixAt(u,this.dummy.matrix)}const x=(E,A,R,S)=>{const _=new di(A,S),P=new ht({color:R,side:gt,depthWrite:!1}),F=new ie(_,P);return F.position.set(h.worldX-(Gs-A)/2,E,h.worldZ),n?F.lookAt(n.position):F.rotation.x=-Math.PI/4,F},m=new ie(new Ur(o==="boss"?.42:.26,24),new ht({color:0,transparent:!0,opacity:o==="boss"?.28:.18,side:gt,depthWrite:!1}));if(m.rotation.x=-Math.PI/2,m.position.set(h.worldX,.01,h.worldZ),this.scene.add(m),this.contactShadows.push(m),h.slow||h.dots.length>0||h.shield>0||o==="boss"){const E=o==="boss"?16752215:h.shield>0?7131135:h.slow?9300223:7667562,A=new ie(new ir(.18,.24,24),new ht({color:E,transparent:!0,opacity:.5,side:gt,depthWrite:!1}));A.rotation.x=-Math.PI/2,A.position.set(h.worldX,.045,h.worldZ),this.scene.add(A),this.statusHalos.push(A)}const f=x(.9,Gs,3355443,.06);f.position.set(h.worldX,.9,h.worldZ),n?f.lookAt(n.position):f.rotation.x=-Math.PI/4,this.scene.add(f),this.hpBarBg.push(f);const b=Math.max(0,h.hp/h.maxHp),w=Gs*b,v=b>.5?4521796:b>.25?16755200:16724787,L=x(.9,w,v,.06);if(this.scene.add(L),this.hpBars.push(L),h.maxShield>0&&h.shield>0){const E=h.shield/h.maxShield,A=Gs*E,R=x(.97,A,4491519,.04);this.scene.add(R),this.shieldBars.push(R)}}for(const u of a)u.instanceMatrix.needsUpdate=!0}}}const _i={arrow:16768324,arrow_rapid:16773017,arrow_pierce:9348863,cannon:16737843,ice:8969727,fire:16729088,lightning:16776960,poison:6750003,sniper:11184895},Bt=Ue.maxParticles,Br=Ue.isMobile?35:80,Kt={minX:-6,maxX:16,minZ:-6,maxZ:16},zr={min:.4,max:4.5};class j0{constructor(e){fe(this,"scene");fe(this,"particles",[]);fe(this,"particleGeo");fe(this,"particlePositions");fe(this,"particleColors");fe(this,"particleSizes");fe(this,"particleAlphas");fe(this,"particlePoints");fe(this,"moteGeo");fe(this,"motePositions");fe(this,"moteVelocities");fe(this,"motePhase");fe(this,"motePoints");this.scene=e,this.particlePositions=new Float32Array(Bt*3),this.particleColors=new Float32Array(Bt*3),this.particleSizes=new Float32Array(Bt),this.particleAlphas=new Float32Array(Bt),this.particleGeo=new bt,this.particleGeo.setAttribute("position",new Mt(this.particlePositions,3)),this.particleGeo.setAttribute("aColor",new Mt(this.particleColors,3)),this.particleGeo.setAttribute("aSize",new Mt(this.particleSizes,1)),this.particleGeo.setAttribute("aAlpha",new Mt(this.particleAlphas,1));const t=new Et({vertexShader:`
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
            `,transparent:!0,blending:gr,depthWrite:!1});this.particlePoints=new Vc(this.particleGeo,t),this.particlePoints.frustumCulled=!1,e.add(this.particlePoints),this.initMotes()}initMotes(){this.motePositions=new Float32Array(Br*3),this.moteVelocities=new Float32Array(Br*3),this.motePhase=new Float32Array(Br);for(let t=0;t<Br;t++){const n=t*3;this.motePositions[n]=Kt.minX+Math.random()*(Kt.maxX-Kt.minX),this.motePositions[n+1]=zr.min+Math.random()*(zr.max-zr.min),this.motePositions[n+2]=Kt.minZ+Math.random()*(Kt.maxZ-Kt.minZ),this.moteVelocities[n]=(Math.random()-.5)*.25,this.moteVelocities[n+1]=.08+Math.random()*.18,this.moteVelocities[n+2]=(Math.random()-.5)*.25,this.motePhase[t]=Math.random()*Math.PI*2}this.moteGeo=new bt,this.moteGeo.setAttribute("position",new Mt(this.motePositions,3)),this.moteGeo.setAttribute("aPhase",new Mt(this.motePhase,1));const e=new Et({uniforms:{uTime:{value:0}},vertexShader:`
                attribute float aPhase;
                uniform float uTime;
                varying float vAlpha;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 2.0);
                    vAlpha = twinkle * 0.55;
                    gl_PointSize = max(2.5, 3.5 * (300.0 / -mvPosition.z));
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,fragmentShader:`
                varying float vAlpha;
                void main() {
                    vec2 c = gl_PointCoord - vec2(0.5);
                    float d = length(c);
                    if (d > 0.5) discard;
                    float soft = 1.0 - smoothstep(0.15, 0.5, d);
                    gl_FragColor = vec4(vec3(0.95, 1.0, 0.92) * soft, vAlpha * soft);
                }
            `,transparent:!0,blending:gr,depthWrite:!1});this.motePoints=new Vc(this.moteGeo,e),this.motePoints.frustumCulled=!1,this.scene.add(this.motePoints)}tickMotes(e,t){for(let n=0;n<Br;n++){const r=n*3,s=Math.sin(t*.8+this.motePhase[n])*.08;this.motePositions[r]+=(this.moteVelocities[r]+s)*e,this.motePositions[r+1]+=this.moteVelocities[r+1]*e,this.motePositions[r+2]+=(this.moteVelocities[r+2]-s*.5)*e,this.motePositions[r+1]>zr.max&&(this.motePositions[r]=Kt.minX+Math.random()*(Kt.maxX-Kt.minX),this.motePositions[r+1]=zr.min,this.motePositions[r+2]=Kt.minZ+Math.random()*(Kt.maxZ-Kt.minZ))}this.moteGeo.attributes.position.needsUpdate=!0,this.motePoints.material.uniforms.uTime.value=t}sync(e,t){for(const r of e.projectiles){if(!r.alive)continue;const s=_i[r.towerType]??_i.arrow;(r.towerType==="fire"||r.towerType==="poison"||r.towerType==="ice"||r.towerType==="sniper"||r.towerType==="lightning"||r.towerType==="arrow_rapid"||Math.random()<.28)&&this.addTrailParticle(r.x,r.y!==void 0?r.y:.8,r.z,s)}let n=0;for(let r=this.particles.length-1;r>=0;r--){const s=this.particles[r];if(s.life-=t,s.life<=0){this.particles.splice(r,1);continue}s.position.add(s.velocity.clone().multiplyScalar(t)),s.velocity.y-=2.5*t,s.velocity.multiplyScalar(.97);const o=s.life/s.maxLife,a=n*3;this.particlePositions[a]=s.position.x,this.particlePositions[a+1]=Math.max(.05,s.position.y),this.particlePositions[a+2]=s.position.z,this.particleColors[a]=s.color.r,this.particleColors[a+1]=s.color.g,this.particleColors[a+2]=s.color.b,this.particleSizes[n]=s.size*o,this.particleAlphas[n]=o,n++}this.particleGeo.setDrawRange(0,n),this.particleGeo.attributes.position.needsUpdate=!0,this.particleGeo.attributes.aColor.needsUpdate=!0,this.particleGeo.attributes.aSize.needsUpdate=!0,this.particleGeo.attributes.aAlpha.needsUpdate=!0,this.tickMotes(t,performance.now()*.001)}addExplosion(e,t,n){const r=new xe(_i[n]),s=16+Math.floor(Math.random()*10);for(let o=0;o<s&&this.particles.length<Bt;o++){const a=Math.random()*Math.PI*2,l=1.5+Math.random()*3,c=1+Math.random()*2.5;this.particles.push({position:new C(e,.3,t),velocity:new C(Math.cos(a)*l,c,Math.sin(a)*l),life:.4+Math.random()*.3,maxLife:.7,color:r.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.15+Math.random()*.15})}}addDeathEffect(e,t,n){const r=new xe(n),s=22+Math.floor(Math.random()*10);for(let o=0;o<s&&this.particles.length<Bt;o++){const a=Math.random()*Math.PI*2,l=2+Math.random()*4,c=1.5+Math.random()*3;this.particles.push({position:new C(e,.4,t),velocity:new C(Math.cos(a)*l,c,Math.sin(a)*l),life:.5+Math.random()*.4,maxLife:.9,color:r.clone().offsetHSL(Math.random()*.15-.075,0,Math.random()*.3-.1),size:.18+Math.random()*.2})}for(let o=0;o<5&&this.particles.length<Bt;o++)this.particles.push({position:new C(e,.5,t),velocity:new C((Math.random()-.5)*.5,2+Math.random(),(Math.random()-.5)*.5),life:.3,maxLife:.3,color:new xe(16777215),size:.3+Math.random()*.2})}addTrailParticle(e,t,n,r){if(this.particles.length>=Bt)return;const s=new xe(r);this.particles.push({position:new C(e+(Math.random()-.5)*.1,t+(Math.random()-.5)*.1,n+(Math.random()-.5)*.1),velocity:new C(0,Math.random()*.5,0),life:.2+Math.random()*.2,maxLife:.4,color:s.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.1+Math.random()*.1})}addBuildEffect(e,t){const r=new xe(4906624);for(let s=0;s<15&&!(this.particles.length>=Bt);s++){const o=s/15*Math.PI*2,a=1+Math.random()*1.5;this.particles.push({position:new C(e,.2,t),velocity:new C(Math.cos(o)*a,.5+Math.random(),Math.sin(o)*a),life:.4+Math.random()*.2,maxLife:.6,color:r.clone().offsetHSL(0,0,Math.random()*.2),size:.15+Math.random()*.1})}}addMuzzleFlash(e,t,n){const r=new xe(_i[n]??_i.arrow);this.particles.length<Bt&&this.particles.push({position:new C(e,1,t),velocity:new C(0,.4,0),life:.14,maxLife:.14,color:new xe(16777215),size:.45});const s=5;for(let o=0;o<s&&this.particles.length<Bt;o++){const a=Math.random()*Math.PI*2,l=1.4+Math.random()*1.2;this.particles.push({position:new C(e,.9,t),velocity:new C(Math.cos(a)*l*.4,1.2+Math.random()*.6,Math.sin(a)*l*.4),life:.22+Math.random()*.14,maxLife:.36,color:r.clone().offsetHSL(Math.random()*.08-.04,0,Math.random()*.2),size:.14+Math.random()*.1})}}addImpactFlash(e,t,n,r){const s=new xe(_i[r]??_i.cannon);for(let a=0;a<3&&this.particles.length<Bt;a++)this.particles.push({position:new C(e,.35,t),velocity:new C(0,.6,0),life:.16,maxLife:.16,color:new xe(16777215),size:.5+n*.1});const o=Math.min(24,12+Math.floor(n*4));for(let a=0;a<o&&this.particles.length<Bt;a++){const l=a/o*Math.PI*2+Math.random()*.2,c=n*(1.6+Math.random()*.8);this.particles.push({position:new C(e,.2,t),velocity:new C(Math.cos(l)*c,.4+Math.random()*.5,Math.sin(l)*c),life:.32+Math.random()*.2,maxLife:.52,color:s.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.18+Math.random()*.12})}}addSellEffect(e,t){const r=new xe(16498468);for(let s=0;s<15&&!(this.particles.length>=Bt);s++){const o=s/15*Math.PI*2,a=1.5+Math.random()*2;this.particles.push({position:new C(e,.5,t),velocity:new C(Math.cos(o)*a,1.5+Math.random()*2,Math.sin(o)*a),life:.3+Math.random()*.2,maxLife:.5,color:r.clone().offsetHSL(.05*Math.random(),0,Math.random()*.2),size:.15+Math.random()*.15})}}}class K0{constructor(e){fe(this,"scene");fe(this,"projMeshes",new Map);this.scene=e}sync(e,t){const n=new Set;for(const r of e.projectiles){if(!r.alive)continue;n.add(r.id);let s=this.projMeshes.get(r.id);s||(s=this.createProjectileMesh(r.towerType),this.scene.add(s),this.projMeshes.set(r.id,s)),s.position.set(r.x,r.y!==void 0?r.y:.8,r.z);const o=s.userData.glow??null;if(o){const a=1+Math.sin(performance.now()*.02+r.id)*.12;o.scale.setScalar(a)}if(r.towerType!=="cannon"&&r.towerType!=="fire"&&r.towerType!=="poison"){const a=r.targetX-r.startX,l=r.targetZ-r.startZ,c=Math.min(1,r.progress+.05),u=r.startX+a*c,h=r.startZ+l*c;let p=r.startY+(r.targetY-r.startY)*c;r.arcHeight>0&&(p+=Math.sin(c*Math.PI)*r.arcHeight),c>r.progress&&s.lookAt(u,p,h)}else(r.towerType==="poison"||r.towerType==="cannon")&&(s.rotation.x+=t*5,s.rotation.z+=t*3);r.towerType==="sniper"&&(s.scale.z=1.15+Math.sin(performance.now()*.03+r.id)*.08)}for(const[r,s]of this.projMeshes.entries())n.has(r)||(this.scene.remove(s),this.projMeshes.delete(r))}createProjectileMesh(e){const t=new cn;switch(e==="arrow_rapid"||e==="arrow_pierce"?"arrow":e){case"arrow":{const r=new dt(.02,.02,.6,6);r.rotateX(Math.PI/2),r.rotateX(Math.PI/2);const s=new xi({color:9132587}),o=new ie(r,s),a=new un(.06,.2,4);a.rotateX(-Math.PI/2),a.translate(0,0,-.3);const l=new Be({color:13421772,metalness:.8,roughness:.2}),c=new ie(a,l),u=new Rt(.15,.15,.1);u.translate(0,0,.3);const h=e==="arrow_pierce"?8232191:e==="arrow_rapid"?16774320:14492194,d=new xi({color:h}),p=new ie(u,d);if(t.add(o,c,p),e==="arrow_pierce"||e==="arrow_rapid"){const g=new ie(new Ot(.12,8,8),new ht({color:e==="arrow_pierce"?10005247:16772761,transparent:!0,opacity:.22}));g.position.z=.08,t.add(g),t.userData.glow=g}break}case"cannon":{const r=new Be({color:2236962,roughness:.8,metalness:.4}),s=new Ot(.2,12,12),o=new ie(s,r);t.add(o);break}case"fire":{const r=new ht({color:16755200}),s=new Ot(.15,8,8),o=new ie(s,r);t.add(o);const a=new ht({color:16729088,transparent:!0,opacity:.6}),l=new Ot(.25,8,8),c=new ie(l,a);t.add(c),t.userData.glow=c;break}case"poison":{const r=new Be({color:4521762,roughness:.2,transparent:!0,opacity:.8}),s=new Ot(.18,12,12),o=new ie(s,r);o.scale.set(1,.7,1),t.add(o);break}case"ice":{const r=new Be({color:11197951,roughness:.1,transparent:!0,opacity:.8}),s=new un(.1,.6,6);s.rotateX(-Math.PI/2);const o=new ie(s,r);t.add(o);const a=new ie(new Ot(.18,8,8),new ht({color:12514303,transparent:!0,opacity:.16}));t.add(a),t.userData.glow=a;break}case"sniper":{const r=new ht({color:5605631}),s=new dt(.03,.03,1.2,6);s.rotateX(Math.PI/2);const o=new ie(s,r);t.add(o);const a=new ie(new dt(.06,.06,1.6,8),new ht({color:8961023,transparent:!0,opacity:.14}));a.rotateX(Math.PI/2),a.position.z=.08,t.add(a),t.userData.glow=a;break}case"lightning":{const r=new ie(new dt(.018,.018,.9,5),new ht({color:16777215}));r.rotateX(Math.PI/2),t.add(r);const s=new ie(new dt(.065,.065,1.1,8),new ht({color:16774565,transparent:!0,opacity:.18}));s.rotateX(Math.PI/2),t.add(s),t.userData.glow=s;break}}return t.traverse(r=>{r instanceof ie&&(e==="arrow"||e==="cannon")&&(r.castShadow=!0)}),t}}const Su={valid:4521796,invalid:16729156};class J0{constructor(e){fe(this,"raycaster",new l0);fe(this,"mouse",new J);fe(this,"groundPlane",new Yn(new C(0,1,0),0));fe(this,"ghostMesh",null);fe(this,"rangeRing",null);fe(this,"scene");fe(this,"hoveredCol",-1);fe(this,"hoveredRow",-1);this.scene=e}updateMouse(e,t){let n,r;if("touches"in e){if(e.touches.length===0)return;n=e.touches[0].clientX,r=e.touches[0].clientY}else n=e.clientX,r=e.clientY;this.mouse.x=n/window.innerWidth*2-1,this.mouse.y=-(r/window.innerHeight)*2+1,this.raycaster.setFromCamera(this.mouse,t);const s=new C;if(this.raycaster.ray.intersectPlane(this.groundPlane,s),s){const o=Math.floor((s.x-ce.origin.x)/ce.cellSize),a=Math.floor((s.z-ce.origin.z)/ce.cellSize);o>=0&&o<ce.cols&&a>=0&&a<ce.rows?(this.hoveredCol=o,this.hoveredRow=a):(this.hoveredCol=-1,this.hoveredRow=-1)}}showGhost(e,t,n,r,s){if(!this.ghostMesh){const a=new dt(.35,.4,.5,8),l=new ht({transparent:!0,opacity:.4,depthWrite:!1});this.ghostMesh=new ie(a,l),this.scene.add(this.ghostMesh)}const o=_n(e,t);if(this.ghostMesh.position.set(o.x,.25,o.z),this.ghostMesh.visible=!0,this.ghostMesh.material.color.setHex(n?Su.valid:Su.invalid),s&&s>0){if(!this.rangeRing){const a=new ir(.95,1,48),l=new ht({color:4521864,transparent:!0,opacity:.2,side:gt,depthWrite:!1});this.rangeRing=new ie(a,l),this.rangeRing.rotation.x=-Math.PI/2,this.scene.add(this.rangeRing)}this.rangeRing.scale.set(s,s,1),this.rangeRing.position.set(o.x,.02,o.z),this.rangeRing.visible=!0,this.rangeRing.material.color.setHex(n?4521864:16737860)}else this.rangeRing&&(this.rangeRing.visible=!1)}hideGhost(){this.ghostMesh&&(this.ghostMesh.visible=!1),this.rangeRing&&(this.rangeRing.visible=!1)}}const Mu={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class Gr{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Q0=new Ts(-1,1,1,-1,0,1);class ev extends bt{constructor(){super(),this.setAttribute("position",new je([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new je([0,2,0,0,2,0],2))}}const tv=new ev;class wu{constructor(e){this._mesh=new ie(tv,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Q0)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class bu extends Gr{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Et?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ws.clone(e.uniforms),this.material=new Et({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new wu(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Eu extends Gr{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const r=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),s.buffers.stencil.setFunc(r.ALWAYS,o,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(r.EQUAL,1,4294967295),s.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),s.buffers.stencil.setLocked(!0)}}class nv extends Gr{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class iv{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new J);this._width=n.width,this._height=n.height,t=new rn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:bn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new bu(Mu),this.copyPass.material.blending=Mn,this.clock=new a0}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let r=0,s=this.passes.length;r<s;r++){const o=this.passes[r];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Eu!==void 0&&(o instanceof Eu?n=!0:o instanceof nv&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new J);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class rv extends Gr{constructor(e,t,n=null,r=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new xe}render(e,t,n){const r=e.autoClear;e.autoClear=!1;let s,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=r}}const sv={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new xe(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class rr extends Gr{constructor(e,t,n,r){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=r,this.resolution=e!==void 0?new J(e.x,e.y):new J(256,256),this.clearColor=new xe(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new rn(s,o,{type:bn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){const d=new rn(s,o,{type:bn});d.texture.name="UnrealBloomPass.h"+h,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);const p=new rn(s,o,{type:bn});p.texture.name="UnrealBloomPass.v"+h,p.texture.generateMipmaps=!1,this.renderTargetsVertical.push(p),s=Math.round(s/2),o=Math.round(o/2)}const a=sv;this.highPassUniforms=ws.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Et({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new J(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1),new C(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const u=Mu;this.copyUniforms=ws.clone(u.uniforms),this.blendMaterial=new Et({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:gr,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new xe,this.oldClearAlpha=1,this.basic=new ht,this.fsQuad=new wu(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,r),this.renderTargetsVertical[s].setSize(n,r),this.separableBlurMaterials[s].uniforms.invSize.value=new J(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,t,n,r,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=rr.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=rr.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=o}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Et({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new J(.5,.5)},direction:{value:new J(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(e){return new Et({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}rr.BlurDirectionX=new J(1,0),rr.BlurDirectionY=new J(0,1);class ov{constructor(e,t,n){fe(this,"composer");fe(this,"bloomPass");fe(this,"gradePass");this.composer=new iv(e);const r=new rv(t,n);this.composer.addPass(r),this.bloomPass=new rr(new J(window.innerWidth,window.innerHeight),Ue.atmosphere.bloomStrength,Ue.atmosphere.bloomRadius,Ue.atmosphere.bloomThreshold),this.composer.addPass(this.bloomPass),this.gradePass=new bu(new Et({uniforms:{tDiffuse:{value:null},uTime:{value:0},uVignetteStrength:{value:Ue.atmosphere.vignetteStrength},uGrainAmount:{value:Ue.atmosphere.grainAmount},uContrast:{value:1.06},uSaturation:{value:1.08},uTint:{value:new C(.98,1.02,.98)}},vertexShader:`
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,fragmentShader:`
                    uniform sampler2D tDiffuse;
                    uniform float uTime;
                    uniform float uVignetteStrength;
                    uniform float uGrainAmount;
                    uniform float uContrast;
                    uniform float uSaturation;
                    uniform vec3 uTint;
                    varying vec2 vUv;

                    float random(vec2 st) {
                        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                    }

                    void main() {
                        vec4 color = texture2D(tDiffuse, vUv);
                        float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                        color.rgb = mix(vec3(luminance), color.rgb, uSaturation);
                        color.rgb = (color.rgb - 0.5) * uContrast + 0.5;
                        color.rgb *= uTint;

                        vec2 centeredUv = vUv - 0.5;
                        float vignette = 1.0 - dot(centeredUv, centeredUv) * (1.55 + uVignetteStrength);
                        color.rgb *= clamp(vignette, 0.62, 1.0);

                        if (uGrainAmount > 0.0) {
                            float grain = random(vUv * vec2(134.0, 289.0) + uTime) - 0.5;
                            color.rgb += grain * uGrainAmount;
                        }

                        gl_FragColor = color;
                    }
                `}),"tDiffuse"),this.composer.addPass(this.gradePass)}render(){this.gradePass.uniforms.uTime.value=performance.now()*.001,this.composer.render()}resize(e,t){this.composer.setSize(e,t),this.bloomPass.setSize(e,t)}setTint(e,t,n){this.gradePass.uniforms.uTint.value.set(e,t,n)}}class av{constructor(){fe(this,"ctx",null);fe(this,"enabled",!0);fe(this,"musicStarted",!1);fe(this,"musicMaster",null);fe(this,"prepGain",null);fe(this,"waveGain",null);fe(this,"musicPhase","off");fe(this,"waveBeatTimer",null)}init(){this.ctx||(this.ctx=new(window.AudioContext||window.webkitAudioContext)),this.ctx.state==="suspended"&&this.ctx.resume()}toggle(){return this.enabled=!this.enabled,this.musicMaster&&this.ctx&&this.musicMaster.gain.linearRampToValueAtTime(this.enabled?1:0,this.ctx.currentTime+.2),this.enabled}playTone(e,t,n,r){if(!this.enabled||!this.ctx)return;const s=this.ctx.createOscillator(),o=this.ctx.createGain();s.type=t,s.frequency.setValueAtTime(e,this.ctx.currentTime),s.connect(o),o.connect(this.ctx.destination),o.gain.setValueAtTime(r,this.ctx.currentTime),o.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+n),s.start(),s.stop(this.ctx.currentTime+n)}playShoot(){this.playTone(400,"square",.1,.05)}playHit(){this.playTone(150,"sawtooth",.15,.05)}playBuild(){this.playTone(600,"sine",.2,.1),setTimeout(()=>this.playTone(800,"sine",.2,.1),100)}playSell(){this.playTone(500,"triangle",.2,.1),setTimeout(()=>this.playTone(300,"triangle",.3,.1),100)}playError(){this.playTone(100,"sawtooth",.2,.1)}playStreakStinger(){if(!this.enabled||!this.ctx)return;[523,659,784,988].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"triangle",.18,.06),n*60)})}playMegaStingerHit(){if(!this.enabled||!this.ctx)return;[392,523,659,784,1047].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"sawtooth",.22,.07),n*70)})}playBossRoar(){if(!this.enabled||!this.ctx)return;const e=this.ctx,t=e.currentTime,n=e.createOscillator();n.type="sawtooth",n.frequency.setValueAtTime(50,t),n.frequency.exponentialRampToValueAtTime(28,t+.9);const r=e.createGain();r.gain.setValueAtTime(.18,t),r.gain.exponentialRampToValueAtTime(.01,t+1),n.connect(r),r.connect(e.destination),n.start(t),n.stop(t+1.05);const s=e.createBuffer(1,e.sampleRate*.8,e.sampleRate),o=s.getChannelData(0);for(let u=0;u<o.length;u++)o[u]=(Math.random()*2-1)*(1-u/o.length);const a=e.createBufferSource();a.buffer=s;const l=e.createGain();l.gain.setValueAtTime(.08,t),l.gain.exponentialRampToValueAtTime(.01,t+.8);const c=e.createBiquadFilter();c.type="lowpass",c.frequency.value=400,a.connect(c),c.connect(l),l.connect(e.destination),a.start(t),a.stop(t+.8)}playVictory(){if(!this.enabled||!this.ctx)return;[523,659,784,1047,1319].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"triangle",.35,.08),n*110)})}playDefeat(){if(!this.enabled||!this.ctx)return;[523,466,392,311].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"sawtooth",.4,.08),n*150)})}startMusic(){if(this.musicStarted||!this.ctx)return;this.musicStarted=!0;const e=this.ctx,t=e.createGain();t.gain.value=this.enabled?1:0,t.connect(e.destination),this.musicMaster=t;const n=e.createGain();n.gain.value=.035;const r=e.createBiquadFilter();r.type="lowpass",r.frequency.value=420,r.Q.value=.4,n.connect(r),r.connect(t);for(const l of[55,82]){const c=e.createOscillator();c.type="sine",c.frequency.value=l;const u=e.createOscillator();u.frequency.value=.07;const h=e.createGain();h.gain.value=2.5,u.connect(h),h.connect(c.frequency),c.connect(n),c.start(),u.start()}const s=e.createGain();s.gain.value=0,s.connect(t),this.prepGain=s;for(const l of[220,329.63,440]){const c=e.createOscillator();c.type="triangle",c.frequency.value=l;const u=e.createGain();u.gain.value=.02,c.connect(u),u.connect(s),c.start()}const o=e.createGain();o.gain.value=0,o.connect(t),this.waveGain=o;const a=e.createBiquadFilter();a.type="bandpass",a.frequency.value=600,a.Q.value=1.4,a.connect(o);for(const l of[110,164.81,220]){const c=e.createOscillator();c.type="sawtooth",c.frequency.value=l;const u=e.createGain();u.gain.value=.018,c.connect(u),u.connect(a),c.start()}}setMusicPhase(e){if(!this.ctx||(this.musicStarted||this.startMusic(),this.musicPhase===e))return;this.musicPhase=e;const t=this.ctx.currentTime,n=1.4,r=e==="prep"?.7:0,s=e==="wave"?.85:0;this.prepGain&&(this.prepGain.gain.cancelScheduledValues(t),this.prepGain.gain.setValueAtTime(this.prepGain.gain.value,t),this.prepGain.gain.linearRampToValueAtTime(r,t+n)),this.waveGain&&(this.waveGain.gain.cancelScheduledValues(t),this.waveGain.gain.setValueAtTime(this.waveGain.gain.value,t),this.waveGain.gain.linearRampToValueAtTime(s,t+n)),this.waveBeatTimer!==null&&(clearInterval(this.waveBeatTimer),this.waveBeatTimer=null),e==="wave"&&(this.waveBeatTimer=window.setInterval(()=>{if(!this.enabled||!this.ctx||this.musicPhase!=="wave")return;const o=this.ctx,a=o.currentTime,l=o.createOscillator();l.type="sine",l.frequency.setValueAtTime(90,a),l.frequency.exponentialRampToValueAtTime(40,a+.18);const c=o.createGain();c.gain.setValueAtTime(.08,a),c.gain.exponentialRampToValueAtTime(.001,a+.2),l.connect(c),this.musicMaster&&c.connect(this.musicMaster),l.start(a),l.stop(a+.22)},620))}}const Pt=new av,Tu="tower-defense-v1",qa={runs:0,victories:0,totalKills:0,totalWavesCleared:0,totalTowersBuilt:0,highestWaveReached:0},Ya={prefs:{difficulty:"normal",soundEnabled:!0,speedMultiplier:1,endlessMode:!1},highScores:{},achievements:[],lifetime:{...qa}};function lv(){try{const i=localStorage.getItem(Tu);if(!i)return structuredClone(Ya);const e=JSON.parse(i);return{prefs:{...Ya.prefs,...e.prefs??{}},highScores:e.highScores??{},achievements:e.achievements??[],lifetime:{...qa,...e.lifetime??{}}}}catch{return structuredClone(Ya)}}function Zn(i){try{localStorage.setItem(Tu,JSON.stringify(i))}catch{}}function cv(i,e,t,n,r){const s=i.highScores[e];return!s||t>s.score?(i.highScores[e]={score:t,wave:n,rank:r,date:Date.now()},Zn(i),!0):!1}function uv(i,e){return i.achievements.includes(e)?!1:(i.achievements.push(e),Zn(i),!0)}function hv(i,e,t,n,r,s){i.lifetime.runs+=1,e&&(i.lifetime.victories+=1),i.lifetime.totalKills+=t,i.lifetime.totalWavesCleared+=n,i.lifetime.totalTowersBuilt+=r,s>i.lifetime.highestWaveReached&&(i.lifetime.highestWaveReached=s),Zn(i)}function dv(i){i.highScores={},i.achievements=[],i.lifetime={...qa},Zn(i)}const $a=[{id:"first_blood",name:"First Blood",desc:"Score your very first kill",emoji:"🩸",check:(i,e)=>e.event==="enemyKilled"&&i.totalKills===1},{id:"streak_10",name:"Combo Rookie",desc:"Hit a 10-kill streak",emoji:"🔥",check:(i,e)=>e.event==="streakBonus"&&e.payload.streak>=10},{id:"streak_25",name:"Combo Master",desc:"Hit a 25-kill streak",emoji:"⚡",check:(i,e)=>e.event==="streakBonus"&&e.payload.streak>=25},{id:"perfect_wave",name:"Untouchable",desc:"Clear a wave without losing any lives",emoji:"🛡",check:(i,e)=>e.event==="waveCleared"&&e.payload.perfect===!0},{id:"milestone_25",name:"Holding the Line",desc:"Reach Wave 25",emoji:"🏁",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=25},{id:"milestone_50",name:"Frontline Veteran",desc:"Reach Wave 50",emoji:"🎖",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=50},{id:"milestone_75",name:"War Commander",desc:"Reach Wave 75",emoji:"👑",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=75},{id:"victory",name:"Bastion Triumphant",desc:"Clear all 99 waves",emoji:"🏆",check:(i,e)=>e.event==="gameOver"&&e.payload.won===!0},{id:"victory_hard",name:"Iron Legend",desc:"Clear all 99 waves on Hard",emoji:"💠",check:(i,e)=>e.event==="gameOver"&&e.payload.won===!0&&i.difficulty==="hard"},{id:"frugal",name:"Frugal Commander",desc:"Clear Wave 25 with only 3 towers or fewer",emoji:"💡",check:(i,e)=>e.event==="waveCleared"&&e.payload.wave>=25&&i.towers.length<=3}],rt=lv();let O,hn=null,Tt=null,dn=rt.prefs.difficulty;const jn=document.getElementById("game-canvas"),In=new Og({canvas:jn,antialias:!0,powerPreference:"high-performance"});In.setPixelRatio(Ue.pixelRatio),In.setSize(window.innerWidth,window.innerHeight),Ue.enableShadows&&(In.shadowMap.enabled=!0,In.shadowMap.type=eo),In.toneMapping=gl,In.toneMappingExposure=1.28;const Jt=new B0,Xt=new V0,sr=Xt.cam,Hs=W0(Jt.scene);Jt.buildGround();const Dn=new q0(Jt.scene),fv=new Z0(Jt.scene),yi=new j0(Jt.scene),pv=new K0(Jt.scene),Lt=new J0(Jt.scene);let Si=null;Ue.enablePostProcessing&&(Si=new ov(In,Jt.scene,sr));const Kn=[{wave:1,tint:[1.06,1,.93],fog:1781026},{wave:30,tint:[.98,1.02,.98],fog:1057815},{wave:60,tint:[1.08,.94,.82],fog:1840400},{wave:90,tint:[.84,.9,1.12],fog:790560}];let Za=-1;const Au=new xe;function mv(i){if(i===Za)return;Za=i;const e=Math.max(1,i+1);let t=Kn[0],n=Kn[Kn.length-1];for(let h=0;h<Kn.length-1;h++)if(e>=Kn[h].wave&&e<=Kn[h+1].wave){t=Kn[h],n=Kn[h+1];break}const r=n.wave===t.wave?0:(e-t.wave)/(n.wave-t.wave),s=Math.max(0,Math.min(1,r)),o=t.tint[0]+(n.tint[0]-t.tint[0])*s,a=t.tint[1]+(n.tint[1]-t.tint[1])*s,l=t.tint[2]+(n.tint[2]-t.tint[2])*s;Si&&Si.setTint(o,a,l);const c=new xe(t.fog),u=new xe(n.fog);Au.copy(c).lerp(u,s),Jt.scene.fog&&"color"in Jt.scene.fog&&Jt.scene.fog.color.copy(Au)}O=Ha(dn),O.speedMultiplier=rt.prefs.speedMultiplier,qe.on("streakBonus",i=>Ov(i.streak)),qe.on("milestone",i=>{Bv(i.wave),i.wave!==99&&i.wave>0&&i.wave%25===0&&Zv(i.wave)}),qe.on("towerBuilt",i=>{const e=_n(i.col,i.row);yi.addBuildEffect(e.x,e.z),Dn.sync(O),Jn()}),qe.on("towerUpgraded",i=>{Dn.removeTower(i.towerId),Dn.sync(O),Jn(),Tt&&Tt.id===i.towerId&&ku(Tt)}),qe.on("towerSold",i=>{yi.addSellEffect(i.worldX,i.worldZ),O.floatingTexts.push({id:O.nextId++,worldX:i.worldX,worldZ:i.worldZ,value:`+${i.refund}g`,color:"#ffd700",life:1.5,maxLife:1.5}),Dn.removeTower(i.towerId),Dn.sync(O),Jn(),Tt&&Tt.id===i.towerId&&dr()}),qe.on("enemyKilled",i=>{const e=O.enemies.find(n=>n.id===i.enemyId),t=(e==null?void 0:e.type)==="boss"?16751181:(e==null?void 0:e.type)==="shield"?7132159:(e==null?void 0:e.type)==="healer"?16751568:16748377;yi.addDeathEffect(i.worldX,i.worldZ,t),(e==null?void 0:e.type)==="boss"&&Xt.shake(.55)}),qe.on("milestone",()=>Xt.shake(.35)),qe.on("streakBonus",i=>{i.streak>=10&&Xt.shake(.25)}),qe.on("towerFired",i=>{yi.addMuzzleFlash(i.worldX,i.worldZ,i.towerType)}),qe.on("aoeImpact",i=>{yi.addImpactFlash(i.worldX,i.worldZ,i.radius,i.towerType)}),qe.on("bossSpawned",()=>{Xt.shake(.6),kv(),Pt.playBossRoar()}),qe.on("streakBonus",i=>{i.streak>=10?Pt.playMegaStingerHit():Pt.playStreakStinger()}),qe.on("gameOver",i=>{i.won?Pt.playVictory():Pt.playDefeat()});const gv=document.getElementById("gold-val"),vv=document.getElementById("lives-val"),Cu=document.getElementById("wave-val"),xv=document.getElementById("kills-val"),ja=document.getElementById("hud-wave"),Ka=document.getElementById("wave-remain"),Ja=document.getElementById("wave-progress-fill"),Qa=document.getElementById("skip-prep-btn"),el=document.getElementById("pause-btn"),tl=document.getElementById("speed-btn"),Hr=document.getElementById("sound-btn"),Ru=document.getElementById("enemy-panel"),_v=document.getElementById("enemy-name"),yv=document.getElementById("enemy-hp"),Sv=document.getElementById("enemy-spd"),Mv=document.getElementById("enemy-armor"),Vs=document.getElementById("wave-banner"),Vr=document.getElementById("wave-banner-text"),nl=document.getElementById("milestone-banner"),Ws=document.getElementById("milestone-banner-text"),or=document.getElementById("boss-cinematic"),il=document.getElementById("next-wave-preview"),wv=document.getElementById("preview-icons");let Xs=-2;const Wr=document.getElementById("wave-modifier"),bv=document.getElementById("mod-emoji"),Ev=document.getElementById("mod-label"),Tv=document.getElementById("mod-desc");let rl="__init__";function Av(){const i=O.waveModifier;if(i===rl)return;if(rl=i,!i||!Bs[i]){Wr.classList.add("hidden");return}const e=Bs[i];bv.textContent=e.emoji,Ev.textContent=e.label,Tv.textContent=e.desc,Wr.classList.remove("hidden"),Wr.style.animation="none",Wr.offsetWidth,Wr.style.animation=""}function Cv(){if(O.phase!=="prep"){il.classList.add("hidden"),Xs=-2;return}const i=kt.waves[O.currentWave];if(!i){il.classList.add("hidden");return}if(Xs===O.currentWave)return;Xs=O.currentWave;const e={};for(const n of i.groups)e[n.type]=(e[n.type]||0)+n.count;const t=Object.entries(e).map(([n,r])=>`<span class="preview-chip"><span class="ico">${Uu[n]||"❓"}</span><span class="cnt">×${r}</span></span>`).join("");wv.innerHTML=t,il.classList.remove("hidden")}qe.on("towerBuilt",()=>Pt.playBuild()),qe.on("towerSold",()=>Pt.playSell()),qe.on("enemyKilled",()=>Pt.playHit());const Pu=document.getElementById("floating-text-layer"),Rv=document.getElementById("help-btn"),ar=document.getElementById("help-overlay"),Pv=document.getElementById("help-close-btn"),Lv=document.getElementById("start-screen"),sl=document.getElementById("end-screen"),Lu=document.getElementById("end-title"),Iv=document.getElementById("end-score"),Iu=document.getElementById("end-rank"),Du=document.getElementById("tower-panel"),Xr=document.getElementById("cancel-build-btn"),lr=document.querySelectorAll(".build-btn[data-tower]"),qr=document.getElementById("streak-banner"),Un=document.getElementById("tower-tooltip"),Dv=Un.querySelector(".tooltip-name"),Uv=Un.querySelector(".tooltip-type"),Nv=Un.querySelector(".tooltip-stats"),Fv=Un.querySelector(".tooltip-special"),qs=kt.waves.length,Uu={grunt:"🧟",tank:"🐢",runner:"💨",swarm:"🐝",shield:"🛡",healer:"💚",boss:"💀"};function Jn(){gv.textContent=String(O.gold),vv.textContent=String(O.lives),O.endlessMode&&O.currentWave>=qs?Cu.textContent=`${O.currentWave+1} ♾`:Cu.textContent=`${Math.min(O.currentWave+1,qs)}/${qs}`,xv.textContent=String(O.totalKills);const i=O.enemies.filter(n=>n.alive).length,e=O.waveEnemiesTotal||0;if(O.phase==="prep"){ja.classList.add("prep");const n=kt.prepSec,r=Math.max(0,Math.min(1,1-O.prepTimer/n));Ka.textContent=`⏳ ${Math.max(0,Math.ceil(O.prepTimer))}s`,Ja.style.width=`${Math.round(r*100)}%`}else if(O.phase==="wave"&&e>0){ja.classList.remove("prep");const n=Math.max(0,O.waveEnemiesSpawned-i),r=Math.max(0,Math.min(1,n/e));Ka.textContent=`${i} / ${e}`,Ja.style.width=`${Math.round(r*100)}%`}else ja.classList.remove("prep"),Ka.textContent="—",Ja.style.width="0%";Qa.classList.toggle("hidden",O.phase!=="prep"),Cv(),Av(),lr.forEach(n=>{const r=n.getAttribute("data-tower"),s=jt[r].levels[0].buildCost,o=O.gold>=s;n.classList.toggle("disabled",!o)});let t=null;if(Lt.hoveredCol>=0&&O.phase==="wave"){const n=_n(Lt.hoveredCol,Lt.hoveredRow);let r=1;for(const s of O.enemies){if(!s.alive)continue;const o=s.worldX-n.x,a=s.worldZ-n.z,l=o*o+a*a;l<r&&(r=l,t=s)}}if(t){const n=Or[t.type];_v.textContent=n.name,yv.textContent=`${Math.ceil(t.hp)}/${n.hp}`,Sv.textContent=n.speed.toFixed(1),Mv.textContent=String(n.armor),Ru.classList.remove("hidden")}else Ru.classList.add("hidden")}let cr=null;function ol(i){Vr.textContent=i,Vs.classList.remove("hidden"),Vr.style.animation="none",Vr.offsetWidth,Vr.style.animation="",cr&&clearTimeout(cr),cr=window.setTimeout(()=>{Vs.classList.add("hidden")},2e3)}let ur=null;function Ov(i){const e=i>=10;qr.textContent=e?`⚡ x${i} MEGA COMBO!`:`🔥 x${i} Kill Streak!`,qr.className=e?"streak-mega":"streak-normal",qr.classList.remove("hidden"),ur&&clearTimeout(ur),ur=window.setTimeout(()=>{qr.classList.add("hidden")},1800)}let Mi=null;function kv(){Mi&&clearTimeout(Mi),or.classList.remove("hidden"),or.style.animation="none",or.offsetWidth,or.style.animation="",Mi=window.setTimeout(()=>{or.classList.add("hidden"),Mi=null},2400)}let hr=null;function Bv(i){Ws.textContent=`🏆 Milestone Wave ${i}! +500g!`,nl.classList.remove("hidden"),Ws.style.animation="none",Ws.offsetWidth,Ws.style.animation="",hr&&clearTimeout(hr),hr=window.setTimeout(()=>{nl.classList.add("hidden")},3500)}const zv=document.getElementById("achievement-toasts");function Gv(i){const e=document.createElement("div");e.className="ach-toast",e.innerHTML=`<div class="ach-emoji">${i.emoji}</div><div class="ach-body"><div class="ach-kicker">Achievement Unlocked</div><div class="ach-name">${i.name}</div><div class="ach-desc">${i.desc}</div></div>`,zv.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},4400)}function Yr(i,e){const t={event:i,payload:e};for(const n of $a)if(!rt.achievements.includes(n.id))try{n.check(O,t)&&uv(rt,n.id)&&Gv(n)}catch{}}qe.on("enemyKilled",i=>Yr("enemyKilled",{enemyId:i.enemyId,bounty:i.bounty})),qe.on("streakBonus",i=>Yr("streakBonus",{streak:i.streak})),qe.on("waveCleared",i=>Yr("waveCleared",{wave:i.wave,perfect:i.perfect})),qe.on("milestone",i=>Yr("milestone",{wave:i.wave})),qe.on("gameOver",i=>Yr("gameOver",{won:i.won,score:i.score}));const Nu=document.getElementById("hs-score"),Fu=document.getElementById("hs-sub");function Ys(){const i=rt.highScores[dn];i?(Nu.textContent=String(i.score),Fu.textContent=`Wave ${i.wave} · ${i.rank} · ${dn}`):(Nu.textContent="—",Fu.textContent=`No record on ${dn}`),Xv()}const Hv=document.getElementById("lt-runs"),Vv=document.getElementById("lt-kills"),Wv=document.getElementById("lt-best-wave");function Xv(){Hv.textContent=String(rt.lifetime.runs),Vv.textContent=String(rt.lifetime.totalKills),Wv.textContent=String(rt.lifetime.highestWaveReached)}const qv=[{id:"damage",emoji:"🗡",name:"Overcharge",desc:"+20% tower damage (stacks)",apply:()=>{O.buffDamageMult*=1.2}},{id:"range",emoji:"🎯",name:"Long Sight",desc:"+15% tower range (stacks)",apply:()=>{O.buffRangeMult*=1.15}},{id:"gold",emoji:"💰",name:"Gold Rush",desc:"+25% gold from kills (stacks)",apply:()=>{O.buffGoldMult*=1.25}},{id:"fortify",emoji:"❤",name:"Fortify",desc:"+5 lives and +5 max lives",apply:()=>{O.maxLives+=5,O.lives=Math.min(O.maxLives,O.lives+5)}},{id:"bounty",emoji:"🏦",name:"War Chest",desc:"Instant +300 gold",apply:()=>{O.gold+=300}}],al=document.getElementById("buff-modal"),Ou=document.getElementById("buff-cards"),Yv=document.getElementById("buff-wave");function $v(){const i=qv.slice(),e=[];for(;e.length<3&&i.length;){const t=Math.floor(Math.random()*i.length);e.push(i.splice(t,1)[0])}return e}function Zv(i){if(O.buffChoicePending)return;O.buffChoicePending=!0,O.paused=!0,Yv.textContent=String(i);const e=$v();Ou.innerHTML="";for(const t of e){const n=document.createElement("button");n.className="buff-card",n.innerHTML=`<span class="card-emoji">${t.emoji}</span><span class="card-name">${t.name}</span><span class="card-desc">${t.desc}</span>`,n.addEventListener("click",()=>{t.apply(),O.floatingTexts.push({id:O.nextId++,worldX:0,worldZ:0,value:`${t.emoji} ${t.name}`,color:"#ffd486",life:2.5,maxLife:2.5}),jv()}),Ou.appendChild(n)}al.classList.remove("hidden")}function jv(){al.classList.add("hidden"),O.buffChoicePending=!1,O.paused=!1}function Kv(i,e){const t=new C(i,.6,e);return t.project(sr),{x:(t.x*.5+.5)*window.innerWidth,y:(-t.y*.5+.5)*window.innerHeight}}const $r=new Map;function Jv(i){for(let e=O.floatingTexts.length-1;e>=0;e--){const t=O.floatingTexts[e];if(t.life-=i,t.life<=0){const s=$r.get(t.id);s&&(Pu.removeChild(s),$r.delete(t.id)),O.floatingTexts.splice(e,1);continue}if(!$r.has(t.id)){const s=document.createElement("div");s.className="floating-text",s.textContent=t.value,s.style.color=t.color,s.style.animationDuration=`${t.maxLife}s`,Pu.appendChild(s),$r.set(t.id,s)}const n=$r.get(t.id),r=Kv(t.worldX,t.worldZ);n.style.left=`${r.x}px`,n.style.top=`${r.y}px`}}function ku(i){Tt=i;const e=jt[i.type],t=e.levels[i.level];document.getElementById("panel-tower-name").textContent=e.name,document.getElementById("panel-tower-level").textContent=`Lv.${i.level+1}`,document.getElementById("panel-dmg").textContent=String(t.damage),document.getElementById("panel-spd").textContent=`${t.cooldownSec}s`,document.getElementById("panel-rng").textContent=String(t.range);const n=document.getElementById("panel-special"),r=[];t.aoeRadius>0&&r.push(`AOE ${t.aoeRadius}`),t.slow&&r.push(`Slow ${Math.round(t.slow.pct*100)}%`),t.dot&&r.push(`DOT ${t.dot.dps}/s ${t.dot.durationSec}s`),t.chain&&r.push(`Chain ×${t.chain.targets}`),r.push(`🗡 ${i.kills}`),n.textContent=r.join(" | "),document.querySelectorAll(".target-btn").forEach(c=>{const u=c.getAttribute("data-mode");c.classList.toggle("active",i.targetingMode===u),c.onclick=()=>{i.targetingMode=u,document.querySelectorAll(".target-btn").forEach(h=>h.classList.toggle("active",h.getAttribute("data-mode")===u))}});const s=document.getElementById("upgrade-btn"),o=document.getElementById("evolve-container"),a=document.getElementById("sell-btn"),l=e.levels;if(o.classList.add("hidden"),o.innerHTML="",s.style.display="block",i.level>=l.length-1)if(e.evolutions&&e.evolutions.length>0){s.style.display="none",o.classList.remove("hidden");for(const c of e.evolutions){const u=document.createElement("button");u.className="action-btn evolve",u.innerHTML=`⭐ ${c.name} (<span class="evolve-cost">${c.cost}</span>g)<div style="font-size: 0.8em; margin-top: 2px;">${c.desc}</div>`,u.disabled=O.gold<c.cost,u.onclick=()=>{Tt&&U0(O,Tt.id,c.type)},o.appendChild(u)}}else s.disabled=!0,s.textContent="⬆ MAX";else{const c=l[i.level+1].upgradeCost;s.disabled=!D0(O,i),s.innerHTML=`⬆ Upgrade (<span id="upgrade-cost">${c}</span>g)`}document.getElementById("sell-value").textContent=String(fu(i)),a.innerHTML=`💰 Sell (<span id="sell-value">${fu(i)}</span>g)`,Du.classList.remove("hidden"),Dn.showRange(i,t.range)}function dr(){Tt=null,Du.classList.add("hidden"),Dn.hideRange()}const Qv=document.getElementById("end-best-badge");function Bu(){const i=O.phase==="won";Lu.textContent=i?"🎉 Victory!":"💀 Defeat",Lu.style.color=i?"#ffd700":"#ff5555",Iv.textContent=`Score: ${O.score}`;let e="C";for(const r of p0.ranks)if(O.score>=r.min){e=r.name;break}Iu.textContent=e,Iu.className=`rank rank-${e}`;const t=O.endlessMode?O.currentWave+1:Math.min(O.currentWave+1,kt.waves.length),n=cv(rt,O.difficulty,O.score,t,e);Qv.classList.toggle("hidden",!n),hv(rt,i,O.totalKills,O.currentWave,O.stats.towersBuilt,t),Ys(),document.getElementById("stat-kills").textContent=O.totalKills.toString(),document.getElementById("stat-streak").textContent=O.stats.longestStreak.toString(),document.getElementById("stat-perfect").textContent=O.perfectWaves.toString(),document.getElementById("stat-built").textContent=O.stats.towersBuilt.toString(),document.getElementById("stat-gold").textContent=O.stats.goldEarned.toString(),document.getElementById("stat-dmg").textContent=Math.round(O.stats.totalDamageDealt).toString(),sl.classList.remove("hidden")}lr.forEach(i=>{i.addEventListener("click",e=>{e.stopPropagation();const t=i.getAttribute("data-tower");O.gold<jt[t].levels[0].buildCost||(hn===t?(hn=null,i.classList.remove("selected"),Xr.style.display="none",Lt.hideGhost()):(lr.forEach(n=>n.classList.remove("selected")),hn=t,i.classList.add("selected"),Xr.style.display="",dr()))}),i.addEventListener("mouseenter",()=>{const e=i.getAttribute("data-tower");if(!e||!jt[e])return;const t=jt[e],n=t.levels[0];Dv.textContent=t.name+" Tower",Uv.textContent="Type: "+t.damageType,Nv.innerHTML=`
            <div><span>Damage:</span> <span>${n.damage}</span></div>
            <div><span>Speed:</span> <span>${n.cooldownSec}s</span></div>
            <div><span>Range:</span> <span>${n.range}</span></div>
            <div><span>DPS:</span> <span>${(n.damage/n.cooldownSec).toFixed(1)}</span></div>
        `;let r="";n.slow?r=`Slows by ${Math.round(n.slow.pct*100)}% for ${n.slow.durationSec}s`:n.dot?r=`DOT: ${n.dot.dps} dmg/s (${n.dot.durationSec}s)`:n.chain?r=`Chains to ${n.chain.targets} targets`:n.aoeRadius>0&&(r=`AOE Radius: ${n.aoeRadius}`),Fv.textContent=r;const s=i.getBoundingClientRect();Un.style.left=`${s.left+s.width/2}px`,Un.style.transform="translate(-50%, calc(-100% - 10px))",Un.style.top=`${s.top}px`,Un.classList.remove("hidden")}),i.addEventListener("mouseleave",()=>{Un.classList.add("hidden")})}),Xr.addEventListener("click",i=>{i.stopPropagation(),hn=null,lr.forEach(e=>e.classList.remove("selected")),Xr.style.display="none",Lt.hideGhost()}),tl.addEventListener("click",()=>{O.speedMultiplier=O.speedMultiplier===1?2:O.speedMultiplier===2?4:1,tl.textContent=O.speedMultiplier+"×",rt.prefs.speedMultiplier=O.speedMultiplier,Zn(rt)}),Hr.addEventListener("click",()=>{Pt.init();const i=Pt.toggle();Hr.textContent=i?"🔊":"🔇",Hr.style.opacity=i?"1":"0.5",rt.prefs.soundEnabled=i,Zn(rt)}),el.addEventListener("click",zu);function zu(){O.paused=!O.paused,el.textContent=O.paused?"▶":"⏸",el.classList.toggle("active",O.paused)}window.addEventListener("keydown",i=>{if(O.phase==="idle"||O.phase==="won"||O.phase==="lost")return;const e=i.key.toLowerCase();if(e==="p"){(O.phase==="wave"||O.phase==="prep")&&zu();return}if(ar.classList.contains("hidden")){if(e>="1"&&e<="7"){const t=Number(e)-1;t>=0&&t<lr.length&&lr[t].click()}e==="u"&&Tt&&document.getElementById("upgrade-btn").click(),e==="s"&&Tt&&document.getElementById("sell-btn").click(),e==="q"&&$s(0),e==="w"&&$s(1),e==="e"&&$s(2),i.key==="Escape"&&(hn?Xr.click():Tt&&document.getElementById("panel-close-btn").click())}});const Gu=document.querySelectorAll(".skill-btn");Gu.forEach(i=>{i.addEventListener("click",()=>{const e=parseInt(i.getAttribute("data-skill")||"0",10);$s(e)})});function $s(i){if(O.phase!=="wave"&&O.phase!=="prep")return;const e=O.skills[i];if(!(!e||e.remaining>0)){if(i===0)for(const t of O.enemies)t.alive&&(t.hp-=200,t.hp<=0?Wa(O,t):O.floatingTexts.push({id:O.nextId++,worldX:t.worldX,worldZ:t.worldZ,value:"-200",color:"#ff4444",life:1,maxLife:1}));else if(i===1)for(const t of O.enemies)t.alive&&(t.slow={pct:1,remaining:5});else i===2&&(O.lives=Math.min(O.maxLives,O.lives+5),Jn());e.remaining=e.cooldown,ll()}}function ll(){Gu.forEach(i=>{const e=parseInt(i.getAttribute("data-skill")||"0",10),t=O.skills[e],n=i.querySelector(".skill-cd");t&&t.remaining>0?(i.classList.add("on-cooldown"),n.classList.remove("hidden"),n.textContent=Math.ceil(t.remaining)+"s"):(i.classList.remove("on-cooldown"),n.classList.add("hidden"))})}Qa.addEventListener("click",()=>{O.phase==="prep"&&(O.gold+=50,O.prepTimer=0,Qa.classList.add("hidden"),Jn())}),document.getElementById("upgrade-btn").addEventListener("click",()=>{Tt&&L0(O,Tt.id)}),document.getElementById("sell-btn").addEventListener("click",()=>{Tt&&I0(O,Tt.id)}),document.getElementById("panel-close-btn").addEventListener("click",()=>{dr()}),document.getElementById("start-btn").addEventListener("click",()=>{Lv.classList.add("hidden"),$u(),O.endlessMode=rt.prefs.endlessMode,Pt.init(),Pt.startMusic(),Va(O),ol("Wave 1")});const cl=document.querySelectorAll(".diff-btn"),Hu=document.getElementById("diff-desc"),Vu={easy:"Easy difficulty — 600g, 30 lives, 25% weaker enemies",normal:"Standard difficulty — 400g, 20 lives",hard:"Hard difficulty — 250g, 10 lives, 40% tougher enemies & slightly faster"};cl.forEach(i=>{i.addEventListener("click",()=>{cl.forEach(e=>e.classList.remove("active")),i.classList.add("active"),dn=i.getAttribute("data-diff"),Hu.textContent=Vu[dn],rt.prefs.difficulty=dn,Zn(rt),O=Ha(dn),O.speedMultiplier=rt.prefs.speedMultiplier,Jn(),Ys()})});const ul=document.getElementById("endless-toggle");ul.addEventListener("change",()=>{rt.prefs.endlessMode=ul.checked,Zn(rt)}),(function(){cl.forEach(e=>{e.classList.toggle("active",e.getAttribute("data-diff")===dn)}),Hu.textContent=Vu[dn],tl.textContent=O.speedMultiplier+"×",rt.prefs.soundEnabled||(Pt.toggle(),Hr.textContent="🔇",Hr.style.opacity="0.5"),ul.checked=rt.prefs.endlessMode,Ys()})();const Zs=document.getElementById("achievements-modal"),Wu=document.getElementById("ach-grid"),ex=document.getElementById("ach-count");function Xu(){Wu.innerHTML="";let i=0;for(const e of $a){const t=rt.achievements.includes(e.id);t&&i++;const n=document.createElement("div");n.className=`ach-row ${t?"unlocked":"locked"}`,n.innerHTML=`<div class="row-emoji">${t?e.emoji:"🔒"}</div><div class="row-body"><div class="row-name">${e.name}</div><div class="row-desc">${e.desc}</div></div>`,Wu.appendChild(n)}ex.textContent=`${i}/${$a.length}`}document.getElementById("achievements-btn").addEventListener("click",()=>{Xu(),Zs.classList.remove("hidden")}),document.getElementById("ach-close-btn").addEventListener("click",()=>{Zs.classList.add("hidden")}),Zs.addEventListener("click",i=>{i.target.classList.contains("ach-backdrop")&&Zs.classList.add("hidden")});const Qn=document.getElementById("ach-reset-btn");let js=!1,fr=null;Qn.addEventListener("click",()=>{if(!js){js=!0,Qn.classList.add("confirming"),Qn.textContent="⚠ Click again to confirm reset",fr&&clearTimeout(fr),fr=window.setTimeout(()=>{js=!1,Qn.classList.remove("confirming"),Qn.textContent="⟲ Reset Progress"},4e3);return}dv(rt),js=!1,fr&&(clearTimeout(fr),fr=null),Qn.classList.remove("confirming"),Qn.textContent="✓ Reset",setTimeout(()=>{Qn.textContent="⟲ Reset Progress"},1400),Xu(),Ys()}),Rv.addEventListener("click",()=>{ar.classList.remove("hidden")}),Pv.addEventListener("click",()=>{ar.classList.add("hidden")}),ar.addEventListener("click",i=>{i.target===ar&&ar.classList.add("hidden")}),document.getElementById("restart-btn").addEventListener("click",()=>{sl.classList.add("hidden"),O=Ha(dn),O.speedMultiplier=rt.prefs.speedMultiplier,O.endlessMode=rt.prefs.endlessMode,$u(),Dn.sync(O),Jn(),ll(),dr(),Va(O),ol("Wave 1")}),document.getElementById("home-btn").addEventListener("click",()=>{window.location.href="../../../index.html"}),jn.addEventListener("click",()=>{if(Xt.twoFingerActive||O.phase==="idle"||O.phase==="won"||O.phase==="lost")return;const i=Lt.hoveredCol,e=Lt.hoveredRow;if(!(i<0||e<0))if(hn)P0(O,hn,i,e);else{const t=O.towers.find(n=>n.col===i&&n.row===e);t?ku(t):dr()}}),jn.addEventListener("mousemove",i=>{Lt.updateMouse(i,sr),qu()}),jn.addEventListener("touchmove",i=>{i.touches.length===1&&!Xt.twoFingerActive&&(Lt.updateMouse(i,sr),qu())},{passive:!0});function qu(){if(!hn||Lt.hoveredCol<0){Lt.hideGhost();return}const i=du(O,Lt.hoveredCol,Lt.hoveredRow)&&O.gold>=jt[hn].levels[0].buildCost,e=jt[hn].levels[0].range;Lt.showGhost(Lt.hoveredCol,Lt.hoveredRow,i,hn,e)}jn.addEventListener("wheel",i=>{i.preventDefault(),Xt.zoom(i.deltaY)},{passive:!1}),jn.addEventListener("touchstart",Xt.onTouchStart,{passive:!0}),jn.addEventListener("touchmove",Xt.onTouchMove,{passive:!1}),jn.addEventListener("touchend",Xt.onTouchEnd,{passive:!0}),window.addEventListener("resize",()=>{Xt.resize(In),Si&&Si.resize(window.innerWidth,window.innerHeight)});let Yu=0,pr=0,hl=-1,wi=null;function $u(){pr=0,hl=-1,Za=-1,Xs=-2,rl="__init__",wi=null,al.classList.add("hidden"),cr&&(clearTimeout(cr),cr=null),ur&&(clearTimeout(ur),ur=null),hr&&(clearTimeout(hr),hr=null),Mi&&(clearTimeout(Mi),Mi=null),Vs.classList.add("hidden"),qr.classList.add("hidden"),nl.classList.add("hidden"),or.classList.add("hidden")}function Ks(){Si?Si.render():In.render(Jt.scene,sr)}function Zu(i){var o,a;requestAnimationFrame(Zu);const e=Math.min((i-Yu)/1e3,.1);Yu=i;const t=i*.001;if(O.phase==="idle"){Hs.update(t),Ks();return}if(O.phase==="won"||O.phase==="lost"){sl.classList.contains("hidden")&&Bu(),wi!=="off"&&(Pt.setMusicPhase("off"),wi="off"),Hs.update(t),Ks();return}if(O.paused){Hs.update(t),Ks();return}const n=e*O.speedMultiplier;pr+=n;const r=5;pr>$n*r&&(pr=$n*r);const s=new Map;for(const l of O.projectiles)s.set(l.id,{id:l.id,targetX:l.targetX,targetZ:l.targetZ,towerType:l.towerType});for(;pr>=$n;){S0(O,$n),T0(O,$n),C0(O,$n),R0(O,$n),pr-=$n;const l=O.phase;if(l==="won"||l==="lost"){Bu();break}}if(O.phase==="wave"||O.phase==="prep"){for(const l of O.skills)l.remaining>0&&(l.remaining=Math.max(0,l.remaining-n));ll()}if(O.phase==="prep"&&wi!=="prep"?(Pt.setMusicPhase("prep"),wi="prep"):O.phase==="wave"&&wi!=="wave"&&(Pt.setMusicPhase("wave"),wi="wave"),O.currentWave!==hl&&O.phase==="wave"&&(hl=O.currentWave,ol(`Wave ${O.currentWave+1}`)),O.phase==="prep"){const l=Math.ceil(O.prepTimer),c=Math.min(O.currentWave+1,qs-1),u=kt.waves[c],h=((o=u==null?void 0:u.groups)==null?void 0:o.reduce((p,g)=>p+g.count,0))??"?",d=((a=u==null?void 0:u.groups)==null?void 0:a.map(p=>`${Uu[p.type]??"?"}×${p.count}`).join(" "))??"";Vr.textContent=`Wave ${c+1} — ${h} enemies | ${d} | Next in ${l}s`,Vs.classList.remove("hidden")}for(const[l,c]of s.entries())O.projectiles.find(u=>u.id===l)||yi.addExplosion(c.targetX,c.targetZ,c.towerType);Dn.animate(e,O),fv.sync(O,0,sr),yi.sync(O,n),pv.sync(O,n),Jv(e),Hs.update(t),Xt.tickShake(e),mv(O.currentWave),Jn(),Tt&&(O.towers.find(c=>c.id===Tt.id)||dr()),Ks()}requestAnimationFrame(Zu)})();
