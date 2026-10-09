import './swiss-design.css';
import { esc } from '../lib/dom.js';

// Positions are in grid modules: 12 columns × 8 rows. Every element moves only along the grid.
const COMPOSITIONS = [
  {
    name: 'A',
    circle: { c: 6.5, r: -1, w: 6.5 },
    bar1: { c: 0, r: 5, w: 8 },
    bar2: { c: 2, r: 6.5, w: 5 },
    type: { c: 0.5, r: 0.6 },
    rot: { c: 11.2, r: 2.6 },
    info: { c: 8, r: 5.7 },
  },
  {
    name: 'B',
    circle: { c: -1.5, r: 3, w: 5.5 },
    bar1: { c: 4, r: 1, w: 8 },
    bar2: { c: 7, r: 2, w: 5 },
    type: { c: 4.3, r: 3.6 },
    rot: { c: 2.6, r: 0.4 },
    info: { c: 4.3, r: 6.4 },
  },
  {
    name: 'C',
    circle: { c: 3.5, r: 1.2, w: 5 },
    bar1: { c: 0, r: 1.5, w: 12 },
    bar2: { c: 0, r: 7.2, w: 7 },
    type: { c: 0.5, r: 4 },
    rot: { c: 11.2, r: 3.4 },
    info: { c: 8, r: 0.3 },
  },
  {
    name: 'D',
    circle: { c: 7.5, r: 4.2, w: 5.5 },
    bar1: { c: 1, r: 0.6, w: 6 },
    bar2: { c: 1, r: 1.3, w: 3 },
    type: { c: 1, r: 2.3 },
    rot: { c: 10.4, r: 0.3 },
    info: { c: 1, r: 6.3 },
  },
];

export function render({ world }) {
  const [first, second] = world.label.split(' ');
  return `
  <div class="w-swiss__wrap">
    <div class="w-swiss__poster">
      <div class="w-swiss__grid" aria-hidden="true"></div>
      <span class="w-swiss__circle" data-el="circle" aria-hidden="true"></span>
      <span class="w-swiss__bar" data-el="bar1" aria-hidden="true"></span>
      <span class="w-swiss__bar w-swiss__bar--thin" data-el="bar2" aria-hidden="true"></span>
      <span class="w-swiss__square" data-square aria-hidden="true"></span>
      <span class="w-swiss__scan" aria-hidden="true"></span>
      <h1 class="w-swiss__type" data-el="type"><span>${esc(first)}</span> <span>${esc(second ?? '')}</span></h1>
      <p class="w-swiss__rot" data-el="rot" aria-hidden="true">Raster Festival — Linien und Flächen — 26</p>
      <ol class="w-swiss__info" data-el="info" aria-hidden="true">
        <li><b>01</b> Grid<br>12 × 8 modules</li>
        <li><b>02</b> Type<br>flush left, ragged right</li>
        <li><b>03</b> Motion<br>only along the grid</li>
      </ol>
    </div>
    <aside class="w-swiss__side">
      <p class="w-swiss__eyebrow">Poster study Nr. 13</p>
      <p class="ww-caption w-swiss__caption">${esc(world.description)}</p>
      <div class="w-swiss__controls" role="group" aria-label="Poster controls">
        <button type="button" data-world-action="compose">Recompose → <span data-value>A</span></button>
        <button type="button" data-world-action="grid" aria-pressed="false">Show grid</button>
        <button type="button" data-world-action="invert" aria-pressed="false">Invert ground</button>
      </div>
      <p class="w-swiss__status" data-world-status role="status">Composition A · grid hidden · white ground</p>
      <dl class="w-swiss__spec" aria-hidden="true">
        <div><dt>Format</dt><dd>3 : 4</dd></div>
        <div><dt>Grid</dt><dd>12 col · 8 row</dd></div>
        <div><dt>Colour</dt><dd>Signal red · black</dd></div>
      </dl>
    </aside>
  </div>`;
}

export function mount(root, ctx) {
  const poster = root.querySelector('.w-swiss__poster');
  const els = Object.fromEntries(Array.from(root.querySelectorAll('[data-el]')).map((el) => [el.dataset.el, el]));
  const square = root.querySelector('[data-square]');
  const state = { comp: 0, grid: false, invert: false, tick: 0 };

  function place() {
    const comp = COMPOSITIONS[state.comp];
    for (const key of Object.keys(els)) {
      const p = comp[key];
      els[key].style.setProperty('--c', String(p.c));
      els[key].style.setProperty('--r', String(p.r));
      if (p.w !== undefined) els[key].style.setProperty('--w', String(p.w));
    }
  }

  function moveSquare() {
    const cell = state.tick % 24;
    const c = cell < 12 ? cell : 23 - cell;
    square.style.setProperty('--c', String(c));
  }

  function sync() {
    poster.dataset.grid = String(state.grid);
    root.dataset.ground = state.invert ? 'black' : 'white';
    root.querySelector('[data-world-action="compose"] [data-value]').textContent = COMPOSITIONS[state.comp].name;
    ctx.status(`Composition ${COMPOSITIONS[state.comp].name} · grid ${state.grid ? 'visible' : 'hidden'} · ${state.invert ? 'black' : 'white'} ground`);
  }

  ctx.actions({
    compose() {
      state.comp = (state.comp + 1) % COMPOSITIONS.length;
      place();
      sync();
    },
    grid(button) {
      state.grid = !state.grid;
      button.setAttribute('aria-pressed', String(state.grid));
      sync();
    },
    invert(button) {
      state.invert = !state.invert;
      button.setAttribute('aria-pressed', String(state.invert));
      sync();
    },
  });

  ctx.every(750, () => {
    state.tick += 1;
    moveSquare();
  });

  place();
  moveSquare();
  sync();
}
