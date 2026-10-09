import './wireframe-3d.css';
import { esc } from '../lib/dom.js';
import { clamp, TAU } from '../lib/math.js';
import { fbm2 } from '../lib/noise.js';

function torus() {
  const U = 28;
  const V = 14;
  const verts = [];
  const edges = [];
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < V; j++) {
      const u = (i / U) * TAU;
      const v = (j / V) * TAU;
      const r = 1 + 0.4 * Math.cos(v);
      verts.push([r * Math.cos(u), 0.4 * Math.sin(v), r * Math.sin(u)]);
      const a = i * V + j;
      edges.push([a, ((i + 1) % U) * V + j], [a, i * V + ((j + 1) % V)]);
    }
  }
  return { name: 'Torus', verts, edges };
}

function geodesic() {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t],
    [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  const norm = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  verts = verts.map(norm);
  for (let pass = 0; pass < 2; pass++) {
    const cache = new Map();
    const mid = (a, b) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (cache.has(key)) return cache.get(key);
      const m = norm([(verts[a][0] + verts[b][0]) / 2, (verts[a][1] + verts[b][1]) / 2, (verts[a][2] + verts[b][2]) / 2]);
      verts.push(m);
      cache.set(key, verts.length - 1);
      return verts.length - 1;
    };
    const next = [];
    for (const [a, b, c] of faces) {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }
  const seen = new Set();
  const edges = [];
  for (const f of faces) {
    for (let k = 0; k < 3; k++) {
      const a = f[k];
      const b = f[(k + 1) % 3];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([a, b]);
      }
    }
  }
  return { name: 'Geodesic sphere', verts: verts.map((v) => v.map((n) => n * 1.15)), edges };
}

function terrain() {
  const N = 20;
  const verts = [];
  const edges = [];
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = (i / (N - 1)) * 2.6 - 1.3;
      const z = (j / (N - 1)) * 2.6 - 1.3;
      const fall = 1 - Math.min(1, Math.hypot(x, z) / 1.6);
      const y = (fbm2(x * 1.3 + 4, z * 1.3 + 2, 3, 11) - 0.45) * 1.6 * fall - 0.2;
      verts.push([x, y, z]);
      const a = i * N + j;
      if (i < N - 1) edges.push([a, a + N]);
      if (j < N - 1) edges.push([a, a + 1]);
    }
  }
  return { name: 'Terrain', verts, edges };
}

function mobius() {
  const U = 48;
  const V = 6;
  const verts = [];
  const edges = [];
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < V; j++) {
      const u = (i / U) * TAU;
      const v = (j / (V - 1) - 0.5) * 0.9;
      const r = 1 + (v / 2) * Math.cos(u / 2);
      verts.push([r * Math.cos(u), (v / 2) * Math.sin(u / 2) * 1.4, r * Math.sin(u)]);
      const a = i * V + j;
      if (j < V - 1) edges.push([a, a + 1]);
      if (i < U - 1) edges.push([a, (i + 1) * V + j]);
      else edges.push([a, V - 1 - j]);
    }
  }
  return { name: 'Möbius band', verts, edges };
}

const MESHES = [torus(), geodesic(), terrain(), mobius()];
const BUCKETS = 7;

export function render({ world }) {
  return `
  <div class="w-wire__view" tabindex="0" data-keys-captured role="application"
    aria-label="A rotating wireframe torus. Drag to rotate it, or focus it and use the arrow keys; plus and minus zoom.">
    <canvas class="w-wire__canvas" aria-hidden="true"></canvas>
    <div class="w-wire__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — the wireframe volume cannot be drawn here.</p></div>
    <p class="w-wire__readout" aria-hidden="true" data-readout>YAW 000° · PITCH 00° · 784 EDGES</p>
  </div>
  <div class="w-wire__panel">
    <p class="w-wire__kicker">INSPECT · DRAG · ARROWS · ±ZOOM</p>
    <h1 class="w-wire__title">${esc(world.label)}</h1>
    <p class="ww-caption w-wire__caption">${esc(world.description)}</p>
    <div class="w-wire__controls" role="group" aria-label="Viewer controls">
      <button type="button" data-world-action="shape">Mesh: <span data-value>Torus</span></button>
      <button type="button" data-world-action="spin" aria-pressed="true">Auto-rotate</button>
      <button type="button" data-world-action="projection">Projection: <span data-proj>Perspective</span></button>
    </div>
    <p class="w-wire__status" data-world-status role="status">Torus · auto-rotate on · perspective</p>
  </div>`;
}

