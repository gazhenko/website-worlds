import './minimalism.css';
import { esc } from '../lib/dom.js';
import { easeInOutCubic, lerp, TAU } from '../lib/math.js';

const N = 180;
const CX = 500;
const CY = 330;
const FORMS = ['circle', 'square', 'triangle', 'line'];
const FORM_NAMES = { circle: 'Circle', square: 'Square', triangle: 'Triangle', line: 'Line' };
const TEMPOS = [
  { name: 'Slow', period: 14 },
  { name: 'Slower', period: 28 },
  { name: 'Brisk', period: 6 },
];
const TRAIL_SEGMENTS = 14;

function polygonPoints(vertices) {
  const edges = vertices.map((v, i) => {
    const w = vertices[(i + 1) % vertices.length];
    return { v, w, len: Math.hypot(w[0] - v[0], w[1] - v[1]) };
  });
  const total = edges.reduce((s, e) => s + e.len, 0);
  const pts = [];
  for (let i = 0; i < N; i++) {
    let d = (i / N) * total;
    for (const e of edges) {
      if (d <= e.len) {
        const t = d / e.len;
        pts.push([lerp(e.v[0], e.w[0], t), lerp(e.v[1], e.w[1], t)]);
        break;
      }
      d -= e.len;
    }
  }
  return pts;
}

function formPoints(form) {
  if (form === 'circle') {
    return Array.from({ length: N }, (_, i) => {
      const a = (i / N) * TAU - Math.PI / 2;
      return [CX + Math.cos(a) * 200, CY + Math.sin(a) * 200];
    });
  }
  if (form === 'square') {
    return polygonPoints([[CX, CY - 180], [CX + 180, CY - 180], [CX + 180, CY + 180], [CX - 180, CY + 180], [CX - 180, CY - 180]]);
  }
  if (form === 'triangle') {
    const v = [-90, 30, 150].map((deg) => {
      const a = (deg * Math.PI) / 180;
      return [CX + Math.cos(a) * 230, CY + 30 + Math.sin(a) * 230];
    });
    return polygonPoints(v);
  }
  return Array.from({ length: N }, (_, i) => {
    const u = i / N;
    const t = u < 0.5 ? u * 2 : 2 - u * 2;
    return [CX - 260 + t * 520, CY];
  });
}

const toPath = (pts) => `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;

function pointAt(pts, u) {
  const f = (((u % 1) + 1) % 1) * pts.length;
  const i = Math.floor(f);
  const a = pts[i % pts.length];
  const b = pts[(i + 1) % pts.length];
  const t = f - i;
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

export function render({ world }) {
  const initial = formPoints('circle');
  const trail = Array.from({ length: TRAIL_SEGMENTS }, (_, i) => `<path class="w-min__trail" style="opacity:${((i + 1) / TRAIL_SEGMENTS) * 0.5}"/>`).join('');
  return `
  <svg class="w-min__stage" viewBox="0 0 1000 660" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A single black dot travels slowly along a hairline form on a white field.">
    <g class="w-min__breath" data-breath>
      <path class="w-min__form" data-form d="${toPath(initial)}"/>
      <g class="w-min__trails" data-trails>${trail}</g>
      <circle class="w-min__dot" data-dot r="7" cx="${CX}" cy="${CY - 200}"/>
    </g>
  </svg>
  <div class="w-min__text">
    <h1 class="w-min__title">${esc(world.label)}</h1>
    <p class="ww-caption w-min__caption">${esc(world.description)}</p>
  </div>
  <div class="w-min__panel">
    <div class="w-min__controls" role="group" aria-label="Object controls">
      <button type="button" data-world-action="form">Form — <span data-value>Circle</span></button>
      <button type="button" data-world-action="tempo">Tempo — <span data-tempo>Slow</span></button>
      <button type="button" data-world-action="trace" aria-pressed="false">Trace</button>
    </div>
    <p class="w-min__status" data-world-status role="status">Circle · slow · no trace</p>
  </div>`;
}

export function mount(root, ctx) {
  const formEl = root.querySelector('[data-form]');
  const dot = root.querySelector('[data-dot]');
  const breath = root.querySelector('[data-breath]');
  const trails = Array.from(root.querySelectorAll('.w-min__trail'));
  const state = { form: 0, tempo: 0, trace: false };
  let from = formPoints('circle');
  let to = from;
  let current = from;
  let morph = 1;
  let u = 0;

  function sync() {
    root.dataset.trace = String(state.trace);
    root.querySelector('[data-world-action="form"] [data-value]').textContent = FORM_NAMES[FORMS[state.form]];
    root.querySelector('[data-tempo]').textContent = TEMPOS[state.tempo].name;
    ctx.status(`${FORM_NAMES[FORMS[state.form]]} · ${TEMPOS[state.tempo].name.toLowerCase()} · ${state.trace ? 'tracing' : 'no trace'}`);
  }

  ctx.actions({
    form() {
      state.form = (state.form + 1) % FORMS.length;
      from = current;
      to = formPoints(FORMS[state.form]);
      morph = ctx.running ? 0 : 1;
      sync();
    },
    tempo() {
      state.tempo = (state.tempo + 1) % TEMPOS.length;
      sync();
    },
    trace(button) {
      state.trace = !state.trace;
      button.setAttribute('aria-pressed', String(state.trace));
      sync();
    },
  });

  ctx.loop(({ dt, time }) => {
    if (morph < 1) {
      morph = Math.min(1, morph + dt / 1.2);
      const e = easeInOutCubic(morph);
      current = from.map((p, i) => [lerp(p[0], to[i][0], e), lerp(p[1], to[i][1], e)]);
      formEl.setAttribute('d', toPath(current));
    } else if (current !== to) {
      current = to;
      formEl.setAttribute('d', toPath(current));
    }

    u = (u + dt / TEMPOS[state.tempo].period) % 1;
    const [x, y] = pointAt(current, u);
    dot.setAttribute('cx', x.toFixed(1));
    dot.setAttribute('cy', y.toFixed(1));

    if (state.trace) {
      const span = 0.22;
      trails.forEach((seg, i) => {
        const a = u - span + (i / TRAIL_SEGMENTS) * span;
        const b = u - span + ((i + 1) / TRAIL_SEGMENTS) * span;
        const p = pointAt(current, a);
        const q = pointAt(current, (a + b) / 2);
        const r = pointAt(current, b);
        seg.setAttribute('d', `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}L${r[0].toFixed(1)} ${r[1].toFixed(1)}`);
      });
    }

    const s = 1 + Math.sin(time * 0.6) * 0.012;
    breath.setAttribute('transform', `translate(${CX} ${CY}) scale(${s.toFixed(4)}) translate(${-CX} ${-CY})`);
  });

  sync();
}
