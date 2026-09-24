// Occluder cutout (render-only): where a soldier or prop stands between the gameplay camera and the hero, a clean
// see-through window the shape of the hero (a screen-space capsule from his feet to above his head) is cut out of it,
// so the hero is never hidden and nothing else changes. No screen-door dither across the body: the window is fully
// open inside, with only a thin 1-px ordered-dither rim, which the DoF softens. An occluder is judged by its origin on
// the ground (per object / per instance): soldiers level with or behind the hero stay whole, and the window opens
// smoothly as one steps in front of him. Soldiers close to the lens (ground distance under ≈ 0.8 × the lens → hero
// distance, any bearing) drop out whole (per instance, a clean cut). Soldiers more than ≈1 m in front of the hero along
// the lens → hero axis are not drawn at all (lensSide(), called by the crowd view): the ground lens-side stays open.
// Opt-in: call fadeOccluder(material) on a material (works with InstancedMesh).
// The camera rig drives the uniforms each frame (camera and hero ground positions, the hero's screen capsule, on/off).
import * as THREE from 'three';

export const FADE = {
  uA: { value: new THREE.Vector2() }, uB: { value: new THREE.Vector2() }, uOn: { value: 0 },
  // hero capsule in NDC: feet / head centres, radius (NDC y units), rim width, aspect (x NDC units per y unit)
  uCutA: { value: new THREE.Vector2() }, uCutB: { value: new THREE.Vector2() }, uCutR: { value: 0 }, uCutE: { value: 0.01 }, uAsp: { value: 16 / 9 },
};

// lens clear radius as a fraction of the lens → hero ground distance (≈ 4.4 m in the default dense-crowd rig)
const LENS = '0.81';
const VERT = (near) => /* glsl */`#include <project_vertex>
  vCutP = gl_Position.xyw;
  {
  #ifdef USE_INSTANCING
    vec2 fo = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xz;
  #else
    vec2 fo = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xz;
  #endif
    vec2 ab = uFadeB - uFadeA; float L = max(length(ab), 1e-3);
    float front = L - dot(fo - uFadeA, ab / L);                                  // metres in front of the hero
    vCamFade = uFadeOn * smoothstep(${near.toFixed(2)}, ${(near + 0.6).toFixed(2)}, front) * step(0.0, L - front);
    // lens clear: a soldier/prop standing close to the lens drops out (DW: the near crowd never walls off the frame).
    // A clean per-instance cut, no dither band (a ring sits in any band for good and read as a mosaic under the DoF).
    // The radius scales with the rig, so pull-outs and Musou shots follow.
    vLensFade = uFadeOn * step(length(fo - uFadeA), ${LENS} * L);
  }`;
const FRAG = /* glsl */`
  if (vLensFade > 0.5) discard;
  if (vCamFade > 0.0) {
    vec2 cp = (vCutP.xy / vCutP.z - uCutA) * vec2(uAsp, 1.0), cb = (uCutB - uCutA) * vec2(uAsp, 1.0);
    float cd = length(cp - cb * clamp(dot(cp, cb) / max(dot(cb, cb), 1e-8), 0.0, 1.0));
    float cr = uCutR * vCamFade;                                               // the window opens as he steps in front
    float cut = 1.0 - smoothstep(cr - uCutE, cr, cd);
    vec2 bq = floor(gl_FragCoord.xy), bh = floor(bq * 0.5);
    float b = fract(dot(bh, vec2(0.5, bh.y * 0.75))) * 0.25 + fract(dot(bq, vec2(0.5, bq.y * 0.75))) + 0.03;   // 4x4 Bayer
    if (cut > b) discard;
  }`;

/** near: how far in front of the hero (m) the cutout starts — 0.5 keeps adjacent soldiers whole; thin props use less. */
export function fadeOccluder(material, near = 0.5) {
  const prev = material.onBeforeCompile, key = material.customProgramCacheKey() + '|camCut' + near;
  material.onBeforeCompile = function (shader, renderer) {
    prev.call(this, shader, renderer);
    Object.assign(shader.uniforms, { uFadeA: FADE.uA, uFadeB: FADE.uB, uFadeOn: FADE.uOn, uCutA: FADE.uCutA, uCutB: FADE.uCutB, uCutR: FADE.uCutR, uCutE: FADE.uCutE, uAsp: FADE.uAsp });
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'uniform vec2 uFadeA, uFadeB; uniform float uFadeOn; varying float vCamFade, vLensFade; varying vec3 vCutP;\nvoid main() {')
      .replace('#include <project_vertex>', VERT(near));
    shader.fragmentShader = shader.fragmentShader.replace('void main() {',
      'uniform vec2 uCutA, uCutB; uniform float uCutR, uCutE, uAsp; varying float vCamFade, vLensFade; varying vec3 vCutP;\nvoid main() {' + FRAG);
  };
  material.customProgramCacheKey = () => key;
  material.needsUpdate = true;
  return material;
}

/**
 * Lens-side clear (render-only, per soldier): DW8 keeps the ground between the lens and the hero open and the crowd
 * reads ahead of him. A soldier (alive, KO'd or flying) standing more than `hide` m in front of the hero along the
 * lens → hero ground axis is not drawn, whole; it reappears once back within `show` m (hysteresis: no flicker for
 * soldiers shuffling at the line). `extra` m pushes the line out (soldiers reeling from his hits stay readable a little
 * further; Infinity = never cleared: officers, so their HUD tags stay honest). Attackers step in to ≈1.45 m, so every
 * soldier that can hit him stays visible. Uses last render's rig (FADE uniforms).
 */
export const LENS_SIDE = { hide: 1.0, show: 0.75 };
const lensHid = [];
export function lensSide(i, x, z, extra = 0) {
  const A = FADE.uA.value, B = FADE.uB.value, abx = B.x - A.x, abz = B.y - A.y, L = Math.hypot(abx, abz);
  if (!FADE.uOn.value || L < 1e-3) return (lensHid[i] = false);
  const front = L - ((x - A.x) * abx + (z - A.y) * abz) / L;       // metres in front of the hero
  return (lensHid[i] = front > (lensHid[i] ? LENS_SIDE.show : LENS_SIDE.hide) + extra);
}

/**
 * Lens clear (render-only): fragments closer than `near` m to the camera are cut away, so debris flying past the lens
 * (a C6 boulder, a KO burst) never blacks out the frame. Chains with an earlier onBeforeCompile (works instanced).
 */
export function lensClear(material, near = 2) {
  const prev = material.onBeforeCompile, key = material.customProgramCacheKey() + '|lens' + near;
  material.onBeforeCompile = function (shader, renderer) {
    prev.call(this, shader, renderer);
    shader.vertexShader = shader.vertexShader.replace('void main() {', 'varying float vLensD;\nvoid main() {')
      .replace('#include <project_vertex>', '#include <project_vertex>\n  vLensD = -mvPosition.z;');
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `varying float vLensD;\nvoid main() {\n  if (vLensD < ${near.toFixed(2)}) discard;`);
  };
  material.customProgramCacheKey = () => key;
  material.needsUpdate = true;
  return material;
}
