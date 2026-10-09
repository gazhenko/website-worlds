import './clay-3d.css';
import { esc } from '../lib/dom.js';

const SCULPTURES = [
  { id: 'snail', name: 'Snail' },
  { id: 'cactus', name: 'Cactus pot' },
  { id: 'robot', name: 'Robot' },
];
const LIGHTS = [
  { id: 'left', name: 'left', cx: 0.32, cy: 0.3, fx: 0.24, fy: 0.22, shadow: 34 },
  { id: 'top', name: 'top', cx: 0.5, cy: 0.22, fx: 0.5, fy: 0.12, shadow: 0 },
  { id: 'right', name: 'right', cx: 0.68, cy: 0.3, fx: 0.76, fy: 0.22, shadow: -34 },
];
const MATERIALS = {
  green: ['#f1ffc4', '#a8cf52', '#5d7f22'],
  orange: ['#ffe1bf', '#f08a4b', '#8f3a14'],
  terracotta: ['#ffd2b8', '#d9774a', '#7f3519'],
  cactus: ['#d8f7c2', '#5fae5a', '#24572a'],
  blue: ['#e6f6ff', '#8cc6ef', '#3d6f9e'],
  cream: ['#ffffff', '#f2e8d8', '#b9a98f'],
  pink: ['#ffe0ea', '#f58fb0', '#a6416a'],
  sun: ['#fff8c8', '#ffd24d', '#d18a10'],
  ground: ['#f9e3bd', '#d9ae73', '#9a6a3a'],
  cloud: ['#ffffff', '#f3f1ff', '#c9c4e8'],
  dark: ['#7a7a8a', '#3b3b48', '#14141c'],
};
const SQUASH = [
  [1.12, 0.82],
  [1.28, 0.62],
  [1.2, 0.7],
  [0.9, 1.16],
  [0.95, 1.08],
  [1.04, 0.96],
  [1, 1],
];

const grads = Object.entries(MATERIALS)
  .map(
    ([id, [hi, mid, lo]]) =>
      `<radialGradient id="w-c3-${id}" data-lit cx="0.32" cy="0.3" fx="0.24" fy="0.22" r="0.8"><stop offset="0" stop-color="${hi}"/><stop offset="0.45" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></radialGradient>`,
  )
  .join('');

const thumb = (x, y, r = 10) => `<path d="M${x - r} ${y}a${r} ${r * 0.6} 0 0 1 ${r * 2} 0" class="w-c3__thumb"/>`;

const SNAIL = `
  <g data-sculpt="snail">
    <g data-boil><path d="M236 470C236 438 300 430 360 432H520C560 432 584 450 580 470Z" fill="url(#w-c3-green)"/>${thumb(300, 452)}${thumb(470, 448, 12)}</g>
    <g data-boil data-part="neck"><path d="M512 446C530 404 552 376 580 376C604 376 612 400 600 440Z" fill="url(#w-c3-green)"/>
      <path d="M572 382L560 334M592 384L604 338" class="w-c3__stalk"/>
      <circle cx="560" cy="330" r="12" fill="url(#w-c3-cream)"/><circle cx="604" cy="334" r="12" fill="url(#w-c3-cream)"/>
      <circle cx="563" cy="332" r="5" fill="#1d1d24"/><circle cx="607" cy="336" r="5" fill="#1d1d24"/>
      <path d="M574 410q10 8 20 0" class="w-c3__smile"/></g>
    <g data-boil><circle cx="400" cy="370" r="96" fill="url(#w-c3-orange)"/>
      <path d="M400 370m-62 0a62 62 0 1 0 62-62a42 42 0 1 0 -42 42a24 24 0 1 0 24-24" class="w-c3__spiral"/>${thumb(350, 310, 14)}${thumb(450, 420, 12)}</g>
  </g>`;

const CACTUS = `
  <g data-sculpt="cactus">
    <g data-boil><path d="M362 380C350 300 352 230 372 206C390 184 414 184 430 206C448 232 452 300 440 380Z" fill="url(#w-c3-cactus)"/>${thumb(400, 260, 12)}
      <path d="M380 240l-8-4M378 300l-9-2M424 250l8-4M426 320l9-2M400 220v-8" class="w-c3__spine"/></g>
    <g data-boil><path d="M362 320C330 320 314 300 314 270C314 252 330 248 336 262C340 274 344 290 364 292Z" fill="url(#w-c3-cactus)"/></g>
    <g data-boil data-part="arm"><path d="M440 300C474 300 488 276 486 246C484 228 468 226 464 242C460 258 458 270 438 274Z" fill="url(#w-c3-cactus)"/></g>
    <g data-boil><circle cx="392" cy="196" r="10" fill="url(#w-c3-pink)"/><circle cx="408" cy="194" r="10" fill="url(#w-c3-pink)"/><circle cx="400" cy="184" r="10" fill="url(#w-c3-pink)"/><circle cx="400" cy="194" r="6" fill="url(#w-c3-sun)"/></g>
    <g data-boil><path d="M330 470L346 386H454L470 470Z" fill="url(#w-c3-terracotta)"/><rect x="326" y="362" width="148" height="32" rx="14" fill="url(#w-c3-terracotta)"/>${thumb(380, 430, 12)}${thumb(430, 446, 10)}</g>
  </g>`;

