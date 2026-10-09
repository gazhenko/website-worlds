import './gradient-mesh.css';
import { esc } from '../lib/dom.js';
import { clamp, TAU } from '../lib/math.js';
import { hexToRgb } from '../lib/color.js';
import { noise2 } from '../lib/noise.js';

const PALETTES = [
  { id: 'orchard', name: 'Orchard', colors: ['#ff7a8a', '#ffe08a', '#b48cff', '#ff9f7a', '#fff0c9', '#7ad7c4'] },
  { id: 'lagoon', name: 'Lagoon', colors: ['#0b3d91', '#2ee6c0', '#9be7ff', '#6b4dff', '#00b4a0', '#e0fbff'] },
  { id: 'ember', name: 'Ember', colors: ['#3a0a1e', '#ff3d3d', '#ffb703', '#8a1c7c', '#ff7a1a', '#ffe6c7'] },
];
const FLOWS = [
  { id: 'drift', name: 'Drift' },
  { id: 'swirl', name: 'Swirl' },
];
const HOME = [
  [0.15, 0.2],
  [0.82, 0.18],
  [0.5, 0.5],
  [0.18, 0.82],
  [0.85, 0.78],
  [0.55, 0.12],
];

export function render({ world }) {
  return `
  <div class="w-mesh__field" tabindex="0" data-keys-captured role="application"
    aria-label="A flowing gradient mesh of six colour points. Drag a point to pull its colour; when focused, arrow keys move the selected point and Enter selects the next one.">
    <canvas class="w-mesh__canvas" aria-hidden="true"></canvas>
    <div class="w-mesh__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — imagine six colours melting into one another.</p></div>
  </div>
  <div class="w-mesh__card">
    <p class="w-mesh__kicker">Six points · one surface</p>
    <h1 class="w-mesh__title">${esc(world.label)}</h1>
    <p class="ww-caption w-mesh__caption">${esc(world.description)}</p>
    <div class="w-mesh__controls" role="group" aria-label="Mesh controls">
      <button type="button" data-world-action="palette">Palette · <span data-value>Orchard</span></button>
      <button type="button" data-world-action="handles" aria-pressed="false">Show mesh</button>
      <button type="button" data-world-action="flow">Flow · <span data-flow>Drift</span></button>
    </div>
    <p class="w-mesh__status" data-world-status role="status">Orchard palette · mesh hidden · drifting</p>
  </div>`;
}

