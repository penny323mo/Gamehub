// Olden Ring — on-screen controls for phones and tablets.
//
//   left third : floating stick (appears where the thumb lands) → the same move axis as WASD
//   right side : 攻 attack (hold for the combo), 蓄 charge, 閃 dodge, 躍 jump, 龍 ember dragon
//   free drag  : anywhere else on the right half orbits the camera (Q/E)
//
// Every control feeds input.virtual, which latches exactly like a key, so the fixed-step sim sees one input model.
// Shown only on coarse pointers (or after the first touch), never on desktop.
const BUTTONS = [
  ['attack', '攻', 'ATK', 'tb-atk'],
  ['charge', '蓄', 'CHG', 'tb-chg'],
  ['dodge', '閃', 'DGE', 'tb-dge'],
  ['jump', '躍', 'JMP', 'tb-jmp'],
  ['musou', '龍', 'RITE', 'tb-mu'],
];

// setPointerCapture throws when the pointer is already gone (fast taps, OS gestures, synthetic events) — never
// let that swallow the input itself.
const capture = (el, id) => { try { el.setPointerCapture(id); } catch { /* pointer already released */ } };

export function createTouch(root, input, game) {
  const el = document.createElement('div');
  el.id = 'touch'; el.dataset.touch = ''; el.hidden = true;
  el.innerHTML = `<div class="t-stick" data-touch><i class="t-base"></i><i class="t-knob"></i></div>
    <div class="t-look" data-touch></div>
    ${BUTTONS.map(([a, zh, en, cls]) => `<button type="button" class="t-btn ${cls}" data-act="${a}" aria-label="${en}">${zh}<small>${en}</small></button>`).join('')}`;
  root.append(el);

  const stick = el.querySelector('.t-stick'), base = el.querySelector('.t-base'), knob = el.querySelector('.t-knob');
  const look = el.querySelector('.t-look');
  const R = () => Math.max(38, Math.min(innerWidth, innerHeight) * 0.13);
  let sid = null, ox = 0, oy = 0;

  stick.addEventListener('pointerdown', (e) => {
    e.preventDefault(); sid = e.pointerId; ox = e.clientX; oy = e.clientY;
    capture(stick, e.pointerId);
    base.style.transform = knob.style.transform = `translate(${ox}px, ${oy}px)`;
    stick.classList.add('on');
  });
  stick.addEventListener('pointermove', (e) => {
    if (e.pointerId !== sid) return;
    const r = R(); let dx = e.clientX - ox, dy = e.clientY - oy;
    const l = Math.hypot(dx, dy); if (l > r) { dx *= r / l; dy *= r / l; }
    knob.style.transform = `translate(${ox + dx}px, ${oy + dy}px)`;
    const k = Math.min(1, l / r) < 0.18 ? 0 : 1;              // small dead zone
    input.virtual.stick((dx / r) * k, (-dy / r) * k);
  });
  const endStick = (e) => { if (e.pointerId !== sid) return; sid = null; input.virtual.stick(0, 0); stick.classList.remove('on'); };
  stick.addEventListener('pointerup', endStick); stick.addEventListener('pointercancel', endStick);

  let lid = null, lx = 0;
  look.addEventListener('pointerdown', (e) => { lid = e.pointerId; lx = e.clientX; capture(look, e.pointerId); });
  look.addEventListener('pointermove', (e) => { if (e.pointerId === lid) { input.virtual.orbit((e.clientX - lx) * 1.4); lx = e.clientX; } });
  const endLook = (e) => { if (e.pointerId === lid) lid = null; };
  look.addEventListener('pointerup', endLook); look.addEventListener('pointercancel', endLook);

  el.querySelectorAll('.t-btn').forEach((b) => {
    const a = b.dataset.act;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); capture(b, e.pointerId); b.classList.add('on'); input.virtual.down(a); navigator.vibrate?.(8); });
    const up = () => { b.classList.remove('on'); input.virtual.up(a); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  const show = () => { el.hidden = false; document.body.classList.add('touch'); game.touchMode = true; };
  if (matchMedia('(pointer: coarse)').matches) show();
  addEventListener('touchstart', show, { once: true, passive: true });
  addEventListener('blur', () => input.virtual.clear());

  const mu = el.querySelector('.tb-mu');
  return {
    /** gauge-ready glow on the dragon button (render-side, reads sim state only) */
    update() { mu.classList.toggle('ready', !!(game.musou && game.musou.ready())); },
  };
}
