import './ethereal.css';
import { esc } from '../lib/dom.js';
import { approach, clamp, TAU } from '../lib/math.js';

const HOURS = [
  { id: 'dawn', name: 'Dawn', sky: ['#e3dcff', '#fbe9f1', '#e2f6ef'], mist: '255,255,255', mote: '255,250,240', ray: '255,255,255' },
  { id: 'dusk', name: 'Dusk', sky: ['#b39ad6', '#efbcd6', '#fbe3d2'], mist: '255,226,236', mote: '255,236,214', ray: '255,214,226' },
  { id: 'moonlit', name: 'Moonlit', sky: ['#0d1030', '#2b3366', '#5b6aa6'], mist: '170,186,255', mote: '220,230,255', ray: '190,205,255' },
];
const BLOOMS = [
  { id: 'soft', name: 'Soft', size: 1, alpha: 0.55 },
  { id: 'radiant', name: 'Radiant', size: 1.9, alpha: 0.85 },
];

export function render({ world }) {
  return `
  <canvas class="w-eth__canvas" aria-hidden="true"></canvas>
  <div class="w-eth__fallback" data-canvas-fallback hidden><p>Canvas is unavailable — imagine pale mist and slow light rising like breath.</p></div>
  <div class="w-eth__veil">
    <p class="w-eth__kicker">a weightless hour</p>
    <h1 class="w-eth__title">${esc(world.label)}</h1>
    <p class="ww-caption w-eth__caption">${esc(world.description)}</p>
    <div class="w-eth__controls" role="group" aria-label="Atmosphere controls">
      <button type="button" data-world-action="bloom" aria-pressed="false">Bloom · <span data-value>Soft</span></button>
      <button type="button" data-world-action="gather" aria-pressed="false">Gather the light</button>
      <button type="button" data-world-action="hour">Hour · <span data-hour>Dawn</span></button>
    </div>
    <p class="w-eth__status" data-world-status role="status">Dawn · soft bloom · motes drifting</p>
  </div>`;
}

export function mount(root, ctx) {
  const canvas = root.querySelector('.w-eth__canvas');
  const state = { hour: 0, bloom: 0, gather: false };
  let motes = [];
  let mists = [];
  let sprite = null;
  let glow = 1;

  function makeSprite() {
    sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const s = sprite.getContext('2d');
    const grad = s.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.65)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    s.fillStyle = grad;
    s.fillRect(0, 0, 64, 64);
  }

  const view = ctx.canvas(canvas, {
    maxDpr: 1.5,
    onResize: ({ w, h }) => {
      const count = Math.round(clamp((w * h) / 14000, 36, 90));
      motes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 2 + Math.random() * 7,
        vy: 6 + Math.random() * 16,
        sway: 10 + Math.random() * 26,
        ph: Math.random() * TAU,
        slot: (i / count) * TAU,
        gx: 0,
        gy: 0,
      }));
      mists = Array.from({ length: 6 }, (_, i) => ({
        x: Math.random() * w,
        y: h * (0.25 + (i / 6) * 0.7),
        rx: w * (0.35 + Math.random() * 0.3),
        ry: h * (0.08 + Math.random() * 0.08),
        speed: 6 + Math.random() * 10,
      }));
    },
  });
  if (view) makeSprite();

  function sync() {
    const hour = HOURS[state.hour];
    root.dataset.hour = hour.id;
    root.querySelector('[data-world-action="bloom"] [data-value]').textContent = BLOOMS[state.bloom].name;
    root.querySelector('[data-world-action="bloom"]').setAttribute('aria-pressed', String(state.bloom === 1));
    root.querySelector('[data-hour]').textContent = hour.name;
    const gather = root.querySelector('[data-world-action="gather"]');
    gather.setAttribute('aria-pressed', String(state.gather));
    gather.textContent = state.gather ? 'Release the light' : 'Gather the light';
    ctx.status(`${hour.name} · ${BLOOMS[state.bloom].name.toLowerCase()} bloom · motes ${state.gather ? 'gathered into a halo' : 'drifting'}`);
  }

  ctx.actions({
    bloom() {
      state.bloom = (state.bloom + 1) % BLOOMS.length;
      sync();
    },
    gather() {
      state.gather = !state.gather;
      sync();
    },
    hour() {
      state.hour = (state.hour + 1) % HOURS.length;
      sync();
    },
  });

  ctx.loop(({ dt, time, running }) => {
    if (!view) return;
    const { g, w, h } = view;
    const hour = HOURS[state.hour];
    const bloom = BLOOMS[state.bloom];
    glow = dt ? approach(glow, bloom.size, 2, dt) : bloom.size;

    const sky = g.createLinearGradient(0, 0, 0, h);
    hour.sky.forEach((c, i) => sky.addColorStop(i / (hour.sky.length - 1), c));
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);

    for (let i = 0; i < 3; i++) {
      const sway = Math.sin(time * 0.15 + i * 2) * 0.08;
      const x = w * (0.2 + i * 0.3);
      g.save();
      g.translate(x, -20);
      g.rotate(0.25 + sway - i * 0.12);
      const ray = g.createLinearGradient(0, 0, 0, h * 1.1);
      ray.addColorStop(0, `rgba(${hour.ray},0.32)`);
      ray.addColorStop(1, `rgba(${hour.ray},0)`);
      g.fillStyle = ray;
      g.beginPath();
      g.moveTo(-w * 0.02, 0);
      g.lineTo(w * 0.02, 0);
      g.lineTo(w * 0.1, h * 1.1);
      g.lineTo(-w * 0.1, h * 1.1);
      g.closePath();
      g.fill();
      g.restore();
    }

    for (const m of mists) {
      m.x += m.speed * dt;
      if (m.x - m.rx > w) m.x = -m.rx;
      const grad = g.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.rx);
      grad.addColorStop(0, `rgba(${hour.mist},0.34)`);
      grad.addColorStop(1, `rgba(${hour.mist},0)`);
      g.save();
      g.translate(m.x, m.y);
      g.scale(1, m.ry / m.rx);
      g.translate(-m.x, -m.y);
      g.fillStyle = grad;
      g.fillRect(m.x - m.rx, m.y - m.rx, m.rx * 2, m.rx * 2);
      g.restore();
    }

    const cx = w / 2;
    const cy = h * 0.5;
    const ring = Math.min(w, h) * 0.24;
    g.globalCompositeOperation = 'lighter';
    for (const m of motes) {
      if (state.gather) {
        const a = m.slot + time * 0.2;
        const tx = cx + Math.cos(a) * ring * (1 + Math.sin(m.ph) * 0.06);
        const ty = cy + Math.sin(a) * ring * 0.9;
        if (running) {
          m.x = approach(m.x, tx, 1.6, dt);
          m.y = approach(m.y, ty, 1.6, dt);
        } else {
          m.x = tx;
          m.y = ty;
        }
      } else if (dt) {
        m.y -= m.vy * dt;
        m.x += Math.sin(time * 0.5 + m.ph) * m.sway * dt * 0.4;
        if (m.y < -20) {
          m.y = h + 20;
          m.x = Math.random() * w;
        }
      }
      const size = m.r * 4 * glow;
      g.globalAlpha = bloom.alpha * (0.55 + 0.45 * Math.sin(time * 0.8 + m.ph));
      g.drawImage(sprite, m.x - size / 2, m.y - size / 2, size, size);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  });

  sync();
}
