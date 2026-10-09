import './cyberpunk.css';
import { esc } from '../lib/dom.js';
import { createRng } from '../lib/random.js';
import { clamp, TAU } from '../lib/math.js';
import { rgba } from '../lib/color.js';

const WEATHER = [
  { id: 'drizzle', name: 'Drizzle', density: 0.6 },
  { id: 'downpour', name: 'Downpour', density: 1.6 },
  { id: 'dry', name: 'Dry', density: 0 },
];
const DISTRICTS = [
  { id: 'market', name: 'Market', a: '#ff2bd6', b: '#2bf0ff', c: '#ffd23f', sky: ['#07061a', '#24103e', '#4a1550'] },
  { id: 'harbour', name: 'Harbour', a: '#ffb02e', b: '#19e3c1', c: '#e6f7ff', sky: ['#020b14', '#0b2433', '#173b45'] },
  { id: 'uptown', name: 'Uptown', a: '#9b5cff', b: '#b6ff3a', c: '#6fc3ff', sky: ['#05041a', '#14123d', '#2a1e5c'] },
];
const LOG = [
  'handshake district/9-north ........ ok',
  'tram 44 delayed — umbrellas advised',
  'noodle stand #12 queue: 7 people',
  'rain sensor array: 312 mm/h peak',
  'billboard sync drift 0.02s · corrected',
  'night market opens in 00:14:07',
  'courier drone 7A rerouted via canal',
  'public heating vents: online',
  'lost cat “Static” seen near Optik',
  'skybridge 3 lighting: warm mode',
];

export function render({ world }) {
  return `
  <canvas class="w-cp__canvas" aria-hidden="true"></canvas>
  <div class="w-cp__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — picture neon signs humming over a rain-soaked street.</p></div>
  <div class="w-cp__terminal" data-terminal hidden aria-label="Street terminal feed">
    <p class="w-cp__term-head">SECTOR-9 // public terminal</p>
    <ol class="w-cp__term-lines" data-lines></ol>
    <p class="w-cp__term-prompt" aria-hidden="true">&gt; <span class="w-cp__cursor">_</span></p>
  </div>
  <div class="w-cp__panel">
    <p class="w-cp__kicker">// sector 9 · 23:58 · humidity 98%</p>
    <h1 class="w-cp__title" data-text="${esc(world.label)}">${esc(world.label)}</h1>
    <p class="ww-caption w-cp__caption">${esc(world.description)}</p>
    <div class="w-cp__controls" role="group" aria-label="Street controls">
      <button type="button" data-world-action="rain">Weather: <span data-value>Drizzle</span></button>
      <button type="button" data-world-action="district">District: <span data-district>Market</span></button>
      <button type="button" data-world-action="terminal" aria-pressed="false">Open terminal</button>
    </div>
    <p class="w-cp__status" data-world-status role="status">Drizzle · Market district · terminal closed</p>
  </div>`;
}

