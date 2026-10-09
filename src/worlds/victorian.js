import './victorian.css';
import { esc } from '../lib/dom.js';
import { approach, clamp, TAU } from '../lib/math.js';
import { createRng } from '../lib/random.js';

const r1 = (n) => n.toFixed(1);
const PLATES = [
  { id: 'fern', numeral: 'I', name: 'Fern', latin: 'Polypodium noctiflorum', note: 'gathered by lamplight, north bank' },
  { id: 'rose', numeral: 'II', name: 'Rose', latin: 'Rosa horologii', note: 'from the clockmaker’s garden' },
  { id: 'thistle', numeral: 'III', name: 'Thistle', latin: 'Carduus argentarius', note: 'found beside the old mint' },
];

// ---------- Engraving generators (hatched line work) ----------

function quad(p0, c, p1, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}

function quadTangent(p0, c, p1, t) {
  const dx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]);
  const dy = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]);
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

function leaf(base, dir, length, width, hatch = 3) {
  const [bx, by] = base;
  const [dx, dy] = dir;
  const px = -dy;
  const py = dx;
  const ex = bx + dx * length;
  const ey = by + dy * length;
  const mx = bx + dx * length * 0.5;
  const my = by + dy * length * 0.5;
  let outline = `M${r1(bx)} ${r1(by)}Q${r1(mx + px * width)} ${r1(my + py * width)} ${r1(ex)} ${r1(ey)}Q${r1(mx - px * width)} ${r1(my - py * width)} ${r1(bx)} ${r1(by)}`;
  outline += `M${r1(bx)} ${r1(by)}L${r1(ex)} ${r1(ey)}`;
  let lines = '';
  for (let i = 1; i <= hatch; i++) {
    const t = i / (hatch + 1);
    const cx = bx + dx * length * t;
    const cy = by + dy * length * t;
    const w = width * Math.sin(Math.PI * t) * 0.85;
    lines += `M${r1(cx)} ${r1(cy)}L${r1(cx + px * w + dx * 6)} ${r1(cy + py * w + dy * 6)}`;
  }
  return { outline, lines };
}

function fern() {
  const p0 = [260, 610];
  const c = [196, 360];
  const p1 = [282, 108];
  let outline = `M${p0[0]} ${p0[1]}Q${c[0]} ${c[1]} ${p1[0]} ${p1[1]}`;
  let lines = '';
  const n = 24;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const p = quad(p0, c, p1, t);
    const tan = quadTangent(p0, c, p1, t);
    const L = (16 + 104 * Math.sin(Math.PI * (1 - t) * 0.92 + 0.12)) * (1 - t * 0.55);
    for (const side of [-1, 1]) {
      const nx = -tan[1] * side;
      const ny = tan[0] * side;
      let dx = nx * 0.82 + tan[0] * 0.55;
      let dy = ny * 0.82 + tan[1] * 0.55;
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
      const l = leaf(p, [dx, dy], L, L * 0.17, L > 50 ? 4 : 2);
      outline += l.outline;
      lines += l.lines;
    }
  }
  return { outline, lines };
}

function rose() {
  const rng = createRng(7);
  let outline = 'M262 612C254 520 276 420 250 262';
  let lines = '';
  const cx = 250;
  const cy = 210;
  for (let ring = 0; ring < 4; ring++) {
    const count = 5 + ring * 2;
    const r = 16 + ring * 22;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + ring * 0.6;
      const span = (TAU / count) * 1.15;
      const p = (ang, rad) => `${r1(cx + Math.cos(ang) * rad)} ${r1(cy + Math.sin(ang) * rad * 0.82)}`;
      outline += `M${p(a, r * 0.55)}Q${p(a + span / 2, r * 1.28)} ${p(a + span, r * 0.55)}`;
      for (let h = 1; h <= 3; h++) {
        const aa = a + (span * h) / 4;
        lines += `M${p(aa, r * 0.62)}L${p(aa + 0.05, r * (0.62 + 0.12 * h))}`;
      }
    }
  }
  outline += `M${cx - 6} ${cy}q6 -10 12 0q-6 10 -12 0`;
  const leaves = [
    { at: [258, 470], dir: [-0.85, -0.5], len: 86 },
    { at: [262, 400], dir: [0.88, -0.45], len: 80 },
    { at: [254, 320], dir: [-0.8, -0.6], len: 66 },
  ];
  for (const lf of leaves) {
    const l = leaf(lf.at, lf.dir, lf.len, lf.len * 0.3, 5);
    outline += l.outline;
    lines += l.lines;
    const px = -lf.dir[1];
    const py = lf.dir[0];
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      const w = lf.len * 0.3 * Math.sin(Math.PI * t) * 0.98;
      for (const s of [-1, 1]) {
        const x = lf.at[0] + lf.dir[0] * lf.len * t + px * w * s;
        const y = lf.at[1] + lf.dir[1] * lf.len * t + py * w * s;
        lines += `M${r1(x)} ${r1(y)}l${r1(lf.dir[0] * 5 + px * s * 2)} ${r1(lf.dir[1] * 5 + py * s * 2)}`;
      }
    }
  }
  for (let k = 0; k < 8; k++) {
    const y = 300 + k * 38 + rng.range(-6, 6);
    const x = 256 + Math.sin(y * 0.02) * 6;
    const s = k % 2 ? 1 : -1;
    outline += `M${r1(x)} ${r1(y)}l${s * 10} -4l${-s * 9} -6`;
  }
  return { outline, lines };
}

