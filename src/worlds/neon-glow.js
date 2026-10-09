import './neon-glow.css';
import { esc } from '../lib/dom.js';

const SIGNS = [
  { word: 'open late', sub: 'NOODLES · TEA · RADIO', icon: 'moon' },
  { word: 'night owls', sub: 'TABLES UPSTAIRS', icon: 'arrow' },
  { word: 'after hours', sub: 'RECORDS · REPAIRS', icon: 'star' },
];
const GASES = [
  { id: 'neon', name: 'Neon pink' },
  { id: 'argon', name: 'Argon blue' },
  { id: 'helium', name: 'Helium amber' },
  { id: 'mercury', name: 'Mercury green' },
];
const ICONS = {
  moon: 'M760 108a44 44 0 1 0 34 74a36 36 0 1 1 -34 -74z',
  arrow: 'M720 150h70m-26 -26l26 26-26 26',
  star: 'M760 104l12 28 30 2-23 19 8 29-27-16-27 16 8-29-23-19 30-2z',
};
const FRAME = 'M90 60H810Q850 60 850 100V420Q850 460 810 460H90Q50 460 50 420V100Q50 60 90 60Z';

function signMarkup(sign) {
  const length = Math.min(700, sign.word.length * 66);
  return `
    <path d="${FRAME}" class="w-neon__glass" />
    <path d="${ICONS[sign.icon]}" class="w-neon__glass"/>
    <text x="450" y="300" text-anchor="middle" class="w-neon__glass-text" textLength="${length}" lengthAdjust="spacingAndGlyphs">${esc(sign.word)}</text>
    <g class="w-neon__lit" filter="url(#w-neon-glow)">
      <path d="${FRAME}" class="w-neon__tube w-neon__tube--b" pathLength="1"/>
      <path d="${ICONS[sign.icon]}" class="w-neon__tube w-neon__tube--b" pathLength="1"/>
      <text x="450" y="300" text-anchor="middle" class="w-neon__word" textLength="${length}" lengthAdjust="spacingAndGlyphs">${esc(sign.word)}</text>
      <text x="450" y="400" text-anchor="middle" class="w-neon__sub">${esc(sign.sub)}</text>
    </g>
    <path d="${FRAME}" class="w-neon__traveller" pathLength="100"/>`;
}

export function render({ world }) {
  return `
  <div class="w-neon__layout">
    <figure class="w-neon__sign-wrap">
      <svg class="w-neon__sign" viewBox="0 0 900 520" role="img" aria-label="A neon sign reading “open late” with a crescent moon, mounted on a brick wall." data-sign-svg>
        <defs>
          <filter id="w-neon-glow" x="-15%" y="-30%" width="130%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1"/>
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="b2"/>
            <feMerge><feMergeNode in="b2"/><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="w-neon-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.5"/></filter>
        </defs>
        <g class="w-neon__mounts"><circle cx="70" cy="40" r="6"/><circle cx="830" cy="40" r="6"/><path d="M70 40V10M830 40V10"/></g>
        <g data-sign>${signMarkup(SIGNS[0])}</g>
      </svg>
      <div class="w-neon__floor" aria-hidden="true"></div>
    </figure>
    <section class="w-neon__plaque">
      <h1 class="w-neon__title">${esc(world.label)}</h1>
      <p class="ww-caption w-neon__caption">${esc(world.description)}</p>
      <div class="w-neon__controls" role="group" aria-label="Sign controls">
        <button type="button" data-world-action="power" aria-pressed="true">Power: <span data-value>On</span></button>
        <button type="button" data-world-action="gas">Gas: <span data-gas>Neon pink</span></button>
        <button type="button" data-world-action="sign">Next sign</button>
      </div>
      <p class="w-neon__status" data-world-status role="status">Sign on · Neon pink · “open late”</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const holder = root.querySelector('[data-sign]');
  const svg = root.querySelector('[data-sign-svg]');
  const state = { on: true, gas: 0, sign: 0 };

  function ignite() {
    root.classList.remove('is-powering');
    void root.offsetWidth;
    root.classList.add('is-powering');
  }

  function sync() {
    root.dataset.gas = GASES[state.gas].id;
    root.dataset.power = state.on ? 'on' : 'off';
    const power = root.querySelector('[data-world-action="power"]');
    power.setAttribute('aria-pressed', String(state.on));
    power.querySelector('[data-value]').textContent = state.on ? 'On' : 'Off';
    root.querySelector('[data-gas]').textContent = GASES[state.gas].name;
    const sign = SIGNS[state.sign];
    svg.setAttribute('aria-label', `A neon sign reading “${sign.word}”, ${state.on ? 'glowing' : 'switched off'}, on a brick wall.`);
    ctx.status(`Sign ${state.on ? 'on' : 'off'} · ${GASES[state.gas].name} · “${sign.word}”`);
  }

  ctx.actions({
    power() {
      state.on = !state.on;
      if (state.on) ignite();
      sync();
    },
    gas() {
      state.gas = (state.gas + 1) % GASES.length;
      sync();
    },
    sign() {
      state.sign = (state.sign + 1) % SIGNS.length;
      holder.innerHTML = signMarkup(SIGNS[state.sign]);
      if (state.on) ignite();
      sync();
    },
  });

  ignite();
  sync();
}
