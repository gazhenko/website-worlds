import './isometric.css';
import { esc } from '../lib/dom.js';
import { createRng } from '../lib/random.js';
import { approach } from '../lib/math.js';
import { SVG_NS } from '../lib/svg.js';

const N = 8;
const TW = 64;
const TH = 32;
const VIEWS = ['North', 'East', 'South', 'West'];
const PALETTES = [
  { top: '#f6f1e4', right: '#d9cfb8', left: '#b8ad94' },
  { top: '#ffd7a1', right: '#e6a96a', left: '#c98a4d' },
  { top: '#c9e3ff', right: '#94b9e0', left: '#7598c0' },
  { top: '#f7c6d0', right: '#e09aa8', left: '#c27886' },
  { top: '#d9f2c4', right: '#a9d18e', left: '#86b06c' },
];

const isRoad = (x, y) => x >= 1 && x <= 6 && y >= 1 && y <= 6 && (x === 1 || x === 6 || y === 1 || y === 6);
const isWater = (x, y) => y === 7 && x >= 2 && x <= 5;
const PARK = new Set(['3,3', '4,4', '2,5']);
const LOTS = (() => {
  const rng = createRng(29);
  const lots = [];
  for (let x = 2; x <= 5; x++) for (let y = 2; y <= 5; y++) if (!PARK.has(`${x},${y}`)) lots.push({ x, y, h: Math.round(rng.range(34, 116)), pal: rng.int(0, PALETTES.length - 1) });
  return lots.sort(() => rng.next() - 0.5);
})();
const INITIAL_BUILT = 6;
const TREES = [
  [0, 0], [0, 2], [0, 5], [1, 7], [7, 0], [7, 3], [7, 6], [3, 0], [5, 0], [6, 7], [3, 3], [4, 4], [2, 5],
];
const RING = (() => {
  const pts = [];
  for (let x = 1; x <= 6; x++) pts.push([x + 0.5, 1.5]);
  for (let y = 2; y <= 6; y++) pts.push([6.5, y + 0.5]);
  for (let x = 5; x >= 1; x--) pts.push([x + 0.5, 6.5]);
  for (let y = 5; y >= 2; y--) pts.push([1.5, y + 0.5]);
  return pts;
})();

function rotate(x, y, view) {
  const m = N;
  switch (view) {
    case 1:
      return [m - y, x];
    case 2:
      return [m - x, m - y];
    case 3:
      return [y, m - x];
    default:
      return [x, y];
  }
}

const P = (gx, gy, z = 0) => [(gx - gy) * (TW / 2), (gx + gy) * (TH / 2) - z];
const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function cellCorners(x, y, view, inset = 0) {
  const corners = [
    [x + inset, y + inset],
    [x + 1 - inset, y + inset],
    [x + 1 - inset, y + 1 - inset],
    [x + inset, y + 1 - inset],
  ].map(([cx, cy]) => rotate(cx, cy, view));
  return corners;
}

// A prism on a cell: returns SVG for its two visible side faces and top.
function prism(x, y, view, h, pal, inset, windows) {
  const c = cellCorners(x, y, view, inset);
  // after rotation, find the corner with the largest gx+gy (front) and its neighbours
  let front = 0;
  c.forEach((p, i) => {
    if (p[0] + p[1] > c[front][0] + c[front][1]) front = i;
  });
  const prev = c[(front + 3) % 4];
  const next = c[(front + 1) % 4];
  const f = c[front];
  const left = prev[0] < next[0] ? prev : next;
  const right = prev[0] < next[0] ? next : prev;
  const face = (a, b) => pts([P(a[0], a[1]), P(b[0], b[1]), P(b[0], b[1], h), P(a[0], a[1], h)]);
  let out = `<g style="--ft:${pal.top};--fr:${pal.right};--fl:${pal.left}">`;
  out += `<polygon points="${face(left, f)}" class="w-iso__face-l"/>`;
  out += `<polygon points="${face(f, right)}" class="w-iso__face-r"/>`;
  out += `<polygon points="${pts(c.map(([gx, gy]) => P(gx, gy, h)))}" class="w-iso__face-t"/></g>`;
  if (windows) {
    let d = '';
    for (let z = 14; z < h - 6; z += 12) {
      const a1 = P(left[0], left[1], z);
      const b1 = P(f[0], f[1], z);
      const c1 = P(right[0], right[1], z);
      d += `M${a1[0].toFixed(1)} ${a1[1].toFixed(1)}L${b1[0].toFixed(1)} ${b1[1].toFixed(1)}L${c1[0].toFixed(1)} ${c1[1].toFixed(1)}`;
    }
    if (d) out += `<path d="${d}" class="w-iso__win"/>`;
  }
  return out;
}