function thistle() {
  let outline = 'M260 612C256 520 268 380 260 286';
  let lines = '';
  const cx = 260;
  const cy = 236;
  outline += `M${cx - 46} ${cy}a46 54 0 1 0 92 0a46 54 0 1 0 -92 0`;
  for (let k = -6; k <= 6; k++) {
    const off = k * 14;
    for (const s of [-1, 1]) {
      const x0 = cx + off - 60 * s;
      const pts = [];
      for (let t = 0; t <= 1.0001; t += 0.1) {
        const x = x0 + 120 * s * t;
        const y = cy - 60 + 120 * t;
        const inside = ((x - cx) / 44) ** 2 + ((y - cy) / 52) ** 2 < 1;
        pts.push(inside ? [x, y] : null);
      }
      let pen = false;
      for (const p of pts) {
        if (p) {
          lines += `${pen ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`;
          pen = true;
        } else pen = false;
      }
    }
  }
  for (let i = 0; i < 34; i++) {
    const a = -Math.PI + 0.35 + (i / 33) * (Math.PI - 0.7);
    const len = 58 + Math.sin(i * 1.7) * 14;
    const bx = cx + Math.cos(a) * 36;
    const by = cy - 36 + Math.sin(a) * 18;
    outline += `M${r1(bx)} ${r1(by)}L${r1(bx + Math.cos(a) * len)} ${r1(by + Math.sin(a) * len)}`;
  }
  const spiky = (x, y, dir, len) => {
    let d = `M${x} ${y}`;
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const w = Math.sin(Math.PI * t) * 26;
      const px = x + dir * len * t;
      const py = y - len * 0.45 * t;
      d += `L${r1(px)} ${r1(py - w * (i % 2 ? 1 : 0.4))}`;
      if (i % 2) lines += `M${r1(px)} ${r1(py - w)}l${dir * 8} -8`;
    }
    for (let i = steps - 1; i >= 0; i--) {
      const t = i / steps;
      const w = Math.sin(Math.PI * t) * 20;
      d += `L${r1(x + dir * len * t)} ${r1(y - len * 0.45 * t + w * (i % 2 ? 1 : 0.4))}`;
    }
    outline += d;
    lines += `M${x} ${y}L${r1(x + dir * len)} ${r1(y - len * 0.45)}`;
  };
  spiky(262, 520, -1, 150);
  spiky(260, 440, 1, 140);
  spiky(262, 360, -1, 100);
  return { outline, lines };
}

const ENGRAVINGS = { fern, rose, thistle };

// ---------- Gilt frame ----------

function flourish() {
  return 'M0 0C30 0 46 14 46 36C46 52 34 60 24 56C14 52 16 38 26 38M0 0C0 30 14 46 36 46C52 46 60 34 56 24C52 14 38 16 38 26M14 14C26 26 34 22 40 14';
}

// ---------- Gears ----------

function gearPath(teeth, r, depth) {
  let d = '';
  const step = TAU / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [
      [r - depth, a],
      [r + depth * 0.4, a + step * 0.18],
      [r + depth * 0.4, a + step * 0.48],
      [r - depth, a + step * 0.66],
    ];
    for (const [rad, ang] of pts) d += `${d ? 'L' : 'M'}${r1(Math.cos(ang) * rad)} ${r1(Math.sin(ang) * rad)}`;
  }
  return `${d}Z`;
}

const GEARS = (() => {
  const m = 5;
  const a = { id: 'a', teeth: 24, x: 150, y: 170 };
  const b = { id: 'b', teeth: 12 };
  const c = { id: 'c', teeth: 18 };
  const d = { id: 'd', teeth: 30 };
  const pr = (g) => (g.teeth * m) / 2;
  const place = (from, to, deg) => {
    const dist = pr(from) + pr(to);
    to.x = from.x + Math.cos((deg * Math.PI) / 180) * dist;
    to.y = from.y + Math.sin((deg * Math.PI) / 180) * dist;
  };
  place(a, b, 20);
  place(b, c, -62);
  place(a, d, 118);
  a.ratio = 1;
  b.ratio = -a.teeth / b.teeth;
  c.ratio = -b.ratio * (b.teeth / c.teeth);
  d.ratio = -a.teeth / d.teeth;
  a.phase = 0;
  b.phase = 180 / b.teeth;
  c.phase = 0;
  d.phase = 180 / d.teeth;
  return [a, b, c, d].map((g) => ({ ...g, r: pr(g), m }));
})();

