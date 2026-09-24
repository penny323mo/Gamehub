// Seeded deterministic RNG (mulberry32).
// `rng`  → simulation randomness only (reseeded by every scenario reset).
// `vrng` → visual-only randomness (particles, shake, grain). Never feed it back into the sim.
export function makeRng(seed = 1) {
  let s = seed >>> 0;
  const r = {
    seed(n) { s = n >>> 0; },
    next() {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(a, b) { return a + (b - a) * r.next(); },
    int(a, b) { return a + Math.floor((b - a + 1) * r.next()); },
    pick(arr) { return arr[Math.floor(r.next() * arr.length)]; },
    chance(p) { return r.next() < p; },
    get state() { return s; },
  };
  return r;
}

export const rng = makeRng(1);
export const vrng = makeRng(7);

// Stable hash → [0,1) for procedural detail that must not consume RNG state.
export function hash01(a, b = 0, c = 0) {
  let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
