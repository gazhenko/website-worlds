import './ascii-art.css';
import { esc } from '../lib/dom.js';
import { clamp, smoothstep } from '../lib/math.js';
import { fbm2, noise2 } from '../lib/noise.js';

const SCENES = [
  { id: 'planet', name: 'Planet' },
  { id: 'lighthouse', name: 'Lighthouse' },
  { id: 'bloom', name: 'Bloom' },
];
const RAMPS = [
  { id: 'classic', name: 'Classic', chars: ' .:-=+*#%@' },
  { id: 'dense', name: 'Dense', chars: " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$" },
  { id: 'blocks', name: 'Blocks', chars: ' ░▒▓█' },
];
const FPS = 15;

const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

function planet(x, y, t) {
  const R = 0.62;
  const d2 = x * x + y * y;
  if (d2 < R * R) {
    const nz = Math.sqrt(R * R - d2) / R;
    const nx = x / R;
    const ny = y / R;
    const light = clamp(nx * -0.55 + ny * -0.45 + nz * 0.7, 0, 1);
    const lon = Math.atan2(nx, nz) + t * 0.35;
    const lat = Math.asin(clamp(ny, -1, 1));
    const land = fbm2(lon * 1.6 + 10, lat * 2.2 + 3, 3, 7) > 0.5 ? 0.28 : 0;
    const clouds = smoothstep(0.62, 0.75, fbm2(lon * 3 - t * 0.2, lat * 4, 2, 9)) * 0.25;
    return clamp(0.08 + light * 0.72 + land * light + clouds, 0, 1);
  }
  // ring: an ellipse band tilted across the planet
  const ry = y - x * 0.18;
  const ring = Math.abs(Math.hypot(x * 0.62, ry * 3.2) - 0.82);
  if (ring < 0.05 && !(ry < 0 && d2 < R * R * 1.4)) return 0.55 - ring * 6;
  return hash(Math.floor(x * 40), Math.floor(y * 40)) > 0.985 ? 0.5 : 0.02;
}

function lighthouse(x, y, t) {
  const horizon = 0.28;
  const lampY = -0.42;
  if (y > horizon) {
    const depth = (y - horizon) / (1 - horizon);
    const wave = Math.sin(x * (14 - depth * 8) + t * 1.6 + y * 30) * 0.5 + 0.5;
    const glint = Math.abs(x - Math.sin(t * 0.8) * 0.9) < 0.06 + depth * 0.1 ? 0.35 : 0;
    return clamp(0.08 + wave * 0.22 * (0.4 + depth) + glint * (0.4 + wave), 0, 1);
  }
  const towerHalf = 0.06 + (y - lampY) * 0.05;
  if (y > lampY + 0.04 && Math.abs(x + 0.25) < towerHalf) {
    const stripe = Math.floor((y - lampY) * 18) % 2 === 0;
    return stripe ? 0.85 : 0.35;
  }
  if (Math.abs(x + 0.25) < 0.08 && y <= lampY + 0.04 && y > lampY - 0.07) return 1;
  const ang = Math.atan2(y - lampY, x + 0.25);
  const beam = t * 0.9;
  const diff = Math.atan2(Math.sin(ang - Math.cos(beam) * Math.PI * 0.5), Math.cos(ang - Math.cos(beam) * Math.PI * 0.5));
  const dist = Math.hypot(x + 0.25, y - lampY);
  const width = 0.07 + 0.12 * Math.abs(Math.sin(beam));
  const sky = 0.04 + (hash(Math.floor(x * 36), Math.floor(y * 36)) > 0.982 ? 0.4 : 0);
  if (Math.abs(diff) < width && y < horizon) return clamp(sky + (1 - Math.abs(diff) / width) * (0.85 - dist * 0.35), 0, 1);
  return sky;
}

function bloom(x, y, t) {
  const sway = Math.sin(t * 0.8) * 0.06;
  const cx = sway;
  const cy = -0.18;
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.hypot(dx, dy);
  const a = Math.atan2(dy, dx) + t * 0.15;
  const open = 0.78 + 0.22 * Math.sin(t * 0.6);
  const petal = 0.5 * open * (0.55 + 0.45 * Math.abs(Math.cos(a * 2.5)));
  if (r < 0.1) return 0.95 - noise2(x * 20, y * 20) * 0.2;
  if (r < petal) return clamp(0.35 + (1 - r / petal) * 0.55, 0, 1);
  const stemX = sway * (1 - (y - cy) / 1.2);
  if (y > cy + 0.1 && Math.abs(x - stemX) < 0.025) return 0.7;
  const leafY = 0.45;
  const lx = x - stemX;
  const ly = y - leafY;
  if (Math.abs(ly + Math.abs(lx) * 0.35) < 0.06 * (1 - Math.abs(lx) / 0.32) && Math.abs(lx) < 0.32) return 0.55;
  if (y > 0.82) return 0.25 + hash(Math.floor(x * 30), 3) * 0.2;
  return 0.03;
}

