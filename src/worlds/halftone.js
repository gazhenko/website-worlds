import './halftone.css';
import { esc } from '../lib/dom.js';
import { clamp, TAU } from '../lib/math.js';

const SCREENS = [
  { id: 'cmyk', name: 'CMYK' },
  { id: 'duotone', name: 'Duotone' },
  { id: 'mono', name: 'Mono' },
];
const CELLS = [
  { name: 'Medium', px: 12 },
  { name: 'Fine', px: 8 },
  { name: 'Coarse', px: 18 },
];
const SUBJECTS = [
  { id: 'sun', name: 'Sun' },
  { id: 'bloom', name: 'Bloom' },
  { id: 'orbit', name: 'Orbit' },
];
const INKS = {
  c: { color: '#00a3d9', angle: 15 },
  m: { color: '#e6007e', angle: 75 },
  y: { color: '#ffd800', angle: 0 },
  k: { color: '#1a1a1a', angle: 45 },
  blue: { color: '#1b3a8a', angle: 15 },
  pink: { color: '#ff4f7b', angle: 75 },
};

// Subjects return [r, g, b] in 0..1 for normalised coords (x across, y down) at time t.
function sun(x, y, t, aspect) {
  const cx = 0.5 + Math.sin(t * 0.2) * 0.06;
  const cy = 0.46 + Math.sin(t * 0.13) * 0.04;
  const dx = (x - cx) * aspect;
  const dy = y - cy;
  const d = Math.hypot(dx, dy);
  if (y > 0.66) {
    const wave = Math.sin(x * 28 + t * 1.4 + y * 40) * 0.5 + 0.5;
    const glare = Math.max(0, 1 - Math.abs(dx) * 5) * (0.5 + wave * 0.5);
    return [0.15 + glare * 0.85, 0.45 + glare * 0.5 + wave * 0.1, 0.75 - glare * 0.3];
  }
  if (d < 0.22) {
    const k = d / 0.22;
    return [1, 0.92 - k * 0.5, 0.35 - k * 0.3];
  }
  const sky = y / 0.66;
  const halo = Math.max(0, 1 - (d - 0.22) * 3) * 0.35;
  return [0.62 + sky * 0.35 + halo, 0.85 - sky * 0.25 + halo * 0.5, 0.95 - sky * 0.35];
}

function bloomSubject(x, y, t, aspect) {
  const dx = (x - 0.5) * aspect;
  const dy = y - 0.5;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx) + t * 0.18;
  const petal = 0.3 * (0.6 + 0.4 * Math.abs(Math.cos(a * 3)));
  if (r < 0.07) return [1, 0.82, 0.2];
  if (r < petal) {
    const k = r / petal;
    return [0.98, 0.35 + k * 0.3, 0.6 + k * 0.2];
  }
  const leaf = Math.sin(x * 12 + Math.sin(y * 9 + t * 0.4) * 2) * 0.5 + 0.5;
  return [0.2 + leaf * 0.15, 0.55 + leaf * 0.25, 0.5 + y * 0.2];
}

function orbit(x, y, t, aspect) {
  const blobs = [
    { cx: 0.5 + Math.cos(t * 0.5) * 0.18, cy: 0.5 + Math.sin(t * 0.7) * 0.16, col: [0, 1, 1] },
    { cx: 0.5 + Math.cos(t * 0.6 + 2.1) * 0.2, cy: 0.5 + Math.sin(t * 0.45 + 2) * 0.18, col: [1, 0, 1] },
    { cx: 0.5 + Math.cos(t * 0.4 + 4.2) * 0.17, cy: 0.5 + Math.sin(t * 0.55 + 4) * 0.15, col: [1, 1, 0] },
  ];
  let r = 1;
  let g = 1;
  let b = 1;
  for (const bl of blobs) {
    const d = Math.hypot((x - bl.cx) * aspect, y - bl.cy);
    const k = clamp(1.2 - d * 4.2, 0, 1);
    r *= 1 - k * (1 - bl.col[0]);
    g *= 1 - k * (1 - bl.col[1]);
    b *= 1 - k * (1 - bl.col[2]);
  }
  return [r, g, b];
}

const SUBJECT_FNS = { sun, bloom: bloomSubject, orbit };

