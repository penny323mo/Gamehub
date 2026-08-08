var oS=Object.defineProperty;var aS=(ii,un,Gi)=>un in ii?oS(ii,un,{enumerable:!0,configurable:!0,writable:!0,value:Gi}):ii[un]=Gi;var J=(ii,un,Gi)=>aS(ii,typeof un!="symbol"?un+"":un,Gi);(function(){"use strict";var ii=document.createElement("style");ii.textContent=`:root{--font-ui: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, "PingFang HK", "Microsoft JhengHei", sans-serif;--font-display: "Bahnschrift", "DIN Alternate", "Avenir Next Condensed", "Segoe UI Semibold", system-ui, sans-serif}*{margin:0;padding:0;box-sizing:border-box}:root{--bg-deep: rgba(7, 15, 11, .82);--glass: rgba(14, 28, 21, .72);--glass-strong: rgba(10, 22, 17, .88);--panel-stroke: rgba(198, 237, 198, .12);--panel-highlight: rgba(255, 255, 255, .06);--text-main: #eff7ef;--text-muted: rgba(233, 244, 233, .68);--gold: #f6d67b;--danger: #ff8570;--info: #8fd7ff;--energy: #d0a4ff;--action: #71d9ff;--action-strong: #0e91d0;--shadow-lg: 0 20px 48px rgba(0, 0, 0, .35)}html,body{width:100%;height:100%;overflow:hidden;font-family:var(--font-ui);background:radial-gradient(circle at top,rgba(48,112,74,.28),transparent 38%),radial-gradient(circle at bottom,rgba(22,44,31,.22),transparent 42%),#08110c;color:var(--text-main);user-select:none;-webkit-user-select:none}#game-canvas{position:fixed;top:0;left:0;width:100%;height:100%;display:block}#hud{position:fixed;top:14px;left:12px;right:12px;display:flex;gap:10px;align-items:center;pointer-events:none;z-index:10;flex-wrap:wrap}#hud>div,#hud>button{pointer-events:auto;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),var(--glass);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--panel-stroke);border-radius:14px;box-shadow:inset 0 1px 0 var(--panel-highlight),0 12px 28px #0003;padding:9px 14px;font-size:14px;font-weight:600;color:var(--text-main);white-space:nowrap}#hud-gold{color:var(--gold)}#hud-lives{color:var(--danger)}#hud-wave{color:var(--info);display:flex;flex-direction:column;gap:5px;min-width:158px;padding:7px 12px 8px!important}#hud-wave .wave-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px}#hud-wave .wave-label{color:var(--info);font-weight:700;letter-spacing:.02em}#hud-wave .wave-remain{font-family:var(--font-display);font-size:11px;font-weight:700;color:#e8f5f7ad;letter-spacing:.06em}#hud-wave .wave-progress-track{position:relative;width:100%;height:5px;border-radius:999px;overflow:hidden;background:#8fd7ff1f;box-shadow:inset 0 0 0 1px #8fd7ff1f}#hud-wave .wave-progress-fill{position:absolute;top:0;right:0;bottom:0;left:0;width:0%;background:linear-gradient(90deg,#8fd7ff,#7ef5c3);border-radius:inherit;box-shadow:0 0 10px #8fd7ff8c;transition:width .25s ease-out}#hud-wave.prep .wave-progress-fill{background:linear-gradient(90deg,#f7d36e,#ff9a4d);box-shadow:0 0 10px #f7c46b8c}#hud-kills{color:var(--energy)}#skip-prep-btn{pointer-events:auto;background:linear-gradient(135deg,#f5c45947,#bd791633);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,208,105,.34);border-radius:12px;padding:8px 14px;font-size:14px;font-weight:700;color:var(--gold);cursor:pointer;transition:all .2s}#skip-prep-btn:hover{background:#ffc80059}#pause-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#pause-btn:hover{background:#ffffff26}#pause-btn.active{background:#ffb40040;border-color:#fc4;color:#fc4}#speed-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 16px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#speed-btn:hover{background:#ffffff26}#speed-btn.active{background:#64c8ff4d;border-color:#8cf;color:#8cf}#wave-banner{position:fixed;top:88px;left:50%;transform:translate(-50%,-50%);z-index:20;pointer-events:none;width:min(720px,calc(100vw - 40px));text-align:center}#wave-banner-text{display:inline-block;font-family:var(--font-display);font-size:28px;font-weight:800;color:#f7fbf7;letter-spacing:.02em;text-shadow:0 0 18px rgba(111,207,255,.22);padding:12px 22px;border-radius:18px;border:1px solid rgba(190,239,199,.14);background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#0a1611bd;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:var(--shadow-lg);animation:bannerPulse .6s ease-out}@keyframes bannerPulse{0%{transform:scale(.5);opacity:0}50%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}#build-menu{position:fixed;bottom:16px;left:50%;transform:translate(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;z-index:10;padding:12px 16px 14px;background:radial-gradient(circle at top,rgba(92,169,126,.14),transparent 42%),linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),var(--glass-strong);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--panel-stroke);border-radius:20px;box-shadow:var(--shadow-lg);max-width:95vw}#skill-bar{position:fixed;left:18px;bottom:22px;z-index:12;display:flex;gap:10px;padding:10px 12px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130fd1;border:1px solid var(--panel-stroke);box-shadow:var(--shadow-lg);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.skill-btn{position:relative;width:56px;height:56px;display:grid;place-items:center;border-radius:16px;border:1px solid rgba(177,225,191,.12);background:linear-gradient(180deg,rgba(255,255,255,.06),transparent 58%),#ffffff0d;color:var(--text-main);cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}.skill-btn:hover{transform:translateY(-2px);border-color:#6fd9ff5c;background:#ffffff1c}.skill-emoji{font-size:24px}.skill-key,.skill-cd{position:absolute;font-family:var(--font-display);font-size:11px;font-weight:700;border-radius:999px;padding:2px 6px}.skill-key{bottom:6px;right:6px;background:#0f91d03d;color:#d8f6ff}.skill-cd{top:6px;left:6px;background:#ff8c7038;color:#ffd8d1}.skill-btn.on-cooldown{opacity:.72}.build-title{font-family:var(--font-display);font-size:12px;font-weight:700;color:#e1f3e38f;letter-spacing:3px;text-transform:uppercase}.build-subtitle{font-size:11px;color:var(--text-muted);margin-top:-2px}.build-grid{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.build-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 60%),#ffffff12;border:1px solid rgba(214,245,219,.12);border-radius:12px;color:var(--text-main);cursor:pointer;transition:all .2s;min-width:60px;position:relative;box-shadow:inset 0 1px #ffffff0a}.build-key{position:absolute;top:-6px;left:-6px;background:#3b82f6;color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:4px;box-shadow:0 2px 4px #00000080;border:1px solid #60a5fa;pointer-events:none}.build-btn:hover{background:#ffffff29;border-color:#97dfba4d;transform:translateY(-2px)}.build-btn.selected{background:#64c8ff2e;border-color:#77d6ff8c;box-shadow:0 0 18px #64c8ff38}.build-btn.disabled{opacity:.35;cursor:not-allowed}.build-icon{font-size:20px}.build-name{font-size:10px;font-weight:600}.build-cost{font-size:9px;color:gold;font-weight:600}.cancel-btn{background:#ff3c3c26;border-color:#ff3c3c4d}.cancel-btn:hover{background:#ff3c3c4d}#tower-panel{position:fixed;right:16px;bottom:130px;width:246px;background:radial-gradient(circle at top,rgba(103,177,133,.16),transparent 44%),linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130fdb;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-stroke);border-radius:18px;box-shadow:var(--shadow-lg);padding:16px;z-index:15}.panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.panel-header span{font-weight:700;font-size:15px}#panel-tower-level{color:#8cf;font-size:13px}#panel-close-btn{background:none;border:none;color:#ffffff80;font-size:16px;cursor:pointer;padding:2px 6px}#panel-close-btn:hover{color:#fff}.panel-stats{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:13px;color:#ffffffbf;margin-bottom:12px}#panel-special-row{grid-column:1 / -1}.panel-targeting{margin-bottom:10px}.targeting-label{font-size:11px;color:#ffffff80;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}.targeting-btns{display:flex;gap:4px}.target-btn{flex:1;padding:5px 2px;border:1px solid rgba(255,255,255,.15);border-radius:6px;background:#ffffff0d;color:#fff9;font-size:11px;cursor:pointer;transition:all .15s}.target-btn:hover{background:#ffffff1f;color:#fff}.target-btn.active{background:#64c8ff40;border-color:#8cf;color:#8cf;font-weight:700}.panel-actions{display:flex;gap:8px}.action-btn{flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;color:#fff}.action-btn.upgrade{background:linear-gradient(135deg,#26a,#38c)}.action-btn.upgrade:hover{background:linear-gradient(135deg,#37b,#4ae)}.action-btn.upgrade:disabled{opacity:.4;cursor:not-allowed}#evolve-container{display:flex;flex-direction:column;gap:6px;flex:2}.action-btn.evolve{background:linear-gradient(135deg,#c8f,#93f);font-size:11px;padding:6px}.action-btn.evolve:hover{background:linear-gradient(135deg,#eeaafe,#a4f)}.action-btn.evolve:disabled{opacity:.4;cursor:not-allowed}.action-btn.sell{background:linear-gradient(135deg,#842,#a53)}.action-btn.sell:hover{background:linear-gradient(135deg,#953,#c64)}#start-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 20% 18%,rgba(93,180,134,.22),transparent 28%),radial-gradient(circle at 78% 22%,rgba(115,209,255,.14),transparent 22%),radial-gradient(circle at 50% 100%,rgba(177,126,52,.18),transparent 38%),linear-gradient(145deg,#05100af5,#0a1711f0);display:flex;justify-content:center;align-items:center;z-index:100;overflow:hidden}.start-aurora{position:absolute;top:-20%;right:-20%;bottom:-20%;left:-20%;pointer-events:none;background:radial-gradient(ellipse 45% 35% at 30% 35%,rgba(111,217,255,.18),transparent 60%),radial-gradient(ellipse 40% 30% at 70% 60%,rgba(245,196,107,.14),transparent 60%),radial-gradient(ellipse 50% 40% at 55% 80%,rgba(93,180,134,.14),transparent 65%);filter:blur(6px);animation:auroraDrift 26s ease-in-out infinite alternate}@keyframes auroraDrift{0%{transform:translate3d(-4%,-3%,0) rotate(0);opacity:.8}50%{transform:translate3d(3%,2%,0) rotate(6deg);opacity:1}to{transform:translate3d(2%,-4%,0) rotate(-5deg);opacity:.85}}.start-embers{position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none;overflow:hidden}.ember{position:absolute;bottom:-20px;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle,rgba(255,225,160,.95),rgba(255,170,80,.55) 55%,transparent 75%);box-shadow:0 0 10px #ffcd8299;opacity:0;animation:emberRise 9s linear infinite}.ember.e1{left:8%;animation-duration:11s;animation-delay:0s}.ember.e2{left:18%;animation-duration:14s;animation-delay:2s;width:4px;height:4px}.ember.e3{left:28%;animation-duration:9s;animation-delay:4s}.ember.e4{left:40%;animation-duration:12s;animation-delay:1s;width:8px;height:8px}.ember.e5{left:52%;animation-duration:16s;animation-delay:3s}.ember.e6{left:62%;animation-duration:10s;animation-delay:5s;width:5px;height:5px;background:radial-gradient(circle,rgba(180,235,255,.95),rgba(100,190,255,.45) 55%,transparent 75%);box-shadow:0 0 10px #96d7ff8c}.ember.e7{left:72%;animation-duration:13s;animation-delay:6s}.ember.e8{left:82%;animation-duration:11s;animation-delay:2.5s;width:4px;height:4px}.ember.e9{left:90%;animation-duration:15s;animation-delay:7s;width:6px;height:6px;background:radial-gradient(circle,rgba(175,255,210,.9),rgba(120,210,150,.4) 55%,transparent 75%);box-shadow:0 0 10px #96ebb480}.ember.e10{left:46%;animation-duration:17s;animation-delay:8s;width:3px;height:3px}@keyframes emberRise{0%{transform:translateZ(0) scale(.8);opacity:0}12%{opacity:.9}55%{transform:translate3d(20px,-60vh,0) scale(1.1);opacity:.95}90%{opacity:.4}to{transform:translate3d(-15px,-112vh,0) scale(.6);opacity:0}}.start-content{position:relative;z-index:2;text-align:center;width:min(620px,calc(100vw - 40px));max-height:94vh;overflow-y:auto;padding:34px 30px;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#08120ebd;border:1px solid rgba(214,245,219,.12);box-shadow:var(--shadow-lg);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);animation:startPanelIn .6s cubic-bezier(.22,1,.36,1) both}@keyframes startPanelIn{0%{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}.intro-kicker{font-family:var(--font-display);font-size:13px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#d2edd385;margin-bottom:14px}.game-title{font-family:var(--font-display);font-size:60px;font-weight:800;letter-spacing:.02em;background:linear-gradient(135deg,#f8eb98,#f4ba58,#f69a4f);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;text-shadow:none;filter:drop-shadow(0 0 18px rgba(247,182,90,.25));animation:titleGlow 4.5s ease-in-out infinite}@keyframes titleGlow{0%,to{filter:drop-shadow(0 0 12px rgba(247,182,90,.2));transform:translateY(0)}50%{filter:drop-shadow(0 0 22px rgba(247,182,90,.45));transform:translateY(-2px)}}.game-subtitle{font-size:16px;color:var(--text-muted);margin-bottom:22px}.start-chip-row{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:24px}.start-chip{min-width:110px;padding:12px 16px;border-radius:16px;border:1px solid rgba(214,245,219,.1);background:#ffffff0d;display:flex;flex-direction:column;gap:2px}.start-chip strong{font-family:var(--font-display);font-size:20px;color:#f8fbf8}.start-chip span{font-size:11px;color:var(--text-muted);letter-spacing:.08em;text-transform:uppercase}.difficulty-selector{margin:0 auto 22px;padding:16px;width:min(360px,100%);border-radius:20px;background:#ffffff0d;border:1px solid rgba(214,245,219,.1)}.difficulty-label{font-family:var(--font-display);font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#d2edd385;margin-bottom:12px}.difficulty-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}.diff-btn{padding:10px 14px;border-radius:999px;border:1px solid rgba(214,245,219,.12);background:#ffffff0f;color:var(--text-main);font-weight:700;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}.diff-btn:hover{transform:translateY(-1px);background:#ffffff1a}.diff-btn.active{border-color:#6fd9ff66;background:#6fd9ff24;box-shadow:0 0 18px #6fd9ff24}.difficulty-desc{font-size:13px;color:var(--text-muted)}.big-btn{padding:14px 40px;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;color:#fff;background:linear-gradient(135deg,var(--action-strong),var(--action));transition:all .25s;box-shadow:0 10px 28px #2e99d057;margin:6px}.big-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px #44aadd80}.big-btn.secondary{background:linear-gradient(135deg,#555,#777);box-shadow:0 4px 12px #0000004d}#end-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:#030806d1;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);display:flex;justify-content:center;align-items:center;z-index:100}.end-content{text-align:center;width:min(560px,calc(100vw - 40px));max-height:94vh;overflow-y:auto;padding:30px 28px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#08130fd6;border:1px solid var(--panel-stroke);box-shadow:var(--shadow-lg)}.end-kicker{font-family:var(--font-display);font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:#d2edd37a;margin-bottom:12px}#end-title{font-size:48px;font-weight:900;margin-bottom:16px}#end-score{font-size:22px;color:#ffffffb3;margin-bottom:12px}.rank{position:relative;display:inline-block;font-size:64px;font-weight:900;width:110px;height:110px;line-height:110px;border-radius:50%;margin-bottom:28px;animation:rankPop .85s cubic-bezier(.175,.885,.32,1.4) both,rankPulseRing 2.2s ease-out .8s infinite;box-shadow:0 0 0 4px #ffffff0d,0 12px 38px #0006}.rank:before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,rgba(255,255,255,.28) 40deg,transparent 80deg);animation:rankShine 2.6s linear infinite;pointer-events:none;mix-blend-mode:overlay}@keyframes rankPop{0%{opacity:0;transform:scale(.4) rotate(-20deg)}60%{opacity:1;transform:scale(1.12) rotate(4deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes rankShine{to{transform:rotate(360deg)}}@keyframes rankPulseRing{0%{box-shadow:0 0 #ffffff47,0 12px 38px #0006}70%{box-shadow:0 0 0 22px #fff0,0 12px 38px #0006}to{box-shadow:0 0 #fff0,0 12px 38px #0006}}.rank-S{background:linear-gradient(135deg,gold,#f80);color:#222}.rank-A{background:linear-gradient(135deg,#4ad,#26a);color:#fff}.rank-B{background:linear-gradient(135deg,#4c8,#285);color:#fff}.rank-C{background:linear-gradient(135deg,#888,#555);color:#fff}.end-actions{display:flex;gap:12px;justify-content:center}.end-stats{margin:22px 0 24px;padding:16px;border-radius:20px;background:#ffffff0d;border:1px solid rgba(214,245,219,.1);text-align:left}.stat-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)}.stat-row:last-child{border-bottom:none}.stat-label{color:var(--text-muted)}.stat-val{font-family:var(--font-display);font-weight:700;color:var(--text-main)}#milestone-banner{position:fixed;top:24%;left:50%;transform:translate(-50%,-50%);z-index:22;pointer-events:none;text-align:center}#milestone-banner-text{font-size:36px;font-weight:900;color:gold;text-shadow:0 0 30px rgba(255,200,0,.8),0 2px 8px rgba(0,0,0,.9);animation:milestoneAnim .7s ease-out;padding:12px 24px;background:#00000080;border:2px solid rgba(255,200,0,.5);border-radius:16px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}@keyframes milestoneAnim{0%{transform:scale(.4) translateY(20px);opacity:0}60%{transform:scale(1.1) translateY(-4px)}to{transform:scale(1) translateY(0);opacity:1}}#streak-banner{position:fixed;top:18%;left:50%;transform:translate(-50%,-50%);z-index:21;pointer-events:none;font-size:30px;font-weight:900;padding:10px 22px;border-radius:14px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:streakPop .5s ease-out}#streak-banner.streak-normal{color:#f80;text-shadow:0 0 20px rgba(255,130,0,.8),0 2px 6px rgba(0,0,0,.9);background:#00000080;border:1px solid rgba(255,130,0,.4)}#streak-banner.streak-mega{color:#fe0;text-shadow:0 0 25px rgba(255,230,0,.9),0 2px 8px rgba(0,0,0,.9);background:#0009;border:2px solid rgba(255,220,0,.6);box-shadow:0 0 30px #ffdc004d}@keyframes streakPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}60%{transform:translate(-50%,-50%) scale(1.12)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}#floating-text-layer{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:18;overflow:hidden}.floating-text{position:absolute;font-size:14px;font-weight:800;text-shadow:0 1px 4px rgba(0,0,0,.9);pointer-events:none;white-space:nowrap;animation:floatUp 1s ease-out forwards;transform:translate(-50%)}@keyframes floatUp{0%{opacity:1;transform:translate(-50%) translateY(0)}to{opacity:0;transform:translate(-50%) translateY(-40px)}}#help-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:15px;font-weight:700;color:#ffffffb3;cursor:pointer;transition:all .2s}#help-btn:hover{color:#fff;background:#ffffff1f}#help-overlay{position:fixed;top:0;right:0;bottom:0;left:0;background:#000000b3;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:center;z-index:80}#help-content{background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130ff0;border:1px solid var(--panel-stroke);border-radius:22px;box-shadow:var(--shadow-lg);padding:28px 36px;min-width:300px;text-align:center}.help-title{font-size:20px;font-weight:900;color:#fff;margin-bottom:20px}.help-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);gap:16px}.help-row:last-of-type{border-bottom:none}.help-key{font-size:13px;font-weight:700;color:gold;background:#ffc8001f;border:1px solid rgba(255,200,0,.3);border-radius:6px;padding:3px 10px;white-space:nowrap}.help-desc{font-size:13px;color:#ffffffbf;text-align:right}#help-close-btn{margin-top:20px;padding:10px 28px;background:linear-gradient(135deg,#26a,#4ad);border:none;border-radius:10px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#help-close-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px #4ad6}#reset-layout-btn{margin-top:20px;margin-right:10px;padding:10px 20px;background:#ffffff14;border:1px solid rgba(190,239,199,.25);border-radius:10px;font-size:14px;font-weight:700;color:#d9f2df;cursor:pointer;transition:all .2s}#reset-layout-btn:hover{background:#ffffff29;transform:translateY(-1px)}.draggable-panel{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}.ui-dragging{opacity:.92;cursor:grabbing;z-index:99!important;box-shadow:0 0 0 2px #78dcffd9,0 12px 34px #0000008c!important;transition:none!important}.hidden{display:none!important}#tower-tooltip{position:fixed;z-index:1000;background:#0a0f1ef2;border:1px solid #4ade80;border-radius:8px;padding:10px;color:#fff;pointer-events:none;box-shadow:0 4px 12px #00000080;font-size:14px;min-width:150px}#tower-tooltip .tooltip-name{font-weight:700;font-size:16px;color:#4ade80;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#tower-tooltip .tooltip-type{color:#aaa;font-size:12px;margin-bottom:6px;text-transform:capitalize}#tower-tooltip .tooltip-stats div{display:flex;justify-content:space-between;margin-top:2px}#tower-tooltip .tooltip-special{margin-top:6px;color:#fbbf24;font-size:12px;font-style:italic}#enemy-panel{position:absolute;top:60px;right:10px;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),#210e0ce0;border:1px solid rgba(255,116,99,.4);border-radius:14px;padding:12px;color:#fff;pointer-events:none;box-shadow:var(--shadow-lg);font-size:14px;min-width:168px;text-transform:capitalize}#enemy-panel .panel-header{font-weight:700;font-size:16px;color:#f44;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#enemy-panel .panel-stats div{display:flex;justify-content:space-between;margin-top:2px}@media(max-width:600px){.game-title{font-size:38px}.start-content{padding:26px 18px}.build-btn{padding:6px 7px;min-width:48px}.build-icon{font-size:16px}.build-name{font-size:9px}.build-cost{font-size:8px}#tower-panel{width:180px;right:8px;bottom:calc(170px + env(safe-area-inset-bottom,0px))}#wave-banner-text{font-size:18px;padding:10px 14px}#build-menu{left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));transform:none;max-width:none;padding:8px 8px 10px;gap:4px}.build-title,.build-subtitle{display:none}.build-grid{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;width:100%;padding:6px 2px 2px}.build-grid::-webkit-scrollbar{display:none}.build-btn{flex:0 0 auto}#skill-bar{left:8px;bottom:calc(100px + env(safe-area-inset-bottom,0px));gap:8px;padding:8px 10px}.skill-btn{width:48px;height:48px}}#wave-modifier{position:fixed;top:82px;right:12px;z-index:16;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:linear-gradient(90deg,#ff5a3c40,#ffb43c33);border:1px solid rgba(255,160,90,.4);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 0 20px #ff783c59,var(--shadow-lg);color:#fff2e0;font-family:var(--font-display);font-weight:700;letter-spacing:.08em;animation:modBadgeIn .5s cubic-bezier(.2,.9,.3,1),modBadgePulse 2.2s ease-in-out infinite .6s}#wave-modifier.hidden{display:none}#wave-modifier .mod-emoji{font-size:18px}#wave-modifier .mod-label{font-size:14px;text-shadow:0 0 10px rgba(255,120,60,.8)}#wave-modifier .mod-desc{font-size:11px;opacity:.82;font-weight:500;letter-spacing:.04em}@keyframes modBadgeIn{0%{transform:translate(40px) scale(.6);opacity:0}60%{transform:translate(-6px) scale(1.08);opacity:1}to{transform:translate(0) scale(1);opacity:1}}@keyframes modBadgePulse{0%,to{box-shadow:0 0 20px #ff783c59,var(--shadow-lg)}50%{box-shadow:0 0 32px #ffa05ab3,var(--shadow-lg)}}@media(max-width:600px){#wave-modifier{top:68px;right:8px;padding:5px 10px;gap:5px}#wave-modifier .mod-desc{display:none}#wave-modifier .mod-label{font-size:12px}}#next-wave-preview{position:fixed;right:12px;bottom:120px;z-index:15;padding:10px 14px;border-radius:12px;background:#0a1611bd;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(190,239,199,.12);box-shadow:var(--shadow-lg);color:#f7fbf7;font-family:var(--font-display);animation:previewIn .35s ease-out}#next-wave-preview.hidden{display:none}#next-wave-preview .preview-label{font-size:11px;font-weight:600;letter-spacing:.18em;color:#9ed4ad;text-transform:uppercase;margin-bottom:6px;text-align:center}#next-wave-preview .preview-icons{display:flex;gap:8px;align-items:center;justify-content:center}#next-wave-preview .preview-chip{display:inline-flex;align-items:center;gap:3px;padding:4px 8px;border-radius:8px;background:#ffffff0f;font-size:14px;font-weight:700}#next-wave-preview .preview-chip .ico{font-size:16px}#next-wave-preview .preview-chip .cnt{color:#cfe6d6;font-size:12px}@keyframes previewIn{0%{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@media(max-width:600px){#next-wave-preview{right:8px;bottom:calc(100px + env(safe-area-inset-bottom,0px));padding:6px 10px;font-size:12px}#next-wave-preview .preview-chip{padding:3px 6px;font-size:12px}}#boss-cinematic{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:90;animation:bossCinematicFade 2.4s ease-out forwards}#boss-cinematic.hidden{display:none}#boss-cinematic .boss-vignette{position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(ellipse at center,#ff1e1e00 30%,#b40a0a8c 90%,#3c0000d9);mix-blend-mode:multiply;animation:bossVignettePulse 2.4s ease-out forwards}#boss-cinematic .boss-banner{position:absolute;top:38%;left:50%;transform:translate(-50%,-50%) scale(.4);text-align:center;font-family:var(--font-display);color:#ffe1d0;text-shadow:0 0 18px rgba(255,60,40,.9),0 0 42px rgba(255,20,20,.55);animation:bossBannerIn 2.4s cubic-bezier(.2,.9,.3,1) forwards}#boss-cinematic .boss-sub{font-size:22px;font-weight:600;letter-spacing:.4em;color:#ffb080;margin-bottom:6px;opacity:.9}#boss-cinematic .boss-title{font-size:56px;font-weight:900;letter-spacing:.18em}@keyframes bossCinematicFade{0%{opacity:0}12%{opacity:1}75%{opacity:1}to{opacity:0}}@keyframes bossVignettePulse{0%{opacity:0}20%{opacity:1}50%{opacity:.85}80%{opacity:.7}to{opacity:0}}@keyframes bossBannerIn{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}18%{transform:translate(-50%,-50%) scale(1.12);opacity:1}28%{transform:translate(-50%,-50%) scale(1);opacity:1}80%{transform:translate(-50%,-50%) scale(1.02);opacity:1}to{transform:translate(-50%,-50%) scale(1.1);opacity:0}}@media(max-width:600px){#boss-cinematic .boss-title{font-size:36px;letter-spacing:.12em}#boss-cinematic .boss-sub{font-size:16px}}#buff-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:200;display:flex;align-items:center;justify-content:center;animation:buffFadeIn .35s ease both}#buff-modal.hidden{display:none}#buff-modal .buff-backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 50% 40%,#1e1432b3,#05050ceb);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}#buff-modal .buff-dialog{position:relative;min-width:520px;max-width:92vw;padding:28px 30px 32px;background:linear-gradient(145deg,#241c3af5,#120e20f5);border:1px solid rgba(255,210,110,.4);border-radius:18px;box-shadow:0 20px 60px #0000008c,0 0 80px #ffbe5026;text-align:center;animation:buffDialogIn .45s cubic-bezier(.34,1.56,.64,1) both}#buff-modal .buff-kicker{font-size:11px;letter-spacing:.24em;color:#ffd486;text-transform:uppercase;opacity:.85}#buff-modal .buff-title{font-size:30px;font-weight:800;letter-spacing:.04em;margin-top:4px;color:#fff3d9;text-shadow:0 0 22px rgba(255,200,100,.55)}#buff-modal .buff-sub{margin-top:6px;font-size:13px;color:#ffffffb3}#buff-modal .buff-cards{margin-top:22px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.buff-card{padding:18px 12px 16px;background:linear-gradient(160deg,#44346499,#20163899);border:1px solid rgba(255,255,255,.1);border-radius:14px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease;display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-family:inherit}.buff-card:hover{transform:translateY(-4px) scale(1.02);border-color:#ffdc78b3;background:linear-gradient(160deg,#604a8cb3,#302050b3);box-shadow:0 14px 28px #00000080,0 0 26px #ffc86440}.buff-card .card-emoji{font-size:36px;line-height:1;margin-bottom:4px}.buff-card .card-name{font-size:15px;font-weight:700;letter-spacing:.03em}.buff-card .card-desc{font-size:12px;opacity:.82;line-height:1.4}@keyframes buffFadeIn{0%{opacity:0}to{opacity:1}}@keyframes buffDialogIn{0%{transform:translateY(16px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}@media(max-width:600px){#buff-modal .buff-dialog{min-width:0;width:94vw;padding:22px 18px 24px}#buff-modal .buff-title{font-size:24px}#buff-modal .buff-cards{grid-template-columns:1fr;gap:10px}.buff-card .card-emoji{font-size:30px}}#achievement-toasts{position:fixed;top:90px;right:18px;z-index:220;display:flex;flex-direction:column;gap:10px;pointer-events:none}.ach-toast{min-width:240px;max-width:320px;padding:12px 14px;display:flex;gap:12px;align-items:center;background:linear-gradient(135deg,#36245af5,#1c1630f5);border:1px solid rgba(255,220,120,.55);border-radius:12px;box-shadow:0 10px 28px #00000073,0 0 26px #ffc86433;color:#fff3d9;font-family:inherit;animation:achIn .45s cubic-bezier(.34,1.56,.64,1) both,achOut .5s ease 3.6s forwards}.ach-toast .ach-emoji{font-size:32px;line-height:1;flex-shrink:0}.ach-toast .ach-body{display:flex;flex-direction:column;gap:2px;min-width:0}.ach-toast .ach-kicker{font-size:9px;letter-spacing:.22em;color:#ffd486;text-transform:uppercase;opacity:.9}.ach-toast .ach-name{font-size:14px;font-weight:700;letter-spacing:.03em}.ach-toast .ach-desc{font-size:11px;opacity:.82;line-height:1.35}@keyframes achIn{0%{transform:translate(120%);opacity:0}to{transform:translate(0);opacity:1}}@keyframes achOut{to{transform:translate(120%);opacity:0}}.high-score-row{margin-top:14px;padding:10px 16px;background:#ffffff0a;border:1px solid rgba(255,220,120,.22);border-radius:10px;display:inline-flex;gap:10px;align-items:baseline;font-size:13px;color:#ffffffd9}.high-score-row .hs-label{color:#ffd486;letter-spacing:.1em;text-transform:uppercase;font-size:10px}.high-score-row .hs-val{font-weight:800;font-size:18px;color:#fff3d9;text-shadow:0 0 12px rgba(255,200,100,.45)}.high-score-row .hs-sub{font-size:11px;opacity:.7}#end-best-badge{margin:6px auto 4px;display:inline-block;padding:4px 14px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;color:#0c0a1a;background:linear-gradient(135deg,#ffe18a,#ffc34a);border-radius:999px;box-shadow:0 0 22px #ffc85a99;animation:bestPulse 1.4s ease-in-out infinite}#end-best-badge.hidden{display:none}@keyframes bestPulse{0%,to{transform:scale(1);box-shadow:0 0 22px #ffc85a99}50%{transform:scale(1.06);box-shadow:0 0 34px #ffdc78e6}}@media(max-width:600px){#achievement-toasts{top:70px;right:10px}.ach-toast{min-width:0;max-width:78vw}}.endless-toggle{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:10px;align-items:center;margin:14px auto 0;padding:10px 16px;max-width:360px;background:#ffffff0a;border:1px solid rgba(140,200,255,.22);border-radius:10px;cursor:pointer;color:#ffffffd9;transition:background .18s,border-color .18s}.endless-toggle:hover{background:#8cc8ff14;border-color:#8cc8ff80}.endless-toggle input{position:absolute;opacity:0;pointer-events:none}.endless-toggle .endless-box{grid-row:1 / span 2;width:20px;height:20px;border:2px solid rgba(160,200,255,.6);border-radius:5px;display:inline-block;position:relative;transition:background .18s,border-color .18s}.endless-toggle input:checked~.endless-box{background:linear-gradient(135deg,#6dd1ff,#3a8bff);border-color:#9de1ff;box-shadow:0 0 10px #64b4ff8c}.endless-toggle input:checked~.endless-box:after{content:"✓";position:absolute;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;color:#0c1528;font-weight:900;font-size:14px}.endless-toggle .endless-text{font-size:14px;font-weight:700;letter-spacing:.04em;color:#d7ecff}.endless-toggle .endless-sub{grid-column:2;font-size:10px;opacity:.7;line-height:1.3}.link-btn{margin-top:12px;background:transparent;border:1px solid rgba(255,220,120,.35);color:#ffd486;padding:8px 16px;border-radius:8px;font-size:12px;letter-spacing:.08em;cursor:pointer;font-family:inherit;transition:background .18s,border-color .18s,color .18s}.link-btn:hover{background:#ffdc781a;border-color:#ffdc78b3;color:#fff3d9}#achievements-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:210;display:flex;align-items:center;justify-content:center;animation:buffFadeIn .3s ease both}#achievements-modal.hidden{display:none}#achievements-modal .ach-backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:#06060ecc;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}#achievements-modal .ach-dialog{position:relative;width:min(640px,92vw);max-height:80vh;overflow-y:auto;padding:22px 24px 24px;background:linear-gradient(145deg,#221c38f7,#120e20f7);border:1px solid rgba(255,220,120,.35);border-radius:16px;box-shadow:0 20px 60px #0000008c;color:#fff;animation:buffDialogIn .4s cubic-bezier(.34,1.56,.64,1) both}#achievements-modal .ach-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}#achievements-modal .ach-kick{font-size:10px;letter-spacing:.22em;color:#ffd486;text-transform:uppercase;opacity:.9}#achievements-modal .ach-ttl{font-size:22px;font-weight:800;letter-spacing:.03em}#achievements-modal #ach-count{font-size:13px;color:#ffdc78cc;margin-left:8px;font-weight:600}#achievements-modal #ach-close-btn{background:transparent;border:none;color:#fff9;font-size:18px;cursor:pointer;padding:4px 10px;border-radius:6px;transition:background .18s,color .18s}#achievements-modal #ach-close-btn:hover{background:#ffffff14;color:#fff}#achievements-modal .ach-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ach-row{display:flex;gap:12px;align-items:center;padding:12px 14px;background:#ffffff0a;border:1px solid rgba(255,255,255,.08);border-radius:10px;transition:background .18s,border-color .18s,filter .18s}.ach-row.locked{filter:grayscale(1) brightness(.7)}.ach-row.unlocked{background:linear-gradient(135deg,#785ab440,#3c327840);border-color:#ffdc7866}.ach-row .row-emoji{font-size:28px;line-height:1;flex-shrink:0}.ach-row .row-body{display:flex;flex-direction:column;gap:2px;min-width:0}.ach-row .row-name{font-size:13px;font-weight:700;letter-spacing:.03em}.ach-row .row-desc{font-size:11px;opacity:.75;line-height:1.35}@media(max-width:600px){#achievements-modal .ach-grid{grid-template-columns:1fr}}.lifetime-row{margin-top:10px;display:inline-flex;gap:8px;flex-wrap:wrap;justify-content:center}.lifetime-row .lt-chip{display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:6px 12px;background:#ffffff0a;border:1px solid rgba(255,255,255,.08);border-radius:8px;min-width:74px}.lifetime-row .lt-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#ffffff8c}.lifetime-row .lt-val{font-size:15px;font-weight:700;color:#fff3d9}#ach-reset-btn.reset-btn{margin-top:18px;width:100%;padding:10px 14px;background:transparent;border:1px solid rgba(255,100,100,.35);border-radius:8px;color:#ff9a9a;font-family:inherit;font-size:12px;letter-spacing:.08em;cursor:pointer;transition:background .18s,border-color .18s,color .18s}#ach-reset-btn.reset-btn:hover{background:#ff64641f;border-color:#ff6464b3;color:#ffc8c8}#ach-reset-btn.reset-btn.confirming{background:#ff646433;border-color:#ff8a8a;color:#fff}
/*$vite$:1*/`,document.head.appendChild(ii);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const un="170",Gi=0,cc=1,qh=2,Do=1,Yh=2,Nn=3,Fn=0,Ft=1,st=2,kn=0,Vi=1,ri=2,uc=3,dc=4,jh=5,Ti=100,$h=101,Kh=102,Zh=103,Jh=104,Qh=200,ef=201,tf=202,nf=203,Uo=204,No=205,rf=206,sf=207,of=208,af=209,lf=210,cf=211,uf=212,df=213,hf=214,Fo=0,ko=1,Oo=2,Wi=3,Bo=4,zo=5,Ho=6,Go=7,Vo=0,ff=1,pf=2,si=0,hc=1,mf=2,gf=3,fc=4,vf=5,xf=6,_f=7,pc="attached",yf="detached",mc=300,Xi=301,qi=302,Wo=303,Xo=304,ws=306,Yi=1e3,oi=1001,Ts=1002,kt=1003,gc=1004,Fr=1005,qt=1006,Es=1007,On=1008,Bn=1009,vc=1010,xc=1011,kr=1012,qo=1013,Ei=1014,dn=1015,zn=1016,Yo=1017,jo=1018,ji=1020,_c=35902,yc=1021,Sc=1022,Qt=1023,Mc=1024,bc=1025,$i=1026,Ki=1027,$o=1028,Ko=1029,wc=1030,Zo=1031,Jo=1033,As=33776,Rs=33777,Cs=33778,Ps=33779,Qo=35840,ea=35841,ta=35842,na=35843,ia=36196,ra=37492,sa=37496,oa=37808,aa=37809,la=37810,ca=37811,ua=37812,da=37813,ha=37814,fa=37815,pa=37816,ma=37817,ga=37818,va=37819,xa=37820,_a=37821,Ls=36492,ya=36494,Sa=36495,Tc=36283,Ma=36284,ba=36285,wa=36286,Or=2300,Br=2301,Ta=2302,Ec=2400,Ac=2401,Rc=2402,Sf=2500,Mf=0,Cc=1,Ea=2,bf=3200,wf=3201,Aa=0,Tf=1,ai="",Et="srgb",Ot="srgb-linear",Is="linear",rt="srgb",Zi=7680,Pc=519,Ef=512,Af=513,Rf=514,Lc=515,Cf=516,Pf=517,Lf=518,If=519,Ra=35044,Ic="300 es",Hn=2e3,Ds=2001;class Ji{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const Ct=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Dc=1234567;const zr=Math.PI/180,Qi=180/Math.PI;function hn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ct[i&255]+Ct[i>>8&255]+Ct[i>>16&255]+Ct[i>>24&255]+"-"+Ct[e&255]+Ct[e>>8&255]+"-"+Ct[e>>16&15|64]+Ct[e>>24&255]+"-"+Ct[t&63|128]+Ct[t>>8&255]+"-"+Ct[t>>16&255]+Ct[t>>24&255]+Ct[n&255]+Ct[n>>8&255]+Ct[n>>16&255]+Ct[n>>24&255]).toLowerCase()}function Pt(i,e,t){return Math.max(e,Math.min(t,i))}function Ca(i,e){return(i%e+e)%e}function Df(i,e,t,n,r){return n+(i-e)*(r-n)/(t-e)}function Uf(i,e,t){return i!==e?(t-i)/(e-i):0}function Hr(i,e,t){return(1-t)*i+t*e}function Nf(i,e,t,n){return Hr(i,e,1-Math.exp(-t*n))}function Ff(i,e=1){return e-Math.abs(Ca(i,e*2)-e)}function kf(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Of(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Bf(i,e){return i+Math.floor(Math.random()*(e-i+1))}function zf(i,e){return i+Math.random()*(e-i)}function Hf(i){return i*(.5-Math.random())}function Gf(i){i!==void 0&&(Dc=i);let e=Dc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Vf(i){return i*zr}function Wf(i){return i*Qi}function Xf(i){return(i&i-1)===0&&i!==0}function qf(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Yf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function jf(i,e,t,n,r){const s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+n)/2),u=o((e+n)/2),d=s((e-n)/2),h=o((e-n)/2),f=s((n-e)/2),g=o((n-e)/2);switch(r){case"XYX":i.set(a*u,l*d,l*h,a*c);break;case"YZY":i.set(l*h,a*u,l*d,a*c);break;case"ZXZ":i.set(l*d,l*h,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function fn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function tt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Pa={DEG2RAD:zr,RAD2DEG:Qi,generateUUID:hn,clamp:Pt,euclideanModulo:Ca,mapLinear:Df,inverseLerp:Uf,lerp:Hr,damp:Nf,pingpong:Ff,smoothstep:kf,smootherstep:Of,randInt:Bf,randFloat:zf,randFloatSpread:Hf,seededRandom:Gf,degToRad:Vf,radToDeg:Wf,isPowerOfTwo:Xf,ceilPowerOfTwo:qf,floorPowerOfTwo:Yf,setQuaternionFromProperEuler:jf,normalize:tt,denormalize:fn};class we{constructor(e=0,t=0){we.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Pt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*n-o*r+e.x,this.y=s*r+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ue{constructor(e,t,n,r,s,o,a,l,c){Ue.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c)}set(e,t,n,r,s,o,a,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],g=n[8],v=r[0],m=r[3],p=r[6],b=r[1],w=r[4],_=r[7],I=r[2],E=r[5],R=r[8];return s[0]=o*v+a*b+l*I,s[3]=o*m+a*w+l*E,s[6]=o*p+a*_+l*R,s[1]=c*v+u*b+d*I,s[4]=c*m+u*w+d*E,s[7]=c*p+u*_+d*R,s[2]=h*v+f*b+g*I,s[5]=h*m+f*w+g*E,s[8]=h*p+f*_+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8];return t*o*u-t*a*c-n*s*u+n*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=u*o-a*c,h=a*l-u*s,f=c*s-o*l,g=t*d+n*h+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=d*v,e[1]=(r*c-u*n)*v,e[2]=(a*n-r*o)*v,e[3]=h*v,e[4]=(u*t-r*l)*v,e[5]=(r*s-a*t)*v,e[6]=f*v,e[7]=(n*l-c*t)*v,e[8]=(o*t-n*s)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(La.makeScale(e,t)),this}rotate(e){return this.premultiply(La.makeRotation(-e)),this}translate(e,t){return this.premultiply(La.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const La=new Ue;function Uc(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Gr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function $f(){const i=Gr("canvas");return i.style.display="block",i}const Nc={};function Vr(i){i in Nc||(Nc[i]=!0,console.warn(i))}function Kf(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function Zf(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Jf(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const We={enabled:!0,workingColorSpace:Ot,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===rt&&(i.r=Gn(i.r),i.g=Gn(i.g),i.b=Gn(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===rt&&(i.r=er(i.r),i.g=er(i.g),i.b=er(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===ai?Is:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Gn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function er(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const Fc=[.64,.33,.3,.6,.15,.06],kc=[.2126,.7152,.0722],Oc=[.3127,.329],Bc=new Ue().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zc=new Ue().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);We.define({[Ot]:{primaries:Fc,whitePoint:Oc,transfer:Is,toXYZ:Bc,fromXYZ:zc,luminanceCoefficients:kc,workingColorSpaceConfig:{unpackColorSpace:Et},outputColorSpaceConfig:{drawingBufferColorSpace:Et}},[Et]:{primaries:Fc,whitePoint:Oc,transfer:rt,toXYZ:Bc,fromXYZ:zc,luminanceCoefficients:kc,outputColorSpaceConfig:{drawingBufferColorSpace:Et}}});let tr;class Qf{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{tr===void 0&&(tr=Gr("canvas")),tr.width=e.width,tr.height=e.height;const n=tr.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=tr}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Gr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Gn(s[o]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Gn(t[n]/255)*255):t[n]=Gn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let ep=0;class Hc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:ep++}),this.uuid=hn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(Ia(r[o].image)):s.push(Ia(r[o]))}else s=Ia(r);n.url=s}return t||(e.images[this.uuid]=n),n}}function Ia(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Qf.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let tp=0;class Mt extends Ji{constructor(e=Mt.DEFAULT_IMAGE,t=Mt.DEFAULT_MAPPING,n=oi,r=oi,s=qt,o=On,a=Qt,l=Bn,c=Mt.DEFAULT_ANISOTROPY,u=ai){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:tp++}),this.uuid=hn(),this.name="",this.source=new Hc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new we(0,0),this.repeat=new we(1,1),this.center=new we(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ue,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==mc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Yi:e.x=e.x-Math.floor(e.x);break;case oi:e.x=e.x<0?0:1;break;case Ts:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Yi:e.y=e.y-Math.floor(e.y);break;case oi:e.y=e.y<0?0:1;break;case Ts:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Mt.DEFAULT_IMAGE=null,Mt.DEFAULT_MAPPING=mc,Mt.DEFAULT_ANISOTROPY=1;class Je{constructor(e=0,t=0,n=0,r=1){Je.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*n+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s;const l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],g=l[9],v=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+v)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const w=(c+1)/2,_=(f+1)/2,I=(p+1)/2,E=(u+h)/4,R=(d+v)/4,D=(g+m)/4;return w>_&&w>I?w<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(w),r=E/n,s=R/n):_>I?_<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(_),n=E/r,s=D/r):I<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(I),n=R/s,r=D/s),this.set(n,r,s,t),this}let b=Math.sqrt((m-g)*(m-g)+(d-v)*(d-v)+(h-u)*(h-u));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(d-v)/b,this.z=(h-u)/b,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class np extends Ji{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Je(0,0,e,t),this.scissorTest=!1,this.viewport=new Je(0,0,e,t);const r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:qt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new Mt(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,r=e.textures.length;n<r;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Hc(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class pn extends np{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Gc extends Mt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=kt,this.minFilter=kt,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class ip extends Mt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=kt,this.minFilter=kt,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class li{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,o,a){let l=n[r+0],c=n[r+1],u=n[r+2],d=n[r+3];const h=s[o+0],f=s[o+1],g=s[o+2],v=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d;return}if(a===1){e[t+0]=h,e[t+1]=f,e[t+2]=g,e[t+3]=v;return}if(d!==v||l!==h||c!==f||u!==g){let m=1-a;const p=l*h+c*f+u*g+d*v,b=p>=0?1:-1,w=1-p*p;if(w>Number.EPSILON){const I=Math.sqrt(w),E=Math.atan2(I,p*b);m=Math.sin(m*E)/I,a=Math.sin(a*E)/I}const _=a*b;if(l=l*m+h*_,c=c*m+f*_,u=u*m+g*_,d=d*m+v*_,m===1-a){const I=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=I,c*=I,u*=I,d*=I}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,r,s,o){const a=n[r],l=n[r+1],c=n[r+2],u=n[r+3],d=s[o],h=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+u*d+l*f-c*h,e[t+1]=l*g+u*h+c*d-a*f,e[t+2]=c*g+u*f+a*h-l*d,e[t+3]=u*g-a*d-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(r/2),d=a(s/2),h=l(n/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"YXZ":this._x=h*u*d+c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"ZXY":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d-h*f*g;break;case"ZYX":this._x=h*u*d-c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d+h*f*g;break;case"YZX":this._x=h*u*d+c*f*g,this._y=c*f*d+h*u*g,this._z=c*u*g-h*f*d,this._w=c*u*d-h*f*g;break;case"XZY":this._x=h*u*d-c*f*g,this._y=c*f*d-h*u*g,this._z=c*u*g+h*f*d,this._w=c*u*d+h*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+a+d;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(n>a&&n>d){const f=2*Math.sqrt(1+n-a-d);this._w=(u-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>d){const f=2*Math.sqrt(1+a-n-d);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+d-n-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Pt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+o*a+r*c-s*l,this._y=r*u+o*l+s*a-n*c,this._z=s*u+o*c+n*l-r*a,this._w=o*u-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+n*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),d=Math.sin((1-t)*u)/c,h=Math.sin(t*u)/c;return this._w=o*d+this._w*h,this._x=n*d+this._x*h,this._y=r*d+this._y*h,this._z=s*d+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class A{constructor(e=0,t=0,n=0){A.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Vc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Vc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*n),u=2*(a*t-s*r),d=2*(s*n-o*t);return this.x=t+l*c+o*d-a*u,this.y=n+l*u+a*c-s*d,this.z=r+l*d+s*u-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Da.copy(this).projectOnVector(e),this.sub(Da)}reflect(e){return this.sub(Da.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Pt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Da=new A,Vc=new li;class en{constructor(e=new A(1/0,1/0,1/0),t=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(mn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(mn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=mn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,mn):mn.fromBufferAttribute(s,o),mn.applyMatrix4(e.matrixWorld),this.expandByPoint(mn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Us.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Us.copy(n.boundingBox)),Us.applyMatrix4(e.matrixWorld),this.union(Us)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,mn),mn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Wr),Ns.subVectors(this.max,Wr),nr.subVectors(e.a,Wr),ir.subVectors(e.b,Wr),rr.subVectors(e.c,Wr),ci.subVectors(ir,nr),ui.subVectors(rr,ir),Ai.subVectors(nr,rr);let t=[0,-ci.z,ci.y,0,-ui.z,ui.y,0,-Ai.z,Ai.y,ci.z,0,-ci.x,ui.z,0,-ui.x,Ai.z,0,-Ai.x,-ci.y,ci.x,0,-ui.y,ui.x,0,-Ai.y,Ai.x,0];return!Ua(t,nr,ir,rr,Ns)||(t=[1,0,0,0,1,0,0,0,1],!Ua(t,nr,ir,rr,Ns))?!1:(Fs.crossVectors(ci,ui),t=[Fs.x,Fs.y,Fs.z],Ua(t,nr,ir,rr,Ns))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,mn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(mn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Vn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Vn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Vn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Vn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Vn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Vn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Vn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Vn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Vn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Vn=[new A,new A,new A,new A,new A,new A,new A,new A],mn=new A,Us=new en,nr=new A,ir=new A,rr=new A,ci=new A,ui=new A,Ai=new A,Wr=new A,Ns=new A,Fs=new A,Ri=new A;function Ua(i,e,t,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){Ri.fromArray(i,s);const a=r.x*Math.abs(Ri.x)+r.y*Math.abs(Ri.y)+r.z*Math.abs(Ri.z),l=e.dot(Ri),c=t.dot(Ri),u=n.dot(Ri);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const rp=new en,Xr=new A,Na=new A;class An{constructor(e=new A,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):rp.setFromPoints(e).getCenter(n);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Xr.subVectors(e,this.center);const t=Xr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(Xr,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Na.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Xr.copy(e.center).add(Na)),this.expandByPoint(Xr.copy(e.center).sub(Na))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Wn=new A,Fa=new A,ks=new A,di=new A,ka=new A,Os=new A,Oa=new A;class qr{constructor(e=new A,t=new A(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Wn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Wn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Wn.copy(this.origin).addScaledVector(this.direction,t),Wn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Fa.copy(e).add(t).multiplyScalar(.5),ks.copy(t).sub(e).normalize(),di.copy(this.origin).sub(Fa);const s=e.distanceTo(t)*.5,o=-this.direction.dot(ks),a=di.dot(this.direction),l=-di.dot(ks),c=di.lengthSq(),u=Math.abs(1-o*o);let d,h,f,g;if(u>0)if(d=o*l-a,h=o*a-l,g=s*u,d>=0)if(h>=-g)if(h<=g){const v=1/u;d*=v,h*=v,f=d*(d+o*h+2*a)+h*(o*d+h+2*l)+c}else h=s,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h=-s,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-o*s+a)),h=d>0?-s:Math.min(Math.max(-s,-l),s),f=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-s,-l),s),f=h*(h+2*l)+c):(d=Math.max(0,-(o*s+a)),h=d>0?s:Math.min(Math.max(-s,-l),s),f=-d*d+h*(h+2*l)+c);else h=o>0?-s:s,d=Math.max(0,-(o*h+a)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(Fa).addScaledVector(ks,h),f}intersectSphere(e,t){Wn.subVectors(e.center,this.origin);const n=Wn.dot(this.direction),r=Wn.dot(Wn)-n*n,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,r=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,r=(e.min.x-h.x)*c),u>=0?(s=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(s=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),d>=0?(a=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(a=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Wn)!==null}intersectTriangle(e,t,n,r,s){ka.subVectors(t,e),Os.subVectors(n,e),Oa.crossVectors(ka,Os);let o=this.direction.dot(Oa),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;di.subVectors(this.origin,e);const l=a*this.direction.dot(Os.crossVectors(di,Os));if(l<0)return null;const c=a*this.direction.dot(ka.cross(di));if(c<0||l+c>o)return null;const u=-a*di.dot(Oa);return u<0?null:this.at(u/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ie{constructor(e,t,n,r,s,o,a,l,c,u,d,h,f,g,v,m){Ie.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,o,a,l,c,u,d,h,f,g,v,m)}set(e,t,n,r,s,o,a,l,c,u,d,h,f,g,v,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=r,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=d,p[14]=h,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ie().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,r=1/sr.setFromMatrixColumn(e,0).length(),s=1/sr.setFromMatrixColumn(e,1).length(),o=1/sr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,r=e.y,s=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){const h=o*u,f=o*d,g=a*u,v=a*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=f+g*c,t[5]=h-v*c,t[9]=-a*l,t[2]=v-h*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*u,f=l*d,g=c*u,v=c*d;t[0]=h+v*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=f*a-g,t[6]=v+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*u,f=l*d,g=c*u,v=c*d;t[0]=h-v*a,t[4]=-o*d,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*u,t[9]=v-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*u,f=o*d,g=a*u,v=a*d;t[0]=l*u,t[4]=g*c-f,t[8]=h*c+v,t[1]=l*d,t[5]=v*c+h,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,f=o*c,g=a*l,v=a*c;t[0]=l*u,t[4]=v-h*d,t[8]=g*d+f,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-c*u,t[6]=f*d+g,t[10]=h-v*d}else if(e.order==="XZY"){const h=o*l,f=o*c,g=a*l,v=a*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+v,t[5]=o*u,t[9]=f*d-g,t[2]=g*d-f,t[6]=a*u,t[10]=v*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(sp,e,op)}lookAt(e,t,n){const r=this.elements;return Yt.subVectors(e,t),Yt.lengthSq()===0&&(Yt.z=1),Yt.normalize(),hi.crossVectors(n,Yt),hi.lengthSq()===0&&(Math.abs(n.z)===1?Yt.x+=1e-4:Yt.z+=1e-4,Yt.normalize(),hi.crossVectors(n,Yt)),hi.normalize(),Bs.crossVectors(Yt,hi),r[0]=hi.x,r[4]=Bs.x,r[8]=Yt.x,r[1]=hi.y,r[5]=Bs.y,r[9]=Yt.y,r[2]=hi.z,r[6]=Bs.z,r[10]=Yt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,r=t.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],b=n[3],w=n[7],_=n[11],I=n[15],E=r[0],R=r[4],D=r[8],M=r[12],S=r[1],C=r[5],H=r[9],z=r[13],W=r[2],K=r[6],X=r[10],te=r[14],V=r[3],ae=r[7],fe=r[11],be=r[15];return s[0]=o*E+a*S+l*W+c*V,s[4]=o*R+a*C+l*K+c*ae,s[8]=o*D+a*H+l*X+c*fe,s[12]=o*M+a*z+l*te+c*be,s[1]=u*E+d*S+h*W+f*V,s[5]=u*R+d*C+h*K+f*ae,s[9]=u*D+d*H+h*X+f*fe,s[13]=u*M+d*z+h*te+f*be,s[2]=g*E+v*S+m*W+p*V,s[6]=g*R+v*C+m*K+p*ae,s[10]=g*D+v*H+m*X+p*fe,s[14]=g*M+v*z+m*te+p*be,s[3]=b*E+w*S+_*W+I*V,s[7]=b*R+w*C+_*K+I*ae,s[11]=b*D+w*H+_*X+I*fe,s[15]=b*M+w*z+_*te+I*be,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15];return g*(+s*l*d-r*c*d-s*a*h+n*c*h+r*a*f-n*l*f)+v*(+t*l*f-t*c*h+s*o*h-r*o*f+r*c*u-s*l*u)+m*(+t*c*d-t*a*f-s*o*d+n*o*f+s*a*u-n*c*u)+p*(-r*a*u-t*l*d+t*a*h+r*o*d-n*o*h+n*l*u)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],b=d*m*c-v*h*c+v*l*f-a*m*f-d*l*p+a*h*p,w=g*h*c-u*m*c-g*l*f+o*m*f+u*l*p-o*h*p,_=u*v*c-g*d*c+g*a*f-o*v*f-u*a*p+o*d*p,I=g*d*l-u*v*l-g*a*h+o*v*h+u*a*m-o*d*m,E=t*b+n*w+r*_+s*I;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/E;return e[0]=b*R,e[1]=(v*h*s-d*m*s-v*r*f+n*m*f+d*r*p-n*h*p)*R,e[2]=(a*m*s-v*l*s+v*r*c-n*m*c-a*r*p+n*l*p)*R,e[3]=(d*l*s-a*h*s-d*r*c+n*h*c+a*r*f-n*l*f)*R,e[4]=w*R,e[5]=(u*m*s-g*h*s+g*r*f-t*m*f-u*r*p+t*h*p)*R,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*p-t*l*p)*R,e[7]=(o*h*s-u*l*s+u*r*c-t*h*c-o*r*f+t*l*f)*R,e[8]=_*R,e[9]=(g*d*s-u*v*s-g*n*f+t*v*f+u*n*p-t*d*p)*R,e[10]=(o*v*s-g*a*s+g*n*c-t*v*c-o*n*p+t*a*p)*R,e[11]=(u*a*s-o*d*s-u*n*c+t*d*c+o*n*f-t*a*f)*R,e[12]=I*R,e[13]=(u*v*r-g*d*r+g*n*h-t*v*h-u*n*m+t*d*m)*R,e[14]=(g*a*r-o*v*r-g*n*l+t*v*l+o*n*m-t*a*m)*R,e[15]=(o*d*r-u*a*r+u*n*l-t*d*l-o*n*h+t*a*h)*R,this}scale(e){const t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),r=Math.sin(t),s=1-n,o=e.x,a=e.y,l=e.z,c=s*o,u=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,u*a+n,u*l-r*o,0,c*l-r*a,u*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,o){return this.set(1,n,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,u=o+o,d=a+a,h=s*c,f=s*u,g=s*d,v=o*u,m=o*d,p=a*d,b=l*c,w=l*u,_=l*d,I=n.x,E=n.y,R=n.z;return r[0]=(1-(v+p))*I,r[1]=(f+_)*I,r[2]=(g-w)*I,r[3]=0,r[4]=(f-_)*E,r[5]=(1-(h+p))*E,r[6]=(m+b)*E,r[7]=0,r[8]=(g+w)*R,r[9]=(m-b)*R,r[10]=(1-(h+v))*R,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){const r=this.elements;let s=sr.set(r[0],r[1],r[2]).length();const o=sr.set(r[4],r[5],r[6]).length(),a=sr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],gn.copy(this);const c=1/s,u=1/o,d=1/a;return gn.elements[0]*=c,gn.elements[1]*=c,gn.elements[2]*=c,gn.elements[4]*=u,gn.elements[5]*=u,gn.elements[6]*=u,gn.elements[8]*=d,gn.elements[9]*=d,gn.elements[10]*=d,t.setFromRotationMatrix(gn),n.x=s,n.y=o,n.z=a,this}makePerspective(e,t,n,r,s,o,a=Hn){const l=this.elements,c=2*s/(t-e),u=2*s/(n-r),d=(t+e)/(t-e),h=(n+r)/(n-r);let f,g;if(a===Hn)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===Ds)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,o,a=Hn){const l=this.elements,c=1/(t-e),u=1/(n-r),d=1/(o-s),h=(t+e)*c,f=(n+r)*u;let g,v;if(a===Hn)g=(o+s)*d,v=-2*d;else if(a===Ds)g=s*d,v=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-h,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=v,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const sr=new A,gn=new Ie,sp=new A(0,0,0),op=new A(1,1,1),hi=new A,Bs=new A,Yt=new A,Wc=new Ie,Xc=new li;class vn{constructor(e=0,t=0,n=0,r=vn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],u=r[9],d=r[2],h=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(Pt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Pt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,s),this._z=0);break;case"ZXY":this._x=Math.asin(Pt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Pt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Pt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Pt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Wc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Wc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xc.setFromEuler(this),this.setFromQuaternion(Xc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}vn.DEFAULT_ORDER="XYZ";class Ba{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let ap=0;const qc=new A,or=new li,Xn=new Ie,zs=new A,Yr=new A,lp=new A,cp=new li,Yc=new A(1,0,0),jc=new A(0,1,0),$c=new A(0,0,1),Kc={type:"added"},up={type:"removed"},ar={type:"childadded",child:null},za={type:"childremoved",child:null};class ut extends Ji{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ap++}),this.uuid=hn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ut.DEFAULT_UP.clone();const e=new A,t=new vn,n=new li,r=new A(1,1,1);function s(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ie},normalMatrix:{value:new Ue}}),this.matrix=new Ie,this.matrixWorld=new Ie,this.matrixAutoUpdate=ut.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ba,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return or.setFromAxisAngle(e,t),this.quaternion.multiply(or),this}rotateOnWorldAxis(e,t){return or.setFromAxisAngle(e,t),this.quaternion.premultiply(or),this}rotateX(e){return this.rotateOnAxis(Yc,e)}rotateY(e){return this.rotateOnAxis(jc,e)}rotateZ(e){return this.rotateOnAxis($c,e)}translateOnAxis(e,t){return qc.copy(e).applyQuaternion(this.quaternion),this.position.add(qc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Yc,e)}translateY(e){return this.translateOnAxis(jc,e)}translateZ(e){return this.translateOnAxis($c,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Xn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?zs.copy(e):zs.set(e,t,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Yr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Xn.lookAt(Yr,zs,this.up):Xn.lookAt(zs,Yr,this.up),this.quaternion.setFromRotationMatrix(Xn),r&&(Xn.extractRotation(r.matrixWorld),or.setFromRotationMatrix(Xn),this.quaternion.premultiply(or.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Kc),ar.child=e,this.dispatchEvent(ar),ar.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(up),za.child=e,this.dispatchEvent(za),za.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Xn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Xn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Xn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Kc),ar.child=e,this.dispatchEvent(ar),ar.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Yr,e,lp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Yr,cp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const d=l[c];s(e.shapes,d)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),u=o(e.images),d=o(e.shapes),h=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const r=e.children[n];this.add(r.clone())}return this}}ut.DEFAULT_UP=new A(0,1,0),ut.DEFAULT_MATRIX_AUTO_UPDATE=!0,ut.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const xn=new A,qn=new A,Ha=new A,Yn=new A,lr=new A,cr=new A,Zc=new A,Ga=new A,Va=new A,Wa=new A,Xa=new Je,qa=new Je,Ya=new Je;class _n{constructor(e=new A,t=new A,n=new A){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),xn.subVectors(e,t),r.cross(xn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){xn.subVectors(r,t),qn.subVectors(n,t),Ha.subVectors(e,t);const o=xn.dot(xn),a=xn.dot(qn),l=xn.dot(Ha),c=qn.dot(qn),u=qn.dot(Ha),d=o*c-a*a;if(d===0)return s.set(0,0,0),null;const h=1/d,f=(c*l-a*u)*h,g=(o*u-a*l)*h;return s.set(1-f-g,g,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Yn)===null?!1:Yn.x>=0&&Yn.y>=0&&Yn.x+Yn.y<=1}static getInterpolation(e,t,n,r,s,o,a,l){return this.getBarycoord(e,t,n,r,Yn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,Yn.x),l.addScaledVector(o,Yn.y),l.addScaledVector(a,Yn.z),l)}static getInterpolatedAttribute(e,t,n,r,s,o){return Xa.setScalar(0),qa.setScalar(0),Ya.setScalar(0),Xa.fromBufferAttribute(e,t),qa.fromBufferAttribute(e,n),Ya.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Xa,s.x),o.addScaledVector(qa,s.y),o.addScaledVector(Ya,s.z),o}static isFrontFacing(e,t,n,r){return xn.subVectors(n,t),qn.subVectors(e,t),xn.cross(qn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return xn.subVectors(this.c,this.b),qn.subVectors(this.a,this.b),xn.cross(qn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return _n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return _n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return _n.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return _n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return _n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,r=this.b,s=this.c;let o,a;lr.subVectors(r,n),cr.subVectors(s,n),Ga.subVectors(e,n);const l=lr.dot(Ga),c=cr.dot(Ga);if(l<=0&&c<=0)return t.copy(n);Va.subVectors(e,r);const u=lr.dot(Va),d=cr.dot(Va);if(u>=0&&d<=u)return t.copy(r);const h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return o=l/(l-u),t.copy(n).addScaledVector(lr,o);Wa.subVectors(e,s);const f=lr.dot(Wa),g=cr.dot(Wa);if(g>=0&&f<=g)return t.copy(s);const v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(cr,a);const m=u*g-f*d;if(m<=0&&d-u>=0&&f-g>=0)return Zc.subVectors(s,r),a=(d-u)/(d-u+(f-g)),t.copy(r).addScaledVector(Zc,a);const p=1/(m+v+h);return o=v*p,a=h*p,t.copy(n).addScaledVector(lr,o).addScaledVector(cr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Jc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},fi={h:0,s:0,l:0},Hs={h:0,s:0,l:0};function ja(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class se{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Et){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,We.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=We.workingColorSpace){return this.r=e,this.g=t,this.b=n,We.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=We.workingColorSpace){if(e=Ca(e,1),t=Pt(t,0,1),n=Pt(n,0,1),t===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+t):n+t-n*t,o=2*n-s;this.r=ja(o,s,e+1/3),this.g=ja(o,s,e),this.b=ja(o,s,e-1/3)}return We.toWorkingColorSpace(this,r),this}setStyle(e,t=Et){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Et){const n=Jc[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Gn(e.r),this.g=Gn(e.g),this.b=Gn(e.b),this}copyLinearToSRGB(e){return this.r=er(e.r),this.g=er(e.g),this.b=er(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Et){return We.fromWorkingColorSpace(Lt.copy(this),e),Math.round(Pt(Lt.r*255,0,255))*65536+Math.round(Pt(Lt.g*255,0,255))*256+Math.round(Pt(Lt.b*255,0,255))}getHexString(e=Et){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=We.workingColorSpace){We.fromWorkingColorSpace(Lt.copy(this),t);const n=Lt.r,r=Lt.g,s=Lt.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=u<=.5?d/(o+a):d/(2-o-a),o){case n:l=(r-s)/d+(r<s?6:0);break;case r:l=(s-n)/d+2;break;case s:l=(n-r)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=We.workingColorSpace){return We.fromWorkingColorSpace(Lt.copy(this),t),e.r=Lt.r,e.g=Lt.g,e.b=Lt.b,e}getStyle(e=Et){We.fromWorkingColorSpace(Lt.copy(this),e);const t=Lt.r,n=Lt.g,r=Lt.b;return e!==Et?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(fi),this.setHSL(fi.h+e,fi.s+t,fi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(fi),e.getHSL(Hs);const n=Hr(fi.h,Hs.h,t),r=Hr(fi.s,Hs.s,t),s=Hr(fi.l,Hs.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Lt=new se;se.NAMES=Jc;let dp=0;class yn extends Ji{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dp++}),this.uuid=hn(),this.name="",this.blending=Vi,this.side=Fn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Uo,this.blendDst=No,this.blendEquation=Ti,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new se(0,0,0),this.blendAlpha=0,this.depthFunc=Wi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Pc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zi,this.stencilZFail=Zi,this.stencilZPass=Zi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Vi&&(n.blending=this.blending),this.side!==Fn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Uo&&(n.blendSrc=this.blendSrc),this.blendDst!==No&&(n.blendDst=this.blendDst),this.blendEquation!==Ti&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Wi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Pc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Zi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Zi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Be extends yn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vn,this.combine=Vo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const _t=new A,Gs=new we;class gt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ra,this.updateRanges=[],this.gpuType=dn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Gs.fromBufferAttribute(this,t),Gs.applyMatrix3(e),this.setXY(t,Gs.x,Gs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix3(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyMatrix4(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.applyNormalMatrix(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_t.fromBufferAttribute(this,t),_t.transformDirection(e),this.setXYZ(t,_t.x,_t.y,_t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=fn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=fn(t,this.array)),t}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=fn(t,this.array)),t}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=fn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=fn(t,this.array)),t}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array),s=tt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ra&&(e.usage=this.usage),e}}class Qc extends gt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class eu extends gt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class pt extends gt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let hp=0;const tn=new Ie,$a=new ut,ur=new A,jt=new en,jr=new en,bt=new A;class At extends Ji{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hp++}),this.uuid=hn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Uc(e)?eu:Qc)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Ue().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return tn.makeRotationFromQuaternion(e),this.applyMatrix4(tn),this}rotateX(e){return tn.makeRotationX(e),this.applyMatrix4(tn),this}rotateY(e){return tn.makeRotationY(e),this.applyMatrix4(tn),this}rotateZ(e){return tn.makeRotationZ(e),this.applyMatrix4(tn),this}translate(e,t,n){return tn.makeTranslation(e,t,n),this.applyMatrix4(tn),this}scale(e,t,n){return tn.makeScale(e,t,n),this.applyMatrix4(tn),this}lookAt(e){return $a.lookAt(e),$a.updateMatrix(),this.applyMatrix4($a.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ur).negate(),this.translate(ur.x,ur.y,ur.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new pt(n,3))}else{for(let n=0,r=t.count;n<r;n++){const s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new en);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){const s=t[n];jt.setFromBufferAttribute(s),this.morphTargetsRelative?(bt.addVectors(this.boundingBox.min,jt.min),this.boundingBox.expandByPoint(bt),bt.addVectors(this.boundingBox.max,jt.max),this.boundingBox.expandByPoint(bt)):(this.boundingBox.expandByPoint(jt.min),this.boundingBox.expandByPoint(jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new An);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(e){const n=this.boundingSphere.center;if(jt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];jr.setFromBufferAttribute(a),this.morphTargetsRelative?(bt.addVectors(jt.min,jr.min),jt.expandByPoint(bt),bt.addVectors(jt.max,jr.max),jt.expandByPoint(bt)):(jt.expandByPoint(jr.min),jt.expandByPoint(jr.max))}jt.getCenter(n);let r=0;for(let s=0,o=e.count;s<o;s++)bt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(bt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)bt.fromBufferAttribute(a,c),l&&(ur.fromBufferAttribute(e,c),bt.add(ur)),r=Math.max(r,n.distanceToSquared(bt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new gt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let D=0;D<n.count;D++)a[D]=new A,l[D]=new A;const c=new A,u=new A,d=new A,h=new we,f=new we,g=new we,v=new A,m=new A;function p(D,M,S){c.fromBufferAttribute(n,D),u.fromBufferAttribute(n,M),d.fromBufferAttribute(n,S),h.fromBufferAttribute(s,D),f.fromBufferAttribute(s,M),g.fromBufferAttribute(s,S),u.sub(c),d.sub(c),f.sub(h),g.sub(h);const C=1/(f.x*g.y-g.x*f.y);isFinite(C)&&(v.copy(u).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(C),m.copy(d).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(C),a[D].add(v),a[M].add(v),a[S].add(v),l[D].add(m),l[M].add(m),l[S].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let D=0,M=b.length;D<M;++D){const S=b[D],C=S.start,H=S.count;for(let z=C,W=C+H;z<W;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const w=new A,_=new A,I=new A,E=new A;function R(D){I.fromBufferAttribute(r,D),E.copy(I);const M=a[D];w.copy(M),w.sub(I.multiplyScalar(I.dot(M))).normalize(),_.crossVectors(E,M);const C=_.dot(l[D])<0?-1:1;o.setXYZW(D,w.x,w.y,w.z,C)}for(let D=0,M=b.length;D<M;++D){const S=b[D],C=S.start,H=S.count;for(let z=C,W=C+H;z<W;z+=3)R(e.getX(z+0)),R(e.getX(z+1)),R(e.getX(z+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new gt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);const r=new A,s=new A,o=new A,a=new A,l=new A,c=new A,u=new A,d=new A;if(e)for(let h=0,f=e.count;h<f;h+=3){const g=e.getX(h+0),v=e.getX(h+1),m=e.getX(h+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)r.fromBufferAttribute(t,h+0),s.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)bt.fromBufferAttribute(e,t),bt.normalize(),e.setXYZ(t,bt.x,bt.y,bt.z)}toNonIndexed(){function e(a,l){const c=a.array,u=a.itemSize,d=a.normalized,h=new c.constructor(l.length*u);let f=0,g=0;for(let v=0,m=l.length;v<m;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*u;for(let p=0;p<u;p++)h[g++]=c[f++]}return new gt(h,u,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new At,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,n);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let u=0,d=c.length;u<d;u++){const h=c[u],f=e(h,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){const f=c[d];u.push(f.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(t))}const s=e.morphAttributes;for(const c in s){const u=[],d=s[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,u=o.length;c<u;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const tu=new Ie,Ci=new qr,Vs=new An,nu=new A,Ws=new A,Xs=new A,qs=new A,Ka=new A,Ys=new A,iu=new A,js=new A;class Re extends ut{constructor(e=new At,t=new Be){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){Ys.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=a[l],d=s[l];u!==0&&(Ka.fromBufferAttribute(d,e),o?Ys.addScaledVector(Ka,u):Ys.addScaledVector(Ka.sub(t),u))}t.add(Ys)}return t}raycast(e,t){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Vs.copy(n.boundingSphere),Vs.applyMatrix4(s),Ci.copy(e.ray).recast(e.near),!(Vs.containsPoint(Ci.origin)===!1&&(Ci.intersectSphere(Vs,nu)===null||Ci.origin.distanceToSquared(nu)>(e.far-e.near)**2))&&(tu.copy(s).invert(),Ci.copy(e.ray).applyMatrix4(tu),!(n.boundingBox!==null&&Ci.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ci)))}_computeIntersections(e,t,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,d=s.attributes.normal,h=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=h.length;g<v;g++){const m=h[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),w=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let _=b,I=w;_<I;_+=3){const E=a.getX(_),R=a.getX(_+1),D=a.getX(_+2);r=$s(this,p,e,n,c,u,d,E,R,D),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const b=a.getX(m),w=a.getX(m+1),_=a.getX(m+2);r=$s(this,o,e,n,c,u,d,b,w,_),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,v=h.length;g<v;g++){const m=h[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),w=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let _=b,I=w;_<I;_+=3){const E=_,R=_+1,D=_+2;r=$s(this,p,e,n,c,u,d,E,R,D),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){const b=m,w=m+1,_=m+2;r=$s(this,o,e,n,c,u,d,b,w,_),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function fp(i,e,t,n,r,s,o,a){let l;if(e.side===Ft?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,e.side===Fn,a),l===null)return null;js.copy(a),js.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(js);return c<t.near||c>t.far?null:{distance:c,point:js.clone(),object:i}}function $s(i,e,t,n,r,s,o,a,l,c){i.getVertexPosition(a,Ws),i.getVertexPosition(l,Xs),i.getVertexPosition(c,qs);const u=fp(i,e,t,n,Ws,Xs,qs,iu);if(u){const d=new A;_n.getBarycoord(iu,Ws,Xs,qs,d),r&&(u.uv=_n.getInterpolatedAttribute(r,a,l,c,d,new we)),s&&(u.uv1=_n.getInterpolatedAttribute(s,a,l,c,d,new we)),o&&(u.normal=_n.getInterpolatedAttribute(o,a,l,c,d,new A),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new A,materialIndex:0};_n.getNormal(Ws,Xs,qs,h.normal),u.face=h,u.barycoord=d}return u}class jn extends At{constructor(e=1,t=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],u=[],d=[];let h=0,f=0;g("z","y","x",-1,-1,n,t,e,o,s,0),g("z","y","x",1,-1,n,t,-e,o,s,1),g("x","z","y",1,1,e,n,t,r,o,2),g("x","z","y",1,-1,e,n,-t,r,o,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new pt(c,3)),this.setAttribute("normal",new pt(u,3)),this.setAttribute("uv",new pt(d,2));function g(v,m,p,b,w,_,I,E,R,D,M){const S=_/R,C=I/D,H=_/2,z=I/2,W=E/2,K=R+1,X=D+1;let te=0,V=0;const ae=new A;for(let fe=0;fe<X;fe++){const be=fe*C-z;for(let Ge=0;Ge<K;Ge++){const ot=Ge*S-H;ae[v]=ot*b,ae[m]=be*w,ae[p]=W,c.push(ae.x,ae.y,ae.z),ae[v]=0,ae[m]=0,ae[p]=E>0?1:-1,u.push(ae.x,ae.y,ae.z),d.push(Ge/R),d.push(1-fe/D),te+=1}}for(let fe=0;fe<D;fe++)for(let be=0;be<R;be++){const Ge=h+be+K*fe,ot=h+be+K*(fe+1),Y=h+(be+1)+K*(fe+1),ne=h+(be+1)+K*fe;l.push(Ge,ot,ne),l.push(ot,Y,ne),V+=6}a.addGroup(f,V,M),f+=V,h+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new jn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function dr(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function Bt(i){const e={};for(let t=0;t<i.length;t++){const n=dr(i[t]);for(const r in n)e[r]=n[r]}return e}function pp(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ru(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:We.workingColorSpace}const Ks={clone:dr,merge:Bt};var mp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,gp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class wt extends yn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=mp,this.fragmentShader=gp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=dr(e.uniforms),this.uniformsGroups=pp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class su extends ut{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ie,this.projectionMatrix=new Ie,this.projectionMatrixInverse=new Ie,this.coordinateSystem=Hn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const pi=new A,ou=new we,au=new we;class Ht extends su{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Qi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(zr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Qi*2*Math.atan(Math.tan(zr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){pi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(pi.x,pi.y).multiplyScalar(-e/pi.z),pi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(pi.x,pi.y).multiplyScalar(-e/pi.z)}getViewSize(e,t){return this.getViewBounds(e,ou,au),t.subVectors(au,ou)}setViewOffset(e,t,n,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(zr*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const hr=-90,fr=1;class vp extends ut{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Ht(hr,fr,e,t);r.layers=this.layers,this.add(r);const s=new Ht(hr,fr,e,t);s.layers=this.layers,this.add(s);const o=new Ht(hr,fr,e,t);o.layers=this.layers,this.add(o);const a=new Ht(hr,fr,e,t);a.layers=this.layers,this.add(a);const l=new Ht(hr,fr,e,t);l.layers=this.layers,this.add(l);const c=new Ht(hr,fr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===Hn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ds)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,o),e.setRenderTarget(n,2,r),e.render(t,a),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,c),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,r),e.render(t,u),e.setRenderTarget(d,h,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class lu extends Mt{constructor(e,t,n,r,s,o,a,l,c,u){e=e!==void 0?e:[],t=t!==void 0?t:Xi,super(e,t,n,r,s,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class xp extends pn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new lu(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:qt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new jn(5,5,5),s=new wt({name:"CubemapFromEquirect",uniforms:dr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ft,blending:kn});s.uniforms.tEquirect.value=t;const o=new Re(r,s),a=t.minFilter;return t.minFilter===On&&(t.minFilter=qt),new vp(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,r);e.setRenderTarget(s)}}const Za=new A,_p=new A,yp=new Ue;class mi{constructor(e=new A(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const r=Za.subVectors(n,t).cross(_p.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Za),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||yp.getNormalMatrix(e),r=this.coplanarPoint(Za).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Pi=new An,Zs=new A;class Ja{constructor(e=new mi,t=new mi,n=new mi,r=new mi,s=new mi,o=new mi){this.planes=[e,t,n,r,s,o]}set(e,t,n,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Hn){const n=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],u=r[5],d=r[6],h=r[7],f=r[8],g=r[9],v=r[10],m=r[11],p=r[12],b=r[13],w=r[14],_=r[15];if(n[0].setComponents(l-s,h-c,m-f,_-p).normalize(),n[1].setComponents(l+s,h+c,m+f,_+p).normalize(),n[2].setComponents(l+o,h+u,m+g,_+b).normalize(),n[3].setComponents(l-o,h-u,m-g,_-b).normalize(),n[4].setComponents(l-a,h-d,m-v,_-w).normalize(),t===Hn)n[5].setComponents(l+a,h+d,m+v,_+w).normalize();else if(t===Ds)n[5].setComponents(a,d,v,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Pi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Pi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Pi)}intersectsSprite(e){return Pi.center.set(0,0,0),Pi.radius=.7071067811865476,Pi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Pi)}intersectsSphere(e){const t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const r=t[n];if(Zs.x=r.normal.x>0?e.max.x:e.min.x,Zs.y=r.normal.y>0?e.max.y:e.min.y,Zs.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Zs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function cu(){let i=null,e=!1,t=null,n=null;function r(s,o){t(s,o),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function Sp(i){const e=new WeakMap;function t(a,l){const c=a.array,u=a.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){const u=l.array,d=l.updateRanges;if(i.bindBuffer(c,a),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,g)=>f.start-g.start);let h=0;for(let f=1;f<d.length;f++){const g=d[h],v=d[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++h,d[h]=v)}d.length=h+1;for(let f=0,g=d.length;f<g;f++){const v=d[f];i.bufferSubData(c,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class Sn extends At{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(n),l=Math.floor(r),c=a+1,u=l+1,d=e/a,h=t/l,f=[],g=[],v=[],m=[];for(let p=0;p<u;p++){const b=p*h-o;for(let w=0;w<c;w++){const _=w*d-s;g.push(_,-b,0),v.push(0,0,1),m.push(w/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<a;b++){const w=b+c*p,_=b+c*(p+1),I=b+1+c*(p+1),E=b+1+c*p;f.push(w,_,E),f.push(_,I,E)}this.setIndex(f),this.setAttribute("position",new pt(g,3)),this.setAttribute("normal",new pt(v,3)),this.setAttribute("uv",new pt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Sn(e.width,e.height,e.widthSegments,e.heightSegments)}}var Mp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,bp=`#ifdef USE_ALPHAHASH
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
#endif`,wp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Tp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ep=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ap=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rp=`#ifdef USE_AOMAP
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
#endif`,Cp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Pp=`#ifdef USE_BATCHING
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
#endif`,Lp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ip=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Dp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Up=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Np=`#ifdef USE_IRIDESCENCE
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
#endif`,Fp=`#ifdef USE_BUMPMAP
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
#endif`,kp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Op=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Bp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,zp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Hp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Gp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Vp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Wp=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Xp=`#define PI 3.141592653589793
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
} // validated`,qp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Yp=`vec3 transformedNormal = objectNormal;
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
#endif`,jp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,$p=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Kp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,em=`#ifdef USE_ENVMAP
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
#endif`,tm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,nm=`#ifdef USE_ENVMAP
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
#endif`,im=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,rm=`#ifdef USE_ENVMAP
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
#endif`,sm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,om=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,am=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,lm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cm=`#ifdef USE_GRADIENTMAP
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
}`,um=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,dm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,hm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,fm=`uniform bool receiveShadow;
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
#endif`,pm=`#ifdef USE_ENVMAP
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
#endif`,mm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,gm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,vm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,xm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,_m=`PhysicalMaterial material;
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
#endif`,ym=`struct PhysicalMaterial {
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
}`,Sm=`
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
#endif`,Mm=`#if defined( RE_IndirectDiffuse )
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
#endif`,bm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,wm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Tm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Em=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Am=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Cm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Pm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Lm=`#if defined( USE_POINTS_UV )
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
#endif`,Im=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Dm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Um=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Nm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Fm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,km=`#ifdef USE_MORPHTARGETS
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
#endif`,Om=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,zm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Hm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Wm=`#ifdef USE_NORMALMAP
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
#endif`,Xm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,qm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ym=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,jm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,$m=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Km=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Zm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,eg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,tg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ng=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ig=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,rg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,sg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,og=`float getShadowMask() {
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
}`,ag=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,lg=`#ifdef USE_SKINNING
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
#endif`,cg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ug=`#ifdef USE_SKINNING
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
#endif`,dg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,fg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,pg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,mg=`#ifdef USE_TRANSMISSION
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
#endif`,gg=`#ifdef USE_TRANSMISSION
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
#endif`,vg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_g=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,yg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const ke={alphahash_fragment:Mp,alphahash_pars_fragment:bp,alphamap_fragment:wp,alphamap_pars_fragment:Tp,alphatest_fragment:Ep,alphatest_pars_fragment:Ap,aomap_fragment:Rp,aomap_pars_fragment:Cp,batching_pars_vertex:Pp,batching_vertex:Lp,begin_vertex:Ip,beginnormal_vertex:Dp,bsdfs:Up,iridescence_fragment:Np,bumpmap_pars_fragment:Fp,clipping_planes_fragment:kp,clipping_planes_pars_fragment:Op,clipping_planes_pars_vertex:Bp,clipping_planes_vertex:zp,color_fragment:Hp,color_pars_fragment:Gp,color_pars_vertex:Vp,color_vertex:Wp,common:Xp,cube_uv_reflection_fragment:qp,defaultnormal_vertex:Yp,displacementmap_pars_vertex:jp,displacementmap_vertex:$p,emissivemap_fragment:Kp,emissivemap_pars_fragment:Zp,colorspace_fragment:Jp,colorspace_pars_fragment:Qp,envmap_fragment:em,envmap_common_pars_fragment:tm,envmap_pars_fragment:nm,envmap_pars_vertex:im,envmap_physical_pars_fragment:pm,envmap_vertex:rm,fog_vertex:sm,fog_pars_vertex:om,fog_fragment:am,fog_pars_fragment:lm,gradientmap_pars_fragment:cm,lightmap_pars_fragment:um,lights_lambert_fragment:dm,lights_lambert_pars_fragment:hm,lights_pars_begin:fm,lights_toon_fragment:mm,lights_toon_pars_fragment:gm,lights_phong_fragment:vm,lights_phong_pars_fragment:xm,lights_physical_fragment:_m,lights_physical_pars_fragment:ym,lights_fragment_begin:Sm,lights_fragment_maps:Mm,lights_fragment_end:bm,logdepthbuf_fragment:wm,logdepthbuf_pars_fragment:Tm,logdepthbuf_pars_vertex:Em,logdepthbuf_vertex:Am,map_fragment:Rm,map_pars_fragment:Cm,map_particle_fragment:Pm,map_particle_pars_fragment:Lm,metalnessmap_fragment:Im,metalnessmap_pars_fragment:Dm,morphinstance_vertex:Um,morphcolor_vertex:Nm,morphnormal_vertex:Fm,morphtarget_pars_vertex:km,morphtarget_vertex:Om,normal_fragment_begin:Bm,normal_fragment_maps:zm,normal_pars_fragment:Hm,normal_pars_vertex:Gm,normal_vertex:Vm,normalmap_pars_fragment:Wm,clearcoat_normal_fragment_begin:Xm,clearcoat_normal_fragment_maps:qm,clearcoat_pars_fragment:Ym,iridescence_pars_fragment:jm,opaque_fragment:$m,packing:Km,premultiplied_alpha_fragment:Zm,project_vertex:Jm,dithering_fragment:Qm,dithering_pars_fragment:eg,roughnessmap_fragment:tg,roughnessmap_pars_fragment:ng,shadowmap_pars_fragment:ig,shadowmap_pars_vertex:rg,shadowmap_vertex:sg,shadowmask_pars_fragment:og,skinbase_vertex:ag,skinning_pars_vertex:lg,skinning_vertex:cg,skinnormal_vertex:ug,specularmap_fragment:dg,specularmap_pars_fragment:hg,tonemapping_fragment:fg,tonemapping_pars_fragment:pg,transmission_fragment:mg,transmission_pars_fragment:gg,uv_pars_fragment:vg,uv_pars_vertex:xg,uv_vertex:_g,worldpos_vertex:yg,background_vert:`varying vec2 vUv;
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
}`},re={common:{diffuse:{value:new se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ue}},envmap:{envMap:{value:null},envMapRotation:{value:new Ue},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ue}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ue}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ue},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ue},normalScale:{value:new we(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ue},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ue}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ue}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ue}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0},uvTransform:{value:new Ue}},sprite:{diffuse:{value:new se(16777215)},opacity:{value:1},center:{value:new we(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}}},Rn={basic:{uniforms:Bt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:ke.meshbasic_vert,fragmentShader:ke.meshbasic_frag},lambert:{uniforms:Bt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new se(0)}}]),vertexShader:ke.meshlambert_vert,fragmentShader:ke.meshlambert_frag},phong:{uniforms:Bt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new se(0)},specular:{value:new se(1118481)},shininess:{value:30}}]),vertexShader:ke.meshphong_vert,fragmentShader:ke.meshphong_frag},standard:{uniforms:Bt([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag},toon:{uniforms:Bt([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new se(0)}}]),vertexShader:ke.meshtoon_vert,fragmentShader:ke.meshtoon_frag},matcap:{uniforms:Bt([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:ke.meshmatcap_vert,fragmentShader:ke.meshmatcap_frag},points:{uniforms:Bt([re.points,re.fog]),vertexShader:ke.points_vert,fragmentShader:ke.points_frag},dashed:{uniforms:Bt([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ke.linedashed_vert,fragmentShader:ke.linedashed_frag},depth:{uniforms:Bt([re.common,re.displacementmap]),vertexShader:ke.depth_vert,fragmentShader:ke.depth_frag},normal:{uniforms:Bt([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:ke.meshnormal_vert,fragmentShader:ke.meshnormal_frag},sprite:{uniforms:Bt([re.sprite,re.fog]),vertexShader:ke.sprite_vert,fragmentShader:ke.sprite_frag},background:{uniforms:{uvTransform:{value:new Ue},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ke.background_vert,fragmentShader:ke.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ue}},vertexShader:ke.backgroundCube_vert,fragmentShader:ke.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ke.cube_vert,fragmentShader:ke.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ke.equirect_vert,fragmentShader:ke.equirect_frag},distanceRGBA:{uniforms:Bt([re.common,re.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ke.distanceRGBA_vert,fragmentShader:ke.distanceRGBA_frag},shadow:{uniforms:Bt([re.lights,re.fog,{color:{value:new se(0)},opacity:{value:1}}]),vertexShader:ke.shadow_vert,fragmentShader:ke.shadow_frag}};Rn.physical={uniforms:Bt([Rn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ue},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ue},clearcoatNormalScale:{value:new we(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ue},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ue},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ue},sheen:{value:0},sheenColor:{value:new se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ue},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ue},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ue},transmissionSamplerSize:{value:new we},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ue},attenuationDistance:{value:0},attenuationColor:{value:new se(0)},specularColor:{value:new se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ue},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ue},anisotropyVector:{value:new we},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ue}}]),vertexShader:ke.meshphysical_vert,fragmentShader:ke.meshphysical_frag};const Js={r:0,b:0,g:0},Li=new vn,Sg=new Ie;function Mg(i,e,t,n,r,s,o){const a=new se(0);let l=s===!0?0:1,c,u,d=null,h=0,f=null;function g(b){let w=b.isScene===!0?b.background:null;return w&&w.isTexture&&(w=(b.backgroundBlurriness>0?t:e).get(w)),w}function v(b){let w=!1;const _=g(b);_===null?p(a,l):_&&_.isColor&&(p(_,1),w=!0);const I=i.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,o):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||w)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(b,w){const _=g(w);_&&(_.isCubeTexture||_.mapping===ws)?(u===void 0&&(u=new Re(new jn(1,1,1),new wt({name:"BackgroundCubeMaterial",uniforms:dr(Rn.backgroundCube.uniforms),vertexShader:Rn.backgroundCube.vertexShader,fragmentShader:Rn.backgroundCube.fragmentShader,side:Ft,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(I,E,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),Li.copy(w.backgroundRotation),Li.x*=-1,Li.y*=-1,Li.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(Li.y*=-1,Li.z*=-1),u.material.uniforms.envMap.value=_,u.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Sg.makeRotationFromEuler(Li)),u.material.toneMapped=We.getTransfer(_.colorSpace)!==rt,(d!==_||h!==_.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,d=_,h=_.version,f=i.toneMapping),u.layers.enableAll(),b.unshift(u,u.geometry,u.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new Re(new Sn(2,2),new wt({name:"BackgroundMaterial",uniforms:dr(Rn.background.uniforms),vertexShader:Rn.background.vertexShader,fragmentShader:Rn.background.fragmentShader,side:Fn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.toneMapped=We.getTransfer(_.colorSpace)!==rt,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(d!==_||h!==_.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,d=_,h=_.version,f=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function p(b,w){b.getRGB(Js,ru(i)),n.buffers.color.setClear(Js.r,Js.g,Js.b,w,o)}return{getClearColor:function(){return a},setClearColor:function(b,w=1){a.set(b),l=w,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,p(a,l)},render:v,addToRenderList:m}}function bg(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=h(null);let s=r,o=!1;function a(S,C,H,z,W){let K=!1;const X=d(z,H,C);s!==X&&(s=X,c(s.object)),K=f(S,z,H,W),K&&g(S,z,H,W),W!==null&&e.update(W,i.ELEMENT_ARRAY_BUFFER),(K||o)&&(o=!1,_(S,C,H,z),W!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return i.createVertexArray()}function c(S){return i.bindVertexArray(S)}function u(S){return i.deleteVertexArray(S)}function d(S,C,H){const z=H.wireframe===!0;let W=n[S.id];W===void 0&&(W={},n[S.id]=W);let K=W[C.id];K===void 0&&(K={},W[C.id]=K);let X=K[z];return X===void 0&&(X=h(l()),K[z]=X),X}function h(S){const C=[],H=[],z=[];for(let W=0;W<t;W++)C[W]=0,H[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:H,attributeDivisors:z,object:S,attributes:{},index:null}}function f(S,C,H,z){const W=s.attributes,K=C.attributes;let X=0;const te=H.getAttributes();for(const V in te)if(te[V].location>=0){const fe=W[V];let be=K[V];if(be===void 0&&(V==="instanceMatrix"&&S.instanceMatrix&&(be=S.instanceMatrix),V==="instanceColor"&&S.instanceColor&&(be=S.instanceColor)),fe===void 0||fe.attribute!==be||be&&fe.data!==be.data)return!0;X++}return s.attributesNum!==X||s.index!==z}function g(S,C,H,z){const W={},K=C.attributes;let X=0;const te=H.getAttributes();for(const V in te)if(te[V].location>=0){let fe=K[V];fe===void 0&&(V==="instanceMatrix"&&S.instanceMatrix&&(fe=S.instanceMatrix),V==="instanceColor"&&S.instanceColor&&(fe=S.instanceColor));const be={};be.attribute=fe,fe&&fe.data&&(be.data=fe.data),W[V]=be,X++}s.attributes=W,s.attributesNum=X,s.index=z}function v(){const S=s.newAttributes;for(let C=0,H=S.length;C<H;C++)S[C]=0}function m(S){p(S,0)}function p(S,C){const H=s.newAttributes,z=s.enabledAttributes,W=s.attributeDivisors;H[S]=1,z[S]===0&&(i.enableVertexAttribArray(S),z[S]=1),W[S]!==C&&(i.vertexAttribDivisor(S,C),W[S]=C)}function b(){const S=s.newAttributes,C=s.enabledAttributes;for(let H=0,z=C.length;H<z;H++)C[H]!==S[H]&&(i.disableVertexAttribArray(H),C[H]=0)}function w(S,C,H,z,W,K,X){X===!0?i.vertexAttribIPointer(S,C,H,W,K):i.vertexAttribPointer(S,C,H,z,W,K)}function _(S,C,H,z){v();const W=z.attributes,K=H.getAttributes(),X=C.defaultAttributeValues;for(const te in K){const V=K[te];if(V.location>=0){let ae=W[te];if(ae===void 0&&(te==="instanceMatrix"&&S.instanceMatrix&&(ae=S.instanceMatrix),te==="instanceColor"&&S.instanceColor&&(ae=S.instanceColor)),ae!==void 0){const fe=ae.normalized,be=ae.itemSize,Ge=e.get(ae);if(Ge===void 0)continue;const ot=Ge.buffer,Y=Ge.type,ne=Ge.bytesPerElement,ye=Y===i.INT||Y===i.UNSIGNED_INT||ae.gpuType===qo;if(ae.isInterleavedBufferAttribute){const le=ae.data,Ce=le.stride,De=ae.offset;if(le.isInstancedInterleavedBuffer){for(let Ve=0;Ve<V.locationSize;Ve++)p(V.location+Ve,le.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let Ve=0;Ve<V.locationSize;Ve++)m(V.location+Ve);i.bindBuffer(i.ARRAY_BUFFER,ot);for(let Ve=0;Ve<V.locationSize;Ve++)w(V.location+Ve,be/V.locationSize,Y,fe,Ce*ne,(De+be/V.locationSize*Ve)*ne,ye)}else{if(ae.isInstancedBufferAttribute){for(let le=0;le<V.locationSize;le++)p(V.location+le,ae.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let le=0;le<V.locationSize;le++)m(V.location+le);i.bindBuffer(i.ARRAY_BUFFER,ot);for(let le=0;le<V.locationSize;le++)w(V.location+le,be/V.locationSize,Y,fe,be*ne,be/V.locationSize*le*ne,ye)}}else if(X!==void 0){const fe=X[te];if(fe!==void 0)switch(fe.length){case 2:i.vertexAttrib2fv(V.location,fe);break;case 3:i.vertexAttrib3fv(V.location,fe);break;case 4:i.vertexAttrib4fv(V.location,fe);break;default:i.vertexAttrib1fv(V.location,fe)}}}}b()}function I(){D();for(const S in n){const C=n[S];for(const H in C){const z=C[H];for(const W in z)u(z[W].object),delete z[W];delete C[H]}delete n[S]}}function E(S){if(n[S.id]===void 0)return;const C=n[S.id];for(const H in C){const z=C[H];for(const W in z)u(z[W].object),delete z[W];delete C[H]}delete n[S.id]}function R(S){for(const C in n){const H=n[C];if(H[S.id]===void 0)continue;const z=H[S.id];for(const W in z)u(z[W].object),delete z[W];delete H[S.id]}}function D(){M(),o=!0,s!==r&&(s=r,c(s.object))}function M(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:D,resetDefaultState:M,dispose:I,releaseStatesOfGeometry:E,releaseStatesOfProgram:R,initAttributes:v,enableAttribute:m,disableUnusedAttributes:b}}function wg(i,e,t){let n;function r(c){n=c}function s(c,u){i.drawArrays(n,c,u),t.update(u,n,1)}function o(c,u,d){d!==0&&(i.drawArraysInstanced(n,c,u,d),t.update(u,n,d))}function a(c,u,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,d);let f=0;for(let g=0;g<d;g++)f+=u[g];t.update(f,n,1)}function l(c,u,d,h){if(d===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],h[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,h,0,d);let g=0;for(let v=0;v<d;v++)g+=u[v]*h[v];t.update(g,n,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Tg(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(R){return!(R!==Qt&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const D=R===zn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Bn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==dn&&!D)}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const d=t.logarithmicDepthBuffer===!0,h=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),_=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),I=g>0,E=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reverseDepthBuffer:h,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:w,maxFragmentUniforms:_,vertexTextures:I,maxSamples:E}}function Eg(i){const e=this;let t=null,n=0,r=!1,s=!1;const o=new mi,a=new Ue,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){const f=d.length!==0||h||n!==0||r;return r=h,n=d.length,f},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,f){const g=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!r||g===null||g.length===0||s&&!m)s?u(null):c();else{const b=s?0:n,w=b*4;let _=p.clippingState||null;l.value=_,_=u(g,h,w,f);for(let I=0;I!==w;++I)_[I]=t[I];p.clippingState=_,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,f,g){const v=d!==null?d.length:0;let m=null;if(v!==0){if(m=l.value,g!==!0||m===null){const p=f+v*4,b=h.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let w=0,_=f;w!==v;++w,_+=4)o.copy(d[w]).applyMatrix4(b,a),o.normal.toArray(m,_),m[_+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}function Ag(i){let e=new WeakMap;function t(o,a){return a===Wo?o.mapping=Xi:a===Xo&&(o.mapping=qi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Wo||a===Xo)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new xp(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}class $r extends su{constructor(e=-1,t=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-e,o=n+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const pr=4,uu=[.125,.215,.35,.446,.526,.582],Ii=20,Qa=new $r,du=new se;let el=null,tl=0,nl=0,il=!1;const Di=(1+Math.sqrt(5))/2,mr=1/Di,hu=[new A(-Di,mr,0),new A(Di,mr,0),new A(-mr,0,Di),new A(mr,0,Di),new A(0,Di,-mr),new A(0,Di,mr),new A(-1,1,-1),new A(1,1,-1),new A(-1,1,1),new A(1,1,1)];class fu{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){el=this._renderer.getRenderTarget(),tl=this._renderer.getActiveCubeFace(),nl=this._renderer.getActiveMipmapLevel(),il=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=mu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(el,tl,nl),this._renderer.xr.enabled=il,e.scissorTest=!1,Qs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Xi||e.mapping===qi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),el=this._renderer.getRenderTarget(),tl=this._renderer.getActiveCubeFace(),nl=this._renderer.getActiveMipmapLevel(),il=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:qt,minFilter:qt,generateMipmaps:!1,type:zn,format:Qt,colorSpace:Ot,depthBuffer:!1},r=pu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=pu(e,t,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Rg(s)),this._blurMaterial=Cg(s,e,t)}return r}_compileMaterial(e){const t=new Re(this._lodPlanes[0],e);this._renderer.compile(t,Qa)}_sceneToCubeUV(e,t,n,r){const a=new Ht(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,h=u.toneMapping;u.getClearColor(du),u.toneMapping=si,u.autoClear=!1;const f=new Be({name:"PMREM.Background",side:Ft,depthWrite:!1,depthTest:!1}),g=new Re(new jn,f);let v=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,v=!0):(f.color.copy(du),v=!0);for(let p=0;p<6;p++){const b=p%3;b===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):b===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));const w=this._cubeSize;Qs(r,b*w,p>2?w:0,w,w),u.setRenderTarget(r),v&&u.render(g,a),u.render(e,a)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=h,u.autoClear=d,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,r=e.mapping===Xi||e.mapping===qi;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=gu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=mu());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new Re(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Qs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Qa)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=hu[(r-s-1)%hu.length];this._blur(e,s-1,s,o,a)}t.autoClear=n}_blur(e,t,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,r,"latitudinal",s),this._halfBlur(o,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,d=new Re(this._lodPlanes[r],c),h=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Ii-1),v=s/g,m=isFinite(s)?1+Math.floor(u*v):Ii;m>Ii&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ii}`);const p=[];let b=0;for(let R=0;R<Ii;++R){const D=R/v,M=Math.exp(-D*D/2);p.push(M),R===0?b+=M:R<m&&(b+=2*M)}for(let R=0;R<p.length;R++)p[R]=p[R]/b;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:w}=this;h.dTheta.value=g,h.mipInt.value=w-n;const _=this._sizeLods[r],I=3*_*(r>w-pr?r-w+pr:0),E=4*(this._cubeSize-_);Qs(t,I,E,3*_,2*_),l.setRenderTarget(t),l.render(d,Qa)}}function Rg(i){const e=[],t=[],n=[];let r=i;const s=i-pr+1+uu.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>i-pr?l=uu[o-i+pr-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,d=1+c,h=[u,u,d,u,d,d,u,u,d,d,u,d],f=6,g=6,v=3,m=2,p=1,b=new Float32Array(v*g*f),w=new Float32Array(m*g*f),_=new Float32Array(p*g*f);for(let E=0;E<f;E++){const R=E%3*2/3-1,D=E>2?0:-1,M=[R,D,0,R+2/3,D,0,R+2/3,D+1,0,R,D,0,R+2/3,D+1,0,R,D+1,0];b.set(M,v*g*E),w.set(h,m*g*E);const S=[E,E,E,E,E,E];_.set(S,p*g*E)}const I=new At;I.setAttribute("position",new gt(b,v)),I.setAttribute("uv",new gt(w,m)),I.setAttribute("faceIndex",new gt(_,p)),e.push(I),r>pr&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function pu(i,e,t){const n=new pn(i,e,t);return n.texture.mapping=ws,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Qs(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function Cg(i,e,t){const n=new Float32Array(Ii),r=new A(0,1,0);return new wt({name:"SphericalGaussianBlur",defines:{n:Ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:rl(),fragmentShader:`

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
		`,blending:kn,depthTest:!1,depthWrite:!1})}function mu(){return new wt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:rl(),fragmentShader:`

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
		`,blending:kn,depthTest:!1,depthWrite:!1})}function gu(){return new wt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:rl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function rl(){return`

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
	`}function Pg(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Wo||l===Xo,u=l===Xi||l===qi;if(c||u){let d=e.get(a);const h=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new fu(i)),d=c?t.fromEquirectangular(a,d):t.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),d.texture;if(d!==void 0)return d.texture;{const f=a.image;return c&&f&&f.height>0||u&&f&&r(f)?(t===null&&(t=new fu(i)),d=c?t.fromEquirectangular(a):t.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),a.addEventListener("dispose",s),d.texture):null}}}return a}function r(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Lg(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const r=t(n);return r===null&&Vr("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function Ig(i,e,t,n){const r={},s=new WeakMap;function o(d){const h=d.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);for(const g in h.morphAttributes){const v=h.morphAttributes[g];for(let m=0,p=v.length;m<p;m++)e.remove(v[m])}h.removeEventListener("dispose",o),delete r[h.id];const f=s.get(h);f&&(e.remove(f),s.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(d,h){return r[h.id]===!0||(h.addEventListener("dispose",o),r[h.id]=!0,t.memory.geometries++),h}function l(d){const h=d.attributes;for(const g in h)e.update(h[g],i.ARRAY_BUFFER);const f=d.morphAttributes;for(const g in f){const v=f[g];for(let m=0,p=v.length;m<p;m++)e.update(v[m],i.ARRAY_BUFFER)}}function c(d){const h=[],f=d.index,g=d.attributes.position;let v=0;if(f!==null){const b=f.array;v=f.version;for(let w=0,_=b.length;w<_;w+=3){const I=b[w+0],E=b[w+1],R=b[w+2];h.push(I,E,E,R,R,I)}}else if(g!==void 0){const b=g.array;v=g.version;for(let w=0,_=b.length/3-1;w<_;w+=3){const I=w+0,E=w+1,R=w+2;h.push(I,E,E,R,R,I)}}else return;const m=new(Uc(h)?eu:Qc)(h,1);m.version=v;const p=s.get(d);p&&e.remove(p),s.set(d,m)}function u(d){const h=s.get(d);if(h){const f=d.index;f!==null&&h.version<f.version&&c(d)}else c(d);return s.get(d)}return{get:a,update:l,getWireframeAttribute:u}}function Dg(i,e,t){let n;function r(h){n=h}let s,o;function a(h){s=h.type,o=h.bytesPerElement}function l(h,f){i.drawElements(n,f,s,h*o),t.update(f,n,1)}function c(h,f,g){g!==0&&(i.drawElementsInstanced(n,f,s,h*o,g),t.update(f,n,g))}function u(h,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,s,h,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function d(h,f,g,v){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)c(h[p]/o,f[p],v[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,s,h,0,v,0,g);let p=0;for(let b=0;b<g;b++)p+=f[b]*v[b];t.update(p,n,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Ug(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(s/3);break;case i.LINES:t.lines+=a*(s/2);break;case i.LINE_STRIP:t.lines+=a*(s-1);break;case i.LINE_LOOP:t.lines+=a*s;break;case i.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function Ng(i,e,t){const n=new WeakMap,r=new Je;function s(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0;let h=n.get(a);if(h===void 0||h.count!==d){let M=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",M)};h!==void 0&&h.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],b=a.morphAttributes.color||[];let w=0;f===!0&&(w=1),g===!0&&(w=2),v===!0&&(w=3);let _=a.attributes.position.count*w,I=1;_>e.maxTextureSize&&(I=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);const E=new Float32Array(_*I*4*d),R=new Gc(E,_,I,d);R.type=dn,R.needsUpdate=!0;const D=w*4;for(let S=0;S<d;S++){const C=m[S],H=p[S],z=b[S],W=_*I*4*S;for(let K=0;K<C.count;K++){const X=K*D;f===!0&&(r.fromBufferAttribute(C,K),E[W+X+0]=r.x,E[W+X+1]=r.y,E[W+X+2]=r.z,E[W+X+3]=0),g===!0&&(r.fromBufferAttribute(H,K),E[W+X+4]=r.x,E[W+X+5]=r.y,E[W+X+6]=r.z,E[W+X+7]=0),v===!0&&(r.fromBufferAttribute(z,K),E[W+X+8]=r.x,E[W+X+9]=r.y,E[W+X+10]=r.z,E[W+X+11]=z.itemSize===4?r.w:1)}}h={count:d,texture:R,size:new we(_,I)},n.set(a,h),a.addEventListener("dispose",M)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:s}}function Fg(i,e,t,n){let r=new WeakMap;function s(l){const c=n.render.frame,u=l.geometry,d=e.get(l,u);if(r.get(d)!==c&&(e.update(d),r.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;r.get(h)!==c&&(h.update(),r.set(h,c))}return d}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class vu extends Mt{constructor(e,t,n,r,s,o,a,l,c,u=$i){if(u!==$i&&u!==Ki)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&u===$i&&(n=Ei),n===void 0&&u===Ki&&(n=ji),super(null,r,s,o,a,l,u,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:kt,this.minFilter=l!==void 0?l:kt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const xu=new Mt,_u=new vu(1,1),yu=new Gc,Su=new ip,Mu=new lu,bu=[],wu=[],Tu=new Float32Array(16),Eu=new Float32Array(9),Au=new Float32Array(4);function gr(i,e,t){const n=i[0];if(n<=0||n>0)return i;const r=e*t;let s=bu[r];if(s===void 0&&(s=new Float32Array(r),bu[r]=s),e!==0){n.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(s,a)}return s}function yt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function St(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function eo(i,e){let t=wu[e];t===void 0&&(t=new Int32Array(e),wu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function kg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Og(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2fv(this.addr,e),St(t,e)}}function Bg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;i.uniform3fv(this.addr,e),St(t,e)}}function zg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4fv(this.addr,e),St(t,e)}}function Hg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),St(t,e)}else{if(yt(t,n))return;Au.set(n),i.uniformMatrix2fv(this.addr,!1,Au),St(t,n)}}function Gg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),St(t,e)}else{if(yt(t,n))return;Eu.set(n),i.uniformMatrix3fv(this.addr,!1,Eu),St(t,n)}}function Vg(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),St(t,e)}else{if(yt(t,n))return;Tu.set(n),i.uniformMatrix4fv(this.addr,!1,Tu),St(t,n)}}function Wg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Xg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2iv(this.addr,e),St(t,e)}}function qg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3iv(this.addr,e),St(t,e)}}function Yg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4iv(this.addr,e),St(t,e)}}function jg(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function $g(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2uiv(this.addr,e),St(t,e)}}function Kg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3uiv(this.addr,e),St(t,e)}}function Zg(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4uiv(this.addr,e),St(t,e)}}function Jg(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(_u.compareFunction=Lc,s=_u):s=xu,t.setTexture2D(e||s,r)}function Qg(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||Su,r)}function e0(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||Mu,r)}function t0(i,e,t){const n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||yu,r)}function n0(i){switch(i){case 5126:return kg;case 35664:return Og;case 35665:return Bg;case 35666:return zg;case 35674:return Hg;case 35675:return Gg;case 35676:return Vg;case 5124:case 35670:return Wg;case 35667:case 35671:return Xg;case 35668:case 35672:return qg;case 35669:case 35673:return Yg;case 5125:return jg;case 36294:return $g;case 36295:return Kg;case 36296:return Zg;case 35678:case 36198:case 36298:case 36306:case 35682:return Jg;case 35679:case 36299:case 36307:return Qg;case 35680:case 36300:case 36308:case 36293:return e0;case 36289:case 36303:case 36311:case 36292:return t0}}function i0(i,e){i.uniform1fv(this.addr,e)}function r0(i,e){const t=gr(e,this.size,2);i.uniform2fv(this.addr,t)}function s0(i,e){const t=gr(e,this.size,3);i.uniform3fv(this.addr,t)}function o0(i,e){const t=gr(e,this.size,4);i.uniform4fv(this.addr,t)}function a0(i,e){const t=gr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function l0(i,e){const t=gr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function c0(i,e){const t=gr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function u0(i,e){i.uniform1iv(this.addr,e)}function d0(i,e){i.uniform2iv(this.addr,e)}function h0(i,e){i.uniform3iv(this.addr,e)}function f0(i,e){i.uniform4iv(this.addr,e)}function p0(i,e){i.uniform1uiv(this.addr,e)}function m0(i,e){i.uniform2uiv(this.addr,e)}function g0(i,e){i.uniform3uiv(this.addr,e)}function v0(i,e){i.uniform4uiv(this.addr,e)}function x0(i,e,t){const n=this.cache,r=e.length,s=eo(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||xu,s[o])}function _0(i,e,t){const n=this.cache,r=e.length,s=eo(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||Su,s[o])}function y0(i,e,t){const n=this.cache,r=e.length,s=eo(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||Mu,s[o])}function S0(i,e,t){const n=this.cache,r=e.length,s=eo(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),St(n,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||yu,s[o])}function M0(i){switch(i){case 5126:return i0;case 35664:return r0;case 35665:return s0;case 35666:return o0;case 35674:return a0;case 35675:return l0;case 35676:return c0;case 5124:case 35670:return u0;case 35667:case 35671:return d0;case 35668:case 35672:return h0;case 35669:case 35673:return f0;case 5125:return p0;case 36294:return m0;case 36295:return g0;case 36296:return v0;case 35678:case 36198:case 36298:case 36306:case 35682:return x0;case 35679:case 36299:case 36307:return _0;case 35680:case 36300:case 36308:case 36293:return y0;case 36289:case 36303:case 36311:case 36292:return S0}}class b0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=n0(t.type)}}class w0{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=M0(t.type)}}class T0{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],n)}}}const sl=/(\w+)(\])?(\[|\.)?/g;function Ru(i,e){i.seq.push(e),i.map[e.id]=e}function E0(i,e,t){const n=i.name,r=n.length;for(sl.lastIndex=0;;){const s=sl.exec(n),o=sl.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Ru(t,c===void 0?new b0(a,i,e):new w0(a,i,e));break}else{let d=t.map[a];d===void 0&&(d=new T0(a),Ru(t,d)),t=d}}}class to{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);E0(s,o,this)}}setValue(e,t,n,r){const s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){const r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const n=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&n.push(o)}return n}}function Cu(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const A0=37297;let R0=0;function C0(i,e){const t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const Pu=new Ue;function P0(i){We._getMatrix(Pu,We.workingColorSpace,i);const e=`mat3( ${Pu.elements.map(t=>t.toFixed(4))} )`;switch(We.getTransfer(i)){case Is:return[e,"LinearTransferOETF"];case rt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Lu(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+C0(i.getShaderSource(e),o)}else return r}function L0(i,e){const t=P0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function I0(i,e){let t;switch(e){case hc:t="Linear";break;case mf:t="Reinhard";break;case gf:t="Cineon";break;case fc:t="ACESFilmic";break;case xf:t="AgX";break;case _f:t="Neutral";break;case vf:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const no=new A;function D0(){We.getLuminanceCoefficients(no);const i=no.x.toFixed(4),e=no.y.toFixed(4),t=no.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function U0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Kr).join(`
`)}function N0(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function F0(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(e,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Kr(i){return i!==""}function Iu(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Du(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const k0=/^[ \t]*#include +<([\w\d./]+)>/gm;function ol(i){return i.replace(k0,B0)}const O0=new Map;function B0(i,e){let t=ke[e];if(t===void 0){const n=O0.get(e);if(n!==void 0)t=ke[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return ol(t)}const z0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Uu(i){return i.replace(z0,H0)}function H0(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Nu(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function G0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Do?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Yh?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Nn&&(e="SHADOWMAP_TYPE_VSM"),e}function V0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Xi:case qi:e="ENVMAP_TYPE_CUBE";break;case ws:e="ENVMAP_TYPE_CUBE_UV";break}return e}function W0(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case qi:e="ENVMAP_MODE_REFRACTION";break}return e}function X0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Vo:e="ENVMAP_BLENDING_MULTIPLY";break;case ff:e="ENVMAP_BLENDING_MIX";break;case pf:e="ENVMAP_BLENDING_ADD";break}return e}function q0(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Y0(i,e,t,n){const r=i.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=G0(t),c=V0(t),u=W0(t),d=X0(t),h=q0(t),f=U0(t),g=N0(s),v=r.createProgram();let m,p,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Kr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Kr).join(`
`),p.length>0&&(p+=`
`)):(m=[Nu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Kr).join(`
`),p=[Nu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==si?"#define TONE_MAPPING":"",t.toneMapping!==si?ke.tonemapping_pars_fragment:"",t.toneMapping!==si?I0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ke.colorspace_pars_fragment,L0("linearToOutputTexel",t.outputColorSpace),D0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Kr).join(`
`)),o=ol(o),o=Iu(o,t),o=Du(o,t),a=ol(a),a=Iu(a,t),a=Du(a,t),o=Uu(o),a=Uu(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Ic?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ic?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const w=b+m+o,_=b+p+a,I=Cu(r,r.VERTEX_SHADER,w),E=Cu(r,r.FRAGMENT_SHADER,_);r.attachShader(v,I),r.attachShader(v,E),t.index0AttributeName!==void 0?r.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function R(C){if(i.debug.checkShaderErrors){const H=r.getProgramInfoLog(v).trim(),z=r.getShaderInfoLog(I).trim(),W=r.getShaderInfoLog(E).trim();let K=!0,X=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(K=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,v,I,E);else{const te=Lu(r,I,"vertex"),V=Lu(r,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+H+`
`+te+`
`+V)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):(z===""||W==="")&&(X=!1);X&&(C.diagnostics={runnable:K,programLog:H,vertexShader:{log:z,prefix:m},fragmentShader:{log:W,prefix:p}})}r.deleteShader(I),r.deleteShader(E),D=new to(r,v),M=F0(r,v)}let D;this.getUniforms=function(){return D===void 0&&R(this),D};let M;this.getAttributes=function(){return M===void 0&&R(this),M};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=r.getProgramParameter(v,A0)),S},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=R0++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=I,this.fragmentShader=E,this}let j0=0;class $0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new K0(e),t.set(e,n)),n}}class K0{constructor(e){this.id=j0++,this.code=e,this.usedTimes=0}}function Z0(i,e,t,n,r,s,o){const a=new Ba,l=new $0,c=new Set,u=[],d=r.logarithmicDepthBuffer,h=r.vertexTextures;let f=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(M){return c.add(M),M===0?"uv":`uv${M}`}function m(M,S,C,H,z){const W=H.fog,K=z.geometry,X=M.isMeshStandardMaterial?H.environment:null,te=(M.isMeshStandardMaterial?t:e).get(M.envMap||X),V=te&&te.mapping===ws?te.image.height:null,ae=g[M.type];M.precision!==null&&(f=r.getMaxPrecision(M.precision),f!==M.precision&&console.warn("THREE.WebGLProgram.getParameters:",M.precision,"not supported, using",f,"instead."));const fe=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,be=fe!==void 0?fe.length:0;let Ge=0;K.morphAttributes.position!==void 0&&(Ge=1),K.morphAttributes.normal!==void 0&&(Ge=2),K.morphAttributes.color!==void 0&&(Ge=3);let ot,Y,ne,ye;if(ae){const it=Rn[ae];ot=it.vertexShader,Y=it.fragmentShader}else ot=M.vertexShader,Y=M.fragmentShader,l.update(M),ne=l.getVertexShaderID(M),ye=l.getFragmentShaderID(M);const le=i.getRenderTarget(),Ce=i.state.buffers.depth.getReversed(),De=z.isInstancedMesh===!0,Ve=z.isBatchedMesh===!0,mt=!!M.map,$e=!!M.matcap,xt=!!te,F=!!M.aoMap,ln=!!M.lightMap,qe=!!M.bumpMap,Ye=!!M.normalMap,Ee=!!M.displacementMap,dt=!!M.emissiveMap,Te=!!M.metalnessMap,T=!!M.roughnessMap,x=M.anisotropy>0,k=M.clearcoat>0,j=M.dispersion>0,Z=M.iridescence>0,q=M.sheen>0,Se=M.transmission>0,ce=x&&!!M.anisotropyMap,pe=k&&!!M.clearcoatMap,Ke=k&&!!M.clearcoatNormalMap,Q=k&&!!M.clearcoatRoughnessMap,me=Z&&!!M.iridescenceMap,Ae=Z&&!!M.iridescenceThicknessMap,Pe=q&&!!M.sheenColorMap,ge=q&&!!M.sheenRoughnessMap,je=!!M.specularMap,Oe=!!M.specularColorMap,lt=!!M.specularIntensityMap,L=Se&&!!M.transmissionMap,oe=Se&&!!M.thicknessMap,G=!!M.gradientMap,$=!!M.alphaMap,he=M.alphaTest>0,ue=!!M.alphaHash,Ne=!!M.extensions;let vt=si;M.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(vt=i.toneMapping);const Nt={shaderID:ae,shaderType:M.type,shaderName:M.name,vertexShader:ot,fragmentShader:Y,defines:M.defines,customVertexShaderID:ne,customFragmentShaderID:ye,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:f,batching:Ve,batchingColor:Ve&&z._colorsTexture!==null,instancing:De,instancingColor:De&&z.instanceColor!==null,instancingMorph:De&&z.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:le===null?i.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:Ot,alphaToCoverage:!!M.alphaToCoverage,map:mt,matcap:$e,envMap:xt,envMapMode:xt&&te.mapping,envMapCubeUVHeight:V,aoMap:F,lightMap:ln,bumpMap:qe,normalMap:Ye,displacementMap:h&&Ee,emissiveMap:dt,normalMapObjectSpace:Ye&&M.normalMapType===Tf,normalMapTangentSpace:Ye&&M.normalMapType===Aa,metalnessMap:Te,roughnessMap:T,anisotropy:x,anisotropyMap:ce,clearcoat:k,clearcoatMap:pe,clearcoatNormalMap:Ke,clearcoatRoughnessMap:Q,dispersion:j,iridescence:Z,iridescenceMap:me,iridescenceThicknessMap:Ae,sheen:q,sheenColorMap:Pe,sheenRoughnessMap:ge,specularMap:je,specularColorMap:Oe,specularIntensityMap:lt,transmission:Se,transmissionMap:L,thicknessMap:oe,gradientMap:G,opaque:M.transparent===!1&&M.blending===Vi&&M.alphaToCoverage===!1,alphaMap:$,alphaTest:he,alphaHash:ue,combine:M.combine,mapUv:mt&&v(M.map.channel),aoMapUv:F&&v(M.aoMap.channel),lightMapUv:ln&&v(M.lightMap.channel),bumpMapUv:qe&&v(M.bumpMap.channel),normalMapUv:Ye&&v(M.normalMap.channel),displacementMapUv:Ee&&v(M.displacementMap.channel),emissiveMapUv:dt&&v(M.emissiveMap.channel),metalnessMapUv:Te&&v(M.metalnessMap.channel),roughnessMapUv:T&&v(M.roughnessMap.channel),anisotropyMapUv:ce&&v(M.anisotropyMap.channel),clearcoatMapUv:pe&&v(M.clearcoatMap.channel),clearcoatNormalMapUv:Ke&&v(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&v(M.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&v(M.iridescenceMap.channel),iridescenceThicknessMapUv:Ae&&v(M.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&v(M.sheenColorMap.channel),sheenRoughnessMapUv:ge&&v(M.sheenRoughnessMap.channel),specularMapUv:je&&v(M.specularMap.channel),specularColorMapUv:Oe&&v(M.specularColorMap.channel),specularIntensityMapUv:lt&&v(M.specularIntensityMap.channel),transmissionMapUv:L&&v(M.transmissionMap.channel),thicknessMapUv:oe&&v(M.thicknessMap.channel),alphaMapUv:$&&v(M.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(Ye||x),vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!K.attributes.uv&&(mt||$),fog:!!W,useFog:M.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:M.flatShading===!0,sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:Ce,skinning:z.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:be,morphTextureStride:Ge,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:M.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:vt,decodeVideoTexture:mt&&M.map.isVideoTexture===!0&&We.getTransfer(M.map.colorSpace)===rt,decodeVideoTextureEmissive:dt&&M.emissiveMap.isVideoTexture===!0&&We.getTransfer(M.emissiveMap.colorSpace)===rt,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===st,flipSided:M.side===Ft,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:Ne&&M.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ne&&M.extensions.multiDraw===!0||Ve)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return Nt.vertexUv1s=c.has(1),Nt.vertexUv2s=c.has(2),Nt.vertexUv3s=c.has(3),c.clear(),Nt}function p(M){const S=[];if(M.shaderID?S.push(M.shaderID):(S.push(M.customVertexShaderID),S.push(M.customFragmentShaderID)),M.defines!==void 0)for(const C in M.defines)S.push(C),S.push(M.defines[C]);return M.isRawShaderMaterial===!1&&(b(S,M),w(S,M),S.push(i.outputColorSpace)),S.push(M.customProgramCacheKey),S.join()}function b(M,S){M.push(S.precision),M.push(S.outputColorSpace),M.push(S.envMapMode),M.push(S.envMapCubeUVHeight),M.push(S.mapUv),M.push(S.alphaMapUv),M.push(S.lightMapUv),M.push(S.aoMapUv),M.push(S.bumpMapUv),M.push(S.normalMapUv),M.push(S.displacementMapUv),M.push(S.emissiveMapUv),M.push(S.metalnessMapUv),M.push(S.roughnessMapUv),M.push(S.anisotropyMapUv),M.push(S.clearcoatMapUv),M.push(S.clearcoatNormalMapUv),M.push(S.clearcoatRoughnessMapUv),M.push(S.iridescenceMapUv),M.push(S.iridescenceThicknessMapUv),M.push(S.sheenColorMapUv),M.push(S.sheenRoughnessMapUv),M.push(S.specularMapUv),M.push(S.specularColorMapUv),M.push(S.specularIntensityMapUv),M.push(S.transmissionMapUv),M.push(S.thicknessMapUv),M.push(S.combine),M.push(S.fogExp2),M.push(S.sizeAttenuation),M.push(S.morphTargetsCount),M.push(S.morphAttributeCount),M.push(S.numDirLights),M.push(S.numPointLights),M.push(S.numSpotLights),M.push(S.numSpotLightMaps),M.push(S.numHemiLights),M.push(S.numRectAreaLights),M.push(S.numDirLightShadows),M.push(S.numPointLightShadows),M.push(S.numSpotLightShadows),M.push(S.numSpotLightShadowsWithMaps),M.push(S.numLightProbes),M.push(S.shadowMapType),M.push(S.toneMapping),M.push(S.numClippingPlanes),M.push(S.numClipIntersection),M.push(S.depthPacking)}function w(M,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),M.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reverseDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),M.push(a.mask)}function _(M){const S=g[M.type];let C;if(S){const H=Rn[S];C=Ks.clone(H.uniforms)}else C=M.uniforms;return C}function I(M,S){let C;for(let H=0,z=u.length;H<z;H++){const W=u[H];if(W.cacheKey===S){C=W,++C.usedTimes;break}}return C===void 0&&(C=new Y0(i,S,M,s),u.push(C)),C}function E(M){if(--M.usedTimes===0){const S=u.indexOf(M);u[S]=u[u.length-1],u.pop(),M.destroy()}}function R(M){l.remove(M)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:_,acquireProgram:I,releaseProgram:E,releaseShaderCache:R,programs:u,dispose:D}}function J0(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function Q0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Fu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function ku(){const i=[];let e=0;const t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function o(d,h,f,g,v,m){let p=i[e];return p===void 0?(p={id:d.id,object:d,geometry:h,material:f,groupOrder:g,renderOrder:d.renderOrder,z:v,group:m},i[e]=p):(p.id=d.id,p.object=d,p.geometry=h,p.material=f,p.groupOrder=g,p.renderOrder=d.renderOrder,p.z=v,p.group=m),e++,p}function a(d,h,f,g,v,m){const p=o(d,h,f,g,v,m);f.transmission>0?n.push(p):f.transparent===!0?r.push(p):t.push(p)}function l(d,h,f,g,v,m){const p=o(d,h,f,g,v,m);f.transmission>0?n.unshift(p):f.transparent===!0?r.unshift(p):t.unshift(p)}function c(d,h){t.length>1&&t.sort(d||Q0),n.length>1&&n.sort(h||Fu),r.length>1&&r.sort(h||Fu)}function u(){for(let d=e,h=i.length;d<h;d++){const f=i[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:u,sort:c}}function ev(){let i=new WeakMap;function e(n,r){const s=i.get(n);let o;return s===void 0?(o=new ku,i.set(n,[o])):r>=s.length?(o=new ku,s.push(o)):o=s[r],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function tv(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new A,color:new se};break;case"SpotLight":t={position:new A,direction:new A,color:new se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new A,color:new se,distance:0,decay:0};break;case"HemisphereLight":t={direction:new A,skyColor:new se,groundColor:new se};break;case"RectAreaLight":t={color:new se,position:new A,halfWidth:new A,halfHeight:new A};break}return i[e.id]=t,t}}}function nv(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let iv=0;function rv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function sv(i){const e=new tv,t=nv(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new A);const r=new A,s=new Ie,o=new Ie;function a(c){let u=0,d=0,h=0;for(let M=0;M<9;M++)n.probe[M].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,b=0,w=0,_=0,I=0,E=0,R=0;c.sort(rv);for(let M=0,S=c.length;M<S;M++){const C=c[M],H=C.color,z=C.intensity,W=C.distance,K=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)u+=H.r*z,d+=H.g*z,h+=H.b*z;else if(C.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(C.sh.coefficients[X],z);R++}else if(C.isDirectionalLight){const X=e.get(C);if(X.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const te=C.shadow,V=t.get(C);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=K,n.directionalShadowMatrix[f]=C.shadow.matrix,b++}n.directional[f]=X,f++}else if(C.isSpotLight){const X=e.get(C);X.position.setFromMatrixPosition(C.matrixWorld),X.color.copy(H).multiplyScalar(z),X.distance=W,X.coneCos=Math.cos(C.angle),X.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),X.decay=C.decay,n.spot[v]=X;const te=C.shadow;if(C.map&&(n.spotLightMap[I]=C.map,I++,te.updateMatrices(C),C.castShadow&&E++),n.spotLightMatrix[v]=te.matrix,C.castShadow){const V=t.get(C);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,n.spotShadow[v]=V,n.spotShadowMap[v]=K,_++}v++}else if(C.isRectAreaLight){const X=e.get(C);X.color.copy(H).multiplyScalar(z),X.halfWidth.set(C.width*.5,0,0),X.halfHeight.set(0,C.height*.5,0),n.rectArea[m]=X,m++}else if(C.isPointLight){const X=e.get(C);if(X.color.copy(C.color).multiplyScalar(C.intensity),X.distance=C.distance,X.decay=C.decay,C.castShadow){const te=C.shadow,V=t.get(C);V.shadowIntensity=te.intensity,V.shadowBias=te.bias,V.shadowNormalBias=te.normalBias,V.shadowRadius=te.radius,V.shadowMapSize=te.mapSize,V.shadowCameraNear=te.camera.near,V.shadowCameraFar=te.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=K,n.pointShadowMatrix[g]=C.shadow.matrix,w++}n.point[g]=X,g++}else if(C.isHemisphereLight){const X=e.get(C);X.skyColor.copy(C.color).multiplyScalar(z),X.groundColor.copy(C.groundColor).multiplyScalar(z),n.hemi[p]=X,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=re.LTC_FLOAT_1,n.rectAreaLTC2=re.LTC_FLOAT_2):(n.rectAreaLTC1=re.LTC_HALF_1,n.rectAreaLTC2=re.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;const D=n.hash;(D.directionalLength!==f||D.pointLength!==g||D.spotLength!==v||D.rectAreaLength!==m||D.hemiLength!==p||D.numDirectionalShadows!==b||D.numPointShadows!==w||D.numSpotShadows!==_||D.numSpotMaps!==I||D.numLightProbes!==R)&&(n.directional.length=f,n.spot.length=v,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=w,n.pointShadowMap.length=w,n.spotShadow.length=_,n.spotShadowMap.length=_,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=w,n.spotLightMatrix.length=_+I-E,n.spotLightMap.length=I,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=R,D.directionalLength=f,D.pointLength=g,D.spotLength=v,D.rectAreaLength=m,D.hemiLength=p,D.numDirectionalShadows=b,D.numPointShadows=w,D.numSpotShadows=_,D.numSpotMaps=I,D.numLightProbes=R,n.version=iv++)}function l(c,u){let d=0,h=0,f=0,g=0,v=0;const m=u.matrixWorldInverse;for(let p=0,b=c.length;p<b;p++){const w=c[p];if(w.isDirectionalLight){const _=n.directional[d];_.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),_.direction.sub(r),_.direction.transformDirection(m),d++}else if(w.isSpotLight){const _=n.spot[f];_.position.setFromMatrixPosition(w.matrixWorld),_.position.applyMatrix4(m),_.direction.setFromMatrixPosition(w.matrixWorld),r.setFromMatrixPosition(w.target.matrixWorld),_.direction.sub(r),_.direction.transformDirection(m),f++}else if(w.isRectAreaLight){const _=n.rectArea[g];_.position.setFromMatrixPosition(w.matrixWorld),_.position.applyMatrix4(m),o.identity(),s.copy(w.matrixWorld),s.premultiply(m),o.extractRotation(s),_.halfWidth.set(w.width*.5,0,0),_.halfHeight.set(0,w.height*.5,0),_.halfWidth.applyMatrix4(o),_.halfHeight.applyMatrix4(o),g++}else if(w.isPointLight){const _=n.point[h];_.position.setFromMatrixPosition(w.matrixWorld),_.position.applyMatrix4(m),h++}else if(w.isHemisphereLight){const _=n.hemi[v];_.direction.setFromMatrixPosition(w.matrixWorld),_.direction.transformDirection(m),v++}}}return{setup:a,setupView:l,state:n}}function Ou(i){const e=new sv(i),t=[],n=[];function r(u){c.camera=u,t.length=0,n.length=0}function s(u){t.push(u)}function o(u){n.push(u)}function a(){e.setup(t)}function l(u){e.setupView(t,u)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function ov(i){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new Ou(i),e.set(r,[a])):s>=o.length?(a=new Ou(i),o.push(a)):a=o[s],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class av extends yn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=bf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class lv extends yn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const cv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,uv=`uniform sampler2D shadow_pass;
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
}`;function dv(i,e,t){let n=new Ja;const r=new we,s=new we,o=new Je,a=new av({depthPacking:wf}),l=new lv,c={},u=t.maxTextureSize,d={[Fn]:Ft,[Ft]:Fn,[st]:st},h=new wt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new we},radius:{value:4}},vertexShader:cv,fragmentShader:uv}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const g=new At;g.setAttribute("position",new gt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Re(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Do;let p=this.type;this.render=function(E,R,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;const M=i.getRenderTarget(),S=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),H=i.state;H.setBlending(kn),H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);const z=p!==Nn&&this.type===Nn,W=p===Nn&&this.type!==Nn;for(let K=0,X=E.length;K<X;K++){const te=E[K],V=te.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",te,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;r.copy(V.mapSize);const ae=V.getFrameExtents();if(r.multiply(ae),s.copy(V.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/ae.x),r.x=s.x*ae.x,V.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/ae.y),r.y=s.y*ae.y,V.mapSize.y=s.y)),V.map===null||z===!0||W===!0){const be=this.type!==Nn?{minFilter:kt,magFilter:kt}:{};V.map!==null&&V.map.dispose(),V.map=new pn(r.x,r.y,be),V.map.texture.name=te.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const fe=V.getViewportCount();for(let be=0;be<fe;be++){const Ge=V.getViewport(be);o.set(s.x*Ge.x,s.y*Ge.y,s.x*Ge.z,s.y*Ge.w),H.viewport(o),V.updateMatrices(te,be),n=V.getFrustum(),_(R,D,V.camera,te,this.type)}V.isPointLightShadow!==!0&&this.type===Nn&&b(V,D),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(M,S,C)};function b(E,R){const D=e.update(v);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new pn(r.x,r.y)),h.uniforms.shadow_pass.value=E.map.texture,h.uniforms.resolution.value=E.mapSize,h.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(R,null,D,h,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(R,null,D,f,v,null)}function w(E,R,D,M){let S=null;const C=D.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(C!==void 0)S=C;else if(S=D.isPointLight===!0?l:a,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const H=S.uuid,z=R.uuid;let W=c[H];W===void 0&&(W={},c[H]=W);let K=W[z];K===void 0&&(K=S.clone(),W[z]=K,R.addEventListener("dispose",I)),S=K}if(S.visible=R.visible,S.wireframe=R.wireframe,M===Nn?S.side=R.shadowSide!==null?R.shadowSide:R.side:S.side=R.shadowSide!==null?R.shadowSide:d[R.side],S.alphaMap=R.alphaMap,S.alphaTest=R.alphaTest,S.map=R.map,S.clipShadows=R.clipShadows,S.clippingPlanes=R.clippingPlanes,S.clipIntersection=R.clipIntersection,S.displacementMap=R.displacementMap,S.displacementScale=R.displacementScale,S.displacementBias=R.displacementBias,S.wireframeLinewidth=R.wireframeLinewidth,S.linewidth=R.linewidth,D.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const H=i.properties.get(S);H.light=D}return S}function _(E,R,D,M,S){if(E.visible===!1)return;if(E.layers.test(R.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&S===Nn)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,E.matrixWorld);const z=e.update(E),W=E.material;if(Array.isArray(W)){const K=z.groups;for(let X=0,te=K.length;X<te;X++){const V=K[X],ae=W[V.materialIndex];if(ae&&ae.visible){const fe=w(E,ae,M,S);E.onBeforeShadow(i,E,R,D,z,fe,V),i.renderBufferDirect(D,null,z,fe,E,V),E.onAfterShadow(i,E,R,D,z,fe,V)}}}else if(W.visible){const K=w(E,W,M,S);E.onBeforeShadow(i,E,R,D,z,K,null),i.renderBufferDirect(D,null,z,K,E,null),E.onAfterShadow(i,E,R,D,z,K,null)}}const H=E.children;for(let z=0,W=H.length;z<W;z++)_(H[z],R,D,M,S)}function I(E){E.target.removeEventListener("dispose",I);for(const D in c){const M=c[D],S=E.target.uuid;S in M&&(M[S].dispose(),delete M[S])}}}const hv={[Fo]:ko,[Oo]:Ho,[Bo]:Go,[Wi]:zo,[ko]:Fo,[Ho]:Oo,[Go]:Bo,[zo]:Wi};function fv(i,e){function t(){let L=!1;const oe=new Je;let G=null;const $=new Je(0,0,0,0);return{setMask:function(he){G!==he&&!L&&(i.colorMask(he,he,he,he),G=he)},setLocked:function(he){L=he},setClear:function(he,ue,Ne,vt,Nt){Nt===!0&&(he*=vt,ue*=vt,Ne*=vt),oe.set(he,ue,Ne,vt),$.equals(oe)===!1&&(i.clearColor(he,ue,Ne,vt),$.copy(oe))},reset:function(){L=!1,G=null,$.set(-1,0,0,0)}}}function n(){let L=!1,oe=!1,G=null,$=null,he=null;return{setReversed:function(ue){if(oe!==ue){const Ne=e.get("EXT_clip_control");oe?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT);const vt=he;he=null,this.setClear(vt)}oe=ue},getReversed:function(){return oe},setTest:function(ue){ue?le(i.DEPTH_TEST):Ce(i.DEPTH_TEST)},setMask:function(ue){G!==ue&&!L&&(i.depthMask(ue),G=ue)},setFunc:function(ue){if(oe&&(ue=hv[ue]),$!==ue){switch(ue){case Fo:i.depthFunc(i.NEVER);break;case ko:i.depthFunc(i.ALWAYS);break;case Oo:i.depthFunc(i.LESS);break;case Wi:i.depthFunc(i.LEQUAL);break;case Bo:i.depthFunc(i.EQUAL);break;case zo:i.depthFunc(i.GEQUAL);break;case Ho:i.depthFunc(i.GREATER);break;case Go:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}$=ue}},setLocked:function(ue){L=ue},setClear:function(ue){he!==ue&&(oe&&(ue=1-ue),i.clearDepth(ue),he=ue)},reset:function(){L=!1,G=null,$=null,he=null,oe=!1}}}function r(){let L=!1,oe=null,G=null,$=null,he=null,ue=null,Ne=null,vt=null,Nt=null;return{setTest:function(it){L||(it?le(i.STENCIL_TEST):Ce(i.STENCIL_TEST))},setMask:function(it){oe!==it&&!L&&(i.stencilMask(it),oe=it)},setFunc:function(it,Tn,ti){(G!==it||$!==Tn||he!==ti)&&(i.stencilFunc(it,Tn,ti),G=it,$=Tn,he=ti)},setOp:function(it,Tn,ti){(ue!==it||Ne!==Tn||vt!==ti)&&(i.stencilOp(it,Tn,ti),ue=it,Ne=Tn,vt=ti)},setLocked:function(it){L=it},setClear:function(it){Nt!==it&&(i.clearStencil(it),Nt=it)},reset:function(){L=!1,oe=null,G=null,$=null,he=null,ue=null,Ne=null,vt=null,Nt=null}}}const s=new t,o=new n,a=new r,l=new WeakMap,c=new WeakMap;let u={},d={},h=new WeakMap,f=[],g=null,v=!1,m=null,p=null,b=null,w=null,_=null,I=null,E=null,R=new se(0,0,0),D=0,M=!1,S=null,C=null,H=null,z=null,W=null;const K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,te=0;const V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(V)[1]),X=te>=1):V.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),X=te>=2);let ae=null,fe={};const be=i.getParameter(i.SCISSOR_BOX),Ge=i.getParameter(i.VIEWPORT),ot=new Je().fromArray(be),Y=new Je().fromArray(Ge);function ne(L,oe,G,$){const he=new Uint8Array(4),ue=i.createTexture();i.bindTexture(L,ue),i.texParameteri(L,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(L,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<G;Ne++)L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY?i.texImage3D(oe,0,i.RGBA,1,1,$,0,i.RGBA,i.UNSIGNED_BYTE,he):i.texImage2D(oe+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,he);return ue}const ye={};ye[i.TEXTURE_2D]=ne(i.TEXTURE_2D,i.TEXTURE_2D,1),ye[i.TEXTURE_CUBE_MAP]=ne(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ye[i.TEXTURE_2D_ARRAY]=ne(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ye[i.TEXTURE_3D]=ne(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),le(i.DEPTH_TEST),o.setFunc(Wi),qe(!1),Ye(cc),le(i.CULL_FACE),F(kn);function le(L){u[L]!==!0&&(i.enable(L),u[L]=!0)}function Ce(L){u[L]!==!1&&(i.disable(L),u[L]=!1)}function De(L,oe){return d[L]!==oe?(i.bindFramebuffer(L,oe),d[L]=oe,L===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=oe),L===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=oe),!0):!1}function Ve(L,oe){let G=f,$=!1;if(L){G=h.get(oe),G===void 0&&(G=[],h.set(oe,G));const he=L.textures;if(G.length!==he.length||G[0]!==i.COLOR_ATTACHMENT0){for(let ue=0,Ne=he.length;ue<Ne;ue++)G[ue]=i.COLOR_ATTACHMENT0+ue;G.length=he.length,$=!0}}else G[0]!==i.BACK&&(G[0]=i.BACK,$=!0);$&&i.drawBuffers(G)}function mt(L){return g!==L?(i.useProgram(L),g=L,!0):!1}const $e={[Ti]:i.FUNC_ADD,[$h]:i.FUNC_SUBTRACT,[Kh]:i.FUNC_REVERSE_SUBTRACT};$e[Zh]=i.MIN,$e[Jh]=i.MAX;const xt={[Qh]:i.ZERO,[ef]:i.ONE,[tf]:i.SRC_COLOR,[Uo]:i.SRC_ALPHA,[lf]:i.SRC_ALPHA_SATURATE,[of]:i.DST_COLOR,[rf]:i.DST_ALPHA,[nf]:i.ONE_MINUS_SRC_COLOR,[No]:i.ONE_MINUS_SRC_ALPHA,[af]:i.ONE_MINUS_DST_COLOR,[sf]:i.ONE_MINUS_DST_ALPHA,[cf]:i.CONSTANT_COLOR,[uf]:i.ONE_MINUS_CONSTANT_COLOR,[df]:i.CONSTANT_ALPHA,[hf]:i.ONE_MINUS_CONSTANT_ALPHA};function F(L,oe,G,$,he,ue,Ne,vt,Nt,it){if(L===kn){v===!0&&(Ce(i.BLEND),v=!1);return}if(v===!1&&(le(i.BLEND),v=!0),L!==jh){if(L!==m||it!==M){if((p!==Ti||_!==Ti)&&(i.blendEquation(i.FUNC_ADD),p=Ti,_=Ti),it)switch(L){case Vi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ri:i.blendFunc(i.ONE,i.ONE);break;case uc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case dc:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Vi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ri:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case uc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case dc:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}b=null,w=null,I=null,E=null,R.set(0,0,0),D=0,m=L,M=it}return}he=he||oe,ue=ue||G,Ne=Ne||$,(oe!==p||he!==_)&&(i.blendEquationSeparate($e[oe],$e[he]),p=oe,_=he),(G!==b||$!==w||ue!==I||Ne!==E)&&(i.blendFuncSeparate(xt[G],xt[$],xt[ue],xt[Ne]),b=G,w=$,I=ue,E=Ne),(vt.equals(R)===!1||Nt!==D)&&(i.blendColor(vt.r,vt.g,vt.b,Nt),R.copy(vt),D=Nt),m=L,M=!1}function ln(L,oe){L.side===st?Ce(i.CULL_FACE):le(i.CULL_FACE);let G=L.side===Ft;oe&&(G=!G),qe(G),L.blending===Vi&&L.transparent===!1?F(kn):F(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),o.setFunc(L.depthFunc),o.setTest(L.depthTest),o.setMask(L.depthWrite),s.setMask(L.colorWrite);const $=L.stencilWrite;a.setTest($),$&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),dt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?le(i.SAMPLE_ALPHA_TO_COVERAGE):Ce(i.SAMPLE_ALPHA_TO_COVERAGE)}function qe(L){S!==L&&(L?i.frontFace(i.CW):i.frontFace(i.CCW),S=L)}function Ye(L){L!==Gi?(le(i.CULL_FACE),L!==C&&(L===cc?i.cullFace(i.BACK):L===qh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Ce(i.CULL_FACE),C=L}function Ee(L){L!==H&&(X&&i.lineWidth(L),H=L)}function dt(L,oe,G){L?(le(i.POLYGON_OFFSET_FILL),(z!==oe||W!==G)&&(i.polygonOffset(oe,G),z=oe,W=G)):Ce(i.POLYGON_OFFSET_FILL)}function Te(L){L?le(i.SCISSOR_TEST):Ce(i.SCISSOR_TEST)}function T(L){L===void 0&&(L=i.TEXTURE0+K-1),ae!==L&&(i.activeTexture(L),ae=L)}function x(L,oe,G){G===void 0&&(ae===null?G=i.TEXTURE0+K-1:G=ae);let $=fe[G];$===void 0&&($={type:void 0,texture:void 0},fe[G]=$),($.type!==L||$.texture!==oe)&&(ae!==G&&(i.activeTexture(G),ae=G),i.bindTexture(L,oe||ye[L]),$.type=L,$.texture=oe)}function k(){const L=fe[ae];L!==void 0&&L.type!==void 0&&(i.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function j(){try{i.compressedTexImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Z(){try{i.compressedTexImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function q(){try{i.texSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Se(){try{i.texSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function ce(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function pe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ke(){try{i.texStorage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Q(){try{i.texStorage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function me(){try{i.texImage2D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Ae(){try{i.texImage3D.apply(i,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Pe(L){ot.equals(L)===!1&&(i.scissor(L.x,L.y,L.z,L.w),ot.copy(L))}function ge(L){Y.equals(L)===!1&&(i.viewport(L.x,L.y,L.z,L.w),Y.copy(L))}function je(L,oe){let G=c.get(oe);G===void 0&&(G=new WeakMap,c.set(oe,G));let $=G.get(L);$===void 0&&($=i.getUniformBlockIndex(oe,L.name),G.set(L,$))}function Oe(L,oe){const $=c.get(oe).get(L);l.get(oe)!==$&&(i.uniformBlockBinding(oe,$,L.__bindingPointIndex),l.set(oe,$))}function lt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},ae=null,fe={},d={},h=new WeakMap,f=[],g=null,v=!1,m=null,p=null,b=null,w=null,_=null,I=null,E=null,R=new se(0,0,0),D=0,M=!1,S=null,C=null,H=null,z=null,W=null,ot.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:le,disable:Ce,bindFramebuffer:De,drawBuffers:Ve,useProgram:mt,setBlending:F,setMaterial:ln,setFlipSided:qe,setCullFace:Ye,setLineWidth:Ee,setPolygonOffset:dt,setScissorTest:Te,activeTexture:T,bindTexture:x,unbindTexture:k,compressedTexImage2D:j,compressedTexImage3D:Z,texImage2D:me,texImage3D:Ae,updateUBOMapping:je,uniformBlockBinding:Oe,texStorage2D:Ke,texStorage3D:Q,texSubImage2D:q,texSubImage3D:Se,compressedTexSubImage2D:ce,compressedTexSubImage3D:pe,scissor:Pe,viewport:ge,reset:lt}}function Bu(i,e,t,n){const r=pv(n);switch(t){case yc:return i*e;case Mc:return i*e;case bc:return i*e*2;case $o:return i*e/r.components*r.byteLength;case Ko:return i*e/r.components*r.byteLength;case wc:return i*e*2/r.components*r.byteLength;case Zo:return i*e*2/r.components*r.byteLength;case Sc:return i*e*3/r.components*r.byteLength;case Qt:return i*e*4/r.components*r.byteLength;case Jo:return i*e*4/r.components*r.byteLength;case As:case Rs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Cs:case Ps:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ea:case na:return Math.max(i,16)*Math.max(e,8)/4;case Qo:case ta:return Math.max(i,8)*Math.max(e,8)/2;case ia:case ra:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case sa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case oa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case aa:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case la:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case ca:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ua:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case da:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ha:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case fa:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case pa:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ma:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ga:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case va:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case xa:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case _a:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Ls:case ya:case Sa:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Tc:case Ma:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ba:case wa:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function pv(i){switch(i){case Bn:case vc:return{byteLength:1,components:1};case kr:case xc:case zn:return{byteLength:2,components:1};case Yo:case jo:return{byteLength:2,components:4};case Ei:case qo:case dn:return{byteLength:4,components:1};case _c:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function mv(i,e,t,n,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new we,u=new WeakMap;let d;const h=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,x){return f?new OffscreenCanvas(T,x):Gr("canvas")}function v(T,x,k){let j=1;const Z=Te(T);if((Z.width>k||Z.height>k)&&(j=k/Math.max(Z.width,Z.height)),j<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const q=Math.floor(j*Z.width),Se=Math.floor(j*Z.height);d===void 0&&(d=g(q,Se));const ce=x?g(q,Se):d;return ce.width=q,ce.height=Se,ce.getContext("2d").drawImage(T,0,0,q,Se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+q+"x"+Se+")."),ce}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),T;return T}function m(T){return T.generateMipmaps}function p(T){i.generateMipmap(T)}function b(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(T,x,k,j,Z=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let q=x;if(x===i.RED&&(k===i.FLOAT&&(q=i.R32F),k===i.HALF_FLOAT&&(q=i.R16F),k===i.UNSIGNED_BYTE&&(q=i.R8)),x===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.R8UI),k===i.UNSIGNED_SHORT&&(q=i.R16UI),k===i.UNSIGNED_INT&&(q=i.R32UI),k===i.BYTE&&(q=i.R8I),k===i.SHORT&&(q=i.R16I),k===i.INT&&(q=i.R32I)),x===i.RG&&(k===i.FLOAT&&(q=i.RG32F),k===i.HALF_FLOAT&&(q=i.RG16F),k===i.UNSIGNED_BYTE&&(q=i.RG8)),x===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.RG8UI),k===i.UNSIGNED_SHORT&&(q=i.RG16UI),k===i.UNSIGNED_INT&&(q=i.RG32UI),k===i.BYTE&&(q=i.RG8I),k===i.SHORT&&(q=i.RG16I),k===i.INT&&(q=i.RG32I)),x===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.RGB8UI),k===i.UNSIGNED_SHORT&&(q=i.RGB16UI),k===i.UNSIGNED_INT&&(q=i.RGB32UI),k===i.BYTE&&(q=i.RGB8I),k===i.SHORT&&(q=i.RGB16I),k===i.INT&&(q=i.RGB32I)),x===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(q=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(q=i.RGBA16UI),k===i.UNSIGNED_INT&&(q=i.RGBA32UI),k===i.BYTE&&(q=i.RGBA8I),k===i.SHORT&&(q=i.RGBA16I),k===i.INT&&(q=i.RGBA32I)),x===i.RGB&&k===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),x===i.RGBA){const Se=Z?Is:We.getTransfer(j);k===i.FLOAT&&(q=i.RGBA32F),k===i.HALF_FLOAT&&(q=i.RGBA16F),k===i.UNSIGNED_BYTE&&(q=Se===rt?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),q}function _(T,x){let k;return T?x===null||x===Ei||x===ji?k=i.DEPTH24_STENCIL8:x===dn?k=i.DEPTH32F_STENCIL8:x===kr&&(k=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Ei||x===ji?k=i.DEPTH_COMPONENT24:x===dn?k=i.DEPTH_COMPONENT32F:x===kr&&(k=i.DEPTH_COMPONENT16),k}function I(T,x){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==kt&&T.minFilter!==qt?Math.log2(Math.max(x.width,x.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?x.mipmaps.length:1}function E(T){const x=T.target;x.removeEventListener("dispose",E),D(x),x.isVideoTexture&&u.delete(x)}function R(T){const x=T.target;x.removeEventListener("dispose",R),S(x)}function D(T){const x=n.get(T);if(x.__webglInit===void 0)return;const k=T.source,j=h.get(k);if(j){const Z=j[x.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&M(T),Object.keys(j).length===0&&h.delete(k)}n.remove(T)}function M(T){const x=n.get(T);i.deleteTexture(x.__webglTexture);const k=T.source,j=h.get(k);delete j[x.__cacheKey],o.memory.textures--}function S(T){const x=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(x.__webglFramebuffer[j]))for(let Z=0;Z<x.__webglFramebuffer[j].length;Z++)i.deleteFramebuffer(x.__webglFramebuffer[j][Z]);else i.deleteFramebuffer(x.__webglFramebuffer[j]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[j])}else{if(Array.isArray(x.__webglFramebuffer))for(let j=0;j<x.__webglFramebuffer.length;j++)i.deleteFramebuffer(x.__webglFramebuffer[j]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let j=0;j<x.__webglColorRenderbuffer.length;j++)x.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[j]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const k=T.textures;for(let j=0,Z=k.length;j<Z;j++){const q=n.get(k[j]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),o.memory.textures--),n.remove(k[j])}n.remove(T)}let C=0;function H(){C=0}function z(){const T=C;return T>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+r.maxTextures),C+=1,T}function W(T){const x=[];return x.push(T.wrapS),x.push(T.wrapT),x.push(T.wrapR||0),x.push(T.magFilter),x.push(T.minFilter),x.push(T.anisotropy),x.push(T.internalFormat),x.push(T.format),x.push(T.type),x.push(T.generateMipmaps),x.push(T.premultiplyAlpha),x.push(T.flipY),x.push(T.unpackAlignment),x.push(T.colorSpace),x.join()}function K(T,x){const k=n.get(T);if(T.isVideoTexture&&Ee(T),T.isRenderTargetTexture===!1&&T.version>0&&k.__version!==T.version){const j=T.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(k,T,x);return}}t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+x)}function X(T,x){const k=n.get(T);if(T.version>0&&k.__version!==T.version){Y(k,T,x);return}t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+x)}function te(T,x){const k=n.get(T);if(T.version>0&&k.__version!==T.version){Y(k,T,x);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+x)}function V(T,x){const k=n.get(T);if(T.version>0&&k.__version!==T.version){ne(k,T,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+x)}const ae={[Yi]:i.REPEAT,[oi]:i.CLAMP_TO_EDGE,[Ts]:i.MIRRORED_REPEAT},fe={[kt]:i.NEAREST,[gc]:i.NEAREST_MIPMAP_NEAREST,[Fr]:i.NEAREST_MIPMAP_LINEAR,[qt]:i.LINEAR,[Es]:i.LINEAR_MIPMAP_NEAREST,[On]:i.LINEAR_MIPMAP_LINEAR},be={[Ef]:i.NEVER,[If]:i.ALWAYS,[Af]:i.LESS,[Lc]:i.LEQUAL,[Rf]:i.EQUAL,[Lf]:i.GEQUAL,[Cf]:i.GREATER,[Pf]:i.NOTEQUAL};function Ge(T,x){if(x.type===dn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===qt||x.magFilter===Es||x.magFilter===Fr||x.magFilter===On||x.minFilter===qt||x.minFilter===Es||x.minFilter===Fr||x.minFilter===On)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ae[x.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ae[x.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ae[x.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,fe[x.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,fe[x.minFilter]),x.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,be[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===kt||x.minFilter!==Fr&&x.minFilter!==On||x.type===dn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function ot(T,x){let k=!1;T.__webglInit===void 0&&(T.__webglInit=!0,x.addEventListener("dispose",E));const j=x.source;let Z=h.get(j);Z===void 0&&(Z={},h.set(j,Z));const q=W(x);if(q!==T.__cacheKey){Z[q]===void 0&&(Z[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,k=!0),Z[q].usedTimes++;const Se=Z[T.__cacheKey];Se!==void 0&&(Z[T.__cacheKey].usedTimes--,Se.usedTimes===0&&M(x)),T.__cacheKey=q,T.__webglTexture=Z[q].texture}return k}function Y(T,x,k){let j=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(j=i.TEXTURE_3D);const Z=ot(T,x),q=x.source;t.bindTexture(j,T.__webglTexture,i.TEXTURE0+k);const Se=n.get(q);if(q.version!==Se.__version||Z===!0){t.activeTexture(i.TEXTURE0+k);const ce=We.getPrimaries(We.workingColorSpace),pe=x.colorSpace===ai?null:We.getPrimaries(x.colorSpace),Ke=x.colorSpace===ai||ce===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ke);let Q=v(x.image,!1,r.maxTextureSize);Q=dt(x,Q);const me=s.convert(x.format,x.colorSpace),Ae=s.convert(x.type);let Pe=w(x.internalFormat,me,Ae,x.colorSpace,x.isVideoTexture);Ge(j,x);let ge;const je=x.mipmaps,Oe=x.isVideoTexture!==!0,lt=Se.__version===void 0||Z===!0,L=q.dataReady,oe=I(x,Q);if(x.isDepthTexture)Pe=_(x.format===Ki,x.type),lt&&(Oe?t.texStorage2D(i.TEXTURE_2D,1,Pe,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,Pe,Q.width,Q.height,0,me,Ae,null));else if(x.isDataTexture)if(je.length>0){Oe&&lt&&t.texStorage2D(i.TEXTURE_2D,oe,Pe,je[0].width,je[0].height);for(let G=0,$=je.length;G<$;G++)ge=je[G],Oe?L&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,Ae,ge.data):t.texImage2D(i.TEXTURE_2D,G,Pe,ge.width,ge.height,0,me,Ae,ge.data);x.generateMipmaps=!1}else Oe?(lt&&t.texStorage2D(i.TEXTURE_2D,oe,Pe,Q.width,Q.height),L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Q.width,Q.height,me,Ae,Q.data)):t.texImage2D(i.TEXTURE_2D,0,Pe,Q.width,Q.height,0,me,Ae,Q.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Oe&&lt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,Pe,je[0].width,je[0].height,Q.depth);for(let G=0,$=je.length;G<$;G++)if(ge=je[G],x.format!==Qt)if(me!==null)if(Oe){if(L)if(x.layerUpdates.size>0){const he=Bu(ge.width,ge.height,x.format,x.type);for(const ue of x.layerUpdates){const Ne=ge.data.subarray(ue*he/ge.data.BYTES_PER_ELEMENT,(ue+1)*he/ge.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,ue,ge.width,ge.height,1,me,Ne)}x.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,0,ge.width,ge.height,Q.depth,me,ge.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,G,Pe,ge.width,ge.height,Q.depth,0,ge.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Oe?L&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,0,ge.width,ge.height,Q.depth,me,Ae,ge.data):t.texImage3D(i.TEXTURE_2D_ARRAY,G,Pe,ge.width,ge.height,Q.depth,0,me,Ae,ge.data)}else{Oe&&lt&&t.texStorage2D(i.TEXTURE_2D,oe,Pe,je[0].width,je[0].height);for(let G=0,$=je.length;G<$;G++)ge=je[G],x.format!==Qt?me!==null?Oe?L&&t.compressedTexSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,ge.data):t.compressedTexImage2D(i.TEXTURE_2D,G,Pe,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Oe?L&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,Ae,ge.data):t.texImage2D(i.TEXTURE_2D,G,Pe,ge.width,ge.height,0,me,Ae,ge.data)}else if(x.isDataArrayTexture)if(Oe){if(lt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,Pe,Q.width,Q.height,Q.depth),L)if(x.layerUpdates.size>0){const G=Bu(Q.width,Q.height,x.format,x.type);for(const $ of x.layerUpdates){const he=Q.data.subarray($*G/Q.data.BYTES_PER_ELEMENT,($+1)*G/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,$,Q.width,Q.height,1,me,Ae,he)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,me,Ae,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Pe,Q.width,Q.height,Q.depth,0,me,Ae,Q.data);else if(x.isData3DTexture)Oe?(lt&&t.texStorage3D(i.TEXTURE_3D,oe,Pe,Q.width,Q.height,Q.depth),L&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,me,Ae,Q.data)):t.texImage3D(i.TEXTURE_3D,0,Pe,Q.width,Q.height,Q.depth,0,me,Ae,Q.data);else if(x.isFramebufferTexture){if(lt)if(Oe)t.texStorage2D(i.TEXTURE_2D,oe,Pe,Q.width,Q.height);else{let G=Q.width,$=Q.height;for(let he=0;he<oe;he++)t.texImage2D(i.TEXTURE_2D,he,Pe,G,$,0,me,Ae,null),G>>=1,$>>=1}}else if(je.length>0){if(Oe&&lt){const G=Te(je[0]);t.texStorage2D(i.TEXTURE_2D,oe,Pe,G.width,G.height)}for(let G=0,$=je.length;G<$;G++)ge=je[G],Oe?L&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,me,Ae,ge):t.texImage2D(i.TEXTURE_2D,G,Pe,me,Ae,ge);x.generateMipmaps=!1}else if(Oe){if(lt){const G=Te(Q);t.texStorage2D(i.TEXTURE_2D,oe,Pe,G.width,G.height)}L&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,Ae,Q)}else t.texImage2D(i.TEXTURE_2D,0,Pe,me,Ae,Q);m(x)&&p(j),Se.__version=q.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function ne(T,x,k){if(x.image.length!==6)return;const j=ot(T,x),Z=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+k);const q=n.get(Z);if(Z.version!==q.__version||j===!0){t.activeTexture(i.TEXTURE0+k);const Se=We.getPrimaries(We.workingColorSpace),ce=x.colorSpace===ai?null:We.getPrimaries(x.colorSpace),pe=x.colorSpace===ai||Se===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);const Ke=x.isCompressedTexture||x.image[0].isCompressedTexture,Q=x.image[0]&&x.image[0].isDataTexture,me=[];for(let $=0;$<6;$++)!Ke&&!Q?me[$]=v(x.image[$],!0,r.maxCubemapSize):me[$]=Q?x.image[$].image:x.image[$],me[$]=dt(x,me[$]);const Ae=me[0],Pe=s.convert(x.format,x.colorSpace),ge=s.convert(x.type),je=w(x.internalFormat,Pe,ge,x.colorSpace),Oe=x.isVideoTexture!==!0,lt=q.__version===void 0||j===!0,L=Z.dataReady;let oe=I(x,Ae);Ge(i.TEXTURE_CUBE_MAP,x);let G;if(Ke){Oe&&lt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,je,Ae.width,Ae.height);for(let $=0;$<6;$++){G=me[$].mipmaps;for(let he=0;he<G.length;he++){const ue=G[he];x.format!==Qt?Pe!==null?Oe?L&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,0,0,ue.width,ue.height,Pe,ue.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,je,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Oe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,0,0,ue.width,ue.height,Pe,ge,ue.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,je,ue.width,ue.height,0,Pe,ge,ue.data)}}}else{if(G=x.mipmaps,Oe&&lt){G.length>0&&oe++;const $=Te(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,je,$.width,$.height)}for(let $=0;$<6;$++)if(Q){Oe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,me[$].width,me[$].height,Pe,ge,me[$].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,je,me[$].width,me[$].height,0,Pe,ge,me[$].data);for(let he=0;he<G.length;he++){const Ne=G[he].image[$].image;Oe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,0,0,Ne.width,Ne.height,Pe,ge,Ne.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,je,Ne.width,Ne.height,0,Pe,ge,Ne.data)}}else{Oe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Pe,ge,me[$]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,je,Pe,ge,me[$]);for(let he=0;he<G.length;he++){const ue=G[he];Oe?L&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,0,0,Pe,ge,ue.image[$]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,je,Pe,ge,ue.image[$])}}}m(x)&&p(i.TEXTURE_CUBE_MAP),q.__version=Z.version,x.onUpdate&&x.onUpdate(x)}T.__version=x.version}function ye(T,x,k,j,Z,q){const Se=s.convert(k.format,k.colorSpace),ce=s.convert(k.type),pe=w(k.internalFormat,Se,ce,k.colorSpace),Ke=n.get(x),Q=n.get(k);if(Q.__renderTarget=x,!Ke.__hasExternalTextures){const me=Math.max(1,x.width>>q),Ae=Math.max(1,x.height>>q);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,q,pe,me,Ae,x.depth,0,Se,ce,null):t.texImage2D(Z,q,pe,me,Ae,0,Se,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),Ye(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,Z,Q.__webglTexture,0,qe(x)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,Z,Q.__webglTexture,q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function le(T,x,k){if(i.bindRenderbuffer(i.RENDERBUFFER,T),x.depthBuffer){const j=x.depthTexture,Z=j&&j.isDepthTexture?j.type:null,q=_(x.stencilBuffer,Z),Se=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=qe(x);Ye(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce,q,x.width,x.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,q,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,q,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Se,i.RENDERBUFFER,T)}else{const j=x.textures;for(let Z=0;Z<j.length;Z++){const q=j[Z],Se=s.convert(q.format,q.colorSpace),ce=s.convert(q.type),pe=w(q.internalFormat,Se,ce,q.colorSpace),Ke=qe(x);k&&Ye(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ke,pe,x.width,x.height):Ye(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ke,pe,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,pe,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ce(T,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const j=n.get(x.depthTexture);j.__renderTarget=x,(!j.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),K(x.depthTexture,0);const Z=j.__webglTexture,q=qe(x);if(x.depthTexture.format===$i)Ye(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0);else if(x.depthTexture.format===Ki)Ye(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function De(T){const x=n.get(T),k=T.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==T.depthTexture){const j=T.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),j){const Z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,j.removeEventListener("dispose",Z)};j.addEventListener("dispose",Z),x.__depthDisposeCallback=Z}x.__boundDepthTexture=j}if(T.depthTexture&&!x.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");Ce(x.__webglFramebuffer,T)}else if(k){x.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[j]),x.__webglDepthbuffer[j]===void 0)x.__webglDepthbuffer[j]=i.createRenderbuffer(),le(x.__webglDepthbuffer[j],T,!1);else{const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=x.__webglDepthbuffer[j];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,q)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),le(x.__webglDepthbuffer,T,!1);else{const j=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,Z)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ve(T,x,k){const j=n.get(T);x!==void 0&&ye(j.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&De(T)}function mt(T){const x=T.texture,k=n.get(T),j=n.get(x);T.addEventListener("dispose",R);const Z=T.textures,q=T.isWebGLCubeRenderTarget===!0,Se=Z.length>1;if(Se||(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=x.version,o.memory.textures++),q){k.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(x.mipmaps&&x.mipmaps.length>0){k.__webglFramebuffer[ce]=[];for(let pe=0;pe<x.mipmaps.length;pe++)k.__webglFramebuffer[ce][pe]=i.createFramebuffer()}else k.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){k.__webglFramebuffer=[];for(let ce=0;ce<x.mipmaps.length;ce++)k.__webglFramebuffer[ce]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(Se)for(let ce=0,pe=Z.length;ce<pe;ce++){const Ke=n.get(Z[ce]);Ke.__webglTexture===void 0&&(Ke.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&Ye(T)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let ce=0;ce<Z.length;ce++){const pe=Z[ce];k.__webglColorRenderbuffer[ce]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[ce]);const Ke=s.convert(pe.format,pe.colorSpace),Q=s.convert(pe.type),me=w(pe.internalFormat,Ke,Q,pe.colorSpace,T.isXRRenderTarget===!0),Ae=qe(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ae,me,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,k.__webglColorRenderbuffer[ce])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),le(k.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),Ge(i.TEXTURE_CUBE_MAP,x);for(let ce=0;ce<6;ce++)if(x.mipmaps&&x.mipmaps.length>0)for(let pe=0;pe<x.mipmaps.length;pe++)ye(k.__webglFramebuffer[ce][pe],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,pe);else ye(k.__webglFramebuffer[ce],T,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(x)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Se){for(let ce=0,pe=Z.length;ce<pe;ce++){const Ke=Z[ce],Q=n.get(Ke);t.bindTexture(i.TEXTURE_2D,Q.__webglTexture),Ge(i.TEXTURE_2D,Ke),ye(k.__webglFramebuffer,T,Ke,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,0),m(Ke)&&p(i.TEXTURE_2D)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ce=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ce,j.__webglTexture),Ge(ce,x),x.mipmaps&&x.mipmaps.length>0)for(let pe=0;pe<x.mipmaps.length;pe++)ye(k.__webglFramebuffer[pe],T,x,i.COLOR_ATTACHMENT0,ce,pe);else ye(k.__webglFramebuffer,T,x,i.COLOR_ATTACHMENT0,ce,0);m(x)&&p(ce),t.unbindTexture()}T.depthBuffer&&De(T)}function $e(T){const x=T.textures;for(let k=0,j=x.length;k<j;k++){const Z=x[k];if(m(Z)){const q=b(T),Se=n.get(Z).__webglTexture;t.bindTexture(q,Se),p(q),t.unbindTexture()}}}const xt=[],F=[];function ln(T){if(T.samples>0){if(Ye(T)===!1){const x=T.textures,k=T.width,j=T.height;let Z=i.COLOR_BUFFER_BIT;const q=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=n.get(T),ce=x.length>1;if(ce)for(let pe=0;pe<x.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let pe=0;pe<x.length;pe++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),ce){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Se.__webglColorRenderbuffer[pe]);const Ke=n.get(x[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ke,0)}i.blitFramebuffer(0,0,k,j,0,0,k,j,Z,i.NEAREST),l===!0&&(xt.length=0,F.length=0,xt.push(i.COLOR_ATTACHMENT0+pe),T.depthBuffer&&T.resolveDepthBuffer===!1&&(xt.push(q),F.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,F)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,xt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ce)for(let pe=0;pe<x.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,Se.__webglColorRenderbuffer[pe]);const Ke=n.get(x[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,Ke,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const x=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function qe(T){return Math.min(r.maxSamples,T.samples)}function Ye(T){const x=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Ee(T){const x=o.render.frame;u.get(T)!==x&&(u.set(T,x),T.update())}function dt(T,x){const k=T.colorSpace,j=T.format,Z=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||k!==Ot&&k!==ai&&(We.getTransfer(k)===rt?(j!==Qt||Z!==Bn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),x}function Te(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=H,this.setTexture2D=K,this.setTexture2DArray=X,this.setTexture3D=te,this.setTextureCube=V,this.rebindTextures=Ve,this.setupRenderTarget=mt,this.updateRenderTargetMipmap=$e,this.updateMultisampleRenderTarget=ln,this.setupDepthRenderbuffer=De,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=Ye}function gv(i,e){function t(n,r=ai){let s;const o=We.getTransfer(r);if(n===Bn)return i.UNSIGNED_BYTE;if(n===Yo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===jo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===_c)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===vc)return i.BYTE;if(n===xc)return i.SHORT;if(n===kr)return i.UNSIGNED_SHORT;if(n===qo)return i.INT;if(n===Ei)return i.UNSIGNED_INT;if(n===dn)return i.FLOAT;if(n===zn)return i.HALF_FLOAT;if(n===yc)return i.ALPHA;if(n===Sc)return i.RGB;if(n===Qt)return i.RGBA;if(n===Mc)return i.LUMINANCE;if(n===bc)return i.LUMINANCE_ALPHA;if(n===$i)return i.DEPTH_COMPONENT;if(n===Ki)return i.DEPTH_STENCIL;if(n===$o)return i.RED;if(n===Ko)return i.RED_INTEGER;if(n===wc)return i.RG;if(n===Zo)return i.RG_INTEGER;if(n===Jo)return i.RGBA_INTEGER;if(n===As||n===Rs||n===Cs||n===Ps)if(o===rt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===As)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Rs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Cs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ps)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===As)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Rs)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Cs)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ps)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Qo||n===ea||n===ta||n===na)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Qo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ea)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ta)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===na)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ia||n===ra||n===sa)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===ia||n===ra)return o===rt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===sa)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===oa||n===aa||n===la||n===ca||n===ua||n===da||n===ha||n===fa||n===pa||n===ma||n===ga||n===va||n===xa||n===_a)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===oa)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===aa)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===la)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ca)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ua)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===da)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ha)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===fa)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===pa)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ma)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ga)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===va)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===xa)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===_a)return o===rt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ls||n===ya||n===Sa)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===Ls)return o===rt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ya)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Sa)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Tc||n===Ma||n===ba||n===wa)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===Ls)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Ma)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ba)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===wa)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ji?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class vv extends Ht{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class It extends ut{constructor(){super(),this.isGroup=!0,this.type="Group"}}const xv={type:"move"};class al{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new It,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new It,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new It,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const v of e.hand.values()){const m=t.getJointPose(v,n),p=this._getHandJoint(c,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&h>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(xv)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new It;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const _v=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,yv=`
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

}`;class Sv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const r=new Mt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new wt({vertexShader:_v,fragmentShader:yv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Re(new Sn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Mv extends Ji{constructor(e,t){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,g=null;const v=new Sv,m=t.getContextAttributes();let p=null,b=null;const w=[],_=[],I=new we;let E=null;const R=new Ht;R.viewport=new Je;const D=new Ht;D.viewport=new Je;const M=[R,D],S=new vv;let C=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let ne=w[Y];return ne===void 0&&(ne=new al,w[Y]=ne),ne.getTargetRaySpace()},this.getControllerGrip=function(Y){let ne=w[Y];return ne===void 0&&(ne=new al,w[Y]=ne),ne.getGripSpace()},this.getHand=function(Y){let ne=w[Y];return ne===void 0&&(ne=new al,w[Y]=ne),ne.getHandSpace()};function z(Y){const ne=_.indexOf(Y.inputSource);if(ne===-1)return;const ye=w[ne];ye!==void 0&&(ye.update(Y.inputSource,Y.frame,c||o),ye.dispatchEvent({type:Y.type,data:Y.inputSource}))}function W(){r.removeEventListener("select",z),r.removeEventListener("selectstart",z),r.removeEventListener("selectend",z),r.removeEventListener("squeeze",z),r.removeEventListener("squeezestart",z),r.removeEventListener("squeezeend",z),r.removeEventListener("end",W),r.removeEventListener("inputsourceschange",K);for(let Y=0;Y<w.length;Y++){const ne=_[Y];ne!==null&&(_[Y]=null,w[Y].disconnect(ne))}C=null,H=null,v.reset(),e.setRenderTarget(p),f=null,h=null,d=null,r=null,b=null,ot.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){s=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Y){if(r=Y,r!==null){if(p=e.getRenderTarget(),r.addEventListener("select",z),r.addEventListener("selectstart",z),r.addEventListener("selectend",z),r.addEventListener("squeeze",z),r.addEventListener("squeezestart",z),r.addEventListener("squeezeend",z),r.addEventListener("end",W),r.addEventListener("inputsourceschange",K),m.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(I),r.renderState.layers===void 0){const ne={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,ne),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),b=new pn(f.framebufferWidth,f.framebufferHeight,{format:Qt,type:Bn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ne=null,ye=null,le=null;m.depth&&(le=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=m.stencil?Ki:$i,ye=m.stencil?ji:Ei);const Ce={colorFormat:t.RGBA8,depthFormat:le,scaleFactor:s};d=new XRWebGLBinding(r,t),h=d.createProjectionLayer(Ce),r.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),b=new pn(h.textureWidth,h.textureHeight,{format:Qt,type:Bn,depthTexture:new vu(h.textureWidth,h.textureHeight,ye,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),ot.setContext(r),ot.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function K(Y){for(let ne=0;ne<Y.removed.length;ne++){const ye=Y.removed[ne],le=_.indexOf(ye);le>=0&&(_[le]=null,w[le].disconnect(ye))}for(let ne=0;ne<Y.added.length;ne++){const ye=Y.added[ne];let le=_.indexOf(ye);if(le===-1){for(let De=0;De<w.length;De++)if(De>=_.length){_.push(ye),le=De;break}else if(_[De]===null){_[De]=ye,le=De;break}if(le===-1)break}const Ce=w[le];Ce&&Ce.connect(ye)}}const X=new A,te=new A;function V(Y,ne,ye){X.setFromMatrixPosition(ne.matrixWorld),te.setFromMatrixPosition(ye.matrixWorld);const le=X.distanceTo(te),Ce=ne.projectionMatrix.elements,De=ye.projectionMatrix.elements,Ve=Ce[14]/(Ce[10]-1),mt=Ce[14]/(Ce[10]+1),$e=(Ce[9]+1)/Ce[5],xt=(Ce[9]-1)/Ce[5],F=(Ce[8]-1)/Ce[0],ln=(De[8]+1)/De[0],qe=Ve*F,Ye=Ve*ln,Ee=le/(-F+ln),dt=Ee*-F;if(ne.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(dt),Y.translateZ(Ee),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Ce[10]===-1)Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse);else{const Te=Ve+Ee,T=mt+Ee,x=qe-dt,k=Ye+(le-dt),j=$e*mt/T*Te,Z=xt*mt/T*Te;Y.projectionMatrix.makePerspective(x,k,j,Z,Te,T),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ae(Y,ne){ne===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(ne.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(r===null)return;let ne=Y.near,ye=Y.far;v.texture!==null&&(v.depthNear>0&&(ne=v.depthNear),v.depthFar>0&&(ye=v.depthFar)),S.near=D.near=R.near=ne,S.far=D.far=R.far=ye,(C!==S.near||H!==S.far)&&(r.updateRenderState({depthNear:S.near,depthFar:S.far}),C=S.near,H=S.far),R.layers.mask=Y.layers.mask|2,D.layers.mask=Y.layers.mask|4,S.layers.mask=R.layers.mask|D.layers.mask;const le=Y.parent,Ce=S.cameras;ae(S,le);for(let De=0;De<Ce.length;De++)ae(Ce[De],le);Ce.length===2?V(S,R,D):S.projectionMatrix.copy(R.projectionMatrix),fe(Y,S,le)};function fe(Y,ne,ye){ye===null?Y.matrix.copy(ne.matrixWorld):(Y.matrix.copy(ye.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(ne.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(ne.projectionMatrix),Y.projectionMatrixInverse.copy(ne.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Qi*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Y){l=Y,h!==null&&(h.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(S)};let be=null;function Ge(Y,ne){if(u=ne.getViewerPose(c||o),g=ne,u!==null){const ye=u.views;f!==null&&(e.setRenderTargetFramebuffer(b,f.framebuffer),e.setRenderTarget(b));let le=!1;ye.length!==S.cameras.length&&(S.cameras.length=0,le=!0);for(let De=0;De<ye.length;De++){const Ve=ye[De];let mt=null;if(f!==null)mt=f.getViewport(Ve);else{const xt=d.getViewSubImage(h,Ve);mt=xt.viewport,De===0&&(e.setRenderTargetTextures(b,xt.colorTexture,h.ignoreDepthValues?void 0:xt.depthStencilTexture),e.setRenderTarget(b))}let $e=M[De];$e===void 0&&($e=new Ht,$e.layers.enable(De),$e.viewport=new Je,M[De]=$e),$e.matrix.fromArray(Ve.transform.matrix),$e.matrix.decompose($e.position,$e.quaternion,$e.scale),$e.projectionMatrix.fromArray(Ve.projectionMatrix),$e.projectionMatrixInverse.copy($e.projectionMatrix).invert(),$e.viewport.set(mt.x,mt.y,mt.width,mt.height),De===0&&(S.matrix.copy($e.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),le===!0&&S.cameras.push($e)}const Ce=r.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")){const De=d.getDepthInformation(ye[0]);De&&De.isValid&&De.texture&&v.init(e,De,r.renderState)}}for(let ye=0;ye<w.length;ye++){const le=_[ye],Ce=w[ye];le!==null&&Ce!==void 0&&Ce.update(le,ne,c||o)}be&&be(Y,ne),ne.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ne}),g=null}const ot=new cu;ot.setAnimationLoop(Ge),this.setAnimationLoop=function(Y){be=Y},this.dispose=function(){}}}const Ui=new vn,bv=new Ie;function wv(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,ru(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,b,w,_){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),d(m,p)):p.isMeshPhongMaterial?(s(m,p),u(m,p)):p.isMeshStandardMaterial?(s(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,_)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),v(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,b,w):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ft&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ft&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const b=e.get(p),w=b.envMap,_=b.envMapRotation;w&&(m.envMap.value=w,Ui.copy(_),Ui.x*=-1,Ui.y*=-1,Ui.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Ui.y*=-1,Ui.z*=-1),m.envMapRotation.value.setFromMatrix4(bv.makeRotationFromEuler(Ui)),m.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,b,w){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=w*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ft&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){const b=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function Tv(i,e,t,n){let r={},s={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,w){const _=w.program;n.uniformBlockBinding(b,_)}function c(b,w){let _=r[b.id];_===void 0&&(g(b),_=u(b),r[b.id]=_,b.addEventListener("dispose",m));const I=w.program;n.updateUBOMapping(b,I);const E=e.render.frame;s[b.id]!==E&&(h(b),s[b.id]=E)}function u(b){const w=d();b.__bindingPointIndex=w;const _=i.createBuffer(),I=b.__size,E=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,_),i.bufferData(i.UNIFORM_BUFFER,I,E),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,_),_}function d(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(b){const w=r[b.id],_=b.uniforms,I=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let E=0,R=_.length;E<R;E++){const D=Array.isArray(_[E])?_[E]:[_[E]];for(let M=0,S=D.length;M<S;M++){const C=D[M];if(f(C,E,M,I)===!0){const H=C.__offset,z=Array.isArray(C.value)?C.value:[C.value];let W=0;for(let K=0;K<z.length;K++){const X=z[K],te=v(X);typeof X=="number"||typeof X=="boolean"?(C.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,H+W,C.__data)):X.isMatrix3?(C.__data[0]=X.elements[0],C.__data[1]=X.elements[1],C.__data[2]=X.elements[2],C.__data[3]=0,C.__data[4]=X.elements[3],C.__data[5]=X.elements[4],C.__data[6]=X.elements[5],C.__data[7]=0,C.__data[8]=X.elements[6],C.__data[9]=X.elements[7],C.__data[10]=X.elements[8],C.__data[11]=0):(X.toArray(C.__data,W),W+=te.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,H,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(b,w,_,I){const E=b.value,R=w+"_"+_;if(I[R]===void 0)return typeof E=="number"||typeof E=="boolean"?I[R]=E:I[R]=E.clone(),!0;{const D=I[R];if(typeof E=="number"||typeof E=="boolean"){if(D!==E)return I[R]=E,!0}else if(D.equals(E)===!1)return D.copy(E),!0}return!1}function g(b){const w=b.uniforms;let _=0;const I=16;for(let R=0,D=w.length;R<D;R++){const M=Array.isArray(w[R])?w[R]:[w[R]];for(let S=0,C=M.length;S<C;S++){const H=M[S],z=Array.isArray(H.value)?H.value:[H.value];for(let W=0,K=z.length;W<K;W++){const X=z[W],te=v(X),V=_%I,ae=V%te.boundary,fe=V+ae;_+=ae,fe!==0&&I-fe<te.storage&&(_+=I-fe),H.__data=new Float32Array(te.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=_,_+=te.storage}}}const E=_%I;return E>0&&(_+=I-E),b.__size=_,b.__cache={},this}function v(b){const w={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(w.boundary=4,w.storage=4):b.isVector2?(w.boundary=8,w.storage=8):b.isVector3||b.isColor?(w.boundary=16,w.storage=12):b.isVector4?(w.boundary=16,w.storage=16):b.isMatrix3?(w.boundary=48,w.storage=48):b.isMatrix4?(w.boundary=64,w.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),w}function m(b){const w=b.target;w.removeEventListener("dispose",m);const _=o.indexOf(w.__bindingPointIndex);o.splice(_,1),i.deleteBuffer(r[w.id]),delete r[w.id],delete s[w.id]}function p(){for(const b in r)i.deleteBuffer(r[b]);o=[],r={},s={}}return{bind:l,update:c,dispose:p}}class Ev{constructor(e={}){const{canvas:t=$f(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),v=new Int32Array(4);let m=null,p=null;const b=[],w=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Et,this.toneMapping=si,this.toneMappingExposure=1;const _=this;let I=!1,E=0,R=0,D=null,M=-1,S=null;const C=new Je,H=new Je;let z=null;const W=new se(0);let K=0,X=t.width,te=t.height,V=1,ae=null,fe=null;const be=new Je(0,0,X,te),Ge=new Je(0,0,X,te);let ot=!1;const Y=new Ja;let ne=!1,ye=!1;const le=new Ie,Ce=new Ie,De=new A,Ve=new Je,mt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let $e=!1;function xt(){return D===null?V:1}let F=n;function ln(y,U){return t.getContext(y,U)}try{const y={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${un}`),t.addEventListener("webglcontextlost",$,!1),t.addEventListener("webglcontextrestored",he,!1),t.addEventListener("webglcontextcreationerror",ue,!1),F===null){const U="webgl2";if(F=ln(U,y),F===null)throw ln(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(y){throw console.error("THREE.WebGLRenderer: "+y.message),y}let qe,Ye,Ee,dt,Te,T,x,k,j,Z,q,Se,ce,pe,Ke,Q,me,Ae,Pe,ge,je,Oe,lt,L;function oe(){qe=new Lg(F),qe.init(),Oe=new gv(F,qe),Ye=new Tg(F,qe,e,Oe),Ee=new fv(F,qe),Ye.reverseDepthBuffer&&h&&Ee.buffers.depth.setReversed(!0),dt=new Ug(F),Te=new J0,T=new mv(F,qe,Ee,Te,Ye,Oe,dt),x=new Ag(_),k=new Pg(_),j=new Sp(F),lt=new bg(F,j),Z=new Ig(F,j,dt,lt),q=new Fg(F,Z,j,dt),Pe=new Ng(F,Ye,T),Q=new Eg(Te),Se=new Z0(_,x,k,qe,Ye,lt,Q),ce=new wv(_,Te),pe=new ev,Ke=new ov(qe),Ae=new Mg(_,x,k,Ee,q,f,l),me=new dv(_,q,Ye),L=new Tv(F,dt,Ye,Ee),ge=new wg(F,qe,dt),je=new Dg(F,qe,dt),dt.programs=Se.programs,_.capabilities=Ye,_.extensions=qe,_.properties=Te,_.renderLists=pe,_.shadowMap=me,_.state=Ee,_.info=dt}oe();const G=new Mv(_,F);this.xr=G,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const y=qe.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=qe.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(y){y!==void 0&&(V=y,this.setSize(X,te,!1))},this.getSize=function(y){return y.set(X,te)},this.setSize=function(y,U,O=!0){if(G.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=y,te=U,t.width=Math.floor(y*V),t.height=Math.floor(U*V),O===!0&&(t.style.width=y+"px",t.style.height=U+"px"),this.setViewport(0,0,y,U)},this.getDrawingBufferSize=function(y){return y.set(X*V,te*V).floor()},this.setDrawingBufferSize=function(y,U,O){X=y,te=U,V=O,t.width=Math.floor(y*O),t.height=Math.floor(U*O),this.setViewport(0,0,y,U)},this.getCurrentViewport=function(y){return y.copy(C)},this.getViewport=function(y){return y.copy(be)},this.setViewport=function(y,U,O,B){y.isVector4?be.set(y.x,y.y,y.z,y.w):be.set(y,U,O,B),Ee.viewport(C.copy(be).multiplyScalar(V).round())},this.getScissor=function(y){return y.copy(Ge)},this.setScissor=function(y,U,O,B){y.isVector4?Ge.set(y.x,y.y,y.z,y.w):Ge.set(y,U,O,B),Ee.scissor(H.copy(Ge).multiplyScalar(V).round())},this.getScissorTest=function(){return ot},this.setScissorTest=function(y){Ee.setScissorTest(ot=y)},this.setOpaqueSort=function(y){ae=y},this.setTransparentSort=function(y){fe=y},this.getClearColor=function(y){return y.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor.apply(Ae,arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha.apply(Ae,arguments)},this.clear=function(y=!0,U=!0,O=!0){let B=0;if(y){let N=!1;if(D!==null){const ee=D.texture.format;N=ee===Jo||ee===Zo||ee===Ko}if(N){const ee=D.texture.type,de=ee===Bn||ee===Ei||ee===kr||ee===ji||ee===Yo||ee===jo,ve=Ae.getClearColor(),xe=Ae.getClearAlpha(),Le=ve.r,Fe=ve.g,_e=ve.b;de?(g[0]=Le,g[1]=Fe,g[2]=_e,g[3]=xe,F.clearBufferuiv(F.COLOR,0,g)):(v[0]=Le,v[1]=Fe,v[2]=_e,v[3]=xe,F.clearBufferiv(F.COLOR,0,v))}else B|=F.COLOR_BUFFER_BIT}U&&(B|=F.DEPTH_BUFFER_BIT),O&&(B|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",$,!1),t.removeEventListener("webglcontextrestored",he,!1),t.removeEventListener("webglcontextcreationerror",ue,!1),pe.dispose(),Ke.dispose(),Te.dispose(),x.dispose(),k.dispose(),q.dispose(),lt.dispose(),L.dispose(),Se.dispose(),G.dispose(),G.removeEventListener("sessionstart",Oh),G.removeEventListener("sessionend",Bh),Hi.stop()};function $(y){y.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),I=!0}function he(){console.log("THREE.WebGLRenderer: Context Restored."),I=!1;const y=dt.autoReset,U=me.enabled,O=me.autoUpdate,B=me.needsUpdate,N=me.type;oe(),dt.autoReset=y,me.enabled=U,me.autoUpdate=O,me.needsUpdate=B,me.type=N}function ue(y){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function Ne(y){const U=y.target;U.removeEventListener("dispose",Ne),vt(U)}function vt(y){Nt(y),Te.remove(y)}function Nt(y){const U=Te.get(y).programs;U!==void 0&&(U.forEach(function(O){Se.releaseProgram(O)}),y.isShaderMaterial&&Se.releaseShaderCache(y))}this.renderBufferDirect=function(y,U,O,B,N,ee){U===null&&(U=mt);const de=N.isMesh&&N.matrixWorld.determinant()<0,ve=iS(y,U,O,B,N);Ee.setMaterial(B,de);let xe=O.index,Le=1;if(B.wireframe===!0){if(xe=Z.getWireframeAttribute(O),xe===void 0)return;Le=2}const Fe=O.drawRange,_e=O.attributes.position;let Ze=Fe.start*Le,ct=(Fe.start+Fe.count)*Le;ee!==null&&(Ze=Math.max(Ze,ee.start*Le),ct=Math.min(ct,(ee.start+ee.count)*Le)),xe!==null?(Ze=Math.max(Ze,0),ct=Math.min(ct,xe.count)):_e!=null&&(Ze=Math.max(Ze,0),ct=Math.min(ct,_e.count));const ht=ct-Ze;if(ht<0||ht===1/0)return;lt.setup(N,B,ve,O,xe);let Xt,Qe=ge;if(xe!==null&&(Xt=j.get(xe),Qe=je,Qe.setIndex(Xt)),N.isMesh)B.wireframe===!0?(Ee.setLineWidth(B.wireframeLinewidth*xt()),Qe.setMode(F.LINES)):Qe.setMode(F.TRIANGLES);else if(N.isLine){let Me=B.linewidth;Me===void 0&&(Me=1),Ee.setLineWidth(Me*xt()),N.isLineSegments?Qe.setMode(F.LINES):N.isLineLoop?Qe.setMode(F.LINE_LOOP):Qe.setMode(F.LINE_STRIP)}else N.isPoints?Qe.setMode(F.POINTS):N.isSprite&&Qe.setMode(F.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)Qe.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(qe.get("WEBGL_multi_draw"))Qe.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Me=N._multiDrawStarts,ni=N._multiDrawCounts,et=N._multiDrawCount,En=xe?j.get(xe).bytesPerElement:1,Nr=Te.get(B).currentProgram.getUniforms();for(let Jt=0;Jt<et;Jt++)Nr.setValue(F,"_gl_DrawID",Jt),Qe.render(Me[Jt]/En,ni[Jt])}else if(N.isInstancedMesh)Qe.renderInstances(Ze,ht,N.count);else if(O.isInstancedBufferGeometry){const Me=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,ni=Math.min(O.instanceCount,Me);Qe.renderInstances(Ze,ht,ni)}else Qe.render(Ze,ht)};function it(y,U,O){y.transparent===!0&&y.side===st&&y.forceSinglePass===!1?(y.side=Ft,y.needsUpdate=!0,Io(y,U,O),y.side=Fn,y.needsUpdate=!0,Io(y,U,O),y.side=st):Io(y,U,O)}this.compile=function(y,U,O=null){O===null&&(O=y),p=Ke.get(O),p.init(U),w.push(p),O.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),y!==O&&y.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights();const B=new Set;return y.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const ee=N.material;if(ee)if(Array.isArray(ee))for(let de=0;de<ee.length;de++){const ve=ee[de];it(ve,O,N),B.add(ve)}else it(ee,O,N),B.add(ee)}),w.pop(),p=null,B},this.compileAsync=function(y,U,O=null){const B=this.compile(y,U,O);return new Promise(N=>{function ee(){if(B.forEach(function(de){Te.get(de).currentProgram.isReady()&&B.delete(de)}),B.size===0){N(y);return}setTimeout(ee,10)}qe.get("KHR_parallel_shader_compile")!==null?ee():setTimeout(ee,10)})};let Tn=null;function ti(y){Tn&&Tn(y)}function Oh(){Hi.stop()}function Bh(){Hi.start()}const Hi=new cu;Hi.setAnimationLoop(ti),typeof self<"u"&&Hi.setContext(self),this.setAnimationLoop=function(y){Tn=y,G.setAnimationLoop(y),y===null?Hi.stop():Hi.start()},G.addEventListener("sessionstart",Oh),G.addEventListener("sessionend",Bh),this.render=function(y,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),G.enabled===!0&&G.isPresenting===!0&&(G.cameraAutoUpdate===!0&&G.updateCamera(U),U=G.getCamera()),y.isScene===!0&&y.onBeforeRender(_,y,U,D),p=Ke.get(y,w.length),p.init(U),w.push(p),Ce.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Y.setFromProjectionMatrix(Ce),ye=this.localClippingEnabled,ne=Q.init(this.clippingPlanes,ye),m=pe.get(y,b.length),m.init(),b.push(m),G.enabled===!0&&G.isPresenting===!0){const ee=_.xr.getDepthSensingMesh();ee!==null&&lc(ee,U,-1/0,_.sortObjects)}lc(y,U,0,_.sortObjects),m.finish(),_.sortObjects===!0&&m.sort(ae,fe),$e=G.enabled===!1||G.isPresenting===!1||G.hasDepthSensing()===!1,$e&&Ae.addToRenderList(m,y),this.info.render.frame++,ne===!0&&Q.beginShadows();const O=p.state.shadowsArray;me.render(O,y,U),ne===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset();const B=m.opaque,N=m.transmissive;if(p.setupLights(),U.isArrayCamera){const ee=U.cameras;if(N.length>0)for(let de=0,ve=ee.length;de<ve;de++){const xe=ee[de];Hh(B,N,y,xe)}$e&&Ae.render(y);for(let de=0,ve=ee.length;de<ve;de++){const xe=ee[de];zh(m,y,xe,xe.viewport)}}else N.length>0&&Hh(B,N,y,U),$e&&Ae.render(y),zh(m,y,U);D!==null&&(T.updateMultisampleRenderTarget(D),T.updateRenderTargetMipmap(D)),y.isScene===!0&&y.onAfterRender(_,y,U),lt.resetDefaultState(),M=-1,S=null,w.pop(),w.length>0?(p=w[w.length-1],ne===!0&&Q.setGlobalState(_.clippingPlanes,p.state.camera)):p=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function lc(y,U,O,B){if(y.visible===!1)return;if(y.layers.test(U.layers)){if(y.isGroup)O=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(U);else if(y.isLight)p.pushLight(y),y.castShadow&&p.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||Y.intersectsSprite(y)){B&&Ve.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Ce);const de=q.update(y),ve=y.material;ve.visible&&m.push(y,de,ve,O,Ve.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||Y.intersectsObject(y))){const de=q.update(y),ve=y.material;if(B&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Ve.copy(y.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),Ve.copy(de.boundingSphere.center)),Ve.applyMatrix4(y.matrixWorld).applyMatrix4(Ce)),Array.isArray(ve)){const xe=de.groups;for(let Le=0,Fe=xe.length;Le<Fe;Le++){const _e=xe[Le],Ze=ve[_e.materialIndex];Ze&&Ze.visible&&m.push(y,de,Ze,O,Ve.z,_e)}}else ve.visible&&m.push(y,de,ve,O,Ve.z,null)}}const ee=y.children;for(let de=0,ve=ee.length;de<ve;de++)lc(ee[de],U,O,B)}function zh(y,U,O,B){const N=y.opaque,ee=y.transmissive,de=y.transparent;p.setupLightsView(O),ne===!0&&Q.setGlobalState(_.clippingPlanes,O),B&&Ee.viewport(C.copy(B)),N.length>0&&Lo(N,U,O),ee.length>0&&Lo(ee,U,O),de.length>0&&Lo(de,U,O),Ee.buffers.depth.setTest(!0),Ee.buffers.depth.setMask(!0),Ee.buffers.color.setMask(!0),Ee.setPolygonOffset(!1)}function Hh(y,U,O,B){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[B.id]===void 0&&(p.state.transmissionRenderTarget[B.id]=new pn(1,1,{generateMipmaps:!0,type:qe.has("EXT_color_buffer_half_float")||qe.has("EXT_color_buffer_float")?zn:Bn,minFilter:On,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:We.workingColorSpace}));const ee=p.state.transmissionRenderTarget[B.id],de=B.viewport||C;ee.setSize(de.z,de.w);const ve=_.getRenderTarget();_.setRenderTarget(ee),_.getClearColor(W),K=_.getClearAlpha(),K<1&&_.setClearColor(16777215,.5),_.clear(),$e&&Ae.render(O);const xe=_.toneMapping;_.toneMapping=si;const Le=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),p.setupLightsView(B),ne===!0&&Q.setGlobalState(_.clippingPlanes,B),Lo(y,O,B),T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee),qe.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let _e=0,Ze=U.length;_e<Ze;_e++){const ct=U[_e],ht=ct.object,Xt=ct.geometry,Qe=ct.material,Me=ct.group;if(Qe.side===st&&ht.layers.test(B.layers)){const ni=Qe.side;Qe.side=Ft,Qe.needsUpdate=!0,Gh(ht,O,B,Xt,Qe,Me),Qe.side=ni,Qe.needsUpdate=!0,Fe=!0}}Fe===!0&&(T.updateMultisampleRenderTarget(ee),T.updateRenderTargetMipmap(ee))}_.setRenderTarget(ve),_.setClearColor(W,K),Le!==void 0&&(B.viewport=Le),_.toneMapping=xe}function Lo(y,U,O){const B=U.isScene===!0?U.overrideMaterial:null;for(let N=0,ee=y.length;N<ee;N++){const de=y[N],ve=de.object,xe=de.geometry,Le=B===null?de.material:B,Fe=de.group;ve.layers.test(O.layers)&&Gh(ve,U,O,xe,Le,Fe)}}function Gh(y,U,O,B,N,ee){y.onBeforeRender(_,U,O,B,N,ee),y.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),N.onBeforeRender(_,U,O,B,y,ee),N.transparent===!0&&N.side===st&&N.forceSinglePass===!1?(N.side=Ft,N.needsUpdate=!0,_.renderBufferDirect(O,U,B,N,y,ee),N.side=Fn,N.needsUpdate=!0,_.renderBufferDirect(O,U,B,N,y,ee),N.side=st):_.renderBufferDirect(O,U,B,N,y,ee),y.onAfterRender(_,U,O,B,N,ee)}function Io(y,U,O){U.isScene!==!0&&(U=mt);const B=Te.get(y),N=p.state.lights,ee=p.state.shadowsArray,de=N.state.version,ve=Se.getParameters(y,N.state,ee,U,O),xe=Se.getProgramCacheKey(ve);let Le=B.programs;B.environment=y.isMeshStandardMaterial?U.environment:null,B.fog=U.fog,B.envMap=(y.isMeshStandardMaterial?k:x).get(y.envMap||B.environment),B.envMapRotation=B.environment!==null&&y.envMap===null?U.environmentRotation:y.envMapRotation,Le===void 0&&(y.addEventListener("dispose",Ne),Le=new Map,B.programs=Le);let Fe=Le.get(xe);if(Fe!==void 0){if(B.currentProgram===Fe&&B.lightsStateVersion===de)return Wh(y,ve),Fe}else ve.uniforms=Se.getUniforms(y),y.onBeforeCompile(ve,_),Fe=Se.acquireProgram(ve,xe),Le.set(xe,Fe),B.uniforms=ve.uniforms;const _e=B.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(_e.clippingPlanes=Q.uniform),Wh(y,ve),B.needsLights=sS(y),B.lightsStateVersion=de,B.needsLights&&(_e.ambientLightColor.value=N.state.ambient,_e.lightProbe.value=N.state.probe,_e.directionalLights.value=N.state.directional,_e.directionalLightShadows.value=N.state.directionalShadow,_e.spotLights.value=N.state.spot,_e.spotLightShadows.value=N.state.spotShadow,_e.rectAreaLights.value=N.state.rectArea,_e.ltc_1.value=N.state.rectAreaLTC1,_e.ltc_2.value=N.state.rectAreaLTC2,_e.pointLights.value=N.state.point,_e.pointLightShadows.value=N.state.pointShadow,_e.hemisphereLights.value=N.state.hemi,_e.directionalShadowMap.value=N.state.directionalShadowMap,_e.directionalShadowMatrix.value=N.state.directionalShadowMatrix,_e.spotShadowMap.value=N.state.spotShadowMap,_e.spotLightMatrix.value=N.state.spotLightMatrix,_e.spotLightMap.value=N.state.spotLightMap,_e.pointShadowMap.value=N.state.pointShadowMap,_e.pointShadowMatrix.value=N.state.pointShadowMatrix),B.currentProgram=Fe,B.uniformsList=null,Fe}function Vh(y){if(y.uniformsList===null){const U=y.currentProgram.getUniforms();y.uniformsList=to.seqWithValue(U.seq,y.uniforms)}return y.uniformsList}function Wh(y,U){const O=Te.get(y);O.outputColorSpace=U.outputColorSpace,O.batching=U.batching,O.batchingColor=U.batchingColor,O.instancing=U.instancing,O.instancingColor=U.instancingColor,O.instancingMorph=U.instancingMorph,O.skinning=U.skinning,O.morphTargets=U.morphTargets,O.morphNormals=U.morphNormals,O.morphColors=U.morphColors,O.morphTargetsCount=U.morphTargetsCount,O.numClippingPlanes=U.numClippingPlanes,O.numIntersection=U.numClipIntersection,O.vertexAlphas=U.vertexAlphas,O.vertexTangents=U.vertexTangents,O.toneMapping=U.toneMapping}function iS(y,U,O,B,N){U.isScene!==!0&&(U=mt),T.resetTextureUnits();const ee=U.fog,de=B.isMeshStandardMaterial?U.environment:null,ve=D===null?_.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Ot,xe=(B.isMeshStandardMaterial?k:x).get(B.envMap||de),Le=B.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,Fe=!!O.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),_e=!!O.morphAttributes.position,Ze=!!O.morphAttributes.normal,ct=!!O.morphAttributes.color;let ht=si;B.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(ht=_.toneMapping);const Xt=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Qe=Xt!==void 0?Xt.length:0,Me=Te.get(B),ni=p.state.lights;if(ne===!0&&(ye===!0||y!==S)){const cn=y===S&&B.id===M;Q.setState(B,y,cn)}let et=!1;B.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==ni.state.version||Me.outputColorSpace!==ve||N.isBatchedMesh&&Me.batching===!1||!N.isBatchedMesh&&Me.batching===!0||N.isBatchedMesh&&Me.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Me.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Me.instancing===!1||!N.isInstancedMesh&&Me.instancing===!0||N.isSkinnedMesh&&Me.skinning===!1||!N.isSkinnedMesh&&Me.skinning===!0||N.isInstancedMesh&&Me.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Me.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Me.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Me.instancingMorph===!1&&N.morphTexture!==null||Me.envMap!==xe||B.fog===!0&&Me.fog!==ee||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==Q.numPlanes||Me.numIntersection!==Q.numIntersection)||Me.vertexAlphas!==Le||Me.vertexTangents!==Fe||Me.morphTargets!==_e||Me.morphNormals!==Ze||Me.morphColors!==ct||Me.toneMapping!==ht||Me.morphTargetsCount!==Qe)&&(et=!0):(et=!0,Me.__version=B.version);let En=Me.currentProgram;et===!0&&(En=Io(B,U,N));let Nr=!1,Jt=!1,Ms=!1;const ft=En.getUniforms(),Un=Me.uniforms;if(Ee.useProgram(En.program)&&(Nr=!0,Jt=!0,Ms=!0),B.id!==M&&(M=B.id,Jt=!0),Nr||S!==y){Ee.buffers.depth.getReversed()?(le.copy(y.projectionMatrix),Zf(le),Jf(le),ft.setValue(F,"projectionMatrix",le)):ft.setValue(F,"projectionMatrix",y.projectionMatrix),ft.setValue(F,"viewMatrix",y.matrixWorldInverse);const bi=ft.map.cameraPosition;bi!==void 0&&bi.setValue(F,De.setFromMatrixPosition(y.matrixWorld)),Ye.logarithmicDepthBuffer&&ft.setValue(F,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&ft.setValue(F,"isOrthographic",y.isOrthographicCamera===!0),S!==y&&(S=y,Jt=!0,Ms=!0)}if(N.isSkinnedMesh){ft.setOptional(F,N,"bindMatrix"),ft.setOptional(F,N,"bindMatrixInverse");const cn=N.skeleton;cn&&(cn.boneTexture===null&&cn.computeBoneTexture(),ft.setValue(F,"boneTexture",cn.boneTexture,T))}N.isBatchedMesh&&(ft.setOptional(F,N,"batchingTexture"),ft.setValue(F,"batchingTexture",N._matricesTexture,T),ft.setOptional(F,N,"batchingIdTexture"),ft.setValue(F,"batchingIdTexture",N._indirectTexture,T),ft.setOptional(F,N,"batchingColorTexture"),N._colorsTexture!==null&&ft.setValue(F,"batchingColorTexture",N._colorsTexture,T));const bs=O.morphAttributes;if((bs.position!==void 0||bs.normal!==void 0||bs.color!==void 0)&&Pe.update(N,O,En),(Jt||Me.receiveShadow!==N.receiveShadow)&&(Me.receiveShadow=N.receiveShadow,ft.setValue(F,"receiveShadow",N.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(Un.envMap.value=xe,Un.flipEnvMap.value=xe.isCubeTexture&&xe.isRenderTargetTexture===!1?-1:1),B.isMeshStandardMaterial&&B.envMap===null&&U.environment!==null&&(Un.envMapIntensity.value=U.environmentIntensity),Jt&&(ft.setValue(F,"toneMappingExposure",_.toneMappingExposure),Me.needsLights&&rS(Un,Ms),ee&&B.fog===!0&&ce.refreshFogUniforms(Un,ee),ce.refreshMaterialUniforms(Un,B,V,te,p.state.transmissionRenderTarget[y.id]),to.upload(F,Vh(Me),Un,T)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(to.upload(F,Vh(Me),Un,T),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&ft.setValue(F,"center",N.center),ft.setValue(F,"modelViewMatrix",N.modelViewMatrix),ft.setValue(F,"normalMatrix",N.normalMatrix),ft.setValue(F,"modelMatrix",N.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const cn=B.uniformsGroups;for(let bi=0,wi=cn.length;bi<wi;bi++){const Xh=cn[bi];L.update(Xh,En),L.bind(Xh,En)}}return En}function rS(y,U){y.ambientLightColor.needsUpdate=U,y.lightProbe.needsUpdate=U,y.directionalLights.needsUpdate=U,y.directionalLightShadows.needsUpdate=U,y.pointLights.needsUpdate=U,y.pointLightShadows.needsUpdate=U,y.spotLights.needsUpdate=U,y.spotLightShadows.needsUpdate=U,y.rectAreaLights.needsUpdate=U,y.hemisphereLights.needsUpdate=U}function sS(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(y,U,O){Te.get(y.texture).__webglTexture=U,Te.get(y.depthTexture).__webglTexture=O;const B=Te.get(y);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=O===void 0,B.__autoAllocateDepthBuffer||qe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(y,U){const O=Te.get(y);O.__webglFramebuffer=U,O.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(y,U=0,O=0){D=y,E=U,R=O;let B=!0,N=null,ee=!1,de=!1;if(y){const xe=Te.get(y);if(xe.__useDefaultFramebuffer!==void 0)Ee.bindFramebuffer(F.FRAMEBUFFER,null),B=!1;else if(xe.__webglFramebuffer===void 0)T.setupRenderTarget(y);else if(xe.__hasExternalTextures)T.rebindTextures(y,Te.get(y.texture).__webglTexture,Te.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const _e=y.depthTexture;if(xe.__boundDepthTexture!==_e){if(_e!==null&&Te.has(_e)&&(y.width!==_e.image.width||y.height!==_e.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(y)}}const Le=y.texture;(Le.isData3DTexture||Le.isDataArrayTexture||Le.isCompressedArrayTexture)&&(de=!0);const Fe=Te.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Fe[U])?N=Fe[U][O]:N=Fe[U],ee=!0):y.samples>0&&T.useMultisampledRTT(y)===!1?N=Te.get(y).__webglMultisampledFramebuffer:Array.isArray(Fe)?N=Fe[O]:N=Fe,C.copy(y.viewport),H.copy(y.scissor),z=y.scissorTest}else C.copy(be).multiplyScalar(V).floor(),H.copy(Ge).multiplyScalar(V).floor(),z=ot;if(Ee.bindFramebuffer(F.FRAMEBUFFER,N)&&B&&Ee.drawBuffers(y,N),Ee.viewport(C),Ee.scissor(H),Ee.setScissorTest(z),ee){const xe=Te.get(y.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+U,xe.__webglTexture,O)}else if(de){const xe=Te.get(y.texture),Le=U||0;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,xe.__webglTexture,O||0,Le)}M=-1},this.readRenderTargetPixels=function(y,U,O,B,N,ee,de){if(!(y&&y.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ve=Te.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&de!==void 0&&(ve=ve[de]),ve){Ee.bindFramebuffer(F.FRAMEBUFFER,ve);try{const xe=y.texture,Le=xe.format,Fe=xe.type;if(!Ye.textureFormatReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ye.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=y.width-B&&O>=0&&O<=y.height-N&&F.readPixels(U,O,B,N,Oe.convert(Le),Oe.convert(Fe),ee)}finally{const xe=D!==null?Te.get(D).__webglFramebuffer:null;Ee.bindFramebuffer(F.FRAMEBUFFER,xe)}}},this.readRenderTargetPixelsAsync=async function(y,U,O,B,N,ee,de){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ve=Te.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&de!==void 0&&(ve=ve[de]),ve){const xe=y.texture,Le=xe.format,Fe=xe.type;if(!Ye.textureFormatReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ye.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=y.width-B&&O>=0&&O<=y.height-N){Ee.bindFramebuffer(F.FRAMEBUFFER,ve);const _e=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,_e),F.bufferData(F.PIXEL_PACK_BUFFER,ee.byteLength,F.STREAM_READ),F.readPixels(U,O,B,N,Oe.convert(Le),Oe.convert(Fe),0);const Ze=D!==null?Te.get(D).__webglFramebuffer:null;Ee.bindFramebuffer(F.FRAMEBUFFER,Ze);const ct=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Kf(F,ct,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,_e),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,ee),F.deleteBuffer(_e),F.deleteSync(ct),ee}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(y,U=null,O=0){y.isTexture!==!0&&(Vr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,y=arguments[1]);const B=Math.pow(2,-O),N=Math.floor(y.image.width*B),ee=Math.floor(y.image.height*B),de=U!==null?U.x:0,ve=U!==null?U.y:0;T.setTexture2D(y,0),F.copyTexSubImage2D(F.TEXTURE_2D,O,0,0,de,ve,N,ee),Ee.unbindTexture()},this.copyTextureToTexture=function(y,U,O=null,B=null,N=0){y.isTexture!==!0&&(Vr("WebGLRenderer: copyTextureToTexture function signature has changed."),B=arguments[0]||null,y=arguments[1],U=arguments[2],N=arguments[3]||0,O=null);let ee,de,ve,xe,Le,Fe,_e,Ze,ct;const ht=y.isCompressedTexture?y.mipmaps[N]:y.image;O!==null?(ee=O.max.x-O.min.x,de=O.max.y-O.min.y,ve=O.isBox3?O.max.z-O.min.z:1,xe=O.min.x,Le=O.min.y,Fe=O.isBox3?O.min.z:0):(ee=ht.width,de=ht.height,ve=ht.depth||1,xe=0,Le=0,Fe=0),B!==null?(_e=B.x,Ze=B.y,ct=B.z):(_e=0,Ze=0,ct=0);const Xt=Oe.convert(U.format),Qe=Oe.convert(U.type);let Me;U.isData3DTexture?(T.setTexture3D(U,0),Me=F.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(T.setTexture2DArray(U,0),Me=F.TEXTURE_2D_ARRAY):(T.setTexture2D(U,0),Me=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,U.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,U.unpackAlignment);const ni=F.getParameter(F.UNPACK_ROW_LENGTH),et=F.getParameter(F.UNPACK_IMAGE_HEIGHT),En=F.getParameter(F.UNPACK_SKIP_PIXELS),Nr=F.getParameter(F.UNPACK_SKIP_ROWS),Jt=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,ht.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ht.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,xe),F.pixelStorei(F.UNPACK_SKIP_ROWS,Le),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Fe);const Ms=y.isDataArrayTexture||y.isData3DTexture,ft=U.isDataArrayTexture||U.isData3DTexture;if(y.isRenderTargetTexture||y.isDepthTexture){const Un=Te.get(y),bs=Te.get(U),cn=Te.get(Un.__renderTarget),bi=Te.get(bs.__renderTarget);Ee.bindFramebuffer(F.READ_FRAMEBUFFER,cn.__webglFramebuffer),Ee.bindFramebuffer(F.DRAW_FRAMEBUFFER,bi.__webglFramebuffer);for(let wi=0;wi<ve;wi++)Ms&&F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Te.get(y).__webglTexture,N,Fe+wi),y.isDepthTexture?(ft&&F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Te.get(U).__webglTexture,N,ct+wi),F.blitFramebuffer(xe,Le,ee,de,_e,Ze,ee,de,F.DEPTH_BUFFER_BIT,F.NEAREST)):ft?F.copyTexSubImage3D(Me,N,_e,Ze,ct+wi,xe,Le,ee,de):F.copyTexSubImage2D(Me,N,_e,Ze,ct+wi,xe,Le,ee,de);Ee.bindFramebuffer(F.READ_FRAMEBUFFER,null),Ee.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else ft?y.isDataTexture||y.isData3DTexture?F.texSubImage3D(Me,N,_e,Ze,ct,ee,de,ve,Xt,Qe,ht.data):U.isCompressedArrayTexture?F.compressedTexSubImage3D(Me,N,_e,Ze,ct,ee,de,ve,Xt,ht.data):F.texSubImage3D(Me,N,_e,Ze,ct,ee,de,ve,Xt,Qe,ht):y.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,N,_e,Ze,ee,de,Xt,Qe,ht.data):y.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,N,_e,Ze,ht.width,ht.height,Xt,ht.data):F.texSubImage2D(F.TEXTURE_2D,N,_e,Ze,ee,de,Xt,Qe,ht);F.pixelStorei(F.UNPACK_ROW_LENGTH,ni),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,et),F.pixelStorei(F.UNPACK_SKIP_PIXELS,En),F.pixelStorei(F.UNPACK_SKIP_ROWS,Nr),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Jt),N===0&&U.generateMipmaps&&F.generateMipmap(Me),Ee.unbindTexture()},this.copyTextureToTexture3D=function(y,U,O=null,B=null,N=0){return y.isTexture!==!0&&(Vr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),O=arguments[0]||null,B=arguments[1]||null,y=arguments[2],U=arguments[3],N=arguments[4]||0),Vr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(y,U,O,B,N)},this.initRenderTarget=function(y){Te.get(y).__webglFramebuffer===void 0&&T.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?T.setTextureCube(y,0):y.isData3DTexture?T.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?T.setTexture2DArray(y,0):T.setTexture2D(y,0),Ee.unbindTexture()},this.resetState=function(){E=0,R=0,D=null,Ee.reset(),lt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Hn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=We._getDrawingBufferColorSpace(e),t.unpackColorSpace=We._getUnpackColorSpace()}}class ll{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new se(e),this.density=t}clone(){return new ll(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Av extends ut{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new vn,this.environmentIntensity=1,this.environmentRotation=new vn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Rv{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ra,this.updateRanges=[],this.version=0,this.uuid=hn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=hn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=hn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const zt=new A;class cl{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyMatrix4(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.applyNormalMatrix(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)zt.fromBufferAttribute(this,t),zt.transformDirection(e),this.setXYZ(t,zt.x,zt.y,zt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=fn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=fn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=fn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=fn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=fn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array),s=tt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new gt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new cl(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const zu=new A,Hu=new Je,Gu=new Je,Cv=new A,Vu=new Ie,io=new A,ul=new An,Wu=new Ie,dl=new qr;class Pv extends Re{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=pc,this.bindMatrix=new Ie,this.bindMatrixInverse=new Ie,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new en),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,io),this.boundingBox.expandByPoint(io)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new An),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,io),this.boundingSphere.expandByPoint(io)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ul.copy(this.boundingSphere),ul.applyMatrix4(r),e.ray.intersectsSphere(ul)!==!1&&(Wu.copy(r).invert(),dl.copy(e.ray).applyMatrix4(Wu),!(this.boundingBox!==null&&dl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,dl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Je,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===pc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===yf?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,r=this.geometry;Hu.fromBufferAttribute(r.attributes.skinIndex,e),Gu.fromBufferAttribute(r.attributes.skinWeight,e),zu.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const o=Gu.getComponent(s);if(o!==0){const a=Hu.getComponent(s);Vu.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Cv.copy(zu).applyMatrix4(Vu),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Xu extends ut{constructor(){super(),this.isBone=!0,this.type="Bone"}}class qu extends Mt{constructor(e=null,t=1,n=1,r,s,o,a,l,c=kt,u=kt,d,h){super(null,o,a,l,c,u,r,s,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Yu=new Ie,Lv=new Ie;class hl{constructor(e=[],t=[]){this.uuid=hn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,r=this.bones.length;n<r;n++)this.boneInverses.push(new Ie)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ie;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:Lv;Yu.multiplyMatrices(a,t[s]),Yu.toArray(n,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new hl(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new qu(t,e,e,Qt,dn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){const s=e.bones[n];let o=t[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new Xu),this.bones.push(o),this.boneInverses.push(new Ie().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let r=0,s=t.length;r<s;r++){const o=t[r];e.bones.push(o.uuid);const a=n[r];e.boneInverses.push(a.toArray())}return e}}class fl extends gt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const vr=new Ie,ju=new Ie,ro=[],$u=new en,Iv=new Ie,Zr=new Re,Jr=new An;class Ku extends Re{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new fl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,Iv)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new en),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,vr),$u.copy(e.boundingBox).applyMatrix4(vr),this.boundingBox.union($u)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new An),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,vr),Jr.copy(e.boundingSphere).applyMatrix4(vr),this.boundingSphere.union(Jr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,o=e*s+1;for(let a=0;a<n.length;a++)n[a]=r[o+a]}raycast(e,t){const n=this.matrixWorld,r=this.count;if(Zr.geometry=this.geometry,Zr.material=this.material,Zr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Jr.copy(this.boundingSphere),Jr.applyMatrix4(n),e.ray.intersectsSphere(Jr)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,vr),ju.multiplyMatrices(n,vr),Zr.matrixWorld=ju,Zr.raycast(e,ro);for(let o=0,a=ro.length;o<a;o++){const l=ro[o];l.instanceId=s,l.object=this,t.push(l)}ro.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new fl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new qu(new Float32Array(r*this.count),r,this.count,$o,dn));const s=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Zu extends yn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const so=new A,oo=new A,Ju=new Ie,Qr=new qr,ao=new An,pl=new A,Qu=new A;class ml extends ut{constructor(e=new At,t=new Zu){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let r=1,s=t.count;r<s;r++)so.fromBufferAttribute(t,r-1),oo.fromBufferAttribute(t,r),n[r]=n[r-1],n[r]+=so.distanceTo(oo);e.setAttribute("lineDistance",new pt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ao.copy(n.boundingSphere),ao.applyMatrix4(r),ao.radius+=s,e.ray.intersectsSphere(ao)===!1)return;Ju.copy(r).invert(),Qr.copy(e.ray).applyMatrix4(Ju);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=c){const p=u.getX(v),b=u.getX(v+1),w=lo(this,e,Qr,l,p,b);w&&t.push(w)}if(this.isLineLoop){const v=u.getX(g-1),m=u.getX(f),p=lo(this,e,Qr,l,v,m);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=c){const p=lo(this,e,Qr,l,v,v+1);p&&t.push(p)}if(this.isLineLoop){const v=lo(this,e,Qr,l,g-1,f);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function lo(i,e,t,n,r,s){const o=i.geometry.attributes.position;if(so.fromBufferAttribute(o,r),oo.fromBufferAttribute(o,s),t.distanceSqToSegment(so,oo,pl,Qu)>n)return;pl.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(pl);if(!(l<e.near||l>e.far))return{distance:l,point:Qu.clone().applyMatrix4(i.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:i}}const ed=new A,td=new A;class Dv extends ml{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let r=0,s=t.count;r<s;r+=2)ed.fromBufferAttribute(t,r),td.fromBufferAttribute(t,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+ed.distanceTo(td);e.setAttribute("lineDistance",new pt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Uv extends ml{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class nd extends yn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const id=new Ie,gl=new qr,co=new An,uo=new A;class vl extends ut{constructor(e=new At,t=new nd){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),co.copy(n.boundingSphere),co.applyMatrix4(r),co.radius+=s,e.ray.intersectsSphere(co)===!1)return;id.copy(r).invert(),gl.copy(e.ray).applyMatrix4(id);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,d=n.attributes.position;if(c!==null){const h=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=h,v=f;g<v;g++){const m=c.getX(g);uo.fromBufferAttribute(d,m),rd(uo,m,l,r,e,t,this)}}else{const h=Math.max(0,o.start),f=Math.min(d.count,o.start+o.count);for(let g=h,v=f;g<v;g++)uo.fromBufferAttribute(d,g),rd(uo,g,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function rd(i,e,t,n,r,s,o){const a=gl.distanceSqToPoint(i);if(a<t){const l=new A;gl.closestPointToPoint(i,l),l.applyMatrix4(n);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class ho extends At{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);const s=[],o=[],a=[],l=[],c=new A,u=new we;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let d=0,h=3;d<=t;d++,h+=3){const f=n+d/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),u.x=(o[h]/e+1)/2,u.y=(o[h+1]/e+1)/2,l.push(u.x,u.y)}for(let d=1;d<=t;d++)s.push(d,d+1,0);this.setIndex(s),this.setAttribute("position",new pt(o,3)),this.setAttribute("normal",new pt(a,3)),this.setAttribute("uv",new pt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ho(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Cn extends At{constructor(e=1,t=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],d=[],h=[],f=[];let g=0;const v=[],m=n/2;let p=0;b(),o===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(u),this.setAttribute("position",new pt(d,3)),this.setAttribute("normal",new pt(h,3)),this.setAttribute("uv",new pt(f,2));function b(){const _=new A,I=new A;let E=0;const R=(t-e)/n;for(let D=0;D<=s;D++){const M=[],S=D/s,C=S*(t-e)+e;for(let H=0;H<=r;H++){const z=H/r,W=z*l+a,K=Math.sin(W),X=Math.cos(W);I.x=C*K,I.y=-S*n+m,I.z=C*X,d.push(I.x,I.y,I.z),_.set(K,R,X).normalize(),h.push(_.x,_.y,_.z),f.push(z,1-S),M.push(g++)}v.push(M)}for(let D=0;D<r;D++)for(let M=0;M<s;M++){const S=v[M][D],C=v[M+1][D],H=v[M+1][D+1],z=v[M][D+1];(e>0||M!==0)&&(u.push(S,C,z),E+=3),(t>0||M!==s-1)&&(u.push(C,H,z),E+=3)}c.addGroup(p,E,0),p+=E}function w(_){const I=g,E=new we,R=new A;let D=0;const M=_===!0?e:t,S=_===!0?1:-1;for(let H=1;H<=r;H++)d.push(0,m*S,0),h.push(0,S,0),f.push(.5,.5),g++;const C=g;for(let H=0;H<=r;H++){const W=H/r*l+a,K=Math.cos(W),X=Math.sin(W);R.x=M*X,R.y=m*S,R.z=M*K,d.push(R.x,R.y,R.z),h.push(0,S,0),E.x=K*.5+.5,E.y=X*.5*S+.5,f.push(E.x,E.y),g++}for(let H=0;H<r;H++){const z=I+H,W=C+H;_===!0?u.push(W,W+1,z):u.push(W+1,W,z),D+=3}c.addGroup(p,D,_===!0?1:2),p+=D}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class es extends Cn{constructor(e=1,t=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new es(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ni extends At{constructor(e=.5,t=1,n=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:o},n=Math.max(3,n),r=Math.max(1,r);const a=[],l=[],c=[],u=[];let d=e;const h=(t-e)/r,f=new A,g=new we;for(let v=0;v<=r;v++){for(let m=0;m<=n;m++){const p=s+m/n*o;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,u.push(g.x,g.y)}d+=h}for(let v=0;v<r;v++){const m=v*(n+1);for(let p=0;p<n;p++){const b=p+m,w=b,_=b+n+1,I=b+n+2,E=b+1;a.push(w,_,E),a.push(_,I,E)}}this.setIndex(a),this.setAttribute("position",new pt(l,3)),this.setAttribute("normal",new pt(c,3)),this.setAttribute("uv",new pt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ni(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class $n extends At{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],d=new A,h=new A,f=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){const b=[],w=p/n;let _=0;p===0&&o===0?_=.5/t:p===n&&l===Math.PI&&(_=-.5/t);for(let I=0;I<=t;I++){const E=I/t;d.x=-e*Math.cos(r+E*s)*Math.sin(o+w*a),d.y=e*Math.cos(o+w*a),d.z=e*Math.sin(r+E*s)*Math.sin(o+w*a),g.push(d.x,d.y,d.z),h.copy(d).normalize(),v.push(h.x,h.y,h.z),m.push(E+_,1-w),b.push(c++)}u.push(b)}for(let p=0;p<n;p++)for(let b=0;b<t;b++){const w=u[p][b+1],_=u[p][b],I=u[p+1][b],E=u[p+1][b+1];(p!==0||o>0)&&f.push(w,_,E),(p!==n-1||l<Math.PI)&&f.push(_,I,E)}this.setIndex(f),this.setAttribute("position",new pt(g,3)),this.setAttribute("normal",new pt(v,3)),this.setAttribute("uv",new pt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new $n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Mn extends yn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new se(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Aa,this.normalScale=new we(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Pn extends Mn{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new we(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Pt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new se(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new se(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new se(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class ts extends yn{static get type(){return"MeshLambertMaterial"}constructor(e){super(),this.isMeshLambertMaterial=!0,this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Aa,this.normalScale=new we(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new vn,this.combine=Vo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}function fo(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Nv(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Fv(i){function e(r,s){return i[r]-i[s]}const t=i.length,n=new Array(t);for(let r=0;r!==t;++r)n[r]=r;return n.sort(e),n}function sd(i,e,t){const n=i.length,r=new i.constructor(n);for(let s=0,o=0;o!==n;++s){const a=t[s]*e;for(let l=0;l!==e;++l)r[o++]=i[a+l]}return r}function od(i,e,t,n){let r=1,s=i[0];for(;s!==void 0&&s[n]===void 0;)s=i[r++];if(s===void 0)return;let o=s[n];if(o!==void 0)if(Array.isArray(o))do o=s[n],o!==void 0&&(e.push(s.time),t.push.apply(t,o)),s=i[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[n],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=i[r++];while(s!==void 0);else do o=s[n],o!==void 0&&(e.push(s.time),t.push(o)),s=i[r++];while(s!==void 0)}class ns{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(s=r,r=t[++n],e<r)break e}o=t.length;break t}if(!(e>=s)){const a=t[1];e<a&&(n=2,s=a);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=n[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class kv extends ns{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ec,endingEnd:Ec}}intervalChanged_(e,t,n){const r=this.parameterPositions;let s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ac:s=e,a=2*t-n;break;case Rc:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ac:o=e,l=2*n-t;break;case Rc:o=1,l=n+r[1]-r[0];break;default:o=e-1,l=t}const c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,g=(n-t)/(r-t),v=g*g,m=v*g,p=-h*m+2*h*v-h*g,b=(1+h)*m+(-1.5-2*h)*v+(-.5+h)*g+1,w=(-1-f)*m+(1.5+f)*v+.5*g,_=f*m-f*v;for(let I=0;I!==a;++I)s[I]=p*o[u+I]+b*o[c+I]+w*o[l+I]+_*o[d+I];return s}}class Ov extends ns{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,u=(n-t)/(r-t),d=1-u;for(let h=0;h!==a;++h)s[h]=o[c+h]*d+o[l+h]*u;return s}}class Bv extends ns{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}}class Ln{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=fo(t,this.TimeBufferType),this.values=fo(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:fo(e.times,Array),values:fo(e.values,Array)};const r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Bv(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ov(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new kv(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Or:t=this.InterpolantFactoryMethodDiscrete;break;case Br:t=this.InterpolantFactoryMethodLinear;break;case Ta:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Or;case this.InterpolantFactoryMethodLinear:return Br;case this.InterpolantFactoryMethodSmooth:return Ta}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){const n=this.times,r=n.length;let s=0,o=r-1;for(;s!==r&&n[s]<e;)++s;for(;o!==-1&&n[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=n.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&Nv(r))for(let a=0,l=r.length;a!==l;++a){const c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ta,s=e.length-1;let o=1;for(let a=1;a<s;++a){let l=!1;const c=e[a],u=e[a+1];if(c!==u&&(a!==1||c!==e[0]))if(r)l=!0;else{const d=a*n,h=d-n,f=d+n;for(let g=0;g!==n;++g){const v=t[d+g];if(v!==t[h+g]||v!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const d=a*n,h=o*n;for(let f=0;f!==n;++f)t[h+f]=t[d+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}}Ln.prototype.TimeBufferType=Float32Array,Ln.prototype.ValueBufferType=Float32Array,Ln.prototype.DefaultInterpolation=Br;class xr extends Ln{constructor(e,t,n){super(e,t,n)}}xr.prototype.ValueTypeName="bool",xr.prototype.ValueBufferType=Array,xr.prototype.DefaultInterpolation=Or,xr.prototype.InterpolantFactoryMethodLinear=void 0,xr.prototype.InterpolantFactoryMethodSmooth=void 0;class ad extends Ln{}ad.prototype.ValueTypeName="color";class _r extends Ln{}_r.prototype.ValueTypeName="number";class zv extends ns{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(r-t);let c=e*a;for(let u=c+a;c!==u;c+=4)li.slerpFlat(s,0,o,c-a,o,c,l);return s}}class yr extends Ln{InterpolantFactoryMethodLinear(e){return new zv(this.times,this.values,this.getValueSize(),e)}}yr.prototype.ValueTypeName="quaternion",yr.prototype.InterpolantFactoryMethodSmooth=void 0;class Sr extends Ln{constructor(e,t,n){super(e,t,n)}}Sr.prototype.ValueTypeName="string",Sr.prototype.ValueBufferType=Array,Sr.prototype.DefaultInterpolation=Or,Sr.prototype.InterpolantFactoryMethodLinear=void 0,Sr.prototype.InterpolantFactoryMethodSmooth=void 0;class Mr extends Ln{}Mr.prototype.ValueTypeName="vector";class Hv{constructor(e="",t=-1,n=[],r=Sf){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=hn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,r=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Vv(n[o]).scale(r));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,o=n.length;s!==o;++s)t.push(Ln.toJSON(n[s]));return r}static CreateFromMorphTargetSequence(e,t,n,r){const s=t.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);const u=Fv(l);l=sd(l,1,u),c=sd(c,1,u),!r&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new _r(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const r=e;n=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<n.length;r++)if(n[r].name===t)return n[r];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],u=c.name.match(s);if(u&&u.length>1){const d=u[1];let h=r[d];h||(r[d]=h=[]),h.push(c)}}const o=[];for(const a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(d,h,f,g,v){if(f.length!==0){const m=[],p=[];od(f,m,p,g),m.length!==0&&v.push(new d(h,m,p))}},r=[],s=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let d=0;d<c.length;d++){const h=c[d].keys;if(!(!h||h.length===0))if(h[0].morphTargets){const f={};let g;for(g=0;g<h.length;g++)if(h[g].morphTargets)for(let v=0;v<h[g].morphTargets.length;v++)f[h[g].morphTargets[v]]=-1;for(const v in f){const m=[],p=[];for(let b=0;b!==h[g].morphTargets.length;++b){const w=h[g];m.push(w.time),p.push(w.morphTarget===v?1:0)}r.push(new _r(".morphTargetInfluence["+v+"]",m,p))}l=f.length*o}else{const f=".bones["+t[d].name+"]";n(Mr,f+".position",h,"pos",r),n(yr,f+".quaternion",h,"rot",r),n(Mr,f+".scale",h,"scl",r)}}return r.length===0?null:new this(s,l,r,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,r=e.length;n!==r;++n){const s=this.tracks[n];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function Gv(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return _r;case"vector":case"vector2":case"vector3":case"vector4":return Mr;case"color":return ad;case"quaternion":return yr;case"bool":case"boolean":return xr;case"string":return Sr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Vv(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Gv(i.type);if(i.times===void 0){const t=[],n=[];od(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const gi={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class Wv{constructor(e,t,n){const r=this;let s=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(u){a++,s===!1&&r.onStart!==void 0&&r.onStart(u,o,a),s=!0},this.itemEnd=function(u){o++,r.onProgress!==void 0&&r.onProgress(u,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(u){r.onError!==void 0&&r.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){const d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){const f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return g}return null}}}const Xv=new Wv;class br{constructor(e){this.manager=e!==void 0?e:Xv,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}br.DEFAULT_MATERIAL_NAME="__DEFAULT";const Kn={};class qv extends Error{constructor(e,t){super(e),this.response=t}}class ld extends br{constructor(e){super(e)}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=gi.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(Kn[e]!==void 0){Kn[e].push({onLoad:t,onProgress:n,onError:r});return}Kn[e]=[],Kn[e].push({onLoad:t,onProgress:n,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const u=Kn[e],d=c.body.getReader(),h=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=h?parseInt(h):0,g=f!==0;let v=0;const m=new ReadableStream({start(p){b();function b(){d.read().then(({done:w,value:_})=>{if(w)p.close();else{v+=_.byteLength;const I=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let E=0,R=u.length;E<R;E++){const D=u[E];D.onProgress&&D.onProgress(I)}p.enqueue(_),b()}},w=>{p.error(w)})}}});return new Response(m)}else throw new qv(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return c.json();default:if(a===void 0)return c.text();{const d=/charset="?([^;"\s]*)"?/i.exec(a),h=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(h);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{gi.add(e,c);const u=Kn[e];delete Kn[e];for(let d=0,h=u.length;d<h;d++){const f=u[d];f.onLoad&&f.onLoad(c)}}).catch(c=>{const u=Kn[e];if(u===void 0)throw this.manager.itemError(e),c;delete Kn[e];for(let d=0,h=u.length;d<h;d++){const f=u[d];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class Yv extends br{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=gi.get(e);if(o!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o;const a=Gr("img");function l(){u(),gi.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(d){u(),r&&r(d),s.manager.itemError(e),s.manager.itemEnd(e)}function u(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),s.manager.itemStart(e),a.src=e,a}}class jv extends br{constructor(e){super(e)}load(e,t,n,r){const s=new Mt,o=new Yv(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},n,r),s}}class is extends ut{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new se(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class $v extends is{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.groundColor=new se(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const xl=new Ie,cd=new A,ud=new A;class _l{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new we(512,512),this.map=null,this.mapPass=null,this.matrix=new Ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ja,this._frameExtents=new we(1,1),this._viewportCount=1,this._viewports=[new Je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;cd.setFromMatrixPosition(e.matrixWorld),t.position.copy(cd),ud.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ud),t.updateMatrixWorld(),xl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(xl),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(xl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Kv extends _l{constructor(){super(new Ht(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=Qi*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(n!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=n,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Zv extends is{constructor(e,t,n=0,r=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.target=new ut,this.distance=n,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new Kv}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const dd=new Ie,rs=new A,yl=new A;class Jv extends _l{constructor(){super(new Ht(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new we(4,2),this._viewportCount=6,this._viewports=[new Je(2,1,1,1),new Je(0,1,1,1),new Je(3,1,1,1),new Je(1,1,1,1),new Je(3,0,1,1),new Je(1,0,1,1)],this._cubeDirections=[new A(1,0,0),new A(-1,0,0),new A(0,0,1),new A(0,0,-1),new A(0,1,0),new A(0,-1,0)],this._cubeUps=[new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,1,0),new A(0,0,1),new A(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),rs.setFromMatrixPosition(e.matrixWorld),n.position.copy(rs),yl.copy(n.position),yl.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(yl),n.updateMatrixWorld(),r.makeTranslation(-rs.x,-rs.y,-rs.z),dd.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(dd)}}class po extends is{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new Jv}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Qv extends _l{constructor(){super(new $r(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class mo extends is{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ut.DEFAULT_UP),this.updateMatrix(),this.target=new ut,this.shadow=new Qv}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class ex extends is{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class ss{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,r=e.length;n<r;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class tx extends br{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=gi.get(e);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{r&&r(c)});return}return setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return gi.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){r&&r(c),gi.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});gi.add(e,l),s.manager.itemStart(e)}}class nx{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=hd(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=hd();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function hd(){return performance.now()}const Sl="\\[\\]\\.:\\/",ix=new RegExp("["+Sl+"]","g"),Ml="[^"+Sl+"]",rx="[^"+Sl.replace("\\.","")+"]",sx=/((?:WC+[\/:])*)/.source.replace("WC",Ml),ox=/(WCOD+)?/.source.replace("WCOD",rx),ax=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ml),lx=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ml),cx=new RegExp("^"+sx+ox+ax+lx+"$"),ux=["material","materials","bones","map"];class dx{constructor(e,t,n){const r=n||nt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class nt{constructor(e,t,n){this.path=t,this.parsedPath=n||nt.parseTrackName(t),this.node=nt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new nt.Composite(e,t,n):new nt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(ix,"")}static parseTrackName(e){const t=cx.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=n.nodeName.substring(r+1);ux.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(s){for(let o=0;o<s.length;o++){const a=s[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,r=t.propertyName;let s=t.propertyIndex;if(e||(e=nt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[r];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}nt.Composite=dx,nt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},nt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},nt.prototype.GetterByBindingType=[nt.prototype._getValue_direct,nt.prototype._getValue_array,nt.prototype._getValue_arrayElement,nt.prototype._getValue_toArray],nt.prototype.SetterByBindingTypeAndVersioning=[[nt.prototype._setValue_direct,nt.prototype._setValue_direct_setNeedsUpdate,nt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_array,nt.prototype._setValue_array_setNeedsUpdate,nt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_arrayElement,nt.prototype._setValue_arrayElement_setNeedsUpdate,nt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_fromArray,nt.prototype._setValue_fromArray_setNeedsUpdate,nt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const fd=new Ie;class hx{constructor(e,t,n=0,r=1/0){this.ray=new qr(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Ba,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return fd.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(fd),this}intersectObject(e,t=!0,n=[]){return bl(e,this,n,t),n.sort(pd),n}intersectObjects(e,t=!0,n=[]){for(let r=0,s=e.length;r<s;r++)bl(e[r],this,n,t);return n.sort(pd),n}}function pd(i,e){return i.distance-e.distance}function bl(i,e,t,n){let r=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(r=!1),r===!0&&n===!0){const s=i.children;for(let o=0,a=s.length;o<a;o++)bl(s[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:un}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=un);const md={easy:{label:"Easy",emoji:"🟢",startGold:600,startLives:30,enemyHpMult:.75,enemySpeedMult:.9,goldMult:1.2},normal:{label:"Normal",emoji:"🟡",startGold:400,startLives:20,enemyHpMult:1,enemySpeedMult:1,goldMult:1},hard:{label:"Hard",emoji:"🔴",startGold:250,startLives:10,enemyHpMult:1.4,enemySpeedMult:1.15,goldMult:.8}};function wl(i,e){return`${i},${e}`}const fx={cols:20,rows:12,cellSize:1,origin:{x:-10,z:-6},path:[[0,5],[1,5],[2,5],[3,5],[3,6],[3,7],[4,7],[5,7],[6,7],[7,7],[7,6],[7,5],[7,4],[8,4],[9,4],[10,4],[11,4],[11,5],[11,6],[11,7],[12,7],[13,7],[14,7],[15,7],[15,6],[15,5],[15,4],[16,4],[17,4],[18,4],[19,4]],spawnCell:[0,5],goalCell:[19,4]},px={arrow:{name:"Arrow",damageType:"physical",levels:[{buildCost:80,upgradeCost:0,damage:18,cooldownSec:.6,range:3.5,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:30,cooldownSec:.5,range:4,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:50,cooldownSec:.4,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"arrow_rapid",name:"Rapid Arrow",cost:250,desc:"Insane ATK SPD"},{type:"arrow_pierce",name:"Piercing Arrow",cost:250,desc:"Chain ×4"}]},cannon:{name:"Cannon",damageType:"physical",levels:[{buildCost:120,upgradeCost:0,damage:40,cooldownSec:2,range:3,slow:null,aoeRadius:1.2,dot:null,chain:null},{buildCost:0,upgradeCost:100,damage:65,cooldownSec:1.8,range:3.5,slow:null,aoeRadius:1.5,dot:null,chain:null},{buildCost:0,upgradeCost:180,damage:100,cooldownSec:1.5,range:4,slow:null,aoeRadius:1.8,dot:null,chain:null}],evolutions:[{type:"cannon_siege",name:"Siege Mortar",cost:400,desc:"射程＋範圍再大一截"}]},cannon_siege:{name:"Siege Mortar",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:150,cooldownSec:1.2,range:4.5,slow:null,aoeRadius:2.52,dot:null,chain:null}],evolutions:[]},ice:{name:"Ice",damageType:"ice",levels:[{buildCost:80,upgradeCost:0,damage:8,cooldownSec:1.2,range:3,slow:{pct:.3,durationSec:2},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:14,cooldownSec:1,range:3.5,slow:{pct:.4,durationSec:2.5},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:22,cooldownSec:.8,range:4,slow:{pct:.5,durationSec:3},aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"ice_glacier",name:"Glacier Spire",cost:280,desc:"減速更狠，兼範圍凍"}]},ice_glacier:{name:"Glacier Spire",damageType:"ice",levels:[{buildCost:0,upgradeCost:0,damage:33,cooldownSec:.64,range:4.5,slow:{pct:.65,durationSec:4},aoeRadius:0,dot:null,chain:null}],evolutions:[]},fire:{name:"Fire",damageType:"fire",levels:[{buildCost:100,upgradeCost:0,damage:12,cooldownSec:1,range:3,slow:null,aoeRadius:0,dot:{dps:10,durationSec:3},chain:null},{buildCost:0,upgradeCost:90,damage:20,cooldownSec:.9,range:3.5,slow:null,aoeRadius:0,dot:{dps:16,durationSec:3},chain:null},{buildCost:0,upgradeCost:160,damage:32,cooldownSec:.8,range:4,slow:null,aoeRadius:0,dot:{dps:24,durationSec:3.5},chain:null}],evolutions:[{type:"fire_inferno",name:"Inferno Brazier",cost:350,desc:"燒傷 dps 翻倍"}]},fire_inferno:{name:"Inferno Brazier",damageType:"fire",levels:[{buildCost:0,upgradeCost:0,damage:48,cooldownSec:.64,range:4.5,slow:null,aoeRadius:0,dot:{dps:48,durationSec:3.5},chain:null}],evolutions:[]},lightning:{name:"Lightning",damageType:"lightning",levels:[{buildCost:110,upgradeCost:0,damage:15,cooldownSec:1.2,range:3.5,slow:null,aoeRadius:0,dot:null,chain:{targets:2,rangeFalloff:2}},{buildCost:0,upgradeCost:100,damage:25,cooldownSec:1,range:4,slow:null,aoeRadius:0,dot:null,chain:{targets:3,rangeFalloff:2.5}},{buildCost:0,upgradeCost:170,damage:40,cooldownSec:.8,range:4.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}}],evolutions:[{type:"lightning_storm",name:"Storm Coil",cost:380,desc:"Chain ×5"}]},lightning_storm:{name:"Storm Coil",damageType:"lightning",levels:[{buildCost:0,upgradeCost:0,damage:60,cooldownSec:.64,range:5,slow:null,aoeRadius:0,dot:null,chain:{targets:5,rangeFalloff:3}}],evolutions:[]},poison:{name:"Poison",damageType:"poison",levels:[{buildCost:100,upgradeCost:0,damage:5,cooldownSec:1.5,range:3,slow:null,aoeRadius:1.5,dot:{dps:8,durationSec:4},chain:null},{buildCost:0,upgradeCost:90,damage:8,cooldownSec:1.3,range:3.5,slow:null,aoeRadius:1.8,dot:{dps:12,durationSec:4},chain:null},{buildCost:0,upgradeCost:160,damage:14,cooldownSec:1,range:4,slow:null,aoeRadius:2,dot:{dps:18,durationSec:5},chain:null}],evolutions:[{type:"poison_plague",name:"Plague Still",cost:350,desc:"毒霧範圍大一倍"}]},poison_plague:{name:"Plague Still",damageType:"poison",levels:[{buildCost:0,upgradeCost:0,damage:21,cooldownSec:.8,range:4.5,slow:null,aoeRadius:4,dot:{dps:36,durationSec:5},chain:null}],evolutions:[]},sniper:{name:"Sniper",damageType:"sniper",levels:[{buildCost:150,upgradeCost:0,damage:100,cooldownSec:2.8,range:7,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:175,cooldownSec:2.3,range:8,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:220,damage:280,cooldownSec:1.8,range:9,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"sniper_railgun",name:"Railgun Nest",cost:500,desc:"單發傷害再上一級"}]},sniper_railgun:{name:"Railgun Nest",damageType:"sniper",levels:[{buildCost:0,upgradeCost:0,damage:420,cooldownSec:1.44,range:9.5,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[]},arrow_rapid:{name:"Rapid Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:35,cooldownSec:.15,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null}]},arrow_pierce:{name:"Piercing Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:90,cooldownSec:.5,range:5.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}}]}},mx={grunt:{name:"Grunt",hp:60,speed:1,bounty:8,weakness:["physical"],resistance:[],armor:0,shield:0,special:"none"},tank:{name:"Tank",hp:280,speed:.5,bounty:18,weakness:["fire"],resistance:["physical"],armor:8,shield:0,special:"none"},runner:{name:"Runner",hp:80,speed:1.6,bounty:10,weakness:["ice"],resistance:["physical"],armor:0,shield:0,special:"none"},swarm:{name:"Swarm",hp:25,speed:1.2,bounty:3,weakness:["lightning"],resistance:["sniper"],armor:0,shield:0,special:"none"},shield:{name:"Shield",hp:100,speed:.8,bounty:14,weakness:["fire"],resistance:["ice"],armor:0,shield:80,special:"none"},healer:{name:"Healer",hp:90,speed:.7,bounty:16,weakness:["poison"],resistance:[],armor:0,shield:0,special:"heal",healRadius:2.5,healAmount:15,healIntervalSec:2},boss:{name:"Boss",hp:1200,speed:.4,bounty:120,weakness:["sniper"],resistance:["physical","ice","poison"],armor:12,shield:0,special:"none"}},gx={prepSec:8,waves:JSON.parse('[{"groups":[{"type":"grunt","count":13,"intervalSec":0.8},{"type":"runner","count":6,"intervalSec":0.8}]},{"groups":[{"type":"runner","count":11,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"grunt","count":20,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"runner","count":16,"intervalSec":0.78}]},{"groups":[{"type":"runner","count":15,"intervalSec":0.78},{"type":"runner","count":6,"intervalSec":0.78},{"type":"runner","count":11,"intervalSec":0.78}]},{"groups":[{"type":"grunt","count":24,"intervalSec":0.77},{"type":"runner","count":16,"intervalSec":0.77},{"type":"grunt","count":10,"intervalSec":0.77}]},{"groups":[{"type":"runner","count":23,"intervalSec":0.77}]},{"groups":[{"type":"grunt","count":14,"intervalSec":0.76},{"type":"grunt","count":26,"intervalSec":0.76},{"type":"grunt","count":13,"intervalSec":0.76}]},{"groups":[{"type":"grunt","count":31,"intervalSec":0.76}]},{"groups":[{"type":"boss","count":1,"intervalSec":1},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":38,"intervalSec":0.38},{"type":"runner","count":9,"intervalSec":0.74},{"type":"runner","count":17,"intervalSec":0.74}]},{"groups":[{"type":"swarm","count":70,"intervalSec":0.38}]},{"groups":[{"type":"grunt","count":16,"intervalSec":0.74},{"type":"tank","count":3,"intervalSec":1.87}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.37},{"type":"runner","count":10,"intervalSec":0.73},{"type":"grunt","count":18,"intervalSec":0.73}]},{"groups":[{"type":"runner","count":21,"intervalSec":0.73}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.84},{"type":"swarm","count":40,"intervalSec":0.37},{"type":"tank","count":4,"intervalSec":1.84}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.72},{"type":"swarm","count":39,"intervalSec":0.37},{"type":"swarm","count":45,"intervalSec":0.37}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.71},{"type":"grunt","count":22,"intervalSec":0.71},{"type":"grunt","count":26,"intervalSec":0.71}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.81},{"type":"swarm","count":37,"intervalSec":0.36},{"type":"swarm","count":35,"intervalSec":0.36}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5}]},{"groups":[{"type":"grunt","count":24,"intervalSec":0.7},{"type":"runner","count":13,"intervalSec":0.7}]},{"groups":[{"type":"shield","count":9,"intervalSec":1.58},{"type":"runner","count":20,"intervalSec":0.69}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.77},{"type":"runner","count":19,"intervalSec":0.69},{"type":"grunt","count":24,"intervalSec":0.69}]},{"groups":[{"type":"grunt","count":51,"intervalSec":0.68}]},{"groups":[{"type":"swarm","count":44,"intervalSec":0.35},{"type":"swarm","count":35,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.68}]},{"groups":[{"type":"tank","count":10,"intervalSec":1.74},{"type":"grunt","count":19,"intervalSec":0.67}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.67},{"type":"tank","count":8,"intervalSec":1.73}]},{"groups":[{"type":"shield","count":14,"intervalSec":1.52},{"type":"swarm","count":47,"intervalSec":0.34},{"type":"shield","count":6,"intervalSec":1.52}]},{"groups":[{"type":"shield","count":12,"intervalSec":1.51},{"type":"swarm","count":48,"intervalSec":0.34}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.69}]},{"groups":[{"type":"runner","count":25,"intervalSec":0.64},{"type":"healer","count":5,"intervalSec":3.36}]},{"groups":[{"type":"tank","count":7,"intervalSec":1.67},{"type":"swarm","count":37,"intervalSec":0.33},{"type":"grunt","count":23,"intervalSec":0.64}]},{"groups":[{"type":"shield","count":24,"intervalSec":1.46}]},{"groups":[{"type":"swarm","count":38,"intervalSec":0.33},{"type":"runner","count":18,"intervalSec":0.62}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.62},{"type":"shield","count":8,"intervalSec":1.44},{"type":"swarm","count":39,"intervalSec":0.33}]},{"groups":[{"type":"healer","count":5,"intervalSec":3.26},{"type":"grunt","count":32,"intervalSec":0.61}]},{"groups":[{"type":"healer","count":27,"intervalSec":3.24}]},{"groups":[{"type":"tank","count":6,"intervalSec":1.61},{"type":"runner","count":12,"intervalSec":0.6}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":9,"intervalSec":3.18},{"type":"healer","count":5,"intervalSec":3.18},{"type":"healer","count":9,"intervalSec":3.18}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.58},{"type":"shield","count":7,"intervalSec":1.38},{"type":"runner","count":23,"intervalSec":0.59}]},{"groups":[{"type":"runner","count":17,"intervalSec":0.59},{"type":"shield","count":11,"intervalSec":1.37},{"type":"tank","count":7,"intervalSec":1.57},{"type":"healer","count":5,"intervalSec":3.14}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.58},{"type":"swarm","count":55,"intervalSec":0.31}]},{"groups":[{"type":"healer","count":4,"intervalSec":3.1},{"type":"runner","count":23,"intervalSec":0.58},{"type":"runner","count":21,"intervalSec":0.58}]},{"groups":[{"type":"runner","count":16,"intervalSec":0.57},{"type":"runner","count":20,"intervalSec":0.57}]},{"groups":[{"type":"healer","count":6,"intervalSec":3.06},{"type":"tank","count":9,"intervalSec":1.53}]},{"groups":[{"type":"healer","count":3,"intervalSec":3.04},{"type":"shield","count":9,"intervalSec":1.32},{"type":"swarm","count":52,"intervalSec":0.3},{"type":"shield","count":12,"intervalSec":1.32}]},{"groups":[{"type":"shield","count":11,"intervalSec":1.31},{"type":"swarm","count":43,"intervalSec":0.3},{"type":"grunt","count":25,"intervalSec":0.56}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.49},{"type":"shield","count":13,"intervalSec":1.29},{"type":"swarm","count":64,"intervalSec":0.3}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.3},{"type":"runner","count":22,"intervalSec":0.54},{"type":"tank","count":7,"intervalSec":1.48}]},{"groups":[{"type":"grunt","count":35,"intervalSec":0.54},{"type":"swarm","count":65,"intervalSec":0.29}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"swarm","count":66,"intervalSec":0.29},{"type":"grunt","count":27,"intervalSec":0.53}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"tank","count":10,"intervalSec":1.45}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.44},{"type":"swarm","count":56,"intervalSec":0.29}]},{"groups":[{"type":"grunt","count":27,"intervalSec":0.52},{"type":"swarm","count":62,"intervalSec":0.29},{"type":"tank","count":8,"intervalSec":1.43}]},{"groups":[{"type":"runner","count":20,"intervalSec":0.51},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"grunt","count":36,"intervalSec":0.51}]},{"groups":[{"type":"runner","count":26,"intervalSec":0.51},{"type":"healer","count":3,"intervalSec":2.82},{"type":"runner","count":25,"intervalSec":0.51}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":4,"intervalSec":2.78},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"shield","count":8,"intervalSec":1.19},{"type":"shield","count":14,"intervalSec":1.19}]},{"groups":[{"type":"healer","count":5,"intervalSec":2.76},{"type":"healer","count":8,"intervalSec":2.76},{"type":"swarm","count":75,"intervalSec":0.28}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.37},{"type":"shield","count":13,"intervalSec":1.17}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.36},{"type":"swarm","count":59,"intervalSec":0.27},{"type":"shield","count":10,"intervalSec":1.16},{"type":"grunt","count":33,"intervalSec":0.48}]},{"groups":[{"type":"grunt","count":37,"intervalSec":0.48},{"type":"tank","count":9,"intervalSec":1.35}]},{"groups":[{"type":"grunt","count":44,"intervalSec":0.47},{"type":"swarm","count":69,"intervalSec":0.27},{"type":"healer","count":7,"intervalSec":2.68},{"type":"shield","count":14,"intervalSec":1.14}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.33},{"type":"shield","count":13,"intervalSec":1.13},{"type":"grunt","count":38,"intervalSec":0.47}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.46},{"type":"shield","count":13,"intervalSec":1.12},{"type":"shield","count":12,"intervalSec":1.12},{"type":"healer","count":7,"intervalSec":2.64}]},{"groups":[{"type":"healer","count":7,"intervalSec":2.62},{"type":"tank","count":12,"intervalSec":1.31}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5}]},{"groups":[{"type":"healer","count":14,"intervalSec":2.58},{"type":"healer","count":11,"intervalSec":2.58},{"type":"healer","count":16,"intervalSec":2.58}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.28},{"type":"shield","count":14,"intervalSec":1.08},{"type":"grunt","count":42,"intervalSec":0.44}]},{"groups":[{"type":"shield","count":14,"intervalSec":1.07},{"type":"grunt","count":42,"intervalSec":0.44},{"type":"shield","count":12,"intervalSec":1.07}]},{"groups":[{"type":"swarm","count":70,"intervalSec":0.25},{"type":"grunt","count":36,"intervalSec":0.43},{"type":"tank","count":9,"intervalSec":1.26},{"type":"runner","count":22,"intervalSec":0.43},{"type":"shield","count":11,"intervalSec":1.06}]},{"groups":[{"type":"swarm","count":55,"intervalSec":0.25},{"type":"runner","count":27,"intervalSec":0.43},{"type":"runner","count":21,"intervalSec":0.43}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.42},{"type":"shield","count":14,"intervalSec":1.04},{"type":"shield","count":9,"intervalSec":1.04},{"type":"shield","count":14,"intervalSec":1.04}]},{"groups":[{"type":"runner","count":21,"intervalSec":0.42},{"type":"tank","count":15,"intervalSec":1.23},{"type":"shield","count":13,"intervalSec":1.03},{"type":"grunt","count":34,"intervalSec":0.42}]},{"groups":[{"type":"shield","count":15,"intervalSec":1.02},{"type":"healer","count":7,"intervalSec":2.44},{"type":"runner","count":20,"intervalSec":0.41},{"type":"shield","count":15,"intervalSec":1.02},{"type":"grunt","count":40,"intervalSec":0.41}]},{"groups":[{"type":"grunt","count":39,"intervalSec":0.41},{"type":"runner","count":20,"intervalSec":0.41},{"type":"grunt","count":33,"intervalSec":0.41}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.24},{"type":"runner","count":28,"intervalSec":0.4},{"type":"grunt","count":43,"intervalSec":0.4},{"type":"shield","count":16,"intervalSec":1}]},{"groups":[{"type":"swarm","count":72,"intervalSec":0.24},{"type":"tank","count":13,"intervalSec":1.18},{"type":"runner","count":25,"intervalSec":0.4},{"type":"shield","count":13,"intervalSec":1},{"type":"shield","count":14,"intervalSec":1}]},{"groups":[{"type":"swarm","count":74,"intervalSec":0.23},{"type":"swarm","count":70,"intervalSec":0.23},{"type":"swarm","count":62,"intervalSec":0.23},{"type":"runner","count":23,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":79,"intervalSec":0.23},{"type":"swarm","count":67,"intervalSec":0.23},{"type":"runner","count":30,"intervalSec":0.4},{"type":"grunt","count":49,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":104,"intervalSec":0.23},{"type":"swarm","count":93,"intervalSec":0.23},{"type":"healer","count":8,"intervalSec":2.3}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.23},{"type":"runner","count":27,"intervalSec":0.4},{"type":"healer","count":7,"intervalSec":2.28},{"type":"runner","count":28,"intervalSec":0.4}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.4},{"type":"runner","count":22,"intervalSec":0.4},{"type":"swarm","count":64,"intervalSec":0.23},{"type":"grunt","count":47,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.26}]},{"groups":[{"type":"shield","count":15,"intervalSec":1},{"type":"tank","count":10,"intervalSec":1.12},{"type":"healer","count":6,"intervalSec":2.24},{"type":"shield","count":13,"intervalSec":1}]},{"groups":[{"type":"healer","count":7,"intervalSec":2.22},{"type":"swarm","count":75,"intervalSec":0.22},{"type":"healer","count":7,"intervalSec":2.22},{"type":"runner","count":25,"intervalSec":0.4}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.22},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"shield","count":17,"intervalSec":1},{"type":"grunt","count":45,"intervalSec":0.4}]},{"groups":[{"type":"tank","count":17,"intervalSec":1.08},{"type":"runner","count":27,"intervalSec":0.4},{"type":"tank","count":12,"intervalSec":1.08}]},{"groups":[{"type":"swarm","count":64,"intervalSec":0.21},{"type":"tank","count":17,"intervalSec":1.07},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":73,"intervalSec":0.21}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.12},{"type":"healer","count":8,"intervalSec":2.12},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"swarm","count":83,"intervalSec":0.21},{"type":"tank","count":16,"intervalSec":1.06}]},{"groups":[{"type":"runner","count":32,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.1},{"type":"swarm","count":84,"intervalSec":0.21},{"type":"runner","count":26,"intervalSec":0.4},{"type":"shield","count":11,"intervalSec":1}]},{"groups":[{"type":"grunt","count":43,"intervalSec":0.4},{"type":"runner","count":32,"intervalSec":0.4},{"type":"shield","count":18,"intervalSec":1}]},{"groups":[{"type":"swarm","count":86,"intervalSec":0.21},{"type":"healer","count":5,"intervalSec":2.06},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":69,"intervalSec":0.21},{"type":"grunt","count":42,"intervalSec":0.4}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.04},{"type":"grunt","count":44,"intervalSec":0.4},{"type":"tank","count":14,"intervalSec":1.02},{"type":"runner","count":31,"intervalSec":0.4},{"type":"swarm","count":86,"intervalSec":0.2}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":5,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":3,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":8,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"shield","count":6,"intervalSec":1.5},{"type":"healer","count":7,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"shield","count":7,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"healer","count":3,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5},{"type":"tank","count":8,"intervalSec":1.5},{"type":"healer","count":6,"intervalSec":1.5}]}]')},vx={ranks:[{name:"S",min:18e3},{name:"A",min:12e3},{name:"B",min:6e3},{name:"C",min:0}]},ie=fx,nn=px,os=mx,Gt=gx,xx=vx,In=1/20,gd=.7,as=12,$t=()=>typeof window>"u"?!1:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<768;let vd=.04,xd=.0016;const _x=45,yx=(i,e)=>{vd=i,xd=e},ze={isMobile:$t(),maxParticles:$t()?200:800,enablePostProcessing:!$t(),enableShadows:!$t(),pixelRatio:$t()?1:Math.min(window.devicePixelRatio,2),terrain:{underlayPadding:$t()?12:18,underlaySegments:$t()?36:72},atmosphere:{fogColor:1057815,fogDensity:$t()?.011:.014,spawnPulseSpeed:2.4,goalPulseSpeed:1.7,bloomStrength:$t()?.38:.62,bloomRadius:$t()?.28:.45,bloomThreshold:$t()?.9:.82,vignetteStrength:$t()?.1:.16,grainAmount:$t()?0:.018}};function Rt(i,e){return{x:ie.origin.x+(i+.5)*ie.cellSize,z:ie.origin.z+(e+.5)*ie.cellSize}}function Sx(){return ie.path.map(([i,e])=>Rt(i,e))}function Mx(i,e){const t=i.x-e.x,n=i.z-e.z;return Math.sqrt(t*t+n*n)}function bx(){return[{name:"Airstrike",emoji:"✈️",cooldown:60,remaining:0,description:"All enemies take 200 AOE damage"},{name:"Freeze",emoji:"🧊",cooldown:45,remaining:0,description:"Freeze all enemies for 5s"},{name:"Repair",emoji:"💖",cooldown:90,remaining:0,description:"Restore 5 lives"}]}function wx(){return{totalDamageDealt:0,damageByType:{},killsByTower:{},longestStreak:0,towersBuilt:0,towersSold:0,goldEarned:0,goldSpent:0}}function Tl(i="normal"){const e=Sx(),t=new Set;for(const[r,s]of ie.path)t.add(wl(r,s));const n=md[i];return{phase:"idle",gold:n.startGold,lives:n.startLives,maxLives:n.startLives,currentWave:0,score:0,perfectWaves:0,speedMultiplier:1,paused:!1,totalKills:0,difficulty:i,towers:[],enemies:[],projectiles:[],prepTimer:0,spawnTimers:[],spawnCounts:[],waveEnemiesSpawned:0,waveEnemiesTotal:0,waveLivesLostThisWave:0,lastWaveClearGold:0,milestoneReached:0,waveModifier:null,buffGoldMult:1,buffDamageMult:1,buffRangeMult:1,buffChoicePending:!1,endlessMode:!1,nextId:1,killStreak:0,killStreakTimer:0,floatingTexts:[],skills:bx(),stats:wx(),pathWorld:e,occupiedCells:new Set,pathCells:t}}function _d(i){i.occupiedCells.clear();for(const e of i.towers)i.occupiedCells.add(wl(e.col,e.row))}class Tx{constructor(){J(this,"listeners",new Map)}on(e,t){this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t)}off(e,t){const n=this.listeners.get(e);if(!n)return;const r=n.indexOf(t);r>=0&&n.splice(r,1)}emit(e){const t=this.listeners.get(e.type);if(t)for(const n of t)n(e)}clear(){this.listeners.clear()}}const Xe=new Tx,go={BLITZ:{key:"BLITZ",label:"BLITZ",emoji:"⚡",desc:"+25% SPD, +30% gold",spdMult:1.25,hpMult:1,armorBonus:0,bountyMult:1.3},ARMORED:{key:"ARMORED",label:"ARMORED",emoji:"🛡",desc:"+3 armor, +20% gold",spdMult:1,hpMult:1,armorBonus:3,bountyMult:1.2},FRENZY:{key:"FRENZY",label:"FRENZY",emoji:"🔥",desc:"+15% HP, +15% SPD, +25% gold",spdMult:1.15,hpMult:1.15,armorBonus:0,bountyMult:1.25}},yd=Object.keys(go);function Ex(i){return i%5!==0||i===25||i===50||i===75||i===99?null:yd[Math.floor(Math.random()*yd.length)]}function El(i){if(i.currentWave<Gt.waves.length)return i.currentWave;const e=Math.max(1,Gt.waves.length-40);return 40+(i.currentWave-Gt.waves.length)%e}function Al(i){if(i.currentWave>=Gt.waves.length&&!i.endlessMode)return;i.phase="prep",i.prepTimer=Gt.prepSec,i.waveLivesLostThisWave=0;const e=Gt.waves[El(i)];i.spawnTimers=e.groups.map(()=>0),i.spawnCounts=e.groups.map(()=>0),i.waveEnemiesSpawned=0,i.waveEnemiesTotal=e.groups.reduce((t,n)=>t+n.count,0),i.waveModifier=Ex(i.currentWave+1)}function Sd(i,e){if(i.phase==="prep"){if(i.prepTimer-=e,i.prepTimer<=0){const s=Math.min(150,Math.max(10,Math.floor(i.gold*.01)));i.gold+=s,i.stats.goldEarned+=s,i.floatingTexts.push({id:i.nextId++,worldX:0,worldZ:0,value:`+${s}g 利息`,color:"#aaff55",life:2,maxLife:2}),i.phase="wave"}i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));return}if(i.phase!=="wave")return;i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));const t=Gt.waves[El(i)];if(!t)return;for(let s=0;s<t.groups.length;s++){const o=t.groups[s];i.spawnCounts[s]>=o.count||(i.spawnTimers[s]-=e,i.spawnTimers[s]<=0&&(Md(i,o.type),i.spawnCounts[s]++,i.waveEnemiesSpawned++,i.spawnTimers[s]=o.intervalSec))}const n=i.waveEnemiesSpawned>=i.waveEnemiesTotal,r=i.enemies.every(s=>!s.alive||s.reached);if(n&&r){i.score+=i.currentWave<Gt.waves.length?100:0,i.waveLivesLostThisWave===0&&(i.score+=150,i.perfectWaves++);const s=i.currentWave+1;let o=100;s>60?o=250:s>30?o=200:s>10?o=150:o=120,i.gold+=o,i.stats.goldEarned+=o,i.lastWaveClearGold=o;const a=i.waveLivesLostThisWave===0;Xe.emit({type:"waveCleared",wave:s,goldBonus:o,perfect:a}),s===99||s>0&&s%25===0?(i.gold+=500,i.stats.goldEarned+=500,i.milestoneReached=s,Xe.emit({type:"milestone",wave:s})):i.milestoneReached=0,i.currentWave++,i.enemies=i.enemies.filter(c=>c.alive&&!c.reached),i.projectiles=i.projectiles.filter(c=>c.alive),i.currentWave>=Gt.waves.length&&!i.endlessMode?(i.score+=i.lives*25,i.phase="won",Xe.emit({type:"gameOver",won:!0,score:i.score})):Al(i)}}function Md(i,e){const t=os[e],n=Rt(ie.path[0][0],ie.path[0][1]),r=md[i.difficulty],s=i.currentWave,o=Math.min(s,_x),a=1+s*vd+xd*o*o,l=i.waveModifier?go[i.waveModifier]:null,c=a*r.enemyHpMult*((l==null?void 0:l.hpMult)??1),u=r.enemySpeedMult*((l==null?void 0:l.spdMult)??1),d=Math.pow(a,.5)*r.goldMult*((l==null?void 0:l.bountyMult)??1),h=(l==null?void 0:l.armorBonus)??0,f={id:i.nextId++,type:e,hp:Math.ceil(t.hp*c),maxHp:Math.ceil(t.hp*c),speed:t.speed*u,bounty:Math.ceil(t.bounty*d),pathIndex:0,pathProgress:0,worldX:n.x,worldZ:n.z,prevWorldX:n.x,prevWorldZ:n.z,alive:!0,reached:!1,slow:null,dots:[],shield:t.shield?Math.ceil(t.shield*c):0,maxShield:t.shield?Math.ceil(t.shield*c):0,armor:(t.armor??0)+h,special:t.special??"none",healCooldown:0,shieldRegenTimer:0,dotFloatTimer:0};i.enemies.push(f),Xe.emit({type:"enemySpawned",enemyId:f.id,enemyType:e,worldX:f.worldX,worldZ:f.worldZ}),e==="boss"&&Xe.emit({type:"bossSpawned",enemyId:f.id,worldX:f.worldX,worldZ:f.worldZ})}function Rl(i,e){e.hp=0,e.alive=!1;const t=Math.ceil(e.bounty*i.buffGoldMult);i.gold+=t,i.totalKills++,i.stats.goldEarned+=t,i.killStreak++,i.killStreakTimer=3,i.stats.longestStreak=Math.max(i.stats.longestStreak,i.killStreak),i.killStreak%10===0&&(i.gold+=50,i.stats.goldEarned+=50,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`⚡ x${i.killStreak} COMBO! +50g`,color:"#ffee00",life:2,maxLife:2}),Xe.emit({type:"streakBonus",streak:i.killStreak,gold:50})),i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`+${t}g`,color:"#ffd700",life:1.2,maxLife:1.2}),Xe.emit({type:"enemyKilled",enemyId:e.id,worldX:e.worldX,worldZ:e.worldZ,bounty:e.bounty,killStreak:i.killStreak})}const Ax=1,Cl=4,Rx=20,Cx=50,Px=80;function bd(i,e){const t=i.pathWorld;if(t.length<2)return;let n=1;i.currentWave>=Px?n=1.3:i.currentWave>=Cx&&(n=1.15);for(const r of i.enemies){if(!r.alive||r.reached)continue;r.prevWorldX=r.worldX,r.prevWorldZ=r.worldZ;for(let a=r.dots.length-1;a>=0;a--){const l=r.dots[a];if(Lx(i,r,l.dps,l.damageType,e),l.remaining-=e,l.remaining<=0&&r.dots.splice(a,1),!r.alive)break}if(!r.alive)continue;let s=r.speed*n;if(r.slow&&(s*=1-r.slow.pct,r.slow.remaining-=e,r.slow.remaining<=0&&(r.slow=null)),r.special==="heal"){const a=os[r.type];if(r.healCooldown-=e,r.healCooldown<=0){const l=a.healRadius??2.5,c=a.healAmount??15;for(const u of i.enemies){if(!u.alive||u.reached||u.id===r.id)continue;const d=u.worldX-r.worldX,h=u.worldZ-r.worldZ;Math.sqrt(d*d+h*h)<=l&&(u.hp=Math.min(u.maxHp,u.hp+c))}r.healCooldown=a.healIntervalSec??2}}r.maxShield>0&&r.shield<r.maxShield&&(r.dots.length>0?r.shieldRegenTimer=Cl:(r.shieldRegenTimer-=e,r.shieldRegenTimer<=0&&(r.shield=Math.min(r.maxShield,r.shield+Rx*e))));let o=s*e;for(;o>0&&r.pathIndex<t.length-1;){const a=t[r.pathIndex],l=t[r.pathIndex+1],c=Mx(a,l);if(c<=0){r.pathIndex++;continue}const u=r.pathProgress*c,h=u+o;h>=c?(o-=c-u,r.pathIndex++,r.pathProgress=0):(r.pathProgress=h/c,o=0)}if(r.pathIndex>=t.length-1){r.reached=!0,r.alive=!1,i.lives--,i.waveLivesLostThisWave++,i.lives<=0&&(i.lives=0,i.phase="lost");const a=t[t.length-1];r.worldX=a.x,r.worldZ=a.z}else{const a=t[r.pathIndex],l=t[r.pathIndex+1];r.worldX=a.x+(l.x-a.x)*r.pathProgress,r.worldZ=a.z+(l.z-a.z)*r.pathProgress}}}function wd(i,e,t,n){const r=i.dots.find(s=>s.damageType===n);if(r){r.dps=Math.max(r.dps,e),r.remaining=Math.max(r.remaining,t);return}i.dots.push({dps:e,remaining:t,damageType:n})}function Lx(i,e,t,n,r){var l,c;const s=os[e.type];let o=t;(l=s.weakness)!=null&&l.includes(n)&&(o*=1.5),(c=s.resistance)!=null&&c.includes(n)&&(o*=.5),o=Math.max(Ax,o-e.armor);const a=o*r;e.maxShield>0&&(e.shieldRegenTimer=Cl),e.dotFloatTimer=(e.dotFloatTimer??0)-r,o>=2&&e.dotFloatTimer<=0&&(e.dotFloatTimer=1,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}`,color:"#66ee44",life:.8,maxLife:.8})),e.hp-=a,i.stats.totalDamageDealt+=a,i.stats.damageByType[n]=(i.stats.damageByType[n]??0)+a,e.hp<=0&&Rl(i,e)}function Td(i,e){for(const t of i.towers){t.cooldownRemaining-=e;const n=nn[t.type],r=n.levels[t.level],s=r.range*i.buffRangeMult;let o=null,a=t.targetingMode==="last"?1/0:-1/0;for(const l of i.enemies){if(!l.alive||l.reached)continue;const c=l.worldX-t.worldX,u=l.worldZ-t.worldZ;if(Math.sqrt(c*c+u*u)<=s){const h=l.pathIndex+l.pathProgress;let f;switch(t.targetingMode){case"first":f=h,f>a&&(a=f,o=l);break;case"last":f=h,f<a&&(a=f,o=l);break;case"strongest":f=l.hp+l.shield,f>a&&(a=f,o=l);break;case"weakest":f=-(l.hp+l.shield),f>a&&(a=f,o=l);break}}}if(t.targetId=o?o.id:null,!(t.cooldownRemaining>0)&&o){let l=0,c=as;t.type==="cannon"||t.type==="poison"?(l=1.5,c=as*.8):t.type==="lightning"?c=as*8:t.type==="sniper"?c=as*4:t.type==="fire"&&(c=as*.6);const u={id:i.nextId++,fromTowerId:t.id,targetEnemyId:o.id,towerType:t.type,damageType:n.damageType,damage:r.damage*i.buffDamageMult,aoeRadius:r.aoeRadius,slow:r.slow,dot:r.dot,chain:r.chain,x:t.worldX,y:.8,z:t.worldZ,startX:t.worldX,startY:.8,startZ:t.worldZ,targetX:o.worldX,targetY:.3,targetZ:o.worldZ,speed:c,progress:0,arcHeight:l,alive:!0};i.projectiles.push(u),t.cooldownRemaining=r.cooldownSec,t.aimAngle=Math.atan2(o.worldX-t.worldX,o.worldZ-t.worldZ),Xe.emit({type:"towerFired",towerId:t.id,towerType:t.type,worldX:t.worldX,worldZ:t.worldZ,aimAngle:t.aimAngle})}}}function Ed(i,e){for(const t of i.projectiles){if(!t.alive)continue;const n=i.enemies.find(c=>c.id===t.targetEnemyId);n&&n.alive&&!n.reached&&(t.targetX=n.worldX,t.targetZ=n.worldZ);const r=t.targetX-t.x,s=t.targetY-t.y,o=t.targetZ-t.z,a=Math.sqrt(r*r+s*s+o*o),l=t.speed*e;if(a<=l||a<.1)if(t.alive=!1,t.aoeRadius>0){Xe.emit({type:"aoeImpact",worldX:t.targetX,worldZ:t.targetZ,radius:t.aoeRadius,towerType:t.towerType});for(const c of i.enemies){if(!c.alive||c.reached)continue;const u=c.worldX-t.targetX,d=c.worldZ-t.targetZ;Math.sqrt(u*u+d*d)<=t.aoeRadius&&(vo(i,c,t.damage,t.damageType,t.fromTowerId),t.slow&&(c.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&wd(c,t.dot.dps,t.dot.durationSec,t.damageType))}}else if(t.chain&&t.chain.targets>0){const c=[];n&&n.alive&&!n.reached&&(vo(i,n,t.damage,t.damageType,t.fromTowerId),c.push(n),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}));let u=n;for(let d=0;d<t.chain.targets&&u;d++){let h=null,f=t.chain.rangeFalloff;for(const g of i.enemies){if(!g.alive||g.reached||c.includes(g))continue;const v=g.worldX-u.worldX,m=g.worldZ-u.worldZ,p=Math.sqrt(v*v+m*m);p<f&&(f=p,h=g)}if(h)vo(i,h,t.damage*.7,t.damageType,t.fromTowerId),c.push(h),u=h;else break}}else n&&n.alive&&!n.reached&&(vo(i,n,t.damage,t.damageType,t.fromTowerId),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&wd(n,t.dot.dps,t.dot.durationSec,t.damageType));else{const c=1/a;t.x+=r*c*l,t.z+=o*c*l;const u=t.targetX-t.startX,d=t.targetZ-t.startZ,h=Math.max(.1,Math.sqrt(u*u+d*d)),f=t.x-t.startX,g=t.z-t.startZ,v=Math.sqrt(f*f+g*g);t.progress=Math.min(1,v/h);const m=t.startY+(t.targetY-t.startY)*t.progress;t.arcHeight>0?t.y=m+Math.sin(t.progress*Math.PI)*t.arcHeight:t.y=m}}i.projectiles=i.projectiles.filter(t=>t.alive)}function vo(i,e,t,n,r){var l,c,u;const s=os[e.type];let o=t;if((l=s.weakness)!=null&&l.includes(n)&&(o*=1.5),(c=s.resistance)!=null&&c.includes(n)&&(o*=.5),o=Math.max(1,o-e.armor),e.maxShield>0&&(e.shieldRegenTimer=Cl),e.shield>0)if(o<=e.shield){i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}🛡`,color:"#88ddff",life:1,maxLife:1}),e.shield-=o;return}else{const d=e.shield;o-=e.shield,e.shield=0,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(d)}🛡`,color:"#88ddff",life:1,maxLife:1})}const a=(u=s.weakness)==null?void 0:u.includes(n);if(i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}`,color:a?"#ffdd44":"#ff6655",life:1,maxLife:1}),e.hp-=o,i.stats.totalDamageDealt+=o,i.stats.damageByType[n]=(i.stats.damageByType[n]??0)+o,e.hp<=0){if(r!==void 0){const d=i.towers.find(h=>h.id===r);d&&(d.kills++,i.stats.killsByTower[d.type]=(i.stats.killsByTower[d.type]??0)+1)}Rl(i,e)}}function Ad(i,e,t){if(e<0||e>=ie.cols||t<0||t>=ie.rows)return!1;const n=wl(e,t);return!(i.pathCells.has(n)||i.occupiedCells.has(n))}function Rd(i,e,t,n){const r=nn[e].levels[0];if(i.gold<r.buildCost||!Ad(i,t,n))return null;const s=Rt(t,n),o={id:i.nextId++,type:e,level:0,col:t,row:n,worldX:s.x,worldZ:s.z,cooldownRemaining:0,totalInvested:r.buildCost,targetingMode:"first",kills:0};return i.gold-=r.buildCost,i.stats.towersBuilt++,i.stats.goldSpent+=r.buildCost,i.towers.push(o),_d(i),Xe.emit({type:"towerBuilt",towerId:o.id,towerType:o.type,col:o.col,row:o.row}),o}function Cd(i,e){const t=i.towers.find(s=>s.id===e);if(!t)return!1;const n=nn[t.type].levels;if(t.level>=n.length-1)return!1;const r=n[t.level+1];return i.gold<r.upgradeCost?!1:(i.gold-=r.upgradeCost,i.stats.goldSpent+=r.upgradeCost,t.totalInvested+=r.upgradeCost,t.level++,Xe.emit({type:"towerUpgraded",towerId:t.id,newLevel:t.level}),!0)}function Ix(i,e){const t=i.towers.findIndex(s=>s.id===e);if(t===-1)return 0;const n=i.towers[t],r=Math.floor(n.totalInvested*gd);return i.gold+=r,i.stats.towersSold++,i.towers.splice(t,1),_d(i),Xe.emit({type:"towerSold",towerId:n.id,refund:r,worldX:n.worldX,worldZ:n.worldZ}),r}function Pd(i){return Math.floor(i.totalInvested*gd)}function Dx(i,e){const t=nn[e.type].levels;return e.level>=t.length-1?!1:i.gold>=t[e.level+1].upgradeCost}function Ld(i,e,t){const n=i.towers.find(o=>o.id===e);if(!n)return!1;const r=nn[n.type];if(!r.evolutions)return!1;const s=r.evolutions.find(o=>o.type===t);return!s||i.gold<s.cost?!1:(i.gold-=s.cost,i.stats.goldSpent+=s.cost,n.totalInvested+=s.cost,n.type=t,n.level=0,Xe.emit({type:"towerUpgraded",towerId:n.id,newLevel:0}),!0)}function Id(i,e){if(e===Mf)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===Ea||e===Cc){let t=i.getIndex();if(t===null){const o=[],a=i.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}const n=t.count-2,r=[];if(e===Ea)for(let o=1;o<=n;o++)r.push(t.getX(0)),r.push(t.getX(o)),r.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(r.push(t.getX(o)),r.push(t.getX(o+1)),r.push(t.getX(o+2))):(r.push(t.getX(o+2)),r.push(t.getX(o+1)),r.push(t.getX(o)));r.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=i.clone();return s.setIndex(r),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}class Ux extends br{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Bx(t)}),this.register(function(t){return new zx(t)}),this.register(function(t){return new $x(t)}),this.register(function(t){return new Kx(t)}),this.register(function(t){return new Zx(t)}),this.register(function(t){return new Gx(t)}),this.register(function(t){return new Vx(t)}),this.register(function(t){return new Wx(t)}),this.register(function(t){return new Xx(t)}),this.register(function(t){return new Ox(t)}),this.register(function(t){return new qx(t)}),this.register(function(t){return new Hx(t)}),this.register(function(t){return new jx(t)}),this.register(function(t){return new Yx(t)}),this.register(function(t){return new Fx(t)}),this.register(function(t){return new Jx(t)}),this.register(function(t){return new Qx(t)})}load(e,t,n,r){const s=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=ss.extractUrlBase(e);o=ss.resolveURL(c,this.path)}else o=ss.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){r?r(c):console.error(c),s.manager.itemError(e),s.manager.itemEnd(e)},l=new ld(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{s.parse(c,o,function(u){t(u),s.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let s;const o={},a={},l=new TextDecoder;if(typeof e=="string")s=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Dd){try{o[He.KHR_BINARY_GLTF]=new e_(e)}catch(d){r&&r(d);return}s=JSON.parse(o[He.KHR_BINARY_GLTF].content)}else s=JSON.parse(l.decode(e));else s=e;if(s.asset===void 0||s.asset.version[0]<2){r&&r(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new f_(s,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const d=this.pluginCallbacks[u](c);d.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[d.name]=d,o[d.name]=!0}if(s.extensionsUsed)for(let u=0;u<s.extensionsUsed.length;++u){const d=s.extensionsUsed[u],h=s.extensionsRequired||[];switch(d){case He.KHR_MATERIALS_UNLIT:o[d]=new kx;break;case He.KHR_DRACO_MESH_COMPRESSION:o[d]=new t_(s,this.dracoLoader);break;case He.KHR_TEXTURE_TRANSFORM:o[d]=new n_;break;case He.KHR_MESH_QUANTIZATION:o[d]=new i_;break;default:h.indexOf(d)>=0&&a[d]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+d+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,r)}parseAsync(e,t){const n=this;return new Promise(function(r,s){n.parse(e,t,r,s)})}}function Nx(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}const He={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Fx{constructor(e){this.parser=e,this.name=He.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){const s=t[n];s.extensions&&s.extensions[this.name]&&s.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,s.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let r=t.cache.get(n);if(r)return r;const s=t.json,l=((s.extensions&&s.extensions[this.name]||{}).lights||[])[e];let c;const u=new se(16777215);l.color!==void 0&&u.setRGB(l.color[0],l.color[1],l.color[2],Ot);const d=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new mo(u),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new po(u),c.distance=d;break;case"spot":c=new Zv(u),c.distance=d,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,Zn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),r=Promise.resolve(c),t.cache.add(n,r),r}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,s=n.json.nodes[e],a=(s.extensions&&s.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}class kx{constructor(){this.name=He.KHR_MATERIALS_UNLIT}getMaterialType(){return Be}extendParams(e,t,n){const r=[];e.color=new se(1,1,1),e.opacity=1;const s=t.pbrMetallicRoughness;if(s){if(Array.isArray(s.baseColorFactor)){const o=s.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Ot),e.opacity=o[3]}s.baseColorTexture!==void 0&&r.push(n.assignTexture(e,"map",s.baseColorTexture,Et))}return Promise.all(r)}}class Ox{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=r.extensions[this.name].emissiveStrength;return s!==void 0&&(t.emissiveIntensity=s),Promise.resolve()}}class Bx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(s.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new we(a,a)}return Promise.all(s)}}class zx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=r.extensions[this.name];return t.dispersion=s.dispersion!==void 0?s.dispersion:0,Promise.resolve()}}class Hx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&s.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(s)}}class Gx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[];t.sheenColor=new se(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=r.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Ot)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&s.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Et)),o.sheenRoughnessTexture!==void 0&&s.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(s)}}class Vx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&s.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(s)}}class Wx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&s.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new se().setRGB(a[0],a[1],a[2],Ot),Promise.all(s)}}class Xx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=r.extensions[this.name];return t.ior=s.ior!==void 0?s.ior:1.5,Promise.resolve()}}class qx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&s.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new se().setRGB(a[0],a[1],a[2],Ot),o.specularColorTexture!==void 0&&s.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,Et)),Promise.all(s)}}class Yx{constructor(e){this.parser=e,this.name=He.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&s.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(s)}}class jx{constructor(e){this.parser=e,this.name=He.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Pn}extendMaterialParams(e,t){const n=this.parser,r=n.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();const s=[],o=r.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&s.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(s)}}class $x{constructor(e){this.parser=e,this.name=He.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;const s=r.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,s.source,o)}}class Kx{constructor(e){this.parser=e,this.name=He.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;const o=s.extensions[t],a=r.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(r.extensionsRequired&&r.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class Zx{constructor(e){this.parser=e,this.name=He.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,r=n.json,s=r.textures[e];if(!s.extensions||!s.extensions[t])return null;const o=s.extensions[t],a=r.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(r.extensionsRequired&&r.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class Jx{constructor(e){this.name=He.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const r=n.extensions[this.name],s=this.parser.getDependency("buffer",r.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return s.then(function(a){const l=r.byteOffset||0,c=r.byteLength||0,u=r.count,d=r.byteStride,h=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,d,h,r.mode,r.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(u*d);return o.decodeGltfBuffer(new Uint8Array(f),u,d,h,r.mode,r.filter),f})})}else return null}}class Qx{constructor(e){this.name=He.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const r=t.meshes[n.mesh];for(const c of r.primitives)if(c.mode!==rn.TRIANGLES&&c.mode!==rn.TRIANGLE_STRIP&&c.mode!==rn.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(u=>(l[c]=u,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const u=c.pop(),d=u.isGroup?u.children:[u],h=c[0].count,f=[];for(const g of d){const v=new Ie,m=new A,p=new li,b=new A(1,1,1),w=new Ku(g.geometry,g.material,h);for(let _=0;_<h;_++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,_),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,_),l.SCALE&&b.fromBufferAttribute(l.SCALE,_),w.setMatrixAt(_,v.compose(m,p,b));for(const _ in l)if(_==="_COLOR_0"){const I=l[_];w.instanceColor=new fl(I.array,I.itemSize,I.normalized)}else _!=="TRANSLATION"&&_!=="ROTATION"&&_!=="SCALE"&&g.geometry.setAttribute(_,l[_]);ut.prototype.copy.call(w,g),this.parser.assignFinalMaterial(w),f.push(w)}return u.isGroup?(u.clear(),u.add(...f),u):f[0]}))}}const Dd="glTF",ls=12,Ud={JSON:1313821514,BIN:5130562};class e_{constructor(e){this.name=He.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,ls),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Dd)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const r=this.header.length-ls,s=new DataView(e,ls);let o=0;for(;o<r;){const a=s.getUint32(o,!0);o+=4;const l=s.getUint32(o,!0);if(o+=4,l===Ud.JSON){const c=new Uint8Array(e,ls+o,a);this.content=n.decode(c)}else if(l===Ud.BIN){const c=ls+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class t_{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=He.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,r=this.dracoLoader,s=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const u in o){const d=Ll[u]||u.toLowerCase();a[d]=o[u]}for(const u in e.attributes){const d=Ll[u]||u.toLowerCase();if(o[u]!==void 0){const h=n.accessors[e.attributes[u]],f=wr[h.componentType];c[d]=f.name,l[d]=h.normalized===!0}}return t.getDependency("bufferView",s).then(function(u){return new Promise(function(d,h){r.decodeDracoFile(u,function(f){for(const g in f.attributes){const v=f.attributes[g],m=l[g];m!==void 0&&(v.normalized=m)}d(f)},a,c,Ot,h)})})}}class n_{constructor(){this.name=He.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class i_{constructor(){this.name=He.KHR_MESH_QUANTIZATION}}class Nd extends ns{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r*3+r;for(let o=0;o!==r;o++)t[o]=n[s+o];return t}interpolate_(e,t,n,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,u=r-t,d=(n-t)/u,h=d*d,f=h*d,g=e*c,v=g-c,m=-2*f+3*h,p=f-h,b=1-m,w=p-h+d;for(let _=0;_!==a;_++){const I=o[v+_+a],E=o[v+_+l]*u,R=o[g+_+a],D=o[g+_]*u;s[_]=b*I+w*E+m*R+p*D}return s}}const r_=new li;class s_ extends Nd{interpolate_(e,t,n,r){const s=super.interpolate_(e,t,n,r);return r_.fromArray(s).normalize().toArray(s),s}}const rn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},wr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Fd={9728:kt,9729:qt,9984:gc,9985:Es,9986:Fr,9987:On},kd={33071:oi,33648:Ts,10497:Yi},Pl={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Ll={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},vi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},o_={CUBICSPLINE:void 0,LINEAR:Br,STEP:Or},Il={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function a_(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Mn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Fn})),i.DefaultMaterial}function Fi(i,e,t){for(const n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Zn(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function l_(i,e,t){let n=!1,r=!1,s=!1;for(let c=0,u=e.length;c<u;c++){const d=e[c];if(d.POSITION!==void 0&&(n=!0),d.NORMAL!==void 0&&(r=!0),d.COLOR_0!==void 0&&(s=!0),n&&r&&s)break}if(!n&&!r&&!s)return Promise.resolve(i);const o=[],a=[],l=[];for(let c=0,u=e.length;c<u;c++){const d=e[c];if(n){const h=d.POSITION!==void 0?t.getDependency("accessor",d.POSITION):i.attributes.position;o.push(h)}if(r){const h=d.NORMAL!==void 0?t.getDependency("accessor",d.NORMAL):i.attributes.normal;a.push(h)}if(s){const h=d.COLOR_0!==void 0?t.getDependency("accessor",d.COLOR_0):i.attributes.color;l.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const u=c[0],d=c[1],h=c[2];return n&&(i.morphAttributes.position=u),r&&(i.morphAttributes.normal=d),s&&(i.morphAttributes.color=h),i.morphTargetsRelative=!0,i})}function c_(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,r=t.length;n<r;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function u_(i){let e;const t=i.extensions&&i.extensions[He.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Dl(t.attributes):e=i.indices+":"+Dl(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,r=i.targets.length;n<r;n++)e+=":"+Dl(i.targets[n]);return e}function Dl(i){let e="";const t=Object.keys(i).sort();for(let n=0,r=t.length;n<r;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Ul(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function d_(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const h_=new Ie;class f_{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Nx,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,s=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);r=n&&l?parseInt(l[1],10):-1,s=a.indexOf("Firefox")>-1,o=s?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&r<17||s&&o<98?this.textureLoader=new jv(this.options.manager):this.textureLoader=new tx(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new ld(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,r=this.json,s=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][r.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:r.asset,parser:n,userData:{}};return Fi(s,a,r),Zn(a,r),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let r=0,s=t.length;r<s;r++){const o=t[r].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let r=0,s=e.length;r<s;r++){const o=e[r];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const r=n.clone(),s=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,u]of o.children.entries())s(u,a.children[c])};return s(n,r),r.name+="_instance_"+e.uses[t]++,r}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const r=e(t[n]);if(r)return r}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let r=0;r<t.length;r++){const s=e(t[r]);s&&n.push(s)}return n}getDependency(e,t){const n=e+":"+t;let r=this.cache.get(n);if(!r){switch(e){case"scene":r=this.loadScene(t);break;case"node":r=this._invokeOne(function(s){return s.loadNode&&s.loadNode(t)});break;case"mesh":r=this._invokeOne(function(s){return s.loadMesh&&s.loadMesh(t)});break;case"accessor":r=this.loadAccessor(t);break;case"bufferView":r=this._invokeOne(function(s){return s.loadBufferView&&s.loadBufferView(t)});break;case"buffer":r=this.loadBuffer(t);break;case"material":r=this._invokeOne(function(s){return s.loadMaterial&&s.loadMaterial(t)});break;case"texture":r=this._invokeOne(function(s){return s.loadTexture&&s.loadTexture(t)});break;case"skin":r=this.loadSkin(t);break;case"animation":r=this._invokeOne(function(s){return s.loadAnimation&&s.loadAnimation(t)});break;case"camera":r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(s){return s!=this&&s.getDependency&&s.getDependency(e,t)}),!r)throw new Error("Unknown type: "+e);break}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,r=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(r.map(function(s,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[He.KHR_BINARY_GLTF].body);const r=this.options;return new Promise(function(s,o){n.load(ss.resolveURL(t.uri,r.path),s,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const r=t.byteLength||0,s=t.byteOffset||0;return n.slice(s,s+r)})}loadAccessor(e){const t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){const o=Pl[r.type],a=wr[r.componentType],l=r.normalized===!0,c=new a(r.count*o);return Promise.resolve(new gt(c,o,l))}const s=[];return r.bufferView!==void 0?s.push(this.getDependency("bufferView",r.bufferView)):s.push(null),r.sparse!==void 0&&(s.push(this.getDependency("bufferView",r.sparse.indices.bufferView)),s.push(this.getDependency("bufferView",r.sparse.values.bufferView))),Promise.all(s).then(function(o){const a=o[0],l=Pl[r.type],c=wr[r.componentType],u=c.BYTES_PER_ELEMENT,d=u*l,h=r.byteOffset||0,f=r.bufferView!==void 0?n.bufferViews[r.bufferView].byteStride:void 0,g=r.normalized===!0;let v,m;if(f&&f!==d){const p=Math.floor(h/f),b="InterleavedBuffer:"+r.bufferView+":"+r.componentType+":"+p+":"+r.count;let w=t.cache.get(b);w||(v=new c(a,p*f,r.count*f/u),w=new Rv(v,f/u),t.cache.add(b,w)),m=new cl(w,l,h%f/u,g)}else a===null?v=new c(r.count*l):v=new c(a,h,r.count*l),m=new gt(v,l,g);if(r.sparse!==void 0){const p=Pl.SCALAR,b=wr[r.sparse.indices.componentType],w=r.sparse.indices.byteOffset||0,_=r.sparse.values.byteOffset||0,I=new b(o[1],w,r.sparse.count*p),E=new c(o[2],_,r.sparse.count*l);a!==null&&(m=new gt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let R=0,D=I.length;R<D;R++){const M=I[R];if(m.setX(M,E[R*l]),l>=2&&m.setY(M,E[R*l+1]),l>=3&&m.setZ(M,E[R*l+2]),l>=4&&m.setW(M,E[R*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){const t=this.json,n=this.options,s=t.textures[e].source,o=t.images[s];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,s,a)}loadTextureImage(e,t,n){const r=this,s=this.json,o=s.textures[e],a=s.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);const h=(s.samplers||{})[o.sampler]||{};return u.magFilter=Fd[h.magFilter]||qt,u.minFilter=Fd[h.minFilter]||On,u.wrapS=kd[h.wrapS]||Yi,u.wrapT=kd[h.wrapT]||Yi,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==kt&&u.minFilter!==qt,r.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,r=this.json,s=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(d=>d.clone());const o=r.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(d){c=!0;const h=new Blob([d],{type:o.mimeType});return l=a.createObjectURL(h),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const u=Promise.resolve(l).then(function(d){return new Promise(function(h,f){let g=h;t.isImageBitmapLoader===!0&&(g=function(v){const m=new Mt(v);m.needsUpdate=!0,h(m)}),t.load(ss.resolveURL(d,s.path),g,void 0,f)})}).then(function(d){return c===!0&&a.revokeObjectURL(l),Zn(d,o),d.userData.mimeType=o.mimeType||d_(o.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),d});return this.sourceCache[e]=u,u}assignTexture(e,t,n,r){const s=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),s.extensions[He.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[He.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=s.associations.get(o);o=s.extensions[He.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),s.associations.set(o,l)}}return r!==void 0&&(o.colorSpace=r),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const r=t.attributes.tangent===void 0,s=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new nd,yn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Zu,yn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(r||s||o){let a="ClonedMaterial:"+n.uuid+":";r&&(a+="derivative-tangents:"),s&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),s&&(l.vertexColors=!0),o&&(l.flatShading=!0),r&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Mn}loadMaterial(e){const t=this,n=this.json,r=this.extensions,s=n.materials[e];let o;const a={},l=s.extensions||{},c=[];if(l[He.KHR_MATERIALS_UNLIT]){const d=r[He.KHR_MATERIALS_UNLIT];o=d.getMaterialType(),c.push(d.extendParams(a,s,t))}else{const d=s.pbrMetallicRoughness||{};if(a.color=new se(1,1,1),a.opacity=1,Array.isArray(d.baseColorFactor)){const h=d.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],Ot),a.opacity=h[3]}d.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",d.baseColorTexture,Et)),a.metalness=d.metallicFactor!==void 0?d.metallicFactor:1,a.roughness=d.roughnessFactor!==void 0?d.roughnessFactor:1,d.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",d.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",d.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}s.doubleSided===!0&&(a.side=st);const u=s.alphaMode||Il.OPAQUE;if(u===Il.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===Il.MASK&&(a.alphaTest=s.alphaCutoff!==void 0?s.alphaCutoff:.5)),s.normalTexture!==void 0&&o!==Be&&(c.push(t.assignTexture(a,"normalMap",s.normalTexture)),a.normalScale=new we(1,1),s.normalTexture.scale!==void 0)){const d=s.normalTexture.scale;a.normalScale.set(d,d)}if(s.occlusionTexture!==void 0&&o!==Be&&(c.push(t.assignTexture(a,"aoMap",s.occlusionTexture)),s.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=s.occlusionTexture.strength)),s.emissiveFactor!==void 0&&o!==Be){const d=s.emissiveFactor;a.emissive=new se().setRGB(d[0],d[1],d[2],Ot)}return s.emissiveTexture!==void 0&&o!==Be&&c.push(t.assignTexture(a,"emissiveMap",s.emissiveTexture,Et)),Promise.all(c).then(function(){const d=new o(a);return s.name&&(d.name=s.name),Zn(d,s),t.associations.set(d,{materials:e}),s.extensions&&Fi(r,d,s),d})}createUniqueName(e){const t=nt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,r=this.primitiveCache;function s(a){return n[He.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Od(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],u=u_(c),d=r[u];if(d)o.push(d.promise);else{let h;c.extensions&&c.extensions[He.KHR_DRACO_MESH_COMPRESSION]?h=s(c):h=Od(new At,c,t),r[u]={primitive:c,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,r=this.extensions,s=n.meshes[e],o=s.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const u=o[l].material===void 0?a_(this.cache):this.getDependency("material",o[l].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),u=l[l.length-1],d=[];for(let f=0,g=u.length;f<g;f++){const v=u[f],m=o[f];let p;const b=c[f];if(m.mode===rn.TRIANGLES||m.mode===rn.TRIANGLE_STRIP||m.mode===rn.TRIANGLE_FAN||m.mode===void 0)p=s.isSkinnedMesh===!0?new Pv(v,b):new Re(v,b),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===rn.TRIANGLE_STRIP?p.geometry=Id(p.geometry,Cc):m.mode===rn.TRIANGLE_FAN&&(p.geometry=Id(p.geometry,Ea));else if(m.mode===rn.LINES)p=new Dv(v,b);else if(m.mode===rn.LINE_STRIP)p=new ml(v,b);else if(m.mode===rn.LINE_LOOP)p=new Uv(v,b);else if(m.mode===rn.POINTS)p=new vl(v,b);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&c_(p,s),p.name=t.createUniqueName(s.name||"mesh_"+e),Zn(p,s),m.extensions&&Fi(r,p,m),t.assignFinalMaterial(p),d.push(p)}for(let f=0,g=d.length;f<g;f++)t.associations.set(d[f],{meshes:e,primitives:f});if(d.length===1)return s.extensions&&Fi(r,d[0],s),d[0];const h=new It;s.extensions&&Fi(r,h,s),t.associations.set(h,{meshes:e});for(let f=0,g=d.length;f<g;f++)h.add(d[f]);return h})}loadCamera(e){let t;const n=this.json.cameras[e],r=n[n.type];if(!r){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Ht(Pa.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type==="orthographic"&&(t=new $r(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Zn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let r=0,s=t.joints.length;r<s;r++)n.push(this._loadNodeShallow(t.joints[r]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(r){const s=r.pop(),o=r,a=[],l=[];for(let c=0,u=o.length;c<u;c++){const d=o[c];if(d){a.push(d);const h=new Ie;s!==null&&h.fromArray(s.array,c*16),l.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new hl(a,l)})}loadAnimation(e){const t=this.json,n=this,r=t.animations[e],s=r.name?r.name:"animation_"+e,o=[],a=[],l=[],c=[],u=[];for(let d=0,h=r.channels.length;d<h;d++){const f=r.channels[d],g=r.samplers[f.sampler],v=f.target,m=v.node,p=r.parameters!==void 0?r.parameters[g.input]:g.input,b=r.parameters!==void 0?r.parameters[g.output]:g.output;v.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",b)),c.push(g),u.push(v))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(u)]).then(function(d){const h=d[0],f=d[1],g=d[2],v=d[3],m=d[4],p=[];for(let b=0,w=h.length;b<w;b++){const _=h[b],I=f[b],E=g[b],R=v[b],D=m[b];if(_===void 0)continue;_.updateMatrix&&_.updateMatrix();const M=n._createAnimationTracks(_,I,E,R,D);if(M)for(let S=0;S<M.length;S++)p.push(M[S])}return new Hv(s,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency("mesh",r.mesh).then(function(s){const o=n._getNodeRef(n.meshCache,r.mesh,s);return r.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=r.weights.length;l<c;l++)a.morphTargetInfluences[l]=r.weights[l]}),o})}loadNode(e){const t=this.json,n=this,r=t.nodes[e],s=n._loadNodeShallow(e),o=[],a=r.children||[];for(let c=0,u=a.length;c<u;c++)o.push(n.getDependency("node",a[c]));const l=r.skin===void 0?Promise.resolve(null):n.getDependency("skin",r.skin);return Promise.all([s,Promise.all(o),l]).then(function(c){const u=c[0],d=c[1],h=c[2];h!==null&&u.traverse(function(f){f.isSkinnedMesh&&f.bind(h,h_)});for(let f=0,g=d.length;f<g;f++)u.add(d[f]);return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const s=t.nodes[e],o=s.name?r.createUniqueName(s.name):"",a=[],l=r._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),s.camera!==void 0&&a.push(r.getDependency("camera",s.camera).then(function(c){return r._getNodeRef(r.cameraCache,s.camera,c)})),r._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let u;if(s.isBone===!0?u=new Xu:c.length>1?u=new It:c.length===1?u=c[0]:u=new ut,u!==c[0])for(let d=0,h=c.length;d<h;d++)u.add(c[d]);if(s.name&&(u.userData.name=s.name,u.name=o),Zn(u,s),s.extensions&&Fi(n,u,s),s.matrix!==void 0){const d=new Ie;d.fromArray(s.matrix),u.applyMatrix4(d)}else s.translation!==void 0&&u.position.fromArray(s.translation),s.rotation!==void 0&&u.quaternion.fromArray(s.rotation),s.scale!==void 0&&u.scale.fromArray(s.scale);return r.associations.has(u)||r.associations.set(u,{}),r.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],r=this,s=new It;n.name&&(s.name=r.createUniqueName(n.name)),Zn(s,n),n.extensions&&Fi(t,s,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(r.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let u=0,d=l.length;u<d;u++)s.add(l[u]);const c=u=>{const d=new Map;for(const[h,f]of r.associations)(h instanceof yn||h instanceof Mt)&&d.set(h,f);return u.traverse(h=>{const f=r.associations.get(h);f!=null&&d.set(h,f)}),d};return r.associations=c(s),s})}_createAnimationTracks(e,t,n,r,s){const o=[],a=e.name?e.name:e.uuid,l=[];vi[s.path]===vi.weights?e.traverse(function(h){h.morphTargetInfluences&&l.push(h.name?h.name:h.uuid)}):l.push(a);let c;switch(vi[s.path]){case vi.weights:c=_r;break;case vi.rotation:c=yr;break;case vi.position:case vi.scale:c=Mr;break;default:switch(n.itemSize){case 1:c=_r;break;case 2:case 3:default:c=Mr;break}break}const u=r.interpolation!==void 0?o_[r.interpolation]:Br,d=this._getArrayFromAccessor(n);for(let h=0,f=l.length;h<f;h++){const g=new c(l[h]+"."+vi[s.path],t.array,d,u);r.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Ul(t.constructor),r=new Float32Array(t.length);for(let s=0,o=t.length;s<o;s++)r[s]=t[s]*n;t=r}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const r=this instanceof yr?s_:Nd;return new r(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function p_(i,e,t){const n=e.attributes,r=new en;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(r.set(new A(l[0],l[1],l[2]),new A(c[0],c[1],c[2])),a.normalized){const u=Ul(wr[a.componentType]);r.min.multiplyScalar(u),r.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const s=e.targets;if(s!==void 0){const a=new A,l=new A;for(let c=0,u=s.length;c<u;c++){const d=s[c];if(d.POSITION!==void 0){const h=t.json.accessors[d.POSITION],f=h.min,g=h.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),h.normalized){const v=Ul(wr[h.componentType]);l.multiplyScalar(v)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}r.expandByVector(a)}i.boundingBox=r;const o=new An;r.getCenter(o.center),o.radius=r.min.distanceTo(r.max)/2,i.boundingSphere=o}function Od(i,e,t){const n=e.attributes,r=[];function s(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(const o in n){const a=Ll[o]||o.toLowerCase();a in i.attributes||r.push(s(n[o],a))}if(e.indices!==void 0&&!i.index){const o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});r.push(o)}return We.workingColorSpace!==Ot&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${We.workingColorSpace}" not supported.`),Zn(i,e),p_(i,e,t),Promise.all(r).then(function(){return e.targets!==void 0?l_(i,e.targets,t):i})}function m_(i){!i||!("metalness"in i)||(i.metalness=0,i.roughness=Math.min(i.roughness??1,.85))}const g_="models/",v_=new Ux,Bd=new Map;function Nl(i){let e=Bd.get(i);return e||(e=v_.loadAsync(`${g_}${i}`).then(t=>{const n=t.scene;return n.traverse(r=>{const s=r;if(s.isMesh){s.castShadow=!0,s.receiveShadow=!0;for(const o of Array.isArray(s.material)?s.material:[s.material])m_(o)}}),n}),Bd.set(i,e)),e}async function zd(i){return(await Nl(i)).clone(!0)}async function Hd(i){await Promise.all(i.map(async e=>{Gd.set(e,await Nl(e))}))}const Gd=new Map;function Kt(i){const e=Gd.get(i);if(!e)throw new Error(`模型未預載就攞：${i}`);return e.clone(!0)}const x_=()=>{const i=["towers/towerRound_base.glb","towers/towerRound_crystals.glb"];for(const e of["towerRound","towerSquare"])for(const t of["bottom","middle","top","roof"])for(const n of["A","B","C"])i.push(`towers/${e}_${t}${n}.glb`);for(const e of["ballista","blaster","cannon","catapult"])i.push(`towers/weapon_${e}.glb`);return i},__=()=>["skeleton","zombie","ghost","vampire","digger"].map(i=>`enemies/${i}.glb`);async function y_(i){try{const e=await Nl(i);let t=0,n=0,r=0;e.traverse(a=>{const l=a;if(!l.isMesh)return;t+=1,n+=Array.isArray(l.material)?l.material.length:1;const c=l.geometry.getIndex();r+=(c?c.count:l.geometry.getAttribute("position").count)/3});const s=new en().setFromObject(e),o=s.getSize(new A);return{mesh:t,mat:n,tri:Math.round(r),尺:[+o.x.toFixed(3),+o.y.toFixed(3),+o.z.toFixed(3)],底:+s.min.y.toFixed(3)}}catch(e){return{掛咗:String(e).slice(0,90)}}}const Vd=[[0,-1],[-1,0],[0,1],[1,0]];function Wd(i,e){const t=e[0]-i[0],n=e[1]-i[1];for(let r=0;r<4;r+=1)if(Vd[r][0]===t&&Vd[r][1]===n)return r;return null}const Xd={tile:[],tile_dirt:[],tile_straight:[0,2],tile_cornerRound:[0,1],tile_cornerSquare:[0,1],tile_end:[0],tile_endRound:[0],tile_spawn:[0,2],tile_endSpawn:[0],tile_crossing:[0,1,2,3],tile_split:[0,1,3]},S_=(i,e)=>i.map(t=>(t+e)%4).sort(),M_=(i,e)=>i.length===e.length&&i.every((t,n)=>t===e[n]);function b_(i,e){const t=[...i].sort(),n=[...e,...Object.keys(Xd)];for(const r of n){const s=Xd[r];if(s){for(let o=0;o<4;o+=1)if(M_(S_(s,o),t))return{model:r,rotK:o,rotationY:o*Math.PI/2}}}return null}function w_(i){const e=[];for(let t=0;t<i.length;t+=1){const n=[];if(t>0){const o=Wd(i[t],i[t-1]);o!==null&&n.push(o)}if(t<i.length-1){const o=Wd(i[t],i[t+1]);o!==null&&n.push(o)}const r=t===0?["tile_endSpawn"]:t===i.length-1?["tile_end"]:["tile_straight","tile_cornerRound"],s=b_(n,r);e.push({...s??{model:"tile",rotK:0,rotationY:0},col:i[t][0],row:i[t][1]})}return e}class T_{constructor(){J(this,"scene");J(this,"groundMeshes",[]);this.scene=new Av,this.scene.background=new se(1192226)}async buildGround(){const{cols:e,rows:t,cellSize:n,origin:r}=ie;this.buildSkyDome(),this.buildTerrainUnderlay();const s=w_(ie.path);await Hd(["tiles/tile.glb",...new Set(s.map(h=>`tiles/${h.model}.glb`)),"scenery/detail_tree.glb","scenery/detail_treeLarge.glb","scenery/detail_rocks.glb","scenery/detail_rocksLarge.glb","scenery/detail_crystal.glb","scenery/detail_crystalLarge.glb"]);const o=new Map(s.map(h=>[`${h.col},${h.row}`,h])),a=new Sn(n,n),l=new Be({visible:!1});for(let h=0;h<e;h++)for(let f=0;f<t;f++){const g=Rt(h,f),v=o.get(`${h},${f}`),m=await zd(v?`tiles/${v.model}.glb`:"tiles/tile.glb");m.position.set(g.x,0,g.z),m.rotation.y=v?v.rotationY:0,this.scene.add(m);const p=new Re(a,l);p.rotation.x=-Math.PI/2,p.position.set(g.x,.201,g.z),p.userData={col:h,row:f,type:"ground"},this.scene.add(p),this.groundMeshes.push(p)}const c=new jn(e*n+.9,.34,t*n+.9),u=ze.isMobile?new Be({color:4880959}):new Mn({color:4880959,roughness:.95,metalness:0}),d=new Re(c,u);d.position.set(r.x+e*n/2,-.18,r.z+t*n/2),d.receiveShadow=!0,this.scene.add(d),this.buildBoardFrame(d.position),await this.buildScenery(),this.buildDistantSilhouettes()}buildSkyDome(){const e=ze.isMobile?8:24,t=new $n(80,e,e),n=new wt({side:Ft,depthWrite:!1,uniforms:{topColor:{value:new se(1985077)},midColor:{value:new se(2447938)},bottomColor:{value:new se(4481592)}},vertexShader:`
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
            `});this.scene.add(new Re(t,n))}buildTerrainUnderlay(){const e=ie.cols+ze.terrain.underlayPadding*2,t=ie.rows+ze.terrain.underlayPadding*2,n=ze.terrain.underlaySegments,r=new Sn(e,t,n,n);r.rotateX(-Math.PI/2);const s=r.attributes.position,o=new Float32Array(s.count*3),a=ie.origin.x+ie.cols*ie.cellSize/2,l=ie.origin.z+ie.rows*ie.cellSize/2;for(let d=0;d<s.count;d++){const h=s.getX(d)+a,f=s.getZ(d)+l,g=Math.max(0,Math.abs(h-a)-ie.cols*.52),v=Math.max(0,Math.abs(f-l)-ie.rows*.52),m=Math.sqrt(g*g+v*v),p=Pa.smoothstep(m,.25,ze.terrain.underlayPadding),b=Math.sin(h*.22)*Math.cos(f*.18)*.16,w=Math.sin((h+f)*.11)*.12,_=(b+w)*p-.58;s.setY(d,_);const I=Pa.clamp(.5+p*.26+_*.12,0,1),E=new se(3959617),R=new se(7645282),D=E.lerp(R,I);o[d*3]=D.r,o[d*3+1]=D.g,o[d*3+2]=D.b}r.setAttribute("color",new gt(o,3)),r.computeVertexNormals();const c=ze.isMobile?new ts({vertexColors:!0}):new Mn({vertexColors:!0,roughness:.98,metalness:.01}),u=new Re(r,c);u.receiveShadow=!0,this.scene.add(u)}buildBoardFrame(e){const t=new jn(ie.cols+1.35,.2,ie.rows+1.35),n=ze.isMobile?new ts({color:3099955}):new Mn({color:3099955,roughness:.8,metalness:0}),r=new Re(t,n);r.position.copy(e),r.position.y=-.34,r.receiveShadow=!0,this.scene.add(r)}addRoadSegment(e,t,n,r,s,o,a){const l=new Re(new jn(n,r,t),a);l.position.copy(e),l.position.y=s,l.rotation.y=o,l.receiveShadow=!0,this.scene.add(l)}async buildScenery(){const{cols:e,rows:t,cellSize:n}=ie,r=(d,h,f)=>{const g=Math.sin(d*127.1+h*311.7+f*74.7)*43758.5453;return g-Math.floor(g)},s=["scenery/detail_tree.glb","scenery/detail_treeLarge.glb"],o=["scenery/detail_rocks.glb","scenery/detail_rocksLarge.glb"],a=["scenery/detail_crystal.glb","scenery/detail_crystalLarge.glb"],l=ze.isMobile?5:9,c=ze.isMobile?.18:.34,u=ze.isMobile?.06:.14;for(let d=-l;d<e+l;d++)for(let h=-l;h<t+l;h++){if(d>=-1&&d<=e&&h>=-1&&h<=t)continue;const f=r(d,h,1);let g=null;if(f<c?g=s[r(d,h,2)<.62?0:1]:f<c+u?g=o[r(d,h,3)<.6?0:1]:f<c+u+.02&&(g=a[r(d,h,4)<.7?0:1]),!g)continue;const v=Rt(d,h),m=await zd(g);m.position.set(v.x+(r(d,h,5)-.5)*n*.8,0,v.z+(r(d,h,6)-.5)*n*.8),m.rotation.y=r(d,h,7)*Math.PI*2,m.scale.setScalar(.8+r(d,h,8)*.9),this.scene.add(m)}}buildDistantSilhouettes(){const e=new es(2.8,6.5,4),t=ze.isMobile?new ts({color:1057560}):new Mn({color:1057560,roughness:.95,metalness:.01}),n=ie.cols*.75,r=ie.rows*.95,s=ie.origin.x+ie.cols*ie.cellSize/2,o=ie.origin.z+ie.rows*ie.cellSize/2,a=ze.isMobile?8:18;for(let l=0;l<a;l++){const c=l/a*Math.PI*2,u=new Re(e,t);u.position.set(s+Math.cos(c)*(n+10+Math.random()*5),1.8+Math.random()*.9,o+Math.sin(c)*(r+10+Math.random()*5)),u.scale.setScalar(.8+Math.random()*1.2),u.rotation.y=Math.random()*Math.PI*2,u.castShadow=!1,u.receiveShadow=!0,this.scene.add(u)}}}const E_=10,qd=4,Yd=22,A_=40,R_=35,Fl=20;class C_{constructor(){J(this,"cam");J(this,"frustum",E_);J(this,"tilt",A_*Math.PI/180);J(this,"yaw",R_*Math.PI/180);J(this,"cx");J(this,"cz");J(this,"lastPinchDist",0);J(this,"lastRotAngle",0);J(this,"isTwoFinger",!1);J(this,"shakeAmount",0);J(this,"shakeOffset",{x:0,y:0,z:0});J(this,"onTouchStart",e=>{e.touches.length===2&&(this.isTwoFinger=!0,this.lastPinchDist=$d(e),this.lastRotAngle=Kd(e))});J(this,"onTouchMove",e=>{if(e.touches.length!==2)return;e.preventDefault(),this.isTwoFinger=!0;const t=$d(e);if(this.lastPinchDist>0){const r=this.lastPinchDist/t;this.frustum=jd(this.frustum*r,qd,Yd),this.rebuildProjection()}this.lastPinchDist=t;const n=Kd(e);if(this.lastRotAngle!==0){const r=n-this.lastRotAngle;this.yaw+=r}this.lastRotAngle=n,this.applyTransform()});J(this,"onTouchEnd",e=>{e.touches.length<2&&(this.lastPinchDist=0,this.lastRotAngle=0,setTimeout(()=>{this.isTwoFinger=!1},100))});const e=window.innerWidth/window.innerHeight;this.cam=new $r(-this.frustum*e,this.frustum*e,this.frustum,-this.frustum,.1,100),this.cx=ie.origin.x+ie.cols*ie.cellSize/2,this.cz=ie.origin.z+ie.rows*ie.cellSize/2,this.applyTransform()}get twoFingerActive(){return this.isTwoFinger}zoom(e){this.frustum=jd(this.frustum+e*.01,qd,Yd),this.rebuildProjection(),this.applyTransform()}resize(e){this.rebuildProjection(),e.setSize(window.innerWidth,window.innerHeight)}shake(e){this.shakeAmount=Math.max(this.shakeAmount,e)}tickShake(e){if(this.shakeAmount<=.001){(this.shakeOffset.x!==0||this.shakeOffset.y!==0||this.shakeOffset.z!==0)&&(this.shakeOffset.x=0,this.shakeOffset.y=0,this.shakeOffset.z=0,this.applyTransform()),this.shakeAmount=0;return}const t=this.shakeAmount;this.shakeOffset.x=(Math.random()-.5)*t,this.shakeOffset.y=(Math.random()-.5)*t*.45,this.shakeOffset.z=(Math.random()-.5)*t,this.applyTransform(),this.shakeAmount=Math.max(0,this.shakeAmount-e*2.2*(.2+this.shakeAmount))}rebuildProjection(){const e=window.innerWidth/window.innerHeight;this.cam.left=-this.frustum*e,this.cam.right=this.frustum*e,this.cam.top=this.frustum,this.cam.bottom=-this.frustum,this.cam.updateProjectionMatrix()}applyTransform(){this.cam.position.set(this.cx+Fl*Math.sin(this.yaw)*Math.cos(this.tilt)+this.shakeOffset.x,Fl*Math.sin(this.tilt)+this.shakeOffset.y,this.cz+Fl*Math.cos(this.yaw)*Math.cos(this.tilt)+this.shakeOffset.z),this.cam.lookAt(this.cx+this.shakeOffset.x*.3,0,this.cz+this.shakeOffset.z*.3)}}function jd(i,e,t){return Math.max(e,Math.min(t,i))}function $d(i){const e=i.touches[0],t=i.touches[1],n=e.clientX-t.clientX,r=e.clientY-t.clientY;return Math.sqrt(n*n+r*r)}function Kd(i){const e=i.touches[0],t=i.touches[1];return Math.atan2(t.clientY-e.clientY,t.clientX-e.clientX)}function P_(i){const e=ie.origin.x+ie.cols*ie.cellSize/2,t=ie.origin.z+ie.rows*ie.cellSize/2;i.fog=new ll(ze.atmosphere.fogColor,ze.atmosphere.fogDensity);const n=new $v(15268832,2835507,1.35);i.add(n);const r=new ex(4023888,.42);i.add(r);const s=new mo(16774358,2);s.position.set(e+10,16,t-7),s.target.position.set(e,0,t),s.castShadow=ze.enableShadows,s.shadow.mapSize.width=2048,s.shadow.mapSize.height=2048,s.shadow.camera.near=.5,s.shadow.camera.far=52,s.shadow.camera.left=-18,s.shadow.camera.right=18,s.shadow.camera.top=16,s.shadow.camera.bottom=-16,s.shadow.bias=-7e-4,s.shadow.normalBias=.02,s.shadow.radius=4,i.add(s),i.add(s.target);const o=new mo(11064550,.65);o.position.set(e-13,10,t+9),o.target.position.set(e,0,t),i.add(o),i.add(o.target);const a=new mo(11991002,.4);a.position.set(e,6,t+18),a.target.position.set(e,.4,t),i.add(a),i.add(a.target);const l=ie.spawnCell,c=new po(6870527,2.4,9,1.6);c.position.set(ie.origin.x+l[0]*ie.cellSize+ie.cellSize/2,1.6,ie.origin.z+l[1]*ie.cellSize+ie.cellSize/2),i.add(c);const u=ie.goalCell,d=new po(16744284,2.1,9,1.7);return d.position.set(ie.origin.x+u[0]*ie.cellSize+ie.cellSize/2,1.6,ie.origin.z+u[1]*ie.cellSize+ie.cellSize/2),i.add(d),{update(h){const f=1.9+Math.sin(h*ze.atmosphere.spawnPulseSpeed)*.55,g=1.7+Math.sin(h*ze.atmosphere.goalPulseSpeed+1.2)*.45;c.intensity=f,d.intensity=g,c.position.y=1.55+Math.sin(h*1.7)*.08,d.position.y=1.55+Math.sin(h*1.35+.8)*.08,s.intensity=1.95+Math.sin(h*.35)*.08,o.intensity=.62+Math.sin(h*.27+1.5)*.04,a.intensity=.38+Math.sin(h*.41+.3)*.03}}}const Zd={arrow:9136404,arrow_rapid:11044146,arrow_pierce:7229967,cannon:5592405,ice:6737151,fire:16733440,lightning:16772608,poison:6750003,sniper:3355545,cannon_siege:4013380,ice_glacier:3121112,fire_inferno:13840128,lightning_storm:14205952,poison_plague:3129119,sniper_railgun:2039662},kl={arrow:14527027,arrow_rapid:16763989,arrow_pierce:12290082,cannon:8947848,ice:11202303,fire:16746564,lightning:16777130,poison:11206519,sniper:6710988,cannon_siege:12303300,ice_glacier:14546687,fire_inferno:16759654,lightning_storm:16777181,poison_plague:13434794,sniper_railgun:10066414};class L_{constructor(e){J(this,"scene");J(this,"meshes",new Map);J(this,"sellingTowers",new Set);J(this,"rangeRing",null);J(this,"time",0);this.scene=e}sync(e){const t=new Set(e.towers.map(n=>n.id));for(const[n,r]of this.meshes)t.has(n)||(this.scene.remove(r),this.meshes.delete(n));for(const n of e.towers)if(!this.meshes.has(n.id)){const r=this.createTowerMesh(n);r.scale.set(0,0,0),r.userData.buildProgress=0,this.scene.add(r),this.meshes.set(n.id,r)}}removeTower(e){const t=this.meshes.get(e);t&&(this.sellingTowers.add({group:t,timer:.25,maxTimer:.25}),this.meshes.delete(e))}animate(e,t){this.time+=e;const n=this.time;for(const r of this.sellingTowers)if(r.timer-=e,r.timer<=0)this.scene.remove(r.group),this.sellingTowers.delete(r);else{const s=r.timer/r.maxTimer,o=s*s*s;r.group.scale.set(o,o,o),r.group.rotation.y+=e*10}for(const r of t.towers){const s=this.meshes.get(r.id);if(!s)continue;const o=s.userData;if(o.buildProgress<1){o.buildProgress=Math.min(1,o.buildProgress+e*3);const l=o.buildProgress,c=2*Math.PI/3,u=l===1?1:Math.pow(2,-10*l)*Math.sin((l*10-.75)*c)+1;s.scale.set(u,u,u)}if(r.cooldownRemaining>o.lastCooldown&&(o.attackTimer=.15),o.lastCooldown=r.cooldownRemaining,o.buildProgress>=1)if(o.attackTimer>0){o.attackTimer-=e;const l=Math.max(0,o.attackTimer/.15),c=1+l*.12;o.turretGroup?o.turretGroup.scale.set(c,c,c):s.scale.set(c,c,c),o.recoilNode&&(o.recoilNode.position.z=-(o.recoilAmount??.08)*l),o.energyRingMaterial&&(o.energyRingMaterial.emissiveIntensity=.3+l*.75)}else o.turretGroup&&o.turretGroup.scale.set(1,1,1),o.recoilNode&&(o.recoilNode.position.z=0),s.scale.set(1,1,1),o.energyRingMaterial&&(o.energyRingMaterial.emissiveIntensity=.22+Math.sin(n*2.5)*.08);let a=null;if(r.targetId!==null&&r.targetId!==void 0){const l=t.enemies.find(c=>c.id===r.targetId);if(l){const c=l.worldX-r.worldX,u=l.worldZ-r.worldZ;(c!==0||u!==0)&&(a=Math.atan2(c,u))}}if(a===null&&r.aimAngle!==void 0&&(a=r.aimAngle),a!==null&&o.turretGroup){let l=a-o.turretGroup.rotation.y;l=Math.atan2(Math.sin(l),Math.cos(l)),o.turretGroup.rotation.y+=l*10*e}if(o.spin)for(const l of o.spin)l.node.rotation[l.axis]+=e*l.speed;if(o.bob)for(const l of o.bob)l.node.position.y=l.baseY+Math.sin(n*l.speed+l.phase)*l.amp;if(o.pulseScale)for(const l of o.pulseScale){const c=l.base+Math.sin(n*l.speed+l.phase)*l.amp;l.yOnly?l.node.scale.y=c:l.node.scale.set(c,c,c)}if(o.pulseEmissive)for(const l of o.pulseEmissive)l.mat.emissiveIntensity=l.base+Math.sin(n*l.speed+l.phase)*l.amp;if(o.orbit)for(const l of o.orbit)l.pivot.rotation.y+=e*l.speed;if(o.rise)for(const l of o.rise){const c=(n*l.speed+l.phase)%1;l.node.position.y=l.baseY+c*l.height;const u=1-c;l.node.scale.setScalar(.4+u*.6)}if(o.arcs&&o.arcOrigin&&(o.arcTimer=(o.arcTimer??0)-e,o.arcTimer<=0)){o.arcTimer=.06;for(const l of o.arcs){const c=l.geometry.attributes.position,u=o.arcOrigin,d=Math.random()*Math.PI*2,h=.22+Math.random()*.16,f=u.x+Math.cos(d)*h,g=u.y-.1-Math.random()*.25,v=u.z+Math.sin(d)*h,m=c.count;for(let p=0;p<m;p++){const b=p/(m-1),w=(Math.random()-.5)*.08*(p>0&&p<m-1?1:0),_=(Math.random()-.5)*.08*(p>0&&p<m-1?1:0);c.setXYZ(p,u.x+(f-u.x)*b+w,u.y+(g-u.y)*b+_,u.z+(v-u.z)*b+w)}c.needsUpdate=!0,l.visible=Math.random()>.25}}}}showRange(e,t){if(!this.rangeRing){this.rangeRing=new It;const o=new Re(new Ni(.92,1,64),new Be({color:16777215,transparent:!0,opacity:.16,side:st,depthWrite:!1}));o.rotation.x=-Math.PI/2;const a=new Re(new Ni(.6,.66,64),new Be({color:16777215,transparent:!0,opacity:.08,side:st,depthWrite:!1}));a.rotation.x=-Math.PI/2;const l=new Re(new ho(.98,48),new Be({color:16777215,transparent:!0,opacity:.04,side:st,depthWrite:!1}));l.rotation.x=-Math.PI/2,l.position.y=-.002,this.rangeRing.add(o,a,l),this.rangeRing.userData={outer:o,inner:a,pulse:l},this.scene.add(this.rangeRing)}const n=kl[e.type]??16777215,r=this.rangeRing.userData;r.outer.material.color.setHex(n),r.inner.material.color.setHex(n),r.pulse.material.color.setHex(n);const s=1+Math.sin(this.time*3.2)*.06;r.pulse.scale.setScalar(s),r.pulse.position.y=.002,this.rangeRing.scale.set(t,t,1),this.rangeRing.position.set(e.worldX,.03,e.worldZ),this.rangeRing.visible=!0}hideRange(){this.rangeRing&&(this.rangeRing.visible=!1)}measure(e){const t=this.meshes.get(e);if(!t)return null;const n=new en().setFromObject(t);let r=0;const s=new Set;return t.traverse(o=>{const a=o;if(a.isMesh){r+=1;for(const l of Array.isArray(a.material)?a.material:[a.material]){const c=l;c!=null&&c.color&&Qd.has(c.name)&&s.add("#"+c.color.getHexString())}}}),{高:+(n.max.y-n.min.y).toFixed(3),件:r,色:[...s].sort()}}createTowerMesh(e){const t=new It,n=Rt(e.col,e.row);t.position.set(n.x,0,n.z);const r=t.userData;r.buildProgress=0,r.lastCooldown=0,r.attackTimer=0;const s=Jd[e.type]??Jd.arrow,o=new se(Zd[e.type]??Zd.arrow),a=new se(kl[e.type]??kl.arrow),l=["bottom","middle","top"],c=["towers/towerRound_base.glb"];for(let h=0;h<=Math.min(e.level,2);h+=1)c.push(`towers/${s.家}_${l[h]}${s.款}.glb`);let u=0;for(const h of c){const f=Kt(h);f.position.y=u,xo(f,o,a),t.add(f),u+=h.includes("_base")?.21:.5}const d=new It;if(d.position.y=u,t.add(d),r.turretGroup=d,s.武器){const h=Kt(`towers/weapon_${s.武器}.glb`);h.scale.setScalar(s.武器大細??1),xo(h,a,o);const f=new It;f.add(h),d.add(f),r.recoilNode=f,r.recoilAmount=.09}else{const h=Kt(`towers/${s.家}_roof${s.款}.glb`);xo(h,o,a),d.add(h);const f=new en().setFromObject(h).max.y,g=Kt("towers/towerRound_crystals.glb");g.position.y=f+.16,g.scale.setScalar(.55),xo(g,a,a),d.add(g),r.spin=[{node:g,axis:"y",speed:.7}]}return t}}const Jd={arrow:{家:"towerRound",款:"A",武器:"ballista"},arrow_rapid:{家:"towerRound",款:"B",武器:"ballista",武器大細:.85},arrow_pierce:{家:"towerRound",款:"C",武器:"ballista",武器大細:1.15},cannon:{家:"towerSquare",款:"A",武器:"cannon"},cannon_siege:{家:"towerSquare",款:"C",武器:"cannon",武器大細:1.2},ice:{家:"towerRound",款:"B"},ice_glacier:{家:"towerRound",款:"C"},fire:{家:"towerSquare",款:"B",武器:"catapult"},fire_inferno:{家:"towerSquare",款:"C",武器:"catapult",武器大細:1.15},lightning:{家:"towerRound",款:"C",武器:"blaster"},lightning_storm:{家:"towerRound",款:"A",武器:"blaster",武器大細:1.15},poison:{家:"towerSquare",款:"B"},poison_plague:{家:"towerSquare",款:"A"},sniper:{家:"towerSquare",款:"C",武器:"blaster",武器大細:1.3},sniper_railgun:{家:"towerSquare",款:"B",武器:"blaster",武器大細:1.45}},Qd=new Set(["red","purple"]),I_=new Set(["wood","crystal"]);function xo(i,e,t){i.traverse(n=>{const r=n;if(!r.isMesh)return;const o=(Array.isArray(r.material)?r.material:[r.material]).map(a=>{const l=a,c=Qd.has(l.name),u=I_.has(l.name);if(!c&&!u)return l;const d=l.clone();return d.color.copy(c?e:t),l.name==="purple"&&d.color.multiplyScalar(.68),d});r.material=Array.isArray(r.material)?o:o[0]})}const cs=(i,e=10)=>(t,n,r)=>{t.oy+=Math.abs(Math.sin(n*e+r))*i},eh=(i,e)=>(t,n,r)=>{t.oy+=Math.sin(n*e+r)*i},th={grunt:{barY:.95,shadowScale:1},tank:{barY:1.05,shadowScale:1.55},runner:{barY:.9,shadowScale:.95},swarm:{barY:.72,shadowScale:.65},shield:{barY:1.1,shadowScale:1.1},healer:{barY:1.15,shadowScale:1},boss:{barY:2.1,shadowScale:1.95}},nh={grunt:{檔:"skeleton",縮:.6,抬:.39},tank:{檔:"digger",縮:.52,抬:.39},runner:{檔:"ghost",縮:.46,抬:1.43},swarm:{檔:"skeleton",縮:.38,色:10475680,抬:.39},shield:{檔:"zombie",縮:.58,色:8373992,抬:.39},healer:{檔:"vampire",縮:.55,色:15771856,抬:.48},boss:{檔:"vampire",縮:1.15,色:16751181,抬:.48}},D_={grunt:cs(.055,9),tank:cs(.035,5.5),runner:eh(.08,3.2),swarm:cs(.07,13),shield:cs(.04,7),healer:eh(.05,2.4),boss:cs(.06,4)},Ol={grunt:[],tank:[],runner:[],swarm:[],shield:[],healer:[],boss:[]};function U_(){for(const i of Object.keys(nh)){const e=nh[i],t=Kt(`enemies/${e.檔}.glb`);t.updateMatrixWorld(!0);const n=[];t.traverse(r=>{const s=r;if(!s.isMesh)return;const o=s.geometry.clone();o.applyMatrix4(s.matrixWorld),o.scale(e.縮,e.縮,e.縮),o.translate(0,e.抬*e.縮,0);for(const a of Array.isArray(s.material)?s.material:[s.material]){const l=a.clone();e.色&&l.color.lerp(new se(e.色),.55),n.push({geo:o,mat:l,offset:new A(0,0,0),anim:D_[i]});break}}),Ol[i]=n}}const N_=100,us=.5,Bl=100,ih=new Sn(1,.06),F_=new Sn(1,.04),k_=new ho(.26,12),O_=new Ni(.18,.24,12);class B_{constructor(e){J(this,"scene");J(this,"instancedMeshGroups",new Map);J(this,"dummy",new ut);J(this,"animOut",{ox:0,oy:0,oz:0,rx:0,ry:0,rz:0,s:1});J(this,"mHpBg",new Be({color:3355443,side:st,depthWrite:!1}));J(this,"mHpGreen",new Be({color:4521796,side:st,depthWrite:!1}));J(this,"mHpYellow",new Be({color:16755200,side:st,depthWrite:!1}));J(this,"mHpRed",new Be({color:16724787,side:st,depthWrite:!1}));J(this,"mShield",new Be({color:4491519,side:st,depthWrite:!1}));J(this,"mShadow",new Be({color:0,transparent:!0,opacity:.18,side:st,depthWrite:!1}));J(this,"mHaloBoss",new Be({color:16752215,transparent:!0,opacity:.5,side:st,depthWrite:!1}));J(this,"mHaloShield",new Be({color:7131135,transparent:!0,opacity:.5,side:st,depthWrite:!1}));J(this,"mHaloSlow",new Be({color:9300223,transparent:!0,opacity:.5,side:st,depthWrite:!1}));J(this,"mHaloDot",new Be({color:7667562,transparent:!0,opacity:.5,side:st,depthWrite:!1}));J(this,"poolHpBg",[]);J(this,"poolHpFill",[]);J(this,"poolShield",[]);J(this,"poolShadow",[]);J(this,"poolHalo",[]);this.scene=e,this.dummy.rotation.order="YXZ",this.initPool()}initPool(){const e=(t,n,r)=>{const s=new Re(t,n);return s.visible=!1,s.renderOrder=r,this.scene.add(s),s};for(let t=0;t<Bl;t++)this.poolHpBg.push(e(ih,this.mHpBg,1)),this.poolHpFill.push(e(ih,this.mHpGreen,2)),this.poolShield.push(e(F_,this.mShield,2)),ze.isMobile||(this.poolShadow.push(e(k_,this.mShadow,0)),this.poolHalo.push(e(O_,this.mHaloDot,0)))}getOrCreate(e){let t=this.instancedMeshGroups.get(e);if(!t){t=[];const n=Ol[e];for(const r of n){const s=new Ku(r.geo,r.mat,N_);s.count=0,ze.enableShadows&&(s.castShadow=!0,s.receiveShadow=!0),this.scene.add(s),t.push(s)}this.instancedMeshGroups.set(e,t)}return t}sync(e,t,n){const r=new Map,s=[];for(const u of e.enemies){if(!u.alive||u.reached)continue;let d=r.get(u.type);d||(d=[],r.set(u.type,d)),d.push(u),s.push(u)}const o=performance.now()*.001,a=this.animOut,l=["grunt","tank","runner","swarm","shield","healer","boss"];for(const u of l){const d=this.getOrCreate(u),h=r.get(u)||[];for(const g of d)g.count=h.length;const f=Ol[u];for(let g=0;g<h.length;g++){const v=h[g],m=v.worldX-v.prevWorldX,p=v.worldZ-v.prevWorldZ;let b=0;Math.abs(m)>.001||Math.abs(p)>.001?(b=Math.atan2(m,p),v.displayRot=b):v.displayRot!==void 0&&(b=v.displayRot);const w=v.id*.7;for(let _=0;_<f.length;_++){const I=f[_];a.ox=0,a.oy=0,a.oz=0,a.rx=0,a.ry=0,a.rz=0,a.s=1,I.anim&&I.anim(a,o,w),this.dummy.position.set(v.worldX+a.ox,a.oy,v.worldZ+a.oz),this.dummy.position.add(I.offset),this.dummy.rotation.set(a.rx,b+a.ry,a.rz),I.rotation&&(this.dummy.rotation.x+=I.rotation.x,this.dummy.rotation.y+=I.rotation.y,this.dummy.rotation.z+=I.rotation.z),I.scale?this.dummy.scale.copy(I.scale).multiplyScalar(a.s):this.dummy.scale.set(a.s,a.s,a.s),this.dummy.updateMatrix(),d[_].setMatrixAt(g,this.dummy.matrix)}}for(const g of d)g.instanceMatrix.needsUpdate=!0}const c=Math.min(s.length,Bl);for(let u=0;u<c;u++){const d=s[u],h=d.type==="boss",f=th[d.type].barY,g=Math.max(0,d.hp/d.maxHp),v=us*g,m=this.poolHpBg[u];m.scale.set(us,1,1),m.position.set(d.worldX,f,d.worldZ),m.visible=!0,n?m.lookAt(n.position):m.rotation.x=-Math.PI/4;const p=this.poolHpFill[u];v>.001?(p.material=g>.5?this.mHpGreen:g>.25?this.mHpYellow:this.mHpRed,p.scale.set(v,1,1),p.position.set(d.worldX-(us-v)/2,f,d.worldZ),p.visible=!0,n?p.lookAt(n.position):p.rotation.x=-Math.PI/4):p.visible=!1;const b=this.poolShield[u];if(d.maxShield>0&&d.shield>0){const w=d.shield/d.maxShield,_=us*w;b.scale.set(_,1,1),b.position.set(d.worldX-(us-_)/2,f+.07,d.worldZ),b.visible=!0,n?b.lookAt(n.position):b.rotation.x=-Math.PI/4}else b.visible=!1;if(!ze.isMobile&&u<this.poolShadow.length){const w=this.poolShadow[u];w.scale.setScalar(th[d.type].shadowScale),w.position.set(d.worldX,.01,d.worldZ),w.visible=!0;const _=this.poolHalo[u];d.slow||d.dots.length>0||d.shield>0||h?(_.material=h?this.mHaloBoss:d.shield>0?this.mHaloShield:d.slow?this.mHaloSlow:this.mHaloDot,_.position.set(d.worldX,.045,d.worldZ),_.visible=!0):_.visible=!1}}for(let u=c;u<Bl;u++)this.poolHpBg[u].visible=!1,this.poolHpFill[u].visible=!1,this.poolShield[u].visible=!1,!ze.isMobile&&u<this.poolShadow.length&&(this.poolShadow[u].visible=!1,this.poolHalo[u].visible=!1)}}const rh={arrow:16768324,arrow_rapid:16773017,arrow_pierce:9348863,cannon:16737843,ice:8969727,fire:16729088,lightning:16776960,poison:6750003,sniper:11184895},_o=i=>rh[i]??rh[i.includes("_")?i.split("_")[0]:i]??16777215,Vt=ze.maxParticles,ds=ze.isMobile?35:80,sn={minX:-6,maxX:16,minZ:-6,maxZ:16},hs={min:.4,max:4.5};class z_{constructor(e){J(this,"scene");J(this,"projScaleY",1.7);J(this,"particles",[]);J(this,"particleGeo");J(this,"particlePositions");J(this,"particleColors");J(this,"particleSizes");J(this,"particleAlphas");J(this,"particlePoints");J(this,"moteGeo");J(this,"motePositions");J(this,"moteVelocities");J(this,"motePhase");J(this,"motePoints");this.scene=e,this.particlePositions=new Float32Array(Vt*3),this.particleColors=new Float32Array(Vt*3),this.particleSizes=new Float32Array(Vt),this.particleAlphas=new Float32Array(Vt),this.particleGeo=new At,this.particleGeo.setAttribute("position",new gt(this.particlePositions,3)),this.particleGeo.setAttribute("aColor",new gt(this.particleColors,3)),this.particleGeo.setAttribute("aSize",new gt(this.particleSizes,1)),this.particleGeo.setAttribute("aAlpha",new gt(this.particleAlphas,1));const t=new wt({vertexShader:`
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
            `,transparent:!0,blending:ri,depthWrite:!1});this.particlePoints=new vl(this.particleGeo,t),this.particlePoints.frustumCulled=!1,e.add(this.particlePoints),this.initMotes()}initMotes(){this.motePositions=new Float32Array(ds*3),this.moteVelocities=new Float32Array(ds*3),this.motePhase=new Float32Array(ds);for(let t=0;t<ds;t++){const n=t*3;this.motePositions[n]=sn.minX+Math.random()*(sn.maxX-sn.minX),this.motePositions[n+1]=hs.min+Math.random()*(hs.max-hs.min),this.motePositions[n+2]=sn.minZ+Math.random()*(sn.maxZ-sn.minZ),this.moteVelocities[n]=(Math.random()-.5)*.25,this.moteVelocities[n+1]=.08+Math.random()*.18,this.moteVelocities[n+2]=(Math.random()-.5)*.25,this.motePhase[t]=Math.random()*Math.PI*2}this.moteGeo=new At,this.moteGeo.setAttribute("position",new gt(this.motePositions,3)),this.moteGeo.setAttribute("aPhase",new gt(this.motePhase,1));const e=new wt({uniforms:{uTime:{value:0},uPxPerUnit:{value:300}},vertexShader:`
                attribute float aPhase;
                uniform float uTime;
                uniform float uPxPerUnit;
                varying float vAlpha;
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 2.0);
                    vAlpha = twinkle * 0.55;
                    // 一粒塵得 0.03 個世界單位大——同場景嘅比例掛鈎，唔係寫死 px。
                    // 呢個鏡頭係 **orthographic**，畫面大細唔跟深度變，所以唔可以
                    // 除 -mvPosition.z（原本嗰條式就係當咗透視鏡頭嚟寫）。
                    gl_PointSize = clamp(0.03 * uPxPerUnit, 1.0, 5.0);
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
            `,transparent:!0,blending:ri,depthWrite:!1});this.motePoints=new vl(this.moteGeo,e),this.motePoints.frustumCulled=!1,this.scene.add(this.motePoints)}tickMotes(e,t){for(let r=0;r<ds;r++){const s=r*3,o=Math.sin(t*.8+this.motePhase[r])*.08;this.motePositions[s]+=(this.moteVelocities[s]+o)*e,this.motePositions[s+1]+=this.moteVelocities[s+1]*e,this.motePositions[s+2]+=(this.moteVelocities[s+2]-o*.5)*e,this.motePositions[s+1]>hs.max&&(this.motePositions[s]=sn.minX+Math.random()*(sn.maxX-sn.minX),this.motePositions[s+1]=hs.min,this.motePositions[s+2]=sn.minZ+Math.random()*(sn.maxZ-sn.minZ))}this.moteGeo.attributes.position.needsUpdate=!0;const n=this.motePoints.material;n.uniforms.uTime.value=t,n.uniforms.uPxPerUnit.value=window.innerHeight*.5*Math.abs(this.projScaleY)}setCamera(e){this.projScaleY=e.projectionMatrix.elements[5]}sync(e,t){for(const r of e.projectiles){if(!r.alive)continue;const s=_o(r.towerType);(r.towerType==="fire"||r.towerType==="poison"||r.towerType==="ice"||r.towerType==="sniper"||r.towerType==="lightning"||r.towerType==="arrow_rapid"||Math.random()<.28)&&this.addTrailParticle(r.x,r.y!==void 0?r.y:.8,r.z,s)}let n=0;for(let r=this.particles.length-1;r>=0;r--){const s=this.particles[r];if(s.life-=t,s.life<=0){this.particles.splice(r,1);continue}s.position.add(s.velocity.clone().multiplyScalar(t)),s.velocity.y-=2.5*t,s.velocity.multiplyScalar(.97);const o=s.life/s.maxLife,a=n*3;this.particlePositions[a]=s.position.x,this.particlePositions[a+1]=Math.max(.05,s.position.y),this.particlePositions[a+2]=s.position.z,this.particleColors[a]=s.color.r,this.particleColors[a+1]=s.color.g,this.particleColors[a+2]=s.color.b,this.particleSizes[n]=s.size*o,this.particleAlphas[n]=o,n++}this.particleGeo.setDrawRange(0,n),this.particleGeo.attributes.position.needsUpdate=!0,this.particleGeo.attributes.aColor.needsUpdate=!0,this.particleGeo.attributes.aSize.needsUpdate=!0,this.particleGeo.attributes.aAlpha.needsUpdate=!0,this.tickMotes(t,performance.now()*.001)}addExplosion(e,t,n){const r=new se(_o(n)),s=16+Math.floor(Math.random()*10);for(let o=0;o<s&&this.particles.length<Vt;o++){const a=Math.random()*Math.PI*2,l=1.5+Math.random()*3,c=1+Math.random()*2.5;this.particles.push({position:new A(e,.3,t),velocity:new A(Math.cos(a)*l,c,Math.sin(a)*l),life:.4+Math.random()*.3,maxLife:.7,color:r.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.15+Math.random()*.15})}}addDeathEffect(e,t,n){const r=new se(n),s=22+Math.floor(Math.random()*10);for(let o=0;o<s&&this.particles.length<Vt;o++){const a=Math.random()*Math.PI*2,l=2+Math.random()*4,c=1.5+Math.random()*3;this.particles.push({position:new A(e,.4,t),velocity:new A(Math.cos(a)*l,c,Math.sin(a)*l),life:.5+Math.random()*.4,maxLife:.9,color:r.clone().offsetHSL(Math.random()*.15-.075,0,Math.random()*.3-.1),size:.18+Math.random()*.2})}for(let o=0;o<5&&this.particles.length<Vt;o++)this.particles.push({position:new A(e,.5,t),velocity:new A((Math.random()-.5)*.5,2+Math.random(),(Math.random()-.5)*.5),life:.3,maxLife:.3,color:new se(16777215),size:.3+Math.random()*.2})}addTrailParticle(e,t,n,r){if(this.particles.length>=Vt)return;const s=new se(r);this.particles.push({position:new A(e+(Math.random()-.5)*.1,t+(Math.random()-.5)*.1,n+(Math.random()-.5)*.1),velocity:new A(0,Math.random()*.5,0),life:.2+Math.random()*.2,maxLife:.4,color:s.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.1+Math.random()*.1})}addBuildEffect(e,t){const r=new se(4906624);for(let s=0;s<15&&!(this.particles.length>=Vt);s++){const o=s/15*Math.PI*2,a=1+Math.random()*1.5;this.particles.push({position:new A(e,.2,t),velocity:new A(Math.cos(o)*a,.5+Math.random(),Math.sin(o)*a),life:.4+Math.random()*.2,maxLife:.6,color:r.clone().offsetHSL(0,0,Math.random()*.2),size:.15+Math.random()*.1})}}addMuzzleFlash(e,t,n){const r=new se(_o(n));this.particles.length<Vt&&this.particles.push({position:new A(e,1,t),velocity:new A(0,.4,0),life:.14,maxLife:.14,color:new se(16777215),size:.45});const s=5;for(let o=0;o<s&&this.particles.length<Vt;o++){const a=Math.random()*Math.PI*2,l=1.4+Math.random()*1.2;this.particles.push({position:new A(e,.9,t),velocity:new A(Math.cos(a)*l*.4,1.2+Math.random()*.6,Math.sin(a)*l*.4),life:.22+Math.random()*.14,maxLife:.36,color:r.clone().offsetHSL(Math.random()*.08-.04,0,Math.random()*.2),size:.14+Math.random()*.1})}}addImpactFlash(e,t,n,r){const s=new se(_o(r));for(let a=0;a<3&&this.particles.length<Vt;a++)this.particles.push({position:new A(e,.35,t),velocity:new A(0,.6,0),life:.16,maxLife:.16,color:new se(16777215),size:.5+n*.1});const o=Math.min(24,12+Math.floor(n*4));for(let a=0;a<o&&this.particles.length<Vt;a++){const l=a/o*Math.PI*2+Math.random()*.2,c=n*(1.6+Math.random()*.8);this.particles.push({position:new A(e,.2,t),velocity:new A(Math.cos(l)*c,.4+Math.random()*.5,Math.sin(l)*c),life:.32+Math.random()*.2,maxLife:.52,color:s.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.18+Math.random()*.12})}}addSellEffect(e,t){const r=new se(16498468);for(let s=0;s<15&&!(this.particles.length>=Vt);s++){const o=s/15*Math.PI*2,a=1.5+Math.random()*2;this.particles.push({position:new A(e,.5,t),velocity:new A(Math.cos(o)*a,1.5+Math.random()*2,Math.sin(o)*a),life:.3+Math.random()*.2,maxLife:.5,color:r.clone().offsetHSL(.05*Math.random(),0,Math.random()*.2),size:.15+Math.random()*.15})}}}class H_{constructor(e){J(this,"scene");J(this,"projMeshes",new Map);this.scene=e}sync(e,t){const n=new Set;for(const r of e.projectiles){if(!r.alive)continue;n.add(r.id);let s=this.projMeshes.get(r.id);s||(s=this.createProjectileMesh(r.towerType),this.scene.add(s),this.projMeshes.set(r.id,s)),s.position.set(r.x,r.y!==void 0?r.y:.8,r.z);const o=s.userData.glow??null;if(o){const a=1+Math.sin(performance.now()*.02+r.id)*.12;o.scale.setScalar(a)}if(r.towerType!=="cannon"&&r.towerType!=="fire"&&r.towerType!=="poison"){const a=r.targetX-r.startX,l=r.targetZ-r.startZ,c=Math.min(1,r.progress+.05),u=r.startX+a*c,d=r.startZ+l*c;let f=r.startY+(r.targetY-r.startY)*c;r.arcHeight>0&&(f+=Math.sin(c*Math.PI)*r.arcHeight),c>r.progress&&s.lookAt(u,f,d)}else(r.towerType==="poison"||r.towerType==="cannon")&&(s.rotation.x+=t*5,s.rotation.z+=t*3);r.towerType==="sniper"&&(s.scale.z=1.15+Math.sin(performance.now()*.03+r.id)*.08)}for(const[r,s]of this.projMeshes.entries())n.has(r)||(this.scene.remove(s),this.projMeshes.delete(r))}createProjectileMesh(e){const t=new It;switch(e.includes("_")?e.split("_")[0]:e){case"arrow":{const r=new Cn(.02,.02,.6,6);r.rotateX(Math.PI/2),r.rotateX(Math.PI/2);const s=new ts({color:9132587}),o=new Re(r,s),a=new es(.06,.2,4);a.rotateX(-Math.PI/2),a.translate(0,0,-.3);const l=new Mn({color:13421772,metalness:.8,roughness:.2}),c=new Re(a,l),u=new jn(.15,.15,.1);u.translate(0,0,.3);const d=e==="arrow_pierce"?8232191:e==="arrow_rapid"?16774320:14492194,h=new ts({color:d}),f=new Re(u,h);if(t.add(o,c,f),e==="arrow_pierce"||e==="arrow_rapid"){const g=new Re(new $n(.12,8,8),new Be({color:e==="arrow_pierce"?10005247:16772761,transparent:!0,opacity:.22}));g.position.z=.08,t.add(g),t.userData.glow=g}break}case"cannon":{const r=new Mn({color:2236962,roughness:.8,metalness:.4}),s=new $n(.2,12,12),o=new Re(s,r);t.add(o);break}case"fire":{const r=new Be({color:16755200}),s=new $n(.15,8,8),o=new Re(s,r);t.add(o);const a=new Be({color:16729088,transparent:!0,opacity:.6}),l=new $n(.25,8,8),c=new Re(l,a);t.add(c),t.userData.glow=c;break}case"poison":{const r=new Mn({color:4521762,roughness:.2,transparent:!0,opacity:.8}),s=new $n(.18,12,12),o=new Re(s,r);o.scale.set(1,.7,1),t.add(o);break}case"ice":{const r=new Mn({color:11197951,roughness:.1,transparent:!0,opacity:.8}),s=new es(.1,.6,6);s.rotateX(-Math.PI/2);const o=new Re(s,r);t.add(o);const a=new Re(new $n(.18,8,8),new Be({color:12514303,transparent:!0,opacity:.16}));t.add(a),t.userData.glow=a;break}case"sniper":{const r=new Be({color:5605631}),s=new Cn(.03,.03,1.2,6);s.rotateX(Math.PI/2);const o=new Re(s,r);t.add(o);const a=new Re(new Cn(.06,.06,1.6,8),new Be({color:8961023,transparent:!0,opacity:.14}));a.rotateX(Math.PI/2),a.position.z=.08,t.add(a),t.userData.glow=a;break}case"lightning":{const r=new Re(new Cn(.018,.018,.9,5),new Be({color:16777215}));r.rotateX(Math.PI/2),t.add(r);const s=new Re(new Cn(.065,.065,1.1,8),new Be({color:16774565,transparent:!0,opacity:.18}));s.rotateX(Math.PI/2),t.add(s),t.userData.glow=s;break}}return t.traverse(r=>{r instanceof Re&&(e==="arrow"||e==="cannon")&&(r.castShadow=!0)}),t}}const sh={valid:4521796,invalid:16729156};class G_{constructor(e){J(this,"raycaster",new hx);J(this,"mouse",new we);J(this,"groundPlane",new mi(new A(0,1,0),0));J(this,"ghostMesh",null);J(this,"rangeRing",null);J(this,"scene");J(this,"hoveredCol",-1);J(this,"hoveredRow",-1);this.scene=e}updateMouse(e,t){let n,r;if("touches"in e){if(e.touches.length===0)return;n=e.touches[0].clientX,r=e.touches[0].clientY}else n=e.clientX,r=e.clientY;this.mouse.x=n/window.innerWidth*2-1,this.mouse.y=-(r/window.innerHeight)*2+1,this.raycaster.setFromCamera(this.mouse,t);const s=new A;if(this.raycaster.ray.intersectPlane(this.groundPlane,s),s){const o=Math.floor((s.x-ie.origin.x)/ie.cellSize),a=Math.floor((s.z-ie.origin.z)/ie.cellSize);o>=0&&o<ie.cols&&a>=0&&a<ie.rows?(this.hoveredCol=o,this.hoveredRow=a):(this.hoveredCol=-1,this.hoveredRow=-1)}}showGhost(e,t,n,r,s){if(!this.ghostMesh){const a=new Cn(.35,.4,.5,8),l=new Be({transparent:!0,opacity:.4,depthWrite:!1});this.ghostMesh=new Re(a,l),this.scene.add(this.ghostMesh)}const o=Rt(e,t);if(this.ghostMesh.position.set(o.x,.25,o.z),this.ghostMesh.visible=!0,this.ghostMesh.material.color.setHex(n?sh.valid:sh.invalid),s&&s>0){if(!this.rangeRing){const a=new Ni(.95,1,48),l=new Be({color:4521864,transparent:!0,opacity:.2,side:st,depthWrite:!1});this.rangeRing=new Re(a,l),this.rangeRing.rotation.x=-Math.PI/2,this.scene.add(this.rangeRing)}this.rangeRing.scale.set(s,s,1),this.rangeRing.position.set(o.x,.02,o.z),this.rangeRing.visible=!0,this.rangeRing.material.color.setHex(n?4521864:16737860)}else this.rangeRing&&(this.rangeRing.visible=!1)}hideGhost(){this.ghostMesh&&(this.ghostMesh.visible=!1),this.rangeRing&&(this.rangeRing.visible=!1)}}const oh={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class fs{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const V_=new $r(-1,1,1,-1,0,1);class W_ extends At{constructor(){super(),this.setAttribute("position",new pt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new pt([0,2,0,0,2,0],2))}}const X_=new W_;class ah{constructor(e){this._mesh=new Re(X_,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,V_)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class lh extends fs{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof wt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Ks.clone(e.uniforms),this.material=new wt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new ah(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class ch extends fs{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const r=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),s.buffers.stencil.setFunc(r.ALWAYS,o,4294967295),s.buffers.stencil.setClear(a),s.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.color.setMask(!0),s.buffers.depth.setMask(!0),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(r.EQUAL,1,4294967295),s.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),s.buffers.stencil.setLocked(!0)}}class q_ extends fs{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class Y_{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new we);this._width=n.width,this._height=n.height,t=new pn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:zn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new lh(oh),this.copyPass.material.blending=kn,this.clock=new nx}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let r=0,s=this.passes.length;r<s;r++){const o=this.passes[r];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(r),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}ch!==void 0&&(o instanceof ch?n=!0:o instanceof q_&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new we);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let s=0;s<this.passes.length;s++)this.passes[s].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class j_ extends fs{constructor(e,t,n=null,r=null,s=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=s,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new se}render(e,t,n){const r=e.autoClear;e.autoClear=!1;let s,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(s=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(s),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=r}}const $_={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new se(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Tr extends fs{constructor(e,t,n,r){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=r,this.resolution=e!==void 0?new we(e.x,e.y):new we(256,256),this.clearColor=new se(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new pn(s,o,{type:zn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let d=0;d<this.nMips;d++){const h=new pn(s,o,{type:zn});h.texture.name="UnrealBloomPass.h"+d,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const f=new pn(s,o,{type:zn});f.texture.name="UnrealBloomPass.v"+d,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),s=Math.round(s/2),o=Math.round(o/2)}const a=$_;this.highPassUniforms=Ks.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new wt({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];s=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let d=0;d<this.nMips;d++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[d])),this.separableBlurMaterials[d].uniforms.invSize.value=new we(1/s,1/o),s=Math.round(s/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1),new A(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const u=oh;this.copyUniforms=Ks.clone(u.uniforms),this.blendMaterial=new wt({uniforms:this.copyUniforms,vertexShader:u.vertexShader,fragmentShader:u.fragmentShader,blending:ri,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new se,this.oldClearAlpha=1,this.basic=new Be,this.fsQuad=new ah(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let s=0;s<this.nMips;s++)this.renderTargetsHorizontal[s].setSize(n,r),this.renderTargetsVertical[s].setSize(n,r),this.separableBlurMaterials[s].uniforms.invSize.value=new we(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(e,t,n,r,s){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=Tr.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Tr.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=o}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new wt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new we(.5,.5)},direction:{value:new we(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
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
				}`})}getCompositeMaterial(e){return new wt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
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
				}`})}}Tr.BlurDirectionX=new we(1,0),Tr.BlurDirectionY=new we(0,1);class K_{constructor(e,t,n){J(this,"composer");J(this,"bloomPass");J(this,"gradePass");this.composer=new Y_(e);const r=new j_(t,n);this.composer.addPass(r),this.bloomPass=new Tr(new we(window.innerWidth,window.innerHeight),ze.atmosphere.bloomStrength,ze.atmosphere.bloomRadius,ze.atmosphere.bloomThreshold),this.composer.addPass(this.bloomPass),this.gradePass=new lh(new wt({uniforms:{tDiffuse:{value:null},uTime:{value:0},uVignetteStrength:{value:ze.atmosphere.vignetteStrength},uGrainAmount:{value:ze.atmosphere.grainAmount},uContrast:{value:1.06},uSaturation:{value:1.08},uTint:{value:new A(.98,1.02,.98)}},vertexShader:`
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
                `}),"tDiffuse"),this.composer.addPass(this.gradePass)}render(){this.gradePass.uniforms.uTime.value=performance.now()*.001,this.composer.render()}resize(e,t){this.composer.setSize(e,t),this.bloomPass.setSize(e,t)}setTint(e,t,n){this.gradePass.uniforms.uTint.value.set(e,t,n)}}class Z_{constructor(){J(this,"ctx",null);J(this,"enabled",!0);J(this,"musicStarted",!1);J(this,"musicMaster",null);J(this,"prepGain",null);J(this,"waveGain",null);J(this,"musicPhase","off");J(this,"waveBeatTimer",null)}init(){this.ctx||(this.ctx=new(window.AudioContext||window.webkitAudioContext)),this.ctx.state==="suspended"&&this.ctx.resume()}toggle(){return this.enabled=!this.enabled,this.musicMaster&&this.ctx&&this.musicMaster.gain.linearRampToValueAtTime(this.enabled?1:0,this.ctx.currentTime+.2),this.enabled}playTone(e,t,n,r){if(!this.enabled||!this.ctx)return;const s=this.ctx.createOscillator(),o=this.ctx.createGain();s.type=t,s.frequency.setValueAtTime(e,this.ctx.currentTime),s.connect(o),o.connect(this.ctx.destination),o.gain.setValueAtTime(r,this.ctx.currentTime),o.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+n),s.start(),s.stop(this.ctx.currentTime+n)}playShoot(){this.playTone(400,"square",.1,.05)}playHit(){this.playTone(150,"sawtooth",.15,.05)}playBuild(){this.playTone(600,"sine",.2,.1),setTimeout(()=>this.playTone(800,"sine",.2,.1),100)}playSell(){this.playTone(500,"triangle",.2,.1),setTimeout(()=>this.playTone(300,"triangle",.3,.1),100)}playError(){this.playTone(100,"sawtooth",.2,.1)}playStreakStinger(){if(!this.enabled||!this.ctx)return;[523,659,784,988].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"triangle",.18,.06),n*60)})}playMegaStingerHit(){if(!this.enabled||!this.ctx)return;[392,523,659,784,1047].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"sawtooth",.22,.07),n*70)})}playBossRoar(){if(!this.enabled||!this.ctx)return;const e=this.ctx,t=e.currentTime,n=e.createOscillator();n.type="sawtooth",n.frequency.setValueAtTime(50,t),n.frequency.exponentialRampToValueAtTime(28,t+.9);const r=e.createGain();r.gain.setValueAtTime(.18,t),r.gain.exponentialRampToValueAtTime(.01,t+1),n.connect(r),r.connect(e.destination),n.start(t),n.stop(t+1.05);const s=e.createBuffer(1,e.sampleRate*.8,e.sampleRate),o=s.getChannelData(0);for(let u=0;u<o.length;u++)o[u]=(Math.random()*2-1)*(1-u/o.length);const a=e.createBufferSource();a.buffer=s;const l=e.createGain();l.gain.setValueAtTime(.08,t),l.gain.exponentialRampToValueAtTime(.01,t+.8);const c=e.createBiquadFilter();c.type="lowpass",c.frequency.value=400,a.connect(c),c.connect(l),l.connect(e.destination),a.start(t),a.stop(t+.8)}playVictory(){if(!this.enabled||!this.ctx)return;[523,659,784,1047,1319].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"triangle",.35,.08),n*110)})}playDefeat(){if(!this.enabled||!this.ctx)return;[523,466,392,311].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"sawtooth",.4,.08),n*150)})}startMusic(){if(this.musicStarted||!this.ctx)return;this.musicStarted=!0;const e=this.ctx,t=e.createGain();t.gain.value=this.enabled?1:0,t.connect(e.destination),this.musicMaster=t;const n=e.createGain();n.gain.value=.035;const r=e.createBiquadFilter();r.type="lowpass",r.frequency.value=420,r.Q.value=.4,n.connect(r),r.connect(t);for(const l of[55,82]){const c=e.createOscillator();c.type="sine",c.frequency.value=l;const u=e.createOscillator();u.frequency.value=.07;const d=e.createGain();d.gain.value=2.5,u.connect(d),d.connect(c.frequency),c.connect(n),c.start(),u.start()}const s=e.createGain();s.gain.value=0,s.connect(t),this.prepGain=s;for(const l of[220,329.63,440]){const c=e.createOscillator();c.type="triangle",c.frequency.value=l;const u=e.createGain();u.gain.value=.02,c.connect(u),u.connect(s),c.start()}const o=e.createGain();o.gain.value=0,o.connect(t),this.waveGain=o;const a=e.createBiquadFilter();a.type="bandpass",a.frequency.value=600,a.Q.value=1.4,a.connect(o);for(const l of[110,164.81,220]){const c=e.createOscillator();c.type="sawtooth",c.frequency.value=l;const u=e.createGain();u.gain.value=.018,c.connect(u),u.connect(a),c.start()}}setMusicPhase(e){if(!this.ctx||(this.musicStarted||this.startMusic(),this.musicPhase===e))return;this.musicPhase=e;const t=this.ctx.currentTime,n=1.4,r=e==="prep"?.7:0,s=e==="wave"?.85:0;this.prepGain&&(this.prepGain.gain.cancelScheduledValues(t),this.prepGain.gain.setValueAtTime(this.prepGain.gain.value,t),this.prepGain.gain.linearRampToValueAtTime(r,t+n)),this.waveGain&&(this.waveGain.gain.cancelScheduledValues(t),this.waveGain.gain.setValueAtTime(this.waveGain.gain.value,t),this.waveGain.gain.linearRampToValueAtTime(s,t+n)),this.waveBeatTimer!==null&&(clearInterval(this.waveBeatTimer),this.waveBeatTimer=null),e==="wave"&&(this.waveBeatTimer=window.setInterval(()=>{if(!this.enabled||!this.ctx||this.musicPhase!=="wave")return;const o=this.ctx,a=o.currentTime,l=o.createOscillator();l.type="sine",l.frequency.setValueAtTime(90,a),l.frequency.exponentialRampToValueAtTime(40,a+.18);const c=o.createGain();c.gain.setValueAtTime(.08,a),c.gain.exponentialRampToValueAtTime(.001,a+.2),l.connect(c),this.musicMaster&&c.connect(this.musicMaster),l.start(a),l.stop(a+.22)},620))}}const Dt=new Z_,uh="tower-defense-v1",zl={runs:0,victories:0,totalKills:0,totalWavesCleared:0,totalTowersBuilt:0,highestWaveReached:0},Hl={prefs:{difficulty:"normal",soundEnabled:!0,speedMultiplier:1,endlessMode:!1},highScores:{},achievements:[],lifetime:{...zl}};function J_(){try{const i=localStorage.getItem(uh);if(!i)return structuredClone(Hl);const e=JSON.parse(i);return{prefs:{...Hl.prefs,...e.prefs??{}},highScores:e.highScores??{},achievements:e.achievements??[],lifetime:{...zl,...e.lifetime??{}}}}catch{return structuredClone(Hl)}}function xi(i){try{localStorage.setItem(uh,JSON.stringify(i))}catch{}}function Q_(i,e,t,n,r){const s=i.highScores[e];return!s||t>s.score?(i.highScores[e]={score:t,wave:n,rank:r,date:Date.now()},xi(i),!0):!1}function ey(i,e){return i.achievements.includes(e)?!1:(i.achievements.push(e),xi(i),!0)}function ty(i,e,t,n,r,s){i.lifetime.runs+=1,e&&(i.lifetime.victories+=1),i.lifetime.totalKills+=t,i.lifetime.totalWavesCleared+=n,i.lifetime.totalTowersBuilt+=r,s>i.lifetime.highestWaveReached&&(i.lifetime.highestWaveReached=s),xi(i)}function ny(i){i.highScores={},i.achievements=[],i.lifetime={...zl},xi(i)}const Gl=[{id:"first_blood",name:"First Blood",desc:"Score your very first kill",emoji:"🩸",check:(i,e)=>e.event==="enemyKilled"&&i.totalKills===1},{id:"streak_10",name:"Combo Rookie",desc:"Hit a 10-kill streak",emoji:"🔥",check:(i,e)=>e.event==="streakBonus"&&e.payload.streak>=10},{id:"streak_25",name:"Combo Master",desc:"Hit a 25-kill streak",emoji:"⚡",check:(i,e)=>e.event==="streakBonus"&&e.payload.streak>=25},{id:"perfect_wave",name:"Untouchable",desc:"Clear a wave without losing any lives",emoji:"🛡",check:(i,e)=>e.event==="waveCleared"&&e.payload.perfect===!0},{id:"milestone_25",name:"Holding the Line",desc:"Reach Wave 25",emoji:"🏁",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=25},{id:"milestone_50",name:"Frontline Veteran",desc:"Reach Wave 50",emoji:"🎖",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=50},{id:"milestone_75",name:"War Commander",desc:"Reach Wave 75",emoji:"👑",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=75},{id:"victory",name:"Bastion Triumphant",desc:"Clear all 99 waves",emoji:"🏆",check:(i,e)=>e.event==="gameOver"&&e.payload.won===!0},{id:"victory_hard",name:"Iron Legend",desc:"Clear all 99 waves on Hard",emoji:"💠",check:(i,e)=>e.event==="gameOver"&&e.payload.won===!0&&i.difficulty==="hard"},{id:"frugal",name:"Frugal Commander",desc:"Clear Wave 25 with only 3 towers or fewer",emoji:"💡",check:(i,e)=>e.event==="waveCleared"&&e.payload.wave>=25&&i.towers.length<=3}],Vl="towerDefense.uiLayout.v1",iy=450,ry=12;function sy(){try{return JSON.parse(localStorage.getItem(Vl)||"{}")}catch{return{}}}function oy(i){try{localStorage.setItem(Vl,JSON.stringify(i))}catch{}}let yo=sy();const dh=[],So=(i,e,t)=>Math.min(Math.max(i,e),Math.max(e,t));function ay(){window.addEventListener("click",i=>{i.stopPropagation(),i.preventDefault()},{capture:!0,once:!0})}function ki(i,e){if(!i)return;i.classList.add("draggable-panel");const t=()=>{const h=yo[e];if(!h||i.classList.contains("hidden"))return;const f=i.offsetWidth,g=i.offsetHeight;if(!f||!g)return;const v=So(h.x*(window.innerWidth-f),0,window.innerWidth-f),m=So(h.y*(window.innerHeight-g),0,window.innerHeight-g);i.style.left=`${v}px`,i.style.top=`${m}px`,i.style.right="auto",i.style.bottom="auto",i.style.transform="none"};dh.push({el:i,apply:t}),t(),new MutationObserver(t).observe(i,{attributes:!0,attributeFilter:["class"]}),window.addEventListener("resize",t);let n=0,r=-1,s=!1,o=0,a=0,l=0,c=0;const u=()=>{var f;s=!0;const h=i.getBoundingClientRect();l=o-h.left,c=a-h.top,i.style.left=`${h.left}px`,i.style.top=`${h.top}px`,i.style.right="auto",i.style.bottom="auto",i.style.transform="none",i.classList.add("ui-dragging"),(f=navigator.vibrate)==null||f.call(navigator,20)};i.addEventListener("pointerdown",h=>{if(!(s||r!==-1||!h.isPrimary)){r=h.pointerId,o=h.clientX,a=h.clientY;try{i.setPointerCapture(r)}catch{}n=window.setTimeout(u,iy)}}),i.addEventListener("pointermove",h=>{if(h.pointerId!==r)return;if(!s){if(Math.hypot(h.clientX-o,h.clientY-a)>ry){clearTimeout(n);try{i.releasePointerCapture(r)}catch{}r=-1}return}h.preventDefault();const f=i.offsetWidth,g=i.offsetHeight;i.style.left=`${So(h.clientX-l,0,window.innerWidth-f)}px`,i.style.top=`${So(h.clientY-c,0,window.innerHeight-g)}px`});const d=h=>{if(h.pointerId!==r)return;clearTimeout(n);try{i.releasePointerCapture(r)}catch{}if(r=-1,!s)return;s=!1,i.classList.remove("ui-dragging");const f=i.offsetWidth,g=i.offsetHeight;yo[e]={x:(parseFloat(i.style.left)||0)/Math.max(1,window.innerWidth-f),y:(parseFloat(i.style.top)||0)/Math.max(1,window.innerHeight-g)},oy(yo),ay()};i.addEventListener("pointerup",d),i.addEventListener("pointercancel",d)}function ly(){yo={};try{localStorage.removeItem(Vl)}catch{}for(const{el:i}of dh)i.style.left="",i.style.top="",i.style.right="",i.style.bottom="",i.style.transform=""}const cy=Math.PI*.62,uy=.18,dy=.85;class hh{constructor(e){J(this,"scene");J(this,"門扇",[]);J(this,"開度",0);J(this,"閃",0);J(this,"閃燈",null);J(this,"光環",null);J(this,"光幕",null);J(this,"光柱",null);J(this,"血條",null);J(this,"血條底",null);J(this,"血條長",2.1);J(this,"血條位",new A);J(this,"上次命",-1);J(this,"旗",[]);J(this,"time",0);this.scene=e}static 清單(){return["structures/wallDoorwaySquareWide.glb","structures/wallDoor.glb","structures/pillarStone.glb","structures/wallArch.glb","structures/wall.glb","structures/wallWindowRound.glb","structures/wallCorner.glb","structures/roofHighPoint.glb","structures/bannerRed.glb","structures/bannerGreen.glb","structures/lantern.glb","structures/stairsStone.glb"]}build(){this.buildSpawnGate(),this.buildGoalKeep()}buildSpawnGate(){const[e,t]=ie.spawnCell,n=Rt(e,t),r=new It;r.position.set(n.x,0,n.z);const s=ie.path[1]??ie.path[0],o=Rt(s[0],s[1]);r.rotation.y=Math.atan2(o.x-n.x,o.z-n.z)+Math.PI/2,r.scale.setScalar(1.25),this.scene.add(r);const a=Kt("structures/wallDoorwaySquareWide.glb");a.scale.setScalar(1.45),ps(a,14212579,10134702),r.add(a);for(const d of[-1,1]){const h=Kt("structures/pillarStone.glb");h.position.set(d*.72,0,0),h.scale.set(1.35,1.75,1.35),ps(h,14870250,10924217),r.add(h);const f=Kt("structures/lantern.glb");f.position.set(d*.72,1.72,0),f.scale.setScalar(.9),r.add(f)}for(const d of[-1,1]){const h=new It;h.position.set(d*.66,0,0),r.add(h);const f=Kt("structures/wallDoor.glb");f.position.set(-d*.34,0,0),f.scale.set(1.3,1.45,1.3),ps(f,13208139,9264174),h.add(f),this.門扇.push({node:h,閂角:0,方向:d})}this.閃燈=new po(10219263,0,12,1.2),this.閃燈.position.set(0,.9,0),r.add(this.閃燈);const l=new Re(new Ni(.3,.62,44),new Be({color:11072255,transparent:!0,opacity:0,side:st,depthWrite:!1,blending:ri}));l.rotation.x=-Math.PI/2,l.position.y=.28,r.add(l),this.光環=l;const c=new Re(new Sn(1.35,1.55),new Be({color:10350335,transparent:!0,opacity:.16,side:st,depthWrite:!1,blending:ri}));c.rotation.y=Math.PI/2,c.position.set(0,.66,0),r.add(c),this.光幕=c;const u=new Re(new Cn(.34,.5,3.2,18,1,!0),new Be({color:12055807,transparent:!0,opacity:0,side:st,depthWrite:!1,blending:ri}));u.position.set(0,1.6,0),r.add(u),this.光柱=u}buildGoalKeep(){const[e,t]=ie.goalCell,n=Rt(e,t),r=new It;r.position.set(n.x,0,n.z);const s=ie.path[ie.path.length-2]??ie.path[ie.path.length-1],o=Rt(s[0],s[1]);r.rotation.y=Math.atan2(o.x-n.x,o.z-n.z),r.scale.setScalar(1.35),this.scene.add(r);const a=[[-.5,0,Math.PI/2],[.5,0,Math.PI/2],[0,.5,0],[0,-.5,0]];for(const[f,g,v]of a){const m=Kt(g>0?"structures/wallWindowRound.glb":"structures/wall.glb");m.position.set(f,0,g),m.rotation.y=v,m.scale.setScalar(1),ps(m,14541543,10463666),r.add(m)}const l=new It;l.position.y=1,r.add(l);for(const[f,g,v]of a){const m=Kt("structures/wall.glb");m.position.set(f*.62,0,g*.62),m.rotation.y=v,m.scale.set(.64,.8,.64),ps(m,15265007,11318717),l.add(m)}const c=Kt("structures/roofHighPoint.glb");c.position.y=.8,c.scale.setScalar(.78),fy(c,14700607,16743270),l.add(c);for(const f of[-1,1]){const g=Kt("structures/bannerGreen.glb");g.position.set(f*.62,1.05,-.42),g.scale.setScalar(.9),r.add(g),this.旗.push(g)}const u=new A(n.x,2.7,n.z),d=new Re(new Sn(this.血條長+.14,.3),new Be({color:1313547,transparent:!0,opacity:.85,depthTest:!1,depthWrite:!1}));d.position.copy(u),d.renderOrder=900,this.scene.add(d),this.血條底=d;const h=new Re(new Sn(this.血條長,.2),new Be({color:5562474,transparent:!0,opacity:1,depthTest:!1,depthWrite:!1}));h.position.copy(u),h.renderOrder=901,this.scene.add(h),this.血條=h,this.血條位=u}開門(){this.開度=1,this.閃=1}update(e,t,n,r){this.time+=e;const o=this.開度>0?e/dy:e/uy;this.開度=Math.max(0,this.開度-o);const a=cy*hy(this.開度);for(const l of this.門扇)l.node.rotation.y=l.閂角+a*l.方向;if(this.閃=Math.max(0,this.閃-e/.55),this.閃燈&&(this.閃燈.intensity=this.閃*this.閃*60),this.光環){const c=.8+(1-this.閃)*5.4;this.光環.scale.set(c,c,1),this.光環.material.opacity=this.閃}if(this.光柱){const l=this.光柱.material;l.opacity=this.閃*.55;const c=.7+(1-this.閃)*.8;this.光柱.scale.set(c,1,c),this.光柱.visible=this.閃>.01}if(this.光幕){const l=this.光幕.material;l.opacity=.2+this.閃*.75+Math.sin(this.time*2.6)*.06}for(let l=0;l<this.旗.length;l+=1)this.旗[l].rotation.y=Math.sin(this.time*1.1+l*1.7)*.22;if(this.血條&&this.血條底){if(t!==this.上次命){this.上次命=t;const u=n>0?Math.max(0,Math.min(1,t/n)):0;this.血條.scale.x=Math.max(.001,u),this.血條.material.color.setHex(u>.6?5562474:u>.28?14729540:14703178)}this.血條底.quaternion.copy(r.quaternion),this.血條.quaternion.copy(r.quaternion);const l=new A(1,0,0).applyQuaternion(r.quaternion),c=this.血條.scale.x;this.血條.position.copy(this.血條位).addScaledVector(l,-(this.血條長*(1-c))/2)}}狀態(){var e;return{開度:+this.開度.toFixed(3),閃:+this.閃.toFixed(3),門角:this.門扇.map(t=>+t.node.rotation.y.toFixed(3)),血條闊:+(((e=this.血條)==null?void 0:e.scale.x)??-1).toFixed(3)}}}const hy=i=>1-(1-i)*(1-i);function ps(i,e,t){i.traverse(n=>{const r=n;if(!r.isMesh)return;const o=(Array.isArray(r.material)?r.material:[r.material]).map(a=>{const l=a;if(!/^(stone|stoneDark|wood|woodDark)$/.test(l.name))return l;const c=l.clone();return c.color.setHex(/Dark$/.test(l.name)?t:e),ze.enableShadows&&(r.castShadow=!0),c});r.material=Array.isArray(r.material)?o:o[0]})}function fy(i,e,t){i.traverse(n=>{const r=n;if(!r.isMesh)return;const o=(Array.isArray(r.material)?r.material:[r.material]).map(a=>{const l=a;if(!/^roofRed/.test(l.name))return l;const c=l.clone();return c.color.setHex(l.name==="roofRedLight"?t:e),c});r.material=Array.isArray(r.material)?o:o[0]})}const at=J_();let P,bn=null,Tt=null,wn=at.prefs.difficulty;const _i=document.getElementById("game-canvas"),Dn=new Ev({canvas:_i,antialias:!ze.isMobile,powerPreference:"high-performance"});Dn.setPixelRatio(ze.pixelRatio),Dn.setSize(window.innerWidth,window.innerHeight),ze.enableShadows&&(Dn.shadowMap.enabled=!0,Dn.shadowMap.type=Do),Dn.toneMapping=ze.isMobile?hc:fc,Dn.toneMappingExposure=ze.isMobile?1:1.28;const Wt=new T_,Zt=new C_,on=Zt.cam,Mo=P_(Wt.scene),yi=new hh(Wt.scene),fh=Rt(ie.spawnCell[0],ie.spawnCell[1]),py=Promise.all([Wt.buildGround(),Hd([...hh.清單(),...x_(),...__()])]).then(()=>{yi.build(),U_()}),an=new L_(Wt.scene),my=new B_(Wt.scene),Jn=new z_(Wt.scene),gy=new H_(Wt.scene),Ut=new G_(Wt.scene);let Oi=null;ze.enablePostProcessing&&(Oi=new K_(Dn,Wt.scene,on));const Si=[{wave:1,tint:[1.06,1,.93],fog:1781026},{wave:30,tint:[.98,1.02,.98],fog:1057815},{wave:60,tint:[1.08,.94,.82],fog:1840400},{wave:90,tint:[.84,.9,1.12],fog:790560}];let Wl=-1;const ph=new se;function vy(i){if(i===Wl)return;Wl=i;const e=Math.max(1,i+1);let t=Si[0],n=Si[Si.length-1];for(let d=0;d<Si.length-1;d++)if(e>=Si[d].wave&&e<=Si[d+1].wave){t=Si[d],n=Si[d+1];break}const r=n.wave===t.wave?0:(e-t.wave)/(n.wave-t.wave),s=Math.max(0,Math.min(1,r)),o=t.tint[0]+(n.tint[0]-t.tint[0])*s,a=t.tint[1]+(n.tint[1]-t.tint[1])*s,l=t.tint[2]+(n.tint[2]-t.tint[2])*s;Oi&&Oi.setTint(o,a,l);const c=new se(t.fog),u=new se(n.fog);ph.copy(c).lerp(u,s),Wt.scene.fog&&"color"in Wt.scene.fog&&Wt.scene.fog.color.copy(ph)}P=Tl(wn),P.speedMultiplier=at.prefs.speedMultiplier,Xe.on("streakBonus",i=>By(i.streak)),Xe.on("milestone",i=>{Hy(i.wave),i.wave!==99&&i.wave>0&&i.wave%25===0&&Zy(i.wave)}),Xe.on("towerBuilt",i=>{const e=Rt(i.col,i.row);Jn.addBuildEffect(e.x,e.z),an.sync(P),ei()}),Xe.on("towerUpgraded",i=>{an.removeTower(i.towerId),an.sync(P),ei(),Tt&&Tt.id===i.towerId&&Th(Tt)}),Xe.on("towerSold",i=>{Jn.addSellEffect(i.worldX,i.worldZ),P.floatingTexts.push({id:P.nextId++,worldX:i.worldX,worldZ:i.worldZ,value:`+${i.refund}g`,color:"#ffd700",life:1.5,maxLife:1.5}),an.removeTower(i.towerId),an.sync(P),ei(),Tt&&Tt.id===i.towerId&&Ir()}),Xe.on("enemyKilled",i=>{const e=P.enemies.find(n=>n.id===i.enemyId),t=(e==null?void 0:e.type)==="boss"?16751181:(e==null?void 0:e.type)==="shield"?7132159:(e==null?void 0:e.type)==="healer"?16751568:16748377;Jn.addDeathEffect(i.worldX,i.worldZ,t),(e==null?void 0:e.type)==="boss"&&Zt.shake(.55)}),Xe.on("milestone",()=>Zt.shake(.35)),Xe.on("streakBonus",i=>{i.streak>=10&&Zt.shake(.25)}),Xe.on("towerFired",i=>{Jn.addMuzzleFlash(i.worldX,i.worldZ,i.towerType)}),Xe.on("aoeImpact",i=>{Jn.addImpactFlash(i.worldX,i.worldZ,i.radius,i.towerType)}),Xe.on("enemySpawned",()=>{yi.開門(),Jn.addBuildEffect(fh.x,fh.z)}),Xe.on("bossSpawned",()=>{Zt.shake(.6),zy(),Dt.playBossRoar()}),Xe.on("streakBonus",i=>{i.streak>=10?Dt.playMegaStingerHit():Dt.playStreakStinger()}),Xe.on("gameOver",i=>{i.won?Dt.playVictory():Dt.playDefeat()});const xy=document.getElementById("gold-val"),_y=document.getElementById("lives-val"),mh=document.getElementById("wave-val"),yy=document.getElementById("kills-val"),Xl=document.getElementById("hud-wave"),ql=document.getElementById("wave-remain"),Yl=document.getElementById("wave-progress-fill"),jl=document.getElementById("skip-prep-btn"),$l=document.getElementById("pause-btn"),Kl=document.getElementById("speed-btn"),ms=document.getElementById("sound-btn"),gh=document.getElementById("enemy-panel"),Sy=document.getElementById("enemy-name"),My=document.getElementById("enemy-hp"),by=document.getElementById("enemy-spd"),wy=document.getElementById("enemy-armor"),bo=document.getElementById("wave-banner"),gs=document.getElementById("wave-banner-text"),Zl=document.getElementById("milestone-banner"),wo=document.getElementById("milestone-banner-text"),Er=document.getElementById("boss-cinematic"),Jl=document.getElementById("next-wave-preview"),Ty=document.getElementById("preview-icons");let To=-2;const vs=document.getElementById("wave-modifier"),Ey=document.getElementById("mod-emoji"),Ay=document.getElementById("mod-label"),Ry=document.getElementById("mod-desc");let Ql="__init__";function Cy(){const i=P.waveModifier;if(i===Ql)return;if(Ql=i,!i||!go[i]){vs.classList.add("hidden");return}const e=go[i];Ey.textContent=e.emoji,Ay.textContent=e.label,Ry.textContent=e.desc,vs.classList.remove("hidden"),vs.style.animation="none",vs.offsetWidth,vs.style.animation=""}function Py(){if(P.phase!=="prep"){Jl.classList.add("hidden"),To=-2;return}const i=Gt.waves[P.currentWave];if(!i){Jl.classList.add("hidden");return}if(To===P.currentWave)return;To=P.currentWave;const e={};for(const n of i.groups)e[n.type]=(e[n.type]||0)+n.count;const t=Object.entries(e).map(([n,r])=>`<span class="preview-chip"><span class="ico">${Sh[n]||"❓"}</span><span class="cnt">×${r}</span></span>`).join("");Ty.innerHTML=t,Jl.classList.remove("hidden")}Xe.on("towerBuilt",()=>Dt.playBuild()),Xe.on("towerSold",()=>Dt.playSell()),Xe.on("enemyKilled",()=>Dt.playHit());const vh=document.getElementById("floating-text-layer"),Ly=document.getElementById("help-btn"),Ar=document.getElementById("help-overlay"),Iy=document.getElementById("help-close-btn"),Dy=document.getElementById("start-screen"),ec=document.getElementById("end-screen"),xh=document.getElementById("end-title"),Uy=document.getElementById("end-score"),_h=document.getElementById("end-rank"),yh=document.getElementById("tower-panel"),xs=document.getElementById("cancel-build-btn"),Rr=document.querySelectorAll(".build-btn[data-tower]"),_s=document.getElementById("streak-banner"),Qn=document.getElementById("tower-tooltip"),Ny=Qn.querySelector(".tooltip-name"),Fy=Qn.querySelector(".tooltip-type"),ky=Qn.querySelector(".tooltip-stats"),Oy=Qn.querySelector(".tooltip-special"),tc=Gt.waves.length,Sh={grunt:"🧟",tank:"🐢",runner:"💨",swarm:"🐝",shield:"🛡",healer:"💚",boss:"💀"};function ei(){xy.textContent=String(P.gold),_y.textContent=String(P.lives),P.endlessMode&&P.currentWave>=tc?mh.textContent=`${P.currentWave+1} ♾`:mh.textContent=`${Math.min(P.currentWave+1,tc)}/${tc}`,yy.textContent=String(P.totalKills);const i=P.enemies.filter(n=>n.alive).length,e=P.waveEnemiesTotal||0;if(P.phase==="prep"){Xl.classList.add("prep");const n=Gt.prepSec,r=Math.max(0,Math.min(1,1-P.prepTimer/n));ql.textContent=`⏳ ${Math.max(0,Math.ceil(P.prepTimer))}s`,Yl.style.width=`${Math.round(r*100)}%`}else if(P.phase==="wave"&&e>0){Xl.classList.remove("prep");const n=Math.max(0,P.waveEnemiesSpawned-i),r=Math.max(0,Math.min(1,n/e));ql.textContent=`${i} / ${e}`,Yl.style.width=`${Math.round(r*100)}%`}else Xl.classList.remove("prep"),ql.textContent="—",Yl.style.width="0%";jl.classList.toggle("hidden",P.phase!=="prep"),Py(),Cy(),Rr.forEach(n=>{const r=n.getAttribute("data-tower"),s=nn[r].levels[0].buildCost,o=P.gold>=s;n.classList.toggle("disabled",!o)});let t=null;if(Ut.hoveredCol>=0&&P.phase==="wave"){const n=Rt(Ut.hoveredCol,Ut.hoveredRow);let r=1;for(const s of P.enemies){if(!s.alive)continue;const o=s.worldX-n.x,a=s.worldZ-n.z,l=o*o+a*a;l<r&&(r=l,t=s)}}if(t){const n=os[t.type];Sy.textContent=n.name,My.textContent=`${Math.ceil(t.hp)}/${n.hp}`,by.textContent=n.speed.toFixed(1),wy.textContent=String(n.armor),gh.classList.remove("hidden")}else gh.classList.add("hidden")}let Cr=null;function nc(i){gs.textContent=i,bo.classList.remove("hidden"),gs.style.animation="none",gs.offsetWidth,gs.style.animation="",Cr&&clearTimeout(Cr),Cr=window.setTimeout(()=>{bo.classList.add("hidden")},2e3)}let Pr=null;function By(i){const e=i>=10;_s.textContent=e?`⚡ x${i} MEGA COMBO!`:`🔥 x${i} Kill Streak!`,_s.className=e?"streak-mega":"streak-normal",_s.classList.remove("hidden"),Pr&&clearTimeout(Pr),Pr=window.setTimeout(()=>{_s.classList.add("hidden")},1800)}let Bi=null;function zy(){Bi&&clearTimeout(Bi),Er.classList.remove("hidden"),Er.style.animation="none",Er.offsetWidth,Er.style.animation="",Bi=window.setTimeout(()=>{Er.classList.add("hidden"),Bi=null},2400)}let Lr=null;function Hy(i){wo.textContent=`🏆 Milestone Wave ${i}! +500g!`,Zl.classList.remove("hidden"),wo.style.animation="none",wo.offsetWidth,wo.style.animation="",Lr&&clearTimeout(Lr),Lr=window.setTimeout(()=>{Zl.classList.add("hidden")},3500)}const Gy=document.getElementById("achievement-toasts");function Vy(i){const e=document.createElement("div");e.className="ach-toast",e.innerHTML=`<div class="ach-emoji">${i.emoji}</div><div class="ach-body"><div class="ach-kicker">Achievement Unlocked</div><div class="ach-name">${i.name}</div><div class="ach-desc">${i.desc}</div></div>`,Gy.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},4400)}function ys(i,e){const t={event:i,payload:e};for(const n of Gl)if(!at.achievements.includes(n.id))try{n.check(P,t)&&ey(at,n.id)&&Vy(n)}catch{}}Xe.on("enemyKilled",i=>ys("enemyKilled",{enemyId:i.enemyId,bounty:i.bounty})),Xe.on("streakBonus",i=>ys("streakBonus",{streak:i.streak})),Xe.on("waveCleared",i=>ys("waveCleared",{wave:i.wave,perfect:i.perfect})),Xe.on("milestone",i=>ys("milestone",{wave:i.wave})),Xe.on("gameOver",i=>ys("gameOver",{won:i.won,score:i.score}));const Mh=document.getElementById("hs-score"),bh=document.getElementById("hs-sub");function Eo(){const i=at.highScores[wn];i?(Mh.textContent=String(i.score),bh.textContent=`Wave ${i.wave} · ${i.rank} · ${wn}`):(Mh.textContent="—",bh.textContent=`No record on ${wn}`),Yy()}const Wy=document.getElementById("lt-runs"),Xy=document.getElementById("lt-kills"),qy=document.getElementById("lt-best-wave");function Yy(){Wy.textContent=String(at.lifetime.runs),Xy.textContent=String(at.lifetime.totalKills),qy.textContent=String(at.lifetime.highestWaveReached)}const jy=[{id:"damage",emoji:"🗡",name:"Overcharge",desc:"+20% tower damage (stacks)",apply:()=>{P.buffDamageMult*=1.2}},{id:"range",emoji:"🎯",name:"Long Sight",desc:"+15% tower range (stacks)",apply:()=>{P.buffRangeMult*=1.15}},{id:"gold",emoji:"💰",name:"Gold Rush",desc:"+25% gold from kills (stacks)",apply:()=>{P.buffGoldMult*=1.25}},{id:"fortify",emoji:"❤",name:"Fortify",desc:"+5 lives and +5 max lives",apply:()=>{P.maxLives+=5,P.lives=Math.min(P.maxLives,P.lives+5)}},{id:"bounty",emoji:"🏦",name:"War Chest",desc:"Instant +300 gold",apply:()=>{P.gold+=300}}],ic=document.getElementById("buff-modal"),wh=document.getElementById("buff-cards"),$y=document.getElementById("buff-wave");function Ky(){const i=jy.slice(),e=[];for(;e.length<3&&i.length;){const t=Math.floor(Math.random()*i.length);e.push(i.splice(t,1)[0])}return e}function Zy(i){if(P.buffChoicePending)return;P.buffChoicePending=!0,P.paused=!0,$y.textContent=String(i);const e=Ky();wh.innerHTML="";for(const t of e){const n=document.createElement("button");n.className="buff-card",n.innerHTML=`<span class="card-emoji">${t.emoji}</span><span class="card-name">${t.name}</span><span class="card-desc">${t.desc}</span>`,n.addEventListener("click",()=>{t.apply(),P.floatingTexts.push({id:P.nextId++,worldX:0,worldZ:0,value:`${t.emoji} ${t.name}`,color:"#ffd486",life:2.5,maxLife:2.5}),Jy()}),wh.appendChild(n)}ic.classList.remove("hidden")}function Jy(){ic.classList.add("hidden"),P.buffChoicePending=!1,P.paused=!1}function Qy(i,e){const t=new A(i,.6,e);return t.project(on),{x:(t.x*.5+.5)*window.innerWidth,y:(-t.y*.5+.5)*window.innerHeight}}const Ss=new Map;function eS(i){for(let e=P.floatingTexts.length-1;e>=0;e--){const t=P.floatingTexts[e];if(t.life-=i,t.life<=0){const s=Ss.get(t.id);s&&(vh.removeChild(s),Ss.delete(t.id)),P.floatingTexts.splice(e,1);continue}if(!Ss.has(t.id)){const s=document.createElement("div");s.className="floating-text",s.textContent=t.value,s.style.color=t.color,s.style.animationDuration=`${t.maxLife}s`,vh.appendChild(s),Ss.set(t.id,s)}const n=Ss.get(t.id),r=Qy(t.worldX,t.worldZ);n.style.left=`${r.x}px`,n.style.top=`${r.y}px`}}function Th(i){Tt=i;const e=nn[i.type],t=e.levels[i.level];document.getElementById("panel-tower-name").textContent=e.name,document.getElementById("panel-tower-level").textContent=`Lv.${i.level+1}`,document.getElementById("panel-dmg").textContent=String(t.damage),document.getElementById("panel-spd").textContent=`${t.cooldownSec}s`,document.getElementById("panel-rng").textContent=String(t.range);const n=document.getElementById("panel-special"),r=[];t.aoeRadius>0&&r.push(`AOE ${t.aoeRadius}`),t.slow&&r.push(`Slow ${Math.round(t.slow.pct*100)}%`),t.dot&&r.push(`DOT ${t.dot.dps}/s ${t.dot.durationSec}s`),t.chain&&r.push(`Chain ×${t.chain.targets}`),r.push(`🗡 ${i.kills}`),n.textContent=r.join(" | "),document.querySelectorAll(".target-btn").forEach(c=>{const u=c.getAttribute("data-mode");c.classList.toggle("active",i.targetingMode===u),c.onclick=()=>{i.targetingMode=u,document.querySelectorAll(".target-btn").forEach(d=>d.classList.toggle("active",d.getAttribute("data-mode")===u))}});const s=document.getElementById("upgrade-btn"),o=document.getElementById("evolve-container"),a=document.getElementById("sell-btn"),l=e.levels;if(o.classList.add("hidden"),o.innerHTML="",s.style.display="block",i.level>=l.length-1)if(e.evolutions&&e.evolutions.length>0){s.style.display="none",o.classList.remove("hidden");for(const c of e.evolutions){const u=document.createElement("button");u.className="action-btn evolve",u.innerHTML=`⭐ ${c.name} (<span class="evolve-cost">${c.cost}</span>g)<div style="font-size: 0.8em; margin-top: 2px;">${c.desc}</div>`,u.disabled=P.gold<c.cost,u.onclick=()=>{Tt&&Ld(P,Tt.id,c.type)},o.appendChild(u)}}else s.disabled=!0,s.textContent="⬆ MAX";else{const c=l[i.level+1].upgradeCost;s.disabled=!Dx(P,i),s.innerHTML=`⬆ Upgrade (<span id="upgrade-cost">${c}</span>g)`}document.getElementById("sell-value").textContent=String(Pd(i)),a.innerHTML=`💰 Sell (<span id="sell-value">${Pd(i)}</span>g)`,yh.classList.remove("hidden"),an.showRange(i,t.range)}function Ir(){Tt=null,yh.classList.add("hidden"),an.hideRange()}const tS=document.getElementById("end-best-badge");function Eh(){const i=P.phase==="won";xh.textContent=i?"🎉 Victory!":"💀 Defeat",xh.style.color=i?"#ffd700":"#ff5555",Uy.textContent=`Score: ${P.score}`;let e="C";for(const r of xx.ranks)if(P.score>=r.min){e=r.name;break}_h.textContent=e,_h.className=`rank rank-${e}`;const t=P.endlessMode?P.currentWave+1:Math.min(P.currentWave+1,Gt.waves.length),n=Q_(at,P.difficulty,P.score,t,e);tS.classList.toggle("hidden",!n),ty(at,i,P.totalKills,P.currentWave,P.stats.towersBuilt,t),Eo(),document.getElementById("stat-kills").textContent=P.totalKills.toString(),document.getElementById("stat-streak").textContent=P.stats.longestStreak.toString(),document.getElementById("stat-perfect").textContent=P.perfectWaves.toString(),document.getElementById("stat-built").textContent=P.stats.towersBuilt.toString(),document.getElementById("stat-gold").textContent=P.stats.goldEarned.toString(),document.getElementById("stat-dmg").textContent=Math.round(P.stats.totalDamageDealt).toString(),ec.classList.remove("hidden")}Rr.forEach(i=>{i.addEventListener("click",e=>{e.stopPropagation();const t=i.getAttribute("data-tower");P.gold<nn[t].levels[0].buildCost||(bn===t?(bn=null,i.classList.remove("selected"),xs.style.display="none",Ut.hideGhost()):(Rr.forEach(n=>n.classList.remove("selected")),bn=t,i.classList.add("selected"),xs.style.display="",Ir()))}),i.addEventListener("mouseenter",()=>{const e=i.getAttribute("data-tower");if(!e||!nn[e])return;const t=nn[e],n=t.levels[0];Ny.textContent=t.name+" Tower",Fy.textContent="Type: "+t.damageType,ky.innerHTML=`
            <div><span>Damage:</span> <span>${n.damage}</span></div>
            <div><span>Speed:</span> <span>${n.cooldownSec}s</span></div>
            <div><span>Range:</span> <span>${n.range}</span></div>
            <div><span>DPS:</span> <span>${(n.damage/n.cooldownSec).toFixed(1)}</span></div>
        `;let r="";n.slow?r=`Slows by ${Math.round(n.slow.pct*100)}% for ${n.slow.durationSec}s`:n.dot?r=`DOT: ${n.dot.dps} dmg/s (${n.dot.durationSec}s)`:n.chain?r=`Chains to ${n.chain.targets} targets`:n.aoeRadius>0&&(r=`AOE Radius: ${n.aoeRadius}`),Oy.textContent=r;const s=i.getBoundingClientRect();Qn.style.left=`${s.left+s.width/2}px`,Qn.style.transform="translate(-50%, calc(-100% - 10px))",Qn.style.top=`${s.top}px`,Qn.classList.remove("hidden")}),i.addEventListener("mouseleave",()=>{Qn.classList.add("hidden")})}),xs.addEventListener("click",i=>{i.stopPropagation(),bn=null,Rr.forEach(e=>e.classList.remove("selected")),xs.style.display="none",Ut.hideGhost()}),Kl.addEventListener("click",()=>{P.speedMultiplier=P.speedMultiplier===1?2:P.speedMultiplier===2?4:1,Kl.textContent=P.speedMultiplier+"×",at.prefs.speedMultiplier=P.speedMultiplier,xi(at)}),ms.addEventListener("click",()=>{Dt.init();const i=Dt.toggle();ms.textContent=i?"🔊":"🔇",ms.style.opacity=i?"1":"0.5",at.prefs.soundEnabled=i,xi(at)}),$l.addEventListener("click",Ah);function Ah(){P.paused=!P.paused,$l.textContent=P.paused?"▶":"⏸",$l.classList.toggle("active",P.paused)}window.addEventListener("keydown",i=>{if(P.phase==="idle"||P.phase==="won"||P.phase==="lost")return;const e=i.key.toLowerCase();if(e==="p"){(P.phase==="wave"||P.phase==="prep")&&Ah();return}if(Ar.classList.contains("hidden")){if(e>="1"&&e<="7"){const t=Number(e)-1;t>=0&&t<Rr.length&&Rr[t].click()}e==="u"&&Tt&&document.getElementById("upgrade-btn").click(),e==="s"&&Tt&&document.getElementById("sell-btn").click(),e==="q"&&Ao(0),e==="w"&&Ao(1),e==="e"&&Ao(2),i.key==="Escape"&&(bn?xs.click():Tt&&document.getElementById("panel-close-btn").click())}});const Rh=document.querySelectorAll(".skill-btn");Rh.forEach(i=>{i.addEventListener("click",()=>{const e=parseInt(i.getAttribute("data-skill")||"0",10);Ao(e)})});function Ao(i){if(P.phase!=="wave"&&P.phase!=="prep")return;const e=P.skills[i];if(!(!e||e.remaining>0)){if(i===0)for(const t of P.enemies)t.alive&&(t.hp-=200,t.hp<=0?Rl(P,t):P.floatingTexts.push({id:P.nextId++,worldX:t.worldX,worldZ:t.worldZ,value:"-200",color:"#ff4444",life:1,maxLife:1}));else if(i===1)for(const t of P.enemies)t.alive&&(t.slow={pct:1,remaining:5});else i===2&&(P.lives=Math.min(P.maxLives,P.lives+5),ei());e.remaining=e.cooldown,rc()}}function rc(){Rh.forEach(i=>{const e=parseInt(i.getAttribute("data-skill")||"0",10),t=P.skills[e],n=i.querySelector(".skill-cd");t&&t.remaining>0?(i.classList.add("on-cooldown"),n.classList.remove("hidden"),n.textContent=Math.ceil(t.remaining)+"s"):(i.classList.remove("on-cooldown"),n.classList.add("hidden"))})}jl.addEventListener("click",()=>{P.phase==="prep"&&(P.gold+=50,P.floatingTexts.push({id:P.nextId++,worldX:0,worldZ:0,value:"⏩ +50g Skip",color:"#aaff55",life:1.6,maxLife:1.6}),P.prepTimer=0,jl.classList.add("hidden"),ei())}),document.getElementById("upgrade-btn").addEventListener("click",()=>{Tt&&Cd(P,Tt.id)}),document.getElementById("sell-btn").addEventListener("click",()=>{Tt&&Ix(P,Tt.id)}),document.getElementById("panel-close-btn").addEventListener("click",()=>{Ir()}),document.getElementById("start-btn").addEventListener("click",async()=>{await py,Dy.classList.add("hidden"),Fh(),P.endlessMode=at.prefs.endlessMode,Dt.init(),Dt.startMusic(),Al(P),nc("Wave 1")});const sc=document.querySelectorAll(".diff-btn"),Ch=document.getElementById("diff-desc"),Ph={easy:"Easy difficulty — 600g, 30 lives, 25% weaker enemies",normal:"Standard difficulty — 400g, 20 lives",hard:"Hard difficulty — 250g, 10 lives, 40% tougher enemies & slightly faster"};sc.forEach(i=>{i.addEventListener("click",()=>{sc.forEach(e=>e.classList.remove("active")),i.classList.add("active"),wn=i.getAttribute("data-diff"),Ch.textContent=Ph[wn],at.prefs.difficulty=wn,xi(at),P=Tl(wn),P.speedMultiplier=at.prefs.speedMultiplier,ei(),Eo()})});const oc=document.getElementById("endless-toggle");oc.addEventListener("change",()=>{at.prefs.endlessMode=oc.checked,xi(at)}),(function(){sc.forEach(e=>{e.classList.toggle("active",e.getAttribute("data-diff")===wn)}),Ch.textContent=Ph[wn],Kl.textContent=P.speedMultiplier+"×",at.prefs.soundEnabled||(Dt.toggle(),ms.textContent="🔇",ms.style.opacity="0.5"),oc.checked=at.prefs.endlessMode,Eo()})();const Ro=document.getElementById("achievements-modal"),Lh=document.getElementById("ach-grid"),nS=document.getElementById("ach-count");function Ih(){Lh.innerHTML="";let i=0;for(const e of Gl){const t=at.achievements.includes(e.id);t&&i++;const n=document.createElement("div");n.className=`ach-row ${t?"unlocked":"locked"}`,n.innerHTML=`<div class="row-emoji">${t?e.emoji:"🔒"}</div><div class="row-body"><div class="row-name">${e.name}</div><div class="row-desc">${e.desc}</div></div>`,Lh.appendChild(n)}nS.textContent=`${i}/${Gl.length}`}document.getElementById("achievements-btn").addEventListener("click",()=>{Ih(),Ro.classList.remove("hidden")}),document.getElementById("ach-close-btn").addEventListener("click",()=>{Ro.classList.add("hidden")}),Ro.addEventListener("click",i=>{i.target.classList.contains("ach-backdrop")&&Ro.classList.add("hidden")});const Mi=document.getElementById("ach-reset-btn");let Co=!1,Dr=null;Mi.addEventListener("click",()=>{if(!Co){Co=!0,Mi.classList.add("confirming"),Mi.textContent="⚠ Click again to confirm reset",Dr&&clearTimeout(Dr),Dr=window.setTimeout(()=>{Co=!1,Mi.classList.remove("confirming"),Mi.textContent="⟲ Reset Progress"},4e3);return}ny(at),Co=!1,Dr&&(clearTimeout(Dr),Dr=null),Mi.classList.remove("confirming"),Mi.textContent="✓ Reset",setTimeout(()=>{Mi.textContent="⟲ Reset Progress"},1400),Ih(),Eo()}),ki(document.getElementById("hud"),"hud"),ki(document.getElementById("skill-bar"),"skillBar"),ki(document.getElementById("build-menu"),"buildMenu"),ki(document.getElementById("next-wave-preview"),"nextWavePreview"),ki(document.getElementById("tower-panel"),"towerPanel"),ki(document.getElementById("enemy-panel"),"enemyPanel"),ki(document.getElementById("wave-modifier"),"waveModifier"),document.getElementById("reset-layout-btn").addEventListener("click",()=>{ly(),P.floatingTexts.push({id:P.nextId++,worldX:0,worldZ:0,value:"🔁 介面位置已重設",color:"#9be8ff",life:1.6,maxLife:1.6})}),Ly.addEventListener("click",()=>{Ar.classList.remove("hidden")}),Iy.addEventListener("click",()=>{Ar.classList.add("hidden")}),Ar.addEventListener("click",i=>{i.target===Ar&&Ar.classList.add("hidden")}),document.getElementById("restart-btn").addEventListener("click",()=>{ec.classList.add("hidden"),P=Tl(wn),P.speedMultiplier=at.prefs.speedMultiplier,P.endlessMode=at.prefs.endlessMode,Fh(),an.sync(P),ei(),rc(),Ir(),Al(P),nc("Wave 1")}),document.getElementById("home-btn").addEventListener("click",()=>{window.location.href="../../../index.html"}),_i.addEventListener("click",()=>{if(Zt.twoFingerActive||P.phase==="idle"||P.phase==="won"||P.phase==="lost")return;const i=Ut.hoveredCol,e=Ut.hoveredRow;if(i<0||e<0)return;const t=P.towers.find(n=>n.col===i&&n.row===e);t?Th(t):bn?Rd(P,bn,i,e):Ir()}),_i.addEventListener("mousemove",i=>{Ut.updateMouse(i,on),Dh()}),_i.addEventListener("touchmove",i=>{i.touches.length===1&&!Zt.twoFingerActive&&(Ut.updateMouse(i,on),Dh())},{passive:!0});function Dh(){if(!bn||Ut.hoveredCol<0){Ut.hideGhost();return}const i=Ad(P,Ut.hoveredCol,Ut.hoveredRow)&&P.gold>=nn[bn].levels[0].buildCost,e=nn[bn].levels[0].range;Ut.showGhost(Ut.hoveredCol,Ut.hoveredRow,i,bn,e)}_i.addEventListener("wheel",i=>{i.preventDefault(),Zt.zoom(i.deltaY)},{passive:!1}),_i.addEventListener("touchstart",Zt.onTouchStart,{passive:!0}),_i.addEventListener("touchmove",Zt.onTouchMove,{passive:!1}),_i.addEventListener("touchend",Zt.onTouchEnd,{passive:!0}),window.addEventListener("resize",()=>{Zt.resize(Dn),Oi&&Oi.resize(window.innerWidth,window.innerHeight)});let Uh=0,Ur=0,ac=-1,zi=null,Nh=0;function Fh(){Ur=0,ac=-1,Wl=-1,To=-2,Ql="__init__",zi=null,ic.classList.add("hidden"),Cr&&(clearTimeout(Cr),Cr=null),Pr&&(clearTimeout(Pr),Pr=null),Lr&&(clearTimeout(Lr),Lr=null),Bi&&(clearTimeout(Bi),Bi=null),bo.classList.add("hidden"),_s.classList.add("hidden"),Zl.classList.add("hidden"),Er.classList.add("hidden")}function Po(){Oi?Oi.render():Dn.render(Wt.scene,on)}function kh(i){var o,a;requestAnimationFrame(kh);const e=Math.min((i-Uh)/1e3,.1);Uh=i;const t=i*.001;if(P.phase==="idle"){Mo.update(t),yi.update(e,P.lives,P.maxLives,on),Po();return}if(P.phase==="won"||P.phase==="lost"){ec.classList.contains("hidden")&&Eh(),zi!=="off"&&(Dt.setMusicPhase("off"),zi="off"),Mo.update(t),yi.update(e,P.lives,P.maxLives,on),Po();return}if(P.paused){Mo.update(t),yi.update(e,P.lives,P.maxLives,on),Po();return}const n=e*P.speedMultiplier;Ur+=n;const r=5;Ur>In*r&&(Ur=In*r);const s=new Map;for(const l of P.projectiles)s.set(l.id,{id:l.id,targetX:l.targetX,targetZ:l.targetZ,towerType:l.towerType});for(;Ur>=In;){Sd(P,In),bd(P,In),Td(P,In),Ed(P,In),Ur-=In;const l=P.phase;if(l==="won"||l==="lost"){Eh();break}}if(P.phase==="wave"||P.phase==="prep"){for(const l of P.skills)l.remaining>0&&(l.remaining=Math.max(0,l.remaining-e));rc()}if(P.phase==="prep"&&zi!=="prep"?(Dt.setMusicPhase("prep"),zi="prep"):P.phase==="wave"&&zi!=="wave"&&(Dt.setMusicPhase("wave"),zi="wave"),P.currentWave!==ac&&P.phase==="wave"&&(ac=P.currentWave,nc(`Wave ${P.currentWave+1}`)),P.phase==="prep"){const l=Math.ceil(P.prepTimer),c=Gt.waves[El(P)],u=((o=c==null?void 0:c.groups)==null?void 0:o.reduce((h,f)=>h+f.count,0))??"?",d=((a=c==null?void 0:c.groups)==null?void 0:a.map(h=>`${Sh[h.type]??"?"}×${h.count}`).join(" "))??"";gs.textContent=`Wave ${P.currentWave+1} — ${u} enemies | ${d} | Next in ${l}s`,bo.classList.remove("hidden")}for(const[l,c]of s.entries())P.projectiles.find(u=>u.id===l)||Jn.addExplosion(c.targetX,c.targetZ,c.towerType);an.animate(e,P),my.sync(P,0,on),Jn.setCamera(on),Jn.sync(P,n),gy.sync(P,n),eS(e),Mo.update(t),yi.update(e,P.lives,P.maxLives,on),Zt.tickShake(e),vy(P.currentWave),ze.isMobile?++Nh>=4&&(Nh=0,ei()):ei(),Tt&&(P.towers.find(c=>c.id===Tt.id)||Ir()),Po()}window.__TD={get state(){return P},LOGIC_DT:In,量模型:y_,門狀態(){return yi.狀態()},設曲率(i,e){yx(i,e)},塔尺(i){return an.measure(i)},塔同步(){an.sync(P),an.animate(.6,P)},地圖:{spawn:Rt(ie.spawnCell[0],ie.spawnCell[1]),goal:Rt(ie.goalCell[0],ie.goalCell[1])},開門(){yi.開門()},scene:Wt.scene,camera:on,renderer:Dn,tick(i=1,e=In){for(let t=0;t<i;t+=1)Sd(P,e),bd(P,e),Td(P,e),Ed(P,e)},擂台(i=99999){return P.phase="wave",P.paused=!1,P.enemies=[],P.projectiles=[],P.towers=[],P.spawnCounts=P.spawnCounts.map(()=>0),P.waveEnemiesSpawned=P.waveEnemiesTotal,P.gold=i,P.lives=999,{phase:P.phase,gold:P.gold}},build(i,e,t){return Rd(P,i,e,t)},upgrade(i){return Cd(P,i)},進化(i,e){return Ld(P,i,e)},spawn(i,e=0){Md(P,i);const t=P.enemies[P.enemies.length-1];if(e>0){const[n,r]=ie.path[Math.min(e,ie.path.length-1)],s=Rt(n,r);t.pathIndex=e,t.pathProgress=0,t.worldX=s.x,t.worldZ=s.z,t.prevWorldX=s.x,t.prevWorldZ=s.z}return{id:t.id,hp:t.hp,maxHp:t.maxHp,armor:t.armor,shield:t.shield,x:t.worldX,z:t.worldZ}},敵(i){const e=P.enemies.find(t=>t.id===i);return e?{hp:e.hp,alive:e.alive,shield:e.shield,dots:e.dots.length,slow:e.slow}:null}},requestAnimationFrame(kh)})();
