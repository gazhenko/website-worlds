export const TAU = Math.PI * 2;

export const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);

/** Frame-rate independent exponential approach of `current` toward `target`. */
export const approach = (current, target, rate, dt) => target + (current - target) * Math.exp(-rate * dt);

/** Wrap v into [min, max). */
export const wrap = (v, min, max) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** Round to one decimal place for compact SVG path strings. */
export const r1 = (n) => Math.round(n * 10) / 10;
