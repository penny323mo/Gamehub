// Hit readability on the soldiers (render-only), in two layers:
// 1. Victim flash, a per-instance "aHit" term patched into the crowd material. The contact frame pops white-hot
//    silhouette edges over a lifted body for 1 sim frame (local: a band of 10 struck soldiers must not merge into one
//    white blob). Then a warm wash is blended into the lit albedo (≤ 0.22, so the soldiers stay dark), with a bright
//    emissive rim on the faces that turn away from the camera (the silhouette edges). It decays quadratically over
//    ≈ 10 sf: gold on a hit, deep amber on a heavy hit, red on the killing blow
//    (the DW8 yellow / red-pink wash). Weapons stay untinted (crowd/view.js zeroes the glow for them). Red tints also
//    glow flat and KO'd bodies keep a red ember while airborne, so the blow-away fans read over a dark crowd. The hero
//    stays the lightest large mass (hero luma ≈ 1.3-1.6× the tinted soldiers in combo-normal).
// 2. Recoil pose (recoilPose): the DW flinch. A struck soldier snaps its head back and throws its arms up and back
//    within ≈ 2 sf, stumbles with one knee up, holds for ≈ 12 sf, then drops back to guard. There are three variants
//    per soldier (both arms flung up and wide / one arm up with a twist / doubled over), mirrored, with jittered amplitude and snap
//    speed, so a 15-body band reads as a rippling wave, not clones.
// Driven by crowd.flash[i] (set by combat on the hit frame), crowd.hitHeavy[i], crowd.kod[i], crowd.st[i], crowd.stT[i].
import * as THREE from 'three';
import { COMBAT } from './combat.js';
import { ST } from '../crowd/crowd.js';
import { hash01 } from '../core/rng.js';