function tree(x, y, view) {
  const [gx, gy] = rotate(x + 0.5, y + 0.5, view);
  const [sx, sy] = P(gx, gy);
  return `<g class="w-iso__tree"><path d="M${sx.toFixed(1)} ${sy.toFixed(1)}v-14" class="w-iso__trunk"/><circle cx="${sx.toFixed(1)}" cy="${(sy - 24).toFixed(1)}" r="12" class="w-iso__crown"/><circle cx="${(sx - 4).toFixed(1)}" cy="${(sy - 28).toFixed(1)}" r="5" class="w-iso__crown-hi"/></g>`;
}

function lamp(x, y, view) {
  const [gx, gy] = rotate(x, y, view);
  const [sx, sy] = P(gx, gy);
  return `<g class="w-iso__lamp"><path d="M${sx.toFixed(1)} ${sy.toFixed(1)}v-26"/><circle cx="${sx.toFixed(1)}" cy="${(sy - 27).toFixed(1)}" r="3"/><circle cx="${sx.toFixed(1)}" cy="${(sy - 27).toFixed(1)}" r="12" class="w-iso__lamp-glow"/></g>`;
}

function tilesMarkup(view) {
  const cells = [];
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) cells.push([x, y]);
  cells.sort((a, b) => {
    const ra = rotate(a[0] + 0.5, a[1] + 0.5, view);
    const rb = rotate(b[0] + 0.5, b[1] + 0.5, view);
    return ra[0] + ra[1] - (rb[0] + rb[1]);
  });
  return cells
    .map(([x, y]) => {
      const type = isWater(x, y) ? 'water' : isRoad(x, y) ? 'road' : PARK.has(`${x},${y}`) ? 'park' : 'grass';
      const c = cellCorners(x, y, view).map(([gx, gy]) => P(gx, gy));
      return `<polygon points="${pts(c)}" class="w-iso__tile w-iso__tile--${type}"/>`;
    })
    .join('');
}

export function render({ world }) {
  return `
  <div class="w-iso__layout">
    <section class="w-iso__panel">
      <p class="w-iso__kicker">Island No. 29 · scale 1:500</p>
      <h1 class="w-iso__title">${esc(world.label)}</h1>
      <p class="ww-caption w-iso__caption">${esc(world.description)}</p>
      <div class="w-iso__controls" role="group" aria-label="Diorama controls">
        <button type="button" data-world-action="build">Build a block</button>
        <button type="button" data-world-action="rotate">Rotate view ↻ <span data-value>North</span></button>
        <button type="button" data-world-action="night" aria-pressed="false">Night</button>
      </div>
      <p class="w-iso__status" data-world-status role="status">View north · ${INITIAL_BUILT} of ${LOTS.length} lots built · day</p>
    </section>
    <div class="w-iso__stage">
      <svg class="w-iso__svg" viewBox="-300 -210 600 560" role="img" aria-label="An isometric island town with buildings, trees, a ring road with moving cars and a small harbour with boats." data-iso>
        <path d="M-256 128L0 256L256 128L256 168L0 312L-256 168Z" class="w-iso__rock"/>
        <path d="M-256 168L0 312L0 350L-200 200Z" class="w-iso__rock-dark"/>
        <path d="M256 168L0 312L0 350L200 200Z" class="w-iso__rock-mid"/>
        <g data-tiles></g>
        <g data-boats></g>
        <g data-cars-back></g>
        <g data-objects></g>
        <g data-cars-front></g>
      </svg>
    </div>
  </div>`;
}

