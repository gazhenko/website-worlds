import './particles.css';
import { esc } from '../lib/dom.js';
import { clamp, TAU } from '../lib/math.js';
import { noise3 } from '../lib/noise.js';

const MODES = [
  { id: 'swirl', name: 'Swirl' },
  { id: 'attract', name: 'Attract' },
  { id: 'repel', name: 'Repel' },
];
const DENSITIES = [
  { name: 'Medium', k: 1 },
  { name: 'High', k: 1.6 },
  { name: 'Low', k: 0.5 },
];
const BUCKETS = 6;

export function render({ world }) {
  return `
  <div class="w-par__field" tabindex="0" data-keys-captured role="application"
    aria-label="A field of glowing particles flowing around an attractor. Move your pointer over it, or focus it and use the arrow keys to steer; press Enter to burst.">
    <canvas class="w-par__canvas" aria-hidden="true"></canvas>
    <div class="w-par__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — the particle field is resting.</p></div>
  </div>
  <div class="w-par__panel">
    <h1 class="w-par__title">${esc(world.label)}</h1>
    <p class="ww-caption w-par__caption">${esc(world.description)}</p>
    <div class="w-par__controls" role="group" aria-label="Field controls">
      <button type="button" data-world-action="mode">Force: <span data-value>Swirl</span></button>
      <button type="button" data-world-action="burst">Burst ✺</button>
      <button type="button" data-world-action="density">Density: <span data-density>Medium</span></button>
    </div>
    <p class="w-par__status" data-world-status role="status">Swirl · medium density</p>
  </div>`;
}

export function mount(root, ctx) {
  const field = root.querySelector('.w-par__field');
  const canvas = root.querySelector('.w-par__canvas');
  const state = { mode: 0, density: 0, bursts: 0 };
  const pointer = { x: 0, y: 0, active: 0, manual: 0 };
  const attractor = { x: 0, y: 0 };
  let n = 0;
  let px;
  let py;
  let vx;
  let vy;

  function allocate(w, h) {
    n = Math.round(clamp(((w * h) / 1700) * DENSITIES[state.density].k, 150, 1400));
    px = new Float32Array(n);
    py = new Float32Array(n);
    vx = new Float32Array(n);
    vy = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      px[i] = Math.random() * w;
      py[i] = Math.random() * h;
    }
    attractor.x = w / 2;
    attractor.y = h / 2;
  }

  const view = ctx.canvas(canvas, { maxDpr: 1.5, alpha: false, onResize: ({ w, h }) => allocate(w, h) });

  function sync() {
    root.querySelector('[data-world-action="mode"] [data-value]').textContent = MODES[state.mode].name;
    root.querySelector('[data-density]').textContent = DENSITIES[state.density].name;
    const bursts = state.bursts ? ` · ${state.bursts} burst${state.bursts === 1 ? '' : 's'}` : '';
    ctx.status(`${MODES[state.mode].name} · ${DENSITIES[state.density].name.toLowerCase()} density (${n} particles)${bursts}`);
  }

  function burst() {
    if (!view) return;
    const R = Math.min(view.w, view.h) * 0.45;
    for (let i = 0; i < n; i++) {
      const dx = px[i] - attractor.x;
      const dy = py[i] - attractor.y;
      const d = Math.hypot(dx, dy) + 0.01;
      if (d < R) {
        const k = (1 - d / R) * 900;
        if (ctx.running) {
          vx[i] += (dx / d) * k;
          vy[i] += (dy / d) * k;
        } else {
          px[i] += (dx / d) * k * 0.12;
          py[i] += (dy / d) * k * 0.12;
        }
      }
    }
  }

  ctx.actions({
    mode() {
      state.mode = (state.mode + 1) % MODES.length;
      sync();
    },
    burst() {
      burst();
      state.bursts += 1;
      sync();
    },
    density() {
      state.density = (state.density + 1) % DENSITIES.length;
      if (view) allocate(view.w, view.h);
      sync();
    },
  });

  ctx.on(field, 'pointermove', (event) => {
    const rect = field.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = 2.5;
  });
  ctx.on(field, 'pointerdown', (event) => {
    const rect = field.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = 2.5;
  });
  ctx.on(field, 'pointerleave', () => {
    pointer.active = 0;
  });
  ctx.on(field, 'keydown', (event) => {
    if (!view) return;
    const step = event.shiftKey ? 60 : 24;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[event.key]) {
      event.preventDefault();
      if (!pointer.manual) {
        pointer.x = attractor.x;
        pointer.y = attractor.y;
      }
      pointer.x = clamp(pointer.x + moves[event.key][0], 0, view.w);
      pointer.y = clamp(pointer.y + moves[event.key][1], 0, view.h);
      pointer.manual = 4;
      pointer.active = 4;
      ctx.redraw();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      burst();
      ctx.redraw();
    }
  });

  ctx.loop(({ dt, time, running }) => {
    if (!view) return;
    const { g, w, h } = view;
    pointer.active = Math.max(0, pointer.active - dt);
    pointer.manual = Math.max(0, pointer.manual - dt);
    if (pointer.active > 0) {
      attractor.x = pointer.x;
      attractor.y = pointer.y;
    } else if (dt) {
      attractor.x = w / 2 + Math.cos(time * 0.31) * w * 0.28;
      attractor.y = h / 2 + Math.sin(time * 0.43) * h * 0.24;
    }

    if (running && dt) {
      const R = Math.min(w, h) * 0.38;
      const R2 = R * R;
      const mode = MODES[state.mode].id;
      const damp = Math.pow(0.955, dt * 60);
      const t = time * 0.08;
      for (let i = 0; i < n; i++) {
        const a = noise3(px[i] * 0.0028, py[i] * 0.0028, t) * TAU * 2;
        let ax = Math.cos(a) * 26;
        let ay = Math.sin(a) * 26;
        const dx = attractor.x - px[i];
        const dy = attractor.y - py[i];
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 6;
          const f = (1 - d / R) * 520;
          if (mode === 'attract') {
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          } else if (mode === 'repel') {
            ax -= (dx / d) * f * 1.4;
            ay -= (dy / d) * f * 1.4;
          } else {
            ax += (-dy / d) * f + (dx / d) * f * 0.25;
            ay += (dx / d) * f + (dy / d) * f * 0.25;
          }
        }
        vx[i] = (vx[i] + ax * dt) * damp;
        vy[i] = (vy[i] + ay * dt) * damp;
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
        if (px[i] < 0) px[i] += w;
        else if (px[i] > w) px[i] -= w;
        if (py[i] < 0) py[i] += h;
        else if (py[i] > h) py[i] -= h;
      }
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = 'rgba(6,7,13,0.2)';
      g.fillRect(0, 0, w, h);
    } else {
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#06070d';
      g.fillRect(0, 0, w, h);
    }

    g.globalCompositeOperation = 'lighter';
    for (let b = 0; b < BUCKETS; b++) {
      g.fillStyle = `hsl(${190 + b * 22} 90% ${58 + b * 3}%)`;
      g.beginPath();
      for (let i = b; i < n; i += BUCKETS) {
        const speed = Math.abs(vx[i]) + Math.abs(vy[i]);
        const s = 1.2 + Math.min(1.6, speed * 0.01);
        g.rect(px[i], py[i], s, s);
      }
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(attractor.x, attractor.y, 10 + Math.sin(time * 2) * 2, 0, TAU);
    g.stroke();
  });

  sync();
}
