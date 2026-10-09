import './surrealism.css';
import { esc } from '../lib/dom.js';
import { approach } from '../lib/math.js';

const HORIZON = 690;
const DOOR = { x: 1180, y: 180, w: 140, h: 250 };
const ISLANDS = [
  { x: 380, y: 260, s: 1 },
  { x: 1450, y: 210, s: 0.8 },
  { x: 700, y: 150, s: 0.65 },
];

function island({ x, y, s }, i) {
  return `<g class="w-sur__island" data-float="island" data-i="${i}">
    <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-70 0c20-8 120-8 140 0l-30 34-24 50-30-46z" fill="#6f5a4a"/>
      <path d="M-70 0c20-8 120-8 140 0c-20 8-120 8-140 0z" fill="#8fae7a"/>
      <path d="M10 -2v-34" stroke="#4b3a2e" stroke-width="5"/>
      <circle cx="10" cy="-46" r="18" fill="#5f8f5a"/>
      <circle cx="-22" cy="-10" r="9" fill="#7da86c"/>
    </g>
  </g>`;
}

function stairs() {
  let out = '';
  for (let i = 0; i < 7; i++) {
    const x = 1040 - i * 22;
    const y = HORIZON - i * 38;
    out += `<path d="M${x} ${y}h-24v-38h24z" fill="#efe1c8"/><path d="M${x} ${y}l14 -8v-38l-14 8z" fill="#c9b08b"/><path d="M${x - 24} ${y - 38}l14 -8h24l-14 8z" fill="#fff6e4"/>`;
  }
  return out;
}

