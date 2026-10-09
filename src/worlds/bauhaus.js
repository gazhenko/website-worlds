import './bauhaus.css';
import { esc } from '../lib/dom.js';
import { easeInOutCubic, lerp } from '../lib/math.js';

const ACTS = [
  { id: 'rotation', name: 'I · Rotation' },
  { id: 'balance', name: 'II · Balance' },
  { id: 'assembly', name: 'III · Assembly' },
];
const TEMPOS = [
  { name: 'Andante', k: 1 },
  { name: 'Allegro', k: 2 },
];
const MAPPINGS = [
  { id: 'classic', name: 'Classic (yellow triangle, red square, blue circle)' },
  { id: 'shift', name: 'Shifted (red triangle, blue square, yellow circle)' },
  { id: 'swap', name: 'Swapped (blue triangle, yellow square, red circle)' },
];
const CX = 500;
const CY = 350;

const SHAPES = {
  circle: '<circle r="105" class="w-bau__circle"/>',
  square: '<rect x="-85" y="-85" width="170" height="170" class="w-bau__square"/>',
  triangle: '<polygon points="0,-115 100,58 -100,58" class="w-bau__triangle"/>',
  bar: '<rect x="-190" y="-13" width="380" height="26" class="w-bau__bar"/>',
  dot: '<circle r="34" class="w-bau__dot"/>',
  half: '<path d="M-90 0A90 90 0 0 1 90 0Z" class="w-bau__half"/>',
};

function rotationAct(t) {
  const a = t * 0.45;
  const R = 210;
  const at = (k) => [CX + Math.cos(a + k) * R, CY + Math.sin(a + k) * R * 0.78];
  const [cx, cy] = at(0);
  const [sx, sy] = at((Math.PI * 2) / 3);
  const [tx, ty] = at((Math.PI * 4) / 3);
  return {
    circle: { x: cx, y: cy, r: 0, s: 0.9 },
    square: { x: sx, y: sy, r: t * 30, s: 0.75 },
    triangle: { x: tx, y: ty, r: -t * 40, s: 0.8 },
    bar: { x: CX, y: CY, r: t * 18, s: 0.9 },
    dot: { x: sx + Math.cos(t * 1.4) * 120, y: sy + Math.sin(t * 1.4) * 120, r: 0, s: 1 },
    half: { x: CX, y: 640, r: Math.sin(t * 0.9) * 25, s: 1 },
  };
}

function balanceAct(t) {
  const pivot = { x: CX, y: 520 };
  const theta = Math.sin(t * 0.8) * 0.21;
  const along = Math.sin(t * 0.8 + Math.PI / 2) * 150;
  const barY = pivot.y - 70;
  const point = (d, lift) => [CX + Math.cos(theta) * d - Math.sin(theta) * -lift, barY + Math.sin(theta) * d + Math.cos(theta) * -lift];
  const [cx, cy] = point(along, 13 + 52);
  const [sx, sy] = point(-150, 13 + 64);
  const [dx, dy] = point(175, 13 + 34 + Math.abs(Math.sin(t * 2.4)) * 60);
  return {
    triangle: { x: pivot.x, y: pivot.y + 2, r: 0, s: 0.62 },
    bar: { x: CX, y: barY, r: (theta * 180) / Math.PI, s: 1 },
    circle: { x: cx, y: cy, r: (along / 52) * (180 / Math.PI), s: 0.5 },
    square: { x: sx, y: sy, r: (theta * 180) / Math.PI, s: 0.75 },
    dot: { x: dx, y: dy, r: 0, s: 0.9 },
    half: { x: 820, y: 180 - Math.sin(t * 0.3) * 30, r: 180, s: 0.9 },
  };
}

function assemblyAct(t) {
  const p = (t * 0.13) % 1;
  let k;
  if (p < 0.35) k = easeInOutCubic(p / 0.35);
  else if (p < 0.7) k = 1;
  else k = 1 - easeInOutCubic((p - 0.7) / 0.3);
  const scatter = {
    circle: [170, 170],
    square: [830, 170],
    triangle: [170, 560],
    bar: [500, 650],
    dot: [830, 560],
    half: [500, 70],
  };
  // The assembled figure: hat, head, eye, arms, torso and skirt.
  const target = {
    circle: [500, 200],
    square: [500, 372],
    triangle: [500, 520],
    bar: [500, 330],
    dot: [522, 192],
    half: [500, 128],
  };
  const out = {};
  for (const key of Object.keys(scatter)) {
    const [x0, y0] = scatter[key];
    const [x1, y1] = target[key];
    // Move along the grid: first horizontally, then vertically.
    const kx = Math.min(1, k * 2);
    const ky = Math.max(0, k * 2 - 1);
    out[key] = { x: lerp(x0, x1, kx), y: lerp(y0, y1, ky), r: 0, s: 1 };
  }
  out.circle.s = lerp(1, 0.7, k);
  out.dot.s = lerp(1, 0.32, k);
  out.half.s = lerp(1, 0.8, k);
  out.square.r = lerp(45, 0, k);
  out.triangle.r = lerp(180, 0, k);
  return out;
}