function gearMarkup(g) {
  const spokes = [0, 1, 2, 3, 4]
    .map((k) => {
      const a = (k / 5) * TAU;
      return `<path d="M0 0L${r1(Math.cos(a) * g.r * 0.72)} ${r1(Math.sin(a) * g.r * 0.72)}" class="w-vic__spoke"/>`;
    })
    .join('');
  return `<g class="w-vic__gear" data-gear="${g.id}" transform="translate(${r1(g.x)} ${r1(g.y)})">
    <path d="${gearPath(g.teeth, g.r, g.m * 0.9)}" class="w-vic__gear-body"/>
    <circle r="${r1(g.r * 0.74)}" class="w-vic__gear-rim"/>
    ${spokes}
    <circle r="${r1(Math.max(6, g.r * 0.16))}" class="w-vic__hub"/>
    <circle r="3" class="w-vic__pin"/>
  </g>`;
}

export function render({ world }) {
  const plate = PLATES[0];
  const art = ENGRAVINGS[plate.id]();
  const corners = [
    'translate(34 34)',
    'translate(486 34) scale(-1 1)',
    'translate(34 646) scale(1 -1)',
    'translate(486 646) scale(-1 -1)',
  ]
    .map((t) => `<path transform="${t}" d="${flourish()}" class="w-vic__flourish"/>`)
    .join('');
  const beads = Array.from({ length: 40 }, (_, i) => {
    const t = i / 40;
    const per = 2 * (440 + 600);
    let d = t * per;
    let x;
    let y;
    if (d < 440) [x, y] = [40 + d, 40];
    else if ((d -= 440) < 600) [x, y] = [480, 40 + d];
    else if ((d -= 600) < 440) [x, y] = [480 - d, 640];
    else [x, y] = [40, 640 - (d - 440)];
    return `<circle cx="${r1(x)}" cy="${r1(y)}" r="2.6"/>`;
  }).join('');

  return `
  <div class="w-vic__layout">
    <figure class="w-vic__plate-wrap">
      <svg class="w-vic__plate" viewBox="0 0 520 680" role="img" aria-label="An engraved botanical plate of a fern in an ornate gilt frame." data-plate-svg>
        <defs>
          <linearGradient id="w-vic-gilt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc9a"/><stop offset=".35" stop-color="#b8892f"/><stop offset=".6" stop-color="#f6e2a8"/><stop offset="1" stop-color="#8a6420"/></linearGradient>
          <radialGradient id="w-vic-paper" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#f4ead2"/><stop offset=".8" stop-color="#e8d9b4"/><stop offset="1" stop-color="#d9c18e"/></radialGradient>
        </defs>
        <rect x="6" y="6" width="508" height="668" rx="6" class="w-vic__frame-outer"/>
        <rect x="22" y="22" width="476" height="636" class="w-vic__frame-inner"/>
        <g class="w-vic__beads">${beads}</g>
        <rect x="56" y="56" width="408" height="568" fill="url(#w-vic-paper)" class="w-vic__paper"/>
        <rect x="70" y="70" width="380" height="540" class="w-vic__plate-rule"/>
        ${corners}
        <g class="w-vic__engraving" data-engraving>
          <path class="w-vic__ink" d="${art.outline}" pathLength="1"/>
          <path class="w-vic__hatch" d="${art.lines}" pathLength="1"/>
        </g>
        <text x="260" y="96" text-anchor="middle" class="w-vic__plate-no" data-plate-no>Plate ${plate.numeral}.</text>
        <text x="260" y="596" text-anchor="middle" class="w-vic__plate-latin" data-plate-latin>${plate.latin}</text>
      </svg>
    </figure>
    <section class="w-vic__cabinet">
      <div class="w-vic__card">
        <p class="w-vic__kicker">Cabinet of Curiosities · Drawer 20</p>
        <h1 class="w-vic__title">${esc(world.label)}</h1>
        <p class="w-vic__ornament" aria-hidden="true">— ❦ —</p>
        <p class="ww-caption w-vic__caption">${esc(world.description)}</p>
        <div class="w-vic__controls" role="group" aria-label="Cabinet controls">
          <button type="button" data-world-action="wind">Wind the mainspring</button>
          <button type="button" data-world-action="plate">Next plate · <span data-value>II</span></button>
          <button type="button" data-world-action="lamp" aria-pressed="false">Raise the gaslight</button>
        </div>
        <p class="w-vic__status" data-world-status role="status">Plate I, Fern · mainspring 50% · gaslight low</p>
      </div>
      <svg class="w-vic__works" viewBox="0 0 380 380" role="img" aria-label="Brass clockwork: four meshing gears, a balance wheel and a mainspring gauge.">
        <circle cx="190" cy="190" r="184" class="w-vic__works-plate"/>
        ${GEARS.map(gearMarkup).join('')}
        <g class="w-vic__balance" data-balance transform="translate(296 286)">
          <circle r="40" class="w-vic__balance-rim"/>
          <path d="M-40 0H40M0 -40V40" class="w-vic__spoke"/>
          <path d="M0 0m-6 0a6 6 0 1 1 12 0a10 10 0 1 1 -20 0a14 14 0 1 1 28 0a18 18 0 1 1 -36 0" class="w-vic__hairspring"/>
        </g>
        <g class="w-vic__gauge">
          <path d="M276 92a52 52 0 0 1 98 0" class="w-vic__gauge-track"/>
          <path d="M276 92a52 52 0 0 1 98 0" class="w-vic__gauge-fill" data-gauge pathLength="100"/>
          <text x="325" y="104" text-anchor="middle" class="w-vic__gauge-text" data-gauge-text>50%</text>
        </g>
      </svg>
    </section>
  </div>`;
}