export function mount(root, ctx) {
  const canvas = root.querySelector('.w-cp__canvas');
  const terminal = root.querySelector('[data-terminal]');
  const linesEl = root.querySelector('[data-lines]');
  const state = { weather: 0, district: 0, terminal: false, log: 0 };
  let scene = null;
  let signs = null;
  let drops = [];
  let splashes = [];

  function layer(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w));
    c.height = Math.max(1, Math.round(h));
    return c;
  }

  function buildScene(w, h) {
    const d = DISTRICTS[state.district];
    const rng = createRng(2077);
    scene = layer(w, h);
    const g = scene.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, h * 0.62);
    d.sky.forEach((c, i) => sky.addColorStop(i / (d.sky.length - 1), c));
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);

    // far skyline between the street walls
    const top = h * 0.62;
    for (let x = w * 0.3; x < w * 0.7; ) {
      const bw = rng.range(w * 0.025, w * 0.06);
      const bh = rng.range(h * 0.18, h * 0.5);
      g.fillStyle = '#0c0a1c';
      g.fillRect(x, top - bh, bw, bh);
      for (let wy = top - bh + 6; wy < top - 4; wy += 7) {
        for (let wx = x + 3; wx < x + bw - 3; wx += 6) {
          if (rng.chance(0.28)) {
            g.fillStyle = rng.chance(0.7) ? 'rgba(255,210,140,0.55)' : rgba(d.b, 0.5);
            g.fillRect(wx, wy, 2, 3);
          }
        }
      }
      x += bw + rng.range(1, 6);
    }

    const wall = (side) => {
      const s = side < 0 ? 0 : w;
      const inner = side < 0 ? w * 0.34 : w * 0.66;
      g.fillStyle = '#0a0816';
      g.beginPath();
      g.moveTo(s, 0);
      g.lineTo(inner, h * 0.16);
      g.lineTo(inner, h * 0.62);
      g.lineTo(s, h * 0.86);
      g.closePath();
      g.fill();
      // Window grid in perspective: t runs from the outer edge (0) to the inner edge (1).
      const topAt = (t) => h * 0.16 * t;
      const botAt = (t) => h * 0.86 - (h * 0.86 - h * 0.62) * t;
      for (let row = 0; row < 14; row++) {
        for (let col = 0; col < 6; col++) {
          if (!rng.chance(0.35)) continue;
          const t0 = col / 6;
          const t1 = (col + 0.55) / 6;
          const x0 = s + (inner - s) * t0;
          const x1 = s + (inner - s) * t1;
          const yA0 = topAt(t0) + (botAt(t0) - topAt(t0)) * (row / 14 + 0.02);
          const yA1 = topAt(t0) + (botAt(t0) - topAt(t0)) * ((row + 0.5) / 14);
          const yB0 = topAt(t1) + (botAt(t1) - topAt(t1)) * (row / 14 + 0.02);
          const yB1 = topAt(t1) + (botAt(t1) - topAt(t1)) * ((row + 0.5) / 14);
          g.fillStyle = rng.chance(0.75) ? 'rgba(255,196,120,0.35)' : rgba(d.a, 0.3);
          g.beginPath();
          g.moveTo(x0, yA0);
          g.lineTo(x1, yB0);
          g.lineTo(x1, yB1);
          g.lineTo(x0, yA1);
          g.closePath();
          g.fill();
        }
      }
    };
    wall(-1);
    wall(1);

    const street = g.createLinearGradient(0, h * 0.62, 0, h);
    street.addColorStop(0, '#0d0b1c');
    street.addColorStop(1, '#05040c');
    g.fillStyle = street;
    g.beginPath();
    g.moveTo(0, h * 0.86);
    g.lineTo(w * 0.34, h * 0.62);
    g.lineTo(w * 0.66, h * 0.62);
    g.lineTo(w, h * 0.86);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.08)';
    g.lineWidth = 2;
    g.setLineDash([18, 22]);
    g.beginPath();
    g.moveTo(w * 0.5, h * 0.63);
    g.lineTo(w * 0.5, h);
    g.stroke();
    g.setLineDash([]);

    signs = layer(w, h);
    const s = signs.getContext('2d');
    const sign = (x, y, sw, sh, color, text, vertical = false, size = 0.03) => {
      s.save();
      s.shadowColor = color;
      s.shadowBlur = 18;
      s.strokeStyle = color;
      s.lineWidth = 3;
      s.fillStyle = 'rgba(10,6,20,0.75)';
      s.beginPath();
      s.roundRect ? s.roundRect(x, y, sw, sh, 6) : s.rect(x, y, sw, sh);
      s.fill();
      s.stroke();
      s.fillStyle = color;
      const fs = Math.max(10, Math.min(w, h) * size);
      s.font = `700 ${fs}px "Arial Narrow", "Helvetica Neue", Arial, sans-serif`;
      s.textAlign = 'center';
      s.textBaseline = 'middle';
      if (vertical) {
        const chars = Array.from(text);
        const step = sh / (chars.length + 1);
        chars.forEach((ch, i) => s.fillText(ch, x + sw / 2, y + step * (i + 1)));
      } else {
        s.fillText(text, x + sw / 2, y + sh / 2 + 1);
      }
      s.restore();
    };
    const u = Math.min(w, h);
    sign(w * 0.06, h * 0.12, u * 0.07, h * 0.36, d.a, 'NOODLE24', true);
    sign(w * 0.17, h * 0.3, u * 0.05, h * 0.2, d.b, 'BAR', true, 0.026);
    sign(w * 0.7, h * 0.22, u * 0.2, u * 0.06, d.b, 'OPTIK', false, 0.034);
    sign(w * 0.86, h * 0.08, u * 0.07, h * 0.32, d.c, 'HOTEL∞', true);
    sign(w * 0.41, h * 0.32, u * 0.12, u * 0.035, d.a, 'DATA BAR', false, 0.02);
    sign(w * 0.53, h * 0.24, u * 0.09, u * 0.03, d.c, 'SLEEP', false, 0.018);
  }

  const view = ctx.canvas(canvas, {
    maxDpr: 1.5,
    onResize: ({ w, h }) => {
      buildScene(w, h);
      resetRain(w, h);
    },
  });

  function resetRain(w, h) {
    const count = Math.round(Math.min(320, clamp((w * h) / 5200, 60, 220) * WEATHER[state.weather].density));
    drops = Array.from({ length: count }, () => ({
      x: Math.random() * w * 1.2,
      y: Math.random() * h,
      len: 10 + Math.random() * 18,
      v: 700 + Math.random() * 500,
    }));
    splashes = [];
  }

  function pushLog() {
    const li = document.createElement('li');
    li.textContent = `[${new Date().toTimeString().slice(0, 8)}] ${LOG[state.log % LOG.length]}`;
    state.log += 1;
    linesEl.append(li);
    while (linesEl.children.length > 8) linesEl.firstElementChild.remove();
  }

  function sync() {
    const weather = WEATHER[state.weather];
    const d = DISTRICTS[state.district];
    root.dataset.district = d.id;
    root.querySelector('[data-world-action="rain"] [data-value]').textContent = weather.name;
    root.querySelector('[data-district]').textContent = d.name;
    const term = root.querySelector('[data-world-action="terminal"]');
    term.setAttribute('aria-pressed', String(state.terminal));
    term.textContent = state.terminal ? 'Close terminal' : 'Open terminal';
    terminal.hidden = !state.terminal;
    ctx.status(`${weather.name} · ${d.name} district · terminal ${state.terminal ? 'open' : 'closed'}`);
  }

  ctx.actions({
    rain() {
      state.weather = (state.weather + 1) % WEATHER.length;
      if (view) resetRain(view.w, view.h);
      sync();
    },
    district() {
      state.district = (state.district + 1) % DISTRICTS.length;
      if (view) buildScene(view.w, view.h);
      sync();
    },
    terminal() {
      state.terminal = !state.terminal;
      if (state.terminal && linesEl.children.length === 0) for (let i = 0; i < 4; i++) pushLog();
      sync();
    },
  });

  ctx.every(1400, () => {
    if (state.terminal) pushLog();
  });

  ctx.loop(({ dt, time }) => {
    if (!view || !scene) return;
    const { g, w, h } = view;
    const d = DISTRICTS[state.district];
    g.drawImage(scene, 0, 0, w, h);

    const breathe = 0.86 + 0.12 * Math.sin(time * 0.7);
    g.globalAlpha = breathe;
    g.drawImage(signs, 0, 0, w, h);

    // reflections on the wet street
    g.save();
    g.beginPath();
    g.moveTo(0, h * 0.86);
    g.lineTo(w * 0.34, h * 0.62);
    g.lineTo(w * 0.66, h * 0.62);
    g.lineTo(w, h * 0.86);
    g.lineTo(w, h);
    g.lineTo(0, h);
    g.closePath();
    g.clip();
    const wet = state.weather === 2 ? 0.12 : 0.28;
    g.globalAlpha = wet * breathe;
    g.translate(0, h * 1.36);
    g.scale(1, -0.55);
    g.drawImage(signs, 0, 0, w, h);
    g.translate(3, 0);
    g.globalAlpha = wet * 0.5;
    g.drawImage(signs, 0, 0, w, h);
    g.restore();
    g.globalAlpha = 1;

    // hover car crossing the canyon
    const cycle = (time * 0.07) % 1;
    const carX = -w * 0.2 + cycle * w * 1.4;
    const carY = h * 0.44 + Math.sin(time * 1.3) * 4;
    const cw = Math.min(w, h) * 0.12;
    g.fillStyle = '#05040c';
    g.beginPath();
    g.moveTo(carX, carY);
    g.lineTo(carX + cw * 0.25, carY - cw * 0.18);
    g.lineTo(carX + cw * 0.8, carY - cw * 0.18);
    g.lineTo(carX + cw, carY);
    g.closePath();
    g.fill();
    g.fillStyle = rgba(d.b, 0.7);
    g.fillRect(carX + cw * 0.08, carY, cw * 0.84, 2);
    g.fillStyle = '#ff3355';
    g.fillRect(carX - 2, carY - cw * 0.08, 4, 3);
    g.fillStyle = rgba(d.b, 0.12);
    g.beginPath();
    g.ellipse(carX + cw / 2, carY + cw * 0.18, cw * 0.5, cw * 0.06, 0, 0, TAU);
    g.fill();

    // rain
    if (drops.length) {
      const wind = 0.18;
      g.strokeStyle = 'rgba(190,210,255,0.35)';
      g.lineWidth = 1;
      g.beginPath();
      for (const r of drops) {
        r.y += r.v * dt;
        r.x -= r.v * wind * dt;
        if (r.y > h) {
          if (r.y - r.v * dt <= h && splashes.length < 60 && Math.random() < 0.4) {
            splashes.push({ x: r.x, y: h * (0.8 + Math.random() * 0.2), life: 0.25 });
          }
          r.y = -r.len - Math.random() * 40;
          r.x = Math.random() * w * 1.2;
        }
        g.moveTo(r.x, r.y);
        g.lineTo(r.x + r.len * wind, r.y - r.len);
      }
      g.stroke();
      g.strokeStyle = 'rgba(190,210,255,0.4)';
      g.beginPath();
      splashes = splashes.filter((s) => (s.life -= dt) > 0);
      for (const s of splashes) {
        const k = 1 - s.life / 0.25;
        g.moveTo(s.x + 6 * k, s.y);
        g.ellipse(s.x, s.y, 6 * k, 1.6 * k, 0, 0, TAU);
      }
      g.stroke();
    }

    // haze over everything
    const haze = g.createLinearGradient(0, h * 0.4, 0, h);
    haze.addColorStop(0, rgba(d.a, 0));
    haze.addColorStop(1, rgba(d.a, 0.08));
    g.fillStyle = haze;
    g.fillRect(0, 0, w, h);
  });

  sync();
}