export function mount(root, ctx) {
  const viewEl = root.querySelector('.w-wire__view');
  const canvas = root.querySelector('.w-wire__canvas');
  const readout = root.querySelector('[data-readout]');
  const state = { mesh: 0, spin: true, ortho: false };
  const cam = { yaw: 0.6, pitch: 0.42, vyaw: 0, vpitch: 0, zoom: 1 };
  let drag = null;
  let projected = new Float32Array(0);
  const buckets = Array.from({ length: BUCKETS }, () => []);

  const view = ctx.canvas(canvas, { maxDpr: 2 });

  function sync() {
    const mesh = MESHES[state.mesh];
    root.querySelector('[data-world-action="shape"] [data-value]').textContent = mesh.name;
    root.querySelector('[data-world-action="spin"]').setAttribute('aria-pressed', String(state.spin));
    root.querySelector('[data-proj]').textContent = state.ortho ? 'Orthographic' : 'Perspective';
    viewEl.setAttribute('aria-label', `A rotating wireframe ${mesh.name.toLowerCase()}. Drag to rotate it, or focus it and use the arrow keys; plus and minus zoom.`);
    ctx.status(`${mesh.name} · ${mesh.edges.length} edges · auto-rotate ${state.spin ? 'on' : 'off'} · ${state.ortho ? 'orthographic' : 'perspective'}`);
  }

  ctx.actions({
    shape() {
      state.mesh = (state.mesh + 1) % MESHES.length;
      sync();
    },
    spin() {
      state.spin = !state.spin;
      sync();
    },
    projection() {
      state.ortho = !state.ortho;
      sync();
    },
  });

  ctx.on(viewEl, 'pointerdown', (event) => {
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    viewEl.setPointerCapture?.(event.pointerId);
  });
  ctx.on(viewEl, 'pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    cam.yaw += dx * 0.009;
    cam.pitch = clamp(cam.pitch + dy * 0.009, -1.45, 1.45);
    cam.vyaw = dx * 0.5;
    cam.vpitch = dy * 0.5;
    ctx.redraw();
  });
  const end = () => {
    drag = null;
  };
  ctx.on(viewEl, 'pointerup', end);
  ctx.on(viewEl, 'pointercancel', end);
  ctx.on(viewEl, 'keydown', (event) => {
    const keys = { ArrowLeft: [-0.14, 0], ArrowRight: [0.14, 0], ArrowUp: [0, -0.12], ArrowDown: [0, 0.12] };
    if (keys[event.key]) {
      event.preventDefault();
      cam.yaw += keys[event.key][0];
      cam.pitch = clamp(cam.pitch + keys[event.key][1], -1.45, 1.45);
    } else if (event.key === '+' || event.key === '=') {
      cam.zoom = clamp(cam.zoom * 1.12, 0.5, 2.2);
    } else if (event.key === '-' || event.key === '_') {
      cam.zoom = clamp(cam.zoom / 1.12, 0.5, 2.2);
    } else return;
    ctx.redraw();
  });

  ctx.loop(({ dt }) => {
    if (!view) return;
    const { g, w, h } = view;
    if (!drag) {
      if (state.spin) cam.yaw += dt * 0.4;
      cam.yaw += cam.vyaw * dt * 0.02;
      cam.vyaw *= Math.pow(0.9, dt * 60);
      cam.vpitch *= Math.pow(0.9, dt * 60);
    }

    g.fillStyle = '#05060a';
    g.fillRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.48;
    const size = Math.min(w, h) * 0.36 * cam.zoom;
    const cyw = Math.cos(cam.yaw);
    const syw = Math.sin(cam.yaw);
    const cp = Math.cos(cam.pitch);
    const sp = Math.sin(cam.pitch);
    const D = 3.4;
    const project = (x, y, z) => {
      const x1 = x * cyw - z * syw;
      const z1 = x * syw + z * cyw;
      const y1 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      const k = state.ortho ? size * 0.82 : (size * D) / (z2 + D);
      return [cx + x1 * k, cy - y1 * k, z2];
    };

    // floor grid
    g.strokeStyle = 'rgba(92,242,255,0.08)';
    g.lineWidth = 1;
    g.beginPath();
    for (let i = -6; i <= 6; i++) {
      const a = project(i * 0.3, -1.45, -1.8);
      const b = project(i * 0.3, -1.45, 1.8);
      const c = project(-1.8, -1.45, i * 0.3);
      const d = project(1.8, -1.45, i * 0.3);
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.moveTo(c[0], c[1]);
      g.lineTo(d[0], d[1]);
    }
    g.stroke();

    const mesh = MESHES[state.mesh];
    const nv = mesh.verts.length;
    if (projected.length < nv * 3) projected = new Float32Array(nv * 3);
    let zmin = Infinity;
    let zmax = -Infinity;
    for (let i = 0; i < nv; i++) {
      const [x, y, z] = mesh.verts[i];
      const p = project(x, y, z);
      projected[i * 3] = p[0];
      projected[i * 3 + 1] = p[1];
      projected[i * 3 + 2] = p[2];
      if (p[2] < zmin) zmin = p[2];
      if (p[2] > zmax) zmax = p[2];
    }
    for (const b of buckets) b.length = 0;
    const span = zmax - zmin || 1;
    for (const [a, b] of mesh.edges) {
      const z = (projected[a * 3 + 2] + projected[b * 3 + 2]) / 2;
      const k = Math.min(BUCKETS - 1, Math.floor(((zmax - z) / span) * BUCKETS));
      buckets[k].push(a, b);
    }
    for (let k = 0; k < BUCKETS; k++) {
      const t = k / (BUCKETS - 1);
      g.strokeStyle = `rgba(${Math.round(70 + t * 150)},${Math.round(160 + t * 90)},255,${(0.18 + t * 0.8).toFixed(3)})`;
      g.lineWidth = 0.6 + t * 1.2;
      g.beginPath();
      const list = buckets[k];
      for (let i = 0; i < list.length; i += 2) {
        const a = list[i] * 3;
        const b = list[i + 1] * 3;
        g.moveTo(projected[a], projected[a + 1]);
        g.lineTo(projected[b], projected[b + 1]);
      }
      g.stroke();
    }

    // orientation gizmo
    const gx = 56;
    const gy = h - 56;
    const axis = (x, y, z, color, label) => {
      const x1 = x * cyw - z * syw;
      const z1 = x * syw + z * cyw;
      const y1 = y * cp - z1 * sp;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(gx, gy);
      g.lineTo(gx + x1 * 30, gy - y1 * 30);
      g.stroke();
      g.font = '11px ui-monospace, Menlo, monospace';
      g.fillText(label, gx + x1 * 38 - 3, gy - y1 * 38 + 4);
    };
    axis(1, 0, 0, '#ff6b6b', 'X');
    axis(0, 1, 0, '#7dff9b', 'Y');
    axis(0, 0, 1, '#6bb8ff', 'Z');

    const yawDeg = Math.round((((cam.yaw * 180) / Math.PI) % 360) + 360) % 360;
    const pitchDeg = Math.round((cam.pitch * 180) / Math.PI);
    readout.textContent = `YAW ${String(yawDeg).padStart(3, '0')}° · PITCH ${pitchDeg >= 0 ? '+' : '−'}${String(Math.abs(pitchDeg)).padStart(2, '0')}° · ZOOM ${cam.zoom.toFixed(2)}× · ${mesh.edges.length} EDGES`;
  });

  sync();
}
