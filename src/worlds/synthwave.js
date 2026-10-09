import './synthwave.css';
import { esc } from '../lib/dom.js';
import { createRng } from '../lib/random.js';
import { approach, clamp, TAU } from '../lib/math.js';
import { rgba } from '../lib/color.js';

const PALETTES = [
  {
    id: 'sunset', name: 'Sunset',
    sky: ['#120326', '#3b0a54', '#8a1f6b', '#ff5a5f', '#ffb347'],
    sunTop: '#ffe66b', sunBottom: '#ff3fa4', grid: '#ff3fa4', ground: '#0d0221', mountain: '#22083a', edge: '#ff6ad5',
  },
  {
    id: 'midnight', name: 'Midnight',
    sky: ['#020314', '#0b0f3a', '#1d2a7a', '#5b3fbf', '#c25bd6'],
    sunTop: '#f6f7ff', sunBottom: '#8a7dff', grid: '#5cf2ff', ground: '#03041a', mountain: '#0c1036', edge: '#5cf2ff',
  },
  {
    id: 'lagoon', name: 'Lagoon',
    sky: ['#04202b', '#0b4a5c', '#14808a', '#ff8fa3', '#ffd6a5'],
    sunTop: '#fff3b0', sunBottom: '#ff6f91', grid: '#2ee6c0', ground: '#031820', mountain: '#0a2f3a', edge: '#ff8fa3',
  },
];
const GEARS = [
  { id: 'cruise', name: 'Cruise', speed: 0.9 },
  { id: 'overdrive', name: 'Overdrive', speed: 2.8 },
];

export function render({ world }) {
  return `
  <canvas class="w-syn__canvas" aria-hidden="true"></canvas>
  <div class="w-syn__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — picture a striped sun setting over an endless neon grid.</p></div>
  <div class="w-syn__panel">
    <p class="w-syn__kicker">Night drive · side B</p>
    <h1 class="w-syn__title">${esc(world.label)}</h1>
    <p class="ww-caption w-syn__caption">${esc(world.description)}</p>
    <div class="w-syn__controls" role="group" aria-label="Drive controls">
      <button type="button" data-world-action="speed" aria-pressed="false">Gear: <span data-value>Cruise</span></button>
      <button type="button" data-world-action="palette">Sky: <span data-palette-name>Sunset</span></button>
      <button type="button" data-world-action="sun">Sun: <span data-sun-name>High</span></button>
    </div>
    <p class="w-syn__status" data-world-status role="status">Cruise · Sunset sky · sun high</p>
  </div>`;
}

