import './claymorphism.css';
import { esc, pressOne } from '../lib/dom.js';

const PALETTES = [
  { id: 'bubblegum', name: 'Bubblegum' },
  { id: 'mint', name: 'Mint' },
  { id: 'blueberry', name: 'Blueberry' },
];
const MAX_PEBBLES = 7;
const TONES = ['a', 'b', 'c'];

export function render({ world }) {
  const swatches = PALETTES.map(
    (p, i) => `
        <button type="button" class="w-clay__swatch w-clay__clay" data-world-action="palette" data-value="${p.id}" aria-pressed="${i === 0}">
          <span class="w-clay__dot w-clay__dot--${p.id}" aria-hidden="true"></span>${p.name}
        </button>`,
  ).join('');

  return `
  <div class="w-clay__sky" aria-hidden="true">
    <span class="w-clay__float w-clay__float--pill w-clay__clay"></span>
    <span class="w-clay__float w-clay__float--ball w-clay__clay"></span>
    <span class="w-clay__float w-clay__float--donut w-clay__clay"></span>
    <span class="w-clay__float w-clay__float--cube w-clay__clay"></span>
    <span class="w-clay__float w-clay__float--bean w-clay__clay"></span>
  </div>
  <div class="w-clay__layout">
    <article class="w-clay__card w-clay__clay">
      <p class="w-clay__eyebrow"><span class="w-clay__chip w-clay__clay" aria-hidden="true"></span>Soft interface kit · v3</p>
      <h1 class="w-clay__title">${esc(world.label)}</h1>
      <p class="ww-caption w-clay__caption">${esc(world.description)}</p>
      <div class="w-clay__meter" aria-hidden="true">
        <span class="w-clay__meter-label">Squish</span>
        <span class="w-clay__track"><span class="w-clay__fill w-clay__clay"></span></span>
      </div>
      <div class="w-clay__group" role="group" aria-label="Clay colour">${swatches}
      </div>
      <div class="w-clay__row">
        <button type="button" class="w-clay__switch w-clay__clay" data-world-action="puff" aria-pressed="false">
          <span class="w-clay__switch-track" aria-hidden="true"><span class="w-clay__knob w-clay__clay"></span></span>
          Extra puffy
        </button>
        <button type="button" class="w-clay__drop w-clay__clay" data-world-action="pebble">Drop a pebble</button>
      </div>
      <p class="w-clay__status" data-world-status role="status">Bubblegum clay · regular puff · tray empty</p>
    </article>
    <figure class="w-clay__tray-wrap" aria-hidden="true">
      <div class="w-clay__tray w-clay__clay"><div class="w-clay__pebbles"></div></div>
      <figcaption class="w-clay__tray-label">pebble tray · 0/${MAX_PEBBLES}</figcaption>
    </figure>
  </div>`;
}

export function mount(root, ctx) {
  const tray = root.querySelector('.w-clay__pebbles');
  const trayLabel = root.querySelector('.w-clay__tray-label');
  const state = { palette: 'bubblegum', puffy: false, pebbles: 0, emptied: false };

  function sync() {
    root.dataset.palette = state.palette;
    root.dataset.puff = state.puffy ? 'extra' : 'regular';
    const name = PALETTES.find((p) => p.id === state.palette).name;
    let trayText = 'tray empty';
    if (state.pebbles) trayText = `${state.pebbles} of ${MAX_PEBBLES} pebbles in the tray`;
    else if (state.emptied) trayText = 'tray squished flat and emptied';
    trayLabel.textContent = `pebble tray · ${state.pebbles}/${MAX_PEBBLES}`;
    ctx.status(`${name} clay · ${state.puffy ? 'extra puffy' : 'regular puff'} · ${trayText}`);
  }

  ctx.actions({
    palette(button) {
      state.palette = button.dataset.value;
      pressOne(root.querySelectorAll('[data-world-action="palette"]'), button);
      sync();
    },
    puff(button) {
      state.puffy = !state.puffy;
      button.setAttribute('aria-pressed', String(state.puffy));
      sync();
    },
    pebble() {
      if (state.pebbles >= MAX_PEBBLES) {
        tray.replaceChildren();
        state.pebbles = 0;
        state.emptied = true;
      } else {
        const pebble = document.createElement('span');
        pebble.className = `w-clay__pebble w-clay__clay w-clay__pebble--${TONES[state.pebbles % TONES.length]}`;
        pebble.style.setProperty('--size', `${30 + Math.round(Math.random() * 26)}px`);
        pebble.style.setProperty('--tilt', `${Math.round(Math.random() * 40 - 20)}deg`);
        pebble.style.setProperty('--squash', (0.76 + Math.random() * 0.14).toFixed(2));
        tray.append(pebble);
        state.pebbles += 1;
        state.emptied = false;
      }
      sync();
    },
  });

  sync();
}
