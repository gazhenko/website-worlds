import './comic-book.css';
import { esc } from '../lib/dom.js';

const PAGES = [
  {
    caption: 'Meanwhile, high above Copper City…',
    juno: 'The lighthouse lamp is out — and the ferries are still at sea!',
    pip: 'She’ll want a snack after this.',
    sfx: 'FWOOSH!',
    tint: 'dusk',
  },
  {
    caption: 'The harbour, minutes later…',
    juno: 'Hold on, little lamp. I brought my own spark!',
    pip: 'Is it snack time yet?',
    sfx: 'ZZAP!',
    tint: 'night',
  },
  {
    caption: 'And so, the ferries came home.',
    juno: 'Lights on. Everyone’s safe. Now — where’s Pip?',
    pip: 'Waiting. Professionally.',
    sfx: 'TA-DAA!',
    tint: 'dawn',
  },
];
const EXPRESSIONS = [
  { id: 'determined', name: 'determined' },
  { id: 'surprised', name: 'surprised' },
  { id: 'laughing', name: 'laughing' },
];
const SFX = ['POW!', 'ZOOM!', 'WHAM!', 'BOING!'];

function burstPoints(cx, cy, spikes, outer, inner) {
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? inner : outer * (0.85 + ((i * 37) % 10) / 50);
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}

const rays = (cx, cy, n, r0, r1) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return `M${(cx + Math.cos(a) * r0).toFixed(1)} ${(cy + Math.sin(a) * r0).toFixed(1)}L${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)}`;
  }).join('');

