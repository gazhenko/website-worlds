import './bohemian.css';
import { esc } from '../lib/dom.js';
import { approach } from '../lib/math.js';
import { blobPath } from '../lib/svg.js';

const WEAVES = [
  { id: 'kilim', name: 'Kilim' },
  { id: 'zigzag', name: 'Zigzag' },
  { id: 'medallion', name: 'Medallion' },
];
const TIMES = [
  { id: 'morning', name: 'Morning', sky: ['#cfe3e8', '#f6dcc8'], sun: { x: 300, y: 360 } },
  { id: 'noon', name: 'Noon', sky: ['#9fcfe0', '#eef3e6'], sun: { x: 370, y: 210 } },
  { id: 'golden', name: 'Golden hour', sky: ['#f08a4b', '#f7d38b'], sun: { x: 450, y: 400 } },
];
const BREEZES = [
  { id: 'soft', name: 'Soft', amp: 2.4, freq: 0.9 },
  { id: 'breezy', name: 'Breezy', amp: 6.5, freq: 1.6 },
  { id: 'still', name: 'Still', amp: 0, freq: 0 },
];
const ARCH = { x0: 160, x1: 580, top: 70, bottom: 600 };
const ARCH_R = (ARCH.x1 - ARCH.x0) / 2;
const ARCH_CX = ARCH.x0 + ARCH_R;

const archPath = `M${ARCH.x0} ${ARCH.bottom}V${ARCH.top + ARCH_R}A${ARCH_R} ${ARCH_R} 0 0 1 ${ARCH.x1} ${ARCH.top + ARCH_R}V${ARCH.bottom}Z`;

function band(r, w) {
  const cy = ARCH.bottom;
  return `M${ARCH_CX - r} ${cy}A${r} ${r} 0 0 1 ${ARCH_CX + r} ${cy}L${ARCH_CX + r - w} ${cy}A${r - w} ${r - w} 0 0 0 ${ARCH_CX - r + w} ${cy}Z`;
}

function macrame() {
  let strands = '';
  let knots = '';
  for (let i = 0; i < 8; i++) {
    const x = 632 + i * 17;
    const bend = (i - 3.5) * 3;
    strands += `M${x} 96Q${x + bend} 260 ${x + bend * 0.4} 420`;
  }
  for (let row = 0; row < 5; row++) {
    const y = 140 + row * 46;
    const offset = row % 2 ? 8.5 : 0;
    for (let i = 0; i < 4 - (row % 2); i++) knots += `<circle cx="${640 + offset + i * 34}" cy="${y}" r="6"/>`;
  }
  let fringe = '';
  for (let i = 0; i < 16; i++) fringe += `M${628 + i * 8.6} 420l${(i % 2 ? 3 : -3).toFixed(0)} 54`;
  return { strands, knots, fringe };
}

function pampas() {
  let out = '';
  const stems = [
    { x: 92, top: 210, lean: -40 },
    { x: 104, top: 170, lean: 6 },
    { x: 118, top: 220, lean: 46 },
  ];
  for (const s of stems) {
    const tx = s.x + s.lean;
    out += `<path class="w-boho__stem" d="M${s.x} 560Q${s.x + s.lean * 0.2} 400 ${tx} ${s.top}"/>`;
    for (let k = 0; k < 14; k++) {
      const t = k / 13;
      const px = s.x + (tx - s.x) * (0.55 + t * 0.45);
      const py = 400 - (400 - s.top) * (0.1 + t * 0.9);
      out += `<path class="w-boho__plume" d="M${px.toFixed(1)} ${py.toFixed(1)}q${(-14 + (k % 3) * 4).toFixed(0)} -10 -20 -26M${px.toFixed(1)} ${py.toFixed(1)}q${(14 - (k % 3) * 4).toFixed(0)} -10 20 -26"/>`;
    }
  }
  return out;
}