export function mount(root, ctx) {
  const tiles = root.querySelector('[data-tiles]');
  const objects = root.querySelector('[data-objects]');
  const back = root.querySelector('[data-cars-back]');
  const front = root.querySelector('[data-cars-front]');
  const boatsGroup = root.querySelector('[data-boats]');
  const state = { view: 0, built: INITIAL_BUILT, night: false };
  const heights = LOTS.map((lot, i) => (i < INITIAL_BUILT ? lot.h : 0));
  const cars = [0, 0.27, 0.52, 0.76].map((s, i) => ({ s, speed: 0.035 + i * 0.004, color: ['#e2231a', '#2f6fde', '#f2b705', '#ffffff'][i], el: null }));
  const boats = [
    { x: 2.6, y: 7.5, ph: 0, el: null },
    { x: 4.4, y: 7.45, ph: 1.7, el: null },
  ];
  let growing = -1;

  function objectsMarkup() {
    const items = [];
    LOTS.forEach((lot, i) => {
      const [gx, gy] = rotate(lot.x + 0.5, lot.y + 0.5, state.view);
      items.push({ depth: gx + gy, html: `<g data-lot="${i}">${heights[i] > 0 ? prism(lot.x, lot.y, state.view, heights[i], PALETTES[lot.pal], 0.12, true) : ''}</g>` });
    });
    for (const [x, y] of TREES) {
      const [gx, gy] = rotate(x + 0.5, y + 0.5, state.view);
      items.push({ depth: gx + gy, html: tree(x, y, state.view) });
    }
    for (const [x, y] of [[1, 1], [7, 1], [1, 7], [7, 7], [4, 1]]) {
      const [gx, gy] = rotate(x, y, state.view);
      items.push({ depth: gx + gy - 0.5, html: lamp(x, y, state.view) });
    }
    items.sort((a, b) => a.depth - b.depth);
    return items.map((it) => it.html).join('');
  }

  function rebuild() {
    tiles.innerHTML = tilesMarkup(state.view);
    objects.innerHTML = objectsMarkup();
    boatsGroup.innerHTML = boats.map(() => '<g class="w-iso__boat"><path d="M-12 0h24l-5 6h-14z" class="w-iso__hull"/><path d="M0 0v-16l9 12z" class="w-iso__sail"/></g>').join('');
    boats.forEach((b, i) => {
      b.el = boatsGroup.children[i];
    });
    for (const car of cars) {
      car.el = document.createElementNS(SVG_NS, 'g');
      car.el.setAttribute('class', 'w-iso__car');
      back.append(car.el);
    }
  }

  function clearCars() {
    back.replaceChildren();
    front.replaceChildren();
  }

  function sync() {
    root.dataset.night = String(state.night);
    root.querySelector('[data-world-action="rotate"] [data-value]').textContent = VIEWS[state.view];
    const night = root.querySelector('[data-world-action="night"]');
    night.setAttribute('aria-pressed', String(state.night));
    ctx.status(`View ${VIEWS[state.view].toLowerCase()} · ${state.built} of ${LOTS.length} lots built · ${state.night ? 'night, windows lit' : 'day'}`);
  }

  ctx.actions({
    build() {
      if (state.built >= LOTS.length) {
        for (let i = INITIAL_BUILT; i < LOTS.length; i++) heights[i] = 0;
        state.built = INITIAL_BUILT;
        growing = -1;
      } else {
        growing = state.built;
        heights[growing] = ctx.running ? 1 : LOTS[growing].h;
        state.built += 1;
      }
      objects.innerHTML = objectsMarkup();
      sync();
    },
    rotate() {
      state.view = (state.view + 1) % 4;
      clearCars();
      rebuild();
      sync();
    },
    night() {
      state.night = !state.night;
      sync();
    },
  });

  function carMarkup(car, gx, gy, dir) {
    const len = 0.32;
    const wid = 0.18;
    const [dx, dy] = dir;
    const px = -dy;
    const py = dx;
    const corners = [
      [gx + dx * len + px * wid, gy + dy * len + py * wid],
      [gx + dx * len - px * wid, gy + dy * len - py * wid],
      [gx - dx * len - px * wid, gy - dy * len - py * wid],
      [gx - dx * len + px * wid, gy - dy * len + py * wid],
    ];
    const top = pts(corners.map(([x, y]) => P(x, y, 9)));
    const base = pts(corners.map(([x, y]) => P(x, y, 2)));
    const head = P(gx + dx * len * 1.4, gy + dy * len * 1.4, 5);
    return `<polygon points="${base}" fill="#1d1d24"/><polygon points="${top}" fill="${car.color}" stroke="#1d1d24" stroke-width="1"/><circle cx="${head[0].toFixed(1)}" cy="${head[1].toFixed(1)}" r="5" class="w-iso__headlight"/>`;
  }

  rebuild();

  ctx.loop(({ dt, time, running }) => {
    if (growing >= 0) {
      const target = LOTS[growing].h;
      heights[growing] = running ? approach(heights[growing], target, 3.2, dt) : target;
      const lot = LOTS[growing];
      const g = objects.querySelector(`[data-lot="${growing}"]`);
      if (g) g.innerHTML = prism(lot.x, lot.y, state.view, Math.max(1, heights[growing]), PALETTES[lot.pal], 0.12, true);
      if (Math.abs(heights[growing] - target) < 0.5) growing = -1;
    }

    const loop = RING.length;
    for (const car of cars) {
      car.s = (car.s + car.speed * dt) % 1;
      const f = car.s * loop;
      const i = Math.floor(f);
      const a = RING[i % loop];
      const b = RING[(i + 1) % loop];
      const t = f - i;
      const ox = a[0] + (b[0] - a[0]) * t;
      const oy = a[1] + (b[1] - a[1]) * t;
      const [gx, gy] = rotate(ox, oy, state.view);
      const [ax, ay] = rotate(a[0], a[1], state.view);
      const [bx, by] = rotate(b[0], b[1], state.view);
      const len = Math.hypot(bx - ax, by - ay) || 1;
      car.el.innerHTML = carMarkup(car, gx, gy, [(bx - ax) / len, (by - ay) / len]);
      const layer = gx + gy < 7 ? back : front;
      if (car.el.parentNode !== layer) layer.append(car.el);
    }

    boats.forEach((b) => {
      const [gx, gy] = rotate(b.x, b.y, state.view);
      const [sx, sy] = P(gx, gy);
      const bob = Math.sin(time * 1.6 + b.ph) * 2;
      b.el.setAttribute('transform', `translate(${sx.toFixed(1)} ${(sy + bob).toFixed(1)}) rotate(${(Math.sin(time * 1.2 + b.ph) * 4).toFixed(1)})`);
    });
  });

  sync();
}