/** Adds `aHit` (vec3 tint colour × strength; > 1 = white pop) to a MeshStandardMaterial via onBeforeCompile. */
export function patchHitMaterial(mat) {
  const prev = mat.onBeforeCompile, key = mat.customProgramCacheKey() + '|hitfx3';   // chain other parts' patches
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = function (sh, renderer) {
    prev.call(this, sh, renderer);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aHit;\nvarying vec3 vHit;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvHit = aHit;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vHit;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float hitA = max(vHit.r, max(vHit.g, vHit.b));
        float hitRim = 1.0 - abs(dot(normal, normalize(vViewPosition)));
        if (hitA > 1.01) {                                            // contact frame: white-hot edges, lifted body
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), 0.15);
          totalEmissiveRadiance += (vHit - 1.0) * (0.1 + 1.3 * hitRim * hitRim);
        } else if (hitA > 0.0) {
          vec3 hitC = vHit / hitA;
          float hitL = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
          // lit wash: albedo toward the tint, brighter where the albedo is brighter (skin, plates), so shading stays
          diffuseColor.rgb = mix(diffuseColor.rgb, hitC * (0.33 + 1.3 * hitL), 0.22 * hitA);
          // red tints (killing blow, KO ember) also glow flat, so thrown bodies fly as embers over the crowd
          float hitFlat = 0.04 + 0.2 * clamp((0.45 - hitC.g) * 4.0, 0.0, 1.0);
          totalEmissiveRadiance += hitC * hitA * (hitFlat + 0.9 * hitRim * hitRim * hitRim);
        }`);
  };
}

/** Per-instance hit-glow attribute; share one between all body-part meshes of a soldier set (one upload). */
export function hitAttr(count) {
  const a = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, count) * 3), 3);
  a.setUsage(THREE.DynamicDrawUsage);
  return a;
}

const HOT = [1.55, 1.53, 1.5], GOLD = [1.0, 0.6, 0.12], AMBER = [1.0, 0.4, 0.07], KILL = [1.0, 0.25, 0.12];   // HOT: 1 + white emissive
const EMBER = 0.45;                                                // KO'd bodies keep a dim red rim until they land
/** Tint of soldier i this frame (colour × strength, or HOT on the contact frame), written into out[0..2]. */
export function hitGlow(crowd, i, out) {
  const fl = crowd.flash[i], ember = crowd.kod[i] && crowd.st[i] === ST.AIR ? EMBER : 0;
  if (fl <= 0 && !ember) { out[0] = out[1] = out[2] = 0; return out; }
  const heavy = crowd.hitHeavy ? crowd.hitHeavy[i] : 0;
  const D = COMBAT.tintFrames - 1 + (heavy ? 3 : 0);               // flash value on the frame a fresh hit shows
  if (fl >= D) { out[0] = HOT[0]; out[1] = HOT[1]; out[2] = HOT[2]; return out; }
  const u = Math.min(1, fl / (D - 1)), k = Math.max(ember, u * u);   // decays from the first frame: brief, not a held wash
  const C = crowd.kod[i] ? KILL : heavy ? AMBER : GOLD;
  out[0] = C[0] * k; out[1] = C[1] * k; out[2] = C[2] * k;
  return out;
}

// ---- recoil pose. Channel values are (rx, ry, rz) in the crowd rig's convention (crowd/view.js): torso/head rx < 0
// leans back; arm rx ≈ -2.5 is raised overhead, arm rz pushes it out (right arm < 0, left arm > 0); thigh rx < 0 swings
// the knee forward; shin = knee bend; weapon angles are relative to the hand.
const RECOIL = [
  { // thrown back, both arms flung up and back, one knee kicked up
    TO: [-0.78, 0, 0.06], HE: [-0.75, 0, 0], AR: [-2.4, 0.2, -0.95], AL: [-2.3, -0.2, 1.0],
    TR: [0.32, 0, -0.14], TL: [-0.6, 0, 0.2], SR: 0.2, SL: 1.0, WR: [1.1, 0, 0], WL: [0.5, 0, 0] },
  { // twisted: one arm flung up and back, the other thrown out wide, head turned away
    TO: [-0.62, 0.55, 0.2], HE: [-0.65, -0.35, 0.1], AR: [-2.85, 0, -0.35], AL: [-0.95, 0, 1.35],
    TR: [0.4, 0, -0.18], TL: [-0.35, 0, 0.3], SR: 0.35, SL: 0.7, WR: [1.3, 0, 0], WL: [0.3, 0, 0] },
  { // doubled over the blow, arms thrown forward and out, knees buckling
    TO: [0.72, 0, 0.1], HE: [0.2, 0.25, 0], AR: [-1.35, 0, -0.75], AL: [-1.25, 0, 0.8],
    TR: [-0.55, 0, -0.2], TL: [-0.2, 0, 0.18], SR: 1.1, SL: 0.8, WR: [0.9, 0, 0], WL: [0.4, 0, 0] },
];

/**
 * Recoil pose targets for a HURT / KNOCK soldier into T (view.js pose channels, `ch` = its channel offsets).
 * Returns the blend rate (1/s), or 0 once the recoil is over (the caller then blends back to its guard stance).
 */
export function recoilPose(T, ch, crowd, i, s, t, sd) {
  const knock = s === ST.KNOCK, hold = knock ? 16 : 12;
  if (t >= hold) return 0;
  const r = hash01(i, 97), v = RECOIL[r < 0.5 ? 0 : r < 0.82 ? 1 : 2];
  const amp = 0.88 + 0.24 * hash01(i, 98), m = sd;               // m = -1 mirrors left ↔ right
  const drift = Math.min(t, 8) * 0.03;                           // the blow keeps carrying the arms back a little
  const put = (k, a, x = 0) => { T[k] = (a[0] - x) * amp; T[k + 1] = a[1] * amp * m; T[k + 2] = a[2] * amp * m; };
  put(ch.TO, v.TO, drift); put(ch.HE, v.HE);
  // limbs: mirrored soldiers swap sides (a roll that pushes the right arm out pushes the left arm out when negated)
  put(m > 0 ? ch.AR : ch.AL, v.AR, drift); put(m > 0 ? ch.AL : ch.AR, v.AL, drift);
  put(m > 0 ? ch.TR : ch.TL, v.TR); put(m > 0 ? ch.TL : ch.TR, v.TL);
  T[m > 0 ? ch.SR : ch.SL] = v.SR; T[m > 0 ? ch.SL : ch.SR] = v.SL;
  T[ch.WR] = v.WR[0]; T[ch.WL] = v.WL[0];
  if (knock) {                                                   // officers: stumbling steps back
    const st = Math.sin(t * 0.5) * 0.35;
    T[ch.TL] += st; T[ch.TR] -= st;
  }
  // snap in on the contact frames (per-soldier speed → the band ripples), then hold
  return t < 2 ? 55 + 45 * hash01(i, 99) : 16;
}
