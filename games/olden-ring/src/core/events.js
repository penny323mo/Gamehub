// Synchronous event bus — the seam between parts.
// Sim-side emitters (hero/combat/crowd/musou) fire during sim.step(); render-side subscribers
// (vfx/audio/hud/camera shake) must NOT mutate sim state. Payload objects may be reused by the emitter — copy what
// you keep.
//
// Catalogue (emitter → payload fields):
//  scenario      main     {name}                                        after a scenario reset
//  attack:start  combo    {move, x,y,z, yaw, charge, tell}              a move begins (charge: C1–C6/jump charge;
//                                                                        tell: frames until its first active frame)
//  attack:swing  combat   {move, win, x,y,z, yaw, heavy}                a hitbox window opens (whoosh)
//  hit           combat   {i, x,y,z, dx,dz, dmg, kb, move, combo, killed, officer, heavy}   one enemy hit
//  hits          combat   {count, x,y,z, move, hitstop, heavy, kos}     aggregate of one hitbox tick (emitted after its `hit`s);
//                                                                         hitstop = hero freeze actually applied (scaled by count)
//  ko            combat   {i, x,y,z, dx,dz, type, total, officer}       enemy KO'd (counted on the killing hit)
//  enemy:attack  combat   {i, x,y,z, officer, feint}                    an enemy strike reaches its active frame (crowd emits
//                                                                        it with feint: 1 for a blow that stops short, r4)
//  enemy:land    combat   {i, x,y,z, bounce, v}                         launched enemy touches down (bounce or lands); v = impact m/s
//  dodge         loco     {x,y,z, dx,dz}
//  jump          loco     {x,y,z}          land {x,y,z, hard}
//  footstep      loco     {x,y,z, foot, speed, kick?}                   a foot plants in the run (≥2.5 m/s) / out of a dodge roll
//                                                                       / the dash lunge landing (kick: 1 = a hard plant: dust burst)
//  hero:hurt     hero     {dmg, hp, x,y,z, armored}
//  musou:ready   musou    {}               a Musou became available: ≥ 1 of the 3 gauge segments full (edge; r3: one Musou spends one segment)
//  musou:start   musou    {x,y,z, yaw, frame, dur, activation, burstAt, contact, pushed}   dur/activation/burstAt/contact in
//                                                                       musou frames (end, close-up cut, finisher, first mass hit)
//  musou:hit     musou    {count, x,y,z, stage, yaw, n}                 one hit tick; stage 'contact' (first mass hit, 2.2 s)
//                                                                       | 'front' (contact shock front rolling through the crowd)
//                                                                       | 'dragon' (at the dragon head) | 'rush' | 'wave' (on the ring)
//  musou:burst   musou    {count, x,y,z, frame}                         finisher: the ring wave starts at Zhao Yun
//  musou:end     musou    {frame}
//  crowd:wave    crowd    {count, x,z}                                  reinforcements spawned
const subs = new Map();

export function on(name, fn) {
  let a = subs.get(name);
  if (!a) subs.set(name, (a = []));
  a.push(fn);
  return () => off(name, fn);
}

export function off(name, fn) {
  const a = subs.get(name);
  const i = a ? a.indexOf(fn) : -1;
  if (i >= 0) a.splice(i, 1);
}

export function emit(name, payload) {
  const a = subs.get(name);
  if (a) for (let i = 0; i < a.length; i++) a[i](payload);
}