export function mount(root, ctx) {
  const gears = GEARS.map((g) => ({ ...g, el: root.querySelector(`[data-gear="${g.id}"]`) }));
  const balance = root.querySelector('[data-balance]');
  const gauge = root.querySelector('[data-gauge]');
  const gaugeText = root.querySelector('[data-gauge-text]');
  const engraving = root.querySelector('[data-engraving]');
  const plateSvg = root.querySelector('[data-plate-svg]');
  const state = { plate: 0, wound: 0.5, lamp: false };
  let angle = 0;
  let speed = 0.3;
  let swing = 0;
  let lastShown = -1;

  function drawPlate() {
    const plate = PLATES[state.plate];
    const art = ENGRAVINGS[plate.id]();
    engraving.innerHTML = `<path class="w-vic__ink" d="${art.outline}" pathLength="1"/><path class="w-vic__hatch" d="${art.lines}" pathLength="1"/>`;
    engraving.classList.remove('is-engraving');
    void engraving.getBoundingClientRect();
    engraving.classList.add('is-engraving');
    root.querySelector('[data-plate-no]').textContent = `Plate ${plate.numeral}.`;
    root.querySelector('[data-plate-latin]').textContent = plate.latin;
    plateSvg.setAttribute('aria-label', `An engraved botanical plate of a ${plate.name.toLowerCase()} (${plate.latin}, ${plate.note}) in an ornate gilt frame.`);
  }

  function sync() {
    const plate = PLATES[state.plate];
    root.dataset.lamp = state.lamp ? 'bright' : 'low';
    root.querySelector('[data-world-action="plate"] [data-value]').textContent = PLATES[(state.plate + 1) % PLATES.length].numeral;
    const lamp = root.querySelector('[data-world-action="lamp"]');
    lamp.setAttribute('aria-pressed', String(state.lamp));
    lamp.textContent = state.lamp ? 'Lower the gaslight' : 'Raise the gaslight';
    ctx.status(`Plate ${plate.numeral}, ${plate.name} · mainspring ${Math.round(state.wound * 100)}% · gaslight ${state.lamp ? 'bright' : 'low'}`);
  }

  ctx.actions({
    wind() {
      state.wound = clamp(state.wound + 0.25, 0, 1);
      sync();
    },
    plate() {
      state.plate = (state.plate + 1) % PLATES.length;
      drawPlate();
      sync();
    },
    lamp() {
      state.lamp = !state.lamp;
      sync();
    },
  });

  ctx.loop(({ dt, time }) => {
    if (dt) state.wound = Math.max(0, state.wound - dt * 0.012);
    const target = 0.08 + state.wound * 1.1;
    speed = dt ? approach(speed, target, 2, dt) : target;
    angle += speed * dt;
    for (const g of gears) {
      const deg = ((angle * g.ratio * 180) / Math.PI + g.phase) % 360;
      g.el.setAttribute('transform', `translate(${r1(g.x)} ${r1(g.y)}) rotate(${deg.toFixed(2)})`);
    }
    swing = Math.sin(time * (2 + state.wound * 4)) * (10 + state.wound * 40);
    balance.setAttribute('transform', `translate(296 286) rotate(${swing.toFixed(2)})`);
    const shown = Math.round(state.wound * 100);
    if (shown !== lastShown) {
      lastShown = shown;
      gauge.style.strokeDasharray = `${shown} 100`;
      gaugeText.textContent = `${shown}%`;
    }
  });

  engraving.classList.add('is-engraving');
  sync();
}