export function mount(root, ctx) {
  const canvas = root.querySelector('.w-syn__canvas');
  const state = { gear: 0, palette: 0, sunLow: false };
  let stars = [];
  let mountains = { left: [], right: [] };
  let speed = GEARS[0].speed;
  let travel = 0;
  let sunPos = 0;

  const view = ctx.canvas(canvas, {
    onResize: ({ w, h }) => {
      const rng = createRng(1984);
      stars = Array.from({ length: Math.round(clamp((w * h) / 9000, 40, 140)) }, () => ({
        x: rng.next() * w,
        y: rng.next() * h * 0.55,
        r: rng.range(0.4, 1.4),
        tw: rng.range(0.3, 1.1),
        ph: rng.next() * TAU,
      }));
      const ridge = (x0, x1, peak) => {
        const pts = [];
        const n = 12;
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const envelope = Math.sin(t * Math.PI);
          pts.push([x0 + (x1 - x0) * t, envelope * peak * rng.range(0.45, 1)]);
        }
        return pts;
      };
      mountains = { left: ridge(-w * 0.05, w * 0.42, h * 0.2), right: ridge(w * 0.58, w * 1.05, h * 0.17) };
    },
  });

  function sync() {
    const p = PALETTES[state.palette];
    const gear = GEARS[state.gear];
    root.dataset.palette = p.id;
    root.querySelector('[data-world-action="speed"] [data-value]').textContent = gear.name;
    root.querySelector('[data-world-action="speed"]').setAttribute('aria-pressed', String(state.gear === 1));
    root.querySelector('[data-palette-name]').textContent = p.name;
    root.querySelector('[data-sun-name]').textContent = state.sunLow ? 'Setting' : 'High';
    ctx.status(`${gear.name} · ${p.name} sky · sun ${state.sunLow ? 'setting into the horizon' : 'high'}`);
  }

  ctx.actions({
    speed() {
      state.gear = (state.gear + 1) % GEARS.length;
      sync();
    },
    palette() {
      state.palette = (state.palette + 1) % PALETTES.length;
      sync();
    },
    sun() {
      state.sunLow = !state.sunLow;
      sync();
    },
  });

  function drawMountains(g, pts, horizon, p) {
    g.beginPath();
    g.moveTo(pts[0][0], horizon);
    for (const [x, y] of pts) g.lineTo(x, horizon - y);
    g.lineTo(pts[pts.length - 1][0], horizon);
    g.closePath();
    g.fillStyle = p.mountain;
    g.fill();
    g.strokeStyle = rgba(p.edge, 0.85);
    g.lineWidth = 1.5;
    g.stroke();
    g.strokeStyle = rgba(p.edge, 0.25);
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 1; i < pts.length - 1; i += 2) {
      g.moveTo(pts[i][0], horizon - pts[i][1]);
      g.lineTo(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * 0.3, horizon);
    }
    g.stroke();
  }

  function draw(time) {
    if (!view) return;
    const { g, w, h } = view;
    const p = PALETTES[state.palette];
    const horizon = Math.round(h * 0.6);
    const cx = w / 2;

    const sky = g.createLinearGradient(0, 0, 0, horizon);
    p.sky.forEach((c, i) => sky.addColorStop(i / (p.sky.length - 1), c));
    g.fillStyle = sky;
    g.fillRect(0, 0, w, horizon);

    for (const s of stars) {
      const a = 0.55 + 0.35 * Math.sin(time * s.tw + s.ph);
      g.fillStyle = `rgba(255,255,255,${(a * (1 - s.y / (h * 0.6))).toFixed(3)})`;
      g.fillRect(s.x, s.y, s.r, s.r);
    }

    const r = Math.min(w, h) * 0.2;
    const sunY = horizon - r * 0.62 + sunPos * r * 0.85;
    const glow = g.createRadialGradient(cx, sunY, r * 0.4, cx, sunY, r * 2.4);
    glow.addColorStop(0, rgba(p.sunBottom, 0.45));
    glow.addColorStop(1, rgba(p.sunBottom, 0));
    g.fillStyle = glow;
    g.fillRect(0, 0, w, horizon);

    g.save();
    g.beginPath();
    g.rect(0, 0, w, horizon);
    g.clip();
    g.beginPath();
    g.arc(cx, sunY, r, 0, TAU);
    g.clip();
    const y0 = sunY - r * 0.05;
    const period = r * 0.2;
    const offset = (time * 9) % period;
    g.beginPath();
    g.rect(cx - r, sunY - r, r * 2, y0 - (sunY - r));
    for (let y = y0 - offset; y < sunY + r; y += period) {
      const t = clamp((y - y0) / (sunY + r - y0), 0, 1);
      const gap = period * (0.1 + 0.55 * t);
      const top = Math.max(y, y0);
      const bottom = y + period - gap;
      if (bottom > top) g.rect(cx - r, top, r * 2, bottom - top);
    }
    g.clip();
    const sunFill = g.createLinearGradient(0, sunY - r, 0, sunY + r);
    sunFill.addColorStop(0, p.sunTop);
    sunFill.addColorStop(1, p.sunBottom);
    g.fillStyle = sunFill;
    g.fillRect(cx - r, sunY - r, r * 2, r * 2);
    g.restore();

    drawMountains(g, mountains.left, horizon, p);
    drawMountains(g, mountains.right, horizon, p);

    g.fillStyle = p.ground;
    g.fillRect(0, horizon, w, h - horizon);
    const hz = g.createLinearGradient(0, horizon - 6, 0, horizon + 30);
    hz.addColorStop(0, rgba(p.grid, 0));
    hz.addColorStop(0.2, rgba(p.grid, 0.55));
    hz.addColorStop(1, rgba(p.grid, 0));
    g.fillStyle = hz;
    g.fillRect(0, horizon - 6, w, 36);

    const depth = h - horizon;
    const frac = travel % 1;
    const lines = (width, alpha) => {
      g.lineWidth = width;
      g.beginPath();
      for (let i = -24; i <= 24; i++) {
        g.moveTo(cx + i * 3, horizon);
        g.lineTo(cx + i * w * 0.075, h);
      }
      for (let k = 0; k < 34; k++) {
        const z = 1 + k - frac;
        if (z <= 0.2) continue;
        const y = horizon + depth / z;
        if (y > h) continue;
        g.moveTo(0, y);
        g.lineTo(w, y);
      }
      g.strokeStyle = rgba(p.grid, alpha);
      g.stroke();
    };
    lines(4, 0.18);
    lines(1.3, 0.9);
    const fog = g.createLinearGradient(0, horizon, 0, horizon + depth * 0.45);
    fog.addColorStop(0, rgba(p.ground, 0.95));
    fog.addColorStop(1, rgba(p.ground, 0));
    g.fillStyle = fog;
    g.fillRect(0, horizon, w, depth * 0.45);

    // Lone coupe, seen from behind.
    const carW = Math.min(w * 0.3, 280);
    const carH = carW * 0.34;
    const sway = Math.sin(time * 0.7) * w * (state.gear ? 0.03 : 0.012);
    const carX = cx + sway - carW / 2;
    const carY = h - carH - h * 0.05;
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.beginPath();
    g.ellipse(cx + sway, carY + carH, carW * 0.6, carH * 0.16, 0, 0, TAU);
    g.fill();
    g.fillStyle = '#16122a';
    g.beginPath();
    g.moveTo(carX + carW * 0.18, carY);
    g.lineTo(carX + carW * 0.82, carY);
    g.lineTo(carX + carW * 0.95, carY + carH * 0.42);
    g.lineTo(carX + carW, carY + carH * 0.88);
    g.lineTo(carX, carY + carH * 0.88);
    g.lineTo(carX + carW * 0.05, carY + carH * 0.42);
    g.closePath();
    g.fill();
    g.strokeStyle = rgba(p.edge, 0.9);
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = rgba(p.sky[2], 0.9);
    g.fillRect(carX + carW * 0.26, carY + carH * 0.08, carW * 0.48, carH * 0.26);
    g.fillStyle = '#ff2a4d';
    g.shadowColor = '#ff2a4d';
    g.shadowBlur = 14;
    g.fillRect(carX + carW * 0.07, carY + carH * 0.5, carW * 0.26, carH * 0.12);
    g.fillRect(carX + carW * 0.67, carY + carH * 0.5, carW * 0.26, carH * 0.12);
    g.shadowBlur = 0;
    g.fillStyle = '#0a0812';
    g.fillRect(carX + carW * 0.06, carY + carH * 0.86, carW * 0.16, carH * 0.16);
    g.fillRect(carX + carW * 0.78, carY + carH * 0.86, carW * 0.16, carH * 0.16);

    if (state.gear === 1) {
      g.strokeStyle = rgba(p.grid, 0.35);
      g.lineWidth = 2;
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const s = (time * 1.6 + i / 6) % 1;
        const side = i % 2 ? 1 : -1;
        const x = cx + side * (w * 0.1 + s * w * 0.45);
        const y = horizon + depth * (0.15 + s * 0.8);
        g.moveTo(x, y);
        g.lineTo(x + side * s * w * 0.08, y + s * depth * 0.12);
      }
      g.stroke();
    }
  }

  ctx.loop(({ dt, time }) => {
    speed = dt ? approach(speed, GEARS[state.gear].speed, 1.6, dt) : speed;
    travel += speed * dt;
    sunPos = dt ? approach(sunPos, state.sunLow ? 1 : 0, 0.9, dt) : state.sunLow ? 1 : 0;
    draw(time);
  });

  sync();
}