const ROBOT = `
  <g data-sculpt="robot">
    <g data-boil><rect x="356" y="430" width="34" height="42" rx="14" fill="url(#w-c3-dark)"/><rect x="410" y="430" width="34" height="42" rx="14" fill="url(#w-c3-dark)"/></g>
    <g data-boil><rect x="330" y="320" width="140" height="122" rx="40" fill="url(#w-c3-blue)"/><circle cx="400" cy="382" r="24" fill="url(#w-c3-cream)"/><circle cx="400" cy="382" r="9" fill="url(#w-c3-pink)"/>${thumb(360, 350, 12)}</g>
    <g data-boil><rect x="296" y="336" width="40" height="82" rx="20" fill="url(#w-c3-blue)" transform="rotate(12 316 340)"/></g>
    <g data-boil data-part="arm"><rect x="464" y="300" width="40" height="82" rx="20" fill="url(#w-c3-blue)"/></g>
    <g data-boil data-part="head"><rect x="346" y="218" width="108" height="96" rx="34" fill="url(#w-c3-cream)"/>
      <circle cx="378" cy="262" r="14" fill="url(#w-c3-dark)"/><circle cx="422" cy="262" r="14" fill="url(#w-c3-dark)"/>
      <circle cx="382" cy="258" r="4" fill="#fff"/><circle cx="426" cy="258" r="4" fill="#fff"/>
      <path d="M384 292q16 10 32 0" class="w-c3__smile"/>
      <path d="M400 218v-26" class="w-c3__stalk"/><circle cx="400" cy="186" r="10" fill="url(#w-c3-pink)"/></g>
  </g>`;

