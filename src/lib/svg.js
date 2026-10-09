import { r1, TAU } from './math.js';

export const SVG_NS = 'http://www.w3.org/2000/svg';

export const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];

export const circlePath = (cx, cy, r) =>
  `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0Z`;

/** Closed Catmull-Rom spline through points → smooth cubic Bézier path. */
export function smoothClosedPath(points, tension = 1) {
  const n = points.length;
  if (n < 3) return '';
  const k = tension / 6;
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) * k;
    const c1y = p1[1] + (p2[1] - p0[1]) * k;
    const c2x = p2[0] - (p3[0] - p1[0]) * k;
    const c2y = p2[1] - (p3[1] - p1[1]) * k;
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}

/** Open Catmull-Rom spline through points. */
export function smoothOpenPath(points, tension = 1) {
  const n = points.length;
  if (n < 2) return '';
  const k = tension / 6;
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, n - 1)];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) * k)} ${r1(p1[1] + (p2[1] - p0[1]) * k)} ${r1(p2[0] - (p3[0] - p1[0]) * k)} ${r1(p2[1] - (p3[1] - p1[1]) * k)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/** A radially wobbling closed blob — `radiusAt(angle)` returns the radius. */
export function blobPath(cx, cy, radiusAt, count = 12) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    pts.push(polar(cx, cy, radiusAt(a, i), a));
  }
  return smoothClosedPath(pts);
}

/** Polyline points → "M x y L …" path. */
export const linePath = (pts, close = false) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`).join('') + (close ? 'Z' : '');