export function render({ world }) {
  return `
  <svg class="w-sur__scene" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img"
    aria-label="Dream plain at dusk: an enormous moon rises behind a staircase, a door floats in the sky, rocky islands hover and a lamp post glows beside a tiny chair.">
    <defs>
      <linearGradient id="w-sur-sky" gradientUnits="userSpaceOnUse" x1="0" y1="-200" x2="0" y2="${HORIZON}">
        <stop offset="0" stop-color="#0d2233"/><stop offset=".55" stop-color="#3c6e7a"/><stop offset=".85" stop-color="#d9b08a"/><stop offset="1" stop-color="#f2c79b"/>
      </linearGradient>
      <linearGradient id="w-sur-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98f62"/><stop offset=".4" stop-color="#8c5a3c"/><stop offset="1" stop-color="#3b2418"/></linearGradient>
      <radialGradient id="w-sur-moon" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#fffaf0"/><stop offset=".7" stop-color="#f4e2be"/><stop offset="1" stop-color="#e3c99a"/></radialGradient>
      <linearGradient id="w-sur-day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa9ff"/><stop offset="1" stop-color="#d9efff"/></linearGradient>
      <radialGradient id="w-sur-lamp"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
      <clipPath id="w-sur-door-clip"><rect x="${DOOR.x}" y="${DOOR.y}" width="${DOOR.w}" height="${DOOR.h}"/></clipPath>
    </defs>

    <rect x="-1600" y="-1600" width="4800" height="${1600 + HORIZON}" fill="#0d2233"/>
    <rect x="-1600" y="-200" width="4800" height="${200 + HORIZON}" fill="url(#w-sur-sky)"/>
    <g fill="#fff" opacity=".7">
      <circle cx="160" cy="90" r="2"/><circle cx="520" cy="40" r="1.5"/><circle cx="980" cy="70" r="2"/><circle cx="1320" cy="40" r="1.4"/><circle cx="1500" cy="120" r="1.8"/><circle cx="880" cy="-120" r="1.6"/><circle cx="640" cy="-60" r="1.4"/>
    </g>

    <g class="w-sur__moon" data-moon>
      <circle cx="800" cy="800" r="420" fill="url(#w-sur-moon)"/>
      <g fill="#d9c196" opacity=".55"><circle cx="690" cy="520" r="38"/><circle cx="900" cy="470" r="22"/><circle cx="980" cy="600" r="52"/><circle cx="600" cy="640" r="26"/></g>
    </g>

    <rect x="-1600" y="${HORIZON}" width="4800" height="2400" fill="url(#w-sur-ground)"/>
    <path d="M-1600 ${HORIZON}H3200" stroke="#f6d9b4" stroke-width="2" opacity=".6"/>

    <ellipse cx="${DOOR.x + 70}" cy="${HORIZON + 70}" rx="90" ry="12" fill="#2a160c" opacity=".35"/>
    <ellipse cx="1060" cy="${HORIZON + 6}" rx="80" ry="8" fill="#2a160c" opacity=".3"/>

    <g class="w-sur__stairs">${stairs()}</g>

    <g class="w-sur__chair" data-float="chair">
      <g class="w-sur__chair-shape">
        <path d="M1104 ${HORIZON}v-22M1126 ${HORIZON}v-22M1104 ${HORIZON - 22}h26M1126 ${HORIZON - 22}v-30" stroke="#5b3a26" stroke-width="4" fill="none"/>
        <rect x="1100" y="${HORIZON - 26}" width="30" height="5" fill="#7a4e33"/>
      </g>
    </g>

    <g class="w-sur__lamp" data-float="lamp">
      <circle cx="640" cy="${HORIZON - 170}" r="90" fill="url(#w-sur-lamp)" class="w-sur__lamp-glow"/>
      <path d="M640 ${HORIZON}v-160" stroke="#2c2622" stroke-width="7"/>
      <path d="M622 ${HORIZON - 160}h36l-6 -24h-24z" fill="#2c2622"/>
      <rect x="628" y="${HORIZON - 182}" width="24" height="18" fill="#ffe9a8"/>
    </g>

    ${ISLANDS.map(island).join('')}

    <g class="w-sur__door" data-float="door">
      <g clip-path="url(#w-sur-door-clip)">
        <rect x="${DOOR.x}" y="${DOOR.y}" width="${DOOR.w}" height="${DOOR.h}" fill="url(#w-sur-day)"/>
        <circle cx="${DOOR.x + 104}" cy="${DOOR.y + 54}" r="16" fill="#fff6c9"/>
        <g data-door-clouds fill="#fff">
          <path d="M0 0c6-14 26-14 32-2c10-6 22 0 22 10H-10c0-6 4-10 10-8z" transform="translate(${DOOR.x + 10} ${DOOR.y + 120})"/>
          <path d="M0 0c6-14 26-14 32-2c10-6 22 0 22 10H-10c0-6 4-10 10-8z" transform="translate(${DOOR.x + 70} ${DOOR.y + 190})"/>
        </g>
        <rect x="${DOOR.x}" y="${DOOR.y + DOOR.h - 26}" width="${DOOR.w}" height="26" fill="#7fbf6a"/>
        <rect class="w-sur__panel" x="${DOOR.x}" y="${DOOR.y}" width="${DOOR.w}" height="${DOOR.h}" fill="#6b4630"/>
      </g>
      <g class="w-sur__panel-details">
        <rect x="${DOOR.x + 16}" y="${DOOR.y + 18}" width="${DOOR.w - 32}" height="90" fill="none" stroke="#4b2f1f" stroke-width="3"/>
        <rect x="${DOOR.x + 16}" y="${DOOR.y + 126}" width="${DOOR.w - 32}" height="100" fill="none" stroke="#4b2f1f" stroke-width="3"/>
        <circle cx="${DOOR.x + DOOR.w - 18}" cy="${DOOR.y + 130}" r="6" fill="#e8c46a"/>
      </g>
      <rect x="${DOOR.x - 6}" y="${DOOR.y - 6}" width="${DOOR.w + 12}" height="${DOOR.h + 6}" fill="none" stroke="#2d1d14" stroke-width="10"/>
    </g>

    <g class="w-sur__fish-school" data-fish-school>
      ${[0, 1, 2, 3]
        .map(
          (i) => `<g class="w-sur__fish" data-fish="${i}"><path d="M0 0c14-14 40-14 52 0c-12 14-38 14-52 0z" fill="${['#ff9d5c', '#ffd27a', '#ff7a7a', '#ffe6c2'][i]}"/><path d="M50 0l18-12v24z" fill="${['#ff9d5c', '#ffd27a', '#ff7a7a', '#ffe6c2'][i]}"/><circle cx="12" cy="-3" r="2.6" fill="#1d1d1d"/></g>`,
        )
        .join('')}
    </g>
  </svg>

  <div class="w-sur__label">
    <p class="w-sur__room">Room 05 · The dream wing</p>
    <h1 class="w-sur__title">${esc(world.label)}</h1>
    <p class="w-sur__meta"><em>The Patient Moon</em>, 2026 — oil on sleep</p>
    <p class="ww-caption w-sur__caption">${esc(world.description)}</p>
    <div class="w-sur__controls" role="group" aria-label="Dream controls">
      <button type="button" data-world-action="door" aria-pressed="false">Open the door</button>
      <button type="button" data-world-action="scale" aria-pressed="false">Swap scale</button>
      <button type="button" data-world-action="gravity" aria-pressed="false">Gravity off</button>
    </div>
    <p class="w-sur__status" data-world-status role="status">Door closed · moon enormous · gravity on</p>
  </div>`;
}