export function render({ world }) {
  const p = PAGES[0];
  return `
  <div class="w-comic__wrap">
    <header class="w-comic__mast">
      <h1 class="w-comic__title">${esc(world.label)}</h1>
      <p class="w-comic__issue" aria-hidden="true"><span>No. 33</span><span>Juno Kite &amp; Pip</span></p>
    </header>
    <div class="w-comic__page" data-page-el>
      <section class="w-comic__panel w-comic__panel--wide" aria-label="Panel 1">
        <svg viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <pattern id="w-comic-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="2.2" class="w-comic__dot"/></pattern>
            <linearGradient id="w-comic-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="w-comic__sky-a"/><stop offset="1" class="w-comic__sky-b"/></linearGradient>
          </defs>
          <rect width="600" height="260" fill="url(#w-comic-sky)"/>
          <rect width="600" height="260" fill="url(#w-comic-dots)" opacity=".55"/>
          <circle cx="500" cy="62" r="34" class="w-comic__moon"/>
          <g class="w-comic__clouds"><path d="M40 70c10-20 40-20 50 0 20-6 34 6 30 20H30c-8 0-6-20 10-20z"/><path d="M300 40c8-14 30-14 38 0 14-4 26 4 22 14h-70c-6 0-4-14 10-14z"/></g>
          <g class="w-comic__city"><path d="M0 260V190h40v-30h30v40h30v-60h44v70h30v-36h38v56h26v-80h40v80h30v-44h36v54h30v-70h44v70h34v-40h28v40h30v-24h40v84z"/></g>
          <g class="w-comic__windows"><rect x="112" y="160" width="6" height="8"/><rect x="128" y="180" width="6" height="8"/><rect x="250" y="140" width="6" height="8"/><rect x="262" y="160" width="6" height="8"/><rect x="430" y="150" width="6" height="8"/><rect x="455" y="170" width="6" height="8"/></g>
          <g class="w-comic__speed"><path d="M0 92H200M20 112H230M0 132H180M40 152H210"/></g>
          <g class="w-comic__juno" data-juno>
            <path class="w-comic__cape" data-cape d="M300 120C260 110 220 120 190 150C230 140 260 142 296 140Z"/>
            <path class="w-comic__suit" d="M296 116l60-6 20 14-20 10-58 8z"/>
            <path class="w-comic__suit" d="M300 138l-60 18-6-10 56-22z"/>
            <path class="w-comic__arm" d="M372 116l42-14 4 10-40 14z"/>
            <circle cx="420" cy="106" r="8" class="w-comic__glove"/>
            <circle cx="372" cy="108" r="16" class="w-comic__skin"/>
            <path d="M358 98c4-14 24-18 32-6-10-2-18 2-24 10z" class="w-comic__hair"/>
            <path d="M360 104h26v6h-26z" class="w-comic__mask"/>
            <path d="M330 116l6 10M318 118l6 10" class="w-comic__belt"/>
          </g>
        </svg>
        <p class="w-comic__caption-box" data-caption>${esc(p.caption)}</p>
      </section>

      <section class="w-comic__panel w-comic__panel--face" aria-label="Panel 2">
        <svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <rect width="300" height="260" class="w-comic__face-bg"/>
          <path d="${rays(150, 150, 28, 30, 260)}" class="w-comic__rays"/>
          <g class="w-comic__face" data-face>
            <path d="M80 260c0-50 30-70 70-70s70 20 70 70z" class="w-comic__suit"/>
            <circle cx="150" cy="140" r="62" class="w-comic__skin"/>
            <path d="M88 132c-4-56 40-82 80-70 34 10 50 40 44 72-14-26-40-40-62-30-20-14-46-8-62 28z" class="w-comic__hair"/>
            <path d="M96 122h108v26H96z" class="w-comic__mask"/>
            <g class="w-comic__expr w-comic__expr--determined">
              <path d="M104 116l36 10M196 116l-36 10" class="w-comic__brow"/>
              <ellipse cx="124" cy="135" rx="9" ry="7" class="w-comic__eye"/><ellipse cx="176" cy="135" rx="9" ry="7" class="w-comic__eye"/>
              <path d="M128 176q22 8 44 0" class="w-comic__mouth-line"/>
            </g>
            <g class="w-comic__expr w-comic__expr--surprised">
              <path d="M104 108q18-12 34-4M196 108q-18-12-34-4" class="w-comic__brow"/>
              <ellipse cx="124" cy="135" rx="11" ry="11" class="w-comic__eye"/><ellipse cx="176" cy="135" rx="11" ry="11" class="w-comic__eye"/>
              <ellipse cx="150" cy="180" rx="11" ry="14" class="w-comic__mouth"/>
            </g>
            <g class="w-comic__expr w-comic__expr--laughing">
              <path d="M104 112q18-8 34 0M196 112q-18-8-34 0" class="w-comic__brow"/>
              <path d="M114 138q10-12 20 0M166 138q10-12 20 0" class="w-comic__mouth-line"/>
              <path d="M122 168q28 36 56 0z" class="w-comic__mouth"/>
            </g>
          </g>
        </svg>
        <p class="w-comic__balloon w-comic__balloon--juno" data-juno-line>${esc(p.juno)}</p>
      </section>

      <section class="w-comic__panel w-comic__panel--cat" aria-label="Panel 3">
        <svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <rect width="300" height="260" class="w-comic__night"/>
          <rect width="300" height="260" fill="url(#w-comic-dots)" opacity=".25"/>
          <circle cx="230" cy="60" r="26" class="w-comic__moon"/>
          <path d="M0 200L180 150L300 190V260H0z" class="w-comic__roof"/>
          <rect x="40" y="130" width="34" height="56" class="w-comic__chimney"/>
          <g class="w-comic__pip">
            <path d="M150 190c-20 0-30-16-26-36 2-12 10-20 22-22l-4-16 12 10c4-1 8-1 12 0l12-10-4 16c12 4 18 14 16 26-2 20-16 32-40 32z" class="w-comic__cat"/>
            <ellipse cx="150" cy="140" rx="4" ry="6" class="w-comic__cat-eye"/><ellipse cx="168" cy="140" rx="4" ry="6" class="w-comic__cat-eye"/>
            <path class="w-comic__tail" d="M178 184c24 0 34-10 32-28"/>
          </g>
        </svg>
        <p class="w-comic__thought" data-pip-line>${esc(p.pip)}</p>
      </section>

      <section class="w-comic__panel w-comic__panel--sfx" aria-label="Panel 4">
        <svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <rect width="300" height="260" class="w-comic__sfx-bg"/>
          <path d="${rays(150, 130, 36, 40, 220)}" class="w-comic__action"/>
          <g class="w-comic__burst" data-burst>
            <polygon points="${burstPoints(150, 130, 14, 110, 70)}" class="w-comic__burst-shape"/>
            <text x="150" y="146" text-anchor="middle" class="w-comic__sfx" data-sfx>${esc(p.sfx)}</text>
          </g>
        </svg>
      </section>
    </div>
    <section class="w-comic__letters">
      <p class="ww-caption w-comic__caption">${esc(world.description)}</p>
      <div class="w-comic__controls" role="group" aria-label="Comic controls">
        <button type="button" data-world-action="page">Next page →</button>
        <button type="button" data-world-action="expression">Expression: <span data-value>Determined</span></button>
        <button type="button" data-world-action="sfx">Sound effect!</button>
      </div>
      <p class="w-comic__status" data-world-status role="status">Page 1 of 3 · Juno looks determined · FWOOSH!</p>
      <p class="ww-vh" data-transcript>Page 1. Caption: ${esc(p.caption)} Juno says: ${esc(p.juno)} Pip thinks: ${esc(p.pip)}</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const pageEl = root.querySelector('[data-page-el]');
  const juno = root.querySelector('[data-juno]');
  const cape = root.querySelector('[data-cape]');
  const burst = root.querySelector('[data-burst]');
  const sfxEl = root.querySelector('[data-sfx]');
  const state = { page: 0, expression: 0, sfx: PAGES[0].sfx, sfxIndex: -1 };

  function retrigger(el, cls) {
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
  }

  function sync() {
    const page = PAGES[state.page];
    root.dataset.tint = page.tint;
    root.dataset.expression = EXPRESSIONS[state.expression].id;
    root.querySelector('[data-world-action="expression"] [data-value]').textContent = EXPRESSIONS[state.expression].name.replace(/^./, (c) => c.toUpperCase());
    root.querySelector('[data-transcript]').textContent = `Page ${state.page + 1}. Caption: ${page.caption} Juno says: ${page.juno} Pip thinks: ${page.pip}`;
    ctx.status(`Page ${state.page + 1} of ${PAGES.length} · Juno looks ${EXPRESSIONS[state.expression].name} · ${state.sfx}`);
  }

  ctx.actions({
    page() {
      state.page = (state.page + 1) % PAGES.length;
      const page = PAGES[state.page];
      root.querySelector('[data-caption]').textContent = page.caption;
      root.querySelector('[data-juno-line]').textContent = page.juno;
      root.querySelector('[data-pip-line]').textContent = page.pip;
      state.sfx = page.sfx;
      sfxEl.textContent = page.sfx;
      retrigger(pageEl, 'is-turning');
      retrigger(burst, 'is-pop');
      sync();
    },
    expression() {
      state.expression = (state.expression + 1) % EXPRESSIONS.length;
      sync();
    },
    sfx() {
      state.sfxIndex = (state.sfxIndex + 1) % SFX.length;
      state.sfx = SFX[state.sfxIndex];
      sfxEl.textContent = state.sfx;
      retrigger(burst, 'is-pop');
      sync();
    },
  });

  ctx.loop(({ time }) => {
    const bob = Math.sin(time * 2.2) * 6;
    const drift = Math.sin(time * 0.5) * 14;
    juno.setAttribute('transform', `translate(${drift.toFixed(1)} ${bob.toFixed(1)})`);
    const f = Math.sin(time * 9);
    cape.setAttribute('d', `M300 120C260 ${(108 + f * 8).toFixed(1)} 220 ${(118 - f * 10).toFixed(1)} 190 ${(150 + f * 12).toFixed(1)}C230 ${(140 + f * 4).toFixed(1)} 260 142 296 140Z`);
  });

  retrigger(pageEl, 'is-turning');
  sync();
}
