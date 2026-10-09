import './wabi-sabi.css';
import { esc } from '../lib/dom.js';
import { createRng, randomSeed } from '../lib/random.js';
import { TAU } from '../lib/math.js';
import { noise2 } from '../lib/noise.js';
import { linePath, smoothOpenPath } from '../lib/svg.js';

const SEASONS = [
  { id: 'autumn', name: 'Autumn' },
  { id: 'winter', name: 'Winter' },
  { id: 'spring', name: 'Spring' },
  { id: 'summer', name: 'Summer' },
];
const ENSO = { cx: 700, cy: 250, r: 150, w: 34 };
const CRACKS = [
  'M214 470l10 22-6 14 12 18-4 16 10 20',
  'M318 452l-6 26 10 12-8 22 6 18',
  'M392 486l-14 14 4 16-12 12 2 22',
];

function enso(seed) {
  const rng = createRng(seed);
  const start = -Math.PI * 0.62 + rng.range(-0.25, 0.25);
  const sweep = TAU * rng.range(0.86, 0.93);
  const n = 140;
  const outer = [];
  const inner = [];
  const centre = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + sweep * t;
    const r = ENSO.r * (1 + (noise2(t * 5, seed % 97) - 0.5) * 0.07);
    const press = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15 + 0.05)), 0.5);
    const w = ENSO.w * (0.38 + 0.62 * press) * (1 - 0.7 * Math.pow(t, 4)) * (0.9 + noise2(t * 14, seed % 53) * 0.25);
    const cx = ENSO.cx + Math.cos(a) * r;
    const cy = ENSO.cy + Math.sin(a) * r;
    outer.push([cx + Math.cos(a) * w * 0.5, cy + Math.sin(a) * w * 0.5]);
    inner.push([cx - Math.cos(a) * w * 0.5, cy - Math.sin(a) * w * 0.5]);
    centre.push([cx, cy]);
  }
  const body = linePath(outer.concat(inner.reverse()), true);
  const streaks = [0.25, 0.42, 0.6]
    .map((offset, k) => {
      const pts = centre.slice(Math.floor(n * 0.55), n - 2).map(([x, y], j, arr) => {
        const a = Math.atan2(y - ENSO.cy, x - ENSO.cx);
        const o = (offset - 0.42) * ENSO.w * (1 - j / arr.length);
        return [x + Math.cos(a) * o, y + Math.sin(a) * o];
      });
      return `<path d="${smoothOpenPath(pts.filter((_, j) => j % 3 === 0))}" class="w-wabi__streak" style="stroke-dasharray:${8 + k * 5} ${4 + k * 3}"/>`;
    })
    .join('');
  return { body, streaks, centre: smoothOpenPath(centre.filter((_, j) => j % 4 === 0)) };
}

function ensoMarkup(seed) {
  const e = enso(seed);
  return `<mask id="w-wabi-enso-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="700">
      <path d="${e.centre}" class="w-wabi__enso-reveal" pathLength="1"/>
    </mask>
    <g mask="url(#w-wabi-enso-mask)">
      <path d="${e.body}" class="w-wabi__enso"/>
      ${e.streaks}
    </g>`;
}