export function mount(root, ctx) {
  const svg = root.querySelector('.w-sur__scene');
  const islands = Array.from(root.querySelectorAll('[data-float="island"]'));
  const chair = root.querySelector('[data-float="chair"]');
  const lamp = root.querySelector('[data-float="lamp"]');
  const door = root.querySelector('[data-float="door"]');
  const clouds = root.querySelector('[data-door-clouds]');
  const fish = Array.from(root.querySelectorAll('[data-fish]'));
  const state = { door: false, swapped: false, floating: false };
  let lift = 0;

  function fitViewBox() {
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const aspect = rect.width / rect.height;
    const box = aspect < 1 ? { cx: 960, w: 820, h: 640 } : { cx: 850, w: 1300, h: 760 };
    let vbW;
    let vbH;
    if (aspect > box.w / box.h) {
      vbH = box.h;
      vbW = vbH * aspect;
    } else {
      vbW = box.w;
      vbH = vbW / aspect;
    }
    const vbX = box.cx - vbW / 2;
    const vbY = HORIZON - (aspect < 1 ? 0.52 : 0.66) * vbH;
    svg.setAttribute('viewBox', `${vbX.toFixed(0)} ${vbY.toFixed(0)} ${vbW.toFixed(0)} ${vbH.toFixed(0)}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  function sync() {
    root.classList.toggle('is-open', state.door);
    root.classList.toggle('is-swapped', state.swapped);
    root.classList.toggle('is-floating', state.floating);
    ctx.status(
      `Door ${state.door ? 'open — fish are swimming out' : 'closed'} · moon ${state.swapped ? 'tiny, chair monumental' : 'enormous'} · gravity ${state.floating ? 'off' : 'on'}`,
    );
  }

  ctx.actions({
    door(button) {
      state.door = !state.door;
      button.setAttribute('aria-pressed', String(state.door));
      button.textContent = state.door ? 'Close the door' : 'Open the door';
      sync();
    },
    scale(button) {
      state.swapped = !state.swapped;
      button.setAttribute('aria-pressed', String(state.swapped));
      sync();
    },
    gravity(button) {
      state.floating = !state.floating;
      button.setAttribute('aria-pressed', String(state.floating));
      button.textContent = state.floating ? 'Gravity on' : 'Gravity off';
      sync();
    },
  });

  ctx.onResize(svg, fitViewBox);
  fitViewBox();

  const doorCx = DOOR.x + DOOR.w / 2;
  const doorCy = DOOR.y + DOOR.h / 2;

  ctx.loop(({ dt, time, running }) => {
    const target = state.floating ? 1 : 0;
    lift = running ? approach(lift, target, 1.2, dt) : target;

    islands.forEach((g, i) => {
      const bob = Math.sin(time * 0.6 + i * 1.7) * 10;
      const y = bob - lift * (160 + i * 70);
      const r = lift * (i % 2 ? -12 : 10) + Math.sin(time * 0.4 + i) * 2;
      const { x, y: iy } = ISLANDS[i];
      g.setAttribute('transform', `translate(0 ${y.toFixed(1)}) rotate(${r.toFixed(2)} ${x} ${iy})`);
    });
    chair.setAttribute('transform', `translate(0 ${(-lift * 220 + Math.sin(time * 0.8) * lift * 8).toFixed(1)}) rotate(${(lift * 26).toFixed(1)} 1116 ${HORIZON - 20})`);
    lamp.setAttribute('transform', `translate(${(lift * -40).toFixed(1)} ${(-lift * 140).toFixed(1)}) rotate(${(-lift * 18).toFixed(1)} 640 ${HORIZON - 80})`);
    door.setAttribute('transform', `translate(0 ${(Math.sin(time * 0.5) * 12 - lift * 60).toFixed(1)}) rotate(${(Math.sin(time * 0.3) * 1.5 + lift * 8).toFixed(2)} ${doorCx} ${doorCy})`);

    const drift = (time * 18) % 220;
    clouds.setAttribute('transform', `translate(${(drift - 60).toFixed(1)} 0)`);

    fish.forEach((g, i) => {
      if (!state.door) return;
      const s = (time * 0.045 + i * 0.25) % 1;
      const x = doorCx - 20 - s * 1500;
      const y = doorCy + Math.sin(s * 9 + i * 1.3) * 46 + (i - 1.5) * 34 - lift * 80;
      const fade = Math.min(1, s / 0.05);
      g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.cos(s * 9 + i * 1.3) * 10).toFixed(1)})`);
      g.setAttribute('opacity', fade.toFixed(2));
    });
  });

  sync();
}