const ACT_FNS = [rotationAct, balanceAct, assemblyAct];

export function render({ world }) {
  const grid = Array.from({ length: 9 }, (_, i) => `M${i * 125} 0V700`).join('') + Array.from({ length: 6 }, (_, i) => `M0 ${i * 140}H1000`).join('');
  return `
  <div class="w-bau__layout">
    <figure class="w-bau__stage">
      <svg viewBox="0 0 1000 700" role="img" aria-label="A geometric ballet: a circle, square, triangle, bar and half-disc moving in Act I, Rotation." data-stage>
        <rect width="1000" height="700" class="w-bau__ground"/>
        <path d="${grid}" class="w-bau__grid"/>
        <text x="28" y="680" class="w-bau__vertical" transform="rotate(-90 28 680)">kontrapunkt der formen</text>
        <text x="960" y="60" text-anchor="end" class="w-bau__act-no" data-act-no>1</text>
        <g data-layer>
          ${['half', 'bar', 'square', 'circle', 'triangle', 'dot'].map((k) => `<g data-shape="${k}">${SHAPES[k]}</g>`).join('')}
        </g>
      </svg>
    </figure>
    <section class="w-bau__panel">
      <p class="w-bau__kicker">bühne · stage 37</p>
      <h1 class="w-bau__title">${esc(world.label)}</h1>
      <p class="ww-caption w-bau__caption">${esc(world.description)}</p>
      <div class="w-bau__controls" role="group" aria-label="Ballet controls">
        <button type="button" data-world-action="act" class="w-bau__btn w-bau__btn--red">Next act <span data-value>II</span></button>
        <button type="button" data-world-action="tempo" class="w-bau__btn w-bau__btn--yellow">Tempo: <span data-tempo>Andante</span></button>
        <button type="button" data-world-action="palette" class="w-bau__btn w-bau__btn--blue">Remap colours</button>
      </div>
      <p class="w-bau__status" data-world-status role="status">Act I · Rotation · andante · classic colours</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const svg = root.querySelector('[data-stage]');
  const shapes = Object.fromEntries(Array.from(root.querySelectorAll('[data-shape]')).map((el) => [el.dataset.shape, el]));
  const actNo = root.querySelector('[data-act-no]');
  const state = { act: 0, tempo: 0, map: 0 };
  const current = {};
  let clock = 0;
  let blend = 1;

  function sync() {
    const act = ACTS[state.act];
    root.dataset.map = MAPPINGS[state.map].id;
    root.querySelector('[data-world-action="act"] [data-value]').textContent = ['I', 'II', 'III'][(state.act + 1) % ACTS.length];
    root.querySelector('[data-tempo]').textContent = TEMPOS[state.tempo].name;
    actNo.textContent = String(state.act + 1);
    svg.setAttribute('aria-label', `A geometric ballet: a circle, square, triangle, bar and half-disc moving in Act ${act.name}.`);
    ctx.status(`Act ${act.name} · ${TEMPOS[state.tempo].name.toLowerCase()} · ${MAPPINGS[state.map].id} colours`);
  }

  ctx.actions({
    act() {
      state.act = (state.act + 1) % ACTS.length;
      blend = ctx.running ? 0 : 1;
      sync();
    },
    tempo() {
      state.tempo = (state.tempo + 1) % TEMPOS.length;
      sync();
    },
    palette() {
      state.map = (state.map + 1) % MAPPINGS.length;
      sync();
    },
  });

  ctx.loop(({ dt, running }) => {
    clock += dt * TEMPOS[state.tempo].k;
    blend = Math.min(1, blend + dt * 1.2);
    const t = running ? clock : 2.4;
    const pose = ACT_FNS[state.act](t);
    const k = easeInOutCubic(blend);
    for (const [key, el] of Object.entries(shapes)) {
      const p = pose[key];
      const prev = current[key] ?? p;
      const now = blend >= 1 ? p : { x: lerp(prev.x, p.x, k), y: lerp(prev.y, p.y, k), r: lerp(prev.r, p.r, k), s: lerp(prev.s, p.s, k) };
      if (blend >= 1) current[key] = p;
      el.setAttribute('transform', `translate(${now.x.toFixed(1)} ${now.y.toFixed(1)}) rotate(${now.r.toFixed(2)}) scale(${now.s.toFixed(3)})`);
    }
  });

  sync();
}
