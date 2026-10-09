import './art-deco.css';
import { esc } from '../lib/dom.js';
import { approach, TAU } from '../lib/math.js';

const MOTIFS = [
  { id: 'sunburst', name: 'Sunburst' },
  { id: 'peacock', name: 'Peacock' },
  { id: 'chevron', name: 'Chevron' },
];
const GILDINGS = [
  { id: 'gold', name: 'Gold' },
  { id: 'silver', name: 'Silver' },
  { id: 'rose', name: 'Rose gold' },
];
const CX = 400;
const CY = 540;
const RIBS = 9;
const f1 = (n) => n.toFixed(1);

function sunburst() {
  let rays = '';
  const n = 40;
  for (let i = 0; i < n; i += 2) {
    const a0 = (i / n) * TAU;
    const a1 = ((i + 1) / n) * TAU;
    rays += `M${CX} ${CY}L${f1(CX + Math.cos(a0) * 360)} ${f1(CY + Math.sin(a0) * 360)}L${f1(CX + Math.cos(a1) * 360)} ${f1(CY + Math.sin(a1) * 360)}Z`;
  }
  const rings = [70, 110, 150].map((r) => `<circle cx="${CX}" cy="${CY}" r="${r}" class="w-deco__ring"/>`).join('');
  return `<g data-spin><path d="${rays}" class="w-deco__rays"/></g>${rings}<circle cx="${CX}" cy="${CY}" r="46" class="w-deco__core"/>`;
}

function peacock() {
  let out = '';
  const n = 13;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI;
    const deg = (a * 180) / Math.PI + 90;
    out += `<g class="w-deco__feather" data-feather="${i}" transform="rotate(${f1(deg)} ${CX} ${CY})">
      <path d="M${CX} ${CY}L${CX} ${CY - 250}" class="w-deco__quill"/>
      <ellipse cx="${CX}" cy="${CY - 260}" rx="30" ry="52" class="w-deco__vane"/>
      <ellipse cx="${CX}" cy="${CY - 268}" rx="14" ry="24" class="w-deco__eye"/>
      <circle cx="${CX}" cy="${CY - 272}" r="6" class="w-deco__pupil"/>
    </g>`;
  }
  return `${out}<circle cx="${CX}" cy="${CY}" r="52" class="w-deco__core"/>`;
}

function chevron() {
  let rows = '';
  for (let r = -2; r < 16; r++) {
    const y = 180 + r * 44;
    rows += `<path d="M150 ${y}L${CX} ${y + 60}L650 ${y}" class="w-deco__chev ${r % 2 ? 'w-deco__chev--thin' : ''}"/>`;
  }
  return `<clipPath id="w-deco-chev-clip"><path d="M180 860V300h40v-60h40v-60h40v-50h200v50h40v60h40v60h40v560Z"/></clipPath>
    <g clip-path="url(#w-deco-chev-clip)"><g data-chev>${rows}</g></g><circle cx="${CX}" cy="${CY}" r="46" class="w-deco__core"/>`;
}

const MOTIF_FNS = { sunburst, peacock, chevron };

function fan(side) {
  const ribs = Array.from({ length: RIBS }, (_, i) => `<path class="w-deco__rib ${i % 2 ? 'w-deco__rib--alt' : ''}" data-rib="${side}-${i}" d="M0 0L176 -11A176 176 0 0 1 176 11Z"/>`).join('');
  return `<g class="w-deco__fan" data-fan="${side}">${ribs}</g>`;
}

