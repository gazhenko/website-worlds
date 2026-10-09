import './cybercore.css';
import { esc } from '../lib/dom.js';
import { createRng, randomSeed } from '../lib/random.js';
import { TAU, approach } from '../lib/math.js';
import { blobPath, polar } from '../lib/svg.js';

const MODES = [
  { id: 'idle', name: 'IDLE', bpm: 48, spin: 0.1 },
  { id: 'sync', name: 'SYNC', bpm: 72, spin: 0.28 },
  { id: 'overclock', name: 'OVERCLOCK', bpm: 124, spin: 0.8 },
];
const C = 400;
const TRACE_COUNT = 24;
const ECG_POINTS = 120;
const f = (n) => n.toFixed(1);
const hex = (seed) => `0x${(seed & 0xffff).toString(16).toUpperCase().padStart(4, '0')}`;

function ticks(r, count, len, major = 5) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    const l = i % major === 0 ? len * 2 : len;
    const [x1, y1] = polar(C, C, r, a);
    const [x2, y2] = polar(C, C, r + l, a);
    d += `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
  }
  return d;
}

function vertebrae(r, count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    out += `<rect x="${C - 9}" y="${C - r - 13}" width="18" height="26" rx="7" transform="rotate(${f((i / count) * 360)} ${C} ${C})"/>`;
  }
  return out;
}

function tendons() {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + 0.3;
    const p0 = polar(C, C, 104, a);
    const c1 = polar(C, C, 96, a + 0.7);
    const c2 = polar(C, C, 66, a + 1.2);
    const p3 = polar(C, C, 46, a + 1.0);
    d += `M${f(p0[0])} ${f(p0[1])}C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p3[0])} ${f(p3[1])}`;
  }
  return d;
}

function buildTraces(seed) {
  const rng = createRng(seed);
  const step = Math.PI / 4;
  const traces = [];
  for (let i = 0; i < TRACE_COUNT; i++) {
    const a0 = (i / TRACE_COUNT) * TAU + rng.range(-0.06, 0.06);
    let [x, y] = polar(C, C, 182, a0);
    const pts = [[x, y]];
    let len = rng.range(24, 80);
    x += Math.cos(a0) * len;
    y += Math.sin(a0) * len;
    pts.push([x, y]);
    let heading = Math.round(a0 / step) * step;
    const segments = rng.int(2, 4);
    for (let s = 0; s < segments; s++) {
      const candidate = heading + rng.pick([-1, 0, 0, 1]) * step;
      const diff = Math.atan2(Math.sin(candidate - a0), Math.cos(candidate - a0));
      heading = Math.abs(diff) <= Math.PI / 2 - 0.01 ? candidate : heading;
      len = rng.range(40, 150);
      x += Math.cos(heading) * len;
      y += Math.sin(heading) * len;
      pts.push([x, y]);
    }
    traces.push({
      d: `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join('L')}`,
      end: pts[pts.length - 1],
      dur: rng.range(1.6, 3.8),
      delay: rng.range(0, 3.8),
    });
  }
  return traces;
}

function tracesMarkup(traces) {
  return traces
    .map(
      (t) =>
        `<path class="w-cyber__trace" d="${t.d}"/><path class="w-cyber__pulse" d="${t.d}" pathLength="100" style="--dur:${t.dur.toFixed(2)}s;--delay:${(-t.delay).toFixed(2)}s"/><rect class="w-cyber__pad" x="${f(t.end[0] - 4)}" y="${f(t.end[1] - 4)}" width="8" height="8"/>`,
    )
    .join('');
}

const LABELS = [
  { x: 560, y: 210, tx: 600, ty: 150, text: 'ANNULUS-1 · TORQUE 0.82' },
  { x: 268, y: 300, tx: 120, ty: 230, text: 'VERTEBRA RING · 12 SEG' },
  { x: 350, y: 380, tx: 110, ty: 470, text: 'MYO-TENDON ×6' },
  { x: 420, y: 420, tx: 560, ty: 560, text: 'HEART CELL · HEX' },
  { x: 640, y: 420, tx: 650, ty: 650, text: 'TRACE BUS · 24 CH' },
];

function heartbeat(phase) {
  const g = (c, w) => Math.exp(-(((phase - c) / w) ** 2));
  return g(0.05, 0.05) + 0.6 * g(0.22, 0.05);
}

function ecg(p) {
  const g = (c, w, a) => a * Math.exp(-(((p - c) / w) ** 2));
  return g(0.1, 0.03, 0.14) - g(0.2, 0.012, 0.18) + g(0.23, 0.014, 1) - g(0.265, 0.014, 0.32) + g(0.45, 0.05, 0.26);
}

export function render({ world }) {
  const seed = 0x3f2a;
  const heart = blobPath(C, C, (a) => 40 + 5 * Math.sin(a * 3) + 3 * Math.cos(a * 5), 14);
  const labels = LABELS.map(
    (l) =>
      `<g><path d="M${l.x} ${l.y}L${l.tx} ${l.ty}h${l.tx > l.x ? 20 : -20}"/><circle cx="${l.x}" cy="${l.y}" r="4"/><text x="${l.tx + (l.tx > l.x ? 26 : -26)}" y="${l.ty + 4}" text-anchor="${l.tx > l.x ? 'start' : 'end'}">${l.text}</text></g>`,
  ).join('');

  return `
  <div class="w-cyber__grid" aria-hidden="true"></div>
  <div class="w-cyber__layout">
    <div class="w-cyber__stage">
      <svg class="w-cyber__core" viewBox="0 0 800 800" role="img" aria-label="A reactor core of rotating rings, vertebra segments and tendons around a pulsing hexagonal heart, wired to circuit traces.">
        <defs>
          <radialGradient id="w-cyber-glow"><stop offset="0" class="w-cyber__stop" stop-opacity=".55"/><stop offset="1" class="w-cyber__stop" stop-opacity="0"/></radialGradient>
        </defs>
        <g class="w-cyber__traces">${tracesMarkup(buildTraces(seed))}</g>
        <circle cx="${C}" cy="${C}" r="230" fill="url(#w-cyber-glow)" class="w-cyber__glow"/>
        <g class="w-cyber__ring w-cyber__ring--1" data-ring="1">
          <circle cx="${C}" cy="${C}" r="176" class="w-cyber__line"/>
          <path d="${ticks(178, 120, 6)}" class="w-cyber__tick"/>
        </g>
        <g class="w-cyber__ring w-cyber__ring--2" data-ring="2">
          <circle cx="${C}" cy="${C}" r="146" class="w-cyber__dash"/>
          <path d="M${C} ${C - 146}A146 146 0 0 1 ${f(C + 146 * Math.sin(1.1))} ${f(C - 146 * Math.cos(1.1))}" class="w-cyber__arc"/>
          <path d="M${C} ${C + 146}A146 146 0 0 1 ${f(C - 146 * Math.sin(1.1))} ${f(C + 146 * Math.cos(1.1))}" class="w-cyber__arc"/>
        </g>
        <g class="w-cyber__ring w-cyber__ring--3 w-cyber__vert" data-ring="3">${vertebrae(118, 12)}</g>
        <path class="w-cyber__tendon" d="${tendons()}"/>
        <g class="w-cyber__heart" data-heart>
          <path d="${heart}" class="w-cyber__heart-body"/>
          <path d="M${C} ${C - 22}l19 11v22l-19 11-19-11v-22z" class="w-cyber__hex"/>
          <circle cx="${C}" cy="${C}" r="6" class="w-cyber__nucleus"/>
        </g>
        <g class="w-cyber__labels">${labels}</g>
        <g class="w-cyber__sweep"><path d="M${C} ${C}L${C} 40" /></g>
      </svg>
    </div>
    <aside class="w-cyber__panel">
      <p class="w-cyber__id">CORE/07 · BIOMECHANICAL UNIT</p>
      <h1 class="w-cyber__title">${esc(world.label)}</h1>
      <p class="ww-caption w-cyber__caption">${esc(world.description)}</p>
      <dl class="w-cyber__readout">
        <div><dt>Mode</dt><dd data-r="mode">SYNC</dd></div>
        <div><dt>Pulse</dt><dd data-r="bpm">072 BPM</dd></div>
        <div><dt>Flux</dt><dd data-r="flux">0.913 WB</dd></div>
        <div><dt>Coolant</dt><dd data-r="cool">41.2 °C</dd></div>
        <div><dt>Traces</dt><dd data-r="traces">${TRACE_COUNT} LIVE</dd></div>
        <div><dt>Seed</dt><dd data-r="seed">${hex(seed)}</dd></div>
      </dl>
      <svg class="w-cyber__ecg" viewBox="0 0 320 60" preserveAspectRatio="none" aria-hidden="true">
        <path class="w-cyber__ecg-grid" d="M0 15H320M0 30H320M0 45H320M40 0V60M80 0V60M120 0V60M160 0V60M200 0V60M240 0V60M280 0V60"/>
        <polyline class="w-cyber__ecg-line" points=""/>
      </svg>
      <div class="w-cyber__controls" role="group" aria-label="Core controls">
        <button type="button" data-world-action="mode">Core mode: <span data-value>SYNC</span></button>
        <button type="button" data-world-action="reroute">Reroute traces</button>
        <button type="button" data-world-action="scan" aria-pressed="false">Diagnostic scan</button>
      </div>
      <p class="w-cyber__status" data-world-status role="status">Core in SYNC at 72 BPM · scan idle</p>
    </aside>
  </div>`;
}

export function mount(root, ctx) {
  const rings = [1, 2, 3].map((n) => root.querySelector(`[data-ring="${n}"]`));
  const heart = root.querySelector('[data-heart]');
  const tracesGroup = root.querySelector('.w-cyber__traces');
  const line = root.querySelector('.w-cyber__ecg-line');
  const read = (k) => root.querySelector(`[data-r="${k}"]`);
  const state = { mode: 1, scan: false, seed: 0x3f2a, flux: 0.913, cool: 41.2 };
  const angles = [0, 0, 0];
  let spin = MODES[1].spin;

  function sync() {
    const mode = MODES[state.mode];
    root.dataset.mode = mode.id;
    root.dataset.scan = state.scan ? 'on' : 'off';
    read('mode').textContent = mode.name;
    read('bpm').textContent = `${String(mode.bpm).padStart(3, '0')} BPM`;
    read('seed').textContent = hex(state.seed);
    root.querySelector('[data-world-action="mode"] [data-value]').textContent = mode.name;
    ctx.status(`Core in ${mode.name} at ${mode.bpm} BPM · traces seed ${hex(state.seed)} · scan ${state.scan ? 'running' : 'idle'}`);
  }

  ctx.actions({
    mode() {
      state.mode = (state.mode + 1) % MODES.length;
      sync();
    },
    reroute() {
      state.seed = randomSeed();
      tracesGroup.innerHTML = tracesMarkup(buildTraces(state.seed));
      sync();
    },
    scan(button) {
      state.scan = !state.scan;
      button.setAttribute('aria-pressed', String(state.scan));
      sync();
    },
  });

  ctx.every(600, () => {
    const hot = state.mode === 2;
    state.flux = Math.min(1.4, Math.max(0.6, state.flux + (Math.random() - 0.5) * (hot ? 0.06 : 0.02)));
    state.cool = Math.min(78, Math.max(30, state.cool + (Math.random() - 0.5) * 0.6 + (hot ? 0.35 : -0.1)));
    read('flux').textContent = `${state.flux.toFixed(3)} WB`;
    read('cool').textContent = `${state.cool.toFixed(1)} °C`;
  });

  ctx.loop(({ dt, time }) => {
    const mode = MODES[state.mode];
    spin = approach(spin, mode.spin, 2.5, dt || 1);
    angles[0] += spin * dt * 360;
    angles[1] -= spin * dt * 220;
    angles[2] += spin * dt * 520;
    rings.forEach((ring, i) => ring.setAttribute('transform', `rotate(${f(angles[i] % 360)} ${C} ${C})`));

    const beatPhase = (time * mode.bpm) / 60;
    const s = 1 + 0.09 * heartbeat(beatPhase % 1);
    heart.setAttribute('transform', `translate(${C} ${C}) scale(${s.toFixed(3)}) translate(${-C} ${-C})`);

    let pts = '';
    for (let i = 0; i < ECG_POINTS; i++) {
      const x = (i / (ECG_POINTS - 1)) * 320;
      const p = (((beatPhase - (ECG_POINTS - 1 - i) * 0.018) % 1) + 1) % 1;
      pts += `${x.toFixed(1)},${(42 - ecg(p) * 30).toFixed(1)} `;
    }
    line.setAttribute('points', pts);
  });

  sync();
}
