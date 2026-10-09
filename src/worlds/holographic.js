import './holographic.css';
import { esc } from '../lib/dom.js';
import { approach, clamp } from '../lib/math.js';

const SPECTRA = [
  { id: 'prism', name: 'Prism' },
  { id: 'oil', name: 'Oil slick' },
  { id: 'aurora', name: 'Aurora' },
];
const TILTS = [
  { id: 'sway', name: 'Sway', rx: 0, ry: 0 },
  { id: 'left', name: 'Left', rx: 8, ry: -22 },
  { id: 'right', name: 'Right', rx: -6, ry: 22 },
  { id: 'flat', name: 'Flat', rx: 0, ry: 0 },
];
const LAYERS = ['CORE', 'ORBIT I', 'ORBIT II', 'HALO', 'CROWN'];

export function render({ world }) {
  const layers = LAYERS.map(
    (label, i) => `<div class="w-holo__layer" style="--i:${i}"><span class="w-holo__ring"></span><span class="w-holo__layer-label">${label}</span></div>`,
  ).join('');
  return `
  <div class="w-holo__interference" aria-hidden="true"></div>
  <div class="w-holo__layout">
    <div class="w-holo__card-wrap" data-card-wrap aria-hidden="true">
      <div class="w-holo__card" data-card>
        <div class="w-holo__foil"></div>
        <div class="w-holo__grating"></div>
        <div class="w-holo__sheen"></div>
        <div class="w-holo__card-content">
          <p class="w-holo__card-top"><span>ID · 0039</span><span>CLASS ∆</span></p>
          <svg class="w-holo__emblem" viewBox="0 0 120 120" focusable="false">
            <path d="M60 8L112 60 60 112 8 60Z"/><path d="M60 26L94 60 60 94 26 60Z"/><path d="M60 44L76 60 60 76 44 60Z"/>
            <ellipse cx="60" cy="60" rx="56" ry="18"/><ellipse cx="60" cy="60" rx="18" ry="56"/>
          </svg>
          <p class="w-holo__card-name">AURORA VANTA</p>
          <p class="w-holo__card-small">VALID THROUGH 2039 · SECTOR 7 · ✦✦✦</p>
        </div>
      </div>
    </div>
    <div class="w-holo__projector" aria-hidden="true">
      <div class="w-holo__beam"></div>
      <div class="w-holo__scene3d"><div class="w-holo__stack" data-stack>${layers}</div></div>
      <div class="w-holo__base"><span></span></div>
    </div>
    <section class="w-holo__panel">
      <p class="w-holo__kicker">Projection bay 25 · interference ok</p>
      <h1 class="w-holo__title">${esc(world.label)}</h1>
      <p class="ww-caption w-holo__caption">${esc(world.description)}</p>
      <div class="w-holo__controls" role="group" aria-label="Hologram controls">
        <button type="button" data-world-action="spectrum">Spectrum: <span data-value>Prism</span></button>
        <button type="button" data-world-action="layers" aria-pressed="false">Explode layers</button>
        <button type="button" data-world-action="tilt">Tilt: <span data-tilt>Sway</span></button>
      </div>
      <p class="w-holo__status" data-world-status role="status">Prism foil · layers stacked · card swaying</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const wrap = root.querySelector('[data-card-wrap]');
  const card = root.querySelector('[data-card]');
  const stack = root.querySelector('[data-stack]');
  const state = { spectrum: 0, exploded: false, tilt: 0 };
  const tilt = { rx: 0, ry: 0 };
  const pointer = { rx: 0, ry: 0, active: 0 };
  let gap = 16;
  let spin = 0;

  function sync() {
    root.dataset.spectrum = SPECTRA[state.spectrum].id;
    root.querySelector('[data-world-action="spectrum"] [data-value]').textContent = SPECTRA[state.spectrum].name;
    const layers = root.querySelector('[data-world-action="layers"]');
    layers.setAttribute('aria-pressed', String(state.exploded));
    layers.textContent = state.exploded ? 'Stack layers' : 'Explode layers';
    root.querySelector('[data-tilt]').textContent = TILTS[state.tilt].name;
    const t = TILTS[state.tilt];
    const tiltText = t.id === 'sway' ? 'card swaying' : `card tilted ${t.name.toLowerCase()}`;
    ctx.status(`${SPECTRA[state.spectrum].name} foil · layers ${state.exploded ? 'exploded' : 'stacked'} · ${tiltText}`);
  }

  ctx.actions({
    spectrum() {
      state.spectrum = (state.spectrum + 1) % SPECTRA.length;
      sync();
    },
    layers() {
      state.exploded = !state.exploded;
      sync();
    },
    tilt() {
      state.tilt = (state.tilt + 1) % TILTS.length;
      pointer.active = 0;
      sync();
    },
  });

  ctx.on(wrap, 'pointermove', (event) => {
    const rect = wrap.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;
    pointer.ry = clamp(nx * 44, -24, 24);
    pointer.rx = clamp(-ny * 36, -18, 18);
    pointer.active = 1.5;
  });
  ctx.on(wrap, 'pointerleave', () => {
    pointer.active = 0;
  });

  ctx.loop(({ dt, time, running }) => {
    pointer.active = Math.max(0, pointer.active - dt);
    const mode = TILTS[state.tilt];
    let rx = mode.rx;
    let ry = mode.ry;
    if (pointer.active > 0) {
      rx = pointer.rx;
      ry = pointer.ry;
    } else if (mode.id === 'sway') {
      rx = Math.sin(time * 0.6) * 9;
      ry = Math.cos(time * 0.42) * 16;
    }
    tilt.rx = running ? approach(tilt.rx, rx, 6, dt) : rx;
    tilt.ry = running ? approach(tilt.ry, ry, 6, dt) : ry;
    card.style.setProperty('--rx', `${tilt.rx.toFixed(2)}deg`);
    card.style.setProperty('--ry', `${tilt.ry.toFixed(2)}deg`);
    card.style.setProperty('--mx', `${(50 + tilt.ry * 2.2).toFixed(1)}%`);
    card.style.setProperty('--my', `${(50 - tilt.rx * 2.6).toFixed(1)}%`);

    gap = running ? approach(gap, state.exploded ? 58 : 16, 3, dt) : state.exploded ? 58 : 16;
    spin = (spin + dt * 24) % 360;
    stack.style.setProperty('--gap', `${gap.toFixed(1)}px`);
    stack.style.setProperty('--spin', `${spin.toFixed(2)}deg`);
  });

  sync();
}