export function render({ world }) {
  return `
  <div class="w-half__layout">
    <figure class="w-half__sheet">
      <span class="w-half__crop w-half__crop--tl" aria-hidden="true"></span><span class="w-half__crop w-half__crop--tr" aria-hidden="true"></span>
      <span class="w-half__crop w-half__crop--bl" aria-hidden="true"></span><span class="w-half__crop w-half__crop--br" aria-hidden="true"></span>
      <div class="w-half__plate">
        <canvas class="w-half__canvas" aria-hidden="true"></canvas>
        <div class="w-half__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — the press is idle.</p></div>
      </div>
      <figcaption class="w-half__strip" aria-hidden="true">
        <span class="w-half__swatch w-half__swatch--c">C</span><span class="w-half__swatch w-half__swatch--m">M</span><span class="w-half__swatch w-half__swatch--y">Y</span><span class="w-half__swatch w-half__swatch--k">K</span>
        <span class="w-half__reg"></span><span class="w-half__strip-text" data-strip>CMYK · 12 PX · SUN · 15° 75° 0° 45°</span>
      </figcaption>
    </figure>
    <section class="w-half__panel">
      <p class="w-half__kicker">Press proof № 36</p>
      <h1 class="w-half__title">${esc(world.label)}</h1>
      <p class="ww-caption w-half__caption">${esc(world.description)}</p>
      <div class="w-half__controls" role="group" aria-label="Press controls">
        <button type="button" data-world-action="screen">Screen: <span data-value>CMYK</span></button>
        <button type="button" data-world-action="cell">Dot size: <span data-cell>Medium</span></button>
        <button type="button" data-world-action="subject">Subject: <span data-subject>Sun</span></button>
      </div>
      <p class="w-half__status" data-world-status role="status">CMYK screen · medium dots · sun</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const canvas = root.querySelector('.w-half__canvas');
  const strip = root.querySelector('[data-strip]');
  const state = { screen: 0, cell: 0, subject: 0 };
  let acc = 1;

  const view = ctx.canvas(canvas, { maxDpr: 1.5 });

  function sync() {
    const screen = SCREENS[state.screen];
    root.querySelector('[data-world-action="screen"] [data-value]').textContent = screen.name;
    root.querySelector('[data-cell]').textContent = CELLS[state.cell].name;
    root.querySelector('[data-subject]').textContent = SUBJECTS[state.subject].name;
    const angles = screen.id === 'cmyk' ? '15° 75° 0° 45°' : screen.id === 'duotone' ? '15° 75°' : '45°';
    strip.textContent = `${screen.name.toUpperCase()} · ${CELLS[state.cell].px} PX · ${SUBJECTS[state.subject].name.toUpperCase()} · ${angles}`;
    ctx.status(`${screen.name} screen · ${CELLS[state.cell].name.toLowerCase()} dots · ${SUBJECTS[state.subject].name.toLowerCase()}`);
    acc = 1;
  }

  ctx.actions({
    screen() {
      state.screen = (state.screen + 1) % SCREENS.length;
      sync();
    },
    cell() {
      state.cell = (state.cell + 1) % CELLS.length;
      sync();
    },
    subject() {
      state.subject = (state.subject + 1) % SUBJECTS.length;
      sync();
    },
  });

  function drawScreen(g, w, h, cell, ink, density) {
    const angle = (ink.angle * Math.PI) / 180;
    const ex = [Math.cos(angle), Math.sin(angle)];
    const ey = [-Math.sin(angle), Math.cos(angle)];
    const R = Math.hypot(w, h) / 2 + cell;
    const n = Math.ceil(R / cell);
    const cx = w / 2;
    const cy = h / 2;
    g.fillStyle = ink.color;
    g.beginPath();
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        const x = cx + (i * ex[0] + j * ey[0]) * cell;
        const y = cy + (i * ex[1] + j * ey[1]) * cell;
        if (x < -cell || y < -cell || x > w + cell || y > h + cell) continue;
        const d = density(clamp(x / w, 0, 1), clamp(y / h, 0, 1));
        if (d < 0.03) continue;
        const r = cell * 0.56 * Math.sqrt(d);
        g.moveTo(x + r, y);
        g.arc(x, y, r, 0, TAU);
      }
    }
    g.fill();
  }

  ctx.loop(({ dt, time, running }) => {
    if (!view) return;
    const screen = SCREENS[state.screen].id;
    acc += dt;
    const fps = screen === 'cmyk' ? 14 : 22;
    if (running && acc < 1 / fps) return;
    acc = 0;
    const { g, w, h } = view;
    const aspect = w / h;
    const subject = SUBJECT_FNS[SUBJECTS[state.subject].id];
    const maxDots = screen === 'cmyk' ? 3200 : 5200;
    const cell = Math.max(CELLS[state.cell].px, Math.sqrt((w * h) / maxDots));
    const sample = (u, v) => subject(u, v, time, aspect);

    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#f5efe2';
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'multiply';

    if (screen === 'mono') {
      drawScreen(g, w, h, cell, INKS.k, (u, v) => {
        const [r, gg, b] = sample(u, v);
        return 1 - (0.3 * r + 0.59 * gg + 0.11 * b);
      });
    } else if (screen === 'duotone') {
      drawScreen(g, w, h, cell, INKS.blue, (u, v) => {
        const [r, gg, b] = sample(u, v);
        return clamp(1 - (0.3 * r + 0.59 * gg + 0.11 * b) * 1.1, 0, 1);
      });
      drawScreen(g, w, h, cell, INKS.pink, (u, v) => {
        const [r, gg, b] = sample(u, v);
        return clamp(r - (gg + b) / 2 + 0.25, 0, 1);
      });
    } else {
      const sep = (u, v) => {
        const [r, gg, b] = sample(u, v);
        let c = 1 - r;
        let m = 1 - gg;
        let y = 1 - b;
        const k = Math.min(c, m, y) * 0.85;
        c -= k;
        m -= k;
        y -= k;
        return { c, m, y, k };
      };
      drawScreen(g, w, h, cell, INKS.y, (u, v) => sep(u, v).y);
      drawScreen(g, w, h, cell, INKS.c, (u, v) => sep(u, v).c);
      drawScreen(g, w, h, cell, INKS.m, (u, v) => sep(u, v).m);
      drawScreen(g, w, h, cell, INKS.k, (u, v) => sep(u, v).k);
    }
    g.globalCompositeOperation = 'source-over';
  });

  sync();
}