const SCENE_FNS = { planet, lighthouse, bloom };

export function render({ world }) {
  return `
  <div class="w-ascii__layout">
    <header class="w-ascii__head">
      <p class="w-ascii__kicker">teletype plate · 15 frames per second · no images</p>
      <h1 class="w-ascii__title">${esc(world.label)}</h1>
      <p class="ww-caption w-ascii__caption">${esc(world.description)}</p>
    </header>
    <figure class="w-ascii__frame" data-frame>
      <pre class="w-ascii__pre" aria-hidden="true" data-pre></pre>
      <figcaption class="ww-vh" data-figcaption>A character-based illustration of a planet with a ring.</figcaption>
    </figure>
    <div class="w-ascii__bar">
      <div class="w-ascii__controls" role="group" aria-label="Character controls">
        <button type="button" data-world-action="scene">[ scene: <span data-value>Planet</span> ]</button>
        <button type="button" data-world-action="ramp">[ ramp: <span data-ramp>Classic</span> ]</button>
        <button type="button" data-world-action="ink" aria-pressed="false">[ ink: <span data-ink>paper</span> ]</button>
      </div>
      <p class="w-ascii__status" data-world-status role="status">Planet · classic ramp · ink on paper</p>
    </div>
  </div>`;
}

export function mount(root, ctx) {
  const frame = root.querySelector('[data-frame]');
  const pre = root.querySelector('[data-pre]');
  const figcaption = root.querySelector('[data-figcaption]');
  const state = { scene: 0, ramp: 0, dark: false };
  let cols = 80;
  let rows = 36;
  let acc = 1;

  function measure() {
    const probe = document.createElement('span');
    probe.textContent = 'M'.repeat(20);
    probe.style.visibility = 'hidden';
    probe.style.position = 'absolute';
    pre.append(probe);
    const charW = probe.getBoundingClientRect().width / 20 || 8;
    const lineH = parseFloat(getComputedStyle(pre).lineHeight) || charW * 1.8;
    probe.remove();
    const rect = frame.getBoundingClientRect();
    cols = clamp(Math.floor((rect.width - 24) / charW), 24, 120);
    rows = clamp(Math.floor((rect.height - 24) / lineH), 12, 60);
    root.style.setProperty('--char-aspect', (lineH / charW).toFixed(3));
    acc = 1;
  }

  function draw(t) {
    const fn = SCENE_FNS[SCENES[state.scene].id];
    const ramp = RAMPS[state.ramp].chars;
    const last = ramp.length - 1;
    const aspect = parseFloat(root.style.getPropertyValue('--char-aspect')) || 2;
    const sx = (cols / rows) / aspect;
    const lines = [];
    for (let j = 0; j < rows; j++) {
      let line = '';
      const y = (j / (rows - 1)) * 2 - 1;
      for (let i = 0; i < cols; i++) {
        const x = ((i / (cols - 1)) * 2 - 1) * sx;
        let v = fn(x, y, t);
        if (!state.dark) v = 1 - v;
        line += ramp[Math.round(clamp(v, 0, 1) * last)];
      }
      lines.push(line);
    }
    pre.textContent = lines.join('\n');
  }

  function sync() {
    root.dataset.ink = state.dark ? 'dark' : 'paper';
    root.querySelector('[data-world-action="scene"] [data-value]').textContent = SCENES[state.scene].name;
    root.querySelector('[data-ramp]').textContent = RAMPS[state.ramp].name;
    const ink = root.querySelector('[data-world-action="ink"]');
    ink.setAttribute('aria-pressed', String(state.dark));
    root.querySelector('[data-ink]').textContent = state.dark ? 'light on dark' : 'paper';
    const desc = {
      planet: 'a ringed planet with drifting continents and clouds',
      lighthouse: 'a striped lighthouse sweeping its beam over the waves',
      bloom: 'a flower opening and closing on a swaying stem',
    }[SCENES[state.scene].id];
    figcaption.textContent = `A character-based illustration of ${desc}.`;
    ctx.status(`${SCENES[state.scene].name} · ${RAMPS[state.ramp].name.toLowerCase()} ramp · ${state.dark ? 'light on dark' : 'ink on paper'}`);
    acc = 1;
  }

  ctx.actions({
    scene() {
      state.scene = (state.scene + 1) % SCENES.length;
      sync();
    },
    ramp() {
      state.ramp = (state.ramp + 1) % RAMPS.length;
      sync();
    },
    ink() {
      state.dark = !state.dark;
      sync();
    },
  });

  ctx.onResize(frame, () => {
    measure();
    ctx.redraw();
  });
  measure();

  ctx.loop(({ dt, time, running }) => {
    acc += dt;
    if (running && acc < 1 / FPS) return;
    acc = 0;
    draw(time);
  });

  sync();
}
