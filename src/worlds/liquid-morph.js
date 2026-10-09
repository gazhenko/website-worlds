import './liquid-morph.css';
import { esc } from '../lib/dom.js';
import { approach, TAU } from '../lib/math.js';
import { noise3 } from '../lib/noise.js';
import { smoothClosedPath, SVG_NS } from '../lib/svg.js';

const VISCOSITIES = [
  { id: 'water', name: 'Water', speed: 1.3, amp: 0.13, stops: ['#9dffe8', '#2ee6c0', '#2a6cf5'] },
  { id: 'syrup', name: 'Syrup', speed: 0.5, amp: 0.2, stops: ['#ffe29a', '#ff9f1c', '#c2410c'] },
  { id: 'mercury', name: 'Mercury', speed: 0.85, amp: 0.08, stops: ['#ffffff', '#aeb8c8', '#4b566a'] },
];
const SATELLITES = [
  { r: 40, orbit: 0.9, speed: 0.5, ph: 0 },
  { r: 30, orbit: 1.05, speed: -0.65, ph: 1.6 },
  { r: 44, orbit: 0.95, speed: 0.38, ph: 3.1 },
  { r: 26, orbit: 1.15, speed: -0.42, ph: 4.4 },
  { r: 34, orbit: 1.0, speed: 0.58, ph: 5.5 },
];
const C = { x: 300, y: 310 };
const BASE_R = 118;
const MAX_DROPS = 6;

export function render({ world }) {
  return `
  <div class="w-liq__layout">
    <div class="w-liq__text">
      <p class="w-liq__kicker">viscous study · 24°C</p>
      <h1 class="w-liq__title">${esc(world.label)}</h1>
      <p class="ww-caption w-liq__caption">${esc(world.description)}</p>
      <div class="w-liq__controls" role="group" aria-label="Liquid controls">
        <button type="button" data-world-action="viscosity">Viscosity: <span data-value>Water</span></button>
        <button type="button" data-world-action="drop">Add a drop</button>
        <button type="button" data-world-action="split" aria-pressed="false">Split apart</button>
      </div>
      <p class="w-liq__status" data-world-status role="status">Water · merged · no drops falling</p>
    </div>
    <div class="w-liq__stage">
      <svg class="w-liq__svg" viewBox="0 0 600 600" role="img" aria-label="Glossy liquid blobs stretching, merging and splitting; a droplet follows your pointer into the pool.">
        <defs>
          <linearGradient id="w-liq-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" data-stop="0" stop-color="#9dffe8"/><stop offset=".55" data-stop="1" stop-color="#2ee6c0"/><stop offset="1" data-stop="2" stop-color="#2a6cf5"/>
          </linearGradient>
          <filter id="w-liq-goo" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="13" result="blur"/>
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="goo"/>
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
        <ellipse cx="300" cy="520" rx="210" ry="26" class="w-liq__shadow"/>
        <g filter="url(#w-liq-goo)" fill="url(#w-liq-grad)">
          <path data-blob d=""/>
          ${SATELLITES.map((s, i) => `<circle data-sat="${i}" r="${s.r}" cx="${C.x}" cy="${C.y}"/>`).join('')}
          <g data-drops></g>
          <circle data-finger r="0" cx="${C.x}" cy="${C.y}"/>
        </g>
        <g class="w-liq__gloss" aria-hidden="true">
          <ellipse data-gloss rx="46" ry="20" cx="250" cy="250" transform="rotate(-30 250 250)"/>
          <ellipse data-gloss-small rx="12" ry="7" cx="350" cy="230"/>
        </g>
      </svg>
    </div>
  </div>`;
}

