import './maximalism.css';
import { esc } from '../lib/dom.js';

const PATTERNS = [
  { id: 'damask', name: 'Damask' },
  { id: 'gingham', name: 'Gingham' },
  { id: 'leopard', name: 'Leopard-dot' },
];
const PALETTES = [
  { id: 'jewel', name: 'Jewel' },
  { id: 'candy', name: 'Candy' },
  { id: 'tropic', name: 'Tropic' },
];
const MAX_LAYERS = 5;

const bloom = (cls, petals = 12) => `<svg class="w-max__bloom ${cls}" viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
  <g class="w-max__petals">${Array.from({ length: petals }, (_, i) => `<ellipse rx="22" ry="70" cy="-40" transform="rotate(${(i * 360) / petals})"/>`).join('')}</g>
  <g class="w-max__petals w-max__petals--inner">${Array.from({ length: petals }, (_, i) => `<ellipse rx="12" ry="40" cy="-22" transform="rotate(${(i * 360) / petals + 15})"/>`).join('')}</g>
  <circle r="26" class="w-max__heart"/>
  <g class="w-max__seeds">${Array.from({ length: 10 }, (_, i) => `<circle r="3" cx="${(Math.cos(i * 2.4) * 14).toFixed(1)}" cy="${(Math.sin(i * 2.4) * 14).toFixed(1)}"/>`).join('')}</g>
</svg>`;

const face = `<svg viewBox="0 0 100 120" aria-hidden="true" focusable="false">
  <rect width="100" height="120" class="w-max__portrait-bg"/>
  <path d="M20 120c0-26 14-38 30-38s30 12 30 38z" class="w-max__portrait-coat"/>
  <circle cx="50" cy="50" r="24" class="w-max__portrait-face"/>
  <path d="M26 44c0-20 10-30 24-30s26 8 26 30c-6-8-14-12-24-12s-20 4-26 12z" class="w-max__portrait-hair"/>
  <circle cx="41" cy="52" r="3"/><circle cx="59" cy="52" r="3"/>
  <circle cx="36" cy="60" r="4" class="w-max__portrait-cheek"/><circle cx="64" cy="60" r="4" class="w-max__portrait-cheek"/>
  <path d="M43 64q7 6 14 0" fill="none" stroke="#2b1055" stroke-width="2.4" stroke-linecap="round"/>
</svg>`;

export function render({ world }) {
  const band = 'MORE IS MORE ✦ PATTERN ON PATTERN ✦ ADD ANOTHER ✦ ';
  return `
  <div class="w-max__layers" aria-hidden="true">
    <div class="w-max__layer w-max__layer--1" data-layer="1">
      <div class="w-max__panel w-max__panel--a"></div>
      <div class="w-max__panel w-max__panel--b"></div>
    </div>
    <div class="w-max__layer" data-layer="2">
      ${bloom('w-max__bloom--a')}
      ${bloom('w-max__bloom--b', 10)}
      <div class="w-max__arch"></div>
    </div>
    <div class="w-max__layer" data-layer="3">
      <div class="w-max__frame w-max__frame--a">${face}</div>
      <div class="w-max__frame w-max__frame--b">${face}</div>
      ${bloom('w-max__bloom--c', 14)}
    </div>
    <div class="w-max__layer" data-layer="4">
      <div class="w-max__ribbon w-max__ribbon--a"><span>${band}${band}</span><span>${band}${band}</span></div>
      <div class="w-max__ribbon w-max__ribbon--b"><span>${band}${band}</span><span>${band}${band}</span></div>
    </div>
    <div class="w-max__layer" data-layer="5">
      <span class="w-max__sticker w-max__sticker--star">★</span>
      <span class="w-max__sticker w-max__sticker--wow">WOW</span>
      <span class="w-max__sticker w-max__sticker--heart">♥</span>
      <span class="w-max__sticker w-max__sticker--eye">◉</span>
      ${Array.from({ length: 14 }, (_, i) => `<span class="w-max__confetti" style="--i:${i};left:${(i * 37) % 100}%;top:${(i * 53 + 7) % 100}%"></span>`).join('')}
    </div>
  </div>
  <div class="w-max__content">
    <h1 class="w-max__title">${esc(world.label)}</h1>
    <p class="ww-caption w-max__caption">${esc(world.description)}</p>
    <div class="w-max__dock">
      <div class="w-max__controls" role="group" aria-label="Collage controls">
        <button type="button" data-world-action="more">More! <span data-value>(3 of ${MAX_LAYERS})</span></button>
        <button type="button" data-world-action="pattern">Pattern: <span data-pattern-name>Damask</span></button>
        <button type="button" data-world-action="palette">Palette: <span data-palette-name>Jewel</span></button>
      </div>
      <p class="w-max__status" data-world-status role="status">3 of ${MAX_LAYERS} layers · Damask patterns · Jewel palette</p>
    </div>
  </div>`;
}

export function mount(root, ctx) {
  const layers = Array.from(root.querySelectorAll('[data-layer]'));
  const state = { layers: 3, pattern: 0, palette: 0 };

  function sync(popLayer = 0) {
    root.dataset.pattern = PATTERNS[state.pattern].id;
    root.dataset.palette = PALETTES[state.palette].id;
    for (const layer of layers) {
      const n = Number(layer.dataset.layer);
      layer.hidden = n > state.layers;
      layer.classList.toggle('is-new', n === popLayer);
    }
    root.querySelector('[data-world-action="more"] [data-value]').textContent = `(${state.layers} of ${MAX_LAYERS})`;
    root.querySelector('[data-pattern-name]').textContent = PATTERNS[state.pattern].name;
    root.querySelector('[data-palette-name]').textContent = PALETTES[state.palette].name;
    ctx.status(`${state.layers} of ${MAX_LAYERS} layers · ${PATTERNS[state.pattern].name} patterns · ${PALETTES[state.palette].name} palette`);
  }

  ctx.actions({
    more() {
      state.layers = state.layers >= MAX_LAYERS ? 1 : state.layers + 1;
      sync(state.layers);
    },
    pattern() {
      state.pattern = (state.pattern + 1) % PATTERNS.length;
      sync();
    },
    palette() {
      state.palette = (state.palette + 1) % PALETTES.length;
      sync();
    },
  });

  sync();
}