export function render({ world }) {
  const cracks = CRACKS.map((d, i) => `<path d="${d}" class="w-wabi__crack" data-crack="${i}"/><path d="${d}" class="w-wabi__gold" data-gold="${i}" pathLength="1"/>`).join('');
  return `
  <svg class="w-wabi__scene" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A hand-thrown bowl with gold-mended cracks, a brushed ensō circle and a branch letting a single leaf fall.">
    <g class="w-wabi__enso-wrap" data-enso>${ensoMarkup(1234)}</g>
    <g class="w-wabi__branch">
      <path d="M-20 112C80 120 160 150 240 156S360 176 400 210" class="w-wabi__twig"/>
      <path d="M180 150c10-24 30-36 54-40" class="w-wabi__twig w-wabi__twig--thin"/>
      <g class="w-wabi__leaves">
        <path d="M120 128c10-22 34-28 50-20-6 20-28 30-50 20z"/>
        <path d="M232 154c18-14 42-10 52 4-16 14-40 12-52-4z"/>
        <path d="M232 114c8-20 30-26 44-18-6 18-26 26-44 18z"/>
        <path d="M330 178c16-16 40-14 50-2-14 16-38 16-50 2z"/>
      </g>
      <g class="w-wabi__snow"><ellipse cx="140" cy="128" rx="16" ry="4"/><ellipse cx="262" cy="156" rx="20" ry="4"/><ellipse cx="350" cy="182" rx="14" ry="3.5"/></g>
      <g class="w-wabi__blossom"><circle cx="150" cy="122" r="6"/><circle cx="252" cy="150" r="7"/><circle cx="262" cy="112" r="5"/><circle cx="356" cy="176" r="6"/></g>
    </g>
    <path d="M60 640H940" class="w-wabi__table"/>
    <ellipse cx="300" cy="638" rx="150" ry="10" class="w-wabi__shadow"/>
    <g class="w-wabi__bowl">
      <path d="M150 440C148 470 160 540 214 580C236 596 250 606 252 626H350C352 606 368 594 390 578C442 538 454 474 452 448C392 432 214 432 150 440Z" class="w-wabi__clay"/>
      <path d="M150 440C148 470 160 520 200 556C260 540 330 552 418 548C446 510 454 474 452 448C392 432 214 432 150 440Z" class="w-wabi__glaze"/>
      <path d="M200 556c4 14 2 22-2 30M262 548c2 18 0 26-4 34M346 552c2 14 6 20 10 26M408 548c-2 12-6 18-10 24" class="w-wabi__drip"/>
      <path d="M150 440C214 458 390 460 452 448" class="w-wabi__lip"/>
      <path d="M252 626C256 616 344 616 350 626" class="w-wabi__foot"/>
      ${cracks}
    </g>
    <g class="w-wabi__falling" data-leaf>
      <path d="M0 0c8-16 26-20 38-14-4 14-20 22-38 14z" class="w-wabi__falling-leaf"/>
      <circle r="6" class="w-wabi__falling-flake"/>
    </g>
    <rect x="884" y="560" width="34" height="34" rx="3" class="w-wabi__seal"/>
    <path d="M892 570h18M901 568v20M893 586l16-8" class="w-wabi__seal-mark"/>
  </svg>
  <p class="w-wabi__poem" aria-hidden="true">the cracked bowl<br>still holds<br>the morning light</p>
  <div class="w-wabi__panel">
    <h1 class="w-wabi__title">${esc(world.label)}</h1>
    <p class="ww-caption w-wabi__caption">${esc(world.description)}</p>
    <div class="w-wabi__controls" role="group" aria-label="Quiet controls">
      <button type="button" data-world-action="mend">Mend a crack</button>
      <button type="button" data-world-action="season">Season · <span data-value>Autumn</span></button>
      <button type="button" data-world-action="enso">Brush a new ensō</button>
    </div>
    <p class="w-wabi__status" data-world-status role="status">Autumn · 0 of 3 cracks mended · ensō no. 1</p>
  </div>`;
}

export function mount(root, ctx) {
  const ensoWrap = root.querySelector('[data-enso]');
  const leaf = root.querySelector('[data-leaf]');
  const golds = Array.from(root.querySelectorAll('[data-gold]'));
  const state = { season: 0, mended: 0, enso: 1 };
  const fall = { x: 300, y: 180, rot: 0, t: 0, wait: 0 };

  function sync() {
    root.dataset.season = SEASONS[state.season].id;
    golds.forEach((g, i) => g.classList.toggle('is-mended', i < state.mended));
    root.querySelector('[data-world-action="season"] [data-value]').textContent = SEASONS[state.season].name;
    const mend = root.querySelector('[data-world-action="mend"]');
    mend.textContent = state.mended >= CRACKS.length ? 'Let it crack again' : 'Mend a crack';
    ctx.status(`${SEASONS[state.season].name} · ${state.mended} of ${CRACKS.length} cracks mended with gold · ensō no. ${state.enso}`);
  }

  ctx.actions({
    mend() {
      state.mended = state.mended >= CRACKS.length ? 0 : state.mended + 1;
      sync();
    },
    season() {
      state.season = (state.season + 1) % SEASONS.length;
      sync();
    },
    enso() {
      state.enso += 1;
      ensoWrap.innerHTML = ensoMarkup(randomSeed());
      sync();
    },
  });

  ctx.loop(({ dt, running }) => {
    if (!running) {
      leaf.setAttribute('transform', 'translate(520 628) rotate(16)');
      return;
    }
    if (fall.wait > 0) {
      fall.wait -= dt;
      leaf.style.opacity = '0';
      if (fall.wait <= 0) Object.assign(fall, { x: 300 + Math.random() * 60, y: 172, t: 0, rot: 0 });
      return;
    }
    fall.t += dt;
    fall.y += 38 * dt;
    fall.x += Math.sin(fall.t * 1.3) * 34 * dt + 8 * dt;
    fall.rot = Math.sin(fall.t * 1.1) * 50;
    const fade = fall.y > 600 ? Math.max(0, 1 - (fall.y - 600) / 34) : Math.min(1, fall.t * 2);
    leaf.style.opacity = fade.toFixed(2);
    leaf.setAttribute('transform', `translate(${fall.x.toFixed(1)} ${fall.y.toFixed(1)}) rotate(${fall.rot.toFixed(1)})`);
    if (fall.y > 634) fall.wait = 1.6;
  });

  sync();
}