export function render({ world }) {
  return `
  <div class="w-deco__layout">
    <figure class="w-deco__poster">
      <svg viewBox="0 0 800 900" role="img" aria-label="An Art deco poster for the fictional Hotel Aurelian: a gilded sunburst within a stepped arch, with fans unfolding in the lower corners." data-poster>
        <defs>
          <linearGradient id="w-deco-gild" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="w-deco__g1"/><stop offset=".5" class="w-deco__g2"/><stop offset="1" class="w-deco__g3"/></linearGradient>
          <linearGradient id="w-deco-gild-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="w-deco__g3"/><stop offset=".5" class="w-deco__g1"/><stop offset="1" class="w-deco__g3"/></linearGradient>
        </defs>
        <rect width="800" height="900" class="w-deco__ground"/>
        <path d="M20 20H780V880H20Z" class="w-deco__border"/>
        <path d="M34 34H766V866H34Z" class="w-deco__border w-deco__border--thin"/>
        <g data-motif>${sunburst()}</g>
        <path d="M180 860V300h40v-60h40v-60h40v-50h200v50h40v60h40v60h40v560" class="w-deco__arch"/>
        <path d="M200 860V316h40v-60h40v-60h40v-46h160v46h40v60h40v60h40v544" class="w-deco__arch w-deco__arch--inner"/>
        <g transform="translate(60 860)">${fan('l')}</g>
        <g transform="translate(740 860) scale(-1 1)">${fan('r')}</g>
        <text x="400" y="88" text-anchor="middle" class="w-deco__name">HOTEL AURELIAN</text>
        <text x="400" y="118" text-anchor="middle" class="w-deco__sub">GRAND BALLROOM · EST. MCMXXVI</text>
        <path d="M250 136H550M300 144H500" class="w-deco__rule"/>
        <text x="400" y="828" text-anchor="middle" class="w-deco__sub">AN EVENING OF LIGHT · Nº 39</text>
      </svg>
      <span class="w-deco__shimmer" aria-hidden="true"></span>
    </figure>
    <section class="w-deco__panel">
      <p class="w-deco__kicker">◆ Poster plate · gilded edition ◆</p>
      <h1 class="w-deco__title">${esc(world.label)}</h1>
      <p class="ww-caption w-deco__caption">${esc(world.description)}</p>
      <div class="w-deco__controls" role="group" aria-label="Poster controls">
        <button type="button" data-world-action="unfold" aria-pressed="true">Fold the fans</button>
        <button type="button" data-world-action="motif">Motif · <span data-value>Sunburst</span></button>
        <button type="button" data-world-action="gilding">Gilding · <span data-gild>Gold</span></button>
      </div>
      <p class="w-deco__status" data-world-status role="status">Fans open · sunburst motif · gold gilding</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const motifHolder = root.querySelector('[data-motif]');
  const ribs = { l: [], r: [] };
  for (const side of ['l', 'r']) for (let i = 0; i < RIBS; i++) ribs[side].push(root.querySelector(`[data-rib="${side}-${i}"]`));
  const state = { open: true, motif: 0, gilding: 0 };
  let openness = 1;
  let spin = 0;
  let spinEl = null;
  let feathers = [];
  let chev = null;

  function bindMotif() {
    spinEl = motifHolder.querySelector('[data-spin]');
    feathers = Array.from(motifHolder.querySelectorAll('[data-feather]'));
    chev = motifHolder.querySelector('[data-chev]');
  }

  function sync() {
    root.dataset.gilding = GILDINGS[state.gilding].id;
    root.dataset.motif = MOTIFS[state.motif].id;
    const unfold = root.querySelector('[data-world-action="unfold"]');
    unfold.setAttribute('aria-pressed', String(state.open));
    unfold.textContent = state.open ? 'Fold the fans' : 'Open the fans';
    root.querySelector('[data-world-action="motif"] [data-value]').textContent = MOTIFS[state.motif].name;
    root.querySelector('[data-gild]').textContent = GILDINGS[state.gilding].name;
    ctx.status(`Fans ${state.open ? 'open' : 'folded'} · ${MOTIFS[state.motif].name.toLowerCase()} motif · ${GILDINGS[state.gilding].name.toLowerCase()} gilding`);
  }

  ctx.actions({
    unfold() {
      state.open = !state.open;
      sync();
    },
    motif() {
      state.motif = (state.motif + 1) % MOTIFS.length;
      motifHolder.innerHTML = MOTIF_FNS[MOTIFS[state.motif].id]();
      bindMotif();
      motifHolder.classList.remove('is-revealing');
      void motifHolder.getBoundingClientRect();
      motifHolder.classList.add('is-revealing');
      sync();
    },
    gilding() {
      state.gilding = (state.gilding + 1) % GILDINGS.length;
      sync();
    },
  });

  bindMotif();

  ctx.loop(({ dt, time, running }) => {
    openness = running ? approach(openness, state.open ? 1 : 0, 3, dt) : state.open ? 1 : 0;
    for (const side of ['l', 'r']) {
      ribs[side].forEach((rib, i) => {
        const spread = -90 + (i / (RIBS - 1)) * 90;
        const folded = -78 + i * 1.2;
        const angle = folded + (spread - folded) * openness;
        rib.setAttribute('transform', `rotate(${angle.toFixed(2)})`);
      });
    }
    spin = (spin + dt * 4) % 360;
    if (spinEl) spinEl.setAttribute('transform', `rotate(${spin.toFixed(2)} ${CX} ${CY})`);
    feathers.forEach((el, i) => {
      const n = feathers.length;
      const base = 180 + (i / (n - 1)) * 180 + 90;
      const sway = Math.sin(time * 1.2 + i * 0.5) * 2.5;
      el.setAttribute('transform', `rotate(${(base + sway).toFixed(2)} ${CX} ${CY})`);
    });
    if (chev) chev.setAttribute('transform', `translate(0 ${((time * 14) % 88).toFixed(1)})`);
  });

  sync();
}
