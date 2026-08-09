var BM=Object.defineProperty;var zM=(hi,yn,ss)=>yn in hi?BM(hi,yn,{enumerable:!0,configurable:!0,writable:!0,value:ss}):hi[yn]=ss;var J=(hi,yn,ss)=>zM(hi,typeof yn!="symbol"?yn+"":yn,ss);(function(){"use strict";var hi=document.createElement("style");hi.textContent=`:root{--font-ui: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, "PingFang HK", "Microsoft JhengHei", sans-serif;--font-display: "Bahnschrift", "DIN Alternate", "Avenir Next Condensed", "Segoe UI Semibold", system-ui, sans-serif}*{margin:0;padding:0;box-sizing:border-box}:root{--bg-deep: rgba(7, 15, 11, .82);--glass: rgba(14, 28, 21, .72);--glass-strong: rgba(10, 22, 17, .88);--panel-stroke: rgba(198, 237, 198, .12);--panel-highlight: rgba(255, 255, 255, .06);--text-main: #eff7ef;--text-muted: rgba(233, 244, 233, .68);--gold: #f6d67b;--danger: #ff8570;--info: #8fd7ff;--energy: #d0a4ff;--action: #71d9ff;--action-strong: #0e91d0;--shadow-lg: 0 20px 48px rgba(0, 0, 0, .35)}html,body{width:100%;height:100%;overflow:hidden;font-family:var(--font-ui);background:radial-gradient(circle at top,rgba(48,112,74,.28),transparent 38%),radial-gradient(circle at bottom,rgba(22,44,31,.22),transparent 42%),#08110c;color:var(--text-main);user-select:none;-webkit-user-select:none}#game-canvas{position:fixed;top:0;left:0;width:100%;height:100%;display:block}#hud{position:fixed;top:14px;left:12px;right:12px;display:flex;gap:10px;align-items:center;pointer-events:none;z-index:10;flex-wrap:wrap}#hud>div,#hud>button{pointer-events:auto;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),var(--glass);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--panel-stroke);border-radius:14px;box-shadow:inset 0 1px 0 var(--panel-highlight),0 12px 28px #0003;padding:9px 14px;font-size:14px;font-weight:600;color:var(--text-main);white-space:nowrap}#hud-gold{color:var(--gold)}#hud-lives{color:var(--danger)}#hud-wave{color:var(--info);display:flex;flex-direction:column;gap:5px;min-width:158px;padding:7px 12px 8px!important}#hud-wave .chapter-line{display:flex;align-items:center;gap:7px;max-width:190px;color:var(--chapter-accent, #7ee787);font-family:var(--font-display);font-size:9px;font-weight:800;letter-spacing:.1em;line-height:1;text-transform:uppercase}#hud-wave #chapter-act{flex:0 0 auto;padding-right:7px;border-right:1px solid color-mix(in srgb,var(--chapter-accent, #7ee787) 45%,transparent)}#hud-wave #chapter-name{overflow:hidden;text-overflow:ellipsis}#hud-wave .wave-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px}#hud-wave .wave-label{color:var(--info);font-weight:700;letter-spacing:.02em}#hud-wave .wave-remain{font-family:var(--font-display);font-size:11px;font-weight:700;color:#e8f5f7ad;letter-spacing:.06em}#hud-wave .wave-progress-track{position:relative;width:100%;height:5px;border-radius:999px;overflow:hidden;background:#8fd7ff1f;box-shadow:inset 0 0 0 1px #8fd7ff1f}#hud-wave .wave-progress-fill{position:absolute;top:0;right:0;bottom:0;left:0;width:0%;background:linear-gradient(90deg,#8fd7ff,#7ef5c3);border-radius:inherit;box-shadow:0 0 10px #8fd7ff8c;transition:width .25s ease-out}#hud-wave.prep .wave-progress-fill{background:linear-gradient(90deg,#f7d36e,#ff9a4d);box-shadow:0 0 10px #f7c46b8c}#hud-kills{color:var(--energy)}#skip-prep-btn{pointer-events:auto;background:linear-gradient(135deg,#f5c45947,#bd791633);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border:1px solid rgba(255,208,105,.34);border-radius:12px;padding:8px 14px;font-size:14px;font-weight:700;color:var(--gold);cursor:pointer;transition:all .2s}#skip-prep-btn:hover{background:#ffc80059}#pause-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:16px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#pause-btn:hover{background:#ffffff26}#pause-btn.active{background:#ffb40040;border-color:#fc4;color:#fc4}#speed-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 16px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#speed-btn:hover{background:#ffffff26}#speed-btn.active{background:#64c8ff4d;border-color:#8cf;color:#8cf}#wave-banner{position:fixed;top:88px;left:50%;transform:translate(-50%,-50%);z-index:20;pointer-events:none;width:min(720px,calc(100vw - 40px));text-align:center}#wave-banner-text{display:inline-block;font-family:var(--font-display);font-size:28px;font-weight:800;color:#f7fbf7;letter-spacing:.02em;text-shadow:0 0 18px rgba(111,207,255,.22);padding:12px 22px;border-radius:18px;border:1px solid rgba(190,239,199,.14);background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#0a1611bd;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:var(--shadow-lg);animation:bannerPulse .6s ease-out}#wave-banner.chapter-opening #wave-banner-text{white-space:pre-line;text-align:center;line-height:1.35;color:#effff2;border-color:color-mix(in srgb,var(--chapter-accent, #7ee787) 55%,transparent)}@keyframes bannerPulse{0%{transform:scale(.5);opacity:0}50%{transform:scale(1.15)}to{transform:scale(1);opacity:1}}#build-menu{position:fixed;bottom:16px;left:50%;transform:translate(-50%);display:flex;flex-direction:column;gap:8px;align-items:center;z-index:10;padding:12px 16px 14px;background:radial-gradient(circle at top,rgba(92,169,126,.14),transparent 42%),linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),var(--glass-strong);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid var(--panel-stroke);border-radius:20px;box-shadow:var(--shadow-lg);max-width:95vw}#skill-bar{position:fixed;left:18px;bottom:22px;z-index:12;display:flex;gap:10px;padding:10px 12px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130fd1;border:1px solid var(--panel-stroke);box-shadow:var(--shadow-lg);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.skill-btn{position:relative;width:56px;height:56px;display:grid;place-items:center;border-radius:16px;border:1px solid rgba(177,225,191,.12);background:linear-gradient(180deg,rgba(255,255,255,.06),transparent 58%),#ffffff0d;color:var(--text-main);cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}.skill-btn:hover{transform:translateY(-2px);border-color:#6fd9ff5c;background:#ffffff1c}.skill-emoji{font-size:24px}.skill-key,.skill-cd{position:absolute;font-family:var(--font-display);font-size:11px;font-weight:700;border-radius:999px;padding:2px 6px}.skill-key{bottom:6px;right:6px;background:#0f91d03d;color:#d8f6ff}.skill-cd{top:6px;left:6px;background:#ff8c7038;color:#ffd8d1}.skill-btn.on-cooldown{opacity:.72}.build-title{font-family:var(--font-display);font-size:12px;font-weight:700;color:#e1f3e38f;letter-spacing:3px;text-transform:uppercase}.build-subtitle{font-size:11px;color:var(--text-muted);margin-top:-2px}.build-grid{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.build-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 10px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 60%),#ffffff12;border:1px solid rgba(214,245,219,.12);border-radius:12px;color:var(--text-main);cursor:pointer;transition:all .2s;min-width:60px;position:relative;box-shadow:inset 0 1px #ffffff0a}.build-key{position:absolute;top:-6px;left:-6px;background:#3b82f6;color:#fff;font-size:10px;font-weight:700;padding:2px 5px;border-radius:4px;box-shadow:0 2px 4px #00000080;border:1px solid #60a5fa;pointer-events:none}.build-btn:hover{background:#ffffff29;border-color:#97dfba4d;transform:translateY(-2px)}.build-btn.selected{background:#64c8ff2e;border-color:#77d6ff8c;box-shadow:0 0 18px #64c8ff38}.build-btn.disabled{opacity:.35;cursor:not-allowed}.build-icon{font-size:20px}.build-name{font-size:10px;font-weight:600}.build-cost{font-size:9px;color:gold;font-weight:600}.cancel-btn{background:#ff3c3c26;border-color:#ff3c3c4d}.cancel-btn:hover{background:#ff3c3c4d}#tower-panel{position:fixed;right:16px;bottom:130px;width:246px;background:radial-gradient(circle at top,rgba(103,177,133,.16),transparent 44%),linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130fdb;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid var(--panel-stroke);border-radius:18px;box-shadow:var(--shadow-lg);padding:16px;z-index:15}.panel-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.panel-header span{font-weight:700;font-size:15px}#panel-tower-level{color:#8cf;font-size:13px}#panel-close-btn{background:none;border:none;color:#ffffff80;font-size:16px;cursor:pointer;padding:2px 6px}#panel-close-btn:hover{color:#fff}.panel-stats{display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;font-size:13px;color:#ffffffbf;margin-bottom:12px}#panel-special-row{grid-column:1 / -1}.panel-targeting{margin-bottom:10px}.targeting-label{font-size:11px;color:#ffffff80;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px}.targeting-btns{display:flex;gap:4px}.target-btn{flex:1;padding:5px 2px;border:1px solid rgba(255,255,255,.15);border-radius:6px;background:#ffffff0d;color:#fff9;font-size:11px;cursor:pointer;transition:all .15s}.target-btn:hover{background:#ffffff1f;color:#fff}.target-btn.active{background:#64c8ff40;border-color:#8cf;color:#8cf;font-weight:700}.panel-actions{display:flex;gap:8px}.action-btn{flex:1;padding:8px;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;color:#fff}.action-btn.upgrade{background:linear-gradient(135deg,#26a,#38c)}.action-btn.upgrade:hover{background:linear-gradient(135deg,#37b,#4ae)}.action-btn.upgrade:disabled{opacity:.4;cursor:not-allowed}#evolve-container{display:flex;flex-direction:column;gap:6px;flex:2}.action-btn.evolve{background:linear-gradient(135deg,#c8f,#93f);font-size:11px;padding:6px}.action-btn.evolve:hover{background:linear-gradient(135deg,#eeaafe,#a4f)}.action-btn.evolve:disabled{opacity:.4;cursor:not-allowed}.action-btn.sell{background:linear-gradient(135deg,#842,#a53)}.action-btn.sell:hover{background:linear-gradient(135deg,#953,#c64)}#start-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 20% 18%,rgba(93,180,134,.22),transparent 28%),radial-gradient(circle at 78% 22%,rgba(115,209,255,.14),transparent 22%),radial-gradient(circle at 50% 100%,rgba(177,126,52,.18),transparent 38%),linear-gradient(145deg,#05100af5,#0a1711f0);display:flex;justify-content:center;align-items:center;z-index:100;overflow:hidden}.start-aurora{position:absolute;top:-20%;right:-20%;bottom:-20%;left:-20%;pointer-events:none;background:radial-gradient(ellipse 45% 35% at 30% 35%,rgba(111,217,255,.18),transparent 60%),radial-gradient(ellipse 40% 30% at 70% 60%,rgba(245,196,107,.14),transparent 60%),radial-gradient(ellipse 50% 40% at 55% 80%,rgba(93,180,134,.14),transparent 65%);filter:blur(6px);animation:auroraDrift 26s ease-in-out infinite alternate}@keyframes auroraDrift{0%{transform:translate3d(-4%,-3%,0) rotate(0);opacity:.8}50%{transform:translate3d(3%,2%,0) rotate(6deg);opacity:1}to{transform:translate3d(2%,-4%,0) rotate(-5deg);opacity:.85}}.start-embers{position:absolute;top:0;right:0;bottom:0;left:0;pointer-events:none;overflow:hidden}.ember{position:absolute;bottom:-20px;width:6px;height:6px;border-radius:50%;background:radial-gradient(circle,rgba(255,225,160,.95),rgba(255,170,80,.55) 55%,transparent 75%);box-shadow:0 0 10px #ffcd8299;opacity:0;animation:emberRise 9s linear infinite}.ember.e1{left:8%;animation-duration:11s;animation-delay:0s}.ember.e2{left:18%;animation-duration:14s;animation-delay:2s;width:4px;height:4px}.ember.e3{left:28%;animation-duration:9s;animation-delay:4s}.ember.e4{left:40%;animation-duration:12s;animation-delay:1s;width:8px;height:8px}.ember.e5{left:52%;animation-duration:16s;animation-delay:3s}.ember.e6{left:62%;animation-duration:10s;animation-delay:5s;width:5px;height:5px;background:radial-gradient(circle,rgba(180,235,255,.95),rgba(100,190,255,.45) 55%,transparent 75%);box-shadow:0 0 10px #96d7ff8c}.ember.e7{left:72%;animation-duration:13s;animation-delay:6s}.ember.e8{left:82%;animation-duration:11s;animation-delay:2.5s;width:4px;height:4px}.ember.e9{left:90%;animation-duration:15s;animation-delay:7s;width:6px;height:6px;background:radial-gradient(circle,rgba(175,255,210,.9),rgba(120,210,150,.4) 55%,transparent 75%);box-shadow:0 0 10px #96ebb480}.ember.e10{left:46%;animation-duration:17s;animation-delay:8s;width:3px;height:3px}@keyframes emberRise{0%{transform:translateZ(0) scale(.8);opacity:0}12%{opacity:.9}55%{transform:translate3d(20px,-60vh,0) scale(1.1);opacity:.95}90%{opacity:.4}to{transform:translate3d(-15px,-112vh,0) scale(.6);opacity:0}}.start-content{position:relative;z-index:2;text-align:center;width:min(620px,calc(100vw - 40px));max-height:94vh;overflow-y:auto;padding:34px 30px;border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#08120ebd;border:1px solid rgba(214,245,219,.12);box-shadow:var(--shadow-lg);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);animation:startPanelIn .6s cubic-bezier(.22,1,.36,1) both}@keyframes startPanelIn{0%{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}.intro-kicker{font-family:var(--font-display);font-size:13px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#d2edd385;margin-bottom:14px}.game-title{font-family:var(--font-display);font-size:60px;font-weight:800;letter-spacing:.02em;background:linear-gradient(135deg,#f8eb98,#f4ba58,#f69a4f);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px;text-shadow:none;filter:drop-shadow(0 0 18px rgba(247,182,90,.25));animation:titleGlow 4.5s ease-in-out infinite}@keyframes titleGlow{0%,to{filter:drop-shadow(0 0 12px rgba(247,182,90,.2));transform:translateY(0)}50%{filter:drop-shadow(0 0 22px rgba(247,182,90,.45));transform:translateY(-2px)}}.game-subtitle{font-size:16px;color:var(--text-muted);margin-bottom:22px}.start-chip-row{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-bottom:24px}.start-chip{min-width:110px;padding:12px 16px;border-radius:16px;border:1px solid rgba(214,245,219,.1);background:#ffffff0d;display:flex;flex-direction:column;gap:2px}.start-chip strong{font-family:var(--font-display);font-size:20px;color:#f8fbf8}.start-chip span{font-size:11px;color:var(--text-muted);letter-spacing:.08em;text-transform:uppercase}.difficulty-selector{margin:0 auto 22px;padding:16px;width:min(360px,100%);border-radius:20px;background:#ffffff0d;border:1px solid rgba(214,245,219,.1)}.difficulty-label{font-family:var(--font-display);font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#d2edd385;margin-bottom:12px}.difficulty-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:12px}.diff-btn{padding:10px 14px;border-radius:999px;border:1px solid rgba(214,245,219,.12);background:#ffffff0f;color:var(--text-main);font-weight:700;cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease}.diff-btn:hover{transform:translateY(-1px);background:#ffffff1a}.diff-btn.active{border-color:#6fd9ff66;background:#6fd9ff24;box-shadow:0 0 18px #6fd9ff24}.difficulty-desc{font-size:13px;color:var(--text-muted)}.big-btn{padding:14px 40px;font-size:18px;font-weight:700;border:none;border-radius:12px;cursor:pointer;color:#fff;background:linear-gradient(135deg,var(--action-strong),var(--action));transition:all .25s;box-shadow:0 10px 28px #2e99d057;margin:6px}.big-btn:hover{transform:translateY(-2px);box-shadow:0 6px 24px #44aadd80}.big-btn.secondary{background:linear-gradient(135deg,#555,#777);box-shadow:0 4px 12px #0000004d}#end-screen{position:fixed;top:0;right:0;bottom:0;left:0;background:#030806d1;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);display:flex;justify-content:center;align-items:center;z-index:100}.end-content{text-align:center;width:min(560px,calc(100vw - 40px));max-height:94vh;overflow-y:auto;padding:30px 28px;border-radius:26px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 55%),#08130fd6;border:1px solid var(--panel-stroke);box-shadow:var(--shadow-lg)}.end-kicker{font-family:var(--font-display);font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:#d2edd37a;margin-bottom:12px}#end-title{font-size:48px;font-weight:900;margin-bottom:16px}#end-score{font-size:22px;color:#ffffffb3;margin-bottom:12px}.rank{position:relative;display:inline-block;font-size:64px;font-weight:900;width:110px;height:110px;line-height:110px;border-radius:50%;margin-bottom:28px;animation:rankPop .85s cubic-bezier(.175,.885,.32,1.4) both,rankPulseRing 2.2s ease-out .8s infinite;box-shadow:0 0 0 4px #ffffff0d,0 12px 38px #0006}.rank:before{content:"";position:absolute;top:0;right:0;bottom:0;left:0;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,rgba(255,255,255,.28) 40deg,transparent 80deg);animation:rankShine 2.6s linear infinite;pointer-events:none;mix-blend-mode:overlay}@keyframes rankPop{0%{opacity:0;transform:scale(.4) rotate(-20deg)}60%{opacity:1;transform:scale(1.12) rotate(4deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes rankShine{to{transform:rotate(360deg)}}@keyframes rankPulseRing{0%{box-shadow:0 0 #ffffff47,0 12px 38px #0006}70%{box-shadow:0 0 0 22px #fff0,0 12px 38px #0006}to{box-shadow:0 0 #fff0,0 12px 38px #0006}}.rank-S{background:linear-gradient(135deg,gold,#f80);color:#222}.rank-A{background:linear-gradient(135deg,#4ad,#26a);color:#fff}.rank-B{background:linear-gradient(135deg,#4c8,#285);color:#fff}.rank-C{background:linear-gradient(135deg,#888,#555);color:#fff}.end-actions{display:flex;gap:12px;justify-content:center}.end-stats{margin:22px 0 24px;padding:16px;border-radius:20px;background:#ffffff0d;border:1px solid rgba(214,245,219,.1);text-align:left}.stat-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06)}.stat-row:last-child{border-bottom:none}.stat-label{color:var(--text-muted)}.stat-val{font-family:var(--font-display);font-weight:700;color:var(--text-main)}#milestone-banner{position:fixed;top:24%;left:50%;transform:translate(-50%,-50%);z-index:22;pointer-events:none;text-align:center}#milestone-banner-text{font-size:36px;font-weight:900;color:gold;text-shadow:0 0 30px rgba(255,200,0,.8),0 2px 8px rgba(0,0,0,.9);animation:milestoneAnim .7s ease-out;padding:12px 24px;background:#00000080;border:2px solid rgba(255,200,0,.5);border-radius:16px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}@keyframes milestoneAnim{0%{transform:scale(.4) translateY(20px);opacity:0}60%{transform:scale(1.1) translateY(-4px)}to{transform:scale(1) translateY(0);opacity:1}}#streak-banner{position:fixed;top:18%;left:50%;transform:translate(-50%,-50%);z-index:21;pointer-events:none;font-size:30px;font-weight:900;padding:10px 22px;border-radius:14px;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:streakPop .5s ease-out}#streak-banner.streak-normal{color:#f80;text-shadow:0 0 20px rgba(255,130,0,.8),0 2px 6px rgba(0,0,0,.9);background:#00000080;border:1px solid rgba(255,130,0,.4)}#streak-banner.streak-mega{color:#fe0;text-shadow:0 0 25px rgba(255,230,0,.9),0 2px 8px rgba(0,0,0,.9);background:#0009;border:2px solid rgba(255,220,0,.6);box-shadow:0 0 30px #ffdc004d}@keyframes streakPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}60%{transform:translate(-50%,-50%) scale(1.12)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}#floating-text-layer{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:18;overflow:hidden}.floating-text{position:absolute;font-size:14px;font-weight:800;text-shadow:0 1px 4px rgba(0,0,0,.9);pointer-events:none;white-space:nowrap;animation:floatUp 1s ease-out forwards;transform:translate(-50%)}@keyframes floatUp{0%{opacity:1;transform:translate(-50%) translateY(0)}to{opacity:0;transform:translate(-50%) translateY(-40px)}}#help-btn{pointer-events:auto;background:#000000a6;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;font-size:15px;font-weight:700;color:#ffffffb3;cursor:pointer;transition:all .2s}#help-btn:hover{color:#fff;background:#ffffff1f}#help-overlay{position:fixed;top:0;right:0;bottom:0;left:0;background:#000000b3;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:center;z-index:80}#help-content{background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130ff0;border:1px solid var(--panel-stroke);border-radius:22px;box-shadow:var(--shadow-lg);padding:28px 36px;min-width:300px;text-align:center}.help-title{font-size:20px;font-weight:900;color:#fff;margin-bottom:20px}.help-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);gap:16px}.help-row:last-of-type{border-bottom:none}.help-key{font-size:13px;font-weight:700;color:gold;background:#ffc8001f;border:1px solid rgba(255,200,0,.3);border-radius:6px;padding:3px 10px;white-space:nowrap}.help-desc{font-size:13px;color:#ffffffbf;text-align:right}#help-close-btn{margin-top:20px;padding:10px 28px;background:linear-gradient(135deg,#26a,#4ad);border:none;border-radius:10px;font-size:14px;font-weight:700;color:#fff;cursor:pointer;transition:all .2s}#help-close-btn:hover{transform:translateY(-1px);box-shadow:0 4px 12px #4ad6}#reset-layout-btn{margin-top:20px;margin-right:10px;padding:10px 20px;background:#ffffff14;border:1px solid rgba(190,239,199,.25);border-radius:10px;font-size:14px;font-weight:700;color:#d9f2df;cursor:pointer;transition:all .2s}#reset-layout-btn:hover{background:#ffffff29;transform:translateY(-1px)}.draggable-panel{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}.ui-dragging{opacity:.92;cursor:grabbing;z-index:99!important;box-shadow:0 0 0 2px #78dcffd9,0 12px 34px #0000008c!important;transition:none!important}.hidden{display:none!important}button:focus-visible,input:focus-visible,[tabindex]:focus-visible{outline:3px solid #9be8ff;outline-offset:3px}#tower-tooltip{position:fixed;z-index:1000;background:#0a0f1ef2;border:1px solid #4ade80;border-radius:8px;padding:10px;color:#fff;pointer-events:none;box-shadow:0 4px 12px #00000080;font-size:14px;min-width:150px}#tower-tooltip .tooltip-name{font-weight:700;font-size:16px;color:#4ade80;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#tower-tooltip .tooltip-type{color:#aaa;font-size:12px;margin-bottom:6px;text-transform:capitalize}#tower-tooltip .tooltip-stats div{display:flex;justify-content:space-between;margin-top:2px}#tower-tooltip .tooltip-special{margin-top:6px;color:#fbbf24;font-size:12px;font-style:italic}#enemy-panel{position:absolute;top:60px;right:10px;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 55%),#210e0ce0;border:1px solid rgba(255,116,99,.4);border-radius:14px;padding:12px;color:#fff;pointer-events:none;box-shadow:var(--shadow-lg);font-size:14px;min-width:168px;text-transform:capitalize}#enemy-panel .panel-header{font-weight:700;font-size:16px;color:#f44;margin-bottom:4px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:2px}#enemy-panel .panel-stats div{display:flex;justify-content:space-between;margin-top:2px}@media(max-width:600px){.game-title{font-size:38px}.start-content{padding:26px 18px}.build-btn{padding:6px 7px;min-width:48px}.build-icon{font-size:16px}.build-name{font-size:9px}.build-cost{font-size:8px}#tower-panel{width:180px;right:8px;bottom:calc(170px + env(safe-area-inset-bottom,0px))}#wave-banner-text{font-size:18px;padding:10px 14px}#build-menu{left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));transform:none;max-width:none;padding:8px 8px 10px;gap:4px}.build-title,.build-subtitle{display:none}.build-grid{flex-wrap:nowrap;justify-content:flex-start;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;width:100%;padding:6px 2px 2px}.build-grid::-webkit-scrollbar{display:none}.build-btn{flex:0 0 auto}#skill-bar{left:8px;bottom:calc(100px + env(safe-area-inset-bottom,0px));gap:8px;padding:8px 10px}.skill-btn{width:48px;height:48px}}@media(max-height:500px){#build-menu{left:238px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));transform:none;max-width:none;padding:4px 8px;gap:2px}.build-title,.build-subtitle{display:none}.build-grid{flex-wrap:nowrap;justify-content:center;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;width:100%;padding:2px}.build-grid::-webkit-scrollbar{display:none}.build-btn{flex:0 0 auto;min-width:48px;gap:0;padding:3px 6px}.build-icon{font-size:15px;line-height:1.1}.build-name,.build-cost{font-size:8px;line-height:1.1}#skill-bar{left:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));gap:6px;padding:6px 8px}.skill-btn{width:48px;height:48px}#tower-panel{bottom:calc(76px + env(safe-area-inset-bottom,0px))}}#wave-modifier{position:fixed;top:82px;right:12px;z-index:16;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:linear-gradient(90deg,#ff5a3c40,#ffb43c33);border:1px solid rgba(255,160,90,.4);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 0 20px #ff783c59,var(--shadow-lg);color:#fff2e0;font-family:var(--font-display);font-weight:700;letter-spacing:.08em;animation:modBadgeIn .5s cubic-bezier(.2,.9,.3,1),modBadgePulse 2.2s ease-in-out infinite .6s}#wave-modifier.hidden{display:none}#wave-modifier .mod-emoji{font-size:18px}#wave-modifier .mod-label{font-size:14px;text-shadow:0 0 10px rgba(255,120,60,.8)}#wave-modifier .mod-desc{font-size:11px;opacity:.82;font-weight:500;letter-spacing:.04em}@keyframes modBadgeIn{0%{transform:translate(40px) scale(.6);opacity:0}60%{transform:translate(-6px) scale(1.08);opacity:1}to{transform:translate(0) scale(1);opacity:1}}@keyframes modBadgePulse{0%,to{box-shadow:0 0 20px #ff783c59,var(--shadow-lg)}50%{box-shadow:0 0 32px #ffa05ab3,var(--shadow-lg)}}@media(max-width:600px){#wave-modifier{top:68px;right:8px;padding:5px 10px;gap:5px}#wave-modifier .mod-desc{display:none}#wave-modifier .mod-label{font-size:12px}}#next-wave-preview{position:fixed;right:12px;bottom:120px;z-index:15;padding:10px 14px;border-radius:12px;background:#0a1611bd;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid rgba(190,239,199,.12);box-shadow:var(--shadow-lg);color:#f7fbf7;font-family:var(--font-display);animation:previewIn .35s ease-out}#next-wave-preview.hidden{display:none}#next-wave-preview .preview-label{font-size:11px;font-weight:600;letter-spacing:.18em;color:#9ed4ad;text-transform:uppercase;margin-bottom:6px;text-align:center}#next-wave-preview .preview-icons{display:flex;gap:8px;align-items:center;justify-content:center}#next-wave-preview .preview-chip{display:inline-flex;align-items:center;gap:3px;padding:4px 8px;border-radius:8px;background:#ffffff0f;font-size:14px;font-weight:700}#next-wave-preview .preview-chip .ico{font-size:16px}#next-wave-preview .preview-chip .cnt{color:#cfe6d6;font-size:12px}@keyframes previewIn{0%{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}@media(max-width:600px){#next-wave-preview{right:8px;bottom:calc(100px + env(safe-area-inset-bottom,0px));padding:6px 10px;font-size:12px}#next-wave-preview .preview-chip{padding:3px 6px;font-size:12px}}#boss-cinematic{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;z-index:90;animation:bossCinematicFade 2.4s ease-out forwards}#boss-cinematic.hidden{display:none}#boss-cinematic .boss-vignette{position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(ellipse at center,#ff1e1e00 30%,#b40a0a8c 90%,#3c0000d9);mix-blend-mode:multiply;animation:bossVignettePulse 2.4s ease-out forwards}#boss-cinematic .boss-banner{position:absolute;top:38%;left:50%;transform:translate(-50%,-50%) scale(.4);text-align:center;font-family:var(--font-display);color:#ffe1d0;text-shadow:0 0 18px rgba(255,60,40,.9),0 0 42px rgba(255,20,20,.55);animation:bossBannerIn 2.4s cubic-bezier(.2,.9,.3,1) forwards}#boss-cinematic .boss-sub{font-size:22px;font-weight:600;letter-spacing:.4em;color:#ffb080;margin-bottom:6px;opacity:.9}#boss-cinematic .boss-title{font-size:56px;font-weight:900;letter-spacing:.18em}@keyframes bossCinematicFade{0%{opacity:0}12%{opacity:1}75%{opacity:1}to{opacity:0}}@keyframes bossVignettePulse{0%{opacity:0}20%{opacity:1}50%{opacity:.85}80%{opacity:.7}to{opacity:0}}@keyframes bossBannerIn{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}18%{transform:translate(-50%,-50%) scale(1.12);opacity:1}28%{transform:translate(-50%,-50%) scale(1);opacity:1}80%{transform:translate(-50%,-50%) scale(1.02);opacity:1}to{transform:translate(-50%,-50%) scale(1.1);opacity:0}}@media(max-width:600px){#boss-cinematic .boss-title{font-size:36px;letter-spacing:.12em}#boss-cinematic .boss-sub{font-size:16px}}#buff-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:200;display:flex;align-items:center;justify-content:center;animation:buffFadeIn .35s ease both}#buff-modal.hidden{display:none}#buff-modal .buff-backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 50% 40%,#1e1432b3,#05050ceb);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}#buff-modal .buff-dialog{position:relative;min-width:520px;max-width:92vw;padding:28px 30px 32px;background:linear-gradient(145deg,#241c3af5,#120e20f5);border:1px solid rgba(255,210,110,.4);border-radius:18px;box-shadow:0 20px 60px #0000008c,0 0 80px #ffbe5026;text-align:center;animation:buffDialogIn .45s cubic-bezier(.34,1.56,.64,1) both}#buff-modal .buff-kicker{font-size:11px;letter-spacing:.24em;color:#ffd486;text-transform:uppercase;opacity:.85}#buff-modal .buff-title{font-size:30px;font-weight:800;letter-spacing:.04em;margin-top:4px;color:#fff3d9;text-shadow:0 0 22px rgba(255,200,100,.55)}#buff-modal .buff-sub{margin-top:6px;font-size:13px;color:#ffffffb3}#buff-modal .buff-cards{margin-top:22px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.buff-card{padding:18px 12px 16px;background:linear-gradient(160deg,#44346499,#20163899);border:1px solid rgba(255,255,255,.1);border-radius:14px;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease;display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-family:inherit}.buff-card:hover{transform:translateY(-4px) scale(1.02);border-color:#ffdc78b3;background:linear-gradient(160deg,#604a8cb3,#302050b3);box-shadow:0 14px 28px #00000080,0 0 26px #ffc86440}.buff-card .card-emoji{font-size:36px;line-height:1;margin-bottom:4px}.buff-card .card-name{font-size:15px;font-weight:700;letter-spacing:.03em}.buff-card .card-desc{font-size:12px;opacity:.82;line-height:1.4}@keyframes buffFadeIn{0%{opacity:0}to{opacity:1}}@keyframes buffDialogIn{0%{transform:translateY(16px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}@media(max-width:600px){#buff-modal .buff-dialog{min-width:0;width:94vw;padding:22px 18px 24px}#buff-modal .buff-title{font-size:24px}#buff-modal .buff-cards{grid-template-columns:1fr;gap:10px}.buff-card .card-emoji{font-size:30px}}#achievement-toasts{position:fixed;top:90px;right:18px;z-index:220;display:flex;flex-direction:column;gap:10px;pointer-events:none}.ach-toast{min-width:240px;max-width:320px;padding:12px 14px;display:flex;gap:12px;align-items:center;background:linear-gradient(135deg,#36245af5,#1c1630f5);border:1px solid rgba(255,220,120,.55);border-radius:12px;box-shadow:0 10px 28px #00000073,0 0 26px #ffc86433;color:#fff3d9;font-family:inherit;animation:achIn .45s cubic-bezier(.34,1.56,.64,1) both,achOut .5s ease 3.6s forwards}.ach-toast .ach-emoji{font-size:32px;line-height:1;flex-shrink:0}.ach-toast .ach-body{display:flex;flex-direction:column;gap:2px;min-width:0}.ach-toast .ach-kicker{font-size:9px;letter-spacing:.22em;color:#ffd486;text-transform:uppercase;opacity:.9}.ach-toast .ach-name{font-size:14px;font-weight:700;letter-spacing:.03em}.ach-toast .ach-desc{font-size:11px;opacity:.82;line-height:1.35}@keyframes achIn{0%{transform:translate(120%);opacity:0}to{transform:translate(0);opacity:1}}@keyframes achOut{to{transform:translate(120%);opacity:0}}.high-score-row{margin-top:14px;padding:10px 16px;background:#ffffff0a;border:1px solid rgba(255,220,120,.22);border-radius:10px;display:inline-flex;gap:10px;align-items:baseline;font-size:13px;color:#ffffffd9}.high-score-row .hs-label{color:#ffd486;letter-spacing:.1em;text-transform:uppercase;font-size:10px}.high-score-row .hs-val{font-weight:800;font-size:18px;color:#fff3d9;text-shadow:0 0 12px rgba(255,200,100,.45)}.high-score-row .hs-sub{font-size:11px;opacity:.7}#end-best-badge{margin:6px auto 4px;display:inline-block;padding:4px 14px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:800;color:#0c0a1a;background:linear-gradient(135deg,#ffe18a,#ffc34a);border-radius:999px;box-shadow:0 0 22px #ffc85a99;animation:bestPulse 1.4s ease-in-out infinite}#end-best-badge.hidden{display:none}@keyframes bestPulse{0%,to{transform:scale(1);box-shadow:0 0 22px #ffc85a99}50%{transform:scale(1.06);box-shadow:0 0 34px #ffdc78e6}}@media(max-width:600px){#achievement-toasts{top:70px;right:10px}.ach-toast{min-width:0;max-width:78vw}}.endless-toggle{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:10px;align-items:center;margin:14px auto 0;padding:10px 16px;max-width:360px;background:#ffffff0a;border:1px solid rgba(140,200,255,.22);border-radius:10px;cursor:pointer;color:#ffffffd9;transition:background .18s,border-color .18s}.endless-toggle:hover{background:#8cc8ff14;border-color:#8cc8ff80}.endless-toggle input{position:absolute;opacity:0;pointer-events:none}.endless-toggle .endless-box{grid-row:1 / span 2;width:20px;height:20px;border:2px solid rgba(160,200,255,.6);border-radius:5px;display:inline-block;position:relative;transition:background .18s,border-color .18s}.endless-toggle input:checked~.endless-box{background:linear-gradient(135deg,#6dd1ff,#3a8bff);border-color:#9de1ff;box-shadow:0 0 10px #64b4ff8c}.endless-toggle input:checked~.endless-box:after{content:"✓";position:absolute;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;color:#0c1528;font-weight:900;font-size:14px}.endless-toggle .endless-text{font-size:14px;font-weight:700;letter-spacing:.04em;color:#d7ecff}.endless-toggle .endless-sub{grid-column:2;font-size:10px;opacity:.7;line-height:1.3}.link-btn{margin-top:12px;background:transparent;border:1px solid rgba(255,220,120,.35);color:#ffd486;padding:8px 16px;border-radius:8px;font-size:12px;letter-spacing:.08em;cursor:pointer;font-family:inherit;transition:background .18s,border-color .18s,color .18s}.link-btn:hover{background:#ffdc781a;border-color:#ffdc78b3;color:#fff3d9}#achievements-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:210;display:flex;align-items:center;justify-content:center;animation:buffFadeIn .3s ease both}#achievements-modal.hidden{display:none}#achievements-modal .ach-backdrop{position:absolute;top:0;right:0;bottom:0;left:0;background:#06060ecc;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}#achievements-modal .ach-dialog{position:relative;width:min(640px,92vw);max-height:80vh;overflow-y:auto;padding:22px 24px 24px;background:linear-gradient(145deg,#221c38f7,#120e20f7);border:1px solid rgba(255,220,120,.35);border-radius:16px;box-shadow:0 20px 60px #0000008c;color:#fff;animation:buffDialogIn .4s cubic-bezier(.34,1.56,.64,1) both}#achievements-modal .ach-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}#achievements-modal .ach-kick{font-size:10px;letter-spacing:.22em;color:#ffd486;text-transform:uppercase;opacity:.9}#achievements-modal .ach-ttl{font-size:22px;font-weight:800;letter-spacing:.03em}#achievements-modal #ach-count{font-size:13px;color:#ffdc78cc;margin-left:8px;font-weight:600}#achievements-modal #ach-close-btn{background:transparent;border:none;color:#fff9;font-size:18px;cursor:pointer;padding:4px 10px;border-radius:6px;transition:background .18s,color .18s}#achievements-modal #ach-close-btn:hover{background:#ffffff14;color:#fff}#achievements-modal .ach-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ach-row{display:flex;gap:12px;align-items:center;padding:12px 14px;background:#ffffff0a;border:1px solid rgba(255,255,255,.08);border-radius:10px;transition:background .18s,border-color .18s,filter .18s}.ach-row.locked{filter:grayscale(1) brightness(.7)}.ach-row.unlocked{background:linear-gradient(135deg,#785ab440,#3c327840);border-color:#ffdc7866}.ach-row .row-emoji{font-size:28px;line-height:1;flex-shrink:0}.ach-row .row-body{display:flex;flex-direction:column;gap:2px;min-width:0}.ach-row .row-name{font-size:13px;font-weight:700;letter-spacing:.03em}.ach-row .row-desc{font-size:11px;opacity:.75;line-height:1.35}@media(max-width:600px){#achievements-modal .ach-grid{grid-template-columns:1fr}}.continue-run{width:min(380px,100%);margin:14px auto 4px;padding:12px 16px;border:1px solid rgba(126,245,195,.34);border-radius:14px;background:linear-gradient(135deg,#45b07e29,#4da4d71a)}.continue-label{color:#9be8bf;font-family:var(--font-display);font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.continue-summary{margin:5px 0 8px;color:#f7fbf7cc;font-size:13px}.continue-btn{margin:2px;padding:11px 28px;font-size:16px;background:linear-gradient(135deg,#268f63,#2e99d0)}#pause-overlay,#graphics-recovery{position:fixed;top:0;right:0;bottom:0;left:0;z-index:240;display:flex;align-items:center;justify-content:center;padding:20px;background:#030806c7;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}#graphics-recovery{z-index:260;background:radial-gradient(circle at 50% 35%,rgba(151,69,46,.24),transparent 42%),#030806f0}.pause-dialog,.recovery-dialog{width:min(460px,calc(100vw - 40px));padding:30px 28px;border:1px solid var(--panel-stroke);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 58%),#08130ff5;box-shadow:var(--shadow-lg);color:#f7fbf7;text-align:center}.recovery-dialog{border-color:#ff9a6966}.pause-kicker{color:#9ed4ad;font-family:var(--font-display);font-size:11px;font-weight:800;letter-spacing:.2em;text-transform:uppercase}.pause-dialog h2,.recovery-dialog h2{margin:8px 0;font-family:var(--font-display);font-size:clamp(26px,7vw,38px)}.pause-dialog p,.recovery-dialog p{margin:0 auto 16px;max-width:38ch;color:var(--text-muted);line-height:1.55}.recovery-actions{display:flex;flex-wrap:wrap;justify-content:center}.lifetime-row{margin-top:10px;display:inline-flex;gap:8px;flex-wrap:wrap;justify-content:center}.lifetime-row .lt-chip{display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:6px 12px;background:#ffffff0a;border:1px solid rgba(255,255,255,.08);border-radius:8px;min-width:74px}.lifetime-row .lt-label{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#ffffff8c}.lifetime-row .lt-val{font-size:15px;font-weight:700;color:#fff3d9}#ach-reset-btn.reset-btn{margin-top:18px;width:100%;padding:10px 14px;background:transparent;border:1px solid rgba(255,100,100,.35);border-radius:8px;color:#ff9a9a;font-family:inherit;font-size:12px;letter-spacing:.08em;cursor:pointer;transition:background .18s,border-color .18s,color .18s}#ach-reset-btn.reset-btn:hover{background:#ff64641f;border-color:#ff6464b3;color:#ffc8c8}#ach-reset-btn.reset-btn.confirming{background:#ff646433;border-color:#ff8a8a;color:#fff}
/*$vite$:1*/`,document.head.appendChild(hi);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const yn="170",ss=0,qc=1,Zf=2,fa=1,Jf=2,Xn=3,Yn=0,Bt=1,ct=2,qn=0,rs=1,fi=2,jc=3,$c=4,Qf=5,Ni=100,ep=101,tp=102,np=103,ip=104,sp=200,rp=201,op=202,ap=203,pa=204,ma=205,lp=206,cp=207,dp=208,up=209,hp=210,fp=211,pp=212,mp=213,gp=214,ga=0,xa=1,va=2,os=3,_a=4,ya=5,ba=6,Ma=7,Sa=0,xp=1,vp=2,pi=0,Kc=1,_p=2,yp=3,Zc=4,bp=5,Mp=6,Sp=7,Jc="attached",wp="detached",Qc=300,as=301,ls=302,wa=303,Ta=304,$r=306,cs=1e3,mi=1001,Kr=1002,zt=1003,ed=1004,tr=1005,Qt=1006,Zr=1007,jn=1008,$n=1009,td=1010,nd=1011,nr=1012,Ea=1013,Fi=1014,bn=1015,Kn=1016,Aa=1017,Ra=1018,ds=1020,id=35902,sd=1021,rd=1022,fn=1023,od=1024,ad=1025,us=1026,hs=1027,Ca=1028,Pa=1029,ld=1030,Ia=1031,La=1033,Jr=33776,Qr=33777,eo=33778,to=33779,Da=35840,Ua=35841,Na=35842,Fa=35843,Oa=36196,ka=37492,Ba=37496,za=37808,Ha=37809,Ga=37810,Va=37811,Wa=37812,Xa=37813,Ya=37814,qa=37815,ja=37816,$a=37817,Ka=37818,Za=37819,Ja=37820,Qa=37821,no=36492,el=36494,tl=36495,cd=36283,nl=36284,il=36285,sl=36286,ir=2300,sr=2301,rl=2302,dd=2400,ud=2401,hd=2402,Tp=2500,Ep=0,fd=1,ol=2,Ap=3200,Rp=3201,al=0,Cp=1,gi="",It="srgb",Ht="srgb-linear",io="linear",ot="srgb",fs=7680,pd=519,Pp=512,Ip=513,Lp=514,md=515,Dp=516,Up=517,Np=518,Fp=519,ll=35044,gd="300 es",Zn=2e3,so=2001;class ps{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Dt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let xd=1234567;const rr=Math.PI/180,ms=180/Math.PI;function Mn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Dt[i&255]+Dt[i>>8&255]+Dt[i>>16&255]+Dt[i>>24&255]+"-"+Dt[e&255]+Dt[e>>8&255]+"-"+Dt[e>>16&15|64]+Dt[e>>24&255]+"-"+Dt[t&63|128]+Dt[t>>8&255]+"-"+Dt[t>>16&255]+Dt[t>>24&255]+Dt[n&255]+Dt[n>>8&255]+Dt[n>>16&255]+Dt[n>>24&255]).toLowerCase()}function Ut(i,e,t){return Math.max(e,Math.min(t,i))}function cl(i,e){return(i%e+e)%e}function Op(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function kp(i,e,t){return i!==e?(t-i)/(e-i):0}function or(i,e,t){return(1-t)*i+t*e}function Bp(i,e,t,n){return or(i,e,1-Math.exp(-t*n))}function zp(i,e=1){return e-Math.abs(cl(i,e*2)-e)}function Hp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Gp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Vp(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Wp(i,e){return i+Math.random()*(e-i)}function Xp(i){return i*(.5-Math.random())}function Yp(i){i!==void 0&&(xd=i);let e=xd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function qp(i){return i*rr}function jp(i){return i*ms}function $p(i){return(i&i-1)===0&&i!==0}function Kp(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Zp(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Jp(i,e,t,n,s){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),d=o((e+n)/2),u=r((e-n)/2),h=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*d,l*u,l*h,a*c);break;case"YZY":i.set(l*h,a*d,l*u,a*c);break;case"ZXZ":i.set(l*u,l*h,a*d,a*c);break;case"XZX":i.set(a*d,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*d,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*d,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Sn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function it(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const ro={DEG2RAD:rr,RAD2DEG:ms,generateUUID:Mn,clamp:Ut,euclideanModulo:cl,mapLinear:Op,inverseLerp:kp,lerp:or,damp:Bp,pingpong:zp,smoothstep:Hp,smootherstep:Gp,randInt:Vp,randFloat:Wp,randFloatSpread:Xp,seededRandom:Yp,degToRad:qp,radToDeg:jp,isPowerOfTwo:$p,ceilPowerOfTwo:Kp,floorPowerOfTwo:Zp,setQuaternionFromProperEuler:Jp,normalize:it,denormalize:Sn};class we{constructor(e=0,t=0){we.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ue{constructor(e,t,n,s,r,o,a,l,c){Ue.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){const d=this.elements;return d[0]=e,d[1]=s,d[2]=a,d[3]=t,d[4]=r,d[5]=l,d[6]=n,d[7]=o,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],d=n[4],u=n[7],h=n[2],f=n[5],g=n[8],x=s[0],m=s[3],p=s[6],S=s[1],b=s[4],v=s[7],I=s[2],E=s[5],A=s[8];return r[0]=o*x+a*S+l*I,r[3]=o*m+a*b+l*E,r[6]=o*p+a*v+l*A,r[1]=c*x+d*S+u*I,r[4]=c*m+d*b+u*E,r[7]=c*p+d*v+u*A,r[2]=h*x+f*S+g*I,r[5]=h*m+f*b+g*E,r[8]=h*p+f*v+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8];return t*o*d-t*a*c-n*r*d+n*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],u=d*o-a*c,h=a*l-d*r,f=c*r-o*l,g=t*u+n*h+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=u*x,e[1]=(s*c-d*n)*x,e[2]=(a*n-s*o)*x,e[3]=h*x,e[4]=(d*t-s*l)*x,e[5]=(s*r-a*t)*x,e[6]=f*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(dl.makeScale(e,t)),this}rotate(e){return this.premultiply(dl.makeRotation(-e)),this}translate(e,t){return this.premultiply(dl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const dl=new Ue;function vd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function ar(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Qp(){const i=ar("canvas");return i.style.display="block",i}const _d={};function lr(i){i in _d||(_d[i]=!0,console.warn(i))}function em(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function tm(i){const e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function nm(i){const e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Xe={enabled:!0,workingColorSpace:Ht,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===ot&&(i.r=Jn(i.r),i.g=Jn(i.g),i.b=Jn(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===ot&&(i.r=gs(i.r),i.g=gs(i.g),i.b=gs(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===gi?io:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function Jn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function gs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}const yd=[.64,.33,.3,.6,.15,.06],bd=[.2126,.7152,.0722],Md=[.3127,.329],Sd=new Ue().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),wd=new Ue().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Xe.define({[Ht]:{primaries:yd,whitePoint:Md,transfer:io,toXYZ:Sd,fromXYZ:wd,luminanceCoefficients:bd,workingColorSpaceConfig:{unpackColorSpace:It},outputColorSpaceConfig:{drawingBufferColorSpace:It}},[It]:{primaries:yd,whitePoint:Md,transfer:ot,toXYZ:Sd,fromXYZ:wd,luminanceCoefficients:bd,outputColorSpaceConfig:{drawingBufferColorSpace:It}}});let xs;class im{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{xs===void 0&&(xs=ar("canvas")),xs.width=e.width,xs.height=e.height;const n=xs.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=xs}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ar("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Jn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Jn(t[n]/255)*255):t[n]=Jn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let sm=0;class Td{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:sm++}),this.uuid=Mn(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(ul(s[o].image)):r.push(ul(s[o]))}else r=ul(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function ul(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?im.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let rm=0;class Et extends ps{constructor(e=Et.DEFAULT_IMAGE,t=Et.DEFAULT_MAPPING,n=mi,s=mi,r=Qt,o=jn,a=fn,l=$n,c=Et.DEFAULT_ANISOTROPY,d=gi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:rm++}),this.uuid=Mn(),this.name="",this.source=new Td(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new we(0,0),this.repeat=new we(1,1),this.center=new we(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ue,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Qc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case cs:e.x=e.x-Math.floor(e.x);break;case mi:e.x=e.x<0?0:1;break;case Kr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case cs:e.y=e.y-Math.floor(e.y);break;case mi:e.y=e.y<0?0:1;break;case Kr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Et.DEFAULT_IMAGE=null,Et.DEFAULT_MAPPING=Qc,Et.DEFAULT_ANISOTROPY=1;class Je{constructor(e=0,t=0,n=0,s=1){Je.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],d=l[4],u=l[8],h=l[1],f=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(d-h)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(d+h)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(c+1)/2,v=(f+1)/2,I=(p+1)/2,E=(d+h)/4,A=(u+x)/4,L=(g+m)/4;return b>v&&b>I?b<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(b),s=E/n,r=A/n):v>I?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=E/s,r=L/s):I<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(I),n=A/r,s=L/r),this.set(n,s,r,t),this}let S=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(h-d)*(h-d));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(u-x)/S,this.z=(h-d)/S,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class om extends ps{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Je(0,0,e,t),this.scissorTest=!1,this.viewport=new Je(0,0,e,t);const s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Qt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Et(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Td(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class wn extends om{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Ed extends Et{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=mi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class am extends Et{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=mi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Qn{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],d=n[s+2],u=n[s+3];const h=r[o+0],f=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=d,e[t+3]=u;return}if(a===1){e[t+0]=h,e[t+1]=f,e[t+2]=g,e[t+3]=x;return}if(u!==x||l!==h||c!==f||d!==g){let m=1-a;const p=l*h+c*f+d*g+u*x,S=p>=0?1:-1,b=1-p*p;if(b>Number.EPSILON){const I=Math.sqrt(b),E=Math.atan2(I,p*S);m=Math.sin(m*E)/I,a=Math.sin(a*E)/I}const v=a*S;if(l=l*m+h*v,c=c*m+f*v,d=d*m+g*v,u=u*m+x*v,m===1-a){const I=1/Math.sqrt(l*l+c*c+d*d+u*u);l*=I,c*=I,d*=I,u*=I}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],d=n[s+3],u=r[o],h=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+d*u+l*f-c*h,e[t+1]=l*g+d*h+c*u-a*f,e[t+2]=c*g+d*f+a*h-l*u,e[t+3]=d*g-a*u-l*h-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),d=a(s/2),u=a(r/2),h=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=h*d*u+c*f*g,this._y=c*f*u-h*d*g,this._z=c*d*g+h*f*u,this._w=c*d*u-h*f*g;break;case"YXZ":this._x=h*d*u+c*f*g,this._y=c*f*u-h*d*g,this._z=c*d*g-h*f*u,this._w=c*d*u+h*f*g;break;case"ZXY":this._x=h*d*u-c*f*g,this._y=c*f*u+h*d*g,this._z=c*d*g+h*f*u,this._w=c*d*u-h*f*g;break;case"ZYX":this._x=h*d*u-c*f*g,this._y=c*f*u+h*d*g,this._z=c*d*g-h*f*u,this._w=c*d*u+h*f*g;break;case"YZX":this._x=h*d*u+c*f*g,this._y=c*f*u+h*d*g,this._z=c*d*g-h*f*u,this._w=c*d*u-h*f*g;break;case"XZY":this._x=h*d*u-c*f*g,this._y=c*f*u-h*d*g,this._z=c*d*g+h*f*u,this._w=c*d*u+h*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],d=t[6],u=t[10],h=n+a+u;if(h>0){const f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(d-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(d-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+d)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+d)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ut(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,d=t._w;return this._x=n*d+o*a+s*c-r*l,this._y=s*d+o*l+r*a-n*c,this._z=r*d+o*c+n*l-s*a,this._w=o*d-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),d=Math.atan2(c,a),u=Math.sin((1-t)*d)/c,h=Math.sin(t*d)/c;return this._w=o*u+this._w*h,this._x=n*u+this._x*h,this._y=s*u+this._y*h,this._z=r*u+this._z*h,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class R{constructor(e=0,t=0,n=0){R.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ad.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ad.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),d=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*d,this.y=n+l*d+a*c-r*u,this.z=s+l*u+r*d-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return hl.copy(this).projectOnVector(e),this.sub(hl)}reflect(e){return this.sub(hl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const hl=new R,Ad=new Qn;class Gt{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Tn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Tn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Tn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Tn):Tn.fromBufferAttribute(r,o),Tn.applyMatrix4(e.matrixWorld),this.expandByPoint(Tn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),oo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),oo.copy(n.boundingBox)),oo.applyMatrix4(e.matrixWorld),this.union(oo)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Tn),Tn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(cr),ao.subVectors(this.max,cr),vs.subVectors(e.a,cr),_s.subVectors(e.b,cr),ys.subVectors(e.c,cr),xi.subVectors(_s,vs),vi.subVectors(ys,_s),Oi.subVectors(vs,ys);let t=[0,-xi.z,xi.y,0,-vi.z,vi.y,0,-Oi.z,Oi.y,xi.z,0,-xi.x,vi.z,0,-vi.x,Oi.z,0,-Oi.x,-xi.y,xi.x,0,-vi.y,vi.x,0,-Oi.y,Oi.x,0];return!fl(t,vs,_s,ys,ao)||(t=[1,0,0,0,1,0,0,0,1],!fl(t,vs,_s,ys,ao))?!1:(lo.crossVectors(xi,vi),t=[lo.x,lo.y,lo.z],fl(t,vs,_s,ys,ao))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Tn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Tn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ei[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ei[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ei[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ei[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ei[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ei[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ei[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ei[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ei),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const ei=[new R,new R,new R,new R,new R,new R,new R,new R],Tn=new R,oo=new Gt,vs=new R,_s=new R,ys=new R,xi=new R,vi=new R,Oi=new R,cr=new R,ao=new R,lo=new R,ki=new R;function fl(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ki.fromArray(i,r);const a=s.x*Math.abs(ki.x)+s.y*Math.abs(ki.y)+s.z*Math.abs(ki.z),l=e.dot(ki),c=t.dot(ki),d=n.dot(ki);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>a)return!1}return!0}const lm=new Gt,dr=new R,pl=new R;class Un{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):lm.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;dr.subVectors(e,this.center);const t=dr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(dr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(pl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(dr.copy(e.center).add(pl)),this.expandByPoint(dr.copy(e.center).sub(pl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ti=new R,ml=new R,co=new R,_i=new R,gl=new R,uo=new R,xl=new R;class ur{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ti)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ti.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ti.copy(this.origin).addScaledVector(this.direction,t),ti.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){ml.copy(e).add(t).multiplyScalar(.5),co.copy(t).sub(e).normalize(),_i.copy(this.origin).sub(ml);const r=e.distanceTo(t)*.5,o=-this.direction.dot(co),a=_i.dot(this.direction),l=-_i.dot(co),c=_i.lengthSq(),d=Math.abs(1-o*o);let u,h,f,g;if(d>0)if(u=o*l-a,h=o*a-l,g=r*d,u>=0)if(h>=-g)if(h<=g){const x=1/d;u*=x,h*=x,f=u*(u+o*h+2*a)+h*(o*u+h+2*l)+c}else h=r,u=Math.max(0,-(o*h+a)),f=-u*u+h*(h+2*l)+c;else h=-r,u=Math.max(0,-(o*h+a)),f=-u*u+h*(h+2*l)+c;else h<=-g?(u=Math.max(0,-(-o*r+a)),h=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+h*(h+2*l)+c):h<=g?(u=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(u=Math.max(0,-(o*r+a)),h=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+h*(h+2*l)+c);else h=o>0?-r:r,u=Math.max(0,-(o*h+a)),f=-u*u+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(ml).addScaledVector(co,h),f}intersectSphere(e,t){ti.subVectors(e.center,this.origin);const n=ti.dot(this.direction),s=ti.dot(ti)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l;const c=1/this.direction.x,d=1/this.direction.y,u=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),d>=0?(r=(e.min.y-h.y)*d,o=(e.max.y-h.y)*d):(r=(e.max.y-h.y)*d,o=(e.min.y-h.y)*d),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-h.z)*u,l=(e.max.z-h.z)*u):(a=(e.max.z-h.z)*u,l=(e.min.z-h.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,ti)!==null}intersectTriangle(e,t,n,s,r){gl.subVectors(t,e),uo.subVectors(n,e),xl.crossVectors(gl,uo);let o=this.direction.dot(xl),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;_i.subVectors(this.origin,e);const l=a*this.direction.dot(uo.crossVectors(_i,uo));if(l<0)return null;const c=a*this.direction.dot(gl.cross(_i));if(c<0||l+c>o)return null;const d=-a*_i.dot(xl);return d<0?null:this.at(d/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ie{constructor(e,t,n,s,r,o,a,l,c,d,u,h,f,g,x,m){Ie.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,d,u,h,f,g,x,m)}set(e,t,n,s,r,o,a,l,c,d,u,h,f,g,x,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=d,p[10]=u,p[14]=h,p[3]=f,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ie().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/bs.setFromMatrixColumn(e,0).length(),r=1/bs.setFromMatrixColumn(e,1).length(),o=1/bs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),d=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const h=o*d,f=o*u,g=a*d,x=a*u;t[0]=l*d,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=h-x*c,t[9]=-a*l,t[2]=x-h*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const h=l*d,f=l*u,g=c*d,x=c*u;t[0]=h+x*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*d,t[9]=-a,t[2]=f*a-g,t[6]=x+h*a,t[10]=o*l}else if(e.order==="ZXY"){const h=l*d,f=l*u,g=c*d,x=c*u;t[0]=h-x*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*d,t[9]=x-h*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const h=o*d,f=o*u,g=a*d,x=a*u;t[0]=l*d,t[4]=g*c-f,t[8]=h*c+x,t[1]=l*u,t[5]=x*c+h,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const h=o*l,f=o*c,g=a*l,x=a*c;t[0]=l*d,t[4]=x-h*u,t[8]=g*u+f,t[1]=u,t[5]=o*d,t[9]=-a*d,t[2]=-c*d,t[6]=f*u+g,t[10]=h-x*u}else if(e.order==="XZY"){const h=o*l,f=o*c,g=a*l,x=a*c;t[0]=l*d,t[4]=-u,t[8]=c*d,t[1]=h*u+x,t[5]=o*d,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*d,t[10]=x*u+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(cm,e,dm)}lookAt(e,t,n){const s=this.elements;return en.subVectors(e,t),en.lengthSq()===0&&(en.z=1),en.normalize(),yi.crossVectors(n,en),yi.lengthSq()===0&&(Math.abs(n.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),yi.crossVectors(n,en)),yi.normalize(),ho.crossVectors(en,yi),s[0]=yi.x,s[4]=ho.x,s[8]=en.x,s[1]=yi.y,s[5]=ho.y,s[9]=en.y,s[2]=yi.z,s[6]=ho.z,s[10]=en.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],d=n[1],u=n[5],h=n[9],f=n[13],g=n[2],x=n[6],m=n[10],p=n[14],S=n[3],b=n[7],v=n[11],I=n[15],E=s[0],A=s[4],L=s[8],w=s[12],M=s[1],P=s[5],H=s[9],z=s[13],W=s[2],K=s[6],X=s[10],ne=s[14],V=s[3],ae=s[7],fe=s[11],Se=s[15];return r[0]=o*E+a*M+l*W+c*V,r[4]=o*A+a*P+l*K+c*ae,r[8]=o*L+a*H+l*X+c*fe,r[12]=o*w+a*z+l*ne+c*Se,r[1]=d*E+u*M+h*W+f*V,r[5]=d*A+u*P+h*K+f*ae,r[9]=d*L+u*H+h*X+f*fe,r[13]=d*w+u*z+h*ne+f*Se,r[2]=g*E+x*M+m*W+p*V,r[6]=g*A+x*P+m*K+p*ae,r[10]=g*L+x*H+m*X+p*fe,r[14]=g*w+x*z+m*ne+p*Se,r[3]=S*E+b*M+v*W+I*V,r[7]=S*A+b*P+v*K+I*ae,r[11]=S*L+b*H+v*X+I*fe,r[15]=S*w+b*z+v*ne+I*Se,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],d=e[2],u=e[6],h=e[10],f=e[14],g=e[3],x=e[7],m=e[11],p=e[15];return g*(+r*l*u-s*c*u-r*a*h+n*c*h+s*a*f-n*l*f)+x*(+t*l*f-t*c*h+r*o*h-s*o*f+s*c*d-r*l*d)+m*(+t*c*u-t*a*f-r*o*u+n*o*f+r*a*d-n*c*d)+p*(-s*a*d-t*l*u+t*a*h+s*o*u-n*o*h+n*l*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],d=e[8],u=e[9],h=e[10],f=e[11],g=e[12],x=e[13],m=e[14],p=e[15],S=u*m*c-x*h*c+x*l*f-a*m*f-u*l*p+a*h*p,b=g*h*c-d*m*c-g*l*f+o*m*f+d*l*p-o*h*p,v=d*x*c-g*u*c+g*a*f-o*x*f-d*a*p+o*u*p,I=g*u*l-d*x*l-g*a*h+o*x*h+d*a*m-o*u*m,E=t*S+n*b+s*v+r*I;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return e[0]=S*A,e[1]=(x*h*r-u*m*r-x*s*f+n*m*f+u*s*p-n*h*p)*A,e[2]=(a*m*r-x*l*r+x*s*c-n*m*c-a*s*p+n*l*p)*A,e[3]=(u*l*r-a*h*r-u*s*c+n*h*c+a*s*f-n*l*f)*A,e[4]=b*A,e[5]=(d*m*r-g*h*r+g*s*f-t*m*f-d*s*p+t*h*p)*A,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*p-t*l*p)*A,e[7]=(o*h*r-d*l*r+d*s*c-t*h*c-o*s*f+t*l*f)*A,e[8]=v*A,e[9]=(g*u*r-d*x*r-g*n*f+t*x*f+d*n*p-t*u*p)*A,e[10]=(o*x*r-g*a*r+g*n*c-t*x*c-o*n*p+t*a*p)*A,e[11]=(d*a*r-o*u*r-d*n*c+t*u*c+o*n*f-t*a*f)*A,e[12]=I*A,e[13]=(d*x*s-g*u*s+g*n*h-t*x*h-d*n*m+t*u*m)*A,e[14]=(g*a*s-o*x*s-g*n*l+t*x*l+o*n*m-t*a*m)*A,e[15]=(o*u*s-d*a*s+d*n*l-t*u*l-o*n*h+t*a*h)*A,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,d=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,d*a+n,d*l-s*o,0,c*l-s*a,d*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,d=o+o,u=a+a,h=r*c,f=r*d,g=r*u,x=o*d,m=o*u,p=a*u,S=l*c,b=l*d,v=l*u,I=n.x,E=n.y,A=n.z;return s[0]=(1-(x+p))*I,s[1]=(f+v)*I,s[2]=(g-b)*I,s[3]=0,s[4]=(f-v)*E,s[5]=(1-(h+p))*E,s[6]=(m+S)*E,s[7]=0,s[8]=(g+b)*A,s[9]=(m-S)*A,s[10]=(1-(h+x))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=bs.set(s[0],s[1],s[2]).length();const o=bs.set(s[4],s[5],s[6]).length(),a=bs.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],En.copy(this);const c=1/r,d=1/o,u=1/a;return En.elements[0]*=c,En.elements[1]*=c,En.elements[2]*=c,En.elements[4]*=d,En.elements[5]*=d,En.elements[6]*=d,En.elements[8]*=u,En.elements[9]*=u,En.elements[10]*=u,t.setFromRotationMatrix(En),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=Zn){const l=this.elements,c=2*r/(t-e),d=2*r/(n-s),u=(t+e)/(t-e),h=(n+s)/(n-s);let f,g;if(a===Zn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===so)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=d,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=Zn){const l=this.elements,c=1/(t-e),d=1/(n-s),u=1/(o-r),h=(t+e)*c,f=(n+s)*d;let g,x;if(a===Zn)g=(o+r)*u,x=-2*u;else if(a===so)g=r*u,x=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-h,l[1]=0,l[5]=2*d,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=x,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const bs=new R,En=new Ie,cm=new R(0,0,0),dm=new R(1,1,1),yi=new R,ho=new R,en=new R,Rd=new Ie,Cd=new Qn;class An{constructor(e=0,t=0,n=0,s=An.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],d=s[9],u=s[2],h=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ut(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ut(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ut(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Ut(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-d,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Rd.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Rd,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Cd.setFromEuler(this),this.setFromQuaternion(Cd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}An.DEFAULT_ORDER="XYZ";class vl{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let um=0;const Pd=new R,Ms=new Qn,ni=new Ie,fo=new R,hr=new R,hm=new R,fm=new Qn,Id=new R(1,0,0),Ld=new R(0,1,0),Dd=new R(0,0,1),Ud={type:"added"},pm={type:"removed"},Ss={type:"childadded",child:null},_l={type:"childremoved",child:null};class at extends ps{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:um++}),this.uuid=Mn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=at.DEFAULT_UP.clone();const e=new R,t=new An,n=new Qn,s=new R(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ie},normalMatrix:{value:new Ue}}),this.matrix=new Ie,this.matrixWorld=new Ie,this.matrixAutoUpdate=at.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=at.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new vl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ms.setFromAxisAngle(e,t),this.quaternion.multiply(Ms),this}rotateOnWorldAxis(e,t){return Ms.setFromAxisAngle(e,t),this.quaternion.premultiply(Ms),this}rotateX(e){return this.rotateOnAxis(Id,e)}rotateY(e){return this.rotateOnAxis(Ld,e)}rotateZ(e){return this.rotateOnAxis(Dd,e)}translateOnAxis(e,t){return Pd.copy(e).applyQuaternion(this.quaternion),this.position.add(Pd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Id,e)}translateY(e){return this.translateOnAxis(Ld,e)}translateZ(e){return this.translateOnAxis(Dd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ni.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?fo.copy(e):fo.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),hr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ni.lookAt(hr,fo,this.up):ni.lookAt(fo,hr,this.up),this.quaternion.setFromRotationMatrix(ni),s&&(ni.extractRotation(s.matrixWorld),Ms.setFromRotationMatrix(ni),this.quaternion.premultiply(Ms.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ud),Ss.child=e,this.dispatchEvent(Ss),Ss.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(pm),_l.child=e,this.dispatchEvent(_l),_l.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ni.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ni.multiply(e.parent.matrixWorld)),e.applyMatrix4(ni),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ud),Ss.child=e,this.dispatchEvent(Ss),Ss.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hr,e,hm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hr,fm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),d=o(e.images),u=o(e.shapes),h=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),u.length>0&&(n.shapes=u),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const d=a[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}at.DEFAULT_UP=new R(0,1,0),at.DEFAULT_MATRIX_AUTO_UPDATE=!0,at.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Rn=new R,ii=new R,yl=new R,si=new R,ws=new R,Ts=new R,Nd=new R,bl=new R,Ml=new R,Sl=new R,wl=new Je,Tl=new Je,El=new Je;class Cn{constructor(e=new R,t=new R,n=new R){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Rn.subVectors(e,t),s.cross(Rn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Rn.subVectors(s,t),ii.subVectors(n,t),yl.subVectors(e,t);const o=Rn.dot(Rn),a=Rn.dot(ii),l=Rn.dot(yl),c=ii.dot(ii),d=ii.dot(yl),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const h=1/u,f=(c*l-a*d)*h,g=(o*d-a*l)*h;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,si)===null?!1:si.x>=0&&si.y>=0&&si.x+si.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,si)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,si.x),l.addScaledVector(o,si.y),l.addScaledVector(a,si.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return wl.setScalar(0),Tl.setScalar(0),El.setScalar(0),wl.fromBufferAttribute(e,t),Tl.fromBufferAttribute(e,n),El.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(wl,r.x),o.addScaledVector(Tl,r.y),o.addScaledVector(El,r.z),o}static isFrontFacing(e,t,n,s){return Rn.subVectors(n,t),ii.subVectors(e,t),Rn.cross(ii).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Rn.subVectors(this.c,this.b),ii.subVectors(this.a,this.b),Rn.cross(ii).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Cn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Cn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Cn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Cn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Cn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;ws.subVectors(s,n),Ts.subVectors(r,n),bl.subVectors(e,n);const l=ws.dot(bl),c=Ts.dot(bl);if(l<=0&&c<=0)return t.copy(n);Ml.subVectors(e,s);const d=ws.dot(Ml),u=Ts.dot(Ml);if(d>=0&&u<=d)return t.copy(s);const h=l*u-d*c;if(h<=0&&l>=0&&d<=0)return o=l/(l-d),t.copy(n).addScaledVector(ws,o);Sl.subVectors(e,r);const f=ws.dot(Sl),g=Ts.dot(Sl);if(g>=0&&f<=g)return t.copy(r);const x=f*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Ts,a);const m=d*g-f*u;if(m<=0&&u-d>=0&&f-g>=0)return Nd.subVectors(r,s),a=(u-d)/(u-d+(f-g)),t.copy(s).addScaledVector(Nd,a);const p=1/(m+x+h);return o=x*p,a=h*p,t.copy(n).addScaledVector(ws,o).addScaledVector(Ts,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Fd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bi={h:0,s:0,l:0},po={h:0,s:0,l:0};function Al(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class se{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=It){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Xe.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Xe.workingColorSpace){return this.r=e,this.g=t,this.b=n,Xe.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Xe.workingColorSpace){if(e=cl(e,1),t=Ut(t,0,1),n=Ut(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Al(o,r,e+1/3),this.g=Al(o,r,e),this.b=Al(o,r,e-1/3)}return Xe.toWorkingColorSpace(this,s),this}setStyle(e,t=It){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=It){const n=Fd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Jn(e.r),this.g=Jn(e.g),this.b=Jn(e.b),this}copyLinearToSRGB(e){return this.r=gs(e.r),this.g=gs(e.g),this.b=gs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=It){return Xe.fromWorkingColorSpace(Nt.copy(this),e),Math.round(Ut(Nt.r*255,0,255))*65536+Math.round(Ut(Nt.g*255,0,255))*256+Math.round(Ut(Nt.b*255,0,255))}getHexString(e=It){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Xe.workingColorSpace){Xe.fromWorkingColorSpace(Nt.copy(this),t);const n=Nt.r,s=Nt.g,r=Nt.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const d=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=d<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=Xe.workingColorSpace){return Xe.fromWorkingColorSpace(Nt.copy(this),t),e.r=Nt.r,e.g=Nt.g,e.b=Nt.b,e}getStyle(e=It){Xe.fromWorkingColorSpace(Nt.copy(this),e);const t=Nt.r,n=Nt.g,s=Nt.b;return e!==It?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(bi),this.setHSL(bi.h+e,bi.s+t,bi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(bi),e.getHSL(po);const n=or(bi.h,po.h,t),s=or(bi.s,po.s,t),r=or(bi.l,po.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Nt=new se;se.NAMES=Fd;let mm=0;class Pn extends ps{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:mm++}),this.uuid=Mn(),this.name="",this.blending=rs,this.side=Yn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=pa,this.blendDst=ma,this.blendEquation=Ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new se(0,0,0),this.blendAlpha=0,this.depthFunc=os,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=pd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fs,this.stencilZFail=fs,this.stencilZPass=fs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==rs&&(n.blending=this.blending),this.side!==Yn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==pa&&(n.blendSrc=this.blendSrc),this.blendDst!==ma&&(n.blendDst=this.blendDst),this.blendEquation!==Ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==os&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==pd&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fs&&(n.stencilFail=this.stencilFail),this.stencilZFail!==fs&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==fs&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class He extends Pn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new An,this.combine=Sa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Mt=new R,mo=new we;class vt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ll,this.updateRanges=[],this.gpuType=bn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)mo.fromBufferAttribute(this,t),mo.applyMatrix3(e),this.setXY(t,mo.x,mo.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix3(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyMatrix4(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.applyNormalMatrix(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Mt.fromBufferAttribute(this,t),Mt.transformDirection(e),this.setXYZ(t,Mt.x,Mt.y,Mt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=it(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Sn(t,this.array)),t}setX(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Sn(t,this.array)),t}setY(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Sn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Sn(t,this.array)),t}setW(e,t){return this.normalized&&(t=it(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array),r=it(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ll&&(e.usage=this.usage),e}}class Od extends vt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class kd extends vt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class gt extends vt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let gm=0;const pn=new Ie,Rl=new at,Es=new R,tn=new Gt,fr=new Gt,At=new R;class Lt extends ps{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:gm++}),this.uuid=Mn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(vd(e)?kd:Od)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ue().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return pn.makeRotationFromQuaternion(e),this.applyMatrix4(pn),this}rotateX(e){return pn.makeRotationX(e),this.applyMatrix4(pn),this}rotateY(e){return pn.makeRotationY(e),this.applyMatrix4(pn),this}rotateZ(e){return pn.makeRotationZ(e),this.applyMatrix4(pn),this}translate(e,t,n){return pn.makeTranslation(e,t,n),this.applyMatrix4(pn),this}scale(e,t,n){return pn.makeScale(e,t,n),this.applyMatrix4(pn),this}lookAt(e){return Rl.lookAt(e),Rl.updateMatrix(),this.applyMatrix4(Rl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Es).negate(),this.translate(Es.x,Es.y,Es.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new gt(n,3))}else{for(let n=0,s=t.count;n<s;n++){const r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Gt);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];tn.setFromBufferAttribute(r),this.morphTargetsRelative?(At.addVectors(this.boundingBox.min,tn.min),this.boundingBox.expandByPoint(At),At.addVectors(this.boundingBox.max,tn.max),this.boundingBox.expandByPoint(At)):(this.boundingBox.expandByPoint(tn.min),this.boundingBox.expandByPoint(tn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Un);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new R,1/0);return}if(e){const n=this.boundingSphere.center;if(tn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];fr.setFromBufferAttribute(a),this.morphTargetsRelative?(At.addVectors(tn.min,fr.min),tn.expandByPoint(At),At.addVectors(tn.max,fr.max),tn.expandByPoint(At)):(tn.expandByPoint(fr.min),tn.expandByPoint(fr.max))}tn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)At.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(At));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,d=a.count;c<d;c++)At.fromBufferAttribute(a,c),l&&(Es.fromBufferAttribute(e,c),At.add(Es)),s=Math.max(s,n.distanceToSquared(At))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new vt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let L=0;L<n.count;L++)a[L]=new R,l[L]=new R;const c=new R,d=new R,u=new R,h=new we,f=new we,g=new we,x=new R,m=new R;function p(L,w,M){c.fromBufferAttribute(n,L),d.fromBufferAttribute(n,w),u.fromBufferAttribute(n,M),h.fromBufferAttribute(r,L),f.fromBufferAttribute(r,w),g.fromBufferAttribute(r,M),d.sub(c),u.sub(c),f.sub(h),g.sub(h);const P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(x.copy(d).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(P),m.copy(u).multiplyScalar(f.x).addScaledVector(d,-g.x).multiplyScalar(P),a[L].add(x),a[w].add(x),a[M].add(x),l[L].add(m),l[w].add(m),l[M].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let L=0,w=S.length;L<w;++L){const M=S[L],P=M.start,H=M.count;for(let z=P,W=P+H;z<W;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}const b=new R,v=new R,I=new R,E=new R;function A(L){I.fromBufferAttribute(s,L),E.copy(I);const w=a[L];b.copy(w),b.sub(I.multiplyScalar(I.dot(w))).normalize(),v.crossVectors(E,w);const P=v.dot(l[L])<0?-1:1;o.setXYZW(L,b.x,b.y,b.z,P)}for(let L=0,w=S.length;L<w;++L){const M=S[L],P=M.start,H=M.count;for(let z=P,W=P+H;z<W;z+=3)A(e.getX(z+0)),A(e.getX(z+1)),A(e.getX(z+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new vt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);const s=new R,r=new R,o=new R,a=new R,l=new R,c=new R,d=new R,u=new R;if(e)for(let h=0,f=e.count;h<f;h+=3){const g=e.getX(h+0),x=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),d.subVectors(o,r),u.subVectors(s,r),d.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),a.add(d),l.add(d),c.add(d),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=t.count;h<f;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),d.subVectors(o,r),u.subVectors(s,r),d.cross(u),n.setXYZ(h+0,d.x,d.y,d.z),n.setXYZ(h+1,d.x,d.y,d.z),n.setXYZ(h+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)At.fromBufferAttribute(e,t),At.normalize(),e.setXYZ(t,At.x,At.y,At.z)}toNonIndexed(){function e(a,l){const c=a.array,d=a.itemSize,u=a.normalized,h=new c.constructor(l.length*d);let f=0,g=0;for(let x=0,m=l.length;x<m;x++){a.isInterleavedBufferAttribute?f=l[x]*a.data.stride+a.offset:f=l[x]*d;for(let p=0;p<d;p++)h[g++]=c[f++]}return new vt(h,d,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Lt,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let d=0,u=c.length;d<u;d++){const h=c[d],f=e(h,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],d=[];for(let u=0,h=c.length;u<h;u++){const f=c[u];d.push(f.toJSON(e.data))}d.length>0&&(s[l]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const c in s){const d=s[c];this.setAttribute(c,d.clone(t))}const r=e.morphAttributes;for(const c in r){const d=[],u=r[c];for(let h=0,f=u.length;h<f;h++)d.push(u[h].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,d=o.length;c<d;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Bd=new Ie,Bi=new ur,go=new Un,zd=new R,xo=new R,vo=new R,_o=new R,Cl=new R,yo=new R,Hd=new R,bo=new R;class Ce extends at{constructor(e=new Lt,t=new He){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){yo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const d=a[l],u=r[l];d!==0&&(Cl.fromBufferAttribute(u,e),o?yo.addScaledVector(Cl,d):yo.addScaledVector(Cl.sub(t),d))}t.add(yo)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),go.copy(n.boundingSphere),go.applyMatrix4(r),Bi.copy(e.ray).recast(e.near),!(go.containsPoint(Bi.origin)===!1&&(Bi.intersectSphere(go,zd)===null||Bi.origin.distanceToSquared(zd)>(e.far-e.near)**2))&&(Bd.copy(r).invert(),Bi.copy(e.ray).applyMatrix4(Bd),!(n.boundingBox!==null&&Bi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Bi)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,d=r.attributes.uv1,u=r.attributes.normal,h=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=h.length;g<x;g++){const m=h[g],p=o[m.materialIndex],S=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=S,I=b;v<I;v+=3){const E=a.getX(v),A=a.getX(v+1),L=a.getX(v+2);s=Mo(this,p,e,n,c,d,u,E,A,L),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){const S=a.getX(m),b=a.getX(m+1),v=a.getX(m+2);s=Mo(this,o,e,n,c,d,u,S,b,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=h.length;g<x;g++){const m=h[g],p=o[m.materialIndex],S=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=S,I=b;v<I;v+=3){const E=v,A=v+1,L=v+2;s=Mo(this,p,e,n,c,d,u,E,A,L),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){const S=m,b=m+1,v=m+2;s=Mo(this,o,e,n,c,d,u,S,b,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function xm(i,e,t,n,s,r,o,a){let l;if(e.side===Bt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Yn,a),l===null)return null;bo.copy(a),bo.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(bo);return c<t.near||c>t.far?null:{distance:c,point:bo.clone(),object:i}}function Mo(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,xo),i.getVertexPosition(l,vo),i.getVertexPosition(c,_o);const d=xm(i,e,t,n,xo,vo,_o,Hd);if(d){const u=new R;Cn.getBarycoord(Hd,xo,vo,_o,u),s&&(d.uv=Cn.getInterpolatedAttribute(s,a,l,c,u,new we)),r&&(d.uv1=Cn.getInterpolatedAttribute(r,a,l,c,u,new we)),o&&(d.normal=Cn.getInterpolatedAttribute(o,a,l,c,u,new R),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));const h={a,b:l,c,normal:new R,materialIndex:0};Cn.getNormal(xo,vo,_o,h.normal),d.face=h,d.barycoord=u}return d}class ri extends Lt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],d=[],u=[];let h=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new gt(c,3)),this.setAttribute("normal",new gt(d,3)),this.setAttribute("uv",new gt(u,2));function g(x,m,p,S,b,v,I,E,A,L,w){const M=v/A,P=I/L,H=v/2,z=I/2,W=E/2,K=A+1,X=L+1;let ne=0,V=0;const ae=new R;for(let fe=0;fe<X;fe++){const Se=fe*P-z;for(let Ve=0;Ve<K;Ve++){const dt=Ve*M-H;ae[x]=dt*S,ae[m]=Se*b,ae[p]=W,c.push(ae.x,ae.y,ae.z),ae[x]=0,ae[m]=0,ae[p]=E>0?1:-1,d.push(ae.x,ae.y,ae.z),u.push(Ve/A),u.push(1-fe/L),ne+=1}}for(let fe=0;fe<L;fe++)for(let Se=0;Se<A;Se++){const Ve=h+Se+K*fe,dt=h+Se+K*(fe+1),q=h+(Se+1)+K*(fe+1),ie=h+(Se+1)+K*fe;l.push(Ve,dt,ie),l.push(dt,q,ie),V+=6}a.addGroup(f,V,w),f+=V,h+=ne}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ri(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function As(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Vt(i){const e={};for(let t=0;t<i.length;t++){const n=As(i[t]);for(const s in n)e[s]=n[s]}return e}function vm(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Gd(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Xe.workingColorSpace}const So={clone:As,merge:Vt};var _m=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ym=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Rt extends Pn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_m,this.fragmentShader=ym,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=As(e.uniforms),this.uniformsGroups=vm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Vd extends at{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ie,this.projectionMatrix=new Ie,this.projectionMatrixInverse=new Ie,this.coordinateSystem=Zn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Mi=new R,Wd=new we,Xd=new we;class qt extends Vd{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=ms*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(rr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ms*2*Math.atan(Math.tan(rr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z),Mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z)}getViewSize(e,t){return this.getViewBounds(e,Wd,Xd),t.subVectors(Xd,Wd)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(rr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Rs=-90,Cs=1;class bm extends at{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new qt(Rs,Cs,e,t);s.layers=this.layers,this.add(s);const r=new qt(Rs,Cs,e,t);r.layers=this.layers,this.add(r);const o=new qt(Rs,Cs,e,t);o.layers=this.layers,this.add(o);const a=new qt(Rs,Cs,e,t);a.layers=this.layers,this.add(a);const l=new qt(Rs,Cs,e,t);l.layers=this.layers,this.add(l);const c=new qt(Rs,Cs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===Zn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===so)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,d]=this.children,u=e.getRenderTarget(),h=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,s),e.render(t,d),e.setRenderTarget(u,h,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Yd extends Et{constructor(e,t,n,s,r,o,a,l,c,d){e=e!==void 0?e:[],t=t!==void 0?t:as,super(e,t,n,s,r,o,a,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Mm extends wn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Yd(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:Qt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ri(5,5,5),r=new Rt({name:"CubemapFromEquirect",uniforms:As(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Bt,blending:qn});r.uniforms.tEquirect.value=t;const o=new Ce(s,r),a=t.minFilter;return t.minFilter===jn&&(t.minFilter=Qt),new bm(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}const Pl=new R,Sm=new R,wm=new Ue;class Si{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Pl.subVectors(n,t).cross(Sm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Pl),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||wm.getNormalMatrix(e),s=this.coplanarPoint(Pl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const zi=new Un,wo=new R;class Il{constructor(e=new Si,t=new Si,n=new Si,s=new Si,r=new Si,o=new Si){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Zn){const n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],d=s[5],u=s[6],h=s[7],f=s[8],g=s[9],x=s[10],m=s[11],p=s[12],S=s[13],b=s[14],v=s[15];if(n[0].setComponents(l-r,h-c,m-f,v-p).normalize(),n[1].setComponents(l+r,h+c,m+f,v+p).normalize(),n[2].setComponents(l+o,h+d,m+g,v+S).normalize(),n[3].setComponents(l-o,h-d,m-g,v-S).normalize(),n[4].setComponents(l-a,h-u,m-x,v-b).normalize(),t===Zn)n[5].setComponents(l+a,h+u,m+x,v+b).normalize();else if(t===so)n[5].setComponents(a,u,x,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),zi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),zi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(zi)}intersectsSprite(e){return zi.center.set(0,0,0),zi.radius=.7071067811865476,zi.applyMatrix4(e.matrixWorld),this.intersectsSphere(zi)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(wo.x=s.normal.x>0?e.max.x:e.min.x,wo.y=s.normal.y>0?e.max.y:e.min.y,wo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(wo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function qd(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Tm(i){const e=new WeakMap;function t(a,l){const c=a.array,d=a.usage,u=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,d),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const d=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,d);else{u.sort((f,g)=>f.start-g.start);let h=0;for(let f=1;f<u.length;f++){const g=u[h],x=u[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++h,u[h]=x)}u.length=h+1;for(let f=0,g=u.length;f<g;f++){const x=u[f];i.bufferSubData(c,x.start*d.BYTES_PER_ELEMENT,d,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const d=e.get(a);(!d||d.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class nn extends Lt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,d=l+1,u=e/a,h=t/l,f=[],g=[],x=[],m=[];for(let p=0;p<d;p++){const S=p*h-o;for(let b=0;b<c;b++){const v=b*u-r;g.push(v,-S,0),x.push(0,0,1),m.push(b/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<a;S++){const b=S+c*p,v=S+c*(p+1),I=S+1+c*(p+1),E=S+1+c*p;f.push(b,v,E),f.push(v,I,E)}this.setIndex(f),this.setAttribute("position",new gt(g,3)),this.setAttribute("normal",new gt(x,3)),this.setAttribute("uv",new gt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new nn(e.width,e.height,e.widthSegments,e.heightSegments)}}var Em=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Am=`#ifdef USE_ALPHAHASH
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
#endif`,Rm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Cm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Pm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Im=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Lm=`#ifdef USE_AOMAP
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
#endif`,Dm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Um=`#ifdef USE_BATCHING
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
#endif`,Nm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Fm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Om=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,km=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Bm=`#ifdef USE_IRIDESCENCE
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
#endif`,zm=`#ifdef USE_BUMPMAP
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
#endif`,Hm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Gm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Wm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Xm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Ym=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,qm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,jm=`#if defined( USE_COLOR_ALPHA )
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
#endif`,$m=`#define PI 3.141592653589793
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
} // validated`,Km=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Zm=`vec3 transformedNormal = objectNormal;
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
#endif`,Jm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Qm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,eg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,tg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ng="gl_FragColor = linearToOutputTexel( gl_FragColor );",ig=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,sg=`#ifdef USE_ENVMAP
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
#endif`,rg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,og=`#ifdef USE_ENVMAP
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
#endif`,ag=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lg=`#ifdef USE_ENVMAP
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
#endif`,cg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,dg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ug=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,hg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,fg=`#ifdef USE_GRADIENTMAP
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
}`,pg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,xg=`uniform bool receiveShadow;
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
#endif`,vg=`#ifdef USE_ENVMAP
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
#endif`,_g=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,yg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Mg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Sg=`PhysicalMaterial material;
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
#endif`,wg=`struct PhysicalMaterial {
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
}`,Tg=`
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
#endif`,Eg=`#if defined( RE_IndirectDiffuse )
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
#endif`,Ag=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Rg=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Cg=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pg=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ig=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Lg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Dg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ug=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Ng=`#if defined( USE_POINTS_UV )
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
#endif`,Fg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Og=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,kg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Bg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,zg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hg=`#ifdef USE_MORPHTARGETS
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
#endif`,Gg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Vg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Wg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Xg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,jg=`#ifdef USE_NORMALMAP
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
#endif`,$g=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Kg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Zg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Jg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Qg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,e0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,t0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,n0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,i0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,s0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,r0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,o0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,a0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,l0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,c0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,d0=`float getShadowMask() {
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
}`,u0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,h0=`#ifdef USE_SKINNING
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
#endif`,f0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,p0=`#ifdef USE_SKINNING
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
#endif`,m0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,g0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,x0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,v0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,_0=`#ifdef USE_TRANSMISSION
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
#endif`,y0=`#ifdef USE_TRANSMISSION
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
#endif`,b0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,M0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,S0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,w0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Oe={alphahash_fragment:Em,alphahash_pars_fragment:Am,alphamap_fragment:Rm,alphamap_pars_fragment:Cm,alphatest_fragment:Pm,alphatest_pars_fragment:Im,aomap_fragment:Lm,aomap_pars_fragment:Dm,batching_pars_vertex:Um,batching_vertex:Nm,begin_vertex:Fm,beginnormal_vertex:Om,bsdfs:km,iridescence_fragment:Bm,bumpmap_pars_fragment:zm,clipping_planes_fragment:Hm,clipping_planes_pars_fragment:Gm,clipping_planes_pars_vertex:Vm,clipping_planes_vertex:Wm,color_fragment:Xm,color_pars_fragment:Ym,color_pars_vertex:qm,color_vertex:jm,common:$m,cube_uv_reflection_fragment:Km,defaultnormal_vertex:Zm,displacementmap_pars_vertex:Jm,displacementmap_vertex:Qm,emissivemap_fragment:eg,emissivemap_pars_fragment:tg,colorspace_fragment:ng,colorspace_pars_fragment:ig,envmap_fragment:sg,envmap_common_pars_fragment:rg,envmap_pars_fragment:og,envmap_pars_vertex:ag,envmap_physical_pars_fragment:vg,envmap_vertex:lg,fog_vertex:cg,fog_pars_vertex:dg,fog_fragment:ug,fog_pars_fragment:hg,gradientmap_pars_fragment:fg,lightmap_pars_fragment:pg,lights_lambert_fragment:mg,lights_lambert_pars_fragment:gg,lights_pars_begin:xg,lights_toon_fragment:_g,lights_toon_pars_fragment:yg,lights_phong_fragment:bg,lights_phong_pars_fragment:Mg,lights_physical_fragment:Sg,lights_physical_pars_fragment:wg,lights_fragment_begin:Tg,lights_fragment_maps:Eg,lights_fragment_end:Ag,logdepthbuf_fragment:Rg,logdepthbuf_pars_fragment:Cg,logdepthbuf_pars_vertex:Pg,logdepthbuf_vertex:Ig,map_fragment:Lg,map_pars_fragment:Dg,map_particle_fragment:Ug,map_particle_pars_fragment:Ng,metalnessmap_fragment:Fg,metalnessmap_pars_fragment:Og,morphinstance_vertex:kg,morphcolor_vertex:Bg,morphnormal_vertex:zg,morphtarget_pars_vertex:Hg,morphtarget_vertex:Gg,normal_fragment_begin:Vg,normal_fragment_maps:Wg,normal_pars_fragment:Xg,normal_pars_vertex:Yg,normal_vertex:qg,normalmap_pars_fragment:jg,clearcoat_normal_fragment_begin:$g,clearcoat_normal_fragment_maps:Kg,clearcoat_pars_fragment:Zg,iridescence_pars_fragment:Jg,opaque_fragment:Qg,packing:e0,premultiplied_alpha_fragment:t0,project_vertex:n0,dithering_fragment:i0,dithering_pars_fragment:s0,roughnessmap_fragment:r0,roughnessmap_pars_fragment:o0,shadowmap_pars_fragment:a0,shadowmap_pars_vertex:l0,shadowmap_vertex:c0,shadowmask_pars_fragment:d0,skinbase_vertex:u0,skinning_pars_vertex:h0,skinning_vertex:f0,skinnormal_vertex:p0,specularmap_fragment:m0,specularmap_pars_fragment:g0,tonemapping_fragment:x0,tonemapping_pars_fragment:v0,transmission_fragment:_0,transmission_pars_fragment:y0,uv_pars_fragment:b0,uv_pars_vertex:M0,uv_vertex:S0,worldpos_vertex:w0,background_vert:`varying vec2 vUv;
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
}`},re={common:{diffuse:{value:new se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ue}},envmap:{envMap:{value:null},envMapRotation:{value:new Ue},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ue}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ue}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ue},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ue},normalScale:{value:new we(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ue},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ue}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ue}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ue}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0},uvTransform:{value:new Ue}},sprite:{diffuse:{value:new se(16777215)},opacity:{value:1},center:{value:new we(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ue},alphaMap:{value:null},alphaMapTransform:{value:new Ue},alphaTest:{value:0}}},Nn={basic:{uniforms:Vt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:Oe.meshbasic_vert,fragmentShader:Oe.meshbasic_frag},lambert:{uniforms:Vt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new se(0)}}]),vertexShader:Oe.meshlambert_vert,fragmentShader:Oe.meshlambert_frag},phong:{uniforms:Vt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new se(0)},specular:{value:new se(1118481)},shininess:{value:30}}]),vertexShader:Oe.meshphong_vert,fragmentShader:Oe.meshphong_frag},standard:{uniforms:Vt([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag},toon:{uniforms:Vt([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new se(0)}}]),vertexShader:Oe.meshtoon_vert,fragmentShader:Oe.meshtoon_frag},matcap:{uniforms:Vt([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:Oe.meshmatcap_vert,fragmentShader:Oe.meshmatcap_frag},points:{uniforms:Vt([re.points,re.fog]),vertexShader:Oe.points_vert,fragmentShader:Oe.points_frag},dashed:{uniforms:Vt([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Oe.linedashed_vert,fragmentShader:Oe.linedashed_frag},depth:{uniforms:Vt([re.common,re.displacementmap]),vertexShader:Oe.depth_vert,fragmentShader:Oe.depth_frag},normal:{uniforms:Vt([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:Oe.meshnormal_vert,fragmentShader:Oe.meshnormal_frag},sprite:{uniforms:Vt([re.sprite,re.fog]),vertexShader:Oe.sprite_vert,fragmentShader:Oe.sprite_frag},background:{uniforms:{uvTransform:{value:new Ue},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Oe.background_vert,fragmentShader:Oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ue}},vertexShader:Oe.backgroundCube_vert,fragmentShader:Oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Oe.cube_vert,fragmentShader:Oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Oe.equirect_vert,fragmentShader:Oe.equirect_frag},distanceRGBA:{uniforms:Vt([re.common,re.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Oe.distanceRGBA_vert,fragmentShader:Oe.distanceRGBA_frag},shadow:{uniforms:Vt([re.lights,re.fog,{color:{value:new se(0)},opacity:{value:1}}]),vertexShader:Oe.shadow_vert,fragmentShader:Oe.shadow_frag}};Nn.physical={uniforms:Vt([Nn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ue},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ue},clearcoatNormalScale:{value:new we(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ue},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ue},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ue},sheen:{value:0},sheenColor:{value:new se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ue},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ue},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ue},transmissionSamplerSize:{value:new we},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ue},attenuationDistance:{value:0},attenuationColor:{value:new se(0)},specularColor:{value:new se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ue},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ue},anisotropyVector:{value:new we},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ue}}]),vertexShader:Oe.meshphysical_vert,fragmentShader:Oe.meshphysical_frag};const To={r:0,b:0,g:0},Hi=new An,T0=new Ie;function E0(i,e,t,n,s,r,o){const a=new se(0);let l=r===!0?0:1,c,d,u=null,h=0,f=null;function g(S){let b=S.isScene===!0?S.background:null;return b&&b.isTexture&&(b=(S.backgroundBlurriness>0?t:e).get(b)),b}function x(S){let b=!1;const v=g(S);v===null?p(a,l):v&&v.isColor&&(p(v,1),b=!0);const I=i.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,o):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||b)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(S,b){const v=g(b);v&&(v.isCubeTexture||v.mapping===$r)?(d===void 0&&(d=new Ce(new ri(1,1,1),new Rt({name:"BackgroundCubeMaterial",uniforms:As(Nn.backgroundCube.uniforms),vertexShader:Nn.backgroundCube.vertexShader,fragmentShader:Nn.backgroundCube.fragmentShader,side:Bt,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(I,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(d)),Hi.copy(b.backgroundRotation),Hi.x*=-1,Hi.y*=-1,Hi.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Hi.y*=-1,Hi.z*=-1),d.material.uniforms.envMap.value=v,d.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(T0.makeRotationFromEuler(Hi)),d.material.toneMapped=Xe.getTransfer(v.colorSpace)!==ot,(u!==v||h!==v.version||f!==i.toneMapping)&&(d.material.needsUpdate=!0,u=v,h=v.version,f=i.toneMapping),d.layers.enableAll(),S.unshift(d,d.geometry,d.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new Ce(new nn(2,2),new Rt({name:"BackgroundMaterial",uniforms:As(Nn.background.uniforms),vertexShader:Nn.background.vertexShader,fragmentShader:Nn.background.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=Xe.getTransfer(v.colorSpace)!==ot,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(u!==v||h!==v.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,u=v,h=v.version,f=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null))}function p(S,b){S.getRGB(To,Gd(i)),n.buffers.color.setClear(To.r,To.g,To.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(S,b=1){a.set(S),l=b,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,p(a,l)},render:x,addToRenderList:m}}function A0(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null);let r=s,o=!1;function a(M,P,H,z,W){let K=!1;const X=u(z,H,P);r!==X&&(r=X,c(r.object)),K=f(M,z,H,W),K&&g(M,z,H,W),W!==null&&e.update(W,i.ELEMENT_ARRAY_BUFFER),(K||o)&&(o=!1,v(M,P,H,z),W!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return i.createVertexArray()}function c(M){return i.bindVertexArray(M)}function d(M){return i.deleteVertexArray(M)}function u(M,P,H){const z=H.wireframe===!0;let W=n[M.id];W===void 0&&(W={},n[M.id]=W);let K=W[P.id];K===void 0&&(K={},W[P.id]=K);let X=K[z];return X===void 0&&(X=h(l()),K[z]=X),X}function h(M){const P=[],H=[],z=[];for(let W=0;W<t;W++)P[W]=0,H[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:H,attributeDivisors:z,object:M,attributes:{},index:null}}function f(M,P,H,z){const W=r.attributes,K=P.attributes;let X=0;const ne=H.getAttributes();for(const V in ne)if(ne[V].location>=0){const fe=W[V];let Se=K[V];if(Se===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(Se=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(Se=M.instanceColor)),fe===void 0||fe.attribute!==Se||Se&&fe.data!==Se.data)return!0;X++}return r.attributesNum!==X||r.index!==z}function g(M,P,H,z){const W={},K=P.attributes;let X=0;const ne=H.getAttributes();for(const V in ne)if(ne[V].location>=0){let fe=K[V];fe===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(fe=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(fe=M.instanceColor));const Se={};Se.attribute=fe,fe&&fe.data&&(Se.data=fe.data),W[V]=Se,X++}r.attributes=W,r.attributesNum=X,r.index=z}function x(){const M=r.newAttributes;for(let P=0,H=M.length;P<H;P++)M[P]=0}function m(M){p(M,0)}function p(M,P){const H=r.newAttributes,z=r.enabledAttributes,W=r.attributeDivisors;H[M]=1,z[M]===0&&(i.enableVertexAttribArray(M),z[M]=1),W[M]!==P&&(i.vertexAttribDivisor(M,P),W[M]=P)}function S(){const M=r.newAttributes,P=r.enabledAttributes;for(let H=0,z=P.length;H<z;H++)P[H]!==M[H]&&(i.disableVertexAttribArray(H),P[H]=0)}function b(M,P,H,z,W,K,X){X===!0?i.vertexAttribIPointer(M,P,H,W,K):i.vertexAttribPointer(M,P,H,z,W,K)}function v(M,P,H,z){x();const W=z.attributes,K=H.getAttributes(),X=P.defaultAttributeValues;for(const ne in K){const V=K[ne];if(V.location>=0){let ae=W[ne];if(ae===void 0&&(ne==="instanceMatrix"&&M.instanceMatrix&&(ae=M.instanceMatrix),ne==="instanceColor"&&M.instanceColor&&(ae=M.instanceColor)),ae!==void 0){const fe=ae.normalized,Se=ae.itemSize,Ve=e.get(ae);if(Ve===void 0)continue;const dt=Ve.buffer,q=Ve.type,ie=Ve.bytesPerElement,ye=q===i.INT||q===i.UNSIGNED_INT||ae.gpuType===Ea;if(ae.isInterleavedBufferAttribute){const le=ae.data,Re=le.stride,De=ae.offset;if(le.isInstancedInterleavedBuffer){for(let We=0;We<V.locationSize;We++)p(V.location+We,le.meshPerAttribute);M.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=le.meshPerAttribute*le.count)}else for(let We=0;We<V.locationSize;We++)m(V.location+We);i.bindBuffer(i.ARRAY_BUFFER,dt);for(let We=0;We<V.locationSize;We++)b(V.location+We,Se/V.locationSize,q,fe,Re*ie,(De+Se/V.locationSize*We)*ie,ye)}else{if(ae.isInstancedBufferAttribute){for(let le=0;le<V.locationSize;le++)p(V.location+le,ae.meshPerAttribute);M.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let le=0;le<V.locationSize;le++)m(V.location+le);i.bindBuffer(i.ARRAY_BUFFER,dt);for(let le=0;le<V.locationSize;le++)b(V.location+le,Se/V.locationSize,q,fe,Se*ie,Se/V.locationSize*le*ie,ye)}}else if(X!==void 0){const fe=X[ne];if(fe!==void 0)switch(fe.length){case 2:i.vertexAttrib2fv(V.location,fe);break;case 3:i.vertexAttrib3fv(V.location,fe);break;case 4:i.vertexAttrib4fv(V.location,fe);break;default:i.vertexAttrib1fv(V.location,fe)}}}}S()}function I(){L();for(const M in n){const P=n[M];for(const H in P){const z=P[H];for(const W in z)d(z[W].object),delete z[W];delete P[H]}delete n[M]}}function E(M){if(n[M.id]===void 0)return;const P=n[M.id];for(const H in P){const z=P[H];for(const W in z)d(z[W].object),delete z[W];delete P[H]}delete n[M.id]}function A(M){for(const P in n){const H=n[P];if(H[M.id]===void 0)continue;const z=H[M.id];for(const W in z)d(z[W].object),delete z[W];delete H[M.id]}}function L(){w(),o=!0,r!==s&&(r=s,c(r.object))}function w(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:L,resetDefaultState:w,dispose:I,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:x,enableAttribute:m,disableUnusedAttributes:S}}function R0(i,e,t){let n;function s(c){n=c}function r(c,d){i.drawArrays(n,c,d),t.update(d,n,1)}function o(c,d,u){u!==0&&(i.drawArraysInstanced(n,c,d,u),t.update(d,n,u))}function a(c,d,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,d,0,u);let f=0;for(let g=0;g<u;g++)f+=d[g];t.update(f,n,1)}function l(c,d,u,h){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],d[g],h[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,d,0,h,0,u);let g=0;for(let x=0;x<u;x++)g+=d[x]*h[x];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function C0(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==fn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const L=A===Kn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==$n&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==bn&&!L)}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const d=l(c);d!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);const u=t.logarithmicDepthBuffer===!0,h=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),b=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),I=g>0,E=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:h,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:S,maxVaryings:b,maxFragmentUniforms:v,vertexTextures:I,maxSamples:E}}function P0(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new Si,a=new Ue,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,h){const f=u.length!==0||h||n!==0||s;return s=h,n=u.length,f},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,h){t=d(u,h,0)},this.setState=function(u,h,f){const g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?d(null):c();else{const S=r?0:n,b=S*4;let v=p.clippingState||null;l.value=v,v=d(g,h,b,f);for(let I=0;I!==b;++I)v[I]=t[I];p.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(u,h,f,g){const x=u!==null?u.length:0;let m=null;if(x!==0){if(m=l.value,g!==!0||m===null){const p=f+x*4,S=h.matrixWorldInverse;a.getNormalMatrix(S),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,v=f;b!==x;++b,v+=4)o.copy(u[b]).applyMatrix4(S,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function I0(i){let e=new WeakMap;function t(o,a){return a===wa?o.mapping=as:a===Ta&&(o.mapping=ls),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===wa||a===Ta)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Mm(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class pr extends Vd{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Ps=4,jd=[.125,.215,.35,.446,.526,.582],Gi=20,Ll=new pr,$d=new se;let Dl=null,Ul=0,Nl=0,Fl=!1;const Vi=(1+Math.sqrt(5))/2,Is=1/Vi,Kd=[new R(-Vi,Is,0),new R(Vi,Is,0),new R(-Is,0,Vi),new R(Is,0,Vi),new R(0,Vi,-Is),new R(0,Vi,Is),new R(-1,1,-1),new R(1,1,-1),new R(-1,1,1),new R(1,1,1)];class Zd{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){Dl=this._renderer.getRenderTarget(),Ul=this._renderer.getActiveCubeFace(),Nl=this._renderer.getActiveMipmapLevel(),Fl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=eu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Dl,Ul,Nl),this._renderer.xr.enabled=Fl,e.scissorTest=!1,Eo(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===as||e.mapping===ls?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Dl=this._renderer.getRenderTarget(),Ul=this._renderer.getActiveCubeFace(),Nl=this._renderer.getActiveMipmapLevel(),Fl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Qt,minFilter:Qt,generateMipmaps:!1,type:Kn,format:fn,colorSpace:Ht,depthBuffer:!1},s=Jd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jd(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=L0(r)),this._blurMaterial=D0(r,e,t)}return s}_compileMaterial(e){const t=new Ce(this._lodPlanes[0],e);this._renderer.compile(t,Ll)}_sceneToCubeUV(e,t,n,s){const a=new qt(90,1,t,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,h=d.toneMapping;d.getClearColor($d),d.toneMapping=pi,d.autoClear=!1;const f=new He({name:"PMREM.Background",side:Bt,depthWrite:!1,depthTest:!1}),g=new Ce(new ri,f);let x=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,x=!0):(f.color.copy($d),x=!0);for(let p=0;p<6;p++){const S=p%3;S===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):S===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));const b=this._cubeSize;Eo(s,S*b,p>2?b:0,b,b),d.setRenderTarget(s),x&&d.render(g,a),d.render(e,a)}g.geometry.dispose(),g.material.dispose(),d.toneMapping=h,d.autoClear=u,e.background=m}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===as||e.mapping===ls;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=eu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qd());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new Ce(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Eo(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Ll)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Kd[(s-r-1)%Kd.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,u=new Ce(this._lodPlanes[s],c),h=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Gi-1),x=r/g,m=isFinite(r)?1+Math.floor(d*x):Gi;m>Gi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Gi}`);const p=[];let S=0;for(let A=0;A<Gi;++A){const L=A/x,w=Math.exp(-L*L/2);p.push(w),A===0?S+=w:A<m&&(S+=2*w)}for(let A=0;A<p.length;A++)p[A]=p[A]/S;h.envMap.value=e.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=o==="latitudinal",a&&(h.poleAxis.value=a);const{_lodMax:b}=this;h.dTheta.value=g,h.mipInt.value=b-n;const v=this._sizeLods[s],I=3*v*(s>b-Ps?s-b+Ps:0),E=4*(this._cubeSize-v);Eo(t,I,E,3*v,2*v),l.setRenderTarget(t),l.render(u,Ll)}}function L0(i){const e=[],t=[],n=[];let s=i;const r=i-Ps+1+jd.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Ps?l=jd[o-i+Ps-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),d=-c,u=1+c,h=[d,d,u,d,u,u,d,d,u,u,d,u],f=6,g=6,x=3,m=2,p=1,S=new Float32Array(x*g*f),b=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let E=0;E<f;E++){const A=E%3*2/3-1,L=E>2?0:-1,w=[A,L,0,A+2/3,L,0,A+2/3,L+1,0,A,L,0,A+2/3,L+1,0,A,L+1,0];S.set(w,x*g*E),b.set(h,m*g*E);const M=[E,E,E,E,E,E];v.set(M,p*g*E)}const I=new Lt;I.setAttribute("position",new vt(S,x)),I.setAttribute("uv",new vt(b,m)),I.setAttribute("faceIndex",new vt(v,p)),e.push(I),s>Ps&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Jd(i,e,t){const n=new wn(i,e,t);return n.texture.mapping=$r,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Eo(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function D0(i,e,t){const n=new Float32Array(Gi),s=new R(0,1,0);return new Rt({name:"SphericalGaussianBlur",defines:{n:Gi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Ol(),fragmentShader:`

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
		`,blending:qn,depthTest:!1,depthWrite:!1})}function Qd(){return new Rt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ol(),fragmentShader:`

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
		`,blending:qn,depthTest:!1,depthWrite:!1})}function eu(){return new Rt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ol(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:qn,depthTest:!1,depthWrite:!1})}function Ol(){return`

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
	`}function U0(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===wa||l===Ta,d=l===as||l===ls;if(c||d){let u=e.get(a);const h=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==h)return t===null&&(t=new Zd(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||d&&f&&s(f)?(t===null&&(t=new Zd(i)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0;const c=6;for(let d=0;d<c;d++)a[d]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function N0(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&lr("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function F0(i,e,t,n){const s={},r=new WeakMap;function o(u){const h=u.target;h.index!==null&&e.remove(h.index);for(const g in h.attributes)e.remove(h.attributes[g]);for(const g in h.morphAttributes){const x=h.morphAttributes[g];for(let m=0,p=x.length;m<p;m++)e.remove(x[m])}h.removeEventListener("dispose",o),delete s[h.id];const f=r.get(h);f&&(e.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function a(u,h){return s[h.id]===!0||(h.addEventListener("dispose",o),s[h.id]=!0,t.memory.geometries++),h}function l(u){const h=u.attributes;for(const g in h)e.update(h[g],i.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const x=f[g];for(let m=0,p=x.length;m<p;m++)e.update(x[m],i.ARRAY_BUFFER)}}function c(u){const h=[],f=u.index,g=u.attributes.position;let x=0;if(f!==null){const S=f.array;x=f.version;for(let b=0,v=S.length;b<v;b+=3){const I=S[b+0],E=S[b+1],A=S[b+2];h.push(I,E,E,A,A,I)}}else if(g!==void 0){const S=g.array;x=g.version;for(let b=0,v=S.length/3-1;b<v;b+=3){const I=b+0,E=b+1,A=b+2;h.push(I,E,E,A,A,I)}}else return;const m=new(vd(h)?kd:Od)(h,1);m.version=x;const p=r.get(u);p&&e.remove(p),r.set(u,m)}function d(u){const h=r.get(u);if(h){const f=u.index;f!==null&&h.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:d}}function O0(i,e,t){let n;function s(h){n=h}let r,o;function a(h){r=h.type,o=h.bytesPerElement}function l(h,f){i.drawElements(n,f,r,h*o),t.update(f,n,1)}function c(h,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,h*o,g),t.update(f,n,g))}function d(h,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,h,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function u(h,f,g,x){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)c(h[p]/o,f[p],x[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,h,0,x,0,g);let p=0;for(let S=0;S<g;S++)p+=f[S]*x[S];t.update(p,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=d,this.renderMultiDrawInstances=u}function k0(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function B0(i,e,t){const n=new WeakMap,s=new Je;function r(o,a,l){const c=o.morphTargetInfluences,d=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=d!==void 0?d.length:0;let h=n.get(a);if(h===void 0||h.count!==u){let w=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",w)};h!==void 0&&h.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],S=a.morphAttributes.color||[];let b=0;f===!0&&(b=1),g===!0&&(b=2),x===!0&&(b=3);let v=a.attributes.position.count*b,I=1;v>e.maxTextureSize&&(I=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);const E=new Float32Array(v*I*4*u),A=new Ed(E,v,I,u);A.type=bn,A.needsUpdate=!0;const L=b*4;for(let M=0;M<u;M++){const P=m[M],H=p[M],z=S[M],W=v*I*4*M;for(let K=0;K<P.count;K++){const X=K*L;f===!0&&(s.fromBufferAttribute(P,K),E[W+X+0]=s.x,E[W+X+1]=s.y,E[W+X+2]=s.z,E[W+X+3]=0),g===!0&&(s.fromBufferAttribute(H,K),E[W+X+4]=s.x,E[W+X+5]=s.y,E[W+X+6]=s.z,E[W+X+7]=0),x===!0&&(s.fromBufferAttribute(z,K),E[W+X+8]=s.x,E[W+X+9]=s.y,E[W+X+10]=s.z,E[W+X+11]=z.itemSize===4?s.w:1)}}h={count:u,texture:A,size:new we(v,I)},n.set(a,h),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let x=0;x<c.length;x++)f+=c[x];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function z0(i,e,t,n){let s=new WeakMap;function r(l){const c=n.render.frame,d=l.geometry,u=e.get(l,d);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return u}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class tu extends Et{constructor(e,t,n,s,r,o,a,l,c,d=us){if(d!==us&&d!==hs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&d===us&&(n=Fi),n===void 0&&d===hs&&(n=ds),super(null,s,r,o,a,l,d,n,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:zt,this.minFilter=l!==void 0?l:zt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const nu=new Et,iu=new tu(1,1),su=new Ed,ru=new am,ou=new Yd,au=[],lu=[],cu=new Float32Array(16),du=new Float32Array(9),uu=new Float32Array(4);function Ls(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=au[s];if(r===void 0&&(r=new Float32Array(s),au[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function St(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function wt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ao(i,e){let t=lu[e];t===void 0&&(t=new Int32Array(e),lu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function H0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function G0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2fv(this.addr,e),wt(t,e)}}function V0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(St(t,e))return;i.uniform3fv(this.addr,e),wt(t,e)}}function W0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4fv(this.addr,e),wt(t,e)}}function X0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),wt(t,e)}else{if(St(t,n))return;uu.set(n),i.uniformMatrix2fv(this.addr,!1,uu),wt(t,n)}}function Y0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),wt(t,e)}else{if(St(t,n))return;du.set(n),i.uniformMatrix3fv(this.addr,!1,du),wt(t,n)}}function q0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(St(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),wt(t,e)}else{if(St(t,n))return;cu.set(n),i.uniformMatrix4fv(this.addr,!1,cu),wt(t,n)}}function j0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function $0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2iv(this.addr,e),wt(t,e)}}function K0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3iv(this.addr,e),wt(t,e)}}function Z0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4iv(this.addr,e),wt(t,e)}}function J0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Q0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(St(t,e))return;i.uniform2uiv(this.addr,e),wt(t,e)}}function ex(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(St(t,e))return;i.uniform3uiv(this.addr,e),wt(t,e)}}function tx(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(St(t,e))return;i.uniform4uiv(this.addr,e),wt(t,e)}}function nx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(iu.compareFunction=md,r=iu):r=nu,t.setTexture2D(e||r,s)}function ix(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||ru,s)}function sx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||ou,s)}function rx(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||su,s)}function ox(i){switch(i){case 5126:return H0;case 35664:return G0;case 35665:return V0;case 35666:return W0;case 35674:return X0;case 35675:return Y0;case 35676:return q0;case 5124:case 35670:return j0;case 35667:case 35671:return $0;case 35668:case 35672:return K0;case 35669:case 35673:return Z0;case 5125:return J0;case 36294:return Q0;case 36295:return ex;case 36296:return tx;case 35678:case 36198:case 36298:case 36306:case 35682:return nx;case 35679:case 36299:case 36307:return ix;case 35680:case 36300:case 36308:case 36293:return sx;case 36289:case 36303:case 36311:case 36292:return rx}}function ax(i,e){i.uniform1fv(this.addr,e)}function lx(i,e){const t=Ls(e,this.size,2);i.uniform2fv(this.addr,t)}function cx(i,e){const t=Ls(e,this.size,3);i.uniform3fv(this.addr,t)}function dx(i,e){const t=Ls(e,this.size,4);i.uniform4fv(this.addr,t)}function ux(i,e){const t=Ls(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function hx(i,e){const t=Ls(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function fx(i,e){const t=Ls(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function px(i,e){i.uniform1iv(this.addr,e)}function mx(i,e){i.uniform2iv(this.addr,e)}function gx(i,e){i.uniform3iv(this.addr,e)}function xx(i,e){i.uniform4iv(this.addr,e)}function vx(i,e){i.uniform1uiv(this.addr,e)}function _x(i,e){i.uniform2uiv(this.addr,e)}function yx(i,e){i.uniform3uiv(this.addr,e)}function bx(i,e){i.uniform4uiv(this.addr,e)}function Mx(i,e,t){const n=this.cache,s=e.length,r=Ao(t,s);St(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||nu,r[o])}function Sx(i,e,t){const n=this.cache,s=e.length,r=Ao(t,s);St(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||ru,r[o])}function wx(i,e,t){const n=this.cache,s=e.length,r=Ao(t,s);St(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||ou,r[o])}function Tx(i,e,t){const n=this.cache,s=e.length,r=Ao(t,s);St(n,r)||(i.uniform1iv(this.addr,r),wt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||su,r[o])}function Ex(i){switch(i){case 5126:return ax;case 35664:return lx;case 35665:return cx;case 35666:return dx;case 35674:return ux;case 35675:return hx;case 35676:return fx;case 5124:case 35670:return px;case 35667:case 35671:return mx;case 35668:case 35672:return gx;case 35669:case 35673:return xx;case 5125:return vx;case 36294:return _x;case 36295:return yx;case 36296:return bx;case 35678:case 36198:case 36298:case 36306:case 35682:return Mx;case 35679:case 36299:case 36307:return Sx;case 35680:case 36300:case 36308:case 36293:return wx;case 36289:case 36303:case 36311:case 36292:return Tx}}class Ax{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ox(t.type)}}class Rx{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ex(t.type)}}class Cx{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const kl=/(\w+)(\])?(\[|\.)?/g;function hu(i,e){i.seq.push(e),i.map[e.id]=e}function Px(i,e,t){const n=i.name,s=n.length;for(kl.lastIndex=0;;){const r=kl.exec(n),o=kl.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){hu(t,c===void 0?new Ax(a,i,e):new Rx(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new Cx(a),hu(t,u)),t=u}}}class Ro{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Px(r,o,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function fu(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Ix=37297;let Lx=0;function Dx(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const pu=new Ue;function Ux(i){Xe._getMatrix(pu,Xe.workingColorSpace,i);const e=`mat3( ${pu.elements.map(t=>t.toFixed(4))} )`;switch(Xe.getTransfer(i)){case io:return[e,"LinearTransferOETF"];case ot:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function mu(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+Dx(i.getShaderSource(e),o)}else return s}function Nx(i,e){const t=Ux(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Fx(i,e){let t;switch(e){case Kc:t="Linear";break;case _p:t="Reinhard";break;case yp:t="Cineon";break;case Zc:t="ACESFilmic";break;case Mp:t="AgX";break;case Sp:t="Neutral";break;case bp:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Co=new R;function Ox(){Xe.getLuminanceCoefficients(Co);const i=Co.x.toFixed(4),e=Co.y.toFixed(4),t=Co.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function kx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(mr).join(`
`)}function Bx(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function zx(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function mr(i){return i!==""}function gu(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xu(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Hx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Bl(i){return i.replace(Hx,Vx)}const Gx=new Map;function Vx(i,e){let t=Oe[e];if(t===void 0){const n=Gx.get(e);if(n!==void 0)t=Oe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Bl(t)}const Wx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vu(i){return i.replace(Wx,Xx)}function Xx(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function _u(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function Yx(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===fa?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Jf?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Xn&&(e="SHADOWMAP_TYPE_VSM"),e}function qx(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case as:case ls:e="ENVMAP_TYPE_CUBE";break;case $r:e="ENVMAP_TYPE_CUBE_UV";break}return e}function jx(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case ls:e="ENVMAP_MODE_REFRACTION";break}return e}function $x(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Sa:e="ENVMAP_BLENDING_MULTIPLY";break;case xp:e="ENVMAP_BLENDING_MIX";break;case vp:e="ENVMAP_BLENDING_ADD";break}return e}function Kx(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Zx(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Yx(t),c=qx(t),d=jx(t),u=$x(t),h=Kx(t),f=kx(t),g=Bx(r),x=s.createProgram();let m,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(mr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(mr).join(`
`),p.length>0&&(p+=`
`)):(m=[_u(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(mr).join(`
`),p=[_u(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+u:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==pi?"#define TONE_MAPPING":"",t.toneMapping!==pi?Oe.tonemapping_pars_fragment:"",t.toneMapping!==pi?Fx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Oe.colorspace_pars_fragment,Nx("linearToOutputTexel",t.outputColorSpace),Ox(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(mr).join(`
`)),o=Bl(o),o=gu(o,t),o=xu(o,t),a=Bl(a),a=gu(a,t),a=xu(a,t),o=vu(o),a=vu(a),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===gd?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===gd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const b=S+m+o,v=S+p+a,I=fu(s,s.VERTEX_SHADER,b),E=fu(s,s.FRAGMENT_SHADER,v);s.attachShader(x,I),s.attachShader(x,E),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function A(P){if(i.debug.checkShaderErrors){const H=s.getProgramInfoLog(x).trim(),z=s.getShaderInfoLog(I).trim(),W=s.getShaderInfoLog(E).trim();let K=!0,X=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(K=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,I,E);else{const ne=mu(s,I,"vertex"),V=mu(s,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+H+`
`+ne+`
`+V)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):(z===""||W==="")&&(X=!1);X&&(P.diagnostics={runnable:K,programLog:H,vertexShader:{log:z,prefix:m},fragmentShader:{log:W,prefix:p}})}s.deleteShader(I),s.deleteShader(E),L=new Ro(s,x),w=zx(s,x)}let L;this.getUniforms=function(){return L===void 0&&A(this),L};let w;this.getAttributes=function(){return w===void 0&&A(this),w};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(x,Ix)),M},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Lx++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=I,this.fragmentShader=E,this}let Jx=0;class Qx{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new ev(e),t.set(e,n)),n}}class ev{constructor(e){this.id=Jx++,this.code=e,this.usedTimes=0}}function tv(i,e,t,n,s,r,o){const a=new vl,l=new Qx,c=new Set,d=[],u=s.logarithmicDepthBuffer,h=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(w){return c.add(w),w===0?"uv":`uv${w}`}function m(w,M,P,H,z){const W=H.fog,K=z.geometry,X=w.isMeshStandardMaterial?H.environment:null,ne=(w.isMeshStandardMaterial?t:e).get(w.envMap||X),V=ne&&ne.mapping===$r?ne.image.height:null,ae=g[w.type];w.precision!==null&&(f=s.getMaxPrecision(w.precision),f!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",f,"instead."));const fe=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Se=fe!==void 0?fe.length:0;let Ve=0;K.morphAttributes.position!==void 0&&(Ve=1),K.morphAttributes.normal!==void 0&&(Ve=2),K.morphAttributes.color!==void 0&&(Ve=3);let dt,q,ie,ye;if(ae){const rt=Nn[ae];dt=rt.vertexShader,q=rt.fragmentShader}else dt=w.vertexShader,q=w.fragmentShader,l.update(w),ie=l.getVertexShaderID(w),ye=l.getFragmentShaderID(w);const le=i.getRenderTarget(),Re=i.state.buffers.depth.getReversed(),De=z.isInstancedMesh===!0,We=z.isBatchedMesh===!0,xt=!!w.map,$e=!!w.matcap,bt=!!ne,F=!!w.aoMap,vn=!!w.lightMap,Ye=!!w.bumpMap,qe=!!w.normalMap,Ee=!!w.displacementMap,ft=!!w.emissiveMap,Te=!!w.metalnessMap,T=!!w.roughnessMap,_=w.anisotropy>0,O=w.clearcoat>0,j=w.dispersion>0,Z=w.iridescence>0,Y=w.sheen>0,be=w.transmission>0,ce=_&&!!w.anisotropyMap,pe=O&&!!w.clearcoatMap,Ke=O&&!!w.clearcoatNormalMap,ee=O&&!!w.clearcoatRoughnessMap,me=Z&&!!w.iridescenceMap,Ae=Z&&!!w.iridescenceThicknessMap,Pe=Y&&!!w.sheenColorMap,ge=Y&&!!w.sheenRoughnessMap,je=!!w.specularMap,Be=!!w.specularColorMap,ut=!!w.specularIntensityMap,D=be&&!!w.transmissionMap,oe=be&&!!w.thicknessMap,G=!!w.gradientMap,$=!!w.alphaMap,he=w.alphaTest>0,de=!!w.alphaHash,Ne=!!w.extensions;let yt=pi;w.toneMapped&&(le===null||le.isXRRenderTarget===!0)&&(yt=i.toneMapping);const kt={shaderID:ae,shaderType:w.type,shaderName:w.name,vertexShader:dt,fragmentShader:q,defines:w.defines,customVertexShaderID:ie,customFragmentShaderID:ye,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:f,batching:We,batchingColor:We&&z._colorsTexture!==null,instancing:De,instancingColor:De&&z.instanceColor!==null,instancingMorph:De&&z.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:le===null?i.outputColorSpace:le.isXRRenderTarget===!0?le.texture.colorSpace:Ht,alphaToCoverage:!!w.alphaToCoverage,map:xt,matcap:$e,envMap:bt,envMapMode:bt&&ne.mapping,envMapCubeUVHeight:V,aoMap:F,lightMap:vn,bumpMap:Ye,normalMap:qe,displacementMap:h&&Ee,emissiveMap:ft,normalMapObjectSpace:qe&&w.normalMapType===Cp,normalMapTangentSpace:qe&&w.normalMapType===al,metalnessMap:Te,roughnessMap:T,anisotropy:_,anisotropyMap:ce,clearcoat:O,clearcoatMap:pe,clearcoatNormalMap:Ke,clearcoatRoughnessMap:ee,dispersion:j,iridescence:Z,iridescenceMap:me,iridescenceThicknessMap:Ae,sheen:Y,sheenColorMap:Pe,sheenRoughnessMap:ge,specularMap:je,specularColorMap:Be,specularIntensityMap:ut,transmission:be,transmissionMap:D,thicknessMap:oe,gradientMap:G,opaque:w.transparent===!1&&w.blending===rs&&w.alphaToCoverage===!1,alphaMap:$,alphaTest:he,alphaHash:de,combine:w.combine,mapUv:xt&&x(w.map.channel),aoMapUv:F&&x(w.aoMap.channel),lightMapUv:vn&&x(w.lightMap.channel),bumpMapUv:Ye&&x(w.bumpMap.channel),normalMapUv:qe&&x(w.normalMap.channel),displacementMapUv:Ee&&x(w.displacementMap.channel),emissiveMapUv:ft&&x(w.emissiveMap.channel),metalnessMapUv:Te&&x(w.metalnessMap.channel),roughnessMapUv:T&&x(w.roughnessMap.channel),anisotropyMapUv:ce&&x(w.anisotropyMap.channel),clearcoatMapUv:pe&&x(w.clearcoatMap.channel),clearcoatNormalMapUv:Ke&&x(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ee&&x(w.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&x(w.iridescenceMap.channel),iridescenceThicknessMapUv:Ae&&x(w.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&x(w.sheenColorMap.channel),sheenRoughnessMapUv:ge&&x(w.sheenRoughnessMap.channel),specularMapUv:je&&x(w.specularMap.channel),specularColorMapUv:Be&&x(w.specularColorMap.channel),specularIntensityMapUv:ut&&x(w.specularIntensityMap.channel),transmissionMapUv:D&&x(w.transmissionMap.channel),thicknessMapUv:oe&&x(w.thicknessMap.channel),alphaMapUv:$&&x(w.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(qe||_),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!K.attributes.uv&&(xt||$),fog:!!W,useFog:w.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:w.flatShading===!0,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Re,skinning:z.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:Se,morphTextureStride:Ve,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:w.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:yt,decodeVideoTexture:xt&&w.map.isVideoTexture===!0&&Xe.getTransfer(w.map.colorSpace)===ot,decodeVideoTextureEmissive:ft&&w.emissiveMap.isVideoTexture===!0&&Xe.getTransfer(w.emissiveMap.colorSpace)===ot,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===ct,flipSided:w.side===Bt,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:Ne&&w.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ne&&w.extensions.multiDraw===!0||We)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return kt.vertexUv1s=c.has(1),kt.vertexUv2s=c.has(2),kt.vertexUv3s=c.has(3),c.clear(),kt}function p(w){const M=[];if(w.shaderID?M.push(w.shaderID):(M.push(w.customVertexShaderID),M.push(w.customFragmentShaderID)),w.defines!==void 0)for(const P in w.defines)M.push(P),M.push(w.defines[P]);return w.isRawShaderMaterial===!1&&(S(M,w),b(M,w),M.push(i.outputColorSpace)),M.push(w.customProgramCacheKey),M.join()}function S(w,M){w.push(M.precision),w.push(M.outputColorSpace),w.push(M.envMapMode),w.push(M.envMapCubeUVHeight),w.push(M.mapUv),w.push(M.alphaMapUv),w.push(M.lightMapUv),w.push(M.aoMapUv),w.push(M.bumpMapUv),w.push(M.normalMapUv),w.push(M.displacementMapUv),w.push(M.emissiveMapUv),w.push(M.metalnessMapUv),w.push(M.roughnessMapUv),w.push(M.anisotropyMapUv),w.push(M.clearcoatMapUv),w.push(M.clearcoatNormalMapUv),w.push(M.clearcoatRoughnessMapUv),w.push(M.iridescenceMapUv),w.push(M.iridescenceThicknessMapUv),w.push(M.sheenColorMapUv),w.push(M.sheenRoughnessMapUv),w.push(M.specularMapUv),w.push(M.specularColorMapUv),w.push(M.specularIntensityMapUv),w.push(M.transmissionMapUv),w.push(M.thicknessMapUv),w.push(M.combine),w.push(M.fogExp2),w.push(M.sizeAttenuation),w.push(M.morphTargetsCount),w.push(M.morphAttributeCount),w.push(M.numDirLights),w.push(M.numPointLights),w.push(M.numSpotLights),w.push(M.numSpotLightMaps),w.push(M.numHemiLights),w.push(M.numRectAreaLights),w.push(M.numDirLightShadows),w.push(M.numPointLightShadows),w.push(M.numSpotLightShadows),w.push(M.numSpotLightShadowsWithMaps),w.push(M.numLightProbes),w.push(M.shadowMapType),w.push(M.toneMapping),w.push(M.numClippingPlanes),w.push(M.numClipIntersection),w.push(M.depthPacking)}function b(w,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),w.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reverseDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),w.push(a.mask)}function v(w){const M=g[w.type];let P;if(M){const H=Nn[M];P=So.clone(H.uniforms)}else P=w.uniforms;return P}function I(w,M){let P;for(let H=0,z=d.length;H<z;H++){const W=d[H];if(W.cacheKey===M){P=W,++P.usedTimes;break}}return P===void 0&&(P=new Zx(i,M,w,r),d.push(P)),P}function E(w){if(--w.usedTimes===0){const M=d.indexOf(w);d[M]=d[d.length-1],d.pop(),w.destroy()}}function A(w){l.remove(w)}function L(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:I,releaseProgram:E,releaseShaderCache:A,programs:d,dispose:L}}function nv(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function iv(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function yu(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function bu(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,h,f,g,x,m){let p=i[e];return p===void 0?(p={id:u.id,object:u,geometry:h,material:f,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},i[e]=p):(p.id=u.id,p.object=u,p.geometry=h,p.material=f,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=x,p.group=m),e++,p}function a(u,h,f,g,x,m){const p=o(u,h,f,g,x,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):t.push(p)}function l(u,h,f,g,x,m){const p=o(u,h,f,g,x,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):t.unshift(p)}function c(u,h){t.length>1&&t.sort(u||iv),n.length>1&&n.sort(h||yu),s.length>1&&s.sort(h||yu)}function d(){for(let u=e,h=i.length;u<h;u++){const f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:d,sort:c}}function sv(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new bu,i.set(n,[o])):s>=r.length?(o=new bu,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function rv(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new R,color:new se};break;case"SpotLight":t={position:new R,direction:new R,color:new se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new se,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new se,groundColor:new se};break;case"RectAreaLight":t={color:new se,position:new R,halfWidth:new R,halfHeight:new R};break}return i[e.id]=t,t}}}function ov(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new we,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let av=0;function lv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function cv(i){const e=new rv,t=ov(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new R);const s=new R,r=new Ie,o=new Ie;function a(c){let d=0,u=0,h=0;for(let w=0;w<9;w++)n.probe[w].set(0,0,0);let f=0,g=0,x=0,m=0,p=0,S=0,b=0,v=0,I=0,E=0,A=0;c.sort(lv);for(let w=0,M=c.length;w<M;w++){const P=c[w],H=P.color,z=P.intensity,W=P.distance,K=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)d+=H.r*z,u+=H.g*z,h+=H.b*z;else if(P.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(P.sh.coefficients[X],z);A++}else if(P.isDirectionalLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const ne=P.shadow,V=t.get(P);V.shadowIntensity=ne.intensity,V.shadowBias=ne.bias,V.shadowNormalBias=ne.normalBias,V.shadowRadius=ne.radius,V.shadowMapSize=ne.mapSize,n.directionalShadow[f]=V,n.directionalShadowMap[f]=K,n.directionalShadowMatrix[f]=P.shadow.matrix,S++}n.directional[f]=X,f++}else if(P.isSpotLight){const X=e.get(P);X.position.setFromMatrixPosition(P.matrixWorld),X.color.copy(H).multiplyScalar(z),X.distance=W,X.coneCos=Math.cos(P.angle),X.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),X.decay=P.decay,n.spot[x]=X;const ne=P.shadow;if(P.map&&(n.spotLightMap[I]=P.map,I++,ne.updateMatrices(P),P.castShadow&&E++),n.spotLightMatrix[x]=ne.matrix,P.castShadow){const V=t.get(P);V.shadowIntensity=ne.intensity,V.shadowBias=ne.bias,V.shadowNormalBias=ne.normalBias,V.shadowRadius=ne.radius,V.shadowMapSize=ne.mapSize,n.spotShadow[x]=V,n.spotShadowMap[x]=K,v++}x++}else if(P.isRectAreaLight){const X=e.get(P);X.color.copy(H).multiplyScalar(z),X.halfWidth.set(P.width*.5,0,0),X.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=X,m++}else if(P.isPointLight){const X=e.get(P);if(X.color.copy(P.color).multiplyScalar(P.intensity),X.distance=P.distance,X.decay=P.decay,P.castShadow){const ne=P.shadow,V=t.get(P);V.shadowIntensity=ne.intensity,V.shadowBias=ne.bias,V.shadowNormalBias=ne.normalBias,V.shadowRadius=ne.radius,V.shadowMapSize=ne.mapSize,V.shadowCameraNear=ne.camera.near,V.shadowCameraFar=ne.camera.far,n.pointShadow[g]=V,n.pointShadowMap[g]=K,n.pointShadowMatrix[g]=P.shadow.matrix,b++}n.point[g]=X,g++}else if(P.isHemisphereLight){const X=e.get(P);X.skyColor.copy(P.color).multiplyScalar(z),X.groundColor.copy(P.groundColor).multiplyScalar(z),n.hemi[p]=X,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=re.LTC_FLOAT_1,n.rectAreaLTC2=re.LTC_FLOAT_2):(n.rectAreaLTC1=re.LTC_HALF_1,n.rectAreaLTC2=re.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=u,n.ambient[2]=h;const L=n.hash;(L.directionalLength!==f||L.pointLength!==g||L.spotLength!==x||L.rectAreaLength!==m||L.hemiLength!==p||L.numDirectionalShadows!==S||L.numPointShadows!==b||L.numSpotShadows!==v||L.numSpotMaps!==I||L.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=S,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=v+I-E,n.spotLightMap.length=I,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=A,L.directionalLength=f,L.pointLength=g,L.spotLength=x,L.rectAreaLength=m,L.hemiLength=p,L.numDirectionalShadows=S,L.numPointShadows=b,L.numSpotShadows=v,L.numSpotMaps=I,L.numLightProbes=A,n.version=av++)}function l(c,d){let u=0,h=0,f=0,g=0,x=0;const m=d.matrixWorldInverse;for(let p=0,S=c.length;p<S;p++){const b=c[p];if(b.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),u++}else if(b.isSpotLight){const v=n.spot[f];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(b.width*.5,0,0),v.halfHeight.set(0,b.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const v=n.point[h];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),h++}else if(b.isHemisphereLight){const v=n.hemi[x];v.direction.setFromMatrixPosition(b.matrixWorld),v.direction.transformDirection(m),x++}}}return{setup:a,setupView:l,state:n}}function Mu(i){const e=new cv(i),t=[],n=[];function s(d){c.camera=d,t.length=0,n.length=0}function r(d){t.push(d)}function o(d){n.push(d)}function a(){e.setup(t)}function l(d){e.setupView(t,d)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function dv(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new Mu(i),e.set(s,[a])):r>=o.length?(a=new Mu(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}class uv extends Pn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Ap,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class hv extends Pn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const fv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,pv=`uniform sampler2D shadow_pass;
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
}`;function mv(i,e,t){let n=new Il;const s=new we,r=new we,o=new Je,a=new uv({depthPacking:Rp}),l=new hv,c={},d=t.maxTextureSize,u={[Yn]:Bt,[Bt]:Yn,[ct]:ct},h=new Rt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new we},radius:{value:4}},vertexShader:fv,fragmentShader:pv}),f=h.clone();f.defines.HORIZONTAL_PASS=1;const g=new Lt;g.setAttribute("position",new vt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new Ce(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=fa;let p=this.type;this.render=function(E,A,L){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;const w=i.getRenderTarget(),M=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),H=i.state;H.setBlending(qn),H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);const z=p!==Xn&&this.type===Xn,W=p===Xn&&this.type!==Xn;for(let K=0,X=E.length;K<X;K++){const ne=E[K],V=ne.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",ne,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const ae=V.getFrameExtents();if(s.multiply(ae),r.copy(V.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/ae.x),s.x=r.x*ae.x,V.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/ae.y),s.y=r.y*ae.y,V.mapSize.y=r.y)),V.map===null||z===!0||W===!0){const Se=this.type!==Xn?{minFilter:zt,magFilter:zt}:{};V.map!==null&&V.map.dispose(),V.map=new wn(s.x,s.y,Se),V.map.texture.name=ne.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const fe=V.getViewportCount();for(let Se=0;Se<fe;Se++){const Ve=V.getViewport(Se);o.set(r.x*Ve.x,r.y*Ve.y,r.x*Ve.z,r.y*Ve.w),H.viewport(o),V.updateMatrices(ne,Se),n=V.getFrustum(),v(A,L,V.camera,ne,this.type)}V.isPointLightShadow!==!0&&this.type===Xn&&S(V,L),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(w,M,P)};function S(E,A){const L=e.update(x);h.defines.VSM_SAMPLES!==E.blurSamples&&(h.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new wn(s.x,s.y)),h.uniforms.shadow_pass.value=E.map.texture,h.uniforms.resolution.value=E.mapSize,h.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(A,null,L,h,x,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(A,null,L,f,x,null)}function b(E,A,L,w){let M=null;const P=L.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(P!==void 0)M=P;else if(M=L.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const H=M.uuid,z=A.uuid;let W=c[H];W===void 0&&(W={},c[H]=W);let K=W[z];K===void 0&&(K=M.clone(),W[z]=K,A.addEventListener("dispose",I)),M=K}if(M.visible=A.visible,M.wireframe=A.wireframe,w===Xn?M.side=A.shadowSide!==null?A.shadowSide:A.side:M.side=A.shadowSide!==null?A.shadowSide:u[A.side],M.alphaMap=A.alphaMap,M.alphaTest=A.alphaTest,M.map=A.map,M.clipShadows=A.clipShadows,M.clippingPlanes=A.clippingPlanes,M.clipIntersection=A.clipIntersection,M.displacementMap=A.displacementMap,M.displacementScale=A.displacementScale,M.displacementBias=A.displacementBias,M.wireframeLinewidth=A.wireframeLinewidth,M.linewidth=A.linewidth,L.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const H=i.properties.get(M);H.light=L}return M}function v(E,A,L,w,M){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&M===Xn)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,E.matrixWorld);const z=e.update(E),W=E.material;if(Array.isArray(W)){const K=z.groups;for(let X=0,ne=K.length;X<ne;X++){const V=K[X],ae=W[V.materialIndex];if(ae&&ae.visible){const fe=b(E,ae,w,M);E.onBeforeShadow(i,E,A,L,z,fe,V),i.renderBufferDirect(L,null,z,fe,E,V),E.onAfterShadow(i,E,A,L,z,fe,V)}}}else if(W.visible){const K=b(E,W,w,M);E.onBeforeShadow(i,E,A,L,z,K,null),i.renderBufferDirect(L,null,z,K,E,null),E.onAfterShadow(i,E,A,L,z,K,null)}}const H=E.children;for(let z=0,W=H.length;z<W;z++)v(H[z],A,L,w,M)}function I(E){E.target.removeEventListener("dispose",I);for(const L in c){const w=c[L],M=E.target.uuid;M in w&&(w[M].dispose(),delete w[M])}}}const gv={[ga]:xa,[va]:ba,[_a]:Ma,[os]:ya,[xa]:ga,[ba]:va,[Ma]:_a,[ya]:os};function xv(i,e){function t(){let D=!1;const oe=new Je;let G=null;const $=new Je(0,0,0,0);return{setMask:function(he){G!==he&&!D&&(i.colorMask(he,he,he,he),G=he)},setLocked:function(he){D=he},setClear:function(he,de,Ne,yt,kt){kt===!0&&(he*=yt,de*=yt,Ne*=yt),oe.set(he,de,Ne,yt),$.equals(oe)===!1&&(i.clearColor(he,de,Ne,yt),$.copy(oe))},reset:function(){D=!1,G=null,$.set(-1,0,0,0)}}}function n(){let D=!1,oe=!1,G=null,$=null,he=null;return{setReversed:function(de){if(oe!==de){const Ne=e.get("EXT_clip_control");oe?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT);const yt=he;he=null,this.setClear(yt)}oe=de},getReversed:function(){return oe},setTest:function(de){de?le(i.DEPTH_TEST):Re(i.DEPTH_TEST)},setMask:function(de){G!==de&&!D&&(i.depthMask(de),G=de)},setFunc:function(de){if(oe&&(de=gv[de]),$!==de){switch(de){case ga:i.depthFunc(i.NEVER);break;case xa:i.depthFunc(i.ALWAYS);break;case va:i.depthFunc(i.LESS);break;case os:i.depthFunc(i.LEQUAL);break;case _a:i.depthFunc(i.EQUAL);break;case ya:i.depthFunc(i.GEQUAL);break;case ba:i.depthFunc(i.GREATER);break;case Ma:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}$=de}},setLocked:function(de){D=de},setClear:function(de){he!==de&&(oe&&(de=1-de),i.clearDepth(de),he=de)},reset:function(){D=!1,G=null,$=null,he=null,oe=!1}}}function s(){let D=!1,oe=null,G=null,$=null,he=null,de=null,Ne=null,yt=null,kt=null;return{setTest:function(rt){D||(rt?le(i.STENCIL_TEST):Re(i.STENCIL_TEST))},setMask:function(rt){oe!==rt&&!D&&(i.stencilMask(rt),oe=rt)},setFunc:function(rt,Ln,di){(G!==rt||$!==Ln||he!==di)&&(i.stencilFunc(rt,Ln,di),G=rt,$=Ln,he=di)},setOp:function(rt,Ln,di){(de!==rt||Ne!==Ln||yt!==di)&&(i.stencilOp(rt,Ln,di),de=rt,Ne=Ln,yt=di)},setLocked:function(rt){D=rt},setClear:function(rt){kt!==rt&&(i.clearStencil(rt),kt=rt)},reset:function(){D=!1,oe=null,G=null,$=null,he=null,de=null,Ne=null,yt=null,kt=null}}}const r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap;let d={},u={},h=new WeakMap,f=[],g=null,x=!1,m=null,p=null,S=null,b=null,v=null,I=null,E=null,A=new se(0,0,0),L=0,w=!1,M=null,P=null,H=null,z=null,W=null;const K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,ne=0;const V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(ne=parseFloat(/^WebGL (\d)/.exec(V)[1]),X=ne>=1):V.indexOf("OpenGL ES")!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),X=ne>=2);let ae=null,fe={};const Se=i.getParameter(i.SCISSOR_BOX),Ve=i.getParameter(i.VIEWPORT),dt=new Je().fromArray(Se),q=new Je().fromArray(Ve);function ie(D,oe,G,$){const he=new Uint8Array(4),de=i.createTexture();i.bindTexture(D,de),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<G;Ne++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(oe,0,i.RGBA,1,1,$,0,i.RGBA,i.UNSIGNED_BYTE,he):i.texImage2D(oe+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,he);return de}const ye={};ye[i.TEXTURE_2D]=ie(i.TEXTURE_2D,i.TEXTURE_2D,1),ye[i.TEXTURE_CUBE_MAP]=ie(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ye[i.TEXTURE_2D_ARRAY]=ie(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ye[i.TEXTURE_3D]=ie(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),le(i.DEPTH_TEST),o.setFunc(os),Ye(!1),qe(qc),le(i.CULL_FACE),F(qn);function le(D){d[D]!==!0&&(i.enable(D),d[D]=!0)}function Re(D){d[D]!==!1&&(i.disable(D),d[D]=!1)}function De(D,oe){return u[D]!==oe?(i.bindFramebuffer(D,oe),u[D]=oe,D===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=oe),D===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=oe),!0):!1}function We(D,oe){let G=f,$=!1;if(D){G=h.get(oe),G===void 0&&(G=[],h.set(oe,G));const he=D.textures;if(G.length!==he.length||G[0]!==i.COLOR_ATTACHMENT0){for(let de=0,Ne=he.length;de<Ne;de++)G[de]=i.COLOR_ATTACHMENT0+de;G.length=he.length,$=!0}}else G[0]!==i.BACK&&(G[0]=i.BACK,$=!0);$&&i.drawBuffers(G)}function xt(D){return g!==D?(i.useProgram(D),g=D,!0):!1}const $e={[Ni]:i.FUNC_ADD,[ep]:i.FUNC_SUBTRACT,[tp]:i.FUNC_REVERSE_SUBTRACT};$e[np]=i.MIN,$e[ip]=i.MAX;const bt={[sp]:i.ZERO,[rp]:i.ONE,[op]:i.SRC_COLOR,[pa]:i.SRC_ALPHA,[hp]:i.SRC_ALPHA_SATURATE,[dp]:i.DST_COLOR,[lp]:i.DST_ALPHA,[ap]:i.ONE_MINUS_SRC_COLOR,[ma]:i.ONE_MINUS_SRC_ALPHA,[up]:i.ONE_MINUS_DST_COLOR,[cp]:i.ONE_MINUS_DST_ALPHA,[fp]:i.CONSTANT_COLOR,[pp]:i.ONE_MINUS_CONSTANT_COLOR,[mp]:i.CONSTANT_ALPHA,[gp]:i.ONE_MINUS_CONSTANT_ALPHA};function F(D,oe,G,$,he,de,Ne,yt,kt,rt){if(D===qn){x===!0&&(Re(i.BLEND),x=!1);return}if(x===!1&&(le(i.BLEND),x=!0),D!==Qf){if(D!==m||rt!==w){if((p!==Ni||v!==Ni)&&(i.blendEquation(i.FUNC_ADD),p=Ni,v=Ni),rt)switch(D){case rs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fi:i.blendFunc(i.ONE,i.ONE);break;case jc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case $c:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case rs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case fi:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case jc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case $c:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}S=null,b=null,I=null,E=null,A.set(0,0,0),L=0,m=D,w=rt}return}he=he||oe,de=de||G,Ne=Ne||$,(oe!==p||he!==v)&&(i.blendEquationSeparate($e[oe],$e[he]),p=oe,v=he),(G!==S||$!==b||de!==I||Ne!==E)&&(i.blendFuncSeparate(bt[G],bt[$],bt[de],bt[Ne]),S=G,b=$,I=de,E=Ne),(yt.equals(A)===!1||kt!==L)&&(i.blendColor(yt.r,yt.g,yt.b,kt),A.copy(yt),L=kt),m=D,w=!1}function vn(D,oe){D.side===ct?Re(i.CULL_FACE):le(i.CULL_FACE);let G=D.side===Bt;oe&&(G=!G),Ye(G),D.blending===rs&&D.transparent===!1?F(qn):F(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);const $=D.stencilWrite;a.setTest($),$&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),ft(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?le(i.SAMPLE_ALPHA_TO_COVERAGE):Re(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ye(D){M!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),M=D)}function qe(D){D!==ss?(le(i.CULL_FACE),D!==P&&(D===qc?i.cullFace(i.BACK):D===Zf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Re(i.CULL_FACE),P=D}function Ee(D){D!==H&&(X&&i.lineWidth(D),H=D)}function ft(D,oe,G){D?(le(i.POLYGON_OFFSET_FILL),(z!==oe||W!==G)&&(i.polygonOffset(oe,G),z=oe,W=G)):Re(i.POLYGON_OFFSET_FILL)}function Te(D){D?le(i.SCISSOR_TEST):Re(i.SCISSOR_TEST)}function T(D){D===void 0&&(D=i.TEXTURE0+K-1),ae!==D&&(i.activeTexture(D),ae=D)}function _(D,oe,G){G===void 0&&(ae===null?G=i.TEXTURE0+K-1:G=ae);let $=fe[G];$===void 0&&($={type:void 0,texture:void 0},fe[G]=$),($.type!==D||$.texture!==oe)&&(ae!==G&&(i.activeTexture(G),ae=G),i.bindTexture(D,oe||ye[D]),$.type=D,$.texture=oe)}function O(){const D=fe[ae];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function j(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Y(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function be(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ce(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function pe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ke(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ee(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function me(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ae(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Pe(D){dt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),dt.copy(D))}function ge(D){q.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),q.copy(D))}function je(D,oe){let G=c.get(oe);G===void 0&&(G=new WeakMap,c.set(oe,G));let $=G.get(D);$===void 0&&($=i.getUniformBlockIndex(oe,D.name),G.set(D,$))}function Be(D,oe){const $=c.get(oe).get(D);l.get(oe)!==$&&(i.uniformBlockBinding(oe,$,D.__bindingPointIndex),l.set(oe,$))}function ut(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),d={},ae=null,fe={},u={},h=new WeakMap,f=[],g=null,x=!1,m=null,p=null,S=null,b=null,v=null,I=null,E=null,A=new se(0,0,0),L=0,w=!1,M=null,P=null,H=null,z=null,W=null,dt.set(0,0,i.canvas.width,i.canvas.height),q.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:le,disable:Re,bindFramebuffer:De,drawBuffers:We,useProgram:xt,setBlending:F,setMaterial:vn,setFlipSided:Ye,setCullFace:qe,setLineWidth:Ee,setPolygonOffset:ft,setScissorTest:Te,activeTexture:T,bindTexture:_,unbindTexture:O,compressedTexImage2D:j,compressedTexImage3D:Z,texImage2D:me,texImage3D:Ae,updateUBOMapping:je,uniformBlockBinding:Be,texStorage2D:Ke,texStorage3D:ee,texSubImage2D:Y,texSubImage3D:be,compressedTexSubImage2D:ce,compressedTexSubImage3D:pe,scissor:Pe,viewport:ge,reset:ut}}function Su(i,e,t,n){const s=vv(n);switch(t){case sd:return i*e;case od:return i*e;case ad:return i*e*2;case Ca:return i*e/s.components*s.byteLength;case Pa:return i*e/s.components*s.byteLength;case ld:return i*e*2/s.components*s.byteLength;case Ia:return i*e*2/s.components*s.byteLength;case rd:return i*e*3/s.components*s.byteLength;case fn:return i*e*4/s.components*s.byteLength;case La:return i*e*4/s.components*s.byteLength;case Jr:case Qr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case eo:case to:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ua:case Fa:return Math.max(i,16)*Math.max(e,8)/4;case Da:case Na:return Math.max(i,8)*Math.max(e,8)/2;case Oa:case ka:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ba:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case za:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ha:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ga:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Va:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Wa:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Xa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case qa:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ja:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case $a:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Za:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Ja:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Qa:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case no:case el:case tl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case cd:case nl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case il:case sl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function vv(i){switch(i){case $n:case td:return{byteLength:1,components:1};case nr:case nd:case Kn:return{byteLength:2,components:1};case Aa:case Ra:return{byteLength:2,components:4};case Fi:case Ea:case bn:return{byteLength:4,components:1};case id:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function _v(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new we,d=new WeakMap;let u;const h=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(T,_){return f?new OffscreenCanvas(T,_):ar("canvas")}function x(T,_,O){let j=1;const Z=Te(T);if((Z.width>O||Z.height>O)&&(j=O/Math.max(Z.width,Z.height)),j<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const Y=Math.floor(j*Z.width),be=Math.floor(j*Z.height);u===void 0&&(u=g(Y,be));const ce=_?g(Y,be):u;return ce.width=Y,ce.height=be,ce.getContext("2d").drawImage(T,0,0,Y,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+Y+"x"+be+")."),ce}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),T;return T}function m(T){return T.generateMipmaps}function p(T){i.generateMipmap(T)}function S(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(T,_,O,j,Z=!1){if(T!==null){if(i[T]!==void 0)return i[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Y=_;if(_===i.RED&&(O===i.FLOAT&&(Y=i.R32F),O===i.HALF_FLOAT&&(Y=i.R16F),O===i.UNSIGNED_BYTE&&(Y=i.R8)),_===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(Y=i.R8UI),O===i.UNSIGNED_SHORT&&(Y=i.R16UI),O===i.UNSIGNED_INT&&(Y=i.R32UI),O===i.BYTE&&(Y=i.R8I),O===i.SHORT&&(Y=i.R16I),O===i.INT&&(Y=i.R32I)),_===i.RG&&(O===i.FLOAT&&(Y=i.RG32F),O===i.HALF_FLOAT&&(Y=i.RG16F),O===i.UNSIGNED_BYTE&&(Y=i.RG8)),_===i.RG_INTEGER&&(O===i.UNSIGNED_BYTE&&(Y=i.RG8UI),O===i.UNSIGNED_SHORT&&(Y=i.RG16UI),O===i.UNSIGNED_INT&&(Y=i.RG32UI),O===i.BYTE&&(Y=i.RG8I),O===i.SHORT&&(Y=i.RG16I),O===i.INT&&(Y=i.RG32I)),_===i.RGB_INTEGER&&(O===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),O===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),O===i.UNSIGNED_INT&&(Y=i.RGB32UI),O===i.BYTE&&(Y=i.RGB8I),O===i.SHORT&&(Y=i.RGB16I),O===i.INT&&(Y=i.RGB32I)),_===i.RGBA_INTEGER&&(O===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),O===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),O===i.UNSIGNED_INT&&(Y=i.RGBA32UI),O===i.BYTE&&(Y=i.RGBA8I),O===i.SHORT&&(Y=i.RGBA16I),O===i.INT&&(Y=i.RGBA32I)),_===i.RGB&&O===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),_===i.RGBA){const be=Z?io:Xe.getTransfer(j);O===i.FLOAT&&(Y=i.RGBA32F),O===i.HALF_FLOAT&&(Y=i.RGBA16F),O===i.UNSIGNED_BYTE&&(Y=be===ot?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function v(T,_){let O;return T?_===null||_===Fi||_===ds?O=i.DEPTH24_STENCIL8:_===bn?O=i.DEPTH32F_STENCIL8:_===nr&&(O=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Fi||_===ds?O=i.DEPTH_COMPONENT24:_===bn?O=i.DEPTH_COMPONENT32F:_===nr&&(O=i.DEPTH_COMPONENT16),O}function I(T,_){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==zt&&T.minFilter!==Qt?Math.log2(Math.max(_.width,_.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?_.mipmaps.length:1}function E(T){const _=T.target;_.removeEventListener("dispose",E),L(_),_.isVideoTexture&&d.delete(_)}function A(T){const _=T.target;_.removeEventListener("dispose",A),M(_)}function L(T){const _=n.get(T);if(_.__webglInit===void 0)return;const O=T.source,j=h.get(O);if(j){const Z=j[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&w(T),Object.keys(j).length===0&&h.delete(O)}n.remove(T)}function w(T){const _=n.get(T);i.deleteTexture(_.__webglTexture);const O=T.source,j=h.get(O);delete j[_.__cacheKey],o.memory.textures--}function M(T){const _=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(_.__webglFramebuffer[j]))for(let Z=0;Z<_.__webglFramebuffer[j].length;Z++)i.deleteFramebuffer(_.__webglFramebuffer[j][Z]);else i.deleteFramebuffer(_.__webglFramebuffer[j]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[j])}else{if(Array.isArray(_.__webglFramebuffer))for(let j=0;j<_.__webglFramebuffer.length;j++)i.deleteFramebuffer(_.__webglFramebuffer[j]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let j=0;j<_.__webglColorRenderbuffer.length;j++)_.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[j]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const O=T.textures;for(let j=0,Z=O.length;j<Z;j++){const Y=n.get(O[j]);Y.__webglTexture&&(i.deleteTexture(Y.__webglTexture),o.memory.textures--),n.remove(O[j])}n.remove(T)}let P=0;function H(){P=0}function z(){const T=P;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),P+=1,T}function W(T){const _=[];return _.push(T.wrapS),_.push(T.wrapT),_.push(T.wrapR||0),_.push(T.magFilter),_.push(T.minFilter),_.push(T.anisotropy),_.push(T.internalFormat),_.push(T.format),_.push(T.type),_.push(T.generateMipmaps),_.push(T.premultiplyAlpha),_.push(T.flipY),_.push(T.unpackAlignment),_.push(T.colorSpace),_.join()}function K(T,_){const O=n.get(T);if(T.isVideoTexture&&Ee(T),T.isRenderTargetTexture===!1&&T.version>0&&O.__version!==T.version){const j=T.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{q(O,T,_);return}}t.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+_)}function X(T,_){const O=n.get(T);if(T.version>0&&O.__version!==T.version){q(O,T,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+_)}function ne(T,_){const O=n.get(T);if(T.version>0&&O.__version!==T.version){q(O,T,_);return}t.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+_)}function V(T,_){const O=n.get(T);if(T.version>0&&O.__version!==T.version){ie(O,T,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+_)}const ae={[cs]:i.REPEAT,[mi]:i.CLAMP_TO_EDGE,[Kr]:i.MIRRORED_REPEAT},fe={[zt]:i.NEAREST,[ed]:i.NEAREST_MIPMAP_NEAREST,[tr]:i.NEAREST_MIPMAP_LINEAR,[Qt]:i.LINEAR,[Zr]:i.LINEAR_MIPMAP_NEAREST,[jn]:i.LINEAR_MIPMAP_LINEAR},Se={[Pp]:i.NEVER,[Fp]:i.ALWAYS,[Ip]:i.LESS,[md]:i.LEQUAL,[Lp]:i.EQUAL,[Np]:i.GEQUAL,[Dp]:i.GREATER,[Up]:i.NOTEQUAL};function Ve(T,_){if(_.type===bn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===Qt||_.magFilter===Zr||_.magFilter===tr||_.magFilter===jn||_.minFilter===Qt||_.minFilter===Zr||_.minFilter===tr||_.minFilter===jn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,ae[_.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,ae[_.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,ae[_.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,fe[_.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,fe[_.minFilter]),_.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,Se[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===zt||_.minFilter!==tr&&_.minFilter!==jn||_.type===bn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const O=e.get("EXT_texture_filter_anisotropic");i.texParameterf(T,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function dt(T,_){let O=!1;T.__webglInit===void 0&&(T.__webglInit=!0,_.addEventListener("dispose",E));const j=_.source;let Z=h.get(j);Z===void 0&&(Z={},h.set(j,Z));const Y=W(_);if(Y!==T.__cacheKey){Z[Y]===void 0&&(Z[Y]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,O=!0),Z[Y].usedTimes++;const be=Z[T.__cacheKey];be!==void 0&&(Z[T.__cacheKey].usedTimes--,be.usedTimes===0&&w(_)),T.__cacheKey=Y,T.__webglTexture=Z[Y].texture}return O}function q(T,_,O){let j=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(j=i.TEXTURE_3D);const Z=dt(T,_),Y=_.source;t.bindTexture(j,T.__webglTexture,i.TEXTURE0+O);const be=n.get(Y);if(Y.version!==be.__version||Z===!0){t.activeTexture(i.TEXTURE0+O);const ce=Xe.getPrimaries(Xe.workingColorSpace),pe=_.colorSpace===gi?null:Xe.getPrimaries(_.colorSpace),Ke=_.colorSpace===gi||ce===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ke);let ee=x(_.image,!1,s.maxTextureSize);ee=ft(_,ee);const me=r.convert(_.format,_.colorSpace),Ae=r.convert(_.type);let Pe=b(_.internalFormat,me,Ae,_.colorSpace,_.isVideoTexture);Ve(j,_);let ge;const je=_.mipmaps,Be=_.isVideoTexture!==!0,ut=be.__version===void 0||Z===!0,D=Y.dataReady,oe=I(_,ee);if(_.isDepthTexture)Pe=v(_.format===hs,_.type),ut&&(Be?t.texStorage2D(i.TEXTURE_2D,1,Pe,ee.width,ee.height):t.texImage2D(i.TEXTURE_2D,0,Pe,ee.width,ee.height,0,me,Ae,null));else if(_.isDataTexture)if(je.length>0){Be&&ut&&t.texStorage2D(i.TEXTURE_2D,oe,Pe,je[0].width,je[0].height);for(let G=0,$=je.length;G<$;G++)ge=je[G],Be?D&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,Ae,ge.data):t.texImage2D(i.TEXTURE_2D,G,Pe,ge.width,ge.height,0,me,Ae,ge.data);_.generateMipmaps=!1}else Be?(ut&&t.texStorage2D(i.TEXTURE_2D,oe,Pe,ee.width,ee.height),D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ee.width,ee.height,me,Ae,ee.data)):t.texImage2D(i.TEXTURE_2D,0,Pe,ee.width,ee.height,0,me,Ae,ee.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Be&&ut&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,Pe,je[0].width,je[0].height,ee.depth);for(let G=0,$=je.length;G<$;G++)if(ge=je[G],_.format!==fn)if(me!==null)if(Be){if(D)if(_.layerUpdates.size>0){const he=Su(ge.width,ge.height,_.format,_.type);for(const de of _.layerUpdates){const Ne=ge.data.subarray(de*he/ge.data.BYTES_PER_ELEMENT,(de+1)*he/ge.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,de,ge.width,ge.height,1,me,Ne)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,0,ge.width,ge.height,ee.depth,me,ge.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,G,Pe,ge.width,ge.height,ee.depth,0,ge.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Be?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,G,0,0,0,ge.width,ge.height,ee.depth,me,Ae,ge.data):t.texImage3D(i.TEXTURE_2D_ARRAY,G,Pe,ge.width,ge.height,ee.depth,0,me,Ae,ge.data)}else{Be&&ut&&t.texStorage2D(i.TEXTURE_2D,oe,Pe,je[0].width,je[0].height);for(let G=0,$=je.length;G<$;G++)ge=je[G],_.format!==fn?me!==null?Be?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,ge.data):t.compressedTexImage2D(i.TEXTURE_2D,G,Pe,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Be?D&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,ge.width,ge.height,me,Ae,ge.data):t.texImage2D(i.TEXTURE_2D,G,Pe,ge.width,ge.height,0,me,Ae,ge.data)}else if(_.isDataArrayTexture)if(Be){if(ut&&t.texStorage3D(i.TEXTURE_2D_ARRAY,oe,Pe,ee.width,ee.height,ee.depth),D)if(_.layerUpdates.size>0){const G=Su(ee.width,ee.height,_.format,_.type);for(const $ of _.layerUpdates){const he=ee.data.subarray($*G/ee.data.BYTES_PER_ELEMENT,($+1)*G/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,$,ee.width,ee.height,1,me,Ae,he)}_.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,me,Ae,ee.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Pe,ee.width,ee.height,ee.depth,0,me,Ae,ee.data);else if(_.isData3DTexture)Be?(ut&&t.texStorage3D(i.TEXTURE_3D,oe,Pe,ee.width,ee.height,ee.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,me,Ae,ee.data)):t.texImage3D(i.TEXTURE_3D,0,Pe,ee.width,ee.height,ee.depth,0,me,Ae,ee.data);else if(_.isFramebufferTexture){if(ut)if(Be)t.texStorage2D(i.TEXTURE_2D,oe,Pe,ee.width,ee.height);else{let G=ee.width,$=ee.height;for(let he=0;he<oe;he++)t.texImage2D(i.TEXTURE_2D,he,Pe,G,$,0,me,Ae,null),G>>=1,$>>=1}}else if(je.length>0){if(Be&&ut){const G=Te(je[0]);t.texStorage2D(i.TEXTURE_2D,oe,Pe,G.width,G.height)}for(let G=0,$=je.length;G<$;G++)ge=je[G],Be?D&&t.texSubImage2D(i.TEXTURE_2D,G,0,0,me,Ae,ge):t.texImage2D(i.TEXTURE_2D,G,Pe,me,Ae,ge);_.generateMipmaps=!1}else if(Be){if(ut){const G=Te(ee);t.texStorage2D(i.TEXTURE_2D,oe,Pe,G.width,G.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,Ae,ee)}else t.texImage2D(i.TEXTURE_2D,0,Pe,me,Ae,ee);m(_)&&p(j),be.__version=Y.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ie(T,_,O){if(_.image.length!==6)return;const j=dt(T,_),Z=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+O);const Y=n.get(Z);if(Z.version!==Y.__version||j===!0){t.activeTexture(i.TEXTURE0+O);const be=Xe.getPrimaries(Xe.workingColorSpace),ce=_.colorSpace===gi?null:Xe.getPrimaries(_.colorSpace),pe=_.colorSpace===gi||be===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);const Ke=_.isCompressedTexture||_.image[0].isCompressedTexture,ee=_.image[0]&&_.image[0].isDataTexture,me=[];for(let $=0;$<6;$++)!Ke&&!ee?me[$]=x(_.image[$],!0,s.maxCubemapSize):me[$]=ee?_.image[$].image:_.image[$],me[$]=ft(_,me[$]);const Ae=me[0],Pe=r.convert(_.format,_.colorSpace),ge=r.convert(_.type),je=b(_.internalFormat,Pe,ge,_.colorSpace),Be=_.isVideoTexture!==!0,ut=Y.__version===void 0||j===!0,D=Z.dataReady;let oe=I(_,Ae);Ve(i.TEXTURE_CUBE_MAP,_);let G;if(Ke){Be&&ut&&t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,je,Ae.width,Ae.height);for(let $=0;$<6;$++){G=me[$].mipmaps;for(let he=0;he<G.length;he++){const de=G[he];_.format!==fn?Pe!==null?Be?D&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,0,0,de.width,de.height,Pe,de.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,je,de.width,de.height,0,de.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Be?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,0,0,de.width,de.height,Pe,ge,de.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he,je,de.width,de.height,0,Pe,ge,de.data)}}}else{if(G=_.mipmaps,Be&&ut){G.length>0&&oe++;const $=Te(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,oe,je,$.width,$.height)}for(let $=0;$<6;$++)if(ee){Be?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,me[$].width,me[$].height,Pe,ge,me[$].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,je,me[$].width,me[$].height,0,Pe,ge,me[$].data);for(let he=0;he<G.length;he++){const Ne=G[he].image[$].image;Be?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,0,0,Ne.width,Ne.height,Pe,ge,Ne.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,je,Ne.width,Ne.height,0,Pe,ge,Ne.data)}}else{Be?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,0,0,Pe,ge,me[$]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0,je,Pe,ge,me[$]);for(let he=0;he<G.length;he++){const de=G[he];Be?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,0,0,Pe,ge,de.image[$]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+$,he+1,je,Pe,ge,de.image[$])}}}m(_)&&p(i.TEXTURE_CUBE_MAP),Y.__version=Z.version,_.onUpdate&&_.onUpdate(_)}T.__version=_.version}function ye(T,_,O,j,Z,Y){const be=r.convert(O.format,O.colorSpace),ce=r.convert(O.type),pe=b(O.internalFormat,be,ce,O.colorSpace),Ke=n.get(_),ee=n.get(O);if(ee.__renderTarget=_,!Ke.__hasExternalTextures){const me=Math.max(1,_.width>>Y),Ae=Math.max(1,_.height>>Y);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,Y,pe,me,Ae,_.depth,0,be,ce,null):t.texImage2D(Z,Y,pe,me,Ae,0,be,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,T),qe(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,Z,ee.__webglTexture,0,Ye(_)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,Z,ee.__webglTexture,Y),t.bindFramebuffer(i.FRAMEBUFFER,null)}function le(T,_,O){if(i.bindRenderbuffer(i.RENDERBUFFER,T),_.depthBuffer){const j=_.depthTexture,Z=j&&j.isDepthTexture?j.type:null,Y=v(_.stencilBuffer,Z),be=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=Ye(_);qe(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce,Y,_.width,_.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,Y,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Y,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,be,i.RENDERBUFFER,T)}else{const j=_.textures;for(let Z=0;Z<j.length;Z++){const Y=j[Z],be=r.convert(Y.format,Y.colorSpace),ce=r.convert(Y.type),pe=b(Y.internalFormat,be,ce,Y.colorSpace),Ke=Ye(_);O&&qe(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ke,pe,_.width,_.height):qe(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ke,pe,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,pe,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Re(T,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,T),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const j=n.get(_.depthTexture);j.__renderTarget=_,(!j.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),K(_.depthTexture,0);const Z=j.__webglTexture,Y=Ye(_);if(_.depthTexture.format===us)qe(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,Z,0);else if(_.depthTexture.format===hs)qe(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function De(T){const _=n.get(T),O=T.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==T.depthTexture){const j=T.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),j){const Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,j.removeEventListener("dispose",Z)};j.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=j}if(T.depthTexture&&!_.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");Re(_.__webglFramebuffer,T)}else if(O){_.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[j]),_.__webglDepthbuffer[j]===void 0)_.__webglDepthbuffer[j]=i.createRenderbuffer(),le(_.__webglDepthbuffer[j],T,!1);else{const Z=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Y=_.__webglDepthbuffer[j];i.bindRenderbuffer(i.RENDERBUFFER,Y),i.framebufferRenderbuffer(i.FRAMEBUFFER,Z,i.RENDERBUFFER,Y)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),le(_.__webglDepthbuffer,T,!1);else{const j=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,Z)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function We(T,_,O){const j=n.get(T);_!==void 0&&ye(j.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&De(T)}function xt(T){const _=T.texture,O=n.get(T),j=n.get(_);T.addEventListener("dispose",A);const Z=T.textures,Y=T.isWebGLCubeRenderTarget===!0,be=Z.length>1;if(be||(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=_.version,o.memory.textures++),Y){O.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer[ce]=[];for(let pe=0;pe<_.mipmaps.length;pe++)O.__webglFramebuffer[ce][pe]=i.createFramebuffer()}else O.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer=[];for(let ce=0;ce<_.mipmaps.length;ce++)O.__webglFramebuffer[ce]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(be)for(let ce=0,pe=Z.length;ce<pe;ce++){const Ke=n.get(Z[ce]);Ke.__webglTexture===void 0&&(Ke.__webglTexture=i.createTexture(),o.memory.textures++)}if(T.samples>0&&qe(T)===!1){O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let ce=0;ce<Z.length;ce++){const pe=Z[ce];O.__webglColorRenderbuffer[ce]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[ce]);const Ke=r.convert(pe.format,pe.colorSpace),ee=r.convert(pe.type),me=b(pe.internalFormat,Ke,ee,pe.colorSpace,T.isXRRenderTarget===!0),Ae=Ye(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ae,me,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,O.__webglColorRenderbuffer[ce])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),le(O.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Y){t.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),Ve(i.TEXTURE_CUBE_MAP,_);for(let ce=0;ce<6;ce++)if(_.mipmaps&&_.mipmaps.length>0)for(let pe=0;pe<_.mipmaps.length;pe++)ye(O.__webglFramebuffer[ce][pe],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,pe);else ye(O.__webglFramebuffer[ce],T,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(_)&&p(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let ce=0,pe=Z.length;ce<pe;ce++){const Ke=Z[ce],ee=n.get(Ke);t.bindTexture(i.TEXTURE_2D,ee.__webglTexture),Ve(i.TEXTURE_2D,Ke),ye(O.__webglFramebuffer,T,Ke,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,0),m(Ke)&&p(i.TEXTURE_2D)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ce=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ce,j.__webglTexture),Ve(ce,_),_.mipmaps&&_.mipmaps.length>0)for(let pe=0;pe<_.mipmaps.length;pe++)ye(O.__webglFramebuffer[pe],T,_,i.COLOR_ATTACHMENT0,ce,pe);else ye(O.__webglFramebuffer,T,_,i.COLOR_ATTACHMENT0,ce,0);m(_)&&p(ce),t.unbindTexture()}T.depthBuffer&&De(T)}function $e(T){const _=T.textures;for(let O=0,j=_.length;O<j;O++){const Z=_[O];if(m(Z)){const Y=S(T),be=n.get(Z).__webglTexture;t.bindTexture(Y,be),p(Y),t.unbindTexture()}}}const bt=[],F=[];function vn(T){if(T.samples>0){if(qe(T)===!1){const _=T.textures,O=T.width,j=T.height;let Z=i.COLOR_BUFFER_BIT;const Y=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,be=n.get(T),ce=_.length>1;if(ce)for(let pe=0;pe<_.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let pe=0;pe<_.length;pe++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),ce){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,be.__webglColorRenderbuffer[pe]);const Ke=n.get(_[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ke,0)}i.blitFramebuffer(0,0,O,j,0,0,O,j,Z,i.NEAREST),l===!0&&(bt.length=0,F.length=0,bt.push(i.COLOR_ATTACHMENT0+pe),T.depthBuffer&&T.resolveDepthBuffer===!1&&(bt.push(Y),F.push(Y),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,F)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,bt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ce)for(let pe=0;pe<_.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,be.__webglColorRenderbuffer[pe]);const Ke=n.get(_[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,Ke,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const _=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function Ye(T){return Math.min(s.maxSamples,T.samples)}function qe(T){const _=n.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function Ee(T){const _=o.render.frame;d.get(T)!==_&&(d.set(T,_),T.update())}function ft(T,_){const O=T.colorSpace,j=T.format,Z=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||O!==Ht&&O!==gi&&(Xe.getTransfer(O)===ot?(j!==fn||Z!==$n)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),_}function Te(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(c.width=T.naturalWidth||T.width,c.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(c.width=T.displayWidth,c.height=T.displayHeight):(c.width=T.width,c.height=T.height),c}this.allocateTextureUnit=z,this.resetTextureUnits=H,this.setTexture2D=K,this.setTexture2DArray=X,this.setTexture3D=ne,this.setTextureCube=V,this.rebindTextures=We,this.setupRenderTarget=xt,this.updateRenderTargetMipmap=$e,this.updateMultisampleRenderTarget=vn,this.setupDepthRenderbuffer=De,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=qe}function yv(i,e){function t(n,s=gi){let r;const o=Xe.getTransfer(s);if(n===$n)return i.UNSIGNED_BYTE;if(n===Aa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ra)return i.UNSIGNED_SHORT_5_5_5_1;if(n===id)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===td)return i.BYTE;if(n===nd)return i.SHORT;if(n===nr)return i.UNSIGNED_SHORT;if(n===Ea)return i.INT;if(n===Fi)return i.UNSIGNED_INT;if(n===bn)return i.FLOAT;if(n===Kn)return i.HALF_FLOAT;if(n===sd)return i.ALPHA;if(n===rd)return i.RGB;if(n===fn)return i.RGBA;if(n===od)return i.LUMINANCE;if(n===ad)return i.LUMINANCE_ALPHA;if(n===us)return i.DEPTH_COMPONENT;if(n===hs)return i.DEPTH_STENCIL;if(n===Ca)return i.RED;if(n===Pa)return i.RED_INTEGER;if(n===ld)return i.RG;if(n===Ia)return i.RG_INTEGER;if(n===La)return i.RGBA_INTEGER;if(n===Jr||n===Qr||n===eo||n===to)if(o===ot)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Jr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===to)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Jr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Qr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===eo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===to)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Da||n===Ua||n===Na||n===Fa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Da)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ua)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Na)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Fa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Oa||n===ka||n===Ba)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Oa||n===ka)return o===ot?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ba)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===za||n===Ha||n===Ga||n===Va||n===Wa||n===Xa||n===Ya||n===qa||n===ja||n===$a||n===Ka||n===Za||n===Ja||n===Qa)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===za)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ha)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ga)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Va)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Wa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Xa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ya)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===qa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ja)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===$a)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ka)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Za)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ja)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Qa)return o===ot?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===no||n===el||n===tl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===no)return o===ot?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===el)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===tl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===cd||n===nl||n===il||n===sl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===no)return r.COMPRESSED_RED_RGTC1_EXT;if(n===nl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===il)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===sl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ds?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}class bv extends qt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Tt extends at{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Mv={type:"move"};class zl{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Tt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Tt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Tt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const x of e.hand.values()){const m=t.getJointPose(x,n),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const d=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],h=d.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&h>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Mv)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Tt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Sv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,wv=`
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

}`;class Tv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){const s=new Et,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Rt({vertexShader:Sv,fragmentShader:wv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ce(new nn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Ev extends ps{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,d=null,u=null,h=null,f=null,g=null;const x=new Tv,m=t.getContextAttributes();let p=null,S=null;const b=[],v=[],I=new we;let E=null;const A=new qt;A.viewport=new Je;const L=new qt;L.viewport=new Je;const w=[A,L],M=new bv;let P=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let ie=b[q];return ie===void 0&&(ie=new zl,b[q]=ie),ie.getTargetRaySpace()},this.getControllerGrip=function(q){let ie=b[q];return ie===void 0&&(ie=new zl,b[q]=ie),ie.getGripSpace()},this.getHand=function(q){let ie=b[q];return ie===void 0&&(ie=new zl,b[q]=ie),ie.getHandSpace()};function z(q){const ie=v.indexOf(q.inputSource);if(ie===-1)return;const ye=b[ie];ye!==void 0&&(ye.update(q.inputSource,q.frame,c||o),ye.dispatchEvent({type:q.type,data:q.inputSource}))}function W(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",W),s.removeEventListener("inputsourceschange",K);for(let q=0;q<b.length;q++){const ie=v[q];ie!==null&&(v[q]=null,b[q].disconnect(ie))}P=null,H=null,x.reset(),e.setRenderTarget(p),f=null,h=null,u=null,s=null,S=null,dt.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(p=e.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",W),s.addEventListener("inputsourceschange",K),m.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(I),s.renderState.layers===void 0){const ie={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ie),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),S=new wn(f.framebufferWidth,f.framebufferHeight,{format:fn,type:$n,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ie=null,ye=null,le=null;m.depth&&(le=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ie=m.stencil?hs:us,ye=m.stencil?ds:Fi);const Re={colorFormat:t.RGBA8,depthFormat:le,scaleFactor:r};u=new XRWebGLBinding(s,t),h=u.createProjectionLayer(Re),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),S=new wn(h.textureWidth,h.textureHeight,{format:fn,type:$n,depthTexture:new tu(h.textureWidth,h.textureHeight,ye,void 0,void 0,void 0,void 0,void 0,void 0,ie),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),dt.setContext(s),dt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function K(q){for(let ie=0;ie<q.removed.length;ie++){const ye=q.removed[ie],le=v.indexOf(ye);le>=0&&(v[le]=null,b[le].disconnect(ye))}for(let ie=0;ie<q.added.length;ie++){const ye=q.added[ie];let le=v.indexOf(ye);if(le===-1){for(let De=0;De<b.length;De++)if(De>=v.length){v.push(ye),le=De;break}else if(v[De]===null){v[De]=ye,le=De;break}if(le===-1)break}const Re=b[le];Re&&Re.connect(ye)}}const X=new R,ne=new R;function V(q,ie,ye){X.setFromMatrixPosition(ie.matrixWorld),ne.setFromMatrixPosition(ye.matrixWorld);const le=X.distanceTo(ne),Re=ie.projectionMatrix.elements,De=ye.projectionMatrix.elements,We=Re[14]/(Re[10]-1),xt=Re[14]/(Re[10]+1),$e=(Re[9]+1)/Re[5],bt=(Re[9]-1)/Re[5],F=(Re[8]-1)/Re[0],vn=(De[8]+1)/De[0],Ye=We*F,qe=We*vn,Ee=le/(-F+vn),ft=Ee*-F;if(ie.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(ft),q.translateZ(Ee),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Re[10]===-1)q.projectionMatrix.copy(ie.projectionMatrix),q.projectionMatrixInverse.copy(ie.projectionMatrixInverse);else{const Te=We+Ee,T=xt+Ee,_=Ye-ft,O=qe+(le-ft),j=$e*xt/T*Te,Z=bt*xt/T*Te;q.projectionMatrix.makePerspective(_,O,j,Z,Te,T),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function ae(q,ie){ie===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(ie.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let ie=q.near,ye=q.far;x.texture!==null&&(x.depthNear>0&&(ie=x.depthNear),x.depthFar>0&&(ye=x.depthFar)),M.near=L.near=A.near=ie,M.far=L.far=A.far=ye,(P!==M.near||H!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),P=M.near,H=M.far),A.layers.mask=q.layers.mask|2,L.layers.mask=q.layers.mask|4,M.layers.mask=A.layers.mask|L.layers.mask;const le=q.parent,Re=M.cameras;ae(M,le);for(let De=0;De<Re.length;De++)ae(Re[De],le);Re.length===2?V(M,A,L):M.projectionMatrix.copy(A.projectionMatrix),fe(q,M,le)};function fe(q,ie,ye){ye===null?q.matrix.copy(ie.matrixWorld):(q.matrix.copy(ye.matrixWorld),q.matrix.invert(),q.matrix.multiply(ie.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(ie.projectionMatrix),q.projectionMatrixInverse.copy(ie.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=ms*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(q){l=q,h!==null&&(h.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(M)};let Se=null;function Ve(q,ie){if(d=ie.getViewerPose(c||o),g=ie,d!==null){const ye=d.views;f!==null&&(e.setRenderTargetFramebuffer(S,f.framebuffer),e.setRenderTarget(S));let le=!1;ye.length!==M.cameras.length&&(M.cameras.length=0,le=!0);for(let De=0;De<ye.length;De++){const We=ye[De];let xt=null;if(f!==null)xt=f.getViewport(We);else{const bt=u.getViewSubImage(h,We);xt=bt.viewport,De===0&&(e.setRenderTargetTextures(S,bt.colorTexture,h.ignoreDepthValues?void 0:bt.depthStencilTexture),e.setRenderTarget(S))}let $e=w[De];$e===void 0&&($e=new qt,$e.layers.enable(De),$e.viewport=new Je,w[De]=$e),$e.matrix.fromArray(We.transform.matrix),$e.matrix.decompose($e.position,$e.quaternion,$e.scale),$e.projectionMatrix.fromArray(We.projectionMatrix),$e.projectionMatrixInverse.copy($e.projectionMatrix).invert(),$e.viewport.set(xt.x,xt.y,xt.width,xt.height),De===0&&(M.matrix.copy($e.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),le===!0&&M.cameras.push($e)}const Re=s.enabledFeatures;if(Re&&Re.includes("depth-sensing")){const De=u.getDepthInformation(ye[0]);De&&De.isValid&&De.texture&&x.init(e,De,s.renderState)}}for(let ye=0;ye<b.length;ye++){const le=v[ye],Re=b[ye];le!==null&&Re!==void 0&&Re.update(le,ie,c||o)}Se&&Se(q,ie),ie.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ie}),g=null}const dt=new qd;dt.setAnimationLoop(Ve),this.setAnimationLoop=function(q){Se=q},this.dispose=function(){}}}const Wi=new An,Av=new Ie;function Rv(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Gd(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,S,b,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),d(m,p)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,S,b):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Bt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Bt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const S=e.get(p),b=S.envMap,v=S.envMapRotation;b&&(m.envMap.value=b,Wi.copy(v),Wi.x*=-1,Wi.y*=-1,Wi.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(Wi.y*=-1,Wi.z*=-1),m.envMapRotation.value.setFromMatrix4(Av.makeRotationFromEuler(Wi)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,S,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*S,m.scale.value=b*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function d(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,S){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Bt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){const S=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Cv(i,e,t,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,b){const v=b.program;n.uniformBlockBinding(S,v)}function c(S,b){let v=s[S.id];v===void 0&&(g(S),v=d(S),s[S.id]=v,S.addEventListener("dispose",m));const I=b.program;n.updateUBOMapping(S,I);const E=e.render.frame;r[S.id]!==E&&(h(S),r[S.id]=E)}function d(S){const b=u();S.__bindingPointIndex=b;const v=i.createBuffer(),I=S.__size,E=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,I,E),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,b,v),v}function u(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(S){const b=s[S.id],v=S.uniforms,I=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,b);for(let E=0,A=v.length;E<A;E++){const L=Array.isArray(v[E])?v[E]:[v[E]];for(let w=0,M=L.length;w<M;w++){const P=L[w];if(f(P,E,w,I)===!0){const H=P.__offset,z=Array.isArray(P.value)?P.value:[P.value];let W=0;for(let K=0;K<z.length;K++){const X=z[K],ne=x(X);typeof X=="number"||typeof X=="boolean"?(P.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,H+W,P.__data)):X.isMatrix3?(P.__data[0]=X.elements[0],P.__data[1]=X.elements[1],P.__data[2]=X.elements[2],P.__data[3]=0,P.__data[4]=X.elements[3],P.__data[5]=X.elements[4],P.__data[6]=X.elements[5],P.__data[7]=0,P.__data[8]=X.elements[6],P.__data[9]=X.elements[7],P.__data[10]=X.elements[8],P.__data[11]=0):(X.toArray(P.__data,W),W+=ne.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,H,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(S,b,v,I){const E=S.value,A=b+"_"+v;if(I[A]===void 0)return typeof E=="number"||typeof E=="boolean"?I[A]=E:I[A]=E.clone(),!0;{const L=I[A];if(typeof E=="number"||typeof E=="boolean"){if(L!==E)return I[A]=E,!0}else if(L.equals(E)===!1)return L.copy(E),!0}return!1}function g(S){const b=S.uniforms;let v=0;const I=16;for(let A=0,L=b.length;A<L;A++){const w=Array.isArray(b[A])?b[A]:[b[A]];for(let M=0,P=w.length;M<P;M++){const H=w[M],z=Array.isArray(H.value)?H.value:[H.value];for(let W=0,K=z.length;W<K;W++){const X=z[W],ne=x(X),V=v%I,ae=V%ne.boundary,fe=V+ae;v+=ae,fe!==0&&I-fe<ne.storage&&(v+=I-fe),H.__data=new Float32Array(ne.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=v,v+=ne.storage}}}const E=v%I;return E>0&&(v+=I-E),S.__size=v,S.__cache={},this}function x(S){const b={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(b.boundary=4,b.storage=4):S.isVector2?(b.boundary=8,b.storage=8):S.isVector3||S.isColor?(b.boundary=16,b.storage=12):S.isVector4?(b.boundary=16,b.storage=16):S.isMatrix3?(b.boundary=48,b.storage=48):S.isMatrix4?(b.boundary=64,b.storage=64):S.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",S),b}function m(S){const b=S.target;b.removeEventListener("dispose",m);const v=o.indexOf(b.__bindingPointIndex);o.splice(v,1),i.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function p(){for(const S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}class Pv{constructor(e={}){const{canvas:t=Qp(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:h=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),x=new Int32Array(4);let m=null,p=null;const S=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=It,this.toneMapping=pi,this.toneMappingExposure=1;const v=this;let I=!1,E=0,A=0,L=null,w=-1,M=null;const P=new Je,H=new Je;let z=null;const W=new se(0);let K=0,X=t.width,ne=t.height,V=1,ae=null,fe=null;const Se=new Je(0,0,X,ne),Ve=new Je(0,0,X,ne);let dt=!1;const q=new Il;let ie=!1,ye=!1;const le=new Ie,Re=new Ie,De=new R,We=new Je,xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let $e=!1;function bt(){return L===null?V:1}let F=n;function vn(y,U){return t.getContext(y,U)}try{const y={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${yn}`),t.addEventListener("webglcontextlost",$,!1),t.addEventListener("webglcontextrestored",he,!1),t.addEventListener("webglcontextcreationerror",de,!1),F===null){const U="webgl2";if(F=vn(U,y),F===null)throw vn(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(y){throw console.error("THREE.WebGLRenderer: "+y.message),y}let Ye,qe,Ee,ft,Te,T,_,O,j,Z,Y,be,ce,pe,Ke,ee,me,Ae,Pe,ge,je,Be,ut,D;function oe(){Ye=new N0(F),Ye.init(),Be=new yv(F,Ye),qe=new C0(F,Ye,e,Be),Ee=new xv(F,Ye),qe.reverseDepthBuffer&&h&&Ee.buffers.depth.setReversed(!0),ft=new k0(F),Te=new nv,T=new _v(F,Ye,Ee,Te,qe,Be,ft),_=new I0(v),O=new U0(v),j=new Tm(F),ut=new A0(F,j),Z=new F0(F,j,ft,ut),Y=new z0(F,Z,j,ft),Pe=new B0(F,qe,T),ee=new P0(Te),be=new tv(v,_,O,Ye,qe,ut,ee),ce=new Rv(v,Te),pe=new sv,Ke=new dv(Ye),Ae=new E0(v,_,O,Ee,Y,f,l),me=new mv(v,Y,qe),D=new Cv(F,ft,qe,Ee),ge=new R0(F,Ye,ft),je=new O0(F,Ye,ft),ft.programs=be.programs,v.capabilities=qe,v.extensions=Ye,v.properties=Te,v.renderLists=pe,v.shadowMap=me,v.state=Ee,v.info=ft}oe();const G=new Ev(v,F);this.xr=G,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const y=Ye.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=Ye.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(y){y!==void 0&&(V=y,this.setSize(X,ne,!1))},this.getSize=function(y){return y.set(X,ne)},this.setSize=function(y,U,k=!0){if(G.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}X=y,ne=U,t.width=Math.floor(y*V),t.height=Math.floor(U*V),k===!0&&(t.style.width=y+"px",t.style.height=U+"px"),this.setViewport(0,0,y,U)},this.getDrawingBufferSize=function(y){return y.set(X*V,ne*V).floor()},this.setDrawingBufferSize=function(y,U,k){X=y,ne=U,V=k,t.width=Math.floor(y*k),t.height=Math.floor(U*k),this.setViewport(0,0,y,U)},this.getCurrentViewport=function(y){return y.copy(P)},this.getViewport=function(y){return y.copy(Se)},this.setViewport=function(y,U,k,B){y.isVector4?Se.set(y.x,y.y,y.z,y.w):Se.set(y,U,k,B),Ee.viewport(P.copy(Se).multiplyScalar(V).round())},this.getScissor=function(y){return y.copy(Ve)},this.setScissor=function(y,U,k,B){y.isVector4?Ve.set(y.x,y.y,y.z,y.w):Ve.set(y,U,k,B),Ee.scissor(H.copy(Ve).multiplyScalar(V).round())},this.getScissorTest=function(){return dt},this.setScissorTest=function(y){Ee.setScissorTest(dt=y)},this.setOpaqueSort=function(y){ae=y},this.setTransparentSort=function(y){fe=y},this.getClearColor=function(y){return y.copy(Ae.getClearColor())},this.setClearColor=function(){Ae.setClearColor.apply(Ae,arguments)},this.getClearAlpha=function(){return Ae.getClearAlpha()},this.setClearAlpha=function(){Ae.setClearAlpha.apply(Ae,arguments)},this.clear=function(y=!0,U=!0,k=!0){let B=0;if(y){let N=!1;if(L!==null){const te=L.texture.format;N=te===La||te===Ia||te===Pa}if(N){const te=L.texture.type,ue=te===$n||te===Fi||te===nr||te===ds||te===Aa||te===Ra,xe=Ae.getClearColor(),ve=Ae.getClearAlpha(),Le=xe.r,Fe=xe.g,_e=xe.b;ue?(g[0]=Le,g[1]=Fe,g[2]=_e,g[3]=ve,F.clearBufferuiv(F.COLOR,0,g)):(x[0]=Le,x[1]=Fe,x[2]=_e,x[3]=ve,F.clearBufferiv(F.COLOR,0,x))}else B|=F.COLOR_BUFFER_BIT}U&&(B|=F.DEPTH_BUFFER_BIT),k&&(B|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",$,!1),t.removeEventListener("webglcontextrestored",he,!1),t.removeEventListener("webglcontextcreationerror",de,!1),pe.dispose(),Ke.dispose(),Te.dispose(),_.dispose(),O.dispose(),Y.dispose(),ut.dispose(),D.dispose(),be.dispose(),G.dispose(),G.removeEventListener("sessionstart",Vf),G.removeEventListener("sessionend",Wf),is.stop()};function $(y){y.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),I=!0}function he(){console.log("THREE.WebGLRenderer: Context Restored."),I=!1;const y=ft.autoReset,U=me.enabled,k=me.autoUpdate,B=me.needsUpdate,N=me.type;oe(),ft.autoReset=y,me.enabled=U,me.autoUpdate=k,me.needsUpdate=B,me.type=N}function de(y){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function Ne(y){const U=y.target;U.removeEventListener("dispose",Ne),yt(U)}function yt(y){kt(y),Te.remove(y)}function kt(y){const U=Te.get(y).programs;U!==void 0&&(U.forEach(function(k){be.releaseProgram(k)}),y.isShaderMaterial&&be.releaseShaderCache(y))}this.renderBufferDirect=function(y,U,k,B,N,te){U===null&&(U=xt);const ue=N.isMesh&&N.matrixWorld.determinant()<0,xe=FM(y,U,k,B,N);Ee.setMaterial(B,ue);let ve=k.index,Le=1;if(B.wireframe===!0){if(ve=Z.getWireframeAttribute(k),ve===void 0)return;Le=2}const Fe=k.drawRange,_e=k.attributes.position;let Ze=Fe.start*Le,ht=(Fe.start+Fe.count)*Le;te!==null&&(Ze=Math.max(Ze,te.start*Le),ht=Math.min(ht,(te.start+te.count)*Le)),ve!==null?(Ze=Math.max(Ze,0),ht=Math.min(ht,ve.count)):_e!=null&&(Ze=Math.max(Ze,0),ht=Math.min(ht,_e.count));const pt=ht-Ze;if(pt<0||pt===1/0)return;ut.setup(N,B,xe,k,ve);let Jt,tt=ge;if(ve!==null&&(Jt=j.get(ve),tt=je,tt.setIndex(Jt)),N.isMesh)B.wireframe===!0?(Ee.setLineWidth(B.wireframeLinewidth*bt()),tt.setMode(F.LINES)):tt.setMode(F.TRIANGLES);else if(N.isLine){let Me=B.linewidth;Me===void 0&&(Me=1),Ee.setLineWidth(Me*bt()),N.isLineSegments?tt.setMode(F.LINES):N.isLineLoop?tt.setMode(F.LINE_LOOP):tt.setMode(F.LINE_STRIP)}else N.isPoints?tt.setMode(F.POINTS):N.isSprite&&tt.setMode(F.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)tt.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(Ye.get("WEBGL_multi_draw"))tt.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Me=N._multiDrawStarts,ui=N._multiDrawCounts,nt=N._multiDrawCount,Dn=ve?j.get(ve).bytesPerElement:1,er=Te.get(B).currentProgram.getUniforms();for(let hn=0;hn<nt;hn++)er.setValue(F,"_gl_DrawID",hn),tt.render(Me[hn]/Dn,ui[hn])}else if(N.isInstancedMesh)tt.renderInstances(Ze,pt,N.count);else if(k.isInstancedBufferGeometry){const Me=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,ui=Math.min(k.instanceCount,Me);tt.renderInstances(Ze,pt,ui)}else tt.render(Ze,pt)};function rt(y,U,k){y.transparent===!0&&y.side===ct&&y.forceSinglePass===!1?(y.side=Bt,y.needsUpdate=!0,ha(y,U,k),y.side=Yn,y.needsUpdate=!0,ha(y,U,k),y.side=ct):ha(y,U,k)}this.compile=function(y,U,k=null){k===null&&(k=y),p=Ke.get(k),p.init(U),b.push(p),k.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),y!==k&&y.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights();const B=new Set;return y.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const te=N.material;if(te)if(Array.isArray(te))for(let ue=0;ue<te.length;ue++){const xe=te[ue];rt(xe,k,N),B.add(xe)}else rt(te,k,N),B.add(te)}),b.pop(),p=null,B},this.compileAsync=function(y,U,k=null){const B=this.compile(y,U,k);return new Promise(N=>{function te(){if(B.forEach(function(ue){Te.get(ue).currentProgram.isReady()&&B.delete(ue)}),B.size===0){N(y);return}setTimeout(te,10)}Ye.get("KHR_parallel_shader_compile")!==null?te():setTimeout(te,10)})};let Ln=null;function di(y){Ln&&Ln(y)}function Vf(){is.stop()}function Wf(){is.start()}const is=new qd;is.setAnimationLoop(di),typeof self<"u"&&is.setContext(self),this.setAnimationLoop=function(y){Ln=y,G.setAnimationLoop(y),y===null?is.stop():is.start()},G.addEventListener("sessionstart",Vf),G.addEventListener("sessionend",Wf),this.render=function(y,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),G.enabled===!0&&G.isPresenting===!0&&(G.cameraAutoUpdate===!0&&G.updateCamera(U),U=G.getCamera()),y.isScene===!0&&y.onBeforeRender(v,y,U,L),p=Ke.get(y,b.length),p.init(U),b.push(p),Re.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),q.setFromProjectionMatrix(Re),ye=this.localClippingEnabled,ie=ee.init(this.clippingPlanes,ye),m=pe.get(y,S.length),m.init(),S.push(m),G.enabled===!0&&G.isPresenting===!0){const te=v.xr.getDepthSensingMesh();te!==null&&Yc(te,U,-1/0,v.sortObjects)}Yc(y,U,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(ae,fe),$e=G.enabled===!1||G.isPresenting===!1||G.hasDepthSensing()===!1,$e&&Ae.addToRenderList(m,y),this.info.render.frame++,ie===!0&&ee.beginShadows();const k=p.state.shadowsArray;me.render(k,y,U),ie===!0&&ee.endShadows(),this.info.autoReset===!0&&this.info.reset();const B=m.opaque,N=m.transmissive;if(p.setupLights(),U.isArrayCamera){const te=U.cameras;if(N.length>0)for(let ue=0,xe=te.length;ue<xe;ue++){const ve=te[ue];Yf(B,N,y,ve)}$e&&Ae.render(y);for(let ue=0,xe=te.length;ue<xe;ue++){const ve=te[ue];Xf(m,y,ve,ve.viewport)}}else N.length>0&&Yf(B,N,y,U),$e&&Ae.render(y),Xf(m,y,U);L!==null&&(T.updateMultisampleRenderTarget(L),T.updateRenderTargetMipmap(L)),y.isScene===!0&&y.onAfterRender(v,y,U),ut.resetDefaultState(),w=-1,M=null,b.pop(),b.length>0?(p=b[b.length-1],ie===!0&&ee.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,S.pop(),S.length>0?m=S[S.length-1]:m=null};function Yc(y,U,k,B){if(y.visible===!1)return;if(y.layers.test(U.layers)){if(y.isGroup)k=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(U);else if(y.isLight)p.pushLight(y),y.castShadow&&p.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||q.intersectsSprite(y)){B&&We.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Re);const ue=Y.update(y),xe=y.material;xe.visible&&m.push(y,ue,xe,k,We.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||q.intersectsObject(y))){const ue=Y.update(y),xe=y.material;if(B&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),We.copy(y.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),We.copy(ue.boundingSphere.center)),We.applyMatrix4(y.matrixWorld).applyMatrix4(Re)),Array.isArray(xe)){const ve=ue.groups;for(let Le=0,Fe=ve.length;Le<Fe;Le++){const _e=ve[Le],Ze=xe[_e.materialIndex];Ze&&Ze.visible&&m.push(y,ue,Ze,k,We.z,_e)}}else xe.visible&&m.push(y,ue,xe,k,We.z,null)}}const te=y.children;for(let ue=0,xe=te.length;ue<xe;ue++)Yc(te[ue],U,k,B)}function Xf(y,U,k,B){const N=y.opaque,te=y.transmissive,ue=y.transparent;p.setupLightsView(k),ie===!0&&ee.setGlobalState(v.clippingPlanes,k),B&&Ee.viewport(P.copy(B)),N.length>0&&ua(N,U,k),te.length>0&&ua(te,U,k),ue.length>0&&ua(ue,U,k),Ee.buffers.depth.setTest(!0),Ee.buffers.depth.setMask(!0),Ee.buffers.color.setMask(!0),Ee.setPolygonOffset(!1)}function Yf(y,U,k,B){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[B.id]===void 0&&(p.state.transmissionRenderTarget[B.id]=new wn(1,1,{generateMipmaps:!0,type:Ye.has("EXT_color_buffer_half_float")||Ye.has("EXT_color_buffer_float")?Kn:$n,minFilter:jn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Xe.workingColorSpace}));const te=p.state.transmissionRenderTarget[B.id],ue=B.viewport||P;te.setSize(ue.z,ue.w);const xe=v.getRenderTarget();v.setRenderTarget(te),v.getClearColor(W),K=v.getClearAlpha(),K<1&&v.setClearColor(16777215,.5),v.clear(),$e&&Ae.render(k);const ve=v.toneMapping;v.toneMapping=pi;const Le=B.viewport;if(B.viewport!==void 0&&(B.viewport=void 0),p.setupLightsView(B),ie===!0&&ee.setGlobalState(v.clippingPlanes,B),ua(y,k,B),T.updateMultisampleRenderTarget(te),T.updateRenderTargetMipmap(te),Ye.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let _e=0,Ze=U.length;_e<Ze;_e++){const ht=U[_e],pt=ht.object,Jt=ht.geometry,tt=ht.material,Me=ht.group;if(tt.side===ct&&pt.layers.test(B.layers)){const ui=tt.side;tt.side=Bt,tt.needsUpdate=!0,qf(pt,k,B,Jt,tt,Me),tt.side=ui,tt.needsUpdate=!0,Fe=!0}}Fe===!0&&(T.updateMultisampleRenderTarget(te),T.updateRenderTargetMipmap(te))}v.setRenderTarget(xe),v.setClearColor(W,K),Le!==void 0&&(B.viewport=Le),v.toneMapping=ve}function ua(y,U,k){const B=U.isScene===!0?U.overrideMaterial:null;for(let N=0,te=y.length;N<te;N++){const ue=y[N],xe=ue.object,ve=ue.geometry,Le=B===null?ue.material:B,Fe=ue.group;xe.layers.test(k.layers)&&qf(xe,U,k,ve,Le,Fe)}}function qf(y,U,k,B,N,te){y.onBeforeRender(v,U,k,B,N,te),y.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),N.onBeforeRender(v,U,k,B,y,te),N.transparent===!0&&N.side===ct&&N.forceSinglePass===!1?(N.side=Bt,N.needsUpdate=!0,v.renderBufferDirect(k,U,B,N,y,te),N.side=Yn,N.needsUpdate=!0,v.renderBufferDirect(k,U,B,N,y,te),N.side=ct):v.renderBufferDirect(k,U,B,N,y,te),y.onAfterRender(v,U,k,B,N,te)}function ha(y,U,k){U.isScene!==!0&&(U=xt);const B=Te.get(y),N=p.state.lights,te=p.state.shadowsArray,ue=N.state.version,xe=be.getParameters(y,N.state,te,U,k),ve=be.getProgramCacheKey(xe);let Le=B.programs;B.environment=y.isMeshStandardMaterial?U.environment:null,B.fog=U.fog,B.envMap=(y.isMeshStandardMaterial?O:_).get(y.envMap||B.environment),B.envMapRotation=B.environment!==null&&y.envMap===null?U.environmentRotation:y.envMapRotation,Le===void 0&&(y.addEventListener("dispose",Ne),Le=new Map,B.programs=Le);let Fe=Le.get(ve);if(Fe!==void 0){if(B.currentProgram===Fe&&B.lightsStateVersion===ue)return $f(y,xe),Fe}else xe.uniforms=be.getUniforms(y),y.onBeforeCompile(xe,v),Fe=be.acquireProgram(xe,ve),Le.set(ve,Fe),B.uniforms=xe.uniforms;const _e=B.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(_e.clippingPlanes=ee.uniform),$f(y,xe),B.needsLights=kM(y),B.lightsStateVersion=ue,B.needsLights&&(_e.ambientLightColor.value=N.state.ambient,_e.lightProbe.value=N.state.probe,_e.directionalLights.value=N.state.directional,_e.directionalLightShadows.value=N.state.directionalShadow,_e.spotLights.value=N.state.spot,_e.spotLightShadows.value=N.state.spotShadow,_e.rectAreaLights.value=N.state.rectArea,_e.ltc_1.value=N.state.rectAreaLTC1,_e.ltc_2.value=N.state.rectAreaLTC2,_e.pointLights.value=N.state.point,_e.pointLightShadows.value=N.state.pointShadow,_e.hemisphereLights.value=N.state.hemi,_e.directionalShadowMap.value=N.state.directionalShadowMap,_e.directionalShadowMatrix.value=N.state.directionalShadowMatrix,_e.spotShadowMap.value=N.state.spotShadowMap,_e.spotLightMatrix.value=N.state.spotLightMatrix,_e.spotLightMap.value=N.state.spotLightMap,_e.pointShadowMap.value=N.state.pointShadowMap,_e.pointShadowMatrix.value=N.state.pointShadowMatrix),B.currentProgram=Fe,B.uniformsList=null,Fe}function jf(y){if(y.uniformsList===null){const U=y.currentProgram.getUniforms();y.uniformsList=Ro.seqWithValue(U.seq,y.uniforms)}return y.uniformsList}function $f(y,U){const k=Te.get(y);k.outputColorSpace=U.outputColorSpace,k.batching=U.batching,k.batchingColor=U.batchingColor,k.instancing=U.instancing,k.instancingColor=U.instancingColor,k.instancingMorph=U.instancingMorph,k.skinning=U.skinning,k.morphTargets=U.morphTargets,k.morphNormals=U.morphNormals,k.morphColors=U.morphColors,k.morphTargetsCount=U.morphTargetsCount,k.numClippingPlanes=U.numClippingPlanes,k.numIntersection=U.numClipIntersection,k.vertexAlphas=U.vertexAlphas,k.vertexTangents=U.vertexTangents,k.toneMapping=U.toneMapping}function FM(y,U,k,B,N){U.isScene!==!0&&(U=xt),T.resetTextureUnits();const te=U.fog,ue=B.isMeshStandardMaterial?U.environment:null,xe=L===null?v.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:Ht,ve=(B.isMeshStandardMaterial?O:_).get(B.envMap||ue),Le=B.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Fe=!!k.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),_e=!!k.morphAttributes.position,Ze=!!k.morphAttributes.normal,ht=!!k.morphAttributes.color;let pt=pi;B.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(pt=v.toneMapping);const Jt=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,tt=Jt!==void 0?Jt.length:0,Me=Te.get(B),ui=p.state.lights;if(ie===!0&&(ye===!0||y!==M)){const _n=y===M&&B.id===w;ee.setState(B,y,_n)}let nt=!1;B.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==ui.state.version||Me.outputColorSpace!==xe||N.isBatchedMesh&&Me.batching===!1||!N.isBatchedMesh&&Me.batching===!0||N.isBatchedMesh&&Me.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Me.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Me.instancing===!1||!N.isInstancedMesh&&Me.instancing===!0||N.isSkinnedMesh&&Me.skinning===!1||!N.isSkinnedMesh&&Me.skinning===!0||N.isInstancedMesh&&Me.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Me.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Me.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Me.instancingMorph===!1&&N.morphTexture!==null||Me.envMap!==ve||B.fog===!0&&Me.fog!==te||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==ee.numPlanes||Me.numIntersection!==ee.numIntersection)||Me.vertexAlphas!==Le||Me.vertexTangents!==Fe||Me.morphTargets!==_e||Me.morphNormals!==Ze||Me.morphColors!==ht||Me.toneMapping!==pt||Me.morphTargetsCount!==tt)&&(nt=!0):(nt=!0,Me.__version=B.version);let Dn=Me.currentProgram;nt===!0&&(Dn=ha(B,U,N));let er=!1,hn=!1,qr=!1;const mt=Dn.getUniforms(),Wn=Me.uniforms;if(Ee.useProgram(Dn.program)&&(er=!0,hn=!0,qr=!0),B.id!==w&&(w=B.id,hn=!0),er||M!==y){Ee.buffers.depth.getReversed()?(le.copy(y.projectionMatrix),tm(le),nm(le),mt.setValue(F,"projectionMatrix",le)):mt.setValue(F,"projectionMatrix",y.projectionMatrix),mt.setValue(F,"viewMatrix",y.matrixWorldInverse);const Di=mt.map.cameraPosition;Di!==void 0&&Di.setValue(F,De.setFromMatrixPosition(y.matrixWorld)),qe.logarithmicDepthBuffer&&mt.setValue(F,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&mt.setValue(F,"isOrthographic",y.isOrthographicCamera===!0),M!==y&&(M=y,hn=!0,qr=!0)}if(N.isSkinnedMesh){mt.setOptional(F,N,"bindMatrix"),mt.setOptional(F,N,"bindMatrixInverse");const _n=N.skeleton;_n&&(_n.boneTexture===null&&_n.computeBoneTexture(),mt.setValue(F,"boneTexture",_n.boneTexture,T))}N.isBatchedMesh&&(mt.setOptional(F,N,"batchingTexture"),mt.setValue(F,"batchingTexture",N._matricesTexture,T),mt.setOptional(F,N,"batchingIdTexture"),mt.setValue(F,"batchingIdTexture",N._indirectTexture,T),mt.setOptional(F,N,"batchingColorTexture"),N._colorsTexture!==null&&mt.setValue(F,"batchingColorTexture",N._colorsTexture,T));const jr=k.morphAttributes;if((jr.position!==void 0||jr.normal!==void 0||jr.color!==void 0)&&Pe.update(N,k,Dn),(hn||Me.receiveShadow!==N.receiveShadow)&&(Me.receiveShadow=N.receiveShadow,mt.setValue(F,"receiveShadow",N.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(Wn.envMap.value=ve,Wn.flipEnvMap.value=ve.isCubeTexture&&ve.isRenderTargetTexture===!1?-1:1),B.isMeshStandardMaterial&&B.envMap===null&&U.environment!==null&&(Wn.envMapIntensity.value=U.environmentIntensity),hn&&(mt.setValue(F,"toneMappingExposure",v.toneMappingExposure),Me.needsLights&&OM(Wn,qr),te&&B.fog===!0&&ce.refreshFogUniforms(Wn,te),ce.refreshMaterialUniforms(Wn,B,V,ne,p.state.transmissionRenderTarget[y.id]),Ro.upload(F,jf(Me),Wn,T)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(Ro.upload(F,jf(Me),Wn,T),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&mt.setValue(F,"center",N.center),mt.setValue(F,"modelViewMatrix",N.modelViewMatrix),mt.setValue(F,"normalMatrix",N.normalMatrix),mt.setValue(F,"modelMatrix",N.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const _n=B.uniformsGroups;for(let Di=0,Ui=_n.length;Di<Ui;Di++){const Kf=_n[Di];D.update(Kf,Dn),D.bind(Kf,Dn)}}return Dn}function OM(y,U){y.ambientLightColor.needsUpdate=U,y.lightProbe.needsUpdate=U,y.directionalLights.needsUpdate=U,y.directionalLightShadows.needsUpdate=U,y.pointLights.needsUpdate=U,y.pointLightShadows.needsUpdate=U,y.spotLights.needsUpdate=U,y.spotLightShadows.needsUpdate=U,y.rectAreaLights.needsUpdate=U,y.hemisphereLights.needsUpdate=U}function kM(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(y,U,k){Te.get(y.texture).__webglTexture=U,Te.get(y.depthTexture).__webglTexture=k;const B=Te.get(y);B.__hasExternalTextures=!0,B.__autoAllocateDepthBuffer=k===void 0,B.__autoAllocateDepthBuffer||Ye.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(y,U){const k=Te.get(y);k.__webglFramebuffer=U,k.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(y,U=0,k=0){L=y,E=U,A=k;let B=!0,N=null,te=!1,ue=!1;if(y){const ve=Te.get(y);if(ve.__useDefaultFramebuffer!==void 0)Ee.bindFramebuffer(F.FRAMEBUFFER,null),B=!1;else if(ve.__webglFramebuffer===void 0)T.setupRenderTarget(y);else if(ve.__hasExternalTextures)T.rebindTextures(y,Te.get(y.texture).__webglTexture,Te.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const _e=y.depthTexture;if(ve.__boundDepthTexture!==_e){if(_e!==null&&Te.has(_e)&&(y.width!==_e.image.width||y.height!==_e.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");T.setupDepthRenderbuffer(y)}}const Le=y.texture;(Le.isData3DTexture||Le.isDataArrayTexture||Le.isCompressedArrayTexture)&&(ue=!0);const Fe=Te.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Fe[U])?N=Fe[U][k]:N=Fe[U],te=!0):y.samples>0&&T.useMultisampledRTT(y)===!1?N=Te.get(y).__webglMultisampledFramebuffer:Array.isArray(Fe)?N=Fe[k]:N=Fe,P.copy(y.viewport),H.copy(y.scissor),z=y.scissorTest}else P.copy(Se).multiplyScalar(V).floor(),H.copy(Ve).multiplyScalar(V).floor(),z=dt;if(Ee.bindFramebuffer(F.FRAMEBUFFER,N)&&B&&Ee.drawBuffers(y,N),Ee.viewport(P),Ee.scissor(H),Ee.setScissorTest(z),te){const ve=Te.get(y.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+U,ve.__webglTexture,k)}else if(ue){const ve=Te.get(y.texture),Le=U||0;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,ve.__webglTexture,k||0,Le)}w=-1},this.readRenderTargetPixels=function(y,U,k,B,N,te,ue){if(!(y&&y.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Te.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){Ee.bindFramebuffer(F.FRAMEBUFFER,xe);try{const ve=y.texture,Le=ve.format,Fe=ve.type;if(!qe.textureFormatReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qe.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=y.width-B&&k>=0&&k<=y.height-N&&F.readPixels(U,k,B,N,Be.convert(Le),Be.convert(Fe),te)}finally{const ve=L!==null?Te.get(L).__webglFramebuffer:null;Ee.bindFramebuffer(F.FRAMEBUFFER,ve)}}},this.readRenderTargetPixelsAsync=async function(y,U,k,B,N,te,ue){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=Te.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){const ve=y.texture,Le=ve.format,Fe=ve.type;if(!qe.textureFormatReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qe.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=y.width-B&&k>=0&&k<=y.height-N){Ee.bindFramebuffer(F.FRAMEBUFFER,xe);const _e=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,_e),F.bufferData(F.PIXEL_PACK_BUFFER,te.byteLength,F.STREAM_READ),F.readPixels(U,k,B,N,Be.convert(Le),Be.convert(Fe),0);const Ze=L!==null?Te.get(L).__webglFramebuffer:null;Ee.bindFramebuffer(F.FRAMEBUFFER,Ze);const ht=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await em(F,ht,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,_e),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,te),F.deleteBuffer(_e),F.deleteSync(ht),te}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(y,U=null,k=0){y.isTexture!==!0&&(lr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,y=arguments[1]);const B=Math.pow(2,-k),N=Math.floor(y.image.width*B),te=Math.floor(y.image.height*B),ue=U!==null?U.x:0,xe=U!==null?U.y:0;T.setTexture2D(y,0),F.copyTexSubImage2D(F.TEXTURE_2D,k,0,0,ue,xe,N,te),Ee.unbindTexture()},this.copyTextureToTexture=function(y,U,k=null,B=null,N=0){y.isTexture!==!0&&(lr("WebGLRenderer: copyTextureToTexture function signature has changed."),B=arguments[0]||null,y=arguments[1],U=arguments[2],N=arguments[3]||0,k=null);let te,ue,xe,ve,Le,Fe,_e,Ze,ht;const pt=y.isCompressedTexture?y.mipmaps[N]:y.image;k!==null?(te=k.max.x-k.min.x,ue=k.max.y-k.min.y,xe=k.isBox3?k.max.z-k.min.z:1,ve=k.min.x,Le=k.min.y,Fe=k.isBox3?k.min.z:0):(te=pt.width,ue=pt.height,xe=pt.depth||1,ve=0,Le=0,Fe=0),B!==null?(_e=B.x,Ze=B.y,ht=B.z):(_e=0,Ze=0,ht=0);const Jt=Be.convert(U.format),tt=Be.convert(U.type);let Me;U.isData3DTexture?(T.setTexture3D(U,0),Me=F.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(T.setTexture2DArray(U,0),Me=F.TEXTURE_2D_ARRAY):(T.setTexture2D(U,0),Me=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,U.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,U.unpackAlignment);const ui=F.getParameter(F.UNPACK_ROW_LENGTH),nt=F.getParameter(F.UNPACK_IMAGE_HEIGHT),Dn=F.getParameter(F.UNPACK_SKIP_PIXELS),er=F.getParameter(F.UNPACK_SKIP_ROWS),hn=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,pt.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,pt.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,ve),F.pixelStorei(F.UNPACK_SKIP_ROWS,Le),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Fe);const qr=y.isDataArrayTexture||y.isData3DTexture,mt=U.isDataArrayTexture||U.isData3DTexture;if(y.isRenderTargetTexture||y.isDepthTexture){const Wn=Te.get(y),jr=Te.get(U),_n=Te.get(Wn.__renderTarget),Di=Te.get(jr.__renderTarget);Ee.bindFramebuffer(F.READ_FRAMEBUFFER,_n.__webglFramebuffer),Ee.bindFramebuffer(F.DRAW_FRAMEBUFFER,Di.__webglFramebuffer);for(let Ui=0;Ui<xe;Ui++)qr&&F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Te.get(y).__webglTexture,N,Fe+Ui),y.isDepthTexture?(mt&&F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Te.get(U).__webglTexture,N,ht+Ui),F.blitFramebuffer(ve,Le,te,ue,_e,Ze,te,ue,F.DEPTH_BUFFER_BIT,F.NEAREST)):mt?F.copyTexSubImage3D(Me,N,_e,Ze,ht+Ui,ve,Le,te,ue):F.copyTexSubImage2D(Me,N,_e,Ze,ht+Ui,ve,Le,te,ue);Ee.bindFramebuffer(F.READ_FRAMEBUFFER,null),Ee.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else mt?y.isDataTexture||y.isData3DTexture?F.texSubImage3D(Me,N,_e,Ze,ht,te,ue,xe,Jt,tt,pt.data):U.isCompressedArrayTexture?F.compressedTexSubImage3D(Me,N,_e,Ze,ht,te,ue,xe,Jt,pt.data):F.texSubImage3D(Me,N,_e,Ze,ht,te,ue,xe,Jt,tt,pt):y.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,N,_e,Ze,te,ue,Jt,tt,pt.data):y.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,N,_e,Ze,pt.width,pt.height,Jt,pt.data):F.texSubImage2D(F.TEXTURE_2D,N,_e,Ze,te,ue,Jt,tt,pt);F.pixelStorei(F.UNPACK_ROW_LENGTH,ui),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,nt),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Dn),F.pixelStorei(F.UNPACK_SKIP_ROWS,er),F.pixelStorei(F.UNPACK_SKIP_IMAGES,hn),N===0&&U.generateMipmaps&&F.generateMipmap(Me),Ee.unbindTexture()},this.copyTextureToTexture3D=function(y,U,k=null,B=null,N=0){return y.isTexture!==!0&&(lr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),k=arguments[0]||null,B=arguments[1]||null,y=arguments[2],U=arguments[3],N=arguments[4]||0),lr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(y,U,k,B,N)},this.initRenderTarget=function(y){Te.get(y).__webglFramebuffer===void 0&&T.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?T.setTextureCube(y,0):y.isData3DTexture?T.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?T.setTexture2DArray(y,0):T.setTexture2D(y,0),Ee.unbindTexture()},this.resetState=function(){E=0,A=0,L=null,Ee.reset(),ut.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Xe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Xe._getUnpackColorSpace()}}class Hl{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new se(e),this.density=t}clone(){return new Hl(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Iv extends at{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new An,this.environmentIntensity=1,this.environmentRotation=new An,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Lv{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ll,this.updateRanges=[],this.version=0,this.uuid=Mn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Wt=new R;class Gl{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Wt.fromBufferAttribute(this,t),Wt.applyMatrix4(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Wt.fromBufferAttribute(this,t),Wt.applyNormalMatrix(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Wt.fromBufferAttribute(this,t),Wt.transformDirection(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Sn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=it(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=it(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Sn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Sn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Sn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Sn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=it(t,this.array),n=it(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=it(t,this.array),n=it(n,this.array),s=it(s,this.array),r=it(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new vt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Gl(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const wu=new R,Tu=new Je,Eu=new Je,Dv=new R,Au=new Ie,Po=new R,Vl=new Un,Ru=new Ie,Wl=new ur;class Uv extends Ce{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Jc,this.bindMatrix=new Ie,this.bindMatrixInverse=new Ie,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Gt),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Po),this.boundingBox.expandByPoint(Po)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Un),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,Po),this.boundingSphere.expandByPoint(Po)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Vl.copy(this.boundingSphere),Vl.applyMatrix4(s),e.ray.intersectsSphere(Vl)!==!1&&(Ru.copy(s).invert(),Wl.copy(e.ray).applyMatrix4(Ru),!(this.boundingBox!==null&&Wl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Wl)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Je,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Jc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===wp?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,s=this.geometry;Tu.fromBufferAttribute(s.attributes.skinIndex,e),Eu.fromBufferAttribute(s.attributes.skinWeight,e),wu.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=Eu.getComponent(r);if(o!==0){const a=Tu.getComponent(r);Au.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Dv.copy(wu).applyMatrix4(Au),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Cu extends at{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Pu extends Et{constructor(e=null,t=1,n=1,s,r,o,a,l,c=zt,d=zt,u,h){super(null,o,a,l,c,d,s,r,u,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Iu=new Ie,Nv=new Ie;class Xl{constructor(e=[],t=[]){this.uuid=Mn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Ie)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ie;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:Nv;Iu.multiplyMatrices(a,t[r]),Iu.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new Xl(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Pu(t,e,e,fn,bn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){const r=e.bones[n];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Cu),this.bones.push(o),this.boneInverses.push(new Ie().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const o=t[s];e.bones.push(o.uuid);const a=n[s];e.boneInverses.push(a.toArray())}return e}}class Yl extends vt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Ds=new Ie,Lu=new Ie,Io=[],Du=new Gt,Fv=new Ie,gr=new Ce,xr=new Un;class Us extends Ce{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Yl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Fv)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Gt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ds),Du.copy(e.boundingBox).applyMatrix4(Ds),this.boundingBox.union(Du)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Un),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ds),xr.copy(e.boundingSphere).applyMatrix4(Ds),this.boundingSphere.union(xr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(gr.geometry=this.geometry,gr.material=this.material,gr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xr.copy(this.boundingSphere),xr.applyMatrix4(n),e.ray.intersectsSphere(xr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ds),Lu.multiplyMatrices(n,Ds),gr.matrixWorld=Lu,gr.raycast(e,Io);for(let o=0,a=Io.length;o<a;o++){const l=Io[o];l.instanceId=r,l.object=this,t.push(l)}Io.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Yl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Pu(new Float32Array(s*this.count),s,this.count,Ca,bn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Uu extends Pn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Lo=new R,Do=new R,Nu=new Ie,vr=new ur,Uo=new Un,ql=new R,Fu=new R;class jl extends at{constructor(e=new Lt,t=new Uu){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Lo.fromBufferAttribute(t,s-1),Do.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Lo.distanceTo(Do);e.setAttribute("lineDistance",new gt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Uo.copy(n.boundingSphere),Uo.applyMatrix4(s),Uo.radius+=r,e.ray.intersectsSphere(Uo)===!1)return;Nu.copy(s).invert(),vr.copy(e.ray).applyMatrix4(Nu);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,d=n.index,h=n.attributes.position;if(d!==null){const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=c){const p=d.getX(x),S=d.getX(x+1),b=No(this,e,vr,l,p,S);b&&t.push(b)}if(this.isLineLoop){const x=d.getX(g-1),m=d.getX(f),p=No(this,e,vr,l,x,m);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=c){const p=No(this,e,vr,l,x,x+1);p&&t.push(p)}if(this.isLineLoop){const x=No(this,e,vr,l,g-1,f);x&&t.push(x)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function No(i,e,t,n,s,r){const o=i.geometry.attributes.position;if(Lo.fromBufferAttribute(o,s),Do.fromBufferAttribute(o,r),t.distanceSqToSegment(Lo,Do,ql,Fu)>n)return;ql.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(ql);if(!(l<e.near||l>e.far))return{distance:l,point:Fu.clone().applyMatrix4(i.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:i}}const Ou=new R,ku=new R;class Ov extends jl{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Ou.fromBufferAttribute(t,s),ku.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Ou.distanceTo(ku);e.setAttribute("lineDistance",new gt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class kv extends jl{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Bu extends Pn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const zu=new Ie,$l=new ur,Fo=new Un,Oo=new R;class Kl extends at{constructor(e=new Lt,t=new Bu){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fo.copy(n.boundingSphere),Fo.applyMatrix4(s),Fo.radius+=r,e.ray.intersectsSphere(Fo)===!1)return;zu.copy(s).invert(),$l.copy(e.ray).applyMatrix4(zu);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){const h=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=h,x=f;g<x;g++){const m=c.getX(g);Oo.fromBufferAttribute(u,m),Hu(Oo,m,l,s,e,t,this)}}else{const h=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=h,x=f;g<x;g++)Oo.fromBufferAttribute(u,g),Hu(Oo,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Hu(i,e,t,n,s,r,o){const a=$l.distanceSqToPoint(i);if(a<t){const l=new R;$l.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class ko extends Lt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new R,d=new we;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,h=3;u<=t;u++,h+=3){const f=n+u/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),d.x=(o[h]/e+1)/2,d.y=(o[h+1]/e+1)/2,l.push(d.x,d.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new gt(o,3)),this.setAttribute("normal",new gt(a,3)),this.setAttribute("uv",new gt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ko(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Fn extends Lt{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const d=[],u=[],h=[],f=[];let g=0;const x=[],m=n/2;let p=0;S(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(d),this.setAttribute("position",new gt(u,3)),this.setAttribute("normal",new gt(h,3)),this.setAttribute("uv",new gt(f,2));function S(){const v=new R,I=new R;let E=0;const A=(t-e)/n;for(let L=0;L<=r;L++){const w=[],M=L/r,P=M*(t-e)+e;for(let H=0;H<=s;H++){const z=H/s,W=z*l+a,K=Math.sin(W),X=Math.cos(W);I.x=P*K,I.y=-M*n+m,I.z=P*X,u.push(I.x,I.y,I.z),v.set(K,A,X).normalize(),h.push(v.x,v.y,v.z),f.push(z,1-M),w.push(g++)}x.push(w)}for(let L=0;L<s;L++)for(let w=0;w<r;w++){const M=x[w][L],P=x[w+1][L],H=x[w+1][L+1],z=x[w][L+1];(e>0||w!==0)&&(d.push(M,P,z),E+=3),(t>0||w!==r-1)&&(d.push(P,H,z),E+=3)}c.addGroup(p,E,0),p+=E}function b(v){const I=g,E=new we,A=new R;let L=0;const w=v===!0?e:t,M=v===!0?1:-1;for(let H=1;H<=s;H++)u.push(0,m*M,0),h.push(0,M,0),f.push(.5,.5),g++;const P=g;for(let H=0;H<=s;H++){const W=H/s*l+a,K=Math.cos(W),X=Math.sin(W);A.x=w*X,A.y=m*M,A.z=w*K,u.push(A.x,A.y,A.z),h.push(0,M,0),E.x=K*.5+.5,E.y=X*.5*M+.5,f.push(E.x,E.y),g++}for(let H=0;H<s;H++){const z=I+H,W=P+H;v===!0?d.push(W,W+1,z):d.push(W+1,W,z),L+=3}c.addGroup(p,L,v===!0?1:2),p+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class _r extends Fn{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new _r(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Xi extends Lt{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],l=[],c=[],d=[];let u=e;const h=(t-e)/s,f=new R,g=new we;for(let x=0;x<=s;x++){for(let m=0;m<=n;m++){const p=r+m/n*o;f.x=u*Math.cos(p),f.y=u*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,d.push(g.x,g.y)}u+=h}for(let x=0;x<s;x++){const m=x*(n+1);for(let p=0;p<n;p++){const S=p+m,b=S,v=S+n+1,I=S+n+2,E=S+1;a.push(b,v,E),a.push(v,I,E)}}this.setIndex(a),this.setAttribute("position",new gt(l,3)),this.setAttribute("normal",new gt(c,3)),this.setAttribute("uv",new gt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xi(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class oi extends Lt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const d=[],u=new R,h=new R,f=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){const S=[],b=p/n;let v=0;p===0&&o===0?v=.5/t:p===n&&l===Math.PI&&(v=-.5/t);for(let I=0;I<=t;I++){const E=I/t;u.x=-e*Math.cos(s+E*r)*Math.sin(o+b*a),u.y=e*Math.cos(o+b*a),u.z=e*Math.sin(s+E*r)*Math.sin(o+b*a),g.push(u.x,u.y,u.z),h.copy(u).normalize(),x.push(h.x,h.y,h.z),m.push(E+v,1-b),S.push(c++)}d.push(S)}for(let p=0;p<n;p++)for(let S=0;S<t;S++){const b=d[p][S+1],v=d[p][S],I=d[p+1][S],E=d[p+1][S+1];(p!==0||o>0)&&f.push(b,v,E),(p!==n-1||l<Math.PI)&&f.push(v,I,E)}this.setIndex(f),this.setAttribute("position",new gt(g,3)),this.setAttribute("normal",new gt(x,3)),this.setAttribute("uv",new gt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new oi(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class jt extends Pn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new se(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=al,this.normalScale=new we(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new An,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class On extends jt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new we(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ut(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new se(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new se(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new se(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class ai extends Pn{static get type(){return"MeshLambertMaterial"}constructor(e){super(),this.isMeshLambertMaterial=!0,this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=al,this.normalScale=new we(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new An,this.combine=Sa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}function Bo(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Bv(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function zv(i){function e(s,r){return i[s]-i[r]}const t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Gu(i,e,t){const n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=i[a+l]}return s}function Vu(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}class yr{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class Hv extends yr{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:dd,endingEnd:dd}}intervalChanged_(e,t,n){const s=this.parameterPositions;let r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case ud:r=e,a=2*t-n;break;case hd:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case ud:o=e,l=2*n-t;break;case hd:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}const c=(n-t)*.5,d=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*d,this._offsetNext=o*d}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=this._offsetPrev,u=this._offsetNext,h=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),x=g*g,m=x*g,p=-h*m+2*h*x-h*g,S=(1+h)*m+(-1.5-2*h)*x+(-.5+h)*g+1,b=(-1-f)*m+(1.5+f)*x+.5*g,v=f*m-f*x;for(let I=0;I!==a;++I)r[I]=p*o[d+I]+S*o[c+I]+b*o[l+I]+v*o[u+I];return r}}class Gv extends yr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,d=(n-t)/(s-t),u=1-d;for(let h=0;h!==a;++h)r[h]=o[c+h]*u+o[l+h]*d;return r}}class Vv extends yr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class kn{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Bo(t,this.TimeBufferType),this.values=Bo(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Bo(e.times,Array),values:Bo(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Vv(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Gv(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Hv(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ir:t=this.InterpolantFactoryMethodDiscrete;break;case sr:t=this.InterpolantFactoryMethodLinear;break;case rl:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ir;case this.InterpolantFactoryMethodLinear:return sr;case this.InterpolantFactoryMethodSmooth:return rl}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){const n=this.times,s=n.length;let r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Bv(s))for(let a=0,l=s.length;a!==l;++a){const c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===rl,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],d=e[a+1];if(c!==d&&(a!==1||c!==e[0]))if(s)l=!0;else{const u=a*n,h=u-n,f=u+n;for(let g=0;g!==n;++g){const x=t[u+g];if(x!==t[h+g]||x!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*n,h=o*n;for(let f=0;f!==n;++f)t[h+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}kn.prototype.TimeBufferType=Float32Array,kn.prototype.ValueBufferType=Float32Array,kn.prototype.DefaultInterpolation=sr;class Ns extends kn{constructor(e,t,n){super(e,t,n)}}Ns.prototype.ValueTypeName="bool",Ns.prototype.ValueBufferType=Array,Ns.prototype.DefaultInterpolation=ir,Ns.prototype.InterpolantFactoryMethodLinear=void 0,Ns.prototype.InterpolantFactoryMethodSmooth=void 0;class Wu extends kn{}Wu.prototype.ValueTypeName="color";class Fs extends kn{}Fs.prototype.ValueTypeName="number";class Wv extends yr{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t);let c=e*a;for(let d=c+a;c!==d;c+=4)Qn.slerpFlat(r,0,o,c-a,o,c,l);return r}}class Os extends kn{InterpolantFactoryMethodLinear(e){return new Wv(this.times,this.values,this.getValueSize(),e)}}Os.prototype.ValueTypeName="quaternion",Os.prototype.InterpolantFactoryMethodSmooth=void 0;class ks extends kn{constructor(e,t,n){super(e,t,n)}}ks.prototype.ValueTypeName="string",ks.prototype.ValueBufferType=Array,ks.prototype.DefaultInterpolation=ir,ks.prototype.InterpolantFactoryMethodLinear=void 0,ks.prototype.InterpolantFactoryMethodSmooth=void 0;class Bs extends kn{}Bs.prototype.ValueTypeName="vector";class Xv{constructor(e="",t=-1,n=[],s=Tp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Mn(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(qv(n[o]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=n.length;r!==o;++r)t.push(kn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const d=zv(l);l=Gu(l,1,d),c=Gu(c,1,d),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Fs(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],d=c.name.match(r);if(d&&d.length>1){const u=d[1];let h=s[u];h||(s[u]=h=[]),h.push(c)}}const o=[];for(const a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,h,f,g,x){if(f.length!==0){const m=[],p=[];Vu(f,m,p,g),m.length!==0&&x.push(new u(h,m,p))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const h=c[u].keys;if(!(!h||h.length===0))if(h[0].morphTargets){const f={};let g;for(g=0;g<h.length;g++)if(h[g].morphTargets)for(let x=0;x<h[g].morphTargets.length;x++)f[h[g].morphTargets[x]]=-1;for(const x in f){const m=[],p=[];for(let S=0;S!==h[g].morphTargets.length;++S){const b=h[g];m.push(b.time),p.push(b.morphTarget===x?1:0)}s.push(new Fs(".morphTargetInfluence["+x+"]",m,p))}l=f.length*o}else{const f=".bones["+t[u].name+"]";n(Bs,f+".position",h,"pos",s),n(Os,f+".quaternion",h,"rot",s),n(Bs,f+".scale",h,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,s=e.length;n!==s;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function Yv(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Fs;case"vector":case"vector2":case"vector3":case"vector4":return Bs;case"color":return Wu;case"quaternion":return Os;case"bool":case"boolean":return Ns;case"string":return ks}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function qv(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Yv(i.type);if(i.times===void 0){const t=[],n=[];Vu(i.keys,t,n,"value"),i.times=t,i.values=n}return e.parse!==void 0?e.parse(i):new e(i.name,i.times,i.values,i.interpolation)}const wi={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class jv{constructor(e,t,n){const s=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(d){a++,r===!1&&s.onStart!==void 0&&s.onStart(d,o,a),r=!0},this.itemEnd=function(d){o++,s.onProgress!==void 0&&s.onProgress(d,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,u){return c.push(d,u),this},this.removeHandler=function(d){const u=c.indexOf(d);return u!==-1&&c.splice(u,2),this},this.getHandler=function(d){for(let u=0,h=c.length;u<h;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(d))return g}return null}}}const $v=new jv;class zs{constructor(e){this.manager=e!==void 0?e:$v,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}zs.DEFAULT_MATERIAL_NAME="__DEFAULT";const li={};class Kv extends Error{constructor(e,t){super(e),this.response=t}}class Xu extends zs{constructor(e){super(e)}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=wi.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(li[e]!==void 0){li[e].push({onLoad:t,onProgress:n,onError:s});return}li[e]=[],li[e].push({onLoad:t,onProgress:n,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const d=li[e],u=c.body.getReader(),h=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=h?parseInt(h):0,g=f!==0;let x=0;const m=new ReadableStream({start(p){S();function S(){u.read().then(({done:b,value:v})=>{if(b)p.close();else{x+=v.byteLength;const I=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:f});for(let E=0,A=d.length;E<A;E++){const L=d[E];L.onProgress&&L.onProgress(I)}p.enqueue(v),S()}},b=>{p.error(b)})}}});return new Response(m)}else throw new Kv(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(d=>new DOMParser().parseFromString(d,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),h=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(h);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{wi.add(e,c);const d=li[e];delete li[e];for(let u=0,h=d.length;u<h;u++){const f=d[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const d=li[e];if(d===void 0)throw this.manager.itemError(e),c;delete li[e];for(let u=0,h=d.length;u<h;u++){const f=d[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class Zv extends zs{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=wi.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=ar("img");function l(){d(),wi.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){d(),s&&s(u),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class Jv extends zs{constructor(e){super(e)}load(e,t,n,s){const r=new Et,o=new Zv(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class br extends at{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new se(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Qv extends br{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(at.DEFAULT_UP),this.updateMatrix(),this.groundColor=new se(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Zl=new Ie,Yu=new R,qu=new R;class Jl{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new we(512,512),this.map=null,this.mapPass=null,this.matrix=new Ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Il,this._frameExtents=new we(1,1),this._viewportCount=1,this._viewports=[new Je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Yu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Yu),qu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(qu),t.updateMatrixWorld(),Zl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Zl),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Zl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class e_ extends Jl{constructor(){super(new qt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,n=ms*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class t_ extends br{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(at.DEFAULT_UP),this.updateMatrix(),this.target=new at,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new e_}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const ju=new Ie,Mr=new R,Ql=new R;class n_ extends Jl{constructor(){super(new qt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new we(4,2),this._viewportCount=6,this._viewports=[new Je(2,1,1,1),new Je(0,1,1,1),new Je(3,1,1,1),new Je(1,1,1,1),new Je(3,0,1,1),new Je(1,0,1,1)],this._cubeDirections=[new R(1,0,0),new R(-1,0,0),new R(0,0,1),new R(0,0,-1),new R(0,1,0),new R(0,-1,0)],this._cubeUps=[new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,1,0),new R(0,0,1),new R(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Mr.setFromMatrixPosition(e.matrixWorld),n.position.copy(Mr),Ql.copy(n.position),Ql.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Ql),n.updateMatrixWorld(),s.makeTranslation(-Mr.x,-Mr.y,-Mr.z),ju.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ju)}}class zo extends br{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new n_}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class i_ extends Jl{constructor(){super(new pr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ho extends br{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(at.DEFAULT_UP),this.updateMatrix(),this.target=new at,this.shadow=new i_}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class s_ extends br{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Sr{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let n=0,s=e.length;n<s;n++)t+=String.fromCharCode(e[n]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class r_ extends zs{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=wi.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),r.manager.itemEnd(e)}).catch(c=>{s&&s(c)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return wi.add(e,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),wi.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});wi.add(e,l),r.manager.itemStart(e)}}class o_{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=$u(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=$u();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function $u(){return performance.now()}const ec="\\[\\]\\.:\\/",a_=new RegExp("["+ec+"]","g"),tc="[^"+ec+"]",l_="[^"+ec.replace("\\.","")+"]",c_=/((?:WC+[\/:])*)/.source.replace("WC",tc),d_=/(WCOD+)?/.source.replace("WCOD",l_),u_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",tc),h_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",tc),f_=new RegExp("^"+c_+d_+u_+h_+"$"),p_=["material","materials","bones","map"];class m_{constructor(e,t,n){const s=n||st.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class st{constructor(e,t,n){this.path=t,this.parsedPath=n||st.parseTrackName(t),this.node=st.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new st.Composite(e,t,n):new st(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(a_,"")}static parseTrackName(e){const t=f_.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=n.nodeName.substring(s+1);p_.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=st.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===c){c=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[s];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}st.Composite=m_,st.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},st.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},st.prototype.GetterByBindingType=[st.prototype._getValue_direct,st.prototype._getValue_array,st.prototype._getValue_arrayElement,st.prototype._getValue_toArray],st.prototype.SetterByBindingTypeAndVersioning=[[st.prototype._setValue_direct,st.prototype._setValue_direct_setNeedsUpdate,st.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[st.prototype._setValue_array,st.prototype._setValue_array_setNeedsUpdate,st.prototype._setValue_array_setMatrixWorldNeedsUpdate],[st.prototype._setValue_arrayElement,st.prototype._setValue_arrayElement_setNeedsUpdate,st.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[st.prototype._setValue_fromArray,st.prototype._setValue_fromArray_setNeedsUpdate,st.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Ku=new Ie;class g_{constructor(e,t,n=0,s=1/0){this.ray=new ur(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new vl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Ku.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ku),this}intersectObject(e,t=!0,n=[]){return nc(e,this,n,t),n.sort(Zu),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)nc(e[s],this,n,t);return n.sort(Zu),n}}function Zu(i,e){return i.distance-e.distance}function nc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)nc(r[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:yn}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=yn);const Ju={easy:{label:"Easy",emoji:"🟢",startGold:600,startLives:30,enemyHpMult:.75,enemySpeedMult:.9,goldMult:1.2},normal:{label:"Normal",emoji:"🟡",startGold:400,startLives:20,enemyHpMult:1,enemySpeedMult:1,goldMult:1},hard:{label:"Hard",emoji:"🔴",startGold:250,startLives:10,enemyHpMult:1.4,enemySpeedMult:1.15,goldMult:.8}};function ic(i,e){return`${i},${e}`}const x_={cols:20,rows:12,cellSize:1,origin:{x:-10,z:-6},landRadius:2,buildRadius:1,regions:[{id:"wildwood-gate",name:"Wildwood Gate",subtitle:"Forest approach and opening kill-zone",colRange:[0,6],foundationTier:1,accent:"#74d47c"},{id:"sunken-crossing",name:"Sunken Crossing",subtitle:"Low gorge, crystal river and bridgeheads",colRange:[7,12],foundationTier:2,accent:"#65d9ff"},{id:"bastion-cliff",name:"Bastion Cliff",subtitle:"Raised siege terrace below the citadel",colRange:[13,19],foundationTier:3,accent:"#ffbd69"}],path:[[0,5],[1,5],[2,5],[3,5],[4,5],[4,6],[4,7],[4,8],[5,8],[6,8],[7,8],[8,8],[8,7],[8,6],[8,5],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[13,5],[13,6],[14,6],[15,6],[16,6],[16,5],[16,4],[17,4],[18,4],[19,4]],spawnCell:[0,5],goalCell:[19,4],pathTileOverrides:[{cell:[10,4],model:"tile_riverBridge",rotK:0}],terrainTiles:[{cell:[10,2],model:"tile_riverStraight",rotK:0,buildable:!1},{cell:[10,3],model:"tile_riverStraight",rotK:0,buildable:!1},{cell:[10,5],model:"tile_riverStraight",rotK:0,buildable:!1},{cell:[10,6],model:"tile_riverStraight",rotK:0,buildable:!1},{cell:[3,4],model:"tile_dirt",rotK:0,buildable:!0},{cell:[6,7],model:"tile_dirt",rotK:1,buildable:!0},{cell:[11,5],model:"tile_dirt",rotK:2,buildable:!0},{cell:[15,5],model:"tile_dirt",rotK:3,buildable:!0}]},v_={arrow:{name:"Arrow",damageType:"physical",levels:[{buildCost:80,upgradeCost:0,damage:18,cooldownSec:.6,range:3.5,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:30,cooldownSec:.5,range:4,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:50,cooldownSec:.4,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"arrow_rapid",name:"Rapid Arrow",cost:250,desc:"Insane ATK SPD"},{type:"arrow_pierce",name:"Piercing Arrow",cost:250,desc:"Chain ×4"}]},cannon:{name:"Cannon",damageType:"physical",levels:[{buildCost:120,upgradeCost:0,damage:40,cooldownSec:2,range:3,slow:null,aoeRadius:1.2,dot:null,chain:null},{buildCost:0,upgradeCost:100,damage:65,cooldownSec:1.8,range:3.5,slow:null,aoeRadius:1.5,dot:null,chain:null},{buildCost:0,upgradeCost:180,damage:100,cooldownSec:1.5,range:4,slow:null,aoeRadius:1.8,dot:null,chain:null}],evolutions:[{type:"cannon_siege",name:"Siege Mortar",cost:400,desc:"射程＋範圍再大一截"}]},cannon_siege:{name:"Siege Mortar",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:150,cooldownSec:1.2,range:4.5,slow:null,aoeRadius:2.52,dot:null,chain:null},{buildCost:0,upgradeCost:1600,damage:180,cooldownSec:1.1,range:4.75,slow:null,aoeRadius:2.7,dot:null,chain:null},{buildCost:0,upgradeCost:3200,damage:220,cooldownSec:1,range:5,slow:null,aoeRadius:3,dot:null,chain:null}],evolutions:[]},ice:{name:"Ice",damageType:"ice",levels:[{buildCost:80,upgradeCost:0,damage:8,cooldownSec:1.2,range:3,slow:{pct:.3,durationSec:2},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:70,damage:14,cooldownSec:1,range:3.5,slow:{pct:.4,durationSec:2.5},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:22,cooldownSec:.8,range:4,slow:{pct:.5,durationSec:3},aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"ice_glacier",name:"Glacier Spire",cost:280,desc:"減速更狠，兼範圍凍"}]},ice_glacier:{name:"Glacier Spire",damageType:"ice",levels:[{buildCost:0,upgradeCost:0,damage:33,cooldownSec:.64,range:4.5,slow:{pct:.65,durationSec:4},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:1200,damage:40,cooldownSec:.6,range:4.75,slow:{pct:.68,durationSec:4.25},aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:2400,damage:48,cooldownSec:.56,range:5,slow:{pct:.72,durationSec:4.5},aoeRadius:0,dot:null,chain:null}],evolutions:[]},fire:{name:"Fire",damageType:"fire",levels:[{buildCost:100,upgradeCost:0,damage:12,cooldownSec:1,range:3,slow:null,aoeRadius:0,dot:{dps:10,durationSec:3},chain:null},{buildCost:0,upgradeCost:90,damage:20,cooldownSec:.9,range:3.5,slow:null,aoeRadius:0,dot:{dps:16,durationSec:3},chain:null},{buildCost:0,upgradeCost:160,damage:32,cooldownSec:.8,range:4,slow:null,aoeRadius:0,dot:{dps:24,durationSec:3.5},chain:null}],evolutions:[{type:"fire_inferno",name:"Inferno Brazier",cost:350,desc:"燒傷 dps 翻倍"}]},fire_inferno:{name:"Inferno Brazier",damageType:"fire",levels:[{buildCost:0,upgradeCost:0,damage:48,cooldownSec:.64,range:4.5,slow:null,aoeRadius:0,dot:{dps:48,durationSec:3.5},chain:null},{buildCost:0,upgradeCost:1400,damage:58,cooldownSec:.6,range:4.75,slow:null,aoeRadius:0,dot:{dps:58,durationSec:3.75},chain:null},{buildCost:0,upgradeCost:2800,damage:70,cooldownSec:.56,range:5,slow:null,aoeRadius:0,dot:{dps:70,durationSec:4},chain:null}],evolutions:[]},lightning:{name:"Lightning",damageType:"lightning",levels:[{buildCost:110,upgradeCost:0,damage:15,cooldownSec:1.2,range:3.5,slow:null,aoeRadius:0,dot:null,chain:{targets:2,rangeFalloff:2}},{buildCost:0,upgradeCost:100,damage:25,cooldownSec:1,range:4,slow:null,aoeRadius:0,dot:null,chain:{targets:3,rangeFalloff:2.5}},{buildCost:0,upgradeCost:170,damage:40,cooldownSec:.8,range:4.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}}],evolutions:[{type:"lightning_storm",name:"Storm Coil",cost:380,desc:"Chain ×5"}]},lightning_storm:{name:"Storm Coil",damageType:"lightning",levels:[{buildCost:0,upgradeCost:0,damage:60,cooldownSec:.64,range:5,slow:null,aoeRadius:0,dot:null,chain:{targets:5,rangeFalloff:3}},{buildCost:0,upgradeCost:1500,damage:72,cooldownSec:.6,range:5.25,slow:null,aoeRadius:0,dot:null,chain:{targets:6,rangeFalloff:3.2}},{buildCost:0,upgradeCost:3e3,damage:86,cooldownSec:.56,range:5.5,slow:null,aoeRadius:0,dot:null,chain:{targets:7,rangeFalloff:3.4}}],evolutions:[]},poison:{name:"Poison",damageType:"poison",levels:[{buildCost:100,upgradeCost:0,damage:5,cooldownSec:1.5,range:3,slow:null,aoeRadius:1.5,dot:{dps:8,durationSec:4},chain:null},{buildCost:0,upgradeCost:90,damage:8,cooldownSec:1.3,range:3.5,slow:null,aoeRadius:1.8,dot:{dps:12,durationSec:4},chain:null},{buildCost:0,upgradeCost:160,damage:14,cooldownSec:1,range:4,slow:null,aoeRadius:2,dot:{dps:18,durationSec:5},chain:null}],evolutions:[{type:"poison_plague",name:"Plague Still",cost:350,desc:"毒霧範圍大一倍"}]},poison_plague:{name:"Plague Still",damageType:"poison",levels:[{buildCost:0,upgradeCost:0,damage:21,cooldownSec:.8,range:4.5,slow:null,aoeRadius:4,dot:{dps:36,durationSec:5},chain:null},{buildCost:0,upgradeCost:1400,damage:26,cooldownSec:.75,range:4.75,slow:null,aoeRadius:4.25,dot:{dps:44,durationSec:5.25},chain:null},{buildCost:0,upgradeCost:2800,damage:32,cooldownSec:.7,range:5,slow:null,aoeRadius:4.5,dot:{dps:54,durationSec:5.5},chain:null}],evolutions:[]},sniper:{name:"Sniper",damageType:"sniper",levels:[{buildCost:150,upgradeCost:0,damage:100,cooldownSec:2.8,range:7,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:130,damage:175,cooldownSec:2.3,range:8,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:220,damage:280,cooldownSec:1.8,range:9,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[{type:"sniper_railgun",name:"Railgun Nest",cost:500,desc:"單發傷害再上一級"}]},sniper_railgun:{name:"Railgun Nest",damageType:"sniper",levels:[{buildCost:0,upgradeCost:0,damage:420,cooldownSec:1.44,range:9.5,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:1800,damage:510,cooldownSec:1.36,range:10,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:3600,damage:620,cooldownSec:1.28,range:10.5,slow:null,aoeRadius:0,dot:null,chain:null}],evolutions:[]},arrow_rapid:{name:"Rapid Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:35,cooldownSec:.15,range:4.5,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:1200,damage:42,cooldownSec:.14,range:4.75,slow:null,aoeRadius:0,dot:null,chain:null},{buildCost:0,upgradeCost:2400,damage:50,cooldownSec:.13,range:5,slow:null,aoeRadius:0,dot:null,chain:null}]},arrow_pierce:{name:"Piercing Arrow",damageType:"physical",levels:[{buildCost:0,upgradeCost:0,damage:90,cooldownSec:.5,range:5.5,slow:null,aoeRadius:0,dot:null,chain:{targets:4,rangeFalloff:3}},{buildCost:0,upgradeCost:1200,damage:108,cooldownSec:.47,range:5.75,slow:null,aoeRadius:0,dot:null,chain:{targets:5,rangeFalloff:3.2}},{buildCost:0,upgradeCost:2400,damage:130,cooldownSec:.44,range:6,slow:null,aoeRadius:0,dot:null,chain:{targets:6,rangeFalloff:3.4}}]}},__={grunt:{name:"Grunt",hp:60,speed:1,bounty:8,weakness:["physical"],resistance:[],armor:0,shield:0,special:"none"},tank:{name:"Tank",hp:280,speed:.5,bounty:18,weakness:["fire"],resistance:["physical"],armor:8,shield:0,special:"none"},runner:{name:"Runner",hp:80,speed:1.6,bounty:10,weakness:["ice"],resistance:["physical"],armor:0,shield:0,special:"none"},swarm:{name:"Swarm",hp:25,speed:1.2,bounty:3,weakness:["lightning"],resistance:["sniper"],armor:0,shield:0,special:"none"},shield:{name:"Shield",hp:100,speed:.8,bounty:14,weakness:["fire"],resistance:["ice"],armor:0,shield:80,special:"none"},healer:{name:"Healer",hp:90,speed:.7,bounty:16,weakness:["poison"],resistance:[],armor:0,shield:0,special:"heal",healRadius:2.5,healAmount:15,healIntervalSec:2},boss:{name:"Boss",hp:1200,speed:.4,bounty:120,weakness:["sniper"],resistance:["physical","ice","poison"],armor:12,shield:0,special:"none"}},y_={prepSec:8,waves:JSON.parse('[{"groups":[{"type":"grunt","count":13,"intervalSec":0.8},{"type":"runner","count":6,"intervalSec":0.8}]},{"groups":[{"type":"runner","count":11,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"grunt","count":20,"intervalSec":0.79},{"type":"grunt","count":13,"intervalSec":0.79}]},{"groups":[{"type":"runner","count":16,"intervalSec":0.78}]},{"groups":[{"type":"runner","count":15,"intervalSec":0.78},{"type":"runner","count":6,"intervalSec":0.78},{"type":"runner","count":11,"intervalSec":0.78}]},{"groups":[{"type":"grunt","count":24,"intervalSec":0.77},{"type":"runner","count":16,"intervalSec":0.77},{"type":"grunt","count":10,"intervalSec":0.77}]},{"groups":[{"type":"runner","count":23,"intervalSec":0.77}]},{"groups":[{"type":"grunt","count":14,"intervalSec":0.76},{"type":"grunt","count":26,"intervalSec":0.76},{"type":"grunt","count":13,"intervalSec":0.76}]},{"groups":[{"type":"grunt","count":31,"intervalSec":0.76}]},{"groups":[{"type":"boss","count":1,"intervalSec":1},{"type":"tank","count":6,"intervalSec":1.5},{"type":"shield","count":3,"intervalSec":1.5},{"type":"tank","count":7,"intervalSec":1.5}]},{"groups":[{"type":"swarm","count":38,"intervalSec":0.38},{"type":"runner","count":9,"intervalSec":0.74},{"type":"runner","count":17,"intervalSec":0.74}]},{"groups":[{"type":"swarm","count":70,"intervalSec":0.38}]},{"groups":[{"type":"grunt","count":16,"intervalSec":0.74},{"type":"tank","count":3,"intervalSec":1.87}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.37},{"type":"runner","count":10,"intervalSec":0.73},{"type":"grunt","count":18,"intervalSec":0.73}]},{"groups":[{"type":"runner","count":21,"intervalSec":0.73}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.84},{"type":"swarm","count":40,"intervalSec":0.37},{"type":"tank","count":4,"intervalSec":1.84}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.72},{"type":"swarm","count":39,"intervalSec":0.37},{"type":"swarm","count":45,"intervalSec":0.37}]},{"groups":[{"type":"grunt","count":26,"intervalSec":0.71},{"type":"grunt","count":22,"intervalSec":0.71},{"type":"grunt","count":26,"intervalSec":0.71}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.81},{"type":"swarm","count":37,"intervalSec":0.36},{"type":"swarm","count":35,"intervalSec":0.36}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"tank","count":7,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"tank","count":4,"intervalSec":1.5},{"type":"tank","count":5,"intervalSec":1.5},{"type":"healer","count":5,"intervalSec":1.5},{"type":"shield","count":4,"intervalSec":1.5},{"type":"healer","count":8,"intervalSec":1.5}]},{"groups":[{"type":"grunt","count":24,"intervalSec":0.7},{"type":"runner","count":13,"intervalSec":0.7}]},{"groups":[{"type":"shield","count":9,"intervalSec":1.58},{"type":"runner","count":20,"intervalSec":0.69}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.77},{"type":"runner","count":19,"intervalSec":0.69},{"type":"grunt","count":24,"intervalSec":0.69}]},{"groups":[{"type":"grunt","count":51,"intervalSec":0.68}]},{"groups":[{"type":"swarm","count":44,"intervalSec":0.35},{"type":"swarm","count":35,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.68}]},{"groups":[{"type":"tank","count":10,"intervalSec":1.74},{"type":"grunt","count":19,"intervalSec":0.67}]},{"groups":[{"type":"swarm","count":28,"intervalSec":0.35},{"type":"grunt","count":21,"intervalSec":0.67},{"type":"tank","count":8,"intervalSec":1.73}]},{"groups":[{"type":"shield","count":14,"intervalSec":1.52},{"type":"swarm","count":47,"intervalSec":0.34},{"type":"shield","count":6,"intervalSec":1.52}]},{"groups":[{"type":"shield","count":12,"intervalSec":1.51},{"type":"swarm","count":48,"intervalSec":0.34}]},{"groups":[{"type":"boss","count":2,"intervalSec":3},{"type":"tank","count":10,"intervalSec":1.2},{"type":"tank","count":10,"intervalSec":1.2},{"type":"shield","count":8,"intervalSec":1.1},{"type":"shield","count":7,"intervalSec":1.1},{"type":"healer","count":15,"intervalSec":1.4}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.69}]},{"groups":[{"type":"runner","count":25,"intervalSec":0.64},{"type":"healer","count":5,"intervalSec":3.36}]},{"groups":[{"type":"tank","count":7,"intervalSec":1.67},{"type":"swarm","count":37,"intervalSec":0.33},{"type":"grunt","count":23,"intervalSec":0.64}]},{"groups":[{"type":"shield","count":24,"intervalSec":1.46}]},{"groups":[{"type":"swarm","count":38,"intervalSec":0.33},{"type":"runner","count":18,"intervalSec":0.62}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.62},{"type":"shield","count":8,"intervalSec":1.44},{"type":"swarm","count":39,"intervalSec":0.33}]},{"groups":[{"type":"healer","count":5,"intervalSec":3.26},{"type":"grunt","count":32,"intervalSec":0.61}]},{"groups":[{"type":"healer","count":27,"intervalSec":3.24}]},{"groups":[{"type":"tank","count":6,"intervalSec":1.61},{"type":"runner","count":12,"intervalSec":0.6}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"tank","count":9,"intervalSec":1.2},{"type":"tank","count":9,"intervalSec":1.2},{"type":"shield","count":8,"intervalSec":1.1},{"type":"shield","count":7,"intervalSec":1.1},{"type":"healer","count":12,"intervalSec":1.4}]},{"groups":[{"type":"healer","count":9,"intervalSec":3.18},{"type":"healer","count":5,"intervalSec":3.18},{"type":"healer","count":9,"intervalSec":3.18}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.58},{"type":"shield","count":7,"intervalSec":1.38},{"type":"runner","count":23,"intervalSec":0.59}]},{"groups":[{"type":"runner","count":17,"intervalSec":0.59},{"type":"shield","count":11,"intervalSec":1.37},{"type":"tank","count":7,"intervalSec":1.57},{"type":"healer","count":5,"intervalSec":3.14}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.58},{"type":"swarm","count":55,"intervalSec":0.31}]},{"groups":[{"type":"healer","count":4,"intervalSec":3.1},{"type":"runner","count":23,"intervalSec":0.58},{"type":"runner","count":21,"intervalSec":0.58}]},{"groups":[{"type":"runner","count":16,"intervalSec":0.57},{"type":"runner","count":20,"intervalSec":0.57}]},{"groups":[{"type":"healer","count":6,"intervalSec":3.06},{"type":"tank","count":9,"intervalSec":1.53}]},{"groups":[{"type":"healer","count":3,"intervalSec":3.04},{"type":"shield","count":9,"intervalSec":1.32},{"type":"swarm","count":52,"intervalSec":0.3},{"type":"shield","count":12,"intervalSec":1.32}]},{"groups":[{"type":"shield","count":11,"intervalSec":1.31},{"type":"swarm","count":43,"intervalSec":0.3},{"type":"grunt","count":25,"intervalSec":0.56}]},{"groups":[{"type":"boss","count":3,"intervalSec":3},{"type":"tank","count":13,"intervalSec":1.2},{"type":"tank","count":12,"intervalSec":1.2},{"type":"shield","count":9,"intervalSec":1.1},{"type":"shield","count":9,"intervalSec":1.1},{"type":"healer","count":13,"intervalSec":1.4}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.49},{"type":"shield","count":13,"intervalSec":1.29},{"type":"swarm","count":64,"intervalSec":0.3}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.3},{"type":"runner","count":22,"intervalSec":0.54},{"type":"tank","count":7,"intervalSec":1.48}]},{"groups":[{"type":"grunt","count":35,"intervalSec":0.54},{"type":"swarm","count":65,"intervalSec":0.29}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"swarm","count":66,"intervalSec":0.29},{"type":"grunt","count":27,"intervalSec":0.53}]},{"groups":[{"type":"runner","count":18,"intervalSec":0.53},{"type":"tank","count":10,"intervalSec":1.45}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.44},{"type":"swarm","count":56,"intervalSec":0.29}]},{"groups":[{"type":"grunt","count":27,"intervalSec":0.52},{"type":"swarm","count":62,"intervalSec":0.29},{"type":"tank","count":8,"intervalSec":1.43}]},{"groups":[{"type":"runner","count":20,"intervalSec":0.51},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"grunt","count":36,"intervalSec":0.51}]},{"groups":[{"type":"runner","count":26,"intervalSec":0.51},{"type":"healer","count":3,"intervalSec":2.82},{"type":"runner","count":25,"intervalSec":0.51}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"tank","count":12,"intervalSec":1.2},{"type":"tank","count":12,"intervalSec":1.2},{"type":"shield","count":9,"intervalSec":1.1},{"type":"shield","count":9,"intervalSec":1.1},{"type":"healer","count":12,"intervalSec":1.4}]},{"groups":[{"type":"healer","count":4,"intervalSec":2.78},{"type":"swarm","count":62,"intervalSec":0.28},{"type":"shield","count":8,"intervalSec":1.19},{"type":"shield","count":14,"intervalSec":1.19}]},{"groups":[{"type":"healer","count":5,"intervalSec":2.76},{"type":"healer","count":8,"intervalSec":2.76},{"type":"swarm","count":75,"intervalSec":0.28}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.37},{"type":"shield","count":13,"intervalSec":1.17}]},{"groups":[{"type":"tank","count":8,"intervalSec":1.36},{"type":"swarm","count":59,"intervalSec":0.27},{"type":"shield","count":10,"intervalSec":1.16},{"type":"grunt","count":33,"intervalSec":0.48}]},{"groups":[{"type":"grunt","count":37,"intervalSec":0.48},{"type":"tank","count":9,"intervalSec":1.35}]},{"groups":[{"type":"grunt","count":44,"intervalSec":0.47},{"type":"swarm","count":69,"intervalSec":0.27},{"type":"healer","count":7,"intervalSec":2.68},{"type":"shield","count":14,"intervalSec":1.14}]},{"groups":[{"type":"tank","count":9,"intervalSec":1.33},{"type":"shield","count":13,"intervalSec":1.13},{"type":"grunt","count":38,"intervalSec":0.47}]},{"groups":[{"type":"grunt","count":30,"intervalSec":0.46},{"type":"shield","count":13,"intervalSec":1.12},{"type":"shield","count":12,"intervalSec":1.12},{"type":"healer","count":7,"intervalSec":2.64}]},{"groups":[{"type":"healer","count":7,"intervalSec":2.62},{"type":"tank","count":12,"intervalSec":1.31}]},{"groups":[{"type":"boss","count":4,"intervalSec":3},{"type":"tank","count":18,"intervalSec":1.2},{"type":"tank","count":17,"intervalSec":1.2},{"type":"shield","count":14,"intervalSec":1.1},{"type":"shield","count":14,"intervalSec":1.1},{"type":"healer","count":13,"intervalSec":1.4},{"type":"healer","count":13,"intervalSec":1.4}]},{"groups":[{"type":"healer","count":14,"intervalSec":2.58},{"type":"healer","count":11,"intervalSec":2.58},{"type":"healer","count":16,"intervalSec":2.58}]},{"groups":[{"type":"tank","count":13,"intervalSec":1.28},{"type":"shield","count":14,"intervalSec":1.08},{"type":"grunt","count":42,"intervalSec":0.44}]},{"groups":[{"type":"shield","count":14,"intervalSec":1.07},{"type":"grunt","count":42,"intervalSec":0.44},{"type":"shield","count":12,"intervalSec":1.07}]},{"groups":[{"type":"swarm","count":70,"intervalSec":0.25},{"type":"grunt","count":36,"intervalSec":0.43},{"type":"tank","count":9,"intervalSec":1.26},{"type":"runner","count":22,"intervalSec":0.43},{"type":"shield","count":11,"intervalSec":1.06}]},{"groups":[{"type":"swarm","count":55,"intervalSec":0.25},{"type":"runner","count":27,"intervalSec":0.43},{"type":"runner","count":21,"intervalSec":0.43}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.42},{"type":"shield","count":14,"intervalSec":1.04},{"type":"shield","count":9,"intervalSec":1.04},{"type":"shield","count":14,"intervalSec":1.04}]},{"groups":[{"type":"runner","count":21,"intervalSec":0.42},{"type":"tank","count":15,"intervalSec":1.23},{"type":"shield","count":13,"intervalSec":1.03},{"type":"grunt","count":34,"intervalSec":0.42}]},{"groups":[{"type":"shield","count":15,"intervalSec":1.02},{"type":"healer","count":7,"intervalSec":2.44},{"type":"runner","count":20,"intervalSec":0.41},{"type":"shield","count":15,"intervalSec":1.02},{"type":"grunt","count":40,"intervalSec":0.41}]},{"groups":[{"type":"grunt","count":39,"intervalSec":0.41},{"type":"runner","count":20,"intervalSec":0.41},{"type":"grunt","count":33,"intervalSec":0.41}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"tank","count":20,"intervalSec":1.2},{"type":"tank","count":20,"intervalSec":1.2},{"type":"shield","count":18,"intervalSec":1.1},{"type":"shield","count":17,"intervalSec":1.1},{"type":"healer","count":25,"intervalSec":1.4},{"type":"healer","count":25,"intervalSec":1.4}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.24},{"type":"runner","count":28,"intervalSec":0.4},{"type":"grunt","count":43,"intervalSec":0.4},{"type":"shield","count":16,"intervalSec":1}]},{"groups":[{"type":"swarm","count":72,"intervalSec":0.24},{"type":"tank","count":13,"intervalSec":1.18},{"type":"runner","count":25,"intervalSec":0.4},{"type":"shield","count":13,"intervalSec":1},{"type":"shield","count":14,"intervalSec":1}]},{"groups":[{"type":"swarm","count":74,"intervalSec":0.23},{"type":"swarm","count":70,"intervalSec":0.23},{"type":"swarm","count":62,"intervalSec":0.23},{"type":"runner","count":23,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":79,"intervalSec":0.23},{"type":"swarm","count":67,"intervalSec":0.23},{"type":"runner","count":30,"intervalSec":0.4},{"type":"grunt","count":49,"intervalSec":0.4}]},{"groups":[{"type":"swarm","count":104,"intervalSec":0.23},{"type":"swarm","count":93,"intervalSec":0.23},{"type":"healer","count":8,"intervalSec":2.3}]},{"groups":[{"type":"swarm","count":60,"intervalSec":0.23},{"type":"runner","count":27,"intervalSec":0.4},{"type":"healer","count":7,"intervalSec":2.28},{"type":"runner","count":28,"intervalSec":0.4}]},{"groups":[{"type":"grunt","count":36,"intervalSec":0.4},{"type":"runner","count":22,"intervalSec":0.4},{"type":"swarm","count":64,"intervalSec":0.23},{"type":"grunt","count":47,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.26}]},{"groups":[{"type":"shield","count":15,"intervalSec":1},{"type":"tank","count":10,"intervalSec":1.12},{"type":"healer","count":6,"intervalSec":2.24},{"type":"shield","count":13,"intervalSec":1}]},{"groups":[{"type":"healer","count":7,"intervalSec":2.22},{"type":"swarm","count":75,"intervalSec":0.22},{"type":"healer","count":7,"intervalSec":2.22},{"type":"runner","count":25,"intervalSec":0.4}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"tank","count":19,"intervalSec":1.2},{"type":"tank","count":19,"intervalSec":1.2},{"type":"shield","count":16,"intervalSec":1.1},{"type":"shield","count":16,"intervalSec":1.1},{"type":"healer","count":20,"intervalSec":1.4},{"type":"healer","count":20,"intervalSec":1.4}]},{"groups":[{"type":"swarm","count":62,"intervalSec":0.22},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"grunt","count":45,"intervalSec":0.4},{"type":"shield","count":17,"intervalSec":1},{"type":"grunt","count":45,"intervalSec":0.4}]},{"groups":[{"type":"tank","count":17,"intervalSec":1.08},{"type":"runner","count":27,"intervalSec":0.4},{"type":"tank","count":12,"intervalSec":1.08}]},{"groups":[{"type":"swarm","count":64,"intervalSec":0.21},{"type":"tank","count":17,"intervalSec":1.07},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":73,"intervalSec":0.21}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.12},{"type":"healer","count":8,"intervalSec":2.12},{"type":"grunt","count":46,"intervalSec":0.4},{"type":"swarm","count":83,"intervalSec":0.21},{"type":"tank","count":16,"intervalSec":1.06}]},{"groups":[{"type":"runner","count":32,"intervalSec":0.4},{"type":"healer","count":6,"intervalSec":2.1},{"type":"swarm","count":84,"intervalSec":0.21},{"type":"runner","count":26,"intervalSec":0.4},{"type":"shield","count":11,"intervalSec":1}]},{"groups":[{"type":"grunt","count":43,"intervalSec":0.4},{"type":"runner","count":32,"intervalSec":0.4},{"type":"shield","count":18,"intervalSec":1}]},{"groups":[{"type":"swarm","count":86,"intervalSec":0.21},{"type":"healer","count":5,"intervalSec":2.06},{"type":"shield","count":15,"intervalSec":1},{"type":"swarm","count":69,"intervalSec":0.21},{"type":"grunt","count":42,"intervalSec":0.4}]},{"groups":[{"type":"healer","count":6,"intervalSec":2.04},{"type":"grunt","count":44,"intervalSec":0.4},{"type":"tank","count":14,"intervalSec":1.02},{"type":"runner","count":31,"intervalSec":0.4},{"type":"swarm","count":86,"intervalSec":0.2}]},{"groups":[{"type":"boss","count":5,"intervalSec":3},{"type":"tank","count":25,"intervalSec":1.2},{"type":"tank","count":25,"intervalSec":1.2},{"type":"shield","count":23,"intervalSec":1.1},{"type":"shield","count":22,"intervalSec":1.1},{"type":"healer","count":28,"intervalSec":1.4},{"type":"healer","count":27,"intervalSec":1.4}]}]')},b_={waveScore:100,lifeBonus:25,perfectWaveBonus:200,ranks:[{name:"S",min:18e3},{name:"A",min:12e3},{name:"B",min:6e3},{name:"C",min:0}]},Q=x_,sn=v_,wr=__,Xt=y_,Go=b_,Bn=1/20,Qu=.7,Tr=12,Ft=.2,eh=(i,e)=>i.includes("_")?2:Math.max(0,Math.min(e,2)),rn=()=>typeof window>"u"?!1:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<768,M_=()=>typeof window>"u"?1:window.devicePixelRatio;let th=.04,nh=.0016;const S_=45,w_=.04,T_=(i,e)=>{th=i,nh=e},E_=i=>{const e=Math.max(0,i),t=Math.min(e,S_);return 1+e*th+nh*t*t},A_=i=>1+Math.max(0,i)*w_,ke={isMobile:rn(),maxParticles:rn()?200:800,enablePostProcessing:!rn(),enableShadows:!rn(),pixelRatio:rn()?1:Math.min(M_(),2),terrain:{underlayPadding:rn()?20:28,underlaySegments:rn()?36:72},atmosphere:{fogColor:1057815,fogDensity:rn()?.011:.014,spawnPulseSpeed:2.4,goalPulseSpeed:1.7,bloomStrength:rn()?.38:.62,bloomRadius:rn()?.28:.45,bloomThreshold:rn()?.9:.82,vignetteStrength:rn()?.1:.16,grainAmount:rn()?0:.018}},R_={cornerRadius:.34,sampleSpacing:.12,entryExtension:.42,exitExtension:0,cornerSteps:8};function C_(i){if(i.length<=2)return i.map(Ti);const e=[Ti(i[0])];for(let t=1;t<i.length-1;t+=1){const n=i[t-1],s=i[t],r=i[t+1],o=s.x-n.x,a=s.z-n.z,l=r.x-s.x,c=r.z-s.z,d=o*c-a*l,u=o*l+a*c;(Math.abs(d)>1e-7||u<=0)&&e.push(Ti(s))}return e.push(Ti(i[i.length-1])),e}function P_(i,e={}){if(i.length<2)return i.map(Ti);const t={...R_,...e},n=C_(i),s=[],r=Vo(n[0],n[1]);Yi(s,{x:n[0].x-r.x*t.entryExtension,z:n[0].z-r.z*t.entryExtension}),Yi(s,n[0]);const o=Math.max(2,Math.floor(t.cornerSteps??8));for(let l=1;l<n.length-1;l+=1){const c=n[l-1],d=n[l],u=n[l+1],h=Vo(c,d),f=Vo(d,u),g=Math.min(Math.max(0,t.cornerRadius),Wo(c,d)*.45,Wo(d,u)*.45),x={x:d.x-h.x*g,z:d.z-h.z*g},m={x:d.x+f.x*g,z:d.z+f.z*g};Yi(s,x);for(let p=1;p<=o;p+=1){const S=p/o,b=1-S;Yi(s,{x:b*b*x.x+2*b*S*d.x+S*S*m.x,z:b*b*x.z+2*b*S*d.z+S*S*m.z})}}const a=n[n.length-1];if(Yi(s,a),t.exitExtension>0){const l=Vo(n[n.length-2],a);Yi(s,{x:a.x+l.x*t.exitExtension,z:a.z+l.z*t.exitExtension})}return I_(s,Math.max(.04,t.sampleSpacing))}function I_(i,e){if(i.length<2)return i.map(Ti);const t=[0];for(let o=1;o<i.length;o+=1)t.push(t[o-1]+Wo(i[o-1],i[o]));const n=t[t.length-1];if(n<=1e-8)return[Ti(i[0])];const s=[];let r=1;for(let o=0;o<n;o+=e){for(;r<t.length-1&&t[r]<o;)r+=1;const a=t[r-1],l=t[r]-a,c=l<=1e-8?0:(o-a)/l,d=i[r-1],u=i[r];s.push({x:d.x+(u.x-d.x)*c,z:d.z+(u.z-d.z)*c})}return Yi(s,i[i.length-1]),s}function Vo(i,e){const t=e.x-i.x,n=e.z-i.z,s=Math.hypot(t,n)||1;return{x:t/s,z:n/s}}function Wo(i,e){return Math.hypot(e.x-i.x,e.z-i.z)}function Ti(i){return{x:i.x,z:i.z}}function Yi(i,e){const t=i[i.length-1];(!t||Wo(t,e)>1e-8)&&i.push(Ti(e))}function et(i,e){return{x:Q.origin.x+(i+.5)*Q.cellSize,z:Q.origin.z+(e+.5)*Q.cellSize}}function sc(){return P_(Q.path.map(([i,e])=>et(i,e)))}function L_(i,e){const t=i.x-e.x,n=i.z-e.z;return Math.sqrt(t*t+n*n)}function D_(){return[{name:"Airstrike",emoji:"✈️",cooldown:60,remaining:0,description:"All enemies take 200 AOE damage"},{name:"Freeze",emoji:"🧊",cooldown:45,remaining:0,description:"Freeze all enemies for 5s"},{name:"Repair",emoji:"💖",cooldown:90,remaining:0,description:"Restore 5 lives"}]}function U_(){return{totalDamageDealt:0,damageByType:{},killsByTower:{},longestStreak:0,towersBuilt:0,towersSold:0,goldEarned:0,goldSpent:0}}function Er(i="normal"){const e=sc(),t=new Set;for(const[s,r]of Q.path)t.add(ic(s,r));const n=Ju[i];return{phase:"idle",gold:n.startGold,lives:n.startLives,maxLives:n.startLives,currentWave:0,score:0,perfectWaves:0,speedMultiplier:1,paused:!1,totalKills:0,difficulty:i,towers:[],enemies:[],projectiles:[],prepTimer:0,spawnTimers:[],spawnCounts:[],waveEnemiesSpawned:0,waveEnemiesTotal:0,waveLivesLostThisWave:0,lastWaveClearGold:0,milestoneReached:0,waveModifier:null,buffGoldMult:1,buffDamageMult:1,buffRangeMult:1,buffChoicePending:!1,endlessMode:!1,nextId:1,killStreak:0,killStreakTimer:0,floatingTexts:[],skills:D_(),stats:U_(),pathWorld:e,occupiedCells:new Set,pathCells:t}}function rc(i){i.occupiedCells.clear();for(const e of i.towers)i.occupiedCells.add(ic(e.col,e.row))}class N_{constructor(){J(this,"listeners",new Map)}on(e,t){this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t)}off(e,t){const n=this.listeners.get(e);if(!n)return;const s=n.indexOf(t);s>=0&&n.splice(s,1)}emit(e){const t=this.listeners.get(e.type);if(t)for(const n of t)n(e)}clear(){this.listeners.clear()}}const ze=new N_,Xo={BLITZ:{key:"BLITZ",label:"BLITZ",emoji:"⚡",desc:"+25% SPD, +30% gold",spdMult:1.25,hpMult:1,armorBonus:0,bountyMult:1.3},ARMORED:{key:"ARMORED",label:"ARMORED",emoji:"🛡",desc:"+3 armor, +20% gold",spdMult:1,hpMult:1,armorBonus:3,bountyMult:1.2},FRENZY:{key:"FRENZY",label:"FRENZY",emoji:"🔥",desc:"+15% HP, +15% SPD, +25% gold",spdMult:1.15,hpMult:1.15,armorBonus:0,bountyMult:1.25}},ih=Object.keys(Xo);function F_(i){return i%5!==0||i===25||i===50||i===75||i===99?null:ih[(Math.floor(i/5)-1)%ih.length]}function oc(i){if(i.currentWave<Xt.waves.length)return i.currentWave;const e=Math.max(1,Xt.waves.length-40);return 40+(i.currentWave-Xt.waves.length)%e}function ac(i){if(i.currentWave>=Xt.waves.length&&!i.endlessMode)return;i.phase="prep",i.prepTimer=Xt.prepSec,i.waveLivesLostThisWave=0;const e=Xt.waves[oc(i)];i.spawnTimers=e.groups.map(()=>0),i.spawnCounts=e.groups.map(()=>0),i.waveEnemiesSpawned=0,i.waveEnemiesTotal=e.groups.reduce((t,n)=>t+n.count,0),i.waveModifier=F_(i.currentWave+1)}function sh(i,e){if(i.phase==="prep"){if(i.prepTimer-=e,i.prepTimer<=0){const r=Math.min(150,Math.max(10,Math.floor(i.gold*.01)));i.gold+=r,i.stats.goldEarned+=r,i.floatingTexts.push({id:i.nextId++,worldX:0,worldZ:0,value:`+${r}g 利息`,color:"#aaff55",life:2,maxLife:2}),i.phase="wave"}i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));return}if(i.phase!=="wave")return;i.killStreakTimer>0&&(i.killStreakTimer-=e,i.killStreakTimer<=0&&(i.killStreak=0,i.killStreakTimer=0));const t=Xt.waves[oc(i)];if(!t)return;for(let r=0;r<t.groups.length;r++){const o=t.groups[r];i.spawnCounts[r]>=o.count||(i.spawnTimers[r]-=e,i.spawnTimers[r]<=0&&(rh(i,o.type),i.spawnCounts[r]++,i.waveEnemiesSpawned++,i.spawnTimers[r]=o.intervalSec))}const n=i.waveEnemiesSpawned>=i.waveEnemiesTotal,s=i.enemies.every(r=>!r.alive||r.reached);if(n&&s){i.score+=i.currentWave<Xt.waves.length?Go.waveScore:0,i.waveLivesLostThisWave===0&&(i.score+=Go.perfectWaveBonus,i.perfectWaves++);const r=i.currentWave+1;let o=100;r>60?o=250:r>30?o=200:r>10?o=150:o=120,i.gold+=o,i.stats.goldEarned+=o,i.lastWaveClearGold=o;const a=i.waveLivesLostThisWave===0;ze.emit({type:"waveCleared",wave:r,goldBonus:o,perfect:a}),r===99||r>0&&r%25===0?(i.gold+=500,i.stats.goldEarned+=500,i.milestoneReached=r,ze.emit({type:"milestone",wave:r})):i.milestoneReached=0,i.currentWave++,i.enemies=i.enemies.filter(c=>c.alive&&!c.reached),i.projectiles=i.projectiles.filter(c=>c.alive),i.currentWave>=Xt.waves.length&&!i.endlessMode?(i.score+=i.lives*Go.lifeBonus,i.phase="won",ze.emit({type:"gameOver",won:!0,score:i.score})):ac(i)}}function rh(i,e){const t=wr[e],n=i.pathWorld[0],s=Ju[i.difficulty],r=i.currentWave,o=E_(r),a=A_(r),l=i.waveModifier?Xo[i.waveModifier]:null,c=o*s.enemyHpMult*((l==null?void 0:l.hpMult)??1),d=s.enemySpeedMult*((l==null?void 0:l.spdMult)??1),u=Math.pow(a,.5)*s.goldMult*((l==null?void 0:l.bountyMult)??1),h=(l==null?void 0:l.armorBonus)??0,f={id:i.nextId++,type:e,hp:Math.ceil(t.hp*c),maxHp:Math.ceil(t.hp*c),speed:t.speed*d,bounty:Math.ceil(t.bounty*u),pathIndex:0,pathProgress:0,worldX:n.x,worldZ:n.z,prevWorldX:n.x,prevWorldZ:n.z,alive:!0,reached:!1,slow:null,dots:[],shield:t.shield?Math.ceil(t.shield*c):0,maxShield:t.shield?Math.ceil(t.shield*c):0,armor:(t.armor??0)+h,special:t.special??"none",healCooldown:0,shieldRegenTimer:0,dotFloatTimer:0};i.enemies.push(f),ze.emit({type:"enemySpawned",enemyId:f.id,enemyType:e,worldX:f.worldX,worldZ:f.worldZ}),e==="boss"&&ze.emit({type:"bossSpawned",enemyId:f.id,worldX:f.worldX,worldZ:f.worldZ})}const Ei=[{id:"verdant-border",title:"Verdant Border",subtitle:"Hold the forest gate",startWave:1,endWave:20,accent:8316807,fog:1523499,tint:[1,1.03,.98],tacticalFocus:"Learn lanes, range and focused fire"},{id:"sunken-gorge",title:"Sunken Gorge",subtitle:"Control both bridgeheads",startWave:21,endWave:40,accent:6740479,fog:1325634,tint:[.92,1.02,1.08],tacticalFocus:"Break shields and cover the river crossing"},{id:"crystal-hollow",title:"Crystal Hollow",subtitle:"Counter the awakened host",startWave:41,endWave:60,accent:13016319,fog:3023944,tint:[1.04,.94,1.1],tacticalFocus:"Mix damage types against specialised formations"},{id:"ember-ridge",title:"Ember Ridge",subtitle:"Survive the collapsing front",startWave:61,endWave:80,accent:16751706,fog:4858909,tint:[1.1,.94,.86],tacticalFocus:"Answer dense assaults without abandoning the rear line"},{id:"last-bastion",title:"Last Bastion",subtitle:"Defend the citadel",startWave:81,endWave:99,accent:16767083,fog:2366511,tint:[1.04,.98,1.04],tacticalFocus:"Refine the complete defence and defeat the final siege"}];function Ar(i){const e=Math.max(1,Math.floor(Number.isFinite(i)?i:1));return Ei.find(t=>e<=t.endWave)??Ei[Ei.length-1]}function O_(i){const e=Ar(i),t=e.endWave-e.startWave+1;return Math.max(0,Math.min(1,(i-e.startWave+1)/t))}function k_(i){return Ar(i).startWave===i}function oh(i,e,t){const n=[...i],s=[];let r=t>>>0||1831565813;const o=()=>(r^=r<<13,r^=r>>>17,r^=r<<5,(r>>>0)/4294967296);for(;s.length<Math.max(0,e)&&n.length>0;)s.push(n.splice(Math.floor(o()*n.length),1)[0]);return s}function ah(i,e=0){return(Math.imul(Math.max(1,Math.floor(i)),2654435761)^2246822507^e)>>>0}function B_(i,e,t){const n=oh(e,1,ah(t,1464421444));return oh([...i,...n],i.length+n.length,ah(t,1330005586))}function z_(i){return Math.max(1,Math.floor(Math.max(1,i)/25))%2===0?{coreIds:["range","fortify"],wildcardIds:["gold","bounty"]}:{coreIds:["damage","range"],wildcardIds:["gold","fortify","bounty"]}}function lh(i,e){e.hp=0,e.alive=!1;const t=Math.ceil(e.bounty*i.buffGoldMult);i.gold+=t,i.totalKills++,i.stats.goldEarned+=t,i.killStreak++,i.killStreakTimer=3,i.stats.longestStreak=Math.max(i.stats.longestStreak,i.killStreak),i.killStreak%10===0&&(i.gold+=50,i.stats.goldEarned+=50,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`⚡ x${i.killStreak} COMBO! +50g`,color:"#ffee00",life:2,maxLife:2}),ze.emit({type:"streakBonus",streak:i.killStreak,gold:50})),i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`+${t}g`,color:"#ffd700",life:1.2,maxLife:1.2}),ze.emit({type:"enemyKilled",enemyId:e.id,worldX:e.worldX,worldZ:e.worldZ,bounty:e.bounty,killStreak:i.killStreak})}const H_=1,lc=4,G_=20,V_=50,W_=80;function ch(i,e){const t=i.pathWorld;if(t.length<2)return;let n=1;i.currentWave>=W_?n=1.3:i.currentWave>=V_&&(n=1.15);for(const s of i.enemies){if(!s.alive||s.reached)continue;s.prevWorldX=s.worldX,s.prevWorldZ=s.worldZ;for(let a=s.dots.length-1;a>=0;a--){const l=s.dots[a];if(X_(i,s,l.dps,l.damageType,e),l.remaining-=e,l.remaining<=0&&s.dots.splice(a,1),!s.alive)break}if(!s.alive)continue;let r=s.speed*n;if(s.slow&&(r*=1-s.slow.pct,s.slow.remaining-=e,s.slow.remaining<=0&&(s.slow=null)),s.special==="heal"){const a=wr[s.type];if(s.healCooldown-=e,s.healCooldown<=0){const l=a.healRadius??2.5,c=a.healAmount??15;for(const d of i.enemies){if(!d.alive||d.reached||d.id===s.id)continue;const u=d.worldX-s.worldX,h=d.worldZ-s.worldZ;Math.sqrt(u*u+h*h)<=l&&(d.hp=Math.min(d.maxHp,d.hp+c))}s.healCooldown=a.healIntervalSec??2}}s.maxShield>0&&s.shield<s.maxShield&&(s.dots.length>0?s.shieldRegenTimer=lc:(s.shieldRegenTimer-=e,s.shieldRegenTimer<=0&&(s.shield=Math.min(s.maxShield,s.shield+G_*e))));let o=r*e;for(;o>0&&s.pathIndex<t.length-1;){const a=t[s.pathIndex],l=t[s.pathIndex+1],c=L_(a,l);if(c<=0){s.pathIndex++;continue}const d=s.pathProgress*c,h=d+o;h>=c?(o-=c-d,s.pathIndex++,s.pathProgress=0):(s.pathProgress=h/c,o=0)}if(s.pathIndex>=t.length-1){s.reached=!0,s.alive=!1,i.lives--,i.waveLivesLostThisWave++,ze.emit({type:"enemyReachedGoal",enemyId:s.id,livesRemaining:Math.max(0,i.lives)}),i.lives<=0&&(i.lives=0,i.phase="lost");const a=t[t.length-1];s.worldX=a.x,s.worldZ=a.z}else{const a=t[s.pathIndex],l=t[s.pathIndex+1];s.worldX=a.x+(l.x-a.x)*s.pathProgress,s.worldZ=a.z+(l.z-a.z)*s.pathProgress}}}function dh(i,e,t,n){const s=i.dots.find(r=>r.damageType===n);if(s){s.dps=Math.max(s.dps,e),s.remaining=Math.max(s.remaining,t);return}i.dots.push({dps:e,remaining:t,damageType:n})}function X_(i,e,t,n,s){var l,c;const r=wr[e.type];let o=t;(l=r.weakness)!=null&&l.includes(n)&&(o*=1.5),(c=r.resistance)!=null&&c.includes(n)&&(o*=.5),o=Math.max(H_,o-e.armor);const a=o*s;e.maxShield>0&&(e.shieldRegenTimer=lc),e.dotFloatTimer=(e.dotFloatTimer??0)-s,o>=2&&e.dotFloatTimer<=0&&(e.dotFloatTimer=1,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}`,color:"#66ee44",life:.8,maxLife:.8})),e.hp-=a,i.stats.totalDamageDealt+=a,i.stats.damageByType[n]=(i.stats.damageByType[n]??0)+a,e.hp<=0&&lh(i,e)}function uh(i,e){for(const t of i.towers){t.cooldownRemaining-=e;const n=sn[t.type],s=n.levels[t.level],r=s.range*i.buffRangeMult;let o=null,a=t.targetingMode==="last"?1/0:-1/0;for(const l of i.enemies){if(!l.alive||l.reached)continue;const c=l.worldX-t.worldX,d=l.worldZ-t.worldZ;if(Math.sqrt(c*c+d*d)<=r){const h=l.pathIndex+l.pathProgress;let f;switch(t.targetingMode){case"first":f=h,f>a&&(a=f,o=l);break;case"last":f=h,f<a&&(a=f,o=l);break;case"strongest":f=l.hp+l.shield,f>a&&(a=f,o=l);break;case"weakest":f=-(l.hp+l.shield),f>a&&(a=f,o=l);break}}}if(t.targetId=o?o.id:null,!(t.cooldownRemaining>0)&&o){const l=Ft+.8+eh(t.type,t.level)*.5;let c=0,d=Tr;t.type==="cannon"||t.type==="poison"?(c=1.5,d=Tr*.8):t.type==="lightning"?d=Tr*8:t.type==="sniper"?d=Tr*4:t.type==="fire"&&(d=Tr*.6);const u={id:i.nextId++,fromTowerId:t.id,targetEnemyId:o.id,towerType:t.type,damageType:n.damageType,damage:s.damage*i.buffDamageMult,aoeRadius:s.aoeRadius,slow:s.slow,dot:s.dot,chain:s.chain,x:t.worldX,y:l,z:t.worldZ,startX:t.worldX,startY:l,startZ:t.worldZ,targetX:o.worldX,targetY:Ft+.35,targetZ:o.worldZ,speed:d,progress:0,arcHeight:c,alive:!0};i.projectiles.push(u),t.cooldownRemaining=s.cooldownSec,t.aimAngle=Math.atan2(o.worldX-t.worldX,o.worldZ-t.worldZ),ze.emit({type:"towerFired",towerId:t.id,towerType:t.type,worldX:t.worldX,worldZ:t.worldZ,aimAngle:t.aimAngle})}}}function hh(i,e){for(const t of i.projectiles){if(!t.alive)continue;const n=i.enemies.find(c=>c.id===t.targetEnemyId);n&&n.alive&&!n.reached&&(t.targetX=n.worldX,t.targetZ=n.worldZ);const s=t.targetX-t.x,r=t.targetY-t.y,o=t.targetZ-t.z,a=Math.sqrt(s*s+r*r+o*o),l=t.speed*e;if(a<=l||a<.1)if(t.alive=!1,t.aoeRadius>0){ze.emit({type:"aoeImpact",worldX:t.targetX,worldZ:t.targetZ,radius:t.aoeRadius,towerType:t.towerType});for(const c of i.enemies){if(!c.alive||c.reached)continue;const d=c.worldX-t.targetX,u=c.worldZ-t.targetZ;Math.sqrt(d*d+u*u)<=t.aoeRadius&&(Rr(i,c,t.damage,t.damageType,t.fromTowerId),t.slow&&(c.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&dh(c,t.dot.dps,t.dot.durationSec,t.damageType))}}else if(t.chain&&t.chain.targets>0){const c=[];n&&n.alive&&!n.reached&&(Rr(i,n,t.damage,t.damageType,t.fromTowerId),c.push(n),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}));let d=n;for(let u=0;u<t.chain.targets&&d;u++){let h=null,f=t.chain.rangeFalloff;for(const g of i.enemies){if(!g.alive||g.reached||c.includes(g))continue;const x=g.worldX-d.worldX,m=g.worldZ-d.worldZ,p=Math.sqrt(x*x+m*m);p<f&&(f=p,h=g)}if(h)Rr(i,h,t.damage*.7,t.damageType,t.fromTowerId),c.push(h),d=h;else break}}else n&&n.alive&&!n.reached&&(Rr(i,n,t.damage,t.damageType,t.fromTowerId),t.slow&&(n.slow={pct:t.slow.pct,remaining:t.slow.durationSec}),t.dot&&dh(n,t.dot.dps,t.dot.durationSec,t.damageType));else{const c=1/a;t.x+=s*c*l,t.z+=o*c*l;const d=t.targetX-t.startX,u=t.targetZ-t.startZ,h=Math.max(.1,Math.sqrt(d*d+u*u)),f=t.x-t.startX,g=t.z-t.startZ,x=Math.sqrt(f*f+g*g);t.progress=Math.min(1,x/h);const m=t.startY+(t.targetY-t.startY)*t.progress;t.arcHeight>0?t.y=m+Math.sin(t.progress*Math.PI)*t.arcHeight:t.y=m}}i.projectiles=i.projectiles.filter(t=>t.alive)}function Rr(i,e,t,n,s){var l,c,d;const r=wr[e.type];let o=t;if((l=r.weakness)!=null&&l.includes(n)&&(o*=1.5),(c=r.resistance)!=null&&c.includes(n)&&(o*=.5),o=Math.max(1,o-e.armor),e.maxShield>0&&(e.shieldRegenTimer=lc),e.shield>0)if(o<=e.shield){i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}🛡`,color:"#88ddff",life:1,maxLife:1}),e.shield-=o;return}else{const u=e.shield;o-=e.shield,e.shield=0,i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(u)}🛡`,color:"#88ddff",life:1,maxLife:1})}const a=(d=r.weakness)==null?void 0:d.includes(n);if(i.floatingTexts.push({id:i.nextId++,worldX:e.worldX,worldZ:e.worldZ,value:`-${Math.round(o)}`,color:a?"#ffdd44":"#ff6655",life:1,maxLife:1}),e.hp-=o,i.stats.totalDamageDealt+=o,i.stats.damageByType[n]=(i.stats.damageByType[n]??0)+o,e.hp<=0){if(s!==void 0){const u=i.towers.find(h=>h.id===s);u&&(u.kills++,i.stats.killsByTower[u.type]=(i.stats.killsByTower[u.type]??0)+1)}lh(i,e)}}const Yo=(i,e)=>`${i},${e}`,Y_=new Map(Q.path.map((i,e)=>[Yo(i[0],i[1]),e])),q_=new Map((Q.terrainTiles??[]).map(i=>[Yo(i.cell[0],i.cell[1]),i])),fh=["tile_hill","tile_tree","tile_treeDouble","tile_rock","tile_crystal"],j_=(i,e)=>{let t=1/0;for(const[n,s]of Q.path)t=Math.min(t,Math.max(Math.abs(i-n),Math.abs(e-s)));return t},$_=(i,e)=>{const t=Math.abs(Math.imul(i+37,73856093)^Math.imul(e+61,19349663));return{cell:[i,e],model:fh[t%fh.length],rotK:(t>>>5)%4,buildable:!1}};function ph(i,e){var f,g;const t=i>=0&&i<Q.cols&&e>=0&&e<Q.rows,n=t?j_(i,e):1/0,s=(f=Q.playableRows)==null?void 0:f[e],r=!s||i>=s[0]&&i<=s[1],o=t&&r&&n<=Q.landRadius,a=Y_.get(Yo(i,e))??-1,l=q_.get(Yo(i,e))??null,c=o&&a<0&&n===Q.landRadius,d=l??(c?$_(i,e):null),u=o&&a<0&&n<=Q.buildRadius&&(d==null?void 0:d.buildable)!==!1,h=o?((g=Q.regions)==null?void 0:g.find(({colRange:x})=>i>=x[0]&&i<=x[1]))??null:null;return{col:i,row:e,exists:o,buildable:u,pathIndex:a,distanceFromPath:n,terrain:d,region:h}}const Hs=[];for(let i=0;i<Q.rows;i+=1)for(let e=0;e<Q.cols;e+=1){const t=ph(e,i);t.exists&&Hs.push(t)}const Qe={cells:Hs,path:Q.path,regions:Q.regions??[],bounds:{minCol:Math.min(...Hs.map(i=>i.col)),maxCol:Math.max(...Hs.map(i=>i.col)),minRow:Math.min(...Hs.map(i=>i.row)),maxRow:Math.max(...Hs.map(i=>i.row))},cellAt:ph};function mh(i,e,t){if(!Qe.cellAt(e,t).buildable)return!1;const n=ic(e,t);return!(i.pathCells.has(n)||i.occupiedCells.has(n))}function gh(i,e,t,n){const s=sn[e].levels[0];if(i.gold<s.buildCost||!mh(i,t,n))return null;const r=et(t,n),o={id:i.nextId++,type:e,level:0,col:t,row:n,worldX:r.x,worldZ:r.z,cooldownRemaining:0,totalInvested:s.buildCost,targetingMode:"first",kills:0};return i.gold-=s.buildCost,i.stats.towersBuilt++,i.stats.goldSpent+=s.buildCost,i.towers.push(o),rc(i),ze.emit({type:"towerBuilt",towerId:o.id,towerType:o.type,col:o.col,row:o.row}),o}function xh(i,e){const t=i.towers.find(r=>r.id===e);if(!t)return!1;const n=sn[t.type].levels;if(t.level>=n.length-1)return!1;const s=n[t.level+1];return i.gold<s.upgradeCost?!1:(i.gold-=s.upgradeCost,i.stats.goldSpent+=s.upgradeCost,t.totalInvested+=s.upgradeCost,t.level++,ze.emit({type:"towerUpgraded",towerId:t.id,newLevel:t.level}),!0)}function K_(i,e){const t=i.towers.findIndex(r=>r.id===e);if(t===-1)return 0;const n=i.towers[t],s=Math.floor(n.totalInvested*Qu);return i.gold+=s,i.stats.towersSold++,i.towers.splice(t,1),rc(i),ze.emit({type:"towerSold",towerId:n.id,refund:s,worldX:n.worldX,worldZ:n.worldZ}),s}function vh(i){return Math.floor(i.totalInvested*Qu)}function Z_(i,e){const t=sn[e.type].levels;return e.level>=t.length-1?!1:i.gold>=t[e.level+1].upgradeCost}function _h(i,e,t){const n=i.towers.find(o=>o.id===e);if(!n)return!1;const s=sn[n.type];if(!s.evolutions)return!1;const r=s.evolutions.find(o=>o.type===t);return!r||i.gold<r.cost?!1:(i.gold-=r.cost,i.stats.goldSpent+=r.cost,n.totalInvested+=r.cost,n.type=t,n.level=0,ze.emit({type:"towerUpgraded",towerId:n.id,newLevel:0}),!0)}function yh(i,e){if(e===Ep)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===ol||e===fd){let t=i.getIndex();if(t===null){const o=[],a=i.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);i.setIndex(o),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}const n=t.count-2,s=[];if(e===ol)for(let o=1;o<=n;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=i.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}class J_ extends zs{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new iy(t)}),this.register(function(t){return new sy(t)}),this.register(function(t){return new fy(t)}),this.register(function(t){return new py(t)}),this.register(function(t){return new my(t)}),this.register(function(t){return new oy(t)}),this.register(function(t){return new ay(t)}),this.register(function(t){return new ly(t)}),this.register(function(t){return new cy(t)}),this.register(function(t){return new ny(t)}),this.register(function(t){return new dy(t)}),this.register(function(t){return new ry(t)}),this.register(function(t){return new hy(t)}),this.register(function(t){return new uy(t)}),this.register(function(t){return new ey(t)}),this.register(function(t){return new gy(t)}),this.register(function(t){return new xy(t)})}load(e,t,n,s){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=Sr.extractUrlBase(e);o=Sr.resolveURL(c,this.path)}else o=Sr.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){s?s(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Xu(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(d){t(d),r.manager.itemEnd(e)},a)}catch(d){a(d)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r;const o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===bh){try{o[Ge.KHR_BINARY_GLTF]=new vy(e)}catch(u){s&&s(u);return}r=JSON.parse(o[Ge.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new Iy(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let d=0;d<this.pluginCallbacks.length;d++){const u=this.pluginCallbacks[d](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let d=0;d<r.extensionsUsed.length;++d){const u=r.extensionsUsed[d],h=r.extensionsRequired||[];switch(u){case Ge.KHR_MATERIALS_UNLIT:o[u]=new ty;break;case Ge.KHR_DRACO_MESH_COMPRESSION:o[u]=new _y(r,this.dracoLoader);break;case Ge.KHR_TEXTURE_TRANSFORM:o[u]=new yy;break;case Ge.KHR_MESH_QUANTIZATION:o[u]=new by;break;default:h.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,s)}parseAsync(e,t){const n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}}function Q_(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}const Ge={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class ey{constructor(e){this.parser=e,this.name=Ge.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let s=t.cache.get(n);if(s)return s;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let c;const d=new se(16777215);l.color!==void 0&&d.setRGB(l.color[0],l.color[1],l.color[2],Ht);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new Ho(d),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new zo(d),c.distance=u;break;case"spot":c=new t_(d),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,ci(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(c),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}class ty{constructor(){this.name=Ge.KHR_MATERIALS_UNLIT}getMaterialType(){return He}extendParams(e,t,n){const s=[];e.color=new se(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Ht),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,It))}return Promise.all(s)}}class ny{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class iy{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new we(a,a)}return Promise.all(r)}}class sy{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class ry{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class oy{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new se(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=s.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Ht)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,It)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class ay{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class ly{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new se().setRGB(a[0],a[1],a[2],Ht),Promise.all(r)}}class cy{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class dy{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new se().setRGB(a[0],a[1],a[2],Ht),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,It)),Promise.all(r)}}class uy{constructor(e){this.parser=e,this.name=Ge.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}}class hy{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:On}extendMaterialParams(e,t){const n=this.parser,s=n.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class fy{constructor(e){this.parser=e,this.name=Ge.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;const r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class py{constructor(e){this.parser=e,this.name=Ge.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class my{constructor(e){this.parser=e,this.name=Ge.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class gy{constructor(e){this.name=Ge.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const l=s.byteOffset||0,c=s.byteLength||0,d=s.count,u=s.byteStride,h=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(d,u,h,s.mode,s.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(d*u);return o.decodeGltfBuffer(new Uint8Array(f),d,u,h,s.mode,s.filter),f})})}else return null}}class xy{constructor(e){this.name=Ge.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const s=t.meshes[n.mesh];for(const c of s.primitives)if(c.mode!==mn.TRIANGLES&&c.mode!==mn.TRIANGLE_STRIP&&c.mode!==mn.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(d=>(l[c]=d,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const d=c.pop(),u=d.isGroup?d.children:[d],h=c[0].count,f=[];for(const g of u){const x=new Ie,m=new R,p=new Qn,S=new R(1,1,1),b=new Us(g.geometry,g.material,h);for(let v=0;v<h;v++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,v),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,v),l.SCALE&&S.fromBufferAttribute(l.SCALE,v),b.setMatrixAt(v,x.compose(m,p,S));for(const v in l)if(v==="_COLOR_0"){const I=l[v];b.instanceColor=new Yl(I.array,I.itemSize,I.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&g.geometry.setAttribute(v,l[v]);at.prototype.copy.call(b,g),this.parser.assignFinalMaterial(b),f.push(b)}return d.isGroup?(d.clear(),d.add(...f),d):f[0]}))}}const bh="glTF",Cr=12,Mh={JSON:1313821514,BIN:5130562};class vy{constructor(e){this.name=Ge.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Cr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==bh)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const s=this.header.length-Cr,r=new DataView(e,Cr);let o=0;for(;o<s;){const a=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===Mh.JSON){const c=new Uint8Array(e,Cr+o,a);this.content=n.decode(c)}else if(l===Mh.BIN){const c=Cr+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class _y{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ge.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const d in o){const u=dc[d]||d.toLowerCase();a[u]=o[d]}for(const d in e.attributes){const u=dc[d]||d.toLowerCase();if(o[d]!==void 0){const h=n.accessors[e.attributes[d]],f=Gs[h.componentType];c[u]=f.name,l[u]=h.normalized===!0}}return t.getDependency("bufferView",r).then(function(d){return new Promise(function(u,h){s.decodeDracoFile(d,function(f){for(const g in f.attributes){const x=f.attributes[g],m=l[g];m!==void 0&&(x.normalized=m)}u(f)},a,c,Ht,h)})})}}class yy{constructor(){this.name=Ge.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class by{constructor(){this.name=Ge.KHR_MESH_QUANTIZATION}}class Sh extends yr{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,d=s-t,u=(n-t)/d,h=u*u,f=h*u,g=e*c,x=g-c,m=-2*f+3*h,p=f-h,S=1-m,b=p-h+u;for(let v=0;v!==a;v++){const I=o[x+v+a],E=o[x+v+l]*d,A=o[g+v+a],L=o[g+v]*d;r[v]=S*I+b*E+m*A+p*L}return r}}const My=new Qn;class Sy extends Sh{interpolate_(e,t,n,s){const r=super.interpolate_(e,t,n,s);return My.fromArray(r).normalize().toArray(r),r}}const mn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Gs={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},wh={9728:zt,9729:Qt,9984:ed,9985:Zr,9986:tr,9987:jn},Th={33071:mi,33648:Kr,10497:cs},cc={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},dc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Ai={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},wy={CUBICSPLINE:void 0,LINEAR:sr,STEP:ir},uc={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Ty(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new jt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Yn})),i.DefaultMaterial}function qi(i,e,t){for(const n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function ci(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function Ey(i,e,t){let n=!1,s=!1,r=!1;for(let c=0,d=e.length;c<d;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);const o=[],a=[],l=[];for(let c=0,d=e.length;c<d;c++){const u=e[c];if(n){const h=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;o.push(h)}if(s){const h=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;a.push(h)}if(r){const h=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;l.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const d=c[0],u=c[1],h=c[2];return n&&(i.morphAttributes.position=d),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=h),i.morphTargetsRelative=!0,i})}function Ay(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Ry(i){let e;const t=i.extensions&&i.extensions[Ge.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+hc(t.attributes):e=i.indices+":"+hc(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+hc(i.targets[n]);return e}function hc(i){let e="";const t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function fc(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Cy(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const Py=new Ie;class Iy{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Q_,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);s=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?this.textureLoader=new Jv(this.options.manager):this.textureLoader=new r_(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Xu(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return qi(r,a,s),ci(a,s),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){const o=t[s].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){const o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const s=n.clone(),r=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,d]of o.children.entries())r(d,a.children[c])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const s=e(t[n]);if(s)return s}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let s=0;s<t.length;s++){const r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ge.KHR_BINARY_GLTF].body);const s=this.options;return new Promise(function(r,o){n.load(Sr.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){const t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){const o=cc[s.type],a=Gs[s.componentType],l=s.normalized===!0,c=new a(s.count*o);return Promise.resolve(new vt(c,o,l))}const r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],l=cc[s.type],c=Gs[s.componentType],d=c.BYTES_PER_ELEMENT,u=d*l,h=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0;let x,m;if(f&&f!==u){const p=Math.floor(h/f),S="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count;let b=t.cache.get(S);b||(x=new c(a,p*f,s.count*f/d),b=new Lv(x,f/d),t.cache.add(S,b)),m=new Gl(b,l,h%f/d,g)}else a===null?x=new c(s.count*l):x=new c(a,h,s.count*l),m=new vt(x,l,g);if(s.sparse!==void 0){const p=cc.SCALAR,S=Gs[s.sparse.indices.componentType],b=s.sparse.indices.byteOffset||0,v=s.sparse.values.byteOffset||0,I=new S(o[1],b,s.sparse.count*p),E=new c(o[2],v,s.sparse.count*l);a!==null&&(m=new vt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let A=0,L=I.length;A<L;A++){const w=I[A];if(m.setX(w,E[A*l]),l>=2&&m.setY(w,E[A*l+1]),l>=3&&m.setZ(w,E[A*l+2]),l>=4&&m.setW(w,E[A*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const s=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(d){d.flipY=!1,d.name=o.name||a.name||"",d.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(d.name=a.uri);const h=(r.samplers||{})[o.sampler]||{};return d.magFilter=wh[h.magFilter]||Qt,d.minFilter=wh[h.minFilter]||jn,d.wrapS=Th[h.wrapS]||cs,d.wrapT=Th[h.wrapT]||cs,d.generateMipmaps=!d.isCompressedTexture&&d.minFilter!==zt&&d.minFilter!==Qt,s.associations.set(d,{textures:e}),d}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const o=s.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(u){c=!0;const h=new Blob([u],{type:o.mimeType});return l=a.createObjectURL(h),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const d=Promise.resolve(l).then(function(u){return new Promise(function(h,f){let g=h;t.isImageBitmapLoader===!0&&(g=function(x){const m=new Et(x);m.needsUpdate=!0,h(m)}),t.load(Sr.resolveURL(u,r.path),g,void 0,f)})}).then(function(u){return c===!0&&a.revokeObjectURL(l),ci(u,o),u.userData.mimeType=o.mimeType||Cy(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=d,d}assignTexture(e,t,n,s){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Ge.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[Ge.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=r.associations.get(o);o=r.extensions[Ge.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Bu,Pn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Uu,Pn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return jt}loadMaterial(e){const t=this,n=this.json,s=this.extensions,r=n.materials[e];let o;const a={},l=r.extensions||{},c=[];if(l[Ge.KHR_MATERIALS_UNLIT]){const u=s[Ge.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),c.push(u.extendParams(a,r,t))}else{const u=r.pbrMetallicRoughness||{};if(a.color=new se(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){const h=u.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],Ht),a.opacity=h[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",u.baseColorTexture,It)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=ct);const d=r.alphaMode||uc.OPAQUE;if(d===uc.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,d===uc.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==He&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new we(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==He&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==He){const u=r.emissiveFactor;a.emissive=new se().setRGB(u[0],u[1],u[2],Ht)}return r.emissiveTexture!==void 0&&o!==He&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,It)),Promise.all(c).then(function(){const u=new o(a);return r.name&&(u.name=r.name),ci(u,r),t.associations.set(u,{materials:e}),r.extensions&&qi(s,u,r),u})}createUniqueName(e){const t=st.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[Ge.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Eh(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],d=Ry(c),u=s[d];if(u)o.push(u.promise);else{let h;c.extensions&&c.extensions[Ge.KHR_DRACO_MESH_COMPRESSION]?h=r(c):h=Eh(new Lt,c,t),s[d]={primitive:c,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const d=o[l].material===void 0?Ty(this.cache):this.getDependency("material",o[l].material);a.push(d)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),d=l[l.length-1],u=[];for(let f=0,g=d.length;f<g;f++){const x=d[f],m=o[f];let p;const S=c[f];if(m.mode===mn.TRIANGLES||m.mode===mn.TRIANGLE_STRIP||m.mode===mn.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new Uv(x,S):new Ce(x,S),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===mn.TRIANGLE_STRIP?p.geometry=yh(p.geometry,fd):m.mode===mn.TRIANGLE_FAN&&(p.geometry=yh(p.geometry,ol));else if(m.mode===mn.LINES)p=new Ov(x,S);else if(m.mode===mn.LINE_STRIP)p=new jl(x,S);else if(m.mode===mn.LINE_LOOP)p=new kv(x,S);else if(m.mode===mn.POINTS)p=new Kl(x,S);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&Ay(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),ci(p,r),m.extensions&&qi(s,p,m),t.assignFinalMaterial(p),u.push(p)}for(let f=0,g=u.length;f<g;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&qi(s,u[0],r),u[0];const h=new Tt;r.extensions&&qi(s,h,r),t.associations.set(h,{meshes:e});for(let f=0,g=u.length;f<g;f++)h.add(u[f]);return h})}loadCamera(e){let t;const n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new qt(ro.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new pr(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ci(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){const r=s.pop(),o=s,a=[],l=[];for(let c=0,d=o.length;c<d;c++){const u=o[c];if(u){a.push(u);const h=new Ie;r!==null&&h.fromArray(r.array,c*16),l.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Xl(a,l)})}loadAnimation(e){const t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],l=[],c=[],d=[];for(let u=0,h=s.channels.length;u<h;u++){const f=s.channels[u],g=s.samplers[f.sampler],x=f.target,m=x.node,p=s.parameters!==void 0?s.parameters[g.input]:g.input,S=s.parameters!==void 0?s.parameters[g.output]:g.output;x.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",S)),c.push(g),d.push(x))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(d)]).then(function(u){const h=u[0],f=u[1],g=u[2],x=u[3],m=u[4],p=[];for(let S=0,b=h.length;S<b;S++){const v=h[S],I=f[S],E=g[S],A=x[S],L=m[S];if(v===void 0)continue;v.updateMatrix&&v.updateMatrix();const w=n._createAnimationTracks(v,I,E,A,L);if(w)for(let M=0;M<w.length;M++)p.push(w[M])}return new Xv(r,void 0,p)})}createNodeMesh(e){const t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=s.weights.length;l<c;l++)a.morphTargetInfluences[l]=s.weights[l]}),o})}loadNode(e){const t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let c=0,d=a.length;c<d;c++)o.push(n.getDependency("node",a[c]));const l=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){const d=c[0],u=c[1],h=c[2];h!==null&&d.traverse(function(f){f.isSkinnedMesh&&f.bind(h,Py)});for(let f=0,g=u.length;f<g;f++)d.add(u[f]);return d})}_loadNodeShallow(e){const t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],l=s._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(c){return s._getNodeRef(s.cameraCache,r.camera,c)})),s._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let d;if(r.isBone===!0?d=new Cu:c.length>1?d=new Tt:c.length===1?d=c[0]:d=new at,d!==c[0])for(let u=0,h=c.length;u<h;u++)d.add(c[u]);if(r.name&&(d.userData.name=r.name,d.name=o),ci(d,r),r.extensions&&qi(n,d,r),r.matrix!==void 0){const u=new Ie;u.fromArray(r.matrix),d.applyMatrix4(u)}else r.translation!==void 0&&d.position.fromArray(r.translation),r.rotation!==void 0&&d.quaternion.fromArray(r.rotation),r.scale!==void 0&&d.scale.fromArray(r.scale);return s.associations.has(d)||s.associations.set(d,{}),s.associations.get(d).nodes=e,d}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],s=this,r=new Tt;n.name&&(r.name=s.createUniqueName(n.name)),ci(r,n),n.extensions&&qi(t,r,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(s.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let d=0,u=l.length;d<u;d++)r.add(l[d]);const c=d=>{const u=new Map;for(const[h,f]of s.associations)(h instanceof Pn||h instanceof Et)&&u.set(h,f);return d.traverse(h=>{const f=s.associations.get(h);f!=null&&u.set(h,f)}),u};return s.associations=c(r),r})}_createAnimationTracks(e,t,n,s,r){const o=[],a=e.name?e.name:e.uuid,l=[];Ai[r.path]===Ai.weights?e.traverse(function(h){h.morphTargetInfluences&&l.push(h.name?h.name:h.uuid)}):l.push(a);let c;switch(Ai[r.path]){case Ai.weights:c=Fs;break;case Ai.rotation:c=Os;break;case Ai.position:case Ai.scale:c=Bs;break;default:switch(n.itemSize){case 1:c=Fs;break;case 2:case 3:default:c=Bs;break}break}const d=s.interpolation!==void 0?wy[s.interpolation]:sr,u=this._getArrayFromAccessor(n);for(let h=0,f=l.length;h<f;h++){const g=new c(l[h]+"."+Ai[r.path],t.array,u,d);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=fc(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const s=this instanceof Os?Sy:Sh;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Ly(i,e,t){const n=e.attributes,s=new Gt;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(s.set(new R(l[0],l[1],l[2]),new R(c[0],c[1],c[2])),a.normalized){const d=fc(Gs[a.componentType]);s.min.multiplyScalar(d),s.max.multiplyScalar(d)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new R,l=new R;for(let c=0,d=r.length;c<d;c++){const u=r[c];if(u.POSITION!==void 0){const h=t.json.accessors[u.POSITION],f=h.min,g=h.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),h.normalized){const x=fc(Gs[h.componentType]);l.multiplyScalar(x)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;const o=new Un;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function Eh(i,e,t){const n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){i.setAttribute(a,l)})}for(const o in n){const a=dc[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){const o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return Xe.workingColorSpace!==Ht&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Xe.workingColorSpace}" not supported.`),ci(i,e),Ly(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?Ey(i,e.targets,t):i})}function Dy(i){!i||!("metalness"in i)||(i.metalness=0,i.roughness=Math.min(i.roughness??1,.85))}const Uy="models/",Ny=new J_,Ah=new Map;function pc(i){let e=Ah.get(i);return e||(e=Ny.loadAsync(`${Uy}${i}`).then(t=>{const n=t.scene;return n.traverse(s=>{const r=s;if(r.isMesh){r.castShadow=!0,r.receiveShadow=!0;for(const o of Array.isArray(r.material)?r.material:[r.material])Dy(o)}}),n}),Ah.set(i,e)),e}async function Fy(i){return(await pc(i)).clone(!0)}async function Rh(i){await Promise.all(i.map(async e=>{Ch.set(e,await pc(e))}))}const Ch=new Map;function on(i){const e=Ch.get(i);if(!e)throw new Error(`模型未預載就攞：${i}`);return e.clone(!0)}const Oy=()=>{const i=["towers/towerRound_base.glb","towers/towerRound_crystals.glb"];for(const e of["towerRound","towerSquare"])for(const t of["bottom","middle","top","roof"])for(const n of["A","B","C"])i.push(`towers/${e}_${t}${n}.glb`);for(const e of["ballista","blaster","cannon","catapult"])i.push(`towers/weapon_${e}.glb`);return i},ky=()=>["skeleton","zombie","ghost","vampire","digger"].map(i=>`enemies/${i}.glb`);async function By(i){try{const e=await pc(i);let t=0,n=0,s=0;e.traverse(a=>{const l=a;if(!l.isMesh)return;t+=1,n+=Array.isArray(l.material)?l.material.length:1;const c=l.geometry.getIndex();s+=(c?c.count:l.geometry.getAttribute("position").count)/3});const r=new Gt().setFromObject(e),o=r.getSize(new R);return{mesh:t,mat:n,tri:Math.round(s),尺:[+o.x.toFixed(3),+o.y.toFixed(3),+o.z.toFixed(3)],底:+r.min.y.toFixed(3)}}catch(e){return{掛咗:String(e).slice(0,90)}}}const Ph=[[0,-1],[-1,0],[0,1],[1,0]];function Ih(i,e){const t=e[0]-i[0],n=e[1]-i[1];for(let s=0;s<4;s+=1)if(Ph[s][0]===t&&Ph[s][1]===n)return s;return null}const Lh={tile:[],tile_dirt:[],tile_straight:[0,2],tile_cornerRound:[0,1],tile_cornerSquare:[0,1],tile_end:[0],tile_endRound:[0],tile_spawn:[0,2],tile_endSpawn:[0],tile_crossing:[0,1,2,3],tile_split:[0,1,3],tile_riverBridge:[1,3]},zy=(i,e)=>i.map(t=>(t+e)%4).sort(),Hy=(i,e)=>i.length===e.length&&i.every((t,n)=>t===e[n]);function Gy(i,e){const t=[...i].sort(),n=[...e,...Object.keys(Lh)];for(const s of n){const r=Lh[s];if(r){for(let o=0;o<4;o+=1)if(Hy(zy(r,o),t))return{model:s,rotK:o,rotationY:o*Math.PI/2}}}return null}function Vy(i,e=[]){const t=[],n=new Map(e.map(s=>[`${s.cell[0]},${s.cell[1]}`,s]));for(let s=0;s<i.length;s+=1){const r=[];if(s>0){const c=Ih(i[s],i[s-1]);c!==null&&r.push(c)}if(s<i.length-1){const c=Ih(i[s],i[s+1]);c!==null&&r.push(c)}const o=s===0?["tile_endSpawn"]:s===i.length-1?["tile_end"]:["tile_straight","tile_cornerRound"],a=n.get(`${i[s][0]},${i[s][1]}`),l=a?{model:a.model,rotK:a.rotK,rotationY:a.rotK*Math.PI/2}:Gy(r,o);t.push({...l??{model:"tile",rotK:0,rotationY:0},col:i[s][0],row:i[s][1]})}return t}class Wy{constructor(){J(this,"scene");J(this,"groundMeshes",[]);this.scene=new Iv,this.scene.background=new se(1192226)}async buildGround(){const{cellSize:e}=Q;this.buildSkyDome(),this.buildTerrainUnderlay();const t=Vy(Q.path,Q.pathTileOverrides),n=Qe.cells.flatMap(l=>l.terrain?[`tiles/${l.terrain.model}.glb`]:[]);await Rh(["tiles/tile.glb",...new Set(t.map(l=>`tiles/${l.model}.glb`)),...new Set(n),"scenery/detail_tree.glb","scenery/detail_treeLarge.glb","scenery/detail_rocks.glb","scenery/detail_rocksLarge.glb","scenery/detail_crystal.glb","scenery/detail_crystalLarge.glb"]);const s=new Map(t.map(l=>[`${l.col},${l.row}`,l])),r=new nn(e,e),o=new He({visible:!1}),a=new Map;this.buildIslandFoundation();for(const l of Qe.cells){const{col:c,row:d}=l,u=et(c,d),h=s.get(`${c},${d}`),f=l.terrain,g=(h==null?void 0:h.model)??(f==null?void 0:f.model)??"tile",x=(h==null?void 0:h.rotK)??(f==null?void 0:f.rotK)??0,m=`tiles/${g}.glb`,p=a.get(m)??[];p.push({position:new R(u.x,g==="tile_riverBridge"?-.1:0,u.z),rotationY:x*Math.PI/2,scale:1}),a.set(m,p);const S=new Tt;S.name=`ground:${c},${d}:${g}`,S.position.set(u.x,0,u.z),this.scene.add(S);const b=new Ce(r,o);b.rotation.x=-Math.PI/2,b.position.set(u.x,Ft+.001,u.z),b.userData={col:c,row:d,type:"ground"},this.scene.add(b),this.groundMeshes.push(b)}await this.addInstancedModelBatches(a,"ground-batch"),await this.buildScenery(),this.buildDistantSilhouettes()}buildSkyDome(){const e=ke.isMobile?8:24,t=new oi(80,e,e),n=new Rt({side:Bt,depthWrite:!1,uniforms:{topColor:{value:new se(1985077)},midColor:{value:new se(2447938)},bottomColor:{value:new se(4481592)}},vertexShader:`
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
            `});this.scene.add(new Ce(t,n))}buildTerrainUnderlay(){const e=new nn(240,240);e.rotateX(-Math.PI/2);const t=ke.isMobile?new ai({color:3235128}):new jt({color:1522468,roughness:1,metalness:0}),n=new Ce(e,t);n.position.y=-1.05,n.receiveShadow=!0,this.scene.add(n);const s=Q.cols+ke.terrain.underlayPadding*2,r=Q.rows+ke.terrain.underlayPadding*2,o=ke.terrain.underlaySegments,a=new nn(s,r,o,o);a.rotateX(-Math.PI/2);const l=a.attributes.position,c=new Float32Array(l.count*3),d=Q.origin.x+Q.cols*Q.cellSize/2,u=Q.origin.z+Q.rows*Q.cellSize/2;for(let g=0;g<l.count;g++){const x=l.getX(g)+d,m=l.getZ(g)+u,{height:p,envelope:S}=this.terrainSample(x,m);l.setY(g,p);const b=ro.clamp(.5+S*.26+p*.12,0,1),v=new se(3959617),I=new se(7645282),E=v.lerp(I,b);c[g*3]=E.r,c[g*3+1]=E.g,c[g*3+2]=E.b}a.setAttribute("color",new vt(c,3)),a.computeVertexNormals();const h=ke.isMobile?new ai({vertexColors:!0}):new jt({vertexColors:!0,roughness:.98,metalness:.01}),f=new Ce(a,h);f.receiveShadow=!0,this.scene.add(f)}terrainSample(e,t){let n=1/0;for(const a of Qe.cells){const l=et(a.col,a.row);n=Math.min(n,Math.hypot(e-l.x,t-l.z))}const s=ro.smoothstep(n,.55,ke.terrain.underlayPadding),r=Math.sin(e*.22)*Math.cos(t*.18)*.16,o=Math.sin((e+t)*.11)*.12;return{height:(r+o)*s-.58,envelope:s}}buildIslandFoundation(){const e=Qe.cells.length,t=new ri(Q.cellSize*1.02,.34,Q.cellSize*1.02),n=new ri(Q.cellSize,1,Q.cellSize),s=ke.isMobile?new ai({color:5011267}):new jt({color:5011267,roughness:.95,metalness:0}),r=new Us(t,s,e);r.name="island-soil";const o=new at;Qe.cells.forEach((a,l)=>{const c=et(a.col,a.row);o.position.set(c.x,-.17,c.z),o.updateMatrix(),r.setMatrixAt(l,o.matrix)}),r.instanceMatrix.needsUpdate=!0,r.receiveShadow=!0,this.scene.add(r);for(const a of Qe.regions){const l=.26+a.foundationTier*.18,c=new se(a.accent).lerp(new se(1517343),.72).getHex(),d=Qe.cells.filter(f=>{var g;return((g=f.region)==null?void 0:g.id)===a.id&&this.isIslandEdge(f.col,f.row)}),u=ke.isMobile?new ai({color:c}):new jt({color:c,roughness:.94,metalness:0}),h=new Us(n,u,d.length);h.name=`island-cliff:${a.id}`,h.userData.foundationTier=a.foundationTier,d.forEach((f,g)=>{const x=et(f.col,f.row),p=.94+Math.abs(Math.imul(f.col+19,73856093)^Math.imul(f.row+31,19349663))%9*.012;o.position.set(x.x,-.17-l/2,x.z),o.scale.set(p,l,p),o.updateMatrix(),h.setMatrixAt(g,o.matrix)}),h.instanceMatrix.needsUpdate=!0,h.receiveShadow=!0,this.scene.add(h)}this.buildRiverRift(),this.buildKeepMesa()}isIslandEdge(e,t){return!Qe.cellAt(e-1,t).exists||!Qe.cellAt(e+1,t).exists||!Qe.cellAt(e,t-1).exists||!Qe.cellAt(e,t+1).exists}buildRiverRift(){var d,u;const e=Qe.cells.filter(h=>{var f;return(f=h.terrain)==null?void 0:f.model.startsWith("tile_river")}),t=(d=Q.pathTileOverrides)==null?void 0:d.find(h=>h.model==="tile_riverBridge"),n=(t==null?void 0:t.cell[0])??((u=e[0])==null?void 0:u.col);if(n===void 0)return;const s=[...e.map(h=>h.row),...t?[t.cell[1]]:[]],r=Math.min(...s),o=Math.max(...s),a=et(n,r),l=et(n,o),c=new Ce(new nn(.72,l.z-a.z+Q.cellSize+3),ke.isMobile?new ai({color:5289393,emissive:1391933,emissiveIntensity:.35,transparent:!0,opacity:.82,depthWrite:!1}):new jt({color:3250331,emissive:1201754,emissiveIntensity:.62,roughness:.2,metalness:.04,transparent:!0,opacity:.88,depthWrite:!1}));c.name="river-rift:water",c.rotation.x=-Math.PI/2,c.position.set(a.x,-.27,(a.z+l.z)/2),this.scene.add(c)}buildKeepMesa(){const e=[...Qe.regions].sort((a,l)=>l.foundationTier-a.foundationTier)[0];if(!e)return;const t=Qe.cells.filter(a=>{var l;return((l=a.region)==null?void 0:l.id)===e.id&&this.isIslandEdge(a.col,a.row)}),n=new ri(Q.cellSize*.84,.42,Q.cellSize*.84),s=ke.isMobile?new ai({color:1911076}):new jt({color:1911076,roughness:.98,metalness:0}),r=new Us(n,s,t.length);r.name="keep-mesa:lower-stratum";const o=new at;t.forEach((a,l)=>{const c=et(a.col,a.row),d=.26+e.foundationTier*.18;o.position.set(c.x,-.17-d-.13,c.z),o.rotation.set(0,0,0),o.scale.set(1,1,1),o.updateMatrix(),r.setMatrixAt(l,o.matrix)}),r.instanceMatrix.needsUpdate=!0,r.receiveShadow=!0,this.scene.add(r)}async buildScenery(){var g;const{cols:e,rows:t,cellSize:n}=Q,s=(x,m,p)=>{const S=Math.sin(x*127.1+m*311.7+p*74.7)*43758.5453;return S-Math.floor(S)},r=["scenery/detail_tree.glb","scenery/detail_treeLarge.glb"],o=["scenery/detail_rocks.glb","scenery/detail_rocksLarge.glb"],a=["scenery/detail_crystal.glb","scenery/detail_crystalLarge.glb"],l=ke.isMobile?5:9,c=ke.isMobile?.18:.34,d=ke.isMobile?.06:.14,u=new Map;for(let x=-l;x<e+l;x++)for(let m=-l;m<t+l;m++){let p=!1;for(let L=-1;L<=1&&!p;L+=1)for(let w=-1;w<=1;w+=1)if(Qe.cellAt(x+L,m+w).exists){p=!0;break}if(p)continue;const S=s(x,m,1);let b=null;if(S<c?b=r[s(x,m,2)<.62?0:1]:S<c+d?b=o[s(x,m,3)<.6?0:1]:S<c+d+.02&&(b=a[s(x,m,4)<.7?0:1]),!b)continue;const v=et(x,m),I=v.x+(s(x,m,5)-.5)*n*.8,E=v.z+(s(x,m,6)-.5)*n*.8,A=u.get(b)??[];A.push({position:new R(I,this.terrainSample(I,E).height,E),rotationY:s(x,m,7)*Math.PI*2,scale:.8+s(x,m,8)*.9}),u.set(b,A)}const h=Qe.cells.filter(x=>{var m;return(m=x.terrain)==null?void 0:m.model.startsWith("tile_river")}),f=(g=Q.pathTileOverrides)==null?void 0:g.find(x=>x.model==="tile_riverBridge");if(h.length>0||f){const x=(f==null?void 0:f.cell[0])??h[0].col,m=[...h.map(I=>I.row),...f?[f.cell[1]]:[]],p=Math.min(...m),S=Math.max(...m),b=u.get("scenery/detail_rocks.glb")??[];for(const I of[p-1,p,S,S+1]){const E=et(x,I);for(const A of[-1,1]){const L=Math.abs(I*17+A*13);b.push({position:new R(E.x+A*(.48+L%3*.08),-.22,E.z+(L%5-2)*.08),rotationY:L*.83,scale:.62+L%4*.08})}}u.set("scenery/detail_rocks.glb",b);const v=new Tt;v.name="river-rift:shoulders",this.scene.add(v)}await this.addInstancedModelBatches(u,"scenery-batch")}async addInstancedModelBatches(e,t){for(const[n,s]of e){if(s.length===0)continue;const r=await Fy(n);r.updateWorldMatrix(!0,!0);let o=0;r.traverse(a=>{const l=a;if(!l.isMesh)return;const c=new Us(l.geometry,l.material,s.length);c.name=`${t}:${n}:${o++}`;const d=new Ie,u=new Ie,h=new Qn,f=new R;s.forEach((g,x)=>{h.setFromAxisAngle(at.DEFAULT_UP,g.rotationY),f.setScalar(g.scale),d.compose(g.position,h,f),u.multiplyMatrices(d,l.matrixWorld),c.setMatrixAt(x,u)}),c.instanceMatrix.needsUpdate=!0,c.castShadow=l.castShadow,c.receiveShadow=l.receiveShadow,c.renderOrder=l.renderOrder,this.scene.add(c)})}}buildDistantSilhouettes(){const e=new _r(2.6,5.2,5),t=ke.isMobile?new ai({color:3235131}):new jt({color:2707253,emissive:728338,emissiveIntensity:.28,roughness:.95,metalness:.01}),n=Q.cols*.75,s=Q.rows*.95,r=Q.origin.x+Q.cols*Q.cellSize/2,o=Q.origin.z+Q.rows*Q.cellSize/2,a=ke.isMobile?8:18,l=(c,d)=>{const u=Math.sin(c*127.1+d*311.7)*43758.5453;return u-Math.floor(u)};for(let c=0;c<a;c++){const d=c/a*Math.PI*2,u=new Ce(e,t);u.position.set(r+Math.cos(d)*(n+18+l(c,1)*6),1.15+l(c,2)*.65,o+Math.sin(d)*(s+18+l(c,3)*6)),u.scale.setScalar(.72+l(c,4)*.72),u.rotation.y=l(c,5)*Math.PI*2,u.castShadow=!1,u.receiveShadow=!0,this.scene.add(u)}}}const Xy=10,Dh=4,Uh=22,Yy=40,qy=35,mc=20;class jy{constructor(){J(this,"cam");J(this,"frustum",Xy);J(this,"tilt",Yy*Math.PI/180);J(this,"yaw",qy*Math.PI/180);J(this,"cx");J(this,"cz");J(this,"lastPinchDist",0);J(this,"lastRotAngle",0);J(this,"isTwoFinger",!1);J(this,"shakeAmount",0);J(this,"shakeOffset",{x:0,y:0,z:0});J(this,"onTouchStart",e=>{e.touches.length===2&&(this.isTwoFinger=!0,this.lastPinchDist=Fh(e),this.lastRotAngle=Oh(e))});J(this,"onTouchMove",e=>{if(e.touches.length!==2)return;e.preventDefault(),this.isTwoFinger=!0;const t=Fh(e);if(this.lastPinchDist>0){const s=this.lastPinchDist/t;this.frustum=Nh(this.frustum*s,Dh,Uh),this.rebuildProjection()}this.lastPinchDist=t;const n=Oh(e);if(this.lastRotAngle!==0){const s=n-this.lastRotAngle;this.yaw+=s}this.lastRotAngle=n,this.applyTransform()});J(this,"onTouchEnd",e=>{e.touches.length<2&&(this.lastPinchDist=0,this.lastRotAngle=0,setTimeout(()=>{this.isTwoFinger=!1},100))});const e=window.innerWidth/window.innerHeight;this.cam=new pr(-this.frustum*e,this.frustum*e,this.frustum,-this.frustum,.1,100);const t=et(Qe.bounds.minCol,Qe.bounds.minRow),n=et(Qe.bounds.maxCol,Qe.bounds.maxRow);this.cx=(t.x+n.x)/2,this.cz=(t.z+n.z)/2,this.applyTransform()}get twoFingerActive(){return this.isTwoFinger}zoom(e){this.frustum=Nh(this.frustum+e*.01,Dh,Uh),this.rebuildProjection(),this.applyTransform()}resize(e){this.rebuildProjection(),e.setSize(window.innerWidth,window.innerHeight)}shake(e){this.shakeAmount=Math.max(this.shakeAmount,e)}tickShake(e){if(this.shakeAmount<=.001){(this.shakeOffset.x!==0||this.shakeOffset.y!==0||this.shakeOffset.z!==0)&&(this.shakeOffset.x=0,this.shakeOffset.y=0,this.shakeOffset.z=0,this.applyTransform()),this.shakeAmount=0;return}const t=this.shakeAmount;this.shakeOffset.x=(Math.random()-.5)*t,this.shakeOffset.y=(Math.random()-.5)*t*.45,this.shakeOffset.z=(Math.random()-.5)*t,this.applyTransform(),this.shakeAmount=Math.max(0,this.shakeAmount-e*2.2*(.2+this.shakeAmount))}rebuildProjection(){const e=window.innerWidth/window.innerHeight;this.cam.left=-this.frustum*e,this.cam.right=this.frustum*e,this.cam.top=this.frustum,this.cam.bottom=-this.frustum,this.cam.updateProjectionMatrix()}applyTransform(){this.cam.position.set(this.cx+mc*Math.sin(this.yaw)*Math.cos(this.tilt)+this.shakeOffset.x,mc*Math.sin(this.tilt)+this.shakeOffset.y,this.cz+mc*Math.cos(this.yaw)*Math.cos(this.tilt)+this.shakeOffset.z),this.cam.lookAt(this.cx+this.shakeOffset.x*.3,0,this.cz+this.shakeOffset.z*.3)}}function Nh(i,e,t){return Math.max(e,Math.min(t,i))}function Fh(i){const e=i.touches[0],t=i.touches[1],n=e.clientX-t.clientX,s=e.clientY-t.clientY;return Math.sqrt(n*n+s*s)}function Oh(i){const e=i.touches[0],t=i.touches[1];return Math.atan2(t.clientY-e.clientY,t.clientX-e.clientX)}function $y(i){const e=et(Qe.bounds.minCol,Qe.bounds.minRow),t=et(Qe.bounds.maxCol,Qe.bounds.maxRow),n=(e.x+t.x)/2,s=(e.z+t.z)/2;i.fog=new Hl(ke.atmosphere.fogColor,ke.atmosphere.fogDensity);const r=new Qv(15268832,2835507,1.35);i.add(r);const o=new s_(4023888,.42);i.add(o);const a=new Ho(16774358,2);a.position.set(n+10,16,s-7),a.target.position.set(n,0,s),a.castShadow=ke.enableShadows,a.shadow.mapSize.width=2048,a.shadow.mapSize.height=2048,a.shadow.camera.near=.5,a.shadow.camera.far=52,a.shadow.camera.left=-18,a.shadow.camera.right=18,a.shadow.camera.top=16,a.shadow.camera.bottom=-16,a.shadow.bias=-7e-4,a.shadow.normalBias=.02,a.shadow.radius=4,i.add(a),i.add(a.target);const l=new Ho(11064550,.65);l.position.set(n-13,10,s+9),l.target.position.set(n,0,s),i.add(l),i.add(l.target);const c=new Ho(11991002,.4);c.position.set(n,6,s+18),c.target.position.set(n,.4,s),i.add(c),i.add(c.target);const d=Q.spawnCell,u=new zo(6870527,2.4,9,1.6);u.position.set(Q.origin.x+d[0]*Q.cellSize+Q.cellSize/2,1.6,Q.origin.z+d[1]*Q.cellSize+Q.cellSize/2),i.add(u);const h=Q.goalCell,f=new zo(16744284,2.1,9,1.7);return f.position.set(Q.origin.x+h[0]*Q.cellSize+Q.cellSize/2,1.6,Q.origin.z+h[1]*Q.cellSize+Q.cellSize/2),i.add(f),{update(g){const x=1.9+Math.sin(g*ke.atmosphere.spawnPulseSpeed)*.55,m=1.7+Math.sin(g*ke.atmosphere.goalPulseSpeed+1.2)*.45;u.intensity=x,f.intensity=m,u.position.y=1.55+Math.sin(g*1.7)*.08,f.position.y=1.55+Math.sin(g*1.35+.8)*.08,a.intensity=1.95+Math.sin(g*.35)*.08,l.intensity=.62+Math.sin(g*.27+1.5)*.04,c.intensity=.38+Math.sin(g*.41+.3)*.03}}}const kh={arrow:9136404,arrow_rapid:11044146,arrow_pierce:7229967,cannon:5592405,ice:6737151,fire:16733440,lightning:16772608,poison:6750003,sniper:3355545,cannon_siege:4013380,ice_glacier:3121112,fire_inferno:13840128,lightning_storm:14205952,poison_plague:3129119,sniper_railgun:2039662},gc={arrow:14527027,arrow_rapid:16763989,arrow_pierce:12290082,cannon:8947848,ice:11202303,fire:16746564,lightning:16777130,poison:11206519,sniper:6710988,cannon_siege:12303300,ice_glacier:14546687,fire_inferno:16759654,lightning_storm:16777181,poison_plague:13434794,sniper_railgun:10066414},Bh=.85;class Ky{constructor(e){J(this,"scene");J(this,"meshes",new Map);J(this,"sellingTowers",new Set);J(this,"rangeRing",null);J(this,"time",0);this.scene=e}sync(e){const t=new Set(e.towers.map(n=>n.id));for(const[n,s]of this.meshes)t.has(n)||(this.scene.remove(s),this.meshes.delete(n));for(const n of e.towers)if(!this.meshes.has(n.id)){const s=this.createTowerMesh(n);s.scale.set(0,0,0),s.userData.buildProgress=0,this.scene.add(s),this.meshes.set(n.id,s)}}removeTower(e){const t=this.meshes.get(e);t&&(this.sellingTowers.add({group:t,timer:.25,maxTimer:.25}),this.meshes.delete(e))}animate(e,t){this.time+=e;const n=this.time;for(const s of this.sellingTowers)if(s.timer-=e,s.timer<=0)this.scene.remove(s.group),this.sellingTowers.delete(s);else{const r=s.timer/s.maxTimer,o=r*r*r;s.group.scale.set(o,o,o),s.group.rotation.y+=e*10}for(const s of t.towers){const r=this.meshes.get(s.id);if(!r)continue;const o=r.userData;if(o.buildProgress<1){o.buildProgress=Math.min(1,o.buildProgress+e*3);const l=o.buildProgress,c=2*Math.PI/3,d=l===1?1:Math.pow(2,-10*l)*Math.sin((l*10-.75)*c)+1;r.scale.set(d,d,d)}if(s.cooldownRemaining>o.lastCooldown&&(o.attackTimer=.15),o.lastCooldown=s.cooldownRemaining,o.buildProgress>=1)if(o.attackTimer>0){o.attackTimer-=e;const l=Math.max(0,o.attackTimer/.15),c=1+l*.12;o.turretGroup?o.turretGroup.scale.set(c,c,c):r.scale.set(c,c,c),o.recoilNode&&(o.recoilNode.position.z=-(o.recoilAmount??.08)*l),o.energyRingMaterial&&(o.energyRingMaterial.emissiveIntensity=.3+l*.75)}else o.turretGroup&&o.turretGroup.scale.set(1,1,1),o.recoilNode&&(o.recoilNode.position.z=0),r.scale.set(1,1,1),o.energyRingMaterial&&(o.energyRingMaterial.emissiveIntensity=.22+Math.sin(n*2.5)*.08);let a=null;if(s.targetId!==null&&s.targetId!==void 0){const l=t.enemies.find(c=>c.id===s.targetId);if(l){const c=l.worldX-s.worldX,d=l.worldZ-s.worldZ;(c!==0||d!==0)&&(a=Math.atan2(c,d))}}if(a===null&&s.aimAngle!==void 0&&(a=s.aimAngle),a!==null&&o.turretGroup){let l=a-o.turretGroup.rotation.y;l=Math.atan2(Math.sin(l),Math.cos(l)),o.turretGroup.rotation.y+=l*10*e}if(o.spin)for(const l of o.spin)l.node.rotation[l.axis]+=e*l.speed;if(o.bob)for(const l of o.bob)l.node.position.y=l.baseY+Math.sin(n*l.speed+l.phase)*l.amp;if(o.pulseScale)for(const l of o.pulseScale){const c=l.base+Math.sin(n*l.speed+l.phase)*l.amp;l.yOnly?l.node.scale.y=c:l.node.scale.set(c,c,c)}if(o.pulseEmissive)for(const l of o.pulseEmissive)l.mat.emissiveIntensity=l.base+Math.sin(n*l.speed+l.phase)*l.amp;if(o.orbit)for(const l of o.orbit)l.pivot.rotation.y+=e*l.speed;if(o.rise)for(const l of o.rise){const c=(n*l.speed+l.phase)%1;l.node.position.y=l.baseY+c*l.height;const d=1-c;l.node.scale.setScalar(.4+d*.6)}if(o.arcs&&o.arcOrigin&&(o.arcTimer=(o.arcTimer??0)-e,o.arcTimer<=0)){o.arcTimer=.06;for(const l of o.arcs){const c=l.geometry.attributes.position,d=o.arcOrigin,u=Math.random()*Math.PI*2,h=.22+Math.random()*.16,f=d.x+Math.cos(u)*h,g=d.y-.1-Math.random()*.25,x=d.z+Math.sin(u)*h,m=c.count;for(let p=0;p<m;p++){const S=p/(m-1),b=(Math.random()-.5)*.08*(p>0&&p<m-1?1:0),v=(Math.random()-.5)*.08*(p>0&&p<m-1?1:0);c.setXYZ(p,d.x+(f-d.x)*S+b,d.y+(g-d.y)*S+v,d.z+(x-d.z)*S+b)}c.needsUpdate=!0,l.visible=Math.random()>.25}}}}showRange(e,t){if(!this.rangeRing){this.rangeRing=new Tt;const o=new Ce(new Xi(.92,1,64),new He({color:16777215,transparent:!0,opacity:.16,side:ct,depthWrite:!1}));o.rotation.x=-Math.PI/2;const a=new Ce(new Xi(.6,.66,64),new He({color:16777215,transparent:!0,opacity:.08,side:ct,depthWrite:!1}));a.rotation.x=-Math.PI/2;const l=new Ce(new ko(.98,48),new He({color:16777215,transparent:!0,opacity:.04,side:ct,depthWrite:!1}));l.rotation.x=-Math.PI/2,l.position.y=-.002,this.rangeRing.add(o,a,l),this.rangeRing.userData={outer:o,inner:a,pulse:l},this.scene.add(this.rangeRing)}const n=gc[e.type]??16777215,s=this.rangeRing.userData;s.outer.material.color.setHex(n),s.inner.material.color.setHex(n),s.pulse.material.color.setHex(n);const r=1+Math.sin(this.time*3.2)*.06;s.pulse.scale.setScalar(r),s.pulse.position.y=.002,this.rangeRing.scale.set(t,t,1),this.rangeRing.position.set(e.worldX,Ft+.003,e.worldZ),this.rangeRing.visible=!0}hideRange(){this.rangeRing&&(this.rangeRing.visible=!1)}measure(e){const t=this.meshes.get(e);if(!t)return null;const n=new Gt().setFromObject(t);let s=0;const r=new Set;return t.traverse(o=>{const a=o;if(a.isMesh){s+=1;for(const l of Array.isArray(a.material)?a.material:[a.material]){const c=l;c!=null&&c.color&&Hh.has(c.name)&&r.add("#"+c.color.getHexString())}}}),{高:+(n.max.y-n.min.y).toFixed(3),底:+n.min.y.toFixed(3),頂:+n.max.y.toFixed(3),佔格:[+(n.max.x-n.min.x).toFixed(3),+(n.max.z-n.min.z).toFixed(3)],件:s,色:[...r].sort(),轉塔:!!t.userData.turretGroup}}createTowerMesh(e){const t=new Tt,n=et(e.col,e.row);t.position.set(n.x,Ft,n.z),t.name=`tower:${e.id}:${e.type}`;const s=new Tt;s.name="tower-visual",s.scale.set(Bh,1,Bh),t.add(s);const r=t.userData;r.buildProgress=0,r.lastCooldown=0,r.attackTimer=0;const o=zh[e.type]??zh.arrow,a=new se(kh[e.type]??kh.arrow),l=new se(gc[e.type]??gc.arrow),c=["bottom","middle","top"],d=["towers/towerRound_base.glb"];for(let f=0;f<=eh(e.type,e.level);f+=1)d.push(`towers/${o.家}_${c[f]}${o.款}.glb`);let u=0;for(const f of d){const g=on(f);xc(g),g.position.y=u,qo(g,a,l),s.add(g),u+=f.includes("_base")?.21:.5}const h=new Tt;if(h.position.y=u,s.add(h),o.武器){h.name="aiming-turret",r.turretGroup=h;const f=on(`towers/weapon_${o.武器}.glb`);f.name="weapon-model",f.scale.setScalar(o.武器大細??1),f.rotation.y=Math.PI,qo(f,l,a);const g=new Tt;g.add(f),h.add(g),r.recoilNode=g,r.recoilAmount=.09}else{h.name="fixed-crown";const f=on(`towers/${o.家}_roof${o.款}.glb`);f.scale.set(1,.58,1),xc(f),qo(f,a,l),h.add(f);const g=new Gt().setFromObject(f).max.y,x=on("towers/towerRound_crystals.glb");x.position.y=g+.06,x.scale.setScalar(.35),xc(x),qo(x,l,l),h.add(x),r.spin=[{node:x,axis:"y",speed:.7}]}return t}}const zh={arrow:{家:"towerRound",款:"A",武器:"ballista"},arrow_rapid:{家:"towerRound",款:"B",武器:"ballista",武器大細:.85},arrow_pierce:{家:"towerRound",款:"C",武器:"ballista",武器大細:1.15},cannon:{家:"towerSquare",款:"A",武器:"cannon"},cannon_siege:{家:"towerSquare",款:"C",武器:"cannon",武器大細:1.2},ice:{家:"towerRound",款:"B"},ice_glacier:{家:"towerRound",款:"C"},fire:{家:"towerSquare",款:"B",武器:"catapult"},fire_inferno:{家:"towerSquare",款:"C",武器:"catapult",武器大細:1.15},lightning:{家:"towerRound",款:"C",武器:"blaster"},lightning_storm:{家:"towerRound",款:"A",武器:"blaster",武器大細:1.15},poison:{家:"towerSquare",款:"B"},poison_plague:{家:"towerSquare",款:"A"},sniper:{家:"towerSquare",款:"C",武器:"blaster",武器大細:1.3},sniper_railgun:{家:"towerSquare",款:"B",武器:"blaster",武器大細:1.45}},Hh=new Set(["red","purple"]),Zy=new Set(["wood","crystal"]);function xc(i){i.updateWorldMatrix(!0,!0);const e=new Gt().setFromObject(i).getCenter(new R);i.position.x-=e.x,i.position.z-=e.z}function qo(i,e,t){i.traverse(n=>{const s=n;if(!s.isMesh)return;const o=(Array.isArray(s.material)?s.material:[s.material]).map(a=>{const l=a,c=Hh.has(l.name),d=Zy.has(l.name);if(!c&&!d)return l;const u=l.clone();return u.color.copy(c?e:t),l.name==="purple"&&u.color.multiplyScalar(.68),u});s.material=Array.isArray(s.material)?o:o[0]})}const Pr=(i,e=10)=>(t,n,s)=>{t.oy+=Math.abs(Math.sin(n*e+s))*i},Gh=(i,e)=>(t,n,s)=>{t.oy+=Math.sin(n*e+s)*i},Vh={grunt:{barY:.95,shadowScale:1},tank:{barY:1.05,shadowScale:1.55},runner:{barY:.9,shadowScale:.95},swarm:{barY:.72,shadowScale:.65},shield:{barY:1.1,shadowScale:1.1},healer:{barY:1.15,shadowScale:1},boss:{barY:2.1,shadowScale:1.95}},Wh={grunt:{檔:"skeleton",縮:.6,抬:.39},tank:{檔:"digger",縮:.52,抬:.39},runner:{檔:"ghost",縮:.46,抬:1.43},swarm:{檔:"skeleton",縮:.38,色:10475680,抬:.39},shield:{檔:"zombie",縮:.58,色:8373992,抬:.39},healer:{檔:"vampire",縮:.55,色:15771856,抬:.48},boss:{檔:"vampire",縮:1.15,色:16751181,抬:.48}},Jy={grunt:Pr(.055,9),tank:Pr(.035,5.5),runner:Gh(.08,3.2),swarm:Pr(.07,13),shield:Pr(.04,7),healer:Gh(.05,2.4),boss:Pr(.06,4)},vc={grunt:[],tank:[],runner:[],swarm:[],shield:[],healer:[],boss:[]};function Qy(){for(const i of Object.keys(Wh)){const e=Wh[i],t=on(`enemies/${e.檔}.glb`);t.updateMatrixWorld(!0);const n=[];t.traverse(s=>{const r=s;if(!r.isMesh)return;const o=r.geometry.clone();o.applyMatrix4(r.matrixWorld),o.scale(e.縮,e.縮,e.縮),o.translate(0,e.抬*e.縮,0);for(const a of Array.isArray(r.material)?r.material:[r.material]){const l=a.clone();e.色&&l.color.lerp(new se(e.色),.55),n.push({geo:o,mat:l,offset:new R(0,0,0),anim:Jy[i]});break}}),vc[i]=n}}const eb=100,Ir=.5,_c=100,tb=Math.PI*3.5;function nb(i,e,t){const n=Math.atan2(Math.sin(e-i),Math.cos(e-i));return Math.abs(n)<=t?e:i+Math.sign(n)*t}const Xh=new nn(1,.06),ib=new nn(1,.04),sb=new ko(.26,12),rb=new Xi(.18,.24,12);class ob{constructor(e){J(this,"scene");J(this,"instancedMeshGroups",new Map);J(this,"dummy",new at);J(this,"animOut",{ox:0,oy:0,oz:0,rx:0,ry:0,rz:0,s:1});J(this,"lastSyncTime",performance.now()*.001);J(this,"mHpBg",new He({color:3355443,side:ct,depthWrite:!1}));J(this,"mHpGreen",new He({color:4521796,side:ct,depthWrite:!1}));J(this,"mHpYellow",new He({color:16755200,side:ct,depthWrite:!1}));J(this,"mHpRed",new He({color:16724787,side:ct,depthWrite:!1}));J(this,"mShield",new He({color:4491519,side:ct,depthWrite:!1}));J(this,"mShadow",new He({color:0,transparent:!0,opacity:.18,side:ct,depthWrite:!1}));J(this,"mHaloBoss",new He({color:16752215,transparent:!0,opacity:.5,side:ct,depthWrite:!1}));J(this,"mHaloShield",new He({color:7131135,transparent:!0,opacity:.5,side:ct,depthWrite:!1}));J(this,"mHaloSlow",new He({color:9300223,transparent:!0,opacity:.5,side:ct,depthWrite:!1}));J(this,"mHaloDot",new He({color:7667562,transparent:!0,opacity:.5,side:ct,depthWrite:!1}));J(this,"poolHpBg",[]);J(this,"poolHpFill",[]);J(this,"poolShield",[]);J(this,"poolShadow",[]);J(this,"poolHalo",[]);this.scene=e,this.dummy.rotation.order="YXZ",this.initPool()}initPool(){const e=(t,n,s)=>{const r=new Ce(t,n);return r.visible=!1,r.renderOrder=s,this.scene.add(r),r};for(let t=0;t<_c;t++)this.poolHpBg.push(e(Xh,this.mHpBg,1)),this.poolHpFill.push(e(Xh,this.mHpGreen,2)),this.poolShield.push(e(ib,this.mShield,2)),ke.isMobile||(this.poolShadow.push(e(sb,this.mShadow,0)),this.poolHalo.push(e(rb,this.mHaloDot,0)))}getOrCreate(e){let t=this.instancedMeshGroups.get(e);if(!t){t=[];const n=vc[e];for(const s of n){const r=new Us(s.geo,s.mat,eb);r.count=0,ke.enableShadows&&(r.castShadow=!0,r.receiveShadow=!0),this.scene.add(r),t.push(r)}this.instancedMeshGroups.set(e,t)}return t}sync(e,t,n){const s=new Map,r=[];for(const u of e.enemies){if(!u.alive||u.reached)continue;let h=s.get(u.type);h||(h=[],s.set(u.type,h)),h.push(u),r.push(u)}const o=performance.now()*.001,a=Math.min(1/15,Math.max(0,o-this.lastSyncTime));this.lastSyncTime=o;const l=this.animOut,c=["grunt","tank","runner","swarm","shield","healer","boss"];for(const u of c){const h=this.getOrCreate(u),f=s.get(u)||[];for(const x of h)x.count=f.length;const g=vc[u];for(let x=0;x<f.length;x++){const m=f[x],p=m,S=m.worldX-m.prevWorldX,b=m.worldZ-m.prevWorldZ;let v=p.displayRot??0;if(Math.abs(S)>.001||Math.abs(b)>.001){const E=Math.atan2(S,b);v=p.displayRot===void 0?E:nb(p.displayRot,E,tb*a),p.displayRot=v}const I=m.id*.7;for(let E=0;E<g.length;E++){const A=g[E];l.ox=0,l.oy=0,l.oz=0,l.rx=0,l.ry=0,l.rz=0,l.s=1,A.anim&&A.anim(l,o,I),this.dummy.position.set(m.worldX+l.ox,Ft+l.oy,m.worldZ+l.oz),this.dummy.position.add(A.offset),this.dummy.rotation.set(l.rx,v+l.ry,l.rz),A.rotation&&(this.dummy.rotation.x+=A.rotation.x,this.dummy.rotation.y+=A.rotation.y,this.dummy.rotation.z+=A.rotation.z),A.scale?this.dummy.scale.copy(A.scale).multiplyScalar(l.s):this.dummy.scale.set(l.s,l.s,l.s),this.dummy.updateMatrix(),h[E].setMatrixAt(x,this.dummy.matrix)}}for(const x of h)x.instanceMatrix.needsUpdate=!0}const d=Math.min(r.length,_c);for(let u=0;u<d;u++){const h=r[u],f=h.type==="boss",g=Vh[h.type].barY,x=Math.max(0,h.hp/h.maxHp),m=Ir*x,p=this.poolHpBg[u];p.scale.set(Ir,1,1),p.position.set(h.worldX,Ft+g,h.worldZ),p.visible=!0,n?p.lookAt(n.position):p.rotation.x=-Math.PI/4;const S=this.poolHpFill[u];m>.001?(S.material=x>.5?this.mHpGreen:x>.25?this.mHpYellow:this.mHpRed,S.scale.set(m,1,1),S.position.set(h.worldX-(Ir-m)/2,Ft+g,h.worldZ),S.visible=!0,n?S.lookAt(n.position):S.rotation.x=-Math.PI/4):S.visible=!1;const b=this.poolShield[u];if(h.maxShield>0&&h.shield>0){const v=h.shield/h.maxShield,I=Ir*v;b.scale.set(I,1,1),b.position.set(h.worldX-(Ir-I)/2,Ft+g+.07,h.worldZ),b.visible=!0,n?b.lookAt(n.position):b.rotation.x=-Math.PI/4}else b.visible=!1;if(!ke.isMobile&&u<this.poolShadow.length){const v=this.poolShadow[u];v.scale.setScalar(Vh[h.type].shadowScale),v.position.set(h.worldX,Ft+.003,h.worldZ),v.visible=!0;const I=this.poolHalo[u];h.slow||h.dots.length>0||h.shield>0||f?(I.material=f?this.mHaloBoss:h.shield>0?this.mHaloShield:h.slow?this.mHaloSlow:this.mHaloDot,I.position.set(h.worldX,Ft+.006,h.worldZ),I.visible=!0):I.visible=!1}}for(let u=d;u<_c;u++)this.poolHpBg[u].visible=!1,this.poolHpFill[u].visible=!1,this.poolShield[u].visible=!1,!ke.isMobile&&u<this.poolShadow.length&&(this.poolShadow[u].visible=!1,this.poolHalo[u].visible=!1)}}const Yh={arrow:16768324,arrow_rapid:16773017,arrow_pierce:9348863,cannon:16737843,ice:8969727,fire:16729088,lightning:16776960,poison:6750003,sniper:11184895},jo=i=>Yh[i]??Yh[i.includes("_")?i.split("_")[0]:i]??16777215,$t=ke.maxParticles,Lr=ke.isMobile?35:80,$o=2,qh=et(Qe.bounds.minCol,Qe.bounds.minRow),jh=et(Qe.bounds.maxCol,Qe.bounds.maxRow),an={minX:qh.x-$o,maxX:jh.x+$o,minZ:qh.z-$o,maxZ:jh.z+$o},Dr={min:.4,max:4.5};class ab{constructor(e){J(this,"scene");J(this,"projScaleY",1.7);J(this,"particles",[]);J(this,"particleGeo");J(this,"particlePositions");J(this,"particleColors");J(this,"particleSizes");J(this,"particleAlphas");J(this,"particlePoints");J(this,"moteGeo");J(this,"motePositions");J(this,"moteVelocities");J(this,"motePhase");J(this,"motePoints");this.scene=e,this.particlePositions=new Float32Array($t*3),this.particleColors=new Float32Array($t*3),this.particleSizes=new Float32Array($t),this.particleAlphas=new Float32Array($t),this.particleGeo=new Lt,this.particleGeo.setAttribute("position",new vt(this.particlePositions,3)),this.particleGeo.setAttribute("aColor",new vt(this.particleColors,3)),this.particleGeo.setAttribute("aSize",new vt(this.particleSizes,1)),this.particleGeo.setAttribute("aAlpha",new vt(this.particleAlphas,1));const t=new Rt({vertexShader:`
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
            `,transparent:!0,blending:fi,depthWrite:!1});this.particlePoints=new Kl(this.particleGeo,t),this.particlePoints.frustumCulled=!1,e.add(this.particlePoints),this.initMotes()}initMotes(){this.motePositions=new Float32Array(Lr*3),this.moteVelocities=new Float32Array(Lr*3),this.motePhase=new Float32Array(Lr);for(let t=0;t<Lr;t++){const n=t*3;this.motePositions[n]=an.minX+Math.random()*(an.maxX-an.minX),this.motePositions[n+1]=Dr.min+Math.random()*(Dr.max-Dr.min),this.motePositions[n+2]=an.minZ+Math.random()*(an.maxZ-an.minZ),this.moteVelocities[n]=(Math.random()-.5)*.25,this.moteVelocities[n+1]=.08+Math.random()*.18,this.moteVelocities[n+2]=(Math.random()-.5)*.25,this.motePhase[t]=Math.random()*Math.PI*2}this.moteGeo=new Lt,this.moteGeo.setAttribute("position",new vt(this.motePositions,3)),this.moteGeo.setAttribute("aPhase",new vt(this.motePhase,1));const e=new Rt({uniforms:{uTime:{value:0},uPxPerUnit:{value:300}},vertexShader:`
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
            `,transparent:!0,blending:fi,depthWrite:!1});this.motePoints=new Kl(this.moteGeo,e),this.motePoints.name="ambient-motes",this.motePoints.userData.area={...an},this.motePoints.frustumCulled=!1,this.scene.add(this.motePoints)}tickMotes(e,t){for(let s=0;s<Lr;s++){const r=s*3,o=Math.sin(t*.8+this.motePhase[s])*.08;this.motePositions[r]+=(this.moteVelocities[r]+o)*e,this.motePositions[r+1]+=this.moteVelocities[r+1]*e,this.motePositions[r+2]+=(this.moteVelocities[r+2]-o*.5)*e,this.motePositions[r+1]>Dr.max&&(this.motePositions[r]=an.minX+Math.random()*(an.maxX-an.minX),this.motePositions[r+1]=Dr.min,this.motePositions[r+2]=an.minZ+Math.random()*(an.maxZ-an.minZ))}this.moteGeo.attributes.position.needsUpdate=!0;const n=this.motePoints.material;n.uniforms.uTime.value=t,n.uniforms.uPxPerUnit.value=window.innerHeight*.5*Math.abs(this.projScaleY)}setCamera(e){this.projScaleY=e.projectionMatrix.elements[5]}sync(e,t){for(const s of e.projectiles){if(!s.alive)continue;const r=jo(s.towerType);(s.towerType==="fire"||s.towerType==="poison"||s.towerType==="ice"||s.towerType==="sniper"||s.towerType==="lightning"||s.towerType==="arrow_rapid"||Math.random()<.28)&&this.addTrailParticle(s.x,s.y!==void 0?s.y:.8,s.z,r)}let n=0;for(let s=this.particles.length-1;s>=0;s--){const r=this.particles[s];if(r.life-=t,r.life<=0){this.particles.splice(s,1);continue}r.position.addScaledVector(r.velocity,t),r.velocity.y-=2.5*t,r.velocity.multiplyScalar(.97);const o=r.life/r.maxLife,a=n*3;this.particlePositions[a]=r.position.x,this.particlePositions[a+1]=Math.max(.05,r.position.y),this.particlePositions[a+2]=r.position.z,this.particleColors[a]=r.color.r,this.particleColors[a+1]=r.color.g,this.particleColors[a+2]=r.color.b,this.particleSizes[n]=r.size*o,this.particleAlphas[n]=o,n++}this.particleGeo.setDrawRange(0,n),this.particleGeo.attributes.position.needsUpdate=!0,this.particleGeo.attributes.aColor.needsUpdate=!0,this.particleGeo.attributes.aSize.needsUpdate=!0,this.particleGeo.attributes.aAlpha.needsUpdate=!0,this.tickMotes(t,performance.now()*.001)}addExplosion(e,t,n){const s=new se(jo(n)),r=16+Math.floor(Math.random()*10);for(let o=0;o<r&&this.particles.length<$t;o++){const a=Math.random()*Math.PI*2,l=1.5+Math.random()*3,c=1+Math.random()*2.5;this.particles.push({position:new R(e,.3,t),velocity:new R(Math.cos(a)*l,c,Math.sin(a)*l),life:.4+Math.random()*.3,maxLife:.7,color:s.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.15+Math.random()*.15})}}addDeathEffect(e,t,n){const s=new se(n),r=22+Math.floor(Math.random()*10);for(let o=0;o<r&&this.particles.length<$t;o++){const a=Math.random()*Math.PI*2,l=2+Math.random()*4,c=1.5+Math.random()*3;this.particles.push({position:new R(e,.4,t),velocity:new R(Math.cos(a)*l,c,Math.sin(a)*l),life:.5+Math.random()*.4,maxLife:.9,color:s.clone().offsetHSL(Math.random()*.15-.075,0,Math.random()*.3-.1),size:.18+Math.random()*.2})}for(let o=0;o<5&&this.particles.length<$t;o++)this.particles.push({position:new R(e,.5,t),velocity:new R((Math.random()-.5)*.5,2+Math.random(),(Math.random()-.5)*.5),life:.3,maxLife:.3,color:new se(16777215),size:.3+Math.random()*.2})}addTrailParticle(e,t,n,s){if(this.particles.length>=$t)return;const r=new se(s);this.particles.push({position:new R(e+(Math.random()-.5)*.1,t+(Math.random()-.5)*.1,n+(Math.random()-.5)*.1),velocity:new R(0,Math.random()*.5,0),life:.2+Math.random()*.2,maxLife:.4,color:r.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.1+Math.random()*.1})}addBuildEffect(e,t){const s=new se(4906624);for(let r=0;r<15&&!(this.particles.length>=$t);r++){const o=r/15*Math.PI*2,a=1+Math.random()*1.5;this.particles.push({position:new R(e,.2,t),velocity:new R(Math.cos(o)*a,.5+Math.random(),Math.sin(o)*a),life:.4+Math.random()*.2,maxLife:.6,color:s.clone().offsetHSL(0,0,Math.random()*.2),size:.15+Math.random()*.1})}}addMuzzleFlash(e,t,n){const s=new se(jo(n));this.particles.length<$t&&this.particles.push({position:new R(e,1,t),velocity:new R(0,.4,0),life:.14,maxLife:.14,color:new se(16777215),size:.45});const r=5;for(let o=0;o<r&&this.particles.length<$t;o++){const a=Math.random()*Math.PI*2,l=1.4+Math.random()*1.2;this.particles.push({position:new R(e,.9,t),velocity:new R(Math.cos(a)*l*.4,1.2+Math.random()*.6,Math.sin(a)*l*.4),life:.22+Math.random()*.14,maxLife:.36,color:s.clone().offsetHSL(Math.random()*.08-.04,0,Math.random()*.2),size:.14+Math.random()*.1})}}addImpactFlash(e,t,n,s){const r=new se(jo(s));for(let a=0;a<3&&this.particles.length<$t;a++)this.particles.push({position:new R(e,.35,t),velocity:new R(0,.6,0),life:.16,maxLife:.16,color:new se(16777215),size:.5+n*.1});const o=Math.min(24,12+Math.floor(n*4));for(let a=0;a<o&&this.particles.length<$t;a++){const l=a/o*Math.PI*2+Math.random()*.2,c=n*(1.6+Math.random()*.8);this.particles.push({position:new R(e,.2,t),velocity:new R(Math.cos(l)*c,.4+Math.random()*.5,Math.sin(l)*c),life:.32+Math.random()*.2,maxLife:.52,color:r.clone().offsetHSL(Math.random()*.1-.05,0,Math.random()*.2),size:.18+Math.random()*.12})}}addSellEffect(e,t){const s=new se(16498468);for(let r=0;r<15&&!(this.particles.length>=$t);r++){const o=r/15*Math.PI*2,a=1.5+Math.random()*2;this.particles.push({position:new R(e,.5,t),velocity:new R(Math.cos(o)*a,1.5+Math.random()*2,Math.sin(o)*a),life:.3+Math.random()*.2,maxLife:.5,color:s.clone().offsetHSL(.05*Math.random(),0,Math.random()*.2),size:.15+Math.random()*.15})}}}class lb{constructor(e){J(this,"scene");J(this,"projMeshes",new Map);J(this,"projectileTemplates",new Map);this.scene=e}sync(e,t){const n=new Set;for(const s of e.projectiles){if(!s.alive)continue;n.add(s.id);let r=this.projMeshes.get(s.id);r||(r=this.createProjectileMesh(s.towerType),this.scene.add(r),this.projMeshes.set(s.id,r)),r.position.set(s.x,s.y!==void 0?s.y:.8,s.z);const o=r.userData.glow??null;if(o){const a=1+Math.sin(performance.now()*.02+s.id)*.12;o.scale.setScalar(a)}if(s.towerType!=="cannon"&&s.towerType!=="fire"&&s.towerType!=="poison"){const a=s.targetX-s.startX,l=s.targetZ-s.startZ,c=Math.min(1,s.progress+.05),d=s.startX+a*c,u=s.startZ+l*c;let f=s.startY+(s.targetY-s.startY)*c;s.arcHeight>0&&(f+=Math.sin(c*Math.PI)*s.arcHeight),c>s.progress&&r.lookAt(d,f,u)}else(s.towerType==="poison"||s.towerType==="cannon")&&(r.rotation.x+=t*5,r.rotation.z+=t*3);s.towerType==="sniper"&&(r.scale.z=1.15+Math.sin(performance.now()*.03+s.id)*.08)}for(const[s,r]of this.projMeshes.entries())n.has(s)||(this.scene.remove(r),this.projMeshes.delete(s))}createProjectileMesh(e){let t=this.projectileTemplates.get(e);t||(t=this.createProjectileTemplate(e),this.projectileTemplates.set(e,t));const n=t.clone(!0),s=n.getObjectByName("projectile-glow");return s&&(n.userData.glow=s),n}createProjectileTemplate(e){const t=new Tt;switch(t.name=`projectile:${e}`,e.includes("_")?e.split("_")[0]:e){case"arrow":{const s=new Fn(.02,.02,.6,6);s.rotateX(Math.PI/2);const r=new ai({color:9132587}),o=new Ce(s,r),a=new _r(.06,.2,4);a.rotateX(-Math.PI/2),a.translate(0,0,-.3);const l=new jt({color:13421772,metalness:.8,roughness:.2}),c=new Ce(a,l),d=new ri(.15,.15,.1);d.translate(0,0,.3);const u=e==="arrow_pierce"?8232191:e==="arrow_rapid"?16774320:14492194,h=new ai({color:u}),f=new Ce(d,h);if(t.add(o,c,f),e==="arrow_pierce"||e==="arrow_rapid"){const g=new Ce(new oi(.12,8,8),new He({color:e==="arrow_pierce"?10005247:16772761,transparent:!0,opacity:.22}));g.position.z=.08,g.name="projectile-glow",t.add(g)}break}case"cannon":{const s=new jt({color:2236962,roughness:.8,metalness:.4}),r=new oi(.2,12,12),o=new Ce(r,s);t.add(o);break}case"fire":{const s=new He({color:16755200}),r=new oi(.15,8,8),o=new Ce(r,s);t.add(o);const a=new He({color:16729088,transparent:!0,opacity:.6}),l=new oi(.25,8,8),c=new Ce(l,a);c.name="projectile-glow",t.add(c);break}case"poison":{const s=new jt({color:4521762,roughness:.2,transparent:!0,opacity:.8}),r=new oi(.18,12,12),o=new Ce(r,s);o.scale.set(1,.7,1),t.add(o);break}case"ice":{const s=new jt({color:11197951,roughness:.1,transparent:!0,opacity:.8}),r=new _r(.1,.6,6);r.rotateX(-Math.PI/2);const o=new Ce(r,s);t.add(o);const a=new Ce(new oi(.18,8,8),new He({color:12514303,transparent:!0,opacity:.16}));a.name="projectile-glow",t.add(a);break}case"sniper":{const s=new He({color:5605631}),r=new Fn(.03,.03,1.2,6);r.rotateX(Math.PI/2);const o=new Ce(r,s);t.add(o);const a=new Ce(new Fn(.06,.06,1.6,8),new He({color:8961023,transparent:!0,opacity:.14}));a.rotateX(Math.PI/2),a.position.z=.08,a.name="projectile-glow",t.add(a);break}case"lightning":{const s=new Ce(new Fn(.018,.018,.9,5),new He({color:16777215}));s.rotateX(Math.PI/2),t.add(s);const r=new Ce(new Fn(.065,.065,1.1,8),new He({color:16774565,transparent:!0,opacity:.18}));r.rotateX(Math.PI/2),r.name="projectile-glow",t.add(r);break}}return t.traverse(s=>{s instanceof Ce&&(e==="arrow"||e==="cannon")&&(s.castShadow=!0)}),t}}const $h={valid:4521796,invalid:16729156};class cb{constructor(e){J(this,"raycaster",new g_);J(this,"mouse",new we);J(this,"groundPlane",new Si(new R(0,1,0),-Ft));J(this,"ghostMesh",null);J(this,"rangeRing",null);J(this,"scene");J(this,"hoveredCol",-1);J(this,"hoveredRow",-1);this.scene=e}updateMouse(e,t){let n,s;if("touches"in e){if(e.touches.length===0)return;n=e.touches[0].clientX,s=e.touches[0].clientY}else n=e.clientX,s=e.clientY;this.mouse.x=n/window.innerWidth*2-1,this.mouse.y=-(s/window.innerHeight)*2+1,this.raycaster.setFromCamera(this.mouse,t);const r=new R;if(!this.raycaster.ray.intersectPlane(this.groundPlane,r)){this.hoveredCol=-1,this.hoveredRow=-1;return}const a=Math.floor((r.x-Q.origin.x)/Q.cellSize),l=Math.floor((r.z-Q.origin.z)/Q.cellSize);Qe.cellAt(a,l).exists?(this.hoveredCol=a,this.hoveredRow=l):(this.hoveredCol=-1,this.hoveredRow=-1)}showGhost(e,t,n,s,r){if(!this.ghostMesh){const a=new Fn(.35,.4,.5,8),l=new He({transparent:!0,opacity:.4,depthWrite:!1});this.ghostMesh=new Ce(a,l),this.scene.add(this.ghostMesh)}const o=et(e,t);if(this.ghostMesh.position.set(o.x,Ft+.25,o.z),this.ghostMesh.visible=!0,this.ghostMesh.material.color.setHex(n?$h.valid:$h.invalid),r&&r>0){if(!this.rangeRing){const a=new Xi(.95,1,48),l=new He({color:4521864,transparent:!0,opacity:.2,side:ct,depthWrite:!1});this.rangeRing=new Ce(a,l),this.rangeRing.rotation.x=-Math.PI/2,this.scene.add(this.rangeRing)}this.rangeRing.scale.set(r,r,1),this.rangeRing.position.set(o.x,Ft+.003,o.z),this.rangeRing.visible=!0,this.rangeRing.material.color.setHex(n?4521864:16737860)}else this.rangeRing&&(this.rangeRing.visible=!1)}hideGhost(){this.ghostMesh&&(this.ghostMesh.visible=!1),this.rangeRing&&(this.rangeRing.visible=!1)}}const Kh={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};class Ur{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const db=new pr(-1,1,1,-1,0,1);class ub extends Lt{constructor(){super(),this.setAttribute("position",new gt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new gt([0,2,0,0,2,0],2))}}const hb=new ub;class Zh{constructor(e){this._mesh=new Ce(hb,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,db)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class Jh extends Ur{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Rt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=So.clone(e.uniforms),this.material=new Rt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new Zh(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class Qh extends Ur{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class fb extends Ur{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class pb{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new we);this._width=n.width,this._height=n.height,t=new wn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Kn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Jh(Kh),this.copyPass.material.blending=qn,this.clock=new o_}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const o=this.passes[s];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),o.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),o.needsSwap){if(n){const a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Qh!==void 0&&(o instanceof Qh?n=!0:o instanceof fb&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new we);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class mb extends Ur{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new se}render(e,t,n){const s=e.autoClear;e.autoClear=!1;let r,o;this.overrideMaterial!==null&&(o=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=o),e.autoClear=s}}const gb={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new se(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};class Vs extends Ur{constructor(e,t,n,s){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new we(e.x,e.y):new we(256,256),this.clearColor=new se(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new wn(r,o,{type:Kn}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){const h=new wn(r,o,{type:Kn});h.texture.name="UnrealBloomPass.h"+u,h.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(h);const f=new wn(r,o,{type:Kn});f.texture.name="UnrealBloomPass.v"+u,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),r=Math.round(r/2),o=Math.round(o/2)}const a=gb;this.highPassUniforms=So.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Rt({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];const l=[3,5,7,9,11];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new we(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new R(1,1,1),new R(1,1,1),new R(1,1,1),new R(1,1,1),new R(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const d=Kh;this.copyUniforms=So.clone(d.uniforms),this.blendMaterial=new Rt({uniforms:this.copyUniforms,vertexShader:d.vertexShader,fragmentShader:d.fragmentShader,blending:fi,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new se,this.oldClearAlpha=1,this.basic=new He,this.fsQuad=new Zh(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new we(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const o=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=Vs.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=Vs.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),a=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=o}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Rt({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new we(.5,.5)},direction:{value:new we(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
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
				}`})}}Vs.BlurDirectionX=new we(1,0),Vs.BlurDirectionY=new we(0,1);class xb{constructor(e,t,n){J(this,"composer");J(this,"bloomPass");J(this,"gradePass");this.composer=new pb(e);const s=new mb(t,n);this.composer.addPass(s),this.bloomPass=new Vs(new we(window.innerWidth,window.innerHeight),ke.atmosphere.bloomStrength,ke.atmosphere.bloomRadius,ke.atmosphere.bloomThreshold),this.composer.addPass(this.bloomPass),this.gradePass=new Jh(new Rt({uniforms:{tDiffuse:{value:null},uTime:{value:0},uVignetteStrength:{value:ke.atmosphere.vignetteStrength},uGrainAmount:{value:ke.atmosphere.grainAmount},uContrast:{value:1.06},uSaturation:{value:1.08},uTint:{value:new R(.98,1.02,.98)}},vertexShader:`
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
                `}),"tDiffuse"),this.composer.addPass(this.gradePass)}render(){this.gradePass.uniforms.uTime.value=performance.now()*.001,this.composer.render()}resize(e,t){this.composer.setSize(e,t),this.bloomPass.setSize(e,t)}setTint(e,t,n){this.gradePass.uniforms.uTint.value.set(e,t,n)}}class vb{constructor(){J(this,"ctx",null);J(this,"enabled",!0);J(this,"musicStarted",!1);J(this,"musicMaster",null);J(this,"prepGain",null);J(this,"waveGain",null);J(this,"musicPhase","off");J(this,"waveBeatTimer",null)}init(){this.ctx||(this.ctx=new(window.AudioContext||window.webkitAudioContext)),this.ctx.state==="suspended"&&this.ctx.resume()}toggle(){return this.enabled=!this.enabled,this.musicMaster&&this.ctx&&this.musicMaster.gain.linearRampToValueAtTime(this.enabled?1:0,this.ctx.currentTime+.2),this.enabled}playTone(e,t,n,s){if(!this.enabled||!this.ctx)return;const r=this.ctx.createOscillator(),o=this.ctx.createGain();r.type=t,r.frequency.setValueAtTime(e,this.ctx.currentTime),r.connect(o),o.connect(this.ctx.destination),o.gain.setValueAtTime(s,this.ctx.currentTime),o.gain.exponentialRampToValueAtTime(.01,this.ctx.currentTime+n),r.start(),r.stop(this.ctx.currentTime+n)}playShoot(){this.playTone(400,"square",.1,.05)}playHit(){this.playTone(150,"sawtooth",.15,.05)}playBuild(){this.playTone(600,"sine",.2,.1),setTimeout(()=>this.playTone(800,"sine",.2,.1),100)}playSell(){this.playTone(500,"triangle",.2,.1),setTimeout(()=>this.playTone(300,"triangle",.3,.1),100)}playError(){this.playTone(100,"sawtooth",.2,.1)}playStreakStinger(){if(!this.enabled||!this.ctx)return;[523,659,784,988].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"triangle",.18,.06),n*60)})}playMegaStingerHit(){if(!this.enabled||!this.ctx)return;[392,523,659,784,1047].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"sawtooth",.22,.07),n*70)})}playBossRoar(){if(!this.enabled||!this.ctx)return;const e=this.ctx,t=e.currentTime,n=e.createOscillator();n.type="sawtooth",n.frequency.setValueAtTime(50,t),n.frequency.exponentialRampToValueAtTime(28,t+.9);const s=e.createGain();s.gain.setValueAtTime(.18,t),s.gain.exponentialRampToValueAtTime(.01,t+1),n.connect(s),s.connect(e.destination),n.start(t),n.stop(t+1.05);const r=e.createBuffer(1,e.sampleRate*.8,e.sampleRate),o=r.getChannelData(0);for(let d=0;d<o.length;d++)o[d]=(Math.random()*2-1)*(1-d/o.length);const a=e.createBufferSource();a.buffer=r;const l=e.createGain();l.gain.setValueAtTime(.08,t),l.gain.exponentialRampToValueAtTime(.01,t+.8);const c=e.createBiquadFilter();c.type="lowpass",c.frequency.value=400,a.connect(c),c.connect(l),l.connect(e.destination),a.start(t),a.stop(t+.8)}playVictory(){if(!this.enabled||!this.ctx)return;[523,659,784,1047,1319].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"triangle",.35,.08),n*110)})}playDefeat(){if(!this.enabled||!this.ctx)return;[523,466,392,311].forEach((t,n)=>{setTimeout(()=>this.playTone(t,"sawtooth",.4,.08),n*150)})}startMusic(){if(this.musicStarted||!this.ctx)return;this.musicStarted=!0;const e=this.ctx,t=e.createGain();t.gain.value=this.enabled?1:0,t.connect(e.destination),this.musicMaster=t;const n=e.createGain();n.gain.value=.035;const s=e.createBiquadFilter();s.type="lowpass",s.frequency.value=420,s.Q.value=.4,n.connect(s),s.connect(t);for(const l of[55,82]){const c=e.createOscillator();c.type="sine",c.frequency.value=l;const d=e.createOscillator();d.frequency.value=.07;const u=e.createGain();u.gain.value=2.5,d.connect(u),u.connect(c.frequency),c.connect(n),c.start(),d.start()}const r=e.createGain();r.gain.value=0,r.connect(t),this.prepGain=r;for(const l of[220,329.63,440]){const c=e.createOscillator();c.type="triangle",c.frequency.value=l;const d=e.createGain();d.gain.value=.02,c.connect(d),d.connect(r),c.start()}const o=e.createGain();o.gain.value=0,o.connect(t),this.waveGain=o;const a=e.createBiquadFilter();a.type="bandpass",a.frequency.value=600,a.Q.value=1.4,a.connect(o);for(const l of[110,164.81,220]){const c=e.createOscillator();c.type="sawtooth",c.frequency.value=l;const d=e.createGain();d.gain.value=.018,c.connect(d),d.connect(a),c.start()}}setMusicPhase(e){if(!this.ctx||(this.musicStarted||this.startMusic(),this.musicPhase===e))return;this.musicPhase=e;const t=this.ctx.currentTime,n=1.4,s=e==="prep"?.7:0,r=e==="wave"?.85:0;this.prepGain&&(this.prepGain.gain.cancelScheduledValues(t),this.prepGain.gain.setValueAtTime(this.prepGain.gain.value,t),this.prepGain.gain.linearRampToValueAtTime(s,t+n)),this.waveGain&&(this.waveGain.gain.cancelScheduledValues(t),this.waveGain.gain.setValueAtTime(this.waveGain.gain.value,t),this.waveGain.gain.linearRampToValueAtTime(r,t+n)),this.waveBeatTimer!==null&&(clearInterval(this.waveBeatTimer),this.waveBeatTimer=null),e==="wave"&&(this.waveBeatTimer=window.setInterval(()=>{if(!this.enabled||!this.ctx||this.musicPhase!=="wave")return;const o=this.ctx,a=o.currentTime,l=o.createOscillator();l.type="sine",l.frequency.setValueAtTime(90,a),l.frequency.exponentialRampToValueAtTime(40,a+.18);const c=o.createGain();c.gain.setValueAtTime(.08,a),c.gain.exponentialRampToValueAtTime(.001,a+.2),l.connect(c),this.musicMaster&&c.connect(this.musicMaster),l.start(a),l.stop(a+.22)},620))}}const Ot=new vb,ef="tower-defense-v1",yc={runs:0,victories:0,totalKills:0,totalWavesCleared:0,totalTowersBuilt:0,highestWaveReached:0},bc={prefs:{difficulty:"normal",soundEnabled:!0,speedMultiplier:1,endlessMode:!1},highScores:{},achievements:[],lifetime:{...yc}};function _b(){try{const i=localStorage.getItem(ef);if(!i)return structuredClone(bc);const e=JSON.parse(i);return{prefs:{...bc.prefs,...e.prefs??{}},highScores:e.highScores??{},achievements:e.achievements??[],lifetime:{...yc,...e.lifetime??{}}}}catch{return structuredClone(bc)}}function Ri(i){try{localStorage.setItem(ef,JSON.stringify(i))}catch{}}function yb(i,e,t,n,s){const r=i.highScores[e];return!r||t>r.score?(i.highScores[e]={score:t,wave:n,rank:s,date:Date.now()},Ri(i),!0):!1}function bb(i,e){return i.achievements.includes(e)?!1:(i.achievements.push(e),Ri(i),!0)}function Mb(i,e,t,n,s,r){i.lifetime.runs+=1,e&&(i.lifetime.victories+=1),i.lifetime.totalKills+=t,i.lifetime.totalWavesCleared+=n,i.lifetime.totalTowersBuilt+=s,r>i.lifetime.highestWaveReached&&(i.lifetime.highestWaveReached=r),Ri(i)}function Sb(i){i.highScores={},i.achievements=[],i.lifetime={...yc},Ri(i)}const Mc=[{id:"first_blood",name:"First Blood",desc:"Score your very first kill",emoji:"🩸",check:(i,e)=>e.event==="enemyKilled"&&i.totalKills===1},{id:"streak_10",name:"Combo Rookie",desc:"Hit a 10-kill streak",emoji:"🔥",check:(i,e)=>e.event==="streakBonus"&&e.payload.streak>=10},{id:"streak_25",name:"Combo Master",desc:"Hit a 25-kill streak",emoji:"⚡",check:(i,e)=>e.event==="streakBonus"&&e.payload.streak>=25},{id:"perfect_wave",name:"Untouchable",desc:"Clear a wave without losing any lives",emoji:"🛡",check:(i,e)=>e.event==="waveCleared"&&e.payload.perfect===!0},{id:"milestone_25",name:"Holding the Line",desc:"Reach Wave 25",emoji:"🏁",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=25},{id:"milestone_50",name:"Frontline Veteran",desc:"Reach Wave 50",emoji:"🎖",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=50},{id:"milestone_75",name:"War Commander",desc:"Reach Wave 75",emoji:"👑",check:(i,e)=>e.event==="milestone"&&e.payload.wave>=75},{id:"victory",name:"Bastion Triumphant",desc:"Clear all 99 waves",emoji:"🏆",check:(i,e)=>e.event==="gameOver"&&e.payload.won===!0},{id:"victory_hard",name:"Iron Legend",desc:"Clear all 99 waves on Hard",emoji:"💠",check:(i,e)=>e.event==="gameOver"&&e.payload.won===!0&&i.difficulty==="hard"},{id:"frugal",name:"Frugal Commander",desc:"Clear Wave 25 with only 3 towers or fewer",emoji:"💡",check:(i,e)=>e.event==="waveCleared"&&e.payload.wave>=25&&i.towers.length<=3}],Sc="towerDefense.uiLayout.v1",wb=450,Tb=12;function Eb(){try{return JSON.parse(localStorage.getItem(Sc)||"{}")}catch{return{}}}function Ab(i){try{localStorage.setItem(Sc,JSON.stringify(i))}catch{}}let Ko=Eb();const tf=[],Zo=(i,e,t)=>Math.min(Math.max(i,e),Math.max(e,t));function Rb(){window.addEventListener("click",i=>{i.stopPropagation(),i.preventDefault()},{capture:!0,once:!0})}function ji(i,e){if(!i)return;i.classList.add("draggable-panel");const t=()=>{const h=Ko[e];if(!h||i.classList.contains("hidden"))return;const f=i.offsetWidth,g=i.offsetHeight;if(!f||!g)return;const x=Zo(h.x*(window.innerWidth-f),0,window.innerWidth-f),m=Zo(h.y*(window.innerHeight-g),0,window.innerHeight-g);i.style.left=`${x}px`,i.style.top=`${m}px`,i.style.right="auto",i.style.bottom="auto",i.style.transform="none"};tf.push({el:i,apply:t}),t(),new MutationObserver(t).observe(i,{attributes:!0,attributeFilter:["class"]}),window.addEventListener("resize",t);let n=0,s=-1,r=!1,o=0,a=0,l=0,c=0;const d=()=>{var f;r=!0;const h=i.getBoundingClientRect();l=o-h.left,c=a-h.top,i.style.left=`${h.left}px`,i.style.top=`${h.top}px`,i.style.right="auto",i.style.bottom="auto",i.style.transform="none",i.classList.add("ui-dragging"),(f=navigator.vibrate)==null||f.call(navigator,20)};i.addEventListener("pointerdown",h=>{if(!(r||s!==-1||!h.isPrimary)){s=h.pointerId,o=h.clientX,a=h.clientY;try{i.setPointerCapture(s)}catch{}n=window.setTimeout(d,wb)}}),i.addEventListener("pointermove",h=>{if(h.pointerId!==s)return;if(!r){if(Math.hypot(h.clientX-o,h.clientY-a)>Tb){clearTimeout(n);try{i.releasePointerCapture(s)}catch{}s=-1}return}h.preventDefault();const f=i.offsetWidth,g=i.offsetHeight;i.style.left=`${Zo(h.clientX-l,0,window.innerWidth-f)}px`,i.style.top=`${Zo(h.clientY-c,0,window.innerHeight-g)}px`});const u=h=>{if(h.pointerId!==s)return;clearTimeout(n);try{i.releasePointerCapture(s)}catch{}if(s=-1,!r)return;r=!1,i.classList.remove("ui-dragging");const f=i.offsetWidth,g=i.offsetHeight;Ko[e]={x:(parseFloat(i.style.left)||0)/Math.max(1,window.innerWidth-f),y:(parseFloat(i.style.top)||0)/Math.max(1,window.innerHeight-g)},Ab(Ko),Rb()};i.addEventListener("pointerup",u),i.addEventListener("pointercancel",u)}function Cb(){Ko={};try{localStorage.removeItem(Sc)}catch{}for(const{el:i}of tf)i.style.left="",i.style.top="",i.style.right="",i.style.bottom="",i.style.transform=""}const Nr="tower-defense-run-v1",nf=1,Pb=720*60*60*1e3,Ib=new Set(["first","last","strongest","weakest"]),Lb=new Set(["easy","normal","hard"]);function ln(i,e=0,t=Number.MAX_SAFE_INTEGER){return typeof i=="number"&&Number.isFinite(i)&&i>=e&&i<=t}function Yt(i,e=0,t=Number.MAX_SAFE_INTEGER){return ln(i,e,t)&&Number.isInteger(i)}function Db(i){if(!i||typeof i!="object")return!1;const e=i;return ln(e.totalDamageDealt)&&!!e.damageByType&&typeof e.damageByType=="object"&&Object.values(e.damageByType).every(t=>ln(t))&&!!e.killsByTower&&typeof e.killsByTower=="object"&&Object.values(e.killsByTower).every(t=>Yt(t))&&Yt(e.longestStreak)&&Yt(e.towersBuilt)&&Yt(e.towersSold)&&ln(e.goldEarned)&&ln(e.goldSpent)}function Ub(i){if(!i||typeof i!="object")return!1;const e=i,t=typeof e.type=="string"?sn[e.type]:void 0;return Yt(e.id,1)&&!!t&&Yt(e.level,0,t.levels.length-1)&&Yt(e.col,0,Q.cols-1)&&Yt(e.row,0,Q.rows-1)&&Qe.cellAt(e.col,e.row).buildable&&ln(e.totalInvested)&&typeof e.targetingMode=="string"&&Ib.has(e.targetingMode)&&Yt(e.kills)}function Nb(i){if(!i||typeof i!="object")return!1;const e=i,t=e.endlessMode?1e5:Xt.waves.length-1;if(e.version!==nf||!ln(e.savedAt,1)||Date.now()-e.savedAt>Pb||e.savedAt>Date.now()+6e4||typeof e.difficulty!="string"||!Lb.has(e.difficulty)||!Yt(e.currentWave,0,t)||!ln(e.gold)||!Yt(e.lives)||!Yt(e.maxLives,1)||e.lives>e.maxLives||!ln(e.score)||!Yt(e.perfectWaves)||!Yt(e.totalKills)||typeof e.endlessMode!="boolean"||!(e.waveModifier===null||e.waveModifier==="BLITZ"||e.waveModifier==="ARMORED"||e.waveModifier==="FRENZY")||!Yt(e.nextId,1)||!Array.isArray(e.towers)||e.towers.length>Q.cols*Q.rows||!e.towers.every(Ub)||!Array.isArray(e.skillRemaining)||!e.skillRemaining.every(r=>ln(r,0,1440*60))||!ln(e.buffGoldMult,.1,100)||!ln(e.buffDamageMult,.1,100)||!ln(e.buffRangeMult,.1,100)||!Db(e.stats))return!1;const n=new Set,s=new Set;for(const r of e.towers){const o=`${r.col},${r.row}`;if(n.has(r.id)||s.has(o))return!1;n.add(r.id),s.add(o)}return!0}function Jo(i){if(i.phase!=="prep"||i.buffChoicePending||i.enemies.some(t=>t.alive&&!t.reached)||i.projectiles.some(t=>t.alive))return!1;const e={version:nf,savedAt:Date.now(),difficulty:i.difficulty,currentWave:i.currentWave,gold:i.gold,lives:i.lives,maxLives:i.maxLives,score:i.score,perfectWaves:i.perfectWaves,totalKills:i.totalKills,endlessMode:i.endlessMode,waveModifier:i.waveModifier,nextId:i.nextId,towers:i.towers.map(t=>({id:t.id,type:t.type,level:t.level,col:t.col,row:t.row,totalInvested:t.totalInvested,targetingMode:t.targetingMode,kills:t.kills})),skillRemaining:i.skills.map(t=>t.remaining),buffGoldMult:i.buffGoldMult,buffDamageMult:i.buffDamageMult,buffRangeMult:i.buffRangeMult,stats:structuredClone(i.stats)};try{return localStorage.setItem(Nr,JSON.stringify(e)),!0}catch{return!1}}function Qo(){try{const i=localStorage.getItem(Nr);if(!i)return null;const e=JSON.parse(i);if(Nb(e))return e;localStorage.removeItem(Nr)}catch{try{localStorage.removeItem(Nr)}catch{}}return null}function sf(){try{localStorage.removeItem(Nr)}catch{}}function Fb(i,e){const t=Er(i.difficulty);t.currentWave=i.currentWave,t.gold=i.gold,t.lives=i.lives,t.maxLives=i.maxLives,t.score=i.score,t.perfectWaves=i.perfectWaves,t.totalKills=i.totalKills,t.endlessMode=i.endlessMode,t.waveModifier=i.waveModifier,t.nextId=i.nextId,t.speedMultiplier=e,t.buffGoldMult=i.buffGoldMult,t.buffDamageMult=i.buffDamageMult,t.buffRangeMult=i.buffRangeMult,t.stats=structuredClone(i.stats),t.skills=t.skills.map((s,r)=>({...s,remaining:i.skillRemaining[r]??0})),t.towers=i.towers.map(s=>{const r=et(s.col,s.row);return{...s,worldX:r.x,worldZ:r.z,cooldownRemaining:0,aimAngle:0,targetId:null}});const n=t.towers.reduce((s,r)=>Math.max(s,r.id),0);return t.nextId=Math.max(t.nextId,n+1),rc(t),t}const Ob=Math.PI*.62,kb=.18,Bb=.85;class rf{constructor(e){J(this,"scene");J(this,"門扇",[]);J(this,"開度",0);J(this,"閃",0);J(this,"閃燈",null);J(this,"光環",null);J(this,"光幕",null);J(this,"光柱",null);J(this,"血條",null);J(this,"血條底",null);J(this,"血條長",2.1);J(this,"血條位",new R);J(this,"上次命",-1);J(this,"旗",[]);J(this,"入口組",null);J(this,"城堡組",null);J(this,"城堡頂",0);J(this,"time",0);this.scene=e}static 清單(){return["structures/wallDoorwaySquareWide.glb","structures/wallDoor.glb","structures/pillarStone.glb","structures/wallArch.glb","structures/wall.glb","structures/wallWindowRound.glb","structures/wallCorner.glb","structures/roofHighPoint.glb","structures/bannerRed.glb","structures/bannerGreen.glb","structures/lantern.glb","structures/stairsStone.glb"]}build(){this.buildSpawnGate(),this.buildGoalKeep()}buildSpawnGate(){var h,f;const[e,t]=Q.spawnCell,n=et(e,t),s=new Tt;s.name="spawn-gate";const r=sc(),o=r[0]??n,a=r[1]??et(((h=Q.path[1])==null?void 0:h[0])??e,((f=Q.path[1])==null?void 0:f[1])??t);s.position.set(o.x,Ft,o.z),s.rotation.y=Math.atan2(a.x-o.x,a.z-o.z)-Math.PI/2,s.scale.setScalar(.85),this.scene.add(s),this.入口組=s;const l=on("structures/wallDoorwaySquareWide.glb");l.scale.setScalar(1.45),Ci(l),Fr(l,14212579,10134702),s.add(l);for(const g of[-1,1]){const x=on("structures/pillarStone.glb");x.scale.set(1.35,1.75,1.35),Ci(x),x.position.z+=g*.72,Fr(x,14870250,10924217),s.add(x);const m=on("structures/lantern.glb");m.scale.setScalar(.9),Ci(m),m.position.y=1.72,m.position.z+=g*.72,s.add(m)}for(const g of[-1,1]){const x=new Tt;x.position.set(0,0,g*.66),s.add(x);const m=on("structures/wallDoor.glb");m.scale.set(1.3,1.45,.65),Ci(m),m.position.z-=g*.33,Fr(m,13208139,9264174),x.add(m),this.門扇.push({node:x,閂角:0,方向:g})}this.閃燈=new zo(10219263,0,12,1.2),this.閃燈.position.set(0,.9,0),s.add(this.閃燈);const c=new Ce(new Xi(.3,.62,44),new He({color:11072255,transparent:!0,opacity:0,side:ct,depthWrite:!1,blending:fi}));c.rotation.x=-Math.PI/2,c.position.y=.28,s.add(c),this.光環=c;const d=new Ce(new nn(1.35,1.55),new He({color:10350335,transparent:!0,opacity:.16,side:ct,depthWrite:!1,blending:fi}));d.rotation.y=Math.PI/2,d.position.set(0,.66,0),s.add(d),this.光幕=d;const u=new Ce(new Fn(.26,.4,2.4,18,1,!0),new He({color:12055807,transparent:!0,opacity:0,side:ct,depthWrite:!1,blending:fi}));u.position.set(0,1.2,0),s.add(u),this.光柱=u}buildGoalKeep(){const[e,t]=Q.goalCell,n=et(e,t),s=new Tt;s.name="goal-keep";const r=Q.path[Q.path.length-2]??Q.path[Q.path.length-1],o=et(r[0],r[1]),a=Hb(n,o,.38);s.position.set(a.x,Ft,a.z),s.rotation.y=Math.atan2(o.x-n.x,o.z-n.z),s.scale.setScalar(1),this.scene.add(s),this.城堡組=s;const l=[["structures/wall.glb",-.5,0,0],["structures/wall.glb",.5,0,0],["structures/wall.glb",0,-.5,Math.PI/2],["structures/wallArch.glb",0,.5,Math.PI/2]];for(const[m,p,S,b]of l){const v=on(m);v.scale.setScalar(1),v.rotation.y=b,Ci(v),v.position.x+=p,v.position.z+=S,Fr(v,14541543,10463666),s.add(v)}const c=new Tt;c.position.y=1,s.add(c);const d=[[-.31,0,0],[.31,0,0],[0,-.31,Math.PI/2],[0,.31,Math.PI/2]];for(const[m,p,S]of d){const b=on("structures/wall.glb");b.scale.set(.64,.8,.64),b.rotation.y=S,Ci(b),b.position.x+=m,b.position.z+=p,Fr(b,15265007,11318717),c.add(b)}const u=on("structures/roofHighPoint.glb");u.scale.setScalar(.78),Ci(u),u.position.y=.8,Gb(u,14700607,16743270),c.add(u);for(const m of[-1,1]){const p=on("structures/bannerGreen.glb");p.scale.setScalar(.9),Ci(p),p.position.x+=m*.62,p.position.y=1.05,p.position.z-=.42,s.add(p),this.旗.push(p)}s.updateWorldMatrix(!0,!0);const h=new Gt().setFromObject(s).max.y;this.城堡頂=h;const f=new R(a.x,h+.22,a.z),g=new Ce(new nn(this.血條長+.14,.3),new He({color:1313547,transparent:!0,opacity:.85,depthTest:!1,depthWrite:!1}));g.position.copy(f),g.renderOrder=900,this.scene.add(g),this.血條底=g;const x=new Ce(new nn(this.血條長,.2),new He({color:5562474,transparent:!0,opacity:1,depthTest:!1,depthWrite:!1}));x.position.copy(f),x.renderOrder=901,this.scene.add(x),this.血條=x,this.血條位=f}開門(){this.開度=1,this.閃=1}update(e,t,n,s){this.time+=e;const o=this.開度>0?e/Bb:e/kb;this.開度=Math.max(0,this.開度-o);const a=Ob*zb(this.開度);for(const l of this.門扇)l.node.rotation.y=l.閂角+a*l.方向;if(this.閃=Math.max(0,this.閃-e/.55),this.閃燈&&(this.閃燈.intensity=this.閃*this.閃*4.5),this.光環){const c=.75+(1-this.閃)*3.2;this.光環.scale.set(c,c,1),this.光環.material.opacity=this.閃*.3}if(this.光柱){const l=this.光柱.material;l.opacity=this.閃*.12;const c=.7+(1-this.閃)*.8;this.光柱.scale.set(c,1,c),this.光柱.visible=this.閃>.01}if(this.光幕){const l=this.光幕.material;l.opacity=.07+this.閃*.26+Math.sin(this.time*2.6)*.015}for(let l=0;l<this.旗.length;l+=1)this.旗[l].rotation.y=Math.sin(this.time*1.1+l*1.7)*.22;if(this.血條&&this.血條底){if(t!==this.上次命){this.上次命=t;const d=n>0?Math.max(0,Math.min(1,t/n)):0;this.血條.scale.x=Math.max(.001,d),this.血條.material.color.setHex(d>.6?5562474:d>.28?14729540:14703178)}this.血條底.quaternion.copy(s.quaternion),this.血條.quaternion.copy(s.quaternion);const l=new R(1,0,0).applyQuaternion(s.quaternion),c=this.血條.scale.x;this.血條.position.copy(this.血條位).addScaledVector(l,-(this.血條長*(1-c))/2)}}狀態(){var n,s,r;const e=(n=this.入口組)==null?void 0:n.position,t=(s=this.城堡組)==null?void 0:s.position;return{開度:+this.開度.toFixed(3),閃:+this.閃.toFixed(3),門角:this.門扇.map(o=>+o.node.rotation.y.toFixed(3)),血條闊:+(((r=this.血條)==null?void 0:r.scale.x)??-1).toFixed(3),入口位:[+((e==null?void 0:e.x)??0).toFixed(3),+((e==null?void 0:e.z)??0).toFixed(3)],城堡位:[+((t==null?void 0:t.x)??0).toFixed(3),+((t==null?void 0:t.z)??0).toFixed(3)],門樞位:this.門扇.map(o=>[+o.node.position.x.toFixed(3),+o.node.position.z.toFixed(3)]),城堡頂:+this.城堡頂.toFixed(3),血條Y:+(this.血條位.y??0).toFixed(3)}}}const zb=i=>1-(1-i)*(1-i);function Hb(i,e,t){const n=i.x-e.x,s=i.z-e.z,r=Math.hypot(n,s)||1;return{x:i.x+n/r*t,z:i.z+s/r*t}}function Ci(i){i.updateWorldMatrix(!0,!0);const t=new Gt().setFromObject(i).getCenter(new R);i.position.x-=t.x,i.position.z-=t.z}function Fr(i,e,t){i.traverse(n=>{const s=n;if(!s.isMesh)return;const o=(Array.isArray(s.material)?s.material:[s.material]).map(a=>{const l=a;if(!/^(stone|stoneDark|wood|woodDark)$/.test(l.name))return l;const c=l.clone();return c.color.setHex(/Dark$/.test(l.name)?t:e),ke.enableShadows&&(s.castShadow=!0),c});s.material=Array.isArray(s.material)?o:o[0]})}function Gb(i,e,t){i.traverse(n=>{const s=n;if(!s.isMesh)return;const o=(Array.isArray(s.material)?s.material:[s.material]).map(a=>{const l=a;if(!/^roofRed/.test(l.name))return l;const c=l.clone();return c.color.setHex(l.name==="roofRedLight"?t:e),c});s.material=Array.isArray(s.material)?o:o[0]})}const lt=_b();let C,gn=null,Ct=null,cn=lt.prefs.difficulty,xn=Qo();const zn=document.getElementById("game-canvas"),Hn=new Pv({canvas:zn,antialias:!ke.isMobile,powerPreference:"high-performance"});Hn.setPixelRatio(ke.pixelRatio),Hn.setSize(window.innerWidth,window.innerHeight),ke.enableShadows&&(Hn.shadowMap.enabled=!0,Hn.shadowMap.type=fa),Hn.toneMapping=ke.isMobile?Kc:Zc,Hn.toneMappingExposure=ke.isMobile?1:1.28;const Kt=new Wy,Zt=new jy,dn=Zt.cam,ea=$y(Kt.scene),Pi=new rf(Kt.scene),of=sc()[0],af=et(Q.goalCell[0],Q.goalCell[1]),Vb=Promise.all([Kt.buildGround(),Rh([...rf.清單(),...Oy(),...ky()])]).then(()=>{Pi.build(),Qy()}),un=new Ky(Kt.scene),Wb=new ob(Kt.scene),Gn=new ab(Kt.scene),Xb=new lb(Kt.scene),Pt=new cb(Kt.scene);let $i=null;ke.enablePostProcessing&&($i=new xb(Hn,Kt.scene,dn));let wc=-1;const lf=new se;function Yb(i){if(i===wc)return;wc=i;const e=Math.max(1,i+1),t=Ar(e),n=Ei.findIndex(h=>h.id===t.id),s=Ei[Math.min(n+1,Ei.length-1)],r=O_(e),o=ro.smoothstep(r,.45,1),a=t.tint[0]+(s.tint[0]-t.tint[0])*o,l=t.tint[1]+(s.tint[1]-t.tint[1])*o,c=t.tint[2]+(s.tint[2]-t.tint[2])*o;$i&&$i.setTint(a,l,c);const d=new se(t.fog),u=new se(s.fog);lf.copy(d).lerp(u,o),Kt.scene.fog&&"color"in Kt.scene.fog&&Kt.scene.fog.color.copy(lf)}C=Er(cn),C.speedMultiplier=lt.prefs.speedMultiplier;function Ws(){Jo(C)&&(xn=Qo())}ze.on("streakBonus",i=>_M(i.streak)),ze.on("milestone",i=>{bM(i.wave),i.wave!==99&&i.wave>0&&i.wave%25===0&&PM(i.wave)}),ze.on("towerBuilt",i=>{const e=et(i.col,i.row);Gn.addBuildEffect(e.x,e.z),un.sync(C),In(),Ws()}),ze.on("towerUpgraded",i=>{un.removeTower(i.towerId),un.sync(C),In(),Ct&&Ct.id===i.towerId&&Af(Ct),Ws()}),ze.on("towerSold",i=>{Gn.addSellEffect(i.worldX,i.worldZ),C.floatingTexts.push({id:C.nextId++,worldX:i.worldX,worldZ:i.worldZ,value:`+${i.refund}g`,color:"#ffd700",life:1.5,maxLife:1.5}),un.removeTower(i.towerId),un.sync(C),In(),Ct&&Ct.id===i.towerId&&ts(),Ws()}),ze.on("waveCleared",()=>{queueMicrotask(Ws)}),ze.on("enemyKilled",i=>{const e=C.enemies.find(n=>n.id===i.enemyId),t=(e==null?void 0:e.type)==="boss"?16751181:(e==null?void 0:e.type)==="shield"?7132159:(e==null?void 0:e.type)==="healer"?16751568:16748377;Gn.addDeathEffect(i.worldX,i.worldZ,t),(e==null?void 0:e.type)==="boss"&&Zt.shake(.55)}),ze.on("milestone",()=>Zt.shake(.35)),ze.on("streakBonus",i=>{i.streak>=10&&Zt.shake(.25)}),ze.on("towerFired",i=>{Gn.addMuzzleFlash(i.worldX,i.worldZ,i.towerType)}),ze.on("aoeImpact",i=>{Gn.addImpactFlash(i.worldX,i.worldZ,i.radius,i.towerType)}),ze.on("enemySpawned",()=>{Pi.開門(),Gn.addBuildEffect(of.x,of.z)}),ze.on("bossSpawned",()=>{Zt.shake(.6),yM(),Ot.playBossRoar()}),ze.on("enemyReachedGoal",()=>{Zt.shake(.32),Gn.addDeathEffect(af.x,af.z,16735306),In()}),ze.on("streakBonus",i=>{i.streak>=10?Ot.playMegaStingerHit():Ot.playStreakStinger()}),ze.on("gameOver",i=>{i.won?Ot.playVictory():Ot.playDefeat()});const qb=document.getElementById("gold-val"),jb=document.getElementById("lives-val"),cf=document.getElementById("wave-val"),$b=document.getElementById("kills-val"),Or=document.getElementById("hud-wave"),Kb=document.getElementById("chapter-act"),Zb=document.getElementById("chapter-name"),Tc=document.getElementById("wave-remain"),Ec=document.getElementById("wave-progress-fill"),Ac=document.getElementById("skip-prep-btn"),Xs=document.getElementById("pause-btn"),Rc=document.getElementById("speed-btn"),kr=document.getElementById("sound-btn"),Cc=document.getElementById("enemy-panel"),Jb=document.getElementById("enemy-name"),Qb=document.getElementById("enemy-hp"),eM=document.getElementById("enemy-spd"),tM=document.getElementById("enemy-armor"),Ii=document.getElementById("wave-banner"),Br=document.getElementById("wave-banner-text"),Pc=document.getElementById("milestone-banner"),ta=document.getElementById("milestone-banner-text"),Ys=document.getElementById("boss-cinematic"),Ic=document.getElementById("next-wave-preview"),nM=document.getElementById("preview-icons");let na=-2;const zr=document.getElementById("wave-modifier"),iM=document.getElementById("mod-emoji"),sM=document.getElementById("mod-label"),rM=document.getElementById("mod-desc");let Lc="__init__";function oM(){const i=C.waveModifier;if(i===Lc)return;if(Lc=i,!i||!Xo[i]){zr.classList.add("hidden");return}const e=Xo[i];iM.textContent=e.emoji,sM.textContent=e.label,rM.textContent=e.desc,zr.classList.remove("hidden"),zr.style.animation="none",zr.offsetWidth,zr.style.animation=""}function aM(){if(C.phase!=="prep"){Ic.classList.add("hidden"),na=-2;return}const i=Xt.waves[C.currentWave];if(!i){Ic.classList.add("hidden");return}if(na===C.currentWave)return;na=C.currentWave;const e={};for(const n of i.groups)e[n.type]=(e[n.type]||0)+n.count;const t=Object.entries(e).map(([n,s])=>`<span class="preview-chip"><span class="ico">${Mf[n]||"❓"}</span><span class="cnt">×${s}</span></span>`).join("");nM.innerHTML=t,Ic.classList.remove("hidden")}ze.on("towerBuilt",()=>Ot.playBuild()),ze.on("towerSold",()=>Ot.playSell()),ze.on("enemyKilled",()=>Ot.playHit());const Dc=document.getElementById("floating-text-layer"),df=document.getElementById("help-btn"),Ki=document.getElementById("help-overlay"),uf=document.getElementById("help-close-btn"),lM=document.getElementById("start-screen"),hf=document.getElementById("start-btn"),Uc=document.getElementById("end-screen"),ff=document.getElementById("restart-btn"),pf=document.getElementById("end-title"),cM=document.getElementById("end-score"),mf=document.getElementById("end-rank"),gf=document.getElementById("tower-panel"),qs=document.getElementById("cancel-build-btn"),Zi=document.querySelectorAll(".build-btn[data-tower]"),Hr=document.getElementById("streak-banner"),ia=document.getElementById("pause-overlay"),dM=document.getElementById("pause-reason"),xf=document.getElementById("resume-btn"),Nc=document.getElementById("graphics-recovery"),vf=document.getElementById("graphics-reload-btn"),uM=document.getElementById("graphics-home-btn"),hM=document.getElementById("continue-run"),_f=document.getElementById("continue-summary"),fM=document.getElementById("continue-btn"),yf=["graphics-recovery","buff-modal","achievements-modal","help-overlay","pause-overlay","end-screen","start-screen"],sa=new Map;function Fc(){for(const i of yf){const e=document.getElementById(i);if(e&&!e.classList.contains("hidden"))return e}return null}function bf(i){return Array.from(i.querySelectorAll('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')).filter(e=>!e.closest(".hidden")&&getComputedStyle(e).display!=="none")}function js(i){const e=Fc();for(const n of Array.from(document.body.children))!(n instanceof HTMLElement)||n.tagName==="SCRIPT"||(n.inert=!!e&&n!==e);for(const n of yf){const s=document.getElementById(n);s&&s.setAttribute("aria-hidden",String(s!==e))}if(!e)return;const t=i&&e.contains(i)?i:bf(e)[0];t==null||t.focus({preventScroll:!0})}function Gr(i,e,t){sa.set(i,e),i.classList.remove("hidden"),js(t)}function Vr(i,e=!0){const t=sa.get(i)??null;sa.delete(i),i.classList.add("hidden"),js(),e&&t&&!t.inert&&t.offsetParent!==null&&t.focus({preventScroll:!0})}const _t=new Set;function Ji(i=!1){const e=C.phase==="prep"||C.phase==="wave";C.paused=e&&_t.size>0,Xs.textContent=C.paused?"▶":"⏸",Xs.classList.toggle("active",C.paused),Xs.setAttribute("aria-label",C.paused?"Resume defense":"Pause defense"),Xs.title=C.paused?"Resume defense":"Pause defense";const t=C.paused&&(_t.has("manual")||_t.has("background"))&&!_t.has("help")&&!_t.has("buff")&&!_t.has("graphics");dM.textContent=_t.has("background")?"Defense paused because this tab moved to the background. Resume when you are ready.":"Defense paused. Your current wave is safe.",ia.classList.toggle("hidden",!t),js(t&&i?xf:void 0)}function Wr(i,e=!1){_t.add(i),Ji(e)}function ra(){_t.delete("manual"),_t.delete("background"),Ji(),Fc()||Xs.focus({preventScroll:!0})}function pM(i){const e=Fc();if(!e)return!1;if(i.key==="Tab"){const t=bf(e);if(!t.length)return i.preventDefault(),!0;const n=t[0],s=t[t.length-1];return e.contains(document.activeElement)?i.shiftKey&&document.activeElement===n?(i.preventDefault(),s.focus()):!i.shiftKey&&document.activeElement===s&&(i.preventDefault(),n.focus()):(i.preventDefault(),n.focus()),!0}return i.key==="Escape"?(e===Ki?Wc():e.id==="achievements-modal"?Vc():e===ia&&ra(),i.preventDefault(),!0):(e===ia&&i.key.toLowerCase()==="p"&&(ra(),i.preventDefault()),!0)}const Vn=document.getElementById("tower-tooltip"),mM=Vn.querySelector(".tooltip-name"),gM=Vn.querySelector(".tooltip-type"),xM=Vn.querySelector(".tooltip-stats"),vM=Vn.querySelector(".tooltip-special"),Oc=Xt.waves.length,Mf={grunt:"🧟",tank:"🐢",runner:"💨",swarm:"🐝",shield:"🛡",healer:"💚",boss:"💀"};function In(){qb.textContent=String(C.gold),jb.textContent=String(C.lives),C.endlessMode&&C.currentWave>=Oc?cf.textContent=`${C.currentWave+1} ♾`:cf.textContent=`${Math.min(C.currentWave+1,Oc)}/${Oc}`,$b.textContent=String(C.totalKills);const i=Math.max(1,C.currentWave+1),e=Ar(i),t=Ei.findIndex(o=>o.id===e.id);Kb.textContent=`ACT ${["I","II","III","IV","V"][t]??t+1}`,Zb.textContent=e.title,Or.style.setProperty("--chapter-accent",`#${e.accent.toString(16).padStart(6,"0")}`),Or.title=`${e.subtitle} — ${e.tacticalFocus}`;const n=C.enemies.filter(o=>o.alive).length,s=C.waveEnemiesTotal||0;if(C.phase==="prep"){Or.classList.add("prep");const o=Xt.prepSec,a=Math.max(0,Math.min(1,1-C.prepTimer/o));Tc.textContent=`⏳ ${Math.max(0,Math.ceil(C.prepTimer))}s`,Ec.style.width=`${Math.round(a*100)}%`}else if(C.phase==="wave"&&s>0){Or.classList.remove("prep");const o=Math.max(0,C.waveEnemiesSpawned-n),a=Math.max(0,Math.min(1,o/s));Tc.textContent=`${n} / ${s}`,Ec.style.width=`${Math.round(a*100)}%`}else Or.classList.remove("prep"),Tc.textContent="—",Ec.style.width="0%";Ac.classList.toggle("hidden",C.phase!=="prep"),aM(),oM(),Zi.forEach(o=>{const a=o.getAttribute("data-tower"),l=sn[a].levels[0].buildCost,c=C.gold>=l;o.classList.toggle("disabled",!c)});let r=null;if(Pt.hoveredCol>=0&&C.phase==="wave"){const o=et(Pt.hoveredCol,Pt.hoveredRow);let a=1;for(const l of C.enemies){if(!l.alive)continue;const c=l.worldX-o.x,d=l.worldZ-o.z,u=c*c+d*d;u<a&&(a=u,r=l)}}if(r){const o=wr[r.type];Jb.textContent=o.name,Qb.textContent=`${Math.ceil(r.hp)}/${o.hp}`,eM.textContent=o.speed.toFixed(1),tM.textContent=String(o.armor),Cc.classList.remove("hidden")}else Cc.classList.add("hidden")}let $s=null;function Sf(i){if(!k_(i))return null;const e=Ar(i),t=Ei.findIndex(n=>n.id===e.id);return{text:`ACT ${["I","II","III","IV","V"][t]??t+1} · ${e.title}
${e.subtitle}`,accent:`#${e.accent.toString(16).padStart(6,"0")}`}}function kc(i){const e=Math.max(1,C.currentWave+1),t=Sf(e);Ii.classList.toggle("chapter-opening",!!t),t&&Ii.style.setProperty("--chapter-accent",t.accent),Br.textContent=(t==null?void 0:t.text)??i,Ii.classList.remove("hidden"),Br.style.animation="none",Br.offsetWidth,Br.style.animation="",$s&&clearTimeout($s),$s=window.setTimeout(()=>{Ii.classList.add("hidden")},2e3)}let Ks=null;function _M(i){const e=i>=10;Hr.textContent=e?`⚡ x${i} MEGA COMBO!`:`🔥 x${i} Kill Streak!`,Hr.className=e?"streak-mega":"streak-normal",Hr.classList.remove("hidden"),Ks&&clearTimeout(Ks),Ks=window.setTimeout(()=>{Hr.classList.add("hidden")},1800)}let Qi=null;function yM(){Qi&&clearTimeout(Qi),Ys.classList.remove("hidden"),Ys.style.animation="none",Ys.offsetWidth,Ys.style.animation="",Qi=window.setTimeout(()=>{Ys.classList.add("hidden"),Qi=null},2400)}let Zs=null;function bM(i){ta.textContent=`🏆 Milestone Wave ${i}! +500g!`,Pc.classList.remove("hidden"),ta.style.animation="none",ta.offsetWidth,ta.style.animation="",Zs&&clearTimeout(Zs),Zs=window.setTimeout(()=>{Pc.classList.add("hidden")},3500)}const MM=document.getElementById("achievement-toasts");function SM(i){const e=document.createElement("div");e.className="ach-toast",e.innerHTML=`<div class="ach-emoji">${i.emoji}</div><div class="ach-body"><div class="ach-kicker">Achievement Unlocked</div><div class="ach-name">${i.name}</div><div class="ach-desc">${i.desc}</div></div>`,MM.appendChild(e),setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},4400)}function Xr(i,e){const t={event:i,payload:e};for(const n of Mc)if(!lt.achievements.includes(n.id))try{n.check(C,t)&&bb(lt,n.id)&&SM(n)}catch{}}ze.on("enemyKilled",i=>Xr("enemyKilled",{enemyId:i.enemyId,bounty:i.bounty})),ze.on("streakBonus",i=>Xr("streakBonus",{streak:i.streak})),ze.on("waveCleared",i=>Xr("waveCleared",{wave:i.wave,perfect:i.perfect})),ze.on("milestone",i=>Xr("milestone",{wave:i.wave})),ze.on("gameOver",i=>Xr("gameOver",{won:i.won,score:i.score}));const wf=document.getElementById("hs-score"),Tf=document.getElementById("hs-sub");function oa(){const i=lt.highScores[cn];i?(wf.textContent=String(i.score),Tf.textContent=`Wave ${i.wave} · ${i.rank} · ${cn}`):(wf.textContent="—",Tf.textContent=`No record on ${cn}`),AM()}const wM=document.getElementById("lt-runs"),TM=document.getElementById("lt-kills"),EM=document.getElementById("lt-best-wave");function AM(){wM.textContent=String(lt.lifetime.runs),TM.textContent=String(lt.lifetime.totalKills),EM.textContent=String(lt.lifetime.highestWaveReached)}const Ef=[{id:"damage",emoji:"🗡",name:"Overcharge",desc:"+20% tower damage (stacks)",apply:()=>{C.buffDamageMult*=1.2}},{id:"range",emoji:"🎯",name:"Long Sight",desc:"+15% tower range (stacks)",apply:()=>{C.buffRangeMult*=1.15}},{id:"gold",emoji:"💰",name:"Gold Rush",desc:"+25% gold from kills (stacks)",apply:()=>{C.buffGoldMult*=1.25}},{id:"fortify",emoji:"❤",name:"Fortify",desc:"+5 lives and +5 max lives",apply:()=>{C.maxLives+=5,C.lives=Math.min(C.maxLives,C.lives+5)}},{id:"bounty",emoji:"🏦",name:"War Chest",desc:"Instant +300 gold",apply:()=>{C.gold+=300,C.stats.goldEarned+=300}}],Bc=document.getElementById("buff-modal"),zc=document.getElementById("buff-cards"),RM=document.getElementById("buff-wave");function CM(i){const e=z_(i),t=e.coreIds.map(s=>Ef.find(r=>r.id===s)).filter(Boolean),n=e.wildcardIds.map(s=>Ef.find(r=>r.id===s)).filter(Boolean);return B_(t,n,i)}function PM(i){if(C.buffChoicePending)return;C.buffChoicePending=!0,Wr("buff"),RM.textContent=String(i);const e=CM(i);zc.innerHTML="";for(const t of e){const n=document.createElement("button");n.className="buff-card",n.innerHTML=`<span class="card-emoji">${t.emoji}</span><span class="card-name">${t.name}</span><span class="card-desc">${t.desc}</span>`,n.addEventListener("click",()=>{t.apply(),C.floatingTexts.push({id:C.nextId++,worldX:0,worldZ:0,value:`${t.emoji} ${t.name}`,color:"#ffd486",life:2.5,maxLife:2.5}),IM()}),zc.appendChild(n)}Gr(Bc,null,zc.querySelector("button"))}function IM(){Vr(Bc,!1),C.buffChoicePending=!1,_t.delete("buff"),Ji(),Jo(C)}function LM(i,e){const t=new R(i,.6,e);return t.project(dn),{x:(t.x*.5+.5)*window.innerWidth,y:(-t.y*.5+.5)*window.innerHeight}}const es=new Map;function DM(i){for(let e=C.floatingTexts.length-1;e>=0;e--){const t=C.floatingTexts[e];if(t.life-=i,t.life<=0){const r=es.get(t.id);r&&(Dc.removeChild(r),es.delete(t.id)),C.floatingTexts.splice(e,1);continue}if(!es.has(t.id)){const r=document.createElement("div");r.className="floating-text",r.textContent=t.value,r.style.color=t.color,r.style.animationDuration=`${t.maxLife}s`,Dc.appendChild(r),es.set(t.id,r)}const n=es.get(t.id),s=LM(t.worldX,t.worldZ);n.style.left=`${s.x}px`,n.style.top=`${s.y}px`}}function Af(i){Ct=i;const e=sn[i.type],t=e.levels[i.level];document.getElementById("panel-tower-name").textContent=e.name,document.getElementById("panel-tower-level").textContent=`Lv.${i.level+1}`,document.getElementById("panel-dmg").textContent=String(t.damage),document.getElementById("panel-spd").textContent=`${t.cooldownSec}s`,document.getElementById("panel-rng").textContent=String(t.range);const n=document.getElementById("panel-special"),s=[];t.aoeRadius>0&&s.push(`AOE ${t.aoeRadius}`),t.slow&&s.push(`Slow ${Math.round(t.slow.pct*100)}%`),t.dot&&s.push(`DOT ${t.dot.dps}/s ${t.dot.durationSec}s`),t.chain&&s.push(`Chain ×${t.chain.targets}`),s.push(`🗡 ${i.kills}`),n.textContent=s.join(" | "),document.querySelectorAll(".target-btn").forEach(c=>{const d=c.getAttribute("data-mode");c.classList.toggle("active",i.targetingMode===d),c.onclick=()=>{i.targetingMode=d,document.querySelectorAll(".target-btn").forEach(u=>u.classList.toggle("active",u.getAttribute("data-mode")===d))}});const r=document.getElementById("upgrade-btn"),o=document.getElementById("evolve-container"),a=document.getElementById("sell-btn"),l=e.levels;if(o.classList.add("hidden"),o.innerHTML="",r.style.display="block",i.level>=l.length-1)if(e.evolutions&&e.evolutions.length>0){r.style.display="none",o.classList.remove("hidden");for(const c of e.evolutions){const d=document.createElement("button");d.className="action-btn evolve",d.innerHTML=`⭐ ${c.name} (<span class="evolve-cost">${c.cost}</span>g)<div style="font-size: 0.8em; margin-top: 2px;">${c.desc}</div>`,d.disabled=C.gold<c.cost,d.onclick=()=>{Ct&&_h(C,Ct.id,c.type)},o.appendChild(d)}}else r.disabled=!0,r.textContent="⬆ MAX";else{const c=l[i.level+1].upgradeCost;r.disabled=!Z_(C,i),r.innerHTML=`⬆ Upgrade (<span id="upgrade-cost">${c}</span>g)`}document.getElementById("sell-value").textContent=String(vh(i)),a.innerHTML=`💰 Sell (<span id="sell-value">${vh(i)}</span>g)`,gf.classList.remove("hidden"),un.showRange(i,t.range)}function ts(){Ct=null,gf.classList.add("hidden"),un.hideRange()}const UM=document.getElementById("end-best-badge");function Rf(){const i=C.phase==="won";sf(),xn=null,If(),_t.clear(),Ji(),pf.textContent=i?"🎉 Victory!":"💀 Defeat",pf.style.color=i?"#ffd700":"#ff5555",cM.textContent=`Score: ${C.score}`;let e="C";for(const s of Go.ranks)if(C.score>=s.min){e=s.name;break}mf.textContent=e,mf.className=`rank rank-${e}`;const t=C.endlessMode?C.currentWave+1:Math.min(C.currentWave+1,Xt.waves.length),n=yb(lt,C.difficulty,C.score,t,e);UM.classList.toggle("hidden",!n),Mb(lt,i,C.totalKills,C.currentWave,C.stats.towersBuilt,t),oa(),document.getElementById("stat-kills").textContent=C.totalKills.toString(),document.getElementById("stat-streak").textContent=C.stats.longestStreak.toString(),document.getElementById("stat-perfect").textContent=C.perfectWaves.toString(),document.getElementById("stat-built").textContent=C.stats.towersBuilt.toString(),document.getElementById("stat-gold").textContent=C.stats.goldEarned.toString(),document.getElementById("stat-dmg").textContent=Math.round(C.stats.totalDamageDealt).toString(),Gr(Uc,null,ff)}Zi.forEach(i=>{i.addEventListener("click",e=>{e.stopPropagation();const t=i.getAttribute("data-tower");C.gold<sn[t].levels[0].buildCost||(gn===t?(gn=null,i.classList.remove("selected"),qs.style.display="none",Pt.hideGhost()):(Zi.forEach(n=>n.classList.remove("selected")),gn=t,i.classList.add("selected"),qs.style.display="",ts()))}),i.addEventListener("mouseenter",()=>{const e=i.getAttribute("data-tower");if(!e||!sn[e])return;const t=sn[e],n=t.levels[0];mM.textContent=t.name+" Tower",gM.textContent="Type: "+t.damageType,xM.innerHTML=`
            <div><span>Damage:</span> <span>${n.damage}</span></div>
            <div><span>Speed:</span> <span>${n.cooldownSec}s</span></div>
            <div><span>Range:</span> <span>${n.range}</span></div>
            <div><span>DPS:</span> <span>${(n.damage/n.cooldownSec).toFixed(1)}</span></div>
        `;let s="";n.slow?s=`Slows by ${Math.round(n.slow.pct*100)}% for ${n.slow.durationSec}s`:n.dot?s=`DOT: ${n.dot.dps} dmg/s (${n.dot.durationSec}s)`:n.chain?s=`Chains to ${n.chain.targets} targets`:n.aoeRadius>0&&(s=`AOE Radius: ${n.aoeRadius}`),vM.textContent=s;const r=i.getBoundingClientRect();Vn.style.left=`${r.left+r.width/2}px`,Vn.style.transform="translate(-50%, calc(-100% - 10px))",Vn.style.top=`${r.top}px`,Vn.classList.remove("hidden")}),i.addEventListener("mouseleave",()=>{Vn.classList.add("hidden")})}),qs.addEventListener("click",i=>{i.stopPropagation(),gn=null,Zi.forEach(e=>e.classList.remove("selected")),qs.style.display="none",Pt.hideGhost()}),Rc.addEventListener("click",()=>{C.speedMultiplier=C.speedMultiplier===1?2:C.speedMultiplier===2?4:1,Rc.textContent=C.speedMultiplier+"×",lt.prefs.speedMultiplier=C.speedMultiplier,Ri(lt)}),kr.addEventListener("click",()=>{Ot.init();const i=Ot.toggle();kr.textContent=i?"🔊":"🔇",kr.style.opacity=i?"1":"0.5",lt.prefs.soundEnabled=i,Ri(lt)}),Xs.addEventListener("click",Cf);function Cf(){C.phase!=="wave"&&C.phase!=="prep"||(_t.has("manual")||_t.has("background")?ra():Wr("manual",!0))}window.addEventListener("keydown",i=>{if(pM(i)||C.phase==="idle"||C.phase==="won"||C.phase==="lost")return;const e=i.key.toLowerCase();if(e==="p"){(C.phase==="wave"||C.phase==="prep")&&Cf();return}if(e>="1"&&e<="7"){const t=Number(e)-1;t>=0&&t<Zi.length&&Zi[t].click()}e==="u"&&Ct&&document.getElementById("upgrade-btn").click(),e==="s"&&Ct&&document.getElementById("sell-btn").click(),e==="q"&&Yr(0),e==="w"&&Yr(1),e==="e"&&Yr(2),i.key==="Escape"&&(gn?qs.click():Ct&&document.getElementById("panel-close-btn").click())});const Pf=document.querySelectorAll(".skill-btn");Pf.forEach(i=>{i.addEventListener("click",()=>{const e=parseInt(i.getAttribute("data-skill")||"0",10);Yr(e)})});function Yr(i){if(C.phase!=="wave"&&C.phase!=="prep")return;const e=C.skills[i];if(!e||e.remaining>0)return;const t=C.enemies.some(n=>n.alive&&!n.reached);if(!((i===0||i===1)&&!t)&&!(i===2&&C.lives>=C.maxLives)){if(i===0)for(const n of C.enemies)n.alive&&!n.reached&&Rr(C,n,200,"ability");else if(i===1)for(const n of C.enemies)n.alive&&(n.slow={pct:1,remaining:5});else i===2&&(C.lives=Math.min(C.maxLives,C.lives+5),In());e.remaining=e.cooldown,ze.emit({type:"skillUsed",skill:e.name}),aa()}}function aa(){Pf.forEach(i=>{const e=parseInt(i.getAttribute("data-skill")||"0",10),t=C.skills[e],n=i.querySelector(".skill-cd");t&&t.remaining>0?(i.classList.add("on-cooldown"),n.classList.remove("hidden"),n.textContent=Math.ceil(t.remaining)+"s"):(i.classList.remove("on-cooldown"),n.classList.add("hidden"))})}Ac.addEventListener("click",()=>{C.phase==="prep"&&(C.gold+=50,C.stats.goldEarned+=50,C.floatingTexts.push({id:C.nextId++,worldX:0,worldZ:0,value:"⏩ +50g Skip",color:"#aaff55",life:1.6,maxLife:1.6}),C.prepTimer=0,Ac.classList.add("hidden"),In())}),document.getElementById("upgrade-btn").addEventListener("click",()=>{Ct&&xh(C,Ct.id)}),document.getElementById("sell-btn").addEventListener("click",()=>{Ct&&K_(C,Ct.id)}),document.getElementById("panel-close-btn").addEventListener("click",()=>{ts()});function If(){if(hM.classList.toggle("hidden",!xn),!xn){_f.textContent="";return}const i=xn.difficulty[0].toUpperCase()+xn.difficulty.slice(1);_f.textContent=`Wave ${xn.currentWave+1} · ${i} · ${xn.gold}g · ${xn.towers.length} towers`}async function Lf(i,e){await Vb,lM.classList.add("hidden"),C=i,cn=C.difficulty,Hf(),Ot.init(),Ot.startMusic(),ac(C),e&&(C.waveModifier=e.waveModifier),un.sync(C),In(),aa(),Jo(C),xn=Qo(),kc(`Wave ${C.currentWave+1}`),js()}hf.addEventListener("click",async()=>{sf();const i=Er(cn);i.speedMultiplier=lt.prefs.speedMultiplier,i.endlessMode=lt.prefs.endlessMode,await Lf(i,null)}),fM.addEventListener("click",async()=>{const i=xn;if(!i)return;const e=Fb(i,lt.prefs.speedMultiplier);await Lf(e,i)});const Hc=document.querySelectorAll(".diff-btn"),Df=document.getElementById("diff-desc"),Uf={easy:"Easy difficulty — 600g, 30 lives, 25% weaker enemies",normal:"Standard difficulty — 400g, 20 lives",hard:"Hard difficulty — 250g, 10 lives, 40% tougher enemies & slightly faster"};Hc.forEach(i=>{i.addEventListener("click",()=>{Hc.forEach(e=>e.classList.remove("active")),i.classList.add("active"),cn=i.getAttribute("data-diff"),Df.textContent=Uf[cn],lt.prefs.difficulty=cn,Ri(lt),C=Er(cn),C.speedMultiplier=lt.prefs.speedMultiplier,In(),oa()})});const Gc=document.getElementById("endless-toggle");Gc.addEventListener("change",()=>{lt.prefs.endlessMode=Gc.checked,Ri(lt)}),(function(){Hc.forEach(e=>{e.classList.toggle("active",e.getAttribute("data-diff")===cn)}),Df.textContent=Uf[cn],Rc.textContent=C.speedMultiplier+"×",lt.prefs.soundEnabled||(Ot.toggle(),kr.textContent="🔇",kr.style.opacity="0.5"),Gc.checked=lt.prefs.endlessMode,oa(),If()})();const la=document.getElementById("achievements-modal"),Nf=document.getElementById("ach-grid"),NM=document.getElementById("ach-count");function Ff(){Nf.innerHTML="";let i=0;for(const e of Mc){const t=lt.achievements.includes(e.id);t&&i++;const n=document.createElement("div");n.className=`ach-row ${t?"unlocked":"locked"}`,n.innerHTML=`<div class="row-emoji">${t?e.emoji:"🔒"}</div><div class="row-body"><div class="row-name">${e.name}</div><div class="row-desc">${e.desc}</div></div>`,Nf.appendChild(n)}NM.textContent=`${i}/${Mc.length}`}document.getElementById("achievements-btn").addEventListener("click",()=>{Ff(),Gr(la,document.getElementById("achievements-btn"),document.getElementById("ach-close-btn"))});function Vc(){Vr(la)}document.getElementById("ach-close-btn").addEventListener("click",Vc),la.addEventListener("click",i=>{i.target.classList.contains("ach-backdrop")&&Vc()});const Li=document.getElementById("ach-reset-btn");let ca=!1,Js=null;Li.addEventListener("click",()=>{if(!ca){ca=!0,Li.classList.add("confirming"),Li.textContent="⚠ Click again to confirm reset",Js&&clearTimeout(Js),Js=window.setTimeout(()=>{ca=!1,Li.classList.remove("confirming"),Li.textContent="⟲ Reset Progress"},4e3);return}Sb(lt),ca=!1,Js&&(clearTimeout(Js),Js=null),Li.classList.remove("confirming"),Li.textContent="✓ Reset",setTimeout(()=>{Li.textContent="⟲ Reset Progress"},1400),Ff(),oa()}),ji(document.getElementById("hud"),"hud"),ji(document.getElementById("skill-bar"),"skillBar"),ji(document.getElementById("build-menu"),"buildMenu"),ji(document.getElementById("next-wave-preview"),"nextWavePreview"),ji(document.getElementById("tower-panel"),"towerPanel"),ji(document.getElementById("enemy-panel"),"enemyPanel"),ji(document.getElementById("wave-modifier"),"waveModifier"),document.getElementById("reset-layout-btn").addEventListener("click",()=>{Cb(),C.floatingTexts.push({id:C.nextId++,worldX:0,worldZ:0,value:"🔁 介面位置已重設",color:"#9be8ff",life:1.6,maxLife:1.6})}),df.addEventListener("click",()=>{Ki.classList.contains("hidden")&&(Gr(Ki,df,uf),Wr("help"))});function Wc(){const i=!_t.has("background")&&!_t.has("manual");_t.delete("help"),Vr(Ki,i),Ji(_t.has("background")||_t.has("manual"))}uf.addEventListener("click",Wc),Ki.addEventListener("click",i=>{i.target===Ki&&Wc()}),ff.addEventListener("click",()=>{Vr(Uc,!1),C=Er(cn),C.speedMultiplier=lt.prefs.speedMultiplier,C.endlessMode=lt.prefs.endlessMode,Hf(),un.sync(C),In(),aa(),ts(),ac(C),Jo(C),xn=Qo(),kc("Wave 1"),js()}),document.getElementById("home-btn").addEventListener("click",()=>{window.location.href="../../../index.html"}),zn.addEventListener("click",i=>{if(Zt.twoFingerActive||C.phase==="idle"||C.phase==="won"||C.phase==="lost")return;Pt.updateMouse(i,dn);const e=Pt.hoveredCol,t=Pt.hoveredRow;if(e<0||t<0)return;const n=C.towers.find(s=>s.col===e&&s.row===t);n?Af(n):gn?gh(C,gn,e,t):ts()}),zn.addEventListener("mousemove",i=>{Pt.updateMouse(i,dn),Of()}),zn.addEventListener("touchmove",i=>{i.touches.length===1&&!Zt.twoFingerActive&&(Pt.updateMouse(i,dn),Of())},{passive:!0});function Of(){if(!gn||Pt.hoveredCol<0){Pt.hideGhost();return}const i=mh(C,Pt.hoveredCol,Pt.hoveredRow)&&C.gold>=sn[gn].levels[0].buildCost,e=sn[gn].levels[0].range;Pt.showGhost(Pt.hoveredCol,Pt.hoveredRow,i,gn,e)}zn.addEventListener("wheel",i=>{i.preventDefault(),Zt.zoom(i.deltaY)},{passive:!1}),zn.addEventListener("touchstart",Zt.onTouchStart,{passive:!0}),zn.addEventListener("touchmove",Zt.onTouchMove,{passive:!1}),zn.addEventListener("touchend",Zt.onTouchEnd,{passive:!0}),window.addEventListener("resize",()=>{Zt.resize(Hn),$i&&$i.resize(window.innerWidth,window.innerHeight)});function kf(){C.phase!=="prep"&&C.phase!=="wave"||(Ws(),Wr("background",!0))}document.addEventListener("visibilitychange",()=>{document.hidden&&kf()}),window.addEventListener("blur",kf),zn.addEventListener("webglcontextlost",i=>{i.preventDefault(),Ws(),Wr("graphics"),Gr(Nc,null,vf)}),zn.addEventListener("webglcontextrestored",()=>{Vr(Nc,!1),_t.delete("graphics"),_t.add("manual"),Ji(!0)}),vf.addEventListener("click",()=>window.location.reload()),uM.addEventListener("click",()=>{window.location.href="../../../index.html"}),xf.addEventListener("click",ra),js(hf);let Bf=0,Qs=0,Xc=-1,ns=null,zf=0;function Hf(){var i;Qs=0,Xc=-1,wc=-1,na=-2,Lc="__init__",ns=null,_t.clear(),C.paused=!1,gn=null,Zi.forEach(e=>e.classList.remove("selected")),qs.style.display="none",Pt.hideGhost(),ts(),Cc.classList.add("hidden"),Vn.classList.add("hidden");for(const e of es.values())e.remove();es.clear(),Dc.replaceChildren(),(i=document.getElementById("achievement-toasts"))==null||i.replaceChildren(),Ki.classList.add("hidden"),la.classList.add("hidden"),Bc.classList.add("hidden"),ia.classList.add("hidden"),Nc.classList.add("hidden"),sa.clear(),$s&&(clearTimeout($s),$s=null),Ks&&(clearTimeout(Ks),Ks=null),Zs&&(clearTimeout(Zs),Zs=null),Qi&&(clearTimeout(Qi),Qi=null),Ii.classList.add("hidden"),Hr.classList.add("hidden"),Pc.classList.add("hidden"),Ys.classList.add("hidden"),Ji()}function da(){$i?$i.render():Hn.render(Kt.scene,dn)}function Gf(i){var o,a;requestAnimationFrame(Gf);const e=Math.min((i-Bf)/1e3,.1);Bf=i;const t=i*.001;if(C.phase==="idle"){ea.update(t),Pi.update(e,C.lives,C.maxLives,dn),da();return}if(C.phase==="won"||C.phase==="lost"){Uc.classList.contains("hidden")&&Rf(),ns!=="off"&&(Ot.setMusicPhase("off"),ns="off"),ea.update(t),Pi.update(e,C.lives,C.maxLives,dn),da();return}if(C.paused){ea.update(t),Pi.update(e,C.lives,C.maxLives,dn),da();return}const n=e*C.speedMultiplier;Qs+=n;const s=5;Qs>Bn*s&&(Qs=Bn*s);const r=new Map;for(const l of C.projectiles)r.set(l.id,{id:l.id,targetX:l.targetX,targetZ:l.targetZ,towerType:l.towerType});for(;Qs>=Bn;){sh(C,Bn),ch(C,Bn),uh(C,Bn),hh(C,Bn),Qs-=Bn;const l=C.phase;if(l==="won"||l==="lost"){Rf();break}}if(C.phase==="wave"||C.phase==="prep"){for(const l of C.skills)l.remaining>0&&(l.remaining=Math.max(0,l.remaining-e));aa()}if(C.phase==="prep"&&ns!=="prep"?(Ot.setMusicPhase("prep"),ns="prep"):C.phase==="wave"&&ns!=="wave"&&(Ot.setMusicPhase("wave"),ns="wave"),C.currentWave!==Xc&&C.phase==="wave"&&(Xc=C.currentWave,kc(`Wave ${C.currentWave+1}`)),C.phase==="prep"){const l=Math.ceil(C.prepTimer),c=Xt.waves[oc(C)],d=((o=c==null?void 0:c.groups)==null?void 0:o.reduce((x,m)=>x+m.count,0))??"?",u=((a=c==null?void 0:c.groups)==null?void 0:a.map(x=>`${Mf[x.type]??"?"}×${x.count}`).join(" "))??"",h=C.currentWave+1,f=`Wave ${h} — ${d} enemies | ${u} | Next in ${l}s`,g=Sf(h);Ii.classList.toggle("chapter-opening",!!g),g&&Ii.style.setProperty("--chapter-accent",g.accent),Br.textContent=g?`${g.text}
${f}`:f,Ii.classList.remove("hidden")}for(const[l,c]of r.entries())C.projectiles.find(d=>d.id===l)||Gn.addExplosion(c.targetX,c.targetZ,c.towerType);un.animate(e,C),Wb.sync(C,0,dn),Gn.setCamera(dn),Gn.sync(C,n),Xb.sync(C,n),DM(e),ea.update(t),Pi.update(e,C.lives,C.maxLives,dn),Zt.tickShake(e),Yb(C.currentWave),ke.isMobile?++zf>=4&&(zf=0,In()):In(),Ct&&(C.towers.find(c=>c.id===Ct.id)||ts()),da()}window.__TD={get state(){return C},LOGIC_DT:Bn,量模型:By,門狀態(){return Pi.狀態()},設曲率(i,e){T_(i,e)},塔尺(i){return un.measure(i)},塔同步(){un.sync(C),un.animate(.6,C)},地圖:{spawn:et(Q.spawnCell[0],Q.spawnCell[1]),goal:et(Q.goalCell[0],Q.goalCell[1])},開門(){Pi.開門()},scene:Kt.scene,camera:dn,renderer:Hn,tick(i=1,e=Bn){for(let t=0;t<i;t+=1)sh(C,e),ch(C,e),uh(C,e),hh(C,e)},擂台(i=99999){return C.phase="wave",C.paused=!1,C.enemies=[],C.projectiles=[],C.towers=[],C.spawnCounts=C.spawnCounts.map(()=>0),C.waveEnemiesSpawned=C.waveEnemiesTotal,C.gold=i,C.lives=999,{phase:C.phase,gold:C.gold}},build(i,e,t){return gh(C,i,e,t)},upgrade(i){return xh(C,i)},進化(i,e){return _h(C,i,e)},用技能(i){var t,n;const e=((t=C.skills[i])==null?void 0:t.remaining)??-1;return Yr(i),{before:e,remaining:((n=C.skills[i])==null?void 0:n.remaining)??-1}},spawn(i,e=0){rh(C,i);const t=C.enemies[C.enemies.length-1];if(e>0){const[n,s]=Q.path[Math.min(e,Q.path.length-1)],r=et(n,s);let o=0,a=Number.POSITIVE_INFINITY;for(let c=0;c<C.pathWorld.length;c++){const d=C.pathWorld[c].x-r.x,u=C.pathWorld[c].z-r.z,h=d*d+u*u;h<a&&(a=h,o=c)}const l=C.pathWorld[o];t.pathIndex=o,t.pathProgress=0,t.worldX=l.x,t.worldZ=l.z,t.prevWorldX=l.x,t.prevWorldZ=l.z}return{id:t.id,hp:t.hp,maxHp:t.maxHp,armor:t.armor,shield:t.shield,x:t.worldX,z:t.worldZ}},敵(i){const e=C.enemies.find(t=>t.id===i);return e?{hp:e.hp,alive:e.alive,shield:e.shield,dots:e.dots.length,slow:e.slow}:null}},requestAnimationFrame(Gf)})();