export function mount(root, ctx) {
  const svg = root.querySelector('.w-liq__svg');
  const blob = root.querySelector('[data-blob]');
  const sats = SATELLITES.map((s, i) => ({ ...s, el: root.querySelector(`[data-sat="${i}"]`) }));
  const dropsGroup = root.querySelector('[data-drops]');
  const finger = root.querySelector('[data-finger]');
  const gloss = root.querySelector('[data-gloss]');
  const glossSmall = root.querySelector('[data-gloss-small]');
  const stops = [0, 1, 2].map((i) => root.querySelector(`[data-stop="${i}"]`));
  const state = { viscosity: 0, split: false };
  const drops = [];
  const fingerState = { x: C.x, y: C.y, r: 0, tx: C.x, ty: C.y, active: 0 };
  let spread = 0;
  let flow = 0;

  function sync() {
    const v = VISCOSITIES[state.viscosity];
    root.dataset.viscosity = v.id;
    v.stops.forEach((c, i) => stops[i].setAttribute('stop-color', c));
    root.querySelector('[data-world-action="viscosity"] [data-value]').textContent = v.name;
    const split = root.querySelector('[data-world-action="split"]');
    split.setAttribute('aria-pressed', String(state.split));
    split.textContent = state.split ? 'Merge together' : 'Split apart';
    const falling = drops.length ? `${drops.length} drop${drops.length === 1 ? '' : 's'} falling` : 'no drops falling';
    ctx.status(`${v.name} · ${state.split ? 'split into satellites' : 'merged'} · ${falling}`);
  }

  function addDrop() {
    if (drops.length >= MAX_DROPS) return;
    const el = document.createElementNS(SVG_NS, 'circle');
    const r = 18 + Math.random() * 14;
    el.setAttribute('r', r.toFixed(1));
    dropsGroup.append(el);
    const drop = { el, x: C.x + (Math.random() - 0.5) * 160, y: -30, vy: 0, r, life: 1 };
    if (!ctx.running) drop.y = C.y - BASE_R - r * 0.6;
    drops.push(drop);
  }

  ctx.actions({
    viscosity() {
      state.viscosity = (state.viscosity + 1) % VISCOSITIES.length;
      sync();
    },
    drop() {
      addDrop();
      sync();
    },
    split() {
      state.split = !state.split;
      sync();
    },
  });

  const toLocal = (event) => {
    const rect = svg.getBoundingClientRect();
    return [((event.clientX - rect.left) / rect.width) * 600, ((event.clientY - rect.top) / rect.height) * 600];
  };
  ctx.on(svg, 'pointermove', (event) => {
    [fingerState.tx, fingerState.ty] = toLocal(event);
    fingerState.active = 2;
  });
  ctx.on(svg, 'pointerleave', () => {
    fingerState.active = 0;
  });

  ctx.loop(({ dt, running }) => {
    const v = VISCOSITIES[state.viscosity];
    flow += dt * v.speed;
    spread = running ? approach(spread, state.split ? 1 : 0, 1.4, dt) : state.split ? 1 : 0;

    const radius = BASE_R * (1 - spread * 0.3);
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU;
      const n = noise3(1.6 + Math.cos(a) * 1.1, 1.6 + Math.sin(a) * 1.1, flow * 0.7);
      const r = radius * (1 + (n - 0.5) * 2 * v.amp * 1.8);
      pts.push([C.x + Math.cos(a) * r, C.y + Math.sin(a) * r * 0.94]);
    }
    blob.setAttribute('d', smoothClosedPath(pts));

    sats.forEach((s) => {
      const orbit = BASE_R * (s.orbit * (0.82 + spread * 1.05));
      const a = s.ph + flow * s.speed;
      const wob = Math.sin(flow * 2 + s.ph) * 10;
      s.el.setAttribute('cx', (C.x + Math.cos(a) * (orbit + wob)).toFixed(1));
      s.el.setAttribute('cy', (C.y + Math.sin(a) * (orbit + wob) * 0.9).toFixed(1));
    });

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      if (running) {
        d.vy += 520 * dt * (v.id === 'syrup' ? 0.55 : 1);
        d.y += d.vy * dt;
        d.x = approach(d.x, C.x, 0.6, dt);
        if (d.y > C.y - radius * 0.3) {
          d.life -= dt * 1.4;
          d.y = Math.min(d.y, C.y);
        }
      }
      d.el.setAttribute('cx', d.x.toFixed(1));
      d.el.setAttribute('cy', d.y.toFixed(1));
      d.el.setAttribute('r', Math.max(0, d.r * d.life).toFixed(1));
      if (d.life <= 0) {
        d.el.remove();
        drops.splice(i, 1);
        sync();
      }
    }

    fingerState.active = Math.max(0, fingerState.active - dt);
    const targetR = fingerState.active > 0 ? 30 : 0;
    const tx = fingerState.active > 0 ? fingerState.tx : C.x;
    const ty = fingerState.active > 0 ? fingerState.ty : C.y;
    fingerState.x = running ? approach(fingerState.x, tx, 9, dt) : tx;
    fingerState.y = running ? approach(fingerState.y, ty, 9, dt) : ty;
    fingerState.r = running ? approach(fingerState.r, targetR, 6, dt) : targetR;
    finger.setAttribute('cx', fingerState.x.toFixed(1));
    finger.setAttribute('cy', fingerState.y.toFixed(1));
    finger.setAttribute('r', fingerState.r.toFixed(1));

    const gx = C.x - radius * 0.42;
    const gy = C.y - radius * 0.5;
    gloss.setAttribute('cx', gx.toFixed(1));
    gloss.setAttribute('cy', gy.toFixed(1));
    gloss.setAttribute('transform', `rotate(-30 ${gx.toFixed(1)} ${gy.toFixed(1)})`);
    glossSmall.setAttribute('cx', (C.x + radius * 0.3).toFixed(1));
    glossSmall.setAttribute('cy', (C.y - radius * 0.62).toFixed(1));
  });

  sync();
}