export function render({ world }) {
  const sun = blobPath(0, 0, (a) => 46 + 8 * Math.sin(a * 13), 78);
  const m = macrame();
  const dots = Array.from({ length: 26 }, (_, i) => {
    const x = (i * 131) % 800;
    const y = 30 + ((i * 97) % 600);
    if (x > ARCH.x0 - 10 && x < ARCH.x1 + 10 && y > ARCH.top - 10) return '';
    return `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" class="w-boho__dot w-boho__dot--${i % 3}"/>`;
  }).join('');

  return `
  <div class="w-boho__layout">
    <figure class="w-boho__scene">
      <svg viewBox="0 0 800 760" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A sunlit arch with an organic sun, layered rainbow bands and hills, framed by swaying macramé, pampas plumes and a woven kilim runner.">
        <defs>
          <linearGradient id="w-boho-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" data-sky="0" stop-color="#cfe3e8"/><stop offset="1" data-sky="1" stop-color="#f6dcc8"/></linearGradient>
          <clipPath id="w-boho-arch"><path d="${archPath}"/></clipPath>
          <pattern id="w-boho-kilim" width="60" height="40" patternUnits="userSpaceOnUse" data-weave-pattern>
            <rect width="60" height="40" fill="#b9562f"/><path d="M30 4l16 16-16 16-16-16z" fill="#d9a441"/><path d="M30 12l8 8-8 8-8-8z" fill="#f3e6d3"/><path d="M0 0l8 20-8 20zM60 0l-8 20 8 20z" fill="#8a9a6b"/>
          </pattern>
          <pattern id="w-boho-zigzag" width="40" height="40" patternUnits="userSpaceOnUse" data-weave-pattern>
            <rect width="40" height="40" fill="#f3e6d3"/><path d="M0 12l10-8 10 8 10-8 10 8v8l-10-8-10 8-10-8-10 8z" fill="#b9562f"/><path d="M0 30l10-8 10 8 10-8 10 8v6l-10-8-10 8-10-8-10 8z" fill="#8a9a6b"/>
          </pattern>
          <pattern id="w-boho-medallion" width="56" height="40" patternUnits="userSpaceOnUse" data-weave-pattern>
            <rect width="56" height="40" fill="#5f6f4a"/><circle cx="28" cy="20" r="14" fill="#d9a441"/><circle cx="28" cy="20" r="7" fill="#b9562f"/><path d="M28 2v6M28 32v6M10 20h6M40 20h6" stroke="#f3e6d3" stroke-width="3"/>
          </pattern>
        </defs>
        <g class="w-boho__dots">${dots}</g>
        <path d="${archPath}" class="w-boho__arch-shadow" transform="translate(10 12)"/>
        <g clip-path="url(#w-boho-arch)">
          <rect x="${ARCH.x0}" y="${ARCH.top}" width="${ARCH.x1 - ARCH.x0}" height="${ARCH.bottom - ARCH.top}" fill="url(#w-boho-sky)"/>
          <g data-sun transform="translate(300 360)"><path d="${sun}" class="w-boho__sun-rays"/><circle r="36" class="w-boho__sun"/></g>
          <path d="M${ARCH.x0} 470Q260 400 360 450T${ARCH.x1} 430V${ARCH.bottom}H${ARCH.x0}Z" class="w-boho__hill w-boho__hill--far"/>
          <path d="${band(232, 34)}" class="w-boho__band w-boho__band--1"/>
          <path d="${band(196, 34)}" class="w-boho__band w-boho__band--2"/>
          <path d="${band(160, 34)}" class="w-boho__band w-boho__band--3"/>
          <path d="${band(124, 34)}" class="w-boho__band w-boho__band--4"/>
          <path d="M${ARCH.x0} 540Q300 500 420 530T${ARCH.x1} 520V${ARCH.bottom}H${ARCH.x0}Z" class="w-boho__hill w-boho__hill--near"/>
        </g>
        <path d="${archPath}" class="w-boho__arch-frame"/>
        <g class="w-boho__macrame" data-sway="macrame">
          <path d="M612 96H770" class="w-boho__dowel"/>
          <path d="M612 96L690 40L770 96" class="w-boho__cord"/>
          <path d="${m.strands}" class="w-boho__strands"/>
          <g class="w-boho__knots">${m.knots}</g>
          <path d="${m.fringe}" class="w-boho__fringe"/>
        </g>
        <g class="w-boho__pampas" data-sway="pampas">${pampas()}</g>
        <path d="M62 560c-6-60 20-80 46-80s52 20 46 80c-4 30-20 50-46 50s-42-20-46-50z" class="w-boho__vase"/>
        <path d="M80 520h56" class="w-boho__vase-line"/>
        <g data-sway="leaf" class="w-boho__leaf">
          <path d="M700 640C690 560 720 500 780 480C790 540 760 600 700 640Z"/>
          <path d="M700 640Q730 560 778 486" class="w-boho__vein"/>
        </g>
        <rect x="0" y="620" width="800" height="90" fill="url(#w-boho-kilim)" class="w-boho__runner" data-runner/>
        <path d="M0 620H800M0 710H800" class="w-boho__runner-edge"/>
        <path d="${Array.from({ length: 50 }, (_, i) => `M${8 + i * 16} 710v18`).join('')}" class="w-boho__tassels"/>
      </svg>
    </figure>
    <section class="w-boho__card">
      <p class="w-boho__kicker">☼ a slow afternoon</p>
      <h1 class="w-boho__title">${esc(world.label)}</h1>
      <p class="ww-caption w-boho__caption">${esc(world.description)}</p>
      <div class="w-boho__controls" role="group" aria-label="Room controls">
        <button type="button" data-world-action="weave">Weave · <span data-value>Kilim</span></button>
        <button type="button" data-world-action="sun">Sun · <span data-sun-name>Morning</span></button>
        <button type="button" data-world-action="breeze">Breeze · <span data-breeze>Soft</span></button>
      </div>
      <p class="w-boho__status" data-world-status role="status">Kilim weave · morning sun · soft breeze</p>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const sun = root.querySelector('[data-sun]');
  const runner = root.querySelector('[data-runner]');
  const skyStops = [root.querySelector('[data-sky="0"]'), root.querySelector('[data-sky="1"]')];
  const sways = {
    macrame: { el: root.querySelector('[data-sway="macrame"]'), pivot: [690, 40], k: 1, ph: 0 },
    pampas: { el: root.querySelector('[data-sway="pampas"]'), pivot: [104, 560], k: 1.3, ph: 1.4 },
    leaf: { el: root.querySelector('[data-sway="leaf"]'), pivot: [700, 640], k: 0.9, ph: 2.2 },
  };
  const patterns = Array.from(root.querySelectorAll('[data-weave-pattern]'));
  const state = { weave: 0, time: 0, breeze: 0 };
  const sunPos = { ...TIMES[0].sun };
  let amp = BREEZES[0].amp;
  let swayClock = 0;
  let spin = 0;

  function sync() {
    const t = TIMES[state.time];
    root.dataset.time = t.id;
    runner.setAttribute('fill', `url(#w-boho-${WEAVES[state.weave].id})`);
    skyStops[0].setAttribute('stop-color', t.sky[0]);
    skyStops[1].setAttribute('stop-color', t.sky[1]);
    root.querySelector('[data-world-action="weave"] [data-value]').textContent = WEAVES[state.weave].name;
    root.querySelector('[data-sun-name]').textContent = t.name;
    root.querySelector('[data-breeze]').textContent = BREEZES[state.breeze].name;
    ctx.status(`${WEAVES[state.weave].name} weave · ${t.name.toLowerCase()} sun · ${BREEZES[state.breeze].name.toLowerCase()} breeze`);
  }

  ctx.actions({
    weave() {
      state.weave = (state.weave + 1) % WEAVES.length;
      sync();
    },
    sun() {
      state.time = (state.time + 1) % TIMES.length;
      sync();
    },
    breeze() {
      state.breeze = (state.breeze + 1) % BREEZES.length;
      sync();
    },
  });

  ctx.loop(({ dt, running }) => {
    const breeze = BREEZES[state.breeze];
    const target = TIMES[state.time].sun;
    if (running) {
      sunPos.x = approach(sunPos.x, target.x, 1.2, dt);
      sunPos.y = approach(sunPos.y, target.y, 1.2, dt);
      amp = approach(amp, breeze.amp, 1.5, dt);
    } else {
      sunPos.x = target.x;
      sunPos.y = target.y;
      amp = breeze.amp;
    }
    spin = (spin + dt * 6) % 360;
    swayClock += dt * (0.6 + breeze.freq);
    sun.setAttribute('transform', `translate(${sunPos.x.toFixed(1)} ${sunPos.y.toFixed(1)}) rotate(${spin.toFixed(2)})`);
    for (const s of Object.values(sways)) {
      const angle = Math.sin(swayClock * s.k + s.ph) * amp * (running ? 1 : 0.4);
      s.el.setAttribute('transform', `rotate(${angle.toFixed(2)} ${s.pivot[0]} ${s.pivot[1]})`);
    }
    const shift = (swayClock * 6) % 60;
    for (const p of patterns) p.setAttribute('patternTransform', `translate(${shift.toFixed(1)} 0)`);
  });

  sync();
}
