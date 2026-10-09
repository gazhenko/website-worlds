import './blueprint.css';
import { esc } from '../lib/dom.js';
import { circlePath } from '../lib/svg.js';

const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}Z`;

const PARTS = [
  {
    no: 'P-01',
    name: 'Base plinth',
    material: 'walnut, ebonised',
    note: 'felt pads ×4',
    ex: 70,
    d: `${rect(300, 540, 300, 40)}M300 552H600M318 580v10h24v-10M558 580v10h24v-10`,
  },
  {
    no: 'P-02',
    name: 'Drive column',
    material: 'turned brass',
    note: 'hollow, carries the spindle',
    ex: 0,
    d: `${rect(436, 330, 28, 210)}M436 360l28 18M436 390l28 18M436 420l28 18M436 450l28 18M436 480l28 18`,
  },
  {
    no: 'P-03',
    name: 'Gear train',
    material: 'brass & steel',
    note: 'ratio 1 : 12 : 144',
    ex: 36,
    d: `${rect(372, 478, 156, 52)}${circlePath(410, 504, 18)}${circlePath(470, 504, 12)}${circlePath(500, 504, 7)}M410 486v-4M428 504h4M392 504h-4M410 522v4`,
  },
  {
    no: 'P-04',
    name: 'Orbit arms',
    material: 'spring steel',
    note: 'counterweighted, 2 tiers',
    ex: -26,
    d: 'M222 360H436M464 360H690M296 300H436M464 300H600M228 352v16M684 352v16M302 292v16M594 292v16',
  },
  {
    no: 'P-05',
    name: 'Planet spheres',
    material: 'enamelled copper',
    note: 'hand-painted bands',
    ex: -58,
    d: `${circlePath(200, 360, 26)}M164 366c20 8 52 8 72 0${circlePath(706, 360, 18)}${circlePath(290, 300, 12)}${circlePath(608, 300, 14)}M196 334v-8M706 342v-8`,
  },
  {
    no: 'P-06',
    name: 'Crown sun',
    material: 'frosted glass',
    note: 'warm lamp, 2700 K',
    ex: -100,
    d: `${circlePath(450, 290, 40)}M450 250V218M450 218l-5 10h10ZM410 290h-12M490 290h12M422 262l-8-8M478 262l8-8M422 318l-8 8M478 318l8 8`,
  },
];

const DIMS = `
  <path d="M200 616H706" class="w-bp__dim-line" marker-start="url(#w-bp-arrow)" marker-end="url(#w-bp-arrow)"/>
  <path d="M200 400V624M706 384V624" class="w-bp__ext"/>
  <text x="453" y="608" text-anchor="middle">506</text>
  <path d="M300 600H600" class="w-bp__dim-line" marker-start="url(#w-bp-arrow)" marker-end="url(#w-bp-arrow)"/>
  <text x="450" y="594" text-anchor="middle">300</text>
  <path d="M790 218V580" class="w-bp__dim-line" marker-start="url(#w-bp-arrow)" marker-end="url(#w-bp-arrow)"/>
  <path d="M460 218H800M610 580H800" class="w-bp__ext"/>
  <text x="804" y="404" transform="rotate(-90 804 404)" text-anchor="middle">362</text>
  <path d="M478 262L560 190H640" class="w-bp__leader"/>
  <text x="566" y="184">Ø 80</text>
  <path d="M182 340L120 270H70" class="w-bp__leader"/>
  <text x="72" y="264">R 26</text>`;

export function render({ world }) {
  const parts = PARTS.map(
    (p, i) => `<g class="w-bp__part" data-part="${i}" style="--ex:${p.ex}px"><path d="${p.d}" pathLength="1" class="w-bp__stroke" style="--i:${i}"/><text x="${[620, 476, 540, 700, 140, 500][i]}" y="${[572, 420, 470, 386, 400, 250][i]}" class="w-bp__tag">${p.no}</text></g>`,
  ).join('');
  return `
  <div class="w-bp__layout">
    <figure class="w-bp__sheet">
      <svg class="w-bp__svg" viewBox="0 0 900 640" role="img" aria-label="Technical drawing of a desk orrery with six parts, shown assembled with dimension annotations." data-drawing>
        <defs>
          <marker id="w-bp-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 1L10 5 0 9z" class="w-bp__arrowhead"/></marker>
        </defs>
        <path d="M450 200V600" class="w-bp__center"/>
        <g class="w-bp__assembly-lines"><path d="M450 120V630M200 300V420M706 300V420"/></g>
        <g class="w-bp__parts">${parts}</g>
        <g class="w-bp__dims">${DIMS}</g>
        <g class="w-bp__plan" transform="translate(110 110)">
          <circle r="62" class="w-bp__plan-orbit"/><circle r="38" class="w-bp__plan-orbit"/><circle r="10" class="w-bp__plan-sun"/>
          <g data-plan-a><circle cx="62" cy="0" r="7" class="w-bp__plan-planet"/></g>
          <g data-plan-b><circle cx="38" cy="0" r="5" class="w-bp__plan-planet"/></g>
          <text y="88" text-anchor="middle">PLAN · 1:8</text>
        </g>
        <g class="w-bp__cursor" data-cursor><path d="M-14 0H14M0 -14V14"/><circle r="6"/></g>
        <g class="w-bp__titleblock" transform="translate(640 20)">
          <path d="M0 0H240V96H0ZM0 30H240M0 60H240M120 60V96"/>
          <text x="10" y="21">DESK ORRERY — MK II</text>
          <text x="10" y="51">DWG WW-38 · SHEET 1/1</text>
          <text x="10" y="84">SCALE 1:4</text>
          <text x="130" y="84">REV C</text>
        </g>
      </svg>
    </figure>
    <section class="w-bp__panel">
      <p class="w-bp__kicker">Drawing office · fictional instrument</p>
      <h1 class="w-bp__title">${esc(world.label)}</h1>
      <p class="ww-caption w-bp__caption">${esc(world.description)}</p>
      <div class="w-bp__callout" data-callout aria-hidden="true">
        <p class="w-bp__callout-no" data-c-no>PART 01 / 06</p>
        <p class="w-bp__callout-name" data-c-name>Base plinth</p>
        <p class="w-bp__callout-meta" data-c-meta>Walnut, ebonised · felt pads ×4</p>
      </div>
      <div class="w-bp__controls" role="group" aria-label="Drawing controls">
        <button type="button" data-world-action="explode" aria-pressed="false">Exploded view</button>
        <button type="button" data-world-action="dims" aria-pressed="true">Dimensions</button>
        <button type="button" data-world-action="part">Inspect next part</button>
      </div>
      <p class="w-bp__status" data-world-status role="status">Assembled · dimensions shown · part 1 of 6: Base plinth</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const drawing = root.querySelector('[data-drawing]');
  const planA = root.querySelector('[data-plan-a]');
  const planB = root.querySelector('[data-plan-b]');
  const cursor = root.querySelector('[data-cursor]');
  const parts = Array.from(root.querySelectorAll('[data-part]'));
  const state = { exploded: false, dims: true, part: 0 };

  function sync() {
    const p = PARTS[state.part];
    root.dataset.exploded = String(state.exploded);
    root.dataset.dims = String(state.dims);
    parts.forEach((el, i) => el.classList.toggle('is-active', i === state.part));
    root.querySelector('[data-c-no]').textContent = `PART ${String(state.part + 1).padStart(2, '0')} / ${String(PARTS.length).padStart(2, '0')} · ${p.no}`;
    root.querySelector('[data-c-name]').textContent = p.name;
    root.querySelector('[data-c-meta]').textContent = `${p.material.replace(/^./, (c) => c.toUpperCase())} · ${p.note}`;
    root.querySelector('[data-world-action="explode"]').setAttribute('aria-pressed', String(state.exploded));
    root.querySelector('[data-world-action="dims"]').setAttribute('aria-pressed', String(state.dims));
    drawing.setAttribute(
      'aria-label',
      `Technical drawing of a desk orrery with six parts, shown ${state.exploded ? 'exploded along its axis' : 'assembled'}${state.dims ? ' with dimension annotations' : ''}; part ${state.part + 1}, ${p.name}, is highlighted.`,
    );
    ctx.status(`${state.exploded ? 'Exploded' : 'Assembled'} · dimensions ${state.dims ? 'shown' : 'hidden'} · part ${state.part + 1} of ${PARTS.length}: ${p.name} (${p.material})`);
  }

  ctx.actions({
    explode() {
      state.exploded = !state.exploded;
      sync();
    },
    dims() {
      state.dims = !state.dims;
      sync();
    },
    part() {
      state.part = (state.part + 1) % PARTS.length;
      sync();
    },
  });

  ctx.loop(({ time }) => {
    planA.setAttribute('transform', `rotate(${((time * 24) % 360).toFixed(2)})`);
    planB.setAttribute('transform', `rotate(${((time * 60) % 360).toFixed(2)})`);
    const x = 220 + ((Math.sin(time * 0.25) + 1) / 2) * 480;
    const y = 250 + ((Math.sin(time * 0.37 + 1) + 1) / 2) * 320;
    cursor.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  });

  sync();
}