export function render({ world }) {
  return `
  <div class="w-c3__layout">
    <div class="w-c3__set">
      <svg class="w-c3__svg" viewBox="0 0 800 600" role="img" aria-label="A plasticine set: a clay snail on a clay slab under a clay sun on a wire, lit from the left." data-set>
        <defs>${grads}</defs>
        <rect width="800" height="600" class="w-c3__backdrop"/>
        <g data-boil class="w-c3__cloud"><path d="M90 150c0-30 30-46 56-36 10-26 52-30 66-4 30-6 52 14 48 40H90z" fill="url(#w-c3-cloud)"/></g>
        <g data-boil class="w-c3__cloud"><path d="M520 110c0-22 24-34 44-26 8-20 40-22 50-2 24-4 40 10 36 30H520z" fill="url(#w-c3-cloud)"/></g>
        <path d="M680 0V96" class="w-c3__wire"/>
        <g data-boil><circle cx="680" cy="120" r="40" fill="url(#w-c3-sun)"/>${thumb(670, 110, 12)}</g>
        <g data-boil><path d="M40 600C40 520 160 470 400 466S760 520 760 600Z" fill="url(#w-c3-ground)"/>${thumb(150, 540, 16)}${thumb(640, 530, 14)}</g>
        <ellipse cx="400" cy="474" rx="170" ry="18" class="w-c3__shadow" data-shadow/>
        <g data-boil class="w-c3__grass"><path d="M110 520q-6-30 6-46M126 522q2-26 18-38M650 512q-4-30 10-44M666 516q6-24 22-32"/></g>
        <g data-figure>${SNAIL}${CACTUS}${ROBOT}</g>
      </svg>
      <div class="w-c3__grain" aria-hidden="true"></div>
      <p class="w-c3__slate" aria-hidden="true"><span>SCENE 30</span><span>TAKE 4</span><span data-frame>FRAME 0000</span></p>
    </div>
    <section class="w-c3__panel">
      <p class="w-c3__kicker">Stop-motion stage · shot on twelves</p>
      <h1 class="w-c3__title">${esc(world.label)}</h1>
      <p class="ww-caption w-c3__caption">${esc(world.description)}</p>
      <div class="w-c3__controls" role="group" aria-label="Set controls">
        <button type="button" data-world-action="sculpt">Next sculpture · <span data-value>Cactus pot</span></button>
        <button type="button" data-world-action="light">Key light · <span data-light>Left</span></button>
        <button type="button" data-world-action="squash">Squash!</button>
      </div>
      <p class="w-c3__status" data-world-status role="status">Snail · key light from the left · standing tall</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const svg = root.querySelector('[data-set]');
  const figure = root.querySelector('[data-figure]');
  const shadow = root.querySelector('[data-shadow]');
  const frameEl = root.querySelector('[data-frame]');
  const gradients = Array.from(root.querySelectorAll('[data-lit]'));
  const state = { sculpt: 0, light: 0, squashStep: -1, held: false };
  let frame = 0;
  let walk = 0;

  const boilEls = () => Array.from(root.querySelectorAll('[data-boil]'));

  function applyLight() {
    const L = LIGHTS[state.light];
    for (const g of gradients) {
      g.setAttribute('cx', String(L.cx));
      g.setAttribute('cy', String(L.cy));
      g.setAttribute('fx', String(L.fx));
      g.setAttribute('fy', String(L.fy));
    }
    shadow.setAttribute('cx', String(400 + L.shadow));
    shadow.setAttribute('rx', String(L.shadow === 0 ? 150 : 175));
  }

  function poseFigure() {
    const s = state.squashStep >= 0 ? SQUASH[state.squashStep] : state.held ? SQUASH[1] : [1, 1];
    const x = state.sculpt === 0 ? walk : 0;
    figure.setAttribute('transform', `translate(${x + 400} 472) scale(${s[0]} ${s[1]}) translate(-400 -472)`);
  }

  function sync() {
    const sculpt = SCULPTURES[state.sculpt];
    root.dataset.model = sculpt.id;
    root.querySelector('[data-world-action="sculpt"] [data-value]').textContent = SCULPTURES[(state.sculpt + 1) % SCULPTURES.length].name;
    root.querySelector('[data-light]').textContent = LIGHTS[state.light].name.replace(/^./, (c) => c.toUpperCase());
    svg.setAttribute('aria-label', `A plasticine set: a clay ${sculpt.name.toLowerCase()} on a clay slab under a clay sun on a wire, lit from the ${LIGHTS[state.light].name}.`);
    const pose = state.held || state.squashStep >= 0 ? 'squashed flat' : 'standing tall';
    ctx.status(`${sculpt.name} · key light from the ${LIGHTS[state.light].name} · ${pose}`);
  }

  ctx.actions({
    sculpt() {
      state.sculpt = (state.sculpt + 1) % SCULPTURES.length;
      walk = 0;
      state.squashStep = ctx.running ? 0 : -1;
      sync();
      poseFigure();
    },
    light() {
      state.light = (state.light + 1) % LIGHTS.length;
      applyLight();
      sync();
    },
    squash() {
      if (ctx.running) {
        state.held = false;
        state.squashStep = 0;
      } else {
        state.held = !state.held;
      }
      sync();
      poseFigure();
    },
  });

  // Stop-motion: everything advances in discrete 12 fps steps.
  ctx.every(1000 / 12, () => {
    frame += 1;
    frameEl.textContent = `FRAME ${String(frame).padStart(4, '0')}`;
    for (const el of boilEls()) {
      const dx = (Math.random() - 0.5) * 1.6;
      const dy = (Math.random() - 0.5) * 1.6;
      const r = (Math.random() - 0.5) * 0.8;
      el.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${r.toFixed(2)} 400 400)`);
    }
    const part = figure.querySelector(`[data-sculpt="${SCULPTURES[state.sculpt].id}"] [data-part]`);
    if (part) {
      const phase = Math.floor(frame / 3) % 4;
      const angle = [0, 6, 10, 6][phase] * (part.dataset.part === 'arm' ? -2 : 1);
      const pivot = part.dataset.part === 'arm' ? '470 310' : part.dataset.part === 'head' ? '400 310' : '560 440';
      part.setAttribute('transform', `rotate(${angle} ${pivot})`);
    }
    if (state.sculpt === 0) {
      walk += 2;
      if (walk > 140) walk = -140;
    }
    if (state.squashStep >= 0) {
      state.squashStep += 1;
      if (state.squashStep >= SQUASH.length) {
        state.squashStep = -1;
        sync();
      }
    }
    poseFigure();
  });

  ctx.onMotion(
    (motion) => {
      if (!motion.running) {
        for (const el of boilEls()) el.removeAttribute('transform');
        state.squashStep = -1;
        poseFigure();
        sync();
      }
    },
    { immediate: false },
  );

  applyLight();
  poseFigure();
  sync();
}