export function mount(root, ctx) {
  const field = root.querySelector('.w-mesh__field');
  const canvas = root.querySelector('.w-mesh__canvas');
  const state = { palette: 0, handles: false, flow: 0, selected: 0 };
  const points = HOME.map(([x, y], i) => ({ x, y, hx: x, hy: y, pinned: 0, seed: i * 13.7 }));
  let buffer = null;
  let bctx = null;
  let image = null;
  let colors = [];
  let drag = null;

  function setPalette() {
    colors = PALETTES[state.palette].colors.map(hexToRgb);
  }
  setPalette();

  const view = ctx.canvas(canvas, {
    maxDpr: 1.5,
    onResize: ({ w, h }) => {
      const gw = 84;
      const gh = clamp(Math.round((gw * h) / Math.max(1, w)), 30, 120);
      buffer = document.createElement('canvas');
      buffer.width = gw;
      buffer.height = gh;
      bctx = buffer.getContext('2d');
      image = bctx.createImageData(gw, gh);
    },
  });

  function sync() {
    root.dataset.handles = String(state.handles);
    root.querySelector('[data-world-action="palette"] [data-value]').textContent = PALETTES[state.palette].name;
    root.querySelector('[data-world-action="handles"]').setAttribute('aria-pressed', String(state.handles));
    root.querySelector('[data-flow]').textContent = FLOWS[state.flow].name;
    ctx.status(`${PALETTES[state.palette].name} palette · mesh ${state.handles ? 'shown' : 'hidden'} · ${FLOWS[state.flow].id === 'drift' ? 'drifting' : 'swirling'}`);
  }

  ctx.actions({
    palette() {
      state.palette = (state.palette + 1) % PALETTES.length;
      setPalette();
      sync();
    },
    handles() {
      state.handles = !state.handles;
      sync();
    },
    flow() {
      state.flow = (state.flow + 1) % FLOWS.length;
      for (const p of points) p.pinned = 0;
      sync();
    },
  });

  const local = (event) => {
    const rect = field.getBoundingClientRect();
    return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height];
  };

  ctx.on(field, 'pointerdown', (event) => {
    if (!view) return;
    const [u, v] = local(event);
    let best = -1;
    let bestD = Infinity;
    points.forEach((p, i) => {
      const d = Math.hypot((p.x - u) * view.w, (p.y - v) * view.h);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0 && bestD < 80) {
      drag = { id: event.pointerId, i: best };
      state.selected = best;
      field.setPointerCapture?.(event.pointerId);
    }
  });
  ctx.on(field, 'pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const [u, v] = local(event);
    const p = points[drag.i];
    p.x = clamp(u, 0, 1);
    p.y = clamp(v, 0, 1);
    p.pinned = 6;
    ctx.redraw();
  });
  const end = () => {
    drag = null;
  };
  ctx.on(field, 'pointerup', end);
  ctx.on(field, 'pointercancel', end);
  ctx.on(field, 'keydown', (event) => {
    const keys = { ArrowLeft: [-0.03, 0], ArrowRight: [0.03, 0], ArrowUp: [0, -0.03], ArrowDown: [0, 0.03] };
    if (keys[event.key]) {
      event.preventDefault();
      const p = points[state.selected];
      p.x = clamp(p.x + keys[event.key][0], 0, 1);
      p.y = clamp(p.y + keys[event.key][1], 0, 1);
      p.pinned = 6;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      state.selected = (state.selected + 1) % points.length;
    } else return;
    ctx.redraw();
  });

  ctx.loop(({ dt, time }) => {
    if (!view || !bctx) return;
    const { g, w, h } = view;
    const flow = FLOWS[state.flow].id;
    for (const [i, p] of points.entries()) {
      if (p.pinned > 0) {
        p.pinned -= dt;
        continue;
      }
      if (!dt) continue;
      let tx;
      let ty;
      if (flow === 'drift') {
        tx = p.hx + (noise2(p.seed, time * 0.12) - 0.5) * 0.5;
        ty = p.hy + (noise2(p.seed + 40, time * 0.12) - 0.5) * 0.5;
      } else {
        const a = Math.atan2(p.hy - 0.5, p.hx - 0.5) + time * 0.25 * (i % 2 ? 1 : -1);
        const r = Math.hypot(p.hx - 0.5, p.hy - 0.5) * (0.85 + 0.25 * Math.sin(time * 0.5 + i));
        tx = 0.5 + Math.cos(a) * r;
        ty = 0.5 + Math.sin(a) * r;
      }
      const k = 1 - Math.exp(-2 * dt);
      p.x += (clamp(tx, -0.1, 1.1) - p.x) * k;
      p.y += (clamp(ty, -0.1, 1.1) - p.y) * k;
    }

    const gw = image.width;
    const gh = image.height;
    const data = image.data;
    const aspect = w / h;
    let o = 0;
    for (let y = 0; y < gh; y++) {
      const v = y / (gh - 1);
      for (let x = 0; x < gw; x++) {
        const u = x / (gw - 1);
        let r = 0;
        let gg = 0;
        let b = 0;
        let sum = 0;
        for (let i = 0; i < points.length; i++) {
          const dx = (u - points[i].x) * aspect;
          const dy = v - points[i].y;
          const wgt = 1 / Math.pow(dx * dx + dy * dy + 0.01, 1.5);
          r += colors[i][0] * wgt;
          gg += colors[i][1] * wgt;
          b += colors[i][2] * wgt;
          sum += wgt;
        }
        data[o] = r / sum;
        data[o + 1] = gg / sum;
        data[o + 2] = b / sum;
        data[o + 3] = 255;
        o += 4;
      }
    }
    bctx.putImageData(image, 0, 0);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(buffer, 0, 0, w, h);

    if (state.handles) {
      const warp = (u, v) => {
        let dx = 0;
        let dy = 0;
        for (const p of points) {
          const ddx = p.x - u;
          const ddy = p.y - v;
          const f = Math.exp(-(ddx * ddx + ddy * ddy) * 18) * 0.08;
          dx += ddx * f * 6;
          dy += ddy * f * 6;
        }
        return [(u + dx) * w, (v + dy) * h];
      };
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 0; i <= 10; i++) {
        for (let s = 0; s <= 24; s++) {
          const [x1, y1] = warp(i / 10, s / 24);
          if (s === 0) g.moveTo(x1, y1);
          else g.lineTo(x1, y1);
        }
      }
      for (let j = 0; j <= 6; j++) {
        for (let s = 0; s <= 30; s++) {
          const [x1, y1] = warp(s / 30, j / 6);
          if (s === 0) g.moveTo(x1, y1);
          else g.lineTo(x1, y1);
        }
      }
      g.stroke();
      points.forEach((p, i) => {
        const x = p.x * w;
        const y = p.y * h;
        g.fillStyle = '#ffffff';
        g.strokeStyle = '#2a1d33';
        g.lineWidth = i === state.selected ? 3 : 1.5;
        g.beginPath();
        g.arc(x, y, 11, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = `rgb(${colors[i].join(',')})`;
        g.beginPath();
        g.arc(x, y, 6, 0, TAU);
        g.fill();
      });
    }
  });

  sync();
}
