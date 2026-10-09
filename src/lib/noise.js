// Smooth value noise (2D/3D) — cheap, deterministic and dependency free.

function hash2(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function hash3(x, y, z, seed) {
  return hash2(x + Math.imul(z | 0, 1013904223), y ^ Math.imul(z | 0, 2654435761), seed);
}

const fade = (t) => t * t * (3 - 2 * t);

/** Value noise in [0, 1]. */
export function noise2(x, y, seed = 0) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const sx = fade(x - x0);
  const sy = fade(y - y0);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  const top = a + (b - a) * sx;
  const bottom = c + (d - c) * sx;
  return top + (bottom - top) * sy;
}

/** Value noise in [0, 1] over three dimensions (use z as time). */
export function noise3(x, y, z, seed = 0) {
  const z0 = Math.floor(z);
  const sz = fade(z - z0);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const sx = fade(x - x0);
  const sy = fade(y - y0);
  const layer = (zz) => {
    const a = hash3(x0, y0, zz, seed);
    const b = hash3(x0 + 1, y0, zz, seed);
    const c = hash3(x0, y0 + 1, zz, seed);
    const d = hash3(x0 + 1, y0 + 1, zz, seed);
    const top = a + (b - a) * sx;
    const bottom = c + (d - c) * sx;
    return top + (bottom - top) * sy;
  };
  const l0 = layer(z0);
  const l1 = layer(z0 + 1);
  return l0 + (l1 - l0) * sz;
}

/** Signed noise in [-1, 1]. */
export const snoise2 = (x, y, seed = 0) => noise2(x, y, seed) * 2 - 1;
export const snoise3 = (x, y, z, seed = 0) => noise3(x, y, z, seed) * 2 - 1;

/** Fractal (fBm) value noise in roughly [0, 1]. */
export function fbm2(x, y, octaves = 3, seed = 0) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(x * freq, y * freq, seed + i * 17) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}
